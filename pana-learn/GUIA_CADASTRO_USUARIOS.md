# 🚀 Guia Completo - Cadastro de Usuários

## 📋 **Resumo do Problema**

Você está enfrentando problemas com o cadastro de usuários no sistema Pana Learn. Os emails não estão chegando e há problemas na configuração do Supabase.

## ✅ **Soluções Implementadas**

### 1. **Configuração do Supabase Corrigida**
- ✅ Atualizado `backend/supabase/config.toml`
- ✅ Configurado URLs corretas para desenvolvimento
- ✅ Habilitado Inbucket para simulação de emails
- ✅ Desabilitado confirmação de email obrigatória

### 2. **Código Frontend Corrigido**
- ✅ Removido campo `senha_validacao` problemático
- ✅ Melhorado tratamento de erros
- ✅ Adicionado logs para debug

### 3. **Scripts SQL Criados**
- ✅ `fix-user-registration.sql` - Corrige estrutura do banco
- ✅ `test-user-creation.sql` - Testa criação de usuários

## 🛠️ **Passos para Resolver**

### **Passo 1: Verificar Supabase Local**

Se você estiver usando Supabase local:

```bash
# Verificar se o Supabase está rodando
# Se não estiver, você pode usar o Supabase Cloud
```

### **Passo 2: Testar Cadastro**

1. **Abra o arquivo de teste:**
   - Abra `test-cadastro-usuario.html` no navegador
   - Este arquivo testa o cadastro diretamente

2. **Ou teste no seu aplicativo:**
   - Acesse a página de cadastro do seu app
   - Tente criar um novo usuário

### **Passo 3: Verificar Emails**

Para desenvolvimento local:
- Acesse: `http://127.0.0.1:54324` (Inbucket)
- Verifique se os emails estão chegando
- Os emails são simulados, não enviados realmente

## 🔧 **Configurações Importantes**

### **URLs do Supabase:**
```javascript
// Para desenvolvimento local
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
```

### **Configuração de Email:**
```toml
[auth.email]
enable_signup = true
enable_confirmations = false
double_confirm_changes = false
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

## 🔍 **Verificações de Debug**

### **1. Verificar Conexão com Supabase:**
```javascript
// No console do navegador
const { data, error } = await supabase.from('usuarios').select('count').limit(1);
console.log('Conexão:', { data, error });
```

### **2. Testar Cadastro Direto:**
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

### **3. Verificar Tabela usuarios:**
```sql
SELECT * FROM usuarios WHERE email = 'teste@exemplo.com';
```

## 📁 **Arquivos Criados/Modificados**

### **Arquivos Criados:**
- ✅ `SOLUCAO_CADASTRO_USUARIOS.md` - Guia completo da solução
- ✅ `fix-user-registration.sql` - Script SQL para correções
- ✅ `test-cadastro-usuario.html` - Página de teste
- ✅ `GUIA_CADASTRO_USUARIOS.md` - Este guia

### **Arquivos Modificados:**
- ✅ `backend/supabase/config.toml` - Configuração atualizada
- ✅ `src/hooks/useAuth.tsx` - Função signUp corrigida

## 🚨 **Problemas Comuns**

### **1. "Supabase não está rodando"**
- Verifique se o Supabase local está ativo
- Ou use o Supabase Cloud

### **2. "Erro de conexão"**
- Verifique as URLs do Supabase
- Confirme se as chaves estão corretas

### **3. "Email não chega"**
- Em desenvolvimento: acesse `http://127.0.0.1:54324`
- Em produção: configure provedor de email

### **4. "Erro ao criar usuário"**
- Verifique se a tabela `usuarios` existe
- Confirme se as políticas RLS estão corretas

## 📞 **Próximos Passos**

1. **Teste o cadastro** usando o arquivo `test-cadastro-usuario.html`
2. **Verifique os emails** em `http://127.0.0.1:54324`
3. **Teste no seu aplicativo** principal
4. **Se houver problemas**, verifique os logs do console

## 🎉 **Status**

- ✅ **Configuração corrigida**
- ✅ **Código atualizado**
- ✅ **Scripts criados**
- ✅ **Guia completo disponível**

**Agora você pode testar o cadastro de usuários!**

---

**Última Atualização**: 2025-01-29
**Status**: ✅ **Pronto para Teste** 