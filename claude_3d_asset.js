/**
 * SETRA — CLAUDE İÇİN: 3D EV / ASSET DOSYASI
 * ---------------------------------------------------------------
 * Bu dosyayı Claude'a ver ve "yeni 3D ev/prop/asset ekle" de.
 * Amaç: GLB -> sprite sistemini TEK dosyada anlatmak.
 *
 * AKIŞ
 *   newassets/x.glb  ->  trees3d.js DECOR tablosu  ->  offscreen WebGL ile
 *   sprite'a pişirilir (bake)  ->  travelEngine.js drawSceneryItem() -> drawImage
 *
 * NEDEN: her karede 3D çizmek yerine model bir kez tuvale pişirilir; oyun
 *        sadece drawImage yapar (hızlı). Sprite yoksa vektör çizime düşer,
 *        oyun asla kırılmaz.
 *
 * DOSYALAR
 *   public/js/trees3d.js              bake motoru + DECOR tablosu + çizim
 *   public/js/travelEngine.js         drawSceneryItem() hook (1 satır)
 *   public/index.html                 importmap + type="module" script
 *   public/vendor/three/              yerel three.js + GLTFLoader
 *   server.js                         app.use("/newassets", static) — GLB servisi
 *   newassets/*.glb                   modeller
 *   Dünya yerleşimi: world_setra.json (structures/props model alanı)
 */

// =====================================================================
// 1) DECOR TABLOSU  (public/js/trees3d.js)
// =====================================================================
// key    = travelEngine scenery `type` değeri
// height = dünya ölçeğinde çizim yüksekliği (s.scale = 1 iken, px)
// sway   = rüzgâr salınımı (taban etrafında ufak dönüş)
// models = id -> /newassets/<id>.glb
// biomes = biyom id -> model id havuzu (yoksa `default`)
const DECOR_ENTRY = {
  tree: {
    height: 70,
    sway: true,
    models: { oak: "/newassets/oak.glb", pine: "/newassets/pine.glb" },
    default: ["pine", "pine", "oak"],
    biomes: { verdant: ["pine", "oak"], frost: ["pine"], ashen: ["oak"] },
  },
  glb: {
    height: 64,
    heights: {   // model başına yükseklik (yoksa height kullanılır)
      farmhouse: 82, stonehouse: 84, hut: 68, barn: 82, longhouse: 78, tavern: 105,
      smithy: 82, chapel: 118, windmill: 116, gatehouse: 100, roundtower: 132,
      watchtower: 112, wall: 52, fence: 28, bridge: 54, well: 52, chest: 25,
      campfire: 24, tent: 48, bigrock: 58, rocks: 28, crystals: 54, pillars: 82,
      obelisk: 82, graves: 36, bush: 25, flowers: 14, stump: 24, logs: 24,
      lamp: 55, signpost: 48, cart: 38, barrels: 26, applecrates: 25,
      haybales: 30, stall: 60, banner: 70,
    },
    models: { hut: "/newassets/hut.glb", tavern: "/newassets/tavern.glb" },
    default: ["bigrock"], biomes: {},
  },
};

// Biyom id'leri (travelEngine.js `biome` + travel_visuals.js BIOME_DECOR ile aynı):
// verdant, forest, frost, frozen, snow, ashen, cursed, swamp, mirefen

// =====================================================================
// 2) CEPHE (KAPI) YÖNÜ — ZORUNLU SÖZLEŞME
// =====================================================================
/*
  Modelin KAPISI local +Z yönünde export edilir → 0°.
  Oyun her modeli 16 farklı açıdan pişirir (22.5° çözünürlük); hangi görünümün
  çizileceğini nesnenin `rot` değeri seçer. Kodla doğrulanmış matematik:

      az (kamera)   = rot + 45°
      görünen yön   = cephe - rot          [atan2(dx, dz) ölçüsü, radyan]
      hedefe dönme  = rot = cephe - atan2(dx, dz)

  Örnek: ev (0,0)'da, plaza (100,0)'da → rot = 0 - atan2(100, 0) = -90° = 270°.
  Hazır yardımcı (tarayıcı konsolu):
      Setra3DTrees.rotToFace("hut", 0, 0, 100, 0)   // → 4.712 (270°)
      Setra3DTrees.faceDir("hut", 4.712)            // → 1.571 (kapı +X'e bakıyor)

  MODELİN KAPISI +Z DEĞİLSE:
      1. public/js/trees3d.js  -> FRONT_DEG = { hut: 180 }      (derece)
      2. build_villages.js     -> FACING    = { hut: Math.PI }  (radyan)
    +Z = 0 | +X = 90 | -Z = 180 | -X = 270

  HANGİ TARAF KAPI? (görerek doğrula)
      Setra3DTrees.contactSheet("hut")
      → 16 görünüm + her karenin rot değeri açılır. Kapının göründüğü karede
        rot = -cephe  →  cephe = -rot.  (örn. kapı rot 180°'de görünüyorsa cephe 180°)
*/

// =====================================================================
// 2.5) ÖLÇÜ / KONUMLANDIRMA — tahmin etme, ölç
// =====================================================================
//   node scripts/glb_info.js newassets/<model>.glb
//   node scripts/glb_info.js newassets              (klasördeki tüm .glb)
// Çıktı: gerçek yükseklik, taban genişliği/derinliği, taban y (0 olmalı),
//        önerilen `heights` ve iki `solidRadius` (ev/yapı | prop).
//
// Birimler:
//   - heights  = dünya pikseli (sprite yüksekliği). Ağaç ≈ 70, ev 68–85, kule 112–132.
//   - solidRadius = KARO cinsinden (1 karo = 64 px). Çarpışma yarıçapı = solidRadius × 64.
//     Ev 0.45–0.7 | prop 0.2–0.5 | lamba ≈ 0.1 | 0 = geçilir (fence, bridge, bush).
//   - Model birimi (metre) önemsiz: sprite her zaman `heights` değerine ölçeklenir.
//   - Modelin tabanı y=0 olmalı; yoksa ev havada durur / toprağa gömülür.

// =====================================================================
// 3) YENİ EV EKLEME — 5 ADIM
// =====================================================================
/*
  1. GLB dosyasını newassets/ içine at:  newassets/<model>.glb
     (Draco / meshopt / KTX2 SIKIŞTIRMA OLMASIN — sade GLB, gömülü PNG.)
  2. node scripts/glb_info.js newassets/<model>.glb   → heights + solidRadius önerisi.
  3. trees3d.js -> DECOR.glb.models  :  <model>: "/newassets/<model>.glb"
     trees3d.js -> DECOR.glb.heights :  <model>: <öneri>
  4. Dünyaya yerleştir: world_setra.json -> structures[] içine
       { model:"<model>", x: <dünya px>, y: <dünya px>, scale: 1,
         rot: <kapı hedefe baksın: rot = cephe - atan2(dx,dz)>,
         solidRadius: <öneri> }
     veya köy şablonu için build_villages.js TEMPLATE tablosuna satır ekle
     (claude_village.js dosyasına bak).
  5. Modelin kapısı +Z değilse FRONT_DEG / FACING tablolarına yaz (2. bölüm).

  Hazır: ağaç/prop tipleri için hook zaten var. Yeni bir `type` (örn. bush)
  yapacaksan travelEngine.js drawSceneryItem() içindeki ilgili
  `else if (s.type === '...')` dalının EN BAŞINA şu satırı ekle:
       if (window.Setra3DTrees && window.Setra3DTrees.drawScenery(ctx, s, x, y, this)) return;
*/

// =====================================================================
// 4) MODEL HAZIRLAMA KURALLARI
// =====================================================================
/*
  - Taban (origin) y=0 zemininde olmalı; model 0'ın altına sarkmasın.
  - Kapı/giriş +Z yönünde olsun (2. bölümdeki sözleşme).
  - Birim: metre. 1 birim ≈ 1 dünya pikseli ölçeğinde çizilir; gerçek
    boyutu `heights` değeri belirler (model ne kadar büyük olursa olsun
    sprite bu yüksekliğe ölçeklenir).
  - Ölçek/rotasyonu GLB içinde "apply transform" ile sabitle. Oyun tarafı
    rotasyonu 16 hazır görünümden seçer (rastgele DEĞİL, `rot` belirler);
    `scale` ise yerleşimde rastgele 0.96–1.04 oynar.
  - Yüz sayısı: ev/prop için < 60k üçgen, ağaç için < 20k yeterli.
  - Doku: gömülü PNG/JPG, 1024–2048 px. KTX2 kullanma.
  - Şeffaflık: yaprak için alpha-test (alphaMode: MASK) tercih et.
*/

// =====================================================================
// 5) AYARLAR / KAPATMA
// =====================================================================
// trees3d.js üstü:
//   SPRITE_W / SPRITE_H  — sprite tuvali (kalite ↑ / bellek ↑)
//   ROTS = 24            — ağaç dönüş sayısı (15° adım)
//   ROTS_STRUCT = 16     — yapı dönüş sayısı (22.5° adım)
//   spriteDims(model)    — model boyutuna göre çözünürlük
//   TUNE_DEFAULT = { treeScale: 3.0, structureScale: 2.6 }  — dünya görsel ölçeği
//
// Kapatma:
//   ?trees3d=0            URL (yenileme gerekir)
//   localStorage.setItem('setra.trees3d','0')
//   Setra3DTrees.setEnabled(false)     anında
//   index.html'den trees3d.js script etiketini sil -> tamamen kaldır

// =====================================================================
// 6) KRİTİK TUZAKLAR (bunlar saat kaybettirdi)
// =====================================================================
/*
  1. Model scene.add() edilmeden render edilirse SİYAH çıkar.
     Işıklar sahnede olduğu için model de sahnenin çocuğu olmalı.
  2. preserveDrawingBuffer: true ŞART — WebGL canvas 2D'ye drawImage ile
     kopyalanırken aksi halde boş/şeffaf gelir.
  3. GLB içinde Draco/meshopt/KTX2 olursa ayrı loader gerekir; kullanma.
  4. newassets/ public DIŞINDA. Yeni klasör eklersen server.js'e
     express.static satırı gerekir, yoksa 404.
  5. public/index.html PowerShell Set-Content ile düzenlenmez (UTF-8 bozulur).
     Editör / edit aracı kullan.
  6. importmap + type="module" şart; `three` çıplak import'u ancak
     importmap ile çözülür.
  7. Sprite taban çapası alt-ortadır: drawImage(..., -w/2, -h, w, h).
     Model y=0 zeminine hizalanır; s.wx/s.wy aynen kullanılır.
  8. heights değeri yanlışsa ev havada uçar veya toprağa gömülür.
     Ağaç ≈ 70, tek katlı ev ≈ 68-85, kule ≈ 112-132.
  9. Kapı yönü yanlışsa ev plazaya SIRTINI döner. Kontrol:
     Setra3DTrees.faceDir("hut", <rot>)  →  plazaya doğru olan açıyla
     karşılaştır; tutmuyorsa FRONT_DEG'e düzeltme yaz.
  10. `rot` yalnızca 16 görünümden birini seçer → 22.5° hassasiyet var.
     Daha ince açı beklemeyin; kapı ±11° sapabilir.
*/

// =====================================================================
// 7) DOĞRULAMA
// =====================================================================
/*
  node --check public/js/trees3d.js
  node --check public/js/travelEngine.js
  node scripts/glb_info.js newassets/<model>.glb

  Tarayıcı konsolu:
    Setra3DTrees.ready        // true olmalı
    Setra3DTrees.sprites      // { glb: { hut: [...] }, tree: { oak: [...] } }
    Setra3DTrees.frontTable   // { hut: 180 } gibi cephe düzeltmeleri
    Setra3DTrees.contactSheet("hut")   // 16 görünüm — kapı hangi tarafta?
    Setra3DTrees.setEnabled(false)   // vektör çizime anında dön
    ?trees3d=0                // karşılaştırma için kapat
*/

module.exports = { DECOR_ENTRY };
