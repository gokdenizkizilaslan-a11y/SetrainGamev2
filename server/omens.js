"use strict";
// Daily omens: small rotating day modifiers (data: CONTENT.dailyOmens).
// Deterministic by room day — no state, no migration, same for everyone.
// Missing/empty list = calm (all multipliers neutral), so old content
// behaves exactly as before.
const { CONTENT } = require("../content");

function omenList() {
  return Array.isArray(CONTENT.dailyOmens) ? CONTENT.dailyOmens : [];
}

function omenForDay(day) {
  const list = omenList();
  if (!list.length) return null;
  const n = Math.max(1, Math.floor(Number(day) || 1));
  return list[(n - 1) % list.length];
}

function omenOf(room) {
  return omenForDay(room && room.day);
}

function goldMultOf(room) {
  const o = omenOf(room);
  return o && o.goldMult > 0 ? Number(o.goldMult) : 1;
}

function xpMultOf(room) {
  const o = omenOf(room);
  return o && o.xpMult > 0 ? Number(o.xpMult) : 1;
}

function critBonusOf(room) {
  const o = omenOf(room);
  return o && Number(o.playerCritBonus) > 0 ? Number(o.playerCritBonus) : 0;
}

function monsterHpMultOf(room) {
  const o = omenOf(room);
  return o && o.monsterHpMult > 0 ? Number(o.monsterHpMult) : 1;
}

// Short suffix for dawn log lines, e.g. " (🌾 Bountiful Dawn)".
function dawnSuffix(day) {
  const o = omenForDay(day);
  if (!o || !o.name) return "";
  return ` (${o.icon || "✦"} ${o.name})`;
}

module.exports = {
  omenList,
  omenForDay,
  omenOf,
  goldMultOf,
  xpMultOf,
  critBonusOf,
  monsterHpMultOf,
  dawnSuffix,
};
