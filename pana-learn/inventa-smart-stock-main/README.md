
# ERA Learn - Plataforma de Treinamento Corporativo

Uma plataforma moderna de treinamento corporativo para PABX e Omnichannel, desenvolvida com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- **Autenticação de Usuários**: Sistema completo de login/registro com Supabase Auth
- **Gerenciamento de Cursos**: Criação e organização de cursos por categoria
- **Módulos de Treinamento**: Vídeos organizados por módulos com controle de progresso
- **Certificados**: Emissão automática de certificados após conclusão
- **Relatórios**: Dashboard com métricas de progresso e desempenho
- **Controle de Acesso**: Permissões diferenciadas para clientes e administradores
- **Design Responsivo**: Interface otimizada para desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (Database, Auth, Real-time)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd era-learn
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute as migrations SQL localizadas em `supabase/migrations/`
3. Configure as URLs de redirecionamento em Authentication > URL Configuration:
   - Site URL: `https://eralearn.sobreip.com.br` (ou sua URL de produção)
   - Redirect URLs: Adicione suas URLs de desenvolvimento e produção

### 4. Configuração das Variáveis de Ambiente

O projeto já está configurado com as credenciais do Supabase. Se precisar alterar:

- Edite `src/integrations/supabase/client.ts`
- Atualize `supabase/config.toml` com seu project_id

### 5. Execute o projeto
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais:

- **usuarios**: Perfis de usuário com tipos (cliente/admin)
- **cursos**: Catálogo de cursos disponíveis
- **modulos**: Módulos/aulas de cada curso
- **progresso_usuario**: Acompanhamento do progresso individual
- **certificados**: Certificados emitidos
- **avaliacoes**: Feedback dos usuários

### Permissões (RLS):

- Usuários só podem acessar seus próprios dados
- Administradores têm acesso completo
- Cursos ativos são públicos para usuários autenticados

## 🚀 Deploy em Produção

### Preparação para Deploy:

1. **Build do projeto**:
```bash
npm run build
```

2. **Configuração do servidor**:
   - Aponte o DNS `eralearn.sobreip.com.br` para o IP `189.113.47.200`
   - Configure servidor web (Nginx/Apache) para servir arquivos estáticos
   - Configure HTTPS com SSL/TLS

3. **Configuração do Supabase**:
   - Atualize Site URL para `https://eralearn.sobreip.com.br`
   - Adicione URL de redirecionamento
   - Configure políticas de CORS se necessário

### Estrutura de Deploy:

```
/var/www/eralearn/
├── dist/           # Arquivos buildados
├── .htaccess       # Configuração Apache (se aplicável)
└── nginx.conf      # Configuração Nginx (se aplicável)
```

## 👥 Tipos de Usuário

### Cliente:
- Acesso aos cursos disponíveis
- Visualização do próprio progresso
- Download de certificados próprios
- Avaliação de cursos

### Administrador:
- Todas as funcionalidades do cliente
- Gerenciamento de usuários
- Criação/edição de cursos
- Relatórios gerais
- Visualização de todas as métricas

## 🎨 Design System

### Cores principais:
- **Era Lime**: `#A3E635` - Cor primária da marca
- **Era Dark Blue**: `#1E293B` - Cor secundária
- **Era Gray**: `#64748B` - Texto secundário

### Componentes:
- Glassmorphism cards para modais
- Gradientes suaves para backgrounds
- Sistema de cores consistente
- Tipografia otimizada para legibilidade

## 📱 Responsividade

- Design mobile-first
- Breakpoints otimizados
- Sidebar colapsível em mobile
- Navegação touch-friendly

## 🔐 Segurança

- Row Level Security (RLS) habilitado
- Autenticação JWT via Supabase
- Validação de dados no frontend e backend
- Políticas de acesso granulares

## 📊 Monitoramento

- Console logs para debugging
- Error boundaries para captura de erros
- Métricas de performance via React Query
- Logs de autenticação via Supabase

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@eralearn.com.br
- Documentação: [Docs do projeto]
- Issues: [GitHub Issues]

---

**ERA Learn** - Transformando o treinamento corporativo através da tecnologia.
