#!/bin/bash
# Script para configurar acesso por IP e DNS na plataforma ERA Learn

echo "🔧 Configurando acesso por IP e DNS..."
echo "📍 IP: 138.59.144.162"
echo "🌐 DNS: eralearn.sobreip.com.br"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "vite.config.ts" ]; then
    echo "❌ Erro: Execute este script no diretório pana-learn"
    exit 1
fi

# 1. Backup dos arquivos originais
echo "📁 Criando backups dos arquivos originais..."
cp vite.config.ts vite.config.ts.backup.$(date +%Y%m%d_%H%M%S)
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
if [ -f "backend/supabase/config.toml" ]; then
    cp backend/supabase/config.toml backend/supabase/config.toml.backup.$(date +%Y%m%d_%H%M%S)
fi

# 2. Configurar Vite para aceitar conexões externas
echo "⚙️ Configurando Vite..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Permitir acesso de qualquer IP
    port: 8080,
    cors: true, // Habilitar CORS
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'sonner',
      'next-themes',
      'react-beautiful-dnd',
      '@radix-ui/react-dropdown-menu'
    ],
    exclude: [
      'lovable-tagger'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          radix: ['@radix-ui/react-dropdown-menu']
        }
      }
    },
    assetsInlineLimit: 0,
    assetsDir: 'assets'
  },
  publicDir: 'public'
}));
EOF

# 3. Configurar Nginx para múltiplos hosts
echo "🌐 Configurando Nginx..."
sed -i.bak 's/server_name localhost;/server_name localhost 138.59.144.162 eralearn.sobreip.com.br *.sobreip.com.br;/' nginx.conf

# 4. Configurar Supabase (se o arquivo existir)
if [ -f "backend/supabase/config.toml" ]; then
    echo "🔐 Configurando Supabase..."
    sed -i.bak 's|site_url = "http://127.0.0.1:5173"|site_url = "http://138.59.144.162:8080"|' backend/supabase/config.toml
    sed -i.bak 's|additional_redirect_urls = \["http://127.0.0.1:5173", "http://localhost:5173"\]|additional_redirect_urls = ["http://127.0.0.1:5173", "http://localhost:5173", "http://138.59.144.162:8080", "https://eralearn.sobreip.com.br", "http://eralearn.sobreip.com.br"]|' backend/supabase/config.toml
fi

# 5. Criar arquivo de ambiente
echo "📝 Criando/atualizando .env.local..."
cat > .env.local << 'EOF'
# URLs permitidas para acesso externo
VITE_APP_URL=http://138.59.144.162:8080
VITE_API_URL=http://138.59.144.162:8080

# Configurações do Supabase (substitua pela sua chave real)
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Configurações de upload de vídeo
VITE_VIDEO_UPLOAD_TARGET=supabase
STORAGE_PROVIDER=supabase
VITE_VIDEO_MAX_UPLOAD_MB=1024

# Outras configurações
NODE_ENV=development
VITE_DEBUG_MODE=true
EOF

# 6. Criar script de teste de conectividade
echo "🧪 Criando script de teste..."
cat > testar-conectividade.sh << 'EOF'
#!/bin/bash
echo "🧪 Testando conectividade..."
echo ""

echo "📍 Testando acesso por IP:"
curl -I http://138.59.144.162:8080 2>/dev/null && echo "✅ IP acessível" || echo "❌ IP não acessível"

echo ""
echo "🌐 Testando acesso por DNS:"
curl -I http://eralearn.sobreip.com.br 2>/dev/null && echo "✅ DNS acessível" || echo "❌ DNS não acessível"

echo ""
echo "🔍 Verificando se o servidor está rodando na porta 8080:"
netstat -tuln | grep :8080 && echo "✅ Servidor rodando na porta 8080" || echo "❌ Servidor não está rodando na porta 8080"
EOF

chmod +x testar-conectividade.sh

echo ""
echo "✅ Configurações aplicadas com sucesso!"
echo ""
echo "📋 Resumo das alterações:"
echo "1. ✅ vite.config.ts - Configurado para aceitar conexões externas"
echo "2. ✅ nginx.conf - Configurado para múltiplos hosts"
echo "3. ✅ config.toml - URLs de redirecionamento atualizadas"
echo "4. ✅ .env.local - Variáveis de ambiente criadas"
echo ""
echo "🔄 Para aplicar as mudanças:"
echo "1. Reinicie o servidor: npm run dev"
echo "2. Se usando Nginx: sudo systemctl restart nginx"
echo "3. Atualize a chave do Supabase no .env.local"
echo ""
echo "🧪 Para testar a conectividade:"
echo "./testar-conectividade.sh"
echo ""
echo "🌐 Agora você pode acessar por:"
echo "- IP: http://138.59.144.162:8080"
echo "- DNS: http://eralearn.sobreip.com.br"
