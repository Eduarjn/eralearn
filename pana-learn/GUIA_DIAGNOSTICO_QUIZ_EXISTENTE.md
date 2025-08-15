# Guia - Diagnóstico do Sistema de Quiz Existente

## 🎯 **Objetivo**

Verificar e corrigir problemas no sistema de quiz **já existente**, sem criar novos dados ou perder funcionalidades.

## 📊 **Análise dos Dados Existentes**

### ✅ **Quizzes Configurados:**
- **PABX** - Quiz específico com perguntas técnicas
- **Omnichannel** - Quiz sobre plataformas omnichannel  
- **CALLCENTER** - Quiz sobre call centers
- **VoIP** - Quiz sobre tecnologias VoIP
- **UUID específico** - Quiz para categoria com ID

### ✅ **Perguntas Específicas:**
- **PABX**: Perguntas técnicas sobre PABX, Dialplan, URA, etc.
- **Omnichannel**: Perguntas sobre integração de canais
- **CALLCENTER**: Perguntas sobre SLA, atendimento ao cliente
- **VoIP**: Perguntas sobre Voice over IP

## 🔍 **Problemas Possíveis**

### 1. **Políticas RLS (Row Level Security)**
- Quiz existe mas usuário não consegue acessar
- Perguntas existem mas não são carregadas
- Erro 406 (Not Acceptable)

### 2. **Problemas de Consulta**
- Categoria do curso não corresponde ao quiz
- Quiz inativo
- Perguntas sem ordem definida

### 3. **Problemas de Dados**
- Quiz sem perguntas
- Perguntas órfãs (sem quiz)
- Dados corrompidos

## 🛠️ **Script de Diagnóstico**

### Execute o Script:
```sql
-- Copie e cole o conteúdo do arquivo fix-existing-quiz-system.sql
```

### O que o script verifica:

1. **✅ Estrutura atual** - Quantos quizzes e perguntas existem
2. **✅ Dados por categoria** - Quais quizzes estão ativos
3. **✅ Políticas RLS** - Se as políticas de segurança estão corretas
4. **✅ Consultas do frontend** - Se as consultas retornam dados
5. **✅ Integridade dos dados** - Se há problemas nos dados
6. **✅ Categorias vs quizzes** - Se todos os cursos têm quiz

## 📋 **Interpretação dos Resultados**

### ✅ **Se tudo estiver OK:**
```
PABX - OK (3 perguntas)
Omnichannel - OK (2 perguntas)
CALLCENTER - OK (2 perguntas)
VoIP - OK (1 pergunta)
```

### ❌ **Se houver problemas:**
```
PABX - PROBLEMA - SEM PERGUNTAS
RLS PENDENTE
```

## 🔧 **Correções Automáticas**

O script faz correções **conservadoras**:

### ✅ **Políticas RLS:**
- Cria políticas se não existirem
- **NÃO** remove políticas existentes
- **NÃO** altera configurações funcionando

### ✅ **Verificações:**
- Identifica quizzes sem perguntas
- Identifica perguntas órfãs
- Testa consultas do frontend

## 🎯 **Próximos Passos**

### 1. **Execute o Diagnóstico**
```sql
-- Execute fix-existing-quiz-system.sql
```

### 2. **Analise os Resultados**
- Verifique se todas as categorias mostram "OK"
- Verifique se RLS está configurado
- Verifique se não há problemas de dados

### 3. **Se Houver Problemas**

#### **Problema: "SEM PERGUNTAS"**
- Verifique se o quiz está ativo
- Verifique se as perguntas existem
- Verifique se a categoria está correta

#### **Problema: "RLS PENDENTE"**
- O script criará automaticamente as políticas
- Execute novamente para confirmar

#### **Problema: "SEM QUIZ"**
- Verifique se a categoria do curso está correta
- Verifique se há quiz para essa categoria

### 4. **Teste no Frontend**
1. **Acesse um curso** como cliente
2. **Conclua o vídeo**
3. **Clique em "Apresentar Prova"**
4. **Verifique se as perguntas aparecem**

## 🚨 **Proteções do Script**

### ✅ **Conservador:**
- **NÃO** cria novos dados
- **NÃO** remove dados existentes
- **NÃO** altera configurações funcionando
- **APENAS** corrige problemas identificados

### ✅ **Seguro:**
- Verifica antes de alterar
- Usa `IF NOT EXISTS` para evitar conflitos
- Mantém todas as funcionalidades existentes

## 📊 **Logs Esperados**

### **Console do Navegador:**
```
🔍 Carregando quiz para categoria: PABX
✅ Quiz carregado: { id: "...", titulo: "...", perguntas: [...] }
📝 Total de perguntas: 3
```

### **Se houver erro:**
```
❌ Erro ao carregar quiz: 406 Not Acceptable
```

## 🔍 **Troubleshooting Específico**

### **Se o quiz não carregar:**
1. **Verifique as políticas RLS** no resultado do script
2. **Verifique se o quiz está ativo** (`ativo = TRUE`)
3. **Verifique se há perguntas** para o quiz
4. **Verifique a categoria** do curso vs quiz

### **Se aparecer "0 perguntas":**
1. **Execute o script de diagnóstico**
2. **Verifique se há perguntas** na tabela `quiz_perguntas`
3. **Verifique se o quiz está ativo**
4. **Verifique se a categoria está correta**

### **Se der erro 406:**
1. **Verifique as políticas RLS**
2. **Verifique se o usuário está autenticado**
3. **Verifique se as tabelas existem**

## 📈 **Monitoramento**

### **Após a correção:**
1. **Teste em diferentes cursos**
2. **Verifique se todos os quizzes funcionam**
3. **Monitore os logs do console**
4. **Confirme que não há regressões**

---

**Status:** ✅ Script de diagnóstico criado
**Abordagem:** ✅ Conservadora - não perde funcionalidades
**Próximo passo:** Execute `fix-existing-quiz-system.sql` e analise os resultados 