@echo off
title DeX panel - sinaq
cd /d "%~dp0"
set "NODE=node"
where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NODE=%ProgramFiles%\nodejs\node.exe"
  ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    set "NODE=%ProgramFiles(x86)%\nodejs\node.exe"
  ) else if exist "%LocalAppData%\Programs\nodejs\node.exe" (
    set "NODE=%LocalAppData%\Programs\nodejs\node.exe"
  ) else (
    echo Node.js tapilmadi. Yeni CMD penceresi ile yeniden cehd et ve ya https://nodejs.org saytindan qur.
    pause
    exit /b 1
  )
)
echo DeX paneli sinaq rejimde acilir...
"%NODE%" demo.js
pause
