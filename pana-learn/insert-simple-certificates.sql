-- Inserir certificados de teste (SIMPLES E SEGURO)
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se há usuários disponíveis
SELECT id, email FROM auth.users LIMIT 3;

-- 2. Inserir certificados de teste (sem dependências complexas)
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
) VALUES 
-- Certificado 1 - PABX
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'PABX',
    85,
    'CERT-2024-001',
    'ativo',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
),
-- Certificado 2 - Call Center
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'CALLCENTER',
    92,
    'CERT-2024-002',
    'ativo',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
),
-- Certificado 3 - VoIP
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'VOIP',
    78,
    'CERT-2024-003',
    'ativo',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
),
-- Certificado 4 - Revogado
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'PABX',
    65,
    'CERT-2024-004',
    'revogado',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days'
),
-- Certificado 5 - Expirado
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'CALLCENTER',
    88,
    'CERT-2024-005',
    'expirado',
    NOW() - INTERVAL '400 days',
    NOW() - INTERVAL '400 days',
    NOW() - INTERVAL '400 days'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se os certificados foram inseridos
SELECT 
    id,
    usuario_id,
    categoria,
    nota_final,
    status,
    data_emissao,
    numero_certificado
FROM certificados 
ORDER BY data_emissao DESC;

-- 4. Contar total de certificados
SELECT COUNT(*) as total_certificados FROM certificados; 