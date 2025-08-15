-- Script para criar usuário admin_master e testar permissões de domínios

-- 1. Criar usuário admin_master (se não existir)
INSERT INTO usuarios (id, email, nome, tipo_usuario, status, data_criacao, data_atualizacao)
VALUES (
  gen_random_uuid(),
  'admin_master@eralearn.com',
  'Administrador Master',
  'admin_master',
  'ativo',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Verificar se o usuário foi criado
SELECT id, email, nome, tipo_usuario, status 
FROM usuarios 
WHERE email = 'admin_master@eralearn.com';

-- 3. Testar inserção de domínio (execute como admin_master)
-- Substitua 'USER_ID_AQUI' pelo ID do usuário admin_master criado acima
INSERT INTO domains (name, description, created_by) 
VALUES (
  'novo-cliente.com',
  'Novo Cliente - Empresa de Tecnologia',
  (SELECT id FROM usuarios WHERE email = 'admin_master@eralearn.com')
);

-- 4. Verificar se o domínio foi criado
SELECT * FROM domains ORDER BY created_at DESC;

-- 5. Testar atualização de domínio
UPDATE domains 
SET description = 'Novo Cliente - Empresa de Tecnologia (Atualizado)'
WHERE name = 'novo-cliente.com';

-- 6. Verificar permissões RLS
-- Esta query deve retornar apenas os domínios se o usuário for admin_master
SELECT 
  d.*,
  u.nome as criado_por_nome,
  u.tipo_usuario as criado_por_tipo
FROM domains d
LEFT JOIN usuarios u ON d.created_by = u.id
ORDER BY d.created_at DESC; 