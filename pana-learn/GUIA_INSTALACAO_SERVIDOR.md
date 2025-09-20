# 🚀 Guia de Instalação ERA Learn no Servidor

Este guia completo te ajudará a instalar e configurar a plataforma ERA Learn em um servidor de produção.

## 📋 Pré-requisitos do Servidor

### Especificações Mínimas Recomendadas:
- **CPU**: 2 cores ou mais
- **RAM**: 4GB ou mais (8GB recomendado)
- **Disco**: 50GB SSD ou mais
- **Sistema**: Ubuntu 20.04 LTS ou superior / CentOS 8+ / Debian 11+

### Software Necessário:
- Docker e Docker Compose
- Nginx (proxy reverso)
- Certificado SSL (Let's Encrypt)
- Git

## 🔧 Passo 1: Preparação do Servidor

### 1.1 Atualizar o Sistema
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.2 Instalar Dependências Básicas
```bash
# Ubuntu/Debian
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# CentOS/RHEL
sudo yum install -y curl wget git unzip yum-utils
```

### 1.3 Instalar Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 1.4 Instalar Nginx
```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 📁 Passo 2: Preparação da Aplicação

### 2.1 Criar Diretório da Aplicação
```bash
sudo mkdir -p /opt/eralearn
sudo chown $USER:$USER /opt/eralearn
cd /opt/eralearn
```

### 2.2 Clonar o Repositório
```bash
# Se você tem o código em um repositório Git
git clone https://github.com/seu-usuario/eralearn.git .

# Ou fazer upload dos arquivos via SCP/SFTP
# scp -r ./pana-learn/* usuario@servidor:/opt/eralearn/
```

### 2.3 Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis de ambiente
nano .env
```

**Configurações importantes no .env:**
```env
# Modo de produção
NODE_ENV=production
VITE_APP_MODE=production

# Supabase (se usando)
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui

# Domínio
VITE_APP_URL=https://seudominio.com

# Certificados
CERT_DATA_DIR=/opt/eralearn/data

# Porta da aplicação
PORT=3000
```

## 🐳 Passo 3: Configuração Docker

### 3.1 Dockerfile de Produção
```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Docker Compose para Produção
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  eralearn:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: eralearn-app
    restart: unless-stopped
    ports:
      - "3000:80"
    volumes:
      - ./data:/opt/eralearn/data
      - ./logs:/var/log/nginx
    environment:
      - NODE_ENV=production
    networks:
      - eralearn-network

  nginx-proxy:
    image: nginx:alpine
    container_name: eralearn-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
      - ./logs:/var/log/nginx
    depends_on:
      - eralearn
    networks:
      - eralearn-network

networks:
  eralearn-network:
    driver: bridge

volumes:
  data:
  logs:
```

## 🌐 Passo 4: Configuração Nginx

### 4.1 Configuração Principal do Nginx
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip
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

    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
}
```

### 4.2 Configuração do Site
```nginx
# nginx/conf.d/eralearn.conf
upstream eralearn_backend {
    server eralearn:80;
}

server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Main application
    location / {
        proxy_pass http://eralearn_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # API routes
    location /api/ {
        proxy_pass http://eralearn_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Static files
    location /static/ {
        alias /usr/share/nginx/html/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Certificates
    location /data/ {
        alias /opt/eralearn/data/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

## 🔒 Passo 5: Configuração SSL

### 5.1 Instalar Certbot (Let's Encrypt)
```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx
```

### 5.2 Obter Certificado SSL
```bash
# Parar Nginx temporariamente
sudo systemctl stop nginx

# Obter certificado
sudo certbot certonly --standalone -d seudominio.com -d www.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5.3 Configurar Certificados no Nginx
```bash
# Copiar certificados para o diretório da aplicação
sudo mkdir -p /opt/eralearn/ssl
sudo cp /etc/letsencrypt/live/seudominio.com/fullchain.pem /opt/eralearn/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seudominio.com/privkey.pem /opt/eralearn/ssl/key.pem
sudo chown -R $USER:$USER /opt/eralearn/ssl
```

## 🚀 Passo 6: Deploy da Aplicação

### 6.1 Construir e Iniciar
```bash
cd /opt/eralearn

# Construir a aplicação
docker-compose -f docker-compose.prod.yml build

# Iniciar os serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps
```

### 6.2 Verificar Logs
```bash
# Logs da aplicação
docker-compose -f docker-compose.prod.yml logs -f eralearn

# Logs do proxy
docker-compose -f docker-compose.prod.yml logs -f nginx-proxy
```

## 🔧 Passo 7: Configurações Adicionais

### 7.1 Firewall
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 7.2 Configurar Logrotate
```bash
sudo nano /etc/logrotate.d/eralearn
```

```bash
/opt/eralearn/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/eralearn/docker-compose.prod.yml restart nginx-proxy
    endscript
}
```

### 7.3 Monitoramento
```bash
# Instalar htop para monitoramento
sudo apt install -y htop

# Verificar uso de recursos
htop
df -h
free -h
```

## 📊 Passo 8: Scripts de Manutenção

### 8.1 Script de Backup
```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/eralearn"
APP_DIR="/opt/eralearn"

mkdir -p $BACKUP_DIR

# Backup dos dados
tar -czf $BACKUP_DIR/eralearn_data_$DATE.tar.gz -C $APP_DIR data/

# Backup da configuração
tar -czf $BACKUP_DIR/eralearn_config_$DATE.tar.gz -C $APP_DIR .env docker-compose.prod.yml nginx/

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "eralearn_*" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

### 8.2 Script de Atualização
```bash
# update.sh
#!/bin/bash
cd /opt/eralearn

# Fazer backup antes da atualização
./backup.sh

# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Atualizar código
git pull origin main

# Reconstruir e iniciar
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo "Atualização concluída!"
```

## 🔍 Passo 9: Verificação e Testes

### 9.1 Verificar Status dos Serviços
```bash
# Status dos containers
docker ps

# Status do Nginx
sudo systemctl status nginx

# Testar conectividade
curl -I https://seudominio.com
```

### 9.2 Testes de Performance
```bash
# Instalar ferramentas de teste
sudo apt install -y apache2-utils

# Teste de carga
ab -n 1000 -c 10 https://seudominio.com/
```

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro de permissão Docker**
   ```bash
   sudo usermod -aG docker $USER
   # Fazer logout e login novamente
   ```

2. **Certificado SSL não funciona**
   ```bash
   sudo certbot renew --dry-run
   ```

3. **Aplicação não carrega**
   ```bash
   docker-compose -f docker-compose.prod.yml logs eralearn
   ```

4. **Nginx não inicia**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

## 📝 Checklist Final

- [ ] Servidor atualizado e configurado
- [ ] Docker e Docker Compose instalados
- [ ] Nginx configurado
- [ ] Certificado SSL instalado
- [ ] Aplicação construída e rodando
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Testes de conectividade realizados

## 🎉 Conclusão

Sua plataforma ERA Learn está agora rodando em produção! 

**URLs importantes:**
- Aplicação: https://seudominio.com
- Admin: https://seudominio.com/dashboard
- API: https://seudominio.com/api

**Comandos úteis:**
- Ver logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Reiniciar: `docker-compose -f docker-compose.prod.yml restart`
- Backup: `./backup.sh`
- Atualizar: `./update.sh`

---

**Desenvolvido para ERA Learn - Plataforma de Ensino Online**