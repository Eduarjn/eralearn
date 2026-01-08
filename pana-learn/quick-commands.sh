#!/bin/bash

echo "=== COMANDOS RÁPIDOS PARA O SERVIDOR DE VÍDEOS ==="
echo ""
echo "📍 LOCALIZAÇÃO ATUAL: $(pwd)"
echo "📁 DIRETÓRIO CORRETO: /opt/eralearn/pana-learn"
echo ""

# Verificar se estamos no diretório correto
if [[ "$(pwd)" != "/opt/eralearn/pana-learn" ]]; then
    echo "⚠️  AVISO: Você não está no diretório correto!"
    echo "   Execute: cd /opt/eralearn/pana-learn"
    echo ""
fi

echo "🔧 COMANDOS DISPONÍVEIS:"
echo "   ./manage-server.sh status    # Ver se servidor está rodando"
echo "   ./manage-server.sh stop      # Parar servidor"
echo "   ./manage-server.sh start     # Iniciar servidor"
echo "   ./manage-server.sh restart   # Reiniciar servidor"
echo "   ./manage-server.sh logs      # Ver logs"
echo "   ./manage-server.sh test      # Testar API"
echo ""

# Verificar status atual
if pgrep -f "video-upload-server.js" > /dev/null; then
    echo "✅ SERVIDOR: Rodando na porta 3001"
    echo "🌐 TESTE: curl http://138.59.144.162:3001/health"
else
    echo "❌ SERVIDOR: Parado"
    echo "▶️  INICIAR: ./manage-server.sh start"
fi

echo ""
echo "📹 VÍDEOS SALVOS EM: /opt/eralearn/pana-learn/videos/"
echo "📊 TOTAL DE VÍDEOS: $(ls -1 /opt/eralearn/pana-learn/videos/*.mp4 2>/dev/null | wc -l)"
