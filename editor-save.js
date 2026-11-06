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
  // Full cross-reference sweep: any id one system mentions must exist in
  // the other. These are the bugs players can't test until hours in
  // (silent no-ops, dead buttons, missing loot), so they fail here.
  {
    const itemIds = new Set((data.items || []).map((i) => i && i.id));
    const monIds = new Set((data.monsters || []).map((m) => m && m.id));
    const bossIds = new Set((data.bosses || []).map((b) => b && b.id));
    const npcIds2 = new Set((data.npcs || []).map((n) => n && n.id));
    const eggIds = new Set((data.eggs || []).map((e) => e && e.id));
    const petIds = new Set((data.pets || []).map((p) => p && p.id));
    const elemIds = new Set((data.elements || []).map((e) => e && e.id));
    const dungeonRanks = new Set((data.dungeons || []).map((d) => d && d.rank));
    const questIds = new Set((data.quests || []).map((q) => q && q.id));
    const setIds = new Set((data.itemSets || []).map((s) => s && s.id));
    const taxo = new Set(data.monsterTags || []);
    const rarities = (data.loot && data.loot.rarityOrder) || [];
    const ITEM_STATS = ["attack", "resistance", "magicPower", "healPower", "maxHp", "maxMana", "hp", "mana", "speed", "critChance", "critDamage", "manaRegen", "omnivamp", "lifesteal"];
    // RACE_STATS: dosyanın üstündeki ortak liste kullanılır.
    const RACE_STATS = ["attack", "resistance", "magicPower", "healPower", "maxHp", "maxMana", "speed", "manaRegen", "critChance", "critDamage"];
    const BUFFS = ["attack", "defense", "regen", "weaken", "expose", "dot", "wet", "frozen", "shield", "magicBoost", "pet_attack", "pet_magic", "pet_defense", "pet_weaken", "healblock", "stack", "heal", "poison"];
    for (const c of classes) {
      for (const r of [...(c.evolutions || []), ...(c.evolution ? [c.evolution] : [])]) {
        if (r && r.requiredItem && !itemIds.has(r.requiredItem)) errors.push(`Class "${c.slug}" evolution item "${r.requiredItem}" is not in items.`);
        if (r && r.requiresQuest && !questIds.has(r.requiresQuest)) errors.push(`Class "${c.slug}" evolution quest "${r.requiresQuest}" is not in quests.`);
      }
    }
    for (const s of skills) {
      if (s.element && !elemIds.has(s.element)) errors.push(`Skill "${s.id}" has unknown element "${s.element}".`);
      for (const b of s.buffs || []) {
        if (b && b.kind && !BUFFS.includes(b.kind)) errors.push(`Skill "${s.id}" has unknown buff "${b.kind}" (silently ignored in combat).`);
      }
      if (s.bonusVsStatus && !BUFFS.includes(s.bonusVsStatus.status)) errors.push(`Skill "${s.id}" bonusVsStatus "${s.bonusVsStatus.status}" never triggers.`);
      if (s.secondHit && s.secondHit.element && !elemIds.has(s.secondHit.element)) errors.push(`Skill "${s.id}" secondHit element "${s.secondHit.element}" is unknown.`);
      if (s.baseDamage && typeof s.baseDamage === "object" && s.baseDamage.stat) {
        const st = s.baseDamage.stat;
        if (!["targetMaxHp", "targetHp", "attack", "magicPower", "maxHp", "maxMana", "resistance", "healPower", "speed"].includes(st)) errors.push(`Skill "${s.id}" baseDamage stat "${st}" does nothing.`);
      }
      if (s.heal && typeof s.heal === "object" && s.heal.stat && !["maxHp", "attack", "magicPower", "healPower"].includes(s.heal.stat)) errors.push(`Skill "${s.id}" heal stat "${s.heal.stat}" does nothing.`);
    }
    for (const i of data.items || []) {
      if (i.stats) for (const k of Object.keys(i.stats)) {
        if (!ITEM_STATS.includes(k)) errors.push(`Item "${i.id}" stat "${k}" is never applied.`);
      }
      if (i.setId && !setIds.has(i.setId)) errors.push(`Item "${i.id}" set "${i.setId}" is not in itemSets.`);
    }
    for (const st of data.itemSets || []) {
      let prev = 0;
      for (const t of st.bonuses || []) {
        if (!(t.pieces > prev)) errors.push(`Item set "${st.id}" tiers must ascend.`);
        prev = t.pieces;
        for (const k of Object.keys((t.stats) || {})) {
          if (!ITEM_STATS.includes(k)) errors.push(`Item set "${st.id}" stat "${k}" is never applied.`);
        }
      }
    }
    for (const m of data.monsters || []) {
      if (m.element && !elemIds.has(m.element)) errors.push(`Monster "${m.id}" has unknown element "${m.element}".`);
      if (m.rarity && !rarities.includes(m.rarity)) errors.push(`Monster "${m.id}" has unknown rarity "${m.rarity}".`);
      for (const sk of m.skills || []) if (!skillIds.has(sk)) errors.push(`Monster "${m.id}" uses missing skill "${sk}".`);
      for (const t of m.tags || []) if (!taxo.has(t)) errors.push(`Monster "${m.id}" tag "${t}" is not in monsterTags.`);
    }
    for (const d of data.dungeons || []) {
      for (const mid of d.monsterPool || []) {
        if (!monIds.has(mid) && !bossIds.has(mid)) errors.push(`Dungeon "${d.rank}" spawns missing monster "${mid}".`);
      }
      for (const mt of d.materialPool || []) {
        if (!itemIds.has(mt)) errors.push(`Dungeon "${d.rank}" drops missing material "${mt}".`);
      }
      if (d.unlockAfter && !bossIds.has(d.unlockAfter)) errors.push(`Dungeon "${d.rank}" unlockAfter missing boss "${d.unlockAfter}".`);
      if (d.sizeProfile && !["more", "fewerStronger"].includes(d.sizeProfile)) errors.push(`Dungeon "${d.rank}" has unknown sizeProfile "${d.sizeProfile}".`);
      if (d.isBoss && !(d.monsterPool || []).some((x) => bossIds.has(x))) errors.push(`Dungeon "${d.rank}" isBoss but its pool has no boss.`);
    }
    for (const b of data.bosses || []) {
      if (b.weaponId && !itemIds.has(b.weaponId)) errors.push(`Boss "${b.id}" weapon "${b.weaponId}" is not in items.`);
      if (b.chestId && !itemIds.has(b.chestId)) errors.push(`Boss "${b.id}" chest "${b.chestId}" is not in items.`);
      if (b.unlockAfter && !bossIds.has(b.unlockAfter)) errors.push(`Boss "${b.id}" unlockAfter missing boss "${b.unlockAfter}".`);
      if (b.element && !elemIds.has(b.element)) errors.push(`Boss "${b.id}" has unknown element "${b.element}".`);
      for (const t of b.tags || []) if (!taxo.has(t)) errors.push(`Boss "${b.id}" tag "${t}" is not in monsterTags.`);
      for (const arr of Object.values(b.phaseSkills || {})) {
        for (const sid of arr || []) {
          if (!skillIds.has(sid)) errors.push(`Boss "${b.id}" phase skill "${sid}" is not in skills (boss would stall).`);
        }
      }
      if (b.rewards && b.rewards.guaranteedDrop && !itemIds.has(b.rewards.guaranteedDrop)) errors.push(`Boss "${b.id}" reward "${b.rewards.guaranteedDrop}" is not in items.`);
    }
    {
      const nodeIds = new Set();
      const allNodes = [...((data.skillTree && data.skillTree.global) || [])];
      for (const l of Object.values((data.skillTree && data.skillTree.lineages) || {})) {
        for (const n of (l && l.nodes) || []) allNodes.push(n);
      }
      for (const n of allNodes) {
        if (!n || !n.id) { errors.push("Skill tree has a node without id."); continue; }
        if (nodeIds.has(n.id)) errors.push(`Duplicate skill tree node "${n.id}".`);
        nodeIds.add(n.id);
      }
      for (const n of allNodes) {
        if (n.skillId && !skillIds.has(n.skillId)) errors.push(`Skill tree node "${n.id}" points to missing skill "${n.skillId}".`);
        for (const p of n.prereqs || []) {
          if (!nodeIds.has(p)) errors.push(`Skill tree node "${n.id}" requires missing node "${p}" (unlearnable).`);
        }
        if (n.ownerClass && !slugs.has(n.ownerClass)) errors.push(`Skill tree node "${n.id}" is owned by missing class "${n.ownerClass}".`);
      }
    }
    for (const q of data.quests || []) {
      if (q.giver && !npcIds2.has(q.giver)) errors.push(`Quest "${q.id}" giver "${q.giver}" is not an NPC.`);
      if (q.requiredItem && !itemIds.has(q.requiredItem)) errors.push(`Quest "${q.id}" item "${q.requiredItem}" is not in items.`);
      if (q.monsterTag && !taxo.has(q.monsterTag)) errors.push(`Quest "${q.id}" tag "${q.monsterTag}" is not in monsterTags (counter never moves).`);
      for (const cl of q.classes || []) {
        if (!slugs.has(cl)) errors.push(`Quest "${q.id}" class "${cl}" does not exist.`);
      }
    }
    {
      const t = data.temple || {};
      if (t.restore && t.restore.item && !itemIds.has(t.restore.item)) errors.push(`Temple restore item "${t.restore.item}" is not in items.`);
      if (t.origin && t.origin.item && !itemIds.has(t.origin.item)) errors.push(`Temple origin item "${t.origin.item}" is not in items.`);
      for (const r of t.recipes || []) {
        for (const inp of r.inputs || []) {
          if (!itemIds.has(inp.item)) errors.push(`Temple recipe "${r.id}" input "${inp.item}" is not in items.`);
        }
        if (r.output && !itemIds.has(r.output.item)) errors.push(`Temple recipe "${r.id}" output "${r.output.item}" is not in items.`);
      }
    }
    for (const cb of data.combos || []) {
      if (cb.ifElement && !elemIds.has(cb.ifElement)) errors.push(`Combo "${cb.id}" element "${cb.ifElement}" is unknown.`);
    }
    for (const p of data.pets || []) {
      if (p.element && !elemIds.has(p.element)) errors.push(`Pet "${p.id}" has unknown element "${p.element}".`);
      if (p.egg && ![...(data.eggs || []).map((e) => e && e.id)].includes(p.egg)) errors.push(`Pet "${p.id}" egg "${p.egg}" does not exist.`);
      if (p.stats) for (const k of Object.keys(p.stats)) {
        if (!["attack", "magicPower", "resistance"].includes(k)) errors.push(`Pet "${p.id}" stat "${k}" is never applied.`);
      }
    }
    for (const e of data.eggs || []) {
      if (e.rarity && !rarities.includes(e.rarity)) errors.push(`Egg "${e.id}" has unknown rarity "${e.rarity}".`);
      for (const d of e.dungeons || []) {
        if (!dungeonRanks.has(d)) errors.push(`Egg "${e.id}" drops in missing dungeon "${d}".`);
      }
      for (const p of e.pets || []) {
        if (!((data.pets || []).some((x) => x && x.id === p))) errors.push(`Egg "${e.id}" hatches missing pet "${p}".`);
      }
    }
    for (const r of data.races || []) {
      if (r.stats) for (const k of Object.keys(r.stats)) {
        if (!RACE_STATS.includes(k)) errors.push(`Race "${r.id}" stat "${k}" is never applied (did you mean maxHp/maxMana?).`);
      }
    }
    for (const r of rarities) {
      if (!((data.loot.rarityMeta || {})[r])) errors.push(`Rarity "${r}" has no color in rarityMeta.`);
    }
    for (const s of data.baseSkills || []) {
      if (!skillIds.has(s)) errors.push(`baseSkills lists missing skill "${s}".`);
    }
  }
  // Dead-copy detector: hidden from class select (has baseClass) yet no
  // evolution leads to it — exactly how the alpha_tamer orphan happened.
  // Classes with `obtain` (e.g. "dialogue:uncle") are reachable out-of-band
  // (quest/NPC), so they are exempt — but a dialogue obtain must name a
  // real NPC or the class can never actually be earned.
  const npcIds = new Set((data.npcs || []).map((n) => n && n.id));
  for (const c of classes) {
    if (c.baseClass && !evoTargets.has(c.slug) && !c.obtain) {
      errors.push(`Class "${c.slug}" is unreachable: it never appears in class select and no evolution leads to it. Delete it, wire an evolution to it, or set obtain (e.g. "dialogue:uncle").`);
    }
    if (c.obtain && String(c.obtain).startsWith("dialogue:")) {
      const npcId = String(c.obtain).slice("dialogue:".length);
      if (!npcIds.has(npcId)) {
        errors.push(`Class "${c.slug}" is obtained via missing NPC "${npcId}".`);
      }
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

// Backups live OUTSIDE the repo so they never bloat indexing/git:
//   default -> ../ForSetrain/backups (Desktop\ForSetrain\backups)
//   override with env SETRA_BACKUP_DIR
//   fallback -> ./.backups if the outside folder cannot be created
function resolveBackupDir() {
  const candidates = [];
  if (process.env.SETRA_BACKUP_DIR) candidates.push(path.resolve(process.env.SETRA_BACKUP_DIR));
  candidates.push(path.join(__dirname, "..", "ForSetrain", "backups"));
  candidates.push(path.join(__dirname, ".backups"));
  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    } catch (e) {
      // try next candidate
    }
  }
  return __dirname;
}

// Returns { ok: true, backup?: <path>, backupName?: <file> } or throws on validation failure.
function writeContent(data, opts = {}) {
  validateReferences(data);
  const content = buildContentFile(data);
  validateContentJs(content);
  const current = fs.readFileSync(CONTENT_FILE, "utf8");
  if (opts.skipIfSame && content === current) {
    return { ok: true, unchanged: true, backup: null, backupName: null };
  }
  let backupPath = null;
  let backupName = null;
  if (opts.backup !== false) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    backupName = `content.backup-${stamp}.js`;
    backupPath = path.join(resolveBackupDir(), backupName);
    fs.copyFileSync(CONTENT_FILE, backupPath);
  }
  fs.writeFileSync(CONTENT_FILE, content, "utf8");
  // Keep the data/*.json mirror in sync after every save so agent sessions
  // never read stale data. Best-effort: a failure must not fail the save.
  try {
    spawnSync(process.execPath, [path.join(__dirname, "extract_content.js")], {
      cwd: __dirname,
      encoding: "utf8",
      timeout: 30000,
    });
  } catch (e) {
    // non-fatal
  }
  return { ok: true, backup: backupPath, backupName };
}

module.exports = { CONTENT_FILE, buildContentFile, validateContentJs, validateReferences, writeContent };
