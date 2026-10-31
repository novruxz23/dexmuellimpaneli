@echo off
rem DeX sinif serveri (müəllim paneli). Node.js 18+ lazımdır: https://nodejs.org
cd /d %~dp0
echo DeX serveri başlayır...
node dev-server.js
pause
