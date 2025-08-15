-- Script para configurar o logo ERA Learn no sistema
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR CONFIGURAÇÕES DE BRANDING
-- ========================================

SELECT '=== CONFIGURAÇÕES DE BRANDING ===' as info;

-- Verificar se existe tabela de branding
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'branding_config' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 2. CRIAR TABELA DE BRANDING SE NÃO EXISTIR
-- ========================================

SELECT '=== CRIANDO TABELA DE BRANDING ===' as info;

-- Criar tabela de configurações de branding
CREATE TABLE IF NOT EXISTS branding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT DEFAULT '/logotipoeralearn.png',
    sub_logo_url TEXT DEFAULT '/era-sub-logo.png',
    primary_color TEXT DEFAULT '#2563EB',
    secondary_color TEXT DEFAULT '#CCFF00',
    company_name TEXT DEFAULT 'ERA Learn',
    company_slogan TEXT DEFAULT 'Smart Training',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. INSERIR CONFIGURAÇÃO PADRÃO
-- ========================================

SELECT '=== INSERINDO CONFIGURAÇÃO PADRÃO ===' as info;

-- Inserir configuração padrão do ERA Learn
INSERT INTO branding_config (
    logo_url,
    sub_logo_url,
    primary_color,
    secondary_color,
    company_name,
    company_slogan
) VALUES (
    '/logotipoeralearn.png',
    '/era-sub-logo.png',
    '#2563EB',
    '#CCFF00',
    'ERA Learn',
    'Smart Training'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 4. VERIFICAR CONFIGURAÇÃO INSERIDA
-- ========================================

SELECT '=== CONFIGURAÇÃO INSERIDA ===' as info;

SELECT 
    id,
    logo_url,
    sub_logo_url,
    primary_color,
    secondary_color,
    company_name,
    company_slogan,
    created_at
FROM branding_config
ORDER BY created_at DESC;

-- ========================================
-- 5. CRIAR POLÍTICAS RLS PARA BRANDING
-- ========================================

SELECT '=== CRIANDO POLÍTICAS RLS ===' as info;

DO $$
BEGIN
    -- Política para SELECT - Todos podem ver configurações de branding
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding_config' AND policyname = 'Todos podem ver branding') THEN
        CREATE POLICY "Todos podem ver branding" ON branding_config
            FOR SELECT USING (true);
        RAISE NOTICE 'Política SELECT criada para branding_config';
    ELSE
        RAISE NOTICE 'Política SELECT já existe para branding_config';
    END IF;
    
    -- Política para UPDATE - Apenas admins podem editar branding
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding_config' AND policyname = 'Apenas admins podem editar branding') THEN
        CREATE POLICY "Apenas admins podem editar branding" ON branding_config
            FOR UPDATE USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM usuarios 
                    WHERE user_id = auth.uid() 
                    AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política UPDATE criada para branding_config';
    ELSE
        RAISE NOTICE 'Política UPDATE já existe para branding_config';
    END IF;
END $$;

-- ========================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ========================================

SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    using_expression
FROM pg_policies 
WHERE tablename = 'branding_config'
ORDER BY policyname;

-- ========================================
-- 7. TESTE DE CONSULTA
-- ========================================

SELECT '=== TESTE DE CONSULTA ===' as info;

-- Simular consulta que o frontend fará
SELECT 
    logo_url,
    sub_logo_url,
    primary_color,
    secondary_color,
    company_name,
    company_slogan
FROM branding_config
LIMIT 1;

-- ========================================
-- 8. VERIFICAÇÃO FINAL
-- ========================================

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM branding_config 
            WHERE logo_url = '/logotipoeralearn.png'
        ) THEN '✅ CONFIGURAÇÃO DO LOGO INSERIDA'
        ELSE '❌ CONFIGURAÇÃO DO LOGO PENDENTE'
    END as status_config,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'branding_config'
        ) THEN '✅ POLÍTICAS RLS CONFIGURADAS'
        ELSE '❌ POLÍTICAS RLS PENDENTES'
    END as status_rls,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'branding_config'
        ) THEN '✅ TABELA BRANDING CRIADA'
        ELSE '❌ TABELA BRANDING PENDENTE'
    END as status_tabela;

-- ========================================
-- 9. INSTRUÇÕES FINAIS
-- ========================================

SELECT '=== INSTRUÇÕES FINAIS ===' as info;

SELECT 
    '✅ SISTEMA DE LOGO CONFIGURADO' as status,
    'Adicione o arquivo logotipoeralearn.png na pasta public/' as proximo_passo,
    'Dimensões recomendadas: 120px x 90px (PNG com transparência)' as especificacoes; 