#!/usr/bin/env node
/**
 * SETRA — scripts/world_reload.js
 * SADECE HARİTAYI oyuna yükle.
 *
 * Ne yapar:
 *   Çalışan sunucuya POST /editor/api/world/reload gönderir →
 *   world_setra.json DİSKTEN yeniden okunur, sunucu belleği tazelenir,
 *   bağlı istemcilere "world:updated" gider (oyun haritayı kendisi yeniler).
 *
 * Ne yapmaz:
 *   - Dosyaya yazmaz (elle/GameCraft dışı yapılan değişiklikleri EZMEZ)
 *   - content.js / data/*.json içeriğine DOKUNMAZ
 *
 * Kullanım:
 *   node scripts/world_reload.js                 (http://localhost:3000)
 *   node scripts/world_reload.js --port 3054
 *   CONTENT_EDIT_TOKEN=... node scripts/world_reload.js   (canlı sunucu)
 */
"use strict";
const http = require("http");

const argv = process.argv.slice(2);
let port = Number(process.env.PORT) || 3000;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--port") port = Number(argv[++i]) || port;
}
const token = process.env.CONTENT_EDIT_TOKEN || "";
const body = "{}";
const path = "/editor/api/world/reload" + (token ? "?token=" + encodeURIComponent(token) : "");

const req = http.request(
  { host: "127.0.0.1", port, path, method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
  (res) => {
    let data = "";
    res.setEncoding("utf8");
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      let json = null;
      try { json = JSON.parse(data); } catch (_) { /* düz metin */ }
      if (res.statusCode === 200 && json && json.ok) {
        console.log("✔ " + (json.note || "Harita diskten yüklendi."));
        process.exit(0);
      }
      if (res.statusCode === 404) {
        console.log("✖ Sunucuda /api/world/reload yok (eski sürüm çalışıyor olabilir).");
        console.log("  → Sunucuyu yeniden başlat: npm start");
      } else {
        console.log("✖ HTTP " + res.statusCode + " — " + ((json && (json.error || json.message)) || data.slice(0, 300)));
      }
      process.exit(1);
    });
  }
);
req.on("error", (e) => {
  console.log("✖ Sunucuya ulaşılamadı (port " + port + "): " + e.message);
  console.log("  → Oyun klasöründe `npm start` çalışıyor mu?");
  process.exit(1);
});
req.write(body);
req.end();
