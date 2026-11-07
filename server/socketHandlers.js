const {
  CLASS_SLUGS,
  NAME_MIN,
  NAME_MAX,
} = require("./constants");
const rooms = require("./rooms");
const town = require("./town");
const tavern = require("./tavern");
const dungeon = require("./dungeon");
const combat = require("./combat");
const shop = require("./shop");
const merchant = require("./merchant");
const chest = require("./chest");
const stock = require("./stock");
const temple = require("./temple");
const quests = require("./quests");
const sessions = require("./sessions");
const pvp = require("./pvp");
const pets = require("./pets");
const travel = require("./travel");
const { onNewDay, equipItem, unequipSlot, setSkillLoadout, learnTreeNode, addXp } = require("./players");
const { CONTENT, publicCatalog, getClass } = require("../content");

function isDead(p) { return p && p.lives <= 0; }
function requireAlive(player) {
  if (isDead(player)) throw new Error("You have fallen. Seek The Essence of Life at the Ancient Temple to be revived.");
}

function sanitizeName(raw) {
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    throw new Error(`Name must be ${NAME_MIN}–${NAME_MAX} characters.`);
  }
  return name;
}

function sanitizeCharacter(raw, secret) {
  const character = String(raw || "").trim().toLowerCase();
  if (!CLASS_SLUGS.includes(character)) {
    throw new Error("Choose a valid class.");
  }
  const cls = getClass(character);
  if (cls && cls.baseClass) {
    throw new Error("Choose a base class.");
  }
  // Secret (test) classes: only with the right password. The password itself
  // never leaves the server — the client only sends what the user typed.
  if (cls && cls.secret && String(secret || "") !== String(cls.secret)) {
    throw new Error("That class is locked.");
  }
  return character;
}

function requireSetup(socket) {
  if (!socket.data.profile || !socket.data.mode) {
    throw new Error("Complete player setup first.");
  }
  return socket.data;
}

function emitError(socket, err) {
  socket.emit("server:error", { message: err.message || "Something went wrong." });
}

function gameContext(socket) {
  const room = rooms.getRoomForSocket(socket.id);
  if (!room) {
    throw new Error("You are not in a hall.");
  }
  if (room.status !== "playing") {
    throw new Error("The quest has not begun.");
  }
  const player = room.players.find((p) => p.id === socket.id);
  if (!player) {
    throw new Error("You are not seated in this hall.");
  }
  return { room, player };
}

function broadcastRoomList(io) {
  const list = rooms.listPublicLobbies();
  for (const [, sock] of io.of("/").sockets) {
    const inRoom = rooms.getRoomForSocket(sock.id);
    if (!inRoom && sock.data.mode === "multi" && sock.data.profile) {
      sock.emit("room:list", list);
    }
  }
}

function emitRoomState(io, room) {
  if (!room) return;
  io.to(room.id).emit("room:state", rooms.publicRoomState(room));
}

// Bir sefer (dünya) sadece kendi üyelerine yayınlanır; aynı odadaki başka
// dünyalar birbirinin pozisyon/keşif verisini görmez.
function emitToTravel(io, travel, event, payload) {
  if (!travel) return;
  for (const id of travel.members || []) io.to(id).emit(event, payload);
}

function emitCombatFx(io, room) {
  if (!room) return;
  const all = [...(room.dungeons || []), ...(room.bossParties || []), ...(room.pvpDuels || [])];
  for (const d of all) {
    if (!d.fx || !d.fx.length) continue;
    const fx = d.fx;
    d.fx = [];
    io.to(room.id).emit("combat:fx", { fx, dungeonId: d.id });
  }
}
function emitPvpFx(io, room){ emitCombatFx(io,room); }

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.data.mode = null;
    socket.data.profile = null;
    socket.emit("catalog", publicCatalog());

    socket.on("player:setup", (payload = {}) => {
      try {
        const mode = payload.mode === "single" ? "single" : payload.mode === "multi" ? "multi" : null;
        if (!mode) {
          throw new Error("Choose singleplayer or multiplayer.");
        }
        const name = sanitizeName(payload.name);
        const character = sanitizeCharacter(payload.character, payload.secret);
        const profile = { name, character };
        socket.data.mode = mode;
        socket.data.profile = profile;

        if (mode === "single") {
          const existing = rooms.getRoomForSocket(socket.id);
          if (existing) {
            rooms.leaveRoom(socket.id);
            socket.leave(existing.id);
          }
          const room = rooms.createRoom({
            socketId: socket.id,
            name,
            character,
            mode: "single",
          });
          socket.join(room.id);
          const session = sessions.bind(socket, payload.sessionId, { mode, profile });
          socket.emit("chat:history", room.chat);
          socket.emit("self", {
            playerId: socket.id,
            sessionId: session.sessionId,
            mode,
            profile,
          });
          emitRoomState(io, room);
        } else {
          const session = sessions.bind(socket, payload.sessionId, { mode, profile });
          socket.emit("self", {
            playerId: socket.id,
            sessionId: session.sessionId,
            mode,
            profile,
          });
          socket.emit("room:list", rooms.listPublicLobbies());
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("session:resume", (payload = {}) => {
      try {
        const sessionId = String(payload.sessionId || "").trim();
        if (!sessionId) {
          throw new Error("No session to resume.");
        }
        const room = sessions.resume(socket, sessionId);
        if (!room) {
          socket.emit("session:expired");
          return;
        }
        const session = sessions.get(sessionId);
        socket.data.mode = session.mode;
        socket.data.profile = session.profile;
        socket.join(room.id);
        socket.emit("chat:history", room.chat);
        socket.emit("self", {
          playerId: socket.id,
          sessionId: session.sessionId,
          mode: session.mode,
          profile: session.profile,
        });
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:create", (payload = {}) => {
      try {
        const { profile, mode } = requireSetup(socket);
        if (mode !== "multi") {
          throw new Error("Room creation is for multiplayer halls.");
        }
        const room = rooms.createRoom({
          socketId: socket.id,
          name: profile.name,
          character: profile.character,
          mode: "multi",
          roomName: payload.name,
        });
        socket.join(room.id);
        sessions.updateRoom(socket.id, room.id);
        socket.emit("chat:history", room.chat);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:join", (payload = {}) => {
      try {
        const { profile, mode } = requireSetup(socket);
        if (mode !== "multi") {
          throw new Error("Joining halls is for multiplayer.");
        }
        const room = rooms.joinRoom({
          socketId: socket.id,
          name: profile.name,
          character: profile.character,
          roomId: payload.roomId,
        });
        socket.join(room.id);
        sessions.updateRoom(socket.id, room.id);
        socket.emit("chat:history", room.chat);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:joinByCode", (payload = {}) => {
      try {
        const { profile, mode } = requireSetup(socket);
        if (mode !== "multi") {
          throw new Error("Joining halls is for multiplayer.");
        }
        const room = rooms.joinRoomByCode({
          socketId: socket.id,
          name: profile.name,
          character: profile.character,
          code: payload.code,
        });
        socket.join(room.id);
        sessions.updateRoom(socket.id, room.id);
        socket.emit("chat:history", room.chat);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("room:leave", () => {
      try {
        const result = rooms.leaveRoom(socket.id);
        sessions.clearForPlayer(socket.id);
        if (result) {
          socket.leave(result.roomId);
          if (result.room) {
            emitRoomState(io, result.room);
          }
          socket.emit("room:left");
          if (socket.data.mode === "multi") {
            socket.emit("room:list", rooms.listPublicLobbies());
          }
          broadcastRoomList(io);
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("player:ready", (payload = {}) => {
      try {
        const room = rooms.setReady(socket.id, payload.ready);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("game:start", () => {
      try {
        const room = rooms.startGame(socket.id);
        emitRoomState(io, room);
        broadcastRoomList(io);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Chat ----

    socket.on("chat:send", (payload = {}) => {
      try {
        const room = rooms.getRoomForSocket(socket.id);
        if (!room) {
          throw new Error("You are not in a hall.");
        }
        const text = String(payload.text || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 200);
        if (!text) return;
        const player = room.players.find((p) => p.id === socket.id);
        const message = rooms.addChat(room, {
          senderId: socket.id,
          name: player ? player.name : "Stranger",
          text,
          ts: Date.now(),
        });
        io.to(room.id).emit("chat:message", message);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Town ----

    socket.on("town:search", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const d = dungeon.dungeonFor(room, player);
        if (d && dungeon.delveUnderway(d)) {
          throw new Error("Finish or leave the delve first.");
        }
        if (d && d.status === "forming") {
          // auto-leave forming party so you can act in town
          try { dungeon.leaveDungeon(room, player); } catch (e) {}
        }
        const res = town.search(player);
        room.log = {
          type: "search",
          text: res.text,
          name: player.name,
          gold: res.gold,
          wood: res.wood,
          food: res.food,
          hp: res.hp,
          ts: Date.now(),
        };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("town:endDay", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const d = dungeon.dungeonFor(room, player);
        if (d && dungeon.delveUnderway(d)) {
          throw new Error("Finish or leave the delve first.");
        }
        if (d && d.status === "forming") {
          try { dungeon.leaveDungeon(room, player); } catch (e) {}
        }
        const res = town.endDay(player);
        room.log = { type: "endDay", text: res.text, name: player.name, ts: Date.now() };
        if (room.players.every((p) => p.endedDay)) {
          room.day += 1;
          for (const p of room.players) {
            onNewDay(p);
          }
          dungeon.resetRoomDungeons(room);
          if (stock.maybeRotate(room)) {
            room.log = { type: "day", text: `Day ${room.day} dawns. The merchants restock their shelves.${require("./omens").dawnSuffix(room.day)}`, ts: Date.now() };
          } else {
            room.log = { type: "day", text: `Day ${room.day} dawns. Stamina restored.${require("./omens").dawnSuffix(room.day)}`, ts: Date.now() };
          }
        }
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("town:rest", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const d = dungeon.dungeonFor(room, player);
        if (d && dungeon.delveUnderway(d)) {
          throw new Error("Finish or leave the delve first.");
        }
        if (d && d.status === "forming") {
          try { dungeon.leaveDungeon(room, player); } catch (e) {}
        }
        const res = town.rest(player);
        room.log = { type: "rest", text: res.text, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("town:sleepOutside", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const d = dungeon.dungeonFor(room, player);
        if (d && dungeon.delveUnderway(d)) {
          throw new Error("Finish or leave the delve first.");
        }
        if (d && d.status === "forming") {
          try { dungeon.leaveDungeon(room, player); } catch (e) {}
        }
        const res = town.sleepOutside(player);
        room.log = { type: "endDay", text: res.text, name: player.name, ts: Date.now() };
        if (room.players.every((p) => p.endedDay)) {
          room.day += 1;
          for (const p of room.players) {
            onNewDay(p);
          }
          dungeon.resetRoomDungeons(room);
          if (stock.maybeRotate(room)) {
            room.log = { type: "day", text: `Day ${room.day} dawns. The merchants restock their shelves.${require("./omens").dawnSuffix(room.day)}`, ts: Date.now() };
          } else {
            room.log = { type: "day", text: `Day ${room.day} dawns. Stamina restored.${require("./omens").dawnSuffix(room.day)}`, ts: Date.now() };
          }
        }
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Blacksmith / shop ----

    socket.on("blacksmith:buy", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = shop.buy(room, player, payload.itemId);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
        socket.emit("shop:buyResult", { text: res.text, itemId: payload.itemId });
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("merchant:buy", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = merchant.buy(room, player, payload.itemId);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
        socket.emit("shop:buyResult", { text: res.text, itemId: payload.itemId });
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("merchant:sell", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = merchant.sell(room, player, payload.itemId, payload.qty);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
        socket.emit("shop:buyResult", { text: res.text, itemId: payload.itemId });
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("chest:open", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = chest.openChest(room, player, payload.itemId);
        room.log = { type: "chest", text: `${player.name} cracks open a chest.`, name: player.name, ts: Date.now() };
        socket.emit("chest:loot", { itemId: payload.itemId, ...res });
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Ancient Temple ----

    socket.on("temple:evolve", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = temple.evolve(room, player, payload && payload.to);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- NPC dialogue actions (quest accept, vampire embrace) ----
    socket.on("npc:action", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const action = payload && payload.action;
        if (action === "quest_accept") {
          const res = quests.acceptQuest(room, player, payload.questId || "vampire_rite");
          room.log = { ...res, name: player.name, ts: Date.now() };
          emitRoomState(io, room);
        } else if (action === "vampire_ascend") {
          const res = quests.vampireAscend(room, player, payload && payload.target);
          room.log = { ...res, name: player.name, ts: Date.now() };
          emitRoomState(io, room);
        } else {
          throw new Error("Unknown dialogue action.");
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("temple:restore", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        room.log = temple.restoreHeart(room, player);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("temple:craft", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        room.log = temple.craft(room, player, payload.recipeId);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });
    socket.on("temple:revive", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        town.requirePlaying(room, player);
        requireAlive(player);
        const res = temple.revive(room, player, payload.targetId);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });
    socket.on("temple:reroll", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = temple.rerollOrigin(room, player);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });
    socket.on("temple:buyOrigin", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = temple.buyOriginStone(room, player);
        room.log = { ...res, name: player.name, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Inventory ----

    socket.on("inventory:equip", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        equipItem(player, payload.itemId);
        room.log = { type: "inventory", text: `You equip ${payload.itemId}.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("inventory:unequip", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const itemId = unequipSlot(player, payload.slot);
        const item = require("../content").getItem(itemId);
        room.log = { type: "inventory", text: `You unequip ${item ? item.name : itemId}.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("skill:setLoadout", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        setSkillLoadout(player, payload.skillIds);
        room.log = { type: "inventory", text: "You rearrange your skills." };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("skillTree:learn", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const res = learnTreeNode(player, payload.nodeId);
        room.log = { type: "inventory", text: `You learn ${res.name} for ${res.cost} skill point${res.cost === 1 ? "" : "s"}.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Tavern ----

    socket.on("tavern:start", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        if (payload.game === "coinflip") {
          player.tavern = tavern.startCoinFlip(player, payload.bet);
        } else if (payload.game === "blackjack") {
          player.tavern = tavern.startBlackjack(player, payload.bet);
        } else {
          throw new Error("Choose a tavern game.");
        }
        room.log = { type: "tavern", text: player.tavern.message, name: player.name, won: player.tavern.won };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("tavern:move", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        tavern.blackjackMove(player, payload.move);
        room.log = { type: "tavern", text: player.tavern.message, name: player.name, won: player.tavern.won };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("tavern:buyFood", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const res = tavern.buyProvisions(player);
        room.log = res;
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("tavern:clear", () => {
      try {
        const { room, player } = gameContext(socket);
        player.tavern = null;
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("tavern:sleep", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const d = dungeon.dungeonFor(room, player);
        if (d && dungeon.delveUnderway(d)) {
          throw new Error("Finish or leave the delve first.");
        }
        if (d && d.status === "forming") {
          try { dungeon.leaveDungeon(room, player); } catch (e) {}
        }
        const res = tavern.sleep(player);
        room.log = { type: "endDay", text: res.text, name: player.name, ts: Date.now() };
        if (room.players.every((p) => p.endedDay)) {
          room.day += 1;
          for (const p of room.players) {
            onNewDay(p);
          }
          dungeon.resetRoomDungeons(room);
          if (stock.maybeRotate(room)) {
            room.log = { type: "day", text: `Day ${room.day} dawns. The merchants restock their shelves.${require("./omens").dawnSuffix(room.day)}`, ts: Date.now() };
          } else {
            room.log = { type: "day", text: `Day ${room.day} dawns. Stamina restored.${require("./omens").dawnSuffix(room.day)}`, ts: Date.now() };
          }
        }
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Dungeon ----

    socket.on("dungeon:create", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const d = dungeon.createParty(room, player, payload.rank, payload.size);
        room.log = { type: "dungeon", text: `${player.name} created a ${d.label} party.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:joinById", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        const d = dungeon.joinPartyById(room, player, payload.dungeonId);
        room.log = { type: "dungeon", text: `${player.name} joined ${d.label} party.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:join", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        // Backward compatibility: legacy client uses rank+size auto-join
        if (payload.dungeonId) {
          dungeon.joinPartyById(room, player, payload.dungeonId);
        } else {
          dungeon.joinDungeon(room, player, payload.rank, payload.size);
        }
        room.log = { type: "dungeon", text: `${player.name} joined the delve party.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:leave", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        dungeon.leaveDungeon(room, player);
        room.log = { type: "dungeon", text: `${player.name} left the delve party.` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:start", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        room.broadcast = () => {
          emitCombatFx(io, room);
          emitRoomState(io, room);
        };
        dungeon.startDungeon(room, player);
        const d = dungeon.dungeonFor(room, player);
        room.log = { type: "dungeon", text: d ? `${player.name} begins a ${d.label} delve!` : `${player.name} begins a delve!` };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("dungeon:return", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        dungeon.returnFromDungeon(room, player);
        // also leave boss if any
        try { const boss=require("./boss"); const b=boss.bossFor(room,player); if(b) boss.leaveBoss(room,player); } catch(e){}
        room.log = { type: "town", text: "You return to the town square." };
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    // ---- Travel (shared world map) ----
    // ---- Travel odaları (lobi) ----
    socket.on("travel:create", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        const d = dungeon.dungeonFor(room, player);
        if (d && dungeon.delveUnderway(d)) throw new Error("Finish or leave the delve first.");
        if (player.bossId || player.pvpId) throw new Error("Finish your current battle first.");
        if (travel.activeTravel(room, player)) throw new Error("You are already on an expedition.");
        travel.createExpedition(room, player, payload.type, payload.size);
        room.log = { type: "travel", text: `${player.name} opens an expedition room.`, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:join", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        if (travel.activeTravel(room, player)) throw new Error("You are already on an expedition.");
        travel.joinExpedition(room, player, payload.id);
        room.log = { type: "travel", text: `${player.name} joins an expedition.`, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:leave-lobby", () => {
      try {
        const { room, player } = gameContext(socket);
        travel.leaveExpedition(room, player);
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:launch", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        const t = travel.launchExpedition(room, player, payload.id);
        if (t) emitToTravel(io, t, "travel:map", travel.publicMap(room, player));
        room.log = { type: "travel", text: `${player.name}'s expedition sets out into the wilds.`, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    // ---- Mana rengi (skill efekti) roll & kuşanma ----
    socket.on("skins:roll", () => {
      try {
        const { room, player } = gameContext(socket);
        const res = require("./skins").rollForPlayer(player);
        if (res.error) throw new Error(res.error);
        socket.emit("skins:rolled", { skin: res.skin, cost: res.cost, activeSkin: player.activeSkin });
        room.log = { type: "cosmetic", text: `${player.name} rolls a mana hue: ${res.skin.name}.`, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("skins:equip", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const res = require("./skins").equipSkin(player, String(payload.id || ""));
        if (res.error) throw new Error(res.error);
        socket.emit("skins:equipped", { id: player.activeSkin });
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:enter", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        const d = dungeon.dungeonFor(room, player);
        if (d && dungeon.delveUnderway(d)) throw new Error("Finish or leave the delve first.");
        if (player.bossId || player.pvpId) throw new Error("Finish your current battle first.");
        travel.enterTravel(room, player, payload.type, payload.size, { joinId: payload.joinId });
        socket.emit("travel:map", travel.publicMap(room, player));
        room.log = { type: "travel", text: `${player.name} sets out into the wilds.`, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:sync", () => {
      try {
        const { room, player } = gameContext(socket);
        const t = travel.activeTravel(room, player);
        if (t && t.members.includes(player.id)) socket.emit("travel:map", travel.publicMap(room, player));
      } catch (err) { /* ignore */ }
    });

    socket.on("travel:leave", () => {
      try {
        const { room, player } = gameContext(socket);
        travel.leaveTravel(room, player);
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:pos", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const t = travel.activeTravel(room, player);
        if (!t || !t.members.includes(player.id)) return;
        if (travel.isDowned(t, player.id)) return; // yerdeyken hareket etmez
        const x = Number(payload.x), y = Number(payload.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        t.pos[player.id] = { x: Math.max(0, Math.min(t.w, x)), y: Math.max(0, Math.min(t.h, y)) };
        // Kendi konumumuzu geri gönderme; aksi halde istemci kendini "diğer oyuncu" sanar.
        for (const mid of t.members || []) {
          if (mid !== player.id) io.to(mid).emit("travel:pos", { id: player.id, x: t.pos[player.id].x, y: t.pos[player.id].y });
        }
        const revealed = travel.revealAround(t, t.pos[player.id].x, t.pos[player.id].y, 6);
        if (revealed && revealed.length) emitToTravel(io, t, "travel:explored", { add: revealed });
        if (travel.tryAutoJoin(room, player)) emitRoomState(io, room);
      } catch (err) { /* movement is best-effort */ }
    });

    // İstemci canavarı yerel simüle eder; sunucu ödülü sınırlı verir.
    socket.on("travel:kill", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const t = travel.activeTravel(room, player);
        if (!t || travel.isDowned(t, player.id)) return; // yerdeki oyuncu öldürme ödülü alamaz
        const res = travel.rewardKill(room, player, payload);
        if (!res) return;
        addXp(player, res.xp);
        player.gold = (player.gold || 0) + res.gold;
        // İstemciye anlık geri bildirim: "+X XP / +Y gold" ve sefer raporu.
        socket.emit("travel:killReward", {
          kind: payload.kind || null,
          xp: res.xp,
          gold: res.gold,
          goldTotal: player.gold || 0,
        });
        emitRoomState(io, room);
      } catch (err) { /* kill reward is best-effort */ }
    });

    // İstemci seyahatte canı yerel simüle eder; sunucu sınırlayarak kaydeder.
    socket.on("travel:hp", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const t = travel.activeTravel(room, player);
        if (!t || !t.members.includes(player.id)) return;
        if (travel.isDowned(t, player.id)) return; // yerdeyken can güncellemesi yok
        const now = Date.now();
        if (now - (player._lastHpTs || 0) < 180) return;
        const hp = Number(payload.hp);
        if (!Number.isFinite(hp)) return;
        player._lastHpTs = now;
        player.hp = Math.max(1, Math.min(player.maxHp, Math.round(hp)));
      } catch (err) { /* best-effort */ }
    });

    // Seyahatte can bitti: 1 kalp düşer. Kalbi kaldıysa yere düşer (takım arkadaşı
    // diriltebilir, isterse kasabaya dönebilir). Kalbi bittiyse ölür ve kasabaya döner.
    socket.on("travel:down", () => {
      try {
        const { room, player } = gameContext(socket);
        const t = travel.activeTravel(room, player);
        if (!t || !t.members.includes(player.id)) return;
        if (travel.isDowned(t, player.id)) return; // zaten yerde; tekrar tetikleme
        const now = Date.now();
        if (now - (player._lastDownTs || 0) < 1200) return; // çift tetikleme koruması
        player._lastDownTs = now;
        const lives = Number.isFinite(player.lives) ? player.lives : 3;
        if (lives <= 0) {
          // Hiç kalbi yok: doğrudan ölüm.
          travel.fall(room, player);
          socket.emit("travel:fallen", {});
          socket.emit("travel:notice", { text: "You have fallen. Return to the temple to be revived.", hearts: true });
          room.log = { type: "travel", text: `${player.name} has fallen in the wilds.`, ts: Date.now() };
          emitRoomState(io, room);
          return;
        }
        player.lives = lives - 1;
        player.hp = 0;
        // Editörden "yere düşme sistemi" kapatılabilir (content.travel.downed.enabled).
        const downedEnabled = !(CONTENT.travel && CONTENT.travel.downed && CONTENT.travel.downed.enabled === false);
        if (player.lives > 0 && downedEnabled) {
          // Yere düşer. Diğerleri sefere devam eder; sadece o yerde kalır.
          player.downed = true;
          travel.setDowned(t, player.id, true);
          const others = (t.members || []).filter((id) => id !== player.id);
          socket.emit("travel:downed", { hearts: player.lives, solo: others.length === 0 });
          for (const mid of others) io.to(mid).emit("travel:allyDowned", { id: player.id, name: player.name });
          room.log = { type: "travel", text: `${player.name} was knocked down.`, ts: Date.now() };
        } else {
          // Son kalp gitti: ölüm, kasabada tapınakta diriltilmeli.
          travel.fall(room, player);
          socket.emit("travel:fallen", {});
          socket.emit("travel:notice", { text: "Your last heart is gone. Return to the temple to be revived.", hearts: true });
          room.log = { type: "travel", text: `${player.name} has fallen in the wilds.`, ts: Date.now() };
        }
        emitRoomState(io, room);
      } catch (err) { /* best-effort */ }
    });

    // Yakındaki bir düşmüş takım arkadaşını diriltir (canı dolar, seferde kalır).
    socket.on("travel:revive", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        const t = travel.activeTravel(room, player);
        if (!t || !t.members.includes(player.id)) return;
        if (travel.isDowned(t, player.id)) return; // düşmüş biri diriltemez
        requireAlive(player);
        const res = travel.revive(room, player, payload.targetId);
        const target = res.target;
        // Dirilen oyuncuya can bilgisi + durum; herkese efekt.
        io.to(target.id).emit("travel:revived", { id: target.id, hp: target.hp, byName: player.name });
        emitToTravel(io, t, "travel:reviveFx", { id: target.id, byId: player.id });
        room.log = { type: "travel", text: `${player.name} revived ${target.name}.`, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    // Düşen oyuncu vazgeçip kasabaya döner (kalp zaten düşmüştü).
    socket.on("travel:giveup", () => {
      try {
        const { room, player } = gameContext(socket);
        const t = travel.activeTravel(room, player);
        if (!t || !travel.isDowned(t, player.id)) return;
        travel.giveUp(room, player);
        socket.emit("travel:returned", { hearts: player.lives, text: "You were carried back to town." });
        room.log = { type: "travel", text: `${player.name} was carried back to town.`, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { /* best-effort */ }
    });

    socket.on("travel:interact", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const t = travel.activeTravel(room, player);
        if (t && travel.isDowned(t, player.id)) throw new Error("You are down. Wait for an ally to revive you.");
        const res = travel.interact(room, player, payload.poiId);
        if (res.loot) socket.emit("travel:reward", { kind: "chest", loot: res.loot, poiId: res.poi.id });
        else if (res.gold) socket.emit("travel:reward", { kind: "gold", gold: res.gold, poiId: res.poi.id });
        else if (res.reveal) {
          emitToTravel(io, travel.activeTravel(room, player), "travel:reveal", {});
          socket.emit("travel:notice", { text: res.text, poiId: res.poi.id, kind: res.poi.kind, party: null });
        } else socket.emit("travel:notice", { text: res.text, poiId: res.poi.id, kind: res.poi.kind, party: res.party || null });
        room.log = { type: "travel", text: res.text, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:accept", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const res = travel.acceptInvite(room, player);
        socket.emit("travel:teleport", { x: res.pos.x, y: res.pos.y, poiId: res.poi.id });
        room.log = { type: "travel", text: res.text, ts: Date.now() };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    socket.on("travel:start", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        room.broadcast = () => { emitCombatFx(io, room); emitRoomState(io, room); };
        travel.startEncounter(room, player, payload.poiId);
        room.log = { type: "dungeon", text: `${player.name} leads the party into battle!` };
        emitRoomState(io, room);
      } catch (err) { emitError(socket, err); }
    });

    // ---- Boss ----
    socket.on("boss:challenge", (payload={})=>{
      try{
        const {room,player}=gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room,player);
        const boss=require("./boss");
        const b=boss.createBossParty(room,player,payload.bossId);
        room.log={type:"dungeon", text:`${player.name} challenges ${b.label}!`, ts:Date.now()};
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("boss:join", (payload={})=>{
      try{
        const {room,player}=gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room,player);
        const boss=require("./boss");
        const b=boss.createBossParty(room,player,payload.bossId); // join via same create (will join waiting)
        room.log={type:"dungeon", text:`${player.name} joins ${b.label} boss party.`, ts:Date.now()};
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("boss:leave", ()=>{
      try{
        const {room,player}=gameContext(socket);
        const boss=require("./boss");
        boss.leaveBoss(room,player);
        room.log={type:"dungeon", text:`${player.name} left boss party.`};
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("boss:start", ()=>{
      try{
        const {room,player}=gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room,player);
        const boss=require("./boss");
        room.broadcast=()=>{ emitCombatFx(io,room); emitRoomState(io,room); };
        const b=boss.startBoss(room,player);
        room.log={type:"dungeon", text:`${player.name} starts ${b.label} battle!`, ts:Date.now()};
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });

    // ---- Pets ----
    socket.on("pet:hatch", (payload={}, cb)=>{
      console.log("[pet:hatch] recv", payload, "from", socket.id);
      try{
        const {room,player}=gameContext(socket);
        console.log("[pet:hatch] player", player.name, "inventory", player.inventory.map(i=>i.itemId));
        const res=pets.hatchEgg(room,player,payload.eggId);
        console.log("[pet:hatch] success", res.petId);
        room.log={type:"inventory", text:`${player.name} hatched ${res.petDef.name}!`, ts:Date.now()};
        emitRoomState(io,room);
        if(typeof cb==="function") { console.log("[pet:hatch] cb ok"); cb({ok:true, petId:res.petId, petName:res.petDef.name, petImage:res.petDef.image}); }
      }catch(err){
        console.log("[pet:hatch] error", err.message);
        if(typeof cb==="function") cb({ok:false, error: err.message});
        emitError(socket,err);
      }
    });
    socket.on("pet:setActive", (payload={})=>{
      try{
        const {room,player}=gameContext(socket);
        const pet=pets.setActivePet(room,player,payload.petId);
        room.log={type:"inventory", text: pet? `${player.name} set active pet ${pet.name}` : `${player.name} unequipped pet`, ts:Date.now()};
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    // ---- PvP ----
    socket.on("pvp:challenge", (payload={})=>{
      try{
        const {room,player}=gameContext(socket);
        requireAlive(player);
        const targetId = payload.targetId;
        room.broadcast=()=>{ emitPvpFx(io,room); emitRoomState(io,room); };
        const inv=pvp.invitePvp(room,player,targetId);
        room.log={type:"pvp", text:`${player.name} challenges ${room.players.find(p=>p.id===targetId)?.name} to PvP!`, ts:Date.now()};
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("pvp:respond", (payload={})=>{
      try{
        const {room,player}=gameContext(socket);
        requireAlive(player);
        room.broadcast=()=>{ emitPvpFx(io,room); emitRoomState(io,room); };
        const res=pvp.respondPvp(room,player,payload.inviteId,Boolean(payload.accept));
        if (res && res.declined) {
          room.log={type:"pvp", text:`${player.name} declines the duel.`, ts:Date.now()};
        } else if (res && res.duel) {
          const otherId = res.duel.memberIds.find(id=>id!==player.id);
          room.log={type:"pvp", text:`${player.name} accepts ${room.players.find(p=>p.id===otherId)?.name}'s duel!`, ts:Date.now()};
        }
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("pvp:cancel", (payload={})=>{
      try{
        const {room,player}=gameContext(socket);
        pvp.cancelInvite(room,player,payload.inviteId);
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("pvp:act", (payload={})=>{
      try{
        const {room,player}=gameContext(socket);
        requireAlive(player);
        pvp.act(room,player,payload.skillId);
        emitPvpFx(io,room);
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("pvp:endTurn", ()=>{
      try{
        const {room,player}=gameContext(socket);
        requireAlive(player);
        pvp.endTurn(room,player);
        emitPvpFx(io,room);
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });
    socket.on("pvp:leave", ()=>{
      try{
        const {room,player}=gameContext(socket);
        pvp.leavePvp(room,player);
        room.log={type:"pvp", text:`${player.name} left PvP.`};
        emitRoomState(io,room);
      }catch(err){ emitError(socket,err); }
    });

    // ---- Combat ----

    socket.on("combat:act", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        combat.act(room, player, payload.skillId, payload.targetId);
        emitCombatFx(io, room);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("combat:useItem", (payload = {}) => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        combat.useItem(room, player, payload.itemId);
        emitCombatFx(io, room);
        emitRoomState(io, room);
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("combat:endTurn", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        const asyncMonster = combat.endTurn(room, player);
        if (!asyncMonster) {
          emitCombatFx(io, room);
          emitRoomState(io, room);
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("combat:flee", () => {
      try {
        const { room, player } = gameContext(socket);
        requireAlive(player);
        town.requirePlaying(room, player);
        requireAlive(player);
        room.broadcast = () => {
          emitCombatFx(io, room);
          emitRoomState(io, room);
        };
        const result = combat.flee(room, player);
        // flee may have removed the dungeon; ensure fx broadcast even if dungeon gone
        emitCombatFx(io, room);
        room.log = { type: "dungeon", text: `${player.name} fled the delve.` };
        emitRoomState(io, room);
        // if flee needed to trigger monster phase, broadcast already handled via room.broadcast in combat
        // ensure timers are re-armed for remaining players
        if (result && result.status === "fighting" && result.phase === "monsters") {
          // monster phase will auto-broadcast via timeout
        }
      } catch (err) {
        emitError(socket, err);
      }
    });

    socket.on("disconnect", () => {
      const session = sessions.getByPlayerId(socket.id);
      if (session) {
        sessions.markDisconnected(socket.id, (result) => {
          if (result && result.room) {
            emitRoomState(io, result.room);
          }
          broadcastRoomList(io);
        });
      } else {
        const result = rooms.leaveRoom(socket.id);
        if (result && result.room) {
          emitRoomState(io, result.room);
        }
        broadcastRoomList(io);
      }
    });
  });
}

module.exports = { registerSocketHandlers };
