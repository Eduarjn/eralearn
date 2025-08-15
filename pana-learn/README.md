
# 🚀 ERA Learn - Plataforma de Educação

Uma plataforma moderna de educação com suporte a IA integrado, construída com React, TypeScript, Tailwind CSS e Supabase.

## ✨ Características

### 🎓 **Educação**
- ✅ Sistema de cursos e vídeos
- ✅ Progresso automático
- ✅ Quizzes integrados
- ✅ Certificados automáticos
- ✅ Gamificação

### 🤖 **Módulo de IA (Novo!)**
- ✅ Assistentes configuráveis
- ✅ Suporte a múltiplos provedores (OpenAI, Azure, OpenRouter)
- ✅ RAG (Retrieval Augmented Generation)
- ✅ Chat flutuante inteligente
- ✅ Controle de custos e limites
- ✅ Segurança e privacidade

### 🛡️ **Segurança**
- ✅ Autenticação Supabase
- ✅ RLS (Row Level Security)
- ✅ Controle de acesso por organização
- ✅ Criptografia de chaves de API

## 🚀 Quick Start

### 1. **Clone e Instale**

```bash
git clone <repository-url>
cd pana-learn
npm install
```

### 2. **Configure o Ambiente**

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Configure as variáveis necessárias
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
FEATURE_AI=true  # Para habilitar o módulo de IA
```

### 3. **Configure o Supabase**

#### **3.1. Execute as Migrations**

```sql
-- Execute no SQL Editor do Supabase Dashboard
-- 1. Migration principal
-- 2. Migration de IA (se habilitado)
```

#### **3.2. Configure RLS Policies**

As policies são aplicadas automaticamente pelas migrations.

### 4. **Execute o Projeto**

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🤖 **Módulo de IA**

### **Habilitando o Módulo**

1. **Configure a Feature Flag:**
   ```bash
   FEATURE_AI=true
   ```

2. **Execute as Migrations de IA:**
   ```sql
   -- Execute no Supabase Dashboard > SQL Editor
   -- 1. 20250101000000-ai-module.sql
   -- 2. 20250101000001-ai-policies.sql
   ```

3. **Configure Provedores de IA:**
   ```bash
   # OpenAI
   OPENAI_API_KEY=sk-...
   
   # Azure OpenAI
   AZURE_OPENAI_ENDPOINT=https://...
   AZURE_OPENAI_API_KEY=...
   
   # OpenRouter
   OPENROUTER_API_KEY=...
   ```

### **Funcionalidades do Módulo IA**

#### **🎯 Assistentes**
- Configure personalidades e comportamentos
- Defina prompts do sistema
- Ajuste temperatura e tokens
- Habilite ferramentas específicas

#### **🔌 Conexões**
- Suporte a OpenAI, Azure, OpenRouter
- Chaves criptografadas
- Teste de conectividade
- Monitoramento de uso

#### **📚 Conhecimento**
- Upload de PDFs, DOCs, URLs
- Indexação automática com RAG
- Chunks configuráveis
- Busca semântica

#### **📊 Logs & Custos**
- Monitoramento de uso
- Controle de custos
- Exportação de dados
- Métricas detalhadas

#### **🛡️ Segurança**
- Mascaramento de PII
- Termos bloqueados
- Escalação para humano
- Limites de uso

### **Integração com Chat Flutuante**

O chat flutuante "Suporte IA" usa automaticamente:
- Assistente configurado
- Provedor ativo
- Conhecimento indexado
- Configurações de segurança

## 🏗️ **Arquitetura**

### **Frontend**
```
src/
├── components/          # Componentes React
├── pages/              # Páginas da aplicação
│   └── admin/ai/       # Módulo de IA
├── hooks/              # Hooks customizados
│   └── useAI.ts        # Hook principal de IA
├── lib/                # Utilitários
│   ├── ai-types.ts     # Tipos TypeScript
│   └── ai-utils.ts     # Funções utilitárias
└── integrations/       # Integrações externas
    └── supabase/       # Cliente Supabase
```

### **Backend (Supabase)**
```
supabase/
├── functions/          # Edge Functions
│   ├── ai-chat/        # Chat de IA
│   ├── ai-embed/       # Indexação RAG
│   └── ai-usage/       # Métricas de uso
└── migrations/         # Migrations SQL
    ├── ai-module.sql   # Tabelas de IA
    └── ai-policies.sql # RLS Policies
```

### **Tabelas de IA**
- `ai_providers` - Provedores configurados
- `ai_provider_keys` - Chaves criptografadas
- `ai_assistants` - Assistentes configurados
- `ai_knowledge_sources` - Fontes de conhecimento
- `ai_chunks` - Chunks com embeddings
- `ai_chat_sessions` - Sessões de chat
- `ai_messages` - Mensagens das sessões
- `ai_usage_limits` - Limites de uso
- `ai_security_settings` - Configurações de segurança

## 🔧 **Desenvolvimento**

### **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

### **Estrutura de Desenvolvimento**

1. **Feature Flags:** Tudo atrás de `FEATURE_AI=true`
2. **Aditivo:** Não modifica código existente
3. **Seguro:** RLS policies em todas as tabelas
4. **Tipado:** TypeScript completo
5. **Testado:** Validação com Zod

### **Adicionando Novos Provedores**

1. **Atualize os tipos:**
   ```typescript
   // lib/ai-types.ts
   export type AIProvider = 'openai' | 'azure' | 'openrouter' | 'novo_provedor';
   ```

2. **Adicione configuração:**
   ```typescript
   // lib/ai-utils.ts
   export const AI_SUPPORTED_MODELS = {
     novo_provedor: ['modelo1', 'modelo2'],
   };
   ```

3. **Implemente na Edge Function:**
   ```typescript
   // supabase/functions/ai-chat/index.ts
   function getProviderBaseUrl(provider: string): string {
     const urls = {
       novo_provedor: 'https://api.novo-provedor.com',
     };
     return urls[provider] || urls.openai;
   }
   ```

## 🚀 **Deploy**

### **Vercel (Recomendado)**

1. **Configure as variáveis de ambiente:**
   ```bash
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   FEATURE_AI=true
   OPENAI_API_KEY=...
   ```

2. **Deploy automático:**
   ```bash
   vercel --prod
   ```

### **Supabase Edge Functions**

```bash
# Deploy das Edge Functions
supabase functions deploy ai-chat
supabase functions deploy ai-embed
supabase functions deploy ai-usage
```

## 📊 **Monitoramento**

### **Logs de IA**
- Todas as interações são logadas
- Custos calculados automaticamente
- Métricas de performance
- Alertas de limites

### **Dashboard de Uso**
- Acesse em `/admin/ai`
- Visualize uso por período
- Exporte relatórios
- Configure alertas

## 🔒 **Segurança**

### **Proteções Implementadas**
- ✅ Chaves de API nunca expostas no frontend
- ✅ RLS policies por organização
- ✅ Criptografia de dados sensíveis
- ✅ Validação de entrada com Zod
- ✅ Rate limiting configurável
- ✅ Mascaramento de PII

### **Boas Práticas**
- Sempre use Edge Functions para APIs externas
- Valide todas as entradas
- Implemente rate limiting
- Monitore uso e custos
- Mantenha chaves seguras

## 🤝 **Contribuição**

1. **Fork o projeto**
2. **Crie uma branch:**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. **Commit suas mudanças:**
   ```bash
   git commit -m 'Adiciona nova funcionalidade'
   ```
4. **Push para a branch:**
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. **Abra um Pull Request**

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 **Suporte**

- **Documentação:** [Wiki do projeto]
- **Issues:** [GitHub Issues]
- **Discord:** [Servidor da comunidade]

---

**Desenvolvido com ❤️ pela equipe ERA Learn**
