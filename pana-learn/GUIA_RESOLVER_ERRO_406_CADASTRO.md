# 🚨 Guia Completo - Resolver Erro 406 no Cadastro de Usuários

## 📋 **Problema Identificado**

Baseado nos logs que você compartilhou, o problema é um **erro 406 (Not Acceptable)** na requisição para `/rest/v1/usuarios`. Este erro indica problemas com:

1. **Políticas RLS (Row Level Security)** conflitantes
2. **Estrutura da tabela** `usuarios` 
3. **Função `handle_new_user`** com problemas
4. **Trigger** não funcionando corretamente

## 🔧 **Solução Definitiva**

### **Passo 1: Executar Script de Correção**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Execute o Script SQL:**
   - Vá para **SQL Editor**
   - Cole o conteúdo do arquivo `diagnose-cadastro-usuarios-406.sql`
   - Execute o script **completamente**

### **Passo 2: Verificar Configurações de Autenticação**

1. **Vá para Authentication > Settings**
2. **Configure:**
   - ✅ **Enable signups**: Habilitado
   - ❌ **Enable email confirmations**: Desabilitado (temporariamente)
   - ✅ **Enable email change confirmations**: Desabilitado

### **Passo 3: Testar Cadastro**

#### **Teste 1: Via Console do Navegador**
```javascript
// Abra o console do navegador (F12)
// Cole este código:

const { createClient } = supabase;

const supabase = createClient(
  'https://oqoxhavdhrgdjvxvajze.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

// Testar cadastro
const { data, error } = await supabase.auth.signUp({
  email: 'teste-406@exemplo.com',
  password: '123456',
  options: {
    data: {
      nome: 'Usuário Teste 406',
      tipo_usuario: 'cliente'
    }
  }
});

console.log('Resultado:', { data, error });
```

#### **Teste 2: Verificar Tabela**
```sql
-- Verificar se o usuário foi criado
SELECT * FROM usuarios WHERE email = 'teste-406@exemplo.com';
```

## 🛠️ **O que o Script Faz**

### **1. Diagnóstico Completo**
- ✅ Verifica estrutura da tabela `usuarios`
- ✅ Verifica políticas RLS existentes
- ✅ Verifica função `handle_new_user`
- ✅ Verifica trigger `on_auth_user_created`

### **2. Correções Aplicadas**
- ✅ **Desabilita RLS** temporariamente (resolve erro 406)
- ✅ **Remove políticas conflitantes**
- ✅ **Recria função `handle_new_user`** com tratamento robusto
- ✅ **Recria trigger** corretamente
- ✅ **Testa inserção** direta na tabela

### **3. Verificação Final**
- ✅ Confirma que tudo está funcionando
- ✅ Mostra status de todos os componentes

## 📊 **Logs Esperados**

Após executar o script, você deve ver:

```
========================================
DIAGNÓSTICO E CORREÇÃO CONCLUÍDOS!
========================================
✅ RLS desabilitado temporariamente
✅ Políticas conflitantes removidas
✅ Função handle_new_user recriada
✅ Trigger recriado
✅ Teste de inserção funcionou
========================================
Agora o cadastro de usuários deve funcionar!
O erro 406 deve estar resolvido.
========================================
```

## 🔍 **Verificações Adicionais**

### **1. Verificar Logs do Supabase**
- Vá para **Logs** no Dashboard
- Procure por logs da função `handle_new_user`
- Deve aparecer: `handle_new_user: Usuário criado com sucesso para email@exemplo.com`

### **2. Testar no Frontend**
- Acesse a página de cadastro do seu app
- Tente criar um novo usuário
- Verifique se não há mais erro 406 no console

### **3. Verificar Tabela de Usuários**
```sql
-- Verificar usuários criados recentemente
SELECT 
  id,
  nome,
  email,
  tipo_usuario,
  status,
  data_criacao
FROM usuarios 
ORDER BY data_criacao DESC 
LIMIT 5;
```

## 🚨 **Se o Problema Persistir**

### **Opção 1: Script Mais Radical**
Execute o arquivo `fix-500-definitive.sql` que:
- Recria a tabela `usuarios` do zero
- Remove todas as políticas RLS
- Cria uma estrutura mais simples

### **Opção 2: Verificar Configuração de Email**
Se o problema for com emails:
1. Configure um provedor de email real
2. Ou desabilite confirmação de email temporariamente

### **Opção 3: Logs Detalhados**
Execute este comando para ver logs detalhados:
```sql
-- Verificar logs da função handle_new_user
SELECT 
  log_time,
  message
FROM pg_stat_statements 
WHERE query LIKE '%handle_new_user%'
ORDER BY log_time DESC;
```

## 📞 **Próximos Passos**

1. **Execute o script** `diagnose-cadastro-usuarios-406.sql`
2. **Teste o cadastro** via console do navegador
3. **Teste no seu aplicativo** principal
4. **Se funcionar**, reabilite RLS com políticas simples
5. **Se não funcionar**, execute o script `fix-500-definitive.sql`

## 🎯 **Resultado Esperado**

Após aplicar as correções:
- ✅ **Erro 406 resolvido**
- ✅ **Cadastro de usuários funciona**
- ✅ **Usuários criados na tabela `usuarios`**
- ✅ **Login funciona imediatamente**
- ✅ **Sem erros no console**

---

**Última Atualização**: 2025-01-29  
**Status**: ✅ **Pronto para Execução**
