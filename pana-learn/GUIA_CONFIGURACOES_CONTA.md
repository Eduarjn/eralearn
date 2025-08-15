# 🔧 Guia - Configurações da Conta

## 📋 **Funcionalidades Implementadas**

### **1. Atualização de Perfil**
- ✅ **Nome do usuário** - Atualização em tempo real
- ✅ **Email** - Exibição (não editável por segurança)
- ✅ **Avatar** - Upload e atualização de foto de perfil

### **2. Alteração de Senha**
- ✅ **Validação de senha atual** - Verifica se a senha está correta
- ✅ **Validação de nova senha** - Mínimo 6 caracteres
- ✅ **Confirmação de senha** - Verifica se as senhas coincidem
- ✅ **Atualização segura** - Usa Supabase Auth

### **3. Upload de Avatar**
- ✅ **Validação de arquivo** - Apenas imagens
- ✅ **Validação de tamanho** - Máximo 5MB
- ✅ **Upload para Storage** - Bucket 'avatars'
- ✅ **Atualização automática** - Interface atualizada

## 🛠️ **Scripts Preparados**

### **1. Correção da Tabela:**
- ✅ `fix-user-profile-table.sql` - Adiciona coluna avatar_url e políticas RLS

### **2. Funções do useAuth:**
- ✅ `updateProfile()` - Atualiza dados do perfil
- ✅ `updatePassword()` - Altera senha com validação
- ✅ `updateAvatar()` - Atualiza avatar do usuário

## 🚀 **Como Usar**

### **1. Execute o Script SQL:**
```sql
-- No SQL Editor do Supabase
-- Execute fix-user-profile-table.sql
```

### **2. Configure o Storage:**
1. **Acesse:** Supabase Dashboard > Storage
2. **Crie bucket:** `avatars` (se não existir)
3. **Configure políticas:** Permitir upload de imagens

### **3. Teste as Funcionalidades:**

#### **Alterar Nome:**
- Digite no campo "Nome Completo"
- Atualização automática em tempo real

#### **Alterar Senha:**
1. Digite a senha atual
2. Digite a nova senha (mínimo 6 caracteres)
3. Confirme a nova senha
4. Clique em "Alterar Senha"

#### **Alterar Avatar:**
1. Clique em "Alterar foto"
2. Selecione uma imagem (máximo 5MB)
3. Upload automático e atualização

## 🔧 **Configurações do Storage**

### **Bucket 'avatars':**
```sql
-- Política para upload de avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para visualizar avatars
CREATE POLICY "Users can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

## 🎯 **Validações Implementadas**

### **Upload de Avatar:**
- ✅ **Tipo de arquivo:** Apenas imagens
- ✅ **Tamanho:** Máximo 5MB
- ✅ **Formato:** JPG, PNG, GIF, etc.

### **Alteração de Senha:**
- ✅ **Senha atual:** Verificação obrigatória
- ✅ **Nova senha:** Mínimo 6 caracteres
- ✅ **Confirmação:** Senhas devem coincidir

### **Atualização de Perfil:**
- ✅ **Nome:** Atualização em tempo real
- ✅ **Avatar:** Upload seguro
- ✅ **Persistência:** Dados salvos no banco

## 🚨 **Possíveis Problemas**

### **1. "Erro ao fazer upload"**
- Verifique se o bucket 'avatars' existe
- Confirme as políticas de storage
- Verifique o tamanho do arquivo

### **2. "Senha atual incorreta"**
- Confirme a senha atual
- Verifique se o usuário está logado
- Tente fazer logout e login novamente

### **3. "Erro ao atualizar perfil"**
- Execute o script SQL
- Verifique as políticas RLS
- Confirme se o usuário tem permissão

## 📞 **Próximos Passos**

### **1. Execute o Script:**
```sql
-- Execute fix-user-profile-table.sql
```

### **2. Configure Storage:**
- Crie bucket 'avatars'
- Configure políticas de acesso

### **3. Teste as Funcionalidades:**
- Altere o nome do usuário
- Faça upload de uma foto
- Altere a senha

## 🎉 **Status**

- ✅ **Funções implementadas** no useAuth
- ✅ **Componente atualizado** no Configuracoes.tsx
- ✅ **Validações robustas** implementadas
- ✅ **Script SQL preparado**
- ✅ **Guia completo** disponível

**Todas as funcionalidades de configurações da conta estão prontas para uso!**

---

**Última Atualização**: 2025-01-29
**Status**: ✅ **Pronto para Uso** 