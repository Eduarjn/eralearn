-- Script simplificado para verificar piscar
-- Execute este script e depois teste a aplicação

-- 1. Verificar políticas RLS básicas
SELECT '=== POLÍTICAS RLS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('videos', 'modulos', 'cursos', 'video_progress', 'progresso_usuario')
ORDER BY tablename, policyname;

-- 2. Verificar triggers
SELECT '=== TRIGGERS ===' as info;
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- 3. Verificar funções
SELECT '=== FUNÇÕES ===' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%progress%'
ORDER BY routine_name;

-- 4. Verificar se há locks ativos
SELECT '=== LOCKS ===' as info;
SELECT 
    locktype,
    mode,
    granted
FROM pg_locks 
WHERE NOT granted;

-- 5. Verificar performance básica
SELECT '=== PERFORMANCE ===' as info;
SELECT 
    relname as tablename,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
AND relname IN ('videos', 'modulos', 'cursos', 'video_progress', 'progresso_usuario')
ORDER BY relname; 