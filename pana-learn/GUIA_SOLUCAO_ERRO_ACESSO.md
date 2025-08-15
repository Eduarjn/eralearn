# Guia de Solução: Erro de Acesso após Implementação do Módulo de IA

## Problema Reportado
"deu certi inserir as querys porem agora não consigo acessar"

## Possíveis Causas e Soluções

### 1. Verificar se o Módulo de IA está Causando Conflito

**Sintoma**: Aplicação não carrega após inserir as queries do módulo de IA

**Solução**: Desabilitar temporariamente o módulo de IA

```bash
# No arquivo .env.local, adicione:
FEATURE_AI=false
VITE_FEATURE_AI=false
```

**Teste**: Recarregue a aplicação e verifique se o acesso foi restaurado.

### 2. Verificar Erros no Console do Navegador

**Passos**:
1. Abra o navegador
2. Pressione F12 para abrir as ferramentas de desenvolvedor
3. Vá para a aba "Console"
4. Procure por erros em vermelho
5. Copie e cole os erros aqui

### 3. Verificar se as Tabelas foram Criadas Corretamente

Execute o script de diagnóstico:

```sql
-- Execute este script no Supabase SQL Editor
-- Arquivo: diagnostico-acesso-ia.sql
```

### 4. Verificar Problemas de RLS (Row Level Security)

**Possível problema**: As políticas RLS podem estar bloqueando o acesso

**Solução temporária**: Desabilitar RLS nas tabelas AI

```sql
-- Execute no Supabase SQL Editor para desabilitar RLS temporariamente
ALTER TABLE ai_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistants DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_security_settings DISABLE ROW LEVEL SECURITY;
```

**Teste**: Verifique se o acesso foi restaurado.

### 5. Verificar Problemas no Hook useAI

**Possível problema**: O hook `useAI` pode estar causando erro na inicialização

**Solução**: Comentar temporariamente o import do módulo de IA

```typescript
// No arquivo src/App.tsx, comente a linha:
// import AIModulePage from '@/pages/admin/ai';

// E comente a rota:
// <Route path="/admin/ai" element={<ProtectedRoute><AIModulePage /></ProtectedRoute>} />
```

### 6. Verificar Problemas de Autenticação

**Possível problema**: As funções auxiliares podem estar com erro

**Solução**: Verificar se as funções existem

```sql
-- Verificar se as funções foram criadas
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_domain_admin', 'get_user_domain_id');
```

### 7. Verificar Problemas de Dependências

**Possível problema**: Extensões não instaladas

**Solução**: Instalar extensões necessárias

```sql
-- Instalar extensões se não existirem
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 8. Verificar Problemas de Tipos TypeScript

**Possível problema**: Erros de compilação TypeScript

**Solução**: Verificar se há erros de tipo

```bash
# No terminal, execute:
npm run build
# ou
npm run type-check
```

### 9. Verificar Problemas de Importação

**Possível problema**: Arquivos não encontrados

**Solução**: Verificar se todos os arquivos foram criados

```bash
# Verificar se os arquivos existem
ls src/pages/admin/ai/
ls src/hooks/useAI.ts
ls src/lib/ai-types.ts
ls src/lib/ai-utils.ts
```

### 10. Solução de Emergência - Rollback

Se nada funcionar, faça rollback das mudanças:

```sql
-- Remover tabelas do módulo de IA
DROP TABLE IF EXISTS ai_security_settings CASCADE;
DROP TABLE IF EXISTS ai_usage_limits CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS ai_chunks CASCADE;
DROP TABLE IF EXISTS ai_knowledge_sources CASCADE;
DROP TABLE IF EXISTS ai_assistants CASCADE;
DROP TABLE IF EXISTS ai_provider_keys CASCADE;
DROP TABLE IF EXISTS ai_providers CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS is_domain_admin(UUID);
DROP FUNCTION IF EXISTS get_user_domain_id();

-- Remover extensões (se não estiverem sendo usadas por outras tabelas)
-- DROP EXTENSION IF EXISTS pgvector;
-- DROP EXTENSION IF EXISTS pgcrypto;
```

## Passos de Diagnóstico

1. **Execute o script de diagnóstico** (`diagnostico-acesso-ia.sql`)
2. **Verifique o console do navegador** para erros
3. **Teste desabilitando o módulo de IA** temporariamente
4. **Verifique se há erros de compilação**
5. **Teste acessando outras páginas** para isolar o problema

## Informações Necessárias

Para ajudar no diagnóstico, forneça:

1. **Erro específico** que aparece na tela
2. **Erros do console** do navegador
3. **Resultado do script de diagnóstico**
4. **URL que está tentando acessar**
5. **Tipo de usuário** (admin, admin_master, cliente)

## Contato

Se o problema persistir, forneça as informações acima para análise detalhada.
