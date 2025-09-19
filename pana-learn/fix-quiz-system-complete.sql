-- ========================================
-- CORRIGIR SISTEMA DE QUIZZES COMPLETO
-- ========================================

-- 1. Verificar estrutura atual das tabelas
DO $$
BEGIN
    -- Verificar se tabela quizzes existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
        RAISE NOTICE 'Criando tabela quizzes...';
        
        CREATE TABLE quizzes (
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
    END IF;

    -- Verificar se tabela quiz_perguntas existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_perguntas') THEN
        RAISE NOTICE 'Criando tabela quiz_perguntas...';
        
        CREATE TABLE quiz_perguntas (
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
    END IF;

    -- Verificar se tabela progresso_quiz existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progresso_quiz') THEN
        RAISE NOTICE 'Criando tabela progresso_quiz...';
        
        CREATE TABLE progresso_quiz (
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
    END IF;
END $$;

-- 2. Habilitar RLS em todas as tabelas
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_quiz ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes
DROP POLICY IF EXISTS "Quizzes são visíveis para todos" ON quizzes;
DROP POLICY IF EXISTS "Perguntas são visíveis para todos" ON quiz_perguntas;
DROP POLICY IF EXISTS "Usuários podem ver próprio progresso" ON progresso_quiz;
DROP POLICY IF EXISTS "Admins podem gerenciar quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins podem gerenciar perguntas" ON quiz_perguntas;
DROP POLICY IF EXISTS "Admins podem ver todos os progressos" ON progresso_quiz;

-- 4. Criar políticas RLS permissivas
CREATE POLICY "Quizzes são visíveis para usuários autenticados" 
ON quizzes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Perguntas são visíveis para usuários autenticados" 
ON quiz_perguntas FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários podem criar próprio progresso" 
ON progresso_quiz FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem ver próprio progresso" 
ON progresso_quiz FOR SELECT 
TO authenticated 
USING (auth.uid()::text = usuario_id::text);

-- Políticas para administradores
CREATE POLICY "Admins podem gerenciar quizzes" 
ON quizzes FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE user_id = auth.uid() 
        AND tipo_usuario IN ('admin', 'admin_master')
    )
);

CREATE POLICY "Admins podem gerenciar perguntas" 
ON quiz_perguntas FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE user_id = auth.uid() 
        AND tipo_usuario IN ('admin', 'admin_master')
    )
);

CREATE POLICY "Admins podem ver todos os progressos" 
ON progresso_quiz FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE user_id = auth.uid() 
        AND tipo_usuario IN ('admin', 'admin_master')
    )
);

-- 5. Limpar dados existentes (sem impactar outras configurações)
DELETE FROM progresso_quiz;
DELETE FROM quiz_perguntas;
DELETE FROM quizzes;

-- 6. Inserir quizzes para as 5 categorias principais
INSERT INTO quizzes (id, titulo, descricao, categoria, nota_minima, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Quiz de Fundamentos PABX', 'Avaliação dos conhecimentos fundamentais sobre sistemas PABX', 'PABX_FUNDAMENTOS', 70, true),
('550e8400-e29b-41d4-a716-446655440002', 'Quiz de PABX Avançado', 'Avaliação de configurações avançadas de sistemas PABX', 'PABX_AVANCADO', 75, true),
('550e8400-e29b-41d4-a716-446655440003', 'Quiz de Omnichannel para Empresas', 'Avaliação sobre implementação de soluções omnichannel', 'OMNICHANNEL_EMPRESAS', 70, true),
('550e8400-e29b-41d4-a716-446655440004', 'Quiz de Omnichannel Avançado', 'Avaliação de configurações avançadas omnichannel', 'OMNICHANNEL_AVANCADO', 75, true),
('550e8400-e29b-41d4-a716-446655440005', 'Quiz de Fundamentos CallCenter', 'Avaliação dos conhecimentos fundamentais de CallCenter', 'CALLCENTER_FUNDAMENTOS', 70, true);

-- 7. Inserir perguntas para cada quiz

-- QUIZ 1: PABX FUNDAMENTOS
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'O que significa PABX?', 
 '["Private Automatic Branch Exchange", "Public Automatic Branch Extension", "Private Access Branch Exchange", "Public Access Branch Extension"]', 
 0, 'PABX significa Private Automatic Branch Exchange - um sistema telefônico privado dentro de uma empresa.', 1),

('550e8400-e29b-41d4-a716-446655440001', 'Qual é a principal função de um PABX?', 
 '["Conectar telefones internos e externos", "Apenas fazer chamadas externas", "Apenas conectar telefones internos", "Gravar todas as chamadas"]', 
 0, 'O PABX permite conectar telefones internos entre si e também com a rede telefônica externa.', 2),

('550e8400-e29b-41d4-a716-446655440001', 'Quantos ramais um PABX básico pode suportar?', 
 '["Até 50 ramais", "Apenas 10 ramais", "Mais de 1000 ramais", "Depende do modelo e configuração"]', 
 3, 'O número de ramais depende do modelo e configuração do PABX, variando desde poucos ramais até milhares.', 3),

('550e8400-e29b-41d4-a716-446655440001', 'O que é um ramal em um sistema PABX?', 
 '["Uma extensão telefônica interna", "Uma linha externa", "Um tipo de chamada", "Um protocolo de comunicação"]', 
 0, 'Ramal é uma extensão telefônica interna que permite comunicação dentro da empresa.', 4),

('550e8400-e29b-41d4-a716-446655440001', 'Qual protocolo é mais comum em PABX IP?', 
 '["SIP", "HTTP", "FTP", "SMTP"]', 
 0, 'SIP (Session Initiation Protocol) é o protocolo mais utilizado em sistemas PABX IP.', 5);

-- QUIZ 2: PABX AVANÇADO
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'O que é QoS em telefonia IP?', 
 '["Quality of Service - qualidade do serviço", "Query of System", "Quick Operation Service", "Quality over Security"]', 
 0, 'QoS garante a qualidade e prioridade do tráfego de voz na rede IP.', 1),

('550e8400-e29b-41d4-a716-446655440002', 'Qual codec oferece melhor qualidade de áudio?', 
 '["G.711", "G.729", "G.723", "GSM"]', 
 0, 'G.711 oferece a melhor qualidade de áudio, mas consome mais largura de banda.', 2),

('550e8400-e29b-41d4-a716-446655440002', 'O que é um Trunk SIP?', 
 '["Conexão entre PABX e provedor SIP", "Tipo de telefone", "Software de configuração", "Protocolo de segurança"]', 
 0, 'Trunk SIP é a conexão que liga o PABX ao provedor de telefonia SIP.', 3),

('550e8400-e29b-41d4-a716-446655440002', 'Para que serve o NAT em PABX IP?', 
 '["Traduzir endereços de rede privada para pública", "Criptografar chamadas", "Armazenar configurações", "Monitorar qualidade"]', 
 0, 'NAT traduz endereços IP privados para públicos, permitindo comunicação através da internet.', 4),

('550e8400-e29b-41d4-a716-446655440002', 'O que é redundância em PABX?', 
 '["Sistema de backup para continuidade", "Tipo de configuração", "Protocolo de segurança", "Método de autenticação"]', 
 0, 'Redundância garante continuidade do serviço através de sistemas de backup.', 5);

-- QUIZ 3: OMNICHANNEL EMPRESAS
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'O que é Omnichannel?', 
 '["Integração de todos os canais de comunicação", "Apenas atendimento telefônico", "Sistema de vendas", "Protocolo de rede"]', 
 0, 'Omnichannel integra todos os canais de comunicação em uma experiência única.', 1),

('550e8400-e29b-41d4-a716-446655440003', 'Quais canais fazem parte do Omnichannel?', 
 '["Telefone, chat, email, redes sociais", "Apenas telefone e email", "Somente redes sociais", "Apenas chat online"]', 
 0, 'Omnichannel inclui telefone, chat, email, redes sociais e outros canais de comunicação.', 2),

('550e8400-e29b-41d4-a716-446655440003', 'Qual é o principal benefício do Omnichannel?', 
 '["Experiência única e consistente para o cliente", "Redução de custos apenas", "Aumento de vendas apenas", "Automação completa"]', 
 0, 'O principal benefício é proporcionar uma experiência única e consistente em todos os canais.', 3),

('550e8400-e29b-41d4-a716-446655440003', 'O que é importante para implementar Omnichannel?', 
 '["Integração de sistemas e dados unificados", "Apenas tecnologia avançada", "Somente treinamento de equipe", "Apenas investimento financeiro"]', 
 0, 'É essencial ter integração de sistemas e dados unificados para uma experiência consistente.', 4),

('550e8400-e29b-41d4-a716-446655440003', 'Como medir sucesso em Omnichannel?', 
 '["Satisfação do cliente e eficiência operacional", "Apenas número de atendimentos", "Somente tempo de resposta", "Apenas vendas realizadas"]', 
 0, 'O sucesso é medido pela satisfação do cliente e eficiência operacional geral.', 5);

-- QUIZ 4: OMNICHANNEL AVANÇADO
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'O que é CTI em Omnichannel?', 
 '["Computer Telephony Integration", "Customer Technology Interface", "Call Transfer Integration", "Customer Tracking Interface"]', 
 0, 'CTI integra sistemas telefônicos com aplicações de computador para melhor atendimento.', 1),

('550e8400-e29b-41d4-a716-446655440004', 'Qual tecnologia permite roteamento inteligente?', 
 '["Algoritmos de IA e machine learning", "Apenas configuração manual", "Somente horários predefinidos", "Apenas distribuição aleatória"]', 
 0, 'Algoritmos de IA e machine learning permitem roteamento inteligente baseado em diversos critérios.', 2),

('550e8400-e29b-41d4-a716-446655440004', 'O que são chatbots em Omnichannel?', 
 '["Assistentes virtuais automatizados", "Operadores humanos", "Sistemas de gravação", "Protocolos de segurança"]', 
 0, 'Chatbots são assistentes virtuais que automatizam atendimentos básicos em diversos canais.', 3),

('550e8400-e29b-41d4-a716-446655440004', 'Como funciona a escalação em Omnichannel?', 
 '["Transferência automática para especialistas", "Apenas encerramento da conversa", "Somente agendamento posterior", "Apenas resposta padrão"]', 
 0, 'Escalação transfere automaticamente atendimentos complexos para especialistas ou supervisores.', 4),

('550e8400-e29b-41d4-a716-446655440004', 'O que são métricas de Omnichannel?', 
 '["Indicadores de performance multicanal", "Apenas contagem de chamadas", "Somente tempo de atendimento", "Apenas satisfação do cliente"]', 
 0, 'Métricas de Omnichannel são indicadores que medem performance através de múltiplos canais.', 5);

-- QUIZ 5: CALLCENTER FUNDAMENTOS
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'O que é um Call Center?', 
 '["Centro de atendimento telefônico centralizado", "Sistema de vendas online", "Rede de computadores", "Protocolo de comunicação"]', 
 0, 'Call Center é um centro centralizado para atendimento telefônico de clientes.', 1),

('550e8400-e29b-41d4-a716-446655440005', 'Qual é a diferença entre Inbound e Outbound?', 
 '["Inbound recebe, Outbound faz chamadas", "Inbound é interno, Outbound é externo", "Não há diferença", "Inbound é mais caro"]', 
 0, 'Inbound recebe chamadas dos clientes, Outbound faz chamadas ativas para clientes.', 2),

('550e8400-e29b-41d4-a716-446655440005', 'O que é ACD em Call Center?', 
 '["Automatic Call Distribution", "Advanced Call Director", "Automatic Customer Database", "Advanced Communication Device"]', 
 0, 'ACD distribui automaticamente chamadas para agentes disponíveis de forma inteligente.', 3),

('550e8400-e29b-41d4-a716-446655440005', 'Qual métrica mede tempo de espera?', 
 '["ASA - Average Speed of Answer", "AHT - Average Handle Time", "FCR - First Call Resolution", "CSAT - Customer Satisfaction"]', 
 0, 'ASA (Average Speed of Answer) mede o tempo médio que clientes aguardam para serem atendidos.', 4),

('550e8400-e29b-41d4-a716-446655440005', 'O que significa FCR?', 
 '["First Call Resolution - resolução na primeira chamada", "Fast Call Response", "Full Customer Record", "Final Call Report"]', 
 0, 'FCR mede a capacidade de resolver problemas do cliente na primeira chamada.', 5);

-- 8. Criar função para liberar quiz baseado em progresso do curso
CREATE OR REPLACE FUNCTION liberar_quiz_curso(p_usuario_id UUID, p_curso_id TEXT)
RETURNS UUID AS $$
DECLARE
    quiz_id UUID;
    total_videos INTEGER;
    videos_assistidos INTEGER;
BEGIN
    -- Buscar quiz da categoria/curso
    SELECT id INTO quiz_id 
    FROM quizzes 
    WHERE categoria = p_curso_id AND ativo = true
    LIMIT 1;
    
    IF quiz_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Verificar se todos os vídeos foram assistidos
    SELECT COUNT(*) INTO total_videos
    FROM videos 
    WHERE categoria = p_curso_id;
    
    SELECT COUNT(*) INTO videos_assistidos
    FROM video_progress 
    WHERE usuario_id = p_usuario_id 
    AND video_id IN (
        SELECT id FROM videos WHERE categoria = p_curso_id
    )
    AND concluido = true;
    
    -- Se assistiu todos os vídeos, liberar quiz
    IF videos_assistidos >= total_videos AND total_videos > 0 THEN
        RETURN quiz_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criar função para gerar certificado
CREATE OR REPLACE FUNCTION gerar_certificado_quiz(
    p_usuario_id UUID, 
    p_curso_id TEXT, 
    p_quiz_id UUID, 
    p_nota INTEGER
)
RETURNS UUID AS $$
DECLARE
    certificado_id UUID;
    usuario_nome TEXT;
    usuario_email TEXT;
    curso_nome TEXT;
    quiz_nota_minima INTEGER;
BEGIN
    -- Verificar se foi aprovado
    SELECT nota_minima INTO quiz_nota_minima FROM quizzes WHERE id = p_quiz_id;
    
    IF p_nota < quiz_nota_minima THEN
        RETURN NULL;
    END IF;
    
    -- Buscar dados do usuário
    SELECT nome, email INTO usuario_nome, usuario_email 
    FROM usuarios WHERE id = p_usuario_id;
    
    -- Definir nome do curso baseado na categoria
    curso_nome := CASE p_curso_id
        WHEN 'PABX_FUNDAMENTOS' THEN 'Fundamentos de PABX'
        WHEN 'PABX_AVANCADO' THEN 'PABX Avançado'
        WHEN 'OMNICHANNEL_EMPRESAS' THEN 'Omnichannel para Empresas'
        WHEN 'OMNICHANNEL_AVANCADO' THEN 'Omnichannel Avançado'
        WHEN 'CALLCENTER_FUNDAMENTOS' THEN 'Fundamentos de CallCenter'
        ELSE 'Curso de Telecomunicações'
    END;
    
    -- Criar certificado
    INSERT INTO certificados (
        id, usuario_id, curso_id, usuario_nome, usuario_email, 
        curso_nome, nota_obtida, data_conclusao, certificado_url
    )
    VALUES (
        gen_random_uuid(), p_usuario_id, p_curso_id, usuario_nome, usuario_email,
        curso_nome, p_nota, now(), 
        '/certificados/' || p_usuario_id || '/' || p_curso_id
    )
    RETURNING id INTO certificado_id;
    
    RETURN certificado_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Atualizar triggers para timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON quizzes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at ON quiz_perguntas;
CREATE TRIGGER update_quiz_perguntas_updated_at 
    BEFORE UPDATE ON quiz_perguntas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_progresso_quiz_updated_at ON progresso_quiz;
CREATE TRIGGER update_progresso_quiz_updated_at 
    BEFORE UPDATE ON progresso_quiz 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Inserir dados de teste para progresso
-- (Simular que o usuário assistiu alguns vídeos para poder fazer quiz)

COMMIT;

-- Feedback final
SELECT 
    'Sistema de Quizzes configurado com sucesso!' as status,
    COUNT(*) as total_quizzes
FROM quizzes WHERE ativo = true;

SELECT 
    q.titulo,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.titulo
ORDER BY q.titulo;




























