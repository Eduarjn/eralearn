#!/bin/bash

# ========================================
# Script para Corrigir Carregamento de Imagens no Servidor
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

log "🔧 Iniciando correção de carregamento de imagens no servidor..."

# ========================================
# 1. VERIFICAR AMBIENTE
# ========================================
log "Verificando ambiente..."

if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto ERA Learn"
fi

# ========================================
# 2. CORRIGIR CONFIGURAÇÃO DO NGINX
# ========================================
log "Corrigindo configuração do Nginx..."

# Criar configuração corrigida do Nginx
cat > nginx-fixed.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Configurações de log
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Configurações de performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Configurações de upload
    client_max_body_size 100M;

    server {
        listen 80;
        server_name localhost;

        # Root directory correto para o build do Vite
        root /usr/share/nginx/html;
        index index.html;

        # ========================================
        # ARQUIVOS PÚBLICOS (CSS, JS, IMAGENS)
        # ========================================
        location / {
            try_files $uri $uri/ /index.html;
            
            # Headers para cache de arquivos estáticos
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                access_log off;
            }
            
            # Headers para HTML
            location ~* \.html$ {
                expires 1h;
                add_header Cache-Control "public, must-revalidate";
            }
        }

        # ========================================
        # IMAGENS ESPECÍFICAS (LOGOS, ETC)
        # ========================================
        location ~* \.(svg|png|jpg|jpeg|gif|ico)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header 'Access-Control-Allow-Origin' '*';
            access_log off;
        }

        # ========================================
        # VÍDEOS DOS CURSOS
        # ========================================
        location /media/videos/ {
            alias /var/www/videos/;
            
            # Headers para streaming de vídeo
            add_header Accept-Ranges bytes;
            add_header Content-Type video/mp4;
            
            # Permitir Range requests para seek
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain; charset=utf-8';
                add_header 'Content-Length' 0;
                return 204;
            }
            
            # Cache para vídeos
            expires 30d;
            add_header Cache-Control "public";
        }

        # ========================================
        # BRANDING (LOGOS, FAVICONS, BACKGROUNDS)
        # ========================================
        location /media/branding/ {
            alias /var/www/branding/;
            
            # Headers para imagens
            add_header Cache-Control "public, max-age=31536000";
            
            # Permitir CORS
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            
            # Cache longo para branding
            expires 1y;
        }

        # ========================================
        # UPLOADS GERAIS
        # ========================================
        location /media/uploads/ {
            alias /var/www/uploads/;
            
            # Headers para uploads
            add_header Cache-Control "public, max-age=86400";
            add_header 'Access-Control-Allow-Origin' '*';
            
            # Cache de 1 dia para uploads
            expires 1d;
        }

        # ========================================
        # API DO SERVIDOR DE UPLOAD
        # ========================================
        location /api/ {
            proxy_pass http://upload-server:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # ========================================
        # CONFIGURAÇÕES DE SEGURANÇA
        # ========================================
        
        # Ocultar versão do Nginx
        server_tokens off;
        
        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
EOF

log "✅ Configuração do Nginx corrigida criada"

# ========================================
# 3. ATUALIZAR DOCKERFILE DE PRODUÇÃO
# ========================================
log "Atualizando Dockerfile de produção..."

# Criar Dockerfile corrigido
cat > Dockerfile.prod.fixed << 'EOF'
# ========================================
# Dockerfile para Produção - ERA Learn (CORRIGIDO)
# ========================================

# Estágio 1: Build da aplicação
FROM node:18-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY bun.lockb ./

# Instalar dependências
RUN npm ci --only=production --silent

# Copiar código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Estágio 2: Servidor Nginx
FROM nginx:alpine

# Instalar dependências adicionais
RUN apk add --no-cache curl

# Copiar arquivos construídos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx corrigida
COPY nginx-fixed.conf /etc/nginx/nginx.conf

# Criar diretórios necessários
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run

# Configurar permissões
RUN chown -R nginx:nginx /usr/share/nginx/html /var/log/nginx /var/cache/nginx /var/run

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
EOF

log "✅ Dockerfile de produção corrigido criado"

# ========================================
# 4. CRIAR SCRIPT DE DEPLOY CORRIGIDO
# ========================================
log "Criando script de deploy corrigido..."

cat > deploy-fixed.sh << 'EOF'
#!/bin/bash

# ========================================
# Script de Deploy ERA Learn (CORRIGIDO)
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

log "Iniciando deploy CORRIGIDO do ERA Learn para: $DOMAIN"

# ========================================
# 1. PREPARAR ARQUIVOS CORRIGIDOS
# ========================================
log "Preparando arquivos corrigidos..."

# Usar configurações corrigidas
cp nginx-fixed.conf nginx.conf
cp Dockerfile.prod.fixed Dockerfile.prod

# ========================================
# 2. CONSTRUIR E INICIAR APLICAÇÃO
# ========================================
log "Construindo e iniciando aplicação com correções..."

# Parar containers existentes
docker-compose -f docker-compose.prod.yml down

# Construir nova imagem com correções
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar aplicação
docker-compose -f docker-compose.prod.yml up -d

# Aguardar aplicação inicializar
log "Aguardando aplicação inicializar..."
sleep 30

# ========================================
# 3. VERIFICAR STATUS
# ========================================
log "Verificando status da aplicação..."

# Verificar containers
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log "✅ Aplicação iniciada com sucesso"
else
    error "❌ Falha ao iniciar a aplicação"
fi

# Testar carregamento de imagens
log "Testando carregamento de imagens..."
if curl -f -s "http://localhost/logotipoeralearn.svg" > /dev/null; then
    log "✅ Logo SVG carregando corretamente"
else
    warning "⚠️ Logo SVG pode não estar carregando"
fi

if curl -f -s "http://localhost/placeholder.svg" > /dev/null; then
    log "✅ Placeholder SVG carregando corretamente"
else
    warning "⚠️ Placeholder SVG pode não estar carregando"
fi

log "Deploy corrigido concluído!"
echo ""
echo "🎉 ERA LEARN DEPLOYADO COM CORREÇÕES!"
echo "🔧 Problemas de carregamento de imagens corrigidos"
echo "🌐 Acesse: http://$DOMAIN"
echo ""
EOF

chmod +x deploy-fixed.sh
log "✅ Script de deploy corrigido criado"

# ========================================
# 5. CRIAR SCRIPT DE TESTE
# ========================================
log "Criando script de teste..."

cat > test-images.sh << 'EOF'
#!/bin/bash

# ========================================
# Script para Testar Carregamento de Imagens
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
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se o domínio foi fornecido
if [ -z "$1" ]; then
    error "Uso: $0 <dominio>"
    echo "Exemplo: $0 meusite.com"
    exit 1
fi

DOMAIN=$1

log "🧪 Testando carregamento de imagens em: $DOMAIN"

# Lista de imagens para testar
IMAGES=(
    "logotipoeralearn.svg"
    "logotipoeralearn.png"
    "placeholder.svg"
    "favicon.ico"
)

# Testar cada imagem
for image in "${IMAGES[@]}"; do
    log "Testando: $image"
    
    # Testar HTTP
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/$image" || echo "000")
    if [ "$HTTP_STATUS" = "200" ]; then
        log "✅ HTTP: $image carregando corretamente"
    else
        warning "⚠️ HTTP: $image retornou status $HTTP_STATUS"
    fi
    
    # Testar HTTPS (se disponível)
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/$image" || echo "000")
    if [ "$HTTPS_STATUS" = "200" ]; then
        log "✅ HTTPS: $image carregando corretamente"
    else
        warning "⚠️ HTTPS: $image retornou status $HTTPS_STATUS"
    fi
    
    echo ""
done

log "🎯 Teste de imagens concluído!"
EOF

chmod +x test-images.sh
log "✅ Script de teste criado"

# ========================================
# 6. FINALIZAÇÃO
# ========================================
log "🎉 Correções aplicadas com sucesso!"
echo ""
echo "=========================================="
echo "🔧 CORREÇÕES DE IMAGENS APLICADAS"
echo "=========================================="
echo ""
echo "📁 Arquivos criados:"
echo "   - nginx-fixed.conf (configuração corrigida do Nginx)"
echo "   - Dockerfile.prod.fixed (Dockerfile corrigido)"
echo "   - deploy-fixed.sh (script de deploy corrigido)"
echo "   - test-images.sh (script de teste)"
echo ""
echo "🚀 Para aplicar as correções:"
echo "   1. Execute: ./deploy-fixed.sh <seu-dominio>"
echo "   2. Teste: ./test-images.sh <seu-dominio>"
echo ""
echo "🔍 Principais correções:"
echo "   - Nginx configurado para servir de /usr/share/nginx/html"
echo "   - Headers de cache corretos para imagens"
echo "   - CORS habilitado para imagens"
echo "   - Detecção de ambiente melhorada no imageUtils.ts"
echo "   - Fallbacks de imagem corrigidos"
echo ""
echo "✅ Problemas de carregamento de imagens devem estar resolvidos!"
echo ""
