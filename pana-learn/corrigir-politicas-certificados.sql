-- ========================================
-- CORRIGIR POLÍTICAS RLS PARA CERTIFICADOS
-- ========================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- para corrigir as políticas RLS que podem estar bloqueando o acesso aos certificados

-- ========================================
-- 1. REMOVER POLÍTICAS EXISTENTES PROBLEMÁTICAS
-- ========================================

-- Remover todas as políticas existentes da tabela certificados
DROP POLICY IF EXISTS "Usuários podem ver próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Sistema pode criar certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem ver todos os certificados" ON public.certificados;
DROP POLICY IF EXISTS "Usuários podem inserir próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Usuários podem atualizar próprios certificados" ON public.certificados;

-- ========================================
-- 2. CRIAR POLÍTICAS RLS CORRETAS
-- ========================================

-- Política para SELECT: Usuários podem ver seus próprios certificados
CREATE POLICY "certificados_select_own" ON public.certificados
FOR SELECT
TO authenticated
USING (
    auth.uid()::text = usuario_id::text
);

-- Política para SELECT: Admins podem ver todos os certificados
CREATE POLICY "certificados_select_admin" ON public.certificados
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = auth.uid() 
        AND tipo_usuario IN ('admin', 'admin_master')
    )
);

-- Política para INSERT: Sistema pode criar certificados
CREATE POLICY "certificados_insert_system" ON public.certificados
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE: Usuários podem atualizar seus próprios certificados
CREATE POLICY "certificados_update_own" ON public.certificados
FOR UPDATE
TO authenticated
USING (
    auth.uid()::text = usuario_id::text
)
WITH CHECK (
    auth.uid()::text = usuario_id::text
);

-- Política para UPDATE: Admins podem atualizar qualquer certificado
CREATE POLICY "certificados_update_admin" ON public.certificados
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = auth.uid() 
        AND tipo_usuario IN ('admin', 'admin_master')
    )
)
WITH CHECK (true);

-- Política para DELETE: Apenas admins podem deletar certificados
CREATE POLICY "certificados_delete_admin" ON public.certificados
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = auth.uid() 
        AND tipo_usuario IN ('admin', 'admin_master')
    )
);

-- ========================================
-- 3. VERIFICAR SE RLS ESTÁ ATIVO
-- ========================================

-- Garantir que RLS está ativo na tabela
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. VERIFICAR POLÍTICAS CRIADAS
-- ========================================

SELECT 'Verificando políticas criadas...' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'certificados'
ORDER BY policyname;

-- ========================================
-- 5. TESTAR ACESSO (OPCIONAL)
-- ========================================

-- Descomente as linhas abaixo para testar o acesso
-- (Certifique-se de estar logado como um usuário válido)

/*
-- Teste 1: Verificar se consegue ver certificados próprios
SELECT 'Teste de acesso próprio:' as info;
SELECT COUNT(*) as meus_certificados 
FROM public.certificados 
WHERE usuario_id = auth.uid();

-- Teste 2: Verificar se admin consegue ver todos
SELECT 'Teste de acesso admin:' as info;
SELECT COUNT(*) as total_certificados 
FROM public.certificados;
*/

-- ========================================
-- 6. RESUMO
-- ========================================

SELECT 
    '🎉 POLÍTICAS RLS CORRIGIDAS' as status,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'certificados') as total_politicas,
    (SELECT COUNT(*) FROM public.certificados) as total_certificados;
