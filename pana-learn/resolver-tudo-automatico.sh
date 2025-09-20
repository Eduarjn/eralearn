#!/bin/bash
# Script COMPLETO para resolver upload de vídeos + configuração de acesso

echo "🚀 RESOLVER TUDO - Upload de Vídeos + Configuração de Acesso"
echo "============================================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "vite.config.ts" ]; then
    echo "❌ Erro: Execute este script no diretório pana-learn"
    exit 1
fi

# Função para escolher configuração de porta
escolher_porta() {
    echo "🌐 Escolha a configuração de acesso:"
    echo "1) COM porta 8080 (http://138.59.144.162:8080)"
    echo "2) SEM porta - porta 80 (http://138.59.144.162)"
    echo ""
    read -p "Digite sua escolha (1 ou 2): " escolha
    
    case $escolha in
        1)
            PORTA=8080
            URL_BASE="http://138.59.144.162:8080"
            PRECISA_SUDO="não"
            ;;
        2)
            PORTA=80
            URL_BASE="http://138.59.144.162"
            PRECISA_SUDO="sim"
            ;;
        *)
            echo "❌ Escolha inválida. Usando padrão: porta 8080"
            PORTA=8080
            URL_BASE="http://138.59.144.162:8080"
            PRECISA_SUDO="não"
            ;;
    esac
}

# Escolher configuração
escolher_porta

echo ""
echo "📋 Configuração escolhida:"
echo "   Porta: $PORTA"
echo "   URL: $URL_BASE"
echo "   Precisa sudo: $PRECISA_SUDO"
echo ""

# Backup dos arquivos
echo "📁 Criando backups..."
timestamp=$(date +%Y%m%d_%H%M%S)
cp vite.config.ts vite.config.ts.backup.$timestamp
if [ -f "backend/supabase/config.toml" ]; then
    cp backend/supabase/config.toml backend/supabase/config.toml.backup.$timestamp
fi
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.$timestamp
fi

echo ""
echo "🔧 ETAPA 1: Configurando Upload de Vídeos..."

# Criar .env.local com configurações corretas
cat > .env.local << EOF
# Configurações do Supabase
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Upload via Supabase (não usar servidor local)
VITE_VIDEO_UPLOAD_TARGET=supabase
STORAGE_PROVIDER=supabase

# URLs de acesso
VITE_APP_URL=$URL_BASE
VITE_API_URL=$URL_BASE

# Outras configurações
NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_VIDEO_MAX_UPLOAD_MB=1024
EOF

echo "✅ .env.local criado com configurações de upload"

echo ""
echo "🌐 ETAPA 2: Configurando Acesso por IP..."

# Configurar vite.config.ts
cat > vite.config.ts << EOF
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Permitir acesso de qualquer IP
    port: $PORTA,
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
      'lucide-react'
    ]
  }
}));
EOF

echo "✅ vite.config.ts configurado para porta $PORTA"

# Configurar Supabase se necessário
if [ -f "backend/supabase/config.toml" ]; then
    echo "🔐 Configurando Supabase..."
    
    if [ $PORTA -eq 80 ]; then
        sed -i "s|site_url = \"http://127.0.0.1:5173\"|site_url = \"$URL_BASE\"|" backend/supabase/config.toml
        sed -i "s|additional_redirect_urls = \[\"http://127.0.0.1:5173\", \"http://localhost:5173\"\]|additional_redirect_urls = [\"http://127.0.0.1\", \"http://localhost\", \"$URL_BASE\", \"https://eralearn.sobreip.com.br\"]|" backend/supabase/config.toml
    else
        sed -i "s|site_url = \"http://127.0.0.1:5173\"|site_url = \"$URL_BASE\"|" backend/supabase/config.toml
        sed -i "s|additional_redirect_urls = \[\"http://127.0.0.1:5173\", \"http://localhost:5173\"\]|additional_redirect_urls = [\"http://127.0.0.1:5173\", \"http://localhost:5173\", \"$URL_BASE\", \"https://eralearn.sobreip.com.br\"]|" backend/supabase/config.toml
    fi
    
    echo "✅ Supabase configurado"
fi

# Criar script SQL para Supabase
echo ""
echo "📝 ETAPA 3: Criando script SQL..."

cat > fix-upload-function.sql << 'EOF'
-- Script para corrigir upload de vídeos
-- Execute no Supabase SQL Editor: https://supabase.com/dashboard/project/oqoxhavdhrgd/sql

-- 1. Criar função obter_proxima_ordem_video ausente
CREATE OR REPLACE FUNCTION public.obter_proxima_ordem_video(p_curso_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    proxima_ordem integer;
BEGIN
    -- Busca a maior ordem atual para o curso e adiciona 1
    SELECT COALESCE(MAX(ordem), 0) + 1 
    INTO proxima_ordem
    FROM videos 
    WHERE curso_id = p_curso_id;
    
    RETURN proxima_ordem;
END;
$$;

-- 2. Dar permissões necessárias
GRANT EXECUTE ON FUNCTION public.obter_proxima_ordem_video(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.obter_proxima_ordem_video(uuid) TO authenticated;

-- 3. Testar a função
SELECT public.obter_proxima_ordem_video('98f3a689-389c-4ded-9833-846d59fcc183'::uuid) as proxima_ordem;

-- 4. Verificar se foi criada
SELECT proname, pronargs FROM pg_proc WHERE proname = 'obter_proxima_ordem_video';
EOF

echo "✅ Script SQL criado: fix-upload-function.sql"

# Criar script de teste
cat > testar-configuracao.sh << EOF
#!/bin/bash
echo "🧪 Testando configuração..."
echo ""

echo "📍 Testando acesso:"
timeout 5 curl -I $URL_BASE 2>/dev/null
if [ \$? -eq 0 ]; then
    echo "✅ $URL_BASE acessível"
else
    echo "❌ $URL_BASE não acessível"
fi

echo ""
echo "🔍 Verificando porta $PORTA:"
if command -v netstat > /dev/null; then
    netstat -tuln | grep :$PORTA && echo "✅ Porta $PORTA em uso" || echo "❌ Porta $PORTA livre"
elif command -v ss > /dev/null; then
    ss -tuln | grep :$PORTA && echo "✅ Porta $PORTA em uso" || echo "❌ Porta $PORTA livre"
fi

echo ""
echo "📝 Verificando .env.local:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local existe"
    grep -q "VITE_VIDEO_UPLOAD_TARGET=supabase" .env.local && echo "✅ Upload configurado para Supabase" || echo "❌ Upload não configurado"
else
    echo "❌ .env.local não encontrado"
fi
EOF

chmod +x testar-configuracao.sh

echo ""
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "========================="
echo ""
echo "📋 O que foi feito:"
echo "1. ✅ .env.local criado com configurações de upload"
echo "2. ✅ vite.config.ts configurado para acesso externo"
echo "3. ✅ Supabase configurado (se aplicável)"
echo "4. ✅ Script SQL criado para corrigir função ausente"
echo ""
echo "🚨 PRÓXIMOS PASSOS OBRIGATÓRIOS:"
echo ""
echo "1. 📝 Edite o arquivo .env.local e substitua 'sua_chave_anon_aqui' pela chave real do Supabase"
echo ""
echo "2. 🗄️ Execute o script SQL no Supabase:"
echo "   - Acesse: https://supabase.com/dashboard/project/oqoxhavdhrgd/sql"
echo "   - Copie e execute o conteúdo do arquivo: fix-upload-function.sql"
echo ""
echo "3. 🚀 Inicie o servidor:"
if [ "$PRECISA_SUDO" = "sim" ]; then
    echo "   sudo npm run dev"
else
    echo "   npm run dev"
fi
echo ""
echo "4. 🧪 Teste a configuração:"
echo "   ./testar-configuracao.sh"
echo ""
echo "🎯 Após estes passos, você terá:"
echo "   - Upload de vídeos funcionando"
echo "   - Acesso por: $URL_BASE"
echo "   - Função SQL corrigida no Supabase"
echo ""
echo "🆘 Se houver problemas, verifique:"
echo "   - Chave do Supabase no .env.local"
echo "   - Função SQL foi executada no Supabase"
echo "   - Servidor reiniciado após as mudanças"
