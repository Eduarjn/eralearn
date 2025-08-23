-- ========================================
-- CORRIGIR TRIGGER UPDATED_AT
-- ========================================
-- Este script resolve o erro do trigger que tenta acessar campo inexistente

-- 1. Verificar triggers existentes
SELECT '=== VERIFICANDO TRIGGERS EXISTENTES ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'quiz_perguntas';

-- 2. Verificar funções de trigger
SELECT '=== VERIFICANDO FUNÇÕES DE TRIGGER ===' as info;
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%updated_at%' 
   OR proname LIKE '%timestamp%';

-- 3. Remover triggers problemáticos
SELECT '=== REMOVENDO TRIGGERS PROBLEMÁTICOS ===' as info;

-- Remover todos os triggers da tabela quiz_perguntas
DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_quiz_perguntas_timestamps_trigger ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_updated_at_column ON quiz_perguntas;

-- 4. Remover funções problemáticas
SELECT '=== REMOVENDO FUNÇÕES PROBLEMÁTICAS ===' as info;

-- Remover funções que podem estar causando problemas
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_quiz_perguntas_timestamps();

-- 5. Verificar estrutura da tabela quiz_perguntas
SELECT '=== VERIFICANDO ESTRUTURA DA TABELA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas'
ORDER BY ordinal_position;

-- 6. Adicionar campos necessários se não existirem
SELECT '=== ADICIONANDO CAMPOS NECESSÁRIOS ===' as info;

-- Adicionar campo updated_at se não existir
ALTER TABLE quiz_perguntas 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Adicionar campo data_criacao se não existir
ALTER TABLE quiz_perguntas 
ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMPTZ DEFAULT NOW();

-- Adicionar campo data_atualizacao se não existir
ALTER TABLE quiz_perguntas 
ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMPTZ DEFAULT NOW();

-- 7. Verificar se os campos foram adicionados
SELECT '=== VERIFICANDO SE CAMPOS FORAM ADICIONADOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas'
  AND column_name IN ('updated_at', 'data_criacao', 'data_atualizacao')
ORDER BY column_name;

-- 8. Criar nova função de timestamp
SELECT '=== CRIANDO NOVA FUNÇÃO DE TIMESTAMP ===' as info;

CREATE OR REPLACE FUNCTION update_quiz_perguntas_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar novo trigger
SELECT '=== CRIANDO NOVO TRIGGER ===' as info;

CREATE TRIGGER update_quiz_perguntas_timestamps_trigger
    BEFORE UPDATE ON quiz_perguntas
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_perguntas_timestamps();

-- 10. Verificar se o trigger foi criado
SELECT '=== VERIFICANDO SE TRIGGER FOI CRIADO ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'quiz_perguntas';

-- 11. Teste de funcionalidade
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;

-- Testar se conseguimos fazer um UPDATE simples
UPDATE quiz_perguntas 
SET explicacao = COALESCE(explicacao, 'Teste de trigger')
WHERE id IN (
    SELECT id FROM quiz_perguntas LIMIT 1
);

-- 12. Verificar se o trigger funcionou
SELECT '=== VERIFICANDO SE TRIGGER FUNCIONOU ===' as info;
SELECT 
    id,
    updated_at,
    data_atualizacao
FROM quiz_perguntas 
WHERE explicacao = 'Teste de trigger'
LIMIT 1;

-- 13. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '✅ Triggers antigos removidos' as status;
SELECT '✅ Funções antigas removidas' as status;
SELECT '✅ Campos necessários adicionados' as status;
SELECT '✅ Novo trigger criado' as status;
SELECT '✅ Teste de funcionalidade realizado' as status;
SELECT 'Agora execute o script sistema-quiz-admin-completo.sql' as proximo_passo;

-- 14. Resumo das correções
SELECT '=== RESUMO DAS CORREÇÕES ===' as info;
SELECT '✅ Triggers problemáticos removidos' as correcao;
SELECT '✅ Funções antigas removidas' as correcao;
SELECT '✅ Campo updated_at adicionado' as correcao;
SELECT '✅ Novo trigger funcional criado' as correcao;













