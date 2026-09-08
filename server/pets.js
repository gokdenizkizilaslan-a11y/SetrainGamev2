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
  player.pets.push({ petId, hatched: true, level: 1, xp: 0 });
  if (!player.activePetIds) player.activePetIds = player.activePetId ? [player.activePetId] : [];
  const maxPets = player.character === "tamer" ? 3 : 2;
  if (player.activePetIds.length < maxPets && !player.activePetIds.includes(petId)) {
    player.activePetIds.push(petId);
    player.activePetId = player.activePetIds[0];
  }
  return { petId, petDef };
}

function setActivePet(room, player, petId) {
  if (!player.activePetIds) player.activePetIds = player.activePetId ? [player.activePetId] : [];
  if (!petId) {
    // unequip all if null sent from old client
    player.activePetIds = [];
    player.activePetId = null;
    return null;
  }
  const owned = (player.pets || []).find((p) => p.petId === petId);
  if (!owned) throw new Error("You don't own that pet.");
  const maxPets = player.character === "tamer" ? 3 : 2;
  const idx = player.activePetIds.indexOf(petId);
  if (idx !== -1) {
    player.activePetIds.splice(idx, 1);
  } else {
    if (player.activePetIds.length >= maxPets) throw new Error(`You can equip max ${maxPets} pets. Unequip one first.`);
    player.activePetIds.push(petId);
  }
  player.activePetId = player.activePetIds[0] || null;
  const petDef = (CONTENT.pets || []).find((p) => p.id === petId);
  return petDef;
}

module.exports = { hatchEgg, setActivePet };
