"use strict";
/**
 * Ortak canavar dÃ¼nyasÄ± (server-authoritative hybrid).
 *
 * Sorumluluklar:
 *  - AynÄ± seferdeki bÃ¼tÃ¼n oyuncular iÃ§in TEK canavar listesi (kalÄ±cÄ± oda iÃ§i ID).
 *  - Sunucu otoritesinde spawn, konum, HP, Ã¶lÃ¼m ve Ã¶dÃ¼l.
 *  - Hasar yalnÄ±zca istemci "niyeti" doÄŸrulandÄ±ktan sonra uygulanÄ±r.
 *
 * Kapsam kapÄ±sÄ± (kritik): yalnÄ±zca bir seferde 2+ oyuncu bulunduÄŸu anda
 * `travel.sharedWorld` iÅŸaretlenir ve o seferin sonuna kadar otoriter mod
 * aÃ§Ä±k kalÄ±r. Tek oyunculu seferler hiÃ§bir zaman bu modÃ¼le girmez; bÃ¶ylece
 * mevcut solo oynanÄ±ÅŸ birebir korunur. KalÄ±cÄ± kÄ±ta (Setra) da kapsam iÃ§indedir.
 *
 * Ã–lÃ§ek: sunucu koordinatÄ± "dÃ¼nya birimi"dir; kaÃ§ piksel ettiÄŸi sefere gÃ¶re
 * deÄŸiÅŸir (normal seferde ~8 px, kalÄ±cÄ± kÄ±tada ~9 px). BÃ¼tÃ¼n hÄ±z/menzil
 * deÄŸerleri `pxPerUnit()` ile Ã¶lÃ§eklenir; aksi halde canavarlar yÃ¼rÃ¼mez ve
 * saldÄ±rÄ± menzili reddedilir.
 *
 * GÃ¶rsel katman (painter/color/accent/animasyon/ses) istemcide kalÄ±r: sunucu
 * yalnÄ±zca `kind` + durum gÃ¶nderir, istemci `resolveMonsterDef(kind)` ile
 * mevcut tanÄ±mÄ± Ã§Ã¶zer.
 */

const { CONTENT } = require("../content");
const { addXp } = require("./players");

const TICK_MS = 100;              // 10 Hz dÃ¼nya tick'i
const REWARD_MIN_SHARE = 0.10;    // Ã¶dÃ¼l almak iÃ§in min. hasar payÄ±
const LEASH_PX = 1400;           // doÄŸduÄŸu yerden bu kadar uzaklaÅŸÄ±rsa geri dÃ¶ner
const SPAWN_MIN_PX = 340;         // oyuncunun kucaÄŸÄ±na doÄŸmasÄ±n
const SPAWN_MAX_PX = 900;
const SAFE_POI_PX = 2600;         // POI cevresi (dunya px) temiz kalir
const SAFE_VILLAGE_PX = 3800;      // koy/han cevresi daha genis temiz kalir
const DEATH_HOLD_MS = 700;        // ceset/animasyon iÃ§in listede tutma sÃ¼resi
const RADIUS_BY_SIZE = { small: 20, normal: 28, large: 36, huge: 46, colossal: 58 };

const states = new Map();         // travelId -> state

function enabled() {
  return String(process.env.SETRA_SHARED_MOBS == null ? "1" : process.env.SETRA_SHARED_MOBS) !== "0";
}

// ---------------------------------------------------------------------------
// Seed / rastgele
// ---------------------------------------------------------------------------
function mulberry32(a) {
  let t = a >>> 0;
  return function rng() {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(travel) {
  const s = String(travel.id || "") + "|" + String(travel.seed || 0);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// TanÄ±mlar (content.js â€” istemci ile aynÄ± kaynak)
// ---------------------------------------------------------------------------
function biomeDef(travel) {
  const tb = (CONTENT && CONTENT.travelBiomes) || {};
  return tb[travel && travel.type] || tb.verdant || null;
}

function findMonsterDef(kind) {
  const tb = (CONTENT && CONTENT.travelBiomes) || {};
  for (const key of Object.keys(tb)) {
    const arr = (tb[key] && tb[key].monsters) || [];
    const hit = arr.find((m) => m && (m.kind === kind || m.id === kind));
    if (hit) return hit;
  }
  const plain = ((CONTENT && CONTENT.monsters) || []).find((m) => m && m.id === kind);
  if (!plain) return null;
  return {
    kind: plain.id,
    name: plain.name,
    painter: plain.painter || plain.id,
    color: plain.color,
    accent: plain.accent,
    element: plain.element,
    tags: plain.tags,
    hp: plain.hp,
    damage: plain.attack,
    speed: 120,
    radius: 16,
    exp: 30,
    gold: 6,
    aggroRange: 280,
  };
}

function tierScale(travel) {
  const s = String((travel && travel.size) || "normal");
  const map = { small: 0.7, normal: 1, large: 1.35, huge: 1.7, colossal: 2.2 };
  return map[s] || 1;
}

function avgLevel(room, travel) {
  const ids = (travel && travel.members) || [];
  let sum = 0, n = 0;
  for (const id of ids) {
    const p = room.players.find((x) => x.id === id);
    if (!p) continue;
    sum += Math.max(1, Number(p.level) || 1);
    n++;
  }
  return n ? sum / n : 1;
}

// ---------------------------------------------------------------------------
// Sefer kapÄ±sÄ±
// ---------------------------------------------------------------------------
function sharedEnabled(travel) {
  if (!travel || !travel.active) return false;
  if (!enabled()) return false;
  return !!travel.sharedWorld;
}

function markShared(travel) {
  if (!travel || !enabled()) return false;
  if (!travel.sharedWorld && Array.isArray(travel.members) && travel.members.length >= 2) {
    travel.sharedWorld = true;
    travel.creatureSeq = travel.creatureSeq || 0;
    return true;
  }
  return !!travel.sharedWorld;
}

// Bir "dÃ¼nya birimi"nin kaÃ§ piksele denk geldiÄŸi. Normal seferde istemci
// worldScale formÃ¼lÃ¼ (travelEngine.setWorldBounds) ile birebir aynÄ±dÄ±r;
// kalÄ±cÄ± kÄ±tada world_setra.json'daki worldScale kullanÄ±lÄ±r.
function pxPerUnit(travel) {
  if (!travel) return 64;
  if (travel.persistent) {
    try {
      const cfg = require("./persistentWorld").config || {};
      const s = Number(cfg.worldScale);
      if (Number.isFinite(s) && s > 0) return s;
    } catch (e) { /* yapÄ±landÄ±rma yoksa varsayÄ±lan */ }
    return 9;
  }
  const w = Number(travel.w) || 64;
  const h = Number(travel.h) || 64;
  const sp = (travel.spawn && typeof travel.spawn === "object") ? travel.spawn : { x: w / 2, y: h / 2 };
  const maxDist = Math.hypot(Math.max(sp.x, w - sp.x), Math.max(sp.y, h - sp.y)) || 1;
  const R = RADIUS_BY_SIZE[travel.size] || RADIUS_BY_SIZE.normal;
  const scale = ((R - 0.5) * 64) / maxDist;
  return (Number.isFinite(scale) && scale > 0) ? scale : 64;
}

// ---------------------------------------------------------------------------
// Spawn
// ---------------------------------------------------------------------------
function walkable(travel, x, y) {
  if (x < 1 || y < 1 || x > travel.w - 2 || y > travel.h - 2) return false;
  if (travel.persistent) {
    // KalÄ±cÄ± kÄ±ta: su (kÃ¶prÃ¼ deÄŸilse) yÃ¼rÃ¼nemez â€” istemci Ä±zgarasÄ±yla aynÄ± kural.
    try {
      const surface = require("./persistentWorld").geography.sample(x, y);
      if (surface && surface.water && !surface.bridge) return false;
    } catch (e) { /* coÄŸrafya yoksa sadece sÄ±nÄ±r kontrolÃ¼ */ }
    return true;
  }
  try {
    const isWalkable = require("./travel").isWalkable;
    if (typeof isWalkable === "function") return isWalkable(travel.tiles, travel.w, travel.h, Math.floor(x), Math.floor(y));
  } catch (e) { /* dÃ¶ngÃ¼sel yÃ¼kleme: kaba kontrol */ }
  return true;
}

// KalÄ±cÄ± kÄ±tada kÃ¶y/checkpoint/dungeon Ã§evresine canavar doÄŸmasÄ±n.
function nearSafePoi(travel, x, y) {
  if (!travel || !travel.persistent) return false;
  const px = pxPerUnit(travel);
  for (const poi of travel.pois || []) {
    if (!poi) continue;
    // Zindan kapÄ±larÄ± hariÃ§ TÃœM ilgi noktalarÄ± gÃ¼venli bÃ¶lgedir: kÃ¶y,
    // checkpoint, han, kamp, in (den), harabe, sandÄ±k... HiÃ§bir yerleÅŸimde
    // canavar doÄŸmaz. KÃ¶y/han Ã§evresi daha geniÅŸ tutulur.
    if (poi.kind === "dungeon") continue;
    const isVillage = poi.kind === "checkpoint" || poi.kind === "inn";
    const r = (isVillage ? SAFE_VILLAGE_PX : SAFE_POI_PX) / px;
    if (Math.hypot(poi.x - x, poi.y - y) < r) return true;
  }
  return false;
}

function aliveMembers(room, travel) {
  return ((travel && travel.members) || [])
    .map((id) => room.players.find((p) => p.id === id))
    .filter((p) => p && !p.downed && !travel.downed?.[p.id]);
}

function pickSpawnPoint(state) {
  const { travel, room, rng } = state;
  const px = state.px || pxPerUnit(travel);
  const members = aliveMembers(room, travel);
  const anchors = members.length
    ? members.map((p) => (travel.pos[p.id] ? travel.pos[p.id] : travel.spawn))
    : [travel.spawn];
  // Ä°ki geÃ§iÅŸ: Ã¶nce dar halka, sonra daha geniÅŸ (kÃ¶y Ã§evresinde boÅŸ yer kalmayabilir).
  const rings = [[SPAWN_MIN_PX, SPAWN_MAX_PX], [SPAWN_MAX_PX, SPAWN_MAX_PX * 2.2]];
  for (const [minPx, maxPx] of rings) {
    for (let attempt = 0; attempt < 24; attempt++) {
      const a = anchors[Math.floor(rng() * anchors.length)] || travel.spawn;
      const ang = rng() * Math.PI * 2;
      const dist = (minPx + rng() * (maxPx - minPx)) / px;
      const x = a.x + Math.cos(ang) * dist;
      const y = a.y + Math.sin(ang) * dist;
      if (!walkable(travel, x, y)) continue;
      if (nearSafePoi(travel, x, y)) continue;
      return { x, y };
    }
  }
  // Uygun yer yoksa canavar doÄŸurmuyoruz: oyuncu kÃ¶yÃ¼n iÃ§indeyken etraf boÅŸ kalÄ±r
  // (istemcinin mevcut gÃ¼venli bÃ¶lge davranÄ±ÅŸÄ±yla aynÄ±).
  return null;
}

function pickKind(state) {
  const def = biomeDef(state.travel) || {};
  const list = Array.isArray(def.monsters) ? def.monsters : [];
  if (!list.length) return null;
  const eliteChance = Number((def.spawn && def.spawn.eliteChance) || 0);
  const normals = list.filter((m) => m && !m.elite);
  const elites = list.filter((m) => m && m.elite);
  const pool = elites.length && state.rng() < eliteChance ? elites : (normals.length ? normals : list);
  const total = pool.reduce((acc, m) => acc + (Number(m.weight) || 1), 0);
  let r = state.rng() * total;
  for (const m of pool) {
    r -= Number(m.weight) || 1;
    if (r <= 0) return m;
  }
  return pool[0];
}

function spawnOne(state) {
  const base = pickKind(state);
  if (!base) return null;
  const point = pickSpawnPoint(state);
  if (!point) return null;
  const px = state.px || pxPerUnit(state.travel);
  const lvlMult = 1 + (avgLevel(state.room, state.travel) - 1) * 0.16;
  const hpMult = 4.0 * lvlMult * (base.elite ? 2.1 : 1);
  const dmgMult = 2.6 * lvlMult * (base.elite ? 1.45 : 1);
  const radiusPx = Math.max(10, Math.round((Number(base.radius) || 16) * (base.elite ? 1.5 : 1.4)));
  state.nextId = (state.nextId || 0) + 1;
  const mob = {
    id: "m" + state.nextId,
    kind: base.kind || base.id,
    elite: !!base.elite,
    x: point.x,
    y: point.y,
    hx: point.x,
    hy: point.y,
    maxHp: Math.max(1, Math.round((Number(base.hp) || 200) * hpMult)),
    hp: 0,
    damage: Math.max(1, Math.round((Number(base.damage) || 24) * dmgMult)),
    speed: (Number(base.speed) || 130) / px,        // px/s -> birim/s
    radius: radiusPx,                                // gÃ¶rsel/sunum deÄŸeri (px)
    radiusU: radiusPx / px,
    aggro: (Number(base.aggroRange) || 280) / px,
    exp: Math.round((Number(base.exp) || 45) * (base.elite ? 2.4 : 1) * tierScale(state.travel)),
    gold: Math.round((Number(base.gold) || 6) * (base.elite ? 2.5 : 1) * tierScale(state.travel)),
    state: "PATROL",
    targetId: null,
    wx: point.x,
    wy: point.y,
    wanderT: 0,
    contrib: {},
    dead: false,
    deathAt: 0,
  };
  mob.hp = mob.maxHp;
  return mob;
}

function targetCount(state) {
  const def = biomeDef(state.travel) || {};
  const base = Number((def.spawn && def.spawn.count) || 3);
  const members = (state.travel.members || []).length;
  return Math.max(3, Math.min(9, Math.round(base + (members - 1) * 1.2)));
}

function fill(state) {
  const want = targetCount(state);
  let guard = 0;
  while (state.mobs.filter((m) => !m.dead).length < want && guard++ < 20) {
    const mob = spawnOne(state);
    if (!mob) break;
    state.mobs.push(mob);
  }
}

// ---------------------------------------------------------------------------
// State yaÅŸam dÃ¶ngÃ¼sÃ¼
// ---------------------------------------------------------------------------
function ensure(io, room, travel) {
  if (!travel || !room) return null;
  const wasShared = !!travel.sharedWorld;
  const shared = markShared(travel);
  if (!shared) return null;
  let state = states.get(travel.id);
  if (!state) {
    state = {
      travel,
      room,
      rng: mulberry32(hashSeed(travel)),
      nextId: travel.creatureSeq || 0,
      px: pxPerUnit(travel),
      mobs: [],
      lastSnap: 0,
      nextSpawnAt: 0,
    };
    states.set(travel.id, state);
    fill(state);
    travel.creatureSeq = state.nextId;
  }
  state.travel = travel;
  state.room = room;
  // KalÄ±cÄ± kÄ±tada dÃ¼nya ayarÄ± deÄŸiÅŸebilir (GameCraft > Oyuna Uygula).
  if (!state.px) state.px = pxPerUnit(travel);
  // Otorite yeni devraldÄ±ysa seferdeki herkese haritayÄ± `shared` bayraÄŸÄ±yla
  // tekrar gÃ¶nder: istemciler yerel canavar simÃ¼lasyonunu kapatsÄ±n.
  if (!wasShared) {
    try {
      const trv = require("./travel");
      for (const id of travel.members || []) {
        const p = room.players.find((x) => x.id === id);
        if (!p) continue;
        try { io.to(id).emit("travel:map", trv.publicMap(room, p)); } catch (e) { /* soket yok */ }
      }
    } catch (e) { /* harita yeniden gÃ¶nderimi best-effort */ }
    sendSnapshot(io, state);
  }
  return state;
}

function detach(travelId) {
  states.delete(travelId);
}

function detachRoom(room) {
  if (!room) return;
  for (const [id, st] of states) {
    if (st.room === room) states.delete(id);
  }
}

// ---------------------------------------------------------------------------
// Snapshot / yayÄ±n
// ---------------------------------------------------------------------------
function snapshot(state) {
  const out = [];
  for (const m of state.mobs) {
    if (m.dead && Date.now() - m.deathAt > DEATH_HOLD_MS) continue;
    out.push({
      i: m.id,
      k: m.kind,
      x: Math.round(m.x * 100) / 100,
      y: Math.round(m.y * 100) / 100,
      h: Math.max(0, Math.round(m.hp)),
      m: m.maxHp,
      s: m.dead ? "DEAD" : (m.state === "CHASE" ? "CHASE" : "PATROL"),
      e: m.elite ? 1 : 0,
      a: m.dx != null ? Math.round(m.dx * 100) / 100 : null,
    });
  }
  return out;
}

function broadcast(io, state, event, payload) {
  const ids = (state.travel && state.travel.members) || [];
  for (const id of ids) {
    try { io.to(id).emit(event, payload); } catch (e) { /* kopmuÅŸ soket */ }
  }
}

function sendSnapshot(io, state) {
  if (!state.travel || !state.travel.active) return;
  const list = snapshot(state);
  broadcast(io, state, "travel:mobs", { list, shared: true });
}

// ---------------------------------------------------------------------------
// Tick (konum + aggro + Ã¶lÃ¼m temizliÄŸi)
// ---------------------------------------------------------------------------
function tick(io) {
  if (!states.size) return;
  const dt = TICK_MS / 1000;
  const now = Date.now();
  for (const [id, state] of states) {
    const travel = state.travel;
    if (!travel || !travel.active) { states.delete(id); continue; }
    // Hayalet Ã¼yeler: kopmuÅŸ soketler aggro hedefi olarak kalmasÄ±n.
    if (travel.members && travel.members.length) {
      const live = io && io.sockets && io.sockets.sockets;
      if (live && typeof live.get === "function") {
        for (const mid of [...travel.members]) {
          if (live.get(mid)) continue;
          travel.members = travel.members.filter((x) => x !== mid);
          if (travel.pos) delete travel.pos[mid];
          if (travel.downed) delete travel.downed[mid];
        }
      }
    }
    // Sefer boÅŸaldÄ±ysa (herkes kasabaya dÃ¶ndÃ¼) state bellekte kalmasÄ±n.
    if (!Array.isArray(travel.members) || travel.members.length === 0) { states.delete(id); continue; }
    const members = aliveMembers(state.room, travel);
    if (!members.length) { continue; } // oda boÅŸ: simÃ¼lasyon uyur

    if (state.nextSpawnAt && now >= state.nextSpawnAt) {
      state.nextSpawnAt = 0;
      fill(state);
    }
    // Oyuncu sayÄ±sÄ± arttÄ±kÃ§a canavar bÃ¼tÃ§esi de bÃ¼yÃ¼r (Ã¼st sÄ±nÄ±r 9).
    if (!state.nextSpawnAt && state.mobs.filter((m) => !m.dead).length < targetCount(state)) fill(state);

    for (const m of state.mobs) {
      if (m.dead) continue;
      // Koy/guvenli bolge icine giren canavar sessizce kaldirilir: hicbir
      // yerlesimde canavar dolasmaz (dogum engeli + bu kontrol).
      if (nearSafePoi(travel, m.x, m.y)) { m.dead = true; m.silent = true; m.deathAt = now; continue; }

      // Hedef seÃ§imi: menzildeki en yakÄ±n oyuncu.
      let best = null, bestD = Infinity;
      for (const p of members) {
        const pos = travel.pos && travel.pos[p.id];
        if (!pos) continue;
        const d = Math.hypot(pos.x - m.x, pos.y - m.y);
        if (d < bestD) { bestD = d; best = pos; }
      }
      const aggroRange = m.aggro;
      if (best && bestD <= aggroRange) {
        m.state = "CHASE";
        m.targetId = null;
        // YaklaÅŸma mesafesi: canavar yarÄ±Ã§apÄ± + oyuncu ~40 px (birim cinsinden).
        const reach = (m.radiusU || m.radius / (state.px || 64)) + 40 / (state.px || 64);
        if (bestD > reach) {
          const ang = Math.atan2(best.y - m.y, best.x - m.x);
          const step = Math.min(m.speed * dt, Math.max(0, bestD - reach));
          m.x += Math.cos(ang) * step;
          m.y += Math.sin(ang) * step;
          m.dx = Math.cos(ang);
        } else {
          m.dx = Math.cos(Math.atan2(best.y - m.y, best.x - m.x));
        }
      } else {
        // Leash: evinden Ã§ok uzaklaÅŸtÄ±ysa geri dÃ¶n.
        m.state = "PATROL";
        const px = state.px || 64;
        const homeD = Math.hypot(m.hx - m.x, m.hy - m.y);
        m.wanderT -= dt;
        if (m.wanderT <= 0) {
          m.wanderT = 2.2 + state.rng() * 2.6;
          const ang = state.rng() * Math.PI * 2;
          const r = (80 + state.rng() * 160) / px;   // 80-240 px devriye
          m.wx = m.hx + Math.cos(ang) * r;
          m.wy = m.hy + Math.sin(ang) * r;
        }
        const goal = homeD > LEASH_PX / px ? { x: m.hx, y: m.hy } : { x: m.wx, y: m.wy };
        const gd = Math.hypot(goal.x - m.x, goal.y - m.y);
        if (gd > 0.25 / px) {
          const ang = Math.atan2(goal.y - m.y, goal.x - m.x);
          const step = Math.min(m.speed * 0.45 * dt, gd);
          m.x += Math.cos(ang) * step;
          m.y += Math.sin(ang) * step;
          m.dx = Math.cos(ang);
        }
      }

      // Harita sÄ±nÄ±rlarÄ±
      const pad = 1;
      m.x = Math.max(pad, Math.min(travel.w - pad, m.x));
      m.y = Math.max(pad, Math.min(travel.h - pad, m.y));
    }

    // Ã–lÃ¼leri listeden dÃ¼ÅŸÃ¼r; yeniden doÄŸma zamanla.
    const before = state.mobs.length;
    state.mobs = state.mobs.filter((m) => !m.dead || now - m.deathAt <= DEATH_HOLD_MS);
    if (state.mobs.length !== before && !state.nextSpawnAt) {
      const def = biomeDef(travel) || {};
      const respawn = Math.max(3, Number((def.spawn && def.spawn.respawn) || 9)) * 1000;
      state.nextSpawnAt = now + respawn;
    }

    if (now - state.lastSnap >= TICK_MS) {
      state.lastSnap = now;
      sendSnapshot(io, state);
    }
  }
}

// ---------------------------------------------------------------------------
// Hasar / Ã¶dÃ¼l
// ---------------------------------------------------------------------------
function playerPos(travel, player) {
  const p = travel.pos && travel.pos[player.id];
  return p || null;
}

function splitRewards(state, mob) {
  const entries = Object.keys(mob.contrib || {});
  const total = entries.reduce((a, k) => a + mob.contrib[k], 0);
  if (!total) return [];
  const awards = [];
  for (const pid of entries) {
    const share = mob.contrib[pid] / total;
    if (share < REWARD_MIN_SHARE) continue;
    const xp = Math.max(1, Math.round(mob.exp * share));
    const gold = Math.max(1, Math.round(mob.gold * share));
    awards.push({ playerId: pid, xp, gold, share });
  }
  // Kimse eÅŸiÄŸi geÃ§mediyse en Ã§ok vuran alÄ±r (Ã¶dÃ¼l kaybolmasÄ±n).
  if (!awards.length) {
    const top = entries.sort((a, b) => mob.contrib[b] - mob.contrib[a])[0];
    awards.push({ playerId: top, xp: Math.max(1, mob.exp), gold: Math.max(1, mob.gold), share: 1 });
  }
  return awards;
}

function attack(io, room, player, payload = {}) {
  const travel = (player && player.travelId && room.travels && room.travels[player.travelId]) || null;
  if (!travel || !sharedEnabled(travel)) return null;
  const state = states.get(travel.id);
  if (!state) return null;
  if (player.downed || (travel.downed && travel.downed[player.id])) return null;

  const now = Date.now();
  // Token bucket: Ã§ok vuruÅŸlu yetenekler (3 ok, AoE tick) anlÄ±k patlama yapabilir,
  // ama saniyede 14 vuruÅŸun Ã¼zeri reddedilir (spam/hile tavanÄ±).
  const bucket = player._mobAtkBucket || (player._mobAtkBucket = { n: 8, t: now });
  const refill = Math.min(14, bucket.n + ((now - bucket.t) / 1000) * 14);
  bucket.n = refill;
  bucket.t = now;
  if (bucket.n < 1) return null;
  bucket.n -= 1;

  const mob = state.mobs.find((m) => m.id === String(payload.id || "")) || null;
  if (!mob || mob.dead || mob.hp <= 0) return null;

  const pos = playerPos(travel, player);
  if (!pos) return null;
  const px = state.px || pxPerUnit(travel);
  const dist = Math.hypot(pos.x - mob.x, pos.y - mob.y);
  // Menzil doÄŸrulamasÄ±: istemcinin bildirdiÄŸi menzil + ~60 px tolerans.
  const reachPx = Math.min(520, Math.max(90, Number(payload.range) || 220)) + 60;
  if (dist > reachPx / px) return null;

  player._lastMobAtkTs = now;

  const raw = Number(payload.dmg);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  // Hasar tavanÄ±: 999999 gÃ¶nderen bir istemci canavarÄ± tek vuruÅŸta silemez.
  // SÄ±nÄ±r, oyuncunun seviyesi/saldÄ±rÄ±sÄ±yla Ã¶lÃ§eklenir (meÅŸru kritikler geÃ§sin).
  const lvl = Math.max(1, Number(player.level) || 1);
  const statCap = Math.max(900, lvl * 400, (Number(player.attack) || 0) * 60);
  const cap = Math.max(1, Math.min(mob.maxHp, Math.round(statCap)));
  const dmg = Math.max(1, Math.min(cap, Math.round(raw)));

  mob.hp = Math.max(0, mob.hp - dmg);
  mob.contrib[player.id] = (mob.contrib[player.id] || 0) + dmg;
  mob.state = "CHASE";
  mob.targetId = player.id;

  broadcast(io, state, "travel:mobHit", {
    i: mob.id,
    d: dmg,
    h: mob.hp,
    by: player.id,
    c: payload.crit ? 1 : 0,
    x: Math.round(mob.x * 100) / 100,
    y: Math.round(mob.y * 100) / 100,
  });

  if (mob.hp <= 0) {
    mob.dead = true;
    mob.deathAt = now;
    const awards = splitRewards(state, mob);
    for (const a of awards) {
      const target = room.players.find((p) => p.id === a.playerId);
      if (!target) continue;
      try { addXp(target, a.xp); } catch (e) { /* xp best-effort */ }
      target.gold = (target.gold || 0) + a.gold;
      try {
        io.to(target.id).emit("travel:killReward", {
          kind: mob.kind,
          xp: a.xp,
          gold: a.gold,
          goldTotal: target.gold || 0,
          shared: true,
        });
      } catch (e) { /* kopmuÅŸ soket */ }
    }
    broadcast(io, state, "travel:mobDead", {
      i: mob.id,
      k: mob.kind,
      by: player.id,
      x: Math.round(mob.x * 100) / 100,
      y: Math.round(mob.y * 100) / 100,
    });
    state.nextSpawnAt = now + 9000;
  }

  return { id: mob.id, dmg, hp: mob.hp, dead: mob.dead };
}

function stats() {
  return { travels: states.size, mobs: [...states.values()].reduce((a, s) => a + s.mobs.length, 0) };
}

module.exports = {
  TICK_MS,
  enabled,
  sharedEnabled,
  markShared,
  ensure,
  detach,
  detachRoom,
  tick,
  attack,
  snapshot,
  sendSnapshot,
  stats,
  findMonsterDef,
};
