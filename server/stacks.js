// Stack engine — shared by PvE (combat.js), PvP (pvp.js) and boss fights.
// A stack buff accumulates `stacks` on a target. Two flavors:
//
// 1) Target stacks (burst): each hit adds `count` stacks (default 1); when
//    stacks reach `maxStacks`, the `burst` payoff fires and (unless
//    consume:false) the entry is removed. Turns tick down normally (refreshed
//    on reapply).
//    {kind:"stack", stackId, count:1, maxStacks:5, duration:3, burst, consume}
//
// 2) Self stacks (aura): {kind:"stack", stackId, forKind:"attack", value:0.01,
//    maxStacks:10, persist:true} — each stack grants value to forKind until
//    match end (persist skips turn decay). Read via passives.stackAuraSum().
//
// Burst shapes:
//   {type:"damage", stat:"attack"|"magicPower"|..., power:1.5, base:50}
//   {type:"true", amount:100} or {type:"true", stat:"targetMaxHp"|"targetHp"|..., mult:0.1}
//   {type:"heal", pct:0.2}              -> heals the attacker (pct of their maxHp)
//   {type:"heal", amount:150}           -> heals the attacker (flat)
//   {type:"shield", amount:120}         -> shields the attacker
"use strict";

function findStack(buffs, targetType, targetId, stackId) {
  return (buffs || []).find(
    (b) => b && b.kind === "stack" && b.stackId === stackId
      && b.targetType === targetType && String(b.targetId) === String(targetId)
  ) || null;
}

// Accumulates one application. Returns {entry, fired} — entry is the live
// buff (or a snapshot when consumed). Latest application refreshes turns and
// overwrites burst config (first-writer quirk avoided on purpose).
function addStack(d, spec) {
  const s = spec || {};
  if (!s.stackId) return { entry: null, fired: false };
  if (!d.buffs) d.buffs = [];
  const maxStacks = Math.max(1, Math.round(Number(s.maxStacks) || 5));
  const step = s.count != null ? Math.max(0, Number(s.count) || 0) : 1;
  let entry = findStack(d.buffs, s.targetType, s.targetId, s.stackId);
  if (entry) {
    entry.stacks = Math.min(maxStacks, (Number(entry.stacks) || 0) + step);
    entry.turns = Math.max(Number(entry.turns) || 0, Math.max(1, Math.round(Number(s.duration) || 3)));
    if (s.burst !== undefined) entry.burst = s.burst;
    if (s.consume !== undefined) entry.consume = s.consume;
    if (s.persist !== undefined) entry.persist = s.persist;
    if (s.forKind !== undefined) entry.forKind = s.forKind;
    if (s.value !== undefined) entry.value = s.value;
    if (s.maxStacks !== undefined) entry.maxStacks = maxStacks;
  } else {
    d.buffId = (d.buffId || 0) + 1;
    entry = {
      uid: d.buffId,
      targetType: s.targetType,
      targetId: s.targetId,
      kind: "stack",
      stackId: String(s.stackId),
      value: Number(s.value) || 0,
      stacks: Math.min(maxStacks, step),
      maxStacks,
      turns: Math.max(1, Math.round(Number(s.duration) || 3)),
      burst: s.burst !== undefined ? s.burst : null,
      consume: s.consume !== false,
      persist: !!s.persist,
      forKind: s.forKind || null,
      skillId: s.skillId || null,
      sourceId: s.sourceId || null,
      name: s.name || null,
    };
    d.buffs.push(entry);
  }
  const fired = !!(entry.burst && entry.stacks >= entry.maxStacks);
  if (fired && entry.consume !== false) {
    d.buffs = d.buffs.filter((b) => b !== entry);
  }
  return { entry, fired };
}

// Pure number resolution for a burst. Caller applies it (damage/heal/shield)
// so win-checks, fx and logs stay in the caller's combat flavor.
function burstAmount(burst, attacker, target) {
  const b = burst || {};
  const num = (v, dflt) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : dflt;
  };
  if (b.type === "true") {
    if (b.amount != null) return { type: "true", amount: Math.max(1, Math.round(num(b.amount, 0))) };
    const st = b.stat || "targetMaxHp";
    const mult = num(b.mult, 0);
    const base = st === "targetMaxHp" ? (target && target.maxHp) || 0
      : st === "targetHp" ? (target && target.hp) || 0
      : (attacker && attacker[st]) || 0;
    return { type: "true", amount: Math.max(1, Math.round(base * mult)) };
  }
  if (b.type === "heal") {
    if (b.amount != null) return { type: "heal", amount: Math.max(1, Math.round(num(b.amount, 0))) };
    const pct = num(b.pct, 0.1);
    return { type: "heal", amount: Math.max(1, Math.round(((attacker && attacker.maxHp) || 0) * pct)) };
  }
  if (b.type === "shield") {
    return { type: "shield", amount: Math.max(1, Math.round(num(b.amount, 0))) };
  }
  // default: normal damage through the attacker's stat
  const stat = b.stat || "attack";
  const power = num(b.power, 1);
  const base = num(b.base, 0);
  return {
    type: "damage",
    amount: Math.max(1, Math.round(base + ((attacker && attacker[stat]) || 0) * power)),
    stat,
  };
}

module.exports = { findStack, addStack, burstAmount };
