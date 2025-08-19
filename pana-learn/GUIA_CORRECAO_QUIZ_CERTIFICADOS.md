# 🎯 **GUIA DE CORREÇÃO - SISTEMA DE QUIZ E CERTIFICADOS**

## **📋 RESUMO DOS PROBLEMAS IDENTIFICADOS**

### **❌ Problemas Atuais:**
1. **Inconsistência na estrutura do banco** - Múltiplas versões de tabelas
2. **Quiz não aparece automaticamente** após conclusão do curso
3. **Certificado não é gerado** corretamente
4. **Falta de relacionamento direto** entre curso e quiz
5. **Hook useQuiz** busca por categoria em vez de curso

### **✅ Solução Implementada:**
- Estrutura unificada com relacionamento direto curso → quiz → certificado
- Hook atualizado para trabalhar com curso_id
- Componentes sincronizados com nova estrutura
- Fluxo automático de quiz após conclusão

## **🛠️ PASSOS PARA CORREÇÃO**

### **Passo 1: Executar Script de Correção do Banco**

Execute o script `sistema-quiz-certificado-corrigido.sql` no Supabase:

```sql
-- Execute este script no SQL Editor do Supabase Dashboard
-- Arquivo: sistema-quiz-certificado-corrigido.sql
```

**O que este script faz:**
- Remove tabelas antigas inconsistentes
- Cria nova estrutura com relacionamento curso → quiz
- Configura RLS e políticas de segurança
- Insere dados de exemplo
- Cria índices para performance

### **Passo 2: Verificar Estrutura Atual**

Execute o script `verificar-estrutura-atual.sql` para diagnosticar:

```sql
-- Execute este script para verificar o estado atual
-- Arquivo: verificar-estrutura-atual.sql
```

**Verificações importantes:**
- ✅ Tabelas criadas corretamente
- ✅ Relacionamentos funcionando
- ✅ Dados de exemplo inseridos
- ✅ RLS configurado

### **Passo 3: Atualizar Componentes**

Os seguintes arquivos foram atualizados:

1. **`src/hooks/useQuiz.ts`** - Hook principal atualizado
2. **`src/components/CourseQuizModal.tsx`** - Modal de quiz corrigido

### **Passo 4: Testar o Sistema**

## **🎯 FLUXO CORRIGIDO**

### **1. Usuário assiste vídeos do curso**
```typescript
// Progresso é registrado em video_progress
// Quando todos os vídeos são concluídos, curso é marcado como completo
```

### **2. Quiz aparece automaticamente**
```typescript
// useQuiz hook detecta conclusão do curso
// Modal de quiz é exibido automaticamente
```

### **3. Usuário responde quiz**
```typescript
// Respostas são validadas
// Nota é calculada automaticamente
// Progresso é salvo em progresso_quiz
```

### **4. Certificado é gerado**
```typescript
// Se nota >= 70%, certificado é gerado automaticamente
// Certificado é salvo em certificados
// Usuário recebe feedback visual
```

## **📊 ESTRUTURA DO BANCO CORRIGIDA**

### **Tabela: `quizzes`**
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id), -- RELACIONAMENTO DIRETO
  titulo VARCHAR(255),
  descricao TEXT,
  nota_minima INTEGER DEFAULT 70,
  ativo BOOLEAN DEFAULT TRUE,
  UNIQUE(curso_id) -- UM QUIZ POR CURSO
);
```

### **Tabela: `certificados`**
```sql
CREATE TABLE certificados (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  curso_id UUID REFERENCES cursos(id), -- RELACIONAMENTO DIRETO
  curso_nome TEXT,
  quiz_id UUID REFERENCES quizzes(id),
  nota INTEGER,
  data_conclusao TIMESTAMP,
  UNIQUE(usuario_id, curso_id) -- UM CERTIFICADO POR USUÁRIO/CURSO
);
```

## **🔧 COMPONENTES ATUALIZADOS**

### **Hook: `useQuiz`**
```typescript
// Antes: useQuiz(userId, categoriaId)
// Depois: useQuiz(userId, courseId)

export function useQuiz(userId: string | undefined, courseId: string | undefined) {
  // Busca quiz diretamente pelo curso_id
  // Verifica conclusão dos vídeos do curso
  // Gera certificado relacionado ao curso
}
```

### **Modal: `CourseQuizModal`**
```typescript
// Recebe courseId diretamente
// Usa nova estrutura de dados
// Salva progresso automaticamente
// Gera certificado automaticamente
```

## **🧪 TESTES NECESSÁRIOS**

### **Teste 1: Criação de Quiz**
1. Acesse um curso
2. Verifique se quiz foi criado automaticamente
3. Confirme perguntas foram inseridas

### **Teste 2: Conclusão de Curso**
1. Assista todos os vídeos de um curso
2. Verifique se quiz aparece automaticamente
3. Confirme modal é exibido

### **Teste 3: Resposta do Quiz**
1. Responda todas as perguntas
2. Verifique cálculo de nota
3. Confirme salvamento de progresso

### **Teste 4: Geração de Certificado**
1. Aprove no quiz (nota >= 70%)
2. Verifique certificado é gerado
3. Confirme certificado aparece na lista

## **🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES**

### **Problema: Quiz não aparece**
**Solução:**
```sql
-- Verificar se quiz existe para o curso
SELECT * FROM quizzes WHERE curso_id = 'ID_DO_CURSO';

-- Se não existir, criar manualmente
INSERT INTO quizzes (curso_id, titulo, descricao, nota_minima, ativo)
VALUES ('ID_DO_CURSO', 'Quiz do Curso', 'Descrição', 70, true);
```

### **Problema: Certificado não é gerado**
**Solução:**
```sql
-- Verificar se usuário tem permissão
-- Verificar se RLS está configurado corretamente
-- Verificar se curso_id está correto
```

### **Problema: Vídeos não são detectados como concluídos**
**Solução:**
```sql
-- Verificar se video_progress está sendo atualizado
SELECT * FROM video_progress WHERE user_id = 'ID_USUARIO';

-- Verificar se vídeos estão associados ao curso
SELECT * FROM videos WHERE curso_id = 'ID_DO_CURSO';
```

## **📈 PRÓXIMOS PASSOS**

1. **Execute os scripts** na ordem correta
2. **Teste cada funcionalidade** conforme guia
3. **Monitore logs** para identificar problemas
4. **Ajuste configurações** conforme necessário
5. **Documente mudanças** para equipe

## **✅ CHECKLIST DE VALIDAÇÃO**

- [ ] Script de correção executado com sucesso
- [ ] Estrutura do banco verificada
- [ ] Componentes atualizados
- [ ] Quiz aparece automaticamente
- [ ] Certificado é gerado corretamente
- [ ] Fluxo completo testado
- [ ] Problemas documentados e resolvidos

---

**🎉 Com essas correções, o sistema de quiz e certificados funcionará perfeitamente!**
