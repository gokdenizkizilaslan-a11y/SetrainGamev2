@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Setra - Oyun Sunucusunu Kapat

echo =========================================================
echo   SETRA - Yerel Oyun Sunucusunu Kapat (port 3000)
echo =========================================================
echo.

set "FOUND="
for /f "usebackq tokens=*" %%p in (`powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue).OwningProcess" 2^>nul`) do (
  if not "%%p"=="" (
    set "FOUND=1"
    echo   - Kapatiliyor: PID %%p
    taskkill /PID %%p /F /T >nul 2>&1
  )
)

if not defined FOUND (
  echo   [i] 3000 portunda calisan Setra sunucusu yok.
) else (
  echo.
  echo   [V] Sunucu kapatildi. Artik "basla.bat" ile yeniden baslatabilirsin.
)

echo.
pause
endlocal
