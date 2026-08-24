const { getDungeon, getDungeonSize } = require("../content");
const { spendStamina } = require("./town");
const { spawnWave } = require("./combat");

let dungeonCounter = 0;

function idleDungeon() {
  return {
    id: null,
    rank: null,
    size: null,
    leaderId: null,
    memberIds: [],
    status: "idle",
    open: true,
    round: 1,
    wave: [],
    phase: "players",
    turnOrder: [],
    turnIndex: 0,
    currentTurnId: null,
    buffs: [],
    buffId: 0,
    endedTurns: new Set(),
    usedSkills: {},
    fx: [],
    turnTimer: null,
    monsterQueue: [],
    monsterTimer: null,
    result: null,
    log: [],
  };
}

function delveUnderway(dungeon) {
  return dungeon.status === "fighting" || dungeon.status === "done";
}

function dungeonFor(room, player) {
  return (room.dungeons || []).find((d) => d.memberIds.includes(player.id)) || null;
}

function generateDungeonId() {
  dungeonCounter += 1;
  return "dg_" + dungeonCounter + "_" + Math.random().toString(36).slice(2, 8);
}

function clearDungeonTimers(d) {
  if (d.turnTimer) {
    clearTimeout(d.turnTimer);
    d.turnTimer = null;
  }
  if (d.monsterTimer) {
    clearTimeout(d.monsterTimer);
    d.monsterTimer = null;
  }
}

function removeDungeonFromRoom(room, d) {
  clearDungeonTimers(d);
  room.dungeons = (room.dungeons || []).filter((x) => x !== d);
}

function createParty(room, player, rank, size) {
  const dungeonDef = getDungeon(rank);
  const sizeDef = getDungeonSize(size);
  if (!dungeonDef || !sizeDef) {
    throw new Error("Unknown dungeon or size.");
  }
  if (player.endedDay) {
    throw new Error("You have already ended this day.");
  }
  const existing = dungeonFor(room, player);
  if (existing) {
    throw new Error("You are already in a party. Leave first.");
  }
  const d = {
    ...idleDungeon(),
    id: generateDungeonId(),
    rank: dungeonDef.rank,
    size: sizeDef.id,
    leaderId: player.id,
    memberIds: [player.id],
    status: "forming",
    open: true,
  };
  if (!room.dungeons) room.dungeons = [];
  room.dungeons.push(d);
  player.dungeonId = d.id;
  return d;
}

function joinPartyById(room, player, dungeonId) {
  if (player.endedDay) {
    throw new Error("You have already ended this day.");
  }
  const existing = dungeonFor(room, player);
  if (existing) {
    throw new Error("You are already in a party. Leave first.");
  }
  const d = (room.dungeons || []).find((x) => x.id === dungeonId);
  if (!d) {
    throw new Error("That party no longer exists.");
  }
  if (d.status !== "forming" || !d.open) {
    throw new Error("That party is no longer joinable.");
  }
  if (d.memberIds.includes(player.id)) {
    throw new Error("You are already in that party.");
  }
  if (d.memberIds.length >= room.maxPlayers) {
    throw new Error("That party is full.");
  }
  if (delveUnderway(d)) {
    throw new Error("That delve has already started.");
  }
  d.memberIds.push(player.id);
  player.dungeonId = d.id;
  return d;
}

function joinDungeon(room, player, rank, size) {
  const dungeonDef = getDungeon(rank);
  const sizeDef = getDungeonSize(size);
  if (!dungeonDef || !sizeDef) {
    throw new Error("Unknown dungeon or size.");
  }
  if (player.endedDay) {
    throw new Error("You have already ended this day.");
  }
  const existing = dungeonFor(room, player);
  if (existing) {
    return existing;
  }
  const party = (room.dungeons || []).find(
    (d) =>
      d.status === "forming" &&
      d.open &&
      d.rank === dungeonDef.rank &&
      d.size === sizeDef.id &&
      d.memberIds.length < room.maxPlayers
  );
  if (party) {
    party.memberIds.push(player.id);
    player.dungeonId = party.id;
    return party;
  }
  return createParty(room, player, rank, size);
}

function leaveDungeon(room, player) {
  const d = dungeonFor(room, player);
  if (!d) return null;
  if (delveUnderway(d)) {
    throw new Error("Finish the delve first.");
  }
  d.memberIds = d.memberIds.filter((id) => id !== player.id);
  player.dungeonId = null;
  if (d.memberIds.length === 0) {
    removeDungeonFromRoom(room, d);
    return null;
  }
  if (d.leaderId === player.id) {
    d.leaderId = d.memberIds[0];
  }
  return d;
}

function startDungeon(room, player) {
  const d = dungeonFor(room, player);
  if (!d || d.status !== "forming" || !d.rank || !d.size) {
    throw new Error("Gather a party first.");
  }
  if (d.leaderId !== player.id) {
    throw new Error("Only the delve leader may start.");
  }
  const sizeDef = getDungeonSize(d.size);
  const members = d.memberIds.map((id) => room.players.find((p) => p.id === id));
  if (members.some((m) => !m)) {
    throw new Error("A party member is missing.");
  }
  for (const m of members) {
    if (m.endedDay) {
      throw new Error(`${m.name} has already ended the day.`);
    }
    if (m.stamina < sizeDef.stamina) {
      throw new Error(`${m.name} needs ${sizeDef.stamina} stamina.`);
    }
  }
  for (const m of members) {
    spendStamina(m, sizeDef.stamina);
    m.hp = m.maxHp;
    m.mana = m.maxMana;
  }
  d.open = false;
  spawnWave(room, d);
  return d;
}

function returnFromDungeon(room, player) {
  const d = dungeonFor(room, player);
  if (!d) return null;
  if (d.status === "fighting" && d.phase === "players" && d.currentTurnId === player.id) {
    // leaving mid-turn: clear timer and advance cleanly
    if (d.turnTimer) {
      clearTimeout(d.turnTimer);
      d.turnTimer = null;
    }
  }
  d.memberIds = d.memberIds.filter((id) => id !== player.id);
  player.dungeonId = null;
  player.hp = player.maxHp;
  player.mana = player.maxMana;
  if (d.memberIds.length === 0) {
    removeDungeonFromRoom(room, d);
    return null;
  }
  if (d.leaderId === player.id) {
    d.leaderId = d.memberIds[0];
  }
  // Fix combat turnOrder if fighting
  if (d.status === "fighting") {
    d.turnOrder = (d.turnOrder || []).filter((id) => id !== player.id);
    if (d.endedTurns && d.endedTurns.has) d.endedTurns.delete(player.id);
    if (d.usedSkills && d.usedSkills[player.id]) delete d.usedSkills[player.id];
    // adjust turnIndex if needed
    if (d.phase === "players") {
      if (d.currentTurnId === player.id) {
        // player fled on their turn – advance
        if (d.turnIndex < d.turnOrder.length) {
          d.currentTurnId = d.turnOrder[d.turnIndex] || null;
          if (d.currentTurnId) {
            d.usedSkills[d.currentTurnId] = d.usedSkills[d.currentTurnId] || new Set();
            // re-arm timer for next player if broadcast will be called
          }
        } else {
          // turn order exhausted – go to monster phase
          d.currentTurnId = null;
          // monster phase will be triggered by caller if needed; for flee we just end turn progression
        }
      } else {
        // adjust index if removed player was before current index
        const removedIdx = d.turnOrder.indexOf(player.id);
        // turnOrder already filtered, handle index shift
        if (removedIdx !== -1 && removedIdx < d.turnIndex) {
          d.turnIndex = Math.max(0, d.turnIndex - 1);
        }
      }
    }
    d.buffs = (d.buffs || []).filter((b) => !(b.targetType === "player" && b.targetId === player.id));
  }
  return d;
}

function cleanupPlayerFromDungeons(room, playerId) {
  for (const d of [...(room.dungeons || [])]) {
    if (!d.memberIds.includes(playerId)) continue;
    if (d.status === "fighting" || d.status === "done") {
      // treat as flee/return – remove without requiring finish
      d.memberIds = d.memberIds.filter((id) => id !== playerId);
      if (d.memberIds.length === 0) {
        removeDungeonFromRoom(room, d);
      } else {
        if (d.leaderId === playerId) d.leaderId = d.memberIds[0];
        d.turnOrder = (d.turnOrder || []).filter((id) => id !== playerId);
        if (d.endedTurns && d.endedTurns.delete) d.endedTurns.delete(playerId);
        if (d.usedSkills && d.usedSkills[playerId]) delete d.usedSkills[playerId];
        d.buffs = (d.buffs || []).filter((b) => !(b.targetType === "player" && b.targetId === playerId));
        if (d.currentTurnId === playerId) {
          clearDungeonTimers(d);
          d.currentTurnId = d.turnOrder[d.turnIndex] || null;
        }
      }
    } else {
      d.memberIds = d.memberIds.filter((id) => id !== playerId);
      if (d.memberIds.length === 0) {
        removeDungeonFromRoom(room, d);
      } else if (d.leaderId === playerId) {
        d.leaderId = d.memberIds[0];
      }
    }
  }
}

function resetRoomDungeons(room) {
  for (const d of room.dungeons || []) {
    clearDungeonTimers(d);
  }
  room.dungeons = [];
  for (const p of room.players) {
    p.dungeonId = null;
  }
}

function publicDungeon(d) {
  if (!d) return null;
  const def = d.rank ? getDungeon(d.rank) : null;
  const sizeDef = d.size ? getDungeonSize(d.size) : null;
  return {
    id: d.id,
    rank: d.rank,
    size: d.size,
    label: def ? def.label : null,
    image: def ? def.image : null,
    stamina: sizeDef ? sizeDef.stamina : null,
    leaderId: d.leaderId,
    memberIds: [...(d.memberIds || [])],
    status: d.status,
    open: d.open !== false,
    round: d.round,
    phase: d.phase,
    turnOrder: d.turnOrder || [],
    turnIndex: d.turnIndex || 0,
    currentTurnId: d.currentTurnId || null,
    buffs: d.buffs || [],
    usedSkills: d.usedSkills
      ? Object.fromEntries(Object.entries(d.usedSkills).map(([k, v]) => [k, [...(v || [])]]))
      : {},
    wave: (d.wave || []).map((m) => ({ id: m.id, kind: m.kind, name: m.name, image: m.image, hp: m.hp, maxHp: m.maxHp })),
    result: d.result,
    log: d.log,
  };
}

module.exports = {
  idleDungeon,
  createParty,
  joinPartyById,
  joinDungeon,
  leaveDungeon,
  startDungeon,
  returnFromDungeon,
  publicDungeon,
  dungeonFor,
  resetRoomDungeons,
  cleanupPlayerFromDungeons,
  delveUnderway,
};
