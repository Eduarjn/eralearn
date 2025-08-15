-- Script para capturar logs que causam piscar
-- Execute este script e depois teste a aplicação

-- 1. Verificar políticas RLS que podem estar causando problemas
SELECT '=== POLÍTICAS RLS PROBLEMÁTICAS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('videos', 'modulos', 'cursos', 'video_progress', 'progresso_usuario')
ORDER BY tablename, policyname;

-- 2. Verificar se há triggers que podem estar causando loops
SELECT '=== TRIGGERS ATIVOS ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- 3. Verificar se há funções que podem estar sendo chamadas em loop
SELECT '=== FUNÇÕES ATIVAS ===' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_name LIKE '%progress%' OR routine_name LIKE '%update%')
ORDER BY routine_name;

-- 4. Verificar se há índices que podem estar causando problemas
SELECT '=== ÍNDICES DAS TABELAS ===' as info;
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('videos', 'modulos', 'cursos', 'video_progress', 'progresso_usuario')
ORDER BY tablename, indexname;

-- 5. Verificar se há constraints que podem estar causando problemas
SELECT '=== CONSTRAINTS ===' as info;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY conname;

-- 6. Verificar se há deadlocks ou locks ativos
SELECT '=== LOCKS ATIVOS ===' as info;
SELECT 
    locktype,
    database,
    relation::regclass,
    mode,
    granted
FROM pg_locks 
WHERE NOT granted OR mode = 'AccessExclusiveLock';

-- 7. Verificar performance das consultas
SELECT '=== PERFORMANCE DAS TABELAS ===' as info;
SELECT 
    schemaname,
    relname as tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
AND relname IN ('videos', 'modulos', 'cursos', 'video_progress', 'progresso_usuario')
ORDER BY relname; 