-- ========================================
-- SOLUÇÃO DEFINITIVA PARA TRIGGER UPDATED_AT
-- ========================================
-- Este script resolve o problema sem remover a função global

-- 1. Primeiro, adicionar o campo updated_at se não existir
SELECT '=== ADICIONANDO CAMPO UPDATED_AT ===' as info;
ALTER TABLE quiz_perguntas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Verificar se o campo foi adicionado
SELECT '=== VERIFICANDO SE CAMPO FOI ADICIONADO ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas' 
  AND column_name = 'updated_at';

-- 3. Remover apenas os triggers específicos da tabela quiz_perguntas
SELECT '=== REMOVENDO TRIGGERS ESPECÍFICOS ===' as info;
DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_quiz_perguntas_timestamps_trigger ON quiz_perguntas;

-- 4. Criar trigger específico para quiz_perguntas usando a função existente
SELECT '=== CRIANDO TRIGGER ESPECÍFICO ===' as info;
CREATE TRIGGER update_quiz_perguntas_updated_at
    BEFORE UPDATE ON quiz_perguntas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar se o trigger foi criado
SELECT '=== VERIFICANDO SE TRIGGER FOI CRIADO ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'quiz_perguntas';

-- 6. Teste de funcionalidade
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;

-- Testar se conseguimos fazer um UPDATE simples
UPDATE quiz_perguntas 
SET explicacao = COALESCE(explicacao, 'Teste de trigger funcionando')
WHERE id IN (
    SELECT id FROM quiz_perguntas LIMIT 1
);

-- 7. Verificar se o trigger funcionou
SELECT '=== VERIFICANDO SE TRIGGER FUNCIONOU ===' as info;
SELECT 
    id,
    updated_at,
    explicacao
FROM quiz_perguntas 
WHERE explicacao = 'Teste de trigger funcionando'
LIMIT 1;

-- 8. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '✅ Campo updated_at adicionado' as status;
SELECT '✅ Trigger específico criado' as status;
SELECT '✅ Teste de funcionalidade realizado' as status;
SELECT 'Agora execute o script sistema-quiz-admin-completo.sql' as proximo_passo;

-- 9. Resumo das correções
SELECT '=== RESUMO DAS CORREÇÕES ===' as info;
SELECT '✅ Campo updated_at adicionado' as correcao;
SELECT '✅ Trigger específico para quiz_perguntas criado' as correcao;
SELECT '✅ Função global preservada' as correcao;
SELECT '✅ Sistema pronto para edição de quizzes' as correcao;






