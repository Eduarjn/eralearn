# 🔧 Solução: Domínio eralearn.com não aparece na lista

## 🚨 Problema Identificado

O domínio `eralearn.com` não está aparecendo na lista de domínios porque provavelmente não foi criado na tabela `domains` do Supabase.

## ✅ Solução Rápida

### **1. Execute o Script SQL**

Execute este script no **Supabase SQL Editor**:

```sql
-- Arquivo: add-eralearn-domain.sql
```

**O que o script faz:**
- ✅ Verifica se o domínio `eralearn.com` já existe
- ✅ Cria o domínio se não existir
- ✅ Mostra todos os domínios após a criação
- ✅ Verifica configurações do usuário admin_master

### **2. Verificação Manual**

Se preferir fazer manualmente:

```sql
-- 1. Verificar se o domínio existe
SELECT * FROM domains WHERE name = 'eralearn.com';

-- 2. Se não existir, criar o domínio
INSERT INTO domains (name, description, created_by) 
VALUES (
  'eralearn.com',
  'ERA Learn - Plataforma Principal de Treinamento Corporativo',
  (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)
);

-- 3. Verificar se foi criado
SELECT * FROM domains ORDER BY created_at DESC;
```

## 🎯 **Resultado Esperado**

Após executar o script, você deve ver:

### **Na Lista de Domínios:**
- ✅ **`eralearn.com`** aparece em **primeiro lugar**
- ✅ **Badge "Principal"** ao lado do nome
- ✅ **Fundo verde** destacando o domínio
- ✅ **Sem botão de exclusão** (protegido)

### **Estrutura da Tabela:**
```
┌─────────────────┬─────────────────────────────────────────────────┬─────────────┐
│ Nome do Domínio │ Descrição                                       │ Status      │
├─────────────────┼─────────────────────────────────────────────────┼─────────────┤
│ eralearn.com    │ ERA Learn - Plataforma Principal...            │ Principal   │
│ cliente1.com    │ Cliente 1 - Empresa de Tecnologia              │ Ativo       │
│ cliente2.com    │ Cliente 2 - Consultoria Empresarial            │ Ativo       │
│ cliente3.com    │ Cliente 3 - Indústria Manufatureira            │ Ativo       │
└─────────────────┴─────────────────────────────────────────────────┴─────────────┘
```

## 🔧 **Melhorias Implementadas**

### **1. Ordenação Inteligente**
- ✅ **`eralearn.com`** sempre aparece primeiro
- ✅ Outros domínios ordenados por data de criação

### **2. Destaque Visual**
- ✅ **Fundo verde** para o domínio principal
- ✅ **Badge "Principal"** para identificação
- ✅ **Borda esquerda verde** para destaque

### **3. Proteção Especial**
- ✅ **Sem botão de exclusão** para `eralearn.com`
- ✅ **Proteção contra exclusão acidental**
- ✅ **Domínio principal sempre preservado**

## 🚀 **Como Testar**

### **1. Execute o Script**
```bash
# No Supabase SQL Editor
# Execute: add-eralearn-domain.sql
```

### **2. Verifique no Frontend**
1. **Faça login** como `admin_master`
2. **Acesse** "Domínios" no menu
3. **Verifique** se `eralearn.com` aparece primeiro
4. **Confirme** o destaque visual

### **3. Teste as Funcionalidades**
1. **Clique** no ícone 👁️ para ver dashboard
2. **Clique** no ícone 🔗 para acessar site
3. **Verifique** que não há botão de exclusão

## 📊 **Estrutura de Dados**

### **Domínio Principal:**
```sql
INSERT INTO domains (name, description, created_by) VALUES (
  'eralearn.com',
  'ERA Learn - Plataforma Principal de Treinamento Corporativo',
  (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)
);
```

### **Características Especiais:**
- ✅ **Nome:** `eralearn.com`
- ✅ **Descrição:** Identifica como plataforma principal
- ✅ **Proteção:** Não pode ser excluído
- ✅ **Destaque:** Aparece sempre primeiro na lista

## 🔒 **Segurança**

### **Proteções Implementadas:**
- ✅ **Validação** no frontend (sem botão de exclusão)
- ✅ **Proteção** no backend (RLS policies)
- ✅ **Identificação** visual clara
- ✅ **Ordenação** automática

## 📋 **Próximos Passos**

### **Após a Correção:**
1. ✅ **Domínio principal** visível e destacado
2. ✅ **Funcionalidades** de acesso funcionando
3. ✅ **Proteção** contra exclusão acidental
4. ✅ **Interface** melhorada e intuitiva

### **Funcionalidades Disponíveis:**
- ✅ **Visualizar Dashboard** do domínio principal
- ✅ **Acessar Site** do domínio principal
- ✅ **Editar** informações do domínio
- ✅ **Gerenciar** usuários do domínio

## 🎉 **Resultado Final**

Após executar o script `add-eralearn-domain.sql`, o domínio `eralearn.com` estará:

- ✅ **Visível** na lista de domínios
- ✅ **Destacado** como domínio principal
- ✅ **Protegido** contra exclusão
- ✅ **Funcional** para todas as operações

**O problema estará completamente resolvido!** 🚀

## 📞 **Suporte**

Se ainda houver problemas:
1. **Verifique** se o script foi executado corretamente
2. **Confirme** que é `admin_master`
3. **Recarregue** a página após executar o script
4. **Verifique** logs do console para erros

**Domínio eralearn.com será exibido corretamente na lista!** ✅ 