-- ========================================
-- VERIFICAR E CRIAR CERTIFICADOS DE TESTE
-- ========================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- para verificar se a tabela de certificados existe e criar dados de teste

-- ========================================
-- 1. VERIFICAR SE A TABELA EXISTE
-- ========================================

SELECT 'Verificando tabela certificados...' as info;

SELECT 
    table_name,
    '✅ EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'certificados';

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA
-- ========================================

SELECT 'Verificando estrutura da tabela...' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'certificados'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR DADOS EXISTENTES
-- ========================================

SELECT 'Verificando dados existentes...' as info;

SELECT COUNT(*) as total_certificados FROM public.certificados;

SELECT 
    id,
    usuario_id,
    categoria,
    categoria_nome,
    nota,
    data_emissao,
    status
FROM public.certificados 
ORDER BY data_emissao DESC 
LIMIT 5;

-- ========================================
-- 4. VERIFICAR USUÁRIOS EXISTENTES
-- ========================================

SELECT 'Verificando usuários existentes...' as info;

SELECT 
    id,
    nome,
    email,
    tipo_usuario
FROM public.usuarios 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- 5. CRIAR CERTIFICADOS DE TESTE (SE NECESSÁRIO)
-- ========================================

-- Verificar se há usuários para criar certificados
DO $$
DECLARE
    user_count INTEGER;
    cert_count INTEGER;
BEGIN
    -- Contar usuários
    SELECT COUNT(*) INTO user_count FROM public.usuarios;
    
    -- Contar certificados
    SELECT COUNT(*) INTO cert_count FROM public.certificados;
    
    RAISE NOTICE 'Usuários encontrados: %', user_count;
    RAISE NOTICE 'Certificados existentes: %', cert_count;
    
    -- Se não há certificados e há usuários, criar alguns de teste
    IF cert_count = 0 AND user_count > 0 THEN
        RAISE NOTICE 'Criando certificados de teste...';
        
        -- Criar certificados para os primeiros usuários
        INSERT INTO public.certificados (
            usuario_id,
            categoria,
            categoria_nome,
            nota,
            data_conclusao,
            data_emissao,
            numero_certificado,
            status
        )
        SELECT 
            u.id,
            'pabx_fundamentos',
            'Fundamentos de PABX',
            95,
            NOW() - INTERVAL '1 day',
            NOW(),
            'TEST-PABX-' || LPAD(ROW_NUMBER() OVER()::text, 4, '0'),
            'ativo'
        FROM public.usuarios u
        WHERE u.tipo_usuario = 'cliente'
        LIMIT 3;
        
        -- Criar certificados para diferentes categorias
        INSERT INTO public.certificados (
            usuario_id,
            categoria,
            categoria_nome,
            nota,
            data_conclusao,
            data_emissao,
            numero_certificado,
            status
        )
        SELECT 
            u.id,
            'callcenter_fundamentos',
            'Fundamentos CALLCENTER',
            88,
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '1 day',
            'TEST-CALL-' || LPAD(ROW_NUMBER() OVER()::text, 4, '0'),
            'ativo'
        FROM public.usuarios u
        WHERE u.tipo_usuario = 'cliente'
        LIMIT 2;
        
        RAISE NOTICE 'Certificados de teste criados com sucesso!';
    ELSE
        RAISE NOTICE 'Certificados já existem ou não há usuários para criar certificados.';
    END IF;
END $$;

-- ========================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ========================================

SELECT 'Verificando políticas RLS...' as info;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'certificados'
ORDER BY policyname;

-- ========================================
-- 7. VERIFICAR RESULTADO FINAL
-- ========================================

SELECT 'Verificando resultado final...' as info;

SELECT COUNT(*) as total_certificados_final FROM public.certificados;

SELECT 
    categoria,
    COUNT(*) as quantidade,
    AVG(nota) as media_nota
FROM public.certificados 
GROUP BY categoria
ORDER BY quantidade DESC;

-- ========================================
-- 8. RESUMO
-- ========================================

SELECT 
    '🎉 VERIFICAÇÃO CONCLUÍDA' as status,
    (SELECT COUNT(*) FROM public.certificados) as total_certificados,
    (SELECT COUNT(*) FROM public.usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'certificados') as total_politicas_rls;
