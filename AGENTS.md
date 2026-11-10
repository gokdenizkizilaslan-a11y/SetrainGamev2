# AGENTS.md — The Setra Game

## Architecture
- Node.js + Express + Socket.io authoritative server; browser client renders with HTML Canvas/CSS (no framework/bundler).
- Entry point: `server.js`. Game logic modules live in `server/` (combat, dungeon, shop, travel, pvp, quests, socketHandlers, ...).
- Frontend lives in `public/` (`index.html`, `js/client.js`, `js/screens.js`, `js/bgfx.js`, `style.css`).
- `content.js` is the single source of truth for all game data (items, skills, classes, monsters, bosses, pets, npcs, quests, dungeons, map, loot, ...).
- 3D dekor (`.glb` → sprite) sistemi: **`3D-ASSETS.md`** rehberini oku; kod `public/js/trees3d.js`, hook `travelEngine.js` `drawSceneryItem`, modeller `newassets/` (`/newassets` static).

## Modular data (use this first)
- `data/*.json` is a generated, read-only mirror of every top-level section of `content.js`.
- `data/index.json` lists each section, its file, type and record count — start here, then open only the one file you need.
- Two-way flow: edit `data/*.json` then run `node build_content.js` (data → content.js), or edit `content.js` then run `node extract_content.js` (content.js → data). Keep both in sync.

## Token discipline for future agents (strict)
- Do NOT scan whole folders or read every file. Open only the specific file(s) relevant to the task.
- For game data questions, read the matching `data/<section>.json` instead of the 439 KB `content.js`.
- For a bug, read the single `server/*.js` module involved plus the relevant `public/js/*.js`; do not dump `public/images`, `music/`, `sounds/`.
- `public/`, `server/`, `scripts/`, `content.js`, `server.js`, `Setra Travel.html`, `basla.bat`, `commit.bat`, `package.json` and `editor-*.js` are active game code/assets: never move, rename or bulk-rewrite them.
- `gamecraft-rpg-studiov1/` is the external GameCraft editor (launched separately, talks to `/editor` API). Leave it in place and out of the index.
- Use `rg`/Grep with a target pattern and `path` before opening files; avoid `ls -R` on asset folders.
- Report results in 2–5 lines with `file:line` references; no code dumps, no unsolicited summary paragraphs.

## Commands
- `npm start` (or `basla.bat`) — local server on http://localhost:3000
- `node extract_content.js` — rebuild `data/*.json` from `content.js`
- `node build_content.js` — rebuild `content.js` from `data/*.json` (only writes if changed; `--check` for CI, `--out` for a side file)
- `npm run check:anchors` — verify the agent task-map anchors still exist; run it after renaming any exported symbol
- `node scripts/glb_info.js <model.glb|newassets>` — GLB ölçüsü (heights + solidRadius önerisi)
- `node scripts/asset_tune.js <model> --hMul/--sink/--solid` — tüm aynı modeli ayarla; `--villages 2800` köyleri düzleştir
- `node scripts/world_reload.js` — SADECE haritayı (world_setra.json) diskten oyuna yükle; içerik verisine dokunmaz
- Custom agents: `.opencode/agents/setra.md` (primary developer: task map + token budget) and `.opencode/agents/setra-lite.md` (read-only locator subagent, max 10 `file:line` lines).

## Backups
- Editor saves copy the old `content.js` to `../ForSetrain/backups` (outside the repo, so it stays out of git and the index). Override the location with the `SETRA_BACKUP_DIR` env var.