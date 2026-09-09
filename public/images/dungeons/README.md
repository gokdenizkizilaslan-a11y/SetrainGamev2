# Zindanlar — Görsel Ekleme

Her zindan `rank`'i ile yüklenir:

```
public/images/dungeons/<rank>.png     →  örnek: f.png
```

> Yol: `dungeons[].image = "/images/dungeons/<rank>.png"` — dosya adı tam olarak
> rank ile aynı olmalıdır. rank'ı `/editor` → **Dungeons** sayfasından görürsün.

## Rank listesi

| Dosya | Zindan | Dosya | Zindan |
|---|---|---|---|
| `f.png` | F-Rank | `ss.png` | SS-Rank |
| `d.png` | D-Rank | `ssplus.png` | SS+ |
| `c.png` | C-Rank | `fast.png` | Fast Dungeon |
| `b.png` | B-Rank | `ember_hollow.png` | Ember Hollow (special1) |
| `a.png` | A-Rank | `frost_crypt.png` | Frost Crypt (special2) |
| `s.png` | S-Rank | `shadow_sanctum.png` | Shadow Sanctum (special3) |
| — | — | `storm_bastion.png` | Storm Bastion (special4) |
| — | — | `void_maw.png` | Void Maw (special5) |
| — | — | `ancient_foundry.png` | Ancient Foundry (special6) |
| — | — | `phoenix_sanctum.png` | Phoenix Sanctum (special7) |

Patron zindanları (dungeon listesindeki kutucuk görseli):
`boss_ember_king.png, boss_frost_titan.png, boss_void_herald.png,
boss_storm_colossus.png, boss_world_eater.png`

## Kurallar

- Format: PNG veya JPG.
- Önerilen boyut: `512×512` veya `1024×1024` (kart büyük gösterilir).
- **Dosya yoksa:** sıcak kahverengi degrade kutu fallback'i görünür, oyun çökmez.
- Patronun savaş portresi ayrı klasörde: `public/images/bosses/` (oraya bak).

## Yeni zindan eklerken

1. `/editor` → **Dungeons** → **Add**: `rank`, `label` gir.
2. `Image path` alanına `/images/dungeons/<rank>.png` yaz.
3. Kaydet → `public/images/dungeons/<rank>.png` dosyasını at → restart.