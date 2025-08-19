-- ========================================
-- ADICIONAR CAMPO UPDATED_AT - VERSÃO SIMPLES
-- ========================================
-- Este script apenas adiciona o campo necessário sem mexer nos triggers

-- 1. Adicionar campo updated_at
ALTER TABLE quiz_perguntas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Verificar se foi adicionado
SELECT 'Campo updated_at adicionado com sucesso!' as status;

-- 3. Verificar estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas' 
  AND column_name = 'updated_at';

-- 4. Instruções
SELECT 'Agora execute o script sistema-quiz-admin-completo.sql' as proximo_passo;









