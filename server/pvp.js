const { CONTENT, getSkill, getClassBasicAttack } = require("../content");
const { dealDamage, addShield, heal } = require("./players");
const passives = require("./passives");

let pvpCounter = 0;
function genId() { pvpCounter+=1; return "pvp_"+pvpCounter+"_"+Math.random().toString(36).slice(2,6); }

function getPvpFor(room, player) {
  return (room.pvpDuels||[]).find(d=> d.memberIds.includes(player.id)) || null;
}
function clearTimer(d){ if(d.turnTimer){ clearTimeout(d.turnTimer); d.turnTimer=null; } }

function buildTurnOrder(room,d){
  const members = d.memberIds.map(id=> room.players.find(p=>p.id===id)).filter(Boolean).filter(p=>p.hp>0 && p.lives>0);
  members.sort((a,b)=> b.speed - a.speed);
  d.turnOrder = members.map(p=>p.id);
  d.turnIndex=0;
  d.currentTurnId = d.turnOrder[0]||null;
  d.endedTurns=new Set();
  if(d.currentTurnId){ if(!d.usedSkills) d.usedSkills={}; d.usedSkills[d.currentTurnId]=new Set(); }
}
function armTimer(room,d){
  clearTimer(d);
  if(d.status!=="fighting"||!d.currentTurnId) return;
  d.turnTimer=setTimeout(()=>{
    d.turnTimer=null;
    if(d.status!=="fighting") return;
    advanceTurn(room,d);
    if(typeof room.broadcast==="function") room.broadcast();
  }, CONTENT.combat.turnTimeoutMs);
}
function addFx(d,evt){ if(!d.fx) d.fx=[]; d.fx.push(evt); }

function createPvp(room, challenger, targetId){
  const target = room.players.find(p=>p.id===targetId);
  if(!target) throw new Error("Target not found.");
  if(challenger.id===targetId) throw new Error("Cannot challenge yourself.");
  if(getPvpFor(room,challenger)) throw new Error("Already in PvP.");
  if(getPvpFor(room,target)) throw new Error("Target already in PvP.");
  if(challenger.lives<=0||target.lives<=0) throw new Error("Fallen players cannot PvP.");
  const duel={
    id: genId(),
    memberIds:[challenger.id, target.id],
    status:"fighting",
    round:1,
    turnOrder:[],
    turnIndex:0,
    currentTurnId:null,
    buffs:[],
    buffId:0,
    endedTurns:new Set(),
    usedSkills:{},
    cooldowns:{},
    fx:[],
    turnTimer:null,
    log:[`${challenger.name} challenges ${target.name} to duel!`],
    result:null,
  };
  if(!room.pvpDuels) room.pvpDuels=[];
  room.pvpDuels.push(duel);
  challenger.pvpId=duel.id;
  target.pvpId=duel.id;
  // reset hp/mana/shield
  for(const pid of duel.memberIds){
    const p=room.players.find(x=>x.id===pid);
    if(p){ p.hp=p.maxHp; p.mana=p.maxMana; p.shield=0; p.maxShield=0; p.shields=[]; p._struckThisCombat=false; p._secondWindUsed=false;
      try {
        const passives = require("./passives");
        const { addShield } = require("./players");
        for (const s of passives.shieldStartFor(p.character, p.maxHp)) addShield(p, s.amount, s.turns);
      } catch (e) {}
    }
  }
  buildTurnOrder(room,duel);
  duel.log.push(`Round 1 — ${room.players.find(p=>p.id===duel.currentTurnId)?.name} starts.`);
  armTimer(room,duel);
  return duel;
}
function leavePvp(room, player){
  const d=getPvpFor(room,player);
  if(!d) return;
  clearTimer(d);
  room.pvpDuels = (room.pvpDuels||[]).filter(x=>x!==d);
  for(const pid of d.memberIds){
    const p=room.players.find(x=>x.id===pid);
    if(p){ p.pvpId=null; p.hp=p.maxHp; p.mana=p.maxMana; p.shield=0; p.maxShield=0; p.shields=[]; }
  }
}
function resolveSkill(player, skillId){
  const basic=getClassBasicAttack(player.character);
  if(basic && (basic.id===skillId||skillId==="auto_attack")) return {...basic, target:"enemy", mana:0};
  if(!player.skillLoadout.includes(skillId)) return null;
  return getSkill(skillId);
}
function buffSum(d, targetType, targetId, kind){
  if(!d.buffs) return 0;
  let s=0;
  for(const b of d.buffs) if(b.targetType===targetType && String(b.targetId)===String(targetId) && b.kind===kind) s+=b.value;
  return s;
}
function hasStatus(d, targetType, targetId, kind){
  return buffSum(d, targetType, targetId, kind) > 0;
}

// Skill cooldowns (see combat.js): optional `cooldown: N` = usable every N rounds.
function cooldownLeft(d, playerId, skillId){
  return (d.cooldowns && d.cooldowns[playerId] && d.cooldowns[playerId][skillId]) || 0;
}
function setCooldown(d, playerId, skillId, rounds){
  const n = Math.floor(Number(rounds) || 0);
  if (n <= 0) return;
  if (!d.cooldowns) d.cooldowns = {};
  if (!d.cooldowns[playerId]) d.cooldowns[playerId] = {};
  d.cooldowns[playerId][skillId] = n;
}
function tickCooldowns(d){
  if (!d.cooldowns) return;
  for (const pid of Object.keys(d.cooldowns)) {
    for (const sid of Object.keys(d.cooldowns[pid])) {
      d.cooldowns[pid][sid] = Math.max(0, d.cooldowns[pid][sid] - 1);
    }
  }
}
function act(room, player, skillId){
  const d=getPvpFor(room,player);
  if(!d||d.status!=="fighting") throw new Error("No PvP in progress.");
  if(d.currentTurnId!==player.id) throw new Error("Not your turn.");
  if(player.hp<=0) throw new Error("You are down.");
  const skill=resolveSkill(player,skillId);
  if(!skill) throw new Error("Unknown skill.");
  const used=(d.usedSkills[player.id]||new Set());
  if(used.has(skillId)) throw new Error("Skill already used this turn.");
  const cdLeft=cooldownLeft(d,player.id,skillId);
  if(cdLeft>0) throw new Error("That skill needs " + cdLeft + " more round(s).");
  if(player.mana < (skill.mana||0)) throw new Error("Not enough mana.");
  // find opponent
  const oppId = d.memberIds.find(id=>id!==player.id);
  const opponent = room.players.find(p=>p.id===oppId);
  if(!opponent || opponent.hp<=0) throw new Error("Opponent down.");
  // Execute pre-gate (mana yanmadan)
  if(skill.execute && skill.execute.belowHpPct != null && opponent.maxHp > 0
      && opponent.hp / opponent.maxHp > Number(skill.execute.belowHpPct)) {
    throw new Error(`Execute fells only the weak — target must be below ${Math.round(Number(skill.execute.belowHpPct) * 100)}% HP.`);
  }
  const pvpExec = passives.executeFor(player.character);
  if(pvpExec && pvpExec.belowHpPct != null && opponent.maxHp > 0
      && opponent.hp / opponent.maxHp > Number(pvpExec.belowHpPct)) {
    throw new Error(`Your passive execution needs the target below ${Math.round(Number(pvpExec.belowHpPct) * 100)}% HP.`);
  }
  player.mana -= (skill.mana||0);
  used.add(skillId); d.usedSkills[player.id]=used;
  setCooldown(d,player.id,skillId,skill.cooldown);
  if(skill.mana) addFx(d,{type:"mana", actor:player.id, amount:skill.mana, skill:skill.id});
  if(skill.power || skill.baseDamage){
    const isPhysical = !skill.element || skill.element==="physical";
    const base = isPhysical? player.attack : player.magicPower;
    let skillBase = 0;
    if (skill.baseDamage != null && typeof skill.baseDamage === "object") {
      const bst = skill.baseDamage.stat || "attack";
      const bm = Number(skill.baseDamage.mult) || 0;
      const bval = bst === "targetMaxHp" ? opponent.maxHp : bst === "targetHp" ? opponent.hp : (player[bst] || 0);
      skillBase = Math.max(0, Math.round(bval * bm));
    } else {
      skillBase = Math.max(0, Math.round(Number(skill.baseDamage) || 0));
    }
    const pCrit = passives.critBonus(player.character);
    const critChance = (player.critChance + pCrit.chance)/100 || 0.12;
    const crit = Math.random()<critChance;
    const critMult = crit? 1+ ((player.critDamage||40) + pCrit.damage)/100 :1;
    const pAtk = buffSum(d,"player",player.id,"attack") - buffSum(d,"player",player.id,"weaken");
    const pMagic = buffSum(d,"player",player.id,"magicBoost") - buffSum(d,"player",player.id,"weaken");
    const pBoost = isPhysical ? pAtk : pMagic;
    const pDef = buffSum(d,"player",oppId,"defense");
    const pExp = buffSum(d,"player",oppId,"expose");
    const oppHpPct = opponent.maxHp > 0 ? opponent.hp / opponent.maxHp : 1;
    const selfHpPct = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    let dmg = Math.max(1, Math.round((skillBase + base * (skill.power || 0))*(1+Math.random()*0.4-0.2)*critMult*(1+pBoost)*(1-pDef+pExp)));
    dmg = Math.max(1, Math.round(dmg * passives.damageOutMult(player.character, {
      targetHpPct: oppHpPct, selfHpPct, isFirst: !player._struckThisCombat,
      element: skill.element, targetTags: [],
    })));
    if(skill.bonusVsHighHp && skill.bonusVsHighHp.aboveHpPct != null
        && oppHpPct > Number(skill.bonusVsHighHp.aboveHpPct)) {
      dmg = Math.max(1, Math.round(dmg * (1 + (Number(skill.bonusVsHighHp.mult) || 0))));
    }
    dmg -= Math.max(0, Math.round(opponent.resistance * (CONTENT.combat.resistanceMitigation || 0.25) - passives.pierceFlat(player.character)));
    dmg=Math.max(1,dmg);
    dmg = Math.max(1, Math.round(dmg * passives.damageTakenMult(opponent.character)));
    // shield vs hp
    if(skill.element==="dark" && CONTENT.darkTrait) dmg=Math.round(dmg* (CONTENT.darkTrait.deal||1.3));
    // combos: data-driven element matchups (e.g. lightning vs wet)
    if (Array.isArray(CONTENT.combos)) {
      for (const c of CONTENT.combos) {
        if (!c || !c.when || !c.mult) continue;
        if (c.ifElement && c.ifElement !== skill.element) continue;
        if (hasStatus(d, "player", oppId, c.when)) {
          dmg = Math.round(dmg * c.mult);
        }
      }
    }
    dealDamage(opponent,dmg);
    player._struckThisCombat = true;
    // Bitirici + yankı (PvP dahil)
    const finTh = (skill.execute && skill.execute.finishBelowHpPct != null)
      ? Number(skill.execute.finishBelowHpPct)
      : (pvpExec && pvpExec.finishBelowHpPct != null ? Number(pvpExec.finishBelowHpPct) : null);
    if (finTh != null && opponent.hp > 0 && opponent.maxHp > 0 && opponent.hp / opponent.maxHp <= finTh) {
      opponent.hp = 0;
      opponent.shield = 0;
      if (Array.isArray(opponent.shields)) opponent.shields = [];
      d.log.push(`${player.name} executed ${opponent.name}!`);
    }
    const echoSrc = skill.echo || passives.echoFor(player.character);
    if (echoSrc && Number(echoSrc.chance) > 0 && Math.random() < Number(echoSrc.chance) && opponent.hp > 0) {
      const echoDmg = Math.max(1, Math.round(dmg * Number(echoSrc.mult || 0.3)));
      dealDamage(opponent, echoDmg);
      addFx(d,{type:"damage", actor:player.id, target:"player", targetId:oppId, amount:echoDmg, elem:skill.element||"physical", effect:skill.effect||skill.element||"slash", sound:skill.sound||"", crit:false});
    }
    if(opponent.hp<=0 && passives.maybeSecondWind(opponent)){
      d.log.push(`${opponent.name} refuses to fall!`);
    }
    const thorns = passives.thornsMult(opponent.character);
    if (thorns > 0 && player.hp > 0) {
      const reflected = Math.max(1, Math.round(dmg * thorns));
      dealDamage(player, reflected);
      addFx(d,{type:"damage", actor:oppId, target:"player", targetId:player.id, amount:reflected, elem:"physical", effect:"blood_curse_mist", sound:"", crit:false});
      d.log.push(`${opponent.name}'s thorns bite ${player.name}!`);
      if(player.hp<=0) passives.maybeSecondWind(player);
    }
    addFx(d,{type:"damage", actor:player.id, target:"player", targetId:oppId, amount:dmg, elem:skill.element||"physical", effect:skill.effect||skill.element||"slash", sound:skill.sound||"", crit});
    if(skill.lifesteal){
      const before=player.hp; heal(player, Math.round(dmg*skill.lifesteal));
      const h=player.hp-before; if(h>0) addFx(d,{type:"heal", actor:player.id, target:player.id, amount:h, source:"lifesteal"});
    }
    // Anomaly trait lifesteal (e.g. Sanguine Thirst): heals % of all damage dealt
    const traitFx = player.anomaly && player.anomaly.effect;
    if(traitFx && traitFx.type==="lifesteal" && traitFx.percent>0 && dmg>0){
      const before=player.hp; heal(player, Math.max(1, Math.round(dmg*traitFx.percent)));
      const h=player.hp-before; if(h>0) addFx(d,{type:"heal", actor:player.id, target:player.id, amount:h, source:"trait_lifesteal"});
    }
  }
  // heal
  if(skill.heal!=null){
    let baseHeal;
    if(typeof skill.heal==="object"){
      const stat=skill.heal.stat||"maxHp";
      const mult=skill.heal.mult||1;
      const baseVal = stat==="maxHp"? opponent.maxHp : player[stat]||0;
      // for ally heal, target is opponent? For PvP, ally heal is self only. Simplify: heal self
      const target = skill.target==="ally"||skill.target==="self"? player : opponent;
      const bv = stat==="maxHp"? target.maxHp : player[stat]||0;
      baseHeal = bv*mult;
      const healTarget = skill.target==="enemy"? opponent : player;
      const multHeal = 1 + (player.healPower||0)/50;
      const healed = heal(healTarget, Math.round(baseHeal*multHeal));
      addFx(d,{type:"heal", actor:player.id, target:healTarget.id, amount:healed, source:"skill"});
    } else {
      const multHeal = 1 + (player.healPower||0)/50;
      const target = skill.target==="ally"||skill.target==="self"? player : opponent;
      const healed = heal(target, Math.round(target.maxHp*skill.heal*multHeal));
      addFx(d,{type:"heal", actor:player.id, target:target.id, amount:healed, source:"skill"});
    }
  }
  // buffs
  if(skill.buffs){
    const kind = skill.buffs[0]?.kind;
    const isDebuff = ["weaken","expose","dot","wet","frozen"].includes(kind);
    const targetType="player";
    const targetId = isDebuff? oppId : player.id;
    const turns = skill.duration||1;
    for(const e of skill.buffs){
      if(e.kind==="shield"){
        const _tgt = room.players.find(p=>p.id===targetId);
        addShield(_tgt, Math.round(e.value * passives.shieldGainMult(_tgt ? _tgt.character : null)));
      }
      d.buffId=(d.buffId||0)+1;
      d.buffs.push({uid:d.buffId, targetType, targetId, kind:e.kind, value:e.value, turns, skillId:skill.id});
      addFx(d,{type:"buff", actor:player.id, target:"player", targetId, kind:e.kind, value:e.value, turns});
    }
  }
  // check win
  if(opponent.hp<=0){
    d.status="done";
    d.result={outcome:"victory", text:`${player.name} wins the duel!`};
    addFx(d,{type:"result", outcome:"victory"});
    d.log.push(d.result.text);
    clearTimer(d);
    return d;
  }
  armTimer(room,d);
  return d;
}
function endTurn(room, player){
  const d=getPvpFor(room,player);
  if(!d||d.status!=="fighting") throw new Error("No PvP.");
  if(d.currentTurnId!==player.id) throw new Error("Not your turn.");
  return advanceTurn(room,d);
}
function advanceTurn(room,d){
  clearTimer(d);
  if(d.currentTurnId) d.endedTurns.add(d.currentTurnId);
  d.turnIndex+=1;
  while(d.turnIndex < d.turnOrder.length && d.endedTurns.has(d.turnOrder[d.turnIndex])) d.turnIndex+=1;
  if(d.turnIndex < d.turnOrder.length){
    d.currentTurnId=d.turnOrder[d.turnIndex];
    if(!d.usedSkills) d.usedSkills={};
    d.usedSkills[d.currentTurnId]=new Set();
    armTimer(room,d);
    return false;
  }
  // round over
  d.round+=1;
  tickCooldowns(d);
  d.endedTurns=new Set();
  buildTurnOrder(room,d);
  // mana regen
  for(const pid of d.memberIds){
    const p=room.players.find(x=>x.id===pid);
    if(p) p.mana=Math.min(p.maxMana, p.mana + (p.manaRegen||3));
  }
  d.log.push(`Round ${d.round} — ${room.players.find(p=>p.id===d.currentTurnId)?.name} starts.`);
  armTimer(room,d);
  if(d.round%3===0){
    setTimeout(()=>{
      if(d.status!=="fighting") return;
      for(const pid of d.memberIds){
        const pl=room.players.find(x=>x.id===pid);
        if(!pl) continue;
        const activeIds = (pl.activePetIds && pl.activePetIds.length ? pl.activePetIds : (pl.activePetId?[pl.activePetId]:[]));
        const maxPets = pl.character==="tamer"?3:2;
        for(const petId of activeIds.slice(0,maxPets)){
          const petDef=(CONTENT.pets||[]).find(x=>x.id===petId);
          const petInst=(pl.pets||[]).find(x=>x.petId===petId);
          const petLevel=petInst?(petInst.level||1):1;
          const isTamer=pl.character==="tamer";
          const mult=isTamer?2:1;
          const lvlScale=1+petLevel*0.04;
          const pStats=petDef? (petDef.stats||{}) : {};
          const pAtk=(pStats.attack||0)+(petInst?(petInst.bonusAttack||0):0);
          const pMag=(pStats.magicPower||0)+(petInst?(petInst.bonusMagic||0):0);
          const pRes=(pStats.resistance||0)+(petInst?(petInst.bonusResist||0):0);
          if(petDef && petDef.buffKind && ["attack","magicBoost","defense"].includes(petDef.buffKind)){
            const bv=0.15*mult + (petDef.buffKind==="attack"?pAtk : petDef.buffKind==="magicBoost"?pMag : pRes)*0.01;
            d.buffId=(d.buffId||0)+1;
            d.buffs.push({uid:d.buffId, targetType:"player", targetId:pid, kind:petDef.buffKind, value:bv, turns:2, name:petDef.name});
            addFx(d,{type:"buff", actor:pid, target:"player", targetId:pid, kind:petDef.buffKind, value:bv, turns:2, petId});
          } else if(Math.random()<0.5){
            const before=pl.hp; const amt=Math.round((pl.maxHp*0.12*(1+(pl.healPower||0)/50) + pMag*3)*lvlScale*mult); heal(pl, amt); const h=pl.hp-before; if(h>0) addFx(d,{type:"heal", actor:pid, target:pid, amount:h, source:"pet", petId});
          } else {
            const amt=Math.round(((30+Math.floor(Math.random()*20)) + pMag*1.2)*lvlScale*mult); addShield(pl, amt, 1); addFx(d,{type:"shield", actor:pid, target:pid, amount:amt, petId});
          }
        }
      }
      if(typeof room.broadcast==="function") room.broadcast();
    },2000);
  }
  return true;
}
function publicPvp(d, room){
  if(!d) return null;
  return {
    id:d.id,
    memberIds:[...d.memberIds],
    status:d.status,
    round:d.round,
    turnOrder:d.turnOrder||[],
    currentTurnId:d.currentTurnId||null,
    buffs:d.buffs||[],
    usedSkills: d.usedSkills
      ? Object.fromEntries(Object.entries(d.usedSkills).map(([k, v]) => [k, [...(v || [])]]))
      : {},
    cooldowns: d.cooldowns || {},
    log:d.log||[],
    result:d.result||null,
  };
}
module.exports={ createPvp, getPvpFor, act, endTurn, leavePvp, publicPvp, buildTurnOrder };
