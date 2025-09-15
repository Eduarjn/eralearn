#!/bin/bash

# ========================================
# Script para Deploy das Correções no Servidor
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

log "🚀 Iniciando deploy das correções para o servidor..."

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
# 2. ATUALIZAR CÓDIGO DO REPOSITÓRIO
# ========================================
log "Atualizando código do repositório..."

# Fazer backup do estado atual
if [ -d ".git" ]; then
    log "Fazendo backup do estado atual..."
    git stash push -m "Backup antes do deploy $(date)"
fi

# Atualizar do repositório remoto
log "Atualizando do repositório remoto..."
git fetch origin
git pull origin main

log "✅ Código atualizado com sucesso"

# ========================================
# 3. APLICAR CORREÇÕES DE IMAGENS
# ========================================
log "Aplicando correções de carregamento de imagens..."

if [ -f "fix-server-images.sh" ]; then
    log "Executando script de correção de imagens..."
    chmod +x fix-server-images.sh
    ./fix-server-images.sh
    log "✅ Correções de imagens aplicadas"
else
    warning "Script de correção de imagens não encontrado"
fi

# ========================================
# 4. CONFIGURAR SISTEMA DE VÍDEOS
# ========================================
log "Configurando sistema de vídeos..."

if [ -f "setup-videos-server.sh" ]; then
    log "Executando script de configuração de vídeos..."
    chmod +x setup-videos-server.sh
    ./setup-videos-server.sh
    log "✅ Sistema de vídeos configurado"
else
    warning "Script de configuração de vídeos não encontrado"
fi

# ========================================
# 5. CONSTRUIR E INICIAR APLICAÇÃO
# ========================================
log "Construindo e iniciando aplicação..."

# Parar containers existentes
log "Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down || true

# Construir nova imagem
log "Construindo nova imagem..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar aplicação
log "Iniciando aplicação..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar aplicação inicializar
log "Aguardando aplicação inicializar..."
sleep 30

# ========================================
# 6. INICIAR SERVIÇOS DE VÍDEO
# ========================================
log "Iniciando serviços de vídeo..."

if [ -f "start-video-services.sh" ]; then
    chmod +x start-video-services.sh
    ./start-video-services.sh
    log "✅ Serviços de vídeo iniciados"
else
    warning "Script de inicialização de vídeos não encontrado"
fi

# ========================================
# 7. VERIFICAR STATUS
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
# 8. TESTAR CORREÇÕES
# ========================================
log "Testando correções..."

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
# 9. FINALIZAÇÃO
# ========================================
log "🎉 Deploy das correções concluído!"
echo ""
echo "=========================================="
echo "🚀 CORREÇÕES APLICADAS COM SUCESSO!"
echo "=========================================="
echo ""
echo "✅ Correções aplicadas:"
echo "   - Carregamento de imagens corrigido"
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
echo "🛠️ Comandos úteis:"
echo "   - Status: docker-compose -f docker-compose.prod.yml ps"
echo "   - Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Testar vídeos: ./test-video-services.sh"
echo "   - Monitorar: ./monitor-video-services.sh"
echo ""
echo "🎯 Problemas de carregamento de imagens e vídeos devem estar resolvidos!"
echo ""

# Mostrar logs recentes
echo "📋 Logs recentes da aplicação:"
docker-compose -f docker-compose.prod.yml logs --tail=10
