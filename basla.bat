@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Setra - Oyun Sunucusu (kapatmak icin Ctrl+C)

echo =========================================================
echo   SETRA - Yerel Oyun Sunucusu
echo   Adres : http://localhost:3000
echo   Kapat : bu pencerede Ctrl+C  (ya da kapat.bat)
echo =========================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [HATA] Node.js bulunamadi. https://nodejs.org adresinden LTS surumu kurun.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\express" (
  echo [*] Paketler eksik, kuruluyor: npm install ...
  call npm install
  if errorlevel 1 (
    echo.
    echo [HATA] npm install basarisiz oldu. Interneti kontrol edin.
    pause
    exit /b 1
  )
)

rem --- 3000 portu zaten dolu mu? ---
set "PID3000="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do set "PID3000=%%p"
if not defined PID3000 goto start_server

echo [!] 3000 portu zaten kullaniliyor. PID: %PID3000%
set "ANS="
set /p "ANS=Kapatip yeniden baslatmak ister misin? [E=evet / H=hayir]: "
if /i not "%ANS%"=="E" (
  echo.
  echo Mevcut sunucu korunuyor. Tarayici aciliyor...
  start "" "http://localhost:3000"
  ping -n 3 127.0.0.1 >nul
  exit /b 0
)
echo.
echo [*] Eski sunucu kapatiliyor. PID %PID3000%
taskkill /PID %PID3000% /F /T >nul 2>&1
ping -n 2 127.0.0.1 >nul

:start_server
echo.
echo [*] Tarayici birazdan acilacak: http://localhost:3000
start "" /min cmd /c "ping -n 3 127.0.0.1 >nul && start http://localhost:3000"

echo [*] Sunucu baslatiliyor... BU PENCEREYI KAPATMA. Durdurmak icin Ctrl+C.
echo.
node server.js

echo.
echo [!] Sunucu durdu. Cikmak icin bir tusa basin.
pause
endlocal
