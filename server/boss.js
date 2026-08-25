const { getMonster } = require("../content");
const { spawnWave } = require("./combat");

let bossCounter = 0;
function genId() { bossCounter+=1; return "boss_"+bossCounter+"_"+Math.random().toString(36).slice(2,6); }

function bossFor(room, player) {
  return (room.bossParties||[]).find(b=> b.memberIds.includes(player.id)) || null;
}
function getBossParty(room, bossId) {
  return (room.bossParties||[]).find(b=> b.bossId===bossId) || null;
}

function createBossParty(room, player, bossId) {
  const bossDef = (require("../content").CONTENT.bosses||[]).find(b=>b.id===bossId);
  if (!bossDef) throw new Error("Unknown boss.");
  if (player.lives <=0) throw new Error("You have fallen. Must be revived.");
  if (player.endedDay) throw new Error("You have already ended this day.");
  // Check unlock
  if (bossDef.unlockAfter) {
    const kills = player.bossKills || [];
    if (!kills.includes(bossDef.unlockAfter)) throw new Error("Önceki boss öldürülmeli.");
  }
  // Check if boss already has a fighting party
  const existing = getBossParty(room, bossId);
  if (existing) {
    if (existing.status==="fighting") throw new Error("Bu boss'ta başka bir savaş yapılıyor.");
    if (existing.status==="waiting" && existing.memberIds.length < room.maxPlayers) {
      // join existing waiting party
      if (existing.memberIds.includes(player.id)) throw new Error("Zaten bu boss'tasın.");
      existing.memberIds.push(player.id);
      player.bossId = existing.id;
      return existing;
    }
    // if existing is waiting and full, create new? But spec says only 1 party per boss at a time, so if waiting exists, join it, not create new
    throw new Error("Bu boss için zaten bir bekleme odası var.");
  }
  // Check if player already in any boss party
  if (bossFor(room, player)) throw new Error("Zaten bir boss'tasın. Önce çık.");
  if (!room.bossParties) room.bossParties=[];
  const party = {
    id: genId(),
    bossId,
    label: bossDef.label,
    image: bossDef.image,
    leaderId: player.id,
    memberIds: [player.id],
    status: "waiting",
    hp: bossDef.hp,
    maxHp: bossDef.hp,
    attack: bossDef.attack,
    speed: bossDef.speed,
    element: bossDef.element,
    weaponId: bossDef.weaponId,
    chestId: bossDef.chestId,
    // combat fields when fighting
    wave: [],
    round:1,
    phase:"players",
    turnOrder:[],
    turnIndex:0,
    currentTurnId:null,
    buffs:[],
    buffId:0,
    endedTurns:new Set(),
    usedSkills:{},
    fx:[],
    turnTimer:null,
    monsterQueue:[],
    monsterTimer:null,
    result:null,
    log:[]
  };
  room.bossParties.push(party);
  player.bossId = party.id;
  return party;
}

function leaveBoss(room, player) {
  const b = bossFor(room, player);
  if (!b) return null;
  if (b.status==="fighting") throw new Error("Savaş bitmeden çıkamazsın.");
  b.memberIds = b.memberIds.filter(id=> id!==player.id);
  player.bossId=null;
  if (b.memberIds.length===0) {
    room.bossParties = room.bossParties.filter(x=> x!==b);
    return null;
  }
  if (b.leaderId===player.id) b.leaderId=b.memberIds[0];
  return b;
}

function startBoss(room, player) {
  const b = bossFor(room, player);
  if (!b || b.status!=="waiting") throw new Error("Bekleme odasında değilsin.");
  if (b.leaderId!==player.id) throw new Error("Only leader can start.");
  const members = b.memberIds.map(id=> room.players.find(p=>p.id===id)).filter(Boolean);
  for (const m of members) {
    if (m.endedDay) throw new Error(`${m.name} has already ended the day.`);
    if (m.lives<=0) throw new Error(`${m.name} is fallen.`);
    if (m.stamina < 4) throw new Error(`${m.name} needs 4 stamina.`);
  }
  for (const m of members) {
    const { spendStamina } = require("./town");
    spendStamina(m, 4);
    m.hp=m.maxHp; m.mana=m.maxMana;
  }
  // Build boss wave single floor with 1 boss (max 5 but for boss it's 1)
  const bossDef = (require("../content").CONTENT.bosses||[]).find(x=>x.id===b.bossId);
  const mon = getMonster(bossDef.id) || {id:bossDef.id, name:bossDef.label, image:bossDef.image, element:bossDef.element, hp:bossDef.hp, attack:bossDef.attack, speed:bossDef.speed};
  // For boss, use 6 skills: already defined as boss_xxx_skill1..6
  const { getSkill } = require("../content");
  const skills = [];
  for (let i=1;i<=6;i++) {
    const sid = `boss_${bossDef.id.replace('boss_','')}_skill${i}`;
    const s = getSkill(sid);
    if (s) skills.push(s);
  }
  if (!skills.length) {
    // fallback: generic 3 skills via monsterSkills
    try {
      const combat = require("./combat");
      // use monsterSkills logic: reuse combat's internal but we can just create basic
      skills.push({id:"auto_attack", name:"Strike", power:1, element:"physical"});
    } catch(e) {}
  }
  b.wave = [{
    id: `${bossDef.id}_0`,
    kind: bossDef.id,
    name: bossDef.label,
    image: bossDef.image,
    element: bossDef.element,
    hp: bossDef.hp,
    maxHp: bossDef.hp,
    attack: bossDef.attack,
    speed: bossDef.speed,
    skills: skills.length? skills : [{id:"auto_attack", name:"Strike", power:1, element:"physical"}]
  }];
  b.status="fighting";
  b.round=1;
  b.phase="players";
  b.buffs=[];
  b.buffId=0;
  b.endedTurns=new Set();
  b.usedSkills={};
  b.fx=[];
  b.monsterQueue=[];
  b.monsterTimer=null;
  b.log=[`${bossDef.label} appears! Floor 1/1`];
  // Build turn order - same as dungeon
  const living = members.filter(p=>p.lives>0 && p.hp>0);
  b.turnOrder = living.sort((a,b)=>b.speed-a.speed).map(p=>p.id);
  b.turnIndex=0;
  b.currentTurnId=b.turnOrder[0]||null;
  b.endedTurns = new Set();
  if (b.currentTurnId) b.usedSkills[b.currentTurnId]=new Set();
  // arm timer
  try { const combat = require("./combat"); if (combat.armTurnTimer) combat.armTurnTimer(room,b); } catch(e){}
  return b;
}

function publicBoss(b) {
  if (!b) return null;
  return {
    id: b.id,
    bossId: b.bossId,
    label: b.label,
    image: b.image,
    leaderId: b.leaderId,
    memberIds: [...(b.memberIds||[])],
    status: b.status,
    round: b.round,
    phase: b.phase,
    turnOrder: b.turnOrder||[],
    turnIndex: b.turnIndex||0,
    currentTurnId: b.currentTurnId||null,
    wave: (b.wave||[]).map(m=>({id:m.id, kind:m.kind, name:m.name, image:m.image, hp:m.hp, maxHp:m.maxHp})),
    result: b.result,
    log: b.log,
  };
}

module.exports = { createBossParty, leaveBoss, startBoss, bossFor, publicBoss, getBossParty };
