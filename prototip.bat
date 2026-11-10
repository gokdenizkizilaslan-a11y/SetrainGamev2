@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "PORT=3000"
set "PAGE=/_live3d.html?hour=16.2"

where node >nul 2>&1
if errorlevel 1 (
  echo [HATA] Node.js bulunamadi. https://nodejs.org adresinden LTS surumu kurun.
  pause
  exit /b 1
)

rem ---- Sunucu zaten calisiyor mu? ----
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient('127.0.0.1', %PORT%); $c.Close(); exit 0 } catch { exit 1 }"
if not errorlevel 1 goto OPEN

echo Setra sunucusu baslatiliyor (port %PORT%)...
start "Setra Server" /min cmd /c "node server.js"
echo Sunucunun acilmasi bekleniyor...
powershell -NoProfile -Command "for($i=0;$i -lt 40;$i++){ try { Invoke-WebRequest -UseBasicParsing ('http://localhost:%PORT%/') -TimeoutSec 1 | Out-Null; exit 0 } catch { Start-Sleep -Milliseconds 400 } } exit 1"
if errorlevel 1 (
  echo [HATA] Sunucu acilmadi. Bu pencereyi kapatmayin; "Setra Server" penceresindeki hatayi okuyun.
  pause
  exit /b 1
)

:OPEN
echo Prototip aciliyor: http://localhost:%PORT%%PAGE%
start "" "http://localhost:%PORT%%PAGE%"
exit /b 0
