-- Migration corrigida para criar tabela domains
-- Execute este arquivo no Supabase SQL Editor

-- 1. Criar tabela domains
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Ativar RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow read for authenticated users" ON domains;
DROP POLICY IF EXISTS "Allow admin_master insert" ON domains;
DROP POLICY IF EXISTS "Allow admin_master update" ON domains;
DROP POLICY IF EXISTS "Allow admin_master delete" ON domains;

-- 4. Criar políticas RLS
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

-- 5. Verificar se a tabela foi criada
SELECT 'Tabela domains criada com sucesso!' as status; 