-- Inserir certificados de teste
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar se há usuários disponíveis
SELECT id, email, raw_user_meta_data FROM auth.users LIMIT 5;

-- Verificar se há cursos disponíveis
SELECT id, nome, categoria FROM cursos LIMIT 5;

-- Verificar se há quizzes disponíveis
SELECT id, titulo, categoria FROM quizzes LIMIT 5;

-- Inserir certificados de teste
INSERT INTO certificados (
    id,
    usuario_id,
    curso_id,
    categoria,
    quiz_id,
    nota_final,
    link_pdf_certificado,
    numero_certificado,
    qr_code_url,
    status,
    data_emissao,
    data_criacao,
    data_atualizacao
) VALUES 
-- Certificado 1 - PABX
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM cursos WHERE categoria = 'PABX' LIMIT 1),
    'PABX',
    (SELECT id FROM quizzes WHERE categoria = 'PABX' LIMIT 1),
    85,
    'https://exemplo.com/certificado1.pdf',
    'CERT-2024-001',
    'https://exemplo.com/qr1.png',
    'ativo',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
),
-- Certificado 2 - Call Center
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM cursos WHERE categoria = 'CALLCENTER' LIMIT 1),
    'CALLCENTER',
    (SELECT id FROM quizzes WHERE categoria = 'CALLCENTER' LIMIT 1),
    92,
    'https://exemplo.com/certificado2.pdf',
    'CERT-2024-002',
    'https://exemplo.com/qr2.png',
    'ativo',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
),
-- Certificado 3 - VoIP
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM cursos WHERE categoria = 'VOIP' LIMIT 1),
    'VOIP',
    (SELECT id FROM quizzes WHERE categoria = 'VOIP' LIMIT 1),
    78,
    'https://exemplo.com/certificado3.pdf',
    'CERT-2024-003',
    'https://exemplo.com/qr3.png',
    'ativo',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
),
-- Certificado 4 - Revogado
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM cursos WHERE categoria = 'PABX' LIMIT 1),
    'PABX',
    (SELECT id FROM quizzes WHERE categoria = 'PABX' LIMIT 1),
    65,
    'https://exemplo.com/certificado4.pdf',
    'CERT-2024-004',
    'https://exemplo.com/qr4.png',
    'revogado',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days'
),
-- Certificado 5 - Expirado
(
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM cursos WHERE categoria = 'CALLCENTER' LIMIT 1),
    'CALLCENTER',
    (SELECT id FROM quizzes WHERE categoria = 'CALLCENTER' LIMIT 1),
    88,
    'https://exemplo.com/certificado5.pdf',
    'CERT-2024-005',
    'https://exemplo.com/qr5.png',
    'expirado',
    NOW() - INTERVAL '400 days',
    NOW() - INTERVAL '400 days',
    NOW() - INTERVAL '400 days'
)
ON CONFLICT (id) DO NOTHING;

-- Verificar se os certificados foram inseridos
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