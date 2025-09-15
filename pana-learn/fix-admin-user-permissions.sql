-- Script para corrigir permissões de usuários administradores
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários sem user_id
SELECT 
    'USUÁRIOS SEM USER_ID' as status,
    id,
    email,
    nome,
    tipo_usuario,
    status,
    user_id
FROM usuarios 
WHERE user_id IS NULL
ORDER BY email;

-- 2. Verificar usuários no Supabase Auth
SELECT 
    'USUÁRIOS NO SUPABASE AUTH' as status,
    id,
    email,
    created_at
FROM auth.users
ORDER BY email;

-- 3. Atualizar user_id para usuários que existem no Supabase Auth
UPDATE usuarios 
SET user_id = auth_users.id
FROM auth.users as auth_users
WHERE usuarios.email = auth_users.email 
AND usuarios.user_id IS NULL;

-- 4. Verificar resultado da atualização
SELECT 
    'RESULTADO DA ATUALIZAÇÃO' as status,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as usuarios_com_user_id,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as usuarios_sem_user_id
FROM usuarios;

-- 5. Mostrar usuários administradores atualizados
SELECT 
    'USUÁRIOS ADMINISTRADORES ATUALIZADOS' as status,
    id,
    email,
    nome,
    tipo_usuario,
    status,
    user_id
FROM usuarios 
WHERE tipo_usuario IN ('admin', 'admin_master')
ORDER BY email;










