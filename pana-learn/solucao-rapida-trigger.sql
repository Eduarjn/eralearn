-- ========================================
-- SOLUÇÃO RÁPIDA PARA TRIGGER UPDATED_AT
-- ========================================
-- Este script resolve rapidamente o problema do trigger

-- 1. Remover todos os triggers problemáticos
DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_quiz_perguntas_timestamps_trigger ON quiz_perguntas;
DROP TRIGGER IF EXISTS update_updated_at_column ON quiz_perguntas;

-- 2. Remover funções problemáticas
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_quiz_perguntas_timestamps();

-- 3. Adicionar campo updated_at
ALTER TABLE quiz_perguntas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Verificar se funcionou
SELECT '✅ Triggers removidos' as status;
SELECT '✅ Funções removidas' as status;
SELECT '✅ Campo updated_at adicionado' as status;
SELECT 'Agora execute o script sistema-quiz-admin-completo.sql' as proximo_passo;





