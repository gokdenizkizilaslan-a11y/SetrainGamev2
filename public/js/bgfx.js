// Ambient background FX.
// Menu / setup / lobby: drifting daylight, sweeping god-rays, floating motes,
// and light that brightens and dims. Town: only tiny corner sparkles remain.
(function () {
  const canvas = document.getElementById("bg-fx");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W = 0;
  let H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const rnd = (a, b) => a + Math.random() * (b - a);

  const motes = [];
  const MOTE_COUNT = 26;
  for (let i = 0; i < MOTE_COUNT; i++) {
    motes.push({ x: Math.random(), y: Math.random(), r: rnd(0.8, 2.4), vy: rnd(4, 14), vx: rnd(-5, 5), a: rnd(0.15, 0.6), ph: rnd(0, Math.PI * 2) });
  }

  const cornerDefs = [
    { fx: 0.035, fy: 0.06, r: 90 },
    { fx: 0.965, fy: 0.06, r: 90 },
    { fx: 0.035, fy: 0.94, r: 90 },
    { fx: 0.965, fy: 0.94, r: 90 },
  ];
  const sparks = [];
  for (let i = 0; i < 16; i++) {
    const c = cornerDefs[i % cornerDefs.length];
    sparks.push({ corner: c, ox: rnd(0, Math.PI * 2), oy: rnd(0, Math.PI * 2), r: rnd(0.7, 1.9), sp: rnd(0.4, 1.1), a: rnd(0.15, 0.55), ph: rnd(0, Math.PI * 2) });
  }

  const blobs = [];
  for (let i = 0; i < 3; i++) {
    blobs.push({ fx: rnd(0.15, 0.85), fy: rnd(0.15, 0.85), rad: rnd(180, 340), ph: rnd(0, Math.PI * 2), sp: rnd(0.3, 0.7), alpha: rnd(0.16, 0.3) });
  }
  const shafts = [
    { y: 0.3, w: 130, st: 1.0, ph: 0 },
    { y: 0.72, w: 210, st: 0.6, ph: 2.1 },
  ];

  let t = 0;

  function inTown() {
    return document.body.dataset.screen === "screen-town";
  }

  function drawMotes(dt) {
    for (const m of motes) {
      m.y -= (m.vy * dt) / H;
      m.x += (m.vx * dt) / W;
      m.ph += dt;
      if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      if (m.x < -0.02) m.x = 1.02;
      if (m.x > 1.02) m.x = -0.02;
      const a = m.a * (0.55 + 0.45 * Math.sin(m.ph * 1.4));
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = "#ffe9c0";
      ctx.beginPath();
      ctx.arc(m.x * W, m.y * H, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSparks(dt) {
    for (const s of sparks) {
      const cx = s.corner.fx * W;
      const cy = s.corner.fy * H;
      const x = cx + Math.sin(s.ox + t * s.sp * 0.5) * s.corner.r;
      const y = cy + Math.cos(s.oy + t * s.sp * 0.45) * s.corner.r;
      const tw = 0.5 + 0.5 * Math.sin(s.ph * 1.6 + t * 2);
      ctx.globalAlpha = Math.max(0, s.a * tw);
      ctx.fillStyle = "#ffdf9e";
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawDaylight() {
    ctx.globalCompositeOperation = "lighter";

    const sun = 0.5 + 0.5 * Math.sin(t * 0.5);
    const g = ctx.createRadialGradient(W * 0.5, H * 0.06, 40, W * 0.5, H * 0.06, W * 0.55);
    g.addColorStop(0, "rgba(255,214,140," + (0.1 + 0.1 * sun).toFixed(3) + ")");
    g.addColorStop(0.45, "rgba(255,180,90,0.04)");
    g.addColorStop(1, "rgba(255,180,90,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (const b of blobs) {
      const cx = (b.fx + Math.sin(t * b.sp * 0.4 + b.ph) * 0.05) * W;
      const cy = (b.fy + Math.cos(t * b.sp * 0.3 + b.ph) * 0.05) * H;
      const pulse = 0.55 + 0.45 * Math.sin(t * b.sp + b.ph);
      const rg = ctx.createRadialGradient(cx, cy, 10, cx, cy, b.rad);
      rg.addColorStop(0, "rgba(255,214,140," + (b.alpha * pulse).toFixed(3) + ")");
      rg.addColorStop(1, "rgba(255,214,140,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    for (const s of shafts) {
      const w = s.w;
      const cx = (((t * s.st) % (W + w * 3)) - w * 1.5);
      ctx.save();
      ctx.translate(cx, H * s.y);
      ctx.rotate(0.55);
      const lg = ctx.createLinearGradient(0, -w, 0, w);
      lg.addColorStop(0, "rgba(255,214,140,0)");
      lg.addColorStop(0.5, "rgba(255,214,140,0.16)");
      lg.addColorStop(1, "rgba(255,214,140,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(-w * 0.4, -w, w * 0.8, w * 2);
      ctx.fillStyle = "rgba(255,240,210,0.08)";
      ctx.fillRect(-w * 0.9, -w * 0.5, w * 0.35, w);
      ctx.restore();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function frame(ts) {
    const prev = frame._last || ts;
    frame._last = ts;
    const dt = Math.min(0.05, (ts - prev) / 1000);
    t = ts / 1000;

    ctx.clearRect(0, 0, W, H);

    if (inTown()) {
      drawSparks(dt);
    } else {
      drawDaylight();
      drawMotes(dt);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();