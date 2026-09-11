// GameCraft studio API bridge. The GameCraft editor (gamecraft-rpg-studiov1,
// port 3054) talks to the game through these endpoints ("Oyun Verisini Çek" /
// "Oyuna Uygula" / "Commit & Push" / image upload). Do NOT delete this file —
// without it GameCraft cannot read or write content.js.
//
// Safety: on your own machine (localhost) the API is open. Anywhere else it is
// locked unless you set the CONTENT_EDIT_TOKEN environment variable and use that
// token (as `?token=...` or the `x-edit-token` header). Without a token the API
// works only locally, so the deployed game cannot be tampered with remotely.
"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const { CONTENT } = require("../content.js");
const { writeContent } = require("../editor-save.js");
const defs = require("../editor-defs.js");

const router = express.Router();

// The editor keeps its own working copy of the content data so the page stays in
// sync after a save, without touching the game's live in-memory copy (which only
// updates on a server restart).
let editorData = CONTENT;

function isLocal(req) {
  const host = (req.headers.host || "").split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "0.0.0.0";
}

function auth(req, res, next) {
  const token = process.env.CONTENT_EDIT_TOKEN;
  if (!token) {
    if (isLocal(req)) return next();
    return res
      .status(403)
      .json({ error: "The content editor is locked on the live site. Set the CONTENT_EDIT_TOKEN environment variable and visit /editor?token=YOURTOKEN to enable it." });
  }
  const provided = req.query.token || req.headers["x-edit-token"];
  if (provided === token) return next();
  return res.status(401).json({ error: "Invalid editor token." });
}

function resolveDefs(data) {
  const resolveField = (f) => {
    const out = { ...f };
    if (out.options !== undefined) {
      out.options = typeof out.options === "function" ? out.options(data) : out.options;
    }
    delete out.if; // client renders every field; predicates are terminal-only
    return out;
  };
  const resolveCollection = (c) => ({
    id: c.id,
    label: c.label,
    kind: "collection",
    path: c.path,
    idField: c.idField,
    idLabel: c.idLabel,
    nameField: c.nameField,
    nameLabel: c.nameLabel,
    itemLabelTemplate: c.itemLabelTemplate,
    newStrips: c.newStrips,
    fields: c.fields.map(resolveField),
  });

  return defs.pages.map((p) => {
    if (p.kind === "collection") return resolveCollection(p);
    if (p.kind === "form") return { id: p.id, label: p.label, kind: "form", fields: p.fields.map(resolveField) };
    if (p.kind === "loot") {
      return {
        id: p.id,
        label: p.label,
        kind: "loot",
        dropChancePath: p.dropChancePath,
        gradeWeightsPath: p.gradeWeightsPath,
        buyablePath: p.buyablePath,
        rarities: data.loot.rarityOrder,
        grades: Object.keys(data.loot.gradeWeights),
      };
    }
    if (p.kind === "anomalies") {
      return {
        id: p.id,
        label: p.label,
        kind: "anomalies",
        fields: p.fields.map(resolveField),
        traits: resolveCollection(p.traits),
      };
    }
    if (p.kind === "story") {
      return {
        id: p.id,
        label: p.label,
        kind: "story",
        titlePath: p.titlePath,
        paragraphsPath: p.paragraphsPath,
        ctaPath: p.ctaPath,
      };
    }
    if (p.kind === "affinity") {
      return {
        id: p.id,
        label: p.label,
        kind: "affinity",
      };
    }
    return p;
  });
}

// NOTE: the old standalone web UI (public/editor) was removed. GameCraft is the
// editor now; it only needs the /api/* endpoints below (plus the vite proxy).

// --- Image upload / listing (GameCraft "Fotoğraf Yükle" -> gerçek dosya) ---
const IMG_ROOT = path.join(__dirname, "..", "public", "images");
const IMG_FOLDERS = new Set([
  "backgrounds",
  "characters",
  "monsters",
  "bosses",
  "dungeons",
  "items",
  "skills",
  "pets",
  "ui",
]);
const IMG_EXT_RE = /^\.(png|jpe?g|webp|gif|svg)$/i;
const MAX_IMG_BYTES = 12 * 1024 * 1024; // ~12MB (base64 ~16MB)<express.json 50mb

router.get("/api/images", auth, (req, res) => {
  const folder = String(req.query.folder || "").toLowerCase();
  if (!IMG_FOLDERS.has(folder)) {
    return res.status(400).json({ ok: false, error: "Bilinmeyen resim klasörü: " + folder });
  }
  const dir = path.join(IMG_ROOT, folder);
  let names = [];
  try {
    names = fs
      .readdirSync(dir)
      .filter((f) => IMG_EXT_RE.test(path.extname(f)))
      .sort();
  } catch (e) {
    // folder may not exist yet
  }
  res.json({ ok: true, folder, files: names.map((n) => ({ name: n, url: "/images/" + folder + "/" + n })) });
});

// Uploads a base64 image into public/images/<folder>/<filename>. The client
// (GameCraft studio) sends the file bytes; the game serves it as a static
// file and the image field stores the returned /images/... path.
router.post("/api/upload", auth, (req, res) => {
  const folder = String((req.body && req.body.folder) || "").toLowerCase();
  const filename = String((req.body && req.body.filename) || "").toLowerCase();
  const data = (req.body && req.body.data) || "";

  if (!IMG_FOLDERS.has(folder)) {
    return res.status(400).json({ ok: false, error: "Bilinmeyen resim klasörü: " + folder });
  }
  const nameMatch = /^([a-z0-9][a-z0-9_-]*)\.([a-z0-9]+)$/.exec(filename);
  if (!nameMatch) {
    return res.status(400).json({ ok: false, error: "Geçersiz dosya adı (ör: " + folder + "_adi.png)." });
  }
  const ext = nameMatch[2];
  const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
  if (!ALLOWED_EXT.includes(ext)) {
    return res.status(400).json({ ok: false, error: "Desteklenen uzantılar: " + ALLOWED_EXT.join(", ") });
  }
  const safeName = nameMatch[1] + "." + ext;

  let buf;
  try {
    const b64 = String(data).includes(",") ? String(data).slice(String(data).indexOf(",") + 1) : String(data);
    buf = Buffer.from(b64, "base64");
  } catch (e) {
    return res.status(400).json({ ok: false, error: "Görsel verisi çözülemedi (base64)." });
  }
  if (!buf || buf.length === 0) {
    return res.status(400).json({ ok: false, error: "Boş görsel dosyası." });
  }
  if (buf.length > MAX_IMG_BYTES) {
    return res.status(413).json({ ok: false, error: "Görsel çok büyük (maks ~12MB)." });
  }

  const dir = path.resolve(IMG_ROOT, folder);
  const target = path.resolve(dir, safeName);
  if (!target.startsWith(path.resolve(IMG_ROOT) + path.sep)) {
    return res.status(400).json({ ok: false, error: "Geçersiz hedef yol." });
  }
  try {
    fs.mkdirSync(dir, { recursive: true });
    const existed = fs.existsSync(target);
    fs.writeFileSync(target, buf);
    res.json({ ok: true, url: "/images/" + folder + "/" + safeName, file: folder + "/" + safeName, overwritten: existed });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Dosya yazılamadı: " + String(e.message).slice(0, 300) });
  }
});

router.get("/api/editor", auth, (req, res) => {
  res.json({ defs: resolveDefs(editorData), data: editorData });
});

router.post("/api/editor/save", auth, (req, res) => {
  const data = req.body && req.body.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: "Expected a JSON body of the form { data: { ... } }." });
  }
  try {
    const result = writeContent(data, { backup: true });
    editorData = data;
    res.json({
      ok: true,
      backup: result.backup,
      note: "content.js güncellendi. Sunucuyu yeniden başlat (Ctrl+C, sonra npm start) — oyun restart'tan sonra kullanır. Yedek: " + (result.backup || "—") + ".",
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 1200) });
  }
});

router.post("/api/editor/save-and-push", auth, (req, res) => {
  const data = req.body && req.body.data;
  const message = (req.body && req.body.message) || "güncelleme";
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: "Expected a JSON body of the form { data: { ... }, message: \"...\" }." });
  }
  try {
    // 1) save content.js
    const result = writeContent(data, { backup: true });
    editorData = data;

    // 2) git add + commit + push (best-effort via execFileSync: no shell, no injection)
    const cwd = path.join(__dirname, "..");
    const gitLines = [];
    try {
      gitLines.push(execFileSync("git", ["add", "."], { cwd, encoding: "utf8", timeout: 30000 }).trim());
      gitLines.push(execFileSync("git", ["commit", "-m", message], { cwd, encoding: "utf8", timeout: 30000 }).trim());
      gitLines.push(execFileSync("git", ["push"], { cwd, encoding: "utf8", timeout: 60000 }).trim());
    } catch (gitErr) {
      gitLines.push(String((gitErr.stdout || "")).trim());
      gitLines.push(String((gitErr.stderr || "")).trim());
    }

    res.json({
      ok: true,
      backup: result.backup,
      note: "Saved + committed. " + gitLines.filter(Boolean).join(" | ").slice(0, 500),
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e.message).slice(0, 1200) });
  }
});

module.exports = router;
