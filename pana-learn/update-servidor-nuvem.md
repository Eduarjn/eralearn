# 🚀 Como Fazer Update no Servidor em Nuvem - ERA Learn

## 📋 **Métodos de Update:**

### **Método 1: Via SSH (Recomendado)**

#### **1. Conectar ao Servidor**
```bash
ssh usuario@138.59.144.162
# OU
ssh root@138.59.144.162
```

#### **2. Navegar para o Diretório do Projeto**
```bash
cd /var/www/eralearn
# OU onde estiver o projeto
cd /home/usuario/eralearn
```

#### **3. Fazer Pull das Atualizações**
```bash
# Fazer backup antes
cp -r . ../backup_$(date +%Y%m%d_%H%M%S)

# Fazer pull do GitHub
git pull origin main

# OU se houver conflitos, forçar update
git fetch origin
git reset --hard origin/main
```

#### **4. Instalar/Atualizar Dependências**
```bash
npm install
# OU se usar yarn
yarn install
```

#### **5. Configurar Variáveis de Ambiente**
```bash
# Copiar configuração de ambiente
cp configuracao-ambiente.env .env.local

# Editar com as credenciais corretas
nano .env.local
# OU
vim .env.local
```

#### **6. Build para Produção**
```bash
npm run build
```

#### **7. Reiniciar Serviços**
```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar PM2 (se usar)
pm2 restart all

# OU reiniciar serviço específico
sudo systemctl restart eralearn
```

### **Método 2: Script Automático de Update**

Vou criar um script que automatiza todo o processo:

```bash
#!/bin/bash
# update-servidor.sh

echo "🚀 Atualizando ERA Learn no Servidor..."

# Definir diretório do projeto
PROJECT_DIR="/var/www/eralearn"

# Verificar se o diretório existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Diretório $PROJECT_DIR não encontrado"
    echo "💡 Ajuste a variável PROJECT_DIR no script"
    exit 1
fi

cd $PROJECT_DIR

# 1. Backup
echo "📁 Criando backup..."
BACKUP_DIR="../backup_$(date +%Y%m%d_%H%M%S)"
cp -r . $BACKUP_DIR
echo "✅ Backup criado em: $BACKUP_DIR"

# 2. Pull das atualizações
echo "📥 Baixando atualizações do GitHub..."
git fetch origin
git reset --hard origin/main
echo "✅ Código atualizado"

# 3. Instalar dependências
echo "📦 Instalando dependências..."
npm install
echo "✅ Dependências instaladas"

# 4. Configurar ambiente
echo "⚙️ Configurando ambiente..."
if [ -f "configuracao-ambiente.env" ]; then
    cp configuracao-ambiente.env .env.local
    echo "✅ Arquivo .env.local criado"
    echo "⚠️ IMPORTANTE: Edite .env.local com suas credenciais reais"
else
    echo "⚠️ Arquivo configuracao-ambiente.env não encontrado"
fi

# 5. Build
echo "🔨 Fazendo build..."
npm run build
echo "✅ Build concluído"

# 6. Reiniciar serviços
echo "🔄 Reiniciando serviços..."

# Nginx
if systemctl is-active --quiet nginx; then
    sudo systemctl restart nginx
    echo "✅ Nginx reiniciado"
fi

# PM2
if command -v pm2 > /dev/null; then
    pm2 restart all
    echo "✅ PM2 reiniciado"
fi

# Docker (se aplicável)
if [ -f "docker-compose.yml" ]; then
    docker-compose restart
    echo "✅ Docker containers reiniciados"
fi

echo ""
echo "🎉 Update concluído com sucesso!"
echo "🌐 Acesse: http://138.59.144.162:8080"
echo ""
echo "📝 Próximos passos:"
echo "1. Edite .env.local com suas credenciais reais"
echo "2. Execute o SQL no Supabase (fix-upload-function.sql)"
echo "3. Teste o upload de vídeos"
```

### **Método 3: Via FTP/SFTP (Alternativo)**

Se não tiver acesso SSH:

#### **1. Conectar via SFTP**
```bash
sftp usuario@138.59.144.162
```

#### **2. Upload dos Arquivos Alterados**
```bash
# Upload arquivos específicos
put vite.config.ts
put nginx.conf
put backend/supabase/config.toml
put fix-upload-function.sql
put configuracao-ambiente.env
```

#### **3. Conectar via SSH para executar comandos**
```bash
ssh usuario@138.59.144.162
cd /var/www/eralearn
npm run build
sudo systemctl restart nginx
```

## 🐳 **Se Usar Docker:**

### **Update com Docker Compose**
```bash
# Conectar ao servidor
ssh usuario@138.59.144.162

# Navegar para o projeto
cd /var/www/eralearn

# Pull das atualizações
git pull origin main

# Rebuild e restart containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificar status
docker-compose ps
```

## 📋 **Checklist Pós-Update:**

### **1. Verificar Serviços**
```bash
# Status do Nginx
sudo systemctl status nginx

# Status do Node.js/PM2
pm2 status

# Logs de erro
sudo tail -f /var/log/nginx/error.log
```

### **2. Testar Funcionalidades**
```bash
# Teste de conectividade
curl -I http://138.59.144.162:8080

# Teste de upload (via browser)
# Acesse a plataforma e teste o upload de vídeo
```

### **3. Verificar Configurações**
```bash
# Verificar .env.local
cat .env.local

# Verificar nginx config
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/access.log
```

## 🚨 **Troubleshooting:**

### **Problema: Permissões**
```bash
# Ajustar permissões
sudo chown -R www-data:www-data /var/www/eralearn
sudo chmod -R 755 /var/www/eralearn
```

### **Problema: Porta Ocupada**
```bash
# Verificar o que está usando a porta
sudo netstat -tulpn | grep :8080
sudo lsof -i :8080

# Matar processo se necessário
sudo kill -9 PID
```

### **Problema: Build Falha**
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 **Script de Update Remoto (Executar do seu PC)**

```bash
#!/bin/bash
# update-remoto.sh

SERVER="138.59.144.162"
USER="usuario"  # Ajustar conforme necessário

echo "🚀 Fazendo update remoto no servidor $SERVER..."

ssh $USER@$SERVER << 'EOF'
cd /var/www/eralearn
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
pm2 restart all
echo "✅ Update concluído no servidor!"
EOF

echo "🎉 Update remoto finalizado!"
echo "🌐 Teste em: http://138.59.144.162:8080"
```

## 🎯 **Resumo dos Comandos Essenciais:**

```bash
# 1. Conectar ao servidor
ssh usuario@138.59.144.162

# 2. Update do código
cd /var/www/eralearn
git pull origin main

# 3. Instalar dependências
npm install

# 4. Build
npm run build

# 5. Reiniciar serviços
sudo systemctl restart nginx
pm2 restart all

# 6. Verificar
curl -I http://138.59.144.162:8080
```

**Qual método você prefere usar? Posso te ajudar com os detalhes específicos!**
