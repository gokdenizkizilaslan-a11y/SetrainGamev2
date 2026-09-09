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

  // Ana menu partikulleri: iki katman — her yere dagilan ince toz + isik
  // huzmelerinin icinde suruklenen iri, yumusak tozlar. Dengeli tutuldu:
  // sayi artti ama alfa dusuk, yazi okunabilirligi bozulmaz.
  const motes = [];
  const MOTE_COUNT = 70;
  for (let i = 0; i < MOTE_COUNT; i++) {
    motes.push({ x: Math.random(), y: Math.random(), r: rnd(0.7, 2.2), vy: rnd(3, 12), vx: rnd(-5, 5), a: rnd(0.1, 0.45), ph: rnd(0, Math.PI * 2) });
  }
  // Huzme tozu: gunes yonunden (sol ust) saga asagiya yavasca kayar
  const beamDust = [];
  for (let i = 0; i < 22; i++) {
    beamDust.push({ x: Math.random(), y: Math.random(), r: rnd(1.6, 3.6), sp: rnd(6, 18), a: rnd(0.08, 0.3), ph: rnd(0, Math.PI * 2) });
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
  for (let i = 0; i < 4; i++) {
    // ilk leke gunesin etrafinda (sol ust), digerleri daginik sicaklik icin
    const nearSun = i === 0;
    blobs.push({
      fx: nearSun ? rnd(0.3, 0.45) : rnd(0.15, 0.85),
      fy: nearSun ? rnd(0.02, 0.12) : rnd(0.15, 0.85),
      rad: nearSun ? rnd(280, 420) : rnd(180, 320),
      ph: rnd(0, Math.PI * 2), sp: rnd(0.25, 0.6),
      alpha: nearSun ? rnd(0.22, 0.34) : rnd(0.12, 0.24),
    });
  }
  // Gunes sol ustten vurdugu icin huzmeler yukari-soldan asagi-saga akar
  const shafts = [
    { y: 0.22, w: 150, st: 1.1, ph: 0 },
    { y: 0.5, w: 230, st: 0.7, ph: 2.1 },
    { y: 0.78, w: 110, st: 0.9, ph: 4.0 },
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
    // Huzme tozu: isik yonunde (sol ust -> sag alt) suruklenir, yumusak parlar
    for (const d of beamDust) {
      d.x += ((d.sp * 0.8) * dt) / W;
      d.y += ((d.sp * 0.45) * dt) / H;
      d.ph += dt * 0.8;
      if (d.x > 1.03) { d.x = -0.03; d.y = Math.random(); }
      if (d.y > 1.03) { d.y = -0.03; }
      const tw = 0.5 + 0.5 * Math.sin(d.ph * 1.8);
      ctx.globalAlpha = Math.max(0, d.a * (0.4 + 0.6 * tw));
      ctx.fillStyle = "#ffdf9e";
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fill();
      // hale: iki kat buyuk, cok silik daire
      ctx.globalAlpha = Math.max(0, d.a * 0.25 * tw);
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r * 2.4, 0, Math.PI * 2);
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

    // GUNES: orta-sol ustten (x ~0.38, ekranin ust kenari). Yavas nefes alir,
    // goz yormamasi icin tepe parlaklik dengeli tutuldu.
    const sun = 0.5 + 0.5 * Math.sin(t * 0.45);
    const SX = W * 0.38;
    const SY = H * -0.02;
    const sunR = Math.max(W, H) * 0.55;
    const g = ctx.createRadialGradient(SX, SY, 30, SX, SY, sunR);
    g.addColorStop(0, "rgba(255,226,160," + (0.22 + 0.1 * sun).toFixed(3) + ")");
    g.addColorStop(0.25, "rgba(255,200,120," + (0.1 + 0.05 * sun).toFixed(3) + ")");
    g.addColorStop(0.55, "rgba(255,180,90,0.035)");
    g.addColorStop(1, "rgba(255,180,90,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // gunes cekirdegi: kucuk, parlak disk + hale (ust kenarda yarim gorunur)
    const corePulse = 0.75 + 0.25 * Math.sin(t * 0.9);
    const core = ctx.createRadialGradient(SX, SY, 2, SX, SY, 90 * corePulse);
    core.addColorStop(0, "rgba(255,246,220,0.5)");
    core.addColorStop(0.4, "rgba(255,220,150,0.18)");
    core.addColorStop(1, "rgba(255,220,150,0)");
    ctx.fillStyle = core;
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

    // Isik huzmeleri: sol ustten saga asagiya (aci ~0.5 rad). Soldan dogup
    // saga suprulurler; genislik ve parlaklik dengeli, yazi okunur kalir.
    for (const s of shafts) {
      const w = s.w;
      const span = W + w * 4;
      const cx = ((((t * 28 * s.st + s.ph * 200) % span) + span) % span) - w * 2;
      ctx.save();
      ctx.translate(cx, H * s.y - H * 0.12);
      ctx.rotate(0.5);
      const lg = ctx.createLinearGradient(0, -w, 0, w);
      lg.addColorStop(0, "rgba(255,214,140,0)");
      lg.addColorStop(0.5, "rgba(255,214,140,0.13)");
      lg.addColorStop(1, "rgba(255,214,140,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(-w * 0.4, -H * 0.7, w * 0.8, H * 1.4);
      ctx.fillStyle = "rgba(255,240,210,0.06)";
      ctx.fillRect(-w * 0.9, -H * 0.4, w * 0.35, H * 0.8);
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

/* ============================================================
   ARKAPLAN FOTOGRAFI YUKLEYICI (jpg/png otomatik bulma)
   ------------------------------------------------------------
   Tek resim HER YERDE gorunsun istiyorsan:
     1) public/images/backgrounds/bg.png  (veya bg.jpg) at  -> TUM
        ekranlarda gozukur (town, lobby, dungeon dahil).
     2) Ya da sadece menu.png at; o da olmadigi ekranlarda
        HER YERDE fallback olarak kullanilir.
   Ekrana ozel resim tercih edersen (ustune biner):
     town.png    -> town ekrani
     dungeon.png -> dungeon/savas overlay'i acikken
     tavern.png  -> taverna overlay'i acikken
     setup.png   -> karakter yaratma
     lobby.png   -> lobi
     menu.png    -> ana menu
   UZANTI SERBEST: .png yoksa .jpg, .jpeg, .webp sirasiyla denenir.
   Hicbir resim yoksa: katman gizli kalir, eski degrade gorunum surer.
   ============================================================ */
(function () {
  const SCREEN_TO_PHOTO = {
    "screen-mode": "menu",
    "screen-setup": "setup",
    "screen-lobby": "lobby",
    "screen-town": "town",
  };
  // Once ekrana ozel, sonra global bg, en sonda menu (eski davranis):
  const GLOBAL_BASES = ["/images/backgrounds/bg", "/images/backgrounds/menu"];
  const EXTS = ["png", "jpg", "jpeg", "webp"];
  const cache = {}; // base -> url | null (yok)

  function el() { return document.getElementById("bg-photo"); }

  function probe(base, i, done) {
    if (i >= EXTS.length) { done(null); return; }
    const url = base + "." + EXTS[i];
    const img = new Image();
    img.onload = () => done(url);
    img.onerror = () => probe(base, i + 1, done);
    img.src = url;
  }

  // Oncelik sirasini dener: ekran resmi -> bg.png (global) -> menu.png
  function probeChain(chain, i, done) {
    if (i >= chain.length) { done(null); return; }
    const base = chain[i];
    if (cache[base] !== undefined) {
      if (cache[base]) done(cache[base]);
      else probeChain(chain, i + 1, done);
      return;
    }
    probe(base, 0, (url) => {
      cache[base] = url;
      if (url) done(url);
      else probeChain(chain, i + 1, done);
    });
  }

  function applyPhoto() {
    const box = el();
    if (!box) return;
    // savas/taverna overlay'i aciksa onun resmini tercih et
    let key = SCREEN_TO_PHOTO[document.body.dataset.screen] || "menu";
    if (document.body.dataset.screen === "screen-town") {
      if (!document.getElementById("dungeon-view")?.classList.contains("hidden")) key = "dungeon";
      else if (!document.getElementById("tavern-view")?.classList.contains("hidden")) key = "tavern";
    }
    const base = "/images/backgrounds/" + key;
    // mükerrer girislerde atla (ayni ekran + ayni hiyerarsi)
    const chain = Array.from(new Set([base, ...GLOBAL_BASES]));
    const chainId = chain.join(",");
    if (box.dataset.chain === chainId) return;
    box.dataset.chain = chainId;
    probeChain(chain, 0, (url) => {
      // kullanici bu arada baska ekrana gectiyse eski sonucu uygulama
      if (box.dataset.chain !== chainId) return;
      setPhoto(box, url);
    });
  }

  function setPhoto(box, url) {
    if (url) {
      // ayni resim zaten yukluyse goz kirpmasin
      if (box.dataset.url !== url) {
        box.style.backgroundImage = "url('" + url + "')";
        box.dataset.url = url;
      }
      box.classList.add("has-photo");
    } else {
      box.classList.remove("has-photo");
    }
  }

  // ekran degisince (showScreen body.dataset.screen yazar) otomatik guncelle
  new MutationObserver(applyPhoto).observe(document.body, { attributes: true, attributeFilter: ["data-screen"] });
  // overlay acilip kapaninca (dungeon/tavern resmi icin) yakala
  new MutationObserver(applyPhoto).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["class"] });
  window.addEventListener("load", applyPhoto);
  if (document.readyState !== "loading") applyPhoto();
  else document.addEventListener("DOMContentLoaded", applyPhoto);
})();