#!/bin/bash

# 🚀 Script de Instalação Automatizada - ERA Learn
# Para servidor Debian 13

set -e  # Parar em caso de erro

echo "🚀 Iniciando instalação do ERA Learn no servidor..."

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

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root. Use sudo quando necessário."
fi

# 1. Atualizar sistema
log "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências básicas
log "Instalando dependências básicas..."
sudo apt install -y ca-certificates curl gnupg build-essential git ufw software-properties-common

# 3. Instalar Node.js LTS
log "Instalando Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação do Node.js
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "Node.js instalado: $NODE_VERSION"
log "npm instalado: $NPM_VERSION"

# 4. Instalar pnpm
log "Instalando pnpm..."
sudo npm install -g pnpm
PNPM_VERSION=$(pnpm --version)
log "pnpm instalado: $PNPM_VERSION"

# 5. Instalar PM2
log "Instalando PM2..."
sudo npm install -g pm2
PM2_VERSION=$(pm2 --version)
log "PM2 instalado: $PM2_VERSION"

# 6. Instalar Nginx
log "Instalando Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
log "Nginx instalado e iniciado"

# 7. Configurar Firewall
log "Configurando firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
log "Firewall configurado"

# 8. Criar diretórios
log "Criando diretórios..."
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
mkdir -p /var/www/eralearn
log "Diretórios criados"

# 9. Instalar Certbot (opcional)
log "Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx
log "Certbot instalado"

# 10. Verificações finais
log "Verificando instalações..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não foi instalado corretamente"
fi

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    error "pnpm não foi instalado corretamente"
fi

# Verificar PM2
if ! command -v pm2 &> /dev/null; then
    error "PM2 não foi instalado corretamente"
fi

# Verificar Nginx
if ! systemctl is-active --quiet nginx; then
    error "Nginx não está rodando"
fi

log "✅ Instalação concluída com sucesso!"
log ""
log "📋 Próximos passos:"
log "1. Fazer upload do código para /var/www/eralearn"
log "2. Executar: cd /var/www/eralearn && pnpm install"
log "3. Configurar arquivo .env.local"
log "4. Executar: pnpm build"
log "5. Configurar PM2: pm2 start ecosystem.config.js"
log "6. Configurar Nginx como proxy reverso"
log ""
log "🌐 Para configurar SSL:"
log "sudo certbot --nginx -d seu-dominio.com"
log ""
log "📞 Suporte: Entre em contato se precisar de ajuda!"