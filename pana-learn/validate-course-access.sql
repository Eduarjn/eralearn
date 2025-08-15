-- Script para validar acesso atual ao curso
-- Vamos ver o que está acontecendo agora

-- 1. Verificar se o curso existe
SELECT '=== CURSO EXISTE? ===' as info;
SELECT 
    id,
    nome,
    categoria,
    descricao
FROM cursos 
WHERE id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 2. Verificar quantos vídeos existem para este curso
SELECT '=== VÍDEOS DO CURSO ===' as info;
SELECT COUNT(*) as total_videos
FROM videos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 3. Listar os vídeos deste curso
SELECT '=== LISTA DE VÍDEOS ===' as info;
SELECT 
    id,
    titulo,
    categoria,
    curso_id,
    modulo_id,
    data_criacao
FROM videos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY data_criacao;

-- 4. Verificar quantos módulos existem para este curso
SELECT '=== MÓDULOS DO CURSO ===' as info;
SELECT COUNT(*) as total_modulos
FROM modulos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183';

-- 5. Listar os módulos deste curso
SELECT '=== LISTA DE MÓDULOS ===' as info;
SELECT 
    id,
    nome_modulo,
    curso_id,
    ordem
FROM modulos 
WHERE curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY ordem;

-- 6. Verificar políticas RLS atuais
SELECT '=== POLÍTICAS RLS ATUAIS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('videos', 'modulos', 'cursos')
ORDER BY tablename, policyname;

-- 7. Testar consulta que a aplicação faz
SELECT '=== TESTE CONSULTA APLICAÇÃO ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.categoria,
    v.curso_id,
    v.modulo_id,
    c.nome as curso_nome,
    m.nome_modulo as modulo_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
LEFT JOIN modulos m ON v.modulo_id = m.id
WHERE v.curso_id = '98f3a689-389c-4ded-9833-846d59fcc183'
ORDER BY v.data_criacao;

-- 8. Verificar se há dados em outras tabelas relacionadas
SELECT '=== DADOS GERAIS ===' as info;
SELECT 'Total de cursos:' as info, COUNT(*) as total FROM cursos
UNION ALL
SELECT 'Total de vídeos:' as info, COUNT(*) as total FROM videos
UNION ALL
SELECT 'Total de módulos:' as info, COUNT(*) as total FROM modulos
UNION ALL
SELECT 'Total de usuários:' as info, COUNT(*) as total FROM usuarios; 