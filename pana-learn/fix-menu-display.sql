-- Script para corrigir problemas de exibição dos menus
-- Problema: Menus sumiram para os clientes

-- 1. Verificar usuários e seus tipos
SELECT '=== USUÁRIOS E TIPOS ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios
ORDER BY tipo_usuario, email;

-- 2. Verificar se há usuários clientes ativos
SELECT '=== CLIENTES ATIVOS ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios
WHERE tipo_usuario = 'cliente'
AND status = 'ativo'
ORDER BY email;

-- 3. Verificar se há problemas na tabela usuarios
SELECT '=== PROBLEMAS NA TABELA USUARIOS ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios
WHERE tipo_usuario IS NULL
OR status IS NULL
OR email IS NULL;

-- 4. Corrigir usuários sem tipo_usuario
UPDATE usuarios 
SET tipo_usuario = 'cliente'
WHERE tipo_usuario IS NULL;

-- 5. Corrigir usuários sem status
UPDATE usuarios 
SET status = 'ativo'
WHERE status IS NULL;

-- 6. Verificar políticas RLS da tabela usuarios
SELECT '=== POLÍTICAS RLS USUARIOS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 7. Garantir que há políticas para SELECT na tabela usuarios
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usuarios' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Todos podem ver usuários" ON public.usuarios
            FOR SELECT USING (true);
        RAISE NOTICE 'Política SELECT criada para usuarios';
    END IF;
END $$;

-- 8. Verificar resultado final
SELECT '=== USUÁRIOS APÓS CORREÇÃO ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios
ORDER BY tipo_usuario, email; 