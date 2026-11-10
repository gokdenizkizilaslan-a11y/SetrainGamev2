/* =====================================================================
 * Setra Live3D â€” canlÄ± (gerÃ§ek zamanlÄ±) 3D NPR Ã§evre katmanÄ±  [PROTOTÄ°P]
 * ---------------------------------------------------------------------
 * NEDEN: trees3d.js GLB modelleri 8-16 aÃ§Ä±dan sprite'a piÅŸiriyor. Bu modÃ¼l
 * AYNI GLB geometrisini, AYNI izometrik kamerayla (elev 0.6155 rad â‰ˆ 35.26Â°,
 * azimut = obj.rot + 45Â°) her karede doÄŸrudan 3D render edip, 2D tuvalin
 * TAM DOÄRU derinlik sÄ±rasÄ±nda drawImage ile basar.
 *
 *  - Orijinal GLB'ler, UV'ler, hiyerarÅŸi korunur (hiÃ§bir dosya deÄŸiÅŸmez).
 *  - PiÅŸirme pipeline'Ä± (trees3d.js) silinmez; o Ã§alÄ±ÅŸmaya devam eder.
 *  - Her ÅŸey try/catch + `shouldDraw()` allowlist ile korunur: hata olursa
 *    veya kapatÄ±lÄ±rsa otomatik olarak mevcut sprite yoluna dÃ¶ner.
 *  - AynÄ± oyun iÃ§i shaderfx sistemiyle Ã§akÄ±ÅŸmaz (o ekran katmanÄ±, bu dÃ¼nya).
 *
 * KULLANIM (travelEngine.drawSceneryItem iÃ§inde, trees3d'den Ã–NCE):
 *   if (window.SetraLive3D && window.SetraLive3D.draw(ctx, s, x, y, this)) return;
 *
 * DIÅ API
 *   SetraLive3D.enabled / setEnabled(on) / shouldDraw(s)
 *   SetraLive3D.setTimeOfDay(h)      // 0..24, gÃ¼n/gece
 *   SetraLive3D.addLight(x,y,z,color,range,intensity,id)
 *   SetraLive3D.setQuality('light'|'normal'|'extreme')
 *   SetraLive3D.stats()              // teÅŸhis
 * ===================================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  if (window.SetraLive3D) return;

  var STORE_KEY = 'setra.live3d.v1';
  var state = {
    enabled: true,
    quality: 'normal',
    ready: false,
    failed: null,
    timeOfDay: 16.2,       // 0-24; 16.2 = mevcut bake Ä±ÅŸÄ±ÄŸÄ±na en yakÄ±n Ã¶ÄŸleden sonra
    frames: 0,
    rendered: 0,
    cacheHits: 0,
  };

  (function loadPrefs() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        if (typeof o.enabled === 'boolean') state.enabled = o.enabled;
        if (o.quality === 'light' || o.quality === 'normal' || o.quality === 'extreme') state.quality = o.quality;
        if (Number.isFinite(Number(o.timeOfDay))) state.timeOfDay = Number(o.timeOfDay);
      }
    } catch (e) {}
  })();
  function savePrefs() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ enabled: state.enabled, quality: state.quality, timeOfDay: state.timeOfDay })); } catch (e) {}
  }

  // Prototip kapsamÄ±: bÃ¼yÃ¼k Ã§evre nesneleri (kÃ¼Ã§Ã¼k dekor sprite olarak kalÄ±r).
  var MODELS = {
    oak: 1, pine: 1, birch: 1, autumn: 1, deadtree: 1, greywood: 1,
    bigrock: 1, rocks: 1, hut: 1, farmhouse: 1, barn: 1, well: 1,
    campfire: 1, lamp: 1, crystals: 1, obelisk: 1,
  };

  // Malzeme kategorileri: aynÄ± shader, farklÄ± sanat parametreleri.
  // 2D illÃ¼strasyon hedefi: az sayÄ±da geniÅŸ ton, keskin gÃ¶lge sÄ±nÄ±rÄ±, az gÃ¼rÃ¼ltÃ¼.
  var MATS = {
    foliage: { bands: 2.5, paint: 0.45, rim: 0.55, ao: 0.80, ink: [0.07, 0.11, 0.05], alphaTest: 0.42, sat: 1.10, outline: 0.9 },
    wood:    { bands: 3.0, paint: 0.40, rim: 0.38, ao: 0.85, ink: [0.10, 0.07, 0.04], alphaTest: 0.0, sat: 1.06, outline: 1.35 },
    stone:   { bands: 3.2, paint: 0.30, rim: 0.42, ao: 0.90, ink: [0.09, 0.09, 0.11], alphaTest: 0.0, sat: 1.02, outline: 1.15 },
    prop:    { bands: 3.0, paint: 0.40, rim: 0.34, ao: 0.75, ink: [0.10, 0.08, 0.06], alphaTest: 0.0, sat: 1.04, outline: 1.0 },
    glow:    { bands: 2.5, paint: 0.30, rim: 0.60, ao: 0.60, ink: [0.12, 0.06, 0.03], alphaTest: 0.0, sat: 1.08, outline: 0.8, emissive: [0.34, 0.14, 0.03] },
  };
  var CATEGORY = {
    oak: 'foliage', pine: 'foliage', birch: 'foliage', autumn: 'foliage',
    deadtree: 'wood', greywood: 'wood',
    bigrock: 'stone', rocks: 'stone', crystals: 'stone', obelisk: 'stone',
    hut: 'wood', farmhouse: 'wood', barn: 'wood', well: 'wood',
    campfire: 'glow', lamp: 'glow',
  };
  // Dokusuz model iÃ§in kategori temel rengi (beyaz patlamayÄ± Ã¶nler).
  var MAT_BASE = {
    foliage: [0.26, 0.40, 0.19],
    wood: [0.44, 0.31, 0.19],
    stone: [0.46, 0.45, 0.44],
    prop: [0.45, 0.36, 0.26],
    glow: [0.62, 0.40, 0.18],
  };

  // ------------------------------------------------------------------
  // GÃœN / GECE IÅIK MODELÄ°
  // ------------------------------------------------------------------
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerp3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // Saate gÃ¶re Ä±ÅŸÄ±k: ÅŸafak (6), Ã¶ÄŸlen (13), gÃ¼n batÄ±mÄ± (19.5), gece (23-4).
  function sunFor(hour) {
    var h = ((hour % 24) + 24) % 24;
    // 0 = gece, 1 = tam gÃ¼ndÃ¼z
    var day = 0;
    if (h >= 5 && h < 7) day = (h - 5) / 2;            // ÅŸafak
    else if (h >= 7 && h < 17.5) day = 1;              // gÃ¼ndÃ¼z
    else if (h >= 17.5 && h < 20) day = 1 - (h - 17.5) / 2.5; // gÃ¼n batÄ±mÄ±
    day = clamp(day, 0, 1);
    var sunset = clamp(1 - Math.abs(h - 18.9) / 1.9, 0, 1);
    var sunWarm = [1.00, 0.86, 0.62];
    var sunGold = [1.00, 0.62, 0.30];
    var sunCol = lerp3(sunWarm, sunGold, sunset * 0.85);
    var sunI = lerp(0.065, 0.92, day) * (1 - sunset * 0.15) * tune.sun;
    // GÃ¼neÅŸ yÃ¶nÃ¼: doÄŸudan batÄ±ya (izometrik sol-Ã¼st Ä±ÅŸÄ±k)
    var az = lerp(-1.25, 1.25, clamp((h - 6) / 13, 0, 1));
    var di = [
      Math.cos(az) * 0.72,
      lerp(0.55, 1.0, day),
      Math.sin(az) * 0.55 + 0.35,
    ];
    var len = Math.hypot(di[0], di[1], di[2]) || 1;
    di = [di[0] / len, di[1] / len, di[2] / len];

    // GÃ¼ndÃ¼z: sÄ±cak gÃ¶k + toprak tonu. Gece: mavi-siyah (gri deÄŸil), gerÃ§ekten karanlÄ±k.
    var skyDay = [0.60, 0.72, 0.90];
    var skyNight = [0.030, 0.048, 0.130];
    var groundDay = [0.36, 0.27, 0.18];
    var groundNight = [0.028, 0.035, 0.060];
    var sky = lerp3(skyNight, skyDay, day);
    var ground = lerp3(groundNight, groundDay, day);
    // 'ambient' yoÄŸunluÄŸu: gece gerÃ§ekten karanlÄ±k olsun
    var ambI = lerp(0.058, 0.60, day) * tune.amb * lerp(1 / Math.max(0.25, tune.night), 1, day);
    var fillCol = lerp3([0.06, 0.09, 0.20], [0.55, 0.66, 0.86], day);
    // Gece ana Ä±ÅŸÄ±ÄŸÄ± ay: sÄ±cak gÃ¼neÅŸ yerine soÄŸuk mavi
    var moon = [0.52, 0.66, 1.00];
    sunCol = lerp3(sunCol, moon, clamp(1 - day * 2.2, 0, 1));
    return {
      day: day, sunset: sunset,
      dir: di,
      color: [sunCol[0] * sunI, sunCol[1] * sunI, sunCol[2] * sunI],
      sky: [sky[0] * ambI, sky[1] * ambI, sky[2] * ambI],
      ground: [ground[0] * ambI, ground[1] * ambI, ground[2] * ambI],
      fill: [fillCol[0] * 0.35 * ambI, fillCol[1] * 0.35 * ambI, fillCol[2] * 0.35 * ambI],
      ambI: ambI,
    };
  }

  // ------------------------------------------------------------------
  // MODÃœL YÃœKLEME (three + GLTFLoader, tembel)
  // ------------------------------------------------------------------
  var THREE = null, GLTFLoader = null, loader = null;
  var renderer = null, scene = null, camera = null, ambientScene = null;
  var models = Object.create(null);   // id -> { root, size, mat, meshes }
  var loading = Object.create(null);

  function loadThree() {
    if (state.ready) return Promise.resolve(true);
    if (state._bootPromise) return state._bootPromise;
    state._bootPromise = (async function () {
      try {
        var mods = await Promise.all([import('three'), import('three/addons/loaders/GLTFLoader.js')]);
        THREE = mods[0];
        GLTFLoader = mods[1].GLTFLoader;
        loader = new GLTFLoader();
        renderer = new THREE.WebGLRenderer({
          alpha: true, antialias: true, preserveDrawingBuffer: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(1);
        renderer.setSize(RES, RES, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.setClearColor(0x000000, 0);
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 2000);
        WHITE = blankTexture();
        state.ready = true;
        return true;
      } catch (e) {
        state.failed = 'three yÃ¼klenemedi: ' + (e && e.message || e);
        console.warn('[live3d]', state.failed);
        return false;
      }
    })();
    return state._bootPromise;
  }

  var RES = 320; // render Ã§Ã¶zÃ¼nÃ¼rlÃ¼ÄŸÃ¼ (kare tuval)

  // ------------------------------------------------------------------
  // NPR MALZEMESÄ° (tek program, tÃ¼m nesneler paylaÅŸÄ±r)
  // ------------------------------------------------------------------
  var VERT = [
    'uniform float uThick;',
    'varying vec3 vN;',
    'varying vec3 vW;',
    'varying vec2 vUv;',
    'varying vec3 vL;',
    'void main(){',
    '  vec3 pos = position;',
    '  vec3 nrm = normalize(normal);',
    '  if (uThick > 0.0) pos += nrm * uThick;',   // inverted-hull kontur
    '  vec4 wp = modelMatrix * vec4(pos, 1.0);',
    '  vW = wp.xyz;',
    '  vN = normalize(mat3(modelMatrix) * nrm);',
    '  vUv = uv;',
    '  vL = position;',
    '  gl_Position = projectionMatrix * viewMatrix * wp;',
    '}',
  ].join('\n');

  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform sampler2D uMap;',
    'uniform float uHasMap;',
    'uniform float uAlphaTest;',
    'uniform vec3  uTint;',
    'uniform vec3  uSunDir;',
    'uniform vec3  uSunCol;',
    'uniform vec3  uSkyCol;',
    'uniform vec3  uGndCol;',
    'uniform vec3  uFillCol;',
    'uniform vec3  uRimCol;',
    'uniform float uRimI;',
    'uniform float uBands;',
    'uniform float uPaint;',
    'uniform float uAo;',
    'uniform vec3  uInk;',
    'uniform float uSat;',
    'uniform vec3  uVar;',
    'uniform vec3  uEmissive;',
    'uniform vec4  uPts[4];',
    'uniform vec3  uPtCol[4];',
    'uniform float uPtI[4];',
    'uniform vec3  uCam;',
    'uniform float uThick;',      // >0 â†’ kontur geÃ§iÅŸi (dÃ¼z renk)
    'uniform vec3  uOutline;',
    'varying vec3 vN;',
    'varying vec3 vW;',
    'varying vec2 vUv;',
    'varying vec3 vL;',
    '',
    'float hash31(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }',
    'float vnoise3(vec3 p){',
    '  vec3 i = floor(p), f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  float n = mix(mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),',
    '                    mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),',
    '                mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),',
    '                    mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);',
    '  return n;',
    '}',
    '',
    'void main(){',
    '  vec4 tex = texture2D(uMap, vUv);',
    '  if (uThick > 0.0) {',
    '    if (uAlphaTest > 0.0 && tex.a < uAlphaTest) discard;',
    '    gl_FragColor = vec4(uOutline, 1.0); return;',
    '  }',
    '  if (uAlphaTest > 0.0 && tex.a < uAlphaTest) discard;',
    '  vec3 n = normalize(vN);',
    '  vec3 albedo = mix(vec3(1.0), tex.rgb, uHasMap) * uTint;',
    '',
    '  /* BoyanmÄ±ÅŸ yÃ¼zey: dÃ¼ÅŸÃ¼k frekanslÄ± fÄ±rÃ§a varyasyonu */',
    '  float brush = vnoise3(vW * 2.4) * 0.62 + vnoise3(vW * 7.1) * 0.38;',
    '  albedo *= 1.0 + (brush - 0.5) * 0.30 * uPaint;',
    '  /* Fotografik doku gurultusunu azalt: hafif posterize + genel koyulaÅŸma */',
    '  albedo = mix(albedo, floor(albedo * 9.0 + 0.5) / 9.0, 0.24);',
    '  albedo *= 0.86 * uVar;',
    '',
    '  /* YumuÅŸak bantlÄ± (cel) difÃ¼z + half-lambert: keskin anime deÄŸil, boyanmÄ±ÅŸ his */',
    '  float ndl = dot(n, uSunDir) * 0.5 + 0.5;',
    '  float band = floor(ndl * uBands + 0.5) / uBands;',
    '  float lit = mix(ndl, band, 0.72);',
    '  float shade = smoothstep(0.10, 0.92, lit);',
    '',
    '  vec3 amb = mix(uGndCol, uSkyCol, n.y * 0.5 + 0.5);',
    '  float fdl = max(0.0, dot(n, normalize(vec3(-0.4, 0.6, -0.7))));',
    '  vec3 fill = uFillCol * fdl;',
    '',
    '  /* Nokta Ä±ÅŸÄ±klarÄ± (meÅŸale / kamp ateÅŸi): gerÃ§ek mesafeli sÃ¶nÃ¼m */',
    '  vec3 pl = vec3(0.0);',
    '  for (int i = 0; i < 4; i++) {',
    '    if (uPtI[i] <= 0.001) continue;',
    '    vec3 d = uPts[i].xyz - vW;',
    '    float dist = length(d);',
    '    float att = clamp(1.0 - dist / max(uPts[i].w, 0.001), 0.0, 1.0);',
    '    att *= att;',
    '    float dnl = max(0.0, dot(n, d / max(dist, 0.0015)));',
    '    pl += uPtCol[i] * uPtI[i] * att * (0.22 + 0.78 * dnl);',
    '  }',
    '',
    '  /* Stilize AO: Ã¼st yÃ¼zeyler aÃ§Ä±k, kÄ±vrÄ±mlar koyu */',
    '  float ao = mix(0.50, 1.0, smoothstep(-0.35, 0.75, n.y));',
    '  ao = mix(1.0, ao, uAo);',
    '',
    '  vec3 col = albedo * (amb * ao + uSunCol * shade * mix(0.55, 1.0, ao) + fill + pl);',
    '  col += uEmissive * (0.55 + 0.45 * brush);',
    '',
    '  /* GÃ¶lgeler siyaha deÄŸil mÃ¼rekkep tonuna Ã§ekilir (Ã§amurlaÅŸma yok) */',
    '  col = mix(uInk * (0.35 + 0.65 * uSat), col, smoothstep(0.0, 0.28, length(col)));',
    '',
    '  /* Kenar Ä±ÅŸÄ±ÄŸÄ±: silÃ¼eti zeminden ayÄ±rÄ±r */',
    '  vec3 vdir = normalize(uCam - vW);',
    '  float rim = pow(1.0 - max(0.0, dot(n, vdir)), 2.6);',
    '  col += uRimCol * rim * uRimI;',
    '',
    '  /* Hafif doygunluk */',
    '  float lum = dot(col, vec3(0.299, 0.587, 0.114));',
    '  col = mix(vec3(lum), col, uSat);',
    '',
    '  gl_FragColor = vec4(col, uAlphaTest > 0.0 ? 1.0 : 1.0);',
    '}',
  ].join('\n');

  // Model bazlÄ± renk dÃ¼zeltmesi: dokusu fazla aÃ§Ä±k/koyu modelleri 2D paletine
  // yaklaÅŸtÄ±rÄ±r (beyaz taÅŸ patlamasÄ± olmaz, yapraklar daha az neon durur).
  var MODEL_TINT = {
    bigrock: [0.56, 0.54, 0.51], rocks: [0.58, 0.56, 0.53],
    oak: [0.80, 0.90, 0.74], pine: [0.70, 0.84, 0.70], birch: [0.92, 0.94, 0.90],
    autumn: [0.96, 0.88, 0.76], bush: [0.78, 0.88, 0.72],
    greywood: [0.82, 0.80, 0.78], deadtree: [0.80, 0.76, 0.72],
  };

  var WHITE = null;
  var sharedUniformNames = ['uSunDir', 'uSunCol', 'uSkyCol', 'uGndCol', 'uFillCol', 'uRimCol', 'uRimI', 'uCam', 'uPts', 'uPtCol', 'uPtI'];

  function blankTexture() {
    if (!THREE) return null;
    var c = document.createElement('canvas');
    c.width = c.height = 1;
    var g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 1, 1);
    var t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }

  function makeMaterial(cat) {
    var M = MATS[cat] || MATS.prop;
    var uniforms = {
      uMap: { value: WHITE },
      uHasMap: { value: 0 },
      uAlphaTest: { value: M.alphaTest },
      uTint: { value: new THREE.Color(1, 1, 1) },
      uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.45).normalize() },
      uSunCol: { value: new THREE.Color(1, 1, 1) },
      uSkyCol: { value: new THREE.Color(0.6, 0.7, 0.9) },
      uGndCol: { value: new THREE.Color(0.3, 0.25, 0.2) },
      uFillCol: { value: new THREE.Color(0.4, 0.5, 0.7) },
      uRimCol: { value: new THREE.Color(1.0, 0.92, 0.78) },
      uRimI: { value: 0.18 * M.rim },
      uBands: { value: M.bands },
      uPaint: { value: M.paint },
      uAo: { value: M.ao },
      uInk: { value: new THREE.Color(M.ink[0], M.ink[1], M.ink[2]) },
      uSat: { value: M.sat },
      uVar: { value: new THREE.Color(1, 1, 1) },
      uEmissive: { value: new THREE.Color(M.emissive ? M.emissive[0] : 0, M.emissive ? M.emissive[1] : 0, M.emissive ? M.emissive[2] : 0) },
      uPts: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
      uPtCol: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()] },
      uPtI: { value: [0, 0, 0, 0] },
      uCam: { value: new THREE.Vector3(0, 0, 100) },
      uThick: { value: 0 },
      uOutline: { value: new THREE.Color(M.ink[0], M.ink[1], M.ink[2]) },
    };
    var shaderMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: false,
      side: THREE.FrontSide,
      depthWrite: true,
    });
    shaderMat.userData.base = { bands: M.bands, sat: M.sat, paint: M.paint, ao: M.ao, rim: M.rim, thick: 0 };
    return shaderMat;
  }
  // ------------------------------------------------------------------
  // MODEL YÃœKLEME + NPR'E Ã‡EVÄ°RME
  // ------------------------------------------------------------------
  var TREE_SET = { oak: 1, pine: 1, birch: 1, autumn: 1, deadtree: 1, greywood: 1, bush: 1 };

  // İsme göre kategori tahmini: allowlist dışındaki modeller de doğru sanat
  // ayarlarını (kontur/AO/taş-ahşap paleti) alsın.
  function guessCategory(id) {
    var n = String(id || '').toLowerCase();
    if (/rock|stone|pillar|obelisk|grave|brick|ruin|crystal/.test(n)) return 'stone';
    if (/tree|oak|pine|birch|autumn|bush|flower|leaf|fern|grass/.test(n)) return 'foliage';
    if (/campfire|torch|lamp|lantern|fire|brazier|candle/.test(n)) return 'glow';
    if (/house|hut|barn|tavern|smithy|chapel|tower|windmill|gate|wall|fence|bridge|well|stall|tent|cart|barrel|crate|log|hay|stump|sign|banner|door|mill|shop/.test(n)) return 'wood';
    return 'prop';
  }

  // trees3d.js ile AYNI yaprak/kabuk dokusu (paylaÅŸÄ±lan, tek sefer Ã¼retilir).
  var leafTexShared = null, barkTexShared = null;
  function sharedLeafTex() {
    if (leafTexShared || !THREE) return leafTexShared;
    var kit = window.Setra3DTrees && window.Setra3DTrees.kit;
    var can = (kit && kit.leafTexture) ? kit.leafTexture() : procLeafCanvas();
    if (!can) return null;
    leafTexShared = new THREE.CanvasTexture(can);
    leafTexShared.wrapS = leafTexShared.wrapT = THREE.RepeatWrapping;
    leafTexShared.minFilter = THREE.LinearFilter; leafTexShared.magFilter = THREE.LinearFilter;
    leafTexShared.generateMipmaps = false;
    try { leafTexShared.colorSpace = THREE.SRGBColorSpace; } catch (e) {}
    return leafTexShared;
  }
  function sharedBarkTex() {
    if (barkTexShared || !THREE) return barkTexShared;
    var kit = window.Setra3DTrees && window.Setra3DTrees.kit;
    var can = (kit && kit.barkTexture) ? kit.barkTexture() : procBarkCanvas();
    if (!can) return null;
    barkTexShared = new THREE.CanvasTexture(can);
    barkTexShared.wrapS = barkTexShared.wrapT = THREE.RepeatWrapping;
    barkTexShared.minFilter = THREE.LinearFilter; barkTexShared.magFilter = THREE.LinearFilter;
    barkTexShared.generateMipmaps = false;
    try { barkTexShared.colorSpace = THREE.SRGBColorSpace; } catch (e) {}
    return barkTexShared;
  }

  function classify(root, modelId) {
    var cat = CATEGORY[modelId] || guessCategory(modelId);
    var meshes = [];
    root.traverse(function (o) { if (o.isMesh && o.geometry) meshes.push(o); });
    var box = new THREE.Box3().setFromObject(root);
    var size = box.getSize(new THREE.Vector3());
    var height = Math.max(0.001, size.y);
    for (var mi = 0; mi < meshes.length; mi++) {
      var o = meshes[mi];
      var mats = Array.isArray(o.material) ? o.material : [o.material];
      var src = mats[0] || null;
      var hasAlpha = false;
      try {
        var m0 = src;
        hasAlpha = !!(m0 && (m0.alphaTest > 0.05 || (m0.map && m0.transparent)));
      } catch (e) {}
      var partCat = hasAlpha ? 'foliage' : cat;
      var mat = makeMaterial(partCat);
      if (src && src.map) {
        var tex = src.map;
        try {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 1;
          tex.needsUpdate = true;
        } catch (e) {}
        mat.uniforms.uMap.value = tex;
        mat.uniforms.uHasMap.value = 1;
        mat.alphaTest = 0;
        mat.transparent = false;
      } else {
        // Dokusuz modeller (Ã¶r. bigrock/hut) beyaz patlamasÄ±n: kategori rengi.
        var base = MAT_BASE[partCat] || MAT_BASE.prop;
        var sc = src && src.color ? src.color : null;
        if (sc && (sc.r + sc.g + sc.b) < 2.4) {
          // Modelin kendi rengi anlamlÄ±ysa onu kullan (beyaz deÄŸilse)
          mat.uniforms.uTint.value.setRGB(sc.r * 0.9, sc.g * 0.9, sc.b * 0.9);
        } else {
          mat.uniforms.uTint.value.setRGB(base[0], base[1], base[2]);
        }
      }
      mat.uniforms.uAlphaTest.value = hasAlpha ? 0.42 : 0;
      // AÄŸaÃ§lar: piÅŸmiÅŸ sprite'larla AYNI yaprak/kabuk dokusu (2D boyanmÄ±ÅŸ his).
      // Kural: hasAlpha VEYA taÃ§ yÃ¼ksekliÄŸinde (>%45) ise yaprak, altÄ± gÃ¶vde.
      if (TREE_SET[modelId]) {
        try {
          var crown = true;
          if (!hasAlpha) {
            var gb = o.geometry.boundingBox || (o.geometry.computeBoundingBox(), o.geometry.boundingBox);
            var cy = 0;
            if (gb) {
              var ctr = gb.getCenter(new THREE.Vector3());
              ctr.applyMatrix4(o.matrixWorld);
              cy = ctr.y;
            }
            var mc = src && src.color;
            var looksGreen = !!(mc && mc.g > mc.r * 0.95 && mc.g > mc.b * 0.95 && mc.g > 0.10);
            crown = hasAlpha || looksGreen || cy > box.min.y + height * 0.52;
          }
          if (crown) {
            var kitUv = window.Setra3DTrees && window.Setra3DTrees.kit;
            if (kitUv && kitUv.uvPlanar) {
              // Modelin kendi UV'si yaprak dokusuna uymaz â†’ dÃ¼zlemsel UV Ã¼ret.
              if (o.geometry.attributes && o.geometry.attributes.uv) o.geometry.deleteAttribute('uv');
              kitUv.uvPlanar(o.geometry);
            }
            var lt = sharedLeafTex();
            if (lt) {
              mat.uniforms.uMap.value = lt;
              mat.uniforms.uHasMap.value = 1;
              mat.uniforms.uAlphaTest.value = 0.40;
            }
          } else {
            var bt = sharedBarkTex();
            if (bt) {
              mat.uniforms.uMap.value = bt;
              mat.uniforms.uHasMap.value = 1;
              mat.uniforms.uTint.value.setRGB(0.72, 0.60, 0.47);
              mat.uniforms.uAlphaTest.value = 0;
            }
          }
        } catch (e) { /* doku uygulanamazsa mevcut harita kalÄ±r */ }
      }
      // Model bazlÄ± renk dÃ¼zeltmesi (her parÃ§aya aynÄ± tint).
      var mt = MODEL_TINT[modelId];
      if (mt && mat.uniforms.uHasMap.value === 1) {
        mat.uniforms.uTint.value.setRGB(mt[0], mt[1], mt[2]);
      }
      o.material = mat;

      // Yaprak/alpha yÃ¼zeylerde ters-yÃ¼z kontur Ã§irkin durur â†’ yalnÄ±zca katÄ±
      // gÃ¶vdeye ince kontur ekle (mesh listesi toplandÄ±ktan sonra eklendiÄŸi
      // iÃ§in Ã¶zyineleme riski yok).
      var cfg = MATS[partCat] || MATS.prop;
      if (cfg.outline > 0) {
        var outlineFactor = hasAlpha ? 0.55 : 1.0;
        var outMat = makeMaterial(partCat);
        outMat.uniforms.uThick.value = 0.0045 * height * cfg.outline * outlineFactor;
        outMat.userData.base.thick = outMat.uniforms.uThick.value;
        outMat.side = THREE.BackSide;
        outMat.depthWrite = true;
        var shell = new THREE.Mesh(o.geometry, outMat);
        shell.renderOrder = -1;
        shell.frustumCulled = false;
        o.add(shell);
      }
    }
    return { cat: cat, size: size, height: height };
  }

  function ensureModel(id, url) {
    if (models[id]) return Promise.resolve(models[id]);
    if (loading[id]) return loading[id];
    loading[id] = new Promise(function (resolve) {
      try {
        loader.load(url, function (gltf) {
          try {
            var root = gltf.scene;
            // GLB sahnesini kendi grubumuza al: her render'da klonlamadan,
            // dÃ¶nÃ¼ÅŸÃ¼ grup Ã¼zerinden veriyoruz.
            var holder = new THREE.Group();
            holder.add(root);
            var info = classify(root, id);
            var entry = { holder: holder, root: root, size: info.size, height: info.height, cat: info.cat };
            models[id] = entry;
            resolve(entry);
          } catch (e) { state.failed = String(e && e.message || e); resolve(null); }
        }, undefined, function (err) {
          console.warn('[live3d] GLB yÃ¼klenemedi:', id, err && err.message);
          resolve(null);
        });
      } catch (e) { resolve(null); }
    });
    return loading[id];
  }

  // ------------------------------------------------------------------
  // RENDER + Ã–NBELLEK
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // AYAR (slider) SİSTEMİ — prototip panelinden canlı değiştirilir,
  // localStorage'a yazılır ve OYUN da aynı değerleri kullanır.
  // ------------------------------------------------------------------
  var TUNE_DEFAULT = {
    outline: 2.0,   // kontur kalınlığı çarpanı (0 = kontursuz)
    bands: 3.0,     // ton bandı (2 = sert cel, 6 = yumuşak)
    sat: 1.10,      // doygunluk
    paint: 0.40,    // fırça/boya gürültüsü
    ao: 0.90,       // stilize ambient occlusion
    rim: 0.45,      // kenar ışığı
    sun: 0.95,       // güneş şiddeti
    amb: 1.0,       // ortam ışığı
    night: 1.20,     // gece karanlığı (1 normal, 2 iki kat karanlık)
  };
  var TUNE_KEY = 'setra.live3d.tune';  var tune = {};
  (function loadTune() {
    for (var k in TUNE_DEFAULT) tune[k] = TUNE_DEFAULT[k];
    try {
      var raw = localStorage.getItem(TUNE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      for (var k2 in TUNE_DEFAULT) {
        var v = Number(o && o[k2]);
        if (isFinite(v)) tune[k2] = v;
      }
    } catch (e) {}
  })();

  // Slider değerlerini uygula: localStorage'a yaz + önbelleği temizle.
  function setTune(patch) {
    if (!patch || typeof patch !== 'object') return tune;
    for (var tk in TUNE_DEFAULT) {
      if (!(tk in patch)) continue;
      var tv = Number(patch[tk]);
      if (isFinite(tv)) tune[tk] = Math.max(0, tv);
    }
    try { localStorage.setItem(TUNE_KEY, JSON.stringify(tune)); } catch (e) {}
    cache.clear();
    if (typeof lastGood !== 'undefined') lastGood.clear();
    return tune;
  }

  // Gün/gece döngüsü: 6 dk gündüz + 6 dk gece (yumuşak, doğal geçiş).
  var clock = { on: true, daySec: 360, nightSec: 360, paused: false };
  function tickClock(dt) {
    if (!clock.on || clock.paused || !(dt > 0)) return;
    var h = state.timeOfDay;
    var day = h >= 5.5 && h < 19.5;
    var span = day ? clock.daySec : clock.nightSec;
    var hours = day ? 14 : 10;
    state.timeOfDay = (h + (dt / Math.max(1, span)) * hours) % 24;
  }

  var cache = new Map();     // key -> { canvas, ox, oy, w, h, used }
  var lastGood = new Map();  // taban anahtar -> son başarılı render (titremeyi önler)
  var cacheLimit = 220;
  function tuneCacheLimit() { return state.quality === 'extreme' ? 90 : state.quality === 'light' ? 220 : 150; }
  var LIGHT_STEPS = 8;       // Ä±ÅŸÄ±k kuantalamasÄ± (Ã¶nbellek anahtarÄ±)

  function lightKey(sun, lights) {
    var q = Math.round(sun.day * LIGHT_STEPS) + ':' + Math.round(sun.sunset * LIGHT_STEPS);
    var sig = '';
    for (var i = 0; i < lights.length; i++) {
      var L = lights[i];
      sig += Math.round(L.q * 10) + ',';
    }
    return q + '|' + sig;
  }

  // Render edilen karenin alpha sÄ±nÄ±rlarÄ±nÄ± ve taban noktasÄ±nÄ± bul.
  function alphaInfo(ctx2d, w, h) {
    var data;
    try { data = ctx2d.getImageData(0, 0, w, h).data; } catch (e) { return null; }
    var minX = w, minY = h, maxX = -1, maxY = -1;
    var aStep = (w * h > 200000) ? 2 : 1;   // buyuk tuvallerde 4x daha hizli tarama
    for (var y = 0; y < h; y += aStep) {
      var row = y * w * 4;
      for (var x = 0; x < w; x += aStep) {
        if (data[row + x * 4 + 3] > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  }

  var tmpCanvas = null, tmpCtx = null;

  function renderEntry(entry, rot, sun, lights, res, variant) {
    res = Math.max(96, Math.min(640, Math.round(res || RES)));
    if (renderer.domElement.width !== res || renderer.domElement.height !== res) renderer.setSize(res, res, false);
    var cam = camera, sz = entry.size;
    var elev = 0.6155;
    var targetH = entry.height;
    var cosE = Math.cos(elev), sinE = Math.sin(elev);
    var diag = Math.hypot(sz.x, sz.z) || Math.max(sz.x, sz.z, 0.5);
    var projW = diag;
    var projH = targetH * cosE + diag * sinE;
    var pad = 1.18;
    var aspect = 1.0;
    var vExtent = Math.max(projH * pad, (projW * pad) / aspect);
    var hExtent = vExtent * aspect;
    cam.left = -hExtent / 2; cam.right = hExtent / 2;
    cam.top = vExtent / 2; cam.bottom = -vExtent / 2;
    cam.near = 0.05;
    cam.far = Math.max(sz.x, sz.y, sz.z) * 12 + 40;
    cam.updateProjectionMatrix();

    var target = new THREE.Vector3(0, targetH * 0.5, 0);
    var dist = Math.max(sz.x, sz.y, sz.z) * 4 + 12;
    var az = (Number(rot) || 0) + Math.PI / 4;
    cam.position.set(
      target.x + Math.sin(az) * cosE * dist,
      target.y + sinE * dist,
      target.z + Math.cos(az) * cosE * dist
    );
    cam.lookAt(target);

    // IÅŸÄ±k Ã¼niformlarÄ±nÄ± SADECE bu nesnenin malzemelerine yaz (Ã¶nbellek
    // anahtarÄ± Ä±ÅŸÄ±ÄŸÄ± zaten kapsÄ±yor; baÅŸka modellere dokunmak gereksiz).
    var camPos = cam.position;
    entry.root.traverse(function (o) {
      if (!o.isMesh || !o.material || !o.material.uniforms) return;
      var u = o.material.uniforms;
      if (!u.uSunDir) return;
      u.uSunDir.value.set(sun.dir[0], sun.dir[1], sun.dir[2]);
      u.uSunCol.value.setRGB(sun.color[0], sun.color[1], sun.color[2]);
      u.uSkyCol.value.setRGB(sun.sky[0], sun.sky[1], sun.sky[2]);
      u.uGndCol.value.setRGB(sun.ground[0], sun.ground[1], sun.ground[2]);
      u.uFillCol.value.setRGB(sun.fill[0], sun.fill[1], sun.fill[2]);
      u.uRimI.value = 0.16 * (0.30 + 0.70 * sun.day) * tune.rim;
      if (u.uVar && variant) u.uVar.value.setRGB(variant[0], variant[1], variant[2]);
      u.uBands.value = Math.max(1.2, u.uBands.value);
      if (o.material.userData && o.material.userData.base) {
        var B = o.material.userData.base;
        u.uBands.value = Math.max(1.2, B.bands * tune.bands);
        u.uSat.value = B.sat * tune.sat;
        u.uPaint.value = B.paint * tune.paint;
        u.uAo.value = Math.min(1.0, B.ao * tune.ao);
        if (u.uThick && B.thick) u.uThick.value = Math.max(0.000001, B.thick * tune.outline);
      }
      u.uCam.value.copy(camPos);
      for (var i = 0; i < 4; i++) {
        var L = lights[i];
        if (!L) { u.uPtI.value[i] = 0; continue; }
        u.uPts.value[i].set(L.x, L.y, L.z, L.range);
        u.uPtCol.value[i].setRGB(L.col[0], L.col[1], L.col[2]);
        u.uPtI.value[i] = L.i;
      }
    });

    scene.clear();
    scene.add(entry.holder);
    renderer.clear();
    renderer.render(scene, cam);
    scene.remove(entry.holder);

    var c = document.createElement('canvas');
    c.width = res; c.height = res;
    var g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(renderer.domElement, 0, 0);

    var b = alphaInfo(g, res, res);
    if (!b) return null;
    // Taban noktasÄ±: dÃ¼nya orijininin ekran karÅŸÄ±lÄ±ÄŸÄ± (bake ile birebir aynÄ±).
    var v3 = new THREE.Vector3(0, 0, 0).project(cam);
    var gx = (v3.x * 0.5 + 0.5) * res;
    var gy = (-v3.y * 0.5 + 0.5) * res;

    var cw = Math.max(1, b.maxX - b.minX + 1);
    var chh = Math.max(1, b.maxY - b.minY + 1);
    var out = document.createElement('canvas');
    out.width = cw; out.height = chh;
    var og = out.getContext('2d');
    og.drawImage(c, b.minX, b.minY, cw, chh, 0, 0, cw, chh);
    return { canvas: out, ox: gx - b.minX, oy: gy - b.minY, w: cw, h: chh, baseH: chh };
  }

  // ------------------------------------------------------------------
  // IÅIKLAR (dÃ¼nya uzayÄ±)
  // ------------------------------------------------------------------
  var lights = [];        // { x,y,z, col, range, i, q, id }
  function addLight(x, y, z, col, range, intensity, id) {
    var c = typeof col === 'string' ? hexRgb(col) : (col || [1, 0.7, 0.35]);
    var L = {
      x: x, y: y, z: z, col: c,
      range: Math.max(1, Number(range) || 120),
      i: Math.max(0, Number(intensity) || 1),
      q: 1, id: id || '',
    };
    lights.push(L);
    if (lights.length > 16) lights.shift();
    return L;
  }
  function hexRgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return [1, 0.7, 0.35];
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }

  var lastLightScan = 0;
  // Motorun scenery listesinden meÅŸale/kamp ateÅŸi topla (yalnÄ±zca yakÄ±nlar).
  // Elle eklenen Ä±ÅŸÄ±klar (addLight) KORUNUR; sadece tarama kaynaklÄ± olanlar
  // yenilenir â€” aksi halde her tarama kullanÄ±cÄ± Ä±ÅŸÄ±klarÄ±nÄ± siliyordu.
  function scanLights(engine, t) {
    if (!engine || !engine.scenery || !engine.player) return;
    if (t - lastLightScan < 0.25) return;
    lastLightScan = t;
    var px = engine.player.x, py = engine.player.y;
    var need = [];
    for (var i = 0; i < engine.scenery.length; i++) {
      var s = engine.scenery[i];
      var mid = s && (s.model || s.type);
      if (mid !== 'campfire' && mid !== 'lamp' && mid !== 'torch') continue;
      var dx = s.wx - px, dy = s.wy - py;
      if (dx * dx + dy * dy > 900 * 900) continue;
      need.push(s);
      if (need.length >= 12) break;
    }
    need.sort(function (a, b) {
      return (a.wx - px) * (a.wx - px) + (a.wy - py) * (a.wy - py) - ((b.wx - px) * (b.wx - px) + (b.wy - py) * (b.wy - py));
    });
    // Elle eklenenleri koru, tarama Ä±ÅŸÄ±klarÄ±nÄ± at.
    var manual = lights.filter(function (L) { return !L.scan; });
    lights.length = 0;
    for (var m = 0; m < manual.length; m++) lights.push(manual[m]);
    for (var k = 0; k < Math.min(4, need.length) && lights.length < 8; k++) {
      var s2 = need[k];
      var warm = s2.model === 'lamp' ? 0.9 : 1.0;
      var flick = 0.86 + 0.14 * Math.sin(t * 7.3 + s2.wx * 0.11) * Math.sin(t * 3.1 + s2.wy * 0.07);
      var L = addLight(s2.wx, 26, s2.wy, [1.0, 0.62 * warm, 0.28], 210, 2.6 * flick, s2.model);
      L.scan = 1;
    }
  }

  // DÃ¼nya koordinatÄ± (server/engine) â†’ 3D dÃ¼nya birimleri. Engine'de w=boÅŸluk
  // katsayÄ±sÄ± yok; kamp ateÅŸi Ä±ÅŸÄ±ÄŸÄ± yerel Ã¶lÃ§ekte zaten yakÄ±n olduÄŸu iÃ§in
  // Ä±ÅŸÄ±klarÄ± AYNI uzayda (nesne uzayÄ±) tutmak yeterli. IÅŸÄ±k konumu nesneye
  // gÃ¶re gÃ¶reli verilir (aÅŸaÄŸÄ±da adjustLightsRelative).
  function adjustLightsRelative(wx, wy) {
    for (var i = 0; i < lights.length; i++) {
      var L = lights[i];
      L.x = (L._wx != null ? L._wx : L.x) - wx;
      L.z = (L._wy != null ? L._wy : L.z) - wy;
      L.y = L._y != null ? L._y : L.y;
    }
  }

  // ------------------------------------------------------------------
  // Ã‡Ä°ZÄ°M (motorun derinlik sÄ±ralÄ± dÃ¶ngÃ¼sÃ¼nden Ã§aÄŸrÄ±lÄ±r)
  // ------------------------------------------------------------------
  var warned = Object.create(null);

  function shouldDraw(s) {
    if (!state.enabled || state.failed || !state.ready) return false;
    // KullanÄ±cÄ± 3D dekoru tamamen kapattÄ±ysa (trees3d) canlÄ± katman da kapanÄ±r.
    if (window.Setra3DTrees && window.Setra3DTrees.enabled === false) return false;
    if (!s) return false;
    var model = s.model;
    if (!model && s.type === 'tree') model = 'pine';
    if (!model) return false;
    if (MODELS[model]) return true;
    // Allowlist disindaki her GLB dekor da canli 3D olur (ev, kule, duvar,
    // ficii, sandik...). Bilinmeyen modelde sprite yolu korunur.
    var dcfg = window.Setra3DTrees && window.Setra3DTrees.decor;
    if (!dcfg) return false;
    if (dcfg.glb && dcfg.glb.models && dcfg.glb.models[model]) return true;
    if (dcfg.tree && dcfg.tree.models && dcfg.tree.models[model]) return true;
    return false;
  }

  function draw(ctx, s, x, y, engine) {
    if (!shouldDraw(s)) return false;
    try {      var mid = s.model || 'pine';
      var entry = models[mid];
      if (!entry) {
        // henÃ¼z yÃ¼klenmedi â†’ yÃ¼kle, bu kare sprite ile devam
        if (!loading[mid] && THREE) ensureModel(mid, modelUrl(mid));
        else if (!state.ready) loadThree();
        return false;
      }
      var trees = window.Setra3DTrees;
      var fp = trees && trees.footprint ? trees.footprint(s, engine) : null;
      var h = fp ? fp.h : (Number(s.height) || 70);
      var rot = Number(s.rot) || 0;
      var sun = state._sun || sunFor(state.timeOfDay);
      // 3D birim / dÃ¼nya-px oranÄ±: Ä±ÅŸÄ±k konumu ve menzili model uzayÄ±na Ã§evrilir.
      var unitsPerPx = entry.height / Math.max(1, h);
      // Bu nesne iÃ§in en yakÄ±n 4 Ä±ÅŸÄ±k (gÃ¶reli konum)
      var local = [];
      for (var i = 0; i < lights.length && local.length < 4; i++) {
        var L = lights[i];
        var lx = L.x, lz = L.z;
        var d2 = (lx - s.wx) * (lx - s.wx) + (lz - s.wy) * (lz - s.wy);
        if (d2 > L.range * L.range * 4) continue;
        var dd = Math.sqrt(d2);
        local.push({
          x: (lx - s.wx) * unitsPerPx,
          y: L.y * unitsPerPx,
          z: (lz - s.wy) * unitsPerPx,
          range: L.range * unitsPerPx,
          col: L.col,
          i: L.i * clamp(1 - dd / (L.range * 2), 0, 1),
          q: clamp(1 - dd / (L.range * 2), 0, 1),
        });
      }
      var lk = lightKey(sun, local);
      var hBucket = Math.round(h / 8);
      // Render çözünürlüğü nesnenin EKRAN boyutuna bağlı: büyük bina/şapel
      // 320px'te kalıp "pixel" görünmesin. 64px kovalara yuvarlanır (önbellek).
      var dpr = Math.min(2, (window.devicePixelRatio || 1));
      var zoom = Number(engine && engine.zoom) || 1;
      var screenH = h * zoom * dpr;
      var cap = state.quality === 'light' ? 384 : state.quality === 'extreme' ? 1024 : 768;
      var vh = Math.abs(Math.sin(s.wx * 0.37 + s.wy * 0.59));
      var variant = [0.86 + (vh % 1) * 0.26, 0.90 + ((vh * 7.3) % 1) * 0.20, 0.84 + ((vh * 13.7) % 1) * 0.24];
      var vKey = Math.round(vh * 3);
      var resBucket = Math.max(192, Math.min(cap, Math.round(screenH * 1.25 / 64) * 64));
      var key = mid + '|' + Math.round(rot * 8 / Math.PI) + '|' + lk + '|' + hBucket + '|' + resBucket + '|' + vKey + '|' + state.quality;
      var hit = cache.get(key);
      if (!hit) {
        // Kare baÅŸÄ±na yeni render bÃ¼tÃ§esi: Ä±sÄ±nma sÄ±rasÄ±nda bile FPS dÃ¼ÅŸmesin.
        var budget = state.quality === 'light' ? 1 : state.quality === 'extreme' ? 6 : 3;
        if (resBucket >= 384) budget = Math.min(budget, 2);
        if ((state.frameRenders || 0) >= budget) {
          var lg = lastGood.get(baseKey);
          if (lg) { hit = lg; } else return false; // hiç 3D pişmemişse sprite (tek sefer)
        }
        if (!hit) {
          state.frameRenders = (state.frameRenders || 0) + 1;
          var res = renderEntry(entry, rot, sun, local, resBucket, variant);
          if (res) {
            hit = res;
            cache.set(key, hit);
            lastGood.set(baseKey, hit);
            state.rendered++;
          } else {
            var lg2 = lastGood.get(baseKey);
            if (lg2) { hit = lg2; } else return false;
          }
          if (cache.size > tuneCacheLimit()) {
            var firstKey = cache.keys().next().value;
            cache.delete(firstKey);
          }
        }
      } else state.cacheHits++;

      // Ã–lÃ§ek: render edilen gÃ¶rÃ¼nÃ¼r yÃ¼kseklik â†’ istenen dÃ¼nya yÃ¼ksekliÄŸi (h)
      var k = h / Math.max(1, hit.baseH);
      var dw = hit.w * k, dh = hit.h * k;
      // RÃ¼zgÃ¢r: aÄŸaÃ§larda tabana gÃ¶re Ã§ok hafif salÄ±nÄ±m (sprite ile aynÄ± his).
      var swayOn = window.SETRA_FOLIAGE_WIND !== false && (mid === 'oak' || mid === 'pine' || mid === 'birch' || mid === 'autumn');
      var sway = 0;
      if (swayOn) {
        var t = (engine && engine.time) || 0;
        var ph = (s.swayOffset || 0);
        sway = Math.sin(t * 1.7 + ph) * 0.012;
      }
      ctx.save();
      ctx.translate(x, y);
      if (sway) ctx.rotate(sway);
      ctx.drawImage(hit.canvas, -hit.ox * k, -hit.oy * k, dw, dh);
      ctx.restore();
      return true;
    } catch (e) {
      var msg = (e && e.message) || String(e);
      if (!warned[msg]) {
        warned[msg] = 1;
        console.warn('[live3d] Ã§izim hatasÄ± (sprite yoluna dÃ¶nÃ¼ldÃ¼):', msg);
      }
      return false;
    }
  }

  function modelUrl(id) {
    var cfg = window.Setra3DTrees && window.Setra3DTrees.decor;
    var glb = cfg && cfg.glb && cfg.glb.models;
    var tree = cfg && cfg.tree && cfg.tree.models;
    return (glb && glb[id]) || (tree && tree[id]) || ('/newassets/' + id + '.glb');
  }

  // ------------------------------------------------------------------
  // API
  // ------------------------------------------------------------------
  function setEnabled(on) {
    state.enabled = !!on;
    savePrefs();
    if (state.enabled) loadThree();
    return state.enabled;
  }

  loadThree().then(function (ok) {
    if (!ok) return;
    // SÄ±k kullanÄ±lan modelleri arka planda hazÄ±rla (oyunu bloklamadan).
    ['oak', 'pine', 'bigrock', 'hut', 'campfire'].forEach(function (id, i) {
      setTimeout(function () { if (state.enabled) ensureModel(id, modelUrl(id)); }, 800 + i * 350);
    });
  });

  window.SetraLive3D = {
    version: 1,
    shouldDraw: shouldDraw,
    draw: draw,
    setEnabled: setEnabled,
    isEnabled: function () { return !!state.enabled && !state.failed && state.ready; },
    setQuality: function (q) {
      if (q === 'light' || q === 'normal' || q === 'extreme') { state.quality = q; savePrefs(); cache.clear(); }
      return state.quality;
    },
    setTimeOfDay: function (h) {
      state.timeOfDay = ((Number(h) || 0) % 24 + 24) % 24;
      savePrefs();
      renderer = renderer; // Ã¶nbellek Ä±ÅŸÄ±k anahtarÄ±yla kendini yeniler
      return state.timeOfDay;
    },
    getTimeOfDay: function () { return state.timeOfDay; },
    // --- Görsel ayarlar (prototip panelindeki slider'lar buraya yazar) ---
    setTune: setTune,
    getTune: function () {
      var o = {};
      for (var k in TUNE_DEFAULT) o[k] = tune[k];
      return o;
    },
    resetTune: function () {
      var d = {};
      for (var k in TUNE_DEFAULT) d[k] = TUNE_DEFAULT[k];
      return setTune(d);
    },
    addLight: addLight,
    clearLights: function () { lights.length = 0; },
    stats: function () {
      return {
        ready: state.ready, enabled: state.enabled, failed: state.failed,
        models: Object.keys(models).length, cache: cache.size,
        rendered: state.rendered, hits: state.cacheHits, lights: lights.length,
        sun: sunFor(state.timeOfDay),
      };
    },
    // Motorun kare dÃ¶ngÃ¼sÃ¼nden Ã§aÄŸrÄ±lÄ±r (Ä±ÅŸÄ±k taramasÄ± + kare bÃ¼tÃ§esi).
    // Motorun kare dongusunden cagrilir (isik taramasi + kare butcesi).
    tick: function (engine, dt) {
      state.frameRenders = 0;
      var step = Number(dt);
      tickClock(isFinite(step) && step > 0 ? Math.min(step, 0.25) : 0.016);
      // Gunes kare basina BIR kez (nesne basina degil) -> GC/CPU tasarrufu.
      state._sun = sunFor(state.timeOfDay);
      try { scanLights(engine, (engine && engine.time) || 0); } catch (e) {}
    },
    // Dongu kontrolu: setCycle(false) -> saat sabit kalir.
    setCycle: function (on, daySec, nightSec) {
      clock.on = on !== false;
      if (Number(daySec) > 10) clock.daySec = Number(daySec);
      if (Number(nightSec) > 10) clock.nightSec = Number(nightSec);
      return { on: clock.on, daySec: clock.daySec, nightSec: clock.nightSec };
    },
    getCycle: function () { return { on: clock.on, daySec: clock.daySec, nightSec: clock.nightSec }; },
    debugSources: { vert: VERT, frag: FRAG },
  };
})();
