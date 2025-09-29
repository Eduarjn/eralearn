#!/bin/bash

echo "=== INICIANDO PANA-LEARN UNIFICADO ==="

# Verificar se já existem processos rodando
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "Parando servidor existente na porta 3001..."
    pkill -f "video-upload-server.js" || true
    sleep 2
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "Parando frontend existente na porta 8080..."
    pkill -f "vite" || true
    sleep 2
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

# Criar diretório de vídeos se não existir
mkdir -p /opt/eralearn/pana-learn/videos

echo "Iniciando ambos os serviços..."
npm run start

echo ""
echo "=== SERVIÇOS INICIADOS ==="
echo "Frontend: http://138.59.144.162:8080"
echo "API Upload: http://138.59.144.162:3001"
echo "Diretório de vídeos: /opt/eralearn/pana-learn/videos"
echo ""
echo "Para parar os serviços: Ctrl+C"
