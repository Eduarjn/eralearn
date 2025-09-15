#!/bin/bash
# ========================================
# SCRIPT DE INICIALIZAÇÃO STANDALONE
# ========================================

echo "🚀 Iniciando ERA Learn Standalone..."

# Verificar se nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx não encontrado. Instalando..."
    apk add --no-cache nginx
fi

# Criar diretórios necessários
mkdir -p /var/run/nginx
mkdir -p /var/log/nginx

# Configurar nginx para modo standalone
cat > /etc/nginx/nginx.conf << 'EOF'
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Configuração para SPA (Single Page Application)
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache para arquivos estáticos
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Proxy para API local (quando disponível)
        location /api/ {
            proxy_pass http://backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Proxy para uploads
        location /uploads/ {
            proxy_pass http://backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
EOF

echo "✅ Configuração do nginx criada"

# Validar configuração do nginx
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração do nginx válida"
    echo "🚀 Iniciando nginx..."
    exec nginx -g "daemon off;"
else
    echo "❌ Erro na configuração do nginx"
    exit 1
fi























