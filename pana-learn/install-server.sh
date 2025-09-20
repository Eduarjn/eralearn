#!/bin/bash

# ========================================
# Script de Instalação ERA Learn no Servidor
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

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root. Use um usuário com sudo."
fi

# Verificar sistema operacional
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    error "Sistema operacional não suportado"
fi

log "Iniciando instalação do ERA Learn no $OS $VER"

# ========================================
# 1. ATUALIZAR SISTEMA
# ========================================
log "Atualizando sistema..."

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    sudo yum update -y
    sudo yum install -y curl wget git unzip yum-utils
else
    error "Sistema operacional não suportado: $OS"
fi

# ========================================
# 2. INSTALAR DOCKER
# ========================================
log "Instalando Docker..."

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log "Docker instalado com sucesso"
else
    info "Docker já está instalado"
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "Docker Compose instalado com sucesso"
else
    info "Docker Compose já está instalado"
fi

# ========================================
# 3. INSTALAR NGINX
# ========================================
log "Instalando Nginx..."

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    sudo apt install -y nginx
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    sudo yum install -y nginx
fi

sudo systemctl start nginx
sudo systemctl enable nginx
log "Nginx instalado e iniciado"

# ========================================
# 4. INSTALAR CERTBOT
# ========================================
log "Instalando Certbot..."

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    sudo apt install -y certbot python3-certbot-nginx
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    sudo yum install -y certbot python3-certbot-nginx
fi

# ========================================
# 5. CONFIGURAR FIREWALL
# ========================================
log "Configurando firewall..."

if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    log "UFW configurado"
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    log "Firewalld configurado"
else
    warning "Nenhum firewall detectado. Configure manualmente as portas 22, 80 e 443"
fi

# ========================================
# 6. CRIAR DIRETÓRIOS
# ========================================
log "Criando diretórios..."

sudo mkdir -p /opt/eralearn
sudo chown $USER:$USER /opt/eralearn
mkdir -p /opt/eralearn/{data,logs,ssl,nginx/conf.d}

# ========================================
# 7. CONFIGURAR LOGROTATE
# ========================================
log "Configurando logrotate..."

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

# ========================================
# 8. CRIAR SCRIPTS DE MANUTENÇÃO
# ========================================
log "Criando scripts de manutenção..."

# Script de backup
cat > /opt/eralearn/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/eralearn"
APP_DIR="/opt/eralearn"

mkdir -p $BACKUP_DIR

# Backup dos dados
tar -czf $BACKUP_DIR/eralearn_data_$DATE.tar.gz -C $APP_DIR data/

# Backup da configuração
tar -czf $BACKUP_DIR/eralearn_config_$DATE.tar.gz -C $APP_DIR .env docker-compose.prod.yml nginx/

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "eralearn_*" -mtime +7 -delete

echo "Backup concluído: $DATE"
EOF

# Script de atualização
cat > /opt/eralearn/update.sh << 'EOF'
#!/bin/bash
cd /opt/eralearn

# Fazer backup antes da atualização
./backup.sh

# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Atualizar código (se usando git)
if [ -d ".git" ]; then
    git pull origin main
fi

# Reconstruir e iniciar
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo "Atualização concluída!"
EOF

# Script de monitoramento
cat > /opt/eralearn/status.sh << 'EOF'
#!/bin/bash
echo "=== STATUS ERA LEARN ==="
echo "Containers:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "Logs recentes:"
docker-compose -f docker-compose.prod.yml logs --tail=10
echo ""
echo "Uso de recursos:"
docker stats --no-stream
EOF

chmod +x /opt/eralearn/*.sh

# ========================================
# 9. CONFIGURAR CRON
# ========================================
log "Configurando tarefas agendadas..."

# Adicionar renovação automática de SSL
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Adicionar backup diário
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/eralearn/backup.sh") | crontab -

# ========================================
# 10. FINALIZAÇÃO
# ========================================
log "Instalação concluída!"

echo ""
echo "=========================================="
echo "🎉 ERA LEARN INSTALADO COM SUCESSO!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "1. Copie os arquivos da aplicação para /opt/eralearn/"
echo "2. Configure o arquivo .env com suas variáveis"
echo "3. Configure o domínio no nginx/conf.d/eralearn.conf"
echo "4. Execute: cd /opt/eralearn && docker-compose -f docker-compose.prod.yml up -d"
echo "5. Configure o certificado SSL com: sudo certbot --nginx -d seudominio.com"
echo ""
echo "Comandos úteis:"
echo "- Status: /opt/eralearn/status.sh"
echo "- Backup: /opt/eralearn/backup.sh"
echo "- Atualizar: /opt/eralearn/update.sh"
echo "- Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "⚠️  IMPORTANTE: Faça logout e login novamente para usar Docker sem sudo"
echo ""

# Verificar se precisa fazer logout
if ! groups | grep -q docker; then
    warning "Você precisa fazer logout e login novamente para usar Docker sem sudo"
fi