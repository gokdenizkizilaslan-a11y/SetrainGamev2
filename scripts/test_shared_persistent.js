"use strict";
/**
 * Kalıcı kıta (Setra) ortak canavar testi.
 *
 *   node scripts/test_shared_persistent.js
 *
 * Doğrular:
 *  1. İki oyuncu kalıcı kıtada aynı canavar ID'lerini görür.
 *  2. Kıta haritası `shared:true` döner (2+ oyuncu).
 *  3. Sunucu AI canavarı oyuncuya yaklaştırır.
 *  4. Oyuncu vuruşu sunucuda işlenir ve HP iki tarafta senkronlanır.
 */

const path = require("path");
const { io } = require("socket.io-client");
const { CONTENT } = require(path.join(__dirname, "..", "content"));

const URL = process.env.SETRA_URL || "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;

function check(name, cond, extra) {
  const ok = !!cond;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + JSON.stringify(extra) : ""}`);
}

function pickBaseClass() {
  const list = (CONTENT && CONTENT.classes) || [];
  const found = list.find((c) => c && c.slug && !c.baseClass && !c.secret && !c.hidden);
  return found ? found.slug : "warrior";
}

function mk(tag) {
  const sock = io(URL, { transports: ["websocket"], forceNew: true });
  const box = { tag, sock, maps: [], mobs: null, hits: [], deaths: [], errors: [] };
  sock.on("travel:map", (p) => box.maps.push(p));
  sock.on("travel:mobs", (p) => { if (p && Array.isArray(p.list)) box.mobs = p.list; });
  sock.on("travel:mobHit", (p) => box.hits.push(p));
  sock.on("travel:mobDead", (p) => box.deaths.push(p));
  sock.on("server:error", (e) => box.errors.push(e && e.message ? e.message : String(e)));
  sock.on("room:state", (s) => { box.room = s; });
  sock.on("self", (p) => { box.self = p; });
  return box;
}

function waitFor(box, fn, ms = 10000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const t = setInterval(() => {
      if (fn()) { clearInterval(t); resolve(true); return; }
      if (Date.now() - t0 > ms) { clearInterval(t); reject(new Error(`${box.tag}: timeout`)); }
    }, 40);
  });
}

async function walkToward(sock, from, to, stepUnits = 140) {
  let cur = { x: from.x, y: from.y };
  for (let i = 0; i < 12; i++) {
    const dx = to.x - cur.x, dy = to.y - cur.y;
    const d = Math.hypot(dx, dy);
    if (d < 12) break;
    const s = Math.min(stepUnits, d);
    cur = { x: cur.x + (dx / d) * s, y: cur.y + (dy / d) * s };
    sock.emit("travel:pos", { x: cur.x, y: cur.y });
    await sleep(70);
  }
}

(async () => {
  const cls = pickBaseClass();
  const a = mk("A");
  const b = mk("B");
  await Promise.all([
    new Promise((r) => a.sock.on("connect", r)),
    new Promise((r) => b.sock.on("connect", r)),
  ]);
  a.sock.emit("player:setup", { mode: "multi", name: "ContA", character: cls, secret: "" });
  b.sock.emit("player:setup", { mode: "multi", name: "ContB", character: cls, secret: "" });
  await Promise.all([waitFor(a, () => a.self), waitFor(b, () => b.self)]);

  a.sock.emit("room:create", { name: "Continent Test" });
  await waitFor(a, () => a.room && a.room.id);
  b.sock.emit("room:join", { roomId: a.room.id });
  await waitFor(a, () => a.room && a.room.players.length === 2);
  a.sock.emit("player:ready", { ready: true });
  b.sock.emit("player:ready", { ready: true });
  await sleep(250);
  a.sock.emit("game:start");
  await waitFor(a, () => a.room && a.room.status === "playing");

  a.sock.emit("travel:enter", { world: "setra" });
  await waitFor(a, () => a.maps.length > 0);
  b.sock.emit("travel:enter", { world: "setra" });
  await waitFor(b, () => b.maps.length > 0);

  const mapA = a.maps[a.maps.length - 1];
  check("kalıcı kıta haritası geldi", !!mapA && mapA.persistent === true, { id: mapA && mapA.id });

  await waitFor(a, () => a.maps.some((m) => m && m.shared === true), 6000).catch(() => null);
  const lastA = a.maps[a.maps.length - 1];
  const lastB = b.maps[b.maps.length - 1];
  check("kıta 2. oyuncudan sonra shared=true", !!lastA && lastA.shared === true && !!lastB && lastB.shared === true, {
    a: lastA && lastA.shared, b: lastB && lastB.shared,
  });

  // Köy güvenli bölgesinden çık: canavarlar ancak kasaba dışında doğar.
  const spawn = (lastA && lastA.spawn) || { x: 0, y: 0 };
  for (let i = 1; i <= 8; i++) {
    a.sock.emit("travel:pos", { x: spawn.x + i * 140, y: spawn.y + i * 60 });
    b.sock.emit("travel:pos", { x: spawn.x + i * 140, y: spawn.y + i * 60 });
    await sleep(90);
  }
  await sleep(600);

  await waitFor(a, () => Array.isArray(a.mobs) && a.mobs.length > 0, 15000);
  await waitFor(b, () => Array.isArray(b.mobs) && b.mobs.length > 0, 15000);
  const idsA = a.mobs.map((m) => m.i).sort().join(",");
  const idsB = b.mobs.map((m) => m.i).sort().join(",");
  check("aynı canavar ID'leri", idsA === idsB, { idsA, idsB });

  // En yakın canavara doğru yürü ve vur.
  const here = { x: spawn.x + 8 * 140, y: spawn.y + 8 * 60 };
  const order = [...a.mobs].sort((m1, m2) =>
    Math.hypot(m1.x - here.x, m1.y - here.y) - Math.hypot(m2.x - here.x, m2.y - here.y));
  let hit = null;
  for (const mob of order.slice(0, 4)) {
    await walkToward(a.sock, here, { x: mob.x, y: mob.y });
    a.sock.emit("travel:atk", { id: mob.i, dmg: 900, crit: false, el: "physical", range: 500 });
    await sleep(600);
    hit = a.hits.find((h) => h.by && h.by === (a.self && a.self.playerId));
    if (hit) break;
  }
  check("sunucu oyuncu vuruşunu işledi", !!hit, hit || null);
  if (hit) {
    await sleep(350);
    const seenB = b.hits.find((h) => h.i === hit.i);
    check("HP diğer oyuncuya da yayınlandı", !!seenB && Math.abs(seenB.h - hit.h) <= 1, {
      a: hit.h, b: seenB && seenB.h,
    });
  }

  // Sunucu AI: canavar (devriye ya da takip) hareket ediyor mu? 4 sn boyunca örnekle.
  const probe = (a.mobs || [])[0];
  if (probe) {
    let prev = null, moved = false;
    for (let i = 0; i < 14; i++) {
      await sleep(300);
      const cur = (a.mobs || []).find((m) => m.i === probe.i);
      if (!cur) break;
      if (prev && (Math.abs(cur.x - prev.x) > 0.2 || Math.abs(cur.y - prev.y) > 0.2)) { moved = true; break; }
      prev = cur;
    }
    check("canavar hareket ediyor (sunucu AI)", moved, { id: probe.i });
  }

  a.sock.close();
  b.sock.close();
  await sleep(200);
  console.log(failures ? `\n${failures} test BAŞARISIZ` : "\nTÜM KITA TESTLERİ GEÇTİ");
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error("TEST HATASI:", err && err.message);
  process.exit(2);
});
