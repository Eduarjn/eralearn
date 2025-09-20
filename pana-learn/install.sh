#!/bin/bash

# ========================================
# ERA Learn - Instalação Automática
# ========================================
# Execute: curl -fsSL https://raw.githubusercontent.com/seu-usuario/eralearn/main/install.sh | bash -s seudominio.com admin@seudominio.com

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

# Verificar se o domínio foi fornecido
if [ -z "$1" ]; then
    error "Uso: $0 <dominio> [email]"
    echo "Exemplo: $0 meusite.com admin@meusite.com"
    echo "Ou execute: curl -fsSL https://raw.githubusercontent.com/seu-usuario/eralearn/main/install.sh | bash -s meusite.com admin@meusite.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

log "🚀 Iniciando instalação automática do ERA Learn"
log "🌐 Domínio: $DOMAIN"
log "📧 Email: $EMAIL"

# ========================================
# 1. VERIFICAR SISTEMA
# ========================================
log "🔍 Verificando sistema..."

# Verificar se é Ubuntu/Debian
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    error "Sistema operacional não suportado"
fi

if [[ "$OS" != *"Ubuntu"* ]] && [[ "$OS" != *"Debian"* ]]; then
    error "Este script suporta apenas Ubuntu/Debian. Sistema detectado: $OS"
fi

log "✅ Sistema: $OS $VER"

# Verificar se não é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root. Use um usuário com sudo."
fi

# ========================================
# 2. ATUALIZAR SISTEMA
# ========================================
log "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# ========================================
# 3. INSTALAR DOCKER
# ========================================
log "🐳 Instalando Docker..."

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log "✅ Docker instalado"
else
    info "Docker já está instalado"
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "✅ Docker Compose instalado"
else
    info "Docker Compose já está instalado"
fi

# ========================================
# 4. INSTALAR NGINX
# ========================================
log "🌐 Instalando Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
log "✅ Nginx instalado"

# ========================================
# 5. INSTALAR CERTBOT
# ========================================
log "🔒 Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx
log "✅ Certbot instalado"

# ========================================
# 6. CONFIGURAR FIREWALL
# ========================================
log "🔥 Configurando firewall..."
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
log "✅ Firewall configurado"

# ========================================
# 7. CRIAR DIRETÓRIOS
# ========================================
log "📁 Criando diretórios..."
sudo mkdir -p /opt/eralearn
sudo chown $USER:$USER /opt/eralearn
mkdir -p /opt/eralearn/{data,logs,ssl,nginx/conf.d}
log "✅ Diretórios criados"

# ========================================
# 8. BAIXAR CÓDIGO DA APLICAÇÃO
# ========================================
log "📥 Baixando código da aplicação..."

cd /opt/eralearn

# Baixar arquivos do GitHub
curl -fsSL https://github.com/Eduarjn/eralearn/archive/main.zip -o eralearn.zip
unzip -q eralearn.zip
mv eralearn-main/* .
mv eralearn-main/.* . 2>/dev/null || true
rm -rf eralearn-main eralearn.zip

log "✅ Código baixado"

# ========================================
# 9. CONFIGURAR PERMISSÕES
# ========================================
log "🔐 Configurando permissões..."
chmod +x *.sh
log "✅ Permissões configuradas"

# ========================================
# 10. CONFIGURAR ARQUIVO .ENV
# ========================================
log "⚙️ Configurando variáveis de ambiente..."

if [ ! -f ".env" ]; then
    cp env.production.example .env
    
    # Substituir domínio no arquivo .env
    sed -i "s/seudominio.com/$DOMAIN/g" .env
    sed -i "s/admin@seudominio.com/$EMAIL/g" .env
    
    log "✅ Arquivo .env configurado"
else
    info "Arquivo .env já existe"
fi

# ========================================
# 11. CONFIGURAR NGINX
# ========================================
log "🌐 Configurando Nginx..."

# Atualizar configuração do Nginx com o domínio
sudo tee nginx/conf.d/eralearn.conf > /dev/null <<EOF
# ========================================
# Configuração do Site ERA Learn - $DOMAIN
# ========================================

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Root directory
    root /usr/share/nginx/html;
    index index.html;

    # Main application
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache control for HTML files
        location ~* \.html\$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
    }

    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://eralearn_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Login endpoint with stricter rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://eralearn_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }

    # Static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Certificates and data files
    location /data/ {
        alias /usr/share/nginx/html/data/;
        expires 1y;
        add_header Cache-Control "public";
        
        # Security for sensitive files
        location ~* \.(pdf|svg|png|jpg)\$ {
            add_header Content-Disposition "attachment";
        }
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ~\$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Custom error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

log "✅ Nginx configurado"

# ========================================
# 12. CONFIGURAR SSL
# ========================================
log "🔒 Configurando SSL..."

# Verificar se o domínio está apontando para este servidor
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    warning "⚠️ O domínio $DOMAIN ($DOMAIN_IP) não está apontando para este servidor ($SERVER_IP)"
    warning "⚠️ Certifique-se de que o DNS está configurado corretamente"
fi

# Parar Nginx temporariamente
sudo systemctl stop nginx

# Obter certificado SSL
sudo certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN

# Copiar certificados
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
sudo chown -R $USER:$USER ssl

log "✅ SSL configurado"

# ========================================
# 13. CONSTRUIR E INICIAR APLICAÇÃO
# ========================================
log "🚀 Construindo e iniciando aplicação..."

# Construir aplicação
docker-compose -f docker-compose.prod.yml build

# Iniciar aplicação
docker-compose -f docker-compose.prod.yml up -d

# Aguardar aplicação inicializar
log "⏳ Aguardando aplicação inicializar..."
sleep 30

# ========================================
# 14. CONFIGURAR MONITORAMENTO
# ========================================
log "📊 Configurando monitoramento..."

# Configurar logrotate
sudo tee /etc/logrotate.d/eralearn > /dev/null <<EOF
/opt/eralearn/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /opt/eralearn/docker-compose.prod.yml restart nginx-proxy
    endscript
}
EOF

# Configurar renovação automática de SSL
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "0 3 * * * /opt/eralearn/renew-ssl.sh") | crontab -

# Configurar backup diário
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 2 * * * /opt/eralearn/backup.sh") | crontab -

log "✅ Monitoramento configurado"

# ========================================
# 15. VERIFICAR INSTALAÇÃO
# ========================================
log "🔍 Verificando instalação..."

# Verificar containers
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ Aplicação iniciada com sucesso"
else
    error "❌ Falha ao iniciar a aplicação"
fi

# Verificar conectividade
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN || echo "000")
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    log "✅ Redirect HTTP para HTTPS funcionando"
else
    warning "⚠️ Redirect HTTP pode não estar funcionando (Status: $HTTP_STATUS)"
fi

HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    log "✅ HTTPS funcionando corretamente"
else
    warning "⚠️ HTTPS pode não estar funcionando (Status: $HTTPS_STATUS)"
fi

# ========================================
# 16. FINALIZAÇÃO
# ========================================
log "🎉 Instalação concluída!"

echo ""
echo "=========================================="
echo "🎉 ERA LEARN INSTALADO COM SUCESSO!"
echo "=========================================="
echo ""
echo "🌐 URLs:"
echo "   Aplicação: https://$DOMAIN"
echo "   Admin: https://$DOMAIN/dashboard"
echo "   API: https://$DOMAIN/api"
echo "   Health: https://$DOMAIN/health"
echo ""
echo "📊 Status:"
echo "   Containers: $(docker-compose -f docker-compose.prod.yml ps --services | wc -l) rodando"
echo "   SSL: $(sudo certbot certificates | grep -A 2 "$DOMAIN" | grep "Expiry Date" | cut -d: -f2-)"
echo ""
echo "🛠️ Comandos úteis:"
echo "   Status: /opt/eralearn/status.sh"
echo "   Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Backup: /opt/eralearn/backup.sh"
echo "   Atualizar: /opt/eralearn/update.sh"
echo "   Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "📝 Próximos passos:"
echo "   1. Acesse https://$DOMAIN"
echo "   2. Faça login como administrador"
echo "   3. Configure suas preferências"
echo "   4. Teste todas as funcionalidades"
echo ""
echo "🎯 Sua plataforma ERA Learn está online!"
echo ""

# Mostrar logs recentes
echo "📋 Logs recentes:"
docker-compose -f docker-compose.prod.yml logs --tail=5

echo ""
echo "⚠️ IMPORTANTE: Faça logout e login novamente para usar Docker sem sudo"
echo ""
