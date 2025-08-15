# 🚨 Solução - Criação de Usuários via API Admin

## 📋 **Problema Identificado**

Você está tentando criar usuários diretamente via API admin (`/auth/v1/admin/users`) e está recebendo erro 500 com `unexpected_failure`.

## 🔍 **Causa do Problema**

O erro acontece porque:
1. **API admin cria usuário** em `auth.users`
2. **Trigger `handle_new_user`** é executado automaticamente
3. **Trigger falha** ao tentar inserir na tabela `public.usuarios`
4. **Erro 500** é retornado

## 🛠️ **Solução Definitiva**

### **1. Execute o Script de Correção**

Execute o script `fix-admin-user-creation.sql` no SQL Editor do Supabase:

```sql
-- Execute o script completo
-- Ele vai:
-- 1. Verificar a estrutura da tabela
-- 2. Desabilitar RLS
-- 3. Recriar a função handle_new_user
-- 4. Recriar o trigger
-- 5. Testar a inserção
```

### **2. Verificar Configuração**

Após executar o script, verifique se:

- ✅ **RLS está desabilitado** na tabela `usuarios`
- ✅ **Função `handle_new_user`** foi recriada
- ✅ **Trigger `on_auth_user_created`** está ativo
- ✅ **Teste de inserção** funcionou

### **3. Testar Criação de Usuário**

Agora você pode criar usuários via API admin:

```bash
curl -X POST 'https://oqoxhavdhrgdjvxvajze.supabase.co/auth/v1/admin/users' \
  -H 'apikey: SEU_SERVICE_ROLE_KEY' \
  -H 'Authorization: Bearer SEU_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "teste@exemplo.com",
    "password": "123456",
    "email_confirm": true,
    "user_metadata": {
      "nome": "Usuário Teste",
      "tipo_usuario": "cliente"
    }
  }'
```

## 🎯 **Melhorias Implementadas**

### **1. Função `handle_new_user` Melhorada:**

- ✅ **Verifica se usuário já existe** antes de inserir
- ✅ **Tratamento robusto de erros**
- ✅ **Logs detalhados** para debug
- ✅ **Suporte a dados do LinkedIn**

### **2. RLS Desabilitado:**

- ✅ **Permite inserção** via trigger
- ✅ **Evita conflitos** de permissões
- ✅ **Funciona com API admin**

### **3. Trigger Recriado:**

- ✅ **Executa automaticamente** após criação
- ✅ **Não quebra** a criação de usuários
- ✅ **Logs informativos**

## 🚨 **Possíveis Causas do Erro Original**

### **1. RLS Habilitado:**
- A tabela `usuarios` tinha RLS ativo
- O trigger não conseguia inserir dados
- **Solução:** RLS desabilitado

### **2. Função com Erro:**
- A função `handle_new_user` tinha bugs
- **Solução:** Função recriada com tratamento robusto

### **3. Conflito de Dados:**
- Tentativa de inserir usuário duplicado
- **Solução:** Verificação antes da inserção

## 📞 **Próximos Passos**

### **1. Execute o Script:**
```sql
-- No SQL Editor do Supabase
-- Execute fix-admin-user-creation.sql
```

### **2. Teste a API:**
```bash
# Use a API admin para criar usuários
# Deve funcionar sem erro 500
```

### **3. Verifique os Logs:**
- Os logs do Supabase mostrarão se está funcionando
- Procure por mensagens de sucesso

## 🎉 **Resultado Esperado**

Após aplicar a correção:

- ✅ **API admin funciona** sem erro 500
- ✅ **Usuários criados** automaticamente na tabela `usuarios`
- ✅ **Trigger funciona** corretamente
- ✅ **Logs informativos** para debug

## 🔧 **Comandos de Debug**

### **Verificar Status:**
```sql
-- Verificar se RLS está desabilitado
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables 
WHERE tablename = 'usuarios' AND schemaname = 'public';

-- Verificar se trigger está ativo
SELECT 
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### **Testar Inserção Manual:**
```sql
-- Testar inserção direta
INSERT INTO public.usuarios (
  id,
  nome,
  email,
  tipo_usuario,
  status
) VALUES (
  gen_random_uuid(),
  'Teste Manual',
  'teste-manual@exemplo.com',
  'cliente',
  'ativo'
);
```

---

**Status**: ✅ **Pronto para Aplicação**
**Última Atualização**: 2025-01-29 