-- Verificar se as colunas de configuração existem na tabela certificados
-- Execute este script no Supabase SQL Editor

-- Verificar estrutura atual da tabela certificados
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificados' 
ORDER BY ordinal_position;

-- Verificar se as colunas de configuração específicas existem
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND column_name IN (
    'template_html',
    'validade_dias',
    'qr_code_enabled',
    'assinatura_enabled',
    'logo_url',
    'cor_primaria',
    'fonte',
    'alinhamento',
    'layout_config'
)
ORDER BY column_name;

-- Verificar se há dados na tabela certificados
SELECT COUNT(*) as total_certificados FROM certificados;

-- Verificar alguns registros de exemplo
SELECT 
    id,
    usuario_id,
    categoria,
    nota_final,
    status,
    data_emissao
FROM certificados 
LIMIT 5; 