/**
 * SETRA — CLAUDE İÇİN: KÖY DÜZENİ (YERLEŞİM) DOSYASI
 * ---------------------------------------------------------------
 * Bu dosyayı Claude'a ver ve "yeni köy / köy düzenini değiştir" de.
 * Amaç: harita üzerindeki köylerin nasıl kurulduğunu TEK dosyada anlatmak.
 *
 * MİMARİ
 *  - Dünya verisi: world_setra.json  (2.9 MB, üretilmiş dosya — elle yazma).
 *  - Köyleri ÜRETEN araç: build_villages.js  (şablonu yerleşimlere basar).
 *  - Çizim: public/js/travelEngine.js + public/js/trees3d.js (GLB sprite).
 *  - Köy bilgi penceresi: public/js/travelArpg.js (.tv-village paneli).
 *  - Sıra tabanlı şehir (menüler): content.js -> town{}  (search/blacksmith/...)
 *
 * İKİ AYRI "KÖY" VAR:
 *   A) Harita köyü (ARPG): plaza + evler + yollar + lambalar (world_setra.json)
 *   B) Şehir menüleri (tur bazlı): content.js -> town{}  (bu dosyanın 6. bölümü)
 */

// =====================================================================
// 1) world_setra.json ŞEMASI (üretilen dosya — sadece oku)
// =====================================================================
const WORLD_SCHEMA = {
  id: "setra", name: "Setra", version: 3,
  seed: 12345, width: 200000, height: 200000,
  worldScale: 1, tileSize: 64, baseWalkSpeed: 150,
  spawn: { x: 18000, y: 108000 },
  // --- köyü oluşturan alanlar ---
  pois: [{
    id: "setra_village", kind: "checkpoint",   // checkpoint | inn | dungeon | den | chest | ruin
    name: "SETRA Village", x: 18000, y: 108000,
    model: "obelisk",                          // plazadaki taş
    rank: "t1", checkpoint: true, solidRadius: 0.91,
  }],
  structures: [{                                // evler / props / lambalar
    model: "hut", x: 18510, y: 107137,
    scale: 1.02, rot: 3.33, solidRadius: 0.55,  // çarpışma yarıçapı (dünya birimi)
  }],
  roads: [{ id: "kingsroad", width: 48, points: [[18000, 108000], [18150, 108000]] }],
  props: [{ id: "w4", x: 70444, y: 358, type: "glb", model: "deadtree", scale: 1.58, rot: 0.639, solidRadius: 0.47 }],
  visual: { treeScale: 3.0, structureScale: 2.6, typeScales: {} },
};

// =====================================================================
// 2) build_villages.js — ŞABLON TABLOSU (asıl düzen burada)
// =====================================================================
// Her satır: [rol, model, ref_x, ref_y, tier, tür]
//   ref  = referans görselde ZEMİNE OTURDUĞU nokta (piksel)
//   tier = 1 her yerleşim | 2 kasaba+köy | 3 sadece büyük köy
//   tür  = house (plazaya döner) | prop (rastgele) | lamp | camp
const ORIGIN = [522, 328];   // plaza merkezi (obelisk) — referans piksel

const TEMPLATE = [
  ["inn",      "tavern",     632, 262, 1, "house"],  // POI olarak yerleşir (setra_inn)
  ["barn",     "barn",       795, 368, 1, "house"],
  ["cottage1", "hut",        288, 555, 1, "house"],
  ["cottage2", "hut",        445, 512, 1, "house"],
  ["brown",    "stonehouse", 415, 270, 2, "house"],
  ["thatch",   "longhouse",  717, 185, 2, "house"],
  ["smithy",   "smithy",     192, 415, 2, "house"],
  ["cottage3", "hut",        398, 565, 2, "house"],
  ["stall1",   "stall",      385, 372, 2, "house"],
  ["stall2",   "stall",      430, 398, 2, "house"],
  ["farm",     "farmhouse",  318, 105, 3, "house"],
  ["blue",     "stonehouse", 428, 115, 3, "house"],
  ["round",    "hut",        192, 190, 3, "house"],
  ["chapel",   "chapel",     590, 470, 3, "house"],
  ["windmill", "windmill",   945, 115, 3, "house"],
  ["stall3",   "stall",      628, 380, 3, "house"],
  ["cart",     "cart",       330, 190, 3, "prop"],
  ["hay",      "haybales",   735, 382, 1, "prop"],
  ["crate",    "applecrates",776, 398, 2, "prop"],
  ["barrel",   "barrels",    130, 425, 2, "prop"],
  ["fire",     "campfire",   355, 492, 1, "camp"],
  ["lamp",     "lamp",       522, 250, 1, "lamp"],
  ["sign",     "banner",     868, 250, 3, "prop"],
];

const ROCKS = [[425, 420], [500, 428], [582, 508], [968, 378]];  // tier 2+

// Ayak izi yarıçapları (DÜNYA PX) — sadece yerleşim çakışmasını önlemek için.
// NOT: world_setra.json'daki `solidRadius` KARO cinsindendir (1 karo = 64 px).
//      Çarpışma yarıçapı = solidRadius × 64.  Öneri için:
//        node scripts/glb_info.js newassets/<model>.glb
const FOOT = {
  tavern: 62, barn: 66, farmhouse: 52, stonehouse: 48, hut: 40, longhouse: 58,
  smithy: 52, chapel: 52, windmill: 52, stall: 34, cart: 26, barrels: 20,
  applecrates: 20, haybales: 24, lamp: 8, banner: 14, campfire: 26, logs: 22,
  well: 26, rocks: 12,
};

// Yerleşim listesi (köy kimliği, POI id'si, inn id'si, büyüklük, yarıçap):
const SETTLEMENTS = [
  { id: "setra",      poi: "setra_village",   inn: "setra_inn",      tier: 3, radius: 950, obelisk: true },
  { id: "greenford",  poi: "greenford_inn",   inn: "greenford_inn",  tier: 2, radius: 800 },
  { id: "crossroads", poi: "crossroads_inn",  inn: "crossroads_inn", tier: 1, radius: 650 },
  { id: "frostpass",  poi: "frost_pass",      inn: "frost_pass",     tier: 1, radius: 650 },
];

// =====================================================================
// 2.5) EVLERİN YÖNÜ (CEPHE) — kapı nereye bakıyor?
// =====================================================================
/*
  SÖZLEŞME: tüm ev/yapı modellerinin KAPISI local +Z yönündedir (0°).
  build_villages.js evleri bu varsayımla PLAZAYA döndürür:

      rot = cephe - atan2(plazaX - evX, plazaY - evY)      (cephe = 0)

  Kod mevcut haliyle:  rt = atan2(-dd[0], dd[1]) + theta + (FACING[model] || 0) + opt.facing
  Bu satır YUKARIDAKİ formülün aynısıdır — değiştirmeye gerek yok.

  MODELİN KAPISI +Z DEĞİLSE (örn. kapı arkada export edilmiş):
      build_villages.js -> FACING = { hut: Math.PI }       (radyan)
      public/js/trees3d.js -> FRONT_DEG = { hut: 180 }     (derece, aynı model)
    +Z = 0 | +X = Math.PI/2 (90) | -Z = Math.PI (180) | -X = 3π/2 (270)

  HANGİ TARAF KAPI? (görerek doğrula — oyun açıkken konsola yaz)
      Setra3DTrees.contactSheet("hut")   // 16 görünüm + rot değerleri
      Kapının göründüğü karede  rot = -cephe  →  cephe = -rot.
  Dönüş çözünürlüğü 16 görünüm = 22.5°, yani kapı ±11° sapabilir (normal).

  Prop'lar (fıçı, sandık, kaya) yönsüzdür → rot rastgele; sorun değil.
  Lambalar rot = 0 sabittir.
*/

// =====================================================================
// 3) KULLANILABİLİR MODELLER (trees3d.js DECOR.glb)
// =====================================================================
// Ev/yapı: hut, stonehouse, farmhouse, barn, longhouse, tavern, smithy,
//          chapel, windmill, gatehouse, roundtower, watchtower, wall, fence, bridge
// Props : well, chest, campfire, tent, bigrock, rocks, crystals, pillars,
//          obelisk, graves, bush, flowers, stump, logs, lamp, signpost,
//          cart, barrels, applecrates, haybales, stall, banner
// Ağaç  : oak, pine, birch, autumn, deadtree, greywood
// Model id'leri .glb dosya adıyla aynı olmalı: newassets/<model>.glb

// =====================================================================
// 4) ÇALIŞTIRMA
// =====================================================================
/*
  node build_villages.js world_setra_1.json world_setra_2.json --spread 1.3 --zoom 2 --preview village_preview.png

  Girdi : world_setra_1.json  (yollar + POI'ler + eski yapılar)
  Çıktı : world_setra_2.json  (köyler basılmış hali) -> sonra oyuna al
  --spread : köy sıklığı (1.0 sıkı, 1.3 ferah — varsayılan, hitbox takılmasın)
  --zoom   : ekran px / dünya px (görsel ölçek, varsayılan 2)
  --facing : evlerin kapı yönü düzeltmesi (radyan: 0 / 1.5708 / 3.1416 / 4.7124)
  --seed   : rastgelelik tohumu (aynı çıktı için sabit tut)
  --preview: şematik PNG önizleme (npm i canvas gerekir)
*/

// =====================================================================
// 5) OYUN İÇİ DAVRANIŞ (dokunmadan önce bil)
// =====================================================================
// - Köy POI'si (kind:"checkpoint") plazadaki "Travel Stone"u açar.
//   travelArpg.js -> #tv-village paneli: Return to town / Continue exploring.
// - Inn POI'si (kind:"inn") uyuma noktasıdır.
// - Yollar köy merkezinden 4 eksenden birine düzleştirilir (LEG = 620).
// - Eski yapılar köy yarıçapı içinde SİLİNİR (build_villages.js "3) eski yapı/propları sil").
// - Köy popup metinleri: public/js/i18n.js + i18n.dialog.js (İngilizce anahtar + TR çeviri).

// =====================================================================
// 6) TUR BAZLI ŞEHİR MENÜLERİ -> content.js -> town{}
// =====================================================================
const TOWN = {
  search:       { stamina: 1, xp: 0, outcomes: [{ weight: 30, gold: [8, 16], wood: [0, 2], text: "You find a pouch of coins in the grass." }] },
  blacksmith:   { stamina: 1 },
  merchant:     { stamina: 1 },
  tavern:       { stamina: 1, bets: [25, 100, 500, 700], provisions: { foodPrice: 10, foodAmount: 2 }, sleep: { price: 15 } },
  rest:         { stamina: 4, maxPerDay: 3 },
  temple:       { stamina: 1 },
  sleepOutside: { lifeLossChance: 0.04 },
  endDay:       {},
  dungeon:      { rankedStamina: 4, fastStamina: 2 },
};

// =====================================================================
// 7) KURALLAR / TUZAKLAR
// =====================================================================
/*
  1. world_setra.json ELLE düzenlenmez; build_villages.js girdi/çıktı olarak kullan.
     Tek tek ev eklemek için structures dizisine kayıt eklemek de mümkün:
       { model:"hut", x: <dünya px>, y: <dünya px>, scale: 1,
         rot: <kapı hedefe baksın>, solidRadius: 0.55 }
     rot hesabı:  rot = cephe - atan2(hedefX - x, hedefY - y)
     Hazır yardımcı (tarayıcı konsolu): Setra3DTrees.rotToFace("hut", x, y, hedefX, hedefY)
  2. solidRadius 0 yaparsan oyuncu evin İÇİNDEN geçer; 1+ yaparsan kapıya sığmaz.
     Ev için 0.45-0.7, prop için 0.2-0.5, lamba 0.1 aralığı iyi.
     Değer KARO cinsindendir: 0.55 × 64 = 35 px çarpışma yarıçapı.
  3. İki yapı üst üste binmesin: merkez mesafesi >= (FOOT[a]+FOOT[b]) × 0.85.
  4. Köy yolu köy merkezinden geçmeli; aksi halde evler yolun üstüne biner.
  5. Model id uydurma — yukarıdaki liste + newassets/<model>.glb dosyası olmalı.
  6. Yeni/ölçüsü bilinmeyen model: node scripts/glb_info.js newassets/<model>.glb
     → heights + solidRadius önerisi + taban y kontrolü (0 olmalı).
  7. Değişiklik sonrası: node --check build_villages.js
     ve --preview ile şematik kontrol (canvas kuruluysa).
  8. Köy yarıçapı 950'den büyükse POI'ler arası mesafeyi kontrol et; iki köy
     birbirinin içine girmesin (SETTLEMENTS radius toplamı < POI mesafesi).
  9. Kapı yönü: sözleşme +Z. Model farklıysa FACING (build_villages.js) ve
     FRONT_DEG (trees3d.js) tablolarına AYNI değeri yaz; yoksa ev sırtını döner.
*/

module.exports = { WORLD_SCHEMA, ORIGIN, TEMPLATE, ROCKS, FOOT, SETTLEMENTS, TOWN };
