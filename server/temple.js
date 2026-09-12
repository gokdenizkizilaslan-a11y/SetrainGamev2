const { CONTENT, getClass, getItem } = require("../content");
const { requirePlaying, spendStamina } = require("./town");
const { hasItem, removeItem, addItem, applyStatDelta } = require("./players");

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
  player.hp = player.maxHp;
  player.mana = player.maxMana;
  player.character = evolvedCls.slug;
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

module.exports = { evolve, restoreHeart, craft, revive };
