#!/usr/bin/env node
/**
 * scripts/launcher.js — gelistirme baslaticisi (restart'li).
 *
 * Sunucuyu bir cocuk surec olarak calistirir ve BU pencerede tus dinler:
 *   R   -> sunucuyu kapatip yeniden baslat
 *   Q   -> cik   (Esc ve Ctrl+C de cikar)
 *   D   -> debug: son hata/uyari satirlarini hatirlat (ipucu)
 *
 * Kullanim:
 *   node scripts/launcher.js --name "SETRA - Oyun" --url http://localhost:3000 -- node server.js
 *   node scripts/launcher.js --name "GameCraft" --cwd .\gamecraft-rpg-studiov1 -- npm run dev
 *
 * Ek bayraklar:
 *   --cwd DIR        cocuk surecin calisma klasoru (varsayilan: simdiki klasor)
 *   --delay MS       yeniden baslatmadan once bekleme (varsayilan 600)
 *   --no-keys        tus dinlemeyi kapat (CI / TTY olmayan ortamlar)
 */

"use strict";

const { spawn, spawnSync } = require("child_process");
const path = require("path");

const argv = process.argv.slice(2);
const sep = argv.indexOf("--");
const flags = sep < 0 ? argv : argv.slice(0, sep);
const command = sep < 0 ? [] : argv.slice(sep + 1);

if (!command.length) {
  console.error(
    "Kullanim: node scripts/launcher.js [--name AD] [--url URL] [--cwd DIR] -- <komut> [args...]"
  );
  process.exit(1);
}

function opt(name, fallback) {
  const i = flags.indexOf(name);
  return i >= 0 && flags[i + 1] ? flags[i + 1] : fallback;
}

const NAME = opt("--name", "Setra");
const URL_TEXT = opt("--url", "");
const CWD = path.resolve(opt("--cwd", process.cwd()));
const DELAY = Math.max(0, Number(opt("--delay", 600)) || 600);
const USE_KEYS = !flags.includes("--no-keys");
// --keys: TTY olmasa bile tus dinle (sarmalayici/pipe ile calistirmak icin).
const FORCE_KEYS = flags.includes("--keys");

const LINE = "=".repeat(58);
let child = null;
let generation = 0;
let busy = false;
let quitting = false;
let startCount = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (msg) => console.log(msg);

function banner(msg) {
  say("");
  say(LINE);
  say("  " + msg);
  say(LINE);
}

function status() {
  say("");
  say(LINE);
  say("  " + NAME);
  if (URL_TEXT) say("  Adres : " + URL_TEXT);
  say("  R = yeniden baslat     Q = cik     (bu pencereyi kapatma)");
  say(LINE);
  say("");
}

function killChild() {
  return new Promise((resolve) => {
    const proc = child;
    if (!proc || proc.exitCode !== null || proc.signalCode) {
      child = null;
      resolve();
      return;
    }
    child = null;
    // Nesil artisi: bu surecin "durdu" bildirimi kendi restart'imiz yuzunden
    // geliyorsa sessizce yutulsun.
    generation += 1;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    proc.once("exit", () => setTimeout(finish, 200));
    if (process.platform === "win32") {
      try {
        spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
      } catch {
        try { proc.kill("SIGKILL"); } catch { /* yok say */ }
      }
    } else {
      try { proc.kill("SIGTERM"); } catch { /* yok say */ }
      setTimeout(() => { try { proc.kill("SIGKILL"); } catch { /* yok say */ } }, 1200);
    }
    setTimeout(finish, 4000);
  });
}

function start() {
  const [cmd, ...args] = command;
  generation += 1;
  const gen = generation;
  startCount += 1;

  // `npm`/`npx` Windows'ta .cmd oldugu icin shell gerektirir; digerlerinde
  // shell KAPALI (argumanlar dogru kacislanir, PID de dogrudan node olur).
  const useShell = process.platform === "win32" && /^(npm|npx|yarn|pnpm|bun)$/i.test(cmd);
  let spawnCmd = cmd;
  let spawnArgs = args;
  if (useShell) {
    // shell modunda tek bir komut satiri ver: Node'un DEP0190 uyarisi cikmaz.
    spawnCmd = [cmd, ...args].map((p) => (/\s/.test(p) ? `"${p}"` : p)).join(" ");
    spawnArgs = [];
  }

  say(`[*] Calistiriliyor: ${cmd} ${args.join(" ")}`);
  say(`    Klasor: ${CWD}`);

  child = spawn(spawnCmd, spawnArgs, {
    cwd: CWD,
    stdio: ["ignore", "inherit", "inherit"],
    shell: useShell,
    env: process.env,
  });

  child.on("error", (err) => {
    if (gen !== generation) return;
    say(`[!] Surec baslatilamadi: ${err && err.message ? err.message : err}`);
    child = null;
  });

  child.on("exit", (code, signal) => {
    if (gen !== generation || quitting) return;
    child = null;
    const why = signal ? `sinyal ${signal}` : `kod ${code}`;
    say("");
    say(`[!] Sunucu durdu (${why}).`);
    if (code === 1) say("    Ipucu: port dolu olabilir (kapat.bat) ya da bir hata var; yukari kaydir.");
    say("    Yeniden baslatmak icin R, cikmak icin Q.");
  });
}

async function restart() {
  if (busy || quitting) return;
  busy = true;
  banner(`Yeniden baslatiliyor... (${startCount}. calisma kapatiliyor)`);
  await killChild();
  await sleep(DELAY);
  if (!quitting) start();
  busy = false;
}

async function shutdown() {
  if (quitting) return;
  quitting = true;
  banner("Kapatiliyor...");
  await killChild();
  if (USE_KEYS && process.stdin.isTTY) {
    try { process.stdin.setRawMode(false); } catch { /* yok say */ }
  }
  say("[v] Cikildi.");
  process.exit(0);
}

function setupKeys() {
  if (!USE_KEYS) {
    say("[i] Tus dinleme kapali (--no-keys). Cikmak icin Ctrl+C.");
    return;
  }
  const tty = !!process.stdin.isTTY;
  if (!tty && !FORCE_KEYS) {
    say("[i] TTY yok: R/Q tuslari devre disi. Cikmak icin Ctrl+C.");
    return;
  }
  if (tty) {
    try {
      process.stdin.setRawMode(true);
    } catch {
      say("[i] Tus dinleme baslatilamadi (setRawMode yok). Cikmak icin Ctrl+C.");
      return;
    }
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (buf) => {
    if (quitting) return;
    let acted = false;
    for (const raw of String(buf)) {
      const key = raw.toLowerCase();
      if (key === "\u0003" || key === "\u0004" || key === "q" || key === "\u001b") {
        if (!acted) { acted = true; void shutdown(); } // Ctrl+C / Ctrl+D / q / Esc
        continue;
      }
      if (key === "r") {
        if (!acted) { acted = true; void restart(); }
        continue;
      }
      if (key === "d") {
        say("");
        say("[i] R = yeniden baslat, Q = cik. Hata varsa bu pencerede yukarida gorunur.");
      }
    }
  });
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
process.on("SIGHUP", () => void shutdown());
process.on("uncaughtException", (err) => {
  say("[!] launcher hatasi: " + (err && err.message ? err.message : err));
});

banner(`${NAME} baslatiliyor`);
screenTitle();
status();
start();
setupKeys();

function screenTitle() {
  // Konsol basligi: pencereyi kapatan kisi ne oldugunu anlasin.
  process.title = `${NAME} (R = restart, Q = cik)`;
}
