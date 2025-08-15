-- Script para diagnosticar e corrigir problema de vídeos importados não aparecendo
-- Execute este script no Supabase SQL Editor

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

-- 2. Verificar se há vídeos importados
SELECT '=== VÍDEOS IMPORTADOS ===' as info;
SELECT 
    id,
    titulo,
    curso_id,
    categoria,
    data_criacao,
    url_video
FROM videos
ORDER BY data_criacao DESC
LIMIT 10;

-- 3. Verificar cursos disponíveis
SELECT '=== CURSOS DISPONÍVEIS ===' as info;
SELECT 
    id,
    nome,
    categoria,
    status
FROM cursos
ORDER BY nome;

-- 4. Verificar vídeos sem curso_id (órfãos)
SELECT '=== VÍDEOS ÓRFÃOS (SEM CURSO_ID) ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id,
    data_criacao
FROM videos
WHERE curso_id IS NULL
ORDER BY data_criacao DESC;

-- 5. Associar vídeos órfãos aos cursos baseado na categoria
UPDATE videos
SET curso_id = (
    SELECT id FROM cursos
    WHERE categoria = videos.categoria
    AND status = 'ativo'
    LIMIT 1
)
WHERE curso_id IS NULL
AND categoria IS NOT NULL;

-- 6. Verificar vídeos após associação
SELECT '=== VÍDEOS APÓS ASSOCIAÇÃO ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome,
    v.data_criacao
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
ORDER BY v.data_criacao DESC;

-- 7. Verificar vídeos por curso específico
SELECT '=== VÍDEOS POR CURSO ===' as info;
SELECT 
    c.nome as curso_nome,
    c.categoria,
    COUNT(v.id) as total_videos
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
GROUP BY c.id, c.nome, c.categoria
ORDER BY c.nome;

-- 8. Verificar se há problemas de permissão
SELECT '=== POLÍTICAS RLS VIDEOS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'videos'
ORDER BY policyname;

-- 9. Testar consulta como cliente
SELECT '=== TESTE CONSULTA CLIENTE ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id IS NOT NULL
ORDER BY v.data_criacao DESC
LIMIT 5;

-- 10. Verificar se há vídeos com curso_id mas curso não existe
SELECT '=== VÍDEOS COM CURSO INEXISTENTE ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.curso_id,
    v.categoria
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id IS NOT NULL AND c.id IS NULL;

-- 11. Corrigir vídeos com curso inexistente
UPDATE videos
SET curso_id = (
    SELECT id FROM cursos
    WHERE categoria = videos.categoria
    AND status = 'ativo'
    LIMIT 1
)
WHERE curso_id IN (
    SELECT v.curso_id
    FROM videos v
    LEFT JOIN cursos c ON v.curso_id = c.id
    WHERE v.curso_id IS NOT NULL AND c.id IS NULL
);

-- 12. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    'Total vídeos' as tipo,
    COUNT(*) as total
FROM videos
UNION ALL
SELECT 
    'Vídeos com curso_id' as tipo,
    COUNT(*) as total
FROM videos
WHERE curso_id IS NOT NULL
UNION ALL
SELECT 
    'Vídeos órfãos' as tipo,
    COUNT(*) as total
FROM videos
WHERE curso_id IS NULL; 