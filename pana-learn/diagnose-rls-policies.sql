-- Script para diagnosticar políticas RLS atuais
-- Vamos verificar o que está acontecendo antes de fazer mudanças

-- 1. Verificar quais tabelas têm RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verificar todas as políticas existentes
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
ORDER BY tablename, policyname;

-- 3. Verificar especificamente a tabela modulos
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'modulos';

-- 4. Verificar se a tabela modulos tem RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'modulos';

-- 5. Verificar estrutura da tabela modulos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'modulos'
ORDER BY ordinal_position;

-- 6. Verificar se há dados na tabela modulos
SELECT COUNT(*) as total_modulos FROM public.modulos;

-- 7. Verificar políticas da tabela usuarios
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'usuarios';

-- 8. Verificar políticas da tabela video_progress
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'video_progress';

-- 9. Verificar políticas da tabela progresso_usuario
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'progresso_usuario'; 