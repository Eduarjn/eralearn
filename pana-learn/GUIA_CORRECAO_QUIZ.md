# Guia de Correção - Sistema de Quiz

## Problema Identificado

O quiz está sendo iniciado mas não há perguntas carregadas (mostra "0/0 perguntas respondidas"). Isso acontece porque:

1. **Tabelas de quiz não existem** ou estão vazias
2. **Políticas RLS** estão bloqueando o acesso
3. **Dados de quiz** não foram inseridos para a categoria do curso

## Passos para Correção

### 1. Execute o Script de Debug

Acesse o **Supabase Dashboard** → **SQL Editor** e execute o script `debug-quiz-system.sql`:

```sql
-- Copie e cole o conteúdo do arquivo debug-quiz-system.sql
```

Este script irá:
- ✅ Verificar se as tabelas existem
- ✅ Verificar dados existentes
- ✅ Inserir dados de teste para PABX
- ✅ Configurar políticas RLS
- ✅ Testar as consultas

### 2. Verificar Resultados do Script

Após executar o script, você deve ver:

**✅ Tabelas existem:**
```
quizzes - EXISTE
quiz_perguntas - EXISTE
```

**✅ Dados inseridos:**
```
Quiz: Configurações Avançadas PABX
Categoria: PABX
Total perguntas: 5
```

**✅ Consulta funcionando:**
```
Deve retornar 5 perguntas para PABX
```

### 3. Teste o Quiz

1. **Acesse o curso PABX** como cliente
2. **Conclua o vídeo** (assista até o final)
3. **Clique em "Apresentar Prova"**
4. **Verifique se as perguntas aparecem**

### 4. Se Ainda Não Funcionar

#### Verificar Console do Navegador:
Abra o **Developer Tools** (F12) e verifique:

**Logs esperados:**
```
🔍 Carregando quiz para categoria: PABX
✅ Quiz carregado: { id: "...", titulo: "...", perguntas: [...] }
```

**Se houver erros:**
- Verifique se o usuário está autenticado
- Verifique se a categoria do curso está correta
- Verifique se as políticas RLS estão ativas

#### Verificar Categoria do Curso:
No Supabase, execute:
```sql
SELECT id, nome, categoria FROM cursos WHERE nome LIKE '%PABX%';
```

A categoria deve ser **exatamente** `PABX` (maiúsculas).

### 5. Estrutura das Tabelas

#### Tabela `quizzes`:
```sql
CREATE TABLE quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL,
    nota_minima INTEGER DEFAULT 70,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela `quiz_perguntas`:
```sql
CREATE TABLE quiz_perguntas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    opcoes TEXT[] NOT NULL,
    resposta_correta INTEGER NOT NULL,
    explicacao TEXT,
    ordem INTEGER DEFAULT 0,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Políticas RLS Corrigidas

```sql
-- Política para quizzes
CREATE POLICY "Todos podem ver quizzes ativos" ON quizzes
    FOR SELECT USING (ativo = TRUE);

-- Política para quiz_perguntas
CREATE POLICY "Todos podem ver perguntas de quizzes ativos" ON quiz_perguntas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quizzes q 
            WHERE q.id = quiz_perguntas.quiz_id 
            AND q.ativo = TRUE
        )
    );
```

### 7. Dados de Teste Inseridos

**Quiz PABX com 5 perguntas:**
1. O que é um PABX?
2. Qual a principal função de um Dialplan?
3. O que significa URA?
4. Qual componente gerencia filas de atendimento?
5. O que é uma extensão no PABX?

### 8. Troubleshooting

#### Se o quiz não carregar:
1. **Verifique a categoria do curso** no banco de dados
2. **Verifique se há quiz para essa categoria**
3. **Verifique as políticas RLS**
4. **Verifique os logs no console**

#### Se aparecer "0 perguntas":
1. **Execute o script de debug novamente**
2. **Verifique se as perguntas foram inseridas**
3. **Verifique se o quiz está ativo**
4. **Verifique se a categoria está correta**

#### Se der erro 406:
1. **Verifique as políticas RLS**
2. **Verifique se o usuário está autenticado**
3. **Verifique se as tabelas existem**

### 9. Verificação Final

Após executar todos os passos, verifique:

1. ✅ **Quiz carrega** - Perguntas aparecem
2. ✅ **Perguntas respondidas** - Pode selecionar respostas
3. ✅ **Quiz finaliza** - Pode submeter o quiz
4. ✅ **Nota calculada** - Mostra a nota final
5. ✅ **Certificado gerado** - Se aprovado (70%+)

### 10. Logs de Debug

O hook `useQuiz` deve mostrar logs como:
```
🔍 Carregando quiz para categoria: PABX
✅ Quiz carregado: { id: "...", titulo: "...", perguntas: [...] }
📝 Total de perguntas: 5
```

---

**Status:** ✅ Script de debug criado
**Próximo passo:** Execute o script `debug-quiz-system.sql` e teste o quiz 