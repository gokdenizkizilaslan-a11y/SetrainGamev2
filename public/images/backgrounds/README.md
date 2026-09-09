# Backgrounds — How to replace

Drop an image file here and push — Render will serve it instantly. No code change needed.

| Filename (exact) | Where it appears | Content.js key |
|---|---|---|
| `menu.png` (or `.jpg`) | Main menu screen | `images.backgrounds.menu` |
| `setup.png` | Character creation | `images.backgrounds.setup` |
| `lobby.png` | Lobby / hall list | `images.backgrounds.lobby` |
| `town.png` | Town dashboard | `images.backgrounds.town` |
| `dungeon.png` | Dungeon / combat overlay | `images.backgrounds.dungeon` |
| `tavern.png` | Tavern overlay | `images.backgrounds.tavern` |

- Format: `PNG`, `JPG`, `JPEG` veya `WEBP` — hepsi otomatik bulunur
  (`town.jpg` koyman yeterli, `.png` ŞART DEĞİL; oyun sırayla dener).
- Recommended size: 1920x1080, will be stretched/covered.
- If file is missing: warm parchment gradient fallback is shown (game still works).
- To replace: just drop `town.png` (veya `town.jpg`) here → commit → push to Render.
- Opaklık ayarı: `public/style.css` içinde `--bg-photo-opacity` değerini değiştir.

Example:
```
public/images/backgrounds/town.png   →  shows in town
public/images/backgrounds/dungeon.png →  shows in combat
```
