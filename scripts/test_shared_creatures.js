"use strict";
/**
 * Ortak canavar dünyası duman testi (2 oyuncu).
 *
 *   node scripts/test_shared_creatures.js            (sunucu 3000'de çalışıyor olmalı)
 *
 * Doğrular:
 *  1. İki oyuncu aynı haritada aynı canavar ID'lerini görür.
 *  2. İkinci oyuncu girince travel:map `shared:true` olur.
 *  3. Bir oyuncunun hasarı diğerine yayınlanır (travel:mobHit).
 *  4. Ölüm iki tarafta da tek kez bildirilir (travel:mobDead).
 *  5. Ödül canavar başına yalnızca bir kez dağıtılır; eski travel:kill yolu kapalı.
 *  6. Menzil dışı ve aşırı hasar reddedilir / sınırlanır.
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
  const found = list.find((c) => c && !c.baseClass && !c.secret && !c.hidden && c.id);
  return found ? found.id : "warrior";
}

function connect(tag) {
  const sock = io(URL, { transports: ["websocket"], forceNew: true });
  const box = { tag, sock, errors: [], mobs: null, maps: [], hits: [], deaths: [], rewards: [], hp: null };
  sock.on("travel:mobs", (p) => { if (p && Array.isArray(p.list)) box.mobs = p.list; });
  sock.on("travel:mobHit", (p) => box.hits.push(p));
  sock.on("travel:mobDead", (p) => box.deaths.push(p));
  sock.on("travel:killReward", (p) => box.rewards.push(p));
  sock.on("travel:map", (p) => box.maps.push(p));
  sock.on("travel:hp", (p) => { box.hp = p; });
  sock.on("error:msg", (e) => box.errors.push(e && e.message ? e.message : String(e)));
  sock.on("room:state", (s) => { box.room = s; });
  sock.on("self", (p) => { box.self = p; });
  return box;
}

function waitFor(box, fn, ms = 6000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const t = setInterval(() => {
      if (fn()) { clearInterval(t); resolve(true); return; }
      if (Date.now() - t0 > ms) { clearInterval(t); reject(new Error(`${box.tag}: timeout`)); }
    }, 40);
  });
}

(async () => {
  const cls = pickBaseClass();
  const a = connect("A");
  const b = connect("B");
  await Promise.all([
    new Promise((r) => a.sock.on("connect", r)),
    new Promise((r) => b.sock.on("connect", r)),
  ]);

  a.sock.emit("player:setup", { mode: "multi", name: "TesterA", character: cls, secret: "" });
  b.sock.emit("player:setup", { mode: "multi", name: "TesterB", character: cls, secret: "" });
  await waitFor(b, () => b.self && b.self.playerId);

  a.sock.emit("room:create", { name: "Shared Test Hall" });
  await waitFor(a, () => a.room && a.room.id);
  const roomId = a.room.id;

  b.sock.emit("room:join", { roomId });
  await waitFor(b, () => b.room && b.room.id === roomId);
  await waitFor(a, () => a.room && a.room.players && a.room.players.length === 2);

  a.sock.emit("player:ready", { ready: true });
  b.sock.emit("player:ready", { ready: true });
  await sleep(200);
  a.sock.emit("game:start");
  await waitFor(a, () => a.room && a.room.status === "playing");

  // İlk oyuncu sefere çıkar (tek başına: shared = false).
  a.sock.emit("travel:enter", { type: "verdant", size: "normal" });
  await waitFor(a, () => a.maps.length > 0);
  const mapA = a.maps[a.maps.length - 1];
  check("tek oyuncu seferi shared=false", mapA.shared === false, { shared: mapA.shared });

  // İkinci oyuncu aynı sefere katılır -> dünya ortak olur.
  b.sock.emit("travel:enter", { type: "verdant", size: "normal", joinId: mapA.id });
  await waitFor(b, () => b.maps.length > 0);
  const mapB = b.maps[b.maps.length - 1];
  check("2. oyuncu haritası shared=true", mapB.shared === true, { shared: mapB.shared });
  check("aynı harita id", mapB.id === mapA.id, { a: mapA.id, b: mapB.id });

  await waitFor(a, () => Array.isArray(a.mobs) && a.mobs.length > 0);
  await waitFor(b, () => Array.isArray(b.mobs) && b.mobs.length > 0);

  const idsA = a.mobs.map((m) => m.i).sort();
  const idsB = b.mobs.map((m) => m.i).sort();
  check("aynı canavar ID kümesi", JSON.stringify(idsA) === JSON.stringify(idsB), { idsA, idsB });

  const target = a.mobs.find((m) => m.h > 0);
  check("canavar listesi dolu", !!target, { count: a.mobs.length });

  if (target) {
    // Oyuncuları canavarın yanına taşı (sunucu konumu buradan okur).
    for (const box of [a, b]) {
      box.sock.emit("travel:pos", { x: target.x + 0.8, y: target.y + 0.8 });
    }
    await sleep(150);

    // --- Sunucu AI (ölümden ÖNCE): aggro menzilinde ama reach dışında yaklaşmalı.
    const mob1 = (a.mobs || []).find((m) => m.i === target.i);
    if (mob1) {
      const px = mob1.x + 12, py = mob1.y + 0.2;
      a.sock.emit("travel:pos", { x: px, y: py });
      b.sock.emit("travel:pos", { x: px, y: py });
      const d0 = Math.abs(mob1.x - px);
      await sleep(1400);
      const mob2 = (a.mobs || []).find((m) => m.i === target.i);
      const d1 = mob2 ? Math.abs(mob2.x - px) : d0;
      check("sunucu AI canavarı oyuncuya yaklaştırdı", mob2 && d1 < d0 - 0.2, { d0: +d0.toFixed(2), d1: +d1.toFixed(2) });
    }

    // Menzil dışı saldırı reddedilmeli: haritanın uzak köşesinden dev hasar.
    const hpBefore = (a.mobs || []).find((m) => m.i === target.i)?.h ?? target.h;
    a.sock.emit("travel:pos", { x: 3, y: 3 });
    await sleep(120);
    a.sock.emit("travel:atk", { id: target.i, dmg: 999999, crit: true, range: 380 });
    await sleep(250);
    const afterFar = (a.mobs || []).find((m) => m.i === target.i);
    check("menzil dışı saldırı reddedildi", !afterFar || afterFar.h === hpBefore, {
      before: hpBefore, after: afterFar && afterFar.h,
    });

    // Yakına dön, aşırı hasar gönder: tavan uygulanmalı.
    a.sock.emit("travel:pos", { x: target.x + 0.8, y: target.y + 0.8 });
    await sleep(150);
    a.sock.emit("travel:atk", { id: target.i, dmg: 999999, crit: true, range: 380 });
    await waitFor(a, () => a.hits.length > 0, 4000);
    const hit1 = a.hits[a.hits.length - 1];
    check("hasar tavanı uygulandı (tek vuruşta silinmedi)", hit1 && hit1.d > 0 && hit1.d <= target.m, { d: hit1 && hit1.d, m: target.m });
    check("ikinci oyuncu hasarı gördü", b.hits.length > 0, { hits: b.hits.length });
    await sleep(300);
    const seenB = b.hits.find((h) => h.i === target.i);
    check("HP iki tarafta senkron", !!seenB && Math.abs(seenB.h - (hit1 && hit1.h)) <= 1, {
      a: hit1 && hit1.h, b: seenB && seenB.h,
    });

    // Canavarı öldürene kadar vur (110 ms aralık).
    for (let i = 0; i < 60; i++) {
      const cur = (a.mobs || []).find((m) => m.i === target.i);
      if (!cur || cur.h <= 0) break;
      a.sock.emit("travel:pos", { x: cur.x + 0.8, y: cur.y + 0.8 });
      a.sock.emit("travel:atk", { id: target.i, dmg: Math.ceil(target.m * 0.3), crit: false, range: 380 });
      await sleep(130);
    }
    await sleep(400);
    check("ölüm iki tarafta da bildirildi", a.deaths.length >= 1 && b.deaths.length >= 1, {
      a: a.deaths.length, b: b.deaths.length,
    });
    check("ölüm tek kez (A)", a.deaths.filter((d) => d.i === target.i).length === 1);
    check("ölüm tek kez (B)", b.deaths.filter((d) => d.i === target.i).length === 1);

    const rewardA = a.rewards.filter((r) => r.kind === target.k);
    check("ödül bir kez (A)", rewardA.length === 1, { n: rewardA.length });
    check("ödül xp/gold > 0", rewardA[0] && rewardA[0].xp > 0 && rewardA[0].gold >= 0, rewardA[0] || null);

    // Eski istemci yolu: shared dünyada travel:kill ödül vermemeli.
    const rewardsBefore = a.rewards.length;
    a.sock.emit("travel:kill", { kind: target.k });
    await sleep(350);
    check("shared dünyada travel:kill ödül vermez", a.rewards.length === rewardsBefore, {
      before: rewardsBefore, after: a.rewards.length,
    });

    // Yeniden doğma: bir süre sonra listede yeni canavar belirmeli.
    await waitFor(a, () => (a.mobs || []).length > 0, 15000).catch(() => null);
    check("canavar listesi yeniden doluyor", (a.mobs || []).length > 0, { n: (a.mobs || []).length });
  }

  a.sock.close();
  b.sock.close();
  await sleep(200);
  console.log(failures ? `\n${failures} test BAŞARISIZ` : "\nTÜM TESTLER GEÇTİ");
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error("TEST HATASI:", err && err.message);
  process.exit(2);
});
