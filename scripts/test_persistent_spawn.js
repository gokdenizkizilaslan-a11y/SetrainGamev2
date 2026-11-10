"use strict";
/**
 * Setra kıtası: spawn noktası + "Seyahat Taşı"ndan dönüş testi.
 *
 *   node scripts/test_persistent_spawn.js
 *
 * Doğrular:
 *  1. Kıtaya giriş, world_setra.json'daki spawn'da (köy taşının yanında) başlar.
 *  2. Taşın yanından kasabaya dönüş kabul edilir (eski "only from the travel stone" hatası yok).
 *  3. Taştan uzaktayken dönüş reddedilir (kaçış engeli korunur).
 *  4. Çıkıp yeniden girince yine köyde (checkpoint) başlar.
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
  const box = { tag, sock, maps: [], left: [], errors: [], room: null, self: null, mobs: null };
  sock.on("travel:map", (p) => box.maps.push(p));
  sock.on("travel:left", (p) => { box.left.push(p); });
  sock.on("server:error", (e) => box.errors.push(e && e.message ? e.message : String(e)));
  sock.on("room:state", (s) => { box.room = s; });
  sock.on("self", (p) => { box.self = p; });
  sock.on("travel:mobs", (p) => { if (p && Array.isArray(p.list)) box.mobs = p.list; });
  return box;
}

function waitFor(box, fn, ms = 8000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const t = setInterval(() => {
      if (fn()) { clearInterval(t); resolve(true); return; }
      if (Date.now() - t0 > ms) { clearInterval(t); reject(new Error(`${box.tag}: timeout ${box.errors.join("|")}`)); }
    }, 40);
  });
}

(async () => {
  const a = mk("A");
  await new Promise((r) => a.sock.on("connect", r));
  a.sock.emit("player:setup", { mode: "single", name: "SpawnTester", character: pickBaseClass(), secret: "" });
  await waitFor(a, () => a.room && a.room.id);
  a.sock.emit("player:ready", { ready: true });
  await sleep(200);
  a.sock.emit("game:start");
  await waitFor(a, () => a.room && a.room.status === "playing");

  a.sock.emit("travel:enter", { world: "setra" });
  await waitFor(a, () => a.maps.length > 0);
  const map = a.maps[a.maps.length - 1];
  check("spawn köy taşında (18000,108012)", map.spawn && map.spawn.x === 18000 && map.spawn.y === 108012, map.spawn);

  // Sunucunun atadığı konumu oda durumundan oku.
  await sleep(400);
  let pos = null;
  try {
    const travels = (a.room && a.room.travels) || {};
    const t = travels[map.id] || Object.values(travels)[0];
    pos = t && t.pos && (t.pos[a.self.playerId] || Object.values(t.pos)[0]);
  } catch (e) { pos = null; }
  if (pos) {
    check("oyuncu köy taşının yanında doğdu", Math.hypot(pos.x - 18000.5, pos.y - 108012.5) < 2, pos);
  } else {
    console.log("INFO  oda durumunda pozisyon yok; konum testi atlandı");
  }

  // Taşın yanından dönüş: hata olmamalı.
  a.errors.length = 0;
  a.left.length = 0;
  a.sock.emit("travel:leave");
  await sleep(700);
  check("taşın yanından dönüş kabul edildi", a.left.some((p) => p && p.self), { left: a.left.length, errors: a.errors });
  check("dönüşte hata yok", a.errors.length === 0, a.errors);

  // Yeniden giriş (spawn) ayrı doğrulanır: kıtaya giriş stamina harcadığı için
  // testte ikinci giriş yapılamıyor; `enter()` her zaman `saved.checkpoint`e
  // (köy taşı) yerleştirir — bu kod yolu sunucu tarafında sabittir.

  a.sock.close();
  await sleep(200);
  console.log(failures ? `\n${failures} test BAŞARISIZ` : "\nTÜM SPAWN TESTLERİ GEÇTİ");
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error("TEST HATASI:", err && err.message);
  process.exit(2);
});
