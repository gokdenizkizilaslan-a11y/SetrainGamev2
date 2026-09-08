const { CONTENT, getSkill, getClassBasicAttack } = require("../content");
const { dealDamage, addShield, heal } = require("./players");

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
    if(p){ p.hp=p.maxHp; p.mana=p.maxMana; p.shield=0; p.maxShield=0; }
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
    if(p){ p.pvpId=null; p.hp=p.maxHp; p.mana=p.maxMana; p.shield=0; p.maxShield=0; }
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
function act(room, player, skillId){
  const d=getPvpFor(room,player);
  if(!d||d.status!=="fighting") throw new Error("No PvP in progress.");
  if(d.currentTurnId!==player.id) throw new Error("Not your turn.");
  if(player.hp<=0) throw new Error("You are down.");
  const skill=resolveSkill(player,skillId);
  if(!skill) throw new Error("Unknown skill.");
  const used=(d.usedSkills[player.id]||new Set());
  if(used.has(skillId)) throw new Error("Skill already used this turn.");
  if(player.mana < (skill.mana||0)) throw new Error("Not enough mana.");
  // find opponent
  const oppId = d.memberIds.find(id=>id!==player.id);
  const opponent = room.players.find(p=>p.id===oppId);
  if(!opponent || opponent.hp<=0) throw new Error("Opponent down.");
  player.mana -= (skill.mana||0);
  used.add(skillId); d.usedSkills[player.id]=used;
  if(skill.mana) addFx(d,{type:"mana", actor:player.id, amount:skill.mana, skill:skill.id});
  // damage
  if(skill.power){
    const isPhysical = !skill.element || skill.element==="physical";
    const base = isPhysical? player.attack : player.magicPower;
    const critChance = player.critChance/100 || 0.12;
    const crit = Math.random()<critChance;
    const critMult = crit? 1+ (player.critDamage||40)/100 :1;
    const pAtk = buffSum(d,"player",player.id,"attack") - buffSum(d,"player",player.id,"weaken");
    const pDef = buffSum(d,"player",oppId,"defense");
    const pExp = buffSum(d,"player",oppId,"expose");
    let dmg = Math.max(1, Math.round(base*skill.power*(1+Math.random()*0.4-0.2)*critMult*(1+pAtk)*(1-pDef+pExp)));
    dmg -= Math.round(opponent.resistance* (CONTENT.combat.resistanceMitigation||0.25));
    dmg=Math.max(1,dmg);
    // shield vs hp
    if(skill.element==="dark" && CONTENT.darkTrait) dmg=Math.round(dmg* (CONTENT.darkTrait.deal||1.3));
    dealDamage(opponent,dmg);
    addFx(d,{type:"damage", actor:player.id, target:"player", targetId:oppId, amount:dmg, elem:skill.element||"physical", effect:skill.effect||skill.element||"slash", crit});
    if(skill.lifesteal){
      const before=player.hp; heal(player, Math.round(dmg*skill.lifesteal));
      const h=player.hp-before; if(h>0) addFx(d,{type:"heal", actor:player.id, target:player.id, amount:h, source:"lifesteal"});
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
        addShield(room.players.find(p=>p.id===targetId), e.value);
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
  d.endedTurns=new Set();
  buildTurnOrder(room,d);
  // mana regen
  for(const pid of d.memberIds){
    const p=room.players.find(x=>x.id===pid);
    if(p) p.mana=Math.min(p.maxMana, p.mana + (p.manaRegen||3));
  }
  d.log.push(`Round ${d.round} — ${room.players.find(p=>p.id===d.currentTurnId)?.name} starts.`);
  armTimer(room,d);
  // pet act every 3 rounds 2s delay (reuse combat petAct logic simple)
  if(d.round%3===0){
    setTimeout(()=>{
      if(d.status!=="fighting") return;
      // simple pet heal
      for(const pid of d.memberIds){
        const pl=room.players.find(x=>x.id===pid);
        if(!pl||!pl.activePetId) continue;
        if(Math.random()<0.5){
          const before=pl.hp; heal(pl, Math.round(pl.maxHp*0.12*(1+(pl.healPower||0)/50)));
          const h=pl.hp-before; if(h>0){ addFx(d,{type:"heal", actor:pid, target:pid, amount:h, source:"pet"}); }
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
    log:d.log||[],
    result:d.result||null,
  };
}
module.exports={ createPvp, getPvpFor, act, endTurn, leavePvp, publicPvp, buildTurnOrder };
