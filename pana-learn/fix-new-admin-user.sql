-- Script para corrigir usuário administrador recém-criado
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários administradores sem user_id
SELECT 
    'USUÁRIOS ADMIN SEM USER_ID' as status,
    id,
    email,
    nome,
    tipo_usuario,
    status,
    user_id
FROM usuarios 
WHERE tipo_usuario IN ('admin', 'admin_master')
AND user_id IS NULL
ORDER BY data_criacao DESC;

-- 2. Verificar se o email existe no Supabase Auth
-- (Substitua 'email_do_usuario@exemplo.com' pelo email do usuário recém-criado)
SELECT 
    'USUÁRIO NO SUPABASE AUTH' as status,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'email_do_usuario@exemplo.com'; -- SUBSTITUA PELO EMAIL CORRETO

-- 3. Atualizar user_id para o usuário específico
-- (Substitua 'email_do_usuario@exemplo.com' pelo email do usuário recém-criado)
UPDATE usuarios 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'email_do_usuario@exemplo.com' -- SUBSTITUA PELO EMAIL CORRETO
)
WHERE email = 'email_do_usuario@exemplo.com' -- SUBSTITUA PELO EMAIL CORRETO
AND user_id IS NULL;

-- 4. Verificar se a atualização funcionou
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    id,
    email,
    nome,
    tipo_usuario,
    status,
    user_id,
    CASE 
        WHEN user_id IS NOT NULL THEN '✅ CONECTADO'
        ELSE '❌ SEM CONEXÃO'
    END as status_conexao
FROM usuarios 
WHERE email = 'email_do_usuario@exemplo.com'; -- SUBSTITUA PELO EMAIL CORRETO

-- 5. Mostrar todos os usuários administradores
SELECT 
    'TODOS OS USUÁRIOS ADMIN' as status,
    id,
    email,
    nome,
    tipo_usuario,
    status,
    user_id,
    CASE 
        WHEN user_id IS NOT NULL THEN '✅ CONECTADO'
        ELSE '❌ SEM CONEXÃO'
    END as status_conexao
FROM usuarios 
WHERE tipo_usuario IN ('admin', 'admin_master')
ORDER BY data_criacao DESC;
















