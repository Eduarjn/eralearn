-- ========================================
-- CORRIGIR CERTIFICADOS PARA ADMINISTRADORES
-- ========================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- para resolver o problema de administradores não conseguirem ver certificados

-- ========================================
-- 1. VERIFICAR SITUAÇÃO ATUAL
-- ========================================

SELECT '=== VERIFICANDO SITUAÇÃO ATUAL ===' as info;

-- Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certificados')
        THEN '✅ Tabela certificados existe'
        ELSE '❌ Tabela certificados NÃO existe'
    END as status_tabela;

-- Verificar se há dados
SELECT 
    COUNT(*) as total_certificados,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Há certificados na tabela'
        ELSE '❌ NÃO há certificados na tabela'
    END as status_dados
FROM public.certificados;

-- Verificar usuários admin
SELECT 
    COUNT(*) as total_admins,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Há usuários admin'
        ELSE '❌ NÃO há usuários admin'
    END as status_admins
FROM public.usuarios 
WHERE tipo_usuario IN ('admin', 'admin_master');

-- ========================================
-- 2. CRIAR TABELA SE NÃO EXISTIR
-- ========================================

DO $$
BEGIN
    -- Verificar se a tabela certificados existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certificados') THEN
        RAISE NOTICE 'Criando tabela certificados...';
        
        CREATE TABLE public.certificados (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
            curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
            categoria VARCHAR(100) NOT NULL,
            categoria_nome TEXT,
            quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
            nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
            data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            numero_certificado VARCHAR(100) UNIQUE,
            status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'revogado', 'expirado')),
            certificado_url TEXT,
            qr_code_url TEXT,
            data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela certificados criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela certificados já existe.';
    END IF;
END $$;

-- ========================================
-- 3. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
-- ========================================

SELECT 'Removendo políticas RLS existentes...' as info;

DROP POLICY IF EXISTS "certificados_select_own" ON public.certificados;
DROP POLICY IF EXISTS "certificados_select_admin" ON public.certificados;
DROP POLICY IF EXISTS "certificados_insert_system" ON public.certificados;
DROP POLICY IF EXISTS "certificados_update_own" ON public.certificados;
DROP POLICY IF EXISTS "certificados_update_admin" ON public.certificados;
DROP POLICY IF EXISTS "certificados_delete_admin" ON public.certificados;
DROP POLICY IF EXISTS "Usuários podem ver próprios certificados" ON public.certificados;
DROP POLICY IF EXISTS "Sistema pode criar certificados" ON public.certificados;
DROP POLICY IF EXISTS "Admins podem ver todos os certificados" ON public.certificados;

-- ========================================
-- 4. CRIAR POLÍTICAS RLS CORRETAS
-- ========================================

SELECT 'Criando políticas RLS corretas...' as info;

-- Garantir que RLS está ativo
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Política 1: Usuários podem ver seus próprios certificados
CREATE POLICY "certificados_select_own" ON public.certificados
FOR SELECT
TO authenticated
USING (
    auth.uid()::text = usuario_id::text
);

-- Política 2: Administradores podem ver TODOS os certificados
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

-- Política 3: Sistema pode inserir certificados
CREATE POLICY "certificados_insert_system" ON public.certificados
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política 4: Usuários podem atualizar seus próprios certificados
CREATE POLICY "certificados_update_own" ON public.certificados
FOR UPDATE
TO authenticated
USING (
    auth.uid()::text = usuario_id::text
)
WITH CHECK (
    auth.uid()::text = usuario_id::text
);

-- Política 5: Administradores podem atualizar qualquer certificado
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

-- Política 6: Apenas administradores podem deletar certificados
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
-- 5. CRIAR DADOS DE TESTE
-- ========================================

DO $$
DECLARE
    user_count INTEGER;
    cert_count INTEGER;
    admin_user_id UUID;
BEGIN
    -- Contar usuários e certificados
    SELECT COUNT(*) INTO user_count FROM public.usuarios;
    SELECT COUNT(*) INTO cert_count FROM public.certificados;
    
    RAISE NOTICE 'Usuários encontrados: %', user_count;
    RAISE NOTICE 'Certificados existentes: %', cert_count;
    
    -- Se não há certificados, criar alguns de teste
    IF cert_count = 0 AND user_count > 0 THEN
        RAISE NOTICE 'Criando certificados de teste...';
        
        -- Obter um usuário admin para criar certificados
        SELECT id INTO admin_user_id FROM public.usuarios 
        WHERE tipo_usuario IN ('admin', 'admin_master') 
        LIMIT 1;
        
        -- Se não há admin, usar qualquer usuário
        IF admin_user_id IS NULL THEN
            SELECT id INTO admin_user_id FROM public.usuarios LIMIT 1;
        END IF;
        
        IF admin_user_id IS NOT NULL THEN
            -- Criar certificados de teste
            INSERT INTO public.certificados (
                usuario_id,
                categoria,
                categoria_nome,
                nota,
                data_conclusao,
                data_emissao,
                numero_certificado,
                status
            ) VALUES 
            (
                admin_user_id,
                'pabx_fundamentos',
                'Fundamentos de PABX',
                95,
                NOW() - INTERVAL '1 day',
                NOW(),
                'TEST-PABX-001',
                'ativo'
            ),
            (
                admin_user_id,
                'callcenter_fundamentos',
                'Fundamentos CALLCENTER',
                88,
                NOW() - INTERVAL '2 days',
                NOW() - INTERVAL '1 day',
                'TEST-CALL-001',
                'ativo'
            ),
            (
                admin_user_id,
                'omnichannel_empresas',
                'OMNICHANNEL para Empresas',
                92,
                NOW() - INTERVAL '3 days',
                NOW() - INTERVAL '2 days',
                'TEST-OMNI-001',
                'ativo'
            );
            
            RAISE NOTICE 'Certificados de teste criados com sucesso!';
        ELSE
            RAISE NOTICE 'Não foi possível criar certificados de teste - nenhum usuário encontrado.';
        END IF;
    ELSE
        RAISE NOTICE 'Certificados já existem ou não há usuários para criar certificados.';
    END IF;
END $$;

-- ========================================
-- 6. VERIFICAR RESULTADO
-- ========================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

-- Verificar políticas criadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    '✅ CRIADA' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'certificados'
ORDER BY policyname;

-- Verificar certificados criados
SELECT 
    id,
    usuario_id,
    categoria,
    categoria_nome,
    nota,
    data_emissao,
    status,
    '✅ ATIVO' as status_cert
FROM public.certificados 
ORDER BY data_emissao DESC;

-- Verificar usuários admin
SELECT 
    id,
    nome,
    email,
    tipo_usuario,
    '✅ ADMIN' as status_user
FROM public.usuarios 
WHERE tipo_usuario IN ('admin', 'admin_master')
ORDER BY created_at DESC;

-- ========================================
-- 7. TESTE DE ACESSO (OPCIONAL)
-- ========================================

-- Descomente as linhas abaixo para testar o acesso
-- (Certifique-se de estar logado como admin)

/*
-- Teste: Verificar se consegue ver certificados como admin
SELECT 'Teste de acesso admin:' as info;
SELECT COUNT(*) as total_certificados_visiveis 
FROM public.certificados;

-- Teste: Verificar se consegue ver certificados próprios
SELECT 'Teste de acesso próprio:' as info;
SELECT COUNT(*) as meus_certificados 
FROM public.certificados 
WHERE usuario_id = auth.uid();
*/

-- ========================================
-- 8. RESUMO FINAL
-- ========================================

SELECT 
    '🎉 CORREÇÃO CONCLUÍDA' as status,
    (SELECT COUNT(*) FROM public.certificados) as total_certificados,
    (SELECT COUNT(*) FROM public.usuarios WHERE tipo_usuario IN ('admin', 'admin_master')) as total_admins,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'certificados') as total_politicas;
