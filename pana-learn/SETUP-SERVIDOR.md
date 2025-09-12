# 🚀 Guia de Instalação no Servidor Debian 13

## 📋 Pré-requisitos
- Servidor Debian 13 (limpo)
- Acesso root ou sudo
- Conexão com internet

## 🔧 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y ca-certificates curl gnupg build-essential git ufw software-properties-common
```

## 📦 2. Instalar Node.js LTS

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

## 📦 3. Instalar pnpm (Gerenciador de Pacotes)

```bash
# Instalar pnpm globalmente
sudo npm install -g pnpm

# Verificar instalação
pnpm --version
```

## 🔧 4. Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

## 🌐 5. Instalar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

## 🔒 6. Configurar Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP e HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Verificar status
sudo ufw status
```

## 📁 7. Preparar Diretório do Projeto

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Criar diretório específico para o projeto
mkdir -p /var/www/eralearn
```

## 🔑 8. Configurar SSL com Certbot (Opcional)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado SSL (substitua seu-dominio.com)
sudo certbot --nginx -d seu-dominio.com
```

## 📋 9. Checklist de Verificação

Antes de fazer o deploy, verifique se:

- [ ] Node.js 20+ instalado
- [ ] pnpm instalado
- [ ] PM2 instalado
- [ ] Nginx instalado e rodando
- [ ] Firewall configurado
- [ ] Diretório /var/www/eralearn criado
- [ ] Domínio apontando para o servidor (se aplicável)

## 🚀 10. Próximos Passos

Após preparar o servidor:

1. **Fazer upload do código** (via Git ou SCP)
2. **Instalar dependências** (`pnpm install`)
3. **Configurar variáveis de ambiente** (`.env.local`)
4. **Fazer build da aplicação** (`pnpm build`)
5. **Configurar PM2** para rodar a aplicação
6. **Configurar Nginx** como proxy reverso

## 📞 Suporte

Se precisar de ajuda com algum passo específico, me avise!
