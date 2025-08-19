# 🚀 **Guia de Instalação em Servidor - ERA Learn**

## 📋 **Pré-requisitos**

### **🖥️ Servidor:**
- **Sistema Operacional:** Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM:** Mínimo 2GB (Recomendado: 4GB+)
- **CPU:** 2 cores (Recomendado: 4 cores+)
- **Disco:** 20GB+ de espaço livre
- **Rede:** Acesso à internet para downloads

### **🌐 Domínio (Opcional):**
- Domínio configurado (ex: `eralearn.com`)
- Certificado SSL (Let's Encrypt gratuito)

## 🔧 **1. Preparação do Servidor**

### **✅ Atualizar Sistema:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### **✅ Instalar Dependências Básicas:**
```bash
# Ubuntu/Debian
sudo apt install -y curl wget git unzip build-essential

# CentOS/RHEL
sudo yum install -y curl wget git unzip gcc gcc-c++ make
```

## 🐳 **2. Instalar Docker e Docker Compose**

### **✅ Instalar Docker:**
```bash
# Baixar script de instalação
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Iniciar e habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verificar instalação
docker --version
```

### **✅ Instalar Docker Compose:**
```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker-compose --version
```

## 🗄️ **3. Configurar Banco de Dados (Supabase)**

### **✅ Opção 1: Supabase Cloud (Recomendado)**
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta e novo projeto
3. Configure as variáveis de ambiente

### **✅ Opção 2: Supabase Self-Hosted**
```bash
# Clonar Supabase
git clone https://github.com/supabase/supabase
cd supabase

# Configurar variáveis
cp .env.example .env
nano .env

# Iniciar Supabase
docker-compose up -d
```

## 📦 **4. Deploy da Aplicação**

### **✅ Clonar Repositório:**
```bash
# Clonar o projeto
git clone https://github.com/seu-usuario/eralearn.git
cd eralearn/pana-learn

# Verificar estrutura
ls -la
```

### **✅ Configurar Variáveis de Ambiente:**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

**Conteúdo do `.env`:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Application Configuration
VITE_APP_NAME=ERA Learn
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### **✅ Instalar Dependências:**
```bash
# Instalar Node.js (se não estiver instalado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versão
node --version
npm --version

# Instalar dependências
npm install

# Build de produção
npm run build
```

## 🌐 **5. Configurar Nginx (Web Server)**

### **✅ Instalar Nginx:**
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx
```

### **✅ Configurar Site:**
```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/eralearn
```

**Conteúdo da configuração:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    root /var/www/eralearn/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (se necessário)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **✅ Ativar Site:**
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/eralearn /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

## 📁 **6. Deploy dos Arquivos**

### **✅ Copiar Build para Servidor:**
```bash
# Criar diretório
sudo mkdir -p /var/www/eralearn

# Copiar arquivos buildados
sudo cp -r dist/* /var/www/eralearn/

# Definir permissões
sudo chown -R www-data:www-data /var/www/eralearn
sudo chmod -R 755 /var/www/eralearn
```

### **✅ Verificar Instalação:**
```bash
# Verificar se os arquivos estão no lugar
ls -la /var/www/eralearn/

# Testar acesso
curl -I http://localhost
```

## 🔒 **7. Configurar SSL (HTTPS)**

### **✅ Instalar Certbot:**
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

### **✅ Obter Certificado SSL:**
```bash
# Gerar certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 **8. Configurar CI/CD (Opcional)**

### **✅ GitHub Actions:**
Criar arquivo `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/eralearn
          sudo rm -rf *
          sudo cp -r /tmp/dist/* .
          sudo chown -R www-data:www-data .
          sudo systemctl reload nginx
```

## 📊 **9. Monitoramento e Logs**

### **✅ Configurar Logs:**
```bash
# Verificar logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Configurar rotação de logs
sudo nano /etc/logrotate.d/eralearn
```

### **✅ Monitoramento Básico:**
```bash
# Instalar htop para monitoramento
sudo apt install htop -y

# Verificar uso de recursos
htop

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h
```

## 🔧 **10. Manutenção**

### **✅ Atualizações:**
```bash
# Script de atualização
#!/bin/bash
cd /var/www/eralearn
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/eralearn/
sudo chown -R www-data:www-data /var/www/eralearn
sudo systemctl reload nginx
echo "Atualização concluída!"
```

### **✅ Backup:**
```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/eralearn"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/eralearn_$DATE.tar.gz /var/www/eralearn

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "eralearn_*.tar.gz" -mtime +7 -delete
```

## 🚨 **11. Troubleshooting**

### **✅ Problemas Comuns:**

#### **❌ Site não carrega:**
```bash
# Verificar status do Nginx
sudo systemctl status nginx

# Verificar logs de erro
sudo tail -f /var/log/nginx/error.log

# Verificar permissões
ls -la /var/www/eralearn/
```

#### **❌ Erro 502 Bad Gateway:**
```bash
# Verificar se a aplicação está rodando
ps aux | grep node

# Verificar portas em uso
sudo netstat -tlnp
```

#### **❌ Problemas de SSL:**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew
```

## 📞 **12. Suporte**

### **✅ Contatos:**
- **Email:** suporte@eralearn.com
- **Documentação:** [docs.eralearn.com](https://docs.eralearn.com)
- **GitHub:** [github.com/seu-usuario/eralearn](https://github.com/seu-usuario/eralearn)

### **✅ Logs Importantes:**
- `/var/log/nginx/access.log` - Acessos ao site
- `/var/log/nginx/error.log` - Erros do Nginx
- `/var/log/syslog` - Logs do sistema

## 🎯 **Resumo da Instalação**

1. ✅ **Preparar servidor** com dependências
2. ✅ **Instalar Docker** e Docker Compose
3. ✅ **Configurar Supabase** (banco de dados)
4. ✅ **Deploy da aplicação** React
5. ✅ **Configurar Nginx** como web server
6. ✅ **Configurar SSL** para HTTPS
7. ✅ **Configurar CI/CD** (opcional)
8. ✅ **Monitoramento** e logs
9. ✅ **Manutenção** e backups

**Sistema pronto para produção! 🚀**
