-- ========================================
-- SCRIPT PARA CARREGAR BANCO MANUALMENTE
-- ========================================
-- Execute este script no HeidiSQL após conectar

-- 1. PRIMEIRO: Execute o schema (01-schema.sql)
-- 2. DEPOIS: Execute este script com dados

-- Verificar se tabelas foram criadas
SELECT COUNT(*) as total_tabelas 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Se retornar 0, execute primeiro o 01-schema.sql

-- ========================================
-- DADOS ESSENCIAIS PARA TESTE
-- ========================================

-- Domínio padrão
INSERT INTO domains (id, nome, subdominio, ativo) VALUES 
('11111111-1111-1111-1111-111111111111', 'ERA Learn Principal', 'default', true)
ON CONFLICT (id) DO NOTHING;

-- Usuário admin para teste
INSERT INTO usuarios (id, email, nome, tipo_usuario, senha_hash, domain_id, ativo) VALUES 
('33333333-3333-3333-3333-333333333333', 'admin@test.com', 'Admin Teste', 'admin_master', 
 '$2b$12$rQJ8kHgzI8y8y8y8y8y8yeDqJ8kHgzI8y8y8y8y8yeDqJ8kHgzI8y', 
 '11111111-1111-1111-1111-111111111111', true)
ON CONFLICT (email) DO NOTHING;

-- Curso de exemplo
INSERT INTO cursos (id, nome, descricao, categoria, ativo, domain_id) VALUES 
('66666666-6666-6666-6666-666666666666', 'Curso Teste', 'Curso para testar HeidiSQL', 'TESTE', true, 
 '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Verificar dados inseridos
SELECT 'Domínios' as tabela, COUNT(*) as registros FROM domains
UNION ALL
SELECT 'Usuários' as tabela, COUNT(*) as registros FROM usuarios  
UNION ALL
SELECT 'Cursos' as tabela, COUNT(*) as registros FROM cursos;

-- ========================================
-- CONSULTAS ÚTEIS PARA TESTE
-- ========================================

-- Ver estrutura das tabelas principais
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('usuarios', 'cursos', 'videos', 'quizzes')
ORDER BY table_name, ordinal_position;

-- Ver dados dos usuários
SELECT id, email, nome, tipo_usuario, ativo, created_at 
FROM usuarios;


















