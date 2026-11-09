#!/usr/bin/env node
/**
 * SETRA — 17 MONSTER EXPANSION (veri ekleme)
 * ------------------------------------------------------------
 * `claudeornekleri/setra_17_monster_expansion.js` içindeki 17 canavarı
 * dengelenmiş istatistikler ve motorun desteklediği yetenek türleriyle
 * `data/travelBiomes.json` dosyasına ekler.
 *
 * - Idempotent: aynı `kind` zaten varsa atlar.
 * - Çizimler `public/js/monster_expansion.js` içindeki prosedürel
 *   painter'lardan gelir (`painter` alanı o isimlerle eşleşir).
 * - Çalıştırdıktan sonra: `node build_content.js`
 *
 * Kullanım: node scripts/add_monster_expansion.js [--dry]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'travelBiomes.json');
const DRY = process.argv.includes('--dry');

// kind -> { biome, ...monster }
const EXPANSION = [
  // ---------------- VERDANT ----------------
  {
    kind: 'sporeling', biome: 'verdant', name: 'Sporeling', painter: 'sporeling',
    element: 'nature', weight: 16, elite: false, hp: 190, damage: 21, speed: 112,
    radius: 11, aggroRange: 205, attackCooldown: 2.1, exp: 20, gold: 3,
    color: '#a6c76a', accent: '#eaff91',
    skills: [
      { id: 'sporeling_cloud', kind: 'slam', cd: 8, range: 150, windup: 0.7, radius: 64, power: 0.6 },
    ],
  },
  {
    kind: 'briarbound_hound', biome: 'verdant', name: 'Briarbound Hound', painter: 'briarHound',
    element: 'nature', weight: 9, elite: false, hp: 430, damage: 46, speed: 174,
    radius: 17, aggroRange: 315, attackCooldown: 1.65, exp: 58, gold: 9,
    color: '#526b36', accent: '#b0c96a',
    skills: [
      { id: 'briar_pounce', kind: 'dash', cd: 6.5, range: 245, windup: 0.48, dist: 145, power: 1.15, radius: 38 },
    ],
  },
  {
    kind: 'mycelium_oracle', biome: 'verdant', name: 'Mycelium Oracle', painter: 'myceliumOracle',
    element: 'nature', weight: 2, elite: true, hp: 2100, damage: 88, speed: 84,
    radius: 28, aggroRange: 390, attackCooldown: 2.2, exp: 470, gold: 95,
    color: '#667b4a', accent: '#d5ff9c', ability: 'nova',
    skills: [
      { id: 'oracle_spore_nova', kind: 'slam', cd: 9, range: 200, windup: 1.05, radius: 130, power: 1.15 },
      { id: 'oracle_root_prison', kind: 'slam', cd: 13, range: 180, windup: 1.25, radius: 95, power: 0.85, status: 'root' },
      { id: 'oracle_spore_bolt', kind: 'shot', cd: 3.8, range: 340, windup: 0.55, power: 1.0 },
    ],
  },

  // ---------------- ASHEN ----------------
  {
    kind: 'scoria_crawler', biome: 'ashen', name: 'Scoria Crawler', painter: 'scoriaCrawler',
    element: 'fire', weight: 16, elite: false, hp: 210, damage: 24, speed: 108,
    radius: 12, aggroRange: 195, attackCooldown: 2.0, exp: 22, gold: 4,
    color: '#34363b', accent: '#ff6b27',
    skills: [
      { id: 'scoria_ember_spit', kind: 'shot', cd: 4.5, range: 220, windup: 0.5, power: 0.7 },
    ],
  },
  {
    kind: 'furnace_hound', biome: 'ashen', name: 'Furnace Hound', painter: 'furnaceHound',
    element: 'fire', weight: 8, elite: false, hp: 640, damage: 64, speed: 148,
    radius: 20, aggroRange: 330, attackCooldown: 1.8, exp: 88, gold: 14,
    color: '#4c4648', accent: '#ff8a3c',
    skills: [
      { id: 'furnace_charge', kind: 'dash', cd: 7, range: 260, windup: 0.7, dist: 155, power: 1.3, radius: 48 },
      { id: 'furnace_bite', kind: 'slam', cd: 3.2, range: 110, windup: 0.45, radius: 62, power: 1.05, status: 'burn' },
    ],
  },
  {
    kind: 'pyrewing_matriarch', biome: 'ashen', name: 'Pyrewing Matriarch', painter: 'pyrewingMatriarch',
    element: 'fire', weight: 2, elite: true, hp: 2400, damage: 100, speed: 116,
    radius: 29, aggroRange: 430, attackCooldown: 2.1, exp: 600, gold: 125,
    color: '#3b2525', accent: '#ffb64a', ability: 'nova',
    skills: [
      { id: 'pyre_meteor_rain', kind: 'slam', cd: 12, range: 240, windup: 1.4, radius: 160, power: 1.35, status: 'burn' },
      { id: 'pyre_infernal_dive', kind: 'dash', cd: 8, range: 300, windup: 0.9, dist: 210, power: 1.5, radius: 58 },
      { id: 'pyre_flame_cyclone', kind: 'slam', cd: 15, range: 210, windup: 1.1, radius: 115, power: 1.1, status: 'burn' },
    ],
  },

  // ---------------- FROST ----------------
  {
    kind: 'rime_toad', biome: 'frost', name: 'Rime Toad', painter: 'rimeToad',
    element: 'frost', weight: 15, elite: false, hp: 250, damage: 27, speed: 88,
    radius: 15, aggroRange: 205, attackCooldown: 2.25, exp: 24, gold: 4,
    color: '#8ab8c4', accent: '#e3ffff',
    skills: [
      { id: 'rime_frost_glob', kind: 'shot', cd: 5, range: 240, windup: 0.55, power: 0.75, status: 'slow' },
    ],
  },
  {
    kind: 'boreal_stag', biome: 'frost', name: 'Boreal Stag', painter: 'borealStag',
    element: 'frost', weight: 8, elite: false, hp: 700, damage: 70, speed: 162,
    radius: 21, aggroRange: 350, attackCooldown: 1.9, exp: 98, gold: 16,
    color: '#b9d3d9', accent: '#9beaff',
    skills: [
      { id: 'stag_crystal_charge', kind: 'dash', cd: 7, range: 275, windup: 0.75, dist: 175, power: 1.35, radius: 50 },
      { id: 'stag_shard_burst', kind: 'slam', cd: 9, range: 160, windup: 0.8, radius: 88, power: 0.9, status: 'slow' },
    ],
  },
  {
    kind: 'whiteout_siren', biome: 'frost', name: 'Whiteout Siren', painter: 'whiteoutSiren',
    element: 'frost', weight: 5, elite: false, hp: 470, damage: 58, speed: 118,
    radius: 16, aggroRange: 380, attackCooldown: 2.3, exp: 90, gold: 15,
    color: '#c6eaf0', accent: '#b6faff',
    skills: [
      { id: 'siren_winter_scream', kind: 'slam', cd: 10, range: 200, windup: 1.15, radius: 110, power: 1.0, status: 'freeze' },
      { id: 'siren_ice_shard', kind: 'shot', cd: 3.6, range: 330, windup: 0.5, power: 0.9 },
    ],
  },
  {
    kind: 'boreal_devourer', biome: 'frost', name: 'Boreal Devourer', painter: 'borealDevourer',
    element: 'frost', weight: 2, elite: true, hp: 2500, damage: 110, speed: 98,
    radius: 31, aggroRange: 440, attackCooldown: 2.15, exp: 660, gold: 140,
    color: '#527f91', accent: '#b5f3ff', ability: 'nova',
    skills: [
      { id: 'devourer_glacial_breath', kind: 'slam', cd: 8, range: 230, windup: 0.9, radius: 150, power: 1.3, status: 'slow' },
      { id: 'devourer_ground_shatter', kind: 'slam', cd: 12, range: 210, windup: 1.25, radius: 145, power: 1.2 },
      { id: 'devourer_icefall', kind: 'shot', cd: 4, range: 380, windup: 0.6, power: 1.05 },
    ],
  },

  // ---------------- SWAMP ----------------
  {
    kind: 'mireling', biome: 'swamp', name: 'Mireling', painter: 'mireling',
    element: 'poison', weight: 16, elite: false, hp: 200, damage: 22, speed: 122,
    radius: 10, aggroRange: 190, attackCooldown: 1.9, exp: 20, gold: 3,
    color: '#78905a', accent: '#d5ff69',
    skills: [
      { id: 'mireling_leech_bite', kind: 'dash', cd: 5.5, range: 120, windup: 0.35, dist: 65, power: 0.8, radius: 22, status: 'poison' },
    ],
  },
  {
    kind: 'corpse_lantern', biome: 'swamp', name: 'Corpse Lantern', painter: 'corpseLantern',
    element: 'poison', weight: 6, elite: false, hp: 450, damage: 55, speed: 94,
    radius: 17, aggroRange: 360, attackCooldown: 2.15, exp: 88, gold: 15,
    color: '#58675b', accent: '#8dff9b',
    skills: [
      { id: 'lantern_spectral_burst', kind: 'slam', cd: 9, range: 190, windup: 0.9, radius: 95, power: 1.0 },
      { id: 'lantern_false_light', kind: 'shot', cd: 4.2, range: 300, windup: 0.55, power: 0.85, status: 'poison' },
    ],
  },
  {
    kind: 'drowned_matron', biome: 'swamp', name: 'Drowned Matron', painter: 'drownedMatron',
    element: 'poison', weight: 2, elite: true, hp: 2300, damage: 102, speed: 80,
    radius: 30, aggroRange: 410, attackCooldown: 2.35, exp: 620, gold: 130,
    color: '#617b63', accent: '#d8ff92', ability: 'nova',
    skills: [
      { id: 'matron_mire_wave', kind: 'slam', cd: 10, range: 230, windup: 1.1, radius: 150, power: 1.2, status: 'poison' },
      { id: 'matron_grasping_tendrils', kind: 'slam', cd: 7, range: 190, windup: 0.8, radius: 100, power: 1.15, status: 'root' },
      { id: 'matron_rotting_flood', kind: 'slam', cd: 15, range: 250, windup: 1.6, radius: 180, power: 1.4, status: 'poison' },
    ],
  },

  // ---------------- CURSED ----------------
  {
    kind: 'grave_moth', biome: 'cursed', name: 'Grave Moth', painter: 'graveMoth',
    element: 'shadow', weight: 15, elite: false, hp: 215, damage: 24, speed: 148,
    radius: 12, aggroRange: 240, attackCooldown: 1.8, exp: 23, gold: 4,
    color: '#282934', accent: '#ff5d70',
    skills: [
      { id: 'moth_death_dust', kind: 'slam', cd: 8, range: 140, windup: 0.55, radius: 60, power: 0.6, status: 'bleed' },
    ],
  },
  {
    kind: 'chainbound_penitent', biome: 'cursed', name: 'Chainbound Penitent', painter: 'chainboundPenitent',
    element: 'shadow', weight: 7, elite: false, hp: 780, damage: 78, speed: 90,
    radius: 22, aggroRange: 300, attackCooldown: 2.05, exp: 115, gold: 19,
    color: '#4d4b50', accent: '#b2a9a0',
    skills: [
      { id: 'penitent_chain_lash', kind: 'slam', cd: 5.5, range: 170, windup: 0.65, radius: 82, power: 1.2 },
      { id: 'penitent_iron_punishment', kind: 'dash', cd: 9, range: 185, windup: 0.85, dist: 110, power: 1.3, radius: 45 },
    ],
  },
  {
    kind: 'carrion_abomination', biome: 'cursed', name: 'Carrion Abomination', painter: 'carrionAbomination',
    element: 'shadow', weight: 5, elite: false, hp: 1080, damage: 92, speed: 74,
    radius: 25, aggroRange: 315, attackCooldown: 2.2, exp: 160, gold: 26,
    color: '#765b54', accent: '#ffcf77',
    skills: [
      { id: 'abomination_carrion_slam', kind: 'slam', cd: 8, range: 190, windup: 1.0, radius: 110, power: 1.3 },
      { id: 'abomination_cleaving_arms', kind: 'slam', cd: 4.5, range: 150, windup: 0.55, radius: 78, power: 1.15, status: 'bleed' },
    ],
  },
  {
    kind: 'the_bell_ringer', biome: 'cursed', name: 'The Bell-Ringer', painter: 'bellRinger',
    element: 'shadow', weight: 2, elite: true, hp: 2700, damage: 118, speed: 82,
    radius: 29, aggroRange: 430, attackCooldown: 2.3, exp: 730, gold: 155,
    color: '#393740', accent: '#e74e6c', ability: 'nova',
    skills: [
      { id: 'bell_funeral_toll', kind: 'slam', cd: 11, range: 240, windup: 1.25, radius: 160, power: 1.25, status: 'shock' },
      { id: 'bell_grave_summoning', kind: 'slam', cd: 17, range: 220, windup: 1.5, radius: 120, power: 0.75, status: 'slow' },
      { id: 'bell_resonance_wave', kind: 'slam', cd: 6, range: 200, windup: 0.7, radius: 120, power: 1.1, status: 'stun' },
    ],
  },
];

function main() {
  const raw = fs.readFileSync(FILE, 'utf8');
  const biomes = JSON.parse(raw);
  let added = 0;
  const skipped = [];
  for (const m of EXPANSION) {
    const biome = biomes[m.biome];
    if (!biome || !Array.isArray(biome.monsters)) {
      throw new Error(`missing travelBiomes.${m.biome}.monsters`);
    }
    // Alan sırası mevcut kayıtlarla aynı olsun (diff okunur kalsın).
    const record = {
      painter: m.painter,
      element: m.element,
      weight: m.weight,
      elite: !!m.elite,
      attackCooldown: m.attackCooldown,
      exp: m.exp,
      gold: m.gold,
      speed: m.speed,
      radius: m.radius,
      kind: m.kind,
      name: m.name,
      color: m.color,
      accent: m.accent,
      ...(m.ability ? { ability: m.ability } : {}),
      hp: m.hp,
      damage: m.damage,
      aggroRange: m.aggroRange,
      skills: m.skills,
    };
    const idx = biome.monsters.findIndex((x) => x.kind === m.kind);
    if (idx >= 0) {
      // Var olan kayıt: denge güncellemesi (upsert) — yerini korur.
      if (JSON.stringify(biome.monsters[idx]) === JSON.stringify(record)) { skipped.push(m.kind); continue; }
      biome.monsters[idx] = record;
      added++;
      continue;
    }
    biome.monsters.push(record);
    added++;
  }
  if (DRY) {
    console.log(`[dry] ${added} canavar eklenecekti, ${skipped.length} zaten var.`);
    return;
  }
  if (added === 0) {
    console.log(`Değişiklik yok (${skipped.length} kayıt zaten mevcut).`);
    return;
  }
  fs.writeFileSync(FILE, JSON.stringify(biomes, null, 2) + '\n', 'utf8');
  console.log(`${added} canavar eklendi, ${skipped.length} atlandı. Şimdi: node build_content.js`);
}

main();
