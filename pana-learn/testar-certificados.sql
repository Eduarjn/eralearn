-- Script para testar e inserir certificados de exemplo
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se existem certificados
SELECT 
  c.id,
  c.numero_certificado,
  c.categoria,
  c.nota_final,
  c.status,
  c.data_emissao,
  u.nome as usuario_nome,
  cur.nome as curso_nome
FROM certificados c
LEFT JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN cursos cur ON c.curso_id = cur.id
ORDER BY c.data_emissao DESC
LIMIT 10;

-- 2. Verificar usuários disponíveis
SELECT id, nome, email, tipo_usuario FROM usuarios LIMIT 5;

-- 3. Verificar cursos disponíveis
SELECT id, nome, categoria FROM cursos LIMIT 5;

-- 4. Inserir certificados de teste (descomente se necessário)
/*
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
(
  gen_random_uuid(),
  (SELECT id FROM usuarios LIMIT 1),
  (SELECT id FROM cursos WHERE categoria = 'PABX' LIMIT 1),
  'PABX',
  gen_random_uuid(),
  85,
  'https://example.com/certificado1.pdf',
  'CERT-2024-001',
  'https://example.com/qr1.png',
  'ativo',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM usuarios LIMIT 1),
  (SELECT id FROM cursos WHERE categoria = 'OMNICHANNEL' LIMIT 1),
  'OMNICHANNEL',
  gen_random_uuid(),
  92,
  'https://example.com/certificado2.pdf',
  'CERT-2024-002',
  'https://example.com/qr2.png',
  'ativo',
  NOW(),
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM usuarios LIMIT 1),
  (SELECT id FROM cursos WHERE categoria = 'CALLCENTER' LIMIT 1),
  'CALLCENTER',
  gen_random_uuid(),
  78,
  'https://example.com/certificado3.pdf',
  'CERT-2024-003',
  'https://example.com/qr3.png',
  'ativo',
  NOW(),
  NOW(),
  NOW()
);
*/

-- 5. Contar total de certificados
SELECT COUNT(*) as total_certificados FROM certificados;

-- 6. Contar por status
SELECT 
  status,
  COUNT(*) as quantidade
FROM certificados 
GROUP BY status;

-- 7. Contar por categoria
SELECT 
  categoria,
  COUNT(*) as quantidade
FROM certificados 
GROUP BY categoria;
