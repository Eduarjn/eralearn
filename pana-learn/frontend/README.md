# PANA Learn - Frontend

Este diretório contém a aplicação React/TypeScript da PANA Learn.

## Tecnologias

- **React 18** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilização
- **Shadcn/UI** para componentes
- **React Router** para navegação
- **TanStack Query** para gerenciamento de estado
- **Supabase** para backend

## Estrutura

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes do Shadcn/UI
│   ├── AuthForm.tsx    # Formulário de autenticação
│   ├── ERALayout.tsx   # Layout principal
│   └── ERASidebar.tsx  # Sidebar de navegação
├── hooks/              # Hooks customizados
│   └── useAuth.tsx     # Hook de autenticação
├── pages/              # Páginas da aplicação
├── integrations/       # Integrações externas
│   └── supabase/       # Cliente Supabase
└── lib/                # Utilitários
```

## Como executar

1. Navegue para o diretório frontend: `cd frontend`
2. Instale as dependências: `npm install`
3. Execute o servidor de desenvolvimento: `npm run dev`
4. Acesse http://localhost:8080

## Funcionalidades

### Autenticação
- Login/cadastro com email e senha
- Usuários de teste pré-configurados
- Proteção de rotas baseada em roles

### Interface
- Design responsivo
- Tema PANA com cores personalizadas
- Navegação intuitiva com sidebar
- Componentes acessíveis

### Páginas
- **Dashboard** - Visão geral do usuário
- **Treinamentos** - Catálogo de cursos
- **Certificados** - Certificados obtidos
- **Relatórios** - Analytics (admin only)
- **Usuários** - Gestão de usuários (admin only)
- **Configurações** - Configurações da conta

## Página do YouTube

A página do YouTube foi completamente redesenhada com as seguintes funcionalidades:

### 🎯 Funcionalidades Implementadas

#### 1. **Link Direto para o Canal**
- Exibe o link direto para o canal oficial da empresa: `youtube.com/@minhaeravideos`
- Link clicável que abre em nova aba

#### 2. **Botão de Redirecionamento**
- Botão destacado "Ir para o Canal" com ícone de play
- Redireciona diretamente para o canal do YouTube da empresa
- Design responsivo e animações suaves

#### 3. **Área de Vídeos Recomendados**
- Exibe miniaturas dos vídeos mais populares/importantes
- Layout em grid responsivo (1 coluna mobile, 2 colunas desktop)
- Efeitos hover com zoom e overlay de play
- Ao clicar na miniatura, redireciona para o vídeo específico
- Exibe data de publicação em formato brasileiro

#### 4. **Calendário de Próximos Eventos**
- Calendário interativo destacando futuras transmissões
- Lista de eventos agendados com:
  - Badges coloridos por tipo (AO VIVO, WEBINAR, EVENTO)
  - Data e horário formatados
  - Título do evento
- Botão "Adicionar lembrete" para cada evento
- Notificação toast elegante ao adicionar lembrete

### 🎨 Design e UX

#### Layout Limpo
- Removidas todas as instruções e explicações desnecessárias
- Foco total no conteúdo principal
- Design moderno e profissional

#### Responsividade
- Layout adaptativo para mobile e desktop
- Grid responsivo para vídeos
- Calendário otimizado para diferentes tamanhos de tela

#### Animações e Transições
- Efeitos hover suaves nos vídeos
- Animações de entrada/saída para notificações
- Transições CSS para melhor experiência do usuário

### 🔧 Tecnologias Utilizadas

- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Day Picker** para o calendário
- **Radix UI** para componentes base

### 📱 Como Usar

1. **Acessar o Canal**: Clique no link ou botão para ir diretamente ao canal
2. **Ver Vídeos**: Clique em qualquer miniatura para assistir o vídeo
3. **Acompanhar Eventos**: Use o calendário para ver eventos futuros
4. **Adicionar Lembretes**: Clique no ícone de sino para adicionar lembretes

### 🚀 Próximas Melhorias

- Integração real com API do YouTube
- Sistema de notificações push para eventos
- Filtros por categoria de vídeo
- Busca de vídeos específicos
- Integração com calendário do usuário

### 📝 Notas Técnicas

- Os vídeos atualmente são mockados para demonstração
- Em produção, integrar com YouTube Data API v3
- Sistema de lembretes pode ser expandido para integração com Google Calendar
- Notificações toast podem ser substituídas por um sistema mais robusto

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `