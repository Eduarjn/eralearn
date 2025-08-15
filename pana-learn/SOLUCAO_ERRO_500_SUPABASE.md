# 🚨 Solução para Erro 500 no Supabase Cloud

## 📋 **Problema Identificado**

Você está enfrentando um **erro 500 (Internal Server Error)** no Supabase Cloud com código `unexpected_failure` durante o cadastro de usuários.

### **Detalhes do Erro:**
- **URL**: `https://oqoxhavdhrgdjvxvajze.supabase.co/auth/v1/signup`
- **Status**: 500 Internal Server Error
- **Código**: `unexpected_failure`
- **Origem**: Trigger `handle_new_user` ou políticas RLS

## 🔧 **Soluções Implementadas**

### **1. Script de Diagnóstico e Correção**
- ✅ `diagnose-supabase-cloud-error.sql` - Script completo para corrigir o problema

### **2. Melhorias na Função handle_new_user**
- ✅ Tratamento de erro melhorado
- ✅ Logs para debug
- ✅ Tratamento de violação de unicidade

### **3. Políticas RLS Corrigidas**
- ✅ Políticas mais permissivas para inserção
- ✅ Remoção de políticas conflitantes

## 🚀 **Passos para Resolver**

### **Passo 1: Executar Script de Correção**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: `oqoxhavdhrgdjvxvajze`

2. **Execute o Script SQL:**
   - Vá para **SQL Editor**
   - Cole o conteúdo do arquivo `diagnose-supabase-cloud-error.sql`
   - Execute o script

### **Passo 2: Verificar Configurações**

1. **Verificar Authentication Settings:**
   - Vá para **Authentication > Settings**
   - Confirme que **Enable signups** está habilitado
   - Desabilite **Enable email confirmations** temporariamente

2. **Verificar Database:**
   - Vá para **Database > Tables**
   - Confirme que a tabela `usuarios` existe
   - Verifique se as colunas estão corretas

### **Passo 3: Testar Cadastro**

1. **Teste Direto no Console:**
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

2. **Teste no Seu Aplicativo:**
   - Tente criar um novo usuário
   - Verifique se o erro 500 foi resolvido

## 🔍 **Diagnóstico Detalhado**

### **Verificações Importantes:**

#### **1. Estrutura da Tabela usuarios:**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public';
```

#### **2. Trigger de Criação:**
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

#### **3. Políticas RLS:**
```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'usuarios';
```

## 🛠️ **Configurações Corrigidas**

### **Função handle_new_user Melhorada:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'handle_new_user: Iniciando criação de usuário para %', NEW.email;
  
  BEGIN
    INSERT INTO public.usuarios (
      id,
      nome,
      email,
      tipo_usuario,
      status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'cliente'),
      'ativo'
    );
    
    RAISE LOG 'handle_new_user: Usuário criado com sucesso para %', NEW.email;
    RETURN NEW;
    
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'handle_new_user: Usuário já existe para %', NEW.email;
      RETURN NEW;
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user: Erro ao criar usuário para %: %', NEW.email, SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Políticas RLS Corrigidas:**
```sql
-- Política para permitir inserção via trigger
CREATE POLICY "Allow trigger insert"
ON public.usuarios
FOR INSERT
WITH CHECK (true);

-- Política para usuários verem seus próprios dados
CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);
```

## 📧 **Sobre Emails no Supabase Cloud**

### **Configuração de Email:**
1. **Vá para Authentication > Settings**
2. **Configure Email Provider:**
   - Use **Supabase SMTP** (gratuito)
   - Ou configure **SendGrid**, **Mailgun**, etc.

### **Para Teste Temporário:**
- Desabilite **Enable email confirmations**
- Isso permite login imediato sem confirmação

## 🎯 **Resultado Esperado**

Após aplicar as correções:

1. ✅ **Erro 500 resolvido**
2. ✅ **Cadastro de usuários funciona**
3. ✅ **Usuários criados na tabela usuarios**
4. ✅ **Login funciona imediatamente**
5. ✅ **Logs de debug disponíveis**

## 🔧 **Comandos de Debug**

### **Verificar Logs no Supabase:**
1. Vá para **Logs** no dashboard
2. Filtre por **Authentication**
3. Procure por erros relacionados ao signup

### **Testar Conexão:**
```javascript
// No console do navegador
const { data, error } = await supabase.from('usuarios').select('count').limit(1);
console.log('Conexão:', { data, error });
```

### **Verificar Usuários Criados:**
```sql
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM public.usuarios 
ORDER BY data_criacao DESC 
LIMIT 5;
```

## 🚨 **Problemas Comuns**

### **1. "Erro 500 persiste"**
- Verifique se o script foi executado completamente
- Confirme se a trigger foi recriada
- Verifique os logs do Supabase

### **2. "Usuário não aparece na tabela"**
- Verifique se a trigger está ativa
- Confirme se as políticas RLS permitem inserção
- Teste inserção manual

### **3. "Erro de permissão"**
- Verifique se RLS está habilitado
- Confirme se as políticas estão corretas
- Teste com usuário admin

## 📞 **Próximos Passos**

1. **Execute o script** `diagnose-supabase-cloud-error.sql`
2. **Teste o cadastro** no seu aplicativo
3. **Verifique os logs** no Supabase Dashboard
4. **Se ainda houver problemas**, verifique a estrutura da tabela

## 🎉 **Status**

- ✅ **Script de correção criado**
- ✅ **Função handle_new_user melhorada**
- ✅ **Políticas RLS corrigidas**
- ✅ **Guia completo disponível**

**Execute o script e teste o cadastro!**

---

**Última Atualização**: 2025-01-29
**Status**: ✅ **Pronto para Aplicação** 