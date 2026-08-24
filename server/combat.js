const {
  CONTENT,
  getDungeon,
  getDungeonSize,
  getSkill,
  getItem,
  getMonster,
  getClassBasicAttack,
} = require("../content");
const { dealDamage, heal, loseLife, addXp, removeItem, healForFood, addItem } = require("./players");
const chest = require("./chest");

function randVariance(variance) {
  return 1 + (Math.random() * 2 - 1) * variance;
}

function defaultEffectFor(elem) {
  if (elem === "arcane") return "arcane";
  if (elem === "holy") return "holy";
  if (elem === "shadow") return "shadow";
  return "slash";
}

function myDungeon(room, player) {
  // check normal dungeons first, then boss parties
  return (room.dungeons || []).find((d) => d.memberIds.includes(player.id)) || (room.bossParties||[]).find((d)=> d.memberIds.includes(player.id)) || null;
}
function isBossParty(d) { return !!(d && d.bossId); }

function livingMembers(room, d) {
  return (d.memberIds || [])
    .map((id) => room.players.find((p) => p.id === id))
    .filter((p) => p && p.hp > 0 && p.lives > 0);
}

function allMembers(room, d) {
  return (d.memberIds || [])
    .map((id) => room.players.find((p) => p.id === id))
    .filter(Boolean);
}

function currentPlayerName(room, d) {
  const p = room.players.find((q) => q.id === d.currentTurnId);
  return p ? p.name : "The party";
}

function clearTurnTimer(d) {
  if (d.turnTimer) {
    clearTimeout(d.turnTimer);
    d.turnTimer = null;
  }
}

function clearMonsterTimer(d) {
  if (d.monsterTimer) {
    clearTimeout(d.monsterTimer);
    d.monsterTimer = null;
  }
}

function addFx(d, evt) {
  if (!d.fx) d.fx = [];
  d.fx.push(evt);
}

function weightedPick(weights) {
  const entries = Object.entries(weights || {});
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Buffs/debuffs come from a skill's `buffs: [{ kind, value }]` array or the legacy
// single `defense: 0.x` field. `duration` controls how many rounds it lasts (default 1).
function buffEntries(skill) {
  if (Array.isArray(skill.buffs) && skill.buffs.length) return skill.buffs;
  if (skill.defense) return [{ kind: "defense", value: skill.defense }];
  return null;
}

function buffSum(d, targetType, targetId, kind) {
  if (!d.buffs) return 0;
  let sum = 0;
  for (const b of d.buffs) {
    if (b.targetType === targetType && b.targetId === targetId && b.kind === kind) sum += b.value;
  }
  return sum;
}

function applyBuffs(room, d, actor, actorName, skill, targetType, targetIds, actorIsPlayer) {
  const entries = buffEntries(skill);
  if (!entries || !entries.length) return;
  // Players may only debuff enemies — never buff them.
  const allowed = targetType === "monster" && actorIsPlayer
    ? new Set(["weaken", "expose", "dot"])
    : new Set(["attack", "defense", "regen", "weaken", "expose", "dot"]);
  const turns = Math.max(1, Math.round(skill.duration || 1));
  let applied = false;
  for (const tid of targetIds) {
    for (const e of entries) {
      if (!allowed.has(e.kind)) continue;
      d.buffId = (d.buffId || 0) + 1;
      d.buffs.push({
        uid: d.buffId,
        targetType,
        targetId: tid,
        kind: e.kind,
        value: e.value,
        turns,
        skillId: skill.id,
        sourceId: actor.id,
        name: skill.name,
      });
      addFx(d, {
        type: "buff",
        actor: actor.id,
        target: targetType === "player" ? "player" : "enemy",
        targetId: targetType === "player" ? tid : Number(tid),
        kind: e.kind,
        value: e.value,
        turns,
        skill: skill.id,
      });
      applied = true;
    }
  }
  if (applied && d.log) d.log.push(`${actorName} uses ${skill.name}.`);
}

function monsterSkills(mdef) {
  if (Array.isArray(mdef.skills) && mdef.skills.length) {
    return mdef.skills.map((id) => getSkill(id)).filter(Boolean);
  }
  // Auto-assign 3 exclusive skills so every monster has a kit. A monster with an
  // explicit `skills` array in content.js overrides this.
  const elem = mdef.element || "physical";
  const basicId =
    elem === "shadow" ? "monster_shadow_attack" : elem === "arcane" ? "monster_arcane_attack" : "monster_physical_attack";
  const h = hashString(mdef.id);
  const strongId =
    elem === "shadow" ? "monster_shadow_bolt" : elem === "arcane" ? "monster_arcane_storm" : "monster_heavy_blow";
  const selfBuffs = ["monster_frenzy", "monster_stoneskin", "monster_regen"];
  const debuffs = ["monster_weaken", "monster_vulnerable", "monster_poison"];
  const second = h % 2 === 0 ? strongId : selfBuffs[h % 3];
  const third = debuffs[(h >> 1) % 3];
  return [basicId, second, third].map((id) => getSkill(id)).filter(Boolean);
}

function pickMonsterSkill(mon) {
  const list = mon.skills && mon.skills.length
    ? mon.skills
    : [{ id: "auto_attack", name: "Attack", kind: "attack", power: 1, element: "physical" }];
  return list[Math.floor(Math.random() * list.length)];
}

function healMonster(mon, fraction) {
  const amt = Math.max(1, Math.round(mon.maxHp * (fraction || 0.1)));
  const healed = Math.min(mon.maxHp - mon.hp, amt);
  mon.hp += healed;
  return healed;
}

// Applied at the end of a round: DoT damage, regen healing, then expire expired buffs.
function tickBuffs(room, d) {
  if (!d.buffs || !d.buffs.length) return;
  for (const b of d.buffs) {
    if (b.kind === "dot") {
      if (b.targetType === "monster") {
        const mon = d.wave[b.targetId];
        if (mon && mon.hp > 0) {
          const dmg = Math.max(1, Math.round(mon.maxHp * b.value));
          mon.hp = Math.max(0, mon.hp - dmg);
          addFx(d, { type: "damage", target: "enemy", targetId: b.targetId, amount: dmg, source: "dot", effect: "dot" });
        }
      } else {
        const p = room.players.find((q) => q.id === b.targetId);
        if (p && p.hp > 0) {
          const dmg = Math.max(1, Math.round(p.maxHp * b.value));
          dealDamage(p, dmg);
          addFx(d, { type: "damage", actor: b.sourceId, target: "player", targetId: p.id, amount: dmg, source: "dot", effect: "dot" });
        }
      }
    } else if (b.kind === "regen") {
      if (b.targetType === "player") {
        const p = room.players.find((q) => q.id === b.targetId);
        if (p && p.hp > 0 && p.hp < p.maxHp) {
          const before = p.hp;
          heal(p, Math.max(1, Math.round(p.maxHp * b.value)));
          const healed = p.hp - before;
          if (healed > 0) addFx(d, { type: "heal", actor: p.id, target: "player", targetId: p.id, amount: healed, source: "regen", effect: "heal" });
        }
      } else {
        const mon = d.wave[b.targetId];
        if (mon && mon.hp > 0 && mon.hp < mon.maxHp) {
          const healed = Math.min(mon.maxHp - mon.hp, Math.max(1, Math.round(mon.maxHp * b.value)));
          mon.hp += healed;
          addFx(d, { type: "heal", actor: b.targetId, target: "enemy", targetId: b.targetId, amount: healed, source: "regen", effect: "heal" });
        }
      }
    }
  }
  d.buffs = d.buffs.filter((b) => --b.turns > 0);
}

function resetUsedSkills(d, playerId) {
  if (!d.usedSkills) d.usedSkills = {};
  d.usedSkills[playerId] = new Set();
}

function armTurnTimer(room, d) {
  clearTurnTimer(d);
  if (d.status !== "fighting" || d.phase !== "players" || !d.currentTurnId) return;
  d.turnTimer = setTimeout(() => {
    d.turnTimer = null;
    if (d.status !== "fighting") return;
    const asyncMonster = advanceTurn(room, d);
    if (!asyncMonster && typeof room.broadcast === "function") room.broadcast();
  }, CONTENT.combat.turnTimeoutMs);
}

function buildTurnOrder(room, d) {
  d.turnOrder = livingMembers(room, d)
    .sort((a, b) => b.speed - a.speed)
    .map((p) => p.id);
  d.turnIndex = 0;
  d.currentTurnId = d.turnOrder[0] || null;
  d.endedTurns = new Set();
  if (d.currentTurnId) resetUsedSkills(d, d.currentTurnId);
}

function floorCountFor(sizeId, total) {
  if (sizeId === "small") return 1;
  if (sizeId === "normal") return 3;
  if (sizeId === "big") return 3;
  if (sizeId === "huge") return 4;
  // fallback based on total
  return Math.min(4, Math.max(1, Math.ceil(total / 5)));
}
function buildWaveForFloor(def, size, power, floor, totalFloors, totalCount) {
  // Distribute totalCount across floors, max 5 per floor
  const base = Math.floor(totalCount / totalFloors);
  const rem = totalCount % totalFloors;
  let count = base + (floor <= rem ? 1 : 0);
  count = Math.min(5, Math.max(1, count));
  // For small dungeons total is small, so floor 1 gets all
  const wave = [];
  for (let i = 0; i < count; i++) {
    const m = getMonster(def.monsterPool[Math.floor(Math.random() * def.monsterPool.length)]);
    wave.push({
      id: `${m.id}_${floor}_${i}`,
      kind: m.id,
      name: m.name,
      image: m.image,
      element: m.element || "physical",
      hp: Math.max(1, Math.round(m.hp * power)),
      maxHp: Math.max(1, Math.round(m.hp * power)),
      attack: Math.max(1, Math.round(m.attack * power)),
      speed: m.speed,
      skills: monsterSkills(m),
    });
  }
  return wave;
}
function spawnWave(room, d) {
  const def = getDungeon(d.rank);
  const size = getDungeonSize(d.size);
  const fewer = def.sizeProfile === "fewerStronger";
  const countScale = fewer ? size.fewerCount : size.count;
  const totalCount = Math.max(1, Math.round(def.monsterCount * countScale));
  const power = def.monsterPower * size.power * (CONTENT.combat.monsterScale || 1);
  const totalFloors = floorCountFor(d.size, totalCount);

  d.totalFloors = totalFloors;
  d.floor = 1;
  d.totalCount = totalCount;
  d.power = power;
  d._defLabel = def.label;
  d._sizeLabel = size.label;

  const wave = buildWaveForFloor(def, size, power, 1, totalFloors, totalCount);

  d.wave = wave;
  d.round = 1;
  d.phase = "players";
  d.buffs = [];
  d.buffId = 0;
  d.endedTurns = new Set();
  d.result = null;
  d.status = "fighting";
  d.fx = [];
  d.usedSkills = {};
  d.monsterQueue = [];
  d.monsterTimer = null;
  for (const p of allMembers(room, d)) {
    p.hp = p.maxHp;
    p.mana = p.maxMana;
  }
  d.log = [`${def.label} ${size.label} — Floor 1/${totalFloors} — ${wave.length} foe${wave.length === 1 ? "" : "s"} bar the way.`];
  buildTurnOrder(room, d);
  d.log.push(`Round 1 — ${currentPlayerName(room, d)} moves first.`);
  armTurnTimer(room, d);
  return d;
}
function spawnNextFloor(room, d) {
  const def = getDungeon(d.rank);
  const size = getDungeonSize(d.size);
  d.floor += 1;
  const wave = buildWaveForFloor(def, size, d.power, d.floor, d.totalFloors, d.totalCount);
  d.wave = wave;
  d.round = 1;
  d.phase = "players";
  d.buffs = [];
  d.buffId = 0;
  d.endedTurns = new Set();
  d.usedSkills = {};
  d.monsterQueue = [];
  d.monsterTimer = null;
  // Keep hp/mana as is (persist across floors), but give small regen
  for (const p of allMembers(room, d)) {
    p.mana = Math.min(p.maxMana, p.mana + 5);
  }
  d.log.push(`Floor ${d.floor}/${d.totalFloors} — ${wave.length} foe${wave.length === 1 ? "" : "s"} appear!`);
  buildTurnOrder(room, d);
  d.log.push(`Round 1 — ${currentPlayerName(room, d)} moves first.`);
  armTurnTimer(room, d);
  if (typeof room.broadcast === "function") room.broadcast();
}

function resolveSkill(player, skillId) {
  const basic = getClassBasicAttack(player.character);
  if (basic && (basic.id === skillId || skillId === "auto_attack")) {
    return { ...basic, target: "enemy", mana: 0 };
  }
  if (!player.skillLoadout.includes(skillId)) return null;
  return getSkill(skillId);
}

function act(room, player, skillId, targetId) {
  const d = myDungeon(room, player);
  if (!d || d.status !== "fighting") {
    throw new Error("No combat in progress.");
  }
  if (d.phase !== "players") {
    throw new Error("The monsters are acting.");
  }
  if (d.currentTurnId !== player.id) {
    throw new Error("It is not your turn.");
  }
  if (player.hp <= 0) {
    throw new Error("You are down.");
  }
  const skill = resolveSkill(player, skillId);
  if (!skill) {
    throw new Error("Unknown skill.");
  }
  const mana = skill.mana || 0;
  const used = (d.usedSkills && d.usedSkills[player.id]) || new Set();
  if (used.has(skillId)) {
    throw new Error("That skill is spent for this turn.");
  }
  if (player.mana < mana) {
    throw new Error("Not enough mana.");
  }
  if (skill.target === "enemy") {
    const mon = d.wave[Number(targetId)];
    if (!mon || mon.hp <= 0) {
      throw new Error("Choose a living monster.");
    }
  } else if (skill.target === "ally") {
    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      throw new Error("Choose an ally to heal.");
    }
  }

  player.mana -= mana;
  used.add(skillId);
  d.usedSkills[player.id] = used;
  if (mana > 0) addFx(d, { type: "mana", actor: player.id, amount: mana, skill: skill.id });
  if (skill.target === "enemy") {
    const mon = d.wave[Number(targetId)];
    if (skill.power) {
      const critChance = player.critChance != null ? player.critChance / 100 : (CONTENT.combat.critChance || 0);
      const critBonus = player.critDamage != null ? player.critDamage : Math.round(((CONTENT.combat.critMult || 1.5) - 1) * 100);
      const crit = Math.random() < critChance;
      const critMult = crit ? 1 + critBonus / 100 : 1;
      const pAtk = buffSum(d, "player", player.id, "attack") - buffSum(d, "player", player.id, "weaken");
      const mDef = buffSum(d, "monster", Number(targetId), "defense");
      const mExp = buffSum(d, "monster", Number(targetId), "expose");
      const dmg = Math.max(
        1,
        Math.round(player.attack * skill.power * randVariance(CONTENT.combat.damageVariance) * critMult * (1 + pAtk) * (1 - mDef + mExp))
      );
      dealDamage(mon, dmg);
      addFx(d, { type: "damage", actor: player.id, target: "enemy", targetId: Number(targetId), amount: dmg, skill: skill.id, elem: skill.element || "physical", effect: skill.effect || defaultEffectFor(skill.element), crit });
      if (skill.lifesteal) {
        const before = player.hp;
        const amt = Math.max(1, Math.round(dmg * skill.lifesteal));
        heal(player, amt);
        const healed = player.hp - before;
        if (healed > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "lifesteal", skill: skill.id, effect: "heal" });
      }
      if (skill.healSelfPct) {
        const before = player.hp;
        const amt = Math.max(1, Math.round(player.maxHp * skill.healSelfPct));
        heal(player, amt);
        const healed = player.hp - before;
        if (healed > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
      }
      // Omnivamp: heals % of all damage dealt, stacks (e.g., 5% ring +10% stone =15%)
      if (player.omnivamp && dmg > 0) {
        const pct = (player.omnivamp || 0) / 100;
        if (pct > 0) {
          const before = player.hp;
          const omniAmt = Math.max(1, Math.round(dmg * pct));
          heal(player, omniAmt);
          const healedOmni = player.hp - before;
          if (healedOmni > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healedOmni, source: "omnivamp", skill: skill.id, effect: "heal" });
        }
      }
    }
    applyBuffs(room, d, player, player.name, skill, "monster", [Number(targetId)], true);
  } else if (skill.target === "self") {
    applyBuffs(room, d, player, player.name, skill, "player", [player.id], true);
  } else if (skill.target === "ally") {
    const target = room.players.find((p) => p.id === targetId);
    if (target) {
      if (target.hp > 0) {
        const mult = 1 + (player.healPower || 0) / 40;
        const healed = heal(target, Math.max(1, Math.round(target.maxHp * skill.heal * mult)));
        addFx(d, { type: "heal", actor: player.id, target: target.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
      }
      applyBuffs(room, d, player, player.name, skill, "player", [target.id], true);
    }
  } else if (skill.target === "party") {
    for (const p of livingMembers(room, d)) {
      if (skill.heal) {
        const mult = 1 + (player.healPower || 0) / 40;
        const healed = heal(p, Math.max(1, Math.round(p.maxHp * skill.heal * mult)));
        addFx(d, { type: "heal", actor: player.id, target: p.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
      }
    }
    applyBuffs(room, d, player, player.name, skill, "player", livingMembers(room, d).map((p) => p.id), true);
  }

  if (skill.manaRestore || skill.manaRestorePct) {
    const restoreTo = skill.target === "party" ? livingMembers(room, d) : [player];
    for (const p of restoreTo) {
      const amount = Math.round((skill.manaRestorePct || 0) * p.maxMana + (skill.manaRestore || 0));
      const gained = Math.min(p.maxMana, p.mana + amount) - p.mana;
      if (gained > 0) {
        p.mana += gained;
        addFx(d, { type: "mana", actor: p.id, amount: gained, skill: skill.id, restore: true });
      }
    }
  }

  armTurnTimer(room, d);
  checkEnd(room, d);
  return d;
}

function useItem(room, player, itemId) {
  const d = myDungeon(room, player);
  if (!d || d.status !== "fighting") {
    throw new Error("No combat in progress.");
  }
  if (d.phase !== "players") {
    throw new Error("The monsters are acting.");
  }
  if (d.currentTurnId !== player.id) {
    throw new Error("It is not your turn.");
  }
  if (player.hp <= 0) {
    throw new Error("You are down.");
  }
  if (itemId === "food") {
    if (player.food < 1) {
      throw new Error("You have no food.");
    }
    player.food -= 1;
    const healed = heal(player, healForFood(player));
    addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "food", effect: "heal" });
  } else {
    const item = getItem(itemId);
    if (!item || item.slot !== "consumable") {
      throw new Error("Unknown consumable.");
    }
    removeItem(player, itemId, 1);
    const healed = heal(player, item.heal || 0);
    addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "item", item: item.id, effect: "heal" });
  }
  armTurnTimer(room, d);
  checkEnd(room, d);
  return d;
}

function endTurn(room, player) {
  const d = myDungeon(room, player);
  if (!d || d.status !== "fighting") {
    throw new Error("No combat in progress.");
  }
  if (d.phase !== "players") {
    throw new Error("The monsters are acting.");
  }
  if (d.currentTurnId !== player.id) {
    throw new Error("It is not your turn.");
  }
  if (player.hp <= 0) {
    throw new Error("You are down.");
  }
  return advanceTurn(room, d);
}

function advanceTurn(room, d) {
  clearTurnTimer(d);
  // mark current as done
  if (d.currentTurnId) d.endedTurns.add(d.currentTurnId);
  // find next player in order who hasn't ended turn yet
  // use index-based progression but also handle fled players
  d.turnIndex += 1;
  // skip any ids that are no longer in turnOrder (fled) or already ended
  while (d.turnIndex < d.turnOrder.length && d.endedTurns.has(d.turnOrder[d.turnIndex])) {
    d.turnIndex += 1;
  }
  if (d.turnIndex < d.turnOrder.length) {
    d.currentTurnId = d.turnOrder[d.turnIndex];
    resetUsedSkills(d, d.currentTurnId);
    armTurnTimer(room, d);
    return false;
  }
  // all players acted -> monsters
  // safety: ensure everyone in turnOrder is counted as ended
  if (d.endedTurns.size < d.turnOrder.length) {
    // still someone left (race), find them
    const remaining = d.turnOrder.find((id) => !d.endedTurns.has(id));
    if (remaining) {
      d.currentTurnId = remaining;
      d.turnIndex = d.turnOrder.indexOf(remaining);
      resetUsedSkills(d, remaining);
      armTurnTimer(room, d);
      return false;
    }
  }
  startMonsterPhase(room, d);
  return true;
}

function startMonsterPhase(room, d) {
  if (d.status !== "fighting") return;
  d.phase = "monsters";
  d.currentTurnId = null;
  clearTurnTimer(d);
  d.monsterQueue = d.wave
    .map((mon, index) => ({ mon, index }))
    .filter((x) => x.mon.hp > 0);
  clearMonsterTimer(d);
  d.monsterTimer = setTimeout(() => runNextMonster(room, d), 0);
}

function runNextMonster(room, d) {
  if (d.status !== "fighting" || d.phase !== "monsters") return;
  d.monsterTimer = null;
  if (livingMembers(room, d).length === 0 || (d.monsterQueue || []).length === 0) {
    finishMonsterPhase(room, d);
    return;
  }
  const { mon, index } = d.monsterQueue.shift();
  if (mon.hp > 0) {
    const skill = pickMonsterSkill(mon);
    const targets = livingMembers(room, d);
    const target = targets[Math.floor(Math.random() * targets.length)];
    const combat = CONTENT.combat;
    if (skill.kind === "heal") {
      const healed = healMonster(mon, skill.amount);
      if (healed > 0) {
        addFx(d, { type: "heal", actor: index, target: "enemy", targetId: index, amount: healed, source: "monster", effect: "heal" });
        d.log.push(`${mon.name} uses ${skill.name} and recovers ${healed} HP.`);
      }
    } else if (skill.kind === "buff") {
      applyBuffs(room, d, { id: "monster_" + index }, mon.name, skill, "monster", [index], false);
    } else if (skill.kind === "debuff") {
      if (target) {
        applyBuffs(room, d, { id: "monster_" + index }, mon.name, skill, "player", [target.id], false);
      }
    } else {
      if (target) {
        const crit = Math.random() < (combat.critChance || 0);
        const critMult = crit ? combat.critMult || 1.5 : 1;
        const mAtk = buffSum(d, "monster", index, "attack") - buffSum(d, "monster", index, "weaken");
        const pDef = buffSum(d, "player", target.id, "defense");
        const pExp = buffSum(d, "player", target.id, "expose");
        let dmg = Math.round(
          mon.attack * (skill.power || 1) * randVariance(combat.damageVariance) * critMult * (1 + mAtk) * (1 - pDef + pExp)
        );
        dmg -= Math.round(target.resistance * combat.resistanceMitigation);
        dmg = Math.max(1, dmg);
        dealDamage(target, dmg);
        addFx(d, { type: "damage", actor: target.id, target: "player", targetId: target.id, amount: dmg, source: "monster", monster: mon.kind, elem: skill.element || mon.element || "physical", effect: "monster", crit });
      }
    }
    if (typeof room.broadcast === "function") room.broadcast();
    if (livingMembers(room, d).length === 0) {
      clearMonsterTimer(d);
      defeat(room, d);
      if (typeof room.broadcast === "function") room.broadcast();
      return;
    }
  }
  if (d.status !== "fighting" || d.phase !== "monsters") return;
  clearMonsterTimer(d);
  d.monsterTimer = setTimeout(() => runNextMonster(room, d), CONTENT.combat.monsterAttackDelayMs || 900);
}

function finishMonsterPhase(room, d) {
  clearMonsterTimer(d);
  d.monsterQueue = [];
  if (d.status !== "fighting") return;
  if (livingMembers(room, d).length === 0) {
    defeat(room, d);
    if (typeof room.broadcast === "function") room.broadcast();
    return;
  }
  tickBuffs(room, d);
  checkEnd(room, d); // a DoT tick may have finished the last monster
  if (d.status !== "fighting") return;
  d.round += 1;
  d.phase = "players";
  buildTurnOrder(room, d);
  for (const p of allMembers(room, d)) {
    const regen = p.manaRegen || CONTENT.combat.manaRegenPerRound || 3;
    p.mana = Math.min(p.maxMana, p.mana + regen);
  }
  d.log.push(`Round ${d.round} — ${currentPlayerName(room, d)} moves first.`);
  armTurnTimer(room, d);
  if (typeof room.broadcast === "function") room.broadcast();
}

function checkEnd(room, d) {
  if (d.status !== "fighting") return;
  const aliveMonsters = d.wave.filter((m) => m.hp > 0);
  if (aliveMonsters.length === 0) {
    if (d.totalFloors && d.floor < d.totalFloors) {
      // Next floor, not victory yet
      // Small delay before next floor for FX
      clearTurnTimer(d);
      clearMonsterTimer(d);
      d.log.push(`Floor ${d.floor} cleared!`);
      addFx(d, { type: "floor", floor: d.floor, total: d.totalFloors });
      // slight pause then spawn
      setTimeout(() => {
        if (d.status !== "fighting") return;
        spawnNextFloor(room, d);
      }, 900);
      if (typeof room.broadcast === "function") room.broadcast();
      return;
    }
    victory(room, d);
  } else if (livingMembers(room, d).length === 0) {
    defeat(room, d);
  }
}

function xpRangeForRank(rank) {
  const map = {
    f: [80, 120],
    d: [110, 160],
    c: [150, 210],
    b: [200, 280],
    a: [280, 380],
    s: [380, 520],
    ss: [500, 700],
    ssplus: [650, 900],
    fast: [60, 90],
  };
  return map[rank] || [80, 120];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function victory(room, d) {
  clearTurnTimer(d);
  clearMonsterTimer(d);
  // Boss party victory: handle separately
  if (isBossParty(d)) {
    const bossDef = (CONTENT.bosses||[]).find(b=>b.id===d.bossId);
    const members = allMembers(room, d);
    const gold = 150 + Math.floor(Math.random()*80);
    const wood = 40 + Math.floor(Math.random()*20);
    const xp = 400 + Math.floor(Math.random()*200);
    for (const p of members) {
      p.gold += gold; p.wood+=wood; addXp(p,xp);
      if (!p.bossKills) p.bossKills=[];
      if (!p.bossKills.includes(d.bossId)) p.bossKills.push(d.bossId);
      p.hp = Math.max(1, p.hp);
    }
    // 50% weapon drop
    const lootNotes=[];
    if (Math.random() < 0.5 && bossDef && bossDef.weaponId) {
      const w = getItem(bossDef.weaponId);
      if (w) {
        const recv = members[Math.floor(Math.random()*members.length)];
        addItem(recv, w.id,1);
        lootNotes.push(`${recv.name} found ${w.name}!`);
      }
    }
    // Boss chest (good rates, rare+ guaranteed)
    const chestId = bossDef ? bossDef.chestId : "boss_chest_ember";
    const chestDef = getItem(chestId);
    if (chestId) {
      for (const p of members) addItem(p, chestId,1);
    }
    addFx(d,{type:"chest"});
    d.status="done";
    d.result={ outcome:"victory", text:`Victory over ${bossDef?bossDef.label:"Boss"}! Each gains ${gold} gold, ${wood} wood, ${xp} XP. ${chestDef?chestDef.name:"Chest"} awarded!` };
    if (lootNotes.length){ d.result.text+=" "+lootNotes.join(" "); d.log.push(...lootNotes); addFx(d,{type:"loot"}); }
    // Mark boss party as done but keep for return
    addFx(d,{type:"result", outcome:"victory"});
    d.log.push(d.result.text);
    return;
  }
  const def = getDungeon(d.rank);
  const size = getDungeonSize(d.size);
  const members = allMembers(room, d);

  const gold = Math.round(def.goldBase * size.goldScale);
  const wood = Math.round(def.woodBase * size.woodScale);
  // XP now per killed monster: F 80-120, scaling with size and rank
  const killed = d.wave.filter((m) => m.hp <= 0).length || d.wave.length;
  const [xpMin, xpMax] = xpRangeForRank(d.rank);
  let xp = 0;
  for (let i = 0; i < killed; i++) {
    xp += Math.round(randInt(xpMin, xpMax) * (size.xpScale || 1));
  }
  // fallback if somehow killed 0
  if (xp <= 0) xp = Math.round(randInt(xpMin, xpMax) * (size.xpScale || 1));

  for (const p of members) {
    p.gold += gold;
    p.wood += wood;
    addXp(p, xp);
    if (p.hp <= 0) {
      loseLife(p);
      p.hp = p.maxHp;
    } else {
      p.hp = Math.max(1, p.hp);
    }
  }

  const lootNotes = [];
  // Special dungeons: drop crafting materials instead of random gear
  if (def.isSpecial && Array.isArray(def.materialPool) && def.materialPool.length) {
    for (const mon of d.wave) {
      if (mon.hp > 0) continue;
      const count = 1 + (Math.random() < 0.4 ? 1 : 0); // 1-2 materials per kill
      for (let k = 0; k < count; k++) {
        const matId = def.materialPool[Math.floor(Math.random() * def.materialPool.length)];
        const mat = getItem(matId);
        if (!mat) continue;
        const receivers = livingMembers(room, d).length ? livingMembers(room, d) : members;
        const receiver = receivers[Math.floor(Math.random() * receivers.length)];
        addItem(receiver, mat.id, 1);
        lootNotes.push(`${receiver.name} found ${mat.name}.`);
      }
    }
  } else {
    for (const mon of d.wave) {
      if (mon.hp > 0) continue;
      const mdef = getMonster(mon.kind);
      if (!mdef) continue;
      const dropChance = (CONTENT.loot && CONTENT.loot.dropChance) || {};
      if (Math.random() >= (dropChance[mdef.rarity] || 0)) continue;
      const weights = ((CONTENT.loot || {}).gradeWeights || {})[d.rank] || CONTENT.loot.gradeWeights.f;
      const rarity = weightedPick(weights);
      if (!rarity) continue;
      // Exclude craft-only, chests, materials, bossWeapons — craftables/boss only via temple/boss
      const pool = CONTENT.items.filter((i) => i.rarity === rarity && i.slot !== "consumable" && i.slot !== "chest" && i.slot !== "material" && !i.craftOnly && !i.bossWeapon);
      if (!pool.length) continue;
      const item = pool[Math.floor(Math.random() * pool.length)];
      const receivers = livingMembers(room, d).length ? livingMembers(room, d) : members;
      const receiver = receivers[Math.floor(Math.random() * receivers.length)];
      addItem(receiver, item.id, 1);
      const rarityMeta = ((CONTENT.loot || {}).rarityMeta || {})[rarity];
      const rarityLabel = (rarityMeta && rarityMeta.label) || rarity;
      lootNotes.push(`${receiver.name} found a ${rarityLabel} ${item.name}.`);
    }
  }

  const chestId = chest.chestForRank(d.rank);
  const chestDef = getItem(chestId);
  chest.awardToMembers(room, d, chestId);
  addFx(d, { type: "chest" });

  d.status = "done";
  d.result = {
    outcome: "victory",
    text: `Victory! The ${def.label} is clear. Each adventurer gains ${gold} gold, ${wood} wood, ${xp} XP. Each adventurer finds a ${chestDef ? chestDef.name : "Chest"}!`,
  };
  if (lootNotes.length) {
    d.result.text += " " + lootNotes.join(" ");
    d.log.push(...lootNotes);
    addFx(d, { type: "loot" });
  }
  addFx(d, { type: "result", outcome: "victory" });
  d.log.push(d.result.text);
}

function defeat(room, d) {
  clearTurnTimer(d);
  clearMonsterTimer(d);
  const members = allMembers(room, d);
  for (const p of members) {
    loseLife(p);
    p.hp = p.maxHp;
  }
  d.status = "done";
  d.result = {
    outcome: "defeat",
    text: "Defeat... the party is routed. Each adventurer loses 1 life.",
  };
  addFx(d, { type: "result", outcome: "defeat" });
  d.log.push(d.result.text);
}

function flee(room, player) {
  const d = myDungeon(room, player);
  if (!d || d.status !== "fighting") {
    throw new Error("No combat in progress.");
  }
  if (player.hp <= 0) {
    throw new Error("You are down.");
  }
  // HP threshold 20%
  const pct = player.maxHp > 0 ? player.hp / player.maxHp : 0;
  if (pct < 0.2) {
    throw new Error("You are too injured to flee!");
  }
  if (d.phase !== "players") {
    throw new Error("You cannot flee while monsters are acting.");
  }
  if (d.currentTurnId !== player.id) {
    throw new Error("It is not your turn.");
  }
  clearTurnTimer(d);
  // Remove fleeing player from dungeon
  d.memberIds = (d.memberIds || []).filter((id) => id !== player.id);
  player.dungeonId = null;
  // restore health/mana to full (no penalty for fleeing)
  player.hp = player.maxHp;
  player.mana = player.maxMana;
  // clean buffs targeting this player
  if (d.buffs) d.buffs = d.buffs.filter((b) => !(b.targetType === "player" && String(b.targetId) === String(player.id)));
  if (d.usedSkills && d.usedSkills[player.id]) delete d.usedSkills[player.id];
  if (d.endedTurns && d.endedTurns.delete) d.endedTurns.delete(player.id);
  // fix turn order
  const oldIndex = (d.turnOrder || []).indexOf(player.id);
  d.turnOrder = (d.turnOrder || []).filter((id) => id !== player.id);
  d.fx = d.fx || [];
  addFx(d, { type: "flee", actor: player.id });
  d.log.push(`${player.name} flees from combat!`);

  if (d.memberIds.length === 0) {
    clearMonsterTimer(d);
    // no one left – remove dungeon entirely
    if (room.dungeons) {
      room.dungeons = room.dungeons.filter((x) => x !== d);
    }
    return null;
  }
  if (d.leaderId === player.id) {
    d.leaderId = d.memberIds[0];
  }
  // If there are no living members left, end as defeat
  if (livingMembers(room, d).length === 0) {
    defeat(room, d);
    return d;
  }
  // Advance turn logic after flee
  if (oldIndex !== -1) {
    if (oldIndex < d.turnIndex) {
      d.turnIndex = Math.max(0, d.turnIndex - 1);
    } else if (oldIndex === d.turnIndex) {
      // fleeing player was current – move to next
      if (d.turnIndex >= d.turnOrder.length) {
        // end of round – monsters turn
        startMonsterPhase(room, d);
        return d;
      } else {
        d.currentTurnId = d.turnOrder[d.turnIndex] || null;
        if (d.currentTurnId) {
          if (!d.usedSkills) d.usedSkills = {};
          if (!d.usedSkills[d.currentTurnId]) d.usedSkills[d.currentTurnId] = new Set();
          armTurnTimer(room, d);
        }
        return d;
      }
    }
  }
  // if fleeing player was not current, keep current turn
  if (d.currentTurnId && !d.turnOrder.includes(d.currentTurnId)) {
    // current player was removed (should not happen except oldIndex case above)
    if (d.turnOrder.length) {
      d.currentTurnId = d.turnOrder[d.turnIndex] || d.turnOrder[0];
      armTurnTimer(room, d);
    } else {
      startMonsterPhase(room, d);
    }
  } else if (d.currentTurnId) {
    armTurnTimer(room, d);
  }
  // check if all remaining players have ended turn -> monster phase
  if (d.turnOrder.length && d.endedTurns && d.endedTurns.size >= d.turnOrder.length) {
    startMonsterPhase(room, d);
  }
  return d;
}

module.exports = {
  spawnWave,
  act,
  useItem,
  endTurn,
  flee,
  armTurnTimer,
  clearTurnTimer,
};
