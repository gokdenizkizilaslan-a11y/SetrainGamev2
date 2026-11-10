#!/usr/bin/env node
"use strict";
/**
 * SETRA â€” build_villages_v2.js
 * Claude'un ÅŸablonunu (plaza + kavÅŸak + evler + pazar + kamp) TEMÄ°Z ve
 * TEKRAR Ã‡ALIÅTIRILABÄ°LÄ°R biÃ§imde dÃ¼nyaya basar.
 *
 * Farklar (v1'e gÃ¶re):
 *  1) TEKRAR Ã‡ALIÅTIRILABÄ°LÄ°R: ilk Ã§alÄ±ÅŸtÄ±rmada yollar + POI konumlarÄ±
 *     `meta._villageBackup` iÃ§ine yedeklenir. Sonraki Ã§alÄ±ÅŸtÄ±rmada her ÅŸey
 *     geri alÄ±nÄ±p sÄ±fÄ±rdan kurulur (plaza yollarÄ± "kÃ¶y kolu" sanÄ±lmaz).
 *  2) GRUP ETÄ°KETÄ°: Ã¼retilen her yapÄ± / prop / yol `village: "<id>"` taÅŸÄ±r.
 *     EditÃ¶r (veya scripts/village_move.js) bir kÃ¶yÃ¼ tek katman gibi taÅŸÄ±r.
 *  3) SU / YOL / EÄÄ°M KONTROLÃœ: her eleman setraWorldCore ile doÄŸrulanÄ±r;
 *     suya veya baÅŸka yolun Ã¼stÃ¼ne dÃ¼ÅŸen eleman kÃ¶y merkezine doÄŸru itilir.
 *  4) Ã‡IKTI: okunabilir (2 boÅŸluklu) JSON, version +1.
 *
 *   node scripts/build_villages_v2.js world_setra.json world_setra.new.json \
 *        [--spread 1.3] [--facing 0] [--zoom 2] [--refscale 0.545]
 */
const fs = require("fs");
const path = require("path");
const core = require(path.join(__dirname, "..", "public", "js", "setraWorldCore.js"));

const argv = process.argv.slice(2), files = [];
const opt = { spread: 1.3, zoom: 2, refscale: 0.545, facing: 0, seed: 7 };
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) { const k = argv[i].slice(2), v = argv[++i]; opt[k] = isNaN(parseFloat(v)) ? v : parseFloat(v); }
  else files.push(argv[i]);
}
const IN = files[0], OUT = files[1];
if (!IN || !OUT) { console.error("kullanÄ±m: node scripts/build_villages_v2.js IN OUT [--spread 1.3] [--facing 0]"); process.exit(1); }

const world = JSON.parse(fs.readFileSync(IN, "utf8"));
const R = (() => { let a = opt.seed; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ---------------- geri alma (tekrar Ã§alÄ±ÅŸtÄ±rma gÃ¼venliÄŸi) ----------------
world.meta = world.meta || {};
const backup = world.meta._villageBackup;
if (backup && Array.isArray(backup.roads)) {
  world.roads = JSON.parse(JSON.stringify(backup.roads));
  for (const p of backup.pois || []) {
    const t = world.pois.find((q) => q.id === p.id);
    if (t) { t.x = p.x; t.y = p.y; }
  }
  world.structures = world.structures.filter((s) => !s.village);
  world.props = (world.props || []).filter((p) => !p.village);
  console.log("[v2] Ã¶nceki kÃ¶y katmanÄ± geri alÄ±ndÄ± (yollar + POI + etiketli elemanlar).");
} else {
  world.meta._villageBackup = {
    roads: JSON.parse(JSON.stringify(world.roads)),
    pois: world.pois.map((p) => ({ id: p.id, x: p.x, y: p.y })),
    at: Date.now(),
  };
}

// ---------------- ÅŸablon (Claude'un Ã¶lÃ§Ã¼mÃ¼) ----------------
const ORIGIN = [522, 328];
const T = [
  ["inn", "tavern", 632, 262, 1, "house"],
  ["barn", "barn", 795, 368, 1, "house"],
  ["cottage1", "hut", 288, 555, 1, "house"],
  ["cottage2", "hut", 445, 512, 1, "house"],
  ["brown", "stonehouse", 415, 270, 2, "house"],
  ["thatch", "longhouse", 717, 185, 2, "house"],
  ["smithy", "smithy", 192, 415, 2, "house"],
  ["cottage3", "hut", 398, 565, 2, "house"],
  ["stall1", "stall", 385, 372, 2, "house"],
  ["stall2", "stall", 430, 398, 2, "house"],
  ["farm", "farmhouse", 318, 105, 3, "house"],
  ["blue", "stonehouse", 428, 115, 3, "house"],
  ["round", "hut", 192, 190, 3, "house"],
  ["chapel", "chapel", 590, 470, 3, "house"],
  ["windmill", "windmill", 945, 115, 3, "house"],
  ["stall3", "stall", 628, 380, 3, "house"],
  ["cart", "cart", 330, 190, 3, "prop"],
  ["hay", "haybales", 735, 382, 1, "prop"], ["hay", "haybales", 828, 385, 1, "prop"],
  ["crate", "applecrates", 776, 398, 2, "prop"], ["crate", "applecrates", 690, 268, 3, "prop"],
  ["hay", "haybales", 718, 262, 3, "prop"], ["hay", "haybales", 478, 228, 2, "prop"],
  ["barrel", "barrels", 470, 258, 2, "prop"], ["barrel", "barrels", 506, 248, 2, "prop"],
  ["crate", "applecrates", 566, 248, 3, "prop"],
  ["barrel", "barrels", 130, 425, 2, "prop"], ["barrel", "barrels", 152, 433, 2, "prop"],
  ["barrel", "barrels", 250, 400, 2, "prop"], ["barrel", "barrels", 258, 408, 2, "prop"],
  ["fire", "campfire", 355, 492, 1, "camp"], ["log", "logs", 315, 472, 1, "prop"],
  ["log", "logs", 385, 472, 1, "prop"],
  ["lamp", "lamp", 522, 250, 1, "lamp"], ["lamp", "lamp", 648, 332, 1, "lamp"],
  ["lamp", "lamp", 388, 306, 2, "lamp"], ["lamp", "lamp", 268, 372, 2, "lamp"],
  ["lamp", "lamp", 162, 527, 3, "lamp"], ["lamp", "lamp", 60, 532, 3, "lamp"],
  ["sign", "banner", 868, 250, 3, "prop"],
];
const ROCKS = [[425, 420], [500, 428], [582, 508], [668, 490], [597, 84], [580, 152], [762, 214], [968, 378], [440, 590]];
const FOOT = { tavern: 62, barn: 66, farmhouse: 52, stonehouse: 48, hut: 40, longhouse: 58, smithy: 52, chapel: 52, windmill: 52, stall: 34, cart: 26, barrels: 20, applecrates: 20, haybales: 24, lamp: 8, banner: 14, campfire: 26, logs: 22, well: 26, rocks: 12 };

const COS = Math.cos(Math.PI / 6), SIN = 0.5;
const AX = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const refToLocal = (rx, ry) => {
  const dx = (rx - ORIGIN[0]) / opt.refscale / opt.zoom;
  const dy = (ry - ORIGIN[1]) / opt.refscale / opt.zoom;
  return [((dx / COS + dy / SIN) / 2) * opt.spread, ((dy / SIN - dx / COS) / 2) * opt.spread];
};
const rotv = (v, th) => [v[0] * Math.cos(th) - v[1] * Math.sin(th), v[0] * Math.sin(th) + v[1] * Math.cos(th)];

const stat = {};
for (const s of world.structures) {
  const m = stat[s.model] || (stat[s.model] = { sc: [], so: {} });
  m.sc.push(s.scale); m.so[s.solidRadius] = (m.so[s.solidRadius] || 0) + 1;
}
const med = (a) => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
const scaleOf = (m) => (stat[m] ? med(stat[m].sc) : 1);
const solidOf = (m) => (stat[m] ? +Object.entries(stat[m].so).sort((a, b) => b[1] - a[1])[0][0] : 0.5);

// ---------------- yerleÅŸimler (grup etiketi = id) ----------------
const SET = [
  { id: "setra", poi: "setra_village", inn: "setra_inn", tier: 3, radius: 950, obelisk: true },
  { id: "greenford", poi: "greenford_inn", inn: "greenford_inn", tier: 2, radius: 800 },
  { id: "crossroads", poi: "crossroads_inn", inn: "crossroads_inn", tier: 1, radius: 650 },
  { id: "frostpass", poi: "frost_pass", inn: "frost_pass", tier: 1, radius: 650 },
];
const poiBy = Object.fromEntries(world.pois.map((p) => [p.id, p]));
const LEG = 620, report = [];
let uid = 0;

for (const st of SET) {
  const anchorPoi = poiBy[st.poi];
  if (!anchorPoi) { console.warn("[v2] POI yok:", st.poi); continue; }
  const anchor = [anchorPoi.x, anchorPoi.y];
  let C = anchor, bd = 400;
  if (!st.obelisk) for (const r of world.roads) for (const p of r.points) { const d = dist(p, anchor); if (d < bd) { bd = d; C = [p[0], p[1]]; } }

  // 1) kÃ¶yden Ã§Ä±kan yol kollarÄ±
  const legs = [];
  for (const r of world.roads) {
    let i0 = -1, m = 250;
    r.points.forEach((p, i) => { const d = dist(p, C); if (d < m) { m = d; i0 = i; } });
    if (i0 < 0) continue;
    let ia = i0, ib = i0;
    while (ia > 0 && dist(r.points[ia], C) < LEG * 1.6) ia--;
    while (ib < r.points.length - 1 && dist(r.points[ib], C) < LEG * 1.6) ib++;
    if (i0 > 0) legs.push({ r, i0, kind: "in", far: r.points[ia], idx: ia });
    if (i0 < r.points.length - 1) legs.push({ r, i0, kind: "out", far: r.points[ib], idx: ib });
  }
  legs.sort((a, b) => ((a.r.id === "kingsroad" ? 0 : 1) + (a.kind === "out" ? 0 : 0.5)) - ((b.r.id === "kingsroad" ? 0 : 1) + (b.kind === "out" ? 0 : 0.5)));
  const taken = new Set(); let mainAxis = null;
  for (const l of legs) {
    const v = [l.far[0] - C[0], l.far[1] - C[1]], ang = Math.atan2(v[1], v[0]);
    const cand = [0, 1, 2, 3].sort((a, b) => Math.abs(Math.atan2(Math.sin(ang - a * Math.PI / 2), Math.cos(ang - a * Math.PI / 2))) - Math.abs(Math.atan2(Math.sin(ang - b * Math.PI / 2), Math.cos(ang - b * Math.PI / 2))));
    l.axis = cand.find((a) => !taken.has(a));
    if (l.axis != null) taken.add(l.axis);
    if (mainAxis == null && l.axis != null) mainAxis = l.axis;
  }
  if (mainAxis == null) mainAxis = 3;
  const theta = ((mainAxis - 3 + 4) % 4) * Math.PI / 2;

  // 2) kollarÄ± eksene dÃ¼zleÅŸtir
  for (const l of legs) {
    if (l.axis == null) continue;
    const d = AX[l.axis], pts = l.r.points, mk = (k) => [Math.round(C[0] + d[0] * k), Math.round(C[1] + d[1] * k)];
    const line = []; for (let k = 150; k <= LEG; k += 150) line.push(mk(k));
    if (l.kind === "out") pts.splice(l.i0, l.idx - l.i0, [Math.round(C[0]), Math.round(C[1])], ...line);
    else pts.splice(l.idx + 1, l.i0 - l.idx, ...line.reverse(), [Math.round(C[0]), Math.round(C[1])]);
    for (const o of legs) {
      if (o === l || o.r !== l.r) continue;
      let i0 = -1, m = 250;
      pts.forEach((p, i) => { const dd = dist(p, C); if (dd < m) { m = dd; i0 = i; } });
      o.i0 = i0;
      if (o.kind === "out") { let ib = i0; while (ib < pts.length - 1 && dist(pts[ib], C) < LEG * 1.6) ib++; o.idx = ib; }
      else { let ia = i0; while (ia > 0 && dist(pts[ia], C) < LEG * 1.6) ia--; o.idx = ia; }
    }
  }

  // 3) eski iÃ§erik (kÃ¶y yarÄ±Ã§apÄ±) + tint devral
  const inside = (o) => dist([o.x, o.y], C) < st.radius;
  const removed = world.structures.filter(inside);
  const tints = {};
  removed.forEach((s) => { if (s.tint) tints[s.tint] = (tints[s.tint] || 0) + 1; });
  const tintV = (Object.entries(tints).sort((a, b) => b[1] - a[1])[0] || [])[0] || null;
  const propsBefore = world.props.length;
  world.structures = world.structures.filter((s) => !inside(s));
  world.props = world.props.filter((p) => !inside(p));

  // 4) ÅŸablonu yerleÅŸtir
  const items = [];
  for (const [role, model, rx, ry, tier, kind] of T) {
    if (tier > st.tier) continue;
    const w = rotv(refToLocal(rx, ry), theta);
    items.push({ role, model, kind, loc: refToLocal(rx, ry), x: C[0] + w[0], y: C[1] + w[1], r: FOOT[model] || 20, fixed: role === "inn" });
  }
  if (!st.obelisk) items.push({ role: "well", model: "well", kind: "prop", loc: [0, 0], x: C[0], y: C[1], r: FOOT.well, fixed: true });

  const obst = [{ x: C[0], y: C[1], r: 70 * opt.spread + 20 }];
  for (const l of legs) if (l.axis != null) for (let k = 120; k <= LEG; k += 80) obst.push({ x: C[0] + AX[l.axis][0] * k, y: C[1] + AX[l.axis][1] * k, r: 46 });
  for (let it = 0; it < 300; it++) {
    for (const a of items) {
      if (a.fixed) continue;
      for (const o of obst) {
        const d = Math.hypot(a.x - o.x, a.y - o.y), min = (a.kind === "lamp" ? 6 : a.r) + o.r + 6;
        if (d < min) { a.x += (a.x - o.x) / (d || 1) * (min - d); a.y += (a.y - o.y) / (d || 1) * (min - d); }
      }
      for (const b of items) {
        if (a === b) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y), min = (a.kind === "lamp" || b.kind === "lamp" ? 0.5 : 1.05) * (a.r + b.r);
        if (d < min) {
          const u = (min - d) / 2, nx = (a.x - b.x) / (d || 1), ny = (a.y - b.y) / (d || 1);
          a.x += nx * u * (b.fixed ? 2 : 1); a.y += ny * u * (b.fixed ? 2 : 1);
          if (!b.fixed) { b.x -= nx * u; b.y -= ny * u; }
        }
      }
    }
  }

  // 5) plaza + kavÅŸak yollarÄ± (grup etiketli)
  const rd = (id, w, a, b) => world.roads.push({ id, width: w, village: st.id, points: [[Math.round(a[0]), Math.round(a[1])], [Math.round(b[0]), Math.round(b[1])]] });
  const ax = AX[mainAxis], px = [-ax[1], ax[0]], pl = 120 * opt.spread;
  rd("plaza_" + st.id + "_a", Math.round(110 * opt.spread), [C[0] - ax[0] * pl, C[1] - ax[1] * pl], [C[0] + ax[0] * pl, C[1] + ax[1] * pl]);
  rd("plaza_" + st.id + "_b", Math.round(110 * opt.spread), [C[0] - px[0] * pl, C[1] - px[1] * pl], [C[0] + px[0] * pl, C[1] + px[1] * pl]);
  const wIdx = (mainAxis + 3) % 4;
  if (!taken.has(wIdx)) { const w = AX[wIdx]; rd("spur_" + st.id, 56, C, [C[0] + w[0] * 330 * opt.spread, C[1] + w[1] * 330 * opt.spread]); }

  // 6) SU / YOL / EÄÄ°M doÄŸrulamasÄ± (kÃ¶yÃ¼n kendi yollarÄ± dÃ¢hil)
  const geo = core.createWorld(world);
  const isMine = (x, y) => world.roads.some((r) => r.village === st.id && r.points.some((p) => Math.abs(p[0] - x) < 1 && Math.abs(p[1] - y) < 1));
  const bad = (x, y, kind) => {
    const s = geo.sample(x, y);
    if (s.water) return "su";
    if (!geo.isWalkable(x, y)) return "egim";
    // Yol Ã¼stÃ¼: yalnÄ±zca fenerler yola konabilir, meydan (190 birim) hariÃ§.
    if (kind !== "lamp" && s.road && dist([x, y], C) > 190) return "yol";
    return null;
  };
  let pushed = 0;
  for (const it of items) {
    if (it.role === "inn") continue;
    for (let k = 0; k < 80; k++) {
      const why = bad(it.x, it.y, it.kind);
      if (!why) break;
      const dx = C[0] - it.x, dy = C[1] - it.y, d = Math.hypot(dx, dy) || 1;
      it.x += (dx / d) * 6; it.y += (dy / d) * 6; pushed++;
    }
  }

  // 7) itme sonrası TEKRAR ayır: su/yol düzeltmesi binaları üst üste
  //    yığmasın (bu yüzden köyler "leş" görünüyordu).
  const relax = (passes) => {
    for (let pass = 0; pass < passes; pass++) {
      for (const a of items) {
        if (a.fixed) continue;
        for (const b of items) {
          if (a === b) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const min = (a.kind === "lamp" || b.kind === "lamp") ? 0.5 * (a.r + b.r) : 1.05 * (a.r + b.r);
          if (d < min) {
            const u = (min - d) / 2, nx = (a.x - b.x) / (d || 1), ny = (a.y - b.y) / (d || 1);
            a.x += nx * u * (b.fixed ? 2 : 1); a.y += ny * u * (b.fixed ? 2 : 1);
            if (!b.fixed) { b.x -= nx * u; b.y -= ny * u; }
          }
        }
      }
    }
  };
  relax(200);

  const mkS = (it) => {
    let rt;
    if (it.kind === "house") {
      const d = [-it.loc[0], -it.loc[1]];
      const dd = Math.abs(d[0]) > Math.abs(d[1]) ? [Math.sign(d[0]), 0] : [0, Math.sign(d[1])];
      rt = Math.atan2(-dd[0], dd[1]) + theta + opt.facing;
    } else if (it.kind === "lamp") rt = 0;
    else rt = Math.floor(R() * 4) * Math.PI / 2 + (R() - 0.5) * 0.5;
    rt = ((rt % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const s = {
      model: it.model, x: Math.round(it.x * 10) / 10, y: Math.round(it.y * 10) / 10,
      scale: Math.round(scaleOf(it.model) * (0.96 + R() * 0.08) * 100) / 100,
      rot: Math.round(rt * 100) / 100, solidRadius: solidOf(it.model), village: st.id,
    };
    if (tintV) s.tint = tintV;
    return s;
  };
  let added = 0;
  for (const it of items) {
    if (it.role === "inn") {
      const p = poiBy[st.inn];
      if (p) { p.x = Math.round(it.x); p.y = Math.round(it.y); p.village = st.id; }
      continue;
    }
    world.structures.push(mkS(it));
    added++;
  }
  // sÃ¼s kayalarÄ± (grup etiketli)
  if (st.tier >= 2) for (const [rx, ry] of ROCKS) {
    const w = rotv(refToLocal(rx, ry), theta), x = C[0] + w[0], y = C[1] + w[1];
    if (bad(x, y, "prop")) continue;
    if (obst.some((o) => Math.hypot(x - o.x, y - o.y) < o.r + 14)) continue;
    if (items.some((i) => Math.hypot(x - i.x, y - i.y) < i.r)) continue;
    world.props.push({ id: "vr" + (uid++).toString(36), gen: "village_v1", village: st.id, x: Math.round(x), y: Math.round(y), type: "glb", model: "rocks", scale: Math.round((0.4 + R() * 0.2) * 100) / 100, rot: Math.round(R() * 628) / 100, solidRadius: 0.15 });
  }

  report.push(`${st.id.padEnd(11)} merkez ${Math.round(C[0])},${Math.round(C[1])}  silinen yapÄ± ${removed.length}, prop ${propsBefore - world.props.length}  eklenen ${added}  itilen ${pushed}  dÃ¶nÃ¼ÅŸ ${Math.round(theta * 180 / Math.PI)}Â°  tint ${tintV || "-"}`);
}

world.version = (world.version || 3) + 1;
world.meta = Object.assign(world.meta, { villages: "build_villages_v2.js", spread: opt.spread, facing: opt.facing });
fs.writeFileSync(OUT, JSON.stringify(world, null, 2) + "\n");
console.log(report.join("\n"));
console.log("yazÄ±ldÄ±:", OUT, "| version", world.version, "| yapÄ±", world.structures.length, "| prop", world.props.length);

