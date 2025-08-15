-- Script para verificar acesso de vídeos do administrador e replicar para clientes
-- Vamos entender como o admin consegue assistir sem problemas

-- 1. Verificar políticas RLS atuais da tabela videos
SELECT '=== POLÍTICAS RLS DA TABELA VIDEOS ===' as info;
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
WHERE schemaname = 'public' 
AND tablename = 'videos'
ORDER BY policyname;

-- 2. Verificar se a tabela videos tem RLS habilitado
SELECT '=== STATUS RLS DA TABELA VIDEOS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'videos';

-- 3. Verificar estrutura da tabela videos
SELECT '=== ESTRUTURA DA TABELA VIDEOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'videos'
ORDER BY ordinal_position;

-- 4. Verificar dados de vídeos
SELECT '=== DADOS DE VÍDEOS ===' as info;
SELECT 
    id,
    titulo,
    duracao,
    categoria,
    curso_id,
    modulo_id,
    data_criacao
FROM videos 
ORDER BY data_criacao DESC
LIMIT 10;

-- 5. Verificar políticas RLS da tabela modulos (que está causando erros)
SELECT '=== POLÍTICAS RLS DA TABELA MODULOS ===' as info;
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
WHERE schemaname = 'public' 
AND tablename = 'modulos'
ORDER BY policyname;

-- 6. Verificar se a tabela modulos tem RLS habilitado
SELECT '=== STATUS RLS DA TABELA MODULOS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'modulos';

-- 7. Verificar políticas RLS da tabela cursos
SELECT '=== POLÍTICAS RLS DA TABELA CURSOS ===' as info;
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
WHERE schemaname = 'public' 
AND tablename = 'cursos'
ORDER BY policyname;

-- 8. Verificar se a tabela cursos tem RLS habilitado
SELECT '=== STATUS RLS DA TABELA CURSOS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'cursos';

-- 9. Testar consulta que o admin faz (simular)
SELECT '=== TESTE DE CONSULTA ADMIN ===' as info;
SELECT 
    v.id,
    v.titulo,
    v.duracao,
    v.categoria,
    v.curso_id,
    v.modulo_id,
    c.nome as curso_nome,
    m.nome_modulo as modulo_nome
FROM videos v
LEFT JOIN cursos c ON v.curso_id = c.id
LEFT JOIN modulos m ON v.modulo_id = m.id
ORDER BY v.data_criacao DESC
LIMIT 5;

-- 10. Verificar se há dados nas tabelas relacionadas
SELECT '=== DADOS NAS TABELAS RELACIONADAS ===' as info;
SELECT 'Cursos:' as tabela, COUNT(*) as total FROM cursos
UNION ALL
SELECT 'Módulos:' as tabela, COUNT(*) as total FROM modulos
UNION ALL
SELECT 'Vídeos:' as tabela, COUNT(*) as total FROM videos;

-- 11. Verificar políticas RLS da tabela usuarios
SELECT '=== POLÍTICAS RLS DA TABELA USUARIOS ===' as info;
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
WHERE schemaname = 'public' 
AND tablename = 'usuarios'
ORDER BY policyname;

-- 12. Verificar se a tabela usuarios tem RLS habilitado
SELECT '=== STATUS RLS DA TABELA USUARIOS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'usuarios'; 