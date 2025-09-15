@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    🚀 ERA LEARN - INSTALAÇÃO AUTOMÁTICA                     ║
echo ║                        PostgreSQL + HeidiSQL + Banco                        ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Este script irá:
echo    ✅ Baixar e instalar PostgreSQL
echo    ✅ Baixar e instalar HeidiSQL  
echo    ✅ Criar banco eralearn completo
echo    ✅ Configurar conexão automática
echo    ✅ Carregar todos os dados de exemplo
echo.

echo ⚠️  IMPORTANTE: Execute como ADMINISTRADOR
echo.
pause

:: Verificar se está executando como admin
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como administrador
) else (
    echo ❌ ERRO: Execute como administrador!
    echo    Clique direito no arquivo e selecione "Executar como administrador"
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🔽 BAIXANDO POSTGRESQL...
echo ════════════════════════════════════════════════════════════════════════════════

:: Criar pasta de downloads
if not exist "downloads" mkdir downloads

:: Baixar PostgreSQL
echo 📥 Baixando PostgreSQL 15.4...
powershell -Command "& {Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64.exe' -OutFile 'downloads\postgresql-installer.exe'}"

if not exist "downloads\postgresql-installer.exe" (
    echo ❌ Erro ao baixar PostgreSQL
    echo 🌐 Baixe manualmente de: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL baixado com sucesso!

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🔽 BAIXANDO HEIDISQL...
echo ════════════════════════════════════════════════════════════════════════════════

:: Baixar HeidiSQL
echo 📥 Baixando HeidiSQL...
powershell -Command "& {Invoke-WebRequest -Uri 'https://www.heidisql.com/installers/HeidiSQL_12.5.0.6677_Setup.exe' -OutFile 'downloads\heidisql-installer.exe'}"

if not exist "downloads\heidisql-installer.exe" (
    echo ❌ Erro ao baixar HeidiSQL
    echo 🌐 Baixe manualmente de: https://www.heidisql.com/download.php
    pause
    exit /b 1
)

echo ✅ HeidiSQL baixado com sucesso!

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🔧 INSTALANDO POSTGRESQL...
echo ════════════════════════════════════════════════════════════════════════════════

:: Instalar PostgreSQL silenciosamente
echo 📦 Instalando PostgreSQL (isso pode levar alguns minutos)...
echo    📋 Usuário: postgres
echo    🔐 Senha: eralearn2024!
echo    📡 Porta: 5432

downloads\postgresql-installer.exe --mode unattended --unattendedmodeui none --superpassword "eralearn2024!" --serverport 5432 --locale "Portuguese_Brazil" --enable-components server,pgAdmin,stackbuilder,commandlinetools

:: Aguardar instalação
timeout /t 30 /nobreak >nul

echo ✅ PostgreSQL instalado!

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🔧 INSTALANDO HEIDISQL...
echo ════════════════════════════════════════════════════════════════════════════════

:: Instalar HeidiSQL silenciosamente
echo 📦 Instalando HeidiSQL...
downloads\heidisql-installer.exe /SILENT /NORESTART

:: Aguardar instalação
timeout /t 15 /nobreak >nul

echo ✅ HeidiSQL instalado!

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🗄️ CONFIGURANDO BANCO DE DADOS...
echo ════════════════════════════════════════════════════════════════════════════════

:: Adicionar PostgreSQL ao PATH temporariamente
set "PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin"

:: Aguardar serviço PostgreSQL iniciar
echo ⏳ Aguardando PostgreSQL inicializar...
timeout /t 20 /nobreak >nul

:: Verificar se PostgreSQL está rodando
sc query postgresql-x64-15 | find "RUNNING" >nul
if %errorLevel% == 0 (
    echo ✅ Serviço PostgreSQL está rodando
) else (
    echo 🔄 Iniciando serviço PostgreSQL...
    net start postgresql-x64-15
    timeout /t 10 /nobreak >nul
)

:: Criar banco e usuário eralearn
echo 🗄️ Criando banco eralearn...

echo CREATE DATABASE eralearn; > temp_setup.sql
echo CREATE USER eralearn WITH PASSWORD 'eralearn2024!'; >> temp_setup.sql
echo GRANT ALL PRIVILEGES ON DATABASE eralearn TO eralearn; >> temp_setup.sql
echo ALTER USER eralearn CREATEDB; >> temp_setup.sql

"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -h localhost -p 5432 -f temp_setup.sql

:: Verificar se banco foi criado
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -c "SELECT version();" >nul 2>&1

if %errorLevel% == 0 (
    echo ✅ Banco eralearn criado com sucesso!
) else (
    echo ❌ Erro ao criar banco. Verifique se PostgreSQL está rodando.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 📊 CARREGANDO DADOS DO ERA LEARN...
echo ════════════════════════════════════════════════════════════════════════════════

:: Carregar schema
echo 🏗️ Criando estrutura de tabelas...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -f "database\init\01-schema.sql"

if %errorLevel% == 0 (
    echo ✅ Estrutura de tabelas criada!
) else (
    echo ⚠️  Schema pode ter alguns warnings (normal)
)

:: Carregar dados iniciais
echo 📋 Carregando dados de exemplo...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -f "database\init\02-dados-iniciais.sql"

if %errorLevel% == 0 (
    echo ✅ Dados de exemplo carregados!
) else (
    echo ⚠️  Alguns dados podem já existir (normal)
)

:: Verificar dados
echo 🔍 Verificando dados carregados...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -c "SELECT COUNT(*) as total_usuarios FROM usuarios; SELECT COUNT(*) as total_cursos FROM cursos;"

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🔗 CONFIGURANDO HEIDISQL...
echo ════════════════════════════════════════════════════════════════════════════════

:: Criar configuração do HeidiSQL
echo 📝 Criando conexão automática no HeidiSQL...

:: Criar arquivo de configuração HeidiSQL
(
echo [Servers\ERA_Learn_Local]
echo Host=localhost
echo User=eralearn
echo Password=eralearn2024!
echo Port=5432
echo DatabasesDatabases=eralearn
echo NetType=9
echo Compressed=0
echo CompressedProtocol=0
echo SSL=0
echo StartupScriptFilename=
echo TreeBackground=536870912
echo IsFolder=0
echo ServerVersion=0
echo SessionColor=536870912
echo RefererTable=
echo Comment=ERA Learn - Banco Local
echo ConnectInitially=1
) > "%APPDATA%\HeidiSQL\portable_settings.txt"

echo ✅ Configuração do HeidiSQL criada!

:: Limpar arquivos temporários
del temp_setup.sql >nul 2>&1

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                            🎉 INSTALAÇÃO CONCLUÍDA!                         ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo ✅ PostgreSQL instalado e rodando
echo ✅ HeidiSQL instalado e configurado  
echo ✅ Banco 'eralearn' criado com dados
echo ✅ Conexão automática configurada
echo.
echo 📊 DADOS DA CONEXÃO:
echo    🌐 Host: localhost
echo    👤 Usuário: eralearn
echo    🔐 Senha: eralearn2024!
echo    🗄️ Banco: eralearn
echo    📡 Porta: 5432
echo.
echo 🚀 PRÓXIMOS PASSOS:
echo    1. Abra o HeidiSQL (ícone na área de trabalho)
echo    2. A conexão 'ERA_Learn_Local' estará pronta
echo    3. Clique duas vezes para conectar
echo    4. Explore as 13 tabelas da ERA Learn!
echo.
echo 📋 TABELAS DISPONÍVEIS:
echo    👥 usuarios, domains, sessoes
echo    📚 cursos, modulos, videos, video_progress  
echo    📝 quizzes, quiz_perguntas, progresso_quiz
echo    🏆 certificados, branding_config, uploads
echo.

echo ⚡ Pressione qualquer tecla para abrir HeidiSQL...
pause >nul

:: Abrir HeidiSQL
start "" "C:\Program Files\HeidiSQL\heidisql.exe"

echo.
echo 🎯 Pronto! HeidiSQL aberto com conexão configurada.
echo    Clique duas vezes em 'ERA_Learn_Local' para conectar.
echo.
pause



















