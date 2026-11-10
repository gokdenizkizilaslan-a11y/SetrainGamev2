#!/usr/bin/env node
/**
 * SETRA — build_villages.js
 * Görseldeki köyü (plaza + kavşak yolu + evler + pazar + kamp ateşi) ŞABLON olarak ölçer ve
 * dosyadaki yerleşimlere basar. Çit-ızgara karmaşasını siler.
 *
 *   node build_villages.js world_setra_1.json world_setra_2.json [--spread 1.3] [--zoom 2] [--facing 0] [--preview village_preview.png]
 *
 *  --spread  köy sıklığı. 1.0 = görseldeki gibi sıkı, 1.3 = biraz ferah (varsayılan; hitbox'lar takılmasın diye)
 *  --zoom    ekran px / dünya px (oyun kamerası). Görseli ölçeklemek için kullanılıyor. Varsayılan 2.
 *  --facing  evlerin kapı yönü düzeltmesi (radyan). Evler 90° dönük çıkarsa 1.5708 / 3.1416 / 4.7124 dene.
 *  MODEL EŞLEMESİ: aşağıdaki T tablosundaki model adlarını (3. sütun) değiştirerek hangi ev hangi modelle çizilsin ayarla.
 */
"use strict";
const fs = require("fs");
const argv = process.argv.slice(2), files = [], opt = { spread: 1.3, zoom: 2, refscale: 0.545, facing: 0, seed: 7, preview: "" };
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith("--")) { const k = argv[i].slice(2), v = argv[++i]; opt[k] = isNaN(parseFloat(v)) ? v : parseFloat(v); } else files.push(argv[i]); }
const IN = files[0] || "world_setra_1.json", OUT = files[1] || "world_setra_2.json";
const world = JSON.parse(fs.readFileSync(IN, "utf8"));
function rng(a) { return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(opt.seed), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ======================= ŞABLON (görselden ölçüldü) =======================
// Her satır: [rol, model, ref_x, ref_y, tier, tür]   ref = görseldeki ZEMİNE OTURDUĞU nokta (piksel)
// Plaza merkezi (obelisk) = (522,328).   tier 1=her yerleşim, 2=kasaba+köy, 3=sadece büyük köy
// tür: house = plazaya dönük döner | prop = rastgele döner | lamp | camp
const ORIGIN = [522, 328];
const T = [
  ["inn",      "tavern",      632, 262, 1, "house"],   // POI olarak yerleşir (setra_inn vb.)
  ["barn",     "barn",        795, 368, 1, "house"],
  ["cottage1", "hut",         288, 555, 1, "house"],
  ["cottage2", "hut",         445, 512, 1, "house"],
  ["brown",    "stonehouse",  415, 270, 2, "house"],
  ["thatch",   "longhouse",   717, 185, 2, "house"],
  ["smithy",   "smithy",      192, 415, 2, "house"],
  ["cottage3", "hut",         398, 565, 2, "house"],
  ["stall1",   "stall",       385, 372, 2, "house"],
  ["stall2",   "stall",       430, 398, 2, "house"],
  ["farm",     "farmhouse",   318, 105, 3, "house"],
  ["blue",     "stonehouse",  428, 115, 3, "house"],
  ["round",    "hut",         192, 190, 3, "house"],
  ["chapel",   "chapel",      590, 470, 3, "house"],
  ["windmill", "windmill",    945, 115, 3, "house"],
  ["stall3",   "stall",       628, 380, 3, "house"],
  ["cart",     "cart",        330, 190, 3, "prop"],
  // barn çevresi
  ["hay",      "haybales",    735, 382, 1, "prop"], ["hay", "haybales", 828, 385, 1, "prop"], ["crate", "applecrates", 776, 398, 2, "prop"],
  // tavern çevresi
  ["crate",    "applecrates", 690, 268, 3, "prop"], ["hay", "haybales", 718, 262, 3, "prop"],
  // kahverengi ev çevresi
  ["hay",      "haybales",    478, 228, 2, "prop"], ["barrel", "barrels", 470, 258, 2, "prop"], ["barrel", "barrels", 506, 248, 2, "prop"], ["crate", "applecrates", 566, 248, 3, "prop"],
  // demirci çevresi
  ["barrel",   "barrels",     130, 425, 2, "prop"], ["barrel", "barrels", 152, 433, 2, "prop"], ["barrel", "barrels", 250, 400, 2, "prop"], ["barrel", "barrels", 258, 408, 2, "prop"],
  // kamp ateşi
  ["fire",     "campfire",    355, 492, 1, "camp"], ["log", "logs", 315, 472, 1, "prop"], ["log", "logs", 385, 472, 1, "prop"],
  // lambalar ve tabela
  ["lamp", "lamp", 522, 250, 1, "lamp"], ["lamp", "lamp", 648, 332, 1, "lamp"], ["lamp", "lamp", 388, 306, 2, "lamp"], ["lamp", "lamp", 268, 372, 2, "lamp"], ["lamp", "lamp", 162, 527, 3, "lamp"], ["lamp", "lamp", 60, 532, 3, "lamp"],
  ["sign", "banner", 868, 250, 3, "prop"],
];
const ROCKS = [[425, 420], [500, 428], [582, 508], [668, 490], [597, 84], [580, 152], [762, 214], [968, 378], [440, 590]]; // tier 2+
// zemin ayak izi yarıçapı (dünya px) — sadece çakışma kontrolü için
const FOOT = { tavern: 62, barn: 66, farmhouse: 52, stonehouse: 48, hut: 40, longhouse: 58, smithy: 52, chapel: 52, windmill: 52, stall: 34, cart: 26, barrels: 20, applecrates: 20, haybales: 24, lamp: 8, banner: 14, campfire: 26, logs: 22, well: 26, rocks: 12 };

// ======================= CEPHE (KAPI) DÜZELTMESİ =======================
// SÖZLEŞME: modellerin kapısı local +Z yönündedir → aşağıdaki hesap doğrudur.
// Bir model farklı export edilmişse buraya radyan yaz (trees3d.js FRONT_DEG ile aynı):
//   +Z = 0 | +X = Math.PI/2 | -Z = Math.PI | -X = 3*Math.PI/2
//   örn. kapısı arkada export edilmiş ev:  { hut: Math.PI }
// Kontrol: oyunda Setra3DTrees.contactSheet("hut") → kapı hangi rot'ta görünüyor.
const FACING = {
  // hut: Math.PI,
};

// ======================= ölçek tabloları (dosyandaki mevcut değerler) =======================
const stat = {};
for (const s of world.structures) { const m = stat[s.model] || (stat[s.model] = { sc: [], so: {} }); m.sc.push(s.scale); m.so[s.solidRadius] = (m.so[s.solidRadius] || 0) + 1; }
const med = a => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
const scaleOf = m => stat[m] ? med(stat[m].sc) : 1;
const solidOf = m => { const s = stat[m]; if (!s) return 0.5; return +Object.entries(s.so).sort((a, b) => b[1] - a[1])[0][0]; };

// ======================= dönüşümler =======================
const COS = Math.cos(Math.PI / 6), SIN = 0.5;
function refToLocal(rx, ry) { const dx = (rx - ORIGIN[0]) / opt.refscale / opt.zoom, dy = (ry - ORIGIN[1]) / opt.refscale / opt.zoom; return [(dx / COS + dy / SIN) / 2 * opt.spread, (dy / SIN - dx / COS) / 2 * opt.spread]; }
const rot = (v, th) => [v[0] * Math.cos(th) - v[1] * Math.sin(th), v[0] * Math.sin(th) + v[1] * Math.cos(th)];
const axisIdx = v => ((Math.round(Math.atan2(v[1], v[0]) / (Math.PI / 2)) % 4) + 4) % 4;   // 0:+x 1:+y 2:-x 3:-y
const AX = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// ======================= yerleşimler =======================
const SET = [
  { id: "setra", poi: "setra_village", inn: "setra_inn", tier: 3, radius: 950, obelisk: true },
  { id: "greenford", poi: "greenford_inn", inn: "greenford_inn", tier: 2, radius: 800 },
  { id: "crossroads", poi: "crossroads_inn", inn: "crossroads_inn", tier: 1, radius: 650 },
  { id: "frostpass", poi: "frost_pass", inn: "frost_pass", tier: 1, radius: 650 },
];
const poiBy = Object.fromEntries(world.pois.map(p => [p.id, p]));
const LEG = 620, report = [], plans = [];
let uid = 0;

for (const st of SET) {
  const anchor = [poiBy[st.poi].x, poiBy[st.poi].y]; let C = anchor, bd = 400;
  if (!st.obelisk) for (const r of world.roads) for (const p of r.points) { const d = dist(p, anchor); if (d < bd) { bd = d; C = [p[0], p[1]]; } }
  // 1) yolların köyden çıkan kolları
  const legs = [];
  for (const r of world.roads) {
    let i0 = -1, m = 250; r.points.forEach((p, i) => { const d = dist(p, C); if (d < m) { m = d; i0 = i; } }); if (i0 < 0) continue;
    let ia = i0, ib = i0; while (ia > 0 && dist(r.points[ia], C) < LEG * 1.6) ia--; while (ib < r.points.length - 1 && dist(r.points[ib], C) < LEG * 1.6) ib++;
    if (i0 > 0) legs.push({ r, i0, kind: "in", far: r.points[ia], idx: ia });
    if (i0 < r.points.length - 1) legs.push({ r, i0, kind: "out", far: r.points[ib], idx: ib });
  }
  const prio = l => (l.r.id === "kingsroad" ? 0 : 1) + (l.kind === "out" ? 0 : 0.5);
  legs.sort((a, b) => prio(a) - prio(b));
  const taken = new Set(); let mainAxis = null;
  for (const l of legs) {
    const v = [l.far[0] - C[0], l.far[1] - C[1]], ang = Math.atan2(v[1], v[0]), cand = [0, 1, 2, 3].sort((a, b) => Math.abs(Math.atan2(Math.sin(ang - a * Math.PI / 2), Math.cos(ang - a * Math.PI / 2))) - Math.abs(Math.atan2(Math.sin(ang - b * Math.PI / 2), Math.cos(ang - b * Math.PI / 2))));
    l.axis = cand.find(a => !taken.has(a)); if (l.axis != null) taken.add(l.axis); if (mainAxis == null && l.axis != null) mainAxis = l.axis;
  }
  if (mainAxis == null) mainAxis = 3;
  const theta = ((mainAxis - 3 + 4) % 4) * Math.PI / 2;           // şablonun kuzey çıkışı = ana yol
  // 2) yol kollarını eksene düzleştir
  for (const l of legs) {
    if (l.axis == null) continue; const d = AX[l.axis], pts = l.r.points, mk = k => [Math.round(C[0] + d[0] * k), Math.round(C[1] + d[1] * k)];
    const line = []; for (let k = 150; k <= LEG; k += 150) line.push(mk(k));
    if (l.kind === "out") { pts.splice(l.i0, l.idx - l.i0, [Math.round(C[0]), Math.round(C[1])], ...line); }
    else { pts.splice(l.idx + 1, l.i0 - l.idx, ...line.reverse(), [Math.round(C[0]), Math.round(C[1])]); }
    // splice sonrası diğer bacağın indeksleri kaydığı için ikinci bacak için yeniden bul
    for (const o of legs) if (o !== l && o.r === l.r) { let i0 = -1, m = 250; o.r.points.forEach((p, i) => { const dd = dist(p, C); if (dd < m) { m = dd; i0 = i; } }); o.i0 = i0; if (o.kind === "out") { let ib = i0; while (ib < pts.length - 1 && dist(pts[ib], C) < LEG * 1.6) ib++; o.idx = ib; } else { let ia = i0; while (ia > 0 && dist(pts[ia], C) < LEG * 1.6) ia--; o.idx = ia; } }
  }
  // 3) eski yapı/propları sil
  const inside = o => dist([o.x, o.y], C) < st.radius;
  const removed = world.structures.filter(inside), tints = {}; removed.forEach(s => { if (s.tint) tints[s.tint] = (tints[s.tint] || 0) + 1; });
  const tint = Object.entries(tints).sort((a, b) => b[1] - a[1])[0]; const tintV = tint ? tint[0] : null;
  world.structures = world.structures.filter(s => !inside(s)); const pb = world.props.length; world.props = world.props.filter(p => !inside(p));
  // 4) şablonu yerleştir
  const items = [];
  for (const [role, model, rx, ry, tier, kind] of T) {
    if (tier > st.tier) continue; const loc = refToLocal(rx, ry), w = rot(loc, theta);
    items.push({ role, model, kind, loc, x: C[0] + w[0], y: C[1] + w[1], r: FOOT[model] || 20, fixed: role === "inn" });
  }
  if (!st.obelisk) items.push({ role: "well", model: "well", kind: "prop", loc: [0, 0], x: C[0], y: C[1], r: FOOT.well, fixed: true });
  // yol engelleri + plaza (sabit)
  const obst = [{ x: C[0], y: C[1], r: 70 * opt.spread + 20 }];
  for (const l of legs) if (l.axis != null) for (let k = 120; k <= LEG; k += 80) obst.push({ x: C[0] + AX[l.axis][0] * k, y: C[1] + AX[l.axis][1] * k, r: 46 });
  for (let it = 0; it < 300; it++) for (const a of items) {
    if (a.fixed) continue;
    for (const o of obst) { const d = Math.hypot(a.x - o.x, a.y - o.y), min = (a.kind === "lamp" ? 6 : a.r) + o.r + 6; if (d < min) { a.x += (a.x - o.x) / (d || 1) * (min - d); a.y += (a.y - o.y) / (d || 1) * (min - d); } }
    for (const b of items) { if (a === b) continue; const d = Math.hypot(a.x - b.x, a.y - b.y), min = (a.kind === "lamp" || b.kind === "lamp" ? 0.5 : 0.8) * (a.r + b.r); if (d < min) { const u = (min - d) / 2, nx = (a.x - b.x) / (d || 1), ny = (a.y - b.y) / (d || 1); a.x += nx * u * (b.fixed ? 2 : 1); a.y += ny * u * (b.fixed ? 2 : 1); if (!b.fixed) { b.x -= nx * u; b.y -= ny * u; } } }
  }
  const mkS = (it) => {
    let rt;
    if (it.kind === "house") { const d = [-it.loc[0], -it.loc[1]], dd = Math.abs(d[0]) > Math.abs(d[1]) ? [Math.sign(d[0]), 0] : [0, Math.sign(d[1])]; rt = Math.atan2(-dd[0], dd[1]) + theta + (FACING[it.model] || 0) + opt.facing; }
    else if (it.kind === "lamp") rt = 0; else rt = Math.floor(R() * 4) * Math.PI / 2 + (R() - 0.5) * 0.5;
    rt = ((rt % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const s = { model: it.model, x: Math.round(it.x * 10) / 10, y: Math.round(it.y * 10) / 10, scale: Math.round(scaleOf(it.model) * (0.96 + R() * 0.08) * 100) / 100, rot: Math.round(rt * 100) / 100, solidRadius: solidOf(it.model) };
    if (tintV) s.tint = tintV; return s;
  };
  let added = 0;
  for (const it of items) {
    if (it.role === "inn") { const p = poiBy[st.inn]; p.x = Math.round(it.x); p.y = Math.round(it.y); it.placed = true; continue; }
    world.structures.push(mkS(it)); added++;
  }
  // süs kayaları
  const rocks = []; if (st.tier >= 2) for (const [rx, ry] of ROCKS) { const w = rot(refToLocal(rx, ry), theta), x = C[0] + w[0], y = C[1] + w[1]; if (obst.some(o => Math.hypot(x - o.x, y - o.y) < o.r + 14) || items.some(i => Math.hypot(x - i.x, y - i.y) < i.r)) continue; world.props.push({ id: "vr" + (uid++).toString(36), gen: "village_v1", x: Math.round(x), y: Math.round(y), type: "glb", model: "rocks", scale: Math.round((0.4 + R() * 0.2) * 100) / 100, rot: Math.round(R() * 628) / 100, solidRadius: 0.15 }); rocks.push([x, y]); }
  // plaza + kavşak yolları
  const rd = (id, w, a, b) => world.roads.push({ id, width: w, points: [[Math.round(a[0]), Math.round(a[1])], [Math.round(b[0]), Math.round(b[1])]] });
  const ax = AX[mainAxis], px = [-ax[1], ax[0]], pl = 120 * opt.spread;
  rd("plaza_" + st.id + "_a", Math.round(110 * opt.spread), [C[0] - ax[0] * pl, C[1] - ax[1] * pl], [C[0] + ax[0] * pl, C[1] + ax[1] * pl]);
  rd("plaza_" + st.id + "_b", Math.round(110 * opt.spread), [C[0] - px[0] * pl, C[1] - px[1] * pl], [C[0] + px[0] * pl, C[1] + px[1] * pl]);
  const wAxis = AX[(mainAxis + 1) % 4]; // şablondaki batı kolu (ref'te sol-üst çıkıntı)
  const wIdx = (mainAxis + 3) % 4; if (!taken.has(wIdx)) { const w = AX[wIdx]; rd("spur_" + st.id, 56, C, [C[0] + w[0] * 330 * opt.spread, C[1] + w[1] * 330 * opt.spread]); }
  plans.push({ st, C, theta, items, obst, legs: legs.filter(l => l.axis != null).map(l => AX[l.axis]), rocks });
  report.push(`${st.id.padEnd(11)} merkez ${Math.round(C[0])},${Math.round(C[1])}  silinen yapı ${removed.length}, prop ${pb - world.props.length + rocks.length}  eklenen yapı ${added}  dönüş ${Math.round(theta * 180 / Math.PI)}°  tint ${tintV || "-"}`);
}
world.version = (world.version || 3) + 1;
world.meta = Object.assign(world.meta || {}, { villages: "build_villages.js", spread: opt.spread, zoom: opt.zoom });
fs.writeFileSync(OUT, JSON.stringify(world));
console.log(report.join("\n") + `\nyazıldı: ${OUT}`);

// ======================= şematik önizleme =======================
if (opt.preview) {
  let createCanvas; try { createCanvas = require("canvas").createCanvas; } catch (e) { console.log("önizleme için: npm i canvas"); process.exit(0); }
  const cw = 1500, ch = 1100 * Math.ceil(plans.length / 2) / 1, cv = createCanvas(cw, 1120 * 2), x = cv.getContext("2d");
  x.fillStyle = "#4f8a3c"; x.fillRect(0, 0, cv.width, cv.height);
  plans.forEach((pl, k) => {
    const ox = (k % 2) * 750 + 375, oy = Math.floor(k / 2) * 1120 + 560, Z = 0.75;
    const P = (wx, wy) => [ox + ((wx - pl.C[0]) - (wy - pl.C[1])) * COS * Z, oy + ((wx - pl.C[0]) + (wy - pl.C[1])) * SIN * Z];
    x.save(); x.beginPath(); x.rect((k % 2) * 750, Math.floor(k / 2) * 1120, 750, 1120); x.clip();
    x.fillStyle = "#4f8a3c"; x.fillRect((k % 2) * 750, Math.floor(k / 2) * 1120, 750, 1120);
    // yollar
    x.lineCap = "butt"; x.strokeStyle = "#a07a4e";
    for (const r of world.roads) { const near = r.points.some(p => dist(p, pl.C) < 900); if (!near) continue; x.lineWidth = r.width * Z * 1.1; x.beginPath(); let first = true; for (const p of r.points) { if (dist(p, pl.C) > 1400) { first = true; continue; } const q = P(p[0], p[1]); first ? x.moveTo(q[0], q[1]) : x.lineTo(q[0], q[1]); first = false; } x.stroke(); }
    // yapılar (ayak izi karesi + kutu)
    const boxes = pl.items.slice().sort((a, b) => (a.x + a.y) - (b.x + b.y));
    const col = { house: "#c9a36a", prop: "#8a6a3a", lamp: "#ffd54f", camp: "#ff7043" };
    for (const it of boxes) {
      const r = it.r * 0.9, c = [[-r, -r], [r, -r], [r, r], [-r, r]].map(([dx, dy]) => P(it.x + dx, it.y + dy)), h = it.kind === "house" ? it.r * 1.4 * Z : it.kind === "lamp" ? 30 : 10;
      x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); c.forEach((q, i) => i ? x.lineTo(q[0] + 6, q[1] + 4) : x.moveTo(q[0] + 6, q[1] + 4)); x.fill();
      x.fillStyle = it.role === "inn" ? "#d9534f" : col[it.kind] || "#999"; x.beginPath(); c.forEach((q, i) => i ? x.lineTo(q[0], q[1] - h) : x.moveTo(q[0], q[1] - h)); x.fill();
      x.strokeStyle = "rgba(0,0,0,.5)"; x.lineWidth = 1; x.stroke();
      if (it.kind === "house") { x.fillStyle = "#000"; x.font = "11px sans-serif"; const q = P(it.x, it.y); x.fillText(it.model, q[0] - 18, q[1] - h - 4); }
    }
    const c0 = P(pl.C[0], pl.C[1]); x.fillStyle = "#22d3ee"; x.beginPath(); x.arc(c0[0], c0[1] - 12, 9, 0, 7); x.fill();
    x.fillStyle = "#000"; x.font = "bold 16px sans-serif"; x.fillText(pl.st.id + "  (şematik — gerçek modeller oyunda)", (k % 2) * 750 + 12, Math.floor(k / 2) * 1120 + 24);
    x.restore();
  });
  fs.writeFileSync(opt.preview, cv.toBuffer("image/png"));
}
