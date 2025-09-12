-- Script para verificar e corrigir configuração do branding
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR SE A TABELA EXISTE
-- ========================================

SELECT '=== VERIFICANDO TABELA BRANDING_CONFIG ===' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'branding_config';

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
-- 3. VERIFICAR ESTRUTURA DA TABELA
-- ========================================

SELECT '=== ESTRUTURA DA TABELA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'branding_config'
ORDER BY ordinal_position;

-- ========================================
-- 4. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT '=== DADOS EXISTENTES ===' as info;

SELECT * FROM branding_config ORDER BY created_at DESC;

-- ========================================
-- 5. INSERIR CONFIGURAÇÃO PADRÃO SE NÃO EXISTIR
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
-- 6. HABILITAR RLS
-- ========================================

SELECT '=== HABILITANDO RLS ===' as info;

ALTER TABLE branding_config ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. CRIAR POLÍTICAS RLS
-- ========================================

SELECT '=== CRIANDO POLÍTICAS RLS ===' as info;

-- Política para SELECT - Todos podem ver configurações de branding
DROP POLICY IF EXISTS "Todos podem ver branding" ON branding_config;
CREATE POLICY "Todos podem ver branding" ON branding_config
    FOR SELECT USING (true);

-- Política para INSERT - Apenas admins podem inserir
DROP POLICY IF EXISTS "Apenas admins podem inserir branding" ON branding_config;
CREATE POLICY "Apenas admins podem inserir branding" ON branding_config
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'admin'
        )
    );

-- Política para UPDATE - Apenas admins podem atualizar
DROP POLICY IF EXISTS "Apenas admins podem atualizar branding" ON branding_config;
CREATE POLICY "Apenas admins podem atualizar branding" ON branding_config
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'admin'
        )
    );

-- Política para DELETE - Apenas admins podem deletar
DROP POLICY IF EXISTS "Apenas admins podem deletar branding" ON branding_config;
CREATE POLICY "Apenas admins podem deletar branding" ON branding_config
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'admin'
        )
    );

-- ========================================
-- 8. CRIAR FUNÇÃO PARA ATUALIZAR BRANDING
-- ========================================

SELECT '=== CRIANDO FUNÇÃO DE ATUALIZAÇÃO ===' as info;

CREATE OR REPLACE FUNCTION update_branding_config(
    p_logo_url TEXT DEFAULT NULL,
    p_sub_logo_url TEXT DEFAULT NULL,
    p_favicon_url TEXT DEFAULT NULL,
    p_background_url TEXT DEFAULT NULL,
    p_primary_color TEXT DEFAULT NULL,
    p_secondary_color TEXT DEFAULT NULL,
    p_company_name TEXT DEFAULT NULL,
    p_company_slogan TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Atualizar configurações
    UPDATE branding_config 
    SET 
        logo_url = COALESCE(p_logo_url, logo_url),
        sub_logo_url = COALESCE(p_sub_logo_url, sub_logo_url),
        favicon_url = COALESCE(p_favicon_url, favicon_url),
        background_url = COALESCE(p_background_url, background_url),
        primary_color = COALESCE(p_primary_color, primary_color),
        secondary_color = COALESCE(p_secondary_color, secondary_color),
        company_name = COALESCE(p_company_name, company_name),
        company_slogan = COALESCE(p_company_slogan, company_slogan),
        updated_at = NOW()
    WHERE id = (SELECT id FROM branding_config ORDER BY created_at DESC LIMIT 1);
    
    -- Retornar configurações atualizadas
    SELECT json_build_object(
        'success', true,
        'message', 'Configurações atualizadas com sucesso',
        'data', row_to_json(bc)
    ) INTO result
    FROM branding_config bc
    WHERE bc.id = (SELECT id FROM branding_config ORDER BY created_at DESC LIMIT 1);
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao atualizar configurações: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. CRIAR FUNÇÃO PARA OBTER BRANDING
-- ========================================

SELECT '=== CRIANDO FUNÇÃO DE CONSULTA ===' as info;

CREATE OR REPLACE FUNCTION get_branding_config() RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'success', true,
        'data', row_to_json(bc)
    ) INTO result
    FROM branding_config bc
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erro ao obter configurações: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. VERIFICAR CONFIGURAÇÃO FINAL
-- ========================================

SELECT '=== CONFIGURAÇÃO FINAL ===' as info;

SELECT 
    'Tabela criada' as status,
    COUNT(*) as total_registros
FROM branding_config;

SELECT 
    'Políticas RLS' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'branding_config';

SELECT 
    'Funções criadas' as status,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE proname IN ('update_branding_config', 'get_branding_config');

-- ========================================
-- 11. TESTAR FUNÇÕES
-- ========================================

SELECT '=== TESTANDO FUNÇÕES ===' as info;

-- Testar função de consulta
SELECT get_branding_config() as resultado_consulta;

-- Testar função de atualização (apenas se for admin)
-- SELECT update_branding_config(
--     p_company_name := 'ERA Learn Teste'
-- ) as resultado_atualizacao;



















