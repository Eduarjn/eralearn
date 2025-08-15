-- Script para debugar a consulta do frontend
-- Problema: Frontend não consegue buscar vídeos mesmo com políticas corretas

-- 1. Simular exatamente a consulta que o frontend faz
SELECT '=== CONSULTA FRONTEND ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.duracao,
    v.data_criacao
FROM videos v
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY v.data_criacao DESC;

-- 2. Verificar se há vídeos com curso_id NULL
SELECT '=== VÍDEOS SEM CURSO_ID ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id,
    duracao
FROM videos
WHERE curso_id IS NULL
ORDER BY data_criacao;

-- 3. Verificar vídeos da categoria PABX
SELECT '=== VÍDEOS CATEGORIA PABX ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id,
    duracao
FROM videos
WHERE categoria = 'PABX'
ORDER BY data_criacao;

-- 4. Verificar se há vídeos órfãos que precisam ser associados
SELECT '=== VÍDEOS ÓRFÃOS PABX ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.categoria = 'PABX'
AND (v.curso_id IS NULL OR v.curso_id != '98f3a689-389c-4ded-9833-846d59fcc183')
ORDER BY v.data_criacao;

-- 5. Associar vídeos órfãos ao curso PABX
DO $$
BEGIN
    -- Associar vídeos PABX sem curso_id ao curso PABX
    UPDATE videos 
    SET curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
    WHERE categoria = 'PABX' 
    AND curso_id IS NULL;
    
    RAISE NOTICE 'Vídeos PABX órfãos associados ao curso';
END $$;

-- 6. Verificar resultado após associação
SELECT '=== VÍDEOS APÓS ASSOCIAÇÃO ===' as info;
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

-- 7. Testar consulta final
SELECT '=== CONSULTA FINAL ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.duracao
FROM videos v
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY v.data_criacao DESC; 