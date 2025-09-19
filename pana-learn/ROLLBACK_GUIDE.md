# Guia de Rollback - Supabase Storage

Este guia explica como reverter a plataforma para o sistema de storage anterior caso seja necessário.

## Cenários de Rollback

### 1. Rollback Completo para Storage Local/External

Se você precisar voltar completamente para o sistema anterior:

#### Passos:

1. **Alterar variáveis de ambiente:**
```bash
# No seu .env.local
STORAGE_PROVIDER=external
VITE_APP_MODE=standalone  # ou 'local' conforme sua configuração anterior
```

2. **Reiniciar a aplicação:**
```bash
npm run dev
# ou
yarn dev
```

3. **Verificar se o servidor local está rodando (se aplicável):**
```bash
node local-upload-server.js
```

### 2. Rollback Parcial (Manter Supabase DB, Voltar Storage)

Se você quer manter o banco Supabase mas voltar o storage:

#### Passos:

1. **Alterar apenas a feature flag:**
```bash
STORAGE_PROVIDER=external
```

2. **Manter outras configurações Supabase:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_MODE=supabase
```

### 3. Rollback de Dados (Migração Reversa)

Se você migrou dados para Supabase Storage e quer voltar:

#### Opção A: Restaurar Backup do Banco

1. **Fazer backup atual (se necessário):**
```sql
-- No Supabase SQL Editor
SELECT * FROM videos WHERE provider = 'supabase';
```

2. **Restaurar backup anterior:**
```sql
-- Restaurar dados do backup anterior
UPDATE videos SET 
  provider = 'external',
  url_video = 'caminho_anterior',
  bucket = NULL,
  path = NULL
WHERE provider = 'supabase';
```

#### Opção B: Script de Rollback (TODO)

```typescript
// scripts/rollback-from-supabase-storage.ts
// TODO: Implementar script para baixar arquivos do Supabase Storage
// e restaurar URLs anteriores
```

## Verificações Pós-Rollback

### 1. Verificar Configuração Atual

```typescript
// No console do browser
console.log('Config:', getSupabaseConfig());
console.log('Storage Target:', getVideoUploadTarget());
```

### 2. Testar Upload de Vídeo

1. Acesse a página de upload
2. Tente fazer upload de um vídeo
3. Verifique se está usando o storage correto

### 3. Testar Reprodução de Vídeo

1. Acesse um curso com vídeos
2. Tente reproduzir um vídeo
3. Verifique se carrega corretamente

## Troubleshooting

### Problema: Vídeos não carregam após rollback

**Causa:** URLs antigas podem estar quebradas

**Solução:**
1. Verificar se o servidor local está rodando
2. Verificar se as URLs antigas ainda são válidas
3. Fazer re-upload dos vídeos se necessário

### Problema: Upload não funciona

**Causa:** Configuração de storage incorreta

**Solução:**
1. Verificar variáveis de ambiente
2. Reiniciar aplicação
3. Verificar logs do console

### Problema: Erro 401/403 na API de media

**Causa:** Configuração de autenticação

**Solução:**
1. Verificar se SUPABASE_SERVICE_ROLE_KEY está configurada
2. Verificar se o usuário está autenticado
3. Verificar políticas RLS no Supabase

## Configurações por Ambiente

### Desenvolvimento Local
```bash
STORAGE_PROVIDER=external
VITE_APP_MODE=standalone
VITE_API_URL=http://localhost:3001
```

### Produção com Supabase
```bash
STORAGE_PROVIDER=supabase
VITE_APP_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Produção com Storage External
```bash
STORAGE_PROVIDER=external
VITE_APP_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Não precisa de SUPABASE_SERVICE_ROLE_KEY para storage external
```

## Contatos e Suporte

Se você encontrar problemas durante o rollback:

1. Verifique os logs do console do browser
2. Verifique os logs do servidor
3. Consulte a documentação do Supabase
4. Abra uma issue no repositório

## Histórico de Mudanças

- **v1.0** - Implementação inicial do Supabase Storage
- **v0.9** - Sistema anterior com storage local/external






















