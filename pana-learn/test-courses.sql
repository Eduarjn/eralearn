-- Script para testar e inserir dados de cursos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há dados existentes
SELECT 'Verificando dados existentes...' as info;
SELECT COUNT(*) as total_cursos FROM cursos;
SELECT COUNT(*) as total_categorias FROM categorias;

-- 2. Verificar estrutura das tabelas
SELECT 'Verificando estrutura da tabela cursos...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cursos' 
ORDER BY ordinal_position;

-- 3. Inserir categorias de teste (se não existirem)
INSERT INTO categorias (nome, descricao, cor) 
VALUES 
  ('PABX', 'Treinamentos sobre sistemas PABX', '#3B82F6'),
  ('VoIP', 'Treinamentos sobre tecnologias VoIP', '#10B981'),
  ('Omnichannel', 'Treinamentos sobre plataformas Omnichannel', '#8B5CF6'),
  ('CALLCENTER', 'Treinamentos sobre sistemas de call center', '#F59E0B'),
  ('Básico', 'Treinamentos de nível básico', '#6B7280'),
  ('Intermediário', 'Treinamentos de nível intermediário', '#4B5563')
ON CONFLICT (nome) DO NOTHING;

-- 4. Inserir cursos de exemplo (se não existirem)
INSERT INTO public.cursos (nome, categoria, descricao, status, ordem) 
VALUES 
  ('Fundamentos de PABX', 'PABX', 'Curso introdutório sobre sistemas PABX e suas funcionalidades básicas', 'ativo', 1),
  ('Fundamentos CALLCENTER', 'CALLCENTER', 'Introdução aos sistemas de call center e suas funcionalidades', 'ativo', 2),
  ('Configurações Avançadas PABX', 'PABX', 'Configurações avançadas para otimização do sistema PABX', 'ativo', 3),
  ('OMNICHANNEL para Empresas', 'Omnichannel', 'Implementação de soluções omnichannel em ambientes empresariais', 'ativo', 4),
  ('Configurações Avançadas OMNI', 'Omnichannel', 'Configurações avançadas para sistemas omnichannel', 'ativo', 5),
  ('Configuração VoIP Avançada', 'VoIP', 'Configurações avançadas para sistemas VoIP corporativos', 'ativo', 6),
  ('Telefonia Básica', 'Básico', 'Conceitos fundamentais de telefonia e comunicação', 'ativo', 7),
  ('Sistemas de Comunicação', 'Intermediário', 'Sistemas intermediários de comunicação empresarial', 'ativo', 8)
ON CONFLICT (nome) DO NOTHING;

-- 5. Verificar dados inseridos
SELECT 'Verificando dados após inserção...' as info;
SELECT 
  c.id,
  c.nome,
  c.categoria,
  c.status,
  c.ordem,
  cat.nome as categoria_nome,
  cat.cor as categoria_cor
FROM cursos c
LEFT JOIN categorias cat ON c.categoria = cat.nome
ORDER BY c.ordem;

-- 6. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('cursos', 'categorias')
ORDER BY tablename, policyname;

-- 7. Testar consulta com RLS
SELECT 'Testando consulta com RLS...' as info;
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE status = 'ativo'
ORDER BY ordem; 