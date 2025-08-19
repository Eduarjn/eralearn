# 🔧 **SOLUÇÃO - Vídeos Ficam Carregando (Erro 406)**

## 🎯 **PROBLEMA IDENTIFICADO**

### **❌ Sintomas:**
- ✅ **Vídeos ficam carregando** infinitamente
- ✅ **Spinner de loading** não para
- ✅ **Erro 406** no console do navegador
- ✅ **Falha nas consultas** `progresso_quiz` e `certificados`

### **❌ Causa Raiz:**
- ❌ **Consultas `.single()`** falham quando não há dados
- ❌ **Políticas RLS** problemáticas nas tabelas
- ❌ **Tratamento de erro** inadequado no frontend
- ❌ **Falta de fallbacks** para dados inexistentes

## ✅ **SOLUÇÕES IMPLEMENTADAS**

### **🔄 1. CORREÇÃO DOS HOOKS (Frontend)**

#### **✅ `useQuiz.ts` Corrigido:**
```typescript
// ANTES: Causava erro 406
const { data: progressData, error: progressError } = await supabase
  .from('progresso_quiz')
  .select('*')
  .eq('usuario_id', userId)
  .eq('quiz_id', quizId)
  .single(); // ❌ Falha se não há dados

// DEPOIS: Tratamento correto
let progressData = null;
try {
  const { data: progressResult, error: progressError } = await supabase
    .from('progresso_quiz')
    .select('*')
    .eq('usuario_id', userId)
    .eq('quiz_id', quizId)
    .maybeSingle(); // ✅ Retorna null se não há dados

  if (progressError) {
    console.error('Erro ao buscar progresso:', progressError);
  } else {
    progressData = progressResult;
  }
} catch (progressErr) {
  console.error('Erro ao buscar progresso do quiz:', progressErr);
}
```

#### **✅ `useOptionalQuiz.ts` Corrigido:**
- ✅ **Substituído `.single()`** por `.maybeSingle()`
- ✅ **Tratamento de erro** com try/catch
- ✅ **Fallbacks** para dados inexistentes
- ✅ **Logs detalhados** para debugging

### **🔄 2. CORREÇÃO DAS POLÍTICAS RLS (Backend)**

#### **✅ Script SQL Criado:**
```sql
-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso de quiz" ON public.progresso_quiz;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios certificados" ON public.certificados;

-- Criar novas políticas corretas
CREATE POLICY "Usuários podem ver seu próprio progresso de quiz" ON public.progresso_quiz
    FOR SELECT USING (
        auth.uid() = usuario_id OR 
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
        )
    );
```

#### **✅ O que o script faz:**
- ✅ **Remove políticas** RLS problemáticas
- ✅ **Cria novas políticas** mais permissivas
- ✅ **Adiciona índices** para performance
- ✅ **Verifica estrutura** das tabelas

### **🔄 3. MELHORIAS NO TRATAMENTO DE ERRO**

#### **✅ Logs Aprimorados:**
```typescript
// Logs detalhados para debugging
console.error('❌ Erro ao carregar progresso:', progressError);
console.error('URL da consulta:', '/progresso_quiz');
console.error('Parâmetros:', { userId, quizId });
console.error('Ambiente:', window.location.hostname);
```

#### **✅ Fallbacks Robustos:**
```typescript
// Se não há dados, usar valores padrão
const progressData = progressResult || {
  usuario_id: userId,
  quiz_id: quizId,
  respostas: {},
  nota: 0,
  aprovado: false
};
```

## 🚀 **PRÓXIMOS PASSOS**

### **🔄 1. EXECUTAR SCRIPT SQL**
```sql
-- Execute no Supabase SQL Editor:
-- fix-406-errors-progresso-quiz-certificados.sql
```

### **🔄 2. DEPLOY DAS CORREÇÕES**
```bash
git add .
git commit -m "🔧 Fix: Erro 406 - Vídeos carregando infinitamente"
git push origin master
```

### **🔄 3. TESTE NO VERCEL**
1. **Aguarde deploy** (2-3 minutos)
2. **Acesse um curso** com vídeos
3. **Verifique console** (F12) - não deve ter erros 406
4. **Teste carregamento** dos vídeos

## 🔍 **DIAGNÓSTICO AVANÇADO**

### **🔄 Se o problema persistir:**

#### **✅ 1. Verificar Console do Navegador:**
```javascript
// Abra F12 e procure por:
// - Erros 406
// - Falhas de rede
// - Timeouts de requisição
```

#### **✅ 2. Verificar Dados no Supabase:**
```sql
-- Verificar se há dados nas tabelas
SELECT COUNT(*) FROM public.progresso_quiz;
SELECT COUNT(*) FROM public.certificados;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename IN ('progresso_quiz', 'certificados');
```

#### **✅ 3. Testar Consultas Diretas:**
```sql
-- Testar consulta de progresso
SELECT * FROM public.progresso_quiz 
WHERE usuario_id = 'SEU_USER_ID' 
AND quiz_id = 'SEU_QUIZ_ID';

-- Testar consulta de certificados
SELECT * FROM public.certificados 
WHERE usuario_id = 'SEU_USER_ID' 
AND curso_id = 'SEU_CURSO_ID';
```

### **🔄 4. SOLUÇÕES ALTERNATIVAS**

#### **✅ Se persistir o problema:**
1. **Desabilitar RLS temporariamente** para teste
2. **Verificar permissões** do usuário no Supabase
3. **Limpar cache** do navegador
4. **Testar em modo incógnito**

## 📋 **CHECKLIST FINAL**

### **✅ Antes do Deploy:**
- ✅ Script SQL executado no Supabase
- ✅ Hooks corrigidos (useQuiz, useOptionalQuiz)
- ✅ Tratamento de erro melhorado
- ✅ Logs detalhados implementados

### **✅ Após o Deploy:**
- ✅ Vídeos carregam normalmente
- ✅ Não há erros 406 no console
- ✅ Spinner de loading para
- ✅ Progresso é salvo corretamente

## 🎉 **RESULTADO ESPERADO**

Após implementar estas correções:

- ✅ **Vídeos carregam** sem ficar em loading infinito
- ✅ **Erros 406 eliminados** do console
- ✅ **Progresso salvo** corretamente
- ✅ **Quiz funciona** normalmente
- ✅ **Certificados gerados** sem erro

**Execute o script SQL e faça o deploy das correções para resolver o problema!** 🚀

## 🔧 **ARQUIVOS MODIFICADOS:**

- ✅ **`pana-learn/src/hooks/useQuiz.ts`** - Corrigido `.single()` por `.maybeSingle()`
- ✅ **`pana-learn/src/hooks/useOptionalQuiz.ts`** - Tratamento de erro melhorado
- ✅ **`pana-learn/fix-406-errors-progresso-quiz-certificados.sql`** - Script SQL para RLS
- ✅ **`pana-learn/SOLUCAO_VIDEOS_CARREGANDO_406.md`** - Este guia
