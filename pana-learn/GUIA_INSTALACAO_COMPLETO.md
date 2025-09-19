# 🚀 **GUIA COMPLETO DE INSTALAÇÃO - ERA Learn**

## 📋 **PRÉ-REQUISITOS**

### **Sistema Operacional:**
- **Windows**: Windows 10/11 ou Windows Server 2019+
- **Linux**: Ubuntu 20.04+, CentOS 8+, ou Debian 11+
- **macOS**: macOS 10.15+ (para desenvolvimento)

### **Software Necessário:**
- **Node.js**: Versão 18+ ([Download](https://nodejs.org/))
- **npm**: Vem com Node.js
- **Git**: Para clonar o repositório
- **Docker**: Para containerização (opcional)
- **Docker Compose**: Para orquestração (opcional)

### **Conta Supabase:**
- Conta gratuita no [Supabase](https://supabase.com)
- Projeto criado no Supabase

---

## 🔧 **PASSO 1: PREPARAÇÃO DO AMBIENTE**

### **1.1. Instalar Node.js**
```bash
# Verificar se Node.js está instalado
node --version
npm --version

# Se não estiver instalado, baixe em: https://nodejs.org/
```

### **1.2. Instalar Git**
```bash
# Verificar se Git está instalado
git --version

# Se não estiver instalado, baixe em: https://git-scm.com/
```

### **1.3. Instalar Docker (Opcional)**
```bash
# Para Windows/Mac: Baixe Docker Desktop
# Para Linux:
sudo apt update
sudo apt install docker.io docker-compose
```

---

## 📥 **PASSO 2: BAIXAR O PROJETO**

### **2.1. Clonar o Repositório**
```bash
# Navegar para o diretório desejado
cd C:\Users\eduarjose\OneDrive\Desktop\trainig ERA\eralearn

# O projeto já está disponível em:
# C:\Users\eduarjose\OneDrive\Desktop\trainig ERA\eralearn\pana-learn
```

### **2.2. Navegar para o Diretório**
```bash
cd pana-learn
```

---

## ⚙️ **PASSO 3: CONFIGURAÇÃO DO SUPABASE**

### **3.1. Criar Projeto no Supabase**
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: `era-learn-prod`
   - **Database Password**: (anote esta senha!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
6. Clique em "Create new project"

### **3.2. Obter Credenciais**
1. No dashboard do Supabase, vá para **Settings > API**
2. Anote:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **3.3. Executar Migrations**
1. No Supabase Dashboard, vá para **SQL Editor**
2. Execute as migrations na seguinte ordem:

```sql
-- 1. Migration principal (criar tabelas básicas)
-- Cole o conteúdo do arquivo: supabase/migrations/20250618185917-447176b8-f6bc-47a2-b0a4-abdd20c3ce0d.sql

-- 2. Migration de categorias e vídeos
-- Cole o conteúdo do arquivo: supabase/migrations/20250619185741-5a372ef1-81d9-4aaa-a3a3-1f0d5aba20bc.sql

-- 3. Migration de domínios (se necessário)
-- Cole o conteúdo do arquivo: supabase/migrations/20250622000000-create-domains-table-fixed.sql

-- 4. Migration de quizzes (se necessário)
-- Cole o conteúdo do arquivo: supabase/migrations/20250627000000-create-quizzes-table.sql
```

### **3.4. Configurar Authentication**
1. Vá para **Authentication > Settings**
2. Configure:
   - **Site URL**: `http://localhost:5173` (para desenvolvimento)
   - **Redirect URLs**: Adicione `http://localhost:5173`
   - **Enable email confirmations**: ❌ **DESABILITADO** (para facilitar testes)
   - **Enable signups**: ✅ **HABILITADO**

---

## 🔑 **PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTO**

### **4.1. Criar Arquivo .env.local**
```bash
# No diretório pana-learn, crie o arquivo .env.local
touch .env.local  # Linux/Mac
# ou
type nul > .env.local  # Windows
```

### **4.2. Configurar Variáveis**
```bash
# Cole no arquivo .env.local:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
FEATURE_AI=false
VITE_VIDEO_UPLOAD_TARGET=supabase
VITE_VIDEO_MAX_UPLOAD_MB=1024
```

**⚠️ IMPORTANTE**: Substitua `seu-projeto` e `sua_anon_key_aqui` pelas suas credenciais reais do Supabase.

---

## 📦 **PASSO 5: INSTALAR DEPENDÊNCIAS**

### **5.1. Instalar Pacotes**
```bash
# No diretório pana-learn
npm install
```

### **5.2. Verificar Instalação**
```bash
# Verificar se tudo foi instalado corretamente
npm list --depth=0
```

---

## 🚀 **PASSO 6: EXECUTAR O PROJETO**

### **6.1. Modo Desenvolvimento**
```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

### **6.2. Acessar a Aplicação**
- Abra o navegador em: `http://localhost:5173`
- A aplicação deve carregar normalmente

### **6.3. Testar Cadastro**
1. Clique em "Cadastrar" ou "Registrar"
2. Crie uma conta com:
   - **Email**: `admin@eralearn.com` (para ser admin)
   - **Senha**: `123456`
3. Faça login e verifique se funciona

---

## 🏗️ **PASSO 7: BUILD PARA PRODUÇÃO**

### **7.1. Build da Aplicação**
```bash
# Gerar arquivos de produção
npm run build
```

### **7.2. Verificar Build**
```bash
# Verificar se a pasta dist foi criada
ls dist/  # Linux/Mac
dir dist\  # Windows
```

---

## 🐳 **PASSO 8: DEPLOY COM DOCKER (OPCIONAL)**

### **8.1. Build da Imagem Docker**
```bash
# Construir imagem Docker
docker build -t era-learn .
```

### **8.2. Executar com Docker Compose**
```bash
# Executar todos os serviços
docker-compose up -d
```

### **8.3. Verificar Containers**
```bash
# Ver containers rodando
docker ps
```

---

## 🌐 **PASSO 9: CONFIGURAÇÃO PARA PRODUÇÃO**

### **9.1. Atualizar Supabase para Produção**
1. No Supabase Dashboard, vá para **Authentication > Settings**
2. Atualize:
   - **Site URL**: `https://eralearn.sobreip.com.br`
   - **Redirect URLs**: Adicione `https://eralearn.sobreip.com.br`

### **9.2. Configurar Servidor Web**
```bash
# Copiar arquivos buildados para servidor
scp -r dist/* usuario@servidor:/var/www/eralearn/

# Configurar Nginx
sudo nano /etc/nginx/sites-available/eralearn
```

### **9.3. Configuração Nginx**
```nginx
server {
    listen 80;
    server_name eralearn.sobreip.com.br;
    root /var/www/eralearn;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /media/ {
        alias /var/www/eralearn/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## ✅ **PASSO 10: VERIFICAÇÃO FINAL**

### **10.1. Checklist de Verificação**
- [ ] ✅ Node.js instalado (versão 18+)
- [ ] ✅ Projeto clonado
- [ ] ✅ Supabase configurado
- [ ] ✅ Migrations executadas
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Dependências instaladas
- [ ] ✅ Aplicação rodando em desenvolvimento
- [ ] ✅ Cadastro/login funcionando
- [ ] ✅ Build de produção gerado
- [ ] ✅ Deploy realizado (se aplicável)

### **10.2. Testes Finais**
1. **Teste de Cadastro**: Criar novo usuário
2. **Teste de Login**: Fazer login com usuário criado
3. **Teste de Cursos**: Verificar se cursos aparecem
4. **Teste de Módulos**: Acessar módulos dos cursos
5. **Teste de Progresso**: Marcar progresso em um módulo

---

## 🆘 **SOLUÇÃO DE PROBLEMAS COMUNS**

### **Problema 1: Erro de Conexão com Supabase**
```bash
# Verificar se as credenciais estão corretas
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### **Problema 2: Erro 500 no Cadastro**
- Execute o script de correção no Supabase SQL Editor
- Verifique se as migrations foram executadas corretamente

### **Problema 3: Build Falha**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Problema 4: Porta 5173 em Uso**
```bash
# Matar processo na porta
npx kill-port 5173
# ou usar outra porta
npm run dev -- --port 3000
```

---

## 📞 **SUPORTE**

Se encontrar problemas durante a instalação:

1. **Verifique os logs** do navegador (F12 > Console)
2. **Verifique os logs** do Supabase Dashboard
3. **Execute os scripts de correção** fornecidos
4. **Consulte a documentação** do Supabase

---

## 🎉 **PARABÉNS!**

Se você chegou até aqui, o sistema ERA Learn está instalado e funcionando! 

**Próximos passos:**
- Configurar cursos e módulos
- Adicionar vídeos
- Personalizar branding
- Configurar usuários administradores

**Acesso:**
- **Desenvolvimento**: `http://localhost:5173`
- **Produção**: `https://eralearn.sobreip.com.br`














