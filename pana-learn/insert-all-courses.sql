-- Script para inserir todos os cursos da plataforma
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar dados existentes
SELECT 'Verificando dados existentes...' as info;
SELECT COUNT(*) as total_cursos FROM cursos;
SELECT COUNT(*) as total_categorias FROM categorias;

-- 2. Inserir categorias (se não existirem)
INSERT INTO categorias (nome, descricao, cor) 
VALUES 
  ('PABX', 'Treinamentos sobre sistemas PABX e telefonia empresarial', '#3B82F6'),
  ('CALLCENTER', 'Treinamentos sobre sistemas de call center', '#6366F1'),
  ('VoIP', 'Treinamentos sobre tecnologias VoIP', '#8B5CF6'),
  ('Omnichannel', 'Treinamentos sobre plataformas Omnichannel', '#10B981')
ON CONFLICT (nome) DO NOTHING;

-- 3. Inserir todos os cursos (se não existirem)
INSERT INTO public.cursos (nome, categoria, descricao, status, ordem) 
VALUES 
  ('Fundamentos de PABX', 'PABX', 'Curso introdutório sobre sistemas PABX e suas funcionalidades básicas', 'ativo', 1),
  ('Fundamentos CALLCENTER', 'CALLCENTER', 'Introdução aos sistemas de call center e suas funcionalidades', 'ativo', 2),
  ('Configurações Avançadas PABX', 'PABX', 'Configurações avançadas para otimização do sistema PABX', 'ativo', 3),
  ('OMNICHANNEL para Empresas', 'Omnichannel', 'Implementação de soluções omnichannel em ambientes empresariais', 'ativo', 4),
  ('Configurações Avançadas OMNI', 'Omnichannel', 'Configurações avançadas para sistemas omnichannel', 'ativo', 5),
  ('Configuração VoIP Avançada', 'VoIP', 'Configurações avançadas para sistemas VoIP corporativos', 'ativo', 6),
  ('Telefonia Básica', 'PABX', 'Conceitos fundamentais de telefonia e comunicação', 'ativo', 7),
  ('Sistemas de Call Center Modernos', 'CALLCENTER', 'Implementação e gestão de call centers modernos', 'ativo', 8)
ON CONFLICT (nome) DO NOTHING;

-- 4. Verificar resultado
SELECT 'Verificando resultado...' as info;
SELECT 
  c.nome as curso,
  c.categoria,
  c.status,
  c.ordem
FROM cursos c
ORDER BY c.ordem;

-- 5. Contar cursos por categoria
SELECT 
  categoria,
  COUNT(*) as total_cursos
FROM cursos 
WHERE status = 'ativo'
GROUP BY categoria
ORDER BY categoria;

-- 6. Verificar se as políticas RLS estão funcionando
SELECT 'Testando políticas RLS...' as info;
-- Esta consulta deve retornar dados se as políticas RLS estiverem corretas
SELECT COUNT(*) as cursos_visiveis FROM cursos WHERE status = 'ativo'; 