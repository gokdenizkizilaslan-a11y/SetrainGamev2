const { CONTENT, getItem } = require("../content");
const { removeItem, addItem } = require("./players");

function hatchEgg(room, player, eggId) {
  const eggDef = (CONTENT.eggs || []).find((e) => e.id === eggId);
  if (!eggDef) throw new Error("Unknown egg.");
  const entry = (player.inventory || []).find((i) => i.itemId === eggId);
  if (!entry || entry.qty < 1) throw new Error("You don't have that egg.");
  const petsForEgg = eggDef.pets || [];
  if (!petsForEgg.length) throw new Error("This egg is empty.");
  const petId = petsForEgg[Math.floor(Math.random() * petsForEgg.length)];
  const petDef = (CONTENT.pets || []).find((p) => p.id === petId);
  if (!petDef) throw new Error("Unknown pet.");
  removeItem(player, eggId, 1);
  if (!player.pets) player.pets = [];
  player.pets.push({ petId, hatched: true });
  // auto set active if none
  if (!player.activePetId) player.activePetId = petId;
  return { petId, petDef };
}

function setActivePet(room, player, petId) {
  if (!petId) {
    player.activePetId = null;
    return null;
  }
  const owned = (player.pets || []).find((p) => p.petId === petId);
  if (!owned) throw new Error("You don't own that pet.");
  player.activePetId = petId;
  const petDef = (CONTENT.pets || []).find((p) => p.id === petId);
  return petDef;
}

module.exports = { hatchEgg, setActivePet };
