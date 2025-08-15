# 🚀 Guia de Instalação - Módulo de IA

## 📋 Pré-requisitos

- ✅ Supabase configurado e funcionando
- ✅ Tabela `domains` criada e com pelo menos um domínio
- ✅ Usuários com `domain_id` configurado
- ✅ Feature flag `FEATURE_AI=true` habilitada

## 🔧 Passo a Passo

### 1. **Configurar Feature Flag**

Adicione ao seu arquivo `.env.local`:

```bash
VITE_FEATURE_AI=true
```

### 2. **Executar Migrations no Supabase**

#### **2.1. Primeira Migration - Tabelas**
Execute no SQL Editor do Supabase Dashboard:

```sql
-- Copie e cole o conteúdo do arquivo:
-- pana-learn/supabase/migrations/20250101000000-ai-module.sql
```

#### **2.2. Segunda Migration - RLS Policies**
Execute no SQL Editor do Supabase Dashboard:

```sql
-- Copie e cole o conteúdo do arquivo:
-- pana-learn/supabase/migrations/20250101000001-ai-policies.sql
```

### 3. **Deploy das Edge Functions**

#### **3.1. ai-chat**
```bash
cd pana-learn
supabase functions deploy ai-chat
```

#### **3.2. ai-embed**
```bash
supabase functions deploy ai-embed
```

### 4. **Configurar Variáveis de Ambiente**

Adicione ao seu arquivo `.env.local`:

```bash
# Feature Flag
VITE_FEATURE_AI=true

# Provedores de IA (opcional)
OPENAI_API_KEY=sk-your-openai-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-key
OPENROUTER_API_KEY=your-openrouter-key
```

### 5. **Testar a Instalação**

Execute o script de teste no SQL Editor:

```sql
-- Copie e cole o conteúdo do arquivo:
-- pana-learn/test-ai-module.sql
```

## 🎯 Verificações

### ✅ **Tabelas Criadas**
- `ai_providers`
- `ai_provider_keys`
- `ai_assistants`
- `ai_knowledge_sources`
- `ai_chunks`
- `ai_chat_sessions`
- `ai_messages`
- `ai_usage_limits`
- `ai_security_settings`

### ✅ **Extensões Ativas**
- `vector` (pgvector)
- `pgcrypto`

### ✅ **RLS Policies**
- Todas as tabelas com RLS habilitado
- Políticas por domínio configuradas

### ✅ **Frontend**
- Rota `/admin/ai` acessível
- 5 abas funcionando (Assistente, Conexões, Conhecimento, Logs, Segurança)

## 🚨 Solução de Problemas

### **Erro: "relation 'public.organizations' does not exist"**
- ✅ **SOLUÇÃO**: As migrations já foram corrigidas para usar `domains` em vez de `organizations`

### **Erro: "domain_id is null"**
- ✅ **SOLUÇÃO**: Verifique se os usuários têm `domain_id` configurado na tabela `usuarios`

### **Erro: "FEATURE_AI is not defined"**
- ✅ **SOLUÇÃO**: Adicione `VITE_FEATURE_AI=true` ao `.env.local`

### **Erro: "RLS policy violation"**
- ✅ **SOLUÇÃO**: Verifique se o usuário tem permissões de admin no domínio

### **Erro: "Edge Function not found"**
- ✅ **SOLUÇÃO**: Execute `supabase functions deploy ai-chat` e `supabase functions deploy ai-embed`

## 📱 Como Usar

### **1. Acessar o Módulo**
- Navegue para `/admin/ai`
- Faça login como admin de um domínio

### **2. Configurar Provedores**
- Aba "Conexões"
- Adicione provedores (OpenAI, Azure, OpenRouter)
- Configure chaves de API

### **3. Criar Assistentes**
- Aba "Assistente"
- Configure nome, prompt do sistema, modelo
- Habilite ferramentas desejadas

### **4. Adicionar Conhecimento**
- Aba "Conhecimento"
- Faça upload de documentos ou URLs
- Aguarde a indexação

### **5. Configurar Segurança**
- Aba "Segurança"
- Configure limites de uso
- Ative proteções de PII

## 🔒 Segurança

### **RLS Policies**
- ✅ Dados isolados por domínio
- ✅ Apenas admins podem gerenciar configurações
- ✅ Usuários veem apenas seus próprios dados

### **Criptografia**
- ✅ Chaves de API criptografadas
- ✅ PII mascarado automaticamente
- ✅ Logs de auditoria

### **Limites**
- ✅ Rate limiting configurável
- ✅ Limites de tokens por dia
- ✅ Controle de custos

## 📊 Monitoramento

### **Logs e Custos**
- Aba "Logs & Custos"
- Visualize uso por período
- Exporte dados em CSV
- Monitore custos em tempo real

### **Métricas**
- Total de interações
- Tokens consumidos
- Custos por provedor
- Usuários únicos

## 🆘 Suporte

### **Documentação**
- [Tipos TypeScript](./src/lib/ai-types.ts)
- [Utilitários](./src/lib/ai-utils.ts)
- [Hook Principal](./src/hooks/useAI.ts)

### **Componentes**
- [Página Principal](./src/pages/admin/ai/index.tsx)
- [Aba Assistente](./src/pages/admin/ai/Assistente.tsx)
- [Aba Conexões](./src/pages/admin/ai/Conexoes.tsx)
- [Aba Conhecimento](./src/pages/admin/ai/Conhecimento.tsx)
- [Aba Logs](./src/pages/admin/ai/LogsCustos.tsx)
- [Aba Segurança](./src/pages/admin/ai/Seguranca.tsx)

### **Edge Functions**
- [ai-chat](./supabase/functions/ai-chat/index.ts)
- [ai-embed](./supabase/functions/ai-embed/index.ts)

---

## 🎉 **Instalação Concluída!**

O módulo de IA está pronto para uso. Acesse `/admin/ai` para começar a configurar seus assistentes de IA.
