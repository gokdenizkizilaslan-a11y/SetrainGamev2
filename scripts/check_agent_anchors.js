// Agent görev haritasındaki anchor'ların hâlâ var olduğunu doğrular.
// Kullanım: node scripts/check_agent_anchors.js
// Anchor'lar çürürse (sembol yeniden adlandırılırsa) harita sessizce yanlış
// yönlendirir ve ajan tekrar dosya avına başlar. Bu kontrol onu engeller.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const agentFile = path.join(root, ".opencode", "agents", "setra.md");
const text = fs.readFileSync(agentFile, "utf8");
const lines = text.split(/\r?\n/);

const isPath = (t) => /[\\/]/.test(t) || /\.(js|json|html|css|md)$/.test(t);
const clean = (t) => t.replace(/\\/g, "/");

let checks = 0;
const missing = [];

for (const line of lines) {
  if (!line.startsWith("|")) continue;
  const cells = line.split("|").map((c) => c.trim());
  if (cells.length < 5) continue; // | görev | dosya | anchor |
  const [, task, fileCell, anchorCell] = cells;
  if (!task || /^:?-{2,}/.test(task)) continue;

  const files = [...fileCell.matchAll(/`([^`]+)`/g)].map((m) => clean(m[1]));
  const anchors = [...anchorCell.matchAll(/`([^`]+)`/g)]
    .map((m) => m[1])
    .filter((a) => !isPath(a) && a !== "—" && !a.includes("<"));

  const existing = files.filter((f) => fs.existsSync(path.join(root, f)));
  if (!existing.length || !anchors.length) continue;

  const bodies = existing.map((f) => fs.readFileSync(path.join(root, f), "utf8"));
  for (const anchor of anchors) {
    checks++;
    if (!bodies.some((b) => b.includes(anchor))) missing.push({ task, files, anchor });
  }
}

if (missing.length) {
  console.log(`EKSIK ANCHOR (${missing.length}/${checks}):`);
  for (const m of missing) console.log(`  ${m.files.join(", ")} :: ${m.anchor}   (${m.task})`);
  process.exit(1);
}
console.log(`Tum anchorlar mevcut (${checks} kontrol).`);