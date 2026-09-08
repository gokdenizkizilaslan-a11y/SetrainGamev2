# UI — How to replace

| Filename | Where it appears | Content.js key |
|---|---|---|
| `panel.png` | Gold-bordered container texture (optional) | `images.ui.panel` |

- Format: PNG or JPG both work.
- This is an **optional** texture overlay on panels. If missing, CSS glass effect is used (game still works).
- Recommended: 1024x1024 tileable parchment/gold texture, semi-transparent.
- To add: drop `panel.png` here → push → no code change needed. To use JPG, change `content.js` path to `/images/ui/panel.jpg`.

Other UI elements (buttons, bars) are pure CSS — no image needed. Add more textures by referencing them in `public/style.css` directly.
