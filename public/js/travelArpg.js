/* Setra Travel - ARPG adapter.
   Sunucu dünyanın/POI'lerin sahibidir; TravelEngine yalnızca çizer ve oynatır.
   Eski SetraTravel API'si birebir korunur. */
(function () {
  const S = {
    root: null, canvas: null, engine: null, map: null, room: null,
    spawn: { x: 0, y: 0 }, ready: false, active: false,
    others: {}, hudTimer: 0, poiSig: "", pendingDungeon: null, ro: null, skillSig: "", statPanelSig: "",
    ownedSkins: [], activeSkinId: null,
    stats: null, statMapId: null,
  };

  // Sefer boyunca toplanan ödüller (rapor ekranı için).
  function resetStats(mapId) {
    S.stats = { mapId: mapId || null, kills: 0, gold: 0, xp: 0, chests: 0, startedAt: Date.now() };
    S.statMapId = mapId || null;
  }
  function bumpStat(key, n) {
    if (!S.stats) resetStats(S.statMapId);
    S.stats[key] = (S.stats[key] || 0) + (Number(n) || 0);
  }

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
      name: (me && me.name) || "Adventurer",
      class: me ? me.character : "warrior",
      level: me ? me.level || 1 : 1,
      // Travel yetenek kuşanımı (Q/E/R) ve öğrenilen havuz.
      travelSkills: me && Array.isArray(me.travelSkills) ? me.travelSkills.slice() : [],
      travelLoadout: me && me.travelLoadout ? Object.assign({}, me.travelLoadout) : {},
      stats: {
        attack: me ? me.attack || 10 : 20,
        critChance: me ? (me.critChance || 0) / 100 : 0.1,
        critMultiplier: me ? 1 + (me.critDamage || 0) / 100 : 1.5,
        speed: me && me.speed ? 120 + me.speed * 2 : 200,
        omnivamp: me ? (me.omnivamp || 0) / 100 : 0,
        defense: me ? me.resistance || 0 : 0,
        maxHp: me ? me.maxHp || 100 : 100,
        currentHp: me ? (me.hp > 0 ? me.hp : me.maxHp || 100) : 100,
        maxMana: me ? me.maxMana || 0 : 0,
        currentMana: me ? me.mana || 0 : 0,
        gold: me ? me.gold || 0 : 0,
        // Travel-only combat stats (turn-based combat never reads these).
        attackSpeed: me ? me.attackSpeed || 0 : 0,
        magicPower: me ? me.magicPower || 0 : 0,
        healPower: me ? me.healPower || 0 : 0,
        maxHealPower: me ? me.healPower || 0 : 0,
      },
    };
  }
  function zoneName(room) {
    const tv = currentTravel(room);
    return tv ? `${tv.typeLabel || "Wilds"} - ${tv.sizeLabel || "Normal"}` : "Travel";
  }

  // Sınıf renkleri: diğer oyuncuların isim plakası/figürü için.
  const CLASS_TINT = { warrior: "#c0553f", ranger: "#5aa04a", mage: "#6a74d8", rogue: "#8a8296", paladin: "#d3ad55" };
  function classColor(c) { return CLASS_TINT[c] || "#8ec5ff"; }
  function clamp01(v) { return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 1)); }

  // Aynı seferdeki diğer oyuncuları motora aktar (isim + can + konum).
  // Konum için canlı `travel:pos` akışını koruruz; oda durumu yalnızca eksik
  // oyuncuyu ekler ve isim/can bilgisini tazeler. Böylece hareket sıçramaz.
  function syncOthers(room, tv) {
    if (!S.engine) return;
    const meId = myId();
    const prev = S.engine.others || {};
    const downedSet = new Set((tv && tv.downed) || []);
    const live = {};
    for (const [id, p] of Object.entries((tv && tv.pos) || {})) {
      if (id === meId || !p) continue;
      const pl = (room.players || []).find((x) => x.id === id);
      const old = prev[id];
      let wx, wy;
      if (old && Number.isFinite(old.wx) && Number.isFinite(old.wy)) {
        wx = old.wx; wy = old.wy; // canlı akıştan gelen konum korunur
      } else {
        const w = S.engine.serverToWorld(p.x, p.y);
        wx = w.x; wy = w.y;
      }
      live[id] = {
        id, wx, wy,
        name: (pl && pl.name) || (old && old.name) || "Adventurer",
        color: classColor(pl && pl.character),
        hpFrac: pl && pl.maxHp ? clamp01((pl.hp || 0) / pl.maxHp) : 1,
        downed: downedSet.has(id),
      };
    }
    S.engine.others = live;
  }

  function injectStyles() {
    if (document.getElementById("tv-arpg-style")) return;
    const st = document.createElement("style");
    st.id = "tv-arpg-style";
    st.textContent = `
      .tv-shell { position: relative; width: 100%; height: 100%; overflow: hidden;
        --font-ui: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
        --font-display: "Cinzel", Georgia, "Times New Roman", serif;
        font-family: var(--font-ui); }
      .tv-canvas { display: block; width: 100%; height: 100%; touch-action: none; background: #16242b; }
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
      .tv-controls { position: absolute; top: 12px; right: 12px; display: flex; gap: 6px; z-index: 6; }
      .tv-ctl { width: 34px; height: 34px; border-radius: 8px; border: 1px solid rgba(201,147,63,0.7);
        background: rgba(20,16,10,0.72); color: #ffe6a8; font: 700 16px/1 system-ui, sans-serif; cursor: pointer; }
      .tv-ctl:hover { background: rgba(40,30,16,0.92); }
      /* Hızlı tüketilebilir çubuğu (1-5 tuşları) */
      .tv-potions { position: absolute; top: 54px; right: 12px; display: flex; flex-direction: column;
        align-items: flex-end; gap: 6px; z-index: 7; pointer-events: auto; }
      .tv-potions.hidden { display: none; }
      .tv-potion { display: flex; align-items: center; gap: 7px; padding: 5px 9px 5px 5px; cursor: pointer;
        border-radius: 9px; border: 1px solid rgba(214,178,106,0.42); background: rgba(18,14,10,0.78);
        color: #f2e3c6; font: 600 12px system-ui, sans-serif; transition: background .14s ease, transform .14s ease; }
      .tv-potion:hover { background: rgba(52,38,20,0.92); transform: translateX(-2px); }
      .tv-potion .k { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px;
        border-radius: 5px; background: rgba(232,196,130,0.2); border: 1px solid rgba(232,196,130,0.45);
        color: #ffe6a8; font: 700 11px/1 system-ui, sans-serif; }
      .tv-potion .qt { color: #bfa77f; font-weight: 700; }
      /* LoL tarzı skill bar: alt orta, kompakt ve okunur */
      .tv-skillbar { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%);
        display: flex; align-items: flex-end; gap: 7px; padding: 7px 9px; border-radius: 13px; z-index: 8;
        pointer-events: auto; background: linear-gradient(180deg, rgba(18,14,10,0.74), rgba(8,7,6,0.9));
        border: 1px solid rgba(201,147,63,0.32); box-shadow: 0 10px 26px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05); }
      .tv-sb { position: relative; width: 54px; height: 54px; padding: 0; border-radius: 12px; cursor: pointer; overflow: hidden;
        border: 1px solid rgba(232,196,130,0.34); color: #ffeccf;
        background: radial-gradient(circle at 50% 116%, var(--sk, #3a3226), rgba(12,10,8,0.97) 66%), #0d0b09;
        box-shadow: inset 0 -10px 16px -10px var(--sk, #3a3226), 0 3px 10px rgba(0,0,0,0.45);
        transition: transform .12s ease, border-color .12s ease, box-shadow .12s ease; }
      .tv-sb:hover { transform: translateY(-2px); border-color: rgba(255,214,120,0.75); box-shadow: 0 7px 18px rgba(0,0,0,0.55), inset 0 -10px 16px -10px var(--sk, #3a3226); }
      .tv-sb__ic { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        font: 700 21px/1 "Segoe UI Symbol", var(--font-display); text-shadow: 0 2px 7px rgba(0,0,0,0.8); pointer-events: none; }
      .tv-sb__key { position: absolute; top: 3px; left: 3px; padding: 1px 4px; border-radius: 4px;
        background: rgba(6,5,4,0.6); border: 1px solid rgba(232,196,130,0.34);
        font: 800 8.5px/1 var(--font-ui); letter-spacing: .06em; color: #ffe6a8; pointer-events: none; }
      .tv-sb__name { display: none; }
      .tv-sb__cd { position: absolute; inset: 0; display: none; align-items: center; justify-content: center;
        background: rgba(5,4,8,0.76); color: #fff3d4; font: 700 15px/1 var(--font-display); pointer-events: none;
        text-shadow: 0 2px 6px #000; }
      .tv-sb.is-cd .tv-sb__cd { display: flex; }
      .tv-sb__bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: linear-gradient(90deg,#ffd54f,#ffb74d);
        transform-origin: left center; transform: scaleX(0); pointer-events: none; }
      .tv-sb.is-auto { width: 46px; height: 46px; border-radius: 50%; border-color: rgba(224,74,60,0.55); }
      .tv-sb.is-auto .tv-sb__name { display: none; }
      .tv-sb.is-off { opacity: 0.4; }
      /* Sol alt/orta: anlık stat paneli */
      .tv-statpanel { position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 5px; z-index: 6; pointer-events: none; user-select: none; }
      .tv-strow { display: flex; align-items: center; gap: 8px; min-width: 128px; padding: 4px 9px;
        border-radius: 9px; border: 1px solid rgba(201,147,63,0.2);
        background: linear-gradient(100deg, rgba(14,11,9,0.86), rgba(14,11,9,0.5));
        box-shadow: 0 6px 16px rgba(0,0,0,0.32); backdrop-filter: blur(2px); }
      .tv-strow .ic { width: 15px; text-align: center; font-size: 12px; color: #e8c482; opacity: .85; }
      .tv-strow .lb { flex: 1; font: 600 9.5px/1 "Inter", system-ui, sans-serif; letter-spacing: .14em;
        text-transform: uppercase; color: #a5906f; }
      .tv-strow .vl { font: 700 12.5px/1 "Cinzel", Georgia, serif; color: #f8ecd4; font-variant-numeric: tabular-nums; }
      .tv-strow.is-buff { border-color: rgba(128,222,234,0.45); }
      .tv-strow.is-buff .vl { color: #a8ecff; }
      .tv-buffbar { height: 2px; border-radius: 2px; background: rgba(128,222,234,0.25); overflow: hidden; margin: 2px 0 0; }
      .tv-buffbar i { display: block; height: 100%; background: #80deea; transform-origin: left center; }
      /* Can paneli (skill bar'ın solunda) */
      .tv-vital { display: flex; flex-direction: column; justify-content: center; gap: 3px;
        width: 124px; padding: 0 2px 0 0; margin-right: 3px; border-right: 1px solid rgba(201,147,63,0.22); }
      .tv-vital__hearts { font: 700 11px/1 system-ui, sans-serif; letter-spacing: 2px; color: #ff6b6b; text-shadow: 0 1px 3px #000; }
      .tv-vital__hearts .e { color: #5a4a3a; }
      .tv-vital__bar { position: relative; height: 9px; border-radius: 5px; overflow: hidden;
        background: rgba(0,0,0,0.62); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09); }
      .tv-vital__fill { position: absolute; inset: 0;
        background: linear-gradient(90deg, #8e2b23, #e04a3c 45%, #ff8a65);
        transform-origin: left center; transition: transform .16s linear; }
      .tv-vital__num { font: 700 10px/1 "Inter", system-ui, sans-serif; color: #ffd9c8;
        letter-spacing: .04em; text-align: right; font-variant-numeric: tabular-nums; }
      .tv-sb.has-ic { background-size: cover; background-position: center; background-repeat: no-repeat; }
      .tv-sb.has-ic .tv-sb__ic { display: none; }
      /* Etkileşim ipucu skill bar'ın üstünde kalsın */
      .tv-shell .tv-prompt { bottom: 96px; }
      /* Bildirim balonu: üst orta (sağ üstteki iksir çubuğuyla çakışmasın) */
      .tv-shell .tv-toast { top: 12px; left: 50%; right: auto; transform: translateX(-50%);
        border-radius: 11px; font: 600 12px/1.35 var(--font-ui); letter-spacing: .02em; }
      @media (hover: none), (pointer: coarse) {
        .tv-statpanel { display: none; }
        .tv-skillbar { bottom: 92px; gap: 6px; padding: 6px 7px; }
        .tv-sb { width: 46px; height: 46px; }
        .tv-sb__name { display: none; }
        .tv-sb.is-auto { width: 40px; height: 40px; }
        .tv-vital { width: 84px; }
      }
      @media (hover: none), (pointer: coarse) {
        .tv-potions { top: auto; bottom: 150px; right: 12px; }
        .tv-potion .k { display: none; }
        .tv-potion { padding: 7px 10px; }
      }
      .tv-shell:fullscreen, .tv-shell:-webkit-full-screen { width: 100vw; height: 100vh; border-radius: 0; }
      .tv-shell:fullscreen .tv-canvas, .tv-shell:-webkit-full-screen .tv-canvas { width: 100%; height: 100%; }
      .tv-mana-panel { position: absolute; inset: 0; z-index: 20; display: none; flex-direction: column;
        align-items: center; justify-content: center; padding: 24px 16px; overflow-y: auto; color: #f2e6cf;
        font: 13px/1.5 system-ui, sans-serif; background: radial-gradient(120% 120% at 50% 35%, rgba(42,30,14,0.62), rgba(6,5,9,0.88));
        backdrop-filter: blur(3px); }
      .tv-mana-panel.open { display: flex; }
      .tv-mana-panel > * { width: min(380px, 92%); }
      .tv-mana-head { display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding-bottom: 8px; border-bottom: 1px solid rgba(214,178,106,0.28); }
      .tv-mana-head h3 { margin: 0; font: 800 20px Cinzel, Georgia, serif; letter-spacing: 1.2px; text-transform: uppercase;
        background: linear-gradient(180deg,#fbf0d2,#d8ab5c 60%,#9c7233);
        -webkit-background-clip: text; background-clip: text; color: transparent; }
      .tv-mana-x { width: 30px; height: 30px; padding: 0; border-radius: 50%; font-size: 17px; line-height: 1;
        background: rgba(20,16,10,0.8); border: 1px solid rgba(214,178,106,0.45); color: #e6c98e; }
      .tv-mana-sub { margin: 10px 0 16px; text-align: center; font-size: 12px; color: #b9a98f; }
      .tv-mana-grid { display: flex; justify-content: center; }
      .tv-skin { border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; padding: 12px; background: rgba(18,14,24,0.72);
        cursor: pointer; position: relative; overflow: hidden; text-align: center; width: 100%; }
      .tv-skin .sw { width: 100%; height: 34px; border-radius: 10px; margin-bottom: 8px; }
      .tv-skin .sw--big { height: 96px; border-radius: 12px; margin-bottom: 10px; }
      .tv-skin .nm { font: 700 15px Cinzel, Georgia, serif; letter-spacing: 0.4px; color: #f7ecd4; }
      .tv-skin .rr { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.4px; margin-top: 2px; }
      .tv-skin .fx { font-size: 11px; color: #90836e; margin-top: 6px; text-transform: capitalize; }
      .tv-skin .eq { position: absolute; top: 8px; right: 10px; font-size: 15px; color: #ffe6a8; }
      .tv-skin.owned { opacity: 1; }
      .tv-skin.locked { opacity: 0.32; cursor: default; filter: grayscale(0.7); }
      .tv-skin.active, .tv-skin--worn { border-color: rgba(232,196,130,0.55);
        box-shadow: 0 0 0 1px rgba(232,196,130,0.18) inset, 0 12px 32px rgba(0,0,0,0.5), 0 0 26px rgba(232,196,130,0.14); }
      .tv-mana-empty { text-align: center; color: #9c8f78; font-size: 12.5px; padding: 18px 0; }
      .tv-mana-actions { display: flex; justify-content: center; margin-top: 16px; }
      .tv-mana-btn { border: 1px solid rgba(214,178,106,0.55); background: rgba(40,30,16,0.9); color: #ffe6a8;
        font: 700 14px system-ui, sans-serif; padding: 10px 18px; border-radius: 10px; cursor: pointer;
        transition: background .16s ease, transform .16s ease, box-shadow .16s ease; }
      .tv-mana-btn:hover { background: rgba(72,54,26,0.95); }
      .tv-mana-btn:disabled { opacity: 0.45; cursor: default; }
      .tv-mana-roll { width: 100%; padding: 12px 18px; border-radius: 12px; border: 1px solid rgba(255,224,160,0.7);
        background: linear-gradient(180deg,#5a3f18,#2e1f0c); color: #ffecc4; letter-spacing: 0.4px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 18px rgba(0,0,0,0.45); }
      .tv-mana-roll:hover:not(:disabled) { background: linear-gradient(180deg,#735022,#3b2810); transform: translateY(-1px); }
      .tv-roll-stage { position: fixed; inset: 0; display: none; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.78); z-index: 30; }
      .tv-roll-stage.show { display: flex; }
      .tv-roll-box { width: 268px; height: 268px; border-radius: 22px; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 10px; text-align: center; position: relative;
        border: 1px solid rgba(255,236,196,0.35); box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.35);
        animation: tv-roll-pulse 0.5s ease-in-out infinite alternate; }
      .tv-roll-box .rn { font: 800 22px Cinzel, Georgia, serif; text-shadow: 0 2px 12px rgba(0,0,0,0.65); }
      .tv-roll-box .rr { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9; }
      @keyframes tv-roll-pulse { from { transform: scale(0.96); } to { transform: scale(1.04); } }
      /* ---- Yetenek paneli (Q/E/R + ogrenme) ---- */
      .tv-skill-panel { position: absolute; inset: 0; z-index: 21; display: none; flex-direction: column;
        align-items: center; padding: 22px 14px 28px; overflow-y: auto; color: #f2e6cf;
        font: 13px/1.5 system-ui, sans-serif; background: radial-gradient(120% 120% at 50% 32%, rgba(42,30,14,0.7), rgba(6,5,9,0.9));
        backdrop-filter: blur(3px); }
      .tv-skill-panel.open { display: flex; }
      .tv-skill-panel > * { width: min(430px, 96%); }
      .tv-skill-head { display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding-bottom: 8px; border-bottom: 1px solid rgba(214,178,106,0.28); }
      .tv-skill-head h3 { margin: 0; font: 800 19px Cinzel, Georgia, serif; letter-spacing: 1.2px; text-transform: uppercase;
        background: linear-gradient(180deg,#fbf0d2,#d8ab5c 60%,#9c7233);
        -webkit-background-clip: text; background-clip: text; color: transparent; }
      .tv-skill-sub { margin: 9px 0 12px; text-align: center; font-size: 12px; color: #b9a98f; }
      .tv-skill-points { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 12px;
        padding: 7px 12px; border-radius: 10px; border: 1px solid rgba(214,178,106,0.3);
        background: rgba(255,236,196,0.05); color: #e9d4a6; font-size: 12.5px; }
      .tv-skill-points .ico { color: #ffd479; }
      .tv-skill-points b { color: #ffe6b8; }
      .tv-skill-points.is-empty { opacity: 0.7; }
      .tv-skill-slots { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
      .tv-skill-slot { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; cursor: pointer;
        border-radius: 11px; border: 1px solid rgba(214,178,106,0.26); background: rgba(20,16,12,0.72);
        color: #f2e3c6; font: 600 13px system-ui, sans-serif; text-align: left; transition: background .14s ease, border-color .14s ease; }
      .tv-skill-slot:hover { background: rgba(52,38,20,0.85); }
      .tv-skill-slot.is-sel { border-color: var(--sk, #e8c482); box-shadow: 0 0 0 1px var(--sk, #e8c482) inset, 0 0 18px rgba(232,196,130,0.16); }
      .tv-skill-slot .k { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px;
        border-radius: 7px; background: rgba(232,196,130,0.16); border: 1px solid rgba(232,196,130,0.4);
        color: #ffe6a8; font: 800 12px system-ui, sans-serif; }
      .tv-skill-slot .nm { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .tv-skill-slot .cd { font-size: 11px; color: #a89a80; }
      .tv-skill-list-head { font: 700 11px system-ui, sans-serif; letter-spacing: 2px; text-transform: uppercase;
        color: #a4886a; margin: 0 0 8px; }
      .tv-skill-list { display: flex; flex-direction: column; gap: 7px; }
      .tv-skill-card { display: flex; align-items: flex-start; gap: 10px; padding: 9px 11px; border-radius: 11px;
        border: 1px solid rgba(214,178,106,0.18); background: rgba(18,14,11,0.72); cursor: pointer;
        transition: background .14s ease, border-color .14s ease; }
      .tv-skill-card:hover { background: rgba(44,32,18,0.86); border-color: rgba(214,178,106,0.4); }
      .tv-skill-card.is-eq { border-color: var(--sk, #e8c482); box-shadow: 0 0 14px rgba(232,196,130,0.12); }
      .tv-skill-card.is-locked { opacity: 0.68; }
      .tv-skill-card .ic { flex: 0 0 30px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
        border-radius: 9px; background: rgba(255,255,255,0.05); border: 1px solid var(--sk, #e8c482); color: var(--sk, #e8c482); font-size: 15px; }
      .tv-skill-card .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      .tv-skill-card .nm { font: 700 13px system-ui, sans-serif; color: #f7ecd4; }
      .tv-skill-card .meta { font-size: 10.5px; letter-spacing: 0.3px; color: #b7a077; text-transform: uppercase; }
      .tv-skill-card .ds { font-size: 11.5px; color: #9c917f; line-height: 1.4; }
      .tv-skill-card .act { flex: 0 0 auto; display: flex; align-items: center; }
      .tv-skill-card .tag { font: 700 10px system-ui, sans-serif; letter-spacing: 0.8px; text-transform: uppercase;
        padding: 4px 7px; border-radius: 6px; border: 1px solid rgba(214,178,106,0.3); color: #bfa77f; }
      .tv-skill-card .tag--eq { color: #ffe6a8; border-color: rgba(255,224,160,0.6); background: rgba(255,224,160,0.08); }
      .tv-skill-card .tag--own { color: #9fd8b0; border-color: rgba(159,216,176,0.35); }
      .tv-skill-learn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 9px; border-radius: 8px; cursor: pointer;
        border: 1px solid rgba(255,224,160,0.55); background: linear-gradient(180deg,#5a3f18,#2e1f0c); color: #ffecc4;
        font: 700 11px system-ui, sans-serif; }
      .tv-skill-learn:hover:not(:disabled) { background: linear-gradient(180deg,#735022,#3b2810); }
      .tv-skill-learn:disabled { opacity: 0.42; cursor: default; }
      .tv-skill-learn .dot { font-style: normal; opacity: 0.7; }
      .tv-skill-empty { text-align: center; color: #9c8f78; font-size: 12.5px; padding: 14px 0; }
      .tv-skill-hint { margin-top: 12px; text-align: center; font-size: 11px; color: #8f7c68; }
      /* ---- Yere dusme ekrani ---- */
      .tv-down { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; z-index: 40;
        pointer-events: auto; opacity: 0; transition: opacity .26s ease;
        background: radial-gradient(120% 120% at 50% 38%, rgba(48,14,18,0.44), rgba(5,3,5,0.82));
        backdrop-filter: blur(3px); font-family: Inter, system-ui, sans-serif; }
      .tv-down.is-open { opacity: 1; }
      .tv-down-card { position: relative; width: min(392px, 90%); padding: 26px 22px 18px; border-radius: 18px; text-align: center;
        background: linear-gradient(168deg, rgba(38,29,22,0.98), rgba(14,11,10,0.99));
        border: 1px solid rgba(214,178,106,0.34);
        box-shadow: 0 26px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 60px rgba(255,120,90,0.05);
        animation: tv-down-in .3s ease-out both; }
      @keyframes tv-down-in { from { transform: translateY(14px) scale(0.97); } to { transform: none; } }
      .tv-down-orn { position: absolute; width: 16px; height: 16px; border: 1px solid rgba(214,178,106,0.6); opacity: 0.85; }
      .tv-down-orn--tl { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
      .tv-down-orn--tr { top: 8px; right: 8px; border-left: 0; border-bottom: 0; }
      .tv-down-orn--bl { bottom: 8px; left: 8px; border-right: 0; border-top: 0; }
      .tv-down-orn--br { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }
      .tv-down-crest { display: flex; justify-content: center; margin-bottom: 8px; opacity: 0.95;
        filter: drop-shadow(0 0 12px rgba(232,196,130,0.35)); }
      .tv-down-kicker { font-size: 10px; letter-spacing: 3.4px; text-transform: uppercase; color: #a4886a; }
      .tv-down-title { margin: 4px 0 0; font: 800 25px Cinzel, Georgia, serif; letter-spacing: 1px;
        background: linear-gradient(180deg,#ffe9c8,#e8ab74 55%,#b96a4a);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        text-shadow: 0 12px 30px rgba(200,80,60,0.18); }
      .tv-down-rule { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px auto 12px; }
      .tv-down-rule::before, .tv-down-rule::after { content: ""; height: 1px; width: 62px;
        background: linear-gradient(90deg, transparent, rgba(214,178,106,0.5), transparent); }
      .tv-down-rule span { font-size: 11px; color: #c9a468; }
      .tv-down-hearts { display: flex; justify-content: center; gap: 8px; min-height: 20px; margin-bottom: 8px; }
      .tv-down-heart { font-style: normal; font-size: 15px; color: #e8664f; text-shadow: 0 0 12px rgba(232,102,79,0.55); }
      .tv-down-hearts-none { font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; color: #8c6f63; }
      .tv-down-text { margin: 0 auto 16px; max-width: 300px; font-size: 12.5px; line-height: 1.6; color: #bda998; }
      .tv-down-actions { display: flex; gap: 9px; justify-content: center; flex-wrap: wrap; }
      .tv-btn { cursor: pointer; padding: 10px 18px; border-radius: 11px; font: 600 13px Inter, system-ui, sans-serif;
        transition: transform .15s ease, background .15s ease, box-shadow .15s ease; }
      .tv-btn--gold { border: 1px solid rgba(255,224,160,0.66); color: #2a1c08;
        background: linear-gradient(180deg,#f3d99b,#c3913f); box-shadow: 0 8px 22px rgba(190,140,60,0.28); }
      .tv-btn--gold:hover { background: linear-gradient(180deg,#ffe7b4,#d6a24c); transform: translateY(-1px); }
      .tv-btn--ghost { border: 1px solid rgba(214,178,106,0.36); color: #e3d3b8; background: rgba(28,22,17,0.85); }
      .tv-btn--ghost:hover { background: rgba(50,38,28,0.95); transform: translateY(-1px); }
      .tv-down-hint { margin-top: 12px; font-size: 11px; color: #8f7c68; }
      .tv-down-hint b { color: #e8c48e; }
      /* ---- Sefer raporu (Travel donusu) ---- */
      .tv-report { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center;
        background: radial-gradient(120% 120% at 50% 34%, rgba(30,22,12,0.55), rgba(4,3,2,0.86));
        backdrop-filter: blur(4px); font-family: Inter, system-ui, sans-serif; opacity: 0; transition: opacity .28s ease; }
      .tv-report.is-open { opacity: 1; }
      .tv-report-card { position: relative; width: min(400px, 92%); padding: 26px 22px 20px; border-radius: 18px; text-align: center;
        background: linear-gradient(168deg, rgba(38,30,20,0.98), rgba(14,11,8,0.99));
        border: 1px solid rgba(214,178,106,0.36);
        box-shadow: 0 26px 70px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05);
        animation: tv-report-in .34s cubic-bezier(.2,.9,.3,1.35) both; }
      @keyframes tv-report-in { from { transform: translateY(16px) scale(0.96); opacity: 0; } to { transform: none; opacity: 1; } }
      .tv-report-orn { position: absolute; width: 16px; height: 16px; border: 1px solid rgba(214,178,106,0.6); opacity: 0.85; }
      .tv-report-orn--tl { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
      .tv-report-orn--tr { top: 8px; right: 8px; border-left: 0; border-bottom: 0; }
      .tv-report-orn--bl { bottom: 8px; left: 8px; border-right: 0; border-top: 0; }
      .tv-report-orn--br { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }
      .tv-report-crest { display: flex; justify-content: center; margin-bottom: 6px; filter: drop-shadow(0 0 12px rgba(232,196,130,0.35)); }
      .tv-report-kicker { font-size: 10px; letter-spacing: 3.4px; text-transform: uppercase; color: #a4886a; }
      .tv-report-title { margin: 4px 0 0; font: 800 24px Cinzel, Georgia, serif; letter-spacing: 1px;
        background: linear-gradient(180deg,#ffe9c8,#e8c48e 55%,#c3913f);
        -webkit-background-clip: text; background-clip: text; color: transparent; }
      .tv-report-rule { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px auto 14px; }
      .tv-report-rule::before, .tv-report-rule::after { content: ""; height: 1px; width: 62px;
        background: linear-gradient(90deg, transparent, rgba(214,178,106,0.5), transparent); }
      .tv-report-rule span { font-size: 11px; color: #c9a468; }
      .tv-report-sub { margin: 0 auto 14px; max-width: 306px; font-size: 12px; line-height: 1.55; color: #bda998; }
      .tv-report-rows { display: flex; flex-direction: column; gap: 8px; margin: 0 auto 16px; max-width: 322px; }
      .tv-report-row { display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 9px 13px; border-radius: 11px; background: rgba(255,236,196,0.04);
        border: 1px solid rgba(214,178,106,0.16); }
      .tv-report-lbl { display: flex; align-items: center; gap: 9px; font-size: 12.5px; color: #cdbca4; }
      .tv-report-lbl .ic { font-size: 14px; filter: drop-shadow(0 0 8px rgba(232,196,130,0.3)); }
      .tv-report-val { font: 700 14px Inter, system-ui, sans-serif; color: #ffe6b8; letter-spacing: 0.4px; }
      .tv-report-actions { display: flex; justify-content: center; }
    `;
    document.head.appendChild(st);
  }

  function ensure(root) {
    // root.innerHTML başka bir ekran tarafından değiştirildiyse tuval kopmuş
    // olur; bu durumda motoru yeniden kur (aksi halde siyah ekran kalır).
    const canvasAlive = S.canvas && root && root.contains(S.canvas);
    if (S.ready && S.root === root && canvasAlive) return;
    injectStyles();
    if (S.engine) { try { S.engine.destroy(); } catch (e) {} S.engine = null; }
    S.root = root;
    S.skillSig = "";
    S.statPanelSig = "";
    root.innerHTML = `
      <div class="tv-shell">
        <canvas class="tv-canvas"></canvas>
        <div class="tv-controls">
          <button type="button" class="tv-ctl" id="tv-skills" title="Skills">&#9876;</button>
          <button type="button" class="tv-ctl" id="tv-zoom-in" title="Zoom in">+</button>
          <button type="button" class="tv-ctl" id="tv-zoom-out" title="Zoom out">&minus;</button>
          <button type="button" class="tv-ctl" id="tv-full" title="Fullscreen">&#x26F6;</button>
        </div>
        <div class="tv-potions hidden" id="tv-potions"></div>
        <div class="tv-statpanel" id="tv-statpanel"></div>
        <div class="tv-skillbar" id="tv-skillbar"></div>
        <div class="tv-prompt hidden" id="tv-prompt"></div>
        <div class="tv-toast hidden" id="tv-toast"></div>
        <div class="tv-skill-panel" id="tv-skill-panel">
          <div class="tv-skill-head"><h3>Skill Loadout</h3><button type="button" class="tv-mana-btn tv-mana-x" id="tv-skill-close">&times;</button></div>
          <div class="tv-skill-sub">Pick a slot, then choose a skill from your class. Learn new skills with travel points.</div>
          <div class="tv-skill-points" id="tv-skill-points"></div>
          <div class="tv-skill-slots" id="tv-skill-slots"></div>
          <div class="tv-skill-list-head">Class Skills</div>
          <div class="tv-skill-list" id="tv-skill-list"></div>
          <div class="tv-skill-hint">Click the same skill again to restore the default.</div>
        </div>
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
    // Yükseklik zinciri çökerse tuval 0px kalıp "siyah ekran" gibi görünmesin.
    const shell = root.querySelector(".tv-shell");
    if (shell) shell.style.minHeight = "320px";
    S.ready = true;
    const prompt = root.querySelector("#tv-prompt");
    if (prompt) prompt.addEventListener("click", () => {
      if (S.engine && S.engine._interactTarget) handleInteract(S.engine._interactTarget);
    });
    bindMobile();
    const zi = root.querySelector("#tv-zoom-in");
    const zo = root.querySelector("#tv-zoom-out");
    const fs = root.querySelector("#tv-full");
    if (zi) zi.addEventListener("click", () => { if (S.engine) S.engine.zoomTarget = Math.min(2.2, (S.engine.zoomTarget || 1) + 0.15); });
    if (zo) zo.addEventListener("click", () => { if (S.engine) S.engine.zoomTarget = Math.max(0.65, (S.engine.zoomTarget || 1) - 0.15); });
    if (fs) fs.addEventListener("click", toggleFullscreen);
    const skillsBtn = root.querySelector("#tv-skills");
    if (skillsBtn) skillsBtn.addEventListener("click", () => toggleSkillPanel());
    const skillsClose = root.querySelector("#tv-skill-close");
    if (skillsClose) skillsClose.addEventListener("click", () => toggleSkillPanel(false));
    bindSkillPanel();
    // Tüketilebilir çubuğu: tıklayınca kullan (1-5 tuşları da aynı işi yapar).
    const potions = root.querySelector("#tv-potions");
    if (potions) {
      potions.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-item]") : null;
        if (!btn) return;
        e.preventDefault();
        useConsumable(btn.getAttribute("data-item"));
      });
    }
    bindUseKeys();
    const skillbar = root.querySelector("#tv-skillbar");
    if (skillbar) {
      const sbOf = (e) => (e.target && e.target.closest ? e.target.closest("[data-sb]") : null);
      // Kanal yetenekleri (E) basılı tutmayla çalışır: pointerdown/up ile yönetilir.
      skillbar.addEventListener("pointerdown", (e) => {
        const b = sbOf(e);
        if (!b || !S.engine) return;
        const key = b.getAttribute("data-sb");
        if (b.getAttribute("data-kind") !== "skill") return;
        e.preventDefault();
        S.engine.keys[key] = true;
        S.engine.triggerSkill(key);
      });
      const release = (e) => {
        const b = sbOf(e);
        if (!b || !S.engine) return;
        const key = b.getAttribute("data-sb");
        if (b.getAttribute("data-kind") === "skill") S.engine.keys[key] = false;
      };
      skillbar.addEventListener("pointerup", release);
      skillbar.addEventListener("pointerleave", release);
      skillbar.addEventListener("pointercancel", release);
      skillbar.addEventListener("click", (e) => {
        const b = sbOf(e);
        if (!b || !S.engine) return;
        const key = b.getAttribute("data-sb");
        if (key === "auto") { e.preventDefault(); attackNearest(); }
        else if (key === "dash") { e.preventDefault(); S.engine.triggerDash(); }
      });
    }
    if (S.map) boot();
  }

  function toggleFullscreen() {
    const el = S.root && S.root.querySelector(".tv-shell");
    if (!el) return;
    const doc = document;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) { const p = req.call(el); if (p && p.catch) p.catch(() => {}); }
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      if (exit) exit.call(doc);
    }
  }

  function boot() {
    if (S.engine) return;
    if (!S.ready || !S.canvas) return;
    if (!window.TravelEngine) { toast("Travel motoru yuklenemedi."); return; }
    const map = S.map;
    if (!map) return;
    // Oda bilgisi henüz gelmediyse mevcut oyundan al (isim "Kahraman" kalmasın).
    // Eski bir oyunun odası kalmışsa (farklı sefer) kullanma: yanlış/ölü can taşınmasın.
    if (!S.room && typeof state !== "undefined" && state.room) {
      const tvOld = currentTravel(state.room);
      S.room = (!tvOld || !map.id || tvOld.id === map.id) ? state.room : null;
    }
    // Ekran gizliyken (0 boyutlu tuval) motor kurma; ilk görünür karede open() tekrar dener.
    if (!S.canvas.clientWidth || !S.canvas.clientHeight) return;
    // Aynı harita için motor zaten ayaktaysa yeniden kurma: her travel:map
    // olayında motoru baştan yaratmak kısa siyah kırpışmaya yol açıyordu.
    if (S.engine && !S.engine._destroyed && S.engine.canvas === S.canvas && S.map && (S.map.id || "default") === (S.engine._mapId || "default")) {
      try {
        S.engine.setWorldBounds(map);
        applyRoom(S.room);
        startHud();
        if (S.active && !S.engine.isRunning) {
          S.engine.isRunning = true;
          S.engine.lastTime = performance.now();
          requestAnimationFrame(S.engine.loop);
        }
      } catch (e) { /* motor sağlıklıysa devam */ }
      return;
    }
    try {
    S.spawn = { x: (map.spawn && map.spawn.x) || 0, y: (map.spawn && map.spawn.y) || 0 };
    const me = meFrom(S.room);
    S.engine = new window.TravelEngine(S.canvas, {
      player: playerPayload(me),
      zoneName: zoneName(S.room),
      tileSize: 64,
      onInteract: handleInteract,
      onMove: (pos) => { if (S.active && typeof socket !== "undefined") socket.emit("travel:pos", pos); },
      // Görsel eklenti canavar `kind`ını değiştirir; ödül için orijinali yolla.
      onKill: (m) => { if (S.active && typeof socket !== "undefined") socket.emit("travel:kill", { kind: m && (m.baseKind || m.kind), exp: m && m.exp }); },
      onHpChange: (hp) => { if (typeof socket !== "undefined" && S.engine && S.engine._hpFromServer) socket.emit("travel:hp", { hp }); },
      onDown: () => {
        // Sunucuya bildir; sunucu "downed" (yere düşme) ya da "fallen" (ölüm) onaylar.
        // Erken geri bildirim verme — ekran sunucu onayıyla açılır.
        if (typeof socket !== "undefined") socket.emit("travel:down");
      },
      onRevive: (id) => { if (id && typeof socket !== "undefined") socket.emit("travel:revive", { targetId: id }); },
    });
    // ARPG içeriği (sınıf yetenekleri + biyom canavar tabloları) motora geçirilir.
    try {
      const cat = (typeof CATALOG !== "undefined" && CATALOG) || null;
      if (cat && S.engine.applyContent) S.engine.applyContent(cat);
    } catch (e) { /* içerik isteğe bağlı, motor varsayılanlarla çalışır */ }
    S.engine.setWorldBounds(map);
    // GameCraft editöründen gelen travel ayarları (hava durumu, diriltme mesafesi,
    // ses atamaları, ses seviyesi). Katalog yoksa motor varsayılanlarla çalışır.
    try {
      const cat = (typeof CATALOG !== "undefined" && CATALOG) || null;
      const cfg = (cat && cat.travel) || {};
      const sfxOver = (cat && cat.sfx && cat.sfx.travel) || {};
      if (S.engine.applyConfig) S.engine.applyConfig(cfg, sfxOver);
    } catch (e) { /* ayarlar isteğe bağlı */ }
    applyRoom(S.room);
    startHud();
    bindSkinEvents();
    bindStatEvents();
    // Kapsayıcı boyutu değişince tuvali yeniden ölçekle (karakter ortada kalsın).
    if (window.ResizeObserver && !S.ro) {
      try {
        S.ro = new ResizeObserver(() => { if (S.engine) S.engine.resize(); });
        S.ro.observe(S.canvas);
      } catch (e) { S.ro = null; }
    }
    if (!S.active) { S.engine.isRunning = false; }
    } catch (err) {
      console.error("[travel] boot error:", err);
      toast("Travel baslatilamadi: " + (err && err.message ? err.message : err));
      if (S.engine) { try { S.engine.destroy(); } catch (e) {} }
      S.engine = null;
    }
  }

  function setMap(map) {
    if (!map) return;
    // Yeni sefer = yeni harita id'si. Eski motor yere düşmüş/ölü durumda kaldıysa
    // (can 0, downed=true) yeni sefere taşınıyor ve oyuncu girer girmez ölüyordu.
    // Farklı bir haritaya geçildiğinde motoru sıfırdan kur.
    if (S.engine && S.engine._mapId && map.id !== S.engine._mapId) {
      try { S.engine.destroy(); } catch (e) {}
      S.engine = null;
      S.room = null;         // eski odanın can/stats verisi kullanılmasın
      S.poiSig = "";
      S.maxLives = 0;
      S.spawn = null;
    }
    S.map = map;
    // Yeni sefer: sefer raporu sayaçlarını sıfırla.
    if (map.id && map.id !== S.statMapId) resetStats(map.id);
    else if (!S.stats) resetStats(map.id || null);
    if (S.ready) boot();
  }

  function applyRoom(room) {
    if (!S.engine || !room) return;
    S.room = room;
    // İstatistikleri sefer kaydından BAĞIMSIZ uygula: `travel:map` bazen
    // oda durumundan önce gelir; eski kod bu yüzden motoru varsayılan 100
    // max HP ile bırakıp travel:hp ile gerçek canı kalıcı olarak düşürebiliyordu.
    const me = meFrom(room);
    if (me) S.engine.applyPlayerData(me);
    if (me) {
      if (Array.isArray(me.skins)) S.ownedSkins = me.skins.slice();
      if (me.activeSkin) S.activeSkinId = me.activeSkin;
    }
    const tv = currentTravel(room);
    if (!tv) { S.engine.others = {}; return; }
    // Yerel konumun sahibi motordur; sunucu konumu yalnızca ilk doğuşta uygulanır.
    // Aksi halde yetenekle yapılan ışınlanma (>140px) her oda güncellemesinde geri
    // sıçratılıp "sürekli ışınlanma" hatasına yol açıyordu. Sunucu kaynaklı
    // ışınlanmalar için `travel:teleport` olayı `teleport()`'u force ile çağırır.
    const pos = (tv.pos || {})[myId()];
    if (pos && !S.engine._selfSynced) { S.engine.setServerPlayer(pos, true); S.engine._selfSynced = true; }
    syncOthers(room, tv);
    const sig = (tv.id || "") + "|" + (tv.pois || []).map((p) => p.id + (p.consumed ? "1" : "0")).join(",");
    if (sig !== S.poiSig) { S.poiSig = sig; S.engine.placePOIs(tv.pois || []); }
  }

  function update(room) {
    S.room = room;
    if (!S.root || !S.canvas || !S.root.contains(S.canvas)) return;
    if (!S.engine) { if (S.map) boot(); return; }
    applyRoom(room);
    if (S.skillPanelOpen) renderSkillPanel();
  }

  function open() {
    S.active = true;
    if (!S.root || !S.canvas || !S.root.contains(S.canvas)) return;
    if (!S.engine && S.map) boot();
    if (S.engine && !S.engine.isRunning) {
      S.engine.isRunning = true;
      S.engine.lastTime = performance.now();
      requestAnimationFrame(S.engine.loop);
    }
    // Ekran yeni görünür olduğu için boyut bir sonraki karede kesinleşir.
    // Gizliyken motor kurulmadıysa burada kurulur; boyut değişmediyse resize no-op.
    requestAnimationFrame(() => {
      if (!S.engine && S.map) boot();
      if (S.engine) S.engine.resize();
    });
  }
  function pause() { S.active = false; if (S.engine) S.engine.isRunning = false; }
  function close() {
    S.active = false;
    stopHud();
    if (S.ro) { try { S.ro.disconnect(); } catch (e) {} S.ro = null; }
    if (S.engine) { try { S.engine.destroy(); } catch (e) {} S.engine = null; }
    if (downedEl) { try { downedEl.remove(); } catch (e) {} downedEl = null; }
    S.ready = false; S.root = null; S.canvas = null; S.map = null; S.poiSig = ""; S.pendingDungeon = null;
    S.room = null; S.maxLives = 0; S._potionSig = "";
  }

  function teleport(x, y) {
    if (S.engine) S.engine.setServerPlayer({ x, y }, true);
  }

  function handleInteract(obj) {
    if (!obj) return;
    if (obj.type === "poi" && obj.poiId && typeof socket !== "undefined") {
      if (S.engine && typeof S.engine.spawnInteractPulse === "function" && Number.isFinite(obj.wx)) {
        const col = obj.kind === "chest" ? "#ffd166" : obj.kind === "inn" ? "#8fd6a0" : obj.kind === "ruin" ? "#b7a6e0" : "#8ec5ff";
        S.engine.spawnInteractPulse(obj.wx, obj.wy, col);
      }
      const dungeon = obj.kind === "dungeon" || obj.kind === "den";
      // İlk E parti kurar; ikinci E (parti hazırsa) zindana girer.
      if (dungeon && S.pendingDungeon === obj.poiId) {
        socket.emit("travel:start", { poiId: obj.poiId });
        S.pendingDungeon = null;
        toast("Zindana giriliyor...");
        return;
      }
      socket.emit("travel:interact", { poiId: obj.poiId });
      return;
    }
    if (obj.type === "shrine") {
      // Seyahat taşı: seferi bitirip şehre döner (Back to Town ile aynı).
      if (typeof socket !== "undefined") socket.emit("travel:leave");
      if (typeof state !== "undefined") state.travelOpen = false;
      close();
      if (typeof renderTown === "function" && typeof state !== "undefined" && state.room) renderTown(state.room);
      if (typeof showToast === "function") showToast("Back in town.");
      showReport({ title: "Safe Return", kicker: "Back in town", subtitle: "You close the trail and return to town with everything you gathered." });
    }
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

  // ---- MANA RENGLERİ (skill skin) ----
  const RARITY_COLOR = {
    common: "#b0bec5", uncommon: "#66bb6a", rare: "#42a5f5",
    epic: "#ab47bc", legendary: "#ffb300", mythic: "#ff1744",
  };
  const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

  function skinCatalog() {
    const cat = (typeof CATALOG !== "undefined" && CATALOG) || null;
    return (cat && cat.skillSkins) || (S.engine && S.engine.skins) || {};
  }

  function ownedSkins() {
    if (Array.isArray(S.ownedSkins) && S.ownedSkins.length) return S.ownedSkins;
    const me = meFrom(S.room);
    if (me && Array.isArray(me.skins) && me.skins.length) return me.skins;
    return [];
  }

  function activeSkinId() {
    if (S.activeSkinId) return S.activeSkinId;
    const me = meFrom(S.room);
    return (me && me.activeSkin) || null;
  }

  // ---- Sefer ödülleri (XP/altın) ----
  function bindStatEvents() {
    if (typeof socket === "undefined" || S._statBound) return;
    S._statBound = true;
    socket.on("travel:killReward", (p) => {
      if (!p) return;
      bumpStat("kills", 1);
      bumpStat("xp", p.xp);
      bumpStat("gold", p.gold);
      const eng = S.engine;
      if (eng && eng.player && typeof eng.spawnDamageNumber === "function") {
        const P = eng.player;
        const off = (Math.random() - 0.5) * 26;
        eng.spawnDamageNumber(P.x + off, P.y - 10, `+${p.xp} XP`, "#8fe4ff");
        eng.spawnDamageNumber(P.x - off, P.y + 6, `+${p.gold}g`, "#ffd166");
      }
    });
    socket.on("travel:reward", (p) => {
      if (!p) return;
      if (p.gold) bumpStat("gold", p.gold);
      if (p.kind === "chest") bumpStat("chests", 1);
    });
  }

  function bindSkinEvents() {
    if (typeof socket === "undefined" || S._skinBound) return;
    S._skinBound = true;
    socket.on("skins:rolled", (p) => {
      if (!p || !p.skin) return;
      // Tek slot: yeni renk öncekinin yerine geçer.
      S.ownedSkins = [p.skin.id];
      S.activeSkinId = p.activeSkin || p.skin.id;
      if (S.engine) S.engine.setSkin(S.activeSkinId);
    });
    socket.on("skins:equipped", (p) => {
      if (!p || !p.id) return;
      S.activeSkinId = p.id;
      if (S.engine) S.engine.setSkin(p.id);
    });
  }

  // ---- Tüketilebilirler (iksir / azık) ----
  // Seyahatte canı yerel simüle ettiğimiz için sunucudan gelen "healed" miktarı
  // doğrudan motora uygulanır; azık sunucuda sayılır.
  const MAX_QUICK_ITEMS = 5;

  function consumables() {
    const me = meFrom(S.room);
    const inv = (me && me.inventory) || [];
    const items = (typeof CATALOG !== "undefined" && CATALOG && CATALOG.items) || [];
    const out = [];
    for (const slot of inv) {
      if (!slot || !slot.itemId) continue;
      const def = items.find((x) => x.id === slot.itemId);
      if (!def || def.slot !== "consumable") continue;
      const heal = Math.max(0, Number(def.heal) || 0);
      const food = Math.max(0, Number(def.food) || 0);
      if (!heal && !food) continue;
      out.push({ itemId: slot.itemId, qty: Math.max(1, Number(slot.qty) || 1), name: def.name || slot.itemId, heal, food });
      if (out.length >= MAX_QUICK_ITEMS) break;
    }
    return out;
  }

  function renderPotions() {
    const el = S.root && S.root.querySelector("#tv-potions");
    if (!el) return;
    const list = consumables();
    const sig = list.map((i) => i.itemId + "x" + i.qty).join("|");
    if (sig === S._potionSig) return;
    S._potionSig = sig;
    if (!list.length) { el.innerHTML = ""; el.classList.add("hidden"); return; }
    el.classList.remove("hidden");
    el.innerHTML = list.map((i, idx) => {
      const eff = [i.heal ? `+${i.heal} HP` : "", i.food ? `+${i.food} Food` : ""].filter(Boolean).join(" \u00b7 ");
      const tip = `${i.name} \u2014 ${eff} (press ${idx + 1})`;
      return `<button type="button" class="tv-potion" data-item="${escapeHtml(i.itemId)}" title="${escapeHtml(tip)}"><span class="k">${idx + 1}</span><span class="nm">${escapeHtml(i.name)}</span><span class="qt">&times;${i.qty}</span></button>`;
    }).join("");
  }

  function useConsumable(itemId) {
    if (!itemId || typeof socket === "undefined") return;
    socket.emit("inventory:use", { itemId });
  }

  // 1..5 tuşları hızlı tüketilebilir kullanır (tek sefer bağlanır).
  function bindUseKeys() {
    if (S._useBound) return;
    S._useBound = true;
    window.addEventListener("keydown", (e) => {
      if (!S.active || !S.engine || !S.root) return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > MAX_QUICK_ITEMS) return;
      const item = consumables()[n - 1];
      if (!item) return;
      e.preventDefault();
      useConsumable(item.itemId);
    });
  }

  function onItemUsed(p) {
    if (!p) return;
    S._potionSig = ""; // envanter değişti: çubuğu tazele
    renderPotions();
    const eng = S.engine;
    if (!eng || !S.active) return;
    const heal = Math.max(0, Number(p.healed) || 0);
    if (heal > 0 && typeof eng.healPlayer === "function") eng.healPlayer(heal, "#69f0ae");
    else if (typeof p.hp === "number" && typeof eng.setHp === "function") eng.setHp(p.hp);
  }

  // --- LoL tarzı alt skill bar (Q / E / R + ATK + DASH) -------------------
  const ELEM_RUNE = {
    physical: "\u2694", fire: "\u2739", frost: "\u2744", lightning: "\u26A1\uFE0E",
    shadow: "\u263E", holy: "\u2726", nature: "\u2766", arcane: "\u2727",
    blood: "\u271A", earth: "\u26F0\uFE0E",
  };
  const BUFF_LABEL_UI = {
    attack: "ATK", damage: "DMG", magic: "MGC", magicpower: "MGC",
    heal: "HEAL", healpower: "HEAL", defense: "DEF", resistance: "DEF",
    speed: "SPD", attackspeed: "ATK SPD",
  };
  function skillRune(sk) { return ELEM_RUNE[(sk && sk.element) || "physical"] || "\u2726"; }

  // Ikon dosyası var mı? (public/images/skills/<id>.png|webp) — bir kez denenir.
  const ICON_CACHE = {};
  function travelIconOk(id, cb) {
    if (!id) return cb(false);
    if (Object.prototype.hasOwnProperty.call(ICON_CACHE, id)) return cb(ICON_CACHE[id]);
    ICON_CACHE[id] = false;
    const exts = ["png", "webp"];
    const tryExt = (i) => {
      if (i >= exts.length) return cb(false);
      const img = new Image();
      img.onload = () => { ICON_CACHE[id] = exts[i]; S.skillSig = ""; cb(exts[i]); };
      img.onerror = () => tryExt(i + 1);
      img.src = `/images/skills/${encodeURIComponent(id)}.${exts[i]}`;
    };
    tryExt(0);
    return false;
  }

  function skillbarSlots() {
    const eng = S.engine;
    const set = eng && typeof eng.classSkillSet === "function" ? eng.classSkillSet() : null;
    const out = [{ key: "auto", kind: "attack", label: "ATK", rune: "\u2694", color: "#b1442f", name: "Attack" }];
    ["q", "e", "r"].forEach((k) => {
      const sk = set ? set[k] : null;
      const ext = sk && sk.id ? ICON_CACHE[sk.id] : null;
      if (sk && sk.id && ext === undefined) travelIconOk(sk.id, () => {});
      out.push({
        key: k, kind: "skill", label: k.toUpperCase(),
        rune: sk ? skillRune(sk) : "\u00B7",
        color: (sk && sk.color) || "#3a3226",
        name: (sk && sk.name) || "Empty",
        cd: (sk && Number(sk.cd)) || 0,
        icon: sk && sk.id && typeof ext === "string" ? `/images/skills/${encodeURIComponent(sk.id)}.${ext}` : "",
        off: !sk,
      });
    });
    out.push({ key: "dash", kind: "dash", label: "SPC", rune: "\u27A4", color: "#3c6f8c", name: "Dash" });
    return out;
  }

  function renderSkillVitals(bar) {
    const eng = S.engine;
    if (!eng || !bar) return;
    const st = (eng.playerData && eng.playerData.stats) || {};
    const maxHp = Math.max(1, Number(st.maxHp) || 1);
    const hp = Math.max(0, Math.min(maxHp, Number(st.currentHp != null ? st.currentHp : maxHp)));
    const fill = bar.querySelector(".tv-vital__fill");
    if (fill) fill.style.transform = `scaleX(${Math.max(0, hp / maxHp)})`;
    const num = bar.querySelector(".tv-vital__num");
    if (num) num.textContent = `${Math.ceil(hp)} / ${Math.ceil(maxHp)}`;
    const hearts = bar.querySelector(".tv-vital__hearts");
    if (hearts) {
      const me = meFrom(S.room);
      const lives = Math.max(0, Math.min(5, me && me.lives != null ? me.lives : 3));
      const maxLives = Math.max(3, S.maxLives || 3);
      if (lives > (S.maxLives || 0)) S.maxLives = lives;
      let html = "";
      for (let i = 0; i < Math.max(lives, maxLives); i += 1) {
        html += i < lives ? "\u2665" : `<span class="e">\u2665</span>`;
      }
      hearts.innerHTML = html;
    }
  }

  function renderStatPanel() {
    const el = S.root && S.root.querySelector("#tv-statpanel");
    if (!el || !S.engine) return;
    const st = (S.engine.playerData && S.engine.playerData.stats) || {};
    const buffs = S.engine.playerBuffs || [];
    const row = (ic, lbl, val, buff) => `<div class="tv-strow${buff ? " is-buff" : ""}"><span class="ic">${ic}</span><span class="lb">${lbl}</span><span class="vl">${val}</span></div>`;
    const parts = [
      row("\u2694", "ATK", Math.round(Number(st.attack) || 0)),
      row("\u2726", "MGC", Math.round(Number(st.magicPower) || 0)),
      row("\u2764", "HEAL", Math.round(Number(st.healPower) || 0)),
      row("\u25C6", "CRIT", `${Math.round((Number(st.critChance) || 0) * 100)}%`),
      row("\u26E8", "RES", Math.round(Number(st.defense) || 0)),
    ];
    for (const b of buffs) {
      if (!b) continue;
      const pct = Math.round(Number(b.pct) || 0);
      const left = Math.max(0, Number(b.timer) || 0);
      parts.push(`<div class="tv-strow is-buff"><span class="ic">\u25B2</span><span class="lb">${escapeHtml(BUFF_LABEL_UI[b.stat] || String(b.stat || "").toUpperCase())}</span><span class="vl">${pct > 0 ? "+" : ""}${pct}% ${left.toFixed(0)}s</span></div>`);
    }
    const html = parts.join("");
    if (html !== S.statPanelSig) { S.statPanelSig = html; el.innerHTML = html; }
  }

  function renderSkillbar() {
    if (!S.root || !S.engine) return;
    const bar = S.root.querySelector("#tv-skillbar");
    if (!bar) return;
    const slots = skillbarSlots();
    const sig = slots.map((s) => `${s.key}:${s.name}:${s.color}:${s.off ? 1 : 0}:${s.icon || ""}`).join("|");
    if (sig !== S.skillSig) {
      S.skillSig = sig;
      const vitals = `<div class="tv-vital" title="Health">
          <div class="tv-vital__hearts"></div>
          <div class="tv-vital__bar"><span class="tv-vital__fill"></span></div>
          <div class="tv-vital__num">&mdash;</div>
        </div>`;
      bar.innerHTML = vitals + slots.map((s) => `<button type="button" class="tv-sb${s.kind === "attack" ? " is-auto" : ""}${s.off ? " is-off" : ""}${s.icon ? " has-ic" : ""}"
          data-sb="${s.key}" data-kind="${s.kind}" title="${escapeHtml(s.name)}${s.cd ? ` · ${s.cd}s` : ""}"${s.icon ? ` style="--sk:${s.color};background-image:url('${s.icon}')"` : ` style="--sk:${s.color}"`}>
          <span class="tv-sb__ic">${s.rune}</span>
          <span class="tv-sb__key">${s.label}</span>
          <span class="tv-sb__bar"></span>
          <span class="tv-sb__cd"></span>
        </button>`).join("");
    }
    const P = S.engine.player || {};
    const paint = (key, frac, left) => {
      const b = bar.querySelector(`[data-sb="${key}"]`);
      if (!b) return;
      const on = frac > 0.0005;
      const cdEl = b.querySelector(".tv-sb__cd");
      const barEl = b.querySelector(".tv-sb__bar");
      if (barEl) barEl.style.transform = `scaleX(${on ? Math.max(0, Math.min(1, frac)) : 0})`;
      if (b.getAttribute("data-kind") !== "attack") b.classList.toggle("is-cd", on);
      if (cdEl) cdEl.textContent = on && b.getAttribute("data-kind") !== "attack"
        ? (left >= 1 ? String(Math.ceil(left)) : left.toFixed(1)) : "";
    };
    ["q", "e", "r"].forEach((k) => {
      const cdv = P.cooldowns && P.cooldowns[k];
      if (!cdv || !(cdv.max > 0)) return paint(k, 0, 0);
      paint(k, cdv.current / cdv.max, cdv.current);
    });
    const aps = typeof S.engine.computeAttackPerSecond === "function" ? S.engine.computeAttackPerSecond() : 1;
    const atkLeft = Math.max(0, Number(P.attackCooldown) || 0);
    paint("auto", atkLeft * aps, atkLeft);
    const dMax = Number(P.dashCooldown) || 0.85;
    const dLeft = Math.max(0, Number(P.dashCooldownTimer) || 0);
    paint("dash", dLeft / dMax, dLeft);
    renderSkillVitals(bar);
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
    renderStatPanel();
    const prompt = S.root.querySelector("#tv-prompt");
    if (prompt) {
      const target = S.engine._interactTarget;
      if (target) {
        const label = target.type === "poi" ? (target.name || target.kind) : "Kamp";
        let verb = "Inspect";
        if (target.type === "poi" && (target.kind === "dungeon" || target.kind === "den")) {
          verb = S.pendingDungeon === target.poiId ? "Enter" : "Form party at";
        } else if (target.type === "poi" && target.kind === "chest") verb = "Open";
        else if (target.type === "poi" && target.kind === "inn") verb = "Rest at";
        else if (target.type === "poi" && target.kind === "ruin") verb = "Search";
        prompt.innerHTML = `<b>E</b> &mdash; ${verb} ${escapeHtml(label)}`;
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
    renderSkillbar();
    renderPotions();
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
        if (b.hasAttribute("data-skill")) {
          // E kanal yeteneği: basılı tutma pointerdown/up ile yönetilir.
          if (b.getAttribute("data-skill") === "e") return;
          S.engine.triggerSkill(b.getAttribute("data-skill"));
        } else if (b.getAttribute("data-act") === "dash") S.engine.triggerDash();
        else if (b.getAttribute("data-act") === "attack") attackNearest();
      });
      if (b.getAttribute("data-skill") === "e") {
        b.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          if (!S.engine) return;
          S.engine.keys["e"] = true;
          S.engine.triggerSkill("e");
        });
        const release = () => { if (S.engine) S.engine.keys["e"] = false; };
        b.addEventListener("pointerup", release);
        b.addEventListener("pointerleave", release);
        b.addEventListener("pointercancel", release);
      }
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

  // ---- YETENEK PANELİ: Q/E/R kuşanma + yeni yetenek öğrenme ----
  const SKILL_SLOTS = ["q", "e", "r"];
  const ELEM_ICON = { physical: "\u2694", fire: "\u{1F525}", frost: "\u2744", lightning: "\u26A1", shadow: "\u2620", holy: "\u2726", arcane: "\u25C8", nature: "\u2766" };

  function classSkillData() {
    const cat = (typeof CATALOG !== "undefined" && CATALOG) || null;
    const me = meFrom(S.room);
    const slug = (me && me.character) || (S.engine && S.engine.playerData && S.engine.playerData.class);
    if (!slug) return null;
    if (cat && cat.arpgSkills && cat.arpgSkills[slug]) return cat.arpgSkills[slug];
    if (S.engine && S.engine.arpgSkills && S.engine.arpgSkills[slug]) return S.engine.arpgSkills[slug];
    return null;
  }

  function skillPoolList(set) {
    if (!set) return [];
    const out = [];
    SKILL_SLOTS.forEach((slot) => {
      if (set[slot]) out.push(Object.assign({}, set[slot], { defaultSlot: slot }));
    });
    (set.pool || []).forEach((sk) => { if (sk) out.push(Object.assign({}, sk)); });
    (set.late || []).forEach((sk) => { if (sk) out.push(Object.assign({}, sk)); });
    return out;
  }

  function travelSkillState() {
    const me = meFrom(S.room);
    const set = classSkillData();
    const all = skillPoolList(set);
    const learned = {};
    SKILL_SLOTS.forEach((slot) => { if (set && set[slot] && set[slot].id) learned[set[slot].id] = true; });
    ((me && me.travelSkills) || []).forEach((id) => { learned[id] = true; });
    const loadout = Object.assign({}, (me && me.travelLoadout) || {});
    return { me, set, all, learned, loadout };
  }

  function equippedId(set, loadout, slot) {
    // Yuva "açıkça boş" ("") bırakılmışsa varsayılana dönmeyiz.
    if (loadout && Object.prototype.hasOwnProperty.call(loadout, slot)) {
      return loadout[slot] || null;
    }
    return (set && set[slot] && set[slot].id) || null;
  }

  function elementIcon(sk) {
    return ELEM_ICON[(sk && sk.element) || "physical"] || "\u2694";
  }

  function skillMeta(sk) {
    if (!sk) return "";
    const el = String(sk.element || "physical");
    const bits = [el.charAt(0).toUpperCase() + el.slice(1), (Number(sk.cd) || 0) + "s"];
    if (Number(sk.power) > 0) bits.push("\u00D7" + sk.power);
    if (sk.healPct) bits.push(sk.healPct + "% heal");
    if (sk.shieldPct) bits.push(sk.shieldPct + "% shield");
    return bits.join(" \u00B7 ");
  }

  function toggleSkillPanel(force) {
    if (!S.root) return;
    const panel = S.root.querySelector("#tv-skill-panel");
    if (!panel) return;
    const open = force === undefined ? !panel.classList.contains("open") : !!force;
    S.skillPanelOpen = open;
    if (open) { renderSkillPanel(); panel.classList.add("open"); }
    else panel.classList.remove("open");
  }

  function renderSkillPanel() {
    if (!S.root) return;
    const wrap = S.root.querySelector("#tv-skill-panel");
    if (!wrap) return;
    const st = travelSkillState();
    const pts = (st.me && st.me.travelPoints) || 0;
    const pointsEl = wrap.querySelector("#tv-skill-points");
    if (pointsEl) {
      pointsEl.innerHTML = `<span class="ico">\u2726</span><b>${pts}</b><span class="lbl">Travel Points</span>`;
      pointsEl.classList.toggle("is-empty", pts <= 0);
    }
    const slotsEl = wrap.querySelector("#tv-skill-slots");
    if (slotsEl) {
      if (!st.set) {
        slotsEl.innerHTML = `<div class="tv-skill-empty">No class skills found.</div>`;
      } else {
        slotsEl.innerHTML = SKILL_SLOTS.map((slot) => {
          const id = equippedId(st.set, st.loadout, slot);
          const sk = id ? (st.all.find((s) => s.id === id) || st.set[slot]) : null;
          const on = (S.skillSlot || "q") === slot;
          const col = (sk && sk.color) || "#ffe6a8";
          return `<button type="button" class="tv-skill-slot${on ? " is-sel" : ""}" data-skill-slot="${slot}" style="--sk:${col}">
            <span class="k">${slot.toUpperCase()}</span>
            <span class="nm">${escapeHtml((sk && sk.name) || "\u2014")}</span>
            <span class="cd">${sk ? (Number(sk.cd) || 0) + "s" : ""}</span>
          </button>`;
        }).join("");
      }
    }
    const listEl = wrap.querySelector("#tv-skill-list");
    if (listEl) {
      listEl.innerHTML = st.all.map((sk) => {
        const isDefault = !!sk.defaultSlot;
        const owned = isDefault || !!st.learned[sk.id];
        const equipped = SKILL_SLOTS.some((slot) => equippedId(st.set, st.loadout, slot) === sk.id);
        const cost = Number(sk.cost) || 0;
        const col = sk.color || "#ffe6a8";
        let act;
        if (equipped) act = `<span class="tag tag--eq">Equipped</span>`;
        else if (owned) act = `<span class="tag tag--own">${isDefault ? "Default" : "Learned"}</span>`;
        else act = `<button type="button" class="tv-skill-learn" data-skill-learn="${escapeHtml(sk.id)}"${pts < cost ? " disabled" : ""}><span class="learn-lbl">Learn</span><i class="dot">\u00B7</i><span class="learn-cost">${cost}</span></button>`;
        return `<div class="tv-skill-card${owned ? "" : " is-locked"}${equipped ? " is-eq" : ""}" data-skill-pick="${escapeHtml(sk.id)}" style="--sk:${col}">
          <span class="ic">${elementIcon(sk)}</span>
          <span class="body">
            <span class="nm">${escapeHtml(sk.name)}</span>
            <span class="meta">${escapeHtml(skillMeta(sk))}</span>
            <span class="ds">${escapeHtml(sk.desc || "")}</span>
          </span>
          <span class="act">${act}</span>
        </div>`;
      }).join("");
    }
  }

  function bindSkillPanel() {
    const panel = S.root && S.root.querySelector("#tv-skill-panel");
    if (!panel || panel._bound) return;
    panel._bound = true;
    panel.addEventListener("click", (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("#tv-skill-close")) { toggleSkillPanel(false); return; }
      const slotBtn = t.closest("[data-skill-slot]");
      if (slotBtn) {
        S.skillSlot = slotBtn.getAttribute("data-skill-slot");
        renderSkillPanel();
        return;
      }
      const learnBtn = t.closest("[data-skill-learn]");
      if (learnBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof socket !== "undefined") socket.emit("travel:skill:learn", { id: learnBtn.getAttribute("data-skill-learn") });
        return;
      }
      const card = t.closest("[data-skill-pick]");
      if (card) equipTravelSkill(card.getAttribute("data-skill-pick"));
    });
  }

  function equipTravelSkill(id) {
    const st = travelSkillState();
    const sk = st.all.find((s) => s.id === id);
    if (!sk) return;
    const slot = S.skillSlot || "q";
    if (!sk.defaultSlot && !st.learned[id]) { toast("Learn this skill first."); return; }
    if (typeof socket === "undefined") return;
    // Aynı yeteneğe tekrar tıklamak o yuvayı varsayılana döndürür.
    if (equippedId(st.set, st.loadout, slot) === id) socket.emit("travel:skill:equip", { slot, id: null });
    else socket.emit("travel:skill:equip", { slot, id });
    renderSkillPanel();
  }

  // ---- Yere düşme ekranı (lobiye atılmadan, yumuşak geçişli) ----
  let downedEl = null;

  function ensureDownedEl() {
    if (!S.root) return null;
    if (!downedEl) {
      downedEl = document.createElement("div");
      downedEl.className = "tv-down";
      downedEl.innerHTML = `
        <div class="tv-down-card" role="dialog" aria-modal="true" aria-labelledby="tv-down-title">
          <div class="tv-down-orn tv-down-orn--tl"></div>
          <div class="tv-down-orn tv-down-orn--tr"></div>
          <div class="tv-down-orn tv-down-orn--bl"></div>
          <div class="tv-down-orn tv-down-orn--br"></div>
          <div class="tv-down-crest" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="46" height="46"><path d="M32 5 44 17v13c0 12-8 20-12 24-4-4-12-12-12-24V17Z" fill="none" stroke="url(#tvg)" stroke-width="2.2"/><path d="M32 19v13M25.5 25.5h13" stroke="url(#tvg)" stroke-width="2.2" stroke-linecap="round"/><defs><linearGradient id="tvg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dda6"/><stop offset="1" stop-color="#9a6a2c"/></linearGradient></defs></svg>
          </div>
          <div class="tv-down-kicker">The wilds claim you</div>
          <h2 class="tv-down-title" id="tv-down-title">You Have Fallen</h2>
          <div class="tv-down-rule"><span>&#10022;</span></div>
          <div class="tv-down-hearts" id="tv-downed-hearts"></div>
          <p class="tv-down-text">Your torch still burns. An ally may raise you, or you may walk back to town &mdash; keeping everything you found.</p>
          <div class="tv-down-actions">
            <button type="button" class="tv-btn tv-btn--ghost" id="tv-downed-give">Return to town</button>
          </div>
        </div>`;
      S.root.appendChild(downedEl);
      const giveBtn = downedEl.querySelector("#tv-downed-give");
      if (giveBtn) giveBtn.addEventListener("click", () => {
        if (typeof socket !== "undefined") socket.emit("travel:giveup");
        hideDownedOverlay();
      });
    }
    if (downedEl.parentElement !== S.root) S.root.appendChild(downedEl);
    return downedEl;
  }

  function showDownedOverlay(opts) {
    const el = ensureDownedEl();
    if (!el) return;
    const hearts = el.querySelector("#tv-downed-hearts");
    if (hearts) {
      const n = Math.max(0, Math.min(9, Number.isFinite(opts && opts.hearts) ? opts.hearts : 0));
      hearts.innerHTML = n > 0
        ? Array.from({ length: n }, () => '<i class="tv-down-heart">&#10022;</i>').join("")
        : '<span class="tv-down-hearts-none">The last light gutters out</span>';
    }
    el.style.display = "flex";
    requestAnimationFrame(() => { if (el) el.classList.add("is-open"); });
  }

  function hideDownedOverlay() {
    if (!downedEl) return;
    const el = downedEl;
    el.classList.remove("is-open");
    setTimeout(() => { if (el && !el.classList.contains("is-open")) el.style.display = "none"; }, 260);
  }

  // ---- Sefer raporu (Travel'den donus ozeti) ----
  let reportEl = null;

  function fmtDuration(ms) {
    const s = Math.max(0, Math.round((Number(ms) || 0) / 1000));
    const m = Math.floor(s / 60), r = s % 60;
    return m > 0 ? `${m}m ${r}s` : `${r}s`;
  }

  function hideReport() {
    if (!reportEl) return;
    const el = reportEl;
    reportEl = null;
    el.classList.remove("is-open");
    setTimeout(() => { try { el.remove(); } catch (e) {} }, 280);
  }

  function showReport(opts) {
    opts = opts || {};
    try { injectStyles(); } catch (e) {}
    const st = S.stats || { kills: 0, gold: 0, xp: 0, chests: 0, startedAt: Date.now() };
    if (st._shown) return;
    st._shown = true;
    hideReport();
    const kills = Math.round(st.kills || 0);
    const gold = Math.round(st.gold || 0);
    const xp = Math.round(st.xp || 0);
    const chests = Math.round(st.chests || 0);
    const dur = fmtDuration(Date.now() - (st.startedAt || Date.now()));
    const rows = [
      { ic: "\u2694", lbl: "Monsters Slain", val: String(kills) },
      { ic: "\u25C6", lbl: "Gold Earned", val: `${gold}g` },
      { ic: "\u2726", lbl: "Experience Gained", val: `${xp} XP` },
      { ic: "\u25A0", lbl: "Chests Opened", val: String(chests) },
      { ic: "\u23F1", lbl: "Time Afield", val: dur },
    ].map((r) => `<div class="tv-report-row"><span class="tv-report-lbl"><span class="ic">${r.ic}</span>${escapeHtml(r.lbl)}</span><span class="tv-report-val">${escapeHtml(r.val)}</span></div>`).join("");
    reportEl = document.createElement("div");
    reportEl.className = "tv-report";
    reportEl.innerHTML = `
      <div class="tv-report-card" role="dialog" aria-modal="true" aria-label="Expedition report">
        <div class="tv-report-orn tv-report-orn--tl"></div>
        <div class="tv-report-orn tv-report-orn--tr"></div>
        <div class="tv-report-orn tv-report-orn--bl"></div>
        <div class="tv-report-orn tv-report-orn--br"></div>
        <div class="tv-report-crest" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="44" height="44"><path d="M32 6 46 14v16c0 12-9 21-14 25-5-4-14-13-14-25V14Z" fill="none" stroke="url(#tvr)" stroke-width="2.2"/><path d="M24 30l6 6 12-14" fill="none" stroke="url(#tvr)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="tvr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dda6"/><stop offset="1" stop-color="#9a6a2c"/></linearGradient></defs></svg>
        </div>
        <div class="tv-report-kicker">${escapeHtml(opts.kicker || "Safely returned")}</div>
        <h2 class="tv-report-title">${escapeHtml(opts.title || "Expedition Report")}</h2>
        <div class="tv-report-rule"><span>&#10022;</span></div>
        <p class="tv-report-sub">${escapeHtml(opts.subtitle || "You made it back to town with your spoils.")}</p>
        <div class="tv-report-rows">${rows}</div>
        <div class="tv-report-actions">
          <button type="button" class="tv-btn tv-btn--gold" id="tv-report-continue">Continue</button>
        </div>
      </div>`;
    document.body.appendChild(reportEl);
    const btn = reportEl.querySelector("#tv-report-continue");
    if (btn) btn.addEventListener("click", hideReport);
    requestAnimationFrame(() => { if (reportEl) reportEl.classList.add("is-open"); });
  }

  // Mana rengi roll & kuşanma olaylarını bağla (socket hazırsa).
  try { bindSkinEvents(); } catch (e) { /* socket henüz yoksa boot'ta bağlanır */ }
  try { bindStatEvents(); } catch (e) { /* socket henüz yoksa boot'ta bağlanır */ }

  window.SetraTravel = {
    ensure, setMap, update, open, pause, close,
    teleport, reveal() {}, toast, addExplored() {},
    showReport(opts) { try { showReport(opts); } catch (e) {} },
    hideReport,
    stats() { return S.stats ? { ...S.stats } : null; },
    enterDowned(opts) { if (S.engine) { S.engine.setDowned(true); if (S.engine.sound) S.engine.sound.play('downed'); } showDownedOverlay(opts || {}); },
    leaveDowned(hp) {
      if (S.engine) { S.engine.setDowned(false); if (hp != null) S.engine.setHp(hp); if (S.engine.sound) S.engine.sound.play('revive'); }
      hideDownedOverlay();
    },
    setOtherPos(id, x, y) {
      if (!id || !Number.isFinite(x) || !Number.isFinite(y)) return;
      // Kendi konumumuzu "diğer oyuncu" gibi çizmeyelim (kopya karakter/isim olur).
      if (id === myId()) { delete S.others[id]; if (S.engine) delete S.engine.others[id]; return; }
      S.others[id] = { x, y };
      if (!S.engine || !S.room) return;
      const pl = (S.room.players || []).find((p) => p.id === id);
      const w = S.engine.serverToWorld(x, y);
      const prev = S.engine.others[id] || { id };
      prev.wx = w.x; prev.wy = w.y;
      prev.name = (pl && pl.name) || prev.name || "Adventurer";
      prev.color = prev.color || classColor(pl && pl.character);
      if (pl && pl.maxHp) prev.hpFrac = clamp01((pl.hp || 0) / pl.maxHp);
      S.engine.others[id] = prev;
    },
    hasMap() { return !!S.map; },
    // Kasabaya dönüş yalnızca varış taşından (haritanın başlangıç noktası) yapılabilir.
    // Sunucu da aynı kuralı doğrular; bu yalnızca kullanıcıya erken geri bildirim verir.
    canReturnToTown() {
      try {
        // Motor/harita yoksa (henüz kurulmadıysa) engellemeyiz; sunucu yine doğrular.
        if (!S.engine || !S.map || !S.engine.player) return true;
        const sp = S.map.spawn || S.spawn || { x: 0, y: 0 };
        const w = S.engine.serverToWorld((sp.x || 0) + 0.5, (sp.y || 0) + 0.5);
        const tile = S.engine.tileSize || S.engine.worldScale || 64;
        const d = Math.hypot((S.engine.player.x || 0) - w.x, (S.engine.player.y || 0) - w.y);
        return d <= tile * 3.5;
      } catch (e) { return true; }
    },
    get ready() { return !!(S.active && S.engine); },
    // Sunucu parti kurduğunu bildirdiğinde ikinci E zindana girer.
    noteParty(poiId) { if (poiId) S.pendingDungeon = poiId; },
    clearParty() { S.pendingDungeon = null; },
    // Sunucudan gelen can değerini uygular (kalp kaybı sonrası).
    setHp(hp) { if (S.engine) S.engine.setHp(hp); },
    // Tüketilebilir kullanıldığında (iksir/azık) canı motora uygular.
    onItemUsed(p) { try { onItemUsed(p); } catch (e) {} },
  };
})();