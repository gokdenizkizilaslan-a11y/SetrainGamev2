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
