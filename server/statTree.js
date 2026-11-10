/**
 * server/statTree.js
 * Karakter stat ağacı — Path of Exile tarzı radyal pasif ağaç.
 *
 * Tasarım:
 *   - 4 ana dal (content.js -> statPaths.paths), her dal 90°'lik sektör.
 *   - Her dalda 10 halka x 4 düğüm = 40 düğüm, toplam 160 düğüm.
 *   - Her düğüm TEK bir stat verir (attack, maxHp, magicPower, ...).
 *   - Düğümler komşuluk zinciriyle açılır: merkeze ya da alınmış bir düğüme
 *     komşu olmayan düğüm alınamaz.
 *   - Dallar 3., 6. ve 9. halkalarda birbirine köprülenir; böylece Fury'den
 *     başlayıp Vitality'nin can düğümlerine geçilebilir.
 *
 * Bu modül hem sunucu doğrulaması hem de istemci çizimi için TEK kaynaktır
 * (publicCatalog -> statTree).
 */

const { CONTENT } = require("../content.js");

const BOX = 1360;
const CX = 680;
const CY = 680;
const BASE_RADIUS = 140;
const RING_STEP = 56;
const KIND_ANGLES = [-33.75, -11.25, 11.25, 33.75];
const BRIDGE_RINGS = [3, 6, 9];

let CACHE = null;

function cfg() {
  const sp = CONTENT.statPaths || {};
  return {
    rings: Math.max(1, Math.floor(Number(sp.rings) || 10)),
    maxPoints: Math.max(1, Math.floor(Number(sp.maxPoints) || 40)),
    pointsPerLevel: Math.max(1, Math.floor(Number(sp.pointsPerLevel) || 1)),
    startingPoints: Math.max(0, Math.floor(Number(sp.startingPoints) || 0)),
    paths: Array.isArray(sp.paths) ? sp.paths : [],
    values: sp.nodeValues || {},
  };
}

function build() {
  const c = cfg();
  const nodes = [];
  const links = [];
  const byId = new Map();
  const adj = new Map();

  const link = (a, b) => {
    if (!a || !b || a === b) return;
    const key = a < b ? a + "|" + b : b + "|" + a;
    if (link._seen && link._seen.has(key)) return;
    if (!link._seen) link._seen = new Set();
    link._seen.add(key);
    links.push([a, b]);
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  };

  c.paths.forEach((p, bi) => {
    const base = -90 + bi * 90;
    for (let r = 1; r <= c.rings; r++) {
      for (let k = 0; k < 4; k++) {
        const stat = (p.stats || [])[k];
        if (!stat) continue;
        const id = `${p.id}_r${r}_k${k}`;
        const jitter = ((k * 9 + r * 13 + bi * 17) % 9) - 4;
        const radius = BASE_RADIUS + (r - 1) * RING_STEP + jitter;
        const rad = ((base + KIND_ANGLES[k]) * Math.PI) / 180;
        const node = {
          id,
          path: p.id,
          ring: r,
          kind: k,
          stat,
          value: Number(c.values[stat]) || 0,
          x: Math.round((CX + Math.cos(rad) * radius) * 100) / 100,
          y: Math.round((CY + Math.sin(rad) * radius) * 100) / 100,
        };
        nodes.push(node);
        byId.set(id, node);
        // Halka içi komşuluk (k0-k1-k2-k3)
        if (k > 0) link(`${p.id}_r${r}_k${k - 1}`, id);
      }
    }
    // Merkez bağlantısı: her dal içteki iki düğümle çekirdeğe bağlanır.
    link("hub", `${p.id}_r1_k1`);
    link("hub", `${p.id}_r1_k2`);
  });

  // Halkalar arası bağlar (düz + çapraz) — ağaç dokusu.
  c.paths.forEach((p) => {
    for (let r = 1; r < c.rings; r++) {
      for (let k = 0; k < 4; k++) {
        link(`${p.id}_r${r}_k${k}`, `${p.id}_r${r + 1}_k${k}`);
        if (k < 3) link(`${p.id}_r${r}_k${k}`, `${p.id}_r${r + 1}_k${k + 1}`);
      }
    }
  });

  // Dal köprüleri: komşu dallar arasında geçiş yolları.
  if (c.paths.length > 1) {
    c.paths.forEach((p, bi) => {
      const q = c.paths[(bi + 1) % c.paths.length];
      for (const r of BRIDGE_RINGS) {
        if (r > c.rings) continue;
        link(`${p.id}_r${r}_k3`, `${q.id}_r${r}_k0`);
      }
    });
  }

  // Merkeze doğrudan bağlı düğümler (puan harcamadan erişilebilir).
  const hubLinked = new Set();
  for (const [a, b] of links) {
    if (a === "hub") hubLinked.add(b);
    else if (b === "hub") hubLinked.add(a);
  }

  return {
    box: BOX,
    rings: c.rings,
    maxPoints: c.maxPoints,
    paths: c.paths.map((p) => ({ id: p.id, name: p.name || p.id, color: p.color || "#e8b45c", glyph: p.glyph || "◆", tagline: p.tagline || "" })),
    nodes,
    links,
    byId,
    adj,
    hubLinked,
  };
}

function tree() {
  if (!CACHE) CACHE = build();
  return CACHE;
}

// İstemciye gidecek hafif kopya.
function publicTree() {
  const t = tree();
  return {
    box: t.box,
    rings: t.rings,
    maxPoints: t.maxPoints,
    paths: t.paths,
    nodes: t.nodes,
    links: t.links,
  };
}

function nodeById(id) {
  return tree().byId.get(String(id || "")) || null;
}

// Düğüm alınabilir mi? Merkeze bağlıysa ya da alınmış bir komşusu varsa.
function isReachable(player, nodeId) {
  const t = tree();
  const id = String(nodeId || "");
  if (!t.byId.has(id)) return false;
  const owned = new Set((player && player.statNodes) || []);
  if (owned.has(id)) return false;
  if (t.hubLinked.has(id)) return true;
  for (const nb of t.adj.get(id) || []) {
    if (owned.has(nb)) return true;
  }
  return false;
}

function maxPoints() {
  return tree().maxPoints;
}

function pointsTotal(player) {
  const c = cfg();
  const lvl = Math.max(1, Math.floor(Number(player && player.level) || 1));
  return Math.min(c.maxPoints, c.startingPoints + (lvl - 1) * c.pointsPerLevel);
}

function pointsSpent(player) {
  const list = (player && Array.isArray(player.statNodes)) ? player.statNodes : [];
  let n = 0;
  for (const id of list) if (tree().byId.has(id)) n += 1;
  return n;
}

function pointsAvailable(player) {
  return Math.max(0, pointsTotal(player) - pointsSpent(player));
}

function nodeGrant(node) {
  return node ? { [node.stat]: node.value } : {};
}

module.exports = {
  tree,
  publicTree,
  nodeById,
  isReachable,
  maxPoints,
  pointsTotal,
  pointsSpent,
  pointsAvailable,
  nodeGrant,
};
