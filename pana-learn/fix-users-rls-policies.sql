-- Script para verificar e corrigir políticas RLS da tabela usuarios
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela usuarios
SELECT '=== VERIFICANDO ESTRUTURA DA TABELA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS existentes
SELECT '=== POLÍTICAS RLS EXISTENTES ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    with_check,
    using_expression,
    with_check_expression
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 3. Verificar se RLS está habilitado
SELECT '=== STATUS DO RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 4. Verificar dados existentes
SELECT '=== DADOS EXISTENTES ===' as info;

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN tipo_usuario = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN tipo_usuario = 'cliente' THEN 1 END) as clientes,
    COUNT(CASE WHEN tipo_usuario = 'admin_master' THEN 1 END) as admin_masters,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos
FROM usuarios;

-- 5. Verificar amostra de dados
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

-- 6. Corrigir políticas RLS se necessário
SELECT '=== CORRIGINDO POLÍTICAS RLS ===' as info;

-- Remover políticas restritivas existentes
DO $$
BEGIN
    -- Remover políticas que podem estar restringindo acesso
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Usuarios podem ver apenas seus próprios dados') THEN
        DROP POLICY "Usuarios podem ver apenas seus próprios dados" ON usuarios;
        RAISE NOTICE 'Política restritiva removida';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Apenas admins podem ver usuários') THEN
        DROP POLICY "Apenas admins podem ver usuários" ON usuarios;
        RAISE NOTICE 'Política restritiva removida';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Política restritiva de usuários') THEN
        DROP POLICY "Política restritiva de usuários" ON usuarios;
        RAISE NOTICE 'Política restritiva removida';
    END IF;
END $$;

-- 7. Criar políticas corretas para visualização de todos os usuários
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

-- 8. Verificar políticas após correção
SELECT '=== POLÍTICAS APÓS CORREÇÃO ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    with_check,
    using_expression,
    with_check_expression
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 9. Testar consulta como usuário autenticado
SELECT '=== TESTE DE CONSULTA ===' as info;

-- Simular consulta que o frontend fará
SELECT 
    COUNT(*) as total_usuarios_visiveis,
    COUNT(CASE WHEN tipo_usuario = 'admin' THEN 1 END) as admins_visiveis,
    COUNT(CASE WHEN tipo_usuario = 'cliente' THEN 1 END) as clientes_visiveis,
    COUNT(CASE WHEN tipo_usuario = 'admin_master' THEN 1 END) as admin_masters_visiveis
FROM usuarios;

-- 10. Resultado final
SELECT '=== RESULTADO FINAL ===' as info;

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
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'usuarios' 
            AND policyname = 'Apenas admins podem criar usuários'
        ) THEN '✅ POLÍTICA INSERT CORRIGIDA'
        ELSE '❌ POLÍTICA INSERT PENDENTE'
    END as status_insert,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'usuarios' 
            AND policyname = 'Apenas admins podem editar usuários'
        ) THEN '✅ POLÍTICA UPDATE CORRIGIDA'
        ELSE '❌ POLÍTICA UPDATE PENDENTE'
    END as status_update,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'usuarios' 
            AND policyname = 'Apenas admins podem excluir usuários'
        ) THEN '✅ POLÍTICA DELETE CORRIGIDA'
        ELSE '❌ POLÍTICA DELETE PENDENTE'
    END as status_delete;

SELECT 
    'Agora teste no frontend - todos os usuários devem aparecer na lista!' as proximo_passo; 