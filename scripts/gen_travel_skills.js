/**
 * gen_travel_skills.js
 * Claude'un görsel kütüphanesindeki 31 efekti kullanarak her sınıfa yeni
 * Q/E/R yetenekleri + öğrenilebilir bir havuz üretir.
 *
 *  - data/arpgSkills.json  : yeni setler (q/e/r/pool/legacy)
 *  - data/i18nTR.json      : yeni isim + açıklamalar için EN->TR çiftleri
 *
 * Eski yetenekler silinmez: her sınıfın `legacy` alanında saklanır ve bazıları
 * başka sınıfların havuzuna taşınır (ör. Warrior'ın eski R'si War Lord Q'su).
 *
 * Kullanım: node scripts/gen_travel_skills.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data");
const ARPG_FILE = path.join(DATA, "arpgSkills.json");
const I18N_FILE = path.join(DATA, "i18nTR.json");

// KORUMA: bu dosya GameCraft'tan düzenlenebilir. Elle yapılmış düzenlemeleri
// ezmemek için yeniden üretim yalnızca --force ile çalışır.
if (process.argv.indexOf("--force") < 0 && process.env.FORCE_GEN !== "1") {
  try {
    const existing = JSON.parse(fs.readFileSync(ARPG_FILE, "utf8"));
    const extended = Object.values(existing).some((c) => c && (((c.pool || []).length) || ((c.late || []).length)));
    if (extended) {
      console.error("[skills] arpgSkills.json zaten düzenlenmiş (pool/late var). Yeniden üretmek için: node scripts/gen_travel_skills.js --force");
      process.exit(1);
    }
  } catch (e) { /* dosya yoksa normal akış */ }
}

// Eski yeteneklerin tek doğru kaynağı: arşiv. Arşiv yoksa mevcut dosya
// arşivlenir; böylece üreteç ikinci kez çalıştığında `legacy` alanı yeni
// yeteneklerle üzerine YAZILMAZ.
const LEGACY_FILE = path.join(ROOT, "claudeornekleri", "arpgSkillsLegacy.json");
if (!fs.existsSync(LEGACY_FILE)) {
  fs.mkdirSync(path.dirname(LEGACY_FILE), { recursive: true });
  fs.copyFileSync(ARPG_FILE, LEGACY_FILE);
}
const legacy = JSON.parse(fs.readFileSync(LEGACY_FILE, "utf8"));

// ---------------------------------------------------------------------------
// 1) YETENEK KÜTÜPHANESİ — her biri Claude'un hazır görselini çağırır
//    (visual alanı TravelVisuals.skills içindeki isimle eşleşir)
// ---------------------------------------------------------------------------
const LIB = {
  // --- physical / melee ---
  whirlwind: {
    name: "Whirlwind", tr: "Kasırga", el: "physical", visual: "Whirlwind",
    kind: "arc", cd: 4.5, power: 1.55, radius: 100, arc: 1.15, color: "#ffd54f",
    desc: "A full spinning cut that carves every foe in front of you.",
    trDesc: "Önündeki bütün düşmanları biçen tam turlu bir savuruş.",
  },
  earthbreaker: {
    name: "Earthbreaker", tr: "Yerkıran", el: "physical", visual: "Earthbreaker",
    kind: "nova", cd: 9, power: 1.7, radius: 110, knockback: 120, color: "#ffb74d",
    desc: "Slam the ground and send a shockwave through everything nearby.",
    trDesc: "Yere vur; çevrendeki her şeyi sarsan bir şok dalgası yay.",
  },
  bladestorm: {
    name: "Blade Storm", tr: "Bıçak Fırtınası", el: "physical", visual: "Blade Storm",
    kind: "orbit", cd: 15, power: 2.35, radius: 118, duration: 3.2, tick: 0.35, count: 8, speed: 4.6, color: "#80d8ff",
    desc: "Blades orbit you for three seconds, shredding anything they touch.",
    trDesc: "Bıçaklar üç saniye etrafında döner, dokunduklarını parçalar.",
  },
  titanfist: {
    name: "Titan Fist", tr: "Titan Yumruğu", el: "physical", visual: "Titan Fist",
    kind: "aoe", cd: 12, power: 2.7, radius: 95, offset: 55, knockback: 220, color: "#00e5ff",
    desc: "A colossal stone fist crashes down ahead of you.",
    trDesc: "Önüne devasa bir taş yumruk iner.",
  },
  swordstorm: {
    name: "Swordstorm", tr: "Kılıç Fırtınası", el: "physical", visual: "Whirlwind",
    kind: "swing", cd: 10, power: 0.62, radius: 122, hits: 3, interval: 0.2, arc: 1.65, color: "#9fd8ff",
    status: { type: "bleed", duration: 2, dps: 8 },
    desc: "Three wide slashes in quick succession, leaving bleeding wounds.",
    trDesc: "Art arda üç geniş savuruş; kanayan yaralar bırakır.",
  },
  cleavingarc: {
    name: "Cleaving Arc", tr: "Yaran Yay", el: "physical", visual: "Whirlwind",
    kind: "arc", cd: 4.5, power: 1.7, radius: 100, arc: 1.1, color: "#9fd8ff",
    desc: "A broad horizontal slash that catches everything in its arc.",
    trDesc: "Yayındaki her şeyi yakalayan geniş yatay bir savuruş.",
  },
  bloodcut: {
    name: "Blood Cut", tr: "Kan Kesisi", el: "shadow", visual: "Crimson Reap",
    kind: "arc", cd: 5, power: 1.7, radius: 105, arc: 0.95, color: "#ff1744",
    status: { type: "bleed", duration: 2.5, dps: 9 },
    desc: "A quick crimson slash that leaves the wound bleeding.",
    trDesc: "Yarayı kanatır biçimde hızlı, kızıl bir kesik.",
  },
  crimsonreap: {
    name: "Crimson Reap", tr: "Kızıl Biçim", el: "shadow", visual: "Crimson Reap",
    kind: "arc", cd: 10, power: 2.2, radius: 130, arc: 1.4, color: "#ff1744",
    status: { type: "bleed", duration: 3, dps: 12 },
    desc: "A wide scythe of blood rips through the crowd.",
    trDesc: "Kan orak kalabalığın içinden geçer.",
  },
  soulharvest: {
    name: "Soul Harvest", tr: "Ruh Hasadı", el: "shadow", visual: "Soul Harvest",
    kind: "nova", cd: 16, power: 2.5, radius: 140, healPct: 12, color: "#69f0ae",
    desc: "Rip the souls from nearby foes and drink back a share as life.",
    trDesc: "Yakındaki düşmanların ruhunu söküp bir kısmını can olarak içine çek.",
  },
  bonecage: {
    name: "Bone Cage", tr: "Kemik Kafes", el: "shadow", visual: "Bone Cage",
    kind: "ground", cd: 12, power: 1.4, radius: 95, duration: 2.4, tick: 0.4, color: "#d8d0b8",
    status: { type: "freeze", duration: 1.2 },
    desc: "Bones erupt around the target and lock it in place while they cut.",
    trDesc: "Hedefin çevresinde kemikler yükselir, onu yerinde kilitler.",
  },
  bloodritual: {
    name: "Blood Ritual", tr: "Kan Ritüeli", el: "shadow", visual: "Blood Ritual",
    kind: "nova", cd: 17, power: 2.7, radius: 120, healPct: 10, color: "#ff1744",
    desc: "A crimson ritual circle erupts, tearing foes and feeding you.",
    trDesc: "Kızıl bir ritüel çemberi patlar; düşmanı yırtar, sana can verir.",
  },
  // --- fire ---
  infernoburst: {
    name: "Inferno Burst", tr: "Cehennem Patlaması", el: "fire", visual: "Inferno Burst", magic: true,
    kind: "nova", cd: 8.5, power: 1.6, radius: 100, color: "#ff7a1a",
    status: { type: "burn", duration: 3, dps: 12 },
    desc: "A ring of fire detonates around you and keeps burning.",
    trDesc: "Etrafında bir ateş halkası patlar ve yanmaya devam eder.",
  },
  emberwave: {
    name: "Ember Wave", tr: "Kor Dalgası", el: "fire", visual: "Inferno Burst", magic: true,
    kind: "arc", cd: 5, power: 1.5, radius: 105, arc: 1.0, color: "#ffb300",
    status: { type: "burn", duration: 2, dps: 8 },
    desc: "A wave of cinders washes over the arc ahead.",
    trDesc: "Önündeki yayın üzerinden kor dalgası geçer.",
  },
  pyre: {
    name: "Flame Pillar", tr: "Alev Sütunu", el: "fire", visual: "Flame Pillar", magic: true,
    kind: "ground", cd: 8, power: 1.5, radius: 70, duration: 2.4, tick: 0.45, range: 300, color: "#ff6a1a",
    status: { type: "burn", duration: 2.5, dps: 10 },
    desc: "A pillar of flame erupts where you point and lingers.",
    trDesc: "İşaret ettiğin yerde alev sütunu yükselir ve sürer.",
  },
  meteorstorm: {
    name: "Meteor Storm", tr: "Meteor Fırtınası", el: "fire", visual: "Meteor Storm", magic: true,
    kind: "meteor", cd: 15, power: 2.6, radius: 120, delay: 0.35, count: 2, stagger: 0.2, spreadRadius: 110, range: 340, color: "#ff8a65",
    status: { type: "burn", duration: 3, dps: 14 },
    desc: "Call down meteors on the marked ground, leaving burning craters.",
    trDesc: "İşaretli yere meteorlar indir; yanan kraterler bırak.",
  },
  cometfall: {
    name: "Comet Fall", tr: "Kuyruklu Düşüş", el: "fire", visual: "Meteor Storm", magic: true,
    kind: "meteor", cd: 7.5, power: 1.35, radius: 85, delay: 0.3, range: 320, color: "#ffb74d",
    desc: "A single comet drops on the target area.",
    trDesc: "Hedef alana tek bir kuyruklu yıldız düşer.",
  },
  starfall: {
    name: "Starfall", tr: "Yıldız Yağmuru", el: "arcane", visual: "Starfall", magic: true,
    kind: "meteor", cd: 17, power: 2.8, radius: 135, delay: 0.45, count: 3, stagger: 0.14, spreadRadius: 130, range: 360, color: "#ffe57f",
    desc: "Stars rain from the sky across a wide area.",
    trDesc: "Gökten geniş bir alana yıldızlar yağar.",
  },
  // --- frost / storm ---
  frostnova: {
    name: "Frost Nova", tr: "Buz Novası", el: "frost", visual: "Frost Nova", magic: true,
    kind: "nova", cd: 8, power: 1.4, radius: 105, color: "#80deea",
    status: { type: "freeze", duration: 1.2 },
    desc: "A ring of ice bursts outward and freezes what it touches.",
    trDesc: "Dışa doğru buz halkası patlar, dokunduğunu dondurur.",
  },
  frostbite: {
    name: "Frostbite", tr: "Soğuk Isırığı", el: "frost", visual: "Frost Nova", magic: true,
    kind: "nova", cd: 5, power: 1.15, radius: 85, color: "#9fe2ff",
    status: { type: "slow", duration: 2, slow: 0.5 },
    desc: "A small icy burst that slows everything nearby.",
    trDesc: "Yakındaki her şeyi yavaşlatan küçük bir buz patlaması.",
  },
  glaciervall: {
    name: "Glacier Wall", tr: "Buzul Duvarı", el: "frost", visual: "Glacier Wall", magic: true,
    kind: "ground", cd: 11, power: 1.25, radius: 80, duration: 2.2, tick: 0.45, range: 280, color: "#9fe2ff",
    status: { type: "freeze", duration: 1.0 },
    desc: "Raise a wall of ice ahead that slows and cuts anything crossing it.",
    trDesc: "Önüne geçenleri yavaşlatan ve kesen bir buz duvarı dik.",
  },
  blizzard: {
    name: "Blizzard", tr: "Kar Fırtınası", el: "frost", visual: "Blizzard", magic: true,
    kind: "ground", cd: 16, power: 1.9, radius: 130, duration: 3.4, tick: 0.4, range: 330, color: "#9fe2ff",
    status: { type: "freeze", duration: 0.8 },
    desc: "A long-lasting snowstorm grinds away at a wide area.",
    trDesc: "Geniş bir alanı kemiren, uzun süreli bir kar fırtınası.",
  },
  chainlightning: {
    name: "Chain Lightning", tr: "Zincir Yıldırım", el: "lightning", visual: "Chain Lightning", magic: true,
    kind: "chain", cd: 8, power: 1.5, radius: 320, jumps: 4, chainRange: 200, color: "#80d8ff",
    status: { type: "shock", duration: 2, dps: 8 },
    desc: "Lightning leaps between foes, shocking each one it touches.",
    trDesc: "Yıldırım düşmandan düşmana sıçrar, her birini çarpar.",
  },
  sparkchain: {
    name: "Spark Chain", tr: "Kıvılcım Zinciri", el: "lightning", visual: "Chain Lightning", magic: true,
    kind: "chain", cd: 5.5, power: 1.1, radius: 260, jumps: 3, chainRange: 180, color: "#b388ff",
    status: { type: "shock", duration: 1.5, dps: 6 },
    desc: "A quick spark that hops across a few nearby enemies.",
    trDesc: "Yakındaki birkaç düşmana sıçrayan hızlı bir kıvılcım.",
  },
  thunderfall: {
    name: "Thunderfall", tr: "Gök Gürültüsü", el: "lightning", visual: "Thunderfall", magic: true,
    kind: "meteor", cd: 12, power: 2.2, radius: 110, delay: 0.35, range: 320, color: "#b388ff",
    status: { type: "stun", duration: 0.5 },
    desc: "A thunderbolt slams down and stuns the target area.",
    trDesc: "Bir yıldırım iner ve hedef alanı sersemletir.",
  },
  stormcall: {
    name: "Storm Call", tr: "Fırtına Çağrısı", el: "lightning", visual: "Thunderfall", magic: true,
    kind: "meteor", cd: 6.5, power: 1.35, radius: 85, delay: 0.28, range: 300, color: "#80d8ff",
    status: { type: "shock", duration: 1.5, dps: 7 },
    desc: "Call a quick bolt to a nearby point.",
    trDesc: "Yakın bir noktaya hızlı bir yıldırım çağır.",
  },
  cyclone: {
    name: "Cyclone", tr: "Siklon", el: "physical", visual: "Cyclone",
    kind: "vortex", cd: 9, power: 1.2, radius: 120, duration: 2.6, tick: 0.35, pull: 120, range: 300, color: "#b0bec5",
    desc: "A spinning vortex drags enemies inward and shreds them.",
    trDesc: "Dönen bir girdap düşmanları içeri çeker ve parçalar.",
  },
  gale: {
    name: "Gale", tr: "Rüzgâr", el: "physical", visual: "Cyclone",
    kind: "vortex", cd: 6, power: 1.0, radius: 100, duration: 2, tick: 0.35, pull: 90, range: 260, color: "#b0bec5",
    desc: "A short burst of wind that pulls and cuts.",
    trDesc: "Çeken ve kesen kısa bir rüzgâr patlaması.",
  },
  // --- nature / poison ---
  toxiccloud: {
    name: "Toxic Cloud", tr: "Zehir Bulutu", el: "nature", visual: "Toxic Cloud", magic: true,
    kind: "ground", cd: 8, power: 1.1, radius: 100, duration: 3, tick: 0.5, dot: 10, range: 300, color: "#7cb342",
    desc: "A lingering cloud of poison that eats away at anything inside.",
    trDesc: "İçindeki her şeyi kemiren, kalıcı bir zehir bulutu.",
  },
  venomspit: {
    name: "Venom Spit", tr: "Zehir Tükürüğü", el: "nature", visual: "Toxic Cloud", magic: true,
    kind: "projectile", cd: 5, power: 1.35, speed: 620, radius: 9, color: "#7cb342",
    desc: "Spit a blob of venom that bursts on impact.",
    trDesc: "Çarpınca patlayan bir zehir topağı tükür.",
  },
  thornsnare: {
    name: "Thorn Snare", tr: "Diken Tuzağı", el: "nature", visual: "Thorn Snare", magic: true,
    kind: "ground", cd: 8, power: 1.0, radius: 90, duration: 2.2, tick: 0.4, range: 280, color: "#76ff03",
    status: { type: "freeze", duration: 1.4 },
    desc: "Thorned vines erupt and root everything in the area.",
    trDesc: "Dikenli sarmaşıklar fışkırır ve alandaki her şeyi kökler.",
  },
  bramble: {
    name: "Bramble", tr: "Çalı Dikeni", el: "nature", visual: "Thorn Snare", magic: true,
    kind: "arc", cd: 5, power: 1.3, radius: 95, arc: 1.0, color: "#76ff03",
    desc: "A lash of thorned vines sweeps the arc ahead.",
    trDesc: "Önündeki yayı süpüren dikenli sarmaşık kamçısı.",
  },
  spiritpack: {
    name: "Spirit Pack", tr: "Ruh Sürüsü", el: "nature", visual: "Spirit Pack", magic: true,
    kind: "aoe", cd: 14, power: 1.7, radius: 120, offset: 60, pet: true, color: "#80deea",
    desc: "Ghostly wolves circle the target and lunge as one.",
    trDesc: "Hayalet kurtlar hedefin etrafında döner ve birlikte atılır.",
  },
  treeoflife: {
    name: "Tree of Life", tr: "Hayat Ağacı", el: "nature", visual: "Tree of Life", magic: true,
    kind: "heal", cd: 16, healPct: 30, radius: 120, color: "#69f0ae",
    desc: "A great tree blooms and pours healing light over the ground.",
    trDesc: "Ulu bir ağaç açar ve yere şifa ışığı döker.",
  },
  // --- holy ---
  holylance: {
    name: "Judgement Beam", tr: "Hüküm Işını", el: "holy", visual: "Judgement Beam", magic: true,
    kind: "beam", cd: 7, power: 1.7, range: 300, width: 26, color: "#fff59d",
    desc: "A lance of holy light burns a straight line through the enemy.",
    trDesc: "Kutsal ışıktan bir mızrak düşmanın içinden düz bir çizgi yakar.",
  },
  judgementbeam: {
    name: "Radiant Verdict", tr: "Işıklı Hüküm", el: "holy", visual: "Judgement Beam", magic: true,
    kind: "beam", cd: 11, power: 2.1, range: 360, width: 34, color: "#ffe082",
    desc: "A wide beam of judgement that sears everything in its path.",
    trDesc: "Yolundaki her şeyi dağlayan geniş bir hüküm ışını.",
  },
  divinejudgement: {
    name: "Divine Judgement", tr: "İlahi Hüküm", el: "holy", visual: "Divine Judgement", magic: true,
    kind: "nova", cd: 18, power: 2.9, radius: 150, color: "#fff59d",
    status: { type: "stun", duration: 0.8 },
    desc: "Six blades of light fall around you and stun the wicked.",
    trDesc: "Etrafına altı ışık kılıcı iner ve günahkârları sersemletir.",
  },
  judgement: {
    name: "Judgement", tr: "Hüküm", el: "holy", visual: "Divine Judgement", magic: true,
    kind: "meteor", cd: 16, power: 2.9, radius: 135, delay: 0.4, range: 340, color: "#ffe082",
    status: { type: "stun", duration: 0.9 },
    desc: "Call a single colossal blade of judgement on the marked spot.",
    trDesc: "İşaretli noktaya tek, devasa bir hüküm kılıcı çağır.",
  },
  runecircle: {
    name: "Rune Circle", tr: "Rün Çemberi", el: "arcane", visual: "Rune Circle", magic: true,
    kind: "nova", cd: 10, power: 1.2, radius: 120, color: "#b388ff",
    status: { type: "shock", duration: 2, dps: 7 },
    desc: "A rune circle flares under you, shocking everything standing on it.",
    trDesc: "Altında bir rün çemberi parlar, üstündeki her şeyi çarpar.",
  },
  runeseal: {
    name: "Rune Seal", tr: "Rün Mührü", el: "arcane", visual: "Rune Circle", magic: true,
    kind: "shield", cd: 11, power: 0, shieldPct: 22, duration: 5, color: "#b388ff",
    desc: "Etch a warding rune that absorbs a share of incoming damage.",
    trDesc: "Gelen hasarın bir kısmını yutan koruyucu bir rün kaz.",
  },
  // --- shadow / void ---
  umbrallash: {
    name: "Umbral Lash", tr: "Gölge Kamçısı", el: "shadow", visual: "Shadow Grasp",
    kind: "arc", cd: 5, power: 1.5, radius: 110, arc: 1.1, color: "#9c4dff",
    desc: "A whip of shadow cuts across the foes in front of you.",
    trDesc: "Önündeki düşmanları kesen bir gölge kamçısı.",
  },
  shadowgrasp: {
    name: "Shadow Grasp", tr: "Gölge Kavrayışı", el: "shadow", visual: "Shadow Grasp", magic: true,
    kind: "ground", cd: 9, power: 1.4, radius: 95, duration: 2.2, tick: 0.4, range: 300, color: "#9c4dff",
    status: { type: "freeze", duration: 1.0 },
    desc: "Shadow tendrils burst from the ground and claw at everything.",
    trDesc: "Yerden gölge kolları fışkırır ve her şeyi tırmalar.",
  },
  singularity: {
    name: "Singularity", tr: "Tekillik", el: "shadow", visual: "Singularity", magic: true,
    kind: "vortex", cd: 16, power: 2.0, radius: 130, duration: 2.8, tick: 0.4, pull: 220, range: 330, color: "#7c4dff",
    desc: "Open a collapsing void that drags enemies into its core.",
    trDesc: "Düşmanları çekirdeğine çeken, çöken bir boşluk aç.",
  },
  dimensionrift: {
    name: "Dimension Rift", tr: "Boyut Yarığı", el: "arcane", visual: "Dimension Rift", magic: true,
    kind: "teleport", cd: 10, power: 1.9, radius: 90, range: 230, color: "#b388ff",
    desc: "Tear space and step through it, shredding everything you leave behind.",
    trDesc: "Uzayı yırt ve içinden geç; geride bıraktığın her şeyi parçala.",
  },
  // --- dragon / phoenix ---
  dragonsbreath: {
    name: "Dragon Breath", tr: "Ejder Nefesi", el: "fire", visual: "Dragon Breath", magic: true,
    kind: "arc", cd: 14, power: 2.4, radius: 150, arc: 1.0, color: "#ff5a14",
    status: { type: "burn", duration: 3, dps: 16 },
    desc: "Exhale a cone of dragonfire that sets the ground alight.",
    trDesc: "Yeri tutuşturan bir ejder ateşi konisi püskürt.",
  },
  phoenixrebirth: {
    name: "Phoenix Rebirth", tr: "Anka Doğuşu", el: "holy", visual: "Phoenix Rebirth", magic: true,
    kind: "heal", cd: 22, healPct: 45, radius: 110, shieldPct: 12, duration: 5, color: "#ff8f00",
    desc: "A phoenix rises from you, restoring a great amount of health.",
    trDesc: "İçinden bir anka yükselir, büyük miktarda can geri verir.",
  },
  // --- heals ---
  healingrain: {
    name: "Healing Rain", tr: "Şifa Yağmuru", el: "holy", visual: "Healing Rain", magic: true,
    kind: "heal", cd: 9, healPct: 18, radius: 90, color: "#69f0ae",
    desc: "Warm rain falls and knits your wounds shut.",
    trDesc: "Ilık bir yağmur yağar ve yaralarını kapatır.",
  },
  mendinglight: {
    name: "Mending Light", tr: "Onaran Işık", el: "holy", visual: "Healing Rain", magic: true,
    kind: "heal", cd: 6, healPct: 10, radius: 70, color: "#69f0ae",
    desc: "A soft light mends a small amount of health.",
    trDesc: "Yumuşak bir ışık az miktarda can onarır.",
  },
};

// --- Geç oyun (legend) yetenekleri: 4 ve 6 travel puanı ---
// Her sınıf, ana elementine göre bu iki yeteneği havuzuna alır. Güçleri bilinçli
// olarak yüksektir; yalnızca seferlerde kazanılan travel puanıyla açılırlar.
const LATE = {
  doomgavel: {
    name: "Doom Gavel", tr: "Kıyamet Tokmağı", el: "physical", visual: "Titan Fist",
    kind: "meteor", cd: 34, power: 3.4, radius: 150, delay: 0.45, range: 340, knockback: 260, color: "#ffd54f",
    cost: 4, late: true,
    desc: "A colossal gavel of stone falls from the sky and shatters the ground.",
    trDesc: "Gökten devasa bir taş tokmak düşer ve yeri parçalar.",
  },
  worldbreaker: {
    name: "World Breaker", tr: "Dünya Kırıcı", el: "physical", visual: "Earthbreaker",
    kind: "nova", cd: 45, power: 4.6, radius: 190, knockback: 340, color: "#ffb74d",
    cost: 6, late: true,
    desc: "One strike cracks the world; everything around you is thrown back.",
    trDesc: "Tek vuruş dünyayı çatlatır; çevrendeki her şey geri savrulur.",
  },
  sunfall: {
    name: "Sunfall", tr: "Güneş Düşüşü", el: "fire", visual: "Meteor Storm", magic: true,
    kind: "meteor", cd: 36, power: 3.5, radius: 165, delay: 0.4, count: 3, stagger: 0.18, spreadRadius: 150, range: 360, color: "#ff8a65",
    status: { type: "burn", duration: 4, dps: 20 }, cost: 4, late: true,
    desc: "Three burning suns crash down and leave the earth ablaze.",
    trDesc: "Üç yanan güneş yere çakılır ve toprağı tutuşturur.",
  },
  infernalcrown: {
    name: "Infernal Crown", tr: "Cehennem Tacı", el: "fire", visual: "Inferno Burst", magic: true,
    kind: "nova", cd: 46, power: 4.8, radius: 200, color: "#ff3d00",
    status: { type: "burn", duration: 5, dps: 26 }, cost: 6, late: true,
    desc: "A crown of hellfire erupts around you and keeps the ground burning.",
    trDesc: "Etrafında cehennem ateşinden bir taç patlar ve yeri yakmaya devam eder.",
  },
  absolutezero: {
    name: "Absolute Zero", tr: "Mutlak Sıfır", el: "frost", visual: "Blizzard", magic: true,
    kind: "ground", cd: 36, power: 3.3, radius: 170, duration: 4, tick: 0.4, range: 340, color: "#9fe2ff",
    status: { type: "freeze", duration: 2.2 }, cost: 4, late: true,
    desc: "A killing frost locks a wide area and everything inside it.",
    trDesc: "Öldürücü bir ayaz geniş bir alanı ve içindeki her şeyi kilitler.",
  },
  eternalwinter: {
    name: "Eternal Winter", tr: "Ebedi Kış", el: "frost", visual: "Frost Nova", magic: true,
    kind: "nova", cd: 46, power: 4.7, radius: 205, color: "#80deea",
    status: { type: "freeze", duration: 2.6 }, cost: 6, late: true,
    desc: "Winter itself bursts outward, freezing everything it touches solid.",
    trDesc: "Kışın kendisi dışa doğru patlar, dokunduğu her şeyi dondurur.",
  },
  skyrend: {
    name: "Sky Rend", tr: "Gökyüzü Yarığı", el: "lightning", visual: "Thunderfall", magic: true,
    kind: "meteor", cd: 34, power: 3.4, radius: 155, delay: 0.35, range: 350, color: "#b388ff",
    status: { type: "stun", duration: 1.0 }, cost: 4, late: true,
    desc: "The sky tears open and a single bolt levels the marked ground.",
    trDesc: "Gökyüzü yırtılır ve tek bir yıldırım işaretli yeri yerle bir eder.",
  },
  tempestsovereign: {
    name: "Tempest Sovereign", tr: "Fırtına Hükümdarı", el: "lightning", visual: "Chain Lightning", magic: true,
    kind: "chain", cd: 44, power: 4.5, radius: 420, jumps: 7, chainRange: 230, color: "#80d8ff",
    status: { type: "shock", duration: 3, dps: 18 }, cost: 6, late: true,
    desc: "Lightning obeys you, leaping across the whole battlefield.",
    trDesc: "Yıldırım sana itaat eder, tüm savaş alanına sıçrar.",
  },
  nightfall: {
    name: "Nightfall", tr: "Gece Çöküşü", el: "shadow", visual: "Singularity", magic: true,
    kind: "vortex", cd: 35, power: 3.3, radius: 165, duration: 3.2, tick: 0.35, pull: 280, range: 350, color: "#7c4dff",
    cost: 4, late: true,
    desc: "Night collapses into a hungry void that drags enemies to its core.",
    trDesc: "Gece, düşmanları çekirdeğine çeken aç bir boşluğa çöker.",
  },
  voidcrown: {
    name: "Void Crown", tr: "Boşluk Tacı", el: "shadow", visual: "Blood Ritual", magic: true,
    kind: "nova", cd: 46, power: 4.7, radius: 200, healPct: 18, color: "#9c4dff",
    cost: 6, late: true,
    desc: "A void crown detonates around you, tearing foes and feeding you their essence.",
    trDesc: "Etrafında bir boşluk tacı patlar; düşmanı yırtar, özlerini sana verir.",
  },
  seraphsjudgement: {
    name: "Seraph's Judgement", tr: "Seraf Hükmü", el: "holy", visual: "Judgement Beam", magic: true,
    kind: "beam", cd: 34, power: 3.5, range: 380, width: 42, color: "#fff59d",
    cost: 4, late: true,
    desc: "A seraph's spear of light burns a wide path through everything.",
    trDesc: "Bir serafın ışık mızrağı her şeyin içinden geniş bir yol yakar.",
  },
  eternaldawn: {
    name: "Eternal Dawn", tr: "Ebedi Şafak", el: "holy", visual: "Divine Judgement", magic: true,
    kind: "nova", cd: 45, power: 4.8, radius: 195, healPct: 22, color: "#ffe082",
    status: { type: "stun", duration: 1.2 }, cost: 6, late: true,
    desc: "Dawn breaks all at once: foes are stunned, allies are restored.",
    trDesc: "Şafak bir anda söker: düşmanlar sersemler, müttefikler iyileşir.",
  },
  primordialgrove: {
    name: "Primordial Grove", tr: "İlkel Koru", el: "nature", visual: "Tree of Life", magic: true,
    kind: "heal", cd: 30, healPct: 55, shieldPct: 20, duration: 6, radius: 150, color: "#69f0ae",
    cost: 4, late: true,
    desc: "An ancient grove blooms around you, pouring life into every wound.",
    trDesc: "Etrafında kadim bir koru açar, her yaraya can döker.",
  },
  verdantwrath: {
    name: "Verdant Wrath", tr: "Yeşil Gazap", el: "nature", visual: "Thorn Snare", magic: true,
    kind: "ground", cd: 44, power: 4.6, radius: 200, duration: 4, tick: 0.35, range: 340, color: "#76ff03",
    status: { type: "freeze", duration: 1.8 }, cost: 6, late: true,
    desc: "The wilds rise up: thorns, roots and rot devour the marked land.",
    trDesc: "Yaban ayaklanır: dikenler, kökler ve çürük işaretli toprağı yutar.",
  },
  astralcollapse: {
    name: "Astral Collapse", tr: "Astral Çöküş", el: "arcane", visual: "Starfall", magic: true,
    kind: "meteor", cd: 36, power: 3.6, radius: 165, delay: 0.4, count: 5, stagger: 0.12, spreadRadius: 160, range: 370, color: "#ffe57f",
    cost: 4, late: true,
    desc: "Five collapsing stars hammer the battlefield in quick succession.",
    trDesc: "Beş çöken yıldız art arda savaş alanını döver.",
  },
  arcanedominion: {
    name: "Arcane Dominion", tr: "Arkana Egemenliği", el: "arcane", visual: "Starfall", magic: true,
    kind: "meteor", cd: 47, power: 4.9, radius: 210, delay: 0.5, count: 7, stagger: 0.1, spreadRadius: 200, range: 400, color: "#b388ff",
    cost: 6, late: true,
    desc: "You claim the sky: seven stars answer your call at once.",
    trDesc: "Gökyüzünü sahiplenirsin: yedi yıldız aynı anda çağrına uyar.",
  },
};
Object.assign(LIB, LATE);

// Ana element -> iki legend yeteneği (4 puanlık + 6 puanlık).
const LATE_BY_ELEMENT = {
  physical: ["doomgavel", "worldbreaker"],
  fire: ["sunfall", "infernalcrown"],
  frost: ["absolutezero", "eternalwinter"],
  lightning: ["skyrend", "tempestsovereign"],
  shadow: ["nightfall", "voidcrown"],
  holy: ["seraphsjudgement", "eternaldawn"],
  nature: ["primordialgrove", "verdantwrath"],
  arcane: ["astralcollapse", "arcanedominion"],
};

// --- eski (oyundaki) yeteneklerin görsel eşlemesi ---
const VISUAL_FOR_KIND = {
  arc: "Whirlwind", swing: "Whirlwind", channel: "Blade Storm", orbit: "Blade Storm",
  fan: "Cyclone", barrage: "Starfall", beam: "Judgement Beam", meteor: "Meteor Storm",
  chain: "Chain Lightning", vortex: "Cyclone", ground: "Toxic Cloud", shield: "Rune Circle",
  nova: "Earthbreaker", aoe: "Earthbreaker", heal: "Healing Rain",
  projectile: "Chain Lightning", dash: "Dimension Rift", teleport: "Dimension Rift",
};

const LEGACY_TR = {
  "Cleaving Arc": "Yaran Yay",
  "Swordstorm": "Kılıç Fırtınası",
  "Blade Tempest": "Bıçak Kasırgası",
  "Triple Shot": "Üçlü Atış",
  "Piercing Bolt": "Delici Ok",
  "Rain of Arrows": "Ok Yağmuru",
  "Arcane Rift": "Arkana Yarığı",
  "Frost Vortex": "Don Girdabı",
  "Fan of Knives": "Bıçak Yelpazesi",
  "Smoke Bomb": "Sis Bombası",
  "Shadow Dance": "Gölge Dansı",
  "Dawn Strike": "Şafak Darbesi",
  "Aegis of Dawn": "Şafak Siperi",
  "Judgment": "Hüküm",
};

function legacySkill(classSlug, slot) {
  const src = legacy[classSlug] && legacy[classSlug][slot];
  if (!src) return null;
  const out = JSON.parse(JSON.stringify(src));
  out.id = "legacy_" + classSlug + "_" + slot;
  out.visual = VISUAL_FOR_KIND[out.kind] || "Whirlwind";
  out.tr = LEGACY_TR[out.name] || out.name;
  out.legacyFrom = classSlug + "." + slot;
  out.desc = out.desc || "A technique carried over from the old travel kit.";
  out.trDesc = out.desc;
  out.cost = out.cd >= 14 ? 3 : out.cd >= 9 ? 2 : 1;
  return out;
}

function build(id) {
  const def = LIB[id];
  if (!def) throw new Error("bilinmeyen yetenek: " + id);
  const out = { id, name: def.name, visual: def.visual, element: def.el };
  for (const k of Object.keys(def)) {
    if (k === "name" || k === "tr" || k === "el" || k === "desc" || k === "trDesc") continue;
    out[k] = def[k];
  }
  out.cd = Number(def.cd) || 6;
  out.power = Number(def.power) || 0;
  out.cost = def.cost != null ? def.cost : (out.cd >= 14 ? 3 : out.cd >= 9 ? 2 : 1);
  out.desc = def.desc || "";
  out.trDesc = def.trDesc || def.desc || "";
  return out;
}

// ---------------------------------------------------------------------------
// 2) SINIF SETLERİ  (q/e/r varsayılan, pool öğrenilebilir)
//    "legacy:sinif:slot" -> eski yeteneği bu sınıfa taşı
// ---------------------------------------------------------------------------
const SETS = {
  warrior:       { q: ["whirlwind"], e: ["earthbreaker"], r: ["bladestorm"], pool: ["titanfist", "legacy:warrior:e", "legacy:warrior:q"] },
  ranger:        { q: ["gale"], e: ["cyclone"], r: ["starfall"], pool: ["legacy:ranger:r", "spiritpack", "toxiccloud"] },
  mage:          { q: ["frostnova"], e: ["infernoburst"], r: ["meteorstorm"], pool: ["glaciervall", "chainlightning", "emberwave"] },
  rogue:         { q: ["toxiccloud"], e: ["umbrallash"], r: ["bladestorm"], pool: ["shadowgrasp", "legacy:rogue:e", "gale"] },
  paladin:       { q: ["holylance"], e: ["runeseal"], r: ["divinejudgement"], pool: ["judgementbeam", "healingrain", "legacy:paladin:e"] },
  assassin:      { q: ["umbrallash"], e: ["shadowgrasp"], r: ["bladestorm"], pool: ["dimensionrift", "legacy:rogue:r", "venomspit"] },
  support:       { q: ["mendinglight"], e: ["healingrain"], r: ["treeoflife"], pool: ["phoenixrebirth", "runeseal", "thornsnare"] },
  tank:          { q: ["earthbreaker"], e: ["glaciervall"], r: ["titanfist"], pool: ["runeseal", "bonecage", "legacy:paladin:e"] },
  tamer:         { q: ["bramble"], e: ["thornsnare"], r: ["spiritpack"], pool: ["cyclone", "umbrallash", "legacy:tamer:r"] },
  gardener:      { q: ["bramble"], e: ["toxiccloud"], r: ["treeoflife"], pool: ["thornsnare", "healingrain", "legacy:gardener:r"] },
  moderator:     { q: ["runecircle"], e: ["dimensionrift"], r: ["starfall"], pool: ["runeseal", "chainlightning", "singularity"] },
  tester:        { q: ["whirlwind"], e: ["legacy:mage:q"], r: ["meteorstorm"], pool: ["chainlightning", "runecircle", "soulharvest"] },
  beastmaster:   { q: ["bramble"], e: ["spiritpack"], r: ["cyclone"], pool: ["umbrallash", "earthbreaker", "legacy:beastmaster:r"] },
  anima_lorde:   { q: ["umbrallash"], e: ["thornsnare"], r: ["spiritpack"], pool: ["treeoflife", "titanfist", "legacy:anima_lorde:r"] },
  rootbinder:    { q: ["bramble"], e: ["thornsnare"], r: ["treeoflife"], pool: ["toxiccloud", "bonecage", "legacy:rootbinder:r"] },
  lifeweaver:    { q: ["mendinglight"], e: ["healingrain"], r: ["treeoflife"], pool: ["phoenixrebirth", "runeseal", "spiritpack"] },
  ultra_moderator: { q: ["dimensionrift"], e: ["runecircle"], r: ["singularity"], pool: ["starfall", "judgementbeam", "chainlightning"] },
  warlord:       { q: ["legacy:warrior:r"], e: ["pyre"], r: ["dragonsbreath"], pool: ["whirlwind", "bladestorm", "earthbreaker"] },
  warden:        { q: ["cyclone"], e: ["blizzard"], r: ["starfall"], pool: ["gale", "glaciervall", "legacy:ranger:r"] },
  archmage:      { q: ["frostnova"], e: ["chainlightning"], r: ["starfall"], pool: ["meteorstorm", "singularity", "blizzard"] },
  nightblade:    { q: ["umbrallash"], e: ["shadowgrasp"], r: ["bladestorm"], pool: ["legacy:rogue:r", "dimensionrift", "crimsonreap"] },
  crusader:      { q: ["whirlwind"], e: ["legacy:warrior:e"], r: ["divinejudgement"], pool: ["legacy:paladin:r", "runeseal", "judgementbeam"] },
  reaper:        { q: ["bloodcut"], e: ["crimsonreap"], r: ["soulharvest"], pool: ["bonecage", "shadowgrasp", "legacy:reaper:r"] },
  high_priest:   { q: ["holylance"], e: ["healingrain"], r: ["phoenixrebirth"], pool: ["judgementbeam", "treeoflife", "legacy:high_priest:r"] },
  juggernaut:    { q: ["earthbreaker"], e: ["titanfist"], r: ["bladestorm"], pool: ["bonecage", "whirlwind", "legacy:juggernaut:r"] },
  war_emperor:   { q: ["dragonsbreath"], e: ["infernoburst"], r: ["meteorstorm"], pool: ["bladestorm", "titanfist", "legacy:war_emperor:r"] },
  storm_warden:  { q: ["cyclone"], e: ["chainlightning"], r: ["thunderfall"], pool: ["blizzard", "legacy:mage:e", "stormcall"] },
  archon:        { q: ["thunderfall"], e: ["starfall"], r: ["divinejudgement"], pool: ["dimensionrift", "chainlightning", "judgementbeam"] },
  shade_king:    { q: ["shadowgrasp"], e: ["singularity"], r: ["dimensionrift"], pool: ["legacy:mage:q", "umbrallash", "soulharvest"] },
  lightbringer:  { q: ["judgementbeam"], e: ["phoenixrebirth"], r: ["divinejudgement"], pool: ["holylance", "treeoflife", "legacy:paladin:r"] },
  death_lord:    { q: ["bonecage"], e: ["crimsonreap"], r: ["soulharvest"], pool: ["shadowgrasp", "singularity", "legacy:death_lord:r"] },
  bloodspawn:    { q: ["bloodcut"], e: ["crimsonreap"], r: ["bloodritual"], pool: ["shadowgrasp", "soulharvest", "legacy:bloodspawn:r"] },
  bloodlord:     { q: ["bloodcut"], e: ["dragonsbreath"], r: ["bloodritual"], pool: ["crimsonreap", "soulharvest", "legacy:bloodlord:r"] },
  gloomspawn:    { q: ["umbrallash"], e: ["bonecage"], r: ["soulharvest"], pool: ["shadowgrasp", "singularity", "legacy:gloomspawn:r"] },
  sanguine_lord: { q: ["bloodcut"], e: ["bloodritual"], r: ["soulharvest"], pool: ["crimsonreap", "shadowgrasp", "legacy:sanguine_lord:r"] },
  divine_saint:  { q: ["judgementbeam"], e: ["phoenixrebirth"], r: ["starfall"], pool: ["judgement", "runeseal", "treeoflife"] },
  colossus:      { q: ["earthbreaker"], e: ["titanfist"], r: ["bladestorm"], pool: ["bonecage", "glaciervall", "legacy:colossus:r"] },
};

function resolve(ref) {
  if (ref.startsWith("legacy:")) {
    const [, cls, slot] = ref.split(":");
    const sk = legacySkill(cls, slot);
    if (!sk) throw new Error("legacy yetenek yok: " + ref);
    return sk;
  }
  return build(ref);
}

// ---------------------------------------------------------------------------
// 3) ÜRET
// ---------------------------------------------------------------------------
const out = {};
const trPairs = [];
const seen = new Set();

function collectTr(sk) {
  for (const [en, tr] of [[sk.name, sk.tr || LIB[sk.id] && LIB[sk.id].tr], [sk.desc, sk.trDesc]]) {
    if (!en || !tr || en === tr) continue;
    const key = en + "\u0000" + tr;
    if (seen.has(key)) continue;
    seen.add(key);
    trPairs.push({ en, tr });
  }
}

for (const slug of Object.keys(SETS)) {
  const set = SETS[slug];
  const old = legacy[slug] || {};
  const entry = {
    atkSpd: old.atkSpd != null ? old.atkSpd : 0,
    auto: old.auto || { element: "physical" },
  };
  for (const slot of ["q", "e", "r"]) {
    const sk = resolve(set[slot][0]);
    sk.slot = slot;
    sk.cost = 0;
    sk.defaultSlot = slot;
    entry[slot] = sk;
    collectTr(sk);
  }
  entry.pool = (set.pool || []).map((ref) => {
    const sk = resolve(ref);
    sk.slot = null;
    collectTr(sk);
    return sk;
  });
  // Geç oyun: sınıfın ana elementine göre 4 ve 6 puanlık iki legend yeteneği.
  const lateIds = LATE_BY_ELEMENT[(entry.r && entry.r.element) || "physical"] || LATE_BY_ELEMENT.physical;
  entry.late = lateIds.map((id) => {
    const sk = resolve(id);
    sk.slot = null;
    collectTr(sk);
    return sk;
  });
  // Eski yetenekler bilgi olarak korunur.
  entry.legacy = {};
  for (const slot of ["q", "e", "r"]) {
    if (old[slot]) entry.legacy[slot] = JSON.parse(JSON.stringify(old[slot]));
  }
  out[slug] = entry;
}

// Eksik sınıf kalmasın: varsayılan savaşçı setini kopyala.
for (const slug of Object.keys(legacy)) {
  if (out[slug]) continue;
  const copy = JSON.parse(JSON.stringify(out.warrior));
  copy.atkSpd = legacy[slug].atkSpd != null ? legacy[slug].atkSpd : 0;
  copy.auto = legacy[slug].auto || copy.auto;
  copy.legacy = JSON.parse(JSON.stringify(legacy[slug]));
  out[slug] = copy;
}

fs.writeFileSync(ARPG_FILE, JSON.stringify(out, null, 2) + "\n", "utf8");

// i18n çiftlerini ekle (var olanların üzerine yazma).
let i18n = [];
try {
  i18n = JSON.parse(fs.readFileSync(I18N_FILE, "utf8"));
} catch (e) {
  i18n = [];
}
const have = new Set((Array.isArray(i18n) ? i18n : []).map((r) => (r && r.en) || ""));
let added = 0;
for (const p of trPairs) {
  if (have.has(p.en)) continue;
  have.add(p.en);
  i18n.push(p);
  added++;
}
fs.writeFileSync(I18N_FILE, JSON.stringify(i18n, null, 2) + "\n", "utf8");

const poolCount = Object.values(out).reduce((n, c) => n + (c.pool ? c.pool.length : 0), 0);
const lateCount = Object.values(out).reduce((n, c) => n + (c.late ? c.late.length : 0), 0);
console.log(`[skills] ${Object.keys(out).length} sınıf, ${Object.keys(out).length * 3} varsayılan + ${poolCount} havuz + ${lateCount} geç oyun yeteneği`);
console.log(`[skills] i18n: ${added} yeni EN->TR çifti eklendi`);
