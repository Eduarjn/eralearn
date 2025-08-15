-- Script para verificar e corrigir estrutura da tabela video_progress
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura atual
SELECT '=== ESTRUTURA ATUAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 2. Verificar se há problemas de tipo de dados
SELECT '=== PROBLEMAS DE TIPO ===' as info;
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'integer' AND column_name IN ('tempo_assistido', 'tempo_total') THEN 'OK'
        WHEN data_type = 'double precision' AND column_name = 'percentual_assistido' THEN 'OK'
        WHEN data_type = 'boolean' AND column_name = 'concluido' THEN 'OK'
        ELSE 'VERIFICAR'
    END as status
FROM information_schema.columns 
WHERE table_name = 'video_progress'
AND column_name IN ('tempo_assistido', 'tempo_total', 'percentual_assistido', 'concluido');

-- 3. Corrigir tipos de dados se necessário
DO $$
BEGIN
    -- Verificar se tempo_assistido é integer
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_progress' 
        AND column_name = 'tempo_assistido' 
        AND data_type != 'integer'
    ) THEN
        ALTER TABLE video_progress ALTER COLUMN tempo_assistido TYPE integer USING tempo_assistido::integer;
        RAISE NOTICE 'Coluna tempo_assistido corrigida para integer';
    END IF;
    
    -- Verificar se tempo_total é integer
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_progress' 
        AND column_name = 'tempo_total' 
        AND data_type != 'integer'
    ) THEN
        ALTER TABLE video_progress ALTER COLUMN tempo_total TYPE integer USING tempo_total::integer;
        RAISE NOTICE 'Coluna tempo_total corrigida para integer';
    END IF;
    
    -- Verificar se percentual_assistido é double precision
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_progress' 
        AND column_name = 'percentual_assistido' 
        AND data_type != 'double precision'
    ) THEN
        ALTER TABLE video_progress ALTER COLUMN percentual_assistido TYPE double precision USING percentual_assistido::double precision;
        RAISE NOTICE 'Coluna percentual_assistido corrigida para double precision';
    END IF;
END $$;

-- 4. Verificar estrutura após correções
SELECT '=== ESTRUTURA APÓS CORREÇÕES ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 5. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT video_id) as videos_unicos,
    COUNT(DISTINCT curso_id) as cursos_unicos
FROM video_progress;

-- 6. Testar inserção com dados corretos
SELECT '=== TESTE INSERÇÃO CORRETA ===' as info;
INSERT INTO video_progress (
    user_id,
    video_id,
    curso_id,
    tempo_assistido,
    tempo_total,
    percentual_assistido,
    concluido,
    data_criacao
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    60,
    300,
    20.0,
    false,
    NOW()
) ON CONFLICT (user_id, video_id) DO UPDATE SET
    tempo_assistido = EXCLUDED.tempo_assistido,
    tempo_total = EXCLUDED.tempo_total,
    percentual_assistido = EXCLUDED.percentual_assistido,
    concluido = EXCLUDED.concluido,
    data_atualizacao = NOW();

-- 7. Verificar se inserção funcionou
SELECT '=== VERIFICAR INSERÇÃO ===' as info;
SELECT 
    user_id,
    video_id,
    tempo_assistido,
    tempo_total,
    percentual_assistido,
    concluido
FROM video_progress 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- 8. Limpar dados de teste
DELETE FROM video_progress 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- 9. Status final
SELECT '=== STATUS FINAL ===' as info;
SELECT 
    'Estrutura da tabela video_progress corrigida!' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'video_progress'; 