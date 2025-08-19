# ⚡ **Instalação Rápida - ERA Learn**

## 🚀 **Método 1: Script Automatizado (Recomendado)**

### **✅ Passo a Passo:**

1. **Conecte-se ao servidor:**
```bash
ssh usuario@seu-servidor.com
```

2. **Baixe o script de instalação:**
```bash
wget https://raw.githubusercontent.com/seu-usuario/eralearn/main/pana-learn/install-server.sh
```

3. **Execute o script:**
```bash
sudo bash install-server.sh
```

4. **Siga as instruções na tela** e informe:
   - Domínio do site
   - URL do Supabase
   - Chave anônima do Supabase

5. **Configure SSL:**
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

**✅ Pronto! Site funcionando em https://seu-dominio.com**

---

## 🐳 **Método 2: Docker Compose**

### **✅ Passo a Passo:**

1. **Instalar Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Instalar Docker Compose:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Clonar projeto:**
```bash
git clone https://github.com/seu-usuario/eralearn.git
cd eralearn/pana-learn
```

4. **Configurar variáveis:**
```bash
cp .env.example .env
nano .env
```

5. **Executar containers:**
```bash
docker-compose up -d
```

**✅ Pronto! Site funcionando em http://localhost:3000**

---

## 🌐 **Método 3: Deploy Manual**

### **✅ Passo a Passo:**

1. **Preparar servidor:**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx nodejs npm git
```

2. **Clonar e configurar:**
```bash
git clone https://github.com/seu-usuario/eralearn.git
cd eralearn/pana-learn
npm install
npm run build
```

3. **Configurar Nginx:**
```bash
sudo cp -r dist/* /var/www/eralearn/
sudo chown -R www-data:www-data /var/www/eralearn
```

4. **Configurar site:**
```bash
sudo nano /etc/nginx/sites-available/eralearn
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/eralearn;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

5. **Ativar site:**
```bash
sudo ln -s /etc/nginx/sites-available/eralearn /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

---

## 📋 **Checklist de Instalação**

### **✅ Pré-requisitos:**
- [ ] Servidor Ubuntu 20.04+ / CentOS 8+
- [ ] Domínio configurado (opcional)
- [ ] Projeto Supabase criado
- [ ] Acesso SSH ao servidor

### **✅ Durante a Instalação:**
- [ ] Node.js 18+ instalado
- [ ] Nginx configurado
- [ ] Arquivos da aplicação copiados
- [ ] Permissões configuradas
- [ ] SSL configurado (se com domínio)

### **✅ Pós-Instalação:**
- [ ] Site acessível via HTTP/HTTPS
- [ ] Logs funcionando
- [ ] Backup configurado
- [ ] Monitoramento ativo

---

## 🔧 **Comandos Úteis**

### **✅ Verificar Status:**
```bash
# Status do Nginx
sudo systemctl status nginx

# Logs em tempo real
sudo tail -f /var/log/nginx/access.log

# Verificar portas
sudo netstat -tlnp

# Uso de recursos
htop
```

### **✅ Manutenção:**
```bash
# Atualizar aplicação
update-eralearn

# Fazer backup
backup-eralearn

# Reiniciar serviços
sudo systemctl restart nginx

# Verificar SSL
sudo certbot certificates
```

### **✅ Troubleshooting:**
```bash
# Verificar erros do Nginx
sudo nginx -t

# Verificar permissões
ls -la /var/www/eralearn/

# Testar conectividade
curl -I http://localhost
```

---

## 🚨 **Problemas Comuns**

### **❌ Site não carrega:**
```bash
# Verificar se Nginx está rodando
sudo systemctl status nginx

# Verificar logs de erro
sudo tail -f /var/log/nginx/error.log
```

### **❌ Erro 502 Bad Gateway:**
```bash
# Verificar se aplicação está rodando
ps aux | grep node

# Verificar portas
sudo netstat -tlnp
```

### **❌ Problemas de SSL:**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew
```

---

## 📞 **Suporte**

### **✅ Contatos:**
- **Email:** suporte@eralearn.com
- **Documentação:** [docs.eralearn.com](https://docs.eralearn.com)
- **GitHub:** [github.com/seu-usuario/eralearn](https://github.com/seu-usuario/eralearn)

### **✅ Logs Importantes:**
- `/var/log/nginx/access.log` - Acessos
- `/var/log/nginx/error.log` - Erros
- `/var/log/syslog` - Sistema

---

## 🎯 **Resumo**

**Escolha o método que melhor se adapta ao seu ambiente:**

1. **Script Automatizado** - Mais fácil e completo
2. **Docker Compose** - Isolado e portável
3. **Deploy Manual** - Controle total

**Tempo estimado de instalação: 10-30 minutos** ⚡
