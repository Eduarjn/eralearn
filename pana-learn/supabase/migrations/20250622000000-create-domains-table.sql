-- Criar tabela domains
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos os usuários autenticados podem ler)
CREATE POLICY "Allow read for authenticated users"
ON domains
FOR SELECT
USING (auth.role() = 'authenticated');

-- Políticas para admin_master (apenas admin_master pode inserir, atualizar e deletar)
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

-- Inserir alguns domínios de exemplo
INSERT INTO domains (name, description, created_by) VALUES
('cliente1.com', 'Cliente 1 - Empresa de Tecnologia', (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)),
('cliente2.com', 'Cliente 2 - Consultoria Empresarial', (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)),
('cliente3.com', 'Cliente 3 - Indústria Manufatureira', (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)); 