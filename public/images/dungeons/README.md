# Dungeons — How to replace

Each dungeon tile is loaded by its `rank`.

| Filename | Dungeon | Rank key |
|---|---|---|
| `f.png` | F-Rank | `f` |
| `d.png` | D-Rank | `d` |
| `c.png` | C-Rank | `c` |
| `b.png` | B-Rank | `b` |
| `a.png` | A-Rank | `a` |
| `s.png` | S-Rank | `s` |
| `ss.png` | SS-Rank | `ss` |
| `ssplus.png` | SS+ | `ssplus` |
| `fast.png` | Fast Dungeon | `fast` |
| `ember_hollow.png` | Ember Hollow | `special1` |
| `frost_crypt.png` | Frost Crypt | `special2` |
| `shadow_sanctum.png` | Shadow Sanctum | `special3` |
| `storm_bastion.png` | Storm Bastion | `special4` |
| `void_maw.png` | Void Maw | `special5` |
| `ancient_foundry.png` | Ancient Foundry | `special6` |
| `phoenix_sanctum.png` | Phoenix Sanctum | `special7` |
| `boss_ember_king.png` | Ember King (dungeon tile) | `boss_ember_king` |
| `boss_frost_titan.png` | Frost Titan | `boss_frost_titan` |
| `boss_void_herald.png` | Void Herald | `boss_void_herald` |
| `boss_storm_colossus.png` | Storm Colossus | `boss_storm_colossus` |
| `boss_world_eater.png` | World Eater | `boss_world_eater` |

- Path: `dungeons[].image = "/images/dungeons/<rank>.png"` — filename must match exactly.
- Format: PNG or JPG both work.
- Recommended: 512x512 or 1024x1024.
- Missing → warm brown gradient tile fallback.

Add new dungeon: add entry in `dungeons` with `rank: "myrank"` and drop `myrank.png` here.
