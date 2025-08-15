-- Script para diagnosticar problemas de permissões de vídeos
-- Problema: Vídeos aparecem apenas para administradores, não para clientes

-- 1. Verificar estrutura da tabela videos
SELECT '=== ESTRUTURA TABELA VIDEOS ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;

-- 2. Verificar se RLS está habilitado para videos
SELECT '=== STATUS RLS VIDEOS ===' as info;
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'videos';

-- 3. Verificar políticas RLS da tabela videos
SELECT '=== POLÍTICAS RLS VIDEOS ===' as info;
SELECT
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'videos'
ORDER BY policyname;

-- 4. Verificar vídeos existentes e suas permissões
SELECT '=== VÍDEOS EXISTENTES ===' as info;
SELECT
    id,
    titulo,
    categoria,
    curso_id,
    ativo,
    data_criacao
FROM videos
ORDER BY data_criacao DESC
LIMIT 10;

-- 5. Verificar vídeos do curso PABX especificamente
SELECT '=== VÍDEOS DO CURSO PABX ===' as info;
SELECT
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.ativo,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
OR v.categoria = 'PABX'
ORDER BY v.data_criacao;

-- 6. Testar consulta como se fosse um cliente
SELECT '=== TESTE CONSULTA CLIENTE ===' as info;
SELECT
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.ativo
FROM videos v
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
AND v.ativo = true
ORDER BY v.data_criacao;

-- 7. Verificar se há vídeos órfãos (sem curso_id)
SELECT '=== VÍDEOS ÓRFÃOS ===' as info;
SELECT
    id,
    titulo,
    categoria,
    curso_id,
    ativo
FROM videos
WHERE curso_id IS NULL
AND ativo = true
ORDER BY data_criacao;

-- 8. Verificar configuração do curso PABX
SELECT '=== CURSO PABX ===' as info;
SELECT
    id,
    nome,
    categoria,
    status,
    ativo
FROM cursos
WHERE id = '98f3a689-389c-4ded-9833-846d59fcc183'
OR categoria = 'PABX';

-- 9. Verificar se há problemas de permissão específicos
SELECT '=== TESTE PERMISSÕES ===' as info;
SELECT
    'Vídeos ativos' as tipo,
    COUNT(*) as total
FROM videos
WHERE ativo = true
UNION ALL
SELECT
    'Vídeos do curso PABX' as tipo,
    COUNT(*) as total
FROM videos
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
AND ativo = true
UNION ALL
SELECT
    'Vídeos categoria PABX' as tipo,
    COUNT(*) as total
FROM videos
WHERE categoria = 'PABX'
AND ativo = true; 