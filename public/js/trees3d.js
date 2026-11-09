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
    default: ["oak", "pine", "birch", "autumn"],
    biomes: {
      verdant: ["oak", "pine", "birch", "autumn"],
      forest: ["oak", "pine", "birch"],
      frost: ["pine", "birch"],
      frozen: ["pine", "birch"],
      snow: ["pine", "birch"],
      ashen: ["deadtree", "oak"],
      cursed: ["deadtree", "oak"],
      swamp: ["deadtree", "birch"],
      mirefen: ["deadtree", "birch"],
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

const SPRITE_W = 176;   // varsayılan sprite tuvali (px) — küçük nesneler
const SPRITE_H = 240;
const ROTS = 24;        // model başına dönüş sayısı (15° adım — editörle aynı)
/** Model boyutuna göre sprite çözünürlüğü — büyük yapılar daha keskin pişer. */
function spriteDims(model, size) {
  const maxDim = Math.max(size.x, size.y, size.z);
  if (TREE_MODELS.has(model)) return [208, 284];
  if (maxDim >= 42) return [320, 424];
  if (maxDim >= 24) return [240, 320];
  return [176, 240];
}
const MODEL_ALIAS = { boulder: "bigrock", mountain: "bigrock", lantern: "lamp", mushroom: "crystals", shrine: "obelisk", deadtree: "deadtree" };

// ---------------------------------------------------------------------
// DÜNYA GÖRSEL ÖLÇEĞİ
//   GameCraft > Dünya Kurucu'dan world_setra.json `visual` alanı ile gelir.
//   travelEngine map.world.visual -> window.SETRA_WORLD_TUNING aktarır.
// ---------------------------------------------------------------------
const TUNE_DEFAULT = { treeScale: 3.0, structureScale: 2.6 };
const TREE_MODELS = new Set(["oak", "pine", "birch", "autumn", "deadtree"]);
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
  // sprites[type][modelId] = [{ canvas }]
  sprites: {},
  setEnabled(on) {
    api.enabled = !!on;
    try { localStorage.setItem("setra.trees3d", on ? "1" : "0"); } catch (_) {}
    return api.enabled;
  },
  // TravelEngine.drawSceneryItem içinden çağrılır. Çizerse true döner.
  drawScenery(ctx, s, x, y, engine) {
    if (!api.enabled || !api.ready || !s) return false;
    let obj = s;
    if (obj.type === "glb" || (!DECOR[obj.type] && MODEL_ALIAS[obj.type])) {
      obj = Object.assign({}, obj, { type: "glb", model: obj.model || MODEL_ALIAS[obj.type] });
    }
    const cfg = DECOR[obj.type];
    if (!cfg) return false;
    const spr = api.pick(obj, engine && engine.biome);
    if (!spr) return false;
    const sc = obj.scale || 1;
    // Ölçek: dünya ayarı (visual) + obje başına mutlak yükseklik (props.height)
    const t = tune();
    const isTree = obj.type === "tree" || TREE_MODELS.has(obj.model);
    // preScaled: travelEngine zaten dünya ölçeğini (structureScale) uygulamış
    // (yapılar/POI'ler). Çift çarpmayı önlemek için burada 1 kullan.
    const scaleMul = isTree ? t.treeScale : (obj.preScaled ? 1 : t.structureScale);
    const perHeight = Number(obj.height);
    const baseH = (cfg.heights && cfg.heights[obj.model]) || cfg.height;
    const h = (Number.isFinite(perHeight) && perHeight > 0 ? perHeight : baseH * scaleMul) * sc;
    const w = h * (spr.canvas.width / spr.canvas.height);
    // Rüzgâr: taban etrafında çok küçük dönüş
    const sway = cfg.sway
      ? Math.sin(((engine && engine.time) || 0) * 1.8 + (s.swayOffset || 0)) * 0.018
      : 0;
    // Nesneyi biraz aşağı oturt + tabana yumuşak gölge: sprite'lar havada
    // ("fotoğraf" gibi) durmasın. Gölge rüzgârla dönmez.
    const drop = Math.max(1, h * 0.03);
    const shR = w * 0.36;
    if (shR > 1.5) {
      ctx.save();
      ctx.translate(x, y + drop);
      ctx.scale(1, 0.42);
      const grad = ctx.createRadialGradient(0, 0, shR * 0.12, 0, 0, shR);
      grad.addColorStop(0, "rgba(0,0,0,0.36)");
      grad.addColorStop(0.65, "rgba(0,0,0,0.18)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, shR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(x, y + drop);
    if (sway) ctx.rotate(sway);
    ctx.drawImage(spr.canvas, -w / 2, -h, w, h);
    ctx.restore();
    return true;
  },
  // Aynı ağaç/çalı her karede aynı görünsün: konum + tone deterministik tohum.
  pick(s, biome) {
    const cfg = DECOR[s.type];
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
      for (let i = 0; i < ROTS; i++) {
        const az = (i / ROTS) * Math.PI * 2 + Math.PI / 4;
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
        const trimmed = trimCanvas(c2);
        if (trimmed) list.push({ canvas: trimmed });
      }
      if (!list.length) console.warn("[3d] sprite boş:", id);

      // GPU belleğini bırak
      scene.remove(root);
      root.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
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
