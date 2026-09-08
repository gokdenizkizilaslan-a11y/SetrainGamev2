/**
 * THE SETRA GAME - Standalone Egg Hatch Animation System
 * Usage in screens.js:
 *   await playEggAnimation(eggId, petId, petName, petImage);
 *   // or: window.EggAnimation.play({ eggId, petId, petName, petImage });
 */

(function (window) {
  // 10 Egg Theme Configurations
  const EGG_THEMES = {
    egg_red: { name: 'Red Egg', primary: '#c82424', secondary: '#660c0c', accent: '#ff7a3c', crack: '#ffaa33', symbol: '🔥' },
    egg_green: { name: 'Green Egg', primary: '#2b8738', secondary: '#103d17', accent: '#8fe08a', crack: '#7df5a2', symbol: '🌿' },
    egg_blue: { name: 'Blue Egg', primary: '#1d6eb5', secondary: '#0b2c4d', accent: '#7dcaff', crack: '#b3e5fc', symbol: '❄️' },
    egg_brown: { name: 'Brown Egg', primary: '#825028', secondary: '#3c220f', accent: '#d29758', crack: '#f5caa0', symbol: '⛰️' },
    egg_yellow: { name: 'Yellow Egg', primary: '#c99a12', secondary: '#594103', accent: '#ffea6c', crack: '#fff2a8', symbol: '⚡' },
    egg_purple: { name: 'Purple Egg', primary: '#772db5', secondary: '#341054', accent: '#c885ff', crack: '#e4baff', symbol: '🔮' },
    egg_cyan: { name: 'Cyan Egg', primary: '#109cb0', secondary: '#053c44', accent: '#61efff', crack: '#affaff', symbol: '✨' },
    egg_dark: { name: 'Dark Egg', primary: '#291938', secondary: '#0c0612', accent: '#9c57d9', crack: '#d08fff', symbol: '👁️' },
    egg_orange: { name: 'Orange Egg', primary: '#d65311', secondary: '#691f03', accent: '#ff9c42', crack: '#ffe082', symbol: '🦅' },
    egg_gold: { name: 'Gold Egg', primary: '#d4a024', secondary: '#614405', accent: '#fff18f', crack: '#ffffff', symbol: '👑' }
  };

  // Web Audio Synthesizer
  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function playSound(type) {
    const ctx = getAudio();
    if (!ctx) return;
    const t = ctx.currentTime;

    if (type === 'crack') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.09);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.11);
    } else if (type === 'boom') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    } else if (type === 'fanfare') {
      [440, 554, 659, 880].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, t + idx * 0.09);
        g.gain.setValueAtTime(0.2, t + idx * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.9);
        o.connect(g).connect(ctx.destination);
        o.start(t + idx * 0.09);
        o.stop(t + idx * 0.09 + 1);
      });
    }
  }

  // Ensure DOM container exists
  function ensureDOM() {
    let overlay = document.getElementById('egg-hatch-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'egg-hatch-overlay';
    overlay.className = 'egg-overlay hidden';
    overlay.innerHTML = `
      <canvas id="egg-physics-canvas" class="egg-canvas-physics"></canvas>
      <div id="egg-screen-flash" class="egg-screen-flash"></div>
      <div class="egg-modal">
        <!-- Interactive Egg Shell Stage -->
        <div id="egg-stage-interactive">
          <div id="egg-badge-el" class="egg-badge">RED EGG</div>
          <h2 id="egg-title-el" class="egg-title">Click the Egg to Crack!</h2>
          <p id="egg-sub-el" class="egg-subtext">The shell pulses with mysterious energy from the deep ruins.</p>
          <div id="egg-visual-box" class="egg-visual-wrap">
            <svg id="egg-svg-el" width="220" height="290" viewBox="0 0 220 290" fill="none" class="overflow-visible">
              <ellipse cx="110" cy="155" rx="90" ry="120" id="egg-aura" fill="rgba(255,100,50,0.5)" filter="blur(20px)" />
              <path id="egg-shell-path" d="M 110,18 C 165,18 205,85 205,160 C 205,225 165,268 110,268 C 55,268 15,225 15,160 C 15,85 55,18 110,18 Z" fill="#c82424" stroke="rgba(255,235,190,0.3)" stroke-width="2" />
              <!-- Crack Overlay -->
              <g id="egg-cracks-group" stroke="#ffaa33" stroke-width="3" stroke-linecap="round" fill="none" opacity="0"></g>
            </svg>
          </div>
        </div>

        <!-- Revealed Pet Card Stage -->
        <div id="egg-stage-revealed" class="pet-card-pop hidden">
          <div class="egg-badge">✦ COMPANION AWAKENED ✦</div>
          <div class="pet-avatar-frame">
            <img id="pet-img-el" src="" alt="Hatched Pet" class="pet-avatar-img" onerror="this.src='/images/pets/pet_direwolf.png'; this.onerror=null;" />
          </div>
          <h3 id="pet-name-el" class="pet-name-text">Pet Name</h3>
          <span id="pet-element-el" class="pet-element-tag">Fire</span>
          <p id="pet-desc-el" class="pet-desc-text">A faithful companion to aid you in your journey.</p>
          <div id="pet-stats-el" class="pet-stats" style="display:flex;gap:0.4rem;flex-wrap:wrap;justify-content:center;margin:8px 0;font-size:0.75rem;color:#d8c8ab;"></div>
          <div id="pet-skills-el" class="pet-skills" style="font-size:0.72rem;color:#a58d68;margin-bottom:10px;"></div>
          <button type="button" id="btn-egg-confirm" class="btn-egg-confirm">Claim Companion</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  // Shimmering Sparkles (Parıltılar) Particle System (No Confetti)
  let sparkleAnimId = null;
  function launchSparkles(canvas, primary, accent) {
    if (sparkleAnimId) cancelAnimationFrame(sparkleAnimId);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = [primary, accent, '#ffffff', '#ffd700', '#fff3c4'];
    const sparkles = [];
    const count = 55;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 260;
      sparkles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -0.5 - Math.random() * 1.3,
        size: Math.random() > 0.4 ? 6 + Math.random() * 8 : 2.5 + Math.random() * 3,
        isStar: Math.random() > 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.03 + Math.random() * 0.05,
        rot: Math.random() * Math.PI * 2
      });
    }

    function drawStar(c, x, y, r) {
      c.save();
      c.translate(x, y);
      c.beginPath();
      c.moveTo(0, -r);
      c.lineTo(r * 0.25, -r * 0.25);
      c.lineTo(r, 0);
      c.lineTo(r * 0.25, r * 0.25);
      c.lineTo(0, r);
      c.lineTo(-r * 0.25, r * 0.25);
      c.lineTo(-r, 0);
      c.lineTo(-r * 0.25, -r * 0.25);
      c.closePath();
      c.fill();
      c.restore();
    }

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of sparkles) {
        s.phase += s.speed;
        s.x += s.vx + Math.sin(s.phase) * 0.3;
        s.y += s.vy;
        s.rot += 0.02;

        const a = (Math.sin(s.phase) + 1) * 0.45;

        // Wrap around
        if (s.y < cy - 300 || s.x < cx - 350 || s.x > cx + 350) {
          s.y = cy + 150 + Math.random() * 100;
          s.x = cx + (Math.random() - 0.5) * 400;
          s.phase = 0;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = s.isStar ? 14 : 6;
        if (s.isStar) {
          drawStar(ctx, s.x, s.y, s.size);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      sparkleAnimId = requestAnimationFrame(step);
    }
    step();
  }

  function stopSparkles(canvas) {
    if (sparkleAnimId) {
      cancelAnimationFrame(sparkleAnimId);
      sparkleAnimId = null;
    }
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Physics explosion loop
  function launchShellPhysics(canvas, originX, originY, color, accent) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 6 + Math.random() * 16;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (5 + Math.random() * 7),
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        size: 14 + Math.random() * 20,
        color: Math.random() > 0.3 ? color : accent,
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 30
      });
    }

    let anim;
    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.life++;
        if (p.life < p.maxLife) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.42;
          p.vx *= 0.985;
          p.rot += p.vRot;
          if (p.life > p.maxLife - 20) p.alpha = (p.maxLife - p.life) / 20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(-p.size / 2, -p.size / 2);
          ctx.lineTo(p.size / 2, -p.size / 3);
          ctx.lineTo(p.size / 3, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 3);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }
      if (alive) anim = requestAnimationFrame(step);
    }
    step();
  }

  // Master function
  async function playEggAnimation(eggId, petId, petName, petImage) {
    return new Promise((resolve) => {
      const theme = EGG_THEMES[eggId] || EGG_THEMES.egg_red;
      const overlay = ensureDOM();

      const stageInteractive = document.getElementById('egg-stage-interactive');
      const stageRevealed = document.getElementById('egg-stage-revealed');
      const badgeEl = document.getElementById('egg-badge-el');
      const titleEl = document.getElementById('egg-title-el');
      const eggBox = document.getElementById('egg-visual-box');
      const eggShell = document.getElementById('egg-shell-path');
      const eggAura = document.getElementById('egg-aura');
      const eggCracks = document.getElementById('egg-cracks-group');
      const flashEl = document.getElementById('egg-screen-flash');
      const canvas = document.getElementById('egg-physics-canvas');
      const petImg = document.getElementById('pet-img-el');
      const petNameEl = document.getElementById('pet-name-el');
      const petDescEl = document.getElementById('pet-desc-el');
      const confirmBtn = document.getElementById('btn-egg-confirm');

      // Initialize visual theme
      badgeEl.innerHTML = `${theme.symbol} ${theme.name.toUpperCase()}`;
      titleEl.innerText = "Click to Crack the Egg";
      eggShell.setAttribute('fill', theme.primary);
      eggAura.setAttribute('fill', theme.accent);
      eggCracks.setAttribute('stroke', theme.crack);
      eggCracks.innerHTML = '';
      eggCracks.setAttribute('opacity', '0');
      eggBox.className = 'egg-visual-wrap';

      stageInteractive.classList.remove('hidden');
      stageRevealed.classList.add('hidden');
      flashEl.classList.remove('flash-active');
      overlay.classList.remove('hidden');

      let clicks = 0;

      function crackStep() {
        clicks++;
        eggBox.classList.add('shaking');
        playSound('crack');

        if (clicks === 1) {
          titleEl.innerText = "The Shell Cracks...";
          eggCracks.setAttribute('opacity', '1');
          eggCracks.innerHTML = `
            <path d="M 110,65 L 105,95 L 125,120 L 98,155 L 115,185" />
            <path d="M 125,120 L 155,135 L 175,160" />
          `;
          setTimeout(() => eggBox.classList.remove('shaking'), 300);
        } else if (clicks === 2) {
          titleEl.innerText = "Deep Fissures Form!";
          eggCracks.innerHTML += `
            <path d="M 70,110 L 90,130 L 78,165" />
            <path d="M 150,85 L 138,110 L 140,175" />
            <path d="M 110,35 L 118,55" />
          `;
          setTimeout(() => eggBox.classList.remove('shaking'), 350);
        } else if (clicks >= 3) {
          // Explode
          eggBox.removeEventListener('click', crackStep);
          titleEl.innerText = "Hatching!";

          const rect = eggBox.getBoundingClientRect();
          const originX = rect.left + rect.width / 2;
          const originY = rect.top + rect.height / 2;

          launchShellPhysics(canvas, originX, originY, theme.primary, theme.crack);
          playSound('boom');
          eggBox.classList.add('hidden');

          // Full screen white flash
          setTimeout(() => {
            flashEl.classList.add('flash-active');

            setTimeout(() => {
              stageInteractive.classList.add('hidden');
              eggBox.classList.remove('hidden');

              // Setup revealed pet
              petImg.src = petImage || `/images/pets/${petId}.png`;
              petNameEl.innerText = petName || (petId ? petId.replace('pet_', '').toUpperCase() : 'Mystic Beast');
              // show element
              const petEl = document.getElementById('pet-element-el');
              if(petEl){
                const pd = (window.CATALOG && window.CATALOG.pets || []).find(x=>x.id===petId);
                petEl.innerText = pd ? pd.element : 'pet';
                petEl.style.background = pd ? `rgba(0,0,0,0.4)` : '';
              }
              const statsEl = document.getElementById('pet-stats-el');
              const skillsEl = document.getElementById('pet-skills-el');
              if(statsEl){
                const pd = (window.CATALOG && window.CATALOG.pets || []).find(x=>x.id===petId);
                if(pd && pd.stats){
                  statsEl.innerHTML = Object.entries(pd.stats).map(([k,v])=> `<span style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:999px;border:1px solid rgba(232,180,92,0.2);">${k} ${v}</span>`).join('');
                } else statsEl.innerHTML = '';
              }
              if(skillsEl){
                const pd = (window.CATALOG && window.CATALOG.pets || []).find(x=>x.id===petId);
                if(pd && pd.buffKind){
                  const map={attack:'Atk +15% 2t', magicBoost:'Mgc +15% 2t', defense:'Def +15% 2t', shield:'Shield', wet:'Wet', frozen:'Frozen'};
                  skillsEl.innerHTML = `Skill: ${map[pd.buffKind]||pd.buffKind} ${pd.element?`(${pd.element})`:''} — every 3 rounds`;
                } else {
                  skillsEl.innerHTML = `Pet helps every 3 rounds — heal/shield/weaken/attack`;
                }
              }
              const descEl = document.getElementById('pet-desc-el');
              if(descEl){
                const pd = (window.CATALOG && window.CATALOG.pets || []).find(x=>x.id===petId);
                if(pd) descEl.innerText = pd.description;
              }

              stageRevealed.classList.remove('hidden');
              flashEl.classList.remove('flash-active');
              playSound('fanfare');
              launchSparkles(canvas, theme.primary, theme.accent);

              confirmBtn.onclick = () => {
                stopSparkles(canvas);
                overlay.classList.add('hidden');
                resolve({ eggId, petId, petName });
              };
            }, 400);
          }, 250);
        }
      }

      eggBox.onclick = crackStep;
    });
  }

  window.playEggAnimation = playEggAnimation;
  window.EggAnimation = { play: playEggAnimation };
})(window);
