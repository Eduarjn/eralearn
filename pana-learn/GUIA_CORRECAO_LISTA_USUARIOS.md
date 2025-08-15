# 🔧 **Correção da Lista de Usuários - Visualizar Todos os Usuários**

## 🎯 **Problema Identificado**

A lista de usuários está mostrando apenas administradores em vez de **todos os usuários** (clientes, admins, admin_masters).

## 🔍 **Análise do Código**

### **✅ Frontend (src/pages/Usuarios.tsx):**
```typescript
// Consulta SQL correta - busca TODOS os usuários
const { data: usersData, count, error } = await supabase
  .from('usuarios')
  .select('*', { count: 'exact' })
  .order('data_criacao', { ascending: false });
```

**Status:** ✅ **CORRETO** - O frontend já está buscando todos os usuários

### **❌ Problema Provável: Políticas RLS (Row Level Security)**

O problema está nas **políticas de segurança** do Supabase que podem estar restringindo o acesso apenas a administradores.

## 🛠️ **Solução**

### **1. Execute o Script de Correção:**

```sql
-- Execute este script no Supabase SQL Editor
-- Arquivo: fix-users-rls-policies.sql
```

### **2. O que o Script Faz:**

#### **✅ Remove Políticas Restritivas:**
- Remove políticas que limitam visualização apenas a admins
- Remove políticas que restringem acesso por tipo de usuário

#### **✅ Cria Políticas Corretas:**
- **SELECT:** Todos os usuários autenticados podem ver todos os usuários
- **INSERT:** Apenas admins podem criar usuários
- **UPDATE:** Apenas admins podem editar usuários  
- **DELETE:** Apenas admins podem excluir usuários

### **3. Políticas Implementadas:**

```sql
-- Política para visualização (SELECT)
CREATE POLICY "Todos podem ver usuários" ON usuarios
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para criação (INSERT) - apenas admins
CREATE POLICY "Apenas admins podem criar usuários" ON usuarios
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE user_id = auth.uid() 
            AND tipo_usuario IN ('admin', 'admin_master')
        )
    );
```

## 📋 **Passos para Correção**

### **Passo 1: Execute o Script**
1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o arquivo `fix-users-rls-policies.sql`

### **Passo 2: Verifique os Resultados**
O script mostrará:
- ✅ **Políticas RLS corrigidas**
- ✅ **Total de usuários visíveis**
- ✅ **Distribuição por tipo de usuário**

### **Passo 3: Teste no Frontend**
1. Recarregue a página de usuários
2. Verifique se aparecem **todos os tipos de usuários**:
   - **Administradores** (admin)
   - **Clientes** (cliente)  
   - **Admin Masters** (admin_master)

## 🎯 **Resultado Esperado**

### **✅ Antes da Correção:**
- Lista mostra apenas administradores
- Clientes não aparecem
- Políticas RLS restritivas

### **✅ Depois da Correção:**
- Lista mostra **TODOS os usuários**
- Clientes aparecem normalmente
- Políticas RLS corretas

## 📊 **Verificação**

### **✅ Estatísticas Esperadas:**
```sql
-- Deve mostrar todos os tipos
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN tipo_usuario = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN tipo_usuario = 'cliente' THEN 1 END) as clientes,
    COUNT(CASE WHEN tipo_usuario = 'admin_master' THEN 1 END) as admin_masters
FROM usuarios;
```

### **✅ Interface Esperada:**
- **Tabela completa** com todos os usuários
- **Badges corretos** para cada tipo:
  - 🟢 **Admin** para administradores
  - 🔵 **Cliente** para clientes
  - 🟡 **Admin Master** para admin masters

## 🚀 **Próximos Passos**

### **1. Execute o Script:**
```bash
# No Supabase SQL Editor
# Execute: fix-users-rls-policies.sql
```

### **2. Teste a Aplicação:**
- Acesse a página de usuários
- Verifique se todos os usuários aparecem
- Teste a busca e filtros

### **3. Verificação Final:**
- [ ] Todos os tipos de usuários aparecem
- [ ] Busca funciona para todos os usuários
- [ ] Estatísticas mostram números corretos
- [ ] Ações (editar, excluir) funcionam

## ✅ **Status da Correção**

**Problema:** ❌ Políticas RLS restritivas
**Solução:** ✅ Script de correção criado
**Próximo passo:** Execute o script no Supabase SQL Editor

**A correção permitirá visualizar TODOS os usuários na lista!** 🎉 