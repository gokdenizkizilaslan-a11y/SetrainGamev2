/**
 * ============================================================================
 * İZOMETRİK ARPG SEYAHAT MOTORU  —  GÖRSEL YENİLEME SÜRÜMÜ
 * ============================================================================
 * Saf HTML5 Canvas 2D + Vanilla JS. Harici kütüphane / görsel / ses dosyası YOK.
 *
 * MEKANİKLER, KONTROLLER VE DIŞ API DEĞİŞMEDİ:
 *   new TravelEngine(canvas, { player, zoneName, onBackToTown, onInteract, onStatsChange })
 *   engine.setPlayerClass(c) / engine.updateStats(s) / engine.destroy()
 *   WASD/Ok = yürü · Fare = nişan · Space = dash · Sol tık = saldırı · Q/E/R = yetenek
 *
 * GÖRSEL YENİLİKLER:
 *  - Karolar önbelleğe alınmış sprite'lar: gradyanlı üst yüzey, katmanlı toprak yan yüzü,
 *    çim saçağı, çim püskülleri, çiçekler, çakıl, kaya fasetleri, ada kenarında kararma
 *  - Katmanlı çam ağaçları (aydınlık/gölgeli yarılar), kayalar, fenerler, mantarlar,
 *    parlayan seyahat taşı (süzülen kristaller + [E] ipucu)
 *  - Oyuncu: yürüme animasyonu, sınıfa özgü kıyafet/başlık, hareketle dalgalanan pelerin,
 *    FARE YÖNÜNE DÖNEN silah (kılıç / yay / asa / hançer / totem), saldırı savurma animasyonu
 *  - Canavarlar: Goblin (sivri kulak, kırmızı parlayan göz, sopa), Treant, Gölge Avcısı;
 *    vuruşta tüm silüet beyaz parlar, ölüm animasyonu, "hayalet" can barı
 *  - 'lighter' ile neon efektler: kılıç dalgaları, mermi izleri, AoE halkaları, ışık sütunu,
 *    çatlaklar, sarmaşıklar, vuruş patlamaları, kıvılcımlar
 *  - Dünya ışıkları, yer sisi, ateş böcekleri, düşen yapraklar, yıldızlı arka plan
 *
 * SINIF GÖRÜNÜMLERİ: 37 sınıfın her biri için ayrı kıyafet/başlık/silah/aura/animasyon
 *   (CLASS_STYLES tablosu). Mekanik arketip (MELEE/RANGED/MAGE/SHADOW/TAMER) CLASS_MAP'ten gelir.
 *
 * DÜZELTMELER (hitbox hâlâ 2D kartezyen düzlemde, hiç kaymaz):
 *  - Silah / kılıç yayı / AoE halkaları artık İZOMETRİK izdüşümle çiziliyor, yani ekranda
 *    gördüğün alan = gerçek hitbox alanı.
 *  - Fare dünya koordinatı her karede yeniden hesaplanıyor (kamera kayarken nişan kaymaz).
 *  - Hasar sayıları ekranda dikey yükseliyor. destroy() artık tüm dinleyicileri temizliyor.
 * ============================================================================
 */

(function (global) {
  'use strict';

  // ==========================================================================
  // MATEMATİK & İZOMETRİK DÖNÜŞÜM
  // ==========================================================================
  const ISO_ANGLE = Math.PI / 6;
  const COS_30 = Math.cos(ISO_ANGLE);
  const SIN_30 = Math.sin(ISO_ANGLE);
  // Dünyadaki r yarıçaplı bir daire, izometrik ekranda (r*ISO_RX) x (r*ISO_RY) elips olur
  const ISO_RX = Math.SQRT2 * COS_30;
  const ISO_RY = Math.SQRT2 * SIN_30;
  const TAU = Math.PI * 2;

  // ==========================================================================
  // SAVAŞ DENGESİ — Deepwoken esintili savunma sistemi
  // Bütün süre / maliyet / ceza değerleri tek yerde; `engine.combatCfg` ile
  // canlı olarak da değiştirilebilir (menü, test, editör).
  // ==========================================================================
  const COMBAT_CFG = {
    parry: {
      startup: 0.08,        // kısa hazırlık -> parry duruşu
      window: 0.20,         // kusursuz parry penceresi
      whiffRecovery: 0.75,  // kaçırılan parry cezası
      successRecovery: 0,   // başarılı parry cezası YOK (zincir parry)
      counterWindow: 0.55,  // parry sonrası karşı atak fırsatı
    },
    guard: {
      max: 100,
      decayDelay: 1.35,     // baskı kesildikten sonra bekleme
      decayRate: 24,        // saniyede azalma
      breakDuration: 1.5,   // guardbreak savunmasızlığı
      breakSlow: 0.4,       // guardbreak sırasında hız çarpanı
      fadeDelay: 2.6,       // HUD çubuğu ne kadar görünür kalır
    },
    stamina: { max: 100, sprintDrain: 12, dashCost: 20, regen: 20, regenDelay: 1.0 },
    dash: { duration: 0.22, cooldown: 1.05, speed: 680, iframes: 0.15, staminaCost: 20 },
    sprint: { mult: 1.4 },
    telegraph: { light: 0.20, normal: 0.35, heavy: 0.65, skill: 0.7 },
  };
  // Guard Pressure: saldırı sınıfı başına varsayılan baskı (per-attack override edilebilir).
  const GUARD_PRESSURE = { light: 12, medium: 18, heavy: 25, skill: 35, ultimate: 45, none: 0 };
  // Savunma sınıflandırması.
  const DEFENSE = { PARRYABLE: 'parryable', DODGE: 'dodge', BLOCK: 'block', NONE: 'none' };

  // Yapı/nesne başına VARSAYILAN çarpışma yarıçapı (karo boyunun katı).
  // Dünya Kurucu'da elle `solidRadius` verilmemişse binalar yine de geçilmez
  // olsun → oyuncu evlerin içinden geçemez.
  const DEFAULT_SOLID_RADIUS = {
    // Büyük binalar
    farmhouse: 0.5, stonehouse: 0.52, barn: 0.5, longhouse: 0.5, tavern: 0.55,
    smithy: 0.46, chapel: 0.5, windmill: 0.48, gatehouse: 0.5, roundtower: 0.46,
    watchtower: 0.46, hut: 0.4, stall: 0.38, tent: 0.4, wall: 0.22,
    // Orta/küçük yapılar
    well: 0.3, obelisk: 0.26, pillars: 0.3, banner: 0.16, campfire: 0.26,
    chest: 0.2, cart: 0.32, barrels: 0.24, applecrates: 0.24, haybales: 0.28,
    logs: 0.28, stump: 0.22, bigrock: 0.32, rocks: 0.22, crystals: 0.28,
    graves: 0.24, lamp: 0.12, signpost: 0.12,
    // Geçilmesi GEREKENLER (0 = çarpışmasız)
    bridge: 0, fence: 0, bush: 0, flowers: 0,
    // Ağaçlar
    oak: 0.16, pine: 0.16, birch: 0.16, autumn: 0.16, deadtree: 0.14,
    // Eski (vektör) tip adları
    tree: 0.14, boulder: 0.3, mountain: 0.34, lantern: 0.12, shrine: 0.3, mushroom: 0.2,
  };
  function defaultSolidRadius(model) {
    const v = DEFAULT_SOLID_RADIUS[model];
    return Number.isFinite(v) ? v : 0;
  }

  // 17'lik canavar paketinin yaklaşık çizim yarı-genişliği / yüksekliği
  // (piksel, ölçek 1 iken). drawMonster bunlara göre 200x200 tuvale sığdırır.
  const EXP_PAINTER_EXTENT = {
    sporeling: { w: 18, h: 37 },
    briarHound: { w: 29, h: 30 },
    myceliumOracle: { w: 31, h: 53 },
    scoriaCrawler: { w: 18, h: 21 },
    furnaceHound: { w: 30, h: 35 },
    pyrewingMatriarch: { w: 48, h: 44 },
    rimeToad: { w: 24, h: 21 },
    borealStag: { w: 34, h: 49 },
    whiteoutSiren: { w: 36, h: 43 },
    borealDevourer: { w: 60, h: 37 },
    mireling: { w: 13, h: 24 },
    corpseLantern: { w: 21, h: 53 },
    drownedMatron: { w: 32, h: 55 },
    graveMoth: { w: 30, h: 38 },
    chainboundPenitent: { w: 20, h: 39 },
    carrionAbomination: { w: 34, h: 42 },
    bellRinger: { w: 45, h: 61 },
  };
  const MINIMAP_PALETTES = {
    verdant: { water: '#12303a', ground: '#3f7a32', path: '#b39a5d', tree: '#1e4620', rock: '#5d6a5f', rock2: '#77837a', accent: '#8ef0a0', ring: '#9ccc65' },
    ashen:   { water: '#1d1a20', ground: '#6b4a34', path: '#8a6b46', tree: '#4a3325', rock: '#3f3a38', rock2: '#575049', accent: '#ff8a50', ring: '#ff8a50' },
    frost:   { water: '#123044', ground: '#dfeef6', path: '#b9cdd8', tree: '#7fa8b8', rock: '#8798a5', rock2: '#a9bcc7', accent: '#b9f4ff', ring: '#8ceaff' },
    swamp:   { water: '#15231c', ground: '#41543a', path: '#5d5238', tree: '#243a24', rock: '#4a4a3f', rock2: '#5f5f52', accent: '#8dff9b', ring: '#9dff53' },
    cursed:  { water: '#161020', ground: '#3a2c45', path: '#5a4a5f', tree: '#241b30', rock: '#332a3c', rock2: '#4a3f57', accent: '#c084fc', ring: '#a855f7' },
  };

  // --------------------------------------------------------------------------
  // TravelSkills (public/js/travelSkills.js) — sınıf başına Q/E/R davranışları.
  // Modül yüklendiğinde `TravelEngine.registerClassSkills(slug, {q,e,r})` çağırır;
  // kayıt modül seviyesinde tutulur (her `new TravelEngine` sıfırlamaz).
  // --------------------------------------------------------------------------
  const TS_HANDLERS = {};
  function registerClassSkills(name, handlers) {
    if (!name || !handlers) return;
    TS_HANDLERS[String(name)] = handlers;
  }
  function tsHandlersFor(slug) {
    if (!slug) return null;
    return TS_HANDLERS[slug] || TS_HANDLERS[String(slug).toLowerCase()] || null;
  }

  function worldToScreen(wx, wy, wz = 0, camera) {
    return { x: (wx - wy) * COS_30 + camera.x, y: (wx + wy) * SIN_30 - wz + camera.y };
  }

  function screenToWorld(sx, sy, camera) {
    const adjX = sx - camera.x;
    const adjY = sy - camera.y;
    return { x: (adjY / SIN_30 + adjX / COS_30) / 2, y: (adjY / SIN_30 - adjX / COS_30) / 2 };
  }

  // Dünya açısını (radyan) ekran açısına çevirir (silah yönü için)
  function worldAngleToScreen(a) {
    const dx = Math.cos(a), dy = Math.sin(a);
    return Math.atan2((dx + dy) * SIN_30, (dx - dy) * COS_30);
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  // Buff stat etiketleri (hem yüzen yazı hem sol panel için).
  const BUFF_LABEL = {
    attack: "ATK", damage: "DMG", magic: "MGC", magicpower: "MGC",
    heal: "HEAL", healpower: "HEAL", defense: "DEF", resistance: "DEF",
    speed: "SPD", attackspeed: "ATK SPD",
  };

  // ---------------------------------------------------------------------------
  // ELEMENT ETKİLEŞİM TABLOSU
  // Saldıran element -> savunan element/etiket çarpanı.
  //  > 1  : zayıflık (daha çok hasar)      < 1 : direnç (daha az hasar)
  // Hem canavarın `element` alanına hem de `tags` (humanoid/undead/beast/...)
  // alanına bakılır. Eşleşme yoksa 1.0 (nötr) döner.
  const ELEMENT_CHART = {
    physical: { slime: 0.85, construct: 0.9, spirit: 0.9, undead: 0.95 },
    fire: { frost: 1.6, nature: 1.45, plant: 1.4, slime: 1.15, fire: 0.5, water: 0.65, demon: 0.85, dragon: 0.8 },
    frost: { fire: 1.5, nature: 1.25, water: 1.35, frost: 0.5, construct: 0.85, slime: 1.1 },
    lightning: { water: 1.5, frost: 1.15, construct: 1.4, dragon: 1.15, lightning: 0.5, earth: 0.85 },
    nature: { water: 1.3, undead: 1.3, shadow: 1.2, fire: 0.7, plant: 0.5, nature: 0.75, construct: 0.9 },
    earth: { lightning: 1.45, fire: 1.2, construct: 1.15, dragon: 1.1, nature: 0.85, earth: 0.6 },
    holy: { shadow: 1.6, undead: 1.65, demon: 1.5, spirit: 1.35, blood: 1.2, holy: 0.5 },
    shadow: { holy: 1.45, spirit: 1.3, humanoid: 1.15, plant: 1.1, shadow: 0.5, undead: 0.7 },
    arcane: { construct: 1.35, slime: 1.2, dragon: 1.2, spirit: 1.15, arcane: 0.5, demon: 0.9 },
    blood: { humanoid: 1.3, beast: 1.2, demon: 1.15, undead: 0.6, construct: 0.7, blood: 0.5 },
    water: { fire: 1.5, earth: 1.15, construct: 1.15, slime: 1.2, frost: 0.6, water: 0.5 },
    dark: { holy: 1.2, spirit: 1.25, shadow: 1.15, dark: 0.5 },
    poison: { humanoid: 1.15, beast: 1.15, plant: 0.6, undead: 0.5, construct: 0.5 },
  };
  // Oyuncu element rengi (hasar yazısı rengi için).
  const ELEMENT_COLOR = {
    physical: "#ffffff", fire: "#ff8a50", frost: "#8fe4ff", lightning: "#fff176",
    nature: "#9ccc65", earth: "#d4a373", holy: "#ffe082", shadow: "#b388ff",
    arcane: "#e040fb", blood: "#ef5350", water: "#4fc3f7", dark: "#7c4dff", poison: "#aed581",
  };
  const WEAK_TAGS = { slime: 1, construct: 1, spirit: 1, undead: 1, plant: 1, demon: 1, dragon: 1, humanoid: 1, beast: 1, elemental: 1 };

  // Bir canavara karşı element çarpanını hesapla (1.0 = nötr).
  function elementMultFor(attackerElement, monster) {
    if (!monster) return 1;
    const el = String(attackerElement || "physical").toLowerCase();
    const row = ELEMENT_CHART[el];
    if (!row) return 1;
    const targets = [];
    if (monster.element) targets.push(String(monster.element).toLowerCase());
    const tags = Array.isArray(monster.tags) ? monster.tags : [];
    for (const t of tags) targets.push(String(t).toLowerCase());
    // Tür etiketleri de "canavar türü" sayılır (element olarak verilmişse).
    let bestUp = 1, bestDown = 1;
    for (const t of targets) {
      const m = row[t];
      if (!Number.isFinite(m)) continue;
      if (m > bestUp) bestUp = m;
      if (m < bestDown) bestDown = m;
    }
    const total = bestUp * bestDown;
    return clamp(total, 0.4, 2.4);
  }

  function hash2(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  // Yumuşak değer gürültüsü: orman/kaya kümeleri için (sıra sıra dizilimi önler).
  function valueNoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Sınıf dengeleme çarpanı (seyahat/ARPG). 1.0 = nötr.
  // Bruiser'lar (yüksek atk + yüksek hp + yüksek resistance) biraz kısılır,
  // düşük ataklı büyücü/şifacı sınıfları telafi edilir.
  const CLASS_TRAVEL_SCALE = {
    warrior: 0.82, paladin: 0.85, warlord: 0.85, war_emperor: 0.85,
    juggernaut: 0.88, colossus: 0.88, crusader: 0.9, tank: 0.92, lightbringer: 0.9,
    mage: 1.45, archmage: 1.45, support: 1.5, high_priest: 1.5,
    lifeweaver: 1.45, divine_saint: 1.45, gardener: 1.35, rootbinder: 1.15,
    gloomspawn: 1.25, sanguine_lord: 1.2, moderator: 1, ultra_moderator: 1,
    ranger: 1.05, warden: 1.05, storm_warden: 1.05, beastmaster: 1.1, tamer: 1.1,
    rogue: 0.95, assassin: 0.95, nightblade: 0.95, reaper: 0.95,
    death_lord: 0.95, bloodspawn: 0.95, bloodlord: 0.95, shade_king: 0.95,
  };
  function classTravelScale(slug) {
    const v = CLASS_TRAVEL_SCALE[String(slug || "").toLowerCase()];
    return Number.isFinite(v) ? v : 1;
  }

  // ---- Renk yardımcıları ----
  const _rgbCache = {};
  function hexToRgb(hex) {
    let c = _rgbCache[hex];
    if (c) return c;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h, 16);
    c = { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    _rgbCache[hex] = c;
    return c;
  }
  function rgba(hex, a) {
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
  // amt>0: beyaza, amt<0: siyaha doğru karıştırır (CSS rgb() döndürür; rgba()/glow'a verme)
  function shade(hex, amt) {
    const c = hexToRgb(hex);
    const t = Math.abs(amt), tr = amt > 0 ? 255 : 0;
    return `rgb(${Math.round(lerp(c.r, tr, t))},${Math.round(lerp(c.g, tr, t))},${Math.round(lerp(c.b, tr, t))})`;
  }

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---- Parlama (glow) sprite önbelleği: shadowBlur yerine çok daha hızlı ----
  const glowCache = {};
  function getGlow(color) {
    if (glowCache[color]) return glowCache[color];
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const k = hexToRgb(color);
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${k.r},${k.g},${k.b},1)`);
    grad.addColorStop(0.35, `rgba(${k.r},${k.g},${k.b},0.45)`);
    grad.addColorStop(1, `rgba(${k.r},${k.g},${k.b},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    glowCache[color] = c;
    return c;
  }
  function drawGlow(ctx, x, y, radius, color, alpha = 1) {
    const pa = ctx.globalAlpha;
    ctx.globalAlpha = pa * alpha;
    ctx.drawImage(getGlow(color), x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = pa;
  }
  function drawGlowEllipse(ctx, x, y, rx, ry, color, alpha = 1) {
    const pa = ctx.globalAlpha;
    ctx.globalAlpha = pa * alpha;
    ctx.drawImage(getGlow(color), x - rx, y - ry, rx * 2, ry * 2);
    ctx.globalAlpha = pa;
  }

  // ==========================================================================
  // SES (Web Audio, harici dosya yok) — davranış aynı
  // ==========================================================================
  const SFX = {
    slash: { w: 'triangle', f0: 450, f1: 120, fd: 0.12, g: 0.18, gd: 0.12 },
    shoot: { w: 'sine', f0: 800, f1: 250, fd: 0.15, g: 0.15, gd: 0.15 },
    hit: { w: 'sawtooth', f0: 180, f1: 60, fd: 0.1, g: 0.25, gd: 0.1 },
    crit: { w: 'square', f0: 500, f1: 900, fd: 0.08, g: 0.2, gd: 0.2 },
    dash: { w: 'sine', f0: 220, f1: 440, fd: 0.18, g: 0.15, gd: 0.18 },
    kill: { w: 'triangle', f0: 300, f1: 80, fd: 0.25, g: 0.25, gd: 0.25 },
    // --- Savunma sistemi sesleri (dosya yoksa synth'e düşer) ---
    parry: { w: 'square', f0: 950, f1: 1700, fd: 0.06, g: 0.2, gd: 0.2 },
    guard: { w: 'triangle', f0: 320, f1: 140, fd: 0.09, g: 0.16, gd: 0.12 },
    guardbreak: { w: 'sawtooth', f0: 240, f1: 55, fd: 0.42, g: 0.3, gd: 0.42 },
    dodge: { w: 'sine', f0: 520, f1: 980, fd: 0.07, g: 0.1, gd: 0.1 }
  };

  // Ses anahtarı -> dosya id adayları (public/sounds/<id>.mp3). İlk bulunan çalar.
  // Yeni ses ekledikçe buraya id yazın veya `engine.sound.assign('slash', [...])` ile atayın.
  const SOUND_IDS = {
    // Vuruş/savurma: kılıç, ağır silah, balta, hançer karışık havuz.
    slash: ['slashfast1', 'slashfast2', 'slashfast3', 'slashfast4', 'sword1', 'sword2', 'sword3', 'greatswordslash'],
    // Atış: yay sesi + ok/ hançer fırlatma varyantları.
    shoot: ['bowshot', 'bowability', 'bowresonant', 'arrowvolley', 'daggerthrow'],
    // ÇARPMA anı: mermi ya da kılıç bir hedefe değdiğinde.
    hit: ['bladehit', 'axehit', 'hitgeneric', 'hitarcane'],
    hit_physical: ['bladehit', 'axehit', 'hitgeneric'],
    hit_ranged: ['bowhit', 'hitgeneric'],
    hit_magic: ['hitarcane', 'bladesclash2'],
    crit: ['heavyswordhit', 'holyhammer', 'greatswordspin'],
    dash: ['shadowstep'],
    kill: ['bonesrattle', 'undeadmoan', 'slimesquelch', 'monsterroar'],
    parry: ['bladesclash2', 'sword3'],
    guard: ['axehit', 'bladehit'],
    guardbreak: ['greatswordspin'],
    dodge: [],
    ultimate: ['ultsound', 'greatswordspin', 'holyascension'],
    levelup: ['levelup'],
    boss: ['bossintro', 'dragonroar', 'terrifyingroar'],
    revive: ['revivesound', 'neutralascend2', 'travel_revive'],
    downed: ['losingsound', 'travel_player_death'],
    loot: ['lootsound', 'coinsound', 'travel_loot_drop'],
    footstep: ['footsteps'],
    // Gündüz/gece ambiyansı bilinçli olarak BOŞ: arpg'de kendiliğinden ortam
    // sesi çalmaz (haritadan çıkınca da hiçbir döngü kalmaz).
    ambience_day: [],
    ambience_night: [],
    ambience_rain: ['travel_ambience_rain', 'rain_loop'],
    ambience_storm: ['travel_ambience_storm', 'waterburst'],
  };

  class SoundFX {
    constructor() {
      this.ctx = null; this.enabled = true; this.vol = 0.85;
      this.map = Object.assign({}, SOUND_IDS);
      this.slug = null;
      this.loopEl = null; this.loopId = null;
      this._ambienceStarted = false;
    }
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    // Gelecekteki sınıfa özel skill dosyaları için (travel_<slug>_q/e/r).
    setClass(slug) { this.slug = String(slug || '').toLowerCase(); }
    // Kullanıcı/ayar tarafından ses atama: engine.sound.assign('slash', ['slash2']).
    assign(type, ids) { this.map[type] = Array.isArray(ids) ? ids : [ids]; }
    // Genel ses seviyesi (0-1). Editörden ayarlanır.
    setMaster(v) {
      const n = Number(v);
      if (Number.isFinite(n)) this.vol = Math.max(0, Math.min(1, n));
      if (this.loopEl) { try { this.loopEl.volume = Math.max(0, Math.min(1, (this._loopBase != null ? this._loopBase : 0.3) * this.vol)); } catch (e) {} }
    }
    _file(ids) {
      try {
        if (typeof soundMap === 'undefined' || !soundMap || !ids || !ids.length) return null;
        const hits = ids.filter((id) => soundMap.has(id));
        return hits.length ? hits[Math.floor(Math.random() * hits.length)] : null;
      } catch (e) { return null; }
    }
    play(type, vol) {
      if (!this.enabled) return;
      // Çarpma sesleri spam olmasın: aynı anda birden fazla isabet gelse de
      // 55 ms içinde tek "hit" çalar (yetenek + hasar kodu üst üste binmesin).
      if (String(type).indexOf('hit') === 0) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (now - (this._lastHitAt || 0) < 55) return;
        this._lastHitAt = now;
      }
      this.init();
      // NOT: Arpg'de kendiliğinden ambiyans döngüsü YOK. Ses sadece yukarıdaki
      // olaylar (vuruş, atış, yetenek...) ile çalar; haritadan çıkınca susar.
      const ids = this.map[type];
      if (ids && ids.length) {
        const id = this._file(ids);
        if (id && typeof window !== 'undefined' && typeof window.sfxPlay === 'function') {
          window.sfxPlay([id], vol == null ? this.vol : vol * (this.vol == null ? 1 : this.vol));
          return;
        }
      }
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        if (type === 'ultimate') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.linearRampToValueAtTime(320, t + 0.3);
          osc.frequency.exponentialRampToValueAtTime(50, t + 0.6);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
          osc.start(t); osc.stop(t + 0.7);
          return;
        }
        const s = SFX[type];
        if (!s) return;
        osc.type = s.w;
        osc.frequency.setValueAtTime(s.f0, t);
        osc.frequency.exponentialRampToValueAtTime(s.f1, t + s.fd);
        gain.gain.setValueAtTime(s.g, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + s.gd);
        osc.start(t); osc.stop(t + s.gd + 0.01);
      } catch (e) { /* ses hatası yoksay */ }
    }
    // Ambiyans / yağmur gibi kesintisiz döngüler.
    loop(type, volume) {
      if (!this.enabled) return;
      const ids = this.map[type];
      if (!ids) return;
      const id = this._file(ids);
      if (!id) return; // dosya yoksa sessizce atla
      const base = volume == null ? 0.32 : volume;
      this._loopBase = base;
      if (this.loopId === id && this.loopEl && !this.loopEl.paused) {
        try { this.loopEl.volume = Math.max(0, Math.min(1, base * this.vol)); } catch (e) {}
        return;
      }
      this.stopLoop();
      try {
        const src = (typeof soundMap !== 'undefined' && soundMap && soundMap.get) ? soundMap.get(id) : null;
        if (!src) return;
        const a = new Audio(src);
        a.loop = true;
        a.volume = Math.max(0, Math.min(1, base * this.vol));
        a.play().catch(() => {});
        this.loopEl = a; this.loopId = id;
      } catch (e) { /* döngü hatası yoksay */ }
    }
    stopLoop() {
      if (this.loopEl) { try { this.loopEl.pause(); } catch (e) {} }
      this.loopEl = null; this.loopId = null;
    }
  }

  // ==========================================================================
  // SINIF HARİTASI (5 arketip = mekanik) + SINIF STİLLERİ (görünüm)
  // ==========================================================================
  const ARCHETYPES = { MELEE: 'MELEE', RANGED: 'RANGED', MAGE: 'MAGE', SHADOW: 'SHADOW', TAMER: 'TAMER' };

  // "War Lord", "war_lord", "WarLord" -> "warlord"
  const normKey = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');

  const CLASS_MAP = {};
  [
    [ARCHETYPES.MELEE, ['warrior', 'paladin', 'tank', 'colossus', 'juggernaut', 'knight', 'barbarian', 'berserker', 'guardian', 'crusader', 'gladiator', 'warmaster', 'sentinel', 'warlord', 'waremperor', 'lightbringer', 'tester']],
    [ARCHETYPES.RANGED, ['archer', 'warden', 'stormwarden', 'rootbinder', 'gardener', 'hunter', 'ranger', 'sniper', 'bowmaster', 'marksman']],
    [ARCHETYPES.MAGE, ['mage', 'archmage', 'archon', 'healer', 'support', 'highpriest', 'divinesaint', 'lifeweaver', 'moderator', 'ultramoderator', 'elementalist', 'sorcerer', 'pyromancer', 'chronomancer', 'wizard', 'cleric']],
    [ARCHETYPES.SHADOW, ['rogue', 'assassin', 'nightblade', 'reaper', 'shadeking', 'deathlord', 'bloodspawn', 'bloodlord', 'gloomspawn', 'sanguinelord', 'ninja', 'shadowblade', 'bloodknight']],
    [ARCHETYPES.TAMER, ['tamer', 'beastmaster', 'alphatamer', 'animalorde', 'druid', 'summoner']]
  ].forEach(([arch, names]) => names.forEach((n) => { CLASS_MAP[n] = arch; }));

  function getArchetype(className) {
    if (!className) return ARCHETYPES.MELEE;
    return CLASS_MAP[normKey(className)] || ARCHETYPES.MELEE;
  }

  // Arketip varsayılan paletleri (orijinal görünüm)
  const OUTFITS = {
    MELEE: { cape: '#2f7d3a', capeDark: '#1a4a22', trim: '#ffd54f', armor: '#8fa3ad', armorDark: '#52646e', cloth: '#5d4037', accent: '#4fc3f7' },
    RANGED: { cape: '#3f8f3a', capeDark: '#235a22', trim: '#c5e1a5', armor: '#7a5a46', armorDark: '#4a3328', cloth: '#355e2a', accent: '#aed581' },
    MAGE: { cape: '#6a3fc0', capeDark: '#3a1f80', trim: '#ffd54f', armor: '#5a3aa8', armorDark: '#34206e', cloth: '#4527a0', accent: '#ce93d8' },
    SHADOW: { cape: '#23232e', capeDark: '#0e0e14', trim: '#ff4081', armor: '#34343f', armorDark: '#1a1a22', cloth: '#1d1d26', accent: '#ff4081' },
    TAMER: { cape: '#7a5a3a', capeDark: '#46301c', trim: '#ffb74d', armor: '#9b7b5a', armorDark: '#5c452e', cloth: '#5d7a2e', accent: '#ffb74d' }
  };

  // Arketip varsayılan stilleri (Warrior / Archer / Mage / Rogue / Tamer = ilk tasarım)
  const ARCH_BASE = {
    MELEE: { head: 'helm', weapon: 'sword', slash: '#4fc3f7', proj: '#4fc3f7' },
    RANGED: { head: 'hood', hood: '#2e6a2a', hoodTop: '#4f9a3f', hoodInner: '#e0b27a', feather: '#f5f5dc', weapon: 'bow', proj: '#81c784' },
    MAGE: { head: 'wizard', weapon: 'staff', staffHead: 'orb', orb: '#ba68c8', proj: '#ba68c8' },
    SHADOW: { head: 'hood', hood: '#15151c', hoodTop: '#34343f', hoodInner: '#0c0c12', eyeGlow: '#ff4081', weapon: 'daggers', slash: '#e91e63', proj: '#e91e63' },
    TAMER: { head: 'tamer', weapon: 'totem', orb: '#ffb74d', proj: '#ffb74d' }
  };

  // Silah türü -> saldırı animasyonu
  const WEAPON_ATK = {
    sword: 'swing', greatsword: 'swing', axe: 'swing', mace: 'swing', scythe: 'swing', katana: 'slash',
    hammer: 'slam', gavel: 'slam', fist: 'slam', spear: 'thrust', rapier: 'thrust',
    blades: 'slash', daggers: 'slash', claws: 'slash', glitch: 'slash',
    bow: 'shoot', staff: 'cast', totem: 'cast'
  };

  // ---- 37 sınıfın görünümü ----
  // pal: renk paleti · head: başlık · weapon: silah · cape: 'cape'|'tattered'|'none'|'short'
  // body: 'plate'|'robe'|'bare' · emblem · shoulder · offhand · wings · halo · ground (zemin efekti)
  // rise: yükselen parçacıklar · orbit: etrafta dönen nesneler · scale: boyut
  const CLASS_STYLES = {
    // ---------- SAVAŞÇI KOLU ----------
    warrior: {},
    warlord: {
      pal: { cape: '#7a1414', capeDark: '#3a0707', trim: '#ff8f00', armor: '#4a4a55', armorDark: '#23232b', cloth: '#2a1a1a', accent: '#ff5722' },
      head: 'horned', helmA: '#5a5a66', helmB: '#26262e', hornCol: '#e8dcc0', eyeGlow: '#ff3d00', weapon: 'axe',
      cape: 'tattered', emblem: 'skull', shoulder: 'spiked', scale: 1.08, slash: '#ff5722', proj: '#ff5722',
      rise: { kind: 'ember', col: '#ff7043', col2: '#ffab00', n: 5, spread: 14, h: 40, size: 2.2, speed: 0.5 }
    },
    waremperor: {
      pal: { cape: '#8e0e0e', capeDark: '#3d0505', trim: '#ffd700', armor: '#2c2c36', armorDark: '#121218', cloth: '#1d1214', accent: '#ffab00' },
      head: 'horned', helmA: '#3a3a46', helmB: '#15151b', hornCol: '#ffd700', crown: true, eyeGlow: '#ffab00', weapon: 'greatsword',
      blade: { a: '#fff3c4', b: '#ff8f00', glow: '#ff6d00', flame: true }, wScale: 1.15,
      cape: 'tattered', emblem: 'star', shoulder: 'spiked', shoulderCol: '#ffd700', scale: 1.14, slash: '#ffab00', proj: '#ffab00',
      ground: { kind: 'ring', col: '#ff6d00' },
      rise: { kind: 'ember', col: '#ff6d00', col2: '#ffd54f', n: 9, spread: 16, h: 52, size: 2.6, speed: 0.6 }
    },
    paladin: {
      pal: { cape: '#e8e8f0', capeDark: '#a8a8bc', trim: '#ffca28', armor: '#dfe6ea', armorDark: '#8a98a2', cloth: '#6d5a3a', accent: '#fff59d' },
      head: 'winghelm', helmA: '#f2f5f7', helmB: '#9aa8b2', weapon: 'mace', mace: { head: '#ffd54f', glow: '#fff59d' },
      offhand: 'round', emblem: 'cross', shoulder: 'pauldron', shoulderCol: '#ffca28', slash: '#fff59d', proj: '#fff59d',
      rise: { kind: 'mote', col: '#fff59d', n: 4, spread: 12, h: 38, size: 1.8, speed: 0.35 }
    },
    crusader: {
      pal: { cape: '#b71c1c', capeDark: '#6a0f0f', trim: '#ffd54f', armor: '#cfd8dc', armorDark: '#78909c', cloth: '#4e342e', accent: '#ffe082' },
      head: 'greathelm', helmA: '#e0e6ea', helmB: '#78909c', plume: '#b71c1c', eyeGlow: '#ffe082', weapon: 'greatsword',
      blade: { a: '#ffffff', b: '#b0bec5', glow: '#ffe082' }, offhand: 'kite', emblem: 'cross', emblemCol: '#b71c1c',
      shoulder: 'pauldron', shoulderCol: '#ffd54f', scale: 1.05, slash: '#ffe082', proj: '#ffe082',
      ground: { kind: 'ring', col: '#ffe082' }
    },
    lightbringer: {
      pal: { cape: '#fff8e1', capeDark: '#ffe082', trim: '#ffd54f', armor: '#fff3c4', armorDark: '#e0b84a', cloth: '#8d6e3a', accent: '#ffffff' },
      head: 'sunhelm', helmA: '#fffbe6', helmB: '#e0b84a', weapon: 'greatsword',
      blade: { a: '#ffffff', b: '#fff176', glow: '#ffee58', flame: true, light: true }, wScale: 1.1,
      emblem: 'sun', shoulder: 'pauldron', shoulderCol: '#fff59d', halo: { kind: 'sun', col: '#ffee58' }, scale: 1.1,
      slash: '#fff59d', proj: '#fff59d', ground: { kind: 'ring', col: '#fff176' },
      rise: { kind: 'mote', col: '#fff9c4', col2: '#ffee58', n: 8, spread: 16, h: 48, size: 2, speed: 0.45 }
    },
    tank: {
      pal: { cape: '#37474f', capeDark: '#1c272c', trim: '#90caf9', armor: '#607d8b', armorDark: '#2f3f47', cloth: '#37474f', accent: '#64b5f6' },
      head: 'greathelm', helmA: '#78909c', helmB: '#37474f', plume: null, eyeGlow: '#64b5f6', weapon: 'mace', mace: { head: '#78909c', glow: '#64b5f6' },
      offhand: 'tower', emblem: 'diamond', shoulder: 'big', scale: 1.12, cape: 'short', slash: '#64b5f6', proj: '#64b5f6'
    },
    juggernaut: {
      pal: { cape: '#4e342e', capeDark: '#26140f', trim: '#ff9800', armor: '#6d4c41', armorDark: '#33201a', cloth: '#3e2723', accent: '#ff7043' },
      head: 'greathelm', helmA: '#8d6e63', helmB: '#3e2723', plume: null, eyeGlow: '#ff7043', weapon: 'hammer', hammer: { head: '#78909c', glow: '#ff7043', size: 1.25 },
      cape: 'none', emblem: 'none', shoulder: 'spiked', shoulderCol: '#bf8a5a', scale: 1.24, slash: '#ff7043', proj: '#ff7043',
      rise: { kind: 'smoke', col: '#9e9e9e', n: 4, spread: 12, h: 36, size: 3, speed: 0.4 }
    },
    colossus: {
      pal: { cape: '#4a4f55', capeDark: '#23262a', trim: '#4dd0e1', armor: '#7b8188', armorDark: '#3b3f44', cloth: '#555a60', accent: '#00e5ff' },
      head: 'stonehelm', helmA: '#8c939a', helmB: '#454a50', eyeGlow: '#00e5ff', weapon: 'fist', cape: 'none', emblem: 'rune',
      shoulder: 'big', shoulderCol: '#7b8188', scale: 1.4, slash: '#00e5ff', proj: '#00e5ff', skin: '#7b8188',
      ground: { kind: 'ring', col: '#00e5ff' },
      rise: { kind: 'dust', col: '#b0bec5', n: 5, spread: 18, h: 30, size: 2, speed: 0.3 }
    },

    // ---------- OKÇU / DOĞA KOLU ----------
    archer: {},
    warden: {
      pal: { cape: '#2e5a2a', capeDark: '#17331a', trim: '#aed581', armor: '#6d4c41', armorDark: '#3a2820', cloth: '#33541f', accent: '#9ccc65' },
      head: 'hood', hood: '#2a4f26', hoodTop: '#4a7a3a', hoodInner: '#e0b27a', headExtra: 'antlers', feather: null, weapon: 'bow',
      bow: { col: '#5d4037', glow: '#9ccc65', arrow: '#9ccc65', len: 1.15, leaves: true }, emblem: 'leaf', shoulder: 'leaf',
      scale: 1.05, proj: '#9ccc65', rise: { kind: 'leaf', col: '#7cb342', n: 5, spread: 16, h: 40, size: 2.6, speed: 0.3 }
    },
    stormwarden: {
      pal: { cape: '#1e4a6e', capeDark: '#0d2540', trim: '#80deea', armor: '#546e7a', armorDark: '#263238', cloth: '#1c3a52', accent: '#40c4ff' },
      head: 'hood', hood: '#1a3f5c', hoodTop: '#3a7ca8', hoodInner: '#0c1c28', eyeGlow: '#40c4ff', feather: '#e1f5fe', headExtra: 'spark',
      weapon: 'bow', bow: { col: '#37474f', glow: '#40c4ff', arrow: '#80d8ff', len: 1.2, storm: true }, emblem: 'bolt', shoulder: 'big', shoulderCol: '#78909c',
      scale: 1.08, proj: '#40c4ff', ground: { kind: 'ring', col: '#40c4ff' },
      rise: { kind: 'spark', col: '#80d8ff', n: 6, spread: 16, h: 46, size: 2.4, speed: 0.9 }
    },
    rootbinder: {
      pal: { cape: '#4e342e', capeDark: '#2a1c18', trim: '#76ff03', armor: '#6a4a32', armorDark: '#3a281b', cloth: '#2e5a1e', accent: '#76ff03' },
      head: 'rootcrown', weapon: 'bow', bow: { col: '#6d4a2e', glow: '#76ff03', arrow: '#b2ff59', len: 1.0, vine: true }, body: 'plate',
      emblem: 'leaf', shoulder: 'leaf', cape: 'tattered', proj: '#76ff03',
      ground: { kind: 'roots', col: '#76ff03' }, rise: { kind: 'leaf', col: '#8bc34a', n: 6, spread: 16, h: 42, size: 2.6, speed: 0.35 }
    },
    gardener: {
      pal: { cape: '#8bc34a', capeDark: '#558b2f', trim: '#ffeb3b', armor: '#a1887f', armorDark: '#6d4c41', cloth: '#689f38', accent: '#ffeb3b' },
      head: 'strawhat', weapon: 'staff', staffHead: 'sunflower', orb: '#ffeb3b', body: 'plate', emblem: 'leaf', shoulder: 'none',
      cape: 'short', proj: '#ffeb3b', rise: { kind: 'petal', col: '#fff176', n: 4, spread: 14, h: 34, size: 2.2, speed: 0.3 }
    },

    // ---------- BÜYÜCÜ / ŞİFACI KOLU ----------
    mage: {},
    archmage: {
      pal: { cape: '#4a1fa8', capeDark: '#220f60', trim: '#ffd740', armor: '#3a2a8c', armorDark: '#1c1250', cloth: '#2a1a70', accent: '#b388ff' },
      head: 'archhat', weapon: 'staff', staffHead: 'crystal', orb: '#b388ff', body: 'robe', emblem: 'star', shoulder: 'none', scale: 1.08,
      proj: '#b388ff', ground: { kind: 'runes', col: '#b388ff' },
      orbit: { kind: 'orb', n: 3, r: 18, h: 22, col: '#ce93d8', speed: 1.6 },
      rise: { kind: 'mote', col: '#e1bee7', n: 5, spread: 14, h: 46, size: 1.8, speed: 0.4 }
    },
    healer: {
      pal: { cape: '#f5f0e0', capeDark: '#cfc6a8', trim: '#ffd54f', armor: '#f7f3e6', armorDark: '#c9bf9d', cloth: '#a5d6a7', accent: '#69f0ae' },
      head: 'coif', weapon: 'staff', staffHead: 'cross', orb: '#69f0ae', body: 'robe', emblem: 'cross', emblemCol: '#e53935', shoulder: 'none',
      proj: '#69f0ae', rise: { kind: 'mote', col: '#b9f6ca', n: 4, spread: 12, h: 36, size: 1.8, speed: 0.4 }
    },
    highpriest: {
      pal: { cape: '#f8f4e8', capeDark: '#d8c890', trim: '#ffc107', armor: '#fffdf2', armorDark: '#d6c88a', cloth: '#b79a4a', accent: '#ffe57f' },
      head: 'mitre', weapon: 'staff', staffHead: 'sun', orb: '#ffe57f', body: 'robe', emblem: 'cross', shoulder: 'pauldron', shoulderCol: '#ffc107',
      scale: 1.06, proj: '#ffe57f', halo: { kind: 'ring', col: '#ffe57f' }, ground: { kind: 'ring', col: '#ffe57f' },
      orbit: { kind: 'book', n: 1, r: 17, h: 24, col: '#ffe57f', speed: 1.1 }
    },
    divinesaint: {
      pal: { cape: '#ffffff', capeDark: '#f3e5b0', trim: '#ffd54f', armor: '#ffffff', armorDark: '#f0e0a0', cloth: '#f7e9b8', accent: '#fff9c4' },
      head: 'saint', weapon: 'staff', staffHead: 'ankh', orb: '#fff59d', body: 'robe', emblem: 'sun', shoulder: 'none', cape: 'short',
      wings: { kind: 'feather', col: '#ffffff', col2: '#ffe082', glow: '#fff59d', s: 0.85 }, halo: { kind: 'ring', col: '#fff59d' },
      scale: 1.08, proj: '#fff59d', ground: { kind: 'ring', col: '#fff59d' },
      rise: { kind: 'mote', col: '#fffde7', col2: '#ffee58', n: 6, spread: 18, h: 54, size: 1.4, speed: 0.4 }
    },
    lifeweaver: {
      pal: { cape: '#e8f5e9', capeDark: '#a5d6a7', trim: '#ffd54f', armor: '#c8e6c9', armorDark: '#66bb6a', cloth: '#81c784', accent: '#b9f6ca' },
      head: 'leafcrown', weapon: 'staff', staffHead: 'blossom', orb: '#f8bbd0', body: 'robe', emblem: 'leaf', shoulder: 'leaf', cape: 'short',
      halo: { kind: 'leafring', col: '#81c784' }, proj: '#b9f6ca', ground: { kind: 'roots', col: '#69f0ae' },
      orbit: { kind: 'petal', n: 5, r: 17, h: 24, col: '#f8bbd0', speed: 1.3 },
      rise: { kind: 'petal', col: '#f8bbd0', n: 4, spread: 14, h: 40, size: 2.2, speed: 0.3 }
    },
    archon: {
      pal: { cape: '#1565c0', capeDark: '#0a2f66', trim: '#e3f2fd', armor: '#cfd8dc', armorDark: '#607d8b', cloth: '#37474f', accent: '#40c4ff' },
      head: 'archonhelm', helmA: '#eceff1', helmB: '#78909c', eyeGlow: '#40c4ff', weapon: 'staff', staffHead: 'archon', orb: '#40c4ff',
      body: 'plate', emblem: 'star', shoulder: 'pauldron', shoulderCol: '#e3f2fd', cape: 'short',
      wings: { kind: 'blades', col: '#e3f2fd', col2: '#42a5f5', glow: '#40c4ff', s: 0.72 }, halo: { kind: 'arcane', col: '#40c4ff' },
      scale: 1.12, proj: '#40c4ff', ground: { kind: 'runes', col: '#40c4ff' },
      orbit: { kind: 'blade', n: 4, r: 20, h: 26, col: '#80d8ff', speed: 1.2 }
    },
    moderator: {
      pal: { cape: '#1a237e', capeDark: '#0d1240', trim: '#00e5ff', armor: '#283593', armorDark: '#141a4d', cloth: '#1a237e', accent: '#00e5ff' },
      head: 'modcap', weapon: 'gavel', gavel: { head: '#455a64', glow: '#00e5ff', size: 1 }, body: 'plate', emblem: 'shield',
      shoulder: 'round', cape: 'short', proj: '#00e5ff', slash: '#00e5ff',
      orbit: { kind: 'cube', n: 2, r: 16, h: 24, col: '#00e5ff', speed: 1.4 }
    },
    ultramoderator: {
      pal: { cape: '#0d0d1a', capeDark: '#000000', trim: '#ffd740', armor: '#1a1a2e', armorDark: '#0a0a16', cloth: '#16162a', accent: '#ffd740' },
      head: 'ultracrown', weapon: 'gavel', gavel: { head: '#ffd740', glow: '#ffea00', size: 1.35, runes: true }, body: 'plate', emblem: 'shield',
      emblemCol: '#ffd740', shoulder: 'pauldron', shoulderCol: '#ffd740', cape: 'tattered', scale: 1.12,
      wings: { kind: 'blades', col: '#ffe57f', col2: '#ff8f00', glow: '#ffd740', s: 0.62 }, halo: { kind: 'arcane', col: '#ffd740' },
      proj: '#ffd740', slash: '#ffd740', ground: { kind: 'runes', col: '#ffd740' },
      orbit: { kind: 'cube', n: 4, r: 21, h: 26, col: '#ffd740', speed: 1.6 }
    },
    tester: {
      pal: { cape: '#00c853', capeDark: '#00601f', trim: '#ff00e6', armor: '#212121', armorDark: '#0a0a0a', cloth: '#1b1b1b', accent: '#76ff03' },
      head: 'goggles', weapon: 'glitch', body: 'plate', emblem: 'bug', emblemCol: '#76ff03', shoulder: 'round', cape: 'short',
      proj: '#76ff03', slash: '#ff00e6', eyeGlow: '#76ff03',
      rise: { kind: 'glitch', col: '#76ff03', col2: '#ff00e6', n: 8, spread: 16, h: 44, size: 2.6, speed: 0.8 },
      orbit: { kind: 'cube', n: 3, r: 17, h: 22, col: '#76ff03', speed: 1.8 }
    },

    // ---------- GÖLGE KOLU ----------
    rogue: {},
    assassin: {
      pal: { cape: '#2a0f1a', capeDark: '#0e0408', trim: '#ff1744', armor: '#2a2a35', armorDark: '#121218', cloth: '#1a0d12', accent: '#ff1744' },
      head: 'hood', hood: '#1a1015', hoodTop: '#3a1a26', hoodInner: '#0a0508', eyeGlow: '#ff1744', headExtra: 'mask',
      weapon: 'katana', blade: { a: '#f5f5f5', b: '#9e9e9e', glow: '#ff1744' }, cape: 'tattered', emblem: 'none', shoulder: 'none', slash: '#ff1744', proj: '#ff1744'
    },
    nightblade: {
      pal: { cape: '#101a3a', capeDark: '#050914', trim: '#80d8ff', armor: '#1c2a52', armorDark: '#0c1430', cloth: '#0f1a38', accent: '#40c4ff' },
      head: 'hood', hood: '#0f1a3a', hoodTop: '#243a72', hoodInner: '#04070f', eyeGlow: '#40c4ff', headExtra: 'moon',
      weapon: 'blades', blade: { a: '#e1f5fe', b: '#4fc3f7', glow: '#40c4ff', len: 1.15, curved: true }, cape: 'tattered', emblem: 'moon', shoulder: 'none',
      slash: '#40c4ff', proj: '#40c4ff', rise: { kind: 'smoke', col: '#26418f', n: 4, spread: 12, h: 34, size: 3, speed: 0.4 },
      ground: { kind: 'pool', col: '#40c4ff' }
    },
    reaper: {
      pal: { cape: '#16161c', capeDark: '#050507', trim: '#69f0ae', armor: '#202028', armorDark: '#0a0a0e', cloth: '#101014', accent: '#69f0ae' },
      head: 'skullhood', eyeGlow: '#69f0ae', weapon: 'scythe', blade: { a: '#e0f2f1', b: '#78909c', glow: '#69f0ae' }, body: 'robe', cape: 'tattered',
      emblem: 'none', shoulder: 'none', scale: 1.1, slash: '#69f0ae', proj: '#69f0ae', skin: '#e8e4d4', legs: 'fade',
      rise: { kind: 'soul', col: '#69f0ae', n: 5, spread: 16, h: 48, size: 2.4, speed: 0.4 }
    },
    shadeking: {
      pal: { cape: '#1b0f2e', capeDark: '#07030f', trim: '#b388ff', armor: '#241638', armorDark: '#0c0617', cloth: '#12081f', accent: '#b388ff' },
      head: 'shadecrown', eyeGlow: '#d500f9', weapon: 'greatsword', blade: { a: '#d1c4e9', b: '#4a148c', glow: '#aa00ff', flame: true }, wScale: 1.1,
      cape: 'tattered', emblem: 'none', shoulder: 'spiked', shoulderCol: '#4a148c', scale: 1.18, legs: 'fade', skin: '#150a22',
      slash: '#aa00ff', proj: '#aa00ff', ground: { kind: 'pool', col: '#aa00ff' },
      rise: { kind: 'smoke', col: '#4a148c', n: 6, spread: 16, h: 44, size: 3.4, speed: 0.4 },
      orbit: { kind: 'soul', n: 3, r: 20, h: 24, col: '#b388ff', speed: 1.0 }
    },
    deathlord: {
      pal: { cape: '#1e2a1e', capeDark: '#0a110a', trim: '#76ff03', armor: '#b8b8a8', armorDark: '#5a5a4e', cloth: '#262c20', accent: '#76ff03' },
      head: 'bonehelm', helmA: '#e6e6d6', helmB: '#8a8a78', eyeGlow: '#76ff03', weapon: 'greatsword', blade: { a: '#d7e8c8', b: '#4a6a3a', glow: '#76ff03', flame: true, bone: true },
      cape: 'tattered', emblem: 'skull', shoulder: 'spiked', shoulderCol: '#d6d6c4', scale: 1.14, slash: '#76ff03', proj: '#76ff03',
      ground: { kind: 'runes', col: '#76ff03' }, rise: { kind: 'soul', col: '#76ff03', n: 6, spread: 18, h: 50, size: 2.4, speed: 0.45 },
      orbit: { kind: 'soul', n: 3, r: 20, h: 22, col: '#b2ff59', speed: 1.1 }
    },
    bloodspawn: {
      pal: { cape: '#5a0f14', capeDark: '#2a0508', trim: '#ff5252', armor: '#a02828', armorDark: '#5a1010', cloth: '#6a1414', accent: '#ff1744' },
      head: 'spawn', eyeGlow: '#ffeb3b', weapon: 'claws', blade: { a: '#ffcdd2', b: '#c62828', glow: '#ff1744' }, body: 'bare', cape: 'none',
      emblem: 'none', shoulder: 'none', skin: '#b83232', slash: '#ff1744', proj: '#ff1744',
      rise: { kind: 'drop', col: '#d50000', n: 4, spread: 10, h: 30, size: 1.8, speed: 0.5 }
    },
    bloodlord: {
      pal: { cape: '#7a0a14', capeDark: '#2e0308', trim: '#ff5252', armor: '#5a1218', armorDark: '#260609', cloth: '#3a0c10', accent: '#ff1744' },
      head: 'horned', helmA: '#6a1a22', helmB: '#2a0a0e', hornCol: '#c8605a', hornLen: 1.3, eyeGlow: '#ff1744', weapon: 'greatsword',
      blade: { a: '#ffcdd2', b: '#b71c1c', glow: '#ff1744', flame: true }, cape: 'tattered', emblem: 'drop', shoulder: 'spiked', shoulderCol: '#8a1c24',
      scale: 1.14, slash: '#ff1744', proj: '#ff1744', ground: { kind: 'pool', col: '#d50000' },
      rise: { kind: 'drop', col: '#d50000', n: 6, spread: 14, h: 40, size: 2, speed: 0.5 },
      orbit: { kind: 'drop', n: 3, r: 18, h: 24, col: '#ff1744', speed: 1.2 }
    },
    gloomspawn: {
      pal: { cape: '#14252e', capeDark: '#060e12', trim: '#ffea00', armor: '#1d3a46', armorDark: '#0c1c24', cloth: '#102830', accent: '#ffea00' },
      head: 'gloom', eyeGlow: '#ffea00', weapon: 'claws', blade: { a: '#b2dfdb', b: '#1d4a56', glow: '#ffea00', tendril: true }, body: 'bare', cape: 'none',
      emblem: 'none', shoulder: 'none', skin: '#1b3a46', scale: 1.06, slash: '#ffea00', proj: '#ffea00', legs: 'fade',
      rise: { kind: 'smoke', col: '#1d4a56', n: 6, spread: 14, h: 38, size: 3, speed: 0.4 },
      orbit: { kind: 'orb', n: 3, r: 16, h: 22, col: '#ffea00', speed: 1.5 }
    },
    sanguinelord: {
      pal: { cape: '#8e0b1c', capeDark: '#2d0309', trim: '#ffd180', armor: '#1a1018', armorDark: '#0a050a', cloth: '#14080e', accent: '#ff1744' },
      head: 'vamp', eyeGlow: '#ff1744', weapon: 'rapier', blade: { a: '#fce4ec', b: '#ad1457', glow: '#ff1744' }, cape: 'cape', collar: true,
      emblem: 'drop', shoulder: 'none', skin: '#eadada', scale: 1.06, slash: '#ff1744', proj: '#ff1744',
      orbit: { kind: 'bat', n: 3, r: 20, h: 28, col: '#2a0a12', speed: 1.4 },
      rise: { kind: 'drop', col: '#c2185b', n: 3, spread: 10, h: 30, size: 1.6, speed: 0.4 }
    },

    // ---------- EVCİLLEŞTİRİCİ KOLU ----------
    tamer: {},
    beastmaster: {
      pal: { cape: '#6a4a2a', capeDark: '#37250f', trim: '#ffcc80', armor: '#8d6e4a', armorDark: '#4e3a22', cloth: '#4e6a28', accent: '#ffb74d' },
      head: 'wolfskull', weapon: 'spear', blade: { a: '#f5f5dc', b: '#a1887f', glow: '#ffb74d', bone: true }, emblem: 'fang', shoulder: 'fur',
      cape: 'short', scale: 1.06, proj: '#ffb74d', skinMark: '#ffb74d', rise: { kind: 'mote', col: '#ffcc80', n: 3, spread: 12, h: 30, size: 1.6, speed: 0.35 }
    },
    alphatamer: {
      pal: { cape: '#cfd8dc', capeDark: '#78909c', trim: '#ffab00', armor: '#8d7a62', armorDark: '#4a3e30', cloth: '#455a64', accent: '#ffab00' },
      head: 'wolfhead', eyeGlow: '#ffab00', weapon: 'staff', staffHead: 'wolf', orb: '#ffab00', emblem: 'fang', shoulder: 'fur',
      cape: 'short', scale: 1.14, proj: '#ffab00', ground: { kind: 'ring', col: '#ffab00' },
      rise: { kind: 'ember', col: '#ffab00', col2: '#ffe082', n: 6, spread: 16, h: 44, size: 2.2, speed: 0.5 },
      orbit: { kind: 'orb', n: 2, r: 19, h: 22, col: '#ffab00', speed: 1.3 }
    }
  };

  // Sınıf adı -> birleştirilmiş stil (önbellekli)
  const _styleCache = {};
  function getClassStyle(className) {
    const key = normKey(className);
    if (_styleCache[key]) return _styleCache[key];
    const arch = getArchetype(className);
    const base = ARCH_BASE[arch] || ARCH_BASE.MELEE;
    const own = CLASS_STYLES[key] || {};
    const S = Object.assign({ original: Object.keys(own).length === 0, cape: 'cape', body: 'plate', emblem: 'diamond', shoulder: 'round', scale: 1, wScale: 1, arch }, base, own);
    S.pal = Object.assign({}, OUTFITS[arch] || OUTFITS.MELEE, own.pal || {});
    S.atkMode = WEAPON_ATK[S.weapon] || 'swing';
    _styleCache[key] = S;
    return S;
  }

  // ==========================================================================
  // SINIF GÖRSELLERİ İÇİN YARDIMCI ÇİZİMLER (karakter yerel uzayı: ayaklar 0,0 — yukarısı -y)
  // ==========================================================================
  function poly(ctx, p) {
    ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.closePath();
  }
  function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); }
  function glowAdd(ctx, x, y, r, col, a = 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, x, y, r, col, a); ctx.restore();
  }
  function starPath(ctx, x, y, r, n = 5, k = 0.45) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + i * Math.PI / n, rr2 = i % 2 ? r * k : r;
      i ? ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2) : ctx.moveTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
    }
    ctx.closePath();
  }

  // Yükselen / düşen parçacıklar (ateş, yaprak, ruh, kan, glitch...)
  function riseFx(ctx, t, o) {
    ctx.save();
    for (let i = 0; i < o.n; i++) {
      const ph = (t * o.speed + i / o.n + hash2(i, 3) * 0.37) % 1;
      const x = Math.sin(i * 12.9 + ph * 4) * o.spread * (0.45 + hash2(i, 7) * 0.7);
      const y = o.kind === 'drop' ? -o.h + ph * o.h : -ph * o.h * 0.9 - 2;
      const a = Math.sin(ph * Math.PI);
      const col = (o.col2 && i % 2) ? o.col2 : o.col;
      const sz = o.size * (0.7 + hash2(i, 11) * 0.6);
      switch (o.kind) {
        case 'ember': case 'mote':
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, x, y, sz * 3.2, col, a * 0.9);
          break;
        case 'spark':
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, x, y, sz * 3, col, a);
          ctx.strokeStyle = rgba(col, a); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x - 3, y - 2); ctx.lineTo(x, y + 1); ctx.lineTo(x - 1, y - 1); ctx.lineTo(x + 3, y + 3); ctx.stroke();
          break;
        case 'leaf': case 'petal':
          ctx.globalAlpha = a * 0.9; ctx.fillStyle = col;
          ell(ctx, x, y, sz * 1.5, sz * 0.8, ph * 6 + i); ctx.fill();
          break;
        case 'glitch':
          ctx.globalAlpha = a; ctx.fillStyle = col;
          ctx.fillRect(Math.round(x), Math.round(y), Math.round(sz), Math.round(sz * (i % 3 ? 1 : 0.5)));
          break;
        case 'drop':
          ctx.globalAlpha = a; ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(x, y, sz * 0.8, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x - sz * 0.7, y); ctx.lineTo(x, y - sz * 2); ctx.lineTo(x + sz * 0.7, y); ctx.fill();
          break;
        case 'smoke':
          ctx.globalAlpha = a * 0.32; ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(x, y, sz * (1 + ph * 1.6), 0, TAU); ctx.fill();
          break;
        case 'dust':
          ctx.globalAlpha = a * 0.45; ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(x, y, sz * (0.6 + ph), 0, TAU); ctx.fill();
          break;
        case 'soul':
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, x, y, sz * 3.4, col, a * 0.8);
          ctx.globalAlpha = a; ctx.fillStyle = '#ffffff';
          ell(ctx, x, y, sz * 0.7, sz * 1.0); ctx.fill();
          ctx.strokeStyle = rgba(col, a * 0.7); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(x, y + sz); ctx.quadraticCurveTo(x + 3, y + sz * 2.4, x - 1, y + sz * 3.6); ctx.stroke();
          break;
        default: break;
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  // Etrafta dönen nesneler. front=false: gövdenin arkası, front=true: önü
  function orbitFx(ctx, t, o, front) {
    for (let i = 0; i < o.n; i++) {
      const a = t * o.speed + i * TAU / o.n;
      const s = Math.sin(a);
      if ((s >= 0) !== front) continue;
      const x = Math.cos(a) * o.r, y = -o.h + s * o.r * 0.42;
      const sc = 0.85 + 0.2 * s;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      const col = o.col;
      switch (o.kind) {
        case 'orb':
          glowAdd(ctx, 0, 0, 9, col, 0.9);
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill();
          break;
        case 'blade': {
          glowAdd(ctx, 0, 0, 12, col, 0.45);
          const g = ctx.createLinearGradient(0, -9, 0, 8);
          g.addColorStop(0, '#ffffff'); g.addColorStop(1, col);
          ctx.fillStyle = g; poly(ctx, [0, 9, 2.6, -2, 0, -9, -2.6, -2]); ctx.fill();
          ctx.fillStyle = '#ffd54f'; ctx.fillRect(-3, -4, 6, 1.6);
          break;
        }
        case 'cube': {
          ctx.rotate(a * 0.5);
          glowAdd(ctx, 0, 0, 9, col, 0.5);
          ctx.fillStyle = col; poly(ctx, [0, -4, 4, -2, 0, 0, -4, -2]); ctx.fill();
          ctx.fillStyle = shade(col, -0.35); poly(ctx, [-4, -2, 0, 0, 0, 4, -4, 2]); ctx.fill();
          ctx.fillStyle = shade(col, -0.6); poly(ctx, [4, -2, 0, 0, 0, 4, 4, 2]); ctx.fill();
          break;
        }
        case 'petal':
          ctx.rotate(a * 2); ctx.fillStyle = col; ell(ctx, 0, 0, 3.4, 1.7); ctx.fill();
          ctx.fillStyle = '#fff'; ell(ctx, -0.6, -0.3, 1.4, 0.6); ctx.fill();
          break;
        case 'soul':
          glowAdd(ctx, 0, 0, 10, col, 0.8);
          ctx.fillStyle = '#fff'; ell(ctx, 0, 0, 2.2, 3); ctx.fill();
          ctx.strokeStyle = rgba(col, 0.8); ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(0, 3); ctx.quadraticCurveTo(3, 7, -1, 11); ctx.stroke();
          break;
        case 'bat': {
          const fl = Math.sin(t * 14 + i * 2) * 0.7;
          ctx.fillStyle = col;
          [-1, 1].forEach((sd) => {
            ctx.save(); ctx.scale(sd, 1); ctx.rotate(-fl * 0.5);
            ctx.beginPath(); ctx.moveTo(1, 0); ctx.quadraticCurveTo(6, -6 - fl * 3, 11, -2); ctx.quadraticCurveTo(8, -1, 9, 3); ctx.quadraticCurveTo(5, 0, 1, 2); ctx.fill();
            ctx.restore();
          });
          ctx.beginPath(); ctx.ellipse(0, 1, 2.2, 3, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ff1744'; ctx.fillRect(-1.6, 0, 1, 1); ctx.fillRect(0.7, 0, 1, 1);
          break;
        }
        case 'book':
          glowAdd(ctx, 0, 0, 14, col, 0.5);
          ctx.fillStyle = '#fff8e1'; poly(ctx, [-8, -4, 0, -2, 0, 5, -8, 3]); ctx.fill();
          ctx.fillStyle = '#ffecb3'; poly(ctx, [8, -4, 0, -2, 0, 5, 8, 3]); ctx.fill();
          ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, 5); ctx.stroke();
          ctx.strokeStyle = 'rgba(120,90,30,0.6)';
          for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-6.5, -2 + k * 1.8); ctx.lineTo(-1.5, -1 + k * 1.8); ctx.stroke(); }
          break;
        case 'drop':
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 1.5, 2.6, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.moveTo(-2.4, 1); ctx.lineTo(0, -5); ctx.lineTo(2.4, 1); ctx.fill();
          glowAdd(ctx, 0, 0, 8, col, 0.5);
          break;
        default: break;
      }
      ctx.restore();
    }
  }

  // Kanatlar (omuz hizasında, iki yan)
  function wingsFx(ctx, S, t, moving) {
    const w = S.wings;
    const flap = Math.sin(t * (moving ? 6 : 2.4)) * (moving ? 0.2 : 0.09);
    [-1, 1].forEach((sd) => {
      ctx.save(); ctx.translate(sd * 4, -24); ctx.scale(sd * (w.s || 1), w.s || 1);
      if (w.kind === 'feather') {
        glowAdd(ctx, 14, -8, 24, w.glow, 0.16);
        for (let k = 0; k < 7; k++) {
          const ang = -1.35 + k * 0.23 - flap * (1 + k * 0.12);
          const len = 31 - k * 2.4;
          ctx.save(); ctx.rotate(ang);
          const g = ctx.createLinearGradient(0, 0, len, 0);
          g.addColorStop(0, w.col); g.addColorStop(1, w.col2);
          ctx.fillStyle = g; ctx.globalAlpha = 0.95;
          ell(ctx, len / 2 + 2, 0, len / 2, 4.2 - k * 0.12); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(len, 0); ctx.stroke();
          ctx.restore();
        }
      } else if (w.kind === 'blades') {
        glowAdd(ctx, 16, -6, 26, w.glow, 0.14);
        for (let k = 0; k < 4; k++) {
          const ang = -1.25 + k * 0.34 - flap * (1 + k * 0.1);
          const len = 36 - k * 4;
          ctx.save(); ctx.rotate(ang);
          const g = ctx.createLinearGradient(0, -3, 0, 3);
          g.addColorStop(0, w.col); g.addColorStop(1, w.col2);
          ctx.fillStyle = g; poly(ctx, [2, -2.6, len - 8, -3.4, len, 0, len - 8, 3.4, 2, 2.6]); ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = rgba(w.glow, 0.85); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(len - 2, 0); ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    });
  }

  // Halo / taç parıltısı. behind=true -> kafanın arkası (güneş)
  function haloFx(ctx, S, t, behind) {
    const h = S.halo;
    if (!h) return;
    if (h.kind === 'sun') {
      if (!behind) return;
      ctx.save(); ctx.translate(0, -35);
      glowAdd(ctx, 0, 0, 30, h.col, 0.55 + 0.1 * Math.sin(t * 3));
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgba(h.col, 0.7);
      for (let i = 0; i < 12; i++) {
        const a = t * 0.6 + i * TAU / 12;
        ctx.save(); ctx.rotate(a); poly(ctx, [10, -1.4, 22, 0, 10, 1.4]); ctx.fill(); ctx.restore();
      }
      ctx.strokeStyle = rgba(h.col, 0.9); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.stroke();
      ctx.restore();
      return;
    }
    if (behind) return;
    ctx.save(); ctx.translate(0, -47 + Math.sin(t * 2) * 0.8);
    ctx.globalCompositeOperation = 'lighter';
    if (h.kind === 'ring') {
      glowAdd(ctx, 0, 0, 16, h.col, 0.5);
      ctx.strokeStyle = rgba(h.col, 0.95); ctx.lineWidth = 2; ell(ctx, 0, 0, 9, 3.2); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8; ell(ctx, 0, 0, 9, 3.2); ctx.stroke();
    } else if (h.kind === 'leafring') {
      glowAdd(ctx, 0, 0, 14, h.col, 0.35);
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 9; i++) {
        const a = t * 0.8 + i * TAU / 9;
        ctx.fillStyle = i % 2 ? '#81c784' : '#c8e6c9';
        ell(ctx, Math.cos(a) * 10, Math.sin(a) * 3.4, 2.6, 1.1, a); ctx.fill();
      }
    } else if (h.kind === 'arcane') {
      [[11, 3.8, 1], [7, 2.5, -1.6]].forEach(([rx, ry, sp]) => {
        ctx.strokeStyle = rgba(h.col, 0.9); ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); ctx.lineDashOffset = -t * 10 * sp;
        ell(ctx, 0, 0, rx, ry); ctx.stroke(); ctx.setLineDash([]);
      });
      glowAdd(ctx, 0, 0, 16, h.col, 0.4);
    }
    ctx.restore();
  }

  // Zemin efekti (halka, rün, havuz, kökler)
  function groundFx(ctx, t, g) {
    ctx.save(); ctx.translate(0, 1);
    const rx = 25, ry = 12.5;
    if (g.kind === 'pool') {
      ctx.fillStyle = 'rgba(0,0,0,0.32)'; ell(ctx, 0, 0, rx * 0.95, ry * 0.95); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      drawGlowEllipse(ctx, 0, 0, rx * 1.2, ry * 1.2, g.col, 0.3 + 0.08 * Math.sin(t * 2.5));
      ctx.strokeStyle = rgba(g.col, 0.35); ctx.lineWidth = 1.2; ell(ctx, 0, 0, rx * (0.8 + 0.1 * Math.sin(t * 2)), ry * (0.8 + 0.1 * Math.sin(t * 2))); ctx.stroke();
    } else if (g.kind === 'roots') {
      ctx.globalCompositeOperation = 'lighter';
      drawGlowEllipse(ctx, 0, 0, rx, ry, g.col, 0.18);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const a = i * TAU / 7 + 0.3, len = 0.7 + hash2(i, 5) * 0.45;
        const ex = Math.cos(a) * rx * len, ey = Math.sin(a) * ry * len;
        ctx.strokeStyle = '#3e2a1a'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(ex * 0.5 + Math.sin(i) * 4, ey * 0.5 - 3, ex, ey); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, ex, ey, 4, g.col, 0.6 + 0.3 * Math.sin(t * 3 + i)); ctx.globalCompositeOperation = 'source-over';
      }
    } else {
      ctx.globalCompositeOperation = 'lighter';
      drawGlowEllipse(ctx, 0, 0, rx * 1.15, ry * 1.15, g.col, 0.22);
      ctx.strokeStyle = rgba(g.col, 0.55 + 0.15 * Math.sin(t * 3)); ctx.lineWidth = 1.5; ell(ctx, 0, 0, rx, ry); ctx.stroke();
      ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 14; ctx.strokeStyle = rgba(g.col, 0.45);
      ell(ctx, 0, 0, rx * 0.72, ry * 0.72); ctx.stroke(); ctx.setLineDash([]);
      if (g.kind === 'runes') {
        ctx.fillStyle = rgba(g.col, 0.8);
        for (let k = 0; k < 6; k++) {
          const a = t * 0.8 + k * TAU / 6, x = Math.cos(a) * rx * 0.86, y = Math.sin(a) * ry * 0.86;
          poly(ctx, [x, y - 2.4, x + 1.6, y, x, y + 2.4, x - 1.6, y]); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  // ==========================================================================
  // BAŞLIKLAR / OMUZLUKLAR / AMBLEMLER / KALKANLAR
  // ==========================================================================
  // Başlık yüksekliği (isim plakasını yukarı kaydırmak için)
  const HEAD_TALL = { archhat: 12, mitre: 9, shadecrown: 7, horned: 6, rootcrown: 6, sunhelm: 8, archonhelm: 9, ultracrown: 7, bonehelm: 3, wolfhead: 5, wizard: 6, helm: 4, tamer: 4, goggles: 3, hood: 2, leafcrown: 3, strawhat: 0, skullhood: 6 };

  function hoodBase(ctx, env, hc, topc, inner) {
    const { fx, front } = env;
    ctx.fillStyle = hc;
    ctx.beginPath(); ctx.arc(0, -34, 9, Math.PI * 0.95, Math.PI * 0.05); ctx.lineTo(7, -28); ctx.lineTo(-7, -28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = topc;
    ctx.beginPath(); ctx.moveTo(-9, -35); ctx.quadraticCurveTo(0, -46, 9, -35); ctx.quadraticCurveTo(0, -40, -9, -35); ctx.fill();
    if (front) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(fx * 1.5, -32, 6, 5.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = inner;
      ctx.beginPath(); ctx.ellipse(fx * 1.5, -32.5, 5.4, 5, 0, 0, TAU); ctx.fill();
    }
  }

  function hornPair(ctx, col, len, y0 = -36.5) {
    [-1, 1].forEach((sd) => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(sd * 6.5, y0);
      ctx.quadraticCurveTo(sd * 17 * len, y0 + 0.6, sd * 15 * len, y0 - 13 * len);
      ctx.quadraticCurveTo(sd * 12 * len, y0 - 7 * len, sd * 4.5, y0 - 4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.8; ctx.stroke();
    });
  }

  function crownSpikes(ctx, col, y) {
    ctx.fillStyle = col;
    ctx.fillRect(-7, y, 14, 2.2);
    for (let i = -2; i <= 2; i++) {
      const x = i * 3.2, h = 5.2 - Math.abs(i) * 0.9;
      poly(ctx, [x - 1.8, y, x, y - h, x + 1.8, y]); ctx.fill();
    }
    ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(0, y + 1.1, 1, 0, TAU); ctx.fill();
  }

  function sideLocks(ctx, col, hi, capeSX) {
    [-1, 1].forEach((sd) => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(sd * 7.4, -37);
      ctx.quadraticCurveTo(sd * 11.5, -28, sd * (8.5 + capeSX * 0.05), -17);
      ctx.quadraticCurveTo(sd * 5.6, -25, sd * 6.4, -31); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = hi; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(sd * 8, -34); ctx.quadraticCurveTo(sd * 10, -27, sd * 8, -20); ctx.stroke();
    });
  }

  // Dönüş değeri: true ise başlık kendi yüzünü/gözlerini çizdi (varsayılan yüz atlanır)
  function drawHeadGear(ctx, S, o, env) {
    const { fx, fy, front, capeSX, t } = env;
    const eyeCol = S.eyeGlow;
    let g;
    const eyes = (y = -33, dx = 2.4, r = 1.3, col = eyeCol) => {
      if (!front) return;
      const ex = fx * 2.4, ey = y + fy * 1.4;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ex - dx, ey, r, 0, TAU); ctx.arc(ex + dx, ey, r, 0, TAU); ctx.fill();
      drawGlow(ctx, ex, ey, 9, col, 0.55);
      ctx.restore();
    };
    const dome = (a, b, rad = 8.4, bottom = -31) => {
      g = ctx.createLinearGradient(-rad, 0, rad, 0); g.addColorStop(0, a); g.addColorStop(1, b);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, -34, rad, Math.PI, 0); ctx.lineTo(rad, bottom); ctx.lineTo(-rad, bottom); ctx.closePath(); ctx.fill();
    };

    switch (S.head) {
      case 'helm': {
        dome(S.helmA || '#cfd8dc', S.helmB || '#78909c');
        ctx.fillStyle = '#546e7a'; ctx.fillRect(-8.4, -32, 16.8, 2);
        const pl = S.plume === undefined ? '#c62828' : S.plume;
        if (pl) {
          ctx.fillStyle = pl;
          ctx.beginPath(); ctx.moveTo(-1, -42); ctx.quadraticCurveTo(-8 - capeSX * 0.3, -48, -10 - capeSX * 0.5, -40); ctx.quadraticCurveTo(-5, -40, -1, -42); ctx.fill();
        }
        return false;
      }
      case 'hood': {
        hoodBase(ctx, env, S.hood, S.hoodTop, S.hoodInner);
        if (S.feather) {
          ctx.strokeStyle = S.feather; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(6, -40); ctx.quadraticCurveTo(12, -45, 11 - capeSX * 0.2, -49); ctx.stroke();
        }
        if (S.headExtra === 'antlers') {
          ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
          [-1, 1].forEach((sd) => {
            ctx.beginPath(); ctx.moveTo(sd * 4.5, -41); ctx.quadraticCurveTo(sd * 9, -46, sd * 8, -54);
            ctx.moveTo(sd * 7.6, -46); ctx.lineTo(sd * 12.5, -48.5); ctx.moveTo(sd * 8.2, -50.5); ctx.lineTo(sd * 5, -54); ctx.stroke();
            ctx.fillStyle = '#9ccc65'; ell(ctx, sd * 12.5, -48.5, 2, 1, sd * 0.6); ctx.fill();
          });
        } else if (S.headExtra === 'spark') {
          const fl = 0.55 + 0.45 * Math.sin(t * 22);
          glowAdd(ctx, 0, -48, 10, eyeCol, 0.5 * fl);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba('#e1f5fe', 0.5 + 0.5 * fl);
          poly(ctx, [1.5, -54, -2.5, -47.5, 0, -47.5, -1.5, -42, 3, -49, 0.4, -49]); ctx.fill(); ctx.restore();
        } else if (S.headExtra === 'mask') {
          if (front) { ctx.fillStyle = '#14090d'; ell(ctx, fx * 1.5, -29.4, 5.8, 3.2); ctx.fill(); }
          ctx.strokeStyle = o.trim; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-4, -28); ctx.quadraticCurveTo(-11 - capeSX * 0.6, -25 + Math.sin(t * 8) * 1.5, -17 - capeSX, -20 + Math.sin(t * 8 + 1) * 2.4); ctx.stroke();
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-3, -27); ctx.quadraticCurveTo(-8 - capeSX * 0.5, -22, -12 - capeSX * 0.8, -15 + Math.sin(t * 9) * 2); ctx.stroke();
        } else if (S.headExtra === 'moon') {
          glowAdd(ctx, 0, -39, 8, eyeCol, 0.5);
          ctx.fillStyle = '#e1f5fe';
          ctx.beginPath(); ctx.moveTo(2, -43.4); ctx.bezierCurveTo(-5, -42.6, -5, -36.4, 2, -35.6); ctx.bezierCurveTo(-2, -37.6, -2, -41.4, 2, -43.4); ctx.fill();
        }
        return false;
      }
      case 'greathelm': {
        g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, S.helmA); g.addColorStop(1, S.helmB);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-8.8, -26.5); ctx.lineTo(-8.8, -37); ctx.quadraticCurveTo(-8.8, -43.5, 0, -43.5); ctx.quadraticCurveTo(8.8, -43.5, 8.8, -37);
        ctx.lineTo(8.8, -26.5); ctx.quadraticCurveTo(0, -24, -8.8, -26.5); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke();
        if (front) {
          ctx.fillStyle = '#0b1013'; rr(ctx, fx * 2 - 6.6, -35.8, 13.2, 3.6, 1.2); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(fx * 1.6, -43); ctx.lineTo(fx * 1.6, -36); ctx.moveTo(fx * 1.6, -32); ctx.lineTo(fx * 1.6, -27); ctx.stroke();
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          for (let k = 0; k < 3; k++) ctx.fillRect(fx * 2 - 4 + k * 3.4, -30 + (k === 1 ? 0.6 : 0), 1.4, 1.4);
        }
        ctx.fillStyle = S.pal.trim; ctx.fillRect(-8.8, -38.6, 17.6, 1.2);
        eyes(-34, 2.6, 1.1, eyeCol || '#80deea');
        if (S.plume) {
          ctx.fillStyle = S.plume;
          ctx.beginPath(); ctx.moveTo(0, -43); ctx.quadraticCurveTo(-8 - capeSX * 0.4, -52, -13 - capeSX * 0.8, -42); ctx.quadraticCurveTo(-6, -43, 0, -43); ctx.fill();
        }
        return true;
      }
      case 'winghelm': {
        dome(S.helmA, S.helmB, 8.6, -31);
        ctx.fillStyle = S.pal.trim; ctx.fillRect(-8.6, -34.4, 17.2, 1.8);
        if (front) { ctx.fillStyle = S.helmB; ctx.fillRect(fx * 1.5 - 0.9, -34, 1.8, 6.5); }
        [-1, 1].forEach((sd) => {
          const fl = Math.sin(t * 3 + sd) * 0.8;
          for (let k = 0; k < 2; k++) {
            ctx.fillStyle = k ? '#e8eef2' : '#ffffff';
            ctx.beginPath(); ctx.moveTo(sd * 7.5, -36 - k * 2);
            ctx.quadraticCurveTo(sd * (16 - k * 2), -38 - k * 3, sd * (18 - k * 3), -49 + fl - k * 1.5);
            ctx.quadraticCurveTo(sd * 11, -44, sd * 6, -41); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = S.pal.trim; ctx.lineWidth = 0.7; ctx.stroke();
          }
        });
        return false;
      }
      case 'horned': {
        g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, S.helmA); g.addColorStop(1, S.helmB);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, -34, 8.8, Math.PI, 0); ctx.lineTo(8.8, -28.5); ctx.quadraticCurveTo(0, -26, -8.8, -28.5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-8.8, -35.4, 17.6, 3.4);
        ctx.fillStyle = S.helmB; if (front) ctx.fillRect(fx * 1.5 - 1, -34, 2, 7);
        hornPair(ctx, S.hornCol, S.hornLen || 1);
        if (S.crown) {
          crownSpikes(ctx, '#ffd700', -42);
          for (let k = 0; k < 3; k++) glowAdd(ctx, Math.sin(t * 6 + k * 2) * 2, -48 - k * 3.2, 5 - k, eyeCol, 0.55);
        }
        eyes(-33.8, 2.6, 1.3);
        return true;
      }
      case 'stonehelm': {
        g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, S.helmA); g.addColorStop(1, S.helmB);
        ctx.fillStyle = g; poly(ctx, [-8, -42, 2, -43.5, 9, -40, 9.5, -31, 6, -25.5, -5, -25.5, -9.5, -31]); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-5, -41); ctx.lineTo(-2, -35); ctx.moveTo(6, -38); ctx.lineTo(3, -30); ctx.stroke();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(eyeCol, 0.8); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(3, -43); ctx.lineTo(5, -37); ctx.lineTo(2, -33); ctx.stroke(); ctx.restore();
        if (front) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-7.5, -36.6, 15, 4.2); }
        eyes(-34.4, 3, 1.9);
        return true;
      }
      case 'sunhelm': {
        dome(S.helmA, S.helmB, 8.6, -31);
        ctx.fillStyle = S.pal.trim; ctx.fillRect(-8.6, -34.4, 17.2, 1.8);
        glowAdd(ctx, 0, -48, 9, '#fff59d', 0.6);
        g = ctx.createLinearGradient(0, -53, 0, -42); g.addColorStop(0, '#ffffff'); g.addColorStop(1, S.helmB);
        ctx.fillStyle = g; poly(ctx, [-2, -42, 0, -53, 2, -42]); ctx.fill();
        [-1, 1].forEach((sd) => { poly(ctx, [sd * 8.2, -38, sd * 14, -44, sd * 11.5, -36]); ctx.fill(); });
        return false;
      }
      case 'rootcrown': {
        ctx.fillStyle = '#2e4a1e';
        ctx.beginPath(); ctx.arc(0, -34.6, 7.8, Math.PI * 1.02, Math.PI * -0.02); ctx.lineTo(7, -33); ctx.quadraticCurveTo(0, -37, -7, -33); ctx.fill();
        ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
        for (let k = 0; k < 5; k++) {
          const x = -7 + k * 3.5, tx = x + (k - 2) * 1.6, ty = -43 - (k % 2 ? 4 : 8) - (k === 2 ? 2 : 0);
          ctx.beginPath(); ctx.moveTo(x, -39 + Math.abs(k - 2) * 0.7); ctx.quadraticCurveTo(x + (k % 2 ? 2 : -2), (-39 + ty) / 2, tx, ty); ctx.stroke();
          ctx.fillStyle = k % 2 ? '#7cb342' : '#9ccc65'; ell(ctx, tx, ty, 2.2, 1.1, k - 1.5); ctx.fill();
        }
        glowAdd(ctx, 0, -50, 8, '#76ff03', 0.6 + 0.2 * Math.sin(t * 3));
        ctx.fillStyle = '#ccff90'; ctx.beginPath(); ctx.arc(0, -50, 1.8, 0, TAU); ctx.fill();
        return false;
      }
      case 'strawhat': {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ell(ctx, 0, -35.2, 7.2, 2.2); ctx.fill();
        g = ctx.createLinearGradient(0, -42, 0, -35); g.addColorStop(0, '#f0d98a'); g.addColorStop(1, '#c9a44c');
        ctx.fillStyle = g; ell(ctx, 0, -38.2, 13.5, 4.2); ctx.fill();
        ctx.strokeStyle = 'rgba(120,80,20,0.5)'; ctx.lineWidth = 0.8; ell(ctx, 0, -38.2, 11, 3.2); ctx.stroke();
        ctx.fillStyle = '#e6c565'; ctx.beginPath(); ctx.arc(0, -39.5, 6.8, Math.PI, 0); ctx.lineTo(6.8, -38.6); ctx.lineTo(-6.8, -38.6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#d84315'; ctx.fillRect(-6.8, -41, 13.6, 2.2);
        ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(5.4, -41.6, 2.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#e65100'; ctx.beginPath(); ctx.arc(5.4, -41.6, 1, 0, TAU); ctx.fill();
        return false;
      }
      case 'leafcrown': {
        sideLocks(ctx, '#e8f5e9', '#ffffff', capeSX);
        ctx.fillStyle = '#e8f5e9';
        ctx.beginPath(); ctx.arc(0, -34.6, 7.8, Math.PI * 1.0, 0); ctx.lineTo(6.6, -33); ctx.quadraticCurveTo(0, -37.5, -6.6, -33); ctx.fill();
        for (let k = 0; k < 7; k++) {
          const a = Math.PI + 0.2 + k * (Math.PI - 0.4) / 6;
          ctx.fillStyle = k % 2 ? '#66bb6a' : '#a5d6a7';
          ell(ctx, Math.cos(a) * 7.6, -34.8 + Math.sin(a) * 6.4, 2.4, 1.1, a + Math.PI / 2); ctx.fill();
        }
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-5, -39.6, 2, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(-5, -39.6, 0.8, 0, TAU); ctx.fill();
        return false;
      }
      case 'archhat': {
        ctx.fillStyle = o.armorDark; ell(ctx, 0, -38, 13.8, 3.8); ctx.fill();
        const bend = -capeSX * 0.9 + Math.sin(t * 2) * 1.4;
        ctx.fillStyle = o.cape;
        ctx.beginPath(); ctx.moveTo(-8.8, -38); ctx.quadraticCurveTo(-4 - capeSX * 0.3, -56, 7 + bend, -67); ctx.quadraticCurveTo(10.4, -52, 8.8, -38); ctx.closePath(); ctx.fill();
        ctx.fillStyle = o.trim; ctx.fillRect(-8.8, -40.4, 17.6, 2.4);
        ctx.fillStyle = o.accent;
        [[-2, -47, 1.6], [3, -54, 1.3], [-0.5, -58, 1]].forEach(([sx, sy, sr]) => { starPath(ctx, sx + bend * 0.2, sy, sr * 1.6); ctx.fill(); });
        glowAdd(ctx, 7 + bend, -67, 8, '#e1bee7', 0.7);
        glowAdd(ctx, 0, -39.4, 6, '#ffe082', 0.7);
        return false;
      }
      case 'coif': {
        ctx.fillStyle = '#8d5a2b';
        [-1, 1].forEach((sd) => { ell(ctx, sd * 6.8, -31, 2.2, 3.2); ctx.fill(); });
        ctx.fillStyle = o.cape;
        ctx.beginPath(); ctx.arc(0, -34.4, 8.2, Math.PI, 0); ctx.lineTo(8.2, -32); ctx.quadraticCurveTo(0, -37.2, -8.2, -32); ctx.closePath(); ctx.fill();
        [-1, 1].forEach((sd) => {
          ctx.fillStyle = o.capeDark;
          ctx.beginPath(); ctx.moveTo(sd * 7.6, -35); ctx.quadraticCurveTo(sd * 11, -28, sd * (9 + capeSX * 0.05), -23); ctx.lineTo(sd * 5.5, -27); ctx.closePath(); ctx.fill();
        });
        ctx.fillStyle = o.trim; ctx.fillRect(-8.2, -37.6, 16.4, 1.4);
        ctx.fillStyle = '#e53935'; ctx.fillRect(-0.9, -42, 1.8, 5); ctx.fillRect(-2.5, -40.4, 5, 1.8);
        return false;
      }
      case 'mitre': {
        ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(0, -34.4, 8.2, Math.PI, 0); ctx.lineTo(8.2, -32); ctx.quadraticCurveTo(0, -37, -8.2, -32); ctx.fill();
        ctx.fillStyle = S.pal.trim; ctx.fillRect(-8.2, -38.2, 16.4, 2.4);
        g = ctx.createLinearGradient(0, -54, 0, -38); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#efe5c0');
        ctx.fillStyle = g; poly(ctx, [-7, -38.4, -6.2, -52.5, 0, -47.8, 6.2, -52.5, 7, -38.4]); ctx.fill();
        ctx.strokeStyle = S.pal.trim; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -47.8); ctx.lineTo(0, -38.4); ctx.stroke();
        ctx.fillStyle = '#ffc107'; ctx.fillRect(-0.8, -46, 1.6, 5.4); ctx.fillRect(-2.4, -44.4, 4.8, 1.6);
        ctx.strokeStyle = S.pal.trim; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
        [-1, 1].forEach((sd) => { ctx.beginPath(); ctx.moveTo(sd * 5.5, -37.5); ctx.quadraticCurveTo(sd * (9 + Math.sin(t * 3) * 0.6), -31, sd * (8 + capeSX * 0.05), -25); ctx.stroke(); });
        return false;
      }
      case 'saint': {
        sideLocks(ctx, '#fff3c4', '#ffffff', capeSX);
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath(); ctx.arc(0, -34.6, 7.9, Math.PI * 1.0, 0); ctx.lineTo(6.8, -33); ctx.quadraticCurveTo(0, -37.6, -6.8, -33); ctx.fill();
        ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, -34.4, 7.9, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
        glowAdd(ctx, 0, -40.8, 5, '#ffffff', 0.8);
        ctx.fillStyle = '#ffffff'; poly(ctx, [0, -43, 1.4, -40.8, 0, -39, -1.4, -40.8]); ctx.fill();
        return false;
      }
      case 'modcap': case 'ultracrown': {
        const ultra = S.head === 'ultracrown';
        if (!ultra) {
          ctx.fillStyle = o.armor; ctx.beginPath(); ctx.arc(0, -34.4, 8.3, Math.PI, 0); ctx.lineTo(8.3, -35.5); ctx.lineTo(-8.3, -35.5); ctx.closePath(); ctx.fill();
          ctx.fillStyle = o.armorDark; ell(ctx, fx * 5, -35.6, 6.6, 2.2); ctx.fill();
          ctx.fillStyle = '#ffd54f'; starPath(ctx, fx * 0.5, -39.4, 2.2); ctx.fill();
        } else {
          ctx.fillStyle = '#12121c'; ctx.beginPath(); ctx.arc(0, -34.4, 8.3, Math.PI, 0); ctx.lineTo(8.3, -35); ctx.lineTo(-8.3, -35); ctx.closePath(); ctx.fill();
          crownSpikes(ctx, '#ffd740', -41.6);
        }
        ctx.strokeStyle = ultra ? '#ffd740' : '#cfd8dc'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(0, -34, 8.9, Math.PI * 1.04, Math.PI * 1.96); ctx.stroke();
        const side = fx >= 0 ? -1 : 1;
        ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(side * 8.6, -33, 2.6, 0, TAU); ctx.fill();
        glowAdd(ctx, side * 8.6, -33, 5, ultra ? '#ffd740' : '#00e5ff', 0.6);
        if (front) {
          ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(side * 8.4, -31); ctx.quadraticCurveTo(side * 6, -27.5, fx * 3, -28.6); ctx.stroke();
          ctx.fillStyle = '#05070d'; rr(ctx, fx * 2 - 6.3, -34.4, 12.6, 3.6, 1.4); ctx.fill();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(ultra ? '#ffd740' : '#00e5ff', 0.85); ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(fx * 2 - 5, -33.2); ctx.lineTo(fx * 2 - 1.6, -33.2); ctx.moveTo(fx * 2 + 1.6, -33.2); ctx.lineTo(fx * 2 + 5, -33.2); ctx.stroke();
          drawGlow(ctx, fx * 2, -32.6, 8, ultra ? '#ffd740' : '#00e5ff', 0.35); ctx.restore();
        }
        return true;
      }
      case 'goggles': {
        ctx.fillStyle = o.cape; ctx.beginPath(); ctx.arc(0, -34.6, 8.2, Math.PI, 0); ctx.lineTo(8.2, -35.4); ctx.lineTo(-8.2, -35.4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 3.2, -42); ctx.lineTo(k * 3.6, -35.6); ctx.stroke(); }
        glowAdd(ctx, 0, -44, 5, '#ff00e6', 0.6);
        ctx.fillStyle = '#ff00e6'; ctx.beginPath(); ctx.arc(0, -43.4, 2.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#111'; ctx.fillRect(-8.4, -35.6, 16.8, 2);
        if (front) {
          const flick = hash2(Math.floor(t * 12), 4) > 0.82;
          [-1, 1].forEach((sd) => {
            const lx = fx * 1.6 + sd * 3.4;
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(lx, -33.6, 3.5, 0, TAU); ctx.fill();
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = flick ? '#ff00e6' : '#76ff03'; ctx.beginPath(); ctx.arc(lx, -33.6, 2.5, 0, TAU); ctx.fill();
            drawGlow(ctx, lx, -33.6, 8, flick ? '#ff00e6' : '#76ff03', 0.4); ctx.restore();
            ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(lx - 1.4, -35, 1.2, 1.2);
          });
        }
        return true;
      }
      case 'skullhood': {
        const sway = Math.sin(t * 2) * 1.2 - capeSX * 0.5;
        ctx.fillStyle = '#14141a';
        ctx.beginPath(); ctx.moveTo(-9.5, -26); ctx.quadraticCurveTo(-11.5, -40, -1 + sway, -50); ctx.quadraticCurveTo(10.5, -41, 9.5, -26); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(105,240,174,0.35)'; ctx.lineWidth = 1; ctx.stroke();
        if (front) {
          ctx.fillStyle = '#050507'; ell(ctx, fx * 1.2, -32.4, 6.6, 7); ctx.fill();
          ctx.fillStyle = S.skin; ell(ctx, fx * 1.6, -32.8, 4.7, 5.1); ctx.fill();
          ctx.fillStyle = '#0a0a0e';
          ell(ctx, fx * 1.6 - 2.1, -33.6, 1.5, 1.9); ctx.fill(); ell(ctx, fx * 1.6 + 2.1, -33.6, 1.5, 1.9); ctx.fill();
          poly(ctx, [fx * 1.6, -32, fx * 1.6 - 0.8, -30.6, fx * 1.6 + 0.8, -30.6]); ctx.fill();
          ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(fx * 1.6 - 2.6, -29); ctx.lineTo(fx * 1.6 + 2.6, -29); ctx.stroke();
          for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(fx * 1.6 + k * 1.4, -29.6); ctx.lineTo(fx * 1.6 + k * 1.4, -28.2); ctx.stroke(); }
          eyes(-33.6, 2.1, 1.1);
        }
        return true;
      }
      case 'shadecrown': {
        glowAdd(ctx, 0, -33, 15, '#aa00ff', 0.28);
        ctx.fillStyle = '#0a0414'; ctx.beginPath(); ctx.arc(0, -33, 7.6, 0, TAU); ctx.fill();
        ctx.fillStyle = '#1a0b2e';
        for (let i = -3; i <= 3; i++) {
          const h = 6 + (3 - Math.abs(i)) * 1.8 + Math.sin(t * 4 + i) * 0.8, x = i * 2.6;
          poly(ctx, [x - 1.7, -39.4, x, -39.4 - h, x + 1.7, -39.4]); ctx.fill();
        }
        ctx.fillRect(-8, -40, 16, 2);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = -3; i <= 3; i += 1) drawGlow(ctx, i * 2.6, -47 - (3 - Math.abs(i)) * 1.8 - Math.abs(Math.sin(t * 5 + i)) * 2, 4, '#aa00ff', 0.6);
        ctx.restore();
        eyes(-33.4, 2.8, 1.6);
        return true;
      }
      case 'bonehelm': {
        dome(S.helmA, S.helmB, 8.6, -29);
        ctx.fillStyle = '#0b0f0b'; ctx.fillRect(-8.6, -35.6, 17.2, 4);
        hornPair(ctx, '#d6d6c4', 0.75, -37);
        ctx.fillStyle = '#d9d9c6';
        if (front) {
          ctx.fillRect(fx * 1.5 - 4.6, -29.4, 9.2, 2.6);
          ctx.strokeStyle = '#3a3a30'; ctx.lineWidth = 0.7;
          for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(fx * 1.5 + k * 1.8, -29.4); ctx.lineTo(fx * 1.5 + k * 1.8, -26.8); ctx.stroke(); }
        }
        ctx.fillStyle = S.helmB; ctx.fillRect(fx * 1.5 - 0.7, -42.6, 1.4, 7);
        eyes(-33.7, 2.8, 1.5);
        return true;
      }
      case 'spawn': {
        ctx.fillStyle = '#2a0508';
        [-1, 1].forEach((sd) => { poly(ctx, [sd * 4, -39.5, sd * 6.5, -46, sd * 7.5, -38.5]); ctx.fill(); });
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ell(ctx, fx * 1.5, -35.2, 6.2, 1.6); ctx.fill();
        eyes(-33.4, 2.6, 1.6);
        if (front) {
          ctx.fillStyle = '#2a0508'; ell(ctx, fx * 1.5, -29, 3.8, 1.7); ctx.fill();
          ctx.fillStyle = '#fff';
          for (let k = -2; k <= 2; k++) poly(ctx, [fx * 1.5 + k * 1.4 - 0.7, -30, fx * 1.5 + k * 1.4, -28.4, fx * 1.5 + k * 1.4 + 0.7, -30]), ctx.fill();
        }
        return true;
      }
      case 'gloom': {
        glowAdd(ctx, 0, -33, 14, '#1d4a56', 0.4);
        ctx.fillStyle = S.pal.armorDark; ell(ctx, 0, -33, 8.6, 8); ctx.fill();
        ctx.strokeStyle = S.pal.armor; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          const x = -4 + k * 4;
          ctx.beginPath(); ctx.moveTo(x, -39); ctx.quadraticCurveTo(x + Math.sin(t * 3 + k) * 3, -45, x + Math.sin(t * 2.4 + k * 2) * 4, -50 - k % 2 * 3); ctx.stroke();
        }
        if (front) {
          const pts = [[-3.6, -34.6, 1.6], [0.6, -36, 1.2], [3.6, -33.8, 1.5], [-1, -31.6, 1.1], [2.2, -30.6, 0.9]];
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = eyeCol;
          pts.forEach(([ex, ey, er], k) => {
            const bl = Math.sin(t * 2 + k * 1.7) > 0.93 ? 0.2 : 1;
            ctx.beginPath(); ctx.arc(ex + fx * 1.4, ey, er * bl, 0, TAU); ctx.fill();
            drawGlow(ctx, ex + fx * 1.4, ey, er * 4, eyeCol, 0.5 * bl);
          });
          ctx.restore();
        }
        return true;
      }
      case 'vamp': {
        if (S.collar) {
          [-1, 1].forEach((sd) => {
            ctx.fillStyle = o.cape; poly(ctx, [sd * 11, -25, sd * 9.8, -39, sd * 6, -27.5]); ctx.fill();
            ctx.fillStyle = '#ff1744'; poly(ctx, [sd * 9, -26, sd * 8.6, -35, sd * 6.4, -27.6]); ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
          });
        }
        ctx.fillStyle = '#0d060a';
        ctx.beginPath(); ctx.arc(0, -34.8, 7.8, Math.PI * 0.98, Math.PI * 0.02); ctx.lineTo(6.6, -34); ctx.quadraticCurveTo(0, -37.8, -6.6, -34); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-6.8, -36); ctx.quadraticCurveTo(-12 - capeSX * 0.3, -33, -10 - capeSX * 0.5, -24); ctx.quadraticCurveTo(-7, -30, -6, -33); ctx.fill();
        if (front) {
          ctx.fillStyle = '#fff'; poly(ctx, [fx * 1.5 - 1.8, -29.6, fx * 1.5 - 1.1, -27.6, fx * 1.5 - 0.4, -29.6]); ctx.fill();
          poly(ctx, [fx * 1.5 + 0.4, -29.6, fx * 1.5 + 1.1, -27.6, fx * 1.5 + 1.8, -29.6]); ctx.fill();
        }
        return false;
      }
      case 'archonhelm': {
        dome(S.helmA, S.helmB, 8.6, -31);
        ctx.fillStyle = S.pal.trim; ctx.fillRect(-8.6, -34.4, 17.2, 1.6);
        glowAdd(ctx, 0, -48, 9, '#40c4ff', 0.5 + 0.1 * Math.sin(t * 4));
        g = ctx.createLinearGradient(0, -57, 0, -42); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#2196f3');
        ctx.fillStyle = g; poly(ctx, [-2.8, -42, 0, -57, 2.8, -42]); ctx.fill();
        [-1, 1].forEach((sd) => { poly(ctx, [sd * 8, -38, sd * 16, -45, sd * 12, -35.5]); ctx.fill(); });
        return false;
      }
      case 'wizard': {
        ctx.fillStyle = o.armorDark; ell(ctx, 0, -38, 12, 3.4); ctx.fill();
        ctx.fillStyle = o.cape;
        ctx.beginPath(); ctx.moveTo(-8, -38); ctx.quadraticCurveTo(-3 - capeSX * 0.3, -50, 4 - capeSX * 0.8, -56); ctx.quadraticCurveTo(7, -47, 8, -38); ctx.closePath(); ctx.fill();
        ctx.fillStyle = o.trim; ctx.fillRect(-8, -40, 16, 2.2);
        glowAdd(ctx, 0, -40, 6, '#ffe082', 0.8);
        return false;
      }
      case 'wolfskull': case 'wolfhead': {
        const big = S.head === 'wolfhead';
        const fur = big ? ['#eceff1', '#90a4ae'] : ['#d7ccc8', '#8d6e63'];
        if (big) {
          g = ctx.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, fur[0]); g.addColorStop(1, fur[1]);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -34, 9.6, Math.PI * 0.92, Math.PI * 0.08); ctx.lineTo(8, -26); ctx.lineTo(-8, -26); ctx.closePath(); ctx.fill();
          ctx.fillStyle = fur[1];
          for (let k = 0; k < 7; k++) { const a = Math.PI + k * Math.PI / 6; poly(ctx, [Math.cos(a) * 9, -34 + Math.sin(a) * 9, Math.cos(a) * 12, -34 + Math.sin(a) * 12.5, Math.cos(a + 0.28) * 9, -34 + Math.sin(a + 0.28) * 9]); ctx.fill(); }
        } else {
          g = ctx.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, '#f1ead8'); g.addColorStop(1, '#bfb49a');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -34.4, 8.4, Math.PI, 0); ctx.lineTo(8.4, -31); ctx.lineTo(-8.4, -31); ctx.closePath(); ctx.fill();
        }
        [-1, 1].forEach((sd) => {
          ctx.fillStyle = big ? '#78909c' : '#e0d6bd';
          poly(ctx, [sd * 8.8, -39, sd * 8.2, -52, sd * 2.6, -42.4]); ctx.fill();
          ctx.fillStyle = big ? '#37474f' : '#8d6e63'; poly(ctx, [sd * 7.2, -41, sd * 7, -48.5, sd * 4, -42.8]); ctx.fill();
        });
        if (front) {
          const sx = fx * 1.5;
          ctx.fillStyle = big ? '#cfd8dc' : '#efe6cc';
          poly(ctx, [sx - 4.8, -38, sx + 4.8, -38, fx * 3.6 + 3.2, -31.6, fx * 3.6 - 3.2, -31.6]); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(fx * 3.6, -32.4, 1.5, 0, TAU); ctx.fill();
          ctx.fillStyle = '#fff'; poly(ctx, [fx * 3.6 - 2.6, -31.6, fx * 3.6 - 2, -29.6, fx * 3.6 - 1.2, -31.6]); ctx.fill();
          poly(ctx, [fx * 3.6 + 1.2, -31.6, fx * 3.6 + 2, -29.6, fx * 3.6 + 2.6, -31.6]); ctx.fill();
        }
        eyes(-35.6, 3.4, 1.2, eyeCol || '#ffb74d');
        return true;
      }
      default: { // 'tamer'
        ctx.fillStyle = '#3e2c1a';
        ctx.beginPath(); ctx.arc(0, -34.5, 8.2, Math.PI, 0); ctx.lineTo(8, -32); ctx.lineTo(-8, -32); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-6, -40); ctx.quadraticCurveTo(-12, -44, -9, -50);
        ctx.moveTo(6, -40); ctx.quadraticCurveTo(12, -44, 9, -50); ctx.stroke();
        ctx.fillStyle = '#7cb342';
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(-7 + i * 3.5, -39.5 + Math.abs(i - 2) * 0.8, 2.2, 1.1, i * 0.5 - 1, 0, TAU); ctx.fill(); }
        return false;
      }
    }
  }

  // Omuzluklar
  function drawShoulders(ctx, S, o) {
    const kind = S.shoulder;
    if (kind === 'none') return;
    const sc = S.shoulderCol || o.trim;
    [-8, 8].forEach((sx, i) => {
      const r = kind === 'big' ? 6.6 : kind === 'pauldron' ? 5.4 : 4.6;
      const y = -24.5;
      if (kind === 'fur') {
        ctx.fillStyle = i ? '#8d6e63' : '#d7ccc8';
        for (let k = 0; k < 6; k++) { const a = Math.PI + k * Math.PI / 5; poly(ctx, [sx + Math.cos(a) * 3.5, y + Math.sin(a) * 3.5, sx + Math.cos(a) * 8, y + Math.sin(a) * 7.2, sx + Math.cos(a + 0.4) * 3.5, y + Math.sin(a + 0.4) * 3.5]); ctx.fill(); }
        ell(ctx, sx, y + 0.6, 6.4, 4.4); ctx.fill();
        return;
      }
      if (kind === 'spiked') {
        ctx.fillStyle = sc;
        for (let k = 0; k < 3; k++) {
          const a = -Math.PI / 2 + (k - 1) * 0.75 + (sx > 0 ? 0.25 : -0.25);
          poly(ctx, [sx + Math.cos(a - 0.3) * r, y + Math.sin(a - 0.3) * r, sx + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7), sx + Math.cos(a + 0.3) * r, y + Math.sin(a + 0.3) * r]); ctx.fill();
        }
      }
      if (kind === 'pauldron') {
        ctx.fillStyle = sc;
        const d = sx > 0 ? 1 : -1;
        poly(ctx, [sx - d * 1, y - r + 1, sx + d * 8, y - r - 6, sx + d * 6.4, y - r + 2.4]); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.8; ctx.stroke();
      }
      ctx.fillStyle = i ? o.armorDark : shade(o.armor, 0.2);
      ctx.beginPath(); ctx.arc(sx, y, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = kind === 'pauldron' ? sc : o.trim; ctx.lineWidth = 1; ctx.stroke();
      if (kind === 'leaf') {
        for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? '#66bb6a' : '#a5d6a7'; ell(ctx, sx + (k - 1) * 3.2, y - 3.8 - (k === 1 ? 1.4 : 0), 2.6, 1.2, (k - 1) * 0.8 + (sx > 0 ? 0.4 : -0.4)); ctx.fill(); }
      }
    });
  }

  // Göğüs amblemi (0,-19 merkezli)
  function drawEmblem(ctx, S, o) {
    const e = S.emblem;
    if (!e || e === 'none') return;
    const c = S.emblemCol || o.trim;
    ctx.save(); ctx.translate(0, -19); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 1.4;
    switch (e) {
      case 'cross': ctx.fillRect(-1.3, -5, 2.6, 10); ctx.fillRect(-4, -2.4, 8, 2.6); break;
      case 'sun':
        ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill();
        for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 3.8, Math.sin(a) * 3.8); ctx.lineTo(Math.cos(a) * 5.6, Math.sin(a) * 5.6); ctx.stroke(); }
        break;
      case 'skull':
        ctx.fillStyle = '#e8e4d4'; ctx.beginPath(); ctx.arc(0, -0.6, 3.6, 0, TAU); ctx.fill(); ctx.fillRect(-2, 2, 4, 2.4);
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-1.4, -0.6, 1, 0, TAU); ctx.arc(1.4, -0.6, 1, 0, TAU); ctx.fill();
        break;
      case 'drop': ctx.beginPath(); ctx.arc(0, 1.2, 3, 0, TAU); ctx.fill(); poly(ctx, [-2.8, 0.6, 0, -5, 2.8, 0.6]); ctx.fill(); break;
      case 'leaf': ell(ctx, 0, 0, 4.6, 2.2, -0.7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(-3, 2); ctx.lineTo(3, -2); ctx.stroke(); break;
      case 'star': starPath(ctx, 0, 0.4, 5); ctx.fill(); break;
      case 'rune':
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, 0, 0, 9, c, 0.7); ctx.restore();
        ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(3, 0); ctx.lineTo(-3, 4); ctx.moveTo(0, -5); ctx.lineTo(0, 5); ctx.stroke(); break;
      case 'moon': ctx.beginPath(); ctx.moveTo(2, -5); ctx.bezierCurveTo(-5, -4, -5, 4, 2, 5); ctx.bezierCurveTo(-1.6, 2.6, -1.6, -2.6, 2, -5); ctx.fill(); break;
      case 'bolt': poly(ctx, [1.6, -5.6, -3, 0.6, -0.2, 0.6, -1.6, 5.6, 3, -0.8, 0.2, -0.8]); ctx.fill(); break;
      case 'shield': poly(ctx, [-4, -4.4, 4, -4.4, 3.6, 1.4, 0, 5, -3.6, 1.4]); ctx.fill(); ctx.fillStyle = '#0a0f1a'; starPath(ctx, 0, -0.4, 2.2); ctx.fill(); break;
      case 'bug':
        ell(ctx, 0, 0.6, 2.6, 3.4); ctx.fill(); ctx.beginPath(); ctx.arc(0, -3.2, 1.6, 0, TAU); ctx.fill();
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2.4, -1); ctx.lineTo(-5, -2.4); ctx.moveTo(-2.6, 1); ctx.lineTo(-5.2, 1.4); ctx.moveTo(-2.2, 3); ctx.lineTo(-4.6, 5);
        ctx.moveTo(2.4, -1); ctx.lineTo(5, -2.4); ctx.moveTo(2.6, 1); ctx.lineTo(5.2, 1.4); ctx.moveTo(2.2, 3); ctx.lineTo(4.6, 5); ctx.stroke();
        break;
      case 'fang': ctx.fillStyle = '#f5f5dc'; ctx.beginPath(); ctx.moveTo(-3, -4); ctx.quadraticCurveTo(3, -3, 2, 5); ctx.quadraticCurveTo(0, 0, -3, -4); ctx.fill(); break;
      default: poly(ctx, [0, -4, 3, 0, 0, 4, -3, 0]); ctx.fill(); break; // diamond
    }
    ctx.restore();
  }

  // Yan el kalkanı
  function drawShield(ctx, S, o, env) {
    const sx = env.fx >= 0 ? -11 : 11;
    ctx.save(); ctx.translate(sx, -15);
    const k = S.offhand;
    let g;
    if (k === 'round') {
      g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 9); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, o.armor); g.addColorStop(1, o.armorDark);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 8.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = o.trim; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = o.trim; ctx.fillRect(-1, -5, 2, 10); ctx.fillRect(-5, -1.2, 10, 2.4);
      glowAdd(ctx, 0, 0, 12, '#fff59d', 0.25);
    } else if (k === 'kite') {
      ctx.fillStyle = o.cape; poly(ctx, [-7.5, -10, 7.5, -10, 6.6, 1, 0, 11, -6.6, 1]); ctx.fill();
      ctx.strokeStyle = o.trim; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-1.1, -8, 2.2, 15); ctx.fillRect(-4.6, -4, 9.2, 2.2);
    } else { // tower
      g = ctx.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, S.helmA); g.addColorStop(1, o.armorDark);
      ctx.fillStyle = g; rr(ctx, -8.4, -13, 16.8, 26, 3); ctx.fill();
      ctx.strokeStyle = o.trim; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = o.accent; ctx.fillRect(-1.6, -11, 3.2, 22);
      ctx.fillStyle = '#cfd8dc';
      [[-5.6, -10], [5.6, -10], [-5.6, 10], [5.6, 10]].forEach(([rx2, ry2]) => { ctx.beginPath(); ctx.arc(rx2, ry2, 1, 0, TAU); ctx.fill(); });
      glowAdd(ctx, 0, 0, 14, o.accent, 0.18);
    }
    ctx.restore();
  }

  // ==========================================================================
  // SİLAHLAR — yerel uzay: eldeki nokta (0,0), +x = nişan yönü
  // ==========================================================================
  function bladeGrad(ctx, B, y0, y1) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, B.a); g.addColorStop(1, B.b);
    return g;
  }

  function dualBlades(ctx, S, o, t, B) {
    const len = 30 * (B.len || 1) + (S.weapon === 'katana' ? 10 : 0);
    const one = (rot, off, scl) => {
      ctx.save(); ctx.rotate(rot); ctx.translate(0, off); ctx.scale(scl, scl);
      ctx.fillStyle = '#1a1a1a'; rr(ctx, -3, -1.5, 10, 3, 1); ctx.fill();
      ctx.fillStyle = o.trim; ctx.beginPath(); ctx.ellipse(7.5, 0, 1.4, 4.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = bladeGrad(ctx, B, -3, 3);
      ctx.beginPath(); ctx.moveTo(8.5, -2.4);
      if (B.curved || S.weapon === 'katana') {
        ctx.quadraticCurveTo(8 + len * 0.55, -6.5, 8 + len, -1.2);
        ctx.quadraticCurveTo(8 + len * 0.55, -1.8, 8.5, 2.4);
      } else {
        ctx.lineTo(8 + len * 0.8, -1.2); ctx.lineTo(8 + len, 0); ctx.lineTo(8 + len * 0.8, 1.6); ctx.lineTo(8.5, 2.4);
      }
      ctx.closePath(); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(B.glow, 0.9); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(10, -1.2); ctx.quadraticCurveTo(8 + len * 0.5, -3.6 * (B.curved || S.weapon === 'katana' ? 1.5 : 0.4), 8 + len - 1, -0.9); ctx.stroke();
      drawGlow(ctx, 8 + len * 0.7, -1, 12, B.glow, 0.3 + 0.1 * Math.sin(t * 5)); ctx.restore();
      ctx.restore();
    };
    one(-0.22, -3, 1);
    one(0.3, 4, S.weapon === 'katana' ? 0.7 : 0.92);
  }

  function drawWeaponKind(ctx, S, o, t, atk, recoil) {
    const B = S.blade || { a: '#ffffff', b: '#90a4ae', glow: o.accent };
    switch (S.weapon) {
      case 'sword': {
        ctx.fillStyle = '#5d4037'; rr(ctx, -4, -2, 11, 4, 1.5); ctx.fill();
        ctx.fillStyle = o.trim; ctx.beginPath(); ctx.arc(-4, 0, 2.6, 0, TAU); ctx.fill();
        rr(ctx, 7, -7, 4, 14, 2); ctx.fill();
        const bg = ctx.createLinearGradient(0, -4, 0, 4);
        bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.5, '#cfd8dc'); bg.addColorStop(1, '#78909c');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.moveTo(11, -3.5); ctx.lineTo(40, -3.5); ctx.lineTo(48, 0); ctx.lineTo(40, 3.5); ctx.lineTo(11, 3.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(41, 0); ctx.stroke();
        glowAdd(ctx, 30, 0, 18, o.accent, 0.22 + 0.1 * Math.sin(t * 4));
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(14, -3.5, 26, 1);
        break;
      }
      case 'greatsword': {
        ctx.scale(S.wScale, S.wScale);
        ctx.fillStyle = '#3e2723'; rr(ctx, -6, -2, 14, 4, 1.5); ctx.fill();
        ctx.fillStyle = o.trim; ctx.beginPath(); ctx.arc(-6, 0, 3, 0, TAU); ctx.fill(); rr(ctx, 8, -8.5, 4.4, 17, 2); ctx.fill();
        ctx.fillStyle = bladeGrad(ctx, B, -5, 5);
        ctx.beginPath(); ctx.moveTo(12, -4.6); ctx.lineTo(50, -4.6); ctx.lineTo(60, 0); ctx.lineTo(50, 4.6); ctx.lineTo(12, 4.6); ctx.closePath(); ctx.fill();
        if (B.bone) {
          ctx.fillStyle = B.a;
          for (let k = 0; k < 5; k++) poly(ctx, [16 + k * 8, -4.6, 19 + k * 8, -8, 22 + k * 8, -4.6]), ctx.fill();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(54, 0); ctx.stroke();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(14, -4.6, 36, 1.2);
        drawGlow(ctx, 36, 0, 26, B.glow, 0.28 + 0.1 * Math.sin(t * 4));
        if (B.flame) {
          for (let k = 0; k < 6; k++) {
            const fl = Math.sin(t * 9 + k * 1.7);
            drawGlow(ctx, 16 + k * 8 + fl, -5 - Math.abs(fl) * 3.4, 5, B.glow, 0.6);
          }
        }
        if (B.light) { ctx.fillStyle = rgba(B.glow, 0.35); poly(ctx, [14, -4, 84, -1.6, 84, 1.6, 14, 4]); ctx.fill(); }
        ctx.restore();
        break;
      }
      case 'axe': {
        ctx.fillStyle = '#4e342e'; rr(ctx, -7, -1.8, 36, 3.6, 1.4); ctx.fill();
        ctx.fillStyle = o.trim; ctx.fillRect(-1, -2.2, 2.4, 4.4); ctx.fillRect(9, -2.2, 2.4, 4.4);
        [-1, 1].forEach((sy) => {
          ctx.save(); ctx.scale(1, sy);
          const g = ctx.createLinearGradient(24, 0, 38, -18); g.addColorStop(0, '#90a4ae'); g.addColorStop(1, '#eceff1');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(25, -1.5); ctx.bezierCurveTo(21, -8, 26, -18, 37, -19); ctx.bezierCurveTo(36, -11, 34, -5, 32, -1.5); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#263238'; ctx.lineWidth = 0.9; ctx.stroke();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(o.accent, 0.8); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(37, -19); ctx.bezierCurveTo(36, -11, 34, -5, 32, -1.5); ctx.stroke(); ctx.restore();
          ctx.restore();
        });
        ctx.fillStyle = '#37474f'; poly(ctx, [28.4, -2.4, 30.6, 0, 28.4, 2.4, 32, 0]); ctx.fill();
        poly(ctx, [29, -1.4, 38, 0, 29, 1.4]); ctx.fillStyle = '#cfd8dc'; ctx.fill();
        glowAdd(ctx, 31, 0, 22, o.accent, 0.2 + 0.08 * Math.sin(t * 4));
        break;
      }
      case 'mace': {
        const M = S.mace || { head: '#ffd54f', glow: '#fff59d' };
        ctx.fillStyle = '#4e342e'; rr(ctx, -6, -1.7, 29, 3.4, 1.4); ctx.fill();
        ctx.fillStyle = o.trim; ctx.beginPath(); ctx.arc(-6, 0, 2.2, 0, TAU); ctx.fill();
        for (let k = 0; k < 6; k++) { const a = k * TAU / 6; ctx.save(); ctx.translate(30, 0); ctx.rotate(a); ctx.fillStyle = shade(M.head, -0.25); poly(ctx, [4, -2.6, 10, 0, 4, 2.6]); ctx.fill(); ctx.restore(); }
        const g = ctx.createRadialGradient(28.5, -2, 1, 30, 0, 8); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, M.head); g.addColorStop(1, shade(M.head, -0.5));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(30, 0, 6.8, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1; ctx.stroke();
        glowAdd(ctx, 30, 0, 22, M.glow, 0.35 + 0.12 * Math.sin(t * 4));
        break;
      }
      case 'hammer': {
        const H = S.hammer || { head: '#78909c', glow: '#ff7043', size: 1 };
        const sz = H.size || 1;
        ctx.fillStyle = '#4e342e'; rr(ctx, -9, -2.2, 42, 4.4, 1.6); ctx.fill();
        ctx.fillStyle = o.trim; ctx.fillRect(2, -2.6, 2.6, 5.2); ctx.fillRect(14, -2.6, 2.6, 5.2);
        const g = ctx.createLinearGradient(0, -9 * sz, 0, 9 * sz); g.addColorStop(0, '#cfd8dc'); g.addColorStop(0.5, H.head); g.addColorStop(1, '#37474f');
        ctx.fillStyle = g; rr(ctx, 30, -10 * sz, 14 * sz, 20 * sz, 2.4); ctx.fill();
        ctx.strokeStyle = '#1c2429'; ctx.lineWidth = 1.1; ctx.stroke();
        ctx.fillStyle = o.trim; ctx.fillRect(30, -10 * sz, 2.4, 20 * sz); ctx.fillRect(41.6 * sz + (1 - sz) * 30, -10 * sz, 2.4, 20 * sz);
        glowAdd(ctx, 37 * sz + 4, 0, 24, H.glow, 0.28 + 0.1 * Math.sin(t * 4));
        break;
      }
      case 'gavel': {
        const G = S.gavel || { head: '#455a64', glow: '#00e5ff', size: 1 };
        const sz = G.size || 1;
        ctx.fillStyle = '#4e342e'; rr(ctx, -6, -1.7, 27, 3.4, 1.4); ctx.fill();
        const g = ctx.createLinearGradient(0, -8 * sz, 0, 8 * sz); g.addColorStop(0, shade(G.head, 0.3)); g.addColorStop(1, shade(G.head, -0.35));
        ctx.fillStyle = g; rr(ctx, 20, -8.4 * sz, 15 * sz, 16.8 * sz, 3); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = G.glow; ctx.fillRect(20, -8.4 * sz, 2.2, 16.8 * sz); ctx.fillRect(33 * sz + (1 - sz) * 20 - 0.2, -8.4 * sz, 2.2, 16.8 * sz);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 28 * sz, 0, 24 * sz, G.glow, 0.35 + 0.12 * Math.sin(t * 4));
        if (G.runes) {
          for (let k = 0; k < 3; k++) { const a = t * 2 + k * 2.1; drawGlow(ctx, 28 * sz + Math.cos(a) * 11, Math.sin(a) * 7, 4, G.glow, 0.9); }
        }
        ctx.restore();
        break;
      }
      case 'fist': {
        ctx.fillStyle = shade(o.armor, -0.2); rr(ctx, -2, -5.4, 13, 10.8, 3); ctx.fill();
        ctx.strokeStyle = o.trim; ctx.lineWidth = 1.2; ctx.stroke();
        const g = ctx.createRadialGradient(14, -3, 1, 17, 0, 12); g.addColorStop(0, '#b0b6bc'); g.addColorStop(1, '#4a4f55');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(18, 0, 10, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#6f757c';
        for (let k = -1.5; k <= 1.5; k++) { ctx.beginPath(); ctx.arc(26, k * 4.4, 3.4, 0, TAU); ctx.fill(); ctx.stroke(); }
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(B.glow || '#00e5ff', 0.8); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(12, -8); ctx.lineTo(16, -3); ctx.lineTo(13, 2); ctx.lineTo(18, 7); ctx.stroke();
        drawGlow(ctx, 20, 0, 24, '#00e5ff', 0.22 + 0.1 * Math.sin(t * 4) + (atk >= 0 ? (1 - atk) * 0.7 : 0)); ctx.restore();
        break;
      }
      case 'spear': {
        const th = atk >= 0 ? Math.sin(atk * Math.PI) * 12 : 0;
        ctx.translate(th, 0);
        ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(40, 0); ctx.stroke();
        ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-16, -1); ctx.lineTo(40, -1); ctx.stroke();
        ctx.fillStyle = B.a; poly(ctx, [38, -4.4, 58, 0, 38, 4.4, 42, 0]); ctx.fill();
        ctx.strokeStyle = B.b; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.strokeStyle = '#d84315'; ctx.lineWidth = 1.6;
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(36, 0); ctx.quadraticCurveTo(30, 4 + k * 2.4 + Math.sin(t * 6 + k), 24 - k * 3, 6 + k * 3 + Math.sin(t * 5 + k) * 1.6); ctx.stroke(); }
        ctx.fillStyle = '#f5f5dc'; ctx.beginPath(); ctx.moveTo(34, 2); ctx.lineTo(33, 8); ctx.lineTo(37, 4); ctx.closePath(); ctx.fill();
        glowAdd(ctx, 50, 0, 15, B.glow, 0.45);
        break;
      }
      case 'scythe': {
        ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(38, 0); ctx.stroke();
        ctx.strokeStyle = '#4a4a55'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-14, -1); ctx.lineTo(38, -1); ctx.stroke();
        ctx.fillStyle = bladeGrad(ctx, { a: B.a, b: B.b }, -34, 0);
        ctx.beginPath(); ctx.moveTo(36, -1); ctx.bezierCurveTo(52, -4, 54, -24, 30, -34); ctx.bezierCurveTo(44, -22, 42, -10, 34, -4); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(B.glow, 0.9); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(36, -1); ctx.bezierCurveTo(52, -4, 54, -24, 30, -34); ctx.stroke();
        drawGlow(ctx, 44, -17, 26, B.glow, 0.28 + 0.1 * Math.sin(t * 3));
        for (let k = 0; k < 3; k++) { const ph = (t * 0.7 + k / 3) % 1; drawGlow(ctx, 46 - ph * 8, -8 - ph * 22, 4, B.glow, Math.sin(ph * Math.PI)); }
        ctx.restore();
        break;
      }
      case 'bow': {
        const W = S.bow || {};
        const L = 17 * (W.len || 1);
        const pull = atk >= 0 ? 0 : 5;
        const bc = W.col || '#4e342e', acc = W.arrow || o.accent;
        ctx.translate(-recoil, 0);
        ctx.strokeStyle = bc; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(7, -L); ctx.quadraticCurveTo(22, 0, 7, L); ctx.stroke();
        ctx.strokeStyle = W.vine ? '#8bc34a' : '#a1887f'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(7, -L); ctx.quadraticCurveTo(21, 0, 7, L); ctx.stroke();
        if (W.vine) {
          ctx.strokeStyle = '#33691e'; ctx.lineWidth = 1.2;
          ctx.beginPath(); for (let k = 0; k <= 16; k++) { const u = k / 16, yy = -L + u * 2 * L, xx = 7 + 14 * (1 - Math.pow(2 * u - 1, 2)) * 0.72 + Math.sin(u * 22) * 1.8; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
        }
        if (W.leaves) {
          ctx.fillStyle = '#9ccc65';
          for (let k = 0; k < 4; k++) { const u = 0.12 + k * 0.25, yy = -L + u * 2 * L, xx = 7 + 14 * (1 - Math.pow(2 * u - 1, 2)) * 0.72; ell(ctx, xx + 1.4, yy, 2.6, 1.1, (k % 2 ? 0.8 : -0.8)); ctx.fill(); }
        }
        if (W.storm) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('#e1f5fe', 0.5 + 0.5 * Math.sin(t * 25)); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(8, -L + 2);
          for (let k = 1; k <= 6; k++) ctx.lineTo(8 + 10 * Math.sin(k / 6 * Math.PI) + (hash2(Math.floor(t * 14), k) - 0.5) * 5, -L + 2 + k * (2 * L - 4) / 6);
          ctx.stroke(); drawGlow(ctx, 14, 0, 22, W.glow, 0.28); ctx.restore();
        }
        ctx.fillStyle = acc; ctx.fillRect(10, -1.6, 6, 3.2);
        ctx.strokeStyle = W.vine || W.storm ? rgba(W.glow, 0.95) : 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(7, -L); ctx.lineTo(7 - pull, 0); ctx.lineTo(7, L); ctx.stroke();
        if (atk < 0) {
          ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(7 - pull, 0); ctx.lineTo(31, 0); ctx.stroke();
          ctx.fillStyle = '#e0e0e0';
          ctx.beginPath(); ctx.moveTo(7 - pull, 0); ctx.lineTo(11 - pull, -2); ctx.lineTo(10 - pull, 0); ctx.lineTo(11 - pull, 2); ctx.closePath(); ctx.fill();
          ctx.fillStyle = acc;
          ctx.beginPath(); ctx.moveTo(35, 0); ctx.lineTo(29, -3); ctx.lineTo(29, 3); ctx.closePath(); ctx.fill();
          glowAdd(ctx, 32, 0, 9, acc, 0.6);
        }
        if (W.glow) glowAdd(ctx, 14, 0, 16, W.glow, 0.18);
        break;
      }
      case 'daggers': {
        const dagger = (rot, off) => {
          ctx.save(); ctx.rotate(rot); ctx.translate(0, off);
          ctx.fillStyle = '#212121'; rr(ctx, -2, -1.5, 8, 3, 1); ctx.fill();
          ctx.fillStyle = o.trim; ctx.fillRect(6, -4, 2, 8);
          const bg = ctx.createLinearGradient(0, -3, 0, 3);
          bg.addColorStop(0, '#f5f5f5'); bg.addColorStop(1, '#9e9e9e');
          ctx.fillStyle = bg;
          ctx.beginPath(); ctx.moveTo(8, -2.6); ctx.lineTo(24, -1); ctx.lineTo(30, 0); ctx.lineTo(24, 1.8); ctx.lineTo(8, 2.6); ctx.closePath(); ctx.fill();
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = rgba(o.trim, 0.9); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(9, -2.4); ctx.lineTo(29, 0); ctx.stroke();
          drawGlow(ctx, 22, 0, 12, o.trim, 0.3); ctx.restore();
          ctx.restore();
        };
        dagger(-0.22, -3);
        dagger(0.3, 4);
        break;
      }
      case 'katana': case 'blades':
        dualBlades(ctx, S, o, t, B);
        break;
      case 'claws': {
        const claws = (rot, off) => {
          ctx.save(); ctx.rotate(rot); ctx.translate(0, off);
          ctx.fillStyle = S.skin || '#b83232'; ctx.beginPath(); ctx.arc(3, 0, 4.2, 0, TAU); ctx.fill();
          for (let k = -1; k <= 1; k++) {
            ctx.fillStyle = bladeGrad(ctx, B, -2, 2);
            poly(ctx, [4, k * 3 - 1.5, 20, k * 3.4 - 0.6, 29 + (k === 0 ? 3 : 0), k * 4.4, 20, k * 3.4 + 1.2, 4, k * 3 + 1.5]); ctx.fill();
          }
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, 22, 0, 13, B.glow, 0.32 + 0.1 * Math.sin(t * 6)); ctx.restore();
          if (B.tendril) {
            ctx.strokeStyle = rgba(S.pal.armor, 0.9); ctx.lineWidth = 2; ctx.lineCap = 'round';
            for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(0, k * 3 - 1.5); ctx.quadraticCurveTo(-8, Math.sin(t * 5 + k) * 6, -14, Math.sin(t * 4 + k * 2) * 8); ctx.stroke(); }
          }
          ctx.restore();
        };
        claws(-0.12, -4);
        claws(0.22, 5);
        break;
      }
      case 'rapier': {
        const th = atk >= 0 ? Math.sin(atk * Math.PI) * 10 : 0;
        ctx.translate(th, 0);
        ctx.fillStyle = '#2a0a12'; rr(ctx, -5, -1.6, 12, 3.2, 1.2); ctx.fill();
        ctx.fillStyle = o.trim; ctx.beginPath(); ctx.arc(-5, 0, 2.2, 0, TAU); ctx.fill();
        ctx.strokeStyle = o.trim; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.ellipse(8, 0, 3, 6.4, 0, -Math.PI / 2, Math.PI / 2, true); ctx.stroke();
        ctx.fillStyle = '#1a0a10'; poly(ctx, [7, -6, 11, -11, 10, -5]); ctx.fill(); poly(ctx, [7, 6, 11, 11, 10, 5]); ctx.fill();
        ctx.fillStyle = bladeGrad(ctx, B, -1.4, 1.4);
        poly(ctx, [11, -1.5, 56, -0.6, 64, 0, 56, 0.6, 11, 1.5]); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(B.glow, 0.95); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(62, 0); ctx.stroke();
        drawGlow(ctx, 40, 0, 26, B.glow, 0.28 + 0.1 * Math.sin(t * 4));
        for (let k = 0; k < 3; k++) { const ph = (t * 1.2 + k / 3) % 1; drawGlow(ctx, 20 + ph * 40, 2 + ph * 5, 2.6, B.glow, Math.sin(ph * Math.PI)); }
        ctx.restore();
        break;
      }
      case 'glitch': {
        const cols = ['#76ff03', '#ff00e6', '#00e5ff', '#ffffff'];
        const fr = Math.floor(t * 14);
        ctx.fillStyle = '#111'; rr(ctx, -5, -2, 14, 4, 1.4); ctx.fill();
        ctx.fillStyle = '#76ff03'; ctx.fillRect(0, -2, 1.6, 4); ctx.fillRect(4, -2, 1.6, 4);
        ctx.fillStyle = '#ff00e6'; ctx.fillRect(9, -7, 3, 14);
        for (let k = 0; k < 10; k++) {
          const x = 12 + k * 4.6, h = 6 - k * 0.3;
          const jit = hash2(fr, k) > 0.8 ? (hash2(fr, k + 9) - 0.5) * 6 : 0;
          ctx.fillStyle = cols[(k + (hash2(fr, k + 3) > 0.7 ? fr : 0)) % 4];
          ctx.fillRect(x, -h / 2 + jit, 4.2, h);
          if (hash2(fr, k + 20) > 0.85) { ctx.globalAlpha = 0.45; ctx.fillRect(x + 3, -h / 2 + jit - 3, 7, 1.6); ctx.globalAlpha = 1; }
        }
        glowAdd(ctx, 34, 0, 22, '#76ff03', 0.25); glowAdd(ctx, 38, 0, 18, '#ff00e6', 0.2);
        break;
      }
      case 'totem': case 'staff': default: {
        const sh = S.weapon === 'totem' ? 'orb' : (S.staffHead || 'orb');
        const col = S.orb || '#ba68c8';
        ctx.translate(-recoil, 0);
        const shaft = (len, c1, c2) => {
          ctx.strokeStyle = c1; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(len, 0); ctx.stroke();
          ctx.strokeStyle = c2; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(-8, -1); ctx.lineTo(len, -1); ctx.stroke();
        };
        if (sh === 'orb') {
          shaft(34, '#5d4037', '#8d6e63');
          ctx.strokeStyle = o.trim; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.arc(37, 0, 7.5, -Math.PI * 0.62, Math.PI * 0.62); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(30, -2); ctx.lineTo(30, 2); ctx.stroke();
          if (S.weapon === 'totem') {
            ctx.strokeStyle = '#80cbc4'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(26, 2); ctx.quadraticCurveTo(24, 8, 27, 12); ctx.stroke();
            ctx.fillStyle = '#f5f5dc';
            ctx.beginPath(); ctx.moveTo(22, 2); ctx.lineTo(20, 8); ctx.lineTo(24, 4); ctx.closePath(); ctx.fill();
          }
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const pu = 1 + 0.15 * Math.sin(t * 5);
          drawGlow(ctx, 37, 0, 22 * pu, col, 0.55);
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(37, 0, 3 * pu, 0, TAU); ctx.fill();
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(37, 0, 5, 0, TAU); ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
          for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.09; drawGlow(ctx, 37 + Math.cos(a) * 9, Math.sin(a) * 4.5, 4, col, 0.9); }
          ctx.restore();
        } else if (sh === 'crystal') {
          shaft(32, '#3a2a6a', '#6a4fc0');
          ctx.strokeStyle = o.trim; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(34, 0, 4, 0, TAU); ctx.stroke();
          const by = Math.sin(t * 2.4) * 1.6, cx = 43;
          ctx.save(); ctx.translate(cx, by);
          const g = ctx.createLinearGradient(-6, 0, 6, 0); g.addColorStop(0, '#f3e5f5'); g.addColorStop(0.5, col); g.addColorStop(1, '#4a148c');
          ctx.fillStyle = g; poly(ctx, [0, -11, 6, 0, 0, 11, -6, 0]); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 11); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, 0, 0, 24, col, 0.6);
          ctx.strokeStyle = rgba(col, 0.8); ctx.lineWidth = 1; ell(ctx, 0, 0, 12, 4.4, t * 0.8); ctx.stroke(); ell(ctx, 0, 0, 12, 4.4, -t * 0.8 + 1.4); ctx.stroke();
          ctx.restore(); ctx.restore();
        } else if (sh === 'cross') {
          shaft(34, '#8d6e63', '#d7ccc8');
          ctx.fillStyle = '#ffd54f'; ctx.fillRect(34, -2, 12, 4); ctx.fillRect(38, -8, 4, 16);
          ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(40, 0, 1.8, 0, TAU); ctx.fill();
          glowAdd(ctx, 40, 0, 20, '#69f0ae', 0.45 + 0.12 * Math.sin(t * 4));
          for (let i = 0; i < 2; i++) { const a = t * 2.4 + i * Math.PI; glowAdd(ctx, 40 + Math.cos(a) * 8, Math.sin(a) * 5, 3.4, '#b9f6ca', 0.9); }
        } else if (sh === 'sun') {
          shaft(32, '#a1887f', '#ffe0b2');
          ctx.save(); ctx.translate(40, 0);
          glowAdd(ctx, 0, 0, 24, col, 0.5);
          ctx.fillStyle = '#ffc107';
          for (let k = 0; k < 10; k++) { ctx.save(); ctx.rotate(t * 0.8 + k * TAU / 10); poly(ctx, [6, -1.6, 12, 0, 6, 1.6]); ctx.fill(); ctx.restore(); }
          const g = ctx.createRadialGradient(-1, -1, 1, 0, 0, 6.4); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ffc107');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
          ctx.restore();
        } else if (sh === 'ankh') {
          shaft(34, '#ffd54f', '#fff8e1');
          ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.moveTo(30, -7); ctx.lineTo(30, 7); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(41, 0, 6, 4.4, 0, 0, TAU); ctx.stroke();
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(41, 0, 6, 4.4, 0, 0, TAU); ctx.stroke();
          glowAdd(ctx, 38, 0, 28, col, 0.5 + 0.12 * Math.sin(t * 4));
          for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + i / 4) % 1; glowAdd(ctx, 38 + Math.cos(i * 1.7) * 9, -ph * 14, 2.4, '#ffffff', Math.sin(ph * Math.PI)); }
        } else if (sh === 'blossom') {
          ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-8, 0); for (let k = 0; k <= 12; k++) ctx.lineTo(-8 + k * 3.7, Math.sin(k * 0.9) * 1.8); ctx.stroke();
          ctx.fillStyle = '#81c784'; ell(ctx, 18, 3, 3, 1.3, 0.8); ctx.fill(); ell(ctx, 8, -3, 3, 1.3, -0.8); ctx.fill();
          ctx.save(); ctx.translate(40, 0);
          glowAdd(ctx, 0, 0, 24, '#f8bbd0', 0.45);
          for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate(t * 0.5 + k * TAU / 6); ctx.fillStyle = k % 2 ? '#f8bbd0' : '#fce4ec'; ell(ctx, 6, 0, 5, 2.8); ctx.fill(); ctx.restore(); }
          ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
          ctx.restore();
        } else if (sh === 'sunflower') {
          shaft(34, '#558b2f', '#9ccc65');
          ctx.fillStyle = '#7cb342'; ell(ctx, 18, 3.4, 4, 1.6, 0.7); ctx.fill();
          ctx.save(); ctx.translate(40, 0);
          glowAdd(ctx, 0, 0, 20, '#ffeb3b', 0.35);
          for (let k = 0; k < 12; k++) { ctx.save(); ctx.rotate(k * TAU / 12 + Math.sin(t * 2) * 0.05); ctx.fillStyle = k % 2 ? '#ffeb3b' : '#ffc107'; ell(ctx, 8, 0, 4.4, 2); ctx.fill(); ctx.restore(); }
          ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.arc(0, 0, 4.2, 0, TAU); ctx.fill();
          ctx.fillStyle = '#3e2723'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(Math.cos(k * 1.3) * 2, Math.sin(k * 1.3) * 2, 0.7, 0, TAU); ctx.fill(); }
          ctx.restore();
        } else if (sh === 'archon') {
          shaft(32, '#cfd8dc', '#ffffff');
          ctx.strokeStyle = '#e3f2fd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(34, 0, 4, 0, TAU); ctx.stroke();
          const by = Math.sin(t * 2.2) * 1.4;
          ctx.save(); ctx.translate(44, by);
          const g = ctx.createLinearGradient(-6, 0, 6, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#40c4ff'); g.addColorStop(1, '#0d47a1');
          ctx.fillStyle = g; poly(ctx, [0, -10, 5.4, -3, 5.4, 3, 0, 10, -5.4, 3, -5.4, -3]); ctx.fill();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, 0, 0, 26, col, 0.55);
          ctx.strokeStyle = rgba('#e3f2fd', 0.9); ctx.lineWidth = 1.2;
          ell(ctx, 0, 0, 13, 4.6, t * 0.9); ctx.stroke(); ell(ctx, 0, 0, 9, 3.2, -t * 1.2); ctx.stroke(); ctx.restore();
          ctx.restore();
        } else if (sh === 'wolf') {
          shaft(34, '#4e342e', '#8d6e63');
          ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1.6;
          for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(30, 1); ctx.quadraticCurveTo(28 - k * 2, 6 + k * 2 + Math.sin(t * 5 + k), 25 - k * 3, 9 + k * 3); ctx.stroke(); }
          ctx.save(); ctx.translate(41, 0);
          glowAdd(ctx, 0, 0, 22, col, 0.4 + 0.1 * Math.sin(t * 4));
          ctx.fillStyle = '#eceff1'; ell(ctx, 0, 0, 6.4, 5.4); ctx.fill();
          poly(ctx, [4, -3.6, 13, -1.8, 13, 1.8, 4, 3.6]); ctx.fill();
          poly(ctx, [-3, -4.6, -4, -10, 0, -5.6]); ctx.fill(); poly(ctx, [-3, 4.6, -4, 10, 0, 5.6]); ctx.fill();
          ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(12.4, 0, 1.3, 0, TAU); ctx.fill();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(2, -2.4, 1.4, 0, TAU); ctx.arc(2, 2.4, 1.4, 0, TAU); ctx.fill(); drawGlow(ctx, 2, 0, 8, col, 0.7); ctx.restore();
          ctx.fillStyle = '#fff'; poly(ctx, [8, -3, 9.6, -5.6, 10.6, -2.8]); ctx.fill(); poly(ctx, [8, 3, 9.6, 5.6, 10.6, 2.8]); ctx.fill();
          ctx.restore();
        }
        break;
      }
    }
  }

  // Karo paletleri
  const TILE_PALETTE = {
    grass: { top0: '#5da24a', top1: '#2f6b2b', leftTop: '#2a4a20', leftBot: '#142610', rightTop: '#355c28', rightBot: '#1a3314', lip: '#6bb457', lipDark: '#3f7a35' },
    path: { top0: '#a3835f', top1: '#74583b', leftTop: '#4e3a26', leftBot: '#261a10', rightTop: '#5f4730', rightBot: '#31230f', lip: null },
    rock: { top0: '#7a838b', top1: '#4d565d', leftTop: '#363c42', leftBot: '#16191c', rightTop: '#464e55', rightBot: '#1e2226', lip: null },
    // Kalıcı kıta biyomları (SetraWorldCore.sample -> karo tipi)
    water: { top0: '#2f7fa3', top1: '#1c5570', leftTop: '#174257', leftBot: '#0a2130', rightTop: '#1d4e66', rightBot: '#0d2635', lip: null },
    deep: { top0: '#173a52', top1: '#0d2434', leftTop: '#0d2230', leftBot: '#050f16', rightTop: '#112a3b', rightBot: '#07141d', lip: null },
    sand: { top0: '#c9b27a', top1: '#a8925f', leftTop: '#7a6a45', leftBot: '#42381f', rightTop: '#8f7c52', rightBot: '#514426', lip: null },
    snow: { top0: '#e6eef0', top1: '#c6d6da', leftTop: '#93a6ad', leftBot: '#5c6d74', rightTop: '#aabcc2', rightBot: '#6c7f87', lip: null },
    ash: { top0: '#5a5550', top1: '#3c3835', leftTop: '#2c2926', leftBot: '#141210', rightTop: '#37332f', rightBot: '#1c1917', lip: null },
    swamp: { top0: '#4a5a3d', top1: '#33402b', leftTop: '#26301f', leftBot: '#121810', rightTop: '#2e3a25', rightBot: '#171d13', lip: null },
    cursed: { top0: '#4d3f5c', top1: '#33283f', leftTop: '#241b2d', leftBot: '#100b15', rightTop: '#2e2339', rightBot: '#171020', lip: null }
  };

  // ==========================================================================
  // MOTOR
  // ==========================================================================
  class TravelEngine {

    // TravelSkills.js buradan kaydolur (Q/E/R davranışları).
    static registerClassSkills(name, handlers) { registerClassSkills(name, handlers); }
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.sound = new SoundFX();
      this.time = 0;
      this.timeouts = new Set();

      this.playerData = options.player || {
        name: 'Adventurer',
        class: 'Warrior',
        level: 12,
        stats: {
          attack: 65, critChance: 0.22, critMultiplier: 2.2, speed: 210, omnivamp: 0.12,
          defense: 25, maxHp: 527, currentHp: 527, maxMana: 34, currentMana: 34, gold: 50
        }
      };

      this.zoneName = options.zoneName || 'Verdant Wilds - Normal';
      this.onBackToTown = options.onBackToTown || (() => console.log('Back to Town'));
      this.onInteract = options.onInteract || (() => console.log('Interact E'));
      this.onStatsChange = options.onStatsChange || null;
      // Diğer oyuncuların efektleri: yerel tercih + yayın kancası.
      this.allyFxEnabled = options.allyFxEnabled !== false;
      this.onAllyAction = options.onAllyAction || null;
      this.onLevelUp = options.onLevelUp || null;
      // Arayüz menüsü açıkken dünya güncellemesini durdurur (çizim sürer).
      this.uiPaused = false;

      this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.zoom = 1;
      this.zoomTarget = 1;
      this._errLogged = false;
      this.shake = { trauma: 0, x: 0, y: 0 };
      this.hurt = 0;
      this.dustTimer = 0;
      this.dpr = 1;
      // 3D dekorun dünya ölçeğine ek çarpanı. Kalıcı kıtada 1; rastgele
      // seferlerde < 1 (setWorldBounds ayarlar) → ağaç/kaya "dev" görünmez.
      this.decorScale = 1;
      this.tileSprites = {};
      this.stars = [];
      this.scratch = document.createElement('canvas'); // canavar sprite'ı için ara tuval
      this.sctx = this.scratch.getContext('2d');

      this.resize();
      this.boundResize = () => this.resize();
      window.addEventListener('resize', this.boundResize);

      const archetype = getArchetype(this.playerData.class);
      this.player = {
        x: 0, y: 0, z: 0, radius: 18, facingAngle: 0, vx: 0, vy: 0,
        baseSpeed: this.playerData.stats.speed || 200,
        archetype,
        style: getClassStyle(this.playerData.class),
        isDashing: false, dashTimer: 0, dashDuration: COMBAT_CFG.dash.duration, dashCooldown: COMBAT_CFG.dash.cooldown, dashCooldownTimer: 0, dashVx: 0, dashVy: 0, channel: null,
        attackCooldown: 1 / this.computeAttackPerSecond(), attackCooldownTimer: 0, isAttacking: false, attackAnimTimer: 0,
        cooldowns: { q: { max: 4.0, current: 0 }, e: { max: 7.0, current: 0 }, r: { max: 14.0, current: 0 } },
        ghostTrails: [], footprintTimer: 0,
        walkPhase: 0, swingDir: 1,
        // --- Savunma / dayanıklılık (Deepwoken esintili) ---
        // parryPhase: idle -> startup -> window -> block -> idle
        parryPhase: 'idle', parryTimer: 0, parryHeld: false, parryRecovery: 0, parrySuccessAt: -99,
        counterUntil: -99,
        guard: 0, guardDecayDelay: 0, guardVisible: 0, guardbreakTimer: 0,
        stamina: COMBAT_CFG.stamina.max, staminaMax: COMBAT_CFG.stamina.max,
        staminaIdle: 0, sprinting: false,
        dodgeIframes: 0, lastDodgeAt: -99,
        // Silah animasyonu: kind 'swing' | 'slash' | 'slam' | 'thrust' | 'spin' | 'cast'
        weaponSwing: null,
        // TravelSkills (yeni Q/E/R seti) için durum alanları:
        invuln: 0, phase: 0, skillLock: 0, speedMul: 1, hasteMul: 1
      };
      // Savunma dengesi (instance kopyası: canlıda güvenle değiştirilebilir).
      this.combatCfg = {
        parry: Object.assign({}, COMBAT_CFG.parry),
        guard: Object.assign({}, COMBAT_CFG.guard),
        stamina: Object.assign({}, COMBAT_CFG.stamina),
        dash: Object.assign({}, COMBAT_CFG.dash),
        sprint: Object.assign({}, COMBAT_CFG.sprint),
        telegraph: Object.assign({}, COMBAT_CFG.telegraph),
      };
      // Düşük seviye efektlerde kapalı; yeni sistemlerde kullanılıyor.
      this.lastDodgeTime = -99;
      this._hitstop = 0;
      this._hitstopCooldown = 0;
      // Savaş göstergeleri (oyuncunun yanında beliren küçük simgeler).
      this.combatIndicators = [];
      // Travel-only combat state (never touched by turn-based combat).
      this.arpgSkills = {};
      this.travelBiomes = {};
      // Mana rengi (skill görünümü): sahip olunan/aktif efekt.
      this.skins = {};
      this.skin = null;
      this.biome = 'verdant';
      this.biomeDef = null;
      this.playerShield = 0;
      this.playerShieldMax = 0;
      this.playerShieldTimer = 0;
      // ARPG buff'ları: { stat, pct, duration, timer, color, name }
      this.playerBuffs = [];
      this.playerStatuses = {};
      this.playerSlowMult = 1;
      this._respawnQueue = [];
      // Yeni ultimate türleri (R): yörüngede dönen silahlar + zincir şimşeği.
      this.orbitAura = null;
      this.chainFx = [];

      this.companion = {
        active: archetype === ARCHETYPES.TAMER,
        name: 'Gölge Kurdu', x: -40, y: -40, vx: 0, vy: 0, radius: 12, speed: 240,
        target: null, attackCooldown: 0, animFrame: 0, face: 1, moving: false
      };

      this.keys = {};
      this.mouse = { screenX: this.width / 2, screenY: this.height / 2, worldX: 0, worldY: 0, isDown: false };
      // Dokunmatik nişan: joystick/ekran dokunuşu yön verir (mouse yoksa).
      // (this.isTouch ilk resize() çağrısında belirlenir.)
      this.touchAim = null;   // { x, y } dünya uzayında birim yön
      this.aimOverride = null; // { x, y, t } — tek seferlik hedef (mobil ATK gibi)
      this.initInput();

      this.tileSize = options.tileSize || 64;
      this.tileThickness = 28;
      this.mapRadius = options.mapRadius || 14;
      // Sunucu karosu -> dünya pikseli ölçeği (setWorldBounds gerçek değeri verir).
      this.worldScale = this.tileSize;
      this.tiles = [];
      this.tileMap = new Map();
      this.scenery = [];
      this.generateMap();

      // Sunucu dünyası eşlemesi (adapter tarafından doldurulur).
      this.serverSpawn = { x: 0, y: 0 };
      this.others = {};
      this.poiMarkers = [];
      // Mini harita (kayıtlı tuvaller) + önbelleğe alınmış kuş bakışı zemin.
      this.minimaps = [];
      this._miniBase = null;
      this._miniBaseKey = '';
      this.onMove = options.onMove || null;
      this._lastMoveEmit = 0;
      this.onKill = options.onKill || null;
      this.onHpChange = options.onHpChange || null;
      this._lastHpSent = null;
      this._hpSendTimer = 0;
      this._hpFromServer = false;
      this._down = false;
      // Sunucu onaylı yere düşme durumu (yere yatar, hareket/saldırı kapalı).
      this.downed = false;
      this.onDown = options.onDown || null;
      // Yakındaki düşmüş müttefiki diriltme.
      this.onRevive = options.onRevive || null;
      this._reviveTarget = null;
      this._reviveName = null;

      this.monsters = [];
      // ORTAK DÜNYA: sunucu otoritesinde canavar listesi varsa yerel spawn kapalı.
      this.sharedMobs = !!options.sharedMobs;
      this._sharedMap = new Map();
      // Biyom tablosu henüz gelmediyse eski varsayılan akış kullanılır.
      this.spawnMonsters(3);

      this.projectiles = [];
      this.slashes = [];
      this.aoeEffects = [];
      // Menzil göstergeleri (LoL tarzı): tuşa basınca kısa süre zeminde görünür.
      // Yalnızca yerel oyuncuya çizilir; sunucuya gönderilmez.
      this.rangePings = [];
      this.damageNumbers = [];
      this.particles = [];
      this.impacts = [];
      this.ambientMotes = [];
      this.initAmbientMotes(this.isTouch ? 16 : 35);

      // Hava durumu: zaman zaman yağmur yağar (ses + görsel). Oyunu etkilemez.
      this.weather = 'clear';
      this._weatherTimer = 40 + Math.random() * 70;
      this.rainDrops = [];
      this._weatherNight = false;

      this.snapCamera();

      this.lastTime = performance.now();
      this.isRunning = true;
      this._destroyed = false;
      // Uyarlanabilir efekt seviyesi: kare süresi uzarsa ağır görseller seyreltilir.
      // Mobilde başlangıçta düşük efekt modu (pil/ısı ve FPS için).
      this.lowFx = !!this.isTouch;
      this._fpsAcc = 0;
      this._fpsN = 0;
      // Sekme arka plandayken tarayıcı rAF'i ~1 Hz'e kısar; simülasyonun
      // tamamen durmaması için küçük bir aralıkla güncellemeye devam et.
      if (this._bgTimer) clearInterval(this._bgTimer);
      this._bgTimer = setInterval(() => {
        if (!this.isRunning || this._destroyed || !document.hidden) return;
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.25);
        this.lastTime = now;
        try { this.update(dt); } catch (e) { /* arka plan hatası oyunu durdurmasın */ }
      }, 200);
      this.loop = this.loop.bind(this);
      // İlk kare de doğru yakınlıkta çizilsin (1 karelik "çok uzak" sıçraması olmasın).
      if (!this._zoomInit && this.height > 0) {
        this._zoomInit = true;
        const dz = this.getDefaultZoom();
        this.zoom = dz;
        this.zoomTarget = dz;
      }
      // İlk kareyi senkron çiz: canvas oluşturulduğu anda boş/siyah kalmasın.
      try { this.render(); } catch (e) { /* ilk kare hatası döngüyü engellemesin */ }
      requestAnimationFrame(this.loop);
    }

    // --- Küçük yardımcılar ---
    iso(wx, wy, wz = 0) { return worldToScreen(wx, wy, wz, this.camera); }

    // Ekran koordinatını (zoom uygulanmış) dünya koordinatına çevirir.
    screenWorld(sx, sy) {
      const z = this.zoom || 1;
      const cx = this.width / 2, cy = this.height / 2;
      return screenToWorld(cx + (sx - cx) / z, cy + (sy - cy) / z, this.camera);
    }

    // Zoom sınırları dikeyde GÖRÜNEN KARO SIRASINA göre hesaplanır.
    // Bir karo sırasının ekran yüksekliği (zoom = 1): tileSize * SIN_30 = 32 px.
    //
    // İKİ AYRI KAMERA: kalıcı kıtada yakın/atmosferik (~10 sıra), rastgele
    // seferlerde ise eski geniş kamera (~28 sıra). Sefer haritaları küçük
    // olduğu için yakın kamerada ağaç/kayalar ekranı doldurup "her şey dev"
    // görünüyordu; kalıcı kıta ise geniş kamerada boş/cılız kalıyordu.
    zoomRowH() { return Math.max(12, (this.tileSize || 64) * SIN_30); }

    // Dikeyde `rows` karo sırası görünecek zoom değeri.
    zoomForRows(rows) {
      const h = Number.isFinite(this.height) && this.height > 0 ? this.height : 900;
      return h / (Math.max(1, Number(rows) || 1) * this.zoomRowH());
    }

    // Moda göre görünmesi gereken karo sırası: min = en uzak, def = başlangıç,
    // max = en yakın. (Satır sayısı büyükse kamera uzaktır.)
    // MAX zoom iki modda da aynı (6.5 sıra): kıtadaki gibi yakına gelinebilsin.
    camRows() {
      return this.persistent
        ? { min: 17.25, def: 10, max: 6.5 }
        : { min: 30, def: 20, max: 6.5 };
    }

    // En fazla uzaklaşma.
    getMinZoom() {
      const rows = this.camRows().min;
      return clamp(this.zoomForRows(rows), 0.5, 3.2);
    }

    // En fazla yakınlaşma.
    getMaxZoom() {
      const lo = this.getMinZoom();
      return Math.max(lo + 0.2, Math.min(6.2, this.zoomForRows(this.camRows().max)));
    }

    // İlk açılış yakınlığı (moda göre).
    getDefaultZoom() { return this.clampZoomTarget(this.zoomForRows(this.camRows().def)); }
    clampZoomTarget(v) {
      const lo = this.getMinZoom(), hi = this.getMaxZoom();
      return clamp(Number.isFinite(v) ? v : 1, lo, hi);
    }

    // Mod değişiminde (kıta ↔ rastgele sefer) kamerayı yeni modun varsayılan
    // yakınlığına oturt: seferde kıtanın yakın kamerası kalmasın.
    resetZoomForMode() {
      const dz = this.getDefaultZoom();
      this.zoom = dz;
      this.zoomTarget = dz;
      this._zoomInit = true;
    }

    later(fn, ms) {
      const id = setTimeout(() => { this.timeouts.delete(id); if (this.isRunning) fn(); }, ms);
      this.timeouts.add(id);
    }

    groundZAt(x, y) {
      if (this.persistent && this.worldCore) {
        const b = this.persistentBounds, w = this._persWindow, ts = this.tileSize;
        if (b && w) {
          const gi = Math.floor((x - b.minX) / ts), gj = Math.floor((y - b.minY) / ts);
          const t = this.tileMap.get(gi * 100000 + gj);
          if (t) return t.wz;
        }
        const sv = this.worldToServer(x, y);
        const s = this.worldCore.sample(sv.x, sv.y);
        return s.water ? 0 : clamp(Math.round((s.height || 0) / 10) * 10, 0, 120);
      }
      const t = this.tileMap.get(Math.round(x / this.tileSize) * 1000 + Math.round(y / this.tileSize));
      return t ? t.wz : 0;
    }

    // Dünya görsel ayarları (GameCraft > Dünya Kurucu). Yoksa makul varsayılan.
    worldTuning() {
      const v = (this.worldConfig && this.worldConfig.visual) || {};
      const ts = Number(v.treeScale);
      const ss = Number(v.structureScale);
      return {
        treeScale: ts > 0 ? ts : 3.0,
        structureScale: ss > 0 ? ss : 2.6
      };
    }

    // TÜR/MODEL bazlı GLOBAL ölçek çarpanı (Dünya Kurucu > "Tür Ölçekleri").
    // Anahtar = model ('oak','bush','farmhouse'...) ya da tür ('tree','bush'...).
    typeScaleOf(key) {
      if (!key) return 1;
      const m = (this.worldConfig && this.worldConfig.visual && this.worldConfig.visual.typeScales) || null;
      if (!m) return 1;
      const v = Number(m[key]);
      return Number.isFinite(v) && v > 0 ? v : 1;
    }

    // Her sahne nesnesine tür çarpanını uygular. Nesnenin KENDİ ölçeği
    // `_baseScale` olarak bir kez saklanır → çağrı tekrarları idempotent kalır
    // ve her nesne kendi boyutuna göre birlikte büyür (eşitlenmez).
    applyTypeScales() {
      const scenery = this.scenery || [];
      for (let i = 0; i < scenery.length; i++) {
        const s = scenery[i];
        if (!s) continue;
        if (s._baseScale === undefined) s._baseScale = Number(s.scale) > 0 ? Number(s.scale) : 1;
        const g = this.typeScaleOf(s.model || s.type);
        s.scale = s._baseScale * g;
      }
    }

    snapCamera() {
      if (!this.player) return;
      const px = Number.isFinite(this.player.x) ? this.player.x : 0;
      const py = Number.isFinite(this.player.y) ? this.player.y : 0;
      this.player.x = px; this.player.y = py;
      const ts = worldToScreen(px, py, 0, { x: 0, y: 0 });
      const w = Number.isFinite(this.width) ? this.width : 800;
      const h = Number.isFinite(this.height) ? this.height : 600;
      this.camera.targetX = Number.isFinite(ts.x) ? w / 2 - ts.x : 0;
      this.camera.targetY = Number.isFinite(ts.y) ? h / 2 - ts.y : 0;
      this.camera.x = this.camera.targetX;
      this.camera.y = this.camera.targetY;
      this._camShakeX = 0;
      this._camShakeY = 0;
      this._walkBobOffset = 0;
    }

    // --- BOYUTLANDIRMA ---
    resize(force) {
      const rect = this.canvas.getBoundingClientRect();
      const parent = this.canvas.parentElement;
      const pw = (parent && parent.clientWidth) || 0;
      const ph = (parent && parent.clientHeight) || 0;
      const w = Math.max(320, Math.round(rect.width || pw || window.innerWidth));
      const h = Math.max(240, Math.round(rect.height || ph || window.innerHeight));
      // Dokunmatik/alt seviye cihazlarda piksel oranını sınırla: mobilde 2x buffer
      // 4x piksel demek; bu tek başına büyük FPS kaybı yaratıyordu.
      const coarse = (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches)
        || (navigator && navigator.maxTouchPoints > 0);
      this.isTouch = !!coarse;
      const dprCap = coarse ? 1.5 : 2;
      const newDpr = Math.min(window.devicePixelRatio || 1, dprCap);
      // Boyut değişmediyse canvas buffer'ını yeniden ayırma. Bu hem gereksiz
      // temizleme/kamera sıçramasını hem de kısa siyah kırpışmayı önler.
      if (!force && this.width === w && this.height === h && this.dpr === newDpr) return;
      this.width = w;
      this.height = h;
      if (newDpr !== this.dpr) this.tileSprites = {};
      this.dpr = newDpr;
      // Boyuta bağlı gradyan önbellekleri geçersiz.
      this._bgGradKey = null; this._bgGrad = null;
      this._vigKey = null; this._vigGrad = null;
      this._fogKey = null; this._fogGrad = null;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.scratch.width = Math.ceil(200 * this.dpr);
      this.scratch.height = Math.ceil(200 * this.dpr);

      // Yıldız tarlası (arka plan)
      const rnd = mulberry32(777);
      this.stars = [];
      const n = Math.floor((this.width * this.height) / 9000);
      for (let i = 0; i < n; i++) {
        this.stars.push({ x: rnd() * this.width, y: rnd() * this.height, r: 0.4 + rnd() * 1.1, a: 0.15 + rnd() * 0.5, tw: rnd() * 6 });
      }
      // Boyut değişince kamera hedefi de güncellenmeli (oyuncu ortada kalsın).
      if (this.player) this.snapCamera();
      // Buffer yeniden ayrıldığında bir sonraki kareyi beklemeden çiz:
      // yeniden boyutlandırma sırasında kısa siyah kırpışmayı önler.
      if (this.isRunning) { try { this.render(); } catch (e) {} }
    }

    // --- GİRDİ ---
    initInput() {
      this._onKeyDown = (e) => {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.code] = true;
        // Basılı tutma (repeat) yetenekleri tekrar tekrar tetiklemesin.
        if (e.repeat) return;
        if (e.code === 'Space') { e.preventDefault(); this.triggerDash(); }
        // F = parry / blok (basılı tutunca blok, doğru zamanda basınca kusursuz parry).
        if (e.key.toLowerCase() === 'f') { e.preventDefault(); this.parryPress(); }
        if (e.key.toLowerCase() === 'q') this.triggerSkill('q');
        if (e.key.toLowerCase() === 'e') {
          // Önce yakındaki düşmüş müttefiki dirilt.
          if (this._reviveTarget) { const id = this._reviveTarget; this._reviveTarget = null; if (this.onRevive) this.onRevive(id); return; }
          if (this.checkInteractionNearPlayer()) this.onInteract(this._interactTarget || null);
          else this.triggerSkill('e');
        }
        if (e.key.toLowerCase() === 'r') this.triggerSkill('r');
      };
      this._onKeyUp = (e) => {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.code] = false;
        if (e.key.toLowerCase() === 'f') this.parryRelease();
      };
      this._onMouseMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.screenX = e.clientX - rect.left;
        this.mouse.screenY = e.clientY - rect.top;
        const w = this.screenWorld(this.mouse.screenX, this.mouse.screenY);
        this.mouse.worldX = w.x;
        this.mouse.worldY = w.y;
      };
      this._onMouseDown = (e) => {
        if (e.button === 0) { this.mouse.isDown = true; this.triggerPrimaryAttack(); }
      };
      this._onMouseUp = (e) => { if (!e || e.button === 0 || e.button === undefined) this.mouse.isDown = false; };
      this._onBlur = () => {
        this.mouse.isDown = false;
        // Odak kaybında tuşlar "basılı" kalmasın: F basılı kalmışsa parry/blok
        // makinesi kilitleniyordu.
        this.keys = {};
        try { this.parryRelease(); } catch (e) {}
      };
      this._onContext = (e) => e.preventDefault();
      // Dokunmatik: parmakla gösterilen noktaya nişan al (joystick yönü öncelikli).
      this._onTouch = (e) => {
        const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
        if (!t) return;
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.screenX = t.clientX - rect.left;
        this.mouse.screenY = t.clientY - rect.top;
        const w = this.screenWorld(this.mouse.screenX, this.mouse.screenY);
        this.mouse.worldX = w.x;
        this.mouse.worldY = w.y;
        // Dokunmatikte basılı tutmak da otomatik saldırı sayılır.
        this.mouse.isDown = e.type === "touchstart" || e.type === "touchmove";
        this.aimAtWorld(w.x, w.y, 1.2);
      };
      this._onWheel = (e) => {
        e.preventDefault();
        this.zoomTarget = this.clampZoomTarget(this.zoomTarget + (e.deltaY > 0 ? -0.1 : 0.1));
      };

      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
      this.canvas.addEventListener('mousemove', this._onMouseMove);
      this.canvas.addEventListener('mousedown', this._onMouseDown);
      this.canvas.addEventListener('mouseup', this._onMouseUp);
      // İmleç tuvalin dışında bırakılırsa da "basılı" durumu sıfırla.
      window.addEventListener('mouseup', this._onMouseUp);
      window.addEventListener('blur', this._onBlur);
      this.canvas.addEventListener('contextmenu', this._onContext);
      this.canvas.addEventListener('touchstart', this._onTouch, { passive: true });
      this.canvas.addEventListener('touchmove', this._onTouch, { passive: true });
      this.canvas.addEventListener('touchend', this._onMouseUp, { passive: true });
      this.canvas.addEventListener('touchcancel', this._onMouseUp, { passive: true });
      if (this.canvas.style) this.canvas.style.touchAction = 'none';
      this.canvas.addEventListener('wheel', this._onWheel, { passive: false });
      this._prevCursor = this.canvas.style ? this.canvas.style.cursor : '';
      if (this.canvas.style) this.canvas.style.cursor = 'none';

      // Sekme arka plana alınıp geri dönünce oyun devam etsin: rAF durur,
      // dönüşte büyük dt sıçraması yapmadan zamanı sıfırla (tarayıcı rAF'i
      // kendisi devam ettirir; ikinci bir döngü başlatmayız).
      this._onVisibility = () => {
        if (document.hidden) return;
        this.lastTime = performance.now();
        if (this.isRunning && this.canvas && this.canvas.width > 0) {
          try { this.update(0.0001); this.render(); } catch (e) {}
        }
      };
      document.addEventListener('visibilitychange', this._onVisibility);
      window.addEventListener('focus', this._onVisibility);
    }

    // ======================================================================
    // HARİTA
    // ======================================================================
    generateMap() {
      this.tiles = [];
      this.tileMap = new Map();
      this.scenery = [];
      this.solids = [];
      if (this.persistent && this.worldCore) { this.generatePersistentMap(); return; }
      // Bozuk/eksik yarıçap gelirse güvenli varsayılana dön.
      const R = Number.isFinite(this.mapRadius) ? Math.max(6, Math.min(70, Math.floor(this.mapRadius))) : 14;
      this.mapRadius = R;

      for (let gx = -R; gx <= R; gx++) {
        for (let gy = -R; gy <= R; gy++) {
          const dist = Math.sqrt(gx * gx + gy * gy);
          if (dist > R + 0.3) continue;

          const wx = gx * this.tileSize;
          const wy = gy * this.tileSize;

          let type = 'grass';
          const isPath = Math.abs(gx + gy) <= 1 || (Math.abs(gx - gy) <= 1 && dist < 4);
          if (isPath) type = 'path';

          // --- Rastgele yükseklik (tepe/plato) ---
          // Düşük frekanslı iki gürültü katmanı birleşir; yüksek bölgeler
          // basamaklı teraslara (5px'lik dilimler) dönüşür. Patikalar, merkez
          // ve harita kenarı düz kalır. `wz` hem karo sprite'ının yan yüzünü
          // hem de oyuncu/canavar/mermi zemin yüksekliğini (groundZAt) besler.
          let elevation = 0;
          if (!isPath && dist > 3) {
            const hn = valueNoise(gx * 0.14 + 31.7, gy * 0.14 + 71.3);
            const hn2 = valueNoise(gx * 0.06 + 5.9, gy * 0.06 + 47.1);
            const h = hn * 0.62 + hn2 * 0.38;
            const flat = smooth(2.5, 7.5, dist);            // merkez düz kalsın
            const rimFlat = 1 - smooth(R - 4, R - 0.5, dist); // kenar düz kalsın
            // İzometrik görüş: ekranın ÜSTÜ (gx+gy çok negatif) yükselir.
            // Böylece tepeler ufukta toplanır; oyuncunun önünü kapatmaz.
            const northness = clamp(-(gx + gy) / (R * 1.5), 0, 1);
            const norm = clamp((h - 0.34) / 0.26, 0, 1);    // daha çok tepe
            const bias = 0.5 + 1.2 * northness;             // üstte 1.7x, altta 0.5x
            let units = Math.round(Math.round(norm * 4) * bias * flat * rimFlat);
            if (units < 0) units = 0;
            if (units > 5) units = 5;                       // en yüksek ~30 px
            elevation = units * 6;                          // 0 / 6 / ... / 30 px
          }
          const tile = {
            gx, gy, wx, wy, wz: elevation, type,
            shade: (Math.sin(gx * 7 + gy * 13) + 1) * 0.08,
            variant: Math.floor(hash2(gx * 1.7 + 3, gy * 2.3 + 1) * 4) % 4,
            edge: smooth(0.55, 1.0, dist / (R + 0.3))
          };
          // Ekran konumu bir kez hesaplanır: her karede iso() çağırmak nesne
          // ayırıp çöp toplayıcıyı yoruyordu (10k+ karo).
          tile.sx = (wx - wy) * COS_30;
          tile.sy = (wx + wy) * SIN_30 - elevation;
          if (tile.edge > 0.03) tile.edgeStyle = `rgba(2,4,6,${(tile.edge * 0.55).toFixed(3)})`;
          this.tiles.push(tile);
          this.tileMap.set(gx * 1000 + gy, tile);

          if (type === 'grass' && dist > 2.2) {
            // Doğal serpme: ızgara/çizgi görünümünü kırmak için her karo için
            // İKİ aday nokta üretilir; yoğunluk gürültüsü yüksek olan kazanır
            // (kümelenme) ve konum karo sınırını aşacak kadar titretilir.
            const h1 = hash2(gx * 3.1 + 0.5, gy * 5.7 + 0.25);
            const h2 = hash2(gx * 7.9 + 11.3, gy * 2.3 + 4.7);
            const forest = valueNoise(gx * 0.26 + 11.3, gy * 0.26 + 7.9) * 0.68 +
                           valueNoise(gx * 0.62 - 3.4, gy * 0.58 + 9.1) * 0.32;
            const stones = valueNoise(gx * 0.34 - 5.1, gy * 0.34 + 3.7);
            const ridge = valueNoise(gx * 0.19 + 41.2, gy * 0.19 + 12.8);
            const px = wx + (h1 - 0.5) * this.tileSize * 1.35;
            const py = wy + (h2 - 0.5) * this.tileSize * 1.35;
            // Boyutlar sınırlı: tek bir ağaç/kaya ekranı doldurmasın.
            if (forest > 0.50 && h1 > 0.13) {
              this.scenery.push({
                type: 'tree', wx: px, wy: py, z: elevation,
                scale: 0.72 + h1 * 0.52,
                solidRadius: h1 > 0.7 ? 0.2 : 0.13,
                swayOffset: h2 * TAU, tone: h1,
              });
            } else if (ridge > 0.74 && h2 > 0.45) {
              this.scenery.push({
                type: 'mountain', wx: px, wy: py, z: elevation,
                scale: 0.70 + h1 * 0.48,
                solidRadius: h1 > 0.62 ? 0.32 : 0.24,
              });
            } else if (stones > 0.66 && h2 > 0.5) {
              this.scenery.push({
                type: 'boulder', wx: px, wy: py, z: elevation,
                scale: 0.50 + h1 * 0.62,
                solidRadius: h1 > 0.78 ? 0.24 : 0.15,
              });
            } else if (h2 > 0.955) {
              this.scenery.push({
                type: 'bush', wx: px, wy: py, z: elevation,
                scale: 0.55 + h1 * 0.45,
                swayOffset: h2 * TAU,
              });
            }
          } else if (type === 'path' && dist > 2.5 && hash2(gx * 2.2, gy * 3.3) > 0.88) {
            this.scenery.push({ type: 'lantern', wx: wx + 22, wy: wy - 22, scale: 1 });
          }
        }
      }

      // Büyük dünyalarda ağaç/taş sayısını sınırla (mobil performansı).
      const SCENERY_CAP = 1400;
      if (this.scenery.length > SCENERY_CAP) {
        const step = this.scenery.length / SCENERY_CAP;
        const keep = [];
        for (let i = 0; i < SCENERY_CAP; i++) keep.push(this.scenery[Math.floor(i * step)]);
        this.scenery = keep;
      }
      // Harita kenarını görünür kaya duvarıyla çevir (görünmez sınır yerine).
      // Tek sıra düzgün halka "çizgi" gibi duruyordu: açı/yarıçap/boyut
      // titretilir ve ikinci bir seyrek sıra eklenir.
      const rimR = (R - 0.42) * this.tileSize;
      const rimCount = Math.max(24, Math.round(R * 7));
      for (let i = 0; i < rimCount; i++) {
        const a = (i / rimCount) * TAU + (hash2(i, 13.1) - 0.5) * 0.14;
        const rr = rimR + (hash2(i, 3.7) - 0.5) * 26;
        this.scenery.push({
          type: 'mountain',
          wx: Math.cos(a) * rr, wy: Math.sin(a) * rr,
          scale: 0.72 + hash2(i, 7.1) * 0.5,
          rot: a,
          solidRadius: 0.28,
        });
        if (hash2(i, 21.7) > 0.55) {
          const a2 = a + 0.05 + hash2(i, 5.3) * 0.08;
          const rr2 = rimR - 18 - hash2(i, 9.4) * 22;
          this.scenery.push({
            type: 'mountain',
            wx: Math.cos(a2) * rr2, wy: Math.sin(a2) * rr2,
            scale: 0.55 + hash2(i, 2.9) * 0.4,
            solidRadius: 0.2,
          });
        }
      }

      // Çarpışma listesi kırpmadan SONRA kurulur.
      this.solids = this.scenery.filter((s) => s.solidRadius > 0);

      // Varış taşı: oyuncunun doğduğu noktanın hemen yanında durur.
      // (Sunucu kasabaya dönüşü yalnızca varış noktasından kabul eder.)
      this.scenery.push({ type: 'shrine', wx: 0, wy: -14, scale: 1.1, interactable: true, label: 'Travel Stone' });
      this.invalidateMinimap();
      this.sortRenderables();
    }

    // Kalıcı kıta: SetraWorldCore'dan yalnızca oyuncunun çevresindeki pencere
    // üretilir. Kıta 42.000×32.000 birim (378.000×288.000 px) olduğundan
    // tamamını karo yapmak imkânsızdır; pencere kaydıkça yenilenir.
    generatePersistentMap(force) {
      const core = this.worldCore;
      const b = this.persistentBounds;
      if (!core || !b) return;
      const ts = this.tileSize;
      const worldW = b.maxX - b.minX, worldH = b.maxY - b.minY;
      const totalNX = Math.max(1, Math.ceil(worldW / ts));
      const totalNY = Math.max(1, Math.ceil(worldH / ts));
      const WIN = 72, EDGE = 18;
      const px = this.player ? this.player.x : 0;
      const py = this.player ? this.player.y : 0;
      const ci = Math.floor((px - b.minX) / ts);
      const cj = Math.floor((py - b.minY) / ts);
      // Oyuncu mevcut pencerenin güvenli iç bölgesindeyse dokunma.
      if (!force && this._persWindow) {
        const w = this._persWindow;
        if (ci >= w.i0 + EDGE && ci <= w.i0 + w.nx - EDGE &&
            cj >= w.j0 + EDGE && cj <= w.j0 + w.ny - EDGE) return;
      }
      const nx = Math.min(WIN, totalNX), ny = Math.min(WIN, totalNY);
      const i0 = clamp(ci - (nx >> 1), 0, Math.max(0, totalNX - nx));
      const j0 = clamp(cj - (ny >> 1), 0, Math.max(0, totalNY - ny));
      this.tiles = [];
      this.tileMap = new Map();
      this.scenery = [];
      this.solids = [];
      const BIOME_TILE = { meadow: 'grass', forest: 'grass', desert: 'sand', swamp: 'swamp', frost: 'snow', volcanic: 'ash', cursed: 'cursed', rock: 'rock' };
      const walk = new Array(ny);
      for (let j = 0; j < ny; j++) {
        walk[j] = new Array(nx).fill(true);
        for (let i = 0; i < nx; i++) {
          const gi = i0 + i, gj = j0 + j;
          const wx = b.minX + (gi + 0.5) * ts;
          const wy = b.minY + (gj + 0.5) * ts;
          const sv = this.worldToServer(wx, wy);
          let s;
          try { s = core.sample(sv.x, sv.y); }
          catch (e) { s = { water: false, deep: false, biome: 'meadow', road: false, bridge: false }; }
          let type = 'grass';
          if (s.water) type = s.deep ? 'deep' : 'water';
          else if (s.bridge || s.road) type = 'path';
          else type = BIOME_TILE[s.biome] || 'grass';
          const walkable = !(s.water && !s.bridge);
          walk[j][i] = walkable;
          const elevation = s.water ? 0 : clamp(Math.round((s.height || 0) / 10) * 10, 0, 120);
          const tile = {
            gx: gi, gy: gj, wx, wy, wz: elevation, type,
            shade: (Math.sin(gi * 7 + gj * 13) + 1) * 0.08,
            variant: Math.floor((core.randomAt ? core.randomAt(sv.x, sv.y, 3) : 0) * 4) % 4,
            edge: 0
          };
          tile.sx = (wx - wy) * COS_30;
          tile.sy = (wx + wy) * SIN_30 - elevation;
          this.tiles.push(tile);
          this.tileMap.set(gi * 100000 + gj, tile);
          if (!walkable || s.road || s.bridge) continue;
          const nearVillage = Math.hypot(wx, wy) < 4600;
          const r = core.randomAt ? core.randomAt(sv.x, sv.y, 7) : 0.5;
          const jx = (core.randomAt ? core.randomAt(sv.x, sv.y, 11) : 0.5) - 0.5;
          const px2 = wx + (r - 0.5) * ts * 0.7;
          const py2 = wy + jx * ts * 0.7;
          // Eski haritanın yoğun "orman + kaya + çalı" dokusu korunur — FAKAT
          // kıta 4x büyüdüğü için karo başına 1 ağaç ekranı tamamen kapatıyordu.
          // Artık seyrek, kümelenmiş ve daha küçük ağaçlar kullanılır.
          if (s.biome === 'forest') {
            if (r < 0.18 && !nearVillage) this.scenery.push({ type: 'tree', wx: px2, wy: py2, z: elevation, scale: 0.62 + r * 0.5, solidRadius: r > 0.12 ? 0.18 : 0.12, swayOffset: r * TAU, tone: r });
            else if (r < 0.23) this.scenery.push({ type: 'bush', wx: px2, wy: py2, z: elevation, scale: 0.9 + r, swayOffset: r * TAU, tone: r });
          } else if (s.biome === 'meadow') {
            if (r < 0.05 && !nearVillage) this.scenery.push({ type: 'tree', wx: px2, wy: py2, z: elevation, scale: 0.6 + r * 0.8, solidRadius: 0.1, swayOffset: r * TAU, tone: r });
            else if (r > 0.985) this.scenery.push({ type: 'glb', model: 'flowers', wx: px2, wy: py2, z: elevation, scale: 1.1 + r, swayOffset: r * TAU });
            else if (r > 0.992) this.scenery.push({ type: 'bush', wx: px2, wy: py2, z: elevation, scale: 1.1 + r, swayOffset: r * TAU, tone: r });
          } else if (s.biome === 'rock' || s.biome === 'desert') {
            if (r < 0.12) this.scenery.push({ type: 'boulder', wx: px2, wy: py2, z: elevation, scale: 0.7 + r * 1.1, solidRadius: 0.16 });
            else if (r > 0.95) this.scenery.push({ type: 'glb', model: 'stump', wx: px2, wy: py2, z: elevation, scale: 0.9 });
          } else if (s.biome === 'swamp' || s.biome === 'cursed') {
            if (r < 0.06) this.scenery.push({ type: 'tree', wx: px2, wy: py2, z: elevation, scale: 0.6 + r * 0.5, solidRadius: 0.11, swayOffset: r * TAU, tone: r });
            else if (r > 0.93) {
              // Eski (vektör) çalı geri döndü; yalnızca çok nadir mezar 3D kalır.
              if (r > 0.98) this.scenery.push({ type: 'glb', model: 'graves', wx: px2, wy: py2, z: elevation, scale: 0.9, swayOffset: r * TAU });
              else this.scenery.push({ type: 'bush', wx: px2, wy: py2, z: elevation, scale: 1.0 + r, swayOffset: r * TAU, tone: r });
            }
          } else if (s.biome === 'frost') {
            if (r < 0.09) this.scenery.push({ type: 'tree', wx: px2, wy: py2, z: elevation, scale: 0.6 + r * 0.5, solidRadius: 0.11, swayOffset: r * TAU, tone: r });
            else if (r > 0.995) this.scenery.push({ type: 'glb', model: 'crystals', wx: px2, wy: py2, z: elevation, scale: 0.8 + r });
          } else if (s.biome === 'volcanic') {
            if (r < 0.12) this.scenery.push({ type: 'boulder', wx: px2, wy: py2, z: elevation, scale: 0.8 + r * 1.2, solidRadius: 0.18 });
            else if (r > 0.99) this.scenery.push({ type: 'glb', model: 'crystals', wx: px2, wy: py2, z: elevation, scale: 0.9 });
          }
        }
      }
      this._persWalk = walk;
      this._persWindow = { i0, j0, nx, ny, gi: ci, gj: cj };
      if (!this._persistentStaticScenery) this.buildPersistentStaticScenery();
      // Sabit yapılar + POI işaretleri her pencerede yeniden eklenir.
      if (this._persistentStaticScenery) for (const s of this._persistentStaticScenery) this.scenery.push(s);
      if (this.poiMarkers) for (const s of this.poiMarkers) this.scenery.push(s);
      this.pushWindowProps();
      const SCENERY_CAP = 2600;
      if (this.scenery.length > SCENERY_CAP) {
        // Önce sabit yapılar/POI'ler/elle boyanan props korunur, prosedürel dekor seyreltilir.
        const isFixed = (s) => s._prop || s.type === 'glb' || s.type === 'poi' || s.interactable;
        const fixed = this.scenery.filter(isFixed);
        const loose = this.scenery.filter((s) => !isFixed(s));
        const room = Math.max(0, SCENERY_CAP - fixed.length);
        if (loose.length > room) {
          const step = loose.length / Math.max(1, room);
          const keep = [];
          for (let i = 0; i < room; i++) keep.push(loose[Math.floor(i * step)]);
          this.scenery = fixed.concat(keep);
        }
      }
      this.solids = this.scenery.filter((s) => s.solidRadius > 0);
      this.persistentTilesReady = true;
      this.invalidateMinimap();
      this.sortRenderables();
    }

    // Köy/kamp/köprü gibi sabit dünyayı bir kez hazırlar. Ölçekler eski
    // haritadaki "evler oyuncudan büyük" hissini koruyacak şekilde seçildi.
    buildPersistentStaticScenery() {
      const list = [];
      const pois = this.worldConfig.pois || [];
      const structScale = this.worldTuning().structureScale;
      for (const st of (this.worldConfig.structures || [])) {
        if (pois.some((p) => p.model === st.model && Math.hypot(p.x - st.x, p.y - st.y) < 3)) continue;
        const w = this.serverToWorld(st.x + 0.5, st.y + 0.5);
        list.push({ type: 'glb', model: st.model, wx: w.x, wy: w.y,
          z: this.groundZAt(w.x, w.y), scale: (st.scale || 1) * structScale,
          rot: Number.isFinite(Number(st.rot)) ? Number(st.rot) : undefined, preScaled: true,
          tint: st.tint || null,
          solidRadius: (Number.isFinite(Number(st.solidRadius)) ? Number(st.solidRadius) : defaultSolidRadius(st.model)) * 1.1,
          swayOffset: 0, tone: 0.5 });
      }
      // SETRA Village çevresi: seyrek ağaç halkası + birkaç çalı/çiçek.
      // (Eskiden 56 parça vardı; köyün etrafı çalı duvarı gibi görünüyordu.)
      const core = this.worldCore;
      const seed = this.worldConfig.seed || 1;
      const ringSeed = (i) => core.randomAt(seed % 997, i * 37, 23);
      for (let i = 0; i < 18; i++) {
        const a = i * 2.399963229728653 + ringSeed(i) * 0.35;
        const rad = 2500 + ringSeed(i + 90) * 3200;
        const wx = Math.cos(a) * rad, wy = Math.sin(a) * rad;
        const sv = this.worldToServer(wx, wy);
        const s = core.sample(sv.x, sv.y);
        if (s.water || s.road) continue;
        const r = ringSeed(i + 180);
        if (r < 0.72) list.push({ type: 'tree', wx, wy, z: this.groundZAt(wx, wy),
          scale: 0.9 + ringSeed(i + 31) * 0.4, solidRadius: 0.14, swayOffset: i, tone: 0.5 });
        else if (r < 0.88) list.push({ type: 'bush', wx, wy, z: this.groundZAt(wx, wy),
          scale: 0.9 + ringSeed(i + 71) * 0.5, swayOffset: i, tone: 0.5 });
        else list.push({ type: 'glb', model: 'flowers',
          wx, wy, z: this.groundZAt(wx, wy), scale: 1.1 + ringSeed(i + 71) * 0.6, swayOffset: i, preScaled: true });
      }
      this._persistentStaticScenery = list;
    }

    // Dünya Kurucu'da boyanan/eklenen nesneler (world_setra.json `props`).
    // Yalnızca o anki pencereye düşenler sahneye eklenir → binlerce prop olsa da
    // kare başına maliyet sabit kalır.
    pushWindowProps() {
      const props = (this.worldConfig && this.worldConfig.props) || [];
      if (!props.length) return;
      const b = this.persistentBounds, w = this._persWindow, ts = this.tileSize;
      if (!b || !w) return;
      const m = ts; // 1 karo pay
      const minX = b.minX + w.i0 * ts - m, maxX = b.minX + (w.i0 + w.nx) * ts + m;
      const minY = b.minY + w.j0 * ts - m, maxY = b.minY + (w.j0 + w.ny) * ts + m;
      for (const pr of props) {
        if (!pr) continue;
        const px = Number(pr.x), py = Number(pr.y);
        if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
        const wpos = this.serverToWorld(px + 0.5, py + 0.5);
        if (wpos.x < minX || wpos.x > maxX || wpos.y < minY || wpos.y > maxY) continue;
        // Su üstüne denk gelen props (göl/denizde kaya, ölü ağaç) havada
        // yüzüyormuş gibi görünüyordu: yalnızca karaya oturanları sahneye al.
        try {
          const ws = this.worldCore && this.worldCore.sample(px, py);
          if (ws && ws.water) continue;
        } catch (_) {}
        const isGlb = pr.type === 'glb' || !!pr.model;
        const obj = {
          type: isGlb ? 'glb' : (pr.type || 'tree'),
          model: isGlb ? (pr.model || 'oak') : null,
          wx: wpos.x, wy: wpos.y, z: this.groundZAt(wpos.x, wpos.y),
          scale: Number(pr.scale) || 1,
          rot: Number.isFinite(Number(pr.rot)) ? Number(pr.rot) : undefined,
          swayOffset: Number(pr.swayOffset) || (px * 0.013 + py * 0.021),
          tone: Number.isFinite(Number(pr.tone)) ? Number(pr.tone) : 0.5,
          solidRadius: Number.isFinite(Number(pr.solidRadius)) ? Number(pr.solidRadius)
            : defaultSolidRadius(pr.model || pr.type),
          _prop: true
        };
        if (Number.isFinite(Number(pr.height)) && Number(pr.height) > 0) obj.height = Number(pr.height);
        this.scenery.push(obj);
      }
    }

    // Oyuncu pencere kenarına yaklaşınca arazi penceresini kaydır.
    ensurePersistentWindow() {
      if (!this.persistent || !this.worldCore) return;
      if (!this._persWindow) { this.generatePersistentMap(true); return; }
      const w = this._persWindow, ts = this.tileSize, b = this.persistentBounds;
      const ci = Math.floor((this.player.x - b.minX) / ts);
      const cj = Math.floor((this.player.y - b.minY) / ts);
      if (ci < w.i0 + 18 || ci > w.i0 + w.nx - 18 ||
          cj < w.j0 + 18 || cj > w.j0 + w.ny - 18) {
        this.generatePersistentMap(true);
      }
    }

    sortRenderables() {
      this.tiles.sort((a, b) => (a.wx + a.wy) - (b.wx + b.wy));
      this.buildTileRows();
      this.rebuildRenderables();
    }

    // Karoları ekran-y düzleminde bantlara ayır (her bant sıralı kalır).
    // Böylece her karede 10k+ karoyu taramak yerine yalnızca görünen bantlar
    // dolaşılır; çizim sırası (sy artan) korunur.
    buildTileRows() {
      const CELL = 256, OFF = 512;
      const rows = new Map();
      for (let i = 0; i < this.tiles.length; i++) {
        const t = this.tiles[i];
        const ky = Math.floor(t.sy / CELL) + OFF;
        let arr = rows.get(ky);
        if (!arr) { arr = []; rows.set(ky, arr); }
        arr.push(t);
      }
      this._tileRows = rows;
      this._tileRowCell = CELL;
      this._tileRowOff = OFF;
    }

    // Statik sahne listeleri: çizim sırası ve ekran koordinatları bir kez
    // hazırlanır. Böylece her karede binlerce nesne ayırıp sıralamayız.
    rebuildRenderables() {
      // Tür/model global ölçeklerini sahneye uygula (tek geçiş, idempotent).
      this.applyTypeScales();
      const scenery = this.scenery || [];
      for (const s of scenery) {
        if (s._bx === undefined) {
          s._bx = (s.wx - s.wy) * COS_30;
          s._by = (s.wx + s.wy) * SIN_30 - (s.z || 0);
        }
        s._depth = s.wx + s.wy;
      }
      scenery.sort((a, b) => a._depth - b._depth);
      const entries = new Array(scenery.length);
      const lights = [];
      const shadows = [];
      const inter = [];
      for (let i = 0; i < scenery.length; i++) {
        const s = scenery[i];
        entries[i] = { depth: s._depth, type: 'scenery', data: s };
        if (s.type === 'shrine' || s.type === 'lantern' || s.type === 'mushroom') lights.push(s);
        if (s.type === 'tree' || s.type === 'boulder' || s.type === 'mountain' || s.type === 'shrine' || s.type === 'mushroom' || s.type === 'lantern' || s.type === 'glb') shadows.push(s);
        if (s.interactable || s.type === 'shrine') inter.push(s);
      }
      this._sceneryEntries = entries;
      this._lightScenery = lights;
      this._shadowScenery = shadows;
      this._interactables = inter;
      if (!this._renderList) this._renderList = [];
    }

    // ======================================================================
    // CANAVARLAR
    // ======================================================================
    // Verilen noktayı harita diskine kenetler (canavar/mob taşmasın).
    clampToWorld(x, y, margin = 90) {
      const R = Math.max(120, (this.mapRadius - 0.5) * this.tileSize - margin);
      const d = Math.hypot(x, y);
      if (d <= R) return { x, y };
      const a = Math.atan2(y, x);
      return { x: Math.cos(a) * R, y: Math.sin(a) * R };
    }

    // Kalıcı kıtada hareket: dikdörtgen sınır + su/geçilmez kare denetimi.
    // Izgara yürünebilirliği generatePersistentMap'te O(1) için hazırlanır.
    applyPersistentMovement(P) {
      if (!P) return;
      const b = this.persistentBounds;
      if (!b) return;
      if (P.x < b.minX) P.x = b.minX; else if (P.x > b.maxX) P.x = b.maxX;
      if (P.y < b.minY) P.y = b.minY; else if (P.y > b.maxY) P.y = b.maxY;
      const ts = this.tileSize;
      const w = this._persWindow;
      const gi = Math.floor((P.x - b.minX) / ts);
      const gj = Math.floor((P.y - b.minY) / ts);
      const row = this._persWalk && w ? this._persWalk[gj - w.j0] : null;
      const blocked = !w || !row || row[gi - w.i0] === undefined || row[gi - w.i0] === false;
      if (blocked) {
        if (this._lastWalkPos) { P.x = this._lastWalkPos.x; P.y = this._lastWalkPos.y; }
      } else {
        this._lastWalkPos = { x: P.x, y: P.y };
      }
    }

    updatePersistentBiome() {
      if (!this.persistent || !this.worldCore || !this.player) return;
      if ((this.time || 0) < (this._nextBiomeCheck || 0)) return;
      this._nextBiomeCheck = (this.time || 0) + 0.75;
      const sv = this.worldToServer(this.player.x, this.player.y);
      const sample = this.worldCore.sample(sv.x, sv.y);
      const def = (this.worldConfig.biomes || {})[sample.biome] || {};
      const id = def.engineBiome || (sample.biome === 'frost' ? 'frost' : sample.biome === 'swamp' ? 'swamp' : sample.biome === 'cursed' ? 'cursed' : sample.biome === 'volcanic' ? 'ashen' : 'verdant');
      if (id === this.biome) return;
      this.biome = id;
      this.biomeDef = (this.travelBiomes || {})[id] || null;
      this.biomePalette = (this.biomeDef && this.biomeDef.palette) || null;
      this.biomeAmbient = (this.biomeDef && this.biomeDef.ambient) || null;
      if (this.ambientMotes) this.initAmbientMotes(this.isTouch ? 16 : 35);
    }

    // Oyuncuyu katı nesnelerden (ağaç, kaya, dağ) dışarı iter.
    resolvePlayerCollision(P) {
      const solids = this.solids;
      if (!solids || !solids.length || !P) return;
      // Oyuncu çarpışma yarıçapı küçültüldü: ağaç/kaya aralarından geçiş rahat.
      const pr = Math.max(6, this.tileSize * 0.15);
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < solids.length; i++) {
          const s = solids[i];
          const sr = (s.solidRadius || 0) * this.tileSize;
          if (sr <= 0) continue;
          const dx = P.x - s.wx, dy = P.y - s.wy;
          const min = sr + pr;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min) continue;
          const d = Math.sqrt(d2);
          if (d < 0.001) { P.x = s.wx + min; P.y = s.wy; continue; }
          const push = (min - d) / d;
          P.x += dx * push;
          P.y += dy * push;
        }
      }
    }

    // ARPG içeriği: { arpgSkills: { classSlug: {q,e,r,auto} }, travelBiomes: {...} }
    applyContent(cat) {
      if (!cat || typeof cat !== 'object') return;
      if (cat.arpgSkills && typeof cat.arpgSkills === 'object') this.arpgSkills = cat.arpgSkills;
      if (cat.travelBiomes && typeof cat.travelBiomes === 'object') this.travelBiomes = cat.travelBiomes;
      if (cat.skillSkins && typeof cat.skillSkins === 'object') this.skins = cat.skillSkins;
      this.applyTravelSkills();
    }

    // ------------------------------------------------------------------
    // TravelSkills entegrasyonu
    // ------------------------------------------------------------------
    // ARPG yetenekleri artık content.js `arpgSkills` içinde yaşar (GameCraft
    // "Travel ARPG" sekmesi burayı düzenler). Her yetenek:
    //   { name, cd, behavior, params:{...}, ... }
    // `behavior` = travelSkills.js davranış adı; `params` o davranışın ayarları.
    // Bu fonksiyon SADECE veride `behavior` yoksa kod tablosundan geri doldurur
    // (eski kayıtlar bozulmasın diye). Veri her zaman kazanır.
    // ------------------------------------------------------------------
    applyTravelSkills() {
      const slug = this.playerData && this.playerData.class;
      const TS = global.TravelSkills;
      const current = slug && this.arpgSkills ? this.arpgSkills[slug] : null;
      if (!TS || !TS.bySlug || !current) return false;
      const rows = TS.bySlug[slug] || TS.bySlug[String(slug).toLowerCase()];
      if (!rows || rows.length < 4) return false;
      const patched = Object.assign({}, current);
      let changed = false;
      ['q', 'e', 'r'].forEach((slot, i) => {
        const base = current[slot], def = rows[i + 1];
        if (!base || !def || base.behavior) return; // veri dolu -> dokunma
        const conv = TS.fromRow(def);
        if (!conv) return;
        patched[slot] = Object.assign({}, base, conv);
        changed = true;
      });
      if (!changed) return false;
      this.arpgSkills = Object.assign({}, this.arpgSkills, { [slug]: patched });
      return true;
    }

    // Aktif "mana rengi"ni uygula (yetenek renkleri + parçacık efekti).
    setSkin(id) {
      const s = id && this.skins ? this.skins[id] : null;
      this.skin = s || null;
      // Görsel kütüphanesi de aynı paleti kullansın (parçacık/efekt renkleri).
      const TV = (typeof window !== 'undefined' && window.TravelVisuals) || null;
      if (TV && typeof TV.setHue === 'function') TV.setHue(this.skin);
    }

    // Mana rengi parçacıkları (yarasa, galaksi, su, void, glitch...).
    emitSkinFx(x, y, count = 10) {
      const skin = this.skin;
      if (!skin || !skin.fx || skin.fx === 'plain' || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const fx = skin.fx;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * TAU;
        const sp = 26 + Math.random() * 90;
        const p = {
          wx: x + (Math.random() - 0.5) * 22, wy: y + (Math.random() - 0.5) * 22,
          wz: 14 + Math.random() * 26,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 18 + Math.random() * 60,
          color: Math.random() > 0.5 ? skin.primary : (skin.glow || skin.secondary || skin.primary),
          size: 2 + Math.random() * 2.2, life: 0.55 + Math.random() * 0.5, grav: -30
        };
        if (fx === 'bats') { p.shape = 'bat'; p.size = 2.6 + Math.random() * 2.4; p.life = 1.2; p.grav = -60; p.vz = 30 + Math.random() * 40; }
        else if (fx === 'galaxy' || fx === 'star' || fx === 'moon') { p.shape = 'star'; p.vz = 50 + Math.random() * 90; p.grav = 30; p.color = Math.random() > 0.6 ? '#ffffff' : p.color; }
        else if (fx === 'water' || fx === 'bubble') { p.shape = 'bubble'; p.vz = 40 + Math.random() * 40; }
        else if (fx === 'petal' || fx === 'thorn') { p.shape = 'leaf'; p.grav = -20; p.spin = Math.random() * TAU; }
        else if (fx === 'void' || fx === 'shadow') { p.shape = 'void'; p.additive = false; p.size += 1.4; p.grav = -10; }
        else if (fx === 'glitch') { p.shape = 'glitch'; p.additive = false; p.size = 2 + Math.random() * 3; }
        else if (fx === 'smoke' || fx === 'ghost') { p.shape = 'smoke'; p.additive = false; p.grow = 18; p.grav = -18; }
        else if (fx === 'frost' || fx === 'ice' || fx === 'crystal' || fx === 'prism') { p.shape = 'shard'; p.spin = Math.random() * TAU; p.grav = 40; }
        else if (fx === 'flame' || fx === 'ember') { p.vz = 60 + Math.random() * 80; p.grav = 40; }
        this.addParticle(p);
      }
    }

    // Biyom seçimi (sunucu haritasının `type` alanı ile eşleşir).
    setBiome(id, force) {
      const bid = String(id || 'verdant');
      const def = (this.travelBiomes && this.travelBiomes[bid]) || null;
      const changed = bid !== this.biome || !!force;
      this.biome = bid;
      this.biomeDef = def;
      this.biomePalette = (def && def.palette) || null;
      this.biomeAmbient = (def && def.ambient) || null;
      if (this.ambientMotes) this.initAmbientMotes(35);
      if (!changed) return;
      // Yeni biyom: karo renkleri değiştiği için sprite önbelleğini boşalt.
      this.tileSprites = {};
      this.invalidateMinimap();
      // Yeni biyom: eski canavarları temizle, yeni roster'ı doğur.
      this.monsters = [];
      this._respawnQueue = [];
      const sp = (def && def.spawn) || {};
      // Seyrek ama ölümcül: yoğunluk ~yarıya indi.
      this.spawnMonsters(Math.max(3, Math.round((Number(sp.count) || 4) * 0.8)));
    }

    // Sınıfın tüm ARPG yetenekleri: varsayılan Q/E/R + öğrenilebilir havuz.
    classSkillPool() {
      const slug = this.playerData && this.playerData.class;
      const set = slug && this.arpgSkills ? this.arpgSkills[slug] : null;
      if (!set) return [];
      const out = [];
      for (const slot of ['q', 'e', 'r']) {
        const sk = set[slot];
        if (sk) out.push(Object.assign({ id: sk.id || ('default_' + slot), defaultSlot: slot }, sk));
      }
      for (const sk of (set.pool || [])) if (sk) out.push(Object.assign({}, sk));
      for (const sk of (set.late || [])) if (sk) out.push(Object.assign({}, sk));
      return out;
    }

    // Oyuncunun kuşandığı set. Sunucudan gelen travelLoadout (Q/E/R -> skill id)
    // yoksa sınıfın varsayılan üçlüsü kullanılır.
    classSkillSet() {
      const slug = this.playerData && this.playerData.class;
      const set = slug && this.arpgSkills ? this.arpgSkills[slug] : null;
      if (!set) return null;
      const loadout = (this.playerData && this.playerData.travelLoadout) || null;
      if (!loadout) return set;
      const pool = this.classSkillPool();
      const byId = new Map();
      for (const sk of pool) if (sk && sk.id) byId.set(sk.id, sk);
      const pick = (slot) => {
        // Yuva sözlükte VAR ama boş ("") ise: oyuncu onu bilerek boşaltmıştır,
        // varsayılana düşmeyiz (aksi halde aynı yetenek iki tuşta çalışır).
        const has = Object.prototype.hasOwnProperty.call(loadout, slot);
        const id = has ? loadout[slot] : null;
        if (has && !id) return null;
        const sk = id ? byId.get(id) : null;
        return sk ? Object.assign({}, sk) : (set[slot] || null);
      };
      return { atkSpd: set.atkSpd, auto: set.auto, q: pick('q'), e: pick('e'), r: pick('r') };
    }

    // Saldırı hızı: taban + ATK ölçeği, class/ırk/item attackSpeed yüzdesiyle.
    computeAttackPerSecond() {
      const st = (this.playerData && this.playerData.stats) || {};
      const atk = Number(st.attack) || 0;
      // Taban 0.62; ATK arttıkça hafifçe hızlanır (LoL benzeri yumuşak eğri).
      const base = 0.62 + atk * 0.0045;
      const pct = Number(st.attackSpeed) || 0;
      const perSec = base * (1 + pct / 100);
      return Math.max(0.35, Math.min(2.6, perSec));
    }

    refreshAttackCooldown() {
      if (!this.player) return;
      const aps = this.computeAttackPerSecond();
      this.player.attackCooldown = 1 / aps;
    }

    // ---- Dünya Kurucu spawn bölgeleri (world_setra.json `spawnZones`) ----
    // Oyuncuya en yakın (içinde bulunduğu) bölgeyi döndürür.
    pickSpawnZoneNear(sx, sy, pad) {
      const zones = (this.worldConfig && this.worldConfig.spawnZones) || [];
      if (!zones.length) return null;
      const limit = pad === undefined ? 2600 : pad;
      let best = null, bestD = Infinity;
      for (const z of zones) {
        if (!z || !Number.isFinite(Number(z.cx)) || !Number.isFinite(Number(z.cy))) continue;
        const d = Math.hypot(Number(z.cx) - sx, Number(z.cy) - sy) - (Number(z.r) || 0);
        if (d <= limit && d < bestD) { bestD = d; best = z; }
      }
      return best;
    }
    pickZoneMonster(zone) {
      const list = (zone && zone.monsters) || [];
      if (!list.length) return null;
      const w = (m) => Math.max(0.0001, Number(m && m.weight) || 1);
      const total = list.reduce((a, m) => a + w(m), 0);
      let r = Math.random() * total;
      for (const m of list) { r -= w(m); if (r <= 0) return m; }
      return list[0];
    }
    // Bölge canavarı yalnızca `kind` taşır; tam statları (hp/hasar/painter)
    // biome tanımlarından çöz. Bulunamazsa çağıran taraf varsayılana düşer.
    resolveMonsterDef(kind) {
      if (!kind) return null;
      const eq = (m) => m && (m.kind === kind || m.id === kind);
      const own = (this.biomeDef && this.biomeDef.monsters) || [];
      const f0 = own.find(eq);
      if (f0) return f0;
      const tb = this.travelBiomes || {};
      for (const k of Object.keys(tb)) {
        const arr = (tb[k] && tb[k].monsters) || [];
        const f = arr.find(eq);
        if (f) return f;
      }
      return null;
    }
    // Oyuncunun bulunduğu bölgenin yoğunluğu (canavar cap çarpanı).
    zoneDensityNear() {
      const p = this.player;
      if (!p) return 1;
      const sv = this.worldToServer(p.x, p.y);
      let best = 1;
      const zones = (this.worldConfig && this.worldConfig.spawnZones) || [];
      for (const z of zones) {
        if (!z) continue;
        const d = Math.hypot(Number(z.cx) - sv.x, Number(z.cy) - sv.y) - (Number(z.r) || 0);
        if (d <= 240) { const dens = Number(z.density); if (dens > best) best = dens; }
      }
      return Math.max(0.5, Math.min(4, best));
    }

    pickBiomeMonster() {
      const def = this.biomeDef;
      const list = (def && def.monsters) || null;
      if (!list || !list.length) return null;
      const eliteChance = (def.spawn && Number(def.spawn.eliteChance)) || 0;
      const normals = list.filter((m) => !m.elite);
      const elites = list.filter((m) => m.elite);
      const useElite = elites.length && Math.random() < eliteChance;
      const pool = useElite ? elites : (normals.length ? normals : list);
      const total = pool.reduce((a, m) => a + (Number(m.weight) || 1), 0);
      let r = Math.random() * total;
      for (const m of pool) {
        r -= (Number(m.weight) || 1);
        if (r <= 0) return m;
      }
      return pool[0];
    }

    // Köy güvenli bölgesi: oyuncu köyden ~15 saniyelik yürüyüş kadar (≈2600
    // dünya pikseli) uzaklaşmadan yaratık doğmaz. Köylerin içi ve çevresi
    // böylece temiz kalır.
    townSafeRadius() { return 2600; }
    insideTownSafeZoneAt(x, y) {
      if (!this.persistent) return false;
      const list = this.poiMarkers || [];
      const R = this.townSafeRadius();
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (!p || !p.poiId) continue;
        if (p.kind !== 'inn' && p.kind !== 'checkpoint' && p.kind !== 'camp' && p.kind !== 'dungeon') continue;
        if (Math.hypot(p.wx - x, p.wy - y) < R) return true;
      }
      return false;
    }
    insideTownSafeZone() {
      const P = this.player;
      return !!P && this.insideTownSafeZoneAt(P.x, P.y);
    }

    spawnMonsters(count = 6) {
      // Ortak dünya modunda canavarlar sunucudan gelir (applyServerMobs).
      if (this.sharedMobs) return;
      // Köyde/çevresinde yaratık doğmasın.
      if (this.insideTownSafeZone()) return;
      const def = this.biomeDef;
      let eliteSpawned = false;
      const legacy = [
        { kind: 'goblin', name: 'Koru Goblini', painter: 'goblin', color: '#56ab2f', accent: '#d9f99d', hp: 220, maxHp: 220, speed: 130, damage: 24, radius: 16, exp: 45 },
        { kind: 'treant', name: 'Yozlaşmış Treant', painter: 'treant', color: '#4a2c11', accent: '#a3e635', hp: 480, maxHp: 480, speed: 85, damage: 45, radius: 24, exp: 90 },
        { kind: 'wraith', name: 'Gölge Avcısı', painter: 'wraith', color: '#7b1fa2', accent: '#e9d5ff', hp: 180, maxHp: 180, speed: 175, damage: 32, radius: 15, exp: 60 }
      ];

      const psx0 = this.player ? this.player.x : 0;
      const psy0 = this.player ? this.player.y : 0;
      const psrv = this.player ? this.worldToServer(psx0, psy0) : { x: 0, y: 0 };
      for (let i = 0; i < count; i++) {
        // Dünya Kurucu'da boyanmış bir spawn bölgesi yakındaysa oradan doğ.
        const zone = this.pickSpawnZoneNear(psrv.x, psrv.y, 2600);
        let base, px, py;
        if (zone) {
          const za = Math.random() * TAU;
          const zr = Math.sqrt(Math.random()) * Math.max(120, Number(zone.r) || 400);
          const sw = this.serverToWorld(Number(zone.cx) + Math.cos(za) * zr, Number(zone.cy) + Math.sin(za) * zr);
          px = sw.x; py = sw.y;
          const zm = this.pickZoneMonster(zone);
          base = (zm && this.resolveMonsterDef(zm.kind)) || zm || (def && this.pickBiomeMonster()) || legacy[i % legacy.length];
        } else {
          base = (def && this.pickBiomeMonster()) || legacy[i % legacy.length];
          const angle = (i / Math.max(1, count)) * TAU + Math.random() * 0.4;
          const dist = 300 + Math.random() * 320;
          const raw = this.clampToWorld(psx0 + Math.cos(angle) * dist, psy0 + Math.sin(angle) * dist);
          px = raw.x; py = raw.y;
        }
        // Doğacağı nokta da köy güvenli bölgesindeyse atla.
        if (this.insideTownSafeZoneAt(px, py)) continue;
        const isElite = !!base.elite;
        // --- Zorluk ölçeği: canavarlar oyuncu seviyesine göre de büyür ---
        // (Tek vuruşta kesilmesinler: can x2, hasar x1.6, seviye başına +%16)
        // Elitler (nadir) ayrıca çok daha dayanıklı ve vurucudur.
        const lvl = Math.max(1, Number(this.playerData && this.playerData.level) || 1);
        const lvlMult = 1 + (lvl - 1) * 0.16;
        const hpMult = 4.0 * lvlMult;
        const dmgMult = 2.6 * lvlMult;
        const eliteHp = isElite ? 2.1 : 1;
        const eliteDmg = isElite ? 1.45 : 1;
        const hp = Math.round((Number(base.hp) || 200) * hpMult * eliteHp);
        const dmg = Math.round((Number(base.damage) || 24) * dmgMult * eliteDmg);
        this.monsters.push({
          id: Math.random().toString(36).substr(2, 9),
          kind: base.kind,
          name: base.elite ? `★ ${base.name}` : base.name,
          painter: base.painter || 'goblin',
          color: base.color || '#56ab2f',
          accent: base.accent || '#d9f99d',
          element: base.element || 'physical',
          tags: Array.isArray(base.tags) ? base.tags.slice() : [],
          elite: isElite,
          ability: base.ability || null,
          statusOnHit: base.status || null,
          hp: hp, maxHp: hp,
          speed: (base.speed || 130) * (isElite ? 1.05 : 1), damage: dmg,
          radius: Math.round((base.radius || 16) * (isElite ? 1.5 : 1.4)),
          exp: Math.round((base.exp || 45) * (isElite ? 2.4 : 1)),
          gold: Math.round((base.gold || 6) * (isElite ? 2.5 : 1)),
          x: px, y: py, z: 0,
          patrolCenterX: px, patrolCenterY: py,
          patrolTimer: Math.random() * 3, patrolTargetX: px, patrolTargetY: py,
          vx: 0, vy: 0, facingAngle: 0,
          state: 'PATROL', attackTimer: 0, attackCooldown: base.attackCooldown || 1.4,
          flashTimer: 0, alertTimer: 0, statuses: {},
          // Yetenekler + menzil: vurulunca aggro'ya girer, bırakınca devriyeye döner.
          skills: Array.isArray(base.skills) ? base.skills : null,
          skillCds: (Array.isArray(base.skills) ? base.skills : []).map((s) => (Number(s.cd) || 6) * (0.4 + Math.random() * 0.6)),
          cast: null, aggroRange: Number(base.aggroRange) || 280, aggroTimer: 0,
          // Savunma sınıflandırması (per-monster / per-attack; veriden override edilebilir)
          attackDefense: base.attackDefense || null,
          attackKind: base.attackKind || null,
          attackTelegraph: Number(base.attackTelegraph) || 0,
          guardPressure: base.guardPressure != null ? Number(base.guardPressure) : null,
          boss: !!(base.boss || base.isBoss),
          meleeWindup: null, parriedTimer: 0,
          hpGhost: hp, walkPhase: Math.random() * 6, deathTimer: 0, dead: false
        });
        if (isElite) eliteSpawned = true;
      }
      // Elit/boss doğduğunda kısa bir giriş kükremesi.
      if (eliteSpawned && this.sound) this.sound.play('boss');
    }

    // ======================================================================
    // AMBİYANS (ateş böcekleri + düşen yapraklar)
    // ======================================================================
    initAmbientMotes(count) {
      this.ambientMotes = [];
      const amb = this.biomeAmbient || {};
      const c1 = amb.color || '#b8e986';
      const c2 = amb.color2 || '#ffd54f';
      const leaf = !!amb.leaf;
      const snow = !!amb.snow;
      const ember = !!amb.ember;
      const bubble = !!amb.bubble;
      const voidMote = !!amb.void;
      const n = snow ? Math.round(count * 2) : count;
      for (let i = 0; i < n; i++) {
        this.ambientMotes.push({
          x: (Math.random() - 0.5) * 900, y: (Math.random() - 0.5) * 900, z: 10 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
          size: snow ? 1 + Math.random() * 1.8 : 1 + Math.random() * 2.2,
          alpha: 0.3 + Math.random() * 0.5,
          color: Math.random() > 0.5 ? c1 : c2, phase: Math.random() * 10,
          leaf: leaf, snow, ember, bubble, voidMote
        });
      }
      if (leaf) {
        for (let i = 0; i < 14; i++) {
          this.ambientMotes.push({
            x: (Math.random() - 0.5) * 900, y: (Math.random() - 0.5) * 900, z: Math.random() * 140,
            vx: 8 + Math.random() * 10, vy: 4 + Math.random() * 8,
            size: 2.2 + Math.random() * 1.6, alpha: 0.85,
            color: Math.random() > 0.5 ? c1 : c2, phase: Math.random() * 10, leaf: true
          });
        }
      }
    }

    // Biyom atmosferi: zemin tonu + sis + parçacık rengi.
    // Not: bu katman bilinçli olarak TAM EKRAN çizilir (zoom'dan bağımsız).
    // Daha önce zoom transformu içinde fillRect(0,0,w,h) yapıldığı için
    // uzaklaştırınca ekranda keskin kenarlı "kare sis" görünüyordu.
    renderBiomeOverlay(ctx) {
      const pal = this.biomePalette;
      if (!pal) return;
      const t = this.time;
      const W = this.width, H = this.height;
      const tint = pal.accent || pal.ground || '#4f8f3a';
      const grade = Number.isFinite(Number(pal.grade)) ? Number(pal.grade) : 0.10;
      // Yumuşak renk tonu (multiply) — tüm ekranı kaplar, kenar bırakmaz.
      // Biyom başına farklı yoğunluk: her diyar kendi rengine boyanır.
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = grade;
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Tundra: kar görünümü artık karo renklerinden gelir (tileTint).
      // Ekstra beyaz leke/yuvarlak katmanı yok — daha temiz ve kare atlaması yapmaz.
      if (this.biomeAmbient && this.biomeAmbient.ember) {
        // Kül diyarı: sıcak, isli bir ışık.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = '#ff8a50';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      } else if (this.biomeAmbient && this.biomeAmbient.void) {
        // Lanetli diyar: mor bir parıltı.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      const fog = (this.biomeAmbient && Number(this.biomeAmbient.fog)) || 0;
      if (fog <= 0) return;
      // Sis: merkezden dışa doğru yumuşak; kenarlarda tek renge kilitlenmez,
      // hafifçe sürüklenir. Gradyan önbelleğe alınır, kayma translate ile verilir.
      const maxA = Math.min(0.42, fog);
      const fogCol = pal.fog || '#ffffff';
      const fkey = W + 'x' + H + '|' + fogCol + '|' + maxA.toFixed(2);
      if (this._fogKey !== fkey || !this._fogGrad) {
        this._fogKey = fkey;
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.18, W / 2, H / 2, Math.max(W, H) * 0.78);
        g.addColorStop(0, rgba(fogCol, 0));
        g.addColorStop(0.55, rgba(fogCol, maxA * 0.35));
        g.addColorStop(1, rgba(fogCol, maxA));
        this._fogGrad = g;
      }
      const dx = Math.sin(t * 0.06) * W * 0.05;
      const dy = Math.cos(t * 0.05) * H * 0.04;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.fillStyle = this._fogGrad;
      ctx.fillRect(-dx, -dy, W, H);
      ctx.restore();
    }

    // ---- Ayarlar (GameCraft editöründen gelir) ----
    // cfg: { weather:{enabled,rainChance,minDelay,maxDelay,rainVolume,dayVolume},
    //        downed:{enabled,reviveRange}, sound:{master} }
    // sfxOverrides: { slash:'slash2', ambience_rain:'travel_ambience_rain', ... }
    applyConfig(cfg, sfxOverrides) {
      this.config = Object.assign({
        weather: { enabled: true, rainChance: 0.4, minDelay: 50, maxDelay: 160, rainVolume: 0.28, dayVolume: 0.22 },
        downed: { enabled: true, reviveRange: 110 },
        sound: { master: 0.85 },
      }, cfg || {});
      const cw = this.config.weather || {};
      const cd = this.config.downed || {};
      this.weatherEnabled = cw.enabled !== false;
      this.rainChance = clamp(Number(cw.rainChance) || 0, 0, 1);
      this.weatherMinDelay = Math.max(5, Number(cw.minDelay) || 50);
      this.weatherMaxDelay = Math.max(this.weatherMinDelay + 1, Number(cw.maxDelay) || 160);
      this.reviveRange = Math.max(40, Number(cd.reviveRange) || 110);
      if (this.sound) {
        this.sound.setMaster((this.config.sound && this.config.sound.master) || 0.85);
        if (sfxOverrides) {
          for (const [key, val] of Object.entries(sfxOverrides)) {
            if (val) this.sound.assign(key, Array.isArray(val) ? val : [val]);
          }
        }
      }
      if (!this.weatherEnabled) this.setWeather('clear');
      else if (this.weather === 'rain') this.setWeather('rain');
    }

    // ---- Hava durumu (yağmur) ----
    setWeather(w) {
      const cw = (this.config && this.config.weather) || {};
      this.weather = (w === 'rain' && this.weatherEnabled !== false) ? 'rain' : 'clear';
      if (this.weather === 'rain') {
        this.rainDrops = [];
        const nDrops = this.isTouch ? 60 : 130;
        for (let i = 0; i < nDrops; i++) {
          this.rainDrops.push({
            x: Math.random() * (this.width || 800),
            y: Math.random() * (this.height || 600),
            len: 8 + Math.random() * 12,
            sp: 520 + Math.random() * 360,
            a: 0.18 + Math.random() * 0.32,
          });
        }
        if (this.sound) this.sound.loop('ambience_rain', cw.rainVolume != null ? cw.rainVolume : 0.28);
      } else if (this.sound) {
        // Açık havada ambiyans döngüsü çalmaz (tavuk/kuş sesi şikayeti):
        // varsa önceki döngüyü kapat.
        this.sound.stopLoop();
      }
    }

    updateWeather(dt) {
      if (this.weatherEnabled === false) {
        if (this.weather !== 'clear') this.setWeather('clear');
        return;
      }
      this._weatherTimer -= dt;
      if (this._weatherTimer <= 0) {
        const minD = this.weatherMinDelay || 50;
        const maxD = this.weatherMaxDelay || 160;
        this._weatherTimer = minD + Math.random() * (maxD - minD);
        const chance = this.rainChance != null ? this.rainChance : 0.4;
        this.setWeather(this.weather === 'rain' ? 'clear' : (Math.random() < chance ? 'rain' : 'clear'));
      }
      if (this.weather === 'rain') {
        const w = this.width || 800, h = this.height || 600;
        for (const d of this.rainDrops) {
          d.y += d.sp * dt;
          d.x -= d.sp * 0.22 * dt;
          if (d.y > h + 20) { d.y = -20; d.x = Math.random() * (w + 120); }
          if (d.x < -30) d.x = w + Math.random() * 60;
        }
      }
    }

    renderWeather(ctx) {
      if (this.weather !== 'rain' || !this.rainDrops.length) return;
      ctx.save();
      ctx.strokeStyle = 'rgba(174,205,232,0.55)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      const step = this.lowFx ? 2 : 1;
      for (let i = 0; i < this.rainDrops.length; i += step) {
        const d = this.rainDrops[i];
        ctx.globalAlpha = d.a;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.22, d.y + d.len);
      }
      ctx.stroke();
      ctx.restore();
    }

    // ======================================================================
    // PARÇACIK SİSTEMİ
    // ======================================================================
    addParticle(o) {
      // Mobil/düşük güç: partikül tavanı daha düşük tutulur (kare süresi korunur).
      const cap = this.isTouch ? 260 : 700;
      if (this.particles.length > cap) return;
      const life = o.life || 0.5;
      this.particles.push({
        wx: o.wx, wy: o.wy, wz: o.wz || 0,
        vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0,
        color: o.color || '#ffffff', size: o.size || 3,
        life, maxLife: life, alpha: 1,
        grav: o.grav === undefined ? 320 : o.grav,
        additive: o.additive !== false, grow: o.grow || 0, drag: o.drag || 0,
        shape: o.shape || null, spin: o.spin || 0
      });
    }

    spawnImpact(wx, wy, color, big) {
      this.impacts.push({ wx, wy, wz: 18, color, big, timer: 0.22, duration: 0.22, seed: Math.random() * 100 });
    }

    // Sandık / han / harabe etkileşiminde zeminde yumuşak bir ışık halkası.
    spawnInteractPulse(wx, wy, color) {
      const col = color || '#ffe08a';
      this.aoeEffects.push({ x: wx, y: wy, radius: 56, duration: 0.5, timer: 0.5, color: col, ring: true });
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * TAU;
        const sp = 26 + Math.random() * 70;
        this.addParticle({
          wx, wy, wz: 12 + Math.random() * 16,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 50 + Math.random() * 50,
          color: i % 2 ? col : '#ffffff', size: 1.6 + Math.random() * 2,
          life: 0.45 + Math.random() * 0.3, grav: 40, additive: true
        });
      }
    }

    // LoL tarzı menzil göstergesi: zemin decal'i, yalnızca yerel oyuncuya çizilir.
    // `pre` kısa bir "önizleme" hissi verir; asıl efekt ayrıca oynar.
    showRangePing(x, y, radius, color, opts = {}) {
      this.rangePings.push({
        x, y, radius, color: color || '#80deea',
        duration: opts.duration || 0.55, timer: opts.duration || 0.55,
        arc: opts.arc || 0, angle: opts.angle || 0,
        thin: !!opts.thin,
        seed: Math.random() * 100,
      });
    }

    // ======================================================================
    // SAVUNMA SİSTEMİ — PARRY · BLOCK · GUARD PRESSURE · GUARDBREAK
    // ======================================================================
    // Kısa hit-stop: ağır vuruşlarda birkaç karelik "donma" hissi.
    hitstop(sec) {
      const s = Math.max(0, Number(sec) || 0);
      if (s <= 0 || this.lowFx) return;
      this._hitstop = Math.max(this._hitstop || 0, s);
    }

    // F'ye basıldı: hazırlık -> parry penceresi. Basılı tutulursa bloka geçer.
    parryPress() {
      const P = this.player;
      if (!P || this.downed || this._down) return;
      const cfg = this.combatCfg.parry;
      if (P.guardbreakTimer > 0) return;     // guardbreak: savunma kilitli
      if (P.parryRecovery > 0) return;       // kaçırma cezası: yeni deneme yok
      if (P.parryPhase !== 'idle') return;   // deneme sürerken yeniden basış sayılmaz
      if (P.parryHeld) return;               // tek basış = tek deneme (hold spammı yok)
      P.parryHeld = true;
      P.parryPhase = 'startup';
      P.parryTimer = Math.max(0.01, Number(cfg.startup) || 0.08);
      P.guardVisible = Math.max(P.guardVisible || 0, this.combatCfg.guard.fadeDelay);
      if (this.sound) this.sound.play('guard', 0.45);
    }

    // F bırakıldı: bloktan çık. Parry penceresi kendi süresini tamamlar
    // (hızlı "tap parry" da çalışsın diye).
    parryRelease() {
      const P = this.player;
      if (!P) return;
      P.parryHeld = false;
      if (P.parryPhase === 'block') { P.parryPhase = 'idle'; P.parryTimer = 0; }
    }

    // Parry denemesi boşa gitti: ceza. Saldırı/dash/animation bunu iptal edemez.
    beginParryWhiff() {
      const P = this.player;
      if (!P) return;
      const cfg = this.combatCfg.parry;
      P.parryRecovery = Math.max(0, Number(cfg.whiffRecovery) || 0);
      P.parryPhase = 'idle';
      P.parryTimer = 0;
      // Boşa savurma: silah ileri kaçar (ceza hissi).
      this.swingWeapon('thrust', { angle: P.facingAngle, color: '#e57373', duration: 0.3, trail: false });
      if (this.sound) this.sound.play('guard', 0.3);
      this.spawnCombatIndicator('FAILED PARRY', '#e57373', { duration: 0.8 });
      if (this.onCombatEvent) { try { this.onCombatEvent('parry_miss'); } catch (e) {} }
    }

    // Kusursuz parry: hasarı tamamen iptal eder, düşman saldırısını böler.
    perfectParry(fromMonster, angle, atkKind, allowInterrupt) {
      const P = this.player;
      if (!P) return;
      const cfg = this.combatCfg;
      P.parryPhase = 'idle';
      P.parryTimer = 0;
      P.parryRecovery = Math.max(0, Number(cfg.parry.successRecovery) || 0);
      P.parrySuccessAt = this.time;
      P.counterUntil = this.time + (Number(cfg.parry.counterWindow) || 0.5);
      P.attackCooldownTimer = 0;             // anında karşı atak fırsatı
      P.guardVisible = Math.max(P.guardVisible || 0, cfg.guard.fadeDelay);
      // Başarılı parry'den sonra tuş basılıysa normal bloka geç (yeni parry için
      // F bırakılıp yeniden basılmalı — hold ile otomatik parry YOK).
      P.parryPhase = P.parryHeld ? 'block' : 'idle';
      // Guard pressure YOK — kusursuz parry baskı üretmez.
      this.spawnCombatIndicator('PERFECT PARRY', '#4dd0e1', { duration: 1.0, big: true });
      if (this.sound) this.sound.play('parry');
      // Savuşturma animasyonu: silah gelen saldırı yönüne doğru savrulur.
      const deflectAngle = Number.isFinite(angle) ? angle : P.facingAngle;
      this.swingWeapon('slash', { angle: deflectAngle, color: '#80deea', duration: 0.26, trail: true, radius: 56, arc: 1.7 });
      this.addTrauma(0.26);
      this.hitstop(0.07);
      const px = P.x, py = P.y;
      this.aoeEffects.push({ x: px, y: py, radius: 46, duration: 0.34, timer: 0.34, color: '#4dd0e1', ring: true });
      this.aoeEffects.push({ x: px, y: py, radius: 22, duration: 0.2, timer: 0.2, color: '#e0f7fa', ring: true });
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * TAU, sp = 90 + Math.random() * 240;
        this.addParticle({
          wx: px, wy: py, wz: 18 + Math.random() * 18,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 40 + Math.random() * 90,
          color: i % 3 ? '#4dd0e1' : '#ffffff', size: 2 + Math.random() * 2.4,
          life: 0.32 + Math.random() * 0.3, grav: 40, additive: true
        });
      }
      if (fromMonster && fromMonster.hp > 0) {
        // Saldırıyı iptal et + kısa sersemletme (karşı atak penceresi).
        // allowInterrupt === false ise (mermi parry) canavarın cast'i bozulmaz.
        if (allowInterrupt !== false) {
          fromMonster.cast = null;
          fromMonster.meleeWindup = null;
          fromMonster.parriedTimer = 0.45;
        }
        fromMonster.flashTimer = Math.max(fromMonster.flashTimer || 0, 0.2);
        fromMonster.attackTimer = Math.max(fromMonster.attackTimer || 0, 0.45);
      }
      if (this.onCombatEvent) { try { this.onCombatEvent('parry'); } catch (e) {} }
    }

    // Guard Pressure ekle; 100'e ulaşırsa guardbreak.
    addGuardPressure(amount) {
      const P = this.player;
      if (!P) return;
      const cfg = this.combatCfg.guard;
      const add = Math.max(0, Number(amount) || 0);
      if (add <= 0 || P.guardbreakTimer > 0) return;
      P.guard = Math.min(cfg.max, P.guard + add);
      P.guardDecayDelay = cfg.decayDelay;
      P.guardVisible = cfg.fadeDelay;
      if (P.guard >= cfg.max) this.triggerGuardbreak();
    }

    triggerGuardbreak() {
      const P = this.player;
      if (!P) return;
      const cfg = this.combatCfg.guard;
      if (P.guardbreakTimer > 0) return;
      P.guard = cfg.max;
      P.guardbreakTimer = cfg.breakDuration;
      P.parryPhase = 'idle';
      P.parryTimer = 0;
      P.parryHeld = false;
      P.parryRecovery = 0;
      P.isDashing = false;
      P.dashTimer = 0;
      P.guardVisible = cfg.fadeDelay;
      P.attackCooldownTimer = Math.max(P.attackCooldownTimer || 0, 0.5);
      this.spawnCombatIndicator('GUARD BREAK', '#ff8a65', { duration: 1.2, big: true });
      if (this.sound) this.sound.play('guardbreak');
      // Savunma kırıldı: silah aşağı savrulur (stagger hissi).
      this.swingWeapon('slam', { angle: P.facingAngle + Math.PI, color: '#ff7043', duration: 0.5, trail: false });
      this.addTrauma(0.55);
      this.hitstop(0.12);
      this.aoeEffects.push({ x: P.x, y: P.y, radius: 66, duration: 0.5, timer: 0.5, color: '#ff7043', ring: true, cracks: true });
      this.spawnExplosionParticles(P.x, P.y, 28, '#ff7043');
      if (this.onCombatEvent) { try { this.onCombatEvent('guardbreak'); } catch (e) {} }
    }

    // Sprint: Shift + hareket. Stamina biterse durur.
    isSprinting() {
      const P = this.player;
      if (!P || this.downed || this._down) return false;
      if (P.guardbreakTimer > 0 || (P.skillLock || 0) > 0 || P.isDashing || P.channel) return false;
      if (P.parryPhase === 'block' || P.parryPhase === 'startup' || P.parryPhase === 'window') return false;
      if (P.stamina <= 0.5) return false;
      if (!(this.keys['shift'] || this.keys['shiftleft'] || this.keys['shiftright'])) return false;
      const moving = this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'] ||
        this.keys['arrowup'] || this.keys['arrowdown'] || this.keys['arrowleft'] || this.keys['arrowright'];
      return !!moving;
    }

    moveSpeedMult() {
      const P = this.player;
      let m = 1;
      if (!P) return m;
      if (P.guardbreakTimer > 0) m *= this.combatCfg.guard.breakSlow;
      if (P.sprinting) m *= this.combatCfg.sprint.mult;
      return m;
    }

    // Savunma durum makinesi + stamina/guard güncellemesi (her kare).
    updateCombatDefense(dt) {
      const P = this.player;
      if (!P) return;
      const cfg = this.combatCfg;

      if (P.dodgeIframes > 0) P.dodgeIframes = Math.max(0, P.dodgeIframes - dt);

      // --- Guardbreak sayacı ---
      if (P.guardbreakTimer > 0) {
        P.guardbreakTimer = Math.max(0, P.guardbreakTimer - dt);
        if (P.guardbreakTimer === 0) {
          P.guard = 0;                       // guardbreak sonrası sıfırlanır
          P.guardDecayDelay = 0;
          this.spawnCombatIndicator('GUARD UP', '#80deea', { duration: 0.6 });
        }
      }

      // --- Parry ceza sayacı ---
      if (P.parryRecovery > 0) {
        P.parryRecovery = Math.max(0, P.parryRecovery - dt);
      }

      // --- Parry/blok fazları ---
      if (P.guardbreakTimer > 0) {
        if (P.parryPhase !== 'idle') { P.parryPhase = 'idle'; P.parryTimer = 0; }
      } else if (P.parryRecovery <= 0) {
        if (P.parryPhase === 'startup') {
          P.parryTimer -= dt;
          if (P.parryTimer <= 0) {
            P.parryPhase = 'window';
            P.parryTimer = Math.max(0.02, Number(cfg.parry.window) || 0.2);
          }
        } else if (P.parryPhase === 'window') {
          P.parryTimer -= dt;
          if (P.parryTimer <= 0) {
            if (P.parryHeld) {
              // Pencere bitti ama F hâlâ basılı -> normal blok
              P.parryPhase = 'block';
              P.parryTimer = 0;
            } else {
              P.parryPhase = 'idle';
              P.parryTimer = 0;
              this.beginParryWhiff();
            }
          }
        }
      }

      // --- Guard Pressure azalması ---
      if (P.guard > 0) {
        if (P.guardDecayDelay > 0) P.guardDecayDelay = Math.max(0, P.guardDecayDelay - dt);
        else P.guard = Math.max(0, P.guard - (Number(cfg.guard.decayRate) || 0) * dt);
      }
      if (P.guardVisible > 0) P.guardVisible = Math.max(0, P.guardVisible - dt);

      // --- Stamina ---
      const sprinting = this.isSprinting();
      P.sprinting = sprinting;
      if (sprinting) {
        P.stamina = Math.max(0, P.stamina - (Number(cfg.stamina.sprintDrain) || 0) * dt);
        P.staminaIdle = Number(cfg.stamina.regenDelay) || 0;
      } else if (P.staminaIdle > 0) {
        P.staminaIdle = Math.max(0, P.staminaIdle - dt);
      } else if (P.stamina < (P.staminaMax || cfg.stamina.max)) {
        P.stamina = Math.min(P.staminaMax || cfg.stamina.max, P.stamina + (Number(cfg.stamina.regen) || 0) * dt);
      }
    }

    // --- Savaş göstergeleri (oyuncunun yanında, ekran ortası bildirimi DEĞİL) ---
    spawnCombatIndicator(text, color, opts) {
      const o = opts || {};
      const list = this.combatIndicators || (this.combatIndicators = []);
      const label = String(text || '');
      // Aynı yazı üst üste binmesin (spam koruması).
      for (let i = 0; i < list.length; i++) {
        if (list[i].text === label && list[i].timer > list[i].duration * 0.35) return;
      }
      const dur = Number(o.duration) || 0.85;
      list.push({
        text: label, color: color || '#80deea', icon: o.icon || '',
        duration: dur, timer: dur, big: !!o.big,
        rise: o.rise != null ? Number(o.rise) : 34,
        jitter: (Math.random() - 0.5) * 10, seed: Math.random() * 10
      });
      if (list.length > 6) list.splice(0, list.length - 6);
    }

    updateCombatIndicators(dt) {
      const list = this.combatIndicators;
      if (!list || !list.length) return;
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].timer -= dt;
        if (list[i].timer <= 0) list.splice(i, 1);
      }
    }

    renderCombatIndicators(ctx) {
      const list = this.combatIndicators;
      if (!list || !list.length || !this.player) return;
      const P = this.player;
      const base = this.iso(P.x, P.y, P.z || 0);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        const p = clamp(1 - it.timer / it.duration, 0, 1);
        const fadeIn = Math.min(1, p / 0.14);
        const fadeOut = 1 - clamp((p - 0.6) / 0.4, 0, 1);
        const a = Math.max(0, Math.min(1, fadeIn * fadeOut));
        if (a <= 0.02) continue;
        const lift = 52 + easeOut(p) * it.rise;
        const x = base.x + it.jitter * (1 - p);
        const y = base.y - lift - i * 2;
        const pop = it.big ? 1 + 0.22 * Math.sin(Math.min(1, p / 0.22) * Math.PI) : 1;
        const size = (it.big ? 12.5 : 10) * pop;
        ctx.font = `800 ${size}px Inter, system-ui, sans-serif`;
        const tw = ctx.measureText(it.text).width;
        // Küçük koyu zemin: okunabilirlik (izometrik perspektifte net kalsın).
        ctx.globalAlpha = a * 0.62;
        ctx.fillStyle = 'rgba(6,16,24,0.72)';
        rr(ctx, x - tw / 2 - 8, y - size * 0.85, tw + 16, size * 1.7, 6);
        ctx.fill();
        ctx.globalAlpha = a * 0.85;
        ctx.strokeStyle = rgba(it.color, 0.75);
        ctx.lineWidth = 1;
        rr(ctx, x - tw / 2 - 8, y - size * 0.85, tw + 16, size * 1.7, 6);
        ctx.stroke();
        // Yazı + hafif parlama
        ctx.globalAlpha = a;
        ctx.shadowColor = it.color;
        ctx.shadowBlur = it.big ? 12 : 7;
        ctx.fillStyle = it.color;
        ctx.fillText(it.text, x, y);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Savunma duruşu görseli: blok kalkanı / parry parlaması / guardbreak kırığı.
    renderPlayerDefenseFx(ctx) {
      const P = this.player;
      if (!P || this.downed) return;
      const phase = P.parryPhase;
      const breaking = (P.guardbreakTimer || 0) > 0;
      if ((!phase || phase === 'idle') && !breaking && !(P.guard > 0.5)) return;
      const p = this.iso(P.x, P.y, 0);
      const fa = worldAngleToScreen(P.facingAngle);
      ctx.save();
      ctx.lineCap = 'round';
      if (breaking) {
        // Guardbreak: turuncu, titreyen kırık halka.
        const t = this.time;
        const a = 0.35 + 0.25 * Math.sin(t * 22);
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#ff7043';
        ctx.lineWidth = 2.4;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(p.x, p.y - 10, 26 + i * 6, (26 + i * 6) * ISO_RY / ISO_RX, 0, i * 2, i * 2 + 1.9);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (phase === 'window') {
        // Kusursuz parry penceresi: ince, parlak cyan yay.
        const a = 0.55 + 0.35 * Math.sin(this.time * 26);
        ctx.globalAlpha = a;
        drawGlow(ctx, p.x + Math.cos(fa) * 14, p.y - 16 + Math.sin(fa) * 7, 16, '#4dd0e1', 0.55);
        ctx.strokeStyle = '#b2ebf2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 16, 20, fa - 0.7, fa + 0.7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (phase === 'startup') {
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#e0f7fa';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 16, 16, fa - 0.5, fa + 0.5);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (phase === 'block' || P.guard > 0.5) {
        // Blok: mavi yarım daire kalkan + baskı arttıkça kızaran kenar.
        const g = clamp((P.guard || 0) / (this.combatCfg.guard.max || 100), 0, 1);
        const col = g > 0.75 ? '#ff8a65' : '#64b5f6';
        ctx.globalAlpha = 0.32 + g * 0.3;
        drawGlow(ctx, p.x + Math.cos(fa) * 12, p.y - 17 + Math.sin(fa) * 6, 20, col, 0.35 + g * 0.35);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 17, 21, fa - 0.85, fa + 0.85);
        ctx.stroke();
        ctx.globalAlpha = 0.18 + g * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 17, 15, fa - 0.7, fa + 0.7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    // --- Düşman saldırı sınıflandırma (per-attack ayarlanabilir) ---
    telegraphDurationFor(kind) {
      const t = this.combatCfg.telegraph;
      return Number(t[kind] != null ? t[kind] : t.normal) || 0.35;
    }

    classifyMonsterAttack(m) {
      const ranged = m.ability === 'ranged';
      const boss = !!(m.boss || m.isBoss);
      const kind = m.attackKind || (boss ? 'heavy' : (ranged ? 'medium' : 'light'));
      return {
        kind,
        defense: m.attackDefense || DEFENSE.PARRYABLE,
        telegraph: Number(m.attackTelegraph) || this.telegraphDurationFor(kind),
        guardPressure: m.guardPressure != null ? Number(m.guardPressure) : (GUARD_PRESSURE[kind] || GUARD_PRESSURE.medium),
        ranged,
        // Yakın dövüş erişimi: AI'nın kullandığı gerçek reach (yarıçap + oyuncu yarıçapı).
        range: ranged ? 420 : ((m.radius || 18) + (this.player ? this.player.radius : 18) + 8),
      };
    }

    classifyMonsterSkill(m, sk) {
      let defense = sk.defense || '';
      if (!defense) {
        if (sk.parryable === false) defense = sk.blockable === false ? DEFENSE.DODGE : DEFENSE.BLOCK;
        else if (sk.kind === 'slam' || sk.kind === 'dash') defense = DEFENSE.DODGE;
        else defense = DEFENSE.PARRYABLE;
      }
      let kind = sk.attackKind || '';
      if (!kind) {
        const power = Number(sk.power) || 1;
        kind = (sk.kind === 'slam' || sk.kind === 'dash') ? 'ultimate' : (power >= 1.6 ? 'skill' : 'medium');
      }
      return {
        kind,
        defense,
        telegraph: Number(sk.windup) || Number(sk.telegraph) || this.telegraphDurationFor(sk.kind === 'slam' ? 'heavy' : 'normal'),
        guardPressure: sk.guardPressure != null ? Number(sk.guardPressure) : (GUARD_PRESSURE[kind] || 25),
      };
    }

    // ======================================================================
    // DASH / SALDIRI / YETENEKLER (mekanikler değişmedi)
    // ======================================================================
    triggerDash() {
      if (this.downed || this._down) return;
      const P = this.player;
      const cfg = this.combatCfg;
      if (P.guardbreakTimer > 0) return;                  // guardbreak: dash yok
      if (P.parryRecovery > 0) return;                    // parry cezası iptal edilemez
      if (P.isDashing || P.dashCooldownTimer > 0) return;
      const cost = Number(cfg.stamina.dashCost != null ? cfg.stamina.dashCost : cfg.dash.staminaCost) || 0;
      if (P.stamina < cost) {                             // yetersiz stamina
        this.spawnCombatIndicator('NO STAMINA', '#90a4ae', { duration: 0.6 });
        return;
      }
      P.stamina = Math.max(0, P.stamina - cost);
      P.staminaIdle = Number(cfg.stamina.regenDelay) || 0;
      P.dashDuration = Number(cfg.dash.duration) || 0.22;
      P.dashCooldown = Number(cfg.dash.cooldown) || 1.05;
      P.isDashing = true;
      P.dashTimer = P.dashDuration;
      P.dashCooldownTimer = P.dashCooldown;
      P.dodgeIframes = Math.max(P.dodgeIframes || 0, Number(cfg.dash.iframes) || 0);
      this.lastDodgeTime = this.time;
      this.spawnCombatIndicator('DODGE', '#e0f7fa', { duration: 0.55 });
      this.sound.play('dash');

      // Dash yönü: o an bastığımız hareket tuşları (yürüdüğümüz yön).
      // Tuş yoksa fareye doğru gider. Böylece geriye/yanlara da dash atılabilir.
      let mvx = 0, mvy = 0;
      if (this.keys['w'] || this.keys['arrowup']) mvy -= 1;
      if (this.keys['s'] || this.keys['arrowdown']) mvy += 1;
      if (this.keys['a'] || this.keys['arrowleft']) mvx -= 1;
      if (this.keys['d'] || this.keys['arrowright']) mvx += 1;

      let dx, dy;
      if (mvx !== 0 || mvy !== 0) {
        const ml = Math.hypot(mvx, mvy) || 1;
        const nx = mvx / ml, ny = mvy / ml;
        // Yürüme koduyla aynı izometrik dönüşüm: dash tam olarak gittiğimiz yöne olsun.
        dx = ny * 0.707 + nx * 0.707;
        dy = ny * 0.707 - nx * 0.707;
      } else {
        dx = this.mouse.worldX - this.player.x;
        dy = this.mouse.worldY - this.player.y;
      }
      const len = Math.hypot(dx, dy) || 1;
      const dashSpeed = Number(cfg.dash.speed) || 680;
      this.player.dashVx = (dx / len) * dashSpeed;
      this.player.dashVy = (dy / len) * dashSpeed;

      this.addTrauma(0.2);
      this.createGhostTrail();
      this.emitAllyAction({ kind: 'dash', x: this.player.x, y: this.player.y, angle: Math.atan2(this.player.dashVy, this.player.dashVx), color: this.getArchetypeColor() });
      // Dash tozu + zeminde küçük 3D halka dalgası
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * TAU;
        const sp = 40 + Math.random() * 120;
        this.addParticle({
          wx: this.player.x, wy: this.player.y, wz: 4 + Math.random() * 10,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 20 + Math.random() * 40,
          color: i % 3 ? '#8d7b62' : '#c9b18e', size: 2 + Math.random() * 3,
          life: 0.35 + Math.random() * 0.25, grav: 60, additive: false, grow: 8
        });
      }
      this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 34, duration: 0.28, timer: 0.28, color: '#cfd8dc', ring: true });
    }

    // Silah savurma animasyonu: TEMEL saldırı + yetenekler aynı sistemi kullanır.
    // kind: 'swing' | 'slash' | 'slam' | 'thrust' | 'spin' | 'cast'
    swingWeapon(kind, opts) {
      const P = this.player;
      if (!P) return null;
      const o = opts || {};
      const mode = kind || (P.style && P.style.atkMode) || 'swing';
      let dur = Number(o.duration) || 0;
      if (!dur) {
        dur = mode === 'slam' ? 0.42 : (mode === 'spin' ? 0.5 : (mode === 'thrust' ? 0.26 : 0.32));
      }
      const angle = o.angle != null ? Number(o.angle) : P.facingAngle;
      const dir = o.dir != null ? Number(o.dir) : (P.swingDir *= -1);
      P.weaponSwing = {
        kind: mode, timer: dur, duration: dur, dir,
        angle,
        color: o.color || (P.style && P.style.slash) || '#9fd8ff',
      };
      P.attackAnimTimer = Math.max(P.attackAnimTimer || 0, Math.min(0.5, dur));
      P.facingAngle = angle;
      if (o.lunge) {
        P.x += Math.cos(angle) * Number(o.lunge);
        P.y += Math.sin(angle) * Number(o.lunge);
        if (typeof this.clampPlayerToWorld === 'function') this.clampPlayerToWorld();
      }
      if (o.trail) {
        this.slashes.push({
          x: P.x, y: P.y, angle,
          radius: Number(o.radius) || 70,
          arc: Number(o.arc) || 1.2,
          duration: dur * 0.7, timer: dur * 0.7,
          color: P.weaponSwing.color, dir
        });
      }
      return P.weaponSwing;
    }

    createGhostTrail() {      this.player.ghostTrails.push({
        x: this.player.x, y: this.player.y, facingAngle: this.player.facingAngle,
        alpha: 0.75, color: this.getArchetypeColor()
      });
    }

    triggerPrimaryAttack() {
      if (this.downed || this._down) return;
      if (this.player.guardbreakTimer > 0) return;      // guardbreak: saldırı kilitli
      if (this.player.parryRecovery > 0) return;        // parry cezası iptal edilemez
      if (this.player.attackCooldownTimer > 0) return;

      const stats = this.playerData.stats;
      this.player.attackCooldownTimer = this.player.attackCooldown / (this.player.hasteMul || 1);
      this.player.isAttacking = true;
      this.player.attackAnimTimer = 0.22;
      this.player.swingDir *= -1; // görsel: savurma yönü dönüşümlü

      const archetype = this.player.archetype;
      const _ap = this.aimPoint();
      const aimAngle = Math.atan2(_ap.y - this.player.y, _ap.x - this.player.x);
      this.player.facingAngle = aimAngle;
      // Silah gerçekten savrulsun (sınıfa özgü mod: swing/slash/slam/thrust/cast).
      const styleMode = (this.player.style && this.player.style.atkMode) || 'swing';
      this.swingWeapon(styleMode, { angle: aimAngle, color: this.player.style && this.player.style.slash, trail: false });
      this.emitAllyAction({ kind: 'attack', x: this.player.x, y: this.player.y, angle: aimAngle });

      const critBonusP = this.passiveCritBonus();
      const isCrit = Math.random() < ((stats.critChance || 0.15) + critBonusP.chance);
      const autoEl = this.autoElement();
      this._castElement = autoEl;
      this._castElementUntil = performance.now() + 400;
      const baseDamage = (stats.attack || 50) * this.damageScale();
      const damage = Math.round(isCrit ? baseDamage * ((stats.critMultiplier || 2.0) + critBonusP.damage) : baseDamage);

      if (archetype === ARCHETYPES.MELEE) {
        this.sound.play(isCrit ? 'crit' : 'slash');
        this.addTrauma(isCrit ? 0.35 : 0.2);
        // Menzil küçültüldü (75 -> 55): yakın dövüş gerçekten yakın olmalı.
        this.slashes.push({
          x: this.player.x, y: this.player.y, angle: aimAngle, radius: 55, arc: Math.PI * 0.68,
          duration: 0.2, timer: 0.2, color: isCrit ? '#ffb300' : this.player.style.slash, dir: this.player.swingDir
        });
        this.monsters.forEach((m) => {
          if (m.hp <= 0) return;
          const dist = Math.hypot(m.x - this.player.x, m.y - this.player.y);
          if (dist <= 55 + m.radius) {
            const angleToM = Math.atan2(m.y - this.player.y, m.x - this.player.x);
            let diff = Math.abs(angleToM - aimAngle);
            while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
            if (diff <= (Math.PI * 0.68) / 2) this.applyDamageToMonster(m, damage, isCrit, aimAngle, 300);
          }
        });

      } else if (archetype === ARCHETYPES.RANGED) {
        this.sound.play('shoot');
        this.projectiles.push({
          type: 'arrow', x: this.player.x + Math.cos(aimAngle) * 20, y: this.player.y + Math.sin(aimAngle) * 20,
          vx: Math.cos(aimAngle) * 650, vy: Math.sin(aimAngle) * 650, radius: 6, life: 0.85,
          damage, isCrit, element: autoEl, color: this.player.style.proj
        });

      } else if (archetype === ARCHETYPES.MAGE) {
        this.sound.play('shoot');
        this.projectiles.push({
          type: 'magic_orb', x: this.player.x + Math.cos(aimAngle) * 20, y: this.player.y + Math.sin(aimAngle) * 20,
          vx: Math.cos(aimAngle) * 520, vy: Math.sin(aimAngle) * 520, radius: 10, life: 1.0,
          damage, isCrit, element: autoEl, color: this.player.style.proj
        });

      } else if (archetype === ARCHETYPES.SHADOW) {
        this.sound.play(isCrit ? 'crit' : 'slash');
        // Menzil küçültüldü (65 -> 48).
        this.slashes.push({
          x: this.player.x, y: this.player.y, angle: aimAngle, radius: 48, arc: Math.PI * 0.55,
          duration: 0.16, timer: 0.16, color: this.player.style.slash, dir: this.player.swingDir
        });
        this.monsters.forEach((m) => {
          if (m.hp <= 0) return;
          const dist = Math.hypot(m.x - this.player.x, m.y - this.player.y);
          if (dist <= 48 + m.radius) {
            const angleToM = Math.atan2(m.y - this.player.y, m.x - this.player.x);
            let diff = Math.abs(angleToM - aimAngle);
            while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
            if (diff <= (Math.PI * 0.55) / 2) this.applyDamageToMonster(m, damage, isCrit, aimAngle, 0);
          }
        });

      } else if (archetype === ARCHETYPES.TAMER) {
        this.sound.play('shoot');
        this.projectiles.push({
          type: 'primal_fang', x: this.player.x + Math.cos(aimAngle) * 20, y: this.player.y + Math.sin(aimAngle) * 20,
          vx: Math.cos(aimAngle) * 580, vy: Math.sin(aimAngle) * 580, radius: 8, life: 0.9,
          damage, isCrit, element: autoEl, color: this.player.style.proj
        });
        this.commandPetAttack();
      }
    }

    triggerSkill(key) {
      if (this.downed || this._down) return;
      if (this.player.guardbreakTimer > 0) return;      // guardbreak: yetenek kilitli
      if (this.player.parryRecovery > 0) return;        // parry cezası iptal edilemez
      const cd = this.player.cooldowns[key];
      if (!cd) return;

      const skillSet = this.classSkillSet();
      const sk = skillSet ? skillSet[key] : null;

      // Cooldown'da olsa da menzil/alan göstergesi görünür: oyuncu tuşa bastığında
      // "bu yetenek nereyi vuruyor" her zaman anlaşılır (LoL tarzı).
      this.showSkillPreview(key, sk);

      if (cd.current > 0) return;

      if (sk) {
        cd.max = Math.max(1, Number(sk.cd) || cd.max);
        cd.current = cd.max;
        this.emitAllyAction({
          kind: 'skill',
          x: this.player.x, y: this.player.y,
          angle: this.skillAim(),
          color: sk.color || this.getArchetypeColor(),
          radius: Number(sk.radius) || Number(sk.visualRadius) || 0,
          range: Number(sk.range) || 0,
          visual: sk.visual || '',
          name: sk.name || '',
        });
        return this.castClassSkill(key, sk);
      }

      // İçerik gelmediyse eski archetype davranışı aynen korunur.
      return this.triggerArchetypeSkill(key);
    }

    // --- Yetenek önizlemesi (cooldown'dan bağımsız) ---
    skillAim() {
      const p = this.aimPoint();
      return Math.atan2(p.y - this.player.y, p.x - this.player.x);
    }

    // Nişan alınan dünya noktası. Öncelik: tek seferlik hedef > mobil yön > fare.
    aimPoint() {
      const P = this.player;
      const o = this.aimOverride;
      if (o && o.t > this.time) return { x: o.x, y: o.y };
      if (this.touchAim) return { x: P.x + this.touchAim.x * 300, y: P.y + this.touchAim.y * 300 };
      return { x: this.mouse.worldX, y: this.mouse.worldY };
    }

    // Mobil joystick: dünya uzayında birim yön (ekran yönü değil).
    setTouchAim(wx, wy) {
      const l = Math.hypot(wx, wy);
      if (!(l > 0.0001)) return;
      this.touchAim = { x: wx / l, y: wy / l };
    }

    // Mobilde ekrana dokununca o noktaya nişan al.
    aimAtWorld(x, y, hold = 0.6) {
      this.aimOverride = { x, y, t: this.time + hold };
    }
    // Hedefli büyüler için menzil sınırı: imleç çok uzaksa hedefi `range`
    // yarıçapına çeker. Böylece haritanın öbür ucuna skill atılamaz.
    castTargetPoint(sk) {
      const P = this.player;
      const ap = this.aimPoint();
      const mx = ap.x, my = ap.y;
      const kind = sk && sk.kind;
      let maxR = sk && sk.range != null ? Number(sk.range) : NaN;
      if (!Number.isFinite(maxR) || maxR <= 0) {
        maxR = (kind === 'ground' || kind === 'meteor' || kind === 'vortex') ? 340 : Infinity;
      }
      const dx = mx - P.x, dy = my - P.y;
      const d = Math.hypot(dx, dy);
      if (!Number.isFinite(maxR) || d <= maxR || d < 0.001) return { x: mx, y: my, maxR, clamped: false };
      return { x: P.x + (dx / d) * maxR, y: P.y + (dy / d) * maxR, maxR, clamped: true };
    }
    // Verilen noktaya en yakın canlı canavar (zincir yetenekleri için).
    nearestMonster(x, y, range, exclude) {
      let best = null, bestD = Infinity;
      for (const m of this.monsters) {
        if (!m || m.hp <= 0) continue;
        if (exclude && exclude.has(m.id)) continue;
        const d = Math.hypot(m.x - x, m.y - y);
        if (d <= range + (m.radius || 0) && d < bestD) { best = m; bestD = d; }
      }
      return best;
    }
    skillPowerBonus(sk) {
      const st = this.playerData.stats || {};
      const mp = Number(st.magicPower) || 0;
      const useMagic = sk && sk.magic;
      const base = (Number(st.attack) || 0) + (useMagic ? mp * 0.8 : mp * 0.25);
      return base * this.damageScale();
    }
    // Sınıf dengeleme çarpanı (ARPG hasarı). travelSkills.js de bunu kullanır.
    damageScale() { return classTravelScale(this.playerData && this.playerData.class); }
    skillDamage(sk) {
      return Math.max(1, Math.round(this.skillPowerBonus(sk) * (Number(sk.power) || 1)));
    }

    // TravelSkills: efekt rengi mana rengine boyanır (yoksa sınıf rengi).
    getManaColor() { return this.manaColor || null; }
    setManaColor(hex) { this.manaColor = hex || null; return this.manaColor; }

    // Claude'un görsel kütüphanesi (travel_visuals.js) yüklüyse, yeteneğin
    // mekaniği çalışırken hazır efekti de oynat. Görsel yoksa sessizce atlanır.
    emitSkillVisual(sk, kind, aim) {
      if (!sk || !sk.visual || typeof this.castVisual !== 'function' || !this.player) return;
      const P = this.player;
      let wx = P.x, wy = P.y, follow = false;
      if (kind === 'meteor' || kind === 'ground' || kind === 'vortex') {
        const tp = this.castTargetPoint(sk);
        wx = tp.x; wy = tp.y;
      } else if (kind === 'channel' || kind === 'orbit' || kind === 'arc') {
        // Yakın dövüş yayları oyuncunun etrafında döner: efekti oyuncuya bağla
        // (sabit noktada kalırsa karakter hareket edince kılıç geride kalıyor).
        follow = true;
      }
      const opts = {
        color: (this.skin && this.skin.primary) || sk.color || undefined,
        radius: Number(sk.visualRadius || sk.radius) || undefined,
        angle: aim,
        follow,
        // Kılıç etrafında ~3 tur atsın (spinSlash bu değeri kullanır).
        turns: kind === 'arc' ? 3 : undefined
      };
      try { this.castVisual(sk.visual, wx, wy, opts); } catch (e) { /* görsel isteğe bağlı */ }
    }

    showSkillPreview(key, sk) {
      const aim = this.skillAim();
      const color = (sk && sk.color) || this.getArchetypeColor();
      if (!sk) {
        // Fallback önizleme: archetype menzili.
        const r = this.player.archetype === ARCHETYPES.MELEE ? 80 : 120;
        const arc = this.player.archetype === ARCHETYPES.MELEE || this.player.archetype === ARCHETYPES.SHADOW ? Math.PI * 0.9 : 0;
        this.showRangePing(this.player.x, this.player.y, r, color, { arc, angle: aim, duration: 0.45 });
        return;
      }
      const kind = sk.kind;
      const radius = Number(sk.radius) || 80;
      if (kind === 'arc') {
        this.showRangePing(this.player.x, this.player.y, Number(sk.radius) || 100, color, { arc: (Number(sk.arc) || 1.0), angle: aim, duration: 0.45 });
      } else if (kind === 'aoe' || kind === 'dash' || kind === 'teleport') {
        const off = Number(sk.offset != null ? sk.offset : (sk.range || 60));
        const gx = this.player.x + Math.cos(aim) * off;
        const gy = this.player.y + Math.sin(aim) * off;
        this.showRangePing(gx, gy, radius, color, { arc: TAU, duration: 0.45 });
      } else if (kind === 'meteor' || kind === 'ground' || kind === 'vortex') {
        // Hedef menzile kırpılır; ayrıca "nereye kadar atabilirim" halkası gösterilir.
        const tp = this.castTargetPoint(sk);
        if (Number.isFinite(tp.maxR)) {
          this.showRangePing(this.player.x, this.player.y, tp.maxR, color, { arc: TAU, duration: 0.55, thin: true });
        }
        this.showRangePing(tp.x, tp.y, radius, color, { arc: TAU, duration: 0.5 });
      } else if (kind === 'quake' || kind === 'orbit') {
        this.showRangePing(this.player.x, this.player.y, radius, color, { arc: TAU, duration: 0.5 });
      } else if (kind === 'chain') {
        const r = Number(sk.radius) || 320;
        this.showRangePing(this.player.x, this.player.y, r, color, { arc: TAU, duration: 0.5, thin: true });
      } else if (kind === 'nova' || kind === 'shield' || kind === 'heal') {
        this.showRangePing(this.player.x, this.player.y, radius, color, { arc: TAU, duration: 0.45 });
      } else if (kind === 'projectile' || kind === 'fan') {
        this.showRangePing(this.player.x, this.player.y, 24, color, { duration: 0.3 });
      } else if (kind === 'beam') {
        this.showRangePing(this.player.x, this.player.y, Number(sk.range) || 220, color, { arc: 0.35, angle: aim, duration: 0.4 });
      } else {
        this.showRangePing(this.player.x, this.player.y, radius, color, { arc: TAU, duration: 0.4 });
      }
    }

    // --- Sınıf yeteneği uygulama ---
    castClassSkill(key, sk) {
      // Yeteneğin elementi: alan/konik vuruşların hasar hesabında kullanılır.
      this._castElement = (sk && sk.element) || this.autoElement();
      this._castElementUntil = performance.now() + 1500;
      // --- 1) VERİDEN gelen davranış (content.js arpgSkills -> behavior + params) ---
      // GameCraft "Travel ARPG" sekmesinde düzenlenen asıl yol.
      if (sk && sk.behavior) {
        const TS = global.TravelSkills;
        if (TS && TS.runSkill) {
          this.emitSkinFx(this.player.x, this.player.y, 10);
          try { if (TS.runSkill(this, sk, key)) return; } catch (e) { console.error('[TravelSkills]', sk.name, e); }
        }
      }
      // --- 2) Kod tablosu yedeği (veride behavior yoksa) ---
      if (sk && sk.tsKey) {
        const h = tsHandlersFor(this.playerData && this.playerData.class);
        const fn = h && h[sk.tsKey];
        if (fn) {
          this.emitSkinFx(this.player.x, this.player.y, 10);
          const c = { key: sk.tsKey, aimAngle: this.skillAim(), cd: this.player.cooldowns[sk.tsKey] || { max: 0, current: 0 } };
          try { fn(this, c); } catch (e) { console.error('[TravelSkills]', sk.name, e); }
          return;
        }
      }
      const st = this.playerData.stats;
      const aim = this.skillAim();
      const dmg = this.skillDamage(sk);
      const skin = this.skin;
      const color = (skin && skin.primary) || sk.color || '#9fd8ff';
      // Mana rengi efekti: yetenek cast anında karakterin çevresinde.
      this.emitSkinFx(this.player.x, this.player.y, 12);
      const radius = Number(sk.radius) || 80;
      const kind = sk.kind;
      const crit = Math.random() < (st.critChance || 0);
      // --- SİLAH ANİMASYONU ---
      // Yetenek yalnızca efekt değil, gerçek bir savuruş da üretsin.
      // (kind 'swing' kendi vuruş döngüsünde animasyonu yönetir.)
      const WEAPON_ANIM = {
        arc: 'swing', nova: 'slam', aoe: 'slam', ground: 'slam', meteor: 'cast',
        beam: 'thrust', dash: 'thrust', teleport: 'thrust', line: 'thrust', pierce: 'thrust',
        chain: 'slash', orbit: 'spin', projectile: 'cast', fan: 'cast',
        heal: 'cast', shield: 'cast', buff: 'cast', channel: 'spin'
      };
      const animKind = WEAPON_ANIM[kind];
      if (animKind) {
        this.swingWeapon(animKind, {
          angle: aim,
          color,
          radius,
          arc: Number(sk.arc) || 1.2,
          // Zaten kendi izini çizen yeteneklerde ek iz çizmiyoruz.
          trail: kind !== 'arc' && kind !== 'swing',
          duration: animKind === 'slam' ? 0.42 : (animKind === 'spin' ? 0.5 : 0.32),
        });
      }
      // Görsel eklenti: mekanik çalışırken hazır efekti göster.
      this.emitSkillVisual(sk, kind, aim);

      // Buff veren skill: stat'ı süre boyunca yükseltir (ATK / büyü / hız...).
      if (sk.buff) {
        this.addBuff(Object.assign({}, sk.buff, {
          duration: Number(sk.buff.duration) || Number(sk.duration) || 8,
        }), color, sk.name);
      }

      // Kanal yeteneği (Warrior E - Whirlwind): tuş basılı tutuldukça döner.
      if (kind === 'channel') {
        if (this.player.channel) return;
        this.sound.play('slash');
        this.player.channel = {
          skill: sk, key,
          timer: Math.max(1, Number(sk.duration) || 4),
          duration: Math.max(1, Number(sk.duration) || 4),
          tick: Math.max(0.12, Number(sk.tick) || 0.25),
          tickTimer: 0, angle: aim
        };
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: (Number(sk.radius) || 105) * 0.7, duration: 0.35, timer: 0.35, color, ring: true });
        return;
      }

      if (kind === 'shield' || sk.shieldPct) {
        // Kalkan: 5 sn boyunca gelen hasarı yutar (Paladin Aegis dahil).
        const pct = Number(sk.shieldPct) || 25;
        this.playerShieldMax = Math.max(1, Math.round((st.maxHp || 100) * pct / 100));
        this.playerShield = this.playerShieldMax;
        this.playerShieldTimer = Number(sk.duration) || 5;
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 46, duration: 0.6, timer: 0.6, color, ring: true, dome: true });
        this.spawnExplosionParticles(this.player.x, this.player.y, 20, color);
        if (sk.healPct) this.healPlayer(st.maxHp * sk.healPct / 100, color);
      }
      if (kind === 'heal' || sk.healPct) {
        this.healPlayer(st.maxHp * (Number(sk.healPct) || 0) / 100 + dmg * 0.5, color);
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius, duration: 0.8, timer: 0.8, color, ring: true });
      }

      // Kılıç kombosu (Warrior E): karakter silahını gerçekten savurur.
      // Her vuruşta kol animasyonu + yay şeklinde iz + koni hasarı.
      if (kind === 'swing') {
        const hits = Math.max(1, Math.min(6, Number(sk.hits) || 3));
        const interval = Math.max(0.08, Number(sk.interval) || 0.2);
        const arc = Number(sk.arc) || 1.6;
        const reach = radius;
        for (let i = 0; i < hits; i++) {
          this.later(() => {
            const P = this.player;
            if (!P || this.downed) return;
            const last = i === hits - 1;
            const swingAim = this.skillAim();
            P.facingAngle = swingAim;
            this.swingWeapon(last ? 'slam' : 'swing', {
              angle: swingAim, color, radius: reach,
              arc, trail: false, duration: last ? 0.4 : 0.26,
            });
            // Savururken hafif öne atılım.
            P.x += Math.cos(swingAim) * (last ? 11 : 6);
            P.y += Math.sin(swingAim) * (last ? 11 : 6);
            const reachNow = reach * (last ? 1.2 : 1);
            const arcNow = last ? arc * 1.3 : arc;
            const hitDmg = Math.max(1, Math.round(dmg * (last ? 1.4 : 0.85)));
            this.slashes.push({
              x: P.x, y: P.y, angle: swingAim, radius: reachNow,
              arc: arcNow, duration: last ? 0.3 : 0.22, timer: last ? 0.3 : 0.22,
              color, dir: P.swingDir
            });
            this.hitCone(P.x, P.y, reachNow, arcNow, swingAim, hitDmg, sk, last ? crit : false);
            this.sound.play(last ? 'crit' : 'slash');
            this.addTrauma(last ? 0.34 : 0.14);
            const fx = P.x + Math.cos(swingAim) * (last ? 58 : 44);
            const fy = P.y + Math.sin(swingAim) * (last ? 58 : 44);
            if (last) {
              this.aoeEffects.push({ x: fx, y: fy, radius: reach * 0.6, duration: 0.5, timer: 0.5, color, ring: true, cracks: true });
              this.spawnExplosionParticles(fx, fy, 26, color);
            } else {
              this.spawnExplosionParticles(fx, fy, 9, color);
            }
          }, Math.round(i * interval * 1000));
        }
        return;
      }

      if (kind === 'arc') {
        this.sound.play('slash');
        this.addTrauma(0.28);
        // Silah animasyonu yukarıda swingWeapon ile başlatıldı.
        const arc = Number(sk.arc) || 1.0;
        this.slashes.push({ x: this.player.x, y: this.player.y, angle: aim, radius: radius, arc, duration: 0.22, timer: 0.22, color, dir: this.player.swingDir });
        this.hitCone(this.player.x, this.player.y, radius, arc, aim, dmg, sk, crit);
        this.addTrauma(0.15);
      } else if (kind === 'nova' || kind === 'aoe') {
        this.sound.play('hit');
        const off = kind === 'aoe' ? (Number(sk.offset) || 40) : 0;
        const cx = this.player.x + Math.cos(aim) * off;
        const cy = this.player.y + Math.sin(aim) * off;
        this.aoeEffects.push({ x: cx, y: cy, radius, duration: 0.5, timer: 0.5, color, ring: true, cracks: kind === 'aoe' });
        this.hitEnemiesInRadius(cx, cy, radius, dmg, true, Number(sk.knockback) || 0);
        this.spawnExplosionParticles(cx, cy, 22, color);
        this.applyAreaStatus(cx, cy, radius, sk);
        this.addTrauma(0.3);
      } else if (kind === 'projectile') {
        this.sound.play('shoot');
        const speed = Number(sk.speed) || 620;
        this.projectiles.push({
          type: 'magic_orb', x: this.player.x + Math.cos(aim) * 20, y: this.player.y + Math.sin(aim) * 20,
          vx: Math.cos(aim) * speed, vy: Math.sin(aim) * speed,
          radius: Number(sk.radius) || 9, life: 1.0, damage: dmg, isCrit: crit, color, skill: sk
        });
        if (sk.pet) this.commandPetAttack();
      } else if (kind === 'fan') {
        this.sound.play('shoot');
        const count = Math.max(1, Number(sk.count) || 3);
        const spread = Number(sk.spread) || 0.18;
        const speed = Number(sk.speed) || 620;
        for (let i = 0; i < count; i++) {
          const a = aim + (i - (count - 1) / 2) * spread;
          this.projectiles.push({
            type: 'arrow', x: this.player.x, y: this.player.y,
            vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
            radius: Number(sk.radius) || 6, life: 0.95, damage: dmg, isCrit: crit, color, skill: sk
          });
        }
      } else if (kind === 'beam') {
        this.sound.play('dash');
        this.addTrauma(0.3);
        const range = Number(sk.range) || 220;
        const width = Number(sk.width) || 26;
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: range, duration: 0.32, timer: 0.32, color, beam: true, angle: aim, width });
        this.hitBeam(this.player.x, this.player.y, aim, range, width, dmg, sk, crit);
      } else if (kind === 'dash') {
        this.sound.play('dash');
        this.createGhostTrail();
        const range = Number(sk.range) || 160;
        const dx = this.mouse.worldX - this.player.x, dy = this.mouse.worldY - this.player.y;
        const len = Math.hypot(dx, dy) || 1;
        const step = Math.min(range, len);
        this.player.x += (dx / len) * step;
        this.player.y += (dy / len) * step;
        this.clampPlayerToWorld();
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius, duration: 0.45, timer: 0.45, color, ring: true });
        this.hitEnemiesInRadius(this.player.x, this.player.y, radius, dmg, true, Number(sk.knockback) || 0);
        this.applyAreaStatus(this.player.x, this.player.y, radius, sk);
        this.spawnExplosionParticles(this.player.x, this.player.y, 18, color);
      } else if (kind === 'teleport') {
        this.sound.play('dash');
        this.createGhostTrail();
        const range = Number(sk.range) || 175;
        const dx = this.mouse.worldX - this.player.x, dy = this.mouse.worldY - this.player.y;
        const len = Math.hypot(dx, dy) || 1;
        const step = Math.min(range, len);
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: radius * 0.8, duration: 0.35, timer: 0.35, color, ring: true });
        this.player.x += (dx / len) * step;
        this.player.y += (dy / len) * step;
        this.clampPlayerToWorld();
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius, duration: 0.4, timer: 0.4, color, ring: true });
        this.hitEnemiesInRadius(this.player.x, this.player.y, radius, dmg, crit, 0);
        this.applyAreaStatus(this.player.x, this.player.y, radius, sk);
      } else if (kind === 'ground') {
        this.sound.play('hit');
        const tp = this.castTargetPoint(sk);
        const tx = tp.x, ty = tp.y;
        this.aoeEffects.push({ x: tx, y: ty, radius, duration: Number(sk.duration) || 3, timer: Number(sk.duration) || 3, color, roots: sk.element === 'nature', zone: true, skill: sk, tickTimer: 0, tick: Number(sk.tick) || 0.5 });
        this.hitEnemiesInRadius(tx, ty, radius, dmg, false, 0);
        this.applyAreaStatus(tx, ty, radius, sk);
      } else if (kind === 'meteor') {
        // Göktaşı yağmuru: count > 1 ise hedefin çevresine kademeli düşer.
        this.sound.play('ultimate');
        const tp = this.castTargetPoint(sk);
        const tx = tp.x, ty = tp.y;
        const delay = Number(sk.delay) || 0.35;
        const count = Math.max(1, Math.min(6, Number(sk.count) || 1));
        const spreadR = Number(sk.spreadRadius) || radius * 0.85;
        for (let i = 0; i < count; i++) {
          let mx = tx, my = ty;
          if (i > 0) {
            const a = (i / count) * TAU + Math.random() * 0.5;
            const rr = spreadR * (0.45 + Math.random() * 0.55);
            mx = tx + Math.cos(a) * rr;
            my = ty + Math.sin(a) * rr;
          }
          const d = delay + i * (Number(sk.stagger) || 0.14);
          const mRadius = i === 0 ? radius : Math.round(radius * 0.72);
          const mDmg = i === 0 ? dmg : Math.round(dmg * 0.62);
          this.aoeEffects.push({ x: mx, y: my, radius: mRadius, duration: d + 0.45, timer: d + 0.45, color, telegraph: true, pillar: true });
          this.later(() => {
            this.aoeEffects.push({ x: mx, y: my, radius: mRadius, duration: 0.5, timer: 0.5, color, ring: true, cracks: true });
            this.hitEnemiesInRadius(mx, my, mRadius, mDmg, true, 320);
            this.applyAreaStatus(mx, my, mRadius, sk);
            this.spawnExplosionParticles(mx, my, i === 0 ? 36 : 22, color);
            this.addTrauma(i === 0 ? 0.45 : 0.22);
          }, Math.round(d * 1000));
        }
      } else if (kind === 'orbit') {
        // Etrafta dönen silahlar: süre boyunca oyuncunun çevresine sürekli hasar.
        this.sound.play('ultimate');
        this.addTrauma(0.32);
        const dur = Math.max(0.8, Number(sk.duration) || 3.2);
        this.orbitAura = {
          angle: 0, speed: Number(sk.speed) || 3.6, count: Math.max(3, Number(sk.count) || 6),
          radius: Math.max(40, Number(sk.radius) || 120), timer: dur, duration: dur,
          tick: Math.max(0.12, Number(sk.tick) || 0.35), tickTimer: 0, damage: dmg, color, sk
        };
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: radius * 0.8, duration: 0.5, timer: 0.5, color, ring: true, swirl: true });
        this.spawnExplosionParticles(this.player.x, this.player.y, 18, color);
      } else if (kind === 'chain') {
        // Zincir şimşeği: en yakın hedeften hedefe sıçrar.
        this.sound.play('ultimate');
        this.addTrauma(0.3);
        const maxR = Number(sk.radius) || 320;
        const jumps = Math.max(1, Number(sk.jumps) || 4);
        const chainRange = Number(sk.chainRange) || 185;
        const hitIds = new Set();
        let from = { x: this.player.x, y: this.player.y };
        let cur = this.nearestMonster(this.player.x, this.player.y, maxR);
        let curDmg = dmg;
        const points = [{ x: this.player.x, y: this.player.y }];
        for (let j = 0; j < jumps && cur; j++) {
          points.push({ x: cur.x, y: cur.y });
          this.applyDamageToMonster(cur, Math.round(curDmg), false, Math.atan2(cur.y - from.y, cur.x - from.x), 120);
          if (sk.status) this.applyMonsterStatus(cur, sk.status);
          hitIds.add(cur.id);
          from = { x: cur.x, y: cur.y };
          curDmg *= 0.85;
          cur = this.nearestMonster(from.x, from.y, chainRange, hitIds);
        }
        if (points.length > 1) {
          this.chainFx.push({ points, timer: 0.3, duration: 0.3, color, seed: Math.random() * 1000 });
          for (const pt of points.slice(1)) this.spawnExplosionParticles(pt.x, pt.y, 8, color);
        }
      } else if (kind === 'vortex') {
        // Girdap: alana çeker, içinde kalanlara sürekli hasar verir.
        this.sound.play('ultimate');
        this.addTrauma(0.28);
        const tp = this.castTargetPoint(sk);
        const dur = Math.max(0.8, Number(sk.duration) || 2.4);
        this.aoeEffects.push({
          x: tp.x, y: tp.y, radius, duration: dur, timer: dur, color,
          vortex: true, pull: Number(sk.pull) || 95, skill: sk,
          tick: Math.max(0.15, Number(sk.tick) || 0.4), tickTimer: 0
        });
        this.hitEnemiesInRadius(tp.x, tp.y, radius, Math.round(dmg * 0.6), true, 60);
        this.applyAreaStatus(tp.x, tp.y, radius, sk);
        this.spawnExplosionParticles(tp.x, tp.y, 20, color);
      } else if (kind === 'barrage') {
        // Ardışık mermi yağmuru: kısa aralıklarla çok sayıda atış.
        this.sound.play('ultimate');
        const count = Math.max(1, Number(sk.count) || 8);
        const interval = Math.max(0.02, Number(sk.interval) || 0.07);
        const speed = Number(sk.speed) || 760;
        const spread = Number(sk.spread) || 0.17;
        const baseAim = aim;
        const isArrow = sk.element === 'physical';
        for (let i = 0; i < count; i++) {
          this.later(() => {
            if (!this.player || this.downed) return;
            const a = baseAim + (Math.random() - 0.5) * spread;
            this.projectiles.push({
              type: isArrow ? 'arrow' : 'magic_orb',
              x: this.player.x + Math.cos(baseAim) * 18,
              y: this.player.y + Math.sin(baseAim) * 18,
              vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
              radius: Number(sk.radius) || 7, life: 1.1,
              damage: Math.max(1, Math.round(dmg * 0.42)),
              isCrit: Math.random() < (this.playerData.stats.critChance || 0),
              color, skill: sk
            });
            this.sound.play('shoot');
          }, Math.round(i * interval * 1000));
        }
      } else if (kind === 'quake') {
        // Deprem: oyuncunun çevresinde art arda genişleyen dalgalar.
        this.sound.play('ultimate');
        this.addTrauma(0.42);
        const pulses = Math.max(1, Number(sk.pulses) || 3);
        const interval = Math.max(0.08, Number(sk.interval) || 0.22);
        for (let i = 0; i < pulses; i++) {
          this.later(() => {
            const r = radius * (0.62 + i * 0.19);
            this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: r, duration: 0.45, timer: 0.45, color, ring: true, cracks: true });
            this.hitEnemiesInRadius(this.player.x, this.player.y, r, Math.max(1, Math.round(dmg * (i === 0 ? 0.8 : 0.45))), i === 0, Number(sk.knockback) || 0);
            this.applyAreaStatus(this.player.x, this.player.y, r, sk);
            this.spawnExplosionParticles(this.player.x, this.player.y, 14, color);
            this.addTrauma(0.18);
          }, Math.round(i * interval * 1000));
        }
      }
      if (this.onStatsChange) this.onStatsChange(this.playerData.stats);
    }

    healPlayer(amount, color) {
      const st = this.playerData.stats || {};
      const heal = Math.max(1, Math.round(amount));
      const before = st.currentHp || 0;
      st.currentHp = Math.min(st.maxHp || 1, before + heal);
      const gained = Math.round(st.currentHp - before);
      if (gained > 0) this.spawnDamageNumber(this.player.x, this.player.y, `+${gained}`, color || '#69f0ae');
    }

    scheduleRespawn(monster) {
      const def = this.biomeDef || {};
      const spawn = def.spawn || {};
      // Aynı anda haritada daha az canavar: seyrek ama güçlü karşılaşmalar.
      const max = Math.max(3, Math.round((Number(spawn.max) || 7) * 0.6 * this.zoneDensityNear()));
      const delay = Math.max(3000, (Number(spawn.respawn) || 9) * 1000);
      const id = monster && monster.id;
      this.later(() => {
        if (id) this.monsters = this.monsters.filter((m) => m.id !== id);
        else this.monsters = this.monsters.filter((m) => m.hp > 0 || m.deathTimer > 0);
        if (this.monsters.filter((m) => m.hp > 0).length < max) this.spawnMonsters(1);
      }, delay);
    }

    // Durum efektinden (zehir/yanma) ölen canavar için ödül + respawn.
    onMonsterDeath(monster) {
      const gold = Math.floor(6 + Math.random() * 10) + Math.round((monster.gold || 0) * 0.5);
      this.playerData.stats.gold += gold;
      this.later(() => this.spawnDamageNumber(monster.x, monster.y, `+${gold}g`, '#ffd54f'), 150);
      if (this.onStatsChange) this.onStatsChange(this.playerData.stats);
      if (this.onKill) this.onKill(monster);
      this.scheduleRespawn(monster);
    }

    // Oyuncuya hasar: önce kalkan yutar, sonra can gider.
    // opts = { defense:'parryable'|'dodge'|'block'|'none', kind:'light'|'medium'|'heavy'|'skill'|'ultimate', guardPressure:n, ignoreDefense:bool }
    damagePlayer(amount, angle, element, fromMonster, opts) {
      // Yere düşmüşken/ölüyken hasar ve vuruş sesi olmasın (canavarlar
      // ölü bedene vurmaya devam edip ses çıkarmasın).
      if (this.downed || this._down) return 'avoided';
      const P = this.player;
      // TravelSkills dokunulmazlığı (blink/leap/buff invuln).
      if (P && (P.invuln > 0 || P.phase > 0)) return 'avoided';

      const o = opts || {};
      const defenseType = o.ignoreDefense ? DEFENSE.NONE : (o.defense || DEFENSE.PARRYABLE);
      const atkKind = o.kind || 'medium';
      const guardAmt = o.guardPressure != null
        ? Number(o.guardPressure)
        : (GUARD_PRESSURE[atkKind] != null ? GUARD_PRESSURE[atkKind] : GUARD_PRESSURE.medium);

      // 1) Dash i-frame: tamamen kaçış (sadece dash dokunulmazlığı penceresinde).
      if (P && P.dodgeIframes > 0) {
        this.spawnCombatIndicator('DODGE', '#e0f7fa', { duration: 0.55 });
        this.lastDodgeTime = this.time;
        return 'avoided';
      }

      // 2) Kusursuz parry: yalnızca PARRYABLE saldırılar.
      if (P && defenseType === DEFENSE.PARRYABLE && P.parryPhase === 'window' && P.guardbreakTimer <= 0) {
        // Mermilerden gelen parry, canavarın başka bir telegraph'ını iptal etmesin.
        this.perfectParry(fromMonster, angle, atkKind, o.noInterrupt !== true);
        return 'avoided';
      }

      // 3) Normal blok: hasarı azaltır + Guard Pressure üretir.
      let blocking = false;
      if (P && P.parryPhase === 'block' && P.guardbreakTimer <= 0) {
        if (defenseType === DEFENSE.DODGE) {
          // Dodge-only: blok işe yaramaz, sadece baskı yer.
          this.addGuardPressure(guardAmt);
          this.spawnCombatIndicator('UNBLOCKABLE', '#ff8a65', { duration: 0.7 });
        } else if (defenseType !== DEFENSE.NONE) {
          blocking = true;
        }
      }

      // Irk / sınıf dodge pasifi (wyvernkin, gölge sınıfları...).
      const dodge = this.passiveDodgeChance();
      if (dodge > 0 && Math.random() < dodge) {
        this.spawnDamageNumber(this.player.x, this.player.y, "DODGE", "#b2ff59");
        return 'avoided';
      }
      const st = this.playerData.stats || (this.playerData.stats = {});
      let dmg = Math.max(1, Math.round(Number(amount) || 0));
      // Elemente duyarlı pasifler: "kutsal hasardan +%30 alır" gibi.
      const takenMult = this.passiveTakenMult(element);
      if (takenMult !== 1) dmg = Math.max(1, Math.round(dmg * takenMult));
      // Savunma buff'ı gelen hasarı azaltır (en fazla %75).
      const defBuff = Math.min(0.75, Math.max(0, this.buffPct("defense") + this.buffPct("resistance")));
      if (defBuff > 0) dmg = Math.max(1, Math.round(dmg * (1 - defBuff)));
      // Blok: hafif saldırı çoğunu yutar, block-only (ağır) saldırı daha çok geçirir.
      if (blocking) {
        const reduce = defenseType === DEFENSE.BLOCK ? 0.35 : 0.8;
        dmg = Math.max(1, Math.round(dmg * (1 - reduce)));
        this.addGuardPressure(guardAmt);
      }
      if (this.playerShield > 0 && this.playerShieldTimer > 0) {
        const absorbed = Math.min(this.playerShield, dmg);
        this.playerShield -= absorbed;
        dmg -= absorbed;
        if (absorbed > 0) {
          this.spawnDamageNumber(this.player.x, this.player.y, `-${absorbed}`, '#80deea');
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 40, duration: 0.25, timer: 0.25, color: '#80deea', ring: true });
        }
        if (this.playerShield <= 0) {
          this.playerShield = 0;
          this.spawnExplosionParticles(this.player.x, this.player.y, 16, '#80deea');
        }
      }
      if (dmg > 0) {
        st.currentHp = Math.max(0, (st.currentHp || 0) - dmg);
        this.spawnDamageNumber(this.player.x, this.player.y, `-${dmg}`, '#ff5252');
        this.spawnBloodParticles(this.player.x, this.player.y, angle || 0, 6, '#ff5252');
        if (this.sound) this.sound.play(element && element !== 'physical' ? 'hit_magic' : 'hit_physical');
        // Diken pasifi (Gorgon "Petrifying Gaze" gibi): hasarın bir kısmını
        // saldırana geri yansıt.
        const thorns = this.passiveSum("thorns", "mult");
        if (thorns > 0 && fromMonster && !fromMonster.dead && fromMonster.hp > 0) {
          const back = Math.max(1, Math.round(dmg * thorns));
          this.spawnDamageNumber(fromMonster.x, fromMonster.y, `-${back}`, '#b39ddb');
          fromMonster.hp -= back;
          if (fromMonster.hp <= 0) {
            fromMonster.dead = true;
            fromMonster.state = 'DEAD';
            fromMonster.deathTimer = 0.45;
            this.spawnExplosionParticles(fromMonster.x, fromMonster.y, 18, fromMonster.color);
            if (this.onKill) this.onKill(fromMonster);
            this.scheduleRespawn();
          }
        }
      } else {
        this.spawnDamageNumber(this.player.x, this.player.y, 'BLOCK', '#80deea');
      }
      if (blocking) {
        this.spawnCombatIndicator('BLOCK', '#64b5f6', { duration: 0.6 });
        if (this.sound) this.sound.play('guard', 0.45);
        this.addTrauma(0.1);
      }
      // "Son Nefes" pasifi: ölümcül hasar bir kez 1 HP ile atlatılır.
      if ((st.currentHp || 0) <= 0 && !this._secondWindUsed &&
          this.passiveList().some((p) => p.kind === "secondWind")) {
        this._secondWindUsed = true;
        st.currentHp = 1;
        this.spawnDamageNumber(this.player.x, this.player.y, "SON NEFES!", "#ffd54f", true);
        this.spawnExplosionParticles(this.player.x, this.player.y, 26, "#ffd54f");
      }
      this.addTrauma(0.3);
      this.hurt = 0.35;
      this.sound.play('hit');
      if (this.onStatsChange) this.onStatsChange(st);
      // Dönüş değeri: çağıran taraf (canavar AI) ek durum efektlerini uygulayıp
      // uygulamayacağına karar verir ('hit' | 'blocked' | 'avoided').
      return blocking ? 'blocked' : 'hit';
    }

    applyPlayerStatusFromMonster(status) {
      if (!status || !status.type) return;
      if (status.chance != null && Math.random() > status.chance) return;
      const ps = this.playerStatuses || (this.playerStatuses = {});
      const cur = ps[status.type];
      ps[status.type] = {
        type: status.type,
        timer: Math.max(cur ? cur.timer : 0, Number(status.duration) || 2),
        dps: Number(status.dps) || 0,
        slow: Number(status.slow) || 0,
        tick: 0.5, tickTimer: 0.5,
      };
    }

    // Warrior E: basılı tutulan dönen saldırı. Saldırı hızı arttıkça daha hızlı döner.
    updateChannel(dt) {
      const ch = this.player && this.player.channel;
      if (!ch) return;
      const held = !!(this.keys && this.keys['e']);
      ch.timer -= dt;
      const aps = this.computeAttackPerSecond();
      ch.angle += (Number(ch.skill.spin) || 8) * (0.55 + aps * 0.75) * dt;
      ch.tickTimer += dt;
      if (ch.tickTimer >= ch.tick) {
        ch.tickTimer = 0;
        const radius = Number(ch.skill.radius) || 105;
        const dmg = Math.max(1, Math.round(this.skillDamage(ch.skill)));
        this.hitEnemiesInRadius(this.player.x, this.player.y, radius, dmg, true, 0);
        this.applyAreaStatus(this.player.x, this.player.y, radius, ch.skill);
        const col = ch.skill.color || '#ffd54f';
        this.slashes.push({
          x: this.player.x, y: this.player.y, angle: ch.angle,
          radius, arc: 2.2, duration: 0.2, timer: 0.2, color: col, dir: 1
        });
        if (Math.random() < 0.6) this.sound.play('slash');
        this.spawnExplosionParticles(
          this.player.x + Math.cos(ch.angle) * radius * 0.8,
          this.player.y + Math.sin(ch.angle) * radius * 0.8, 3, col
        );
      }
      if (!held || ch.timer <= 0 || this.downed) {
        const radius = Number(ch.skill.radius) || 105;
        const col = ch.skill.color || '#ffd54f';
        this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius, duration: 0.45, timer: 0.45, color: col, ring: true });
        this.player.channel = null;
      }
    }

    updatePlayerStatuses(dt) {
      const ps = this.playerStatuses || {};
      const st = this.playerData.stats || {};
      let slowMult = 1;
      for (const key of Object.keys(ps)) {
        const s = ps[key];
        if (!s) continue;
        s.timer -= dt;
        if (s.slow > 0) slowMult = Math.min(slowMult, 1 - Math.min(0.7, s.slow));
        if (s.dps > 0) {
          s.tickTimer -= dt;
          if (s.tickTimer <= 0) {
            s.tickTimer += s.tick || 0.5;
            const dmg = Math.max(1, Math.round(s.dps * (s.tick || 0.5)));
            st.currentHp = Math.max(0, (st.currentHp || 0) - dmg);
            const c = s.type === 'burn' ? '#ff7043' : (s.type === 'bleed' ? '#ff5370' : (s.type === 'shock' ? '#fff176' : '#9ccc65'));
            this.spawnDamageNumber(this.player.x, this.player.y, `-${dmg}`, c);
            if (this.onStatsChange) this.onStatsChange(st);
          }
        }
        if (s.timer <= 0) delete ps[key];
      }
      this.playerSlowMult = slowMult;
      this.updateBuffs(dt);
      if (this.playerShieldTimer > 0) {
        this.playerShieldTimer -= dt;
        if (this.playerShieldTimer <= 0) {
          this.playerShieldTimer = 0;
          this.playerShield = 0;
        }
      }
    }

    applyAreaStatus(cx, cy, radius, sk) {
      const status = sk && sk.status;
      if (!status) return;
      this.monsters.forEach((m) => {
        if (m.hp <= 0) return;
        if (Math.hypot(m.x - cx, m.y - cy) <= radius + m.radius) this.applyMonsterStatus(m, status);
      });
    }

    applyMonsterStatus(m, status) {
      if (!m || !status || !status.type) return;
      if (status.chance != null && Math.random() > status.chance) return;
      const st = m.statuses || (m.statuses = {});
      const cur = st[status.type];
      st[status.type] = {
        type: status.type,
        duration: Math.max(cur ? cur.duration : 0, Number(status.duration) || 1),
        timer: Math.max(cur ? cur.timer : 0, Number(status.duration) || 1),
        dps: Number(status.dps) || 0,
        slow: Number(status.slow) || 0,
        tick: 0.5,
        tickTimer: 0.5,
      };
      if (status.type === 'freeze' || status.type === 'stun' || status.type === 'root') {
        m.vx = 0; m.vy = 0;
      }
    }

    hitCone(cx, cy, radius, arc, aim, damage, sk, forceCrit) {
      const el = (sk && sk.element) || this.autoElement();
      const critBonus = this.passiveCritBonus();
      this.monsters.forEach((m) => {
        if (m.hp <= 0) return;
        const dist = Math.hypot(m.x - cx, m.y - cy);
        if (dist > radius + m.radius) return;
        let diff = Math.abs(Math.atan2(m.y - cy, m.x - cx) - aim);
        while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
        if (diff > arc / 2) return;
        const isCrit = !!forceCrit || Math.random() < ((this.playerData.stats.critChance || 0) + critBonus.chance);
        this.applyDamageToMonster(m, Math.round(damage * (isCrit ? 1.6 + critBonus.damage : 1)), isCrit, aim, Number(sk && sk.knockback) || 0, el);
        if (sk && sk.status) this.applyMonsterStatus(m, sk.status);
      });
    }

    hitBeam(x, y, angle, range, width, damage, sk, forceCrit) {
      const el = (sk && sk.element) || this.autoElement();
      const critBonus = this.passiveCritBonus();
      const ex = x + Math.cos(angle) * range;
      const ey = y + Math.sin(angle) * range;
      const vx = ex - x, vy = ey - y;
      const len2 = vx * vx + vy * vy || 1;
      this.monsters.forEach((m) => {
        if (m.hp <= 0) return;
        const t = Math.max(0, Math.min(1, ((m.x - x) * vx + (m.y - y) * vy) / len2));
        const px = x + vx * t, py = y + vy * t;
        if (Math.hypot(m.x - px, m.y - py) <= width / 2 + m.radius) {
          const isCrit = !!forceCrit || Math.random() < ((this.playerData.stats.critChance || 0) + critBonus.chance);
          this.applyDamageToMonster(m, Math.round(damage * (isCrit ? 1.6 + critBonus.damage : 1)), isCrit, angle, Number(sk && sk.knockback) || 0, el);
          if (sk && sk.status) this.applyMonsterStatus(m, sk.status);
        }
      });
    }

    clampPlayerToWorld() {
      const maxDistFromCenter = (this.mapRadius - 0.5) * this.tileSize;
      const d = Math.hypot(this.player.x, this.player.y);
      if (d > maxDistFromCenter) {
        const ang = Math.atan2(this.player.y, this.player.x);
        this.player.x = Math.cos(ang) * maxDistFromCenter;
        this.player.y = Math.sin(ang) * maxDistFromCenter;
      }
    }

    // --- Eski archetype davranışı (içerik yoksa) ---
    triggerArchetypeSkill(key) {
      const cd = this.player.cooldowns[key];
      if (!cd || cd.current > 0) return;
      const archetype = this.player.archetype;
      const stats = this.playerData.stats;
      const aimAngle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);

      if (key === 'q') {
        cd.current = cd.max;
        this.sound.play('slash');
        this.addTrauma(0.3);

        if (archetype === ARCHETYPES.MELEE) {
          // Menzil 110 -> 80; alan zeminde gösterilir.
          this.showRangePing(this.player.x, this.player.y, 80, '#ffd54f', { arc: TAU });
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 80, duration: 0.35, timer: 0.35, color: '#ffd54f', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 80, stats.attack * 1.5, true);

        } else if (archetype === ARCHETYPES.RANGED) {
          this.showRangePing(this.player.x, this.player.y, 24, '#aed581', { duration: 0.3 });
          for (let i = -2; i <= 2; i++) {
            const spread = aimAngle + i * 0.18;
            this.projectiles.push({
              type: 'arrow', x: this.player.x, y: this.player.y,
              vx: Math.cos(spread) * 620, vy: Math.sin(spread) * 620, radius: 6, life: 0.9,
              damage: stats.attack * 0.9, isCrit: false, color: '#aed581'
            });
          }

        } else if (archetype === ARCHETYPES.MAGE) {
          // Menzil 125 -> 90.
          this.showRangePing(this.player.x, this.player.y, 90, '#80deea', { arc: TAU });
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 90, duration: 0.4, timer: 0.4, color: '#80deea', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 90, stats.attack * 1.3, false, 350);

        } else if (archetype === ARCHETYPES.SHADOW) {
          this.showRangePing(this.player.x, this.player.y, 24, '#f06292', { duration: 0.3 });
          for (let i = -3; i <= 3; i++) {
            const spread = aimAngle + i * 0.16;
            this.projectiles.push({
              type: 'dagger', x: this.player.x, y: this.player.y,
              vx: Math.cos(spread) * 700, vy: Math.sin(spread) * 700, radius: 5, life: 0.7,
              damage: stats.attack * 0.85, isCrit: true, color: '#f06292'
            });
          }

        } else if (archetype === ARCHETYPES.TAMER) {
          this.commandPetFrenzy();
        }

      } else if (key === 'e') {
        cd.current = cd.max;
        this.addTrauma(0.35);

        if (archetype === ARCHETYPES.MELEE) {
          this.sound.play('hit');
          // Yer vuruşu: offset 60 -> 44, menzil 95 -> 70.
          const gx = this.player.x + Math.cos(aimAngle) * 44, gy = this.player.y + Math.sin(aimAngle) * 44;
          this.showRangePing(gx, gy, 70, '#ff9800', { arc: TAU });
          this.aoeEffects.push({ x: gx, y: gy, radius: 70, duration: 0.45, timer: 0.45, color: '#ff9800', cracks: true });
          this.hitEnemiesInRadius(gx, gy, 70, stats.attack * 1.6, true, 280);
          this.spawnExplosionParticles(gx, gy, 14, '#ffb74d');

        } else if (archetype === ARCHETYPES.RANGED) {
          // Kök alanı 80 -> 58.
          this.showRangePing(this.mouse.worldX, this.mouse.worldY, 58, '#689f38', { arc: TAU, duration: 1.2 });
          this.aoeEffects.push({ x: this.mouse.worldX, y: this.mouse.worldY, radius: 58, duration: 1.5, timer: 1.5, color: '#689f38', roots: true });
          this.hitEnemiesInRadius(this.mouse.worldX, this.mouse.worldY, 58, stats.attack * 1.1, false, 0);

        } else if (archetype === ARCHETYPES.MAGE) {
          this.sound.play('dash');
          this.createGhostTrail();
          const dist = Math.hypot(this.mouse.worldX - this.player.x, this.mouse.worldY - this.player.y);
          const maxTeleport = Math.min(dist, 150); // 220 -> 150
          this.player.x += Math.cos(aimAngle) * maxTeleport;
          this.player.y += Math.sin(aimAngle) * maxTeleport;
          this.showRangePing(this.player.x, this.player.y, 66, '#e040fb', { arc: TAU });
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 66, duration: 0.35, timer: 0.35, color: '#e040fb', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 66, stats.attack * 1.4, true);

        } else if (archetype === ARCHETYPES.SHADOW) {
          this.sound.play('slash');
          // Işınlanma hedef araması 120 -> 90.
          const target = this.getClosestMonsterToMouse(90);
          if (target) {
            this.createGhostTrail();
            this.player.x = target.x - Math.cos(aimAngle) * 35;
            this.player.y = target.y - Math.sin(aimAngle) * 35;
            this.showRangePing(target.x, target.y, 40, '#f06292', { duration: 0.4 });
            this.applyDamageToMonster(target, stats.attack * 2.2, true, aimAngle, 300);
          }

        } else if (archetype === ARCHETYPES.TAMER) {
          // 140 -> 100.
          this.showRangePing(this.player.x, this.player.y, 100, '#ffb300', { arc: TAU });
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 100, duration: 0.4, timer: 0.4, color: '#ffb300', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 100, stats.attack * 0.8, false, 400);
        }

      } else if (key === 'r') {
        cd.current = cd.max;
        this.sound.play('ultimate');
        this.addTrauma(0.7);

        const targetX = this.mouse.worldX;
        const targetY = this.mouse.worldY;
        const ultColor = archetype === ARCHETYPES.MAGE ? '#7c4dff' : (archetype === ARCHETYPES.SHADOW ? '#d50000' : '#ffab00');
        // Nihai menzil 170 -> 120 ve alan zeminde gösterilir.
        this.showRangePing(targetX, targetY, 120, ultColor, { arc: TAU, duration: 0.9 });
        this.aoeEffects.push({
          x: targetX, y: targetY, radius: 120, duration: 0.85, timer: 0.85,
          color: ultColor,
          pillar: true
        });
        this.later(() => {
          this.hitEnemiesInRadius(targetX, targetY, 120, stats.attack * 3.4, true, 450);
          this.spawnExplosionParticles(targetX, targetY, 40, '#ffd700');
          this.addTrauma(0.3);
        }, 120);
      }
    }

    hitEnemiesInRadius(cx, cy, radius, damage, canCrit = false, knockback = 0, element = null) {
      this.monsters.forEach((m) => {
        if (m.hp <= 0) return;
        const dist = Math.hypot(m.x - cx, m.y - cy);
        if (dist <= radius + m.radius) {
          const critBonus = this.passiveCritBonus();
          const isCrit = canCrit && Math.random() < ((this.playerData.stats.critChance || 0) + critBonus.chance);
          const finalDamage = Math.round(isCrit ? damage * (1.8 + critBonus.damage) : damage);
          const angle = Math.atan2(m.y - cy, m.x - cx);
          let el = element;
          if (!el) {
            const fresh = this._castElement && (performance.now() < (this._castElementUntil || 0));
            el = fresh ? this._castElement : this.autoElement();
          }
          this.applyDamageToMonster(m, finalDamage, isCrit, angle, knockback, el);
        }
      });
    }

    // ---- Buff sistemi (ARPG) -------------------------------------------
    // Skill tanımındaki `buff` alanı: { stat: "attack"|"magic"|"heal"|"defense"|"speed", pct: 30 }
    // Aynı stat birden çok buff'ta toplanır. Süre bitince kendiliğinden düşer.
    addBuff(buff, color, fallbackName) {
      if (!buff) return null;
      const stat = String(buff.stat || "attack").toLowerCase();
      const pct = Number(buff.pct);
      if (!Number.isFinite(pct) || pct === 0) return null;
      const duration = Math.max(0.5, Number(buff.duration) || 8);
      const entry = {
        stat, pct, duration, timer: duration,
        name: buff.name || fallbackName || stat.toUpperCase(),
        color: buff.color || color || "#80deea",
      };
      this.playerBuffs.push(entry);
      this.spawnDamageNumber(this.player.x, this.player.y,
        `${pct > 0 ? "+" : ""}${Math.round(pct)}% ${BUFF_LABEL[stat] || stat.toUpperCase()}`,
        entry.color);
      this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 44, duration: 0.55, timer: 0.55, color: entry.color, ring: true });
      if (this.onBuffChange) this.onBuffChange(this.playerBuffs.slice());
      return entry;
    }

    // Aktif buff'ların toplam yüzdesi (ör. attack -> 0.3 = +%30).
    buffPct(stat) {
      const want = String(stat || "").toLowerCase();
      let total = 0;
      for (const b of this.playerBuffs || []) if (b && b.stat === want) total += (Number(b.pct) || 0) / 100;
      return total;
    }

    updateBuffs(dt) {
      if (!this.playerBuffs || !this.playerBuffs.length) return;
      let changed = false;
      for (const b of this.playerBuffs) {
        if (!b) continue;
        b.timer -= dt;
        if (b.timer <= 0) changed = true;
      }
      if (changed) {
        this.playerBuffs = this.playerBuffs.filter((b) => b && b.timer > 0);
        if (this.onBuffChange) this.onBuffChange(this.playerBuffs.slice());
      }
    }

    // ---- Sınıf / ırk pasifleri (ARPG tarafı) --------------------------------
    // Sunucudaki server/passives.js ile aynı isimleri kullanır; böylece sıra
    // tabanlı savaşta çalışan pasifler seyahatte de aynı şekilde işler.
    passiveList() {
      const list = (this.playerData && this.playerData.passives) || [];
      return Array.isArray(list) ? list.filter((p) => p && typeof p.kind === "string") : [];
    }

    passiveOutMult(ctx) {
      let mult = 1;
      const c = ctx || {};
      for (const p of this.passiveList()) {
        if (p.kind !== "damageBonus") continue;
        const m = Number(p.mult);
        if (!(m > 0)) continue;
        if (p.aboveHpPct != null && !(Number(c.targetHpPct) > Number(p.aboveHpPct))) continue;
        if (p.belowHpPct != null && !(Number(c.targetHpPct) < Number(p.belowHpPct))) continue;
        if (p.selfHpBelowPct != null && !(this.hpPct() < Number(p.selfHpBelowPct))) continue;
        if (p.firstStrike && !c.isFirst) continue;
        if (p.element && String(p.element).toLowerCase() !== String(c.element || "").toLowerCase()) continue;
        if (Array.isArray(p.tags) && p.tags.length) {
          const tags = Array.isArray(c.targetTags) ? c.targetTags : [];
          if (!p.tags.some((t) => tags.includes(t))) continue;
        }
        mult *= 1 + m;
      }
      return mult;
    }

    hpPct() {
      const st = (this.playerData && this.playerData.stats) || {};
      const max = Number(st.maxHp) || 1;
      return clamp((Number(st.currentHp) || 0) / max, 0, 1);
    }

    passiveTakenMult(fromElement) {
      let mult = 1;
      for (const p of this.passiveList()) {
        if (p.kind !== "damageTaken") continue;
        if (p.fromElement && String(p.fromElement).toLowerCase() !== String(fromElement || "").toLowerCase()) continue;
        mult *= 1 + (Number(p.mult) || 0);
      }
      return Math.max(0, mult);
    }

    passiveSum(kind, field) {
      let total = 0;
      for (const p of this.passiveList()) if (p.kind === kind) total += Number(p[field]) || 0;
      return total;
    }

    // statBonus pasifi: { kind:"statBonus", stat:"attack"|"maxHp"|"speed", pct:10 }
    passiveStatPct(stat) {
      let total = 0;
      for (const p of this.passiveList()) {
        if (p.kind !== "statBonus" || p.stat !== stat) continue;
        total += Number(p.pct) || 0;
      }
      return total;
    }

    passiveCritBonus() {
      let chance = 0, damage = 0;
      for (const p of this.passiveList()) {
        if (p.kind === "critChance") chance += Number(p.add) || 0;
        if (p.kind === "critDamage") damage += Number(p.add) || 0;
      }
      return { chance, damage };
    }

    passiveDodgeChance() {
      return clamp(this.passiveSum("dodge", "chance"), 0, 0.5);
    }

    passiveHealOnKill(pct) {
      const rate = this.passiveSum("healOnKill", "pct");
      if (!(rate > 0)) return;
      const st = this.playerData.stats;
      const heal = Math.max(1, Math.round((Number(st.maxHp) || 100) * rate));
      st.currentHp = Math.min(st.maxHp, (st.currentHp || 0) + heal);
      this.spawnDamageNumber(this.player.x, this.player.y, `+${heal}`, "#69f0ae");
    }

    // O an geçerli element: kısa süre önce cast edilen yetenek varsa o, yoksa
    // sınıfın otomatik saldırı elementi.
    currentElement() {
      if (this._castElement && performance.now() < (this._castElementUntil || 0)) return this._castElement;
      return this.autoElement();
    }

    // Otomatik saldırının elementi: sınıfın `auto.element` alanı (yoksa fiziksel).
    autoElement() {
      const now = performance.now();
      if (this._autoElCache && now < (this._autoElUntil || 0)) return this._autoElCache;
      const set = this.classSkillSet && this.classSkillSet();
      const el = (set && set.auto && set.auto.element) || "physical";
      this._autoElCache = el;
      this._autoElUntil = now + 3000;
      return el;
    }

    applyDamageToMonster(monster, damage, isCrit, hitAngle, knockbackStrength = 0, element = null) {
      if (monster.dead) return;
      // Buff'lı hasar: ATK buff'ı bütün giden hasarı çarpar.
      const atkBuff = this.buffPct("attack") + this.buffPct("damage");
      if (atkBuff) damage = Math.max(1, Math.round(damage * (1 + atkBuff)));
      // Element etkileşimi (ateş -> buz = zayıf, ateş -> ateş = direnç ...).
      const el = String(element || this.currentElement() || "physical").toLowerCase();
      const elMult = elementMultFor(el, monster);
      // Sınıf / ırk hasar pasifleri (etiket + element + can eşiği koşulları).
      const tags = Array.isArray(monster.tags) ? monster.tags : [];
      const passiveMult = this.passiveOutMult({
        element: el,
        targetTags: tags,
        targetHpPct: monster.maxHp > 0 ? monster.hp / monster.maxHp : 0,
        isFirst: !monster._passiveHit,
      });
      if (passiveMult !== 1) damage = damage * passiveMult;
      if (elMult !== 1) damage = damage * elMult;
      damage = Math.max(1, Math.round(damage));
      monster._passiveHit = true;
      // ---- ORTAK DÜNYA: hasar/ölüm kararı sunucunun ----------------------
      // Görsel geri bildirim anında verilir (oyuncu beklemez), fakat can
      // değeri otoriter değildir ve yerel ölüm tetiklenmez.
      if (monster.shared) {
        const predicted = Math.max(1, (Number(monster.hp) || 1) - damage);
        monster.hp = predicted;
        monster.flashTimer = 0.12;
        monster.state = 'CHASE';
        monster.aggroTimer = Math.max(Number(monster.aggroTimer) || 0, monster.elite ? 9 : 7);
        const kb0 = Math.max(0, Number(knockbackStrength) || 0);
        if (kb0 > 0 && !monster.elite) {
          const mag = Math.min(150, kb0) * 0.5;
          monster.vx = clamp(monster.vx + Math.cos(hitAngle) * mag, -220, 220);
          monster.vy = clamp(monster.vy + Math.sin(hitAngle) * mag, -220, 220);
        }
        const elShared = String(element || this.currentElement() || "physical").toLowerCase();
        const txtShared = isCrit ? `KRİTİK! -${Math.round(damage)}` : `-${Math.round(damage)}`;
        this.spawnDamageNumber(monster.x, monster.y, txtShared, isCrit ? '#ffd54f' : '#ffffff', isCrit);
        this.spawnImpact(monster.x, monster.y, isCrit ? '#ffd54f' : '#fff3e0', isCrit);
        this.spawnBloodParticles(monster.x, monster.y, hitAngle, isCrit ? 16 : 8, isCrit ? '#ffb300' : '#ef5350');
        if (this.sound) this.sound.play(elShared === 'physical' ? 'hit_physical' : 'hit_magic');
        if (this.onStatsChange) this.onStatsChange(this.playerData.stats);
        this.attackIntent(monster, damage, isCrit, elShared);
        return;
      }
      monster.hp -= damage;
      monster.flashTimer = 0.12;
      monster.state = 'CHASE';
      // Uzaktan vurulsa bile peşimize düşsün; 7-9 sn sonra (mesafe açılırsa) bırakır.
      monster.aggroTimer = Math.max(Number(monster.aggroTimer) || 0, monster.elite ? 9 : 7);
      // Geri tepme artık çok yumuşak: sadece "ağır" yetenekler hafifçe iter.
      // (Ok/okçu vuruşları canavarı uçurmasın diye varsayılan 0.)
      const kb = Math.max(0, Number(knockbackStrength) || 0);
      if (kb > 0 && !monster.elite) {
        const mag = Math.min(150, kb) * 0.5;
        monster.vx = clamp(monster.vx + Math.cos(hitAngle) * mag, -220, 220);
        monster.vy = clamp(monster.vy + Math.sin(hitAngle) * mag, -220, 220);
      }

      const vampRate = this.playerData.stats.omnivamp || 0;
      if (vampRate > 0) {
        const heal = Math.round(damage * vampRate);
        if (heal > 0) {
          this.playerData.stats.currentHp = Math.min(this.playerData.stats.maxHp, this.playerData.stats.currentHp + heal);
          this.spawnDamageNumber(this.player.x, this.player.y, `+${heal}`, '#69f0ae');
        }
      }

      // Sınıf / ırk can çalma pasifi (sıra tabanlı savaşla aynı kural).
      const passiveLeech = this.passiveSum("lifesteal", "pct");
      if (passiveLeech > 0) {
        const heal = Math.round(damage * passiveLeech);
        if (heal > 0) {
          this.playerData.stats.currentHp = Math.min(this.playerData.stats.maxHp, this.playerData.stats.currentHp + heal);
          this.spawnDamageNumber(this.player.x, this.player.y, `+${heal}`, '#69f0ae');
        }
      }

      // Vuruş yazısı sade: sadece sayı (-40). "Direnç/ZAYIF" etiketi yok
      // (direnç bambaşka bir stat; hasar yazısında kafa karıştırıyordu).
      const elTint = elMult > 1.15 ? "#ffe082" : (elMult < 0.9 ? "#90a4ae" : null);
      const txt = isCrit ? `KRİTİK! -${Math.round(damage)}` : `-${Math.round(damage)}`;
      this.spawnDamageNumber(monster.x, monster.y, txt, isCrit ? '#ffd54f' : (elTint || '#ffffff'), isCrit);
      if (elMult > 1.15) {
        this.spawnImpact(monster.x, monster.y, ELEMENT_COLOR[el] || '#ffe082', true);
        this.spawnExplosionParticles(monster.x, monster.y, 6, ELEMENT_COLOR[el] || '#ffe082');
      }
      this.spawnImpact(monster.x, monster.y, isCrit ? '#ffd54f' : '#fff3e0', isCrit);
      this.spawnBloodParticles(monster.x, monster.y, hitAngle, isCrit ? 16 : 8, isCrit ? '#ffb300' : '#ef5350');
      // ÇARPMA SESİ: kılıç/balta/ok/magic hedefe değdiğinde.
      if (this.sound) this.sound.play(el === 'physical' ? 'hit_physical' : 'hit_magic');

      if (monster.hp <= 0) {
        monster.dead = true;
        monster.deathTimer = 0.45;
        monster.state = 'DEAD';
        this.sound.play('kill');
        this.spawnExplosionParticles(monster.x, monster.y, 25, monster.color);
        for (let i = 0; i < 8; i++) { // yükselen ruh kıvılcımları
          this.addParticle({
            wx: monster.x, wy: monster.y, wz: 20 + Math.random() * 20,
            vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, vz: 50 + Math.random() * 60,
            color: '#b9f6ca', size: 2 + Math.random() * 2, life: 0.9, grav: -30
          });
        }
        const gold = Math.floor(6 + Math.random() * 10) + Math.round((monster.gold || 0) * 0.5);
        this.playerData.stats.gold += gold;
        this.later(() => this.spawnDamageNumber(monster.x, monster.y, `+${gold}g`, '#ffd54f'), 150);
        if (this.onStatsChange) this.onStatsChange(this.playerData.stats);
        // Sunucuya bildir (xp/altın sunucu tarafından sınırlı verilir).
        if (this.onKill) this.onKill(monster);
        this.passiveHealOnKill();
        this.scheduleRespawn();
      }

      if (this.onStatsChange) this.onStatsChange(this.playerData.stats);
    }

    // ======================================================================
    // ORTAK CANAVAR DÜNYASI (sunucu otoritesi)
    // Sunucu yalnızca durum gönderir (id/kind/x/y/hp); painter, renk, animasyon
    // ve efektler burada, mevcut tanımlardan üretilir. Görsel kalite korunur.
    // ======================================================================
    sharedMonsterObj(s) {
      const base = this.resolveMonsterDef(s && s.k) || {
        kind: (s && s.k) || 'goblin', name: (s && s.k) || 'Goblin',
        painter: 'goblin', color: '#56ab2f', accent: '#d9f99d', element: 'physical',
        tags: [], speed: 130, radius: 16, aggroRange: 280, exp: 45, gold: 6, damage: 24,
      };
      const hp = Math.max(0, Number(s && s.h) || 0);
      const maxHp = Math.max(1, Number(s && s.m) || hp || 1);
      const elite = !!(s && s.e) || !!base.elite;
      const w = this.serverToWorld(Number(s && s.x) || 0, Number(s && s.y) || 0);
      return {
        id: String(s.i), serverId: String(s.i), shared: true,
        kind: base.kind || s.k, baseKind: base.kind || s.k,
        name: elite ? `★ ${base.name || s.k}` : (base.name || s.k),
        painter: base.painter || 'goblin',
        color: base.color || '#56ab2f',
        accent: base.accent || '#d9f99d',
        element: base.element || 'physical',
        tags: Array.isArray(base.tags) ? base.tags.slice() : [],
        elite: elite,
        ability: base.ability || null,
        statusOnHit: base.status || null,
        hp: hp, maxHp: maxHp, hpGhost: maxHp,
        speed: Number(base.speed) || 130,
        damage: Number(base.damage) || 24,
        radius: Math.max(10, Math.round((Number(base.radius) || 16) * (elite ? 1.5 : 1.4))),
        exp: Math.round(Number(base.exp) || 45),
        gold: Math.round(Number(base.gold) || 6),
        x: w.x, y: w.y, z: 0,
        sx: w.x, sy: w.y,             // sunucudan gelen hedef konum
        patrolCenterX: w.x, patrolCenterY: w.y,
        patrolTimer: Math.random() * 3, patrolTargetX: w.x, patrolTargetY: w.y,
        vx: 0, vy: 0, facingAngle: 0,
        state: (s && s.s === 'CHASE') ? 'CHASE' : 'PATROL',
        attackTimer: 0, attackCooldown: Number(base.attackCooldown) || 1.4,
        flashTimer: 0, alertTimer: 0, statuses: {},
        skills: Array.isArray(base.skills) ? base.skills : null,
        skillCds: (Array.isArray(base.skills) ? base.skills : []).map((sk) => (Number(sk.cd) || 6) * (0.4 + Math.random() * 0.6)),
        cast: null, aggroRange: Number(base.aggroRange) || 280, aggroTimer: 0,
        attackDefense: base.attackDefense || null,
        attackKind: base.attackKind || null,
        attackTelegraph: Number(base.attackTelegraph) || 0,
        guardPressure: base.guardPressure != null ? Number(base.guardPressure) : null,
        boss: !!(base.boss || base.isBoss),
        meleeWindup: null, parriedTimer: 0,
        walkPhase: Math.random() * 6, deathTimer: 0, dead: false,
      };
    }

    // Sunucu listesini yerel listeyle eşitle (ekle / güncelle / kaldır).
    applyServerMobs(list) {
      if (!Array.isArray(list)) return;
      this.sharedMobs = true;
      this._sharedMap = this._sharedMap || new Map();
      // İlk sunucu listesi geldiğinde yerel (client-side) canavarlar düşürülür:
      // aynı canavar iki kez görünmesin.
      if (this.monsters.some((m) => m && !m.shared)) {
        this.monsters = this.monsters.filter((m) => m && m.shared);
      }
      const seen = new Set();
      for (const s of list) {
        if (!s || s.i == null) continue;
        const id = String(s.i);
        seen.add(id);
        let m = this._sharedMap.get(id);
        if (!m) {
          m = this.sharedMonsterObj(s);
          this._sharedMap.set(id, m);
          this.monsters.push(m);
        }
        const w = this.serverToWorld(Number(s.x) || 0, Number(s.y) || 0);
        m.sx = w.x; m.sy = w.y;
        m.maxHp = Math.max(1, Number(s.m) || m.maxHp);
        if (Number.isFinite(Number(s.h))) m.hp = Math.max(0, Number(s.h));
        if (s.s === 'DEAD') {
          if (!m.dead) this.playSharedDeath(m);
        } else {
          m.state = s.s === 'CHASE' ? 'CHASE' : 'PATROL';
        }
      }
      for (const m of this.monsters.slice()) {
        if (!m || !m.shared) continue;
        if (seen.has(String(m.id))) continue;
        this.monsters = this.monsters.filter((x) => x !== m);
        if (this._sharedMap) this._sharedMap.delete(String(m.id));
      }
    }

    playSharedDeath(m) {
      if (!m || m.dead) return;
      m.hp = 0;
      m.dead = true;
      m.deathTimer = 0.45;
      m.state = 'DEAD';
      if (this.sound) this.sound.play('kill');
      this.spawnExplosionParticles(m.x, m.y, 25, m.color);
      for (let i = 0; i < 8; i++) {
        this.addParticle({
          wx: m.x, wy: m.y, wz: 20 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, vz: 50 + Math.random() * 60,
          color: '#b9f6ca', size: 2 + Math.random() * 2, life: 0.9, grav: -30
        });
      }
    }

    // Başka bir oyuncunun vuruşu: hasar sayısı/parçacık göster, HP'yi eşitle.
    applyServerMobHit(p) {
      if (!p) return;
      const m = (this._sharedMap && this._sharedMap.get(String(p.i))) || null;
      if (!m || m.dead) return;
      if (Number.isFinite(Number(p.h))) {
        m.hp = Math.max(0, Number(p.h));
        m.hpGhost = Math.max(m.hp, Number(m.hpGhost) || m.hpGhost || m.hp);
      }
      m.flashTimer = 0.12;
      const mine = this.localId && String(p.by) === String(this.localId);
      if (!mine && Number(p.d) > 0) {
        // Uzak oyuncunun vuruşu: kimin vurduğu görünsün diye sade sayı.
        const txt = (p.c ? 'KRİTİK! -' : '-') + Math.round(Number(p.d));
        this.spawnDamageNumber(m.x, m.y, txt, p.c ? '#ffd54f' : '#e3f2fd', !!p.c);
        this.spawnImpact(m.x, m.y, p.c ? '#ffd54f' : '#fff3e0', !!p.c);
        this.spawnBloodParticles(m.x, m.y, Math.random() * TAU, 6, '#ef5350');
      }
      if (m.hp <= 0) this.playSharedDeath(m);
    }

    // Sunucuya saldırı niyeti: hasar/ölüm kararı sunucunun.
    attackIntent(monster, damage, isCrit, element) {
      if (!this.onAttack || !monster) return;
      this.onAttack({
        id: monster.serverId || monster.id,
        dmg: Math.max(1, Math.round(damage)),
        crit: !!isCrit,
        el: element || null,
        range: 380,
      });
    }

    spawnDamageNumber(wx, wy, text, color, isCrit = false) {
      this.damageNumbers.push({
        wx, wy, text, color, isCrit,
        z: 36, vz: isCrit ? 95 : 70, ox: 0, vox: (Math.random() - 0.5) * 40,
        alpha: 1.0, life: 0.9, maxLife: 0.9, age: 0, scale: isCrit ? 1.4 : 1.0
      });
    }

    spawnBloodParticles(wx, wy, angle, count, color) {
      for (let i = 0; i < count; i++) {
        const spread = angle + (Math.random() - 0.5) * 1.2;
        const speed = 80 + Math.random() * 180;
        const droplet = i % 3 === 0;
        this.addParticle({
          wx, wy, wz: 15, vx: Math.cos(spread) * speed, vy: Math.sin(spread) * speed, vz: 50 + Math.random() * 60,
          color: droplet ? '#8e1a1a' : color, size: droplet ? 2.2 + Math.random() * 1.8 : 2 + Math.random() * 2,
          life: 0.4 + Math.random() * 0.3, additive: !droplet
        });
      }
    }

    spawnExplosionParticles(wx, wy, count, color) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * TAU;
        const speed = 60 + Math.random() * 220;
        this.addParticle({
          wx, wy, wz: 20, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, vz: 40 + Math.random() * 80,
          color, size: 2.5 + Math.random() * 3.5, life: 0.5 + Math.random() * 0.4
        });
      }
    }

    addTrauma(amount) {
      this.shake.trauma = Math.min(1.0, this.shake.trauma + amount);
    }

    checkInteractionNearPlayer() {
      // Yalnızca etkileşilebilir nesneler (POI + sunak) taranır; kare başına
      // binlerce ağacı dolaşmak gereksizdi.
      const list = this._interactables || this.scenery || [];
      const px = this.player.x, py = this.player.y;
      const r = this.interactRadius || 76;
      let best = null, bestD2 = r * r;
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        const dx = s.wx - px, dy = s.wy - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) { bestD2 = d2; best = s; }
      }
      this._interactTarget = best;
      return !!best;
    }

    // Yakındaki düşmüş müttefiki bulur (E ile diriltmek için).
    updateReviveTarget() {
      this._reviveTarget = null;
      this._reviveName = null;
      if (this.downed) return;
      let best = null, bestD = this.reviveRange || 110;
      for (const o of Object.values(this.others || {})) {
        if (!o || !o.downed) continue;
        const d = Math.hypot((o.wx || 0) - this.player.x, (o.wy || 0) - this.player.y);
        if (d < bestD) { bestD = d; best = o; }
      }
      if (best) { this._reviveTarget = best.id; this._reviveName = best.name || 'Ally'; }
    }

    getClosestMonsterToMouse(maxDist = 150) {
      let closest = null;
      let minD = maxDist;
      this.monsters.forEach((m) => {
        if (m.hp <= 0) return;
        const d = Math.hypot(m.x - this.mouse.worldX, m.y - this.mouse.worldY);
        if (d < minD) { minD = d; closest = m; }
      });
      return closest;
    }

    commandPetAttack() {
      if (!this.companion.active) return;
      const target = this.getClosestMonsterToMouse(260);
      if (target) this.companion.target = target;
    }

    commandPetFrenzy() {
      if (!this.companion.active) return;
      this.companion.target = this.getClosestMonsterToMouse(300) || this.monsters[0];
      if (this.companion.target) {
        this.companion.x = this.companion.target.x;
        this.companion.y = this.companion.target.y;
        this.hitEnemiesInRadius(this.companion.x, this.companion.y, 80, this.playerData.stats.attack * 1.4, true, 250);
      }
    }

    getArchetypeColor() {
      switch (this.player.archetype) {
        case ARCHETYPES.MELEE: return '#ffb300';
        case ARCHETYPES.RANGED: return '#4caf50';
        case ARCHETYPES.MAGE: return '#ab47bc';
        case ARCHETYPES.SHADOW: return '#e91e63';
        case ARCHETYPES.TAMER: return '#ff9800';
        default: return '#00e5ff';
      }
    }

    // ======================================================================
    // GÜNCELLEME (UPDATE)
    // ======================================================================
    // ---- Diğer oyuncuların yumuşak hareketi + animasyon durumu ----
    updateOthers(dt) {
      const others = this.others;
      if (!others) return;
      const stepT = Math.max(1e-4, dt);
      for (const id of Object.keys(others)) {
        const o = others[id];
        if (!o) continue;
        if (!Number.isFinite(o.wx)) o.wx = Number.isFinite(o.tx) ? o.tx : 0;
        if (!Number.isFinite(o.wy)) o.wy = Number.isFinite(o.ty) ? o.ty : 0;
        const tx = Number.isFinite(o.tx) ? o.tx : o.wx;
        const ty = Number.isFinite(o.ty) ? o.ty : o.wy;
        const dx = tx - o.wx, dy = ty - o.wy;
        const dist = Math.hypot(dx, dy);
        const px = o.wx, py = o.wy;
        if (dist > 0.5 && !o.downed) {
          // 10 Hz sunucu konumlarını yumuşat: ışınlanma yerine yürüyüş.
          const k = Math.min(1, 1 - Math.exp(-16 * dt));
          o.wx += dx * k; o.wy += dy * k;
        }
        o.vx = (o.wx - px) / stepT;
        o.vy = (o.wy - py) / stepT;
        const spd = Math.hypot(o.vx, o.vy);
        o.moving = spd > 12;
        if (o.moving) {
          o.facingAngle = Math.atan2(o.vy, o.vx);
          o.walkPhase = (o.walkPhase || 0) + Math.min(0.5, spd / 160) * dt * 12;
        } else {
          o.walkPhase = (o.walkPhase || 0) + dt * 1.6;
        }
        if (o.attackAnimTimer > 0) o.attackAnimTimer = Math.max(0, o.attackAnimTimer - dt);
        if (!Number.isFinite(o.facingAngle)) o.facingAngle = 0;
        if (!Number.isFinite(o.walkPhase)) o.walkPhase = 0;
        if (!Number.isFinite(o.swingDir)) o.swingDir = 1;
      }
    }

    // Sunucudan gelen diğer oyuncu efektini (saldırı/yetenek/dash) oynat.
    playAllyAction(p) {
      if (!p || !p.id) return;
      const o = this.others && this.others[p.id];
      if (!o) return;
      const x = Number.isFinite(p.x) ? p.x : o.wx;
      const y = Number.isFinite(p.y) ? p.y : o.wy;
      if (this.player && Math.hypot(x - this.player.x, y - this.player.y) > 1400) return;
      const angle = Number.isFinite(p.angle) ? p.angle : o.facingAngle || 0;
      const color = p.color || '#8ec5ff';
      const radius = Number.isFinite(p.radius) && p.radius > 0 ? p.radius : 70;
      const S = o.style || (o.style = getClassStyle(o.character || 'warrior'));
      const archetype = getArchetype(o.character || 'warrior');
      o.facingAngle = angle;
      o.attackAnimTimer = 0.22;
      o.swingDir = -(o.swingDir || 1);

      if (p.kind === 'revive') {
        this.aoeEffects.push({ x, y, radius: radius, duration: 0.7, timer: 0.7, color: '#8dffc0', ring: true, dome: true });
        if (typeof this.spawnExplosionParticles === 'function') this.spawnExplosionParticles(x, y, 16, '#8dffc0');
        return;
      }
      if (p.kind === 'dash') {
        this.aoeEffects.push({ x, y, radius: 34, duration: 0.28, timer: 0.28, color, ring: true });
        return;
      }
      if (p.kind === 'attack') {
        if (archetype === ARCHETYPES.MELEE || archetype === ARCHETYPES.SHADOW) {
          this.slashes.push({ x, y, angle, radius: archetype === ARCHETYPES.MELEE ? 55 : 48, arc: Math.PI * 0.6, duration: 0.2, timer: 0.2, color: S.slash || color, dir: o.swingDir });
        } else {
          const type = archetype === ARCHETYPES.RANGED ? 'arrow' : archetype === ARCHETYPES.TAMER ? 'primal_fang' : 'magic_orb';
          const spd = archetype === ARCHETYPES.RANGED ? 650 : archetype === ARCHETYPES.TAMER ? 580 : 520;
          this.projectiles.push({
            type, x: x + Math.cos(angle) * 20, y: y + Math.sin(angle) * 20,
            vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
            radius: type === 'magic_orb' ? 9 : 6, life: 0.8, damage: 0, isCrit: false, color: S.proj || color,
            cosmetic: true,
          });
        }
        return;
      }
      // skill
      const visual = p.visual ? String(p.visual) : '';
      if (visual && typeof this.castVisual === 'function') {
        try { this.castVisual(visual, x, y, { color, radius, angle, follow: false }); } catch (e) {}
      }
      this.aoeEffects.push({ x, y, radius: Math.min(220, radius), duration: 0.45, timer: 0.45, color, ring: true });
      if (p.range > 0) {
        const dir = angle;
        this.aoeEffects.push({
          x: x + Math.cos(dir) * Math.min(420, p.range) * 0.5,
          y: y + Math.sin(dir) * Math.min(420, p.range) * 0.5,
          radius: Math.min(160, Math.max(40, radius * 0.7)), duration: 0.35, timer: 0.35, color, ring: true,
        });
      }
    }

    // Yerel eylemimizi diğer oyunculara yayınla (yalnızca kozmetik).
    emitAllyAction(fx) {
      if (!this.onAllyAction || this.allyFxEnabled === false || !fx) return;
      try { this.onAllyAction(fx); } catch (e) { /* kozmetik */ }
    }

    update(dt) {
      // Hit-stop: ağır vuruş / guardbreak anında birkaç karelik donma.
      if (this._hitstop > 0 && dt > 0) {
        const used = Math.min(this._hitstop, dt);
        this._hitstop -= used;
        dt = Math.max(dt * 0.12, 0.0001);
      }
      this.time += dt;
      this.updateOthers(dt);
      const P = this.player;
      this.updateWeather(dt);

      // --- Güvenlik ağı: yok olan/NaN koordinatlar siyah ekrana yol açmasın ---
      if (!P || !Number.isFinite(P.x) || !Number.isFinite(P.y)) {
        if (P) { P.x = 0; P.y = 0; P.vx = 0; P.vy = 0; }
        this.snapCamera();
      }
      if (!Number.isFinite(this.camera.x) || !Number.isFinite(this.camera.y)) this.snapCamera();
      if (!Number.isFinite(this.zoom) || this.zoom <= 0) { this.zoom = 1; this.zoomTarget = 1; }
      // İlk karede yakınlığı "11 sıra" hedefine oturt (eskiden çok uzaktı).
      if (!this._zoomInit && Number.isFinite(this.height) && this.height > 0) {
        this._zoomInit = true;
        const dz = this.getDefaultZoom();
        this.zoom = dz;
        this.zoomTarget = dz;
      }
      // Ekran boyutu değişince (resize) zoom sınırı da değişir: hedefi kırp.
      this.zoomTarget = this.clampZoomTarget(this.zoomTarget);
      this.zoom = Math.max(this.getMinZoom(), Math.min(this.getMaxZoom(), this.zoom));
      if (!Number.isFinite(this.worldScale) || this.worldScale <= 0) this.worldScale = this.tileSize || 64;
      if (!Array.isArray(this.tiles) || this.tiles.length === 0) { try { this.generateMap(); } catch (e) { this.tiles = this.tiles || []; } }
      if (!this.playerData.stats) this.playerData.stats = {};
      this.zoom += (this.zoomTarget - this.zoom) * (1 - Math.exp(-8 * dt));
      const mw = this.screenWorld(this.mouse.screenX, this.mouse.screenY);
      this.mouse.worldX = mw.x;
      this.mouse.worldY = mw.y;

      // --- TravelSkills zamanlayıcıları (dokunulmazlık / yetenek kilidi) ---
      if (P.invuln > 0) P.invuln = Math.max(0, P.invuln - dt);
      if (P.phase > 0) P.phase = Math.max(0, P.phase - dt);
      if (P.skillLock > 0) P.skillLock = Math.max(0, P.skillLock - dt);

      // --- Savunma sistemi (parry/blok/guard/stamina) + göstergeler ---
      this.updateCombatDefense(dt);
      this.updateCombatIndicators(dt);

      // Can değişimini sunucuya bildir (0.25 sn'de bir, sadece değiştiyse).
      const stt = this.playerData.stats || {};
      this._hpSendTimer += dt;
      if (this.onHpChange && !this._hpFromServer) { /* gerçek oda verisi gelene kadar can yazma */ }
      else if (this.onHpChange && stt.currentHp !== this._lastHpSent && this._hpSendTimer > 0.25) {
        this._hpSendTimer = 0;
        this._lastHpSent = stt.currentHp;
        this.onHpChange(stt.currentHp);
      }

      // Can bitti: yerel olarak yere düş (tek sefer). Sunucu "downed" ya da "fallen" onaylar.
      // ÖNEMLİ: Gerçek oda verisi gelmeden (_hpFromServer=false) yerel can 0 ise
      // bunu ölüm sayma; aksi halde yeni seferde motor eski/boş canla anında ölür.
      const hpNow = stt.currentHp != null ? stt.currentHp : (stt.maxHp || 1);
      if (this._hpFromServer && hpNow <= 0 && !this._down) {
        this._down = true;
        stt.currentHp = 0;
        this.downed = true;
        this.player.vx = 0; this.player.vy = 0; this.player.isDashing = false;
        this._lastHpSent = 0;
        this.hurt = 0.85;
        this.shake.trauma = Math.min(1, this.shake.trauma + 0.85);
        // Yere düşme: kırmızı kırılma halkası + kıvılcımlar (efekt)
        this.aoeEffects.push({ x: P.x, y: P.y, radius: 92, duration: 0.55, timer: 0.55, color: '#ff5252', ring: true });
        for (let i = 0; i < 16; i++) {
          const a = Math.random() * TAU;
          const sp = 50 + Math.random() * 150;
          this.addParticle({
            wx: P.x, wy: P.y, wz: 20, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: 60 + Math.random() * 60,
            color: i % 2 ? '#ff5252' : '#ff8a80', size: 2.2 + Math.random() * 2.4,
            life: 0.5 + Math.random() * 0.35, grav: 120
          });
        }
        for (const m of this.monsters || []) {
          if (m.hp > 0) { m.state = 'PATROL'; m.alertTimer = 0; m.aggroTimer = 0; m.cast = null; m.patrolCenterX = m.x; m.patrolCenterY = m.y; }
        }
        if (this.onDown) this.onDown();
      } else if (hpNow > 0 && this._down) {
        this._down = false;
        this.downed = false;
      }

      // 1. Ekran sarsıntısı
      if (this.shake.trauma > 0) {
        const power = Math.pow(this.shake.trauma, 2) * 16;
        this.shake.x = (Math.random() * 2 - 1) * power;
        this.shake.y = (Math.random() * 2 - 1) * power;
        this.shake.trauma = Math.max(0, this.shake.trauma - dt * 1.5);
      } else { this.shake.x = 0; this.shake.y = 0; }
      if (this.hurt > 0) this.hurt = Math.max(0, this.hurt - dt);

      // 2. Hareket
      let moveX = 0, moveY = 0;
      if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
      if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
      if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
      if (this.keys['d'] || this.keys['arrowright']) moveX += 1;
      if (this.downed) { moveX = 0; moveY = 0; }

      if (moveX !== 0 || moveY !== 0) {
        // Girdi vektörünü normalize et: çapraz hareket düz hareketten hızlı olmasın.
        const len = Math.hypot(moveX, moveY) || 1;
        const nx = moveX / len, ny = moveY / len;
        const isoMoveX = ny * 0.707 + nx * 0.707;
        const isoMoveY = ny * 0.707 - nx * 0.707;
        const buffSpeed = 1 + this.buffPct("speed");
        // skillLock: TravelSkills atılma/zıplama sırasında oyuncu girdisini kilitler.
        const locked = (P.skillLock || 0) > 0;
        const spd = locked ? 0 : P.baseSpeed * (P.speedMul || 1) * this.moveSpeedMult();
        P.vx = isoMoveX * spd * (this.playerSlowMult || 1) * buffSpeed * (P.channel ? 0.45 : 1);
        P.vy = isoMoveY * spd * (this.playerSlowMult || 1) * buffSpeed * (P.channel ? 0.45 : 1);
      } else { P.vx = 0; P.vy = 0; }

      // 3. Dash
      if (P.isDashing && P.guardbreakTimer > 0) { P.isDashing = false; P.dashTimer = 0; }
      if (P.isDashing) {
        P.x += P.dashVx * dt;
        P.y += P.dashVy * dt;
        P.dashTimer -= dt;
        this.createGhostTrail();
        if (P.dashTimer <= 0) P.isDashing = false;
      } else {
        P.x += P.vx * dt;
        P.y += P.vy * dt;
      }

      // Ayak sesi: yürürken kısa aralıklarla, dash sırasında susar.
      if ((moveX || moveY) && !P.isDashing && !this.downed) {
        this._stepTimer = (this._stepTimer || 0) - dt;
        if (this._stepTimer <= 0) {
          this._stepTimer = P.sprinting ? 0.26 : 0.4;
          if (this.sound) this.sound.play('footstep', P.sprinting ? 0.6 : 0.45);
          if (P.sprinting) {
            // Koşarken arkada toz izi (sprint hissi).
            for (let i = 0; i < 3; i++) {
              this.addParticle({
                wx: P.x - P.vx * 0.03, wy: P.y - P.vy * 0.03, wz: 3 + Math.random() * 5,
                vx: (Math.random() - 0.5) * 40 - P.vx * 0.06, vy: (Math.random() - 0.5) * 40 - P.vy * 0.06,
                vz: 10 + Math.random() * 18, color: '#a1887f', size: 1.6 + Math.random() * 2,
                life: 0.3 + Math.random() * 0.2, grav: 30, grow: 6
              });
            }
          }
        }
      } else {
        this._stepTimer = 0;
      }

      const maxDistFromCenter = (this.mapRadius - 0.5) * this.tileSize;
      // Katı nesnelerden it, sonra harita sınırına kenetle.
      this.resolvePlayerCollision(P);
      if (!this.persistent) {
        const currentDist = Math.hypot(P.x, P.y);
        if (currentDist > maxDistFromCenter) {
          const ang = Math.atan2(P.y, P.x);
          P.x = Math.cos(ang) * maxDistFromCenter;
          P.y = Math.sin(ang) * maxDistFromCenter;
        }
      }
      if (this.persistent) { this.applyPersistentMovement(P); this.ensurePersistentWindow(); }

      // Sunucuya pozisyon bildirimi (10 Hz).
      if (this.onMove && this.time - this._lastMoveEmit > 0.1) {
        this._lastMoveEmit = this.time;
        this.onMove(this.worldToServer(P.x, P.y));
      }

      // Yön: mobilde joystick/dokunuş yönü, masaüstünde fare.
      P.facingAngle = this.skillAim();
      P.z += (this.groundZAt(P.x, P.y) - P.z) * (1 - Math.exp(-dt * 14)); // yüksek karolara yumuşak çıkış
      if (this.persistent) this.updatePersistentBiome();

      // Yürüme animasyonu + ayak tozu
      const spd = Math.hypot(P.vx, P.vy);
      if (spd > 10 && !P.isDashing) {
        P.walkPhase += dt * (7 + spd * 0.025);
        this.dustTimer -= dt;
        if (this.dustTimer <= 0) {
          this.dustTimer = 0.17;
          this.addParticle({
            wx: P.x - P.vx * 0.04, wy: P.y - P.vy * 0.04, wz: P.z + 2,
            vx: -P.vx * 0.1 + (Math.random() - 0.5) * 12, vy: -P.vy * 0.1 + (Math.random() - 0.5) * 12, vz: 12,
            color: '#8d7b62', size: 2.5, life: 0.45, grav: 0, additive: false, grow: 6
          });
        }
      }

      if (P.dashCooldownTimer > 0) P.dashCooldownTimer -= dt;
      if (P.attackCooldownTimer > 0) P.attackCooldownTimer -= dt;
      // Basılı tutunca otomatik temel saldırı: cooldown dolduğu an yeniden vur.
      if (this.mouse && this.mouse.isDown && !this.downed && !this._down &&
          P.attackCooldownTimer <= 0 && !(P.skillLock > 0) &&
          P.guardbreakTimer <= 0 && P.parryRecovery <= 0 && P.parryPhase === 'idle') {
        this.triggerPrimaryAttack();
      }
      if (P.attackAnimTimer > 0) P.attackAnimTimer -= dt;
      if (P.weaponSwing) {
        P.weaponSwing.timer -= dt;
        if (P.weaponSwing.timer <= 0) P.weaponSwing = null;
        else P.attackAnimTimer = Math.max(P.attackAnimTimer, 0.02);
      }
      this.updatePlayerStatuses(dt);
      this.updateChannel(dt);

      for (const k in P.cooldowns) {
        if (P.cooldowns[k].current > 0) P.cooldowns[k].current = Math.max(0, P.cooldowns[k].current - dt);
      }

      for (let i = P.ghostTrails.length - 1; i >= 0; i--) {
        const gt = P.ghostTrails[i];
        gt.alpha -= dt * 3.5;
        if (gt.alpha <= 0) P.ghostTrails.splice(i, 1);
      }

      // 4. Pet
      const C = this.companion;
      if (C.active) {
        const px = C.x, py = C.y;
        if (C.target && C.target.hp > 0) {
          const dx = C.target.x - C.x, dy = C.target.y - C.y;
          const d = Math.hypot(dx, dy);
          if (d > 35) {
            C.x += (dx / d) * C.speed * dt;
            C.y += (dy / d) * C.speed * dt;
          } else if (C.attackCooldown <= 0) {
            this.applyDamageToMonster(C.target, this.playerData.stats.attack * 0.7, false, Math.atan2(dy, dx), 120);
            C.attackCooldown = 0.8;
          }
        } else {
          const tx = P.x - 35, ty = P.y + 25;
          const dx = tx - C.x, dy = ty - C.y;
          const d = Math.hypot(dx, dy);
          if (d > 25) {
            C.x += (dx / d) * (C.speed * 0.85) * dt;
            C.y += (dy / d) * (C.speed * 0.85) * dt;
          }
        }
        if (C.attackCooldown > 0) C.attackCooldown -= dt;
        const sdx = ((C.x - px) - (C.y - py)) * COS_30;
        C.moving = Math.hypot(C.x - px, C.y - py) > 0.5;
        if (Math.abs(sdx) > 0.05) C.face = sdx > 0 ? 1 : -1;
        C.animFrame += dt * (C.moving ? 14 : 3);
      }

      // 5. Canavar yapay zekası
      this.monsters.forEach((m) => {
        if (m.flashTimer > 0) m.flashTimer -= dt;
        // Hayalet can barı yavaşça iner
        if (m.hpGhost > Math.max(0, m.hp)) m.hpGhost = Math.max(Math.max(0, m.hp), m.hpGhost - m.maxHp * dt * 0.55);

        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.vx *= Math.pow(0.05, dt);
        m.vy *= Math.pow(0.05, dt);
        m.z += (this.groundZAt(m.x, m.y) - m.z) * (1 - Math.exp(-dt * 14));

        if (m.hp <= 0) { if (m.deathTimer > 0) m.deathTimer -= dt; return; }

        // --- Durum efektleri (freeze/stun/root/slow/poison/burn/bleed/shock) ---
        let statusSpeedMult = 1;
        let statusDisabled = false;
        if (m.statuses) {
          for (const key of Object.keys(m.statuses)) {
            const s = m.statuses[key];
            if (!s) continue;
            s.timer -= dt;
            if (s.dps > 0) {
              s.tickTimer -= dt;
              if (s.tickTimer <= 0) {
                s.tickTimer += s.tick || 0.5;
                const tickDmg = Math.max(1, Math.round(s.dps * (s.tick || 0.5)));
                m.hp -= tickDmg;
                m.flashTimer = Math.max(m.flashTimer, 0.06);
                // Ortak dünya: DOT hasarı da sunucuya niyet olarak gider.
                if (m.shared) {
                  if (m.hp < 1) m.hp = 1;
                  this.attackIntent(m, tickDmg, false, s.type === 'burn' ? 'fire' : null);
                }
                const c = s.type === 'burn' ? '#ff7043' : (s.type === 'bleed' ? '#ff5370' : (s.type === 'shock' ? '#fff176' : '#9ccc65'));
                this.spawnDamageNumber(m.x, m.y, `-${tickDmg}`, c);
                if (m.hp <= 0) {
                  m.dead = true; m.deathTimer = 0.45; m.state = 'DEAD';
                  this.sound.play('kill');
                  this.spawnExplosionParticles(m.x, m.y, 22, m.color);
                  this.onMonsterDeath(m);
                  delete m.statuses[key];
                  return;
                }
              }
            }
            if (s.type === 'slow') statusSpeedMult *= (1 - Math.min(0.85, s.slow || 0.3));
            if (s.type === 'freeze' || s.type === 'stun' || s.type === 'root') statusDisabled = true;
            if (s.timer <= 0) delete m.statuses[key];
          }
        }

        const distToPlayer = Math.hypot(P.x - m.x, P.y - m.y);
        let walking = false;

        // Oyuncu çok uzaklaştıysa canavarı yakınına taşı (dünya boş kalmasın).
        // Ortak dünyada konum sunucunun; bu "geri doldurma" kapalı.
        if (!m.shared && distToPlayer > 1500) {
          const ang = Math.random() * TAU, r = 420 + Math.random() * 360;
          const np = this.clampToWorld(P.x + Math.cos(ang) * r, P.y + Math.sin(ang) * r);
          m.x = np.x;
          m.y = np.y;
          m.patrolCenterX = m.x; m.patrolCenterY = m.y;
          m.patrolTargetX = m.x; m.patrolTargetY = m.y;
          m.vx = 0; m.vy = 0; m.state = 'PATROL';
          m.hp = m.maxHp; m.hpGhost = m.maxHp;
          return;
        }

        // --- Yetenek bekleme süreleri ---
        if (m.skillCds) {
          for (let i = 0; i < m.skillCds.length; i++) if (m.skillCds[i] > 0) m.skillCds[i] = Math.max(0, m.skillCds[i] - dt);
        }

        // Oyuncu yere düştüyse canavarlar saldırmayı bırakıp devriyeye döner.
        if (this.downed) { m.cast = null; m.meleeWindup = null; m.aggroTimer = 0; }

        // --- Aggro: vurulunca menzil dışından da peşimize düşer, mesafe açılıp
        // biraz beklendikten sonra bırakır. ---
        if (m.aggroTimer > 0) {
          m.aggroTimer -= dt * (distToPlayer > 620 ? 2.2 : 1);
          if (m.aggroTimer <= 0) {
            m.aggroTimer = 0;
            m.cast = null;
            m.meleeWindup = null;
            m.state = 'PATROL';
            m.patrolCenterX = m.x; m.patrolCenterY = m.y;
            m.patrolTargetX = m.x; m.patrolTargetY = m.y;
          }
        }
        const aggroRange = Number(m.aggroRange) || 280;
        const chasing = !this.downed && (m.aggroTimer > 0 || distToPlayer < aggroRange);

        // Parry ile bölünen saldırı: kısa sersemleme (karşı atak fırsatı).
        if (m.parriedTimer > 0) {
          m.parriedTimer = Math.max(0, m.parriedTimer - dt);
          m.cast = null;
          m.meleeWindup = null;
        }

        if (m.cast) {
          // Telegraph sürüyor: canavar yerinde sabitlenir, oyuncu kaçabilir.
          m.cast.timer -= dt;
          m.facingAngle = Math.atan2(m.cast.ty - m.y, m.cast.tx - m.x);
          if (m.cast.timer <= 0) {
            this.executeMonsterSkill(m, m.cast);
            m.cast = null;
          }
        } else if (m.meleeWindup) {
          // TELEGRAPH: kırmızı uyarı sürerken hasar YOK; süre bitince vurur.
          if (statusDisabled || this.downed) {
            m.meleeWindup = null;   // sersemleme/ölüm saldırıyı iptal eder
          } else {
            const mw = m.meleeWindup;
            mw.timer -= dt;
            m.facingAngle = mw.angle;
            if (mw.timer <= 0) {
              this.resolveMonsterMelee(m, mw);
              m.meleeWindup = null;
            }
          }
        } else if (chasing && !(m.parriedTimer > 0)) {
          m.state = 'CHASE';
          const angle = Math.atan2(P.y - m.y, P.x - m.x);
          m.facingAngle = angle;
          const reach = m.radius + P.radius + 6;

          // Menzildeyse ve hazırsa yetenek başlat (kırmızı telegraph).
          let started = false;
          if (m.skills && m.skills.length && m.skillCds && !statusDisabled) {
            for (let i = 0; i < m.skills.length; i++) {
              if ((m.skillCds[i] || 0) > 0) continue;
              const sk = m.skills[i];
              if (distToPlayer > (Number(sk.range) || 240)) continue;
              if (sk.kind === 'dash' && distToPlayer < 64) continue;
              // Telegraph süresi: saldırıya özel (parry/blok sınıfıyla birlikte).
              const info = this.classifyMonsterSkill(m, sk);
              const windup = info.telegraph;
              m.cast = { skill: sk, timer: windup, total: windup, x: m.x, y: m.y, tx: P.x, ty: P.y, angle, info };
              m.skillCds[i] = Number(sk.cd) || 6;
              started = true;
              break;
            }
          }
          if (!started) {
            if (distToPlayer > reach) {
              // Ortak dünyada yürüme sunucudan gelir; yerel itki kapalı.
              if (!statusDisabled && !m.shared) {
                m.x += Math.cos(angle) * m.speed * statusSpeedMult * dt;
                m.y += Math.sin(angle) * m.speed * statusSpeedMult * dt;
                walking = true;
              }
            } else if (m.attackTimer <= 0 && !statusDisabled) {
              m.attackTimer = m.attackCooldown;
              const monsterDmg = Math.max(5, m.damage - (this.playerData.stats.defense || 0) * 0.3);
              const info = this.classifyMonsterAttack(m);
              // Hasar anında değil, TELEGRAPH süresi bitince uygulanır.
              m.meleeWindup = {
                timer: info.telegraph, total: info.telegraph,
                angle, tx: P.x, ty: P.y,
                damage: Math.round(monsterDmg),
                defense: info.defense, kind: info.kind,
                guardPressure: info.guardPressure,
                ranged: info.ranged, range: info.range
              };
            }
          }
        } else {
          m.patrolTimer -= dt;
          if (m.patrolTimer <= 0) {
            m.patrolTimer = 2.5 + Math.random() * 2;
            const r = 60 + Math.random() * 80;
            const a = Math.random() * TAU;
            m.patrolTargetX = m.patrolCenterX + Math.cos(a) * r;
            m.patrolTargetY = m.patrolCenterY + Math.sin(a) * r;
          }
          const pdx = m.patrolTargetX - m.x, pdy = m.patrolTargetY - m.y;
          const pd = Math.hypot(pdx, pdy);
          if (pd > 10 && !statusDisabled && !m.shared) {
            const pAngle = Math.atan2(pdy, pdx);
            m.facingAngle = pAngle;
            m.x += Math.cos(pAngle) * (m.speed * 0.45) * statusSpeedMult * dt;
            m.y += Math.sin(pAngle) * (m.speed * 0.45) * statusSpeedMult * dt;
            walking = true;
          }
        }
        m.walkPhase += dt * (walking ? 9 : 2.2);
        // Görsel çizerler (aslan, iskelet vb.) yürüme animasyonunu bu bayrakla
        // açar; canavarlar konumu doğrudan güncellediği için vx/vy hep 0 kalıyordu.
        m.moving = walking;
        // Ortak dünya: konum sunucudan 10 Hz gelir, kareler arası yumuşatılır.
        if (m.shared) {
          const sdx = (Number(m.sx) || 0) - m.x;
          const sdy = (Number(m.sy) || 0) - m.y;
          const sd = Math.hypot(sdx, sdy);
          if (sd > 280) { m.x = m.sx; m.y = m.sy; }
          else if (sd > 0.4) {
            const k = Math.min(1, dt * 14);
            m.x += sdx * k;
            m.y += sdy * k;
            if (sd > 3) m.moving = true;
          }
        }
        if (m.attackTimer > 0) m.attackTimer -= dt;
      });

      // 6. Mermiler (+ iz ve parçacık)
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (!p.trail) p.trail = [];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 9) p.trail.shift();
        if (p.type === 'magic_orb' || p.type === 'primal_fang' || p.type === 'dagger') {
          this.addParticle({
            wx: p.x, wy: p.y, wz: 15, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, vz: 10,
            color: p.color, size: 2 + Math.random() * 1.5, life: 0.28, grav: 0
          });
        }

        let hit = false;
        if (p.hostile) {
          // DÜŞMAN mermisi SADECE oyuncuya çarpar. Önceden bu bloktan sonra
          // canavar çarpışma döngüsü de çalışıyordu; menzilli bir canavarın
          // mermisi doğduğu anda kendi gövdesine denk gelip canavarı kendine
          // hasar veriyordu (oyuncu hiçbir şey yapmadan canavar eriyordu).
          const dp = Math.hypot(P.x - p.x, P.y - p.y);
          if (dp <= P.radius + p.radius) {
            hit = true;
            this.damagePlayer(p.damage, Math.atan2(p.vy, p.vx), p.element || 'physical', p.from || null,
              { defense: p.defense || DEFENSE.PARRYABLE, kind: p.kind || 'medium', guardPressure: p.guardPressure, noInterrupt: true });
          }
        } else if (!p.cosmetic) for (const m of this.monsters) {
          if (m.hp <= 0) continue;
          const d = Math.hypot(m.x - p.x, m.y - p.y);
          if (d <= m.radius + p.radius) {
            hit = true;
            // Mermi çarptı: ok/hançer sesi (yakın dövüşte kılıç sesi çalar).
            if (this.sound) this.sound.play(p.type === 'arrow' ? 'hit_ranged' : p.type === 'magic_orb' ? 'hit_magic' : 'hit_physical');
            this.applyDamageToMonster(m, p.damage, p.isCrit, Math.atan2(p.vy, p.vx), 0, (p.skill && p.skill.element) || p.element || null);
            if (p.skill && p.skill.status) this.applyMonsterStatus(m, p.skill.status);
            break;
          }
        }
        if (hit || p.life <= 0) this.projectiles.splice(i, 1);
      }

      // 7. Kılıç dalgaları
      for (let i = this.slashes.length - 1; i >= 0; i--) {
        this.slashes[i].timer -= dt;
        if (this.slashes[i].timer <= 0) this.slashes.splice(i, 1);
      }

      // 8. AoE (+ sürekli kıvılcım)
      for (let i = this.aoeEffects.length - 1; i >= 0; i--) {
        const aoe = this.aoeEffects[i];
        aoe.timer -= dt;
        // Sürekli hasar veren zemin alanı (ground) ve girdap (vortex).
        if ((aoe.zone || aoe.vortex) && aoe.skill && aoe.timer > 0) {
          aoe.tickTimer = (aoe.tickTimer || 0) + dt;
          if (aoe.vortex && aoe.pull) {
            // Girdap: yarıçap içindeki canavarları merkeze çeker.
            for (const m of this.monsters) {
              if (!m || m.hp <= 0) continue;
              const dx = aoe.x - m.x, dy = aoe.y - m.y;
              const d = Math.hypot(dx, dy);
              if (d > 0.001 && d <= aoe.radius * 1.15) {
                const step = Math.min((aoe.pull || 90) * dt, Math.max(0, d - 6) * 0.5);
                m.x += (dx / d) * step;
                m.y += (dy / d) * step;
              }
            }
          }
          if (aoe.tickTimer >= (aoe.tick || 0.5)) {
            aoe.tickTimer = 0;
            const dmg = Math.max(1, Math.round(this.skillDamage(aoe.skill) * 0.4));
            this.hitEnemiesInRadius(aoe.x, aoe.y, aoe.radius, dmg, false, 0, aoe.skill.element || null);
            if (aoe.skill.status) this.applyAreaStatus(aoe.x, aoe.y, aoe.radius, aoe.skill);
          }
        }
        if (aoe.pillar && aoe.timer > 0 && Math.random() < 0.7) {
          const a = Math.random() * TAU, r = Math.random() * aoe.radius * 0.8;
          this.addParticle({
            wx: aoe.x + Math.cos(a) * r, wy: aoe.y + Math.sin(a) * r, wz: 4,
            vx: 0, vy: 0, vz: 120 + Math.random() * 120, color: aoe.color, size: 2 + Math.random() * 2, life: 0.6, grav: 0
          });
        }
        if (aoe.timer <= 0) this.aoeEffects.splice(i, 1);
      }

      // 8b. Yörünge ultisi (orbit): dönen silahlar çevreye sürekli hasar verir.
      if (this.orbitAura) {
        const o = this.orbitAura;
        o.timer -= dt;
        o.angle += o.speed * dt;
        o.tickTimer += dt;
        if (o.tickTimer >= o.tick) {
          o.tickTimer = 0;
          this.hitEnemiesInRadius(this.player.x, this.player.y, o.radius, Math.max(1, Math.round(o.damage * 0.34)), true, Number(o.sk && o.sk.knockback) || 0);
          if (o.sk && o.sk.status) this.applyAreaStatus(this.player.x, this.player.y, o.radius, o.sk);
        }
        if (o.timer <= 0) this.orbitAura = null;
      }

      // 8c. Zincir şimşeği efektleri.
      for (let i = this.chainFx.length - 1; i >= 0; i--) {
        this.chainFx[i].timer -= dt;
        if (this.chainFx[i].timer <= 0) this.chainFx.splice(i, 1);
      }

      // vuruş patlamaları
      for (let i = this.impacts.length - 1; i >= 0; i--) {
        this.impacts[i].timer -= dt;
        if (this.impacts[i].timer <= 0) this.impacts.splice(i, 1);
      }

      // menzil göstergeleri (kısa ömürlü, zeminde)
      for (let i = this.rangePings.length - 1; i >= 0; i--) {
        this.rangePings[i].timer -= dt;
        if (this.rangePings[i].timer <= 0) this.rangePings.splice(i, 1);
      }

      // 9. Hasar sayıları (ekranda dikey yükselir)
      for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
        const dn = this.damageNumbers[i];
        dn.age += dt;
        dn.z += dn.vz * dt;
        dn.vz = Math.max(8, dn.vz - 110 * dt);
        dn.ox += dn.vox * dt;
        dn.life -= dt;
        dn.alpha = clamp(dn.life / (dn.maxLife * 0.45), 0, 1);
        if (dn.life <= 0) this.damageNumbers.splice(i, 1);
      }

      // 10. Parçacıklar
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const part = this.particles[i];
        part.wx += part.vx * dt;
        part.wy += part.vy * dt;
        part.wz += part.vz * dt;
        part.vz -= part.grav * dt;
        if (part.drag) { part.vx *= 1 - part.drag * dt; part.vy *= 1 - part.drag * dt; }
        part.size += part.grow * dt;
        part.life -= dt;
        part.alpha = clamp(part.life / part.maxLife, 0, 1);
        if (part.wz < 0) { part.wz = 0; part.vz = -part.vz * 0.4; }
        if (part.life <= 0) this.particles.splice(i, 1);
      }

      // 11. Ambiyans
      this.ambientMotes.forEach((m) => {
        if (m.snow) {
          m.z -= 26 * dt;
          m.x += Math.sin(this.time * 1.1 + m.phase) * 22 * dt;
          m.y += 10 * dt;
          if (m.z < 0) { m.z = 90 + Math.random() * 60; m.x = (Math.random() - 0.5) * 900; m.y = (Math.random() - 0.5) * 900; }
        } else if (m.ember) {
          m.z += 22 * dt;
          m.x += Math.sin(this.time * 2 + m.phase) * 14 * dt;
          if (m.z > 130) { m.z = 0; m.x = (Math.random() - 0.5) * 900; m.y = (Math.random() - 0.5) * 900; }
        } else if (m.bubble) {
          m.z += 12 * dt;
          m.x += Math.sin(this.time * 1.4 + m.phase) * 10 * dt;
          if (m.z > 90) { m.z = 0; m.x = (Math.random() - 0.5) * 900; m.y = (Math.random() - 0.5) * 900; }
        } else if (m.leaf) {
          m.z -= 14 * dt;
          m.x += (m.vx + Math.sin(this.time * 1.5 + m.phase) * 12) * dt;
          m.y += m.vy * dt;
          if (m.z < 0) { m.z = 130 + Math.random() * 40; m.x = (Math.random() - 0.5) * 900; m.y = (Math.random() - 0.5) * 900; }
        } else {
          m.vx += (Math.random() - 0.5) * 40 * dt;
          m.vy += (Math.random() - 0.5) * 40 * dt;
          m.vx = clamp(m.vx, -18, 18); m.vy = clamp(m.vy, -18, 18);
          m.x += m.vx * dt; m.y += m.vy * dt;
          m.z = clamp(m.z + Math.sin(this.time * 1.3 + m.phase) * 8 * dt, 8, 80);
          if (Math.abs(m.x) > 520) m.vx = -m.vx;
          if (Math.abs(m.y) > 520) m.vy = -m.vy;
        }
      });

      // Etkileşim hedefi (prompt / E tuşu için her karede tazelenir)
      this.checkInteractionNearPlayer();
      this.updateReviveTarget();

      // 12. Kamera (kare hızından bağımsız yumuşak takip)
      const targetScreen = worldToScreen(P.x, P.y, 0, { x: 0, y: 0 });
      this.camera.targetX = this.width / 2 - targetScreen.x;
      this.camera.targetY = this.height / 2 - targetScreen.y;
      // Sarsıntıyı her karede kamera konumuna eklemek birikmeye ve yürürken
      // "yer titriyor" hissine yol açıyordu. Önce önceki karede uygulanan
      // offsetleri çıkar, yumuşak takibi uygula, sonra yenilerini ekle.
      this.camera.x -= (this._camShakeX || 0);
      this.camera.y -= (this._camShakeY || 0);
      this.camera.y -= (this._walkBobOffset || 0);
      const camLerp = 1 - Math.exp(-7.6 * dt);
      this.camera.x += (this.camera.targetX - this.camera.x) * camLerp;
      this.camera.y += (this.camera.targetY - this.camera.y) * camLerp;
      this._camShakeX = this.shake.x;
      this._camShakeY = this.shake.y;
      this.camera.x += this._camShakeX;
      this.camera.y += this._camShakeY;
      // Yürüyüş kamera nefesi: çok hafif, sarsıntıdan ayrı offset.
      const spdNow = Math.hypot(P.vx || 0, P.vy || 0);
      if (spdNow > 8) {
        this._walkBob = (this._walkBob || 0) + dt * (4.2 + spdNow * 0.006);
        this._walkBobOffset = Math.sin(this._walkBob) * Math.min(1.0, spdNow * 0.0032);
      } else {
        this._walkBobOffset = (this._walkBobOffset || 0) * Math.max(0, 1 - dt * 8);
      }
      this.camera.y += this._walkBobOffset;
    }

    // Boyuta göre önbelleğe alınan arka plan gradyanı (kare başına yeniden
    // üretmek yerine tekrar kullanılır).
    bgGradient(ctx) {
      const key = this.width + 'x' + this.height;
      if (this._bgGradKey === key && this._bgGrad) return this._bgGrad;
      this._bgGradKey = key;
      const cx = this.width / 2, cy = this.height / 2;
      const g = ctx.createRadialGradient(cx, cy, 60, cx, cy, Math.max(this.width, this.height) * 0.8);
      g.addColorStop(0, '#22333d');
      g.addColorStop(0.6, '#101a20');
      g.addColorStop(1, '#070b0e');
      this._bgGrad = g;
      return g;
    }

    // ======================================================================
    // RENDER
    // ======================================================================
    render() {
      const ctx = this.ctx;
      if (!ctx) return;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      // Sprite'lar (GLB → tuval) büyütülürken bulanıklasmasın: yüksek kaliteli
      // yumuşatma açık kalsın (tarayıcı varsayılanı "low" olabilir).
      try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; } catch (_) {}
      // Önceki kare yarıda kaldıysa tuval durumu kirlenmiş olabilir; sıfırla.
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
      if (!Number.isFinite(this.width) || !Number.isFinite(this.height) || this.width <= 0 || this.height <= 0) this.resize();
      ctx.clearRect(0, 0, this.width, this.height);

      // Kamera/veri bozulursa kareyi görünür tut.
      if (!Number.isFinite(this.camera.x) || !Number.isFinite(this.camera.y) || !Number.isFinite(this.zoom)) this.snapCamera();
      if (!Array.isArray(this.tiles) || this.tiles.length === 0) { try { this.generateMap(); } catch (e) { this.tiles = this.tiles || []; } }

      // Arka plan: derin gece + yıldızlar (gradyan önbelleğe alınır)
      ctx.fillStyle = this.bgGradient(ctx);
      ctx.fillRect(0, 0, this.width, this.height);
      // Yıldızlar: düşük efekt modunda yarısı çizilir (görsel olarak fark edilmez).
      const stars = this.stars || [];
      const starStep = this.lowFx ? 2 : 1;
      for (let i = 0; i < stars.length; i += starStep) {
        const s = stars[i];
        ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(this.time * 1.2 + s.tw));
        ctx.fillStyle = '#cfe8ff';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      // Harita hiç yoksa (veri gelmediyse) siyah ekran yerine görünür zemin çiz.
      if (!this.tiles.length) {
        ctx.fillStyle = '#2f3d2a';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx < this.width; gx += 64) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, this.height); ctx.stroke(); }
        for (let gy = 0; gy < this.height; gy += 64) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(this.width, gy); ctx.stroke(); }
      }

      // Zoom: dünya katmanı ekran merkezi etrafında ölçeklenir; arka plan ve
      // vinyet sabit kalır. Biyom tonu/sisi ekran uzayında çizilir (aşağıda),
      // aksi halde zoom-out'ta tuval dikdörtgeni "kare sis" olarak görünür.
      const z = this.zoom || 1;
      const zoomed = Math.abs(z - 1) > 0.001;
      const applyZoom = () => {
        if (!zoomed) return;
        const cx = this.width / 2, cy = this.height / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(z, z);
        ctx.translate(-cx, -cy);
      };
      applyZoom();
      this.render3DTiles(ctx);
      if (zoomed) ctx.restore();

      // Biyom rengi + sis: tam ekran, zoom'dan bağımsız.
      this.renderBiomeOverlay(ctx);

      applyZoom();
      this.renderLighting(ctx);
      try { this.renderShadows(ctx); } catch (e) {
        if (!this._shadowWarned) { this._shadowWarned = true; console.warn('[shadow] çizim hatası:', e && e.message); }
      }
      this.renderRangePings(ctx);
      this.renderMonsterTelegraphs(ctx);
      this.renderAoEEffects(ctx);
      this.renderOrbitAura(ctx);
      this.renderChannelFx(ctx);
      this.renderSortedEntities(ctx);
      this.renderPlayerDefenseFx(ctx);
      this.renderProjectilesAndSlashes(ctx);
      this.renderChainFx(ctx);
      this.renderParticles(ctx);
      this.renderDamageNumbers(ctx);
      this.renderCombatIndicators(ctx);
      if (zoomed) ctx.restore();
      this.renderAtmosphericVignette(ctx);
      this.renderWeather(ctx);
      this.renderWorldOverlay(ctx);
      this.renderStoneCompass(ctx);
      this.renderMinimaps();
    }

    // ======================================================================
    // MİNİ HARİTA
    // ======================================================================
    invalidateMinimap() { this._miniBase = null; this._miniBaseKey = ''; }

    minimapWorldRadius() {
      const R = Math.max(6, Number(this.mapRadius) || 14);
      return R * (this.tileSize || 64);
    }

    // Dünyanın basitleştirilmiş kuş bakışı görüntüsü (tek sefer üretilir).
    buildMinimapBase() {
      if (this.persistent && this.worldCore) {
        const key = 'setra|' + this.worldConfig.seed + '|' + this.mapRadius;
        if (this._miniBase && this._miniBaseKey === key) return this._miniBase;
        const SIZE = 96, R = Math.max(6, Number(this.mapRadius) || 14);
        const W = (R + 0.5) * this.tileSize;
        const off = document.createElement('canvas'); off.width = off.height = SIZE;
        const g = off.getContext('2d'), pal = this.worldCore.palettes;
        g.fillStyle = pal.deep.minimap; g.fillRect(0, 0, SIZE, SIZE);
        for (let py = 0; py < SIZE; py++) for (let px = 0; px < SIZE; px++) {
          const wx = ((px + 0.5) / SIZE * 2 - 1) * W, wy = ((py + 0.5) / SIZE * 2 - 1) * W;
          const sv = this.worldToServer(wx, wy);
          if (sv.x < 0 || sv.y < 0 || sv.x > this.worldConfig.width || sv.y > this.worldConfig.height) continue;
          const s = this.worldCore.sample(sv.x, sv.y);
          const c = pal[s.surface] || pal[s.biome] || pal.meadow;
          g.fillStyle = c.minimap; g.fillRect(px, py, 1, 1);
          if (!s.water && s.height > 105) { g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(px, py, 1, 1); }
        }
        // Yol ve nehir ağını doğrudan çiz: 256 px'lik kıta görünümünde
        // örnekleme ile kaybolmasınlar (eski haritanın okunabilir yolları).
        const cfg = this.worldConfig;
        const toBase = (x, y) => ({ x: ((x + W) / (2 * W)) * SIZE, y: ((y + W) / (2 * W)) * SIZE });
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (const rv of (cfg.rivers || [])) {
          const pts = rv.points || [];
          if (pts.length < 2) continue;
          g.strokeStyle = 'rgba(48,108,140,0.95)';
          g.lineWidth = Math.max(1, (rv.width * this.worldScale) / (2 * W) * SIZE * 2);
          g.beginPath();
          pts.forEach((p, i) => { const q = toBase((p[0] - cfg.spawn.x) * this.worldScale, (p[1] - cfg.spawn.y) * this.worldScale); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); });
          g.stroke();
        }
        for (const rd of (cfg.roads || [])) {
          const pts = rd.points || [];
          if (pts.length < 2) continue;
          g.strokeStyle = 'rgba(190,164,112,0.95)';
          g.lineWidth = Math.max(1, (rd.width * this.worldScale) / (2 * W) * SIZE * 2);
          g.beginPath();
          pts.forEach((p, i) => { const q = toBase((p[0] - cfg.spawn.x) * this.worldScale, (p[1] - cfg.spawn.y) * this.worldScale); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); });
          g.stroke();
        }
        this._miniBase = off; this._miniBaseKey = key;
        return off;
      }
      const R = Math.max(6, Number(this.mapRadius) || 14);
      const ts = this.tileSize || 64;
      const W = (R + 0.5) * ts;
      const SIZE = 512;
      const key = this.biome + '|' + R + '|' + ts;
      if (this._miniBase && this._miniBaseKey === key) return this._miniBase;
      const pal = MINIMAP_PALETTES[this.biome] || MINIMAP_PALETTES.verdant;
      const off = document.createElement('canvas');
      off.width = SIZE; off.height = SIZE;
      const g = off.getContext('2d');
      g.fillStyle = pal.water;
      g.fillRect(0, 0, SIZE, SIZE);
      const k = SIZE / (2 * W);
      const cell = Math.max(1, ts * k);
      const tiles = this.tiles || [];
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        g.fillStyle = t.type === 'path' ? pal.path : pal.ground;
        g.fillRect((t.wx + W) * k - cell / 2, (t.wy + W) * k - cell / 2, cell + 1, cell + 1);
        // Yükseklik (tepe/plato): minimap'te hafif açık ton + eşik çizgisi.
        if (t.wz > 0) {
          g.fillStyle = `rgba(255,255,255,${Math.min(0.3, 0.05 + t.wz / 110)})`;
          g.fillRect((t.wx + W) * k - cell / 2, (t.wy + W) * k - cell / 2, cell + 1, cell + 1);
          if (t.wz >= 18) {
            g.strokeStyle = 'rgba(255,255,255,0.18)';
            g.lineWidth = 1;
            g.strokeRect((t.wx + W) * k - cell / 2, (t.wy + W) * k - cell / 2, cell + 1, cell + 1);
          }
        }
      }
      // Ağaç/kaya/dağ kümeleri: haritanın "dokusu" böylece tanınır olur.
      const scenery = this.scenery || [];
      for (let i = 0; i < scenery.length; i++) {
        const s = scenery[i];
        if (s.type !== 'tree' && s.type !== 'mountain' && s.type !== 'boulder' && s.type !== 'mushroom') continue;
        const px = (s.wx + W) * k, py = (s.wy + W) * k;
        if (px < 0 || px > SIZE || py < 0 || py > SIZE) continue;
        const sz = Math.max(1.2, (s.scale || 1) * ts * k * 0.42);
        g.fillStyle = s.type === 'tree' ? pal.tree : (s.type === 'boulder' ? pal.rock2 : (s.type === 'mushroom' ? pal.accent : pal.rock));
        g.beginPath(); g.arc(px, py, sz, 0, TAU); g.fill();
      }
      // Kıyı halkası (adadan okyanusa yumuşak geçiş)
      g.strokeStyle = 'rgba(255,255,255,0.16)';
      g.lineWidth = Math.max(1.5, SIZE * 0.006);
      g.beginPath(); g.arc(SIZE / 2, SIZE / 2, R * ts * k, 0, TAU); g.stroke();
      this._miniBase = off;
      this._miniBaseKey = key;
      return off;
    }

    attachMinimap(canvas, opts) {
      if (!canvas || !canvas.getContext) return null;
      if (!this.minimaps) this.minimaps = [];
      const o = opts || {};
      let e = this.minimaps.find((x) => x.canvas === canvas);
      if (!e) {
        e = { canvas, ctx: canvas.getContext('2d'), zoom: 1, panX: 0, panY: 0, big: false, labels: false, onClick: null };
        this.minimaps.push(e);
        this._bindMinimapInput(e);
      }
      e.big = !!o.big;
      e.labels = !!o.labels;
      e.onClick = typeof o.onClick === 'function' ? o.onClick : null;
      return e;
    }

    detachMinimap(canvas) {
      if (!this.minimaps) return;
      this.minimaps = this.minimaps.filter((e) => e.canvas !== canvas);
    }

    minimapClampPan(e) {
      const R = Math.max(6, Number(this.mapRadius) || 14) * (this.tileSize || 64);
      const z = Math.max(1, e.zoom || 1);
      const maxPan = R * Math.max(0, 1 - 1 / z);
      e.panX = clamp(e.panX, -maxPan, maxPan);
      e.panY = clamp(e.panY, -maxPan, maxPan);
    }

    minimapCenterOn(e, wx, wy) {
      e.panX = Number.isFinite(wx) ? wx : 0;
      e.panY = Number.isFinite(wy) ? wy : 0;
      this.minimapClampPan(e);
    }

    _bindMinimapInput(e) {
      const cv = e.canvas;
      let drag = null;
      const geo = () => {
        const w = cv.clientWidth || 0, h = cv.clientHeight || 0;
        const R = Math.max(6, Number(this.mapRadius) || 14) * (this.tileSize || 64);
        return { w, h, cx: w / 2, cy: h / 2, rad: Math.min(w, h) / 2 - 2, R };
      };
      const onWheel = (ev) => {
        ev.preventDefault();
        const g = geo();
        if (!g.w) return;
        const rect = cv.getBoundingClientRect();
        const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
        const before = this.minimapScreenToWorld(e, mx, my, g);
        const k = ev.deltaY > 0 ? 0.86 : 1.16;
        e.zoom = clamp((e.zoom || 1) * k, 1, 6);
        const after = this.minimapScreenToWorld(e, mx, my, g);
        e.panX += before.x - after.x;
        e.panY += before.y - after.y;
        this.minimapClampPan(e);
      };
      const onDown = (ev) => {
        const rect = cv.getBoundingClientRect();
        drag = { x: ev.clientX - rect.left, y: ev.clientY - rect.top, sx: ev.clientX, sy: ev.clientY, moved: 0 };
        try { cv.setPointerCapture(ev.pointerId); } catch (err) {}
      };
      const onMove = (ev) => {
        if (!drag) return;
        const rect = cv.getBoundingClientRect();
        const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
        drag.moved = Math.max(drag.moved, Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy));
        const g = geo();
        if (!g.w || (e.zoom || 1) <= 1.001) return;
        const s = (g.rad / g.R) * (e.zoom || 1);
        e.panX -= (x - drag.x) / s;
        e.panY -= (y - drag.y) / s;
        drag.x = x; drag.y = y;
        this.minimapClampPan(e);
      };
      const onUp = () => {
        if (drag && drag.moved < 5 && typeof e.onClick === 'function') e.onClick(e);
        drag = null;
      };
      cv.addEventListener('wheel', onWheel, { passive: false });
      cv.addEventListener('pointerdown', onDown);
      cv.addEventListener('pointermove', onMove);
      cv.addEventListener('pointerup', onUp);
      cv.addEventListener('pointercancel', () => { drag = null; });
      cv.addEventListener('pointerleave', () => { drag = null; });
    }

    minimapScreenToWorld(e, mx, my, g) {
      const R = Math.max(6, Number(this.mapRadius) || 14) * (this.tileSize || 64);
      const s = (g.rad / R) * (e.zoom || 1);
      return { x: (mx - g.cx) / s + (e.panX || 0), y: (my - g.cy) / s + (e.panY || 0) };
    }

    renderMinimaps() {
      if (!this.minimaps || !this.minimaps.length) return;
      for (const e of this.minimaps) {
        const cv = e.canvas;
        if (!cv || !cv.isConnected) continue;
        const cssW = cv.clientWidth, cssH = cv.clientHeight;
        if (cssW < 12 || cssH < 12) continue; // kapalı panel
        try { this.drawMinimap(e, cssW, cssH); } catch (err) { /* minimap oyunu durdurmasın */ }
      }
    }

    drawMinimap(e, cssW, cssH) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const pw = Math.max(1, Math.round(cssW * dpr)), ph = Math.max(1, Math.round(cssH * dpr));
      if (e.canvas.width !== pw || e.canvas.height !== ph) { e.canvas.width = pw; e.canvas.height = ph; }
      const g = e.ctx;
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, cssW, cssH);

      const R = Math.max(6, Number(this.mapRadius) || 14) * (this.tileSize || 64);
      const W = R + (this.tileSize || 64) * 0.5;
      const pal = MINIMAP_PALETTES[this.biome] || MINIMAP_PALETTES.verdant;
      const cx = cssW / 2, cy = cssH / 2;
      const rad = Math.min(cssW, cssH) / 2 - 2;
      const zoom = Math.max(1, e.zoom || 1);
      const s = (rad / R) * zoom;
      const toPx = (wx, wy) => ({ x: cx + (wx - (e.panX || 0)) * s, y: cy + (wy - (e.panY || 0)) * s });

      // Dış çerçeve + zemin (okyanus)
      g.save();
      g.beginPath(); g.arc(cx, cy, rad + 1.5, 0, TAU);
      g.fillStyle = 'rgba(8,14,18,0.92)'; g.fill();
      g.beginPath(); g.arc(cx, cy, rad, 0, TAU); g.clip();
      g.fillStyle = pal.water; g.fillRect(0, 0, cssW, cssH);

      const base = this.buildMinimapBase();
      if (base) {
        const p0 = toPx(-W, -W);
        const size = 2 * W * s;
        g.imageSmoothingEnabled = true;
        g.drawImage(base, p0.x, p0.y, size, size);
      }

      // POI'ler (dungeon/den/chest/inn/ruin/watch)
      const POI_COL = { dungeon: '#b388ff', den: '#ffab40', chest: '#ffd54f', inn: '#69f0ae', ruin: '#b0bec5', watch: '#80d8ff' };
      const pois = this.poiMarkers || [];
      for (let i = 0; i < pois.length; i++) {
        const p = pois[i];
        if (p.consumed) continue;
        const q = toPx(p.wx, p.wy);
        if (q.x < -8 || q.y < -8 || q.x > cssW + 8 || q.y > cssH + 8) continue;
        const col = POI_COL[p.kind] || '#ffffff';
        const rr2 = e.big ? 4 : 2.6;
        g.fillStyle = 'rgba(0,0,0,0.65)';
        g.beginPath(); g.arc(q.x, q.y, rr2 + 1.2, 0, TAU); g.fill();
        g.fillStyle = col;
        g.beginPath(); g.arc(q.x, q.y, rr2, 0, TAU); g.fill();
        if (e.labels && p.name) {
          g.font = '600 9px Inter, system-ui, sans-serif';
          g.textAlign = 'center';
          g.fillStyle = 'rgba(0,0,0,0.75)';
          g.fillText(p.name, q.x + 0.8, q.y - rr2 - 4 + 0.8);
          g.fillStyle = col;
          g.fillText(p.name, q.x, q.y - rr2 - 4);
        }
      }

      // Canavarlar: küçük kırmızı noktalar (kalabalığı şişirmemek için seyreltilir)
      const mobs = this.monsters || [];
      const step = e.big ? 1 : (mobs.length > 40 ? 2 : 1);
      g.fillStyle = 'rgba(255,84,84,0.85)';
      for (let i = 0; i < mobs.length; i += step) {
        const m = mobs[i];
        if (!m || m.hp <= 0) continue;
        const q = toPx(m.x, m.y);
        if (q.x < 0 || q.y < 0 || q.x > cssW || q.y > cssH) continue;
        g.beginPath(); g.arc(q.x, q.y, e.big ? 2.2 : 1.6, 0, TAU); g.fill();
      }

      // Diğer oyuncular
      const others = this.others || {};
      for (const id of Object.keys(others)) {
        const o = others[id];
        if (!o) continue;
        const q = toPx(o.wx, o.wy);
        if (q.x < -6 || q.y < -6 || q.x > cssW + 6 || q.y > cssH + 6) continue;
        g.fillStyle = o.downed ? '#ff8a80' : (o.color || '#8ec5ff');
        g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 1.2;
        g.beginPath(); g.arc(q.x, q.y, e.big ? 3.4 : 2.6, 0, TAU); g.fill(); g.stroke();
        if (e.labels && o.name) {
          g.font = '600 9px Inter, system-ui, sans-serif'; g.textAlign = 'center';
          g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillText(o.name, q.x + 0.8, q.y - 6.8);
          g.fillStyle = '#eaf6ff'; g.fillText(o.name, q.x, q.y - 7.6);
        }
      }

      // Yerel oyuncu: yön oku
      const me = this.player;
      if (me) {
        const q = toPx(me.x, me.y);
        const a = me.facingAngle || 0;
        g.save();
        g.translate(q.x, q.y);
        g.rotate(a);
        g.beginPath();
        const sz = e.big ? 8 : 6;
        g.moveTo(sz, 0); g.lineTo(-sz * 0.7, sz * 0.62); g.lineTo(-sz * 0.35, 0); g.lineTo(-sz * 0.7, -sz * 0.62);
        g.closePath();
        g.fillStyle = '#ffe082';
        g.strokeStyle = '#241a06'; g.lineWidth = 1.2;
        g.fill(); g.stroke();
        g.restore();
      }

      // Seyahat taşı: mavi nokta. Görünüm dışındaysa kenara yaslanıp yön gösterir.
      this.drawMinimapStoneMarker(g, e, { cx, cy, rad, toPx, cssW, cssH });

      // Kamera görüş alanı (izo eşkenar dörtgen)
      try {
        const z = this.zoom || 1;
        const ccx = this.width / 2, ccy = this.height / 2;
        const inv = (sx, sy) => {
          const ax = ccx + (sx - ccx) / z, ay = ccy + (sy - ccy) / z;
          return screenToWorld(ax, ay, this.camera);
        };
        const corners = [inv(0, 0), inv(this.width, 0), inv(this.width, this.height), inv(0, this.height)];
        g.beginPath();
        corners.forEach((w, i) => { const q = toPx(w.x, w.y); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); });
        g.closePath();
        g.strokeStyle = 'rgba(255,255,255,0.42)';
        g.lineWidth = 1.2;
        g.stroke();
      } catch (err) {}

      g.restore();

      // Halka çerçeve
      g.beginPath(); g.arc(cx, cy, rad + 1.2, 0, TAU);
      g.strokeStyle = 'rgba(214,178,106,0.55)'; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.arc(cx, cy, rad - 1, 0, TAU);
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.stroke();
    }

    drawMinimapStoneMarker(g, e, geo) {
      const { cx, cy, rad, toPx, cssW, cssH } = geo;
      const stoneX = 0, stoneY = -14;
      const q = toPx(stoneX, stoneY);
      const dx = q.x - cx, dy = q.y - cy;
      const dist = Math.hypot(dx, dy);
      const pulse = 0.55 + 0.45 * Math.sin(this.time * 4);
      const outside = dist > rad - 6;
      const ang = Math.atan2(dy, dx);
      const x = outside ? cx + Math.cos(ang) * (rad - 7) : q.x;
      const y = outside ? cy + Math.sin(ang) * (rad - 7) : q.y;
      const rr = e.big ? 5 : 3.4;
      g.save();
      // parlama
      const gr = g.createRadialGradient(x, y, 0, x, y, rr * 4.2);
      gr.addColorStop(0, 'rgba(79,195,247,' + (0.55 * pulse).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(79,195,247,0)');
      g.fillStyle = gr;
      g.beginPath(); g.arc(x, y, rr * 4.2, 0, TAU); g.fill();
      // nokta
      g.fillStyle = '#4fc3f7';
      g.strokeStyle = '#e8fbff';
      g.lineWidth = 1.4;
      g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.stroke();
      // dışa dönük ok (yalnızca taş görünüm dışındaysa)
      if (outside) {
        g.translate(x, y);
        g.rotate(ang);
        g.beginPath();
        g.moveTo(rr + 7, 0); g.lineTo(rr + 1, 4.2); g.lineTo(rr + 1, -4.2);
        g.closePath();
        g.fillStyle = '#4fc3f7';
        g.fill();
      }
      g.restore();
    }

    // Taş ekran dışındaysa kenarda mavi pusula noktası (yön + mesafe).
    renderStoneCompass(ctx) {
      if (!this.player) return;
      const p = this.iso(0, -14, 0);
      const pad = 54;
      if (p.x > pad && p.x < this.width - pad && p.y > pad && p.y < this.height - pad) return;
      const ccx = this.width / 2, ccy = this.height / 2;
      const dx = p.x - ccx, dy = p.y - ccy;
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
      const ang = Math.atan2(dy, dx);
      const hw = Math.max(30, ccx - pad), hh = Math.max(30, ccy - pad);
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const tx = Math.abs(ca) > 1e-4 ? hw / Math.abs(ca) : Infinity;
      const ty = Math.abs(sa) > 1e-4 ? hh / Math.abs(sa) : Infinity;
      const t = Math.min(tx, ty);
      const x = ccx + ca * t, y = ccy + sa * t;
      const pulse = 0.55 + 0.45 * Math.sin(this.time * 4);
      ctx.save();
      ctx.translate(x, y);
      // hale
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      gr.addColorStop(0, 'rgba(79,195,247,' + (0.34 * pulse).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(79,195,247,0)');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill();
      // ok
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(3, 7.5); ctx.lineTo(3, -7.5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(79,195,247,0.95)';
      ctx.strokeStyle = 'rgba(232,251,255,0.9)';
      ctx.lineWidth = 1.4;
      ctx.fill(); ctx.stroke();
      ctx.restore();
      // nokta
      ctx.beginPath(); ctx.arc(0, 0, 5 + pulse * 1.2, 0, TAU);
      ctx.fillStyle = '#4fc3f7'; ctx.fill();
      ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 1.6; ctx.stroke();
      // mesafe (karo cinsinden)
      const distTiles = Math.round(Math.hypot(this.player.x, this.player.y + 14) / (this.tileSize || 64));
      ctx.font = '700 10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText('Seyahat Taşı · ' + distTiles, 0.8, 23.8);
      ctx.fillStyle = '#bfeaff';
      ctx.fillText('Seyahat Taşı · ' + distTiles, 0, 23);
      ctx.restore();
    }

    // ---------------- KAROLAR ----------------
    getTileSprite(type, variant, elev) {
      const key = (this.biome || '') + '|' + type + '|' + variant + '|' + elev;
      const cached = this.tileSprites[key];
      if (cached) return cached;

      const dpr = this.dpr;
      const hw = this.tileSize * COS_30, hh = this.tileSize * SIN_30;
      const th = this.tileThickness + elev;
      const pad = 3;
      const w = Math.ceil(hw * 2 + pad * 2), h = Math.ceil(hh * 2 + th + pad * 2);
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(w * dpr);
      cv.height = Math.ceil(h * dpr);
      const g = cv.getContext('2d');
      g.scale(dpr, dpr);
      const ox = w / 2, oy = pad + hh; // üst yüzey merkezi
      const rand = mulberry32(Math.floor((variant + 1) * 9301 + type.length * 49297 + elev * 131));
      const pal = TILE_PALETTE[type];

      // --- Sol yan yüz ---
      let grad = g.createLinearGradient(0, oy, 0, oy + hh + th);
      grad.addColorStop(0, pal.leftTop); grad.addColorStop(1, pal.leftBot);
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(ox - hw, oy); g.lineTo(ox, oy + hh); g.lineTo(ox, oy + hh + th); g.lineTo(ox - hw, oy + th);
      g.closePath(); g.fill();

      // --- Sağ yan yüz ---
      grad = g.createLinearGradient(0, oy, 0, oy + hh + th);
      grad.addColorStop(0, pal.rightTop); grad.addColorStop(1, pal.rightBot);
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(ox, oy + hh); g.lineTo(ox + hw, oy); g.lineTo(ox + hw, oy + th); g.lineTo(ox, oy + hh + th);
      g.closePath(); g.fill();

      // Toprak / taş katman çizgileri
      for (let k = 9; k < th - 3; k += 8 + Math.floor(rand() * 4)) {
        const j = rand() * 3;
        g.strokeStyle = 'rgba(0,0,0,0.24)'; g.lineWidth = 1;
        g.beginPath();
        g.moveTo(ox - hw, oy + k + j); g.lineTo(ox, oy + hh + k + j);
        g.moveTo(ox, oy + hh + k + j); g.lineTo(ox + hw, oy + k + j);
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.045)';
        g.beginPath();
        g.moveTo(ox - hw, oy + k + j + 1); g.lineTo(ox, oy + hh + k + j + 1);
        g.moveTo(ox, oy + hh + k + j + 1); g.lineTo(ox + hw, oy + k + j + 1);
        g.stroke();
      }
      // Yan yüzlerde taş/kök lekeleri
      g.fillStyle = 'rgba(0,0,0,0.16)';
      for (let i = 0; i < 5; i++) {
        const side = rand() > 0.5 ? 1 : -1;
        const u = rand() * 0.8 + 0.1;
        const px = ox + side * hw * u;
        const py = oy + hh * (1 - u) * (side === 1 ? 1 : 1) + (side === 1 ? hh * u - hh * u : 0) + rand() * (th - 8) + 4;
        g.beginPath(); g.ellipse(px, py + (side === 1 ? hh * (1 - u) : hh * u) * 0 , 2 + rand() * 3, 1.4 + rand() * 1.6, 0, 0, TAU); g.fill();
      }

      // Çim saçağı: üst kenardan sarkan yeşil kenar
      if (pal.lip) {
        for (let side = 0; side < 2; side++) {
          const x0 = side === 0 ? ox - hw : ox, y0 = side === 0 ? oy : oy + hh;
          const x1 = side === 0 ? ox : ox + hw, y1 = side === 0 ? oy + hh : oy;
          g.fillStyle = side === 0 ? pal.lipDark : pal.lip;
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x1, y1);
          const n = 9;
          for (let i = n; i >= 0; i--) {
            const t = i / n;
            g.lineTo(lerp(x0, x1, t), lerp(y0, y1, t) + 4 + (i % 2 ? 4 : 0) + rand() * 3);
          }
          g.closePath(); g.fill();
        }
      }

      // --- Üst yüzey ---
      grad = g.createLinearGradient(ox - hw * 0.7, oy - hh, ox + hw * 0.7, oy + hh);
      grad.addColorStop(0, pal.top0); grad.addColorStop(1, pal.top1);
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(ox, oy - hh); g.lineTo(ox + hw, oy); g.lineTo(ox, oy + hh); g.lineTo(ox - hw, oy);
      g.closePath(); g.fill();

      g.save();
      g.clip();
      const pt = () => {
        let u, v;
        do { u = rand() * 2 - 1; v = rand() * 2 - 1; } while (Math.abs(u) + Math.abs(v) > 0.86);
        return [ox + u * hw, oy + v * hh];
      };

      // Lekeli doku
      for (let i = 0; i < 6; i++) {
        const [x, y] = pt();
        g.fillStyle = rand() > 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.06)';
        g.beginPath(); g.ellipse(x, y, 8 + rand() * 10, 4 + rand() * 5, 0, 0, TAU); g.fill();
      }

      const tuft = (x, y, s, col) => {
        g.strokeStyle = col; g.lineWidth = 1.3; g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x, y); g.quadraticCurveTo(x - 2 * s, y - 4 * s, x - 4 * s, y - 6.5 * s);
        g.moveTo(x, y); g.lineTo(x + 0.5 * s, y - 7.5 * s);
        g.moveTo(x, y); g.quadraticCurveTo(x + 2 * s, y - 4 * s, x + 4.5 * s, y - 6 * s);
        g.stroke();
      };

      if (type === 'grass') {
        const cols = ['#78c25a', '#66ad4b', '#8fd36a'];
        const n = 8 + variant;
        for (let i = 0; i < n; i++) { const [x, y] = pt(); tuft(x, y, 0.7 + rand() * 0.7, cols[i % 3]); }
        // çiçekler
        const flowerCols = ['#fff59d', '#ffffff', '#f48fb1', '#90caf9'];
        const fc = flowerCols[variant % 4];
        const nf = variant === 0 ? 0 : 1 + (variant % 2);
        for (let i = 0; i < nf; i++) {
          const [x, y] = pt();
          g.fillStyle = '#3f7a35'; g.fillRect(x - 0.5, y - 1, 1, 3);
          g.fillStyle = fc;
          for (let a = 0; a < 5; a++) { g.beginPath(); g.arc(x + Math.cos(a * 1.2566) * 1.8, y - 3 + Math.sin(a * 1.2566) * 1.4, 1.2, 0, TAU); g.fill(); }
          g.fillStyle = '#ff8f00'; g.beginPath(); g.arc(x, y - 3, 0.9, 0, TAU); g.fill();
        }
      } else if (type === 'path') {
        for (let i = 0; i < 16; i++) { // toz / kum benekleri
          const [x, y] = pt();
          g.fillStyle = rand() > 0.5 ? 'rgba(60,40,20,0.28)' : 'rgba(210,180,140,0.20)';
          g.fillRect(x, y, 1.4, 1.4);
        }
        for (let i = 0; i < 5; i++) { // çakıl taşları
          const [x, y] = pt();
          const r = 1.2 + rand() * 2.2;
          g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x + 0.8, y + 1, r + 0.4, r * 0.6, 0, 0, TAU); g.fill();
          g.fillStyle = rand() > 0.5 ? '#b39b80' : '#8e7660'; g.beginPath(); g.ellipse(x, y, r, r * 0.65, 0, 0, TAU); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(x - r * 0.25, y - r * 0.2, r * 0.4, r * 0.22, 0, 0, TAU); g.fill();
        }
        // kenarlardan taşan minik çim
        for (let i = 0; i < 3; i++) {
          const a = rand() * TAU;
          tuft(ox + Math.cos(a) * hw * 0.8, oy + Math.sin(a) * hh * 0.8, 0.8, '#6aa84f');
        }
        // çatlak
        g.strokeStyle = 'rgba(40,25,10,0.35)'; g.lineWidth = 1;
        const [cx, cy] = pt();
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 5, cy + 2); g.lineTo(cx + 9, cy - 1); g.stroke();
      } else if (type === 'water' || type === 'deep') {
        // Su: yumuşak dalga çizgileri + parlama (kaya faseti değil).
        g.strokeStyle = type === 'deep' ? 'rgba(120,180,210,0.16)' : 'rgba(180,225,240,0.30)';
        g.lineWidth = 1.1;
        for (let i = 0; i < 5; i++) {
          const [x, y] = pt();
          g.beginPath();
          g.moveTo(x - 6, y);
          g.quadraticCurveTo(x - 2, y - 2.2, x + 2, y);
          g.quadraticCurveTo(x + 5, y + 1.8, x + 8, y);
          g.stroke();
        }
        g.fillStyle = 'rgba(255,255,255,0.07)';
        for (let i = 0; i < 4; i++) { const [x, y] = pt(); g.fillRect(x, y, 2, 1); }
      } else {
        // Kaya: açık faset + çatlaklar + yosun
        g.fillStyle = 'rgba(255,255,255,0.07)';
        g.beginPath(); g.moveTo(ox - hw * 0.6, oy); g.lineTo(ox - 4, oy - hh * 0.6); g.lineTo(ox + hw * 0.2, oy - 2); g.lineTo(ox - 8, oy + hh * 0.3); g.closePath(); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.10)';
        g.beginPath(); g.moveTo(ox + hw * 0.1, oy + 4); g.lineTo(ox + hw * 0.6, oy); g.lineTo(ox + 6, oy + hh * 0.7); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(20,24,28,0.55)'; g.lineWidth = 1.2;
        for (let i = 0; i < 2; i++) {
          const [x, y] = pt();
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + rand() * 6, y + 2); g.lineTo(x + 10 + rand() * 8, y - 2 + rand() * 4); g.stroke();
        }
        for (let i = 0; i < 2; i++) {
          const [x, y] = pt();
          g.fillStyle = 'rgba(100,150,60,0.45)'; g.beginPath(); g.ellipse(x, y, 5 + rand() * 4, 2.5, 0, 0, TAU); g.fill();
        }
        for (let i = 0; i < 6; i++) { const [x, y] = pt(); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x, y, 1.5, 1.5); }
      }
      g.restore();

      // Bevel: aydınlık üst kenarlar, karanlık alt kenarlar
      g.lineWidth = 1; g.lineJoin = 'round';
      g.strokeStyle = 'rgba(255,255,255,0.16)';
      g.beginPath(); g.moveTo(ox - hw, oy); g.lineTo(ox, oy - hh); g.lineTo(ox + hw, oy); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.30)';
      g.beginPath(); g.moveTo(ox - hw, oy); g.lineTo(ox, oy + hh); g.lineTo(ox + hw, oy); g.stroke();

      // Biyom karo tinti: haritanın kendi renk değerlerini doğrudan değiştirir
      // (kar biyomunda çim buz/kar rengine döner; ekstra beyaz leke yok).
      // 'color' karışımı aydınlık/gölge derinliğini korur; desteklenmiyorsa
      // düz 'source-atop' boyamaya düşer.
      const tint = this.biomePalette && this.biomePalette.tileTint;
      if (tint && tint.color) {
        const amt = Math.max(0, Math.min(1, Number(tint.amount) || 0));
        g.save();
        // 1) Renk kayması: hue değişir, gölge/aydınlık korunur.
        g.globalCompositeOperation = 'color';
        const keepDepth = g.globalCompositeOperation === 'color';
        if (!keepDepth) g.globalCompositeOperation = 'source-atop';
        g.globalAlpha = keepDepth ? amt : Math.min(1, amt + 0.1);
        g.fillStyle = tint.color;
        g.fillRect(0, 0, w, h);
        // 2) Aydınlatma: kar/buz parlaklığı (screen beyazı gölgeleri korur).
        if (keepDepth) {
          g.globalCompositeOperation = 'screen';
          g.globalAlpha = Math.min(0.6, amt * 0.45);
          g.fillStyle = '#ffffff';
          g.fillRect(0, 0, w, h);
        }
        g.restore();
      }

      const sprite = { canvas: cv, ox, oy, w, h };
      this.tileSprites[key] = sprite;
      return sprite;
    }

    render3DTiles(ctx) {
      const hw = this.tileSize * COS_30, hh = this.tileSize * SIN_30, th = this.tileThickness;
      const camX = this.camera.x, camY = this.camera.y;
      const W = this.width, H = this.height;
      const z = this.zoom || 1;
      const cx = W / 2, cy = H / 2;
      // Zoom uygulandığı için görünür alan zoom öncesi ekran uzayında büyür/küçülür.
      const minX = cx - cx / z - 140, maxX = cx + cx / z + 140;
      const minY = cy - cy / z - 170, maxY = cy + cy / z + 170;
      const rows = this._tileRows;
      const CELL = this._tileRowCell || 256, OFF = this._tileRowOff || 512;
      const drawTile = (t) => {
        const sx = t.sx + camX, sy = t.sy + camY;
        if (sx < minX || sx > maxX || sy < minY || sy > maxY) return;
        const sp = this.getTileSprite(t.type, t.variant, t.wz);
        if (!sp || !sp.canvas || !sp.canvas.width) return;
        ctx.drawImage(sp.canvas, sx - sp.ox, sy - sp.oy, sp.w, sp.h);
        if (this.persistent && (t.type === 'water' || t.type === 'deep' || t.type === 'path')) {
          ctx.save();
          ctx.beginPath(); ctx.moveTo(sx, sy - hh); ctx.lineTo(sx + hw, sy);
          ctx.lineTo(sx, sy + hh); ctx.lineTo(sx - hw, sy); ctx.closePath(); ctx.clip();
          if (t.type === 'path') {
            ctx.strokeStyle = 'rgba(64,42,24,0.22)'; ctx.lineWidth = 1;
            for (const off of [-5, 5]) { ctx.beginPath(); ctx.moveTo(sx - hw * 0.55, sy + off); ctx.lineTo(sx + hw * 0.55, sy + off); ctx.stroke(); }
          } else {
          const drift = (this.time * 8 + t.variant * 13) % 18;
          ctx.strokeStyle = t.type === 'deep' ? 'rgba(130,190,215,0.12)' : 'rgba(205,240,245,0.30)';
          ctx.lineWidth = 1.1;
          for (let k = -1; k <= 1; k++) {
            const yy = sy + k * 10 + drift * 0.25;
            ctx.beginPath(); ctx.moveTo(sx - hw * 0.48 + drift, yy);
            ctx.quadraticCurveTo(sx - 5 + drift, yy - 3, sx + 7 + drift, yy);
            ctx.quadraticCurveTo(sx + 16 + drift, yy + 2, sx + 25 + drift, yy); ctx.stroke();
          }
          }
          ctx.restore();
        }
        if (t.edgeStyle) {
          const full = th + t.wz;
          ctx.fillStyle = t.edgeStyle;
          ctx.beginPath();
          ctx.moveTo(sx, sy - hh); ctx.lineTo(sx + hw, sy); ctx.lineTo(sx + hw, sy + full);
          ctx.lineTo(sx, sy + hh + full); ctx.lineTo(sx - hw, sy + full); ctx.lineTo(sx - hw, sy);
          ctx.closePath(); ctx.fill();
        }
      };
      if (!rows) {
        for (let i = 0; i < this.tiles.length; i++) drawTile(this.tiles[i]);
        return;
      }
      const ky0 = Math.floor((minY - camY) / CELL) + OFF;
      const ky1 = Math.floor((maxY - camY) / CELL) + OFF;
      for (let ky = ky0; ky <= ky1; ky++) {
        const arr = rows.get(ky);
        if (!arr) continue;
        for (let i = 0; i < arr.length; i++) drawTile(arr[i]);
      }
    }

    // ---------------- IŞIKLAR & SİS ----------------
    renderLighting(ctx) {
      const t = this.time;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Oyuncu feneri (zemine yayılan sıcak ışık)
      const pp = this.iso(this.player.x, this.player.y, this.player.z);
      drawGlowEllipse(ctx, pp.x, pp.y, 230, 130, '#ffb067', 0.13);

      // Seyahat taşının mavi ışığı + fenerler
      const camX = this.camera.x, camY = this.camera.y;
      const lit = this._lightScenery || this.scenery;
      for (let i = 0; i < lit.length; i++) {
        const s = lit[i];
        const x = s._bx + camX, y = s._by + camY;
        if (x < -160 || x > this.width + 160 || y < -160 || y > this.height + 160) continue;
        if (s.type === 'shrine') {
          drawGlowEllipse(ctx, x, y, 150, 85, '#00e5ff', 0.14 + 0.06 * Math.sin(t * 2.4));
        } else if (s.type === 'lantern') {
          drawGlowEllipse(ctx, x, y, 90, 50, '#ffcc66', 0.16 + 0.03 * Math.sin(t * 5 + s.wx));
        } else if (s.type === 'mushroom') {
          drawGlowEllipse(ctx, x, y, 34, 18, '#7cf0ff', 0.22);
        }
      }
      ctx.restore();

      // Zemin sisi: yavaş süzülen yumuşak bulutlar (düşük efekt modunda seyreltilir)
      ctx.save();
      const clouds = this.lowFx ? 4 : 9;
      for (let i = 0; i < clouds; i++) {
        const a = i * 0.7 + t * 0.05 * (i % 2 ? 1 : -1);
        const r = 180 + (i % 3) * 140;
        const mp = this.iso(Math.cos(a) * r, Math.sin(a * 1.3) * r, 4);
        drawGlowEllipse(ctx, mp.x, mp.y, 200, 70, '#9ab8c8', 0.05);
      }
      ctx.restore();
    }

    // ---------------- GÖLGELER & YER İŞARETLERİ ----------------
    renderShadows(ctx) {
      ctx.save();
      const soft = (wx, wy, wz, rx, ry, a = 0.55, ox = 0, oy = 0) => {
        const p = this.iso(wx, wy, wz);
        drawGlowEllipse(ctx, p.x + ox, p.y + oy, rx, ry, '#000000', a);
      };

      const shadows = this._shadowScenery || this.scenery;
      const camX = this.camera.x, camY = this.camera.y;
      // Gölge, nesnenin KENDİ zemin yüksekliğine düşmeli. Önceden z=0 idi;
      // tepelerde ağaçlar gölgesinden kopup "havada" görünüyordu.
      const tn = this.worldTuning();
      const treeK = Math.sqrt(tn.treeScale / 3) * 1.7;
      const d3 = (typeof window !== 'undefined' && window.Setra3DTrees) || null;
      for (let i = 0; i < shadows.length; i++) {
        const s = shadows[i];
        const x = s._bx + camX, y = s._by + camY;
        if (x < -420 || x > this.width + 420 || y < -420 || y > this.height + 420) continue;
        const z = s.z || 0;
        if (s.type === 'tree') {
          // 3D sprite ise gölge, çizilen sprite'ın gerçek taban genişliğinden
          // hesaplanır (yoksa sabit 34px gölge dev ağacın altında kalıyordu).
          const fp = d3 && d3.footprint ? d3.footprint(s, this) : null;
          if (fp) soft(s.wx, s.wy, z, fp.rx, fp.ry, 0.55, fp.rx * 0.1, fp.ry * 0.2);
          else soft(s.wx, s.wy, z, 34 * s.scale * treeK, 16 * s.scale * treeK, 0.6, 7, 3);
        } else if (s.type === 'boulder') soft(s.wx, s.wy, z, 24 * s.scale, 11 * s.scale, 0.55, 4, 2);
        else if (s.type === 'mountain') soft(s.wx, s.wy, z, 46 * s.scale, 15 * s.scale, 0.5, 9, 4);
        else if (s.type === 'shrine') soft(s.wx, s.wy, z, 40, 19, 0.6);
        else if (s.type === 'mushroom') soft(s.wx, s.wy, z, 12 * s.scale, 6 * s.scale, 0.5);
        else if (s.type === 'lantern') soft(s.wx, s.wy, z, 12, 6, 0.5);
        else if (s.type === 'glb') {
          const fp = d3 && d3.footprint ? d3.footprint(s, this) : null;
          if (fp) soft(s.wx, s.wy, z, fp.rx, fp.ry, 0.45, fp.rx * 0.1, fp.ry * 0.2);
          else soft(s.wx, s.wy, z, 22 * (s.scale || 1), 10 * (s.scale || 1), 0.42, 3, 2);
        }
      }

      this.monsters.forEach((m) => {
        if (m.hp > 0 || m.deathTimer > 0) {
          const f = m.hp > 0 ? 1 : clamp(m.deathTimer / 0.45, 0, 1);
          const floaty = m.kind === 'wraith' ? 0.8 : 1;
          soft(m.x, m.y, m.z, m.radius * 1.9 * floaty, m.radius * 0.95 * floaty, 0.6 * f);
        }
      });
      if (this.companion.active) soft(this.companion.x, this.companion.y, 0, 20, 9, 0.5);
      soft(this.player.x, this.player.y, this.player.z, 25, 12, 0.65);

      // Oyuncu zemin halkası (iz düşümü doğru elips) + nişan ok ucu
      const P = this.player;
      const c = this.iso(P.x, P.y, P.z);
      const col = this.getArchetypeColor();
      ctx.globalCompositeOperation = 'lighter';
      drawGlowEllipse(ctx, c.x, c.y, 34, 18, '#00e676', 0.22);
      ctx.strokeStyle = 'rgba(0,230,118,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 17 * ISO_RX, 17 * ISO_RY, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,230,118,0.25)';
      ctx.lineWidth = 5;
      ctx.stroke();

      const dirx = Math.cos(P.facingAngle), diry = Math.sin(P.facingAngle);
      const tip = this.iso(P.x + dirx * 40, P.y + diry * 40, P.z);
      const w1 = this.iso(P.x + dirx * 30 - diry * 7, P.y + diry * 30 + dirx * 7, P.z);
      const w2 = this.iso(P.x + dirx * 30 + diry * 7, P.y + diry * 30 - dirx * 7, P.z);
      ctx.strokeStyle = rgba(col, 0.9);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(w1.x, w1.y); ctx.lineTo(tip.x, tip.y); ctx.lineTo(w2.x, w2.y); ctx.stroke();

      // Fare altındaki zemin işareti
      const mp = this.iso(this.mouse.worldX, this.mouse.worldY, 0);
      let hover = false;
      for (const m of this.monsters) {
        if (m.hp > 0 && Math.hypot(m.x - this.mouse.worldX, m.y - this.mouse.worldY) < m.radius + 10) { hover = true; break; }
      }
      // Zemin hitbox işareti: çok silik (gözü yormasın, sadece hafif ipucu).
      ctx.strokeStyle = hover ? 'rgba(255,82,82,0.30)' : 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = -this.time * 14;
      ctx.beginPath();
      ctx.ellipse(mp.x, mp.y, 14 * ISO_RX, 14 * ISO_RY, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      // Kalkan baloncuğu (Paladin Aegis / şifa kalkanları): 5 sn sürer.
      if (this.playerShield > 0 && this.playerShieldTimer > 0) {
        const pct = clamp(this.playerShield / (this.playerShieldMax || 1), 0, 1);
        const pulse = 0.72 + Math.sin(this.time * 7) * 0.06;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlowEllipse(ctx, c.x, c.y - 22, 30, 34, '#80deea', 0.18 + pct * 0.12);
        ctx.strokeStyle = `rgba(128,222,234,${0.35 + pct * 0.4})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y - 24, 26 * pulse, 38 * pulse, 0, 0, TAU);
        ctx.stroke();
        // Dönen kalkan dilimleri
        for (let i = 0; i < 6; i++) {
          const a = this.time * 1.6 + (i / 6) * TAU;
          ctx.strokeStyle = `rgba(179,245,255,${0.35 + pct * 0.35})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(c.x, c.y - 24, 30, a, a + 0.35);
          ctx.stroke();
        }
        // Kalan süre halkası
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(c.x, c.y - 24, 34, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(this.playerShieldTimer / 5, 0, 1));
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    // ---------------- Menzil göstergeleri (yerel, zeminde) ----------------
    renderRangePings(ctx) {
      if (!this.rangePings.length) return;
      this.rangePings.forEach((rp) => {
        const c = this.iso(rp.x, rp.y, 0);
        const prog = clamp(rp.timer / rp.duration, 0, 1); // 1 -> 0
        const appear = clamp((1 - prog) * 6, 0, 1);       // hızlı büyüme
        const rx = rp.radius * ISO_RX * (0.6 + 0.4 * appear);
        const ry = rp.radius * ISO_RY * (0.6 + 0.4 * appear);
        const col = rp.color;
        ctx.save();
        // Yumuşak iç dolgu (alanı belli eder ama gözü yormaz)
        ctx.globalAlpha = (rp.thin ? 0.07 : 0.20) * prog;
        ctx.fillStyle = col;
        const isCone = rp.arc && rp.arc < TAU - 0.01;
        if (isCone) {
          // Koni/arc göstergesi: dünya açılarını izometrik konuma çevir.
          const a0 = (rp.angle || 0) - rp.arc / 2;
          const a1 = (rp.angle || 0) + rp.arc / 2;
          const steps = 18;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          for (let i = 0; i <= steps; i++) {
            const a = a0 + (a1 - a0) * (i / steps);
            const p = this.iso(rp.x + Math.cos(a) * rp.radius * (0.6 + 0.4 * appear), rp.y + Math.sin(a) * rp.radius * (0.6 + 0.4 * appear), 0);
            ctx.lineTo(p.x, p.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 0.85 * prog;
          ctx.lineWidth = 2;
          ctx.strokeStyle = rgba(col, 0.95);
          ctx.stroke();
        } else {
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); ctx.fill();
          // Kenar halkası
          ctx.globalAlpha = (rp.thin ? 0.5 : 0.85) * prog;
          ctx.lineWidth = rp.thin ? 1.3 : 2;
          ctx.strokeStyle = rgba(col, 0.95);
          if (rp.thin) ctx.setLineDash([8, 8]);
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); ctx.stroke();
          if (rp.thin) { ctx.setLineDash([]); ctx.restore(); return; }
          // Dönen kesikli iç halka (şık, "minik" detay)
          ctx.setLineDash([5, 6]);
          ctx.lineDashOffset = -this.time * 30 + rp.seed;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = rgba('#ffffff', 0.6 * prog);
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx * 0.82, ry * 0.82, 0, 0, TAU); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      });
    }

    // ---------------- CANAVAR YETENEKLERİ ----------------
    // Kırmızı telegraph: dash şeridi / slam dairesi / ok çizgisi. Oyuncu
    // kırmızı alandan çıkarsa hasar almaz (dodge edilebilir).
    renderMonsterTelegraphs(ctx) {
      if (!this.monsters || !this.monsters.length) return;
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const m of this.monsters) {
        if (m.hp <= 0 || m.dead) continue;
        // Temel saldırı telegraph'ı (melee/ranged)
        if (m.meleeWindup) { this.renderMeleeTelegraph(ctx, m); continue; }
        if (!m.cast) continue;
        const sk = m.cast.skill || {};
        const total = Math.max(0.15, m.cast.total || 0.7);
        const prog = clamp(1 - m.cast.timer / total, 0, 1);
        const alpha = 0.16 + prog * 0.30;
        const col = '#ff3b30';
        if (sk.kind === 'dash') {
          const a = Math.atan2(m.cast.ty - m.y, m.cast.tx - m.x);
          const len = Math.min(Number(sk.dist) || 150, Math.hypot(m.cast.tx - m.x, m.cast.ty - m.y) + 40);
          const w = Number(sk.radius) || 34;
          const p0 = this.iso(m.x, m.y, 1);
          const p1 = this.iso(m.x + Math.cos(a) * len, m.y + Math.sin(a) * len, 1);
          const d = m.radius;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = col;
          ctx.lineWidth = Math.max(10, w * 1.15);
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = '#ff8a80';
          ctx.lineWidth = 2;
          ctx.setLineDash([7, 7]);
          ctx.lineDashOffset = -this.time * 70;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#ff3b30';
          ctx.globalAlpha = 0.5 + 0.4 * Math.sin(this.time * 12);
          ctx.beginPath(); ctx.ellipse(p1.x, p1.y, d * 0.9 * ISO_RX, d * 0.9 * ISO_RY, 0, 0, TAU); ctx.fill();
        } else if (sk.kind === 'slam') {
          const c = this.iso(m.x, m.y, 0);
          const rad = Number(sk.radius) || 90;
          const rx = rad * ISO_RX, ry = rad * ISO_RY;
          ctx.globalAlpha = alpha * 0.75;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); ctx.fill();
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = '#ff8a80';
          ctx.lineWidth = 2.4;
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = -this.time * 50;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); ctx.stroke();
          ctx.setLineDash([]);
          // dolan iç halka: süre azaldıkça daralır
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx * (1 - prog * 0.85), ry * (1 - prog * 0.85), 0, 0, TAU); ctx.stroke();
        } else {
          const c = this.iso(m.x, m.y, 0);
          const t = this.iso(m.cast.tx, m.cast.ty, 0);
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.6;
          ctx.setLineDash([5, 9]);
          ctx.lineDashOffset = -this.time * 40;
          ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(t.x, t.y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 0.3 + prog * 0.4;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.ellipse(t.x, t.y, 18, 9, 0, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Canavarın üstünde uyarı halkası
        const top = this.iso(m.x, m.y, m.radius * 2 + 18);
        drawGlow(ctx, top.x, top.y, 14, '#ff1744', 0.5 + 0.3 * Math.sin(this.time * 10));
      }
      ctx.restore();
    }

    // Telegraph süresi bitti: temel saldırı burada gerçekten isabet eder.
    resolveMonsterMelee(m, mw) {
      const P = this.player;
      if (!P || this.downed || !mw) return;
      const dx = P.x - m.x, dy = P.y - m.y;
      const dist = Math.hypot(dx, dy);
      const element = m.element || 'physical';
      const opts = { defense: mw.defense, kind: mw.kind, guardPressure: mw.guardPressure };
      if (mw.ranged) {
        // Menzilli: kırmızı uyarıdan SONRA mermi çıkar.
        const spd = 360;
        this.projectiles.push({
          type: 'monster_orb', hostile: true,
          x: m.x + Math.cos(mw.angle) * (m.radius + 8),
          y: m.y + Math.sin(mw.angle) * (m.radius + 8),
          vx: Math.cos(mw.angle) * spd, vy: Math.sin(mw.angle) * spd,
          radius: 8, life: 2.0, damage: mw.damage, element, from: m,
          color: m.accent || m.color || '#b388ff',
          defense: mw.defense, kind: mw.kind, guardPressure: mw.guardPressure
        });
        if (this.sound) this.sound.play('shoot');
        return;
      }
      // Uyarı süresinde oyuncu menzilden çıktıysa ıska (dodge).
      if (dist > (mw.range || 56) + 8) return;
      const res = this.damagePlayer(mw.damage, mw.angle, element, m, opts);
      const landed = res === 'hit' || res === 'blocked';
      // Elit nova: ana vuruş menzil dışında olsa da alan halkası görünür.
      if (m.ability === 'nova') {
        this.aoeEffects.push({ x: m.x, y: m.y, radius: m.radius * 2.4, duration: 0.4, timer: 0.4, color: m.accent || '#ff8a65', ring: true });
        if (landed && dist <= m.radius * 2.4 + P.radius) {
          this.damagePlayer(Math.round(mw.damage * 0.4), mw.angle, element, m,
            { defense: DEFENSE.DODGE, kind: 'heavy', guardPressure: GUARD_PRESSURE.heavy });
        }
      }
      // Durum efekti yalnızca gerçekten isabet/blok olduysa (parry/dodge'da değil).
      if (landed && m.statusOnHit && this.playerData.stats.currentHp > 0) this.applyPlayerStatusFromMonster(m.statusOnHit);
    }

    // Temel (otomatik) canavar saldırısı telegraph'ı: küçük, kırmızı, sade.
    renderMeleeTelegraph(ctx, m) {
      const mw = m.meleeWindup;
      if (!mw) return;
      const total = Math.max(0.08, Number(mw.total) || 0.3);
      const prog = clamp(1 - mw.timer / total, 0, 1);
      const heavy = mw.kind === 'heavy' || mw.kind === 'skill' || mw.kind === 'ultimate';
      const col = '#ff3b30';
      const p0 = this.iso(m.x, m.y, 1);
      ctx.save();
      ctx.lineCap = 'round';
      if (mw.ranged) {
        // Menzilli: gövdede nabız atan kırmızı nokta + ince nişan çizgisi.
        const t = this.iso(mw.tx, mw.ty, 1);
        ctx.globalAlpha = 0.16 + prog * 0.2;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 9]);
        ctx.lineDashOffset = -this.time * 26;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y - 12); ctx.lineTo(t.x, t.y); ctx.stroke();
        ctx.setLineDash([]);
        drawGlow(ctx, p0.x, p0.y - 16, 7 + prog * 7, col, 0.28 + prog * 0.42);
      } else {
        // Yakın dövüş: canavarın önünde ince kırmızı yelpaze (hitbox ile uyumlu).
        const range = Math.max(34, (Number(mw.range) || 56) + 14);
        const half = heavy ? 0.62 : 0.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        for (let i = 0; i <= 12; i++) {
          const a = mw.angle - half + (i / 12) * half * 2;
          const p = this.iso(m.x + Math.cos(a) * range, m.y + Math.sin(a) * range, 0);
          ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.globalAlpha = (heavy ? 0.16 : 0.10) + prog * (heavy ? 0.26 : 0.18);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.globalAlpha = (heavy ? 0.45 : 0.3) + prog * 0.4;
        ctx.strokeStyle = '#ff8a80';
        ctx.lineWidth = heavy ? 2.2 : 1.3;
        ctx.stroke();
        // Silah / gövde üzerinde kısa kırmızı parlama.
        const hx = p0.x + Math.cos(mw.angle) * 13;
        const hy = p0.y + Math.sin(mw.angle) * 7 - 15;
        drawGlow(ctx, hx, hy, (heavy ? 11 : 7) + prog * 5, col, 0.22 + prog * (heavy ? 0.5 : 0.36));
        if (heavy) {
          ctx.globalAlpha = 0.22 + prog * 0.4;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.8;
          const rr2 = (m.radius || 18) * 1.4;
          ctx.beginPath(); ctx.ellipse(p0.x, p0.y, rr2 * ISO_RX, rr2 * ISO_RY, 0, 0, TAU); ctx.stroke();
        }
        // Alan patlaması olan canavarlar (elite nova): zemin uyarı dairesi.
        if (m.ability === 'nova') {
          const nr = (m.radius || 18) * 2.4;
          ctx.globalAlpha = 0.10 + prog * 0.16;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.ellipse(p0.x, p0.y, nr * ISO_RX, nr * ISO_RY, 0, 0, TAU); ctx.fill();
          ctx.globalAlpha = 0.28 + prog * 0.32;
          ctx.strokeStyle = '#ff8a80';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([6, 7]);
          ctx.lineDashOffset = -this.time * 30;
          ctx.beginPath(); ctx.ellipse(p0.x, p0.y, nr * ISO_RX, nr * ISO_RY, 0, 0, TAU); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    executeMonsterSkill(m, cast) {
      const c = cast || {};
      const sk = c.skill || {};
      const P = this.player;
      const info = c.info || this.classifyMonsterSkill(m, sk);
      const power = Number(sk.power) || 1;
      const dmg = Math.max(3, Math.round((m.damage - (this.playerData.stats.defense || 0) * 0.3) * power));
      const color = m.accent || m.color || '#ff7043';
      const tx = Number.isFinite(c.tx) ? c.tx : m.x;
      const ty = Number.isFinite(c.ty) ? c.ty : m.y;
      const ang = Number.isFinite(c.angle) ? c.angle : Math.atan2(ty - m.y, tx - m.x);
      const dmgOpts = { defense: info.defense, kind: info.kind, guardPressure: info.guardPressure };
      let landed = false;
      if (sk.kind === 'dash') {
        this.sound.play('dash');
        this.aoeEffects.push({ x: m.x, y: m.y, radius: m.radius * 1.5, duration: 0.32, timer: 0.32, color, ring: true });
        const want = Math.min(Number(sk.dist) || 150, Math.hypot(tx - m.x, ty - m.y) + 40);
        const np = this.clampToWorld(m.x + Math.cos(ang) * want, m.y + Math.sin(ang) * want);
        for (let i = 0; i < 7; i++) {
          const f = i / 7;
          this.spawnExplosionParticles(m.x + (np.x - m.x) * f, m.y + (np.y - m.y) * f, 2, color);
        }
        m.x = np.x; m.y = np.y;
        const hitR = (Number(sk.radius) || 36);
        this.aoeEffects.push({ x: m.x, y: m.y, radius: hitR, duration: 0.3, timer: 0.3, color, ring: true });
        landed = Math.hypot(P.x - m.x, P.y - m.y) <= hitR + P.radius;
      } else if (sk.kind === 'slam') {
        this.sound.play('hit');
        this.addTrauma(0.22);
        const radius = Number(sk.radius) || 90;
        this.aoeEffects.push({ x: m.x, y: m.y, radius, duration: 0.45, timer: 0.45, color, ring: true, cracks: true });
        landed = Math.hypot(P.x - m.x, P.y - m.y) <= radius + P.radius;
      } else {
        this.sound.play('shoot');
        const count = sk.kind === 'volley' ? Math.max(1, Number(sk.count) || 3) : 1;
        const spread = Number(sk.spread) || 0.18;
        for (let i = 0; i < count; i++) {
          const a = ang + (i - (count - 1) / 2) * spread;
          this.projectiles.push({
            type: 'monster_orb', hostile: true, x: m.x + Math.cos(a) * (m.radius + 8), y: m.y + Math.sin(a) * (m.radius + 8),
            vx: Math.cos(a) * 380, vy: Math.sin(a) * 380,
            radius: 8, life: 2.2, damage: dmg, element: m.element || 'physical', from: m, color,
            defense: info.defense, kind: info.kind, guardPressure: info.guardPressure
          });
        }
      }
      if (landed) {
        const res = this.damagePlayer(dmg, ang, m.element || 'physical', m, dmgOpts);
        if (sk.status && res !== 'avoided' && this.playerData.stats.currentHp > 0) {
          this.applyPlayerStatusFromMonster(sk.status);
        }
      }
    }

    // ---------------- AoE ----------------
    renderAoEEffects(ctx) {
      this.aoeEffects.forEach((aoe) => {
        if (aoe.seed === undefined) aoe.seed = Math.random();
        const c = this.iso(aoe.x, aoe.y, 0);
        const prog = aoe.timer / aoe.duration; // 1 -> 0
        const t = 1 - prog;                    // 0 -> 1
        const rx = aoe.radius * ISO_RX, ry = aoe.radius * ISO_RY;
        const col = aoe.color;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';

        if (aoe.vortex) {
          // Girdap: dönen spiral kollar + merkeze çekilen kıvılcımlar.
          const spin = this.time * 3.2;
          drawGlowEllipse(ctx, c.x, c.y, rx, ry, col, 0.16 * prog + 0.05);
          ctx.strokeStyle = rgba(col, 0.85 * prog);
          ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); ctx.stroke();
          for (let arm = 0; arm < 3; arm++) {
            ctx.beginPath();
            for (let i = 0; i <= 24; i++) {
              const q = i / 24;
              const a = spin + arm * (TAU / 3) + q * 3.4;
              const rr = aoe.radius * (1 - q * 0.85);
              const p = this.iso(aoe.x + Math.cos(a) * rr, aoe.y + Math.sin(a) * rr, 2);
              if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = rgba(col, 0.6 * prog);
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }
          drawGlow(ctx, c.x, c.y, 34 + 6 * Math.sin(this.time * 8), col, 0.55 * prog);
          for (let i = 0; i < 8; i++) {
            const a = spin * 1.6 + i * (TAU / 8);
            const q = ((this.time * 0.9 + i * 0.13) % 1);
            const rr = aoe.radius * (1 - q);
            const p = this.iso(aoe.x + Math.cos(a) * rr, aoe.y + Math.sin(a) * rr, 4 + q * 20);
            drawGlow(ctx, p.x, p.y, 7, col, 0.7 * (1 - q) * prog);
          }
        } else if (aoe.ring) {
          const k = 0.25 + 0.75 * easeOut(t);
          drawGlowEllipse(ctx, c.x, c.y, rx * k * 1.05, ry * k * 1.05, col, 0.55 * prog);
          ctx.strokeStyle = rgba(col, clamp(prog * 1.1, 0, 1));
          ctx.lineWidth = 2 + 7 * prog;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, rx * k), Math.max(1, ry * k), 0, 0, TAU); ctx.stroke();
          ctx.strokeStyle = rgba('#ffffff', 0.9 * prog);
          ctx.lineWidth = 1.5 + 2 * prog;
          ctx.stroke();
          // ikinci, daha yavaş iz halkası
          const k2 = 0.15 + 0.7 * easeOut(t * 0.85);
          ctx.strokeStyle = rgba(col, 0.5 * prog);
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, rx * k2), Math.max(1, ry * k2), 0, 0, TAU); ctx.stroke();
          // dönen rün çizgileri
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU + t * 3;
            const p1 = this.iso(aoe.x + Math.cos(a) * aoe.radius * k * 0.88, aoe.y + Math.sin(a) * aoe.radius * k * 0.88, 0);
            const p2 = this.iso(aoe.x + Math.cos(a) * aoe.radius * k * 1.02, aoe.y + Math.sin(a) * aoe.radius * k * 1.02, 0);
            ctx.strokeStyle = rgba('#ffffff', 0.7 * prog);
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }

        } else if (aoe.pillar) {
          // Zemin dairesi
          const grow = easeOut(Math.min(1, t * 4));
          drawGlowEllipse(ctx, c.x, c.y, rx * 1.1 * grow, ry * 1.1 * grow, col, 0.65 * prog + 0.2);
          ctx.strokeStyle = rgba(col, 0.9 * prog + 0.1);
          ctx.lineWidth = 3 + 4 * prog;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, rx * grow), Math.max(1, ry * grow), 0, 0, TAU); ctx.stroke();
          ctx.strokeStyle = rgba('#ffffff', 0.7 * prog);
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, rx * grow * 0.72), Math.max(1, ry * grow * 0.72), 0, 0, TAU); ctx.stroke();
          // Dönen rünler
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * TAU - t * 4;
            const p1 = this.iso(aoe.x + Math.cos(a) * aoe.radius * grow * 0.72, aoe.y + Math.sin(a) * aoe.radius * grow * 0.72, 0);
            const p2 = this.iso(aoe.x + Math.cos(a) * aoe.radius * grow, aoe.y + Math.sin(a) * aoe.radius * grow, 0);
            ctx.strokeStyle = rgba(col, 0.8 * prog);
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
          // Işık sütunu
          const rise = easeOut(Math.min(1, t * 5));
          const h = 360 * rise;
          const bw = (54 - 26 * t) * (0.9 + 0.1 * Math.sin(this.time * 40));
          const gr = ctx.createLinearGradient(0, c.y - h, 0, c.y);
          gr.addColorStop(0, rgba(col, 0));
          gr.addColorStop(0.45, rgba(col, 0.55 * prog + 0.1));
          gr.addColorStop(1, rgba('#ffffff', 0.95 * prog));
          ctx.fillStyle = gr;
          ctx.fillRect(c.x - bw / 2, c.y - h, bw, h);
          const gr2 = ctx.createLinearGradient(0, c.y - h, 0, c.y);
          gr2.addColorStop(0, 'rgba(255,255,255,0)');
          gr2.addColorStop(1, rgba('#ffffff', 0.9 * prog));
          ctx.fillStyle = gr2;
          ctx.fillRect(c.x - bw * 0.18, c.y - h, bw * 0.36, h);
          drawGlow(ctx, c.x, c.y - 10, 90 * prog + 30, '#ffffff', 0.5 * prog);

        } else if (aoe.cracks) {
          const rand = mulberry32(Math.floor(aoe.seed * 1e9));
          const reach = easeOut(Math.min(1, t * 3));
          drawGlowEllipse(ctx, c.x, c.y, rx * 0.9, ry * 0.9, '#ff6f00', 0.35 * prog);
          for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? rgba('#ff6f00', 0.35 * prog) : rgba('#ffe082', 0.95 * prog);
            ctx.lineWidth = pass === 0 ? 9 * prog + 2 : 2.2;
            ctx.beginPath();
            const rr2 = mulberry32(Math.floor(aoe.seed * 1e9));
            for (let i = 0; i < 7; i++) {
              const base = (i / 7) * TAU + rr2() * 0.4;
              let a = base, dist = 0, px = aoe.x, py = aoe.y;
              let p0 = this.iso(px, py, 0);
              ctx.moveTo(p0.x, p0.y);
              while (dist < aoe.radius * 0.95 * reach) {
                dist += 12 + rr2() * 10;
                a = base + (rr2() - 0.5) * 0.5;
                px = aoe.x + Math.cos(a) * dist; py = aoe.y + Math.sin(a) * dist;
                p0 = this.iso(px, py, 0);
                ctx.lineTo(p0.x, p0.y);
              }
            }
            ctx.stroke();
          }
          const k = 0.2 + 0.8 * easeOut(t * 1.4);
          ctx.strokeStyle = rgba('#ffcc80', 0.8 * prog);
          ctx.lineWidth = 3 * prog + 1;
          ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, rx * k), Math.max(1, ry * k), 0, 0, TAU); ctx.stroke();
          void rand;

        } else if (aoe.roots) {
          ctx.globalCompositeOperation = 'source-over';
          const rr2 = mulberry32(Math.floor(aoe.seed * 1e9));
          const fade = clamp(prog * 3, 0, 1);
          const grow = easeOut(Math.min(1, t * 5));
          drawGlowEllipse(ctx, c.x, c.y, rx * 1.05, ry * 1.05, '#76ff03', 0.12 * fade);
          ctx.strokeStyle = rgba('#8bc34a', 0.5 * fade);
          ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
          ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); ctx.stroke();
          ctx.setLineDash([]);
          for (let i = 0; i < 9; i++) {
            const a0 = (i / 9) * TAU + rr2() * 0.4;
            const sway = Math.sin(this.time * 3 + i) * 3;
            const pts = [];
            for (let s = 0; s <= 10; s++) {
              const f = (s / 10) * grow;
              const r = aoe.radius * (0.98 - f * 0.9);
              const wob = Math.sin(f * 9 + i + this.time * 2) * 7;
              const a = a0 + wob / Math.max(20, r);
              pts.push(this.iso(aoe.x + Math.cos(a) * r, aoe.y + Math.sin(a) * r, Math.sin(f * Math.PI) * 26 * grow + sway * f));
            }
            ctx.globalAlpha = fade;
            ctx.strokeStyle = '#2e4a1a'; ctx.lineWidth = 5;
            ctx.beginPath(); pts.forEach((p, si) => (si ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
            ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 2.4;
            ctx.stroke();
            ctx.strokeStyle = '#33691e'; ctx.lineWidth = 1.4;
            ctx.beginPath();
            for (let s = 2; s < pts.length; s += 2) { ctx.moveTo(pts[s].x, pts[s].y); ctx.lineTo(pts[s].x + (s % 4 ? -4 : 4), pts[s].y - 5); }
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

        } else {
          drawGlowEllipse(ctx, c.x, c.y, rx, ry, col, 0.6 * prog);
        }
        ctx.restore();
      });
    }

    // ---------------- Zincir şimşeği (chain ultimate) ----------------
    renderChainFx(ctx) {
      if (!this.chainFx.length) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const fx of this.chainFx) {
        const a = clamp(fx.timer / fx.duration, 0, 1);
        const pts = fx.points || [];
        for (let i = 1; i < pts.length; i++) {
          const a0 = this.iso(pts[i - 1].x, pts[i - 1].y, 26);
          const a1 = this.iso(pts[i].x, pts[i].y, 26);
          // Kırık şimşek: iki nokta arasında zikzaklı çizgi.
          const segs = 7;
          const rand = mulberry32(Math.floor((fx.seed + i * 97) * 1000) + Math.floor(this.time * 30));
          ctx.beginPath();
          ctx.moveTo(a0.x, a0.y);
          for (let s = 1; s < segs; s++) {
            const q = s / segs;
            const nx = a0.x + (a1.x - a0.x) * q + (rand() - 0.5) * 16;
            const ny = a0.y + (a1.y - a0.y) * q + (rand() - 0.5) * 16;
            ctx.lineTo(nx, ny);
          }
          ctx.lineTo(a1.x, a1.y);
          ctx.strokeStyle = rgba(fx.color, 0.35 * a);
          ctx.lineWidth = 9 * a + 2;
          ctx.stroke();
          ctx.strokeStyle = rgba('#ffffff', 0.9 * a);
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }
        for (const p of pts) {
          const s = this.iso(p.x, p.y, 26);
          drawGlow(ctx, s.x, s.y, 24, fx.color, 0.5 * a);
        }
      }
      ctx.restore();
    }

    // ---------------- Yörünge ultisi (orbit) ----------------
    renderOrbitAura(ctx) {
      const o = this.orbitAura;
      if (!o) return;
      const P = this.player;
      const fade = clamp(Math.min(o.timer / 0.35, (o.duration - o.timer) / 0.2), 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const center = this.iso(P.x, P.y, 0);
      const rx = o.radius * 0.72 * ISO_RX, ry = o.radius * 0.72 * ISO_RY;
      ctx.strokeStyle = rgba(o.color, 0.22 * fade);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -this.time * 40;
      ctx.beginPath(); ctx.ellipse(center.x, center.y, rx, ry, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < o.count; i++) {
        const ang = o.angle + (i / o.count) * TAU;
        const wx = P.x + Math.cos(ang) * o.radius * 0.72;
        const wy = P.y + Math.sin(ang) * o.radius * 0.72;
        const p = this.iso(wx, wy, 34);
        drawGlow(ctx, p.x, p.y, 22, o.color, 0.55 * fade);
        // Dönen enerji bıçağı
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang + Math.PI / 2 + this.time * 9);
        ctx.fillStyle = rgba(o.color, 0.9 * fade);
        ctx.beginPath();
        ctx.moveTo(0, -16); ctx.lineTo(4.5, 0); ctx.lineTo(0, 16); ctx.lineTo(-4.5, 0);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = rgba('#ffffff', 0.75 * fade);
        ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(1.6, 0); ctx.lineTo(0, 14); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // ---------------- DERİNLİĞE GÖRE SIRALI VARLIKLAR ----------------
    // Dönen silah izleri (Warrior E - Whirlwind)
    renderChannelFx(ctx) {
      const ch = this.player && this.player.channel;
      if (!ch) return;
      const P = this.player;
      const col = ch.skill.color || '#ffd54f';
      const radius = Number(ch.skill.radius) || 105;
      const fade = clamp(Math.min(ch.timer / 0.4, (ch.duration - ch.timer) / 0.2), 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let k = 0; k < 2; k++) {
        const a0 = ch.angle + k * Math.PI;
        ctx.strokeStyle = rgba(col, 0.55 * fade);
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const a = a0 - 1.15 + (2.3 * i) / 16;
          const p = this.iso(P.x + Math.cos(a) * radius * 0.92, P.y + Math.sin(a) * radius * 0.92, 30);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.strokeStyle = rgba('#ffffff', 0.5 * fade);
        ctx.lineWidth = 1.6;
        ctx.stroke();
        // bıçak ucu
        const tip = this.iso(P.x + Math.cos(a0) * radius * 0.92, P.y + Math.sin(a0) * radius * 0.92, 30);
        drawGlow(ctx, tip.x, tip.y, 16, col, 0.65 * fade);
      }
      ctx.restore();
    }

    renderSortedEntities(ctx) {
      // Önceden hazırlanmış sahne listesini kullan; görünmeyenleri erkenden
      // ele ve her karede yeni nesne üretme (GC takılmalarını önler).
      const list = this._renderList || (this._renderList = []);
      list.length = 0;
      const camX = this.camera.x, camY = this.camera.y;
      const W = this.width, H = this.height;
      const margin = 240 / (this.zoom || 1);
      const entries = this._sceneryEntries;
      if (entries) {
        for (let i = 0; i < entries.length; i++) {
          const e = entries[i];
          const s = e.data;
          const x = s._bx + camX, y = s._by + camY;
          if (x < -margin || x > W + margin || y < -margin || y > H + margin) continue;
          list.push(e);
        }
      } else {
        for (const s of this.scenery) list.push({ depth: s.wx + s.wy, type: 'scenery', data: s });
      }
      for (const o of Object.values(this.others || {})) list.push({ depth: o.wx + o.wy, type: 'other', data: o });
      for (const m of this.monsters) {
        if (m.hp > 0 || m.deathTimer > 0) list.push({ depth: m.x + m.y, type: 'monster', data: m });
      }
      if (this.companion.active) list.push({ depth: this.companion.x + this.companion.y, type: 'pet', data: this.companion });
      for (const gt of this.player.ghostTrails) list.push({ depth: gt.x + gt.y - 1, type: 'ghost', data: gt });
      list.push({ depth: this.player.x + this.player.y, type: 'player', data: this.player });
      list.sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item.type === 'scenery') {
          // Tek bir nesne hata verirse kare (oyuncu, canavar, HUD) düşmesin.
          try { this.drawSceneryItem(ctx, item.data); } catch (e) {
            if (!this._sceneryWarned) { this._sceneryWarned = true; console.warn('[scenery] çizim hatası:', e && e.message); }
          }
        }
        else if (item.type === 'monster') this.drawMonster(ctx, item.data);
        else if (item.type === 'other') this.drawOtherPlayer(ctx, item.data);
        else if (item.type === 'player') this.drawPlayer(ctx, item.data);
        else if (item.type === 'pet') this.drawCompanionPet(ctx, item.data);
        else if (item.type === 'ghost') this.drawGhostTrail(ctx, item.data);
      }
      list.length = 0;
    }

    // ---------------- ÇEVRE: AĞAÇ / KAYA / FENER / MANTAR / TAŞ ----------------
    // İlgi noktaları (dungeon kapısı, in, sandık...). Oyunun karanlık-fantezi
    // izometrik tarzına uygun, el çizimi sahne parçaları.
    // GLB yüklenene kadar (veya WebGL kapalıysa) yapıların görünür kalması
    // için basit izometrik gövde+çatı silueti.
    drawStructureFallback(ctx, s, x, y) {
      const sc = s.scale || 1;
      const model = s.model || '';
      const dec = (window.Setra3DTrees && window.Setra3DTrees.decor && window.Setra3DTrees.decor.glb) || {};
      const baseH = (dec.heights && dec.heights[model]) || dec.height || 64;
      const h = baseH * sc, w = h * 0.62;
      const isRock = model === 'bigrock' || model === 'rocks' || model === 'crystals';
      const isTree = model === 'oak' || model === 'pine' || model === 'birch' || model === 'autumn' || model === 'deadtree';
      const wood = /tavern|house|barn|hut|longhouse|smithy|chapel|tower|mill|gatehouse|stall|cart|barrel|crate|hay|fence|well|lamp|sign|bridge|tent|campfire|logs|stump/.test(model);
      const body = isRock ? '#5d656b' : isTree ? '#244a26' : wood ? '#8a6a48' : '#9a8666';
      const roof = isRock ? '#7b848a' : isTree ? '#2f6b33' : '#4a3226';
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath(); ctx.ellipse(0, 0, w * 0.62, w * 0.28, 0, 0, TAU); ctx.fill();
      if (isTree) {
        ctx.fillStyle = '#4a2f18'; ctx.fillRect(-w * 0.09, -h * 0.3, w * 0.18, h * 0.3);
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(w * 0.55, -h * 0.34); ctx.lineTo(-w * 0.55, -h * 0.34); ctx.closePath(); ctx.fill();
      } else if (isRock) {
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.moveTo(-w * 0.55, 0); ctx.lineTo(-w * 0.3, -h * 0.72);
        ctx.lineTo(w * 0.05, -h); ctx.lineTo(w * 0.45, -h * 0.55); ctx.lineTo(w * 0.55, 0); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = body; ctx.fillRect(-w * 0.42, -h * 0.62, w * 0.84, h * 0.62);
        ctx.fillStyle = roof;
        ctx.beginPath(); ctx.moveTo(-w * 0.52, -h * 0.6); ctx.lineTo(0, -h); ctx.lineTo(w * 0.52, -h * 0.6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(20,14,8,0.55)'; ctx.fillRect(-w * 0.1, -h * 0.3, w * 0.2, h * 0.3);
      }
      if (s.interactable && s.label) {
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillText(s.label, 0.7, -h - 6.7);
        ctx.fillStyle = '#ffe9b8'; ctx.fillText(s.label, 0, -h - 7);
      }
      ctx.restore();
    }

    drawPOI(ctx, s, x, y, t) {
      const kind = s.kind || 'ruin';
      const stone = '#6b6459', stoneDark = '#46413a', stoneLight = '#8e8779';
      ctx.save();
      ctx.translate(x, y);
      // POI'ler artık havada süzülmüyor: iki katmanlı yumuşak taban gölgesi
      // nesneyi zemine oturtuyor (bob animasyonu kaldırıldı).
      ctx.fillStyle = 'rgba(0,0,0,0.20)';
      ctx.beginPath(); ctx.ellipse(0, 4, 70, 28, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath(); ctx.ellipse(0, 1, 52, 20, 0, 0, TAU); ctx.fill();

      if (kind === 'dungeon') {
        // 1) Kaya kütlesi: dungeon girişi taşın İÇİNE gömülü görünür.
        const rr = mulberry32(Math.floor(Math.abs(s.wx * 13.7 + s.wy * 7.3)) + 3);
        for (let b = 0; b < 3; b++) {
          const bx = (b - 1) * 27 + (rr() - 0.5) * 12;
          const bw = 36 + rr() * 16;
          const bh = 30 + rr() * 26;
          ctx.fillStyle = shade(stone, b === 1 ? -0.34 : -0.46);
          ctx.beginPath();
          ctx.moveTo(bx - bw, 0);
          ctx.quadraticCurveTo(bx - bw * 0.92, -bh, bx, -bh - 7);
          ctx.quadraticCurveTo(bx + bw * 0.92, -bh, bx + bw, 0);
          ctx.closePath(); ctx.fill();
          // üst yüz ışığı (hacim)
          ctx.fillStyle = shade(stone, 0.18);
          ctx.beginPath();
          ctx.moveTo(bx - bw * 0.6, -bh * 0.74);
          ctx.quadraticCurveTo(bx - bw * 0.12, -bh - 5, bx + bw * 0.24, -bh * 0.82);
          ctx.quadraticCurveTo(bx - bw * 0.08, -bh * 0.56, bx - bw * 0.6, -bh * 0.74);
          ctx.closePath(); ctx.fill();
          // çatlak
          ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(bx - bw * 0.2, -bh * 0.3);
          ctx.lineTo(bx - bw * 0.05, -bh * 0.55);
          ctx.lineTo(bx + bw * 0.16, -bh * 0.66);
          ctx.stroke();
        }
        for (let i = 0; i < 3; i++) {
          const w = 52 - i * 8;
          ctx.fillStyle = i === 2 ? '#7d766a' : '#5c564d';
          ctx.fillRect(-w, -6 - i * 8, w * 2, 9);
          ctx.fillStyle = 'rgba(255,255,255,0.10)';
          ctx.fillRect(-w, -6 - i * 8, w * 2, 2);
        }
        for (const sx of [-34, 34]) {
          ctx.fillStyle = stoneDark; ctx.fillRect(sx - 8, -92, 16, 84);
          ctx.fillStyle = stone; ctx.fillRect(sx - 7, -92, 8, 84);
          ctx.fillStyle = 'rgba(255,170,90,0.8)';
          ctx.fillRect(sx - 2, -74, 4, 4); ctx.fillRect(sx - 2, -58, 4, 4);
          ctx.fillStyle = stoneLight; ctx.fillRect(sx - 12, -100, 24, 10);
        }
        ctx.strokeStyle = stone; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.arc(0, -92, 30, Math.PI, 0); ctx.stroke();
        ctx.strokeStyle = stoneLight; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, -92, 30, Math.PI, 0); ctx.stroke();
        const pulse = 0.55 + 0.25 * Math.sin(t * 3.2);
        const g = ctx.createLinearGradient(0, -112, 0, -18);
        g.addColorStop(0, `rgba(255,140,60,${(0.18 + pulse * 0.2).toFixed(3)})`);
        g.addColorStop(1, `rgba(120,20,10,${(0.55 + pulse * 0.25).toFixed(3)})`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-26, -18); ctx.lineTo(-26, -84); ctx.quadraticCurveTo(0, -112, 26, -84); ctx.lineTo(26, -18); ctx.closePath(); ctx.fill();
        for (const sx of [-44, 44]) {
          const fl = Math.sin(t * 9 + sx) * 2;
          ctx.fillStyle = '#3a2a18'; ctx.fillRect(sx - 2, -58, 4, 30);
          ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.ellipse(sx, -64 + fl, 5, 9, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ffd76a'; ctx.beginPath(); ctx.ellipse(sx, -62 + fl, 2.5, 5, 0, 0, TAU); ctx.fill();
        }
        this._poiLabel(ctx, 'DUNGEON', -124, '#ffb37a');
      } else if (kind === 'den') {
        ctx.fillStyle = '#2b2118';
        ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(-34, -54, 0, -58); ctx.quadraticCurveTo(34, -54, 40, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#4a3a28';
        ctx.beginPath(); ctx.moveTo(-28, 0); ctx.quadraticCurveTo(-24, -38, 0, -42); ctx.quadraticCurveTo(24, -38, 28, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff5a4a';
        ctx.beginPath(); ctx.arc(-10, -22, 2.4, 0, TAU); ctx.arc(10, -22, 2.4, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#d9d2c2'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-30, -2); ctx.lineTo(-14, -8); ctx.moveTo(18, -4); ctx.lineTo(32, 0); ctx.stroke();
        ctx.fillStyle = '#e8e1d2'; ctx.beginPath(); ctx.arc(-8, -4, 6, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2b2118'; ctx.beginPath(); ctx.arc(-10, -5, 1.6, 0, TAU); ctx.arc(-6, -5, 1.6, 0, TAU); ctx.fill();
        this._poiLabel(ctx, 'BEAST DEN', -78, '#ff8a7a');
      } else if (kind === 'chest') {
        // Toprak tümseği + 3D sandık (kapak, ön yüz, yan yüz, demir kuşaklar).
        const gl = 0.30 + 0.16 * Math.sin(t * 4);
        drawGlowEllipse(ctx, 0, -10, 36, 17, '#ffd166', gl);
        ctx.fillStyle = 'rgba(58,42,22,0.55)';
        ctx.beginPath(); ctx.ellipse(0, -1, 27, 11, 0, 0, TAU); ctx.fill();
        // gövde: yan yüz (gölgeli)
        ctx.fillStyle = '#4a2a12';
        ctx.beginPath();
        ctx.moveTo(18, -22); ctx.lineTo(24, -19); ctx.lineTo(24, -3); ctx.lineTo(18, -1); ctx.closePath(); ctx.fill();
        // ön yüz
        const gBody = ctx.createLinearGradient(0, -24, 0, -1);
        gBody.addColorStop(0, '#8a5528'); gBody.addColorStop(1, '#5a3418');
        ctx.fillStyle = gBody;
        ctx.beginPath();
        ctx.moveTo(-18, -23); ctx.lineTo(18, -23); ctx.lineTo(18, -1); ctx.lineTo(-18, -1); ctx.closePath(); ctx.fill();
        // kapak (hafif eğimli üst yüz)
        ctx.fillStyle = '#a5682f';
        ctx.beginPath();
        ctx.moveTo(-18, -23); ctx.lineTo(-13, -31); ctx.lineTo(21, -29); ctx.lineTo(18, -23); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#7a4a1e';
        ctx.beginPath();
        ctx.moveTo(18, -23); ctx.lineTo(21, -29); ctx.lineTo(25, -26); ctx.lineTo(24, -19); ctx.closePath(); ctx.fill();
        // demir kuşaklar
        ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(-13, -30); ctx.lineTo(-18, -22); ctx.moveTo(21, -29); ctx.lineTo(18, -22); ctx.stroke();
        ctx.fillStyle = '#c9962f';
        ctx.fillRect(-18, -18, 36, 3);
        ctx.fillRect(-18, -8, 36, 3);
        // kilit
        ctx.fillStyle = '#ffd76a'; ctx.fillRect(-3.5, -17, 7, 9);
        ctx.fillStyle = '#3a2410'; ctx.beginPath(); ctx.arc(0, -12, 1.9, 0, TAU); ctx.fill();
        this._poiLabel(ctx, 'BURIED CHEST', -46, '#ffe08a');
      } else if (kind === 'inn') {
        ctx.fillStyle = '#3c5a3f';
        ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(0, -46); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2a4030';
        ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(16, 0); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#c9a86a'; ctx.fillRect(-1.5, -58, 3, 12);
        const fl = Math.sin(t * 8) * 2;
        ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.ellipse(0, -8, 6, 10, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffd76a'; ctx.beginPath(); ctx.ellipse(0, -6 + fl * 0.2, 3, 5, 0, 0, TAU); ctx.fill();
        this._poiLabel(ctx, 'WAYFARER CAMP', -64, '#a8e6b0');
      } else if (kind === 'watch') {
        ctx.fillStyle = stoneDark; ctx.fillRect(-14, -70, 28, 70);
        ctx.fillStyle = stone; ctx.fillRect(-12, -70, 12, 70);
        ctx.fillStyle = stoneLight; ctx.fillRect(-18, -78, 36, 10);
        const fl = Math.sin(t * 7) * 2;
        drawGlowEllipse(ctx, 0, -88, 22, 12, '#ffb347', 0.25);
        ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.ellipse(0, -88 + fl, 7, 12, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffd76a'; ctx.beginPath(); ctx.ellipse(0, -86 + fl, 3.5, 6, 0, 0, TAU); ctx.fill();
        this._poiLabel(ctx, 'WATCHTOWER', -106, '#9fd0ff');
      } else {
        for (const [px, h, tilt] of [[-18, 46, -0.08], [14, 34, 0.1], [-2, 22, 0.03]]) {
          ctx.save(); ctx.translate(px, 0); ctx.rotate(tilt);
          ctx.fillStyle = stoneDark; ctx.fillRect(-6, -h, 12, h);
          ctx.fillStyle = stone; ctx.fillRect(-4, -h, 5, h);
          ctx.fillStyle = stoneLight; ctx.fillRect(-8, -h - 4, 16, 5);
          ctx.restore();
        }
        ctx.fillStyle = 'rgba(80,72,62,0.85)';
        ctx.beginPath(); ctx.ellipse(6, -2, 20, 7, 0, 0, TAU); ctx.fill();
        this._poiLabel(ctx, 'ANCIENT RUIN', -68, '#c6b8f0');
      }
      ctx.restore();
    }

    _poiLabel(ctx, text, yy, color) {
      ctx.font = '700 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillText(text, 0, yy + 1);
      ctx.fillStyle = color || '#ffe08a';
      ctx.fillText(text, 0, yy);
    }

    drawSceneryItem(ctx, s) {
      if (!s || !Number.isFinite(s.wx) || !Number.isFinite(s.wy)) return;
      const x = (s._bx !== undefined ? s._bx : (s.wx - s.wy) * COS_30) + this.camera.x;
      const y = (s._by !== undefined ? s._by : (s.wx + s.wy) * SIN_30 - (s.z || 0)) + this.camera.y;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (x < -90 || x > this.width + 90 || y < -130 || y > this.height + 60) return;
      const t = this.time;

      if (s.type === 'poi') { this.drawPOI(ctx, s, x, y, t); return; }
      // Bütün çevre modelleri aynı GLB bake/cache yolunu kullanır; model henüz
      // hazır değilse mevcut vektör painter'a düşülür.
      if (s.type !== 'tree' && window.Setra3DTrees && window.Setra3DTrees.drawScenery(ctx, s, x, y, this)) return;
      if (s.type === 'glb') {
        if (s.fallbackType === 'poi') this.drawPOI(ctx, s, x, y, t);
        else this.drawStructureFallback(ctx, s, x, y);
        return;
      }

      if (s.type === 'tree') {
        // 3D ağaç denemesi (public/js/trees3d.js). Hazır değilse vektör çizim.
        if (window.Setra3DTrees && window.Setra3DTrees.drawScenery(ctx, s, x, y, this)) return;
        const sc = s.scale;
        const sway = Math.sin(t * 1.8 + (s.swayOffset || 0)) * 2.2 * sc;
        const tone = (s.tone - 0.5) * 0.18;
        ctx.save();
        ctx.translate(x, y);

        // Kökler + gövde
        let g = ctx.createLinearGradient(-5 * sc, 0, 5 * sc, 0);
        g.addColorStop(0, '#6a4426'); g.addColorStop(0.5, '#4a2c14'); g.addColorStop(1, '#2a180a');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-7 * sc, 1); ctx.quadraticCurveTo(-5 * sc, -4 * sc, -3.2 * sc, -24 * sc);
        ctx.lineTo(3.2 * sc, -24 * sc); ctx.quadraticCurveTo(5 * sc, -4 * sc, 7 * sc, 1);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-1.5 * sc, -22 * sc); ctx.lineTo(-1.8 * sc, -2 * sc);
        ctx.moveTo(1.6 * sc, -20 * sc); ctx.lineTo(2 * sc, -3 * sc);
        ctx.stroke();

        // Katmanlı çam dalları
        const tiers = [
          { y: -14, w: 36, h: 22, c: '#1a4a16' },
          { y: -26, w: 30, h: 21, c: '#215a1c' },
          { y: -38, w: 24, h: 19, c: '#286a21' },
          { y: -49, w: 17, h: 17, c: '#2f7d29' }
        ];
        tiers.forEach((tier, idx) => {
          const ts = sway * ((idx + 1) / tiers.length);
          const ty = tier.y * sc, tw = (tier.w / 2) * sc, th = tier.h * sc;
          const base = tier.c;
          const n = 6;
          // iç gölge (alt kat ağaca düşen)
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.beginPath();
          ctx.moveTo(-tw * 0.9, ty - 1); ctx.lineTo(0, ty + 5 * sc); ctx.lineTo(tw * 0.9, ty - 1); ctx.lineTo(0, ty - 4 * sc); ctx.closePath(); ctx.fill();

          const skirt = [];
          for (let i = 0; i <= n; i++) {
            const f = i / n;
            skirt.push([lerp(-tw, tw, f) + ts * 0.5 * (1 - Math.abs(f * 2 - 1)), ty + (i % 2 ? -2.5 * sc : 1.5 * sc) - Math.sin(f * Math.PI) * 1.5 * sc]);
          }
          // sol (aydınlık) yarı
          ctx.fillStyle = shade(base, 0.12 + tone);
          ctx.beginPath();
          ctx.moveTo(ts, ty - th);
          for (let i = 0; i <= n / 2; i++) ctx.lineTo(skirt[i][0], skirt[i][1]);
          ctx.lineTo(0, ty - 3 * sc);
          ctx.closePath(); ctx.fill();
          // sağ (gölgeli) yarı
          ctx.fillStyle = shade(base, -0.22 + tone);
          ctx.beginPath();
          ctx.moveTo(ts, ty - th);
          ctx.lineTo(0, ty - 3 * sc);
          for (let i = n / 2; i <= n; i++) ctx.lineTo(skirt[i][0], skirt[i][1]);
          ctx.closePath(); ctx.fill();
          // iğne yaprak çizgileri
          ctx.strokeStyle = shade(base, 0.38); ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ts - 0.5, ty - th + 2);
          ctx.lineTo(-tw * 0.65 + ts * 0.3, ty - 3 * sc);
          ctx.moveTo(ts - 3 * sc, ty - th * 0.55);
          ctx.lineTo(-tw * 0.3, ty - 2 * sc);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          for (let i = 1; i < n; i += 2) { ctx.moveTo(skirt[i][0], skirt[i][1]); ctx.lineTo(skirt[i][0] * 0.55, ty - th * 0.45); }
          ctx.stroke();
        });
        ctx.restore();

      } else if (s.type === 'boulder') {
        const sc = s.scale;
        ctx.save();
        ctx.translate(x, y);
        const face = (pts, col) => {
          ctx.fillStyle = col; ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * sc, p[1] * sc) : ctx.moveTo(p[0] * sc, p[1] * sc)));
          ctx.closePath(); ctx.fill();
        };
        face([[-17, 1], [-13, -14], [-4, -22], [-2, -3]], '#8fa3ad');   // ışıklı sol
        face([[-4, -22], [8, -23], [16, -12], [18, 1], [-2, -3]], '#5d717b'); // üst/sağ
        face([[-2, -3], [18, 1], [8, 4], [-8, 3]], '#3c4a52');           // alt gölge
        face([[-13, -14], [-4, -22], [2, -20], [-6, -13]], '#b0c4ce');   // üst ışık fasesi
        ctx.strokeStyle = '#263238'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3 * sc, -16 * sc); ctx.lineTo(-1 * sc, -9 * sc); ctx.lineTo(5 * sc, -6 * sc);
        ctx.stroke();
        ctx.fillStyle = '#6a9e3a';
        ctx.beginPath(); ctx.ellipse(-9 * sc, -1.5 * sc, 7 * sc, 2.6 * sc, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#8bc34a';
        ctx.beginPath(); ctx.ellipse(-11 * sc, -2.4 * sc, 3.5 * sc, 1.3 * sc, 0, 0, TAU); ctx.fill();
        ctx.restore();

      } else if (s.type === 'bush') {
        // Hacimli, hafif salınan 3D çalı (çarpışmasız süs).
        const sc = s.scale;
        const sway = Math.sin(t * 1.7 + (s.swayOffset || 0)) * 1.1 * sc;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(2 * sc, 1.5 * sc, 18 * sc, 6 * sc, 0, 0, TAU); ctx.fill();
        const leaf = (dx, dy, rr, col) => {
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(dx * sc + sway, dy * sc, rr * sc, 0, TAU); ctx.fill();
        };
        leaf(-8, -6, 9, '#2f6b2b');
        leaf(6, -5, 8, '#3f7a35');
        leaf(0, -12, 9, '#4c8a3e');
        leaf(-2, -4, 7, '#5da24a');
        // ışık üstü
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath(); ctx.arc(-1 * sc + sway, -13 * sc, 5 * sc, 0, TAU); ctx.fill();
        // küçük meyveler
        ctx.fillStyle = '#d9534f';
        ctx.beginPath(); ctx.arc(3 * sc + sway, -10 * sc, 1.5 * sc, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(-7 * sc + sway, -8 * sc, 1.3 * sc, 0, TAU); ctx.fill();
        ctx.restore();

      } else if (s.type === 'mountain') {
        // Eski minyatür dağ yerine aynı ölçekte, çok yüzlü 3D kaya kütlesi.
        const sc = s.scale;
        ctx.save();
        ctx.translate(x, y);

        // Yumuşak zemin gölgesi (iki katman = 3D oturma hissi)
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        ctx.beginPath(); ctx.ellipse(5 * sc, 3 * sc, 46 * sc, 15 * sc, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.beginPath(); ctx.ellipse(-4 * sc, 1 * sc, 30 * sc, 10 * sc, 0, 0, TAU); ctx.fill();

        const face = (pts, col) => {
          ctx.fillStyle = col; ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * sc, p[1] * sc) : ctx.moveTo(p[0] * sc, p[1] * sc)));
          ctx.closePath(); ctx.fill();
        };

        // Arka kaya (koyu, derinlik)
        face([[-34, 1], [-27, -26], [-12, -37], [4, -33], [12, -12], [4, 2]], '#39474e');
        // Ana kütle
        face([[-30, 3], [-23, -29], [-7, -44], [10, -36], [24, -8], [26, 3], [-2, 7]], '#6f828c');
        // Sol/üst ışık faseti
        face([[-23, -29], [-7, -44], [10, -36], [3, -25], [-9, -24]], '#a9bcc4');
        // Sağ gölge faseti
        face([[10, -36], [24, -8], [26, 3], [3, -25]], '#51636c');
        // Ön alt gölge
        face([[-30, 3], [26, 3], [8, 8], [-4, 8]], '#2c373d');
        // Yan küçük kaya (kompozisyon)
        face([[20, 2], [26, -15], [37, -11], [41, 2], [30, 6]], '#5d717b');
        face([[26, -15], [37, -11], [33, -19], [41, 2]], '#8fa3ad');
        face([[26, -15], [33, -19], [30, -10]], '#b0c4ce');

        // Çatlaklar
        ctx.strokeStyle = 'rgba(12,20,24,0.5)'; ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-9 * sc, -33 * sc); ctx.lineTo(-5 * sc, -20 * sc); ctx.lineTo(-11 * sc, -7 * sc);
        ctx.moveTo(11 * sc, -27 * sc); ctx.lineTo(14 * sc, -13 * sc);
        ctx.moveTo(-20 * sc, -18 * sc); ctx.lineTo(-15 * sc, -11 * sc);
        ctx.stroke();

        // Yosun / etek otları
        ctx.fillStyle = '#4f7a2f';
        ctx.beginPath(); ctx.ellipse(-19 * sc, 2 * sc, 12 * sc, 3.4 * sc, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#6aa84f';
        ctx.beginPath(); ctx.ellipse(21 * sc, 2.4 * sc, 9 * sc, 2.6 * sc, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#3f6326';
        ctx.beginPath(); ctx.ellipse(-28 * sc, 3 * sc, 6 * sc, 2 * sc, 0, 0, TAU); ctx.fill();

        // Güneş ışığı parıltısı (üst faset)
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, -2 * sc, -34 * sc, 20 * sc, '#cfe8ff', 0.06 + 0.02 * Math.sin(t * 1.4 + s.wx));
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();

      } else if (s.type === 'mushroom') {
        const sc = s.scale;
        ctx.save(); ctx.translate(x, y);
        const caps = [[-6, 0, 5], [4, 1, 6.5], [10, -1, 4]];
        caps.forEach(([cx, cy, r], i) => {
          ctx.fillStyle = '#d7ccc8'; ctx.fillRect((cx - 1) * sc, (cy - 6) * sc, 2 * sc, 6 * sc);
          ctx.fillStyle = i % 2 ? '#26c6da' : '#7e57c2';
          ctx.beginPath(); ctx.ellipse(cx * sc, (cy - 6) * sc, r * sc, r * 0.65 * sc, 0, Math.PI, 0); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath(); ctx.arc((cx - r * 0.3) * sc, (cy - 8) * sc, 0.9 * sc, 0, TAU); ctx.fill();
        });
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 0, -6 * sc, 22 * sc, '#4dd0e1', 0.28 + 0.1 * Math.sin(t * 3 + s.wx));
        ctx.restore();

      } else if (s.type === 'lantern') {
        ctx.save(); ctx.translate(x, y);
        ctx.fillStyle = '#2b2b30'; ctx.fillRect(-1.5, -40, 3, 40);
        ctx.fillStyle = '#3a3a42'; ctx.fillRect(-4, -2, 8, 3);
        ctx.fillStyle = '#1e1e24'; ctx.beginPath();
        ctx.moveTo(-6, -48); ctx.lineTo(6, -48); ctx.lineTo(3.5, -52); ctx.lineTo(-3.5, -52); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffe9a8'; ctx.fillRect(-4, -47, 8, 8);
        ctx.strokeStyle = '#1e1e24'; ctx.lineWidth = 1.2; ctx.strokeRect(-4, -47, 8, 8);
        ctx.globalCompositeOperation = 'lighter';
        const fl = 0.8 + 0.2 * Math.sin(t * 9 + s.wx) * Math.sin(t * 5.3);
        drawGlow(ctx, 0, -43, 34, '#ffb84d', 0.6 * fl);
        drawGlow(ctx, 0, -43, 12, '#fff2c0', 0.9);
        ctx.restore();

      } else if (s.type === 'shrine') {
        const pulse = (Math.sin(t * 2.4) + 1) * 0.5;
        ctx.save();
        ctx.translate(x, y);
        // basamaklı kaide
        ctx.fillStyle = '#1d272c';
        ctx.beginPath(); ctx.ellipse(0, 2, 28, 14, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2b383e';
        ctx.beginPath(); ctx.ellipse(0, -1, 23, 11.5, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(0,229,255,0.55)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, -1, 23, 11.5, 0, 0, TAU); ctx.stroke();
        // monolit: sol yüz aydınlık, sağ yüz karanlık
        ctx.fillStyle = '#4a5d66';
        ctx.beginPath(); ctx.moveTo(-14, -2); ctx.lineTo(-10, -56); ctx.lineTo(0, -60); ctx.lineTo(0, -4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2c3a41';
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -60); ctx.lineTo(10, -56); ctx.lineTo(14, -2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6b8590';
        ctx.beginPath(); ctx.moveTo(-10, -56); ctx.lineTo(0, -60); ctx.lineTo(10, -56); ctx.lineTo(0, -53); ctx.closePath(); ctx.fill();
        // rünler
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 0, -32, 46, '#00e5ff', 0.28 + pulse * 0.2);
        ctx.strokeStyle = `rgba(120,245,255,${0.7 + pulse * 0.3})`;
        ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -48); ctx.lineTo(0, -14);
        ctx.moveTo(-6, -38); ctx.lineTo(6, -29);
        ctx.moveTo(6, -38); ctx.lineTo(-6, -29);
        ctx.moveTo(-5, -22); ctx.lineTo(5, -22);
        ctx.stroke();
        // süzülen kristal parçaları
        for (let i = 0; i < 3; i++) {
          const a = t * 1.2 + i * (TAU / 3);
          const px = Math.cos(a) * 24, py = -40 + Math.sin(a * 1.7) * 6 + Math.sin(a) * 8;
          ctx.fillStyle = 'rgba(140,250,255,0.9)';
          ctx.beginPath(); ctx.moveTo(px, py - 4); ctx.lineTo(px + 2.5, py); ctx.lineTo(px, py + 4); ctx.lineTo(px - 2.5, py); ctx.closePath(); ctx.fill();
          drawGlow(ctx, px, py, 8, '#00e5ff', 0.6);
        }
        ctx.restore();

        // Etkileşim ipucu
        if (Math.hypot(s.wx - this.player.x, s.wy - this.player.y) < 70) {
          ctx.save();
          ctx.translate(x, y - 78 + Math.sin(t * 4) * 2);
          ctx.font = 'bold 12px Cinzel, Inter, sans-serif';
          const label = 'Seyahat Taşı';
          const tw2 = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(8,16,20,0.82)';
          rr(ctx, -tw2 / 2 - 28, -12, tw2 + 40, 22, 11); ctx.fill();
          ctx.strokeStyle = 'rgba(0,229,255,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.fillStyle = '#00e5ff';
          rr(ctx, -tw2 / 2 - 24, -8, 16, 15, 4); ctx.fill();
          ctx.fillStyle = '#04181c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('E', -tw2 / 2 - 16, 0);
          ctx.fillStyle = '#e0f7fa';
          ctx.fillText(label, 6, 0);
          ctx.restore();
        }
      }
    }

    // ---------------- OYUNCU (37 sınıf görünümü) ----------------
    // Diğer oyuncular da kendi sınıflarının tam görünümüyle çizilir; tek fark
    // isim plakası, can barı ve yere düşme etiketidir.
    drawOtherPlayer(ctx, o) {
      const { x, y } = this.iso(o.wx, o.wy, 0);
      if (x < -90 || x > this.width + 90 || y < -120 || y > this.height + 80) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,0.34)';
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 6, 0, 0, TAU); ctx.fill();
      ctx.restore();
      // Tam sınıf görünümü + isim/can plakası drawPlayer içinde.
      o.x = o.wx; o.y = o.wy; o.z = this.groundZAt(o.wx, o.wy);
      this.drawPlayer(ctx, o);
    }

    drawPlayer(ctx, p) {
      const isSelf = p === this.player;
      const { x, y } = this.iso(p.x, p.y, p.z);
      const S = p.style || (p.style = getClassStyle(p.character || this.playerData.class));
      const downed = isSelf ? this.downed : !!p.downed;
      const o = S.pal;
      const t = this.time;
      const fa = worldAngleToScreen(p.facingAngle);
      const fx = Math.cos(fa), fy = Math.sin(fa);
      const front = fy > -0.25;                       // yüz bize dönük mü?
      const svx = (p.vx - p.vy) * COS_30;
      const moving = Math.hypot(p.vx, p.vy) > 10 || p.isDashing;
      const ph = p.walkPhase;
      const bob = moving ? -Math.abs(Math.sin(ph)) * 2.4 : Math.sin(t * 2.2) * -0.9;
      const lean = p.isDashing ? clamp(svx / 680, -1, 1) * 0.28 : clamp(svx / 420, -1, 1) * 0.08;
      const flutter = Math.sin(t * 9) * (moving ? 3 : 1);
      const capeSX = clamp(-svx * 0.05, -9, 9) + flutter * 0.4;
      // Savurma sırasında gövde öne atılsın + hafifçe dönsün (silah animasyonuyla uyumlu).
      let lunge = 0, swingLean = 0;
      const wsp = p.weaponSwing;
      if (wsp && wsp.timer > 0 && !downed) {
        const u = clamp(1 - wsp.timer / Math.max(0.01, wsp.duration || 0.3), 0, 1);
        const push = u < 0.22 ? -(u / 0.22) * 0.35
          : (u < 0.56 ? (u - 0.22) / 0.34 : 1 - ((u - 0.56) / 0.44) * 0.85);
        lunge = push * (wsp.kind === 'slam' ? 4 : (wsp.kind === 'spin' ? 2 : 7));
        swingLean = wsp.kind === 'spin' ? 0 : push * 0.13 * (wsp.dir || 1);
      }
      // Savunma duruşu: gövde hafifçe çöker, silah tarafına döner.
      const gPhase = p.parryPhase;
      let stanceDrop = 0, stanceLean = 0, stanceShift = 0;
      if (!downed && gPhase && gPhase !== 'idle') {
        const gw = gPhase === 'window' ? 1 : (gPhase === 'block' ? 0.9 : 0.55);
        stanceDrop = 2.6 * gw;
        stanceLean = -0.055 * gw * (fx >= 0 ? 1 : -1);
        stanceShift = -1.8 * gw;   // nişan yönünden hafifçe geriye yüklen
      }
      const env = { fx, fy, front, capeSX, t };
      const handCol = S.skin || '#d7a06a';
      const armCol = S.body === 'bare' ? S.skin : o.cloth;

      ctx.save();
      ctx.translate(x, y);
      if (S.ground) groundFx(ctx, t, S.ground);

      ctx.save();
      if (downed) {
        // Yere yatmış: gövdeyi yana çevirip hafif çökert.
        ctx.translate(0, 7);
        ctx.rotate(-1.2);
        ctx.scale(S.scale, S.scale);
      } else {
        ctx.translate(fx * (lunge + stanceShift), bob + fy * (lunge + stanceShift) * 0.55 + stanceDrop);
        ctx.rotate(lean + swingLean + stanceLean);
        ctx.scale(S.scale, S.scale);
      }

      // --- arka katman efektleri ---
      if (S.rise && (S.rise.kind === 'smoke' || S.rise.kind === 'dust')) riseFx(ctx, t, S.rise);
      if (S.orbit) orbitFx(ctx, t, S.orbit, false);
      haloFx(ctx, S, t, true);

      // Silah / kalkan arkada kalıyorsa önce çiz
      if (!front) {
        if (S.offhand) drawShield(ctx, S, o, env);
        this.drawWeapon(ctx, p, S, fa);
      }

      // ---- Kanatlar (yüz önde: arkada) ----
      if (S.wings && front) wingsFx(ctx, S, t, moving);

      // ---- Pelerin ----
      const drawCape = () => {
        if (S.cape === 'none') return;
        const wave = Math.sin(t * 7) * (moving ? 2.2 : 0.8);
        const lag = capeSX;
        const b = S.cape === 'short' ? -9 : 1;
        const tat = S.cape === 'tattered';
        let g = ctx.createLinearGradient(0, -28, 0, 4);
        g.addColorStop(0, o.cape); g.addColorStop(1, o.capeDark);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-8, -27);
        ctx.bezierCurveTo(-13 + lag * 0.3, -17, -15 + lag, -7 + (b - 1) * 0.5, -13 + lag, b);
        if (tat) {
          for (let k = 0; k <= 6; k++) ctx.lineTo(-13 + k * 26 / 6 + lag, b + (k % 2 ? 6 : 1) + Math.sin(t * 6 + k) * 1.3 + (moving ? wave * 0.4 : 0));
        } else {
          ctx.quadraticCurveTo(-7 + lag, b + 4 + wave, -1 + lag, b + 1);
          ctx.quadraticCurveTo(5 + lag, b + 4 - wave, 13 + lag, b);
        }
        ctx.bezierCurveTo(15 + lag, -7 + (b - 1) * 0.5, 13 + lag * 0.3, -17, 8, -27);
        ctx.closePath(); ctx.fill();
        // kıvrım gölgeleri
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3, -24); ctx.quadraticCurveTo(-5 + lag * 0.6, -10, -4 + lag, b + 1);
        ctx.moveTo(4, -24); ctx.quadraticCurveTo(6 + lag * 0.6, -10, 6 + lag, b + 1);
        ctx.stroke();
        // kenar süsü
        if (!tat) {
          ctx.strokeStyle = o.trim; ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-13 + lag, b); ctx.quadraticCurveTo(-7 + lag, b + 4 + wave, -1 + lag, b + 1);
          ctx.quadraticCurveTo(5 + lag, b + 4 - wave, 13 + lag, b);
          ctx.stroke();
        }
        if (S.original) {
          // yaprak motifleri (orijinal doğa pelerini)
          ctx.fillStyle = shade(o.cape, 0.35);
          for (let i = 0; i < 4; i++) {
            const lx = -9 + i * 6 + lag * 0.9, ly = -3 + Math.sin(i * 2 + t * 3) * 1.2 + (i % 2) * 2;
            ctx.beginPath(); ctx.ellipse(lx, ly, 2.4, 1.1, 0.6 + i * 0.4, 0, TAU); ctx.fill();
          }
        } else {
          ctx.strokeStyle = rgba(o.trim, 0.55); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, -25); ctx.quadraticCurveTo(lag * 0.5, -10, lag * 0.8, b - 1); ctx.stroke();
        }
        // yaka
        ctx.fillStyle = o.capeDark;
        ctx.beginPath(); ctx.ellipse(0, -27, 9, 3.2, 0, 0, TAU); ctx.fill();
      };
      if (front) drawCape();

      // ---- Bacaklar / etek ----
      const swing = moving ? Math.sin(ph) : 0;
      if (S.legs === 'fade') {
        const wv = Math.sin(t * 3.2) * 2 + swing * 2;
        const g2 = ctx.createLinearGradient(0, -12, 0, 4);
        g2.addColorStop(0, o.armorDark); g2.addColorStop(1, rgba(o.armorDark, 0));
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.moveTo(-7, -12);
        ctx.quadraticCurveTo(-6 + wv * 0.5, -4, -2 + wv, 4); ctx.quadraticCurveTo(0 + wv * 1.2, -1, 2 + wv * 0.6, 5);
        ctx.quadraticCurveTo(6 + wv * 0.5, -4, 7, -12); ctx.closePath(); ctx.fill();
      } else {
        [[-3.6, swing], [3.6, -swing]].forEach(([lx, sw]) => {
          const lift = moving ? Math.max(0, sw) * 3.2 : 0;
          const dx = moving ? sw * 2 * fx : 0;
          ctx.fillStyle = S.body === 'bare' ? S.skin : o.cloth;
          rr(ctx, lx - 2.6 + dx * 0.5, -10, 5.2, 8, 2); ctx.fill();
          ctx.fillStyle = S.body === 'bare' ? shade(S.skin, -0.45) : '#3a2412';
          rr(ctx, lx - 3.3 + dx, -5 - lift, 6.6, 6, 2.2); ctx.fill();
          ctx.fillStyle = S.body === 'bare' ? shade(S.skin, -0.2) : '#6a4a2a';
          ctx.fillRect(lx - 3.3 + dx, -5 - lift, 6.6, 1.8);
        });
      }
      if (S.body === 'robe') {
        const sw = moving ? Math.sin(ph) * 1.6 : 0;
        const jag = S.legs === 'fade';
        const g3 = ctx.createLinearGradient(0, -12, 0, 3); g3.addColorStop(0, o.armor); g3.addColorStop(1, o.armorDark);
        ctx.fillStyle = g3;
        ctx.beginPath(); ctx.moveTo(-7.6, -12); ctx.lineTo(7.6, -12);
        if (jag) {
          for (let k = 0; k <= 6; k++) ctx.lineTo(11 - k * 22 / 6 + sw * (k % 2 ? -0.5 : 0.5), 1 + (k % 2 ? 3 : -1) + Math.sin(t * 5 + k) * 0.8);
        } else {
          ctx.lineTo(11 + sw, 1); ctx.quadraticCurveTo(0, 3.5 + Math.sin(t * 3) * 0.5, -11 - sw, 1);
        }
        ctx.closePath(); ctx.fill();
        if (!jag) { ctx.strokeStyle = o.trim; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(11 + sw, 1); ctx.quadraticCurveTo(0, 3.5 + Math.sin(t * 3) * 0.5, -11 - sw, 1); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-2.4, -11); ctx.lineTo(-4 - sw * 0.3, 1); ctx.moveTo(2.4, -11); ctx.lineTo(4 + sw * 0.3, 1); ctx.stroke();
      }

      // ---- Gövde ----
      let g;
      if (S.body === 'bare') {
        g = ctx.createLinearGradient(-9, 0, 9, 0);
        g.addColorStop(0, shade(S.skin, 0.18)); g.addColorStop(0.55, S.skin); g.addColorStop(1, shade(S.skin, -0.35));
      } else {
        g = ctx.createLinearGradient(-9, 0, 9, 0);
        g.addColorStop(0, shade(o.armor, 0.15)); g.addColorStop(0.55, o.armor); g.addColorStop(1, o.armorDark);
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-8, -26); ctx.lineTo(8, -26); ctx.lineTo(7, -10); ctx.quadraticCurveTo(0, -7, -7, -10); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
      if (S.body === 'bare') {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); for (let k = 0; k < 3; k++) { ctx.moveTo(-5, -23 + k * 3.4); ctx.quadraticCurveTo(0, -21.4 + k * 3.4, 5, -23 + k * 3.4); } ctx.stroke();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(S.eyeGlow || o.accent, 0.55 + 0.25 * Math.sin(t * 3)); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-2, -24); ctx.lineTo(0, -19); ctx.lineTo(-3, -15); ctx.moveTo(3, -22); ctx.lineTo(1, -17); ctx.stroke(); ctx.restore();
        ctx.fillStyle = o.cloth; poly(ctx, [-7, -12, 7, -12, 6, -5 + Math.sin(t * 4) * 0.6, 0, -3, -6, -5 + Math.sin(t * 4 + 1) * 0.6]); ctx.fill();
      } else {
        if (front) {
          ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(-5, -24); ctx.lineTo(-5, -14); ctx.stroke();
          if (S.strap) { ctx.strokeStyle = o.trim; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-7, -25); ctx.lineTo(6, -11); ctx.stroke(); }
          drawEmblem(ctx, S, o);
        }
        ctx.fillStyle = S.body === 'robe' ? o.cloth : '#4a2c14'; ctx.fillRect(-7.5, -13, 15, 3);   // kemer
        ctx.fillStyle = o.trim; ctx.fillRect(-1.8, -13.2, 3.6, 3.4);
      }

      // Omuzluklar
      drawShoulders(ctx, S, o);

      // Kollar (silah eline uzanır) — savunma duruşunda el göğüs önüne çekilir.
      const gPhaseNow = p.parryPhase;
      const guardPose = !downed && !!(gPhaseNow && gPhaseNow !== 'idle');
      const sideG = fx >= 0 ? 1 : -1;
      const hx = guardPose ? (fx * 1.2 + sideG * 4.5) : fx * 6;
      const hy = guardPose ? -21 : -17 + fy * 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = armCol; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(fx >= 0 ? -7 : 7, -23); ctx.lineTo(fx >= 0 ? -9 : 9, -15 + Math.sin(ph) * (moving ? 2 : 0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx >= 0 ? 7 : -7, -23); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = handCol;
      ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, TAU); ctx.fill();
      // Guard: diğer el silahın gövdesini destekler (iki elle tutuş hissi).
      if (guardPose) {
        const ga = -Math.PI / 2 + 0.62 * sideG;
        const sxh = hx + Math.cos(ga) * 13, syh = hy + Math.sin(ga) * 13;
        ctx.strokeStyle = armCol; ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(fx >= 0 ? 7 : -7, -23); ctx.lineTo(sxh, syh); ctx.stroke();
        ctx.fillStyle = handCol;
        ctx.beginPath(); ctx.arc(sxh, syh, 2.3, 0, TAU); ctx.fill();
      }

      // Yan el kalkanı (önde)
      if (front && S.offhand) drawShield(ctx, S, o, env);

      if (!front) drawCape(); // sırtı dönükse pelerin gövdenin önünde
      if (S.wings && !front) wingsFx(ctx, S, t, moving);

      // ---- Baş ----
      if (S.head === 'goggles' || true) {
        if (S.skin) {
          g = ctx.createRadialGradient(-2, -35, 1, 0, -33, 8);
          g.addColorStop(0, shade(S.skin, 0.3)); g.addColorStop(1, S.skin);
        } else {
          g = ctx.createRadialGradient(-2, -35, 1, 0, -33, 8);
          g.addColorStop(0, '#ffd9a6'); g.addColorStop(1, '#d9a066');
        }
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, -33, 7.2, 0, TAU); ctx.fill();
      }
      const ownFace = drawHeadGear(ctx, S, o, env);

      // Yüz
      if (front && !ownFace) {
        const ex = fx * 2.4, ey = -33 + fy * 1.4;
        if (S.eyeGlow) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = S.eyeGlow;
          ctx.beginPath(); ctx.arc(ex - 2.4, ey, 1.4, 0, TAU); ctx.arc(ex + 2.4, ey, 1.4, 0, TAU); ctx.fill();
          drawGlow(ctx, ex, ey, 9, S.eyeGlow, 0.6);
          ctx.globalCompositeOperation = 'source-over';
        } else {
          ctx.fillStyle = '#2b1a0e';
          ctx.beginPath(); ctx.arc(ex - 2.4, ey, 1.15, 0, TAU); ctx.arc(ex + 2.4, ey, 1.15, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(ex - 2.8, ey - 0.8, 0.7, 0.7); ctx.fillRect(ex + 2, ey - 0.8, 0.7, 0.7);
        }
      }

      haloFx(ctx, S, t, false);

      // Silah önde
      if (front) this.drawWeapon(ctx, p, S, fa);

      // --- ön katman efektleri ---
      if (S.orbit) orbitFx(ctx, t, S.orbit, true);
      if (S.rise && S.rise.kind !== 'smoke' && S.rise.kind !== 'dust') riseFx(ctx, t, S.rise);

      ctx.restore(); // gövde dönüşümü

      // İsim plakası (boy/başlık yüksekliğine göre yukarı kayar)
      const lift = Math.max(0, 46 * S.scale + (HEAD_TALL[S.head] || 0) + (S.halo ? 5 : 0) + (S.crown ? 4 : 0) - 50);
      if (downed) {
        // Yere düşme göstergesi: kırmızı nabız halkası + DOWNED etiketi.
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 0, 0, 30 + pulse * 6, '#ff5252', 0.22 + 0.15 * pulse);
        ctx.restore();
        ctx.strokeStyle = rgba('#ff5252', 0.65 + 0.3 * pulse);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 2, 26, 10, 0, 0, TAU); ctx.stroke();
        const dw = 78;
        ctx.fillStyle = 'rgba(40,6,8,0.78)';
        rr(ctx, -dw / 2, -96 - lift, dw, 16, 8); ctx.fill();
        ctx.strokeStyle = rgba('#ff5252', 0.8); ctx.lineWidth = 1; ctx.stroke();
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#ff8a80'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('DOWNED', 0, -88 - lift);
      }
      const nm = String((isSelf ? (this.playerData.name || p.name) : p.name) || '');
      if (nm) {
        const nameCol = isSelf ? '#80deea' : (p.color || '#cfe8ff');
        ctx.font = 'bold 12px Cinzel, Inter, sans-serif';
        const w = ctx.measureText(nm).width;
        ctx.fillStyle = 'rgba(6,14,18,0.6)';
        rr(ctx, -w / 2 - 6, -70 - lift, w + 12, 16, 8); ctx.fill();
        ctx.strokeStyle = rgba(nameCol, isSelf ? 0.45 : 0.62); ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = downed ? '#ff8a80' : nameCol; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(nm, 0, -62 - lift);
      }

      // Diğer oyuncuların can barı + diriltme ipucu (kendi canımız skill bar'da).
      if (!isSelf) {
        const bw = 48, bh = 5, bx = -bw / 2, by = -52 - lift;
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        rr(ctx, bx - 1, by - 1, bw + 2, bh + 2, 3); ctx.fill();
        const f = clamp(p.hpFrac != null ? p.hpFrac : 1, 0, 1);
        if (f > 0) {
          ctx.fillStyle = f > 0.35 ? '#2fbf4a' : '#d32f2f';
          rr(ctx, bx, by, Math.max(2, bw * f), bh, 2); ctx.fill();
        }
        if (this._reviveTarget === p.id) {
          const label = '[E] Revive';
          ctx.font = 'bold 11px Inter, sans-serif';
          const lw = ctx.measureText(label).width + 16;
          ctx.fillStyle = 'rgba(10,24,18,0.85)';
          rr(ctx, -lw / 2, by - 26, lw, 17, 8); ctx.fill();
          ctx.strokeStyle = 'rgba(120,255,180,0.75)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = '#8dffc0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(label, 0, by - 17);
        }
      }

      ctx.restore();
    }

    // Fare yönüne dönen silah (ekran uzayında doğru açı). Saldırı animasyonu silah türüne göre:
    // swing (geniş savurma) · slash (hızlı çapraz) · slam (yukarıdan vurma) · thrust (saplama)
    // · spin (tam tur) · cast (kaldırıp bırakma). Tümü anticipation → strike → recovery eğrisi kullanır.
    drawWeapon(ctx, p, S, fa) {
      const o = S.pal;
      const fx = Math.cos(fa), fy = Math.sin(fa);
      const t = this.time;
      const sw = p.weaponSwing;
      let mode = S.atkMode;
      let u = -1;
      if (sw && sw.timer > 0) {
        mode = sw.kind || mode;
        u = clamp(1 - sw.timer / Math.max(0.01, sw.duration || 0.3), 0, 1);
      } else if (p.attackAnimTimer > 0) {
        u = clamp(1 - p.attackAnimTimer / 0.22, 0, 1);
      }
      const dir = (sw && sw.dir) || p.swingDir || 1;
      // Savurma eğrisi: geri çekilme → hızlı darbe → takip.
      const curve = (v) => {
        if (v < 0.22) return -0.34 * easeOut(v / 0.22);
        if (v < 0.56) return -0.34 + 1.34 * easeOut((v - 0.22) / 0.34);
        return 1 + Math.sin(((v - 0.56) / 0.44) * Math.PI) * 0.1;
      };
      const angleFor = (v) => {
        if (u < 0) return fa;
        const c = curve(clamp(v, 0, 1));
        if (mode === 'spin') return fa + v * TAU * dir - 0.6 * dir;
        if (mode === 'slam') return fa + (c - 0.6) * 2.0;
        if (mode === 'thrust') return fa + (c - 0.35) * 0.5 * dir;
        if (mode === 'cast') return fa - 0.5 * easeOut(v) * dir;
        return fa + c * (mode === 'swing' ? 2.05 : 1.5) * dir;
      };
      const recoil = u >= 0 ? (1 - u) * 3 : 0;

      // --- SAVUNMA DURUŞU (parry / blok) ---
      // F basılınca silah göğüs önüne çapraz çekilir: kılıç/hançer/balta/asa/fist
      // hepsi aynı "guard" pozuna girer. Savurma sürerken bu poz uygulanmaz.
      const phase = p.parryPhase;
      if (p === this.player && u < 0 && !this.downed &&
          (phase === 'startup' || phase === 'window' || phase === 'block')) {
        const side = fx >= 0 ? 1 : -1;
        const pcfg = (this.combatCfg && this.combatCfg.parry) || {};
        let gs = 1;
        if (phase === 'startup') {
          const dur = Math.max(0.01, Number(pcfg.startup) || 0.08);
          const k = clamp(1 - (Number(p.parryTimer) || 0) / dur, 0, 1);
          gs = 0.3 + 0.7 * easeOut(k);          // hızlı ama yumuşak yükselme
        } else if (phase === 'window') {
          gs = 1.03 + Math.sin(t * 38) * 0.014;  // parry penceresi: hafif gerginlik
        } else {
          gs = 0.97 + Math.sin(t * 6) * 0.012;   // blok: sakin duruş
        }
        // Silah ekran uzayında yukarı (blade up) ve gövdeye doğru çapraz tutulur.
        const norm = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
        const guardAng = -Math.PI / 2 + 0.62 * side;
        const dAng = norm(guardAng - fa);
        const px0 = fx * 6, py0 = -17 + fy * 3;
        const px1 = fx * 1.2 + side * 4.5, py1 = -21;
        ctx.save();
        ctx.translate(px0 + (px1 - px0) * gs, py0 + (py1 - py0) * gs);
        ctx.rotate(fa + dAng * gs);
        drawWeaponKind(ctx, S, o, t, -1, 0);
        // Parry penceresinde bıçak kenarında cyan parlama (okunabilirlik).
        if (phase === 'window') {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const pulse = 0.28 + 0.2 * Math.sin(t * 30);
          drawGlow(ctx, 26, 0, 20, '#80deea', pulse);
          drawGlow(ctx, 12, 0, 12, '#ffffff', pulse * 0.5);
          ctx.restore();
        }
        ctx.restore();
        return;
      }

      // Hareket izi: darbenin en hızlı anında silahın önceki açıları (motion blur).
      if (u >= 0.16 && u <= 0.68) {
        const trailCol = (sw && sw.color) || S.slash || '#9fd8ff';
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 1; i <= 4; i++) {
          const v = Math.max(0, u - i * 0.05);
          const a = angleFor(v);
          ctx.save();
          ctx.globalAlpha = 0.13 * (1 - i / 5.5);
          ctx.translate(Math.cos(a) * 6, -17 + Math.sin(a) * 3);
          ctx.rotate(a);
          drawWeaponKind(ctx, S, o, t, v, 0, trailCol);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      const push = (u >= 0 && mode === 'thrust') ? curve(u) * 9 : 0;
      const ang = angleFor(u >= 0 ? u : 0);
      ctx.save();
      ctx.translate(fx * (6 + push), -17 + fy * (3 + push * 0.6));
      ctx.rotate(ang);
      if (mode === 'slam' && u >= 0) ctx.translate(Math.sin(u * Math.PI) * 5, 0);
      drawWeaponKind(ctx, S, o, t, u, recoil);
      ctx.restore();
    }

    // ---------------- YOL ARKADAŞI (Ruh Kurdu) ----------------
    drawCompanionPet(ctx, pet) {
      const { x, y } = this.iso(pet.x, pet.y, 0);
      if (x < -60 || x > this.width + 60 || y < -60 || y > this.height + 60) return;
      const t = this.time;
      const f = pet.face || 1;
      const run = pet.moving ? Math.sin(pet.animFrame) : 0;
      const bob = pet.moving ? -Math.abs(Math.sin(pet.animFrame)) * 2 : Math.sin(t * 3) * -0.6;

      ctx.save();
      ctx.translate(x, y + bob);
      ctx.scale(f, 1);

      // Kuyruk (alev gibi dalgalanan)
      ctx.strokeStyle = '#ffb74d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-12, -11); ctx.quadraticCurveTo(-20, -14 + run * 2, -19 + Math.sin(t * 6) * 2, -23); ctx.stroke();
      ctx.strokeStyle = '#ffe0b2'; ctx.lineWidth = 1.6;
      ctx.stroke();

      // Bacaklar
      ctx.strokeStyle = '#e65100'; ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(-8, -7); ctx.lineTo(-8 + run * 4, 0);
      ctx.moveTo(-4, -7); ctx.lineTo(-4 - run * 4, 0);
      ctx.moveTo(7, -7); ctx.lineTo(7 - run * 4, 0);
      ctx.moveTo(11, -7); ctx.lineTo(11 + run * 4, 0);
      ctx.stroke();

      // Gövde
      let g = ctx.createLinearGradient(0, -18, 0, -5);
      g.addColorStop(0, '#ffb74d'); g.addColorStop(1, '#ef6c00');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, -11, 15, 7.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath(); ctx.ellipse(1, -8, 11, 3, 0, 0, TAU); ctx.fill();

      // Yele
      ctx.fillStyle = '#ffd180';
      ctx.beginPath(); ctx.moveTo(4, -17); ctx.lineTo(7, -22); ctx.lineTo(9, -17); ctx.lineTo(12, -21); ctx.lineTo(13, -15); ctx.closePath(); ctx.fill();

      // Baş
      g = ctx.createRadialGradient(12, -17, 1, 13, -15, 8);
      g.addColorStop(0, '#ffcc80'); g.addColorStop(1, '#fb8c00');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(13, -15, 6.2, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(17, -17); ctx.lineTo(25, -13); ctx.lineTo(17, -10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(24, -13, 1.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath(); ctx.moveTo(10, -19); ctx.lineTo(9, -26); ctx.lineTo(14, -20); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(15, -20); ctx.lineTo(18, -26); ctx.lineTo(19, -18); ctx.closePath(); ctx.fill();

      // Parlayan göz + ruh aurası
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#e0f7fa'; ctx.beginPath(); ctx.arc(16, -16, 1.4, 0, TAU); ctx.fill();
      drawGlow(ctx, 16, -16, 7, '#80deea', 0.7);
      drawGlow(ctx, 0, -12, 30, '#ff9800', 0.2 + 0.05 * Math.sin(t * 4));
      ctx.restore();

      ctx.save();
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#ffe082'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 3;
      ctx.strokeText(pet.name, x, y - 32); ctx.fillText(pet.name, x, y - 32);
      ctx.restore();
    }

    // ---------------- DASH İZİ (siluet) ----------------
    drawGhostTrail(ctx, gt) {
      const { x, y } = this.iso(gt.x, gt.y, this.player.z);
      if (x < -50 || x > this.width + 50 || y < -80 || y > this.height + 50) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(gt.alpha, 0, 1);
      drawGlow(ctx, 0, -20, 30, gt.color, 0.7);
      ctx.fillStyle = gt.color;
      ctx.globalAlpha = clamp(gt.alpha, 0, 1) * 0.75;
      ctx.beginPath(); ctx.ellipse(0, -15, 8, 13, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -33, 7, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-8, -26); ctx.lineTo(-13, -4); ctx.lineTo(13, -4); ctx.lineTo(8, -26); ctx.closePath(); ctx.globalAlpha *= 0.5; ctx.fill();
      ctx.restore();
    }

    // ---------------- CANAVARLAR ----------------
    // Önce ara tuvale çizilir; böylece vuruşta TÜM silüet beyaza döner (source-atop)
    drawMonster(ctx, m) {
      const pos = this.iso(m.x, m.y, m.z || 0);
      if (pos.x < -110 || pos.x > this.width + 110 || pos.y < -90 || pos.y > this.height + 160) return;

      const dead = m.hp <= 0;
      const life = dead ? clamp(m.deathTimer / 0.45, 0, 1) : 1;
      const t = this.time;
      const fa = worldAngleToScreen(m.facingAngle);
      const face = Math.cos(fa) >= 0 ? 1 : -1;
      const atkT = m.attackCooldown > 0 ? m.attackTimer / m.attackCooldown : 0; // saldırıdan sonra 1 -> 0
      const lunge = atkT > 0.8 ? Math.sin(((1 - atkT) / 0.2) * Math.PI) * 6 : 0;

      const g = this.sctx;
      g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      g.clearRect(0, 0, 200, 200);
      g.save();
      g.translate(100, 150);
      g.translate(Math.cos(fa) * lunge, Math.sin(fa) * lunge * 0.6);
      const painter = m.painter || m.kind;
      const EXP = global.SETRA_MONSTER_EXPANSION;
      const expPaint = EXP && EXP.painters ? EXP.painters[painter] : null;
      if (expPaint) {
        // 17'lik canavar paketi: prosedürel çizim, kendi ölçek/ayna mantığı var.
        // Her painter'ın yaklaşık en/boy ölçüsü 200x200 ara tuvale sığdırılır
        // (dev elitler kırpılmasın, küçükler de olduğundan büyük görünmesin).
        const EXT = EXP_PAINTER_EXTENT[painter] || { w: 40, h: 50 };
        let u = m.radius / 16;
        u = Math.min(u, 92 / EXT.w, 138 / EXT.h);
        if (!Number.isFinite(u) || u <= 0) u = 1;
        try { expPaint(g, 0, 0, u, t, face, m); } catch (err) { /* çizim hatası oyunu durdurmasın */ }
      } else if (painter === 'treant') this.paintTreant(g, m, t, face, atkT);
      else if (painter === 'wraith') this.paintWraith(g, m, t, face, atkT);
      else if (painter === 'beast') this.paintBeast(g, m, t, face, atkT);
      else if (painter === 'spider') this.paintSpider(g, m, t, face, atkT);
      else if (painter === 'golem') this.paintGolem(g, m, t, face, atkT);
      else if (painter === 'knight') this.paintKnight(g, m, t, face, atkT);
      else if (painter === 'archer') this.paintArcher(g, m, t, face, atkT);
      else this.paintGoblin(g, m, t, face, atkT);
      g.restore();

      if (m.flashTimer > 0) {
        g.save();
        g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        g.globalCompositeOperation = 'source-atop';
        g.fillStyle = 'rgba(255,255,255,0.92)';
        g.fillRect(0, 0, 200, 200);
        g.restore();
      }

      ctx.save();
      ctx.translate(pos.x, pos.y);
      if (dead) {
        ctx.globalAlpha = life;
        ctx.translate(0, (1 - life) * -10);
        ctx.scale(1 + (1 - life) * 0.15, 0.55 + life * 0.45);
      }
      ctx.drawImage(this.scratch, -100, -150, 200, 200);
      ctx.restore();

      if (dead) return;

      // Agro işareti
      const topY = m.radius * (painter === 'treant' ? 2.9 : 2.5) + (painter === 'wraith' ? 10 : 0) + 8;
      ctx.save();
      ctx.translate(pos.x, pos.y);
      if (m.state === 'CHASE') {
        ctx.font = '900 16px Cinzel, Inter, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 4;
        const by = -topY - 22 + Math.sin(t * 8) * 1.5;
        ctx.strokeText('!', 0, by);
        ctx.fillStyle = '#ff3d3d'; ctx.fillText('!', 0, by);
      }

      // Süslü altın çerçeveli can barı (hayalet bar ile)
      const barW = 42, barH = 6;
      const bx = -barW / 2, by2 = -topY - 6;
      const pct = clamp(m.hp / m.maxHp, 0, 1);
      const gpct = clamp(m.hpGhost / m.maxHp, 0, 1);
      if (m.elite) {
        ctx.fillStyle = 'rgba(255,213,79,0.9)';
        ctx.font = '900 9px Cinzel, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ELITE', 0, by2 - 16);
      }
      ctx.fillStyle = 'rgba(8,10,14,0.92)';
      rr(ctx, bx - 1.5, by2 - 1.5, barW + 3, barH + 3, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,236,179,0.85)';
      ctx.fillRect(bx, by2, barW * gpct, barH);
      const hg = ctx.createLinearGradient(0, by2, 0, by2 + barH);
      hg.addColorStop(0, '#ff6e6e'); hg.addColorStop(0.5, '#e53935'); hg.addColorStop(1, '#8e1414');
      ctx.fillStyle = hg;
      ctx.fillRect(bx, by2, barW * pct, barH);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(bx, by2, barW * pct, 1.5);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < 4; i++) { ctx.moveTo(bx + (barW * i) / 4, by2); ctx.lineTo(bx + (barW * i) / 4, by2 + barH); }
      ctx.stroke();
      ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 1.2;
      rr(ctx, bx - 1.5, by2 - 1.5, barW + 3, barH + 3, 3); ctx.stroke();
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath(); ctx.arc(bx - 1.5, by2 + barH / 2, 1.8, 0, TAU); ctx.arc(bx + barW + 1.5, by2 + barH / 2, 1.8, 0, TAU); ctx.fill();

      ctx.font = 'bold 10px Cinzel, Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 3;
      ctx.strokeText(m.name, 0, by2 - 5);
      ctx.fillStyle = m.state === 'CHASE' ? '#ffcdd2' : '#eceff1';
      ctx.fillText(m.name, 0, by2 - 5);

      // Durum efekti ikonları (freeze/poison/burn/bleed/...)
      if (m.statuses) {
        const keys = Object.keys(m.statuses);
        const SC = { freeze: '#8fe4ff', stun: '#fff176', root: '#9ccc65', slow: '#4fc3f7', poison: '#9ccc65', burn: '#ff8a65', bleed: '#ff5370', shock: '#fff176' };
        keys.forEach((k, i) => {
          if (!SC[k]) return;
          const sx = (i - (keys.length - 1) / 2) * 11;
          ctx.fillStyle = SC[k];
          ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.arc(sx, by2 - 15, 3, 0, TAU); ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    // --- GOBLİN: sivri kulaklı, kırmızı parlak gözlü, sopalı ---
    paintGoblin(g, m, t, face, atkT) {
      const u = m.radius / 16;
      const ph = m.walkPhase;
      const sw = Math.sin(ph);
      const waddle = Math.sin(ph) * 0.05;
      g.scale(face * u, u);
      g.translate(0, -Math.abs(sw) * 1.6);
      g.rotate(waddle);
      g.lineCap = 'round'; g.lineJoin = 'round';

      const baseCol = m.color || '#8bc34a';
      const skin0 = baseCol, skin1 = shade(baseCol, -0.24), skinDark = shade(baseCol, -0.48);

      // Bacaklar
      g.strokeStyle = skinDark; g.lineWidth = 4.2;
      g.beginPath(); g.moveTo(-3.5, -9); g.lineTo(-4 + sw * 3, -1); g.moveTo(3.5, -9); g.lineTo(4 - sw * 3, -1); g.stroke();
      g.fillStyle = '#3e2723';
      g.beginPath(); g.ellipse(-4 + sw * 3, 0, 3.6, 1.9, 0, 0, TAU); g.ellipse(4.6 - sw * 3, 0, 3.6, 1.9, 0, 0, TAU); g.fill();

      // Arka kol (sopasız)
      g.strokeStyle = skin1; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(-6, -20); g.lineTo(-10, -14 + sw); g.stroke();

      // Bez önlük (yırtık etek)
      g.fillStyle = '#6d4c41';
      g.beginPath(); g.moveTo(-7, -12); g.lineTo(7, -12); g.lineTo(6, -5); g.lineTo(3, -7); g.lineTo(0, -4); g.lineTo(-3, -7); g.lineTo(-6, -5); g.closePath(); g.fill();

      // Gövde
      let gr = g.createRadialGradient(-2, -19, 1, 0, -16, 9);
      gr.addColorStop(0, skin0); gr.addColorStop(1, skin1);
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(0, -16, 8, 7.5, 0.1, 0, TAU); g.fill();
      // Deri yelek
      g.fillStyle = '#5d4037';
      g.beginPath(); g.moveTo(-6.5, -21); g.lineTo(6.5, -21); g.lineTo(7, -12); g.lineTo(-7, -12); g.closePath(); g.fill();
      g.strokeStyle = '#3e2723'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, -21); g.lineTo(0, -12); g.moveTo(-2, -18); g.lineTo(2, -17); g.moveTo(-2, -15); g.lineTo(2, -14); g.stroke();
      g.fillStyle = '#9e9e9e'; g.beginPath(); g.arc(-4, -16, 1, 0, TAU); g.fill();

      // Kulaklar (sivri, hafif titreşen)
      const ew = Math.sin(t * 5 + m.walkPhase) * 0.5;
      g.fillStyle = skin0;
      g.beginPath();
      g.moveTo(-6.5, -28); g.quadraticCurveTo(-14, -30 + ew, -22, -37 + ew); g.quadraticCurveTo(-13, -25, -7, -24); g.closePath(); g.fill();
      g.beginPath();
      g.moveTo(8.5, -28); g.quadraticCurveTo(16, -30 + ew, 24, -37 + ew); g.quadraticCurveTo(15, -25, 9, -24); g.closePath(); g.fill();
      g.fillStyle = '#c5e1a5';
      g.beginPath(); g.moveTo(-8, -27.5); g.quadraticCurveTo(-13, -29, -18, -34); g.quadraticCurveTo(-12, -26.5, -8, -25.5); g.fill();
      g.beginPath(); g.moveTo(10, -27.5); g.quadraticCurveTo(15, -29, 20, -34); g.quadraticCurveTo(14, -26.5, 10, -25.5); g.fill();
      g.strokeStyle = '#ffd54f'; g.lineWidth = 1.2;
      g.beginPath(); g.arc(-15.5, -33, 1.5, 0, TAU); g.stroke();

      // Baş
      gr = g.createRadialGradient(-2, -30, 1, 1, -27, 10);
      gr.addColorStop(0, shade(baseCol, 0.18)); gr.addColorStop(1, skin1);
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(1, -27, 8.8, 7.6, 0, 0, TAU); g.fill();
      // Saç püskülü
      g.fillStyle = '#1b1b1b';
      g.beginPath(); g.moveTo(-2, -33.5); g.lineTo(0, -39); g.lineTo(2, -34); g.lineTo(5, -38); g.lineTo(5, -33); g.closePath(); g.fill();
      // Kaşlar (öfkeli)
      g.strokeStyle = '#1b3a0e'; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(-5, -31.5); g.lineTo(0, -29.2); g.moveTo(9, -31.5); g.lineTo(4, -29.2); g.stroke();
      // Burun (siğilli)
      g.fillStyle = '#6a9a3a';
      g.beginPath(); g.ellipse(7.5, -25.5, 3.2, 2.4, 0, 0, TAU); g.fill();
      g.fillStyle = '#3d6b20'; g.beginPath(); g.arc(8.5, -26.6, 0.8, 0, TAU); g.fill();
      // Ağız ve dişler
      g.fillStyle = '#2b0d0d';
      g.beginPath(); g.ellipse(2, -22, 4.6, 1.9, 0, 0, TAU); g.fill();
      g.fillStyle = '#fffde7';
      g.beginPath(); g.moveTo(-1, -23.6); g.lineTo(0, -20.6); g.lineTo(1, -23.6); g.fill();
      g.beginPath(); g.moveTo(3.4, -23.6); g.lineTo(4.4, -20.6); g.lineTo(5.4, -23.6); g.fill();
      // PARLAYAN KIRMIZI GÖZLER
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(-2, -27.5, 2.2, 0, TAU); g.arc(5.6, -27.5, 2.2, 0, TAU); g.fill();
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = '#ff1744';
      g.beginPath(); g.arc(-1.7, -27.4, 1.7, 0, TAU); g.arc(5.9, -27.4, 1.7, 0, TAU); g.fill();
      drawGlow(g, -1.7, -27.4, 8, '#ff1744', 0.9);
      drawGlow(g, 5.9, -27.4, 8, '#ff1744', 0.9);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#1a0000';
      g.fillRect(-2, -28.6, 0.9, 2.4); g.fillRect(5.6, -28.6, 0.9, 2.4);

      // Sopa kolu + sopa
      let ca;
      if (atkT > 0.75) ca = lerp(-2.1, 0.7, easeOut((1 - atkT) / 0.25));
      else ca = -0.95 + Math.sin(t * 3 + m.walkPhase) * 0.06;
      g.strokeStyle = skin1; g.lineWidth = 3.6;
      g.beginPath(); g.moveTo(6, -20); g.lineTo(11, -17); g.stroke();
      g.save();
      g.translate(11, -17);
      g.rotate(ca);
      g.fillStyle = '#5d4037'; rr(g, -1.8, -14, 3.6, 16, 1.5); g.fill();
      g.strokeStyle = '#3e2723'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(-1.8, -4); g.lineTo(1.8, -2); g.moveTo(-1.8, -7); g.lineTo(1.8, -5); g.stroke();
      gr = g.createLinearGradient(-5, 0, 5, 0);
      gr.addColorStop(0, '#8d6e63'); gr.addColorStop(1, '#4e342e');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(-3, -13); g.quadraticCurveTo(-6.5, -21, -3, -27); g.quadraticCurveTo(0, -30, 3, -27); g.quadraticCurveTo(6.5, -21, 3, -13); g.closePath(); g.fill();
      g.fillStyle = '#b0bec5';
      [[-5, -20], [5, -22], [0, -29], [-4, -25]].forEach(([nx, ny]) => {
        g.beginPath(); g.moveTo(nx - 1.4, ny); g.lineTo(nx + Math.sign(nx || 1) * 3, ny - 0.8); g.lineTo(nx + 1.4, ny + 1.2); g.closePath(); g.fill();
      });
      g.fillStyle = '#d7a06a'; g.beginPath(); g.arc(0, 0, 2.2, 0, TAU); g.fill();
      g.restore();
    }

    // --- TREANT: yozlaşmış (mor ışıltılı) dev ağaç ---
    paintTreant(g, m, t, face, atkT) {
      const u = m.radius / 24;
      const ph = m.walkPhase;
      const sw = Math.sin(ph);
      g.scale(face * u, u);
      g.rotate(sw * 0.025);
      g.translate(0, -Math.abs(sw) * 1.2);
      g.lineCap = 'round'; g.lineJoin = 'round';

      // Kökler
      g.fillStyle = '#2b1810';
      [[-15, 3, -22, 4], [-6, 3, -8, 6], [8, 3, 12, 6], [15, 3, 23, 3]].forEach(([x0, y0, x1, y1]) => {
        g.beginPath(); g.moveTo(x0, -6); g.quadraticCurveTo(x0 + (x1 - x0) * 0.4, y0 - 2, x1, y1); g.lineTo(x0 + 7, 1); g.closePath(); g.fill();
      });

      // Arka kol
      const armSwing = atkT > 0.7 ? easeOut((1 - atkT) / 0.3) : 0;
      g.strokeStyle = '#3e2723'; g.lineWidth = 7;
      g.beginPath(); g.moveTo(-10, -40); g.quadraticCurveTo(-22, -30 + sw * 2, -22, -16); g.stroke();
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(-22, -16); g.lineTo(-27, -11); g.moveTo(-22, -16); g.lineTo(-18, -9); g.stroke();

      // Gövde
      let gr = g.createLinearGradient(-15, 0, 15, 0);
      const bark = m.color || '#5a382a';
      gr.addColorStop(0, shade(bark, 0.16)); gr.addColorStop(0.45, bark); gr.addColorStop(1, shade(bark, -0.42));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-16, -2); g.quadraticCurveTo(-11, -16, -13, -34); g.quadraticCurveTo(-12, -48, -8, -54);
      g.lineTo(8, -54); g.quadraticCurveTo(13, -46, 13, -34); g.quadraticCurveTo(12, -14, 16, -2);
      g.closePath(); g.fill();
      // Kabuk yarıkları
      g.strokeStyle = 'rgba(0,0,0,0.42)'; g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(-8, -50); g.quadraticCurveTo(-10, -30, -8, -8);
      g.moveTo(1, -52); g.quadraticCurveTo(3, -32, 1, -6);
      g.moveTo(9, -48); g.quadraticCurveTo(8, -30, 11, -10);
      g.stroke();
      g.strokeStyle = 'rgba(255,200,160,0.12)';
      g.beginPath(); g.moveTo(-11, -46); g.quadraticCurveTo(-12, -28, -11, -12); g.stroke();
      // Yosun + yozlaşma
      g.fillStyle = m.accent || '#4e7a2a';
      g.beginPath(); g.ellipse(-8, -46, 8, 3, -0.2, 0, TAU); g.fill();
      g.fillStyle = '#6fa043';
      g.beginPath(); g.ellipse(-10, -47, 4, 1.3, -0.2, 0, TAU); g.fill();

      // Yüz oyuğu
      g.fillStyle = '#120808';
      g.beginPath(); g.ellipse(-5, -42, 3.6, 4.6, 0.2, 0, TAU); g.ellipse(5, -42, 3.6, 4.6, -0.2, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(-6, -33); g.lineTo(-3, -30); g.lineTo(0, -33); g.lineTo(3, -30); g.lineTo(6, -33); g.lineTo(5, -28); g.lineTo(-5, -28); g.closePath(); g.fill();
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = '#e040fb';
      g.beginPath(); g.arc(-5, -42, 2.2, 0, TAU); g.arc(5, -42, 2.2, 0, TAU); g.fill();
      drawGlow(g, -5, -42, 11, '#d500f9', 0.9);
      drawGlow(g, 5, -42, 11, '#d500f9', 0.9);
      g.strokeStyle = 'rgba(224,64,251,0.8)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(-8, -26); g.lineTo(-4, -12); g.lineTo(2, -18); g.stroke();   // mor çatlak
      g.globalCompositeOperation = 'source-over';

      // Taç yaprakları
      const leaf = (cx, cy, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); };
      const sway = Math.sin(t * 1.6 + ph) * 1.2;
      leaf(-11 + sway, -56, 9, '#1c3a14'); leaf(10 + sway, -57, 10, '#1c3a14'); leaf(0 + sway, -64, 11, '#244a1a');
      leaf(-6 + sway, -60, 8, '#2d5a20'); leaf(7 + sway, -61, 7, '#31662a'); leaf(-14 + sway, -52, 5, '#2d5a20');
      leaf(-2 + sway, -67, 5, '#3f8031');
      g.fillStyle = 'rgba(180,60,220,0.35)';
      g.beginPath(); g.arc(8 + sway, -63, 4, 0, TAU); g.arc(-10 + sway, -58, 3, 0, TAU); g.fill();

      // Ön kol (saldırıda öne savrulur)
      const ax = 12 + armSwing * 14, ay = -16 + armSwing * 6;
      g.strokeStyle = '#4a2c20'; g.lineWidth = 8;
      g.beginPath(); g.moveTo(10, -42); g.quadraticCurveTo(24 + armSwing * 8, -32 - armSwing * 8, ax + 14, ay - armSwing * 10); g.stroke();
      g.strokeStyle = '#6b4535'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(10, -43); g.quadraticCurveTo(24 + armSwing * 8, -33 - armSwing * 8, ax + 14, ay - 1 - armSwing * 10); g.stroke();
      g.strokeStyle = '#3e2723'; g.lineWidth = 3;
      const hx = ax + 14, hy = ay - armSwing * 10;
      g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 6, hy + 5); g.moveTo(hx, hy); g.lineTo(hx + 7, hy - 1); g.moveTo(hx, hy); g.lineTo(hx + 4, hy - 6); g.stroke();
      leaf(hx - 2, hy - 4, 3.2, '#3f8031');

      // Spor parçacıkları
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const a = t * 0.9 + i * 1.7;
        drawGlow(g, Math.cos(a) * 18, -30 - ((t * 14 + i * 20) % 38), 4, '#d500f9', 0.7);
      }
      g.globalCompositeOperation = 'source-over';
    }

    // --- GÖLGE AVCISI: uçuşan hayalet ---
    paintWraith(g, m, t, face, atkT) {
      const u = m.radius / 15;
      const hover = 10 + Math.sin(t * 2.6 + m.walkPhase) * 3;
      g.scale(face * u, u);
      g.lineCap = 'round'; g.lineJoin = 'round';

      // Aura
      g.globalCompositeOperation = 'lighter';
      drawGlow(g, 0, -hover - 22, 40, m.accent || '#7c4dff', 0.28);
      // Sürüklenen hayalet kıvrımları
      for (let i = 0; i < 3; i++) {
        const o = (i - 1) * 8;
        g.strokeStyle = `rgba(179,136,255,${0.28 - i * 0.04})`; g.lineWidth = 3 - i * 0.5;
        g.beginPath();
        g.moveTo(o, -hover - 4);
        for (let k = 1; k <= 6; k++) g.lineTo(o - k * 3 * (face * 0 + 1) + Math.sin(t * 5 + k * 0.9 + i) * 4, -hover - 4 + k * 4 + hover * 0.2 * k * 0.3);
        g.stroke();
      }
      g.globalCompositeOperation = 'source-over';

      // Pelerin gövdesi (yırtık etek, dalgalanan)
      const w1 = Math.sin(t * 6) * 2.5, w2 = Math.sin(t * 6 + 1.5) * 2.5, w3 = Math.sin(t * 6 + 3) * 2.5;
      let gr = g.createLinearGradient(0, -hover - 50, 0, -hover);
      const cloak = m.color || '#4a2fa0';
      gr.addColorStop(0, shade(cloak, 0.12)); gr.addColorStop(0.55, cloak); gr.addColorStop(1, shade(cloak, -0.55));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(0, -hover - 50);
      g.quadraticCurveTo(-13, -hover - 42, -14, -hover - 22);
      g.quadraticCurveTo(-17, -hover - 8, -16, -hover + 2 + w1);
      g.lineTo(-10, -hover - 3 + w2); g.lineTo(-6, -hover + 5 + w3); g.lineTo(-1, -hover - 2 + w1);
      g.lineTo(4, -hover + 6 + w2); g.lineTo(9, -hover - 2 + w3); g.lineTo(16, -hover + 3 + w1);
      g.quadraticCurveTo(17, -hover - 8, 14, -hover - 22);
      g.quadraticCurveTo(13, -hover - 42, 0, -hover - 50);
      g.closePath(); g.fill();
      // Kenar ışığı
      g.strokeStyle = 'rgba(179,136,255,0.55)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(0, -hover - 50); g.quadraticCurveTo(-13, -hover - 42, -14, -hover - 22); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(-4, -hover - 30); g.quadraticCurveTo(-6, -hover - 16, -5, -hover - 2); g.moveTo(5, -hover - 30); g.quadraticCurveTo(6, -hover - 16, 6, -hover - 2); g.stroke();

      // Pençeli iskelet kollar (saldırıda uzanır)
      const reach = atkT > 0.75 ? easeOut((1 - atkT) / 0.25) : 0;
      g.strokeStyle = '#d1c4e9'; g.lineWidth = 2;
      const armY = -hover - 28;
      g.beginPath();
      g.moveTo(8, armY); g.quadraticCurveTo(16 + reach * 6, armY + 4, 20 + reach * 10, armY + 2 + Math.sin(t * 4) * 1.5);
      g.moveTo(-8, armY + 2); g.quadraticCurveTo(-14, armY + 6, -17, armY + 8 + Math.sin(t * 4 + 1) * 1.5);
      g.stroke();
      g.lineWidth = 1.2;
      const hx = 20 + reach * 10, hy = armY + 2;
      g.beginPath();
      g.moveTo(hx, hy); g.lineTo(hx + 6, hy - 3); g.moveTo(hx, hy); g.lineTo(hx + 7, hy + 1); g.moveTo(hx, hy); g.lineTo(hx + 5, hy + 5);
      g.stroke();

      // Başlık boşluğu
      gr = g.createRadialGradient(0, -hover - 36, 1, 0, -hover - 36, 10);
      gr.addColorStop(0, '#000000'); gr.addColorStop(1, '#0d0525');
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(0, -hover - 36, 8, 10, 0, 0, TAU); g.fill();

      // Kırmızı parlayan gözler
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = '#ff1744';
      g.beginPath(); g.ellipse(-3.2, -hover - 37, 1.8, 1.1, 0.3, 0, TAU); g.ellipse(3.2, -hover - 37, 1.8, 1.1, -0.3, 0, TAU); g.fill();
      drawGlow(g, -3.2, -hover - 37, 9, '#ff1744', 0.95);
      drawGlow(g, 3.2, -hover - 37, 9, '#ff1744', 0.95);
      g.globalCompositeOperation = 'source-over';
    }

    // --- CANAVAR (kurt/dragon benzeri dört ayaklı) ---
    paintBeast(g, m, t, face, atkT) {
      const u = m.radius / 17;
      const ph = m.walkPhase;
      const sw = Math.sin(ph);
      const body = m.color || '#93c5fd';
      const accent = m.accent || '#e0f2fe';
      g.scale(face * u, u);
      g.translate(0, -Math.abs(sw) * 1.4);
      g.lineCap = 'round'; g.lineJoin = 'round';

      // Kuyruk
      g.strokeStyle = shade(body, -0.2); g.lineWidth = 3.2;
      g.beginPath(); g.moveTo(-12, -16);
      g.quadraticCurveTo(-24, -18 + Math.sin(t * 6) * 3, -28, -26 + Math.sin(t * 6 + 1) * 4);
      g.stroke();

      // Arka bacaklar
      g.strokeStyle = shade(body, -0.3); g.lineWidth = 4;
      g.beginPath();
      g.moveTo(-9, -12); g.lineTo(-11 + sw * 3, 0);
      g.moveTo(7, -12); g.lineTo(9 - sw * 3, 0);
      g.stroke();

      // Gövde
      let gr = g.createRadialGradient(-2, -22, 2, 0, -18, 16);
      gr.addColorStop(0, shade(body, 0.15)); gr.addColorStop(1, shade(body, -0.35));
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(-1, -17, 14, 9, -0.08, 0, TAU); g.fill();

      // Sırt dikenleri
      g.fillStyle = accent;
      for (let i = 0; i < 4; i++) {
        const bx = -9 + i * 6;
        g.beginPath(); g.moveTo(bx - 2, -23); g.lineTo(bx, -29 - (i % 2) * 2); g.lineTo(bx + 2, -23); g.closePath(); g.fill();
      }

      // Ön bacaklar + pençeler
      g.strokeStyle = shade(body, -0.15); g.lineWidth = 4.4;
      const lunge = atkT > 0.75 ? (1 - atkT) / 0.25 : 0;
      g.beginPath();
      g.moveTo(-6, -15); g.lineTo(-7 - sw * 3, -1);
      g.moveTo(8, -16); g.lineTo(7 + sw * 3 - lunge * 5, -1);
      g.stroke();
      g.strokeStyle = '#f5f5f5'; g.lineWidth = 1.2;
      g.beginPath();
      for (const px of [-7 - sw * 3, 7 + sw * 3]) {
        g.moveTo(px - 2, -1); g.lineTo(px - 3.4, 1);
        g.moveTo(px, -1); g.lineTo(px, 1.4);
        g.moveTo(px + 2, -1); g.lineTo(px + 3.4, 1);
      }
      g.stroke();

      // Boyun + kafa
      g.strokeStyle = shade(body, -0.12); g.lineWidth = 9;
      g.beginPath(); g.moveTo(8, -20); g.quadraticCurveTo(16, -24, 20, -27); g.stroke();
      gr = g.createRadialGradient(20, -30, 1, 21, -28, 9);
      gr.addColorStop(0, shade(body, 0.22)); gr.addColorStop(1, shade(body, -0.25));
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(21, -28, 8, 6.2, 0.15, 0, TAU); g.fill();
      // Kulaklar
      g.fillStyle = shade(body, -0.35);
      g.beginPath(); g.moveTo(17, -33); g.lineTo(16, -39); g.lineTo(21, -35); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(24, -33); g.lineTo(26, -39); g.lineTo(27, -33); g.closePath(); g.fill();
      // Burun
      g.fillStyle = '#1b1b1b';
      g.beginPath(); g.arc(28.5, -27, 1.8, 0, TAU); g.fill();
      // Gözler
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = accent;
      g.beginPath(); g.arc(19, -30, 1.8, 0, TAU); g.arc(24.5, -29.6, 1.6, 0, TAU); g.fill();
      drawGlow(g, 19, -30, 8, accent, 0.9);
      g.globalCompositeOperation = 'source-over';
      // Ağız + dişler
      g.strokeStyle = '#5d4037'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(26, -24.5); g.lineTo(21, -23.6); g.stroke();
      g.fillStyle = '#fffde7';
      g.beginPath(); g.moveTo(25, -25.2); g.lineTo(24, -22.8); g.lineTo(23, -25.2); g.fill();
    }

    // --- ÖRÜMCEK: sekiz bacak, çoklu göz, damla abdomen ---
    paintSpider(g, m, t, face, atkT) {
      const u = m.radius / 17;
      const ph = m.walkPhase;
      const body = m.color || '#3f6212';
      const accent = m.accent || '#bef264';
      g.scale(face * u, u);
      g.translate(0, -Math.abs(Math.sin(ph)) * 1.1);
      g.lineCap = 'round';

      // Bacaklar (4 çift)
      g.strokeStyle = shade(body, -0.4); g.lineWidth = 2.4;
      for (let i = 0; i < 4; i++) {
        const off = -10 + i * 6;
        const lift = Math.sin(ph + i * 1.3) * 5;
        g.beginPath();
        g.moveTo(off, -16);
        g.quadraticCurveTo(off - 12, -22 - lift, off - 19, -6 + lift * 0.4);
        g.moveTo(off + 4, -16);
        g.quadraticCurveTo(off + 14, -20 + lift, off + 21, -5 - lift * 0.4);
        g.stroke();
      }

      // Abdomen
      let gr = g.createRadialGradient(-6, -22, 2, -6, -20, 13);
      gr.addColorStop(0, shade(body, 0.18)); gr.addColorStop(1, shade(body, -0.42));
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(-6, -19, 12, 9.5, -0.1, 0, TAU); g.fill();
      // Abdomen deseni
      g.fillStyle = accent;
      g.globalAlpha = 0.7;
      g.beginPath(); g.ellipse(-6, -21, 5, 4, 0, 0, TAU); g.fill();
      g.globalAlpha = 1;

      // Göğüs + kafa
      gr = g.createRadialGradient(10, -18, 1, 11, -17, 8);
      gr.addColorStop(0, shade(body, 0.24)); gr.addColorStop(1, shade(body, -0.3));
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(9, -17, 8, 7, 0.15, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(15.5, -16.5, 4.5, 4, 0, 0, TAU); g.fill();

      // Gözler (4 çift kırmızı/mavi parıltı)
      g.globalCompositeOperation = 'lighter';
      const eyeCol = accent;
      g.fillStyle = eyeCol;
      [[14, -19], [17, -18.5], [15.5, -16], [18, -16]].forEach(([ex, ey]) => {
        g.beginPath(); g.arc(ex, ey, 1.1, 0, TAU); g.fill();
      });
      drawGlow(g, 16, -18, 10, eyeCol, 0.9);
      g.globalCompositeOperation = 'source-over';

      // Zehir damlaları (ağızdan)
      if (atkT > 0.6) {
        g.fillStyle = accent;
        const dy = (1 - atkT) * 10;
        g.beginPath(); g.ellipse(20, -10 + dy, 1.6, 2.4, 0, 0, TAU); g.fill();
      }
    }

    // --- GOLEM: blok gövde, parlayan çatlaklar ---
    paintGolem(g, m, t, face, atkT) {
      const u = m.radius / 30;
      const ph = m.walkPhase;
      const sw = Math.sin(ph);
      const rock = m.color || '#7f1d1d';
      const accent = m.accent || '#f97316';
      g.scale(face * u, u);
      g.translate(0, -Math.abs(sw) * 1.8);
      g.lineJoin = 'round';
      const lunge = atkT > 0.72 ? (1 - atkT) / 0.28 : 0;

      // Bacaklar (blok)
      g.fillStyle = shade(rock, -0.32);
      g.fillRect(-14, -16, 10, 17);
      g.fillRect(6, -16, 10, 17);
      g.fillStyle = shade(rock, -0.5);
      g.fillRect(-16, -2, 13, 4); g.fillRect(5, -2, 13, 4);

      // Gövde
      const gr = g.createLinearGradient(-22, -60, 22, -10);
      gr.addColorStop(0, shade(rock, 0.2)); gr.addColorStop(0.5, rock); gr.addColorStop(1, shade(rock, -0.42));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-20, -14); g.lineTo(-23, -48); g.lineTo(-12, -60); g.lineTo(12, -60);
      g.lineTo(23, -48); g.lineTo(20, -14); g.lineTo(10, -10); g.lineTo(-10, -10);
      g.closePath(); g.fill();

      // Çatlaklar (accent)
      g.strokeStyle = accent; g.lineWidth = 2;
      g.globalCompositeOperation = 'lighter';
      g.beginPath();
      g.moveTo(-10, -54); g.lineTo(-4, -42); g.lineTo(-9, -32); g.lineTo(-3, -20);
      g.moveTo(10, -48); g.lineTo(5, -36); g.lineTo(12, -26);
      g.stroke();
      // Göğüs çekirdeği
      drawGlow(g, 0, -38, 14, accent, 0.9);
      g.fillStyle = accent;
      g.beginPath(); g.arc(0, -38, 4 + Math.sin(t * 4) * 1, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';

      // Kollar (blok, sallanır)
      g.fillStyle = shade(rock, -0.2);
      g.save();
      g.translate(-20, -50); g.rotate(0.3 + sw * 0.12 + lunge * 0.5);
      g.fillRect(-7, 0, 9, 26); g.restore();
      g.save();
      g.translate(20, -50); g.rotate(-0.3 - sw * 0.12 - lunge * 0.6);
      g.fillRect(-2, 0, 9, 26);
      g.fillStyle = shade(rock, -0.45); g.fillRect(-4, 22, 13, 9);
      g.restore();

      // Kafa (küçük, gömülü)
      g.fillStyle = shade(rock, 0.08);
      g.beginPath(); g.ellipse(0, -62, 11, 8, 0, 0, TAU); g.fill();
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = accent;
      g.beginPath(); g.ellipse(-4, -63, 2, 1.3, 0.2, 0, TAU); g.ellipse(4, -63, 2, 1.3, -0.2, 0, TAU); g.fill();
      drawGlow(g, 0, -63, 9, accent, 0.8);
      g.globalCompositeOperation = 'source-over';
    }

    // --- ŞÖVALYE: zırhlı humanoid, kılıç/kalkan, pelerin ---
    // Okçu düşman: kapüşonlu, yaylı, sadaklı.
    paintArcher(g, m, t, face, atkT) {
      const u = m.radius / 16;
      const ph = m.walkPhase;
      const sw = Math.sin(ph);
      const cloth = m.color || '#7dd3fc';
      const accent = m.accent || '#f0f9ff';
      g.scale(face * u, u);
      g.translate(0, -Math.abs(sw) * 1.4);
      g.lineCap = 'round'; g.lineJoin = 'round';
      const draw = atkT > 0.65 ? (1 - atkT) / 0.35 : 0;

      // Bacaklar
      g.strokeStyle = shade(cloth, -0.38); g.lineWidth = 3.6;
      g.beginPath();
      g.moveTo(-3, -14); g.lineTo(-4 + sw * 3, -1);
      g.moveTo(3, -14); g.lineTo(4 - sw * 3, -1);
      g.stroke();
      g.fillStyle = shade(cloth, -0.5);
      g.beginPath(); g.ellipse(-4 + sw * 3, 0, 3, 1.6, 0, 0, TAU); g.ellipse(4 - sw * 3, 0, 3, 1.6, 0, 0, TAU); g.fill();

      // Pelerin
      g.fillStyle = shade(cloth, -0.28);
      g.beginPath();
      g.moveTo(-7, -31); g.quadraticCurveTo(-13, -16, -9 + Math.sin(t * 4) * 1.5, -3);
      g.lineTo(3, -5); g.quadraticCurveTo(-2, -20, -1, -31); g.closePath(); g.fill();

      // Gövde
      const gr = g.createLinearGradient(-7, -30, 7, -12);
      gr.addColorStop(0, shade(cloth, 0.25)); gr.addColorStop(1, shade(cloth, -0.35));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-6, -30); g.lineTo(-8, -18); g.lineTo(-4, -11); g.lineTo(4, -11);
      g.lineTo(8, -18); g.lineTo(6, -30); g.closePath(); g.fill();

      // Sadak
      g.save(); g.rotate(-0.35);
      g.fillStyle = '#6b4f3a'; g.fillRect(4, -28, 4, 13);
      g.fillStyle = accent; g.fillRect(4, -31, 4, 4);
      g.restore();

      // Baş + kapüşon
      g.fillStyle = shade(cloth, -0.18);
      g.beginPath(); g.arc(0, -36, 6.2, 0, TAU); g.fill();
      g.fillStyle = '#241c14';
      g.beginPath(); g.arc(0, -36, 4.2, 0, TAU); g.fill();
      g.fillStyle = accent;
      g.beginPath(); g.arc(1.7, -36.5, 1.4, 0, TAU); g.fill();

      // Yay (hedefe bakar; atışta gerilir)
      g.save();
      g.translate(9, -24);
      g.rotate(-0.15 - draw * 0.45);
      g.strokeStyle = '#8d6e63'; g.lineWidth = 2.2;
      g.beginPath(); g.arc(0, 0, 11, -1.1, 1.1); g.stroke();
      g.strokeStyle = accent; g.lineWidth = 1;
      g.beginPath(); g.moveTo(4.6, -9.6); g.lineTo(4.6 + draw * 6, 0); g.lineTo(4.6, 9.6); g.stroke();
      g.restore();

      // Atış anı: parlama
      if (atkT > 0.72) {
        const a = (atkT - 0.72) / 0.28;
        glowAdd(g, 11, -24, 12 * a, accent, a * 0.8);
      }
    }

    paintKnight(g, m, t, face, atkT) {
      const u = m.radius / 19;
      const ph = m.walkPhase;
      const sw = Math.sin(ph);
      const armor = m.color || '#3f3f46';
      const accent = m.accent || '#a78bfa';
      g.scale(face * u, u);
      g.translate(0, -Math.abs(sw) * 1.6);
      g.lineCap = 'round'; g.lineJoin = 'round';
      const lunge = atkT > 0.72 ? (1 - atkT) / 0.28 : 0;

      // Pelerin
      g.fillStyle = shade(armor, -0.45);
      g.beginPath();
      g.moveTo(-8, -38); g.quadraticCurveTo(-16, -20, -12 + Math.sin(t * 5) * 2, -4);
      g.lineTo(4, -6); g.quadraticCurveTo(-2, -24, -2, -38); g.closePath(); g.fill();

      // Bacaklar
      g.strokeStyle = shade(armor, -0.28); g.lineWidth = 4.6;
      g.beginPath();
      g.moveTo(-4, -16); g.lineTo(-5 + sw * 3, -1);
      g.moveTo(4, -16); g.lineTo(5 - sw * 3, -1);
      g.stroke();
      g.fillStyle = shade(armor, -0.5);
      g.beginPath(); g.ellipse(-5 + sw * 3, 0, 3.4, 1.8, 0, 0, TAU); g.ellipse(5 - sw * 3, 0, 3.4, 1.8, 0, 0, TAU); g.fill();

      // Gövde zırh
      const gr = g.createLinearGradient(-9, -36, 9, -14);
      gr.addColorStop(0, shade(armor, 0.28)); gr.addColorStop(0.5, armor); gr.addColorStop(1, shade(armor, -0.45));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-8, -34); g.lineTo(-10, -22); g.lineTo(-7, -13); g.lineTo(7, -13);
      g.lineTo(10, -22); g.lineTo(8, -34); g.lineTo(0, -37); g.closePath(); g.fill();
      // Göğüs plakası + accent çizgisi
      g.strokeStyle = accent; g.lineWidth = 1.2; g.globalAlpha = 0.85;
      g.beginPath(); g.moveTo(0, -34); g.lineTo(0, -15); g.stroke();
      g.beginPath(); g.moveTo(-6, -27); g.lineTo(6, -27); g.stroke();
      g.globalAlpha = 1;

      // Omuzluklar
      g.fillStyle = shade(armor, 0.12);
      g.beginPath(); g.ellipse(-9, -33, 5.2, 4, 0.3, 0, TAU); g.ellipse(9, -33, 5.2, 4, -0.3, 0, TAU); g.fill();

      // Kafa + miğfer
      g.fillStyle = shade(armor, 0.05);
      g.beginPath(); g.ellipse(0, -42, 6.4, 6.8, 0, 0, TAU); g.fill();
      g.fillStyle = shade(armor, -0.35);
      g.beginPath(); g.moveTo(-6, -44); g.lineTo(0, -50); g.lineTo(6, -44); g.closePath(); g.fill();
      // Vizör yarığı + parlayan gözler
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = accent;
      g.beginPath(); g.ellipse(-2.4, -42, 1.6, 0.9, 0.15, 0, TAU); g.ellipse(2.4, -42, 1.6, 0.9, -0.15, 0, TAU); g.fill();
      drawGlow(g, 0, -42, 9, accent, 0.85);
      g.globalCompositeOperation = 'source-over';

      // Kalkan (sol) + kılıç (sağ)
      g.fillStyle = shade(armor, -0.15);
      g.beginPath(); g.ellipse(-13, -25, 5.4, 7.4, -0.12, 0, TAU); g.fill();
      g.strokeStyle = accent; g.lineWidth = 1.3;
      g.beginPath(); g.ellipse(-13, -25, 5.4, 7.4, -0.12, 0, TAU); g.stroke();

      const swordA = -0.9 + sw * 0.08 - lunge * 0.9;
      g.save();
      g.translate(12, -30); g.rotate(swordA);
      g.strokeStyle = '#cfd8dc'; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26); g.stroke();
      g.strokeStyle = '#8d6e63'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-4, 0); g.lineTo(4, 0); g.stroke();
      g.fillStyle = accent;
      g.beginPath(); g.arc(0, -28, 1.6, 0, TAU); g.fill();
      g.restore();
    }

    // ---------------- MERMİ & KILIÇ DALGASI ----------------
    renderProjectilesAndSlashes(ctx) {
      // Mermiler
      this.projectiles.forEach((p) => {
        const gz = this.groundZAt(p.x, p.y);
        const { x, y } = this.iso(p.x, p.y, gz + 15);
        if (x < -80 || x > this.width + 80 || y < -80 || y > this.height + 80) return;
        const sa = worldAngleToScreen(Math.atan2(p.vy, p.vx));
        const sh = this.iso(p.x, p.y, gz);

        ctx.save();
        // zemin gölgesi
        drawGlowEllipse(ctx, sh.x, sh.y, 10, 5, '#000000', 0.4);

        ctx.globalCompositeOperation = 'lighter';
        // neon iz
        if (p.trail && p.trail.length > 1) {
          ctx.lineCap = 'round';
          for (let i = 1; i < p.trail.length; i++) {
            const a = this.iso(p.trail[i - 1].x, p.trail[i - 1].y, gz + 15);
            const b = this.iso(p.trail[i].x, p.trail[i].y, gz + 15);
            const f = i / p.trail.length;
            ctx.strokeStyle = rgba(p.color, f * 0.7);
            ctx.lineWidth = (p.type === 'magic_orb' ? 9 : 4) * f;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }

        if (p.type === 'arrow') {
          ctx.translate(x, y); ctx.rotate(sa);
          ctx.strokeStyle = '#e8f5e9'; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(8, 0); ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(7, -3); ctx.lineTo(7, 3); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-18, -3); ctx.moveTo(-14, 0); ctx.lineTo(-18, 3); ctx.moveTo(-11, 0); ctx.lineTo(-15, -3); ctx.moveTo(-11, 0); ctx.lineTo(-15, 3); ctx.stroke();
          drawGlow(ctx, 8, 0, 14, p.color, 0.8);
        } else if (p.type === 'monster_orb') {
          const pu = 1 + 0.18 * Math.sin(this.time * 20);
          drawGlow(ctx, x, y, 26 * pu, p.color, 0.85);
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x, y, p.radius, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.arc(x, y, p.radius * 0.5, 0, TAU); ctx.fill();
        } else if (p.type === 'magic_orb') {
          const pu = 1 + 0.12 * Math.sin(this.time * 18);
          drawGlow(ctx, x, y, 30 * pu, p.color, 0.8);
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x, y, p.radius * 0.9, 0, TAU); ctx.fill();
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, p.radius * 0.45, 0, TAU); ctx.fill();
          for (let i = 0; i < 3; i++) {
            const a = this.time * 10 + i * 2.09;
            drawGlow(ctx, x + Math.cos(a) * 11, y + Math.sin(a) * 6, 5, '#e1bee7', 0.9);
          }
        } else if (p.type === 'dagger') {
          ctx.translate(x, y); ctx.rotate(sa + this.time * 22);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-3, -2.6); ctx.lineTo(-6, 0); ctx.lineTo(-3, 2.6); ctx.closePath(); ctx.fill();
          drawGlow(ctx, 0, 0, 16, p.color, 0.85);
        } else {
          ctx.translate(x, y); ctx.rotate(sa);
          ctx.fillStyle = '#fff3e0';
          ctx.beginPath(); ctx.moveTo(11, 0); ctx.quadraticCurveTo(0, -7, -8, -2); ctx.quadraticCurveTo(0, -2, 11, 0); ctx.fill();
          drawGlow(ctx, 0, 0, 20, p.color, 0.9);
        }
        ctx.restore();
      });

      // Kılıç dalgaları (dünya uzayında hesaplanıp projekte edilir: hitbox ile birebir)
      this.slashes.forEach((s) => {
        const prog = 1 - s.timer / s.duration;
        const dir = s.dir || 1;
        const half = s.arc / 2;
        const lead = clamp(prog * 1.7, 0, 1);
        const tail = clamp((prog - 0.2) * 1.4, 0, 1);
        const a0 = s.angle - half * dir + s.arc * dir * tail;
        const a1 = s.angle - half * dir + s.arc * dir * lead;
        const N = 16;
        const fade = 1 - smooth(0.55, 1, prog);
        const thick = s.radius * 0.28;
        const z = 14;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';

        const outer = [], inner = [];
        for (let i = 0; i <= N; i++) {
          const f = i / N;
          const a = lerp(a0, a1, f);
          const th2 = thick * Math.sin(Math.PI * clamp(f * 0.85 + 0.15, 0, 1));
          outer.push(this.iso(s.x + Math.cos(a) * s.radius, s.y + Math.sin(a) * s.radius, z));
          inner.push(this.iso(s.x + Math.cos(a) * (s.radius - th2), s.y + Math.sin(a) * (s.radius - th2), z));
        }
        // dolgu
        ctx.beginPath();
        outer.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        for (let i = N; i >= 0; i--) ctx.lineTo(inner[i].x, inner[i].y);
        ctx.closePath();
        ctx.fillStyle = rgba(s.color, 0.55 * fade);
        ctx.fill();
        // geniş neon çizgi
        ctx.beginPath();
        outer.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.strokeStyle = rgba(s.color, 0.55 * fade);
        ctx.lineWidth = 9 * (1 - prog * 0.6);
        ctx.stroke();
        // sıcak beyaz çekirdek
        ctx.strokeStyle = rgba('#ffffff', 0.95 * fade);
        ctx.lineWidth = 3 * (1 - prog * 0.6);
        ctx.stroke();
        // ön uçta parlama
        const tipP = outer[outer.length - 1];
        drawGlow(ctx, tipP.x, tipP.y, 26, s.color, 0.85 * fade);
        drawGlow(ctx, tipP.x, tipP.y, 9, '#ffffff', 0.9 * fade);
        ctx.restore();
      });
    }

    // ---------------- PARÇACIKLAR & VURUŞ PATLAMALARI ----------------
    // Mana rengi parçacık şekilleri: her efekt kendi siluetiyle çizilir.
    drawShapeParticle(ctx, x, y, p) {
      const shape = p.shape;
      const s = Math.max(1.5, p.size);
      const a = p.alpha;
      const rot = (p.spin || 0) + this.time * 2.4;
      ctx.save();
      ctx.translate(x, y);
      if (shape === 'bat') {
        // Yarasa silueti: iki kanat + gövde (additive, kızıl parıltı)
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a;
        ctx.rotate(Math.sin(rot * 3) * 0.25);
        drawGlow(ctx, 0, 0, s * 3, p.color, a * 0.7);
        ctx.fillStyle = p.color;
        const wing = s * 2.2, flap = 0.6 + 0.4 * Math.abs(Math.sin(rot * 6));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-wing * 0.5, -wing * 0.6 * flap, -wing, -wing * 0.15 * flap);
        ctx.quadraticCurveTo(-wing * 0.5, 0, 0, s * 0.5);
        ctx.quadraticCurveTo(wing * 0.5, 0, wing, -wing * 0.15 * flap);
        ctx.quadraticCurveTo(wing * 0.5, -wing * 0.6 * flap, 0, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, s * 0.5, 0, TAU); ctx.fill();
      } else if (shape === 'star') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a;
        drawGlow(ctx, 0, 0, s * 3.4, p.color, a * 0.85);
        ctx.fillStyle = '#ffffff';
        ctx.rotate(rot);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * TAU;
          const r = i % 2 === 0 ? s * 1.8 : s * 0.6;
          const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      } else if (shape === 'bubble') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.stroke();
        ctx.globalAlpha = a * 0.35;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, s * 0.8, 0, TAU); ctx.fill();
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.3, s * 0.25, 0, TAU); ctx.fill();
      } else if (shape === 'leaf') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = a * 0.9;
        ctx.rotate(rot);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.ellipse(0, 0, s * 1.6, s * 0.7, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-s * 1.6, 0); ctx.lineTo(s * 1.6, 0); ctx.stroke();
      } else if (shape === 'void') {
        // Zifiri kara küre + mor çerçeve: ışığı yutar.
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = a;
        const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.5);
        gr.addColorStop(0, '#000000');
        gr.addColorStop(0.7, '#000000');
        gr.addColorStop(1, 'rgba(120,0,180,0.0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(0, 0, s * 1.5, 0, TAU); ctx.fill();
        ctx.globalAlpha = a * 0.8;
        ctx.strokeStyle = p.color || '#7c4dff';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, s * 1.35, 0, TAU); ctx.stroke();
      } else if (shape === 'glitch') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = a * 0.9;
        for (let i = 0; i < 4; i++) {
          const off = ((i % 2) * 2 - 1) * s * (0.4 + 0.6 * Math.random());
          ctx.fillStyle = i % 2 === 0 ? p.color : (p.secondary || '#ff00e6');
          ctx.fillRect(-s * 1.4 + off, (i - 1.5) * s * 0.7, s * 2.8, s * 0.45);
        }
      } else if (shape === 'smoke') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = a * 0.35;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill();
        ctx.globalAlpha = a * 0.2;
        ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.4, s * 0.7, 0, TAU); ctx.fill();
      } else if (shape === 'shard') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a;
        ctx.rotate(rot);
        drawGlow(ctx, 0, 0, s * 2.6, p.color, a * 0.7);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.6); ctx.lineTo(s * 0.7, 0); ctx.lineTo(0, s * 1.6); ctx.lineTo(-s * 0.7, 0);
        ctx.closePath(); ctx.fill();
      } else {
        // bilinmeyen şekil: basit daire
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * 0.8;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }

    renderParticles(ctx) {
      ctx.save();
      // 1) Katı parçacıklar (toz, kan damlaları)
      for (const p of this.particles) {
        if (p.additive || p.shape) continue;
        const { x, y } = this.iso(p.wx, p.wy, p.wz);
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, p.size), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2) Parlayan neon parçacıklar
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.particles) {
        if (!p.additive || p.shape) continue;
        const { x, y } = this.iso(p.wx, p.wy, p.wz);
        ctx.globalAlpha = p.alpha;
        drawGlow(ctx, x, y, p.size * 3.2, p.color, 0.9);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.4, p.size * 0.38), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2b) Mana rengi şekilleri (yarasa, yıldız, baloncuk, yaprak, void, glitch, duman, kristal)
      for (const p of this.particles) {
        if (!p.shape) continue;
        const { x, y } = this.iso(p.wx, p.wy, p.wz);
        this.drawShapeParticle(ctx, x, y, p);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      // 3) Vuruş patlamaları: halka + yıldız çizgileri
      for (const im of this.impacts) {
        const { x, y } = this.iso(im.wx, im.wy, im.wz);
        const prog = im.timer / im.duration;
        const t = 1 - prog;
        const R = (im.big ? 34 : 22) * easeOut(t);
        ctx.globalAlpha = prog;
        drawGlow(ctx, x, y, R * 1.8, im.color, 0.8);
        ctx.strokeStyle = im.color; ctx.lineWidth = 3 * prog + 0.5;
        ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
        const rand = mulberry32(Math.floor(im.seed * 1000));
        const spikes = im.big ? 10 : 6;
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * TAU + rand() * 0.5;
          const r0 = R * 0.35, r1 = R * (1.1 + rand() * 0.6);
          ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7);
          ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.7);
        }
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, 6 * prog + 1, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 4) Ambiyans: ateş böcekleri + yapraklar
      this.ambientMotes.forEach((m) => {
        const { x, y } = this.iso(m.x, m.y, m.z);
        if (x < -20 || x > this.width + 20 || y < -20 || y > this.height + 20) return;
        if (m.leaf) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(this.time * 1.5 + m.phase);
          ctx.globalAlpha = m.alpha * 0.8;
          ctx.fillStyle = m.color;
          ctx.beginPath(); ctx.ellipse(0, 0, m.size, m.size * 0.45, 0, 0, TAU); ctx.fill();
          ctx.restore();
        } else if (m.snow) {
          // Kar tanesi: parlak hale yerine küçük, net bir nokta (daha ucuz + temiz).
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = m.alpha * 0.85;
          ctx.fillStyle = '#f4fbff';
          ctx.beginPath(); ctx.arc(x, y, Math.max(1, m.size * 0.62), 0, TAU); ctx.fill();
        } else {
          ctx.globalCompositeOperation = 'lighter';
          const fl = 0.55 + 0.45 * Math.sin(this.time * 3 + m.phase * 2);
          ctx.globalAlpha = m.alpha * fl;
          drawGlow(ctx, x, y, m.size * 5, m.color, 0.8);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(x, y, m.size * 0.45, 0, TAU); ctx.fill();
        }
      });
      ctx.restore();
    }

    // ---------------- HASAR SAYILARI ----------------
    renderDamageNumbers(ctx) {
      this.damageNumbers.forEach((dn) => {
        const p = this.iso(dn.wx, dn.wy, dn.z);
        const pop = 1 + Math.max(0, 1 - dn.age / 0.14) * 0.7;
        ctx.save();
        ctx.translate(p.x + dn.ox, p.y);
        ctx.scale(dn.scale * pop, dn.scale * pop);
        ctx.globalAlpha = dn.alpha;
        ctx.font = dn.isCrit ? '900 20px Cinzel, Georgia, serif' : 'bold 15px Cinzel, Inter, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0,0,0,0.95)';
        ctx.lineWidth = dn.isCrit ? 5 : 4;
        ctx.strokeText(dn.text, 0, 0);
        if (dn.isCrit) {
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, 0, 0, 40, '#ffb300', 0.35);
          ctx.globalCompositeOperation = 'source-over';
          const gr = ctx.createLinearGradient(0, -10, 0, 10);
          gr.addColorStop(0, '#fff9c4'); gr.addColorStop(1, '#ffb300');
          ctx.fillStyle = gr;
        } else ctx.fillStyle = dn.color;
        ctx.fillText(dn.text, 0, 0);
        ctx.restore();
      });
    }

    // ---------------- VİNYET + HASAR UYARISI ----------------
    renderAtmosphericVignette(ctx) {
      const cx = this.width / 2, cy = this.height / 2;
      const key = this.width + 'x' + this.height;
      if (this._vigKey !== key || !this._vigGrad) {
        this._vigKey = key;
        const vg = ctx.createRadialGradient(cx, cy, Math.min(this.width, this.height) * 0.42, cx, cy, Math.max(this.width, this.height) * 0.78);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(0.7, 'rgba(0,0,0,0.06)');
        vg.addColorStop(1, 'rgba(0,0,0,0.20)');
        this._vigGrad = vg;
      }
      ctx.fillStyle = this._vigGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      if (this.hurt > 0) {
        const a = clamp(this.hurt / 0.35, 0, 1) * 0.55;
        const hg = ctx.createRadialGradient(cx, cy, Math.min(this.width, this.height) * 0.3, cx, cy, Math.max(this.width, this.height) * 0.75);
        hg.addColorStop(0, 'rgba(180,0,0,0)');
        hg.addColorStop(1, `rgba(220,20,20,${a.toFixed(3)})`);
        ctx.fillStyle = hg;
        ctx.fillRect(0, 0, this.width, this.height);
      }
    }

    // ---------------- NİŞANGAH ----------------
    renderWorldOverlay(ctx) {
      // Nişangah, gerçek nişan noktasını göstersin (zoom dahil).
      const ap = this.aimPoint();
      const s = this.iso(ap.x, ap.y, 0);
      const z = this.zoom || 1;
      const cxw = this.width / 2, cyw = this.height / 2;
      const mx = cxw + (s.x - cxw) * z, my = cyw + (s.y - cyw) * z;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(this.time * 0.8);
      ctx.strokeStyle = 'rgba(255,224,130,0.9)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(0, 0, 9, i * (Math.PI / 2) + 0.25, i * (Math.PI / 2) + Math.PI / 2 - 0.25); ctx.stroke();
      }
      ctx.rotate(-this.time * 0.8);
      ctx.beginPath();
      ctx.moveTo(-15, 0); ctx.lineTo(-11, 0); ctx.moveTo(11, 0); ctx.lineTo(15, 0);
      ctx.moveTo(0, -15); ctx.lineTo(0, -11); ctx.moveTo(0, 11); ctx.lineTo(0, 15);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, TAU); ctx.fill();
      ctx.restore();
    }

    // ======================================================================
    // DÖNGÜ
    // ======================================================================
    loop(timestamp) {
      if (!this.isRunning) return;
      // Mobil: kare hızı üst sınırı (~45 FPS). Dokunmatik cihazlarda ısınma ve
      // pil tüketimini ciddi biçimde düşürür, akıcılık hissi korunur.
      if (this.isTouch && this._lastFrameTs && (timestamp - this._lastFrameTs) < 22) {
        requestAnimationFrame(this.loop);
        return;
      }
      this._lastFrameTs = timestamp;
      const raw = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0;
      try {
        const dt = Math.min(raw, 0.1);
        this.lastTime = timestamp;
        // Arayüz menüsü açıkken (seyahat taşı / köy menüsü) dünya donar:
        // canavarlar ve oyuncu hareket etmez ama kare yine çizilir.
        if (this.uiPaused) this.render();
        else {
          this.update(dt);
          this.render();
        }
        this.trackPerf(raw);
      } catch (err) {
        // Tek karelik bir hata döngüyü durdurmasın (ekran siyah kalmasın).
        if (!this._errLogged) { this._errLogged = true; console.error('[travel] frame error:', err); }
      }
      requestAnimationFrame(this.loop);
    }

    // Ortalama kare süresini izler ve ağır efektleri otomatik seyreltir.
    // Oyun mekaniği değişmez; yalnızca çizim maliyeti düşer.
    trackPerf(raw) {
      if (!(raw > 0) || raw > 0.5) return; // sekme dönüşü / donma sıçramalarını sayma
      this._fpsAcc += raw;
      this._fpsN += 1;
      if (this._fpsN < 40) return;
      const avg = this._fpsAcc / this._fpsN;
      this._fpsAcc = 0;
      this._fpsN = 0;
      if (avg > 0.032 && !this.lowFx) this.lowFx = true;      // ~<31 fps
      else if (avg < 0.021 && this.lowFx) this.lowFx = false; // ~>48 fps
    }

    // ======================================================================
    // SUNUCU ENTEGRASYONU (Setra adapter kullanır)
    // ======================================================================
    setWorldBounds(map) {
      if (!map || typeof map !== 'object') return;
      // Harita TÜRÜ değişince (kıta ↔ rastgele sefer) kamera modu da değişir:
      // yakınlığı yeni modun varsayılanına oturt. Aksi halde kıtadan çıkıp
      // sefere giren oyuncu, kıtanın yakın kamerasını (her şey dev görünür)
      // seferde de taşıyordu.
      const wasPersistent = !!this.persistent;
      // --- Kalıcı kıta: SetraWorldCore ile gerçek deterministik dünya ---
      // Tüm harita sabit bir görsel genişliğe ölçeklenir; kareler sunucu
      // koordinatından örneklenir (biyom, su, yol, köprü). Detay/cila Kimi'ye.
      if (map.persistent && map.world) {
        const cfg = map.world;
        this.persistent = true;
        this.worldConfig = cfg;
        // GameCraft > Dünya Kurucu'nun görsel ölçek ayarlarını 3D dekora aktar.
        if (typeof window !== 'undefined') window.SETRA_WORLD_TUNING = cfg.visual || {};
        const worldVer = Number(cfg.version) || 1;
        const mapChanged = this._worldVersion !== worldVer;
        const sameMap = !mapChanged && this._mapId === map.id && this.persistentTilesReady;
        this._mapId = map.id || this._mapId;
        if (!this.worldCore || mapChanged) {
          if (typeof window !== 'undefined' && window.SetraWorldCore) {
            this.worldCore = window.SetraWorldCore.createWorld(cfg);
          }
          this._worldVersion = worldVer;
          this.persistentTilesReady = false;
          this._persistentStaticScenery = null;
          this._persWindow = null;
        }
        if (!this.worldCore) return;
        if (sameMap) { this.snapCamera(); return; }
        // Dünya gerçek ölçeğinde kalır: 1 sunucu birimi = cfg.worldScale piksel.
        // (Eski 9000/genişlik katsayısı 30 dk'lık kıtayı ~45 sn'ye sıkıştırıyordu.)
        this.worldScale = Math.max(1, Number(cfg.worldScale) || 9);
        this.serverSpawn = { x: cfg.spawn.x, y: cfg.spawn.y };
        this.persistentBounds = {
          minX: -cfg.spawn.x * this.worldScale,
          minY: -cfg.spawn.y * this.worldScale,
          maxX: (cfg.width - cfg.spawn.x) * this.worldScale,
          maxY: (cfg.height - cfg.spawn.y) * this.worldScale
        };
        const corner = Math.hypot(
          Math.max(Math.abs(this.persistentBounds.minX), this.persistentBounds.maxX),
          Math.max(Math.abs(this.persistentBounds.minY), this.persistentBounds.maxY)
        );
        this.mapRadius = Math.max(20, Math.ceil(corner / this.tileSize) + 2);
        // Etkileşim yarıçapı: 3D yapıların tabanı büyük olduğu için oyuncu
        // binanın içine girmek zorunda kalmamalı (hitbox yüzünden E açılmıyordu).
        this.interactRadius = Math.max(95, Math.min(190, this.worldScale * 14));
        // Kıtada 3D dekor tam boyutunda; sefer ölçeği burada sıfırlanır.
        // (Kıta ağaçları istenen 2x boyut: 0.8 → 1.6)
        this.decorScale = 1.6;
        this._lastWalkPos = null;
        this.setBiome(map.type || 'verdant', true);
        this.generateMap();
        if (!wasPersistent) this.resetZoomForMode();
        this.snapCamera();
        return;
      }
      // Normal sefer: kalıcı kıta durumunu sıfırla (motor yeniden kullanılırsa).
      this.persistent = false;
      this.persistentTilesReady = false;
      this.worldCore = null;
      this.worldConfig = null;
      if (typeof window !== 'undefined') window.SETRA_WORLD_TUNING = null;
      this.persistentBounds = null;
      this._persWalk = null;
      this._persWindow = null;
      this._persistentStaticScenery = null;
      this._lastWalkPos = null;
      const w = Number(map.w), h = Number(map.h);
      const mapW = Number.isFinite(w) && w > 0 ? w : 64;
      const mapH = Number.isFinite(h) && h > 0 ? h : 64;
      const spRaw = map.spawn && typeof map.spawn === 'object' ? map.spawn : null;
      const sx = spRaw && Number.isFinite(Number(spRaw.x)) ? Number(spRaw.x) : mapW / 2;
      const sy = spRaw && Number.isFinite(Number(spRaw.y)) ? Number(spRaw.y) : mapH / 2;
      this.serverSpawn = { x: sx, y: sy };
      const maxDist = Math.hypot(
        Math.max(this.serverSpawn.x, mapW - this.serverSpawn.x),
        Math.max(this.serverSpawn.y, mapH - this.serverSpawn.y)
      ) || 1;
      // Ölçek: sunucu haritasının tamamı sabit bir görsel yarıçapa sığdırılır.
      // Harita boyutları 5x büyüdüğü için görsel yarıçap da büyütülür; aksi
      // halde dev haritalar aynı küçük adada sıkışmış gibi görünürdü.
      const RADIUS_BY_SIZE = { small: 20, normal: 28, large: 36, huge: 46, colossal: 58 };
      const sizeId = (map && map.size) || 'normal';
      const baseR = RADIUS_BY_SIZE[sizeId] || 28;
      const R = Math.max(14, Math.min(64, Math.round(baseR)));
      this.worldScale = ((R - 0.5) * this.tileSize) / maxDist;
      if (!Number.isFinite(this.worldScale) || this.worldScale <= 0) this.worldScale = this.tileSize;
      // Etkileşim yarıçapı: POI'lerin görsel boyutu büyük olduğu için oyuncu
      // nesnenin içine girmek zorunda kalmamalı. Sunucu toleransı (16 karo) ile
      // uyumlu olacak şekilde dünya pikseli cinsinden ~100px civarı tutulur.
      this.interactRadius = Math.max(60, Math.min(150, this.worldScale * 12));
      // Rastgele sefer haritaları küçük: 3D dekoru kıtadaki boyutun ~%60'ında
      // çiz, yoksa ağaçlar/kayalar ekranı doldurup "her şey dev" görünüyordu.
      this.decorScale = 0.6;
      // Biyom (harita türü) canavar tablosunu ve ambiyansını belirler.
      const newExpedition = map.id && map.id !== this._mapId;
      this._mapId = map.id || this._mapId;
      if (R !== this.mapRadius || newExpedition) {
        // Her yeni seferde arazi yeniden üretilir: tepeler/platolar da değişir.
        this.mapRadius = R;
        this.generateMap();
      }
      if (newExpedition) {
        // Yeni sefer: canı bir kez daha sunucudan al. Aksi halde kasabada
        // iyileşen oyuncu eski (düşük) canıyla seyahate devam ediyordu.
        this._hpFromServer = false;
        this._lastHpSent = null;
        this._secondWindUsed = false;
        this._autoElCache = null;
        this._castElement = null;
      }
      this.setBiome(map.type || 'verdant', newExpedition);
      if (wasPersistent) this.resetZoomForMode();
      this.snapCamera();
    }

    placePOIs(pois) {
      const tile = this.worldScale || this.tileSize;
      const sp = this.serverSpawn;
      const ss = this.worldTuning().structureScale;
      const keep = (this.scenery || []).filter((s) => s.type !== 'poi' && s.fallbackType !== 'poi' && !s.poiStone);
      this.poiMarkers = [];
      for (const p of pois || []) {
        if (p.consumed) continue;
        const wx = (p.x + 0.5 - sp.x) * tile;
        const wy = (p.y + 0.5 - sp.y) * tile;
        const poiBase = p.kind === 'chest' ? 1.1 : p.kind === 'camp' ? 1.15 : 1.15;
        const poiMul = p.kind === 'chest' || p.kind === 'camp' ? 1 : ss;
        this.poiMarkers.push({
          type: this.persistent && p.model ? 'glb' : 'poi', fallbackType: 'poi', model: p.model || null,
          kind: p.kind, poiId: p.id, name: p.name,
          wx, wy, z: this.groundZAt(wx, wy),
          scale: this.persistent && p.model ? poiBase * poiMul : 1,
          preScaled: true,
          tint: p.tint || null,
          solidRadius: this.persistent && p.model && p.kind !== 'chest' && p.kind !== 'camp' && p.kind !== 'inn' ? 0.55 : 0,
          interactable: true, label: p.name,
        });
        // Köy merkezine (çeşme/kamp ateşi değil) seyahat taşı dikilitaşı:
        // Her köyün/checkpoint'in ortasında bir obelisk dursun — E ile o köyün
        // menüsü (dinlenme/kayıt) açılır. POI zaten obelisk ise tekrar eklenmez.
        if (this.persistent && (p.checkpoint || p.kind === 'inn' || p.kind === 'checkpoint') && p.model !== 'obelisk') {
          const ox = wx + tile * 1.1, oy = wy + tile * 1.1;
          this.poiMarkers.push({
            type: 'glb', model: 'obelisk', kind: 'checkpoint', poiId: p.id, poiStone: true,
            village: p.name, name: p.name + ' Taşı', wx: ox, wy: oy, z: this.groundZAt(ox, oy),
            scale: 2.6, preScaled: true, solidRadius: 0.3,
            interactable: true, label: 'Seyahat Taşı',
          });
        }
      }
      this.scenery = keep.concat(this.poiMarkers);
      this.solids = this.scenery.filter((s) => s.solidRadius > 0);
      this.rebuildRenderables();
    }

    worldToServer(wx, wy) {
      const s = this.worldScale || this.tileSize;
      return { x: wx / s + this.serverSpawn.x, y: wy / s + this.serverSpawn.y };
    }
    serverToWorld(x, y) {
      const s = this.worldScale || this.tileSize;
      return { x: (x - this.serverSpawn.x) * s, y: (y - this.serverSpawn.y) * s };
    }

    setServerPlayer(pos, force) {
      if (!pos) return;
      const w = this.serverToWorld(pos.x, pos.y);
      if (force || Math.hypot(w.x - this.player.x, w.y - this.player.y) > 140) {
        this.player.x = w.x; this.player.y = w.y; this.snapCamera();
      }
    }

    applyPlayerData(me) {
      if (!me) return;
      // İsim plakasında "Kahraman" değil, oyuncunun gerçek adı görünsün.
      if (me.name) this.playerData.name = me.name;
      if (me.character && this.sound) this.sound.setClass(me.character);
      if (me.character && me.character !== this.playerData.class) this.setPlayerClass(me.character);
      // Mana rengi (görsel efekt) sunucudan gelir.
      if (me.activeSkin !== undefined) this.setSkin(me.activeSkin);
      // Travel yetenek kuşanımı (Q/E/R) ve öğrenilen havuz.
      if (me.travelLoadout !== undefined) this.playerData.travelLoadout = Object.assign({}, me.travelLoadout || {});
      if (Array.isArray(me.travelSkills)) this.playerData.travelSkills = me.travelSkills.slice();
      const stats = this.playerData.stats || (this.playerData.stats = {});
      // statBonus pasifleri (+%attack, +%maxHp) sunucu değerlerinin üstüne biner.
      const atkPct = this.passiveStatPct("attack");
      const hpPct = this.passiveStatPct("maxHp") + this.passiveStatPct("hp");
      stats.attack = me.attack != null ? Math.round(Number(me.attack) * (1 + atkPct)) : stats.attack;
      stats.critChance = (me.critChance || 0) / 100;
      stats.critMultiplier = 1 + (me.critDamage || 0) / 100;
      stats.maxHp = me.maxHp ? Math.round(Number(me.maxHp) * (1 + hpPct)) : stats.maxHp;
      // İlk gerçek oda verisinde canı sunucudan al; sonrasında motor yönetir.
      // hp=0 ama sunucu "downed" demiyorsa bu bayat/boş bir kayıttır (yeni sefer,
      // eski ölüm kalıntısı); tam canla başla. Yere düşme sunucu bayrağıyla gelir.
      if (me.hp != null && !this._hpFromServer) {
        const rawHp = Number(me.hp);
        const accepted = (rawHp > 0 || me.downed) ? rawHp : (stats.maxHp || 1);
        stats.currentHp = Math.min(Math.max(0, accepted), stats.maxHp);
        this._hpFromServer = true;
        this._lastHpSent = stats.currentHp;
      }
      if (me.downed) { this.downed = true; this._down = true; }
      if (stats.currentHp != null) stats.currentHp = Math.min(stats.currentHp, stats.maxHp);
      stats.maxMana = me.maxMana || stats.maxMana;
      stats.currentMana = me.mana != null ? me.mana : stats.currentMana;
      stats.omnivamp = (me.omnivamp || 0) / 100;
      stats.speed = me.speed ? 120 + me.speed * 2 : stats.speed;
      stats.attackSpeed = Number(me.attackSpeed) || 0;
      stats.magicPower = me.magicPower != null ? Number(me.magicPower) || 0 : (stats.magicPower || 0);
      stats.healPower = me.healPower != null ? Number(me.healPower) || 0 : (stats.healPower || 0);

      // ---- Seyahat içi seviye atlama ----
      // Sunucu addXp ile yeni seviyeyi gönderir. Artış varsa: max canın %20'si
      // dolar (her atlanan seviye için) ve statlar sunucu değerleriyle hemen
      // tazelenir (maxHp/attack yukarıda uygulandı; HUD 200ms'de yeniden çizer).
      const newLevel = Number(me.level);
      if (newLevel > 0) {
        const prevLevel = Number(this.playerData.level) || 0;
        if (prevLevel > 0 && newLevel > prevLevel) {
          const gained = newLevel - prevLevel;
          const maxHp = Math.max(1, stats.maxHp || 1);
          const healAmt = Math.round(maxHp * 0.20 * gained);
          stats.currentHp = Math.min(maxHp, (stats.currentHp || 0) + healAmt);
          this._hpFromServer = true;
          // _lastHpSent'i GÜNCELLEME: döngü farkı görüp yeni canı sunucuya yollar.
          if (typeof this.onStatsChange === 'function') { try { this.onStatsChange(); } catch (_) {} }
          if (typeof this.onLevelUp === 'function') { try { this.onLevelUp(newLevel, healAmt); } catch (_) {} }
        }
        this.playerData.level = newLevel;
      }
      this.player.baseSpeed = stats.speed || 200;
      this.refreshAttackCooldown();
    }

    // ======================================================================
    // DIŞARIYA AÇIK API (değişmedi)
    // ======================================================================
    setPlayerClass(newClass) {
      this.playerData.class = newClass;
      this.player.archetype = getArchetype(newClass);
      this.player.style = getClassStyle(newClass);
      this.companion.active = this.player.archetype === ARCHETYPES.TAMER;
      this.applyTravelSkills();
    }

    updateStats(newStats) {
      this.playerData.stats = { ...this.playerData.stats, ...newStats };
      this.player.baseSpeed = this.playerData.stats.speed || 210;
    }

    // Sunucudan gelen canı uygular (kalp kaybı / iyileşme / diriltme).
    setHp(hp) {
      const st = this.playerData.stats || (this.playerData.stats = {});
      const maxHp = Math.max(1, st.maxHp || 1);
      const v = Math.max(0, Math.min(maxHp, Number(hp)));
      if (!Number.isFinite(v)) return;
      st.currentHp = v;
      this._hpFromServer = true;
      this._lastHpSent = v;
      if (v > 0) { this._down = false; this.downed = false; }
    }

    // Yere düşme durumunu uygular (sunucu onayı). Diriltilince false gelir.
    setDowned(on) {
      this.downed = !!on;
      const st = this.playerData.stats || (this.playerData.stats = {});
      if (on) {
        this._down = true;
        if (st.currentHp > 0) st.currentHp = 0;
        this.player.vx = 0; this.player.vy = 0; this.player.isDashing = false;
      }
    }

    destroy() {
      this.isRunning = false;
      this._destroyed = true;
      if (this._bgTimer) { clearInterval(this._bgTimer); this._bgTimer = 0; }
      window.removeEventListener('resize', this.boundResize);
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
      this.canvas.removeEventListener('mousemove', this._onMouseMove);
      this.canvas.removeEventListener('mousedown', this._onMouseDown);
      this.canvas.removeEventListener('mouseup', this._onMouseUp);
      window.removeEventListener('mouseup', this._onMouseUp);
      window.removeEventListener('blur', this._onBlur);
      this.canvas.removeEventListener('contextmenu', this._onContext);
      this.canvas.removeEventListener('touchstart', this._onTouch);
      this.canvas.removeEventListener('touchmove', this._onTouch);
      this.canvas.removeEventListener('touchend', this._onMouseUp);
      this.canvas.removeEventListener('touchcancel', this._onMouseUp);
      this.canvas.removeEventListener('wheel', this._onWheel);
      if (this._onVisibility) {
        document.removeEventListener('visibilitychange', this._onVisibility);
        window.removeEventListener('focus', this._onVisibility);
      }
      if (this.canvas.style) this.canvas.style.cursor = this._prevCursor || '';
      // Harita kapanınca döngü sesleri (yağmur vb.) kesinlikle sussun.
      if (this.sound) { try { this.sound.stopLoop(); } catch (e) {} }
      this.timeouts.forEach((id) => clearTimeout(id));
      this.timeouts.clear();
    }
  }

  global.TravelEngine = TravelEngine;
  global.ARCHETYPES = ARCHETYPES;
  global.CLASS_MAP = CLASS_MAP;

})(typeof window !== 'undefined' ? window : this);
