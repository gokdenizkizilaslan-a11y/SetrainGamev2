const { CONTENT, getItem } = require("../content");
const { requirePlaying, spendStamina } = require("./town");
const { hasItem, removeItem, addItem } = require("./players");
const stock = require("./stock");

const SELLABLE_SLOTS = ["chest", "consumable", "material"];

function buy(room, player, itemId) {
  requirePlaying(room, player);
  const item = getItem(itemId);
  if (!item || !item.price || !SELLABLE_SLOTS.includes(item.slot)) {
    throw new Error("The merchant has no such wares.");
  }
  if (!stock.inStock(room, "merchant", itemId)) {
    throw new Error("The merchant doesn't have that today.");
  }
  if (player.gold < item.price.gold || player.wood < item.price.wood) {
    throw new Error("The merchant needs more gold and wood.");
  }
  spendStamina(player, CONTENT.town.merchant.stamina);
  player.gold -= item.price.gold;
  player.wood -= item.price.wood;
  if (item.food) {
    player.food = (player.food || 0) + item.food;
  } else {
    addItem(player, item.id, 1);
  }
  stock.markSold(room, "merchant", item.id);
  return { type: "merchant", text: `You buy ${item.name}.`, item: item.id };
}

// Sell-back: 60% of value (or gold price if no value set). No stamina cost.
// Equipped gear must be unequipped first. Worthless items are refused.
function sellPrice(item) {
  const base = (typeof item.value === "number" && item.value > 0)
    ? item.value
    : (item.price && item.price.gold) || 0;
  return Math.floor(base * 0.6);
}

function sell(room, player, itemId, qty = 1) {
  requirePlaying(room, player);
  const item = getItem(itemId);
  if (!item) {
    throw new Error("Unknown item.");
  }
  const n = Math.max(1, Math.floor(qty || 1));
  if (!hasItem(player, itemId, n)) {
    throw new Error("You do not have that.");
  }
  if (player.equipment && Object.values(player.equipment).includes(itemId)) {
    throw new Error("Unequip it first.");
  }
  const unit = sellPrice(item);
  if (unit <= 0) {
    throw new Error("The merchant does not want that.");
  }
  removeItem(player, itemId, n);
  player.gold += unit * n;
  return { type: "merchant", text: `You sell ${n > 1 ? n + "× " : ""}${item.name} for ${unit * n} gold.`, item: item.id, qty: n, gold: unit * n };
}

module.exports = { buy, sell, sellPrice };
