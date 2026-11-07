/*
 * skins.js
 * "Mana rengi" (skill skin) sistemi: yeteneklerin renk/efekt görünümü.
 * Tek bir aktif renk vardır; roll yeni bir renk seçer ve öncekinin yerine
 * geçer (ırk reroll gibi). Sadece görseldir; hasar değerlerine dokunmaz.
 */
"use strict";
const { CONTENT } = require("../content.js");

const SKINS = CONTENT.skillSkins || {};
const RARITY_MULT = {
  common: 100,
  uncommon: 52,
  rare: 22,
  epic: 8,
  legendary: 2.2,
  mythic: 0.6,
};
const ROLL_COST = 50;

function allSkins() {
  return Object.values(SKINS);
}

function getSkin(id) {
  return SKINS[id] || null;
}

function rollSkin(exclude) {
  const pool = allSkins().filter((s) => !exclude || !exclude.includes(s.id));
  if (!pool.length) return null;
  let total = 0;
  for (const s of pool) total += RARITY_MULT[s.rarity] || 1;
  let r = Math.random() * total;
  for (const s of pool) {
    r -= RARITY_MULT[s.rarity] || 1;
    if (r <= 0) return s;
  }
  return pool[pool.length - 1];
}

// Oyuncu tek bir renge sahiptir; oyun başında 1 tane verilir.
function grantStarterSkins(player) {
  if (!player) return [];
  if (player.activeSkin && SKINS[player.activeSkin]) {
    player.skins = [player.activeSkin];
    return player.skins;
  }
  const s = rollSkin(null);
  if (!s) return [];
  player.activeSkin = s.id;
  player.skins = [s.id];
  return player.skins;
}

// Roll: yeni renk gelir, önceki gider (tek slot).
function rollForPlayer(player) {
  if (!player) return { error: "No adventurer." };
  if ((player.gold || 0) < ROLL_COST) return { error: `Rerolling a mana hue costs ${ROLL_COST} gold.` };
  const prev = player.activeSkin || null;
  const skin = rollSkin(prev ? [prev] : null);
  if (!skin) return { error: "Every mana hue is already yours." };
  player.gold -= ROLL_COST;
  player.activeSkin = skin.id;
  player.skins = [skin.id];
  return { skin, cost: ROLL_COST, replaced: prev && prev !== skin.id ? prev : null };
}

function equipSkin(player, id) {
  if (!player) return { error: "No adventurer." };
  if (!SKINS[id]) return { error: "Unknown mana hue." };
  player.activeSkin = id;
  player.skins = [id];
  return { skin: getSkin(id) };
}

module.exports = { SKINS, ROLL_COST, allSkins, getSkin, rollSkin, grantStarterSkins, rollForPlayer, equipSkin };