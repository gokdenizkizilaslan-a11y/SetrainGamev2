# Eşyalar — Görsel Ekleme

Her eşya `id`'si ile yüklenir:

```
public/images/items/<item_id>.png     →  örnek: rusty_sword.png
```

> Yol: `items[].image = "/images/items/<id>.png"`. id'yi `/editor` → **Items & Shop**
> sayfasından görürsün.

## Örnek id'ler (100+)

Silahlar: `rusty_sword, battle_axe, war_hammer, longbow, shortbow,
apprentice_staff, archon_staff, dagger, poison_dagger, mace, holy_sword,
kris_blade, whisper_blade, scepter, cleric_staff, maul, bulwark_hammer,
molten_cleaver, frost_gladius, ember_sword, phoenix_staff, void_cleaver,
iron_greatsword, steel_blade, ranger_bow, arcane_scepter, shadow_dagger,
dragon_spear, titan_hammer, storm_bow, void_blade, world_breaker...`
Zırhlar/ekipman: `leather_helm, leather_chest, leather_pants, leather_boots,
iron_amulet, iron_ring, mana_talisman, bronze_helm...`
Sarf malzemeleri (consumable): `hearth_tea, field_rations, fire_essence,
frost_essence, arcane_essence, shadow_essence, heart_of_fire, golem_heart,
ancient_relic...`
Sandıklar: `wooden_chest, iron_chest, gold_chest` (varsayılan ikonlu; resim
atarsan onu kullanır).

## Kurallar

- Format: PNG veya JPG.
- Önerilen boyut: `256×256` şeffaf PNG.
- **Dosya yoksa:** kahverengi degrade + ilgili ikon fallback'i görünür, oyun çökmez.

## Yeni eşya eklerken

1. `/editor` → **Items & Shop** → **Add**: `id`, `name`, `slot`, `rarity` gir.
2. **Image path**'teki **"Default: ..."** butonuna bas.
3. Kaydet → `public/images/items/<id>.png` dosyasını at → restart.