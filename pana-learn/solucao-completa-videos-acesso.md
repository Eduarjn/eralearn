# 🛠️ Solução Completa: Upload de Vídeos + Configuração de Acesso

## 🔴 **PROBLEMA 1: Upload de Vídeos Falhando**

### **Erro Identificado:**
```
Could not find the function public.obter_proxima_ordem_video(p_curso_id) in the schema cache
```

### **📋 Solução - Passo a Passo:**

#### **1. Criar a Função SQL Ausente no Supabase**

1. Acesse: https://supabase.com/dashboard/project/oqoxhavdhrgd/sql
2. Execute este script:

```sql
-- Criar função obter_proxima_ordem_video ausente
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

-- Dar permissões necessárias
GRANT EXECUTE ON FUNCTION public.obter_proxima_ordem_video(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.obter_proxima_ordem_video(uuid) TO authenticated;

-- Testar a função
SELECT public.obter_proxima_ordem_video('98f3a689-389c-4ded-9833-846d59fcc183'::uuid) as proxima_ordem;
```

#### **2. Configurar Upload para Supabase**

Crie o arquivo `.env.local`:

```env
# Configurações do Supabase
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Configurar upload para Supabase
VITE_VIDEO_UPLOAD_TARGET=supabase
STORAGE_PROVIDER=supabase

# URLs de acesso
VITE_APP_URL=http://138.59.144.162
VITE_API_URL=http://138.59.144.162
```

## 🌐 **PROBLEMA 2: Configurar Acesso por IP**

### **Cenário A: Acesso COM porta (138.59.144.162:8080)**

#### **Arquivos a alterar:**

1. **vite.config.ts** (linha 10):
```typescript
port: 8080,
```

2. **.env.local**:
```env
VITE_APP_URL=http://138.59.144.162:8080
VITE_API_URL=http://138.59.144.162:8080
```

### **Cenário B: Acesso SEM porta (138.59.144.162)**

#### **Arquivos a alterar:**

1. **vite.config.ts** (linha 10):
```typescript
port: 80,
```

2. **.env.local**:
```env
VITE_APP_URL=http://138.59.144.162
VITE_API_URL=http://138.59.144.162
```

3. **backend/supabase/config.toml** (linha 73):
```toml
site_url = "http://138.59.144.162"
```

## 🚀 **Scripts Automáticos de Solução**

### **Script 1: Corrigir Upload de Vídeos**
```bash
#!/bin/bash
# corrigir-upload-videos.sh

echo "🔧 Corrigindo upload de vídeos..."

cd pana-learn

# Criar .env.local com configurações corretas
cat > .env.local << 'EOF'
# Configurações do Supabase
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Upload via Supabase
VITE_VIDEO_UPLOAD_TARGET=supabase
STORAGE_PROVIDER=supabase

# URLs de acesso
VITE_APP_URL=http://138.59.144.162:8080
VITE_API_URL=http://138.59.144.162:8080
EOF

echo "✅ Configurações de upload criadas"
echo "⚠️ IMPORTANTE: Substitua 'sua_chave_anon_aqui' pela chave real do Supabase"
echo "📝 Execute o script SQL no Supabase Dashboard"
```

### **Script 2: Configurar Acesso COM Porta (8080)**
```bash
#!/bin/bash
# configurar-acesso-com-porta.sh

echo "🌐 Configurando acesso COM porta..."

cd pana-learn

# Configurar Vite para porta 8080
sed -i 's/port: 80,/port: 8080,/' vite.config.ts
sed -i 's/host: "localhost"/host: "0.0.0.0"/' vite.config.ts

# Configurar URLs com porta
sed -i 's|VITE_APP_URL=http://138.59.144.162|VITE_APP_URL=http://138.59.144.162:8080|' .env.local
sed -i 's|VITE_API_URL=http://138.59.144.162|VITE_API_URL=http://138.59.144.162:8080|' .env.local

echo "✅ Configurado para: http://138.59.144.162:8080"
```

### **Script 3: Configurar Acesso SEM Porta (80)**
```bash
#!/bin/bash
# configurar-acesso-sem-porta.sh

echo "🌐 Configurando acesso SEM porta..."

cd pana-learn

# Configurar Vite para porta 80
sed -i 's/port: 8080,/port: 80,/' vite.config.ts
sed -i 's/host: "localhost"/host: "0.0.0.0"/' vite.config.ts

# Configurar URLs sem porta
sed -i 's|VITE_APP_URL=http://138.59.144.162:8080|VITE_APP_URL=http://138.59.144.162|' .env.local
sed -i 's|VITE_API_URL=http://138.59.144.162:8080|VITE_API_URL=http://138.59.144.162|' .env.local

# Configurar Supabase
if [ -f "backend/supabase/config.toml" ]; then
    sed -i 's|site_url = "http://127.0.0.1:5173"|site_url = "http://138.59.144.162"|' backend/supabase/config.toml
fi

echo "✅ Configurado para: http://138.59.144.162"
echo "⚠️ Para rodar na porta 80: sudo npm run dev"
```

## 📋 **Ordem de Execução Recomendada:**

### **1. Primeiro: Corrigir Upload de Vídeos**
```bash
chmod +x corrigir-upload-videos.sh
./corrigir-upload-videos.sh
```

### **2. Depois: Escolher Configuração de Acesso**

**Opção A - COM porta 8080:**
```bash
chmod +x configurar-acesso-com-porta.sh
./configurar-acesso-com-porta.sh
npm run dev
```

**Opção B - SEM porta (porta 80):**
```bash
chmod +x configurar-acesso-sem-porta.sh
./configurar-acesso-sem-porta.sh
sudo npm run dev
```

## 🧪 **Testar as Soluções:**

### **Teste 1: Upload de Vídeos**
1. Acesse a plataforma
2. Vá em "Adicionar Vídeo"
3. Tente fazer upload de um vídeo pequeno

### **Teste 2: Acesso por IP**
```bash
# Com porta
curl -I http://138.59.144.162:8080

# Sem porta
curl -I http://138.59.144.162
```

## 🎯 **Resultado Final:**

Após seguir todos os passos:

✅ **Upload de vídeos funcionando**
✅ **Acesso por IP configurado**
✅ **Função SQL criada no Supabase**
✅ **Configurações de ambiente corretas**

## 🆘 **Se Ainda Houver Problemas:**

1. Verifique se a chave do Supabase está correta
2. Confirme que a função SQL foi criada
3. Reinicie o servidor após as mudanças
4. Verifique os logs do console (F12) para erros específicos
