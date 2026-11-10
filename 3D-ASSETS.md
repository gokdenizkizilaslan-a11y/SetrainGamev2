# 3D-ASSETS.md — 3D dekor nasıl eklenir

ARPG haritasındaki vektör dekor (ağaç vb.) yerine `newassets/*.glb` modellerini
koyan deneme sistemi. Modeller bir kez **offscreen WebGL** ile sprite'a (şeffaf
canvas) pişirilir, her karede sadece `drawImage` çalışır → vektör çizimden hızlı.

Akış: `newassets/x.glb` → `trees3d.js` bake → `Setra3DTrees.sprites` →
`travelEngine.js` `drawSceneryItem()` → `drawImage`.

## Dosyalar

| Dosya | Görev |
|---|---|
| `public/js/trees3d.js` | Bake motoru + `DECOR` tablosu + çizim |
| `public/js/travelEngine.js` (~`drawSceneryItem`) | `type === 'tree'` dalının başında 1 satır hook |
| `public/index.html` | `<script type="importmap">` (three) + `<script type="module" src="/js/trees3d.js">` |
| `public/vendor/three/` | Yerel three.js (`three.module.js`, `addons/loaders/GLTFLoader.js`, `addons/utils/BufferGeometryUtils.js`) |
| `server.js` | `app.use("/newassets", express.static(...))` → GLB'ler tarayıcıya açık |

## Yeni model ekleme (3 adım)
1. `.glb` dosyasını `newassets/` içine at.
2. `public/js/trees3d.js` içindeki `DECOR` tablosuna ekle (mevcut `tree` bloğunu kopyala):

```js
bush: {
  height: 26,                       // s.scale = 1 iken px yükseklik
  sway: true,
  models: { bush: "/newassets/bush.glb" },
  default: ["bush"],                // biyom havuzu yoksa
  biomes: { ashen: ["bush"] },      // opsiyonel biyom havuzları
},
```

3. `travelEngine.js` → `drawSceneryItem()` içinde ilgili `else if (s.type === '...')`
dalının **en başına** şu satırı ekle:

```js
if (window.Setra3DTrees && window.Setra3DTrees.drawScenery(ctx, s, x, y, this)) return;
```

Başka hiçbir yere dokunmak gerekmez: model id → biyom seçimi, rastgele dönüş,
taban hizası, ölçek ve fallback otomatik.

## Cephe (kapı) yönü — zorunlu sözleşme

Modellerin **kapısı local `+Z`** yönünde export edilir (`0°`). Oyun her modeli
16 açıdan pişirir (22.5° adım); hangi görünümün çizileceğini `rot` seçer:

```
az (kamera)  = rot + 45°
görünen yön  = cephe - rot            [atan2(dx, dz) ölçüsü]
rot          = cephe - atan2(dx, dz)  [kapı hedefe baksın]
```

- `build_villages.js` evleri bu varsayımla plazaya döndürür.
- Model farklı export edildiyse **iki yere aynı değeri** yaz:
  `trees3d.js` → `FRONT_DEG = { hut: 180 }` (derece) ve
  `build_villages.js` → `FACING = { hut: Math.PI }` (radyan).
  `+Z = 0 | +X = 90 | -Z = 180 | -X = 270`
- Teşhis: konsolda `Setra3DTrees.contactSheet("hut")` → 16 görünüm + `rot`
  değerleri açılır. Kapının göründüğü karede `cephe = -rot`.
- Hazır yardımcılar: `Setra3DTrees.rotToFace(model, x, y, hedefX, hedefY)`,
  `Setra3DTrees.faceDir(model, rot)`, `Setra3DTrees.frontTable`.

## Ölçü alma (tahmin yerine)

```powershell
node scripts/glb_info.js newassets/hut.glb      # veya klasör: node scripts/glb_info.js newassets
```

Çıktı: gerçek yükseklik, taban genişliği/derinliği, taban `y` (0 olmalı) ve
**önerilen `heights` + iki `solidRadius`** (ev/yapı ve prop için).
Birimler: `heights` dünya pikseli, `solidRadius` karo (1 karo = 64 px →
çarpışma yarıçapı `solidRadius × 64`).

## Model ayarı — tek yerden TÜM aynı model (tüm balyalar, tüm taşlar)

`world_setra.json` → `visual.modelTune[model]`:

```json
{
  "visual": {
    "modelTune": {
      "haybales": { "hMul": 1.15, "sink": 3 },
      "obelisk":  { "sink": 6, "solid": 1.05 }
    }
  }
}
```

| Alan | Etki |
|---|---|
| `hMul` | yükseklik çarpanı (1 = değişmez, 1.15 = %15 uzun) |
| `sink` | sprite'ı dünya px **aşağı** kaydır (negatif = yukarı) — "havada duruyor" düzeltmesi |
| `solid` | mutlak çarpışma yarıçapı (karo; 1 karo = 96 px) |
| `solidMul` | otomatik (gerçek ayak izi) yarıçapın çarpanı |

Komut satırından (sunucuyu yeniden başlatmayı unutma):

```powershell
node scripts/asset_tune.js haybales --hMul 1.15 --sink 3
node scripts/asset_tune.js obelisk  --sink 6 --solid 1.05
node scripts/asset_tune.js --list
node scripts/asset_tune.js haybales --clear
```

## Çarpışma (hitbox) — modelin kendisinden + GameCraft'ta şekil

GameCraft > Dünya Kurucu > **Çarpışma (global)** paneli: her model için
**Otomatik / Yuvarlak / Kare** seç, yarıçap veya genişlik–derinlik ver.
Yazdığı yer `visual.modelTune[model].shape` → o modelin **tüm kopyaları** aynı
şekli kullanır (tüm balyalar, tüm taş evler).

```json
"modelTune": {
  "haybales": { "shape": { "type": "circle", "r": 0.45 } },
  "stonehouse": { "shape": { "type": "box", "w": 1.4, "d": 1.5, "ox": 0, "oy": 0 } }
}
```

- Birim **karo** (1 karo = 96 px). `box` `rot` ile döner, `ox/oy` merkez kaydırır.
- Şekil yoksa **otomatik**: sadece binalar gerçek ayak izinden (`×0.72`),
  props (balya/fıçı/sandık) verideki değerin `×0.60`'ı.
- `visual.solidScale` → TÜM çarpışmalara global çarpan (panelde "Tüm çarpışmalar").
- İnce/uzun modeller (`fence, wall, bridge, banner, signpost, flowers, lamp,
  bush, stump, graves, logs, campfire, chest`) otomatiğe girmez.
- `tune.solid` (karo) eski kısa yol olarak hâlâ çalışır → yuvarlak kabul edilir.

## Köy zemini düzleştirme

Köy evleri kendi zemin yüksekliğine oturduğu için eğimde "gömülü/havada"
görünür. `flattenZones` düz bir çekirdek üretir: düz alan ≈ `radius × 0.42`.

```powershell
node scripts/asset_tune.js --villages 2800          # tüm köyler (r=2800 → ~1176px düz)
node scripts/asset_tune.js --flatten setra_village 2800
```

## Sadece haritayı uygula (içerik verisine dokunmadan)

Harita (`world_setra.json`) ayrı bir dosyadır; `content.js` / `data/*.json` ile
ilgisi yoktur. Üç yol var:

| Yol | Ne yapar |
|---|---|
| GameCraft > **Diskten Yükle** | Dosyayı **okur**, sunucu belleğini tazeler, istemcilere haber verir. Dosyaya **yazmaz** (elle yapılan değişiklikleri ezmez). |
| GameCraft > **Oyuna Uygula** | Editördeki kopyayı **yazar** + canlı günceller. |
| `node scripts/world_reload.js` | Aynı "Diskten Yükle" işlemini terminalden yapar. |

```powershell
node scripts/world_reload.js              # http://localhost:3000
node scripts/world_reload.js --port 3054
```

Sunucu tarafı: `POST /editor/api/world/reload` (`server/editorRoutes.js`) →
`worldStore.applyConfig()` → sürüm +1 → `world:updated` yayını → oyun haritayı
kendisi yeniden kurar (yenileme/restart gerekmez). İçerik verisi değişmez.

## Aç / kapa (geri dönüş)

| Yöntem | Etki |
|---|---|
| `?trees3d=0` veya `?trees3d=1` | URL bazlı, yenileme gerekir |
| `localStorage.setItem('setra.trees3d','0')` | Kalıcı kapatma |
| `Setra3DTrees.setEnabled(false)` / `toggleTrees3d()` | Anında (yenilemesiz) |
| `public/js/trees3d.js` script etiketini sil | Sistemi tamamen kaldırır, vektör çizim döner |

Modül yüklenemez / three import edilemez / sprite yoksa oyun **otomatik olarak**
eski vektör çizime düşer — oyun asla kırılmaz.

## Ayar düğmeleri (`trees3d.js` üstü)

- `height` — dünya ölçeğinde çizim yüksekliği (vektör ağaç ≈ 70, çalı ≈ 26).
- `SPRITE_W` / `SPRITE_H` — sprite çözünürlüğü (kalite ↑ / bellek ↑). Model
  kutuya sığacak şekilde otomatik çerçevelenir, şeffaf kenarlar kırpılır.
- `ROTS` — model başına dönüş sayısı. 3 iyi denge; 1'e indirirsen tek açı olur.
- Biyom id'leri `travelEngine.js` `biome` + `travel_visuals.js` `BIOME_DECOR`
  ile aynı olmalı (`verdant, frost, frozen, ashen, swamp, mirefen, cursed...`).

## Kritik tuzaklar (bunlar saat kaybettirdi)

1. **Model `scene.add()` edilmeden render edilirse SİYAH çıkar.** Işıklar sahnede
   olduğu için model de sahnenin çocuğu olmalı.
2. **`preserveDrawingBuffer: true` şart** — WebGL canvas'ı 2D canvas'a
   `drawImage` ile kopyalarken aksi halde boş/şeffaf gelir.
3. **GLB içinde Draco / meshopt / KTX2 olmasın.** Olursa `DRACOLoader` /
   `MeshoptDecoder` / `KTX2Loader` ayrıca bağlanmalı. (Mevcut `newassets`
   dosyaları sade GLB: gömülü PNG + PBR, sorun yok.)
4. **`newassets/` public dışında**: yeni klasör eklerseniz `server.js`'e bir
   `express.static` satırı daha gerekir, yoksa 404.
5. **`public/index.html` PowerShell `Set-Content` ile düzenlenmez** — UTF-8
   kodlamayı bozar (Türkçe karakter + emoji çöp olur). Editör/`edit` aracı kullan.
6. **Importmap + `type="module"` şart**: `three` çıplak import'u ancak importmap
   ile çözülür; `GLTFLoader`'ı `three/addons/` yolundan yükler.
7. Sprite **taban çapası** alt-ortadır (`ctx.drawImage(..., -w/2, -h, w, h)`);
   model y=0 zeminine hizalanır. Sıralama değişmez, `s.wx/s.wy` aynen kullanılır.

## Hızlı doğrulama

```powershell
node --check public/js/trees3d.js
node --check public/js/travelEngine.js
```

Tarayıcı konsolu:

```js
Setra3DTrees.ready            // true olmalı
Setra3DTrees.sprites          // { tree: { oak:[3], pine:[3], ... } }
Setra3DTrees.setEnabled(false) // vektör ağaçlara anında dön
```

Sahne testi: oyunu aç (`npm start`), Travel ekranına gir; ağaçlar 3B model
olarak görünmeli. Şüpheli durumda `?trees3d=0` ile karşılaştır.
