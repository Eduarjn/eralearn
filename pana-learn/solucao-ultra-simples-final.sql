-- ========================================
-- SOLUÇÃO ULTRA SIMPLES FINAL
-- ========================================
-- Esta solução resolve tudo sem complicações

-- 1. Adicionar campo updated_at simples
ALTER TABLE quiz_perguntas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Criar mapeamento curso-quiz
CREATE TABLE IF NOT EXISTS curso_quiz_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    quiz_categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curso_id)
);

-- 3. Limpar e inserir mapeamentos
DELETE FROM curso_quiz_mapping;

INSERT INTO curso_quiz_mapping (curso_id, quiz_categoria) VALUES
    ((SELECT id FROM cursos WHERE nome = 'Fundamentos de PABX' LIMIT 1), 'PABX_FUNDAMENTOS'),
    ((SELECT id FROM cursos WHERE nome = 'Configurações Avançadas PABX' LIMIT 1), 'PABX_AVANCADO'),
    ((SELECT id FROM cursos WHERE nome = 'OMNICHANNEL para Empresas' LIMIT 1), 'OMNICHANNEL_EMPRESAS'),
    ((SELECT id FROM cursos WHERE nome = 'Configurações Avançadas OMNI' LIMIT 1), 'OMNICHANNEL_AVANCADO'),
    ((SELECT id FROM cursos WHERE nome = 'Fundamentos CALLCENTER' LIMIT 1), 'CALLCENTER_FUNDAMENTOS')
ON CONFLICT (curso_id) DO UPDATE SET
    quiz_categoria = EXCLUDED.quiz_categoria,
    updated_at = NOW();

-- 4. Ativar apenas quizzes específicos
UPDATE quizzes SET ativo = false;
UPDATE quizzes SET ativo = true WHERE categoria IN (
    'PABX_FUNDAMENTOS',
    'PABX_AVANCADO',
    'OMNICHANNEL_EMPRESAS',
    'OMNICHANNEL_AVANCADO',
    'CALLCENTER_FUNDAMENTOS'
);

-- 5. Configurar permissões simples
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_perguntas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso a quizzes" ON quizzes;
CREATE POLICY "Permitir acesso a quizzes" ON quizzes FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir edição de perguntas" ON quiz_perguntas;
CREATE POLICY "Permitir edição de perguntas" ON quiz_perguntas FOR ALL USING (true);

-- 6. Verificar resultado
SELECT '=== RESULTADO ===' as info;
SELECT 
    c.nome as curso,
    cqm.quiz_categoria as quiz_especifico,
    q.ativo as ativo
FROM cursos c
JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
LEFT JOIN quizzes q ON cqm.quiz_categoria = q.categoria
ORDER BY c.nome;

SELECT '✅ PRONTO! Agora recarregue a plataforma e teste!' as final;





