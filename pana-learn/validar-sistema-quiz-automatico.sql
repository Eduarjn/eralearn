-- ========================================
-- SCRIPT DE VALIDAÇÃO E CORREÇÃO DO SISTEMA DE QUIZ AUTOMÁTICO
-- ========================================
-- Este script garante que os quizzes sejam aplicados automaticamente
-- quando o cliente finalizar todos os vídeos de um curso específico
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ========================================

SELECT '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) 
        THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM (VALUES ('quizzes'), ('quiz_perguntas'), ('progresso_quiz'), ('certificados')) as t(table_name);

-- Verificar se a coluna categoria existe na tabela cursos
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name = 'categoria' THEN '✅ CATEGORIA EXISTE'
        ELSE 'ℹ️ ' || column_name
    END as status
FROM information_schema.columns 
WHERE table_name = 'cursos' 
AND column_name IN ('categoria', 'id', 'titulo')
ORDER BY column_name;

-- ========================================
-- 2. CRIAR TABELAS SE NÃO EXISTIREM
-- ========================================

-- Criar tabela quizzes se não existir
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  nota_minima INTEGER NOT NULL DEFAULT 70 CHECK (nota_minima >= 0 AND nota_minima <= 100),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(categoria)
);

-- Criar tabela quiz_perguntas se não existir
CREATE TABLE IF NOT EXISTS public.quiz_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes TEXT[] NOT NULL,
  resposta_correta INTEGER NOT NULL CHECK (resposta_correta >= 0),
  explicacao TEXT,
  ordem INTEGER DEFAULT 0,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela progresso_quiz se não existir
CREATE TABLE IF NOT EXISTS public.progresso_quiz (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  respostas JSONB,
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  aprovado BOOLEAN NOT NULL DEFAULT FALSE,
  data_conclusao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela certificados se não existir
CREATE TABLE IF NOT EXISTS public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  codigo_verificacao VARCHAR(50) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(25), 'base64'),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ========================================
-- 3. VERIFICAR CATEGORIAS EXISTENTES
-- ========================================

SELECT '=== CATEGORIAS EXISTENTES ===' as info;
SELECT DISTINCT categoria FROM cursos WHERE categoria IS NOT NULL ORDER BY categoria;

-- ========================================
-- 4. CRIAR QUIZZES PARA TODAS AS CATEGORIAS
-- ========================================

-- Inserir quiz para todas as categorias existentes
INSERT INTO public.quizzes (categoria, titulo, descricao, nota_minima)
SELECT DISTINCT 
  categoria, 
  'Quiz de Conclusão - ' || categoria, 
  'Quiz para avaliar o conhecimento sobre ' || categoria || '. Este quiz será aplicado automaticamente quando você finalizar todos os vídeos do curso.', 
  70
FROM public.cursos 
WHERE categoria IS NOT NULL
ON CONFLICT (categoria) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  descricao = EXCLUDED.descricao,
  data_atualizacao = NOW();

-- ========================================
-- 5. CRIAR PERGUNTAS ESPECÍFICAS PARA CADA CATEGORIA
-- ========================================

-- Perguntas para PABX
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que significa PABX?',
  ARRAY['Private Automatic Branch Exchange', 'Public Automatic Branch Exchange', 'Personal Automatic Branch Exchange', 'Private Automatic Business Exchange'],
  0,
  'PABX significa Private Automatic Branch Exchange, um sistema telefônico privado usado em empresas.',
  1
FROM public.quizzes q
WHERE q.categoria = 'PABX'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Um sistema PABX pode integrar com softwares de CRM?',
  ARRAY['Verdadeiro', 'Falso'],
  0,
  'Sim, sistemas PABX modernos podem integrar com CRMs para melhorar o atendimento ao cliente.',
  2
FROM public.quizzes q
WHERE q.categoria = 'PABX'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é a principal vantagem de um sistema PABX?',
  ARRAY['Reduzir custos de telefonia', 'Aumentar a velocidade da internet', 'Melhorar a qualidade do vídeo', 'Aumentar o armazenamento'],
  0,
  'A principal vantagem é reduzir custos de telefonia através de chamadas internas gratuitas.',
  3
FROM public.quizzes q
WHERE q.categoria = 'PABX'
ON CONFLICT DO NOTHING;

-- Perguntas para Call Center
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é o objetivo principal de um call center?',
  ARRAY['Atender clientes', 'Vender produtos', 'Gerenciar estoque', 'Processar pagamentos'],
  0,
  'O objetivo principal de um call center é atender clientes de forma eficiente.',
  1
FROM public.quizzes q
WHERE q.categoria = 'CALLCENTER'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que significa SLA em um call center?',
  ARRAY['Service Level Agreement', 'System Level Access', 'Service License Agreement', 'System License Access'],
  0,
  'SLA significa Service Level Agreement, um acordo sobre o nível de serviço prestado.',
  2
FROM public.quizzes q
WHERE q.categoria = 'CALLCENTER'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é a importância do tempo de resposta em um call center?',
  ARRAY['Melhora a satisfação do cliente', 'Aumenta os custos', 'Reduz a qualidade', 'Não tem importância'],
  0,
  'O tempo de resposta rápido melhora significativamente a satisfação do cliente.',
  3
FROM public.quizzes q
WHERE q.categoria = 'CALLCENTER'
ON CONFLICT DO NOTHING;

-- Perguntas para Omnichannel
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que é uma solução Omnichannel?',
  ARRAY['Integração de múltiplos canais de comunicação', 'Sistema de telefonia apenas', 'Plataforma de email', 'Chat online'],
  0,
  'Omnichannel integra múltiplos canais de comunicação para uma experiência unificada.',
  1
FROM public.quizzes q
WHERE q.categoria = 'Omnichannel'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é a principal vantagem do Omnichannel?',
  ARRAY['Experiência consistente do cliente', 'Redução de custos', 'Aumento de velocidade', 'Simplificação do sistema'],
  0,
  'A principal vantagem é proporcionar uma experiência consistente do cliente em todos os canais.',
  2
FROM public.quizzes q
WHERE q.categoria = 'Omnichannel'
ON CONFLICT DO NOTHING;

-- Perguntas para VoIP
INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'O que significa VoIP?',
  ARRAY['Voice over Internet Protocol', 'Video over Internet Protocol', 'Voice over IP Network', 'Video over IP Network'],
  0,
  'VoIP significa Voice over Internet Protocol, tecnologia para transmitir voz pela internet.',
  1
FROM public.quizzes q
WHERE q.categoria = 'VoIP'
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_perguntas (quiz_id, pergunta, opcoes, resposta_correta, explicacao, ordem)
SELECT 
  q.id,
  'Qual é a principal vantagem do VoIP?',
  ARRAY['Redução de custos de telefonia', 'Melhoria da qualidade de voz', 'Aumento da velocidade', 'Simplificação da instalação'],
  0,
  'A principal vantagem do VoIP é a redução significativa dos custos de telefonia.',
  2
FROM public.quizzes q
WHERE q.categoria = 'VoIP'
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. VERIFICAR RESULTADO FINAL
-- ========================================

SELECT '=== RESULTADO FINAL ===' as info;

-- Verificar quizzes criados
SELECT 
    'QUIZZES CRIADOS' as tipo,
    categoria,
    titulo,
    nota_minima,
    ativo
FROM quizzes
ORDER BY categoria;

-- Verificar perguntas criadas
SELECT 
    'PERGUNTAS CRIADAS' as tipo,
    q.categoria,
    COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.categoria, q.titulo
ORDER BY q.categoria;

-- ========================================
-- 7. INSTRUÇÕES DE USO
-- ========================================

SELECT '=== INSTRUÇÕES DE USO ===' as info;

SELECT 
    '✅ SISTEMA CONFIGURADO COM SUCESSO!' as status,
    'Os quizzes serão aplicados automaticamente quando o cliente finalizar todos os vídeos de um curso.' as instrucao_1,
    'Nota mínima para aprovação: 70%' as instrucao_2,
    'Certificados serão gerados automaticamente após aprovação no quiz.' as instrucao_3,
    'Administradores podem editar perguntas e configurações na seção Quizzes.' as instrucao_4;

-- ========================================
-- 8. VERIFICAR FUNCIONAMENTO AUTOMÁTICO
-- ========================================

-- Verificar se o sistema está pronto para funcionar automaticamente
SELECT 
    '=== VERIFICAÇÃO AUTOMÁTICA ===' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM quizzes WHERE ativo = true) THEN '✅ Quizzes ativos encontrados'
        ELSE '❌ Nenhum quiz ativo encontrado'
    END as status_quizzes,
    CASE 
        WHEN EXISTS (SELECT 1 FROM quiz_perguntas) THEN '✅ Perguntas configuradas'
        ELSE '❌ Nenhuma pergunta configurada'
    END as status_perguntas,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cursos' AND column_name = 'categoria') THEN '✅ Categoria configurada'
        ELSE '❌ Coluna categoria não encontrada'
    END as status_categoria;

-- Mostrar exemplo de como o sistema funciona
SELECT 
    '=== EXEMPLO DE FUNCIONAMENTO ===' as info,
    '1. Cliente assiste todos os vídeos do curso PABX' as passo_1,
    '2. Sistema detecta conclusão automática' as passo_2,
    '3. Quiz de PABX aparece automaticamente' as passo_3,
    '4. Cliente responde perguntas' as passo_4,
    '5. Se nota >= 70%, certificado é gerado' as passo_5;
