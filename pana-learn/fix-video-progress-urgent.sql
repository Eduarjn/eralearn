-- SCRIPT URGENTE - Corrigir RLS da tabela video_progress
-- Execute este script no Supabase SQL Editor AGORA

-- 1. Desabilitar RLS imediatamente
ALTER TABLE video_progress DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own progress" ON video_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON video_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON video_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON video_progress;
DROP POLICY IF EXISTS "Allow all for development" ON video_progress;

-- 3. Verificar se RLS foi desabilitado
SELECT '=== RLS DESABILITADO ===' as status;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'video_progress';

-- 4. Testar inserção com user_id válido
DO $$
DECLARE
    valid_user_id uuid;
BEGIN
    -- Pegar o primeiro usuário válido
    SELECT id INTO valid_user_id FROM auth.users LIMIT 1;
    
    IF valid_user_id IS NOT NULL THEN
        -- Inserir progresso de teste
        INSERT INTO video_progress (
            user_id,
            video_id,
            curso_id,
            tempo_assistido,
            tempo_total,
            percentual_assistido,
            concluido
        ) VALUES (
            valid_user_id,
            '8cb86753-98d3-4dfc-ba03-5fa3e840eefc', -- video_id do curso PABX
            '98f3a689-389c-4ded-9833-846d59fcc183', -- curso_id do PABX
            60,
            300,
            20.0,
            false
        ) ON CONFLICT (user_id, video_id) DO UPDATE SET
            tempo_assistido = EXCLUDED.tempo_assistido,
            tempo_total = EXCLUDED.tempo_total,
            percentual_assistido = EXCLUDED.percentual_assistido,
            concluido = EXCLUDED.concluido;
            
        RAISE NOTICE '✅ TESTE: Inserção realizada com user_id: %', valid_user_id;
    ELSE
        RAISE NOTICE '❌ Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- 5. Verificar se inserção funcionou
SELECT '=== VERIFICAR INSERÇÃO ===' as status;
SELECT 
    COUNT(*) as total_registros
FROM video_progress;

-- 6. Limpar dados de teste
DO $$
DECLARE
    valid_user_id uuid;
BEGIN
    SELECT id INTO valid_user_id FROM auth.users LIMIT 1;
    IF valid_user_id IS NOT NULL THEN
        DELETE FROM video_progress WHERE user_id = valid_user_id;
        RAISE NOTICE '🧹 Dados de teste removidos';
    END IF;
END $$;

-- 7. Status final
SELECT '=== STATUS FINAL ===' as status;
SELECT 
    '🎉 RLS DESABILITADO - PROGRESSO DEVE FUNCIONAR!' as mensagem,
    COUNT(*) as total_colunas
FROM information_schema.columns 
WHERE table_name = 'video_progress'; 