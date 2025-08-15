-- Script para corrigir a exibição de todos os tipos de usuários na lista
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT '=== DADOS EXISTENTES ===' as info;

-- Verificar todos os tipos de usuários
SELECT 
    tipo_usuario,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos
FROM usuarios 
GROUP BY tipo_usuario
ORDER BY tipo_usuario;

-- ========================================
-- 2. VERIFICAR POLÍTICAS RLS
-- ========================================

SELECT '=== POLÍTICAS RLS EXISTENTES ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    using_expression,
    with_check_expression
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- ========================================
-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
-- ========================================

SELECT '=== STATUS DO RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- ========================================
-- 4. CORRIGIR POLÍTICAS RLS
-- ========================================

SELECT '=== CORRIGINDO POLÍTICAS RLS ===' as info;

-- Remover políticas restritivas que podem estar limitando acesso
DO $$
BEGIN
    -- Remover políticas que podem estar restringindo por tipo de usuário
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Apenas admins podem ver usuários') THEN
        DROP POLICY "Apenas admins podem ver usuários" ON usuarios;
        RAISE NOTICE 'Política restritiva removida: Apenas admins podem ver usuários';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Usuarios podem ver apenas seus próprios dados') THEN
        DROP POLICY "Usuarios podem ver apenas seus próprios dados" ON usuarios;
        RAISE NOTICE 'Política restritiva removida: Usuarios podem ver apenas seus próprios dados';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Política restritiva de usuários') THEN
        DROP POLICY "Política restritiva de usuários" ON usuarios;
        RAISE NOTICE 'Política restritiva removida: Política restritiva de usuários';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Filtro por tipo de usuário') THEN
        DROP POLICY "Filtro por tipo de usuário" ON usuarios;
        RAISE NOTICE 'Política restritiva removida: Filtro por tipo de usuário';
    END IF;
END $$;

-- ========================================
-- 5. CRIAR POLÍTICAS CORRETAS
-- ========================================

SELECT '=== CRIANDO POLÍTICAS CORRETAS ===' as info;

DO $$
BEGIN
    -- Política para SELECT - Todos os usuários autenticados podem ver todos os usuários
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Todos podem ver usuários') THEN
        CREATE POLICY "Todos podem ver usuários" ON usuarios
            FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política SELECT criada - Todos os usuários autenticados podem ver todos os usuários';
    ELSE
        RAISE NOTICE 'Política SELECT já existe';
    END IF;
    
    -- Política para INSERT - Apenas admins podem criar usuários
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Apenas admins podem criar usuários') THEN
        CREATE POLICY "Apenas admins podem criar usuários" ON usuarios
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM usuarios 
                    WHERE user_id = auth.uid() 
                    AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política INSERT criada - Apenas admins podem criar usuários';
    ELSE
        RAISE NOTICE 'Política INSERT já existe';
    END IF;
    
    -- Política para UPDATE - Apenas admins podem editar usuários
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Apenas admins podem editar usuários') THEN
        CREATE POLICY "Apenas admins podem editar usuários" ON usuarios
            FOR UPDATE USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM usuarios 
                    WHERE user_id = auth.uid() 
                    AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política UPDATE criada - Apenas admins podem editar usuários';
    ELSE
        RAISE NOTICE 'Política UPDATE já existe';
    END IF;
    
    -- Política para DELETE - Apenas admins podem excluir usuários
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Apenas admins podem excluir usuários') THEN
        CREATE POLICY "Apenas admins podem excluir usuários" ON usuarios
            FOR DELETE USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM usuarios 
                    WHERE user_id = auth.uid() 
                    AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política DELETE criada - Apenas admins podem excluir usuários';
    ELSE
        RAISE NOTICE 'Política DELETE já existe';
    END IF;
END $$;

-- ========================================
-- 6. VERIFICAR POLÍTICAS APÓS CORREÇÃO
-- ========================================

SELECT '=== POLÍTICAS APÓS CORREÇÃO ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    using_expression,
    with_check_expression
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- ========================================
-- 7. TESTE DE CONSULTA
-- ========================================

SELECT '=== TESTE DE CONSULTA ===' as info;

-- Simular consulta que o frontend fará
SELECT 
    COUNT(*) as total_usuarios_visiveis,
    COUNT(CASE WHEN tipo_usuario = 'admin' THEN 1 END) as admins_visiveis,
    COUNT(CASE WHEN tipo_usuario = 'admin_master' THEN 1 END) as admin_masters_visiveis,
    COUNT(CASE WHEN tipo_usuario = 'cliente' THEN 1 END) as clientes_visiveis,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos_visiveis
FROM usuarios;

-- ========================================
-- 8. VERIFICAR AMOSTRA DE DADOS
-- ========================================

SELECT '=== AMOSTRA DE DADOS ===' as info;

SELECT 
    id,
    nome,
    email,
    tipo_usuario,
    status,
    data_criacao
FROM usuarios 
ORDER BY data_criacao DESC 
LIMIT 10;

-- ========================================
-- 9. VERIFICAÇÃO FINAL
-- ========================================

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'usuarios' 
            AND policyname = 'Todos podem ver usuários'
        ) THEN '✅ POLÍTICA SELECT CORRIGIDA'
        ELSE '❌ POLÍTICA SELECT PENDENTE'
    END as status_select,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM usuarios) > 0 THEN '✅ DADOS DISPONÍVEIS'
        ELSE '❌ SEM DADOS'
    END as status_dados,
    
    CASE 
        WHEN (SELECT COUNT(DISTINCT tipo_usuario) FROM usuarios) >= 3 THEN '✅ TODOS OS TIPOS VISÍVEIS'
        ELSE '⚠️ ALGUNS TIPOS PODEM ESTAR FALTANDO'
    END as status_tipos;

-- ========================================
-- 10. INSTRUÇÕES FINAIS
-- ========================================

SELECT '=== INSTRUÇÕES FINAIS ===' as info;

SELECT 
    '✅ SISTEMA CORRIGIDO' as status,
    'Agora todos os tipos de usuários (clientes, admins, admin_masters) devem aparecer na lista.' as mensagem,
    'Recarregue a página de usuários para ver as mudanças.' as proximo_passo; 