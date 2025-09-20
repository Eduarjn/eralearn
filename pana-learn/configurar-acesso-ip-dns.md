# 🌐 Configurar Acesso por IP e DNS - Guia Completo

Este guia mostra exatamente quais arquivos alterar para permitir acesso tanto por **IP** quanto por **DNS** na plataforma ERA Learn.

## 📋 **Arquivos que Precisam ser Alterados:**

### 1. **vite.config.ts** (Servidor de Desenvolvimento)
**Localização:** `pana-learn/vite.config.ts`

**Alterar de:**
```typescript
server: {
  host: "::",
  port: 8080,
},
```

**Para:**
```typescript
server: {
  host: "0.0.0.0", // Permitir acesso de qualquer IP
  port: 8080,
  cors: true, // Habilitar CORS
},
```

### 2. **nginx.conf** (Servidor Web)
**Localização:** `pana-learn/nginx.conf`

**Alterar de:**
```nginx
server {
    listen 80;
    server_name localhost;
```

**Para:**
```nginx
server {
    listen 80;
    server_name localhost 138.59.144.162 eralearn.sobreip.com.br *.sobreip.com.br;
```

### 3. **Supabase config.toml** (Autenticação)
**Localização:** `pana-learn/backend/supabase/config.toml`

**Alterar de:**
```toml
site_url = "http://127.0.0.1:5173"
additional_redirect_urls = ["http://127.0.0.1:5173", "http://localhost:5173"]
```

**Para:**
```toml
site_url = "http://138.59.144.162:8080"
additional_redirect_urls = [
  "http://127.0.0.1:5173", 
  "http://localhost:5173",
  "http://138.59.144.162:8080",
  "https://eralearn.sobreip.com.br",
  "http://eralearn.sobreip.com.br"
]
```

### 4. **Arquivo .env.local** (Variáveis de Ambiente)
**Criar/Alterar:** `pana-learn/.env.local`

```env
# URLs permitidas
VITE_APP_URL=http://138.59.144.162:8080
VITE_API_URL=http://138.59.144.162:8080

# Supabase (manter suas credenciais existentes)
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui

# Configurações de upload
VITE_VIDEO_UPLOAD_TARGET=supabase
STORAGE_PROVIDER=supabase
```

## 🔧 **Scripts de Configuração Automática:**

### Script 1: Configurar Vite
```bash
# configurar-vite.sh
#!/bin/bash
cd pana-learn
cp vite.config.ts vite.config.ts.backup

cat > vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Permitir acesso de qualquer IP
    port: 8080,
    cors: true, // Habilitar CORS
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
EOF

echo "✅ Vite configurado para aceitar conexões de qualquer IP"
```

### Script 2: Configurar Nginx
```bash
# configurar-nginx.sh
#!/bin/bash
cd pana-learn
cp nginx.conf nginx.conf.backup

# Substituir server_name
sed -i 's/server_name localhost;/server_name localhost 138.59.144.162 eralearn.sobreip.com.br *.sobreip.com.br;/' nginx.conf

echo "✅ Nginx configurado para múltiplos hosts"
```

## 🚀 **Aplicar Todas as Configurações:**

### Script Completo de Configuração
```bash
#!/bin/bash
# aplicar-configuracoes-acesso.sh

echo "🔧 Configurando acesso por IP e DNS..."

cd pana-learn

# 1. Backup dos arquivos originais
echo "📁 Criando backups..."
cp vite.config.ts vite.config.ts.backup
cp nginx.conf nginx.conf.backup
cp backend/supabase/config.toml backend/supabase/config.toml.backup

# 2. Configurar Vite
echo "⚙️ Configurando Vite..."
sed -i 's/host: "::",/host: "0.0.0.0",/' vite.config.ts
sed -i '/port: 8080,/a\    cors: true,' vite.config.ts

# 3. Configurar Nginx
echo "🌐 Configurando Nginx..."
sed -i 's/server_name localhost;/server_name localhost 138.59.144.162 eralearn.sobreip.com.br *.sobreip.com.br;/' nginx.conf

# 4. Configurar Supabase
echo "🔐 Configurando Supabase..."
sed -i 's|site_url = "http://127.0.0.1:5173"|site_url = "http://138.59.144.162:8080"|' backend/supabase/config.toml
sed -i 's|additional_redirect_urls = \["http://127.0.0.1:5173", "http://localhost:5173"\]|additional_redirect_urls = ["http://127.0.0.1:5173", "http://localhost:5173", "http://138.59.144.162:8080", "https://eralearn.sobreip.com.br", "http://eralearn.sobreip.com.br"]|' backend/supabase/config.toml

# 5. Criar arquivo de ambiente
echo "📝 Criando .env.local..."
cat > .env.local << 'EOF'
# URLs permitidas
VITE_APP_URL=http://138.59.144.162:8080
VITE_API_URL=http://138.59.144.162:8080

# Supabase
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui

# Upload
VITE_VIDEO_UPLOAD_TARGET=supabase
STORAGE_PROVIDER=supabase
EOF

echo "✅ Configurações aplicadas com sucesso!"
echo ""
echo "🔄 Para aplicar as mudanças:"
echo "1. Reinicie o servidor de desenvolvimento: npm run dev"
echo "2. Reinicie o Nginx: sudo systemctl restart nginx"
echo "3. Atualize as configurações no Supabase Dashboard"
echo ""
echo "🌐 Agora você pode acessar por:"
echo "- IP: http://138.59.144.162:8080"
echo "- DNS: http://eralearn.sobreip.com.br"
```

## 📝 **Verificação Manual:**

### Teste de Conectividade
```bash
# Testar se o servidor está aceitando conexões externas
curl -I http://138.59.144.162:8080
curl -I http://eralearn.sobreip.com.br
```

### Logs para Debug
```bash
# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs do Vite (no terminal onde está rodando)
npm run dev
```

## 🎯 **Resumo dos Arquivos Alterados:**

1. ✅ **vite.config.ts** - Permitir conexões externas
2. ✅ **nginx.conf** - Aceitar múltiplos hosts
3. ✅ **backend/supabase/config.toml** - URLs de redirecionamento
4. ✅ **.env.local** - Variáveis de ambiente

## 🔒 **Configurações de Segurança Adicionais:**

Se quiser restringir apenas a IPs específicos, altere no **nginx.conf**:

```nginx
# Permitir apenas IPs específicos
allow 138.59.144.162;
allow 127.0.0.1;
deny all;
```

Agora sua plataforma estará acessível tanto pelo IP quanto pelo DNS! 🚀
