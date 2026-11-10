/**
 * SETRA — CLAUDE İÇİN: CANAVAR (MONSTER) DOSYASI
 * ---------------------------------------------------------------
 * Bu dosyayı Claude'a ver ve "buna göre yeni canavar ekle" de.
 * Amaç: canavar sistemini TEK küçük dosyada anlatmak.
 *
 * MİMARİ
 *  - Sunucu: Node.js + Socket.io. Canavar verisi content.js'te.
 *  - İstemci: public/js/travelEngine.js canavarı ÇİZER; çizim fonksiyonunu
 *    monster verisindeki "painter" alanı seçer.
 *  - Veri: content.js <-> data/*.json (extract_content.js / build_content.js).
 *
 * ÜÇ AYRI CANAVAR TÜRÜ VAR — hangisi istendiğini sor:
 *   1) TUR BAZLI  -> content.js -> monsters[]        (68 kayıt)
 *   2) BOSS       -> content.js -> bosses[]          (5 kayıt)
 *   3) SEFER/ARPG -> content.js -> travelBiomes[biyom].monsters[]
 */

// =====================================================================
// 1) TUR BAZLI CANAVAR  ->  content.js -> monsters[]
// =====================================================================
const TURN_MONSTER = {
  id: "slime",
  name: "Slime",
  hp: 40,
  attack: 10,
  speed: 4,
  rarity: "common",              // common | rare | epic | legendary | mythic
  element: "physical",
  image: "/images/monsters/slime.webp",
  resistance: 4,
  tags: ["slime"],               // beast|undead|humanoid|elemental|construct|dragon|demon|plant|slime|spirit
};

// =====================================================================
// 2) BOSS  ->  content.js -> bosses[]
// =====================================================================
const BOSS = {
  id: "boss_ember_king",
  label: "Ember King",
  name: "Ember King",
  image: "/images/bosses/ember_king.png",
  hp: 9000,
  attack: 460,
  speed: 6,
  element: "fire",
  rarity: "mythic",
  weaponId: "boss_weapon_ember",  // loot: content.js items[] içinde olmalı
  chestId: "boss_chest_ember",
  unlockAfter: null,              // başka boss id'si veya null
  resistance: 20,
  phases: 3,
  phaseSkills: {                  // değerler skills[].id olmalı
    "1": ["boss_ember_skill1", "boss_ember_skill2"],
    "2": ["boss_ember_skill3", "boss_ember_skill4", "boss_ember_skill5"],
    "3": ["boss_ember_skill2", "boss_ember_skill5", "boss_ember_skill6"],
  },
  tags: ["elemental"],
};

// =====================================================================
// 3) SEFER (ARPG) CANAVARI  ->  travelBiomes[biyom].monsters[]
// =====================================================================
// Biyomlar: verdant, ashen, frost, swamp, cursed
// "painter" = public/js/travelEngine.js (veya monster_expansion.js) çizim fonksiyonu.
const TRAVEL_MONSTER = {
  kind: "thorn_goblin",           // benzersiz kimlik (tüm biyomlarda)
  name: "Thornback Skirmisher",
  painter: "goblin",              // ÇİZİM — aşağıdaki listeye bak
  element: "nature",
  weight: 26,                     // spawn seçim ağırlığı
  elite: false,
  hp: 267,
  damage: 39,
  speed: 138,                     // piksel/sn
  radius: 16,                     // gövde yarıçapı (çarpışma)
  aggroRange: 290,
  attackCooldown: 1.5,
  exp: 48,
  gold: 8,
  color: "#6aa84f",
  accent: "#d9f99d",
  attackKind: "medium",           // light | medium | heavy | ultimate
  attackDefense: "parryable",     // parryable | dodge
  attackTelegraph: 0.38,          // vuruş öncesi uyarı süresi (sn)
  guardPressure: 18,              // bloğu kırma baskısı
  tags: ["humanoid", "plant"],
  // OPSİYONEL: role, ability ("nova" | "ranged"), status
  skills: [
    { id: "lunge", kind: "dash", cd: 6.5, range: 250, windup: 0.55,
      dist: 130, power: 1.15, radius: 34,
      defense: "dodge", attackKind: "heavy", guardPressure: 25 },
  ],
};

// Sefer yetenek alanları: id, kind, cd, range, windup, dist, power, radius,
//   defense, attackKind, guardPressure, status, count, spread
// kind örnekleri: dash, slam, nova, arc, ground, meteor, vortex, orbit,
//   chain, beam, projectile, fan, barrage, volley, heal, shield, teleport, quake

// DURUM (status) örnekleri:
//   { type:"slow", duration:2, slow:0.5 }
//   { type:"poison", duration:3, dps:10, chance:0.5 }
//   { type:"burn", duration:2.5, dps:9, chance:0.4 }
//   "root"

// =====================================================================
// 4) MEVCUT PAINTER'LAR (çizim fonksiyonları)
// =====================================================================
// travelEngine.js (8 temel):
//   goblin, treant, wraith, beast, spider, golem, knight, archer
// monster_expansion.js (17 detaylı — public/index.html'de yüklü):
//   sporeling, briarHound, myceliumOracle, scoriaCrawler, furnaceHound,
//   pyrewingMatriarch, rimeToad, borealStag, whiteoutSiren, borealDevourer,
//   mireling, corpseLantern, drownedMatron, graveMoth, chainboundPenitent,
//   carrionAbomination, bellRinger
//
// YENİ ÇİZİM GEREKİYORSA (3 adım):
//   1. public/js/monster_expansion.js -> detailed("<kind>", ...) içine çizim ekle.
//   2. Aynı dosyanın sonundaki Object.assign(painters, {...}) bloğuna
//      yeniPainter: (...a) => detailed("<kind>", ...a) satırını ekle.
//   3. public/js/travelEngine.js -> EXP_PAINTER_EXTENT tablosuna
//      yeniPainter: { w: 20, h: 34 } (yaklaşık yarı-genişlik/yükseklik) ekle.
//   Çizim daima izometrik zemine oturur: gölge elips, gövde ayakta,
//   yön için sadece sağa/sola flip (ctx.rotate ile gövde çevirme YOK).

// =====================================================================
// 5) DENGE TABLOSU (mevcut veriden — aynı biyomda bu aralıkta kal)
// =====================================================================
// verdant : hp 115-638, damage 17-71, exp 18-106, gold 3-18
// ashen   : hp 240-980, damage 40-105, exp 55-180, gold 10-28
// frost   : hp 260-1150, damage 45-120, exp 60-210, gold 12-32
// swamp   : hp 220-900, damage 38-95, exp 50-160, gold 9-26
// cursed  : hp 300-3900 (elite), damage 50-140, exp 65-720, gold 15-155
// elite=true canavarlar: hp ×2.5, exp ×3, gold ×3, weight 1-4.

// =====================================================================
// 6) EKLEME ADIMLARI
// =====================================================================
/*
  1. Doğru dosyayı düzenle:
     - Tur bazlı  -> data/monsters.json
     - Boss       -> data/bosses.json
     - Sefer      -> data/travelBiomes.json (ilgili biyomun monsters dizisi)
  2. node build_content.js          (data -> content.js)
  3. Görsel:
     - Tur bazlı: /images/monsters/<id>.webp
     - Boss:      /images/bosses/<id>.png
     - Sefer:     görsel YOK, painter çizer (renk: color/accent).
  4. Doğrulama:
     node --check public/js/monster_expansion.js
     node --check public/js/travelEngine.js
  5. KURALLAR:
     - kind/id tüm biyomlarda benzersiz olmalı.
     - painter sadece yukarıdaki listeden; uydurma painter sessiz hata verir.
     - Boss phaseSkills yalnızca var olan skills[].id kullanabilir.
     - Var olmayan resim yolu yazma; oyun boş gösterir.
*/

module.exports = { TURN_MONSTER, BOSS, TRAVEL_MONSTER };
