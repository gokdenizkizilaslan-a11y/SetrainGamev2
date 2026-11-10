"use strict";
/**
 * Ortak canavar dünyası ölçek/trafik testi (3 ve 5 oyuncu).
 *
 *   node scripts/test_shared_scaling.js            (sunucu 3000'de çalışıyor olmalı)
 *
 * Ölçer:
 *  - Oda başına `travel:mobs` paket hızı ve ortalama yük (byte).
 *  - Tüm istemcilerin aynı canavar ID kümesini görmesi.
 *  - Tek oyunculu seferde canavar trafiği olmaması (sunucu simülasyonu uyur).
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
  const box = { tag, sock, maps: [], mobs: null, snapCount: 0, snapBytes: 0, errors: [] };
  sock.on("travel:map", (p) => box.maps.push(p));
  sock.on("travel:mobs", (p) => {
    box.mobs = p.list;
    box.snapCount++;
    box.snapBytes += Buffer.byteLength(JSON.stringify(p), "utf8");
  });
  sock.on("error:msg", (e) => box.errors.push(e && e.message ? e.message : String(e)));
  sock.on("room:state", (s) => { box.room = s; });
  sock.on("self", (p) => { box.self = p; });
  return box;
}

function waitFor(box, fn, ms = 8000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const t = setInterval(() => {
      if (fn()) { clearInterval(t); resolve(true); return; }
      if (Date.now() - t0 > ms) { clearInterval(t); reject(new Error(`${box.tag}: timeout`)); }
    }, 40);
  });
}

async function scenario(n) {
  const cls = pickBaseClass();
  const boxes = Array.from({ length: n }, (_, i) => mk("P" + (i + 1)));
  await Promise.all(boxes.map((b) => new Promise((r) => b.sock.on("connect", r))));
  for (const b of boxes) {
    b.sock.emit("player:setup", { mode: "multi", name: "Scale" + b.tag, character: cls, secret: "" });
  }
  await Promise.all(boxes.map((b) => waitFor(b, () => b.self && b.self.playerId)));

  boxes[0].sock.emit("room:create", { name: "Scale Hall " + n });
  await waitFor(boxes[0], () => boxes[0].room && boxes[0].room.id);
  const roomId = boxes[0].room.id;
  for (let i = 1; i < n; i++) boxes[i].sock.emit("room:join", { roomId });
  await waitFor(boxes[0], () => boxes[0].room && boxes[0].room.players.length === n);
  for (const b of boxes) b.sock.emit("player:ready", { ready: true });
  await sleep(250);
  boxes[0].sock.emit("game:start");
  await waitFor(boxes[0], () => boxes[0].room && boxes[0].room.status === "playing");

  boxes[0].sock.emit("travel:enter", { type: "verdant", size: "normal" });
  await waitFor(boxes[0], () => boxes[0].maps.length > 0);
  const travelId = boxes[0].maps[boxes[0].maps.length - 1].id;
  for (let i = 1; i < n; i++) {
    boxes[i].sock.emit("travel:enter", { type: "verdant", size: "normal", joinId: travelId });
  }
  await Promise.all(boxes.map((b) => waitFor(b, () => b.mobs && b.mobs.length > 0)));

  // 5 saniyelik ölçüm penceresi.
  for (const b of boxes) { b.snapCount = 0; b.snapBytes = 0; }
  const t0 = Date.now();
  await sleep(5000);
  const secs = (Date.now() - t0) / 1000;

  const rates = boxes.map((b) => +(b.snapCount / secs).toFixed(1));
  const avgBytes = boxes.map((b) => b.snapBytes / Math.max(1, b.snapCount));
  const kbps = boxes.map((b) => +((b.snapBytes / secs) / 1024).toFixed(2));
  const ids = boxes.map((b) => (b.mobs || []).map((m) => m.i).sort().join(","));

  console.log(`\n[${n} oyuncu] snapshot/s: ${rates.join(", ")}  |  yük: ${avgBytes.map((v) => v.toFixed(0)).join(", ")} B  |  indirme: ${kbps.join(", ")} KB/s`);
  console.log(`[${n} oyuncu] canavar sayısı: ${(boxes[0].mobs || []).length}`);

  check(`${n}p: tüm istemciler aynı canavar ID'leri`, ids.every((v) => v === ids[0]), { ids });
  check(`${n}p: snapshot ~10 Hz`, rates.every((r) => r >= 8 && r <= 13), { rates });
  check(`${n}p: snapshot yükü < 5 KB`, avgBytes.every((v) => v < 5 * 1024), { avgBytes });
  check(`${n}p: istemci başına trafik < 50 KB/s`, kbps.every((v) => v < 50), { kbps });

  for (const b of boxes) b.sock.close();
  await sleep(300);
  return { rates, kbps, ids };
}

(async () => {
  // Tek oyunculu kontrol: canavar trafiği olmamalı.
  const solo = mk("Solo");
  await new Promise((r) => solo.sock.on("connect", r));
  solo.sock.emit("player:setup", { mode: "single", name: "SoloScale", character: pickBaseClass(), secret: "" });
  await waitFor(solo, () => solo.room && solo.room.id);
  solo.sock.emit("player:ready", { ready: true });
  await sleep(200);
  solo.sock.emit("game:start");
  await waitFor(solo, () => solo.room && solo.room.status === "playing");
  solo.sock.emit("travel:enter", { type: "verdant", size: "normal" });
  await waitFor(solo, () => solo.maps.length > 0);
  await sleep(1500);
  check("solo seferde sunucu canavar trafiği yok", solo.snapCount === 0, { n: solo.snapCount });
  check("solo sefer shared=false", solo.maps[0].shared === false, { shared: solo.maps[0].shared });
  solo.sock.close();
  await sleep(300);

  await scenario(3);
  await scenario(5);

  console.log(failures ? `\n${failures} test BAŞARISIZ` : "\nTÜM ÖLÇEK TESTLERİ GEÇTİ");
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error("TEST HATASI:", err && err.message);
  process.exit(2);
});
