#!/bin/bash
# Script para fazer update remoto no servidor (executar do seu PC local)

# CONFIGURAÇÕES - AJUSTE CONFORME SEU SERVIDOR
SERVER_IP="138.59.144.162"
SERVER_USER="root"  # ou o usuário que você usa para SSH
PROJECT_PATH="/var/www/eralearn"  # caminho do projeto no servidor
SSH_KEY=""  # caminho para chave SSH (opcional)

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo "🚀 UPDATE REMOTO - ERA Learn"
echo "============================"
echo ""
log_info "Servidor: $SERVER_USER@$SERVER_IP"
log_info "Projeto: $PROJECT_PATH"
echo ""

# Verificar conectividade
log_info "Testando conectividade com o servidor..."
if ping -c 1 "$SERVER_IP" > /dev/null 2>&1; then
    log_success "Servidor acessível"
else
    log_error "Servidor não acessível"
    exit 1
fi

# Construir comando SSH
SSH_CMD="ssh"
if [ ! -z "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
fi

# Testar conexão SSH
log_info "Testando conexão SSH..."
if $SSH_CMD -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "echo 'SSH OK'" > /dev/null 2>&1; then
    log_success "Conexão SSH funcionando"
else
    log_error "Falha na conexão SSH"
    log_info "Verifique:"
    log_info "  - Usuário: $SERVER_USER"
    log_info "  - IP: $SERVER_IP"
    log_info "  - Chave SSH (se aplicável): $SSH_KEY"
    exit 1
fi

# Executar update remoto
log_info "Executando update remoto..."
echo ""

$SSH_CMD "$SERVER_USER@$SERVER_IP" << EOF
set -e  # Parar em caso de erro

echo "🔧 Iniciando update no servidor..."

# Navegar para o diretório do projeto
if [ -d "$PROJECT_PATH" ]; then
    cd "$PROJECT_PATH"
    echo "✅ Navegado para $PROJECT_PATH"
else
    echo "❌ Diretório $PROJECT_PATH não encontrado"
    exit 1
fi

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Não é um repositório Git"
    exit 1
fi

# Backup rápido
echo "📁 Criando backup..."
BACKUP_DIR="../backup_\$(date +%Y%m%d_%H%M%S)"
cp -r . "\$BACKUP_DIR"
echo "✅ Backup criado: \$BACKUP_DIR"

# Pull das atualizações
echo "📥 Baixando atualizações..."
git fetch origin
git reset --hard origin/main
echo "✅ Código atualizado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production
echo "✅ Dependências instaladas"

# Configurar ambiente
echo "⚙️ Configurando ambiente..."
if [ -f "configuracao-ambiente.env" ]; then
    cp configuracao-ambiente.env .env.local
    echo "✅ .env.local atualizado"
    echo "⚠️ LEMBRE-SE: Editar .env.local com credenciais reais"
fi

# Build
echo "🔨 Fazendo build..."
npm run build
echo "✅ Build concluído"

# Reiniciar serviços
echo "🔄 Reiniciando serviços..."

# Nginx
if systemctl is-active --quiet nginx; then
    sudo systemctl restart nginx
    echo "✅ Nginx reiniciado"
fi

# PM2
if command -v pm2 > /dev/null; then
    pm2 restart all
    echo "✅ PM2 reiniciado"
fi

# Docker (se aplicável)
if [ -f "docker-compose.yml" ]; then
    docker-compose restart
    echo "✅ Docker reiniciado"
fi

# Verificação final
echo "🧪 Testando servidor..."
sleep 3
if curl -f -s http://localhost:8080 > /dev/null; then
    echo "✅ Servidor funcionando"
else
    echo "⚠️ Servidor pode não estar funcionando"
fi

echo ""
echo "🎉 UPDATE CONCLUÍDO NO SERVIDOR!"
echo "================================"
echo "🌐 Acesse: http://$SERVER_IP:8080"
echo ""
echo "📋 Próximos passos:"
echo "1. Editar .env.local com credenciais reais"
echo "2. Executar fix-upload-function.sql no Supabase"
echo "3. Testar upload de vídeos"
echo ""
echo "📁 Backup: \$BACKUP_DIR"

EOF

# Verificar se o comando remoto foi executado com sucesso
if [ $? -eq 0 ]; then
    echo ""
    log_success "Update remoto concluído com sucesso!"
    echo ""
    log_info "🌐 Teste agora: http://$SERVER_IP:8080"
    echo ""
    log_warning "📝 Não esqueça de:"
    echo "   1. Editar .env.local no servidor com suas credenciais"
    echo "   2. Executar o SQL fix-upload-function.sql no Supabase"
    echo ""
    
    # Teste final de conectividade
    log_info "Testando acesso externo..."
    if curl -I "http://$SERVER_IP:8080" 2>/dev/null | head -n 1 | grep -q "200\|301\|302"; then
        log_success "✅ Servidor acessível externamente!"
    else
        log_warning "⚠️ Servidor pode não estar acessível externamente"
        log_info "Verifique firewall e configurações de rede"
    fi
    
else
    log_error "Erro durante o update remoto"
    exit 1
fi

echo ""
echo "🚀 Update remoto finalizado!"
echo "Acesse: http://$SERVER_IP:8080"
