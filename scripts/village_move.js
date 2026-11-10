#!/usr/bin/env node
"use strict";
/**
 * SETRA — village_move.js
 * Bir köyü TEK KATMAN gibi taşır: `village: "<id>"` etiketli tüm yapılar,
 * proplar, plaza/kavşak yolları ve o köyün POI'si birlikte kayar.
 * (build_villages_v2.js her elemana bu etiketi basıyor.)
 *
 *   node scripts/village_move.js world_setra.json setra 120 -80
 *   node scripts/village_move.js world_setra.json --list
 *
 *   <in> <villageId> <dx> <dy> [out]     out verilmezse in'in üzerine yazar
 */
const fs = require("fs");

const argv = process.argv.slice(2);
if (!argv.length || argv[0] === "--help") {
  console.log("kullanım: node scripts/village_move.js <dünya.json> <köyId> <dx> <dy> [çıktı.json]");
  console.log("         node scripts/village_move.js <dünya.json> --list");
  process.exit(0);
}
const IN = argv[0];
const world = JSON.parse(fs.readFileSync(IN, "utf8"));

function listVillages() {
  const map = new Map();
  const bump = (id, kind) => { if (!id) return; const v = map.get(id) || { yapı: 0, prop: 0, yol: 0, poi: [] }; v[kind]++; map.set(id, v); };
  for (const s of world.structures) bump(s.village, "yapı");
  for (const p of world.props || []) bump(p.village, "prop");
  for (const r of world.roads) bump(r.village, "yol");
  for (const p of world.pois) if (p.village) { const v = map.get(p.village) || { yapı: 0, prop: 0, yol: 0, poi: [] }; v.poi.push(p.id); map.set(p.village, v); }
  for (const [id, v] of map) console.log(`${id.padEnd(12)} yapı ${String(v.yapı).padStart(3)} | prop ${String(v.prop).padStart(3)} | yol ${v.yol} | POI ${v.poi.join(", ") || "-"}`);
}

if (argv[1] === "--list") { listVillages(); process.exit(0); }

const id = argv[1];
const dx = Number(argv[2]), dy = Number(argv[3]);
const OUT = argv[4] || IN;
if (!id || !Number.isFinite(dx) || !Number.isFinite(dy)) {
  console.error("eksik argüman. örnek: node scripts/village_move.js world_setra.json setra 120 -80");
  process.exit(1);
}

let nS = 0, nP = 0, nR = 0, nPoi = 0;
for (const s of world.structures) if (s.village === id) { s.x = Math.round((s.x + dx) * 10) / 10; s.y = Math.round((s.y + dy) * 10) / 10; nS++; }
for (const p of world.props || []) if (p.village === id) { p.x = Math.round((p.x + dx) * 10) / 10; p.y = Math.round((p.y + dy) * 10) / 10; nP++; }
for (const r of world.roads) if (r.village === id) { r.points = r.points.map(([x, y]) => [Math.round(x + dx), Math.round(y + dy)]); nR++; }
for (const p of world.pois) if (p.village === id) { p.x = Math.round(p.x + dx); p.y = Math.round(p.y + dy); nPoi++; }

// Grup sürüklendiği için POI yedeği de kaymalı (build_villages_v2 geri alırken
// eski konuma dönmesin).
const b = world.meta && world.meta._villageBackup;
if (b && Array.isArray(b.pois)) for (const p of b.pois) { /* köy POI'leri yedekte tutulmuyor */ }

fs.writeFileSync(OUT, JSON.stringify(world, null, 2) + "\n");
console.log(`${id}: ${nS} yapı, ${nP} prop, ${nR} yol, ${nPoi} POI taşındı (${dx >= 0 ? "+" : ""}${dx}, ${dy >= 0 ? "+" : ""}${dy}) → ${OUT}`);
