const CATALOG = {
  classes: [],
  sizes: [],
  skills: [],
  monsters: [],
  dungeons: [],
  elements: [],
  town: { tavern: { bets: [5, 10, 25] } },
};

function elemDef(id) {
  return (CATALOG.elements || []).find((e) => e && e.id === id) || null;
}
function elemSound(id) {
  const d = elemDef(id);
  return (d && d.sound) || ELEMENT_SOUNDS[id] || "";
}
function elemDefaultFx(id) {
  const d = elemDef(id);
  return (d && d.effect) || "element_" + id;
}
function elemTravelFx(id) {
  const d = elemDef(id);
  return (d && d.travel) || "element_" + id + "_projectile";
}
function injectElementTints(elements) {
  try {
    let css = "";
    for (const el of elements) {
      if (!el || !el.id) continue;
      const pal = Array.isArray(el.palette) && el.palette.length ? el.palette : [el.color || "#658a5e"];
      const c1 = pal[0];
      const c2 = pal[pal.length - 1];
      css += ".st-node-ico--" + el.id + " { background: linear-gradient(135deg, " + c1 + ", " + c2 + "); }\n";
    }
    if (!css) return;
    let st = document.getElementById("setra-element-tints");
    if (!st) {
      st = document.createElement("style");
      st.id = "setra-element-tints";
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = css;
  } catch (e) {
    /* non-fatal */
  }
}

function applyCatalog(cat) {
  Object.assign(CATALOG, cat);
  if (Array.isArray(cat.elements) && cat.elements.length) {
    if (window.SetraEffects && typeof window.SetraEffects.setElements === "function") {
      try { window.SetraEffects.setElements(cat.elements); } catch (e) { /* non-fatal */ }
    }
    injectElementTints(cat.elements);
  }
}

function $(id) {
  return document.getElementById(id);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
  $(id).classList.remove("hidden");
  if (document.body) document.body.dataset.screen = id;
  // Ses + menü kısayolları her ekranda (ana menü dahil) görünür.
  const edge = $("edge-buttons");
  if (edge) edge.classList.remove("hidden");
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 3200);
}

// ---- Feedback: sounds, floating text, hit effects ----

let sfxEnabled = localStorage.getItem("setra-sfx-enabled") !== "0";
function setSfxEnabled(on) {
  sfxEnabled = on;
  localStorage.setItem("setra-sfx-enabled", on ? "1" : "0");
}

let sfxVolume = Number(localStorage.getItem("setra-sfx-volume")) || 100;
function setSfxVolume(v) {
  const n = Math.min(100, Math.max(1, Math.round(Number(v) || 100)));
  sfxVolume = n;
  localStorage.setItem("setra-sfx-volume", String(n));
}

let sfxCtx = null;
function ensureSfx() {
  if (!sfxCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) sfxCtx = new AC();
  }
  if (sfxCtx && sfxCtx.state === "suspended") sfxCtx.resume().catch(() => {});
  return sfxCtx;
}

function sfxTone(freq, dur, type, vol, when, slideTo) {
  const ctx = sfxCtx;
  if (!ctx) return;
  const t0 = ctx.currentTime + (when || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol * (sfxVolume / 100), t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function sfxNoise(dur, vol, when, filterFreq) {
  const ctx = sfxCtx;
  if (!ctx) return;
  const t0 = ctx.currentTime + (when || 0);
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq || 800;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * (sfxVolume / 100), t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t0);
}

function playSfx(name) {
  if (!sfxEnabled) return;
  ensureSfx();
  if (!sfxCtx) return;
  switch (name) {
    case "hit":
      sfxNoise(0.16, 0.45, 0, 850);
      sfxTone(150, 0.15, "square", 0.22, 0, 70);
      break;
    case "heal":
      sfxTone(520, 0.12, "sine", 0.22, 0);
      sfxTone(660, 0.14, "sine", 0.18, 0.09);
      sfxTone(880, 0.18, "sine", 0.14, 0.18);
      break;
    case "block":
      sfxTone(230, 0.1, "square", 0.16, 0, 140);
      sfxNoise(0.06, 0.22, 0, 1400);
      break;
    case "coin":
      sfxTone(880, 0.09, "sine", 0.18, 0);
      sfxTone(1320, 0.2, "sine", 0.16, 0.07);
      break;
    case "item":
      sfxTone(440, 0.07, "square", 0.12, 0, 520);
      sfxTone(660, 0.09, "square", 0.1, 0.06, 720);
      break;
    case "turn":
      sfxTone(600, 0.06, "sine", 0.1, 0, 740);
      break;
    case "win":
      sfxTone(523, 0.13, "triangle", 0.2, 0);
      sfxTone(659, 0.13, "triangle", 0.2, 0.1);
      sfxTone(784, 0.26, "triangle", 0.2, 0.2);
      break;
    case "lose":
      sfxTone(392, 0.16, "sawtooth", 0.16, 0, 320);
      sfxTone(262, 0.28, "sawtooth", 0.16, 0.14, 210);
      break;
    case "arcane":
      sfxTone(760, 0.09, "sine", 0.16, 0, 980);
      sfxTone(620, 0.1, "sine", 0.14, 0.06, 520);
      break;
    case "holy":
      sfxTone(880, 0.09, "triangle", 0.14, 0);
      sfxTone(1174, 0.14, "triangle", 0.12, 0.07);
      sfxTone(1568, 0.2, "triangle", 0.1, 0.15);
      break;
    case "shadow":
      sfxTone(180, 0.18, "sawtooth", 0.18, 0, 90);
      sfxTone(110, 0.22, "sawtooth", 0.14, 0.08, 60);
      sfxNoise(0.1, 0.3, 0, 300);
      break;
    case "crit":
      sfxNoise(0.2, 0.6, 0, 900);
      sfxTone(120, 0.18, "square", 0.26, 0, 60);
      sfxTone(1320, 0.16, "sine", 0.14, 0.02, 1760);
      break;
    default:
      break;
  }
}

// ---- Real sound files (public/sounds/) ----

let soundMap = new Map();
const audioCache = {};
const SYNTH_FALLBACK = {
  slash: "hit", heavy: "hit", axe: "hit", crush: "crit", arcane: "arcane",
  fire: "arcane", frost: "arcane", water: "arcane", earth: "hit", lightning: "arcane", blood: "shadow", dark: "shadow", holy: "holy", shadow: "shadow", nature: "arcane",
  heal: "heal", defend: "block", monster: "hit", crit: "crit",
};

async function loadSounds() {
  try {
    const res = await fetch("/api/sounds");
    const data = await res.json();
    soundMap = new Map((data.sounds || []).map((s) => [s.id, s.url]));
  } catch (e) {
    soundMap = new Map();
  }
}
loadSounds();
let vfx = null;
function initVfx(){
  try{ if(window.SetraEffects && document.getElementById('gameVfxCanvas')) vfx = new SetraEffects('gameVfxCanvas'); }catch(e){ console.warn("vfx init failed", e); }
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initVfx);
else initVfx();
window.addEventListener('load', ()=>{ if(!vfx) initVfx(); });

function sfxPlay(names, vol) {
  if (!sfxEnabled) return;
  const group = Array.isArray(names) ? names : names ? [names] : [];
  const available = group.filter((id) => soundMap.has(id));
  const id = available.length ? available[Math.floor(Math.random() * available.length)] : null;
  if (id) {
    if (!audioCache[id]) audioCache[id] = new Audio(soundMap.get(id));
    const a = audioCache[id].cloneNode();
    a.volume = (vol == null ? 0.9 : vol) * (sfxVolume / 100);
    a.play().catch(() => {});
    return;
  }
  const name = SYNTH_FALLBACK[group[0]] || (group.length ? "arcane" : null);
  if (name) playSfx(name);
}

const INTERACTIVE_SELECTOR =
  ".btn, .action-card, .class-card, .room-row, .dungeon-card, .size-card, .bet-btn, .skill-slot, .item-btn, .enemy, .fighter, .equip-slot, .bag-row, .shop-card, .temple-card, .btn-chest-action, .btn-chest-confirm";
let lastHoverEl = null;
let lastHoverSfxTime = 0;
const HOVER_SFX_COOLDOWN_MS = 100;
document.addEventListener("mouseover", (e) => {
  if (!sfxEnabled) return;
  const el = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
  if (el && el !== lastHoverEl) {
    lastHoverEl = el;
    const now = performance.now();
    if (now - lastHoverSfxTime >= HOVER_SFX_COOLDOWN_MS) {
      lastHoverSfxTime = now;
      sfxPlay("hoversound", 0.25 + Math.random() * 0.1);
    }
  }
});
document.addEventListener("mouseout", (e) => {
  const el = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
  if (el === lastHoverEl) lastHoverEl = null;
});
document.addEventListener("click", (e) => {
  if (!sfxEnabled) return;
  const el = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
  if (el) sfxPlay("clicksound");
});

function spawnPopup(el, text, kind, color) {
  if (!el) return;
  const pop = document.createElement("span");
  pop.className = "fx-popup" + (kind ? " fx-popup--" + kind : "");
  if (color) pop.style.color = color;
  pop.textContent = text;
  el.appendChild(pop);
  setTimeout(() => pop.remove(), 950);
}

const FX_CLASSES = ["fx-hit", "fx-heal", "fx-defend", "fx-hit-arcane", "fx-hit-holy", "fx-hit-shadow", "fx-hit-crit"];

const ELEMENT_SOUNDS = {
  physical: ["slash1", "slash2", "slash3", "slash4"],
  fire: "firemagic",
  frost: "frostmagic",
  water: "frostmagic",
  earth: "battleaxe",
  lightning: "normalmagic",
  blood: ["bloodmagic1", "bloodmagic2"],
  dark: "bloodmagic2",
  heal: "healingmagic",
  shadow: ["bloodmagic1", "bloodmagic2"],
  arcane: "normalmagic",
  defend: "shield",
  monster: "monstersound",
};

function applyTargetFx(el, kind) {
  if (!el) return;
  el.classList.remove(...FX_CLASSES);
  void el.offsetWidth;
  el.classList.add("fx-" + (kind || "hit"));
  setTimeout(() => el.classList.remove(...FX_CLASSES), 600);
}

function shakeCombat(root) {
  const wrap = root.querySelector(".combat-wrap");
  if (!wrap) return;
  wrap.classList.remove("combat-shake");
  void wrap.offsetWidth;
  wrap.classList.add("combat-shake");
  setTimeout(() => wrap.classList.remove("combat-shake"), 550);
}

const BUFF_META = {
  attack: { label: "Atk+", color: "#8fe08a" },
  defense: { label: "Def+", color: "#7fb4ff" },
  regen: { label: "Regen", color: "#8fe08a" },
  weaken: { label: "Weaken", color: "#ff9d7a" },
  expose: { label: "Vuln", color: "#ffb84d" },
  dot: { label: "Bleed", color: "#ff6b6b" },
  wet: { label: "💧Wet", color: "#7fb4ff" },
  frozen: { label: "❄ Frozen", color: "#9fd4ff" },
  shield: { label: "🛡️ Shield", color: "#7fb4ff" },
  magicBoost: { label: "Mgc+", color: "#c9a0ff" },
  pet_attack: { label: "Pet Atk+", color: "#ff9b4a" },
  pet_magic: { label: "Pet Mgc+", color: "#ff9b4a" },
  pet_defense: { label: "Pet Def+", color: "#7fb4ff" },
  pet_weaken: { label: "Pet Weak", color: "#ff9d7a" },
};
function petStage(level){
  const lv = level||1;
  if(lv >= 15) return "adult";
  if(lv >= 8) return "young";
  return "baby";
}
function petDisplayName(petDef, level){
  const base = petDef ? petDef.name : "Pet";
  const stage = petStage(level);
  const prefix = stage==="baby" ? "Baby " : stage==="young" ? "Young " : "Adult ";
  // if name already contains Baby/Young etc, don't double
  if(base.toLowerCase().includes("baby") || base.toLowerCase().includes("young") || base.toLowerCase().includes("adult")) return base;
  return prefix + base;
}
// Origin phrases like "Slime King from Green Egg" describe data, not gameplay —
// show the name/description without the origin tail.
function stripPetOrigin(text) {
  return String(text || "").replace(/\s+from\s+[\w\s'-]*egg\s*$/i, "").trim();
}
function petImageForLevel(petDef, level){
  if(!petDef || !petDef.image) return "";
  const stage = petStage(level);
  if(stage==="baby") return petDef.image;
  const base = petDef.image.replace(/\.png$/,'');
  const suffix = stage==="young" ? "_young.png" : "_adult.png";
  return base + suffix;
}
// Hover tooltip içeriği: isim + statlar (level bonusları dahil) + skiller.
// Fighter kartları overflow:hidden olduğu için özel balon kesilirdi —
// native title çok satırlı basılır, her yerde risksiz çalışır.
function petStatText(pd, pp) {
  const st = (pd && pd.stats) || {};
  const bA = (pp && pp.bonusAttack) || 0;
  const bM = (pp && pp.bonusMagic) || 0;
  const bR = (pp && pp.bonusResist) || 0;
  const parts = [];
  if (st.attack) parts.push(`Atk ${st.attack + bA}`);
  if (st.magicPower) parts.push(`Mgc ${st.magicPower + bM}`);
  if (st.resistance) parts.push(`Res ${st.resistance + bR}`);
  return parts.join(" · ");
}
function petSkillText(pd) {
  if (pd && Array.isArray(pd.petSkills) && pd.petSkills.length) {
    return pd.petSkills
      .map((s) => `${s.kind} ${s.value}${s.kind === "attack" || s.kind === "heal" || s.kind === "shield" ? "" : "%"} /${s.interval || 2}t`)
      .join(" · ");
  }
  if (pd && pd.buffKind) return `${pd.buffKind} (${pd.element || "physical"})`;
  return "auto";
}
function petTitleText(pd, pp, lvl) {
  if (!pd) return "Pet";
  const lines = [`${petDisplayName(pd, lvl)} — Lv ${lvl} ${petStage(lvl)}`];
  if (pd.element) lines.push(`Element: ${pd.element}`);
  const stats = petStatText(pd, pp);
  if (stats) lines.push(stats);
  lines.push("Skills: " + petSkillText(pd));
  if (pd.description) lines.push(stripPetOrigin(pd.description));
  return lines.join("\n");
}

function buffBadges(d, targetType, targetId) {
  const list = (d && d.buffs || []).filter(
    (b) => b.targetType === targetType && String(b.targetId) === String(targetId)
  );
  if (!list.length) return "";
  return `<span class="buff-badges">${list
    .map((b) => {
      const meta = BUFF_META[b.kind] || { label: b.kind || "?", color: "#ffffff" };
      const name = escapeHtml(b.name || meta.label);
      return `<span class="buff-badge" style="--bc:${meta.color}" title="${name} · ${b.turns} turn${b.turns === 1 ? "" : "s"}" data-buff="${escapeHtml(b.kind)}"><em>${escapeHtml(meta.label)}</em><i>${b.turns}</i></span>`;
    })
    .join("")}</span>`;
}

function fxRecipe(effect, elem) {
  const effects = (CATALOG && CATALOG.effects) || {};
  const r = effects[effect] || effects.slash || { animation: "hit", color: "#ff7a5c", particles: "slash" };
  if (!effects[effect]) {
    const d = elemDef(elem);
    if (d && d.palette && d.palette.length) return Object.assign({}, r, { color: d.palette[0] });
  }
  return r;
}

function spawnParticles(el, type, color) {
  if (!el) return;
  const c = color || "#ffffff";
  const wrap = document.createElement("span");
  wrap.className = "fx-particles fx-particles--" + (type || "slash");
  wrap.style.setProperty("--pe", c);
  if (type === "shatter" || type === "burst") {
    const n = type === "shatter" ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const shard = document.createElement("i");
      const ang = (Math.PI * 2 * i) / n + (Math.random() * 0.6 - 0.3);
      const dist = 24 + Math.random() * 20;
      shard.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      shard.style.setProperty("--dy", (Math.sin(ang) * dist).toFixed(1) + "px");
      shard.style.setProperty("--rot", (Math.random() * 240 - 120).toFixed(0) + "deg");
      wrap.appendChild(shard);
    }
  }
  el.appendChild(wrap);
  setTimeout(() => wrap.remove(), 800);
}

function drainCombatFx(root) {
  const pending = state.pendingFx || [];
  const fx = pending.splice(0, pending.length);
  for (const ev of fx) {
    if (!ev) continue;
    if (ev.type === "mana") {
      if (ev.restore) {
        const targetEl = root.querySelector('.fighter[data-fighter="' + ev.actor + '"]');
        spawnPopup(targetEl, "+" + ev.amount + " Mana", "heal", "#7fb4ff");
        applyTargetFx(targetEl, "heal");
        playSfx("arcane");
      }
      continue;
    }
    if (ev.type === "loot") {
      sfxPlay("lootsound");
      continue;
    }
    if (ev.type === "chest") {
      sfxPlay("lootsound");
      continue;
    }
    let el = null;
    let fromEl = null;
    if (ev.target === "enemy") { el = root.querySelector('.enemy[data-enemy="' + ev.targetId + '"]'); fromEl = root.querySelector('.fighter[data-fighter="' + ev.actor + '"]') || el; }
    else if (ev.target === "player") { el = root.querySelector('.fighter[data-fighter="' + ev.targetId + '"]'); fromEl = root.querySelector('.enemy[data-enemy="0"]') || root.querySelector('.fighter[data-fighter="' + ev.actor + '"]') || el; }
    // map old effect to new 80
    const vfxMap = { slash:"rising_katana_slash", heavy:"heavy_hammer_slam", axe:"axe_cleave_horizontal", crush:"heavy_hammer_slam", heal:"heal_aura_fountain", defend:"radiant_halo_shield", monster:"rising_katana_slash", crit:"heavy_hammer_slam", buff:"radiant_halo_shield", dot:"blood_needles", shield:"radiant_halo_shield", wet:"tidal_wave_water", frozen:"frost_prison_dome" };
    const _registryIds = (typeof window !== "undefined" && Array.isArray(window.SETRA_EFFECTS_REGISTRY)) ? window.SETRA_EFFECTS_REGISTRY : [];
    const _isRealId = (v) => typeof v === "string" && v.length > 0 && _registryIds.some((e) => e && e.id === v);
    const _sk0 = (ev.skill && typeof skillById === "function") ? skillById(ev.skill) : null;
    const _elem = ev.elem || (_sk0 && _sk0.element) || null;
    const _defFx = _elem ? elemDefaultFx(_elem) : null;
    let vfxId = (_isRealId(ev.vfxId) && ev.vfxId) || (_isRealId(ev.effect) && ev.effect) || vfxMap[ev.effect] || (_isRealId(_defFx) && _defFx) || vfxMap[ev.elem] || "rising_katana_slash";
    // --- GEZGIN SKILL DUZELTMESI (sadece gorsel, oyun mantigi degismez) ---
    // bolt/beam/ray/laser/spear/javelin/lance gibi skiller hedefte belirmemeli;
    // caster kartindan baslayip hedef karta gitmeli (capraz konumda capraz gider).
    // Tum skiller icin travel mode tespiti calisir (explicit effect olsa bile).
    // Explicit effect tanimi varsa korunur, sadece travel mode ayarlanir.
    // Savunma skilleri (shadow_step, static_overload, thunderbolt) haric tutulur.
    let _travel = null; // 'beam' (lazer isin) | 'projectile' (firlatilan cisim) | null
    try {
      const _sk = (ev.skill && typeof skillById === "function") ? skillById(ev.skill) : null;
      const _elem = ev.elem || (_sk && _sk.element) || null;
      if (_elem && (ev.target === "enemy" || ev.target === "player")) {
        const _sid = String(ev.skill || "").toLowerCase();
        // Elemente gore gidecek efekt: hepsi "ucan/giden" tipler (registry'de projectile)
        const _travelProj = { fire:"fireball_streak", frost:"frost_crystal_spear", water:"frost_crystal_spear", earth:"rock_avalanche_barrage", lightning:"storm_spear_throw", blood:"blood_drain", dark:"dark_matter_orb", shadow:"dark_matter_orb", holy:"holy_lance_projectile", arcane:"ball_lightning_plasma", physical:"piercing_rapier_thrust" };
        // Skil adindan travel mode tespiti (explicit effect olsa bile calisir)
        if (/beam|ray|laser|lazer/.test(_sid)) _travel = "beam";
        else if (/bolt/.test(_sid)) _travel = (_elem === "lightning" || _elem === "holy" || _elem === "arcane") ? "beam" : "projectile";
        else if (/spear|javelin|lance|dagger|arrow|shot|thrust|throw|orb|ball|missile|spike|barrage|volley/.test(_sid)) _travel = "projectile";
        // Elemente gore default travel mode
        if (!_travel && _elem === "lightning") _travel = "beam"; // lightning defaultu gokten iniyordu, isin olmali
        else if (!_travel && _elem === "holy") _travel = "beam"; // holy skilleri caster'dan hedefe lazer olarak gider
        // Savunma/buff skilleri travel olmamali (yanlis keyword eslesmeleri)
        if (_sid === "shadow_step" || _sid === "static_overload" || _sid === "thunderbolt") _travel = null;
        // Explicit effect varsa onu koru, sadece travel mode ayarla
        const _hasExplicitFx = !!(_sk && _sk.effect);
        if (_travel && !_hasExplicitFx) {
          const _tp = elemTravelFx(_elem);
          if (_isRealId(_tp)) vfxId = _tp;
          else if (_travelProj[_elem]) vfxId = _travelProj[_elem];
        }
      }
    } catch (e) { /* gorsel fallback: vfxId aynen kalir */ }
    if (vfx && el) {
      const fromRect = fromEl ? fromEl.getBoundingClientRect() : el.getBoundingClientRect();
      const toRect = el.getBoundingClientRect();
      const fromX = fromRect.left + fromRect.width/2;
      const fromY = fromRect.top + fromRect.height/2;
      const toX = toRect.left + toRect.width/2;
      const toY = toRect.top + toRect.height/2;
      // 400ms delay for pet-like smoothness, player skills also 0-400ms
      const delay = ev.source==="pet" ? 400 : 0;
      setTimeout(()=>{ try{ vfx.play(vfxId, {fromX, fromY, toX, toY, travel: _travel}); }catch(e){} }, delay);
    }
    if (ev.type === "damage") {
      const r = fxRecipe(ev.effect, ev.elem);
      // Gerçek hasar (true damage) her zaman bembeyaz vurur; fiziksel ise
      // paletin ikinci rengiyle (altın) görünür, beyazla karışmaz.
      const isTrue = !!(_sk0 && (_sk0.trueDamage || (_sk0.baseDamage != null && typeof _sk0.baseDamage === "object" && _sk0.baseDamage.true)));
      const elemId = _elem || ev.elem;
      const dmgColor = isTrue ? "#ffffff" : elemId === "physical" ? "#fde047" : r.color;
      if (ev.crit) {
        spawnPopup(el, "CRIT " + ev.amount, "crit", isTrue ? "#ffffff" : r.color);
        const critSnd = ev.sound || "skull_crush";
        sfxPlay(critSnd);
        shakeCombat(root);
      } else {
        spawnPopup(el, "-" + ev.amount, "damage", dmgColor);
        const monsterDefault = ev.source === "monster" && (!ev.elem || ev.elem === "physical");
        const snd = ev.sound || (monsterDefault ? ELEMENT_SOUNDS.monster : null) || elemSound(ev.elem) || r.sound;
        if (snd) sfxPlay(snd);
      }
    } else if (ev.type === "heal") {
      spawnPopup(el, "+" + ev.amount, "heal", "#4ade80");
      sfxPlay(ELEMENT_SOUNDS.heal || "heal_aura_fountain");
    } else if (ev.type === "defend") {
      spawnPopup(el, "Defended", "defend", "#8fc9ff");
      sfxPlay(ELEMENT_SOUNDS.defend || "radiant_halo_shield");
    } else if (ev.type === "shield") {
      spawnPopup(el, "🛡️ +" + ev.amount, "heal", "#7fb4ff");
      sfxPlay("shield");
    } else if (ev.type === "egg") {
      sfxPlay("lootsound");
      spawnPopup(root, "🥚 Egg!", "heal", "#ffe14d");
    } else if (ev.type === "buff") {
      const meta = BUFF_META[ev.kind] || { label: ev.kind || "Buff", color: "#8fe08a" };
      const txt = meta.label + (ev.turns && ev.turns > 1 ? " ×" + ev.turns : "");
      spawnPopup(el, txt, "buff", meta.color);
      sfxPlay(ELEMENT_SOUNDS.defend || "radiant_halo_shield");
    } else if (ev.type === "flee") {
      const fleeEl = root.querySelector('.fighter[data-fighter="' + ev.actor + '"]') || root;
      spawnPopup(fleeEl, "Fled!", "heal", "#ffd23e");
      sfxPlay("block");
    }
  }
  const last = fx[fx.length - 1];
  if (last && last.type === "result") {
    if (last.outcome === "victory") sfxPlay(["winningsound"]);
    else sfxPlay(["losingsound"]);
  }
}

function showNotice(kind, title, subtitle) {
  const el = $("notice");
  if (!el) return;
  el.innerHTML = `<div class="notice-card notice-card--${escapeHtml(kind)}">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(subtitle)}</p>
    <button type="button" class="btn btn--gold" id="btn-notice-ok">Continue</button>
  </div>`;
  el.classList.remove("hidden");
  const ok = el.querySelector("#btn-notice-ok");
  if (ok) ok.addEventListener("click", () => el.classList.add("hidden"));
  if (kind === "win") playSfx("win");
  else if (kind === "lose") playSfx("lose");
  else if (kind === "search") playSfx("coin");
}

function showAscendCinematic(ascend, fallbackText) {
  const el = $("notice");
  if (!el) return;
  const a = ascend || {};
  const color = typeof a.color === "string" && /^#[0-9a-fA-F]{6}$/.test(a.color) ? a.color : "#e8c547";
  const title = a.title || fallbackText || "You have ascended!";
  const label = a.label || "";
  // 1) Önce 2 sn fullscreen ışık patlaması (class renginde), sonra kart.
  const token = (el._ascendToken = (el._ascendToken || 0) + 1);
  el.innerHTML = `<div class="ascend-overlay ascend-burst" style="--ascend:${color}"><div class="ascend-flash"></div></div>`;
  el.classList.remove("hidden");
  if (a.sound) sfxPlay(a.sound);
  else sfxPlay("neutralascension");
  setTimeout(() => {
    if (el._ascendToken !== token || !el.querySelector(".ascend-burst")) return;
    el.innerHTML = `<div class="ascend-overlay" style="--ascend:${color}">
      <div class="ascend-rays"></div>
      <div class="ascend-card">
        <div class="ascend-kicker">✦ ASCENSION ✦</div>
        <h2>${escapeHtml(title)}</h2>
        ${label ? `<p class="ascend-class">${escapeHtml(label)}</p>` : ""}
        <button type="button" class="btn btn--gold" id="btn-notice-ok">Continue</button>
      </div>
    </div>`;
    const ok = el.querySelector("#btn-notice-ok");
    if (ok) ok.addEventListener("click", () => el.classList.add("hidden"));
  }, 2000);
}

function showStoryIntro() {
  const el = $("story-overlay");
  if (!el) return;
  const story = CATALOG.story || {};
  const title = story.title || "The Setra Game";
  const paragraphs = Array.isArray(story.paragraphs) ? story.paragraphs : [];
  const cta = story.cta || "Set Forth";
  el.innerHTML = `<div class="notice-card story-card">
    <h2>${escapeHtml(title)}</h2>
    ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
    <button type="button" class="btn btn--gold" id="btn-story-go">${escapeHtml(cta)}</button>
  </div>`;
  el.classList.remove("hidden");
  const ok = el.querySelector("#btn-story-go");
  if (ok) ok.addEventListener("click", () => el.classList.add("hidden"));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function classLabel(slug) {
  const c = CATALOG.classes.find((x) => x.slug === slug);
  return c ? c.label : slug;
}

function sizeLabel(id) {
  const s = CATALOG.sizes.find((x) => x.id === id);
  return s ? s.label : id;
}

function imgFor(slug, kind) {
  const src =
    kind === "class"
      ? CATALOG.classes
      : kind === "monster"
      ? CATALOG.monsters
      : CATALOG.dungeons;
  const found = src.find((x) => x.slug === slug || x.id === slug);
  return found ? found.image : "";
}

function initImages(root) {
  root.querySelectorAll("[data-img]").forEach((el) => {
    const path = el.getAttribute("data-img");
    if (!path) {
      el.classList.add("portrait--missing");
      return;
    }
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url('${path}')`;
      el.classList.add("portrait--img");
      el.classList.remove("portrait--missing");
    };
    img.onerror = () => {
      el.style.backgroundImage = "";
      el.classList.remove("portrait--img");
      el.classList.add("portrait--missing");
    };
    img.src = path;
  });
}

// Sessiz arka plan ön-yükleme: katalogdaki tüm oyun görsellerini menüde
// beklerken indirir, oyunda ilk görünümde takılma kalmaz. Oyuncu hiçbir şey
// görmez; hatalar sessiz geçilir, oyun asla engellenmez.
const _preloadedUrls = new Set();
function collectGameImageUrls() {
  const out = [];
  const push = (u) => {
    if (typeof u === "string" && u && !u.startsWith("data:") && !_preloadedUrls.has(u)) {
      _preloadedUrls.add(u);
      out.push(u);
    }
  };
  const C = (typeof CATALOG !== "undefined" && CATALOG) || {};
  for (const c of C.classes || []) {
    push(c.image);
    if (c.basicAttack) push(c.basicAttack.image);
  }
  for (const s of C.skills || []) push(s.image);
  for (const i of C.items || []) push(i.image);
  for (const m of C.monsters || []) push(m.image);
  for (const p of C.pets || []) {
    push(p.image);
    push(p.imageYoung);
    push(p.imageAdult);
  }
  for (const d of C.dungeons || []) {
    push(d.image);
    push(d.battleImage);
  }
  for (const b of C.bosses || []) push(b.image);
  for (const e of C.eggs || []) push(e.image);
  const imgs = C.images || {};
  for (const v of Object.values(imgs.backgrounds || {})) push(v);
  for (const v of Object.values(imgs.combat || {})) push(v);
  for (const v of Object.values(imgs.ui || {})) {
    if (typeof v === "string") push(v);
    else if (v && typeof v === "object") for (const vv of Object.values(v)) push(vv);
  }
  return out;
}

function preloadGameAssets() {
  try {
    const urls = collectGameImageUrls();
    if (!urls.length) return;
    // Aynı anda en fazla 6 istek — bağlantıyı tıkamaz.
    let idx = 0;
    const workers = Math.min(6, urls.length);
    const pump = () => {
      if (idx >= urls.length) return;
      const url = urls[idx++];
      const img = new Image();
      img.onload = img.onerror = () => pump();
      img.src = url;
    };
    for (let w = 0; w < workers; w++) pump();
  } catch (e) { /* sessiz: ön-yükleme asla oyunu kırmaz */ }
}

function skillIconEl(skill) {
  return `<span class="skill-icon" data-img="${escapeHtml(skill.image || "")}" data-variant="${escapeHtml(skill.id || "")}"></span>`;
}

function itemIconEl(item) {
  if (item.slot === "chest") {
    const meta = (CATALOG.loot && CATALOG.loot.rarityMeta) || {};
    const m = meta[item.rarity] || {};
    return `<span class="item-icon item-icon--chest" style="--rarity:${m.color || "#9aa7b5"}">${icon("chest")}</span>`;
  }
  return `<span class="item-icon" data-img="${escapeHtml(item.image || "")}" data-variant="${escapeHtml(item.id || "")}"></span>`;
}

// Combat zone backgrounds (data-driven, all optional):
// enemy area <- dungeon battleImage, else images.combat.enemy; party area <- images.combat.party.
// Missing/blank = plain default look, never an error.
function zoneBg(el, url) {
  if (!el) return;
  if (!url) {
    el.style.backgroundImage = "";
    el.classList.remove("has-zone-bg");
    return;
  }
  const img = new Image();
  img.onload = () => {
    el.style.backgroundImage = `url('${url}')`;
    el.classList.add("has-zone-bg");
  };
  img.onerror = () => {
    el.style.backgroundImage = "";
    el.classList.remove("has-zone-bg");
  };
  img.src = url;
}
function applyCombatZones(root, rank) {
  if (!root) return;
  const imgs = (CATALOG && CATALOG.images) || {};
  const dg = (CATALOG.dungeons || []).find((x) => x && x.rank === rank) || {};
  const enemyUrl = dg.battleImage || (imgs.combat && imgs.combat.enemy) || "";
  const partyUrl = (imgs.combat && imgs.combat.party) || "";
  zoneBg(root.querySelector(".enemy-wave"), enemyUrl);
  zoneBg(root.querySelector(".party-row"), partyUrl);
}

let combatTimerInterval = null;
// Sunucuyla aynı süre (content.js combat.turnTimeoutMs) — katalog yoksa 15sn.
function turnTimeoutMs() {
  return (typeof CATALOG !== "undefined" && CATALOG && CATALOG.combat && CATALOG.combat.turnTimeoutMs) || 15000;
}
function startCombatTimer() {
  if (combatTimerInterval) return;
  combatTimerInterval = setInterval(() => {
    const bar = $("turn-timer-fill");
    const d = myDungeon(state.room);
    if (!d || d.status !== "fighting") {
      stopCombatTimer();
      return;
    }
    if (!state.timerDeadline) {
      if (bar) bar.style.width = "0%";
      return;
    }
    const total = turnTimeoutMs();
    const remaining = state.timerDeadline - Date.now();
    const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
    if (bar) bar.style.width = pct + "%";
    if (remaining <= 0 && !state.timerFired) {
      state.timerFired = true;
      state.timerDeadline = null;
      socket.emit("combat:endTurn");
    }
  }, 100);
}
function stopCombatTimer() {
  if (combatTimerInterval) {
    clearInterval(combatTimerInterval);
    combatTimerInterval = null;
  }
}

// ---- Class-select texts (editable in the editor via content.ui.classSelect) ----
function classSelectTexts() {
  const u = (typeof CATALOG !== "undefined" && CATALOG && CATALOG.ui && CATALOG.ui.classSelect) || {};
  return {
    title: u.title || "Create Character",
    subtitle: u.subtitle || "Choose a class",
    hint: u.hint || "Attributes are forged when the quest begins.",
    starterKitHead: u.starterKitHead || "Starter kit",
    defaultLore: u.defaultLore || "A wandering soul answering the call of Setra. Their legend is yet unwritten.",
  };
}

function applySetupTexts() {
  const t = classSelectTexts();
  const title = $("setup-title");
  if (title) title.textContent = t.title;
  const sub = $("setup-sub");
  if (sub) sub.textContent = t.subtitle;
  const hint = $("setup-hint");
  if (hint) hint.textContent = t.hint;
}

// Server sends starting-skill ids as `skills`; local content uses
// `startingSkills`. Accept both so the kit never renders empty.
function classSkillIds(cls) {
  if (cls && Array.isArray(cls.startingSkills)) return cls.startingSkills;
  if (cls && Array.isArray(cls.skills)) return cls.skills;
  return [];
}

function skillListFor(cls) {
  return classSkillIds(cls)
    .map((id) => ((CATALOG && CATALOG.skills) || []).find((s) => s && s.id === id))
    .filter(Boolean);
}

function renderClassGrid(selected, onSelect) {
  applySetupTexts();
  const grid = $("class-grid");
  grid.innerHTML = "";
  // Secret (password-locked) classes stay hidden until a password is saved.
  // The password itself is NEVER checked here — the server decides.
  // The password is managed in the settings menu, not on this screen.
  let storedSecret = "";
  try { storedSecret = localStorage.getItem("setra_class_secret") || ""; } catch (e) {}
  // Leftover from older builds: remove the inline password row if present.
  const legacyRow = $("class-secret-row");
  if (legacyRow && legacyRow.parentNode) legacyRow.parentNode.removeChild(legacyRow);
  CATALOG.classes.filter((c) => !c.baseClass && (!c.secret || storedSecret)).forEach((cls) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "class-card" + (selected === cls.slug ? " is-selected" : "");
    // Full-bleed card art: the character image IS the card background.
    btn.setAttribute("data-img", cls.image || "");
    btn.setAttribute("data-variant", cls.slug);
    btn.setAttribute("aria-label", cls.label);
    const hp = classAvg(cls.hp), atk = classAvg(cls.attack), spd = cls.speed || 0;
    const firstSkills = skillListFor(cls).slice(0, 2);
    btn.innerHTML =
      `<span class="class-card-shade" aria-hidden="true"></span>` +
      `<span class="class-card-body">` +
        `<span class="class-card-name">${escapeHtml((cls.secret ? "🔒 " : "") + cls.label)}</span>` +
        `<span class="class-card-stats">❤️ ${hp} · ⚔️ ${atk} · 👟 ${spd}</span>` +
        (firstSkills.length
          ? `<span class="class-card-skills">${firstSkills.map((s) => `<em>${escapeHtml(s.name)}</em>`).join("")}</span>`
          : "") +
      `</span>`;
    btn.addEventListener("click", () => onSelect(cls.slug));
    grid.appendChild(btn);
  });
  initImages(grid);
  renderClassPreview(selected);
}

// ---- Class-select detail panel (big portrait + stats + lore + kit) ----
// Only #class-grid scrolls; the page itself never scrolls on this screen.
function classAvg(range) {
  if (!range) return 0;
  return Math.round(((Number(range.min) || 0) + (Number(range.max) || 0)) / 2);
}
function baseShort(s) {
  const b = s.baseDamage;
  if (b != null && typeof b === "object") {
    const st = b.stat === "targetMaxHp" ? "tgtHP" : b.stat === "targetHp" ? "curHP" : b.stat || "?";
    return (Number(b.mult) || 0) + "×" + st + (b.true ? "✦+" : "+");
  }
  return Number(b) > 0 ? b + "+" : "";
}
function skillShort(s) {
  if (!s) return "";
  let f = "";
  if (s.target === "enemy" && (Number(s.power) > 0 || Number(s.baseDamage) > 0 || (s.baseDamage != null && typeof s.baseDamage === "object"))) {
    f = baseShort(s) + (Number(s.power) > 0 ? s.power + "×" : "") + (s.trueDamage ? " ✦" : "");
  } else if (s.target === "self" && s.defense) {
    f = "🛡 " + Math.round(s.defense * 100) + "%";
  } else if (s.heal != null && typeof s.heal !== "object") {
    f = "💚 " + Math.round(s.heal * 100) + "%";
  } else if (s.healSelfPct) {
    f = "💚 " + Math.round(s.healSelfPct * 100) + "%";
  } else if (s.manaRestorePct) {
    f = "💧 " + Math.round(s.manaRestorePct * 100) + "%";
  } else if (s.buffs && s.buffs.length) {
    f = "✨ buff";
  } else {
    f = s.target || "";
  }
  const tags = [];
  if (s.hitsAll) tags.push("AoE");
  else if (s.splash && Number(s.splash.extraTargets) > 0) tags.push("+" + Math.floor(s.splash.extraTargets));
  if (s.execute) {
    if (s.execute.belowHpPct != null) tags.push("EXE<" + Math.round(Number(s.execute.belowHpPct) * 100) + "%");
    else if (s.execute.finishBelowHpPct != null) tags.push("EXE" + Math.round(Number(s.execute.finishBelowHpPct) * 100) + "%");
    else tags.push("EXE");
  }
  if (s.bonusVsHighHp && s.bonusVsHighHp.aboveHpPct != null) tags.push("HIGH+");
  if (s.echo && Number(s.echo.chance) > 0) tags.push("ECHO");
  if (tags.length) f += (f ? " " : "") + "[" + tags.join(" ") + "]";
  return f;
}
function skillMechanicsLine(s) {
  if (!s) return "";
  const parts = [];
  if (s.baseDamage != null && typeof s.baseDamage === "object") {
    const st = s.baseDamage.stat === "targetMaxHp" ? "target max HP" : s.baseDamage.stat === "targetHp" ? "target current HP" : s.baseDamage.stat;
    parts.push(Math.round(Number(s.baseDamage.mult || 0) * 100) + "% of " + st + " as base");
  }
  if (s.hitsAll) parts.push("Hits ALL enemies");
  else if (s.splash && Number(s.splash.extraTargets) > 0) parts.push("Also hits " + Math.floor(s.splash.extraTargets) + " random enem" + (Math.floor(s.splash.extraTargets) === 1 ? "y" : "ies"));
  if (s.execute) {
    if (s.execute.belowHpPct != null) parts.push("Usable below " + Math.round(Number(s.execute.belowHpPct) * 100) + "% HP — executes");
    else if (s.execute.finishBelowHpPct != null) parts.push("Kills targets dropped to " + Math.round(Number(s.execute.finishBelowHpPct) * 100) + "% HP or less");
    else parts.push("Executes the target");
  }
  if (s.bonusVsHighHp && s.bonusVsHighHp.aboveHpPct != null) parts.push("+" + Math.round(Number(s.bonusVsHighHp.mult || 0) * 100) + "% vs targets above " + Math.round(Number(s.bonusVsHighHp.aboveHpPct) * 100) + "% HP");
  if (s.bonusVsTags && Array.isArray(s.bonusVsTags.tags) && s.bonusVsTags.tags.length) parts.push("+" + Math.round(Number(s.bonusVsTags.mult || 0) * 100) + "% vs " + s.bonusVsTags.tags.join("/"));
  if (s.echo && Number(s.echo.chance) > 0) parts.push(Math.round(Number(s.echo.chance) * 100) + "% chance to strike again at " + Math.round(Number(s.echo.mult || 0.3) * 100) + "% power");
  return parts.join(" · ");
}
// Kart zemini: resim + perde, ikisi de elementin KENDİSİNDE.
// (İçteki absolute span kayan içerikte alta ulaşamıyordu — dipte boşluk
// bırakıyordu. Element background'ı scroll dahil her yeri kaplar.)
function setCardBg(el, url) {
  if (!el) return;
  const safe = String(url || "").replace(/["']/g, "");
  if (el._bgUrl === safe) return;
  el._bgUrl = safe;
  el.classList.remove("has-card-bg");
  el.style.removeProperty("--cp-img");
  if (!safe) return;
  const im = new Image();
  im.onload = () => {
    if (el._bgUrl !== safe) return;
    el.style.setProperty("--cp-img", `url("${safe}")`);
    el.classList.add("has-card-bg");
  };
  im.onerror = () => {
    if (el._bgUrl !== safe) return;
    el._bgUrl = "";
  };
  im.src = safe;
}

function renderClassPreview(selected) {
  const panel = $("class-preview");
  if (!panel) return;
  const list = CATALOG.classes.filter((c) => !c.baseClass);
  const cls = list.find((c) => c.slug === selected) || list[0];
  if (!cls) {
    panel.innerHTML = "";
    return;
  }
  const hp = classAvg(cls.hp), atk = classAvg(cls.attack), mag = classAvg(cls.magicPower);
  const res = classAvg(cls.resistance), spd = cls.speed || 0;
  const bar = (v, max) => `<span class="cp-bar"><span class="cp-fill" style="width:${Math.max(4, Math.min(100, Math.round((v / max) * 100)))}%"></span></span>`;
  const basic = cls.basicAttack || {};
  const kit = skillListFor(cls);
  const texts = classSelectTexts();
  const tagline = cls.tagline || classLabel(cls.slug);
  const lore = cls.lore || texts.defaultLore;
  panel.innerHTML = `
    <div class="cp-title">
      <strong>${escapeHtml(cls.label)}</strong>
      <em>${escapeHtml(tagline)}</em>
    </div>
    <p class="cp-lore">${escapeHtml(lore)}</p>
    ${(cls.passives && cls.passives.length) ? `<div class="cp-passives">${cls.passives.map((p) => `<div class="cp-passive" title="${escapeHtml(p.desc || p.name)}"><strong>${escapeHtml(p.name || p.kind)}</strong>${p.desc ? `<span>${escapeHtml(p.desc)}</span>` : ""}</div>`).join("")}</div>` : ""}
    <div class="cp-stats">
      <div class="cp-stat"><span>❤️ HP ${hp}</span>${bar(hp, 750)}</div>
      <div class="cp-stat"><span>⚔️ ATK ${atk}</span>${bar(atk, 64)}</div>
      <div class="cp-stat"><span>🔮 MAG ${mag}</span>${bar(mag, 62)}</div>
      <div class="cp-stat"><span>🛡️ RES ${res}</span>${bar(res, 55)}</div>
      <div class="cp-stat"><span>👟 SPD ${spd}</span>${bar(spd, 15)}</div>
    </div>
    <div class="cp-kit">
      <p class="cp-kit-head">${escapeHtml(texts.starterKitHead)}</p>
      <div class="cp-skill"><span>${escapeHtml(basic.name || "Strike")}</span><em>${escapeHtml(skillShort({ ...basic, target: "enemy" }))}</em></div>
      ${kit.map((s) => `<div class="cp-skill"><span>${escapeHtml(s.name)}</span><em>${escapeHtml(skillShort(s))}</em></div>`).join("")}
    </div>`;
  setCardBg(panel, cls.image || "");
  initImages(panel);
}

function setLobbyView(inRoom) {
  $("lobby-browser").classList.toggle("hidden", inRoom);
  $("lobby-room").classList.toggle("hidden", !inRoom);
}

function renderRoomList(list, onJoin) {
  const root = $("room-list");
  root.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No open halls. Found one, and others may join.";
    root.appendChild(empty);
    return;
  }
  list.forEach((room) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "room-row";
    btn.innerHTML = `<strong>${escapeHtml(room.name)}</strong><span class="player-meta">${room.playerCount}/${room.maxPlayers} · ${escapeHtml(room.status)}</span>`;
    btn.addEventListener("click", () => onJoin(room.id));
    root.appendChild(btn);
  });
}

function renderPlayerList(room, selfId) {
  const ul = $("player-list");
  ul.innerHTML = "";
  room.players.forEach((p) => {
    const li = document.createElement("li");
    const left = document.createElement("div");
    left.innerHTML = `<span class="player-name${p.connected === false ? " player--offline" : ""}">${escapeHtml(p.name)}</span>${
      p.id === selfId ? ' <span class="badge">You</span>' : ""
    }${p.isHost ? ' <span class="badge badge--host">Host</span>' : ""}${
      p.ready ? ' <span class="badge badge--ready">Ready</span>' : ""
    }${p.connected === false ? ' <span class="badge badge--offline">Away</span>' : ""}`;
    const right = document.createElement("div");
    right.className = "player-meta";
    right.textContent = `${classLabel(p.character)} · ${p.lives} lives · ${p.gold} gold · ${p.wood} wood`;
    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
}

// ---- Town ----

function icon(name) {
  const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
    dungeon: '<path d="M3 21V10l4-3V5h3v2l3-1V4h4v2l4 4v11H3z"/><path d="M9 21v-6h6v6"/>',
    smith: '<rect x="3" y="12" width="11" height="5" rx="1.5"/><path d="M14 14.5h7"/>',
    tavern: '<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2"/><path d="M7 4v2"/><path d="M11 4v2"/>',
    rest: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    hp: '<path d="M12 20.5S4 16 4 10.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 8 2.5C20 16 12 20.5 12 20.5z"/>',
    stamina: '<path d="M13 2 5 13h5l-1 9 8-11h-5l1-9z"/>',
    gold: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 5v3"/><path d="M12 16v3"/>',
    wood: '<rect x="4" y="11" width="16" height="4" rx="2"/><rect x="7" y="15" width="12" height="3" rx="1.5"/>',
    lives: '<path d="M12 20.5S4 16 4 10.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 8 2.5C20 16 12 20.5 12 20.5z"/>',
    level: '<path d="M12 2l2.6 6.2L21 9.2l-5 4.4L17.4 20 12 16.4 6.6 20 8 13.6 3 9.2l6.4-1L12 2z"/>',
    xp: '<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z"/>',
    atk: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
    mana: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    res: '<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/>',
    magic: '<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z"/>',
    heal: '<path d="M12 5v14M5 12h14"/><path d="M12 5v14" opacity="0.35"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    food: '<path d="M3 12h18a9 9 0 0 1-9 9h-2a7 7 0 0 1-7-7z"/><path d="M12 12c0-3 2-5 4-5 0 2-2 5-4 5z"/>',
    temple: '<path d="M4 21v-8l-2-3 10-6 10 6-2 3v8H4z"/><path d="M8 21v-6h8v6"/><path d="M3 10l9-5 9 5"/>',
    craft: '<path d="M14 4l6 6-3 3-6-6 3-3z"/><path d="M11 7 4 14l3 3 7-7"/>',
    weapon: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
    helmet: '<path d="M12 3a7 7 0 0 1 7 7c0 2-1 3-1 3H6s-1-1-1-3a7 7 0 0 1 7-7z"/><path d="M6 13h12v3a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3z"/>',
    armor: '<path d="M12 3l6 2v6c0 4-2.5 7-6 8-3.5-1-6-4-6-8V5l6-2z"/>',
    legs: '<path d="M6 21v-7l2-9h8l2 9v7h-4v-5h-4v5H6z"/>',
    boots: '<path d="M5 21v-6c0-3 2-5 6-5s6 2 6 5v6H5z"/><path d="M9 21v-4"/>',
    amulet: '<circle cx="12" cy="7" r="4"/><path d="M12 11v10"/><path d="M9 18h6"/>',
    ring: '<rect x="7" y="7" width="10" height="10" rx="2" transform="rotate(45 12 12)"/>',
    crit: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/>',
    chest: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 9l9-6 9 6"/><path d="M12 3v6"/><path d="M12 9v6"/><path d="M9 13h6"/>',
    merchant: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 8l2-4h14l2 4"/><path d="M8 8a4 4 0 0 0 8 0"/><path d="M9 15h6"/>',
  };
  return `<svg viewBox="0 0 24 24" ${common} aria-hidden="true">${paths[name] || ""}</svg>`;
}

function statLabel(key) {
  const map = {
    attack: "Atk",
    maxHp: "HP",
    resistance: "Res",
    mana: "Mana",
    maxMana: "Mana",
    magicPower: "Mgc",
    healPower: "Heal",
    omnivamp: "Omni",
    speed: "Spd",
    manaRegen: "Regen",
    critChance: "Crit",
    critDamage: "Crit Dmg",
  };
  return map[key] || key;
}

function slotLabel(slot) {
  const map = {
    weapon: "Weapon", head: "Head", armor: "Armor", legs: "Legs", boots: "Boots",
    amulet: "Amulet", ring: "Ring", ring1: "Ring", ring2: "Ring",
    book: "Book", stone: "Stone", consumable: "Use", material: "Material",
    chest: "Chest", egg: "Egg",
  };
  return map[slot] || slot;
}

function pct(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function statRow(iconName, label, value, barClass, barPct) {
  const bar = barClass
    ? `<span class="stat-bar ${barClass}"><span class="stat-bar-fill" style="width:${barPct}%"></span></span>`
    : "";
  return `<div class="profile-stat">
    <span class="stat-icon">${icon(iconName)}</span>
    <span class="stat-label">${escapeHtml(label)}</span>
    <span class="stat-value">${escapeHtml(String(value))}</span>
    ${bar}
  </div>`;
}

function chip(iconSvg, text) {
  return `<span class="chip">${iconSvg}<span>${escapeHtml(text)}</span></span>`;
}

function renderProfileCard(room, selfId) {
  const el = $("profile-card");
  const me = room.players.find((p) => p.id === selfId);
  if (!me) {
    el.innerHTML = "";
    setCardBg(el, "");
    return;
  }
  const trait = me.anomaly;
  const traitHtml = trait
    ? `<span style="color:${trait.frameColor};font-weight:700">${escapeHtml(trait.name)}</span> — ${escapeHtml(trait.description)}`
    : `<span class="muted">No anomaly</span>`;
  const maxLives = (CATALOG.starting && CATALOG.starting.lives) || 3;
  const isDead = me.lives <= 0;
  el.innerHTML = `
    <div class="profile-avatar">
      <span class="portrait profile-portrait" data-img="${imgFor(me.character, "class")}" data-variant="${me.character}"></span>
    </div>
    <div class="profile-name">${escapeHtml(me.name)}${me.isHost ? ' <span class="badge badge--host">Host</span>' : ""}${isDead ? ' <span class="badge badge--offline">Fallen</span>' : ""}</div>
    <div class="profile-class">${classLabel(me.character)} · Lv ${me.level}</div>
    <div class="profile-lives ${isDead ? "profile-lives--dead" : ""}" title="Lives — when 0 you must be revived">
      <span class="lives-icon">${icon("lives")}</span>
      <span class="lives-count">${me.lives}/${maxLives}</span>
      <span class="lives-label">Lives</span>
    </div>
    <div class="profile-trait">${traitHtml}</div>
    <div class="profile-stats">
      ${statRow("hp", "HP", `${me.hp}/${me.maxHp}`, "bar-hp", pct(me.hp, me.maxHp))}
      ${statRow("stamina", "Stamina", `${me.stamina}/${me.maxStamina}`, "bar-stamina", pct(me.stamina, me.maxStamina))}
      ${statRow("xp", "XP", `${me.xp}/${me.xpToNext}`, "bar-xp", me.xpToNext ? pct(me.xp, me.xpToNext) : 100)}
    </div>
    <div class="profile-resources">
      ${chip(icon("gold"), `Gold ${me.gold}`)}
      ${chip(icon("wood"), `Wood ${me.wood}`)}
      ${chip(icon("food"), `Food ${me.food}`)}
    </div>
    <div class="profile-chips">
      ${chip(icon("level"), `Lv ${me.level}`)}
      ${chip(icon("atk"), `Atk ${me.attack}`)}
      ${chip(icon("mana"), `${me.maxMana} Mana`)}
      ${chip(icon("mana"), `Regen ${me.manaRegen}`)}
      ${chip(icon("res"), `Res ${me.resistance}`)}
      ${chip(icon("magic"), `Mgc ${me.magicPower}`)}
      ${chip(icon("heal"), `Heal ${me.healPower}`)}
      ${chip(icon("crit"), `Crit ${me.critChance}%`)}
      ${chip(icon("crit"), `Crit Dmg +${me.critDamage}%`)}
    </div>
    <div style="display:flex;gap:0.4rem;width:100%;margin-top:0.4rem">
      <button type="button" class="btn btn--bronze btn--mini" style="flex:1" id="btn-open-inventory">Equipments</button>
      <button type="button" class="btn btn--ghost btn--mini" style="flex:1" id="btn-open-pets">Pets</button>
    </div>`;
  const invBtn = el.querySelector("#btn-open-inventory");
  if (invBtn) {
    invBtn.addEventListener("click", () => {
      sfxPlay("inventorysound");
      state.inventoryOpen = true;
      state.petsTab = false;
      renderTown(state.room);
    });
  }
  const petsBtn = el.querySelector("#btn-open-pets");
  if (petsBtn) {
    petsBtn.addEventListener("click", () => {
      sfxPlay("inventorysound");
      state.petsOpen = true;
      state.inventoryOpen = false;
      renderTown(state.room);
    });
  }
  setCardBg(el, imgFor(me.character, "class"));
  initImages(el);
}

function renderRightPlayers(room) {
  const el = $("right-players");
  if (!el) return;
  if (!room || room.mode !== "multi" || room.status !== "playing") { el.classList.add("hidden"); return; }
  // show in town only, not in dungeon/combat overlays
  const inOverlay = state.dungeonOpen || state.tavernOpen || state.blacksmithOpen || state.merchantOpen || state.templeOpen || state.inventoryOpen || state.pvpOpen;
  if (inOverlay) { el.classList.add("hidden"); return; }
  const others = room.players.filter((p) => p.id !== state.playerId);
  if (!others.length) { el.classList.add("hidden"); return; }
  el.classList.remove("hidden");
  el.innerHTML = `<p class="subhead" style="margin:0 0 0.4rem">Others — click to challenge to PvP</p>` + others.map((p) => {
    const dead = p.lives <= 0;
    const frame = p.anomaly ? ` style="--frame:${p.anomaly.frameColor}"` : "";
    const inPvp = (room.pvpDuels||[]).some(d=> d.memberIds.includes(p.id));
    return `<div class="right-player ${dead ? "right-player--dead" : ""}" data-player="${p.id}">
      <span class="portrait portrait--${p.character} right-player-portrait" data-img="${imgFor(p.character, "class")}" data-variant="${p.character}"${frame}></span>
      <span class="right-player-info">
        <span class="right-player-name">${escapeHtml(p.name)}${dead ? " 💀" : ""}${inPvp?' ⚔️':''}</span>
        <span class="right-player-hp">${p.hp}/${p.maxHp} HP · ${p.mana}/${p.maxMana} Mana</span>
        <span class="right-player-lives">♥ ${p.lives} · Lv ${p.level}</span>
      </span>
      <button type="button" class="btn btn--mini" data-pvp-challenge="${p.id}" ${dead||inPvp?'disabled':''}>Duel</button>
    </div>`;
  }).join("");
  initImages(el);
  el.querySelectorAll("[data-pvp-challenge]").forEach((b)=>{
    b.addEventListener("click",(e)=>{
      e.stopPropagation();
      const pid=b.getAttribute("data-pvp-challenge");
      sfxPlay("clicksound");
      socket.emit("pvp:challenge",{targetId:pid});
    });
  });
  el.querySelectorAll("[data-player]").forEach((b) => {
    b.addEventListener("click", () => {
      const pid = b.getAttribute("data-player");
      const p = room.players.find((x) => x.id === pid);
      if (!p) return;
      sfxPlay("clicksound");
      const deadNote = p.lives <= 0 ? " [FALLEN - needs Essence of Life]" : "";
      showNotice("party", p.name + deadNote, `${classLabel(p.character)} · Lv ${p.level} · ${p.hp}/${p.maxHp} HP · ${p.mana}/${p.maxMana} Mana · Atk ${p.attack} Res ${p.resistance} Mgc ${p.magicPower} Heal ${p.healPower} Spd ${p.speed} Crit ${p.critChance}% · Lives ${p.lives}`);
    });
  });
}

const ACTIONS = [
  { id: "dungeon", icon: "dungeon", title: "Dungeon", sub: "Ranked delve · High risk", kind: "open" },
  { id: "search", icon: "search", title: "Search", sub: null, kind: "emit", event: "town:search" },
  { id: "blacksmith", icon: "smith", title: "Blacksmith", sub: "Armor, weapons & gear", kind: "open" },
  { id: "merchant", icon: "merchant", title: "Merchant", sub: "Chests, potions & materials", kind: "open" },
  { id: "tavern", icon: "tavern", title: "Tavern", sub: "Bet gold · Coin flip, blackjack & food", kind: "open" },
  { id: "temple", icon: "temple", title: "Ancient Temple", sub: "Ascend, mend hearts & craft", kind: "open" },
  { id: "rest", icon: "rest", title: "Rest", sub: null, kind: "emit", event: "town:rest" },
  { id: "sleep", icon: "rest", title: "Sleep", sub: "End the day · Stamina returns at dawn", kind: "emit", event: "town:endDay" },
];

function renderActionCards(room, selfId) {
  const el = $("action-cards");
  const me = room.players.find((p) => p.id === selfId);
  const isDead = me && me.lives <= 0;
  const canAct = me && !me.endedDay && !isDead;
  const searchCost = (CATALOG.town && CATALOG.town.search && CATALOG.town.search.stamina) || 2;
  const restAmt = (CATALOG.town && CATALOG.town.rest && CATALOG.town.rest.stamina) || 6;
  ACTIONS.forEach((a) => {
    if (a.id === "search") a.sub = `${searchCost} stamina · Explore the wilds`;
    if (a.id === "rest") a.sub = `+${restAmt} stamina · Wait for your party`;
  });
  el.innerHTML = ACTIONS.map((a) => {
    // Editördeki kasaba buton görselleri (images.ui.*) varsa ikon kutusunda
    // gösterilir; yoksa SVG ikon (eski görünüm, oyun kırılmaz).
    const uiKey = { blacksmith: "blacksmithButton", tavern: "tavernButton", merchant: "merchantButton", temple: "templeButton", dungeon: "dungeonButton" }[a.id] || "";
    const uiImg = uiKey && CATALOG.images && CATALOG.images.ui ? CATALOG.images.ui[uiKey] : "";
    const iconHtml = uiImg
      ? `<span class="action-icon action-icon--img" data-img="${escapeHtml(uiImg)}" data-variant="${escapeHtml(a.id)}"></span>`
      : `<span class="action-icon">${icon(a.icon)}</span>`;
    return `
    <button type="button" class="action-card${a.id === "dungeon" ? " action-card--hero" : ""}${canAct ? "" : " action-card--locked"}" data-action="${a.id}">
      ${iconHtml}
      <span class="action-body">
        <span class="action-title-text">${escapeHtml(a.title)}</span>
        <span class="action-sub">${escapeHtml(a.sub)}</span>
      </span>
      <span class="action-arrow">${icon("chevron")}</span>
    </button>`; }).join("");
  initImages(el);
  el.querySelectorAll("[data-action]").forEach((b) => {
    b.addEventListener("click", () => {
      if (isDead) {
        showToast("You have fallen. Seek The Essence of Life at the Ancient Temple.");
        return;
      }
      if (!canAct) {
        showToast("You have already ended this day.");
        return;
      }
      const a = ACTIONS.find((x) => x.id === b.getAttribute("data-action"));
      if (a.kind === "open") {
        state.skillTreeOpen = false;
        state.dungeonOpen = a.id === "dungeon";
        state.tavernOpen = a.id === "tavern";
        state.blacksmithOpen = a.id === "blacksmith";
        state.merchantOpen = a.id === "merchant";
        state.templeOpen = a.id === "temple";
        state.inventoryOpen = false;
        renderTown(state.room);
      } else {
        if (a.id === "sleep") state.justSlept = true;
        socket.emit(a.event);
      }
    });
  });
}

function renderTownParty(room) {
  const el = $("town-party");
  if (!room.players || room.players.length <= 1) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML =
    `<div class="party-strip">` +
    room.players
      .map((p) => {
        const frame = p.anomaly ? ` style="--frame:${p.anomaly.frameColor}"` : "";
        return `<span class="party-chip${p.id === state.playerId ? " party-chip--me" : ""}${p.endedDay ? " party-chip--done" : ""}" title="${escapeHtml(p.name)}">
          <span class="portrait portrait--${p.character} party-portrait" data-img="${imgFor(p.character, "class")}" data-variant="${p.character}"${frame}></span>
          <span class="party-chip-name">${escapeHtml(p.name)}${p.endedDay ? " ✓" : ""}</span>
        </span>`;
      })
      .join("") +
    `</div>`;
  initImages(el);
}

function renderTownLog(room) {
  const el = $("town-log");
  el.innerHTML = room.log && room.log.text
    ? `<div class="log-line">${escapeHtml(room.log.text)}</div>`
    : `<div class="log-line muted">The town is quiet. Spend stamina, then end the day.</div>`;
}

// ---- Skill Tree ----

const ST_STATUS = { wet: "Wet", frozen: "Frozen", dot: "Poisoned", expose: "Exposed", weaken: "Weakened" };

function classLineageFor(slug) {
  const list = CATALOG.classes || [];
  const chain = [slug];
  let c = list.find((x) => x.slug === slug);
  const seen = new Set();
  while (c && c.evolution && !seen.has(c.slug)) {
    seen.add(c.slug);
    chain.push(c.evolution.to);
    c = list.find((x) => x.slug === c.evolution.to);
  }
  c = list.find((x) => x.slug === slug);
  while (c && c.baseClass) {
    c = list.find((x) => x.slug === c.baseClass);
    if (!c || chain.includes(c.slug)) break;
    chain.unshift(c.slug);
  }
  return chain;
}

function skillById(id) {
  return (CATALOG.skills || []).find((s) => s.id === id) || null;
}

function skillTreeInfo(player) {
  const st = CATALOG.skillTree || { global: [], lineages: {} };
  const lineage = classLineageFor(player.character);
  return {
    st,
    global: st.global || [],
    lineages: st.lineages || {},
    lineage,
    spec: st.lineages ? st.lineages[lineage[0]] || null : null,
    learned: new Set(player.learnedTreeNodes || []),
    points: player.skillPoints || 0,
  };
}

function treeById(id, ts) {
  let n = (ts.global || []).find((x) => x.id === id);
  if (!n && ts.spec) n = (ts.spec.nodes || []).find((x) => x.id === id);
  return n || null;
}

function treeNodeIsLearned(node, ts) {
  return ts.learned.has(node.id) || !!node.owned;
}

function treeNodeState(node, ts, player) {
  if (treeNodeIsLearned(node, ts)) return { s: "learned", reason: "" };
  let unlocked = true;
  let reason = "";
  for (const p of node.prereqs || []) {
    const pn = treeById(p, ts);
    if (!pn || !treeNodeIsLearned(pn, ts)) {
      unlocked = false;
      const preSkill = skillById(pn && pn.skillId);
      reason = "Requires: " + ((preSkill && preSkill.name) || (pn && pn.id) || p);
    }
  }
  // NOTE: no level requirement — skills open with skill points only.
  if (!unlocked) return { s: "locked", reason };
  const cost = node.cost || 1;
  if (player.skillPoints < cost) return { s: "noPts", reason: "Not enough skill points (" + cost + " needed)" };
  return { s: "open", reason: "" };
}

// Ancestors-or-self by baseClass links. A class sees its own path's nodes
// only (base sees own starters; evolved sees previous + own). Global tab stays
// open to every class.
function classAncestors(slug) {
  const list = CATALOG.classes || [];
  const out = [slug];
  const seen = new Set([slug]);
  let c = list.find((x) => x.slug === slug);
  while (c && c.baseClass && !seen.has(c.baseClass)) {
    c = list.find((x) => x.slug === c.baseClass);
    if (!c) break;
    seen.add(c.slug);
    out.push(c.slug);
  }
  return out;
}

function treeNodeVisible(node, me, isClassTab, ts) {
  if (treeNodeIsLearned(node, ts)) return true;
  if (!isClassTab) return true;
  const scope = node.ownerClass || (ts.lineage && ts.lineage[0]);
  if (!scope) return true;
  return classAncestors(me.character).includes(scope);
}

function comboHintsFor(skill) {
  const hints = [];
  if (!skill) return hints;
  const combos = CATALOG.combos || [];
  if (skill.element) {
    for (const c of combos) {
      if (c.ifElement === skill.element && c.mult > 1) {
        hints.push(c.name + ": +" + Math.round((c.mult - 1) * 100) + "% vs " + (ST_STATUS[c.when] || c.when));
      }
    }
  }
  for (const b of skill.buffs || []) {
    if (ST_STATUS[b.kind]) hints.push("Applies: " + ST_STATUS[b.kind]);
  }
  return hints;
}

function skillTreeTierOf(n) {
  const c = n.cost || 1;
  if (c <= 3) return 1;
  if (c <= 4) return 2;
  if (c <= 6) return 3;
  return 4;
}

const SKILL_TIER_LABELS = {
  1: "✦ Starter — 2-3 pts",
  2: "✦ Strong — 4 pts",
  3: "✦ Advanced — 5-6 pts",
  4: "✦ Mastery — 7-10 pts"
};

function skillTreeLayout(nodes) {
  const byTier = {};
  for (const n of nodes) {
    const t = skillTreeTierOf(n);
    (byTier[t] = byTier[t] || []).push(n);
  }
  const tiers = [1, 2, 3, 4].filter((t) => byTier[t]);
  const NODE_W = 128;
  const NODE_H = 84;
  const GAP_X = 44;
  const ROW_H = 142;
  const PAD = 56;
  let maxW = 0;
  for (const t of tiers) {
    const cols = byTier[t].length;
    maxW = Math.max(maxW, cols * NODE_W + (cols - 1) * GAP_X);
  }
  const W = Math.max(620, maxW + PAD * 2);
  const H = PAD * 2 + tiers.length * ROW_H;
  const pos = {};
  const tierIndex = {};
  tiers.forEach((t, idx) => { tierIndex[t] = idx; });
  for (const t of tiers) {
    const list = byTier[t];
    const y = PAD + tierIndex[t] * ROW_H;
    const rowW = list.length * NODE_W + (list.length - 1) * GAP_X;
    const startX = (W - rowW) / 2;
    list.forEach((n, i) => {
      pos[n.id] = { x: startX + i * (NODE_W + GAP_X), y };
    });
  }
  return { tiers, byTier, tierIndex, pos, W, H, NODE_W, NODE_H, GAP_X, ROW_H, PAD };
}

function renderTreeMap(nodes, ts, me) {
  const mapEl = $("skilltree-map");
  const nodesEl = $("skilltree-nodes");
  const labelsEl = $("skilltree-tiers");
  if (!mapEl || !nodesEl) return;
  const L = skillTreeLayout(nodes);
  mapEl.style.width = L.W + "px";
  mapEl.style.height = L.H + "px";
  mapEl.style.transformOrigin = "0 0";
  nodesEl.innerHTML = nodes
    .map((n) => {
      const p = L.pos[n.id];
      const sk = skillById(n.skillId);
      const stt = treeNodeState(n, ts, me);
      const titleParts = [((sk && sk.name) || n.skillId)];
      if (sk && sk.description) titleParts.push(sk.description);
      if (n.desc) titleParts.push(n.desc);
      titleParts.push("Cost: " + (n.cost || 1) + " skill point" + ((n.cost || 1) === 1 ? "" : "s"));
      if (stt.s === "locked" || stt.s === "noPts") titleParts.push(stt.reason);
      const hints = comboHintsFor(sk);
      if (hints.length) titleParts.push("Combo: " + hints.join(" · "));
      const cost = n.cost || 1;
      return `<button type="button" class="st-node st-node--${stt.s}" data-node="${n.id}" data-state="${stt.s}" data-reason="${escapeHtml(stt.reason)}" style="left:${p.x}px;top:${p.y}px;width:${L.NODE_W}px;height:${L.NODE_H}px" title="${escapeHtml(titleParts.join(" — "))}">
        <span class="portrait st-node-ico st-node-ico--${escapeHtml(((sk && sk.element) || "physical"))}" data-img="${escapeHtml((sk && sk.image) || "")}" data-variant="${escapeHtml((sk && sk.element) || "physical")}"></span>
        <span class="st-node-body">
          <span class="st-node-name">${escapeHtml((sk && sk.name) || n.skillId)}</span>
          <span class="st-node-cost">${n.owned ? "✓ owned" : "✦ " + cost + " pt"}</span>
        </span>
        ${stt.s === "locked" ? '<span class="st-node-lock">🔒</span>' : ""}${stt.s === "noPts" ? '<span class="st-node-lock">✦</span>' : ""}
      </button>`;
    })
    .join("");
  initImages(nodesEl);
  nodesEl.querySelectorAll(".st-node[data-state='open']").forEach((b) => {
    b.addEventListener("click", () => {
      sfxPlay("clicksound");
      socket.emit("skillTree:learn", { nodeId: b.getAttribute("data-node") });
    });
  });
  nodesEl.querySelectorAll(".st-node:not([data-state='open'])").forEach((b) => {
    b.addEventListener("click", () => {
      const reason = b.getAttribute("data-reason");
      showToast(reason || "Locked — gain skill points to unlock.");
    });
  });
  if (labelsEl) {
    labelsEl.innerHTML = L.tiers
      .map((t) => {
        const y = L.PAD + L.tierIndex[t] * L.ROW_H;
        return `<span class="st-tier-label" style="left:0;top:${y - 30}px;width:${L.W}px">${SKILL_TIER_LABELS[t]}</span>`;
      })
      .join("");
  }
  return L;
}

const stMap = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };

function updateStMapTransform() {
  const inner = $("skilltree-map");
  if (!inner) return;
  inner.style.transform = `translate(${stMap.x}px, ${stMap.y}px) scale(${stMap.scale})`;
}

function fitSkillTreeMap() {
  const vp = $("skilltree-map-viewport");
  const inner = $("skilltree-map");
  if (!vp || !inner) return;
  const vw = vp.clientWidth;
  const vh = vp.clientHeight;
  const sw = inner.offsetWidth || 600;
  const sh = inner.offsetHeight || 400;
  stMap.scale = Math.max(0.55, Math.min(1, Math.min(vw / sw, vh / sh) * 0.94));
  stMap.x = (vw - sw * stMap.scale) / 2;
  stMap.y = (vh - sh * stMap.scale) / 2;
  updateStMapTransform();
}

function initSkillTreeMapInteractions() {
  const vp = $("skilltree-map-viewport");
  if (!vp || vp.dataset.bound) return;
  vp.dataset.bound = "1";
  vp.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    stMap.scale = Math.min(1.8, Math.max(0.55, stMap.scale + delta));
    updateStMapTransform();
  }, { passive: false });
  vp.addEventListener("mousedown", (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    stMap.dragging = true;
    vp.style.cursor = "grabbing";
    stMap.lastX = e.clientX;
    stMap.lastY = e.clientY;
  });
  window.addEventListener("mouseup", () => {
    stMap.dragging = false;
    if (vp) vp.style.cursor = "grab";
  });
  window.addEventListener("mousemove", (e) => {
    if (!stMap.dragging) return;
    const dx = e.clientX - stMap.lastX;
    const dy = e.clientY - stMap.lastY;
    stMap.x += dx;
    stMap.y += dy;
    stMap.lastX = e.clientX;
    stMap.lastY = e.clientY;
    updateStMapTransform();
  });
  let lastDist = 0;
  vp.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist = Math.hypot(dx, dy);
    }
  });
  vp.addEventListener("touchmove", (e) => {
    if (e.touches.length !== 2) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    if (lastDist) {
      stMap.scale = Math.min(1.8, Math.max(0.55, stMap.scale * (dist / lastDist)));
      updateStMapTransform();
    }
    lastDist = dist;
  }, { passive: true });
}

function renderTreeLoadout(me, max) {
  const el = $("skilltree-loadout");
  if (!el) return;
  const loadout = me.skillLoadout || [];
  const unlocked = me.unlockedSkills || [];
  el.innerHTML = `
    <div class="st-loadout-head">
      <span class="st-loadout-title">⚔ Loadout</span>
      <span class="st-loadout-hint">${loadout.length}/${max} equipped · click a skill to equip or unequip</span>
    </div>
    <div class="st-loadout-chips" id="st-loadout-chips"></div>`;
  const chips = $("st-loadout-chips");
  if (!chips) return;
  if (!unlocked.length) {
    chips.innerHTML = `<span class="muted">Learn skills from the tree above to equip them.</span>`;
    return;
  }
  chips.innerHTML = unlocked
    .map((sid) => {
      const sk = skillById(sid);
      const on = loadout.includes(sid);
      return `<button type="button" class="st-loadout-chip${on ? " st-loadout-chip--on" : ""}" data-skill="${sid}" title="${escapeHtml((sk && sk.description) || "")}">
        <span class="portrait st-loadout-ico st-node-ico--${escapeHtml(((sk && sk.element) || "physical"))}" data-img="${escapeHtml((sk && sk.image) || "")}" data-variant="${escapeHtml((sk && sk.element) || "physical")}"></span>
        <span class="st-loadout-chip-name">${escapeHtml((sk && sk.name) || sid)}</span>
      </button>`;
    })
    .join("");
  initImages(chips);
  chips.querySelectorAll("[data-skill]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sid = btn.getAttribute("data-skill");
      let next = loadout.slice();
      if (next.includes(sid)) next = next.filter((x) => x !== sid);
      else {
        if (next.length >= max) {
          showToast(`You can only equip ${max} skills at once.`);
          return;
        }
        next.push(sid);
      }
      sfxPlay("clicksound");
      socket.emit("skill:setLoadout", { skillIds: next });
    });
  });
}

function renderSkillTreeView(room) {
  const content = $("skilltree-content");
  const me = room.players.find((p) => p.id === state.playerId);
  if (!content || !me) return;
  const ts = skillTreeInfo(me);
  const st = ts.st;
  const showClass = state.skillTreeTab === "class";
  const allNodes = showClass && ts.spec ? ts.spec.nodes : ts.global;
  const nodes = (allNodes || []).filter((n) => treeNodeVisible(n, me, showClass, ts));
  const classLabelText = ts.lineage.map((s) => (CATALOG.classes.find((c) => c.slug === s) || {}).label || s).join(" → ");
  content.innerHTML = `
    <div class="skilltree">
      <div class="skilltree-head">
        <div class="skilltree-tabs">
          <button type="button" class="st-tab${!showClass ? " st-tab--active" : ""}" data-tab="global">Global</button>
          <button type="button" class="st-tab${showClass ? " st-tab--active" : ""}" data-tab="class" title="${escapeHtml(classLabelText)}">Class</button>
        </div>
        <div class="skilltree-pts" title="Gain ${st.pointsPerLevel} skill point${st.pointsPerLevel === 1 ? "" : "s"} per level">
          <span class="st-point-ico">✦</span>
          <span class="st-point-num">${me.skillPoints || 0}</span>
          <span class="st-point-lbl">pts</span>
        </div>
        <div class="skilltree-controls">
          <span class="st-tree-name">${showClass && ts.spec ? escapeHtml(ts.spec.label) : "Global Skills"}</span>
          <button type="button" class="btn btn--mini" id="st-zoom-in" title="Zoom in">+</button>
          <button type="button" class="btn btn--mini" id="st-zoom-out" title="Zoom out">−</button>
          <button type="button" class="btn btn--mini" id="st-zoom-reset" title="Reset view">⤢</button>
        </div>
      </div>
      <div class="skilltree-combos" id="skilltree-combos">
        <button type="button" class="btn btn--ghost" id="st-combo-legend-toggle" title="Combos & Synergies">💡 Combos & Synergies</button>
        <div id="st-combo-legend-panel" class="st-combo-legend hidden"></div>
      </div>
      <div class="skilltree-map-viewport" id="skilltree-map-viewport">
        <div class="skilltree-map" id="skilltree-map">
          <div class="skilltree-tiers" id="skilltree-tiers"></div>
          <div class="skilltree-nodes" id="skilltree-nodes"></div>
        </div>
      </div>
      <div class="skilltree-loadout" id="skilltree-loadout"></div>
    </div>`;

  content.querySelectorAll("[data-tab]").forEach((b) => {
    b.addEventListener("click", () => {
      state.skillTreeTab = b.getAttribute("data-tab");
      renderSkillTreeView(room);
    });
  });

  const combos = CATALOG.combos || [];
  const legendPanel = $("st-combo-legend-panel");
  const legendBtn = $("st-combo-legend-toggle");
  if (legendPanel && combos.length) {
    legendPanel.innerHTML = combos.map((c) => {
      const statusLabel = ST_STATUS[c.when] || c.when;
      return `<div class="st-combo-legend-card">
        <span class="st-combo-legend-icon">⚡</span>
        <span class="st-combo-legend-name">${escapeHtml(c.name || c.id)}</span>
        <span class="st-combo-legend-desc">${escapeHtml(c.desc || "")}${c.when ? " — triggers when the foe is ${statusLabel}." : ""}</span>
      </div>`;
    }).join("");
  }
  if (legendBtn && legendPanel) {
    legendBtn.addEventListener("click", () => legendPanel.classList.toggle("hidden"));
  }

  const gridEl = $("skilltree-map-viewport");
  if (gridEl) {
    renderTreeMap(nodes, ts, me);
    initSkillTreeMapInteractions();
    fitSkillTreeMap();
    const zin = $("st-zoom-in");
    const zout = $("st-zoom-out");
    const zreset = $("st-zoom-reset");
    if (zin) zin.addEventListener("click", () => { stMap.scale = Math.min(1.8, stMap.scale * 1.2); updateStMapTransform(); });
    if (zout) zout.addEventListener("click", () => { stMap.scale = Math.max(0.55, stMap.scale / 1.2); updateStMapTransform(); });
    if (zreset) zreset.addEventListener("click", () => fitSkillTreeMap());
  }

  renderTreeLoadout(me, st.maxLoadout || 5);
}

// ---- Dungeon ----

// The dungeon/boss the local player belongs to.
function myDungeon(room) {
  if (!room || !state.playerId) return null;
  const me = room.players.find((p) => p.id === state.playerId);
  if (!me) return null;
  if (me.dungeonId) {
    const d = (room.dungeons || []).find((x) => x.id === me.dungeonId);
    if (d) return d;
  }
  if (me.bossId) {
    const b = (room.bossParties || []).find((x) => x.id === me.bossId);
    if (b) return b;
  }
  // Fallback by memberIds (covers cases where bossId/dungeonId not synced)
  const byD = (room.dungeons || []).find((d) => d.memberIds && d.memberIds.includes(state.playerId));
  if (byD) return byD;
  const byB = (room.bossParties || []).find((b) => b.memberIds && b.memberIds.includes(state.playerId));
  if (byB) return byB;
  return null;
}

function myPvp(room){
  if(!room||!state.playerId) return null;
  return (room.pvpDuels||[]).find(d=> d.memberIds.includes(state.playerId))||null;
}
function ensureDungeonState() {
  if (state.selectedDungeonRank == null) state.selectedDungeonRank = (CATALOG.dungeons[0] && CATALOG.dungeons[0].rank) || null;
  if (state.selectedPartySize == null) state.selectedPartySize = (CATALOG.sizes[0] && CATALOG.sizes[0].id) || "normal";
}

function renderDungeonView(room) {
  const d = myDungeon(room);
  const root = $("dungeon-content");
  if (!d) return renderDungeonBrowser(room, root);
  if (d.bossId) {
    if (d.status === "fighting" || d.status === "done") return renderCombat(room, root);
    if (d.status === "waiting") return renderBossLobby(room, root, d);
    return renderDungeonBrowser(room, root);
  }
  if (d.status === "fighting" || d.status === "done") return renderCombat(room, root);
  if (d.status === "forming" || d.status === "waiting") return renderPartyLobby(room, root, d);
  return renderDungeonBrowser(room, root);
}
function renderBossLobby(room, root, b) {
  const members = (b.memberIds||[]).map(id=> room.players.find(p=>p.id===id)).filter(Boolean);
  const isLeader = b.leaderId===state.playerId;
  const isDead = room.players.find(p=>p.id===state.playerId)?.lives<=0;
  root.innerHTML = `
    <div class="party-lobby">
      <button type="button" class="btn btn--ghost" id="btn-boss-back">← Back</button>
      <div class="party-lobby-header">
        <span class="portrait portrait--dungeon dungeon-tile large" data-img="${b.image||""}" data-variant="dungeon"></span>
        <div>
          <p class="subhead">Boss Lobby — ${escapeHtml(b.label)}</p>
          <h3>${escapeHtml(b.label)}</h3>
          <p class="muted">Boss HP ${b.maxHp||b.hp} · ${members.length}/${room.maxPlayers} members · Leader: ${escapeHtml((room.players.find(p=>p.id===b.leaderId)||{}).name||"Unknown")}</p>
        </div>
      </div>
      <p class="lead">First to enter is leader. Only leader can start. Boss has 6 OP skills. Need to kill previous boss to unlock next.</p>
      <ul class="party-list">
        ${members.map(m=> `<li><span class="portrait portrait--${m.character} party-portrait" data-img="${imgFor(m.character,"class")}" data-variant="${m.character}"${m.anomaly?` style="--frame:${m.anomaly.frameColor}"`:""}></span><span class="party-list-main"><span class="party-list-name">${escapeHtml(m.name)}</span>${m.id===b.leaderId?' <span class="badge badge--host">Leader</span>':""}${m.id===state.playerId?' <span class="badge">You</span>':""}<span class="player-meta">${escapeHtml(classLabel(m.character))} · Lv ${m.level} · ${m.hp}/${m.maxHp} HP</span></span></li>`).join("")}
      </ul>
      ${isDead?`<div class="log-line" style="color:#ff8a8a">💀 You have fallen — cannot start.</div>`:""}
      <div class="btn-row">
        <button type="button" class="btn btn--ghost" id="btn-boss-leave">Leave</button>
        ${isDead?`<span class="muted">Fallen</span>`: isLeader?`<button type="button" class="btn btn--gold" id="btn-boss-start">Start Boss</button>`:`<span class="muted">Waiting for leader…</span>`}
      </div>
    </div>`;
  initImages(root);
  root.querySelector("#btn-boss-back")?.addEventListener("click", ()=>{ state.dungeonOpen=false; renderTown(state.room); });
  root.querySelector("#btn-boss-leave")?.addEventListener("click", ()=> socket.emit("boss:leave"));
  root.querySelector("#btn-boss-start")?.addEventListener("click", ()=> socket.emit("boss:start"));
}

function rarityMetaOf(r) {
  return (CATALOG.loot && CATALOG.loot.rarityMeta && CATALOG.loot.rarityMeta[r]) || {};
}

function dungeonDrops(rank) {
  const dg = CATALOG.dungeons.find((x) => x.rank === rank) || {};
  const pool = (dg.monsterPool || [])
    .map((id) => CATALOG.monsters.find((m) => m.id === id))
    .filter(Boolean);
  const loot = CATALOG.loot || {};
  const dropChance = loot.dropChance || {};
  const perKill = [...new Set(pool.map((m) => m.rarity))]
    .filter(Boolean)
    .map((r) => ({ rarity: r, chance: dropChance[r] || 0 }));
  const order = loot.rarityOrder || [];
  const weights = (loot.gradeWeights || {})[rank] || (loot.gradeWeights || {}).f || {};
  const total = order.reduce((s, r) => s + (weights[r] || 0), 0);
  const odds = order
    .map((r) => ({ rarity: r, pct: total ? Math.round(((weights[r] || 0) / total) * 1000) / 10 : 0 }))
    .filter((o) => o.pct > 0);
  return { pool, perKill, odds };
}

function renderDungeonBrowser(room, root) {
  ensureDungeonState();
  const me = room.players.find((p) => p.id === state.playerId);
  const isDead = me && me.lives <= 0;
  const selectedRank = state.selectedDungeonRank;
  // Parties for selected rank (only forming & open)
  const parties = (room.dungeons || []).filter((d) => d.status === "forming" && d.open && d.rank === selectedRank);
  const dgDef = CATALOG.dungeons.find((x) => x.rank === selectedRank) || null;

  const leftHtml = `<div class="dungeon-browser-left">
    <p class="subhead">Dungeons</p>
    <div class="dungeon-list-col">
      ${CATALOG.dungeons.map((dg) => {
        const top = [...dungeonDrops(dg.rank).odds].sort((a,b)=>b.pct-a.pct).slice(0,2);
        const hint = top.map(o=>`${escapeHtml(rarityMetaOf(o.rarity).label||o.rarity)} ${o.pct}%`).join(" · ");
        const sel = dg.rank === selectedRank ? " is-selected" : "";
        return `<button type="button" class="dungeon-list-item${sel}" data-rank="${dg.rank}">
          <span class="portrait portrait--dungeon dungeon-list-tile" data-img="${dg.image}" data-variant="dungeon"></span>
          <span class="dungeon-list-meta">
            <span class="dungeon-list-label">${escapeHtml(dg.label)}</span>
            <span class="dungeon-list-hint">${hint}</span>
          </span>
        </button>`;
      }).join("")}
    </div>
  </div>`;

  // Right side
  let rightHtml = "";
  if (!dgDef) {
    rightHtml = `<div class="dungeon-browser-right"><p class="muted">Select a dungeon on the left.</p></div>`;
  } else {
    const drops = dungeonDrops(selectedRank);
    const chip = (o, text) => `<span class="drop-chip" style="--drop:${rarityMetaOf(o.rarity).color || "#9aa7b5"}">${escapeHtml(text)}</span>`;
    const monsterChips = drops.pool.map((m) => chip({ rarity: m.rarity }, m.name)).join("");
    const perKillLine = drops.perKill.map((p) => chip(p, `${rarityMetaOf(p.rarity).label || p.rarity} ${Math.round(p.chance * 100)}%`)).join("");
    const oddsLine = drops.odds.map((o) => chip(o, `${rarityMetaOf(o.rarity).label || o.rarity} ${o.pct}%`)).join("");
    const dropPanel = drops.pool.length ? `<div class="drop-panel">
        <div class="drop-panel-title">Possible Drops — ${escapeHtml(dgDef.label)}</div>
        <div class="drop-row"><span class="drop-label">Monsters</span><span class="drop-chips">${monsterChips}</span></div>
        <div class="drop-row"><span class="drop-label">Per kill</span><span class="drop-chips">${perKillLine}</span></div>
        <div class="drop-row"><span class="drop-label">Item rarity</span><span class="drop-chips">${oddsLine}</span></div>
      </div>` : "";

    const deadBanner = isDead ? `<div class="log-line" style="color:#ff8a8a">💀 You have fallen. You cannot join or create parties until revived at the Ancient Temple.</div>` : "";
    const partyCards = parties.length
      ? parties.map((d) => {
          const leader = room.players.find((p)=>p.id===d.leaderId);
          const members = (d.memberIds||[]).map((id)=>room.players.find((p)=>p.id===id)).filter(Boolean);
          const sizeDef = CATALOG.sizes.find((s)=>s.id===d.size);
          const canJoin = !isDead && d.memberIds.length < room.maxPlayers && d.open;
          return `<div class="party-card">
            <div class="party-card-head">
              <span class="party-card-title">${escapeHtml(d.label || dgDef.label)} — ${escapeHtml(sizeLabel(d.size))}</span>
              <span class="muted">Stamina ${d.stamina != null ? d.stamina : sizeDef ? sizeDef.stamina : "?"}</span>
            </div>
            <div class="party-card-leader">Leader: ${leader ? escapeHtml(leader.name) : "Unknown"} · ${members.length}/${room.maxPlayers}</div>
            <div class="party-card-members">
              ${members.map((m)=>{
                const frame = m.anomaly ? ` style="--frame:${m.anomaly.frameColor}"` : "";
                return `<span class="party-chip${m.id===d.leaderId?" party-chip--leader":""}" title="${escapeHtml(m.name)}">
                  <span class="portrait portrait--${m.character} party-portrait-mini" data-img="${imgFor(m.character,"class")}" data-variant="${m.character}"${frame}></span>
                  <span>${escapeHtml(m.name)}</span>
                </span>`;
              }).join("")}
            </div>
            <button type="button" class="btn btn--bronze btn--mini party-join-btn" data-join="${d.id}" ${canJoin ? "" : "disabled"}>${isDead ? "Dead" : canJoin ? "Join Party" : "Full"}</button>
          </div>`;
        }).join("")
      : `<div class="muted">No parties yet for ${escapeHtml(dgDef.label)}. Create one below.</div>`;

    const sizeOpts = CATALOG.sizes.map((s)=>{
      const sel = s.id === state.selectedPartySize ? " is-selected" : "";
      return `<button type="button" class="size-card${sel}" data-size-pick="${s.id}">
        <span class="size-card-label">${escapeHtml(s.label)}</span>
        <span class="muted">Stamina ${s.stamina}</span>
      </button>`;
    }).join("");

    rightHtml = `<div class="dungeon-browser-right">
      ${deadBanner}
      <div class="dungeon-browser-right-head">
        <p class="subhead">${escapeHtml(dgDef.label)} — Parties</p>
        <span class="muted">${parties.length} party${parties.length===1?"":"s"} available</span>
      </div>
      <div class="party-grid">${partyCards}</div>
      ${dropPanel}
      <div class="create-party-section">
        <p class="subhead">Create a Party</p>
        <div class="size-grid">${sizeOpts}</div>
        <button type="button" class="btn btn--gold" id="btn-create-party" ${isDead ? "disabled" : ""}>Create Party — ${escapeHtml(dgDef.label)} (${escapeHtml(sizeLabel(state.selectedPartySize))})</button>
        <p class="hint">${isDead ? "You have fallen — cannot create parties." : "You will become the leader. Only the leader can start the delve."}</p>
      </div>
    </div>`;
  }

  root.innerHTML = `<div class="dungeon-browser">${leftHtml}${rightHtml}</div>`;
  initImages(root);
  root.querySelectorAll("[data-rank]").forEach((b)=>{
    b.addEventListener("click", ()=>{
      state.selectedDungeonRank = b.getAttribute("data-rank");
      renderDungeonBrowser(room, root);
    });
  });
  root.querySelectorAll("[data-size-pick]").forEach((b)=>{
    b.addEventListener("click", ()=>{
      state.selectedPartySize = b.getAttribute("data-size-pick");
      renderDungeonBrowser(room, root);
    });
  });
  const createBtn = root.querySelector("#btn-create-party");
  if (createBtn) createBtn.addEventListener("click", ()=>{
    if (isDead) { showToast("You have fallen. Seek The Essence of Life at the Ancient Temple."); return; }
    socket.emit("dungeon:create", { rank: state.selectedDungeonRank, size: state.selectedPartySize });
  });
  root.querySelectorAll("[data-join]").forEach((b)=>{
    b.addEventListener("click", ()=>{
      if (isDead) { showToast("You have fallen. Seek The Essence of Life at the Ancient Temple."); return; }
      socket.emit("dungeon:joinById", { dungeonId: b.getAttribute("data-join") });
    });
  });
}

function renderPartyLobby(room, root, d) {
  const members = (d.memberIds || []).map((id) => room.players.find((p) => p.id === id)).filter(Boolean);
  const isLeader = d.leaderId === state.playerId;
  const sizeDef = CATALOG.sizes.find((s)=>s.id===d.size);
  const me = room.players.find((p)=>p.id===state.playerId);
  const isDead = me && me.lives <= 0;
  root.innerHTML = `
    <div class="party-lobby">
      <button type="button" class="btn btn--ghost" id="btn-party-back">← Back to Dungeon List</button>
      <div class="party-lobby-header">
        <span class="portrait portrait--dungeon dungeon-tile large" data-img="${d.image || ""}" data-variant="dungeon"></span>
        <div>
          <p class="subhead">Party Lobby</p>
          <h3>${escapeHtml(d.label || "")} — ${escapeHtml(sizeLabel(d.size))}</h3>
          <p class="muted">Stamina ${d.stamina != null ? d.stamina : sizeDef ? sizeDef.stamina : "?"} · ${members.length}/${room.maxPlayers} members · Leader: ${escapeHtml((room.players.find((p)=>p.id===d.leaderId)||{}).name || "Unknown")}</p>
        </div>
      </div>
      <p class="lead">You are in a party. The leader starts the delve — no ready check needed. New members can join from the dungeon list while you wait.</p>
      <ul class="party-list">
        ${members.map((m) => `<li>
            <span class="portrait portrait--${m.character} party-portrait" data-img="${imgFor(m.character,"class")}" data-variant="${m.character}"${m.anomaly ? ` style="--frame:${m.anomaly.frameColor}"` : ""}></span>
            <span class="party-list-main">
              <span class="party-list-name">${escapeHtml(m.name)}</span>
              ${m.id === d.leaderId ? ' <span class="badge badge--host">Leader</span>' : ""}
              ${m.id === state.playerId ? ' <span class="badge">You</span>' : ""}
              <span class="player-meta">${escapeHtml(classLabel(m.character))} · Lv ${m.level} · ${m.hp}/${m.maxHp} HP · ${m.stamina} Stamina</span>
            </span>
          </li>`).join("")}
      </ul>
      ${isDead ? `<div class="log-line" style="color:#ff8a8a">💀 You have fallen. You cannot start a delve until revived.</div>` : ""}
      <div class="btn-row">
        <button type="button" class="btn btn--ghost" id="btn-party-leave">Leave Party</button>
        ${isDead ? `<span class="muted" style="align-self:center">You have fallen — cannot start.</span>` : isLeader ? `<button type="button" class="btn btn--gold" id="btn-party-start">Start Delve (${d.stamina != null ? d.stamina : sizeDef ? sizeDef.stamina : "?"} stamina)</button>` : `<span class="muted" style="align-self:center">Waiting for leader to start…</span>`}
      </div>
    </div>`;
  initImages(root);
  const back = root.querySelector("#btn-party-back");
  if (back) back.addEventListener("click", ()=>{
    // leave lobby view but stay in party? Spec says once party created, open new interface. Back should maybe not leave party, just show browser? But if in party, we still show lobby. So back button leaves party? For UX, keep lobby; back just does nothing if still in party. We'll make it leave party? Actually better: back without leaving party is confusing. We'll keep lobby – back button will show browser but player still in party? Instead implement as "Leave party and back to list" – but we already have leave button. So change back to just render browser temporarily? For simplicity, back will NOT leave party but will allow viewing other parties? But spec says once party created, it should open new interface – implies lobby is modal. So back should return to browser without leaving party? That would contradict renderDungeonView logic which shows lobby whenever in party. To allow browsing while in party, we need extra state: party lobby vs browser. Simpler: back button leaves party.
    // For now, back does NOT leave – it just stays in lobby; to avoid confusion we make it a no-op that shows toast. But we implement leave-on-back for clarity.
    // We'll treat back as “leave party and return”
    // Actually we keep original: back leaves lobby view by not leaving party – but renderDungeonView will immediately re-show lobby, so back does nothing. So we implement back that does nothing except maybe deselect? To avoid confusion, back will NOT exist – but spec says party opens new interface – so back should be “Leave party”
    // We keep button but it will just re-render lobby (no navigation). Keep for accessibility.
    showToast("You are in a party — leave to browse other parties.");
  });
  root.querySelector("#btn-party-leave").addEventListener("click", () => socket.emit("dungeon:leave"));
  const start = root.querySelector("#btn-party-start");
  if (start) start.addEventListener("click", () => socket.emit("dungeon:start"));
}

function combatLoadout(me) {
  const cls = CATALOG.classes.find((c) => c.slug === me.character) || {};
  const raw = cls.basicAttack;
  const basic = raw ? { ...raw, target: "enemy", mana: 0 } : { id: "auto_attack", name: "Basic Attack", target: "enemy", power: 1.0, mana: 0, image: "" };
  const ids = me.skillLoadout || [];
  const skills = [basic, ...ids.map((id) => CATALOG.skills.find((s) => s.id === id)).filter(Boolean)];
  const maxLoadout = (CATALOG.skillTree && CATALOG.skillTree.maxLoadout) || 5;
  while (skills.length < maxLoadout + 1) skills.push(null);
  return skills.slice(0, maxLoadout + 1);
}

function skillTipEl(s) {
  const desc = s.description || "";
  const mech = skillMechanicsLine(s);
  return `<span class="skill-tip">
    <strong>${escapeHtml(s.name)}</strong>
    <span>${escapeHtml(desc)}</span>
    ${mech ? `<span class="skill-mech">${escapeHtml(mech)}</span>` : ""}
    <em>${s.mana ? s.mana + " mana" : "Free"}</em>
  </span>`;
}

function renderCombat(room, root) {
  const d = myDungeon(room);
  const me = room.players.find((p) => p.id === state.playerId);
  const members = (d.memberIds || []).map((id) => room.players.find((p) => p.id === id)).filter(Boolean);
  const isMyTurn = d.status === "fighting" && d.phase === "players" && d.currentTurnId === state.playerId;
  const canAct = isMyTurn && me && me.hp > 0;
  const current = members.find((p) => p.id === d.currentTurnId);

  if (!canAct && state.selectedSkill) state.selectedSkill = null;

  if (canAct) {
    if (state.timerReset || state.timerDeadline == null) {
      state.timerDeadline = Date.now() + turnTimeoutMs();
      state.timerFired = false;
      state.timerReset = false;
    }
  } else {
    state.timerDeadline = null;
    state.timerFired = false;
  }
  startCombatTimer();

  const isNewRound = d.round !== state.lastRound;
  if (d.currentTurnId && d.currentTurnId !== state.lastTurnId) {
    if (d.currentTurnId === state.playerId && me && me.hp > 0) playSfx("turn");
    state.lastTurnId = d.currentTurnId;
    if (state.pendingUsedSkills) state.pendingUsedSkills.clear();
  }
  if (isNewRound) {
    if (state.pendingUsedSkills) state.pendingUsedSkills.clear();
    state.lastRound = d.round;
  }
  if (d.phase === "players" && state.lastPhase === "monsters" && state.pendingUsedSkills) {
    state.pendingUsedSkills.clear();
  }
  state.lastPhase = d.phase;
  if (d.status === "done" && state.pendingUsedSkills) state.pendingUsedSkills.clear();

  const enemiesHtml = d.wave
    .map((m, i) => {
      const dead = m.hp <= 0;
      const targetable = canAct && state.selectedSkill && state.selectedSkill.target === "enemy" && !dead;
      return `<button type="button" class="enemy${dead ? " enemy--dead" : ""}${targetable ? " enemy--targetable" : ""}" data-enemy="${i}">
        ${targetable ? `<span class="tgtkey">${d.wave.slice(0, i + 1).filter((x) => x.hp > 0).length}</span>` : ""}
        <span class="portrait portrait--monster monster-portrait" data-img="${imgFor(m.kind, "monster")}" data-variant="monster"></span>
        <span class="enemy-meta">
          <span class="enemy-name">${escapeHtml(m.name)}</span>
          <span class="hpbar"><span class="hpbar-fill" style="width:${Math.round((m.hp / m.maxHp) * 100)}%"></span></span>
          <span class="hpnum">${m.hp}/${m.maxHp}</span>
          ${buffBadges(d, "monster", i)}
        </span>
      </button>`;
    })
    .join("");

  const partyHtml = members
    .map((p, fi) => {
      const frame = p.anomaly ? ` style="--frame:${p.anomaly.frameColor}"` : "";
      const targetable = canAct && state.selectedSkill && state.selectedSkill.target === "ally" && p.hp > 0;
      const isCurrent = d.phase === "players" && d.currentTurnId === p.id;
      const isMe = p.id === state.playerId;
      return `<button type="button" class="fighter${p.hp <= 0 ? " fighter--down" : ""}${isCurrent ? " fighter--turn" : ""}${targetable ? " fighter--targetable" : ""}${isMe ? " fighter--me" : ""}" data-fighter="${p.id}"${frame}>
        ${targetable ? `<span class="tgtkey">${members.slice(0, fi + 1).filter((x) => x.hp > 0).length}</span>` : ""}
        <span class="fighter-bg" data-img="${imgFor(p.character, "class")}" data-variant="${p.character}"></span>
        <span class="fighter-shade" aria-hidden="true"></span>
        <span class="fighter-meta">
        <span class="fighter-name">${escapeHtml(p.name)}${p.id === d.leaderId ? " ★" : ""}${isCurrent ? ' <span class="turn-tag">turn</span>' : ""}</span>
        <span class="hpbar"><span class="hpbar-fill hpbar-fill--party" style="width:${Math.round((p.hp / p.maxHp) * 100)}%"></span></span>
        <span class="hpnum">${p.hp}/${p.maxHp}</span>
        ${p.shield>0 ? `<span class="hpbar shieldbar"><span class="hpbar-fill shieldbar-fill" style="width:${Math.round((p.shield/(p.maxShield||p.shield))*100)}%"></span></span><span class="hpnum shieldnum">🛡️ ${p.shield}/${p.maxShield}</span>` : ``}
        <span class="fighter-stats">Atk ${p.attack} · Res ${p.resistance} · Mgc ${p.magicPower} · Heal ${p.healPower} · Spd ${p.speed} · Crit ${p.critChance}%</span>
        <span class="fighter-mana">Mana ${p.mana}/${p.maxMana}</span>
        <span class="fighter-pets">${(p.activePetIds|| (p.activePetId?[p.activePetId]:[])).map(pid=>{ const pd=(CATALOG.pets||[]).find(x=>x.id===pid); const pp=(p.pets||[]).find(x=>x.petId===pid); const lvl=pp? (pp.level||1):1; const img=pd?petImageForLevel(pd,lvl):''; const name=pd?petDisplayName(pd,lvl):pid; return `<span class="pet-icon" data-img="${escapeHtml(img)}" title="${escapeHtml(petTitleText(pd, pp, lvl))}" style="width:1.4rem;height:1.4rem;display:inline-block;border:1px solid var(--glass-line);border-radius:50%;background:var(--glass-2);background-size:cover;background-position:center;vertical-align:middle;margin:0 2px;"></span>`; }).join("")}</span>
        ${buffBadges(d, "player", p.id)}
        </span>
      </button>`;
    })
    .join("");

  const usedIdsRaw = (d.usedSkills && d.usedSkills[me.id]) || [];
  // merge pending (optimistic) to prevent double click before server echo
  const pending = state.pendingUsedSkills || new Set();
  // clear pending that are now confirmed
  for (const pid of [...pending]) { if (usedIdsRaw.includes(pid)) pending.delete(pid); }
  const usedIds = [...usedIdsRaw, ...pending];
  const cdMap = (d.cooldowns && d.cooldowns[me.id]) || {};
  const skillsHtml = combatLoadout(me)
    .map((s, si) => {
      if (!s) {
        return `<div class="skill-slot skill-slot--empty"></div>`;
      }
      const affordable = me.mana >= (s.mana || 0);
      const usedNow = usedIds.includes(s.id);
      const cdLeft = cdMap[s.id] || 0;
      const picked = state.selectedSkill && state.selectedSkill.id === s.id;
      const disabled = !canAct || !affordable || usedNow || cdLeft > 0;
      return `<button type="button" class="skill-slot${disabled ? " skill-slot--disabled" : ""}${picked ? " skill-slot--picked" : ""}${usedNow ? " skill-slot--used" : ""}" data-skill="${s.id}" data-target="${s.target}">
        ${"QWERTY"[si] ? `<span class="hotkey">${"QWERTY"[si]}</span>` : ""}
        ${skillTipEl(s)}
        ${skillIconEl(s)}
        <span class="skill-name">${escapeHtml(s.name)}</span>
        <span class="skill-mana">${s.mana || 0} mana</span>
        ${usedNow ? '<span class="skill-used-tag">Used</span>' : ""}
        ${!usedNow && cdLeft > 0 ? `<span class="skill-used-tag">⏳${cdLeft}</span>` : ""}
      </button>`;
    })
    .join("");

  const itemButtons = [`<button type="button" class="item-btn${canAct && me.food > 0 ? "" : " item-btn--disabled"}" data-item="food">
    ${itemIconEl({ id: "food", image: "" })}
    <span>Eat Food (${me.food})</span>
  </button>`];
  (me.inventory || []).forEach((inv) => {
    const item = CATALOG.items.find((x) => x.id === inv.itemId);
    if (!item || item.slot !== "consumable" || inv.qty < 1) return;
    itemButtons.push(`<button type="button" class="item-btn${canAct ? "" : " item-btn--disabled"}" data-item="${inv.itemId}">
      ${itemIconEl(item)}
      <span>${escapeHtml(item.name)} (${inv.qty})</span>
    </button>`);
  });
  const itemsHtml = itemButtons.join("");

  let hint;
  if (d.status === "done") hint = d.result ? d.result.text : "";
  else if (d.phase === "monsters") hint = "The monsters are acting…";
  else if (!isMyTurn) hint = current ? `Waiting for ${current.name}…` : "…";
  else if (me.hp <= 0) hint = "You are down — wait to be revived.";
  else if (state.selectedSkill)
    hint = state.selectedSkill.target === "self" ? "Click the skill again to use it." : "Choose a target.";
  else if (canAct && combatLoadout(me).filter(Boolean).every((s) => usedIds.includes(s.id) || (cdMap[s.id] || 0) > 0))
    hint = "All skills used — end your turn when ready.";
  else hint = "Your turn — choose an action.";

  const hpPct = me && me.maxHp ? me.hp / me.maxHp : 0;
  const canFlee = canAct && hpPct >= 0.2;
  const fleeDisabled = !canAct || hpPct < 0.2;
  const fleeLabel = hpPct < 0.2 ? "Too injured to flee!" : "Flee";
  const fleeBtnHtml = d.status === "fighting" ? `<button type="button" class="btn ${fleeDisabled ? "btn--ghost" : "btn--danger"}" id="btn-flee" ${fleeDisabled ? "disabled" : ""} title="${fleeDisabled && hpPct < 0.2 ? "You are too injured to flee!" : "Escape the delve"}">${escapeHtml(fleeLabel)}</button>` : "";
  const endTurnBtn = canAct ? `<button type="button" class="btn btn--gold" id="btn-end-turn">End Turn</button>` : "";
  const timerHtml = `<div class="turn-timer turn-timer--top${canAct ? "" : " turn-timer--idle"}"><div class="turn-timer-fill" id="turn-timer-fill"></div></div>`;
  const logHtml = `<div class="combat-log">${d.log.slice(-8).map((l) => `<div class="log-line">${escapeHtml(l)}</div>`).join("")}</div>`;

  const isMany = (d.wave && d.wave.length > 3) || (d.totalFloors && d.totalFloors > 1) || (members && members.length > 3);
  const floorInfo = d.totalFloors ? ` · Floor ${d.floor || 1}/${d.totalFloors}` : "";
  root.innerHTML = `
    <div class="combat-wrap ${isMany ? "combat-wrap--many" : ""}">
      <div class="combat-top">
        <p class="subhead">${escapeHtml(d.label || "")} — ${sizeLabel(d.size)}${floorInfo} · Round ${d.round}</p>
        ${timerHtml}
        <div class="combat-actions combat-actions--top">${endTurnBtn}${fleeBtnHtml}</div>
      </div>
      <div class="enemy-wave">${enemiesHtml || '<div class="muted">No foes remain.</div>'}</div>
      <div class="party-row">${partyHtml}</div>
      <div class="skill-bar">${skillsHtml}</div>
      <div class="item-bar">${itemsHtml}</div>
      <div class="combat-hint">${escapeHtml(hint)}${canAct ? ' <span class="muted">[Q-T] skills · [1-5] target · [O] end · [P] flee</span>' : ""}</div>
      ${logHtml}
    </div>
    ${d.result ? renderResultOverlay(d.result, firstChestId(me)) : ""}
  `;
  initImages(root);
  drainCombatFx(root);
  applyCombatZones(root, d && d.rank);

  root.querySelectorAll("[data-skill]").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-skill");
      const basic = (CATALOG.classes.find((c) => c.slug === me.character) || {}).basicAttack;
      const chosen = basic && basic.id === id ? { ...basic, target: "enemy", mana: 0 } : CATALOG.skills.find((s) => s.id === id);
      if (!chosen || !canAct || me.mana < (chosen.mana || 0) || usedIds.includes(id)) return;
      if (chosen.target === "self" || chosen.target === "party") {
        if (!state.pendingUsedSkills) state.pendingUsedSkills = new Set();
        state.pendingUsedSkills.add(chosen.id);
        socket.emit("combat:act", { skillId: chosen.id, targetId: me.id });
        state.selectedSkill = null;
        state.timerReset = true;
        // optimistic re-render to disable
        renderCombat(room, root);
      } else {
        state.selectedSkill = chosen;
        renderCombat(room, root);
      }
    });
  });
  root.querySelectorAll("[data-enemy]").forEach((b) => {
    b.addEventListener("click", () => {
      if (!canAct || !state.selectedSkill || state.selectedSkill.target !== "enemy") return;
      if (!state.pendingUsedSkills) state.pendingUsedSkills = new Set();
      state.pendingUsedSkills.add(state.selectedSkill.id);
      socket.emit("combat:act", { skillId: state.selectedSkill.id, targetId: b.getAttribute("data-enemy") });
      state.selectedSkill = null;
      state.timerReset = true;
      renderCombat(room, root);
    });
  });
  root.querySelectorAll("[data-fighter]").forEach((b) => {
    b.addEventListener("click", () => {
      if (!canAct || !state.selectedSkill || state.selectedSkill.target !== "ally") return;
      socket.emit("combat:act", { skillId: state.selectedSkill.id, targetId: b.getAttribute("data-fighter") });
      state.selectedSkill = null;
      state.timerReset = true;
    });
  });
  root.querySelectorAll("[data-item]").forEach((b) => {
    b.addEventListener("click", () => {
      if (!canAct) return;
      const itemId = b.getAttribute("data-item");
      socket.emit("combat:useItem", { itemId });
      if (itemId === "food") sfxPlay("eatingsound");
      else sfxPlay("potiondrinksound");
      state.timerReset = true;
    });
  });
  const endBtn = root.querySelector("#btn-end-turn");
  if (endBtn) {
    endBtn.addEventListener("click", () => {
      state.timerDeadline = null;
      socket.emit("combat:endTurn");
    });
  }
  const fleeBtn = root.querySelector("#btn-flee");
  if (fleeBtn) {
    fleeBtn.addEventListener("click", () => {
      const hpPct2 = me && me.maxHp ? me.hp / me.maxHp : 0;
      if (hpPct2 < 0.2) {
        showToast("You are too injured to flee!");
        playSfx("block");
        return;
      }
      if (!canAct) {
        showToast("It is not your turn.");
        return;
      }
      state.timerDeadline = null;
      state.selectedSkill = null;
      socket.emit("combat:flee");
    });
  }
  const openChestBtn = root.querySelector("#btn-result-open-chest");
  if (openChestBtn) {
    openChestBtn.addEventListener("click", () => {
      sfxPlay("lootsound");
      socket.emit("chest:open", { itemId: openChestBtn.getAttribute("data-chest-id") });
    });
  }
  const ret = root.querySelector("#btn-result-return");
  if (ret) {
    ret.addEventListener("click", () => {
      state.dungeonOpen = false;
      state.selectedSkill = null;
      state.pendingFx = [];
      stopCombatTimer();
      socket.emit("dungeon:return");
    });
  }
  // Auto-end turn when no usable skill or consumable remains
  if (canAct && !state._autoEndScheduled) {
    const hasUsableSkill = combatLoadout(me).some((s) => s && !usedIds.includes(s.id) && me.mana >= (s.mana || 0));
    const hasUsableItem = (me.food > 0) || (me.inventory || []).some((inv) => {
      const it = CATALOG.items.find((x) => x.id === inv.itemId);
      return it && it.slot === "consumable" && inv.qty > 0;
    });
    if (!hasUsableSkill && !hasUsableItem) {
      state._autoEndScheduled = true;
      setTimeout(() => {
        state._autoEndScheduled = false;
        const curD = myDungeon(state.room);
        // re-check still my turn and still no usable action
        if (curD && curD.status === "fighting" && curD.phase === "players" && curD.currentTurnId === state.playerId) {
          const curMe = state.room && state.room.players.find((p) => p.id === state.playerId);
          const stillNoSkill = curMe ? !combatLoadout(curMe).some((s) => s && !((curD.usedSkills && curD.usedSkills[curMe.id]) || []).includes(s.id) && curMe.mana >= (s.mana || 0)) : true;
          if (stillNoSkill) {
            state.timerDeadline = null;
            socket.emit("combat:endTurn");
          }
        }
      }, 900);
    }
  } else if (!canAct) {
    state._autoEndScheduled = false;
  }
}

function renderResultOverlay(result, chestId) {
  const chestBtn = result.outcome === "victory" && chestId
    ? `<button type="button" class="btn btn--bronze" id="btn-result-open-chest" data-chest-id="${escapeHtml(chestId)}">Open Chest</button>`
    : "";
  return `<div class="result-overlay">
    <div class="result-card${result.outcome === "victory" ? " result-card--victory" : " result-card--defeat"}">
      <h3>${result.outcome === "victory" ? "Victory!" : "Defeat"}</h3>
      <p>${escapeHtml(result.text)}</p>
      ${chestBtn}
      <button type="button" class="btn btn--gold" id="btn-result-return">Return to Town</button>
    </div>
  </div>`;
}
function renderPvpView(room){
  const d=myPvp(room);
  const root=$("pvp-content");
  if(!d){ root.innerHTML='<div class="muted">No duel. Challenge someone from town!</div>'; return; }
  const me=room.players.find(p=>p.id===state.playerId);
  const oppId=d.memberIds.find(id=>id!==state.playerId);
  const opp=room.players.find(p=>p.id===oppId);
  const isMyTurn=d.status==="fighting" && d.currentTurnId===state.playerId;
  const canAct=isMyTurn && me && me.hp>0;
  const usedIds = (d.usedSkills && d.usedSkills[me.id])||[];
  const cdMap = (d.cooldowns && d.cooldowns[me.id])||{};
  const skillsHtml = combatLoadout(me).map((s, si)=>{
    if(!s) return `<div class="skill-slot skill-slot--empty"></div>`;
    const affordable=me.mana>=(s.mana||0);
    const usedNow=usedIds.includes(s.id);
    const cdLeft=cdMap[s.id]||0;
    const disabled=!canAct||!affordable||usedNow||cdLeft>0;
    return `<button type="button" class="skill-slot${disabled?" skill-slot--disabled":""}${usedNow?" skill-slot--used":""}" data-pskill="${s.id}">${"QWERTY"[si] ? `<span class="hotkey">${"QWERTY"[si]}</span>` : ""}${skillTipEl(s)}${skillIconEl(s)}<span class="skill-name">${escapeHtml(s.name)}</span><span class="skill-mana">${s.mana||0} mana</span>${usedNow?'<span class="skill-used-tag">Used</span>':""}${!usedNow&&cdLeft>0?`<span class="skill-used-tag">⏳${cdLeft}</span>`:""}</button>`;
  }).join("");
  const oppFrame=opp && opp.anomaly?` style="--frame:${opp.anomaly.frameColor}"`:"";
  const meFrame=me && me.anomaly?` style="--frame:${me.anomaly.frameColor}"`:"";
  const oppHtml = opp? `<div class="fighter ${opp.hp<=0?"fighter--down":""} ${d.currentTurnId===opp.id?"fighter--turn":""}" style="margin:0 auto;"${oppFrame}>
    <span class="fighter-bg" data-img="${imgFor(opp.character,"class")}" data-variant="${opp.character}"></span>
    <span class="fighter-shade" aria-hidden="true"></span>
    <span class="fighter-meta">
    <span class="fighter-name">${escapeHtml(opp.name)} ${d.currentTurnId===opp.id?'<span class="turn-tag">turn</span>':''}</span>
    <span class="hpbar"><span class="hpbar-fill" style="width:${Math.round(opp.hp/opp.maxHp*100)}%"></span></span><span class="hpnum">${opp.hp}/${opp.maxHp}</span>
    ${opp.shield>0?`<span class="hpbar shieldbar"><span class="hpbar-fill shieldbar-fill" style="width:${Math.round(opp.shield/(opp.maxShield||opp.shield)*100)}%"></span></span><span class="hpnum shieldnum">🛡️ ${opp.shield}</span>`:``}
    <span class="fighter-mana">Mana ${opp.mana}/${opp.maxMana}</span>
    <span class="fighter-pets">${(opp.activePetIds|| (opp.activePetId?[opp.activePetId]:[])).map(pid=>{ const pd=(CATALOG.pets||[]).find(x=>x.id===pid); const pp=(opp.pets||[]).find(x=>x.petId===pid); const lvl=pp?(pp.level||1):1; const img=pd?petImageForLevel(pd,lvl):''; const name=pd?petDisplayName(pd,lvl):pid; return `<span class="pet-icon" data-img="${escapeHtml(img)}" title="${escapeHtml(petTitleText(pd, pp, lvl))}" style="width:1.4rem;height:1.4rem;display:inline-block;border:1px solid var(--glass-line);border-radius:50%;background:var(--glass-2);background-size:cover;background-position:center;vertical-align:middle;margin:0 2px;"></span>`; }).join("")}</span>
    ${buffBadges(d,"player",opp.id)}
    </span>
  </div>` : '<div class="muted">Waiting for opponent...</div>';
  const meHtml = `<div class="fighter ${me.hp<=0?"fighter--down":""} ${d.currentTurnId===me.id?"fighter--turn":""}" style="margin:0 auto;"${meFrame}>
    <span class="fighter-bg" data-img="${imgFor(me.character,"class")}" data-variant="${me.character}"></span>
    <span class="fighter-shade" aria-hidden="true"></span>
    <span class="fighter-meta">
    <span class="fighter-name">${escapeHtml(me.name)} ${d.currentTurnId===me.id?'<span class="turn-tag">turn</span>':''}</span>
    <span class="hpbar"><span class="hpbar-fill hpbar-fill--party" style="width:${Math.round(me.hp/me.maxHp*100)}%"></span></span><span class="hpnum">${me.hp}/${me.maxHp}</span>
    ${me.shield>0?`<span class="hpbar shieldbar"><span class="hpbar-fill shieldbar-fill" style="width:${Math.round(me.shield/(me.maxShield||me.shield)*100)}%"></span></span><span class="hpnum shieldnum">🛡️ ${me.shield}</span>`:``}
    <span class="fighter-mana">Mana ${me.mana}/${me.maxMana}</span>
    <span class="fighter-pets">${(me.activePetIds|| (me.activePetId?[me.activePetId]:[])).map(pid=>{ const pd=(CATALOG.pets||[]).find(x=>x.id===pid); const pp=(me.pets||[]).find(x=>x.petId===pid); const lvl=pp?(pp.level||1):1; const img=pd?petImageForLevel(pd,lvl):''; const name=pd?petDisplayName(pd,lvl):pid; return `<span class="pet-icon" data-img="${escapeHtml(img)}" title="${escapeHtml(petTitleText(pd, pp, lvl))}" style="width:1.4rem;height:1.4rem;display:inline-block;border:1px solid var(--glass-line);border-radius:50%;background:var(--glass-2);background-size:cover;background-position:center;vertical-align:middle;margin:0 2px;"></span>`; }).join("")}</span>
    ${buffBadges(d,"player",me.id)}
    </span>
  </div>`;
  const hint = d.status==="done"? (d.result?d.result.text:"") : isMyTurn? "Your turn — pick a skill." : `Waiting for ${opp?opp.name:"opponent"}...`;
  root.innerHTML=`<div class="combat-wrap">
    <div class="combat-top"><p class="subhead">Duel — Round ${d.round}</p><div class="combat-actions"><button type="button" class="btn btn--ghost" id="btn-pvp-end">End Turn</button><button type="button" class="btn btn--ghost" id="btn-pvp-leave">Leave Duel</button></div></div>
    <div class="enemy-wave" style="flex-direction:column;gap:0.5rem;">${oppHtml}</div>
    <div class="party-row" style="margin-top:0.5rem;">${meHtml}</div>
    <div class="skill-bar">${skillsHtml}</div>
    <div class="combat-hint">${escapeHtml(hint)}${canAct ? ' <span class="muted">[Q-T] skills · [O] end · [P] leave</span>' : ""}</div>
    <div class="combat-log">${d.log.slice(-6).map(l=>`<div class="log-line">${escapeHtml(l)}</div>`).join("")}</div>
    ${d.result? renderResultOverlay(d.result, null).replace('btn-result-return','btn-pvp-return') : '' }
  </div>`;
  initImages(root);
  drainCombatFx(root);
  applyCombatZones(root, null);
  root.querySelectorAll("[data-pskill]").forEach(b=>{
    b.addEventListener("click",()=>{
      const sid=b.getAttribute("data-pskill");
      if(!canAct) return;
      socket.emit("pvp:act",{skillId:sid});
    });
  });
  const endBtn=root.querySelector("#btn-pvp-end");
  if(endBtn) endBtn.addEventListener("click",()=> socket.emit("pvp:endTurn"));
  const leaveBtn=root.querySelector("#btn-pvp-leave");
  if(leaveBtn) leaveBtn.addEventListener("click",()=>{ socket.emit("pvp:leave"); state.pvpOpen=false; renderTown(state.room); });
  const ret=root.querySelector("#btn-pvp-return");
  if(ret) ret.addEventListener("click",()=>{ socket.emit("pvp:leave"); state.pvpOpen=false; renderTown(state.room); });
}

// ---- Tavern ----

function renderTavernView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("tavern-content");
  const t = me.tavern;
  if (t && t.status === "done" && t.won !== undefined) {
    const key = t.game + ":" + (t.message || "");
    if (state.tavernResultKey !== key) {
      state.tavernResultKey = key;
      const title = t.won ? "You Win!" : t.won === null ? "Push" : "You Lose";
      showNotice(t.won ? "win" : t.won === null ? "push" : "lose", title, t.message || "");
    }
  }
  const inGame = t && t.game === "blackjack" && t.status === "playing";

  if (inGame) {
    const handHtml = (hand) => (hand || []).map((c) => `<span class="card">${escapeHtml(c.rank)}</span>`).join("");
    const dealerShown = t.dealerShown || t.status === "done";
    const dealerCards = dealerShown ? t.dealerHand : t.dealerHand.slice(0, 1);
    root.innerHTML = `
      <p class="subhead">Blackjack — ${t.bet} gold</p>
      <div class="card-area">
        <div class="card-row"><span class="muted">Dealer:</span> ${handHtml(dealerCards)}</div>
        <div class="card-row"><span class="muted">You:</span> ${handHtml(t.playerHand)}</div>
      </div>
      <div class="btn-row">
        <button type="button" class="btn" id="btn-hit">Hit</button>
        <button type="button" class="btn btn--bronze" id="btn-stand">Stand</button>
      </div>
      <div class="log-line">${escapeHtml(t.message || "")}</div>`;
    root.querySelector("#btn-hit").addEventListener("click", () => socket.emit("tavern:move", { move: "hit" }));
    root.querySelector("#btn-stand").addEventListener("click", () => socket.emit("tavern:move", { move: "stand" }));
    return;
  }

  const result = t && t.status === "done" ? `<div class="log-line">${escapeHtml(t.message || "")}</div>` : "";
  const prov = (CATALOG.town && CATALOG.town.tavern && CATALOG.town.tavern.provisions) || { foodPrice: 10, foodAmount: 2 };
  root.innerHTML = `
    <p class="subhead">Wagering</p>
    <p class="lead">Pick a wager, then a game. A winning coin flip doubles it; blackjack pays 2.5&times; on a natural.</p>
    ${result}
    <div class="bet-row">
      ${(CATALOG.town.tavern.bets || [5, 10, 25])
        .map((b) => `<button type="button" class="bet-btn${state.bet === b ? " is-selected" : ""}" data-bet="${b}">${b} gold</button>`)
        .join("")}
    </div>
    <div class="btn-row">
      <button type="button" class="btn" id="btn-flip">Coin Flip</button>
      <button type="button" class="btn btn--bronze" id="btn-bj">Blackjack</button>
    </div>
    <div class="provisions-row">
      <span class="muted">Field Rations — ${prov.foodAmount} food</span>
      <button type="button" class="btn btn--bronze btn--mini" id="btn-buy-food">Buy (${prov.foodPrice} gold)</button>
    </div>`;
  root.querySelectorAll("[data-bet]").forEach((b) =>
    b.addEventListener("click", () => {
      state.bet = Number(b.getAttribute("data-bet"));
      renderTavernView(room);
    })
  );
  root.querySelector("#btn-flip").addEventListener("click", () => socket.emit("tavern:start", { game: "coinflip", bet: state.bet }));
  root.querySelector("#btn-bj").addEventListener("click", () => socket.emit("tavern:start", { game: "blackjack", bet: state.bet }));
  root.querySelector("#btn-buy-food").addEventListener("click", () => socket.emit("tavern:buyFood"));
}

// ---- Ancient Temple ----

function rarityBadge(item) {
  const meta = (CATALOG.loot && CATALOG.loot.rarityMeta) || {};
  const r = (item && item.rarity) || "common";
  const m = meta[r];
  return `<span class="rarity-badge" style="--rarity:${m ? m.color : "#9aa7b5"}">${escapeHtml(m ? m.label : r)}</span>`;
}
function chestRatesHtml(item) {
  if (!item || item.slot !== "chest" || !item.chestTier) return "";
  const tier = item.chestTier;
  const weights = (CATALOG.loot && CATALOG.loot.gradeWeights && CATALOG.loot.gradeWeights[tier]) || {};
  const drop = (CATALOG.loot && CATALOG.loot.dropChance) || {};
  const order = (CATALOG.loot && CATALOG.loot.rarityOrder) || [];
  const total = order.reduce((s,r)=> s + (weights[r]||0), 0) || 1;
  const lines = order.map((r)=>{
    const w = weights[r]||0;
    const pct = total ? Math.round((w/total)*1000)/10 : 0;
    const chance = drop[r] ? Math.round(drop[r]*100) : 0;
    if (!pct && !chance) return "";
    return `${(CATALOG.loot.rarityMeta[r]||{}).label||r}: ${pct}% (drop ${chance}%)`;
  }).filter(Boolean).join(" · ");
  return lines ? `<span class="chest-rates" title="${escapeHtml(lines)}">📊 ${escapeHtml(lines)}</span>` : "";
}

function itemOwnedQty(me, itemId) {
  const e = (me.inventory || []).find((i) => i.itemId === itemId);
  return e ? e.qty : 0;
}

function firstChestId(me) {
  const e = (me.inventory || []).find((inv) => {
    const item = CATALOG.items.find((x) => x.id === inv.itemId);
    return item && item.slot === "chest" && inv.qty > 0;
  });
  return e ? e.itemId : null;
}

// ---- Crafting bench (3 slots, multiset match, server authoritative) ----

function craftPlacedMap() {
  const have = {};
  (state.craftSlots || []).forEach((s) => {
    if (s && s.itemId) have[s.itemId] = (have[s.itemId] || 0) + s.qty;
  });
  return have;
}

function matchBenchRecipe(recipes) {
  const have = craftPlacedMap();
  const keys = Object.keys(have);
  if (!keys.length) return null;
  for (const r of recipes || []) {
    const need = {};
    (r.inputs || []).forEach((i) => { need[i.item] = (need[i.item] || 0) + (i.qty || 1); });
    const nk = Object.keys(need);
    if (nk.length !== keys.length) continue;
    if (nk.every((k) => have[k] === need[k])) return r;
  }
  return null;
}

function renderCraftBench(room, me, root) {
  if (!state.craftSlots) {
    state.craftSlots = [null, null, null];
    state.craftSel = 0;
  }
  const recipes = (CATALOG.temple && CATALOG.temple.recipes) || [];
  const st = (CATALOG.town && CATALOG.town.temple && CATALOG.town.temple.stamina) || 2;
  const staminaOk = me.stamina >= st;
  const pack = (me.inventory || [])
    .map((inv) => ({ inv, item: CATALOG.items.find((x) => x.id === inv.itemId) }))
    .filter((e) => e.item && e.item.slot !== "chest" && e.item.slot !== "egg");
  const placed = craftPlacedMap();
  const match = matchBenchRecipe(recipes);
  const canTake = match && staminaOk && me.gold >= ((match.cost && match.cost.gold) || 0) && me.wood >= ((match.cost && match.cost.wood) || 0);

  const slotsHtml = [0, 1, 2].map((i) => {
    const s = state.craftSlots[i];
    const it = s ? CATALOG.items.find((x) => x.id === s.itemId) : null;
    return `<div class="craft-slot${state.craftSel === i ? " craft-slot--sel" : ""}" data-cslot="${i}" title="Slot ${i + 1} — click to select">
      ${it ? `${itemIconEl(it)}<span class="craft-slot-name">${escapeHtml(it.name)}</span><span class="craft-slot-qty">×${s.qty}</span><button type="button" class="craft-slot-x" data-cslot-clear="${i}" title="Empty">×</button>` : `<span class="muted">Empty slot</span>`}
    </div>`;
  }).join("");

  let resultHtml;
  if (match) {
    const out = CATALOG.items.find((x) => x.id === match.output.item);
    resultHtml = `<div class="craft-result craft-result--ok">
      <span>${out ? itemIconEl(out) : ""}</span>
      <span><b>${escapeHtml(out ? out.name : match.output.item)}</b> ×${match.output.qty || 1}${out ? rarityBadge(out) : ""}
      <span class="muted"> — ${(match.cost && match.cost.gold) || 0} gold${(match.cost && match.cost.wood) ? ` + ${match.cost.wood} wood` : ""}</span></span>
      <button type="button" class="btn btn--gold${canTake ? "" : " btn--mini-disabled"}" data-craft-take="${escapeHtml(match.id)}">Take</button>
    </div>`;
  } else if (Object.keys(placed).length) {
    resultHtml = `<div class="craft-result"><span class="muted">That combination makes nothing.</span></div>`;
  } else {
    resultHtml = `<div class="craft-result"><span class="muted">Click a slot, then an item. Click again on the same slot to stack.</span></div>`;
  }

  const pickerHtml = pack.map((e) => {
    const left = e.inv.qty - (placed[e.inv.itemId] || 0);
    return `<button type="button" class="craft-pick${left <= 0 ? " craft-pick--empty" : ""}" data-craft-add="${e.inv.itemId}" ${left <= 0 ? "disabled" : ""} title="${escapeHtml(e.item.name)}">
      ${itemIconEl(e.item)}<span class="craft-pick-name">${escapeHtml(e.item.name)}</span><span class="bag-qty">×${e.inv.qty}</span>
    </button>`;
  }).join("");

  root.innerHTML = `
    <div class="btn-row"><button type="button" class="btn btn--ghost" id="btn-craft-back">← Temple</button></div>
    <p class="subhead">Crafting Bench — 3 slots</p>
    <div class="craft-slots">${slotsHtml}</div>
    ${resultHtml}
    <p class="subhead">Pack (scrollable)</p>
    <div class="craft-picker">${pickerHtml || '<div class="muted">Pack empty.</div>'}</div>`;

  root.querySelector("#btn-craft-back").addEventListener("click", () => {
    state.craftOpen = false;
    renderTempleView(room);
  });
  root.querySelectorAll("[data-cslot]").forEach((el) =>
    el.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-cslot-clear]")) return;
      state.craftSel = Number(el.getAttribute("data-cslot"));
      renderCraftBench(room, me, root);
    })
  );
  root.querySelectorAll("[data-cslot-clear]").forEach((el) =>
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      state.craftSlots[Number(el.getAttribute("data-cslot-clear"))] = null;
      renderCraftBench(room, me, root);
    })
  );
  root.querySelectorAll("[data-craft-add]").forEach((el) =>
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-craft-add");
      const owned = itemOwnedQty(me, id);
      if ((craftPlacedMap()[id] || 0) >= owned) {
        showToast("Not enough items.");
        return;
      }
      const idx = state.craftSel || 0;
      const cur = state.craftSlots[idx];
      if (cur && cur.itemId !== id) {
        showToast("Slot full — empty it or pick another slot.");
        return;
      }
      state.craftSlots[idx] = { itemId: id, qty: (cur ? cur.qty : 0) + 1 };
      sfxPlay("clicksound");
      renderCraftBench(room, me, root);
    })
  );
  const take = root.querySelector("[data-craft-take]");
  if (take) take.addEventListener("click", () => {
    state.craftSlots = [null, null, null];
    sfxPlay("lootsound");
    socket.emit("temple:craft", { recipeId: take.getAttribute("data-craft-take") });
  });
}

function renderTempleView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("temple-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }
  if (state.craftOpen) {
    renderCraftBench(room, me, root);
    return;
  }
  const temple = CATALOG.temple || {};
  const st = (CATALOG.town && CATALOG.town.temple && CATALOG.town.temple.stamina) || 2;
  const staminaOk = me.stamina >= st;
  const maxLives = (CATALOG.temple && CATALOG.temple.maxLives) || 3;
  const baseCls = CATALOG.classes.find((c) => c.slug === me.character);
  const evos = (temple.evolutions || []).filter((e) => e.from === me.character);
  // Tapınak şartları sunucuyla birebir aynı mantık (temple.js evolve):
  // legacy = seviye + relic, level_only = sadece seviye, item_only = sadece
  // eşya, level_and_item = ikisi, level_or_item = seviye ya da eşya.
  const evoReq = (ev) => {
    const t = (ev && ev.requirementType) || "legacy";
    const item = (ev && ev.requiredItem) || "ancient_relic";
    const n = Math.max(1, (ev && ev.requiredItemCount) || 1);
    const lvl = (ev && ev.level) || 20;
    const levelOk = me.level >= lvl;
    const needItem = t === "legacy" || t === "item_only" || t === "level_and_item" || (t === "level_or_item" && !levelOk);
    const def = (CATALOG.items || []).find((x) => x.id === item);
    return { t, item, n, lvl, levelOk, needItem, itemName: def ? def.name : item, owned: itemOwnedQty(me, item) };
  };
  const canEvolve = (ev) => {
    if (!staminaOk || !baseCls) return false;
    const r = evoReq(ev);
    if (!r.levelOk && r.t !== "level_or_item" && r.t !== "item_only") return false;
    if (r.needItem && r.owned < r.n) return false;
    return true;
  };
  const restoreItem = temple.restore || {};
  const canRestore = staminaOk && me.lives < maxLives && itemOwnedQty(me, restoreItem.item) >= 1;
  const heartQty = itemOwnedQty(me, restoreItem.item);
  const recipes = temple.recipes || [];
  const evoReqText = (ev) => {
    const r = evoReq(ev);
    const parts = [];
    if (r.t !== "item_only") parts.push(`Requires level ${r.lvl}+`);
    if (r.needItem) parts.push(`${r.n > 1 ? r.n + "× " : ""}${r.itemName} (${r.owned} owned)`);
    else if (r.t === "level_or_item" && r.levelOk) parts.push(`or ${r.n > 1 ? r.n + "× " : ""}${r.itemName} instead`);
    return parts.join(" · ") || `Requires level ${r.lvl}+`;
  };

  const evoCard = (ev) => `<div class="temple-card temple-card--ascend">
    <p class="subhead">✦ Ascension</p>
    ${baseCls ? `
      <p class="ascend-line"><span>${escapeHtml(baseCls.label)}</span><span class="ascend-arrow">➤</span><strong>${escapeHtml(ev.to.label)}</strong></p>
      <p class="temple-req">${evoReqText(ev)}</p>
      ${ev.skill ? `<p class="temple-skill">Unlocks <strong>${escapeHtml(ev.skill.name)}</strong><span class="muted"> — ${escapeHtml(ev.skill.description)}</span></p>` : ""}
      ${ev.bonusText ? `<p class="temple-bonus">${escapeHtml(ev.bonusText)}</p>` : ""}
    ` : `<p>Your class holds no further form.</p>`}
    <button type="button" class="btn btn--gold${canEvolve(ev) && baseCls ? "" : " btn--mini-disabled"}" data-evolve-to="${escapeHtml(ev.to.slug)}">Ascend${evos.length > 1 ? ` → ${escapeHtml(ev.to.label)}` : ""}</button>
  </div>`;
  const evolveHtml = evos.length
    ? evos.map(evoCard).join("")
    : `<div class="temple-card temple-card--ascend">
    <p class="subhead">✦ Ascension</p>
    <p>Your class holds no further form.</p>
  </div>`;

  const restoreHtml = `<div class="temple-card">
    <p class="subhead">Mend a Heart</p>
    <p>Offer ${escapeHtml(restoreItem.itemName || "a Heart of Golem")} to restore one of your ${maxLives} hearts. You have <strong>${me.lives}/${maxLives}</strong>.</p>
    <p class="temple-req">${escapeHtml(restoreItem.itemName || "Heart of Golem")} owned: ${heartQty}</p>
    <button type="button" class="btn btn--bronze${canRestore ? "" : " btn--mini-disabled"}" id="btn-temple-restore">Restore a Heart</button>
  </div>`;

  const craftHtml = `<div class="temple-card">
    <p class="subhead">Craft</p>
    <button type="button" class="btn btn--gold" id="btn-open-bench">⚒️ Open Workbench (${recipes.length} recipes)</button>
    <div class="craft-grid">${recipes.map((r) => {
      const owned = (r.inputs || []).every((inp) => itemOwnedQty(me, inp.item) >= inp.qty);
      const can = staminaOk && owned && me.gold >= (r.cost.gold || 0) && me.wood >= (r.cost.wood || 0);
      const inputNames = (r.inputs || []).map((inp) => {
        const it = CATALOG.items.find((x) => x.id === inp.item);
        return `${it ? escapeHtml(it.name) : escapeHtml(inp.item)} ×${inp.qty} (${itemOwnedQty(me, inp.item)})`;
      }).join(" + ");
      const out = CATALOG.items.find((x) => x.id === r.output.item);
      return `<div class="craft-row">
        <span class="craft-out">${out ? escapeHtml(out.name) : escapeHtml(r.output.item)} ${out ? rarityBadge(out) : ""}</span>
        <span class="craft-in">${inputNames}</span>
        <span class="craft-cost">${icon("gold")} ${r.cost.gold || 0}${r.cost.wood ? ` ${icon("wood")} ${r.cost.wood}` : ""} · ${escapeHtml(r.description || "")}</span>
        <button type="button" class="btn btn--mini${can ? "" : " btn--mini-disabled"}" data-craft="${escapeHtml(r.id)}">Craft</button>
      </div>`;
    }).join("")}</div>
  </div>`;

  const deadAllies = room.players.filter((p) => p.lives <= 0 && p.id !== me.id);
  const essenceQty = itemOwnedQty(me, "the_essence_of_life");
  const canRevive = staminaOk && essenceQty >= 1;
  const reviveHtml = `<div class="temple-card temple-card--revive">
    <p class="subhead">Revive Ally</p>
    <p>Offer <strong>The Essence of Life</strong> (epic, from Phoenix Canary in Phoenix Sanctum) to revive a fallen ally.</p>
    <p class="temple-req">Essence owned: ${essenceQty} · Stamina ${st} needed</p>
    ${deadAllies.length ? deadAllies.map((p) => `<div class="craft-row"><span class="craft-out">${escapeHtml(p.name)} — Lives ${p.lives}</span><button type="button" class="btn btn--mini${canRevive ? "" : " btn--mini-disabled"}" data-revive="${p.id}">Revive</button></div>`).join("") : `<p class="muted">No fallen allies.</p>`}
  </div>`;

  root.innerHTML = `
    <div class="shop-resources">
      ${chip(icon("gold"), `Gold ${me.gold}`)}
      ${chip(icon("wood"), `Wood ${me.wood}`)}
      ${chip(icon("lives"), `Lives ${me.lives}/${maxLives}`)}
      ${chip(icon("stamina"), `Stamina ${me.stamina}`)}
    </div>
    <p class="subhead">The Ancient Temple remembers a purpose older than the kingdom.</p>
    <div class="temple-grid">${evolveHtml}${restoreHtml}${craftHtml}${reviveHtml}</div>`;

  root.querySelectorAll("[data-evolve-to]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("temple:evolve", { to: b.getAttribute("data-evolve-to") }))
  );
  const benchBtn = root.querySelector("#btn-open-bench");
  if (benchBtn) benchBtn.addEventListener("click", () => {
    state.craftOpen = true;
    state.craftSlots = [null, null, null];
    state.craftSel = 0;
    renderTempleView(room);
  });
  const rsBtn = root.querySelector("#btn-temple-restore");
  if (rsBtn) rsBtn.addEventListener("click", () => socket.emit("temple:restore"));
  root.querySelectorAll("[data-craft]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("temple:craft", { recipeId: b.getAttribute("data-craft") }))
  );
  root.querySelectorAll("[data-revive]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("temple:revive", { targetId: b.getAttribute("data-revive") }))
  );
}

// ---- Shop & Inventory ----

function shopCardHtml(me, staminaOk, item, buyEvent, isSold) {
  const afford = staminaOk && me.gold >= item.price.gold && me.wood >= item.price.wood;
  const owned = itemOwnedQty(me, item.id);
  const equipped = !!(me.equipment && Object.values(me.equipment).includes(item.id));
  const consumable = item.slot === "consumable" || item.slot === "material" || item.slot === "chest";
  let action;
  if (isSold) {
    action = `<button type="button" class="btn btn--mini btn--mini-disabled" disabled>Sold out</button>`;
  } else if (consumable) {
    action = `<button type="button" class="btn btn--mini${afford ? "" : " btn--mini-disabled"}" data-buy="${item.id}">Buy</button>`;
  } else if (equipped) {
    action = `<button type="button" class="btn btn--mini btn--mini-disabled" disabled>Equipped ✓</button>`;
  } else if (owned) {
    action = `<button type="button" class="btn btn--mini" data-equip="${item.id}">Equip</button>`;
  } else {
    action = `<button type="button" class="btn btn--mini${afford ? "" : " btn--mini-disabled"}" data-buy="${item.id}">Buy</button>`;
  }
  const soldBadge = isSold ? `<span class="purchased-badge" style="background:rgba(220,60,60,0.18);border-color:rgba(220,60,60,0.4);color:#ff8a8a">Sold out</span>` : "";
  const ownedBadge = owned > 0
    ? `<span class="purchased-badge">${equipped ? "Equipped" : `Owned ×${owned}`}</span>`
    : "";
  const chestRates = item.slot === "chest" ? chestRatesHtml(item) : "";
  return `<div class="shop-card ${isSold ? "shop-card--sold" : ""}">
    <span class="shop-card-top">${itemIconEl(item)}<span class="shop-card-name">${escapeHtml(item.name)}</span></span>
    <span class="shop-card-badges">${rarityBadge(item)}<span class="purchased-badge">${escapeHtml(slotLabel(item.slot))}</span>${ownedBadge}${soldBadge}</span>
    <span class="shop-card-desc">${escapeHtml(item.description)}</span>
    ${chestRates ? `<span class="shop-card-desc" style="font-size:0.68rem;color:var(--muted)">${chestRates}</span>` : ""}
    <span class="shop-card-price">
      <span class="price-chip">${icon("gold")}<span>${item.price.gold}</span></span>
      ${item.price.wood ? `<span class="price-chip price-chip--wood">${icon("wood")}<span>${item.price.wood}</span></span>` : ""}
    </span>
    ${action}
  </div>`;
}

function shopResources(me) {
  return `
    <div class="shop-resources">
      ${chip(icon("gold"), `Gold ${me.gold}`)}
      ${chip(icon("wood"), `Wood ${me.wood}`)}
      ${chip(icon("food"), `Food ${me.food}`)}
      ${chip(icon("stamina"), `Stamina ${me.stamina}`)}
    </div>`;
}

// Editördeki NPC görseli (images.ui.blacksmithNpc) varsa dükkan başlığında
// gösterilir; yoksa hiçbir şey çizilmez (eski görünüm).
function shopVendorPortrait(uiKey, label) {
  const url = CATALOG.images && CATALOG.images.ui ? CATALOG.images.ui[uiKey] : "";
  if (!url) return "";
  return ` <span class="shop-npc" data-img="${escapeHtml(url)}" data-variant="${escapeHtml(uiKey)}" title="${escapeHtml(label)}"></span>`;
}

function renderBlacksmithView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("blacksmith-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }
  const st = (CATALOG.town && CATALOG.town.blacksmith && CATALOG.town.blacksmith.stamina) || 2;
  const staminaOk = me.stamina >= st;
  const buyable = (CATALOG.loot && CATALOG.loot.buyable) || ["common", "uncommon", "rare"];
  const stockArr = (room.shopStock && room.shopStock.blacksmith) || [];
  const soldSet = (room.shopStock && room.shopStock.sold && room.shopStock.sold.blacksmith) || [];
  const gear = stockArr.length
    ? stockArr.map((id) => (CATALOG.items || []).find((x) => x.id === id)).filter(Boolean)
    : (CATALOG.items || []).filter(
        (i) => i.slot !== "consumable" && i.slot !== "material" && i.slot !== "chest" && buyable.includes(i.rarity) && !i.craftOnly
      );
  // Pinned wares (blueprints): always available, shown first in their own row.
  const pinned = (CATALOG.items || []).filter((i) => i.blueprint && i.price && i.price.gold);
  const rotGear = gear.filter((i) => !(i.blueprint && i.price && i.price.gold));

  root.innerHTML = `
    ${shopResources(me)}
    <p class="subhead shop-head">Armor & Weapons — Week ${room.shopStock ? room.shopStock.week : 1} · ${rotGear.length} items (7 days rotation)${shopVendorPortrait("blacksmithNpc", "Blacksmith")}</p>
    ${pinned.length ? `<p class="subhead">📐 Always in stock — Blueprints</p><div class="shop-grid shop-grid--pinned">${pinned.map((i) => shopCardHtml(me, staminaOk, i, "blacksmith:buy", soldSet.includes(i.id))).join("")}</div>` : ""}
    <div class="shop-grid">${rotGear.map((i) => shopCardHtml(me, staminaOk, i, "blacksmith:buy", soldSet.includes(i.id))).join("") || '<div class="muted">Nothing for sale today.</div>'}</div>
    <div class="btn-row">
      <button type="button" class="btn btn--bronze" id="btn-shop-inventory">Open Inventory</button>
    </div>`;
  initImages(root);

  root.querySelectorAll("[data-buy]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("blacksmith:buy", { itemId: b.getAttribute("data-buy") }))
  );
  root.querySelectorAll("[data-equip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:equip", { itemId: b.getAttribute("data-equip") });
    })
  );
  root.querySelector("#btn-shop-inventory").addEventListener("click", () => {
    sfxPlay("inventorysound");
    state.blacksmithOpen = false;
    state.inventoryOpen = true;
    renderTown(state.room);
  });
}

function renderMerchantView(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("merchant-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }
  const st = (CATALOG.town && CATALOG.town.merchant && CATALOG.town.merchant.stamina) || 1;
  const staminaOk = me.stamina >= st;
  const buyable = (CATALOG.loot && CATALOG.loot.buyable) || ["common", "uncommon", "rare"];
  const stockArr = (room.shopStock && room.shopStock.merchant) || [];
  const soldSetM = (room.shopStock && room.shopStock.sold && room.shopStock.sold.merchant) || [];
  const goods = stockArr.length
    ? stockArr.map((id) => (CATALOG.items || []).find((x) => x.id === id)).filter(Boolean)
    : (CATALOG.items || []).filter(
        (i) => (i.slot === "consumable" || i.slot === "material" || i.slot === "chest") && buyable.includes(i.rarity) && !i.craftOnly
      );

  root.innerHTML = `
    ${shopResources(me)}
    <p class="subhead">Chests, Potions & Materials — Week ${room.shopStock ? room.shopStock.week : 1} · ${stockArr.length} items (7 days rotation)</p>
    <div class="shop-grid">${goods.map((i) => shopCardHtml(me, staminaOk, i, "merchant:buy", soldSetM.includes(i.id))).join("") || '<div class="muted">Nothing for sale today.</div>'}</div>
    <div class="btn-row">
      <button type="button" class="btn btn--bronze" id="btn-merchant-inventory">Open Inventory</button>
    </div>`;
  initImages(root);

  root.querySelectorAll("[data-buy]").forEach((b) =>
    b.addEventListener("click", () => socket.emit("merchant:buy", { itemId: b.getAttribute("data-buy") }))
  );
  root.querySelectorAll("[data-equip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:equip", { itemId: b.getAttribute("data-equip") });
    })
  );
  root.querySelector("#btn-merchant-inventory").addEventListener("click", () => {
    sfxPlay("inventorysound");
    state.merchantOpen = false;
    state.inventoryOpen = true;
    renderTown(state.room);
  });
}

function renderInventory(room) {
  const me = room.players.find((p) => p.id === state.playerId);
  const root = $("inventory-content");
  if (!me) {
    root.innerHTML = "";
    return;
  }

  const slotGlyphs = { weapon: "weapon", head: "helmet", armor: "armor", legs: "legs", boots: "boots", amulet: "amulet", ring1: "ring", ring2: "ring", book: "book", stone: "ring" };
  const slotOrder = {
    left: ["ring1","ring2","amulet"],
    center: ["head","armor","legs","boots"],
    right: ["weapon","book","stone"]
  };
  function statChips(item) {
    if (!item || !item.stats) return "";
    return Object.entries(item.stats)
      .map(([k, v]) => `<span class="stat-chip"><em>${escapeHtml(statLabel(k))}</em><b>${escapeHtml(String(v))}${k === "omnivamp" ? "%" : ""}</b></span>`)
      .join("");
  }
  function renderSlot(id) {
    const slot = (CATALOG.equipmentSlots || []).find((s)=>s.id===id);
    if (!slot) return "";
    const itemId = me.equipment[id];
    const item = itemId ? CATALOG.items.find((x)=>x.id===itemId) : null;
    const chips = statChips(item);
    const isStone = id==="stone";
    const stoneTip = isStone && item ? `<span class="stat-chip"><em>Stack</em><b>Omni ${item.stats.omnivamp || 0}%</b></span>` : "";
    const tip = item ? `${escapeHtml(item.name)}${item.description ? " — " + escapeHtml(item.description) : ""}` : slot.label + " (empty)";
    return `<div class="equip-slot${item ? " equip-slot--filled" : " equip-slot--empty"}" title="${tip}">
        <span class="equip-slot-label">${escapeHtml(slot.label)}</span>
        <span class="equip-socket">${item ? itemIconEl(item) : `<span class="equip-slot-placeholder">${icon(slotGlyphs[id] || "weapon")}</span>`}</span>
        <span class="equip-slot-item">${item ? escapeHtml(item.name) : '<span class="muted">— Empty —</span>'}</span>
        <span class="equip-slot-badges">${item ? rarityBadge(item) : ""}</span>
        <span class="equip-slot-stats">${chips}${stoneTip}</span>
        ${item ? `<button type="button" class="btn btn--mini" data-unequip="${id}">Unequip</button>` : ""}
      </div>`;
  }
  const leftCol = slotOrder.left.map(renderSlot).join("");
  const centerCol = slotOrder.center.map(renderSlot).join("");
  const rightCol = slotOrder.right.map(renderSlot).join("");
  const slots = `<div class="equip-column equip-column--left">${leftCol}</div><div class="equip-column equip-column--center">${centerCol}</div><div class="equip-column equip-column--right">${rightCol}</div>`;

  const bag = (me.inventory || [])
    .filter((inv) => {
      const it = CATALOG.items.find((x) => x.id === inv.itemId);
      return it && it.slot !== "egg";
    })
    .map((inv) => {
      const item = CATALOG.items.find((x) => x.id === inv.itemId);
      if (!item) return "";
      const equipable = item.slot !== "consumable" && item.slot !== "material" && item.slot !== "chest";
      const isChest = item.slot === "chest";
      // Tüccar geri alımı: değerin %60'ı (değer yoksa altın fiyatından).
      const sellUnit = Math.floor((((typeof item.value === "number" && item.value > 0) ? item.value : (item.price && item.price.gold) || 0)) * 0.6);
      const sellBtns = (!isChest && sellUnit > 0)
        ? `<button type="button" class="btn btn--mini" data-sell="${inv.itemId}" data-qty="1" title="Sell to merchant: +${sellUnit} gold">Sell +${sellUnit}g</button>` +
          (inv.qty > 1 ? `<button type="button" class="btn btn--mini" data-sell="${inv.itemId}" data-qty="${inv.qty}" title="Sell all: +${sellUnit * inv.qty} gold">All +${sellUnit * inv.qty}g</button>` : "")
        : "";
      const action = isChest
        ? `<button type="button" class="btn btn--mini" data-open-chest="${inv.itemId}">Open</button>`
        : equipable
        ? `<button type="button" class="btn btn--mini" data-equip="${inv.itemId}">Equip</button>${sellBtns}`
        : `${sellBtns}`;
      const chestRates = item.slot === "chest" ? chestRatesHtml(item) : "";
      const chestPlain = chestRates.replace(/<[^>]*>/g, "");
      const tip = `${escapeHtml(item.name)}${item.description ? " — " + escapeHtml(item.description) : ""}${chestPlain ? " — " + escapeHtml(chestPlain) : ""}`;
      return `<div class="bag-row bag-card" title="${tip}">
        <span class="bag-socket">${itemIconEl(item)}</span>
        <span class="bag-name">${escapeHtml(item.name)} <span class="bag-qty">×${inv.qty}</span></span>
        <span class="bag-badges">${rarityBadge(item)}</span>
        <span class="bag-desc">${escapeHtml(item.description)}</span>
        ${chestRates ? `<span class="bag-rates" title="${escapeHtml(chestPlain)}">${chestRates}</span>` : ""}
        ${action}
      </div>`;
    })
    .join("");
  const equippedCount = Object.values(me.equipment || {}).filter(Boolean).length;
  const slotTotal = (CATALOG.equipmentSlots || []).length || 10;

  root.innerHTML = `
    <div class="shop-resources">
      ${chip(icon("food"), `Food ${me.food}`)}
      ${chip(icon("gold"), `Gold ${me.gold}`)}
      ${chip(icon("wood"), `Wood ${me.wood}`)}
    </div>
    <section class="inv-section">
      <div class="inv-section-head"><span class="subhead" style="margin:0">Equipment</span><span class="inv-count">${equippedCount}/${slotTotal} worn</span></div>
      <div class="equip-grid">${slots}</div>
    </section>
    <section class="inv-section">
      <div class="inv-section-head"><span class="subhead" style="margin:0">Pack</span><span class="inv-count">${(me.inventory || []).length} kinds</span></div>
      <div class="bag-list">${bag || '<div class="muted">Your pack is empty.</div>'}</div>
    </section>`;
  initImages(root);

  root.querySelectorAll("[data-unequip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:unequip", { slot: b.getAttribute("data-unequip") });
    })
  );
  root.querySelectorAll("[data-equip]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("inventory:equip", { itemId: b.getAttribute("data-equip") });
    })
  );
  root.querySelectorAll("[data-open-chest]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("lootsound");
      socket.emit("chest:open", { itemId: b.getAttribute("data-open-chest") });
    })
  );
  root.querySelectorAll("[data-sell]").forEach((b) =>
    b.addEventListener("click", () => {
      sfxPlay("inventorysound");
      socket.emit("merchant:sell", { itemId: b.getAttribute("data-sell"), qty: Number(b.getAttribute("data-qty")) || 1 });
    })
  );
  root.querySelectorAll("[data-hatch]").forEach((b)=>
    b.addEventListener("click", ()=>{
      const eggId=b.getAttribute("data-hatch");
      const eggDef=(CATALOG.items||[]).find(x=>x.id===eggId);
      sfxPlay("clicksound");
      socket.emit("pet:hatch", { eggId }, (res)=>{
        if(!res || !res.ok){
          showToast(res && res.error || "Hatch failed");
          return;
        }
        const petId=res.petId;
        const petDef=(CATALOG.pets||[]).find(x=>x.id===petId);
        const petName=petDef? petDisplayName(petDef, 1) : petId;
        const petImg=petDef? petImageForLevel(petDef, 1) : "";
        if(window.playEggAnimation){
          window.playEggAnimation(eggId, petId, petName, petImg).then(()=>{ sfxPlay("lootsound"); });
        } else {
          sfxPlay("lootsound");
          showNotice("hatch", "Hatched!", petName+" hatched from "+(eggDef?eggDef.name:eggId)+"!");
        }
      });
    })
  );
}
function renderPetsView(room){
  const me=room.players.find(p=>p.id===state.playerId);
  const root=$("pets-content");
  if(!me){ root.innerHTML=""; return; }
  const activeIds = me.activePetIds || (me.activePetId ? [me.activePetId] : []);
  const maxPets = me.character==="tamer" ? 3 : 2;
  const pets = me.pets || [];
  // top slots
  const slots = [];
  for(let i=0;i<maxPets;i++){
    const isMiddle = maxPets===3 && i===1;
    const pid = activeIds[i];
    const pd = pid ? (CATALOG.pets||[]).find(x=>x.id===pid) : null;
    const pp = pid ? pets.find(x=>x.petId===pid) : null;
    const lvl = pp? (pp.level||1) : 1;
    const displayName = pd ? petDisplayName(pd, lvl) : "Empty";
    const img = pd ? petImageForLevel(pd, lvl) : "";
    const stage = petStage(lvl);
    slots.push(`<div class="pet-slot ${pid?"pet-slot--filled":"pet-slot--empty"} ${isMiddle?"pet-slot--middle":""}" data-pet-slot="${i}" title="${pd ? escapeHtml(petTitleText(pd, pp, lvl)) : "Empty slot"}">
      <span class="pet-slot-label">${isMiddle && maxPets===3 ? "Middle" : "Slot "+(i+1)}</span>
      ${pid ? `<span class="pet-socket"><span class="pet-slot-icon" data-img="${escapeHtml(img)}" data-variant="${escapeHtml(pid)}"></span></span><span class="pet-slot-name">${escapeHtml(displayName)}</span><span class="pet-slot-level">Lv ${lvl} · ${stage}</span><button type="button" class="btn btn--mini" data-pet-unequip="${pid}">Unequip</button>` : `<span class="pet-socket pet-socket--empty"><span class="pet-slot-empty">?</span></span><span class="muted" style="font-size:0.68rem">Empty slot</span>`}
    </div>`);
  }
  const petsList = pets.map(pp=>{
    const pd=(CATALOG.pets||[]).find(x=>x.id===pp.petId);
    const isActive = activeIds.includes(pp.petId);
    const lvl = pp.level||1;
    const stage = petStage(lvl);
    const displayName = pd ? petDisplayName(pd, lvl) : pp.petId;
    const img = pd ? petImageForLevel(pd, lvl) : "";
    const statChips = pd && pd.stats ? Object.entries(pd.stats).map(([k,v])=>{ const b = k === "attack" ? (pp.bonusAttack || 0) : k === "magicPower" ? (pp.bonusMagic || 0) : k === "resistance" ? (pp.bonusResist || 0) : 0; return `<span class="stat-chip"><em>${escapeHtml(k)}</em><b>${v + b}</b></span>`; }).join("") : "";
    const petSkills = pd && pd.petSkills ? pd.petSkills.map(s=> `${s.kind} ${s.value}${s.kind==="attack"||s.kind==="heal"||s.kind==="shield"?"":"%"} /${s.interval}t`).join(" · ") : (pd && pd.buffKind ? `${pd.buffKind} (${pd.element})` : "auto");
    const tip = `${escapeHtml(displayName)} — Lv ${lvl} ${stage}${pd && pd.description ? " — " + escapeHtml(stripPetOrigin(pd.description)) : ""}`;
    return `<div class="bag-row pet-card" title="${tip}">
      <span class="bag-socket pet-socket"><span class="item-icon" data-img="${escapeHtml(img)}" data-variant="${escapeHtml(pp.petId)}"></span></span>
      <span class="bag-name">${escapeHtml(displayName)}</span>
      <span class="bag-badges">${isActive?'<span class="badge badge--ready">Active</span>':''}<span class="pet-lvl">Lv ${lvl} · ${stage}</span>${pd && pd.element ? `<span class="pet-el">${escapeHtml(pd.element)}</span>` : ""}</span>
      <span class="bag-desc">${pd?escapeHtml(stripPetOrigin(pd.description)):''}</span>
      <span class="pet-stats">${statChips}<span class="stat-chip"><em>XP</em><b>${pp.xp||0}/${pp.xpToNext||0}</b></span></span>
      <span class="pet-skills">Skills: ${escapeHtml(petSkills)}</span>
      <button type="button" class="btn btn--mini" data-pet-active="${pp.petId}">${isActive?'Unequip':'Equip'}</button>
    </div>`;
  }).join("");
  const eggs = (me.inventory||[]).filter(inv=>{
    const it=(CATALOG.items||[]).find(x=>x.id===inv.itemId);
    return it && it.slot==="egg";
  });
  const eggsList = eggs.map(inv=>{
    const it=(CATALOG.items||[]).find(x=>x.id===inv.itemId);
    const eggDef=(CATALOG.eggs||[]).find(x=>x.id===inv.itemId);
    const tip = `${escapeHtml(it.name)}${it.description ? " — " + escapeHtml(it.description) : ""}`;
    return `<div class="bag-row bag-card egg-card" title="${tip}">
      <span class="bag-socket egg-socket">${itemIconEl(it)}</span>
      <span class="bag-name">${escapeHtml(it.name)} <span class="bag-qty">×${inv.qty}</span></span>
      <span class="bag-badges">${rarityBadge(it)}</span>
      <span class="bag-desc">${it?escapeHtml(it.description):''}</span>
      ${eggDef?`<span class="egg-meta">${escapeHtml(eggDef.label)} · ${eggDef.pets.length} pets · 3 clicks</span>`:""}
      <button type="button" class="btn btn--mini" data-hatch="${inv.itemId}">Hatch</button>
    </div>`;
  }).join("");
  root.innerHTML = `
    <section class="inv-section">
      <div class="inv-section-head"><span class="subhead" style="margin:0">Equipped Pets (${activeIds.length}/${maxPets}) ${me.character==="tamer"?"— Tamer 2× bonus!":""}</span></div>
      <div class="pets-top">
        <div class="pet-slots ${maxPets===3?"pet-slots--3":""}">${slots.join("")}</div>
      </div>
    </section>
    <section class="inv-section">
      <div class="inv-section-head"><span class="subhead" style="margin:0">Eggs</span><span class="inv-count">${eggs.length} to hatch</span></div>
      <div class="bag-list">${eggsList || '<div class="muted">No eggs. Win dungeons to find Red–Gold eggs!</div>'}</div>
    </section>
    <section class="inv-section">
      <div class="inv-section-head"><span class="subhead" style="margin:0">Collection</span><span class="inv-count">${pets.length} pets</span></div>
      <div class="bag-list">${petsList || '<div class="muted">No pets yet. Hatch eggs above!</div>'}</div>
      <p class="hint">Baby Lv 1-7 · Young Lv 8+ · Adult Lv 15+. Tamers hold 3, others 2.</p>
    </section>
  `;
  initImages(root);
  root.querySelectorAll("[data-pet-unequip]").forEach(b=> b.addEventListener("click", ()=>{ sfxPlay("clicksound"); socket.emit("pet:setActive", {petId: b.getAttribute("data-pet-unequip")}); }));
  root.querySelectorAll("[data-pet-active]").forEach(b=> b.addEventListener("click", ()=>{ sfxPlay("clicksound"); socket.emit("pet:setActive", {petId: b.getAttribute("data-pet-active")}); }));
  root.querySelectorAll("[data-hatch]").forEach(b=> b.addEventListener("click", ()=>{
    const eggId=b.getAttribute("data-hatch");
    console.log("[hatch] clicked", eggId, "playEggAnimation", typeof window.playEggAnimation);
    sfxPlay("clicksound");
    let cbFired=false;
    const timeout = setTimeout(()=>{
      if(cbFired) return;
      console.warn("[hatch] cb timeout, playing anim without pet");
      if(window.playEggAnimation){
        window.playEggAnimation(eggId, null, "Mystery Pet", "").then(()=>{ sfxPlay("lootsound"); });
      }
    }, 1500);
    socket.emit("pet:hatch", {eggId}, (res)=>{
      cbFired=true; clearTimeout(timeout);
      console.log("[hatch] cb", res);
      if(!res || !res.ok){ showToast(res && res.error || "Hatch failed"); console.error(res); return; }
      const petId=res.petId;
      const petDef=(CATALOG.pets||[]).find(x=>x.id===petId);
      const petName=petDef? petDisplayName(petDef,1): petId;
      const petImg=petDef? petImageForLevel(petDef,1): "";
      console.log("[hatch] pet", petId, petName);
      try{
        if(window.playEggAnimation){
          console.log("[hatch] playing anim");
          const p=window.playEggAnimation(eggId, petId, petName, petImg);
          if(p && p.then) p.then(()=>{ console.log("[hatch] anim done"); sfxPlay("lootsound"); });
          else console.log("[hatch] no promise");
        } else {
          console.warn("playEggAnimation missing");
          sfxPlay("lootsound");
          showNotice("hatch","Hatched!", petName+" hatched from "+eggId+"!");
        }
      }catch(e){ console.error("anim error", e); showNotice("hatch","Hatched!", petName+" hatched!"); }
    });
  }));
}
 

// ---- Map ----
let mapState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
function openMap() {
  const room = state.room;
  if (!room) return;
  $("map-overlay").classList.remove("hidden");
  renderMap(room);
  sfxPlay("clicksound");
}
function closeMap() {
  $("map-overlay").classList.add("hidden");
}
function renderMap(room) {
  const pinsEl = $("map-pins");
  if (!pinsEl) return;
  const bosses = (CATALOG.bosses || []);
  const me = room.players.find((p)=>p.id===state.playerId);
  const kills = (me && me.bossKills) || [];
  // Add subtle random texture dots via inline style (already in CSS, but add extra visual)
  const inner = $("map-inner");
  if (inner && !inner.dataset.textured) {
    inner.dataset.textured = "1";
    // random dots already via CSS, no extra JS needed
  }
  pinsEl.innerHTML = bosses.map((b,i)=>{
    const n = bosses.length;
    // Sabit slotlar: ilk boss %12'de, her boss +15 puan sağda. Yeni boss en
    // sağa eklenir, eskiler kımıldamaz. Tek boss ortalanır.
    const x = n === 1 ? 50 : 12 + i * 15;
    const y = 50 + Math.sin(i*0.9)*12;
    const locked = b.unlockAfter && !kills.includes(b.unlockAfter);
    const icon = b.element==="fire"?"🔥":b.element==="frost"?"❄️":b.element==="shadow"?"👁️":b.element==="arcane"?"⚡":"💀";
    return `<div class="map-pin ${locked?"locked":""} map-pin--boss" data-boss="${b.id}" style="left:${x}%;top:${y}%" title="${escapeHtml(b.label)} — Click to challenge${locked?" (locked)":""}">
      <span>${icon}</span>
      <span class="map-pin-label">${escapeHtml(b.label)}${locked?" 🔒":""}</span>
    </div>`;
  }).join("");
  // Reset transform
  mapState.scale = 1; mapState.x=0; mapState.y=0;
  // Harita boss sayısına göre sağa büyür (yeni boss her zaman en sağda).
  const n = bosses.length;
  const mapW = n <= 1 ? 100 : 12 + (n - 1) * 15 + 12;
  if (inner) inner.style.width = Math.max(100, mapW) + "%";
  const route = inner ? inner.querySelector(".map-route") : null;
  if (route && n > 1) {
    route.style.left = "12%";
    route.style.width = ((n - 1) * 15) + "%";
  }
  updateMapTransform();
  pinsEl.querySelectorAll("[data-boss]").forEach((el)=>{
    el.addEventListener("click", ()=>{
      const bid = el.getAttribute("data-boss");
      const b = (CATALOG.bosses||[]).find(x=>x.id===bid);
      if (!b) return;
      if (el.classList.contains("locked")) { showToast("Defeat the previous boss first."); playSfx("block"); return; }
      // Check if boss dungeon already has a fighting party (single party per boss)
      const bossRank = bid; // boss id same as dungeon rank for new boss dungeons
      const existingBossDungeon = (room.dungeons||[]).find(x=>x.rank===bossRank && x.status==="fighting");
      if (existingBossDungeon) { showToast("Another fight is already running on this boss."); return; }
      const existingWaiting = (room.dungeons||[]).find(x=>x.rank===bossRank && x.status==="forming");
      if (existingWaiting) {
        socket.emit("dungeon:joinById", {dungeonId: existingWaiting.id});
      } else {
        socket.emit("dungeon:create", {rank: bossRank, size: "normal"});
      }
      state.dungeonOpen = true;
      closeMap();
    });
  });
}
function updateMapTransform() {
  const inner = $("map-inner");
  const vp = $("map-viewport");
  if (!inner || !vp) return;
  // clamp panning so you cannot go infinitely (geniş haritada sağa daha fazla)
  const overX = Math.max(0, (inner.offsetWidth || 0) - (vp.clientWidth || 0));
  const maxRight = (120 + overX) * mapState.scale;
  const maxLeft = 120 * mapState.scale;
  const maxY = 80 * mapState.scale;
  mapState.x = Math.max(-maxRight, Math.min(maxLeft, mapState.x));
  mapState.y = Math.max(-maxY, Math.min(maxY, mapState.y));
  inner.style.transform = `translate(${mapState.x}px, ${mapState.y}px) scale(${mapState.scale})`;
}
function initMapInteractions() {
  const vp = $("map-viewport");
  const inner = $("map-inner");
  if (!vp || !inner) return;
  // Zoom wheel
  vp.addEventListener("wheel", (e)=>{
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    mapState.scale = Math.min(1.8, Math.max(0.6, mapState.scale + delta));
    updateMapTransform();
  }, {passive:false});
  // Middle mouse or left drag
  let isDragging=false;
  vp.addEventListener("mousedown", (e)=>{
    if (e.button!==0 && e.button!==1) return;
    isDragging=true; vp.style.cursor="grabbing";
    mapState.lastX=e.clientX; mapState.lastY=e.clientY;
  });
  window.addEventListener("mouseup", ()=>{ isDragging=false; if(vp) vp.style.cursor="grab"; });
  window.addEventListener("mousemove", (e)=>{
    if (!isDragging) return;
    const dx = e.clientX - mapState.lastX;
    const dy = e.clientY - mapState.lastY;
    mapState.x += dx; mapState.y += dy;
    mapState.lastX=e.clientX; mapState.lastY=e.clientY;
    updateMapTransform();
  });
  // Touch pinch
  let lastDist=0;
  vp.addEventListener("touchstart", (e)=>{
    if (e.touches.length===2) {
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      lastDist=Math.hypot(dx,dy);
    } else if (e.touches.length===1) {
      isDragging=true;
      mapState.lastX=e.touches[0].clientX;
      mapState.lastY=e.touches[0].clientY;
    }
  }, {passive:false});
  vp.addEventListener("touchmove", (e)=>{
    e.preventDefault();
    if (e.touches.length===2) {
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      const dist=Math.hypot(dx,dy);
      if (lastDist) {
        const delta=(dist-lastDist)*0.005;
        mapState.scale=Math.min(1.8,Math.max(0.6,mapState.scale+delta));
        updateMapTransform();
      }
      lastDist=dist;
    } else if (e.touches.length===1 && isDragging) {
      const dx=e.touches[0].clientX-mapState.lastX;
      const dy=e.touches[0].clientY-mapState.lastY;
      mapState.x+=dx; mapState.y+=dy;
      mapState.lastX=e.touches[0].clientX; mapState.lastY=e.touches[0].clientY;
      updateMapTransform();
    }
  }, {passive:false});
  vp.addEventListener("touchend", ()=>{ isDragging=false; lastDist=0; });
  $("map-close")?.addEventListener("click", closeMap);
  $("map-zoom-in")?.addEventListener("click", ()=>{ mapState.scale=Math.min(1.8,mapState.scale+0.15); updateMapTransform(); });
  $("map-zoom-out")?.addEventListener("click", ()=>{ mapState.scale=Math.max(0.6,mapState.scale-0.15); updateMapTransform(); });
  $("btn-map")?.addEventListener("click", openMap);
}
setTimeout(initMapInteractions, 500);

// ---- Chat ----

function chatMessageEl(msg) {
  const div = document.createElement("div");
  div.className = "chat-msg" + (msg.senderId === state.playerId ? " chat-msg--me" : "");
  const name = document.createElement("span");
  name.className = "chat-name";
  name.textContent = msg.name;
  const text = document.createElement("span");
  text.className = "chat-text";
  text.textContent = msg.text;
  div.appendChild(name);
  div.appendChild(text);
  return div;
}

function renderChatHistory(msgs) {
  const body = $("chat-body");
  body.innerHTML = "";
  (msgs || []).forEach((m) => body.appendChild(chatMessageEl(m)));
  body.scrollTop = body.scrollHeight;
}

function addChatMessage(msg) {
  const body = $("chat-body");
  body.appendChild(chatMessageEl(msg));
  while (body.children.length > 80) {
    body.removeChild(body.firstChild);
  }
  body.scrollTop = body.scrollHeight;
}

