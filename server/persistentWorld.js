// SETRA'nın tek, kalıcı açık dünyası. Statik coğrafya world_setra.json +
// shared core'dan gelir; oyuncu ilerlemesi atomik JSON snapshot ile diskte yaşar.
const fs = require("fs");
const path = require("path");
const core = require("../public/js/setraWorldCore.js");

const ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "world_setra.json");
const SAVE_DIR = path.join(ROOT, "saves");
const SAVE_PATH = path.join(SAVE_DIR, "setra_world_state.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const geography = core.createWorld(config);

let state = { version: 1, worldId: config.id, seed: config.seed, worldVersion: Number(config.version) || 1, players: {}, world: { revealed: {}, consumed: {} }, updatedAt: Date.now() };
let world = null;
let saveTimer = null;
let saving = false;

function load() {
  try {
    if (!fs.existsSync(SAVE_PATH)) return;
    const loaded = JSON.parse(fs.readFileSync(SAVE_PATH, "utf8"));
    const myVer = Number(config.version) || 1;
    // Harita sürümü değişince eski koordinatlar (küçük dünyanın spawn'ı)
    // yeni kıtada okyanusun ortasına düşüyordu: sürüm uyuşmazsa sıfırdan başla.
    if (loaded && loaded.worldId === config.id && loaded.seed === config.seed &&
        Number(loaded.worldVersion) === myVer) {
      state = Object.assign(state, loaded);
      state.players = loaded.players || {};
      state.world = Object.assign({ revealed: {}, consumed: {} }, loaded.world || {});
    }
  } catch (e) { console.error("[world] save load failed; defaults kept:", e.message); }
}
load();

function saveNow() {
  if (saving) return;
  saving = true;
  try {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
    state.updatedAt = Date.now();
    const tmp = SAVE_PATH + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(state));
    fs.renameSync(tmp, SAVE_PATH);
  } catch (e) { console.error("[world] save failed:", e.message); }
  saving = false;
}
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = null; saveNow(); }, 1200);
}
function flush() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; } saveNow(); }
process.once("exit", flush);
process.once("SIGINT", () => { flush(); process.exit(0); });
process.once("SIGTERM", () => { flush(); process.exit(0); });

function keyFor(player) {
  const sessions = require("./sessions");
  const session = sessions.getByPlayerId(player.id);
  return String((session && session.sessionId) || player.persistentId || player.name || player.id).slice(0, 160);
}
function playerState(player) {
  const key = keyFor(player);
  let s = state.players[key];
  if (!s) {
    s = state.players[key] = {
      name: player.name, pos: { x: config.spawn.x + 0.5, y: config.spawn.y + 0.5 },
      checkpointId: "setra_village", checkpoint: { x: config.spawn.x + 0.5, y: config.spawn.y + 0.5 },
      consumed: {}, explored: {}, discovered: {}, updatedAt: Date.now()
    };
    scheduleSave();
  }
  s.name = player.name || s.name;
  return s;
}
function ensureWorld() {
  if (world) return world;
  world = {
    id: config.id, persistent: true, worldId: config.id, active: true,
    seed: config.seed, type: "verdant", typeLabel: config.name,
    size: "persistent", sizeLabel: "Persistent Continent", scale: 1,
    w: config.width, h: config.height, spawn: config.spawn,
    tiles: null, pois: config.pois.map((p) => Object.assign({}, p)),
    leaderId: null, members: [], pos: {}, parties: {}, invites: {}, downed: {},
    explored: null, createdAt: Date.now(), playerStates: {}
  };
  return world;
}
function enter(room, player) {
  const t = ensureWorld();
  if (!room.travels) room.travels = {};
  if (player.travelId && player.travelId !== t.id) require("./travel").leaveTravel(room, player);
  const saved = playerState(player);
  if (player.travelId && room.travels[player.travelId] && player.travelId !== t.id) require("./travel").leaveTravel(room, player);
  room.travels[t.id] = t;
  player.travelId = t.id;
  if (!t.members.includes(player.id)) t.members.push(player.id);
  t.pos[player.id] = { x: saved.pos.x, y: saved.pos.y };
  t.playerStates[player.id] = saved;
  if (!t.leaderId) t.leaderId = player.id;
  player.hp = Math.max(1, Math.min(player.maxHp || 100, player.hp || player.maxHp || 100));
  player.downed = false;
  revealAround(t, player, t.pos[player.id].x, t.pos[player.id].y, 8);
  scheduleSave();
  return t;
}
function leave(room, player, travel) {
  const t = travel || ensureWorld();
  const saved = t.playerStates[player.id] || playerState(player);
  if (t.pos[player.id]) saved.pos = { x: t.pos[player.id].x, y: t.pos[player.id].y };
  saved.updatedAt = Date.now();
  t.members = t.members.filter((id) => id !== player.id);
  delete t.pos[player.id]; delete t.invites[player.id]; delete t.downed[player.id];
  delete t.playerStates[player.id];
  const roomStillHasMembers = (room.players || []).some((p) => p.id !== player.id && t.members.includes(p.id));
  if (room.travels && !roomStillHasMembers) delete room.travels[t.id];
  if (room.travel === t && !roomStillHasMembers) room.travel = null;
  player.travelId = null; player.dungeonId = null;
  scheduleSave();
}
function updatePosition(room, player, x, y) {
  const t = ensureWorld();
  const old = t.pos[player.id] || playerState(player).pos;
  const nx = Math.max(0, Math.min(config.width, x));
  const ny = Math.max(0, Math.min(config.height, y));
  const distance = Math.hypot(nx - old.x, ny - old.y);
  // 10 Hz akışta normal koşu ve dash'e izin ver; açık teleportu reddet.
  // Yürünebilirlik istemci ızgarasıyla aynı kural: su (köprü değilse) geçilmez.
  const surface = geography.sample(nx, ny);
  if (distance > 220 || (surface.water && !surface.bridge)) return { accepted: false, pos: old };
  t.pos[player.id] = { x: nx, y: ny };
  const saved = t.playerStates[player.id] || playerState(player);
  saved.pos = { x: nx, y: ny }; saved.updatedAt = Date.now();
  revealAround(t, player, nx, ny, 8);
  scheduleSave();
  return { accepted: true, pos: t.pos[player.id] };
}
function revealAround(t, player, x, y, radius) {
  const saved = t.playerStates[player.id] || playerState(player);
  const cell = 100, cx = Math.floor(x / cell), cy = Math.floor(y / cell);
  const r = Math.max(1, Math.ceil(radius / cell));
  const added = [];
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const key = (cx + i) + "," + (cy + j);
    if (!saved.explored[key]) { saved.explored[key] = 1; added.push(key); }
  }
  return added;
}
function consumedFor(t, player, poi) {
  const saved = t.playerStates[player.id] || playerState(player);
  return !!saved.consumed[poi.id];
}
function markConsumed(t, player, poi, consumed) {
  const saved = t.playerStates[player.id] || playerState(player);
  if (consumed === false) delete saved.consumed[poi.id]; else saved.consumed[poi.id] = Date.now();
  saved.discovered[poi.id] = 1; scheduleSave();
}
function activateCheckpoint(t, player, poi) {
  const saved = t.playerStates[player.id] || playerState(player);
  saved.checkpointId = poi.id;
  saved.checkpoint = { x: poi.x + 0.5, y: poi.y + 0.5 };
  saved.pos = { x: poi.x + 0.5, y: poi.y + 0.5 };
  saved.discovered[poi.id] = 1;
  player.hp = player.maxHp; player.mana = player.maxMana;
  player.stamina = Math.min(player.maxStamina || player.stamina, (player.stamina || 0) + 4);
  scheduleSave();
}
function publicTravel(room, player, t) {
  const saved = t.playerStates[player.id] || playerState(player);
  const parties = {};
  for (const [id, p] of Object.entries(t.parties)) parties[id] = require("./travel").publicParty(p);
  const invites = {};
  for (const [id, v] of Object.entries(t.invites)) invites[id] = { poiId: v.poiId, fromName: v.fromName };
  return {
    id: t.id, persistent: true, worldId: config.id, leaderId: t.leaderId, active: true,
    seed: t.seed, type: t.type, typeLabel: t.typeLabel, size: t.size, sizeLabel: t.sizeLabel,
    w: t.w, h: t.h, checkpointId: saved.checkpointId,
    pois: t.pois.map((p) => ({ id: p.id, kind: p.kind, x: p.x, y: p.y, name: p.name,
      rank: p.rank, tier: p.tier, model: p.model, futureArea: p.futureArea,
      checkpoint: !!p.checkpoint, consumed: !!saved.consumed[p.id], revealed: !!saved.discovered[p.id] })),
    members: [...t.members], pos: Object.fromEntries(Object.entries(t.pos).map(([k, v]) => [k, { x: v.x, y: v.y }])),
    downed: Object.keys(t.downed || {}), parties, invites
  };
}
function publicMap(t, player) {
  const saved = playerState(player);
  return {
    id: t.id, persistent: true, worldId: config.id, seed: config.seed,
    type: "verdant", typeLabel: config.name, size: "persistent", sizeLabel: "Persistent Continent", scale: 1,
    w: config.width, h: config.height, spawn: config.spawn, worldScale: config.worldScale,
    tileSize: config.tileSize, baseWalkSpeed: config.baseWalkSpeed, world: config,
    pois: (config.pois || []).map((p) => ({
      id: p.id, kind: p.kind, x: p.x, y: p.y, name: p.name, rank: p.rank, tier: p.tier,
      model: p.model, futureArea: p.futureArea, checkpoint: !!p.checkpoint,
      consumed: !!saved.consumed[p.id], revealed: !!saved.discovered[p.id]
    })),
    metrics: geography.metrics(), checkpoint: saved.checkpoint,
    explored: Object.keys(saved.explored)
  };
}
function descriptor() { return config; }
function getWorld() { return ensureWorld(); }

// GameCraft > Dünya Kurucu "Oyuna Uygula": world_setra.json'ı yeniden yükler.
// `config` ve `geography` referanslarını YERİNDE günceller; böylece diğer
// modüller (travel, socketHandlers) aynı nesneleri kullanmaya devam eder.
// Sürüm numarası artırılır → istemci haritayı yeniden kurar.
function applyConfig(next) {
  if (!next || typeof next !== "object" || !next.id) throw new Error("Geçersiz dünya yapılandırması (id yok).");
  if (!Number.isFinite(Number(next.width)) || !Number.isFinite(Number(next.height))) throw new Error("width/height geçersiz.");
  if (!next.spawn || !Number.isFinite(Number(next.spawn.x)) || !Number.isFinite(Number(next.spawn.y))) throw new Error("spawn geçersiz.");
  const prevVer = Number(config.version) || 1;
  for (const k of Object.keys(config)) delete config[k];
  Object.assign(config, next);
  config.version = Math.max(prevVer + 1, Number(next.version) || 0);
  const fresh = core.createWorld(config);
  for (const k of Object.keys(geography)) delete geography[k];
  Object.assign(geography, fresh);
  world = null; // ensureWorld bir sonraki çağrıda yeniden kurar
  return config;
}

module.exports = { config, geography, enter, leave, updatePosition, revealAround,
  consumedFor, markConsumed, activateCheckpoint, publicTravel, publicMap,
  playerState, keyFor, scheduleSave, saveNow, flush, descriptor, getWorld, applyConfig };
