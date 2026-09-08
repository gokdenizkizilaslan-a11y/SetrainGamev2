# Characters — How to replace

Each class portrait is loaded by its `slug`. Drop a file named exactly like the slug.

| Filename | Class | Notes |
|---|---|---|
| `warrior.png` | Warrior | Base class (visible on setup) |
| `ranger.png` | Ranger |  |
| `mage.png` | Mage |  |
| `rogue.png` | Rogue |  |
| `paladin.png` | Paladin |  |
| `assassin.png` | Assassin |  |
| `support.png` | Support Mage | slug is `support` |
| `tank.png` | Tank |  |
| `warlord.png` | War Lord | Evolution of warrior (Lv20) |
| `warden.png` | Warden | Evolution of ranger |
| `archmage.png` | Archmage | Evolution of mage |
| `nightblade.png` | Nightblade | Evolution of rogue |
| `crusader.png` | Crusader | Evolution of paladin |
| `reaper.png` | Reaper | Evolution of assassin |
| `high_priest.png` | High Priest | Evolution of support |
| `juggernaut.png` | Juggernaut | Evolution of tank |
| `war_emperor.png` | War Emperor | Lv40 |
| `storm_warden.png` | Storm Warden | Lv40 |
| `archon.png` | Archon | Lv40 |
| `shade_king.png` | Shade King | Lv40 |
| `lightbringer.png` | Lightbringer | Lv40 |
| `death_lord.png` | Death Lord | Lv40 |
| `divine_saint.png` | Divine Saint | Lv40 |
| `colossus.png` | Colossus | Lv40 |

- Path in `content.js`: `classes[].image = "/images/characters/<slug>.png"`
- Format: `PNG` or `JPG` both work (`warrior.jpg` also works if you change content.js, but keep `.png` to avoid editing content.js).
- Recommended: 512x512 transparent PNG, circle-cropped in CSS.
- Missing file → colored gradient circle fallback (game still works).

Add new class: add entry in `content.js` with `slug: "myclass"` and drop `myclass.png` here.
