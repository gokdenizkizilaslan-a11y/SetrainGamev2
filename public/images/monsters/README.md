# Canavarlar — Görsel Ekleme

Her canavar `id`'si ile yüklenir:

```
public/images/monsters/<monster_id>.png     →  örnek: slime.png
```

> Yol: `monsters[].image = "/images/monsters/<id>.png"`. id'yi `/editor` →
> **Monsters** sayfasından görürsün.

## Sık kullanılan id'ler (yaklaşık 50+)

`slime, goblin, giant_rat, cave_bat, wolf, kobold, forest_mite, grove_sprite,
ember_sprite, vine_lurker, iron_goblin, bone_archer, frost_wolf, ash_spider,
brigand_captain, marsh_crawler, abyss_wraith, storm_harpy, flame_witch,
goblin_warrior, skeleton, dire_wolf, crystal_golem, cursed_knight, iron_ogre,
golem, wraith, manticore, harpy, stone_warden, ogre, dark_knight, witch, wyvern,
frost_wyvern, void_golem, storm_lich, nether_hydra, dusk_manticore, ancient_golem,
lich, doom_lord, world_eater, hydra, stone_titan, molten_behemoth, frost_titan,
void_herald, storm_colossus, phoenix_canary, vine_wraith, thornback_boar, elder_treant`

> Patronlar ayrıca `public/images/bosses/` klasörünü kullanır (aşağıya bak) ama
> istersen canavarla aynı `id`'li dosya burada da kabul edilir.

## Kurallar

- Ek bir adım: canavarı bir zindana eklemek istersen dungeon'ın `monsterPool` listesine
  (editörde **Dungeons** → `Monster ids`) id'yi yaz.
- Format: PNG veya JPG.
- Önerilen boyut: `512×512`; savaş kartı `cover` ile 200×120 kırpar.
- **Dosya yoksa:** koyu kırmızı degrade fallback'i görünür, oyun çökmez.

## Yeni canavar eklerken

1. `/editor` → **Monsters** → **Add**: `id` (örn. `my_monster`), `name`, `hp`,
   `attack`, `speed`, `rarity` gir.
2. **Image path**'te **"Default: ..."** butonuna bas.
3. Kaydet → `public/images/monsters/my_monster.png` dosyasını at.
4. Bir zindanın `monsterPool`'una ekle → restart.