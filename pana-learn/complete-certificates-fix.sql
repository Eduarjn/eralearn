-- Script Completo para Corrigir e Inserir Certificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar a estrutura atual da tabela certificados
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificados' 
ORDER BY ordinal_position;

-- 2. Verificar as constraints da tabela certificados
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'certificados'::regclass;

-- 3. Remover a constraint única problemática (se existir)
DO $$
BEGIN
    -- Verificar se a constraint existe antes de tentar removê-la
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'certificados_usuario_id_categoria_key'
    ) THEN
        ALTER TABLE certificados DROP CONSTRAINT certificados_usuario_id_categoria_key;
        RAISE NOTICE 'Constraint certificados_usuario_id_categoria_key removida';
    ELSE
        RAISE NOTICE 'Constraint certificados_usuario_id_categoria_key não encontrada';
    END IF;
END $$;

-- 4. Verificar se há usuários disponíveis
SELECT id, email FROM auth.users LIMIT 3;

-- 5. Limpar certificados existentes (opcional - descomente se quiser começar do zero)
-- DELETE FROM certificados;

-- 6. Inserir certificados de teste com usuários diferentes
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
-- Certificado 1 - PABX (usuário 1)
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
-- Certificado 2 - Call Center (usuário 1)
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
-- Certificado 3 - VoIP (usuário 1)
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
-- Certificado 4 - PABX Revogado (usuário 2, se existir)
(
    gen_random_uuid(),
    (SELECT id FROM auth.users OFFSET 1 LIMIT 1),
    'PABX',
    65,
    'CERT-2024-004',
    'revogado',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days'
),
-- Certificado 5 - Call Center Expirado (usuário 2, se existir)
(
    gen_random_uuid(),
    (SELECT id FROM auth.users OFFSET 1 LIMIT 1),
    'CALLCENTER',
    88,
    'CERT-2024-005',
    'expirado',
    NOW() - INTERVAL '400 days',
    NOW() - INTERVAL '400 days',
    NOW() - INTERVAL '400 days'
),
-- Certificado 6 - PABX Avançado (usuário 3, se existir)
(
    gen_random_uuid(),
    (SELECT id FROM auth.users OFFSET 2 LIMIT 1),
    'PABX',
    95,
    'CERT-2024-006',
    'ativo',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
-- Certificado 7 - VoIP Intermediário (usuário 1, categoria diferente)
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'OMNICHANNEL',
    82,
    'CERT-2024-007',
    'ativo',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
-- Certificado 8 - Call Center Especializado (usuário 1, categoria diferente)
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'CRM',
    91,
    'CERT-2024-008',
    'ativo',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Verificar se os certificados foram inseridos
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

-- 8. Contar total de certificados
SELECT COUNT(*) as total_certificados FROM certificados;

-- 9. Verificar certificados por categoria
SELECT 
    categoria,
    COUNT(*) as total,
    AVG(nota_final) as media_nota
FROM certificados 
GROUP BY categoria 
ORDER BY total DESC;

-- 10. Verificar certificados por status
SELECT 
    status,
    COUNT(*) as total
FROM certificados 
GROUP BY status 
ORDER BY total DESC; 