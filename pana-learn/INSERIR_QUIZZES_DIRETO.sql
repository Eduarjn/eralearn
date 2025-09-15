-- ========================================
-- INSERIR QUIZZES DIRETAMENTE - VERSÃO SIMPLIFICADA
-- ========================================

-- 1. VERIFICAR E CRIAR TABELAS SE NÃO EXISTIREM

-- Tabela quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL,
    nota_minima INTEGER DEFAULT 70,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela quiz_perguntas
CREATE TABLE IF NOT EXISTS quiz_perguntas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    opcoes JSON NOT NULL,
    resposta_correta INTEGER NOT NULL,
    explicacao TEXT,
    ordem INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela progresso_quiz
CREATE TABLE IF NOT EXISTS progresso_quiz (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    respostas JSON,
    nota INTEGER,
    aprovado BOOLEAN DEFAULT false,
    data_conclusao TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. DESABILITAR RLS TEMPORARIAMENTE PARA INSERÇÃO
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_perguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_quiz DISABLE ROW LEVEL SECURITY;

-- 3. LIMPAR DADOS EXISTENTES
TRUNCATE TABLE progresso_quiz CASCADE;
TRUNCATE TABLE quiz_perguntas CASCADE;
TRUNCATE TABLE quizzes CASCADE;

-- 4. INSERIR QUIZZES (IDs FIXOS PARA FACILITAR)
INSERT INTO quizzes (id, titulo, descricao, categoria, nota_minima, ativo) VALUES
('11111111-1111-1111-1111-111111111111', 'Quiz de Fundamentos PABX', 'Avaliação dos conhecimentos fundamentais sobre sistemas PABX', 'PABX_FUNDAMENTOS', 70, true),
('22222222-2222-2222-2222-222222222222', 'Quiz de PABX Avançado', 'Avaliação de configurações avançadas de sistemas PABX', 'PABX_AVANCADO', 75, true),
('33333333-3333-3333-3333-333333333333', 'Quiz de Omnichannel para Empresas', 'Avaliação sobre implementação de soluções omnichannel', 'OMNICHANNEL_EMPRESAS', 70, true),
('44444444-4444-4444-4444-444444444444', 'Quiz de Omnichannel Avançado', 'Avaliação de configurações avançadas omnichannel', 'OMNICHANNEL_AVANCADO', 75, true),
('55555555-5555-5555-5555-555555555555', 'Quiz de Fundamentos CallCenter', 'Avaliação dos conhecimentos fundamentais de CallCenter', 'CALLCENTER_FUNDAMENTOS', 70, true);

-- 5. INSERIR PERGUNTAS PARA CADA QUIZ

-- QUIZ 1: PABX FUNDAMENTOS
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('11111111-1111-1111-1111-111111111111', 'O que significa PABX?', 
 '["Private Automatic Branch Exchange", "Public Automatic Branch Extension", "Private Access Branch Exchange", "Public Access Branch Extension"]', 
 0, 'PABX significa Private Automatic Branch Exchange.', 1),
('11111111-1111-1111-1111-111111111111', 'Qual é a principal função de um PABX?', 
 '["Conectar telefones internos e externos", "Apenas fazer chamadas externas", "Apenas conectar telefones internos", "Gravar todas as chamadas"]', 
 0, 'O PABX permite conectar telefones internos entre si e também com a rede telefônica externa.', 2),
('11111111-1111-1111-1111-111111111111', 'O que é um ramal em um sistema PABX?', 
 '["Uma extensão telefônica interna", "Uma linha externa", "Um tipo de chamada", "Um protocolo de comunicação"]', 
 0, 'Ramal é uma extensão telefônica interna.', 3);

-- QUIZ 2: PABX AVANÇADO  
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('22222222-2222-2222-2222-222222222222', 'O que é QoS em telefonia IP?', 
 '["Quality of Service - qualidade do serviço", "Query of System", "Quick Operation Service", "Quality over Security"]', 
 0, 'QoS garante a qualidade do tráfego de voz na rede IP.', 1),
('22222222-2222-2222-2222-222222222222', 'Qual codec oferece melhor qualidade de áudio?', 
 '["G.711", "G.729", "G.723", "GSM"]', 
 0, 'G.711 oferece a melhor qualidade de áudio.', 2),
('22222222-2222-2222-2222-222222222222', 'O que é um Trunk SIP?', 
 '["Conexão entre PABX e provedor SIP", "Tipo de telefone", "Software de configuração", "Protocolo de segurança"]', 
 0, 'Trunk SIP liga o PABX ao provedor de telefonia SIP.', 3);

-- QUIZ 3: OMNICHANNEL EMPRESAS
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('33333333-3333-3333-3333-333333333333', 'O que é Omnichannel?', 
 '["Integração de todos os canais de comunicação", "Apenas atendimento telefônico", "Sistema de vendas", "Protocolo de rede"]', 
 0, 'Omnichannel integra todos os canais de comunicação.', 1),
('33333333-3333-3333-3333-333333333333', 'Quais canais fazem parte do Omnichannel?', 
 '["Telefone, chat, email, redes sociais", "Apenas telefone e email", "Somente redes sociais", "Apenas chat online"]', 
 0, 'Omnichannel inclui múltiplos canais de comunicação.', 2),
('33333333-3333-3333-3333-333333333333', 'Qual é o principal benefício do Omnichannel?', 
 '["Experiência única e consistente para o cliente", "Redução de custos apenas", "Aumento de vendas apenas", "Automação completa"]', 
 0, 'O principal benefício é a experiência consistente.', 3);

-- QUIZ 4: OMNICHANNEL AVANÇADO
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('44444444-4444-4444-4444-444444444444', 'O que é CTI em Omnichannel?', 
 '["Computer Telephony Integration", "Customer Technology Interface", "Call Transfer Integration", "Customer Tracking Interface"]', 
 0, 'CTI integra sistemas telefônicos com aplicações.', 1),
('44444444-4444-4444-4444-444444444444', 'Qual tecnologia permite roteamento inteligente?', 
 '["Algoritmos de IA e machine learning", "Apenas configuração manual", "Somente horários predefinidos", "Apenas distribuição aleatória"]', 
 0, 'IA permite roteamento inteligente.', 2),
('44444444-4444-4444-4444-444444444444', 'O que são chatbots em Omnichannel?', 
 '["Assistentes virtuais automatizados", "Operadores humanos", "Sistemas de gravação", "Protocolos de segurança"]', 
 0, 'Chatbots são assistentes virtuais automatizados.', 3);

-- QUIZ 5: CALLCENTER FUNDAMENTOS
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('55555555-5555-5555-5555-555555555555', 'O que é um Call Center?', 
 '["Centro de atendimento telefônico centralizado", "Sistema de vendas online", "Rede de computadores", "Protocolo de comunicação"]', 
 0, 'Call Center é um centro de atendimento centralizado.', 1),
('55555555-5555-5555-5555-555555555555', 'Qual é a diferença entre Inbound e Outbound?', 
 '["Inbound recebe, Outbound faz chamadas", "Inbound é interno, Outbound é externo", "Não há diferença", "Inbound é mais caro"]', 
 0, 'Inbound recebe chamadas, Outbound faz chamadas.', 2),
('55555555-5555-5555-5555-555555555555', 'O que é ACD em Call Center?', 
 '["Automatic Call Distribution", "Advanced Call Director", "Automatic Customer Database", "Advanced Communication Device"]', 
 0, 'ACD distribui automaticamente chamadas.', 3);

-- 6. REABILITAR RLS COM POLÍTICAS PERMISSIVAS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_quiz ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "quizzes_select_policy" ON quizzes;
DROP POLICY IF EXISTS "quiz_perguntas_select_policy" ON quiz_perguntas;
DROP POLICY IF EXISTS "progresso_quiz_select_policy" ON progresso_quiz;
DROP POLICY IF EXISTS "progresso_quiz_insert_policy" ON progresso_quiz;

-- Criar políticas muito permissivas
CREATE POLICY "quizzes_select_policy" ON quizzes
    FOR SELECT USING (true);

CREATE POLICY "quiz_perguntas_select_policy" ON quiz_perguntas
    FOR SELECT USING (true);

CREATE POLICY "progresso_quiz_select_policy" ON progresso_quiz
    FOR SELECT USING (true);

CREATE POLICY "progresso_quiz_insert_policy" ON progresso_quiz
    FOR INSERT WITH CHECK (true);

-- 7. VERIFICAR INSERÇÃO
SELECT 'QUIZZES INSERIDOS:' AS status, COUNT(*) AS total FROM quizzes;
SELECT 'PERGUNTAS INSERIDAS:' AS status, COUNT(*) AS total FROM quiz_perguntas;

-- 8. LISTAR QUIZZES CRIADOS
SELECT 
    q.titulo,
    q.categoria,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.titulo, q.categoria
ORDER BY q.categoria;

-- FIM DO SCRIPT


















