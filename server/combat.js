const {
  CONTENT,
  getDungeon,
  getDungeonSize,
  getSkill,
  getItem,
  getMonster,
  getClassBasicAttack,
} = require("../content");
const { dealDamage, addShield, heal, loseLife, addXp, addPetXp, removeItem, healForFood, addItem } = require("./players");
const chest = require("./chest");

function randVariance(variance) {
  return 1 + (Math.random() * 2 - 1) * variance;
}

function defaultEffectFor(elem) {
  const id = elem || "physical";
  const el = (CONTENT.elements || []).find((e) => e.id === id);
  return (el && el.effect) || "element_" + id;
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
  if (d.monsterWatchdog) {
    clearTimeout(d.monsterWatchdog);
    d.monsterWatchdog = null;
  }
}

// Safety net: if the monster phase somehow loses its chain (e.g. a member
// disconnected/left while the monsters were acting and their handler cleared
// the pending monster timer), restart the queue so combat can never wedge at
// "the monsters are acting…". Also re-arms from startMonsterPhase as a watchdog.
function resumeMonsterPhase(room, d) {
  if (!d || d.status !== "fighting" || d.phase !== "monsters") return;
  if (d.monsterTimer) return; // already progressing
  if (livingMembers(room, d).length === 0) {
    finishMonsterPhase(room, d);
    return;
  }
  d.monsterQueue = (d.monsterQueue || []).filter((x) => x.mon && x.mon.hp > 0);
  if (d.monsterQueue.length === 0) {
    // queue drained while wave still alive (stale state) — rebuild from the wave
    d.monsterQueue = d.wave.map((mon, index) => ({ mon, index })).filter((x) => x.mon && x.mon.hp > 0);
  }
  if (d.monsterQueue.length === 0) {
    finishMonsterPhase(room, d);
    return;
  }
  d.monsterTimer = setTimeout(() => runNextMonster(room, d), CONTENT.combat.monsterAttackDelayMs || 900);
}

function armMonsterWatchdog(room, d) {
  if (d.monsterWatchdog) {
    clearTimeout(d.monsterWatchdog);
    d.monsterWatchdog = null;
  }
  const alive = (d.wave || []).filter((m) => m.hp > 0).length;
  const perAttack = CONTENT.combat.monsterAttackDelayMs || 900;
  d.monsterWatchdog = setTimeout(() => {
    d.monsterWatchdog = null;
    resumeMonsterPhase(room, d);
  }, perAttack * Math.max(2, alive + 2) + 1500);
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

function hasStatus(d, targetType, targetId, kind) {
  if (!d.buffs) return false;
  return d.buffs.some((b) => b.targetType === targetType && String(b.targetId) === String(targetId) && b.kind === kind);
}

function applyBuffs(room, d, actor, actorName, skill, targetType, targetIds, actorIsPlayer) {
  const entries = buffEntries(skill);
  if (!entries || !entries.length) return;
  // Players may only debuff enemies — never buff them.
  const allowed = targetType === "monster" && actorIsPlayer
    ? new Set(["weaken", "expose", "dot", "wet", "frozen"])
    : new Set(["attack", "defense", "regen", "weaken", "expose", "dot", "wet", "frozen", "shield", "magicBoost"]);
  const turns = Math.max(1, Math.round(skill.duration || 1));
  let applied = false;
  for (const tid of targetIds) {
    for (const e of entries) {
      if (!allowed.has(e.kind)) continue;
      // physical never leaves wet/frozen
      if (actorIsPlayer && skill.element === "physical" && (e.kind === "wet" || e.kind === "frozen")) continue;
      // shield is flat HP, apply immediately
      if (e.kind === "shield") {
        if (targetType === "player") {
          const target = room.players.find((p) => p.id === tid);
          if (target) addShield(target, e.value);
        } else {
          const mon = d.wave[tid];
          if (mon) { mon.shield = (mon.shield || 0) + e.value; mon.maxShield = Math.max(mon.maxShield || 0, mon.shield); }
        }
      }
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
          if (mon.hp <= 0) {
            // clean buffs targeting dead monster to prevent stale debuffs
            d.buffs = d.buffs.filter((x) => !(x.targetType === "monster" && Number(x.targetId) === Number(b.targetId)));
          }
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

function schedulePetAct(room, d, playerId){
  const player = room.players.find(p=>p.id===playerId);
  if(!player || !d || d.status!=="fighting" || d.phase!=="players") return;
  if(player.petTurn==null) player.petTurn=0;
  player.petTurn += 1;
  setTimeout(()=>{
    if(d.status!=="fighting" || d.phase!=="players" || d.currentTurnId!==playerId) return;
    petActForPlayer(room,d,player);
  }, 400);
}
function buildTurnOrder(room, d) {
  d.turnOrder = livingMembers(room, d)
    .sort((a, b) => b.speed - a.speed)
    .map((p) => p.id);
  d.turnIndex = 0;
  d.currentTurnId = d.turnOrder[0] || null;
  d.endedTurns = new Set();
  if (d.currentTurnId) {
    resetUsedSkills(d, d.currentTurnId);
    schedulePetAct(room, d, d.currentTurnId);
  }
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
  d._floorTransition = false;
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
      const pAtk = buffSum(d, "player", player.id, "attack") + buffSum(d, "player", player.id, "pet_attack") - buffSum(d, "player", player.id, "weaken") - buffSum(d, "player", player.id, "pet_weaken");
      const pMagic = buffSum(d, "player", player.id, "magicBoost") + buffSum(d, "player", player.id, "pet_magic") - buffSum(d, "player", player.id, "weaken") - buffSum(d, "player", player.id, "pet_weaken");
      const mDef = buffSum(d, "monster", Number(targetId), "defense") + buffSum(d, "monster", Number(targetId), "pet_defense");
      const mExp = buffSum(d, "monster", Number(targetId), "expose") + buffSum(d, "monster", Number(targetId), "pet_expose");
      const isPhysical = !skill.element || skill.element === "physical";
      const baseStat = isPhysical ? player.attack : player.magicPower;
      const pBoost = isPhysical ? pAtk : pMagic;
      let dmg = Math.max(
        1,
        Math.round(baseStat * skill.power * randVariance(CONTENT.combat.damageVariance) * critMult * (1 + pBoost) * (1 - mDef + mExp))
      );
      // affinity: defender element vs attacker element
      const monDefForAff = getMonster(mon.kind);
      const defenderElem = (monDefForAff && monDefForAff.element) || mon.element || "physical";
      const affinity = CONTENT.affinity && CONTENT.affinity[defenderElem] && CONTENT.affinity[defenderElem][skill.element];
      if (affinity) dmg = Math.round(dmg * affinity);
      // dark trait: dark deals 30% more, dark takes 50% more
      if (skill.element === "dark" && CONTENT.darkTrait) dmg = Math.round(dmg * (CONTENT.darkTrait.deal || 1.3));
      if (defenderElem === "dark" && CONTENT.darkTrait) dmg = Math.round(dmg * (CONTENT.darkTrait.taken || 1.5));
      // combos: data-driven element-matchup bonuses (see CONTENT.combos),
      // e.g. lightning vs wet ("Overcharge"), physical vs frozen ("Shatter")
      if (Array.isArray(CONTENT.combos)) {
        for (const c of CONTENT.combos) {
          if (!c || !c.when || !c.mult) continue;
          if (c.ifElement && c.ifElement !== skill.element) continue;
          if (hasStatus(d, "monster", Number(targetId), c.when)) {
            dmg = Math.round(dmg * c.mult);
          }
        }
      }
      // bonus vs frozen etc (generic)
      if (skill.bonusVsStatus && hasStatus(d, "monster", Number(targetId), skill.bonusVsStatus.status)) {
        dmg = Math.round(dmg * (1 + (skill.bonusVsStatus.mult || 0)));
      }
      dealDamage(mon, dmg);
      addFx(d, { type: "damage", actor: player.id, target: "enemy", targetId: Number(targetId), amount: dmg, skill: skill.id, elem: skill.element || "physical", effect: skill.effect || defaultEffectFor(skill.element), sound: skill.sound || "", crit });
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
      if (target.hp > 0 && skill.heal != null) {
        const healMult = 1 + (player.healPower || 0) / 50;
        let baseHeal;
        if (typeof skill.heal === "object") {
          const stat = skill.heal.stat || "maxHp";
          const m = skill.heal.mult || 1;
          const baseVal = stat === "maxHp" ? target.maxHp : player[stat] || 0;
          baseHeal = baseVal * m;
        } else {
          baseHeal = target.maxHp * skill.heal;
        }
        const healed = heal(target, Math.max(1, Math.round(baseHeal * healMult)));
        addFx(d, { type: "heal", actor: player.id, target: target.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
      }
      applyBuffs(room, d, player, player.name, skill, "player", [target.id], true);
    }
  } else if (skill.target === "party") {
    for (const p of livingMembers(room, d)) {
      if (skill.heal != null) {
        const healMult = 1 + (player.healPower || 0) / 50;
        let baseHeal;
        if (typeof skill.heal === "object") {
          const stat = skill.heal.stat || "maxHp";
          const m = skill.heal.mult || 1;
          const baseVal = stat === "maxHp" ? p.maxHp : player[stat] || 0;
          baseHeal = baseVal * m;
        } else {
          baseHeal = p.maxHp * skill.heal;
        }
        const healed = heal(p, Math.max(1, Math.round(baseHeal * healMult)));
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

  // if monster died, clear stale buffs targeting it
  if (skill.target === "enemy") {
    const mon = d.wave[Number(targetId)];
    if (mon && mon.hp <= 0) {
      d.buffs = (d.buffs || []).filter((b) => !(b.targetType === "monster" && Number(b.targetId) === Number(targetId)));
    }
  }

  checkEnd(room, d);
  // only arm timer if still in player phase (checkEnd may have started floor transition)
  if (d.status === "fighting" && d.phase === "players" && !d._floorTransition) {
    armTurnTimer(room, d);
  }
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
  checkEnd(room, d);
  if (d.status === "fighting" && d.phase === "players" && !d._floorTransition) {
    armTurnTimer(room, d);
  }
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
  // guard: if already in monsters phase or no order, go to monsters
  if (d.phase === "monsters") return true;
  if (!d.turnOrder || d.turnOrder.length === 0) {
    startMonsterPhase(room, d);
    return true;
  }
  // mark current as done
  if (d.currentTurnId) d.endedTurns.add(d.currentTurnId);
  // find next player in order who hasn't ended turn yet
  d.turnIndex += 1;
  while (d.turnIndex < d.turnOrder.length && d.endedTurns.has(d.turnOrder[d.turnIndex])) {
    d.turnIndex += 1;
  }
  if (d.turnIndex < d.turnOrder.length) {
    d.currentTurnId = d.turnOrder[d.turnIndex];
    resetUsedSkills(d, d.currentTurnId);
    armTurnTimer(room, d);
    schedulePetAct(room, d, d.currentTurnId);
    return false;
  }
  if (d.endedTurns.size < d.turnOrder.length) {
    const remaining = d.turnOrder.find((id) => !d.endedTurns.has(id));
    if (remaining) {
      d.currentTurnId = remaining;
      d.turnIndex = d.turnOrder.indexOf(remaining);
      resetUsedSkills(d, remaining);
      armTurnTimer(room, d);
      schedulePetAct(room, d, remaining);
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
  armMonsterWatchdog(room, d);
}

function runNextMonster(room, d) {
  try {
    if (d.status !== "fighting" || d.phase !== "monsters") return;
    d.monsterTimer = null;
    // filter dead monsters that may have died from DoT or prior kill
    d.monsterQueue = (d.monsterQueue || []).filter((x) => x.mon && x.mon.hp > 0);
    if (livingMembers(room, d).length === 0 || d.monsterQueue.length === 0) {
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
          const eff = skill.effect || defaultEffectFor(skill.element || mon.element);
          dealDamage(target, dmg);
          addFx(d, { type: "damage", actor: target.id, target: "player", targetId: target.id, amount: dmg, source: "monster", monster: mon.kind, elem: skill.element || mon.element || "physical", effect: eff, sound: skill.sound || "", crit });
        }
      }
      // ensure fx/broadcast even if room.broadcast not set (fallback)
      if (typeof room.broadcast === "function") room.broadcast();
      else if (room._emitCombat) room._emitCombat();
      if (livingMembers(room, d).length === 0) {
        clearMonsterTimer(d);
        defeat(room, d);
        if (typeof room.broadcast === "function") room.broadcast();
        else if (room._emitCombat) room._emitCombat();
        return;
      }
    } else {
      // dead monster was queued but died before its turn — skip silently
      if (typeof room.broadcast === "function") room.broadcast();
    }
    if (d.status !== "fighting" || d.phase !== "monsters") return;
    // filter again before scheduling next
    d.monsterQueue = (d.monsterQueue || []).filter((x) => x.mon && x.mon.hp > 0);
    if (d.monsterQueue.length === 0) {
      finishMonsterPhase(room, d);
      return;
    }
    clearMonsterTimer(d);
    d.monsterTimer = setTimeout(() => runNextMonster(room, d), CONTENT.combat.monsterAttackDelayMs || 900);
    armMonsterWatchdog(room, d);
  } catch (err) {
    // Never let an unexpected error permanently wedge the "monsters are acting" phase.
    console.error("[runNextMonster] error:", err && err.stack || err);
    try {
      finishMonsterPhase(room, d);
    } catch (e) {
      console.error("[runNextMonster] finish recovery error:", e);
    }
    if (typeof room.broadcast === "function") room.broadcast();
    else if (room._emitCombat) room._emitCombat();
  }
}

function finishMonsterPhase(room, d) {
  clearMonsterTimer(d);
  d.monsterQueue = [];
  if (d.status !== "fighting") return;
  if (d._floorTransition) return;
  if (livingMembers(room, d).length === 0) {
    defeat(room, d);
    if (typeof room.broadcast === "function") room.broadcast();
    else if (room._emitCombat) room._emitCombat();
    return;
  }
  tickBuffs(room, d);
  checkEnd(room, d); // a DoT tick may have finished the last monster
  if (d.status !== "fighting" || d._floorTransition) return;
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
  else if (room._emitCombat) room._emitCombat();
}

function checkEnd(room, d) {
  if (d.status !== "fighting") return;
  if (d._floorTransition) return;
  const aliveMonsters = d.wave.filter((m) => m.hp > 0);
  if (aliveMonsters.length === 0) {
    if (d.totalFloors && d.floor < d.totalFloors) {
      // Next floor, not victory yet
      clearTurnTimer(d);
      clearMonsterTimer(d);
      d._floorTransition = true;
      d.log.push(`Floor ${d.floor} cleared!`);
      addFx(d, { type: "floor", floor: d.floor, total: d.totalFloors });
      setTimeout(() => {
        if (d.status !== "fighting") return;
        spawnNextFloor(room, d);
      }, 900);
      if (typeof room.broadcast === "function") room.broadcast();
      else if (room._emitCombat) room._emitCombat();
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
    // pet xp - active pets get 20% of player xp, faster curve
    const activeIds = p.activePetIds || (p.activePetId ? [p.activePetId] : []);
    for (const petId of activeIds.slice(0, p.character === "tamer" ? 3 : 2)) {
      addPetXp(p, petId, Math.round(xp * 0.3));
    }
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

  // Egg drops (victory, dungeon-specific, low chance)
  for (const egg of CONTENT.eggs || []) {
    if (!egg.dungeons || !egg.dungeons.includes(d.rank)) continue;
    if (Math.random() >= (egg.dropRate || 0.01)) continue;
    const eggItem = getItem(egg.id);
    if (!eggItem) continue;
    const receivers = livingMembers(room, d).length ? livingMembers(room, d) : members;
    const receiver = receivers[Math.floor(Math.random() * receivers.length)];
    addItem(receiver, egg.id, 1);
    const note = `${receiver.name} found a ${egg.label}!`;
    lootNotes.push(note);
    addFx(d, { type: "egg", eggId: egg.id });
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
  const wasBoss = isBossParty(d);
  // Remove fleeing player from dungeon/boss
  d.memberIds = (d.memberIds || []).filter((id) => id !== player.id);
  if (wasBoss) player.bossId = null;
  else player.dungeonId = null;
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
    // no one left – remove dungeon/boss entirely
    if (wasBoss) {
      if (room.bossParties) room.bossParties = room.bossParties.filter((x) => x !== d);
    } else {
      if (room.dungeons) room.dungeons = room.dungeons.filter((x) => x !== d);
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

function petActForPlayer(room, d, player){
  if(!player || player.hp<=0) return;
  const activeIds = (player.activePetIds && player.activePetIds.length ? player.activePetIds : (player.activePetId ? [player.activePetId] : []));
  const maxPets = player.character === "tamer" ? 3 : 2;
  for(const activePetId of activeIds.slice(0, maxPets)){
    const petDef = (CONTENT.pets || []).find(p=>p.id===activePetId);
    if(!petDef) continue;
    const petInst = (player.pets||[]).find(p=>p.petId===activePetId);
    const petLevel = petInst ? (petInst.level||1) : 1;
    const isTamer = player.character === "tamer";
    const mult = isTamer ? 2 : 1;
    const lvlScale = 1 + petLevel * 0.04;
    // Pet'in KENDİ statları kendi çıktısını etkiler (oyuncuya stat vermez):
    const pStats = petDef.stats || {};
    const pAtk = pStats.attack || 0;
    const pMag = pStats.magicPower || 0;
    const pRes = pStats.resistance || 0;
    const skills = petDef.petSkills || (petDef.buffKind ? [{kind: petDef.buffKind, value:0.15, interval:2, element: petDef.element}] : []);
    // if no petSkills, fallback to random as before
    let toUse = [];
    if(skills.length){
      for(const sk of skills){
        const interval = sk.interval || 2;
        // use petTurn counter per pet? Use player.petTurn
        if((player.petTurn||0) % interval !== 0) continue;
        toUse.push(sk);
      }
      if(!toUse.length) continue;
    } else {
      // fallback random single skill
      const roll=Math.random();
      if(roll<0.35) toUse.push({kind:"heal", value:0.12, interval:2});
      else if(roll<0.6) toUse.push({kind:"shield", value:30, interval:2});
      else if(roll<0.85) toUse.push({kind:"weaken", value:0.15, interval:2});
      else toUse.push({kind:"attack", value:0.6, interval:1});
    }
    // execute each skill with 400ms gap
    toUse.forEach((sk, idx)=>{
      setTimeout(()=>{
        if(d.status!=="fighting" || d.phase!=="players") return;
        const pid = player.id;
        if(sk.kind==="heal"){
          const amt=Math.max(1, Math.round((player.maxHp * (sk.value||0.12) * (1 + (player.healPower||0)/50) + pMag*3) * lvlScale * mult));
          const before=player.hp; heal(player, amt); const healed=player.hp-before;
          if(healed>0){ addFx(d,{type:"heal", actor:pid, target:pid, amount:healed, source:"pet", petId:petDef.id, effect:"heal"}); d.log.push(`${petDef.name} heals ${player.name} for ${healed} HP!`); if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat(); }
        } else if(sk.kind==="shield"){
          const amt=Math.round(((sk.value||30) + pMag*1.2) * lvlScale * mult);
          addShield(player, amt); addFx(d,{type:"shield", actor:pid, target:pid, amount:amt, petId:petDef.id}); d.log.push(`${petDef.name} shields ${player.name} for ${amt}!`); if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat();
        } else if(sk.kind==="attack"){
          const alive=d.wave.map((m,i)=>({m,i})).filter(x=>x.m.hp>0);
          if(!alive.length) return;
          const pick=alive[Math.floor(Math.random()*alive.length)];
          const base=player.magicPower > player.attack ? player.magicPower : player.attack;
          const dmg=Math.max(1, Math.round((base * (sk.value||0.6) + Math.max(pAtk, pMag)*2) * lvlScale * mult * randVariance(CONTENT.combat.damageVariance)));
          // vfx
          const _pElem = sk.element || petDef.element || "physical";
          const _pEl = (CONTENT.elements || []).find((e) => e.id === _pElem);
          const vfxId = (_pEl && _pEl.effect) || "element_" + _pElem;
          dealDamage(pick.m, dmg); addFx(d,{type:"damage", actor:pid, target:"enemy", targetId:pick.i, amount:dmg, source:"pet", petId:petDef.id, elem: sk.element||petDef.element||"physical", effect:sk.element||petDef.element||"slash", vfxId}); d.log.push(`${petDef.name} hits ${pick.m.name} for ${dmg}!`); if(pick.m.hp<=0){ d.buffs=(d.buffs||[]).filter(b=> !(b.targetType==="monster" && Number(b.targetId)===Number(pick.i))); checkEnd(room,d); } if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat();
        } else if(sk.kind==="weaken" || sk.kind==="frozen" || sk.kind==="wet"){
          const alive=d.wave.map((m,i)=>({m,i})).filter(x=>x.m.hp>0);
          if(!alive.length) return;
          const pick=alive[Math.floor(Math.random()*alive.length)];
          const k=sk.kind==="weaken"?"pet_weaken":sk.kind;
          const v= (sk.value||0.15)*mult + pAtk*0.005;
          d.buffId=(d.buffId||0)+1; d.buffs.push({uid:d.buffId, targetType:"monster", targetId:pick.i, kind:k, value:v, turns: sk.duration||2, name:petDef.name});
          addFx(d,{type:"buff", actor:pid, target:"enemy", targetId:pick.i, kind:k, value:v, turns:sk.duration||2, petId:petDef.id, vfxId: sk.kind==="frozen"?"frost_prison_dome": sk.kind==="wet"?"tidal_wave_water":"blood_curse_mist"});
          d.log.push(`${petDef.name} ${sk.kind}s ${pick.m.name}!`); if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat();
        } else if(sk.kind==="attack" || sk.kind==="magicBoost" || sk.kind==="defense"){
          const petKind = sk.kind==="attack"?"pet_attack": sk.kind==="magicBoost"?"pet_magic":"pet_defense";
          const bv= (sk.value||0.15)*mult + (sk.kind==="attack"?pAtk : sk.kind==="magicBoost"?pMag : pRes)*0.01;
          d.buffId=(d.buffId||0)+1; d.buffs.push({uid:d.buffId, targetType:"player", targetId:pid, kind:petKind, value:bv, turns:2, name:petDef.name});
          addFx(d,{type:"buff", actor:pid, target:"player", targetId:pid, kind:petKind, value:bv, turns:2, petId:petDef.id, vfxId: petKind==="pet_attack"?"cross_cut_x_slash": petKind==="pet_magic"?"frost_crystal_spear":"radiant_halo_shield"});
          d.log.push(`${petDef.name} buffs ${player.name} ${petKind} +${Math.round(bv*100)}%!`); if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat();
        }
      }, idx*400);
    });
  }
}
function petAct(room, d) {
  if (!d || d.status !== "fighting" || d.phase !== "players") return;
  if (d.round % 3 !== 0) return;
  for (const pid of d.memberIds) {
    const player = room.players.find((p) => p.id === pid);
    if (!player || player.hp <= 0) continue;
    const activeIds = (player.activePetIds && player.activePetIds.length ? player.activePetIds : (player.activePetId ? [player.activePetId] : []));
    const maxPets = player.character === "tamer" ? 3 : 2;
    if (!activeIds.length) continue;
    for (const activePetId of activeIds.slice(0, maxPets)) {
      const petDef = (CONTENT.pets || []).find((p) => p.id === activePetId);
      if (!petDef) continue;
      const petInst = (player.pets||[]).find(p=>p.petId===activePetId);
      const petLevel = petInst ? (petInst.level||1) : 1;
      const isTamer = player.character === "tamer";
      const mult = isTamer ? 2 : 1;
      const pStats = petDef.stats || {};
      const pAtk = pStats.attack || 0;
      const pMag = pStats.magicPower || 0;
      const pRes = pStats.resistance || 0;
      if (petDef.buffKind && ["attack","magicBoost","defense"].includes(petDef.buffKind)) {
        const petKind = petDef.buffKind === "attack" ? "pet_attack" : petDef.buffKind === "magicBoost" ? "pet_magic" : "pet_defense";
        const buffVal = 0.15 * mult + (petKind === "pet_attack" ? pAtk : petKind === "pet_magic" ? pMag : pRes) * 0.01;
        const targetId = pid;
        d.buffId=(d.buffId||0)+1;
        d.buffs.push({uid:d.buffId, targetType:"player", targetId, kind: petKind, value: buffVal, turns: 2, name: petDef.name});
        addFx(d, {type:"buff", actor: pid, target:"player", targetId, kind: petKind, value: buffVal, turns:2, petId: petDef.id});
        d.log.push(`${petDef.name} buffs ${player.name} ${petKind} +${Math.round(buffVal*100)}%!`);
        continue;
      }
      const roll = Math.random();
      const targetAlly = player;
      const lvlScale = 1 + petLevel * 0.04;
      if (roll < 0.35) {
        const before = targetAlly.hp;
        const amt = Math.max(1, Math.round((targetAlly.maxHp * 0.12 * (1 + (player.healPower || 0) / 50) + pMag * 3) * lvlScale * mult));
        heal(targetAlly, amt);
        const healed = targetAlly.hp - before;
        if (healed > 0) {
          addFx(d, { type: "heal", actor: pid, target: pid, amount: healed, source: "pet", petId: petDef.id, effect: "heal" });
          d.log.push(`${petDef.name} heals ${player.name} for ${healed} HP!`);
        }
      } else if (roll < 0.6) {
        const amt = Math.round(((30 + Math.floor(Math.random() * 20)) + pMag * 1.2) * lvlScale * mult);
        addShield(targetAlly, amt);
        addFx(d, { type: "shield", actor: pid, target: pid, amount: amt, petId: petDef.id });
        d.log.push(`${petDef.name} shields ${player.name} for ${amt}!`);
      } else if (roll < 0.85) {
        const alive = d.wave.map((m, i) => ({ m, i })).filter((x) => x.m.hp > 0);
        if (!alive.length) continue;
        const pick = alive[Math.floor(Math.random() * alive.length)];
        if (petDef.element === "frost" && Math.random() < 0.5) {
          d.buffs.push({ uid: (d.buffId = (d.buffId || 0) + 1), targetType: "monster", targetId: pick.i, kind: "frozen", value: 0, turns: 1, name: petDef.name });
          addFx(d, { type: "buff", actor: pid, target: "enemy", targetId: pick.i, kind: "frozen", value: 0, turns: 1 });
          d.log.push(`${petDef.name} freezes ${pick.m.name}!`);
        } else {
          const weakenVal = 0.15 * mult + pAtk * 0.005;
          d.buffs.push({ uid: (d.buffId = (d.buffId || 0) + 1), targetType: "monster", targetId: pick.i, kind: "pet_weaken", value: weakenVal, turns: 2, name: petDef.name });
          addFx(d, { type: "buff", actor: pid, target: "enemy", targetId: pick.i, kind: "pet_weaken", value: weakenVal, turns: 2 });
          d.log.push(`${petDef.name} weakens ${pick.m.name}!`);
        }
      } else {
        const alive = d.wave.map((m, i) => ({ m, i })).filter((x) => x.m.hp > 0);
        if (!alive.length) continue;
        const pick = alive[Math.floor(Math.random() * alive.length)];
        const base = player.magicPower > player.attack ? player.magicPower : player.attack;
        const dmg = Math.max(1, Math.round((base * 0.6 + Math.max(pAtk, pMag) * 2) * lvlScale * mult * randVariance(CONTENT.combat.damageVariance)));
      dealDamage(pick.m, dmg);
      addFx(d, { type: "damage", actor: pid, target: "enemy", targetId: pick.i, amount: dmg, source: "pet", petId: petDef.id, elem: petDef.element || "physical", effect: petDef.element || "slash" });
      d.log.push(`${petDef.name} hits ${pick.m.name} for ${dmg}!`);
      if (pick.m.hp <= 0) {
        d.buffs = (d.buffs || []).filter((b) => !(b.targetType === "monster" && Number(b.targetId) === Number(pick.i)));
        checkEnd(room, d);
        if (d.status !== "fighting") break;
      }
      }
    }
  }
  if (typeof room.broadcast === "function") room.broadcast();
  else if (room._emitCombat) room._emitCombat();
}

module.exports = {
  spawnWave,
  act,
  useItem,
  endTurn,
  flee,
  armTurnTimer,
  clearTurnTimer,
  petAct,
  resumeMonsterPhase,
};
