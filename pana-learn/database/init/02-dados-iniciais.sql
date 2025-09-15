-- ========================================
-- ERA LEARN - DADOS INICIAIS
-- ========================================
-- Inserção de dados essenciais para funcionamento

-- ========================================
-- DOMÍNIO PADRÃO
-- ========================================
INSERT INTO domains (id, nome, subdominio, configuracoes, ativo) VALUES 
('11111111-1111-1111-1111-111111111111', 'ERA Learn Principal', 'default', '{"features": ["videos", "quizzes", "certificates", "reports"]}', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- CONFIGURAÇÃO DE BRANDING PADRÃO
-- ========================================
INSERT INTO branding_config (id, domain_id, logo_url, sub_logo_url, favicon_url, primary_color, secondary_color, company_name, company_slogan) VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '/logotipoeralearn.png', '/era-sub-logo.png', '/favicon.ico', '#A3E635', '#1E293B', 'ERA Learn', 'Smart Training Platform')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- USUÁRIO ADMINISTRADOR MASTER
-- ========================================
-- Senha: admin123 (criptografada com bcrypt)
INSERT INTO usuarios (id, email, nome, tipo_usuario, senha_hash, domain_id, ativo) VALUES 
('33333333-3333-3333-3333-333333333333', 'admin@eralearn.com', 'Administrador Master', 'admin_master', '$2b$10$rQJ8kHgzI8y8y8y8y8y8yeDqJ8kHgzI8y8y8y8y8yeDqJ8kHgzI8y', '11111111-1111-1111-1111-111111111111', true)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- USUÁRIO ADMINISTRADOR
-- ========================================
-- Senha: admin123
INSERT INTO usuarios (id, email, nome, tipo_usuario, senha_hash, domain_id, ativo) VALUES 
('44444444-4444-4444-4444-444444444444', 'admin@local.com', 'Administrador', 'admin', '$2b$10$rQJ8kHgzI8y8y8y8y8y8yeDqJ8kHgzI8y8y8y8y8yeDqJ8kHgzI8y', '11111111-1111-1111-1111-111111111111', true)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- USUÁRIO CLIENTE DE TESTE
-- ========================================
-- Senha: cliente123
INSERT INTO usuarios (id, email, nome, tipo_usuario, senha_hash, domain_id, ativo) VALUES 
('55555555-5555-5555-5555-555555555555', 'cliente@test.com', 'Cliente Teste', 'cliente', '$2b$10$rQJ8kHgzI8y8y8y8y8y8yeDqJ8kHgzI8y8y8y8y8yeDqJ8kHgzI8y', '11111111-1111-1111-1111-111111111111', true)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- CURSOS DE EXEMPLO
-- ========================================
INSERT INTO cursos (id, nome, descricao, categoria, ativo, ordem, domain_id) VALUES 
('66666666-6666-6666-6666-666666666666', 'Fundamentos de PABX', 'Curso básico sobre sistemas PABX e suas configurações fundamentais', 'PABX', true, 1, '11111111-1111-1111-1111-111111111111'),
('77777777-7777-7777-7777-777777777777', 'Configurações Avançadas PABX', 'Curso avançado para configurações complexas de PABX', 'PABX', true, 2, '11111111-1111-1111-1111-111111111111'),
('88888888-8888-8888-8888-888888888888', 'OMNICHANNEL para Empresas', 'Implementação de soluções omnichannel corporativas', 'Omnichannel', true, 3, '11111111-1111-1111-1111-111111111111'),
('99999999-9999-9999-9999-999999999999', 'Fundamentos CALLCENTER', 'Fundamentos e melhores práticas para call centers', 'CALLCENTER', true, 4, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- MÓDULOS DE EXEMPLO
-- ========================================
INSERT INTO modulos (id, curso_id, nome_modulo, descricao, ordem) VALUES 
-- Módulos PABX Fundamentos
('aaaa1111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Introdução ao PABX', 'Conceitos básicos e terminologias', 1),
('aaaa2222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Configuração Inicial', 'Primeiros passos na configuração', 2),
('aaaa3333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Ramais e Usuários', 'Criação e gestão de ramais', 3),

-- Módulos PABX Avançado
('bbbb1111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'Roteamento Avançado', 'Configurações complexas de roteamento', 1),
('bbbb2222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'URA Interativa', 'Implementação de URA avançada', 2),

-- Módulos Omnichannel
('cccc1111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'Conceitos Omnichannel', 'Introdução ao omnichannel', 1),
('cccc2222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'Integração de Canais', 'Como integrar múltiplos canais', 2),

-- Módulos CallCenter
('dddd1111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Fundamentos CallCenter', 'Conceitos básicos de call center', 1),
('dddd2222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'Métricas e KPIs', 'Indicadores de performance', 2)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- QUIZZES DE EXEMPLO
-- ========================================
INSERT INTO quizzes (id, titulo, descricao, categoria, nota_minima, ativo) VALUES 
('quiz1111-1111-1111-1111-111111111111', 'Quiz - Fundamentos PABX', 'Avaliação dos conhecimentos básicos de PABX', 'PABX', 70.00, true),
('quiz2222-2222-2222-2222-222222222222', 'Quiz - PABX Avançado', 'Avaliação de configurações avançadas', 'PABX', 70.00, true),
('quiz3333-3333-3333-3333-333333333333', 'Quiz - Omnichannel', 'Avaliação sobre soluções omnichannel', 'Omnichannel', 70.00, true),
('quiz4444-4444-4444-4444-444444444444', 'Quiz - CallCenter', 'Avaliação de fundamentos de call center', 'CALLCENTER', 70.00, true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PERGUNTAS DOS QUIZZES
-- ========================================

-- Perguntas Quiz PABX Fundamentos
INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, ordem) VALUES 
('perg1111-1111-1111-1111-111111111111', 'quiz1111-1111-1111-1111-111111111111', 'O que significa PABX?', '{"A": "Private Automatic Branch Exchange", "B": "Public Automatic Branch Exchange", "C": "Private Advanced Branch Exchange", "D": "Public Advanced Branch Exchange"}', 'A', 1),
('perg1112-1111-1111-1111-111111111111', 'quiz1111-1111-1111-1111-111111111111', 'Qual a principal função de um PABX?', '{"A": "Conectar computadores", "B": "Gerenciar chamadas telefônicas", "C": "Enviar emails", "D": "Criar websites"}', 'B', 2),
('perg1113-1111-1111-1111-111111111111', 'quiz1111-1111-1111-1111-111111111111', 'O que é um ramal?', '{"A": "Uma linha externa", "B": "Um telefone interno", "C": "Uma extensão interna do PABX", "D": "Um cabo de rede"}', 'C', 3),

-- Perguntas Quiz PABX Avançado
('perg2221-1111-1111-1111-111111111111', 'quiz2222-2222-2222-2222-222222222222', 'O que é URA?', '{"A": "Unidade de Resposta Automática", "B": "Unidade de Roteamento Avançado", "C": "Unidade de Registro Automático", "D": "Unidade de Redirecionamento Ativo"}', 'A', 1),
('perg2222-1111-1111-1111-111111111111', 'quiz2222-2222-2222-2222-222222222222', 'Para que serve o Dialplan?', '{"A": "Configurar internet", "B": "Definir rotas de chamadas", "C": "Configurar emails", "D": "Gerenciar usuários"}', 'B', 2),

-- Perguntas Quiz Omnichannel
('perg3331-1111-1111-1111-111111111111', 'quiz3333-3333-3333-3333-333333333333', 'O que é Omnichannel?', '{"A": "Um tipo de telefone", "B": "Integração de múltiplos canais de comunicação", "C": "Um software de email", "D": "Uma rede social"}', 'B', 1),
('perg3332-1111-1111-1111-111111111111', 'quiz3333-3333-3333-3333-333333333333', 'Quais canais podem ser integrados?', '{"A": "Apenas telefone", "B": "Telefone, email, chat, WhatsApp", "C": "Apenas email", "D": "Apenas chat"}', 'B', 2),

-- Perguntas Quiz CallCenter
('perg4441-1111-1111-1111-111111111111', 'quiz4444-4444-4444-4444-444444444444', 'O que é SLA em CallCenter?', '{"A": "Sistema de Ligação Automática", "B": "Acordo de Nível de Serviço", "C": "Software de Login Avançado", "D": "Sistema de Lista Ativa"}', 'B', 1),
('perg4442-1111-1111-1111-111111111111', 'quiz4444-4444-4444-4444-444444444444', 'Qual é uma métrica importante?', '{"A": "Tempo Médio de Atendimento", "B": "Número de funcionários", "C": "Cor do telefone", "D": "Tamanho da sala"}', 'A', 2)
ON CONFLICT (id) DO NOTHING;



















