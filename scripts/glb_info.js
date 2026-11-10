#!/usr/bin/env node
/**
 * SETRA — scripts/glb_info.js
 * GLB modelinin GERÇEK ölçülerini yazar: yükseklik, taban genişliği/derinliği,
 * ayak izi yarıçapı ve önerilen `heights` / `solidRadius` değerleri.
 *
 * Kullanım:
 *   node scripts/glb_info.js newassets/hut.glb
 *   node scripts/glb_info.js newassets            (klasördeki tüm .glb)
 *   node scripts/glb_info.js hut.glb --height 82  (hedef px yüksekliği ver)
 *
 * Çıktıdaki değerleri doğrudan kullan:
 *   public/js/trees3d.js  -> DECOR.glb.heights[<model>]  (öneri satırı)
 *   world_setra.json      -> structures[].solidRadius    (öneri satırı)
 *
 * KURAL: model KAPISI local +Z yönünde export edilmeli (0°). Değilse
 * trees3d.js FRONT_DEG tablosuna derece yaz (örn. -Z için 180).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const TILE = 64;                 // 1 karo = 64 dünya pikseli
const STRUCT_SCALE = 2.6;        // trees3d.js TUNE_DEFAULT.structureScale
const DEF_HEIGHT = {             // DECOR.glb.heights (yoksa 64)
  farmhouse: 82, stonehouse: 84, hut: 68, barn: 82, longhouse: 78, tavern: 105,
  smithy: 82, chapel: 118, windmill: 116, gatehouse: 100, roundtower: 132,
  watchtower: 112, wall: 52, fence: 28, bridge: 54, well: 52, chest: 25,
  campfire: 24, tent: 48, bigrock: 58, rocks: 28, crystals: 54, pillars: 82,
  obelisk: 82, graves: 36, bush: 25, flowers: 14, stump: 24, logs: 24, lamp: 55,
  signpost: 48, cart: 38, barrels: 26, applecrates: 25, haybales: 30, stall: 60,
  banner: 70,
};

// ---------- mat4 (column-major, glTF uyumlu) ----------
const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}
function trs(t, q, s) {
  const [x, y, z, w] = q || [0, 0, 0, 1];
  const [sx, sy, sz] = s || [1, 1, 1];
  const [tx, ty, tz] = t || [0, 0, 0];
  const xx = x * x, yy = y * y, zz = z * z, xy = x * y, xz = x * z, yz = y * z;
  const wx = w * x, wy = w * y, wz = w * z;
  return [
    (1 - 2 * (yy + zz)) * sx, 2 * (xy + wz) * sx, 2 * (xz - wy) * sx, 0,
    2 * (xy - wz) * sy, (1 - 2 * (xx + zz)) * sy, 2 * (yz + wx) * sy, 0,
    2 * (xz + wy) * sz, 2 * (yz - wx) * sz, (1 - 2 * (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}
function apply(m, v) {
  const [x, y, z] = v;
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

// ---------- GLB ----------
function readGlb(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("GLB değil (magic yok)");
  const len = buf.readUInt32LE(8);
  let off = 12, json = null, bin = null;
  while (off + 8 <= Math.min(len, buf.length)) {
    const cl = buf.readUInt32LE(off), ct = buf.readUInt32LE(off + 4);
    const data = buf.slice(off + 8, off + 8 + cl);
    if (ct === 0x4e4f534a) json = JSON.parse(data.toString("utf8"));
    else if (ct === 0x004e4942) bin = data;
    off += 8 + cl + ((4 - (cl % 4)) % 4);
  }
  if (!json) throw new Error("JSON chunk yok");
  return { json, bin };
}

function measure(file) {
  const { json } = readGlb(file);
  const nodes = json.nodes || [];
  const meshes = json.meshes || [];
  const acc = json.accessors || [];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  let prims = 0;

  const walk = (ni, parent) => {
    const n = nodes[ni] || {};
    const local = n.matrix ? n.matrix : trs(n.translation, n.rotation, n.scale);
    const m = mul(parent, local);
    if (n.mesh != null) {
      for (const p of (meshes[n.mesh] || {}).primitives || []) {
        const a = acc[p.attributes && p.attributes.POSITION];
        if (!a || !a.min || !a.max) continue;
        prims++;
        for (let i = 0; i < 8; i++) {
          const c = [
            i & 1 ? a.max[0] : a.min[0],
            i & 2 ? a.max[1] : a.min[1],
            i & 4 ? a.max[2] : a.min[2],
          ];
          const w = apply(m, c);
          for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], w[k]); max[k] = Math.max(max[k], w[k]); }
        }
      }
    }
    for (const ch of n.children || []) walk(ch, m);
  };
  const scene = (json.scenes || [])[json.scene || 0] || {};
  for (const ni of scene.nodes || []) walk(ni, I4);
  if (!prims || !isFinite(min[0])) throw new Error("POSITION accessor/min-max bulunamadı");
  return { min, max, prims, nodes: nodes.length, draco: !!(json.extensionsRequired || []).length && (json.extensionsRequired || []).some((e) => /draco|meshopt|ktx/i.test(e)) };
}

const TREE_MODELS = new Set(["oak", "pine", "birch", "autumn", "deadtree", "greywood"]);
const TREE_HEIGHT = 70;          // DECOR.tree.height
const TREE_SCALE = 3.0;          // TUNE_DEFAULT.treeScale

// ---------- rapor ----------
function report(file, opt) {
  const name = path.basename(file, path.extname(file));
  let r;
  try { r = measure(file); } catch (e) { console.log(`${name.padEnd(16)} HATA: ${e.message}`); return; }
  const sx = r.max[0] - r.min[0], sy = r.max[1] - r.min[1], sz = r.max[2] - r.min[2];
  const isTree = TREE_MODELS.has(name);
  const H = opt.height || (isTree ? TREE_HEIGHT : DEF_HEIGHT[name]) || 64;  // dünya px
  const k = H / (sy || 1);                              // model birimi -> dünya px
  const wpx = sx * k, dpx = sz * k;
  const radiusPx = Math.max(wpx, dpx) / 2;
  const solid = Math.max(0.05, Math.round((radiusPx * 0.85) / TILE * 100) / 100);
  const solidProp = Math.max(0.05, Math.round(solid * 0.6 * 100) / 100);
  const long = sx >= sz ? "X (genişlik)" : "Z (derinlik)";
  const base = r.min[1];
  console.log(
    [
      `${name}${isTree ? "  (ağaç)" : ""}`,
      `  boyut (model birimi)  x=${sx.toFixed(2)}  y=${sy.toFixed(2)}  z=${sz.toFixed(2)}   (${r.prims} prim)`,
      `  taban y (0 olmalı)    ${base.toFixed(3)}${Math.abs(base) > 0.05 * (sy || 1) ? "  ⚠ MODEL 0'IN ALTINDA/ÜSTÜNDE" : ""}`,
      `  en/derin oranı        ${(sx / (sy || 1)).toFixed(2)} / ${(sz / (sy || 1)).toFixed(2)}   uzun kenar: ${long}`,
      `  ayak izi              ${Math.round(wpx)} × ${Math.round(dpx)} px (yarıçap ${Math.round(radiusPx)} px)`,
      `  öneri heights         ${Math.round(H)}   (mevcut: ${isTree ? "-" : (DEF_HEIGHT[name] || "-")})`,
      `  öneri solidRadius     ${solid}   (ev/yapı)   |   ${solidProp}   (fıçı/sandık gibi prop)`,
      r.draco ? `  ⚠ GLB sıkıştırma uzantısı var (Draco/meshopt/KTX2) — oyun yükleyemez` : "",
    ].filter(Boolean).join("\n")
  );
  if (!opt.height) {
    const sc = isTree ? TREE_SCALE : STRUCT_SCALE;
    const alt = Math.round(H * sc);
    console.log(`  not: ${isTree ? "treeScale" : "structureScale"} ${sc} ile oyunda ≈ ${alt} px yüksekliğinde görünür`);
  }
}

const argv = process.argv.slice(2);
let height = 0;
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--height") height = parseFloat(argv[++i]) || 0;
  else files.push(argv[i]);
}
if (!files.length) {
  console.log("kullanım: node scripts/glb_info.js <model.glb | klasör> [--height 82]");
  process.exit(1);
}
// Klasör verilirse içindeki tüm .glb dosyalarını ölç (PowerShell glob'u genişletmez).
const targets = [];
for (const f of files) {
  let st = null;
  try { st = fs.statSync(f); } catch (_) {}
  if (st && st.isDirectory()) {
    for (const n of fs.readdirSync(f)) if (/\.glb$/i.test(n)) targets.push(path.join(f, n));
  } else targets.push(f);
}
for (const f of targets) report(f, { height });
