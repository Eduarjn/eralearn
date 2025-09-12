#!/bin/bash

# 🚀 Script de Deploy - ERA Learn
# Execute este script no servidor após fazer upload do código

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto (onde está o package.json)"
fi

log "🚀 Iniciando deploy do ERA Learn..."

# 1. Parar aplicação se estiver rodando
log "Parando aplicação anterior..."
pm2 stop eralearn 2>/dev/null || true
pm2 delete eralearn 2>/dev/null || true

# 2. Instalar dependências
log "Instalando dependências..."
pnpm install --frozen-lockfile

# 3. Verificar se existe .env.local
if [ ! -f ".env.local" ]; then
    warning "Arquivo .env.local não encontrado!"
    info "Copiando env.example para .env.local..."
    cp env.example .env.local
    warning "IMPORTANTE: Configure as variáveis no arquivo .env.local antes de continuar!"
    read -p "Pressione Enter após configurar o .env.local..."
fi

# 4. Fazer build da aplicação
log "Fazendo build da aplicação..."
pnpm build

# 5. Iniciar aplicação com PM2
log "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js

# 6. Salvar configuração do PM2
log "Salvando configuração do PM2..."
pm2 save
pm2 startup

# 7. Verificar status
log "Verificando status da aplicação..."
pm2 status

# 8. Configurar Nginx (se não estiver configurado)
if [ ! -f "/etc/nginx/sites-enabled/eralearn" ]; then
    log "Configurando Nginx..."
    sudo cp nginx-config.conf /etc/nginx/sites-available/eralearn
    sudo ln -sf /etc/nginx/sites-available/eralearn /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    log "Nginx configurado!"
else
    log "Nginx já está configurado"
fi

# 9. Verificações finais
log "Verificações finais..."

# Verificar se a aplicação está rodando
if pm2 list | grep -q "eralearn.*online"; then
    log "✅ Aplicação rodando com sucesso!"
else
    error "❌ Aplicação não está rodando corretamente"
fi

# Verificar se Nginx está rodando
if systemctl is-active --quiet nginx; then
    log "✅ Nginx rodando"
else
    error "❌ Nginx não está rodando"
fi

log ""
log "🎉 Deploy concluído com sucesso!"
log ""
log "📋 Informações importantes:"
log "- Aplicação rodando na porta 3000"
log "- Nginx configurado como proxy reverso"
log "- PM2 gerenciando o processo"
log ""
log "🌐 Para acessar:"
log "- http://seu-dominio.com (se configurado)"
log "- http://IP_DO_SERVIDOR (acesso direto)"
log ""
log "📊 Comandos úteis:"
log "- pm2 status          # Ver status da aplicação"
log "- pm2 logs eralearn   # Ver logs da aplicação"
log "- pm2 restart eralearn # Reiniciar aplicação"
log "- sudo systemctl status nginx # Status do Nginx"
log ""
log "🔒 Para configurar SSL:"
log "sudo certbot --nginx -d seu-dominio.com"
