@echo off
cd /d "%~dp0"
set DEX_OPEN=1
echo DeX serveri baslayir...
node dev-server.js
pause
