/* Setra Travel - isometric shared world map renderer.
   Server owns the map + interactions; this file only draws and sends input. */
(function () {
  const TW = 64, TH = 32;
  const BLOCKED = new Set([0, 1, 6]);
  const TYPE_PAL = {
    verdant: { water: ["#1d3b52", "#26506b"], ground: ["#3f6b3a", "#4c7a41"], accent: [90, 55] },
    ashen:   { water: ["#3a2a24", "#4d382c"], ground: ["#5a4a3c", "#6b5747"], accent: [40, 25] },
    frost:   { water: ["#2a4a5e", "#356080"], ground: ["#8fa3ad", "#a9bcc4"], accent: [130, 20] },
    swamp:   { water: ["#223b2c", "#2c4d38"], ground: ["#425c33", "#4e6a3b"], accent: [80, 30] },
    cursed:  { water: ["#241a34", "#33254a"], ground: ["#3a3347", "#463d57"], accent: [60, 25] },
  };
  const POI_ICON = { dungeon: "\u{1F3F0}", den: "\u{1F43E}", chest: "\u{1F4E6}", inn: "\u{1F3E0}", ruin: "\u{1F5FF}", watch: "\u{1F5FC}" };
  const POI_COLOR = { dungeon: "#ff7b4d", den: "#e05555", chest: "#ffd166", inn: "#8fd6a0", ruin: "#b7a6e0", watch: "#8ec5ff" };

  const S = {
    root: null, canvas: null, ctx: null, W: 0, H: 0, dpr: 1,
    tiles: null, w: 0, h: 0, type: "verdant", seed: 0, active: false,
    pois: [], explored: null, revealed: false,
    me: { x: 0, y: 0, vx: 0, vy: 0, moving: 0 }, cam: { x: 0, y: 0 },
    others: {}, keys: {}, room: null, raf: 0, last: 0, t: 0,
    hoverPoi: null, party: null, invite: null, posDirty: false, lastSent: 0,
    particles: [], ready: false,
  };

  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function ensure(root) {
    if (S.ready && S.root === root) return;
    S.root = root;
    root.innerHTML = `
      <div class="tv-shell">
        <canvas class="tv-canvas"></canvas>
        <div class="tv-top">
          <div class="tv-title" id="tv-title">Travel</div>
          <div class="tv-stats" id="tv-stats"></div>
        </div>
        <div class="tv-invite hidden" id="tv-invite"></div>
        <div class="tv-party hidden" id="tv-party"></div>
        <div class="tv-prompt hidden" id="tv-prompt"></div>
        <div class="tv-toast hidden" id="tv-toast"></div>
        <div class="tv-help">WASD / Ok tuslari: yuru &middot; E: etkilesim &middot; Davetleri kabul et</div>
      </div>`;
    S.canvas = root.querySelector(".tv-canvas");
    S.ctx = S.canvas.getContext("2d");
    S.ready = true;
    resize();
    if (!S.raf) S.raf = requestAnimationFrame(loop);
    root.querySelector("#tv-invite").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-accept]");
      if (btn) socket.emit("travel:accept");
    });
    root.querySelector("#tv-party").addEventListener("click", (e) => {
      const start = e.target.closest("[data-start]");
      if (start && S.party) socket.emit("travel:start", { poiId: S.party.poiId });
    });
    root.querySelector("#tv-prompt").addEventListener("click", () => interact());
  }

  function resize() {
    if (!S.canvas) return;
    S.dpr = Math.min(2, window.devicePixelRatio || 1);
    S.W = S.canvas.clientWidth; S.H = S.canvas.clientHeight;
    S.canvas.width = Math.max(1, Math.floor(S.W * S.dpr));
    S.canvas.height = Math.max(1, Math.floor(S.H * S.dpr));
    S.ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  }

  function bindInput() {
    const KM = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", e: "use", E: "use" };
    window.addEventListener("keydown", (e) => {
      if (!S.active) return;
      const k = KM[e.key];
      if (k) { S.keys[k] = true; e.preventDefault(); }
    });
    window.addEventListener("keyup", (e) => {
      const k = KM[e.key];
      if (k) S.keys[k] = false;
    });
  }

  function setMap(map) {
    if (!map) return;
    S.seed = map.seed; S.type = map.type; S.w = map.w; S.h = map.h;
    S.tiles = new Uint8Array(map.w * map.h);
    for (let i = 0; i < map.tiles.length; i++) S.tiles[i] = parseInt(map.tiles[i], 36) || 0;
    S.explored = new Uint8Array(map.w * map.h);
    if (typeof map.explored === "string" && map.explored.length === map.w * map.h) {
      for (let i = 0; i < map.explored.length; i++) S.explored[i] = map.explored.charCodeAt(i) === 49 ? 1 : 0;
    }
    S.revealed = false;
    if (map.spawn) { S.me.x = map.spawn.x + 0.5; S.me.y = map.spawn.y + 0.5; S.cam.x = S.me.x; S.cam.y = S.me.y; }
    revealAround(S.me.x, S.me.y, 8);
  }

  function addExplored(list) {
    if (!S.explored || !list) return;
    for (let i = 0; i < list.length; i++) {
      const idx = list[i];
      if (idx >= 0 && idx < S.explored.length) S.explored[idx] = 1;
    }
  }

  // Oyuncunun kendi dünyasını çözer (aynı odada birden çok sefer olabilir).
  function currentTravel(room) {
    if (!room) return null;
    const meId = (typeof state !== "undefined" && state.playerId) || (room.players[0] && room.players[0].id);
    const me = meId && room.players ? room.players.find((p) => p.id === meId) : null;
    if (me && me.travelId && room.travels && room.travels[me.travelId]) return room.travels[me.travelId];
    if (room.travel && room.travel.active) return room.travel;
    if (room.travels) {
      for (const k of Object.keys(room.travels)) {
        if (room.travels[k] && room.travels[k].active) return room.travels[k];
      }
    }
    return null;
  }

  function update(room) {
    const tv = currentTravel(room);
    if (!room || !tv) return;
    S.room = room;
    S.pois = tv.pois || [];
    const meId = (typeof state !== "undefined" && state.playerId) || (room.players[0] && room.players[0].id);
    const pos = (tv.pos || {})[meId];
    if (pos && !S.keys.up && !S.keys.down && !S.keys.left && !S.keys.right) {
      // resync if server moved us (teleport) and we are idle
      if (Math.abs(pos.x - S.me.x) > 3 || Math.abs(pos.y - S.me.y) > 3) { S.me.x = pos.x; S.me.y = pos.y; }
    }
    S.others = {};
    for (const [id, p] of Object.entries(tv.pos || {})) {
      if (id === meId) continue;
      const pl = room.players.find((x) => x.id === id);
      S.others[id] = { x: p.x, y: p.y, name: pl ? pl.name : "?", character: pl ? pl.character : "", id };
    }
    S.invite = (tv.invites || {})[meId] || null;
    const under = poiUnderPlayer();
    S.hoverPoi = under;
    S.party = under ? (tv.parties || {})[under.id] || null : null;
    renderHud();
    renderInvite();
    renderParty();
    renderPrompt();
  }

  function teleport(x, y) {
    S.me.x = x; S.me.y = y;
    revealAround(x, y, 5);
  }
  function reveal() { S.revealed = true; }

  function poiUnderPlayer() {
    for (const p of S.pois) {
      if (Math.hypot(S.me.x - p.x - 0.5, S.me.y - p.y - 0.5) < 1.15) return p;
    }
    return null;
  }

  function interact() {
    const p = S.hoverPoi;
    if (p) socket.emit("travel:interact", { poiId: p.id });
  }

  // ---- drawing ----
  const sx = (x, y) => S.W / 2 + (x - y) * TW / 2 - (S.cam.x - S.cam.y) * TW / 2;
  const sy = (x, y) => S.H / 2 + (x + y) * TH / 2 - (S.cam.x + S.cam.y) * TH / 2;
  function walkable(x, y) {
    const i = Math.floor(x), j = Math.floor(y);
    if (i < 0 || j < 0 || i >= S.w || j >= S.h) return false;
    return !BLOCKED.has(S.tiles[j * S.w + i]);
  }
  function canStand(x, y, r) {
    r = r || 0.26;
    return walkable(x - r, y - r) && walkable(x + r, y - r) && walkable(x - r, y + r) && walkable(x + r, y + r);
  }
  function revealAround(x, y, rad) {
    if (!S.explored) return;
    const ci = Math.floor(x), cj = Math.floor(y);
    for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) {
      if (i * i + j * j > rad * rad) continue;
      const a = ci + i, b = cj + j;
      if (a >= 0 && b >= 0 && a < S.w && b < S.h) S.explored[b * S.w + a] = 1;
    }
  }

  function tileColor(code, v) {
    const pal = TYPE_PAL[S.type] || TYPE_PAL.verdant;
    const sh = v % 12;
    if (code === 0) return pal.water[0];
    if (code === 1) return pal.water[1];
    if (code === 6) return "#4a4640";
    if (code === 7) return "#c9d6dc";
    if (code === 8) return "#4a3b34";
    if (code === 9) return "#3b5040";
    if (code === 10) return "#7a6a4e";
    if (code === 11) return "#6d7a86";
    if (code === 4) return `hsl(${pal.accent[0] - 6} 34% ${22 + (sh % 5)}%)`;
    return pal.ground[sh % 2];
  }

  function diamond(i, j, col) {
    const c = S.ctx;
    c.beginPath();
    c.moveTo(sx(i, j), sy(i, j));
    c.lineTo(sx(i + 1, j), sy(i + 1, j));
    c.lineTo(sx(i + 1, j + 1), sy(i + 1, j + 1));
    c.lineTo(sx(i, j + 1), sy(i, j + 1));
    c.closePath();
    c.fillStyle = col; c.fill();
  }
  function tree(x, y, v) {
    const c = S.ctx, px = sx(x, y), py = sy(x, y), h = 34 + v * 20;
    c.fillStyle = "#0004"; c.beginPath(); c.ellipse(px, py, 18, 8, 0, 0, 7); c.fill();
    c.fillStyle = "#4a3220"; c.fillRect(px - 3, py - 12, 6, 12);
    for (let k = 0; k < 3; k++) {
      const by = py - 10 - k * h * 0.28, w = 22 - k * 5;
      c.fillStyle = `hsl(${112 + k * 6} ${S.type === "ashen" ? 18 : 40}% ${16 + k * 5}%)`;
      c.beginPath(); c.moveTo(px, by - h * 0.4); c.lineTo(px + w, by + 4); c.lineTo(px - w, by + 4); c.closePath(); c.fill();
    }
  }
  function rock(x, y, v) {
    const c = S.ctx, px = sx(x, y), py = sy(x, y), s = 13 + v * 9;
    c.fillStyle = "#0004"; c.beginPath(); c.ellipse(px, py, s * 1.1, s * 0.5, 0, 0, 7); c.fill();
    c.fillStyle = "#5b5750"; c.beginPath(); c.moveTo(px - s, py); c.lineTo(px - s * 0.6, py - s * 0.9); c.lineTo(px + s * 0.3, py - s * 1.1); c.lineTo(px + s, py - s * 0.2); c.lineTo(px + s * 0.7, py + 2); c.closePath(); c.fill();
  }
  const CLASS_ARMOR = {
    warrior: { body: "#b0483a", hair: "#2b1c14" },
    ranger:  { body: "#4f8b46", hair: "#3a2a18" },
    mage:    { body: "#5560bd", hair: "#d8d2c4" },
    rogue:   { body: "#6a6472", hair: "#241f28" },
    paladin: { body: "#d3ad55", hair: "#5a431c" },
  };
  function hashColor(id) {
    let h = 0; const s = String(id || "?");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return { body: `hsl(${hue} 52% 46%)`, hair: `hsl(${(hue + 40) % 360} 42% 24%)` };
  }
  function playerLook(p) {
    if (!p) return hashColor("?");
    return CLASS_ARMOR[p.character] || hashColor(p.id);
  }
  function shadow(px, py, rx) {
    const c = S.ctx;
    c.fillStyle = "#0006";
    c.beginPath(); c.ellipse(px, py, rx, rx * 0.45, 0, 0, 7); c.fill();
  }
  // Simple cute chibi: big head, tiny body, per-player armor colour + name tag.
  function drawPlayer(px, py, look, moving, tm, name, mine) {
    const c = S.ctx;
    const bob = moving ? Math.abs(Math.sin(tm * 10)) * 3 : Math.sin(tm * 2) * 0.8;
    const bodyR = 7, headR = 10;
    const bodyY = py - bob - bodyR * 1.2;
    shadow(px, py, 11);
    if (mine) { c.strokeStyle = "#7CFFB2"; c.lineWidth = 2; c.beginPath(); c.ellipse(px, py, 15, 7, 0, 0, 7); c.stroke(); }
    // little feet
    c.fillStyle = "rgba(20,16,12,0.85)";
    c.beginPath(); c.ellipse(px - bodyR * 0.5, py - bob - 1, bodyR * 0.42, bodyR * 0.3, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(px + bodyR * 0.5, py - bob - 1, bodyR * 0.42, bodyR * 0.3, 0, 0, 7); c.fill();
    // small chibi body
    c.fillStyle = look.body;
    c.beginPath(); c.ellipse(px, bodyY, bodyR, bodyR * 1.12, 0, 0, 7); c.fill();
    c.fillStyle = "rgba(255,255,255,0.14)";
    c.beginPath(); c.ellipse(px, bodyY - bodyR * 0.25, bodyR * 0.55, bodyR * 0.45, 0, 0, 7); c.fill();
    // big head
    const hy = bodyY - bodyR * 1.25 - headR * 0.75;
    c.fillStyle = "#f3d0a6"; c.beginPath(); c.arc(px, hy, headR, 0, 7); c.fill();
    // hair / cap
    c.fillStyle = look.hair;
    c.beginPath(); c.arc(px, hy - 1.2, headR, Math.PI * 1.02, Math.PI * 1.98); c.fill();
    c.fillRect(px - headR, hy - 1.2, headR * 2, 3.2);
    // eyes + blush
    c.fillStyle = "#232833";
    c.beginPath(); c.arc(px - headR * 0.36, hy + 2.2, 1.6, 0, 7); c.fill();
    c.beginPath(); c.arc(px + headR * 0.36, hy + 2.2, 1.6, 0, 7); c.fill();
    c.fillStyle = "rgba(233,120,120,0.5)";
    c.beginPath(); c.arc(px - headR * 0.62, hy + 4.2, 1.7, 0, 7); c.fill();
    c.beginPath(); c.arc(px + headR * 0.62, hy + 4.2, 1.7, 0, 7); c.fill();
    // name tag above the head
    const label = (name || "").trim();
    if (label) {
      c.font = "bold 11px Georgia"; c.textAlign = "center"; c.textBaseline = "alphabetic";
      const w = c.measureText(label).width;
      const ty = hy - headR - 6;
      c.fillStyle = mine ? "rgba(18,64,44,0.78)" : "rgba(10,8,6,0.74)";
      c.beginPath();
      if (c.roundRect) c.roundRect(px - w / 2 - 5, ty - 10, w + 10, 14, 7);
      else c.rect(px - w / 2 - 5, ty - 10, w + 10, 14);
      c.fill();
      c.fillStyle = mine ? "#b8ffd6" : "#f0e6d2";
      c.fillText(label, px, ty - 0.5);
    }
  }
  function drawPoi(poi) {
    const c = S.ctx, px = sx(poi.x + 0.5, poi.y + 0.5), py = sy(poi.x + 0.5, poi.y + 0.5);
    const under = S.hoverPoi && S.hoverPoi.id === poi.id;
    c.save();
    c.globalAlpha = 0.9;
    c.fillStyle = poi.consumed ? "#333" : (POI_COLOR[poi.kind] || "#ddd");
    c.beginPath(); c.ellipse(px, py, 20, 10, 0, 0, 7); c.fill();
    c.restore();
    if (under) { c.strokeStyle = "#7CFFB2"; c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, 24, 12, 0, 0, 7); c.stroke(); }
    c.font = "24px serif"; c.textAlign = "center"; c.textBaseline = "alphabetic";
    c.globalAlpha = poi.consumed ? 0.4 : 1;
    c.fillText(POI_ICON[poi.kind] || "\u2757", px, py - 6);
    c.globalAlpha = 1;
    c.fillStyle = "#f0e6d2"; c.font = "bold 11px Georgia"; c.fillText(poi.name, px, py - 34);
  }

  function draw(tm) {
    const c = S.ctx;
    c.clearRect(0, 0, S.W, S.H);
    c.fillStyle = "#0b0908"; c.fillRect(0, 0, S.W, S.H);
    if (!S.tiles) return;
    const pal = TYPE_PAL[S.type] || TYPE_PAL.verdant;
    const list = [];
    for (let j = 0; j < S.h; j++) {
      for (let i = 0; i < S.w; i++) {
        const px = sx(i + 0.5, j + 0.5), py = sy(i + 0.5, j + 0.5);
        if (px < -80 || px > S.W + 80 || py < -100 || py > S.H + 100) continue;
        const code = S.tiles[j * S.w + i];
        const seen = S.revealed || (S.explored && S.explored[j * S.w + i]);
        const v = ((i * 7 + j * 13) % 12);
        diamond(i, j, seen ? tileColor(code, v) : "#0e0c0a");
        if (seen && (code === 4 || code === 6) && i > 0 && j > 0 && i < S.w - 1 && j < S.h - 1) {
          list.push({ d: i + j + 1, f: () => (code === 4 ? tree(i + 0.5, j + 0.5, v / 12) : rock(i + 0.5, j + 0.5, v / 12)) });
        }
      }
    }
    for (const poi of S.pois) {
      const seen = S.revealed || (S.explored && S.explored[Math.floor(poi.y) * S.w + Math.floor(poi.x)]);
      if (seen) list.push({ d: poi.x + poi.y + 0.5, f: () => drawPoi(poi) });
    }
    const selfP = S.room && S.room.players ? S.room.players.find((pp) => pp.id === state.playerId) : null;
    list.push({ d: S.me.x + S.me.y, f: () => drawPlayer(sx(S.me.x, S.me.y), sy(S.me.x, S.me.y), playerLook(selfP), S.me.moving, tm, (selfP && selfP.name) || "You", true) });
    for (const o of Object.values(S.others)) {
      list.push({ d: o.x + o.y, f: () => drawPlayer(sx(o.x, o.y), sy(o.x, o.y), playerLook(o), 0, tm, o.name, false) });
    }
    list.sort((a, b) => a.d - b.d).forEach((o) => o.f());

    // ambient motes
    for (const p of S.particles) {
      c.globalAlpha = p.a; c.fillStyle = p.col;
      c.beginPath(); c.arc(sx(p.x, p.y), sy(p.x, p.y) - p.z, p.r, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
    // vignette
    const g = c.createRadialGradient(S.W / 2, S.H / 2, Math.min(S.W, S.H) * 0.35, S.W / 2, S.H / 2, Math.max(S.W, S.H) * 0.75);
    g.addColorStop(0, "#0000"); g.addColorStop(1, "#000c");
    c.fillStyle = g; c.fillRect(0, 0, S.W, S.H);
  }

  function updateSim(dt, tm) {
    if (!S.tiles) return;
    if (S.keys.use) { S.keys.use = false; interact(); }
    let ix = (S.keys.right ? 1 : 0) - (S.keys.left ? 1 : 0);
    let iy = (S.keys.down ? 1 : 0) - (S.keys.up ? 1 : 0);
    S.me.moving = ix || iy ? 1 : 0;
    if (ix || iy) {
      let vx = ix + iy, vy = iy - ix;
      const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
      const sp = 4.6 * dt;
      if (canStand(S.me.x + vx * sp, S.me.y)) S.me.x += vx * sp;
      if (canStand(S.me.x, S.me.y + vy * sp)) S.me.y += vy * sp;
      revealAround(S.me.x, S.me.y, 6);
      S.posDirty = true;
    }
    // camera easing
    S.cam.x += (S.me.x - S.cam.x) * Math.min(1, dt * 7);
    S.cam.y += (S.me.y - S.cam.y) * Math.min(1, dt * 7);
    // throttle position sync
    if (S.posDirty && tm - S.lastSent > 0.2) {
      S.posDirty = false; S.lastSent = tm;
      socket.emit("travel:pos", { x: S.me.x, y: S.me.y });
    }
    // motes
    if (Math.random() < dt * 6 && S.particles.length < 40) {
      S.particles.push({ x: S.me.x + (Math.random() - 0.5) * 18, y: S.me.y + (Math.random() - 0.5) * 18, z: Math.random() * 40 + 10, r: 1 + Math.random() * 1.6, a: 0.5, col: S.type === "frost" ? "#cfe" : "#fc9", vx: (Math.random() - 0.5) * 0.04, vy: (Math.random() - 0.5) * 0.04 });
    }
    for (const p of S.particles) { p.x += p.vx; p.y += p.vy; p.z -= dt * 6; p.a -= dt * 0.12; }
    S.particles = S.particles.filter((p) => p.a > 0 && p.z > -4);
    const under = poiUnderPlayer();
    if (under !== S.hoverPoi) { S.hoverPoi = under; const tvNow = currentTravel(S.room); S.party = under && tvNow ? (tvNow.parties || {})[under.id] || null : null; renderPrompt(); renderParty(); }
  }

  function loop(ts) {
    S.raf = requestAnimationFrame(loop);
    if (!S.active) return;
    const tm = ts / 1000;
    const dt = Math.min(0.05, tm - S.last || 0.016);
    S.last = tm; S.t += dt;
    updateSim(dt, tm);
    draw(tm);
  }

  // ---- DOM panels ----
  function renderHud() {
    const me = S.room && S.room.players.find((p) => p.id === state.playerId);
    const t = S.room && currentTravel(S.room);
    if (!me || !t) return;
    const title = $("tv-title");
    if (title) title.textContent = `${t.typeLabel || "Wilds"} \u00b7 ${t.sizeLabel || ""}`;
    const stats = $("tv-stats");
    if (stats) stats.innerHTML = `\u2764 ${Math.max(0, Math.ceil(me.hp))}/${me.maxHp} &nbsp; \u2728 ${me.mana}/${me.maxMana} &nbsp; \u26A1 ${me.stamina} &nbsp; \u{1F4B0} ${me.gold}`;
  }
  function renderInvite() {
    const el = $("tv-invite");
    if (!el) return;
    if (!S.invite) { el.classList.add("hidden"); return; }
    const poi = S.pois.find((p) => p.id === S.invite.poiId);
    el.classList.remove("hidden");
    el.innerHTML = `<span>\u{1F4E8} <b>${escapeHtml(S.invite.fromName)}</b> seni <b>${escapeHtml(poi ? poi.name : "bir yere")}</b> davet ediyor</span><button type="button" class="btn btn--gold" data-accept>Kabul et</button>`;
  }
  function renderParty() {
    const el = $("tv-party");
    if (!el) return;
    const party = S.party;
    if (!party || party.status !== "waiting") { el.classList.add("hidden"); return; }
    const meId = state.playerId;
    const isLeader = party.leaderId === meId;
    const isMember = party.memberIds.includes(meId);
    const names = party.memberIds.map((id) => {
      const p = S.room.players.find((x) => x.id === id);
      return p ? p.name : "?";
    }).join(", ");
    el.classList.remove("hidden");
    el.innerHTML = `<div class="tv-party-body"><b>${escapeHtml(party.kind === "den" ? "Creature Den" : "Dungeon")}</b> \u00b7 ${escapeHtml(party.rank)}
      <div class="tv-party-members">${escapeHtml(names)}</div></div>
      ${isLeader ? `<button type="button" class="btn btn--gold" data-start>Ba\u015flat</button>` : (isMember ? `<span class="muted">Lideri bekliyorsun...</span>` : "")}`;
  }
  const POI_VERB = { chest: "Sandigi ac", inn: "Dinlen", ruin: "Ara", watch: "Isigi yak" };
  function renderPrompt() {
    const el = $("tv-prompt");
    if (!el) return;
    const p = S.hoverPoi;
    if (!p || p.kind === "dungeon" || p.kind === "den") { el.classList.add("hidden"); return; }
    if (p.consumed && p.kind !== "watch") { el.classList.add("hidden"); return; }
    el.classList.remove("hidden");
    const verb = POI_VERB[p.kind] || "Etkilesim";
    el.innerHTML = `<b>${escapeHtml(p.name)}</b> \u00b7 <span class="tv-key">E</span> ${escapeHtml(verb)}`;
  }
  function toast(msg) {
    const el = $("tv-toast"); if (!el) return;
    el.textContent = msg; el.classList.remove("hidden");
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.add("hidden"), 2600);
  }
  function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }

  bindInput();
  window.addEventListener("resize", resize);

  window.SetraTravel = {
    ensure, setMap, update, open() { S.active = true; S.last = performance.now() / 1000; if (!S.raf) S.raf = requestAnimationFrame(loop); },
    pause() { S.active = false; },
    close() { S.active = false; if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; } S.ready = false; S.tiles = null; S.root = null; S.canvas = null; S.ctx = null; },
    teleport, reveal, toast, addExplored,
    setOtherPos(id, x, y) { if (S.others[id]) { S.others[id].x = x; S.others[id].y = y; } },
    hasMap() { return !!S.tiles; },
  };
})();
