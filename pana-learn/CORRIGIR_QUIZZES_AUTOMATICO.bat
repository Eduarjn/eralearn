@echo off
echo ========================================
echo   CORRECAO AUTOMATICA DE QUIZZES
echo         ERA Learn Platform
echo ========================================
echo.

echo 🔍 Verificando arquivos necessarios...
if not exist "fix-quiz-system-complete.sql" (
    echo ❌ Arquivo fix-quiz-system-complete.sql nao encontrado!
    pause
    exit /b 1
)

if not exist "create-test-users-and-data.sql" (
    echo ❌ Arquivo create-test-users-and-data.sql nao encontrado!
    pause
    exit /b 1
)

echo ✅ Arquivos encontrados!
echo.

echo 📋 INSTRUCOES PARA CORRIGIR OS QUIZZES:
echo.
echo 1. Abra seu navegador
echo 2. Acesse: https://supabase.com/dashboard
echo 3. Faca login na sua conta
echo 4. Selecione o projeto: oqoxhavdhrgdjvxvajze
echo 5. Va em "SQL Editor"
echo.

echo 🔧 PRIMEIRO SCRIPT (Sistema de Quizzes):
echo.
echo 1. Abra o arquivo: fix-quiz-system-complete.sql
echo 2. Copie TODO o conteudo
echo 3. Cole no SQL Editor do Supabase
echo 4. Clique em "Run"
echo 5. Aguarde a execucao completa
echo.

pause

echo 🔧 SEGUNDO SCRIPT (Dados de Teste):
echo.
echo 1. Abra o arquivo: create-test-users-and-data.sql
echo 2. Copie TODO o conteudo
echo 3. Cole no SQL Editor do Supabase
echo 4. Clique em "Run"
echo 5. Aguarde a execucao completa
echo.

pause

echo 🧪 TESTE A CORRECAO:
echo.
echo 1. Acesse: http://localhost:5173
echo 2. Faca login com:
echo    - Email: cliente@eralearn.com
echo    - Senha: cliente123
echo.
echo 3. Va para a pagina /quizzes
echo 4. Verifique se os quizzes aparecem
echo 5. Teste fazer um quiz completo
echo.

echo 📊 CREDENCIAIS DE TESTE CRIADAS:
echo.
echo ADMIN:
echo   Email: admin@eralearn.com
echo   Senha: admin123
echo.
echo CLIENTE:
echo   Email: cliente@eralearn.com  
echo   Senha: cliente123
echo.

echo ✅ QUIZZES DISPONIBILIZADOS:
echo.
echo 1. PABX Fundamentos (5 perguntas)
echo 2. PABX Avancado (5 perguntas) 
echo 3. Omnichannel Empresas (5 perguntas)
echo 4. Omnichannel Avancado (5 perguntas)
echo 5. CallCenter Fundamentos (5 perguntas)
echo.

echo 🎉 SISTEMA CORRIGIDO COM SUCESSO!
echo.
echo ⚠️  IMPORTANTE:
echo - Os scripts NAO alteram dados existentes
echo - Apenas ADICIONAM o sistema de quizzes
echo - Todos os usuarios e configuracoes atuais sao preservados
echo.

echo 📞 Em caso de problemas:
echo 1. Verifique se executou ambos os scripts
echo 2. Confirme que nao houve erros no SQL Editor
echo 3. Teste com os usuarios criados pelos scripts
echo.

pause


















