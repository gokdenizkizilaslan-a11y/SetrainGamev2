/**
 * SETRA — CLAUDE İÇİN: YETENEK (SKILL) DOSYASI
 * ---------------------------------------------------------------
 * Bu dosyayı Claude'a ver ve "buna göre yeni yetenek ekle" de.
 * Amaç: oyunun yetenek mantığını TEK küçük dosyada anlatmak.
 * Gerçek veri: content.js (data/*.json aynası).
 *
 * MİMARİ
 *  - Sunucu: Node.js + Socket.io (server/combat.js tur bazlı hasar).
 *  - İstemci: public/ (Canvas + CSS, framework yok).
 *  - Veri: content.js  <->  data/*.json (extract_content.js / build_content.js).
 *  - İki ayrı yetenek sistemi var:
 *      1) TUR BAZLI  -> content.js `skills[]`      (sıra tabanlı savaş)
 *      2) ARPG/SEFER -> content.js `arpgSkills[sinif].q|e|r` + `.pool[]`
 *    İkisini karıştırma; hangisi istendiğini sor.
 */

// =====================================================================
// 1) TUR BAZLI YETENEK  ->  content.js -> skills[]  (121 kayıt)
// =====================================================================
// Hasar formülü (server/combat.js):
//   damage = baseDamage + power × (attack veya magicPower)
//   element -> hedefin resistance değeriyle azaltılır.
const TURN_SKILL = {
  id: "boss_ember_skill1",        // benzersiz, snake_case
  name: "Ember Strike",
  target: "enemy",                // enemy | ally | party | self
  mana: 6,                        // mana maliyeti
  power: 1.6,                     // ölçek çarpanı
  element: "fire",                // elements listesinden (aşağıda)
  effect: "fire_meteor_crash",    // VFX id — public/effects.js kayıt defterinde OLMALI
  image: "/images/skills/boss_ember_skill1.webp",
  description: "Deals 45 + 1.6× magic damage.",
  baseDamage: 45,
  // OPSİYONEL ALANLAR (skills.json'da kullanılanlar):
  // heal, healSelfPct, buffs:[{stat,pct,duration}], duration, cooldown,
  // lifesteal, trueDamage, manaRestorePct, scaling, hitShake, defense,
  // hp, attack, speed, rarity, monster, kind, amount
};

// ELEMENTLER (data/elements.json):
// physical, arcane, shadow, holy, frost, fire, water, earth, nature, lightning, blood, dark

// VFX: effect alanı SADECE mevcut bir id olabilir (data/effects.json, 95 kayıt).
// Örnekler: fire_meteor_crash, flame_pillar_inferno, frost_nova_freeze,
//           chain_lightning_arc, seismic_shockwave_ring, blood_nova, void_rift_tear
// Yeni VFX gerekiyorsa public/effects.js'e kayıt eklenmeli — yoksa görsel çıkmaz.

// =====================================================================
// 2) ARPG / SEFER YETENEĞİ  ->  content.js -> arpgSkills[sinif]
// =====================================================================
// Her sınıf: { atkSpd, auto, q, e, r, pool[] }
// Hasar formülü (public/js/travelEngine.js -> skillDamage):
//   bonus  = attack + (magic ? magicPower*0.8 : magicPower*0.25)
//   damage = round(bonus * power)
// CD saniye, cost mana. `visual` alanı çizim efektini seçer (boş bırakılabilir).
const ARPG_SKILL = {
  id: "whirlwind",
  name: "Whirlwind",
  visual: "Whirlwind",
  element: "physical",
  kind: "arc",                    // arc | nova | orbit | vortex | meteor | ground |
                                  // beam | shield | heal | quake | aoe | teleport |
                                  // chain | swing
  cd: 4.5,
  power: 1.55,
  radius: 100,
  arc: 1.15,                      // radyan (sadece arc)
  color: "#ffd54f",
  cost: 0,                        // mana
  desc: "A full spinning cut that carves every foe in front of you.",
  trDesc: "Önündeki bütün düşmanları biçen tam turlu bir savuruş.",
  slot: "q",                      // q | e | r | null (pool için)
  defaultSlot: "q",
  // OPSİYONEL: knockback, duration, tick, count, speed, pull, range, magic,
  //            delay, stagger, spreadRadius, status, dot, width, shieldPct,
  //            healPct, pulses, interval, offset, pet, jumps, chainRange, hits
};

// ARPG pool örneği (sınıfın yan yetenekleri):
const ARPG_POOL_SKILL = {
  id: "battlefocus", name: "Battle Focus", visual: "Rune Circle",
  element: "physical", kind: "buff", cd: 18, color: "#ffb74d", cost: 2, slot: null,
  buff: { stat: "attack", pct: 30, duration: 8 },
  desc: "Attack power rises for 8 seconds.",
  trDesc: "8 saniye boyunca saldırı gücün yükselir.",
};

// =====================================================================
// 3) EKLEME ADIMLARI
// =====================================================================
/*
  A) TUR BAZLI YETENEK:
     1. data/skills.json dizisine yeni kayıt ekle (id benzersiz).
     2. node build_content.js
     3. Sınıfa/monstera vermek için content.js -> classes[].startingSkills
        veya bosses[].phaseSkills listesine id'yi yaz; sonra
        node extract_content.js (content -> data senkronu için).

  B) ARPG YETENEĞİ:
     1. data/arpgSkills.json -> sinif.q / .e / .r veya .pool[] içine ekle.
     2. node build_content.js
     3. Görsel istiyorsan public/images/skills/<id>.webp koy.
     4. skillSkins (data/skillSkins.json) atölye kaplamaları içindir; zorunlu değil.

  C) KURALLAR:
     - id çakışması yasak (tüm skills + arpgSkills içinde tekil olsun).
     - effect/visual uydurma; var olan id kullan veya effects.js'e ekle.
     - Denge: tur bazlı power 0.8–2.5, baseDamage 10–90, mana 2–20.
       ARPG power 0.8–2.6, cd 4–20, cost 0–8.
     - Türkçe açıklama istiyorsan trDesc + i18n anahtarı ekle.
     - Ses: skill üstüne dosya yolu yazma; data/sfx.json tablosu kullanılır.

  D) DOĞRULAMA:
     node build_content.js
     node --check server/combat.js
     node --check public/js/travelEngine.js
*/

module.exports = { TURN_SKILL, ARPG_SKILL, ARPG_POOL_SKILL };
