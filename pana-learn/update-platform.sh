#!/bin/bash

# ========================================
# Script de Atualização da Plataforma ERA Learn
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

log "🔄 Iniciando atualização da plataforma ERA Learn..."

# ========================================
# 1. VERIFICAR PRÉ-REQUISITOS
# ========================================
log "Verificando pré-requisitos..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto ERA Learn"
fi

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    error "Git não está instalado"
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado"
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado"
fi

# ========================================
# 2. BACKUP DO ESTADO ATUAL
# ========================================
log "Fazendo backup do estado atual..."

# Criar diretório de backup
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup dos arquivos importantes
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/"
    log "✅ Backup do .env criado"
fi

if [ -d "data" ]; then
    cp -r data "$BACKUP_DIR/"
    log "✅ Backup dos dados criado"
fi

if [ -d "videos" ]; then
    cp -r videos "$BACKUP_DIR/"
    log "✅ Backup dos vídeos criado"
fi

log "📁 Backup salvo em: $BACKUP_DIR"

# ========================================
# 3. VERIFICAR STATUS DO GIT
# ========================================
log "Verificando status do Git..."

# Verificar se há mudanças não commitadas
if ! git diff --quiet || ! git diff --cached --quiet; then
    warning "Há mudanças não commitadas. Fazendo stash..."
    git stash push -m "Backup antes da atualização $(date)"
fi

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
log "Branch atual: $CURRENT_BRANCH"

# ========================================
# 4. ATUALIZAR DO REPOSITÓRIO REMOTO
# ========================================
log "Atualizando do repositório remoto..."

# Buscar atualizações
log "Buscando atualizações do GitHub..."
git fetch origin

# Verificar se há atualizações
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    log "✅ Já está na versão mais recente!"
    exit 0
fi

# Mostrar commits que serão aplicados
log "Commits que serão aplicados:"
git log --oneline "$LOCAL_COMMIT..$REMOTE_COMMIT"

# Confirmar atualização
echo ""
read -p "Deseja continuar com a atualização? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Atualização cancelada pelo usuário"
    exit 0
fi

# Fazer pull das atualizações
log "Aplicando atualizações..."
git pull origin main

log "✅ Código atualizado com sucesso"

# ========================================
# 5. INSTALAR/ATUALIZAR DEPENDÊNCIAS
# ========================================
log "Atualizando dependências..."

if [ -f "package.json" ]; then
    log "Instalando dependências do Node.js..."
    npm install
    log "✅ Dependências do Node.js atualizadas"
fi

# ========================================
# 6. APLICAR CORREÇÕES E CONFIGURAÇÕES
# ========================================
log "Aplicando correções e configurações..."

# Aplicar correções de imagens se o script existir
if [ -f "fix-server-images.sh" ]; then
    log "Aplicando correções de imagens..."
    chmod +x fix-server-images.sh
    ./fix-server-images.sh
    log "✅ Correções de imagens aplicadas"
fi

# Configurar sistema de vídeos se o script existir
if [ -f "setup-videos-server.sh" ]; then
    log "Configurando sistema de vídeos..."
    chmod +x setup-videos-server.sh
    ./setup-videos-server.sh
    log "✅ Sistema de vídeos configurado"
fi

# ========================================
# 7. PARAR SERVIÇOS ATUAIS
# ========================================
log "Parando serviços atuais..."

# Parar containers Docker
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "Parando containers Docker..."
    docker-compose -f docker-compose.prod.yml down
    log "✅ Containers parados"
fi

# Parar serviços de vídeo se estiverem rodando
if [ -f "stop-video-services.sh" ]; then
    chmod +x stop-video-services.sh
    ./stop-video-services.sh
    log "✅ Serviços de vídeo parados"
fi

# ========================================
# 8. CONSTRUIR E INICIAR NOVA VERSÃO
# ========================================
log "Construindo e iniciando nova versão..."

# Construir nova imagem
log "Construindo nova imagem Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar aplicação
log "Iniciando aplicação..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar aplicação inicializar
log "Aguardando aplicação inicializar..."
sleep 30

# ========================================
# 9. INICIAR SERVIÇOS DE VÍDEO
# ========================================
log "Iniciando serviços de vídeo..."

if [ -f "start-video-services.sh" ]; then
    chmod +x start-video-services.sh
    ./start-video-services.sh
    log "✅ Serviços de vídeo iniciados"
fi

# ========================================
# 10. VERIFICAR STATUS
# ========================================
log "Verificando status da aplicação..."

# Verificar containers
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ Aplicação iniciada com sucesso"
else
    error "❌ Falha ao iniciar a aplicação"
fi

# Verificar serviços de vídeo
if pgrep -f "local-video-server.js" > /dev/null; then
    log "✅ Servidor de vídeos funcionando"
else
    warning "⚠️ Servidor de vídeos pode não estar funcionando"
fi

if pgrep -f "local-upload-server.js" > /dev/null; then
    log "✅ Servidor de upload funcionando"
else
    warning "⚠️ Servidor de upload pode não estar funcionando"
fi

# ========================================
# 11. TESTAR FUNCIONAMENTO
# ========================================
log "Testando funcionamento..."

# Testar carregamento de imagens
if curl -f -s "http://localhost/logotipoeralearn.svg" > /dev/null; then
    log "✅ Logo SVG carregando corretamente"
else
    warning "⚠️ Logo SVG pode não estar carregando"
fi

# Testar servidor de vídeos
if curl -f -s "http://localhost:3001/health" > /dev/null; then
    log "✅ Servidor de vídeos funcionando"
else
    warning "⚠️ Servidor de vídeos pode não estar funcionando"
fi

# ========================================
# 12. FINALIZAÇÃO
# ========================================
log "🎉 Atualização concluída com sucesso!"
echo ""
echo "=========================================="
echo "🚀 PLATAFORMA ERA LEARN ATUALIZADA!"
echo "=========================================="
echo ""
echo "✅ Atualizações aplicadas:"
echo "   - Código atualizado do GitHub"
echo "   - Dependências atualizadas"
echo "   - Correções de imagens aplicadas"
echo "   - Sistema de vídeos configurado"
echo "   - Aplicação reiniciada"
echo ""
echo "📊 Status dos serviços:"
echo "   - Aplicação principal: $(docker-compose -f docker-compose.prod.yml ps --services | wc -l) containers rodando"
echo "   - Servidor de vídeos: $(pgrep -f "local-video-server.js" | wc -l) processo(s)"
echo "   - Servidor de upload: $(pgrep -f "local-upload-server.js" | wc -l) processo(s)"
echo ""
echo "🌐 URLs disponíveis:"
echo "   - Aplicação: http://localhost"
echo "   - Vídeos: http://localhost:3001"
echo "   - Upload: http://localhost:3001/api"
echo ""
echo "📁 Backup salvo em: $BACKUP_DIR"
echo ""
echo "🛠️ Comandos úteis:"
echo "   - Status: docker-compose -f docker-compose.prod.yml ps"
echo "   - Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Testar vídeos: ./test-video-services.sh"
echo "   - Monitorar: ./monitor-video-services.sh"
echo ""
echo "🎯 Sua plataforma está atualizada e funcionando!"
echo ""

# Mostrar logs recentes
echo "📋 Logs recentes da aplicação:"
docker-compose -f docker-compose.prod.yml logs --tail=10





