# 🔍 **GUIA DE SOLUÇÃO DE PROBLEMAS - CERTIFICADOS**

## **📋 PROBLEMA IDENTIFICADO**

**Situação:** Na aba de certificados não há certificados disponíveis para visualização, edição ou geração.

## **🚀 PASSO A PASSO PARA DIAGNÓSTICO**

### **1. EXECUTAR DIAGNÓSTICO COMPLETO**

Execute o script `diagnostico-certificados-completo.sql` no Supabase:

```sql
-- Execute este script no SQL Editor do Supabase
-- Ele verificará toda a estrutura e dados
```

### **2. VERIFICAR RESULTADOS DO DIAGNÓSTICO**

Após executar o diagnóstico, verifique:

#### **✅ Estrutura das Tabelas:**
- [ ] Tabela `certificados` existe com todas as colunas
- [ ] Tabela `curso_quiz_mapping` existe
- [ ] Tabela `progresso_quiz` existe

#### **✅ Dados Existentes:**
- [ ] Existem certificados na tabela `certificados`
- [ ] Existem mapeamentos curso-quiz
- [ ] Existem progressos de quiz aprovados

#### **✅ Funções do Banco:**
- [ ] `gerar_certificado_dinamico` existe
- [ ] `buscar_certificados_usuario_dinamico` existe
- [ ] `validar_certificado_dinamico` existe

#### **✅ Políticas RLS:**
- [ ] RLS está habilitado nas tabelas
- [ ] Políticas permitem acesso aos dados

## **🔧 SOLUÇÕES POR PROBLEMA**

### **PROBLEMA 1: Funções não existem**

**Sintomas:**
- Erro ao executar funções
- Funções não aparecem no diagnóstico

**Solução:**
```sql
-- Execute o script completo
-- sistema-certificados-dinamico.sql
```

### **PROBLEMA 2: Não há certificados**

**Sintomas:**
- Tabela `certificados` vazia
- Nenhum certificado aparece na interface

**Solução:**
```sql
-- Execute o script de teste
-- gerar-certificados-teste.sql
```

### **PROBLEMA 3: Problemas de RLS**

**Sintomas:**
- Erro 406 ao acessar dados
- Dados não aparecem mesmo existindo

**Solução:**
```sql
-- Execute o script de correção RLS
-- corrigir-rls-quiz-certificados.sql
```

### **PROBLEMA 4: Mapeamento curso-quiz incorreto**

**Sintomas:**
- Cursos não têm quiz associado
- Quiz não aparece para o curso

**Solução:**
```sql
-- Execute o script de mapeamento
-- criar-mapeamento-quiz.sql
```

### **PROBLEMA 5: Progresso de quiz não existe**

**Sintomas:**
- Usuários não têm quiz aprovado
- Não é possível gerar certificado

**Solução:**
```sql
-- Crie progresso de quiz manualmente ou
-- Complete um quiz através da interface
```

## **🎯 VERIFICAÇÃO RÁPIDA**

### **1. Verificar se há certificados:**
```sql
SELECT COUNT(*) FROM public.certificados;
```

### **2. Verificar se há progresso de quiz:**
```sql
SELECT COUNT(*) FROM public.progresso_quiz WHERE aprovado = true;
```

### **3. Verificar se há mapeamentos:**
```sql
SELECT COUNT(*) FROM public.curso_quiz_mapping;
```

### **4. Verificar se as funções existem:**
```sql
SELECT proname FROM pg_proc 
WHERE proname IN ('gerar_certificado_dinamico', 'buscar_certificados_usuario_dinamico')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

## **📊 FLUXO DE GERAÇÃO DE CERTIFICADOS**

### **Fluxo Normal:**
1. **Usuário completa curso** → `video_progress` atualizado
2. **Quiz é liberado** → `liberar_quiz_curso()` retorna quiz
3. **Usuário faz quiz** → `progresso_quiz` criado
4. **Quiz aprovado** → `aprovado = true`
5. **Certificado gerado** → `gerar_certificado_dinamico()` chamado
6. **Certificado salvo** → `certificados` tabela atualizada

### **Pontos de Falha:**
- ❌ Curso não concluído
- ❌ Quiz não mapeado ao curso
- ❌ Quiz não aprovado
- ❌ Função de geração não existe
- ❌ RLS bloqueando acesso
- ❌ Dados corrompidos

## **🔍 DIAGNÓSTICO ESPECÍFICO**

### **Para um usuário específico:**

```sql
-- 1. Verificar se o usuário existe
SELECT id, email, tipo_usuario FROM public.usuarios WHERE email = 'email@exemplo.com';

-- 2. Verificar progresso de curso
SELECT * FROM public.video_progress WHERE usuario_id = 'ID_DO_USUARIO';

-- 3. Verificar progresso de quiz
SELECT 
  pq.*,
  q.titulo as quiz_titulo
FROM public.progresso_quiz pq
JOIN public.quizzes q ON pq.quiz_id = q.id
WHERE pq.usuario_id = 'ID_DO_USUARIO';

-- 4. Verificar certificados
SELECT * FROM public.certificados WHERE usuario_id = 'ID_DO_USUARIO';

-- 5. Testar função de busca
SELECT * FROM buscar_certificados_usuario_dinamico('ID_DO_USUARIO');
```

## **🚀 SOLUÇÃO RÁPIDA**

### **Se nada funcionar, execute na ordem:**

1. **Diagnóstico completo:**
```sql
-- diagnostico-certificados-completo.sql
```

2. **Corrigir estrutura:**
```sql
-- sistema-certificados-dinamico.sql
```

3. **Corrigir RLS:**
```sql
-- corrigir-rls-quiz-certificados.sql
```

4. **Corrigir mapeamento:**
```sql
-- criar-mapeamento-quiz.sql
```

5. **Gerar certificados de teste:**
```sql
-- gerar-certificados-teste.sql
```

## **✅ VERIFICAÇÃO FINAL**

Após executar as correções, verifique:

1. **Interface do usuário:**
   - Acesse a aba de certificados
   - Verifique se certificados aparecem

2. **Geração de novo certificado:**
   - Complete um curso
   - Faça o quiz
   - Verifique se certificado é gerado

3. **Download de PDF:**
   - Clique em "Gerar PDF"
   - Verifique se o download funciona

## **📞 SUPORTE**

Se ainda houver problemas:

1. **Execute o diagnóstico completo**
2. **Copie os resultados**
3. **Verifique os logs do console**
4. **Teste com usuário diferente**

**O sistema deve funcionar após executar os scripts na ordem correta!** 🚀
