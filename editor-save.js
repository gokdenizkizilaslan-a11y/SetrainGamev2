// Shared logic to write content.js safely. Used by both the terminal editor
// (edit-content.js) and the web editor (/editor). Always validates the new file
// before replacing the real one, and backs up the previous version first.
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const CONTENT_FILE = path.join(__dirname, "content.js");

function buildContentFile(data) {
  const src = fs.readFileSync(CONTENT_FILE, "utf8");
  const objStart = src.indexOf("const CONTENT =");
  if (objStart === -1) throw new Error("Could not find the CONTENT block in content.js.");
  const fnIdx = src.indexOf("\nfunction getClass");
  if (fnIdx === -1) throw new Error("Could not find the end of the CONTENT block.");
  const closeIdx = src.lastIndexOf("};", fnIdx);
  if (closeIdx === -1) throw new Error("Could not find the end of the CONTENT block.");
  const head = src.slice(0, objStart);
  const tail = src.slice(closeIdx + 2);
  return head + "const CONTENT = " + JSON.stringify(data, null, 2) + ";" + tail;
}

function validateContentJs(content) {
  const tmp = path.join(os.tmpdir(), `setra-content-check-${Date.now()}-${Math.floor(Math.random() * 1e6)}.js`);
  fs.writeFileSync(tmp, content, "utf8");
  const res = spawnSync(process.execPath, ["-e", "require(process.argv[1])", tmp], { encoding: "utf8" });
  fs.unlinkSync(tmp);
  if (res.status !== 0) {
    throw new Error((res.stderr || res.stdout || "Validation failed.").trim().slice(0, 1200));
  }
}

// Referential integrity: renaming a slug/label in the editor must not orphan
// references or leave dead duplicate classes behind. Throws on error.
function validateReferences(data) {
  const errors = [];
  const classes = Array.isArray(data.classes) ? data.classes : [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const skillIds = new Set(skills.map((s) => s && s.id));
  const slugs = new Set();
  const labels = new Set();
  for (const c of classes) {
    if (!c || typeof c.slug !== "string" || !c.slug.trim()) {
      errors.push("A class has an empty slug.");
      continue;
    }
    if (slugs.has(c.slug)) errors.push(`Duplicate class slug "${c.slug}".`);
    slugs.add(c.slug);
    const lab = String(c.label || "").trim().toLowerCase();
    if (lab) {
      if (labels.has(lab)) errors.push(`Duplicate class label "${c.label}" — slugs AND labels must both be unique.`);
      labels.add(lab);
    }
  }
  const evoTargets = new Set();
  for (const c of classes) {
    const routes = [];
    if (c.evolution) routes.push(c.evolution);
    if (Array.isArray(c.evolutions)) routes.push(...c.evolutions);
    for (const r of routes) {
      if (r && r.to) {
        evoTargets.add(r.to);
        if (!slugs.has(r.to)) errors.push(`Class "${c.slug}" evolves to missing class "${r.to}".`);
      }
    }
    if (c.baseClass && !slugs.has(c.baseClass)) {
      errors.push(`Class "${c.slug}" has missing baseClass "${c.baseClass}".`);
    }
    for (const sid of c.startingSkills || []) {
      if (!skillIds.has(sid)) errors.push(`Class "${c.slug}" lists missing skill "${sid}".`);
    }
  }
  const lineages = (data.skillTree && data.skillTree.lineages) || {};
  for (const key of Object.keys(lineages)) {
    if (!slugs.has(key)) errors.push(`Skill tree branch "${key}" has no matching class.`);
    const nodes = lineages[key] && lineages[key].nodes;
    if (Array.isArray(nodes)) {
      for (const n of nodes) {
        if (n && n.skillId && !skillIds.has(n.skillId)) {
          errors.push(`Skill tree node "${n.id}" points to missing skill "${n.skillId}".`);
        }
        if (n && n.ownerClass && !slugs.has(n.ownerClass)) {
          errors.push(`Skill tree node "${n.id}" is owned by missing class "${n.ownerClass}".`);
        }
      }
    }
  }
  // Dead-copy detector: hidden from class select (has baseClass) yet no
  // evolution leads to it — exactly how the alpha_tamer orphan happened.
  for (const c of classes) {
    if (c.baseClass && !evoTargets.has(c.slug)) {
      errors.push(`Class "${c.slug}" is unreachable: it never appears in class select and no evolution leads to it. Delete it or wire an evolution to it.`);
    }
  }
  // NPC dialogue graph: broken links land on an empty panel.
  if (Array.isArray(data.npcs)) {
    const npcIds = new Set();
    for (const n of data.npcs) {
      if (!n || typeof n.id !== "string" || !n.id.trim()) {
        errors.push("An NPC has an empty id.");
        continue;
      }
      if (npcIds.has(n.id)) errors.push(`Duplicate NPC id "${n.id}".`);
      npcIds.add(n.id);
      if (!n.name) errors.push(`NPC "${n.id}" has an empty name.`);
      const nodes = Array.isArray(n.nodes) ? n.nodes : [];
      const nodeIds = new Set(nodes.map((x) => x && x.id));
      if (!nodeIds.has("start")) errors.push(`NPC "${n.id}" has no "start" node — talk cannot begin.`);
      for (const x of nodes) {
        for (const o of (x && x.options) || []) {
          if (!o || !o.label) errors.push(`NPC "${n.id}" node "${x && x.id}" has an option without a label.`);
          if (o && !o.end && o.to && !nodeIds.has(o.to)) {
            errors.push(`NPC "${n.id}" node "${x && x.id}" points to missing node "${o.to}".`);
          }
        }
      }
    }
  }
  if (errors.length) {
    throw new Error("Content validation failed:\n- " + errors.slice(0, 12).join("\n- ") + (errors.length > 12 ? `\n- ... +${errors.length - 12} more` : ""));
  }
}

// Returns { ok: true, backup?: <name> } or throws on validation failure.
function writeContent(data, opts = {}) {
  validateReferences(data);
  const content = buildContentFile(data);
  validateContentJs(content);
  let backupName = null;
  if (opts.backup !== false) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    backupName = `content.backup-${stamp}.js`;
    fs.copyFileSync(CONTENT_FILE, path.join(__dirname, backupName));
  }
  fs.writeFileSync(CONTENT_FILE, content, "utf8");
  return { ok: true, backup: backupName };
}

module.exports = { CONTENT_FILE, buildContentFile, validateContentJs, validateReferences, writeContent };
