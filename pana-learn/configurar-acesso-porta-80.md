# 🌐 Configurar Acesso por IP sem Porta (Porta 80) - Guia Específico

Para acessar apenas por `http://138.59.144.162` (sem :8080), você precisa alterar a porta padrão para **80**.

## 📁 **Arquivos e Linhas Específicas para Alterar:**

### 1. **vite.config.ts** - Linha 10
**Arquivo:** `pana-learn/vite.config.ts`
**Linha:** 10

**Alterar de:**
```typescript
port: 8080,
```

**Para:**
```typescript
port: 80,
```

### 2. **nginx.conf** - Linha 24
**Arquivo:** `pana-learn/nginx.conf`
**Linha:** 24

**Já está correto:**
```nginx
listen 80;
```
*(Esta linha já está na porta 80, não precisa alterar)*

### 3. **backend/supabase/config.toml** - Linhas 73 e 75
**Arquivo:** `pana-learn/backend/supabase/config.toml`

**Linha 73 - Alterar de:**
```toml
site_url = "http://127.0.0.1:5173"
```

**Para:**
```toml
site_url = "http://138.59.144.162"
```

**Linha 75 - Alterar de:**
```toml
additional_redirect_urls = ["http://127.0.0.1:5173", "http://localhost:5173"]
```

**Para:**
```toml
additional_redirect_urls = ["http://127.0.0.1", "http://localhost", "http://138.59.144.162", "https://eralearn.sobreip.com.br", "http://eralearn.sobreip.com.br"]
```

### 4. **.env.local** - Linhas 2 e 3
**Arquivo:** `pana-learn/.env.local`

**Alterar de:**
```env
VITE_APP_URL=http://138.59.144.162:8080
VITE_API_URL=http://138.59.144.162:8080
```

**Para:**
```env
VITE_APP_URL=http://138.59.144.162
VITE_API_URL=http://138.59.144.162
```

## ⚡ **Script de Alteração Rápida:**

```bash
#!/bin/bash
# alterar-para-porta-80.sh

echo "🔧 Configurando para porta 80 (sem :8080 na URL)..."

cd pana-learn

# 1. Alterar Vite para porta 80
sed -i 's/port: 8080,/port: 80,/' vite.config.ts
echo "✅ vite.config.ts - Linha 10 alterada para porta 80"

# 2. Alterar Supabase config
sed -i 's|site_url = "http://127.0.0.1:5173"|site_url = "http://138.59.144.162"|' backend/supabase/config.toml
sed -i 's|additional_redirect_urls = \["http://127.0.0.1:5173", "http://localhost:5173"\]|additional_redirect_urls = ["http://127.0.0.1", "http://localhost", "http://138.59.144.162", "https://eralearn.sobreip.com.br", "http://eralearn.sobreip.com.br"]|' backend/supabase/config.toml
echo "✅ config.toml - Linhas 73 e 75 alteradas"

# 3. Alterar .env.local
sed -i 's|VITE_APP_URL=http://138.59.144.162:8080|VITE_APP_URL=http://138.59.144.162|' .env.local
sed -i 's|VITE_API_URL=http://138.59.144.162:8080|VITE_API_URL=http://138.59.144.162|' .env.local
echo "✅ .env.local - Linhas 2 e 3 alteradas"

echo ""
echo "🎯 Configuração concluída!"
echo "🌐 Agora você pode acessar por: http://138.59.144.162"
echo ""
echo "⚠️ IMPORTANTE: Para rodar na porta 80, você precisa de privilégios de administrador:"
echo "sudo npm run dev"
```

## 🚨 **IMPORTANTE - Privilégios de Administrador:**

Para rodar na **porta 80**, você precisa executar com privilégios de administrador:

### No Linux/Mac:
```bash
sudo npm run dev
```

### No Windows (PowerShell como Administrador):
```powershell
npm run dev
```

## 📝 **Resumo das Alterações:**

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `vite.config.ts` | 10 | `port: 8080,` → `port: 80,` |
| `config.toml` | 73 | `site_url = "http://127.0.0.1:5173"` → `site_url = "http://138.59.144.162"` |
| `config.toml` | 75 | Adicionar URLs sem porta | 
| `.env.local` | 2-3 | Remover `:8080` das URLs |

## 🧪 **Teste Final:**

Após as alterações:
```bash
# Teste se está acessível
curl -I http://138.59.144.162
```

Agora você poderá acessar apenas com: **`http://138.59.144.162`** 🎉
