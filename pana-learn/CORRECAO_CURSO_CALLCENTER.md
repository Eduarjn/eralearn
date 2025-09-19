# Correção do Curso "Fundamentos CALLCENTER"

## Problema Identificado
O botão "Iniciar Curso" do curso "Fundamentos CALLCENTER" não está funcionando corretamente, não abrindo a página para assistir os vídeos.

## Possíveis Causas
1. **Curso não existe no banco de dados**
2. **Vídeos não estão associados ao curso**
3. **Problema na rota `/curso/:id`**
4. **Problema na página `CursoDetalhe.tsx`**

## Solução

### Passo 1: Verificar e Corrigir o Banco de Dados

Execute os seguintes scripts SQL no Supabase SQL Editor:

#### 1.1 Verificar o estado atual
```sql
-- Executar: check-callcenter-course.sql
```

#### 1.2 Corrigir o curso e vídeos
```sql
-- Executar: fix-callcenter-course.sql
```

#### 1.3 Inserir vídeos de exemplo (se necessário)
```sql
-- Executar: insert-callcenter-videos.sql
```

### Passo 2: Verificar a Aplicação

1. **Acesse a plataforma** em `http://localhost:8080`
2. **Faça login** com um usuário válido
3. **Vá para a página de Treinamentos**
4. **Clique no botão "Iniciar Curso"** do curso "Fundamentos CALLCENTER"

### Passo 3: Debug (se necessário)

Se o problema persistir, verifique:

1. **Console do navegador** para erros JavaScript
2. **Network tab** para ver se a requisição está sendo feita
3. **Logs do servidor** para erros no backend

### Passo 4: Verificações Adicionais

#### Verificar se a rota está funcionando:
- Acesse diretamente: `http://localhost:8080/curso/[ID_DO_CURSO]`
- Substitua `[ID_DO_CURSO]` pelo ID real do curso CALLCENTER

#### Verificar se os vídeos estão sendo carregados:
- Abra o DevTools (F12)
- Vá para a aba Console
- Procure por logs que começam com "🎯 CursoDetalhe"

## Scripts SQL Criados

### check-callcenter-course.sql
- Verifica se o curso existe
- Lista todos os cursos disponíveis
- Verifica vídeos associados
- Conta vídeos por categoria

### fix-callcenter-course.sql
- Insere o curso se não existir
- Associa vídeos da categoria CALLCENTER ao curso
- Verifica o resultado final

### insert-callcenter-videos.sql
- Insere vídeos de exemplo para o curso
- 4 vídeos com conteúdo sobre call center
- Duração total: ~2 horas

## Resultado Esperado

Após executar os scripts:
1. ✅ O curso "Fundamentos CALLCENTER" deve existir no banco
2. ✅ Deve ter vídeos associados
3. ✅ O botão "Iniciar Curso" deve funcionar
4. ✅ A página do curso deve exibir os vídeos
5. ✅ Deve ser possível assistir os vídeos

## Status
🔄 **EM ANDAMENTO** - Scripts criados, aguardando execução














































