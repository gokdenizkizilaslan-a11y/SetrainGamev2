# Patronlar — Görsel Ekleme

Boss portresi `bosses[].image` ile yüklenir. Dikkat: **dosya adı id'nin öneksiz
haliyle** yazılır:

```
public/images/bosses/<id_without_boss_>.png     →  örnek: ember_king.png
```

| Dosya | Patron | content.js id |
|---|---|---|
| `ember_king.png` | Ember King | `boss_ember_king` |
| `frost_titan.png` | Frost Titan | `boss_frost_titan` |
| `void_herald.png` | Void Herald | `boss_void_herald` |
| `storm_colossus.png` | Storm Colossus | `boss_storm_colossus` |
| `world_eater.png` | World Eater | `boss_world_eater` |

- Zindan listesindeki kutucuk görseli ayrıdır: `public/images/dungeons/boss_ember_king.png`
  (rank dosya adı patron id'siyle aynıdır — bkz. `dungeons/README.md`).
- Format: PNG veya JPG.
- Önerilen boyut: `512×512`–`1024×1024` (boss kartı büyük gösterilir).
- **Dosya yoksa:** renkli degrade fallback'i görünür, oyun çökmez.

Yeni boss eklerken: `bosses` dizisine kayıt ekle + `dungeons`'a `isBoss: true`
kayıt + `public/images/bosses/<ad>.png` + `public/images/dungeons/boss_<ad>.png`.