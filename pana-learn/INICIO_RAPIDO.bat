@echo off
chcp 65001 >nul
color 0F
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        🚀 ERA LEARN - INÍCIO RÁPIDO                         ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 Bem-vindo ao sistema ERA Learn!
echo    Este script oferece todas as opções em um só lugar.
echo.

:MENU
echo ════════════════════════════════════════════════════════════════════════════════
echo 📋 ESCOLHA UMA OPÇÃO:
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo 🔥 [1] INSTALAR TUDO (PostgreSQL + HeidiSQL + Dados)
echo 🔍 [2] VERIFICAR INSTALAÇÃO
echo 🔧 [3] CORRIGIR PROBLEMAS NO BANCO
echo 🔗 [4] CONFIGURAR HEIDISQL
echo 📊 [5] ABRIR HEIDISQL
echo 📋 [6] MOSTRAR DADOS DE CONEXÃO
echo 📚 [7] MOSTRAR DOCUMENTAÇÃO
echo ❌ [8] SAIR
echo.
echo ════════════════════════════════════════════════════════════════════════════════

set /p opcao="Digite sua escolha (1-8): "

if "%opcao%"=="1" goto INSTALAR
if "%opcao%"=="2" goto VERIFICAR
if "%opcao%"=="3" goto CORRIGIR
if "%opcao%"=="4" goto CONFIGURAR
if "%opcao%"=="5" goto ABRIR_HEIDISQL
if "%opcao%"=="6" goto MOSTRAR_DADOS
if "%opcao%"=="7" goto DOCUMENTACAO
if "%opcao%"=="8" goto SAIR

echo ❌ Opção inválida! Tente novamente.
echo.
goto MENU

:INSTALAR
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                          🔥 INSTALAÇÃO COMPLETA                             ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo ⚠️  IMPORTANTE: Este processo irá:
echo    ✅ Baixar e instalar PostgreSQL
echo    ✅ Baixar e instalar HeidiSQL
echo    ✅ Criar banco eralearn completo
echo    ✅ Configurar conexão automática
echo.
echo ⏱️  Tempo estimado: 5-10 minutos
echo.
echo 🔐 PRECISA executar como ADMINISTRADOR!
echo.
pause

:: Verificar se está como admin
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como administrador
    call INSTALAR_TUDO_AUTOMATICO.bat
) else (
    echo ❌ ERRO: Execute este arquivo como administrador!
    echo    Clique direito e selecione "Executar como administrador"
    pause
)

goto MENU_CONTINUAR

:VERIFICAR
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           🔍 VERIFICAR INSTALAÇÃO                           ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
call VERIFICAR_INSTALACAO.bat
goto MENU_CONTINUAR

:CORRIGIR
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           🔧 CORRIGIR PROBLEMAS                             ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
call CORRIGIR_BANCO.bat
goto MENU_CONTINUAR

:CONFIGURAR
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           🔗 CONFIGURAR HEIDISQL                            ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
call CONFIGURAR_HEIDISQL.bat
goto MENU_CONTINUAR

:ABRIR_HEIDISQL
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                              📊 ABRIR HEIDISQL                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

if exist "C:\Program Files\HeidiSQL\heidisql.exe" (
    echo 🚀 Abrindo HeidiSQL...
    start "" "C:\Program Files\HeidiSQL\heidisql.exe"
    echo.
    echo ✅ HeidiSQL aberto!
    echo 🎯 Clique duas vezes em 'ERA_Learn_Local' para conectar
    echo.
) else (
    echo ❌ HeidiSQL não encontrado!
    echo 📥 Execute a opção [1] para instalar
    echo.
)

pause
goto MENU

:MOSTRAR_DADOS
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           📊 DADOS DE CONEXÃO                               ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🔗 CONFIGURAÇÃO POSTGRESQL:
echo    🌐 Host: localhost
echo    👤 Usuário: eralearn
echo    🔐 Senha: eralearn2024!
echo    🗄️ Database: eralearn
echo    📡 Porta: 5432
echo.
echo 🔗 CONFIGURAÇÃO HEIDISQL:
echo    📝 Nome da Conexão: ERA_Learn_Local
echo    🎯 Clique duas vezes para conectar automaticamente
echo.
echo 👤 USUÁRIOS DE TESTE:
echo    📧 admin@eralearn.com   🔐 admin123     (admin_master)
echo    📧 admin@local.com      🔐 admin123     (admin)
echo    📧 cliente@test.com     🔐 cliente123   (cliente)
echo.
echo 📋 TABELAS PRINCIPAIS:
echo    👥 usuarios (usuários do sistema)
echo    📚 cursos (cursos disponíveis)
echo    📝 quizzes (avaliações)
echo    🏆 certificados (certificados emitidos)
echo    🎨 branding_config (configurações visuais)
echo.
pause
goto MENU

:DOCUMENTACAO
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                              📚 DOCUMENTAÇÃO                                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📖 ARQUIVOS DE DOCUMENTAÇÃO:
echo.
echo 🚀 README_INSTALACAO.md
echo    Guia completo de instalação e uso
echo.
echo 🏠 STANDALONE_GUIDE.md  
echo    Guia para modo standalone (100%% local)
echo.
echo 🚀 DEPLOYMENT_GUIDE.md
echo    Guia de deploy em produção
echo.
echo 📊 database\init\01-schema.sql
echo    Estrutura completa do banco de dados
echo.
echo 📋 database\init\02-dados-iniciais.sql
echo    Dados de exemplo e usuários de teste
echo.
echo 🔍 Abrir pasta de documentação? (S/N)
set /p choice="Sua escolha: "

if /i "%choice%"=="S" (
    start explorer.exe .
    echo ✅ Pasta aberta!
)

echo.
pause
goto MENU

:MENU_CONTINUAR
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo ⚡ Voltar ao menu principal? (S/N)
set /p choice="Sua escolha: "

if /i "%choice%"=="S" (
    cls
    goto MENU
) else (
    goto SAIR
)

:SAIR
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                              👋 ATÉ LOGO!                                   ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Obrigado por usar o ERA Learn!
echo.
echo 📞 Se precisar de ajuda:
echo    🔧 Execute VERIFICAR_INSTALACAO.bat
echo    📚 Leia README_INSTALACAO.md
echo.
echo 🚀 Para usar o sistema:
echo    1. Abra HeidiSQL
echo    2. Conecte em 'ERA_Learn_Local'
echo    3. Explore as tabelas!
echo.
pause
exit





























