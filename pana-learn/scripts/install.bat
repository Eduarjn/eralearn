@echo off
REM 🚀 Script de Instalação Automática - ERA Learn (Windows)
REM Este script automatiza a instalação do sistema ERA Learn no Windows

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo 🚀 ERA Learn - Instalação Automática
echo ==========================================
echo.

REM Função para imprimir mensagens coloridas
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Verificar se Node.js está instalado
:check_nodejs
call :print_status "Verificando Node.js..."
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Node.js não encontrado!"
    call :print_status "Por favor, instale Node.js 18+ em: https://nodejs.org/"
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
call :print_success "Node.js encontrado: !NODE_VERSION!"

REM Verificar se é versão 18+
for /f "tokens=1 delims=." %%a in ("!NODE_VERSION:v=!") do set NODE_MAJOR=%%a
if !NODE_MAJOR! lss 18 (
    call :print_error "Node.js versão 18+ é necessária. Versão atual: !NODE_VERSION!"
    call :print_status "Por favor, atualize o Node.js em: https://nodejs.org/"
    pause
    exit /b 1
)
goto :eof

REM Verificar se npm está instalado
:check_npm
call :print_status "Verificando npm..."
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "npm não encontrado!"
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
call :print_success "npm encontrado: !NPM_VERSION!"
goto :eof

REM Verificar se Git está instalado
:check_git
call :print_status "Verificando Git..."
git --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_warning "Git não encontrado. Instale em: https://git-scm.com/"
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    call :print_success "Git encontrado: !GIT_VERSION!"
)
goto :eof

REM Instalar dependências
:install_dependencies
call :print_status "Instalando dependências..."
if not exist "package.json" (
    call :print_error "package.json não encontrado!"
    pause
    exit /b 1
)

npm install
if %errorlevel% neq 0 (
    call :print_error "Falha ao instalar dependências!"
    pause
    exit /b 1
)
call :print_success "Dependências instaladas com sucesso!"
goto :eof

REM Verificar arquivo .env.local
:check_env_file
call :print_status "Verificando arquivo de configuração..."
if exist ".env.local" (
    call :print_success "Arquivo .env.local encontrado!"
) else (
    call :print_warning "Arquivo .env.local não encontrado!"
    call :print_status "Criando arquivo .env.local de exemplo..."
    
    (
        echo # Configurações do Supabase
        echo VITE_SUPABASE_URL=https://seu-projeto.supabase.co
        echo VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
        echo.
        echo # Configurações da aplicação
        echo FEATURE_AI=false
        echo VITE_VIDEO_UPLOAD_TARGET=supabase
        echo VITE_VIDEO_MAX_UPLOAD_MB=1024
    ) > .env.local
    
    call :print_warning "IMPORTANTE: Configure as credenciais do Supabase no arquivo .env.local"
    call :print_status "Edite o arquivo .env.local com suas credenciais reais do Supabase"
)
goto :eof

REM Verificar se as credenciais do Supabase estão configuradas
:check_supabase_config
call :print_status "Verificando configuração do Supabase..."

if not exist ".env.local" (
    call :print_error "Arquivo .env.local não encontrado!"
    exit /b 1
)

findstr /C:"https://seu-projeto.supabase.co" .env.local >nul 2>&1
if %errorlevel% equ 0 (
    call :print_warning "Credenciais do Supabase não configuradas!"
    call :print_status "Por favor, edite o arquivo .env.local com suas credenciais reais"
    exit /b 1
) else (
    call :print_success "Credenciais do Supabase configuradas!"
    exit /b 0
)

REM Executar build
:run_build
call :print_status "Executando build da aplicação..."
npm run build
if %errorlevel% neq 0 (
    call :print_error "Falha no build da aplicação!"
    pause
    exit /b 1
)
call :print_success "Build concluído com sucesso!"
goto :eof

REM Testar aplicação
:test_application
call :print_status "Testando aplicação..."

if not exist "dist" (
    call :print_error "Pasta dist não foi criada!"
    exit /b 1
)
call :print_success "Pasta dist criada com sucesso!"

if not exist "dist\index.html" (
    call :print_error "Arquivo index.html não encontrado na pasta dist!"
    exit /b 1
)
call :print_success "Arquivo index.html encontrado!"
exit /b 0

REM Função principal
:main
echo.

REM Verificações iniciais
call :check_nodejs
call :check_npm
call :check_git

echo.
call :print_status "Todas as verificações iniciais passaram!"
echo.

REM Instalar dependências
call :install_dependencies
echo.

REM Verificar configuração
call :check_env_file
echo.

REM Verificar credenciais do Supabase
call :check_supabase_config
if %errorlevel% neq 0 (
    call :print_warning "Configure as credenciais do Supabase antes de continuar"
    echo.
    call :print_status "Para configurar:"
    call :print_status "1. Acesse https://supabase.com"
    call :print_status "2. Crie um novo projeto"
    call :print_status "3. Vá para Settings ^> API"
    call :print_status "4. Copie Project URL e anon key"
    call :print_status "5. Edite o arquivo .env.local"
    echo.
    pause
)

echo.

REM Executar build
call :run_build
echo.

REM Testar aplicação
call :test_application
if %errorlevel% neq 0 (
    call :print_error "Instalação falhou durante os testes!"
    pause
    exit /b 1
)

echo.
echo ==========================================
call :print_success "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo ==========================================
echo.
call :print_status "Próximos passos:"
call :print_status "1. Configure o Supabase (se ainda não fez)"
call :print_status "2. Execute as migrations SQL no Supabase"
call :print_status "3. Execute: npm run dev (para desenvolvimento)"
call :print_status "4. Acesse: http://localhost:5173"
echo.
call :print_status "Para produção:"
call :print_status "1. Configure servidor web (Nginx/Apache)"
call :print_status "2. Copie pasta dist para servidor"
call :print_status "3. Configure DNS e SSL"
echo.

pause
goto :eof

REM Executar função principal
call :main














