// Setra Travel - shared room world map exploration.
// Server-authoritative map generation + POI/party/invite handling.
// Combat is NOT reimplemented: encounters live in room.dungeons with
// travel:true so the existing multiplayer combat engine runs unchanged.
const { CONTENT, getDungeon, getItem } = require("../content");
const { addItem, addXp } = require("./players");
const { idleDungeon } = require("./dungeon");
const combat = require("./combat");
const persistentWorld = require("./persistentWorld");

const ENTRY_STAMINA = 10;

const MAP_TYPES = [
  { id: "verdant", label: "Verdant Wilds" },
  { id: "ashen",   label: "Ashen Wastes" },
  { id: "frost",   label: "Frozen Tundra" },
  { id: "swamp",   label: "Mirefen Marsh" },
  { id: "cursed",  label: "Cursed Reach" },
];

// Maps are intentionally large now (5x the old footprint). The client renders
// a scaled circular world, so raw dimensions mostly buy explorable space,
// breathing room for POIs and a real sense of distance between landmarks.
const MAP_SIZES = [
  { id: "small",    label: "Small",    w: 240, h: 240, scale: 0.7 },
  { id: "normal",   label: "Normal",   w: 320, h: 320, scale: 1.0 },
  { id: "large",    label: "Large",    w: 400, h: 400, scale: 1.35 },
  { id: "huge",     label: "Huge",     w: 480, h: 480, scale: 1.7 },
  { id: "colossal", label: "Colossal", w: 600, h: 600, scale: 2.2 },
];

// tile codes
const T = { DEEP: 0, SHALLOW: 1, SAND: 2, GRASS: 3, FOREST: 4, HILL: 5, ROCK: 6, SNOW: 7, ASH: 8, SWAMP: 9, ROAD: 10, BRIDGE: 11, RUIN: 12 };
const WALKABLE = new Set([2, 3, 4, 5, 7, 8, 9, 10, 11, 12]);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function valueNoise(rng, w, h, cells) {
  const c = Math.max(2, cells);
  const g = Array.from({ length: c + 1 }, () => Array.from({ length: c + 1 }, () => rng()));
  const out = Array.from({ length: h }, () => new Array(w).fill(0));
  for (let y = 0; y < h; y++) {
    const fy = (y / (h - 1)) * c;
    const y0 = Math.min(c - 1, Math.floor(fy));
    const ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const fx = (x / (w - 1)) * c;
      const x0 = Math.min(c - 1, Math.floor(fx));
      const tx = fx - x0;
      const a = g[y0][x0], b = g[y0][x0 + 1], d = g[y0 + 1][x0], e = g[y0 + 1][x0 + 1];
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const top = a + (b - a) * sx, bot = d + (e - d) * sx;
      out[y][x] = top + (bot - top) * sy;
    }
  }
  return out;
}

function biome(type, elev, moist) {
  if (elev < 0.30) return moist > 0.5 ? T.DEEP : T.SHALLOW;
  if (elev < 0.36) return T.SAND;
  switch (type) {
    case "ashen":
      if (elev > 0.74) return T.ROCK;
      return moist > 0.55 ? T.ASH : (elev > 0.6 ? T.HILL : T.SAND);
    case "frost":
      if (elev > 0.78) return T.ROCK;
      return elev > 0.55 ? T.SNOW : T.GRASS;
    case "swamp":
      if (elev > 0.8) return T.ROCK;
      return moist > 0.45 ? T.SWAMP : T.FOREST;
    case "cursed":
      if (elev > 0.8) return T.ROCK;
      if (moist > 0.62) return T.SWAMP;
      if (moist < 0.3) return T.HILL;
      return T.FOREST;
    default: // verdant
      if (elev > 0.8) return T.ROCK;
      if (moist > 0.6) return T.FOREST;
      if (moist < 0.32) return T.HILL;
      return T.GRASS;
  }
}

function isWalkable(tiles, w, h, x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  return WALKABLE.has(tiles[y * w + x]);
}

function tileAt(tiles, w, h, x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return -1;
  return tiles[y * w + x];
}

// Verilen karonun çevresinde kaya/höyük var mı? Dungeon'lar kayaların içine
// gömülsün diye yerleşim bunu tercih eder.
function nearRock(tiles, w, h, x, y, rad = 3) {
  for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
    const t = tileAt(tiles, w, h, x + dx, y + dy);
    if (t === T.ROCK || t === T.HILL) return true;
  }
  return false;
}

// Yol kenarına serilmiş sandıklar: rastgele araziye saçılmak yerine
// oyuncunun gerçekten yürüdüğü patikaların üstünde/kenarında dururlar.
// Sandıklar birbirine ve diğer önemli noktalara çok yakın olamaz: keşif
// hissi için aralarında en az CHEST_SPACING kare mesafe bırakılır.
const CHEST_MIN_FROM_POI = 20;  // sandık <-> kale/mağara/köy vb.
const CHEST_SPACING = 26;       // sandık <-> sandık (20-30 kare aralık)
const CHEST_MIN_FROM_SPAWN = 16;

function pickRoadsideChests(rng, tiles, w, h, pois, spawn, count) {
  const out = [];
  const road = [];
  for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
    if (tiles[y * w + x] === T.ROAD) road.push({ x, y });
  }
  if (!road.length) return out;
  // Önce uzak noktaları deneyen ikinci bir tur: seyrek yerleşim olmazsa
  // mesafeyi kademeli olarak düşürürüz (yine de yakın sandık çıkmaz).
  const passes = [CHEST_SPACING, Math.round(CHEST_SPACING * 0.8), CHEST_MIN_FROM_POI];
  for (const spacing of passes) {
    for (let a = 0; a < 6000 && out.length < count; a++) {
      const c = road[Math.floor(rng() * road.length)];
      const jitter = () => Math.round((rng() - 0.5) * 2);
      const x = c.x + jitter(), y = c.y + jitter();
      if (!isWalkable(tiles, w, h, x, y)) continue;
      if (Math.hypot(x - spawn.x, y - spawn.y) < CHEST_MIN_FROM_SPAWN) continue;
      if (pois.some((p) => Math.hypot(p.x - x, p.y - y) < CHEST_MIN_FROM_POI)) continue;
      if (out.some((p) => Math.hypot(p.x - x, p.y - y) < spacing)) continue;
      out.push({ id: "chest_" + (pois.length + out.length), kind: "chest", x, y, consumed: false });
    }
  }
  return out;
}

function pickPOIs(rng, tiles, w, h, size, count) {
  const pois = [];
  const kinds = [];
  // Az sayıda ama anlamlı savaş alanı.
  const dungeons = size.scale < 0.9 ? 1 : (size.scale > 1.8 ? 3 : 2);
  for (let i = 0; i < dungeons; i++) kinds.push("dungeon");
  kinds.push("inn");
  const dens = Math.round(2 * size.scale) + 1;
  for (let i = 0; i < dens; i++) kinds.push("den");
  const ruins = Math.round(2 * size.scale) + 1;
  for (let i = 0; i < ruins; i++) kinds.push("ruin");
  if (rng() < 0.7) kinds.push("watch");

  const minDist = 13 + Math.round(size.scale * 8);
  let spawn = findWalkable(tiles, w, h, Math.floor(w / 2), Math.floor(h / 2), rng);
  let tries = 0;
  for (const kind of kinds) {
    let placed = null;
    // İlk tur: türüne uygun arazi (dungeon kayaya gömülü, den orman/mağara).
    for (let a = 0; a < 1200 && !placed; a++) {
      const x = 3 + Math.floor(rng() * (w - 6));
      const y = 3 + Math.floor(rng() * (h - 6));
      if (!isWalkable(tiles, w, h, x, y)) continue;
      if (kind === "dungeon" && !nearRock(tiles, w, h, x, y, 3)) continue;
      if (kind === "den" && !(nearRock(tiles, w, h, x, y, 2) || tileAt(tiles, w, h, x, y) === T.FOREST)) continue;
      if (Math.hypot(x - spawn.x, y - spawn.y) < minDist) continue;
      if (pois.some((p) => Math.hypot(p.x - x, p.y - y) < minDist)) continue;
      placed = { x, y };
    }
    // Yedek tur: arazi şartını bırak (harita boş kalmasın).
    for (let a = 0; a < 400 && !placed; a++) {
      const x = 3 + Math.floor(rng() * (w - 6));
      const y = 3 + Math.floor(rng() * (h - 6));
      if (!isWalkable(tiles, w, h, x, y)) continue;
      if (Math.hypot(x - spawn.x, y - spawn.y) < minDist) continue;
      if (pois.some((p) => Math.hypot(p.x - x, p.y - y) < minDist)) continue;
      placed = { x, y };
    }
    if (!placed) { if (++tries > 3) break; continue; }
    pois.push({ id: kind + "_" + pois.length, kind, x: placed.x, y: placed.y, consumed: false });
  }
  return { spawn, pois };
}

function findWalkable(tiles, w, h, cx, cy, rng) {
  for (let r = 0; r < Math.max(w, h); r++) {
    for (let a = 0; a < 40; a++) {
      const x = cx + Math.round((rng() * 2 - 1) * r);
      const y = cy + Math.round((rng() * 2 - 1) * r);
      if (isWalkable(tiles, w, h, x, y)) return { x, y };
    }
  }
  return { x: cx, y: cy };
}

function carveRoad(tiles, w, h, from, to) {
  let x = from.x, y = from.y;
  const step = () => {
    const dx = Math.sign(to.x - x), dy = Math.sign(to.y - y);
    if (Math.abs(to.x - x) >= Math.abs(to.y - y) && dx) x += dx; else if (dy) y += dy;
    const i = y * w + x;
    if (i >= 0 && i < tiles.length) {
      if (tiles[i] === T.DEEP || tiles[i] === T.SHALLOW) tiles[i] = T.BRIDGE;
      else if (!WALKABLE.has(tiles[i])) tiles[i] = T.ROAD;
      else if (tiles[i] !== T.BRIDGE) tiles[i] = T.ROAD;
    }
  };
  let guard = 0;
  while ((x !== to.x || y !== to.y) && guard++ < w + h + 10) step();
}

function rankForSize(size, kind) {
  // travel ranks by map scale, dens slightly lower
  const order = ["t1", "t2", "t3", "t4", "t5", "t6"];
  let idx = Math.min(5, Math.max(0, Math.round((size.scale - 0.7) / 0.35)));
  if (kind === "den") idx = Math.max(0, idx - 1);
  return order[idx];
}

function genName(type, kind, idx) {
  const names = {
    dungeon: ["Sunken Vault", "Forgotten Delve", "Ruined Crypt", "Emberdeep Halls", "Hollow Sanctum", "Abyssal Gate"],
    den: ["Wolf Den", "Spider Hollow", "Bandit Camp", "Beast Lair", "Wraith Nest", "Grub Burrow"],
    chest: ["Buried Cache", "Abandoned Satchel", "Sealed Chest", "Lost Strongbox", "Hidden Hoard"],
    ruin: ["Toppled Shrine", "Ancient Monolith", "Broken Watchstone", "Old Cairn"],
    inn: ["Wayside Inn", "Traveler's Rest", "Roadside Hearth"],
    watch: ["Watchtower", "Signal Tower", "Lone Spire"],
  };
  const list = names[kind] || ["Point of Interest"];
  return list[idx % list.length];
}

function generateMap(seed, typeId, sizeId) {
  const type = MAP_TYPES.find((t) => t.id === typeId) || MAP_TYPES[0];
  const size = MAP_SIZES.find((s) => s.id === sizeId) || MAP_SIZES[1];
  const w = size.w, h = size.h;
  const rng = mulberry32(seed);
  const elev = valueNoise(rng, w, h, Math.round(6 * size.scale) + 3);
  const moist = valueNoise(rng, w, h, Math.round(5 * size.scale) + 3);
  const tiles = new Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let e = elev[y][x], m = moist[y][x];
    // island-ish falloff so edges are water
    const nx = (x / (w - 1)) * 2 - 1, ny = (y / (h - 1)) * 2 - 1;
    const edge = Math.max(Math.abs(nx), Math.abs(ny));
    e = e * 1.12 - Math.max(0, edge - 0.72) * 1.6;
    tiles[y * w + x] = biome(type.id, e, m);
  }
  const { spawn, pois } = pickPOIs(rng, tiles, w, h, size, 0);
  for (const p of pois) carveRoad(tiles, w, h, spawn, p);
  // Sandıklar yollar oyulduktan SONRA, patikaların üzerine yerleştirilir.
  // Sayı düşük tutulur: sandık bulmak nadir ve değerli olmalı.
  const chests = pickRoadsideChests(rng, tiles, w, h, pois, spawn, Math.max(1, Math.round(2 * size.scale)));
  for (const c of chests) pois.push(c);
  // assign POI details
  for (const p of pois) {
    if (p.kind === "dungeon" || p.kind === "den") {
      p.rank = rankForSize(size, p.kind);
      p.name = genName(type.id, p.kind, pois.indexOf(p));
    } else if (p.kind === "chest") {
      p.tier = rankForSize(size, "den");
      p.name = genName(type.id, "chest", pois.indexOf(p));
    } else {
      p.name = genName(type.id, p.kind, pois.indexOf(p));
    }
  }
  // Kare kodları sayısal dizi olarak kalır; base36 metni yalnızca istemci
  // "terrain" istediğinde üretilir. (Büyük haritada 360k string birleştirme
  // tüm sunucuyu kilitliyordu.)
  return {
    seed, type: type.id, typeLabel: type.label, size: size.id, sizeLabel: size.label,
    w, h, tiles, spawn, pois,
  };
}

// Birden fazla bağımsız sefer (dünya) aynı anda yaşayabilir. Her oyuncu
// player.travelId ile kendi dünyasına bağlıdır; oyuncu verilmezse (eski
// çağrılar) ilk aktif dünya döner.
function activeTravel(room, player) {
  if (!room) return null;
  // Bir oyuncu verildiyse YALNIZCA kendi seferi döner. Eski "ilk aktif sefere
  // düş" davranışı, kasabaya dönmüş/ölmüş bir oyuncunun başkasının seferinde
  // sanılmasına ("zaten seferdesin"), hayalet konum göndermesine ve yanlış
  // haritanın açılmasına yol açıyordu.
  if (player) {
    const own = player.travelId && room.travels && room.travels[player.travelId];
    return own && own.active ? own : null;
  }
  // Oyuncu verilmediyse (eski çağrılar / tüm seferler) ilk aktif dünya döner.
  for (const id of Object.keys(room.travels || {})) {
    const t = room.travels[id];
    if (t && t.active) return t;
  }
  return room.travel && room.travel.active ? room.travel : null;
}

function newTravelId(room) {
  const n = Object.keys(room.travels || {}).length + 1;
  return "trv_" + n + "_" + Math.random().toString(36).slice(2, 8);
}

// Mark a circular area around (x,y) as explored. Shared by the whole room so
// every player benefits from what the others have uncovered. Returns the list
// of tile indices that were newly revealed (used for lightweight deltas).
function revealAround(travel, x, y, rad) {
  if (!travel || !travel.explored) return [];
  const added = [];
  const ci = Math.floor(x), cj = Math.floor(y);
  for (let j = -rad; j <= rad; j++) {
    for (let i = -rad; i <= rad; i++) {
      if (i * i + j * j > rad * rad) continue;
      const a = ci + i, b = cj + j;
      if (a < 0 || b < 0 || a >= travel.w || b >= travel.h) continue;
      const idx = b * travel.w + a;
      if (!travel.explored[idx]) { travel.explored[idx] = 1; added.push(idx); }
    }
  }
  return added;
}

function enterTravel(room, player, typeId, sizeId, opts = {}) {
  if (player.stamina < ENTRY_STAMINA) throw new Error(`Travel costs ${ENTRY_STAMINA} stamina.`);
  // Sefer her zaman tam can/mana ile başlar: eski düşük can (0 ya da 40) taşınmaz.
  if (player.lives > 0) {
    player.hp = Math.max(1, player.maxHp || 100);
    player.mana = Math.max(0, player.maxMana || 0);
  }
  player.downed = false;
  if (!room.travels) room.travels = {};
  // Zaten bir dünyadaysa önce oradan ayrıl (üst üste dünya olmasın).
  if (player.travelId) leaveTravel(room, player);
  // `travelId` boş kalmış hayalet üyelikleri de temizle: eski oturumdan kalan
  // kayıt yeni seferde ikinci bir "gölge oyuncu" olarak görünmesin.
  for (const id of Object.keys(room.travels)) {
    const tr = room.travels[id];
    if (!tr || !Array.isArray(tr.members) || !tr.members.includes(player.id)) continue;
    tr.members = tr.members.filter((x) => x !== player.id);
    if (tr.pos) delete tr.pos[player.id];
    if (tr.invites) delete tr.invites[player.id];
    if (tr.downed) delete tr.downed[player.id];
    if (!tr.members.length) {
      delete room.travels[id];
      if (room.travel === tr) room.travel = null;
    }
  }

  let travel = null;
  if (opts.joinId) {
    travel = room.travels[opts.joinId];
    if (!travel || !travel.active) throw new Error("That expedition has ended.");
  }
  if (!travel) {
    // Her "Set out" yepyeni bir dünya üretir; aynı tohum asla tekrar kullanılmaz.
    const seed = Math.floor(Math.random() * 2147483647);
    const map = generateMap(seed, typeId || MAP_TYPES[0].id, sizeId || "normal");
    const id = newTravelId(room);
    travel = room.travels[id] = {
      id,
      active: true,
      ...map,
      leaderId: player.id,
      members: [],
      pos: {},
      parties: {},
      invites: {},
      explored: new Uint8Array(map.w * map.h),
      createdAt: Date.now(),
    };
    revealAround(travel, travel.spawn.x + 0.5, travel.spawn.y + 0.5, 8);
  }
  player.stamina = Math.max(0, player.stamina - ENTRY_STAMINA);
  player.travelId = travel.id;
  if (!travel.members.includes(player.id)) travel.members.push(player.id);
  if (!travel.pos[player.id]) travel.pos[player.id] = { x: travel.spawn.x + 0.5, y: travel.spawn.y + 0.5 };
  revealAround(travel, travel.pos[player.id].x, travel.pos[player.id].y, 6);
  return travel;
}

function enterPersistent(room, player) {
  if (player.stamina < ENTRY_STAMINA) throw new Error(`Travel costs ${ENTRY_STAMINA} stamina.`);
  // Tek, kalıcı kıta: her girişte tam can/mana ve hayalet üyelik temizliği.
  if (player.lives > 0) {
    player.hp = Math.max(1, player.maxHp || 100);
    player.mana = Math.max(0, player.maxMana || 0);
  }
  player.downed = false;
  if (player.travelId) leaveTravel(room, player);
  if (!room.travels) room.travels = {};
  for (const id of Object.keys(room.travels)) {
    const tr = room.travels[id];
    if (!tr || !Array.isArray(tr.members) || !tr.members.includes(player.id)) continue;
    tr.members = tr.members.filter((x) => x !== player.id);
    if (tr.pos) delete tr.pos[player.id];
    if (tr.invites) delete tr.invites[player.id];
    if (tr.downed) delete tr.downed[player.id];
    if (!tr.members.length) { delete room.travels[id]; if (room.travel === tr) room.travel = null; }
  }
  const t = persistentWorld.enter(room, player);
  player.stamina = Math.max(0, player.stamina - ENTRY_STAMINA);
  return t;
}

// Kasabaya dönüş yalnızca seferin başladığı noktadan (varış taşından) yapılabilir.
// Böylece canavarın ortasında savaşırken "kaçış" olarak kullanılamaz.
function atReturnPoint(travel, id, radius = 3) {
  if (!travel || !travel.spawn) return false;
  const p = travel.pos && travel.pos[id];
  if (!p) return false;
  if (travel.persistent) {
    return travel.pois.some((poi) => (poi.checkpoint || poi.kind === "inn" || poi.kind === "checkpoint") &&
      Math.hypot(p.x - poi.x - 0.5, p.y - poi.y - 0.5) <= 16);
  }
  const sx = (travel.spawn.x || 0) + 0.5;
  const sy = (travel.spawn.y || 0) + 0.5;
  return Math.hypot(p.x - sx, p.y - sy) <= radius;
}

function healForTown(player) {
  if (!player) return;
  player.downed = false;
  // Ölü (kalp 0) oyuncu tapınakta diriltilir; onun canı 0 kalır.
  if (Number.isFinite(player.lives) && player.lives <= 0) return;
  player.hp = Math.max(1, player.maxHp || 100);
  player.mana = Math.max(0, player.maxMana || 0);
}

// Oyuncu `travelId` taşımıyor ama bir seferin üyesi olarak listelenmiş mi?
// (Eski istemci/sunucu karışıklığından kalan hayalet üyelik.)
function memberOfAnyTravel(room, player) {
  if (!room || !player || !room.travels) return false;
  for (const id of Object.keys(room.travels)) {
    const tr = room.travels[id];
    if (tr && Array.isArray(tr.members) && tr.members.includes(player.id)) return true;
  }
  return false;
}

function leaveTravel(room, player) {
  if (!room || !player) return;
  // Kasabaya dönüş her koşulda tam can/mana ile olur. Bu satır fonksiyonun en
  // başında: aşağıdaki erken çıkışlar (travel bulunamazsa) canı eksik bırakmasın.
  healForTown(player);
  leaveExpedition(room, player);
  // Oyuncunun `travelId`'si boş/eskimiş olsa bile üye olarak listelendiği TÜM
  // seferlerden çıkar. Eski "ilk aktif sefer" mantığı yüzünden oluşan hayalet
  // üyelikler burada temizlenir; aksi halde oyuncu kasabada görünürken sunucu
  // onu hâlâ bir seferin üyesi sayıp "zaten seferdesin" diyebiliyordu.
  const targets = [];
  for (const id of Object.keys(room.travels || {})) {
    const tr = room.travels[id];
    if (tr && Array.isArray(tr.members) && tr.members.includes(player.id) && !targets.includes(tr)) targets.push(tr);
  }
  const own = player.travelId && room.travels && room.travels[player.travelId];
  if (own && !targets.includes(own)) targets.push(own);
  for (const travel of targets) {
    if (travel.persistent) {
      persistentWorld.leave(room, player, travel);
      continue;
    }
    travel.members = (travel.members || []).filter((id) => id !== player.id);
    if (travel.pos) delete travel.pos[player.id];
    if (travel.invites) delete travel.invites[player.id];
    if (travel.downed) delete travel.downed[player.id];
    for (const key of Object.keys(travel.parties || {})) {
      const party = travel.parties[key];
      party.memberIds = (party.memberIds || []).filter((id) => id !== player.id);
      if (party.leaderId === player.id && party.memberIds.length) party.leaderId = party.memberIds[0];
      if (!party.memberIds.length && party.status === "waiting") delete travel.parties[key];
    }
    if (!travel.members.length) {
      if (room.travels && room.travels[travel.id]) delete room.travels[travel.id];
      if (room.travel === travel) room.travel = null;
    }
  }
  player.travelId = null;
  player.dungeonId = null;
  // Son güvence: aradaki hiçbir işlem canı düşüremesin. `fall()` bunu takiben
  // bilinçli olarak hp=0 yapar (gerçek ölüm), diğer tüm dönüşlerde tam can kalır.
  healForTown(player);
}

// ---- Yere düşme / diriltme (çok oyunculu seyahat) ----
// Yere düşen oyuncu seferde kalır; yakındaki bir takım arkadaşı onu diriltebilir.
function isDowned(travel, id) {
  return !!(travel && travel.downed && travel.downed[id]);
}

function setDowned(travel, id, on) {
  if (!travel) return;
  if (!travel.downed) travel.downed = {};
  if (on) travel.downed[id] = Date.now();
  else delete travel.downed[id];
}

// Yakındaki düşmüş bir oyuncuyu ayağa kaldırır; canı doldurulur.
function revive(room, player, targetId) {
  const travel = activeTravel(room, player);
  if (!travel) throw new Error("No active travel map.");
  if (player.lives <= 0) throw new Error("You cannot revive while fallen.");
  if (!targetId || targetId === player.id) throw new Error("Pick an ally to revive.");
  if (!isDowned(travel, targetId)) throw new Error("That ally is not down.");
  const target = room.players.find((p) => p.id === targetId);
  if (!target || !travel.members.includes(targetId)) throw new Error("That ally is not with you.");
  const a = travel.pos[player.id];
  const b = travel.pos[targetId];
  if (!a || !b) throw new Error("Cannot reach that ally.");
  if (Math.hypot(a.x - b.x, a.y - b.y) > 2.6) throw new Error("Move closer to revive your ally.");
  setDowned(travel, targetId, false);
  target.hp = Math.max(1, target.maxHp || 100);
  target.downed = false;
  return { target };
}

// Yere düşen oyuncu vazgeçip kasabaya döner (kalp zaten düşmüştü).
function giveUp(room, player) {
  const travel = activeTravel(room, player);
  if (!travel) return null;
  setDowned(travel, player.id, false);
  player.downed = false;
  if (player.hp <= 0) player.hp = Math.max(1, player.maxHp || 100);
  leaveTravel(room, player);
  player.dungeonId = null;
  return travel;
}

// Düşen oyuncuyu ölüme götür (kalbi kalmadı): kasabada tapınakta diriltilmeli.
function fall(room, player) {
  const travel = activeTravel(room, player);
  if (!travel) return null;
  setDowned(travel, player.id, false);
  player.downed = false;
  player.hp = 0;
  leaveTravel(room, player);
  // leaveTravel yerde kalan oyuncuyu iyileştirir; gerçek ölümde can 0 kalmalı.
  player.hp = 0;
  player.dungeonId = null;
  return travel;
}

function nearPOI(travel, player, poiId) {
  const poi = travel.pois.find((p) => p.id === poiId);
  if (!poi) throw new Error("That place does not exist.");
  const pos = travel.pos[player.id];
  if (!pos) throw new Error("You are not travelling.");
  // POI'lerin görsel boyutu büyük: oyuncu nesnenin içine girmek zorunda kalmasın.
  // (İstemci etkileşim yarıçapı ~12 karo; sunucu biraz daha toleranslı.)
  if (Math.hypot(pos.x - poi.x - 0.5, pos.y - poi.y - 0.5) > 16) throw new Error("Too far away.");
  return poi;
}

function weightedPick(weights) {
  const entries = Object.entries(weights || {});
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const [k, w] of entries) { roll -= w; if (roll <= 0) return k; }
  return entries[entries.length - 1][0];
}

// Travel loot is luck-based: chest POIs hand over a CHEST whose quality is
// rolled against the map tier. The chest's own tier then bounds what spills
// out when opened, so a lucky find never dumps a directly-overpowered item.
// Denge: yüksek tier'lerde bile efsanevi/mythic sandık çıkışı düşük tutulur
// (dungeon sonu sandık şansına yakın bir his).
const TRAVEL_CHEST_TABLE = {
  t1: { wooden_chest: 70, iron_chest: 25, gold_chest: 5 },
  t2: { wooden_chest: 55, iron_chest: 32, gold_chest: 11, emerald_chest: 1.5, buried_treasure: 0.5 },
  t3: { wooden_chest: 20, iron_chest: 40, gold_chest: 30, emerald_chest: 8, obsidian_chest: 1.5, buried_treasure: 0.5 },
  t4: { iron_chest: 22, gold_chest: 38, emerald_chest: 30, obsidian_chest: 8, mythic_chest: 1, buried_treasure: 1 },
  t5: { gold_chest: 25, emerald_chest: 40, obsidian_chest: 26, mythic_chest: 7, buried_treasure: 2 },
  t6: { gold_chest: 15, emerald_chest: 35, obsidian_chest: 36, mythic_chest: 11, buried_treasure: 3 },
};

function rollTravelLoot(player, tier) {
  const table = TRAVEL_CHEST_TABLE[tier] || TRAVEL_CHEST_TABLE.t1;
  const chestId = weightedPick(table) || "wooden_chest";
  const chest = getItem(chestId);
  if (!chest) {
    const gold = 20 + Math.floor(Math.random() * 30);
    player.gold += gold;
    return { gold, rarity: "common" };
  }
  addItem(player, chest.id, 1);
  return { itemId: chest.id, name: chest.name, rarity: chest.rarity || "common", chest: true };
}

function inviteOthers(room, travel, poi, from) {
  for (const id of travel.members) {
    if (id === from.id) continue;
    const p = room.players.find((pp) => pp.id === id);
    if (!p || p.lives <= 0) continue;
    travel.invites[id] = { poiId: poi.id, fromId: from.id, fromName: from.name, at: Date.now() };
  }
}

function interact(room, player, poiId) {
  const travel = activeTravel(room, player);
  if (!travel) throw new Error("No active travel map.");
  const poi = nearPOI(travel, player, poiId);
  if (poi.kind === "chest") {
    const used = travel.persistent ? persistentWorld.consumedFor(travel, player, poi) : poi.consumed;
    if (used) throw new Error("This chest is already looted.");
    if (travel.persistent) persistentWorld.markConsumed(travel, player, poi, true);
    else poi.consumed = true;
    const loot = rollTravelLoot(player, poi.tier || "t1");
    return { poi, loot, text: `${player.name} opens the ${poi.name}.` };
  }
  if (poi.kind === "inn" || poi.kind === "checkpoint") {
    if (!travel.persistent && poi.consumed) throw new Error("The inn has closed for now.");
    if (travel.persistent) persistentWorld.activateCheckpoint(travel, player, poi);
    else {
      poi.consumed = true;
      player.hp = player.maxHp;
      player.mana = player.maxMana;
      player.stamina = Math.min(player.maxStamina, player.stamina + 4);
    }
    return { poi, checkpoint: true, text: `${player.name} rests at the ${poi.name}. Checkpoint saved.` };
  }
  if (poi.kind === "ruin") {
    const used = travel.persistent ? persistentWorld.consumedFor(travel, player, poi) : poi.consumed;
    if (used) throw new Error("This ruin has nothing left.");
    if (travel.persistent) persistentWorld.markConsumed(travel, player, poi, true);
    else poi.consumed = true;
    const gold = 15 + Math.floor(Math.random() * 35);
    player.gold += gold;
    return { poi, gold, text: `${player.name} searches the ${poi.name} (+${gold} gold).` };
  }
  if (poi.kind === "watch") {
    poi.revealed = true;
    if (travel.persistent) {
      const saved = persistentWorld.playerState(player);
      saved.discovered[poi.id] = 1;
      persistentWorld.scheduleSave();
    }
    return { poi, reveal: true, text: `${player.name} lights the ${poi.name} - the map is revealed.` };
  }
  if (poi.kind === "camp") {
    if (travel.persistent) persistentWorld.activateCheckpoint(travel, player, poi);
    player.hp = player.maxHp; player.mana = player.maxMana;
    return { poi, checkpoint: true, text: `${player.name} makes camp at ${poi.name}. Progress saved.` };
  }
  if (poi.kind !== "dungeon" && poi.kind !== "den") {
    return { poi, text: `${player.name} discovered ${poi.name}.` };
  }
  // dungeon / den -> party formation
  let party = travel.parties[poi.id];
  if (!party) {
    party = travel.parties[poi.id] = {
      id: "travel_" + poi.id,
      poiId: poi.id,
      kind: poi.kind,
      rank: poi.rank || "t1",
      leaderId: player.id,
      memberIds: [player.id],
      status: "waiting",
      dungeonId: null,
      createdAt: Date.now(),
    };
  } else if (party.status === "waiting" && !party.memberIds.includes(player.id)) {
    party.memberIds.push(player.id);
  }
  inviteOthers(room, travel, poi, player);
  return { poi, party: publicParty(party), text: `${player.name} found ${poi.name}.` };
}

function acceptInvite(room, player) {
  const travel = activeTravel(room, player);
  if (!travel) throw new Error("No active travel map.");
  const inv = travel.invites[player.id];
  if (!inv) throw new Error("You have no pending invite.");
  const poi = travel.pois.find((p) => p.id === inv.poiId);
  delete travel.invites[player.id];
  if (!poi) throw new Error("That place is gone.");
  travel.pos[player.id] = { x: poi.x + 0.5, y: poi.y + 0.5 };
  const res = interact(room, player, poi.id);
  return { poi, pos: travel.pos[player.id], text: res.text };
}

function startEncounter(room, player, poiId) {
  const travel = activeTravel(room, player);
  if (!travel) throw new Error("No active travel map.");
  const party = travel.parties[poiId];
  if (!party) throw new Error("No party here.");
  if (party.leaderId !== player.id) throw new Error("Only the leader can start.");
  if (party.status !== "waiting") throw new Error("This encounter already started.");
  const enc = idleDungeon();
  enc.id = "trav_" + poiId + "_" + Date.now();
  enc.rank = party.rank;
  enc.size = "normal";
  enc.travel = true;
  enc.poiId = poiId;
  enc.leaderId = party.leaderId;
  enc.memberIds = [...party.memberIds];
  enc.status = "waiting";
  enc.open = false;
  room.dungeons.push(enc);
  for (const id of enc.memberIds) {
    const m = room.players.find((p) => p.id === id);
    if (m) m.dungeonId = enc.id;
  }
  combat.spawnWave(room, enc);
  party.status = "fighting";
  party.dungeonId = enc.id;
  return enc;
}

function tryAutoJoin(room, player) {
  const travel = activeTravel(room, player);
  if (!travel) return false;
  const pos = travel.pos[player.id];
  if (!pos) return false;
  const poi = travel.pois.find((p) => (p.kind === "dungeon" || p.kind === "den") && Math.hypot(pos.x - p.x - 0.5, pos.y - p.y - 0.5) < 8.0);
  if (!poi) return false;
  let party = travel.parties[poi.id];
  if (!party) {
    party = travel.parties[poi.id] = {
      id: "travel_" + poi.id,
      poiId: poi.id,
      kind: poi.kind,
      rank: poi.rank || "t1",
      leaderId: player.id,
      memberIds: [player.id],
      status: "waiting",
      dungeonId: null,
      createdAt: Date.now(),
    };
    inviteOthers(room, travel, poi, player);
    return true;
  }
  if (party.status !== "waiting" || party.memberIds.includes(player.id)) return false;
  party.memberIds.push(player.id);
  return true;
}

function publicParty(party) {
  if (!party) return null;
  return { id: party.id, poiId: party.poiId, kind: party.kind, rank: party.rank, leaderId: party.leaderId, memberIds: [...party.memberIds], status: party.status };
}

function publicTravel(room, player) {
  const travel = activeTravel(room, player);
  if (!travel) return null;
  const parties = {};
  for (const [k, v] of Object.entries(travel.parties)) parties[k] = publicParty(v);
  const invites = {};
  for (const [k, v] of Object.entries(travel.invites)) invites[k] = { poiId: v.poiId, fromName: v.fromName };
  return {
    id: travel.id,
    leaderId: travel.leaderId,
    active: true,
    seed: travel.seed, type: travel.type, typeLabel: travel.typeLabel,
    size: travel.size, sizeLabel: travel.sizeLabel, w: travel.w, h: travel.h,
    pois: travel.pois.map((p) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, name: p.name, rank: p.rank, tier: p.tier, consumed: !!p.consumed, revealed: !!p.revealed })),
    members: [...travel.members],
    pos: Object.fromEntries(Object.entries(travel.pos).map(([k, v]) => [k, { x: v.x, y: v.y }])),
    downed: Object.keys(travel.downed || {}),
    parties, invites,
  };
}

// Aynı odadaki tüm aktif seferler (oyuncular birbirine katılabilsin diye).
function publicTravels(room) {
  const out = {};
  for (const id of Object.keys(room.travels || {})) {
    const t = room.travels[id];
    if (!t || !t.active) continue;
    out[id] = publicTravel(room, { travelId: id });
  }
  if (!Object.keys(out).length && room.travel && room.travel.active) {
    const t = publicTravel(room);
    if (t) out[t.id || "legacy"] = t;
  }
  return out;
}

// ---- Sefer odaları (lobi) ----
// Oyuncular doğrudan dünyaya düşmez; önce oda kurar / katılır, lider başlatır.
const MAX_PARTY = 4;

function publicExpeditions(room) {
  const out = {};
  for (const id of Object.keys(room.expeditions || {})) {
    const e = room.expeditions[id];
    if (!e) continue;
    out[id] = {
      id: e.id, leaderId: e.leaderId, type: e.type, typeLabel: e.typeLabel,
      size: e.size, sizeLabel: e.sizeLabel, status: e.status,
      memberIds: [...e.memberIds], createdAt: e.createdAt,
    };
  }
  return out;
}

function myExpedition(room, player) {
  if (!room || !player) return null;
  for (const id of Object.keys(room.expeditions || {})) {
    const e = room.expeditions[id];
    if (e && e.memberIds.includes(player.id)) return e;
  }
  return null;
}

function leaveExpedition(room, player) {
  if (!room || !player) return;
  for (const id of Object.keys(room.expeditions || {})) {
    const e = room.expeditions[id];
    if (!e || !e.memberIds.includes(player.id)) continue;
    e.memberIds = e.memberIds.filter((x) => x !== player.id);
    if (e.leaderId === player.id && e.memberIds.length) e.leaderId = e.memberIds[0];
    if (!e.memberIds.length) delete room.expeditions[id];
  }
}

function createExpedition(room, player, typeId, sizeId) {
  if (!room.expeditions) room.expeditions = {};
  leaveExpedition(room, player);
  const type = MAP_TYPES.find((t) => t.id === typeId) || MAP_TYPES[0];
  const size = MAP_SIZES.find((s) => s.id === sizeId) || MAP_SIZES[1];
  const id = "exp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
  const exp = {
    id, leaderId: player.id, memberIds: [player.id],
    type: type.id, typeLabel: type.label, size: size.id, sizeLabel: size.label,
    status: "lobby", createdAt: Date.now(),
  };
  room.expeditions[id] = exp;
  return exp;
}

function joinExpedition(room, player, id) {
  const exp = room.expeditions && room.expeditions[id];
  if (!exp) throw new Error("That expedition no longer exists.");
  if (exp.status !== "lobby") throw new Error("That expedition is already underway.");
  if (!exp.memberIds.includes(player.id)) {
    if (exp.memberIds.length >= MAX_PARTY) throw new Error("That expedition is full.");
    leaveExpedition(room, player);
    exp.memberIds.push(player.id);
  }
  return exp;
}

function launchExpedition(room, player, id) {
  const exp = room.expeditions && room.expeditions[id];
  if (!exp) throw new Error("That expedition no longer exists.");
  if (exp.leaderId !== player.id) throw new Error("Only the expedition leader can start it.");
  const members = exp.memberIds
    .map((mid) => room.players.find((p) => p.id === mid))
    .filter((p) => p && p.stamina >= ENTRY_STAMINA);
  if (!members.length) throw new Error(`Travel costs ${ENTRY_STAMINA} stamina.`);
  if (player.stamina < ENTRY_STAMINA) throw new Error(`Travel costs ${ENTRY_STAMINA} stamina.`);
  let travel = null;
  for (const m of members) {
    travel = travel
      ? enterTravel(room, m, exp.type, exp.size, { joinId: travel.id })
      : enterTravel(room, m, exp.type, exp.size);
  }
  exp.status = "active";
  exp.travelId = travel ? travel.id : null;
  if (travel) travel.leaderId = exp.leaderId;
  delete room.expeditions[id];
  return travel;
}

// Raw terrain (base36 tile string) + explored bitmap are only sent on request.
// On big maps they are hundreds of KB per emit; the ARPG client paints its own
// tiles from the biome, so shipping them on every travel:map froze browsers.
function exploredString(travel) {
  if (!travel || !travel.explored) return "";
  const ex = travel.explored;
  const parts = new Array(ex.length);
  for (let i = 0; i < ex.length; i++) parts[i] = ex[i] ? "1" : "0";
  return parts.join("");
}

function publicMap(room, player, opts = {}) {
  const travel = activeTravel(room, player);
  if (!travel) return null;
  // Kalıcı kıta: tam dünya konfigürasyonu, POI'ler ve oyuncunun keşfi istemciye gider.
  if (travel.persistent) return persistentWorld.publicMap(travel, player);
  const sizeDef = MAP_SIZES.find((s) => s.id === travel.size) || MAP_SIZES[1];
  const typeDef = MAP_TYPES.find((t) => t.id === travel.type) || MAP_TYPES[0];
  const out = {
    id: travel.id, seed: travel.seed,
    type: travel.type, typeLabel: typeDef.label,
    size: travel.size, sizeLabel: sizeDef.label, scale: sizeDef.scale,
    w: travel.w, h: travel.h, spawn: travel.spawn,
  };
  if (opts.terrain) {
    // Legacy explorer için base36 karo metni (istek üzerine üretilir).
    let tilesStr = "";
    if (typeof travel.tiles === "string") tilesStr = travel.tiles;
    else {
      const arr = travel.tiles || [];
      const parts = new Array(arr.length);
      for (let i = 0; i < arr.length; i++) parts[i] = (arr[i] || 0).toString(36);
      tilesStr = parts.join("");
    }
    out.tiles = tilesStr;
    out.explored = exploredString(travel);
  }
  return out;
}

// İstemci canavarları yerel olarak simüle eder; sunucu yalnızca ölüm
// bildirimini alır ve ödülü tabloya göre sınırlar (spam koruması dahil).
// Ödül tablosu artık CONTENT.travelBiomes içinden gelir: her biyomun kendi
// canavar listesi (kind/exp/gold) vardır. Bilinmeyen kind güvenli tabana düşer.
const KILL_FALLBACK = { xp: 18, gold: 6 };
const KILL_MIN_GAP_MS = 320;

function monsterReward(kind) {
  const biomes = (CONTENT && CONTENT.travelBiomes) || {};
  for (const b of Object.values(biomes)) {
    for (const m of (b && b.monsters) || []) {
      if (m && m.kind === kind) return { xp: Number(m.exp) || KILL_FALLBACK.xp, gold: Number(m.gold) || KILL_FALLBACK.gold };
    }
  }
  return KILL_FALLBACK;
}

function rewardKill(room, player, payload = {}) {
  const travel = activeTravel(room, player);
  if (!travel || !travel.members.includes(player.id)) return null;
  const now = Date.now();
  if (now - (player._lastKillTs || 0) < KILL_MIN_GAP_MS) return null;
  player._lastKillTs = now;
  const kind = String(payload.kind || "goblin");
  const base = monsterReward(kind);
  const size = MAP_SIZES.find((s) => s.id === travel.size) || MAP_SIZES[1];
  const mult = Math.max(0.6, Math.min(2.4, size.scale));
  return { xp: Math.round(base.xp * mult), gold: Math.round(base.gold * mult) };
}

function resetTravel(room) {
  if (!room) return;
  room.travels = {};
  room.travel = null;
  room.expeditions = {};
  for (const p of room.players) {
    p.travelId = null;
    if (p.dungeonId && String(p.dungeonId).startsWith("trav_")) p.dungeonId = null;
    // Sefer sıfırlandıysa kimse yaralı canla kasabada kalmasın.
    healForTown(p);
  }
}

module.exports = {
  ENTRY_STAMINA,
  MAP_TYPES,
  MAP_SIZES,
  generateMap,
  enterTravel,
  enterPersistent,
  leaveTravel,
  healForTown,
  memberOfAnyTravel,
  interact,
  acceptInvite,
  tryAutoJoin,
  startEncounter,
  publicTravel,
  publicTravels,
  publicMap,
  publicExpeditions,
  myExpedition,
  createExpedition,
  joinExpedition,
  leaveExpedition,
  launchExpedition,
  revealAround,
  resetTravel,
  activeTravel,
  rewardKill,
  atReturnPoint,
  isDowned,
  setDowned,
  revive,
  giveUp,
  fall,
};
