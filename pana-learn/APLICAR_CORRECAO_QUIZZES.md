# 🔧 Guia para Corrigir Sistema de Quizzes

## 🎯 **Problema Identificado**

O sistema de quizzes não está carregando devido a:
1. **Erro 401 (Unauthorized)** - Problemas de autenticação Supabase
2. **Dados de quiz ausentes** ou políticas RLS restritivas
3. **Tabelas não configuradas** corretamente

## 🛠️ **Solução Implementada**

Foram criados 2 scripts SQL para corrigir completamente o sistema:

### **1. fix-quiz-system-complete.sql**
- ✅ Cria/corrige estrutura das tabelas de quiz
- ✅ Configura políticas RLS permissivas
- ✅ Insere quizzes para as 5 categorias principais
- ✅ Adiciona 25 perguntas distribuídas entre os quizzes
- ✅ Cria funções para liberação e certificação

### **2. create-test-users-and-data.sql**
- ✅ Cria usuários de teste (admin/cliente)
- ✅ Insere vídeos de exemplo
- ✅ Simula progresso para permitir quizzes
- ✅ Configura sistema de certificados

## 🚀 **Como Aplicar as Correções**

### **Passo 1: Acessar Supabase Dashboard**
```
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: oqoxhavdhrgdjvxvajze
4. Vá em "SQL Editor"
```

### **Passo 2: Executar Script Principal**
```sql
-- Copie e cole TODO o conteúdo do arquivo:
-- fix-quiz-system-complete.sql

-- Cole no SQL Editor e clique "Run"
```

### **Passo 3: Executar Script de Dados de Teste**
```sql
-- Copie e cole TODO o conteúdo do arquivo:
-- create-test-users-and-data.sql

-- Cole no SQL Editor e clique "Run"
```

### **Passo 4: Verificar Resultados**
```sql
-- Execute estas consultas para verificar:

-- 1. Verificar quizzes criados
SELECT * FROM quizzes ORDER BY categoria;

-- 2. Verificar perguntas
SELECT q.titulo, COUNT(qp.id) as total_perguntas
FROM quizzes q
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
GROUP BY q.id, q.titulo;

-- 3. Verificar usuários de teste
SELECT email, nome, tipo_usuario FROM usuarios 
WHERE email IN ('admin@eralearn.com', 'cliente@eralearn.com');

-- 4. Testar função de liberação
SELECT liberar_quiz_curso(
    '550e8400-e29b-41d4-a716-446655441002'::uuid, 
    'PABX_FUNDAMENTOS'
);
```

## 📊 **Dados Criados**

### **5 Quizzes Principais:**
1. **PABX_FUNDAMENTOS** - 5 perguntas (70% nota mínima)
2. **PABX_AVANCADO** - 5 perguntas (75% nota mínima)
3. **OMNICHANNEL_EMPRESAS** - 5 perguntas (70% nota mínima)
4. **OMNICHANNEL_AVANCADO** - 5 perguntas (75% nota mínima)
5. **CALLCENTER_FUNDAMENTOS** - 5 perguntas (70% nota mínima)

### **Usuários de Teste:**
- **admin@eralearn.com** / senha: admin123 (Admin Master)
- **cliente@eralearn.com** / senha: cliente123 (Cliente)

### **Vídeos de Exemplo:**
- 2 vídeos por categoria (10 total)
- Progresso simulado para categoria PABX_FUNDAMENTOS

## 🔒 **Políticas de Segurança**

### **Configuradas para:**
- ✅ Usuários autenticados podem ver quizzes
- ✅ Usuários podem criar próprio progresso
- ✅ Admins podem gerenciar tudo
- ✅ Isolamento por usuário nos dados pessoais

## 🧪 **Como Testar Após Aplicar**

### **1. Teste de Login**
```
1. Acesse: http://localhost:5173
2. Login: cliente@eralearn.com / cliente123
3. Verificar se autentica sem erro 401
```

### **2. Teste de Quizzes**
```
1. Vá para /quizzes
2. Deve mostrar pelo menos 1 quiz disponível
3. Não deve mostrar erro "Não foi possível carregar os quizzes"
```

### **3. Teste de Funcionalidade**
```
1. Clique em um quiz disponível
2. Responda as perguntas
3. Verificar se gera certificado ao final
```

## ⚠️ **Importante**

### **Não Impacta Configurações Existentes:**
- ✅ Mantém usuários reais se existirem
- ✅ Não altera outras tabelas
- ✅ Preserva configurações de branding
- ✅ Mantém dados de progresso reais

### **Apenas Adiciona/Corrige:**
- ✅ Sistema de quizzes completo
- ✅ Dados de teste para validação
- ✅ Políticas de segurança adequadas

## 🎉 **Resultado Esperado**

Após aplicar as correções:

1. **✅ Página de Quizzes carrega sem erros**
2. **✅ Mostra quizzes disponíveis**
3. **✅ Permite fazer quizzes completos**
4. **✅ Gera certificados automaticamente**
5. **✅ Funciona para admin e cliente**

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Confirme que executou ambos os scripts
3. Teste com os usuários criados pelos scripts
4. Entre em contato para suporte adicional

---

**🚀 Pronto para aplicar! Os scripts estão no diretório do projeto.**






















