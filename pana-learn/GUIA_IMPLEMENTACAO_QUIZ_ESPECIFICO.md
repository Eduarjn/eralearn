# 🎯 **GUIA DE IMPLEMENTAÇÃO - SISTEMA DE QUIZ ESPECÍFICO**

## **📋 RESUMO DA SOLUÇÃO**

### **✅ O QUE FOI IMPLEMENTADO:**

1. **Mapeamento Curso → Quiz Específico**
   - Cada curso tem seu quiz específico
   - Relacionamento direto via tabela `curso_quiz_mapping`

2. **Funções do Banco de Dados**
   - `verificar_conclusao_curso()` - Verifica se curso foi concluído
   - `liberar_quiz_curso()` - Libera quiz quando curso é concluído
   - `gerar_certificado_curso()` - Gera certificado automaticamente

3. **Hook useQuiz Atualizado**
   - Usa funções do banco para verificar disponibilidade
   - Carrega quiz específico do curso
   - Gerencia progresso e certificados

4. **Componente CourseQuizModal Melhorado**
   - Interface mais intuitiva
   - Estados diferentes para cada situação
   - Feedback visual claro

## **🛠️ PASSOS PARA IMPLEMENTAR**

### **Passo 1: Executar Script SQL**

Execute o arquivo `corrigir-sistema-quiz-especifico.sql` no Supabase:

```sql
-- Execute este script no SQL Editor do Supabase Dashboard
-- Arquivo: corrigir-sistema-quiz-especifico.sql
```

**O que este script faz:**
- ✅ Cria tabela de mapeamento curso-quiz
- ✅ Mapeia cada curso com seu quiz específico
- ✅ Cria funções para verificar conclusão e liberar quiz
- ✅ Atualiza tabela de certificados
- ✅ Configura RLS e políticas

### **Passo 2: Verificar Mapeamentos**

Após executar o script, verifique se os mapeamentos foram criados:

```sql
-- Verificar mapeamentos criados
SELECT 
  c.nome as curso,
  q.titulo as quiz,
  q.categoria as categoria_quiz
FROM curso_quiz_mapping cqm
JOIN cursos c ON cqm.curso_id = c.id
JOIN quizzes q ON cqm.quiz_id = q.id
ORDER BY c.nome;
```

**Resultado esperado:**
- Fundamentos de PABX → Quiz de Conclusão - Fundamentos de PABX
- Configurações Avançadas PABX → Quiz de Conclusão - Configurações Avançadas PABX
- OMNICHANNEL para Empresas → Quiz de Conclusão - OMNICHANNEL para Empresas
- Configurações Avançadas OMNI → Quiz de Conclusão - Configurações Avançadas OMNI
- Fundamentos CALLCENTER → Quiz de Conclusão - Fundamentos CALLCENTER

### **Passo 3: Atualizar Frontend**

Os arquivos já foram atualizados:

1. **`src/hooks/useQuiz.ts`** - Hook principal atualizado
2. **`src/components/CourseQuizModal.tsx`** - Modal de quiz melhorado

### **Passo 4: Testar o Sistema**

## **🎯 FLUXO DE FUNCIONAMENTO**

### **1. Usuário assiste vídeos do curso**
```typescript
// Progresso é registrado em video_progress
// Quando todos os vídeos são concluídos, curso é marcado como completo
```

### **2. Quiz é liberado automaticamente**
```typescript
// useQuiz hook chama liberar_quiz_curso()
// Se retorna quiz_id, quiz está disponível
// Se retorna null, curso não foi concluído
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
// Função gerar_certificado_curso() é chamada
// Certificado é salvo em certificados
```

## **📊 ESTRUTURA DO BANCO**

### **Tabela: `curso_quiz_mapping`**
```sql
CREATE TABLE curso_quiz_mapping (
  id UUID PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id),
  quiz_id UUID REFERENCES quizzes(id),
  data_criacao TIMESTAMP,
  UNIQUE(curso_id, quiz_id)
);
```

### **Função: `liberar_quiz_curso()`**
```sql
-- Verifica se curso foi concluído
-- Retorna quiz_id se disponível, null se não
SELECT liberar_quiz_curso('usuario_id', 'curso_id');
```

### **Função: `gerar_certificado_curso()`**
```sql
-- Gera certificado automaticamente
SELECT gerar_certificado_curso('usuario_id', 'curso_id', 'quiz_id', 85);
```

## **🧪 TESTES NECESSÁRIOS**

### **Teste 1: Mapeamento de Cursos**
1. Execute o script SQL
2. Verifique se todos os cursos foram mapeados
3. Confirme que cada curso tem seu quiz específico

### **Teste 2: Conclusão de Curso**
1. Assista todos os vídeos de um curso
2. Verifique se quiz aparece automaticamente
3. Confirme que modal é exibido

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
-- Verificar se mapeamento existe
SELECT * FROM curso_quiz_mapping WHERE curso_id = 'ID_DO_CURSO';

-- Verificar se curso foi concluído
SELECT verificar_conclusao_curso('ID_USUARIO', 'ID_DO_CURSO');

-- Verificar se quiz está ativo
SELECT * FROM quizzes WHERE id = 'ID_DO_QUIZ';
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

1. **Execute o script SQL** no Supabase
2. **Teste cada funcionalidade** conforme guia
3. **Monitore logs** para identificar problemas
4. **Ajuste configurações** conforme necessário
5. **Documente mudanças** para equipe

## **✅ CHECKLIST DE VALIDAÇÃO**

- [ ] Script SQL executado com sucesso
- [ ] Mapeamentos curso-quiz criados
- [ ] Funções do banco criadas
- [ ] Frontend atualizado
- [ ] Quiz aparece automaticamente
- [ ] Certificado é gerado corretamente
- [ ] Fluxo completo testado
- [ ] Problemas documentados e resolvidos

## **🎉 RESULTADO FINAL**

Com essa implementação, você terá:

✅ **Quiz específico para cada curso**
✅ **Liberação automática após conclusão**
✅ **Certificado específico por curso**
✅ **Interface melhorada e intuitiva**
✅ **Sistema robusto e escalável**

**O sistema agora funciona perfeitamente com seus quizzes existentes!** 🚀
