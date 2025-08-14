# ERA Learn - Plataforma de Aprendizado

Uma plataforma moderna de e-learning desenvolvida com React, TypeScript, Tailwind CSS e Supabase, focada em cursos de telecomunicações e sistemas PABX.

## 🚀 Características

- **Interface Moderna**: Design responsivo com Tailwind CSS e shadcn/ui
- **Sistema de Autenticação**: Integração completa com Supabase Auth
- **Gestão de Cursos**: Upload e gerenciamento de vídeos
- **Sistema de Quizzes**: Avaliações específicas por curso
- **Progresso do Usuário**: Acompanhamento de conclusão de vídeos
- **Certificados**: Geração automática de certificados
- **Multi-tenant**: Suporte a múltiplos domínios/clientes
- **Branding Personalizado**: Logos e cores customizáveis por cliente

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **React Router** para navegação
- **TanStack Query** para gerenciamento de estado

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security (RLS)** para segurança
- **Edge Functions** para lógica de negócio

### Ferramentas
- **Vite** para build e desenvolvimento
- **ESLint** para linting
- **TypeScript** para tipagem

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/eralearn.git
cd eralearn
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Configure o banco de dados**
- Execute os scripts SQL na ordem correta:
  - `organizar-quizzes-por-curso.sql`
  - `mapear-cursos-quizzes.sql`
  - `corrigir-quizzes-especificos.sql`

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse `http://localhost:8080` no seu navegador.

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- `cursos` - Informações dos cursos
- `videos` - Vídeos dos cursos
- `video_progress` - Progresso dos usuários
- `quizzes` - Avaliações
- `quiz_perguntas` - Perguntas dos quizzes
- `progresso_quiz` - Progresso nos quizzes
- `certificados` - Certificados gerados
- `usuarios` - Perfis dos usuários
- `domains` - Configurações por domínio

### Sistema de Quizzes Específicos
- `curso_quiz_mapping` - Mapeamento entre cursos e quizzes
- Quizzes específicos por curso:
  - `PABX_FUNDAMENTOS` - Fundamentos de PABX
  - `PABX_AVANCADO` - Configurações Avançadas PABX
  - `OMNICHANNEL_EMPRESAS` - OMNICHANNEL para Empresas
  - `OMNICHANNEL_AVANCADO` - Configurações Avançadas OMNI
  - `CALLCENTER_FUNDAMENTOS` - Fundamentos CALLCENTER

## 🎯 Funcionalidades

### Para Administradores
- Gestão completa de cursos e vídeos
- Upload de vídeos com progresso
- Configuração de quizzes específicos
- Gestão de usuários e domínios
- Personalização de branding
- Relatórios de progresso

### Para Usuários
- Navegação intuitiva por cursos
- Player de vídeo com progresso
- Quizzes específicos por curso
- Certificados de conclusão
- Perfil personalizado

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Linting
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas de linting

# TypeScript
npm run type-check   # Verifica tipos TypeScript
```

## 📁 Estrutura do Projeto

```
eralearn/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── hooks/         # Custom hooks
│   ├── context/       # Context providers
│   ├── integrations/  # Integrações externas
│   ├── lib/           # Utilitários e configurações
│   └── types/         # Definições de tipos
├── supabase/          # Configurações do Supabase
├── public/            # Arquivos estáticos
└── docs/              # Documentação
```

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Autenticação** via Supabase Auth
- **Autorização** baseada em roles e domínios
- **Validação** de dados com Zod
- **Sanitização** de inputs

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- **Netlify**: Configure build command e output directory
- **Railway**: Deploy direto do repositório
- **Heroku**: Configure buildpacks para Node.js

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [issue](https://github.com/seu-usuario/eralearn/issues)
- Entre em contato: [seu-email@exemplo.com]

## 🎉 Agradecimentos

- [Supabase](https://supabase.com) pela infraestrutura
- [shadcn/ui](https://ui.shadcn.com) pelos componentes
- [Tailwind CSS](https://tailwindcss.com) pelo framework CSS
- [Vite](https://vitejs.dev) pela ferramenta de build

---

**ERA Learn** - Transformando o aprendizado em telecomunicações 🚀
