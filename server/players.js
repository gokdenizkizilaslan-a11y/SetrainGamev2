const { CONTENT, getClass, getSkill, getItem } = require("../content");

function randomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function rollRange(range) {
  return randomInt(range.min, range.max);
}

function pickAnomaly() {
  const { anomalyChance, pureBloodChance, traits } = CONTENT.anomalies;
  const r = Math.random();
  let pool;
  if (r < pureBloodChance) {
    pool = traits.filter((t) => t.pureBlood);
  } else if (r < pureBloodChance + anomalyChance) {
    pool = traits.filter((t) => !t.pureBlood);
  } else {
    return null;
  }
  if (!pool.length) return null;
  const t = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    pureBlood: t.pureBlood,
    rarity: t.rarity,
    frameColor: t.frameColor,
    effect: t.effect,
  };
}

function applyAnomalyStatBonus(player) {
  if (!player.anomaly || !player.anomaly.effect) return;
  const e = player.anomaly.effect;
  if (e.type === "resistanceBonus") {
    player.resistance += e.amount;
  } else if (e.type === "manaRegenBonus") {
    player.manaRegen += e.amount;
  }
}

function rollStats(player) {
  const cls = getClass(player.character);
  if (!cls) {
    throw new Error("Unknown class.");
  }
  const hp = rollRange(cls.hp);
  player.speed = cls.speed;
  player.hp = hp;
  player.maxHp = hp;
  player.attack = rollRange(cls.attack);
  player.mana = rollRange(cls.mana);
  player.maxMana = player.mana;
  player.resistance = rollRange(cls.resistance);
  player.magicPower = rollRange(cls.magicPower);
  player.healPower = cls.healPower ? rollRange(cls.healPower) : 0;
  player.critChance = cls.critChance ? rollRange(cls.critChance) : (CONTENT.combat.critChance || 0) * 100;
  player.critDamage = cls.critDamage ? rollRange(cls.critDamage) : Math.round(((CONTENT.combat.critMult || 1.5) - 1) * 100);
  applyAnomalyStatBonus(player);
  return player;
}

function xpToNext(currentLevel) {
  const { maxLevel, xpBase, xpExponent } = CONTENT.leveling;
  if (currentLevel >= maxLevel) return 0;
  return Math.round(xpBase * Math.pow(currentLevel, xpExponent));
}

function applyClassGrowth(player) {
  const cls = getClass(player.character);
  if (!cls) return;
  const g = cls.growth;
  // Level-scaled growth: higher levels gain more per level-up.
  // growthScale 0 = flat (old behavior, exactly). e.g. 0.02 → level 48
  // gains ~1.94x the base growth. Crit stays flat (percentage points).
  const scale = (CONTENT.leveling && CONTENT.leveling.growthScale) || 0;
  const mult = 1 + Math.max(0, (player.level || 1) - 1) * Math.max(0, scale);
  const gain = (v) => Math.round((v || 0) * mult);
  player.maxHp += gain(g.hp);
  player.hp = Math.min(player.maxHp, player.hp + gain(g.hp));
  player.attack += gain(g.attack);
  player.mana += gain(g.mana);
  player.resistance += gain(g.resistance);
  player.magicPower += gain(g.magicPower);
  player.healPower += gain(g.healPower || 0);
  player.critChance = (player.critChance || 0) + (g.critChance || 0);
  player.critDamage = (player.critDamage || 0) + (g.critDamage || 0);
}

function addXp(player, amount) {
  const { maxLevel } = CONTENT.leveling;
  if (player.level >= maxLevel || amount <= 0) return;
  player.xp += amount;
  while (player.level < maxLevel) {
    const need = xpToNext(player.level);
    if (player.xp < need) break;
    player.xp -= need;
    player.level += 1;
    applyClassGrowth(player);
    player.skillPoints = (player.skillPoints || 0) + ((CONTENT.skillTree && CONTENT.skillTree.pointsPerLevel) || 3);
  }
  if (player.level >= maxLevel) {
    player.xp = 0;
  }
}

// ---- Skill Tree ----

function lineageFor(slug) {
  const chain = [];
  const seen = new Set();
  let c = getClass(slug);
  while (c && !seen.has(c.slug)) {
    seen.add(c.slug);
    chain.push(c.slug);
    c = c.evolution && c.evolution.to ? getClass(c.evolution.to) : null;
  }
  c = getClass(slug);
  while (c && c.baseClass) {
    c = getClass(c.baseClass);
    if (!c || chain.includes(c.slug)) break;
    chain.unshift(c.slug);
  }
  return chain;
}

function lineageSkillTree(slug) {
  const st = CONTENT.skillTree;
  if (!st || !st.lineages) return null;
  const chain = lineageFor(slug);
  return st.lineages[chain[0]] || null;
}

// Ancestors-or-self by baseClass links: [current, base, base-of-base, ...].
// Used for class-gated skill visibility (a class sees its own path only).
function ancestorsOf(slug) {
  const out = [slug];
  const seen = new Set([slug]);
  let c = getClass(slug);
  while (c && c.baseClass && !seen.has(c.baseClass)) {
    c = getClass(c.baseClass);
    if (!c) break;
    seen.add(c.slug);
    out.push(c.slug);
  }
  return out;
}

// Which class a tree node belongs to: explicit ownerClass, else the lineage
// root that contains it, else null (global nodes are open to every class).
function nodeScope(st, node) {
  if (node.ownerClass) return node.ownerClass;
  for (const [key, lin] of Object.entries((st && st.lineages) || {})) {
    if ((lin.nodes || []).some((n) => n.id === node.id)) return key;
  }
  return null;
}

function seedOwnedTreeNodes(player) {
  const spec = lineageSkillTree(player.character);
  player.learnedTreeNodes = player.learnedTreeNodes || [];
  if (!spec) return;
  for (const node of spec.nodes) {
    if (!node.owned) continue;
    if (!player.learnedTreeNodes.includes(node.id)) player.learnedTreeNodes.push(node.id);
    const skill = node.skillId;
    if (skill && !player.unlockedSkills.includes(skill)) player.unlockedSkills.push(skill);
  }
}

function learnTreeNode(player, nodeId) {
  const st = CONTENT.skillTree;
  if (!st) throw new Error("The skill tree is hidden.");
  let node = (st.global || []).find((n) => n.id === nodeId) || null;
  const spec = lineageSkillTree(player.character);
  if (!node && spec) node = spec.nodes.find((n) => n.id === nodeId) || null;
  if (!node) throw new Error("That skill cannot be found on the tree.");
  if ((player.learnedTreeNodes || []).includes(nodeId)) throw new Error("You already learned that skill.");
  for (const p of node.prereqs || []) {
    if (!(player.learnedTreeNodes || []).includes(p)) {
      const pre = ((st.global || []).find((n) => n.id === p) || (spec ? spec.nodes.find((n) => n.id === p) : null));
      const name = pre && pre.skillId ? (getSkill(pre.skillId) || {}).name || pre.skillId : p;
      throw new Error("Requires: " + name + ".");
    }
  }
  if (node.ownerClass) {
    const chain = lineageFor(player.character);
    if (!chain.includes(node.ownerClass)) throw new Error("That skill is not part of your class path.");
  }
  // Class-gated visibility: a lineage node is learnable only if its class is
  // the player's own or an ancestor (evolved classes see previous + own).
  // Global nodes (scope null) stay open to every class.
  // NOTE: no level requirement — skills open with skill points only.
  const scope = nodeScope(st, node);
  if (scope && !ancestorsOf(player.character).includes(scope)) {
    throw new Error("That skill is not part of your class path.");
  }
  const cost = node.cost || 1;
  if ((player.skillPoints || 0) < cost) throw new Error("Not enough skill points (" + cost + " needed).");
  const skill = getSkill(node.skillId);
  player.skillPoints -= cost;
  player.learnedTreeNodes.push(nodeId);
  if (node.skillId && !player.unlockedSkills.includes(node.skillId)) {
    player.unlockedSkills.push(node.skillId);
    if (player.skillLoadout.length < ((st.maxLoadout) || 5)) {
      player.skillLoadout.push(node.skillId);
    }
  }
  return {
    nodeId,
    skillId: node.skillId,
    name: (skill && skill.name) || node.skillId,
    cost,
  };
}
function petXpToNext(level){
  if(level >= 20) return 0;
  // faster than character: 120 base, 1.35 exp
  return Math.round(120 * Math.pow(level, 1.35));
}
function addPetXp(player, petId, amount){
  if(!player.pets) return;
  const pet = player.pets.find(p=>p.petId===petId);
  if(!pet) return;
  if(pet.level >= 20) return;
  if(pet.level == null) pet.level=1;
  if(pet.xp == null) pet.xp=0;
  pet.xp += amount;
  while(pet.level < 20){
    const need = petXpToNext(pet.level);
    if(pet.xp < need) break;
    pet.xp -= need;
    pet.level += 1;
    // stat growth: +1 to primary stat
    const def = (CONTENT.pets||[]).find(x=>x.id===petId);
    const elem = def?def.element:"physical";
    if(elem==="fire"||elem==="physical"||elem==="earth") pet.bonusAttack = (pet.bonusAttack||0)+1;
    else if(elem==="water"||elem==="frost"||elem==="lightning") pet.bonusMagic = (pet.bonusMagic||0)+1;
    else pet.bonusResist = (pet.bonusResist||0)+1;
  }
  if(pet.level >=20) pet.xp=0;
}

function createPlayer({ id, name, character, isHost = false }) {
  const anomaly = pickAnomaly();
  const cls = getClass(character);
  // Secret (test) classes may carry more than the normal 5-skill loadout.
  const loadoutCap = cls && cls.secret ? 8 : ((CONTENT.skillTree && CONTENT.skillTree.maxLoadout) || 5);
  const starting = cls && Array.isArray(cls.startingSkills) ? cls.startingSkills.slice(0, loadoutCap) : [];
  const player = {
    id,
    name,
    character,
    bossKills: [],
    lives: CONTENT.starting.lives,
    wood: CONTENT.starting.wood,
    gold: CONTENT.starting.gold,
    food: 0,
    inventory: [],
    equipment: {
      weapon: null,
      head: null,
      armor: null,
      legs: null,
      boots: null,
      amulet: null,
      ring1: null,
      ring2: null,
      book: null,
      stone: null,
    },
    unlockedSkills: starting,
    skillLoadout: starting.slice(),
    skillPoints: (CONTENT.skillTree && CONTENT.skillTree.startingPoints) || 3,
    learnedTreeNodes: [],
    hp: 0,
    maxHp: 0,
    attack: 0,
    mana: 0,
    maxMana: 0,
    resistance: 0,
    magicPower: 0,
    healPower: 0,
    omnivamp: 0,
    speed: 0,
    critChance: 0,
    critDamage: 0,
    manaRegen: (CONTENT.combat.manaRegenPerRound || 3) + (cls && cls.manaRegen ? cls.manaRegen : 0),
    level: 1,
    xp: 0,
    stamina: CONTENT.starting.stamina,
    maxStamina: CONTENT.starting.maxStamina,
    endedDay: false,
    ready: false,
    isHost,
    connected: true,
    anomaly,
    tavern: null,
    dungeonId: null,
    pvpId: null,
    shield: 0,
    maxShield: 0,
    pets: [],
    activePetId: null,
    activePetIds: [],
  };
  if (character === "tamer") {
    player.inventory.push({ itemId: "egg_red", qty: 1 }, { itemId: "egg_green", qty: 1 });
  }
  // Tester (secret test class): starts with every chest, every egg and every
  // evolution-required item so ascension and systems can be tried instantly.
  // Fully data-driven — new chests/eggs/requirements are picked up automatically.
  if (character === "tester") {
    const seen = new Set(player.inventory.map((i) => i.itemId));
    const grant = (itemId, qty) => {
      if (!itemId || seen.has(itemId)) return;
      seen.add(itemId);
      player.inventory.push({ itemId, qty: qty || 1 });
    };
    // Ascension fuel: legacy routes always burn one Ancient Relic.
    grant("ancient_relic", 3);
    for (const it of CONTENT.items || []) {
      if (it.slot === "chest") grant(it.id, 1);
    }
    for (const e of CONTENT.eggs || []) {
      if (e && e.id) grant(e.id, 1);
    }
    for (const cl of CONTENT.classes || []) {
      const routes = [...(cl.evolutions || []), ...(cl.evolution ? [cl.evolution] : [])];
      for (const r of routes) {
        if (r && r.requiredItem) grant(r.requiredItem, Math.max(1, r.requiredItemCount || 1));
      }
    }
  }
  // Secret (test) classes may start above level 1: apply per-level growth so
  // stats match a naturally leveled character. Normal classes skip this.
  const startLevel = Math.min(CONTENT.leveling.maxLevel, Math.max(1, Math.floor((cls && cls.startLevel) || 1)));
  if (startLevel > 1) {
    for (let lv = 1; lv < startLevel; lv++) {
      player.level = lv + 1;
      applyClassGrowth(player);
    }
    player.hp = player.maxHp;
    player.mana = player.maxMana;
  }
  seedOwnedTreeNodes(player);
  return player;
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    character: player.character,
    lives: player.lives,
    wood: player.wood,
    gold: player.gold,
    food: player.food || 0,
    inventory: (player.inventory || []).map((i) => ({ itemId: i.itemId, qty: i.qty })),
    equipment: { ...player.equipment },
    unlockedSkills: (player.unlockedSkills || []).slice(),
    skillLoadout: (player.skillLoadout || []).slice(),
    skillPoints: player.skillPoints || 0,
    learnedTreeNodes: (player.learnedTreeNodes || []).slice(),
    bossKills: (player.bossKills || []).slice(),
    connected: player.connected !== false,
    hp: player.hp,
    maxHp: player.maxHp,
    attack: player.attack,
    mana: player.mana,
    maxMana: player.maxMana,
    resistance: player.resistance,
    magicPower: player.magicPower,
    healPower: player.healPower || 0,
    omnivamp: player.omnivamp || 0,
    speed: player.speed,
    critChance: player.critChance || 0,
    critDamage: player.critDamage || 0,
    manaRegen: player.manaRegen || (CONTENT.combat.manaRegenPerRound || 3),
    level: player.level,
    xp: player.xp,
    xpToNext: xpToNext(player.level),
    stamina: player.stamina,
    maxStamina: player.maxStamina,
    endedDay: player.endedDay,
    ready: player.ready,
    isHost: player.isHost,
    dungeonId: player.dungeonId || null,
    bossId: player.bossId || null,
    pvpId: player.pvpId || null,
    shield: player.shield || 0,
    maxShield: player.maxShield || 0,
    pets: (player.pets || []).map((p) => ({ petId: p.petId, hatched: p.hatched, level: p.level||1, xp: p.xp||0, xpToNext: petXpToNext(p.level||1), bonusAttack: p.bonusAttack||0, bonusMagic: p.bonusMagic||0, bonusResist: p.bonusResist||0 })),
    activePetId: player.activePetId || (player.activePetIds && player.activePetIds[0]) || null,
    activePetIds: (player.activePetIds && player.activePetIds.length ? player.activePetIds : (player.activePetId ? [player.activePetId] : [])).slice(0, player.character==="tamer" ? 3 : 2),
    anomaly: player.anomaly
      ? {
          id: player.anomaly.id,
          name: player.anomaly.name,
          description: player.anomaly.description,
          pureBlood: player.anomaly.pureBlood,
          rarity: player.anomaly.rarity,
          frameColor: player.anomaly.frameColor,
        }
      : null,
    tavern: player.tavern
      ? {
          game: player.tavern.game,
          bet: player.tavern.bet,
          playerHand: player.tavern.playerHand,
          dealerHand: player.tavern.dealerShown
            ? player.tavern.dealerHand
            : player.tavern.dealerHand.slice(0, 1),
          status: player.tavern.status,
          won: player.tavern.won,
          message: player.tavern.message,
        }
      : null,
  };
}

function onNewDay(player) {
  player.stamina = player.maxStamina;
  player.endedDay = false;
  if (player.anomaly && player.anomaly.effect) {
    const e = player.anomaly.effect;
    if (e.type === "staminaOnDay") {
      player.stamina += e.amount;
    }
    if (e.type === "manaOnDay") {
      player.mana = Math.min(player.maxMana, player.mana + e.amount);
    }
  }
}

function dealDamage(entity, amount) {
  let n = Math.max(0, Math.round(amount));
  // shield absorbs first (separate from defense %)
  if (entity.shield && entity.shield > 0) {
    const absorbed = Math.min(entity.shield, n);
    entity.shield -= absorbed;
    n -= absorbed;
    if (entity.maxShield && entity.shield <= 0) entity.maxShield = 0;
  }
  if (n > 0) entity.hp = Math.max(0, entity.hp - n);
  return entity.hp;
}
function addShield(entity, amount) {
  const n = Math.max(0, Math.round(amount));
  entity.shield = (entity.shield || 0) + n;
  entity.maxShield = Math.max(entity.maxShield || 0, entity.shield);
  return entity.shield;
}

function heal(entity, amount) {
  const n = Math.max(0, Math.round(amount));
  entity.hp = Math.min(entity.maxHp, entity.hp + n);
  return entity.hp;
}

function loseLife(player) {
  player.lives = Math.max(0, player.lives - 1);
}

function addItem(player, itemId, qty = 1) {
  const n = Math.max(1, Math.floor(qty || 1));
  // Gear never stacks (one unit per entry); consumables/materials/chests/eggs stack.
  const def = getItem(itemId);
  const stackable = !def || ["consumable", "material", "chest", "egg"].includes(def.slot);
  if (!stackable) {
    for (let i = 0; i < n; i++) player.inventory.push({ itemId, qty: 1 });
    return;
  }
  const entry = player.inventory.find((i) => i.itemId === itemId);
  if (entry) {
    entry.qty += n;
  } else {
    player.inventory.push({ itemId, qty: n });
  }
}

function removeItem(player, itemId, qty = 1) {
  const n = Math.max(1, Math.floor(qty || 1));
  const total = (player.inventory || []).reduce((s, i) => s + (i.itemId === itemId ? i.qty : 0), 0);
  if (total < n) {
    throw new Error("You do not have that item.");
  }
  let left = n;
  for (const entry of player.inventory) {
    if (entry.itemId !== itemId || left <= 0) continue;
    const take = Math.min(entry.qty, left);
    entry.qty -= take;
    left -= take;
  }
  player.inventory = player.inventory.filter((i) => i.qty > 0);
}

function hasItem(player, itemId, qty = 1) {
  const n = Math.max(1, Math.floor(qty || 1));
  const total = (player.inventory || []).reduce((s, i) => s + (i.itemId === itemId ? i.qty : 0), 0);
  return total >= n;
}

function applyStatDelta(player, stats, sign) {
  for (const [key, val] of Object.entries(stats || {})) {
    const n = Number(val) || 0;
    if (key === "maxHp" || key === "hp") {
      player.maxHp += sign * n;
      player.hp = Math.min(player.hp, player.maxHp);
    } else if (key === "mana") {
      player.maxMana += sign * n;
      player.mana = Math.min(player.mana, player.maxMana);
    } else if (key === "attack") {
      player.attack += sign * n;
    } else if (key === "resistance") {
      player.resistance += sign * n;
    } else if (key === "magicPower") {
      player.magicPower += sign * n;
    } else if (key === "healPower") {
      player.healPower += sign * n;
    } else if (key === "omnivamp") {
      player.omnivamp = (player.omnivamp || 0) + sign * n;
    } else if (key === "speed") {
      player.speed += sign * n;
    } else if (key === "critChance") {
      player.critChance = (player.critChance || 0) + sign * n;
    } else if (key === "critDamage") {
      player.critDamage = (player.critDamage || 0) + sign * n;
    } else if (key === "manaRegen") {
      player.manaRegen += sign * n;
    }
  }
}

function equipItem(player, itemId) {
  const item = getItem(itemId);
  if (!item) {
    throw new Error("Unknown item.");
  }
  if (item.slot === "consumable" || item.slot === "chest") {
    throw new Error("That cannot be equipped.");
  }
  const EQUIPPABLE = ["weapon", "head", "armor", "legs", "boots", "amulet", "ring", "book", "stone"];
  if (!EQUIPPABLE.includes(item.slot)) {
    throw new Error("That cannot be equipped.");
  }
  const owned = player.inventory.find((i) => i.itemId === itemId);
  if (!owned || owned.qty < 1) {
    throw new Error("You do not own that item.");
  }
  let slot = item.slot;
  if (slot === "ring") {
    if (!player.equipment.ring1) slot = "ring1";
    else if (!player.equipment.ring2) slot = "ring2";
    else throw new Error("Both ring slots are full.");
  }
  if (player.equipment[slot]) {
    unequipSlot(player, slot);
  }
  removeItem(player, itemId, 1);
  player.equipment[slot] = itemId;
  applyStatDelta(player, item.stats, 1);
  return { slot, item };
}

function unequipSlot(player, slot) {
  const itemId = player.equipment[slot];
  if (!itemId) {
    throw new Error("Nothing is equipped there.");
  }
  const item = getItem(itemId);
  if (item) applyStatDelta(player, item.stats, -1);
  addItem(player, itemId, 1);
  player.equipment[slot] = null;
  return itemId;
}

function healForFood(player) {
  const { healBase, healPct } = CONTENT.food;
  return Math.round(healBase + healPct * player.maxHp);
}

function eatFood(player) {
  if (player.food < 1) {
    throw new Error("You have no food.");
  }
  player.food -= 1;
  return heal(player, healForFood(player));
}

function setSkillLoadout(player, ids) {
  const maxLoadout = (CONTENT.skillTree && CONTENT.skillTree.maxLoadout) || 5;
  const arr = Array.isArray(ids) ? ids.slice(0, maxLoadout) : [];
  for (const id of arr) {
    if (!player.unlockedSkills.includes(id)) {
      throw new Error("That skill is not unlocked.");
    }
  }
  player.skillLoadout = arr;
}

module.exports = {
  createPlayer,
  rollStats,
  publicPlayer,
  addXp,
  xpToNext,
  petXpToNext,
  addPetXp,
  onNewDay,
  randomInt,
  dealDamage,
  addShield,
  heal,
  loseLife,
  addItem,
  removeItem,
  hasItem,
  applyStatDelta,
  equipItem,
  unequipSlot,
  healForFood,
  eatFood,
  setSkillLoadout,
  learnTreeNode,
  ancestorsOf,
};
