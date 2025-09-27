#!/bin/bash

# 🚀 Script completo para iniciar o sistema de upload de vídeos Pana-Learn
# IP: 138.59.144.162 | Porta: 5022 | User: root

set -e  # Para em caso de erro

echo "🔧 Iniciando configuração do Pana-Learn Video Upload System..."

# Definir variáveis
VIDEO_DIR="/opt/eralearn/pana-learn/videos"
PROJECT_DIR="/opt/eralearn/pana-learn"
KEY_DIR="/opt/eralearn/pana-learn/key"
SERVER_IP="138.59.144.162"
SERVER_PORT="3001"

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p "$VIDEO_DIR"
mkdir -p "$KEY_DIR"
cd "$PROJECT_DIR"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instalando..."
    apt-get install -y npm
fi

echo "✅ Node.js $(node --version) e npm $(npm --version) instalados"

# Instalar dependências do servidor de upload
echo "📦 Instalando dependências..."
if [ -f "package-upload-server.json" ]; then
    cp package-upload-server.json package.json
    npm install
    echo "✅ Dependências instaladas"
else
    echo "❌ Arquivo package-upload-server.json não encontrado!"
    exit 1
fi

# Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."
export VIDEO_LOCAL_DIR="$VIDEO_DIR"
export PORT="$SERVER_PORT"
export NODE_ENV="production"

# Verificar se o servidor já está rodando
if pgrep -f "video-upload-server.js" > /dev/null; then
    echo "⚠️  Servidor já está rodando. Parando processo anterior..."
    pkill -f "video-upload-server.js"
    sleep 2
fi

# Iniciar o servidor em background
echo "🚀 Iniciando servidor de upload..."
nohup node video-upload-server.js > video-server.log 2>&1 &
SERVER_PID=$!

# Aguardar o servidor inicializar
echo "⏳ Aguardando servidor inicializar..."
sleep 5

# Verificar se o servidor está rodando
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Servidor iniciado com sucesso! PID: $SERVER_PID"
    echo "🌐 Servidor rodando em: http://$SERVER_IP:$SERVER_PORT"
else
    echo "❌ Falha ao iniciar o servidor. Verificando logs..."
    tail -20 video-server.log
    exit 1
fi

# Teste de conectividade
echo "🔍 Testando conectividade..."
sleep 2
if curl -s "http://localhost:$SERVER_PORT/health" > /dev/null; then
    echo "✅ Servidor respondendo corretamente!"
else
    echo "❌ Servidor não está respondendo. Verificando logs..."
    tail -10 video-server.log
fi

# Mostrar informações do sistema
echo ""
echo "📊 INFORMAÇÕES DO SISTEMA:"
echo "================================"
echo "🖥️  Servidor: $SERVER_IP:$SERVER_PORT"
echo "📁 Diretório de vídeos: $VIDEO_DIR"
echo "🔑 Diretório de chaves: $KEY_DIR"
echo "📝 Log do servidor: $PROJECT_DIR/video-server.log"
echo "🆔 PID do processo: $SERVER_PID"
echo ""

# Listar vídeos existentes
echo "📹 VÍDEOS EXISTENTES:"
echo "===================="
if [ -d "$VIDEO_DIR" ] && [ "$(ls -A $VIDEO_DIR)" ]; then
    ls -la "$VIDEO_DIR"
else
    echo "Nenhum vídeo encontrado em $VIDEO_DIR"
fi
echo ""

# Comandos cURL prontos para uso
echo "🔧 COMANDOS CURL PARA TESTE:"
echo "============================"
echo ""
echo "1️⃣ Health Check:"
echo "curl http://$SERVER_IP:$SERVER_PORT/health"
echo ""
echo "2️⃣ Listar vídeos:"
echo "curl http://$SERVER_IP:$SERVER_PORT/api/videos/list"
echo ""
echo "3️⃣ Upload de vídeo (exemplo com arquivo existente):"
echo "curl -X POST \\"
echo "  -F \"curso=Omnichannel\" \\"
echo "  -F \"titulo=Cadastro de Usuários\" \\"
echo "  -F \"descricao=Tutorial de cadastro\" \\"
echo "  -F \"duracao=15\" \\"
echo "  -F \"categoria=Tutorial\" \\"
echo "  -F \"video=@$VIDEO_DIR/cadastro_de_usuarios-omnichannel.mp4\" \\"
echo "  http://$SERVER_IP:$SERVER_PORT/api/videos/upload-local"
echo ""
echo "4️⃣ Upload de vídeo (arquivo local):"
echo "curl -X POST \\"
echo "  -F \"curso=Seu Curso\" \\"
echo "  -F \"titulo=Título do Vídeo\" \\"
echo "  -F \"descricao=Descrição do vídeo\" \\"
echo "  -F \"duracao=10\" \\"
echo "  -F \"categoria=Categoria\" \\"
echo "  -F \"video=@/caminho/para/seu/video.mp4\" \\"
echo "  http://$SERVER_IP:$SERVER_PORT/api/videos/upload-local"
echo ""

# Salvar comandos em arquivo
cat > "$PROJECT_DIR/comandos-curl.txt" << EOF
# Comandos cURL para API de Upload de Vídeos
# Servidor: $SERVER_IP:$SERVER_PORT

# Health Check
curl http://$SERVER_IP:$SERVER_PORT/health

# Listar vídeos
curl http://$SERVER_IP:$SERVER_PORT/api/videos/list

# Upload de vídeo
curl -X POST \\
  -F "curso=Nome do Curso" \\
  -F "titulo=Título do Vídeo" \\
  -F "descricao=Descrição do vídeo" \\
  -F "duracao=15" \\
  -F "categoria=Categoria" \\
  -F "video=@/caminho/para/video.mp4" \\
  http://$SERVER_IP:$SERVER_PORT/api/videos/upload-local
EOF

echo "💾 Comandos cURL salvos em: $PROJECT_DIR/comandos-curl.txt"
echo ""
echo "🎉 SISTEMA CONFIGURADO E RODANDO!"
echo "================================"
echo "Para parar o servidor: pkill -f video-upload-server.js"
echo "Para ver logs: tail -f $PROJECT_DIR/video-server.log"
echo "Para reiniciar: bash $PROJECT_DIR/start-everything.sh"
