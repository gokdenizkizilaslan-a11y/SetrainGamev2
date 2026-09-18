const { CONTENT } = require("../content");
const { addXp, randomInt } = require("./players");

function requirePlaying(room, player) {
  if (!room || room.status !== "playing") {
    throw new Error("The quest has not begun.");
  }
  if (!player) {
    throw new Error("You are not seated in this hall.");
  }
  if (player.endedDay) {
    throw new Error("You have already ended this day.");
  }
}

function spendStamina(player, cost) {
  if (player.stamina < cost) {
    throw new Error("Not enough stamina.");
  }
  player.stamina -= cost;
}

function applyGoldWood(player, gold, wood) {
  player.gold = Math.max(0, player.gold + gold);
  player.wood = Math.max(0, player.wood + wood);
}

function pickWeighted(outcomes) {
  const total = outcomes.reduce((s, o) => s + o.weight, 0);
  let n = Math.random() * total;
  for (const o of outcomes) {
    n -= o.weight;
    if (n <= 0) return o;
  }
  return outcomes[outcomes.length - 1];
}

function search(player) {
  const cfg = CONTENT.town.search;
  spendStamina(player, cfg.stamina);
  const o = pickWeighted(cfg.outcomes);
  const gold = randomInt(o.gold[0], o.gold[1]);
  const wood = randomInt(o.wood[0], o.wood[1]);
  const food = o.food ? randomInt(o.food[0], o.food[1]) : 0;
  applyGoldWood(player, gold, wood);
  if (o.hp) {
    player.hp = Math.max(1, Math.min(player.maxHp, player.hp + o.hp));
  }
  if (food) {
    player.food = (player.food || 0) + food;
  }
  if (cfg.xp) addXp(player, cfg.xp);
  return {
    type: "search",
    text: o.text,
    gold,
    wood,
    hp: o.hp,
    food,
  };
}

function endDay(player) {
  player.endedDay = true;
  player.stamina = 0;
  player.tavern = null;
  return { type: "endDay", text: "You rest until dawn." };
}

function rest(player) {
  if (player.endedDay) {
    throw new Error("You have already ended the day.");
  }
  const max = (CONTENT.town.rest && CONTENT.town.rest.maxPerDay) || 3;
  const used = player.restCount || 0;
  if (used >= max) {
    throw new Error("You have rested enough today.");
  }
  const amt = (CONTENT.town.rest && CONTENT.town.rest.stamina) || 4;
  const before = player.stamina;
  player.stamina = Math.min(player.maxStamina, player.stamina + amt);
  player.restCount = used + 1;
  const gained = player.stamina - before;
  const left = max - player.restCount;
  return { type: "rest", text: `You rest, regaining ${gained} stamina. (${left} rest${left === 1 ? "" : "s"} left today.)` };
}

function sleepOutside(player) {
  if (player.endedDay) {
    throw new Error("You have already ended the day.");
  }
  const chance = (CONTENT.town.sleepOutside && CONTENT.town.sleepOutside.lifeLossChance) || 0.04;
  let lostHeart = false;
  if (Math.random() < chance && player.lives > 0) {
    player.lives = Math.max(0, player.lives - 1);
    lostHeart = true;
  }
  player.endedDay = true;
  player.stamina = 0;
  player.tavern = null;
  return {
    type: "endDay",
    text: lostHeart
      ? "You sleep under the cold stars. Something gnaws at you in the dark — you lose 1 heart."
      : "You sleep under the cold stars and rest until dawn.",
    lostHeart,
  };
}

module.exports = { requirePlaying, spendStamina, search, endDay, rest, sleepOutside };
