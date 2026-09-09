/**
 * =========================================================================
 * SETRA VFX ENGINE — 80 GÖRSEL EFEKT KÜTÜPHANESİ (STANDALONE ASSET)
 * =========================================================================
 *
 * Bu dosya HTML5 Canvas üzerinde çalışan, hiçbir harici kütüphane gerektirmeyen
 * tam 80 adet görsel yetenek efektini barındırır.
 *
 * KULLANIM:
 * 1. HTML sayfanıza bir canvas ekleyin:
 *    <canvas id="gameVfxCanvas" style="position:absolute; pointer-events:none; width:100%; height:100%;"></canvas>
 *
 * 2. Bu dosyayı sayfaya dahil edin:
 *    <script src="effects.js"></script>
 *
 * 3. Efekt motorunu başlatın:
 *    const vfx = new SetraEffects('gameVfxCanvas');
 *
 * 4. İstediğiniz efekti oynatın:
 *    vfx.play('blood_scythe', { fromX: 400, fromY: 500, toX: 400, toY: 150 });
 *    vfx.play('frost_crystal_spear', { fromX: 400, fromY: 500, toX: 400, toY: 150 });
 *    vfx.play('earth_fissure_rupture', { toX: 400, toY: 150 });
 *
 * 5. Socket.io ile kullanım:
 *    socket.on('skill_effect', (data) => {
 *        vfx.play(data.effectId, { fromX: data.casterX, fromY: data.casterY, toX: data.targetX, toY: data.targetY });
 *    });
 *
 * NOT: play(id) artık EFEKT ID'sini SETRA_EFFECTS_REGISTRY üzerinden çözer.
 *      Bilinmeyen bir ID güvenle varsayılan "rising kesik + patlama" efektine düşer.
 */

(function (window) {

  // ---------------- Genel matematik yardımcıları ----------------
  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ---------------- Kategori temaları ----------------
  // Seeded from CONTENT.elements at runtime (SetraEffects.setElements) so the
  // colors stay in sync with the editor's Elements page. The static list below
  // is only the fallback used before element data has been received.
  let CAT_PALETTES = {
    blood:     ['#dc2626', '#b91c1c', '#7f1d1d'],
    dark:      ['#a855f7', '#7c3aed', '#4c1d95'],
    fire:      ['#f97316', '#ef4444', '#fde047'],
    earth:     ['#854d0e', '#a16207', '#713f12', '#57534e'],
    frost:     ['#38bdf8', '#7dd3fc', '#0ea5e9', '#e0f2fe'],
    lightning: ['#facc15', '#fef08a', '#ffffff'],
    holy:      ['#facc15', '#ffffff', '#fde047'],
    physical:  ['#ffffff', '#fde047', '#94a3b8'],
    arcane:    ['#a78bfa', '#7c3aed', '#e0e7ff'],
    water:     ['#3b82f6', '#2563eb', '#0ea5e9'],
    shadow:    ['#6b7280', '#4b5563', '#374151'],
    nature:    ['#4ade80', '#22c55e', '#15803d', '#bef264']
  };
  let CAT_GRAVITY = {
    blood: 0.22, dark: -0.05, fire: -0.08, earth: 0.25,
    frost: 0.13, lightning: 0.06, holy: -0.04, physical: 0.16,
    arcane: 0.02, water: 0.1, shadow: -0.05, nature: 0.08
  };
  const CAT_SHAPE = { earth: 'rock', frost: 'shard' };

  // 80 EFEKT LİSTESİ VE VERİLERİ
  const EFFECTS_REGISTRY = [
    // 1. KAN / BLOOD (10)
    { id: "blood_scythe", name: "Crimson Scythe Bleed", cat: "blood", color: "#dc2626", type: "slash" },
    { id: "blood_splatter", name: "Arterial Spray", cat: "blood", color: "#b91c1c", type: "burst" },
    { id: "blood_eruption", name: "Hemomancy Geyser", cat: "blood", color: "#e11d48", type: "eruption" },
    { id: "blood_vortex", name: "Sanguine Whirlpool", cat: "blood", color: "#ef4444", type: "vortex" },
    { id: "blood_needles", name: "Crimson Spikes", cat: "blood", color: "#f43f5e", type: "projectile" },
    { id: "blood_drain", name: "Life Leech Tendrils", cat: "blood", color: "#be123c", type: "projectile" },
    { id: "blood_scythe_cross", name: "Double Scythe Cross", cat: "blood", color: "#991b1b", type: "slash" },
    { id: "blood_curse_mist", name: "Boiling Blood Mist", cat: "blood", color: "#881337", type: "burst" },
    { id: "blood_cleave", name: "Visceral Cleave", cat: "blood", color: "#b91c1c", type: "slash" },
    { id: "blood_nova", name: "Sanguine Nova", cat: "blood", color: "#dc2626", type: "shockwave" },

    // 2. KARANLIK & TIRPAN / DARK (10)
    { id: "shadow_scythe_reap", name: "Soul Reaper Scythe", cat: "dark", color: "#9333ea", type: "slash" },
    { id: "void_rift_tear", name: "Abyssal Rift", cat: "dark", color: "#7e22ce", type: "burst" },
    { id: "shadow_spikes_rise", name: "Shadow Impale", cat: "dark", color: "#581c87", type: "eruption" },
    { id: "dark_matter_orb", name: "Void Core Orb", cat: "dark", color: "#a855f7", type: "projectile" },
    { id: "soul_harvest_wisps", name: "Soul Harvest", cat: "dark", color: "#c084fc", type: "burst" },
    { id: "dark_cross_execution", name: "Death Mark Cross", cat: "dark", color: "#6b21a8", type: "slash" },
    { id: "eclipse_wave", name: "Eclipse Shockwave", cat: "dark", color: "#4c1d95", type: "shockwave" },
    { id: "shadow_tendrils", name: "Abyss Grasp", cat: "dark", color: "#3b0764", type: "vortex" },
    { id: "phantom_dagger_barrage", name: "Phantom Daggers", cat: "dark", color: "#7c3aed", type: "projectile" },
    { id: "black_hole_implosion", name: "Singularity Implosion", cat: "dark", color: "#2e1065", type: "burst" },

    // 3. ATEŞ / FIRE (10)
    { id: "fire_meteor_crash", name: "Cataclysmic Meteor", cat: "fire", color: "#ea580c", type: "projectile" },
    { id: "flame_pillar_inferno", name: "Inferno Pillar", cat: "fire", color: "#f97316", type: "pillar" },
    { id: "fire_slash_arc", name: "Blazing Crescent", cat: "fire", color: "#ff5722", type: "slash" },
    { id: "dragon_breath_cone", name: "Dragon's Breath", cat: "fire", color: "#dc2626", type: "burst" },
    { id: "magma_eruption_burst", name: "Magma Eruption", cat: "fire", color: "#c2410c", type: "eruption" },
    { id: "phoenix_wings_sweep", name: "Phoenix Wings", cat: "fire", color: "#f97316", type: "burst" },
    { id: "ember_whirlwind", name: "Fire Cyclone", cat: "fire", color: "#fb923c", type: "vortex" },
    { id: "scorch_wave_ring", name: "Incinerate Ring", cat: "fire", color: "#ef4444", type: "shockwave" },
    { id: "fireball_streak", name: "Pyroclastic Bolt", cat: "fire", color: "#ea580c", type: "projectile" },
    { id: "supernova_blast", name: "Solar Supernova", cat: "fire", color: "#f59e0b", type: "burst" },

    // 4. TOPRAK / EARTH (10)
    { id: "earth_fissure_rupture", name: "Earth Rupture", cat: "earth", color: "#854d0e", type: "eruption" },
    { id: "boulder_crush_drop", name: "Titan Boulder", cat: "earth", color: "#713f12", type: "burst" },
    { id: "seismic_shockwave_ring", name: "Seismic Slam", cat: "earth", color: "#a16207", type: "shockwave" },
    { id: "sandstorm_vortex_spin", name: "Desert Sandstorm", cat: "earth", color: "#d97706", type: "vortex" },
    { id: "stone_spikes_impale", name: "Stone Spikes", cat: "earth", color: "#65a30d", type: "eruption" },
    { id: "rock_avalanche_barrage", name: "Stone Barrage", cat: "earth", color: "#78716c", type: "projectile" },
    { id: "earth_hammer_quake", name: "Earthshaker Hammer", cat: "earth", color: "#b45309", type: "slash" },
    { id: "crystal_earth_shards", name: "Geode Crystal Burst", cat: "earth", color: "#65a30d", type: "burst" },
    { id: "mud_splash_entangle", name: "Quicksand Splash", cat: "earth", color: "#451a03", type: "burst" },
    { id: "granite_armor_shatter", name: "Granite Shatter", cat: "earth", color: "#57534e", type: "burst" },

    // 5. BUZ & SU / FROST & WATER (10)
    { id: "frost_crystal_spear", name: "Glacial Javelin", cat: "frost", color: "#38bdf8", type: "projectile" },
    { id: "frost_nova_freeze", name: "Absolute Zero Nova", cat: "frost", color: "#0284c7", type: "shockwave" },
    { id: "ice_sword_uppercut", name: "Frostbite Slash", cat: "frost", color: "#7dd3fc", type: "slash" },
    { id: "blizzard_cyclone_vortex", name: "Blizzard Vortex", cat: "frost", color: "#0ea5e9", type: "vortex" },
    { id: "ice_spikes_ground", name: "Glacial Spikes", cat: "frost", color: "#38bdf8", type: "eruption" },
    { id: "tidal_wave_water", name: "Tidal Surge", cat: "frost", color: "#2563eb", type: "burst" },
    { id: "frozen_orb_shatter", name: "Frozen Orb", cat: "frost", color: "#06b6d4", type: "projectile" },
    { id: "icicle_rain_barrage", name: "Icicle Hail", cat: "frost", color: "#0284c7", type: "burst" },
    { id: "water_whip_lash", name: "Aqua Whip", cat: "frost", color: "#3b82f6", type: "slash" },
    { id: "frost_prison_dome", name: "Ice Coffin", cat: "frost", color: "#0369a1", type: "burst" },

    // 6. YILDIRIM / LIGHTNING (10)
    { id: "lightning_strike_heavy", name: "Thunderbolt Strike", cat: "lightning", color: "#facc15", type: "lightning" },
    { id: "chain_lightning_arc", name: "Chain Lightning", cat: "lightning", color: "#eab308", type: "lightning" },
    { id: "ball_lightning_plasma", name: "Plasma Sphere", cat: "lightning", color: "#ca8a04", type: "projectile" },
    { id: "lightning_slash_blade", name: "Raikiri Slash", cat: "lightning", color: "#fde047", type: "slash" },
    { id: "electric_field_discharge", name: "Overload Discharge", cat: "lightning", color: "#eab308", type: "burst" },
    { id: "storm_tornado_vortex", name: "Thunder Tornado", cat: "lightning", color: "#fbbf24", type: "vortex" },
    { id: "emp_shockwave_ring", name: "EMP Blast", cat: "lightning", color: "#facc15", type: "shockwave" },
    { id: "triple_thunder_judgement", name: "Triple Thunder", cat: "lightning", color: "#fef08a", type: "lightning" },
    { id: "electric_sparks_shower", name: "Volt Spark Shower", cat: "lightning", color: "#fde047", type: "burst" },
    { id: "storm_spear_throw", name: "Storm Javelin", cat: "lightning", color: "#eab308", type: "projectile" },

    // 7. KUTSAL / HOLY (10)
    { id: "holy_pillar_smite", name: "Divine Smite", cat: "holy", color: "#facc15", type: "pillar" },
    { id: "radiance_sword_slash", name: "Blessed Blade", cat: "holy", color: "#fef08a", type: "slash" },
    { id: "holy_cross_burst", name: "Sacred Cross", cat: "holy", color: "#fde047", type: "burst" },
    { id: "heal_aura_fountain", name: "Celestial Fountain", cat: "holy", color: "#4ade80", type: "burst" },
    { id: "radiant_halo_shield", name: "Solar Aegis", cat: "holy", color: "#f59e0b", type: "shockwave" },
    { id: "angel_feathers_scatter", name: "Seraphic Feathers", cat: "holy", color: "#ffffff", type: "burst" },
    { id: "judgement_solar_flare", name: "Solar Flare", cat: "holy", color: "#facc15", type: "shockwave" },
    { id: "holy_lance_projectile", name: "Lance of Light", cat: "holy", color: "#fef08a", type: "projectile" },
    { id: "divine_retribution_ring", name: "Ring of Purity", cat: "holy", color: "#eab308", type: "shockwave" },
    { id: "dawn_star_explosion", name: "Morning Star", cat: "holy", color: "#ffffff", type: "burst" },

    // 8. FİZİKSEL & KILIÇ / PHYSICAL (10)
    { id: "rising_katana_slash", name: "Rising Dragon Cut", cat: "physical", color: "#ffffff", type: "slash" },
    { id: "cross_cut_x_slash", name: "Twin Blade X-Cut", cat: "physical", color: "#f87171", type: "slash" },
    { id: "heavy_hammer_slam", name: "Colossal Impact", cat: "physical", color: "#fb923c", type: "slash" },
    { id: "whirlwind_blade_spin", name: "Cyclone Flurry", cat: "physical", color: "#cbd5e1", type: "vortex" },
    { id: "piercing_rapier_thrust", name: "Stinger Thrust", cat: "physical", color: "#ffffff", type: "projectile" },
    { id: "axe_cleave_horizontal", name: "Battleaxe Cleave", cat: "physical", color: "#ea580c", type: "slash" },
    { id: "sonic_air_blade", name: "Windcutter Wave", cat: "physical", color: "#94a3b8", type: "projectile" },
    { id: "shield_bash_shock", name: "Shield Bash", cat: "physical", color: "#64748b", type: "shockwave" },
    { id: "triple_dagger_slash", name: "Thousand Daggers", cat: "physical", color: "#e2e8f0", type: "slash" },
    { id: "guillotine_fall", name: "Executioner's Fall", cat: "physical", color: "#dc2626", type: "slash" },

    // 9. DOĞA / NATURE (2)
    { id: "nature_vine_burst", name: "Thornbloom Burst", cat: "nature", color: "#4ade80", type: "burst" },
    { id: "nature_vine_projectile", name: "Vine Spear", cat: "nature", color: "#22c55e", type: "projectile" }
  ];

  class SetraEffects {
    // Accepts CONTENT.elements so every element (including ones added in the
    // editor) gets its own palette, gravity and a working auto-generated VFX:
    //   element_<id>                    — colored burst on the target
    //   element_<id>_projectile         — colored projectile that flies to the target
    // Elements with a custom `effect`/`travel` defined in the Elements page still
    // use those (via the screens.js resolvers); this is just the safety net.
    static setElements(elements) {
      if (!Array.isArray(elements)) return;
      for (const el of elements) {
        if (!el || !el.id) continue;
        const pal = (Array.isArray(el.palette) && el.palette.length) ? el.palette : [el.color || "#ffffff"];
        if (pal.length) CAT_PALETTES[el.id] = pal;
        if (typeof el.gravity === "number") CAT_GRAVITY[el.id] = el.gravity;
        if (!EFFECTS_REGISTRY.some((x) => x.id === "element_" + el.id)) {
          EFFECTS_REGISTRY.push({ id: "element_" + el.id, name: (el.name || el.id) + " Burst", cat: el.id, color: pal[0], type: "burst" });
        }
        if (!EFFECTS_REGISTRY.some((x) => x.id === "element_" + el.id + "_projectile")) {
          EFFECTS_REGISTRY.push({ id: "element_" + el.id + "_projectile", name: (el.name || el.id) + " Projectile", cat: el.id, color: pal[0], type: "projectile" });
        }
      }
    }

    constructor(canvasId) {
      this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
      if (!this.canvas) throw new Error('Canvas element not found: ' + canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.projectiles = [];
      this.slashes = [];
      this.lightnings = [];
      this.flashes = [];
      this.rings = [];
      this.swirls = [];
      this.pillars = [];
      this.spikes = [];
      this.domes = [];
      this.geysers = [];
      this.beams = []; // caster -> hedef arasi cizilen lazer/isinsal efektler (capraz dahil)
      this.registry = EFFECTS_REGISTRY;

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.loop();
    }

    resize() {
      this.canvas.width = this.canvas.clientWidth || window.innerWidth;
      this.canvas.height = this.canvas.clientHeight || window.innerHeight;
    }

    getEffectList() {
      return this.registry;
    }

    // ANA ÇALIŞTIRICI METOD — registry tabanlı dispatch
    play(effectId, opts = {}) {
      const fromX = opts.fromX !== undefined ? opts.fromX : this.canvas.width / 2;
      const fromY = opts.fromY !== undefined ? opts.fromY : this.canvas.height - 80;
      const toX = opts.toX !== undefined ? opts.toX : this.canvas.width / 2;
      const toY = opts.toY !== undefined ? opts.toY : 150;
      const onHit = opts.onHit;

      const def = this.registry.find((e) => e.id === effectId) || { cat: "physical", color: "#ffffff", type: "burst" };
      const cat = def.cat;
      const color = def.color || "#ffffff";
      const type = def.type || "burst";

      // LAZER/BEAM MODU: efekt hedefte degil, caster'dan hedefe cizilir.
      // screens.js bu modu travel:'beam' ile ister (bolt/ray/laser skilleri).
      if (opts.travel === 'beam') {
        this._beamFx(cat, color, fromX, fromY, toX, toY, onHit);
        return;
      }

      switch (type) {
        case "slash": this._slashFx(effectId, cat, color, toX, toY, onHit); break;
        case "projectile": this._projectileFx(effectId, cat, color, fromX, fromY, toX, toY, onHit); break;
        case "eruption": this._eruptionFx(effectId, cat, color, toX, toY, onHit); break;
        case "vortex": this._vortexFx(effectId, cat, color, toX, toY, onHit); break;
        case "pillar": this._pillarFx(effectId, cat, color, toX, toY, onHit); break;
        case "shockwave": this._shockwaveFx(effectId, cat, color, toX, toY, onHit); break;
        case "lightning": this._lightningFx(effectId, cat, color, toX, toY, onHit); break;
        default: this._burstFx(effectId, cat, color, toX, toY, onHit); break;
      }
    }

    // ---------------- BURST (varsayılan + özel) ----------------
    _burstFx(id, cat, color, x, y, onHit) {
      switch (id) {
        case 'supernova_blast':
        case 'dawn_star_explosion': {
          this.flashes.push({ x, y, radius: 210, alpha: 1, color, speed: 0.05 });
          this.rings.push({ x, y, progress: 0, speed: 0.09, color, cat, maxR: 120, lineWidth: 10 });
          this.rings.push({ x, y, progress: -0.22, speed: 0.07, color, cat, maxR: 140, lineWidth: 5 });
          this._themeBurst(cat, color, x, y, 70, 1.6, 0.05);
          this._sparkBurst(cat, color, x, y);
          break;
        }
        case 'black_hole_implosion': {
          for (let i = 0; i < 34; i++) {
            const a = (i / 34) * Math.PI * 2;
            const r = rand(30, 90);
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            this.particles.push({
              x: px, y: py,
              vx: (x - px) * 0.18, vy: (y - py) * 0.18,
              size: rand(3, 7), color, alpha: 1, gravity: 0, life: 0, maxLife: 22, shape: 'shard'
            });
          }
          this.rings.push({ x, y, progress: 0, speed: 0.12, color, cat, maxR: 70, lineWidth: 6, delay: 22 });
          this.flashes.push({ x, y, radius: 90, alpha: 0.9, color: '#581c87', speed: 0.05, delay: 22 });
          break;
        }
        case 'heal_aura_fountain': {
          this.geysers.push({ x, y: y + 6, progress: 0, duration: 34, cat: 'holy', color: '#4ade80', spread: 0.5, power: 5.5 });
          this.rings.push({ x, y, progress: 0, speed: 0.06, color: '#4ade80', cat: 'holy', maxR: 80, lineWidth: 4 });
          this._themeBurst('holy', '#facc15', x, y, 22, 0.8, -0.04);
          break;
        }
        case 'angel_feathers_scatter': {
          for (let i = 0; i < 30; i++) {
            this.particles.push({
              x: x + rand(-30, 30), y: y + rand(-20, 20),
              vx: rand(-1.4, 1.4), vy: rand(0.4, 1.4),
              size: rand(2.5, 5), color: Math.random() > 0.5 ? '#ffffff' : '#fef9c3',
              alpha: 1, gravity: 0.015, life: 0, maxLife: 40, shape: 'feather', rot: rand(0, Math.PI), vr: rand(0.02, 0.06)
            });
          }
          this._sparkBurst('holy', '#fef08a', x, y);
          break;
        }
        case 'frost_prison_dome': {
          this.domes.push({ x, y, progress: 0, speed: 0.09, color: '#38bdf8', cat: 'frost', radius: 74, height: 120 });
          this._themeBurst('frost', color, x, y, 26, 0.9, 0.1);
          break;
        }
        case 'tidal_wave_water': {
          this.slashes.push({ x, y, progress: 0, speed: 0.09, glowColor: '#3b82f6', type: 'horizontal', width: 30 });
          this.slashes.push({ x, y, progress: 0.3, speed: 0.09, glowColor: '#2563eb', type: 'horizontal', width: 22 });
          this._themeBurst('frost', '#38bdf8', x, y, 40, 1.2, 0.3);
          this._sparkBurst('frost', '#bae6fd', x, y);
          break;
        }
        case 'dragon_breath_cone': {
          const n = 40;
          const dir = (Math.random() > 0.5 ? 1 : -1);
          for (let i = 0; i < n; i++) {
            const off = (i / n) * 1.15 + 0.1;
            const a = dir * (rand(-0.35, 0.35) + off * 0.55);
            this.particles.push({
              x, y: y + rand(-8, 8),
              vx: Math.cos(a) * rand(3, 9), vy: Math.sin(a) * rand(2, 6) - 0.5,
              size: rand(3, 7), color: [ '#f97316', '#ef4444', '#fde047' ][Math.floor(Math.random() * 3)],
              alpha: 1, gravity: -0.03, life: 0, maxLife: 26, shape: 'shard'
            });
          }
          this.flashes.push({ x, y, radius: 120, alpha: 0.4, color: '#f97316', speed: 0.06 });
          break;
        }
        case 'phoenix_wings_sweep': {
          this.slashes.push({ x, y, progress: 0, speed: 0.08, glowColor: '#f97316', type: 'wingsL', width: 14 });
          this.slashes.push({ x, y, progress: 0, speed: 0.08, glowColor: '#fb923c', type: 'wingsR', width: 14 });
          this._themeBurst('fire', color, x, y, 30, 1.1, -0.07);
          this._sparkBurst('fire', '#fde047', x, y);
          break;
        }
        case 'void_rift_tear': {
          this.slashes.push({ x, y, progress: 0, speed: 0.06, glowColor: '#7e22ce', type: 'vertical', width: 26 });
          this._themeBurst('dark', color, x, y, 34, 1.1, -0.05);
          this.flashes.push({ x, y, radius: 110, alpha: 0.5, color: '#3b0764', speed: 0.05 });
          break;
        }
        case 'electric_field_discharge':
        case 'electric_sparks_shower': {
          for (let i = 0; i < 5; i++) {
            this.lightnings.push(this._makeBolt(x + rand(-25, 25), y + rand(-15, 15), 14));
          }
          this._themeBurst('lightning', color, x, y, 40, 1.3, 0.05);
          break;
        }
        case 'boulder_crush_drop': {
          for (let i = 0; i < 8; i++) {
            this.particles.push({
              x: x + rand(-14, 14), y: y - rand(10, 55),
              vx: rand(-2.5, 2.5), vy: rand(3, 7), size: rand(9, 16),
              color: [ '#713f12', '#57534e', '#854d0e' ][Math.floor(Math.random() * 3)],
              alpha: 1, gravity: 0.3, life: 0, maxLife: 30, shape: 'rock', rot: rand(0, Math.PI), vr: rand(-0.05, 0.05)
            });
          }
          this.rings.push({ x, y, progress: 0, speed: 0.08, color: '#713f12', cat: 'earth', maxR: 85, lineWidth: 7 });
          this.flashes.push({ x, y, radius: 120, alpha: 0.5, color: '#a16207', speed: 0.06 });
          break;
        }
        default: {
          this._themeBurst(cat, color, x, y, 30, 1, CAT_GRAVITY[cat] || 0.1);
          if (cat === 'frost' || cat === 'dark' || cat === 'holy') this._sparkBurst(cat, color, x, y);
          break;
        }
      }
      if (onHit) onHit();
    }

    // ---------------- SLASH ----------------
    _slashFx(id, cat, color, x, y, onHit) {
      const variant =
        id.includes('cross') ? 'cross'
        : /cleave|horizontal/.test(id) ? 'horizontal'
        : id === 'heavy_hammer_slam' || id === 'earth_hammer_quake' ? 'hammer'
        : /guillotine/.test(id) ? 'vertical'
        : /uppercut/.test(id) ? 'uppercut'
        : /triple_dagger/.test(id) ? 'triple'
        : 'rising';

      if (variant === 'cross') {
        this.slashes.push({ x, y, progress: 0, speed: 0.09, glowColor: color, type: 'cross', width: 12 });
        this.slashes.push({ x, y, progress: 0.4, speed: 0.09, glowColor: color, type: 'cross', width: 12 });
      } else if (variant === 'triple') {
        this.slashes.push({ x, y, progress: 0, speed: 0.11, glowColor: color, type: 'rising', width: 7 });
        this.slashes.push({ x, y, progress: 0.3, speed: 0.11, glowColor: color, type: 'rising', width: 7 });
        this.slashes.push({ x, y, progress: 0.58, speed: 0.11, glowColor: color, type: 'rising', width: 7 });
      } else if (variant === 'hammer') {
        this.slashes.push({ x, y, progress: 0, speed: 0.1, glowColor: color, type: 'hammer', width: 34 });
        this.rings.push({ x, y, progress: 0, speed: 0.1, color, cat, maxR: 95, lineWidth: 8 });
        this.flashes.push({ x, y, radius: 130, alpha: 0.7, color, speed: 0.06 });
        this._themeBurst(cat, color, x, y, 32, 1.2, CAT_GRAVITY[cat] || 0.2);
      } else if (variant === 'horizontal') {
        this.slashes.push({ x, y, progress: 0, speed: 0.08, glowColor: color, type: 'horizontal', width: 18 });
      } else if (variant === 'vertical') {
        this.slashes.push({ x, y, progress: 0, speed: 0.07, glowColor: color, type: 'vertical', width: 24 });
      } else {
        this.slashes.push({ x, y, progress: 0, speed: 0.08, glowColor: color, type: variant === 'uppercut' ? 'uppercut' : 'rising', width: 12 });
      }
      this._themeBurst(cat, color, x, y, 12, 0.6, CAT_GRAVITY[cat] || 0.12);
      if (onHit) onHit();
    }

    // ---------------- PROJECTILE ----------------
    _projectileFx(id, cat, color, fx, fy, tx, ty, onHit) {
      const dist = Math.hypot(tx - fx, ty - fy) || 1;

      // Baraj tarzı efektler: yelpaze halinde birden çok mermi
      if (id === 'blood_needles' || id === 'phantom_dagger_barrage' || id === 'rock_avalanche_barrage' || id === 'icicle_rain_barrage') {
        const n = 7;
        const baseA = Math.atan2(ty - fy, tx - fx);
        for (let i = 0; i < n; i++) {
          const a = baseA + (i - (n - 1) / 2) * 0.16;
          const len = dist * rand(0.65, 1.15);
          const endX = fx + Math.cos(a) * len;
          const endY = fy + Math.sin(a) * len;
          this.projectiles.push({
            x: fx, y: fy, lastX: fx, lastY: fy,
            startX: fx, startY: fy, targetX: endX, targetY: endY,
            progress: 0, speed: rand(0.04, 0.06), color, size: rand(4, 8),
            delay: i * 2, trail: true, cat, final: false, fx: id
          });
        }
        this.projectiles[this.projectiles.length - 1].onHit = () => {
          this._themeBurst(cat, color, tx, ty, 22, 0.9, CAT_GRAVITY[cat] || 0.15);
          if (onHit) onHit();
        };
        return;
      }

      // Meteor: büyük düşen alev topu + patlama
      if (id === 'fire_meteor_crash') {
        this.projectiles.push({
          x: fx, y: fy, lastX: fx, lastY: fy,
          startX: fx, startY: fy, targetX: tx, targetY: ty,
          progress: 0, speed: 0.035, color: '#ea580c', size: 17, trail: true, cat: 'fire', meteor: true, fx: id,
          onHit: () => {
            this.flashes.push({ x: tx, y: ty, radius: 170, alpha: 1, color: '#f97316', speed: 0.05 });
            this.rings.push({ x: tx, y: ty, progress: 0, speed: 0.08, color: '#ef4444', cat: 'fire', maxR: 110, lineWidth: 8 });
            this._themeBurst('fire', '#f97316', tx, ty, 60, 1.7, -0.05);
            if (onHit) onHit();
          }
        });
        return;
      }

      // Ateş topu: küçük + iz
      const isFire = id === 'fireball_streak';
      const isPlasma = id === 'ball_lightning_plasma';
      this.projectiles.push({
        x: fx, y: fy, lastX: fx, lastY: fy,
        startX: fx, startY: fy, targetX: tx, targetY: ty,
        progress: 0, speed: id === 'piercing_rapier_thrust' || id === 'sonic_air_blade' ? 0.09 : 0.045,
        color, size: id === 'piercing_rapier_thrust' ? 4 : 8,
        trail: isFire || isPlasma || id === 'frost_crystal_spear' || id === 'frozen_orb_shatter',
        cat, fx: id,
        onHit: () => {
          this._themeBurst(cat, color, tx, ty, 30, 1.1, CAT_GRAVITY[cat] || 0.12);
          this._sparkBurst(cat, color, tx, ty);
          if (onHit) onHit();
        }
      });
    }

    // ---------------- BEAM (lazer/isinsal: caster -> hedef) ----------------
    // Duz cizgi caster'dan hedefe uzar; capraz konumlarda aci otomatik hesaplanir.
    // Vurus aninda hedefte patlama + halka + flas olusur. Oyun mantigini degistirmez.
    _beamFx(cat, color, fx, fy, tx, ty, onHit) {
      this.beams.push({
        x1: fx, y1: fy, x2: tx, y2: ty,
        progress: 0, speed: 0.14, color, cat,
        hitDone: false, onHit
      });
    }

    // ---------------- ERUPTION ----------------
    _eruptionFx(id, cat, color, x, y, onHit) {
      if (id === 'stone_spikes_impale' || id === 'ice_spikes_ground' || id === 'shadow_spikes_rise') {
        this.spikes.push({
          x, y, progress: 0, speed: 0.07, color, cat,
          height: rand(75, 110), count: rand(4, 6) | 0, gap: rand(26, 34), jitter: true
        });
        this._themeBurst(cat, color, x, y, 14, 0.7, CAT_GRAVITY[cat] || 0.2);
      } else {
        // Fışkıran gayzer / toprak yarığı
        this.geysers.push({
          x, y: y + 10, progress: 0, duration: cat === 'earth' ? 26 : 32,
          cat, color, spread: cat === 'earth' ? 1.0 : 0.45,
          power: cat === 'earth' ? 6 : 5
        });
        if (cat === 'earth') {
          this.slashes.push({ x, y, progress: 0, speed: 0.08, glowColor: '#a16207', type: 'horizontal', width: 16 });
          this.rings.push({ x, y, progress: 0, speed: 0.09, color: '#a16207', cat: 'earth', maxR: 80, lineWidth: 6 });
        }
        this._themeBurst(cat, color, x, y, 18, 0.8, CAT_GRAVITY[cat] || 0.18);
      }
      if (onHit) onHit();
    }

    // ---------------- VORTEX ----------------
    _vortexFx(id, cat, color, x, y, onHit) {
      this.swirls.push({
        x, y, phase: Math.random() * Math.PI * 2, progress: 0, speed: 0.055,
        color, cat, radius: 28, maxRadius: cat === 'physical' ? 60 : 82, height: 120
      });
      this._themeBurst(cat, color, x, y, 16, 0.7, -0.03);
      if (onHit) onHit();
    }

    // ---------------- PILLAR ----------------
    _pillarFx(id, cat, color, x, y, onHit) {
      this.pillars.push({
        x, y, progress: 0, speed: 0.05, color, cat, width: cat === 'holy' ? 34 : 28, height: 210
      });
      this.flashes.push({ x, y, radius: 90, alpha: 0.5, color, speed: 0.05 });
      this._themeBurst(cat, color, x, y, 12, 0.6, CAT_GRAVITY[cat] || 0.1);
      if (onHit) onHit();
    }

    // ---------------- SHOCKWAVE ----------------
    _shockwaveFx(id, cat, color, x, y, onHit) {
      if (id === 'blood_nova') {
        this.rings.push({ x, y, progress: 0, speed: 0.07, color, cat, maxR: 85, lineWidth: 9 });
        this.rings.push({ x, y, progress: -0.35, speed: 0.06, color, cat, maxR: 100, lineWidth: 5 });
      } else if (id === 'emp_shockwave_ring') {
        this.rings.push({ x, y, progress: 0, speed: 0.1, color, cat, maxR: 95, lineWidth: 3 });
        this.rings.push({ x, y, progress: -0.2, speed: 0.09, color, cat, maxR: 115, lineWidth: 2 });
      } else if (id === 'judgement_solar_flare' || id === 'divine_retribution_ring') {
        this.rings.push({ x, y, progress: 0, speed: 0.07, color, cat, maxR: 100, lineWidth: 6 });
        this.flashes.push({ x, y, radius: 140, alpha: 0.7, color, speed: 0.05 });
      } else {
        this.rings.push({ x, y, progress: 0, speed: 0.08, color, cat, maxR: 88, lineWidth: 7 });
      }
      this.flashes.push({ x, y, radius: 70, alpha: 0.5, color, speed: 0.07 });
      this._themeBurst(cat, color, x, y, 16, 0.8, CAT_GRAVITY[cat] || 0.1);
      if (onHit) onHit();
    }

    // ---------------- LIGHTNING ----------------
    _makeBolt(x, y, jitter) {
      const points = [{ x: x + rand(-15, 15), y: 8 }];
      const steps = 8;
      for (let i = 1; i < steps; i++) {
        points.push({ x: x + rand(-jitter, jitter), y: 8 + (y - 8) * (i / steps) });
      }
      points.push({ x, y });
      return { points, alpha: 1.0, color: '#facc15' };
    }

    _lightningFx(id, cat, color, x, y, onHit) {
      if (id === 'triple_thunder_judgement') {
        this.lightnings.push(this._makeBolt(x - 45, y, 12));
        this.lightnings.push(this._makeBolt(x, y, 12));
        this.lightnings.push(this._makeBolt(x + 45, y, 12));
      } else if (id === 'chain_lightning_arc') {
        this.lightnings.push(this._makeBolt(x, y, 22));
        for (let i = 0; i < 3; i++) {
          this.lightnings.push(this._makeBolt(x + rand(-70, 70), y + rand(-20, 20), 12));
        }
      } else {
        this.lightnings.push(this._makeBolt(x, y, 30));
      }
      this.flashes.push({ x, y, radius: 110, alpha: 0.8, color, speed: 0.07 });
      this.rings.push({ x, y, progress: 0, speed: 0.1, color, cat: 'lightning', maxR: 70, lineWidth: 4 });
      this._themeBurst('lightning', color, x, y, 20, 1, 0.05);
      if (onHit) onHit();
    }

    // ---------------- Temalı parçacık patlaması ----------------
    _themeBurst(cat, color, x, y, count, power, gravity) {
      const palette = CAT_PALETTES[cat] || ['#ffffff', '#fde047'];
      const shape = CAT_SHAPE[cat];
      const g = gravity !== undefined ? gravity : (CAT_GRAVITY[cat] || 0.1);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = (2 + Math.random() * 7) * power;
        this.particles.push({
          x, y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          size: (3 + Math.random() * 6) * power,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 1, gravity: g, life: 0, maxLife: Math.round(28 * (0.8 + Math.random() * 0.5)),
          shape, rot: Math.random() * Math.PI, vr: rand(-0.08, 0.08)
        });
      }
    }

    _sparkBurst(cat, color, x, y) {
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 4 + Math.random() * 5;
        this.particles.push({
          x, y,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          size: 1.8, color: '#ffffff', alpha: 1, gravity: 0.04, life: 0, maxLife: 14
        });
      }
    }

    burstParticles(x, y, colors, count, gravity = 0) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 7;
        this.particles.push({
          x, y,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          size: 3 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1, gravity, life: 0, maxLife: 30
        });
      }
    }

    // ---------------- DÖNGÜ ----------------
    loop() {
      this.update();
      this.render();
      requestAnimationFrame(() => this.loop());
    }

    update() {
      // Projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        if (p.delay > 0) { p.delay--; continue; }
        p.lastX = p.x; p.lastY = p.y;
        p.progress += p.speed;
        p.x = lerp(p.startX, p.targetX, p.progress);
        p.y = lerp(p.startY, p.targetY, p.progress);
        if (p.trail && p.progress < 1) {
          this.particles.push({
            x: p.x, y: p.y, vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4),
            size: p.meteor ? rand(4, 9) : rand(2, 4), color: p.cat === 'frost' ? '#7dd3fc' : (p.cat === 'lightning' ? '#fde047' : '#f97316'),
            alpha: 1, gravity: p.cat === 'frost' ? 0.1 : 0, life: 0, maxLife: 16
          });
        }
        if (p.progress >= 1) {
          if (p.onHit) p.onHit();
          this.projectiles.splice(i, 1);
        }
      }

      // Slashes
      for (let i = this.slashes.length - 1; i >= 0; i--) {
        const s = this.slashes[i];
        s.progress += s.speed;
        if (s.progress >= 1) this.slashes.splice(i, 1);
      }

      // Lightnings
      for (let i = this.lightnings.length - 1; i >= 0; i--) {
        const l = this.lightnings[i];
        l.alpha -= 0.09;
        if (l.alpha <= 0) this.lightnings.splice(i, 1);
      }

      // Beams (lazer: bas hizla hedefe ilerler, varinca hedefte patlar)
      for (let i = this.beams.length - 1; i >= 0; i--) {
        const b = this.beams[i];
        b.progress += b.speed;
        if (b.progress >= 1 && !b.hitDone) {
          b.hitDone = true;
          this.flashes.push({ x: b.x2, y: b.y2, radius: 95, alpha: 0.85, color: b.color, speed: 0.07 });
          this.rings.push({ x: b.x2, y: b.y2, progress: 0, speed: 0.1, color: b.color, cat: b.cat, maxR: 65, lineWidth: 4 });
          this._themeBurst(b.cat, b.color, b.x2, b.y2, 22, 1, 0.05);
          if (b.onHit) b.onHit();
        }
        if (b.progress >= 1.35) this.beams.splice(i, 1);
      }

      // Flashes
      for (let i = this.flashes.length - 1; i >= 0; i--) {
        const f = this.flashes[i];
        if (f.delay > 0) { f.delay--; continue; }
        f.alpha -= f.speed;
        if (f.alpha <= 0) this.flashes.splice(i, 1);
      }

      // Rings (dalga halkaları)
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        if (r.delay > 0) { r.delay--; continue; }
        r.progress += r.speed;
        if (r.progress >= 1) this.rings.splice(i, 1);
      }

      // Swirls (hortum/vortex)
      for (let i = this.swirls.length - 1; i >= 0; i--) {
        const s = this.swirls[i];
        s.progress += s.speed;
        s.phase += 0.22;
        s.radius = lerp(s.radius, s.maxRadius, 0.06);
        s.alpha = 1 - s.progress;
        if (Math.random() < 0.5 && s.progress < 0.8) {
          const a = Math.random() * Math.PI * 2;
          const r = rand(10, s.radius * 0.8);
          const pal = CAT_PALETTES[s.cat] || [s.color];
          this.particles.push({
            x: s.x + Math.cos(a) * r, y: s.y + Math.sin(a) * r * 0.4,
            vx: Math.cos(a) * 0.6, vy: -1 - Math.random() * 2,
            size: rand(2, 4.5), color: pal[Math.floor(Math.random() * pal.length)],
            alpha: 0.8, gravity: -0.04, life: 0, maxLife: 20
          });
        }
        if (s.progress >= 1) this.swirls.splice(i, 1);
      }

      // Pillars (kolon)
      for (let i = this.pillars.length - 1; i >= 0; i--) {
        const p = this.pillars[i];
        p.progress += p.speed;
        if (p.progress >= 0.12 && p.progress < 0.9 && Math.random() < 0.7) {
          const pal = CAT_PALETTES[p.cat] || [p.color];
          this.particles.push({
            x: p.x + rand(-p.width / 2, p.width / 2), y: p.y - p.height * p.progress * 0.9,
            vx: rand(-0.5, 0.5), vy: rand(-3.5, -2),
            size: rand(2, 5), color: pal[Math.floor(Math.random() * pal.length)],
            alpha: 1, gravity: p.cat === 'fire' ? -0.04 : -0.02, life: 0, maxLife: 22
          });
        }
        if (p.progress >= 1) {
          this._themeBurst(p.cat, p.color, p.x, p.y, 12, 0.7, CAT_GRAVITY[p.cat] || 0.1);
          this.pillars.splice(i, 1);
        }
      }

      // Spikes (zemin çivileri)
      for (let i = this.spikes.length - 1; i >= 0; i--) {
        const sp = this.spikes[i];
        sp.progress += sp.speed;
        if (sp.progress >= 1) this.spikes.splice(i, 1);
      }

      // Domes (buz kubbesi)
      for (let i = this.domes.length - 1; i >= 0; i--) {
        const dm = this.domes[i];
        dm.progress += dm.speed;
        if (dm.progress >= 1) this.domes.splice(i, 1);
      }

      // Geysers (fıskiye/fışkırma)
      for (let i = this.geysers.length - 1; i >= 0; i--) {
        const g = this.geysers[i];
        g.progress++;
        if (g.progress <= g.duration) {
          const pal = CAT_PALETTES[g.cat] || [g.color];
          for (let k = 0; k < 2; k++) {
            const a = (Math.random() - 0.5) * g.spread;
            this.particles.push({
              x: g.x + rand(-6, 6), y: g.y,
              vx: Math.cos(a) * rand(0.5, 1.5), vy: -g.power - Math.random() * 3,
              size: rand(3, 7), color: pal[Math.floor(Math.random() * pal.length)],
              alpha: 1, gravity: g.cat === 'earth' ? 0.3 : 0.18, life: 0, maxLife: 30
            });
          }
        } else {
          this.geysers.splice(i, 1);
        }
      }

      // Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.life++;
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.gravity) pt.vy += pt.gravity;
        if (pt.rot !== undefined && pt.vr !== undefined) pt.rot += pt.vr;
        pt.alpha = 1 - pt.life / pt.maxLife;
        if (pt.life >= pt.maxLife) this.particles.splice(i, 1);
      }
    }

    // ---------------- RENDER ----------------
    _renderSlashPath(s, t) {
      const ctx = this.ctx;
      const w = s.width || 12;
      switch (s.type) {
        case 'cross':
          ctx.moveTo(-60 * t, -40 * t); ctx.lineTo(60 * t, 40 * t);
          ctx.moveTo(60 * t, -40 * t); ctx.lineTo(-60 * t, 40 * t);
          break;
        case 'horizontal':
          ctx.moveTo(-70 * t, 0); ctx.quadraticCurveTo(0, -t * 26, 70 * t, 0);
          break;
        case 'vertical':
        case 'hammer': {
          ctx.moveTo(-w * 0.25, -150);
          ctx.lineTo(w * 0.25, -150);
          ctx.lineTo(w * 0.25, -150 + 150 * easeOut(t));
          ctx.lineTo(-w * 0.25, -150 + 150 * easeOut(t));
          break;
        }
        case 'uppercut':
          ctx.moveTo(-55 * t, 50 * t); ctx.quadraticCurveTo(0, -65 * t, 55 * t, -20 * t);
          break;
        case 'wingsL':
          ctx.moveTo(-10 * t, 0); ctx.quadraticCurveTo(-60 * t, -30 * t, -110 * t, -10 * t);
          break;
        case 'wingsR':
          ctx.moveTo(10 * t, 0); ctx.quadraticCurveTo(60 * t, -30 * t, 110 * t, -10 * t);
          break;
        default: // rising
          ctx.moveTo(-65 * t, 45 * t); ctx.quadraticCurveTo(0, -65 * t, 65 * t, 20 * t);
          break;
      }
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Flashes
      for (const f of this.flashes) {
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * f.alpha);
        grad.addColorStop(0, f.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = clamp(f.alpha, 0, 1);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * f.alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      // Slashes
      for (const s of this.slashes) {
        const t = clamp(s.progress, 0, 1);
        const fade = (1 - s.progress) * 0.85 + 0.15;
        const w = s.width || 12;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.globalAlpha = clamp(fade, 0, 1);
        ctx.strokeStyle = s.glowColor;
        ctx.lineWidth = Math.max(2, w * (1 - s.progress) + 2);
        ctx.shadowColor = s.glowColor;
        ctx.shadowBlur = 16;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        this._renderSlashPath(s, t);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // Domes (buz kubbesi)
      for (const dm of this.domes) {
        const t = clamp(dm.progress, 0, 1);
        const r = dm.radius * easeOut(t);
        const h = dm.height * easeOut(t);
        ctx.save();
        ctx.globalAlpha = 1 - dm.progress * 0.6;
        ctx.strokeStyle = dm.color;
        ctx.shadowColor = dm.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(dm.x, dm.y - h * 0.25, r * 0.75, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dm.x - r * 0.75, dm.y);
        for (let i = 1; i <= 10; i++) {
          const a = Math.PI - (Math.PI * i) / 10;
          const px = dm.x + Math.cos(a) * r * 0.75;
          const py = dm.y - Math.sin(a) * r * 0.75;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + rand(-6, 6), py - rand(14, 30));
          ctx.stroke();
        }
        ctx.restore();
      }

      // Spikes (zemin çivileri)
      for (const sp of this.spikes) {
        const t = clamp(sp.progress, 0, 1);
        const h = sp.height * easeOut(t);
        const n = sp.count;
        ctx.save();
        ctx.globalAlpha = 1 - sp.progress * 0.8;
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 10;
        for (let i = 0; i < n; i++) {
          const bx = sp.x - ((n - 1) / 2) * sp.gap + i * sp.gap + (sp.jitter ? rand(-4, 4) : 0);
          ctx.beginPath();
          ctx.moveTo(bx - 9, sp.y);
          ctx.lineTo(bx + 9, sp.y);
          ctx.lineTo(bx, sp.y - h * (0.8 + 0.3 * Math.random()));
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Rings (dalga halkaları)
      for (const r of this.rings) {
        const t = clamp(r.progress, 0, 1);
        const rad = r.maxR * easeOutCubic(t);
        const alpha = clamp((1 - t) * 1.2, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = Math.max(1, r.lineWidth * (1 - t));
        ctx.shadowColor = r.color;
        ctx.shadowBlur = r.lineWidth * 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, rad * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Pillars (kolonlar)
      for (const p of this.pillars) {
        const t = clamp(p.progress, 0, 1);
        const h = p.height * easeOut(t);
        const w = p.width * (0.6 + 0.4 * t);
        const alpha = (1 - p.progress * 0.5) * 0.9 + 0.1;
        ctx.save();
        ctx.globalAlpha = clamp(alpha, 0, 1);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 24;
        const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y - h);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, '#ffffff');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.rect(p.x - w / 2, p.y - h, w, h);
        ctx.fill();
        ctx.globalAlpha = clamp(alpha * 0.5, 0, 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y - h, w * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Swirls (vortex / hortum)
      for (const s of this.swirls) {
        const n = 26;
        ctx.save();
        ctx.globalAlpha = clamp(s.alpha, 0, 1);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 8;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const a = s.phase - t * Math.PI * 4.2;
          const r = s.radius * t;
          const px = s.x + Math.cos(a) * r;
          const py = s.y - t * s.height + Math.sin(a) * r * 0.35;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.globalAlpha = clamp(s.alpha * 0.5, 0, 1);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.restore();
      }

      // Lightnings
      for (const l of this.lightnings) {
        ctx.save();
        ctx.globalAlpha = clamp(l.alpha, 0, 1);
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 15;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < l.points.length; i++) {
          if (i === 0) ctx.moveTo(l.points[i].x, l.points[i].y);
          else ctx.lineTo(l.points[i].x, l.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Beams (lazer/isinsal: caster -> hedef cizgisi, capraz aci otomatik)
      for (const b of this.beams) {
        const t = clamp(b.progress, 0, 1);
        const e = easeOutCubic(t);
        const hx = lerp(b.x1, b.x2, Math.min(1, e * 1.12));
        const hy = lerp(b.y1, b.y2, Math.min(1, e * 1.12));
        const tx = lerp(b.x1, b.x2, Math.max(0, e - 0.38));
        const ty = lerp(b.y1, b.y2, Math.max(0, e - 0.38));
        const fade = b.progress > 1 ? Math.max(0, 1 - (b.progress - 1) / 0.35) : 1;
        ctx.save();
        ctx.globalAlpha = clamp(fade, 0, 1);
        ctx.lineCap = 'round';
        // dis parlama (kalin, yari seffaf)
        ctx.strokeStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        // beyaz cekirdek (ince, parlak)
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        // bas parcacigi (hedefe carpan uc)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Yone duyarli cirit ucu: mizrak/kargi/nester hiz vektorune doner
      const SPEAR_FX = {
        frost_crystal_spear: 1, storm_spear_throw: 1, holy_lance_projectile: 1,
        piercing_rapier_thrust: 1, sonic_air_blade: 1
      };

      // Projectiles
      for (const p of this.projectiles) {
        ctx.save();
        if (p.fx && SPEAR_FX[p.fx] && p.lastX !== undefined) {
          // Firlatilan cirit: gidis yonune donmus mizrak + isigi
          const ang = Math.atan2(p.y - p.lastY, p.x - p.lastX);
          const len = 26;
          ctx.translate(p.x, p.y);
          ctx.rotate(ang);
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-len, 0);
          ctx.lineTo(0, 0);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(-4, -6);
          ctx.lineTo(-4, 6);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(2, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }
        if (p.meteor) {
          const radius = p.size * (1 - p.progress * 0.4);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          grad.addColorStop(0, '#fff7ed');
          grad.addColorStop(0.4, '#fde047');
          grad.addColorStop(1, '#ef4444');
          ctx.fillStyle = grad;
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 26;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
          if (p.lastX !== undefined && (p.lastX !== p.x || p.lastY !== p.y)) {
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.lastX, p.lastY);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Particles
      for (const pt of this.particles) {
        ctx.globalAlpha = clamp(pt.alpha, 0, 1);
        ctx.fillStyle = pt.color;
        ctx.save();
        if (pt.shape === 'rock') {
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot || 0);
          ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 0.8);
        } else if (pt.shape === 'shard') {
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot || 0);
          ctx.beginPath();
          ctx.moveTo(0, -pt.size);
          ctx.lineTo(pt.size * 0.6, pt.size);
          ctx.lineTo(-pt.size * 0.6, pt.size);
          ctx.closePath();
          ctx.fill();
        } else if (pt.shape === 'feather') {
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot || 0);
          ctx.beginPath();
          ctx.ellipse(0, 0, pt.size, pt.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // Dışa aktar
  window.SetraEffects = SetraEffects;
  window.SETRA_EFFECTS_REGISTRY = EFFECTS_REGISTRY;
})(typeof window !== 'undefined' ? window : this);