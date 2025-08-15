-- Script para corrigir problemas na tabela video_progress
-- A coluna se chama user_id, não usuario_id

-- 1. Verificar estrutura atual da tabela video_progress
SELECT '=== ESTRUTURA ATUAL VIDEO_PROGRESS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela tem chave primária
SELECT '=== CHAVE PRIMÁRIA VIDEO_PROGRESS ===' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'video_progress' 
AND tc.constraint_type = 'PRIMARY KEY';

-- 3. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;
SELECT 
    user_id,
    video_id,
    tempo_assistido,
    percentual_assistido,
    concluido
FROM video_progress
LIMIT 5;

-- 4. Verificar usuários existentes
SELECT '=== USUÁRIOS EXISTENTES ===' as info;
SELECT 
    id,
    email,
    tipo_usuario
FROM usuarios 
ORDER BY email;

-- 5. Verificar se há registros sem user_id
SELECT '=== REGISTROS SEM USER_ID ===' as info;
SELECT COUNT(*) as registros_sem_user_id
FROM video_progress
WHERE user_id IS NULL;

-- 6. Se houver registros sem user_id, atualizar para usuários clientes
UPDATE public.video_progress 
SET user_id = (
    SELECT id FROM public.usuarios 
    WHERE tipo_usuario = 'cliente'
    ORDER BY RANDOM()
    LIMIT 1
)
WHERE user_id IS NULL;

-- 7. Verificar dados atualizados
SELECT '=== DADOS ATUALIZADOS ===' as info;
SELECT 
    user_id,
    video_id,
    tempo_assistido,
    percentual_assistido
FROM video_progress
LIMIT 5;

-- 8. Verificar total de registros
SELECT '=== TOTAL REGISTROS ===' as info;
SELECT COUNT(*) as total_registros
FROM video_progress; 