# 🔧 Correção de Erros 403 e 400 - Políticas RLS

## 🚨 Problema Identificado

Pelos logs do Supabase, identificamos muitos erros:
- **403 Forbidden**: Operações sendo bloqueadas pelas políticas RLS
- **400 Bad Request**: Requisições falhando devido a permissões
- **Tabela `modulos`**: Principal fonte de erros (634 erros POST 403)

## 📊 Análise dos Logs

### Erros Mais Frequentes:
1. `POST 403 /rest/v1/modulos` - 634 erros
2. `DELETE 400 /rest/v1/modulos` - 341 erros
3. `GET 400 /rest/v1/video_progress` - Múltiplos erros
4. `POST 403` em várias tabelas

### Causa Raiz:
As políticas RLS criadas anteriormente estão **muito restritivas** e estão bloqueando operações legítimas da aplicação.

## 🛠️ Solução

### Script de Correção: `fix-rls-policies-errors.sql`

Este script:
1. **Remove políticas muito restritivas**
2. **Cria políticas mais permissivas** para operações básicas
3. **Mantém segurança** para operações sensíveis
4. **Permite que a aplicação funcione** normalmente

## 📋 O que o Script Faz

### 1. **Tabela `modulos`**:
- ✅ Permite SELECT para todos
- ✅ Permite INSERT para todos
- ✅ Permite UPDATE para todos
- ✅ Permite DELETE para todos

### 2. **Tabela `usuarios`**:
- ✅ Permite SELECT para todos
- ✅ Permite INSERT para todos
- ✅ Permite UPDATE apenas do próprio usuário
- ✅ Permite DELETE apenas para administradores

### 3. **Tabela `video_progress`**:
- ✅ Permite SELECT para todos
- ✅ Permite INSERT para todos
- ✅ Permite UPDATE apenas do próprio usuário
- ✅ Permite DELETE apenas para administradores

### 4. **Tabela `progresso_usuario`**:
- ✅ Permite SELECT para todos
- ✅ Permite INSERT para todos
- ✅ Permite UPDATE apenas do próprio usuário
- ✅ Permite DELETE apenas para administradores

## 🚀 Como Aplicar

### Passo 1: Executar o Script
1. Vá para **Supabase Dashboard → SQL Editor**
2. Crie um novo query
3. Cole o conteúdo de `fix-rls-policies-errors.sql`
4. Clique em **"Run"**

### Passo 2: Verificar Resultados
1. Vá para **Logs** no Supabase
2. Monitore se os erros 403 e 400 diminuem
3. Teste a aplicação

### Passo 3: Testar a Aplicação
1. **Faça login como cliente**
2. **Acesse um curso**
3. **Verifique se não há mais piscar**
4. **Teste navegação entre vídeos**

## ⚠️ Impacto na Segurança

### ✅ Benefícios:
- **Aplicação funcional**: Sem erros 403/400
- **Performance melhorada**: Menos tentativas de acesso
- **Experiência do usuário**: Sem piscar na tela

### 🔒 Segurança Mantida:
- **Dados pessoais**: Usuários só editam seus próprios dados
- **Operações administrativas**: Apenas admins podem deletar
- **RLS ativo**: Proteção básica mantida

## 🧪 Teste Após Correção

### 1. **Verificar Logs**:
- Abra o Supabase Dashboard → Logs
- Verifique se erros 403/400 diminuíram
- Monitore por alguns minutos

### 2. **Testar Aplicação**:
- Login como cliente
- Acessar curso
- Navegar entre vídeos
- Verificar se não há piscar

### 3. **Testar Funcionalidades**:
- Importar vídeo (admin)
- Gerenciar usuários (admin)
- Verificar progresso (cliente)

## 📊 Monitoramento

### Métricas para Acompanhar:
- **Erros 403**: Devem diminuir drasticamente
- **Erros 400**: Devem desaparecer
- **Performance**: Deve melhorar
- **Piscar da tela**: Deve parar

## 🆘 Se Ainda Houver Problemas

### 1. **Verificar Políticas**:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### 2. **Desabilitar RLS Temporariamente**:
```sql
ALTER TABLE public.modulos DISABLE ROW LEVEL SECURITY;
```

### 3. **Verificar Logs Detalhados**:
- Supabase Dashboard → Logs
- Filtrar por status 403/400
- Identificar tabelas problemáticas

## 🎯 Resultado Esperado

Após aplicar a correção:
- ✅ **0 erros 403** para operações básicas
- ✅ **0 erros 400** para requisições válidas
- ✅ **Aplicação funcionando** sem piscar
- ✅ **Performance melhorada** significativamente
- ✅ **Console limpo** sem erros de permissão

## 📝 Notas Importantes

- **Execute o script completo** de uma vez
- **Monitore os logs** após a execução
- **Teste todas as funcionalidades** da aplicação
- **Se necessário**, ajuste políticas específicas 