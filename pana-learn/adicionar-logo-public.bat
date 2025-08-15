@echo off
echo ========================================
echo ADICIONANDO LOGO ERA LEARN
echo ========================================

echo.
echo Verificando se o arquivo logotipoeralearn.png existe...
if exist "logotipoeralearn.png" (
    echo ✅ Arquivo encontrado!
    echo.
    echo Copiando para a pasta public...
    copy "logotipoeralearn.png" "public\logotipoeralearn.png"
    if %errorlevel% equ 0 (
        echo ✅ Logo copiado com sucesso!
        echo.
        echo Verificando se foi adicionado...
        if exist "public\logotipoeralearn.png" (
            echo ✅ Logo adicionado na pasta public!
            echo.
            echo Próximos passos:
            echo 1. Execute o script SQL: corrigir-implementacao-logo.sql
            echo 2. Recarregue a aplicação
            echo 3. Verifique se o logo aparece
        ) else (
            echo ❌ Erro ao adicionar o logo
        )
    ) else (
        echo ❌ Erro ao copiar o arquivo
    )
) else (
    echo ❌ Arquivo logotipoeralearn.png não encontrado!
    echo.
    echo Por favor:
    echo 1. Coloque o arquivo logotipoeralearn.png na raiz do projeto
    echo 2. Execute este script novamente
    echo.
    echo Dimensões recomendadas: 120px x 90px (PNG com transparência)
)

echo.
echo ========================================
pause 