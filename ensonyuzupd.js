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

  function hash2(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
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
    kill: { w: 'triangle', f0: 300, f1: 80, fd: 0.25, g: 0.25, gd: 0.25 }
  };

  class SoundFX {
    constructor() { this.ctx = null; this.enabled = true; }
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    play(type) {
      if (!this.enabled) return;
      this.init();
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
    [ARCHETYPES.MAGE, ['mage', 'archmage', 'archon', 'healer', 'highpriest', 'divinesaint', 'lifeweaver', 'moderator', 'ultramoderator', 'elementalist', 'sorcerer', 'pyromancer', 'chronomancer', 'wizard', 'cleric']],
    [ARCHETYPES.SHADOW, ['rogue', 'assassin', 'nightblade', 'reaper', 'shadeking', 'deathlord', 'bloodspawn', 'bloodlord', 'gloomspawn', 'sanguinelord', 'ninja', 'shadowblade', 'bloodknight']],
    [ARCHETYPES.TAMER, ['tamer', 'beastmaster', 'alphatamer', 'druid', 'summoner']]
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

  // ==========================================================================
  // YÜZ / ÇENE TİPLERİ   (S.face = { jaw, brow, scar, stubble })
  //   jaw  : round (yuvarlak) | soft (zarif/kadınsı) | sharp (keskin çene) | square (köşeli, güçlü) | gaunt (çökük, hırçın)
  //   brow : calm | soft | stern | angry
  // Ciddi karakterlerde sharp/square, yumuşak karakterlerde soft/round kullan.
  // Stil nesnesinde  face: { jaw: 'sharp', brow: 'angry', scar: true }  yazarak sınıf bazında ezebilirsin.
  // ==========================================================================
  const FACE_ARCH = {
    MELEE: { jaw: 'square', brow: 'stern' }, RANGED: { jaw: 'sharp', brow: 'calm' },
    MAGE: { jaw: 'soft', brow: 'soft' }, SHADOW: { jaw: 'sharp', brow: 'angry' }, TAMER: { jaw: 'round', brow: 'calm' }
  };
  const FACE_CLASS = {
    // yakın dövüş
    warrior: { jaw: 'square', brow: 'stern' }, warlord: { jaw: 'square', brow: 'angry', scar: true, stubble: true },
    waremperor: { jaw: 'sharp', brow: 'stern', stubble: true }, paladin: { jaw: 'square', brow: 'calm' },
    crusader: { jaw: 'square', brow: 'stern' }, lightbringer: { jaw: 'sharp', brow: 'calm' },
    tank: { jaw: 'square', brow: 'stern', stubble: true }, juggernaut: { jaw: 'square', brow: 'angry', stubble: true },
    colossus: { jaw: 'square', brow: 'stern' }, knight: { jaw: 'square', brow: 'calm' },
    barbarian: { jaw: 'square', brow: 'angry', scar: true, stubble: true }, berserker: { jaw: 'square', brow: 'angry', scar: true },
    gladiator: { jaw: 'square', brow: 'stern', scar: true }, sentinel: { jaw: 'sharp', brow: 'stern' }, warmaster: { jaw: 'square', brow: 'stern', scar: true },
    guardian: { jaw: 'square', brow: 'calm' }, tester: { jaw: 'round', brow: 'calm' },
    // okçu / doğa
    archer: { jaw: 'sharp', brow: 'calm' }, warden: { jaw: 'sharp', brow: 'calm' }, stormwarden: { jaw: 'sharp', brow: 'stern' },
    rootbinder: { jaw: 'soft', brow: 'calm' }, gardener: { jaw: 'round', brow: 'soft' }, hunter: { jaw: 'sharp', brow: 'stern', stubble: true },
    ranger: { jaw: 'sharp', brow: 'calm' }, sniper: { jaw: 'sharp', brow: 'stern' }, bowmaster: { jaw: 'sharp', brow: 'stern' }, marksman: { jaw: 'sharp', brow: 'calm' },
    // büyücü / şifacı
    mage: { jaw: 'soft', brow: 'soft' }, archmage: { jaw: 'gaunt', brow: 'stern' }, archon: { jaw: 'sharp', brow: 'calm' },
    healer: { jaw: 'soft', brow: 'soft' }, highpriest: { jaw: 'soft', brow: 'calm' }, divinesaint: { jaw: 'soft', brow: 'soft' },
    lifeweaver: { jaw: 'soft', brow: 'soft' }, moderator: { jaw: 'round', brow: 'calm' }, ultramoderator: { jaw: 'sharp', brow: 'stern' },
    // gölge kolu
    rogue: { jaw: 'sharp', brow: 'stern' }, assassin: { jaw: 'sharp', brow: 'stern' }, nightblade: { jaw: 'sharp', brow: 'angry' },
    reaper: { jaw: 'gaunt', brow: 'stern' }, shadeking: { jaw: 'sharp', brow: 'angry' }, deathlord: { jaw: 'gaunt', brow: 'angry' },
    bloodspawn: { jaw: 'sharp', brow: 'angry' }, bloodlord: { jaw: 'sharp', brow: 'angry', scar: true }, gloomspawn: { jaw: 'gaunt', brow: 'angry' },
    sanguinelord: { jaw: 'sharp', brow: 'stern' }, ninja: { jaw: 'sharp', brow: 'stern' }, shadowblade: { jaw: 'sharp', brow: 'stern' },
    bloodknight: { jaw: 'sharp', brow: 'angry', scar: true },
    // evcilleştirici
    tamer: { jaw: 'round', brow: 'calm' }, beastmaster: { jaw: 'square', brow: 'stern', scar: true, stubble: true },
    alphatamer: { jaw: 'sharp', brow: 'stern', stubble: true }, druid: { jaw: 'soft', brow: 'calm' }, summoner: { jaw: 'soft', brow: 'calm' }
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
    S.face = Object.assign({ jaw: 'round', brow: 'calm' }, FACE_ARCH[arch] || {}, FACE_CLASS[key] || {}, own.face || {});
    S.atkMode = WEAPON_ATK[S.weapon] || 'swing';
    _styleCache[key] = S;
    return S;
  }
  // Karakter oluşturucu / dışarıdan sınıf eklemek için:
  //   TravelEngine.registerClassStyle('Benim Kahraman', { ...stil... }, 'MELEE');  engine.setPlayerClass('Benim Kahraman');
  function registerClassStyle(name, own, archetype) {
    const key = normKey(name);
    CLASS_STYLES[key] = own || {};
    if (archetype && ARCHETYPES[archetype]) CLASS_MAP[key] = archetype;
    delete _styleCache[key];
    return getClassStyle(name);
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
  const HEAD_TALL = { none: 0, bandana: 0, archhat: 12, mitre: 9, shadecrown: 7, horned: 6, rootcrown: 6, sunhelm: 8, archonhelm: 9, ultracrown: 7, bonehelm: 3, wolfhead: 5, wizard: 6, helm: 4, tamer: 4, goggles: 3, hood: 2, leafcrown: 3, strawhat: 0, skullhood: 6 };


  // ==========================================================================
  // KAFA / YÜZ / EL  (yeni)  — karakter yerel uzayı: ayaklar (0,0), yukarısı -y
  // ==========================================================================
  // Yarım çene profilleri (sağ taraf, yukarıdan çeneye). Kafatası elipsten üretilir, alt kısım buradan gelir.
  const FACE_SHAPES = {
    round:  { smooth: true,  rx: 7.3, jaw: [[7.1, -31.6], [6.3, -28.6], [3.9, -26.1], [0, -25.3]] },
    soft:   { smooth: true,  rx: 7.0, jaw: [[6.8, -31.8], [5.7, -28.4], [3.0, -26.0], [0, -25.2]] },
    sharp:  { smooth: false, rx: 7.1, jaw: [[6.9, -32.0], [6.1, -28.6], [2.5, -25.5], [0, -24.9]] },
    square: { smooth: false, rx: 7.4, jaw: [[7.4, -31.4], [7.0, -27.8], [3.8, -25.3], [0, -25.1]] },
    gaunt:  { smooth: false, rx: 6.7, jaw: [[6.4, -32.0], [5.2, -28.2], [2.1, -25.0], [0, -24.5]] }
  };
  // Dönüş: t = ekranda yatay bakış (-1..1). Kafa daralır, çene baktığı yöne uzar → yandan da düzgün görünür.
  function faceT(x, y, t) {
    const a = Math.abs(t), low = clamp((y + 33) / 8, 0, 1);
    return [x * (1 - 0.3 * a) + t * (0.8 + 2.1 * low), y];
  }
  function headOutline(ctx, shape, t) {
    const R = [];
    for (let k = 0; k <= 8; k++) { const th = -Math.PI / 2 + k * (Math.PI / 2) / 8; R.push([shape.rx * Math.cos(th), -34.4 + 7 * Math.sin(th)]); }
    shape.jaw.forEach((p) => R.push(p));
    const full = R.concat(R.slice(1, -1).reverse().map(([x, y]) => [-x, y])).map(([x, y]) => faceT(x, y, t));
    ctx.beginPath();
    if (shape.smooth) {
      const n = full.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const m0 = mid(full[n - 1], full[0]); ctx.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) { const m = mid(full[i], full[(i + 1) % n]); ctx.quadraticCurveTo(full[i][0], full[i][1], m[0], m[1]); }
    } else {
      ctx.moveTo(full[0][0], full[0][1]);
      for (let i = 1; i < full.length; i++) ctx.lineTo(full[i][0], full[i][1]);
    }
    ctx.closePath();
  }
  // Başın kendisi (ten + gölge + kulak). Çene tipi S.face.jaw'dan gelir.
  function drawHeadBase(ctx, S, o, env) {
    const { fx, front } = env, F = S.face || {}, shape = FACE_SHAPES[F.jaw] || FACE_SHAPES.round;
    const tt = front ? clamp(fx, -1, 1) : 0, a = Math.abs(tt), sg = tt >= 0 ? 1 : -1;
    const skin = S.skin || '#e6b07c';
    const ear = (x, y) => {
      ctx.fillStyle = shade(skin, -0.1); ell(ctx, x, y, 1.25, 2.1); ctx.fill();
      ctx.strokeStyle = 'rgba(70,30,15,0.35)'; ctx.lineWidth = 0.6; ell(ctx, x, y, 0.55, 1.1); ctx.stroke();
    };
    if (front && a <= 0.55) [-1, 1].forEach((sd) => { const p = faceT(sd * (shape.rx + 0.4), -33.2, tt); ear(p[0], p[1]); });
    let g = ctx.createLinearGradient(-8, -38, 8, -28);
    g.addColorStop(0, shade(skin, 0.22)); g.addColorStop(0.55, skin); g.addColorStop(1, shade(skin, -0.24));
    ctx.fillStyle = g; headOutline(ctx, shape, tt); ctx.fill();
    ctx.save(); headOutline(ctx, shape, tt); ctx.clip();
    const gy = ctx.createLinearGradient(0, -30.5, 0, -24.5); gy.addColorStop(0, 'rgba(40,18,8,0)'); gy.addColorStop(1, 'rgba(40,18,8,0.34)');
    ctx.fillStyle = gy; ctx.fillRect(-12, -31, 24, 8);
    if (front && (F.jaw === 'sharp' || F.jaw === 'gaunt' || F.jaw === 'square')) {   // elmacık altı gölgesi → keskin çene hissi
      ctx.strokeStyle = F.jaw === 'gaunt' ? 'rgba(50,20,10,0.34)' : 'rgba(50,20,10,0.22)'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
      [-1, 1].forEach((sd) => {
        if (a > 0.7 && sd === -sg) return;
        const p1 = faceT(sd * 6.3, -31.6, tt), p2 = faceT(sd * 3.7, -28.2, tt);
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      });
    }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(60,25,10,0.5)'; ctx.lineWidth = 0.7; ctx.lineJoin = 'round'; headOutline(ctx, shape, tt); ctx.stroke(); ctx.restore();
    if (front && a > 0.55) ear(-tt * 0.9, -33.3);   // yandan: kulak başın arkasında
    if (F.jaw === 'sharp' || F.jaw === 'square') {   // çene çizgisi ışığı
      ctx.save(); ctx.globalAlpha = 0.28; ctx.strokeStyle = shade(skin, 0.5); ctx.lineWidth = 0.7; ctx.lineCap = 'round';
      const j = shape.jaw, pa = faceT(sg * j[1][0], j[1][1] + 0.5, tt), pb = faceT(sg * j[2][0] * 0.9, j[2][1] - 0.2, tt);
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); ctx.restore();
    }
  }
  // Başlığın yüzün üst kısmını kapattığı sınır (y). Bunun üstüne kaş/göz çizilmez, yüz aşağı sıkışır.
  const HEAD_FACE_COVER = { helm: -30.6, winghelm: -31.2, sunhelm: -31.2, archonhelm: -31.2, modcap: -35.3, coif: -32.4, mitre: -32.4, archhat: -34.3, wizard: -34.5, strawhat: -34.1 };
  // Varsayılan yüz: kaş, göz (beyaz + iris + parlama), burun, ağız, yara, sakal gölgesi — çeneye göre ifade değişir.
  function drawFace(ctx, S, o, env) {
    const { fx, fy, front } = env;
    if (!front) return;
    const F = S.face || {}, jaw = F.jaw || 'round', brow = F.brow || 'calm', shape = FACE_SHAPES[jaw] || FACE_SHAPES.round;
    const skin = S.skin || '#e6b07c';
    const tt = clamp(fx, -1, 1), a = Math.abs(tt), sg = tt >= 0 ? 1 : -1;
    const fem = jaw === 'soft', hard = jaw === 'sharp' || jaw === 'gaunt' || jaw === 'square';
    const cover = HEAD_FACE_COVER[S.head] !== undefined ? HEAD_FACE_COVER[S.head] : -99;
    const eyeY = Math.max(-33.1, cover + 1.6) + fy * 1.1, avail = -25.3 - eyeY;
    const xF = tt * 3.1, sp = 2.5 * (1 - 0.5 * a);
    const tilt = brow === 'angry' ? 0.32 : brow === 'stern' ? 0.15 : fem ? -0.1 : 0;
    const eyeW = fem ? 1.55 : hard ? 1.6 : 1.4;
    const mask = S.headExtra === 'mask';
    const bc = S.hair ? shade(S.hair, -0.2) : shade(skin, -0.62);
    const sides = [-1, 1];

    // kaşlar
    if (cover < eyeY - 3.4) sides.forEach((sd) => {
      const far = sd === -sg; if (far && a > 0.88) return;
      const s = far ? 1 - 0.5 * a : 1 + 0.08 * a, x0 = xF + sd * sp * (1 - 0.1 * a);
      const xi = x0 - sd * 1.5 * s, xo = x0 + sd * (eyeW + 0.9) * s, by = eyeY - 2.4 - (fem ? 0.2 : 0);
      let yi = by, yo = by, cy = by - 0.5;
      if (brow === 'angry') { yi = by + 0.9; yo = by - 0.8; cy = by; }
      else if (brow === 'stern') { yi = by + 0.35; yo = by - 0.3; cy = by - 0.1; }
      else if (brow === 'soft') { yi = by + 0.2; yo = by + 0.1; cy = by - 0.9; }
      ctx.strokeStyle = bc; ctx.lineCap = 'round'; ctx.lineWidth = (fem || brow === 'soft' ? 0.55 : brow === 'calm' ? 0.8 : 1.1) * (0.8 + 0.2 * s);
      ctx.beginPath(); ctx.moveTo(xi, yi); ctx.quadraticCurveTo((xi + xo) / 2, cy, xo, yo); ctx.stroke();
    });

    // gözler
    sides.forEach((sd) => {
      const far = sd === -sg; if (far && a > 0.88) return;
      const s = far ? 1 - 0.5 * a : 1 + 0.08 * a, x = xF + sd * sp * (1 - 0.1 * a), rot = -sd * tilt, w = eyeW * s;
      if (S.eyeGlow) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = S.eyeGlow; ell(ctx, x, eyeY, w * 0.95, 0.78 * s, rot); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ell(ctx, x, eyeY, w * 0.45, 0.32 * s, rot); ctx.fill();
        drawGlow(ctx, x, eyeY, 7.5, S.eyeGlow, 0.5); ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(250,250,244,0.94)'; ell(ctx, x, eyeY, w * 1.12, 0.98 * s, rot); ctx.fill();
        ctx.fillStyle = S.eyeCol || '#2b1a0e'; ctx.beginPath(); ctx.arc(x + tt * 0.55, eyeY + 0.05, 0.88 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0a0606'; ctx.beginPath(); ctx.arc(x + tt * 0.6, eyeY + 0.05, 0.42 * s, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x + tt * 0.55 - 0.55, eyeY - 0.5, 0.45, 0.45);
        ctx.strokeStyle = 'rgba(40,18,10,0.65)'; ctx.lineWidth = 0.5; ctx.lineCap = 'round';   // üst göz kapağı
        ctx.beginPath(); ctx.ellipse(x, eyeY, w * 1.12, 0.98 * s, rot, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
        if (fem) { ctx.beginPath(); ctx.moveTo(x + sd * w * 1.05, eyeY - 0.4); ctx.lineTo(x + sd * (w * 1.05 + 0.6), eyeY - 0.8); ctx.stroke(); }
      }
    });

    // burun
    if (!mask) {
      const nTip = eyeY + avail * 0.37;
      if (a < 0.78) {
        ctx.strokeStyle = 'rgba(70,30,15,0.30)'; ctx.lineWidth = 0.75; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(xF + tt * 0.8 + 0.5, eyeY + 0.6); ctx.lineTo(xF + tt * 1.3 + 0.4, nTip); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.arc(xF + tt * 1.3 - 0.2, nTip - 0.4, 0.55, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(50,20,10,0.4)'; ctx.beginPath(); ctx.arc(xF + tt * 1.4 - 0.65, nTip + 0.5, 0.28, 0, TAU); ctx.arc(xF + tt * 1.4 + 0.65, nTip + 0.5, 0.28, 0, TAU); ctx.fill();
      } else {
        const e = faceT(sg * 6.9, -31.2, tt)[0];
        const nl = (hard ? 2.0 : 1.5) * clamp((a - 0.6) / 0.3, 0.5, 1);
        ctx.fillStyle = shade(skin, -0.03); poly(ctx, [e - sg * 0.6, nTip - 1.9, e + sg * nl, nTip + 0.5, e - sg * 0.6, nTip + 1.0]); ctx.fill();
        ctx.strokeStyle = 'rgba(60,25,10,0.4)'; ctx.lineWidth = 0.55; ctx.lineJoin = 'round'; ctx.stroke();
      }
      // ağız
      const my = eyeY + avail * 0.73, mw = (fem ? 1.6 : 2.2) * (1 - 0.4 * a), xM = tt * 3.0;
      const cy = brow === 'angry' ? my - 0.5 : (brow === 'stern' ? my : my + 0.45);
      if (fem) { ctx.fillStyle = 'rgba(190,70,85,0.6)'; ell(ctx, xM, my, mw * 0.85, 0.62); ctx.fill(); }
      ctx.strokeStyle = fem ? 'rgba(120,35,50,0.8)' : 'rgba(70,25,25,0.75)'; ctx.lineWidth = 0.7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(xM - mw, my); ctx.quadraticCurveTo(xM, cy, xM + mw, my); ctx.stroke();
      if (jaw === 'square' && a < 0.5) { ctx.strokeStyle = 'rgba(60,25,10,0.22)'; ctx.beginPath(); ctx.moveTo(xM, -26.3); ctx.lineTo(xM, -25.6); ctx.stroke(); }   // çene çukuru
    }
    // sakal gölgesi
    if (F.stubble && !mask) {
      ctx.save(); headOutline(ctx, shape, tt); ctx.clip(); ctx.fillStyle = 'rgba(25,16,12,0.42)';
      for (let i = 0; i < 34; i++) {
        const px = (hash2(i, 5) * 2 - 1) * 6.4, py = -29.6 + hash2(i, 9) * 4.6;
        const q = faceT(px, py, tt); ctx.beginPath(); ctx.arc(q[0], q[1], 0.33, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    // yara izi
    if (F.scar && !(a > 0.88 && sg > 0)) {
      const sx = xF - 2.9;
      ctx.strokeStyle = 'rgba(170,80,80,0.85)'; ctx.lineWidth = 0.7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx - 0.8, eyeY - 2.6); ctx.lineTo(sx + 1.0, eyeY + 2.6); ctx.stroke();
      ctx.strokeStyle = 'rgba(235,200,190,0.55)'; ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(sx - 1.5, eyeY - 0.6); ctx.lineTo(sx + 0.3, eyeY + 0.1); ctx.moveTo(sx - 0.9, eyeY + 1.2); ctx.lineTo(sx + 0.8, eyeY + 1.9); ctx.stroke();
    }
  }
  // El: pelerin/kolun ucunda yumruk + başparmak + manşet (silah bu noktaya tutturulur)
  function drawHand(ctx, S, x, y, sx, sy, col) {
    const ang = Math.atan2(y - sy, x - sx), glove = !!S.gloveCol;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = shade(col, -0.28); rr(ctx, -4.4, -2.5, 2.8, 5, 1); ctx.fill();            // manşet
    const g = ctx.createRadialGradient(-0.6, -1, 0.3, 0, 0, 3.4); g.addColorStop(0, shade(col, 0.22)); g.addColorStop(1, col);
    ctx.fillStyle = g; rr(ctx, -2, -2.5, 5.4, 5, 2); ctx.fill();                             // yumruk
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.fillStyle = shade(col, 0.1); ell(ctx, 0.8, -2.4, 1.7, 0.95, 0.15); ctx.fill();          // başparmak
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 0.5; ctx.beginPath();
    for (let k = -1; k <= 1; k++) { ctx.moveTo(1.2, k * 1.3); ctx.lineTo(3.2, k * 1.3); }      // parmak araları
    ctx.stroke();
    if (glove) { ctx.strokeStyle = S.pal.trim; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-1.7, -2.4); ctx.lineTo(-1.7, 2.4); ctx.stroke(); }
    ctx.restore();
  }

  function hoodBase(ctx, env, hc, topc, inner) {
    const { fx, front } = env;
    ctx.fillStyle = hc;
    ctx.beginPath(); ctx.arc(0, -34, 9, Math.PI * 0.95, Math.PI * 0.05); ctx.lineTo(7, -28); ctx.lineTo(-7, -28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = topc;
    ctx.beginPath(); ctx.moveTo(-9, -35); ctx.quadraticCurveTo(0, -46, 9, -35); ctx.quadraticCurveTo(0, -40, -9, -35); ctx.fill();
    if (front) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(fx * 2.4, -31.6, 6.6, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = inner;
      ctx.beginPath(); ctx.ellipse(fx * 2.6, -32, 6.0, 5.6, 0, 0, TAU); ctx.fill();
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

  // Saç (S.hair = renk, S.hairStyle = short|long|spiky|ponytail|mohawk|bun) — başlığın altında çizilir
  function drawHair(ctx, S, env) {
    const c = S.hair, hi = shade(c, 0.3), st = S.hairStyle || 'short', { capeSX, t } = env;
    ctx.fillStyle = c;
    const cap = (r) => { ctx.beginPath(); ctx.arc(0, -34.6, r, Math.PI, 0); ctx.lineTo(r - 1, -33); ctx.quadraticCurveTo(0, -37.6, -(r - 1), -33); ctx.closePath(); ctx.fill(); };
    if (st === 'long') { sideLocks(ctx, c, hi, capeSX); cap(7.9); }
    else if (st === 'ponytail') {
      cap(7.8); ctx.beginPath(); ctx.moveTo(-6, -38); ctx.quadraticCurveTo(-13 - capeSX * 0.5, -36 + Math.sin(t * 4) * 2, -12 - capeSX * 0.8, -24 + Math.sin(t * 3) * 3);
      ctx.quadraticCurveTo(-8, -30, -5, -35); ctx.closePath(); ctx.fill();
    } else if (st === 'spiky') { cap(7.6); for (let i = -3; i <= 3; i++) poly(ctx, [i * 2.4 - 2, -40, i * 2.4, -46 - (3 - Math.abs(i)) * 1.2, i * 2.4 + 2, -40]), ctx.fill(); }
    else if (st === 'mohawk') { cap(6.4); for (let i = -2; i <= 2; i++) poly(ctx, [i * 2 - 1.4, -40.5, i * 2, -49 - (2 - Math.abs(i)) * 1.6, i * 2 + 1.4, -40.5]), ctx.fill(); }
    else if (st === 'bun') { cap(7.8); ctx.beginPath(); ctx.arc(0, -43.4, 3.8, 0, TAU); ctx.fill(); ctx.strokeStyle = hi; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(-0.8, -43.8, 2, 3.6, 5.2); ctx.stroke(); }
    else { cap(7.9); ctx.beginPath(); ctx.moveTo(-7, -35); ctx.quadraticCurveTo(0, -31.6, 7, -35); ctx.quadraticCurveTo(0, -37.6, -7, -35); ctx.fill(); }
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
        ctx.fillStyle = 'rgba(0,0,0,0.32)'; poly(ctx, [-8.6, -38.6, 8.8, -39, 7.6, -36.2, -7.4, -36]); ctx.fill();   // kaş çıkıntısı
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-9, -31); ctx.lineTo(-5.4, -26.4); ctx.moveTo(9.2, -31); ctx.lineTo(5.6, -26.4); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.moveTo(-7.6, -41.4); ctx.lineTo(1.6, -42.6); ctx.lineTo(7.8, -39.4); ctx.stroke();
        if (front) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-7.5, -36.2, 15, 4.2); }
        eyes(-34.2, 3, 1.9);
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
        const tt = front ? clamp(fx, -1, 1) : 0, a = Math.abs(tt), sg = tt >= 0 ? 1 : -1;
        const shp = FACE_SHAPES[(S.face && S.face.jaw) || 'sharp'] || FACE_SHAPES.sharp;
        glowAdd(ctx, 0, -33, 16, '#aa00ff', 0.28);
        // sivri çeneli, boş yüzlü gölge maskesi
        g = ctx.createLinearGradient(-8, -42, 8, -25); g.addColorStop(0, '#24123f'); g.addColorStop(1, '#06020c');
        ctx.fillStyle = g; headOutline(ctx, shp, tt); ctx.fill();
        ctx.save(); ctx.strokeStyle = 'rgba(179,136,255,0.5)'; ctx.lineWidth = 0.9; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
        // taç dikenleri (kafaya oturur, dönüşe göre kayar)
        ctx.fillStyle = '#1a0b2e';
        for (let i = -3; i <= 3; i++) {
          const h = 6 + (3 - Math.abs(i)) * 2 + Math.sin(t * 4 + i) * 0.8, x = i * 2.5 + tt * 0.8;
          poly(ctx, [x - 1.6, -40, x, -40 - h, x + 1.6, -40]); ctx.fill();
        }
        ctx.fillRect(-7.6 + tt * 0.8, -40.8, 15.2, 2.2);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = -3; i <= 3; i += 1) drawGlow(ctx, i * 2.5 + tt * 0.8, -47.6 - (3 - Math.abs(i)) * 2 - Math.abs(Math.sin(t * 5 + i)) * 2, 4, '#aa00ff', 0.6);
        ctx.restore();
        if (front) {
          const xF = tt * 3.1, sp = 2.7 * (1 - 0.5 * a);
          [-1, 1].forEach((sd) => {
            const far = sd === -sg; if (far && a > 0.88) return;
            const s = far ? 1 - 0.5 * a : 1 + 0.08 * a, x = xF + sd * sp * (1 - 0.1 * a);
            ctx.fillStyle = '#04010a';   // sert kaş çıkıntısı
            poly(ctx, [x - sd * 2.4 * s, -34.9, x + sd * 3.0 * s, -36.6, x + sd * 2.8 * s, -34.9, x - sd * 1.9 * s, -33.7]); ctx.fill();
            ctx.save(); ctx.globalCompositeOperation = 'lighter';   // eğik, ince parlayan göz
            ctx.fillStyle = eyeCol; poly(ctx, [x - sd * 1.8 * s, -32.6, x + sd * 2.4 * s, -34.3, x + sd * 1.3 * s, -32.5]); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.7)'; poly(ctx, [x - sd * 0.6 * s, -33.0, x + sd * 1.5 * s, -33.9, x + sd * 0.9 * s, -33.0]); ctx.fill();
            drawGlow(ctx, x, -33.3, 8, eyeCol, 0.55);
            ctx.strokeStyle = rgba('#b388ff', 0.4); ctx.lineWidth = 0.6;   // elmacık çatlağı
            ctx.beginPath(); ctx.moveTo(x + sd * 1.8 * s, -31.8); ctx.lineTo(x + sd * 3.0 * s, -28.6); ctx.stroke();
            ctx.restore();
          });
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('#b388ff', 0.35); ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(xF * 0.95 - 1.4 * (1 - 0.4 * a), -27.6); ctx.lineTo(xF * 0.95 + 1.4 * (1 - 0.4 * a), -27.6); ctx.stroke(); ctx.restore();
        }
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
          ctx.fillStyle = '#fff'; poly(ctx, [fx * 3 - 1.9, -28.0, fx * 3 - 1.2, -25.9, fx * 3 - 0.5, -28.0]); ctx.fill();
          poly(ctx, [fx * 3 + 0.5, -28.0, fx * 3 + 1.2, -25.9, fx * 3 + 1.9, -28.0]); ctx.fill();
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
      case 'none': return false;
      case 'bandana': {
        ctx.fillStyle = S.bandana || o.cape;
        ctx.beginPath(); ctx.arc(0, -34.6, 7.9, Math.PI * 1.04, Math.PI * 1.96); ctx.lineTo(6.2, -36.6); ctx.arc(0, -34.6, 6.1, Math.PI * 1.96, Math.PI * 1.04, true); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = S.bandana || o.cape; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-7.4, -36.4); ctx.quadraticCurveTo(-12 - capeSX * 0.6, -35 + Math.sin(t * 7) * 1.4, -16 - capeSX, -30 + Math.sin(t * 6) * 2.4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-7, -36); ctx.quadraticCurveTo(-11 - capeSX * 0.5, -32, -13 - capeSX * 0.8, -26 + Math.sin(t * 8) * 2); ctx.stroke();
        return false;
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
        ctx.fillStyle = S.hilt || '#5d4037'; rr(ctx, -4, -2, 11, 4, 1.5); ctx.fill();
        ctx.fillStyle = o.trim; ctx.beginPath(); ctx.arc(-4, 0, 2.6, 0, TAU); ctx.fill();
        rr(ctx, 7, -7, 4, 14, 2); ctx.fill();
        const bg = ctx.createLinearGradient(0, -4, 0, 4);
        const SBd = S.blade;
        bg.addColorStop(0, SBd ? SBd.a : '#ffffff'); bg.addColorStop(0.5, SBd ? shade(SBd.a, -0.15) : '#cfd8dc'); bg.addColorStop(1, SBd ? SBd.b : '#78909c');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.moveTo(11, -3.5); ctx.lineTo(40, -3.5); ctx.lineTo(48, 0); ctx.lineTo(40, 3.5); ctx.lineTo(11, 3.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(41, 0); ctx.stroke();
        glowAdd(ctx, 30, 0, 18, S.blade ? S.blade.glow : o.accent, 0.22 + 0.1 * Math.sin(t * 4));
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
        const gl = B.glow || '#00e5ff', pulse = 0.22 + 0.1 * Math.sin(t * 4) + (atk >= 0 ? (1 - atk) * 0.7 : 0);
        // bilek koruyucu (konik, plakalı)
        let g1 = ctx.createLinearGradient(0, -6, 0, 6); g1.addColorStop(0, shade(o.armor, 0.18)); g1.addColorStop(1, shade(o.armor, -0.4));
        ctx.fillStyle = g1; poly(ctx, [-4, -4.6, 8, -6.6, 12.5, -5.6, 12.5, 5.6, 8, 6.6, -4, 4.6]); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.strokeStyle = o.trim; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1.6, -5.4); ctx.lineTo(1.6, 5.4); ctx.moveTo(6.4, -6.2); ctx.lineTo(6.4, 6.2); ctx.stroke();
        // avuç (kaya blok)
        const gp = ctx.createLinearGradient(10, -9, 28, 9); gp.addColorStop(0, '#b6bcc2'); gp.addColorStop(0.5, '#7d858c'); gp.addColorStop(1, '#3d4248');
        ctx.fillStyle = gp; poly(ctx, [11, -7.4, 20, -9.2, 27, -7.6, 29, -3, 29, 3, 27, 7.6, 20, 9.2, 11, 7.4]); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(12, -6.6); ctx.lineTo(20, -8.2); ctx.lineTo(26.4, -6.8); ctx.stroke();
        // dört parmak boğumu (yan yana sıkılmış, her biri ayrı taş)
        for (let k = 0; k < 4; k++) {
          const yy = -7.2 + k * 3.6, wob = (k % 2) * 0.8;
          const gk = ctx.createLinearGradient(25, yy, 33, yy + 3.4); gk.addColorStop(0, '#a3aab0'); gk.addColorStop(1, '#4b5157');
          ctx.fillStyle = gk; rr(ctx, 25 + wob, yy, 7.4, 3.4, 1.4); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(26.4 + wob, yy + 0.5, 3.4, 0.7);
        }
        // başparmak (üstten kapatır)
        ctx.fillStyle = '#8b9299'; ell(ctx, 21, -8.6, 5.4, 2.4, 0.18); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 0.8; ctx.stroke();
        // çatlak + parlama
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(gl, 0.85); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(13, -4); ctx.lineTo(17, -1); ctx.lineTo(15, 2.4); ctx.lineTo(20, 5.4); ctx.moveTo(17, -1); ctx.lineTo(22, -2); ctx.stroke();
        drawGlow(ctx, 21, 0, 24, gl, pulse); ctx.restore();
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
        const GL = S.blade ? S.blade.glow : o.trim;
        const dagger = (rot, off) => {
          ctx.save(); ctx.rotate(rot); ctx.translate(0, off);
          ctx.fillStyle = '#212121'; rr(ctx, -2, -1.5, 8, 3, 1); ctx.fill();
          ctx.fillStyle = o.trim; ctx.fillRect(6, -4, 2, 8);
          const bg = ctx.createLinearGradient(0, -3, 0, 3);
          bg.addColorStop(0, S.blade ? S.blade.a : '#f5f5f5'); bg.addColorStop(1, S.blade ? S.blade.b : '#9e9e9e');
          ctx.fillStyle = bg;
          ctx.beginPath(); ctx.moveTo(8, -2.6); ctx.lineTo(24, -1); ctx.lineTo(30, 0); ctx.lineTo(24, 1.8); ctx.lineTo(8, 2.6); ctx.closePath(); ctx.fill();
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = rgba(GL, 0.9); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(9, -2.4); ctx.lineTo(29, 0); ctx.stroke();
          drawGlow(ctx, 22, 0, 12, GL, 0.3); ctx.restore();
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
    rock: { top0: '#7a838b', top1: '#4d565d', leftTop: '#363c42', leftBot: '#16191c', rightTop: '#464e55', rightBot: '#1e2226', lip: null }
  };

  // ==========================================================================
  // MOTOR
  // ==========================================================================
  class TravelEngine {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.sound = new SoundFX();
      this.time = 0;
      this.timeouts = new Set();

      this.playerData = options.player || {
        name: 'Kahraman',
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

      this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.shake = { trauma: 0, x: 0, y: 0 };
      this.hurt = 0;
      this.dustTimer = 0;
      this.dpr = 1;
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
        isDashing: false, dashTimer: 0, dashDuration: 0.22, dashCooldown: 0.85, dashCooldownTimer: 0, dashVx: 0, dashVy: 0,
        attackCooldown: 0.28, attackCooldownTimer: 0, isAttacking: false, attackAnimTimer: 0,
        cooldowns: { q: { max: 4.0, current: 0 }, e: { max: 7.0, current: 0 }, r: { max: 14.0, current: 0 } },
        ghostTrails: [], footprintTimer: 0,
        walkPhase: 0, swingDir: 1
      };

      this.companion = {
        active: archetype === ARCHETYPES.TAMER,
        name: 'Gölge Kurdu', x: -40, y: -40, vx: 0, vy: 0, radius: 12, speed: 240,
        target: null, attackCooldown: 0, animFrame: 0, face: 1, moving: false
      };

      this.keys = {};
      this.mouse = { screenX: this.width / 2, screenY: this.height / 2, worldX: 0, worldY: 0, isDown: false };
      this.initInput();

      this.tileSize = 64;
      this.tileThickness = 28;
      this.mapRadius = 8;
      this.tiles = [];
      this.tileMap = new Map();
      this.scenery = [];
      this.generateMap();

      this.monsters = [];
      this.spawnMonsters(6);

      this.projectiles = [];
      this.slashes = [];
      this.aoeEffects = [];
      this.damageNumbers = [];
      this.particles = [];
      this.impacts = [];
      this.ambientMotes = [];
      this.initAmbientMotes(35);

      this.snapCamera();

      this.lastTime = performance.now();
      this.isRunning = true;
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    // --- Küçük yardımcılar ---
    iso(wx, wy, wz = 0) { return worldToScreen(wx, wy, wz, this.camera); }

    later(fn, ms) {
      const id = setTimeout(() => { this.timeouts.delete(id); if (this.isRunning) fn(); }, ms);
      this.timeouts.add(id);
    }

    groundZAt(x, y) {
      const t = this.tileMap.get(Math.round(x / this.tileSize) * 1000 + Math.round(y / this.tileSize));
      return t ? t.wz : 0;
    }

    snapCamera() {
      const ts = worldToScreen(this.player.x, this.player.y, 0, { x: 0, y: 0 });
      this.camera.targetX = this.width / 2 - ts.x;
      this.camera.targetY = this.height / 2 - ts.y + 40;
      this.camera.x = this.camera.targetX;
      this.camera.y = this.camera.targetY;
    }

    // --- BOYUTLANDIRMA ---
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width || window.innerWidth;
      this.height = rect.height || window.innerHeight;
      const newDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (newDpr !== this.dpr) this.tileSprites = {};
      this.dpr = newDpr;
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
    }

    // --- GİRDİ ---
    initInput() {
      this._onKeyDown = (e) => {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.code] = true;
        if (e.code === 'Space') { e.preventDefault(); this.triggerDash(); }
        if (e.key.toLowerCase() === 'q') this.triggerSkill('q');
        if (e.key.toLowerCase() === 'e') {
          if (this.checkInteractionNearPlayer()) this.onInteract();
          else this.triggerSkill('e');
        }
        if (e.key.toLowerCase() === 'r') this.triggerSkill('r');
      };
      this._onKeyUp = (e) => {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.code] = false;
      };
      this._onMouseMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.screenX = e.clientX - rect.left;
        this.mouse.screenY = e.clientY - rect.top;
        const w = screenToWorld(this.mouse.screenX, this.mouse.screenY, this.camera);
        this.mouse.worldX = w.x;
        this.mouse.worldY = w.y;
      };
      this._onMouseDown = (e) => {
        if (e.button === 0) { this.mouse.isDown = true; this.triggerPrimaryAttack(); }
      };
      this._onMouseUp = (e) => { if (e.button === 0) this.mouse.isDown = false; };
      this._onContext = (e) => e.preventDefault();

      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
      this.canvas.addEventListener('mousemove', this._onMouseMove);
      this.canvas.addEventListener('mousedown', this._onMouseDown);
      this.canvas.addEventListener('mouseup', this._onMouseUp);
      this.canvas.addEventListener('contextmenu', this._onContext);
      this._prevCursor = this.canvas.style ? this.canvas.style.cursor : '';
      if (this.canvas.style) this.canvas.style.cursor = 'none';
    }

    // ======================================================================
    // HARİTA
    // ======================================================================
    generateMap() {
      this.tiles = [];
      this.tileMap = new Map();
      this.scenery = [];
      const R = this.mapRadius;

      for (let gx = -R; gx <= R; gx++) {
        for (let gy = -R; gy <= R; gy++) {
          const dist = Math.sqrt(gx * gx + gy * gy);
          if (dist > R + 0.3) continue;

          const wx = gx * this.tileSize;
          const wy = gy * this.tileSize;

          let type = 'grass';
          const isPath = Math.abs(gx + gy) <= 1 || (Math.abs(gx - gy) <= 1 && dist < 4);
          const isMountain = gx < -1 && gy < -1 && dist < 6;
          if (isPath) type = 'path';
          else if (isMountain) type = 'rock';

          const elevation = isMountain ? 22 : 0;
          const tile = {
            gx, gy, wx, wy, wz: elevation, type,
            shade: (Math.sin(gx * 7 + gy * 13) + 1) * 0.08,
            variant: Math.floor(hash2(gx * 1.7 + 3, gy * 2.3 + 1) * 4) % 4,
            edge: smooth(0.55, 1.0, dist / (R + 0.3))
          };
          this.tiles.push(tile);
          this.tileMap.set(gx * 1000 + gy, tile);

          if (type === 'grass' && dist > 1.8) {
            const hash = Math.sin(gx * 99 + gy * 33);
            if (hash > 0.45 && !isMountain) {
              this.scenery.push({
                type: 'tree', wx: wx + (hash * 20 - 10), wy: wy + (hash * 15 - 7.5),
                scale: 0.85 + Math.abs(hash) * 0.35, swayOffset: Math.random() * TAU, tone: hash2(gx, gy)
              });
            } else if (hash < -0.6) {
              this.scenery.push({ type: 'boulder', wx: wx + (hash * 15), wy: wy - (hash * 10), scale: 0.7 + Math.abs(hash) * 0.4 });
            } else if (hash2(gx * 5.3, gy * 9.1) > 0.93) {
              this.scenery.push({ type: 'mushroom', wx: wx + 8, wy: wy - 6, scale: 0.8 + hash2(gx, gy * 2) * 0.5 });
            }
          } else if (type === 'path' && dist > 2.5 && hash2(gx * 2.2, gy * 3.3) > 0.86) {
            this.scenery.push({ type: 'lantern', wx: wx + 22, wy: wy - 22, scale: 1 });
          }
        }
      }

      this.scenery.push({ type: 'shrine', wx: 0, wy: 120, scale: 1.1, interactable: true, label: 'Antik Seyahat Taşı [E]' });
      this.sortRenderables();
    }

    sortRenderables() {
      this.tiles.sort((a, b) => (a.wx + a.wy) - (b.wx + b.wy));
    }

    // ======================================================================
    // CANAVARLAR
    // ======================================================================
    spawnMonsters(count = 6) {
      const monsterTypes = [
        { kind: 'goblin', name: 'Koru Goblini', color: '#56ab2f', hp: 220, maxHp: 220, speed: 130, damage: 24, radius: 16, exp: 45 },
        { kind: 'treant', name: 'Yozlaşmış Treant', color: '#4a2c11', hp: 480, maxHp: 480, speed: 85, damage: 45, radius: 24, exp: 90 },
        { kind: 'wraith', name: 'Gölge Avcısı', color: '#7b1fa2', hp: 180, maxHp: 180, speed: 175, damage: 32, radius: 15, exp: 60 }
      ];

      for (let i = 0; i < count; i++) {
        const type = monsterTypes[i % monsterTypes.length];
        const angle = (i / count) * TAU + Math.random() * 0.4;
        const dist = 220 + Math.random() * 160;
        const px = Math.cos(angle) * dist, py = Math.sin(angle) * dist;
        this.monsters.push({
          id: Math.random().toString(36).substr(2, 9),
          ...type,
          x: px, y: py, z: 0,
          patrolCenterX: px, patrolCenterY: py,
          patrolTimer: Math.random() * 3, patrolTargetX: px, patrolTargetY: py,
          vx: 0, vy: 0, facingAngle: 0,
          state: 'PATROL', attackTimer: 0, attackCooldown: 1.4,
          flashTimer: 0, alertTimer: 0,
          hpGhost: type.hp, walkPhase: Math.random() * 6, deathTimer: 0, dead: false
        });
      }
    }

    // ======================================================================
    // AMBİYANS (ateş böcekleri + düşen yapraklar)
    // ======================================================================
    initAmbientMotes(count) {
      this.ambientMotes = [];
      for (let i = 0; i < count; i++) {
        this.ambientMotes.push({
          x: (Math.random() - 0.5) * 900, y: (Math.random() - 0.5) * 900, z: 10 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
          size: 1 + Math.random() * 2.2, alpha: 0.3 + Math.random() * 0.5,
          color: Math.random() > 0.5 ? '#b8e986' : '#ffd54f', phase: Math.random() * 10, leaf: false
        });
      }
      for (let i = 0; i < 14; i++) {
        this.ambientMotes.push({
          x: (Math.random() - 0.5) * 900, y: (Math.random() - 0.5) * 900, z: Math.random() * 140,
          vx: 8 + Math.random() * 10, vy: 4 + Math.random() * 8,
          size: 2.2 + Math.random() * 1.6, alpha: 0.85,
          color: Math.random() > 0.5 ? '#7cb342' : '#c0a040', phase: Math.random() * 10, leaf: true
        });
      }
    }

    // ======================================================================
    // PARÇACIK SİSTEMİ
    // ======================================================================
    addParticle(o) {
      if (this.particles.length > 700) return;
      const life = o.life || 0.5;
      this.particles.push({
        wx: o.wx, wy: o.wy, wz: o.wz || 0,
        vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0,
        color: o.color || '#ffffff', size: o.size || 3,
        life, maxLife: life, alpha: 1,
        grav: o.grav === undefined ? 320 : o.grav,
        additive: o.additive !== false, grow: o.grow || 0, drag: o.drag || 0
      });
    }

    spawnImpact(wx, wy, color, big) {
      this.impacts.push({ wx, wy, wz: 18, color, big, timer: 0.22, duration: 0.22, seed: Math.random() * 100 });
    }

    // ======================================================================
    // DASH / SALDIRI / YETENEKLER (mekanikler değişmedi)
    // ======================================================================
    triggerDash() {
      if (this.player.isDashing || this.player.dashCooldownTimer > 0) return;
      this.player.isDashing = true;
      this.player.dashTimer = this.player.dashDuration;
      this.player.dashCooldownTimer = this.player.dashCooldown;
      this.sound.play('dash');

      const dx = this.mouse.worldX - this.player.x;
      const dy = this.mouse.worldY - this.player.y;
      const len = Math.hypot(dx, dy) || 1;
      const dashSpeed = 680;
      this.player.dashVx = (dx / len) * dashSpeed;
      this.player.dashVy = (dy / len) * dashSpeed;

      this.addTrauma(0.2);
      this.createGhostTrail();
    }

    createGhostTrail() {
      this.player.ghostTrails.push({
        x: this.player.x, y: this.player.y, facingAngle: this.player.facingAngle,
        alpha: 0.75, color: this.getArchetypeColor()
      });
    }

    triggerPrimaryAttack() {
      if (this.player.attackCooldownTimer > 0) return;

      const stats = this.playerData.stats;
      this.player.attackCooldownTimer = this.player.attackCooldown;
      this.player.isAttacking = true;
      this.player.attackAnimTimer = 0.22;
      this.player.swingDir *= -1; // görsel: savurma yönü dönüşümlü

      const archetype = this.player.archetype;
      const aimAngle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);
      this.player.facingAngle = aimAngle;

      const isCrit = Math.random() < (stats.critChance || 0.15);
      const baseDamage = stats.attack || 50;
      const damage = Math.round(isCrit ? baseDamage * (stats.critMultiplier || 2.0) : baseDamage);

      if (archetype === ARCHETYPES.MELEE) {
        this.sound.play(isCrit ? 'crit' : 'slash');
        this.addTrauma(isCrit ? 0.35 : 0.2);
        this.slashes.push({
          x: this.player.x, y: this.player.y, angle: aimAngle, radius: 75, arc: Math.PI * 0.75,
          duration: 0.2, timer: 0.2, color: isCrit ? '#ffb300' : this.player.style.slash, dir: this.player.swingDir
        });
        this.monsters.forEach((m) => {
          if (m.hp <= 0) return;
          const dist = Math.hypot(m.x - this.player.x, m.y - this.player.y);
          if (dist <= 75 + m.radius) {
            const angleToM = Math.atan2(m.y - this.player.y, m.x - this.player.x);
            let diff = Math.abs(angleToM - aimAngle);
            while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
            if (diff <= (Math.PI * 0.75) / 2) this.applyDamageToMonster(m, damage, isCrit, aimAngle, 300);
          }
        });

      } else if (archetype === ARCHETYPES.RANGED) {
        this.sound.play('shoot');
        this.projectiles.push({
          type: 'arrow', x: this.player.x + Math.cos(aimAngle) * 20, y: this.player.y + Math.sin(aimAngle) * 20,
          vx: Math.cos(aimAngle) * 650, vy: Math.sin(aimAngle) * 650, radius: 6, life: 1.2,
          damage, isCrit, color: this.player.style.proj
        });

      } else if (archetype === ARCHETYPES.MAGE) {
        this.sound.play('shoot');
        this.projectiles.push({
          type: 'magic_orb', x: this.player.x + Math.cos(aimAngle) * 20, y: this.player.y + Math.sin(aimAngle) * 20,
          vx: Math.cos(aimAngle) * 520, vy: Math.sin(aimAngle) * 520, radius: 10, life: 1.4,
          damage, isCrit, color: this.player.style.proj
        });

      } else if (archetype === ARCHETYPES.SHADOW) {
        this.sound.play(isCrit ? 'crit' : 'slash');
        this.slashes.push({
          x: this.player.x, y: this.player.y, angle: aimAngle, radius: 65, arc: Math.PI * 0.6,
          duration: 0.16, timer: 0.16, color: this.player.style.slash, dir: this.player.swingDir
        });
        this.monsters.forEach((m) => {
          if (m.hp <= 0) return;
          const dist = Math.hypot(m.x - this.player.x, m.y - this.player.y);
          if (dist <= 65 + m.radius) {
            const angleToM = Math.atan2(m.y - this.player.y, m.x - this.player.x);
            let diff = Math.abs(angleToM - aimAngle);
            while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
            if (diff <= (Math.PI * 0.6) / 2) this.applyDamageToMonster(m, damage, isCrit, aimAngle, 220);
          }
        });

      } else if (archetype === ARCHETYPES.TAMER) {
        this.sound.play('shoot');
        this.projectiles.push({
          type: 'primal_fang', x: this.player.x + Math.cos(aimAngle) * 20, y: this.player.y + Math.sin(aimAngle) * 20,
          vx: Math.cos(aimAngle) * 580, vy: Math.sin(aimAngle) * 580, radius: 8, life: 1.2,
          damage, isCrit, color: this.player.style.proj
        });
        this.commandPetAttack();
      }
    }

    triggerSkill(key) {
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
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 110, duration: 0.35, timer: 0.35, color: '#ffd54f', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 110, stats.attack * 1.5, true);

        } else if (archetype === ARCHETYPES.RANGED) {
          for (let i = -2; i <= 2; i++) {
            const spread = aimAngle + i * 0.18;
            this.projectiles.push({
              type: 'arrow', x: this.player.x, y: this.player.y,
              vx: Math.cos(spread) * 620, vy: Math.sin(spread) * 620, radius: 6, life: 1.1,
              damage: stats.attack * 0.9, isCrit: false, color: '#aed581'
            });
          }

        } else if (archetype === ARCHETYPES.MAGE) {
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 125, duration: 0.4, timer: 0.4, color: '#80deea', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 125, stats.attack * 1.3, false, 350);

        } else if (archetype === ARCHETYPES.SHADOW) {
          for (let i = -3; i <= 3; i++) {
            const spread = aimAngle + i * 0.16;
            this.projectiles.push({
              type: 'dagger', x: this.player.x, y: this.player.y,
              vx: Math.cos(spread) * 700, vy: Math.sin(spread) * 700, radius: 5, life: 0.8,
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
          const gx = this.player.x + Math.cos(aimAngle) * 60, gy = this.player.y + Math.sin(aimAngle) * 60;
          this.aoeEffects.push({ x: gx, y: gy, radius: 95, duration: 0.45, timer: 0.45, color: '#ff9800', cracks: true });
          this.hitEnemiesInRadius(gx, gy, 95, stats.attack * 1.6, true, 280);
          this.spawnExplosionParticles(gx, gy, 14, '#ffb74d');

        } else if (archetype === ARCHETYPES.RANGED) {
          this.aoeEffects.push({ x: this.mouse.worldX, y: this.mouse.worldY, radius: 80, duration: 1.5, timer: 1.5, color: '#689f38', roots: true });
          this.hitEnemiesInRadius(this.mouse.worldX, this.mouse.worldY, 80, stats.attack * 1.1, false, 0);

        } else if (archetype === ARCHETYPES.MAGE) {
          this.sound.play('dash');
          this.createGhostTrail();
          const dist = Math.hypot(this.mouse.worldX - this.player.x, this.mouse.worldY - this.player.y);
          const maxTeleport = Math.min(dist, 220);
          this.player.x += Math.cos(aimAngle) * maxTeleport;
          this.player.y += Math.sin(aimAngle) * maxTeleport;
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 85, duration: 0.35, timer: 0.35, color: '#e040fb', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 85, stats.attack * 1.4, true);

        } else if (archetype === ARCHETYPES.SHADOW) {
          this.sound.play('slash');
          const target = this.getClosestMonsterToMouse(120);
          if (target) {
            this.createGhostTrail();
            this.player.x = target.x - Math.cos(aimAngle) * 35;
            this.player.y = target.y - Math.sin(aimAngle) * 35;
            this.applyDamageToMonster(target, stats.attack * 2.2, true, aimAngle, 300);
          }

        } else if (archetype === ARCHETYPES.TAMER) {
          this.aoeEffects.push({ x: this.player.x, y: this.player.y, radius: 140, duration: 0.4, timer: 0.4, color: '#ffb300', ring: true });
          this.hitEnemiesInRadius(this.player.x, this.player.y, 140, stats.attack * 0.8, false, 400);
        }

      } else if (key === 'r') {
        cd.current = cd.max;
        this.sound.play('ultimate');
        this.addTrauma(0.7);

        const targetX = this.mouse.worldX;
        const targetY = this.mouse.worldY;
        this.aoeEffects.push({
          x: targetX, y: targetY, radius: 170, duration: 0.85, timer: 0.85,
          color: archetype === ARCHETYPES.MAGE ? '#7c4dff' : (archetype === ARCHETYPES.SHADOW ? '#d50000' : '#ffab00'),
          pillar: true
        });
        this.later(() => {
          this.hitEnemiesInRadius(targetX, targetY, 170, stats.attack * 3.4, true, 450);
          this.spawnExplosionParticles(targetX, targetY, 40, '#ffd700');
          this.addTrauma(0.3);
        }, 120);
      }
    }

    hitEnemiesInRadius(cx, cy, radius, damage, canCrit = false, knockback = 200) {
      this.monsters.forEach((m) => {
        if (m.hp <= 0) return;
        const dist = Math.hypot(m.x - cx, m.y - cy);
        if (dist <= radius + m.radius) {
          const isCrit = canCrit && Math.random() < this.playerData.stats.critChance;
          const finalDamage = Math.round(isCrit ? damage * 1.8 : damage);
          const angle = Math.atan2(m.y - cy, m.x - cx);
          this.applyDamageToMonster(m, finalDamage, isCrit, angle, knockback);
        }
      });
    }

    applyDamageToMonster(monster, damage, isCrit, hitAngle, knockbackStrength = 200) {
      if (monster.dead) return;
      monster.hp -= damage;
      monster.flashTimer = 0.12;
      monster.state = 'CHASE';
      monster.vx += Math.cos(hitAngle) * knockbackStrength;
      monster.vy += Math.sin(hitAngle) * knockbackStrength;

      const vampRate = this.playerData.stats.omnivamp || 0;
      if (vampRate > 0) {
        const heal = Math.round(damage * vampRate);
        if (heal > 0) {
          this.playerData.stats.currentHp = Math.min(this.playerData.stats.maxHp, this.playerData.stats.currentHp + heal);
          this.spawnDamageNumber(this.player.x, this.player.y, `+${heal}`, '#69f0ae');
        }
      }

      const txt = isCrit ? `KRİTİK! -${Math.round(damage)}` : `-${Math.round(damage)}`;
      this.spawnDamageNumber(monster.x, monster.y, txt, isCrit ? '#ffd54f' : '#ffffff', isCrit);
      this.spawnImpact(monster.x, monster.y, isCrit ? '#ffd54f' : '#fff3e0', isCrit);
      this.spawnBloodParticles(monster.x, monster.y, hitAngle, isCrit ? 16 : 8, isCrit ? '#ffb300' : '#ef5350');

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
        const gold = Math.floor(10 + Math.random() * 15);
        this.playerData.stats.gold += gold;
        this.later(() => this.spawnDamageNumber(monster.x, monster.y, `+${gold}g`, '#ffd54f'), 150);
        if (this.onStatsChange) this.onStatsChange(this.playerData.stats);

        this.later(() => {
          this.monsters = this.monsters.filter((m) => m.id !== monster.id);
          this.spawnMonsters(1);
        }, 5000);
      }

      if (this.onStatsChange) this.onStatsChange(this.playerData.stats);
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
      const shrine = this.scenery.find((s) => s.type === 'shrine');
      if (!shrine) return false;
      return Math.hypot(shrine.wx - this.player.x, shrine.wy - this.player.y) < 70;
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
    update(dt) {
      this.time += dt;
      const P = this.player;

      // Fare dünya koordinatı her karede güncellenir (kamera kayarken nişan kaymasın)
      const mw = screenToWorld(this.mouse.screenX, this.mouse.screenY, this.camera);
      this.mouse.worldX = mw.x;
      this.mouse.worldY = mw.y;

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

      if (moveX !== 0 || moveY !== 0) {
        const isoMoveX = moveY * 0.707 + moveX * 0.707;
        const isoMoveY = moveY * 0.707 - moveX * 0.707;
        P.vx = isoMoveX * P.baseSpeed;
        P.vy = isoMoveY * P.baseSpeed;
      } else { P.vx = 0; P.vy = 0; }

      // 3. Dash
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

      const maxDistFromCenter = (this.mapRadius - 0.5) * this.tileSize;
      const currentDist = Math.hypot(P.x, P.y);
      if (currentDist > maxDistFromCenter) {
        const ang = Math.atan2(P.y, P.x);
        P.x = Math.cos(ang) * maxDistFromCenter;
        P.y = Math.sin(ang) * maxDistFromCenter;
      }

      P.facingAngle = Math.atan2(this.mouse.worldY - P.y, this.mouse.worldX - P.x);
      P.z += (this.groundZAt(P.x, P.y) - P.z) * (1 - Math.exp(-dt * 14)); // yüksek karolara yumuşak çıkış

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
      if (P.attackAnimTimer > 0) P.attackAnimTimer -= dt;

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

        const distToPlayer = Math.hypot(P.x - m.x, P.y - m.y);
        let walking = false;

        if (distToPlayer < 240) {
          m.state = 'CHASE';
          const angle = Math.atan2(P.y - m.y, P.x - m.x);
          m.facingAngle = angle;
          if (distToPlayer > m.radius + P.radius) {
            m.x += Math.cos(angle) * m.speed * dt;
            m.y += Math.sin(angle) * m.speed * dt;
            walking = true;
          } else if (m.attackTimer <= 0) {
            m.attackTimer = m.attackCooldown;
            const monsterDmg = Math.max(5, m.damage - (this.playerData.stats.defense || 0) * 0.3);
            this.playerData.stats.currentHp = Math.max(0, this.playerData.stats.currentHp - Math.round(monsterDmg));
            this.addTrauma(0.3);
            this.hurt = 0.35;
            this.sound.play('hit');
            this.spawnDamageNumber(P.x, P.y, `-${Math.round(monsterDmg)}`, '#ff5252');
            this.spawnBloodParticles(P.x, P.y, angle, 6, '#ff5252');
            if (this.onStatsChange) this.onStatsChange(this.playerData.stats);
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
          if (pd > 10) {
            const pAngle = Math.atan2(pdy, pdx);
            m.facingAngle = pAngle;
            m.x += Math.cos(pAngle) * (m.speed * 0.45) * dt;
            m.y += Math.sin(pAngle) * (m.speed * 0.45) * dt;
            walking = true;
          }
        }
        m.walkPhase += dt * (walking ? 9 : 2.2);
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
        for (const m of this.monsters) {
          if (m.hp <= 0) continue;
          const d = Math.hypot(m.x - p.x, m.y - p.y);
          if (d <= m.radius + p.radius) {
            hit = true;
            this.applyDamageToMonster(m, p.damage, p.isCrit, Math.atan2(p.vy, p.vx), 220);
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
        if (aoe.pillar && aoe.timer > 0 && Math.random() < 0.7) {
          const a = Math.random() * TAU, r = Math.random() * aoe.radius * 0.8;
          this.addParticle({
            wx: aoe.x + Math.cos(a) * r, wy: aoe.y + Math.sin(a) * r, wz: 4,
            vx: 0, vy: 0, vz: 120 + Math.random() * 120, color: aoe.color, size: 2 + Math.random() * 2, life: 0.6, grav: 0
          });
        }
        if (aoe.timer <= 0) this.aoeEffects.splice(i, 1);
      }

      // vuruş patlamaları
      for (let i = this.impacts.length - 1; i >= 0; i--) {
        this.impacts[i].timer -= dt;
        if (this.impacts[i].timer <= 0) this.impacts.splice(i, 1);
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
        if (m.leaf) {
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

      // 12. Kamera (kare hızından bağımsız yumuşak takip)
      const targetScreen = worldToScreen(P.x, P.y, 0, { x: 0, y: 0 });
      this.camera.targetX = this.width / 2 - targetScreen.x;
      this.camera.targetY = this.height / 2 - targetScreen.y + 40;
      const camLerp = 1 - Math.exp(-7.6 * dt);
      this.camera.x += (this.camera.targetX - this.camera.x) * camLerp + this.shake.x;
      this.camera.y += (this.camera.targetY - this.camera.y) * camLerp + this.shake.y;
    }

    // ======================================================================
    // RENDER
    // ======================================================================
    render() {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);

      // Arka plan: derin gece + yıldızlar
      const bg = ctx.createRadialGradient(this.width / 2, this.height / 2, 60, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8);
      bg.addColorStop(0, '#101a20');
      bg.addColorStop(0.6, '#070b0e');
      bg.addColorStop(1, '#020304');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.width, this.height);
      for (const s of this.stars) {
        ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(this.time * 1.2 + s.tw));
        ctx.fillStyle = '#cfe8ff';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      this.render3DTiles(ctx);
      this.renderLighting(ctx);
      this.renderShadows(ctx);
      this.renderAoEEffects(ctx);
      this.renderSortedEntities(ctx);
      this.renderProjectilesAndSlashes(ctx);
      this.renderParticles(ctx);
      this.renderDamageNumbers(ctx);
      this.renderAtmosphericVignette(ctx);
      this.renderWorldOverlay(ctx);
    }

    // ---------------- KAROLAR ----------------
    getTileSprite(type, variant, elev) {
      const key = type + '|' + variant + '|' + elev;
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

      const sprite = { canvas: cv, ox, oy, w, h };
      this.tileSprites[key] = sprite;
      return sprite;
    }

    render3DTiles(ctx) {
      const hw = this.tileSize * COS_30, hh = this.tileSize * SIN_30, th = this.tileThickness;
      for (const t of this.tiles) {
        const p = this.iso(t.wx, t.wy, t.wz);
        const sx = Math.round(p.x), sy = Math.round(p.y);
        if (sx < -120 || sx > this.width + 120 || sy < -120 || sy > this.height + 140) continue;

        const sp = this.getTileSprite(t.type, t.variant, t.wz);
        ctx.drawImage(sp.canvas, sx - sp.ox, sy - sp.oy, sp.w, sp.h);

        // Ada kenarına doğru kararma (derinlik hissi)
        if (t.edge > 0.03) {
          const full = th + t.wz;
          ctx.fillStyle = `rgba(2,4,6,${(t.edge * 0.55).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(sx, sy - hh); ctx.lineTo(sx + hw, sy); ctx.lineTo(sx + hw, sy + full);
          ctx.lineTo(sx, sy + hh + full); ctx.lineTo(sx - hw, sy + full); ctx.lineTo(sx - hw, sy);
          ctx.closePath(); ctx.fill();
        }
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
      this.scenery.forEach((s) => {
        if (s.type === 'shrine') {
          const sp = this.iso(s.wx, s.wy, 0);
          drawGlowEllipse(ctx, sp.x, sp.y, 150, 85, '#00e5ff', 0.14 + 0.06 * Math.sin(t * 2.4));
        } else if (s.type === 'lantern') {
          const sp = this.iso(s.wx, s.wy, 0);
          drawGlowEllipse(ctx, sp.x, sp.y, 90, 50, '#ffcc66', 0.16 + 0.03 * Math.sin(t * 5 + s.wx));
        } else if (s.type === 'mushroom') {
          const sp = this.iso(s.wx, s.wy, 0);
          drawGlowEllipse(ctx, sp.x, sp.y, 34, 18, '#7cf0ff', 0.22);
        }
      });
      ctx.restore();

      // Zemin sisi: yavaş süzülen yumuşak bulutlar
      ctx.save();
      for (let i = 0; i < 9; i++) {
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

      this.scenery.forEach((s) => {
        if (s.type === 'tree') soft(s.wx, s.wy, 0, 34 * s.scale, 16 * s.scale, 0.6, 7, 3);
        else if (s.type === 'boulder') soft(s.wx, s.wy, 0, 24 * s.scale, 11 * s.scale, 0.55, 4, 2);
        else if (s.type === 'shrine') soft(s.wx, s.wy, 0, 40, 19, 0.6);
        else if (s.type === 'mushroom') soft(s.wx, s.wy, 0, 12 * s.scale, 6 * s.scale, 0.5);
        else if (s.type === 'lantern') soft(s.wx, s.wy, 0, 12, 6, 0.5);
      });

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
      ctx.strokeStyle = hover ? 'rgba(255,82,82,0.85)' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = -this.time * 14;
      ctx.beginPath();
      ctx.ellipse(mp.x, mp.y, 14 * ISO_RX, 14 * ISO_RY, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
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

        if (aoe.ring) {
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

    // ---------------- DERİNLİĞE GÖRE SIRALI VARLIKLAR ----------------
    renderSortedEntities(ctx) {
      const list = [];
      this.scenery.forEach((s) => list.push({ depth: s.wx + s.wy, type: 'scenery', data: s }));
      this.monsters.forEach((m) => {
        if (m.hp > 0 || m.deathTimer > 0) list.push({ depth: m.x + m.y, type: 'monster', data: m });
      });
      if (this.companion.active) list.push({ depth: this.companion.x + this.companion.y, type: 'pet', data: this.companion });
      this.player.ghostTrails.forEach((gt) => list.push({ depth: gt.x + gt.y - 1, type: 'ghost', data: gt }));
      list.push({ depth: this.player.x + this.player.y, type: 'player', data: this.player });
      list.sort((a, b) => a.depth - b.depth);

      list.forEach((item) => {
        if (item.type === 'scenery') this.drawSceneryItem(ctx, item.data);
        else if (item.type === 'monster') this.drawMonster(ctx, item.data);
        else if (item.type === 'player') this.drawPlayer(ctx, item.data);
        else if (item.type === 'pet') this.drawCompanionPet(ctx, item.data);
        else if (item.type === 'ghost') this.drawGhostTrail(ctx, item.data);
      });
    }

    // ---------------- ÇEVRE: AĞAÇ / KAYA / FENER / MANTAR / TAŞ ----------------
    drawSceneryItem(ctx, s) {
      const { x, y } = this.iso(s.wx, s.wy, 0);
      if (x < -90 || x > this.width + 90 || y < -130 || y > this.height + 60) return;
      const t = this.time;

      if (s.type === 'tree') {
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
    drawPlayer(ctx, p) {
      const { x, y } = this.iso(p.x, p.y, p.z);
      const S = p.style || (p.style = getClassStyle(this.playerData.class));
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
      const env = { fx, fy, front, capeSX, t };
      const handCol = S.gloveCol || S.skin || '#d7a06a';
      const armCol = S.armCol || (S.body === 'bare' ? S.skin : o.cloth);

      ctx.save();
      ctx.translate(x, y);
      if (S.ground) groundFx(ctx, t, S.ground);

      ctx.save();
      ctx.translate(0, bob);
      ctx.rotate(lean);
      ctx.scale(S.scale, S.scale);

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
          ctx.fillStyle = S.pantsCol || (S.body === 'bare' ? S.skin : o.cloth);
          rr(ctx, lx - 2.6 + dx * 0.5, -10, 5.2, 8, 2); ctx.fill();
          ctx.fillStyle = S.bootCol || (S.body === 'bare' ? shade(S.skin, -0.45) : '#3a2412');
          rr(ctx, lx - 3.3 + dx, -5 - lift, 6.6, 6, 2.2); ctx.fill();
          ctx.fillStyle = S.bootCol ? shade(S.bootCol, 0.25) : (S.body === 'bare' ? shade(S.skin, -0.2) : '#6a4a2a');
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
        ctx.fillStyle = S.beltCol || (S.body === 'robe' ? o.cloth : '#4a2c14'); ctx.fillRect(-7.5, -13, 15, 3);   // kemer
        ctx.fillStyle = o.trim; ctx.fillRect(-1.8, -13.2, 3.6, 3.4);
      }

      // Omuzluklar
      drawShoulders(ctx, S, o);

      // Kollar (silah eline uzanır)
      const hx = fx * 6, hy = -17 + fy * 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = armCol; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(fx >= 0 ? -7 : 7, -23); ctx.lineTo(fx >= 0 ? -9 : 9, -15 + Math.sin(ph) * (moving ? 2 : 0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx >= 0 ? 7 : -7, -23); ctx.lineTo(hx, hy); ctx.stroke();
      drawHand(ctx, S, hx, hy, fx >= 0 ? 7 : -7, -23, handCol);
      drawHand(ctx, S, fx >= 0 ? -9 : 9, -15 + Math.sin(ph) * (moving ? 2 : 0), fx >= 0 ? -7 : 7, -23, handCol);

      // Yan el kalkanı (önde)
      if (front && S.offhand) drawShield(ctx, S, o, env);

      if (!front) drawCape(); // sırtı dönükse pelerin gövdenin önünde
      if (S.wings && !front) wingsFx(ctx, S, t, moving);

      // ---- Baş ----
      drawHeadBase(ctx, S, o, env);
      if (S.hair) drawHair(ctx, S, env);
      const ownFace = drawHeadGear(ctx, S, o, env);

      // Yüz
      if (front && !ownFace) drawFace(ctx, S, o, env);

      haloFx(ctx, S, t, false);

      // Silah önde
      if (front) this.drawWeapon(ctx, p, S, fa);

      // --- ön katman efektleri ---
      if (S.orbit) orbitFx(ctx, t, S.orbit, true);
      if (S.rise && S.rise.kind !== 'smoke' && S.rise.kind !== 'dust') riseFx(ctx, t, S.rise);

      ctx.restore(); // gövde dönüşümü

      // İsim plakası (boy/başlık yüksekliğine göre yukarı kayar)
      const lift = Math.max(0, 46 * S.scale + (HEAD_TALL[S.head] || 0) + (S.halo ? 5 : 0) + (S.crown ? 4 : 0) - 50);
      ctx.font = 'bold 12px Cinzel, Inter, sans-serif';
      const nm = String(this.playerData.name || '');
      const w = ctx.measureText(nm).width;
      ctx.fillStyle = 'rgba(6,14,18,0.6)';
      rr(ctx, -w / 2 - 6, -70 - lift, w + 12, 16, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(128,222,234,0.45)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#80deea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(nm, 0, -62 - lift);

      ctx.restore();
    }

    // Fare yönüne dönen silah (ekran uzayında doğru açı). Saldırı animasyonu silah türüne göre:
    // swing (geniş savurma) · slash (hızlı çapraz) · slam (yukarıdan vurma) · thrust (saplama) · shoot/cast (geri tepme)
    drawWeapon(ctx, p, S, fa) {
      const o = S.pal;
      const fx = Math.cos(fa), fy = Math.sin(fa);
      const t = this.time;
      let ang = fa;
      const atk = p.attackAnimTimer > 0 ? 1 - p.attackAnimTimer / 0.22 : -1;
      const mode = S.atkMode;
      if (atk >= 0) {
        if (mode === 'swing') ang += (easeOut(atk) - 0.5) * 2.4 * p.swingDir;
        else if (mode === 'slash') ang += (easeOut(atk) - 0.5) * 1.7 * p.swingDir;
        else if (mode === 'slam') ang += (easeOut(atk) - 0.8) * 2.4;
      }
      const recoil = atk >= 0 ? (1 - atk) * 3 : 0;

      ctx.save();
      ctx.translate(fx * 6, -17 + fy * 3);
      ctx.rotate(ang);
      if (mode === 'slam' && atk >= 0) ctx.translate(Math.sin(atk * Math.PI) * 5, 0);
      drawWeaponKind(ctx, S, o, t, atk, recoil);
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
      if (m.kind === 'treant') this.paintTreant(g, m, t, face, atkT);
      else if (m.kind === 'wraith') this.paintWraith(g, m, t, face, atkT);
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
      const topY = m.radius * (m.kind === 'treant' ? 2.9 : 2.5) + (m.kind === 'wraith' ? 10 : 0) + 8;
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

      const skin0 = '#8bc34a', skin1 = '#4f8a2b', skinDark = '#33691e';

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
      gr.addColorStop(0, '#a5d66a'); gr.addColorStop(1, skin1);
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
      gr.addColorStop(0, '#7a5240'); gr.addColorStop(0.45, '#5a382a'); gr.addColorStop(1, '#2a1710');
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
      g.fillStyle = '#4e7a2a';
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
      drawGlow(g, 0, -hover - 22, 40, '#7c4dff', 0.28);
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
      gr.addColorStop(0, '#4a2fa0'); gr.addColorStop(0.55, '#26135e'); gr.addColorStop(1, '#0b0620');
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
    renderParticles(ctx) {
      ctx.save();
      // 1) Katı parçacıklar (toz, kan damlaları)
      for (const p of this.particles) {
        if (p.additive) continue;
        const { x, y } = this.iso(p.wx, p.wy, p.wz);
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, p.size), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2) Parlayan neon parçacıklar
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.particles) {
        if (!p.additive) continue;
        const { x, y } = this.iso(p.wx, p.wy, p.wz);
        ctx.globalAlpha = p.alpha;
        drawGlow(ctx, x, y, p.size * 3.2, p.color, 0.9);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.4, p.size * 0.38), 0, TAU); ctx.fill();
      }
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
      const grad = ctx.createRadialGradient(cx, cy, Math.min(this.width, this.height) * 0.42, cx, cy, Math.max(this.width, this.height) * 0.78);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.42)');
      grad.addColorStop(1, 'rgba(0,0,0,0.88)');
      ctx.fillStyle = grad;
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
      const mx = this.mouse.screenX, my = this.mouse.screenY;
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
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;
      this.update(dt);
      this.render();
      requestAnimationFrame(this.loop);
    }

    // ======================================================================
    // DIŞARIYA AÇIK API (değişmedi)
    // ======================================================================
    setPlayerClass(newClass) {
      this.playerData.class = newClass;
      this.player.archetype = getArchetype(newClass);
      this.player.style = getClassStyle(newClass);
      this.companion.active = this.player.archetype === ARCHETYPES.TAMER;
    }

    updateStats(newStats) {
      this.playerData.stats = { ...this.playerData.stats, ...newStats };
      this.player.baseSpeed = this.playerData.stats.speed || 210;
    }

    destroy() {
      this.isRunning = false;
      window.removeEventListener('resize', this.boundResize);
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
      this.canvas.removeEventListener('mousemove', this._onMouseMove);
      this.canvas.removeEventListener('mousedown', this._onMouseDown);
      this.canvas.removeEventListener('mouseup', this._onMouseUp);
      this.canvas.removeEventListener('contextmenu', this._onContext);
      if (this.canvas.style) this.canvas.style.cursor = this._prevCursor || '';
      this.timeouts.forEach((id) => clearTimeout(id));
      this.timeouts.clear();
    }
  }

  TravelEngine.registerClassStyle = registerClassStyle;
  TravelEngine.getClassStyle = getClassStyle;
  TravelEngine.CLASS_STYLES = CLASS_STYLES;
  TravelEngine.CLASS_MAP = CLASS_MAP;
  TravelEngine.normKey = normKey;
  global.TravelEngine = TravelEngine;
  global.ARCHETYPES = ARCHETYPES;
  global.CLASS_MAP = CLASS_MAP;

})(typeof window !== 'undefined' ? window : this);
