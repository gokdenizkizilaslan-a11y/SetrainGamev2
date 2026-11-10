/* =====================================================================
   Setra 3D Dekor Denemesi (geri alınabilir)
   ---------------------------------------------------------------------
   newassets/*.glb modelleri bir kez offscreen WebGL ile sprite'a
   (şeffaf canvas) pişirilir, sonra ARPG haritasında drawImage ile
   vektör çizimin yerine basılır.

   Yeni model eklemek: aşağıdaki DECOR tablosuna bak (tek blok).
   Kapatmak için:  ?trees3d=0  veya localStorage.setItem('setra.trees3d','0')
   Anında:         Setra3DTrees.setEnabled(false)
   Modül yüklenemezse oyun eski vektör çizime düşer.

   Detaylı rehber: 3D-ASSETS.md
   ===================================================================== */

// ---------------------------------------------------------------------
// DEKOR TABLOSU
//   key      = TravelEngine scenery `type` değeri ('tree', 'bush', ...)
//   height   = dünya ölçeğinde çizim yüksekliği (px, s.scale = 1 iken)
//   sway     = rüzgâr salınımı (taban etrafında ufak dönüş)
//   models   = id -> glb yolu  (/newassets şu an server.js'te servis ediliyor)
//   biomes   = biyom id -> model id havuzu (yoksa `default` kullanılır)
// ---------------------------------------------------------------------
const DECOR = {
  tree: {
    height: 70,
    sway: true,
    models: {
      oak: "/newassets/oak.glb",
      pine: "/newassets/pine.glb",
      birch: "/newassets/birch.glb",
      autumn: "/newassets/autumn.glb",
      deadtree: "/newassets/deadtree.glb",
    },
    default: ["pine", "pine", "oak", "birch", "autumn"],
    biomes: {
      verdant: ["pine", "pine", "oak", "pine", "birch", "autumn"],
      forest: ["pine", "oak", "pine", "birch", "autumn"],
      frost: ["pine", "pine", "birch"],
      frozen: ["pine", "pine", "birch"],
      snow: ["pine", "pine", "birch"],
      ashen: ["deadtree", "greywood", "oak", "pine"],
      cursed: ["deadtree", "greywood", "oak"],
      swamp: ["deadtree", "greywood", "birch"],
      mirefen: ["deadtree", "greywood", "birch"],
    },
  },

  // Sabit yapı/POI ve vektör dekorların ortak model havuzu.
  glb: {
    height: 64,
    heights: { farmhouse: 82, stonehouse: 84, hut: 68, barn: 82, longhouse: 78, tavern: 105,
      smithy: 82, chapel: 118, windmill: 116, gatehouse: 100, roundtower: 132, watchtower: 112,
      wall: 52, fence: 28, bridge: 54, well: 52, chest: 25, campfire: 24, tent: 48,
      bigrock: 58, rocks: 28, crystals: 54, pillars: 82, obelisk: 82, graves: 36,
      bush: 25, flowers: 14, stump: 24, logs: 24, lamp: 55, signpost: 48,
      cart: 38, barrels: 26, applecrates: 25, haybales: 30, stall: 60, banner: 70 },
    models: {
      applecrates: "/newassets/applecrates.glb", autumn: "/newassets/autumn.glb", banner: "/newassets/banner.glb",
      barn: "/newassets/barn.glb", barrels: "/newassets/barrels.glb", bigrock: "/newassets/bigrock.glb",
      birch: "/newassets/birch.glb", bridge: "/newassets/bridge.glb", bush: "/newassets/bush.glb",
      campfire: "/newassets/campfire.glb", cart: "/newassets/cart.glb", chapel: "/newassets/chapel.glb",
      chest: "/newassets/chest.glb", crystals: "/newassets/crystals.glb", deadtree: "/newassets/deadtree.glb",
      // deadtree modelinden türetilmiş ikinci ağaç türü: gri gövde + 2 yaprak
      // kümesi (bake sırasında eklenir) → "greywood".
      greywood: "/newassets/deadtree.glb",
      farmhouse: "/newassets/farmhouse.glb", fence: "/newassets/fence.glb", flowers: "/newassets/flowers.glb",
      gatehouse: "/newassets/gatehouse.glb", graves: "/newassets/graves.glb", haybales: "/newassets/haybales.glb",
      hut: "/newassets/hut.glb", lamp: "/newassets/lamp.glb", logs: "/newassets/logs.glb",
      longhouse: "/newassets/longhouse.glb", oak: "/newassets/oak.glb", obelisk: "/newassets/obelisk.glb",
      pillars: "/newassets/pillars.glb", pine: "/newassets/pine.glb", rocks: "/newassets/rocks.glb",
      roundtower: "/newassets/roundtower.glb", signpost: "/newassets/signpost.glb", smithy: "/newassets/smithy.glb",
      stall: "/newassets/stall.glb", stonehouse: "/newassets/stonehouse.glb", stump: "/newassets/stump.glb",
      tavern: "/newassets/tavern.glb", tent: "/newassets/tent.glb", wall: "/newassets/wall.glb",
      watchtower: "/newassets/watchtower.glb", well: "/newassets/well.glb", windmill: "/newassets/windmill.glb"
    },
    default: ["bigrock"], biomes: {}
  },

  // ÖRNEK: çalıyı da 3D yapmak için bu bloğu aç ve
  // travelEngine.js drawSceneryItem() içindeki 'bush' dalının başına
  //   if (window.Setra3DTrees && window.Setra3DTrees.drawScenery(ctx, s, x, y, this)) return;
  // satırını ekle.
  // bush: {
  //   height: 26,
  //   sway: true,
  //   models: { bush: "/newassets/bush.glb" },
  //   default: ["bush"],
  //   biomes: {},
  // },
};

// ---------------------------------------------------------------------
// CEPHE (KAPI) YÖNÜ — model başına düzeltme, DERECE
//   SÖZLEŞME: tüm yapı modelleri KAPISI local +Z yönünde export edilir (0°).
//   build_villages.js evleri bu varsayımla plazaya döndürür.
//   Bir model farklı export edilmişse buraya yaz:
//     +Z = 0 | +X = 90 | -Z = 180 | -X = 270   (örn. kapı arkada: hut: 180)
//   Doğrulama: konsolda  Setra3DTrees.contactSheet("hut")
//   → 16 görünüm + her görünümün rot değeri; kapının göründüğü kareyi bul,
//     o karedeki rot = -cephe  →  cephe = -rot.
// ---------------------------------------------------------------------
const FRONT_DEG = {
  // hut: 180,
};

const SPRITE_W = 176;   // varsayılan sprite tuvali (px) — küçük nesneler
const SPRITE_H = 240;
const ROTS = 24;         // ağaçlar (15° adım)
const ROTS_STRUCT = 16;  // yapılar (22.5° adım) — daha yüksek çözünürlüğe yer açar
// Ağaç: 24 dönüş. Yapı: 16 dönüş (bellek aynı kalırken sprite çözünürlüğü artar).
const rotsFor = (model) => (TREE_MODELS.has(model) ? ROTS : ROTS_STRUCT);
/** Model boyutuna göre sprite çözünürlüğü — piksel görünmesin diye yüksek tutuldu. */
function spriteDims(model, size) {
  const maxDim = Math.max(size.x, size.y, size.z);
  if (TREE_MODELS.has(model)) return [288, 384];
  if (maxDim >= 42) return [576, 768];
  if (maxDim >= 20) return [416, 552];
  if (maxDim >= 12) return [352, 468];
  return [288, 384];
}
const MODEL_ALIAS = { boulder: "bigrock", mountain: "bigrock", lantern: "lamp", mushroom: "crystals", shrine: "obelisk", deadtree: "deadtree" };

// ---------------------------------------------------------------------
// DÜNYA GÖRSEL ÖLÇEĞİ
//   GameCraft > Dünya Kurucu'dan world_setra.json `visual` alanı ile gelir.
//   travelEngine map.world.visual -> window.SETRA_WORLD_TUNING aktarır.
// ---------------------------------------------------------------------
const TUNE_DEFAULT = { treeScale: 3.0, structureScale: 2.6 };
const TREE_MODELS = new Set(["oak", "pine", "birch", "autumn", "deadtree", "greywood"]);
function tune() {
  let t = null;
  try { t = (typeof window !== "undefined" && window.SETRA_WORLD_TUNING) || null; } catch (_) {}
  const ts = Number(t && t.treeScale);
  const ss = Number(t && t.structureScale);
  return {
    treeScale: ts > 0 ? ts : TUNE_DEFAULT.treeScale,
    structureScale: ss > 0 ? ss : TUNE_DEFAULT.structureScale,
  };
}

function flagEnabled() {
  let v = null;
  try {
    const q = new URLSearchParams(location.search).get("trees3d");
    if (q !== null) v = q;
    else v = localStorage.getItem("setra.trees3d");
  } catch (_) { /* localStorage kapalı olabilir */ }
  if (v === null || v === undefined) return true; // varsayılan: açık (deneme)
  v = String(v).toLowerCase();
  return !(v === "0" || v === "off" || v === "false" || v === "no");
}

const api = {
  enabled: false,
  ready: false,
  error: null,
  decor: DECOR,
  frontTable: FRONT_DEG,
  // sprites[type][modelId] = [{ canvas }]
  sprites: {},
  setEnabled(on) {
    api.enabled = !!on;
    try { localStorage.setItem("setra.trees3d", on ? "1" : "0"); } catch (_) {}
    return api.enabled;
  },
  // Sprite'ın DÜNYA ölçeğindeki çizim boyutu (h = yükseklik, w = genişlik) ve
  // tabana oturan gölge elipsinin yarıçapları. travelEngine.renderShadows da
  // aynı değerleri kullanır; aksi halde gölge nesnenin altında minicik kalıp
  // nesne "havada uçuyor" gibi görünüyordu.
  footprint(s, engine) {
    if (!api.ready || !s) return null;
    let obj = s;
    if (obj.type === "glb" || (!DECOR[obj.type] && MODEL_ALIAS[obj.type])) {
      obj = Object.assign({}, obj, { type: "glb", model: obj.model || MODEL_ALIAS[obj.type] });
    }
    const cfg = DECOR[obj.type];
    if (!cfg) return null;
    const spr = api.pick(obj, engine && engine.biome);
    if (!spr) return null;
    const sc = Number(obj.scale) > 0 ? Number(obj.scale) : 1;
    // Ölçek: dünya ayarı (visual) + obje başına mutlak yükseklik (props.height)
    const t = tune();
    const isTree = obj.type === "tree" || TREE_MODELS.has(obj.model);
    // Rastgele seferlerde 3D dekor eski vektör dekorla aynı oranda görünsün
    // (motor bu modda decorScale < 1 verir; kıtada 1'dir). Ölçek çarpanı
    // SADECE ağaçlara uygulanır: binalar/obelisk/fıçı gibi yapılar kendi
    // sabit boyutunda kalır (yoksa dev görünüyorlardı).
    const dsc = isTree ? (Number(engine && engine.decorScale) > 0 ? Number(engine.decorScale) : 1) : 1;
    // preScaled: travelEngine zaten dünya ölçeğini (structureScale) uygulamış
    // (yapılar/POI'ler). Çift çarpmayı önlemek için burada 1 kullan.
    const scaleMul = isTree ? t.treeScale : (obj.preScaled ? 1 : t.structureScale);
    const perHeight = Number(obj.height);
    const baseH = (cfg.heights && cfg.heights[obj.model]) || cfg.height;
    const h = (Number.isFinite(perHeight) && perHeight > 0 ? perHeight : baseH * scaleMul) * sc * dsc;
    const hSafe = Number.isFinite(h) && h > 0.5 ? h : 0.5;
    // Görünür genişlik: tuval değil, modelin sabit referans oranı (dönüşten
    // bağımsız) → gölge ve genişlik dönüşte değişmez.
    const m0 = spr.canvas;
    const w = hSafe * ((m0._refW || m0.width || 1) / (m0._refH || m0.height || 1));
    // Gölge: nesnenin taban genişliğine oranlı (ağaçlar daha geniş yayılır).
    return {
      h: hSafe, w: Number.isFinite(w) && w > 0.5 ? w : 0.5, spr, cfg, isTree,
      rx: Math.max(2, w * (isTree ? 0.50 : 0.44)),
      ry: Math.max(2, w * (isTree ? 0.20 : 0.17)),
    };
  },
  // ---- CEPHE / YÖN YARDIMCILARI -------------------------------------
  // Matematik (kodla doğrulanmış):
  //   bake azimutu      az  = rot + 45°
  //   görünen yön (rad)     = cephe - rot        [atan2(dx, dz) ölçüsü]
  //   hedefe dönme          rot = cephe - atan2(dx, dz)
  // cephe = FRONT_DEG[model] (0 = +Z). Dönüş çözünürlüğü 16 görünüm = 22.5°.
  frontDeg(model) {
    const v = FRONT_DEG[model];
    return Number.isFinite(v) ? v : 0;
  },
  // Dünyada (tx,ty) hedefine kapı bakacak şekilde `rot` üretir (0..2π).
  rotToFace(model, x, y, tx, ty) {
    const dx = Number(tx) - Number(x), dy = Number(ty) - Number(y);
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || (!dx && !dy)) return 0;
    const front = (api.frontDeg(model) * Math.PI) / 180;
    const r = front - Math.atan2(dx, dy);
    return ((r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  },
  // rot'tan görünen cephe yönü (radyan, atan2(dx,dz) ölçüsü).
  faceDir(model, rot) {
    const front = (api.frontDeg(model) * Math.PI) / 180;
    const r = front - (Number(rot) || 0);
    return ((r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  },
  // Teşhis: modelin tüm dönüşlerini etiketli bir tabloda açar.
  // Kapının göründüğü karenin rot değerini oku → cephe = -rot.
  contactSheet(model, type = "glb") {
    try {
      const bank = (api.sprites[type] && api.sprites[type][model]) || null;
      if (!bank || !bank.length) { console.warn("[3d] sprite yok:", type, model); return null; }
      const n = bank.length, cols = Math.min(8, n), rows = Math.ceil(n / cols);
      const cw = 220, chh = 270;
      const cv = document.createElement("canvas");
      cv.width = cols * cw; cv.height = rows * chh + 34;
      const g = cv.getContext("2d");
      g.fillStyle = "#26262e"; g.fillRect(0, 0, cv.width, cv.height);
      g.fillStyle = "#fff"; g.font = "bold 15px monospace";
      g.fillText(`${model} — ${n} görünüm | cephe (kapı) = ${api.frontDeg(model)}°`, 10, 22);
      bank.forEach((r, i) => {
        const rot = (i / n) * Math.PI * 2;
        const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * chh + 34;
        const c = r.canvas;
        const k = Math.min((cw - 16) / c.width, (chh - 44) / c.height);
        g.drawImage(c, x0 + (cw - c.width * k) / 2, y0 + (chh - 44 - c.height * k), c.width * k, c.height * k);
        g.fillStyle = "#9ae6b4"; g.font = "12px monospace";
        g.fillText(`rot ${Math.round((rot * 180) / Math.PI)}°`, x0 + 6, y0 + chh - 20);
        g.fillStyle = "#8ab4f8";
        g.fillText(`idx ${i}`, x0 + 6, y0 + chh - 6);
      });
      const w = window.open("", "_blank");
      if (w && w.document) {
        w.document.title = "Setra 3D — " + model;
        w.document.body.style.margin = "0";
        w.document.body.appendChild(cv);
      }
      return cv.toDataURL("image/png");
    } catch (e) {
      console.warn("[3d] contactSheet:", e && e.message);
      return null;
    }
  },
  // TravelEngine.drawSceneryItem içinden çağrılır. Çizerse true döner.
  drawScenery(ctx, s, x, y, engine) {
    if (!api.enabled) return false;
    try {
      return api._drawScenery(ctx, s, x, y, engine);
    } catch (e) {
      // Tek bir bozuk nesne tüm kareyi (oyuncu/diğer dekor dahil) düşürmesin.
      // Aynı hata mesajı bir kez loglanır (hata ayıklama görünür kalsın).
      const msg = (e && e.message) || String(e);
      api._warned = api._warned || new Set();
      if (!api._warned.has(msg) && api._warned.size < 6) {
        api._warned.add(msg);
        console.warn("[3d] çizim hatası:", msg);
      }
      return false;
    }
  },
  _drawScenery(ctx, s, x, y, engine) {
    const fp = api.footprint(s, engine);
    if (!fp) return false;
    const { h, w, spr, cfg, isTree } = fp;
    // Rüzgâr: taban etrafında çok küçük dönüş (ağaç glb'leri de sallanır).
    const sway = (cfg.sway || (isTree && cfg !== DECOR.tree))
      ? Math.sin(((engine && engine.time) || 0) * 1.8 + (s.swayOffset || 0)) * 0.018
      : 0;
    // Nesne tabanı (gx,gy) tam zemin noktasına oturur; ölçek modelin sabit
    // referans yüksekliğinden gelir → dönüşte ne boyut ne zemin kayar.
    const meta = spr.canvas;
    const refH = meta._refH || meta.height || 1;
    const refW = meta._refW || meta.width || 1;
    const k = h / refH;
    const cw = meta.width * k, ch = meta.height * k;
    // Taban temas gölgesi: genişlik/2 yarıçapta, hafif yayvan, iki katmanlı
    // (dış yumuşak + iç koyu) → nesne zemine "oturur", havada durmaz.
    const rx = fp.rx, ry = fp.ry;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    let grad = ctx.createRadialGradient(0, 0, rx * 0.35, 0, 0, rx);
    grad.addColorStop(0, "rgba(0,0,0,0.34)");
    grad.addColorStop(0.6, "rgba(0,0,0,0.16)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    // Temas noktası (çok küçük, koyu) — tabanın gerçekten değdiğini gösterir.
    const cr = Math.min(rx * 0.42, 16);
    grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cr);
    grad.addColorStop(0, "rgba(0,0,0,0.42)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    if (sway) ctx.rotate(sway);
    ctx.drawImage(
      api.tintSprite(meta, s.tint) || meta,
      -(meta._gx != null ? meta._gx : meta.width * 0.5) * k,
      -(meta._gy != null ? meta._gy : meta.height) * k,
      cw, ch
    );
    ctx.restore();
    return true;
  },
  // Örnek bazlı renk tonu (Dark Citadel = siyah, kar köyü = soğuk mavi).
  // Sprite bir kez tint'lenip önbelleğe alınır → kare başına ek maliyet yok.
  tintSprite(canvas, tint) {
    if (!canvas || !tint) return canvas;
    if (!api._tintCache) api._tintCache = new WeakMap();
    let per = api._tintCache.get(canvas);
    if (!per) { per = new Map(); api._tintCache.set(canvas, per); }
    const hit = per.get(tint);
    if (hit) return hit;
    const c = document.createElement("canvas");
    c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext("2d");
    g.drawImage(canvas, 0, 0);
    g.globalCompositeOperation = "source-atop"; // yalnızca sprite pikselleri
    g.fillStyle = tint;
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "source-over";
    per.set(tint, c);
    return c;
  },
  // Aynı ağaç/çalı her karede aynı görünsün: konum + tone deterministik tohum.
  pick(s, biome) {    const cfg = DECOR[s.type];
    if (!cfg) return null;
    const bucket = api.sprites[s.type] || {};
    const pool = (cfg.biomes && cfg.biomes[biome]) || cfg.default;
    let seed = Math.abs(Math.sin(
      (s.swayOffset || 0) * 7.13 + (s.wx || 0) * 0.137 + (s.wy || 0) * 0.211 + (s.tone || 0.5) * 3.7
    ));
    let model = (s.model && cfg.models[s.model]) ? s.model : pool[Math.floor(seed * pool.length) % pool.length];
    let list = bucket[model];
    if (!list || !list.length) {
      // Model yüklenemediyse türün ilk hazır modeline düş
      const any = Object.values(bucket).find((l) => l && l.length);
      if (!any) return null;
      list = any;
    }
    // Dünya Kurucu'da verilen açı (radyan) varsa en yakın pişmiş dönüşü seç.
    if (Number.isFinite(Number(s.rot)) && list.length > 1) {
      const n = list.length;
      let idx = Math.round((Number(s.rot) / (Math.PI * 2)) * n) % n;
      if (idx < 0) idx += n;
      return list[idx];
    }
    // Açı verilmemiş GLB yapı/nesneler karo ızgarasına HİZALI dursun (index 0).
    // Yalnızca ağaçlarda doğal görünüm için rastgele dönüş kullanılır.
    if (s.type !== "tree") return list[0];
    const seed2 = Math.abs(Math.sin(seed * 19.71 + (s.wx || 0) * 0.71));
    return list[Math.floor(seed2 * list.length) % list.length];
  },
};

window.Setra3DTrees = api;
window.toggleTrees3d = (on) => api.setEnabled(on === undefined ? !api.enabled : on);

(async () => {
  try {
    api.enabled = flagEnabled();
    const [THREE, { GLTFLoader }] = await Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
    ]);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true, // drawImage ile okumak için şart
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(1);
    renderer.setSize(SPRITE_W, SPRITE_H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    // Işıklar sahneye eklenir; model de sahneye eklenmezse SİYAH render olur.
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x40341f, 1.35));
    const sun = new THREE.DirectionalLight(0xfff2d8, 2.3);
    sun.position.set(-1.1, 2.2, 0.9);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x8fb0d6, 0.7);
    fill.position.set(1.2, 0.8, -1.0);
    scene.add(fill);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 500);
    const loader = new GLTFLoader();

    // Tuvalin şeffaf kenarlarını kırp → sprite tabanı tam modelin tabanı olur
    function trimCanvas(src) {
      let sctx = null;
      try { sctx = src.getContext("2d", { willReadFrequently: true }); } catch (_) { sctx = null; }
      if (!sctx) return src;
      let data;
      try { data = sctx.getImageData(0, 0, src.width, src.height); } catch (_) { return src; }
      const { width: w, height: h } = src;
      const px = data.data;
      let minX = w, minY = h, maxX = -1, maxY = -1;
      for (let y = 0; y < h; y++) {
        const row = y * w * 4;
        for (let x = 0; x < w; x++) {
          if (px[row + x * 4 + 3] > 8) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < minX || maxY < minY) return null;
      const cw = maxX - minX + 1;
      const ch = maxY - minY + 1;
      const out = document.createElement("canvas");
      out.width = cw;
      out.height = ch;
      out.getContext("2d").drawImage(src, minX, minY, cw, ch, 0, 0, cw, ch);
      return out;
    }

    const v3 = new THREE.Vector3();
    const box = new THREE.Box3();
    const _bb = new THREE.Box3();

    // Saydam olmayan alanın sınırları (kırpma YAPMADAN). Kırpılmış sprite
    // kullanınca her dönüşte tuval oranı değişiyordu → nesne döndürülünce
    // boyutu değişiyor gibi görünüyordu. Artık tüm dönüşler AYNI boyutta
    // tuvalde kalır; ölçek/anchor model bazlı sabit referanstan gelir.
    function alphaBounds(src) {
      // HIZ: tam çözünürlükte piksel taramak yerine 1/4 ölçekli kopyada
      // sınırlar bulunur (16x daha az piksel) → bake süresi ciddi kısalır.
      const sc = 4;
      const sw = Math.max(1, Math.round(src.width / sc));
      const sh = Math.max(1, Math.round(src.height / sc));
      let small;
      try {
        small = document.createElement("canvas");
        small.width = sw; small.height = sh;
        const sg = small.getContext("2d", { willReadFrequently: true });
        sg.drawImage(src, 0, 0, src.width, src.height, 0, 0, sw, sh);
      } catch (_) { return null; }
      let data;
      try { data = small.getContext("2d").getImageData(0, 0, sw, sh); } catch (_) { return null; }
      const px = data.data;
      let minX = sw, minY = sh, maxX = -1, maxY = -1;
      for (let y = 0; y < sh; y++) {
        const row = y * sw * 4;
        for (let x = 0; x < sw; x++) {
          if (px[row + x * 4 + 3] > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < minX || maxY < minY) return null;
      const pad = sc;
      return {
        minX: Math.max(0, minX * sc - pad), minY: Math.max(0, minY * sc - pad),
        maxX: Math.min(src.width - 1, maxX * sc + pad), maxY: Math.min(src.height - 1, maxY * sc + pad),
      };
    }

    function copyCanvas(src) {
      const c = document.createElement("canvas");
      c.width = src.width; c.height = src.height;
      c.getContext("2d").drawImage(src, 0, 0);
      return c;
    }

    // Yapraklı modeller: sprite kenarları yaprak yaprak, uçlara doğru saydam,
    // yeşil kütle hafif transparan. Taş/bina/kristal/çiçek dokunulmaz.
    const LEAFY = new Set(["oak", "pine", "birch", "autumn", "bush", "greywood"]);

    // ------------------------------------------------------------------
    // PROSEDÜREL YAPRAK DOKUSU
    //   Düz renkli low-poly kütleler "balon" gibi görünüyordu. Modele
    //   damla yaprak desenli bir doku + ALFA boşlukları verilir: yaprak
    //   aralarından arka plan görünür, silüet tırtıklı olur.
    //   Tek canvas üretilir (128²), tüm modeller paylaşır (optimizasyon).
    // ------------------------------------------------------------------
    let leafTexCache = null;
    function leafTexture() {
      if (leafTexCache) return leafTexCache;
      const S = 128;
      const c = document.createElement("canvas");
      c.width = c.height = S;
      const g = c.getContext("2d");
      let n = 1337;
      const rnd = () => { n = (n * 16807) % 2147483647; return n / 2147483647; };
      const leaf = (cx, cy, r, a, style, comp) => {
        g.globalCompositeOperation = comp || "source-over";
        g.save();
        g.translate(cx, cy);
        g.rotate(a);
        g.fillStyle = style;
        g.beginPath();
        g.moveTo(0, -r);
        g.quadraticCurveTo(r * 0.92, -r * 0.2, 0, r);
        g.quadraticCurveTo(-r * 0.92, -r * 0.2, 0, -r);
        g.fill();
        g.restore();
      };
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, S, S);
      // 1) Yaprak aralarındaki boşluklar (alfa 0)
      for (let i = 0; i < 105; i++) {
        leaf(rnd() * S, rnd() * S, 3.5 + rnd() * 7.5, rnd() * Math.PI * 2, "#000000", "destination-out");
      }
      // 2) Ton farkı: koyu/açık yaprak lekeleri (RGB, şeffaflık korunur)
      for (let i = 0; i < 150; i++) {
        const shade = rnd() > 0.5 ? "rgba(0,0,0,0.13)" : "rgba(255,255,255,0.17)";
        leaf(rnd() * S, rnd() * S, 2.5 + rnd() * 5.5, rnd() * Math.PI * 2, shade, "source-atop");
      }
      g.globalCompositeOperation = "source-over";
      leafTexCache = c;
      return c;
    }

    // Gövde olmayan (taç) mesh'lere yaprak dokusu + alfa kesimi uygular.
    function applyLeafMaterial(root) {
      const tex = new THREE.CanvasTexture(leafTexture());
      if ("colorSpace" in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      tex.anisotropy = 1;
      tex.needsUpdate = true;
      root.updateMatrixWorld(true);
      const vb = visibleBox(root);
      const crownY = vb ? vb.min.y + (vb.max.y - vb.min.y) * 0.3 : 0;
      const isGreen = (m) => {
        const col = m && m.color;
        return !!col && col.g >= col.r * 0.95 && col.g >= col.b * 0.95 && col.g > 0.12;
      };
      // Modelde yeşil (yaprak) malzeme var mı? Varsa YALNIZCA onlara doku
      // verilir; gövde asla delikli olmaz. Hiç yeşil yoksa (deadtree gibi)
      // üst %70 taç kabul edilir.
      let anyGreen = false;
      root.traverse((o) => {
        if (anyGreen || !o.isMesh || !o.visible) return;
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        if (ms.some(isGreen)) anyGreen = true;
      });
      root.traverse((o) => {
        if (!o.isMesh || !o.geometry || o.visible === false) return;
        const geo = o.geometry;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const greenish = mats.some(isGreen);
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox;
        let centerY = 0;
        if (bb) {
          const c = bb.getCenter(new THREE.Vector3());
          c.applyMatrix4(o.matrixWorld);
          centerY = c.y;
        }
        if (anyGreen) { if (!greenish) return; }
        else if (centerY < crownY) return;
        if (!geo.attributes.position) return;
        o.userData.__leafy = true;
        uvPlanar(geo);
        const out = mats.map((m) => {
          const mat = m.clone();
          mat.map = tex;
          // Alpha-test: yaprak boşlukları kesilir, sıralama derdi olmadan
          // (transparent=false) hızlı kalır. Yumuşak saydamlık sprite
          // pişirme sonrası softenLeaves() ile verilir.
          mat.alphaTest = 0.42;
          mat.transparent = false;
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
          return mat;
        });
        o.material = Array.isArray(o.material) ? out : out[0];
      });
    }

    // Gövde dokusu: dikey damarlı kahverengi (tek canvas, tüm modeller paylaşır).
    let barkTexCache = null;
    function barkTexture() {
      if (barkTexCache) return barkTexCache;
      const S = 64, c = document.createElement("canvas");
      c.width = c.height = S;
      const g = c.getContext("2d");
      g.fillStyle = "#7b5b3c"; g.fillRect(0, 0, S, S);
      let n = 7;
      const rnd = () => { n = (n * 48271) % 2147483647; return n / 2147483647; };
      for (let i = 0; i < 110; i++) {
        const x = rnd() * S, y = rnd() * S, w = 1 + rnd() * 2.2, h = 6 + rnd() * 30;
        g.fillStyle = rnd() > 0.5 ? "rgba(38,24,12,0.55)" : "rgba(158,126,90,0.42)";
        g.fillRect(x, y, w, h);
      }
      barkTexCache = c;
      return c;
    }

    function uvPlanar(geo) {
      if (geo.attributes.uv || !geo.attributes.position) return;
      if (!geo.boundingBox) geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const pos = geo.attributes.position;
      const sx = Math.max(0.001, bb.max.x - bb.min.x);
      const sy = Math.max(0.001, bb.max.y - bb.min.y);
      const sz = Math.max(0.001, bb.max.z - bb.min.z);
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) - bb.min.x, y = pos.getY(i) - bb.min.y, z = pos.getZ(i) - bb.min.z;
        if (sy <= sx && sy <= sz) { uv[i * 2] = x / sx; uv[i * 2 + 1] = z / sz; }
        else { uv[i * 2] = x / sx; uv[i * 2 + 1] = y / sy; }
      }
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    }

    // Gövde: kabuk dokusu + incelme (gerçekçi, kalın olmayan gövde).
    function naturalStone(root, sat) {
      const hsl = { h: 0, s: 0, l: 0 };
      root.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const out = mats.map((m) => {
          const mat = m.clone();
          if (mat.color && mat.color.getHSL) {
            mat.color.getHSL(hsl);
            mat.color.setHSL(hsl.h, hsl.s * sat, Math.min(0.86, Math.max(0.16, hsl.l)));
          }
          mat.needsUpdate = true;
          return mat;
        });
        o.material = Array.isArray(o.material) ? out : out[0];
      });
    }

    function applyBark(root, opts) {
      const o = opts || {};
      const tex = new THREE.CanvasTexture(barkTexture());
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 2);
      root.traverse((m) => {
        if (!m.isMesh || !m.geometry || m.visible === false) return;
        if (m.userData && m.userData.__leafy) return;
        const geo = m.geometry;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox;
        if (o.thin && o.thin !== 1 && geo.attributes.position && bb) {
          const pos = geo.attributes.position;
          const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
          for (let i = 0; i < pos.count; i++) {
            pos.setX(i, cx + (pos.getX(i) - cx) * o.thin);
            pos.setZ(i, cz + (pos.getZ(i) - cz) * o.thin);
          }
          pos.needsUpdate = true;
          geo.computeBoundingBox(); geo.computeBoundingSphere();
        }
        uvPlanar(geo);
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        const out = mats.map((mm) => {
          const mat = mm.clone();
          // Gövdede alfa kesimi yok: doku doğrudan renk olarak biner.
          if (o.map !== false) mat.map = tex;
          mat.alphaTest = 0;
          mat.needsUpdate = true;
          if (o.tint != null && mat.color && mat.color.setHex) mat.color.setHex(o.tint);
          return mat;
        });
        m.material = Array.isArray(m.material) ? out : out[0];
      });
    }

    // Yaprak kümesi (kafa/dolgunluk): low-poly ikosahedron + yaprak dokusu.
    let leafTexShared = null;
    function leafTex3D() {
      if (!leafTexShared) {
        const t = new THREE.CanvasTexture(leafTexture());
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(2, 2);
        leafTexShared = t;
      }
      return leafTexShared;
    }
    function addLeafClusters(vb, count, sizeMul, tint) {
      if (!vb) return [];
      const size = vb.getSize(new THREE.Vector3());
      const mat = new THREE.MeshStandardMaterial({
        map: leafTex3D(), color: tint != null ? tint : 0x6d9c50,
        alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.95, metalness: 0,
      });
      const added = [];
      const r = Math.max(size.x, size.z) * 0.3 * (sizeMul || 1);
      for (let i = 0; i < count; i++) {
        const rr = r * (0.82 + 0.32 * (((i * 37) % 10) / 10));
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(rr, 0), mat);
        const spread = count > 1 ? (i / (count - 1) - 0.5) * 2 : 0;
        mesh.position.set(
          vb.min.x + size.x * (0.5 + spread * 0.3),
          vb.min.y + size.y * (0.78 + (i % 2) * 0.05),
          vb.min.z + size.z * (0.5 + spread * 0.08)
        );
        scene.add(mesh);
        added.push(mesh);
      }
      return added;
    }

    function softenLeavesIn(canvas, bounds) {
      const out = softenLeaves(canvas, bounds);
      if (!out || out === canvas) return;
      const g = canvas.getContext("2d");
      g.clearRect(0, 0, canvas.width, canvas.height);
      g.drawImage(out, 0, 0);
    }

    function softenLeaves(src, bounds) {
      const w = src.width, h = src.height;
      if (!w || !h) return src;
      const out = document.createElement("canvas");
      out.width = w; out.height = h;
      const g = out.getContext("2d", { willReadFrequently: true });
      g.drawImage(src, 0, 0);
      let img;
      try { img = g.getImageData(0, 0, w, h); } catch (_) { return src; }
      const px = img.data;
      // Silüet testi DEĞİŞMEYEN alfa üzerinden (tek kopya, indeks matematiği;
      // closure çağrısı yok → pişirme süresi belirgin şekilde kısalır).
      const srcA = new Uint8Array(w * h);
      for (let i = 0, n = w * h; i < n; i++) srcA[i] = px[i * 4 + 3];
      let hs = 12345;
      const vTop = bounds ? bounds.minY : 0;
      const vH = bounds ? Math.max(1, bounds.maxY - bounds.minY) : h;
      const fadeTo = Math.round(vTop + vH * 0.24);
      for (let y = 0; y < h; y++) {
        const topK = y >= vTop && y < fadeTo ? 0.52 + 0.48 * ((y - vTop) / Math.max(1, fadeTo - vTop)) : 1;
        const row = y * w;
        for (let x = 0; x < w; x++) {
          const p = row + x;
          const i = p * 4;
          const a = srcA[p];
          if (a <= 6) continue;
          // 4 komşu + 4 çapraz: kenar tespiti
          const up = p - w, dn = p + w;
          const edge1 = (x === 0 || srcA[p - 1] <= 6) || (x === w - 1 || srcA[p + 1] <= 6) ||
                        (y === 0 || srcA[up] <= 6) || (y === h - 1 || srcA[dn] <= 6);
          hs = (Math.imul(hs, 16807) + 11) & 0x7fffffff;
          const nz = (hs % 1000) / 1000;
          let k = 1;
          if (edge1) k = 0.20 + 0.62 * nz;
          else {
            const edge2 = (x < 2 || srcA[p - 2] <= 6) || (x > w - 3 || srcA[p + 2] <= 6) ||
                          (y < 2 || srcA[p - 2 * w] <= 6) || (y > h - 3 || srcA[p + 2 * w] <= 6);
            if (edge2) k = 0.64 + 0.36 * nz;
          }
          const r0 = px[i], g0 = px[i + 1], b0 = px[i + 2];
          if (g0 >= r0 * 0.92 && g0 >= b0 * 0.92 && g0 > 30) k *= 0.88;
          px[i + 3] = a * k * topK;
        }
      }
      g.putImageData(img, 0, 0);
      return out;
    }

    // Yalnızca GÖRÜNÜR mesh'lerin sınırı. Gizli/yardımcı geometri tabanı
    // aşağı çekip modelin "havada" durmasına yol açabiliyordu; bunu önler.
    function visibleBox(root) {
      root.updateMatrixWorld(true);
      _bb.makeEmpty();
      let any = false;
      root.traverse((o) => {
        if (!o.isMesh || o.visible === false || !o.geometry) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        const gbb = o.geometry.boundingBox;
        if (!gbb) return;
        const world = gbb.clone().applyMatrix4(o.matrixWorld);
        if (!any) { _bb.copy(world); any = true; } else _bb.union(world);
      });
      return any ? _bb : null;
    }

    async function bakeModel(id, url) {
      const gltf = await new Promise((res, rej) => loader.load(url, res, undefined, rej));
      const root = gltf.scene;
      scene.add(root); // ışıklar sahnede: model sahneye eklenmezse siyah render olur

      // Tabana hizala: x/z merkez, y = 0 zemin (yalnızca görünür geometri)
      root.updateMatrixWorld(true);
      const vb0 = visibleBox(root);
      if (vb0) box.copy(vb0); else box.setFromObject(root);
      root.position.x -= (box.min.x + box.max.x) / 2;
      root.position.z -= (box.min.z + box.max.z) / 2;
      root.position.y -= box.min.y;
      root.updateMatrixWorld(true);
      const vb1 = visibleBox(root);
      if (vb1) box.copy(vb1); else box.setFromObject(root);

      const size = box.getSize(v3);
      const targetH = size.y || 1;

      // Her doku adımı AYRI korunur: biri hata verse bile model pişmeye devam
      // eder (tek hata tüm sprite bankasını düşürmesin).
      //
      // GÜVENLİ MOD: yeni eklenen (kabuk dokusu / yaprak kümeleri / taş
      // desatürasyonu) adımlar şimdilik KAPALI. Bunlar bazı modellerde bake'i
      // bozup "her şey düz kahverengi" görünümüne yol açtı; kanıtlanmış yol
      // (yaprak dokusu) açık kalıyor. Tek tek açılacak.
      const SAFE = { barkMap: true, clusters: true, stone: true };
      if (LEAFY.has(id)) {
        try { applyLeafMaterial(root); } catch (e) { console.warn("[3d] yaprak doku:", id, e && e.message); }
      }
      const clusters = [];
      try {
        if (TREE_MODELS.has(id)) {
          applyBark(root, { thin: 0.8, map: SAFE.barkMap, tint: id === "greywood" ? 0xb4aca0 : null });
        } else if (id === "bush") {
          applyBark(root, { thin: 1, map: SAFE.barkMap });
        }
      } catch (e) { console.warn("[3d] gövde:", id, e && e.message); }
      try {
        if (SAFE.stone && (id === "bigrock" || id === "rocks")) naturalStone(root, 0.16);
      } catch (e) { console.warn("[3d] taş:", id, e && e.message); }
      try {
        if (SAFE.clusters) {
          const vbCl = visibleBox(root) || box;
          if (id === "greywood") clusters.push.apply(clusters, addLeafClusters(vbCl, 2, 1.15, 0x5c8b46));
          else if (id === "bush") clusters.push.apply(clusters, addLeafClusters(vbCl, 3, 0.72, 0x5f8f4a));
        }
      } catch (e) { console.warn("[3d] yaprak kümesi:", id, e && e.message); }

      // Model boyutuna göre tuval çözünürlüğü (büyük yapılar keskin pişer).
      const dims = spriteDims(id, size);
      const cw = dims[0], ch = dims[1];
      const aspect = cw / ch;

      // Gerçek izometrik açı (35.264°) + 45° azimut → karo ızgarasıyla tam hizalı.
      const elev = 0.6155;
      const cosE = Math.cos(elev);
      const sinE = Math.sin(elev);
      // İzdüşüm sınırları (tüm azimutlar): yatay sqrt(sx²+sz²), dikey sy·cosE+diag·sinE.
      const diag = Math.hypot(size.x, size.z) || Math.max(size.x, size.z) || 1;
      const projW = diag;
      const projH = targetH * cosE + diag * sinE;
      const pad = 1.14; // tepe/taban kırpılmasın
      const vExtent = Math.max(projH * pad, (projW * pad) / aspect);
      const hExtent = vExtent * aspect;
      camera.left = -hExtent / 2;
      camera.right = hExtent / 2;
      camera.top = vExtent / 2;
      camera.bottom = -vExtent / 2;
      camera.near = 0.05;
      camera.far = Math.max(size.x, size.y, size.z) * 12 + 10;
      camera.updateProjectionMatrix();

      // Renderer + okuma tuvalini bu modele göre boyutlandır.
      renderer.setSize(cw, ch, false);
      const c2 = document.createElement("canvas");
      c2.width = cw;
      c2.height = ch;
      const c2ctx = c2.getContext("2d", { willReadFrequently: true });

      const target = new THREE.Vector3(0, targetH / 2, 0);
      const dist = Math.max(size.x, size.y, size.z) * 4 + 4;

      const list = [];
      const rots = rotsFor(id);
      for (let i = 0; i < rots; i++) {
        const az = (i / rots) * Math.PI * 2 + Math.PI / 4;
        camera.position.set(
          target.x + Math.sin(az) * Math.cos(elev) * dist,
          target.y + Math.sin(elev) * dist,
          target.z + Math.cos(az) * Math.cos(elev) * dist
        );
        camera.lookAt(target);
        renderer.clear();
        renderer.render(scene, camera);
        c2ctx.clearRect(0, 0, cw, ch);
        c2ctx.drawImage(renderer.domElement, 0, 0, cw, ch);
        const b = alphaBounds(c2);
        if (b) {
          // Model taban merkezinin (0,0,0) ekran karşılığı: tüm dönüşlerde
          // aynı piksel → sprite bu noktadan zemine oturtulur (havada durmaz).
          v3.set(0, 0, 0).project(camera);
          const gx = (v3.x * 0.5 + 0.5) * cw;
          const gy = (-v3.y * 0.5 + 0.5) * ch;
          const full = copyCanvas(c2);
          if (LEAFY.has(id)) {
            try { softenLeavesIn(full, b); } catch (_) {}
          }
          list.push({ canvas: full, top: b.minY, bottom: b.maxY, left: b.minX, right: b.maxX, gx, gy });
        }
      }
      if (!list.length) console.warn("[3d] sprite boş:", id);

      // Model bazlı SABİT ölçek referansı: tüm dönüşler aynı `refH` ile
      // çizilir → nesne döndürülünce boyutu değişmez. Taban noktası (gx,gy)
      // da dönüşten bağımsız olduğu için zemin teması korunur.
      if (list.length) {
        // Tüm dönüşler ORTAK bir dikdörtgene kırpılır → hepsi aynı boyut
        // (dönüşte ölçek değişmez) + boş tuval belleği şişirmez.
        let ux0 = Infinity, uy0 = Infinity, ux1 = -1, uy1 = -1;
        for (const r of list) {
          ux0 = Math.min(ux0, r.left); uy0 = Math.min(uy0, r.top);
          ux1 = Math.max(ux1, r.right); uy1 = Math.max(uy1, r.bottom);
        }
        const cwU = Math.max(1, ux1 - ux0 + 1), chU = Math.max(1, uy1 - uy0 + 1);
        let refH = 1, refW = 1;
        for (let i = 0; i < list.length; i++) {
          const r = list[i];
          const c = document.createElement("canvas");
          c.width = cwU; c.height = chU;
          c.getContext("2d").drawImage(r.canvas, ux0, uy0, cwU, chU, 0, 0, cwU, chU);
          r.canvas = c;
          refH = Math.max(refH, r.bottom - r.top);
          refW = Math.max(refW, r.right - r.left);
        }
        const gx0 = list[0].gx - ux0, gy0 = list[0].gy - uy0;
        for (const r of list) {
          r.canvas._gx = gx0;
          r.canvas._gy = gy0;
          r.canvas._refH = refH;
          r.canvas._refW = refW;
        }
      }

      // Yaprak kümelerini sahneden düşür (bellek sızmasın).
      for (const cl of clusters) {
        scene.remove(cl);
        if (cl.geometry) cl.geometry.dispose();
      }

      // GPU belleğini bırak (PAYLAŞILAN doku canvas'ları korunur)
      scene.remove(root);
      root.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (!o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const mat of mats) {
          try {
            const img = mat && mat.map && mat.map.image;
            if (img && img !== leafTexCache && img !== barkTexCache) mat.map.dispose();
          } catch (_) {}
          if (mat) mat.dispose();
        }
      });
      return list;
    }

    // Tüm dekor türlerini sırayla pişir (tek WebGL context)
    for (const [type, cfg] of Object.entries(DECOR)) {
      api.sprites[type] = {};
      for (const [id, url] of Object.entries(cfg.models)) {
        const list = await bakeModel(id, url).catch((e) => {
          console.warn("[3d] " + id + " yüklenemedi", e);
          return [];
        });
        if (list.length) api.sprites[type][id] = list;
        // Her başarılı modelde "hazır" işaretle: sonraki bir model hata verse
        // bile pişen sprite'lar kullanılsın (hepsi vektör çizime düşmesin).
        if (list.length) api.ready = true;
      }
    }

    api.ready = Object.values(api.sprites).some((b) => Object.keys(b).length > 0);
    if (api.ready) {
      const summary = Object.entries(api.sprites)
        .map(([t, b]) => t + ":" + Object.keys(b).join("/"))
        .join(" | ");
      console.log("[3d] hazır |", summary, "| enabled:", api.enabled);
    }
  } catch (e) {
    api.error = e;
    api.ready = false;
    console.warn("[3d] devre dışı, vektör çizim kullanılıyor:", e && e.message ? e.message : e);
  }
})();
