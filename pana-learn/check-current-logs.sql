-- Script simples para verificar logs e entender o problema
-- Vamos ver o que está acontecendo antes de fazer qualquer coisa

-- 1. Verificar políticas RLS atuais das tabelas principais
SELECT '=== POLÍTICAS RLS ATUAIS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('videos', 'modulos', 'cursos', 'usuarios')
ORDER BY tablename, policyname;

-- 2. Verificar se RLS está habilitado nas tabelas
SELECT '=== STATUS RLS ===' as info;
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('videos', 'modulos', 'cursos', 'usuarios')
ORDER BY tablename;

-- 3. Verificar se há dados nas tabelas
SELECT '=== DADOS NAS TABELAS ===' as info;
SELECT 'videos' as tabela, COUNT(*) as total FROM videos
UNION ALL
SELECT 'modulos' as tabela, COUNT(*) as total FROM modulos
UNION ALL
SELECT 'cursos' as tabela, COUNT(*) as total FROM cursos
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios;

-- 4. Testar consulta simples de vídeos
SELECT '=== TESTE CONSULTA VÍDEOS ===' as info;
SELECT 
    id,
    titulo,
    curso_id,
    modulo_id
FROM videos 
LIMIT 5; 