const fs = require("fs");
const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./server/socketHandlers");
const editorRoutes = require("./server/editorRoutes");

const PORT = process.env.PORT || 3000;
const MUSIC_DIR = path.join(__dirname, "public", "music");
const SOUND_DIR = path.join(__dirname, "public", "sounds");
const AUDIO_EXT = [".mp3", ".ogg", ".wav", ".m4a", ".flac"];

const app = express();
app.use(express.json({ limit: "50mb" }));

// GameCraft editörü (farklı port, örn. 3054) ses/asset listesini ve
// önizlemeyi doğrudan çekebilsin diye salt-okunur GET'lere CORS.
// Oyun mantığına dokunmaz, sadece header ekler.
app.use((req, res, next) => {
  if (req.method === "GET" && (req.path === "/api/sounds" || req.path === "/api/music" || req.path.startsWith("/sounds/") || req.path.startsWith("/music/") || req.path.startsWith("/images/"))) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  next();
});

// Ana sayfayi hicbir zaman tarayicida tutma: her acilista yeni surum yuklenir,
// boylece eski cached bir build'den kaynakli 404 / bos ekran yasanmaz.
app.get("/", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  // Eski bir index.html/js önbellekte kalırsa oyun boş ekrana düşüyordu.
  // Tarayıcı önbelleğini otomatik temizle (localStorage/session korunur).
  res.setHeader("Clear-Site-Data", '"cache"');
  next();
});

// HTML/JS/CSS asla önbellekte tutulmasın: her yenilemede güncel sürüm gelsin.
app.use((req, res, next) => {
  if (req.method === "GET" && /\.(?:html?|js|css)$/i.test(req.path)) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// 3D varlık denemesi (newassets/*.glb) — public dışında tutuluyor, salt okunur servis.
app.use("/newassets", express.static(path.join(__dirname, "newassets")));

app.use("/editor", editorRoutes);

function listAudioFiles(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()))
      .sort();
  } catch (e) {
    return []; // folder may not exist yet
  }
}

app.get("/api/music", (req, res) => {
  // Legacy root files play as town music (old behavior preserved).
  const tracks = listAudioFiles(MUSIC_DIR);
  const townSub = listAudioFiles(path.join(MUSIC_DIR, "town"));
  const combat = listAudioFiles(path.join(MUSIC_DIR, "combat"));
  const victoryFiles = listAudioFiles(path.join(MUSIC_DIR, "victory"));
  res.json({
    tracks,
    town: townSub.length ? townSub.map((f) => "town/" + f) : tracks,
    combat: combat.map((f) => "combat/" + f),
    victory: victoryFiles.length ? "victory/" + victoryFiles[0] : null,
  });
});

app.get("/api/sounds", (req, res) => {
  let sounds = [];
  try {
    sounds = fs
      .readdirSync(SOUND_DIR)
      .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => ({
        id: path.basename(f, path.extname(f)),
        url: "/sounds/" + f,
      }));
  } catch (e) {
    // sounds folder may not exist yet
  }
  res.json({ sounds });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
  // Kalıcı kıta yapılandırması (world_setra.json: 12 bin props) tek pakette
  // ~1.3 MB. Sıkıştırma açık olmadan her "travel:map" isteği tarayıcıyı
  // kilitliyordu; eşik altındaki küçük paketler sıkıştırılmaz.
  perMessageDeflate: {
    threshold: 1024,
    zlibDeflateOptions: { level: 6 },
  },
});

// Dünya Kurucu (editorRoutes) "Oyuna Uygula" sonrası tüm istemcilere haber
// verebilsin diye io'yu app'e bağla.
app.set("io", io);

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`The Setra Game listening on port ${PORT}`);
});
