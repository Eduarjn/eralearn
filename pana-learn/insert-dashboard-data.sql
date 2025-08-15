-- Script para inserir dados de exemplo no dashboard
-- Execute este script no Supabase SQL Editor para popular o dashboard com dados reais

-- 1. Inserir usuários de exemplo
INSERT INTO usuarios (id, email, nome, tipo_usuario, status, created_at) VALUES
('user-1', 'maria.silva@example.com', 'Maria Silva', 'cliente', 'ativo', NOW() - INTERVAL '30 days'),
('user-2', 'joao.santos@example.com', 'João Santos', 'cliente', 'ativo', NOW() - INTERVAL '25 days'),
('user-3', 'pedro.costa@example.com', 'Pedro Costa', 'cliente', 'ativo', NOW() - INTERVAL '20 days'),
('user-4', 'ana.oliveira@example.com', 'Ana Oliveira', 'cliente', 'ativo', NOW() - INTERVAL '15 days'),
('user-5', 'carlos.rodrigues@example.com', 'Carlos Rodrigues', 'cliente', 'ativo', NOW() - INTERVAL '10 days'),
('user-6', 'lucia.ferreira@example.com', 'Lúcia Ferreira', 'cliente', 'ativo', NOW() - INTERVAL '5 days'),
('user-7', 'roberto.almeida@example.com', 'Roberto Almeida', 'cliente', 'ativo', NOW() - INTERVAL '3 days'),
('user-8', 'fernanda.lima@example.com', 'Fernanda Lima', 'cliente', 'ativo', NOW() - INTERVAL '2 days'),
('user-9', 'gabriel.souza@example.com', 'Gabriel Souza', 'cliente', 'ativo', NOW() - INTERVAL '1 day'),
('user-10', 'juliana.martins@example.com', 'Juliana Martins', 'cliente', 'ativo', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir categorias de exemplo
INSERT INTO categorias (id, nome, descricao, status, created_at) VALUES
('cat-1', 'React Fundamentals', 'Fundamentos do React.js', 'ativo', NOW() - INTERVAL '60 days'),
('cat-2', 'JavaScript ES6+', 'JavaScript moderno com ES6+', 'ativo', NOW() - INTERVAL '55 days'),
('cat-3', 'PABX Básico', 'Sistemas de telefonia PABX', 'ativo', NOW() - INTERVAL '50 days'),
('cat-4', 'VoIP Avançado', 'Protocolo de voz sobre IP', 'ativo', NOW() - INTERVAL '45 days'),
('cat-5', 'Omnichannel', 'Comunicação omnichannel', 'ativo', NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir vídeos de exemplo
INSERT INTO videos (id, titulo, descricao, url, categoria_id, duracao, ordem, status, created_at) VALUES
-- React Fundamentals
('vid-1', 'Introdução ao React', 'Conceitos básicos do React', 'https://example.com/react-intro', 'cat-1', 1800, 1, 'ativo', NOW() - INTERVAL '60 days'),
('vid-2', 'Componentes React', 'Criando componentes reutilizáveis', 'https://example.com/react-components', 'cat-1', 2400, 2, 'ativo', NOW() - INTERVAL '59 days'),
('vid-3', 'Props e State', 'Gerenciando dados em componentes', 'https://example.com/react-props-state', 'cat-1', 2100, 3, 'ativo', NOW() - INTERVAL '58 days'),
('vid-4', 'Hooks do React', 'Usando hooks modernos', 'https://example.com/react-hooks', 'cat-1', 2700, 4, 'ativo', NOW() - INTERVAL '57 days'),
('vid-5', 'Roteamento', 'Navegação entre páginas', 'https://example.com/react-routing', 'cat-1', 1800, 5, 'ativo', NOW() - INTERVAL '56 days'),
('vid-6', 'Gerenciamento de Estado', 'Redux e Context API', 'https://example.com/react-state', 'cat-1', 3000, 6, 'ativo', NOW() - INTERVAL '55 days'),
('vid-7', 'Testes em React', 'Testando componentes', 'https://example.com/react-testing', 'cat-1', 2400, 7, 'ativo', NOW() - INTERVAL '54 days'),
('vid-8', 'Deploy e Otimização', 'Publicando aplicações React', 'https://example.com/react-deploy', 'cat-1', 2100, 8, 'ativo', NOW() - INTERVAL '53 days'),

-- JavaScript ES6+
('vid-9', 'Arrow Functions', 'Funções arrow do ES6', 'https://example.com/js-arrows', 'cat-2', 1200, 1, 'ativo', NOW() - INTERVAL '55 days'),
('vid-10', 'Destructuring', 'Desestruturação de objetos e arrays', 'https://example.com/js-destructuring', 'cat-2', 1500, 2, 'ativo', NOW() - INTERVAL '54 days'),
('vid-11', 'Template Literals', 'Strings template do ES6', 'https://example.com/js-templates', 'cat-2', 900, 3, 'ativo', NOW() - INTERVAL '53 days'),
('vid-12', 'Promises', 'Trabalhando com promises', 'https://example.com/js-promises', 'cat-2', 2400, 4, 'ativo', NOW() - INTERVAL '52 days'),
('vid-13', 'Async/Await', 'Sintaxe moderna para promises', 'https://example.com/js-async', 'cat-2', 1800, 5, 'ativo', NOW() - INTERVAL '51 days'),
('vid-14', 'Modules ES6', 'Sistema de módulos', 'https://example.com/js-modules', 'cat-2', 1200, 6, 'ativo', NOW() - INTERVAL '50 days'),

-- PABX Básico
('vid-15', 'Introdução ao PABX', 'Conceitos básicos de PABX', 'https://example.com/pabx-intro', 'cat-3', 1800, 1, 'ativo', NOW() - INTERVAL '50 days'),
('vid-16', 'Configuração Básica', 'Configurando um PABX', 'https://example.com/pabx-config', 'cat-3', 2400, 2, 'ativo', NOW() - INTERVAL '49 days'),
('vid-17', 'Extensões e Ramais', 'Gerenciando extensões', 'https://example.com/pabx-extensions', 'cat-3', 2100, 3, 'ativo', NOW() - INTERVAL '48 days'),
('vid-18', 'Troncos e Linhas', 'Configurando troncos', 'https://example.com/pabx-trunks', 'cat-3', 2700, 4, 'ativo', NOW() - INTERVAL '47 days'),
('vid-19', 'Relatórios PABX', 'Gerando relatórios', 'https://example.com/pabx-reports', 'cat-3', 1800, 5, 'ativo', NOW() - INTERVAL '46 days'),
('vid-20', 'Manutenção PABX', 'Manutenção preventiva', 'https://example.com/pabx-maintenance', 'cat-3', 2400, 6, 'ativo', NOW() - INTERVAL '45 days'),
('vid-21', 'Troubleshooting', 'Resolução de problemas', 'https://example.com/pabx-troubleshooting', 'cat-3', 3000, 7, 'ativo', NOW() - INTERVAL '44 days'),
('vid-22', 'Segurança PABX', 'Protegendo o sistema', 'https://example.com/pabx-security', 'cat-3', 2100, 8, 'ativo', NOW() - INTERVAL '43 days')
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir progresso de usuários (atividades recentes)
INSERT INTO progresso_usuario (id, usuario_id, video_id, status, data_conclusao, created_at) VALUES
-- Maria Silva - React Fundamentals (completou 5 de 8)
('prog-1', 'user-1', 'vid-1', 'concluido', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('prog-2', 'user-1', 'vid-2', 'concluido', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('prog-3', 'user-1', 'vid-3', 'concluido', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('prog-4', 'user-1', 'vid-4', 'concluido', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('prog-5', 'user-1', 'vid-5', 'concluido', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),
('prog-6', 'user-1', 'vid-6', 'em_andamento', NULL, NOW() - INTERVAL '2 minutes'),
('prog-7', 'user-1', 'vid-7', 'nao_iniciado', NULL, NOW()),
('prog-8', 'user-1', 'vid-8', 'nao_iniciado', NULL, NOW()),

-- João Santos - JavaScript ES6+ (iniciou recentemente)
('prog-9', 'user-2', 'vid-9', 'concluido', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('prog-10', 'user-2', 'vid-10', 'em_andamento', NULL, NOW() - INTERVAL '5 minutes'),
('prog-11', 'user-2', 'vid-11', 'nao_iniciado', NULL, NOW()),
('prog-12', 'user-2', 'vid-12', 'nao_iniciado', NULL, NOW()),
('prog-13', 'user-2', 'vid-13', 'nao_iniciado', NULL, NOW()),
('prog-14', 'user-2', 'vid-14', 'nao_iniciado', NULL, NOW()),

-- Pedro Costa - PABX Básico (completou 7 de 8)
('prog-15', 'user-3', 'vid-15', 'concluido', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('prog-16', 'user-3', 'vid-16', 'concluido', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes'),
('prog-17', 'user-3', 'vid-17', 'concluido', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'),
('prog-18', 'user-3', 'vid-18', 'concluido', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('prog-19', 'user-3', 'vid-19', 'concluido', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
('prog-20', 'user-3', 'vid-20', 'concluido', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),
('prog-21', 'user-3', 'vid-21', 'concluido', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),
('prog-22', 'user-3', 'vid-22', 'em_andamento', NULL, NOW() - INTERVAL '2 minutes'),

-- Outros usuários com progresso variado
('prog-23', 'user-4', 'vid-1', 'concluido', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('prog-24', 'user-5', 'vid-15', 'concluido', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
('prog-25', 'user-6', 'vid-9', 'concluido', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('prog-26', 'user-7', 'vid-1', 'em_andamento', NULL, NOW() - INTERVAL '1 hour'),
('prog-27', 'user-8', 'vid-15', 'em_andamento', NULL, NOW() - INTERVAL '30 minutes'),
('prog-28', 'user-9', 'vid-9', 'em_andamento', NULL, NOW() - INTERVAL '15 minutes'),
('prog-29', 'user-10', 'vid-1', 'em_andamento', NULL, NOW() - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir certificados (atividades recentes)
INSERT INTO certificados (id, usuario_id, categoria_id, categoria_nome, nota, data_conclusao, created_at) VALUES
-- Certificados recentes
('cert-1', 'user-1', 'cat-1', 'React Fundamentals', 85, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('cert-2', 'user-3', 'cat-3', 'PABX Básico', 92, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('cert-3', 'user-4', 'cat-1', 'React Fundamentals', 78, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('cert-4', 'user-5', 'cat-3', 'PABX Básico', 88, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
('cert-5', 'user-6', 'cat-2', 'JavaScript ES6+', 91, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Certificados do mês passado (para estatísticas de crescimento)
('cert-6', 'user-7', 'cat-1', 'React Fundamentals', 82, NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
('cert-7', 'user-8', 'cat-2', 'JavaScript ES6+', 87, NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days'),
('cert-8', 'user-9', 'cat-3', 'PABX Básico', 79, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('cert-9', 'user-10', 'cat-1', 'React Fundamentals', 85, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- 6. Inserir cursos (para estatísticas)
INSERT INTO cursos (id, titulo, descricao, categoria_id, status, created_at) VALUES
('curso-1', 'React Fundamentals', 'Curso completo de React.js', 'cat-1', 'ativo', NOW() - INTERVAL '60 days'),
('curso-2', 'JavaScript ES6+', 'JavaScript moderno', 'cat-2', 'ativo', NOW() - INTERVAL '55 days'),
('curso-3', 'PABX Básico', 'Sistemas de telefonia', 'cat-3', 'ativo', NOW() - INTERVAL '50 days'),
('curso-4', 'VoIP Avançado', 'Protocolo VoIP', 'cat-4', 'ativo', NOW() - INTERVAL '45 days'),
('curso-5', 'Omnichannel', 'Comunicação omnichannel', 'cat-5', 'ativo', NOW() - INTERVAL '40 days'),
('curso-6', 'React Avançado', 'Técnicas avançadas React', 'cat-1', 'ativo', NOW() - INTERVAL '5 days'),
('curso-7', 'Node.js Backend', 'Desenvolvimento backend', 'cat-2', 'ativo', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Verificar os dados inseridos
SELECT 'Usuários inseridos:' as info, COUNT(*) as total FROM usuarios WHERE id LIKE 'user-%'
UNION ALL
SELECT 'Categorias inseridas:', COUNT(*) FROM categorias WHERE id LIKE 'cat-%'
UNION ALL
SELECT 'Vídeos inseridos:', COUNT(*) FROM videos WHERE id LIKE 'vid-%'
UNION ALL
SELECT 'Progresso inserido:', COUNT(*) FROM progresso_usuario WHERE id LIKE 'prog-%'
UNION ALL
SELECT 'Certificados inseridos:', COUNT(*) FROM certificados WHERE id LIKE 'cert-%'
UNION ALL
SELECT 'Cursos inseridos:', COUNT(*) FROM cursos WHERE id LIKE 'curso-%'; 