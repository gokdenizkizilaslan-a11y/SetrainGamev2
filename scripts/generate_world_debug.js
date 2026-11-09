// setra_world_debug.png — kıtanın hızlı görsel doğrulaması (bağımlılıksız PNG).
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const core = require("../public/js/setraWorldCore.js");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "world_setra.json"), "utf8"));
const world = core.createWorld(cfg);

const W = 900, H = 700;
const buf = Buffer.alloc(W * H * 3);
const pal = core.palettes;
const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
for (let py = 0; py < H; py++) {
  for (let px = 0; px < W; px++) {
    const x = (px + 0.5) / W * cfg.width;
    const y = (py + 0.5) / H * cfg.height;
    const s = world.sample(x, y);
    let c = pal[s.surface] || pal[s.biome] || pal.meadow;
    let [r, g, b] = rgb(c.top);
    if (!s.water && s.height > 100) { const k = Math.min(0.5, (s.height - 100) / 120); r = r + (255 - r) * k; g = g + (255 - g) * k; b = b + (255 - b) * k; }
    const i = (py * W + px) * 3;
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
  }
}
// POI işaretleri
const dot = (x, y, col, r) => {
  const px = Math.round(x / cfg.width * W), py = Math.round(y / cfg.height * H);
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    if (i * i + j * j > r * r) continue;
    const xx = px + i, yy = py + j;
    if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
    const k = (yy * W + xx) * 3; buf[k] = col[0]; buf[k + 1] = col[1]; buf[k + 2] = col[2];
  }
};
const POI_COL = { dungeon: [179, 136, 255], den: [255, 171, 64], chest: [255, 213, 79], inn: [105, 240, 174], ruin: [176, 190, 197], watch: [128, 216, 255], camp: [255, 138, 80], checkpoint: [0, 230, 255] };
for (const p of cfg.pois) dot(p.x, p.y, POI_COL[p.kind] || [255, 255, 255], 3);
dot(cfg.spawn.x, cfg.spawn.y, [255, 255, 255], 4);

// PNG: IHDR + IDAT + IEND
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
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  buf.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
}
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
const out = path.join(__dirname, "..", "world_setra_debug.png");
fs.writeFileSync(out, png);
console.log("wrote", out, png.length, "bytes", "metrics:", world.metrics());
