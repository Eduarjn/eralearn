#!/bin/bash

# Script completo para instalar SSL próprio
# Execute como root: sudo bash setup-ssl-complete.sh

echo "🚀 Configurando SSL próprio para ERA Learn..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo bash setup-ssl-complete.sh"
    exit 1
fi

# 1. Instalar Nginx se não estiver instalado
echo "📦 Verificando Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "Instalando Nginx..."
    apt update
    apt install -y nginx
fi

# 2. Criar diretórios para certificados
echo "📁 Criando diretórios..."
mkdir -p /etc/ssl/certs/eralearn
mkdir -p /etc/ssl/private/eralearn

# 3. Instruções para copiar certificados
echo "🔐 INSTRUÇÕES PARA CERTIFICADOS:"
echo "1. Copie seu arquivo .crt para: /etc/ssl/certs/eralearn/certificate.crt"
echo "2. Copie seu arquivo .key para: /etc/ssl/private/eralearn/private.key"
echo "3. Execute os comandos abaixo:"
echo ""
echo "   cp seu-certificado.crt /etc/ssl/certs/eralearn/certificate.crt"
echo "   cp sua-chave-privada.key /etc/ssl/private/eralearn/private.key"
echo "   chmod 644 /etc/ssl/certs/eralearn/certificate.crt"
echo "   chmod 600 /etc/ssl/private/eralearn/private.key"
echo ""

# 4. Configurar Nginx
echo "⚙️ Configurando Nginx..."

# Backup da configuração atual
if [ -f /etc/nginx/sites-available/default ]; then
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
fi

# Criar configuração SSL
cat > /etc/nginx/sites-available/eralearn << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/eralearn/certificate.crt;
    ssl_certificate_key /etc/ssl/private/eralearn/private.key;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Configuração da aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Configuração para uploads grandes
    client_max_body_size 100M;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

# 5. Ativar site
echo "🔗 Ativando site..."
ln -sf /etc/nginx/sites-available/eralearn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 6. Testar configuração
echo "🧪 Testando configuração Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração Nginx válida!"
    
    # 7. Reiniciar Nginx
    echo "🔄 Reiniciando Nginx..."
    systemctl restart nginx
    systemctl enable nginx
    
    echo "🎉 SSL configurado com sucesso!"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Copie seus certificados para os diretórios indicados"
    echo "2. Edite /etc/nginx/sites-available/eralearn e substitua '_' pelo seu domínio"
    echo "3. Reinicie Nginx: sudo systemctl restart nginx"
    echo "4. Teste: https://seudominio.com"
    
else
    echo "❌ Erro na configuração Nginx!"
    echo "Verifique os logs: sudo nginx -t"
fi
















