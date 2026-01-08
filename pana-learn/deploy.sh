#!/bin/bash

# ========================================
# Script de Deploy ERA Learn
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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto ERA Learn"
fi

# Verificar se o domínio foi fornecido
if [ -z "$1" ]; then
    error "Uso: $0 <dominio> [email]"
    echo "Exemplo: $0 meusite.com admin@meusite.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

log "Iniciando deploy do ERA Learn para: $DOMAIN"

# ========================================
# 1. VERIFICAR PRÉ-REQUISITOS
# ========================================
log "Verificando pré-requisitos..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Execute o script de instalação primeiro."
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Execute o script de instalação primeiro."
fi

# Verificar se estamos no servidor correto
if [ ! -d "/opt/eralearn" ]; then
    error "Diretório /opt/eralearn não encontrado. Execute o script de instalação primeiro."
fi

# ========================================
# 2. PREPARAR ARQUIVOS
# ========================================
log "Preparando arquivos para deploy..."

# Copiar arquivos para o diretório de produção
sudo cp -r . /opt/eralearn/
sudo chown -R $USER:$USER /opt/eralearn

# Configurar arquivo de ambiente
if [ ! -f "/opt/eralearn/.env" ]; then
    log "Criando arquivo .env..."
    cp env.production.example /opt/eralearn/.env
    
    # Substituir domínio no arquivo .env
    sed -i "s/seudominio.com/$DOMAIN/g" /opt/eralearn/.env
    sed -i "s/admin@seudominio.com/$EMAIL/g" /opt/eralearn/.env
    
    warning "⚠️ Configure o arquivo .env com suas variáveis específicas:"
    warning "   nano /opt/eralearn/.env"
fi

# ========================================
# 3. CONFIGURAR NGINX
# ========================================
log "Configurando Nginx..."

# Atualizar configuração do Nginx com o domínio
sudo tee /opt/eralearn/nginx/conf.d/eralearn.conf > /dev/null <<EOF
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

# ========================================
# 4. CONFIGURAR SSL
# ========================================
log "Configurando SSL..."

# Verificar se já existe certificado
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log "Obtendo certificado SSL..."
    
    # Parar Nginx temporariamente
    sudo systemctl stop nginx
    
    # Obter certificado
    sudo certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    # Copiar certificados
    sudo mkdir -p /opt/eralearn/ssl
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/eralearn/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/eralearn/ssl/key.pem
    sudo chown -R $USER:$USER /opt/eralearn/ssl
else
    log "Certificado SSL já existe, copiando..."
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/eralearn/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/eralearn/ssl/key.pem
    sudo chown -R $USER:$USER /opt/eralearn/ssl
fi

# ========================================
# 5. CONSTRUIR E INICIAR APLICAÇÃO
# ========================================
log "Construindo e iniciando aplicação..."

cd /opt/eralearn

# Parar containers existentes
docker-compose -f docker-compose.prod.yml down

# Construir nova imagem
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar aplicação
docker-compose -f docker-compose.prod.yml up -d

# Aguardar aplicação inicializar
log "Aguardando aplicação inicializar..."
sleep 30

# ========================================
# 6. VERIFICAR STATUS
# ========================================
log "Verificando status da aplicação..."

# Verificar containers
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ Aplicação iniciada com sucesso"
else
    error "❌ Falha ao iniciar a aplicação"
fi

# Verificar conectividade
log "Testando conectividade..."

# Testar HTTP redirect
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN || echo "000")
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    log "✅ Redirect HTTP para HTTPS funcionando"
else
    warning "⚠️ Redirect HTTP pode não estar funcionando (Status: $HTTP_STATUS)"
fi

# Testar HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    log "✅ HTTPS funcionando corretamente"
else
    warning "⚠️ HTTPS pode não estar funcionando (Status: $HTTPS_STATUS)"
fi

# ========================================
# 7. CONFIGURAR MONITORAMENTO
# ========================================
log "Configurando monitoramento..."

# Adicionar renovação automática de SSL
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "0 3 * * * /opt/eralearn/renew-ssl.sh") | crontab -

# Adicionar backup diário
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 2 * * * /opt/eralearn/backup.sh") | crontab -

# ========================================
# 8. FINALIZAÇÃO
# ========================================
log "Deploy concluído!"

echo ""
echo "=========================================="
echo "🎉 ERA LEARN DEPLOYADO COM SUCESSO!"
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
echo "   1. Configure o arquivo .env com suas variáveis"
echo "   2. Teste todas as funcionalidades"
echo "   3. Configure backup automático"
echo "   4. Configure monitoramento"
echo ""
echo "🎯 Sua plataforma ERA Learn está online!"
echo ""

# Mostrar logs recentes
echo "📋 Logs recentes:"
docker-compose -f docker-compose.prod.yml logs --tail=10