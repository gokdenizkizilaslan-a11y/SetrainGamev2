const { CONTENT, getItem } = require("../content");
const { requirePlaying, spendStamina } = require("./town");
const { addItem } = require("./players");
const stock = require("./stock");

function buy(room, player, itemId) {
  requirePlaying(room, player);
  const item = getItem(itemId);
  if (!item || !item.price || ["consumable", "material", "chest"].includes(item.slot)) {
    throw new Error("The smith has no such wares.");
  }
  if (!stock.inStock(room, "blacksmith", itemId)) {
    throw new Error("The smith doesn't have that today.");
  }
  if (player.gold < item.price.gold || player.wood < item.price.wood) {
    throw new Error("The smith needs more gold and wood.");
  }
  spendStamina(player, CONTENT.town.blacksmith.stamina);
  player.gold -= item.price.gold;
  player.wood -= item.price.wood;
  if (item.food) {
    player.food = (player.food || 0) + item.food;
  } else {
    addItem(player, item.id, 1);
  }
  stock.markSold(room, "blacksmith", item.id);
  return { type: "blacksmith", text: `You buy ${item.name}.`, item: item.id };
}

module.exports = { buy };
