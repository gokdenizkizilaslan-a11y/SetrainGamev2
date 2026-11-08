"use strict";

/**
 * Travel (ARPG) yetenekleri — Q/E/R kuşanma ve yeni yetenek öğrenme.
 *
 * Varsayılan üç yetenek her sınıfta hazırdır (ücretsiz). Sınıfın `pool` ve
 * `late` yetenekleri TRAVEL PUANI (`player.travelPoints`) harcanarak öğrenilir.
 * Bu puan turn-based yetenek ağacının `skillPoints` havuzundan AYRIDIR; yalnızca
 * seferlerde kazanılır.
 */

const { CONTENT } = require("../content");

const SLOTS = ["q", "e", "r"];

function classSet(player) {
  const slug = player && player.character;
  const all = (CONTENT && CONTENT.arpgSkills) || {};
  return (slug && all[slug]) || null;
}

function ensure(player) {
  if (!player) return null;
  if (!Array.isArray(player.travelSkills)) player.travelSkills = [];
  if (!player.travelLoadout || typeof player.travelLoadout !== "object") player.travelLoadout = {};
  return player.travelLoadout;
}

function allSkills(player) {
  const set = classSet(player);
  if (!set) return [];
  const out = [];
  SLOTS.forEach((slot) => {
    if (set[slot]) out.push(Object.assign({}, set[slot], { defaultSlot: slot }));
  });
  (set.pool || []).forEach((sk) => {
    if (sk) out.push(Object.assign({}, sk));
  });
  (set.late || []).forEach((sk) => {
    if (sk) out.push(Object.assign({}, sk));
  });
  return out;
}

function byId(player, id) {
  return allSkills(player).find((s) => s && s.id === id) || null;
}

function isDefault(player, id) {
  const set = classSet(player);
  return !!(set && SLOTS.some((slot) => set[slot] && set[slot].id === id));
}

function isLearned(player, id) {
  ensure(player);
  return isDefault(player, id) || player.travelSkills.indexOf(id) >= 0;
}

function learn(player, id) {
  ensure(player);
  const sk = byId(player, String(id || ""));
  if (!sk) throw new Error("Unknown skill.");
  if (isLearned(player, sk.id)) throw new Error("You already know this skill.");
  const cost = Math.max(1, Number(sk.cost) || 1);
  if ((player.travelPoints || 0) < cost) throw new Error(`Not enough travel points (${cost} needed).`);
  player.travelPoints -= cost;
  player.travelSkills.push(sk.id);
  return sk;
}

function equip(player, slot, id) {
  ensure(player);
  const key = String(slot || "").toLowerCase();
  if (SLOTS.indexOf(key) < 0) throw new Error("Unknown skill slot.");
  if (id == null || id === "") {
    delete player.travelLoadout[key];
    return null;
  }
  const sk = byId(player, String(id));
  if (!sk) throw new Error("Unknown skill.");
  if (!isLearned(player, sk.id)) throw new Error("Learn this skill first.");
  // Aynı yetenek iki tuşta birden olmasın. Kayıtlı eşleşmenin yanında, o yuvanın
  // VARSAYILAN yeteneği de aynıysa yuvayı açıkça boş bırakırız ("") — aksi halde
  // `loadout`ta olmayan yuva varsayılana düşer ve yetenek iki tuşta birden çalışır.
  const set = classSet(player);
  for (const other of SLOTS) {
    if (other === key) continue;
    const stored = player.travelLoadout[other];
    const fallback = (set && set[other] && set[other].id) || null;
    const effective = stored === "" || stored === null ? null : (stored || fallback);
    if (effective === sk.id) player.travelLoadout[other] = "";
  }
  player.travelLoadout[key] = sk.id;
  return sk;
}

function state(player) {
  ensure(player);
  const set = classSet(player);
  if (!set) return null;
  return {
    points: player.travelPoints || 0,
    learned: player.travelSkills.slice(),
    loadout: Object.assign({}, player.travelLoadout),
    skills: allSkills(player).map((sk) => ({
      id: sk.id,
      name: sk.name,
      slot: sk.defaultSlot || null,
      cost: Number(sk.cost) || 0,
      learned: isLearned(player, sk.id),
    })),
  };
}

// Seferlerde kazanılan travel puanı: her KILLS_PER_POINT canavar öldürmede 1.
const KILLS_PER_POINT = 4;

function addKillPoint(player) {
  if (!player) return 0;
  player.travelKills = (player.travelKills || 0) + 1;
  if (player.travelKills % KILLS_PER_POINT !== 0) return 0;
  player.travelPoints = (player.travelPoints || 0) + 1;
  return 1;
}

module.exports = { SLOTS, classSet, ensure, allSkills, isLearned, learn, equip, state, addKillPoint, KILLS_PER_POINT };
