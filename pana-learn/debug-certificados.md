# 🔍 Debug da Página de Certificados

## Problemas Identificados:

### 1. **Possível problema de dados**
- Verificar se existem certificados no banco de dados
- Verificar se as relações entre tabelas estão corretas

### 2. **Possível problema de autenticação**
- Verificar se o userProfile está sendo carregado corretamente
- Verificar se o tipo de usuário está sendo detectado

### 3. **Possível problema de permissões**
- Verificar se as RLS (Row Level Security) estão configuradas corretamente
- Verificar se o usuário tem permissão para acessar a tabela certificados

## Passos para Debug:

### 1. **Verificar Console do Navegador**
```javascript
// Abrir DevTools (F12) e verificar:
// - Logs de carregamento de certificados
// - Erros de rede
// - Erros de JavaScript
```

### 2. **Verificar Banco de Dados**
```sql
-- Executar no Supabase SQL Editor:
SELECT COUNT(*) FROM certificados;
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM cursos;
```

### 3. **Verificar Autenticação**
```javascript
// No console do navegador:
console.log('UserProfile:', userProfile);
console.log('Tipo de usuário:', userProfile?.tipo_usuario);
```

### 4. **Testar Consulta Direta**
```sql
-- Testar consulta direta no Supabase:
SELECT 
  c.*,
  u.nome as usuario_nome,
  cur.nome as curso_nome
FROM certificados c
LEFT JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN cursos cur ON c.curso_id = cur.id
LIMIT 5;
```

## Soluções Possíveis:

### 1. **Se não há certificados:**
- Inserir certificados de teste usando o script `testar-certificados.sql`

### 2. **Se há problema de permissões:**
- Verificar RLS policies no Supabase
- Garantir que o usuário tem acesso à tabela certificados

### 3. **Se há problema de autenticação:**
- Verificar se o useAuth está funcionando corretamente
- Verificar se o userProfile está sendo carregado

### 4. **Se há problema de layout:**
- Verificar se todos os imports estão corretos
- Verificar se as classes CSS estão sendo aplicadas

## Comandos para Testar:

```bash
# 1. Verificar se o servidor está rodando
npm run dev

# 2. Verificar se não há erros de build
npm run build

# 3. Verificar se não há erros de lint
npm run lint
```

## Logs Esperados:

```
🔍 Iniciando carregamento de certificados...
👤 UserProfile: { id: "...", nome: "...", tipo_usuario: "..." }
👤 Tipo de usuário: admin É admin: true
🔍 Buscando TODOS os certificados (admin)...
✅ Certificados encontrados (admin): 3
📋 Dados dos certificados: [...]
🔍 Filtrando certificados...
📊 Certificados originais: 3
✅ Certificados filtrados: 3
```
