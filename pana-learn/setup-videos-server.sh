#!/bin/bash

# ========================================
# Script para Configurar Vídeos no Servidor ERA Learn
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log "🎥 Configurando sistema de vídeos no servidor ERA Learn..."

# ========================================
# 1. VERIFICAR PRÉ-REQUISITOS
# ========================================
log "Verificando pré-requisitos..."

if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto ERA Learn"
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    error "npm não está instalado"
fi

# ========================================
# 2. CRIAR ESTRUTURA DE DIRETÓRIOS
# ========================================
log "Criando estrutura de diretórios para vídeos..."

# Diretórios principais
VIDEO_DIRS=(
    "videos"
    "storage/training-videos"
    "data/files"
    "logs"
)

for dir in "${VIDEO_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        log "✅ Diretório criado: $dir"
    else
        log "📁 Diretório já existe: $dir"
    fi
done

# Definir permissões
chmod 755 videos
chmod 755 storage/training-videos
chmod 755 data/files
chmod 755 logs

log "✅ Permissões configuradas"

# ========================================
# 3. INSTALAR DEPENDÊNCIAS
# ========================================
log "Instalando dependências..."

if [ ! -d "node_modules" ]; then
    npm install
    log "✅ Dependências instaladas"
else
    log "📦 Dependências já instaladas"
fi

# ========================================
# 4. CONFIGURAR NGINX PARA VÍDEOS
# ========================================
log "Configurando Nginx para vídeos..."

# Criar configuração específica para vídeos
cat > nginx-videos.conf << 'EOF'
# ========================================
# Configuração Nginx para Vídeos - ERA Learn
# ========================================

# Configuração para streaming de vídeos
location /videos/ {
    alias /opt/eralearn/videos/;
    
    # Headers para streaming otimizado
    add_header Accept-Ranges bytes;
    add_header Cache-Control "public, max-age=3600";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    
    # Configurações de buffer para streaming
    proxy_buffering off;
    proxy_request_buffering off;
    
    # Timeouts para vídeos longos
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Cache para vídeos
    expires 1h;
}

# Configuração para uploads de vídeos
location /api/videos/upload-local {
    client_max_body_size 2G;  # Tamanho máximo de upload
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts para uploads grandes
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
}

# Configuração para API de vídeos
location /api/videos {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Configuração para health check do servidor de vídeos
location /api/health {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

log "✅ Configuração do Nginx criada"

# ========================================
# 5. CRIAR SCRIPT DE INICIALIZAÇÃO
# ========================================
log "Criando script de inicialização..."

cat > start-video-services.sh << 'EOF'
#!/bin/bash

# ========================================
# Script para Iniciar Serviços de Vídeo
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log "🎥 Iniciando serviços de vídeo..."

# Verificar se os serviços já estão rodando
if pgrep -f "local-video-server.js" > /dev/null; then
    warning "Servidor de vídeos já está rodando"
else
    log "Iniciando servidor de vídeos..."
    nohup node local-video-server.js > logs/video-server.log 2>&1 &
    VIDEO_PID=$!
    echo $VIDEO_PID > logs/video-server.pid
    log "✅ Servidor de vídeos iniciado (PID: $VIDEO_PID)"
fi

if pgrep -f "local-upload-server.js" > /dev/null; then
    warning "Servidor de upload já está rodando"
else
    log "Iniciando servidor de upload..."
    nohup node local-upload-server.js > logs/upload-server.log 2>&1 &
    UPLOAD_PID=$!
    echo $UPLOAD_PID > logs/upload-server.pid
    log "✅ Servidor de upload iniciado (PID: $UPLOAD_PID)"
fi

# Aguardar serviços inicializarem
log "Aguardando serviços inicializarem..."
sleep 5

# Verificar se os serviços estão funcionando
log "Verificando status dos serviços..."

# Testar servidor de vídeos
if curl -f -s "http://localhost:3001/health" > /dev/null; then
    log "✅ Servidor de vídeos funcionando"
else
    warning "⚠️ Servidor de vídeos pode não estar funcionando"
fi

# Testar servidor de upload
if curl -f -s "http://localhost:3001/api/health" > /dev/null; then
    log "✅ Servidor de upload funcionando"
else
    warning "⚠️ Servidor de upload pode não estar funcionando"
fi

log "🎉 Serviços de vídeo iniciados com sucesso!"
echo ""
echo "📊 Status dos serviços:"
echo "   - Servidor de vídeos: http://localhost:3001"
echo "   - Servidor de upload: http://localhost:3001/api"
echo "   - Logs: logs/video-server.log e logs/upload-server.log"
echo ""
echo "🛑 Para parar os serviços:"
echo "   ./stop-video-services.sh"
echo ""
EOF

chmod +x start-video-services.sh
log "✅ Script de inicialização criado"

# ========================================
# 6. CRIAR SCRIPT DE PARADA
# ========================================
log "Criando script de parada..."

cat > stop-video-services.sh << 'EOF'
#!/bin/bash

# ========================================
# Script para Parar Serviços de Vídeo
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log "🛑 Parando serviços de vídeo..."

# Parar servidor de vídeos
if [ -f "logs/video-server.pid" ]; then
    VIDEO_PID=$(cat logs/video-server.pid)
    if kill -0 $VIDEO_PID 2>/dev/null; then
        kill $VIDEO_PID
        log "✅ Servidor de vídeos parado (PID: $VIDEO_PID)"
    else
        warning "Servidor de vídeos já estava parado"
    fi
    rm -f logs/video-server.pid
else
    warning "Arquivo PID do servidor de vídeos não encontrado"
fi

# Parar servidor de upload
if [ -f "logs/upload-server.pid" ]; then
    UPLOAD_PID=$(cat logs/upload-server.pid)
    if kill -0 $UPLOAD_PID 2>/dev/null; then
        kill $UPLOAD_PID
        log "✅ Servidor de upload parado (PID: $UPLOAD_PID)"
    else
        warning "Servidor de upload já estava parado"
    fi
    rm -f logs/upload-server.pid
else
    warning "Arquivo PID do servidor de upload não encontrado"
fi

# Parar processos por nome (fallback)
pkill -f "local-video-server.js" 2>/dev/null || true
pkill -f "local-upload-server.js" 2>/dev/null || true

log "🎉 Serviços de vídeo parados com sucesso!"
EOF

chmod +x stop-video-services.sh
log "✅ Script de parada criado"

# ========================================
# 7. CRIAR SCRIPT DE TESTE
# ========================================
log "Criando script de teste..."

cat > test-video-services.sh << 'EOF'
#!/bin/bash

# ========================================
# Script para Testar Serviços de Vídeo
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log "🧪 Testando serviços de vídeo..."

# Testar servidor de vídeos
log "Testando servidor de vídeos..."
if curl -f -s "http://localhost:3001/health" > /dev/null; then
    log "✅ Servidor de vídeos funcionando"
    curl -s "http://localhost:3001/health" | jq . 2>/dev/null || curl -s "http://localhost:3001/health"
else
    error "❌ Servidor de vídeos não está funcionando"
fi

echo ""

# Testar servidor de upload
log "Testando servidor de upload..."
if curl -f -s "http://localhost:3001/api/health" > /dev/null; then
    log "✅ Servidor de upload funcionando"
    curl -s "http://localhost:3001/api/health" | jq . 2>/dev/null || curl -s "http://localhost:3001/api/health"
else
    error "❌ Servidor de upload não está funcionando"
fi

echo ""

# Listar vídeos disponíveis
log "Listando vídeos disponíveis..."
if curl -f -s "http://localhost:3001/api/videos" > /dev/null; then
    log "✅ Lista de vídeos obtida"
    curl -s "http://localhost:3001/api/videos" | jq . 2>/dev/null || curl -s "http://localhost:3001/api/videos"
else
    warning "⚠️ Não foi possível obter lista de vídeos"
fi

echo ""

# Verificar diretórios
log "Verificando diretórios de vídeos..."
if [ -d "videos" ]; then
    VIDEO_COUNT=$(find videos -name "*.mp4" -o -name "*.webm" -o -name "*.avi" -o -name "*.mov" | wc -l)
    log "📁 Vídeos encontrados no diretório: $VIDEO_COUNT"
    if [ $VIDEO_COUNT -gt 0 ]; then
        log "📋 Lista de vídeos:"
        find videos -name "*.mp4" -o -name "*.webm" -o -name "*.avi" -o -name "*.mov" | head -10
    fi
else
    warning "⚠️ Diretório de vídeos não encontrado"
fi

log "🎯 Teste de serviços concluído!"
EOF

chmod +x test-video-services.sh
log "✅ Script de teste criado"

# ========================================
# 8. CRIAR SCRIPT DE MONITORAMENTO
# ========================================
log "Criando script de monitoramento..."

cat > monitor-video-services.sh << 'EOF'
#!/bin/bash

# ========================================
# Script para Monitorar Serviços de Vídeo
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log "📊 Monitorando serviços de vídeo..."

while true; do
    clear
    echo "=========================================="
    echo "🎥 MONITOR DE SERVIÇOS DE VÍDEO - ERA LEARN"
    echo "=========================================="
    echo ""
    
    # Status do servidor de vídeos
    if pgrep -f "local-video-server.js" > /dev/null; then
        echo -e "📹 Servidor de vídeos: ${GREEN}✅ RODANDO${NC}"
    else
        echo -e "📹 Servidor de vídeos: ${RED}❌ PARADO${NC}"
    fi
    
    # Status do servidor de upload
    if pgrep -f "local-upload-server.js" > /dev/null; then
        echo -e "📤 Servidor de upload: ${GREEN}✅ RODANDO${NC}"
    else
        echo -e "📤 Servidor de upload: ${RED}❌ PARADO${NC}"
    fi
    
    echo ""
    
    # Teste de conectividade
    if curl -f -s "http://localhost:3001/health" > /dev/null; then
        echo -e "🌐 Conectividade: ${GREEN}✅ OK${NC}"
    else
        echo -e "🌐 Conectividade: ${RED}❌ FALHA${NC}"
    fi
    
    echo ""
    
    # Contagem de vídeos
    if [ -d "videos" ]; then
        VIDEO_COUNT=$(find videos -name "*.mp4" -o -name "*.webm" -o -name "*.avi" -o -name "*.mov" 2>/dev/null | wc -l)
        echo "📁 Vídeos disponíveis: $VIDEO_COUNT"
    else
        echo "📁 Diretório de vídeos: Não encontrado"
    fi
    
    echo ""
    echo "🔄 Atualizando a cada 5 segundos... (Ctrl+C para sair)"
    echo "=========================================="
    
    sleep 5
done
EOF

chmod +x monitor-video-services.sh
log "✅ Script de monitoramento criado"

# ========================================
# 9. FINALIZAÇÃO
# ========================================
log "🎉 Configuração de vídeos concluída!"
echo ""
echo "=========================================="
echo "🎥 SISTEMA DE VÍDEOS CONFIGURADO"
echo "=========================================="
echo ""
echo "📁 Estrutura criada:"
echo "   - videos/ (vídeos principais)"
echo "   - storage/training-videos/ (vídeos de treinamento)"
echo "   - data/files/ (arquivos de dados)"
echo "   - logs/ (logs dos serviços)"
echo ""
echo "🚀 Comandos disponíveis:"
echo "   - ./start-video-services.sh (iniciar serviços)"
echo "   - ./stop-video-services.sh (parar serviços)"
echo "   - ./test-video-services.sh (testar serviços)"
echo "   - ./monitor-video-services.sh (monitorar serviços)"
echo ""
echo "📋 URLs dos serviços:"
echo "   - Servidor de vídeos: http://localhost:3001"
echo "   - API de upload: http://localhost:3001/api"
echo "   - Health check: http://localhost:3001/health"
echo ""
echo "💡 Para adicionar vídeos:"
echo "   1. Copie os arquivos para o diretório 'videos/'"
echo "   2. Execute: ./test-video-services.sh"
echo ""
echo "✅ Sistema de vídeos pronto para uso!"
echo ""
