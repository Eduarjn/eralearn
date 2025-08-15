# Guia de Organização de Quizzes por Curso Específico

## Problema Identificado
- O mesmo quiz "PABX" aparecia tanto em "Fundamentos de PABX" quanto em "Configurações Avançadas PABX"
- Quizzes não estavam organizados por curso específico
- Necessidade de criar quizzes únicos para cada curso

## Solução Implementada

### 1. Criação de Quizzes Específicos
Criamos 5 novos quizzes específicos:

| Curso | Categoria Quiz | Título do Quiz |
|-------|----------------|----------------|
| Fundamentos de PABX | `PABX_FUNDAMENTOS` | Quiz de Conclusão - Fundamentos de PABX |
| Configurações Avançadas PABX | `PABX_AVANCADO` | Quiz de Conclusão - Configurações Avançadas PABX |
| OMNICHANNEL para Empresas | `OMNICHANNEL_EMPRESAS` | Quiz de Conclusão - OMNICHANNEL para Empresas |
| Configurações Avançadas OMNI | `OMNICHANNEL_AVANCADO` | Quiz de Conclusão - Configurações Avançadas OMNI |
| Fundamentos CALLCENTER | `CALLCENTER_FUNDAMENTOS` | Quiz de Conclusão - Fundamentos CALLCENTER |

### 2. Sistema de Mapeamento
- Criada tabela `curso_quiz_mapping` para mapear cursos com suas categorias de quiz
- Função `get_quiz_by_course(course_id)` para buscar quiz específico de cada curso
- Hook `useOptionalQuiz` atualizado para usar o novo sistema

### 3. Perguntas Específicas
Cada quiz tem 3 perguntas específicas relacionadas ao conteúdo do curso:

**Fundamentos de PABX:**
- O que significa PABX?
- Qual é a principal função de um sistema PABX?
- Um sistema PABX pode integrar com softwares de CRM?

**Configurações Avançadas PABX:**
- O que é um Dialplan em um sistema PABX?
- Qual é a principal vantagem de um sistema PABX avançado?
- O que é uma URA em um sistema PABX?

**OMNICHANNEL para Empresas:**
- O que é uma solução Omnichannel?
- Qual é o benefício principal do Omnichannel para empresas?
- Quais canais podem ser integrados em uma solução Omnichannel?

**Configurações Avançadas OMNI:**
- O que é roteamento inteligente em Omnichannel?
- Como funciona a continuidade de conversa em Omnichannel?
- O que é análise preditiva em Omnichannel?

**Fundamentos CALLCENTER:**
- Qual é o objetivo principal de um call center?
- O que significa SLA em um call center?
- O que é um ACD em um call center?

## Scripts Criados

### 1. `organizar-quizzes-por-curso.sql`
- Cria os novos quizzes específicos
- Cria as perguntas para cada quiz
- Verifica se tudo foi criado corretamente

### 2. `mapear-cursos-quizzes.sql`
- Cria a tabela de mapeamento
- Mapeia cursos com suas categorias de quiz
- Cria função para buscar quiz por curso
- Verifica mapeamentos criados

### 3. `desabilitar-quizzes-antigos.sql`
- Lista quizzes antigos que podem ser desabilitados
- Script para desabilitar (comentado por segurança)
- Instruções de rollback

## Passos de Implementação

### Passo 1: Executar Scripts SQL
```sql
-- 1. Criar novos quizzes e perguntas
-- Execute: organizar-quizzes-por-curso.sql

-- 2. Criar mapeamentos
-- Execute: mapear-cursos-quizzes.sql
```

### Passo 2: Testar Funcionamento
1. Acesse cada curso e verifique se aparece apenas o quiz específico
2. Teste se as perguntas são relevantes para o curso
3. Verifique se não há erros no console

### Passo 3: Desabilitar Quizzes Antigos (Opcional)
```sql
-- Execute: desabilitar-quizzes-antigos.sql
-- Descomente as linhas de UPDATE após confirmar que tudo funciona
```

## Verificações Importantes

### ✅ Antes de Desabilitar Quizzes Antigos
- [ ] Cada curso mostra apenas seu quiz específico
- [ ] As perguntas são relevantes para o curso
- [ ] Não há erros no console do navegador
- [ ] O sistema de progresso funciona corretamente
- [ ] Os certificados são gerados corretamente

### ✅ Testes Recomendados
1. **Fundamentos de PABX**: Deve mostrar "Quiz de Conclusão - Fundamentos de PABX"
2. **Configurações Avançadas PABX**: Deve mostrar "Quiz de Conclusão - Configurações Avançadas PABX"
3. **OMNICHANNEL para Empresas**: Deve mostrar "Quiz de Conclusão - OMNICHANNEL para Empresas"
4. **Configurações Avançadas OMNI**: Deve mostrar "Quiz de Conclusão - Configurações Avançadas OMNI"
5. **Fundamentos CALLCENTER**: Deve mostrar "Quiz de Conclusão - Fundamentos CALLCENTER"

## Rollback (Se Necessário)

Se algo der errado, você pode:

1. **Reabilitar quizzes antigos:**
```sql
UPDATE quizzes 
SET ativo = true, data_atualizacao = NOW() 
WHERE categoria IN ('PABX', 'Omnichannel', 'CALLCENTER', 'VoIP', '40f4279b-722a-4c85-b689-6ee68dfde761');
```

2. **Remover mapeamentos:**
```sql
DROP TABLE IF EXISTS curso_quiz_mapping;
```

3. **Remover novos quizzes:**
```sql
DELETE FROM quiz_perguntas WHERE quiz_id IN (
  SELECT id FROM quizzes 
  WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS')
);

DELETE FROM quizzes 
WHERE categoria IN ('PABX_FUNDAMENTOS', 'PABX_AVANCADO', 'OMNICHANNEL_EMPRESAS', 'OMNICHANNEL_AVANCADO', 'CALLCENTER_FUNDAMENTOS');
```

## Benefícios da Nova Organização

1. **Especificidade**: Cada curso tem seu quiz único e relevante
2. **Clareza**: Não há confusão sobre qual quiz pertence a qual curso
3. **Manutenibilidade**: Fácil adicionar novos cursos e quizzes
4. **Experiência do Usuário**: Quiz mais focado no conteúdo específico do curso
5. **Escalabilidade**: Sistema preparado para futuros cursos

## Próximos Passos

1. Execute os scripts SQL na ordem correta
2. Teste cada curso individualmente
3. Confirme que tudo funciona corretamente
4. Desabilite os quizzes antigos (opcional)
5. Monitore o sistema por alguns dias para garantir estabilidade
