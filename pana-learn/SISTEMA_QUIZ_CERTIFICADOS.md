# Sistema de Quiz e Certificados - ERA Learn

## 📋 Visão Geral

Este sistema implementa um fluxo completo de conclusão de curso e certificação, incluindo:

1. **Quiz de Conclusão**: Exibido automaticamente quando o usuário finaliza o último vídeo de uma categoria
2. **Modal de Conclusão**: Popup comemorativo após aprovação no quiz
3. **Geração de Certificado**: Certificado digital com QR code para validação
4. **Compartilhamento**: Integração com LinkedIn e Facebook
5. **Configuração de Quiz**: Interface administrativa para configurar perguntas

## 🚀 Funcionalidades Implementadas

### 1. **Quiz de Conclusão**
- **Detecção Automática**: Quando o usuário finaliza o último vídeo de uma categoria
- **Perguntas Configuráveis**: Múltipla escolha e verdadeiro/falso
- **Validação de Nota**: Nota mínima configurável por categoria
- **Feedback Personalizado**: Mensagens de sucesso e reprovação customizáveis
- **Navegação Intuitiva**: Interface com progresso e resumo das respostas

### 2. **Modal de Conclusão**
- **Mensagem Comemorativa**: Parabéns personalizados com nome da categoria
- **Botões de Ação**: 
  - Ver Certificado (abre em nova aba)
  - Compartilhar (menu dropdown com LinkedIn/Facebook)
  - Baixar PDF
- **Informações do Certificado**: Detalhes sobre validade e recursos

### 3. **Página de Certificado**
- **Template Estilizado**: Design profissional com gradientes e bordas
- **Informações Completas**:
  - Nome do usuário e email
  - Nome da categoria e nota obtida
  - Data de conclusão
  - QR code para validação
  - Número único do certificado
- **Botões de Compartilhamento**: LinkedIn, Facebook e copiar link
- **Download PDF**: Geração automática do certificado

### 4. **Configuração de Quiz (Admin)**
- **Seleção de Categoria**: Dropdown com todas as categorias disponíveis
- **Configurações Gerais**:
  - Nota mínima de aprovação (0-100%)
  - Mensagem de sucesso personalizada
  - Mensagem de reprovação personalizada
- **Gerenciamento de Perguntas**:
  - Adicionar/remover perguntas
  - Tipos: múltipla escolha e verdadeiro/falso
  - Alternativas configuráveis
  - Resposta correta
  - Explicação opcional
- **Validação Completa**: Verificação de todos os campos antes de salvar

## 🛠️ Componentes Criados

### 1. **QuizModal.tsx**
```typescript
interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (nota: number) => void;
  onFail: () => void;
  quizConfig: QuizConfig | null;
  categoriaNome: string;
}
```

**Funcionalidades:**
- Interface de quiz responsiva
- Navegação entre perguntas
- Validação de respostas
- Cálculo automático de nota
- Feedback visual de progresso

### 2. **CourseCompletionModal.tsx**
```typescript
interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCertificate: () => void;
  categoriaNome: string;
  nota: number;
  certificadoUrl?: string;
}
```

**Funcionalidades:**
- Modal comemorativo em tela cheia
- Botões de compartilhamento social
- Download de certificado
- Informações sobre o certificado

### 3. **Certificado.tsx**
```typescript
interface CertificateData {
  id: string;
  usuario_id: string;
  categoria_nome: string;
  nota: number;
  data_conclusao: string;
  certificado_url?: string;
  qr_code_url?: string;
}
```

**Funcionalidades:**
- Template de certificado estilizado
- Informações completas do usuário
- QR code para validação
- Compartilhamento social
- Download em PDF

### 4. **QuizConfig.tsx**
```typescript
interface QuizConfig {
  id?: string;
  categoria_id: string;
  nota_minima: number;
  perguntas: QuizQuestion[];
  mensagem_sucesso: string;
  mensagem_reprova: string;
}
```

**Funcionalidades:**
- Interface administrativa completa
- Gerenciamento de perguntas
- Validação de formulário
- Persistência no banco de dados

### 5. **useQuiz.ts**
```typescript
export function useQuiz(userId: string | undefined, categoriaId: string | undefined) {
  // Retorna: quizConfig, loading, error, isCourseCompleted, certificate, generateCertificate
}
```

**Funcionalidades:**
- Carregamento de configurações de quiz
- Verificação de conclusão de curso
- Geração de certificados
- Gerenciamento de estado

## 🗄️ Estrutura do Banco de Dados

### Tabela: `quiz_config`
```sql
CREATE TABLE quiz_config (
  id UUID PRIMARY KEY,
  categoria_id UUID REFERENCES categorias(id),
  nota_minima INTEGER DEFAULT 70,
  perguntas JSONB DEFAULT '[]',
  mensagem_sucesso TEXT,
  mensagem_reprova TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(categoria_id)
);
```

### Tabela: `certificados`
```sql
CREATE TABLE certificados (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  categoria_id UUID REFERENCES categorias(id),
  categoria_nome TEXT,
  nota INTEGER,
  data_conclusao TIMESTAMP,
  certificado_url TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(usuario_id, categoria_id)
);
```

## 🔄 Fluxo de Funcionamento

### 1. **Detecção de Conclusão**
```typescript
// Em VideoPlayerWithProgress.tsx
const handleVideoCompletion = async () => {
  await markAsCompleted();
  // Notifica que o vídeo foi concluído
  if (onProgressChange) {
    onProgressChange(100);
  }
};
```

### 2. **Verificação de Quiz**
```typescript
// Em CursoDetalhe.tsx
React.useEffect(() => {
  if (isCourseCompleted && !certificate && quizConfig) {
    setShowQuizModal(true);
  }
}, [isCourseCompleted, certificate, quizConfig]);
```

### 3. **Processamento do Quiz**
```typescript
const handleQuizSuccess = async (nota: number) => {
  setQuizNota(nota);
  setShowQuizModal(false);
  
  // Gerar certificado
  await generateCertificate(nota);
  setShowCompletionModal(true);
};
```

### 4. **Geração de Certificado**
```typescript
const generateCertificate = async (nota: number) => {
  const certificateData = {
    usuario_id: userId,
    categoria_id: categoriaId,
    categoria_nome: categoria.nome,
    nota: nota,
    data_conclusao: new Date().toISOString()
  };
  
  const { data } = await supabase
    .from('certificados')
    .insert(certificateData)
    .select()
    .single();
    
  return data;
};
```

## 🎨 Estilização e UX

### **Design System**
- **Cores**: Usa o sistema de cores ERA (era-lime, era-dark-blue)
- **Componentes**: Baseado em shadcn/ui
- **Responsividade**: Funciona em desktop e mobile
- **Acessibilidade**: Labels, aria-labels e navegação por teclado

### **Animações e Transições**
- **Modais**: Fade in/out suaves
- **Botões**: Hover effects e loading states
- **Progresso**: Animações de barra de progresso
- **Feedback**: Toasts para ações importantes

## 🔒 Segurança e Validação

### **Row Level Security (RLS)**
```sql
-- Quiz config: apenas admins
CREATE POLICY "Admins can manage quiz config" ON quiz_config
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM usuarios WHERE tipo_usuario = 'admin'
  ));

-- Certificados: usuários veem apenas os próprios
CREATE POLICY "Users can view their own certificates" ON certificados
  FOR SELECT USING (usuario_id = auth.uid());
```

### **Validação de Dados**
- **Nota mínima**: 0-100%
- **Perguntas obrigatórias**: Mínimo 1 pergunta
- **Alternativas**: Mínimo 2 alternativas por pergunta
- **Resposta correta**: Deve ser válida

## 📱 Compatibilidade Mobile

### **Responsividade**
- **Grid adaptativo**: 1 coluna em mobile, 2+ em desktop
- **Touch-friendly**: Botões grandes e espaçados
- **Scroll otimizado**: Modais com scroll interno
- **Fontes legíveis**: Tamanhos adequados para mobile

### **Funcionalidades Mobile**
- **Compartilhamento nativo**: Usa APIs do navegador
- **Download**: Funciona em dispositivos móveis
- **QR Code**: Legível em telas pequenas

## 🚀 Como Usar

### **Para Administradores**

1. **Configurar Quiz**:
   - Acesse Configurações > Quiz de Conclusão
   - Selecione a categoria
   - Configure nota mínima e mensagens
   - Adicione perguntas e alternativas
   - Salve a configuração

2. **Monitorar Certificados**:
   - Acesse Configurações > Certificado no menu
   - Veja todos os certificados emitidos
   - Valide certificados via QR code

### **Para Usuários**

1. **Concluir Curso**:
   - Assista todos os vídeos da categoria
   - O quiz aparecerá automaticamente
   - Responda todas as perguntas
   - Atinga a nota mínima

2. **Obter Certificado**:
   - Após aprovação, o modal de conclusão aparecerá
   - Clique em "Ver Certificado"
   - Baixe ou compartilhe o certificado

## 🔧 Configuração

### **1. Executar Migração**
```bash
# No Supabase Dashboard ou CLI
supabase db push
```

### **2. Configurar Categorias**
```sql
-- Inserir categorias se necessário
INSERT INTO categorias (nome, descricao, cor) VALUES 
('PABX', 'Sistemas PABX', '#3B82F6'),
('CALLCENTER', 'Sistemas de Call Center', '#6366F1'),
('Omnichannel', 'Plataformas Omnichannel', '#8B5CF6');
```

### **3. Configurar Quiz**
- Acesse a interface administrativa
- Configure quiz para cada categoria
- Teste o fluxo completo

## 🐛 Troubleshooting

### **Quiz não aparece**
- Verifique se a categoria tem quiz configurado
- Confirme se todos os vídeos foram concluídos
- Verifique logs do console

### **Certificado não gera**
- Verifique permissões de RLS
- Confirme se o usuário tem acesso
- Verifique logs de erro

### **Erro de validação**
- Confirme se todas as perguntas têm alternativas
- Verifique se a resposta correta é válida
- Teste com dados mínimos

## 📈 Próximos Passos

### **Melhorias Futuras**
1. **Templates de Certificado**: Múltiplos designs
2. **Assinatura Digital**: Integração com certificados digitais
3. **Analytics**: Relatórios de conclusão e performance
4. **Notificações**: Email/SMS de certificado
5. **API Externa**: Endpoint para validação de certificados

### **Integrações**
1. **LinkedIn Learning**: Sincronização de certificados
2. **Google Workspace**: Integração com Google Drive
3. **Microsoft Teams**: Notificações automáticas
4. **Slack**: Webhooks de conclusão

---

**Desenvolvido para ERA Learn**  
*Sistema completo de gamificação e certificação* 