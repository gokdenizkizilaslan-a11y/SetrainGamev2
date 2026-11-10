"use strict";
/**
 * Ortak canavar testi — oyunun gerçek "expedition" akışıyla
 * (travel:create → travel:join → travel:launch).
 *
 *   node scripts/test_shared_expedition.js
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
  const box = { tag, sock, maps: [], mobs: null, hits: [], errors: [] };
  sock.on("travel:map", (p) => box.maps.push(p));
  sock.on("travel:mobs", (p) => { if (p && Array.isArray(p.list)) box.mobs = p.list; });
  sock.on("travel:mobHit", (p) => box.hits.push(p));
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
      if (Date.now() - t0 > ms) { clearInterval(t); reject(new Error(`${box.tag}: timeout (${box.errors.join("|")})`)); }
    }, 40);
  });
}

function expeditionId(box) {
  const exps = (box.room && box.room.expeditions) || {};
  const keys = Object.keys(exps);
  return keys.length ? keys[0] : null;
}

(async () => {
  const cls = pickBaseClass();
  const a = mk("A");
  const b = mk("B");
  await Promise.all([
    new Promise((r) => a.sock.on("connect", r)),
    new Promise((r) => b.sock.on("connect", r)),
  ]);
  a.sock.emit("player:setup", { mode: "multi", name: "ExpA", character: cls, secret: "" });
  b.sock.emit("player:setup", { mode: "multi", name: "ExpB", character: cls, secret: "" });
  await Promise.all([waitFor(a, () => a.self), waitFor(b, () => b.self)]);

  a.sock.emit("room:create", { name: "Expedition Test" });
  await waitFor(a, () => a.room && a.room.id);
  b.sock.emit("room:join", { roomId: a.room.id });
  await waitFor(a, () => a.room && a.room.players.length === 2);
  a.sock.emit("player:ready", { ready: true });
  b.sock.emit("player:ready", { ready: true });
  await sleep(250);
  a.sock.emit("game:start");
  await waitFor(a, () => a.room && a.room.status === "playing");

  a.sock.emit("travel:create", { type: "verdant", size: "normal" });
  await waitFor(a, () => expeditionId(a));
  const expId = expeditionId(a);

  b.sock.emit("travel:join", { id: expId });
  await waitFor(a, () => Object.keys((a.room && a.room.expeditions) || {}).length === 1
    && !!(a.room.expeditions[expId] && (a.room.expeditions[expId].memberIds || []).length === 2));

  a.sock.emit("travel:launch", { id: expId });
  await waitFor(a, () => a.maps.length > 0);
  await waitFor(b, () => b.maps.length > 0);
  const mapA = a.maps[a.maps.length - 1];
  const mapB = b.maps[b.maps.length - 1];
  check("aynı sefer haritası", mapA.id === mapB.id, { a: mapA.id, b: mapB.id });
  check("launch sonrası shared=true", mapA.shared === true && mapB.shared === true, {
    a: mapA.shared, b: mapB.shared,
  });

  await waitFor(a, () => a.mobs && a.mobs.length > 0, 8000);
  await waitFor(b, () => b.mobs && b.mobs.length > 0, 8000);
  const idsA = a.mobs.map((m) => m.i).sort().join(",");
  const idsB = b.mobs.map((m) => m.i).sort().join(",");
  check("aynı canavar ID'leri", idsA === idsB, { idsA, idsB });

  // Hasar yayını.
  const target = a.mobs.find((m) => m.h > 0);
  if (target) {
    a.sock.emit("travel:pos", { x: target.x + 0.5, y: target.y + 0.5 });
    await sleep(150);
    a.sock.emit("travel:atk", { id: target.i, dmg: 120, crit: false, range: 380 });
    await sleep(500);
    check("hasar diğer oyuncuya yayınlandı", b.hits.some((h) => h.i === target.i), { hits: b.hits.length });
  }

  a.sock.close();
  b.sock.close();
  await sleep(200);
  console.log(failures ? `\n${failures} test BAŞARISIZ` : "\nTÜM EXPEDITION TESTLERİ GEÇTİ");
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error("TEST HATASI:", err && err.message);
  process.exit(2);
});
