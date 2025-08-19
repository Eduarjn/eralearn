# 🔍 **Validação e Correção do Sistema de Quiz**

## 🎯 **Objetivo**
Garantir que o quiz seja disponibilizado corretamente após assistir todos os vídeos de cada curso.

## 📋 **Como o Sistema Funciona Atualmente**

### **🔄 Fluxo Implementado:**

1. **Usuário assiste vídeos** → Progresso salvo em `video_progress`
2. **Sistema monitora** → Hook `useOptionalQuiz` verifica conclusão
3. **Quiz aparece** → Quando TODOS os vídeos são concluídos
4. **Certificado gerado** → Após aprovação no quiz

### **✅ Critérios para Quiz Aparecer:**
- ✅ Todos os vídeos do curso concluídos
- ✅ Quiz configurado para o curso/categoria
- ✅ Usuário não completou o quiz anteriormente
- ✅ Não existe certificado para o curso

## 🔧 **Validação e Correção**

### **1. Executar Script de Validação**
```sql
-- Execute o arquivo: validar-sistema-quiz.sql
-- Este script irá:
-- ✅ Verificar estrutura das tabelas
-- ✅ Criar mapeamentos curso-quiz
-- ✅ Validar configurações
-- ✅ Gerar relatórios de status
```

### **2. Verificar Configurações por Curso**

#### **✅ Para cada curso, verificar:**
```sql
-- Verificar vídeos do curso
SELECT 
  c.nome as curso,
  COUNT(v.id) as total_videos,
  COUNT(CASE WHEN v.status = 'ativo' THEN 1 END) as videos_ativos
FROM cursos c
LEFT JOIN videos v ON c.id = v.curso_id
WHERE c.id = 'ID_DO_CURSO'
GROUP BY c.id, c.nome;

-- Verificar quiz disponível
SELECT 
  c.nome as curso,
  q.titulo as quiz,
  q.ativo,
  COUNT(qp.id) as total_perguntas
FROM cursos c
LEFT JOIN curso_quiz_mapping cqm ON c.id = cqm.curso_id
LEFT JOIN quizzes q ON cqm.quiz_id = q.id
LEFT JOIN quiz_perguntas qp ON q.id = qp.quiz_id
WHERE c.id = 'ID_DO_CURSO'
GROUP BY c.id, c.nome, q.id, q.titulo, q.ativo;
```

### **3. Corrigir Problemas Comuns**

#### **❌ Problema: Curso sem vídeos**
```sql
-- Solução: Adicionar vídeos ao curso
INSERT INTO videos (id, titulo, url_video, curso_id, status)
VALUES 
  (gen_random_uuid(), 'Vídeo 1 - Introdução', 'https://...', 'ID_DO_CURSO', 'ativo'),
  (gen_random_uuid(), 'Vídeo 2 - Conteúdo', 'https://...', 'ID_DO_CURSO', 'ativo');
```

#### **❌ Problema: Curso sem quiz**
```sql
-- Solução: Criar quiz para a categoria
INSERT INTO quizzes (id, titulo, categoria, ativo, nota_minima)
VALUES (gen_random_uuid(), 'Quiz do Curso', 'CATEGORIA_DO_CURSO', true, 70);

-- Adicionar perguntas
INSERT INTO quiz_perguntas (id, quiz_id, pergunta, opcoes, resposta_correta, ordem)
VALUES 
  (gen_random_uuid(), 'ID_DO_QUIZ', 'Pergunta 1?', '["Opção A", "Opção B", "Opção C"]', 0, 1),
  (gen_random_uuid(), 'ID_DO_QUIZ', 'Pergunta 2?', '["Opção A", "Opção B", "Opção C"]', 1, 2);
```

#### **❌ Problema: Mapeamento curso-quiz ausente**
```sql
-- Solução: Criar mapeamento
INSERT INTO curso_quiz_mapping (curso_id, quiz_id)
VALUES ('ID_DO_CURSO', 'ID_DO_QUIZ');
```

### **4. Testar Funcionalidade**

#### **✅ Teste Manual:**
1. **Acesse um curso** com vídeos
2. **Assista todos os vídeos** até 90% de duração
3. **Verifique se o quiz aparece** automaticamente
4. **Responda o quiz** e verifique aprovação
5. **Verifique se o certificado** é gerado

#### **✅ Teste via Console:**
```javascript
// No console do navegador, verificar:
console.log('Verificando progresso do curso...');

// Verificar se o hook está funcionando
const { quizState } = useOptionalQuiz('ID_DO_CURSO');
console.log('Estado do quiz:', quizState);

// Verificar se o curso foi concluído
console.log('Curso concluído:', quizState.courseCompleted);
console.log('Quiz disponível:', quizState.quizAvailable);
console.log('Deve mostrar quiz:', quizState.shouldShowQuiz);
```

### **5. Logs de Debug**

#### **✅ Logs Esperados:**
```
🔍 Iniciando carregamento de certificados...
👤 UserProfile: { id: "...", nome: "...", tipo_usuario: "..." }
👤 Tipo de usuário: admin É admin: true
🔍 Buscando TODOS os certificados (admin)...
✅ Certificados encontrados (admin): X
📋 Dados dos certificados: [...]
🎯 Verificação de Quiz: {
  courseCompleted: true,
  quizAvailable: true,
  quizAlreadyCompleted: false,
  hasCertificate: false,
  shouldShowQuiz: true
}
```

## 🚨 **Problemas Identificados e Soluções**

### **1. Quiz não aparece após concluir vídeos**
**Causa:** Mapeamento curso-quiz ausente
**Solução:** Executar script de validação

### **2. Quiz aparece mas não carrega perguntas**
**Causa:** Quiz sem perguntas configuradas
**Solução:** Adicionar perguntas ao quiz

### **3. Certificado não é gerado após aprovação**
**Causa:** Função de geração de certificado com erro
**Solução:** Verificar logs e corrigir função

### **4. Progresso de vídeos não é salvo**
**Causa:** Problema na tabela `video_progress`
**Solução:** Verificar estrutura e permissões

## 📊 **Monitoramento Contínuo**

### **✅ Métricas para Acompanhar:**
- Número de cursos com vídeos
- Número de quizzes configurados
- Taxa de conclusão de vídeos
- Taxa de aprovação em quizzes
- Número de certificados gerados

### **✅ Alertas para Configurar:**
- Curso sem vídeos
- Quiz sem perguntas
- Mapeamento curso-quiz ausente
- Erro na geração de certificados

## 🎯 **Próximos Passos**

1. **Execute o script de validação** no Supabase
2. **Verifique os relatórios** gerados
3. **Corrija problemas identificados**
4. **Teste a funcionalidade** manualmente
5. **Monitore logs** para garantir funcionamento

**O sistema está implementado corretamente, mas precisa de validação e possíveis correções de configuração!** 🚀
