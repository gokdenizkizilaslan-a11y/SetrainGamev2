// server/worldPreview.js — Setra kıtasının hızlı PNG önizlemesi (bağımlılıksız).
// GameCraft > Dünya Kurucu sekmesi bu görseli arka plan haritası olarak kullanır.
// Aynı deterministik çekirdek (public/js/setraWorldCore.js) ile üretilir; böylece
// editörde gördüğün zemin, oyundaki zeminle birebir aynıdır.
"use strict";

const zlib = require("zlib");
const core = require("../public/js/setraWorldCore.js");

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

const POI_COL = {
  dungeon: [179, 136, 255], den: [255, 171, 64], chest: [255, 213, 79],
  inn: [105, 240, 174], ruin: [176, 190, 197], watch: [128, 216, 255],
  camp: [255, 138, 80], checkpoint: [0, 230, 255]
};

function blend(buf, W, H, x, y, col, a) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const k = (y * W + x) * 3;
  buf[k] = Math.round(buf[k] + (col[0] - buf[k]) * a);
  buf[k + 1] = Math.round(buf[k + 1] + (col[1] - buf[k + 1]) * a);
  buf[k + 2] = Math.round(buf[k + 2] + (col[2] - buf[k + 2]) * a);
}
function disc(buf, W, H, px, py, r, col, a) {
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    if (i * i + j * j > r * r) continue;
    blend(buf, W, H, px + i, py + j, col, a);
  }
}

function renderOverview(cfg, W) {
  W = Math.max(240, Math.min(2048, Math.round(W) || 1024));
  const H = Math.max(180, Math.round((W * cfg.height) / cfg.width));
  const world = core.createWorld(cfg);
  const buf = Buffer.alloc(W * H * 3);
  const pal = core.palettes;
  const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const x = ((px + 0.5) / W) * cfg.width;
      const y = ((py + 0.5) / H) * cfg.height;
      const s = world.sample(x, y);
      const c = pal[s.surface] || pal[s.biome] || pal.meadow;
      let [r, g, b] = rgb(c.top);
      if (!s.water && s.height > 100) {
        const k = Math.min(0.5, (s.height - 100) / 120);
        r = r + (255 - r) * k; g = g + (255 - g) * k; b = b + (255 - b) * k;
      }
      const i = (py * W + px) * 3;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
    }
  }

  // Yolları hafifçe belirginleştir
  for (const road of cfg.roads || []) {
    const pts = road.points || [];
    for (let i = 1; i < pts.length; i++) {
      const ax = (pts[i - 1][0] / cfg.width) * W, ay = (pts[i - 1][1] / cfg.height) * H;
      const bx = (pts[i][0] / cfg.width) * W, by = (pts[i][1] / cfg.height) * H;
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        blend(buf, W, H, Math.round(ax + (bx - ax) * t), Math.round(ay + (by - ay) * t), [196, 168, 112], 0.5);
      }
    }
  }

  // POI noktaları
  for (const p of cfg.pois || []) {
    const px = Math.round((p.x / cfg.width) * W), py = Math.round((p.y / cfg.height) * H);
    disc(buf, W, H, px, py, 3, POI_COL[p.kind] || [255, 255, 255], 0.95);
  }
  // Spawn bölgeleri (hafif kırmızımsı halka)
  for (const z of cfg.spawnZones || []) {
    const px = Math.round((z.cx / cfg.width) * W), py = Math.round((z.cy / cfg.height) * H);
    const r = Math.max(2, Math.round(((Number(z.r) || 0) / cfg.width) * W));
    const steps = Math.max(18, Math.round(r * 6.28));
    for (let k = 0; k < steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      blend(buf, W, H, Math.round(px + Math.cos(a) * r), Math.round(py + Math.sin(a) * r), [255, 120, 120], 0.55);
    }
  }
  // Başlangıç noktası + bitiş
  if (cfg.spawn) disc(buf, W, H, Math.round((cfg.spawn.x / cfg.width) * W), Math.round((cfg.spawn.y / cfg.height) * H), 4, [255, 255, 255], 1);
  if (cfg.endgame) disc(buf, W, H, Math.round((cfg.endgame.x / cfg.width) * W), Math.round((cfg.endgame.y / cfg.height) * H), 4, [255, 80, 80], 1);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    buf.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
  return { png, W, H };
}

module.exports = { renderOverview };