#!/bin/bash
# Script para atualizar ERA Learn no servidor em nuvem

echo "🚀 Atualizando ERA Learn no Servidor..."
echo "========================================"

# Configurações (AJUSTE CONFORME SEU SERVIDOR)
PROJECT_DIR="/var/www/eralearn"
BACKUP_PREFIX="../backup"
SERVICE_NAME="eralearn"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute este script no diretório do projeto."
    log_info "Tentando navegar para $PROJECT_DIR..."
    
    if [ -d "$PROJECT_DIR" ]; then
        cd "$PROJECT_DIR"
        log_success "Navegado para $PROJECT_DIR"
    else
        log_error "Diretório $PROJECT_DIR não encontrado"
        log_info "Ajuste a variável PROJECT_DIR no script ou execute no diretório correto"
        exit 1
    fi
fi

# Mostrar informações do sistema
log_info "Informações do servidor:"
echo "  - Diretório atual: $(pwd)"
echo "  - Usuário: $(whoami)"
echo "  - Data: $(date)"
echo ""

# 1. Criar backup
log_info "Criando backup do projeto atual..."
BACKUP_DIR="${BACKUP_PREFIX}_$(date +%Y%m%d_%H%M%S)"
cp -r . "$BACKUP_DIR"
if [ $? -eq 0 ]; then
    log_success "Backup criado em: $BACKUP_DIR"
else
    log_error "Falha ao criar backup"
    exit 1
fi

# 2. Verificar status do Git
log_info "Verificando status do Git..."
if [ ! -d ".git" ]; then
    log_error "Este não é um repositório Git"
    exit 1
fi

# Mostrar status atual
git status --porcelain
if [ $? -ne 0 ]; then
    log_error "Erro ao verificar status do Git"
    exit 1
fi

# 3. Fazer pull das atualizações
log_info "Baixando atualizações do GitHub..."
git fetch origin
if [ $? -ne 0 ]; then
    log_error "Erro ao fazer fetch do repositório"
    exit 1
fi

# Verificar se há atualizações
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    log_info "Projeto já está atualizado"
else
    log_info "Aplicando atualizações..."
    git reset --hard origin/main
    if [ $? -eq 0 ]; then
        log_success "Código atualizado com sucesso"
    else
        log_error "Erro ao atualizar código"
        exit 1
    fi
fi

# 4. Verificar e instalar dependências
log_info "Verificando dependências..."
if [ -f "package.json" ]; then
    log_info "Instalando/atualizando dependências..."
    npm install
    if [ $? -eq 0 ]; then
        log_success "Dependências instaladas"
    else
        log_error "Erro ao instalar dependências"
        exit 1
    fi
else
    log_warning "package.json não encontrado, pulando instalação de dependências"
fi

# 5. Configurar ambiente
log_info "Configurando ambiente..."
if [ -f "configuracao-ambiente.env" ]; then
    if [ ! -f ".env.local" ] || [ "configuracao-ambiente.env" -nt ".env.local" ]; then
        cp configuracao-ambiente.env .env.local
        log_success "Arquivo .env.local criado/atualizado"
        log_warning "IMPORTANTE: Verifique se as credenciais em .env.local estão corretas"
    else
        log_info ".env.local já existe e está atualizado"
    fi
else
    log_warning "Arquivo configuracao-ambiente.env não encontrado"
fi

# 6. Build do projeto
log_info "Fazendo build do projeto..."
if npm run build; then
    log_success "Build concluído com sucesso"
else
    log_error "Erro no build do projeto"
    log_info "Tentando limpar cache e rebuildar..."
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
    if npm run build; then
        log_success "Build concluído após limpeza"
    else
        log_error "Build falhou mesmo após limpeza"
        exit 1
    fi
fi

# 7. Reiniciar serviços
log_info "Reiniciando serviços..."

# Nginx
if systemctl is-active --quiet nginx; then
    log_info "Reiniciando Nginx..."
    if sudo systemctl restart nginx; then
        log_success "Nginx reiniciado"
    else
        log_error "Erro ao reiniciar Nginx"
    fi
else
    log_warning "Nginx não está rodando"
fi

# PM2
if command -v pm2 > /dev/null; then
    log_info "Reiniciando PM2..."
    if pm2 restart all; then
        log_success "PM2 reiniciado"
    else
        log_warning "Erro ao reiniciar PM2"
    fi
else
    log_info "PM2 não encontrado, pulando..."
fi

# Systemd service
if systemctl is-active --quiet "$SERVICE_NAME"; then
    log_info "Reiniciando serviço $SERVICE_NAME..."
    if sudo systemctl restart "$SERVICE_NAME"; then
        log_success "Serviço $SERVICE_NAME reiniciado"
    else
        log_warning "Erro ao reiniciar serviço $SERVICE_NAME"
    fi
fi

# Docker (se aplicável)
if [ -f "docker-compose.yml" ]; then
    log_info "Reiniciando containers Docker..."
    if docker-compose restart; then
        log_success "Containers Docker reiniciados"
    else
        log_warning "Erro ao reiniciar containers Docker"
    fi
fi

# 8. Verificações pós-update
log_info "Executando verificações pós-update..."

# Verificar se o servidor está respondendo
sleep 3
if curl -f -s http://localhost:8080 > /dev/null; then
    log_success "Servidor local respondendo na porta 8080"
else
    log_warning "Servidor local não está respondendo na porta 8080"
fi

# Verificar arquivos importantes
if [ -f ".env.local" ]; then
    log_success ".env.local existe"
else
    log_warning ".env.local não encontrado"
fi

if [ -f "fix-upload-function.sql" ]; then
    log_success "Script SQL de correção disponível"
else
    log_warning "Script SQL não encontrado"
fi

# 9. Informações finais
echo ""
echo "🎉 UPDATE CONCLUÍDO!"
echo "==================="
log_success "Projeto atualizado com sucesso"
echo ""
echo "📋 Próximos passos:"
echo "1. ✅ Verifique as credenciais em .env.local"
echo "2. 🗄️ Execute fix-upload-function.sql no Supabase"
echo "3. 🧪 Teste o upload de vídeos"
echo ""
echo "🌐 URLs de acesso:"
echo "  - IP: http://138.59.144.162:8080"
echo "  - Local: http://localhost:8080"
echo ""
echo "📁 Backup criado em: $BACKUP_DIR"
echo ""
echo "🔍 Para verificar logs:"
echo "  - Nginx: sudo tail -f /var/log/nginx/error.log"
echo "  - PM2: pm2 logs"
echo ""

# Verificação final
log_info "Executando teste final..."
if curl -I http://localhost:8080 2>/dev/null | head -n 1 | grep -q "200\|301\|302"; then
    log_success "✅ Servidor está funcionando corretamente!"
else
    log_warning "⚠️ Servidor pode não estar funcionando. Verifique os logs."
fi

echo "🚀 Update finalizado! Acesse http://138.59.144.162:8080 para testar."
