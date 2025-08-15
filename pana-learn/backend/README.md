
# PANA Learn - Backend

Este diretório contém toda a configuração do backend da aplicação PANA Learn, incluindo:

## Estrutura

- `supabase/` - Configurações do Supabase
  - `config.toml` - Configuração principal do Supabase
  - `migrations/` - Migrações SQL do banco de dados
  - `functions/` - Edge Functions (se necessário)

## Configuração do Banco de Dados

O backend utiliza Supabase como BaaS (Backend as a Service) com PostgreSQL.

### Tabelas Principais:
- `usuarios` - Gerenciamento de usuários
- `cursos` - Catálogo de cursos
- `modulos` - Módulos dos cursos
- `videos` - Biblioteca de vídeos
- `progresso_usuario` - Acompanhamento do progresso
- `certificados` - Certificados emitidos
- `avaliacoes` - Avaliações dos cursos

### Funcionalidades:
- Autenticação e autorização via Supabase Auth
- Row Level Security (RLS) para segurança dos dados
- Triggers para atualização automática de timestamps
- Tipos personalizados (ENUMs) para status e tipos de usuário

## Como executar localmente

1. Instale o Supabase CLI
2. Execute `supabase start` no diretório raiz
3. As migrações serão aplicadas automaticamente
4. O banco estará disponível em localhost:54322

## Autenticação

A aplicação suporta:
- Login com email/senha
- Usuários de teste pré-configurados
- Diferentes níveis de acesso (admin/cliente)

## Desenvolvimento

Para adicionar novas funcionalidades:
1. Crie migrações SQL em `supabase/migrations/`
2. Atualize os tipos TypeScript conforme necessário
3. Implemente as políticas RLS apropriadas
