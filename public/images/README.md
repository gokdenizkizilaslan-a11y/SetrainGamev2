# Resimler — Kapsamlı Rehber

Bu oyundaki **her şeye** görsel ekleyebilirsin: sınıflar, canavarlar, petler, eşyalar,
beceriler, zindanlar, patronlar ve arkaplanlar. **Kod değiştirmene gerek yok.**

---

## ✨ ALTIN KURAL (tek kural)

> **Dosya adı çok önemli:** Resmi `public/images/<klasör>/` içine, **tam olarak o
> şeyin "id"sine eşit** isimle at. `content.js`'teki `image` alanları zaten bu isimle
> aynı yolu gösterir (`/images/<klasör>/<id>.png`). Oyunun her yerinde otomatik görünür.

Örnek:
```
public/images/pets/pet_direwolf.png   →  Direwolf petinin ikonu
public/images/characters/warrior.png  →  Warrior sınıfı portresi
public/images/skills/slash.png        →  Slash beceri ikonu
```

Dosyayı at → dosyayı açıp kaydet → **görünür.** Render'a push atman yeterli.

---

## Hangi klasöre hangi dosya?

| Klasör | Ne koyarsın | Dosya adı | Örnek |
|---|---|---|---|
| `backgrounds/` | Arkaplan / duvar kağıdı | `bg.png` (global) veya ekran adı | `bg.png`, `town.png` |
| `characters/` | Sınıf portreleri | `<slug>.png` | `warrior.png`, `mage.png` |
| `monsters/` | Canavar portreleri | `<id>.png` | `slime.png`, `goblin.png` |
| `bosses/` | Patron portreleri | `<id>` (önek olmadan) | `ember_king.png` |
| `dungeons/` | Zindan kutucukları | `<rank>.png` | `f.png`, `boss_ember_king.png` |
| `items/` | Eşya ikonları | `<item_id>.png` | `rusty_sword.png` |
| `skills/` | Beceri ikonları | `<skill_id>.png` | `slash.png` |
| `pets/` | Pet görselleri | `<pet_id>.png` | `pet_direwolf.png` |
| `ui/` | Panel dokusu (opsiyonel) | `panel.png` | `panel.png` |

Her klasörde o klasöre özel detaylı bir `README.md` var — en doğru isim listesi orada.

---

## Dosya adını nereden buluyorsun?

1. **/editor'a gir** (localhost'ta `http://localhost:<port>/editor`).
2. İlgili sayfayı aç (Pets, Monsters, Items, Classes...).
3. Losyonun sağındaki `Edit` butonuna bas → **Image path** alanı var.
4. Kutucuk zaten senden beklenen dosya adını gösterir ve önizleme verir.
   Tüm id'ler 1 tek sayfada listelenir.

Editördeki `Image path` alanına **"Default: /images/pets/pet_x.png"** butonu otomatik
olarak doğru yolu doldurur; sen sadece dosyayı o ada sahip olarak klasöre at.

---

## Biçim ve boyutlar

- **Uzantı:** PNG, JPG, JPEG, WEBP — hepsi çalışır. Oyun önce `.png`, yoksa
  `.jpg/.jpeg/.webp` dener (dungeon ve backgrounds gibi bazı yerler `png → jpg` dener).
- **Önerilen boyutlar:**
  - Karakter / canavar / patron: `512×512` (şeffaf PNG idealdir, CSS yuvarlak gösterir)
  - Eşya / beceri / pet: `128×128`–`256×256`
  - Arkaplan: `1920×1080`
- Resimler CSS'te `cover` ile kırpılır — iyi görünmesi için konuyu ortaya koy.
- **Resim yoksa ne olur?** Oyun asla çökmez. Yerine renkli degrade + ikon koyar.
  Yani istediğin kadar eksik resim bırakabilirsin.

---

## Yeni bir şey eklerken (0'dan)

1. `/editor`'dan **Add** ile yeni kaydı oluştur (id'sini yaz).
2. `Image path` alanında **"Default: ..."** butonuna bas (yolu otomatik doldurur).
3. Kaydet (Save) → `content.js` güncellenir.
4. Resim dosyasını söylenen isimle ilgili klasöre at.
5. Sunucuyu yeniden başlat (content.js değiştiği için) → oyun yeni kaydı ve
   görseli gösterir.

> Sadece var olan bir kaydın resmini değiştiriyorsan **sunucu restartı gerekmez**
> (resim statik dosya olarak `public/` içinden servis edilir).

---

## Pet örneği (çok adımlı ama gerçek hayat kurtaran)

Pets sayfasında `pet_direwolf` adlı bir pet var ve oyun onun görselini şöyle ister:

```
/images/pets/pet_direwolf.png       → Baby  (seviye 1–7)
/images/pets/pet_direwolf_young.png → Young (seviye 8–14)
/images/pets/pet_direwolf_adult.png → Adult (seviye 15+)
```

Sadece `pet_direwolf.png` atarsan bebek/gelişim evreleri aynı resmi kullanır;
üç evreyi de beslersen pet büyüdükçe görsel değişir. Daha fazlası için
`pets/README.md`'ye bak.

---

## Görsel nerede gösteriliyor?

- **Karakterler:** karakter seçme ekranı, town sol panel profil resmi, sağ oyuncu
  listesi, savaş kartları.
- **Canavarlar / patronlar:** savaştaki düşman kartları, zindan listesi.
- **Petler:** savaşta fighter kartının altındaki minik ikonlar, Town → **Pets**
  penceresindeki slotlar + koleksiyon kartları, yumurta açılış animasyonu.
- **Eşyalar:** envanter, mağaza, market, chest (sandık) içerikleri.
- **Beceriler:** beceri paneli, savaşta kullanılan beceriler.
- **Zindanlar:** zindan seçim kartları.
- **Arkaplanlar:** tüm ekranların arkası.

---

## Özet (3 adım)

1. Resmi `public/images/` altındaki **doğru klasöre** at.
2. Dosya adı **tam olarak o şeyin id'si** olsun.
3. Gerekirse content.js'teki `image` yolunu düzenle (editör bunu kendin yapabilirsin).

Herhangi bir klasördeki `README.md` en güncel ve doğru isim listesini içerir —
oradan takip et.