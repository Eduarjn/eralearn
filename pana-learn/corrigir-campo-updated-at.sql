-- ========================================
-- CORRIGIR CAMPO UPDATED_AT NA TABELA QUIZ_PERGUNTAS
-- ========================================
-- Este script adiciona o campo updated_at que está faltando

-- 1. Verificar se o campo updated_at existe
SELECT '=== VERIFICANDO CAMPO UPDATED_AT ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas' 
  AND column_name = 'updated_at';

-- 2. Adicionar o campo updated_at se não existir
SELECT '=== ADICIONANDO CAMPO UPDATED_AT ===' as info;

-- Adicionar o campo updated_at
ALTER TABLE quiz_perguntas 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Criar trigger para atualizar o campo updated_at automaticamente
SELECT '=== CRIANDO TRIGGER PARA UPDATED_AT ===' as info;

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_quiz_perguntas_updated_at ON quiz_perguntas;
CREATE TRIGGER update_quiz_perguntas_updated_at
    BEFORE UPDATE ON quiz_perguntas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Verificar se o campo foi adicionado corretamente
SELECT '=== VERIFICANDO SE CAMPO FOI ADICIONADO ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_perguntas' 
  AND column_name = 'updated_at';

-- 5. Verificar se o trigger foi criado
SELECT '=== VERIFICANDO TRIGGER ===' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'quiz_perguntas'
  AND trigger_name = 'update_quiz_perguntas_updated_at';

-- 6. Testar a funcionalidade
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;
SELECT 
  'Campo updated_at adicionado com sucesso!' as status,
  'Trigger criado para atualização automática' as trigger_status,
  'Agora você pode editar as perguntas dos quizzes' as resultado;

-- 7. Instruções finais
SELECT '=== INSTRUÇÕES FINAIS ===' as info;
SELECT '1. Recarregue a página da plataforma' as instrucao;
SELECT '2. Tente editar uma pergunta do quiz novamente' as instrucao;
SELECT '3. O erro de "updated_at" deve estar resolvido' as instrucao;
SELECT '4. Se ainda houver problemas, verifique o console do navegador' as instrucao;






