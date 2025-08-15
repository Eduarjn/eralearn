# 🔧 Solução para Problemas de Cadastro de Usuários

## 📋 **Problemas Identificados**

### 1. **Configuração de Email**
- ✅ **Problema**: `enable_confirmations = false` mas sistema tenta enviar emails
- ✅ **Solução**: Configuração atualizada no `supabase/config.toml`

### 2. **Estrutura da Tabela**
- ✅ **Problema**: Campo `senha_validacao` pode não existir
- ✅ **Solução**: Removido da função `signUp`

### 3. **Políticas RLS**
- ✅ **Problema**: Políticas podem estar bloqueando inserção
- ✅ **Solução**: Script SQL para recriar políticas

## 🚀 **Passos para Resolver**

### **Passo 1: Reiniciar o Supabase**
```bash
# Parar o Supabase
supabase stop

# Iniciar novamente
supabase start
```

### **Passo 2: Executar Script de Correção**
```bash
# Executar o script de correção
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f fix-user-registration.sql
```

### **Passo 3: Verificar Configuração de Email**

#### **Para Desenvolvimento Local:**
1. Acesse: `http://127.0.0.1:54324` (Inbucket)
2. Verifique se os emails estão chegando
3. Os emails não são enviados realmente, apenas simulados

#### **Para Produção:**
1. Configure um provedor de email real (SendGrid, Mailgun, etc.)
2. Atualize as variáveis de ambiente no Supabase

### **Passo 4: Testar Cadastro**

#### **Teste 1: Cadastro Simples**
```javascript
// No console do navegador
const { data, error } = await supabase.auth.signUp({
  email: 'teste@exemplo.com',
  password: '123456',
  options: {
    data: {
      nome: 'Usuário Teste',
      tipo_usuario: 'cliente'
    }
  }
});
console.log('Resultado:', { data, error });
```

#### **Teste 2: Verificar Tabela**
```sql
-- Verificar se o usuário foi criado
SELECT * FROM usuarios WHERE email = 'teste@exemplo.com';
```

## 🔍 **Verificações Importantes**

### **1. Estrutura da Tabela usuarios**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public';
```

### **2. Trigger de Criação Automática**
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### **3. Políticas RLS**
```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'usuarios';
```

## 🛠️ **Configurações Atualizadas**

### **supabase/config.toml**
```toml
[auth]
site_url = "http://127.0.0.1:5173"
additional_redirect_urls = ["http://127.0.0.1:5173", "http://localhost:5173"]

[auth.email]
enable_signup = true
enable_confirmations = false
double_confirm_changes = false

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326
```

### **Função signUp Corrigida**
```typescript
const signUp = async (email: string, password: string, nome: string, tipo_usuario: 'admin' | 'cliente', senha_validacao: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          nome: nome.trim(),
          tipo_usuario: tipo_usuario
        }
      }
    });
    
    if (error) {
      return { error: { message: error.message } };
    }
    
    // A inserção na tabela usuarios será feita automaticamente pela trigger
    return { error: null };
  } catch (error) {
    return { error: { message: 'Erro interno no sistema' } };
  }
};
```

## 📧 **Sobre Emails**

### **Desenvolvimento Local:**
- ✅ Emails são simulados pelo Inbucket
- ✅ Acesse `http://127.0.0.1:54324` para ver emails
- ✅ Não há envio real de emails

### **Produção:**
- ⚠️ Configure um provedor de email real
- ⚠️ Atualize variáveis de ambiente
- ⚠️ Teste envio de emails

## 🎯 **Resultado Esperado**

Após aplicar as correções:

1. ✅ Cadastro de usuários funciona sem erros
2. ✅ Usuários são criados automaticamente na tabela `usuarios`
3. ✅ Login funciona imediatamente (sem confirmação de email)
4. ✅ Emails são simulados no ambiente de desenvolvimento
5. ✅ Políticas RLS funcionam corretamente

## 🔧 **Comandos Úteis**

### **Reiniciar Supabase:**
```bash
supabase stop
supabase start
```

### **Ver Logs:**
```bash
supabase logs
```

### **Reset Database:**
```bash
supabase db reset
```

### **Verificar Status:**
```bash
supabase status
```

## 📞 **Suporte**

Se ainda houver problemas:

1. ✅ Verifique os logs do Supabase
2. ✅ Teste com um email diferente
3. ✅ Verifique se o banco está rodando
4. ✅ Confirme se as migrações foram aplicadas

---

**Status**: ✅ **Solução Implementada**
**Última Atualização**: 2025-01-29 