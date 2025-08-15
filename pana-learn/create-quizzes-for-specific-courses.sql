-- Criar quizzes para os 5 cursos específicos
-- Execute estas queries no Supabase SQL Editor

-- 1) Lista dos cursos específicos
WITH cursos_especificos AS (
  SELECT id, nome, categoria 
  FROM cursos 
  WHERE nome IN (
    'Fundamentos CALLCENTER',
    'Fundamentos de PABX', 
    'Omnichannel para Empresas',
    'Configurações Avançadas OMNI',
    'Configurações Avançadas PABX'
  )
)

-- 2) Criar quizzes para cada curso (se não existirem)
INSERT INTO quizzes (curso_id, titulo, descricao, nota_minima, ativo)
SELECT 
  c.id,
  'Quiz de Conclusão - ' || c.nome,
  'Quiz para avaliar o conhecimento sobre ' || c.categoria,
  70,
  true
FROM cursos_especificos c
WHERE NOT EXISTS (
  SELECT 1 FROM quizzes q WHERE q.curso_id = c.id
);

-- 3) Verificar quais quizzes foram criados
SELECT 
  q.id,
  q.titulo,
  c.nome as curso_nome,
  c.categoria,
  q.nota_minima,
  q.ativo,
  q.data_criacao
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome IN (
  'Fundamentos CALLCENTER',
  'Fundamentos de PABX', 
  'Omnichannel para Empresas',
  'Configurações Avançadas OMNI',
  'Configurações Avançadas PABX'
)
ORDER BY c.nome;

-- 4) Criar perguntas de exemplo para cada quiz (se não existirem)
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

INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é a principal função de um agente de Call Center?',
  ARRAY[
    'Atender e resolver problemas dos clientes',
    'Vender produtos',
    'Gerenciar sistemas',
    'Fazer relatórios'
  ],
  0,
  'A principal função é atender e resolver problemas dos clientes de forma eficiente.',
  2
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome = 'Fundamentos CALLCENTER'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id AND qp.ordem = 2
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

INSERT INTO quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Um sistema PABX pode integrar com softwares de CRM?',
  ARRAY[
    'Verdadeiro',
    'Falso'
  ],
  0,
  'Sim, sistemas PABX modernos podem integrar com CRMs para melhorar o atendimento.',
  2
FROM quizzes q
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome = 'Fundamentos de PABX'
  AND NOT EXISTS (
    SELECT 1 FROM quiz_perguntas qp WHERE qp.quiz_id = q.id AND qp.ordem = 2
  );

-- Quiz para Omnichannel para Empresas
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

-- 5) Verificar perguntas criadas
SELECT 
  c.nome as curso,
  q.titulo as quiz,
  qp.pergunta,
  qp.opcoes,
  qp.resposta_correta,
  qp.ordem
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
JOIN cursos c ON q.curso_id = c.id
WHERE c.nome IN (
  'Fundamentos CALLCENTER',
  'Fundamentos de PABX', 
  'Omnichannel para Empresas',
  'Configurações Avançadas OMNI',
  'Configurações Avançadas PABX'
)
ORDER BY c.nome, qp.ordem; 