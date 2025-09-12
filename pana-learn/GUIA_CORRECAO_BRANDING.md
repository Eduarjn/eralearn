# 🔧 **GUIA DE CORREÇÃO - Sistema de Branding/WhiteLabel**

## 🎯 **PROBLEMA IDENTIFICADO**

O sistema de branding não está funcionando corretamente na página `http://localhost:8080/configuracoes/whitelabel`. Os botões e uploads não funcionam.

## 🚀 **SOLUÇÃO COMPLETA**

### **✅ Passo 1: Executar Script SQL**

Execute o script `fix-branding-config.sql` no **Supabase SQL Editor**:

```sql
-- Copie e cole todo o conteúdo do arquivo fix-branding-config.sql
-- Execute no Supabase SQL Editor
```

**O que o script faz:**
- ✅ Cria tabela `branding_config` se não existir
- ✅ Insere configuração padrão
- ✅ Configura políticas RLS
- ✅ Cria funções SQL para atualizar/consultar
- ✅ Testa as funções

### **✅ Passo 2: Verificar Configuração**

Execute o script de teste:

```bash
cd pana-learn
node test-branding.js
```

**Resultado esperado:**
```
✅ Tabela branding_config existe
✅ Dados encontrados
✅ Função get_branding_config funcionando
✅ Função update_branding_config funcionando
✅ Políticas RLS configuradas corretamente
```

### **✅ Passo 3: Reiniciar Aplicação**

```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

### **✅ Passo 4: Testar Interface**

1. **Acesse:** `http://localhost:8080/configuracoes/whitelabel`
2. **Teste upload de logo:**
   - Clique em "Selecionar Imagem"
   - Escolha uma imagem
   - Clique em "Salvar Logo"
3. **Teste cores:**
   - Mude as cores
   - Clique em "Salvar Cores"
4. **Teste nome da empresa:**
   - Digite um nome
   - Clique em "Salvar"

## 🔧 **ARQUIVOS CORRIGIDOS**

### **1. BrandingContext.tsx**
- ✅ Atualizado para usar funções SQL
- ✅ Melhor tratamento de erros
- ✅ Fallback para localStorage

### **2. Script SQL (fix-branding-config.sql)**
- ✅ Criação completa da tabela
- ✅ Funções SQL otimizadas
- ✅ Políticas RLS seguras
- ✅ Testes automáticos

### **3. Script de Teste (test-branding.js)**
- ✅ Verificação completa do sistema
- ✅ Testes das funções SQL
- ✅ Diagnóstico de problemas

## 🐛 **PROBLEMAS COMUNS E SOLUÇÕES**

### **❌ Erro: "Tabela não existe"**
```bash
# Solução: Execute o script SQL
# No Supabase SQL Editor: fix-branding-config.sql
```

### **❌ Erro: "Função não encontrada"**
```bash
# Solução: Verifique se as funções foram criadas
# Execute novamente o script SQL
```

### **❌ Erro: "Políticas RLS"**
```bash
# Solução: Verifique se o usuário é admin
# Ou ajuste as políticas no script SQL
```

### **❌ Upload não funciona**
```bash
# Solução: Verifique o bucket 'branding' no Supabase Storage
# Crie se não existir
```

## 📋 **VERIFICAÇÃO FINAL**

### **✅ Checklist de Funcionamento**

- [ ] **Tabela criada:** `branding_config` existe
- [ ] **Dados inseridos:** Configuração padrão presente
- [ ] **Funções SQL:** `get_branding_config` e `update_branding_config` funcionando
- [ ] **Políticas RLS:** Configuradas corretamente
- [ ] **Interface:** Upload de imagens funcionando
- [ ] **Cores:** Seletor de cores funcionando
- [ ] **Nome:** Campo de nome funcionando
- [ ] **Persistência:** Alterações são salvas no banco

### **✅ Testes Manuais**

1. **Upload de Logo:**
   - Selecione uma imagem
   - Verifique se aparece o preview
   - Salve e verifique se persiste

2. **Cores:**
   - Mude as cores
   - Verifique se aplicam na interface
   - Salve e recarregue a página

3. **Nome da Empresa:**
   - Digite um nome
   - Salve e verifique se aparece

## 🎯 **RESULTADO ESPERADO**

Após seguir todos os passos:

- ✅ **Interface funcional:** Todos os botões funcionam
- ✅ **Upload de imagens:** Logo, favicon, background
- ✅ **Configuração de cores:** Seletor de cores funcional
- ✅ **Nome da empresa:** Campo editável e salvável
- ✅ **Persistência:** Todas as alterações são salvas
- ✅ **Aplicação visual:** Mudanças aparecem na plataforma

## 🆘 **SE AINDA NÃO FUNCIONAR**

### **1. Verificar Console do Navegador**
```javascript
// Abra F12 e verifique erros no Console
// Procure por erros relacionados ao Supabase
```

### **2. Verificar Network Tab**
```javascript
// Verifique se as requisições para o Supabase estão funcionando
// Procure por erros 401, 403, 500
```

### **3. Verificar Autenticação**
```javascript
// Verifique se o usuário está logado
// Verifique se é admin
```

### **4. Logs do Supabase**
```sql
-- No Supabase Dashboard > Logs
-- Verifique se há erros nas funções SQL
```

---

**🎯 Siga estes passos na ordem e o sistema de branding funcionará corretamente!**



















