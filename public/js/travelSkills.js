/**
 * ============================================================================
 *  TRAVEL SKILLS  —  37 SINIF x 3 SKILL (Q / E / R)  · mekanik + efekt
 * ============================================================================
 *  Yükleme sırası:  travel.js  ->  travel_visuals.js  ->  travel_skills.js
 *
 *  MANA RENGİ: tüm efektler oyuncunun mana rengine boyanır.
 *      engine.setManaColor('#40c4ff')            // veya engine.manaColor = '#40c4ff'
 *      engine.updateStats({ manaColor:'#ff4081' })  // de çalışır
 *    Hiç ayarlanmamışsa her skill kendi (sınıf) rengini kullanır.
 *
 *  YENİ SKILL EKLEMEK (veya birini değiştirmek):
 *      TravelSkills.set('Warrior', 'q', ['Yeni Ad', 5, 'nova', { radius:100, dmg:1.5, fx:'spinSlash', fxf:true }]);
 *      // çoklu parça:  ['Ad', 20, [ ['nova',{...}], ['heal',{pct:.3}] ]]
 *
 *  DAVRANIŞLAR (kind):
 *   chain  : en yakın N düşmana sırayla ışınlan, hasarsız kal, her birine 1 kez vur, sonuncunun arkasında dur
 *   pierce : ileri ışınlan, yolundaki herkesi deler   · blink : imlece ışınlan (+isteğe bağlı nova)
 *   dash   : hızlı atılma, yolundakilere vurur        · leap  : zıpla ve yere çarp
 *   slam   : (gecikmeli/çok dalgalı) alan vuruşu      · nova  : anlık halka   · cone : koni (tick'li)
 *   beam   : düz hat/ışın                             · fan   : mermi yelpazesi
 *   rain   : imleç çevresine yağmur (ok/meteor/yıldırım) · pillar: gecikmeli sütun(lar)
 *   zone   : kalıcı alan (hasar/yavaşlatma/çekme/iyileştirme) · orbit: etrafında dönen hasar halkası
 *   buff   : kalkan/hız/saldırı hızı/can çalma/dokunulmazlık · heal : anlık iyileştirme
 *  YENİ:  hook (çekme) · flurry (kılıç serisi) · trap (tuzak) · decoy (patlayan kopya) · turret (kule) · familiar (takipçi)
 *         arc (zincir yıldırım) · mark (işaretle-infaz) · rewind (zaman geri sar) · swap (yer değiştir) · sacrifice (can feda)
 *         siphon (can emme) · wall (duvar) · trail (iz bırakan atılma) · ram (sürükleyen atılma) · quake (fay hattı)
 *         ring (spiral halka) · boomerang · freeze (zaman durdur) · vortex (girdap) · tether (bağ) · rend (kanama)
 *         pounce (üstüne atla) · seek (hedef arama).   buff ek parametreleri: crit (kritik şansı), endHeal (bitişte iyileştir)
 *  Ortak parametreler:  dmg (saldırı x), kb (geri tepme), stun/slow (sn), leech (can çalma oranı),
 *                       exec:[eşik,çarpan], fx (efekt adı), fxr (efekt yarıçapı), fxf (efekt oyuncuyu takip etsin), col (renk)
 * ============================================================================
 */
(function (global) {
  'use strict';
  const TE = global.TravelEngine;
  if (!TE || !TE.registerClassSkills) { console.warn('[TravelSkills] TravelEngine.registerClassSkills yok — travelEngine.js güncel değil'); return; }
  const TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;

  // ------------------------------------------------------------------ yardımcılar
  const alive = (e) => e.monsters.filter((m) => m.hp > 0 && !m.dead);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clampMap = (e, x, y) => { const mx = (e.mapRadius - 0.5) * e.tileSize, d = Math.hypot(x, y); return d > mx ? { x: x / d * mx, y: y / d * mx } : { x, y }; };
  const later = (X, ms, fn) => X.eng.later(fn, ms);
  const fx = (X, name, x, y, o = {}) => { const TV = global.TravelVisuals, e = X.eng; if (!e.playFx || !TV || !TV.fx[name]) return; e.playFx(name, x, y, Object.assign({ color: X.col }, o)); };
  const heal = (X, amt) => { const st = X.stats; if (amt <= 0) return; const before = st.currentHp; st.currentHp = Math.min(st.maxHp, st.currentHp + amt); const g = Math.round(st.currentHp - before); if (g > 0) { X.eng.spawnDamageNumber(X.P.x, X.P.y, `+${g}`, '#69f0ae'); if (X.eng.onStatsChange) X.eng.onStatsChange(st); } };
  const popup = (X, text) => X.eng.spawnDamageNumber && X.eng.spawnDamageNumber(X.P.x, X.P.y - 30, text, X.col, true);
  // Kalkan: motorun playerShield alanlarını kullanır (damagePlayer bunu yutar).
  const shieldSet = (X, amt, sec) => {
    const e = X.eng, v = Math.round(Number(amt) || 0);
    if (v <= 0) return;
    e.playerShieldMax = Math.max(e.playerShieldMax || 0, v);
    e.playerShield = Math.max(e.playerShield || 0, v);
    e.playerShieldTimer = Math.max(e.playerShieldTimer || 0, Number(sec) || 4);
    e.aoeEffects && e.aoeEffects.push({ x: X.P.x, y: X.P.y, radius: 46, duration: 0.5, timer: 0.5, color: X.col, ring: true, dome: true });
  };

  function hurt(X, m, mult, ang, o = {}) {
    let d = X.atk * mult;
    if (o.exec && m.hp / m.maxHp < o.exec[0]) d *= o.exec[1];
    const crit = !!o.crit || Math.random() < (X.stats.critChance || 0);
    if (crit) d *= 1.8; d = Math.round(d);
    const eng = X.eng;
    eng.applyDamageToMonster(m, d, crit, ang, o.kb === undefined ? 180 : o.kb);
    // Durum efektleri: motorun kendi status sistemi (freeze/stun/root/slow/bleed).
    if (eng.applyMonsterStatus) {
      if (o.stun) eng.applyMonsterStatus(m, { type: 'stun', duration: o.stun });
      if (o.slow) eng.applyMonsterStatus(m, { type: 'slow', duration: o.slow, slow: 1 - (o.slowMul || 0.45) });
      if (o.bleed) eng.applyMonsterStatus(m, { type: 'bleed', duration: (o.ticks || 3) * ((o.tick || 400) / 1000), dps: Math.max(1, Math.round(d * o.bleed)) });
    }
    if (o.leech) heal(X, d * o.leech);
    return d;
  }
  function hitRadius(X, cx, cy, r, mult, o = {}) { let n = 0; alive(X.eng).forEach((m) => { if (Math.hypot(m.x - cx, m.y - cy) <= r + m.radius) { hurt(X, m, mult, Math.atan2(m.y - cy, m.x - cx), o); if (o.pull) { m.x += (cx - m.x) * o.pull; m.y += (cy - m.y) * o.pull; } n++; } }); return n; }
  function segDist(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1, t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1); return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t)); }
  function hitLine(X, x1, y1, x2, y2, w, mult, o = {}, seen) { const ang = Math.atan2(y2 - y1, x2 - x1); let n = 0; alive(X.eng).forEach((m) => { if (seen && seen.has(m)) return; if (segDist(m.x, m.y, x1, y1, x2, y2) <= w / 2 + m.radius) { if (seen) seen.add(m); hurt(X, m, mult, ang, o); n++; } }); return n; }
  function hitCone(X, cx, cy, ang, range, arc, mult, o = {}) { let n = 0; alive(X.eng).forEach((m) => { const d = Math.hypot(m.x - cx, m.y - cy); if (d > range + m.radius) return; let df = Math.abs(Math.atan2(m.y - cy, m.x - cx) - ang); while (df > Math.PI) df = Math.abs(df - TAU); if (df <= arc / 2 || d < m.radius + 22) { hurt(X, m, mult, ang, o); n++; } }); return n; }
  const ghostLine = (X, x1, y1, x2, y2, n = 5) => { const P = X.P; for (let i = 1; i <= n; i++) { const u = i / n; P.ghostTrails.push({ x: lerp(x1, x2, u), y: lerp(y1, y2, u), facingAngle: P.facingAngle, alpha: 0.6 * (0.3 + 0.7 * u), color: X.col }); } };
  const teleport = (X, x, y) => {
    const e = X.eng;
    // Motorun ışınlanma efekti: çıkışta içe çöken halka, arada yırtık iz,
    // varışta patlama + materyalize. Yoksa eski davranışa düşer.
    if (e && typeof e.teleportPlayer === 'function') { e.teleportPlayer(x, y, { color: X.col }); return; }
    const c = clampMap(e, x, y); X.P.x = c.x; X.P.y = c.y;
  };
  // Silah savurma (yetenekler de gerçek bir vuruş animasyonu oynatsın).
  function swing(X, kind, angle, dur) {
    const e = X.eng;
    if (!e || typeof e.swingWeapon !== 'function') return;
    e.swingWeapon(kind, { angle: angle == null ? X.aim : angle, color: X.col, duration: dur || 0.32, trail: false });
  }
  // Kısa yay sıçrayışı: ışınlanma yerine "atlayarak gitme" hissi (assassin chain).
  function hopTo(X, x, y, ms, height, done) {
    const { eng, P } = X;
    const c = clampMap(eng, x, y);
    const sx = P.x, sy = P.y;
    const steps = 6, dur = ms || 130, h = height == null ? 46 : height;
    P.skillLock = Math.max(P.skillLock || 0, dur / 1000);
    for (let i = 1; i <= steps; i++) {
      later(X, (dur * i) / steps, () => {
        const u = i / steps;
        P.x = lerp(sx, c.x, u);
        P.y = lerp(sy, c.y, u);
        P.z = Math.sin(u * Math.PI) * h;
        if (i % 2 === 0) eng.createGhostTrail();
        if (i === steps) { P.z = 0; if (done) done(); }
      });
    }
  }
  const invulnerable = (X, sec, lock) => { const P = X.P; P.invuln = Math.max(P.invuln || 0, sec); P.phase = Math.max(P.phase || 0, sec); P.skillLock = Math.max(P.skillLock || 0, lock === undefined ? sec : lock); };
  const world = (X, d, ang) => ({ x: X.P.x + Math.cos(ang) * d, y: X.P.y + Math.sin(ang) * d });
  const target = (X, p) => (p.at === 'self' ? { x: X.P.x, y: X.P.y } : { x: X.eng.mouse.worldX, y: X.eng.mouse.worldY });
  const fxo = (X, p, extra) => Object.assign({ radius: p.fxr, follow: !!p.fxf, duration: p.fxd, color: p.col ? ((X.eng.getManaColor && X.eng.getManaColor()) || p.col) : X.col }, extra);

  // ---- yeni yardımcılar
  const near = (X, cx, cy, r, ex) => alive(X.eng).filter((m) => (!ex || !ex.has(m)) && Math.hypot(m.x - cx, m.y - cy) <= r + m.radius).sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
  const coneList = (X, cx, cy, ang, range, arc) => alive(X.eng).filter((m) => { const d = Math.hypot(m.x - cx, m.y - cy); if (d > range + m.radius) return false; let df = Math.abs(Math.atan2(m.y - cy, m.x - cx) - ang); while (df > Math.PI) df = Math.abs(df - TAU); return df <= arc / 2 || d < m.radius + 22; });
  function hitOnce(X, cx, cy, r, mult, o, seen) { let n = 0; alive(X.eng).forEach((m) => { if (seen.has(m)) return; if (Math.hypot(m.x - cx, m.y - cy) <= r + m.radius) { seen.add(m); hurt(X, m, mult, Math.atan2(m.y - cy, m.x - cx), o); n++; } }); return n; }

  // ------------------------------------------------------------------ davranışlar
  const B = {
    // En yakın N düşmana sırayla ışınlan; hasar almaz; hepsine 1 kez vur; sonuncunun ARKASINDA kal
    chain(X, p) {
      const { eng, P } = X, n = p.n || 3, step = p.step || 190, hop = p.hop || 430;
      const pool = alive(eng).filter((m) => dist(m, P) <= (p.range || 520)), list = []; let cur = { x: P.x, y: P.y };
      for (let i = 0; i < n && pool.length; i++) { pool.sort((a, b) => dist(a, cur) - dist(b, cur)); const m = pool.shift(); if (i > 0 && dist(m, cur) > hop) break; list.push(m); cur = m; }
      if (!list.length) return B.blink(X, { range: 230, invuln: 0.3, nova: null, fx: 'shadowStep', refund: 0.55 });
      const total = 90 + (list.length - 1) * step + 300;
      invulnerable(X, total / 1000 + 0.15, total / 1000);
      fx(X, 'shadowStep', P.x, P.y, { radius: 55 }); eng.createGhostTrail();
      list.forEach((m, i) => later(X, 90 + i * step, () => {
        const ox = P.x, oy = P.y, a = Math.atan2(m.y - oy, m.x - ox), nx = m.x + Math.cos(a) * (m.radius + 16), ny = m.y + Math.sin(a) * (m.radius + 16);   // hedefin ARKASINA
        const lastHit = i === list.length - 1;
        // Kılıç savurma: atılış anında ileri saplama.
        swing(X, 'thrust', a, 0.26);
        eng.sound.play('slash');
        fx(X, 'lineSlash', ox, oy, { tx: nx, ty: ny, radius: 60 }); ghostLine(X, ox, oy, nx, ny, 6);
        // Işınlanma yerine yay çizen kısa sıçrayış (Warrior leap hissi).
        hopTo(X, nx, ny, 130, lastHit ? 58 : 44, () => {
          P.facingAngle = a + Math.PI;
          swing(X, lastHit ? 'slash' : 'slash', a + Math.PI, lastHit ? 0.36 : 0.28);
          fx(X, 'shadowStep', P.x, P.y, { radius: 52 }); fx(X, 'slashX', m.x, m.y, { radius: 62, dir: Math.atan2(m.y - ny, m.x - nx) * 0 });
          hurt(X, m, lastHit ? (p.dmg || 1.7) * (p.last || 1.5) : (p.dmg || 1.7), a, { crit: lastHit || Math.random() < 0.5, kb: lastHit ? 360 : 200, stun: lastHit ? 0.5 : 0.2 });
          eng.addTrauma(lastHit ? 0.5 : 0.25); eng.sound.play(lastHit ? 'hit' : 'slash');
          if (lastHit) { fx(X, 'bloodScythe', m.x, m.y, { radius: 55 }); eng.spawnExplosionParticles(m.x, m.y, 14, X.col); }
        });
      }));
      return true;
    },
    blink(X, p) {
      const { eng, P } = X, d = Math.min(Math.hypot(eng.mouse.worldX - P.x, eng.mouse.worldY - P.y), p.range || 240), a = X.aim, ox = P.x, oy = P.y;
      invulnerable(X, p.invuln || 0.3, 0.12); fx(X, p.fx || 'shadowStep', ox, oy, { radius: p.fxr || 55 }); eng.createGhostTrail();
      swing(X, 'thrust', a, 0.28);
      const dst = world(X, d, a); teleport(X, dst.x, dst.y); fx(X, 'lineSlash', ox, oy, { tx: P.x, ty: P.y, radius: 50 });
      later(X, 40, () => { fx(X, p.fx || 'shadowStep', P.x, P.y, { radius: p.fxr || 55 }); if (p.nova) { hitRadius(X, P.x, P.y, p.nova.radius, p.nova.dmg, { kb: 260, stun: p.nova.stun }); fx(X, 'pulseNova', P.x, P.y, { radius: p.nova.radius }); eng.addTrauma(0.3); } });
      if (p.refund) X.refund = p.refund; return true;
    },
    pierce(X, p) {
      const { eng, P } = X, a = X.aim, ox = P.x, oy = P.y, dst = clampMap(eng, ox + Math.cos(a) * (p.range || 250), oy + Math.sin(a) * (p.range || 250));
      invulnerable(X, p.invuln || 0.3, 0.22); fx(X, 'shadowStep', ox, oy, { radius: 50 }); eng.createGhostTrail();
      swing(X, 'thrust', a, 0.3);
      later(X, 70, () => { fx(X, 'lineSlash', ox, oy, { tx: dst.x, ty: dst.y, radius: 70 }); hitLine(X, ox, oy, dst.x, dst.y, p.width || 56, p.dmg || 2, { crit: true, kb: 320, stun: p.stun }, new Set()); teleport(X, dst.x, dst.y); fx(X, 'slashX', dst.x, dst.y, { radius: 55 }); eng.addTrauma(0.4); eng.sound.play('hit'); });
      return true;
    },
    dash(X, p) {
      const { eng, P } = X, a = p.back ? X.aim + Math.PI : X.aim, dist0 = p.dist || 210, steps = 9, dur = p.dur || 190, sx = P.x, sy = P.y, seen = new Set();
      const end = clampMap(eng, sx + Math.cos(a) * dist0, sy + Math.sin(a) * dist0);
      P.skillLock = dur / 1000 + 0.04; if (p.invuln) { P.invuln = Math.max(P.invuln || 0, p.invuln); }
      swing(X, 'thrust', a, 0.28);
      fx(X, p.fx || 'lineSlash', sx, sy, fxo(X, p, { tx: end.x, ty: end.y }));
      for (let i = 1; i <= steps; i++) later(X, dur * i / steps, () => {
        P.x = lerp(sx, end.x, i / steps); P.y = lerp(sy, end.y, i / steps); if (i % 2 === 0) eng.createGhostTrail();
        if (p.dmg) alive(eng).forEach((m) => { if (!seen.has(m) && Math.hypot(m.x - P.x, m.y - P.y) <= (p.width || 70) / 2 + m.radius + 6) { seen.add(m); hurt(X, m, p.dmg, a, { kb: 300, stun: p.stun, leech: p.leech }); fx(X, 'crescentSlash', m.x, m.y, { radius: 45 }); eng.addTrauma(0.2); } });
      });
      return true;
    },
    leap(X, p) {
      const { eng, P } = X, d = Math.min(Math.hypot(eng.mouse.worldX - P.x, eng.mouse.worldY - P.y), p.range || 260), a = X.aim, sx = P.x, sy = P.y, steps = 16, dur = p.dur || 420;
      const end = clampMap(eng, sx + Math.cos(a) * d, sy + Math.sin(a) * d); P.skillLock = dur / 1000 + 0.05; P.invuln = Math.max(P.invuln || 0, dur / 1000);
      swing(X, 'thrust', a, 0.3);
      fx(X, 'pulseNova', sx, sy, { radius: 40 });
      for (let i = 1; i <= steps; i++) later(X, dur * i / steps, () => {
        const u = i / steps; P.x = lerp(sx, end.x, u); P.y = lerp(sy, end.y, u); P.z = Math.sin(u * Math.PI) * (p.h || 70); if (i % 4 === 0) eng.createGhostTrail();
        if (i === steps) { P.z = 0; swing(X, 'slam', a, 0.46); hitRadius(X, P.x, P.y, p.radius || 100, p.dmg || 1.8, { kb: 320, stun: p.stun, leech: p.leech }); fx(X, p.fx || 'groundSlam', P.x, P.y, fxo(X, p, { radius: p.fxr || p.radius })); eng.addTrauma(0.5); eng.sound.play('hit'); eng.spawnExplosionParticles(P.x, P.y, 14, X.col); }
      });
      return true;
    },
    slam(X, p) {
      const t = target(X, p), waves = p.waves || [{ delay: 0, radius: p.radius, dmg: p.dmg }], base = p.delay || 0;
      fx(X, 'arcaneCircle', t.x, t.y, { radius: (p.radius || 100) * 0.9, duration: Math.max(0.4, (base + 200) / 1000) });
      waves.forEach((w, i) => later(X, base + (w.delay || 0), () => {
        const cx = p.at === 'self' ? X.P.x : t.x, cy = p.at === 'self' ? X.P.y : t.y;
        swing(X, 'slam', X.aim, 0.42);
        hitRadius(X, cx, cy, w.radius, w.dmg, { kb: p.kb === undefined ? 300 : p.kb, stun: p.stun, slow: p.slow, leech: p.leech, crit: i === waves.length - 1 && p.crit });
        fx(X, p.fx || 'groundSlam', cx, cy, fxo(X, p, { radius: p.fxr || w.radius })); X.eng.addTrauma(0.45); X.eng.sound.play('hit'); X.eng.spawnExplosionParticles(cx, cy, 12, X.col);
      }));
      return true;
    },
    nova(X, p) {
      const run = () => { const { P } = X; swing(X, 'slam', X.aim, 0.42); hitRadius(X, P.x, P.y, p.radius || 120, p.dmg || 1.5, { kb: p.kb === undefined ? 260 : p.kb, stun: p.stun, slow: p.slow, leech: p.leech, exec: p.exec }); fx(X, p.fx || 'pulseNova', P.x, P.y, fxo(X, p, { radius: p.fxr || p.radius })); X.eng.addTrauma(0.4); X.eng.spawnExplosionParticles(P.x, P.y, 12, X.col); };
      p.delay ? later(X, p.delay, run) : run(); return true;
    },
    cone(X, p) {
      const { P } = X, a = X.aim, ticks = p.ticks || 1, dur = p.dur || 0, e = X.eng, tx = P.x + Math.cos(a) * (p.range || 120), ty = P.y + Math.sin(a) * (p.range || 120);
      swing(X, 'swing', a, 0.32);
      fx(X, p.fx || 'crescentSlash', P.x, P.y, fxo(X, p, { tx, ty, duration: p.fxd || (dur ? dur / 1000 + 0.3 : undefined) }));
      for (let i = 0; i < ticks; i++) later(X, ticks > 1 ? dur * i / (ticks - 1) : 0, () => { hitCone(X, P.x, P.y, a, p.range || 120, p.arc || 1.6, p.dmg || 1.5, { kb: p.kb === undefined ? 220 : p.kb, stun: p.stun, slow: p.slow, leech: p.leech, exec: p.exec }); if (i === 0) e.addTrauma(0.3); });
      if (p.lock) P.skillLock = Math.max(P.skillLock || 0, dur / 1000); return true;
    },
    // Delici ok: büyük, auralı bir ok fırlatır; önüne çıkan her canavarı deler
    // ve yavaşlatır (Archer "Piercing Shot").
    pierceArrow(X, p) {
      const { eng, P } = X, a = X.aim;
      const speed = Math.max(320, Number(p.speed) || 1000);
      const len = Math.max(220, Number(p.len) || 760);
      const radius = Math.max(10, Number(p.radius) || 22);
      P.skillLock = Math.max(P.skillLock || 0, 0.18);
      swing(X, 'thrust', a, 0.3);
      eng.sound.play('shoot');
      eng.projectiles.push({
        type: 'pierce_arrow', x: P.x + Math.cos(a) * 24, y: P.y + Math.sin(a) * 24,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        radius, life: Math.min(2.4, len / speed + 0.12),
        damage: X.atk * (p.dmg || 2.0), isCrit: !!p.crit,
        color: X.col, element: p.element || 'physical',
        pierce: true, hitIds: new Set(),
        slow: p.slow == null ? 0.45 : p.slow, slowDur: p.slowDur || 1.8,
        stun: p.stun || 0, ang: a, skill: { element: p.element || 'physical' }
      });
      eng.aoeEffects.push({ x: P.x + Math.cos(a) * 20, y: P.y + Math.sin(a) * 20, radius: 42, duration: 0.3, timer: 0.3, color: X.col, ring: true });
      for (let i = 0; i < 10; i++) {
        const sp = 60 + Math.random() * 200, aa = a + (Math.random() - 0.5) * 0.8;
        eng.addParticle({ wx: P.x, wy: P.y, wz: 18, vx: Math.cos(aa) * sp, vy: Math.sin(aa) * sp, vz: 30 + Math.random() * 60, color: i % 2 ? X.col : '#ffffff', size: 2 + Math.random() * 2, life: 0.3 + Math.random() * 0.25, grav: 20, additive: true });
      }
      eng.addTrauma(0.18);
      return true;
    },
    beam(X, p) {
      const { P } = X, a = X.aim, L = p.len || 340, ticks = p.ticks || 1, dur = p.dur || 150, ex = P.x + Math.cos(a) * L, ey = P.y + Math.sin(a) * L;
      swing(X, 'thrust', a, 0.3);
      fx(X, p.fx || 'beamLine', P.x, P.y, fxo(X, p, { tx: ex, ty: ey, head: p.head, duration: dur / 1000 + 0.4 }));
      for (let i = 0; i < ticks; i++) later(X, ticks > 1 ? dur * i / (ticks - 1) : 60, () => { hitLine(X, P.x, P.y, P.x + Math.cos(a) * L, P.y + Math.sin(a) * L, p.width || 46, p.dmg || 1.8, { kb: 240, stun: p.stun, slow: p.slow, leech: p.leech, crit: p.crit }); if (i === 0) X.eng.addTrauma(0.3); });
      return true;
    },
    fan(X, p) {
      const { eng, P } = X, a = X.aim, n = p.n || 5, waves = p.waves || 1;
      if (p.recoil !== 0) { eng.createGhostTrail(); P.x -= Math.cos(a) * (p.recoil || 12); P.y -= Math.sin(a) * (p.recoil || 12); }
      swing(X, 'thrust', a, 0.24);
      for (let w = 0; w < waves; w++) later(X, w * (p.gap || 110), () => {
        eng.sound.play('shoot');
        for (let i = 0; i < n; i++) { const ang = a + (i - (n - 1) / 2) * (p.spread || 0.12) + (w % 2 ? (p.spread || 0.12) * 0.5 : 0); eng.projectiles.push({ type: p.ptype || 'arrow', x: P.x + Math.cos(ang) * 16, y: P.y + Math.sin(ang) * 16, vx: Math.cos(ang) * (p.speed || 650), vy: Math.sin(ang) * (p.speed || 650), radius: 6, life: 0.95, damage: X.atk * (p.dmg || 0.8), isCrit: !!p.crit, color: X.col }); }
      }); return true;
    },
    rain(X, p) {
      const t = target(X, p), n = p.n || 10, dur = p.dur || 1600, R = p.radius || 150;
      swing(X, 'cast', Math.atan2(t.y - X.P.y, t.x - X.P.x), 0.34);
      if (p.zonefx) fx(X, p.zonefx, t.x, t.y, { radius: R, duration: dur / 1000 + 0.3 }); else fx(X, 'arcaneCircle', t.x, t.y, { radius: R * 0.95, duration: dur / 1000 + 0.2 });
      for (let i = 0; i < n; i++) { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * R, x = t.x + Math.cos(a) * r, y = t.y + Math.sin(a) * r, at = dur * i / n + 120;
        later(X, at, () => { fx(X, p.fx || 'arrowDrop', x, y, { radius: p.fxr, duration: p.fxd, color: X.col }); });
        later(X, at + (p.fall || 330), () => { hitRadius(X, x, y, p.hit || 55, p.dmg || 0.4, { kb: 160, stun: p.stun, slow: p.slow }); if (i % 3 === 0) X.eng.addTrauma(0.12); }); }
      X.eng.addTrauma(0.2); return true;
    },
    pillar(X, p) {
      const t = target(X, p), cnt = p.count || 1, spread = p.spread || 0; swing(X, 'cast', Math.atan2(t.y - X.P.y, t.x - X.P.x), 0.34);
      const rnd = (i) => { if (cnt === 1) return { x: t.x, y: t.y }; const a = i / cnt * TAU + 0.4; return { x: t.x + Math.cos(a) * spread, y: t.y + Math.sin(a) * spread }; };
      for (let i = 0; i < cnt; i++) { const q = rnd(i), at = (p.gap || 0) * i;
        later(X, at, () => fx(X, p.fx || 'holyBeam', q.x, q.y, fxo(X, p, { radius: p.fxr || p.radius })));
        later(X, at + (p.delay || 400), () => { hitRadius(X, q.x, q.y, p.radius || 90, p.dmg || 1.8, { kb: 300, stun: p.stun, slow: p.slow }); X.eng.addTrauma(0.35); X.eng.sound.play('hit'); X.eng.spawnExplosionParticles(q.x, q.y, 10, X.col); }); }
      return true;
    },
    zone(X, p) {
      const t = target(X, p), dur = p.dur || 3000, tick = p.tick || 500, R = p.radius || 130, n = Math.max(1, Math.floor(dur / tick));
      swing(X, 'cast', Math.atan2(t.y - X.P.y, t.x - X.P.x), 0.34);
      fx(X, p.fx || 'arcaneCircle', t.x, t.y, fxo(X, p, { radius: p.fxr || R, duration: dur / 1000 + 0.2 }));
      for (let i = 1; i <= n; i++) later(X, tick * i, () => {
        if (p.dmg) hitRadius(X, t.x, t.y, R, p.dmg, { kb: 60, stun: p.stun, slow: p.slow, leech: p.leech, pull: p.pull });
        if (p.heal && Math.hypot(X.P.x - t.x, X.P.y - t.y) <= R + 20) heal(X, X.stats.maxHp * p.heal);
        if (i % 2 === 0) X.eng.addTrauma(0.08);
      }); return true;
    },
    orbit(X, p) {
      const dur = p.dur || 3000, tick = p.tick || 400, R = p.radius || 100, n = Math.max(1, Math.floor(dur / tick));
      if (p.invuln) invulnerable(X, dur / 1000 + 0.15, dur / 1000);
      swing(X, 'spin', X.aim, 0.42);
      fx(X, p.fx || 'bladeStorm', X.P.x, X.P.y, fxo(X, p, { radius: p.fxr || R, follow: true, duration: dur / 1000 + 0.3 }));
      for (let i = 1; i <= n; i++) later(X, tick * i, () => { const { P } = X; const last = i === n && p.final; hitRadius(X, P.x, P.y, last ? p.final.radius : R, last ? p.final.dmg : p.dmg || 0.6, { kb: last ? 420 : 140, leech: p.leech, stun: last ? p.final.stun : 0, crit: !!last }); if (last) { fx(X, 'pulseNova', P.x, P.y, { radius: p.final.radius }); X.eng.addTrauma(0.5); X.eng.spawnExplosionParticles(P.x, P.y, 20, X.col); } else if (i % 2 === 0) X.eng.addTrauma(0.1); });
      return true;
    },
    buff(X, p) {
      const { eng, P } = X, dur = (p.dur || 4) * 1000;
      swing(X, 'cast', X.aim, 0.36);
      if (p.invuln) invulnerable(X, p.invuln, 0);
      if (p.shield) shieldSet(X, X.stats.maxHp * p.shield, (p.dur || 4));
      if (p.heal) heal(X, X.stats.maxHp * p.heal);
      if (p.speed) { P.speedMul = (P.speedMul || 1) * p.speed; later(X, dur, () => { P.speedMul = (P.speedMul || 1) / p.speed; if (Math.abs(P.speedMul - 1) < 0.001) P.speedMul = 1; }); }
      if (p.haste) { P.hasteMul = p.haste; later(X, dur, () => { P.hasteMul = 1; }); }
      if (p.leech) { const st = X.stats, add = p.leech; st.omnivamp = (st.omnivamp || 0) + add; later(X, dur, () => { st.omnivamp = Math.max(0, (st.omnivamp || 0) - add); }); }
      if (p.pet && eng.commandPetFrenzy) eng.commandPetFrenzy();
      if (p.crit) { const st = X.stats, add = p.crit; st.critChance = (st.critChance || 0) + add; later(X, dur, () => { st.critChance = Math.max(0, (st.critChance || 0) - add); }); }
      if (p.endHeal) later(X, dur, () => heal(X, X.stats.maxHp * p.endHeal));
      fx(X, p.fx || 'shieldDome', P.x, P.y, fxo(X, p, { follow: true, duration: dur / 1000, radius: p.fxr || 46 })); eng.addTrauma(0.2); eng.sound.play('ultimate'); return true;
    },
    heal(X, p) { swing(X, 'cast', X.aim, 0.34); heal(X, X.stats.maxHp * (p.pct || 0.2)); if (p.fx !== null) fx(X, p.fx || 'healPulse', X.P.x, X.P.y, fxo(X, p, { follow: true, radius: p.fxr || 60 })); X.eng.sound.play('ultimate'); return true; },
    // ===================== YENİ DAVRANIŞLAR =====================
    // Zincir kanca: önündeki düşman(lar)ı yanına çeker
    hook(X, p) {
      const { eng, P } = X, a = X.aim, R = p.range || 400, w = p.width || 80, ex = P.x + Math.cos(a) * R, ey = P.y + Math.sin(a) * R;
      const list = alive(eng).filter((m) => segDist(m.x, m.y, P.x, P.y, ex, ey) <= w / 2 + m.radius).sort((u, v) => dist(u, P) - dist(v, P)).slice(0, p.n || 1);
      fx(X, p.fx || 'lineSlash', P.x, P.y, { tx: list.length ? list[0].x : ex, ty: list.length ? list[0].y : ey, radius: 50 });
      // Kılıç her durumda savrulsun (boşa atılsa da animasyon görünür).
      swing(X, 'slash', a, 0.32);
      if (!list.length) { X.refund = 0.4; return true; }
      swing(X, 'thrust', a, 0.26);
      list.forEach((m, k) => {
        const ox = m.x, oy = m.y, off = (k - (list.length - 1) / 2) * 38, perp = a + Math.PI / 2;
        const tx = P.x + Math.cos(a) * (m.radius + 34) + Math.cos(perp) * off, ty = P.y + Math.sin(a) * (m.radius + 34) + Math.sin(perp) * off;
        if (k) fx(X, p.fx || 'lineSlash', P.x, P.y, { tx: ox, ty: oy, radius: 50 });
        for (let i = 1; i <= 6; i++) later(X, 60 + i * 28, () => { if (m.hp > 0 && !m.dead) { m.x = lerp(ox, tx, i / 6); m.y = lerp(oy, ty, i / 6); } });
        later(X, 60 + 6 * 28 + 20, () => { if (m.hp <= 0 || m.dead) return; hurt(X, m, p.dmg || 1.3, a, { kb: 40, stun: p.stun }); fx(X, 'slashX', m.x, m.y, { radius: 55 }); eng.addTrauma(0.3); eng.sound.play('hit'); });
      });
      return true;
    },
    // Hızlı ardışık ileri doğru kılıç serisi
    flurry(X, p) {
      const { eng, P } = X, a = X.aim, n = p.n || 6, gap = p.gap || 85, adv = p.adv || 20;
      P.skillLock = Math.max(P.skillLock || 0, (n * gap) / 1000 + 0.05);
      for (let i = 0; i < n; i++) later(X, i * gap, () => {
        const c = clampMap(eng, P.x + Math.cos(a) * adv, P.y + Math.sin(a) * adv); P.x = c.x; P.y = c.y; P.facingAngle = a;
        const sa = a + (i % 2 ? 0.55 : -0.55), last = i === n - 1;
        swing(X, last ? 'swing' : 'slash', sa, last ? 0.34 : 0.2);
        hitCone(X, P.x, P.y, a, p.range || 115, p.arc || 2, last ? (p.dmg || 0.9) * 1.6 : (p.dmg || 0.9), { kb: last ? 320 : 70, stun: last ? (p.stun || 0.4) : 0, crit: last });
        fx(X, p.fx || 'crescentSlash', P.x, P.y, { tx: P.x + Math.cos(sa) * 100, ty: P.y + Math.sin(sa) * 100, radius: p.fxr || 80 });
        if (i % 2 === 0) eng.createGhostTrail(); eng.addTrauma(last ? 0.45 : 0.15); eng.sound.play(last ? 'hit' : 'slash');
        if (last) fx(X, 'slashX', P.x + Math.cos(a) * 60, P.y + Math.sin(a) * 60, { radius: 70 });
      });
      return true;
    },
    // Tuzak: yere kurulur, düşman yaklaşınca patlar
    trap(X, p) {
      const base = target(X, p), cnt = p.count || 1, R = p.radius || 90, life = p.life || 6000, arm = p.arm || 500;
      swing(X, 'cast', Math.atan2(base.y - X.P.y, base.x - X.P.x), 0.32);
      for (let i = 0; i < cnt; i++) {
        const ang = i / cnt * TAU + 0.5, sp = p.spread || 100, pos = cnt === 1 ? { x: base.x, y: base.y } : { x: base.x + Math.cos(ang) * sp, y: base.y + Math.sin(ang) * sp };
        let done = false;
        fx(X, p.fx || 'arcaneCircle', pos.x, pos.y, { radius: R * 0.7, duration: life / 1000 });
        const poll = (t) => later(X, 100, () => {
          if (done || t >= life) return;
          if (alive(X.eng).some((m) => Math.hypot(m.x - pos.x, m.y - pos.y) <= R * 0.65 + m.radius)) {
            done = true; hitRadius(X, pos.x, pos.y, R, p.dmg || 1.8, { kb: 200, stun: p.stun, slow: p.slow });
            fx(X, p.blastfx || 'pulseNova', pos.x, pos.y, { radius: R }); X.eng.addTrauma(0.3); X.eng.sound.play('hit'); X.eng.spawnExplosionParticles(pos.x, pos.y, 12, X.col);
          } else poll(t + 100);
        });
        later(X, arm, () => poll(arm));
      }
      return true;
    },
    // Yem: geride kopya bırakır, gecikmeyle patlar (isteğe bağlı geri sıçrama)
    decoy(X, p) {
      const { eng, P } = X, cnt = p.count || 1, R = p.radius || 110, origin = { x: P.x, y: P.y }, a = X.aim;
      swing(X, 'cast', a, 0.32);
      if (p.invuln) invulnerable(X, p.invuln, 0.1);
      if (p.back) { fx(X, 'shadowStep', origin.x, origin.y, { radius: 50 }); eng.createGhostTrail(); const d = world(X, p.back, a + Math.PI); teleport(X, d.x, d.y); ghostLine(X, origin.x, origin.y, P.x, P.y, 6); }
      for (let i = 0; i < cnt; i++) {
        const ang = i / cnt * TAU + 0.3, sp = p.spread || 120, pos = cnt === 1 ? origin : { x: origin.x + Math.cos(ang) * sp, y: origin.y + Math.sin(ang) * sp }, at = (p.delay || 800) + i * (p.gap || 0);
        fx(X, p.fx || 'shadowStep', pos.x, pos.y, { radius: p.fxr || 55, duration: at / 1000 });
        later(X, at, () => { hitRadius(X, pos.x, pos.y, R, p.dmg || 1.5, { kb: 260, stun: p.stun, pull: p.pull }); fx(X, p.blastfx || 'pulseNova', pos.x, pos.y, { radius: R }); eng.addTrauma(0.3); eng.sound.play('hit'); eng.spawnExplosionParticles(pos.x, pos.y, 12, X.col); });
      }
      return true;
    },
    // Sabit kule: süre boyunca en yakın düşmanlara ateş eder
    turret(X, p) {
      const t = target(X, p), dur = p.dur || 4000, tick = p.tick || 500, n = Math.max(1, Math.floor(dur / tick)), Rg = p.range || 340;
      swing(X, 'cast', Math.atan2(t.y - X.P.y, t.x - X.P.x), 0.34);
      fx(X, p.fx || 'treeOfLife', t.x, t.y, { radius: p.fxr || 60, duration: dur / 1000 + 0.2 });
      for (let i = 1; i <= n; i++) later(X, tick * i, () => {
        near(X, t.x, t.y, Rg).slice(0, p.shots || 1).forEach((m) => {
          if (p.shotfx !== null) fx(X, p.shotfx || 'lineSlash', t.x, t.y, { tx: m.x, ty: m.y, radius: 35 });
          if (p.hitfx) fx(X, p.hitfx, m.x, m.y, { radius: p.hitr || 60 });
          hurt(X, m, p.dmg || 0.6, Math.atan2(m.y - t.y, m.x - t.x), { kb: 60, slow: p.slow, stun: p.stun });
        });
      });
      return true;
    },
    // Takipçi: oyuncuyu izler, süre boyunca en yakın düşmanlara saldırır
    familiar(X, p) {
      const dur = p.dur || 4000, tick = p.tick || 450, n = Math.max(1, Math.floor(dur / tick)), Rg = p.range || 380;
      swing(X, 'cast', X.aim, 0.34);
      fx(X, p.fx || 'spiritWolves', X.P.x, X.P.y, fxo(X, p, { follow: true, duration: dur / 1000 + 0.2, radius: p.fxr || 85 }));
      for (let i = 1; i <= n; i++) later(X, tick * i, () => {
        const { P } = X, oa = i * 1.7;
        near(X, P.x, P.y, Rg).slice(0, p.n || 2).forEach((m, k) => {
          const sx = P.x + Math.cos(oa + k * 2.1) * 60, sy = P.y + Math.sin(oa + k * 2.1) * 60;
          fx(X, 'lineSlash', sx, sy, { tx: m.x, ty: m.y, radius: 45 }); fx(X, p.hitfx || 'slashX', m.x, m.y, { radius: 55 });
          hurt(X, m, p.dmg || 0.8, Math.atan2(m.y - sy, m.x - sx), { kb: 90, slow: p.slow, leech: p.leech });
        });
      });
      return true;
    },
    // Zincir yıldırım: düşmandan düşmana sıçrar, her sıçramada hasar düşer
    arc(X, p) {
      const { eng, P } = X, n = p.n || 4, hop = p.hop || 250, seen = new Set(), links = []; let cur = { x: P.x, y: P.y };
      for (let i = 0; i < n; i++) { const m = near(X, cur.x, cur.y, i ? hop : (p.range || 400), seen)[0]; if (!m) break; seen.add(m); links.push({ m, from: { x: cur.x, y: cur.y } }); cur = m; }
      if (!links.length) { X.refund = 0.4; return true; }
      swing(X, 'cast', X.aim, 0.32);
      links.forEach((l, i) => later(X, 40 + i * (p.gap || 85), () => {
        fx(X, p.fx || 'lineSlash', l.from.x, l.from.y, { tx: l.m.x, ty: l.m.y, radius: 45 });
        if (p.hitfx) fx(X, p.hitfx, l.m.x, l.m.y, { radius: p.fxr || 50 });
        if (l.m.hp > 0 && !l.m.dead) hurt(X, l.m, (p.dmg || 1.2) * Math.max(0.35, 1 - (p.decay || 0.1) * i), Math.atan2(l.m.y - l.from.y, l.m.x - l.from.x), { kb: 80, slow: p.slow, stun: p.stun });
        if (p.heal) heal(X, X.stats.maxHp * p.heal);
        eng.addTrauma(0.12); eng.sound.play('hit');
      }));
      return true;
    },
    // İşaret: imlece en yakın düşmanı işaretler, gecikmeyle infaz eder
    mark(X, p) {
      const { eng } = X, c = { x: eng.mouse.worldX, y: eng.mouse.worldY }, m = near(X, c.x, c.y, p.range || 300)[0], delay = p.delay || 1000, at = m ? { x: m.x, y: m.y } : c;
      swing(X, 'cast', Math.atan2(at.y - X.P.y, at.x - X.P.x), 0.34);
      fx(X, p.markfx || 'arcaneCircle', at.x, at.y, { radius: 55, duration: delay / 1000 });
      later(X, delay, () => {
        const ok = m && m.hp > 0 && !m.dead, x = ok ? m.x : at.x, y = ok ? m.y : at.y;
        fx(X, p.fx || 'judgementSwords', x, y, { radius: p.fxr || 120 });
        hitRadius(X, x, y, p.radius || 110, p.splash || 1, { kb: 260, stun: p.stun });
        if (ok) hurt(X, m, p.dmg || 3, 0, { kb: 200, stun: p.stun, exec: p.exec, crit: true });
        eng.addTrauma(0.5); eng.sound.play('hit'); eng.spawnExplosionParticles(x, y, 16, X.col);
      });
      return true;
    },
    // Zaman geri sarma: süre sonunda eski konuma ve (düşmüşse) eski cana döner
    rewind(X, p) {
      const { eng, P, stats } = X, sx = P.x, sy = P.y, hp0 = stats.currentHp, dur = p.dur || 2500;
      invulnerable(X, p.invuln || 0.3, 0); fx(X, 'dimensionRift', sx, sy, { radius: 55, duration: dur / 1000 }); swing(X, 'cast', X.aim, 0.34);
      later(X, dur, () => {
        const ox = P.x, oy = P.y; eng.createGhostTrail(); fx(X, 'dimensionRift', ox, oy, { radius: 55 }); ghostLine(X, ox, oy, sx, sy, 8);
        teleport(X, sx, sy); fx(X, 'pulseNova', sx, sy, { radius: p.radius || 110 }); hitRadius(X, sx, sy, p.radius || 110, p.dmg || 1.2, { kb: 240 });
        if (stats.currentHp < hp0) { stats.currentHp = Math.min(stats.maxHp, hp0); if (eng.onStatsChange) eng.onStatsChange(stats); eng.spawnDamageNumber(P.x, P.y - 30, 'REWIND', X.col, true); }
        eng.addTrauma(0.4);
      });
      return true;
    },
    // Yer değiştirme: imleçteki düşmanla yer değiştirir
    swap(X, p) {
      const { eng, P } = X, c = { x: eng.mouse.worldX, y: eng.mouse.worldY }, m = near(X, c.x, c.y, 220).filter((q) => dist(q, P) <= (p.range || 480))[0];
      if (!m) return B.blink(X, { range: 200, invuln: 0.3, fx: 'shadowStep', refund: 0.5 });
      const ox = P.x, oy = P.y, mx = m.x, my = m.y; invulnerable(X, 0.35, 0.1); eng.createGhostTrail(); swing(X, 'thrust', Math.atan2(my - oy, mx - ox), 0.3);
      fx(X, 'shadowStep', ox, oy, { radius: 55 }); fx(X, 'shadowStep', mx, my, { radius: 55 }); fx(X, 'lineSlash', ox, oy, { tx: mx, ty: my, radius: 50 });
      teleport(X, mx, my); m.x = ox; m.y = oy; ghostLine(X, ox, oy, P.x, P.y, 6);
      later(X, 60, () => { hurt(X, m, p.dmg || 1.3, Math.atan2(m.y - P.y, m.x - P.x), { kb: 0, stun: p.stun || 0.7 }); if (p.nova) { hitRadius(X, P.x, P.y, p.nova.radius, p.nova.dmg, { kb: 220 }); fx(X, 'pulseNova', P.x, P.y, { radius: p.nova.radius }); } eng.addTrauma(0.35); eng.sound.play('hit'); });
      return true;
    },
    // Kan bedeli: can feda et, harcadığın cana göre büyüyen patlama
    sacrifice(X, p) {
      const { eng, P, stats } = X, cost = Math.max(0, Math.min(stats.currentHp - 1, stats.maxHp * (p.cost || 0.15)));
      stats.currentHp -= cost; if (eng.onStatsChange) eng.onStatsChange(stats); eng.spawnDamageNumber(P.x, P.y, `-${Math.round(cost)}`, '#ff1744');
      const mult = (p.dmg || 1.2) + (cost / stats.maxHp) * (p.scale || 10), cx = P.x, cy = P.y;
      fx(X, p.fx || 'bloodRitual', cx, cy, { radius: p.fxr || 140, duration: (p.delay || 400) / 1000 + 0.3 });
      later(X, p.delay || 400, () => { swing(X, 'slam', X.aim, 0.44); hitRadius(X, cx, cy, p.radius || 170, mult, { kb: 340, stun: p.stun, leech: p.leech }); fx(X, 'pulseNova', cx, cy, { radius: p.radius || 170 }); eng.addTrauma(0.55); eng.sound.play('hit'); eng.spawnExplosionParticles(cx, cy, 20, X.col); });
      return true;
    },
    // Can emme: vurulan düşman sayısı kadar iyileştirir
    siphon(X, p) {
      const run = () => { const { P } = X; swing(X, 'spin', X.aim, 0.4); const hits = hitRadius(X, P.x, P.y, p.radius || 150, p.dmg || 1.5, { kb: 240, leech: p.leech, stun: p.stun }); heal(X, X.stats.maxHp * (p.per || 0.03) * Math.min(hits, p.cap || 8)); fx(X, p.fx || 'soulHarvest', P.x, P.y, fxo(X, p, { radius: p.fxr || p.radius })); X.eng.addTrauma(0.4); X.eng.spawnExplosionParticles(P.x, P.y, 14, X.col); };
      p.delay ? later(X, p.delay, run) : run();
      return true;
    },
    // Duvar: önünde yan yana bir hat boyunca kalıcı hasar/yavaşlatma
    wall(X, p) {
      const { P } = X, a = X.aim, N = p.n || 5, L = p.len || 340, dur = p.dur || 3000, tick = p.tick || 500, perp = a + Math.PI / 2, cx = P.x + Math.cos(a) * (p.dist || 160), cy = P.y + Math.sin(a) * (p.dist || 160), seenK = {};
      swing(X, 'cast', a, 0.34);
      for (let i = 0; i < N; i++) {
        const u = N === 1 ? 0 : (i / (N - 1) - 0.5) * L, pos = { x: cx + Math.cos(perp) * u, y: cy + Math.sin(perp) * u };
        later(X, i * 55, () => fx(X, p.fx || 'vineGrasp', pos.x, pos.y, fxo(X, p, { radius: p.fxr || 50, duration: dur / 1000, follow: false })));
        for (let k = 1; k <= Math.floor(dur / tick); k++) later(X, i * 55 + tick * k, () => { const s = seenK[k] || (seenK[k] = new Set()); hitOnce(X, pos.x, pos.y, p.radius || 55, p.dmg || 0.4, { kb: 40, stun: p.stun, slow: p.slow }, s); });
      }
      X.eng.addTrauma(0.25); return true;
    },
    // İz bırakan atılma: yol boyunca hasar/iyileştirme alanları
    trail(X, p) {
      const { eng, P } = X, a = X.aim, d0 = p.dist || 240, dur = p.dur || 220, steps = 10, sx = P.x, sy = P.y, end = clampMap(eng, sx + Math.cos(a) * d0, sy + Math.sin(a) * d0), seenK = {};
      P.skillLock = dur / 1000 + 0.04; P.invuln = Math.max(P.invuln || 0, dur / 1000 + 0.1);
      swing(X, 'thrust', a, 0.28);
      fx(X, 'lineSlash', sx, sy, { tx: end.x, ty: end.y, radius: 55 }); eng.createGhostTrail();
      for (let i = 1; i <= steps; i++) later(X, dur * i / steps, () => {
        P.x = lerp(sx, end.x, i / steps); P.y = lerp(sy, end.y, i / steps); if (i % 3 === 0) eng.createGhostTrail();
        if (i % 2 === 0) {
          const px = P.x, py = P.y, R = p.radius || 60, tk = p.tick || 450, tn = p.ticks || 3;
          fx(X, p.pfx || 'poisonCloud', px, py, { radius: p.pr || R, duration: tn * tk / 1000 + 0.2 });
          for (let k = 1; k <= tn; k++) later(X, tk * k, () => {
            const s = seenK[k] || (seenK[k] = new Set()); hitOnce(X, px, py, R, p.dmg || 0.5, { kb: 40, slow: p.slow, stun: p.stun, leech: p.leech }, s);
            if (p.heal && Math.hypot(X.P.x - px, X.P.y - py) <= R + 25) heal(X, X.stats.maxHp * p.heal);
          });
        }
      });
      return true;
    },
    // Koç atışı: yoldaki düşmanları önüne alıp sürükler, sonunda çarpar
    ram(X, p) {
      const { eng, P } = X, a = X.aim, d0 = p.dist || 260, dur = p.dur || 260, steps = 10, sx = P.x, sy = P.y, end = clampMap(eng, sx + Math.cos(a) * d0, sy + Math.sin(a) * d0), caught = [], perp = a + Math.PI / 2;
      P.skillLock = dur / 1000 + 0.05; P.invuln = Math.max(P.invuln || 0, (p.invuln || 0.3) + dur / 1000);
      swing(X, 'thrust', a, 0.32);
      fx(X, p.fx || 'lineSlash', sx, sy, fxo(X, p, { tx: end.x, ty: end.y, radius: 70 })); eng.createGhostTrail();
      for (let i = 1; i <= steps; i++) later(X, dur * i / steps, () => {
        P.x = lerp(sx, end.x, i / steps); P.y = lerp(sy, end.y, i / steps); if (i % 3 === 0) eng.createGhostTrail();
        alive(eng).forEach((m) => { if (!caught.includes(m) && Math.hypot(m.x - P.x - Math.cos(a) * 30, m.y - P.y - Math.sin(a) * 30) <= (p.width || 80) / 2 + m.radius) { caught.push(m); hurt(X, m, p.dmg || 1.2, a, { kb: 0, stun: 0.3 }); } });
        caught.forEach((m, k) => { if (m.hp > 0 && !m.dead) { const off = (k % 5 - 2) * 26; m.x = P.x + Math.cos(a) * (m.radius + 34) + Math.cos(perp) * off; m.y = P.y + Math.sin(a) * (m.radius + 34) + Math.sin(perp) * off; } });
        if (i === steps) { hitRadius(X, P.x, P.y, p.radius || 110, p.end || 1.4, { kb: 340, stun: p.stun }); fx(X, 'groundSlam', P.x, P.y, { radius: p.radius || 110 }); eng.addTrauma(0.5); eng.sound.play('hit'); eng.spawnExplosionParticles(P.x, P.y, 14, X.col); }
      });
      return true;
    },
    // Fay hattı: ileri doğru art arda yer patlamaları (isteğe bağlı çok şeritli)
    quake(X, p) {
      const { P } = X, a = X.aim, n = p.n || 5, step = p.step || 85, lanes = p.lanes || 1, perp = a + Math.PI / 2, ox = P.x, oy = P.y;
      swing(X, 'slam', a, 0.4);
      for (let l = 0; l < lanes; l++) {
        const off = (l - (lanes - 1) / 2) * (p.lanegap || 110);
        for (let i = 0; i < n; i++) {
          const c = clampMap(X.eng, ox + Math.cos(a) * (70 + step * i) + Math.cos(perp) * off, oy + Math.sin(a) * (70 + step * i) + Math.sin(perp) * off);
          later(X, 60 + i * (p.gap || 90) + l * 40, () => { hitRadius(X, c.x, c.y, p.radius || 60, p.dmg || 1, { kb: p.kb === undefined ? 200 : p.kb, stun: p.stun, slow: p.slow }); fx(X, p.fx || 'groundSlam', c.x, c.y, { radius: p.fxr || p.radius || 60 }); if (i % 2 === 0) X.eng.addTrauma(0.2); if (i % 3 === 0) X.eng.sound.play('hit'); X.eng.spawnExplosionParticles(c.x, c.y, 6, X.col); });
        }
      }
      return true;
    },
    // 360° mermi halkası, dalga başına dönerek (spiral)
    ring(X, p) {
      const { eng, P } = X, n = p.n || 10, waves = p.waves || 3; swing(X, 'cast', X.aim, 0.36); fx(X, p.fx || 'pulseNova', P.x, P.y, { radius: 60 });
      for (let w = 0; w < waves; w++) later(X, w * (p.gap || 130), () => {
        eng.sound.play('shoot'); const rot = w * (p.twist || 0.3);
        for (let i = 0; i < n; i++) { const ang = i / n * TAU + rot; eng.projectiles.push({ type: p.ptype || 'arrow', x: P.x + Math.cos(ang) * 16, y: P.y + Math.sin(ang) * 16, vx: Math.cos(ang) * (p.speed || 600), vy: Math.sin(ang) * (p.speed || 600), radius: 6, life: 0.9, damage: X.atk * (p.dmg || 0.7), isCrit: !!p.crit, color: X.col }); }
      });
      return true;
    },
    // Bumerang: ileri gider, geri dönerken tekrar vurur
    boomerang(X, p) {
      const { eng, P } = X, a = X.aim, L = p.len || 320, ex = P.x + Math.cos(a) * L, ey = P.y + Math.sin(a) * L, ox = P.x, oy = P.y, back = p.back || 420, w = p.width || 60;
      eng.sound.play('slash'); fx(X, p.fx || 'lineSlash', ox, oy, { tx: ex, ty: ey, radius: 55 });
      swing(X, 'thrust', a, 0.3);
      later(X, 90, () => { hitLine(X, ox, oy, ex, ey, w, p.dmg || 1.3, { kb: 160, crit: p.crit, leech: p.leech, stun: p.stun }, new Set()); fx(X, 'slashX', ex, ey, { radius: 60 }); eng.addTrauma(0.2); });
      later(X, back, () => { const px = X.P.x, py = X.P.y; swing(X, 'thrust', a + Math.PI, 0.26); fx(X, p.fx || 'lineSlash', ex, ey, { tx: px, ty: py, radius: 55 }); hitLine(X, ex, ey, px, py, w, p.dmg || 1.3, { kb: 120, crit: p.crit, leech: p.leech, stun: p.stun }, new Set()); fx(X, 'slashX', px, py, { radius: 50 }); eng.addTrauma(0.2); eng.sound.play('hit'); });
      return true;
    },
    // Zaman durdurma: alandaki herkesi sersemletir, isteğe bağlı hasar + final patlaması
    freeze(X, p) {
      const { eng, P } = X, R = p.radius || 320, cx = P.x, cy = P.y, st = p.stun || 2.5, tick = p.tick || 500, ticks = p.ticks || 0;
      swing(X, 'cast', X.aim, 0.38);
      fx(X, p.fx || 'arcaneCircle', cx, cy, fxo(X, p, { radius: p.fxr || R * 0.8, duration: st + 0.4, follow: false })); eng.addTrauma(0.4); eng.sound.play('ultimate');
      alive(eng).forEach((m) => { if (Math.hypot(m.x - cx, m.y - cy) <= R + m.radius) m.stun = Math.max(m.stun || 0, st); });
      for (let k = 1; k <= ticks; k++) later(X, tick * k, () => { hitRadius(X, cx, cy, R, p.dmg || 0.4, { kb: 0 }); });
      if (p.final) later(X, st * 1000, () => { hitRadius(X, cx, cy, p.final.radius || R, p.final.dmg || 2, { kb: 300, crit: true }); fx(X, 'pulseNova', cx, cy, { radius: p.final.radius || R }); eng.addTrauma(0.6); eng.spawnExplosionParticles(cx, cy, 22, X.col); });
      return true;
    },
    // Girdap: düşmanları merkeze çeker, sonunda büyük patlama
    vortex(X, p) {
      const t = target(X, p), R = p.radius || 250, dur = p.dur || 1800, tick = p.tick || 250, n = Math.max(1, Math.floor(dur / tick));
      swing(X, 'cast', Math.atan2(t.y - X.P.y, t.x - X.P.x), 0.38);
      fx(X, p.fx || 'gravityWell', t.x, t.y, fxo(X, p, { radius: p.fxr || R * 0.7, duration: dur / 1000 + 0.3, follow: false }));
      for (let i = 1; i <= n; i++) later(X, tick * i, () => {
        alive(X.eng).forEach((m) => { if (Math.hypot(m.x - t.x, m.y - t.y) <= R + m.radius) { m.x += (t.x - m.x) * (p.pull || 0.15); m.y += (t.y - m.y) * (p.pull || 0.15); if (p.slow) { m.slow = Math.max(m.slow || 0, p.slow); m.slowMul = 0.45; } } });
        if (p.dmg) hitRadius(X, t.x, t.y, R, p.dmg, { kb: 0 });
        if (i % 2 === 0) X.eng.addTrauma(0.1);
      });
      if (p.final) later(X, dur + 80, () => { const f = p.final; hitRadius(X, t.x, t.y, f.radius || 140, f.dmg || 2.5, { kb: 380, stun: f.stun, crit: true }); fx(X, 'pulseNova', t.x, t.y, { radius: f.radius || 140 }); fx(X, 'groundSlam', t.x, t.y, { radius: f.radius || 140 }); X.eng.addTrauma(0.6); X.eng.sound.play('hit'); X.eng.spawnExplosionParticles(t.x, t.y, 22, X.col); });
      return true;
    },
    // Bağ: en yakın N düşmana bağlanır; hasar/yavaşlatma/can çalma/sürükleme
    tether(X, p) {
      const { eng, P } = X, dur = p.dur || 2500, tick = p.tick || 400, n = Math.max(1, Math.floor(dur / tick)), Rg = p.range || 400, list = near(X, P.x, P.y, Rg).slice(0, p.n || 3);
      if (!list.length) { X.refund = 0.4; return true; }
      swing(X, 'cast', X.aim, 0.34);
      for (let i = 1; i <= n; i++) later(X, tick * i, () => {
        const Q = X.P;
        list.forEach((m) => {
          if (m.hp <= 0 || m.dead || dist(m, Q) > Rg * 1.6) return;
          fx(X, p.fx || 'lineSlash', Q.x, Q.y, { tx: m.x, ty: m.y, radius: 38 });
          hurt(X, m, p.dmg || 0.5, Math.atan2(m.y - Q.y, m.x - Q.x), { kb: 0, slow: p.slow, stun: p.stun, leech: p.leech });
          if (p.drag) { m.x += (Q.x - m.x) * p.drag; m.y += (Q.y - m.y) * p.drag; }
        });
        if (i % 2 === 0) eng.addTrauma(0.1);
      });
      return true;
    },
    // Parçalama: koni vuruşu + vurulanlara kanama (zamanla hasar)
    rend(X, p) {
      const { eng, P } = X, a = X.aim, hit = coneList(X, P.x, P.y, a, p.range || 130, p.arc || 1.4);
      swing(X, 'swing', a, 0.3);
      fx(X, p.fx || 'bloodScythe', P.x, P.y, fxo(X, p, { tx: P.x + Math.cos(a) * (p.range || 130), ty: P.y + Math.sin(a) * (p.range || 130) }));
      hit.forEach((m) => hurt(X, m, p.dmg || 1.3, a, { kb: 160, slow: p.slow, stun: p.stun })); if (hit.length) eng.addTrauma(0.3);
      for (let k = 1; k <= (p.ticks || 4); k++) later(X, (p.tick || 400) * k, () => hit.forEach((m) => { if (m.hp > 0 && !m.dead) { hurt(X, m, p.bleed || 0.25, a, { kb: 0 }); eng.spawnExplosionParticles(m.x, m.y, 4, X.col); } }));
      return true;
    },
    // Üstüne atlama: en yakın düşmanın üzerine zıplar
    pounce(X, p) {
      const { eng, P } = X, c = { x: eng.mouse.worldX, y: eng.mouse.worldY }, m = near(X, c.x, c.y, 260).filter((q) => dist(q, P) <= (p.range || 420))[0] || near(X, P.x, P.y, p.range || 420)[0];
      const sx = P.x, sy = P.y, a0 = m ? Math.atan2(m.y - sy, m.x - sx) : X.aim, d = m ? Math.max(0, dist(m, P) - m.radius - 20) : Math.min(260, Math.hypot(c.x - sx, c.y - sy));
      const end = clampMap(eng, sx + Math.cos(a0) * d, sy + Math.sin(a0) * d), steps = 14, dur = 380;
      P.skillLock = dur / 1000 + 0.05; P.invuln = Math.max(P.invuln || 0, dur / 1000 + 0.1); P.facingAngle = a0;
      fx(X, 'lineSlash', sx, sy, { tx: end.x, ty: end.y, radius: 55 });
      swing(X, 'thrust', a0, 0.3);
      for (let i = 1; i <= steps; i++) later(X, dur * i / steps, () => {
        const u = i / steps; P.x = lerp(sx, end.x, u); P.y = lerp(sy, end.y, u); P.zLift = Math.sin(u * Math.PI) * 55; if (i % 4 === 0) eng.createGhostTrail();
        if (i === steps) { P.zLift = 0; hitRadius(X, P.x, P.y, p.radius || 90, p.dmg || 1.9, { kb: 280, stun: p.stun, crit: true }); fx(X, p.fx || 'pulseNova', P.x, P.y, { radius: p.radius || 90 }); fx(X, 'bloodScythe', P.x, P.y, { radius: 70 }); eng.addTrauma(0.5); eng.sound.play('hit'); eng.spawnExplosionParticles(P.x, P.y, 14, X.col); }
      });
      return true;
    },
    // Hedef arama: en yakın N düşmana anında vurur (isteğe bağlı iyileştirme)
    seek(X, p) {
      const { eng, P } = X, list = near(X, P.x, P.y, p.range || 440).slice(0, p.n || 3);
      if (!list.length) { X.refund = 0.4; return true; }
      swing(X, 'slash', Math.atan2(list[0].y - X.P.y, list[0].x - X.P.x), 0.28);
      list.forEach((m, i) => later(X, 30 + i * (p.gap || 70), () => {
        if (m.hp <= 0 || m.dead) return;
        fx(X, p.fx || 'lineSlash', X.P.x, X.P.y, { tx: m.x, ty: m.y, radius: 40 }); if (p.hitfx) fx(X, p.hitfx, m.x, m.y, { radius: p.fxr || 50 });
        hurt(X, m, p.dmg || 1, Math.atan2(m.y - X.P.y, m.x - X.P.x), { kb: 100, slow: p.slow, stun: p.stun, leech: p.leech });
        if (p.heal) heal(X, X.stats.maxHp * p.heal); eng.addTrauma(0.12); eng.sound.play('hit');
      }));
      return true;
    }
  };

  // ------------------------------------------------------------------ çalıştırıcı
  const DEFAULT_CD = { q: 5, e: 9, r: 24 };

  // SK satırı -> { name, cd, behavior, params }  (veriye taşıma / geri doldurma için)
  function fromRow(def) {
    if (!Array.isArray(def)) return null;
    const parts = Array.isArray(def[2]) ? def[2] : [[def[2], def[3] || {}]];
    const single = parts.length === 1;
    return {
      name: def[0],
      cd: Number(def[1]) || 8,
      behavior: single ? parts[0][0] : 'multi',
      params: single ? Object.assign({}, parts[0][1]) : { parts: parts.map(([k, p]) => ({ kind: k, params: Object.assign({}, p || {}) })) }
    };
  }

  // content.js `arpgSkills[slug][slot]` içindeki behavior + params ile çalıştır.
  // GameCraft'tan düzenlenen asıl yol burasıdır.
  function runSkill(eng, sk, key) {
    if (!sk || !sk.behavior || !eng || !eng.player || !eng.playerData) return false;
    const list = sk.behavior === 'multi'
      ? (Array.isArray(sk.params && sk.params.parts) ? sk.params.parts : []).map((p) => [p && p.kind, (p && p.params) || {}])
      : [[sk.behavior, sk.params || {}]];
    if (!list.length) return false;
    const st = eng.playerData.stats || (eng.playerData.stats = {});
    const skScale = typeof eng.damageScale === 'function' ? eng.damageScale() : 1;
    const atk = Math.max(1, ((Number(st.attack) || 0) + (Number(st.magicPower) || 0) * 0.25) * skScale);
    const X = {
      eng, P: eng.player, stats: st, atk,
      aim: typeof eng.skillAim === 'function' ? eng.skillAim() : 0,
      c: { key, cd: (eng.player.cooldowns && eng.player.cooldowns[key]) || { max: 0, current: 0 } },
      def: [sk.name, sk.cd], name: sk.name, refund: 0
    };
    X.col = (eng.getManaColor && eng.getManaColor()) || sk.color || '#9fd8ff';
    let ran = false;
    for (const [kind, p] of list) {
      const fn = B[kind];
      if (!fn) { console.warn('[TravelSkills] bilinmeyen davranış:', kind, '(' + sk.name + ')'); continue; }
      fn(X, Object.assign({}, p));
      ran = true;
    }
    return ran;
  }

  function run(eng, c, def, color) {
    if (!def || !eng.player || !eng.playerData || !eng.playerData.stats) return;
    if (!c.cd) c.cd = { max: 0, current: 0 };
    const cdv = Number(def[1]) || DEFAULT_CD[c.key] || 8;
    const st = eng.playerData.stats;
    const scale = typeof eng.damageScale === 'function' ? eng.damageScale() : 1;
    const atk = ((Number(st.attack) || 0) + (Number(st.magicPower) || 0) * 0.25) * scale;
    const X = { eng, P: eng.player, stats: st, atk: Math.max(1, atk), aim: c.aimAngle, c, def, name: def[0], refund: 0 };
    X.col = (eng.getManaColor && eng.getManaColor()) || color;
    c.cd.max = cdv; c.cd.current = cdv;
    if (eng.emitSkinFx) eng.emitSkinFx(X.P.x, X.P.y, 12);
    if (c.key !== 'auto') popup(X, def[0]);
    const parts = Array.isArray(def[2]) ? def[2] : [[def[2], def[3] || {}]];
    parts.forEach(([kind, p]) => { if (!B[kind]) { console.warn('[TravelSkills] bilinmeyen davranış:', kind); return; } const px = Object.assign({}, p); B[kind](X, px); });
    if (X.refund) c.cd.current = cdv * X.refund;
  }

  // ------------------------------------------------------------------ 37 SINIF x 3 SKILL
  // ['Ad', bekleme(sn), davranış, {parametreler}]
  const SK = {
    'Warrior': ['#ffb74d',
      ['Chain Hook', 6, 'hook', { range: 420, n: 2, dmg: 1.3, stun: 0.8, fx: 'lineSlash' }],
      ['Berserker Flurry', 9, 'flurry', { n: 6, gap: 85, adv: 22, range: 118, arc: 2.2, dmg: 0.9, stun: 0.4, fx: 'crescentSlash' }],
      ['Earthsplitter', 24, 'leap', { range: 310, radius: 155, dmg: 3.3, stun: 1, h: 95, fx: 'groundSlam' }]],
    'Archer': ['#aed581',
      ['Piercing Shot', 4, 'pierceArrow', { len: 780, radius: 22, dmg: 2.0, speed: 1020, slow: 0.45, slowDur: 1.8, stun: 0.3, crit: true }],
      ['Trap Roll', 9, [['trap', { at: 'self', radius: 85, arm: 350, life: 7000, dmg: 2.0, stun: 1.0, fx: 'arcaneCircle' }], ['dash', { back: true, dist: 210, invuln: 0.35, fx: 'lineSlash' }]]],
      ['Arrow Cyclone', 24, 'ring', { n: 12, waves: 4, gap: 140, twist: 0.26, dmg: 0.7, ptype: 'arrow', speed: 600 }]],
    'Mage': ['#7c4dff',
      ['Arcane Missiles', 4, 'fan', { n: 5, spread: 0.09, waves: 2, gap: 120, dmg: 0.72, ptype: 'magic_orb' }],
      ['Blink', 8, 'blink', { range: 250, invuln: 0.3, nova: { radius: 90, dmg: 1.3 }, fx: 'pulseNova' }],
      ['Meteor', 24, 'pillar', { at: 'cursor', radius: 170, dmg: 4.2, delay: 900, stun: 1, fx: 'meteorStrike', fxr: 150 }]],
    'Rogue': ['#ff4081',
      ['Twin Blades', 4, 'boomerang', { len: 330, width: 60, dmg: 1.3, back: 420, crit: true, fx: 'lineSlash' }],
      ['Smoke Decoy', 9, 'decoy', { back: 170, invuln: 0.5, delay: 900, radius: 120, dmg: 1.6, stun: 0.8, pull: 0.4, fx: 'shadowStep', blastfx: 'pulseNova' }],
      ['Venom Bloom', 22, 'zone', { at: 'self', radius: 135, dur: 4200, tick: 500, dmg: 0.45, slow: 1, fx: 'poisonCloud', fxr: 120 }]],
    'Paladin': ['#fff59d',
      ['Holy Smite', 5, 'pillar', { at: 'cursor', radius: 90, dmg: 1.9, delay: 380, fx: 'holyBeam', fxr: 55 }],
      ['Divine Aegis', 14, 'buff', { dur: 4, shield: 0.3, invuln: 0.5, fx: 'shieldDome' }],
      ['Judgement', 26, 'mark', { range: 300, delay: 1100, dmg: 5, splash: 2.2, radius: 130, stun: 1, fx: 'judgementSwords', fxr: 140, markfx: 'arcaneCircle' }]],
    'Assassin': ['#ff1744',
      ['Shadow Pierce', 6, 'pierce', { range: 275, dmg: 2.0, width: 58, invuln: 0.3 }],
      ['Umbral Chain', 10, 'chain', { n: 3, range: 520, dmg: 1.7, last: 1.5, hop: 440, step: 190 }],
      ['Death Blossom', 26, 'orbit', { radius: 150, dur: 1000, tick: 200, dmg: 0.6, invuln: true, fx: 'bladeStorm', fxr: 105, final: { radius: 180, dmg: 2.0, stun: 0.5 } }]],
    'Healer': ['#69f0ae',
      ['Mending Light', 7, 'heal', { pct: 0.22, fx: 'healPulse' }],
      ['Sanctuary', 14, 'zone', { at: 'self', radius: 135, dur: 3500, tick: 700, heal: 0.055, fx: 'arcaneCircle', fxr: 125 }],
      ['Rebirth Nova', 28, [['nova', { radius: 165, dmg: 2.2, kb: 320, fx: 'phoenixRise', fxr: 70 }], ['heal', { pct: 0.5, fx: null }]]]],
    'Tank': ['#64b5f6',
      ['Shield Bash', 5, 'cone', { range: 100, arc: 2.0, dmg: 1.5, stun: 0.9, kb: 340, fx: 'crescentSlash' }],
      ['Fortify', 15, 'buff', { dur: 5, shield: 0.4, speed: 0.88, fx: 'shieldDome', fxr: 52 }],
      ['Taunting Roar', 26, 'vortex', { at: 'self', radius: 270, dur: 1500, tick: 250, pull: 0.18, dmg: 0.2, final: { radius: 130, dmg: 2.6, stun: 1.4 }, fx: 'roarWave', fxr: 200 }]],
    'Tamer': ['#ffb300',
      ['Primal Fangs', 4, 'fan', { n: 3, spread: 0.12, waves: 2, dmg: 0.95, ptype: 'primal_fang' }],
      ['Wild Call', 14, 'buff', { dur: 4, speed: 1.25, haste: 0.7, pet: true, fx: 'speedAura', fxf: true }],
      ['Spirit Pack', 26, 'familiar', { dur: 5000, tick: 450, range: 380, dmg: 0.8, n: 2, fx: 'spiritWolves', fxr: 85, hitfx: 'slashX' }]],
    'Beastmaster': ['#ff9800',
      ['Rending Bite', 5, 'rend', { range: 130, arc: 1.4, dmg: 1.3, bleed: 0.3, ticks: 4, tick: 400, fx: 'bloodScythe', fxr: 80 }],
      ['Predator Pounce', 9, 'pounce', { range: 420, radius: 90, dmg: 1.9, stun: 0.6, fx: 'pulseNova' }],
      ['Stampede', 24, 'quake', { n: 6, step: 80, gap: 80, lanes: 3, lanegap: 105, radius: 62, dmg: 0.6, stun: 0.4, kb: 260, fx: 'pulseNova', fxr: 60 }]],
    'Alpha Tamer': ['#ffab00',
      ['Alpha Howl', 6, 'nova', { radius: 145, dmg: 0.9, slow: 2.2, kb: 200, fx: 'roarWave', fxr: 130 }],
      ['Pack Rush', 9, 'dash', { dist: 260, dmg: 1.5, width: 80, stun: 0.4, invuln: 0.2, fx: 'spiritWolves', fxr: 70 }],
      ['Alpha Frenzy', 26, [['buff', { dur: 7, speed: 1.3, haste: 0.6, leech: 0.15, pet: true, fx: 'speedAura', fxf: true }], ['nova', { radius: 130, dmg: 1.4, fx: 'roarWave', fxr: 120 }]]]],
    'Gardener': ['#c6ff00',
      ['Thorn Sprout', 7, 'turret', { at: 'cursor', dur: 4500, tick: 450, range: 340, dmg: 0.7, fx: 'vineGrasp', fxr: 55, shotfx: 'lineSlash' }],
      ['Bramble Hedge', 11, 'wall', { dist: 150, len: 360, n: 6, dur: 3200, tick: 500, radius: 56, dmg: 0.35, slow: 2, fx: 'vineGrasp', fxr: 50 }],
      ['Overgrowth', 25, 'pillar', { at: 'cursor', count: 5, spread: 105, radius: 80, dmg: 1.5, delay: 500, gap: 180, stun: 0.8, fx: 'vineGrasp', fxr: 85 }]],
    'Rootbinder': ['#76ff03',
      ['Root Surge', 5, 'quake', { n: 5, step: 70, gap: 75, lanes: 1, radius: 56, dmg: 0.9, stun: 0.5, slow: 1.5, kb: 80, fx: 'vineGrasp', fxr: 55 }],
      ['Entangle', 11, 'zone', { at: 'cursor', radius: 120, dur: 2600, tick: 400, dmg: 0.3, stun: 0.5, fx: 'vineGrasp', fxr: 90 }],
      ['Binding Grasp', 26, 'tether', { n: 5, range: 420, dur: 3600, tick: 450, dmg: 0.6, slow: 2, drag: 0.12, fx: 'lineSlash' }]],
    'Lifeweaver': ['#b9f6ca',
      ['Life Bloom', 6, 'siphon', { radius: 115, dmg: 1.2, per: 0.03, cap: 6, fx: 'healPulse', fxr: 100 }],
      ['Petal Dash', 9, 'trail', { dist: 230, dmg: 0.4, radius: 60, ticks: 4, tick: 500, heal: 0.012, pfx: 'healPulse', pr: 55 }],
      ['Tree of Life', 26, 'zone', { at: 'self', radius: 155, dur: 4600, tick: 750, heal: 0.09, dmg: 0.4, fx: 'treeOfLife', fxr: 90 }]],
    'Moderator': ['#00e5ff',
      ['Gavel Strike', 5, 'slam', { at: 'cursor', radius: 85, dmg: 1.9, delay: 280, stun: 0.6, fx: 'groundSlam' }],
      ['Mute', 11, 'nova', { radius: 135, dmg: 0.8, stun: 1.1, fx: 'arcaneCircle', fxr: 120 }],
      ['Ban Hammer', 26, 'slam', { at: 'cursor', radius: 115, dmg: 4, delay: 750, stun: 1.6, fx: 'titanFist', fxr: 85 }]],
    'Ultra Moderator': ['#ffd740',
      ['System Purge', 5, 'nova', { radius: 155, dmg: 1.8, kb: 360, fx: 'pulseNova', fxr: 150 }],
      ['Admin Teleport', 9, 'blink', { range: 320, invuln: 0.5, nova: { radius: 95, dmg: 1.2 }, fx: 'shadowStep' }],
      ['Server Reset', 30, 'slam', { at: 'self', radius: 265, dmg: 4, delay: 1000, stun: 1.6, fx: 'dimensionRift', fxr: 130 }]],
    'Tester': ['#76ff03',
      ['Null Pointer', 5, 'seek', { n: 3, range: 440, dmg: 1.3, gap: 80, fx: 'lineSlash', hitfx: 'glitchBurst', fxr: 50 }],
      ['Hot Swap', 9, 'swap', { range: 480, dmg: 1.2, stun: 0.7, nova: { radius: 90, dmg: 0.8 } }],
      ['Fork Bomb', 24, 'decoy', { count: 4, spread: 130, delay: 900, gap: 220, radius: 100, dmg: 1.5, stun: 0.4, fx: 'glitchBurst', blastfx: 'glitchBurst' }]],
    'War Lord': ['#ff5722',
      ['Axe Cyclone', 5, 'nova', { radius: 115, dmg: 1.7, kb: 320, fx: 'spinSlash', fxf: true, fxr: 90 }],
      ['Warcry Charge', 9, 'ram', { dist: 270, dur: 260, dmg: 1.2, width: 84, radius: 110, end: 1.4, stun: 0.6, invuln: 0.3 }],
      ['Warlord Banner', 26, [['buff', { dur: 8, crit: 0.35, haste: 0.75, speed: 1.2, fx: 'speedAura', fxf: true }], ['nova', { radius: 150, dmg: 1.6, kb: 300, fx: 'firePillar', fxr: 90 }]]]],
    'Warden': ['#9ccc65',
      ['Seeking Thorns', 4, 'seek', { n: 4, range: 480, dmg: 0.9, gap: 60, slow: 1.5, fx: 'lineSlash' }],
      ['Forest Step', 8, [['dash', { back: true, dist: 220, invuln: 0.3 }], ['buff', { dur: 2.5, speed: 1.25, fx: 'speedAura', fxf: true }]]],
      ['Briar Field', 24, 'trap', { at: 'cursor', count: 5, spread: 115, radius: 75, arm: 500, life: 9000, dmg: 1.6, stun: 0.8, fx: 'vineGrasp' }]],
    'Archmage': ['#b388ff',
      ['Arcane Ray', 6, 'beam', { len: 420, width: 56, dmg: 0.35, ticks: 7, dur: 900, fx: 'beamLine', head: true }],
      ['Chronoshift', 12, 'rewind', { dur: 2500, invuln: 0.4, dmg: 1.2, radius: 110 }],
      ['Starfall', 26, 'rain', { radius: 195, n: 12, dur: 2100, dmg: 0.36, hit: 72, fx: 'pulseNova', fxr: 70, fxd: 0.55, zonefx: 'starfall', fall: 380 }]],
    'Nightblade': ['#40c4ff',
      ['Moon Slash', 5, 'cone', { range: 135, arc: 1.6, dmg: 0.9, ticks: 2, dur: 150, fx: 'crescentSlash' }],
      ['Lunar Blink', 8, 'blink', { range: 300, invuln: 0.35, nova: { radius: 100, dmg: 1.6 }, fx: 'shadowStep' }],
      ['Eclipse', 26, 'zone', { at: 'cursor', radius: 205, dur: 3600, tick: 350, dmg: 0.55, slow: 2, pull: 0.07, fx: 'gravityWell', fxr: 140 }]],
    'Crusader': ['#ffe082',
      ['Hammer Throw', 5, 'boomerang', { len: 300, width: 70, dmg: 1.4, back: 450, fx: 'lineSlash' }],
      ['Shield Charge', 9, 'dash', { dist: 230, dmg: 1.5, width: 78, stun: 0.7, invuln: 0.25 }],
      ['Consecration', 26, 'zone', { at: 'self', radius: 170, dur: 4200, tick: 500, dmg: 0.5, heal: 0.04, slow: 1.5, fx: 'holyBeam', fxr: 100 }]],
    'Reaper': ['#69f0ae',
      ['Soul Scythe', 5, 'cone', { range: 150, arc: 2.4, dmg: 1.6, leech: 0.12, fx: 'crescentSlash' }],
      ['Death Mark', 10, 'mark', { range: 420, delay: 1500, dmg: 3.0, exec: [0.4, 2], splash: 1, radius: 100, fx: 'soulHarvest', fxr: 110, markfx: 'boneCage' }],
      ['Reap', 27, 'siphon', { radius: 210, dmg: 2.4, per: 0.04, cap: 8, fx: 'soulHarvest', fxr: 160, delay: 300 }]],
    'High Priest': ['#ffe57f',
      ['Chain Prayer', 5, 'arc', { n: 4, range: 400, hop: 240, dmg: 1.1, decay: 0.12, heal: 0.02, fx: 'lineSlash', hitfx: 'holyBeam', fxr: 40 }],
      ['Blessing', 14, 'buff', { dur: 6, crit: 0.3, haste: 0.8, shield: 0.2, fx: 'shieldDome' }],
      ["Heaven's Gate", 27, 'pillar', { at: 'self', count: 6, spread: 150, radius: 85, dmg: 1.6, delay: 600, gap: 140, fx: 'holyBeam', fxr: 70 }]],
    'Juggernaut': ['#ff7043',
      ['Ground Pound', 6, 'slam', { at: 'self', radius: 115, dmg: 1.7, delay: 260, stun: 0.7, fx: 'groundSlam' }],
      ['Unstoppable', 10, 'ram', { dist: 300, dur: 300, dmg: 1.3, width: 96, radius: 120, end: 1.8, stun: 0.8, invuln: 0.4 }],
      ['Fault Line', 26, 'quake', { n: 8, step: 90, gap: 70, lanes: 1, radius: 80, dmg: 1.3, stun: 0.8, kb: 340, fx: 'groundSlam', fxr: 80 }]],
    'War Emperor': ['#ffab00',
      ["Executioner's Cut", 5, 'cone', { range: 140, arc: 1.8, dmg: 1.8, exec: [0.35, 2.2], kb: 300, fx: 'crescentSlash' }],
      ['Chain Whip', 9, 'hook', { range: 480, n: 3, dmg: 1.2, stun: 0.8, fx: 'lineSlash' }],
      ['Dragonfire Decree', 27, 'beam', { len: 420, width: 120, dmg: 0.45, ticks: 8, dur: 1400, fx: 'dragonBreath', head: false }]],
    'Storm Warden': ['#40c4ff',
      ['Chain Lightning', 5, 'arc', { n: 5, range: 420, hop: 250, dmg: 1.2, decay: 0.1, fx: 'lineSlash', hitfx: 'thunderStrike', fxr: 50 }],
      ['Static Rush', 9, 'trail', { dist: 260, dmg: 0.3, radius: 55, ticks: 3, tick: 350, pfx: 'thunderStrike', pr: 50 }],
      ['Tempest', 26, 'rain', { radius: 200, n: 14, dur: 2000, dmg: 0.45, hit: 70, fx: 'thunderStrike', fxr: 80, fall: 300, stun: 0.4 }]],
    'Archon': ['#40c4ff',
      ['Halo Blades', 6, 'orbit', { radius: 110, dur: 2600, tick: 300, dmg: 0.5, fx: 'bladeStorm', fxr: 80 }],
      ['Judicator Chains', 11, 'tether', { n: 3, range: 420, dur: 1800, tick: 300, dmg: 0.4, stun: 0.6, fx: 'lineSlash' }],
      ['Wrath of Heaven', 27, 'seek', { n: 8, range: 520, dmg: 1.6, gap: 90, stun: 0.6, fx: 'lineSlash', hitfx: 'holyBeam', fxr: 70 }]],
    'Shade King': ['#aa00ff',
      ['Shadow Spiral', 5, 'ring', { n: 8, waves: 3, gap: 120, twist: 0.4, dmg: 0.7, ptype: 'magic_orb', speed: 560, fx: 'shadowTendrils' }],
      ['Shadow Swap', 9, 'swap', { range: 480, dmg: 1.5, stun: 0.9, nova: { radius: 100, dmg: 1.0 } }],
      ['Eternal Night', 28, 'freeze', { radius: 340, stun: 3, dmg: 0.4, ticks: 6, tick: 500, final: { radius: 340, dmg: 2.0 }, fx: 'dimensionRift', fxr: 200 }]],
    'Lightbringer': ['#ffee58',
      ['Light Orb', 7, 'turret', { at: 'cursor', dur: 4500, tick: 400, range: 360, dmg: 0.7, shots: 2, fx: 'phoenixRise', fxr: 55, shotfx: 'lineSlash' }],
      ['Blinding Flash', 10, 'nova', { radius: 175, dmg: 0.8, stun: 1.5, kb: 120, fx: 'pulseNova', fxr: 175 }],
      ['Solar Wall', 26, 'wall', { dist: 190, len: 440, n: 7, dur: 3600, tick: 400, radius: 62, dmg: 0.55, stun: 0.3, fx: 'holyBeam', fxr: 60 }]],
    'Death Lord': ['#76ff03',
      ['Soul Bolts', 5, 'arc', { n: 3, range: 380, hop: 230, dmg: 1.3, decay: 0.1, heal: 0.015, fx: 'lineSlash', hitfx: 'soulHarvest', fxr: 50 }],
      ['Soul Chain', 11, 'tether', { n: 3, range: 440, dur: 2600, tick: 400, dmg: 0.5, slow: 2, leech: 0.2, fx: 'lineSlash' }],
      ['Dead March', 28, 'familiar', { dur: 5500, tick: 400, range: 420, dmg: 0.9, n: 3, fx: 'soulHarvest', fxr: 120, hitfx: 'soulHarvest' }]],
    'Bloodspawn': ['#ff1744',
      ['Blood Darts', 4, 'fan', { n: 5, spread: 0.1, waves: 2, gap: 100, dmg: 0.7, ptype: 'dagger' }],
      ['Blood Price', 12, 'sacrifice', { cost: 0.15, dmg: 1.2, scale: 10, radius: 170, delay: 450, leech: 0.15, fx: 'bloodRitual', fxr: 150 }],
      ['Hemorrhage Link', 27, 'tether', { n: 4, range: 420, dur: 3600, tick: 450, dmg: 0.7, leech: 0.25, slow: 1.5, fx: 'lineSlash' }]],
    'Bloodlord': ['#d50000',
      ['Scythe Throw', 5, 'boomerang', { len: 340, width: 84, dmg: 1.3, back: 420, leech: 0.1, fx: 'bloodScythe' }],
      ['Crimson Trail', 9, 'trail', { dist: 250, dmg: 0.3, radius: 62, ticks: 4, tick: 450, leech: 0.1, pfx: 'bloodRitual', pr: 60 }],
      ['Blood Ritual', 28, 'zone', { at: 'cursor', radius: 190, dur: 4100, tick: 500, dmg: 0.65, leech: 0.2, fx: 'bloodRitual', fxr: 150 }]],
    'Gloomspawn': ['#ffea00',
      ['Gloom Tendrils', 5, 'rend', { range: 155, arc: 1.5, dmg: 1.0, bleed: 0.25, ticks: 4, tick: 450, slow: 2.2, fx: 'coneBlast' }],
      ['Mist Form', 12, 'buff', { dur: 1.3, invuln: 1.3, speed: 1.5, fx: 'speedAura', fxf: true }],
      ['Gloom Collapse', 26, 'vortex', { at: 'self', radius: 230, dur: 2000, tick: 300, pull: 0.14, dmg: 0.4, slow: 2, final: { radius: 150, dmg: 2.5, stun: 0.8 }, fx: 'poisonCloud', fxr: 170 }]],
    'Sanguine Lord': ['#ff1744',
      ['Rapier Lunge', 5, 'dash', { dist: 240, dmg: 1.9, width: 56, leech: 0.1, invuln: 0.2, fx: 'lineSlash' }],
      ['Bat Swarm', 9, 'decoy', { back: 190, invuln: 0.5, delay: 600, radius: 110, dmg: 1.4, stun: 0.5, fx: 'batSwarm', fxr: 70, blastfx: 'batSwarm' }],
      ['Crimson Feast', 27, 'siphon', { radius: 195, dmg: 2.6, per: 0.05, cap: 8, leech: 0.2, fx: 'bloodRitual', fxr: 135, delay: 300 }]],
    'Divine Saint': ['#fff59d',
      ['Holy Light', 6, 'seek', { n: 3, range: 440, dmg: 1.3, gap: 80, heal: 0.03, fx: 'lineSlash', hitfx: 'holyBeam', fxr: 55 }],
      ['Angelic Ascent', 16, 'buff', { dur: 3, invuln: 3, speed: 1.3, endHeal: 0.35, fx: 'phoenixRise', fxr: 55 }],
      ["Heaven's Grace", 30, [['heal', { pct: 0.55, fx: 'healPulse' }], ['slam', { at: 'self', radius: 225, dmg: 3, delay: 550, fx: 'holyBeam', fxr: 120 }]]]],
    'Colossus': ['#00e5ff',
      ['Rockfall', 6, 'pillar', { at: 'cursor', count: 3, spread: 75, radius: 80, dmg: 1.3, delay: 420, gap: 140, stun: 0.6, fx: 'titanFist', fxr: 70 }],
      ['Stone Totem', 12, 'turret', { at: 'self', dur: 5000, tick: 600, range: 260, dmg: 0.9, shots: 3, fx: 'titanFist', fxr: 60, shotfx: null, hitfx: 'groundSlam', hitr: 70 }],
      ["Titan's Rage", 28, [['buff', { dur: 6, shield: 0.45, fx: 'shieldDome', fxr: 62 }], ['slam', { at: 'self', radius: 235, dmg: 3.4, stun: 1.5, waves: [{ delay: 0, radius: 130, dmg: 1.2 }, { delay: 420, radius: 235, dmg: 2.2 }], fx: 'titanFist', fxr: 110 }]]]]

  };

  const KEYS = ['q', 'e', 'r'], registry = {};
  // Sınıf etiketi -> oyun sınıf slug'ı (data/classes.json: label -> slug).
  // Böylece motor `playerData.class` (slug) ile yetenek setini bulabilir.
  const SLUG = {
    'Warrior': 'warrior', 'Archer': 'ranger', 'Mage': 'mage', 'Rogue': 'rogue', 'Paladin': 'paladin',
    'Assassin': 'assassin', 'Healer': 'support', 'Tank': 'tank', 'Tamer': 'tamer', 'Beastmaster': 'beastmaster',
    'Alpha Tamer': 'anima_lorde', 'Gardener': 'gardener', 'Rootbinder': 'rootbinder', 'Lifeweaver': 'lifeweaver',
    'Moderator': 'moderator', 'Ultra Moderator': 'ultra_moderator', 'Tester': 'tester', 'War Lord': 'warlord',
    'Warden': 'warden', 'Archmage': 'archmage', 'Nightblade': 'nightblade', 'Crusader': 'crusader', 'Reaper': 'reaper',
    'High Priest': 'high_priest', 'Juggernaut': 'juggernaut', 'War Emperor': 'war_emperor', 'Storm Warden': 'storm_warden',
    'Archon': 'archon', 'Shade King': 'shade_king', 'Lightbringer': 'lightbringer', 'Death Lord': 'death_lord',
    'Bloodspawn': 'bloodspawn', 'Bloodlord': 'bloodlord', 'Gloomspawn': 'gloomspawn', 'Sanguine Lord': 'sanguine_lord',
    'Divine Saint': 'divine_saint', 'Colossus': 'colossus'
  };
  const slugOf = (label) => SLUG[label] || String(label).toLowerCase().replace(/[^a-z0-9]+/g, '_');
  function register(name) {
    const rows = SK[name];
    if (!rows || rows.length < 4) return;
    const color = rows[0], h = {}, slug = slugOf(name);
    KEYS.forEach((k, i) => { h[k] = (eng, c) => run(eng, c, rows[i + 1], color); });
    registry[slug] = rows; registry[name] = rows;
    TE.registerClassSkills(slug, h);
    TE.registerClassSkills(name, h);
  }
  Object.keys(SK).forEach(register);

  global.TravelSkills = {
    classes: SK, bySlug: registry, behaviors: B, slugOf, fromRow, runSkill,
    // GameCraft'taki "Behavior" açılır listesi için tüm davranış adları.
    kinds() { return Object.keys(B).sort(); },
    // TravelSkills.set('Warrior','q',['Ad', 5, 'nova', {...}])  -> skill'i değiştir/ekle
    set(cls, key, def) {
      const name = SK[cls] ? cls : (Object.keys(SK).find((n) => slugOf(n) === cls) || cls);
      if (!SK[name]) SK[name] = ['#b388ff', null, null, null];
      SK[name][KEYS.indexOf(key) + 1] = def; register(name);
    },
    // Yeni davranış tanımla: TravelSkills.behavior('mine', (X, p) => {...})  X: {eng,P,stats,atk,aim,col}
    behavior(name, fn) { B[name] = fn; },
    list(cls) {
      const name = SK[cls] ? cls : Object.keys(SK).find((n) => slugOf(n) === cls);
      return ((name && SK[name]) || []).slice(1).map((d) => d && d[0]);
    },
    helpers: { hurt, hitRadius, hitLine, hitCone, heal, fx, later, teleport, invulnerable, ghostLine, shieldSet }
  };
})(typeof window !== 'undefined' ? window : this);
