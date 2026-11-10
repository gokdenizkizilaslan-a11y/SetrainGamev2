/* =====================================================================
 * Setra Shader FX â€” ekran-Ã¼stÃ¼ atmosfer / Ä±ÅŸÄ±k shader katmanÄ±
 * ---------------------------------------------------------------------
 * Oyun 2D Canvas ile Ã§izilir (3D GLB'ler trees3d.js ile sprite'a piÅŸirilir).
 * Bu modÃ¼l o tuvalin ÃœSTÃœNE iki WebGL katmanÄ± bindirir:
 *
 *   1) GRADE katmanÄ±  (mix-blend-mode: soft-light)
 *      â†’ biyoma + saate gÃ¶re renk derecelendirme, uzaklÄ±k pusu, vignette,
 *        yÃ¼zey mikro detayÄ± (doku hissi), film greni.
 *   2) LIGHT katmanÄ±  (mix-blend-mode: screen)
 *      â†’ kadraj dÄ±ÅŸÄ±ndan gelen Ä±ÅŸÄ±k, ince tanrÄ± Ä±ÅŸÄ±nlarÄ±, bÃ¼yÃ¼/meÅŸale
 *        glow'larÄ± ve (kaliteye gÃ¶re) seÃ§ici bloom.
 *
 * GÃœVENLÄ°K / GERÄ° ALINABÄ°LÄ°RLÄ°K
 *  - HiÃ§bir oyun kodunu deÄŸiÅŸtirmez; yalnÄ±zca gÃ¶rsel katman ekler.
 *  - WebGL yoksa, shader derlenmezse veya blend-mode desteklenmezse
 *    katmanlar hiÃ§ oluÅŸturulmaz â†’ oyun %100 eski hÃ¢linde Ã§alÄ±ÅŸÄ±r.
 *  - Bloom yolu (2D kÃ¼Ã§Ã¼k kopya + doku yÃ¼kleme) herhangi bir nedenle
 *    Ã§alÄ±ÅŸmazsa SADECE bloom kapanÄ±r, diÄŸer efektler devam eder.
 *  - F9 (veya Ayarlar > Atmosphere) ile tek tuÅŸla kapanÄ±r;
 *    tercih localStorage'a yazÄ±lÄ±r.
 *  - AÄŸÄ±r karelerde kalite otomatik dÃ¼ÅŸer.
 *
 * KullanÄ±m:
 *   SetraShaderFX.present(engine)   // travelEngine dÃ¶ngÃ¼sÃ¼ her karede Ã§aÄŸÄ±rÄ±r
 *   SetraShaderFX.toggle()          // aÃ§/kapat (F9)
 *   SetraShaderFX.setQuality('light'|'normal'|'extreme')
 *   SetraShaderFX.setHour(18.5)     // saat elle ayarla (Live3D yoksa geÃ§erli)
 *   SetraShaderFX.glow(x, y, r, '#c0a2ff', 600)  // ekran px cinsinden
 *
 * NOT: yorumlar ASCII guvenli yazilir (dosya encoding'i bozulmasin).
 * ===================================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  if (window.SetraShaderFX) return; // iki kez yÃ¼klenirse ilkini koru

  // ------------------------------------------------------------------
  // AYARLAR (kalÄ±cÄ±)
  // ------------------------------------------------------------------
  var STORE_KEY = 'setra.shaderfx.v1';
  var state = {
    enabled: true,
    quality: 'normal',
    failed: false,       // geri dÃ¶nÃ¼ÅŸÃ¼ olmayan hata (bu oturum iÃ§in kapalÄ±)
    attached: null,      // baÄŸlÄ± olduÄŸumuz game canvas
    reason: '',
    hour: 16.2,          // Live3D yoksa kullanÄ±lan varsayÄ±lan saat
  };

  (function loadPrefs() {
    try {
      var raw = window.localStorage && localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        if (typeof o.enabled === 'boolean') state.enabled = o.enabled;
        if (o.quality === 'light' || o.quality === 'normal' || o.quality === 'extreme') state.quality = o.quality;
        if (isFinite(Number(o.hour))) state.hour = ((Number(o.hour) % 24) + 24) % 24;
      }
    } catch (e) { /* bozuk kayÄ±t â†’ varsayÄ±lan */ }
  })();

  function savePrefs() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        enabled: !!state.enabled,
        quality: state.quality,
        hour: state.hour,
      }));
    } catch (e) { /* gizli mod / kota â†’ sessizce geÃ§ */ }
  }

  // ------------------------------------------------------------------
  // ATMOSFER AYARI (canlÄ± slider'lar â€” oyun da aynÄ± deÄŸerleri kullanÄ±r)
  //   1 = mevcut gÃ¶rÃ¼nÃ¼m. night > 1 â†’ daha karanlÄ±k gece.
  //   Grade katmanÄ±: fog / vignette / night / exposure
  //   Light katmanÄ±: rays / bloom
  // ------------------------------------------------------------------
  var TUNE_KEY = 'setra.shaderfx.tune';
  var TUNE_DEFAULT = { fog: 0.90, bloom: 0.70, vignette: 0.90, rays: 0.60, night: 1.0, exposure: 1.0 };
  var TUNE_RANGE = {
    fog: [0, 3], bloom: [0, 3], vignette: [0, 2],
    rays: [0, 3], night: [0.2, 3], exposure: [0.4, 2],
  };
  var tune = {};

  function tuneClamp(key, v) {
    var r = TUNE_RANGE[key] || [0, 3];
    var n = Number(v);
    if (!isFinite(n)) return TUNE_DEFAULT[key];
    return n < r[0] ? r[0] : n > r[1] ? r[1] : n;
  }

  (function loadTune() {
    var k;
    for (k in TUNE_DEFAULT) tune[k] = TUNE_DEFAULT[k];
    try {
      var raw = window.localStorage && localStorage.getItem(TUNE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return;
      for (k in TUNE_DEFAULT) {
        if (!(k in o)) continue;
        var v = Number(o[k]);
        if (isFinite(v)) tune[k] = tuneClamp(k, v);
      }
    } catch (e) { /* bozuk kayÄ±t â†’ varsayÄ±lan */ }
  })();

  function saveTune() {
    try { localStorage.setItem(TUNE_KEY, JSON.stringify(tune)); } catch (e) { /* yoksay */ }
  }

  function getTune() {
    return {
      fog: tune.fog, bloom: tune.bloom, vignette: tune.vignette,
      rays: tune.rays, night: tune.night, exposure: tune.exposure,
    };
  }

  // setTune({ fog: 1.4, ... }) â†’ clamp + kaydet. Girilmeyenler korunur.
  function setTune(patch) {
    try {
      if (patch && typeof patch === 'object') {
        for (var k in TUNE_DEFAULT) {
          if (!(k in patch)) continue;
          var v = Number(patch[k]);
          if (!isFinite(v)) continue;
          tune[k] = tuneClamp(k, v);
        }
        saveTune();
      }
    } catch (e) { /* yoksay */ }
    return getTune();
  }

  function resetTune() {
    try {
      for (var k in TUNE_DEFAULT) tune[k] = TUNE_DEFAULT[k];
      saveTune();
    } catch (e) { /* yoksay */ }
    return getTune();
  }

  // Kalite kademeleri: fill-rate ve efekt maliyetini belirler.
  //   rays  : tanrÄ± Ä±ÅŸÄ±nÄ± gÃ¼cÃ¼        (light = Ä±ÅŸÄ±n YOK)
  //   bloom : 0 = kapalÄ±, >0 = bloom  (light = bloom YOK, normal = zayÄ±f)
  //   grain : film greni              (belirgin ÅŸekilde sadece extreme)
  var PRESETS = {
    light:   { scale: 0.55, maxW: 900,  rays: 0.00, grain: 0.000, detail: 0.35, sparkle: 0.00, glow: 0.50, grade: 0.85, vig: 0.60, sun: 0.55, bloom: 0.00, bloomSpread: 1.4, fogK: 0.85 },
    normal:  { scale: 0.72, maxW: 1200, rays: 0.00, grain: 0.006, detail: 0.65, sparkle: 0.30, glow: 0.85, grade: 1.00, vig: 0.85, sun: 1.00, bloom: 0.60, bloomSpread: 1.7, fogK: 1.10 },
    extreme: { scale: 1.00, maxW: 1600, rays: 1.20, grain: 0.022, detail: 0.85, sparkle: 0.75, glow: 1.10, grade: 1.15, vig: 1.00, sun: 1.20, bloom: 1.00, bloomSpread: 2.6, fogK: 1.20 },
  };

  // Biyom kimliÄŸi tanÄ±nmÄ±yorsa buraya dÃ¼ÅŸÃ¼lÃ¼r.
  var BIOME_DEFAULT = {
    sun: [0.24, -0.06],
    raysMul: 1.0,
    sparkleMul: 0.6,
    fogMul: 1.0,
  };
  // Biyom karakteri: sun = yatay/dikey sapma (saat ile hesaplanan konuma
  // hafifce karisir), raysMul / sparkleMul = isin ve parilti karakteri.
  // Isik her durumda kadrajin USTUNDEN (uv.y < 0) gelir; ekranda yapay
  // bir parlak nokta olusmaz.
  var BIOMES = {
    verdant: { sun: [0.20, -0.06], raysMul: 1.10, sparkleMul: 0.55, fogMul: 0.85 },
    frost:   { sun: [0.73, -0.04], raysMul: 0.65, sparkleMul: 1.20, fogMul: 1.15 },
    swamp:   { sun: [0.28, -0.02], raysMul: 0.50, sparkleMul: 0.90, fogMul: 1.35 },
    cursed:  { sun: [0.61, -0.08], raysMul: 0.45, sparkleMul: 0.20, fogMul: 1.45 },
    ashen:   { sun: [0.34, -0.03], raysMul: 1.35, sparkleMul: 0.60, fogMul: 1.30 },
  };

  // Gece / alacakaranlÄ±k tonlarÄ± (soft-light kaynak deÄŸeri uzayÄ±nda).
  var MOON_TONE = [0.50, 0.61, 0.92];   // soÄŸuk ay tonu
  var COLD_FOG = [0.44, 0.53, 0.74];    // gece pusunun soÄŸuk rengi

  // ------------------------------------------------------------------
  // RENK YARDIMCILARI
  // ------------------------------------------------------------------
  function hexToRgb(hex, fallback) {
    var h = String(hex || '');
    if (h.charAt(0) === '#') h = h.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return fallback || [0.5, 0.5, 0.5];
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }
  function mix3(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ------------------------------------------------------------------
  // SHADER KAYNAKLARI (WebGL1 / GLSL ES 1.00)
  // ------------------------------------------------------------------
  var VERT_SRC = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main(){',
    '  vUv = aPos * 0.5 + 0.5;',
    '  gl_Position = vec4(aPos, 0.0, 1.0);',
    '}',
  ].join('\n');

  var FRAG_SRC = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'varying vec2 vUv;',
    'uniform vec2  uRes;',
    'uniform float uTime;',
    'uniform float uMode;',
    'uniform vec4  uSun;',      // xy = ekran uv (kadraj disi), z = siddet, w = isin gucu
    'uniform vec3  uWarm;',
    'uniform vec3  uCool;',
    'uniform vec3  uFog;',
    'uniform vec4  uGrade;',    // x guc, y vignette, z gren, w detay
    'uniform vec4  uTone;',     // x gece karartma, y kontrast, z pus, w gece (0..1)
    'uniform float uSparkle;',
    'uniform float uSeed;',
    'uniform float uBloomAmt;',
    'uniform float uBloomTh;',
    'uniform float uBloomSpread;',
    'uniform vec2  uBloomTexel;',
    'uniform sampler2D uBloom;',
    'uniform vec4  uGlow[6];',  // xy uv, z yaricap, w siddet
    'uniform vec3  uGlowCol[6];',
    'uniform vec4  uTune;',     // x pus, y vignette, z gece karartma, w pozlama (hepsi 1 = mevcut)
    '',
    'float hash21(vec2 p){',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32);',
    '  return fract(p.x * p.y);',
    '}',
    'float vnoise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  float a = hash21(i);',
    '  float b = hash21(i + vec2(1.0, 0.0));',
    '  float c = hash21(i + vec2(0.0, 1.0));',
    '  float d = hash21(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
    '}',
    'float fbm2(vec2 p){',
    '  return vnoise(p) * 0.62 + vnoise(p * 2.07 + 11.3) * 0.38;',
    '}',
    'float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }',
    '',
    'void main(){',
    "  /* vUv: GL tarafinda y yukari bakar; ekran uzayina cevir (y asagi) ki",
    '     konumu, pus ve isin yonleri CSS/ekran koordinatiyla ayni olsun. */',
    '  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);',
    '  float aspect = uRes.x / max(uRes.y, 1.0);',
    '  vec2 sd = (uv - uSun.xy) * vec2(aspect, 1.0);',
    '  float sunD = length(sd);',
    '  float night = clamp(uTone.w, 0.0, 1.0);',
    '',
    '  if (uMode < 0.5) {',
    '    /* ---------- RENK DERECELENDIRME (soft-light) ---------- */',
    '    vec2 d = (uv - 0.5) * vec2(aspect, 1.0);',
    '    float r = clamp(length(d) * 1.30, 0.0, 1.35);',
    '',
    '    /* Isik kadrajin ustunden gelir: ust kisim daha aydinlik. Gece',
    '       bu aydinlik iyice cekilir. */',
    '    float lift = clamp(exp(-sunD * sunD * 1.30) * 0.45 + (1.0 - uv.y) * 0.30, 0.0, 1.15);',
    '    lift *= 1.0 - night * 0.72;',
    '    float shadow = clamp(r * 1.02, 0.0, 1.0);',
    '',
    '    vec3 col = vec3(0.5);',
    '    col += (uWarm - vec3(0.5)) * (lift * 0.34) * uGrade.x;',
    '    col += (uCool - vec3(0.5)) * (shadow * (0.26 + night * 0.10)) * uGrade.x;',
    '',
    '    /* Kontrast notr nokta (0.5) etrafinda genisletilir; ardindan gece',
    '       taban asagi cekilir. soft-light tabani 0.5 -> karartma yok,',
    '       taban 0.10 -> orta tonlar/golgeler sertce kararir. */',
    '    col = 0.5 + (col - 0.5) * uTone.y;',
    '    col -= vec3(uTone.x);',
    '',
    '    /* Pus: duz dikey gradyan degil; sahnenin UST kisminda yogunlasan,',
    '       yavasca dalgalanan yumusak bir uzaklik hissi. Rengi biyom',
    '       pus renginden gelir, gece daha soguk ve daha gucludur. */',
    '    float top = smoothstep(0.70, -0.04, uv.y);',
    '    float wob = fbm2(vec2(uv.x * aspect * 1.7, uv.y * 2.6) + vec2(uTime * 0.013, uTime * 0.007));',
    '    float haze = clamp(top * (0.48 + wob * 0.90), 0.0, 1.0);',
    '    haze = pow(haze, 1.25);',
    '    float fogK = clamp(haze * uTone.z * 0.34 * uGrade.x * uTune.x, 0.0, 0.92);',
    '    col = mix(col, uFog, fogK);',
    '',
    '    /* Vignette: gunduz cok hafif, gece belirgin. En fazla ~%30. */',
    '    float vign = smoothstep(0.52, 1.06, r) * uGrade.y * (0.16 + night * 0.14) * uTune.y;',
    '    col -= vec3(clamp(vign, 0.0, 0.72));',
    '',
    '    float det = fbm2(uv * uRes * 0.20 + uSeed) - 0.5;',
    '    col += det * uGrade.w * 0.055;',
    '',
    '    float g = hash21(uv * uRes * 0.75 + fract(uTime) * 271.0) - 0.5;',
    '    col += g * uGrade.z;',
    '',
    '    /* Gece karartma carpani: uTune.z = 1 -> mevcut, >1 -> daha karanlik,',
    '       <1 -> daha aydinlik (ay isigi). Sadece gece oraninda etkili. */',
    '    float nk = clamp(1.0 + (uTune.z - 1.0) * night * 0.5, 0.45, 2.20);',
    '    col /= nk;',
    '',
    '    /* Pozlama: soft-light kaynagini 0.5 merkezinden uzaklastir. */',
    '    col = 0.5 + (col - 0.5) * uTune.w;',
    '',
    '    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);',
    '    return;',
    '  }',
    '',
    '  /* ---------- ISIK / ATMOSFER (screen) ---------- */',
    '  /* Isik kaynagi kadrajin DISINDA (uv.y < 0). Bu yuzden cekirdek/hale',
    '     cok kucuk tutulur: zeminde "lamba" gibi parlayan yapay nokta yok,',
    '     yalnizca ust kenardan sizan atmosfer isigi var. */',
    '  float core = exp(-sunD * sunD * 34.0) * uSun.z * 0.05;',
    '  float halo = exp(-sunD * sunD * 3.2) * uSun.z * 0.07;',
    '',
    '  /* Tanri isinlari: ince, dusuk yogunluklu ve yumusak. */',
    '  vec2 dir = sd / max(sunD, 0.0001);',
    '  float dapple = fbm2(dir * 6.0 + uv * 2.2 + vec2(uTime * 0.014, uTime * 0.010));',
    '  float shafts = smoothstep(0.64, 0.99, dapple);',
    '  float falloff = pow(max(0.0, 1.0 - sunD * 0.95), 2.4);',
    '  float rays = shafts * falloff * uSun.w * 0.34;',
    '  vec3 col = uWarm * (core + halo + rays);',
    '',
    '  if (uSparkle > 0.001) {',
    '    float band = smoothstep(0.34, 0.80, uv.y) * 0.8;',
    '    vec2 sp = uv * vec2(uRes.x * 0.055, uRes.y * 0.20);',
    '    float n = vnoise(sp + vec2(uTime * 0.20, -uTime * 0.11));',
    '    n = pow(n, 24.0);',
    '    col += mix(uWarm, uFog, 0.55) * n * band * uSparkle * 0.35;',
    '  }',
    '',
    '  /* Glow / mesale / kamp atesi: ters-kare benzeri yumusak dusus,',
    '     cok hafif titreme ve bloom beslemesi (gbloom). */',
    '  vec3 gbloom = vec3(0.0);',
    '  for (int i = 0; i < 6; i++) {',
    '    vec4 G = uGlow[i];',
    '    if (G.w <= 0.001) continue;',
    '    vec2 dd = (uv - G.xy) * vec2(aspect, 1.0);',
    '    float rr = dot(dd, dd) / max(G.z * G.z, 0.0001);',
    '    float s = 1.0 / (1.0 + rr * 3.4);',
    '    s *= s;',
    '    float flick = 0.90 + 0.10 * sin(uTime * (7.0 + float(i) * 2.3) + float(i) * 1.7);',
    '    flick *= 0.97 + 0.03 * fbm2(vec2(uTime * 1.7, float(i) * 9.0));',
    '    vec3 gc = mix(uGlowCol[i], uWarm, 0.22);',
    '    col += gc * s * G.w * flick;',
    '    gbloom += gc * (1.0 / (1.0 + rr * 0.55)) * G.w * flick;',
    '  }',
    '',
    '  /* Secici bloom: oyun tuvalinin kucuk kopyasi, parlaklik esigi +',
    '     8 yonlu tek pass blur. Esik gecmeyen pikseller katkida bulunmaz. */',
    '  if (uBloomAmt > 0.001) {',
    '    vec3 acc = vec3(0.0);',
    '    float wsum = 0.0;',
    '    for (int i = 0; i < 8; i++) {',
    '      float a = float(i) * 0.7853982;',
    '      float rad = (mod(float(i), 2.0) < 0.5) ? 1.0 : 2.2;',
    '      vec2 off = vec2(cos(a), sin(a)) * uBloomTexel * uBloomSpread * rad;',
    '      vec3 c = texture2D(uBloom, clamp(uv + off, vec2(0.0015), vec2(0.9985))).rgb;',
    '      acc += c * smoothstep(uBloomTh, uBloomTh + 0.34, luma(c));',
    '      wsum += 1.0;',
    '    }',
    '    vec3 c0 = texture2D(uBloom, clamp(uv, vec2(0.0015), vec2(0.9985))).rgb;',
    '    acc += c0 * smoothstep(uBloomTh, uBloomTh + 0.34, luma(c0)) * 1.5;',
    '    wsum += 1.5;',
    '    col += (acc / wsum) * uBloomAmt * 1.6;',
    '    col += gbloom * uBloomAmt * 0.45;',
    '  }',
    '',
    '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);',
    '}',
  ].join('\n');

  // ------------------------------------------------------------------
  // KATMAN (WebGL Ã§izim yÃ¼zeyi)
  // ------------------------------------------------------------------
  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('[shaderfx] derleme hatasÄ±: ' + log);
    }
    return sh;
  }

  function createLayer(blend, zIndex) {
    var canvas = document.createElement('canvas');
    canvas.className = 'setra-fx-layer';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;' +
      'pointer-events:none;display:block;z-index:' + zIndex + ';';
    canvas.style.mixBlendMode = blend;

    var opts = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: false,
    };
    var gl = null;
    try { gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts); } catch (e) { gl = null; }
    if (!gl) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT_SRC));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('[shaderfx] link hatasÄ±: ' + gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uni = {};
    ['uRes', 'uTime', 'uMode', 'uSun', 'uWarm', 'uCool', 'uFog', 'uGrade', 'uTone',
      'uSparkle', 'uSeed', 'uBloomAmt', 'uBloomTh', 'uBloomSpread', 'uBloomTexel',
      'uTune', 'uBloom'].forEach(function (n) {
      uni[n] = gl.getUniformLocation(prog, n);
    });
    uni.uGlow = gl.getUniformLocation(prog, 'uGlow');
    uni.uGlowCol = gl.getUniformLocation(prog, 'uGlowCol');

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    // Katman kendi tuvalinde opak; saydamlÄ±k tarayÄ±cÄ± blend-mode ile yapÄ±lÄ±r.
    gl.blendFunc(gl.ONE, gl.ZERO);

    // Yedek 1x1 siyah doku: bloom kapalÄ±yken sampler2D boÅŸ kalmasÄ±n.
    // (WebGL, tamamlanmamÄ±ÅŸ dokuya bakan sampler ile Ã§izimi reddeder.)
    var blank = null;
    try {
      blank = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, blank);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    } catch (e) { blank = null; }

    return { canvas: canvas, gl: gl, prog: prog, uni: uni, mode: 0, w: 0, h: 0, lost: false, blank: blank };
  }

  // ------------------------------------------------------------------
  // KATMANLARIN HAZIRLIÄI
  // ------------------------------------------------------------------
  var grade = null;   // renk derecelendirme
  var light = null;   // Ä±ÅŸÄ±k / atmosfer

  function blendSupported() {
    try {
      if (typeof CSS === 'undefined' || !CSS.supports) return true; // eski tarayÄ±cÄ±: normal blend ile dene
      return CSS.supports('mix-blend-mode', 'soft-light') && CSS.supports('mix-blend-mode', 'screen');
    } catch (e) { return true; }
  }

  function fail(reason) {
    state.failed = true;
    state.reason = String(reason || 'bilinmeyen');
    console.warn('[shaderfx] devre dÄ±ÅŸÄ±:', state.reason);
    hideLayers();
  }

  function hideLayers() {
    if (grade) grade.canvas.style.display = 'none';
    if (light) light.canvas.style.display = 'none';
  }
  function showLayers() {
    if (grade) grade.canvas.style.display = 'block';
    if (light) light.canvas.style.display = 'block';
  }

  function ensureLayers() {
    if (state.failed) return false;
    if (grade && light) return true;
    if (!blendSupported()) { fail('mix-blend-mode desteklenmiyor'); return false; }
    try {
      grade = createLayer('soft-light', 1);
      light = createLayer('screen', 2);
      if (!grade || !light) { fail('WebGL baÄŸlamÄ± yok'); return false; }
      // BaÄŸlam kaybÄ±: sessizce kapan, oyun etkilenmesin.
      [grade, light].forEach(function (L) {
        L.canvas.addEventListener('webglcontextlost', function (ev) {
          if (ev && ev.preventDefault) ev.preventDefault();
          L.lost = true;
          fail('WebGL baÄŸlamÄ± kayboldu');
        }, false);
      });
      return true;
    } catch (e) {
      fail(e && e.message ? e.message : e);
      return false;
    }
  }

  // KatmanlarÄ± oyun tuvalinin hemen ardÄ±na yerleÅŸtir â†’ HUD'un altÄ±nda kalÄ±r.
  function attach(gameCanvas) {
    if (!gameCanvas || !gameCanvas.parentNode) return false;
    if (!ensureLayers()) return false;
    var parent = gameCanvas.parentNode;
    var changed = false;
    if (grade.canvas.parentNode !== parent) { parent.insertBefore(grade.canvas, gameCanvas.nextSibling); changed = true; }
    if (light.canvas.parentNode !== parent) { parent.insertBefore(light.canvas, grade.canvas.nextSibling); changed = true; }
    state.attached = gameCanvas;
    if (changed) { syncSize(gameCanvas); showLayers(); }
    return true;
  }

  var resizeInfo = { w: 0, h: 0, scale: 0 };
  function syncSize(gameCanvas) {
    var preset = PRESETS[state.quality] || PRESETS.normal;
    var cw = Math.max(1, Math.round(gameCanvas.clientWidth || gameCanvas.width || 1));
    var ch = Math.max(1, Math.round(gameCanvas.clientHeight || gameCanvas.height || 1));
    if (cw <= 1 || ch <= 1) return false;
    var scale = preset.scale;
    // Ã‡ok bÃ¼yÃ¼k ekranlarda piksel sayÄ±sÄ±nÄ± sÄ±nÄ±rla (fill-rate korumasÄ±).
    var maxW = preset.maxW;
    if (cw * scale > maxW) scale = maxW / cw;
    var rw = Math.max(160, Math.round(cw * scale));
    var rh = Math.max(120, Math.round(ch * scale));
    if (resizeInfo.w === cw && resizeInfo.h === ch && resizeInfo.scale === scale && grade.w === rw && grade.h === rh) return true;

    [grade, light].forEach(function (L) {
      if (L.w === rw && L.h === rh) return;
      L.canvas.width = rw;
      L.canvas.height = rh;
      L.w = rw; L.h = rh;
    });
    resizeInfo.w = cw; resizeInfo.h = ch; resizeInfo.scale = scale;
    resizeInfo.cssW = cw; resizeInfo.cssH = ch;
    return true;
  }

  // ------------------------------------------------------------------
  // BLOOM (yalnÄ±zca light katmanÄ±na entegre â€” Ã¼Ã§Ã¼ncÃ¼ canvas aÃ§Ä±lmaz)
  // Oyun tuvali kÃ¼Ã§Ã¼k bir 2D canvas'a indirilir, WebGL'e doku olarak
  // yÃ¼klenir. EÅŸik + blur hesabÄ± LIGHT shader'Ä±nÄ±n iÃ§inde yapÄ±lÄ±r.
  // ------------------------------------------------------------------
  var bloom = { canvas: null, ctx: null, tex: null, w: 0, h: 0, disabled: false };

  function ensureBloom() {
    if (bloom.disabled) return false;
    if (bloom.tex && bloom.ctx) return true;
    if (!light || !light.gl) return false;
    try {
      var c = document.createElement('canvas');
      c.width = 64; c.height = 36;
      var ctx = c.getContext('2d', { alpha: false });
      if (!ctx) { bloom.disabled = true; return false; }
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, c.width, c.height);

      var gl = light.gl;
      var tex = gl.createTexture();
      if (!tex) { bloom.disabled = true; return false; }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);

      bloom.canvas = c; bloom.ctx = ctx; bloom.tex = tex;
      bloom.w = c.width; bloom.h = c.height;
      return true;
    } catch (e) {
      bloom.disabled = true;
      console.info('[shaderfx] bloom kurulamadi: ' + (e && e.message ? e.message : e));
      return false;
    }
  }

  // KÃ¼Ã§Ã¼k kopya Ã¶lÃ§Ã¼sÃ¼: en fazla 480 px geniÅŸlik (yÃ¼kseklik de sÄ±nÄ±rlÄ±).
  function bloomSizeFor(gameCanvas) {
    var gw = Math.max(1, gameCanvas.width | 0);
    var gh = Math.max(1, gameCanvas.height | 0);
    var bw = Math.min(480, gw);
    var bh = Math.max(1, Math.round(bw * gh / gw));
    if (bh > 320) { bh = 320; bw = Math.max(1, Math.round(bh * gw / gh)); }
    return [Math.max(8, bw), Math.max(8, bh)];
  }

  function updateBloom(gameCanvas, preset) {
    if (!preset.bloom) return false;
    if (!ensureBloom() || !light || !light.gl) return false;
    if (!gameCanvas || !gameCanvas.width || !gameCanvas.height) return false;
    try {
      var sz = bloomSizeFor(gameCanvas);
      if (bloom.w !== sz[0] || bloom.h !== sz[1]) {
        bloom.canvas.width = sz[0];
        bloom.canvas.height = sz[1];
        bloom.w = sz[0];
        bloom.h = sz[1];
      }
      // drawImage: preserveDrawingBuffer gerekmez, tuval iÃ§eriÄŸi kopyalanÄ±r.
      bloom.ctx.drawImage(gameCanvas, 0, 0, bloom.w, bloom.h);
      var gl = light.gl;
      gl.bindTexture(gl.TEXTURE_2D, bloom.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bloom.canvas);
      return true;
    } catch (e) {
      // Sessizce bloom'u kapat; diÄŸer efektler devam eder.
      bloom.disabled = true;
      console.info('[shaderfx] bloom kapali: ' + (e && e.message ? e.message : e));
      return false;
    }
  }

  // ------------------------------------------------------------------
  // GUN / GECE
  // Saat kaynagi: SetraLive3D.getTimeOfDay() varsa o, yoksa state.hour.
  // Anahtarlar arasinda smoothstep ile yumusak gecis yapilir.
  //   sun  : ana isik rengi (gunduz sicak / gun batimi turuncu / gece ay)
  //   dark : grade tabanindaki karartma (0 = gunduz, ~0.40 = gece)
  //   fog  : pus carpani (gece daha guclu)
  //   cold : pusun sogukluk orani (gece 1'e yakin)
  //   rays : isin gucu carpani
  //   vig  : vignette carpani
  //   con  : kontrast carpani (gece daha yuksek)
  //   sunI : ana isik siddeti
  //   night: 0..1 gece orani
  // ------------------------------------------------------------------
  var TIME_KEYS = [
    { h: 0.0,  sun: [0.42, 0.55, 0.95], dark: 0.40, fog: 1.40, cold: 0.90, rays: 0.10, vig: 1.30, con: 1.18, sunI: 0.10, night: 1.00 },
    { h: 4.6,  sun: [0.45, 0.56, 0.92], dark: 0.38, fog: 1.34, cold: 0.86, rays: 0.12, vig: 1.24, con: 1.16, sunI: 0.14, night: 0.94 },
    { h: 6.4,  sun: [1.00, 0.72, 0.50], dark: 0.10, fog: 1.10, cold: 0.34, rays: 0.55, vig: 1.04, con: 1.06, sunI: 0.62, night: 0.32 },
    { h: 8.6,  sun: [1.00, 0.94, 0.80], dark: 0.00, fog: 0.74, cold: 0.10, rays: 0.85, vig: 0.84, con: 0.96, sunI: 1.00, night: 0.00 },
    { h: 15.5, sun: [1.00, 0.95, 0.82], dark: 0.00, fog: 0.80, cold: 0.10, rays: 0.90, vig: 0.84, con: 0.96, sunI: 1.02, night: 0.00 },
    { h: 17.5, sun: [1.00, 0.74, 0.42], dark: 0.03, fog: 1.06, cold: 0.18, rays: 1.15, vig: 0.94, con: 1.02, sunI: 0.94, night: 0.08 },
    { h: 19.0, sun: [1.00, 0.52, 0.26], dark: 0.12, fog: 1.22, cold: 0.28, rays: 1.05, vig: 1.10, con: 1.08, sunI: 0.68, night: 0.36 },
    { h: 20.4, sun: [0.62, 0.52, 0.74], dark: 0.26, fog: 1.34, cold: 0.62, rays: 0.35, vig: 1.22, con: 1.14, sunI: 0.30, night: 0.74 },
    { h: 22.0, sun: [0.42, 0.54, 0.93], dark: 0.38, fog: 1.40, cold: 0.88, rays: 0.12, vig: 1.30, con: 1.18, sunI: 0.12, night: 1.00 },
    { h: 24.0, sun: [0.42, 0.55, 0.95], dark: 0.40, fog: 1.40, cold: 0.90, rays: 0.10, vig: 1.30, con: 1.18, sunI: 0.10, night: 1.00 },
  ];

  var hourNow = 16.2;

  function currentHour() {
    try {
      var L = window.SetraLive3D;
      if (L && typeof L.getTimeOfDay === 'function') {
        var h = Number(L.getTimeOfDay());
        if (isFinite(h)) return ((h % 24) + 24) % 24;
      }
    } catch (e) { /* yoksay: state.hour'a dÃ¼ÅŸ */ }
    var d = Number(state.hour);
    if (!isFinite(d)) d = 16.2;
    return ((d % 24) + 24) % 24;
  }

  function sampleTime(h) {
    var n = TIME_KEYS.length;
    var a = TIME_KEYS[0], b = TIME_KEYS[n - 1];
    for (var i = 0; i < n - 1; i++) {
      if (h >= TIME_KEYS[i].h && h <= TIME_KEYS[i + 1].h) { a = TIME_KEYS[i]; b = TIME_KEYS[i + 1]; break; }
    }
    var t = clamp01((h - a.h) / Math.max(0.0001, b.h - a.h));
    t = t * t * (3 - 2 * t);
    return {
      sun: mix3(a.sun, b.sun, t),
      dark: lerp(a.dark, b.dark, t),
      fog: lerp(a.fog, b.fog, t),
      cold: lerp(a.cold, b.cold, t),
      rays: lerp(a.rays, b.rays, t),
      vig: lerp(a.vig, b.vig, t),
      con: lerp(a.con, b.con, t),
      sunI: lerp(a.sunI, b.sunI, t),
      night: lerp(a.night, b.night, t),
    };
  }

  // ------------------------------------------------------------------
  // BÄ°YOM + SAAT PARAMETRELERÄ° (yumuÅŸak geÃ§iÅŸli)
  // ------------------------------------------------------------------
  var cur = {
    warm: [1.0, 0.86, 0.62],
    cool: [0.32, 0.40, 0.50],
    fog: [0.62, 0.76, 0.55],
    sunX: 0.24,
    sunY: -0.14,
    sunI: 1.0,
    rays: 1.0,
    sparkle: 0.6,
    gradeBoost: 1.0,
    fogAmt: 1.0,
    dark: 0.0,
    vigTime: 1.0,
    contrast: 1.0,
    night: 0.0,
  };
  var tgt = JSON.parse(JSON.stringify(cur));
  var primed = false;

  function resolveAll(engine) {
    // --- biyom ---
    var id = (engine && engine.biome) || 'verdant';
    var pal = (engine && engine.biomePalette) || {};
    var amb = (engine && engine.biomeAmbient) || {};
    var def = BIOMES[id] || BIOME_DEFAULT;

    var warmB = hexToRgb(amb.color2 || pal.accent || '#ffd54f');
    var coolSrc = hexToRgb(pal.sky || '#22303a');
    var mid = hexToRgb(amb.color || pal.ground || '#7fae7a');
    // GÃ¶lge tonu: gÃ¶kyÃ¼zÃ¼ rengi Ã§ok karanlÄ±ksa yÃ¼zey rengiyle dengelenir.
    var coolB = mix3(coolSrc, mid, 0.55);
    coolB = [clamp01(coolB[0]), clamp01(coolB[1]), clamp01(coolB[2])];
    var fogB = hexToRgb(pal.fog || pal.accent || '#9bd47a');

    var gradeBoost = Number(pal.grade);
    if (!isFinite(gradeBoost)) gradeBoost = 0.1;
    var fogAmt = Number(amb.fog);
    if (!isFinite(fogAmt)) fogAmt = 0.16;

    // --- saat ---
    var h = currentHour();
    hourNow = h;
    var p = sampleTime(h);

    // Isik konumu: 06:00 solda (0), 18:00 sagda (1), gece yarisi ortada.
    // Dikeyde her zaman kadraj DIÅINDA: uv.y < 0.
    var phase = Math.PI * 2 * (h - 6) / 24;
    var sx = 0.5 - 0.5 * Math.cos(phase);
    var sy = -0.09 - 0.11 * Math.max(0, Math.sin(phase));
    tgt.sunX = clamp01(lerp(sx, def.sun[0], 0.30));
    tgt.sunY = Math.min(-0.04, sy + def.sun[1] * 0.35);

    var tw = lerp(0.45, 0.88, p.night);
    tgt.warm = mix3(warmB, p.sun, tw);
    tgt.cool = mix3(coolB, MOON_TONE, p.night * 0.62);
    tgt.fog = mix3(fogB, COLD_FOG, p.cold * 0.80);
    tgt.sunI = p.sunI * (0.80 + Math.min(0.35, gradeBoost * 1.4));
    tgt.rays = def.raysMul * (0.75 + fogAmt * 1.1) * p.rays;
    tgt.sparkle = def.sparkleMul * (id === 'frost' ? 1.25 : 1.0) * lerp(1.0, 0.45, p.night);
    tgt.gradeBoost = 0.85 + Math.min(0.25, gradeBoost * 1.2);
    tgt.fogAmt = (0.75 + fogAmt * 1.2) * p.fog;
    tgt.dark = p.dark;
    tgt.vigTime = p.vig;
    tgt.contrast = p.con;
    tgt.night = p.night;
  }

  function stepAll(dt) {
    var k = primed ? Math.min(1, dt * 1.6) : 1;
    primed = true;
    cur.warm = mix3(cur.warm, tgt.warm, k);
    cur.cool = mix3(cur.cool, tgt.cool, k);
    cur.fog = mix3(cur.fog, tgt.fog, k);
    cur.sunX = lerp(cur.sunX, tgt.sunX, k);
    cur.sunY = lerp(cur.sunY, tgt.sunY, k);
    cur.sunI = lerp(cur.sunI, tgt.sunI, k);
    cur.rays = lerp(cur.rays, tgt.rays, k);
    cur.sparkle = lerp(cur.sparkle, tgt.sparkle, k);
    cur.gradeBoost = lerp(cur.gradeBoost, tgt.gradeBoost, k);
    cur.fogAmt = lerp(cur.fogAmt, tgt.fogAmt, k);
    cur.dark = lerp(cur.dark, tgt.dark, k);
    cur.vigTime = lerp(cur.vigTime, tgt.vigTime, k);
    cur.contrast = lerp(cur.contrast, tgt.contrast, k);
    cur.night = lerp(cur.night, tgt.night, k);
  }

  // ------------------------------------------------------------------
  // BÃœYÃœ / MEÅALE / KAMP ATEÅÄ° GLOW'LARI
  // ------------------------------------------------------------------
  var glows = []; // {x,y,r,life,max,col:[r,g,b],i}
  var MAX_GLOW = 6;

  // glow(x, y, r, color, lifeMs, intensity?) â€” ekran px / #rrggbb
  function glow(x, y, r, color, ms, intensity) {
    if (state.failed) return;
    try {
      var cssW = resizeInfo.cssW || 1, cssH = resizeInfo.cssH || 1;
      var col = hexToRgb(color || '#ffb066', [1.0, 0.69, 0.40]);
      var amp = Number(intensity);
      if (!isFinite(amp)) amp = 1;
      glows.push({
        x: clamp01(x / cssW),
        y: clamp01(y / cssH),
        r: Math.max(0.03, Math.min(0.9, (Number(r) || 120) / Math.max(cssW, 1) * 2.2)),
        life: 0,
        max: Math.max(0.08, (Number(ms) || 600) / 1000),
        col: col,
        amp: Math.max(0.05, Math.min(4, amp)),
      });
      if (glows.length > MAX_GLOW) glows.splice(0, glows.length - MAX_GLOW);
    } catch (e) { /* kozmetik: hatasÄ± oyunu etkilemez */ }
  }

  // DÃ¼nya koordinatÄ±ndan ekran px â†’ glow (motor hazÄ±rsa)
  function glowAtWorld(engine, wx, wy, r, color, ms) {
    try {
      if (!engine || typeof engine.iso !== 'function') return;
      var p = engine.iso(wx, wy, 14);
      glow(p.x + (engine.camera ? engine.camera.x : 0), p.y + (engine.camera ? engine.camera.y : 0), r, color, ms);
    } catch (e) { /* yoksay */ }
  }

  // ------------------------------------------------------------------
  // Ã‡Ä°ZÄ°M
  // ------------------------------------------------------------------
  var _t0 = 0;
  var _perfAcc = 0, _perfN = 0, _demotions = 0;
  var _gv = new Float32Array(24);
  var _gc = new Float32Array(18);

  function drawLayer(L, mode, time, preset, glowArr, bloomOn) {
    var gl = L.gl;
    if (!gl || L.lost) return;
    gl.viewport(0, 0, L.w, L.h);
    gl.useProgram(L.prog);
    gl.uniform2f(L.uni.uRes, L.w, L.h);
    gl.uniform1f(L.uni.uTime, time);
    gl.uniform1f(L.uni.uMode, mode);

    // IÅŸÄ±k vektÃ¶rÃ¼: y her zaman negatif (kadraj Ã¼stÃ¼), x saate gÃ¶re kayar.
    gl.uniform4f(L.uni.uSun, cur.sunX, cur.sunY, preset.sun * cur.sunI, preset.rays * cur.rays * tune.rays);
    gl.uniform3f(L.uni.uWarm, cur.warm[0], cur.warm[1], cur.warm[2]);
    gl.uniform3f(L.uni.uCool, cur.cool[0], cur.cool[1], cur.cool[2]);
    gl.uniform3f(L.uni.uFog, cur.fog[0], cur.fog[1], cur.fog[2]);

    var gA = preset.grade * cur.gradeBoost;
    gl.uniform4f(L.uni.uGrade, gA, preset.vig * cur.vigTime, preset.grain, preset.detail);
    gl.uniform4f(L.uni.uTone, cur.dark, cur.contrast, cur.fogAmt * preset.fogK, cur.night);
    gl.uniform1f(L.uni.uSparkle, mode > 0.5 ? preset.sparkle * cur.sparkle : 0);
    gl.uniform1f(L.uni.uSeed, 3.7);

    // Atmosfer Ã§arpanlarÄ±: tek uniform Ã§aÄŸrÄ±sÄ±, allocation yok.
    if (L.uni.uTune) gl.uniform4f(L.uni.uTune, tune.fog, tune.vignette, tune.night, tune.exposure);

    // Glow dizileri (her zaman 6 eleman gÃ¶nderilir)
    for (var z = 0; z < 24; z++) _gv[z] = 0;
    for (var z2 = 0; z2 < 18; z2++) _gc[z2] = 0;
    for (var i = 0; i < MAX_GLOW; i++) {
      var g = glowArr[i];
      if (!g) continue;
      var t = g.life / g.max;
      var fade = Math.sin(Math.min(1, t) * Math.PI); // yumuÅŸak aÃ§/kapa
      _gv[i * 4] = g.x; _gv[i * 4 + 1] = g.y; _gv[i * 4 + 2] = g.r;
      _gv[i * 4 + 3] = fade * preset.glow * 0.5 * (g.amp || 1);
      _gc[i * 3] = g.col[0]; _gc[i * 3 + 1] = g.col[1]; _gc[i * 3 + 2] = g.col[2];
    }
    if (L.uni.uGlow) gl.uniform4fv(L.uni.uGlow, _gv);
    if (L.uni.uGlowCol) gl.uniform3fv(L.uni.uGlowCol, _gc);

    // Bloom yalnÄ±zca light katmanÄ±nda; gece Ä±ÅŸÄ±klarÄ± Ã¶ne Ã§Ä±ksÄ±n diye hafif artar.
    var amt = (mode > 0.5 && bloomOn && preset.bloom) ? preset.bloom * (1 + cur.night * 0.35) * tune.bloom : 0;
    gl.uniform1f(L.uni.uBloomAmt, amt);
    gl.uniform1f(L.uni.uBloomTh, 0.72);
    gl.uniform1f(L.uni.uBloomSpread, preset.bloomSpread);
    gl.uniform2f(L.uni.uBloomTexel,
      bloom.w ? 1 / bloom.w : 0.002,
      bloom.h ? 1 / bloom.h : 0.002);
    if (amt > 0 && bloom.tex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bloom.tex);
      if (L.uni.uBloom) gl.uniform1i(L.uni.uBloom, 0);
    } else if (L.blank) {
      // Yedek siyah doku: sampler her zaman tam bir dokuya baksÄ±n.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, L.blank);
      if (L.uni.uBloom) gl.uniform1i(L.uni.uBloom, 0);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  var lastPresent = 0;

  function updateGlows(dt) {
    if (!glows.length) return;
    for (var i = glows.length - 1; i >= 0; i--) {
      glows[i].life += dt;
      if (glows[i].life >= glows[i].max) glows.splice(i, 1);
    }
  }

  // Ana giriÅŸ noktasÄ±: travelEngine her karede Ã§aÄŸÄ±rÄ±r.
  function present(engine) {
    if (!state.enabled || state.failed) {
      if (state.enabled && state.failed) hideLayers();
      return;
    }
    var started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    try {
      var gameCanvas = engine && engine.canvas;
      if (!gameCanvas || !gameCanvas.parentNode) return;
      if (document.hidden) return;
      if (!attach(gameCanvas)) return;
      if (!syncSize(gameCanvas)) return;

      var now = started || 0;
      var dt = lastPresent ? Math.min(0.25, Math.max(0.001, (now - lastPresent) / 1000)) : 0.016;
      lastPresent = now;

      resolveAll(engine);
      stepAll(dt);
      updateGlows(dt);

      var preset = PRESETS[state.quality] || PRESETS.normal;
      var time = (now || 0) / 1000;

      // 1) kÃ¼Ã§Ã¼k bloom kopyasÄ± (yalnÄ±zca kademe istiyorsa, tek kÃ¼Ã§Ã¼k pass)
      var bloomOn = updateBloom(gameCanvas, preset);

      // 2) iki tam ekran Ã§izim
      drawLayer(grade, 0, time, preset, glows, bloomOn);
      drawLayer(light, 1, time, preset, glows, bloomOn);

      // Performans korumasÄ±: katman Ã§izimi kareyi zorluyorsa kaliteyi dÃ¼ÅŸÃ¼r.
      if (started) {
        _perfAcc += ((performance.now() - started));
        _perfN++;
        if (_perfN >= 90) {
          var avg = _perfAcc / _perfN;
          _perfAcc = 0; _perfN = 0;
          if (avg > 7 && _demotions < 2) {
            _demotions++;
            var order = ['light', 'normal', 'extreme'];
            var idx = order.indexOf(state.quality);
            if (idx > 0) {
              state.quality = order[idx - 1];
              savePrefs();
              resizeInfo.w = 0;
              console.info('[shaderfx] kare baÅŸÄ±na ' + avg.toFixed(1) + ' ms â†’ kalite: ' + state.quality);
            }
          }
        }
      }
    } catch (e) {
      fail(e && e.message ? e.message : e);
    }
  }

  // ------------------------------------------------------------------
  // DIÅ API
  // ------------------------------------------------------------------
  function setEnabled(on) {
    state.enabled = !!on;
    savePrefs();
    if (!state.enabled) { hideLayers(); return; }
    if (state.failed) {
      // Hata kalÄ±cÄ± ise kullanÄ±cÄ±yÄ± bilgilendir ama oyunu zorlamayalÄ±m.
      console.warn('[shaderfx] bu oturumda devre dÄ±ÅŸÄ± (sebep: ' + state.reason + ')');
      return;
    }
    showLayers();
  }

  function setQuality(q) {
    if (q !== 'light' && q !== 'normal' && q !== 'extreme') return state.quality;
    state.quality = q;
    savePrefs();
    resizeInfo.w = 0; // yeniden boyutlandÄ±r
    return state.quality;
  }

  function cycleQuality() {
    var order = ['light', 'normal', 'extreme'];
    var next = order[(order.indexOf(state.quality) + 1) % order.length];
    return setQuality(next);
  }

  // Saati elle ayarla (Live3D zaman kaynaÄŸÄ± varsa o Ã¶nceliklidir).
  function setHour(h) {
    var v = Number(h);
    if (!isFinite(v)) return state.hour;
    state.hour = ((v % 24) + 24) % 24;
    savePrefs();
    return state.hour;
  }

  function toast(msg) {
    try {
      if (typeof window.toast === 'function') { window.toast(msg); return; }
      var el = document.getElementById('setra-fx-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'setra-fx-toast';
        el.style.cssText = 'position:fixed;left:50%;bottom:18%;transform:translateX(-50%);' +
          'background:#1d1510ee;border:1px solid #c9933f;border-radius:10px;padding:8px 14px;' +
          'color:#ffd9a0;font:600 13px Georgia,serif;z-index:99999;pointer-events:none;' +
          'transition:opacity .25s ease;';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = '1';
      clearTimeout(el._t);
      el._t = setTimeout(function () { el.style.opacity = '0'; }, 1400);
    } catch (e) { /* yoksay */ }
  }

  function toggle() {
    setEnabled(!state.enabled);
    toast('Atmosphere: ' + (state.enabled ? 'ON (' + state.quality + ')' : 'OFF'));
    return state.enabled;
  }

  // KÄ±sayol: F9 aÃ§/kapat, Shift+F9 kalite dÃ¶ngÃ¼sÃ¼.
  try {
    window.addEventListener('keydown', function (e) {
      if (e.key !== 'F9' && e.code !== 'F9') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      e.preventDefault();
      if (e.shiftKey) {
        var q = cycleQuality();
        toast('Atmosphere quality: ' + q);
      } else {
        toggle();
      }
      lastPresent = 0;
    }, false);
  } catch (e) { /* yoksay */ }

  // Yetenek anÄ±: motor triggerSkill iÃ§inden Ã§aÄŸÄ±rÄ±r (kozmetik halka).
  var SKILL_COLORS = { q: '#8ec5ff', e: '#ffd166', r: '#c084fc' };
  function skillFlash(engine, key, color) {
    try {
      if (!state.enabled || state.failed) return;
      var p = engine.player;
      if (!p) return;
      var c = color || SKILL_COLORS[key] || '#c8a2ff';
      glowAtWorld(engine, p.x, p.y, key === 'r' ? 240 : 160, c, key === 'r' ? 900 : 520);
    } catch (e) { /* yoksay */ }
  }

  window.SetraShaderFX = {
    version: 2,
    present: present,
    toggle: toggle,
    setEnabled: setEnabled,
    isEnabled: function () { return !!state.enabled && !state.failed; },
    setQuality: setQuality,
    cycleQuality: cycleQuality,
    getQuality: function () { return state.quality; },
    setHour: setHour,
    getHour: function () { return hourNow; },
    // Atmosfer Ã§arpanlarÄ± (oyun + Live3D aynÄ± deÄŸerleri paylaÅŸÄ±r).
    setTune: setTune,
    getTune: getTune,
    resetTune: resetTune,
    tune: function () { return getTune(); },
    getSettings: function () {
      return {
        enabled: state.enabled,
        quality: state.quality,
        failed: state.failed,
        reason: state.reason,
        hour: hourNow,
        bloom: !!(bloom.tex && !bloom.disabled),
      };
    },
    glow: glow,
    addGlow: glow,
    glowAtWorld: glowAtWorld,
    skillFlash: skillFlash,
    // TeÅŸhis: shader kaynaklarÄ± ve derleme testi (konsoldan Ã§aÄŸrÄ±labilir).
    debugSources: { vert: VERT_SRC, frag: FRAG_SRC },
    compileCheck: function () {
      var out = { vert: 'ok', frag: 'ok' };
      try {
        var c = document.createElement('canvas');
        var gl = c.getContext('webgl', { alpha: true });
        if (!gl) { out.gl = 'yok'; return out; }
        out.vendor = gl.getParameter(gl.VENDOR);
        out.renderer = gl.getParameter(gl.RENDERER);
        try { compile(gl, gl.VERTEX_SHADER, VERT_SRC); } catch (e) { out.vert = String(e.message || e); }
        try { compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC); } catch (e) { out.frag = String(e.message || e); }
      } catch (e) { out.error = String(e && e.message || e); }
      return out;
    },
    detach: function () {
      try {
        if (grade && grade.canvas.parentNode) grade.canvas.parentNode.removeChild(grade.canvas);
        if (light && light.canvas.parentNode) light.canvas.parentNode.removeChild(light.canvas);
      } catch (e) { /* yoksay */ }
      state.attached = null;
    },
  };
})();
