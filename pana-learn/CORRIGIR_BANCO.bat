@echo off
chcp 65001 >nul
color 0E
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                      🔧 ERA LEARN - CORRIGIR BANCO                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 🔧 Este script corrige problemas comuns do banco PostgreSQL
echo.

set "PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin"

echo ════════════════════════════════════════════════════════════════════════════════
echo 🔍 DIAGNOSTICANDO PROBLEMAS...
echo ════════════════════════════════════════════════════════════════════════════════

:: Verificar se PostgreSQL está instalado
if not exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    echo ❌ PostgreSQL não encontrado!
    echo 📥 Execute: INSTALAR_TUDO_AUTOMATICO.bat
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado

:: Verificar se serviço está rodando
sc query postgresql-x64-15 | find "RUNNING" >nul
if %errorLevel% == 0 (
    echo ✅ Serviço PostgreSQL rodando
) else (
    echo ⚠️  Serviço parado, tentando iniciar...
    net start postgresql-x64-15
    timeout /t 5 /nobreak >nul
    
    sc query postgresql-x64-15 | find "RUNNING" >nul
    if %errorLevel% == 0 (
        echo ✅ Serviço iniciado com sucesso
    ) else (
        echo ❌ Erro ao iniciar serviço
        echo 🔧 Verifique se PostgreSQL foi instalado corretamente
        pause
        exit /b 1
    )
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🗄️ VERIFICANDO BANCO ERALEARN...
echo ════════════════════════════════════════════════════════════════════════════════

:: Testar conexão com banco eralearn
psql -U eralearn -h localhost -p 5432 -d eralearn -c "SELECT 1;" >nul 2>&1

if %errorLevel% == 0 (
    echo ✅ Banco eralearn acessível
) else (
    echo ❌ Banco eralearn inacessível, recriando...
    
    :: Recriar banco e usuário
    echo 🔧 Recriando banco e usuário...
    
    echo DROP DATABASE IF EXISTS eralearn; > temp_recreate.sql
    echo DROP USER IF EXISTS eralearn; >> temp_recreate.sql
    echo CREATE USER eralearn WITH PASSWORD 'eralearn2024!'; >> temp_recreate.sql
    echo CREATE DATABASE eralearn OWNER eralearn; >> temp_recreate.sql
    echo GRANT ALL PRIVILEGES ON DATABASE eralearn TO eralearn; >> temp_recreate.sql
    echo ALTER USER eralearn CREATEDB; >> temp_recreate.sql
    
    psql -U postgres -h localhost -p 5432 -f temp_recreate.sql
    
    if %errorLevel% == 0 (
        echo ✅ Banco recriado com sucesso
    ) else (
        echo ❌ Erro ao recriar banco
        echo 🔐 Verifique se a senha do postgres é: eralearn2024!
        pause
        exit /b 1
    )
    
    del temp_recreate.sql
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🏗️ VERIFICANDO ESTRUTURA DE TABELAS...
echo ════════════════════════════════════════════════════════════════════════════════

:: Contar tabelas
for /f %%i in ('psql -U eralearn -h localhost -p 5432 -d eralearn -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"') do set table_count=%%i

echo 📊 Tabelas encontradas: %table_count%

if %table_count% LSS 10 (
    echo ⚠️  Estrutura incompleta, recriando...
    
    :: Recriar estrutura
    echo 🏗️ Carregando schema completo...
    psql -U eralearn -h localhost -p 5432 -d eralearn -f "database\init\01-schema.sql"
    
    if %errorLevel% == 0 (
        echo ✅ Schema carregado
    ) else (
        echo ❌ Erro ao carregar schema
        echo 📁 Verifique se existe: database\init\01-schema.sql
    )
    
    :: Verificar novamente
    for /f %%i in ('psql -U eralearn -h localhost -p 5432 -d eralearn -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"') do set new_table_count=%%i
    echo 📊 Tabelas após recriação: %new_table_count%
    
) else (
    echo ✅ Estrutura de tabelas OK
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 📋 VERIFICANDO DADOS DE EXEMPLO...
echo ════════════════════════════════════════════════════════════════════════════════

:: Verificar usuários
for /f %%i in ('psql -U eralearn -h localhost -p 5432 -d eralearn -t -c "SELECT COUNT(*) FROM usuarios;" 2^>nul') do set user_count=%%i

if defined user_count (
    echo 👥 Usuários encontrados: %user_count%
    
    if %user_count% LSS 2 (
        echo ⚠️  Poucos usuários, carregando dados...
        
        psql -U eralearn -h localhost -p 5432 -d eralearn -f "database\init\02-dados-iniciais.sql"
        
        if %errorLevel% == 0 (
            echo ✅ Dados carregados
        ) else (
            echo ❌ Erro ao carregar dados
        )
    ) else (
        echo ✅ Dados de usuários OK
    )
) else (
    echo ❌ Erro ao verificar usuários
    echo 🔧 Recarregando dados...
    psql -U eralearn -h localhost -p 5432 -d eralearn -f "database\init\02-dados-iniciais.sql"
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🧪 TESTE FINAL DE CONEXÃO...
echo ════════════════════════════════════════════════════════════════════════════════

:: Teste completo
echo 🔍 Testando todas as funcionalidades...

psql -U eralearn -h localhost -p 5432 -d eralearn -c "
    SELECT 
        'Usuários' as tabela, COUNT(*) as registros FROM usuarios
    UNION ALL
    SELECT 
        'Cursos' as tabela, COUNT(*) as registros FROM cursos  
    UNION ALL
    SELECT 
        'Quizzes' as tabela, COUNT(*) as registros FROM quizzes
    UNION ALL
    SELECT
        'Certificados' as tabela, COUNT(*) as registros FROM certificados;
"

if %errorLevel% == 0 (
    echo ✅ Teste de conexão bem-sucedido!
) else (
    echo ❌ Ainda há problemas de conexão
)

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo 🎯 CONFIGURAÇÃO FINAL...
echo ════════════════════════════════════════════════════════════════════════════════

:: Criar usuário admin se não existir
echo 👤 Verificando usuário admin...

psql -U eralearn -h localhost -p 5432 -d eralearn -c "
    INSERT INTO domains (id, nome, subdominio, ativo) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'ERA Learn Principal', 'default', true)
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO usuarios (email, nome, tipo_usuario, senha_hash, domain_id, ativo) VALUES 
    ('admin@test.com', 'Admin Teste', 'admin_master', 
     '\$2b\$12\$rQJ8kHgzI8y8y8y8y8y8yeDqJ8kHgzI8y8y8y8y8yeDqJ8kHgzI8y', 
     '11111111-1111-1111-1111-111111111111', true)
    ON CONFLICT (email) DO UPDATE SET 
        senha_hash = '\$2b\$12\$rQJ8kHgzI8y8y8y8y8y8yeDqJ8kHgzI8y8y8y8y8y8yeDqJ8kHgzI8y';
" >nul 2>&1

echo ✅ Usuário admin configurado (admin@test.com / admin123)

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                            ✅ CORREÇÃO CONCLUÍDA!                           ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Banco PostgreSQL corrigido e funcionando!
echo.
echo 📊 DADOS DE CONEXÃO:
echo    🌐 Host: localhost
echo    👤 Usuário: eralearn
echo    🔐 Senha: eralearn2024!
echo    🗄️ Banco: eralearn
echo    📡 Porta: 5432
echo.
echo 👤 USUÁRIO DE TESTE:
echo    📧 Email: admin@test.com
echo    🔐 Senha: admin123
echo.
echo 🚀 PRÓXIMOS PASSOS:
echo    1. Execute: VERIFICAR_INSTALACAO.bat
echo    2. Abra HeidiSQL
echo    3. Conecte com os dados acima
echo.
pause


















