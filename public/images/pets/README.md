# Petler — Görsel Eklemek

Petler oyunda **aktif olarak kullanılıyor** (eski README'de "yakında" yazıyordu,
artık çalışıyor). Her petin görseli `id`'sine göre yüklenir.

## Kenar kuralı

Dosyayı şu klasöre at: `public/images/pets/`

```
public/images/pets/<pet_id>.png   →  örnek: pet_direwolf.png
```

Oyun yolu `/images/pets/<id>.png` olarak `content.js`'teki pets satırından alır.
`id`'sini bilmiyorsan `/editor` → **Pets** sayfasından bak (Edit'e tıklayınca
"Image path" alanı önerilen dosya adını gösterir).

## Evreye göre farklı görsel (baby → young → adult)

Petler 3 evre geçirir ve istersen her evreye **ayrı görsel** koyabilirsin:

| Evre | Seviye | Beklenen dosya |
|---|---|---|
| Baby | 1–7 | `pet_direwolf.png` |
| Young | 8–14 | `pet_direwolf_young.png` |
| Adult | 15+ | `pet_direwolf_adult.png` |

Sadece `pet_direwolf.png` koyarsan üç evre de onu kullanır. `pet_direwolf_young.png`
koyarsan genç evrede otomatik ona geçer. (Örn. `pet_sprout.png`, `pet_sprout_young.png`,
`pet_sprout_adult.png`.)

## Pet görselleri nerede görünüyor?

- **Savaş kartları:** Dövüşçü panosunun altında minik yuvarlak ikonlar
  (`.pet-icon` — 22px). Savaş Ekibi görüntüsüne ek olarak şunlarda da:
- **Town → Pets penceresi** (`Pets` butonu):
  - Üstte **"Equipped Pets"** slotları (`.pet-slot-icon` — 42px yuvarlak).
  - Aşağıda **"Collection"** listesindeki pet kartları (`.item-icon` — 40px).
- **Yumurta açılışı:** Hatch animasyonunda büyük avatar
  (`egg-hatch/egg_animation.js` — `pet-def.image` kullanır, sonra `/images/pets/<id>.png`'e düşer).

## Biçim / boyut / yanılgı

- PNG **veya** JPG çalışır. Önerilen: `256×256` şeffaf PNG.
- Görsel CSS'te `cover` + `border-radius: 50%` ile gösterilir; karakteri ortala.
- **Dosya yoksa:** renkli yuvarlak varsayılan (fallback) görünür, oyun çökmez.

## Yeni pet eklerken

1. `/editor` → **Pets** → **Add**: `id` (örn. `pet_fire_fox`), `name`, `element` gir.
2. **Image path** alanındaki **"Default: ..."** butonuna bas → yol otomatik doldurulur.
3. Kaydet → `content.js` güncellenir.
4. `public/images/pets/pet_fire_fox.png` dosyasını at (+ istersen `_young` / `_adult`).
5. Sunucuyu yeniden başlat (content.js değişti).

## Mevcut petlerden bazıları (id listesi)

Red Egg: `pet_direwolf, pet_ember_pup, pet_cinder_cub, pet_slime, pet_sprout,
pet_flame_sprite`
Green Egg: `pet_mossling, pet_vine_pup, pet_thorn_whelp, pet_grove_sprite,
pet_slime_king, pet_forest_cub, pet_natureling`
Blue Egg: `pet_frost_pup, pet_ice_whelp, pet_snow_cub, pet_glacierling,
pet_chill_sprite, pet_frost_drake`
Brown Egg: `pet_stone_pup, pet_rockling, pet_boulder_cub, pet_crystal_sprite,
pet_golem_whelp, pet_granite_pup`
Yellow Egg: `pet_storm_pup, pet_thunder_cub, pet_lightning_drake, pet_wind_sprite,
pet_gale_whelp, pet_storm_hatchling`
... ve Purple/Cyan/Dark/Orange/Gold egg'ler + buff petleri (örn. `pet_rage_pup_100`).
Tamamı editörden veya `content.js` `pets` dizisinden.