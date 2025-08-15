-- Script para limpar dados de teste da tabela video_progress
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT video_id) as videos_unicos,
    COUNT(DISTINCT curso_id) as cursos_unicos
FROM video_progress;

-- 2. Mostrar alguns registros para verificação
SELECT '=== AMOSTRA DE DADOS ===' as info;
SELECT 
    user_id,
    video_id,
    curso_id,
    tempo_assistido,
    tempo_total,
    percentual_assistido,
    concluido,
    data_criacao
FROM video_progress 
LIMIT 5;

-- 3. Limpar dados de teste (se houver)
DO $$
DECLARE
    valid_user_id uuid;
BEGIN
    -- Pegar o primeiro usuário válido
    SELECT id INTO valid_user_id FROM auth.users LIMIT 1;
    
    IF valid_user_id IS NOT NULL THEN
        -- Limpar dados de teste para este usuário
        DELETE FROM video_progress WHERE user_id = valid_user_id;
        RAISE NOTICE '🧹 Dados de teste removidos para user_id: %', valid_user_id;
    END IF;
END $$;

-- 4. Verificar dados após limpeza
SELECT '=== DADOS APÓS LIMPEZA ===' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT video_id) as videos_unicos,
    COUNT(DISTINCT curso_id) as cursos_unicos
FROM video_progress;

-- 5. Status final
SELECT '=== STATUS FINAL ===' as info;
SELECT 
    '🎉 Dados de teste removidos! Tabela limpa para testes.' as mensagem,
    COUNT(*) as total_registros
FROM video_progress; 