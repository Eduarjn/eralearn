#!/bin/bash

# 🚀 Script de Instalação Automatizada - ERA Learn
# Execute como: sudo bash install-server.sh

set -e  # Parar em caso de erro

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
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (sudo)"
fi

# Configurações
APP_NAME="ERA Learn"
APP_DIR="/var/www/eralearn"
NGINX_SITE="eralearn"
DOMAIN=""
SUPABASE_URL=""
SUPABASE_KEY=""

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ERA Learn - Instalação                   ║"
echo "║                        Versão 1.0.0                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Coletar informações
log "Coletando informações de configuração..."

read -p "Digite o domínio do site (ex: eralearn.com): " DOMAIN
read -p "Digite a URL do Supabase: " SUPABASE_URL
read -p "Digite a chave anônima do Supabase: " SUPABASE_KEY

if [[ -z "$DOMAIN" || -z "$SUPABASE_URL" || -z "$SUPABASE_KEY" ]]; then
    error "Todas as informações são obrigatórias!"
fi

log "Iniciando instalação do $APP_NAME..."

# 1. Atualizar sistema
log "Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependências básicas
log "Instalando dependências básicas..."
apt install -y curl wget git unzip build-essential software-properties-common

# 3. Instalar Node.js
log "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar instalação
if ! command -v node &> /dev/null; then
    error "Node.js não foi instalado corretamente"
fi

log "Node.js $(node --version) instalado com sucesso"
log "npm $(npm --version) instalado com sucesso"

# 4. Instalar Nginx
log "Instalando Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 5. Criar diretório da aplicação
log "Criando diretório da aplicação..."
mkdir -p $APP_DIR

# 6. Clonar repositório (se não existir)
if [ ! -d "/tmp/eralearn" ]; then
    log "Clonando repositório..."
    cd /tmp
    git clone https://github.com/seu-usuario/eralearn.git
fi

# 7. Configurar aplicação
log "Configurando aplicação..."
cd /tmp/eralearn/pana-learn

# Criar arquivo .env
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY

# Application Configuration
VITE_APP_NAME=$APP_NAME
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
EOF

# 8. Instalar dependências e build
log "Instalando dependências..."
npm install

log "Fazendo build da aplicação..."
npm run build

# 9. Copiar arquivos para servidor
log "Copiando arquivos para servidor..."
cp -r dist/* $APP_DIR/

# 10. Configurar permissões
log "Configurando permissões..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# 11. Configurar Nginx
log "Configurando Nginx..."

# Criar configuração do site
cat > /etc/nginx/sites-available/$NGINX_SITE << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
if nginx -t; then
    systemctl reload nginx
    log "Nginx configurado com sucesso"
else
    error "Erro na configuração do Nginx"
fi

# 12. Instalar Certbot (SSL)
log "Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx

# 13. Configurar firewall
log "Configurando firewall..."
ufw allow 'Nginx Full'
ufw allow ssh
ufw --force enable

# 14. Criar scripts de manutenção
log "Criando scripts de manutenção..."

# Script de atualização
cat > /usr/local/bin/update-eralearn << 'EOF'
#!/bin/bash
cd /tmp/eralearn
git pull origin main
cd pana-learn
npm install
npm run build
cp -r dist/* /var/www/eralearn/
chown -R www-data:www-data /var/www/eralearn
systemctl reload nginx
echo "ERA Learn atualizado com sucesso!"
EOF

chmod +x /usr/local/bin/update-eralearn

# Script de backup
cat > /usr/local/bin/backup-eralearn << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/eralearn"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/eralearn_$DATE.tar.gz /var/www/eralearn
find $BACKUP_DIR -name "eralearn_*.tar.gz" -mtime +7 -delete
echo "Backup criado: $BACKUP_DIR/eralearn_$DATE.tar.gz"
EOF

chmod +x /usr/local/bin/backup-eralearn

# 15. Configurar renovação automática de SSL
log "Configurando renovação automática de SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# 16. Limpar arquivos temporários
log "Limpando arquivos temporários..."
rm -rf /tmp/eralearn

# 17. Verificar instalação
log "Verificando instalação..."

# Verificar se Nginx está rodando
if systemctl is-active --quiet nginx; then
    log "✅ Nginx está rodando"
else
    error "❌ Nginx não está rodando"
fi

# Verificar se os arquivos estão no lugar
if [ -f "$APP_DIR/index.html" ]; then
    log "✅ Arquivos da aplicação estão no lugar"
else
    error "❌ Arquivos da aplicação não encontrados"
fi

# Testar acesso local
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    log "✅ Site está respondendo localmente"
else
    warning "⚠️ Site não está respondendo localmente"
fi

# Resumo da instalação
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    INSTALAÇÃO CONCLUÍDA!                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "Resumo da instalação:"
echo "🌐 Domínio: $DOMAIN"
echo "📁 Diretório: $APP_DIR"
echo "🔧 Nginx: /etc/nginx/sites-available/$NGINX_SITE"
echo "📊 Logs: /var/log/nginx/"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o DNS do domínio para apontar para este servidor"
echo "2. Execute: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "3. Teste o site: http://$DOMAIN"
echo ""
echo "🔧 Comandos úteis:"
echo "- Atualizar: update-eralearn"
echo "- Backup: backup-eralearn"
echo "- Logs Nginx: tail -f /var/log/nginx/access.log"
echo "- Status: systemctl status nginx"

log "Instalação concluída com sucesso! 🚀"
