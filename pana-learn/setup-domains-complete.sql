-- Script completo de setup para funcionalidade de Domínios
-- Execute este arquivo no Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR ESTRUTURA EXISTENTE
-- ========================================

-- Verificar se a tabela usuarios existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        RAISE EXCEPTION 'Tabela usuarios não encontrada. Execute as migrations anteriores primeiro.';
    END IF;
END $$;

-- Verificar se o enum user_type inclui admin_master
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'admin_master' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')
    ) THEN
        -- Adicionar admin_master ao enum se não existir
        ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'admin_master';
        RAISE NOTICE 'admin_master adicionado ao enum user_type';
    END IF;
END $$;

-- ========================================
-- 2. CRIAR TABELA DOMAINS
-- ========================================

-- Criar tabela domains se não existir
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 3. CONFIGURAR RLS
-- ========================================

-- Ativar RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow read for authenticated users" ON domains;
DROP POLICY IF EXISTS "Allow admin_master insert" ON domains;
DROP POLICY IF EXISTS "Allow admin_master update" ON domains;
DROP POLICY IF EXISTS "Allow admin_master delete" ON domains;

-- Criar políticas RLS
CREATE POLICY "Allow read for authenticated users"
ON domains
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin_master insert"
ON domains
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin_master'
  )
);

CREATE POLICY "Allow admin_master update"
ON domains
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin_master'
  )
);

CREATE POLICY "Allow admin_master delete"
ON domains
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin_master'
  )
);

-- ========================================
-- 4. CRIAR USUÁRIO ADMIN MASTER
-- ========================================

-- Criar usuário admin_master se não existir
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

-- ========================================
-- 5. INSERIR DADOS DE EXEMPLO
-- ========================================

-- Inserir domínios de exemplo apenas se não existirem
INSERT INTO domains (name, description, created_by) 
SELECT 
  'cliente1.com',
  'Cliente 1 - Empresa de Tecnologia',
  (SELECT id FROM usuarios WHERE email = 'admin_master@eralearn.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM domains WHERE name = 'cliente1.com');

INSERT INTO domains (name, description, created_by) 
SELECT 
  'cliente2.com',
  'Cliente 2 - Consultoria Empresarial',
  (SELECT id FROM usuarios WHERE email = 'admin_master@eralearn.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM domains WHERE name = 'cliente2.com');

INSERT INTO domains (name, description, created_by) 
SELECT 
  'cliente3.com',
  'Cliente 3 - Indústria Manufatureira',
  (SELECT id FROM usuarios WHERE email = 'admin_master@eralearn.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM domains WHERE name = 'cliente3.com');

-- ========================================
-- 6. VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'Setup concluído com sucesso!' as status,
  (SELECT COUNT(*) FROM domains) as total_domains,
  (SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'admin_master') as admin_masters;

-- Mostrar usuário admin_master criado
SELECT 
  id,
  email,
  nome,
  tipo_usuario,
  status
FROM usuarios 
WHERE tipo_usuario = 'admin_master';

-- Mostrar domínios criados
SELECT 
  id,
  name,
  description,
  created_at
FROM domains 
ORDER BY created_at DESC; 