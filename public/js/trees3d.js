/* =====================================================================
   Setra 3D Dekor Denemesi (geri alÄ±nabilir)
   ---------------------------------------------------------------------
   newassets/*.glb modelleri bir kez offscreen WebGL ile sprite'a
   (ÅŸeffaf canvas) piÅŸirilir, sonra ARPG haritasÄ±nda drawImage ile
   vektÃ¶r Ã§izimin yerine basÄ±lÄ±r.

   Yeni model eklemek: aÅŸaÄŸÄ±daki DECOR tablosuna bak (tek blok).
   Kapatmak iÃ§in:  ?trees3d=0  veya localStorage.setItem('setra.trees3d','0')
   AnÄ±nda:         Setra3DTrees.setEnabled(false)
   ModÃ¼l yÃ¼klenemezse oyun eski vektÃ¶r Ã§izime dÃ¼ÅŸer.

   DetaylÄ± rehber: 3D-ASSETS.md
   ===================================================================== */

// ---------------------------------------------------------------------
// DEKOR TABLOSU
//   key      = TravelEngine scenery `type` deÄŸeri ('tree', 'bush', ...)
//   height   = dÃ¼nya Ã¶lÃ§eÄŸinde Ã§izim yÃ¼ksekliÄŸi (px, s.scale = 1 iken)
//   sway     = rÃ¼zgÃ¢r salÄ±nÄ±mÄ± (taban etrafÄ±nda ufak dÃ¶nÃ¼ÅŸ)
//   models   = id -> glb yolu  (/newassets ÅŸu an server.js'te servis ediliyor)
//   biomes   = biyom id -> model id havuzu (yoksa `default` kullanÄ±lÄ±r)
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
      // Söğüt: şimdilik deadtree gövdesinden türetilir (sarkan sarmaşıklar
      // bake sırasında eklenir). Gerçek bir model gelirse SADECE bu yolu
      // "/newassets/willow.glb" yap — türetme otomatik devre dışı kalır.
      willow: "/newassets/deadtree.glb",
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
      swamp: ["willow", "willow", "deadtree", "birch"],
      mirefen: ["willow", "willow", "willow", "deadtree", "birch"],
    },
  },

  // Kaya / dev taş. ÖNEMLİ: `noScale` → dünya ölçeği (structureScale) ile
  // çarpılmaz. Önceden boulder/mountain glb sayılıp 2.6× büyütülüyordu;
  // "yan yana kocaman taşlar" görüntüsünün ana nedeni buydu.
  boulder: {
    height: 46,
    noScale: true,
    sway: false,
    models: {
      bigrock: "/newassets/bigrock.glb",
      rocks: "/newassets/rocks.glb",
      pillars: "/newassets/pillars.glb",
    },
    default: ["rocks", "rocks", "bigrock"],
    biomes: {
      verdant: ["rocks", "rocks", "bigrock"],
      forest: ["rocks", "rocks", "bigrock", "rocks"],
      meadow: ["rocks", "rocks", "bigrock"],
      swamp: ["rocks", "rocks", "bigrock"],
      mirefen: ["rocks", "rocks", "bigrock"],
      frost: ["bigrock", "rocks", "bigrock"],
      frozen: ["bigrock", "rocks", "bigrock"],
      ashen: ["bigrock", "bigrock", "rocks"],
      volcanic: ["bigrock", "bigrock", "rocks"],
      cursed: ["rocks", "pillars", "bigrock"],
      desert: ["rocks", "bigrock", "rocks"],
    },
  },

  // Harita kenarını çeviren büyük kaya kütlesi (tek sıra, seyrek).
  mountain: {
    height: 92,
    noScale: true,
    sway: false,
    models: {
      bigrock: "/newassets/bigrock.glb",
      rocks: "/newassets/rocks.glb",
    },
    default: ["bigrock", "bigrock", "rocks"],
    biomes: {
      frost: ["bigrock", "rocks"],
      frozen: ["bigrock", "rocks"],
      ashen: ["bigrock", "bigrock"],
      volcanic: ["bigrock", "bigrock"],
      cursed: ["bigrock", "rocks"],
    },
  },

  bush: {
    height: 26,
    noScale: true,
    sway: true,
    models: {
      bush: "/newassets/bush.glb",
      flowers: "/newassets/flowers.glb",
    },
    default: ["bush", "bush", "flowers"],
    biomes: {
      verdant: ["flowers", "bush", "flowers", "bush"],
      forest: ["bush", "bush", "flowers"],
      swamp: ["bush", "flowers", "bush"],
      mirefen: ["bush", "flowers", "bush"],
      frost: ["bush"],
      frozen: ["bush"],
      ashen: ["bush"],
      cursed: ["flowers", "bush"],
    },
  },

  // Sabit yapÄ±/POI ve vektÃ¶r dekorlarÄ±n ortak model havuzu.
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
      // deadtree modelinden tÃ¼retilmiÅŸ ikinci aÄŸaÃ§ tÃ¼rÃ¼: gri gÃ¶vde + 2 yaprak
      // kÃ¼mesi (bake sÄ±rasÄ±nda eklenir) â†’ "greywood".
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

  // Ã–RNEK: Ã§alÄ±yÄ± da 3D yapmak iÃ§in bu bloÄŸu aÃ§ ve
  // travelEngine.js drawSceneryItem() iÃ§indeki 'bush' dalÄ±nÄ±n baÅŸÄ±na
  //   if (window.Setra3DTrees && window.Setra3DTrees.drawScenery(ctx, s, x, y, this)) return;
  // satÄ±rÄ±nÄ± ekle.
  // bush: {
  //   height: 26,
  //   sway: true,
  //   models: { bush: "/newassets/bush.glb" },
  //   default: ["bush"],
  //   biomes: {},
  // },
};

// ---------------------------------------------------------------------
// CEPHE (KAPI) YÃ–NÃœ â€” model baÅŸÄ±na dÃ¼zeltme, DERECE
//   SÃ–ZLEÅME: tÃ¼m yapÄ± modelleri KAPISI local +Z yÃ¶nÃ¼nde export edilir (0Â°).
//   build_villages.js evleri bu varsayÄ±mla plazaya dÃ¶ndÃ¼rÃ¼r.
//   Bir model farklÄ± export edilmiÅŸse buraya yaz:
//     +Z = 0 | +X = 90 | -Z = 180 | -X = 270   (Ã¶rn. kapÄ± arkada: hut: 180)
//   DoÄŸrulama: konsolda  Setra3DTrees.contactSheet("hut")
//   â†’ 16 gÃ¶rÃ¼nÃ¼m + her gÃ¶rÃ¼nÃ¼mÃ¼n rot deÄŸeri; kapÄ±nÄ±n gÃ¶rÃ¼ndÃ¼ÄŸÃ¼ kareyi bul,
//     o karedeki rot = -cephe  â†’  cephe = -rot.
// ---------------------------------------------------------------------
const FRONT_DEG = {
  // hut: 180,
};

// ---------------------------------------------------------------------
// MODEL Ã–LÃ‡ÃœLERÄ° (GLB'den Ã¶lÃ§Ã¼ldÃ¼: newassets/<model>.glb)
//   w = geniÅŸlik / yÃ¼kseklik, d = derinlik / yÃ¼kseklik
//   Sprite piÅŸmeden Ã¶nce de gerÃ§ek ayak izi hesaplanabilsin diye burada.
//   Yenilemek iÃ§in:  node scripts/glb_info.js newassets
// ---------------------------------------------------------------------
const MODEL_SIZE = {
  applecrates: { w: 2.528, d: 1.817 }, autumn: { w: 0.833, d: 0.796 },
  banner: { w: 0.291, d: 0.204 }, barn: { w: 1.21, d: 1.374 },
  barrels: { w: 2.409, d: 2.33 }, bigrock: { w: 1.516, d: 1.149 },
  birch: { w: 0.553, d: 0.452 }, bridge: { w: 0.944, d: 3.556 },
  bush: { w: 1.891, d: 1.471 }, campfire: { w: 3.013, d: 2.972 },
  cart: { w: 2.008, d: 1.09 }, chapel: { w: 0.414, d: 0.665 },
  chest: { w: 2.635, d: 2.635 }, crystals: { w: 0.719, d: 0.784 },
  deadtree: { w: 0.432, d: 0.406 }, farmhouse: { w: 1.062, d: 0.881 },
  fence: { w: 3.786, d: 0.214 }, flowers: { w: 4.318, d: 3.896 },
  gatehouse: { w: 1.209, d: 0.558 }, graves: { w: 2.23, d: 1.6 },
  haybales: { w: 1.962, d: 1.219 }, hut: { w: 1.143, d: 1.172 },
  lamp: { w: 0.316, d: 0.2 }, logs: { w: 2, d: 1.6 },
  longhouse: { w: 1.784, d: 0.884 }, oak: { w: 0.833, d: 0.796 },
  obelisk: { w: 0.805, d: 0.805 }, pillars: { w: 0.692, d: 0.608 },
  pine: { w: 0.601, d: 0.601 }, rocks: { w: 3.592, d: 2.803 },
  roundtower: { w: 0.487, d: 0.5 }, signpost: { w: 0.862, d: 0.256 },
  smithy: { w: 1.182, d: 1.001 }, stall: { w: 0.986, d: 0.736 },
  stonehouse: { w: 0.774, d: 0.802 }, stump: { w: 0.945, d: 0.945 },
  tavern: { w: 0.889, d: 0.816 }, tent: { w: 1.798, d: 1.864 },
  wall: { w: 1.704, d: 0.481 }, watchtower: { w: 0.424, d: 0.424 },
  well: { w: 0.755, d: 0.526 }, windmill: { w: 0.933, d: 0.48 },
};


const SPRITE_W = 176;   // varsayÄ±lan sprite tuvali (px) â€” kÃ¼Ã§Ã¼k nesneler
const SPRITE_H = 240;
const ROTS = 24;         // aÄŸaÃ§lar (15Â° adÄ±m)
const ROTS_STRUCT = 16;  // yapÄ±lar (22.5Â° adÄ±m) â€” daha yÃ¼ksek Ã§Ã¶zÃ¼nÃ¼rlÃ¼ÄŸe yer aÃ§ar
// AÄŸaÃ§: 24 dÃ¶nÃ¼ÅŸ. YapÄ±: 16 dÃ¶nÃ¼ÅŸ (bellek aynÄ± kalÄ±rken sprite Ã§Ã¶zÃ¼nÃ¼rlÃ¼ÄŸÃ¼ artar).
const rotsFor = (model) => (TREE_MODELS.has(model) ? ROTS : ROTS_STRUCT);
/** Model boyutuna gÃ¶re sprite Ã§Ã¶zÃ¼nÃ¼rlÃ¼ÄŸÃ¼ â€” piksel gÃ¶rÃ¼nmesin diye yÃ¼ksek tutuldu. */
function spriteDims(model, size) {
  const maxDim = Math.max(size.x, size.y, size.z);
  if (TREE_MODELS.has(model)) return [288, 384];
  if (maxDim >= 42) return [576, 768];
  if (maxDim >= 20) return [416, 552];
  if (maxDim >= 12) return [352, 468];
  return [288, 384];
}
const MODEL_ALIAS = { boulder: "bigrock", mountain: "bigrock", lantern: "lamp", mushroom: "crystals", shrine: "obelisk", deadtree: "deadtree", willow: "willow", snowpine: "pine" };
// Doğal dekor: bu türler 16 hazır açıdan rastgele birini kullanır.
const RANDOM_ROT = new Set(["tree", "bush", "boulder", "mountain", "reeds"]);

// ---------------------------------------------------------------------
// MODEL AYARI (global) â€” DÃ¼nya Kurucu: world_setra.json -> visual.modelTune
//   modelTune: {
//     haybales: { hMul: 1.15, sink: 4 },     // TÃœM balyalar: %15 uzun, 4px aÅŸaÄŸÄ±
//     obelisk:  { sink: 6, solid: 1.05 },    // taÅŸ: 6px gÃ¶m, Ã§arpÄ±ÅŸma 1.05 karo
//   }
//   hMul    = yÃ¼kseklik Ã§arpanÄ± (varsayÄ±lan 1)
//   sink    = sprite'Ä± dÃ¼nya px AÅAÄI kaydÄ±r (negatif = yukarÄ±)
//   solid   = mutlak Ã§arpÄ±ÅŸma yarÄ±Ã§apÄ± (karo); yoksa otomatik (gerÃ§ek ayak izi)
//   solidMul= otomatik yarÄ±Ã§ap Ã§arpanÄ± (varsayÄ±lan 1)
// ---------------------------------------------------------------------
function modelTuneOf(engine, model) {
  if (!model) return null;
  let t = null;
  try {
    t = engine && engine.worldConfig && engine.worldConfig.visual && engine.worldConfig.visual.modelTune;
  } catch (_) { t = null; }
  const v = t && t[model];
  return v && typeof v === "object" ? v : null;
}

// ---------------------------------------------------------------------
// DÃœNYA GÃ–RSEL Ã–LÃ‡EÄÄ°
//   GameCraft > DÃ¼nya Kurucu'dan world_setra.json `visual` alanÄ± ile gelir.
//   travelEngine map.world.visual -> window.SETRA_WORLD_TUNING aktarÄ±r.
// ---------------------------------------------------------------------
const TUNE_DEFAULT = { treeScale: 3.0, structureScale: 2.6 };
const TREE_MODELS = new Set(["oak", "pine", "birch", "autumn", "deadtree", "greywood", "willow"]);
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
  } catch (_) { /* localStorage kapalÄ± olabilir */ }
  if (v === null || v === undefined) return true; // varsayÄ±lan: aÃ§Ä±k (deneme)
  v = String(v).toLowerCase();
  return !(v === "0" || v === "off" || v === "false" || v === "no");
}

const api = {
  enabled: false,
  ready: false,
  error: null,
  decor: DECOR,
  frontTable: FRONT_DEG,
  tune: modelTuneOf,
  // sprites[type][modelId] = [{ canvas }]
  sprites: {},
  setEnabled(on) {
    api.enabled = !!on;
    try { localStorage.setItem("setra.trees3d", on ? "1" : "0"); } catch (_) {}
    return api.enabled;
  },
  // Sprite'Ä±n DÃœNYA Ã¶lÃ§eÄŸindeki Ã§izim boyutu (h = yÃ¼kseklik, w = geniÅŸlik) ve
  // tabana oturan gÃ¶lge elipsinin yarÄ±Ã§aplarÄ±. travelEngine.renderShadows da
  // aynÄ± deÄŸerleri kullanÄ±r; aksi halde gÃ¶lge nesnenin altÄ±nda minicik kalÄ±p
  // nesne "havada uÃ§uyor" gibi gÃ¶rÃ¼nÃ¼yordu.
  // Model tipini normalize eder (boulder -> glb/bigrock vb.).
  _norm(s) {
    if (!s) return null;
    // Ağaç modelleri hangi türden gelirse gelsin 'tree' gibi davranır (rüzgâr,
    // rastgele dönüş, decorScale). Örn. vektör "willow" → 3D söğüt ağacı.
    const mdl = s.model || MODEL_ALIAS[s.type];
    if (TREE_MODELS.has(mdl)) return Object.assign({}, s, { type: "tree", model: mdl });
    if (s.type === "glb" || (!DECOR[s.type] && MODEL_ALIAS[s.type])) {
      return Object.assign({}, s, { type: "glb", model: mdl });
    }
    return s;
  },
  // DÃ¼nya px cinsinden nihai sprite yÃ¼ksekliÄŸi. SPRITE HAZIR OLMASA DA Ã§alÄ±ÅŸÄ±r
  // (Ã§arpÄ±ÅŸma/ayak izi hesabÄ± bake beklemesin diye).
  heightPx(s, engine) {
    const obj = api._norm(s);
    if (!obj) return 0;
    const cfg = DECOR[obj.type];
    if (!cfg) return 0;
    const sc = Number(obj.scale) > 0 ? Number(obj.scale) : 1;
    const t = tune();
    const isTree = obj.type === "tree" || TREE_MODELS.has(obj.model);
    const dsc = isTree ? (Number(engine && engine.decorScale) > 0 ? Number(engine.decorScale) : 1) : 1;
    const scaleMul = isTree ? t.treeScale : (cfg.noScale ? 1 : (obj.preScaled ? 1 : t.structureScale));
    const perHeight = Number(obj.height);
    const baseH = (cfg.heights && cfg.heights[obj.model]) || cfg.height;
    let h = (Number.isFinite(perHeight) && perHeight > 0 ? perHeight : baseH * scaleMul) * sc * dsc;
    const tn = modelTuneOf(engine, obj.model);
    const hm = Number(tn && tn.hMul);
    if (Number.isFinite(hm) && hm > 0) h *= hm;
    return Number.isFinite(h) && h > 0.5 ? h : 0.5;
  },
  // GerÃ§ek ayak izi yarÄ±Ã§apÄ± (dÃ¼nya px) â€” MODEL_SIZE tablosundan.
  solidPx(s, engine) {
    const obj = api._norm(s);
    if (!obj) return 0;
    const h = api.heightPx(obj, engine);
    const m = MODEL_SIZE[obj.model];
    const ratio = m ? Math.max(m.w, m.d) / 2 : 0.45;
    const tn = modelTuneOf(engine, obj.model);
    const mul = Number(tn && tn.solidMul);
    return h * ratio * (Number.isFinite(mul) && mul > 0 ? mul : 1);
  },
  footprint(s, engine) {
    if (!api.ready || !s) return null;
    const obj = api._norm(s);
    const cfg = obj && DECOR[obj.type];
    if (!cfg) return null;
    const spr = api.pick(obj, (obj && obj.biome) || (engine && engine.biome));
    if (!spr) return null;
    const hSafe = api.heightPx(obj, engine);
    const tn = modelTuneOf(engine, obj.model);
    const isTree = obj.type === "tree" || TREE_MODELS.has(obj.model);
    // GÃ¶rÃ¼nÃ¼r geniÅŸlik: tuval deÄŸil, modelin sabit referans oranÄ± (dÃ¶nÃ¼ÅŸten
    // baÄŸÄ±msÄ±z) â†’ gÃ¶lge ve geniÅŸlik dÃ¶nÃ¼ÅŸte deÄŸiÅŸmez.
    const m0 = spr.canvas;
    const w = hSafe * ((m0._refW || m0.width || 1) / (m0._refH || m0.height || 1));
    // GÃ¶lge: nesnenin taban geniÅŸliÄŸine oranlÄ± (aÄŸaÃ§lar daha geniÅŸ yayÄ±lÄ±r).
    return {
      h: hSafe, w: Number.isFinite(w) && w > 0.5 ? w : 0.5, spr, cfg, isTree, tune: tn,
      rx: Math.max(2, w * (isTree ? 0.56 : 0.50)),
      ry: Math.max(2, w * (isTree ? 0.28 : 0.24)),
    };
  },
  // ---- CEPHE / YÃ–N YARDIMCILARI -------------------------------------
  // Matematik (kodla doÄŸrulanmÄ±ÅŸ):
  //   bake azimutu      az  = rot + 45Â°
  //   gÃ¶rÃ¼nen yÃ¶n (rad)     = cephe - rot        [atan2(dx, dz) Ã¶lÃ§Ã¼sÃ¼]
  //   hedefe dÃ¶nme          rot = cephe - atan2(dx, dz)
  // cephe = FRONT_DEG[model] (0 = +Z). DÃ¶nÃ¼ÅŸ Ã§Ã¶zÃ¼nÃ¼rlÃ¼ÄŸÃ¼ 16 gÃ¶rÃ¼nÃ¼m = 22.5Â°.
  frontDeg(model) {
    const v = FRONT_DEG[model];
    return Number.isFinite(v) ? v : 0;
  },
  // DÃ¼nyada (tx,ty) hedefine kapÄ± bakacak ÅŸekilde `rot` Ã¼retir (0..2Ï€).
  rotToFace(model, x, y, tx, ty) {
    const dx = Number(tx) - Number(x), dy = Number(ty) - Number(y);
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || (!dx && !dy)) return 0;
    const front = (api.frontDeg(model) * Math.PI) / 180;
    const r = front - Math.atan2(dx, dy);
    return ((r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  },
  // rot'tan gÃ¶rÃ¼nen cephe yÃ¶nÃ¼ (radyan, atan2(dx,dz) Ã¶lÃ§Ã¼sÃ¼).
  faceDir(model, rot) {
    const front = (api.frontDeg(model) * Math.PI) / 180;
    const r = front - (Number(rot) || 0);
    return ((r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  },
  // TeÅŸhis: modelin tÃ¼m dÃ¶nÃ¼ÅŸlerini etiketli bir tabloda aÃ§ar.
  // KapÄ±nÄ±n gÃ¶rÃ¼ndÃ¼ÄŸÃ¼ karenin rot deÄŸerini oku â†’ cephe = -rot.
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
      g.fillText(`${model} â€” ${n} gÃ¶rÃ¼nÃ¼m | cephe (kapÄ±) = ${api.frontDeg(model)}Â°`, 10, 22);
      bank.forEach((r, i) => {
        const rot = (i / n) * Math.PI * 2;
        const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * chh + 34;
        const c = r.canvas;
        const k = Math.min((cw - 16) / c.width, (chh - 44) / c.height);
        g.drawImage(c, x0 + (cw - c.width * k) / 2, y0 + (chh - 44 - c.height * k), c.width * k, c.height * k);
        g.fillStyle = "#9ae6b4"; g.font = "12px monospace";
        g.fillText(`rot ${Math.round((rot * 180) / Math.PI)}Â°`, x0 + 6, y0 + chh - 20);
        g.fillStyle = "#8ab4f8";
        g.fillText(`idx ${i}`, x0 + 6, y0 + chh - 6);
      });
      const w = window.open("", "_blank");
      if (w && w.document) {
        w.document.title = "Setra 3D â€” " + model;
        w.document.body.style.margin = "0";
        w.document.body.appendChild(cv);
      }
      return cv.toDataURL("image/png");
    } catch (e) {
      console.warn("[3d] contactSheet:", e && e.message);
      return null;
    }
  },
  // TravelEngine.drawSceneryItem iÃ§inden Ã§aÄŸrÄ±lÄ±r. Ã‡izerse true dÃ¶ner.
  drawScenery(ctx, s, x, y, engine) {
    if (!api.enabled) return false;
    try {
      return api._drawScenery(ctx, s, x, y, engine);
    } catch (e) {
      // Tek bir bozuk nesne tÃ¼m kareyi (oyuncu/diÄŸer dekor dahil) dÃ¼ÅŸÃ¼rmesin.
      // AynÄ± hata mesajÄ± bir kez loglanÄ±r (hata ayÄ±klama gÃ¶rÃ¼nÃ¼r kalsÄ±n).
      const msg = (e && e.message) || String(e);
      api._warned = api._warned || new Set();
      if (!api._warned.has(msg) && api._warned.size < 6) {
        api._warned.add(msg);
        console.warn("[3d] Ã§izim hatasÄ±:", msg);
      }
      return false;
    }
  },
  _drawScenery(ctx, s, x, y, engine) {
    const fp = api.footprint(s, engine);
    if (!fp) return false;
    const { h, w, spr, cfg, isTree } = fp;
    // RÃ¼zgÃ¢r: taban sabit kalÄ±r, tepe salÄ±nÄ±r. YavaÅŸ "hamle" (gust) + birey
    // fazÄ±; yÃ¼ksek FPS kaybÄ± olmasÄ±n diye iki sinÃ¼s ile sÄ±nÄ±rlÄ± tutuldu.
    const wt = (engine && engine.time) || 0;
    const ph = s.swayOffset || 0;
    const windOn = window.SETRA_FOLIAGE_WIND !== false && (cfg.sway || (isTree && cfg !== DECOR.tree));
    let sway = 0;
    if (windOn) {
      const gust = 0.55 + 0.45 * Math.sin(wt * 0.31 + ph * 1.7);
      const amp = (engine && engine.lowFx) ? 0.010 : 0.021;
      sway = Math.sin(wt * 1.7 + ph) * amp * gust
        + Math.sin(wt * 3.9 + ph * 2.1) * amp * 0.18;
    }
    // Nesne tabanÄ± (gx,gy) tam zemin noktasÄ±na oturur; Ã¶lÃ§ek modelin sabit
    // referans yÃ¼ksekliÄŸinden gelir â†’ dÃ¶nÃ¼ÅŸte ne boyut ne zemin kayar.
    const meta = spr.canvas;
    const refH = meta._refH || meta.height || 1;
    const refW = meta._refW || meta.width || 1;
    const k = h / refH;
    const cw = meta.width * k, ch = meta.height * k;
    // Taban temas gÃ¶lgesi: geniÅŸlik/2 yarÄ±Ã§apta, hafif yayvan, iki katmanlÄ±
    // (dÄ±ÅŸ yumuÅŸak + iÃ§ koyu) â†’ nesne zemine "oturur", havada durmaz.
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
    // Temas noktasÄ± (Ã§ok kÃ¼Ã§Ã¼k, koyu) â€” tabanÄ±n gerÃ§ekten deÄŸdiÄŸini gÃ¶sterir.
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
    ctx.translate(x, y + (Number(fp.tune && fp.tune.sink) || 0));
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
  // Ã–rnek bazlÄ± renk tonu (Dark Citadel = siyah, kar kÃ¶yÃ¼ = soÄŸuk mavi).
  // Sprite bir kez tint'lenip Ã¶nbelleÄŸe alÄ±nÄ±r â†’ kare baÅŸÄ±na ek maliyet yok.
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
    g.globalCompositeOperation = "source-atop"; // yalnÄ±zca sprite pikselleri
    g.fillStyle = tint;
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "source-over";
    per.set(tint, c);
    return c;
  },
  // AynÄ± aÄŸaÃ§/Ã§alÄ± her karede aynÄ± gÃ¶rÃ¼nsÃ¼n: konum + tone deterministik tohum.
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
      // Model yÃ¼klenemediyse tÃ¼rÃ¼n ilk hazÄ±r modeline dÃ¼ÅŸ
      const any = Object.values(bucket).find((l) => l && l.length);
      if (!any) return null;
      list = any;
    }
    // DÃ¼nya Kurucu'da verilen aÃ§Ä± (radyan) varsa en yakÄ±n piÅŸmiÅŸ dÃ¶nÃ¼ÅŸÃ¼ seÃ§.
    if (Number.isFinite(Number(s.rot)) && list.length > 1) {
      const n = list.length;
      let idx = Math.round((Number(s.rot) / (Math.PI * 2)) * n) % n;
      if (idx < 0) idx += n;
      return list[idx];
    }
    // AÃ§Ä± verilmemiÅŸ GLB yapÄ±lar karo Ä±zgarasÄ±na HÄ°ZALI dursun (index 0);
    // bitki/kaya gibi doÄŸal dekor rastgele dÃ¶nsÃ¼n (tekrar hissi kÄ±rÄ±lÄ±r).
    if (s.type !== "tree" && !RANDOM_ROT.has(s.type)) return list[0];
    const seed2 = Math.abs(Math.sin(seed * 19.71 + (s.wx || 0) * 0.71));
    return list[Math.floor(seed2 * list.length) % list.length];
  },
};

window.Setra3DTrees = api;
// live3d.js'in aynÄ± yaprak/kabuk dokusunu kullanmasÄ± iÃ§in kÃ¼Ã§Ã¼k bir malzeme
// kiti (mevcut bake davranÄ±ÅŸÄ±nÄ± DEÄÄ°ÅTÄ°RMEZ, sadece paylaÅŸÄ±r).
api.kit = { THREE: null, leafTexture: null, barkTexture: null, uvPlanar: null };
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
      preserveDrawingBuffer: true, // drawImage ile okumak iÃ§in ÅŸart
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(1);
    renderer.setSize(SPRITE_W, SPRITE_H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    // IÅŸÄ±klar sahneye eklenir; model de sahneye eklenmezse SÄ°YAH render olur.
    // Setra Ä±ÅŸÄ±k dÃ¼zeni (bake): sÄ±cak ana gÃ¼neÅŸ + gÃ¶kyÃ¼zÃ¼/zemin dolgusu +
    // soÄŸuk arka kenar Ä±ÅŸÄ±ÄŸÄ±. Sprite'lar biyomdan baÄŸÄ±msÄ±z aynÄ± Ä±ÅŸÄ±kla piÅŸer;
    // biyom tonu Ã§alÄ±ÅŸma anÄ±nda shaderfx.js renk katmanÄ±yla birleÅŸtirilir.
    const scene = new THREE.Scene();
    const lightOn = !(window.SETRA_BAKE_LIGHT === false);
    scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x40341f, lightOn ? 1.20 : 1.35));
    const sun = new THREE.DirectionalLight(0xfff2d8, lightOn ? 2.15 : 2.3);
    sun.position.set(-1.1, 2.2, 0.9);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x8fb0d6, lightOn ? 0.62 : 0.7);
    fill.position.set(1.2, 0.8, -1.0);
    scene.add(fill);
    if (lightOn) {
      // Arka/kenar Ä±ÅŸÄ±ÄŸÄ±: silÃ¼etin zemin tonundan ayrÄ±ÅŸmasÄ±nÄ± saÄŸlar (rim).
      const rim = new THREE.DirectionalLight(0xbcd7ff, 0.55);
      rim.position.set(0.9, 1.4, 1.6);
      scene.add(rim);
      // Ã‡ok kÄ±sÄ±k ortam: en koyu gÃ¶lgeler tamamen ezilmesin.
      scene.add(new THREE.AmbientLight(0x6a7a8c, 0.14));
    }

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 500);
    const loader = new GLTFLoader();

    // Tuvalin ÅŸeffaf kenarlarÄ±nÄ± kÄ±rp â†’ sprite tabanÄ± tam modelin tabanÄ± olur
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

    // Saydam olmayan alanÄ±n sÄ±nÄ±rlarÄ± (kÄ±rpma YAPMADAN). KÄ±rpÄ±lmÄ±ÅŸ sprite
    // kullanÄ±nca her dÃ¶nÃ¼ÅŸte tuval oranÄ± deÄŸiÅŸiyordu â†’ nesne dÃ¶ndÃ¼rÃ¼lÃ¼nce
    // boyutu deÄŸiÅŸiyor gibi gÃ¶rÃ¼nÃ¼yordu. ArtÄ±k tÃ¼m dÃ¶nÃ¼ÅŸler AYNI boyutta
    // tuvalde kalÄ±r; Ã¶lÃ§ek/anchor model bazlÄ± sabit referanstan gelir.
    function alphaBounds(src) {
      // HIZ: tam Ã§Ã¶zÃ¼nÃ¼rlÃ¼kte piksel taramak yerine 1/4 Ã¶lÃ§ekli kopyada
      // sÄ±nÄ±rlar bulunur (16x daha az piksel) â†’ bake sÃ¼resi ciddi kÄ±salÄ±r.
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

    // YapraklÄ± modeller: sprite kenarlarÄ± yaprak yaprak, uÃ§lara doÄŸru saydam,
    // yeÅŸil kÃ¼tle hafif transparan. TaÅŸ/bina/kristal/Ã§iÃ§ek dokunulmaz.
    const LEAFY = new Set(["oak", "pine", "birch", "autumn", "bush", "greywood", "willow"]);

    // ------------------------------------------------------------------
    // PROSEDÃœREL YAPRAK DOKUSU
    //   DÃ¼z renkli low-poly kÃ¼tleler "balon" gibi gÃ¶rÃ¼nÃ¼yordu. Modele
    //   damla yaprak desenli bir doku + ALFA boÅŸluklarÄ± verilir: yaprak
    //   aralarÄ±ndan arka plan gÃ¶rÃ¼nÃ¼r, silÃ¼et tÄ±rtÄ±klÄ± olur.
    //   Tek canvas Ã¼retilir (128Â²), tÃ¼m modeller paylaÅŸÄ±r (optimizasyon).
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
      // 1) Yaprak aralarÄ±ndaki boÅŸluklar (alfa 0)
      for (let i = 0; i < 105; i++) {
        leaf(rnd() * S, rnd() * S, 3.5 + rnd() * 7.5, rnd() * Math.PI * 2, "#000000", "destination-out");
      }
      // 2) Ton farkÄ±: koyu/aÃ§Ä±k yaprak lekeleri (RGB, ÅŸeffaflÄ±k korunur)
      for (let i = 0; i < 150; i++) {
        const shade = rnd() > 0.5 ? "rgba(0,0,0,0.13)" : "rgba(255,255,255,0.17)";
        leaf(rnd() * S, rnd() * S, 2.5 + rnd() * 5.5, rnd() * Math.PI * 2, shade, "source-atop");
      }
      g.globalCompositeOperation = "source-over";
      leafTexCache = c;
      return c;
    }

    // GÃ¶vde olmayan (taÃ§) mesh'lere yaprak dokusu + alfa kesimi uygular.
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
      // Modelde yeÅŸil (yaprak) malzeme var mÄ±? Varsa YALNIZCA onlara doku
      // verilir; gÃ¶vde asla delikli olmaz. HiÃ§ yeÅŸil yoksa (deadtree gibi)
      // Ã¼st %70 taÃ§ kabul edilir.
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
          // Alpha-test: yaprak boÅŸluklarÄ± kesilir, sÄ±ralama derdi olmadan
          // (transparent=false) hÄ±zlÄ± kalÄ±r. YumuÅŸak saydamlÄ±k sprite
          // piÅŸirme sonrasÄ± softenLeaves() ile verilir.
          mat.alphaTest = 0.42;
          mat.transparent = false;
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
          return mat;
        });
        o.material = Array.isArray(o.material) ? out : out[0];
      });
    }

    // GÃ¶vde dokusu: dikey damarlÄ± kahverengi (tek canvas, tÃ¼m modeller paylaÅŸÄ±r).
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

    // GÃ¶vde: kabuk dokusu + incelme (gerÃ§ekÃ§i, kalÄ±n olmayan gÃ¶vde).
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
          // GÃ¶vdede alfa kesimi yok: doku doÄŸrudan renk olarak biner.
          if (o.map !== false) mat.map = tex;
          mat.alphaTest = 0;
          mat.needsUpdate = true;
          if (o.tint != null && mat.color && mat.color.setHex) mat.color.setHex(o.tint);
          return mat;
        });
        m.material = Array.isArray(m.material) ? out : out[0];
      });
    }

    // Yaprak kÃ¼mesi (kafa/dolgunluk): low-poly ikosahedron + yaprak dokusu.
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

    // Sarkan sarmaşık / söğüt dalı: yaprak dokulu ince şeritler.
    // Çapraz iki düzlem (X) → her 16 dönüşte de görünür kalır (kenardan kaybolmaz).
    function addHangingVines(vb, count, tint) {
      if (!vb) return [];
      const size = vb.getSize(new THREE.Vector3());
      const mat = new THREE.MeshStandardMaterial({
        map: leafTex3D(), color: tint != null ? tint : 0x7fae52,
        alphaTest: 0.36, side: THREE.DoubleSide, roughness: 1, metalness: 0,
      });
      const out = [];
      const R = Math.max(size.x, size.z) * 0.34;
      const top = vb.min.y + size.y * 0.80;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + 0.4;
        const x = vb.min.x + size.x * 0.5 + Math.cos(a) * R;
        const z = vb.min.z + size.z * 0.5 + Math.sin(a) * R;
        const len = size.y * (0.26 + 0.16 * (((i * 5) % 7) / 6));
        const w = Math.max(size.x * 0.10, size.z * 0.10);
        for (let k = 0; k < 2; k++) {
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, len), mat);
          mesh.position.set(x, top - len * 0.5, z);
          mesh.rotation.y = a + k * (Math.PI / 2);
          scene.add(mesh);
          out.push(mesh);
        }
      }
      return out;
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
      // SilÃ¼et testi DEÄÄ°ÅMEYEN alfa Ã¼zerinden (tek kopya, indeks matematiÄŸi;
      // closure Ã§aÄŸrÄ±sÄ± yok â†’ piÅŸirme sÃ¼resi belirgin ÅŸekilde kÄ±salÄ±r).
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
          // 4 komÅŸu + 4 Ã§apraz: kenar tespiti
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

    // YalnÄ±zca GÃ–RÃœNÃœR mesh'lerin sÄ±nÄ±rÄ±. Gizli/yardÄ±mcÄ± geometri tabanÄ±
    // aÅŸaÄŸÄ± Ã§ekip modelin "havada" durmasÄ±na yol aÃ§abiliyordu; bunu Ã¶nler.
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
      scene.add(root); // Ä±ÅŸÄ±klar sahnede: model sahneye eklenmezse siyah render olur

      // Tabana hizala: x/z merkez, y = 0 zemin (yalnÄ±zca gÃ¶rÃ¼nÃ¼r geometri)
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

      // Her doku adÄ±mÄ± AYRI korunur: biri hata verse bile model piÅŸmeye devam
      // eder (tek hata tÃ¼m sprite bankasÄ±nÄ± dÃ¼ÅŸÃ¼rmesin).
      //
      // GÃœVENLÄ° MOD: yeni eklenen (kabuk dokusu / yaprak kÃ¼meleri / taÅŸ
      // desatÃ¼rasyonu) adÄ±mlar ÅŸimdilik KAPALI. Bunlar bazÄ± modellerde bake'i
      // bozup "her ÅŸey dÃ¼z kahverengi" gÃ¶rÃ¼nÃ¼mÃ¼ne yol aÃ§tÄ±; kanÄ±tlanmÄ±ÅŸ yol
      // (yaprak dokusu) aÃ§Ä±k kalÄ±yor. Tek tek aÃ§Ä±lacak.
      const SAFE = { barkMap: true, clusters: true, stone: true };
      if (LEAFY.has(id)) {
        try { applyLeafMaterial(root); } catch (e) { console.warn("[3d] yaprak doku:", id, e && e.message); }
      }
      const clusters = [];
      // willow: sadece gövde deadtree.glb ise türet (gerçek model gelince kapalı).
      const willowDerived = id === "willow" && /deadtree\.glb/i.test(url);
      try {
        if (TREE_MODELS.has(id)) {
          const barkTint = id === "greywood" ? 0xb4aca0 : (willowDerived ? 0x6d5a3e : null);
          applyBark(root, { thin: 0.8, map: SAFE.barkMap, tint: barkTint });
        } else if (id === "bush") {
          applyBark(root, { thin: 1, map: SAFE.barkMap });
        }
      } catch (e) { console.warn("[3d] gÃ¶vde:", id, e && e.message); }
      try {
        if (SAFE.stone && (id === "bigrock" || id === "rocks")) naturalStone(root, 0.16);
      } catch (e) { console.warn("[3d] taÅŸ:", id, e && e.message); }
      try {
        if (SAFE.clusters) {
          const vbCl = visibleBox(root) || box;
          if (id === "greywood") clusters.push.apply(clusters, addLeafClusters(vbCl, 2, 1.15, 0x5c8b46));
          else if (id === "bush") clusters.push.apply(clusters, addLeafClusters(vbCl, 3, 0.72, 0x5f8f4a));
          else if (willowDerived) {
            // Söğüt: üstte seyrek taç + aşağı sarkan sarmaşık şeritleri.
            clusters.push.apply(clusters, addLeafClusters(vbCl, 3, 0.95, 0x6f9a4a));
            clusters.push.apply(clusters, addHangingVines(vbCl, 14, 0x7fae52));
          }
        }
      } catch (e) { console.warn("[3d] yaprak kÃ¼mesi:", id, e && e.message); }

      // Model boyutuna gÃ¶re tuval Ã§Ã¶zÃ¼nÃ¼rlÃ¼ÄŸÃ¼ (bÃ¼yÃ¼k yapÄ±lar keskin piÅŸer).
      const dims = spriteDims(id, size);
      const cw = dims[0], ch = dims[1];
      const aspect = cw / ch;

      // GerÃ§ek izometrik aÃ§Ä± (35.264Â°) + 45Â° azimut â†’ karo Ä±zgarasÄ±yla tam hizalÄ±.
      const elev = 0.6155;
      const cosE = Math.cos(elev);
      const sinE = Math.sin(elev);
      // Ä°zdÃ¼ÅŸÃ¼m sÄ±nÄ±rlarÄ± (tÃ¼m azimutlar): yatay sqrt(sxÂ²+szÂ²), dikey syÂ·cosE+diagÂ·sinE.
      const diag = Math.hypot(size.x, size.z) || Math.max(size.x, size.z) || 1;
      const projW = diag;
      const projH = targetH * cosE + diag * sinE;
      const pad = 1.14; // tepe/taban kÄ±rpÄ±lmasÄ±n
      const vExtent = Math.max(projH * pad, (projW * pad) / aspect);
      const hExtent = vExtent * aspect;
      camera.left = -hExtent / 2;
      camera.right = hExtent / 2;
      camera.top = vExtent / 2;
      camera.bottom = -vExtent / 2;
      camera.near = 0.05;
      camera.far = Math.max(size.x, size.y, size.z) * 12 + 10;
      camera.updateProjectionMatrix();

      // Renderer + okuma tuvalini bu modele gÃ¶re boyutlandÄ±r.
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
          // Model taban merkezinin (0,0,0) ekran karÅŸÄ±lÄ±ÄŸÄ±: tÃ¼m dÃ¶nÃ¼ÅŸlerde
          // aynÄ± piksel â†’ sprite bu noktadan zemine oturtulur (havada durmaz).
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
      if (!list.length) console.warn("[3d] sprite boÅŸ:", id);

      // Model bazlÄ± SABÄ°T Ã¶lÃ§ek referansÄ±: tÃ¼m dÃ¶nÃ¼ÅŸler aynÄ± `refH` ile
      // Ã§izilir â†’ nesne dÃ¶ndÃ¼rÃ¼lÃ¼nce boyutu deÄŸiÅŸmez. Taban noktasÄ± (gx,gy)
      // da dÃ¶nÃ¼ÅŸten baÄŸÄ±msÄ±z olduÄŸu iÃ§in zemin temasÄ± korunur.
      if (list.length) {
        // TÃ¼m dÃ¶nÃ¼ÅŸler ORTAK bir dikdÃ¶rtgene kÄ±rpÄ±lÄ±r â†’ hepsi aynÄ± boyut
        // (dÃ¶nÃ¼ÅŸte Ã¶lÃ§ek deÄŸiÅŸmez) + boÅŸ tuval belleÄŸi ÅŸiÅŸirmez.
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

      // Yaprak kÃ¼melerini sahneden dÃ¼ÅŸÃ¼r (bellek sÄ±zmasÄ±n).
      for (const cl of clusters) {
        scene.remove(cl);
        if (cl.geometry) cl.geometry.dispose();
      }

      // GPU belleÄŸini bÄ±rak (PAYLAÅILAN doku canvas'larÄ± korunur)
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

    // Malzeme kitini live3d.js ile paylaÅŸ (birebir aynÄ± yaprak/kabuk dokusu;
    // bake davranÄ±ÅŸÄ± deÄŸiÅŸmez, yalnÄ±zca fonksiyon referanslarÄ± paylaÅŸÄ±lÄ±r).
    try {
      api.kit.THREE = THREE;
      api.kit.leafTexture = leafTexture;
      api.kit.barkTexture = barkTexture;
      api.kit.uvPlanar = uvPlanar;
    } catch (e) { /* kit paylaÅŸÄ±mÄ± baÅŸarÄ±sÄ±zsa live3d kendi dokusunu Ã¼retir */ }

    // TÃ¼m dekor tÃ¼rlerini sÄ±rayla piÅŸir (tek WebGL context)
    for (const [type, cfg] of Object.entries(DECOR)) {
      api.sprites[type] = {};
      for (const [id, url] of Object.entries(cfg.models)) {
        const list = await bakeModel(id, url).catch((e) => {
          console.warn("[3d] " + id + " yÃ¼klenemedi", e);
          return [];
        });
        if (list.length) api.sprites[type][id] = list;
        // Her baÅŸarÄ±lÄ± modelde "hazÄ±r" iÅŸaretle: sonraki bir model hata verse
        // bile piÅŸen sprite'lar kullanÄ±lsÄ±n (hepsi vektÃ¶r Ã§izime dÃ¼ÅŸmesin).
        if (list.length) api.ready = true;
      }
    }

    api.ready = Object.values(api.sprites).some((b) => Object.keys(b).length > 0);
    if (api.ready) {
      const summary = Object.entries(api.sprites)
        .map(([t, b]) => t + ":" + Object.keys(b).join("/"))
        .join(" | ");
      console.log("[3d] hazÄ±r |", summary, "| enabled:", api.enabled);
    }
  } catch (e) {
    api.error = e;
    api.ready = false;
    console.warn("[3d] devre dÄ±ÅŸÄ±, vektÃ¶r Ã§izim kullanÄ±lÄ±yor:", e && e.message ? e.message : e);
  }
})();
