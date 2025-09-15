# 🔐 Guia de Instalação SSL para *.sobreip.com.br

## 📋 Informações do Certificado

- **Domínio**: `*.sobreip.com.br` (wildcard)
- **Domínio principal**: `sobreip.com.br`
- **Validade**: 25/07/2025 a 25/08/2026
- **Emissor**: Sectigo (Sectigo Public Server Authentication CA DV R36)
- **Tipo**: SSL/TLS Wildcard Certificate

## 🚀 Instalação Automática

### **Opção 1: Script Automático (Recomendado)**

```bash
# 1. Tornar o script executável
chmod +x install-ssl-sobreip.sh

# 2. Executar como root
sudo bash install-ssl-sobreip.sh
```

**O script fará automaticamente:**
- ✅ Instalar Nginx (se necessário)
- ✅ Criar diretórios de certificados
- ✅ Instalar certificado e chave privada
- ✅ Configurar Nginx com SSL
- ✅ Ativar site e reiniciar serviços
- ✅ Testar configuração

---

## 🔧 Instalação Manual

### **1. Instalar Nginx**
```bash
sudo apt update
sudo apt install -y nginx
```

### **2. Criar Diretórios**
```bash
sudo mkdir -p /etc/ssl/certs/sobreip
sudo mkdir -p /etc/ssl/private/sobreip
```

### **3. Instalar Certificado**
```bash
# Copiar certificado
sudo cp ssl-certificate.crt /etc/ssl/certs/sobreip/certificate.crt

# Copiar chave privada
sudo cp ssl-private-key.key /etc/ssl/private/sobreip/private.key

# Definir permissões
sudo chmod 644 /etc/ssl/certs/sobreip/certificate.crt
sudo chmod 600 /etc/ssl/private/sobreip/private.key
```

### **4. Configurar Nginx**
```bash
# Criar configuração
sudo nano /etc/nginx/sites-available/sobreip
```

**Conteúdo da configuração:**
```nginx
server {
    listen 80;
    server_name *.sobreip.com.br sobreip.com.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name *.sobreip.com.br sobreip.com.br;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/sobreip/certificate.crt;
    ssl_certificate_key /etc/ssl/private/sobreip/private.key;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Configuração da aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Configuração para uploads grandes
    client_max_body_size 100M;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### **5. Ativar Site**
```bash
# Ativar site
sudo ln -sf /etc/nginx/sites-available/sobreip /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🌐 Configuração DNS

### **Registros DNS Necessários**

```
Tipo: A
Nome: @
Valor: [IP_DO_SEU_SERVIDOR]

Tipo: A
Nome: *
Valor: [IP_DO_SEU_SERVIDOR]

Tipo: CNAME
Nome: www
Valor: sobreip.com.br
```

### **Exemplo de Configuração**

Se seu servidor tem IP `192.168.1.100`:

```
A     @                   192.168.1.100
A     *                   192.168.1.100
CNAME www                 sobreip.com.br
```

---

## ✅ Verificação da Instalação

### **1. Testar Certificado**
```bash
# Verificar certificado
openssl x509 -in /etc/ssl/certs/sobreip/certificate.crt -text -noout

# Verificar chave privada
openssl rsa -in /etc/ssl/private/sobreip/private.key -check
```

### **2. Testar Nginx**
```bash
# Testar configuração
sudo nginx -t

# Verificar status
sudo systemctl status nginx

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

### **3. Testar SSL Online**
- Acesse: https://www.ssllabs.com/ssltest/
- Digite: `sobreip.com.br`
- Verifique se o certificado está válido

---

## 🔍 Troubleshooting

### **Problema: Certificado inválido**
```bash
# Verificar se os arquivos existem
ls -la /etc/ssl/certs/sobreip/
ls -la /etc/ssl/private/sobreip/

# Verificar permissões
sudo chmod 644 /etc/ssl/certs/sobreip/certificate.crt
sudo chmod 600 /etc/ssl/private/sobreip/private.key
```

### **Problema: Nginx não inicia**
```bash
# Verificar configuração
sudo nginx -t

# Verificar logs
sudo journalctl -u nginx -f

# Verificar se a porta 443 está em uso
sudo netstat -tlnp | grep :443
```

### **Problema: Redirecionamento não funciona**
```bash
# Verificar se o site está ativo
ls -la /etc/nginx/sites-enabled/

# Verificar configuração
sudo nginx -T | grep -A 10 -B 10 "sobreip"
```

---

## 📊 Status da Instalação

### **Arquivos Criados**
- ✅ `/etc/ssl/certs/sobreip/certificate.crt`
- ✅ `/etc/ssl/private/sobreip/private.key`
- ✅ `/etc/nginx/sites-available/sobreip`
- ✅ `/etc/nginx/sites-enabled/sobreip`

### **Serviços**
- ✅ Nginx instalado e configurado
- ✅ SSL ativo na porta 443
- ✅ Redirecionamento HTTP → HTTPS
- ✅ Proxy para aplicação na porta 3000

### **Domínios Suportados**
- ✅ `sobreip.com.br`
- ✅ `www.sobreip.com.br`
- ✅ `*.sobreip.com.br` (qualquer subdomínio)

---

## 🎯 Próximos Passos

1. **Configurar DNS** - Apontar domínio para seu servidor
2. **Testar SSL** - Verificar se HTTPS funciona
3. **Configurar aplicação** - Ajustar para rodar na porta 3000
4. **Monitorar logs** - Verificar se tudo está funcionando

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs**: `sudo tail -f /var/log/nginx/error.log`
2. **Testar configuração**: `sudo nginx -t`
3. **Verificar status**: `sudo systemctl status nginx`
4. **Reiniciar serviços**: `sudo systemctl restart nginx`

**🎉 SSL configurado com sucesso para *.sobreip.com.br!**
















