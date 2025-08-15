# Guia - Sistema de Quiz Universal

## Objetivo

Configurar o sistema de quiz para funcionar em **TODOS os cursos** automaticamente, não apenas para cursos específicos.

## Como Funciona

### ✅ **Sistema Automático:**
- **Detecta categorias** existentes automaticamente
- **Cria quiz** para cada categoria encontrada
- **Insere perguntas** genéricas para todos os cursos
- **Funciona** para qualquer curso novo que seja adicionado

### 📋 **O que o script faz:**

1. **Verifica categorias existentes** na tabela `cursos`
2. **Cria quiz** para cada categoria encontrada
3. **Insere 5 perguntas** genéricas para cada quiz
4. **Configura políticas RLS** para permitir acesso
5. **Testa** se tudo está funcionando

## Perguntas Genéricas Inseridas

Para cada categoria, o sistema cria 5 perguntas universais:

1. **"Qual é o objetivo principal deste curso?"**
   - Aprender conceitos básicos
   - Desenvolver habilidades avançadas
   - Obter certificação
   - **Todas as opções acima** ✅

2. **"Qual a importância deste conteúdo para sua carreira?"**
   - Baixa importância
   - **Importância média** ✅
   - Alta importância
   - Essencial

3. **"Como você aplicaria este conhecimento na prática?"**
   - Apenas na teoria
   - Em projetos simples
   - **Em projetos complexos** ✅
   - Em qualquer situação

4. **"Qual a melhor forma de continuar aprendendo sobre este tema?"**
   - Parar de estudar
   - **Estudar regularmente** ✅
   - Estudar constantemente
   - Estudar ocasionalmente

5. **"Qual sua opinião sobre a qualidade deste curso?"**
   - Ruim
   - **Bom** ✅
   - Regular
   - Excelente

## Passos para Implementação

### 1. Execute o Script Universal

Acesse o **Supabase Dashboard** → **SQL Editor** e execute:

```sql
-- Copie e cole o conteúdo do arquivo fix-quiz-system-universal.sql
```

### 2. Verificar Resultados

Após executar o script, você deve ver:

**✅ Categorias detectadas:**
```
PABX
teste
outras_categorias...
```

**✅ Quizzes criados:**
```
Quiz: PABX - 5 perguntas
Quiz: teste - 5 perguntas
Quiz: outras_categorias - 5 perguntas
```

**✅ Verificação final:**
```
Todas as categorias devem mostrar "TEM QUIZ"
```

### 3. Teste em Diferentes Cursos

1. **Acesse qualquer curso** como cliente
2. **Conclua o vídeo** (assista até o final)
3. **Clique em "Apresentar Prova"**
4. **Verifique se as perguntas aparecem**

## Vantagens do Sistema Universal

### ✅ **Automático:**
- Não precisa configurar manualmente para cada curso
- Funciona automaticamente para novos cursos
- Detecta categorias automaticamente

### ✅ **Consistente:**
- Mesma estrutura para todos os cursos
- Mesmas políticas RLS
- Mesmo sistema de pontuação

### ✅ **Flexível:**
- Pode ter perguntas específicas para cursos importantes (como PABX)
- Mantém perguntas genéricas para cursos básicos
- Fácil de personalizar posteriormente

## Personalização

### Para Cursos Específicos:
Se quiser perguntas específicas para um curso importante:

1. **Execute o script universal primeiro**
2. **Depois execute** um script específico para o curso
3. **O script específico** substituirá as perguntas genéricas

### Exemplo para PABX:
```sql
-- O script já inclui perguntas específicas para PABX
-- Outros cursos mantêm perguntas genéricas
```

## Verificação

### Como saber se funcionou:

1. **Execute o script** `fix-quiz-system-universal.sql`
2. **Verifique a seção "VERIFICAÇÃO FINAL"**
3. **Todas as categorias** devem mostrar "TEM QUIZ"
4. **Teste em diferentes cursos**

### Logs esperados:
```
🔍 Carregando quiz para categoria: [qualquer_categoria]
✅ Quiz carregado: { id: "...", titulo: "...", perguntas: [...] }
📝 Total de perguntas: 5
```

## Troubleshooting

### Se algum curso não tiver quiz:
1. **Verifique se a categoria** está definida no curso
2. **Execute o script novamente**
3. **Verifique se não há erros** na execução

### Se as perguntas não aparecerem:
1. **Verifique as políticas RLS**
2. **Verifique se o usuário está autenticado**
3. **Verifique os logs no console**

### Para adicionar novos cursos:
1. **Adicione o curso** normalmente
2. **Defina a categoria** do curso
3. **Execute o script universal** novamente
4. **O quiz será criado automaticamente**

---

**Status:** ✅ Sistema universal criado
**Cobertura:** ✅ Todos os cursos
**Próximo passo:** Execute o script `fix-quiz-system-universal.sql` 