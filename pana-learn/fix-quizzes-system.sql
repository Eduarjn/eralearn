-- Script para corrigir o sistema de quizzes
-- Execute estas queries no Supabase SQL Editor

-- 1) Verificar se os cursos existem
SELECT 
  id,
  nome,
  categoria,
  status
FROM cursos 
WHERE nome IN (
  'Fundamentos CALLCENTER',
  'Fundamentos de PABX', 
  'Omnichannel para Empresas',
  'Configurações Avançadas OMNI',
  'Configurações Avançadas PABX'
);

-- 2) Se os cursos não existirem, criar os cursos básicos
INSERT INTO cursos (nome, descricao, categoria, status, data_criacao, data_atualizacao)
VALUES 
  ('Fundamentos CALLCENTER', 'Curso sobre fundamentos de call center', 'CALLCENTER', 'ativo', NOW(), NOW()),
  ('Fundamentos de PABX', 'Curso sobre fundamentos de PABX', 'PABX', 'ativo', NOW(), NOW()),
  ('Omnichannel para Empresas', 'Curso sobre omnichannel', 'Omnichannel', 'ativo', NOW(), NOW()),
  ('Configurações Avançadas OMNI', 'Curso sobre configurações avançadas OMNI', 'OMNI', 'ativo', NOW(), NOW()),
  ('Configurações Avançadas PABX', 'Curso sobre configurações avançadas PABX', 'PABX', 'ativo', NOW(), NOW())
ON CONFLICT (nome) DO NOTHING;

-- 3) Verificar se a tabela quizzes existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'quizzes'
);

-- 4) Se a tabela não existir, criar a estrutura básica
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nota_minima INTEGER DEFAULT 70,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(curso_id)
);

CREATE TABLE IF NOT EXISTS quiz_perguntas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes TEXT[] NOT NULL,
  resposta_correta INTEGER NOT NULL,
  explicacao TEXT,
  ordem INTEGER DEFAULT 0,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progresso_quiz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  respostas JSONB DEFAULT '{}',
  nota INTEGER NOT NULL,
  aprovado BOOLEAN DEFAULT FALSE,
  data_conclusao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, quiz_id)
);

-- 5) Criar quizzes para os cursos específicos
INSERT INTO quizzes (curso_id, titulo, descricao, nota_minima, ativo)
SELECT 
  c.id,
  'Quiz de Conclusão - ' || c.nome,
  'Quiz para avaliar o conhecimento sobre ' || c.categoria,
  70,
  true
FROM cursos c
WHERE c.nome IN (
  'Fundamentos CALLCENTER',
  'Fundamentos de PABX', 
  'Omnichannel para Empresas',
  'Configurações Avançadas OMNI',
  'Configurações Avançadas PABX'
)
AND NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.curso_id = c.id
);

-- 6) Criar perguntas para cada quiz
-- Quiz para Fundamentos CALLCENTER
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que é um Call Center?',
  ARRAY[
    'Um centro de atendimento ao cliente',
    'Um sistema de telefonia',
    'Um software de CRM',
    'Um tipo de empresa'
  ],
  0,
  'Call Center é um centro de atendimento ao cliente que centraliza as comunicações.',
  1
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome = 'Fundamentos CALLCENTER'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id AND qp.ordem = 1
  );

-- Quiz para Fundamentos de PABX
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que significa PABX?',
  ARRAY[
    'Private Automatic Branch Exchange',
    'Public Automatic Branch Exchange',
    'Personal Automatic Branch Exchange',
    'Private Automatic Business Exchange'
  ],
  0,
  'PABX significa Private Automatic Branch Exchange, um sistema telefônico privado.',
  1
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome = 'Fundamentos de PABX'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id AND qp.ordem = 1
  );

-- Quiz para Omnichannel
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que é Omnichannel?',
  ARRAY[
    'Integração de múltiplos canais de comunicação',
    'Um tipo de telefone',
    'Um software de vendas',
    'Um sistema de email'
  ],
  0,
  'Omnichannel é a integração de múltiplos canais de comunicação em uma experiência unificada.',
  1
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome = 'Omnichannel para Empresas'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id AND qp.ordem = 1
  );

-- Quiz para Configurações Avançadas OMNI
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é a vantagem principal das configurações avançadas OMNI?',
  ARRAY[
    'Maior flexibilidade e personalização',
    'Menor custo',
    'Instalação mais rápida',
    'Menos funcionalidades'
  ],
  0,
  'As configurações avançadas oferecem maior flexibilidade e personalização.',
  1
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome = 'Configurações Avançadas OMNI'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id AND qp.ordem = 1
  );

-- Quiz para Configurações Avançadas PABX
INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Em configurações avançadas PABX, o que é IVR?',
  ARRAY[
    'Interactive Voice Response',
    'Internal Voice Recording',
    'Integrated Voice Router',
    'Internet Voice Response'
  ],
  0,
  'IVR significa Interactive Voice Response, sistema de resposta de voz interativa.',
  1
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome = 'Configurações Avançadas PABX'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id AND qp.ordem = 1
  );

-- 7) Verificar se tudo foi criado corretamente
SELECT 
  c.nome as curso,
  q.titulo as quiz,
  q.ativo,
  COUNT(qp.id) as total_perguntas
FROM cursos c
LEFT JOIN quizzes q ON c.id = q.curso_id
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.nome IN (
  'Fundamentos CALLCENTER',
  'Fundamentos de PABX', 
  'Omnichannel para Empresas',
  'Configurações Avançadas OMNI',
  'Configurações Avançadas PABX'
)
GROUP BY c.nome, q.titulo, q.ativo
ORDER BY c.nome; 