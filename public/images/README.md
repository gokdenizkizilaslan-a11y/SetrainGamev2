# Images — Quick Guide

Drop images here, push to Render, they replace the colored placeholder automatically. No code change needed unless you want a new name.

| Folder | What to put | Filename must be | Example push |
|---|---|---|---|
| `backgrounds/` | Menu/town/dungeon wallpapers | `menu.png`, `town.png`, `dungeon.png`, `tavern.png`, `setup.png`, `lobby.png` | `backgrounds/town.jpg` also works |
| `characters/` | Class portraits | `<slug>.png` → `warrior.png` | `characters/warrior.png` |
| `monsters/` | Monster portraits | `<monster_id>.png` → `slime.png` | `monsters/slime.png` |
| `dungeons/` | Dungeon tiles | `<rank>.png` → `f.png` | `dungeons/f.png` |
| `bosses/` | Boss large portraits | `ember_king.png` | `bosses/ember_king.png` |
| `items/` | Item icons | `<item_id>.png` → `rusty_sword.png` | `items/rusty_sword.png` |
| `skills/` | Skill icons | `<skill_id>.png` → `slash.png` | `skills/slash.png` |
| `ui/` | Panel texture (optional) | `panel.png` | `ui/panel.png` |
| `pets/` | Pet images (upcoming) | `<pet_id>.png` → `fire_wolf.png` | `pets/fire_wolf.png` |

- **Format:** `PNG` and `JPG` both work everywhere.
- **Missing file:** game shows colored gradient fallback — never crashes.
- **How it works:** `content.js` stores the path `/images/<folder>/<file>.png`. `public/js/screens.js:440 initImages` tries to load it; on success it sets `backgroundImage`.
- **Render deploy:** just `git add` + `git commit` + `git push` — Render serves `public/` statically.

See each subfolder's `README.md` for the exact filename list.
