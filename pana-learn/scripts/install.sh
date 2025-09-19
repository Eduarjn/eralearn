#!/bin/bash

# 🚀 Script de Instalação Automática - ERA Learn
# Este script automatiza a instalação do sistema ERA Learn

set -e  # Parar em caso de erro

echo "🚀 Iniciando instalação do ERA Learn..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
check_nodejs() {
    print_status "Verificando Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js encontrado: $NODE_VERSION"
        
        # Verificar se é versão 18+
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_error "Node.js versão 18+ é necessária. Versão atual: $NODE_VERSION"
            print_status "Por favor, atualize o Node.js em: https://nodejs.org/"
            exit 1
        fi
    else
        print_error "Node.js não encontrado!"
        print_status "Por favor, instale Node.js 18+ em: https://nodejs.org/"
        exit 1
    fi
}

# Verificar se npm está instalado
check_npm() {
    print_status "Verificando npm..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm encontrado: $NPM_VERSION"
    else
        print_error "npm não encontrado!"
        exit 1
    fi
}

# Verificar se Git está instalado
check_git() {
    print_status "Verificando Git..."
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git encontrado: $GIT_VERSION"
    else
        print_warning "Git não encontrado. Instale em: https://git-scm.com/"
    fi
}

# Instalar dependências
install_dependencies() {
    print_status "Instalando dependências..."
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependências instaladas com sucesso!"
    else
        print_error "package.json não encontrado!"
        exit 1
    fi
}

# Verificar arquivo .env.local
check_env_file() {
    print_status "Verificando arquivo de configuração..."
    if [ -f ".env.local" ]; then
        print_success "Arquivo .env.local encontrado!"
    else
        print_warning "Arquivo .env.local não encontrado!"
        print_status "Criando arquivo .env.local de exemplo..."
        
        cat > .env.local << EOF
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Configurações da aplicação
FEATURE_AI=false
VITE_VIDEO_UPLOAD_TARGET=supabase
VITE_VIDEO_MAX_UPLOAD_MB=1024
EOF
        
        print_warning "IMPORTANTE: Configure as credenciais do Supabase no arquivo .env.local"
        print_status "Edite o arquivo .env.local com suas credenciais reais do Supabase"
    fi
}

# Verificar se as credenciais do Supabase estão configuradas
check_supabase_config() {
    print_status "Verificando configuração do Supabase..."
    
    if [ -f ".env.local" ]; then
        if grep -q "https://seu-projeto.supabase.co" .env.local; then
            print_warning "Credenciais do Supabase não configuradas!"
            print_status "Por favor, edite o arquivo .env.local com suas credenciais reais"
            return 1
        else
            print_success "Credenciais do Supabase configuradas!"
            return 0
        fi
    else
        print_error "Arquivo .env.local não encontrado!"
        return 1
    fi
}

# Executar build
run_build() {
    print_status "Executando build da aplicação..."
    npm run build
    print_success "Build concluído com sucesso!"
}

# Testar aplicação
test_application() {
    print_status "Testando aplicação..."
    
    # Verificar se a pasta dist foi criada
    if [ -d "dist" ]; then
        print_success "Pasta dist criada com sucesso!"
        
        # Verificar se index.html existe
        if [ -f "dist/index.html" ]; then
            print_success "Arquivo index.html encontrado!"
        else
            print_error "Arquivo index.html não encontrado na pasta dist!"
            return 1
        fi
    else
        print_error "Pasta dist não foi criada!"
        return 1
    fi
}

# Função principal
main() {
    echo "=========================================="
    echo "🚀 ERA Learn - Instalação Automática"
    echo "=========================================="
    echo ""
    
    # Verificações iniciais
    check_nodejs
    check_npm
    check_git
    
    echo ""
    print_status "Todas as verificações iniciais passaram!"
    echo ""
    
    # Instalar dependências
    install_dependencies
    echo ""
    
    # Verificar configuração
    check_env_file
    echo ""
    
    # Verificar credenciais do Supabase
    if check_supabase_config; then
        print_status "Configuração do Supabase OK!"
    else
        print_warning "Configure as credenciais do Supabase antes de continuar"
        echo ""
        print_status "Para configurar:"
        print_status "1. Acesse https://supabase.com"
        print_status "2. Crie um novo projeto"
        print_status "3. Vá para Settings > API"
        print_status "4. Copie Project URL e anon key"
        print_status "5. Edite o arquivo .env.local"
        echo ""
        read -p "Pressione Enter quando tiver configurado as credenciais..."
    fi
    
    echo ""
    
    # Executar build
    run_build
    echo ""
    
    # Testar aplicação
    if test_application; then
        echo ""
        echo "=========================================="
        print_success "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
        echo "=========================================="
        echo ""
        print_status "Próximos passos:"
        print_status "1. Configure o Supabase (se ainda não fez)"
        print_status "2. Execute as migrations SQL no Supabase"
        print_status "3. Execute: npm run dev (para desenvolvimento)"
        print_status "4. Acesse: http://localhost:5173"
        echo ""
        print_status "Para produção:"
        print_status "1. Configure servidor web (Nginx/Apache)"
        print_status "2. Copie pasta dist para servidor"
        print_status "3. Configure DNS e SSL"
        echo ""
    else
        print_error "Instalação falhou durante os testes!"
        exit 1
    fi
}

# Executar função principal
main "$@"














