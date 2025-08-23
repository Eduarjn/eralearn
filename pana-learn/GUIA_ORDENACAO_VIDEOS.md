# 🎯 **Sistema de Ordenação de Vídeos - Guia Completo**

## **📋 Visão Geral**

Este guia descreve como implementar um sistema completo para ajustar a ordem dos vídeos em cursos. O sistema permite reordenar vídeos através de uma interface drag & drop intuitiva.

## **🔧 Implementação**

### **1. Banco de Dados**

#### **Passo 1: Executar Script SQL**
```sql
-- Execute o arquivo: add-video-order-system.sql
-- Este script adiciona:
-- - Coluna 'ordem' na tabela videos
-- - Índice para performance
-- - Função para reordenar vídeos
-- - Função para obter próxima ordem
```

#### **Passo 2: Verificar Estrutura**
```sql
-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'videos' 
AND column_name = 'ordem';
```

### **2. Frontend**

#### **Passo 1: Instalar Dependências**
```bash
npm install react-beautiful-dnd
npm install @types/react-beautiful-dnd --save-dev
```

#### **Passo 2: Usar o Componente VideoOrderManager**

```tsx
import { VideoOrderManager } from '@/components/VideoOrderManager';

// No seu componente de administração
<VideoOrderManager 
  cursoId="curso-id-aqui"
  onOrderChange={() => {
    // Recarregar dados se necessário
    console.log('Ordem alterada!');
  }}
/>
```

#### **Passo 3: Atualizar Consultas Existentes**

**Antes:**
```typescript
const { data: videosData } = await supabase
  .from('videos')
  .select('*')
  .eq('curso_id', id)
  .order('data_criacao', { ascending: false });
```

**Depois:**
```typescript
const { data: videosData } = await supabase
  .from('videos')
  .select('*')
  .eq('curso_id', id)
  .order('ordem', { ascending: true });
```

## **🎨 Interface do Usuário**

### **Funcionalidades do VideoOrderManager:**

1. **📋 Lista de Vídeos**
   - Exibe todos os vídeos do curso
   - Mostra título, duração e ordem atual
   - Interface drag & drop intuitiva

2. **🔄 Drag & Drop**
   - Arrastar vídeos para reordenar
   - Feedback visual durante o arrasto
   - Validação de mudanças

3. **💾 Controles**
   - **Salvar Ordem**: Aplica mudanças no banco
   - **Resetar**: Volta para ordem por data de criação
   - **Indicador de Mudanças**: Mostra quando há alterações não salvas

4. **📊 Feedback**
   - Loading states
   - Mensagens de sucesso/erro
   - Confirmação visual de mudanças

## **🔍 Arquivos que Precisam ser Atualizados**

### **1. VideoChecklist.tsx**
```typescript
// Linha ~40: Alterar ordenação
.order('ordem', { ascending: true })
```

### **2. CursoDetalhe.tsx**
```typescript
// Linha ~120: Alterar ordenação
.order('ordem', { ascending: true })
```

### **3. ClienteCursoDetalhe.tsx**
```typescript
// Adicionar ordenação
.order('ordem', { ascending: true })
```

### **4. VideoUpload.tsx**
```typescript
// Ao inserir novo vídeo, usar função para obter próxima ordem
const { data: nextOrder } = await supabase.rpc('obter_proxima_ordem_video', {
  p_curso_id: selectedCourseId
});

// Inserir com ordem
const { data: video } = await supabase
  .from('videos')
  .insert({
    ...videoData,
    curso_id: selectedCourseId,
    ordem: nextOrder
  });
```

## **🚀 Como Usar**

### **Para Administradores:**

1. **Acessar Gerenciamento de Curso**
   - Ir para a página de administração do curso
   - Encontrar seção "Gerenciar Ordem dos Vídeos"

2. **Reordenar Vídeos**
   - Arrastar vídeos para posições desejadas
   - Ver preview das mudanças em tempo real
   - Clicar em "Salvar Ordem" para aplicar

3. **Resetar Ordem**
   - Clicar em "Resetar" para voltar à ordem por data de criação

### **Para Usuários Finais:**

- **Ordem Automática**: Vídeos aparecem na ordem definida pelos administradores
- **Navegação Sequencial**: Próximo vídeo baseado na ordem configurada
- **Progresso Mantido**: Sistema de progresso funciona normalmente

## **🔧 Configurações Avançadas**

### **1. Ordenação por Módulos**
```sql
-- Se quiser ordenar por módulo + ordem
ORDER BY v.modulo_id, v.ordem
```

### **2. Ordenação Mista**
```sql
-- Ordem personalizada, depois por data
ORDER BY v.ordem, v.data_criacao
```

### **3. Validação de Ordem**
```sql
-- Verificar se há gaps na ordem
SELECT 
  ordem,
  LAG(ordem) OVER (ORDER BY ordem) as ordem_anterior,
  ordem - LAG(ordem) OVER (ORDER BY ordem) as gap
FROM videos 
WHERE curso_id = 'curso-id'
ORDER BY ordem;
```

## **📊 Benefícios**

### **✅ Para Administradores:**
- **Controle Total**: Definir sequência ideal de aprendizado
- **Flexibilidade**: Reordenar sem reimportar vídeos
- **Interface Intuitiva**: Drag & drop fácil de usar
- **Histórico**: Manter ordem por data como fallback

### **✅ Para Usuários:**
- **Experiência Consistente**: Ordem lógica de aprendizado
- **Navegação Clara**: Próximo vídeo sempre faz sentido
- **Progresso Confiável**: Sistema mantém estado corretamente

### **✅ Para o Sistema:**
- **Performance**: Índices otimizados para ordenação
- **Escalabilidade**: Funciona com qualquer número de vídeos
- **Manutenibilidade**: Código limpo e bem estruturado

## **🛠️ Troubleshooting**

### **Problema: Vídeos não aparecem na ordem correta**
**Solução:**
```sql
-- Verificar se todos os vídeos têm ordem
SELECT COUNT(*) FROM videos WHERE ordem = 0 OR ordem IS NULL;

-- Atualizar vídeos sem ordem
UPDATE videos 
SET ordem = EXTRACT(EPOCH FROM (data_criacao - '2024-01-01'::timestamp))::integer
WHERE ordem = 0 OR ordem IS NULL;
```

### **Problema: Erro ao salvar ordem**
**Solução:**
```sql
-- Verificar se a função existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'reordenar_videos_curso';

-- Recriar função se necessário
-- Executar novamente o script add-video-order-system.sql
```

### **Problema: Interface não responde ao drag & drop**
**Solução:**
- Verificar se `react-beautiful-dnd` está instalado
- Verificar se o componente está dentro de um `DragDropContext`
- Verificar console para erros JavaScript

## **📈 Próximos Passos**

1. **Implementar no Frontend**: Adicionar componente nas páginas de administração
2. **Testar Funcionalidade**: Verificar drag & drop e salvamento
3. **Atualizar Consultas**: Modificar todas as queries de vídeos
4. **Documentar**: Atualizar documentação da API
5. **Treinar Usuários**: Mostrar como usar a nova funcionalidade

---

**🎯 Resultado Final:** Sistema completo de ordenação de vídeos com interface intuitiva e controle total sobre a sequência de aprendizado!
