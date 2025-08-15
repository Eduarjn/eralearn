-- ========================================
-- ORGANIZAR QUIZZES POR CURSO ESPECÍFICO
-- ========================================
-- Este script cria quizzes específicos para cada curso
-- Baseado nos dados fornecidos pelo usuário

-- 1. Primeiro, vamos verificar os cursos existentes
SELECT '=== CURSOS EXISTENTES ===' as info;
SELECT id, nome, categoria FROM cursos WHERE status = 'ativo' ORDER BY nome;

-- 2. Verificar quizzes atuais
SELECT '=== QUIZZES ATUAIS ===' as info;
SELECT id, categoria, titulo, descricao FROM quizzes WHERE ativo = true ORDER BY categoria;

-- 3. Verificar perguntas atuais
SELECT '=== PERGUNTAS ATUAIS ===' as info;
SELECT 
  qp.id,
  qp.quiz_id,
  q.categoria,
  q.titulo as quiz_titulo,
  qp.pergunta,
  qp.ordem
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.ativo = true
ORDER BY q.categoria, qp.ordem;

-- 4. Criar novos quizzes específicos por curso
-- ========================================

-- Quiz para "Fundamentos de PABX"
INSERT INTO quizzes (id, categoria, titulo, descricao, nota_minima, ativo, data_criacao, data_atualizacao) 
VALUES (
  gen_random_uuid(),
  'PABX_FUNDAMENTOS',
  'Quiz de Conclusão - Fundamentos de PABX',
  'Quiz para avaliar o conhecimento sobre fundamentos de sistemas PABX',
  70,
  true,
  NOW(),
  NOW()
);

-- Quiz para "Configurações Avançadas PABX"
INSERT INTO quizzes (id, categoria, titulo, descricao, nota_minima, ativo, data_criacao, data_atualizacao) 
VALUES (
  gen_random_uuid(),
  'PABX_AVANCADO',
  'Quiz de Conclusão - Configurações Avançadas PABX',
  'Quiz para avaliar o conhecimento sobre configurações avançadas de PABX',
  70,
  true,
  NOW(),
  NOW()
);

-- Quiz para "OMNICHANNEL para Empresas"
INSERT INTO quizzes (id, categoria, titulo, descricao, nota_minima, ativo, data_criacao, data_atualizacao) 
VALUES (
  gen_random_uuid(),
  'OMNICHANNEL_EMPRESAS',
  'Quiz de Conclusão - OMNICHANNEL para Empresas',
  'Quiz para avaliar o conhecimento sobre plataformas omnichannel para empresas',
  70,
  true,
  NOW(),
  NOW()
);

-- Quiz para "Configurações Avançadas OMNI"
INSERT INTO quizzes (id, categoria, titulo, descricao, nota_minima, ativo, data_criacao, data_atualizacao) 
VALUES (
  gen_random_uuid(),
  'OMNICHANNEL_AVANCADO',
  'Quiz de Conclusão - Configurações Avançadas OMNI',
  'Quiz para avaliar o conhecimento sobre configurações avançadas de omnichannel',
  70,
  true,
  NOW(),
  NOW()
);

-- Quiz para "Fundamentos CALLCENTER"
INSERT INTO quizzes (id, categoria, titulo, descricao, nota_minima, ativo, data_criacao, data_atualizacao) 
VALUES (
  gen_random_uuid(),
  'CALLCENTER_FUNDAMENTOS',
  'Quiz de Conclusão - Fundamentos CALLCENTER',
  'Quiz para avaliar o conhecimento sobre fundamentos de call center',
  70,
  true,
  NOW(),
  NOW()
);

-- 5. Criar perguntas específicas para cada quiz
-- ========================================

-- Perguntas para "Fundamentos de PABX"
INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que significa PABX?',
  ARRAY['Private Automatic Branch Exchange', 'Public Automatic Branch Exchange', 'Personal Automatic Branch Exchange', 'Professional Automatic Branch Exchange'],
  0,
  'PABX significa Private Automatic Branch Exchange, um sistema telefônico privado usado em empresas.',
  1,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'PABX_FUNDAMENTOS';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'Qual é a principal função de um sistema PABX?',
  ARRAY['Gerenciar chamadas internas e externas', 'Apenas fazer chamadas externas', 'Apenas receber chamadas', 'Gerenciar emails'],
  0,
  'A principal função de um PABX é gerenciar tanto chamadas internas quanto externas de forma eficiente.',
  2,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'PABX_FUNDAMENTOS';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'Um sistema PABX pode integrar com softwares de CRM?',
  ARRAY['Verdadeiro', 'Falso'],
  0,
  'Sim, sistemas PABX modernos podem integrar com CRMs para melhorar o atendimento ao cliente.',
  3,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'PABX_FUNDAMENTOS';

-- Perguntas para "Configurações Avançadas PABX"
INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que é um Dialplan em um sistema PABX?',
  ARRAY['Um plano de discagem que define como as chamadas são roteadas', 'Um tipo de telefone', 'Um software de CRM', 'Um protocolo de internet'],
  0,
  'O Dialplan é um plano de discagem que define como as chamadas são roteadas dentro do sistema PABX.',
  1,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'PABX_AVANCADO';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'Qual é a principal vantagem de um sistema PABX avançado?',
  ARRAY['Reduzir custos de telefonia e melhorar eficiência', 'Aumentar a velocidade da internet', 'Melhorar a qualidade do vídeo', 'Aumentar o armazenamento'],
  0,
  'A principal vantagem é reduzir custos de telefonia através de chamadas internas gratuitas e melhorar a eficiência operacional.',
  2,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'PABX_AVANCADO';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que é uma URA em um sistema PABX?',
  ARRAY['Unidade de Resposta Audível que direciona chamadas', 'Um tipo de telefone', 'Um software de CRM', 'Um protocolo de internet'],
  0,
  'URA significa Unidade de Resposta Audível, que direciona automaticamente as chamadas baseado nas escolhas do usuário.',
  3,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'PABX_AVANCADO';

-- Perguntas para "OMNICHANNEL para Empresas"
INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que é uma solução Omnichannel?',
  ARRAY['Integração de múltiplos canais de comunicação', 'Sistema de telefonia apenas', 'Plataforma de email', 'Chat online'],
  0,
  'Omnichannel integra múltiplos canais de comunicação para uma experiência unificada.',
  1,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'OMNICHANNEL_EMPRESAS';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'Qual é o benefício principal do Omnichannel para empresas?',
  ARRAY['Melhorar a experiência do cliente', 'Reduzir custos de telefonia', 'Aumentar velocidade da internet', 'Melhorar qualidade do vídeo'],
  0,
  'O benefício principal é melhorar a experiência do cliente através de atendimento consistente em todos os canais.',
  2,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'OMNICHANNEL_EMPRESAS';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'Quais canais podem ser integrados em uma solução Omnichannel?',
  ARRAY['Telefone, email, chat, redes sociais', 'Apenas telefone e email', 'Apenas chat online', 'Apenas redes sociais'],
  0,
  'Uma solução Omnichannel pode integrar telefone, email, chat, redes sociais e outros canais de comunicação.',
  3,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'OMNICHANNEL_EMPRESAS';

-- Perguntas para "Configurações Avançadas OMNI"
INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que é roteamento inteligente em Omnichannel?',
  ARRAY['Direcionar interações para o agente mais adequado', 'Apenas distribuir chamadas', 'Apenas responder emails', 'Apenas gerenciar chat'],
  0,
  'Roteamento inteligente direciona interações para o agente mais adequado baseado em habilidades e disponibilidade.',
  1,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'OMNICHANNEL_AVANCADO';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'Como funciona a continuidade de conversa em Omnichannel?',
  ARRAY['Cliente pode alternar entre canais mantendo contexto', 'Apenas no mesmo canal', 'Apenas por telefone', 'Apenas por email'],
  0,
  'A continuidade permite que o cliente alterne entre canais mantendo o contexto da conversa.',
  2,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'OMNICHANNEL_AVANCADO';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que é análise preditiva em Omnichannel?',
  ARRAY['Antecipar necessidades do cliente', 'Apenas registrar interações', 'Apenas responder perguntas', 'Apenas gerenciar filas'],
  0,
  'Análise preditiva usa dados para antecipar necessidades do cliente e melhorar o atendimento.',
  3,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'OMNICHANNEL_AVANCADO';

-- Perguntas para "Fundamentos CALLCENTER"
INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'Qual é o objetivo principal de um call center?',
  ARRAY['Atender clientes', 'Vender produtos', 'Gerenciar estoque', 'Processar pagamentos'],
  0,
  'O objetivo principal de um call center é atender clientes de forma eficiente.',
  1,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'CALLCENTER_FUNDAMENTOS';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que significa SLA em um call center?',
  ARRAY['Service Level Agreement', 'System Level Access', 'Service License Agreement', 'System License Access'],
  0,
  'SLA significa Service Level Agreement, um acordo sobre o nível de serviço prestado.',
  2,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'CALLCENTER_FUNDAMENTOS';

INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem, data_criacao, data_atualizacao)
SELECT 
  gen_random_uuid(),
  q.id,
  'O que é um ACD em um call center?',
  ARRAY['Automatic Call Distributor', 'Automatic Call Device', 'Advanced Call Directory', 'Automatic Call Display'],
  0,
  'ACD significa Automatic Call Distributor, que distribui automaticamente as chamadas para os agentes disponíveis.',
  3,
  NOW(),
  NOW()
FROM quizzes q WHERE q.categoria = 'CALLCENTER_FUNDAMENTOS';

-- 6. Verificar os novos quizzes criados
SELECT '=== NOVOS QUIZZES CRIADOS ===' as info;
SELECT id, categoria, titulo, descricao FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
ORDER BY categoria;

-- 7. Verificar as novas perguntas criadas
SELECT '=== NOVAS PERGUNTAS CRIADAS ===' as info;
SELECT 
  qp.id,
  qp.quiz_id,
  q.categoria,
  q.titulo as quiz_titulo,
  qp.pergunta,
  qp.ordem
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
ORDER BY q.categoria, qp.ordem;

-- 8. Resumo final
SELECT '=== RESUMO DA ORGANIZAÇÃO ===' as info;
SELECT 
  'Quizzes criados' as item,
  COUNT(*) as total
FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
UNION ALL
SELECT 
  'Perguntas criadas' as item,
  COUNT(*)
FROM quiz_perguntas qp
JOIN quizzes q ON qp.quiz_id = q.id
WHERE q.categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS');

SELECT '=== PRÓXIMOS PASSOS ===' as info;
SELECT '1. Atualizar a lógica do frontend para mapear cursos com as novas categorias de quiz' as passo;
SELECT '2. Testar se cada curso agora mostra apenas seu quiz específico' as passo;
SELECT '3. Verificar se os quizzes antigos podem ser desabilitados' as passo;
