/**
 * export_skill_prompts.js
 * ARPG (travel) yetenekleri icin 3x3 ikon-grid prompt dosyasi uretir.
 * Cikti: C:/Users/bahad/Desktop/ForSetrain/SKILL_PROMPTS.md
 * (FORSETRA_DIR env degiskeniyle klasor degistirilebilir.)
 *
 * Not: Sira tabanli savas skilleri bu dosyaya GIRMEZ; onlar
 * ForSetrain/promptlar/03-yetenekler/yetenekler-3x3.txt icinde durur.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { CONTENT } = require("../content");

const OUT_DIR = process.env.FORSETRA_DIR || "C:/Users/bahad/Desktop/ForSetrain";
const OUT_FILE = path.join(OUT_DIR, "SKILL_PROMPTS.md");

const ELEM_TR = {
  physical: "fiziksel", fire: "ateş", frost: "buz", lightning: "yıldırım",
  shadow: "gölge", holy: "kutsal", nature: "doğa", arcane: "arcan",
  blood: "kan", earth: "toprak",
};
const ELEM_ORDER = ["physical", "fire", "frost", "lightning", "shadow", "holy", "nature", "arcane", "blood", "earth"];

// Legacy (eski kit) yeteneklerin aciklamasi "caret over" metnidir; gorsel tarif uret.
const KIND_HINT = {
  arc: "a wide cutting arc sweeping across the front",
  nova: "a shock ring bursting outward around the caster",
  ground: "a marked patch of ground erupting upward",
  meteor: "a heavy strike crashing down onto the marked spot",
  vortex: "a swirling vortex dragging foes toward its core",
  orbit: "blades of energy orbiting the caster",
  beam: "a bright beam burning a straight line forward",
  chain: "energy leaping from foe to foe",
  heal: "warm restorative light pouring over the ground",
  shield: "a glowing ward shield raised in front",
  teleport: "a torn rift in space mid-step",
  aoe: "an explosion engulfing a whole area",
  barrage: "a volley raining down into one spot",
  swing: "a heavy weapon sweeping all the way through",
  projectile: "a fast glob of venom flying at a target",
  quake: "the ground cracking in spreading rings",
  buff: "an aura of rising power glowing around the caster",
};

const BASE_STYLE =
  "Base style: Set of square ability icons arranged in a tidy GRID with thin dark gaps " +
  "between cells over a dark slate backdrop, each icon a painterly close-up battle emblem: " +
  "the subject fills 80% of its cell, bold dynamic three-quarter angle, hot rim light carving " +
  "the silhouette out of deep shadow, hyper-saturated element color, edge-to-edge painted art " +
  "shaped by the game's rounded icon frame, a single instantly readable subject per icon, " +
  "purely visual wordless emblems.";

// --- 1) Siniflar -> benzersiz skill listesi -------------------------------
const arpg = CONTENT.arpgSkills || {};
const classNames = {};
for (const c of CONTENT.classes || []) if (c && c.slug) classNames[c.slug] = c.name || c.slug;

const unique = new Map(); // id -> { sk, classes:[], slots:{} }
let slotCount = 0;

function addSkill(sk, slug, slot) {
  if (!sk || !sk.id) return;
  slotCount += 1;
  let e = unique.get(sk.id);
  if (!e) {
    e = { sk, classes: [], slots: {} };
    unique.set(sk.id, e);
  }
  if (!e.classes.includes(slug)) e.classes.push(slug);
  if (!e.slots[slot]) e.slots[slot] = [];
  if (!e.slots[slot].includes(slug)) e.slots[slot].push(slug);
}

for (const slug of Object.keys(arpg)) {
  const set = arpg[slug] || {};
  ["q", "e", "r"].forEach((k) => addSkill(set[k], slug, k.toUpperCase()));
  (set.pool || []).forEach((sk) => addSkill(sk, slug, "Pool"));
  (set.late || []).forEach((sk) => addSkill(sk, slug, "Late"));
}

// --- 2) Elemente gore sirala, 9'arlik bloklara bol -----------------------
const ordered = [];
for (const el of ELEM_ORDER) {
  const list = [...unique.values()]
    .filter((e) => (e.sk.element || "physical") === el)
    .sort((a, b) => (Number(a.sk.cd) || 0) - (Number(b.sk.cd) || 0) || String(a.sk.id).localeCompare(b.sk.id));
  ordered.push(...list);
}
// Kalan (bilinmeyen element) varsa sona ekle.
for (const e of unique.values()) if (!ordered.includes(e)) ordered.push(e);

const GRID = 9;
const blocks = [];
for (let i = 0; i < ordered.length; i += GRID) blocks.push(ordered.slice(i, i + GRID));

function blockTitle(entries, idx) {
  const counts = new Map();
  for (const e of entries) {
    const el = e.sk.element || "physical";
    counts.set(el, (counts.get(el) || 0) + 1);
  }
  const els = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const names = els.map(([el, n]) => {
    const nm = ELEM_TR[el] || el;
    return nm.charAt(0).toUpperCase() + nm.slice(1) + " ×" + n;
  });
  return `BLOK ${String(idx + 1).padStart(2, "0")} | ${names.join(" + ")}`;
}

function cellText(e) {
  const sk = e.sk;
  let desc = String(sk.desc || "").trim();
  if (!desc || /carried over/i.test(desc)) {
    const hint = KIND_HINT[sk.kind] || `a burst of ${sk.element || "physical"} energy`;
    desc = `${sk.name}: ${hint}`;
  }
  desc = desc.replace(/\.+$/, "").replace(/^./, (c) => c.toUpperCase());
  return desc;
}

const out = [];
const p = (line) => out.push(line == null ? "" : line);

p("# Setra — ARPG (Travel) Skill İkon Promptları");
p("");
p(`Generated: ${new Date().toISOString()}`);
p("");
p("> Bu dosya **sadece travel/ARPG** skill ikonları içindir. Sıra tabanlı savaş");
p("> skilleri `promptlar/03-yetenekler/yetenekler-3x3.txt` içinde durur.");
p("");
p("## Özet");
p("");
p(`- **${Object.keys(arpg).length} sınıf**, toplam **${slotCount} yuva** (Q/E/R + pool + late)`);
p(`- **${unique.size} BENZERSİZ skill id** → **${blocks.length} grid** (3x3)`);
p("- Her grid için: tablodaki sıraya bak → `PROMPT` bloğunu KREA'ya yapıştır →");
p("  çıkan görseli `IDS` satırındaki sırayla kes → `public/images/skills/<id>.png` olarak kaydet.");
p("- İkon bir kez üretilir; aynı id'yi kullanan bütün sınıflar o dosyayı paylaşır.");
p("");
p("### \"300 skill\" meselesi");
p("");
p(`Şu an toplam ${slotCount} yuva var, ama bunların sadece **${unique.size}** tanesi farklı`);
p("skill. Aynı yetenek birçok sınıfta tekrar ediyor — örneğin `shadowgrasp` 9 sınıfta,");
p(`\`bladestorm\` 8 sınıfta geçiyor. Yani ikon olarak üretilecek gerçek sayı **${unique.size}**.`);
p("");
p("> `titanfist` artık yalnızca **Colossus** sınıfına aittir; travel puanıyla alınamaz.");
p("> Öğrenilebilir havuzlardaki genel yetenekler: `battlefocus`, `ironskin`, `windstep`,");
p("> `arcanepulse`, `spiritward`, `flamejet`, `frostbite`, `stormlash`, `thornwave`,");
p("> `shadowveil`, `tremor`.");
p("");
p("Hedef klasör: `public/images/skills/` · Kare boyut: 256x256 PNG · Kesim: sol-üst cell1, satır satır.");
p("");

// --- Sinif -> skill tablosu ---------------------------------------------
p("## Sınıf → skill listesi");
p("");
p("| Sınıf | Q | E | R | Havuz / Geç |");
p("|---|---|---|---|---|");
for (const slug of Object.keys(arpg)) {
  const set = arpg[slug] || {};
  const nm = (sk) => (sk && sk.id ? "`" + sk.id + "`" : "—");
  const rest = [...(set.pool || []), ...(set.late || [])].filter((s) => s && s.id).map((s) => "`" + s.id + "`");
  p(`| ${classNames[slug] || slug} (\`${slug}\`) | ${nm(set.q)} | ${nm(set.e)} | ${nm(set.r)} | ${rest.join(", ") || "—"} |`);
}
p("");

// --- Grid bloklari ------------------------------------------------------
blocks.forEach((entries, idx) => {
  p("```text");
  p("==================================================================");
  p(blockTitle(entries, idx));
  p("Grid: 3x3 | Üretilecek ikon: " + entries.length + (entries.length < GRID ? " | kalan hücre: koyu slate (boş)" : ""));
  p("==================================================================");
  p("```");
  p("");
  p("| # | id | isim | element | tür | cd | güç |");
  p("|---|---|---|---|---|---|---|");
  entries.forEach((e, i) => {
    const sk = e.sk;
    p(`| ${i + 1} | \`${sk.id}\` | ${sk.name} | ${sk.element || "physical"} | ${sk.kind || "-"} | ${sk.cd != null ? sk.cd + "s" : "-"} | ×${sk.power || 0} |`);
  });
  p("");
  p("PROMPT (kopyala-yapıştır):");
  p("");
  p("```text");
  p("Fit: each icon fits fully inside its own box with a small margin - nothing cropped, nothing spilling out.");
  p("3x3 grid, 9 square skill icons.");
  entries.forEach((e, i) => p(`Cell ${i + 1} (${e.sk.id}): ${cellText(e)}, element ${e.sk.element || "physical"}${e.sk.color ? ", palette anchored on " + e.sk.color : ""}.`));
  p(BASE_STYLE);
  p("```");
  p("");
  p("IDS (kopyala-yapıştır):");
  p("");
  p("```text");
  for (let i = 0; i < GRID; i += 3) {
    const row = [];
    for (let j = i; j < i + 3 && j < GRID; j += 1) row.push(`cell${j + 1}: ${entries[j] ? entries[j].sk.id : "EMPTY"},`);
    p(row.join(" "));
  }
  p("```");
  p("");
});

// --- Appendix: id sozlugu ----------------------------------------------
p(`## Ek: id sözlüğü (${unique.size} kayıt)`);
p("");
p("| id | isim | element | tür | cd | kullanan sınıf sayısı |");
p("|---|---|---|---|---|---|");
for (const e of [...unique.values()].sort((a, b) => String(a.sk.id).localeCompare(String(b.sk.id)))) {
  const sk = e.sk;
  p(`| \`${sk.id}\` | ${sk.name} | ${sk.element || "physical"} | ${sk.kind || "-"} | ${sk.cd != null ? sk.cd + "s" : "-"} | ${e.classes.length} |`);
}
p("");

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, out.join("\n"), "utf8");
console.log(`[prompts] ${OUT_FILE} yazildi — ${Object.keys(arpg).length} sinif, ${slotCount} yuva, ${unique.size} benzersiz skill, ${blocks.length} grid.`);