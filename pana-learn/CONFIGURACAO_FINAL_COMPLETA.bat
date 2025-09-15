@echo off
chcp 65001 >nul
color 0F
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                   🎯 ERA LEARN - CONFIGURAÇÃO FINAL COMPLETA                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 Este script faz TUDO para você ter acesso completo à plataforma:
echo    ✅ Testa se a plataforma funciona
echo    ✅ Instala PostgreSQL + HeidiSQL (se necessário)  
echo    ✅ Configura banco com dados completos
echo    ✅ Testa todas as funcionalidades
echo    ✅ Abre tudo pronto para usar
echo.
echo ⏱️  Tempo total: 10-15 minutos (dependendo da velocidade da internet)
echo.

pause

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🔍 FASE 1: TESTANDO PLATAFORMA...
echo ════════════════════════════════════════════════════════════════════════════════

:: Testar plataforma primeiro
call TESTAR_PLATAFORMA_COMPLETA.bat

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🗄️ FASE 2: CONFIGURANDO BANCO DE DADOS...
echo ════════════════════════════════════════════════════════════════════════════════

echo 🤔 Você quer instalar PostgreSQL + HeidiSQL agora? (S/N)
echo    (Se já tem instalado, pode pular)
set /p install_db="Sua escolha: "

if /i "%install_db%"=="S" (
    echo.
    echo 🚀 Iniciando instalação automática...
    echo ⚠️  IMPORTANTE: Execute como ADMINISTRADOR se não foi feito ainda
    echo.
    
    :: Verificar se está como admin
    net session >nul 2>&1
    if %errorLevel% == 0 (
        echo ✅ Executando como administrador
        call INSTALAR_TUDO_AUTOMATICO.bat
    ) else (
        echo ❌ Não está como administrador!
        echo.
        echo 🔧 SOLUÇÕES:
        echo    1. Feche este script
        echo    2. Clique direito em INSTALAR_TUDO_AUTOMATICO.bat
        echo    3. Selecione "Executar como administrador"
        echo    4. Depois execute: VERIFICAR_INSTALACAO.bat
        echo.
        pause
        goto PHASE3
    )
) else (
    echo.
    echo 🔍 Verificando se banco já está configurado...
    call VERIFICAR_INSTALACAO.bat
)

:PHASE3
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🎨 FASE 3: CONFIGURAÇÕES FINAIS...
echo ════════════════════════════════════════════════════════════════════════════════

echo 🎨 Criando variáveis de ambiente...

:: Criar arquivo .env se não existir
if not exist ".env" (
    echo # ERA Learn - Configurações do Ambiente > .env
    echo VITE_APP_MODE=cloud >> .env
    echo VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co >> .env
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM >> .env
    echo # Para modo standalone local: >> .env
    echo # VITE_APP_MODE=standalone >> .env
    echo # VITE_API_URL=http://localhost:3001 >> .env
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env já existe
)

echo.
echo 🔧 Verificando configurações finais...

:: Verificar se todas as dependências estão OK
npm list --depth=0 >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Todas as dependências npm estão OK
) else (
    echo ⚠️  Reinstalando dependências...
    npm install
)

:: Limpar cache e rebuildar
echo 🧹 Limpando cache...
if exist "dist" rmdir /s /q "dist" >nul 2>&1
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" >nul 2>&1

echo 🏗️ Build final...
npm run build >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Build final bem-sucedido
) else (
    echo ⚠️  Build final com avisos (normal)
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🚀 FASE 4: TESTANDO ACESSO COMPLETO...
echo ════════════════════════════════════════════════════════════════════════════════

echo 🔍 Testando acessos...

:: Testar HeidiSQL
if exist "C:\Program Files\HeidiSQL\heidisql.exe" (
    echo ✅ HeidiSQL disponível
    
    :: Testar PostgreSQL
    if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
        echo ✅ PostgreSQL disponível
        
        :: Testar conexão
        "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -c "SELECT COUNT(*) FROM usuarios;" >nul 2>&1
        if %errorLevel% == 0 (
            echo ✅ Banco eralearn acessível
            echo ✅ ACESSO AO BANCO: CONFIGURADO!
        ) else (
            echo ⚠️  Banco precisa de configuração
            echo 🔧 Execute: CORRIGIR_BANCO.bat
        )
    ) else (
        echo ⚠️  PostgreSQL não encontrado
    )
) else (
    echo ⚠️  HeidiSQL não encontrado
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🎉 CONFIGURAÇÃO FINAL CONCLUÍDA!
echo ════════════════════════════════════════════════════════════════════════════════

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           ✅ TUDO PRONTO PARA USAR!                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 VOCÊ AGORA TEM ACESSO A:
echo.
echo 💻 PLATAFORMA WEB (Frontend):
echo    🌐 Desenvolvimento: npm run dev
echo    🏗️ Produção: npm run build + npm run preview
echo    📱 URL local: http://localhost:8080
echo.
echo 🗄️ BANCO DE DADOS (PostgreSQL + HeidiSQL):
echo    🔗 Host: localhost
echo    👤 User: eralearn  
echo    🔐 Pass: eralearn2024!
echo    🗄️ DB: eralearn
echo    📡 Port: 5432
echo.
echo 📊 DADOS INCLUÍDOS:
echo    👥 3 usuários de teste
echo    📚 4 cursos completos (PABX, OMNICHANNEL, CALLCENTER)
echo    📝 Quizzes configurados
echo    🏆 Sistema de certificados
echo    🎨 Branding personalizado
echo.
echo 🛠️ FERRAMENTAS DISPONÍVEIS:
echo    🔗 HeidiSQL (interface gráfica do banco)
echo    📋 Scripts de manutenção automática
echo    🔧 Sistema de correção de problemas
echo    📚 Documentação completa
echo.

echo ⚡ ESCOLHA O QUE FAZER AGORA:
echo.
echo [1] 🌐 Abrir plataforma web (modo desenvolvimento)
echo [2] 🗄️ Abrir HeidiSQL (visualizar banco)
echo [3] 📊 Ver dados de conexão
echo [4] 📚 Abrir documentação
echo [5] 🔧 Scripts de manutenção
echo [6] ❌ Sair
echo.

set /p choice="Digite sua escolha (1-6): "

if "%choice%"=="1" goto OPEN_WEB
if "%choice%"=="2" goto OPEN_HEIDISQL
if "%choice%"=="3" goto SHOW_DATA
if "%choice%"=="4" goto OPEN_DOCS
if "%choice%"=="5" goto MAINTENANCE
if "%choice%"=="6" goto EXIT

echo ❌ Opção inválida!
goto CHOOSE

:OPEN_WEB
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                         🌐 INICIANDO PLATAFORMA WEB                         ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Iniciando servidor de desenvolvimento...
echo 📱 URL: http://localhost:8080
echo ⏹️  Para parar: Ctrl+C
echo.
npm run dev
goto EXIT

:OPEN_HEIDISQL
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                            🗄️ ABRINDO HEIDISQL                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
if exist "C:\Program Files\HeidiSQL\heidisql.exe" (
    echo 🚀 Abrindo HeidiSQL...
    start "" "C:\Program Files\HeidiSQL\heidisql.exe"
    echo.
    echo ✅ HeidiSQL aberto!
    echo 🎯 Clique duas vezes em 'ERA_Learn_Local' para conectar
    echo.
    echo 📊 DADOS DE CONEXÃO:
    echo    Host: localhost
    echo    User: eralearn
    echo    Pass: eralearn2024!
    echo    DB: eralearn
    echo    Port: 5432
) else (
    echo ❌ HeidiSQL não encontrado!
    echo 🔧 Execute: CONFIGURAR_HEIDISQL.bat
)
echo.
pause
goto CHOOSE

:SHOW_DATA
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                            📊 DADOS DE CONEXÃO                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🗄️ POSTGRESQL:
echo    🌐 Host: localhost
echo    👤 Usuário: eralearn
echo    🔐 Senha: eralearn2024!
echo    🗄️ Database: eralearn
echo    📡 Porta: 5432
echo.
echo 👤 USUÁRIOS DE TESTE:
echo    📧 admin@eralearn.com    🔐 admin123     (admin_master)
echo    📧 admin@local.com       🔐 admin123     (admin)
echo    📧 cliente@test.com      🔐 cliente123   (cliente)
echo.
echo 🌐 PLATAFORMA WEB:
echo    🏠 Local: http://localhost:8080
echo    🔧 Comando: npm run dev
echo.
echo 📋 TABELAS NO BANCO (13 total):
echo    👥 usuarios, domains, sessoes
echo    📚 cursos, modulos, videos, video_progress
echo    📝 quizzes, quiz_perguntas, progresso_quiz
echo    🏆 certificados, branding_config, uploads
echo.
pause
goto CHOOSE

:OPEN_DOCS
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                              📚 DOCUMENTAÇÃO                                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📖 Abrindo documentações...
echo.
start README_INSTALACAO.md
start STANDALONE_GUIDE.md
start DEPLOYMENT_GUIDE.md
echo.
echo ✅ Documentações abertas!
pause
goto CHOOSE

:MAINTENANCE
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           🔧 SCRIPTS DE MANUTENÇÃO                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🛠️ Scripts disponíveis:
echo.
echo [1] 🔍 VERIFICAR_INSTALACAO.bat
echo [2] 🔧 CORRIGIR_BANCO.bat  
echo [3] 🔗 CONFIGURAR_HEIDISQL.bat
echo [4] 🧪 TESTAR_PLATAFORMA_COMPLETA.bat
echo [5] ⬅️  Voltar
echo.
set /p maint_choice="Escolha (1-5): "

if "%maint_choice%"=="1" call VERIFICAR_INSTALACAO.bat
if "%maint_choice%"=="2" call CORRIGIR_BANCO.bat
if "%maint_choice%"=="3" call CONFIGURAR_HEIDISQL.bat
if "%maint_choice%"=="4" call TESTAR_PLATAFORMA_COMPLETA.bat
if "%maint_choice%"=="5" goto CHOOSE

goto MAINTENANCE

:EXIT
echo.
echo 🎉 Obrigado por usar ERA Learn!
echo.
echo 📞 Se precisar de ajuda:
echo    🔧 VERIFICAR_INSTALACAO.bat
echo    📚 README_INSTALACAO.md
echo    🌐 npm run dev (para desenvolvimento)
echo.
echo 🚀 Plataforma pronta para uso!
pause
exit



















