@echo off
REM ===== SetrainOyun - tek tikla commit + push =====
REM Bu dosyaya cift tikla: degisiklikleri commit eder ve GitHub'a push eder.
REM skilllersetrain/ gibi dev klasorleri .gitignore ile haric tutulur.
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo === Degisiklikler ===
git status --short

echo.
set /p MSG=Commit mesaji (bos birak = otomatik zaman damgasi): 
if "%MSG%"=="" set MSG=Update %date% %time%

echo.
echo === Stage + Commit ===
git add -A
git commit -m "%MSG%"
if errorlevel 1 (
  echo.
  echo [i] Commit yapilmadi (degisiklik yok olabilir).
  pause
  exit /b 0
)

echo.
echo === Push ===
git push origin main

echo.
echo === Bitti ===
git log --oneline -3
pause
