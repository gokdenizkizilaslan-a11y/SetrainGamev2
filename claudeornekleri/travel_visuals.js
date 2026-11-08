/**
 * ============================================================================
 *  TRAVEL VISUALS  —  SADECE GÖRSEL EKLENTİ  (travel.js'den SONRA yükle)
 * ============================================================================
 *  <script src="travel.js"></script>
 *  <script src="travel_visuals.js"></script>
 *
 *  Mekaniğe dokunmaz. İçindekiler:
 *   1) 5 BÖLGE (land) görünümü: zoneName'e göre otomatik seçilir
 *        "Verdant Wilds" · "Ashen Wastes" · "Frozen Tundra" · "Mirefen Marsh" · "Cursed Reach"
 *      zemin rengi + zemin detayları + çevre objeleri + hava efektleri (kar, kül, sis, lanet ruhları)
 *   2) Yeni canavar çizimleri: Aslan (4 bölge versiyonu), Blood Seer, Bone Warden,
 *      Frost Wolf, Bog Toad, Magma Golem   -> TravelVisuals.mobs
 *   3) Örnek efekt kütüphanesi (kılıç dönerek vurma, yer darbesi, buz nova...) -> TravelVisuals.fx
 *      Kullanım:  engine.playFx('spinSlash', worldX, worldY, { color:'#ffd54f', follow:true })
 *
 *  AYARLAR (TravelVisuals.options): tiles / scenery / weather / mobs  -> false yaparak kapat
 *  Bölge değiştirmek için:  engine.setZone('Frozen Tundra - Normal')
 *   4) 12 yeni efekt + 21 hazır skill görseli (TravelVisuals.skills)  ->  engine.castVisual('Meteor Storm', x, y)
 *   4b) 10 epik skill daha + EFEKT YAPI TAŞLARI: TravelVisuals.defineFx(isim, {layers:[...]}) ile yeni efekt üret
 *       TravelVisuals.skillsFor('Archmage') -> o sınıfın skill görselleri
 *   5) RENK GEÇİŞLERİ:  engine.setTransition('verdantToAshen')   engine.setColorCycle('dayCycle')
 *  Test tuşları (isteğe bağlı):  TravelVisuals.installDemoKeys(engine)  -> 1..9 efektleri dener
 * ============================================================================
 */
(function (global) {
  'use strict';
  const TE = global.TravelEngine;
  if (!TE) { console.warn('[TravelVisuals] travel.js önce yüklenmeli'); return; }

  // ---------------- küçük yardımcılar ----------------
  const TAU = Math.PI * 2;
  const COS30 = Math.cos(Math.PI / 6), SIN30 = Math.sin(Math.PI / 6);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const hash2 = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123; return n - Math.floor(n); };
  function rng(seed) { let a = seed | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hexRgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; };
  const rgba = (h, a) => { const c = hexRgb(h); return `rgba(${c.r},${c.g},${c.b},${a})`; };
  const shade = (h, amt) => { const c = hexRgb(h), tg = amt > 0 ? 255 : 0, k = Math.abs(amt); return `rgb(${Math.round(lerp(c.r, tg, k))},${Math.round(lerp(c.g, tg, k))},${Math.round(lerp(c.b, tg, k))})`; };
  const poly = (g, p) => { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); };
  const ell = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); };
  const starPath = (g, x, y, r, n = 5, k = 0.45) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r * k : r; i ? g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : g.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); };

  const _glow = {};
  function glow(g, x, y, r, col, a = 1) {
    let c = _glow[col];
    if (!c) {
      c = document.createElement('canvas'); c.width = c.height = 64;
      const k = hexRgb(col), gg = c.getContext('2d'), gr = gg.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${k.r},${k.g},${k.b},1)`); gr.addColorStop(0.35, `rgba(${k.r},${k.g},${k.b},0.45)`); gr.addColorStop(1, `rgba(${k.r},${k.g},${k.b},0)`);
      gg.fillStyle = gr; gg.fillRect(0, 0, 64, 64); _glow[col] = c;
    }
    const pa = g.globalAlpha, po = g.globalCompositeOperation;
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = pa * a;
    g.drawImage(c, x - r, y - r, r * 2, r * 2);
    g.globalAlpha = pa; g.globalCompositeOperation = po;
  }
  function glowE(g, x, y, rx, ry, col, a = 1) { // yere yatık parıltı
    g.save(); g.translate(x, y); g.scale(1, ry / rx); glow(g, 0, 0, rx, col, a); g.restore();
  }

  // ==========================================================================
  //  1) CANAVAR ÇİZİMLERİ  (engine'in 200x200 scratch tuvali: ayak noktası = 0,0)
  //     imza: (g, m, t, face, atkT)   face = +1/-1 bakış yönü, atkT = saldırı sonrası 1->0
  // ==========================================================================
  const LION = {
    gold:   { fur: '#c9923c', furDark: '#7a5320', furLight: '#f0cf8a', mane: '#7a3d12', mane2: '#b8641d', eye: '#ffeb3b', flame: 'leaf' },
    ember:  { fur: '#8a3a22', furDark: '#3e1610', furLight: '#d9825a', mane: '#ff5a14', mane2: '#ffb300', eye: '#ffd54f', flame: 'ember' },
    frost:  { fur: '#cfe3ee', furDark: '#7d9db3', furLight: '#ffffff', mane: '#6fb7e8', mane2: '#d6f1ff', eye: '#40c4ff', flame: 'ice' },
    cursed: { fur: '#4a3a5e', furDark: '#1f1630', furLight: '#8a74a8', mane: '#6a1fb5', mane2: '#b388ff', eye: '#e040fb', flame: 'wisp' }
  };

  function paintLion(g, m, t, face, atkT, L) {
    const moving = Math.hypot(m.vx || 0, m.vy || 0) > 8, ph = m.walkPhase || 0;
    const br = Math.sin(t * 2.2) * 1.2, open = atkT > 0.5 ? clamp((atkT - 0.5) / 0.3, 0, 1) : 0;
    g.save(); g.scale(face * 1.12, 1.12); g.lineCap = 'round'; g.lineJoin = 'round';
    glowE(g, 0, 0, 52, 14, '#000000', 0.5);
    // kuyruk
    const tw = Math.sin(t * 3 + 1) * 6;
    g.strokeStyle = L.furDark; g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(-38, -40); g.bezierCurveTo(-58, -44 + tw * 0.3, -64, -62 + tw, -53, -74 + tw); g.stroke();
    g.fillStyle = L.mane; ell(g, -52, -75 + tw, 5.5, 8, 0.4); g.fill();
    // bacaklar
    const leg = (x, phase, col, w) => {
      const sw = moving ? Math.sin(ph * 1.2 + phase) * 9 : 0, lift = moving ? Math.max(0, Math.cos(ph * 1.2 + phase)) * 6 : 0;
      g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); g.moveTo(x, -34); g.lineTo(x + sw * 0.5 + 2, -17 - lift * 0.5); g.lineTo(x + sw, -4 - lift); g.stroke();
      g.fillStyle = col; ell(g, x + sw + 3, -3 - lift, 7, 4); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1;
      for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + sw + 5 + k * 2, -2 - lift); g.lineTo(x + sw + 8 + k * 2, 0 - lift); g.stroke(); }
    };
    leg(-30, Math.PI, L.furDark, 9); leg(24, 0, L.furDark, 9);
    // gövde
    let gr = g.createLinearGradient(0, -68, 0, -22); gr.addColorStop(0, L.fur); gr.addColorStop(0.7, L.fur); gr.addColorStop(1, L.furLight);
    g.fillStyle = gr; g.beginPath(); g.moveTo(-42, -38); g.bezierCurveTo(-46, -62, -10, -68 + br, 20, -66 + br); g.bezierCurveTo(42, -62, 46, -48, 40, -34); g.bezierCurveTo(30, -21, -30, -21, -42, -38); g.fill();
    g.strokeStyle = rgba(L.furDark, 0.5); g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-34, -52); g.quadraticCurveTo(-26, -40, -30, -28); g.moveTo(16, -58); g.quadraticCurveTo(24, -46, 20, -32); g.stroke();
    leg(-24, 0, L.fur, 10); leg(30, Math.PI, L.fur, 10);
    // yele (arkadan öne iki katman)
    const hx = 38, hy = -56 + br;
    for (let layer = 0; layer < 2; layer++) {
      const n = layer ? 12 : 15, r0 = layer ? 17 : 21, r1 = layer ? 29 : 37;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + layer * 0.2, w = Math.sin(t * (L.flame === 'ember' ? 5 : 2.4) + k * 1.7 + layer) * (L.flame === 'ember' ? 4 : 2);
        const tip = r1 + w + (k % 2) * 3, da = 0.2;
        g.fillStyle = layer ? L.mane2 : L.mane;
        poly(g, [hx + Math.cos(a - da) * r0, hy + Math.sin(a - da) * r0 * 0.95, hx + Math.cos(a) * tip, hy + Math.sin(a) * tip * 0.95, hx + Math.cos(a + da) * r0, hy + Math.sin(a + da) * r0 * 0.95]); g.fill();
        if (layer && L.flame === 'ember' && k % 2 === 0) glow(g, hx + Math.cos(a) * tip, hy + Math.sin(a) * tip * 0.95, 8, '#ff7a1a', 0.55);
        if (layer && L.flame === 'ice' && k % 3 === 0) glow(g, hx + Math.cos(a) * tip, hy + Math.sin(a) * tip * 0.95, 6, '#bdeaff', 0.5);
        if (layer && L.flame === 'wisp' && k % 3 === 0) glow(g, hx + Math.cos(a) * tip, hy + Math.sin(a) * tip * 0.95 - ((t * 20 + k * 9) % 14), 7, '#b388ff', 0.6);
      }
    }
    // kafa
    gr = g.createRadialGradient(hx - 4, hy - 6, 2, hx, hy, 18); gr.addColorStop(0, L.furLight); gr.addColorStop(1, L.fur);
    g.fillStyle = gr; ell(g, hx + 2, hy, 16, 14); g.fill();
    g.fillStyle = L.furDark; ell(g, hx - 8, hy - 12, 5, 5); g.fill(); ell(g, hx + 8, hy - 14, 4.5, 4.5); g.fill();
    g.fillStyle = L.furLight; ell(g, hx + 17, hy + 6, 11, 8); g.fill();
    const jaw = open * 12;
    g.fillStyle = '#3a0c10'; ell(g, hx + 17, hy + 10 + jaw * 0.5, 9, 3 + jaw * 0.6); g.fill();
    g.fillStyle = L.fur; ell(g, hx + 16, hy + 12 + jaw, 9, 4.5); g.fill();
    g.fillStyle = '#fff'; poly(g, [hx + 10, hy + 9, hx + 12, hy + 15 + open * 3, hx + 14, hy + 9]); g.fill(); poly(g, [hx + 20, hy + 9, hx + 22, hy + 15 + open * 3, hx + 24, hy + 9]); g.fill();
    g.fillStyle = '#2a1414'; poly(g, [hx + 22, hy + 1, hx + 30, hy + 2, hx + 26, hy + 7]); g.fill();
    g.strokeStyle = L.furDark; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx + 10, hy + 3); g.quadraticCurveTo(hx + 17, hy + 5, hx + 22, hy + 3); g.stroke();
    g.strokeStyle = '#1a0a08'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(hx + 6, hy - 7); g.lineTo(hx + 18, hy - 3); g.stroke();
    g.fillStyle = L.eye; ell(g, hx + 12, hy - 2, 3.4, 2.4, 0.3); g.fill(); glow(g, hx + 12, hy - 2, 12, L.eye, 0.9);
    g.strokeStyle = 'rgba(255,240,230,0.8)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx - 2, hy - 8); g.lineTo(hx + 8, hy + 8); g.stroke();
    g.restore();
  }

  function paintBloodSeer(g, m, t, face, atkT) {
    const bob = Math.sin(t * 2.1) * 3 - 12, cast = atkT > 0.4 ? clamp((atkT - 0.4) / 0.6, 0, 1) : 0;
    g.save(); g.scale(face * 1.15, 1.15);
    glowE(g, 0, 0, 24, 8, '#000000', 0.4); glow(g, 0, -34 + bob, 46, '#ff1744', 0.22);
    g.translate(0, bob);
    // sürüklenen kan dalları
    g.lineCap = 'round'; g.strokeStyle = '#8b0d1d'; g.lineWidth = 3;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-8 + k * 8, 0); g.quadraticCurveTo(-10 + k * 9 + Math.sin(t * 3 + k) * 5, 10, -6 + k * 8 + Math.sin(t * 2.4 + k * 2) * 6, 20 + k * 2); g.stroke(); }
    const dr = (t * 18) % 22; g.fillStyle = '#d50000'; ell(g, 2, 8 + dr, 1.8, 2.6); g.fill();
    // cüppe
    const gr = g.createLinearGradient(0, -56, 0, 8); gr.addColorStop(0, '#8e1424'); gr.addColorStop(0.6, '#4a0812'); gr.addColorStop(1, '#1d0308');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-12, -50); g.quadraticCurveTo(-22, -24, -22, 4);
    for (let k = 0; k <= 8; k++) g.lineTo(-22 + k * 5.5, 3 + (k % 2 ? 7 : 0) + Math.sin(t * 4 + k) * 1.5);
    g.quadraticCurveTo(22, -24, 12, -50); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,23,68,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, -40); g.quadraticCurveTo(-9, -20, -8, 2); g.moveTo(7, -40); g.quadraticCurveTo(10, -20, 9, 2); g.stroke();
    // kemik omuzluk + şerit
    g.fillStyle = '#e8dccb'; [-1, 1].forEach((s) => { poly(g, [s * 10, -48, s * 22, -60, s * 18, -44]); g.fill(); });
    g.fillStyle = '#3a0a12'; g.fillRect(-14, -28, 28, 4); glow(g, 0, -26, 8, '#ff1744', 0.6);
    // asa (arka el)
    g.strokeStyle = '#d8ccb8'; g.lineWidth = 3; g.beginPath(); g.moveTo(-24, 2); g.lineTo(-24, -58); g.quadraticCurveTo(-24, -68, -17, -64); g.stroke();
    g.fillStyle = '#ff1744'; poly(g, [-24, -64, -20, -57, -24, -50, -28, -57]); g.fill(); glow(g, -24, -57, 16, '#ff1744', 0.8 + 0.2 * Math.sin(t * 5));
    g.strokeStyle = '#2a0a0e'; g.lineWidth = 4; g.beginPath(); g.moveTo(-10, -42); g.lineTo(-22, -34); g.stroke();
    // öndeki el: kan küresi
    const hx = 16 + cast * 8, hy = -34 - cast * 6;
    g.strokeStyle = '#2a0a0e'; g.lineWidth = 4; g.beginPath(); g.moveTo(10, -42); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = '#e8dccb'; g.lineWidth = 1.4; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 7, hy - 4 + k * 4); g.stroke(); }
    const orb = 5 + cast * 8; glow(g, hx + 9, hy - 2, orb * 3, '#ff1744', 0.9); g.fillStyle = '#ff5252'; g.beginPath(); g.arc(hx + 9, hy - 2, orb, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(hx + 7.5, hy - 4, orb * 0.3, 0, TAU); g.fill();
    // kapüşon + yüz
    g.fillStyle = '#3a0a14'; g.beginPath(); g.moveTo(-14, -48); g.quadraticCurveTo(-16, -66, 0, -72); g.quadraticCurveTo(16, -66, 14, -48); g.quadraticCurveTo(0, -42, -14, -48); g.fill();
    g.fillStyle = '#0c0206'; ell(g, 3, -55, 9, 10); g.fill();
    g.fillStyle = '#d9cbbd'; ell(g, 4, -54, 6.4, 7.6); g.fill();
    g.fillStyle = '#1a0308'; ell(g, 1.4, -55, 1.9, 2.6); g.fill(); ell(g, 7, -55, 1.9, 2.6); g.fill(); poly(g, [4, -52, 3, -49.5, 5, -49.5]); g.fill();
    g.strokeStyle = '#2a0a0e'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(1, -47); g.lineTo(8, -47); g.stroke();
    g.fillStyle = '#ff1744'; [[1.4, -55.4, 1.3], [7, -55.4, 1.3], [4.2, -60, 1]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); glow(g, x, y, 7, '#ff1744', 0.9); });
    // boynuz
    g.strokeStyle = '#e8dccb'; g.lineWidth = 2.6; [-1, 1].forEach((s) => { g.beginPath(); g.moveTo(s * 7, -66); g.quadraticCurveTo(s * 18, -68, s * 16, -80); g.moveTo(s * 13, -70); g.lineTo(s * 20, -72); g.stroke(); });
    // yörüngedeki kan damlaları
    for (let k = 0; k < 3; k++) { const a = t * 1.8 + k * 2.1, x = Math.cos(a) * 30, y = -34 + Math.sin(a) * 9; if (Math.sin(a) > -0.2) { glow(g, x, y, 9, '#ff1744', 0.6); g.fillStyle = '#c40018'; g.beginPath(); g.arc(x, y + 1, 2.4, 0, TAU); g.fill(); poly(g, [x - 2, y + 0.4, x, y - 5, x + 2, y + 0.4]); g.fill(); } }
    g.restore();
  }

  function paintBoneWarden(g, m, t, face, atkT) {
    const moving = Math.hypot(m.vx || 0, m.vy || 0) > 8, ph = m.walkPhase || 0, sw = moving ? Math.sin(ph * 1.2) : 0, bob = moving ? -Math.abs(sw) * 2.5 : Math.sin(t * 2) * -1;
    const slash = atkT > 0.5 ? easeOut((atkT - 0.5) / 0.5) : 0;
    g.save(); g.scale(face * 1.1, 1.1); glowE(g, 0, 0, 26, 8, '#000000', 0.45); g.lineCap = 'round'; g.translate(0, bob);
    const bone = '#e3dccb', boneD = '#8d8672', rust = '#5a4a3c', rustD = '#2e241c';
    // bacaklar (kemik + zırhlı diz)
    [[-5, sw], [7, -sw]].forEach(([x, s]) => {
      const lift = Math.max(0, s) * 4; g.strokeStyle = bone; g.lineWidth = 4; g.beginPath(); g.moveTo(x, -26); g.lineTo(x + s * 3, -14 - lift * 0.5); g.lineTo(x + s * 5, -3 - lift); g.stroke();
      g.fillStyle = rust; ell(g, x + s * 3, -15 - lift * 0.5, 4.5, 3.4); g.fill(); g.fillStyle = boneD; ell(g, x + s * 5 + 3, -2 - lift, 6, 2.8); g.fill();
    });
    // pelvis + kaburga
    g.fillStyle = boneD; ell(g, 0, -27, 9, 4); g.fill();
    g.strokeStyle = bone; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -27); g.lineTo(0, -52); g.stroke();
    g.lineWidth = 2.2; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(0, -33 - k * 5); g.quadraticCurveTo(10, -33 - k * 5 - 2, 9 - k * 0.6, -33 - k * 5 + 3); g.moveTo(0, -33 - k * 5); g.quadraticCurveTo(-10, -33 - k * 5 - 2, -9 + k * 0.6, -33 - k * 5 + 3); g.stroke(); }
    glow(g, 0, -42, 14, '#7c4dff', 0.35 + 0.1 * Math.sin(t * 3)); // göğüs içi ruh ışığı
    // zırh göğüslük (kırık)
    let gr = g.createLinearGradient(-12, 0, 12, 0); gr.addColorStop(0, '#6b5a4a'); gr.addColorStop(1, rustD);
    g.fillStyle = gr; poly(g, [-12, -54, -4, -57, -3, -46, -8, -38, -13, -42]); g.fill(); poly(g, [12, -54, 5, -57, 4, -50, 10, -44]); g.fill();
    // omuz kemik dikenleri
    g.fillStyle = rust; ell(g, -13, -53, 7, 5, -0.3); g.fill(); ell(g, 13, -53, 7, 5, 0.3); g.fill();
    g.fillStyle = bone; poly(g, [-17, -55, -22, -65, -12, -57]); g.fill(); poly(g, [17, -55, 22, -65, 12, -57]); g.fill();
    // kılıç (öndeki kol) — vururken savrulur
    g.save(); g.translate(14, -46); g.rotate(-0.9 + slash * 2.2);
    g.strokeStyle = bone; g.lineWidth = 3.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(8, 4); g.stroke();
    g.fillStyle = '#4a4036'; g.fillRect(6, -3, 4, 14); g.translate(8, 5); g.rotate(-1.57);
    g.fillStyle = '#b9c0c8'; poly(g, [0, -4, 46, -3, 54, 0, 46, 3, 0, 4]); g.fill(); g.fillStyle = '#7d8790'; g.fillRect(0, -0.8, 48, 1.6);
    g.fillStyle = '#e3dccb'; for (let k = 0; k < 4; k++) poly(g, [8 + k * 10, -4, 11 + k * 10, -8, 14 + k * 10, -4]), g.fill();
    glow(g, 30, 0, 24, '#7c4dff', 0.3); g.restore();
    // kalkan (arka kol, büyük)
    g.save(); g.translate(-18, -36); gr = g.createLinearGradient(-10, -16, 10, 16); gr.addColorStop(0, '#7a6a58'); gr.addColorStop(1, '#2e241c');
    g.fillStyle = gr; poly(g, [-11, -18, 11, -18, 12, 2, 0, 16, -12, 2]); g.fill(); g.strokeStyle = '#a89a86'; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = bone; ell(g, 0, -4, 5.6, 6); g.fill(); g.fillStyle = '#12090a'; ell(g, -2, -5, 1.6, 2); g.fill(); ell(g, 2, -5, 1.6, 2); g.fill(); g.fillRect(-2.6, 0, 5.2, 2);
    glow(g, -2, -5, 6, '#7c4dff', 0.6); glow(g, 2, -5, 6, '#7c4dff', 0.6); g.restore();
    // kafatası + miğfer
    g.fillStyle = bone; ell(g, 2, -64, 8, 8.6); g.fill(); g.fillRect(-1, -60, 10, 6);
    g.fillStyle = rust; g.beginPath(); g.arc(2, -66, 9.4, Math.PI, 0); g.lineTo(11, -63); g.lineTo(-7, -63); g.closePath(); g.fill();
    g.fillStyle = bone; g.strokeStyle = bone; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-5, -70); g.quadraticCurveTo(-14, -72, -12, -83); g.moveTo(9, -70); g.quadraticCurveTo(18, -72, 16, -83); g.stroke();
    g.fillStyle = '#0b0710'; ell(g, 0, -62, 2.4, 3); g.fill(); ell(g, 7, -62, 2.4, 3); g.fill();
    g.fillStyle = '#b388ff'; g.beginPath(); g.arc(0.4, -62, 1.3, 0, TAU); g.arc(7.4, -62, 1.3, 0, TAU); g.fill(); glow(g, 0.4, -62, 9, '#7c4dff', 0.9); glow(g, 7.4, -62, 9, '#7c4dff', 0.9);
    g.restore();
  }

  function paintFrostWolf(g, m, t, face, atkT) {
    const moving = Math.hypot(m.vx || 0, m.vy || 0) > 8, ph = m.walkPhase || 0, open = atkT > 0.5 ? clamp((atkT - 0.5) / 0.3, 0, 1) : 0;
    g.save(); g.scale(face * 1.05, 1.05); g.lineCap = 'round'; g.lineJoin = 'round'; glowE(g, 0, 0, 40, 11, '#000000', 0.45);
    const fur = '#dfeaf2', furD = '#8aa6ba', furL = '#ffffff', ice = '#6fd0ff';
    const tw = Math.sin(t * 4) * 4; g.strokeStyle = fur; g.lineWidth = 8; g.beginPath(); g.moveTo(-30, -30); g.quadraticCurveTo(-48, -34 + tw, -52, -22 + tw); g.stroke();
    const leg = (x, phase, c) => { const s = moving ? Math.sin(ph * 1.4 + phase) * 8 : 0, l = moving ? Math.max(0, Math.cos(ph * 1.4 + phase)) * 5 : 0; g.strokeStyle = c; g.lineWidth = 6.5; g.beginPath(); g.moveTo(x, -26); g.lineTo(x + s * 0.5, -13 - l * 0.5); g.lineTo(x + s, -3 - l); g.stroke(); g.fillStyle = c; ell(g, x + s + 2, -2 - l, 5, 3); g.fill(); };
    leg(-22, Math.PI, furD); leg(18, 0, furD);
    const gr = g.createLinearGradient(0, -48, 0, -18); gr.addColorStop(0, fur); gr.addColorStop(1, furL);
    g.fillStyle = gr; g.beginPath(); g.moveTo(-34, -30); g.bezierCurveTo(-36, -48, -6, -52, 16, -48); g.bezierCurveTo(34, -44, 36, -32, 30, -26); g.bezierCurveTo(14, -16, -22, -16, -34, -30); g.fill();
    g.fillStyle = ice; for (let k = 0; k < 5; k++) poly(g, [-26 + k * 11, -46 + Math.abs(k - 2) * 1.5, -23 + k * 11, -54 + Math.abs(k - 2) * 1.5 - (k % 2) * 3, -20 + k * 11, -46 + Math.abs(k - 2) * 1.5]), g.fill();
    glow(g, 0, -50, 26, ice, 0.18);
    leg(-16, 0, fur); leg(24, Math.PI, fur);
    const hx = 36, hy = -44 + Math.sin(t * 2) * 0.8;
    g.fillStyle = fur; ell(g, hx, hy, 11, 10); g.fill(); poly(g, [hx - 6, hy - 8, hx - 4, hy - 20, hx + 1, hy - 9]); g.fill(); poly(g, [hx + 3, hy - 9, hx + 8, hy - 19, hx + 9, hy - 6]); g.fill();
    g.fillStyle = furD; poly(g, [hx - 5, hy - 9, hx - 4, hy - 16, hx - 1, hy - 9]); g.fill();
    g.fillStyle = furL; ell(g, hx + 12, hy + 3, 9, 6); g.fill();
    g.fillStyle = '#4a1a1a'; ell(g, hx + 12, hy + 6 + open * 3, 7, 1.8 + open * 3); g.fill();
    g.fillStyle = '#fff'; poly(g, [hx + 8, hy + 5, hx + 9.4, hy + 9 + open * 3, hx + 11, hy + 5]); g.fill(); poly(g, [hx + 14, hy + 5, hx + 15.4, hy + 9 + open * 3, hx + 17, hy + 5]); g.fill();
    g.fillStyle = '#1a1e24'; ell(g, hx + 19, hy, 2.4, 1.8); g.fill();
    g.fillStyle = ice; ell(g, hx + 5, hy - 2, 2.4, 1.6, 0.3); g.fill(); glow(g, hx + 5, hy - 2, 9, ice, 0.9);
    g.strokeStyle = '#1a2a3a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(hx + 1, hy - 6); g.lineTo(hx + 9, hy - 3); g.stroke();
    glow(g, hx + 22, hy + 6, 10, '#bdeaff', 0.3 + open * 0.4);
    g.restore();
  }

  function paintBogToad(g, m, t, face, atkT) {
    const moving = Math.hypot(m.vx || 0, m.vy || 0) > 8, ph = m.walkPhase || 0, hop = moving ? Math.abs(Math.sin(ph * 1.1)) * 7 : 0;
    const open = atkT > 0.5 ? clamp((atkT - 0.5) / 0.3, 0, 1) : 0, puff = 1 + Math.sin(t * 3) * 0.04;
    g.save(); g.scale(face * 1.1, 1.1); glowE(g, 0, 0, 30 - hop, 9, '#000000', 0.5); g.translate(0, -hop);
    const sk = '#5f7a2e', skD = '#32451a', skL = '#a5bf5a';
    g.fillStyle = skD; ell(g, -20, -6, 12, 7, -0.3); g.fill(); ell(g, 24, -5, 9, 5); g.fill();
    let gr = g.createRadialGradient(-4, -34, 4, 0, -24, 30); gr.addColorStop(0, skL); gr.addColorStop(0.6, sk); gr.addColorStop(1, skD);
    g.fillStyle = gr; ell(g, 0, -22, 27 * puff, 21 * puff); g.fill();
    g.fillStyle = '#d6dc8a'; ell(g, 6, -12, 16, 9); g.fill();
    for (let k = 0; k < 7; k++) { const a = hash2(k, 3) * TAU, r = 8 + hash2(k, 8) * 14, x = Math.cos(a) * r - 4, y = -24 + Math.sin(a) * r * 0.7; g.fillStyle = k % 2 ? '#7a4d9c' : skD; ell(g, x, y, 2.6, 2, a); g.fill(); if (k % 2) glow(g, x, y, 7, '#c6ff00', 0.45 + 0.2 * Math.sin(t * 3 + k)); }
    g.fillStyle = skD; poly(g, [-14, -30, -4, -34, -8, -22]); g.fill();
    // ağız + dil
    g.strokeStyle = '#1d2a0e'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, -14 + open * 3); g.quadraticCurveTo(14, -8 + open * 8, 26, -16 + open * 3); g.stroke();
    if (open > 0.1) { g.fillStyle = '#7a1f2a'; ell(g, 17, -13 + open * 2, 8, open * 5); g.fill(); g.strokeStyle = '#d6496a'; g.lineWidth = 4; g.beginPath(); g.moveTo(14, -13); g.lineTo(14 + open * 26, -13 + open * 2); g.stroke(); g.fillStyle = '#ff7a9a'; g.beginPath(); g.arc(14 + open * 26, -13 + open * 2, 3.2, 0, TAU); g.fill(); }
    // gözler
    [[8, -40], [-6, -41]].forEach(([x, y], k) => { g.fillStyle = skD; g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill(); g.fillStyle = '#f0e65a'; g.beginPath(); g.arc(x + 1, y - 1, 6, 0, TAU); g.fill(); g.fillStyle = '#111'; ell(g, x + 2, y - 1, 1.6, 4.4); g.fill(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(x - 1, y - 4, 2, 2); });
    // zehir damlası
    const dp = (t * 14) % 16; g.fillStyle = '#9eff00'; g.globalAlpha = 1 - dp / 16; ell(g, 22, -10 + dp, 1.6, 2.2); g.fill(); g.globalAlpha = 1;
    g.restore();
  }

  function paintMagmaGolem(g, m, t, face, atkT) {
    const moving = Math.hypot(m.vx || 0, m.vy || 0) > 8, ph = m.walkPhase || 0, sw = moving ? Math.sin(ph) : 0, slam = atkT > 0.5 ? easeOut((atkT - 0.5) / 0.5) : 0;
    const pulse = 0.6 + 0.4 * Math.sin(t * 3), bob = moving ? -Math.abs(sw) * 3 : 0;
    g.save(); g.scale(face * 1.15, 1.15); glowE(g, 0, 0, 34, 10, '#ff3d00', 0.25 * pulse); glowE(g, 0, 0, 30, 9, '#000000', 0.4); g.translate(0, bob);
    const rock = (x, y, rx, ry, rot, col) => { const gr = g.createLinearGradient(x - rx, y - ry, x + rx, y + ry); gr.addColorStop(0, shade(col, 0.2)); gr.addColorStop(1, shade(col, -0.45)); g.fillStyle = gr; poly(g, [x - rx, y, x - rx * 0.5, y - ry, x + rx * 0.6, y - ry * 0.9, x + rx, y, x + rx * 0.5, y + ry, x - rx * 0.6, y + ry * 0.9]); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; g.stroke(); };
    const lava = (pts) => { g.save(); g.lineCap = 'round'; g.strokeStyle = rgba('#ff3d00', 0.5 * pulse); g.lineWidth = 4; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); g.strokeStyle = '#ffb300'; g.lineWidth = 1.4; g.stroke(); g.restore(); };
    rock(-9, -10, 8, 10, 0, '#3a2c28'); rock(9, -10, 8, 10, 0, '#3a2c28');
    rock(-10 - sw * 2, -8, 8, 6, 0, '#2c211e'); rock(10 + sw * 2, -8, 8, 6, 0, '#2c211e');
    rock(0, -32, 17, 15, 0, '#4a3830'); rock(-8, -42, 11, 10, 0, '#55413a'); rock(9, -40, 12, 10, 0, '#4a3830');
    lava([-10, -40, -4, -34, -8, -26, -2, -20]); lava([8, -44, 5, -36, 11, -30]); lava([-6, -14, -8, -6]);
    glow(g, 0, -30, 26, '#ff5a14', 0.28 * pulse);
    // kollar
    const arm = (s, lift) => { const ax = s * 22, ay = -40 - lift * 22 * (s > 0 ? 1 : 0.6); rock(s * 18, -42, 8, 8, 0, '#55413a'); rock(ax + s * 2, ay + 16 - lift * 6, 9, 11, 0, '#3a2c28'); rock(ax + s * 4, ay + 32 - lift * 14 + sw * s * 2, 12, 12, 0, '#2c211e'); lava([ax, ay + 10, ax + s * 2, ay + 22]); glow(g, ax + s * 4, ay + 32 - lift * 14, 10, '#ff5a14', 0.4 * pulse); };
    arm(-1, 0); arm(1, slam);
    // kafa
    rock(0, -58, 9, 8, 0, '#55413a'); g.fillStyle = '#ffb300'; g.fillRect(-5, -60, 3.6, 2.6); g.fillRect(2, -60, 3.6, 2.6); glow(g, -3, -59, 9, '#ff7a1a', 0.9); glow(g, 4, -59, 9, '#ff7a1a', 0.9);
    g.fillStyle = '#2a1e1a'; poly(g, [-8, -64, -6, -72, -3, -65]); g.fill(); poly(g, [8, -64, 6, -72, 3, -65]); g.fill();
    for (let k = 0; k < 4; k++) { const ph2 = (t * 0.6 + k / 4) % 1; glow(g, -16 + k * 11 + Math.sin(k * 3 + t) * 3, -54 - ph2 * 40, 5, '#ff8a2a', Math.sin(ph2 * Math.PI) * 0.9); }
    g.restore();
  }

  const MOBS = {
    lion_gold:   { name: 'Thornmane Lion', radius: 30, paint: (g, m, t, f, a) => paintLion(g, m, t, f, a, LION.gold) },
    lion_ember:  { name: 'Cinder Lion',    radius: 30, paint: (g, m, t, f, a) => paintLion(g, m, t, f, a, LION.ember) },
    lion_frost:  { name: 'Frost Lion',     radius: 30, paint: (g, m, t, f, a) => paintLion(g, m, t, f, a, LION.frost) },
    lion_cursed: { name: 'Gloom Lion',     radius: 30, paint: (g, m, t, f, a) => paintLion(g, m, t, f, a, LION.cursed) },
    blood_seer:  { name: 'Blood Seer',     radius: 17, paint: paintBloodSeer },
    bone_warden: { name: 'Bone Warden',    radius: 22, paint: paintBoneWarden },
    frost_wolf:  { name: 'Frost Wolf',     radius: 20, paint: paintFrostWolf },
    bog_toad:    { name: 'Bog Toad',       radius: 22, paint: paintBogToad },
    magma_golem: { name: 'Magma Golem',    radius: 28, paint: paintMagmaGolem }
  };
  // Bölgeye göre canavar görünümleri (orijinal kind'lar: goblin / treant / wraith)
  const NATIVE = { goblin: ['Koru Goblini', 16], treant: ['Yozlaşmış Treant', 24], wraith: ['Gölge Avcısı', 15] };
  const BIOME_MOBS = {
    verdant: ['lion_gold', 'goblin', 'treant'],
    ashen: ['lion_ember', 'magma_golem', 'wraith'],
    frozen: ['lion_frost', 'frost_wolf', 'frost_wolf', 'wraith'],
    mirefen: ['bog_toad', 'bog_toad', 'wraith', 'treant'],
    cursed: ['blood_seer', 'bone_warden', 'lion_cursed', 'blood_seer']
  };

  // ==========================================================================
  //  2) EFEKT KÜTÜPHANESİ  (ekran uzayı, ayak noktası sx,sy · p: 0..1 ilerleme)
  //     fx.isim(ctx, sx, sy, p, { color, radius })
  // ==========================================================================
  const fx = {
    // Kılıç dönerek vurma: kılıç karakter etrafında 2 tur atar, iz bırakır, sonda halka patlar
    spinSlash(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 78, col = o.color || '#ffd54f', turns = o.turns || 2, fade = 1 - smooth(0.82, 1, p), e = easeInOut(Math.min(1, p / 0.85));
      const ang = e * TAU * turns - Math.PI / 2;
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.3, R * 0.65, col, 0.25 * fade);
      for (let i = 0; i < 26; i++) {
        const a0 = ang - i * 0.1, a1 = ang - (i + 1) * 0.1, k = 1 - i / 26;
        ctx.save(); ctx.scale(1, 0.5); ctx.strokeStyle = rgba(col, k * 0.75 * fade); ctx.lineWidth = 3 + 13 * k; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.arc(0, -26, R * 0.92, a0, a1); ctx.stroke();
        ctx.strokeStyle = rgba('#ffffff', k * 0.5 * fade); ctx.lineWidth = 1 + 3 * k; ctx.beginPath(); ctx.arc(0, -26, R * 0.92, a0, a1); ctx.stroke(); ctx.restore();
      }
      [0, -0.4].forEach((off, j) => {
        const a = ang + off, tx = Math.cos(a) * R, ty = Math.sin(a) * R * 0.5 - 13, nx = -Math.sin(a) * 4, ny = Math.cos(a) * 2;
        ctx.globalAlpha = (j ? 0.3 : 1) * fade;
        const g = ctx.createLinearGradient(0, -13, tx, ty); g.addColorStop(0, '#9fb0bd'); g.addColorStop(1, '#ffffff');
        ctx.fillStyle = g; poly(ctx, [nx * 0.4, -13 + ny * 0.4, tx * 0.9 + nx, ty * 0.9 + ny, tx * 1.04, ty * 1.04, tx * 0.9 - nx, ty * 0.9 - ny, -nx * 0.4, -13 - ny * 0.4]); ctx.fill();
        glow(ctx, tx, ty, 20, col, 0.8); ctx.globalAlpha = 1;
      });
      ctx.strokeStyle = rgba(col, 0.55 * fade); ctx.lineWidth = 2; ell(ctx, 0, 0, R * (0.55 + 0.5 * e), R * (0.55 + 0.5 * e) * 0.5); ctx.stroke();
      if (p > 0.82) { const b = (p - 0.82) / 0.18; ctx.strokeStyle = rgba('#ffffff', (1 - b) * 0.9); ctx.lineWidth = 4 * (1 - b) + 1; ell(ctx, 0, 0, R * (0.9 + b * 0.7), R * (0.9 + b * 0.7) * 0.5); ctx.stroke(); glow(ctx, 0, -10, R * 0.9 * b + 10, col, (1 - b) * 0.5); }
      ctx.restore();
    },
    // Yer darbesi: çatlaklar + şok dalgası + fırlayan taşlar
    groundSlam(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 90, col = o.color || '#ffb74d', e = easeOut(p), fade = 1 - smooth(0.55, 1, p), r = rng(7);
      ctx.save(); ctx.translate(sx, sy);
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * TAU + r() * 0.4, len = R * (0.6 + r() * 0.5) * e; ctx.strokeStyle = rgba('#120c08', 0.85 * (1 - p * 0.5)); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, 0);
        for (let s = 1; s <= 5; s++) { const d = len * s / 5; ctx.lineTo(Math.cos(a) * d + (r() - 0.5) * 8, (Math.sin(a) * d + (r() - 0.5) * 8) * 0.5); } ctx.stroke();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(col, 0.8 * fade); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len * 0.5); ctx.stroke(); ctx.restore();
      }
      ctx.strokeStyle = rgba(col, 0.9 * fade); ctx.lineWidth = 6 * (1 - p) + 1; ell(ctx, 0, 0, R * e, R * e * 0.5); ctx.stroke();
      ctx.strokeStyle = rgba('#ffffff', 0.7 * fade); ctx.lineWidth = 2; ell(ctx, 0, 0, R * e * 0.96, R * e * 0.48); ctx.stroke();
      glowE(ctx, 0, 0, R * 1.1 * e + 10, R * 0.55 * e + 5, col, 0.5 * fade);
      for (let k = 0; k < 10; k++) { const a = r() * TAU, sp = 30 + r() * 60, t2 = p * 1.2, x = Math.cos(a) * sp * t2, y = Math.sin(a) * sp * t2 * 0.5 - Math.sin(Math.min(1, t2) * Math.PI) * (28 + r() * 22); ctx.globalAlpha = 1 - smooth(0.6, 1, p); ctx.fillStyle = '#4a3f38'; poly(ctx, [x - 3, y, x, y - 3.5, x + 3.5, y + 1, x, y + 3]); ctx.fill(); }
      ctx.restore();
    },
    frostNova(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 95, col = o.color || '#80deea', e = easeOut(p), fade = 1 - smooth(0.6, 1, p), r = rng(11);
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.2 * e + 8, R * 0.6 * e + 4, col, 0.55 * fade); ctx.strokeStyle = rgba('#e0f7ff', 0.95 * fade); ctx.lineWidth = 5 * (1 - p) + 1; ell(ctx, 0, 0, R * e, R * e * 0.5); ctx.stroke();
      for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU, d = R * e * (0.75 + (k % 3) * 0.12), h = (10 + (k % 4) * 6) * Math.min(1, p * 3) * (1 - smooth(0.7, 1, p)), x = Math.cos(a) * d, y = Math.sin(a) * d * 0.5; const g = ctx.createLinearGradient(x, y, x, y - h); g.addColorStop(0, '#5fc6ea'); g.addColorStop(1, '#ffffff'); ctx.fillStyle = g; poly(ctx, [x - 3.4, y, x, y - h, x + 3.4, y]); ctx.fill(); }
      for (let k = 0; k < 18; k++) { const a = r() * TAU, d = r() * R * e, y = Math.sin(a) * d * 0.5 - p * 30 * r(); ctx.globalAlpha = fade * 0.7; ctx.fillStyle = '#fff'; ctx.fillRect(Math.cos(a) * d, y, 2, 2); }
      ctx.restore();
    },
    emberBurst(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 85, col = o.color || '#ff7a1a', e = easeOut(p), fade = 1 - smooth(0.5, 1, p), r = rng(5);
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.2 * e + 8, R * 0.6 * e + 4, col, 0.7 * fade); ctx.strokeStyle = rgba('#ffd54f', 0.9 * fade); ctx.lineWidth = 6 * (1 - p) + 1; ell(ctx, 0, 0, R * e, R * e * 0.5); ctx.stroke();
      for (let k = 0; k < 22; k++) { const a = r() * TAU, d = r() * R * e, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.5 - p * (30 + r() * 50); glow(ctx, x, y, 9 * (1 - p * 0.5), r() > 0.5 ? '#ffb300' : col, fade); }
      glow(ctx, 0, -14 * (1 - p), R * 0.7 * (1 - p) + 12, '#fff3c4', 0.6 * fade); ctx.restore();
    },
    poisonCloud(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 80, col = o.color || '#7cb342', e = easeOut(Math.min(1, p * 1.6)), fade = 1 - smooth(0.7, 1, p), r = rng(3);
      ctx.save(); ctx.translate(sx, sy);
      for (let k = 0; k < 12; k++) { const a = r() * TAU, d = r() * R * e * 0.8, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.5 - 6 - Math.sin(p * 4 + k) * 4, rr = 16 + r() * 12; ctx.globalAlpha = 0.28 * fade; ctx.fillStyle = k % 2 ? col : '#3f6b1f'; ctx.beginPath(); ctx.arc(x, y, rr * (0.6 + e * 0.5), 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1; for (let k = 0; k < 10; k++) { const ph = (p * 2 + k / 10) % 1, x = (r() - 0.5) * R * e, y = -ph * 34; ctx.strokeStyle = rgba('#ccff90', Math.sin(ph * Math.PI) * 0.8 * fade); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 2 + r() * 2, 0, TAU); ctx.stroke(); }
      glowE(ctx, 0, 0, R * e, R * e * 0.5, col, 0.25 * fade); ctx.restore();
    },
    // Zincir yıldırım: o.points = [{x,y},...] ekran noktaları (yoksa etraftan rastgele dallar)
    lightningChain(ctx, sx, sy, p, o = {}) {
      const col = o.color || '#80d8ff', fade = 1 - smooth(0.6, 1, p), fr = Math.floor(p * 18), pts = o.points || [{ x: 70, y: -20 }, { x: -60, y: -40 }, { x: 10, y: -90 }];
      ctx.save(); ctx.translate(sx, sy - 20); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; let px = 0, py = 0;
      pts.forEach((pt, i) => {
        const r = rng(fr * 31 + i * 7), n = 7; ctx.beginPath(); ctx.moveTo(px, py);
        for (let k = 1; k < n; k++) { const u = k / n; ctx.lineTo(lerp(px, pt.x, u) + (r() - 0.5) * 16, lerp(py, pt.y, u) + (r() - 0.5) * 16); }
        ctx.lineTo(pt.x, pt.y); ctx.strokeStyle = rgba(col, 0.5 * fade); ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = rgba('#ffffff', fade); ctx.lineWidth = 2; ctx.stroke(); glow(ctx, pt.x, pt.y, 22, col, fade); px = pt.x; py = pt.y;
      });
      glow(ctx, 0, 0, 24, col, fade); ctx.restore();
    },
    healPulse(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 60, col = o.color || '#69f0ae', fade = 1 - smooth(0.6, 1, p), r = rng(9);
      ctx.save(); ctx.translate(sx, sy);
      for (let k = 0; k < 3; k++) { const q = (p * 1.4 - k * 0.2); if (q < 0 || q > 1) continue; ctx.strokeStyle = rgba(col, (1 - q) * 0.9); ctx.lineWidth = 3; ell(ctx, 0, -q * 40, R * (0.4 + q * 0.6), R * (0.4 + q * 0.6) * 0.5); ctx.stroke(); }
      glowE(ctx, 0, 0, R * 1.2, R * 0.6, col, 0.4 * fade);
      for (let k = 0; k < 12; k++) { const x = (r() - 0.5) * R * 1.4, ph = (p * 1.5 + r()) % 1, y = -ph * 70; ctx.globalAlpha = Math.sin(ph * Math.PI) * fade; ctx.fillStyle = '#e8fff0'; ctx.fillRect(x - 1, y - 4, 2, 8); ctx.fillRect(x - 4, y - 1, 8, 2); glow(ctx, x, y, 8, col, 0.6); }
      ctx.restore();
    },
    arcaneCircle(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 80, col = o.color || '#b388ff', up = easeOut(Math.min(1, p * 3)), fade = 1 - smooth(0.8, 1, p), a0 = p * 5;
      ctx.save(); ctx.translate(sx, sy); ctx.globalAlpha = fade; glowE(ctx, 0, 0, R * 1.2 * up, R * 0.6 * up, col, 0.4);
      [[1, 1], [0.72, -1.4]].forEach(([k, sp]) => { ctx.strokeStyle = rgba(col, 0.9); ctx.lineWidth = 1.8; ell(ctx, 0, 0, R * k * up, R * k * up * 0.5); ctx.stroke(); ctx.fillStyle = rgba(col, 0.95); for (let s = 0; s < 8; s++) { const a = a0 * sp + s * TAU / 8, x = Math.cos(a) * R * k * up, y = Math.sin(a) * R * k * up * 0.5; poly(ctx, [x, y - 4, x + 2.4, y, x, y + 4, x - 2.4, y]); ctx.fill(); } });
      ctx.strokeStyle = rgba('#ffffff', 0.6); ctx.lineWidth = 1; ctx.beginPath(); for (let s = 0; s < 5; s++) { const a = a0 + s * TAU * 2 / 5, x = Math.cos(a) * R * 0.72 * up, y = Math.sin(a) * R * 0.72 * up * 0.5; s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke();
      ctx.restore();
    },
    bloodScythe(ctx, sx, sy, p, o = {}) { // büyük çapraz yarım ay kesik
      const R = o.radius || 80, col = o.color || '#ff1744', e = easeOut(p), fade = 1 - smooth(0.5, 1, p);
      ctx.save(); ctx.translate(sx, sy - 20); ctx.rotate(-0.5);
      for (let k = 0; k < 3; k++) { ctx.strokeStyle = rgba(k ? '#ffffff' : col, (k ? 0.9 : 0.6) * fade); ctx.lineWidth = k ? 2 : 14 * (1 - p) + 2; ctx.beginPath(); ctx.arc(0, 0, R * (0.7 + e * 0.35), -1.4, -1.4 + 3.1 * e); ctx.stroke(); }
      glow(ctx, Math.cos(-1.4 + 3.1 * e) * R * 0.9, Math.sin(-1.4 + 3.1 * e) * R * 0.9, 24, col, fade); ctx.restore();
    }
  };
  const FX_DURATION = { spinSlash: 0.9, groundSlam: 0.75, frostNova: 0.9, emberBurst: 0.8, poisonCloud: 1.6, lightningChain: 0.55, healPulse: 1.1, arcaneCircle: 1.6, bloodScythe: 0.6 };

  // ==========================================================================
  //  3) BÖLGELER  — zemin renkleri + detaylar
  // ==========================================================================
  function detectBiome(name) {
    const s = String(name || '').toLowerCase();
    if (/ashen|ash\b|ember|volcan|scorch/.test(s)) return 'ashen';
    if (/frozen|tundra|frost|snow|glacier/.test(s)) return 'frozen';
    if (/mire|marsh|swamp|bog|\bfen/.test(s)) return 'mirefen';
    if (/cursed|reach|haunt|doom/.test(s)) return 'cursed';
    return 'verdant';
  }
  // tint: 'color' karışımı · lift: beyaz · dark: siyah · decor: üst yüze detay
  const BIOMES = {
    verdant: { tiles: null },
    ashen: { tiles: { grass: { tint: '#5a4a40', lift: 0, dark: 0.1, decor: 'ash' }, path: { tint: '#8a3c1e', lift: 0, dark: 0.12, decor: 'lava' }, rock: { tint: '#2c2832', lift: 0, dark: 0.08, decor: 'obsidian' } }, bg: ['#2a0f08', '#120503', '#050101'] },
    frozen: { tiles: { grass: { tint: '#c4dcec', lift: 0.68, dark: 0, decor: 'snow' }, path: { tint: '#6fb4da', lift: 0.18, dark: 0, decor: 'ice' }, rock: { tint: '#9cc0d8', lift: 0.3, dark: 0, decor: 'icerock' } }, bg: ['#12283a', '#08141f', '#02060a'] },
    mirefen: { tiles: { grass: { tint: '#46662e', lift: 0, dark: 0.2, decor: 'moss' }, path: { tint: '#5a4c2c', lift: 0, dark: 0.1, decor: 'mud' }, rock: { tint: '#4a5e50', lift: 0, dark: 0.1, decor: 'mossrock' } }, bg: ['#0f2218', '#07120c', '#020504'] },
    cursed: { tiles: { grass: { tint: '#4a3a64', lift: 0, dark: 0.22, decor: 'curse' }, path: { tint: '#30243e', lift: 0, dark: 0.1, decor: 'rune' }, rock: { tint: '#2c1c48', lift: 0, dark: 0.05, decor: 'crystal' } }, bg: ['#1c0e2e', '#0b0516', '#030108'] }
  };

  function decorTop(g, kind, rnd, ox, oy, hw, hh, variant) {
    const pt = () => { let u, v; do { u = rnd() * 2 - 1; v = rnd() * 2 - 1; } while (Math.abs(u) + Math.abs(v) > 0.82); return [ox + u * hw, oy + v * hh]; };
    g.save(); g.beginPath(); g.moveTo(ox - hw, oy); g.lineTo(ox, oy - hh); g.lineTo(ox + hw, oy); g.lineTo(ox, oy + hh); g.closePath(); g.clip(); g.lineCap = 'round';
    const blot = (n, col, a, s0, s1) => { for (let i = 0; i < n; i++) { const [x, y] = pt(); g.fillStyle = rgba(col, a * (0.5 + rnd() * 0.5)); ell(g, x, y, s0 + rnd() * (s1 - s0), (s0 + rnd() * (s1 - s0)) * 0.5, rnd() * 0.6); g.fill(); } };
    const crack = (col, w, n) => { for (let i = 0; i < n; i++) { let [x, y] = pt(); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { x += (rnd() - 0.5) * 20; y += (rnd() - 0.3) * 9; g.lineTo(x, y); } g.stroke(); } };
    switch (kind) {
      case 'ash': blot(7, '#1c1714', 0.4, 5, 12); blot(5, '#8a817a', 0.25, 4, 9); crack('rgba(0,0,0,0.45)', 1, 2); for (let i = 0; i < 4; i++) { const [x, y] = pt(); g.fillStyle = 'rgba(255,120,30,0.5)'; g.fillRect(x, y, 1.6, 1.6); } break;
      case 'lava': blot(5, '#1a100c', 0.45, 6, 12); crack('#1a0a06', 3.2, 2); crack('rgba(255,90,20,0.55)', 2.4, 2); crack('#ffb300', 1, 3); break;
      case 'obsidian': blot(4, '#000000', 0.3, 6, 12); for (let i = 0; i < 3; i++) { const [x, y] = pt(); g.strokeStyle = 'rgba(255,100,40,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 9, y + 3); g.lineTo(x + 14, y - 3); g.stroke(); } blot(3, '#b79cd8', 0.18, 5, 9); break;
      case 'snow': blot(8, '#ffffff', 0.55, 7, 15); blot(5, '#a5c8e0', 0.25, 5, 10); for (let i = 0; i < 8; i++) { const [x, y] = pt(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(x, y, 1.6, 1.6); } break;
      case 'ice': for (let i = 0; i < 4; i++) { const [x, y] = pt(); g.strokeStyle = `rgba(255,255,255,${0.25 + rnd() * 0.3})`; g.lineWidth = 2 + rnd() * 2; g.beginPath(); g.moveTo(x - 10, y + 3); g.lineTo(x + 10, y - 3); g.stroke(); } crack('rgba(200,240,255,0.6)', 1, 3); blot(3, '#1b5f8a', 0.2, 6, 11); break;
      case 'icerock': blot(5, '#ffffff', 0.35, 6, 11); crack('rgba(255,255,255,0.45)', 1, 3); crack('rgba(20,70,110,0.4)', 1, 2); break;
      case 'moss': blot(8, '#1f3a14', 0.45, 6, 13); blot(6, '#8cbf4a', 0.28, 4, 9); for (let i = 0; i < 6; i++) { const [x, y] = pt(); g.strokeStyle = 'rgba(20,50,10,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1, y - 4); g.moveTo(x + 2, y); g.lineTo(x + 3, y - 3); g.stroke(); } break;
      case 'mud': blot(6, '#2c2214', 0.4, 6, 12); if (variant % 2 === 0) { const [x, y] = pt(); g.fillStyle = 'rgba(20,45,45,0.9)'; ell(g, x, y, 13, 6); g.fill(); g.fillStyle = 'rgba(110,170,160,0.55)'; ell(g, x - 2, y - 1, 9, 3.6); g.fill(); g.strokeStyle = 'rgba(210,240,230,0.7)'; g.lineWidth = 1; g.beginPath(); g.arc(x - 3, y - 1, 4, 3.6, 5.4); g.stroke(); } blot(3, '#7a6a40', 0.3, 3, 6); break;
      case 'mossrock': blot(6, '#5f8a3a', 0.5, 5, 11); crack('rgba(0,0,0,0.4)', 1, 2); break;
      case 'curse': blot(7, '#1a1228', 0.5, 6, 14); blot(4, '#7e57c2', 0.2, 6, 12); crack('rgba(150,100,255,0.4)', 1, 2); for (let i = 0; i < 2; i++) { const [x, y] = pt(); g.strokeStyle = 'rgba(230,225,215,0.7)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y - 1.5); g.stroke(); g.fillStyle = 'rgba(230,225,215,0.7)'; g.beginPath(); g.arc(x, y, 1.5, 0, TAU); g.arc(x + 6, y - 1.5, 1.5, 0, TAU); g.fill(); } break;
      case 'rune': blot(4, '#120c1c', 0.4, 6, 12); if (variant % 2 === 1) { g.strokeStyle = 'rgba(190,140,255,0.75)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(ox, oy - 8); g.lineTo(ox + 11, oy); g.lineTo(ox, oy + 8); g.lineTo(ox - 11, oy); g.closePath(); g.moveTo(ox, oy - 8); g.lineTo(ox, oy + 8); g.moveTo(ox - 11, oy); g.lineTo(ox + 11, oy); g.stroke(); } crack('rgba(160,110,255,0.35)', 1, 2); break;
      case 'crystal': for (let i = 0; i < 3; i++) { const [x, y] = pt(); g.fillStyle = 'rgba(190,140,255,0.45)'; poly(g, [x - 3, y, x, y - 8, x + 3, y]); g.fill(); } crack('rgba(200,150,255,0.55)', 1, 3); break;
      default: break;
    }
    g.restore();
  }

  function biomeTileSprite(eng, type, variant, elev) {
    const bio = eng._bio, cfg = bio && BIOMES[bio.biome] && BIOMES[bio.biome].tiles && BIOMES[bio.biome].tiles[type];
    const base = eng._origGetTileSprite(type, variant, elev);
    if (!cfg || !TravelVisuals.options.tiles) return base;
    const key = type + '|' + variant + '|' + elev + '|' + eng.dpr, hit = bio.sprites[key];
    if (hit) return hit;
    const c = document.createElement('canvas'); c.width = base.canvas.width; c.height = base.canvas.height;
    const g = c.getContext('2d');
    g.drawImage(base.canvas, 0, 0);
    g.globalCompositeOperation = 'color'; g.fillStyle = cfg.tint; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(base.canvas, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    if (cfg.lift) { g.fillStyle = `rgba(255,255,255,${cfg.lift})`; g.fillRect(0, 0, c.width, c.height); }
    if (cfg.dark) { g.fillStyle = `rgba(0,0,0,${cfg.dark})`; g.fillRect(0, 0, c.width, c.height); }
    g.globalCompositeOperation = 'source-over';
    g.save(); g.scale(eng.dpr, eng.dpr);
    const hw = eng.tileSize * COS30, hh = eng.tileSize * SIN30;
    decorTop(g, cfg.decor, rng(variant * 977 + type.length * 131 + elev), base.ox, base.oy, hw, hh, variant);
    g.restore();
    const sp = { canvas: c, ox: base.ox, oy: base.oy, w: base.w, h: base.h };
    bio.sprites[key] = sp; return sp;
  }

  // ==========================================================================
  //  4) ÇEVRE OBJELERİ  (origin = zemin noktası, s.scale ile ölçeklenir)
  // ==========================================================================
  const PROPS = {
    deadtree(g, s, t) {
      const cur = s.biome === 'cursed', trunk = cur ? '#3a2c48' : '#2a211c', trunkL = cur ? '#5d4a78' : '#4a3a30', sw = Math.sin(t * 1.4 + (s.swayOffset || 0)) * 1.4;
      g.lineCap = 'round'; g.lineJoin = 'round';
      const gr = g.createLinearGradient(-8, 0, 8, 0); gr.addColorStop(0, trunkL); gr.addColorStop(1, trunk);
      g.fillStyle = gr; g.beginPath(); g.moveTo(-9, 2); g.quadraticCurveTo(-5, -20, -3 + sw * 0.3, -46); g.lineTo(3 + sw * 0.3, -46); g.quadraticCurveTo(6, -20, 9, 2); g.closePath(); g.fill();
      g.strokeStyle = trunk; [[-1, -30, -20, -52], [1, -38, 18, -62], [0, -44, -8, -74], [1, -26, 15, -40], [-1, -20, -16, -30]].forEach(([d, y0, x1, y1], i) => { g.lineWidth = 4 - i * 0.5; g.beginPath(); g.moveTo(0, y0); g.quadraticCurveTo(x1 * 0.4 + sw, (y0 + y1) / 2 - 3, x1 + sw * 1.6, y1); g.stroke(); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x1 + sw * 1.6, y1); g.lineTo(x1 * 1.2 + sw * 2, y1 - 7); g.stroke(); });
      if (cur) { glow(g, -3, -22, 9, '#e040fb', 0.8); glow(g, 3, -22, 9, '#e040fb', 0.8); g.fillStyle = '#f3c8ff'; g.fillRect(-4.5, -23, 3, 2); g.fillRect(1.5, -23, 3, 2); }
      else { g.strokeStyle = 'rgba(255,100,30,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-2, -4); g.lineTo(1, -16); g.lineTo(-1, -28); g.stroke(); glow(g, 0, -14, 14, '#ff5a14', 0.3 + 0.15 * Math.sin(t * 3 + s.wx)); }
    },
    snowpine(g, s, t) {
      const sw = Math.sin(t * 1.6 + (s.swayOffset || 0)) * 1.6;
      g.fillStyle = '#4a3426'; g.fillRect(-4, -14, 8, 14);
      [[-8, 34, 46], [-24, 28, 36], [-38, 22, 28], [-50, 15, 20]].forEach(([y, w, h], i) => {
        const o = sw * (i + 1) * 0.3, gr = g.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, '#2f6a5c'); gr.addColorStop(1, '#14382f');
        g.fillStyle = gr; poly(g, [-w + o * 0.3, y, o, y - h * 0.9, w + o * 0.3, y]); g.fill();
        g.fillStyle = '#f2f9ff'; g.beginPath(); g.moveTo(-w * 0.62 + o * 0.5, y - h * 0.38); g.lineTo(o, y - h * 0.9); g.lineTo(w * 0.62 + o * 0.5, y - h * 0.38); g.quadraticCurveTo(w * 0.3, y - h * 0.2, 0, y - h * 0.34); g.quadraticCurveTo(-w * 0.3, y - h * 0.2, -w * 0.62 + o * 0.5, y - h * 0.38); g.fill();
      });
    },
    iceSpike(g, s, t) {
      glow(g, 0, -16, 34, '#6fd0ff', 0.28 + 0.08 * Math.sin(t * 2 + s.wx));
      [[-14, 0, 9, 30], [0, 2, 12, 52], [14, 0, 8, 26], [-5, 4, 7, 22], [8, 4, 6, 34]].forEach(([x, y, w, h], i) => {
        const gr = g.createLinearGradient(x - w, y, x + w, y - h); gr.addColorStop(0, '#2f8fc0'); gr.addColorStop(0.5, '#9fe2ff'); gr.addColorStop(1, '#ffffff');
        g.fillStyle = gr; g.globalAlpha = 0.92; poly(g, [x - w, y, x - w * 0.6, y - h * 0.7, x, y - h, x + w * 0.6, y - h * 0.7, x + w, y]); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - w * 0.3, y - 2); g.lineTo(x - w * 0.2, y - h * 0.75); g.stroke();
      });
    },
    frozenBoulder(g, s) {
      const gr = g.createLinearGradient(-20, -30, 20, 0); gr.addColorStop(0, '#9bb8cc'); gr.addColorStop(1, '#3e5668');
      g.fillStyle = gr; poly(g, [-24, 0, -20, -20, -8, -30, 10, -28, 22, -14, 26, 0]); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#f4fbff'; g.beginPath(); g.moveTo(-21, -17); g.lineTo(-8, -30); g.lineTo(10, -28); g.lineTo(21, -15); g.quadraticCurveTo(10, -19, 0, -21); g.quadraticCurveTo(-12, -16, -21, -17); g.fill();
    },
    obsidian(g, s, t) {
      glow(g, 0, -14, 30, '#ff5a14', 0.2 + 0.1 * Math.sin(t * 2.6 + s.wy));
      [[-10, 0, 9, 30], [4, 2, 12, 50], [16, 0, 7, 24], [-2, -2, 6, 22]].forEach(([x, y, w, h]) => {
        const gr = g.createLinearGradient(x - w, y, x + w, y - h); gr.addColorStop(0, '#0e0a12'); gr.addColorStop(1, '#4a3a5a');
        g.fillStyle = gr; poly(g, [x - w, y, x - w * 0.5, y - h * 0.8, x + 1, y - h, x + w * 0.7, y - h * 0.6, x + w, y]); g.fill();
        g.strokeStyle = 'rgba(255,110,40,0.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - w * 0.5, y - h * 0.8); g.lineTo(x + 1, y - h); g.lineTo(x + w * 0.7, y - h * 0.6); g.stroke();
      });
    },
    lavaVent(g, s, t) {
      const gr = g.createLinearGradient(0, -22, 0, 0); gr.addColorStop(0, '#4a3a36'); gr.addColorStop(1, '#1c1412');
      g.fillStyle = gr; poly(g, [-26, 0, -14, -20, 14, -20, 26, 0]); g.fill();
      g.fillStyle = '#ff6a1a'; ell(g, 0, -20, 12, 4); g.fill(); glow(g, 0, -20, 34, '#ff5a14', 0.55 + 0.2 * Math.sin(t * 3 + s.wx));
      for (let k = 0; k < 5; k++) { const ph = (t * 0.5 + k / 5) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.35; g.fillStyle = '#2a2420'; g.beginPath(); g.arc(Math.sin(k * 4 + t) * 5, -24 - ph * 50, 6 + ph * 10, 0, TAU); g.fill(); g.globalAlpha = 1; if (k % 2) glow(g, Math.sin(k * 7) * 12, -24 - ph * 40, 5, '#ffb300', Math.sin(ph * Math.PI)); }
    },
    willow(g, s, t) {
      g.fillStyle = '#3a2c1e'; g.beginPath(); g.moveTo(-10, 2); g.quadraticCurveTo(-6, -30, -3, -52); g.lineTo(4, -52); g.quadraticCurveTo(6, -28, 11, 2); g.fill();
      g.fillStyle = '#2d5a2a'; [[-18, -62, 22], [4, -70, 26], [22, -60, 20], [0, -56, 24]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); });
      g.fillStyle = '#3f7a38'; g.beginPath(); g.arc(-4, -72, 14, 0, TAU); g.fill();
      g.lineCap = 'round'; for (let k = 0; k < 16; k++) { const x = -34 + k * 4.4, len = 30 + hash2(k, s.wx) * 26, sw = Math.sin(t * 1.3 + k * 0.7) * 3; g.strokeStyle = k % 3 ? '#4f8f46' : '#7aab5a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -56); g.quadraticCurveTo(x + sw * 0.6, -56 + len * 0.5, x + sw, -56 + len); g.stroke(); }
      for (let k = 0; k < 3; k++) glow(g, Math.sin(t * 0.8 + k * 2) * 26, -30 + Math.cos(t * 0.6 + k) * 10, 6, '#d4ff6a', 0.5 + 0.4 * Math.sin(t * 3 + k));
    },
    reeds(g, s, t) {
      g.lineCap = 'round'; for (let k = 0; k < 9; k++) { const x = -16 + k * 4 + hash2(k, s.wy) * 3, h = 34 + hash2(k, s.wx) * 24, sw = Math.sin(t * 1.5 + k * 0.8 + (s.swayOffset || 0)) * 3; g.strokeStyle = k % 2 ? '#5f8a3a' : '#7aa84a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + sw * 0.4, -h * 0.5, x + sw, -h); g.stroke(); if (k % 3 === 0) { g.fillStyle = '#5a3a22'; ell(g, x + sw, -h + 4, 2.4, 7, sw * 0.05); g.fill(); } }
    },
    glowShroom(g, s, t) {
      [[-14, 0, 12, 18, '#2ee6c4'], [6, 2, 16, 28, '#ff5ec8'], [20, 0, 9, 14, '#2ee6c4']].forEach(([x, y, r, h, c], i) => {
        const pu = 0.6 + 0.4 * Math.sin(t * 2 + i * 1.7 + s.wx); glow(g, x, y - h - 4, r * 3, c, 0.3 * pu);
        g.fillStyle = '#d8d0b8'; g.fillRect(x - 2.4, y - h, 4.8, h);
        const gr = g.createRadialGradient(x, y - h - 2, 1, x, y - h, r + 3); gr.addColorStop(0, shade(c, 0.4)); gr.addColorStop(1, shade(c, -0.55));
        g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - h, r, r * 0.7, 0, Math.PI, 0); g.closePath(); g.fill();
        g.fillStyle = rgba('#ffffff', 0.8 * pu); [[-0.4, 0.2], [0.3, 0.35], [0.05, 0.55]].forEach(([u, v]) => { g.beginPath(); g.arc(x + u * r, y - h - v * r * 0.6, 1.4, 0, TAU); g.fill(); });
      });
    },
    tombstone(g, s, t) {
      const tilt = (hash2(s.wx, s.wy) - 0.5) * 0.25; g.save(); g.rotate(tilt);
      const gr = g.createLinearGradient(-12, 0, 12, 0); gr.addColorStop(0, '#6e6a78'); gr.addColorStop(1, '#2e2a38');
      g.fillStyle = gr; g.beginPath(); g.moveTo(-12, 0); g.lineTo(-12, -30); g.quadraticCurveTo(0, -42, 12, -30); g.lineTo(12, 0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 1; g.stroke(); g.strokeStyle = 'rgba(190,140,255,0.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -30); g.lineTo(0, -16); g.moveTo(-5, -25); g.lineTo(5, -25); g.stroke();
      g.fillStyle = '#3f5a2a'; ell(g, -8, -2, 6, 3); g.fill(); g.restore();
      const ph = (t * 0.35 + hash2(s.wx, 1)) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * 0.5; glow(g, Math.sin(t + s.wx) * 6, -34 - ph * 30, 12, '#b388ff', 1); g.globalAlpha = 1;
    },
    cursedCrystal(g, s, t) {
      const pu = 0.6 + 0.4 * Math.sin(t * 2.2 + s.wx); glow(g, 0, -20, 40, '#a040ff', 0.3 * pu);
      [[-12, 0, 8, 28], [2, 2, 12, 52], [15, 0, 8, 30], [-4, 4, 6, 20]].forEach(([x, y, w, h]) => {
        const gr = g.createLinearGradient(x - w, y, x + w, y - h); gr.addColorStop(0, '#2a1048'); gr.addColorStop(0.6, '#7a35d0'); gr.addColorStop(1, '#d9b3ff');
        g.fillStyle = gr; poly(g, [x - w, y, x - w * 0.6, y - h * 0.7, x, y - h, x + w * 0.6, y - h * 0.7, x + w, y]); g.fill();
        g.strokeStyle = rgba('#e8d0ff', 0.6 * pu + 0.2); g.lineWidth = 1; g.beginPath(); g.moveTo(x - w * 0.2, y - 2); g.lineTo(x, y - h); g.stroke();
      });
    },
    skullTotem(g, s, t) {
      g.fillStyle = '#2e2438'; g.fillRect(-3, -70, 6, 70);
      [-22, -40, -58].forEach((y, i) => { g.fillStyle = '#d8d0c0'; ell(g, 0, y, 8, 7); g.fill(); g.fillRect(-4.6, y + 3, 9.2, 4); g.fillStyle = '#120c18'; ell(g, -3, y - 0.5, 2, 2.4); g.fill(); ell(g, 3, y - 0.5, 2, 2.4); g.fill(); glow(g, -3, y - 0.5, 8, '#b84dff', 0.7 + 0.3 * Math.sin(t * 3 + i)); glow(g, 3, y - 0.5, 8, '#b84dff', 0.7 + 0.3 * Math.sin(t * 3 + i)); });
      g.strokeStyle = '#7a35d0'; g.lineWidth = 2; [-1, 1].forEach((d) => { g.beginPath(); g.moveTo(0, -66); g.quadraticCurveTo(d * 14, -58 + Math.sin(t * 2 + d) * 3, d * 12 + Math.sin(t * 3) * 3, -40); g.stroke(); });
    }
  };

  // Yere yatık dekalar (gölet, lav havuzu, buz, rün çemberi) — zemin ile varlıklar arasında çizilir
  function drawDecals(eng, ctx) {
    const bio = eng._bio; if (!bio || !bio.decals.length) return; const t = eng.time;
    for (const d of bio.decals) {
      const p = eng.iso(d.wx, d.wy, 0); if (p.x < -140 || p.x > eng.width + 140 || p.y < -100 || p.y > eng.height + 100) continue;
      const rx = d.r * 1.2247, ry = d.r * 0.7071; ctx.save(); ctx.translate(p.x, p.y);
      if (d.type === 'pond') {
        ctx.fillStyle = '#2a2414'; ell(ctx, 0, 1, rx * 1.1, ry * 1.1); ctx.fill();
        const gr = ctx.createRadialGradient(-rx * 0.25, -ry * 0.3, 2, 0, 0, rx); gr.addColorStop(0, '#4a8f8a'); gr.addColorStop(0.7, '#1f5a55'); gr.addColorStop(1, '#123a38');
        ctx.fillStyle = gr; ell(ctx, 0, 0, rx, ry); ctx.fill();
        for (let k = 0; k < 3; k++) { const q = (t * 0.35 + k / 3 + d.seed) % 1; ctx.strokeStyle = `rgba(200,240,230,${(1 - q) * 0.4})`; ctx.lineWidth = 1; ell(ctx, Math.sin(d.seed * 9 + k) * rx * 0.3, Math.cos(d.seed * 7 + k) * ry * 0.3, rx * 0.5 * q, ry * 0.5 * q); ctx.stroke(); }
        ctx.fillStyle = '#3f7a2e'; [[-0.4, 0.1], [0.3, -0.2], [0.1, 0.35]].forEach(([u, v], i) => { ell(ctx, u * rx, v * ry, 7, 3.6, 0.2 * i); ctx.fill(); });
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ell(ctx, -rx * 0.3, -ry * 0.4, rx * 0.3, ry * 0.12); ctx.fill();
      } else if (d.type === 'lava') {
        ctx.fillStyle = '#1a0e0a'; ell(ctx, 0, 1, rx * 1.12, ry * 1.12); ctx.fill();
        const pu = 0.75 + 0.25 * Math.sin(t * 2 + d.seed * 5), gr = ctx.createRadialGradient(0, 0, 2, 0, 0, rx); gr.addColorStop(0, '#fff0a0'); gr.addColorStop(0.35, '#ffb300'); gr.addColorStop(0.75, '#e64a19'); gr.addColorStop(1, '#7a1a0a');
        ctx.fillStyle = gr; ell(ctx, 0, 0, rx, ry); ctx.fill(); glow(ctx, 0, -4, rx * 1.6, '#ff5a14', 0.45 * pu);
        ctx.fillStyle = 'rgba(30,14,10,0.7)'; for (let k = 0; k < 4; k++) { const a = k * 1.9 + t * 0.15 + d.seed; ell(ctx, Math.cos(a) * rx * 0.5, Math.sin(a) * ry * 0.5, rx * 0.22, ry * 0.2, a); ctx.fill(); }
      } else if (d.type === 'ice') {
        const gr = ctx.createLinearGradient(-rx, -ry, rx, ry); gr.addColorStop(0, '#d9f3ff'); gr.addColorStop(1, '#6fb4da');
        ctx.fillStyle = gr; ell(ctx, 0, 0, rx, ry); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = 'rgba(60,120,170,0.6)'; ctx.beginPath(); ctx.moveTo(-rx * 0.6, 0); ctx.lineTo(-rx * 0.1, -ry * 0.3); ctx.lineTo(rx * 0.3, ry * 0.2); ctx.lineTo(rx * 0.7, -ry * 0.1); ctx.stroke();
        const tw = Math.max(0, Math.sin(t * 2 + d.seed * 8)); if (tw > 0.7) glow(ctx, rx * 0.2, -ry * 0.2, 10, '#ffffff', tw);
      } else if (d.type === 'rune') {
        const pu = 0.6 + 0.4 * Math.sin(t * 1.6 + d.seed * 6); glowE(ctx, 0, 0, rx * 1.2, ry * 1.2, '#8a3cff', 0.28 * pu);
        ctx.strokeStyle = rgba('#c58bff', 0.65 * pu + 0.2); ctx.lineWidth = 1.6; ell(ctx, 0, 0, rx, ry); ctx.stroke(); ell(ctx, 0, 0, rx * 0.78, ry * 0.78); ctx.stroke();
        for (let k = 0; k < 6; k++) { const a = t * 0.3 + k * TAU / 6; ctx.fillStyle = rgba('#e8d0ff', 0.8 * pu); const x = Math.cos(a) * rx * 0.88, y = Math.sin(a) * ry * 0.88; poly(ctx, [x, y - 3, x + 2, y, x, y + 3, x - 2, y]); ctx.fill(); }
        ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = -t * 0.2 + k * TAU * 2 / 5, x = Math.cos(a) * rx * 0.78, y = Math.sin(a) * ry * 0.78; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke();
      } else if (d.type === 'bones') {
        ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; for (let k = 0; k < 5; k++) { const a = hash2(k, d.seed) * TAU, x = Math.cos(a) * rx * 0.5, y = Math.sin(a) * ry * 0.5; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y - 2); ctx.stroke(); }
        ctx.fillStyle = '#d8d0c0'; ell(ctx, 4, -2, 6, 5); ctx.fill(); ctx.fillStyle = '#120c18'; ell(ctx, 2, -3, 1.6, 2); ctx.fill(); ell(ctx, 6.4, -3, 1.6, 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  // Animasyonlu zemin ışıkları (lav çatlağı nabzı, buz parıltısı, rün titremesi)
  function drawTileLife(eng, ctx) {
    const bio = eng._bio; if (!bio || bio.biome === 'verdant') return; const t = eng.time, b = bio.biome;
    for (const tile of eng.tiles) {
      if (tile.variant > 1 || tile.type === 'grass' && b !== 'cursed' && b !== 'frozen') continue;
      const p = eng.iso(tile.wx, tile.wy, tile.wz); if (p.x < -80 || p.x > eng.width + 80 || p.y < -60 || p.y > eng.height + 60) continue;
      const h = hash2(tile.gx * 3.1, tile.gy * 1.7);
      if (b === 'ashen' && (tile.type === 'path' || tile.type === 'rock')) glow(ctx, p.x, p.y, 34, '#ff5a14', 0.1 + 0.09 * Math.sin(t * 2 + h * 9));
      else if (b === 'frozen' && tile.type === 'path') { const tw = Math.max(0, Math.sin(t * 2.4 + h * 20)); if (tw > 0.8) glow(ctx, p.x + (h - 0.5) * 40, p.y + (h - 0.5) * 12, 9, '#ffffff', tw); }
      else if (b === 'mirefen' && tile.type === 'path') { const q = (t * 0.4 + h) % 1; ctx.strokeStyle = `rgba(200,240,230,${(1 - q) * 0.35})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.x + (h - 0.5) * 30, p.y + 2, 14 * q, 6 * q, 0, 0, TAU); ctx.stroke(); }
      else if (b === 'cursed' && (tile.type === 'path' || tile.type === 'rock')) glow(ctx, p.x, p.y, 30, '#8a3cff', 0.07 + 0.07 * Math.sin(t * 1.8 + h * 9));
    }
  }

  // ==========================================================================
  //  5) HAVA / ATMOSFER (ekran uzayı)
  // ==========================================================================
  function initWeather(eng) {
    const b = eng._bio.biome, W = eng.width, H = eng.height, r = rng(42), P = [];
    const mk = (n, f) => { for (let i = 0; i < n; i++) P.push(f(i)); };
    if (b === 'frozen') mk(130, () => ({ k: 'snow', x: r() * W, y: r() * H, s: 1 + r() * 2.4, v: 24 + r() * 46, ph: r() * 10 }));
    if (b === 'ashen') { mk(80, () => ({ k: 'ash', x: r() * W, y: r() * H, s: 1 + r() * 2.2, v: 14 + r() * 28, ph: r() * 10 })); mk(34, () => ({ k: 'ember', x: r() * W, y: r() * H, s: 1 + r() * 1.6, v: 30 + r() * 50, ph: r() * 10 })); }
    if (b === 'mirefen') { mk(6, () => ({ k: 'fog', x: r() * W, y: r() * H, s: 150 + r() * 160, v: 6 + r() * 10, ph: r() }));  mk(26, () => ({ k: 'fly', x: r() * W, y: r() * H, s: 1.6 + r(), v: 6 + r() * 10, ph: r() * 10 })); mk(45, () => ({ k: 'rain', x: r() * W, y: r() * H, s: 8 + r() * 8, v: 380 + r() * 120, ph: 0 })); }
    if (b === 'cursed') { mk(34, () => ({ k: 'wisp', x: r() * W, y: r() * H, s: 2 + r() * 2.6, v: 14 + r() * 26, ph: r() * 10 })); mk(6, () => ({ k: 'glyph', x: r() * W, y: r() * H, s: 8 + r() * 8, v: 8 + r() * 10, ph: r() * 10 })); }
    eng._bio.parts = P; eng._bio.lastT = eng.time; eng._bio.flash = 0; eng._bio.nextFlash = eng.time + 6 + r() * 6;
  }

  function drawWeather(eng, ctx) {
    const bio = eng._bio; if (!bio || bio.biome === 'verdant' || !TravelVisuals.options.weather) return;
    if (!bio.inited) { initWeather(eng); bio.inited = true; }
    const W = eng.width, H = eng.height, t = eng.time, dt = clamp(t - bio.lastT, 0, 0.1); bio.lastT = t; const b = bio.biome;
    ctx.save();
    const tint = { ashen: ['rgba(255,70,10,0.07)', 'rgba(255,90,20,0.22)'], frozen: ['rgba(150,210,255,0.08)', 'rgba(210,240,255,0.2)'], mirefen: ['rgba(60,140,80,0.09)', 'rgba(120,180,120,0.16)'], cursed: ['rgba(110,40,200,0.11)', 'rgba(150,60,255,0.18)'] }[b];
    ctx.fillStyle = tint[0]; ctx.fillRect(0, 0, W, H);
    const gr = ctx.createLinearGradient(0, H * 0.6, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, tint[1]); ctx.fillStyle = gr; ctx.fillRect(0, H * 0.6, W, H * 0.4);
    for (const q of bio.parts) {
      switch (q.k) {
        case 'snow': q.y += q.v * dt; q.x += Math.sin(t + q.ph) * 12 * dt + 8 * dt; if (q.y > H + 4) { q.y = -4; q.x = Math.random() * W; } ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(q.x, q.y, q.s, 0, TAU); ctx.fill(); break;
        case 'ash': q.y += q.v * dt; q.x += (14 + Math.sin(t * 0.8 + q.ph) * 10) * dt; if (q.y > H + 4 || q.x > W + 4) { q.y = -4; q.x = Math.random() * W; } ctx.fillStyle = 'rgba(190,180,170,0.55)'; ctx.fillRect(q.x, q.y, q.s, q.s * 0.7); break;
        case 'ember': q.y -= q.v * dt; q.x += Math.sin(t * 2 + q.ph) * 14 * dt; if (q.y < -6) { q.y = H + 6; q.x = Math.random() * W; } glow(ctx, q.x, q.y, q.s * 4.5, '#ff7a1a', 0.7 + 0.3 * Math.sin(t * 6 + q.ph)); break;
        case 'fog': q.x += q.v * dt; if (q.x > W + q.s) q.x = -q.s; { const g2 = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.s); g2.addColorStop(0, 'rgba(170,215,180,0.10)'); g2.addColorStop(1, 'rgba(170,215,180,0)'); ctx.fillStyle = g2; ctx.fillRect(q.x - q.s, q.y - q.s, q.s * 2, q.s * 2); } break;
        case 'fly': q.x += Math.sin(t * 0.7 + q.ph) * q.v * dt; q.y += Math.cos(t * 0.9 + q.ph) * q.v * dt; glow(ctx, q.x, q.y, q.s * 5, '#d4ff6a', 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.4 + q.ph))); break;
        case 'rain': q.y += q.v * dt; q.x -= 40 * dt; if (q.y > H) { q.y = -10; q.x = Math.random() * (W + 80); } ctx.strokeStyle = 'rgba(190,225,230,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - 2, q.y + q.s); ctx.stroke(); break;
        case 'wisp': q.y -= q.v * dt; q.x += Math.sin(t * 1.2 + q.ph) * 18 * dt; if (q.y < -10) { q.y = H + 10; q.x = Math.random() * W; } glow(ctx, q.x, q.y, q.s * 5, q.ph > 5 ? '#e040fb' : '#a070ff', 0.45 + 0.3 * Math.sin(t * 3 + q.ph)); break;
        case 'glyph': q.y -= q.v * dt; q.ph += dt * 0.6; if (q.y < -20) { q.y = H + 20; q.x = Math.random() * W; } ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.ph); ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 + q.ph * 3); ctx.strokeStyle = '#c58bff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -q.s); ctx.lineTo(q.s * 0.7, 0); ctx.lineTo(0, q.s); ctx.lineTo(-q.s * 0.7, 0); ctx.closePath(); ctx.moveTo(0, -q.s); ctx.lineTo(0, q.s); ctx.stroke(); ctx.restore(); break;
        default: break;
      }
    }
    if (b === 'cursed') { // ara sıra mor yıldırım parlaması
      if (t > bio.nextFlash) { bio.flash = 1; bio.nextFlash = t + 7 + Math.random() * 9; }
      if (bio.flash > 0) { ctx.fillStyle = `rgba(190,150,255,${bio.flash * 0.22})`; ctx.fillRect(0, 0, W, H); bio.flash = Math.max(0, bio.flash - dt * 3); }
    }
    ctx.restore();
  }

  // ==========================================================================
  //  6) MOTOR YAMALARI
  // ==========================================================================
  function setupBio(eng) {
    eng._bio = { biome: detectBiome(eng.zoneName), inited: false, sprites: {}, decals: [], parts: [], lastT: eng.time || 0, flash: 0, nextFlash: 0 };
  }

  function remapScenery(eng) {
    const bio = eng._bio, b = bio.biome; bio.decals = []; if (b === 'verdant' || !TravelVisuals.options.scenery) return;
    const r = rng(b.length * 7919 + 13), R = eng.mapRadius * eng.tileSize;
    const MAP = {
      ashen: { tree: ['deadtree'], boulder: ['obsidian'], mushroom: ['lavaVent'] },
      frozen: { tree: ['snowpine'], boulder: ['frozenBoulder', 'iceSpike'], mushroom: ['iceSpike'] },
      mirefen: { tree: ['willow', 'willow', 'deadtree'], boulder: ['reeds'], mushroom: ['glowShroom'] },
      cursed: { tree: ['deadtree', 'deadtree', 'skullTotem'], boulder: ['cursedCrystal', 'tombstone'], mushroom: ['tombstone'] }
    }[b];
    eng.scenery = eng.scenery.filter((s) => !(b !== 'verdant' && (s.type === 'boulder' || s.type === 'mushroom') && hash2(s.wx * 0.11, s.wy * 0.17) > 0.5));
    eng.scenery.forEach((s) => {
      const list = MAP[s.type]; if (!list) return;
      s.origType = s.type; s.type = list[Math.floor(hash2(s.wx * 0.37, s.wy * 0.53) * list.length) % list.length]; s.biome = b;
      if (s.type === 'reeds' || s.type === 'glowShroom') s.scale *= 1.1;
    });
    const place = (n, fn) => { let tries = 0, c = 0; while (c < n && tries++ < 400) { const a = r() * TAU, d = 150 + r() * (R * 0.78), wx = Math.cos(a) * d, wy = Math.sin(a) * d, gx = wx / eng.tileSize, gy = wy / eng.tileSize; if (Math.abs(gx + gy) <= 1.8 || Math.hypot(wx, wy - 120) < 70) continue; fn(wx, wy); c++; } };
    const dec = (type, lo, hi) => (wx, wy) => bio.decals.push({ type, wx, wy, r: lo + r() * (hi - lo), seed: r() });
    if (b === 'mirefen') { place(7, dec('pond', 38, 70)); place(16, (wx, wy) => eng.scenery.push({ type: 'reeds', wx, wy, scale: 0.8 + r() * 0.5, swayOffset: r() * TAU, biome: b })); }
    if (b === 'ashen') { place(5, dec('lava', 30, 55)); place(7, (wx, wy) => eng.scenery.push({ type: 'deadtree', wx, wy, scale: 0.7 + r() * 0.5, swayOffset: r() * TAU, biome: b })); }
    if (b === 'frozen') { place(6, dec('ice', 40, 80)); place(8, (wx, wy) => eng.scenery.push({ type: 'iceSpike', wx, wy, scale: 0.6 + r() * 0.5, biome: b })); }
    if (b === 'cursed') { place(4, dec('rune', 45, 70)); place(6, dec('bones', 22, 34)); place(8, (wx, wy) => eng.scenery.push({ type: 'tombstone', wx, wy, scale: 0.8 + r() * 0.4, biome: b })); }
    eng.scenery.sort((a, c) => (a.wx + a.wy) - (c.wx + c.wy));
  }


  // ==========================================================================
  //  7) YENİ EFEKTLER (12 adet) — aynı imza: fx.isim(ctx, sx, sy, p, { color, radius, angle })
  //     radius = efektin yarıçapı (piksel). Hepsi ~60-100px'lik tipik bir skill boyuna göre ayarlı.
  //     Ek ölçek için oynatırken { scale: 1.3 } verilebilir.
  // ==========================================================================
  Object.assign(fx, {
    // Meteor: gölge işareti -> gökten düşen ateş topu -> çarpma + krater
    meteorStrike(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 85, col = o.color || '#ff7a1a', hit = 0.45, r = rng(21);
      ctx.save(); ctx.translate(sx, sy);
      if (p < hit) {
        const q = p / hit, e = q * q, x = 150 * (1 - e), y = -380 * (1 - e) - 10;
        ctx.strokeStyle = rgba(col, 0.35 + 0.4 * q); ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ell(ctx, 0, 0, R * 0.9, R * 0.45); ctx.stroke(); ctx.setLineDash([]);
        glowE(ctx, 0, 0, R * q, R * q * 0.5, col, 0.35 * q);
        for (let i = 0; i < 16; i++) { const u = i / 16, tx = x + 150 * u * 0.55, ty = y - 380 * u * 0.55; glow(ctx, tx, ty, 26 * (1 - u) + 6, i % 2 ? '#ffb300' : col, 0.55 * (1 - u)); }
        glow(ctx, x, y, 46, col, 0.9); ctx.fillStyle = '#4a2a1a'; ctx.beginPath(); ctx.arc(x, y, 15, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(x - 3, y + 3, 9, 0, TAU); ctx.fill();
      } else {
        const b = (p - hit) / (1 - hit), e = easeOut(b), fade = 1 - smooth(0.5, 1, b);
        ctx.fillStyle = rgba('#120a06', 0.6 * (1 - b * 0.4)); ell(ctx, 0, 0, R * 0.55, R * 0.28); ctx.fill();
        glowE(ctx, 0, 0, R * 1.3 * e + 10, R * 0.65 * e + 5, col, 0.7 * fade);
        ctx.strokeStyle = rgba('#ffd54f', 0.95 * fade); ctx.lineWidth = 6 * (1 - b) + 1; ell(ctx, 0, 0, R * e, R * e * 0.5); ctx.stroke();
        glow(ctx, 0, -22 * (1 - b), R * 0.9 * (1 - b) + 14, '#fff3c4', 0.8 * (1 - b));
        for (let i = 0; i < 14; i++) { const a = r() * TAU, sp = 40 + r() * 70, x = Math.cos(a) * sp * b, y = Math.sin(a) * sp * b * 0.5 - Math.sin(Math.min(1, b * 1.2) * Math.PI) * (30 + r() * 40); glow(ctx, x, y, 7, r() > 0.5 ? '#ffb300' : col, fade); }
      }
      ctx.restore();
    },
    // Kutsal ışın: gökten inen ışık sütunu + yükselen halkalar
    holyBeam(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 60, col = o.color || '#fff59d', up = easeOut(Math.min(1, p / 0.2)), fade = 1 - smooth(0.7, 1, p), w = R * 0.55 * (0.85 + 0.15 * Math.sin(p * 40)), r = rng(2);
      ctx.save(); ctx.translate(sx, sy); ctx.globalCompositeOperation = 'lighter';
      glowE(ctx, 0, 0, R * 1.3, R * 0.65, col, 0.6 * fade);
      const g = ctx.createLinearGradient(0, -420 * up, 0, 0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.6, rgba(col, 0.45 * fade)); g.addColorStop(1, rgba('#ffffff', 0.85 * fade));
      ctx.fillStyle = g; ctx.fillRect(-w, -420 * up, w * 2, 420 * up); ctx.fillStyle = rgba('#ffffff', 0.6 * fade); ctx.fillRect(-w * 0.35, -420 * up, w * 0.7, 420 * up);
      for (let k = 0; k < 4; k++) { const q = (p * 2 + k / 4) % 1; ctx.strokeStyle = rgba(col, (1 - q) * 0.8 * fade); ctx.lineWidth = 2; ell(ctx, 0, -q * 150, R * (0.9 - q * 0.4), R * (0.9 - q * 0.4) * 0.5); ctx.stroke(); }
      for (let k = 0; k < 14; k++) { const ph = (p * 1.6 + r()) % 1; glow(ctx, (r() - 0.5) * R * 1.6, -ph * 160, 6, col, Math.sin(ph * Math.PI) * fade); }
      ctx.restore();
    },
    // Ateş sütunu: yerden fışkıran alev kolonu
    firePillar(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 55, col = o.color || '#ff6a1a', grow = easeOut(Math.min(1, p / 0.25)), fade = 1 - smooth(0.75, 1, p), r = rng(8);
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.4, R * 0.7, col, 0.7 * fade); ctx.strokeStyle = rgba('#ffd54f', 0.8 * fade); ctx.lineWidth = 2; ell(ctx, 0, 0, R * grow, R * grow * 0.5); ctx.stroke();
      for (let i = 0; i < 28; i++) {
        const ph = (p * 3 + i / 28) % 1, h = ph * 150 * grow, x = Math.sin(i * 5.3 + p * 14) * R * 0.45 * (1 - ph * 0.6), s = (R * 0.5 + 6) * (1 - ph * 0.8);
        glow(ctx, x, -h - 6, s, ph < 0.3 ? '#fff3c4' : ph < 0.6 ? '#ffb300' : col, Math.sin(ph * Math.PI) * 0.85 * fade);
      }
      glow(ctx, 0, -10, R, '#fff3c4', 0.6 * fade); ctx.restore();
    },
    // Hortum: dönen huni + savrulan toz
    tornado(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 55, col = o.color || '#b0bec5', grow = easeOut(Math.min(1, p / 0.2)), fade = 1 - smooth(0.8, 1, p), a0 = p * 26, wob = Math.sin(p * 12) * 6;
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.2, R * 0.6, col, 0.25 * fade);
      for (let i = 0; i < 18; i++) {
        const u = i / 17, y = -u * 130 * grow, rad = (R * 0.25 + u * R * 0.75) * grow, cx = wob * u;
        ctx.strokeStyle = rgba(i % 2 ? '#eceff1' : col, (0.25 + 0.4 * (1 - u)) * fade); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(cx, y, rad, rad * 0.32, 0, a0 + i, a0 + i + Math.PI * 1.15); ctx.stroke();
      }
      for (let k = 0; k < 14; k++) { const u = (p * 2 + k / 14) % 1, a = a0 * 1.4 + k * 1.9, rad = (R * 0.3 + u * R * 0.9) * grow; ctx.fillStyle = rgba('#6d5a48', 0.8 * fade); ctx.fillRect(Math.cos(a) * rad + wob * u, -u * 130 * grow + Math.sin(a) * rad * 0.32, 3, 3); }
      ctx.restore();
    },
    // Yıldırım düşmesi: işaret -> gökten çakan şimşek -> yanık iz
    thunderStrike(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 70, col = o.color || '#b388ff', hit = 0.4, fr = Math.floor(p * 24), fade = 1 - smooth(0.6, 1, p);
      ctx.save(); ctx.translate(sx, sy);
      ctx.strokeStyle = rgba(col, p < hit ? 0.3 + 0.5 * (p / hit) : 0.6 * fade); ctx.lineWidth = 1.6; ctx.setLineDash([4, 4]); ell(ctx, 0, 0, R * (p < hit ? p / hit : 1), R * 0.5 * (p < hit ? p / hit : 1)); ctx.stroke(); ctx.setLineDash([]);
      if (p >= hit) {
        const b = (p - hit) / (1 - hit), r = rng(fr * 13 + 1); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        if (b < 0.45) { [[7, 0.45, 8], [3, 1, 2.4]].forEach(([w, a, jit], k) => { ctx.beginPath(); ctx.moveTo(10, -420); for (let i = 1; i < 12; i++) ctx.lineTo(10 * (1 - i / 12) + (r() - 0.5) * 22, -420 + i * 35); ctx.lineTo(0, 0); ctx.strokeStyle = rgba(k ? '#ffffff' : col, a * (1 - b)); ctx.lineWidth = w; ctx.stroke(); }); glow(ctx, 0, -6, 60 * (1 - b) + 20, '#ffffff', 0.9 * (1 - b)); }
        ctx.fillStyle = rgba('#0a0610', 0.5 * fade); ell(ctx, 0, 0, R * 0.4, R * 0.2); ctx.fill();
        ctx.strokeStyle = rgba(col, 0.9 * (1 - b)); ctx.lineWidth = 4 * (1 - b) + 1; ell(ctx, 0, 0, R * easeOut(b), R * easeOut(b) * 0.5); ctx.stroke(); glowE(ctx, 0, 0, R * 1.2 * easeOut(b), R * 0.6 * easeOut(b), col, 0.5 * (1 - b));
        for (let i = 0; i < 8; i++) { const a = r() * TAU, d = R * 0.9 * easeOut(b) * r(); ctx.strokeStyle = rgba('#e8d0ff', (1 - b)); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d * 0.5); ctx.lineTo(Math.cos(a) * (d + 12), Math.sin(a) * (d + 12) * 0.5 - 4); ctx.stroke(); }
      }
      ctx.restore();
    },
    // Gölge dalları: yerden çıkan pençeli karanlık kollar
    shadowTendrils(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 70, col = o.color || '#9c4dff', grow = easeOut(Math.min(1, p / 0.3)), fade = 1 - smooth(0.7, 1, p);
      ctx.save(); ctx.translate(sx, sy); ctx.lineCap = 'round';
      ctx.fillStyle = rgba('#05020a', 0.6 * fade); ell(ctx, 0, 0, R, R * 0.5); ctx.fill(); glowE(ctx, 0, 0, R * 1.2, R * 0.6, col, 0.35 * fade);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + 0.3, bx = Math.cos(a) * R * 0.7, by = Math.sin(a) * R * 0.35, h = (55 + (i % 3) * 22) * grow, sw = Math.sin(p * 9 + i * 1.3) * 12, tx = bx + sw + Math.cos(a) * 10, ty = by - h;
        ctx.strokeStyle = rgba('#14081f', 0.95 * fade); ctx.lineWidth = 8 * (1 - 0.0); ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx - sw, by - h * 0.55, tx, ty); ctx.stroke();
        ctx.strokeStyle = rgba(col, 0.55 * fade); ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = rgba('#1a0a2a', fade); poly(ctx, [tx - 4, ty + 4, tx + sw * 0.1, ty - 14, tx + 4, ty + 4]); ctx.fill(); glow(ctx, tx, ty - 6, 10, col, 0.8 * fade);
      }
      ctx.restore();
    },
    // Sarmaşık kıskacı: dikenli kökler yerden fırlar, dönerek yükselir
    vineGrasp(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 60, col = o.color || '#76ff03', grow = easeOut(Math.min(1, p / 0.35)), fade = 1 - smooth(0.75, 1, p);
      ctx.save(); ctx.translate(sx, sy); ctx.lineCap = 'round';
      glowE(ctx, 0, 0, R * 1.2, R * 0.6, col, 0.25 * fade);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU, bx = Math.cos(a) * R * 0.75, by = Math.sin(a) * R * 0.375, N = 12;
        const pts = []; for (let k = 0; k <= N; k++) { const u = k / N * grow, ang = u * 5 + i, x = bx * (1 - u * 0.7) + Math.cos(ang) * 9 * u, y = by * (1 - u * 0.7) - u * 85 + Math.sin(ang) * 4 * u; pts.push([x, y]); }
        ctx.strokeStyle = rgba('#3a2a14', fade); ctx.lineWidth = 6; ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        ctx.strokeStyle = rgba('#5a8a2a', fade); ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = rgba('#d8e8a0', fade); pts.forEach(([x, y], k) => { if (k % 3 === 2) poly(ctx, [x - 2, y, x + (k % 2 ? 6 : -6), y - 5, x + 1, y + 2]), ctx.fill(); });
        const [tx, ty] = pts[pts.length - 1]; ctx.fillStyle = rgba('#ff80ab', fade); ctx.beginPath(); ctx.arc(tx, ty, 4 * grow, 0, TAU); ctx.fill(); glow(ctx, tx, ty, 12, col, 0.7 * fade);
      }
      ctx.restore();
    },
    // Buz duvarı: bir doğrultuda dizilen kristaller sırayla yükselir, sonda parçalanır
    iceWall(ctx, sx, sy, p, o = {}) {
      const L = (o.radius || 70) * 1.5, ang = o.angle || 0, col = o.color || '#9fe2ff', N = 9, shat = smooth(0.82, 1, p), r = rng(17);
      ctx.save(); ctx.translate(sx, sy);
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1) - 0.5, x = Math.cos(ang) * u * L * 2, y = Math.sin(ang) * u * L, rise = easeOut(clamp(p * 3 - Math.abs(u) * 1.2, 0, 1)), h = (38 + (i % 3) * 14) * rise * (1 - shat), w = 9 + (i % 2) * 3;
        glowE(ctx, x, y, 16, 7, col, 0.35 * rise);
        if (h > 1) { const g = ctx.createLinearGradient(x, y, x, y - h); g.addColorStop(0, '#3a9ad0'); g.addColorStop(0.6, col); g.addColorStop(1, '#ffffff'); ctx.fillStyle = g; ctx.globalAlpha = 0.93; poly(ctx, [x - w, y, x - w * 0.55, y - h * 0.75, x, y - h, x + w * 0.55, y - h * 0.75, x + w, y]); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - 2); ctx.lineTo(x - w * 0.15, y - h * 0.8); ctx.stroke(); }
        if (shat > 0) for (let k = 0; k < 3; k++) { const a = r() * TAU, d = shat * (20 + r() * 30); ctx.globalAlpha = 1 - shat; ctx.fillStyle = '#d9f4ff'; poly(ctx, [x + Math.cos(a) * d - 3, y - 20 + Math.sin(a) * d * 0.5 + 3 + shat * 24, x + Math.cos(a) * d, y - 24 + Math.sin(a) * d * 0.5 + shat * 24, x + Math.cos(a) * d + 3, y - 20 + Math.sin(a) * d * 0.5 + shat * 24]); ctx.fill(); ctx.globalAlpha = 1; }
      }
      ctx.restore();
    },
    // Bıçak fırtınası: karakterden dışa spiral açılıp geri dönen bıçaklar
    bladeStorm(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 80, col = o.color || '#80d8ff', fade = 1 - smooth(0.85, 1, p), out = Math.sin(Math.min(1, p / 0.9) * Math.PI);
      ctx.save(); ctx.translate(sx, sy - 16);
      ctx.strokeStyle = rgba(col, 0.35 * fade); ctx.lineWidth = 1; ctx.save(); ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, R * out, 0, TAU); ctx.stroke(); ctx.restore();
      for (let i = 0; i < 12; i++) {
        const a = p * TAU * 3 + i * TAU / 12, d = R * out * (0.45 + 0.55 * ((i % 3) / 2)), x = Math.cos(a) * d, y = Math.sin(a) * d * 0.5;
        for (let k = 1; k < 5; k++) { const a2 = a - k * 0.12; glow(ctx, Math.cos(a2) * d, Math.sin(a2) * d * 0.5, 7 - k, col, 0.4 * fade / k); }
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2 + 0.5); ctx.globalAlpha = fade; const g = ctx.createLinearGradient(0, -12, 0, 8); g.addColorStop(0, '#ffffff'); g.addColorStop(1, col);
        ctx.fillStyle = g; poly(ctx, [0, -12, 3, -2, 0, 8, -3, -2]); ctx.fill(); ctx.fillStyle = '#ffd54f'; ctx.fillRect(-4, 4, 8, 2); ctx.restore();
      }
      glow(ctx, 0, 0, R * 0.8 * out + 6, col, 0.2 * fade); ctx.restore();
    },
    // Yıldız yağmuru: çapraz düşen yıldızlar, çarpınca parlama
    starfall(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 85, col = o.color || '#ffe57f', r = rng(33);
      ctx.save(); ctx.translate(sx, sy);
      for (let i = 0; i < 8; i++) {
        const tx = (r() - 0.5) * R * 1.6, ty = (r() - 0.5) * R * 0.8, st = 0.05 + i * 0.09, q = (p - st) / 0.28; if (q < 0 || q > 1.8) continue;
        if (q < 1) { const e = q * q, x = tx + 90 * (1 - e), y = ty - 300 * (1 - e); for (let k = 1; k < 9; k++) glow(ctx, x + k * 5, y - k * 15, 10 - k, col, 0.5 / k); glow(ctx, x, y, 22, col, 0.9); ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(x, y); ctx.rotate(q * 8); starPath(ctx, 0, 0, 8, 5, 0.45); ctx.fill(); ctx.restore(); }
        else { const b = q - 1; ctx.strokeStyle = rgba(col, (1 - b / 0.8) * 0.9); ctx.lineWidth = 2; ell(ctx, tx, ty, 8 + b * 40, (8 + b * 40) * 0.5); ctx.stroke(); glow(ctx, tx, ty - 6, 24 * (1 - b / 0.8), '#ffffff', 0.8 * (1 - b / 0.8)); }
      }
      ctx.restore();
    },
    // Çekim alanı: karanlık disk, içe doğru spiral akan parçacıklar, sonda çökme patlaması
    gravityWell(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 80, col = o.color || '#7c4dff', up = easeOut(Math.min(1, p / 0.15)), collapse = smooth(0.82, 1, p), r = rng(5), s = R * up * (1 - collapse * 0.7);
      ctx.save(); ctx.translate(sx, sy - 6);
      glowE(ctx, 0, 0, s * 1.4, s * 0.7, col, 0.45 * (1 - collapse));
      for (let k = 0; k < 4; k++) { ctx.strokeStyle = rgba(col, (0.7 - k * 0.12) * (1 - collapse)); ctx.lineWidth = 3 - k * 0.5; ctx.beginPath(); ctx.ellipse(0, 0, s * (1 - k * 0.2), s * (1 - k * 0.2) * 0.45, 0, p * 9 * (1 + k * 0.4), p * 9 * (1 + k * 0.4) + Math.PI * 1.3); ctx.stroke(); }
      ctx.fillStyle = '#020006'; ell(ctx, 0, 0, s * 0.3, s * 0.15); ctx.fill(); ctx.strokeStyle = rgba('#e8d0ff', 0.8 * (1 - collapse)); ctx.lineWidth = 1.4; ell(ctx, 0, 0, s * 0.31, s * 0.16); ctx.stroke();
      for (let i = 0; i < 26; i++) { const ph = (p * 2.2 + r()) % 1, a = r() * TAU + ph * 5, d = s * 1.3 * (1 - ph); glow(ctx, Math.cos(a) * d, Math.sin(a) * d * 0.5, 5 * (1 - ph) + 2, i % 2 ? '#e8d0ff' : col, (1 - collapse) * (0.3 + 0.6 * ph)); }
      if (collapse > 0) { ctx.strokeStyle = rgba('#ffffff', (1 - collapse) * 0.9); ctx.lineWidth = 4; ell(ctx, 0, 0, R * 1.2 * collapse, R * 0.6 * collapse); ctx.stroke(); glow(ctx, 0, 0, R * collapse, '#ffffff', 0.5 * (1 - collapse)); }
      ctx.restore();
    },
    // Ruh hasadı: yerden yükselen ruhlar gökyüzüne spiral
    soulHarvest(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 65, col = o.color || '#69f0ae', fade = 1 - smooth(0.8, 1, p), r = rng(12);
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.2, R * 0.6, col, 0.3 * fade); ctx.strokeStyle = rgba(col, 0.6 * fade); ctx.lineWidth = 1.6; ell(ctx, 0, 0, R, R * 0.5); ctx.stroke();
      for (let i = 0; i < 9; i++) {
        const st = i * 0.06, q = clamp((p - st) / 0.7, 0, 1); if (q <= 0) continue;
        const a0 = r() * TAU, rad = R * 0.7 * (1 - q * 0.8), a = a0 + q * 7, x = Math.cos(a) * rad, y = Math.sin(a) * rad * 0.5 - q * 150;
        for (let k = 1; k < 7; k++) { const qq = Math.max(0, q - k * 0.025), aa = a0 + qq * 7, rr2 = R * 0.7 * (1 - qq * 0.8); glow(ctx, Math.cos(aa) * rr2, Math.sin(aa) * rr2 * 0.5 - qq * 150, 7 - k * 0.8, col, 0.4 * fade / (k * 0.7)); }
        glow(ctx, x, y, 14, col, 0.9 * fade * (1 - smooth(0.8, 1, q))); ctx.fillStyle = rgba('#ffffff', fade * (1 - smooth(0.8, 1, q))); ell(ctx, x, y, 2.6, 3.6); ctx.fill();
      }
      ctx.restore();
    }
  });
  Object.assign(FX_DURATION, { meteorStrike: 1.4, holyBeam: 1.2, firePillar: 1.3, tornado: 2.0, thunderStrike: 1.0, shadowTendrils: 1.4, vineGrasp: 1.5, iceWall: 1.6, bladeStorm: 1.5, starfall: 1.5, gravityWell: 2.0, soulHarvest: 1.6 });

  // Hazır skill listesi (SADECE GÖRSEL): DeepSeek skill'in mekaniğini yazarken bu efekti çağırır.
  //   engine.castVisual('Meteor Storm', worldX, worldY)  veya  engine.playFx(sk.fx, x, y, sk.opts)
  const SKILLS = [
    { name: 'Whirlwind',       fx: 'spinSlash',      opts: { color: '#ffd54f', radius: 78 }, classes: ['Warrior', 'War Lord', 'Crusader'] },
    { name: 'Earthbreaker',    fx: 'groundSlam',     opts: { color: '#ffb74d', radius: 90 }, classes: ['Tank', 'Juggernaut', 'Colossus'] },
    { name: 'Frost Nova',      fx: 'frostNova',      opts: { color: '#80deea', radius: 95 }, classes: ['Mage', 'Archmage'] },
    { name: 'Inferno Burst',   fx: 'emberBurst',     opts: { color: '#ff7a1a', radius: 85 }, classes: ['Mage', 'War Emperor'] },
    { name: 'Toxic Cloud',     fx: 'poisonCloud',    opts: { color: '#7cb342', radius: 80 }, classes: ['Rogue', 'Gardener'] },
    { name: 'Chain Lightning', fx: 'lightningChain', opts: { color: '#80d8ff' },             classes: ['Storm Warden', 'Archmage'] },
    { name: 'Healing Rain',    fx: 'healPulse',      opts: { color: '#69f0ae', radius: 60 }, classes: ['Healer', 'Lifeweaver'] },
    { name: 'Rune Circle',     fx: 'arcaneCircle',   opts: { color: '#b388ff', radius: 80 }, classes: ['Archmage', 'Moderator'] },
    { name: 'Crimson Reap',    fx: 'bloodScythe',    opts: { color: '#ff1744', radius: 80 }, classes: ['Reaper', 'Bloodlord'] },
    { name: 'Meteor Storm',    fx: 'meteorStrike',   opts: { color: '#ff7a1a', radius: 85 }, classes: ['Mage', 'Archmage', 'War Emperor'] },
    { name: 'Judgement Beam',  fx: 'holyBeam',       opts: { color: '#fff59d', radius: 60 }, classes: ['Paladin', 'High Priest', 'Divine Saint', 'Lightbringer'] },
    { name: 'Flame Pillar',    fx: 'firePillar',     opts: { color: '#ff6a1a', radius: 55 }, classes: ['War Lord', 'Cinder skills'] },
    { name: 'Cyclone',         fx: 'tornado',        opts: { color: '#b0bec5', radius: 55 }, classes: ['Archer', 'Warden', 'Storm Warden'] },
    { name: 'Thunderfall',     fx: 'thunderStrike',  opts: { color: '#b388ff', radius: 70 }, classes: ['Storm Warden', 'Archon'] },
    { name: 'Shadow Grasp',    fx: 'shadowTendrils', opts: { color: '#9c4dff', radius: 70 }, classes: ['Shade King', 'Nightblade', 'Assassin'] },
    { name: 'Thorn Snare',     fx: 'vineGrasp',      opts: { color: '#76ff03', radius: 60 }, classes: ['Rootbinder', 'Gardener', 'Tamer'] },
    { name: 'Glacier Wall',    fx: 'iceWall',        opts: { color: '#9fe2ff', radius: 70 }, classes: ['Mage', 'Tank'] },
    { name: 'Blade Storm',     fx: 'bladeStorm',     opts: { color: '#80d8ff', radius: 80 }, classes: ['Rogue', 'Assassin', 'Nightblade'] },
    { name: 'Starfall',        fx: 'starfall',       opts: { color: '#ffe57f', radius: 85 }, classes: ['Archmage', 'Archon', 'Divine Saint'] },
    { name: 'Singularity',     fx: 'gravityWell',    opts: { color: '#7c4dff', radius: 80 }, classes: ['Shade King', 'Archmage'] },
    { name: 'Soul Harvest',    fx: 'soulHarvest',    opts: { color: '#69f0ae', radius: 65 }, classes: ['Reaper', 'Death Lord', 'Sanguine Lord'] }
  ];

  // ==========================================================================
  //  8) RENK GEÇİŞLERİ (transition)  — sert kesim YOK, hep yumuşak karışım
  //  A) MEKÂNSAL: haritanın bir ucundan diğerine renk karışımı (örn. çimen yeşili -> kül kahvesi)
  //       engine.setTransition({ stops:['#5da24a','#8a6a3a','#5a4a40'], axis:'x', start:0.15, end:0.85, alpha:[0, 0.6] })
  //       stops : 2-3 renk, soldan sağa karışır   axis: 'x' | 'y' | 'radial' | derece (0-360)
  //       start/end: geçişin başladığı/bittiği yer (0..1, harita boyunca)   alpha: [başlangıç, bitiş] opaklık
  //  B) ZAMANSAL: ekranın rengi zamanla döngüde değişir (gün doğumu -> gündüz -> akşam -> gece)
  //       engine.setColorCycle({ period: 60, stops:[ {c:'#ffb36b', a:0.14}, {c:'#ffffff', a:0}, {c:'#7a4dff', a:0.16}, {c:'#0a1a4a', a:0.3} ] })
  //  Formül (her ikisinde): t = smoothstep(start,end,konum);  renk = lerp(stops[i], stops[i+1], t)
  // ==========================================================================
  const TRANSITION_PRESETS = {
    verdantToAshen:  { stops: ['#5da24a', '#8a6a3a', '#5a4a40'], axis: 'x', start: 0.1, end: 0.9, alpha: [0, 0.6] },
    verdantToFrozen: { stops: ['#5da24a', '#9ccfd8', '#e8f4ff'], axis: 'y', start: 0.1, end: 0.9, alpha: [0, 0.6] },
    verdantToMire:   { stops: ['#5da24a', '#4a7a3a', '#3a5a3a'], axis: 135, start: 0.1, end: 0.9, alpha: [0, 0.5] },
    verdantToCursed: { stops: ['#5da24a', '#6a5a8a', '#3a2a5a'], axis: 'radial', start: 0.35, end: 1, alpha: [0, 0.65] },
    ashenToCursed:   { stops: ['#8a3c1e', '#6a2a5a', '#3a2a5a'], axis: 'x', start: 0.1, end: 0.9, alpha: [0.1, 0.55] },
    frozenToMire:    { stops: ['#dff2ff', '#8fbfae', '#4a6a3a'], axis: 'y', start: 0.1, end: 0.9, alpha: [0.1, 0.5] }
  };
  const CYCLE_PRESETS = {
    dayCycle:  { period: 90, stops: [{ c: '#ffb36b', a: 0.14 }, { c: '#ffffff', a: 0 }, { c: '#ff7a5a', a: 0.14 }, { c: '#5a3aa8', a: 0.22 }, { c: '#0a1a4a', a: 0.3 }] },
    bloodMoon: { period: 40, stops: [{ c: '#000000', a: 0 }, { c: '#a00018', a: 0.2 }, { c: '#000000', a: 0 }] },
    aurora:    { period: 30, stops: [{ c: '#40ffb0', a: 0.1 }, { c: '#6a7aff', a: 0.12 }, { c: '#d070ff', a: 0.1 }] }
  };
  const lerpHex = (a, b, t) => { const x = hexRgb(a), y = hexRgb(b); return [Math.round(lerp(x.r, y.r, t)), Math.round(lerp(x.g, y.g, t)), Math.round(lerp(x.b, y.b, t))]; };
  function stopColor(stops, t) { const n = stops.length - 1, f = clamp(t, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)); return lerpHex(stops[i], stops[i + 1], smooth(0, 1, f - i)); }

  function drawTransition(eng, ctx) {
    const c = eng._trans; if (!c || !TravelVisuals.options.tiles) return;
    const hw = eng.tileSize * COS30 + 0.6, hh = eng.tileSize * SIN30 + 0.4, R = eng.mapRadius, ax = c.axis;
    const ang = typeof ax === 'number' ? ax * Math.PI / 180 : ax === 'x' ? 0 : ax === 'y' ? Math.PI / 2 : null;
    for (const tile of eng.tiles) {
      const p = eng.iso(tile.wx, tile.wy, tile.wz); if (p.x < -90 || p.x > eng.width + 90 || p.y < -70 || p.y > eng.height + 70) continue;
      const v = ang === null ? Math.hypot(tile.gx, tile.gy) / R : (tile.gx * Math.cos(ang) + tile.gy * Math.sin(ang)) / (2 * R) + 0.5;
      const t = smooth(c.start, c.end, v), col = stopColor(c.stops, t), a = lerp(c.alpha[0], c.alpha[1], t); if (a < 0.01) continue;
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(p.x - hw, p.y); ctx.lineTo(p.x, p.y - hh); ctx.lineTo(p.x + hw, p.y); ctx.lineTo(p.x, p.y + hh); ctx.closePath(); ctx.fill();
    }
  }
  function drawColorCycle(eng, ctx) {
    const c = eng._cycle; if (!c) return; const n = c.stops.length, f = ((eng.time / c.period) % 1) * n, i = Math.floor(f) % n, k = smooth(0, 1, f - Math.floor(f)), A = c.stops[i], B = c.stops[(i + 1) % n];
    const col = lerpHex(A.c, B.c, k), a = lerp(A.a, B.a, k); if (a < 0.005) return;
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a.toFixed(3)})`; ctx.fillRect(0, 0, eng.width, eng.height);
  }


  // ==========================================================================
  //  9) EFEKT YAPI TAŞLARI (KIT) + BİRLEŞTİRİCİ  — yeni efekti 10 satırda üret
  //  Her yapı taşı: KIT.isim(ctx, q, o)   q: 0..1 (katmanın kendi ilerlemesi)   merkez = zemin noktası (0,0)
  //  Katmanlar zamanda 'at' (başlangıç 0..1) ve 'len' (süre 0..1) ile dizilir.
  //
  //  TravelVisuals.defineFx('meteorRain', {
  //    duration: 2, radius: 90, color: '#ff7a1a',
  //    layers: [
  //      { kind: 'glowGround', at: 0,   len: 1 },
  //      { kind: 'fall',       at: 0,   len: 0.7, n: 7, h: 320 },
  //      { kind: 'ring',       at: 0.5, len: 0.5, r: 90 },
  //      { kind: 'burst',      at: 0.5, len: 0.5, n: 22, up: 40 }
  //    ]
  //  });
  //  engine.playFx('meteorRain', x, y);
  // ==========================================================================
  const KIT = {
    ring(g, q, o) { const e = easeOut(q), a = 1 - smooth(0.55, 1, q), r = (o.r || 80) * lerp(o.from || 0, 1, e); g.strokeStyle = rgba(o.col, 0.95 * a); g.lineWidth = (o.w || 5) * (1 - q) + 1; ell(g, 0, 0, r, r * 0.5); g.stroke(); glowE(g, 0, 0, r * 1.15 + 6, r * 0.58 + 3, o.col, 0.3 * a); },
    glowGround(g, q, o) { const a = Math.sin(clamp(q, 0, 1) * Math.PI), r = o.r || 80; glowE(g, 0, 0, r * 1.2, r * 0.6, o.col, (o.a || 0.6) * a); },
    pillar(g, q, o) { const up = easeOut(Math.min(1, q / 0.25)), a = 1 - smooth(0.6, 1, q), h = (o.h || 160) * up, w = (o.w || 26) * (1 - 0.4 * q); const gr = g.createLinearGradient(0, -h, 0, 0); gr.addColorStop(0, rgba(o.col, 0)); gr.addColorStop(0.7, rgba(o.col, 0.55 * a)); gr.addColorStop(1, rgba('#ffffff', 0.85 * a)); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(-w, -h, w * 2, h); g.fillStyle = rgba('#ffffff', 0.6 * a); g.fillRect(-w * 0.35, -h, w * 0.7, h); g.restore(); },
    burst(g, q, o) { const r = rng(o.seed || 4), e = easeOut(q), a = 1 - smooth(0.4, 1, q); for (let i = 0; i < (o.n || 20); i++) { const an = r() * TAU, d = (o.r || 80) * e * (0.3 + 0.7 * r()); glow(g, Math.cos(an) * d, Math.sin(an) * d * 0.5 - (o.up || 0) * e * r(), (o.size || 7) * (1 - q * 0.5), (i % 2 && o.col2) ? o.col2 : o.col, a); } },
    rise(g, q, o) { const r = rng(o.seed || 6), f = 1 - smooth(0.8, 1, q); for (let i = 0; i < (o.n || 14); i++) { const ph = (q * 1.5 + r()) % 1; glow(g, (r() - 0.5) * (o.r || 60) * 2, -ph * (o.h || 100), o.size || 6, (i % 2 && o.col2) ? o.col2 : o.col, Math.sin(ph * Math.PI) * f); } },
    orbit(g, q, o) { const n = o.n || 4, f = Math.sin(clamp(q, 0, 1) * Math.PI); for (let i = 0; i < n; i++) { const a = q * TAU * (o.turns || 1.5) + i * TAU / n, x = Math.cos(a) * (o.r || 40), y = Math.sin(a) * (o.r || 40) * 0.5 - (o.h || 20); g.save(); g.globalAlpha = Math.min(1, f * 2); if (o.shape === 'blade') { g.translate(x, y); g.rotate(a + Math.PI / 2); glow(g, 0, 0, 14, o.col, 0.6); g.fillStyle = '#fff'; poly(g, [0, -10, 3, 0, 0, 8, -3, 0]); g.fill(); } else if (o.shape === 'star') { glow(g, x, y, 14, o.col, 0.7); g.fillStyle = '#fff'; starPath(g, x, y, 5); g.fill(); } else { glow(g, x, y, 12, o.col, 0.9); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); } g.restore(); } },
    flash(g, q, o) { glow(g, 0, -(o.y || 10), (o.r || 90) * (0.4 + q * 0.6), o.col, (1 - q) * (o.a || 0.8)); },
    bolt(g, q, o) { const fr = Math.floor(q * 20), r = rng(fr * 9 + 3), f = o.from || [40, -300], a = 1 - q; g.lineJoin = 'round'; g.beginPath(); g.moveTo(f[0], f[1]); for (let i = 1; i < 10; i++) g.lineTo(f[0] * (1 - i / 10) + (r() - 0.5) * 22, f[1] * (1 - i / 10) + (r() - 0.5) * 12); g.lineTo(0, 0); g.strokeStyle = rgba(o.col, 0.5 * a); g.lineWidth = 7; g.stroke(); g.strokeStyle = rgba('#ffffff', a); g.lineWidth = 2; g.stroke(); },
    slash(g, q, o) { const e = easeOut(q), a = 1 - smooth(0.5, 1, q), R = o.r || 80; g.save(); g.translate(0, -(o.h || 24)); g.rotate(o.ang || -0.6); for (let k = 0; k < 3; k++) { g.strokeStyle = rgba(k ? '#ffffff' : o.col, (k ? 0.9 : 0.55) * a); g.lineWidth = k ? 2 : 14 * (1 - q) + 2; g.beginPath(); g.arc(0, 0, R * (0.7 + e * 0.3), -1.5, -1.5 + 3 * e); g.stroke(); } g.restore(); },
    fall(g, q, o) { const r = rng(o.seed || 9), n = o.n || 6; for (let i = 0; i < n; i++) { const tx = (r() - 0.5) * (o.r || 80) * 1.6, ty = (r() - 0.5) * (o.r || 80) * 0.7, u = (q - i / n * 0.6) / 0.4; if (u < 0 || u > 1.5) continue; if (u < 1) { const e = u * u, x = tx + (o.dx || 60) * (1 - e), y = ty - (o.h || 300) * (1 - e); for (let k = 1; k < 7; k++) glow(g, x + k * 4, y - k * 12, 9 - k, o.col, 0.5 / k); glow(g, x, y, 20, o.col, 0.9); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 3.4, 0, TAU); g.fill(); } else { const b = u - 1; g.strokeStyle = rgba(o.col, (1 - b / 0.5) * 0.9); g.lineWidth = 2; ell(g, tx, ty, 6 + b * 40, (6 + b * 40) * 0.5); g.stroke(); glow(g, tx, ty - 5, 22 * (1 - b / 0.5), '#ffffff', 0.7 * (1 - b / 0.5)); } } },
    shards(g, q, o) { const n = o.n || 9; for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * (o.r || 70) * 0.8, y = Math.sin(a) * (o.r || 70) * 0.4, h = (o.h || 50) * (0.6 + 0.4 * Math.sin(i * 2.3)) * easeOut(clamp(q * 3 - i * 0.05, 0, 1)) * (1 - smooth(0.8, 1, q)); if (h < 1) continue; const w = 7; const gr = g.createLinearGradient(x, y, x, y - h); gr.addColorStop(0, shade(o.col, -0.4)); gr.addColorStop(0.6, o.col); gr.addColorStop(1, '#ffffff'); g.fillStyle = gr; poly(g, [x - w, y, x - w * 0.5, y - h * 0.75, x, y - h, x + w * 0.5, y - h * 0.75, x + w, y]); g.fill(); } },
    cracks(g, q, o) { const r = rng(o.seed || 7), e = easeOut(q), a = 1 - smooth(0.6, 1, q); for (let k = 0; k < (o.n || 8); k++) { const an = k / (o.n || 8) * TAU + r() * 0.4, len = (o.r || 80) * (0.6 + r() * 0.5) * e; g.strokeStyle = rgba('#100a08', 0.85 * a); g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); for (let s = 1; s <= 5; s++) { const d = len * s / 5; g.lineTo(Math.cos(an) * d + (r() - 0.5) * 8, (Math.sin(an) * d + (r() - 0.5) * 8) * 0.5); } g.stroke(); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(o.col, 0.8 * a); g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * len, Math.sin(an) * len * 0.5); g.stroke(); g.restore(); } },
    streaks(g, q, o) { const r = rng(o.seed || 5), a = Math.sin(clamp(q, 0, 1) * Math.PI); g.lineCap = 'round'; for (let i = 0; i < (o.n || 16); i++) { const ph = (q * 2 + r()) % 1, y = (r() - 0.5) * (o.r || 90) * 0.9, x = lerp(-(o.r || 90), (o.r || 90), ph); g.strokeStyle = rgba(o.col, a * 0.5 * Math.sin(ph * Math.PI)); g.lineWidth = 1 + r() * 1.6; g.beginPath(); g.moveTo(x, y * 0.6 - 20); g.lineTo(x - 26, y * 0.6 - 18); g.stroke(); } },
    spikes(g, q, o) { const n = o.n || 12, lean = (o.lean === undefined ? 0.5 : o.lean) * q; for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.2, x = Math.cos(a) * (o.r || 70) * 0.85, y = Math.sin(a) * (o.r || 70) * 0.43, h = (o.h || 60) * easeOut(clamp(q * 3 - (i % 4) * 0.12, 0, 1)) * (1 - smooth(0.85, 1, q)); if (h < 1) continue; const lx = -Math.cos(a) * h * lean, w = 6; g.fillStyle = shade(o.col, -0.1 * (i % 3)); poly(g, [x - w, y, x + lx, y - h, x + w, y]); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.stroke(); } },
    star(g, q, o) { const up = easeOut(Math.min(1, q * 3)), a = 1 - smooth(0.8, 1, q), r = (o.r || 70) * up; g.save(); g.scale(1, 0.5); g.rotate(q * (o.turn || 2)); g.strokeStyle = rgba(o.col, 0.9 * a); g.lineWidth = 2.4; g.beginPath(); for (let i = 0; i <= 5; i++) { const an = -Math.PI / 2 + i * TAU * 2 / 5; i ? g.lineTo(Math.cos(an) * r, Math.sin(an) * r) : g.moveTo(Math.cos(an) * r, Math.sin(an) * r); } g.stroke(); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); g.restore(); glowE(g, 0, 0, r * 1.2, r * 0.6, o.col, 0.3 * a); }
  };
  function defineFx(name, spec) {
    FX_DURATION[name] = spec.duration || 1.2;
    fx[name] = (ctx, sx, sy, p, o = {}) => {
      const base = spec.radius || 80, k = (o.radius || base) / base, col = o.color || spec.color || '#ffffff';
      ctx.save(); ctx.translate(sx, sy); ctx.scale(k, k);
      for (const L of spec.layers) { const at = L.at || 0, len = L.len || (1 - at), q = (p - at) / len; if (q < 0 || q > 1) continue; const f = KIT[L.kind]; if (f) f(ctx, q, Object.assign({ r: base }, L, { col: L.col || col })); }
      ctx.restore();
    };
  }
  function defineSkill(sk) { SKILLS.push(sk); }
  const skillsFor = (cls) => { const k = String(cls).toLowerCase().replace(/[^a-z]/g, ''); return SKILLS.filter((s) => s.classes.some((c) => String(c).toLowerCase().replace(/[^a-z]/g, '') === k)); };

  // Birleştiriciyle yapılan 3 örnek (DeepSeek'e ilham): Kan Ritüeli, Kar Fırtınası, Kemik Kafesi
  defineFx('bloodRitual', { duration: 2.2, radius: 85, color: '#ff1744', layers: [
    { kind: 'glowGround', at: 0, len: 1, a: 0.7 }, { kind: 'star', at: 0, len: 1, turn: 2.4 }, { kind: 'ring', at: 0.05, len: 0.4, w: 4 },
    { kind: 'pillar', at: 0.45, len: 0.55, h: 190, w: 20 }, { kind: 'rise', at: 0.3, len: 0.7, n: 18, h: 120, col2: '#ffcdd2' },
    { kind: 'orbit', at: 0.1, len: 0.9, n: 5, r: 48, h: 30, turns: 2.5 }, { kind: 'ring', at: 0.65, len: 0.35, r: 120, w: 7 }, { kind: 'flash', at: 0.65, len: 0.3, r: 110 } ] });
  defineFx('blizzard', { duration: 2.4, radius: 95, color: '#9fe2ff', layers: [
    { kind: 'glowGround', at: 0, len: 1, a: 0.5 }, { kind: 'streaks', at: 0, len: 1, n: 26, col: '#eaf8ff' }, { kind: 'fall', at: 0.05, len: 0.8, n: 10, h: 240, dx: -90, col: '#bfeaff' },
    { kind: 'shards', at: 0.4, len: 0.6, n: 10, h: 44 }, { kind: 'ring', at: 0.15, len: 0.85, r: 105, w: 3 }, { kind: 'burst', at: 0.2, len: 0.8, n: 20, size: 4, col2: '#ffffff' } ] });
  defineFx('boneCage', { duration: 1.8, radius: 75, color: '#d8d0b8', layers: [
    { kind: 'glowGround', at: 0, len: 1, col: '#76ff03', a: 0.4 }, { kind: 'cracks', at: 0, len: 0.4, n: 10, col: '#76ff03' }, { kind: 'spikes', at: 0.1, len: 0.9, n: 14, h: 76, lean: 0.55 },
    { kind: 'ring', at: 0.3, len: 0.5, col: '#76ff03', w: 3 }, { kind: 'rise', at: 0.3, len: 0.7, n: 12, h: 90, col: '#b2ff59', size: 5 } ] });

  // ==========================================================================
  //  10) 7 ÖZEL EPİK EFEKT  (kit yetmeyen karmaşık olanlar — kendi çizimleri var)
  // ==========================================================================
  Object.assign(fx, {
    // Ejderha nefesi: yön açısıyla (o.angle, ekran radyanı) koni şeklinde alev
    dragonBreath(ctx, sx, sy, p, o = {}) {
      const L = (o.radius || 90) * 2.3, ang = o.angle === undefined ? 0.45 : o.angle, env = smooth(0, 0.12, p) * (1 - smooth(0.78, 1, p)), r = rng(14);
      ctx.save(); ctx.translate(sx, sy - 22); ctx.rotate(ang);
      glow(ctx, 0, 0, 40 * env, '#fff3c4', 0.9 * env);
      for (let i = 0; i < 70; i++) { const ph = (p * 2.2 + i / 70) % 1, d = ph * L, sp = (r() - 0.5) * ph * 0.7, x = Math.cos(sp) * d, y = Math.sin(sp) * d * 0.9, s = 6 + ph * 26; const col = ph < 0.2 ? '#fff3c4' : ph < 0.5 ? '#ffb300' : ph < 0.8 ? '#ff5a14' : '#7a1a0a'; glow(ctx, x, y, s, col, Math.sin(ph * Math.PI) * 0.7 * env); if (ph > 0.7) { ctx.globalAlpha = 0.18 * env; ctx.fillStyle = '#2a1a14'; ctx.beginPath(); ctx.arc(x, y - ph * 10, s * 0.7, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; } }
      ctx.restore();
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang * 0.5); glowE(ctx, L * 0.45, 0, L * 0.6, L * 0.14, '#ff5a14', 0.35 * env); ctx.restore();
    },
    // Anka kuşu: ateş kanatları açılarak yükselir, kül yağar
    phoenixRise(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 70, col = o.color || '#ff8f00', e = easeOut(Math.min(1, p / 0.45)), fade = 1 - smooth(0.78, 1, p), rise = easeOut(p) * 70, r = rng(31), fl = Math.sin(p * 22) * 0.18;
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.3, R * 0.65, col, 0.55 * fade); ctx.strokeStyle = rgba('#ffd54f', 0.8 * fade); ctx.lineWidth = 2; ell(ctx, 0, 0, R * e, R * e * 0.5); ctx.stroke();
      ctx.translate(0, -34 - rise); glow(ctx, 0, 0, 70, col, 0.5 * fade);
      [-1, 1].forEach((sd) => { ctx.save(); ctx.scale(sd, 1); for (let k = 0; k < 8; k++) { const an = -1.5 + k * 0.2 + fl * (1 + k * 0.1) - (1 - e) * 1.0, len = (30 + (7 - Math.abs(k - 3)) * 6) * (0.4 + 0.6 * e); ctx.save(); ctx.rotate(an); const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, '#fff3c4'); g.addColorStop(0.45, '#ffb300'); g.addColorStop(1, rgba('#d50000', 0.0)); ctx.fillStyle = g; ctx.globalAlpha = 0.95 * fade; ell(ctx, len / 2 + 4, 0, len / 2, 5.4 - k * 0.2); ctx.fill(); ctx.restore(); } ctx.restore(); });
      ctx.fillStyle = rgba('#fff3c4', fade); ell(ctx, 0, 0, 7, 12); ctx.fill(); ctx.fillStyle = rgba('#ff5a14', fade); poly(ctx, [-4, -10, 0, -22, 4, -10]); ctx.fill(); poly(ctx, [-5, 8, 0, 36, 5, 8]); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.translate(sx, sy); for (let i = 0; i < 16; i++) { const ph = (p * 1.6 + r()) % 1; glow(ctx, (r() - 0.5) * R * 2, -ph * 120 - 10, 5, i % 2 ? '#ffb300' : col, Math.sin(ph * Math.PI) * fade); } ctx.restore();
    },
    // Yaşam ağacı: gövde büyür, taç açar, yapraklar ve iyileştirme halkaları
    treeOfLife(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 75, col = o.color || '#69f0ae', g1 = easeOut(Math.min(1, p / 0.35)), g2 = easeOut(clamp((p - 0.25) / 0.3, 0, 1)), fade = 1 - smooth(0.82, 1, p), r = rng(23);
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.3, R * 0.65, col, 0.4 * fade); for (let k = 0; k < 3; k++) { const q = (p * 1.4 - k * 0.22); if (q < 0 || q > 1) continue; ctx.strokeStyle = rgba(col, (1 - q) * 0.8 * fade); ctx.lineWidth = 2; ell(ctx, 0, 0, R * q, R * q * 0.5); ctx.stroke(); }
      ctx.globalAlpha = fade; ctx.lineCap = 'round'; const H = 100 * g1;
      ctx.strokeStyle = '#5a3e26'; ctx.lineWidth = 12 * (1 - 0.3 * g1); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -H * 0.5, 0, -H); ctx.stroke(); ctx.strokeStyle = '#7a5a38'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(4, -H * 0.5, -2, -H); ctx.stroke();
      [[-1, 0.5], [1, 0.62], [-1, 0.8], [1, 0.88]].forEach(([d, y], i) => { ctx.strokeStyle = '#5a3e26'; ctx.lineWidth = 5 - i; ctx.beginPath(); ctx.moveTo(0, -H * y); ctx.quadraticCurveTo(d * 22 * g1, -H * y - 14, d * (34 - i * 4) * g1, -H * y - 28 * g1); ctx.stroke(); });
      for (let i = 0; i < 46; i++) { const a = r() * TAU, rr = Math.sqrt(r()) * 44 * g2, x = Math.cos(a) * rr, y = -H - 10 + Math.sin(a) * rr * 0.75, s = 6 + r() * 6; ctx.fillStyle = i % 3 ? '#43a047' : i % 3 === 1 ? '#81c784' : '#c5e1a5'; ctx.beginPath(); ctx.arc(x, y, s * g2, 0, TAU); ctx.fill(); }
      glow(ctx, 0, -H - 10, 70 * g2, col, 0.45); ctx.globalAlpha = 1;
      for (let i = 0; i < 14; i++) { const ph = (p * 1.5 + r()) % 1, x = (r() - 0.5) * 100 + Math.sin(ph * 9 + i) * 8, y = -H - 4 + ph * (H + 4); ctx.globalAlpha = Math.sin(ph * Math.PI) * fade * g2; ctx.fillStyle = i % 2 ? '#f8bbd0' : '#ffffff'; ell(ctx, x, y, 3, 1.6, ph * 6); ctx.fill(); }
      ctx.restore();
    },
    // Boyut yarığı: uzayda dikey bir yırtık açılır, çevreyi içine çeker, kapanır
    dimensionRift(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 75, col = o.color || '#b388ff', open = easeOut(clamp(p / 0.25, 0, 1)) * (1 - easeOut(clamp((p - 0.8) / 0.2, 0, 1))), H = 70 * open + 8, W = 22 * open, r = rng(19);
      ctx.save(); ctx.translate(sx, sy - 40);
      glow(ctx, 0, 0, R * 1.1 * open + 10, col, 0.5);
      const g = ctx.createLinearGradient(0, -H, 0, H); g.addColorStop(0, '#12002a'); g.addColorStop(0.5, '#000000'); g.addColorStop(1, '#12002a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -H); ctx.quadraticCurveTo(W, 0, 0, H); ctx.quadraticCurveTo(-W, 0, 0, -H); ctx.fill();
      ctx.strokeStyle = rgba('#ffffff', 0.9); ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = rgba(col, 0.8); ctx.lineWidth = 5; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, -H); ctx.quadraticCurveTo(W, 0, 0, H); ctx.quadraticCurveTo(-W, 0, 0, -H); ctx.clip(); for (let i = 0; i < 24; i++) { ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.5 * Math.sin(p * 9 + i)})`; ctx.fillRect((r() - 0.5) * W * 1.6, (r() - 0.5) * H * 1.9, 1.6, 1.6); } ctx.restore();
      for (let i = 0; i < 26; i++) { const ph = (p * 2 + r()) % 1, a = r() * TAU, d = R * (1 - ph) * open; glow(ctx, Math.cos(a) * d, Math.sin(a) * d * 0.55, 4 + (1 - ph) * 2, i % 2 ? '#e8d0ff' : col, (0.2 + 0.7 * ph) * open); }
      ctx.restore(); ctx.save(); ctx.translate(sx, sy); ctx.strokeStyle = rgba(col, 0.6 * open); ctx.lineWidth = 1.6; ell(ctx, 0, 0, R * 0.8, R * 0.4); ctx.stroke(); ctx.restore();
    },
    // İlahi hüküm: gökten 6 dev kılıç düşüp yere saplanır, ışık sütunu ve şok dalgası
    judgementSwords(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 80, col = o.color || '#fff59d', N = 6, landed = smooth(0.5, 0.6, p), fade = 1 - smooth(0.85, 1, p);
      ctx.save(); ctx.translate(sx, sy);
      glowE(ctx, 0, 0, R * 1.3, R * 0.65, col, 0.45 * Math.min(1, p * 3) * fade);
      const pos = []; for (let i = 0; i < N; i++) { const a = i / N * TAU - 0.5, x = Math.cos(a) * R * 0.8, y = Math.sin(a) * R * 0.4, u = clamp((p - i * 0.05) / 0.28, 0, 1), e = u * u, dy = -330 * (1 - e); pos.push([x, y]); ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y + dy);
        if (u < 1) for (let k = 1; k < 6; k++) glow(ctx, 0, -k * 14, 12 - k, col, 0.4 / k * 3);
        const g = ctx.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, '#9fb0bd'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#9fb0bd'); ctx.fillStyle = g; poly(ctx, [-8, -58, 8, -58, 6, -12, 0, 6, -6, -12]); ctx.fill();
        ctx.fillStyle = '#ffca28'; ctx.fillRect(-14, -62, 28, 5); ctx.fillRect(-3, -86, 6, 26); ctx.beginPath(); ctx.arc(0, -90, 5, 0, TAU); ctx.fill(); glow(ctx, 0, -40, 24, col, 0.6 * landed + 0.2); ctx.restore(); }
      if (landed > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(col, 0.6 * landed * fade); ctx.lineWidth = 1.6; pos.forEach(([x, y], i) => { const [x2, y2] = pos[(i + 2) % N]; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x2, y2 - 30); ctx.stroke(); }); ctx.globalCompositeOperation = 'source-over'; }
      if (p > 0.62) { const q = (p - 0.62) / 0.38; KIT.pillar(ctx, q, { col, h: 260, w: 30 }); KIT.ring(ctx, q, { col, r: R * 1.5, w: 7 }); KIT.flash(ctx, Math.min(1, q * 2), { col: '#ffffff', r: 120 }); }
      ctx.restore();
    },
    // Ruh sürüsü: hayalet kurtlar hedef etrafında koşar, sonda içine atlar
    spiritWolves(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 70, col = o.color || '#80deea', N = 4, fade = 1 - smooth(0.88, 1, p), lunge = smooth(0.72, 0.92, p);
      ctx.save(); ctx.translate(sx, sy); glowE(ctx, 0, 0, R * 1.2, R * 0.6, col, 0.3 * fade);
      const wolf = (x, y, dir, ph, a) => { ctx.save(); ctx.translate(x, y); ctx.scale(dir * 1.1, 1.1); ctx.globalAlpha = a; const sw = Math.sin(ph) * 7; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(-10 + sw, -2); ctx.moveTo(8, -14); ctx.lineTo(8 - sw, -2); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-7, -14); ctx.lineTo(-7 - sw, -2); ctx.moveTo(11, -14); ctx.lineTo(11 + sw, -2); ctx.stroke();
        glow(ctx, 0, -18, 30, col, 0.5); const gr = ctx.createLinearGradient(0, -30, 0, -8); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, col); ctx.fillStyle = gr; ell(ctx, 0, -18, 16, 8); ctx.fill(); ell(ctx, 17, -24, 7, 6); ctx.fill(); poly(ctx, [22, -24, 31, -21, 22, -19]); ctx.fill(); poly(ctx, [14, -29, 15, -37, 19, -29]); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-15, -20); ctx.quadraticCurveTo(-26, -24 + Math.sin(ph) * 3, -30, -14); ctx.stroke(); ctx.fillStyle = '#10333a'; ctx.beginPath(); ctx.arc(18, -25, 1.3, 0, TAU); ctx.fill(); glow(ctx, 18, -25, 7, '#e0fcff', 0.9); ctx.restore(); };
      for (let i = 0; i < N; i++) { for (let k = 3; k >= 0; k--) { const a = p * TAU * 1.6 + i * TAU / N - k * 0.16, rr = R * (1 - lunge * 0.9), x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.5, dir = Math.sin(a) > 0 ? -1 : 1; wolf(x, y, -dir * Math.sign(Math.cos(a + 1.57)) || 1, p * 30 + i, (k ? 0.14 : 0.9) * fade); } }
      if (lunge > 0.6) { KIT.burst(ctx, (lunge - 0.6) / 0.4, { col, n: 22, r: 70, size: 8, up: 30 }); KIT.flash(ctx, (lunge - 0.6) / 0.4, { col: '#ffffff', r: 80 }); }
      ctx.restore();
    },
    // Titan yumruğu: gökten dev taş yumruk iner, yeri ezer, toz ve enkaz fırlatır
    titanFist(ctx, sx, sy, p, o = {}) {
      const R = o.radius || 85, col = o.color || '#00e5ff', hit = 0.42, r = rng(27);
      ctx.save(); ctx.translate(sx, sy);
      if (p < hit) { const q = p / hit; ctx.strokeStyle = rgba(col, 0.3 + 0.5 * q); ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ell(ctx, 0, 0, R * q, R * q * 0.5); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = rgba('#000000', 0.35 * q); ell(ctx, 0, 0, R * 0.6 * q, R * 0.3 * q); ctx.fill(); }
      const drop = p < hit ? -360 * (1 - (p / hit) * (p / hit)) : -Math.max(0, (p - 0.72) / 0.28) * 360, fade = p > 0.72 ? 1 - smooth(0.72, 1, p) * 0.0 : 1;
      if (p >= hit) { const b = (p - hit) / (1 - hit), e = easeOut(Math.min(1, b * 1.6)); KIT.cracks(ctx, Math.min(1, b * 2), { r: R * 1.2, col, n: 10 }); KIT.ring(ctx, Math.min(1, b * 1.6), { r: R * 1.4, col: '#ffe0b2', w: 8 });
        for (let i = 0; i < 14; i++) { const a = r() * TAU, sp = 40 + r() * 80, t2 = Math.min(1, b * 1.3), x = Math.cos(a) * sp * t2, y = Math.sin(a) * sp * t2 * 0.5 - Math.sin(t2 * Math.PI) * (40 + r() * 50); ctx.globalAlpha = 1 - smooth(0.5, 1, b); ctx.fillStyle = '#4a4f55'; poly(ctx, [x - 4, y, x, y - 5, x + 5, y + 1, x, y + 4]); ctx.fill(); }
        ctx.globalAlpha = 0.3 * (1 - b); ctx.fillStyle = '#8a8f95'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * 0.8) * R * e * 0.9, Math.sin(i * 0.8) * R * e * 0.45 - 10 * b, 10 + 14 * b, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
      ctx.save(); ctx.translate(0, drop); ctx.globalAlpha = fade;
      const W = R * 0.5, ar = ctx.createLinearGradient(-W * 0.6, 0, W * 0.6, 0); ar.addColorStop(0, '#6a7078'); ar.addColorStop(1, '#2e3238'); ctx.fillStyle = ar; ctx.fillRect(-W * 0.5, -500, W, 470);
      const fg = ctx.createLinearGradient(-W, -40, W, 10); fg.addColorStop(0, '#9aa1a9'); fg.addColorStop(1, '#3a3f46'); ctx.fillStyle = fg; poly(ctx, [-W, -40, -W * 0.7, -62, W * 0.7, -62, W, -40, W * 0.9, -6, -W * 0.9, -6]); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.4; ctx.stroke();
      for (let k = 0; k < 4; k++) { const x = -W * 0.72 + k * W * 0.48; ctx.fillStyle = k % 2 ? '#7a8088' : '#8a9098'; ctx.beginPath(); ctx.arc(x, -8, W * 0.26, 0, TAU); ctx.fill(); ctx.stroke(); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(col, 0.9); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-W * 0.3, -60); ctx.lineTo(-W * 0.1, -40); ctx.lineTo(-W * 0.35, -20); ctx.moveTo(W * 0.4, -58); ctx.lineTo(W * 0.2, -34); ctx.stroke(); glow(ctx, 0, -34, W * 1.4, col, 0.3); ctx.restore(); ctx.restore();
      ctx.restore();
    }
  });
  Object.assign(FX_DURATION, { dragonBreath: 1.5, phoenixRise: 1.9, treeOfLife: 2.4, dimensionRift: 2.0, judgementSwords: 2.2, spiritWolves: 2.0, titanFist: 1.6 });

  // 10 yeni hazır skill (sınıf uyumlu)
  [
    { name: 'Dragon Breath',    fx: 'dragonBreath',    opts: { color: '#ff5a14', radius: 90, angle: 0.45 }, classes: ['War Emperor', 'War Lord', 'Bloodlord'] },
    { name: 'Phoenix Rebirth',  fx: 'phoenixRise',     opts: { color: '#ff8f00', radius: 70 }, classes: ['Divine Saint', 'High Priest', 'Lightbringer'] },
    { name: 'Tree of Life',     fx: 'treeOfLife',      opts: { color: '#69f0ae', radius: 75 }, classes: ['Lifeweaver', 'Gardener', 'Healer'] },
    { name: 'Dimension Rift',   fx: 'dimensionRift',   opts: { color: '#b388ff', radius: 75 }, classes: ['Archmage', 'Archon', 'Shade King', 'Ultra Moderator'] },
    { name: 'Divine Judgement', fx: 'judgementSwords', opts: { color: '#fff59d', radius: 80 }, classes: ['Paladin', 'Crusader', 'Lightbringer', 'Archon'] },
    { name: 'Blood Ritual',     fx: 'bloodRitual',     opts: { color: '#ff1744', radius: 85 }, classes: ['Bloodlord', 'Sanguine Lord', 'Bloodspawn'] },
    { name: 'Blizzard',         fx: 'blizzard',        opts: { color: '#9fe2ff', radius: 95 }, classes: ['Archmage', 'Warden', 'Storm Warden'] },
    { name: 'Spirit Pack',      fx: 'spiritWolves',    opts: { color: '#80deea', radius: 70 }, classes: ['Beastmaster', 'Alpha Tamer', 'Tamer'] },
    { name: 'Titan Fist',       fx: 'titanFist',       opts: { color: '#00e5ff', radius: 85 }, classes: ['Colossus', 'Juggernaut', 'Tank'] },
    { name: 'Bone Cage',        fx: 'boneCage',        opts: { color: '#d8d0b8', radius: 75 }, classes: ['Death Lord', 'Reaper', 'Gloomspawn'] }
  ].forEach(defineSkill);

  const P = TE.prototype;
  const _gen = P.generateMap, _tile = P.getTileSprite, _scn = P.drawSceneryItem, _light = P.renderLighting, _vig = P.renderAtmosphericVignette,
    _spawn = P.spawnMonsters, _goblin = P.paintGoblin, _render = P.render;

  P.generateMap = function () {
    if (!this._bio) setupBio(this);
    _gen.apply(this, arguments);
    remapScenery(this);
  };
  P.getTileSprite = function (type, variant, elev) {
    if (!this._bio) setupBio(this);
    this._origGetTileSprite = this._origGetTileSprite || ((a, b, c) => _tile.call(this, a, b, c));
    return biomeTileSprite(this, type, variant, elev);
  };
  P.drawSceneryItem = function (ctx, s) {
    const painter = PROPS[s.type];
    if (!painter) return _scn.apply(this, arguments);
    const { x, y } = this.iso(s.wx, s.wy, 0);
    if (x < -110 || x > this.width + 110 || y < -150 || y > this.height + 70) return;
    ctx.save(); ctx.translate(x, y); glowE(ctx, 0, 1, 30 * (s.scale || 1), 9 * (s.scale || 1), '#000000', 0.4); ctx.scale(s.scale || 1, s.scale || 1);
    painter(ctx, s, this.time); ctx.restore();
  };
  P.renderLighting = function (ctx) {
    _light.apply(this, arguments);
    drawTransition(this, ctx);
    if (TravelVisuals.options.scenery) { drawDecals(this, ctx); } if (TravelVisuals.options.tiles) drawTileLife(this, ctx);
  };
  P.renderAtmosphericVignette = function (ctx) {
    drawColorCycle(this, ctx);
    drawWeather(this, ctx);
    _vig.apply(this, arguments);
  };
  // Bölgeye göre arka plan (adanın dışı)
  P.render = function () {
    const bio = this._bio, cfg = bio && BIOMES[bio.biome];
    if (cfg && cfg.bg && TravelVisuals.options.tiles && !this._bgPatched) {
      const ctx = this.ctx, orig = ctx.createRadialGradient.bind(ctx), self = this;
      ctx.createRadialGradient = function (...a) { const g = orig(...a); const ac = g.addColorStop.bind(g); let i = 0; g.addColorStop = (o, c) => ac(o, (self._bio && BIOMES[self._bio.biome].bg && a[2] === 60 && a.length === 6 && i < 3) ? BIOMES[self._bio.biome].bg[i++] : c); return g; };
      this._bgPatched = true;
    }
    return _render.apply(this, arguments);
  };
  P.spawnMonsters = function () {
    if (!this._bio) setupBio(this);
    const before = this.monsters.length; _spawn.apply(this, arguments);
    if (!TravelVisuals.options.mobs) return;
    const list = BIOME_MOBS[this._bio.biome] || BIOME_MOBS.verdant;
    this.monsters.slice(before).forEach((m, i) => {
      const k = list[i % list.length], d = MOBS[k]; m.baseKind = m.kind; m.kind = k; const nat = NATIVE[k]; if (d) { m.name = d.name; m.radius = d.radius; } else if (nat) { m.name = nat[0]; m.radius = nat[1]; }
    });
  };
  P.paintGoblin = function (g, m, t, face, atkT) {
    const d = MOBS[m.kind]; if (d) return d.paint(g, m, t, face, atkT);
    return _goblin.apply(this, arguments);
  };

  // --- efekt oynatıcı ---
  const _part = P.renderParticles;
  P.playFx = function (name, wx, wy, opts = {}) {
    if (!fx[name]) return console.warn('[TravelVisuals] bilinmeyen efekt:', name);
    (this._fxList = this._fxList || []).push({ name, wx, wy, start: this.time, dur: opts.duration || FX_DURATION[name] || 1, opts });
  };
  P.renderParticles = function (ctx) {
    _part.apply(this, arguments);
    if (!this._fxList || !this._fxList.length) return;
    this._fxList = this._fxList.filter((f) => {
      const p = (this.time - f.start) / f.dur; if (p >= 1) return false;
      const wx = f.opts.follow ? this.player.x : f.wx, wy = f.opts.follow ? this.player.y : f.wy, s = this.iso(wx, wy, 0);
      ctx.save(); if (f.opts.scale && f.opts.scale !== 1) { ctx.translate(s.x, s.y); ctx.scale(f.opts.scale, f.opts.scale); fx[f.name](ctx, 0, 0, p, f.opts); } else fx[f.name](ctx, s.x, s.y, p, f.opts); ctx.restore(); return true;
    });
  };
  // --- renk geçişleri ---
  P.setTransition = function (cfg) {   // cfg: preset adı (string) | { stops, axis, start, end, alpha } | null (kapat)
    if (!cfg) { this._trans = null; return; }
    const c = typeof cfg === 'string' ? TRANSITION_PRESETS[cfg] : cfg; if (!c) return console.warn('[TravelVisuals] bilinmeyen geçiş:', cfg);
    this._trans = Object.assign({ axis: 'x', start: 0, end: 1, alpha: [0, 0.6] }, c);
  };
  P.setColorCycle = function (cfg) {   // preset adı | { period, stops:[{c,a}] } | null
    if (!cfg) { this._cycle = null; return; }
    const c = typeof cfg === 'string' ? CYCLE_PRESETS[cfg] : cfg; if (!c) return console.warn('[TravelVisuals] bilinmeyen döngü:', cfg);
    this._cycle = c;
  };
  // --- hazır skill görseli: engine.castVisual('Meteor Storm', x, y) ---
  P.castVisual = function (name, wx, wy, extra) {
    const sk = SKILLS.find((k) => k.name.toLowerCase() === String(name).toLowerCase()); if (!sk) return console.warn('[TravelVisuals] skill yok:', name);
    this.playFx(sk.fx, wx, wy, Object.assign({}, sk.opts, extra || {}));
  };
  // --- bölge değiştir ---
  P.setZone = function (zoneName) {
    this.zoneName = zoneName; setupBio(this); this.tileSprites = {}; this.generateMap();
  };

  // ==========================================================================
  //  DIŞA AÇILAN
  // ==========================================================================
  const TravelVisuals = global.TravelVisuals = {
    options: { tiles: true, scenery: true, weather: true, mobs: true },
    detectBiome, BIOMES, BIOME_MOBS, mobs: MOBS, props: PROPS, fx, FX_DURATION, skills: SKILLS, kit: KIT, defineFx, defineSkill, skillsFor, transitionPresets: TRANSITION_PRESETS, cyclePresets: CYCLE_PRESETS,
    // Test: 1..9 tuşları efektleri oyuncunun üstünde dener
    installDemoKeys(engine) {
      const names = Object.keys(fx);
      const h = (e) => { const i = parseInt(e.key, 10) - 1; if (i >= 0 && i < names.length) engine.playFx(names[i], engine.player.x, engine.player.y, { follow: true }); };
      window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
    }
  };
})(typeof window !== 'undefined' ? window : this);
