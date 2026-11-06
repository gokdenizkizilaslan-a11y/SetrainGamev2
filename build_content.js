/**
 * build_content.js
 * Reverse pipeline: data/*.json -> content.js
 *
 * Reads every data/<section>.json (except index.json), rebuilds the CONTENT
 * object using the current content.js key order (new keys are appended),
 * validates it, and writes content.js only when something actually changed.
 *
 * Usage:
 *   node build_content.js             # data -> content.js (only if changed)
 *   node build_content.js --check     # exit 1 if data and content.js differ
 *   node build_content.js --out FILE  # write the built file elsewhere (no touch)
 *
 * The previous content.js is backed up to ../ForSetrain/backups (or
 * SETRA_BACKUP_DIR) by editor-save.js before it is replaced.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { CONTENT } = require("./content.js");
const {
  buildContentFile,
  validateContentJs,
  validateReferences,
  writeContent,
} = require("./editor-save.js");

const DATA_DIR = path.join(__dirname, "data");
const CONTENT_FILE = path.join(__dirname, "content.js");

function readSections() {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`data/ folder not found at ${DATA_DIR}. Run node extract_content.js first.`);
  }
  const sections = {};
  for (const file of fs.readdirSync(DATA_DIR)) {
    if (!file.endsWith(".json") || file === "index.json") continue;
    const key = file.slice(0, -".json".length);
    sections[key] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
  }
  return sections;
}

function assemble(sections) {
  const data = {};
  // Preserve the existing content.js key order; fall back to the current
  // value if a section file is missing (non-destructive).
  for (const key of Object.keys(CONTENT)) {
    data[key] = Object.prototype.hasOwnProperty.call(sections, key)
      ? sections[key]
      : CONTENT[key];
  }
  // Append any brand-new sections that only exist in data/.
  for (const key of Object.keys(sections)) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) data[key] = sections[key];
  }
  return data;
}

function buildValidated(data) {
  validateReferences(data);
  const built = buildContentFile(data);
  validateContentJs(built);
  return built;
}

function main() {
  const args = process.argv.slice(2);
  const data = assemble(readSections());

  const outIdx = args.indexOf("--out");
  if (outIdx !== -1) {
    const outPath = args[outIdx + 1];
    if (!outPath) throw new Error("--out requires a file path");
    const built = buildValidated(data);
    fs.writeFileSync(path.resolve(outPath), built, "utf8");
    console.log(`[build] wrote ${path.resolve(outPath)} (content.js untouched)`);
    return;
  }

  if (args.includes("--check")) {
    const built = buildValidated(data);
    const current = fs.readFileSync(CONTENT_FILE, "utf8");
    if (built === current) {
      console.log("[build] content.js is in sync with data/");
      return;
    }
    console.error("[build] OUT OF SYNC: data/ differs from content.js. Run: node build_content.js");
    process.exit(1);
  }

  const result = writeContent(data, { backup: true, skipIfSame: true });
  if (result.unchanged) {
    console.log("[build] content.js already in sync (no write)");
  } else {
    console.log(`[build] content.js updated. backup: ${result.backup}`);
  }
}

try {
  main();
} catch (err) {
  console.error(`[build] failed: ${err && err.message ? err.message : err}`);
  process.exit(1);
}