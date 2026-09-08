# Bosses — How to replace

Each boss portrait is loaded by `bosses[].image`.

| Filename | Boss | Content.js id |
|---|---|---|
| `ember_king.png` | Ember King | `boss_ember_king` |
| `frost_titan.png` | Frost Titan | `boss_frost_titan` |
| `void_herald.png` | Void Herald | `boss_void_herald` |
| `storm_colossus.png` | Storm Colossus | `boss_storm_colossus` |
| `world_eater.png` | World Eater | `boss_world_eater` |

- Content.js path: `bosses[].image = "/images/bosses/<id_without_prefix>.png"` — e.g. `boss_ember_king` → `ember_king.png`
- Dungeon tiles for bosses (same bosses shown in dungeon list) are separate: `public/images/dungeons/boss_ember_king.png`
- Format: PNG or JPG both work.
- Recommended: 512x512 or 1024x1024, boss card is large.
- Missing → gradient fallback.

Add new boss: add to `bosses` array and `dungeons` (isBoss:true) and drop `my_boss.png` here.
