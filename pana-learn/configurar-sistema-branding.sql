-- Script para configurar o sistema de branding completo
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. CRIAR TABELA DE BRANDING
-- ========================================

SELECT '=== CRIANDO TABELA BRANDING ===' as info;

-- Criar tabela de configurações de branding
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

SELECT '=== INSERINDO CONFIGURAÇÃO PADRÃO ===' as info;

-- Inserir configuração padrão do ERA Learn
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
    
    -- Política para INSERT - Apenas admins podem inserir
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding_config' AND policyname = 'Apenas admins podem inserir branding') THEN
        CREATE POLICY "Apenas admins podem inserir branding" ON branding_config
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM usuarios 
                    WHERE user_id = auth.uid() 
                    AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política INSERT criada para branding_config';
    ELSE
        RAISE NOTICE 'Política INSERT já existe para branding_config';
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
    
    -- Política para DELETE - Apenas admins podem deletar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding_config' AND policyname = 'Apenas admins podem deletar branding') THEN
        CREATE POLICY "Apenas admins podem deletar branding" ON branding_config
            FOR DELETE USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM usuarios 
                    WHERE user_id = auth.uid() 
                    AND tipo_usuario IN ('admin', 'admin_master')
                )
            );
        RAISE NOTICE 'Política DELETE criada para branding_config';
    ELSE
        RAISE NOTICE 'Política DELETE já existe para branding_config';
    END IF;
END $$;

-- ========================================
-- 4. CRIAR FUNÇÃO PARA ATUALIZAR BRANDING
-- ========================================

SELECT '=== CRIANDO FUNÇÃO DE ATUALIZAÇÃO ===' as info;

-- Função para atualizar configurações de branding
CREATE OR REPLACE FUNCTION update_branding_config(
    p_logo_url TEXT DEFAULT NULL,
    p_sub_logo_url TEXT DEFAULT NULL,
    p_favicon_url TEXT DEFAULT NULL,
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
-- 5. CRIAR FUNÇÃO PARA OBTER BRANDING
-- ========================================

SELECT '=== CRIANDO FUNÇÃO DE CONSULTA ===' as info;

-- Função para obter configurações de branding
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
-- 6. VERIFICAR CONFIGURAÇÃO
-- ========================================

SELECT '=== VERIFICANDO CONFIGURAÇÃO ===' as info;

SELECT 
    id,
    logo_url,
    sub_logo_url,
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
-- 7. VERIFICAÇÃO FINAL
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
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'update_branding_config'
        ) THEN '✅ FUNÇÃO UPDATE CRIADA'
        ELSE '❌ FUNÇÃO UPDATE PENDENTE'
    END as status_funcao_update,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_branding_config'
        ) THEN '✅ FUNÇÃO GET CRIADA'
        ELSE '❌ FUNÇÃO GET PENDENTE'
    END as status_funcao_get;

-- ========================================
-- 8. TESTE DE FUNCIONAMENTO
-- ========================================

SELECT '=== TESTE DE FUNCIONAMENTO ===' as info;

-- Testar função de consulta
SELECT get_branding_config() as teste_consulta;

-- ========================================
-- 9. INSTRUÇÕES FINAIS
-- ========================================

SELECT '=== INSTRUÇÕES FINAIS ===' as info;

SELECT 
    '✅ SISTEMA DE BRANDING CONFIGURADO' as status,
    'O sistema agora suporta upload e configuração de logos via interface' as mensagem,
    'Teste a funcionalidade na página de configurações' as proximo_passo; 