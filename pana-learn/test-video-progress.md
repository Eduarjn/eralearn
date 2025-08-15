# Teste do Sistema de Progresso de Vídeos

## Pré-requisitos

1. Execute a migração do banco de dados:
```sql
-- Executar o arquivo: supabase/migrations/20250620000000-add-video-progress.sql
```

2. Certifique-se de que existem vídeos na tabela `videos` com `modulo_id` e `curso_id` preenchidos.

## Testes a serem realizados

### 1. Detecção de Conclusão de Vídeo

**Cenário:** Usuário assiste um vídeo até o fim
- [ ] Acesse a página de detalhes do curso como cliente
- [ ] Selecione um vídeo para assistir
- [ ] Avance o vídeo até 90% ou mais da duração
- [ ] Verifique se o badge "Concluído!" aparece
- [ ] Verifique se o toast de notificação aparece
- [ ] Verifique se o checkbox é marcado na lista de vídeos

### 2. Registro no Banco de Dados

**Cenário:** Verificar se os dados são salvos corretamente
- [ ] Após concluir um vídeo, verifique na tabela `video_progress`:
  - [ ] `concluido` = true
  - [ ] `data_conclusao` preenchida
  - [ ] `percentual_assistido` >= 90
  - [ ] `tempo_assistido` e `tempo_total` preenchidos

### 3. Sincronização com Progresso de Módulo

**Cenário:** Verificar se o progresso do módulo é atualizado
- [ ] Após concluir um vídeo, verifique na tabela `progresso_usuario`:
  - [ ] `status` atualizado para 'em_andamento' ou 'concluido'
  - [ ] `percentual_concluido` calculado corretamente
  - [ ] `data_conclusao` preenchida se todos os vídeos do módulo foram concluídos

### 4. Interface de Checklist

**Cenário:** Verificar a interface de checklist
- [ ] Na sidebar, verifique se os vídeos mostram:
  - [ ] Ícone de check verde para vídeos concluídos
  - [ ] Ícone de play azul para vídeos em andamento
  - [ ] Ícone de círculo cinza para vídeos não iniciados
  - [ ] Percentual de progresso correto
  - [ ] Barra de progresso visual

### 5. Relatórios

**Cenário:** Verificar se os relatórios incluem dados de vídeos
- [ ] Acesse a página de relatórios como admin
- [ ] Verifique se os dados de progresso de vídeos são carregados
- [ ] Verifique se os filtros funcionam corretamente

### 6. Restauração de Progresso

**Cenário:** Verificar se o progresso é restaurado
- [ ] Assista um vídeo parcialmente (ex: 30%)
- [ ] Recarregue a página
- [ ] Verifique se o vídeo retoma da posição correta
- [ ] Verifique se o progresso é mantido

### 7. Múltiplos Usuários

**Cenário:** Verificar isolamento de dados
- [ ] Faça login com usuário A e assista um vídeo
- [ ] Faça login com usuário B e verifique que não vê o progresso do usuário A
- [ ] Verifique se cada usuário tem seu próprio progresso

## Comandos SQL para Verificação

### Verificar progresso de vídeos:
```sql
SELECT 
  vp.*,
  v.titulo as video_titulo,
  u.nome as usuario_nome,
  c.nome as curso_nome
FROM video_progress vp
JOIN videos v ON vp.video_id = v.id
JOIN usuarios u ON vp.usuario_id = u.id
JOIN cursos c ON vp.curso_id = c.id
ORDER BY vp.data_criacao DESC;
```

### Verificar progresso de módulos:
```sql
SELECT 
  pu.*,
  u.nome as usuario_nome,
  c.nome as curso_nome,
  m.nome_modulo
FROM progresso_usuario pu
JOIN usuarios u ON pu.usuario_id = u.id
JOIN cursos c ON pu.curso_id = c.id
LEFT JOIN modulos m ON pu.modulo_id = m.id
ORDER BY pu.data_criacao DESC;
```

### Verificar vídeos por módulo:
```sql
SELECT 
  v.*,
  m.nome_modulo,
  c.nome as curso_nome
FROM videos v
JOIN modulos m ON v.modulo_id = m.id
JOIN cursos c ON v.curso_id = c.id
ORDER BY m.ordem, v.data_criacao;
```

## Problemas Comuns e Soluções

### 1. Vídeo não é marcado como concluído
- Verifique se o vídeo tem duração definida
- Verifique se o usuário assistiu pelo menos 90% do vídeo
- Verifique os logs do console para erros

### 2. Progresso não é salvo
- Verifique se o usuário está logado
- Verifique se as permissões RLS estão configuradas
- Verifique se o `curso_id` e `modulo_id` estão preenchidos

### 3. Interface não atualiza
- Verifique se o hook `useVideoProgress` está funcionando
- Verifique se o estado está sendo atualizado corretamente
- Verifique se não há erros de rede

### 4. Relatórios não mostram dados
- Verifique se a tabela `video_progress` foi criada
- Verifique se os joins estão funcionando
- Verifique se há dados na tabela

## Métricas de Sucesso

- [ ] Todos os vídeos são marcados como concluídos quando assistidos até 90%
- [ ] O progresso é salvo automaticamente a cada 5 segundos
- [ ] A interface mostra o status correto para cada vídeo
- [ ] Os relatórios incluem dados de progresso de vídeos
- [ ] O progresso é restaurado corretamente ao recarregar a página
- [ ] Cada usuário vê apenas seu próprio progresso
- [ ] O progresso do módulo é calculado corretamente baseado nos vídeos concluídos 