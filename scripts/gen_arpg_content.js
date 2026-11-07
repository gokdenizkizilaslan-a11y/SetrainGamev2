/*
 * gen_arpg_content.js
 * Generates the ARPG-only content used by the Travel renderer:
 *   - data/arpgSkills.json   : per-class Q/E/R skill definitions + attack speed
 *   - data/travelBiomes.json : per-biome monster rosters, spawn rates, palettes
 * Also patches data/classes.json / data/races.json / data/items.json with the
 * travel-only `attackSpeed` percentage (turn-based combat ignores it).
 *
 * Run: node scripts/gen_arpg_content.js
 * Then: node build_content.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "data");

function read(name) { return JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8")); }
function write(name, obj) { fs.writeFileSync(path.join(DATA, name), JSON.stringify(obj, null, 2) + "\n", "utf8"); }

// ---------------------------------------------------------------- attack speed
// Percent bonus. Only the ARPG travel renderer reads it; the turn-based combat
// engine (server/combat.js) never touches player ATK speed.
const CLASS_ATKSPD = {
  warrior: 6, ranger: 18, mage: -4, rogue: 22, paladin: 0, assassin: 20,
  support: -6, tank: -12, tamer: 8, gardener: 2, moderator: 4, tester: 10,
  beastmaster: 9, anima_lorde: 12, rootbinder: 14, lifeweaver: -2,
  ultra_moderator: 6, warlord: 2, warden: 10, archmage: 0, nightblade: 24,
  crusader: -2, reaper: 18, high_priest: -6, juggernaut: -14, war_emperor: 0,
  storm_warden: 16, archon: 4, shade_king: 20, lightbringer: 0,
  death_lord: 16, bloodspawn: 22, bloodlord: 14, gloomspawn: 8,
  sanguine_lord: 12, divine_saint: -4, colossus: -16,
};
const RACE_ATKSPD = {
  human: 3, elf: 6, dwarf: -3, orc: 2, beastkin: 7, wyvernkin: 4,
  high_elf: 5, gorgon: 1, demonblood: 3, lightborn: 0, voidborn: 2,
  daemonkin: 2, dragonborn: 1, arch_vampyr: 5, archangel: 0,
};

const classes = read("classes.json");
for (const c of classes) {
  if (c.slug && CLASS_ATKSPD[c.slug] !== undefined) c.attackSpeed = CLASS_ATKSPD[c.slug];
  else if (c.attackSpeed === undefined) c.attackSpeed = 0;
}
write("classes.json", classes);

const races = read("races.json");
for (const r of races) {
  if (!r.stats || typeof r.stats !== "object") r.stats = {};
  if (RACE_ATKSPD[r.id] !== undefined) r.stats.attackSpeed = RACE_ATKSPD[r.id];
}
write("races.json", races);

// Weapons (and a few trinkets) grant a small attack-speed % that only the
// ARPG travel layer consumes. Existing stats are preserved.
const RARITY_ATKSPD = { common: 2, uncommon: 3, rare: 5, epic: 7, legendary: 10, mythic: 13, ancient_relic: 16 };
const items = read("items.json");
let touched = 0;
for (const it of items) {
  if (!it || !it.slot) continue;
  const isWeapon = it.slot === "weapon";
  const isTrinket = it.slot === "ring" || it.slot === "ring1" || it.slot === "ring2" || it.slot === "amulet" || it.slot === "boots";
  if (!isWeapon && !isTrinket) continue;
  if (!it.stats || typeof it.stats !== "object") it.stats = {};
  if (it.stats.attackSpeed) continue;
  const base = RARITY_ATKSPD[it.rarity] || 2;
  it.stats.attackSpeed = isWeapon ? base : Math.max(1, Math.round(base * 0.6));
  touched++;
}
write("items.json", items);

// ---------------------------------------------------------------- skill helper
const ELEM_COLOR = {
  physical: "#9fd8ff", arcane: "#c77dff", shadow: "#b388ff", holy: "#ffe082",
  frost: "#8fe4ff", fire: "#ff8a65", water: "#4fc3f7", earth: "#c9a227",
  nature: "#9ccc65", lightning: "#fff176", blood: "#ff5370", dark: "#7e57c2",
};
function sk(name, element, kind, cd, power, o) {
  return Object.assign({
    name, element, kind, cd, power,
    color: ELEM_COLOR[element] || "#9fd8ff",
    desc: "",
  }, o || {});
}
const arc = (name, el, cd, power, radius, o) => sk(name, el, "arc", cd, power, Object.assign({ radius, arc: 1.05, knockback: 240 }, o));
const aoe = (name, el, cd, power, radius, o) => sk(name, el, "aoe", cd, power, Object.assign({ radius, offset: 40, knockback: 260 }, o));
const nova = (name, el, cd, power, radius, o) => sk(name, el, "nova", cd, power, Object.assign({ radius, knockback: 300 }, o));
const proj = (name, el, cd, power, o) => sk(name, el, "projectile", cd, power, Object.assign({ speed: 620, radius: 9 }, o));
const fan = (name, el, cd, power, count, o) => sk(name, el, "fan", cd, power, Object.assign({ count, spread: 0.18, speed: 620, radius: 7 }, o));
const beam = (name, el, cd, power, range, o) => sk(name, el, "beam", cd, power, Object.assign({ range, width: 26, knockback: 200 }, o));
const dash = (name, el, cd, power, range, o) => sk(name, el, "dash", cd, power, Object.assign({ range, radius: 70, knockback: 280 }, o));
const blink = (name, el, cd, power, range, o) => sk(name, el, "teleport", cd, power, Object.assign({ range, radius: 80 }, o));
const ground = (name, el, cd, power, radius, o) => sk(name, el, "ground", cd, power, Object.assign({ radius, duration: 3, tick: 0.5 }, o));
const meteor = (name, el, cd, power, radius, o) => sk(name, el, "meteor", cd, power, Object.assign({ radius, delay: 0.35 }, o));
const shield = (name, el, cd, shieldPct, o) => sk(name, el, "shield", cd, 0, Object.assign({ shieldPct, duration: 5 }, o));
const heal = (name, el, cd, healPct, o) => sk(name, el, "heal", cd, 0, Object.assign({ healPct, radius: 130 }, o));
// --- Yeni "ultimate" türleri: her sınıfın R'si görsel olarak farklı olsun ---
const orbit = (name, el, cd, power, radius, o) => sk(name, el, "orbit", cd, power, Object.assign({ radius, duration: 3.2, tick: 0.35, count: 6, speed: 3.6 }, o));
const chain = (name, el, cd, power, radius, o) => sk(name, el, "chain", cd, power, Object.assign({ radius, jumps: 4, chainRange: 185 }, o));
const vortex = (name, el, cd, power, radius, o) => sk(name, el, "vortex", cd, power, Object.assign({ radius, duration: 2.4, tick: 0.4, pull: 95 }, o));
const barrage = (name, el, cd, power, count, o) => sk(name, el, "barrage", cd, power, Object.assign({ count, interval: 0.07, speed: 760, radius: 7, spread: 0.17 }, o));
const quake = (name, el, cd, power, radius, o) => sk(name, el, "quake", cd, power, Object.assign({ radius, pulses: 3, interval: 0.22 }, o));

const ST = {
  freeze: (d) => ({ type: "freeze", duration: d }),
  stun: (d) => ({ type: "stun", duration: d }),
  slow: (d, slow) => ({ type: "slow", duration: d, slow }),
  poison: (d, dps) => ({ type: "poison", duration: d, dps }),
  burn: (d, dps) => ({ type: "burn", duration: d, dps }),
  bleed: (d, dps) => ({ type: "bleed", duration: d, dps }),
  root: (d) => ({ type: "root", duration: d }),
  shock: (d, dps) => ({ type: "shock", duration: d, dps }),
};

// ---------------------------------------------------------------- class skills
const SKILLS = {
  warrior: {
    atkSpd: 6, auto: { element: "physical" },
    q: arc("Cleaving Arc", "physical", 4.5, 1.7, 100, { arc: 1.1 }),
    e: aoe("Seismic Slam", "earth", 8, 2.0, 105, { offset: 55, status: ST.stun(0.8) }),
    r: nova("Blade Tempest", "physical", 16, 2.7, 155, { status: ST.bleed(3, 12) }),
  },
  ranger: {
    atkSpd: 18, auto: { element: "physical" },
    q: fan("Triple Shot", "physical", 4, 0.9, 3, { spread: 0.2 }),
    e: ground("Thorn Snare", "nature", 9, 0.9, 72, { status: ST.root(1.8), dot: 8 }),
    r: meteor("Rain of Arrows", "physical", 15, 2.2, 135, { delay: 0.3 }),
  },
  mage: {
    atkSpd: -4, auto: { element: "arcane", magic: true },
    q: chain("Arcane Rift", "arcane", 4.5, 1.0, 330, { jumps: 4, chainRange: 205, status: ST.shock(2, 7) }),
    e: vortex("Frost Vortex", "frost", 9, 1.15, 132, { duration: 2.8, tick: 0.35, pull: 135, status: ST.freeze(1.3) }),
    r: meteor("Meteor Storm", "fire", 17, 3.0, 148, { delay: 0.35, count: 3, stagger: 0.16, spreadRadius: 120, status: ST.burn(3, 18) }),
  },
  rogue: {
    atkSpd: 22, auto: { element: "physical" },
    q: fan("Fan of Knives", "physical", 3.5, 0.7, 5, { spread: 0.22, speed: 700 }),
    e: dash("Shadow Step", "shadow", 7, 1.8, 160, { status: ST.bleed(2.5, 10) }),
    r: nova("Death Blossom", "shadow", 15, 2.6, 145, { status: ST.bleed(3, 14) }),
  },
  paladin: {
    atkSpd: 0, auto: { element: "holy" },
    q: arc("Dawn Strike", "holy", 4.5, 1.7, 100, { arc: 1.0 }),
    e: shield("Aegis of Dawn", "holy", 10, 28, { duration: 5 }),
    r: meteor("Judgment", "holy", 16, 2.9, 135, { delay: 0.4, status: ST.stun(0.9) }),
  },
  assassin: {
    atkSpd: 20, auto: { element: "physical" },
    q: arc("Throat Cut", "physical", 3.5, 1.9, 85, { arc: 0.8 }),
    e: beam("Blood Mark", "blood", 7, 2.1, 210, { status: ST.bleed(3, 12) }),
    r: nova("Crimson Reaping", "blood", 15, 2.9, 145, { status: ST.bleed(4, 18) }),
  },
  support: {
    atkSpd: -6, auto: { element: "holy", magic: true },
    q: proj("Holy Bolt", "holy", 3, 1.2, { speed: 600 }),
    e: shield("Sanctuary", "holy", 10, 24, { duration: 5, healPct: 8 }),
    r: heal("Radiant Chorus", "holy", 16, 35, { radius: 155, power: 1.8 }),
  },
  tank: {
    atkSpd: -12, auto: { element: "physical" },
    q: arc("Shield Bash", "physical", 4, 1.4, 85, { arc: 0.9, status: ST.stun(0.5) }),
    e: shield("Iron Bulwark", "earth", 11, 35, { duration: 5 }),
    r: nova("Shockwave", "earth", 16, 2.5, 165, { status: ST.stun(1.1) }),
  },
  tamer: {
    atkSpd: 8, auto: { element: "nature" },
    q: proj("Beast Fang", "nature", 3.5, 1.3, { speed: 640, pet: true }),
    e: nova("Spirit Howl", "nature", 8, 1.5, 125, { status: ST.slow(2.2, 0.55), pet: true }),
    r: aoe("Stampede", "nature", 16, 2.7, 140, { offset: 30, knockback: 400, pet: true }),
  },
  gardener: {
    atkSpd: 2, auto: { element: "nature" },
    q: fan("Thorn Volley", "nature", 4, 0.8, 4, { spread: 0.2 }),
    e: ground("Entangling Roots", "nature", 9, 0.9, 78, { status: ST.root(2.2), dot: 10 }),
    r: aoe("Bloom", "nature", 15, 2.0, 140, { healPct: 22, status: ST.slow(2, 0.5) }),
  },
  moderator: {
    atkSpd: 4, auto: { element: "arcane", magic: true },
    q: beam("Debug Beam", "arcane", 4, 1.6, 230),
    e: ground("Null Field", "arcane", 9, 0.8, 85, { status: ST.slow(2.5, 0.4), dot: 12 }),
    r: nova("Overclock", "arcane", 16, 3.0, 155),
  },
  tester: {
    atkSpd: 10, auto: { element: "physical" },
    q: arc("Test Strike", "physical", 3, 1.6, 90, { arc: 0.9 }),
    e: nova("Bug Sweep", "physical", 7, 1.7, 115),
    r: meteor("Crash", "arcane", 15, 3.2, 145, { delay: 0.35, status: ST.stun(1) }),
  },
  beastmaster: {
    atkSpd: 9, auto: { element: "nature" },
    q: proj("Savage Bite", "nature", 3.5, 1.5, { speed: 650, pet: true }),
    e: nova("Pack Call", "nature", 8, 1.6, 120, { status: ST.slow(2, 0.5), pet: true }),
    r: aoe("Primal Stampede", "nature", 16, 3.0, 145, { offset: 35, knockback: 400, pet: true }),
  },
  anima_lorde: {
    atkSpd: 12, auto: { element: "nature" },
    q: proj("Spirit Bolt", "nature", 3.5, 1.7, { speed: 660 }),
    e: shield("Anima Shield", "nature", 10, 24, { duration: 5, healPct: 8 }),
    r: nova("Wild Hunt", "nature", 17, 3.2, 160, { pet: true }),
  },
  rootbinder: {
    atkSpd: 14, auto: { element: "nature" },
    q: beam("Thorn Lance", "nature", 4, 1.7, 220),
    e: ground("Grasping Roots", "nature", 9, 1.0, 82, { status: ST.root(2.4), dot: 11 }),
    r: nova("Overgrowth", "nature", 16, 2.9, 160, { status: ST.root(1.5) }),
  },
  lifeweaver: {
    atkSpd: -2, auto: { element: "holy", magic: true },
    q: proj("Life Bolt", "holy", 3, 1.5, { speed: 620 }),
    e: shield("Living Bark", "nature", 9, 24, { duration: 5, healPct: 12 }),
    r: heal("Renewal", "holy", 16, 40, { radius: 150, power: 2.2 }),
  },
  ultra_moderator: {
    atkSpd: 6, auto: { element: "arcane", magic: true },
    q: beam("Admin Beam", "arcane", 3.5, 2.0, 260),
    e: ground("Ban Field", "arcane", 9, 0.9, 92, { status: ST.stun(0.7), dot: 14 }),
    r: meteor("Server Crash", "arcane", 18, 3.8, 180, { delay: 0.4, status: ST.stun(1.2) }),
  },
  warlord: {
    atkSpd: 2, auto: { element: "fire" },
    q: arc("Warlord Cleave", "fire", 4.5, 1.9, 108, { arc: 1.15, status: ST.burn(2, 8) }),
    e: shield("War Banner", "fire", 10, 20, { duration: 5 }),
    r: aoe("Executioner", "fire", 16, 3.2, 125, { offset: 45, status: ST.bleed(3, 16) }),
  },
  warden: {
    atkSpd: 10, auto: { element: "nature" },
    q: proj("Bramble Shot", "nature", 3.5, 1.5, { speed: 660 }),
    e: ground("Verdant Snare", "nature", 8, 1.0, 85, { status: ST.root(2.2), dot: 12 }),
    r: fan("Wildstorm", "nature", 16, 1.4, 7, { spread: 0.24, speed: 720 }),
  },
  archmage: {
    atkSpd: 0, auto: { element: "arcane", magic: true },
    q: chain("Arcane Lance", "arcane", 4, 1.85, 350, { jumps: 5, chainRange: 220, status: ST.shock(2.5, 10) }),
    e: vortex("Glacial Prison", "frost", 9, 1.4, 140, { duration: 3.0, tick: 0.32, pull: 150, status: ST.freeze(2) }),
    r: meteor("Cataclysm", "fire", 18, 3.5, 172, { delay: 0.4, count: 4, stagger: 0.18, spreadRadius: 150, status: ST.burn(4, 20) }),
  },
  nightblade: {
    atkSpd: 24, auto: { element: "shadow" },
    q: arc("Umbral Slash", "shadow", 3.5, 2.0, 90, { arc: 0.85 }),
    e: blink("Shadow Veil", "shadow", 7, 1.7, 175, { radius: 75 }),
    r: nova("Nightfall", "shadow", 16, 3.0, 155, { status: ST.bleed(3.5, 16) }),
  },
  crusader: {
    atkSpd: -2, auto: { element: "holy" },
    q: arc("Crusader's Blow", "holy", 4.5, 1.8, 100, { arc: 1.05 }),
    e: shield("Divine Aegis", "holy", 10, 30, { duration: 5 }),
    r: meteor("Hammerfall", "holy", 16, 3.0, 140, { delay: 0.35, status: ST.stun(1) }),
  },
  reaper: {
    atkSpd: 18, auto: { element: "shadow" },
    q: arc("Soul Reap", "shadow", 3.5, 2.1, 95, { arc: 1.2 }),
    e: beam("Death Grip", "shadow", 8, 1.9, 210, { status: ST.slow(1.8, 0.45) }),
    r: nova("Scythe Storm", "blood", 16, 3.1, 155, { status: ST.bleed(4, 20) }),
  },
  high_priest: {
    atkSpd: -6, auto: { element: "holy", magic: true },
    q: proj("Smite", "holy", 3, 1.6, { speed: 640 }),
    e: shield("Blessing", "holy", 9, 22, { duration: 5, healPct: 15 }),
    r: meteor("Divine Judgment", "holy", 16, 2.9, 145, { delay: 0.4, status: ST.stun(1) }),
  },
  juggernaut: {
    atkSpd: -14, auto: { element: "earth" },
    q: arc("Crushing Blow", "earth", 4.5, 2.0, 105, { arc: 1.15 }),
    e: shield("Fortress", "earth", 11, 42, { duration: 5 }),
    r: nova("Earthquake", "earth", 17, 3.0, 175, { status: ST.stun(1.2) }),
  },
  war_emperor: {
    atkSpd: 0, auto: { element: "fire" },
    q: arc("Emperor's Edge", "fire", 4.5, 2.1, 110, { arc: 1.1, status: ST.burn(2.5, 10) }),
    e: nova("Crown of Flame", "fire", 9, 1.9, 130, { status: ST.burn(3, 14) }),
    r: meteor("Worldbreaker", "fire", 18, 3.6, 165, { delay: 0.45, status: ST.stun(1) }),
  },
  storm_warden: {
    atkSpd: 16, auto: { element: "lightning" },
    q: proj("Storm Arrow", "lightning", 3.5, 1.7, { speed: 720 }),
    e: ground("Thunder Cage", "lightning", 9, 1.0, 88, { status: ST.shock(2.4, 12), dot: 10 }),
    r: nova("Tempest", "lightning", 16, 3.0, 158, { chain: 3 }),
  },
  archon: {
    atkSpd: 4, auto: { element: "arcane", magic: true },
    q: beam("Arcane Spear", "arcane", 4, 1.9, 255),
    e: ground("Chrono Field", "arcane", 10, 0.9, 95, { status: ST.slow(2.6, 0.35), dot: 10 }),
    r: meteor("Singularity", "arcane", 18, 3.5, 175, { delay: 0.4, pull: 160 }),
  },
  shade_king: {
    atkSpd: 20, auto: { element: "shadow" },
    q: arc("King's Edict", "shadow", 4, 2.2, 100, { arc: 1.1 }),
    e: blink("Umbra Gate", "shadow", 8, 1.7, 185, { radius: 85 }),
    r: nova("Reign of Shadows", "shadow", 17, 3.3, 165, { status: ST.bleed(4, 22) }),
  },
  lightbringer: {
    atkSpd: 0, auto: { element: "holy" },
    q: arc("Radiant Strike", "holy", 4, 2.0, 105, { arc: 1.05 }),
    e: shield("Aegis of Light", "holy", 10, 32, { duration: 5 }),
    r: nova("Solar Flare", "holy", 17, 3.2, 165, { status: ST.stun(1) }),
  },
  death_lord: {
    atkSpd: 16, auto: { element: "shadow" },
    q: arc("Reaper's Toll", "shadow", 4, 2.3, 108, { arc: 1.2 }),
    e: beam("Grave Chains", "shadow", 8, 2.0, 220, { status: ST.root(1.8) }),
    r: nova("Army of the Dead", "shadow", 18, 3.4, 175, { status: ST.bleed(4, 24) }),
  },
  bloodspawn: {
    atkSpd: 22, auto: { element: "blood" },
    q: arc("Blood Claw", "blood", 3.5, 1.9, 90, { arc: 0.95, status: ST.bleed(2, 8) }),
    e: dash("Crimson Rush", "blood", 7, 1.9, 175, { status: ST.bleed(2, 10) }),
    r: nova("Blood Tide", "blood", 16, 3.0, 155, { status: ST.bleed(3.5, 18) }),
  },
  bloodlord: {
    atkSpd: 14, auto: { element: "blood" },
    q: arc("Sanguine Slash", "blood", 4, 2.2, 105, { arc: 1.1, status: ST.bleed(2.5, 12) }),
    e: shield("Blood Pact", "blood", 10, 25, { duration: 5, healPct: 10 }),
    r: meteor("Crimson Cataclysm", "blood", 18, 3.5, 165, { delay: 0.4, status: ST.bleed(4, 24) }),
  },
  gloomspawn: {
    atkSpd: 8, auto: { element: "shadow", magic: true },
    q: proj("Gloom Bolt", "shadow", 3, 1.7, { speed: 620 }),
    e: ground("Shadow Well", "shadow", 9, 0.9, 88, { status: ST.slow(2.4, 0.4), dot: 12 }),
    r: nova("Eclipse", "shadow", 17, 3.2, 165),
  },
  sanguine_lord: {
    atkSpd: 12, auto: { element: "blood" },
    q: arc("Blood Reign", "blood", 4, 2.3, 110, { arc: 1.15 }),
    e: shield("Veil of Blood", "blood", 11, 30, { duration: 5 }),
    r: nova("Exsanguinate", "blood", 18, 3.6, 170, { status: ST.bleed(4, 26) }),
  },
  divine_saint: {
    atkSpd: -4, auto: { element: "holy", magic: true },
    q: beam("Holy Lance", "holy", 3.5, 1.9, 235),
    e: shield("Sacred Aegis", "holy", 9, 26, { duration: 5, healPct: 10 }),
    r: nova("Ascension", "holy", 17, 3.0, 165, { healPct: 20 }),
  },
  colossus: {
    atkSpd: -16, auto: { element: "earth" },
    q: arc("Titanic Fist", "earth", 4.5, 2.3, 115, { arc: 1.2 }),
    e: shield("Colossal Guard", "earth", 11, 45, { duration: 5 }),
    r: nova("World Quake", "earth", 18, 3.4, 185, { status: ST.stun(1.2) }),
  },
};

// ---------------------------------------------------------------- R + ranger E
// Her sınıfın R'si farklı bir "ultimate" türü kullanır (nova/meteor tekeline son).
// Ranger'ın kök (root) E'si okçu kimliğine uymadığı için delip geçen atışa çevrildi.
SKILLS.ranger.e = beam("Piercing Bolt", "physical", 8, 2.0, 300, { width: 22, knockback: 150 });
const R_OVERRIDES = {
  warrior: orbit("Blade Tempest", "physical", 16, 2.7, 120, { count: 8, duration: 3.4, speed: 4.4 }),
  ranger: barrage("Rain of Arrows", "physical", 15, 2.2, 16, { interval: 0.055, speed: 900, radius: 6, spread: 0.13 }),
  mage: meteor("Meteor Storm", "fire", 17, 3.0, 148, { delay: 0.35, count: 3, stagger: 0.16, spreadRadius: 120, status: ST.burn(3, 18) }),
  rogue: nova("Death Blossom", "shadow", 15, 2.6, 145, { status: ST.bleed(3, 14) }),
  paladin: meteor("Judgment", "holy", 16, 2.9, 135, { delay: 0.4, status: ST.stun(0.9) }),
  assassin: blink("Crimson Reaping", "blood", 15, 2.9, 200, { radius: 120, status: ST.bleed(4, 18) }),
  support: heal("Radiant Chorus", "holy", 16, 35, { radius: 155 }),
  tank: quake("Shockwave", "earth", 16, 2.5, 150, { pulses: 3, knockback: 320 }),
  tamer: aoe("Stampede", "nature", 16, 2.7, 145, { offset: 40, knockback: 400, pet: true }),
  gardener: ground("Bloom", "nature", 15, 2.0, 130, { duration: 4, tick: 0.5, status: ST.root(1.2), dot: 12 }),
  moderator: chain("Overclock", "arcane", 16, 3.0, 320, { jumps: 5, chainRange: 190 }),
  tester: vortex("Crash", "arcane", 15, 3.2, 155, { duration: 2.6, pull: 110 }),
  beastmaster: barrage("Primal Stampede", "nature", 16, 2.4, 10, { interval: 0.08, speed: 700, radius: 9, spread: 0.2, pet: true }),
  anima_lorde: orbit("Wild Hunt", "nature", 17, 3.2, 130, { count: 8, duration: 3.6, speed: 4.0 }),
  rootbinder: ground("Overgrowth", "nature", 16, 2.9, 160, { duration: 4, tick: 0.45, status: ST.root(1.6), dot: 14 }),
  lifeweaver: heal("Renewal", "holy", 16, 40, { radius: 160 }),
  ultra_moderator: quake("Server Crash", "arcane", 18, 3.8, 190, { pulses: 4, interval: 0.18 }),
  warlord: arc("Executioner", "fire", 16, 3.2, 150, { arc: 1.4, knockback: 380, status: ST.burn(3, 20) }),
  warden: fan("Wildstorm", "nature", 16, 1.6, 9, { spread: 0.22, speed: 760 }),
  archmage: meteor("Cataclysm", "fire", 18, 3.5, 172, { delay: 0.4, count: 4, stagger: 0.18, spreadRadius: 150, status: ST.burn(4, 20) }),
  nightblade: blink("Nightfall", "shadow", 16, 3.0, 210, { radius: 130, status: ST.stun(0.5) }),
  crusader: arc("Hammerfall", "holy", 16, 2.9, 145, { arc: 1.5, knockback: 360, status: ST.stun(0.6) }),
  reaper: orbit("Scythe Storm", "blood", 16, 3.1, 125, { count: 6, duration: 3.4, speed: 4.2, status: ST.bleed(2, 10) }),
  high_priest: beam("Divine Judgment", "holy", 16, 2.9, 320, { width: 42, knockback: 220 }),
  juggernaut: quake("Earthquake", "earth", 17, 3.0, 180, { pulses: 4, interval: 0.2, knockback: 340 }),
  war_emperor: meteor("Worldbreaker", "fire", 18, 3.6, 170, { delay: 0.45, status: ST.burn(3, 22) }),
  storm_warden: chain("Tempest", "lightning", 16, 3.0, 340, { jumps: 6, chainRange: 200, status: ST.shock(1.6) }),
  archon: vortex("Singularity", "arcane", 18, 3.5, 160, { duration: 2.8, pull: 150 }),
  shade_king: nova("Reign of Shadows", "shadow", 17, 3.3, 165, { status: ST.slow(2, 0.45) }),
  lightbringer: beam("Solar Flare", "holy", 17, 3.2, 340, { width: 46, knockback: 260 }),
  death_lord: barrage("Army of the Dead", "shadow", 18, 2.2, 12, { interval: 0.08, speed: 680, radius: 8, spread: 0.3 }),
  bloodspawn: ground("Blood Tide", "blood", 16, 3.0, 150, { duration: 4, tick: 0.45, status: ST.slow(2, 0.4), dot: 16 }),
  bloodlord: vortex("Crimson Cataclysm", "blood", 18, 3.5, 175, { duration: 2.6, pull: 140, status: ST.bleed(4, 22) }),
  gloomspawn: orbit("Eclipse", "shadow", 17, 3.2, 120, { count: 6, duration: 3.6, speed: 3.8 }),
  sanguine_lord: beam("Exsanguinate", "blood", 18, 3.6, 300, { width: 38, healPct: 6, knockback: 180 }),
  divine_saint: shield("Ascension", "holy", 18, 30, { duration: 6, healPct: 15 }),
  colossus: quake("World Quake", "earth", 18, 3.4, 200, { pulses: 4, interval: 0.2, knockback: 400 }),
};
for (const [slug, r] of Object.entries(R_OVERRIDES)) {
  if (SKILLS[slug]) SKILLS[slug].r = r;
}
// Ground/meteor gibi hedefli büyüler artık bir menzile sahip: istendiği yere değil,
// en fazla `range` kadar uzağa atılır (motor bunu uygular).
for (const set of Object.values(SKILLS)) {
  for (const key of ["q", "e", "r"]) {
    const s = set[key];
    if (!s) continue;
    if ((s.kind === "ground" || s.kind === "meteor") && s.range == null) s.range = 340;
    if (s.kind === "vortex" && s.range == null) s.range = 320;
  }
}
// ---------------------------------------------------------------- Rogue kimliği
// Rogue, Assassin ile aynı görünmesin diye hem yetenek seti hem görsel ayrıldı.
// Q: hızlı bıçak yelpazesi, E: kör eden duman (yavaşlatır), R: gölge dansı (dönen bıçaklar).
SKILLS.rogue.q = fan("Fan of Knives", "shadow", 4, 0.8, 5, { spread: 0.16, speed: 720, radius: 6 });
SKILLS.rogue.e = ground("Smoke Bomb", "shadow", 9, 0.7, 92, { duration: 2.8, tick: 0.45, status: ST.slow(2.2, 0.55), dot: 8 });
SKILLS.rogue.r = orbit("Shadow Dance", "shadow", 15, 2.6, 118, { count: 10, duration: 3.6, speed: 5.2, tick: 0.28, status: ST.bleed(2.5, 9) });

// Warrior E: gerçek kılıç kombosu — karakter silahını üç kez savurur
// (her vuruşta yay izi, koni hasarı ve öne atılım; son vuruş ağır).
SKILLS.warrior.e = sk("Swordstorm", "physical", "swing", 10, 0.62, {
  radius: 122, hits: 3, interval: 0.2, arc: 1.65, knockback: 240, status: ST.bleed(2, 8),
});

// ---------------------------------------------------------------- Geri tepme dengesi
// Neredeyse hiçbir yetenek artık itmiyor; sadece birkaç "ağır" vuruş iter.
// Okçu/menzilli yetenekler canavarı uçurmasın diye varsayılan 0.
const KB = {
  "tank.q": 120, "tank.r": 200, "mage.e": 130,
  "warlord.r": 160, "crusader.r": 150, "juggernaut.r": 200,
  "colossus.r": 220, "tamer.r": 160, "beastmaster.r": 140,
};
for (const [slug, set] of Object.entries(SKILLS)) {
  for (const key of ["q", "e", "r"]) {
    const s = set[key];
    if (!s) continue;
    const kb = KB[slug + "." + key];
    if (kb) s.knockback = kb; else delete s.knockback;
  }
}

// ---------------------------------------------------------------- Ascended (evrim)
// Evrimleşmiş sınıflar belirgin biçimde güçlü olsun: daha çok hasar, daha kısa
// bekleme, biraz daha geniş alan. (İdempotent: her çalıştırmada aynı sonuç.)
const ASCENDED = [
  "warlord", "juggernaut", "crusader", "reaper", "warden", "nightblade", "archmage",
  "high_priest", "beastmaster", "anima_lorde", "rootbinder", "lifeweaver",
  "ultra_moderator", "war_emperor", "storm_warden", "archon", "shade_king",
  "lightbringer", "death_lord", "divine_saint", "colossus", "bloodlord", "sanguine_lord",
];
for (const slug of ASCENDED) {
  const set = SKILLS[slug];
  if (!set) continue;
  for (const key of ["q", "e", "r"]) {
    const s = set[key];
    if (!s) continue;
    if (Number.isFinite(s.power) && s.power > 0) s.power = Math.round(s.power * 1.22 * 100) / 100;
    if (Number.isFinite(s.cd)) s.cd = Math.max(6, Math.round(s.cd * 0.85 * 10) / 10);
    if (Number.isFinite(s.radius)) s.radius = Math.round(s.radius * 1.12);
    if (Number.isFinite(s.range) && s.kind === "beam") s.range = Math.round(s.range * 1.1);
    if (Number.isFinite(s.count)) s.count = Math.round(s.count * 1.15);
    if (Number.isFinite(s.healPct)) s.healPct = Math.round(s.healPct * 1.25);
  }
}
write("arpgSkills.json", SKILLS);

// ---------------------------------------------------------------- biomes
const B = (id, label, o) => Object.assign({ id, label }, o || {});
const M = (o) => Object.assign({
  painter: "goblin", element: "physical", weight: 10, elite: false,
  attackCooldown: 1.5, exp: 30, gold: 6, speed: 120, radius: 16,
}, o || {});

const travelBiomes = {
  verdant: B("verdant", "Verdant Wilds", {
    slogan: "Lush, alive, and never truly safe.",
    palette: { ground: "#4f8f3a", fog: "#9bd47a", sky: "#1a2e14", accent: "#9ccc65", grade: 0.08 },
    ambient: { color: "#b8e986", color2: "#ffd54f", leaf: true, fog: 0.16 },
    spawn: { count: 5, max: 9, respawn: 9, eliteChance: 0.14 },
    monsters: [
      M({ kind: "thorn_goblin", name: "Thornback Skirmisher", painter: "goblin", color: "#6aa84f", accent: "#d9f99d", element: "nature", hp: 460, damage: 34, speed: 138, radius: 16, exp: 44, gold: 8, weight: 26 }),
      M({ kind: "moss_treant", name: "Elder Moss Treant", painter: "treant", color: "#3f6b2a", accent: "#a3e635", element: "nature", hp: 1100, damage: 62, speed: 82, radius: 26, exp: 96, gold: 18, weight: 14, attackCooldown: 1.8 }),
      M({ kind: "gloom_wraith", name: "Gloom Wraith", painter: "wraith", color: "#7b4dce", accent: "#e9d5ff", element: "shadow", hp: 400, damage: 42, speed: 176, radius: 15, exp: 58, gold: 11, weight: 18, attackCooldown: 1.2 }),
      M({ kind: "venomfang", name: "Venomfang Spider", painter: "spider", color: "#3f6212", accent: "#bef264", element: "nature", hp: 430, damage: 30, speed: 150, radius: 17, exp: 52, gold: 10, weight: 18, status: { type: "poison", duration: 3, dps: 10, chance: 0.5 } }),
      M({ kind: "ancient_guardian", name: "Ancient Grove Guardian", painter: "treant", color: "#2f4f1f", accent: "#fde68a", element: "nature", hp: 1900, damage: 88, speed: 90, radius: 30, exp: 220, gold: 55, weight: 3, elite: true, attackCooldown: 2.0, ability: "nova" }),
    ],
  }),
  ashen: B("ashen", "Ashen Wastes", {
    slogan: "Cinders, crags, and things that burn.",
    palette: { ground: "#5a4030", fog: "#ffb27a", sky: "#2a1408", accent: "#ff8a50", grade: 0.12 },
    ambient: { color: "#ffb74d", color2: "#ff7043", ember: true, fog: 0.24 },
    spawn: { count: 4, max: 8, respawn: 11, eliteChance: 0.16 },
    monsters: [
      M({ kind: "cinder_imp", name: "Cinder Imp", painter: "goblin", color: "#c2410c", accent: "#fde68a", element: "fire", hp: 390, damage: 40, speed: 160, radius: 14, exp: 50, gold: 9, weight: 26, attackCooldown: 1.15 }),
      M({ kind: "ash_revenant", name: "Ash Revenant", painter: "knight", color: "#6b4f3a", accent: "#ff8a65", element: "fire", hp: 720, damage: 52, speed: 108, radius: 18, exp: 78, gold: 15, weight: 18, status: { type: "burn", duration: 2.5, dps: 9, chance: 0.4 } }),
      M({ kind: "magma_behemoth", name: "Magma Behemoth", painter: "golem", color: "#7f1d1d", accent: "#f97316", element: "fire", hp: 1500, damage: 84, speed: 70, radius: 30, exp: 150, gold: 30, weight: 10, attackCooldown: 2.1 }),
      M({ kind: "cinder_bat", name: "Cinder Bat", painter: "wraith", color: "#9a3412", accent: "#fdba74", element: "fire", hp: 300, damage: 28, speed: 210, radius: 12, exp: 34, gold: 6, weight: 24, attackCooldown: 1.0 }),
      M({ kind: "emberlord", name: "Emberlord Vulkarr", painter: "golem", color: "#450a0a", accent: "#fbbf24", element: "fire", hp: 2400, damage: 108, speed: 84, radius: 34, exp: 280, gold: 70, weight: 3, elite: true, attackCooldown: 1.9, ability: "nova", status: { type: "burn", duration: 4, dps: 20, chance: 0.6 } }),
    ],
  }),
  frost: B("frost", "Frozen Tundra", {
    slogan: "Where the wind bites and the dead do not sleep.",
    palette: { ground: "#e8f7ff", fog: "#d7f2ff", sky: "#0d2230", accent: "#8fe4ff", grade: 0.10 },
    ambient: { color: "#d7f2ff", color2: "#a5d8ff", snow: true, fog: 0.2 },
    spawn: { count: 4, max: 8, respawn: 10, eliteChance: 0.16 },
    monsters: [
      M({ kind: "frost_wolf", name: "Frost Wolf", painter: "beast", color: "#93c5fd", accent: "#e0f2fe", element: "frost", hp: 480, damage: 38, speed: 190, radius: 17, exp: 56, gold: 10, weight: 26, attackCooldown: 1.15 }),
      M({ kind: "ice_wraith", name: "Ice Wraith", painter: "wraith", color: "#3b82f6", accent: "#e0f2fe", element: "frost", hp: 440, damage: 46, speed: 150, radius: 15, exp: 64, gold: 12, weight: 18, status: { type: "freeze", duration: 1.1, chance: 0.28 } }),
      M({ kind: "glacier_golem", name: "Glacier Golem", painter: "golem", color: "#1e40af", accent: "#bfdbfe", element: "frost", hp: 1650, damage: 78, speed: 72, radius: 30, exp: 150, gold: 28, weight: 10, attackCooldown: 2.2, status: { type: "slow", duration: 2, slow: 0.5, chance: 0.5 } }),
      M({ kind: "snow_stalker", name: "Snow Stalker", painter: "spider", color: "#bfdbfe", accent: "#ffffff", element: "frost", hp: 420, damage: 34, speed: 168, radius: 16, exp: 48, gold: 9, weight: 22 }),
      M({ kind: "permafrost_wyrm", name: "Permafrost Wyrm", painter: "beast", color: "#1d4ed8", accent: "#f0f9ff", element: "frost", hp: 2600, damage: 102, speed: 104, radius: 36, exp: 300, gold: 75, weight: 3, elite: true, attackCooldown: 1.8, ability: "nova", status: { type: "freeze", duration: 1.6, chance: 0.5 } }),
    ],
  }),
  swamp: B("swamp", "Mirefen Marsh", {
    slogan: "Every step squelches. Something is always watching.",
    palette: { ground: "#3f5a34", fog: "#9bbf6b", sky: "#141f12", accent: "#84cc16", grade: 0.14 },
    ambient: { color: "#bef264", color2: "#65a30d", bubble: true, fog: 0.3 },
    spawn: { count: 5, max: 10, respawn: 9, eliteChance: 0.15 },
    monsters: [
      M({ kind: "bog_lurker", name: "Bog Lurker", painter: "goblin", color: "#4d7c0f", accent: "#d9f99d", element: "poison", hp: 440, damage: 36, speed: 140, radius: 16, exp: 46, gold: 8, weight: 26, status: { type: "poison", duration: 3, dps: 9, chance: 0.45 } }),
      M({ kind: "mire_hag", name: "Mire Hag", painter: "wraith", color: "#6d28d9", accent: "#a3e635", element: "poison", hp: 520, damage: 48, speed: 120, radius: 16, exp: 72, gold: 14, weight: 18, ability: "ranged", status: { type: "poison", duration: 4, dps: 12, chance: 0.55 } }),
      M({ kind: "rot_treant", name: "Rot Treant", painter: "treant", color: "#3f4a1f", accent: "#84cc16", element: "nature", hp: 1250, damage: 66, speed: 76, radius: 27, exp: 110, gold: 20, weight: 12, attackCooldown: 1.9 }),
      M({ kind: "leech_swarm", name: "Leech Swarm", painter: "spider", color: "#7f1d1d", accent: "#fecaca", element: "blood", hp: 340, damage: 28, speed: 180, radius: 14, exp: 40, gold: 7, weight: 22, status: { type: "bleed", duration: 3, dps: 8, chance: 0.5 } }),
      M({ kind: "plaguebringer", name: "Plaguebringer Morvane", painter: "knight", color: "#3b3a1a", accent: "#a3e635", element: "poison", hp: 2200, damage: 96, speed: 92, radius: 32, exp: 270, gold: 68, weight: 3, elite: true, attackCooldown: 1.8, ability: "nova", status: { type: "poison", duration: 5, dps: 18, chance: 0.7 } }),
    ],
  }),
  cursed: B("cursed", "Cursed Reach", {
    slogan: "The sky is wrong here. So is everything below it.",
    palette: { ground: "#3a2c4a", fog: "#c084fc", sky: "#120a1c", accent: "#c084fc", grade: 0.16 },
    ambient: { color: "#c084fc", color2: "#f472b6", void: true, fog: 0.34 },
    spawn: { count: 5, max: 10, respawn: 10, eliteChance: 0.18 },
    monsters: [
      M({ kind: "hollow_knight", name: "Hollow Knight", painter: "knight", color: "#3f3f46", accent: "#a78bfa", element: "shadow", hp: 760, damage: 56, speed: 116, radius: 19, exp: 84, gold: 16, weight: 24 }),
      M({ kind: "blood_seer", name: "Blood Seer", painter: "wraith", color: "#7f1d1d", accent: "#fb7185", element: "blood", hp: 520, damage: 54, speed: 128, radius: 16, exp: 80, gold: 15, weight: 18, ability: "ranged", status: { type: "bleed", duration: 3, dps: 12, chance: 0.5 } }),
      M({ kind: "bone_warden", name: "Bone Warden", painter: "knight", color: "#4b3f2f", accent: "#fde68a", element: "shadow", hp: 1400, damage: 74, speed: 88, radius: 28, exp: 140, gold: 26, weight: 12, attackCooldown: 2.0 }),
      M({ kind: "nightmare", name: "Nightmare", painter: "wraith", color: "#4c1d95", accent: "#e879f9", element: "shadow", hp: 470, damage: 44, speed: 196, radius: 15, exp: 66, gold: 12, weight: 22, attackCooldown: 1.1 }),
      M({ kind: "dread_sovereign", name: "Dread Sovereign", painter: "golem", color: "#1e1b4b", accent: "#c084fc", element: "shadow", hp: 3000, damage: 118, speed: 96, radius: 36, exp: 340, gold: 85, weight: 3, elite: true, attackCooldown: 1.7, ability: "nova", status: { type: "stun", duration: 0.8, chance: 0.4 } }),
    ],
  }),
};
// Daha az ama daha güçlü canavar: kalabalık yerine tehlikeli tekil moblar.
// Her mob 1 (elitler 2) dodge edilebilir yetenek kullanır; kırmızı telegraph çizilir.
const SKILL_BY_PAINTER = {
  goblin: { id: "lunge", kind: "dash", cd: 6.5, range: 250, windup: 0.55, dist: 130, power: 1.15, radius: 34 },
  beast:  { id: "pounce", kind: "dash", cd: 6.0, range: 300, windup: 0.60, dist: 165, power: 1.25, radius: 40 },
  spider: { id: "web", kind: "slam", cd: 7.5, range: 200, windup: 0.70, radius: 80, power: 0.9, status: { type: "slow", duration: 2, slow: 0.5 } },
  golem:  { id: "slam", kind: "slam", cd: 8.0, range: 170, windup: 0.95, radius: 100, power: 1.5 },
  treant: { id: "slam", kind: "slam", cd: 8.5, range: 190, windup: 1.00, radius: 110, power: 1.4 },
  wraith: { id: "bolt", kind: "shot", cd: 4.5, range: 340, windup: 0.55, power: 1.10 },
  knight: { id: "charge", kind: "dash", cd: 7.0, range: 280, windup: 0.65, dist: 155, power: 1.30, radius: 38 },
  archer: { id: "aimed", kind: "shot", cd: 3.6, range: 380, windup: 0.75, power: 1.15 },
};
function monsterSkills(m) {
  const list = [];
  const base = SKILL_BY_PAINTER[m.painter];
  if (base) list.push(Object.assign({}, base));
  if (m.ability === "ranged") list.push({ id: "volley", kind: "volley", cd: 6.5, range: 360, windup: 0.7, power: 0.9, count: 3, spread: 0.22 });
  if (m.elite) list.push({ id: "quake", kind: "slam", cd: 6.5, range: 210, windup: 0.85, radius: 130, power: 1.45 });
  return list.slice(0, 3);
}

for (const b of Object.values(travelBiomes)) {
  b.spawn.count = Math.max(3, Math.round(b.spawn.count * 0.65));
  b.spawn.max = Math.max(5, Math.round(b.spawn.max * 0.7));
  for (const m of b.monsters) {
    m.hp = Math.round(m.hp * (m.elite ? 0.62 : 0.58));
    m.damage = Math.round(m.damage * 1.15);
    m.exp = Math.round(m.exp * 1.1);
    m.aggroRange = m.elite ? 340 : 290;
    m.skills = monsterSkills(m);
  }
}
// Okçu tipi düşmanlar (menzilden ok atar, dash ile kaçar).
travelBiomes.frost.monsters.push(M({ kind: "rime_archer", name: "Rime Archer", painter: "archer", color: "#7dd3fc", accent: "#f0f9ff", element: "frost", hp: 620, damage: 46, speed: 128, radius: 15, exp: 88, gold: 18, weight: 16, attackCooldown: 1.6, ability: "ranged", aggroRange: 340 }));
travelBiomes.cursed.monsters.push(M({ kind: "bone_archer", name: "Bone Archer", painter: "archer", color: "#a8a29e", accent: "#c084fc", element: "shadow", hp: 700, damage: 52, speed: 124, radius: 15, exp: 96, gold: 20, weight: 16, attackCooldown: 1.55, ability: "ranged", aggroRange: 340 }));
travelBiomes.frost.monsters.push(M({ kind: "grave_archer", name: "Grave Archer", painter: "archer", color: "#9ca3af", accent: "#a7f3d0", element: "frost", hp: 640, damage: 48, speed: 126, radius: 15, exp: 92, gold: 19, weight: 14, attackCooldown: 1.6, ability: "ranged", aggroRange: 340 }));
// Yeni eklenenler de aynı denge/skill geçişinden geçsin.
for (const b of Object.values(travelBiomes)) {
  for (const m of b.monsters) {
    if (!m.skills) {
      m.hp = Math.round(m.hp * (m.elite ? 0.62 : 0.58));
      m.damage = Math.round(m.damage * 1.15);
      m.exp = Math.round(m.exp * 1.1);
      m.aggroRange = m.elite ? 340 : 290;
      m.skills = monsterSkills(m);
    }
  }
}
write("travelBiomes.json", travelBiomes);

console.log(`[gen] classes=${classes.length} races=${races.length} items+(attackSpeed)=${touched}`);
console.log(`[gen] arpgSkills=${Object.keys(SKILLS).length} classes, biomes=${Object.keys(travelBiomes).length}`);