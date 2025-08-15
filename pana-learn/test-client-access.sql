-- Script simples para testar acesso dos clientes aos vídeos
-- Execute este script e depois teste a aplicação

-- 1. Verificar se há vídeos no curso PABX
SELECT '=== VÍDEOS DO CURSO PABX ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome,
    v.duracao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY v.data_criacao;

-- 2. Verificar políticas RLS atuais
SELECT '=== POLÍTICAS RLS ATUAIS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('videos', 'cursos', 'modulos')
ORDER BY tablename, policyname;

-- 3. Verificar se RLS está habilitado
SELECT '=== STATUS RLS ===' as info;
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('videos', 'cursos', 'modulos')
ORDER BY tablename;

-- 4. Criar política simples para videos (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Permitir acesso a vídeos" ON public.videos
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de acesso criada para videos';
    ELSE
        RAISE NOTICE 'Política de acesso já existe para videos';
    END IF;
END $$;

-- 5. Criar política simples para cursos (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cursos' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Permitir acesso a cursos" ON public.cursos
            FOR SELECT USING (true);
        RAISE NOTICE 'Política de acesso criada para cursos';
    ELSE
        RAISE NOTICE 'Política de acesso já existe para cursos';
    END IF;
END $$;

-- 6. Testar consulta que a aplicação faz
SELECT '=== TESTE CONSULTA APLICAÇÃO ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome,
    v.duracao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY v.data_criacao; 