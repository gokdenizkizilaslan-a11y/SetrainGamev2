const { CONTENT, getSkill, getClassBasicAttack, getPetSlots, getPetPowerMult, resolveDamageStat } = require("../content");
const { dealDamage, addShield, heal, tickShields, removeShieldInstance } = require("./players");
const passives = require("./passives");

// Tur sonu: DoT/regen tick + süresi biten buff/kalkanları düşür (PvE tickBuffs'un PvP karşılığı).
// Olmazsa buff'lar sonsuz birikir, combo'lar perma-proc yer.
function tickPvpBuffs(room, d) {
  if (!d.buffs || !d.buffs.length) {
    for (const pid of d.memberIds || []) {
      const pl = room.players.find(x => x.id === pid);
      if (pl) { try { tickShields(pl); } catch (e) {} }
    }
    return;
  }
  for (const b of d.buffs) {
    if (b.kind === "dot") {
      const p = room.players.find(q => q.id === b.targetId);
      if (p && p.hp > 0) {
        const dmg = Math.max(1, Math.round(p.maxHp * b.value));
        dealDamage(p, dmg);
        addFx(d, { type: "damage", actor: b.sourceId, target: "player", targetId: p.id, amount: dmg, source: "dot", effect: "dot" });
      }
    } else if (b.kind === "regen") {
      const p = room.players.find(q => q.id === b.targetId);
      if (p && p.hp > 0 && p.hp < p.maxHp) {
        const before = p.hp;
        heal(p, healKept(d, "player", p.id, Math.max(1, Math.round(p.maxHp * b.value))));
        const h = p.hp - before;
        if (h > 0) addFx(d, { type: "heal", actor: p.id, target: p.id, amount: h, source: "regen", effect: "heal" });
      }
    }
  }
  for (const pid of d.memberIds || []) {
    const pl = room.players.find(x => x.id === pid);
    if (pl) { try { tickShields(pl); } catch (e) {} }
  }
  d.buffs = d.buffs.filter(b => --b.turns > 0);
}

let pvpCounter = 0;
function genId() { pvpCounter+=1; return "pvp_"+pvpCounter+"_"+Math.random().toString(36).slice(2,6); }
let inviteCounter = 0;
function genInviteId() { inviteCounter+=1; return "pvpi_"+inviteCounter+"_"+Math.random().toString(36).slice(2,6); }
const INVITE_TTL_MS = 25000;

function pendingInvites(room) {
  if (!room.pvpInvites) room.pvpInvites = [];
  return room.pvpInvites;
}
// Savaşın ortasında (fighting/done) olan oyuncu bölünemez; sadece lobide
// (forming/waiting) bekleyen otomatik ayrılabilir.
function fightingBlocker(room, player) {
  const d = (room.dungeons || []).find(x => (x.memberIds || []).includes(player.id));
  if (d && (d.status === "fighting" || d.status === "done")) return "Finish your battle first.";
  const b = (room.bossParties || []).find(x => (x.memberIds || []).includes(player.id));
  if (b && b.status === "fighting") return "Finish your battle first.";
  return null;
}
function leaveLobbyQuietly(room, player) {
  const d = (room.dungeons || []).find(x => (x.memberIds || []).includes(player.id));
  if (d && (d.status === "forming" || d.status === "waiting")) {
    if (d.turnTimer) { try { clearTimeout(d.turnTimer); } catch (e) {} d.turnTimer = null; }
    d.memberIds = d.memberIds.filter(id => id !== player.id);
    if (d.buffs) d.buffs = d.buffs.filter(bb => !(bb.targetType === "player" && String(bb.targetId) === String(player.id)));
    if (d.usedSkills && d.usedSkills[player.id]) delete d.usedSkills[player.id];
    if (d.endedTurns && d.endedTurns.has) d.endedTurns.delete(player.id);
    if (d.turnOrder) d.turnOrder = d.turnOrder.filter(id => id !== player.id);
    if (d.leaderId === player.id) d.leaderId = d.memberIds[0] || null;
    if (d.memberIds.length === 0) room.dungeons = (room.dungeons || []).filter(x => x !== d);
    player.dungeonId = null;
  }
  const b = (room.bossParties || []).find(x => (x.memberIds || []).includes(player.id));
  if (b && b.status === "waiting") {
    b.memberIds = b.memberIds.filter(id => id !== player.id);
    if (b.leaderId === player.id) b.leaderId = b.memberIds[0] || null;
    if (b.memberIds.length === 0) room.bossParties = (room.bossParties || []).filter(x => x !== b);
    player.bossId = null;
  }
}
function clearInviteTimer(inv) { if (inv && inv.timer) { try { clearTimeout(inv.timer); } catch (e) {} inv.timer = null; } }
function removeInvite(room, inviteId) {
  const list = pendingInvites(room);
  const inv = list.find(x => x.id === inviteId);
  if (inv) clearInviteTimer(inv);
  room.pvpInvites = list.filter(x => x.id !== inviteId);
}
function invitesFor(room, playerId) {
  return pendingInvites(room).filter(x => x.toId === playerId || x.fromId === playerId);
}
function invitePvp(room, challenger, targetId) {
  const target = room.players.find(p => p.id === targetId);
  if (!target) throw new Error("Target not found.");
  if (challenger.id === targetId) throw new Error("Cannot challenge yourself.");
  if (challenger.lives <= 0 || target.lives <= 0) throw new Error("Fallen players cannot PvP.");
  if (getPvpFor(room, challenger)) throw new Error("Already in PvP.");
  if (getPvpFor(room, target)) throw new Error("Target already in PvP.");
  const bc = fightingBlocker(room, challenger);
  if (bc) throw new Error(bc);
  const bt = fightingBlocker(room, target);
  if (bt) throw new Error("Target is in battle.");
  const existing = pendingInvites(room).find(x =>
    (x.fromId === challenger.id && x.toId === targetId) ||
    (x.fromId === targetId && x.toId === challenger.id));
  if (existing) throw new Error("A duel invite is already pending.");
  const inv = { id: genInviteId(), fromId: challenger.id, toId: targetId, expiresAt: Date.now() + INVITE_TTL_MS, timer: null };
  inv.timer = setTimeout(() => {
    removeInvite(room, inv.id);
    if (typeof room.broadcast === "function") { try { room.broadcast(); } catch (e) {} }
  }, INVITE_TTL_MS);
  pendingInvites(room).push(inv);
  return inv;
}
function respondPvp(room, player, inviteId, accept) {
  const inv = pendingInvites(room).find(x => x.id === inviteId);
  if (!inv) throw new Error("That invite has expired.");
  if (inv.toId !== player.id) throw new Error("That invite is not for you.");
  const challenger = room.players.find(p => p.id === inv.fromId);
  const target = room.players.find(p => p.id === inv.toId);
  if (!challenger || !target) { removeInvite(room, inviteId); throw new Error("That invite has expired."); }
  if (!accept) { removeInvite(room, inviteId); return { declined: true }; }
  if (challenger.lives <= 0 || target.lives <= 0) { removeInvite(room, inviteId); throw new Error("Fallen players cannot PvP."); }
  if (getPvpFor(room, challenger) || getPvpFor(room, target)) { removeInvite(room, inviteId); throw new Error("Someone is already in PvP."); }
  const bc = fightingBlocker(room, challenger);
  const bt = fightingBlocker(room, target);
  if (bc || bt) { removeInvite(room, inviteId); throw new Error("Someone entered a battle — invite cancelled."); }
  removeInvite(room, inviteId);
  // Kabul eden/eden lobiden sessizce ayrılır (liderlik devredilir), düelloya gider.
  leaveLobbyQuietly(room, challenger);
  leaveLobbyQuietly(room, target);
  // İki taraf arasında bekleyen diğer davetleri temizle.
  for (const other of [...pendingInvites(room)]) {
    if (other.fromId === challenger.id || other.toId === challenger.id ||
        other.fromId === target.id || other.toId === target.id) removeInvite(room, other.id);
  }
  return { duel: createPvp(room, challenger, target.id) };
}
function cancelInvite(room, player, inviteId) {
  const inv = pendingInvites(room).find(x => x.id === inviteId);
  if (!inv) return;
  if (inv.fromId !== player.id && inv.toId !== player.id) throw new Error("That invite is not yours.");
  removeInvite(room, inviteId);
}
function cleanupInvitesFor(room, socketId) {
  for (const inv of [...pendingInvites(room)]) {
    if (inv.fromId === socketId || inv.toId === socketId) removeInvite(room, inv.id);
  }
}
function publicPvpInvites(room) {
  return pendingInvites(room).map(x => ({ id: x.id, fromId: x.fromId, toId: x.toId, expiresAt: x.expiresAt }));
}

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
  if(d.currentTurnId){ if(!d.usedSkills) d.usedSkills={}; d.usedSkills[d.currentTurnId]=new Set(); schedulePetAct(room,d,d.currentTurnId); }
}
// PvE ile aynı: sıra kime geçerse 400ms sonra pet'i oynar.
function schedulePetAct(room, d, playerId){
  const player = room.players.find(p=>p.id===playerId);
  if(!player || !d || d.status!=="fighting") return;
  if(player.petTurn==null) player.petTurn=0;
  player.petTurn += 1;
  setTimeout(()=>{
    if(!d || d.status!=="fighting" || d.currentTurnId!==playerId) return;
    if(!(d.memberIds||[]).includes(playerId)) return;
    petActForPlayer(room,d,player);
  }, 400);
}
// PvE petActForPlayer'ın PvP karşılığı: heal/shield kendine, attack/debuff rakibe.
// Formüller (lvlScale, mult, pMag/pAtk katkısı, interval kapısı) birebir aynı.
function petActForPlayer(room, d, player){
  if(!player || player.hp<=0 || !d || d.status!=="fighting") return;
  const oppId = (d.memberIds||[]).find(id=>id!==player.id);
  const opponent = room.players.find(p=>p.id===oppId);
  const activeIds = (player.activePetIds && player.activePetIds.length ? player.activePetIds : (player.activePetId?[player.activePetId]:[]));
  const maxPets = getPetSlots(player.character);
  const petIds = activeIds.slice(0,maxPets);
  for(let pi=0; pi<petIds.length; pi++){
    const activePetId = petIds[pi];
    const petDef = (CONTENT.pets||[]).find(p=>p.id===activePetId);
    if(!petDef) continue;
    const petInst = (player.pets||[]).find(p=>p.petId===activePetId);
    const petLevel = petInst ? (petInst.level||1) : 1;
    const mult = getPetPowerMult(player.character);
    const lvlScale = 1 + petLevel*0.04;
    const pStats = petDef.stats||{};
    const pAtk = (pStats.attack||0)+(petInst?(petInst.bonusAttack||0):0);
    const pMag = (pStats.magicPower||0)+(petInst?(petInst.bonusMagic||0):0);
    const pRes = (pStats.resistance||0)+(petInst?(petInst.bonusResist||0):0);
    const skills = petDef.petSkills || (petDef.buffKind ? [{kind: petDef.buffKind, value:0.15, interval:2, element: petDef.element}] : []);
    let toUse = [];
    if(skills.length){
      for(const sk of skills){
        const interval = sk.interval||2;
        if((player.petTurn||0) % interval !== 0) continue;
        toUse.push(sk);
      }
      if(!toUse.length) continue;
    } else {
      const roll=Math.random();
      if(roll<0.35) toUse.push({kind:"heal", value:0.12, interval:2});
      else if(roll<0.6) toUse.push({kind:"shield", value:30, interval:2});
      else if(roll<0.85) toUse.push({kind:"weaken", value:0.15, interval:2});
      else toUse.push({kind:"attack", value:0.6, interval:1});
    }
    const petDelayBase = pi*500;
    toUse.forEach((sk, idx)=>{
      setTimeout(()=>{
        if(!d || d.status!=="fighting" || d.currentTurnId!==player.id) return;
        if(!(d.memberIds||[]).includes(player.id)) return;
        const pid = player.id;
        if(sk.kind==="heal"){
          const amt=healKept(d, "player", player.id, Math.max(1, Math.round((player.maxHp*(sk.value||0.12)*(1+(player.healPower||0)/50)+pMag*3)*lvlScale*mult)));
          const before=player.hp; heal(player, amt); const healed=player.hp-before;
          if(healed>0){ addFx(d,{type:"heal", actor:pid, target:"player", targetId:pid, amount:healed, source:"pet", petId:petDef.id, effect:"heal"}); d.log.push(`${petDef.name} heals ${player.name} for ${healed} HP!`); if(typeof room.broadcast==="function") room.broadcast(); }
        } else if(sk.kind==="shield"){
          const amt=Math.round(((sk.value||30)+pMag*1.2)*lvlScale*mult*passives.shieldGainMult(player));
          addShield(player, amt, 1); addFx(d,{type:"shield", actor:pid, target:"player", targetId:pid, amount:amt, petId:petDef.id, effect:"radiant_halo_shield", vfxId:"radiant_halo_shield", sound:"shield"}); d.log.push(`${petDef.name} shields ${player.name} for ${amt}!`); if(typeof room.broadcast==="function") room.broadcast();
        } else if(sk.kind==="attack"){
          if(!opponent || opponent.hp<=0) return;
          const base=player.magicPower > player.attack ? player.magicPower : player.attack;
          const dmg=Math.max(1, Math.round((base*(sk.value||0.6)+Math.max(pAtk,pMag)*2)*lvlScale*mult*(1+Math.random()*0.4-0.2)));
          const _pElem = sk.element || petDef.element || "physical";
          const _pEl = (CONTENT.elements||[]).find(e=>e.id===_pElem);
          const vfxId = (_pEl && _pEl.effect) || "element_"+_pElem;
          const sndId = (_pEl && _pEl.sound) || "";
          dealDamage(opponent, dmg);
          addFx(d,{type:"damage", actor:pid, target:"player", targetId:oppId, amount:dmg, source:"pet", petId:petDef.id, elem:_pElem, effect:sk.element||petDef.element||"slash", vfxId, sound:sndId});
          d.log.push(`${petDef.name} hits ${opponent.name} for ${dmg}!`);
          if(opponent.hp<=0 && passives.maybeSecondWind(opponent)) d.log.push(`${opponent.name} refuses to fall!`);
          if(opponent.hp<=0){ d.status="done"; d.result={outcome:"victory", text:`${player.name} wins the duel!`}; addFx(d,{type:"result", outcome:"victory"}); d.log.push(d.result.text); clearTimer(d); }
          if(typeof room.broadcast==="function") room.broadcast();
        } else if(sk.kind==="weaken" || sk.kind==="frozen" || sk.kind==="wet"){
          if(!opponent || opponent.hp<=0) return;
          const k=sk.kind==="weaken"?"pet_weaken":sk.kind;
          const v=(sk.value||0.15)*mult + pAtk*0.005;
          d.buffId=(d.buffId||0)+1; d.buffs.push({uid:d.buffId, targetType:"player", targetId:oppId, kind:k, value:v, turns:sk.duration||2, name:petDef.name});
          addFx(d,{type:"buff", actor:pid, target:"player", targetId:oppId, kind:k, value:v, turns:sk.duration||2, petId:petDef.id, vfxId: sk.kind==="frozen"?"frost_prison_dome": sk.kind==="wet"?"tidal_wave_water":"blood_curse_mist"});
          d.log.push(`${petDef.name} ${sk.kind}s ${opponent.name}!`); if(typeof room.broadcast==="function") room.broadcast();
        } else if(sk.kind==="attack" || sk.kind==="magicBoost" || sk.kind==="defense"){
          const petKind = sk.kind==="attack"?"pet_attack": sk.kind==="magicBoost"?"pet_magic":"pet_defense";
          const bv=(sk.value||0.15)*mult + (sk.kind==="attack"?pAtk : sk.kind==="magicBoost"?pMag : pRes)*0.01;
          d.buffId=(d.buffId||0)+1; d.buffs.push({uid:d.buffId, targetType:"player", targetId:pid, kind:petKind, value:bv, turns:2, name:petDef.name});
          addFx(d,{type:"buff", actor:pid, target:"player", targetId:pid, kind:petKind, value:bv, turns:2, petId:petDef.id, vfxId: petKind==="pet_attack"?"cross_cut_x_slash": petKind==="pet_magic"?"frost_crystal_spear":"radiant_halo_shield"});
          d.log.push(`${petDef.name} buffs ${player.name} ${petKind} +${Math.round(bv*100)}%!`); if(typeof room.broadcast==="function") room.broadcast();
        }
      }, petDelayBase + idx*350);
    });
  }
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
        for (const s of passives.shieldStartFor(p, p.maxHp)) addShield(p, s.amount, s.turns);
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

// Mortal Wounds: hedefin üzerindeki healblock, ALACAĞI tüm iyileşmeyi kısar.
function healKept(d, targetType, targetId, amount) {
  const m = passives.healTakenMultFromBuffs(d.buffs, targetType, targetId);
  return m >= 1 ? amount : Math.max(0, Math.round(amount * m));
}
// Wounds pasifi (class/ırk): vuranın hasarı hedefe healblock bulaştırır.
function maybeApplyWounds(room, d, attacker, skill, oppId, dealt) {
  if (!(dealt > 0)) return;
  let wnd = null;
  try { wnd = passives.woundsOnHit(attacker); } catch (e) {}
  if (!wnd || !(wnd.value > 0) || Math.random() >= wnd.chance) return;
  const opp = room.players.find(p => p.id === oppId);
  if (!opp || opp.hp <= 0) return;
  d.buffId = (d.buffId || 0) + 1;
  d.buffs.push({ uid: d.buffId, targetType: "player", targetId: oppId, kind: "healblock", value: wnd.value, turns: wnd.duration, skillId: skill && skill.id });
  addFx(d, { type: "buff", actor: attacker.id, target: "player", targetId: oppId, kind: "healblock", value: wnd.value, turns: wnd.duration });
  d.log.push(`${attacker.name}'s wounds fester on ${opp.name}!`);
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
  const pvpExec = passives.executeFor(player);
  if(pvpExec && pvpExec.belowHpPct != null && opponent.maxHp > 0
      && opponent.hp / opponent.maxHp > Number(pvpExec.belowHpPct)) {
    throw new Error(`Your passive execution needs the target below ${Math.round(Number(pvpExec.belowHpPct) * 100)}% HP.`);
  }
  player.mana -= (skill.mana||0);
  used.add(skillId); d.usedSkills[player.id]=used;
  setCooldown(d,player.id,skillId,skill.cooldown);
  if(skill.mana) addFx(d,{type:"mana", actor:player.id, amount:skill.mana, skill:skill.id});
  if(skill.power || skill.baseDamage || (skill.secondHit && Number(skill.secondHit.mult) > 0)){
    const statKey = resolveDamageStat(skill);
    const isPhysical = statKey === "attack";
    const base = player[statKey] || 0;
    let skillBase = 0;
    let pvpTrueFormula = null;
    if (skill.baseDamage != null && typeof skill.baseDamage === "object") {
      const bst = skill.baseDamage.stat || "attack";
      const bm = Number(skill.baseDamage.mult) || 0;
      if (skill.baseDamage.true) {
        pvpTrueFormula = { stat: bst, mult: bm };
      } else {
        const bval = bst === "targetMaxHp" ? opponent.maxHp : bst === "targetHp" ? opponent.hp : (player[bst] || 0);
        skillBase = Math.max(0, Math.round(bval * bm));
      }
    } else {
      skillBase = Math.max(0, Math.round(Number(skill.baseDamage) || 0));
    }
    const pCrit = passives.critBonus(player);
    const critChance = (player.critChance + pCrit.chance)/100 || 0.12;
    const crit = skill.trueDamage ? false : Math.random()<critChance;
    const critMult = crit? 1+ ((player.critDamage||40) + pCrit.damage)/100 :1;
    // PvE ile aynı: pet buff/debuff'ları (pet_attack/pet_magic/pet_weaken/...) hesaba katılır.
    const pAtk = buffSum(d,"player",player.id,"attack") + buffSum(d,"player",player.id,"pet_attack") - buffSum(d,"player",player.id,"weaken") - buffSum(d,"player",player.id,"pet_weaken");
    const pMagic = buffSum(d,"player",player.id,"magicBoost") + buffSum(d,"player",player.id,"pet_magic") - buffSum(d,"player",player.id,"weaken") - buffSum(d,"player",player.id,"pet_weaken");
    const pBoost = isPhysical ? pAtk : pMagic;
    const pDef = buffSum(d,"player",oppId,"defense") + buffSum(d,"player",oppId,"pet_defense");
    const pExp = buffSum(d,"player",oppId,"expose") + buffSum(d,"player",oppId,"pet_expose");
    const oppHpPct = opponent.maxHp > 0 ? opponent.hp / opponent.maxHp : 1;
    const selfHpPct = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    // Dodge (PvE ile aynı): pasifi yoksa şans 0, oyun değişmez.
    try {
      const dodge = passives.dodgeChance(opponent);
      if (dodge > 0 && Math.random() < dodge) {
        d.log.push(`${opponent.name} dodged ${player.name}'s ${skill.name || "attack"}!`);
        armTimer(room, d);
        return d;
      }
    } catch (e) {}
    let dmg;
    if (skill.trueDamage) {
      // PvE ile aynı: exact sayı — variance/crit/buff/affinity/resistance yok, kalkan yine tutar.
      dmg = Math.max(1, Math.round(skillBase + base * (skill.power || 0)));
    } else {
      dmg = Math.max(1, Math.round((skillBase + base * (skill.power || 0))*(1+Math.random()*0.4-0.2)*critMult*(1+pBoost)*(1-pDef+pExp)));
    }
    if (!skill.trueDamage) {
      dmg = Math.max(1, Math.round(dmg * passives.damageOutMult(player, {
        targetHpPct: oppHpPct, selfHpPct, isFirst: !player._struckThisCombat,
        element: skill.element, targetTags: [],
      })));
      if(skill.bonusVsHighHp && skill.bonusVsHighHp.aboveHpPct != null
          && oppHpPct > Number(skill.bonusVsHighHp.aboveHpPct)) {
        dmg = Math.max(1, Math.round(dmg * (1 + (Number(skill.bonusVsHighHp.mult) || 0))));
      }
      dmg -= Math.max(0, Math.round(opponent.resistance * (CONTENT.combat.resistanceMitigation || 0.25) - passives.pierceFlat(player)));
      dmg=Math.max(1,dmg);
    }
    // İkinci vuruş (bölünmüş hasar): ayrı stat + element (PvE gibi rezistans yer).
    if (skill.secondHit && Number(skill.secondHit.mult) > 0) {
      const s2stat = skill.secondHit.stat || "magicPower";
      let s2 = Math.max(0, Math.round((player[s2stat] || 0) * Number(skill.secondHit.mult)));
      if (!skill.trueDamage) {
        s2 = Math.max(0, Math.round(s2 * (1 + Math.random() * 0.4 - 0.2)));
        s2 = Math.max(0, s2 - Math.max(0, Math.round(opponent.resistance * (CONTENT.combat.resistanceMitigation || 0.25))));
      }
      dmg = Math.max(1, dmg + s2);
    }
    dmg = Math.max(1, Math.round(dmg * passives.damageTakenMult(opponent, { fromElement: skill.element || "physical" })));
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
    maybeApplyWounds(room, d, player, skill, oppId, dmg);
    if (pvpTrueFormula) {
      const tb = pvpTrueFormula.stat === "targetMaxHp" ? opponent.maxHp
        : pvpTrueFormula.stat === "targetHp" ? opponent.hp
        : (player[pvpTrueFormula.stat] || 0);
      const truePart = Math.max(0, Math.round(tb * Number(pvpTrueFormula.mult || 0)));
      if (truePart > 0) {
        dealDamage(opponent, truePart);
        dmg += truePart;
      }
    }
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
    const echoSrc = skill.echo || passives.echoFor(player);
    if (echoSrc && Number(echoSrc.chance) > 0 && Math.random() < Number(echoSrc.chance) && opponent.hp > 0) {
      const echoDmg = Math.max(1, Math.round(dmg * Number(echoSrc.mult || 0.3)));
      dealDamage(opponent, echoDmg);
      addFx(d,{type:"damage", actor:player.id, target:"player", targetId:oppId, amount:echoDmg, elem:skill.element||"physical", effect:skill.effect||skill.element||"slash", sound:skill.sound||"", crit:false});
    }
    if(opponent.hp<=0 && passives.maybeSecondWind(opponent)){
      d.log.push(`${opponent.name} refuses to fall!`);
    }
    const thorns = passives.thornsMult(opponent);
    if (thorns > 0 && player.hp > 0) {
      const reflected = Math.max(1, Math.round(dmg * thorns));
      dealDamage(player, reflected);
      addFx(d,{type:"damage", actor:oppId, target:"player", targetId:player.id, amount:reflected, elem:"physical", effect:"blood_curse_mist", sound:"", crit:false});
      d.log.push(`${opponent.name}'s thorns bite ${player.name}!`);
      if(player.hp<=0) passives.maybeSecondWind(player);
    }
    addFx(d,{type:"damage", actor:player.id, target:"player", targetId:oppId, amount:dmg, elem:skill.element||"physical", effect:skill.effect||skill.element||"slash", sound:skill.sound||"", crit});
    if(skill.lifesteal){
      const before=player.hp; heal(player, healKept(d, "player", player.id, Math.round(dmg*skill.lifesteal)));
      const h=player.hp-before; if(h>0) addFx(d,{type:"heal", actor:player.id, target:player.id, amount:h, source:"lifesteal"});
    }
    // PvE parity: pasif can çalma + skill kendini iyileştirme + omnivamp (yoksa 0, oyun değişmez).
    try {
      const plife = passives.lifestealPct(player);
      if (plife > 0 && dmg > 0) {
        const before = player.hp;
        heal(player, healKept(d, "player", player.id, Math.max(1, Math.round(dmg * plife))));
        const h = player.hp - before;
        if (h > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: h, source: "passive" });
      }
    } catch (e) {}
    if (skill.healSelfPct && dmg > 0) {
      try {
        const before = player.hp;
        heal(player, healKept(d, "player", player.id, Math.max(1, Math.round(player.maxHp * skill.healSelfPct * passives.healBonusMult(player)))));
        const h = player.hp - before;
        if (h > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: h, source: "skill" });
      } catch (e) {}
    }
    if (player.omnivamp && dmg > 0) {
      const pct = (player.omnivamp || 0) / 100;
      if (pct > 0) {
        const before = player.hp;
        heal(player, healKept(d, "player", player.id, Math.max(1, Math.round(dmg * pct))));
        const h = player.hp - before;
        if (h > 0) addFx(d, { type: "heal", actor: player.id, target: player.id, amount: h, source: "omnivamp" });
      }
    }
    // Anomaly trait lifesteal (e.g. Sanguine Thirst): heals % of all damage dealt
    const traitFx = player.anomaly && player.anomaly.effect;
    if(traitFx && traitFx.type==="lifesteal" && traitFx.percent>0 && dmg>0){
      const before=player.hp; heal(player, healKept(d, "player", player.id, Math.max(1, Math.round(dmg*traitFx.percent))));
      const h=player.hp-before; if(h>0) addFx(d,{type:"heal", actor:player.id, target:player.id, amount:h, source:"trait_lifesteal"});
    }
  }
  // heal — PvE ile aynı: saldırı skill'inin `heal` alanı rakibi iyileştirmez.
  // 1v1'de heal hedefi her zaman kendin (ally/party/self hepsi self'e iner).
  if(skill.heal!=null && skill.target!=="enemy"){
    let baseHeal;
    if(typeof skill.heal==="object"){
      const stat=skill.heal.stat||"maxHp";
      const mult=skill.heal.mult||1;
      const bv = stat==="maxHp"? player.maxHp : player[stat]||0;
      baseHeal = bv*mult;
      const multHeal = 1 + (player.healPower||0)/50;
      const healed = heal(player, healKept(d, "player", player.id, Math.round(baseHeal*multHeal)));
      addFx(d,{type:"heal", actor:player.id, target:player.id, amount:healed, source:"skill"});
    } else {
      const multHeal = 1 + (player.healPower||0)/50;
      const healed = heal(player, healKept(d, "player", player.id, Math.round(player.maxHp*skill.heal*multHeal)));
      addFx(d,{type:"heal", actor:player.id, target:player.id, amount:healed, source:"skill"});
    }
  }
  // PvE parity: mana iadesi (yoksa 0, oyun değişmez).
  if(skill.manaRestore || skill.manaRestorePct){
    const amount = Math.round((skill.manaRestorePct||0)*player.maxMana + (skill.manaRestore||0));
    const gained = Math.min(player.maxMana, player.mana + amount) - player.mana;
    if(gained>0){
      player.mana += gained;
      addFx(d,{type:"mana", actor:player.id, amount:gained, skill:skill.id, restore:true});
    }
  }
  // buffs — her giriş kendi hedefine gider (debuff rakibe, buff kendine).
  if(skill.buffs){
    const targetType="player";
    const turns = skill.duration||1;
    for(const e of skill.buffs){
      const isDebuff = ["weaken","expose","dot","wet","frozen","healblock"].includes(e.kind);
      const targetId = isDebuff? oppId : player.id;
      if(e.kind==="shield"){
        const _tgt = room.players.find(p=>p.id===targetId);
        if(_tgt) addShield(_tgt, Math.round(e.value * passives.shieldGainMult(_tgt)));
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
    schedulePetAct(room,d,d.currentTurnId);
    armTimer(room,d);
    return false;
  }
  // round over
  d.round+=1;
  tickCooldowns(d);
  try { tickPvpBuffs(room, d); } catch (e) {}
  d.endedTurns=new Set();
  buildTurnOrder(room,d);
  // mana regen
  for(const pid of d.memberIds){
    const p=room.players.find(x=>x.id===pid);
    if(p) p.mana=Math.min(p.maxMana, p.mana + (p.manaRegen||3));
  }
  d.log.push(`Round ${d.round} — ${room.players.find(p=>p.id===d.currentTurnId)?.name} starts.`);
  armTimer(room,d);
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
module.exports={ createPvp, getPvpFor, act, endTurn, leavePvp, publicPvp, buildTurnOrder,
  invitePvp, respondPvp, cancelInvite, cleanupInvitesFor, invitesFor, publicPvpInvites, INVITE_TTL_MS };
