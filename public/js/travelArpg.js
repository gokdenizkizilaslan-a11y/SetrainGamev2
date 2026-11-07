/* Setra Travel - ARPG adapter.
   Sunucu dünyanın/POI'lerin sahibidir; TravelEngine yalnızca çizer ve oynatır.
   Eski SetraTravel API'si birebir korunur. */
(function () {
  const S = {
    root: null, canvas: null, engine: null, map: null, room: null,
    spawn: { x: 0, y: 0 }, ready: false, active: false,
    others: {}, hudTimer: 0, poiSig: "",
  };

  function $(id) { return document.getElementById(id); }
  function myId() { return (typeof state !== "undefined" && state.playerId) || null; }
  function meFrom(room) {
    const id = myId();
    return id && room && room.players ? room.players.find((p) => p.id === id) : null;
  }
  function currentTravel(room) {
    if (!room) return null;
    const me = meFrom(room);
    if (me && me.travelId && room.travels && room.travels[me.travelId]) return room.travels[me.travelId];
    if (room.travel && room.travel.active) return room.travel;
    if (room.travels) {
      for (const k of Object.keys(room.travels)) if (room.travels[k] && room.travels[k].active) return room.travels[k];
    }
    return null;
  }
  function computeRadius(map) {
    const sp = { x: (map.spawn && map.spawn.x) || 0, y: (map.spawn && map.spawn.y) || 0 };
    const maxDist = Math.hypot(
      Math.max(sp.x, map.w - sp.x),
      Math.max(sp.y, map.h - sp.y)
    );
    return Math.max(10, Math.ceil(maxDist) + 3);
  }
  function playerPayload(me) {
    return {
      name: me ? me.name : "Kahraman",
      class: me ? me.character : "warrior",
      level: me ? me.level || 1 : 1,
      stats: {
        attack: me ? me.attack || 10 : 20,
        critChance: me ? (me.critChance || 0) / 100 : 0.1,
        critMultiplier: me ? 1 + (me.critDamage || 0) / 100 : 1.5,
        speed: me && me.speed ? 120 + me.speed * 2 : 200,
        omnivamp: me ? (me.omnivamp || 0) / 100 : 0,
        defense: me ? me.resistance || 0 : 0,
        maxHp: me ? me.maxHp || 100 : 100,
        currentHp: me ? (me.hp != null ? me.hp : me.maxHp || 100) : 100,
        maxMana: me ? me.maxMana || 0 : 0,
        currentMana: me ? me.mana || 0 : 0,
        gold: me ? me.gold || 0 : 0,
      },
    };
  }
  function zoneName(room) {
    const tv = currentTravel(room);
    return tv ? `${tv.typeLabel || "Wilds"} - ${tv.sizeLabel || "Normal"}` : "Travel";
  }

  function injectStyles() {
    if (document.getElementById("tv-arpg-style")) return;
    const st = document.createElement("style");
    st.id = "tv-arpg-style";
    st.textContent = `
      .tv-shell { position: relative; width: 100%; height: 100%; overflow: hidden; }
      .tv-canvas { display: block; width: 100%; height: 100%; touch-action: none; }
      .tv-mobile { display: none; }
      @media (hover: none), (pointer: coarse) {
        .tv-mobile { display: block; position: absolute; inset: 0; pointer-events: none; }
        .tv-help { display: none; }
      }
      .tv-stick { position: absolute; left: 22px; bottom: 22px; width: 116px; height: 116px; border-radius: 50%;
        background: rgba(20,16,10,0.45); border: 2px solid rgba(255,214,120,0.5); pointer-events: auto; touch-action: none; }
      .tv-knob { position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; margin: 0; border-radius: 50%;
        transform: translate(-50%, -50%); background: radial-gradient(circle at 35% 30%, #ffe08a, #b8862f);
        box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
      .tv-buttons { position: absolute; right: 16px; bottom: 22px; display: grid; grid-template-columns: repeat(3, 54px);
        gap: 8px; pointer-events: auto; }
      .tv-mbtn { width: 54px; height: 54px; border-radius: 50%; border: 2px solid rgba(255,214,120,0.55);
        background: rgba(28,22,14,0.7); color: #ffe6a8; font: 700 13px system-ui, sans-serif; touch-action: none; }
      .tv-mbtn--atk { grid-column: 3; width: 64px; height: 64px; background: rgba(150,40,30,0.75); }
      .tv-mbtn.is-cooling { opacity: 0.45; }
    `;
    document.head.appendChild(st);
  }

  function ensure(root) {
    if (S.ready && S.root === root) return;
    injectStyles();
    if (S.engine) { try { S.engine.destroy(); } catch (e) {} S.engine = null; }
    S.root = root;
    root.innerHTML = `
      <div class="tv-shell">
        <canvas class="tv-canvas"></canvas>
        <div class="tv-top">
          <div class="tv-title" id="tv-title">Travel</div>
          <div class="tv-stats" id="tv-stats"></div>
        </div>
        <div class="tv-prompt hidden" id="tv-prompt"></div>
        <div class="tv-toast hidden" id="tv-toast"></div>
        <div class="tv-help">WASD: yuru &middot; Sol tik: saldiri &middot; Space: dash &middot; Q/E/R: skill &middot; E: etkilesim</div>
        <div class="tv-mobile" id="tv-mobile">
          <div class="tv-stick" id="tv-stick"><div class="tv-knob" id="tv-knob"></div></div>
          <div class="tv-buttons">
            <button type="button" class="tv-mbtn" data-skill="q">Q</button>
            <button type="button" class="tv-mbtn" data-skill="e">E</button>
            <button type="button" class="tv-mbtn" data-skill="r">R</button>
            <button type="button" class="tv-mbtn tv-mbtn--atk" data-act="attack">ATK</button>
            <button type="button" class="tv-mbtn" data-act="dash">DASH</button>
          </div>
        </div>
      </div>`;
    S.canvas = root.querySelector(".tv-canvas");
    S.ready = true;
    const prompt = root.querySelector("#tv-prompt");
    if (prompt) prompt.addEventListener("click", () => {
      if (S.engine && S.engine._interactTarget) handleInteract(S.engine._interactTarget);
    });
    bindMobile();
    if (S.map) boot();
  }

  function boot() {
    if (S.engine) return;
    if (!S.ready || !S.canvas) return;
    if (!window.TravelEngine) { toast("Travel motoru yuklenemedi."); return; }
    const map = S.map;
    if (!map) return;
    S.spawn = { x: (map.spawn && map.spawn.x) || 0, y: (map.spawn && map.spawn.y) || 0 };
    const radius = computeRadius(map);
    const me = meFrom(S.room);
    S.engine = new window.TravelEngine(S.canvas, {
      player: playerPayload(me),
      zoneName: zoneName(S.room),
      mapRadius: radius,
      tileSize: 64,
      onInteract: handleInteract,
      onMove: (pos) => { if (S.active && typeof socket !== "undefined") socket.emit("travel:pos", pos); },
      onKill: (m) => { if (S.active && typeof socket !== "undefined") socket.emit("travel:kill", { kind: m && m.kind, exp: m && m.exp }); },
    });
    S.engine.setWorldBounds(map);
    applyRoom(S.room);
    startHud();
    if (!S.active) { S.engine.isRunning = false; }
  }

  function setMap(map) {
    if (!map) return;
    S.map = map;
    if (S.ready) boot();
  }

  function applyRoom(room) {
    if (!S.engine) return;
    S.room = room;
    const tv = currentTravel(room);
    if (!tv) return;
    const me = meFrom(room);
    S.engine.applyPlayerData(me);
    const pos = (tv.pos || {})[myId()];
    if (pos) S.engine.setServerPlayer(pos);
    const sig = (tv.id || "") + "|" + (tv.pois || []).map((p) => p.id + (p.consumed ? "1" : "0")).join(",");
    if (sig !== S.poiSig) { S.poiSig = sig; S.engine.placePOIs(tv.pois || []); }
  }

  function update(room) {
    S.room = room;
    if (!S.engine) { if (S.map) boot(); return; }
    applyRoom(room);
  }

  function open() {
    S.active = true;
    if (!S.engine && S.map) boot();
    if (S.engine && !S.engine.isRunning) {
      S.engine.isRunning = true;
      S.engine.lastTime = performance.now();
      requestAnimationFrame(S.engine.loop);
    }
  }
  function pause() { S.active = false; if (S.engine) S.engine.isRunning = false; }
  function close() {
    S.active = false;
    stopHud();
    if (S.engine) { try { S.engine.destroy(); } catch (e) {} S.engine = null; }
    S.ready = false; S.root = null; S.canvas = null; S.map = null; S.poiSig = "";
  }

  function teleport(x, y) {
    if (S.engine) S.engine.setServerPlayer({ x, y }, true);
  }

  function handleInteract(obj) {
    if (!obj) return;
    if (obj.type === "poi" && obj.poiId && typeof socket !== "undefined") {
      socket.emit("travel:interact", { poiId: obj.poiId });
      return;
    }
    if (obj.type === "shrine") toast("Kamp atesi. Dinlenmek icin sehre don.");
  }

  function toast(msg) {
    if (!S.root) return;
    const el = S.root.querySelector("#tv-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add("hidden"), 2600);
  }

  function startHud() {
    stopHud();
    S.hudTimer = setInterval(renderHud, 200);
    renderHud();
  }
  function stopHud() {
    if (S.hudTimer) { clearInterval(S.hudTimer); S.hudTimer = 0; }
  }
  function renderHud() {
    if (!S.engine || !S.root) return;
    const me = meFrom(S.room);
    const st = S.engine.playerData.stats || {};
    const title = S.root.querySelector("#tv-title");
    const z = S.engine.zoneName || "Travel";
    if (title) title.textContent = z;
    const stats = S.root.querySelector("#tv-stats");
    if (stats) {
      const hp = me ? `${Math.max(0, Math.ceil(me.hp))}/${me.maxHp}` : `${Math.ceil(st.currentHp)}/${st.maxHp}`;
      const mana = me ? `${me.mana}/${me.maxMana}` : `${Math.ceil(st.currentMana)}/${st.maxMana}`;
      const stam = me ? me.stamina : "-";
      const cd = S.engine.player.cooldowns || {};
      const cdTxt = ["q", "e", "r"].map((k) => {
        const v = cd[k];
        return v && v.current > 0 ? `${k.toUpperCase()} ${v.current.toFixed(1)}s` : k.toUpperCase();
      }).join("  ");
      stats.innerHTML = `\u2764 ${hp} &nbsp; \u2728 ${mana} &nbsp; \u26A1 ${stam} &nbsp; ${cdTxt}`;
    }
    const prompt = S.root.querySelector("#tv-prompt");
    if (prompt) {
      const target = S.engine._interactTarget;
      if (target) {
        const label = target.type === "poi" ? (target.name || target.kind) : "Kamp";
        prompt.innerHTML = `<b>E</b> &mdash; ${escapeHtml(label)}`;
        prompt.classList.remove("hidden");
      } else {
        prompt.classList.add("hidden");
      }
    }
    if (S.root) {
      S.root.querySelectorAll("[data-skill]").forEach((b) => {
        const k = b.getAttribute("data-skill");
        const cdv = S.engine.player.cooldowns && S.engine.player.cooldowns[k];
        b.classList.toggle("is-cooling", !!(cdv && cdv.current > 0));
      });
    }
  }

  function bindMobile() {
    if (!S.root) return;
    const stick = S.root.querySelector("#tv-stick");
    const knob = S.root.querySelector("#tv-knob");
    if (stick && knob) {
      let touchId = null, cx = 0, cy = 0;
      const setMove = (dx, dy) => {
        if (!S.engine) return;
        S.engine.keys["w"] = dy < -0.28;
        S.engine.keys["s"] = dy > 0.28;
        S.engine.keys["a"] = dx < -0.28;
        S.engine.keys["d"] = dx > 0.28;
      };
      const resetMove = () => { if (S.engine) { S.engine.keys["w"] = S.engine.keys["s"] = S.engine.keys["a"] = S.engine.keys["d"] = false; } knob.style.transform = "translate(-50%, -50%)"; };
      stick.addEventListener("touchstart", (e) => {
        const t = e.changedTouches[0]; touchId = t.identifier;
        const r = stick.getBoundingClientRect();
        cx = r.left + r.width / 2; cy = r.top + r.height / 2;
        e.preventDefault();
      }, { passive: false });
      stick.addEventListener("touchmove", (e) => {
        for (const t of e.changedTouches) {
          if (t.identifier !== touchId) continue;
          const dx = Math.max(-1, Math.min(1, (t.clientX - cx) / 48));
          const dy = Math.max(-1, Math.min(1, (t.clientY - cy) / 48));
          knob.style.transform = `translate(calc(-50% + ${dx * 34}px), calc(-50% + ${dy * 34}px))`;
          setMove(dx, dy);
        }
        e.preventDefault();
      }, { passive: false });
      const end = (e) => {
        for (const t of e.changedTouches) if (t.identifier === touchId) { touchId = null; resetMove(); }
      };
      stick.addEventListener("touchend", end);
      stick.addEventListener("touchcancel", end);
    }
    const skillBtn = (b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        if (!S.engine) return;
        if (b.hasAttribute("data-skill")) S.engine.triggerSkill(b.getAttribute("data-skill"));
        else if (b.getAttribute("data-act") === "dash") S.engine.triggerDash();
        else if (b.getAttribute("data-act") === "attack") attackNearest();
      });
    };
    S.root.querySelectorAll(".tv-mbtn").forEach(skillBtn);
  }

  function attackNearest() {
    if (!S.engine) return;
    let best = null, bestD = 420;
    for (const m of S.engine.monsters || []) {
      if (m.hp <= 0) continue;
      const d = Math.hypot(m.x - S.engine.player.x, m.y - S.engine.player.y);
      if (d < bestD) { bestD = d; best = m; }
    }
    if (best) { S.engine.mouse.worldX = best.x; S.engine.mouse.worldY = best.y; }
    S.engine.triggerPrimaryAttack();
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  window.SetraTravel = {
    ensure, setMap, update, open, pause, close,
    teleport, reveal() {}, toast, addExplored() {},
    setOtherPos(id, x, y) { S.others[id] = { x, y }; },
    hasMap() { return !!S.map; },
    get ready() { return !!(S.active && S.engine); },
  };
})();