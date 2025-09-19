#!/bin/bash
# Script para configurar acesso por IP sem porta 8080 (usar porta 80 padrão)

echo "🔧 Configurando para acesso por IP sem porta (porta 80)..."
echo "🎯 Objetivo: http://138.59.144.162 (sem :8080)"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "vite.config.ts" ]; then
    echo "❌ Erro: Execute este script no diretório pana-learn"
    exit 1
fi

# Backup dos arquivos
echo "📁 Criando backups..."
cp vite.config.ts vite.config.ts.backup.porta80.$(date +%Y%m%d_%H%M%S)
if [ -f "backend/supabase/config.toml" ]; then
    cp backend/supabase/config.toml backend/supabase/config.toml.backup.porta80.$(date +%Y%m%d_%H%M%S)
fi
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.porta80.$(date +%Y%m%d_%H%M%S)
fi

echo ""
echo "🔧 Aplicando alterações..."

# 1. Alterar vite.config.ts - Linha 10
echo "⚙️ Alterando vite.config.ts (linha 10)..."
sed -i 's/port: 8080,/port: 80,/' vite.config.ts
if grep -q "port: 80," vite.config.ts; then
    echo "✅ vite.config.ts - Porta alterada para 80"
else
    echo "❌ Erro ao alterar vite.config.ts"
fi

# 2. Alterar Supabase config.toml - Linhas 73 e 75
if [ -f "backend/supabase/config.toml" ]; then
    echo "🔐 Alterando config.toml (linhas 73 e 75)..."
    
    # Linha 73
    sed -i 's|site_url = "http://127.0.0.1:5173"|site_url = "http://138.59.144.162"|' backend/supabase/config.toml
    sed -i 's|site_url = "http://127.0.0.1:8080"|site_url = "http://138.59.144.162"|' backend/supabase/config.toml
    
    # Linha 75
    sed -i 's|additional_redirect_urls = \["http://127.0.0.1:5173", "http://localhost:5173"\]|additional_redirect_urls = ["http://127.0.0.1", "http://localhost", "http://138.59.144.162", "https://eralearn.sobreip.com.br", "http://eralearn.sobreip.com.br"]|' backend/supabase/config.toml
    sed -i 's|additional_redirect_urls = \["http://127.0.0.1:8080", "http://localhost:8080"\]|additional_redirect_urls = ["http://127.0.0.1", "http://localhost", "http://138.59.144.162", "https://eralearn.sobreip.com.br", "http://eralearn.sobreip.com.br"]|' backend/supabase/config.toml
    
    if grep -q 'site_url = "http://138.59.144.162"' backend/supabase/config.toml; then
        echo "✅ config.toml - URLs atualizadas"
    else
        echo "❌ Erro ao alterar config.toml"
    fi
else
    echo "⚠️ Arquivo config.toml não encontrado, pulando..."
fi

# 3. Alterar .env.local - Linhas 2 e 3
echo "📝 Alterando .env.local..."
if [ -f ".env.local" ]; then
    sed -i 's|VITE_APP_URL=http://138.59.144.162:8080|VITE_APP_URL=http://138.59.144.162|' .env.local
    sed -i 's|VITE_API_URL=http://138.59.144.162:8080|VITE_API_URL=http://138.59.144.162|' .env.local
    echo "✅ .env.local - URLs sem porta atualizadas"
else
    echo "📝 Criando .env.local..."
    cat > .env.local << 'EOF'
# URLs sem porta (porta 80 padrão)
VITE_APP_URL=http://138.59.144.162
VITE_API_URL=http://138.59.144.162

# Configurações do Supabase
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Upload
VITE_VIDEO_UPLOAD_TARGET=supabase
STORAGE_PROVIDER=supabase
EOF
    echo "✅ .env.local criado"
fi

# 4. Criar script de teste
echo "🧪 Criando script de teste..."
cat > testar-porta-80.sh << 'EOF'
#!/bin/bash
echo "🧪 Testando acesso na porta 80..."
echo ""

echo "📍 Testando acesso por IP (sem porta):"
timeout 5 curl -I http://138.59.144.162 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ IP acessível na porta 80"
else
    echo "❌ IP não acessível na porta 80"
fi

echo ""
echo "🔍 Verificando se algo está rodando na porta 80:"
if command -v netstat > /dev/null; then
    netstat -tuln | grep :80 && echo "✅ Porta 80 em uso" || echo "❌ Porta 80 livre"
elif command -v ss > /dev/null; then
    ss -tuln | grep :80 && echo "✅ Porta 80 em uso" || echo "❌ Porta 80 livre"
else
    echo "⚠️ Comando netstat/ss não encontrado"
fi

echo ""
echo "💡 Para rodar na porta 80, use:"
echo "sudo npm run dev"
EOF

chmod +x testar-porta-80.sh

echo ""
echo "✅ Configurações aplicadas com sucesso!"
echo ""
echo "📋 Resumo das alterações:"
echo "1. ✅ vite.config.ts (linha 10) - Porta alterada para 80"
echo "2. ✅ config.toml (linhas 73,75) - URLs sem porta"
echo "3. ✅ .env.local (linhas 2,3) - URLs atualizadas"
echo ""
echo "🚨 IMPORTANTE:"
echo "Para rodar na porta 80, você precisa de privilégios de administrador:"
echo ""
echo "Linux/Mac:"
echo "sudo npm run dev"
echo ""
echo "Windows (PowerShell como Admin):"
echo "npm run dev"
echo ""
echo "🧪 Para testar:"
echo "./testar-porta-80.sh"
echo ""
echo "🎯 Agora você pode acessar por:"
echo "http://138.59.144.162 (sem :8080)"
