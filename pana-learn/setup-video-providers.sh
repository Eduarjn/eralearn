#!/bin/bash

# ========================================
# SCRIPT DE CONFIGURAÇÃO DOS PROVIDERS DE VÍDEO
# ========================================
# Este script configura o sistema de providers de vídeo
# Execute como root ou com sudo

set -e

echo "🎥 Configurando sistema de providers de vídeo..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Este script deve ser executado como root ou com sudo"
fi

# 1. Criar diretório para vídeos
log "Criando diretório para vídeos..."
MEDIA_DIR="/var/media"
mkdir -p "$MEDIA_DIR"
chown -R www-data:www-data "$MEDIA_DIR"
chmod -R 755 "$MEDIA_DIR"
success "Diretório $MEDIA_DIR criado"

# 2. Instalar dependências do sistema
log "Instalando dependências..."
apt-get update
apt-get install -y nginx ffmpeg

# 3. Configurar NGINX
log "Configurando NGINX..."
NGINX_CONFIG="/etc/nginx/sites-available/video-providers"

cat > "$NGINX_CONFIG" << 'EOF'
# Configuração para providers de vídeo
server {
    listen 80;
    server_name _;
    
    # Configuração para vídeos protegidos
    location /protected/ {
        internal;
        alias /var/media/;
        add_header Accept-Ranges bytes;
        add_header Cache-Control "public, max-age=3600";
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options SAMEORIGIN;
        
        # Configurações de streaming
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
    
    # Configuração para uploads
    location /api/upload/internal {
        client_max_body_size 2G;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts para uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # Configuração para APIs
    location /api/media {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/stream {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Configuração principal
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar site
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
success "NGINX configurado"

# 4. Configurar variáveis de ambiente
log "Configurando variáveis de ambiente..."
ENV_FILE=".env"

# Verificar se arquivo .env existe
if [ ! -f "$ENV_FILE" ]; then
    warning "Arquivo .env não encontrado. Criando a partir do exemplo..."
    cp env.example "$ENV_FILE"
fi

# Adicionar configurações de vídeo se não existirem
if ! grep -q "INTERNAL_MEDIA_ROOT" "$ENV_FILE"; then
    cat >> "$ENV_FILE" << 'EOF'

# ========================================
# VIDEO PROVIDERS CONFIGURAÇÃO
# ========================================

# Provider de vídeo: 'internal' (servidor próprio) ou 'youtube'
VIDEO_PROVIDER=internal

# INTERNAL provider (NGINX/X-Accel):
INTERNAL_MEDIA_ROOT=/var/media
INTERNAL_PUBLIC_PREFIX=/protected/

# TTL das URLs assinadas (segundos)
MEDIA_SIGN_TTL=3600
JWT_SECRET=$(openssl rand -base64 32)
EOF
    success "Variáveis de ambiente adicionadas"
else
    warning "Configurações de vídeo já existem no .env"
fi

# 5. Instalar dependências Node.js
log "Instalando dependências Node.js..."
if [ -f "package.json" ]; then
    npm install jsonwebtoken @types/jsonwebtoken
    success "Dependências Node.js instaladas"
else
    warning "package.json não encontrado. Execute 'npm install jsonwebtoken @types/jsonwebtoken' manualmente"
fi

# 6. Criar script de backup
log "Criando script de backup..."
BACKUP_SCRIPT="/usr/local/bin/backup-videos.sh"

cat > "$BACKUP_SCRIPT" << 'EOF'
#!/bin/bash
# Script de backup dos vídeos

BACKUP_DIR="/backup/videos/$(date +%Y%m%d)"
MEDIA_DIR="/var/media"

mkdir -p "$BACKUP_DIR"

# Backup dos arquivos
rsync -av "$MEDIA_DIR/" "$BACKUP_DIR/"

# Backup dos metadados (se conectado ao Supabase)
echo "Backup concluído em $BACKUP_DIR"
EOF

chmod +x "$BACKUP_SCRIPT"
success "Script de backup criado: $BACKUP_SCRIPT"

# 7. Configurar cron para backup
log "Configurando backup automático..."
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT") | crontab -
success "Backup automático configurado (diário às 2h)"

# 8. Criar script de monitoramento
log "Criando script de monitoramento..."
MONITOR_SCRIPT="/usr/local/bin/monitor-videos.sh"

cat > "$MONITOR_SCRIPT" << 'EOF'
#!/bin/bash
# Script de monitoramento dos vídeos

MEDIA_DIR="/var/media"
LOG_FILE="/var/log/video-monitor.log"

echo "$(date): Verificando sistema de vídeos..." >> "$LOG_FILE"

# Verificar espaço em disco
DISK_USAGE=$(df "$MEDIA_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "$(date): ALERTA: Uso de disco em $DISK_USAGE%" >> "$LOG_FILE"
fi

# Verificar arquivos corrompidos
find "$MEDIA_DIR" -name "*.mp4" -exec ffprobe -v quiet -show_entries format=duration {} \; 2>/dev/null | grep -q "N/A" && \
    echo "$(date): ALERTA: Arquivos corrompidos detectados" >> "$LOG_FILE"

# Verificar permissões
find "$MEDIA_DIR" ! -user www-data -o ! -group www-data | head -5 | while read file; do
    echo "$(date): ALERTA: Permissões incorretas em $file" >> "$LOG_FILE"
done

echo "$(date): Monitoramento concluído" >> "$LOG_FILE"
EOF

chmod +x "$MONITOR_SCRIPT"
success "Script de monitoramento criado: $MONITOR_SCRIPT"

# 9. Configurar logrotate
log "Configurando rotação de logs..."
cat > "/etc/logrotate.d/video-monitor" << 'EOF'
/var/log/video-monitor.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# 10. Testar configuração
log "Testando configuração..."

# Testar NGINX
nginx -t || error "Configuração do NGINX inválida"

# Testar diretório
[ -d "$MEDIA_DIR" ] || error "Diretório de mídia não existe"
[ -w "$MEDIA_DIR" ] || error "Diretório de mídia não é gravável"

# Testar permissões
[ -r "$ENV_FILE" ] || error "Arquivo .env não é legível"

success "Configuração testada com sucesso"

# 11. Resumo final
echo ""
echo "=========================================="
echo "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "=========================================="
echo ""
echo "📁 Diretório de vídeos: $MEDIA_DIR"
echo "🔧 Configuração NGINX: $NGINX_CONFIG"
echo "📝 Arquivo de ambiente: $ENV_FILE"
echo "💾 Script de backup: $BACKUP_SCRIPT"
echo "📊 Script de monitoramento: $MONITOR_SCRIPT"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Execute os scripts SQL no Supabase:"
echo "   - create-assets-table.sql"
echo "   - setup-assets-rls.sql"
echo "   - migrate-videos-to-assets.sql"
echo ""
echo "2. Reinicie o servidor da aplicação"
echo ""
echo "3. Teste o upload e reprodução de vídeos"
echo ""
echo "4. Configure SSL/HTTPS se necessário"
echo ""
echo "📚 Documentação: VIDEO_PROVIDERS_IMPLEMENTATION.md"
echo ""

success "Sistema de providers de vídeo configurado!"









