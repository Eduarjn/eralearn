@echo off
echo ========================================
echo    CORREÇÃO URGENTE DE VÍDEOS
echo ========================================
echo.

echo 1. Verificando se estamos no diretório correto...
if not exist "package.json" (
    echo ERRO: package.json não encontrado!
    echo Certifique-se de estar na pasta pana-learn
    pause
    exit /b 1
)

echo ✅ Diretório correto encontrado!
echo.

echo 2. Iniciando o frontend...
echo Execute este comando em outro terminal:
echo    npm run dev
echo.

echo 3. IMPORTANTE: Execute o script SQL no Supabase:
echo    - Abra: https://supabase.com/dashboard
echo    - Vá para SQL Editor
echo    - Cole o conteúdo de URGENT_FIX_VIDEOS.sql
echo    - Clique em Run
echo.

echo 4. Após executar o SQL, teste o sistema:
echo    - Acesse: http://localhost:8080
echo    - Vá para o curso PABX
echo    - Os vídeos devem carregar do YouTube
echo.

echo ========================================
echo    PRÓXIMOS PASSOS:
echo ========================================
echo 1. Execute: npm run dev
echo 2. Execute o SQL no Supabase
echo 3. Teste o sistema
echo ========================================
echo.

pause




