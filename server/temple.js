const { CONTENT, getClass, getItem } = require("../content");
const { requirePlaying, spendStamina } = require("./town");
const { hasItem, removeItem, addItem, applyStatDelta, rerollRace, historyOf } = require("./players");

function originCfg() {
  return CONTENT.temple.origin || { item: "origin_stone", price: 250, startQty: 5 };
}
// Savaşın ortasında ırk değişmez (canlı stat'larla dövüş bozulur).
function requireNoActiveBattle(room, player) {
  const d = (room.dungeons || []).find((x) => (x.memberIds || []).includes(player.id));
  if (d && (d.status === "fighting" || d.status === "done")) {
    throw new Error("Finish your battle first.");
  }
  const b = (room.bossParties || []).find((x) => (x.memberIds || []).includes(player.id));
  if (b && b.status === "fighting") {
    throw new Error("Finish your battle first.");
  }
  const pvp = (room.pvpDuels || []).find((x) => (x.memberIds || []).includes(player.id));
  if (pvp && pvp.status === "fighting") {
    throw new Error("Finish your duel first.");
  }
}

function rerollOrigin(room, player) {
  requirePlaying(room, player);
  requireNoActiveBattle(room, player);
  const cfg = originCfg();
  const stoneDef = getItem(cfg.item);
  if (!hasItem(player, cfg.item, 1)) {
    throw new Error(`You need ${(stoneDef && stoneDef.name) || "an Origin Stone"} to be reborn.`);
  }
  spendStamina(player, CONTENT.town.temple.stamina);
  removeItem(player, cfg.item, 1);
  const { oldRace, newRace } = rerollRace(player);
  player.hp = player.maxHp;
  player.mana = player.maxMana;
  const same = oldRace && newRace && oldRace.id === newRace.id;
  return {
    type: "temple",
    text: same
      ? `The stone burns, but your blood holds — you remain ${newRace.name}.`
      : `You are reborn: ${oldRace ? oldRace.name : "unknown blood"} → ${newRace ? newRace.name : "unknown blood"}!`,
    rebirth: {
      name: (newRace && newRace.name) || "Unknown Blood",
      color: (player.race && player.race.color) || "",
      glow: (player.race && player.race.glow) || "",
    },
  };
}

function buyOriginStone(room, player) {
  requirePlaying(room, player);
  const cfg = originCfg();
  const price = Math.max(0, Math.floor(cfg.price || 0));
  if (player.gold < price) {
    throw new Error(`An Origin Stone costs ${price} gold.`);
  }
  player.gold -= price;
  addItem(player, cfg.item, 1);
  const stoneDef = getItem(cfg.item);
  return { type: "temple", text: `You buy ${(stoneDef && stoneDef.name) || "an Origin Stone"} for ${price} gold.` };
}

function evolve(room, player, targetTo) {
  requirePlaying(room, player);
  const baseCls = getClass(player.character);
  if (!baseCls) {
    throw new Error("Your class has no ascension.");
  }
  // One class may offer several upper classes (branching ascension).
  // The player picks one; without a pick the first route is used.
  const routes = Array.isArray(baseCls.evolutions) && baseCls.evolutions.length
    ? baseCls.evolutions
    : (baseCls.evolution ? [baseCls.evolution] : []);
  if (!routes.length) {
    throw new Error("Your class has no ascension.");
  }
  let route = routes[0];
  if (targetTo) {
    const picked = routes.find((r) => r && r.to === targetTo);
    if (!picked) {
      throw new Error("That ascension is not offered to your class.");
    }
    route = picked;
  }
  // Vampir 40 rotaları (requiresVampire): önceki class vampir değilse
  // kart hiç görünmez; sunucu da son sözü söyler. Şart sadece
  // level + item'dır (diğer classlarla aynı).
  if (route.requiresVampire) {
    const vamps = { bloodspawn: 1, gloomspawn: 1 };
    if (!vamps[player.character]) {
      throw new Error("Only those of vampire blood may walk this path.");
    }
  }
  if (player.level < (route.level || 20)) {
    // level_or_item routes may bypass the level gate with the item instead.
    const bypass = route.requirementType === "level_or_item" || route.requirementType === "item_only";
    if (!bypass) {
      throw new Error(`You must reach level ${route.level || 20} to ascend.`);
    }
  }
  // Ascension requirement, editable per class in the editor:
  // - legacy routes (no requirementType): level + 1 Ancient Relic (unchanged behavior)
  // - level_only: level gate above is enough, no item burns
  // - item_only: item instead of level (level gate bypassed above)
  // - level_and_item: both level and item
  // - level_or_item: level, or the item as an alternative (burns only when used)
  const reqType = route.requirementType || "legacy";
  const needItem = reqType === "legacy" || reqType === "item_only" || reqType === "level_and_item"
    || (reqType === "level_or_item" && player.level < (route.level || 20));
  const itemId = route.requiredItem || "ancient_relic";
  const itemCount = Math.max(1, route.requiredItemCount || 1);
  if (needItem) {
    const itemDef = getItem(itemId);
    if (!hasItem(player, itemId, itemCount)) {
      throw new Error(`You need ${itemCount > 1 ? itemCount + "× " : ""}${itemDef ? itemDef.name : itemId} to ascend.`);
    }
  }
  const evolvedCls = getClass(route.to);
  if (!evolvedCls) {
    throw new Error("That ascension is not written in the temple.");
  }
  spendStamina(player, CONTENT.town.temple.stamina);
  if (needItem) removeItem(player, itemId, itemCount);
  applyStatDelta(player, evolvedCls.evolveBonus || {}, 1);
  player.manaRegen += (evolvedCls.manaRegen || 0) - (baseCls.manaRegen || 0);
  // Geçmişi KAREKTER DEĞİŞMEDEN ÖNCE yakala (eski kayıtlarda baseClass
  // zincirinden türetilir). Eski skillar kalır, ara class'ın baseleri
  // gelmez, yeni üstün skilleri ağaçta açılır (players.js treeNodeAllowed).
  let prevHist = null;
  try { prevHist = historyOf(player); } catch (e) { prevHist = null; }
  player.hp = player.maxHp;
  player.mana = player.maxMana;
  player.character = evolvedCls.slug;
  try {
    const hist = Array.isArray(prevHist) && prevHist.length ? prevHist : [player.character];
    if (hist[hist.length - 1] !== evolvedCls.slug) hist.push(evolvedCls.slug);
    player.classHistory = hist;
  } catch (e) { player.classHistory = [player.character]; }
  // Evolving no longer grants the ascended skill directly —
  // the Skill Tree is now the path to learning it (after ascending).
  // Ascend cinematic: optional per-evolution presentation (color/sound/title),
  // with safe defaults so old evolutions get the overlay too.
  const evo = route || {};
  return {
    type: "temple",
    text: `You ascend into ${evolvedCls.label}!`,
    ascend: {
      to: evolvedCls.slug,
      label: evolvedCls.label,
      title: evo.ascendTitle || `You have ascended to ${evolvedCls.label}!`,
      color: evo.ascendColor || "#e8c547",
      sound: evo.ascendSound || "",
      sound2: evo.ascendSound2 || "",
    },
  };
}

function restoreHeart(room, player) {
  requirePlaying(room, player);
  if (player.lives >= CONTENT.starting.lives) {
    throw new Error("Your hearts are already full.");
  }
  const restore = CONTENT.temple.restore || {};
  const needId = restore.item || "golem_heart";
  const needName = restore.itemName || (getItem(needId) || {}).name || "Heart of Golem";
  if (!hasItem(player, needId, 1)) {
    throw new Error(`You need a ${needName} to mend a heart.`);
  }
  spendStamina(player, CONTENT.town.temple.stamina);
  removeItem(player, needId, 1);
  player.lives += 1;
  return { type: "temple", text: restore.text || "You mend a lost heart. A life returns." };
}

function craft(room, player, recipeId) {
  requirePlaying(room, player);
  const recipe = (CONTENT.temple.recipes || []).find((r) => r.id === recipeId);
  if (!recipe) {
    throw new Error("That is not a known rite.");
  }
  for (const input of recipe.inputs || []) {
    if (!hasItem(player, input.item, input.qty)) {
      throw new Error("You lack the materials for this rite.");
    }
  }
  const cost = recipe.cost || {};
  if (player.gold < (cost.gold || 0) || player.wood < (cost.wood || 0)) {
    throw new Error("The temple needs more gold and wood.");
  }
  spendStamina(player, CONTENT.town.temple.stamina);
  for (const input of recipe.inputs || []) {
    // Blueprints (consume: false) stay in the pack; everything else is spent.
    if (input.consume === false) continue;
    removeItem(player, input.item, input.qty);
  }
  player.gold -= cost.gold || 0;
  player.wood -= cost.wood || 0;
  addItem(player, recipe.output.item, recipe.output.qty || 1);
  const out = getItem(recipe.output.item);
  return { type: "temple", text: `You forge ${out ? out.name : recipe.output.item}.` };
}

function revive(room, player, targetId) {
  requirePlaying(room, player);
  if (!hasItem(player, "the_essence_of_life", 1)) {
    throw new Error("You need The Essence of Life to revive.");
  }
  const target = room.players.find((p) => p.id === targetId);
  if (!target) throw new Error("That adventurer is not here.");
  if (target.lives > 0) throw new Error(`${target.name} is not fallen.`);
  if (target.id === player.id) throw new Error("You cannot revive yourself.");
  spendStamina(player, CONTENT.town.temple.stamina);
  removeItem(player, "the_essence_of_life", 1);
  target.lives = 1;
  target.hp = target.maxHp;
  target.mana = target.maxMana;
  target.endedDay = false;
  return { type: "temple", text: `${player.name} revives ${target.name} with The Essence of Life!` };
}

module.exports = { evolve, restoreHeart, craft, revive, rerollOrigin, buyOriginStone };
