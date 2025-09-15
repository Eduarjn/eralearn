#!/bin/bash

# ========================================
# ERA Learn - Script de Atualização
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

log "🔄 Iniciando atualização do ERA Learn"

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    error "Execute este script no diretório /opt/eralearn"
fi

# ========================================
# 1. BACKUP ANTES DA ATUALIZAÇÃO
# ========================================
log "💾 Fazendo backup antes da atualização..."

if [ -f "backup.sh" ]; then
    ./backup.sh
    log "✅ Backup concluído"
else
    warning "Script de backup não encontrado, continuando sem backup"
fi

# ========================================
# 2. PARAR SERVIÇOS
# ========================================
log "⏹️ Parando serviços..."
docker-compose -f docker-compose.prod.yml down
log "✅ Serviços parados"

# ========================================
# 3. ATUALIZAR CÓDIGO
# ========================================
log "📥 Atualizando código..."

# Verificar se é um repositório Git
if [ -d ".git" ]; then
    log "Repositório Git detectado, fazendo pull..."
    git pull origin main
    log "✅ Código atualizado via Git"
else
    log "Baixando versão mais recente do GitHub..."
    
    # Fazer backup dos arquivos de configuração
    cp .env .env.backup 2>/dev/null || true
    cp nginx/conf.d/eralearn.conf nginx/conf.d/eralearn.conf.backup 2>/dev/null || true
    
    # Baixar nova versão
    curl -fsSL https://github.com/Eduarjn/eralearn/archive/main.zip -o eralearn-update.zip
    unzip -q eralearn-update.zip
    
    # Copiar arquivos novos
    cp -r eralearn-main/* .
    cp -r eralearn-main/.* . 2>/dev/null || true
    
    # Restaurar arquivos de configuração
    cp .env.backup .env 2>/dev/null || true
    cp nginx/conf.d/eralearn.conf.backup nginx/conf.d/eralearn.conf 2>/dev/null || true
    
    # Limpar arquivos temporários
    rm -rf eralearn-main eralearn-update.zip .env.backup nginx/conf.d/eralearn.conf.backup
    
    log "✅ Código atualizado via download"
fi

# ========================================
# 4. ATUALIZAR PERMISSÕES
# ========================================
log "🔐 Atualizando permissões..."
chmod +x *.sh
log "✅ Permissões atualizadas"

# ========================================
# 5. VERIFICAR CONFIGURAÇÕES
# ========================================
log "⚙️ Verificando configurações..."

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado, criando a partir do exemplo..."
    cp env.production.example .env
    warning "⚠️ Configure o arquivo .env com suas variáveis específicas"
fi

# Verificar se configuração do Nginx existe
if [ ! -f "nginx/conf.d/eralearn.conf" ]; then
    warning "Configuração do Nginx não encontrada"
    warning "⚠️ Execute o script de deploy para reconfigurar"
fi

log "✅ Configurações verificadas"

# ========================================
# 6. RECONSTRUIR APLICAÇÃO
# ========================================
log "🔨 Reconstruindo aplicação..."

# Limpar imagens antigas
docker system prune -f

# Reconstruir com cache limpo
docker-compose -f docker-compose.prod.yml build --no-cache

log "✅ Aplicação reconstruída"

# ========================================
# 7. INICIAR SERVIÇOS
# ========================================
log "🚀 Iniciando serviços..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar aplicação inicializar
log "⏳ Aguardando aplicação inicializar..."
sleep 30

log "✅ Serviços iniciados"

# ========================================
# 8. VERIFICAR STATUS
# ========================================
log "🔍 Verificando status da aplicação..."

# Verificar containers
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ Aplicação iniciada com sucesso"
else
    error "❌ Falha ao iniciar a aplicação"
fi

# Verificar logs por erros
log "📋 Verificando logs por erros..."
ERRORS=$(docker-compose -f docker-compose.prod.yml logs --tail=50 | grep -i error | wc -l)
if [ "$ERRORS" -gt 0 ]; then
    warning "⚠️ Encontrados $ERRORS erros nos logs"
    docker-compose -f docker-compose.prod.yml logs --tail=20 | grep -i error
else
    log "✅ Nenhum erro encontrado nos logs"
fi

# ========================================
# 9. TESTAR CONECTIVIDADE
# ========================================
log "🌍 Testando conectividade..."

# Obter domínio do arquivo .env
if [ -f ".env" ]; then
    DOMAIN=$(grep "VITE_APP_URL" .env | cut -d'=' -f2 | sed 's|https://||' | sed 's|/||')
    if [ ! -z "$DOMAIN" ]; then
        # Testar HTTPS
        HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN || echo "000")
        if [ "$HTTPS_STATUS" = "200" ]; then
            log "✅ HTTPS funcionando corretamente"
        else
            warning "⚠️ HTTPS pode não estar funcionando (Status: $HTTPS_STATUS)"
        fi
        
        # Testar API
        API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/ || echo "000")
        if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
            log "✅ API funcionando corretamente"
        else
            warning "⚠️ API pode não estar funcionando (Status: $API_STATUS)"
        fi
    else
        warning "⚠️ Domínio não configurado no .env"
    fi
else
    warning "⚠️ Arquivo .env não encontrado"
fi

# ========================================
# 10. LIMPEZA
# ========================================
log "🧹 Fazendo limpeza..."

# Limpar imagens não utilizadas
docker image prune -f

# Limpar volumes não utilizados
docker volume prune -f

log "✅ Limpeza concluída"

# ========================================
# 11. FINALIZAÇÃO
# ========================================
log "🎉 Atualização concluída!"

echo ""
echo "=========================================="
echo "🎉 ERA LEARN ATUALIZADO COM SUCESSO!"
echo "=========================================="
echo ""

# Mostrar status atual
echo "📊 Status atual:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Logs recentes:"
docker-compose -f docker-compose.prod.yml logs --tail=10

echo ""
echo "🛠️ Comandos úteis:"
echo "  Status: ./status.sh"
echo "  Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo ""

# Verificar se há atualizações pendentes
if [ -d ".git" ]; then
    git fetch origin
    BEHIND=$(git rev-list --count HEAD..origin/main)
    if [ "$BEHIND" -gt 0 ]; then
        warning "⚠️ Há $BEHIND commits pendentes. Execute novamente para atualizar."
    else
        log "✅ Aplicação está atualizada"
    fi
fi

echo "🎯 Sua aplicação está rodando com a versão mais recente!"
echo ""
