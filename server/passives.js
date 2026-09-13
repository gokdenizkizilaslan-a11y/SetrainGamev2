// Class passives engine — data-driven, fully optional.
// A class without `passives: []` behaves EXACTLY as before (every helper
// returns neutral when no matching passive exists). Combat calls these
// at the same points where skills/buffs are evaluated.
"use strict";

const { getClass } = require("../content");

function getPassives(who) {
  // who: class slug string OR player/class object (race passives merged in).
  let cls = null;
  let racePassives = [];
  if (typeof who === "string") {
    cls = getClass(who);
  } else if (who && typeof who === "object") {
    cls = who.slug ? who : getClass(who.character);
    if (who.race && Array.isArray(who.race.passives)) racePassives = who.race.passives;
  }
  const list = cls && Array.isArray(cls.passives) ? cls.passives : [];
  return [...list, ...racePassives].filter((p) => p && typeof p.kind === "string");
}

function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

// ---- Outgoing damage multiplier from damageBonus passives ----
// ctx: { targetHpPct, selfHpPct, isFirst, element, targetTags[] }
function damageOutMult(character, ctx) {
  let mult = 1;
  const c = ctx || {};
  for (const p of getPassives(character)) {
    if (p.kind !== "damageBonus") continue;
    const m = num(p.mult, 0);
    if (!(m > 0)) continue;
    if (p.aboveHpPct != null && !(num(c.targetHpPct, 1) > num(p.aboveHpPct, 1))) continue;
    if (p.belowHpPct != null && !(num(c.targetHpPct, 0) < num(p.belowHpPct, 0))) continue;
    if (p.selfHpBelowPct != null && !(num(c.selfHpPct, 1) < num(p.selfHpBelowPct, 1))) continue;
    if (p.firstStrike && !c.isFirst) continue;
    if (p.element && p.element !== c.element) continue;
    if (Array.isArray(p.tags) && p.tags.length) {
      const tt = Array.isArray(c.targetTags) ? c.targetTags : [];
      if (!p.tags.some((t) => tt.includes(t))) continue;
    }
    mult *= 1 + m;
  }
  return mult;
}

// ---- Execute: returns { mode: 'pre'|'finish', pct } or null ----
function executeFor(character) {
  for (const p of getPassives(character)) {
    if (p.kind !== "execute") continue;
    return {
      belowHpPct: p.belowHpPct != null ? num(p.belowHpPct, 0.3) : null,
      finishBelowHpPct: p.finishBelowHpPct != null ? num(p.finishBelowHpPct, 0.1) : null,
    };
  }
  return null;
}

// ---- Incoming damage multiplier (true damage excluded by callers) ----
// ctx.fromElement: attacker element (weaknesses like "takes +30% holy").
function damageTakenMult(character, ctx) {
  let mult = 1;
  const fromEl = ctx && ctx.fromElement;
  for (const p of getPassives(character)) {
    if (p.kind !== "damageTaken") continue;
    if (p.fromElement && p.fromElement !== fromEl) continue;
    mult *= 1 + num(p.mult, 0);
  }
  return Math.max(0, mult);
}

function thornsMult(character) {
  let m = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "thorns") m += num(p.mult, 0);
  }
  return Math.max(0, m);
}

function dodgeChance(character) {
  let c = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "dodge") c += num(p.chance, 0);
  }
  return Math.min(0.5, Math.max(0, c));
}

// ---- Healing ----
function healBonusMult(character) {
  let m = 1;
  for (const p of getPassives(character)) {
    if (p.kind === "healBonus") m *= 1 + num(p.mult, 0);
  }
  return m;
}

function regenBonusMult(character) {
  let m = 1;
  for (const p of getPassives(character)) {
    if (p.kind === "regenBonus") m *= 1 + num(p.mult, 0);
  }
  return m;
}

function lifestealPct(character) {
  let t = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "lifesteal") t += num(p.pct, 0);
  }
  return Math.max(0, t);
}

function healOnKillPct(character) {
  let t = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "healOnKill") t += num(p.pct, 0);
  }
  return Math.max(0, t);
}

// ---- Shields ----
function shieldStartFor(character, maxHp) {
  const out = [];
  for (const p of getPassives(character)) {
    if (p.kind !== "shieldStart") continue;
    let amount = 0;
    if (p.pct != null) amount = Math.round(maxHp * num(p.pct, 0));
    else amount = Math.round(num(p.amount, 0));
    if (amount > 0) out.push({ amount, turns: Math.max(1, Math.round(num(p.turns, 3))) });
  }
  return out;
}

function shieldGainMult(character) {
  let m = 1;
  for (const p of getPassives(character)) {
    if (p.kind === "shieldGain") m *= 1 + num(p.mult, 0);
  }
  return m;
}

// ---- Pierce / crit ----
function pierceFlat(character) {
  let f = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "pierce") f += num(p.flat, 0);
  }
  return Math.max(0, f);
}

function critBonus(character) {
  let chance = 0;
  let damage = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "critChance") chance += num(p.add, 0);
    if (p.kind === "critDamage") damage += num(p.add, 0);
  }
  return { chance, damage };
}

// ---- Echo (chance-based second strike) ----
function echoFor(character) {
  for (const p of getPassives(character)) {
    if (p.kind === "echo") {
      return { chance: Math.min(1, Math.max(0, num(p.chance, 0.2))), mult: Math.max(0, num(p.mult, 0.3)) };
    }
  }
  return null;
}

// ---- Resources / stats ----
function manaRegenBonus(character) {
  let b = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "manaRegen") b += num(p.flat, 0);
  }
  return b;
}

function manaOnKill(character) {
  let b = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "manaOnKill") b += num(p.flat, 0);
  }
  return b;
}

function speedBonus(character) {
  let b = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "speed") b += num(p.flat, 0);
  }
  return b;
}

function statBonusPct(character, stat) {
  let t = 0;
  for (const p of getPassives(character)) {
    if (p.kind === "statBonus" && p.stat === stat) t += num(p.pct, 0);
  }
  return t;
}

function victoryMults(character) {
  let xp = 1;
  let gold = 1;
  for (const p of getPassives(character)) {
    if (p.kind === "victoryXp") xp *= 1 + num(p.mult, 0);
    if (p.kind === "victoryGold") gold *= 1 + num(p.mult, 0);
  }
  return { xp, gold };
}

function hasSecondWind(character) {
  return getPassives(character).some((p) => p.kind === "secondWind");
}

function hasOverkill(character) {
  return getPassives(character).some((p) => p.kind === "overkill");
}

// Lethal damage survived once per combat at 1 HP. Returns true if triggered.
function maybeSecondWind(entity) {
  if (!entity || entity.hp > 0) return false;
  if (entity._secondWindUsed) return false;
  if (!hasSecondWind(entity.character)) return false;
  entity._secondWindUsed = true;
  entity.hp = 1;
  return true;
}

module.exports = {
  getPassives,
  damageOutMult,
  executeFor,
  damageTakenMult,
  thornsMult,
  dodgeChance,
  healBonusMult,
  regenBonusMult,
  lifestealPct,
  healOnKillPct,
  shieldStartFor,
  shieldGainMult,
  pierceFlat,
  critBonus,
  echoFor,
  manaRegenBonus,
  manaOnKill,
  speedBonus,
  statBonusPct,
  victoryMults,
  hasSecondWind,
  hasOverkill,
  maybeSecondWind,
};
