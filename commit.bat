@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo === SetrainOyun - commit + push ===
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [X] Bu klasor bir git deposu degil.
  pause
  exit /b 1
)

echo --- Degisiklikler ---
git status --short
echo.

set "MSG="
set /p "MSG=Commit mesaji (bos = otomatik): "
if not defined MSG set "MSG=Update %date% %time%"

echo.
echo --- Stage ---
git add -A

git diff --cached --quiet
if not errorlevel 1 (
  echo [i] Commit edilecek degisiklik yok.
  pause
  exit /b 0
)

git commit -m "%MSG%"
if errorlevel 1 (
  echo [X] Commit basarisiz.
  pause
  exit /b 1
)

echo.
echo --- Push ---
git push origin main
if errorlevel 1 (
  echo.
  echo [!] Push basarisiz. Once cekmeyi deneyin: git pull --rebase origin main
  pause
  exit /b 1
)

echo.
echo === Bitti ===
git log --oneline -3
pause
endlocal