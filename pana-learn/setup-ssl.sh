#!/bin/bash

# ========================================
# Script de Configuração SSL - ERA Learn
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

# Verificar se o domínio foi fornecido
if [ -z "$1" ]; then
    error "Uso: $0 <dominio> [email]"
    echo "Exemplo: $0 meusite.com admin@meusite.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

log "Configurando SSL para o domínio: $DOMAIN"
log "Email para notificações: $EMAIL"

# ========================================
# 1. VERIFICAR PRÉ-REQUISITOS
# ========================================
log "Verificando pré-requisitos..."

# Verificar se certbot está instalado
if ! command -v certbot &> /dev/null; then
    error "Certbot não está instalado. Execute o script de instalação primeiro."
fi

# Verificar se o domínio está apontando para este servidor
log "Verificando DNS do domínio $DOMAIN..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    warning "O domínio $DOMAIN ($DOMAIN_IP) não está apontando para este servidor ($SERVER_IP)"
    warning "Certifique-se de que o DNS está configurado corretamente antes de continuar"
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ========================================
# 2. PARAR NGINX TEMPORARIAMENTE
# ========================================
log "Parando Nginx temporariamente..."
sudo systemctl stop nginx

# ========================================
# 3. OBTER CERTIFICADO SSL
# ========================================
log "Obtendo certificado SSL do Let's Encrypt..."

# Verificar se já existe certificado
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    info "Certificado já existe. Renovando..."
    sudo certbot renew --cert-name $DOMAIN
else
    # Obter novo certificado
    sudo certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        -d $DOMAIN \
        -d www.$DOMAIN
fi

# ========================================
# 4. COPIAR CERTIFICADOS
# ========================================
log "Copiando certificados para o diretório da aplicação..."

sudo mkdir -p /opt/eralearn/ssl
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/eralearn/ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/eralearn/ssl/key.pem
sudo chown -R $USER:$USER /opt/eralearn/ssl

# ========================================
# 5. CONFIGURAR NGINX
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
# 6. CONFIGURAR RENOVAÇÃO AUTOMÁTICA
# ========================================
log "Configurando renovação automática..."

# Script de renovação personalizado
sudo tee /opt/eralearn/renew-ssl.sh > /dev/null <<EOF
#!/bin/bash
# Renovar certificado SSL
sudo certbot renew --quiet

# Copiar novos certificados
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/eralearn/ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/eralearn/ssl/key.pem
sudo chown -R $USER:$USER /opt/eralearn/ssl

# Reiniciar containers
cd /opt/eralearn
docker-compose -f docker-compose.prod.yml restart nginx-proxy

echo "SSL renovado em \$(date)"
EOF

sudo chmod +x /opt/eralearn/renew-ssl.sh

# Adicionar ao cron para renovação automática
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "0 3 * * * /opt/eralearn/renew-ssl.sh") | crontab -

# ========================================
# 7. INICIAR SERVIÇOS
# ========================================
log "Iniciando serviços..."

# Iniciar aplicação
cd /opt/eralearn
docker-compose -f docker-compose.prod.yml up -d

# Verificar se os serviços estão rodando
sleep 10
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "Aplicação iniciada com sucesso"
else
    error "Falha ao iniciar a aplicação"
fi

# ========================================
# 8. TESTAR CONFIGURAÇÃO
# ========================================
log "Testando configuração SSL..."

# Testar HTTP redirect
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    log "✅ Redirect HTTP para HTTPS funcionando"
else
    warning "⚠️ Redirect HTTP pode não estar funcionando (Status: $HTTP_STATUS)"
fi

# Testar HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$HTTPS_STATUS" = "200" ]; then
    log "✅ HTTPS funcionando corretamente"
else
    warning "⚠️ HTTPS pode não estar funcionando (Status: $HTTPS_STATUS)"
fi

# Testar certificado
if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    log "✅ Certificado SSL válido"
else
    warning "⚠️ Certificado SSL pode ter problemas"
fi

# ========================================
# 9. FINALIZAÇÃO
# ========================================
log "Configuração SSL concluída!"

echo ""
echo "=========================================="
echo "🔒 SSL CONFIGURADO COM SUCESSO!"
echo "=========================================="
echo ""
echo "Domínio: https://$DOMAIN"
echo "Email: $EMAIL"
echo ""
echo "Certificado válido até:"
sudo certbot certificates | grep -A 2 "$DOMAIN" | grep "Expiry Date"
echo ""
echo "Comandos úteis:"
echo "- Verificar certificado: sudo certbot certificates"
echo "- Renovar manualmente: sudo certbot renew"
echo "- Renovar e aplicar: /opt/eralearn/renew-ssl.sh"
echo "- Status da aplicação: /opt/eralearn/status.sh"
echo ""
echo "🎉 Sua aplicação ERA Learn está rodando com SSL!"
echo ""

# Mostrar URLs importantes
echo "URLs importantes:"
echo "- Aplicação: https://$DOMAIN"
echo "- Admin: https://$DOMAIN/dashboard"
echo "- API: https://$DOMAIN/api"
echo "- Health Check: https://$DOMAIN/health"
echo ""
