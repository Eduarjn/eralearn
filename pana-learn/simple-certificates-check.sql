-- Verificação simples da tabela certificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'certificados'
) as tabela_existe;

-- 2. Verificar estrutura básica
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'certificados' 
ORDER BY ordinal_position;

-- 3. Verificar se há dados
SELECT COUNT(*) as total_certificados FROM certificados;

-- 4. Verificar alguns registros
SELECT 
    id,
    usuario_id,
    categoria,
    nota_final,
    status,
    data_emissao
FROM certificados 
LIMIT 3;

-- 5. Se não houver dados, inserir um certificado simples
INSERT INTO certificados (
    id,
    usuario_id,
    categoria,
    nota_final,
    numero_certificado,
    status,
    data_emissao,
    data_criacao,
    data_atualizacao
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'PABX',
    85,
    'CERT-TEST-001',
    'ativo',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Verificar novamente
SELECT COUNT(*) as total_apos_insercao FROM certificados; 