# 🔧 Troubleshooting - Funcionalidade de Domínios

## 🚨 Problema: "Não consegui criar um novo ambiente"

Este guia vai te ajudar a identificar e resolver problemas com a funcionalidade de Domínios.

## 📋 Passos de Diagnóstico

### 1. **Execute o Script de Diagnóstico**

Primeiro, execute este script no **Supabase SQL Editor**:

```sql
-- Execute: diagnose-domains-issues.sql
```

Este script vai mostrar:
- ✅ Status das tabelas
- ✅ Verificação do enum user_type
- ✅ Usuários admin_master existentes
- ✅ Configuração RLS
- ✅ Dados de domínios
- 🔧 Recomendações específicas

### 2. **Problemas Comuns e Soluções**

#### ❌ **Problema 1: Tabela domains não existe**
**Sintomas**: Erro "relation domains does not exist"

**Solução**:
```sql
-- Execute: setup-domains-complete.sql
```

#### ❌ **Problema 2: Enum user_type não tem admin_master**
**Sintomas**: Erro "invalid input value for enum user_type"

**Solução**:
```sql
-- Adicionar admin_master ao enum
ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'admin_master';
```

#### ❌ **Problema 3: Nenhum usuário admin_master**
**Sintomas**: "Acesso Negado" na página de Domínios

**Solução**:
```sql
-- Criar usuário admin_master
INSERT INTO usuarios (id, email, nome, tipo_usuario, status, data_criacao, data_atualizacao)
VALUES (
  gen_random_uuid(),
  'admin_master@eralearn.com',
  'Administrador Master',
  'admin_master',
  'ativo',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
```

#### ❌ **Problema 4: RLS não configurado**
**Sintomas**: Erro de permissão ao criar/editar domínios

**Solução**:
```sql
-- Reconfigurar RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Recriar políticas
DROP POLICY IF EXISTS "Allow read for authenticated users" ON domains;
DROP POLICY IF EXISTS "Allow admin_master insert" ON domains;
DROP POLICY IF EXISTS "Allow admin_master update" ON domains;
DROP POLICY IF EXISTS "Allow admin_master delete" ON domains;

CREATE POLICY "Allow read for authenticated users"
ON domains FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin_master insert"
ON domains FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin_master'
  )
);

CREATE POLICY "Allow admin_master update"
ON domains FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin_master'
  )
);

CREATE POLICY "Allow admin_master delete"
ON domains FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id = auth.uid() AND u.tipo_usuario = 'admin_master'
  )
);
```

## 🔄 **Solução Completa (Recomendada)**

Execute este script **completo** no Supabase SQL Editor:

```sql
-- Execute: setup-domains-complete.sql
```

Este script faz **tudo automaticamente**:
1. ✅ Verifica estrutura existente
2. ✅ Adiciona admin_master ao enum
3. ✅ Cria tabela domains
4. ✅ Configura RLS e políticas
5. ✅ Cria usuário admin_master
6. ✅ Insere dados de exemplo
7. ✅ Verifica se tudo funcionou

## 🧪 **Teste Manual**

Após executar o setup, teste manualmente:

### 1. **Verificar Login**
```sql
-- Verificar se o usuário admin_master existe
SELECT id, email, nome, tipo_usuario, status 
FROM usuarios 
WHERE tipo_usuario = 'admin_master';
```

### 2. **Testar Inserção**
```sql
-- Testar inserção de domínio (deve funcionar)
INSERT INTO domains (name, description, created_by) 
VALUES (
  'teste.com',
  'Domínio de teste',
  (SELECT id FROM usuarios WHERE tipo_usuario = 'admin_master' LIMIT 1)
);
```

### 3. **Verificar Dados**
```sql
-- Verificar se o domínio foi criado
SELECT * FROM domains ORDER BY created_at DESC;
```

## 🎯 **Checklist de Verificação**

- [ ] Tabela `domains` existe
- [ ] Enum `user_type` inclui `admin_master`
- [ ] Usuário `admin_master` existe
- [ ] RLS está ativo na tabela `domains`
- [ ] Políticas RLS estão configuradas
- [ ] Frontend está funcionando
- [ ] Login com admin_master funciona
- [ ] Página de Domínios carrega
- [ ] Criação de domínios funciona

## 🐛 **Debug do Frontend**

Se o backend estiver OK, verifique o frontend:

### 1. **Console do Navegador**
Abra o DevTools (F12) e verifique:
- ❌ Erros JavaScript
- 🔄 Logs do useDomains
- 👤 Status do usuário

### 2. **Verificar Autenticação**
```javascript
// No console do navegador
console.log('User Profile:', userProfile);
console.log('Is Admin Master:', userProfile?.tipo_usuario === 'admin_master');
```

### 3. **Testar Hook**
```javascript
// No console do navegador
const { domains, loading, error, isAdminMaster } = useDomains();
console.log('Domains:', domains);
console.log('Loading:', loading);
console.log('Error:', error);
console.log('Is Admin Master:', isAdminMaster);
```

## 📞 **Suporte**

Se ainda tiver problemas:

1. **Execute o diagnóstico**: `diagnose-domains-issues.sql`
2. **Execute o setup completo**: `setup-domains-complete.sql`
3. **Verifique os logs** no console do navegador
4. **Teste manualmente** no Supabase SQL Editor

### **Comandos Úteis**

```sql
-- Verificar tudo de uma vez
SELECT 
  'Tabela usuarios' as item,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') 
       THEN '✅ Existe' ELSE '❌ Não existe' END as status
UNION ALL
SELECT 
  'Tabela domains',
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'domains') 
       THEN '✅ Existe' ELSE '❌ Não existe' END
UNION ALL
SELECT 
  'Enum admin_master',
  CASE WHEN EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin_master') 
       THEN '✅ Existe' ELSE '❌ Não existe' END
UNION ALL
SELECT 
  'Usuário admin_master',
  CASE WHEN EXISTS (SELECT 1 FROM usuarios WHERE tipo_usuario = 'admin_master') 
       THEN '✅ Existe' ELSE '❌ Não existe' END;
```

---

**🎯 Resultado Esperado**: Após seguir estes passos, você deve conseguir criar domínios normalmente na plataforma! 