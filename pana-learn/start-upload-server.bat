@echo off
echo 🚀 Iniciando servidor de upload local...
echo.
echo 📁 Diretório: %CD%
echo 🌐 Porta: 3001
echo 📹 Endpoint: http://localhost:3001/api/videos/upload-local
echo.

cd /d "%~dp0"
node local-upload-server.js

pause











