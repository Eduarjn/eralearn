@echo off
echo ========================================
echo INSTALACAO POSTGRESQL PARA ERA LEARN
echo ========================================

echo.
echo 1. Baixando PostgreSQL...
echo Vá para: https://www.postgresql.org/download/windows/
echo Baixe e instale PostgreSQL 15

echo.
echo 2. Configurações durante instalação:
echo - Usuario: postgres
echo - Senha: eralearn2024!
echo - Porta: 5432
echo - Locale: Portuguese, Brazil

echo.
echo 3. Após instalação, execute este script SQL:

echo.
echo ========================================
echo SCRIPT SQL PARA EXECUTAR NO pgAdmin:
echo ========================================

echo.
echo -- Criar banco e usuario
echo CREATE DATABASE eralearn;
echo CREATE USER eralearn WITH PASSWORD 'eralearn2024!';
echo GRANT ALL PRIVILEGES ON DATABASE eralearn TO eralearn;
echo ALTER USER eralearn CREATEDB;

echo.
echo ========================================
echo DADOS PARA HEIDISQL:
echo ========================================
echo Hostname: localhost
echo Usuario: eralearn  
echo Senha: eralearn2024!
echo Database: eralearn
echo Porta: 5432
echo ========================================

pause


















