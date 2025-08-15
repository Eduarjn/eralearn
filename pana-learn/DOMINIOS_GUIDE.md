# 🏢 Guia de Domínios - ERA Learn

## 📋 Visão Geral

A funcionalidade de **Domínios** permite que administradores master (`admin_master`) gerenciem domínios de clientes na plataforma ERA Learn. Cada domínio representa um cliente ou empresa que utiliza a plataforma.

## 🔐 Permissões

- **Acesso**: Apenas usuários com `tipo_usuario = 'admin_master'`
- **Operações**: Criar, editar, excluir e visualizar domínios
- **Segurança**: Políticas RLS configuradas no Supabase

## 🚀 Como Usar

### 1. Configuração Inicial

#### 1.1 Executar Migration
```sql
-- Execute no Supabase SQL Editor:
-- Arquivo: supabase/migrations/20250622000000-create-domains-table.sql
```

#### 1.2 Criar Usuário Admin Master
```sql
-- Execute no Supabase SQL Editor:
INSERT INTO usuarios (id, email, nome, tipo_usuario, status, data_criacao, data_atualizacao)
VALUES (
  gen_random_uuid(),
  'admin_master@eralearn.com',
  'Administrador Master',
  'admin_master',
  'ativo',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
```

### 2. Acessando a Funcionalidade

1. **Faça login** com o usuário `admin_master`
2. **Navegue** para "Domínios" no menu lateral
3. **Visualize** a lista de domínios existentes

### 3. Criando um Novo Domínio

#### 3.1 Para um Novo Cliente
1. Clique em **"Novo Domínio"**
2. Preencha os campos:
   - **Nome do Domínio**: `cliente.com` (formato obrigatório)
   - **Descrição**: Descrição do cliente/empresa
3. Clique em **"Criar Domínio"**

#### 3.2 Validações
- ✅ Domínio deve ter formato válido (ex: `exemplo.com`)
- ✅ Domínio deve ser único
- ✅ Nome é obrigatório
- ✅ Descrição é opcional

### 4. Gerenciando Domínios

#### 4.1 Editar Domínio
1. Clique no ícone **"Editar"** (lápis) na linha do domínio
2. Modifique os campos desejados
3. Clique em **"Atualizar Domínio"**

#### 4.2 Excluir Domínio
1. Clique no ícone **"Excluir"** (lixeira) na linha do domínio
2. Confirme a exclusão
3. O domínio será removido permanentemente

#### 4.3 Atualizar Lista
- Clique em **"Atualizar"** para recarregar a lista
- A lista é atualizada automaticamente após operações

### 5. Seletor de Domínio

#### 5.1 No Header
- O seletor aparece no header para `admin_master`
- Permite escolher o domínio ativo
- Mostra todos os domínios disponíveis

#### 5.2 Contexto Global
- O domínio selecionado fica disponível globalmente
- Pode ser usado para filtrar dados por cliente
- Persiste durante a sessão

## 📊 Estrutura da Tabela

```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,           -- Nome do domínio (ex: cliente.com)
  description TEXT,                    -- Descrição opcional
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Políticas de Segurança (RLS)

### Leitura
- ✅ Todos os usuários autenticados podem **ler** domínios

### Escrita
- ✅ Apenas `admin_master` pode **criar** domínios
- ✅ Apenas `admin_master` pode **editar** domínios
- ✅ Apenas `admin_master` pode **excluir** domínios

## 🎯 Casos de Uso

### Cenário 1: Novo Cliente
```
1. Cliente "TechCorp" contrata ERA Learn
2. Admin Master cria domínio: techcorp.com
3. Descrição: "TechCorp - Empresa de Tecnologia"
4. Domínio fica disponível para configuração
```

### Cenário 2: Múltiplos Clientes
```
- cliente1.com → "Empresa A"
- cliente2.com → "Empresa B" 
- cliente3.com → "Empresa C"
```

### Cenário 3: Atualização de Cliente
```
1. Cliente muda de nome
2. Admin Master edita descrição
3. Atualiza informações do domínio
```

## 🛠️ Troubleshooting

### Problema: "Acesso Negado"
**Solução**: Verificar se o usuário tem `tipo_usuario = 'admin_master'`

### Problema: "Domínio já existe"
**Solução**: Usar um nome único para o domínio

### Problema: "Formato inválido"
**Solução**: Usar formato correto (ex: `exemplo.com`)

### Problema: Erro de RLS
**Solução**: Verificar se as políticas foram aplicadas corretamente

## 📝 Logs e Debug

O sistema inclui logs detalhados no console:
- ✅ Operações bem-sucedidas
- ❌ Erros e falhas
- 🔄 Status de carregamento
- 👤 Informações do usuário

## 🔄 Próximos Passos

1. **Integração com outras funcionalidades**
   - Filtrar cursos por domínio
   - Relatórios por cliente
   - Configurações específicas

2. **Melhorias futuras**
   - Subdomínios
   - Configurações avançadas
   - Integração com DNS

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: contato@eralearn.com
- Documentação: Este guia
- Logs: Console do navegador 