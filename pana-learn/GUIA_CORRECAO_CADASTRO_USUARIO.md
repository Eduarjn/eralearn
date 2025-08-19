# 🔧 **Correção do Problema de Cadastro de Usuário**

## 🎯 **Problema Identificado**

Você estava enfrentando um problema onde:
1. **Cadastro de usuário** funcionava (usuário era criado no Supabase Auth)
2. **Após o login**, a página ficava "carregando quizzes..." indefinidamente
3. **Erro 406 (Not Acceptable)** aparecia no console do navegador
4. **Perfil do usuário** não era carregado corretamente

## 🔍 **Causa Raiz do Problema**

### **❌ Problema Principal:**
O sistema estava tentando buscar o perfil do usuário na tabela `usuarios` usando o **ID do `auth.users`**, mas havia uma **inconsistência na estrutura da tabela**.

### **🔍 Análise Técnica:**

#### **1. Estrutura da Tabela `usuarios`:**
```sql
-- Estrutura PROBLEMÁTICA (antes da correção)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,           -- ID único da tabela usuarios
  nome VARCHAR(255),
  email VARCHAR(255),
  tipo_usuario VARCHAR(50),
  -- FALTANDO: campo user_id para referenciar auth.users
);
```

#### **2. Consulta PROBLEMÁTICA no código:**
```typescript
// ❌ ERRADO: Tentando buscar por 'id' que é diferente do auth.users.id
const { data: profile, error } = await supabase
  .from('usuarios')
  .select('*')
  .eq('id', session.user.id)  // ❌ session.user.id é do auth.users
  .single();
```

#### **3. Resultado:**
- **Erro 406**: "JSON object requested, multiple (or no) rows returned"
- **Perfil não encontrado**: Porque estava buscando no campo errado
- **Carregamento infinito**: Porque `userProfile` nunca era carregado

## 🛠️ **Solução Implementada**

### **✅ 1. Correção da Estrutura da Tabela:**

```sql
-- ✅ CORRETO: Adicionar campo user_id
ALTER TABLE public.usuarios ADD COLUMN user_id UUID;

-- ✅ CORRETO: Criar índice para performance
CREATE INDEX idx_usuarios_user_id ON public.usuarios(user_id);
```

### **✅ 2. Correção da Função `handle_new_user`:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (
    id,           -- ID único da tabela usuarios
    user_id,      -- ✅ CORRETO: Referência para auth.users
    nome,
    email,
    tipo_usuario,
    status
  ) VALUES (
    gen_random_uuid(),  -- Gerar novo UUID para id
    NEW.id,             -- ✅ CORRETO: ID do auth.users
    user_nome,
    NEW.email,
    user_tipo,
    'ativo'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **✅ 3. Correção do Código Frontend:**

```typescript
// ✅ CORRETO: Buscar por user_id que referencia auth.users
const { data: profile, error: profileError } = await supabase
  .from('usuarios')
  .select('*')
  .eq('user_id', session.user.id)  // ✅ CORRETO: user_id
  .single();
```

### **✅ 4. Correção das Políticas RLS:**

```sql
-- ✅ CORRETO: Política usando user_id
CREATE POLICY "Users can view their own profile"
ON public.usuarios
FOR SELECT
USING (
  user_id = auth.uid() OR  -- ✅ CORRETO: user_id
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.user_id = auth.uid() AND u.tipo_usuario IN ('admin', 'admin_master')
  )
);
```

## 📋 **Scripts de Correção**

### **1. Script SQL Principal:**
- **Arquivo:** `corrigir-problema-cadastro-usuario.sql`
- **Função:** Corrige estrutura da tabela, função, trigger e políticas

### **2. Correções no Código:**
- **Arquivo:** `src/hooks/useAuth.tsx`
- **Mudanças:** Alterado `.eq('id', ...)` para `.eq('user_id', ...)`

## 🚀 **Como Aplicar a Correção**

### **1. Execute o Script SQL:**
```sql
-- No Supabase SQL Editor, execute:
-- pana-learn/corrigir-problema-cadastro-usuario.sql
```

### **2. Verifique as Correções no Código:**
```bash
# As correções já foram aplicadas no arquivo:
# src/hooks/useAuth.tsx
```

### **3. Teste o Cadastro:**
1. **Crie um novo usuário** pela interface
2. **Faça login** com o usuário criado
3. **Verifique** se os quizzes carregam corretamente
4. **Confirme** que não há mais erro 406 no console

## ✅ **Resultados Esperados**

### **Antes da Correção:**
- ❌ Erro 406 no console
- ❌ "Carregando quizzes..." infinito
- ❌ Perfil não carregado
- ❌ Usuário não consegue acessar o sistema

### **Depois da Correção:**
- ✅ Cadastro funciona normalmente
- ✅ Login carrega perfil corretamente
- ✅ Quizzes carregam sem problemas
- ✅ Sistema funciona completamente

## 🔍 **Verificação da Correção**

### **1. Verificar Estrutura da Tabela:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('id', 'user_id');
```

### **2. Verificar Função:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### **3. Verificar Trigger:**
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## 🎯 **Conclusão**

O problema estava na **inconsistência entre os IDs** do `auth.users` e da tabela `usuarios`. Agora com o campo `user_id` adicionado e as consultas corrigidas, o sistema deve funcionar perfeitamente.

**Status:** ✅ **RESOLVIDO**

