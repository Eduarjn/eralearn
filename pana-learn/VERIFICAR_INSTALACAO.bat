@echo off
chcp 65001 >nul
color 0B
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                     🔍 ERA LEARN - VERIFICAR INSTALAÇÃO                     ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Verificando componentes instalados...
echo.

:: Verificar PostgreSQL
echo ════════════════════════════════════════════════════════════════════════════════
echo 🗄️ POSTGRESQL
echo ════════════════════════════════════════════════════════════════════════════════

if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    echo ✅ PostgreSQL está instalado
    
    :: Verificar serviço
    sc query postgresql-x64-15 | find "RUNNING" >nul
    if %errorLevel% == 0 (
        echo ✅ Serviço PostgreSQL está rodando
        
        :: Testar conexão
        "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -c "SELECT version();" >nul 2>&1
        
        if %errorLevel% == 0 (
            echo ✅ Conexão com banco eralearn funcionando
            
            :: Verificar tabelas
            for /f %%i in ('"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"') do set table_count=%%i
            
            echo ✅ Tabelas encontradas: %table_count%
            
            if %table_count% GEQ 10 (
                echo ✅ Estrutura completa do banco carregada
            ) else (
                echo ⚠️  Estrutura incompleta - execute novamente o instalador
            )
            
        ) else (
            echo ❌ Erro na conexão com banco eralearn
            echo 🔧 Execute: CORRIGIR_BANCO.bat
        )
        
    ) else (
        echo ❌ Serviço PostgreSQL não está rodando
        echo 🔄 Tentando iniciar...
        net start postgresql-x64-15
    )
    
) else (
    echo ❌ PostgreSQL não encontrado
    echo 🔧 Execute: INSTALAR_TUDO_AUTOMATICO.bat
)

echo.

:: Verificar HeidiSQL
echo ════════════════════════════════════════════════════════════════════════════════
echo 🔗 HEIDISQL
echo ════════════════════════════════════════════════════════════════════════════════

if exist "C:\Program Files\HeidiSQL\heidisql.exe" (
    echo ✅ HeidiSQL está instalado
    
    :: Verificar configuração
    if exist "%APPDATA%\HeidiSQL\portable_settings.txt" (
        echo ✅ Configuração de conexão encontrada
    ) else (
        echo ⚠️  Configuração não encontrada
        echo 🔧 Execute: CONFIGURAR_HEIDISQL.bat
    )
    
) else (
    echo ❌ HeidiSQL não encontrado
    echo 🔧 Execute: INSTALAR_TUDO_AUTOMATICO.bat
)

echo.

:: Verificar dados de exemplo
echo ════════════════════════════════════════════════════════════════════════════════
echo 📊 DADOS DE EXEMPLO
echo ════════════════════════════════════════════════════════════════════════════════

if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    
    :: Contar usuários
    for /f %%i in ('"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -t -c "SELECT COUNT(*) FROM usuarios;" 2^>nul') do set user_count=%%i
    
    :: Contar cursos  
    for /f %%i in ('"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -t -c "SELECT COUNT(*) FROM cursos;" 2^>nul') do set course_count=%%i
    
    :: Contar quizzes
    for /f %%i in ('"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U eralearn -h localhost -p 5432 -d eralearn -t -c "SELECT COUNT(*) FROM quizzes;" 2^>nul') do set quiz_count=%%i
    
    if defined user_count (
        echo ✅ Usuários: %user_count%
        echo ✅ Cursos: %course_count%  
        echo ✅ Quizzes: %quiz_count%
        
        if %user_count% GEQ 3 (
            echo ✅ Dados de exemplo carregados corretamente
        ) else (
            echo ⚠️  Poucos dados - execute: CARREGAR_DADOS.bat
        )
    ) else (
        echo ❌ Erro ao verificar dados
    )
) else (
    echo ❌ PostgreSQL não disponível para verificação
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 📋 RESUMO
echo ════════════════════════════════════════════════════════════════════════════════

if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    if exist "C:\Program Files\HeidiSQL\heidisql.exe" (
        sc query postgresql-x64-15 | find "RUNNING" >nul
        if %errorLevel% == 0 (
            echo ✅ TUDO FUNCIONANDO PERFEITAMENTE!
            echo.
            echo 🚀 COMO USAR:
            echo    1. Abra HeidiSQL
            echo    2. Clique duas vezes em 'ERA_Learn_Local'  
            echo    3. Explore as tabelas da ERA Learn
            echo.
            echo 📊 DADOS DE CONEXÃO:
            echo    Host: localhost
            echo    User: eralearn
            echo    Pass: eralearn2024!
            echo    DB: eralearn
            echo    Port: 5432
            echo.
        ) else (
            echo ⚠️  PostgreSQL instalado mas não está rodando
        )
    ) else (
        echo ⚠️  PostgreSQL OK, mas HeidiSQL não instalado
    )
) else (
    echo ❌ PRECISA EXECUTAR O INSTALADOR AUTOMÁTICO
)

echo.
echo ⚡ Pressione qualquer tecla para continuar...
pause >nul

:: Oferecer abrir HeidiSQL se tudo estiver OK
if exist "C:\Program Files\HeidiSQL\heidisql.exe" (
    sc query postgresql-x64-15 | find "RUNNING" >nul
    if %errorLevel% == 0 (
        echo.
        echo 🔗 Abrir HeidiSQL agora? (S/N)
        set /p choice="Sua escolha: "
        
        if /i "%choice%"=="S" (
            start "" "C:\Program Files\HeidiSQL\heidisql.exe"
            echo ✅ HeidiSQL aberto!
        )
    )
)


















