-- Script para corrigir problemas de sessão
-- Problema: "status: 'initial_SESSION'" e "ProtectedRoute-Estado: 'expirado'"

-- 1. Verificar usuários existentes
SELECT '=== USUÁRIOS EXISTENTES ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios 
ORDER BY email;

-- 2. Verificar se há usuários de teste
SELECT '=== USUÁRIOS DE TESTE ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios 
WHERE email IN ('admin@eralearn.com', 'cliente@eralearn.com')
ORDER BY email;

-- 3. Se não há usuários de teste, criar com UUIDs válidos
DO $$
BEGIN
    -- Verificar se admin@eralearn.com existe
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE email = 'admin@eralearn.com'
    ) THEN
        INSERT INTO usuarios (id, email, nome, tipo_usuario, status) VALUES
        (gen_random_uuid(), 'admin@eralearn.com', 'Administrador ERA', 'admin', 'ativo');
        RAISE NOTICE 'Usuário admin@eralearn.com criado';
    END IF;
    
    -- Verificar se cliente@eralearn.com existe
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE email = 'cliente@eralearn.com'
    ) THEN
        INSERT INTO usuarios (id, email, nome, tipo_usuario, status) VALUES
        (gen_random_uuid(), 'cliente@eralearn.com', 'Cliente Teste', 'cliente', 'ativo');
        RAISE NOTICE 'Usuário cliente@eralearn.com criado';
    END IF;
END $$;

-- 4. Verificar políticas RLS para usuarios
SELECT '=== POLÍTICAS RLS USUARIOS ===' as info;
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado para usuarios
SELECT '=== STATUS RLS USUARIOS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'usuarios';

-- 6. Habilitar RLS se não estiver
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas básicas para usuarios se não existirem
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usuarios' 
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Todos podem ver usuários" ON public.usuarios
            FOR SELECT USING (true);
    END IF;
    
    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usuarios' 
        AND cmd = 'INSERT'
    ) THEN
        CREATE POLICY "Todos podem inserir usuários" ON public.usuarios
            FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usuarios' 
        AND cmd = 'UPDATE'
    ) THEN
        CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.usuarios
            FOR UPDATE USING (id = auth.uid());
    END IF;
END $$;

-- 8. Verificar usuários após correção
SELECT '=== USUÁRIOS APÓS CORREÇÃO ===' as info;
SELECT 
    id,
    email,
    nome,
    tipo_usuario,
    status
FROM usuarios 
ORDER BY email; 