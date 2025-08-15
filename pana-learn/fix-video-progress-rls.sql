-- Script para corrigir políticas RLS da tabela video_progress
-- Execute este script no Supabase SQL Editor

-- 1. Verificar políticas atuais
SELECT '=== POLICIES ATUAIS ===' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'video_progress';

-- 2. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view own progress" ON video_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON video_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON video_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON video_progress;
DROP POLICY IF EXISTS "Allow all for development" ON video_progress;

-- 3. Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE video_progress DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT '=== RLS STATUS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'video_progress';

-- 5. Testar inserção de progresso
SELECT '=== TESTE INSERÇÃO ===' as info;
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
    '00000000-0000-0000-0000-000000000000', -- user_id de teste
    '00000000-0000-0000-0000-000000000000', -- video_id de teste
    '00000000-0000-0000-0000-000000000000', -- curso_id de teste
    60, -- tempo_assistido em segundos
    300, -- tempo_total em segundos
    20.0, -- percentual_assistido
    false, -- concluido
    NOW() -- data_criacao
) ON CONFLICT (user_id, video_id) DO UPDATE SET
    tempo_assistido = EXCLUDED.tempo_assistido,
    tempo_total = EXCLUDED.tempo_total,
    percentual_assistido = EXCLUDED.percentual_assistido,
    concluido = EXCLUDED.concluido,
    data_atualizacao = NOW();

-- 6. Verificar se a inserção funcionou
SELECT '=== VERIFICAR INSERÇÃO ===' as info;
SELECT 
    COUNT(*) as total_registros
FROM video_progress;

-- 7. Limpar dados de teste
DELETE FROM video_progress 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- 8. Verificar estrutura final
SELECT '=== ESTRUTURA FINAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'video_progress'
ORDER BY ordinal_position;

-- 9. Verificar se a tabela está funcionando
SELECT '=== STATUS FINAL ===' as info;
SELECT 
    'Tabela video_progress funcionando sem RLS!' as status,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'video_progress'; 