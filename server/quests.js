const { CONTENT, getClass, getItem, getMonster } = require("../content");
const { requirePlaying } = require("./town");
const { hasItem, removeItem, addItem, applyStatDelta, historyOf } = require("./players");

function getQuestDef(questId) {
  return (CONTENT.quests || []).find((q) => q && q.id === questId) || null;
}

function getQuestState(player, questId) {
  if (!player) return null;
  if (!player.quests) player.quests = {};
  return player.quests[questId] || null;
}

// Canlı ilerleme: { accepted, kills, have, needKills, needItem, completed }.
// Sayaçlar oyuncuya özeldir — başka oyuncunun avı buraya yazılmaz.
function questProgress(player, questId) {
  const def = getQuestDef(questId);
  if (!def) return null;
  const st = getQuestState(player, questId);
  const needKills = Math.max(1, def.requiredKills || 1);
  const needItem = Math.max(1, def.requiredItemCount || 1);
  let have = 0;
  try {
    const inv = (player.inventory || []).find((i) => i.itemId === def.requiredItem);
    have = inv ? inv.qty || 0 : 0;
  } catch (e) { have = 0; }
  return {
    accepted: !!(st && st.accepted),
    kills: Math.min(needKills, (st && st.kills) || 0),
    have,
    needKills,
    needItem,
    completed: !!(st && st.completed),
  };
}

function acceptQuest(room, player, questId) {
  requirePlaying(room, player);
  const def = getQuestDef(questId);
  if (!def) throw new Error("No such quest.");
  if (def.classes && def.classes.length && !def.classes.includes(player.character)) {
    throw new Error("Old Vesryn shakes his head: the old blood does not stir in you. This rite is for assassins and mages alone.");
  }
  if (!player.quests) player.quests = {};
  const st = player.quests[questId];
  if (st && st.accepted) throw new Error("You have already taken up this rite.");
  player.quests[questId] = {
    accepted: true,
    kills: 0,
    completed: false,
    path: player.character === "mage" ? "gloom" : "blood",
  };
  const itemDef = def.requiredItem ? getItem(def.requiredItem) : null;
  return {
    type: "quest",
    text: `${player.name} takes up "${def.name}": slay ${def.requiredKills} ${def.monsterTag} foes and gather ${def.requiredItemCount}× ${itemDef ? itemDef.name : def.requiredItem}.`,
  };
}

// Zaferde çağrılır: ölen her görev-etiketli canavar için, partideki ve
// görevi almış her oyuncunun KENDİ sayacı +1 artar (paylaşılan sayaç yok).
// Cruor zarları da kişi başıdır. Dönen notlar herkese açık log içindir
// ama sayaçlar publicPlayer ile kişiye özel gider.
function registerKills(room, d, deadMonsters) {
  const notes = [];
  const quests = CONTENT.quests || [];
  if (!quests.length || !Array.isArray(deadMonsters) || !deadMonsters.length) return notes;
  const members = (d.memberIds || [])
    .map((id) => (room.players || []).find((p) => p.id === id))
    .filter(Boolean);
  const living = members.filter((p) => p.hp > 0 && p.lives > 0);
  const receivers = living.length ? living : members;
  for (const mon of deadMonsters) {
    // Dalga nesneleri etiket taşımaz — tür tanımından çözülür.
    const tags = (mon.tags && mon.tags.length)
      ? mon.tags
      : ((mon.kind && getMonster(mon.kind) && getMonster(mon.kind).tags) || []);
    // Cruor KÜRESEL nadir drop'tur: canavar başına tek zar, yaşayan rastgele
    // bir üyeye — görevden bağımsız, 40. seviye vampir itemi de böyle birikir.
    const cq = quests.find((q) => q && q.requiredItem && tags.includes(q.monsterTag));
    if (cq && receivers.length) {
      const chance = Math.max(0, Math.min(1, cq.cruorDropChance != null ? cq.cruorDropChance : 0.2));
      if (Math.random() < chance) {
        const mat = getItem(cq.requiredItem);
        if (mat) {
          const recv = receivers[Math.floor(Math.random() * receivers.length)];
          addItem(recv, mat.id, 1);
          notes.push(`${recv.name} finds ${mat.name}.`);
        }
      }
    }
    for (const q of quests) {
      if (!q || !q.monsterTag || !tags.includes(q.monsterTag)) continue;
      for (const p of members) {
        const st = getQuestState(p, q.id);
        if (!st || !st.accepted || st.completed) continue;
        const need = Math.max(1, q.requiredKills || 1);
        if ((st.kills || 0) < need) {
          st.kills = (st.kills || 0) + 1;
          if (st.kills === need) notes.push(`${p.name} has slain ${need}/${need} ${q.monsterTag}s.`);
        }
        // Tamamlanma: sayaç + envanter ikisi de tutunca bir kez işaretlenir.
        const prog = questProgress(p, q.id);
        if (!st.completed && prog && prog.kills >= prog.needKills && prog.have >= prog.needItem) {
          st.completed = true;
          notes.push(`${p.name} has completed "${q.name}"! Old Vesryn will know them now.`);
        }
      }
    }
  }
  return notes;
}

// 20. seviye vampir embrace'leri: assassin → Bloodspawn (fiziksel),
// mage → Gloomspawn (büyü). Şart: rit tamamlanmış + 10 cruor bedel.
// Temple'daki gibi ascend sinematiği döner.
const VAMPIRE_EMBRACE = {
  bloodspawn: { from: "assassin", title: "You have become Bloodspawn!", color: "#dc2626" },
  gloomspawn: { from: "mage", title: "You have become Gloomspawn!", color: "#7c3aed" },
};

function vampireAscendEligible(player, target) {
  const want = target || "bloodspawn";
  const rule = VAMPIRE_EMBRACE[want];
  if (!rule) return { ok: false, reason: "The old blood is silent." };
  const prog = questProgress(player, "vampire_rite");
  if (!prog || !prog.accepted) return { ok: false, reason: "Old Vesryn has given you no rite. Take up his quest first." };
  if (player.character === want) return { ok: false, reason: "You already walk that path." };
  if (player.character !== rule.from) return { ok: false, reason: `Only a ${rule.from} may kneel for this embrace.` };
  if ((player.level || 1) < 20) return { ok: false, reason: "You must reach level 20 to survive the embrace." };
  if (!prog.completed) {
    return { ok: false, reason: `The rite is unfinished (${prog.kills}/${prog.needKills} slain, ${prog.have}/${prog.needItem} cruor).` };
  }
  return { ok: true, want, rule };
}

// Dayı ile konuşarak 20. seviye vampir ascend'i.
// 10 cruor bedel olarak yanar; temple'daki gibi ascend sinematiği döner.
function vampireAscend(room, player, target) {
  requirePlaying(room, player);
  const check = vampireAscendEligible(player, target);
  if (!check.ok) throw new Error(check.reason);
  const def = getQuestDef("vampire_rite");
  const need = Math.max(1, (def && def.requiredItemCount) || 10);
  if (!hasItem(player, def.requiredItem, need)) {
    throw new Error(`You need ${need}× Drop of Primeval Cruor for the embrace.`);
  }
  const cls = getClass(check.want);
  if (!cls) throw new Error("The old blood is silent.");
  const baseCls = getClass(player.character);
  let prevHist = null;
  try { prevHist = historyOf(player); } catch (e) { prevHist = null; }
  removeItem(player, def.requiredItem, need);
  applyStatDelta(player, cls.evolveBonus || {}, 1);
  player.manaRegen += (cls.manaRegen || 0) - ((baseCls && baseCls.manaRegen) || 0);
  player.hp = player.maxHp;
  player.mana = player.maxMana;
  player.character = cls.slug;
  try {
    const hist = Array.isArray(prevHist) && prevHist.length ? prevHist : [cls.slug];
    if (hist[hist.length - 1] !== cls.slug) hist.push(cls.slug);
    player.classHistory = hist;
  } catch (e) { player.classHistory = [cls.slug]; }
  return {
    type: "temple",
    text: `${player.name} kneels, drinks, and rises as ${cls.label}!`,
    ascend: {
      to: cls.slug,
      label: cls.label,
      title: check.rule.title,
      color: check.rule.color,
      sound: "bloodmagic1",
      sound2: "",
    },
  };
}

module.exports = {
  getQuestDef,
  getQuestState,
  questProgress,
  acceptQuest,
  registerKills,
  vampireAscendEligible,
  vampireAscend,
};
