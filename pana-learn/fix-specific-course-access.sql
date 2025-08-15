-- Script para corrigir acesso específico ao curso PABX
-- Baseado nos logs que mostram 0 vídeos disponíveis

-- 1. Verificar dados do curso específico
SELECT '=== DADOS DO CURSO PABX ===' as info;
SELECT 
    id,
    nome,
    categoria,
    descricao
FROM cursos 
WHERE id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 2. Verificar vídeos deste curso
SELECT '=== VÍDEOS DO CURSO PABX ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id,
    modulo_id
FROM videos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 3. Verificar módulos deste curso
SELECT '=== MÓDULOS DO CURSO PABX ===' as info;
SELECT 
    id,
    nome_modulo,
    curso_id,
    ordem
FROM modulos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY ordem;

-- 4. Verificar políticas RLS da tabela videos
SELECT '=== POLÍTICAS RLS VIDEOS ===' as info;
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'videos';

-- 5. Verificar se RLS está bloqueando acesso
SELECT '=== TESTE ACESSO VIDEOS ===' as info;
-- Simular consulta que o cliente faz
SELECT COUNT(*) as total_videos_acessiveis
FROM videos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 6. Corrigir política RLS da tabela videos se necessário
-- Se não existir política de SELECT, criar uma
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Todos podem ver vídeos" ON public.videos
            FOR SELECT USING (true);
    END IF;
END $$;

-- 7. Verificar se a correção funcionou
SELECT '=== TESTE APÓS CORREÇÃO ===' as info;
SELECT COUNT(*) as total_videos_apos_correcao
FROM videos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 8. Verificar políticas RLS da tabela modulos (que está dando erro 400)
SELECT '=== POLÍTICAS RLS MODULOS ===' as info;
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'modulos';

-- 9. Corrigir política RLS da tabela modulos se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'modulos' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Todos podem ver módulos" ON public.modulos
            FOR SELECT USING (true);
    END IF;
END $$; 