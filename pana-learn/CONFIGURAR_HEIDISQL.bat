@echo off
chcp 65001 >nul
color 0D
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                     🔗 ERA LEARN - CONFIGURAR HEIDISQL                      ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 🔗 Configurando conexão automática no HeidiSQL...
echo.

:: Verificar se HeidiSQL está instalado
if not exist "C:\Program Files\HeidiSQL\heidisql.exe" (
    echo ❌ HeidiSQL não encontrado!
    echo.
    echo 📥 Baixando e instalando HeidiSQL...
    
    :: Criar pasta downloads se não existir
    if not exist "downloads" mkdir downloads
    
    :: Baixar HeidiSQL
    echo 🔽 Baixando HeidiSQL...
    powershell -Command "& {try { Invoke-WebRequest -Uri 'https://www.heidisql.com/installers/HeidiSQL_12.5.0.6677_Setup.exe' -OutFile 'downloads\heidisql-installer.exe' -ErrorAction Stop; Write-Host 'Download concluído' } catch { Write-Host 'Erro no download' }}"
    
    if exist "downloads\heidisql-installer.exe" (
        echo ✅ Download concluído
        echo 📦 Instalando HeidiSQL...
        
        downloads\heidisql-installer.exe /SILENT /NORESTART
        
        echo ⏳ Aguardando instalação...
        timeout /t 20 /nobreak >nul
        
        if exist "C:\Program Files\HeidiSQL\heidisql.exe" (
            echo ✅ HeidiSQL instalado com sucesso!
        ) else (
            echo ❌ Erro na instalação automática
            echo 🌐 Instale manualmente: https://www.heidisql.com/download.php
            pause
            exit /b 1
        )
    ) else (
        echo ❌ Erro no download
        echo 🌐 Baixe manualmente: https://www.heidisql.com/download.php
        pause
        exit /b 1
    )
)

echo ✅ HeidiSQL encontrado

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo ⚙️ CRIANDO CONFIGURAÇÃO DE CONEXÃO...
echo ════════════════════════════════════════════════════════════════════════════════

:: Criar diretório de configuração se não existir
if not exist "%APPDATA%\HeidiSQL" mkdir "%APPDATA%\HeidiSQL"

:: Verificar se PostgreSQL está rodando
sc query postgresql-x64-15 | find "RUNNING" >nul
if %errorLevel% == 0 (
    echo ✅ PostgreSQL está rodando
) else (
    echo ⚠️  PostgreSQL não está rodando, tentando iniciar...
    net start postgresql-x64-15
    timeout /t 5 /nobreak >nul
)

:: Testar conexão
set "PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin"
psql -U eralearn -h localhost -p 5432 -d eralearn -c "SELECT 1;" >nul 2>&1

if %errorLevel% == 0 (
    echo ✅ Conexão com banco funcionando
) else (
    echo ❌ Problema na conexão
    echo 🔧 Execute: CORRIGIR_BANCO.bat
    pause
    exit /b 1
)

echo.
echo 📝 Criando arquivo de configuração...

:: Backup configuração existente
if exist "%APPDATA%\HeidiSQL\portable_settings.txt" (
    copy "%APPDATA%\HeidiSQL\portable_settings.txt" "%APPDATA%\HeidiSQL\portable_settings_backup.txt" >nul
    echo 💾 Backup da configuração existente criado
)

:: Criar nova configuração
(
echo # Configuração HeidiSQL para ERA Learn
echo # Criado automaticamente
echo.
echo [Servers\ERA_Learn_Local]
echo Host=localhost
echo User=eralearn
echo Password=eralearn2024!
echo Port=5432
echo Databases=eralearn
echo NetType=9
echo Compressed=0
echo SSL=0
echo StartupScriptFilename=
echo TreeBackground=536870912
echo IsFolder=0
echo ServerVersion=150000
echo SessionColor=8421631
echo RefererTable=
echo Comment=ERA Learn - Banco Local PostgreSQL
echo ConnectInitially=1
echo LoginPrompt=0
echo WindowsAuth=0
echo CleartextPluginEnabled=0
echo QueryTimeout=30
echo KeepAlive=0
echo FullTableStatus=1
echo LocalTimeZone=1
echo.
echo [Servers\ERA_Learn_Local\Environment]
echo.
echo [Servers\ERA_Learn_Local\Favorites]
echo.
) > "%APPDATA%\HeidiSQL\portable_settings.txt"

echo ✅ Configuração criada

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🧪 TESTANDO CONFIGURAÇÃO...
echo ════════════════════════════════════════════════════════════════════════════════

echo 🔍 Verificando se configuração está acessível...

if exist "%APPDATA%\HeidiSQL\portable_settings.txt" (
    echo ✅ Arquivo de configuração criado
    
    :: Verificar conteúdo
    find "ERA_Learn_Local" "%APPDATA%\HeidiSQL\portable_settings.txt" >nul
    if %errorLevel% == 0 (
        echo ✅ Configuração ERA_Learn_Local encontrada
    ) else (
        echo ❌ Erro na configuração
    )
) else (
    echo ❌ Erro ao criar arquivo de configuração
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🎨 CRIANDO ATALHOS...
echo ════════════════════════════════════════════════════════════════════════════════

:: Criar atalho na área de trabalho
echo 🖥️ Criando atalho na área de trabalho...

powershell -Command "& {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\HeidiSQL - ERA Learn.lnk')
    $Shortcut.TargetPath = 'C:\Program Files\HeidiSQL\heidisql.exe'
    $Shortcut.Arguments = '-d=eralearn -h=localhost -u=eralearn -p=5432'
    $Shortcut.Description = 'HeidiSQL conectado ao banco ERA Learn'
    $Shortcut.IconLocation = 'C:\Program Files\HeidiSQL\heidisql.exe,0'
    $Shortcut.Save()
}"

if exist "%USERPROFILE%\Desktop\HeidiSQL - ERA Learn.lnk" (
    echo ✅ Atalho criado na área de trabalho
) else (
    echo ⚠️  Erro ao criar atalho (normal em alguns sistemas)
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 📊 VERIFICANDO DADOS DO BANCO...
echo ════════════════════════════════════════════════════════════════════════════════

echo 🔍 Verificando tabelas e dados...

psql -U eralearn -h localhost -p 5432 -d eralearn -c "
    SELECT 
        '📋 Tabelas' as info, 
        COUNT(*)::text as valor 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    
    UNION ALL
    
    SELECT 
        '👥 Usuários' as info, 
        COUNT(*)::text as valor 
    FROM usuarios
    
    UNION ALL
    
    SELECT 
        '📚 Cursos' as info, 
        COUNT(*)::text as valor 
    FROM cursos
    
    UNION ALL
    
    SELECT 
        '📝 Quizzes' as info, 
        COUNT(*)::text as valor 
    FROM quizzes;
"

if %errorLevel% == 0 (
    echo ✅ Dados verificados com sucesso
) else (
    echo ⚠️  Possível problema nos dados
)

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        🎉 CONFIGURAÇÃO CONCLUÍDA!                           ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo ✅ HeidiSQL configurado com sucesso!
echo ✅ Conexão 'ERA_Learn_Local' criada
echo ✅ Atalho na área de trabalho criado
echo.
echo 📊 DADOS DE CONEXÃO:
echo    🔗 Nome: ERA_Learn_Local
echo    🌐 Host: localhost
echo    👤 Usuário: eralearn
echo    🔐 Senha: eralearn2024!
echo    🗄️ Database: eralearn
echo    📡 Porta: 5432
echo.
echo 🚀 COMO USAR:
echo    1. Abra HeidiSQL (ícone na área de trabalho)
echo    2. Clique duas vezes em 'ERA_Learn_Local'
echo    3. Navegue pelas tabelas à esquerda
echo    4. Explore os dados da ERA Learn!
echo.
echo 📋 TABELAS PRINCIPAIS:
echo    👥 usuarios - Usuários do sistema
echo    📚 cursos - Cursos disponíveis
echo    📝 quizzes - Avaliações
echo    🏆 certificados - Certificados emitidos
echo    🎨 branding_config - Configurações visuais
echo.
echo ⚡ Abrir HeidiSQL agora? (S/N)
set /p choice="Sua escolha: "

if /i "%choice%"=="S" (
    echo 🚀 Abrindo HeidiSQL...
    start "" "C:\Program Files\HeidiSQL\heidisql.exe"
    echo.
    echo 🎯 Clique duas vezes em 'ERA_Learn_Local' para conectar!
)

echo.
echo 📞 Se tiver problemas:
echo    🔧 Execute: VERIFICAR_INSTALACAO.bat
echo    🔧 Execute: CORRIGIR_BANCO.bat
echo.
pause



















