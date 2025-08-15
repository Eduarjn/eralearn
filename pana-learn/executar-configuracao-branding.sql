-- Script para configurar o sistema de branding ERA Learn
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. CRIAR TABELA DE BRANDING
-- ========================================

CREATE TABLE IF NOT EXISTS branding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT DEFAULT '/logotipoeralearn.png',
    sub_logo_url TEXT DEFAULT '/era-sub-logo.png',
    favicon_url TEXT DEFAULT '/favicon.ico',
    primary_color TEXT DEFAULT '#CCFF00',
    secondary_color TEXT DEFAULT '#232323',
    company_name TEXT DEFAULT 'ERA Learn',
    company_slogan TEXT DEFAULT 'Smart Training',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. INSERIR CONFIGURAÇÃO PADRÃO
-- ========================================

INSERT INTO branding_config (
    logo_url,
    sub_logo_url,
    favicon_url,
    primary_color,
    secondary_color,
    company_name,
    company_slogan
) VALUES (
    '/logotipoeralearn.png',
    '/era-sub-logo.png',
    '/favicon.ico',
    '#CCFF00',
    '#232323',
    'ERA Learn',
    'Smart Training'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 3. CRIAR POLÍTICAS RLS
-- ========================================

-- Política para SELECT - Todos podem ver configurações de branding
DROP POLICY IF EXISTS "Todos podem ver branding" ON branding_config;
CREATE POLICY "Todos podem ver branding" ON branding_config
    FOR SELECT USING (true);

-- Política para INSERT - Apenas admins podem inserir
DROP POLICY IF EXISTS "Apenas admins podem inserir branding" ON branding_config;
CREATE POLICY "Apenas admins podem inserir branding" ON branding_config
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE user_id = auth.uid() 
            AND tipo_usuario IN ('admin', 'admin_master')
        )
    );

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

-- ========================================
-- 4. VERIFICAR CONFIGURAÇÃO
-- ========================================

SELECT 
    '✅ SISTEMA DE BRANDING CONFIGURADO' as status,
    'Logo ERA Learn configurado como: ' || logo_url as logo_config,
    'Cores: ' || primary_color || ' / ' || secondary_color as cores,
    'Empresa: ' || company_name as empresa
FROM branding_config
ORDER BY created_at DESC
LIMIT 1;
