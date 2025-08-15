-- Script para verificar associação vídeo-curso
-- Vamos ver se o vídeo está associado ao curso PABX

-- 1. Verificar todos os vídeos e seus cursos
SELECT '=== TODOS OS VÍDEOS E SEUS CURSOS ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
ORDER BY v.data_criacao DESC;

-- 2. Verificar especificamente o curso PABX
SELECT '=== CURSO PABX ===' as info;
SELECT 
    id,
    nome,
    categoria
FROM cursos 
WHERE id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 3. Verificar vídeos do curso PABX
SELECT '=== VÍDEOS DO CURSO PABX ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    c.nome as curso_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 4. Se não há vídeos associados, verificar vídeos sem curso
SELECT '=== VÍDEOS SEM CURSO ASSOCIADO ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id
FROM videos 
WHERE curso_id IS NULL;

-- 5. Verificar se há vídeos da categoria PABX
SELECT '=== VÍDEOS DA CATEGORIA PABX ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id
FROM videos 
WHERE categoria = 'PABX'; 