/* SETRA kalıcı dünya — istemci ve sunucunun paylaştığı deterministik coğrafya.
   Hiçbir rastgele sefer durumu burada tutulmaz; aynı seed + koordinat daima
   aynı kıta, yükseklik, yol, nehir ve biyomu üretir. Node ve tarayıcı uyumludur. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SetraWorldCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const TAU = Math.PI * 2;
  const PALETTES = {
    meadow:   { top: "#668f45", alt: "#789d50", side: "#3d512c", minimap: "#628a48" },
    forest:   { top: "#355f38", alt: "#416d3d", side: "#263d29", minimap: "#315d38" },
    desert:   { top: "#b3945e", alt: "#c0a269", side: "#6f593c", minimap: "#b3945e" },
    swamp:    { top: "#465846", alt: "#53624a", side: "#2c3930", minimap: "#465846" },
    frost:    { top: "#c4d5d8", alt: "#d7e2e2", side: "#71858d", minimap: "#c4d5d8" },
    volcanic: { top: "#4b3c38", alt: "#5b4540", side: "#292326", minimap: "#4b3c38" },
    cursed:   { top: "#493c54", alt: "#554460", side: "#292331", minimap: "#493c54" },
    rock:     { top: "#6e7372", alt: "#7c817f", side: "#3d4345", minimap: "#6e7372" },
    road:     { top: "#9b8158", alt: "#aa9064", side: "#594932", minimap: "#b39a6a" },
    sand:     { top: "#a8966c", alt: "#b6a579", side: "#625a45", minimap: "#a8966c" },
    water:    { top: "#244f63", alt: "#2c6073", side: "#142f40", minimap: "#244f63" },
    deep:     { top: "#152e42", alt: "#19374b", side: "#0d202e", minimap: "#152e42" },
    bridge:   { top: "#795b38", alt: "#896943", side: "#403223", minimap: "#795b38" },
    lava:     { top: "#9d3c20", alt: "#c55025", side: "#471f1a", minimap: "#9d3c20" }
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, v) { const t = clamp((v - a) / ((b - a) || 1), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hashInt(x, y, seed) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function hash2(x, y, seed) { return hashInt(Math.floor(x), Math.floor(y), seed); }
  function noise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const tx = x - xi, ty = y - yi;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = hashInt(xi, yi, seed), b = hashInt(xi + 1, yi, seed);
    const c = hashInt(xi, yi + 1, seed), d = hashInt(xi + 1, yi + 1, seed);
    return lerp(lerp(a, b, sx), lerp(c, d, sx), sy);
  }
  function fbm(x, y, seed, octaves) {
    let sum = 0, amp = 0.5, freq = 1, norm = 0;
    for (let i = 0; i < (octaves || 4); i++) {
      sum += noise(x * freq, y * freq, seed + i * 1013) * amp;
      norm += amp; amp *= 0.5; freq *= 2.03;
    }
    return sum / norm;
  }
  function dist2Segment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const l2 = dx * dx + dy * dy;
    if (!l2) return (px - ax) ** 2 + (py - ay) ** 2;
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
    const x = ax + dx * t, y = ay + dy * t;
    return (px - x) ** 2 + (py - y) ** 2;
  }
  function prepareLines(lines) {
    return (lines || []).map((line) => {
      const segments = [];
      const pts = line.points || [];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        segments.push({ ax: a[0], ay: a[1], bx: b[0], by: b[1],
          minX: Math.min(a[0], b[0]), maxX: Math.max(a[0], b[0]),
          minY: Math.min(a[1], b[1]), maxY: Math.max(a[1], b[1]) });
      }
      return { id: line.id, width: Number(line.width) || 20, segments };
    });
  }
  function nearestLine(lines, x, y, extra) {
    let best = Infinity, hit = null;
    const pad = extra || 0;
    for (const line of lines) {
      const limit = line.width + pad;
      for (const s of line.segments) {
        if (x < s.minX - limit || x > s.maxX + limit || y < s.minY - limit || y > s.maxY + limit) continue;
        const d2 = dist2Segment(x, y, s.ax, s.ay, s.bx, s.by);
        if (d2 < best) { best = d2; hit = line; }
      }
    }
    return hit ? { line: hit, distance: Math.sqrt(best) } : null;
  }
  function lineLength(line) {
    let length = 0;
    const p = line && line.points || [];
    for (let i = 1; i < p.length; i++) length += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    return length;
  }

  function createWorld(config) {
    if (!config || !config.id) throw new Error("Setra world config is required");
    const seed = config.seed | 0;
    const roads = prepareLines(config.roads);
    const rivers = prepareLines(config.rivers);
    const peaks = config.peaks || [];
    const lakes = config.lakes || [];
    const flats = config.flattenZones || [];

    // ---- Elle boyanan zemin (Dünya Kurucu) --------------------------------
    // config.biomePaints = [{ x, y, r, biome?, surface? }, ...] — en son boyanan
    // daire kazanır. Oyun ve editör aynı katmanı okuduğu için fırça sonucu
    // anında ve birebir aynı görünür.
    const paints = Array.isArray(config.biomePaints) ? config.biomePaints : null;
    const PAINT_CELL = 512;
    let paintGrid = null;
    if (paints && paints.length) {
      paintGrid = new Map();
      for (let i = 0; i < paints.length; i++) {
        const p = paints[i];
        if (!p || !Number.isFinite(Number(p.x)) || !Number.isFinite(Number(p.y))) continue;
        const r = Math.max(1, Number(p.r) || 0);
        const x0 = Math.floor((p.x - r) / PAINT_CELL), x1 = Math.floor((p.x + r) / PAINT_CELL);
        const y0 = Math.floor((p.y - r) / PAINT_CELL), y1 = Math.floor((p.y + r) / PAINT_CELL);
        for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
          const k = gx + ":" + gy;
          let arr = paintGrid.get(k);
          if (!arr) { arr = []; paintGrid.set(k, arr); }
          arr.push(i);
        }
      }
    }
    function paintAt(x, y) {
      if (!paintGrid) return null;
      const arr = paintGrid.get(Math.floor(x / PAINT_CELL) + ":" + Math.floor(y / PAINT_CELL));
      if (!arr || !arr.length) return null;
      let best = null;
      for (let k = 0; k < arr.length; k++) {
        const p = paints[arr[k]];
        const r = Number(p.r) || 0;
        if (r <= 0) continue;
        const dx = x - p.x, dy = y - p.y;
        if (dx * dx + dy * dy <= r * r) best = p;
      }
      return best;
    }

    function continent(x, y) {
      const nx = (x / config.width - 0.5) * 2;
      const ny = (y / config.height - 0.5) * 2;
      const long = (nx - ny) * 0.70710678;
      const short = (nx + ny) * 0.70710678;
      const warpA = (fbm(x * 0.00018, y * 0.00018, seed + 11, 3) - 0.5) * 0.32;
      const warpB = (fbm(x * 0.00031 + 17, y * 0.00031 - 9, seed + 23, 3) - 0.5) * 0.22;
      return 1 - ((long + warpA) / 1.28) ** 2 - ((short + warpB) / 0.91) ** 2;
    }

    function waterInfo(x, y, landMass) {
      if (landMass <= 0) return { water: true, deep: true };
      for (const lake of lakes) {
        const d = ((x - lake.x) / lake.rx) ** 2 + ((y - lake.y) / lake.ry) ** 2;
        const edge = 1 + (noise(x * 0.004, y * 0.004, seed + 89) - 0.5) * 0.14;
        if (d < edge) return { water: true, deep: d < 0.58 };
      }
      const river = nearestLine(rivers, x, y, 20);
      if (river && river.distance < river.line.width * (0.86 + noise(x * 0.006, y * 0.006, seed + 91) * 0.28)) {
        return { water: true, deep: false, river: river.line.id };
      }
      return { water: false, deep: false };
    }

    function rawHeight(x, y) {
      const mass = continent(x, y);
      if (mass <= 0) return -12 + mass * 12;
      const rolling = fbm(x * 0.00042, y * 0.00042, seed + 101, 4);
      const detail = fbm(x * 0.0013, y * 0.0013, seed + 109, 3);
      let h = 5 + rolling * 27 + (detail - 0.5) * 8 + smooth(0, 0.2, mass) * 5;
      for (const p of peaks) {
        const d2 = (x - p.x) ** 2 + (y - p.y) ** 2;
        const r2 = p.radius * p.radius;
        if (d2 < r2 * 2.2) {
          const g = Math.exp(-d2 / Math.max(1, r2 * 0.62));
          h += p.height * g * (0.86 + detail * 0.28);
        }
      }
      // Kuzeyde geniş dağ silsilesi; yol ve geçitler yürünebilir kalır.
      const north = 1 - smooth(0.16, 0.38, y / config.height);
      h += north * (18 + fbm(x * 0.0008, y * 0.0008, seed + 117, 3) * 45);
      for (const f of flats) {
        const d = Math.hypot(x - f.x, y - f.y);
        if (d < f.radius) h = lerp(f.height, h, smooth(f.radius * 0.42, f.radius, d));
      }
      return h;
    }

    function biomeAt(x, y, height) {
      const u = x / config.width, v = y / config.height;
      const n = fbm(x * 0.00055, y * 0.00055, seed + 151, 3) - 0.5;
      if (height > 132) return "rock";
      const volcanicD = Math.hypot(u - 0.855, (v - 0.49) * 1.15);
      if (volcanicD < 0.155 + n * 0.09) return "volcanic";
      if ((u > 0.74 && v < 0.265 + n * 0.11) || Math.hypot(u - 0.91, v - 0.105) < 0.18) return "cursed";
      if (v < 0.265 + n * 0.11) return "frost";
      if (u < 0.37 + n * 0.11 && v < 0.46 + n * 0.09) return "desert";
      if (u > 0.54 + n * 0.09 && v > 0.29 && v < 0.59 + n * 0.08) return "swamp";
      const moisture = fbm(x * 0.00048 + 31, y * 0.00048 - 19, seed + 157, 4);
      if (moisture > 0.49 || (u > 0.25 && u < 0.61 && v > 0.32 && v < 0.72)) return "forest";
      return "meadow";
    }

    function sample(x, y) {
      x = clamp(Number(x) || 0, 0, config.width);
      y = clamp(Number(y) || 0, 0, config.height);
      const mass = continent(x, y);
      let height = rawHeight(x, y);
      let water = waterInfo(x, y, mass);
      const road = nearestLine(roads, x, y, 16);
      const onRoad = !!(road && road.distance < road.line.width);
      const bridge = !!(water.water && road && road.distance < road.line.width + 12);
      if (bridge) { water = { water: false, deep: false, river: water.river }; height = Math.max(5, height); }
      else if (water.water) height = water.deep ? -12 : -5;
      let biome = biomeAt(x, y, height);
      if (height > 105 && biome !== "volcanic" && biome !== "cursed") biome = "rock";
      // Elle boyanan zemin, prosedürel biyomun üzerine yazar.
      const paint = paintAt(x, y);
      if (paint && paint.biome) biome = paint.biome;
      let surface = biome;
      if (water.water) surface = water.deep ? "deep" : "water";
      else if (bridge) surface = "bridge";
      else if (onRoad) surface = "road";
      else if (mass < 0.055) surface = "sand";
      if (paint && paint.surface && !water.water && !bridge) surface = paint.surface;
      return { x, y, height, biome, surface, water: water.water, deep: water.deep,
        river: water.river || null, road: onRoad, roadId: road && road.line.id || null,
        bridge, landMass: mass };
    }

    function slopeAt(x, y) {
      const d = 12;
      const h = rawHeight(x, y);
      return Math.max(Math.abs(rawHeight(x + d, y) - h), Math.abs(rawHeight(x, y + d) - h),
        Math.abs(rawHeight(x - d, y) - h), Math.abs(rawHeight(x, y - d) - h));
    }

    function isWalkable(x, y) {
      if (x < 0 || y < 0 || x > config.width || y > config.height) return false;
      const s = sample(x, y);
      if (s.water && !s.bridge) return false;
      // Yol/köprü dağ geçididir; normal arazide dik teras ve uçurumlar katıdır.
      const limit = s.road || s.bridge ? 116 : 64;
      return slopeAt(x, y) <= limit;
    }

    function randomAt(x, y, salt) { return hash2(x, y, seed + ((salt || 0) | 0) * 7919); }
    function nearestPOI(x, y, kinds) {
      let best = null, bd = Infinity;
      for (const p of config.pois || []) {
        if (kinds && !kinds.includes(p.kind)) continue;
        const d = Math.hypot(x - p.x, y - p.y);
        if (d < bd) { bd = d; best = p; }
      }
      return best ? { poi: best, distance: bd } : null;
    }
    function metrics() {
      const main = (config.roads || []).find((r) => r.id === "kingsroad") || (config.roads || [])[0];
      const routeUnits = lineLength(main);
      const routePixels = routeUnits * config.worldScale;
      return {
        seed, routeUnits, routePixels,
        estimatedEndgameSeconds: routePixels / config.baseWalkSpeed,
        estimatedEndgameMinutes: routePixels / config.baseWalkSpeed / 60,
        directPixels: Math.hypot(config.endgame.x - config.spawn.x, config.endgame.y - config.spawn.y) * config.worldScale
      };
    }

    return { config, seed, palettes: PALETTES, sample, rawHeight, slopeAt, isWalkable,
      randomAt, noise: (x, y, salt) => noise(x, y, seed + (salt || 0)),
      fbm: (x, y, salt, octaves) => fbm(x, y, seed + (salt || 0), octaves),
      nearestPOI, metrics, continent };
  }

  return { createWorld, palettes: PALETTES, hash2, noise, fbm, clamp, smooth, lerp };
});
