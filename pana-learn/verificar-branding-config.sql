-- Script para verificar e corrigir configuração de branding
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR SE A TABELA EXISTE
-- ========================================

SELECT '=== VERIFICANDO TABELA BRANDING_CONFIG ===' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'branding_config' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 2. CRIAR TABELA SE NÃO EXISTIR
-- ========================================

CREATE TABLE IF NOT EXISTS branding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT DEFAULT '/logotipoeralearn.png',
    sub_logo_url TEXT DEFAULT '/era-sub-logo.png',
    favicon_url TEXT DEFAULT '/favicon.ico',
    background_url TEXT DEFAULT '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
    primary_color TEXT DEFAULT '#CCFF00',
    secondary_color TEXT DEFAULT '#232323',
    company_name TEXT DEFAULT 'ERA Learn',
    company_slogan TEXT DEFAULT 'Smart Training',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. VERIFICAR CONFIGURAÇÃO ATUAL
-- ========================================

SELECT '=== CONFIGURAÇÃO ATUAL ===' as info;

SELECT 
    id,
    logo_url,
    background_url,
    favicon_url,
    primary_color,
    secondary_color,
    company_name,
    company_slogan,
    created_at,
    updated_at
FROM branding_config
ORDER BY created_at DESC;

-- ========================================
-- 4. INSERIR CONFIGURAÇÃO PADRÃO SE NÃO EXISTIR
-- ========================================

SELECT '=== INSERINDO CONFIGURAÇÃO PADRÃO ===' as info;

INSERT INTO branding_config (
    logo_url,
    sub_logo_url,
    favicon_url,
    background_url,
    primary_color,
    secondary_color,
    company_name,
    company_slogan
) VALUES (
    '/logotipoeralearn.png',
    '/era-sub-logo.png',
    '/favicon.ico',
    '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
    '#CCFF00',
    '#232323',
    'ERA Learn',
    'Smart Training'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 5. ATUALIZAR CONFIGURAÇÃO EXISTENTE
-- ========================================

SELECT '=== ATUALIZANDO CONFIGURAÇÃO ===' as info;

UPDATE branding_config 
SET 
    logo_url = '/logotipoeralearn.png',
    background_url = '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
    favicon_url = '/favicon.ico',
    updated_at = NOW()
WHERE id = (SELECT id FROM branding_config ORDER BY created_at DESC LIMIT 1);

-- ========================================
-- 6. VERIFICAR CONFIGURAÇÃO FINAL
-- ========================================

SELECT '=== CONFIGURAÇÃO FINAL ===' as info;

SELECT 
    '✅ CONFIGURAÇÃO ATUALIZADA' as status,
    'Logo: ' || logo_url as logo_config,
    'Background: ' || background_url as background_config,
    'Favicon: ' || favicon_url as favicon_config,
    'Empresa: ' || company_name as empresa
FROM branding_config
ORDER BY created_at DESC
LIMIT 1;

-- ========================================
-- 7. VERIFICAR POLÍTICAS RLS
-- ========================================

SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'branding_config'
ORDER BY policyname;

-- ========================================
-- 8. CRIAR POLÍTICAS SE NÃO EXISTIREM
-- ========================================

-- Política para SELECT - Todos podem ver configurações de branding
DROP POLICY IF EXISTS "Todos podem ver branding" ON branding_config;
CREATE POLICY "Todos podem ver branding" ON branding_config
    FOR SELECT USING (true);

-- Política para UPDATE - Apenas admins podem editar branding
DROP POLICY IF EXISTS "Apenas admins podem editar branding" ON branding_config;
CREATE POLICY "Apenas admins podem editar branding" ON branding_config
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE user_id = auth.uid() 
            AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

SELECT '✅ POLÍTICAS RLS CONFIGURADAS' as status;
