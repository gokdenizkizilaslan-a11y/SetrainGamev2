# Monsters — How to replace

Each monster is loaded by its `id`.

| Filename pattern | Example | Content.js source |
|---|---|---|
| `<monster_id>.png` | `slime.png` | `monsters[].id` |
| Also `JPG` works | `slime.jpg` | same path |

Full list currently (30+):
`slime, goblin, giant_rat, cave_bat, wolf, kobold, forest_mite, grove_sprite, ember_sprite, vine_lurker, iron_goblin, bone_archer, frost_wolf, ash_spider, brigand_captain, marsh_crawler, abyss_wraith, storm_harpy, flame_witch, goblin_warrior, skeleton, dire_wolf, crystal_golem, cursed_knight, iron_ogre, golem, wraith, manticore, harpy, stone_warden, ogre, dark_knight, witch, wyvern, frost_wyvern, void_golem, storm_lich, nether_hydra, dusk_manticore, ancient_golem, lich, doom_lord, world_eater, hydra, stone_titan, molten_behemoth, frost_titan, void_herald, storm_colossus, phoenix_canary` + 5 bosses: `boss_ember_king, boss_frost_titan, boss_void_herald, boss_storm_colossus, boss_world_eater`

- Path: `monsters[].image = "/images/monsters/<id>.png"` (bosses use `/images/bosses/...` but can also be here)
- Format: PNG or JPG.
- Recommended: 512x512, combat card is 200x120 cover.
- Missing → dark red gradient fallback.

Add new monster: add to `monsters` array in content.js with `id: "my_monster"` and drop `my_monster.png` here, then add id to a dungeon's `monsterPool`.
