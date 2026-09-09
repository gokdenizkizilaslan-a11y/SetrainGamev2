# Sınıflar — Görsel Ekleme

Her sınıf portresi `slug`'u ile yüklenir. Dosya adı tam olarak slug olsun:

```
public/images/characters/<slug>.png     →  örnek: warrior.png
```

> ipucu: slug'ı `/editor` → **Classes** sayfasından görürsün (Edit → "Image path").

## Tüm slug'lar

| Dosya | Sınıf | Dosya | Sınıf |
|---|---|---|---|
| `warrior.png` | Warrior | `warlord.png` | War Lord (Lv20) |
| `ranger.png` | Ranger | `warden.png` | Warden (Lv20) |
| `mage.png` | Mage | `archmage.png` | Archmage (Lv20) |
| `rogue.png` | Rogue | `nightblade.png` | Nightblade (Lv20) |
| `paladin.png` | Paladin | `crusader.png` | Crusader (Lv20) |
| `assassin.png` | Assassin | `reaper.png` | Reaper (Lv20) |
| `support.png` | Support Mage | `high_priest.png` | High Priest (Lv20) |
| `tank.png` | Tank | `juggernaut.png` | Juggernaut (Lv20) |
| `tamer.png` | Tamer | `beastmaster.png` | Beastmaster (Lv20?) |
| — | — | `war_emperor.png` | War Emperor (Lv40) |
| — | — | `storm_warden.png` | Storm Warden (Lv40) |
| — | — | `archon.png` | Archon (Lv40) |
| — | — | `shade_king.png` | Shade King (Lv40) |
| — | — | `lightbringer.png` | Lightbringer (Lv40) |
| — | — | `death_lord.png` | Death Lord (Lv40) |
| — | — | `divine_saint.png` | Divine Saint (Lv40) |
| — | — | `colossus.png` | Colossus (Lv40) |

## Kurallar

- Yol: `classes[].image = "/images/characters/<slug>.png"` (editörde değiştirilebilir).
- Format: PNG veya JPG. `.png` önerilir (content.js'teki yol zaten `.png`).
- Önerilen boyut: `512×512` şeffaf PNG (CSS yuvarlak gösterir).
- **Dosya yoksa:** renkli degrade + ilk harf fallback'i görünür, oyun çökmez.

## Yeni sınıf eklerken

1. `/editor` → **Classes** → **Add**: `slug` (küçük harf, boşluksuz) ve `label` gir.
2. **Image path**'te **"Default: ..."** butonuna bas.
3. Kaydet → `public/images/characters/<slug>.png` dosyasını at → restart.