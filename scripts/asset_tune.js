#!/usr/bin/env node
/**
 * SETRA — scripts/asset_tune.js
 * Tek komutla TÜM aynı model nesnelerini ayarla (tüm balyalar, tüm taşlar...)
 * ve/veya köy çevresini düzleştir.
 *
 *   node scripts/asset_tune.js haybales --hMul 1.15 --sink 3
 *   node scripts/asset_tune.js obelisk  --sink 6 --solid 1.05
 *   node scripts/asset_tune.js --list
 *   node scripts/asset_tune.js haybales --clear
 *   node scripts/asset_tune.js --villages 2800        (tüm köyleri düzleştir)
 *   node scripts/asset_tune.js --flatten setra_village 2800
 *
 * Yazdığı yer: world_setra.json
 *   visual.modelTune[model] = { hMul, sink, solid, solidMul }
 *   flattenZones[]          = { x, y, radius, height }
 *
 * hMul     yükseklik çarpanı (1 = değişmez)
 * sink     sprite'ı dünya px aşağı kaydır (negatif = yukarı)
 * solid    mutlak çarpışma yarıçapı (karo; 1 karo = 96 px)
 * solidMul otomatik (gerçek ayak izi) yarıçap çarpanı
 *
 * NOT: Sunucu dünyayı açılışta okur → değişiklik sonrası `npm start` ile yeniden başlat.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "world_setra.json");
const NUM = ["hMul", "sink", "solid", "solidMul"];

function load() {
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
function save(world) {
  fs.writeFileSync(FILE, JSON.stringify(world, null, 2) + "\n");
}

function coreOf(world) {
  global.window = global;
  const mod = require(path.join(ROOT, "public", "js", "setraWorldCore.js"));
  const createWorld = mod.createWorld || mod;
  return createWorld(world);
}

const argv = process.argv.slice(2);
if (!argv.length) {
  console.log(fs.readFileSync(__filename, "utf8").split("*/")[0].replace(/^[\s\S]*?\/\*\*/, ""));
  process.exit(0);
}

const world = load();
world.visual = world.visual || {};
world.visual.modelTune = world.visual.modelTune || {};

// ---------- liste ----------
if (argv[0] === "--list") {
  const t = world.visual.modelTune;
  const keys = Object.keys(t);
  if (!keys.length) console.log("modelTune boş.");
  for (const k of keys) console.log(k.padEnd(14), JSON.stringify(t[k]));
  console.log("\nflattenZones:");
  for (const f of world.flattenZones || []) console.log(" ", f.x + "," + f.y, "r=" + Math.round(f.radius), "h=" + f.height);
  process.exit(0);
}

// ---------- köyleri düzleştir ----------
function upsertFlat(poiId, radius) {
  const poi = (world.pois || []).find((p) => p.id === poiId);
  if (!poi) { console.log("POI yok:", poiId); return false; }
  const core = coreOf(world);
  const s = core.sample(poi.x, poi.y);
  const h = Math.max(0, Math.round((s.height || 0) / 10) * 10);
  world.flattenZones = world.flattenZones || [];
  const near = world.flattenZones.find((f) => Math.hypot(f.x - poi.x, f.y - poi.y) < 200);
  if (near) Object.assign(near, { radius });   // mevcut yükseklik korunur
  else world.flattenZones.push({ x: poi.x, y: poi.y, radius, height: h });
  console.log(`düzleştirildi: ${poiId}  r=${radius}  h=${near ? near.height : h}`);
  return true;
}

if (argv[0] === "--villages") {
  const radius = parseFloat(argv[1]) || 2800;
  const list = (world.pois || []).filter((p) => p.checkpoint || p.kind === "inn" || p.kind === "checkpoint");
  const seen = new Set();
  for (const p of list) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    upsertFlat(p.id, radius);
  }
  save(world);
  console.log("yazıldı:", path.basename(FILE), "| sunucuyu yeniden başlat");
  process.exit(0);
}
if (argv[0] === "--flatten") {
  if (!upsertFlat(argv[1], parseFloat(argv[2]) || 2800)) process.exit(1);
  save(world);
  console.log("yazıldı:", path.basename(FILE), "| sunucuyu yeniden başlat");
  process.exit(0);
}

// ---------- model ayarı ----------
const model = argv[0];
if (model.startsWith("--")) { console.log("bilinmeyen komut:", model); process.exit(1); }
const entry = Object.assign({}, world.visual.modelTune[model] || {});
let touched = false;
for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--clear") {
    delete world.visual.modelTune[model];
    console.log("temizlendi:", model);
    save(world);
    console.log("yazıldı:", path.basename(FILE));
    process.exit(0);
  }
  if (a.startsWith("--")) {
    const key = a.slice(2);
    if (!NUM.includes(key)) { console.log("bilinmeyen ayar:", key, "| geçerli:", NUM.join(", ")); process.exit(1); }
    const v = parseFloat(argv[++i]);
    if (!Number.isFinite(v)) { console.log("sayı bekleniyor:", key); process.exit(1); }
    entry[key] = v;
    touched = true;
  }
}
if (!touched) { console.log("ayar verilmedi. örn: --sink 4 --hMul 1.1"); process.exit(1); }
world.visual.modelTune[model] = entry;
save(world);
console.log(model.padEnd(14), JSON.stringify(entry));
console.log("yazıldı:", path.basename(FILE), "| sunucuyu yeniden başlat (npm start)");
