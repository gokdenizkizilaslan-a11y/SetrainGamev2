const {
  CONTENT,
  getDungeon,
  getDungeonSize,
  getSkill,
  getItem,
  getMonster,
  getClassBasicAttack,
} = require("../content");
const { dealDamage, addShield, removeShieldInstance, heal, loseLife, addXp, addPetXp, removeItem, healForFood, addItem } = require("./players");
const passives = require("./passives");
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

// Skill cooldowns: optional `cooldown: N` on a skill means "usable every N rounds"
// (N=2 → usable on rounds 1,3,5…). Stored as rounds-left per player per skill.
// Skills without the field behave exactly as before.
function cooldownLeft(d, playerId, skillId) {
  return (d.cooldowns && d.cooldowns[playerId] && d.cooldowns[playerId][skillId]) || 0;
}
function setCooldown(d, playerId, skillId, rounds) {
  const n = Math.floor(Number(rounds) || 0);
  if (n <= 0) return;
  if (!d.cooldowns) d.cooldowns = {};
  if (!d.cooldowns[playerId]) d.cooldowns[playerId] = {};
  d.cooldowns[playerId][skillId] = n;
}
function tickCooldowns(d) {
  if (!d.cooldowns) return;
  for (const pid of Object.keys(d.cooldowns)) {
    for (const sid of Object.keys(d.cooldowns[pid])) {
      d.cooldowns[pid][sid] = Math.max(0, d.cooldowns[pid][sid] - 1);
    }
  }
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
      // shield is flat HP, apply immediately as a timed instance linked to
      // this buff entry (süre bitince kalan miktar silinir).
      if (e.kind === "shield") {
        d.buffId = (d.buffId || 0) + 1;
        const shieldUid = d.buffId;
        if (targetType === "player") {
          const target = room.players.find((p) => p.id === tid);
          if (target) addShield(target, Math.round(e.value * passives.shieldGainMult(target.character)), turns, shieldUid);
        } else {
          const mon = d.wave[tid];
          if (mon) {
            if (!Array.isArray(mon.shields)) mon.shields = [];
            mon.shields.push({ amount: Math.max(0, Math.round(e.value)), max: Math.max(0, Math.round(e.value)), turns: Math.max(1, turns), uid: shieldUid });
            mon.shield = mon.shields.reduce((s, x) => s + Math.max(0, x.amount), 0);
            mon.maxShield = mon.shields.reduce((s, x) => s + Math.max(0, x.max), 0);
          }
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
        shieldUid: e.kind === "shield" ? d.buffId - 1 : undefined,
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
          heal(p, Math.max(1, Math.round(p.maxHp * b.value * passives.regenBonusMult(p.character))));
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
  // Süresi biten kalkan paketlerini düşür (kalan miktar silinir).
  for (const b of d.buffs || []) {
    if (b && b.kind === "shield" && b.turns <= 1 && b.shieldUid != null) {
      if (b.targetType === "player") {
        const p = room.players.find((q) => q.id === b.targetId);
        if (p) removeShieldInstance(p, b.shieldUid);
      } else {
        const mon = d.wave[b.targetId];
        if (mon && Array.isArray(mon.shields)) {
          mon.shields = mon.shields.filter((s) => s && s.uid !== b.shieldUid);
          mon.shield = mon.shields.reduce((s, x) => s + Math.max(0, x.amount), 0);
          mon.maxShield = mon.shields.reduce((s, x) => s + Math.max(0, x.max), 0);
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
    const pool = (Array.isArray(def.monsterPool) && def.monsterPool.length) ? def.monsterPool : (CONTENT.monsters || []).map((mm) => mm.id);
    let m = getMonster(pool[Math.floor(Math.random() * pool.length)]);
    if (!m) m = (CONTENT.monsters || [])[0];
    if (!m) throw new Error(`Dungeon "${def.rank}" has no valid monsters in its pool.`);
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
      resistance: Math.max(0, Math.round(m.resistance || 0)),
      shield: 0,
      maxShield: 0,
      shields: [],
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
  d.cooldowns = {};
  // Fresh delve = fresh kill counter (never carries into the next run).
  d.totalKills = 0;
  d.bankedBonus = { gold: 0, wood: 0, xp: 0 };
  d.monsterQueue = [];
  d.monsterTimer = null;
  for (const p of allMembers(room, d)) {
    p.hp = p.maxHp;
    p.mana = p.maxMana;
    p._struckThisCombat = false;
    p._secondWindUsed = false;
    for (const s of passives.shieldStartFor(p.character, p.maxHp)) {
      addShield(p, s.amount, s.turns);
    }
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
  // Bank this floor's kills BEFORE the wave is replaced, so victory XP
  // counts every floor — not just the last one.
  d.totalKills = (d.totalKills || 0) + d.wave.filter((m) => m.hp <= 0).length;
  // Same for per-monster bonus rewards (gold/wood/xp): bank them now.
  d.bankedBonus = d.bankedBonus || { gold: 0, wood: 0, xp: 0 };
  for (const mon of d.wave) {
    if (mon.hp > 0) continue;
    const mdef = getMonster(mon.kind);
    if (!mdef) continue;
    d.bankedBonus.gold += Math.max(0, Math.floor(mdef.goldReward || 0));
    d.bankedBonus.wood += Math.max(0, Math.floor(mdef.woodReward || 0));
    d.bankedBonus.xp += Math.max(0, Math.floor(mdef.xpReward || 0));
  }
  const wave = buildWaveForFloor(def, size, d.power, d.floor, d.totalFloors, d.totalCount);
  d.wave = wave;
  d.round = 1;
  d.phase = "players";
  d.buffs = [];
  d.buffId = 0;
  d.endedTurns = new Set();
  d.usedSkills = {};
  d.cooldowns = {};
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
  const cdLeft = cooldownLeft(d, player.id, skillId);
  if (cdLeft > 0) {
    throw new Error("That skill needs " + cdLeft + " more round(s).");
  }
  if (player.mana < mana) {
    throw new Error("Not enough mana.");
  }
  if (skill.target === "enemy") {
    const mon = d.wave[Number(targetId)];
    if (!mon || mon.hp <= 0) {
      throw new Error("Choose a living monster.");
    }
    // Execute önden baraj (mana yanmadan): hedef zayıf değilse atılamaz.
    if (skill.execute && skill.execute.belowHpPct != null && mon.maxHp > 0
        && mon.hp / mon.maxHp > Number(skill.execute.belowHpPct)) {
      throw new Error(`Execute fells only the weak — target must be below ${Math.round(Number(skill.execute.belowHpPct) * 100)}% HP.`);
    }
    const pexec = passives.executeFor(player.character);
    if (pexec && pexec.belowHpPct != null && mon.maxHp > 0
        && mon.hp / mon.maxHp > Number(pexec.belowHpPct)) {
      throw new Error(`Your passive execution needs the target below ${Math.round(Number(pexec.belowHpPct) * 100)}% HP.`);
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
  setCooldown(d, player.id, skillId, skill.cooldown);
  if (mana > 0) addFx(d, { type: "mana", actor: player.id, amount: mana, skill: skill.id });
  if (skill.target === "enemy") {
    const primaryIdx = Number(targetId);
    // ---- hedef listesi: tekli / tümü / seçili + rastgele ekler ----
    let tids = [primaryIdx];
    if (skill.hitsAll) {
      tids = d.wave.map((m, i) => i).filter((i) => d.wave[i] && d.wave[i].hp > 0);
      if (!tids.length) tids = [primaryIdx];
    } else if (skill.splash && Number(skill.splash.extraTargets) > 0) {
      const others = d.wave.map((m, i) => i).filter((i) => i !== primaryIdx && d.wave[i] && d.wave[i].hp > 0);
      const n = Math.min(Math.max(0, Math.floor(skill.splash.extraTargets)), others.length);
      for (let k = 0; k < n; k++) {
        tids.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
      }
    }
    const mon = d.wave[primaryIdx];
    // Taban hasar: sayıysa sabit, {stat,mult} ise formül. Hedef-canı istatistikleri
    // (targetMaxHp/targetHp) de seçilebilir. Formülde true:true varsa o kısım
    // GERÇEK hasardır (exact, indirimsiz) — kalan power kısmı normal boru hattından
    // geçer. Böylece türler karışır: örn. %10 gerçek + normal vuruş.
    let skillBase = 0;
    let trueFormula = null;
    if (skill.baseDamage != null && typeof skill.baseDamage === "object") {
      const bst = skill.baseDamage.stat || "attack";
      const bm = Number(skill.baseDamage.mult) || 0;
      if (skill.baseDamage.true) {
        trueFormula = { stat: bst, mult: bm };
      } else {
        const bval = bst === "targetMaxHp" ? mon.maxHp : bst === "targetHp" ? mon.hp : (player[bst] || 0);
        skillBase = Math.max(0, Math.round(bval * bm));
      }
    } else {
      skillBase = Math.max(0, Math.round(Number(skill.baseDamage) || 0));
    }
    const skillPower = Math.max(0, Number(skill.power) || 0);
    const selfHpPct = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    const pexec = passives.executeFor(player.character);
    const echoCfg = skill.echo || null;
    const pEcho = !skill.echo ? passives.echoFor(player.character) : null;
    if (skillPower > 0 || skillBase > 0 || trueFormula) {
      const isPhysical = !skill.element || skill.element === "physical";
      const baseStat = isPhysical ? player.attack : player.magicPower;
      const rawBase = skillBase + baseStat * skillPower;
      const pAtk = buffSum(d, "player", player.id, "attack") + buffSum(d, "player", player.id, "pet_attack") - buffSum(d, "player", player.id, "weaken") - buffSum(d, "player", player.id, "pet_weaken");
      const pMagic = buffSum(d, "player", player.id, "magicBoost") + buffSum(d, "player", player.id, "pet_magic") - buffSum(d, "player", player.id, "weaken") - buffSum(d, "player", player.id, "pet_weaken");
      const pBoost = isPhysical ? pAtk : pMagic;
      const pCrit = passives.critBonus(player.character);
      const pierce = passives.pierceFlat(player.character);
      const wasFirst = !player._struckThisCombat;
      let primaryDmg = 0;
      for (const tidx of tids) {
        const tgt = d.wave[tidx];
        if (!tgt || tgt.hp <= 0) continue;
        const hpPct = tgt.maxHp > 0 ? tgt.hp / tgt.maxHp : 1;
        const mDef = buffSum(d, "monster", tidx, "defense") + buffSum(d, "monster", tidx, "pet_defense");
        const mExp = buffSum(d, "monster", tidx, "expose") + buffSum(d, "monster", tidx, "pet_expose");
        let dmg;
        let crit = false;
        if (skill.trueDamage) {
          // LoL-style true damage: exact number. No variance, no crit, no buffs,
          // no affinity/combo/bonus, no resistance. Shield still absorbs via dealDamage.
          dmg = Math.max(1, Math.round(rawBase));
        } else {
        const critChance = (player.critChance != null ? player.critChance + pCrit.chance : 0) / 100 || (CONTENT.combat.critChance || 0);
        const critBonus = (player.critDamage != null ? player.critDamage + pCrit.damage : Math.round(((CONTENT.combat.critMult || 1.5) - 1) * 100));
        crit = Math.random() < critChance;
        const critMult = crit ? 1 + critBonus / 100 : 1;
        dmg = Math.max(
          1,
          Math.round(rawBase * randVariance(CONTENT.combat.damageVariance) * critMult * (1 + pBoost) * (1 - mDef + mExp))
        );
        // affinity: defender element vs attacker element
        const monDefForAff = getMonster(tgt.kind);
        const defenderElem = (monDefForAff && monDefForAff.element) || tgt.element || "physical";
        const defenderTags = (monDefForAff && monDefForAff.tags) || tgt.tags || [];
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
            if (hasStatus(d, "monster", tidx, c.when)) {
              dmg = Math.round(dmg * c.mult);
            }
          }
        }
        // bonus vs frozen etc (generic)
        if (skill.bonusVsStatus && hasStatus(d, "monster", tidx, skill.bonusVsStatus.status)) {
          dmg = Math.round(dmg * (1 + (skill.bonusVsStatus.mult || 0)));
        }
        // bonus vs high-HP targets (skill field)
        if (skill.bonusVsHighHp && skill.bonusVsHighHp.aboveHpPct != null
            && hpPct > Number(skill.bonusVsHighHp.aboveHpPct)) {
          dmg = Math.round(dmg * (1 + (Number(skill.bonusVsHighHp.mult) || 0)));
        }
        // bonus vs monster tags (skill field)
        if (skill.bonusVsTags && Array.isArray(skill.bonusVsTags.tags) && skill.bonusVsTags.tags.length
            && skill.bonusVsTags.tags.some((t) => defenderTags.includes(t))) {
          dmg = Math.round(dmg * (1 + (Number(skill.bonusVsTags.mult) || 0)));
        }
        // class passives: conditional damage
        dmg = Math.max(1, Math.round(dmg * passives.damageOutMult(player.character, {
          targetHpPct: hpPct,
          selfHpPct,
          isFirst: wasFirst,
          element: skill.element,
          targetTags: defenderTags,
        })));
        // Monster/boss resistance — mirrors the monster-vs-player formula.
        // resistance 0 (old content) = no change. Pierce ignores part of it.
        // True damage skips all of the above (exact number).
        const monRes = Math.max(0, ((tgt && tgt.resistance) || 0) - pierce);
        if (!skill.trueDamage && monRes > 0) {
          dmg = Math.max(1, dmg - Math.round(monRes * (CONTENT.combat.resistanceMitigation || 0)));
        }
        } // end non-true-damage path
        // Karışık tür: formülün gerçek-hasar kısmı hedef başına exact eklenir.
        let truePart = 0;
        if (trueFormula) {
          const tb = trueFormula.stat === "targetMaxHp" ? tgt.maxHp
            : trueFormula.stat === "targetHp" ? tgt.hp
            : (player[trueFormula.stat] || 0);
          truePart = Math.max(0, Math.round(tb * Number(trueFormula.mult || 0)));
        }
        const totalDmg = dmg + truePart;
        const hpBefore = tgt.hp;
        dealDamage(tgt, totalDmg);
        addFx(d, { type: "damage", actor: player.id, target: "enemy", targetId: tidx, amount: totalDmg, skill: skill.id, elem: skill.element || "physical", effect: skill.effect || defaultEffectFor(skill.element), sound: skill.sound || "", crit });
        // Bitirici: senin vuruşun hedefi eşiğe indirirse kalkanı delip öldürür.
        // Sadece saldıranın vuruşu tetikler (çalınma yok).
        const finThresh = (skill.execute && skill.execute.finishBelowHpPct != null)
          ? Number(skill.execute.finishBelowHpPct)
          : (pexec && pexec.finishBelowHpPct != null ? Number(pexec.finishBelowHpPct) : null);
        if (finThresh != null && tgt.hp > 0 && tgt.maxHp > 0 && tgt.hp / tgt.maxHp <= finThresh) {
          tgt.hp = 0;
          tgt.shield = 0;
          if (Array.isArray(tgt.shields)) tgt.shields = [];
          d.log.push(`${player.name} executed ${tgt.name}!`);
          addFx(d, { type: "damage", actor: player.id, target: "enemy", targetId: tidx, amount: 0, skill: skill.id, elem: skill.element || "physical", effect: skill.effect || defaultEffectFor(skill.element), sound: skill.sound || "", crit: false });
        }
        // Yankı (echo): şansla aynı hedefe ikinci vuruş (özyineleme yok).
        const echoSrc = echoCfg || pEcho;
        if (echoSrc && Number(echoSrc.chance) > 0 && Math.random() < Number(echoSrc.chance) && tgt.hp > 0) {
          const echoDmg = Math.max(1, Math.round(totalDmg * Number(echoSrc.mult || 0.3)));
          dealDamage(tgt, echoDmg);
          addFx(d, { type: "damage", actor: player.id, target: "enemy", targetId: tidx, amount: echoDmg, skill: skill.id, elem: skill.element || "physical", effect: skill.effect || defaultEffectFor(skill.element), sound: skill.sound || "", crit: false });
        }
        // Taşma (overkill): fazlası rastgele yaşayan düşmana.
        if (passives.hasOverkill(player.character) && tgt.hp <= 0) {
          const excess = Math.max(0, totalDmg - hpBefore);
          if (excess > 0) {
            const aliveOthers = d.wave.map((m, i) => i).filter((i) => d.wave[i] && d.wave[i].hp > 0);
            if (aliveOthers.length) {
              const oi = aliveOthers[Math.floor(Math.random() * aliveOthers.length)];
              const om = d.wave[oi];
              dealDamage(om, excess);
              addFx(d, { type: "damage", actor: player.id, target: "enemy", targetId: oi, amount: excess, skill: skill.id, elem: skill.element || "physical", effect: skill.effect || defaultEffectFor(skill.element), sound: skill.sound || "", crit: false });
              d.log.push(`Overkill crashes into ${om.name}!`);
              if (om.hp <= 0) {
                d.buffs = (d.buffs || []).filter((b) => !(b.targetType === "monster" && Number(b.targetId) === oi));
              }
            }
          }
        }
        if (tgt.hp <= 0) {
          d.buffs = (d.buffs || []).filter((b) => !(b.targetType === "monster" && Number(b.targetId) === tidx));
          const hb = passives.healOnKillPct(player.character);
          if (hb > 0) {
            const amt = Math.max(1, Math.round(player.maxHp * hb));
            const before = player.hp;
            heal(player, amt);
            if (player.hp > before) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: player.hp - before, source: "passive", skill: skill.id, effect: "heal" });
          }
          const mk = passives.manaOnKill(player.character);
          if (mk > 0 && player.mana < player.maxMana) {
            const gained = Math.min(player.maxMana, player.mana + mk) - player.mana;
            if (gained > 0) {
              player.mana += gained;
              addFx(d, { type: "mana", actor: player.id, amount: gained, skill: skill.id, restore: true });
            }
          }
        }
        if (tidx === primaryIdx) primaryDmg = totalDmg;
      }
      player._struckThisCombat = true;
      // Tek seferlik proclar (birincil hedef üzerinden, eski davranış):
      const mon0 = d.wave[primaryIdx];
      if (skill.lifesteal) {
        const before = player.hp;
        const amt = Math.max(1, Math.round(primaryDmg * skill.lifesteal));
        heal(player, amt);
        const healed = player.hp - before;
        if (healed > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "lifesteal", skill: skill.id, effect: "heal" });
      }
      const plife = passives.lifestealPct(player.character);
      if (plife > 0 && primaryDmg > 0) {
        const before = player.hp;
        const amt = Math.max(1, Math.round(primaryDmg * plife));
        heal(player, amt);
        const healed = player.hp - before;
        if (healed > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "passive", skill: skill.id, effect: "heal" });
      }
      if (skill.healSelfPct) {
        const before = player.hp;
        const amt = Math.max(1, Math.round(player.maxHp * skill.healSelfPct * passives.healBonusMult(player.character)));
        heal(player, amt);
        const healed = player.hp - before;
        if (healed > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healed, source: "skill", skill: skill.id, effect: "heal" });
      }
      // Omnivamp: heals % of all damage dealt, stacks (e.g., 5% ring +10% stone =15%)
      if (player.omnivamp && primaryDmg > 0) {
        const pct = (player.omnivamp || 0) / 100;
        if (pct > 0) {
          const before = player.hp;
          const omniAmt = Math.max(1, Math.round(primaryDmg * pct));
          heal(player, omniAmt);
          const healedOmni = player.hp - before;
          if (healedOmni > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healedOmni, source: "omnivamp", skill: skill.id, effect: "heal" });
        }
      }
      // Anomaly trait lifesteal (e.g. Sanguine Thirst): heals % of all damage dealt
      const traitFx = player.anomaly && player.anomaly.effect;
      if (traitFx && traitFx.type === "lifesteal" && traitFx.percent > 0 && primaryDmg > 0) {
        const before = player.hp;
        const traitAmt = Math.max(1, Math.round(primaryDmg * traitFx.percent));
        heal(player, traitAmt);
        const healedTrait = player.hp - before;
        if (healedTrait > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: healedTrait, source: "trait_lifesteal", skill: skill.id, effect: "heal" });
      }
    }
    applyBuffs(room, d, player, player.name, skill, "monster", tids, true);
  } else if (skill.target === "self") {
    applyBuffs(room, d, player, player.name, skill, "player", [player.id], true);
  } else if (skill.target === "ally") {
    const target = room.players.find((p) => p.id === targetId);
    if (target) {
      if (target.hp > 0 && skill.heal != null) {
        const healMult = (1 + (player.healPower || 0) / 50) * passives.healBonusMult(player.character);
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
    const partyHealMult = passives.healBonusMult(player.character);
    for (const p of livingMembers(room, d)) {
      if (skill.heal != null) {
        const healMult = (1 + (player.healPower || 0) / 50) * partyHealMult;
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
          const dodge = passives.dodgeChance(target.character);
          if (dodge > 0 && Math.random() < dodge) {
            d.log.push(`${target.name} dodged ${mon.name}'s attack!`);
            if (typeof room.broadcast === "function") room.broadcast();
            else if (room._emitCombat) room._emitCombat();
          } else {
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
          // Monster AoE: skill cooked with hitsAll/splash hits the whole party.
          let victims = [target];
          if (skill.hitsAll) {
            victims = livingMembers(room, d);
          } else if (skill.splash && Number(skill.splash.extraTargets) > 0) {
            const others = livingMembers(room, d).filter((p) => p.id !== target.id);
            const n = Math.min(Math.max(0, Math.floor(skill.splash.extraTargets)), others.length);
            for (let k = 0; k < n; k++) {
              victims.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
            }
          }
          for (const victim of victims) {
            if (!victim || victim.hp <= 0) continue;
            const vdmg = Math.max(1, Math.round(dmg * passives.damageTakenMult(victim.character)));
            dealDamage(victim, vdmg);
            addFx(d, { type: "damage", actor: victim.id, target: "player", targetId: victim.id, amount: vdmg, source: "monster", monster: mon.kind, elem: skill.element || mon.element || "physical", effect: eff, sound: skill.sound || "", crit });
            const thorns = passives.thornsMult(victim.character);
            if (thorns > 0 && mon.hp > 0) {
              const reflected = Math.max(1, Math.round(vdmg * thorns));
              dealDamage(mon, reflected);
              addFx(d, { type: "damage", actor: victim.id, target: "enemy", targetId: index, amount: reflected, source: "thorns", elem: "physical", effect: "blood_curse_mist", sound: "", crit: false });
              d.log.push(`${victim.name}'s thorns bite ${mon.name}!`);
              if (mon.hp <= 0) {
                d.buffs = (d.buffs || []).filter((b) => !(b.targetType === "monster" && Number(b.targetId) === Number(index)));
              }
            }
            if (victim.hp <= 0 && passives.maybeSecondWind(victim)) {
              d.log.push(`${victim.name} refuses to fall!`);
              addFx(d, { type: "heal", actor: victim.id, target: "player", targetId: victim.id, amount: 1, source: "passive", effect: "heal" });
            }
          }
          }
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
  tickCooldowns(d);
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
    // Editördeki özel ödüller (rewards) varsa uygulanır; yoksa klasik değerler.
    const rw = (bossDef && bossDef.rewards) || {};
    const gold = Math.round((150 + Math.floor(Math.random()*80)) * (Number(rw.goldMultiplier) > 0 ? Number(rw.goldMultiplier) : 1));
    const wood = 40 + Math.floor(Math.random()*20);
    const xp = Math.round((400 + Math.floor(Math.random()*200)) * (Number(rw.xpMultiplier) > 0 ? Number(rw.xpMultiplier) : 1));
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
    // Garantili ödül (editör: rewards.guaranteedDrop) — varsa rastgele üyeye.
    if (rw.guaranteedDrop) {
      const g = getItem(rw.guaranteedDrop);
      if (g && members.length) {
        const recv = members[Math.floor(Math.random()*members.length)];
        addItem(recv, g.id, 1);
        lootNotes.push(`${recv.name} claimed ${g.name}!`);
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

  let gold = Math.round(def.goldBase * size.goldScale);
  let wood = Math.round(def.woodBase * size.woodScale);
  // XP now per killed monster across ALL floors (earlier floors were banked
  // in totalKills at each transition): F 80-120, scaling with size and rank
  const killed = (d.totalKills || 0) + d.wave.filter((m) => m.hp <= 0).length || d.wave.length;
  const [xpMin, xpMax] = xpRangeForRank(d.rank);
  let xp = 0;
  for (let i = 0; i < killed; i++) {
    xp += Math.round(randInt(xpMin, xpMax) * (size.xpScale || 1));
  }
  // fallback if somehow killed 0
  if (xp <= 0) xp = Math.round(randInt(xpMin, xpMax) * (size.xpScale || 1));
  // Editördeki zindan tamamlama ödülü (dungeons[].xpReward) — kill XP'sine eklenir.
  xp += Math.max(0, Math.floor(def.xpReward || 0));
  // Per-monster bonus rewards (data-driven: monster.goldReward/woodReward/xpReward).
  // Zero/undefined = no bonus, so old content behaves exactly as before.
  // Earlier floors were banked at each transition; this wave is counted here.
  const banked = d.bankedBonus || { gold: 0, wood: 0, xp: 0 };
  gold += banked.gold || 0;
  wood += banked.wood || 0;
  xp += banked.xp || 0;
  // Class passives: victory spoils (best mult among members wins).
  try {
    let vx = 1;
    let vg = 1;
    for (const m of members) {
      const vm = passives.victoryMults(m.character);
      if (vm.xp > vx) vx = vm.xp;
      if (vm.gold > vg) vg = vm.gold;
    }
    if (vx !== 1) xp = Math.round(xp * vx);
    if (vg !== 1) gold = Math.round(gold * vg);
  } catch (e) {}
  for (const mon of d.wave) {
    if (mon.hp > 0) continue;
    const mdef = getMonster(mon.kind);
    if (!mdef) continue;
    gold += Math.max(0, Math.floor(mdef.goldReward || 0));
    wood += Math.max(0, Math.floor(mdef.woodReward || 0));
    xp += Math.max(0, Math.floor(mdef.xpReward || 0));
  }

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
  const petIds = activeIds.slice(0, maxPets);
  for (let pi = 0; pi < petIds.length; pi++) {
    const activePetId = petIds[pi];
    const petDef = (CONTENT.pets || []).find(p=>p.id===activePetId);
    if(!petDef) continue;
    const petInst = (player.pets||[]).find(p=>p.petId===activePetId);
    const petLevel = petInst ? (petInst.level||1) : 1;
    const isTamer = player.character === "tamer";
    const mult = isTamer ? 2 : 1;
    const lvlScale = 1 + petLevel * 0.04;
    // Pet'in KENDİ statları kendi çıktısını etkiler (oyuncuya stat vermez):
    // taban + level atlarken kazanılan instance bonusları.
    const pStats = petDef.stats || {};
    const pAtk = (pStats.attack || 0) + (petInst ? (petInst.bonusAttack || 0) : 0);
    const pMag = (pStats.magicPower || 0) + (petInst ? (petInst.bonusMagic || 0) : 0);
    const pRes = (pStats.resistance || 0) + (petInst ? (petInst.bonusResist || 0) : 0);
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
    // execute each skill with gaps; pets cast one after another (sırayla)
    const petDelayBase = pi * 500;
    toUse.forEach((sk, idx)=>{
      setTimeout(()=>{
        if(d.status!=="fighting" || d.phase!=="players") return;
        const pid = player.id;
        if(sk.kind==="heal"){
          const amt=Math.max(1, Math.round((player.maxHp * (sk.value||0.12) * (1 + (player.healPower||0)/50) + pMag*3) * lvlScale * mult));
          const before=player.hp; heal(player, amt); const healed=player.hp-before;
          if(healed>0){ addFx(d,{type:"heal", actor:pid, target:pid, amount:healed, source:"pet", petId:petDef.id, effect:"heal"}); d.log.push(`${petDef.name} heals ${player.name} for ${healed} HP!`); if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat(); }
        } else if(sk.kind==="shield"){
          const amt=Math.round(((sk.value||30) + pMag*1.2) * lvlScale * mult * passives.shieldGainMult(player.character));
          addShield(player, amt, 1); addFx(d,{type:"shield", actor:pid, target:pid, amount:amt, petId:petDef.id, effect:"radiant_halo_shield", vfxId:"radiant_halo_shield", sound:"shield"}); d.log.push(`${petDef.name} shields ${player.name} for ${amt}!`); if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat();
        } else if(sk.kind==="attack"){
          const alive=d.wave.map((m,i)=>({m,i})).filter(x=>x.m.hp>0);
          if(!alive.length) return;
          const pick=alive[Math.floor(Math.random()*alive.length)];
          const base=player.magicPower > player.attack ? player.magicPower : player.attack;
          const dmg=Math.max(1, Math.round((base * (sk.value||0.6) + Math.max(pAtk, pMag)*2) * lvlScale * mult * randVariance(CONTENT.combat.damageVariance)));
          // vfx + sound (karakter skilleri gibi: element efekti + sesi)
          const _pElem = sk.element || petDef.element || "physical";
          const _pEl = (CONTENT.elements || []).find((e) => e.id === _pElem);
          const vfxId = (_pEl && _pEl.effect) || "element_" + _pElem;
          const sndId = (_pEl && _pEl.sound) || "";
          dealDamage(pick.m, dmg); addFx(d,{type:"damage", actor:pid, target:"enemy", targetId:pick.i, amount:dmg, source:"pet", petId:petDef.id, elem: sk.element||petDef.element||"physical", effect:sk.element||petDef.element||"slash", vfxId, sound:sndId}); d.log.push(`${petDef.name} hits ${pick.m.name} for ${dmg}!`); if(pick.m.hp<=0){ d.buffs=(d.buffs||[]).filter(b=> !(b.targetType==="monster" && Number(b.targetId)===Number(pick.i))); checkEnd(room,d); } if(typeof room.broadcast==="function") room.broadcast(); else if(room._emitCombat) room._emitCombat();
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
      }, petDelayBase + idx*350);
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
      const pAtk = (pStats.attack || 0) + (petInst ? (petInst.bonusAttack || 0) : 0);
      const pMag = (pStats.magicPower || 0) + (petInst ? (petInst.bonusMagic || 0) : 0);
      const pRes = (pStats.resistance || 0) + (petInst ? (petInst.bonusResist || 0) : 0);
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
        const amt = Math.round(((30 + Math.floor(Math.random() * 20)) + pMag * 1.2) * lvlScale * mult * passives.shieldGainMult(player.character));
        addShield(targetAlly, amt, 1);
        addFx(d, { type: "shield", actor: pid, target: pid, amount: amt, petId: petDef.id, effect: "radiant_halo_shield", vfxId: "radiant_halo_shield", sound: "shield" });
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
      const _fEl = (CONTENT.elements || []).find((e) => e.id === (petDef.element || "physical"));
      const _fVfx = (_fEl && _fEl.effect) || "element_" + (petDef.element || "physical");
      dealDamage(pick.m, dmg);
      addFx(d, { type: "damage", actor: pid, target: "enemy", targetId: pick.i, amount: dmg, source: "pet", petId: petDef.id, elem: petDef.element || "physical", effect: petDef.element || "slash", vfxId: _fVfx, sound: (_fEl && _fEl.sound) || "" });
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
