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
 */

(function (window) {
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
    { id: "guillotine_fall", name: "Executioner's Fall", cat: "physical", color: "#dc2626", type: "slash" }
  ];

  class SetraEffects {
    constructor(canvasId) {
      this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
      if (!this.canvas) throw new Error('Canvas element not found: ' + canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.projectiles = [];
      this.slashes = [];
      this.lightnings = [];
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

    // ANA ÇALIŞTIRICI METOD
    play(effectId, opts = {}) {
      const fromX = opts.fromX !== undefined ? opts.fromX : this.canvas.width / 2;
      const fromY = opts.fromY !== undefined ? opts.fromY : this.canvas.height - 80;
      const toX = opts.toX !== undefined ? opts.toX : this.canvas.width / 2;
      const toY = opts.toY !== undefined ? opts.toY : 150;
      const onHit = opts.onHit;

      // 1. KAN / BLOOD
      if (effectId.startsWith('blood_') || effectId.includes('crimson') || effectId.includes('sanguine')) {
        this.playBloodEffect(effectId, toX, toY, onHit);
        return;
      }

      // 2. GÖLGE & TIRPAN
      if (effectId.startsWith('shadow_') || effectId.includes('void') || effectId.includes('soul') || effectId.includes('dark')) {
        this.playDarkEffect(effectId, toX, toY, onHit);
        return;
      }

      // 3. ATEŞ
      if (effectId.startsWith('fire_') || effectId.includes('flame') || effectId.includes('magma') || effectId.includes('phoenix')) {
        this.playFireEffect(effectId, fromX, fromY, toX, toY, onHit);
        return;
      }

      // 4. TOPRAK
      if (effectId.startsWith('earth_') || effectId.includes('stone') || effectId.includes('boulder') || effectId.includes('seismic')) {
        this.playEarthEffect(effectId, toX, toY, onHit);
        return;
      }

      // 5. BUZ & SU
      if (effectId.startsWith('frost_') || effectId.includes('ice') || effectId.includes('water') || effectId.includes('blizzard')) {
        this.playFrostEffect(effectId, fromX, fromY, toX, toY, onHit);
        return;
      }

      // 6. YILDIRIM
      if (effectId.startsWith('lightning_') || effectId.includes('thunder') || effectId.includes('storm') || effectId.includes('electric')) {
        this.playLightningEffect(effectId, toX, toY, onHit);
        return;
      }

      // 7. KUTSAL
      if (effectId.startsWith('holy_') || effectId.includes('radiance') || effectId.includes('divine') || effectId.includes('solar')) {
        this.playHolyEffect(effectId, toX, toY, onHit);
        return;
      }

      // 8. FİZİKSEL / KILIÇ
      this.playPhysicalEffect(effectId, toX, toY, onHit);
    }

    playBloodEffect(id, x, y, onHit) {
      if (id === 'blood_scythe' || id === 'blood_scythe_cross' || id === 'blood_cleave') {
        this.slashes.push({
          x, y,
          progress: 0,
          speed: 0.08,
          glowColor: '#dc2626',
          type: id.includes('cross') ? 'cross' : 'rising'
        });
      }

      // Damlayan kan damlaları ve arterial püskürme
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 8;
        this.particles.push({
          x: x + (Math.random() * 16 - 8),
          y: y + (Math.random() * 16 - 8),
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 3 + Math.random() * 5,
          color: Math.random() > 0.3 ? '#b91c1c' : '#7f1d1d',
          alpha: 1,
          gravity: 0.22,
          life: 0, maxLife: 35
        });
      }
      if (onHit) onHit();
    }

    playDarkEffect(id, x, y, onHit) {
      this.slashes.push({
        x, y,
        progress: 0,
        speed: 0.07,
        glowColor: '#9333ea',
        type: 'rising'
      });
      // Ruh parçacıkları
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 6;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1,
          size: 4 + Math.random() * 6,
          color: Math.random() > 0.4 ? '#c084fc' : '#581c87',
          alpha: 1,
          gravity: -0.05,
          life: 0, maxLife: 35
        });
      }
      if (onHit) onHit();
    }

    playFireEffect(id, fromX, fromY, toX, toY, onHit) {
      if (id.includes('meteor') || id.includes('projectile') || id.includes('fireball')) {
        this.projectiles.push({
          x: fromX, y: fromY,
          startX: fromX, startY: fromY,
          targetX: toX, targetY: toY,
          progress: 0, speed: 0.035,
          color: '#ea580c',
          onHit: () => {
            this.burstParticles(toX, toY, ['#ef4444', '#f97316', '#fbbf24'], 45, 0.05);
            if (onHit) onHit();
          }
        });
      } else {
        this.slashes.push({ x: toX, y: toY, progress: 0, speed: 0.08, glowColor: '#f97316', type: 'rising' });
        this.burstParticles(toX, toY, ['#ea580c', '#fde047'], 35, 0.08);
        if (onHit) onHit();
      }
    }

    playEarthEffect(id, x, y, onHit) {
      // Kaya ve taş fırlaması
      for (let i = 0; i < 35; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const spd = 4 + Math.random() * 8;
        this.particles.push({
          x, y: y + 20,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 5 + Math.random() * 8,
          color: Math.random() > 0.5 ? '#854d0e' : '#a16207',
          alpha: 1,
          gravity: 0.2,
          life: 0, maxLife: 30
        });
      }
      if (onHit) onHit();
    }

    playFrostEffect(id, fromX, fromY, toX, toY, onHit) {
      this.projectiles.push({
        x: fromX, y: fromY,
        startX: fromX, startY: fromY,
        targetX: toX, targetY: toY,
        progress: 0, speed: 0.04,
        color: '#38bdf8',
        onHit: () => {
          // Buz kristalleri saçılması
          for (let i = 0; i < 36; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 3 + Math.random() * 7;
            this.particles.push({
              x: toX, y: toY,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              size: 4 + Math.random() * 8,
              color: Math.random() > 0.4 ? '#38bdf8' : '#e0f2fe',
              alpha: 1,
              gravity: 0.12,
              life: 0, maxLife: 35
            });
          }
          if (onHit) onHit();
        }
      });
    }

    playLightningEffect(id, x, y, onHit) {
      const points = [{ x: x + (Math.random() * 40 - 20), y: 10 }];
      for (let i = 1; i < 8; i++) {
        points.push({ x: x + (Math.random() * 30 - 15), y: 10 + (y - 10) * (i / 8) });
      }
      points.push({ x, y });
      this.lightnings.push({ points, alpha: 1.0, color: '#facc15' });

      for (let i = 0; i < 25; i++) {
        const a = Math.random() * Math.PI * 2;
        this.particles.push({
          x, y,
          vx: Math.cos(a) * (3 + Math.random() * 6),
          vy: Math.sin(a) * (3 + Math.random() * 6),
          size: 2.5,
          color: '#ffffff',
          alpha: 1,
          life: 0, maxLife: 20
        });
      }
      if (onHit) onHit();
    }

    playHolyEffect(id, x, y, onHit) {
      for (let i = 0; i < 35; i++) {
        this.particles.push({
          x: x + (Math.random() * 30 - 15),
          y: y - 50 + Math.random() * 100,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -2 - Math.random() * 3,
          size: 3 + Math.random() * 5,
          color: Math.random() > 0.4 ? '#facc15' : '#ffffff',
          alpha: 1,
          life: 0, maxLife: 30
        });
      }
      if (onHit) onHit();
    }

    playPhysicalEffect(id, x, y, onHit) {
      this.slashes.push({
        x, y,
        progress: 0,
        speed: 0.085,
        glowColor: '#f97316',
        type: id.includes('cross') ? 'cross' : 'rising'
      });
      for (let i = 0; i < 20; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        this.particles.push({
          x, y: y + 20,
          vx: Math.cos(a) * (3 + Math.random() * 7),
          vy: Math.sin(a) * (3 + Math.random() * 7),
          size: 2.5,
          color: '#fde047',
          alpha: 1,
          gravity: 0.15,
          life: 0, maxLife: 25
        });
      }
      if (onHit) onHit();
    }

    burstParticles(x, y, colors, count, gravity = 0) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 7;
        this.particles.push({
          x, y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          size: 3 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          gravity,
          life: 0, maxLife: 30
        });
      }
    }

    loop() {
      this.update();
      this.render();
      requestAnimationFrame(() => this.loop());
    }

    update() {
      // Projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.progress += p.speed;
        p.x = p.startX + (p.targetX - p.startX) * p.progress;
        p.y = p.startY + (p.targetY - p.startY) * p.progress;
        if (p.progress >= 1) {
          p.onHit();
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
        l.alpha -= 0.08;
        if (l.alpha <= 0) this.lightnings.splice(i, 1);
      }

      // Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.life++;
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.gravity) pt.vy += pt.gravity;
        pt.alpha = 1 - pt.life / pt.maxLife;
        if (pt.life >= pt.maxLife) this.particles.splice(i, 1);
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'lighter';

      // Slashes (Alttan yukarıya kılıç veya tırpan kavisi)
      for (const s of this.slashes) {
        this.ctx.save();
        this.ctx.translate(s.x, s.y);
        this.ctx.globalAlpha = 1 - s.progress;
        this.ctx.strokeStyle = s.glowColor;
        this.ctx.lineWidth = 12 * (1 - s.progress);
        this.ctx.beginPath();
        if (s.type === 'cross') {
          this.ctx.moveTo(-60, -40);
          this.ctx.lineTo(60, 40);
          this.ctx.moveTo(60, -40);
          this.ctx.lineTo(-60, 40);
        } else {
          // Rising upward crescent
          this.ctx.moveTo(-65, 45);
          this.ctx.quadraticCurveTo(0, -65, 65, 20);
        }
        this.ctx.stroke();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3.5;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Lightnings
      for (const l of this.lightnings) {
        this.ctx.save();
        this.ctx.globalAlpha = l.alpha;
        this.ctx.strokeStyle = l.color;
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = l.color;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        for (let i = 0; i < l.points.length; i++) {
          if (i === 0) this.ctx.moveTo(l.points[i].x, l.points[i].y);
          else this.ctx.lineTo(l.points[i].x, l.points[i].y);
        }
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Projectiles
      for (const p of this.projectiles) {
        this.ctx.save();
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      // Particles
      for (const pt of this.particles) {
        this.ctx.globalAlpha = Math.max(0, pt.alpha);
        this.ctx.fillStyle = pt.color;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  // Dışa aktar
  window.SetraEffects = SetraEffects;
  window.SETRA_EFFECTS_REGISTRY = EFFECTS_REGISTRY;
})(typeof window !== 'undefined' ? window : this);
