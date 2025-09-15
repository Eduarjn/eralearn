# 🚀 ERA Learn - Instalação via GitHub

## 📋 Como Usar Este Repositório

### **Instalação com 1 Comando (Recomendado)**

```bash
# Conectar ao servidor
ssh usuario@ip_do_servidor

# Instalar tudo automaticamente
curl -fsSL https://raw.githubusercontent.com/Eduarjn/eralearn/main/install.sh | bash -s seudominio.com admin@seudominio.com
```

**Pronto!** A aplicação estará rodando em `https://seudominio.com`

---

## 🛠️ Instalação Manual

### **1. Clonar Repositório**
```bash
git clone https://github.com/Eduarjn/eralearn.git
cd eralearn
```

### **2. Executar Instalação**
```bash
chmod +x install.sh
./install.sh seudominio.com admin@seudominio.com
```

### **3. Configurar Variáveis**
```bash
nano .env
# Editar VITE_APP_URL com seu domínio
```

### **4. Fazer Deploy**
```bash
./deploy.sh seudominio.com admin@seudominio.com
```

---

## 📁 Estrutura do Repositório

```
eralearn/
├── src/                    # Código fonte React
├── public/                 # Arquivos estáticos
├── certificates/           # Templates de certificados
├── nginx/                  # Configurações Nginx
├── docker-compose.prod.yml # Docker para produção
├── Dockerfile.prod         # Dockerfile otimizado
├── install.sh              # Instalação automática
├── deploy.sh               # Deploy automático
├── update.sh               # Atualização automática
├── status.sh               # Status do sistema
├── backup.sh               # Backup automático
├── env.production.example  # Exemplo de variáveis
└── README.md               # Documentação
```

---

## 🔧 Scripts Disponíveis

### **install.sh**
- Instala todas as dependências
- Configura Docker, Nginx, SSL
- Baixa e configura a aplicação
- Inicia todos os serviços

### **deploy.sh**
- Faz deploy da aplicação
- Configura SSL automaticamente
- Inicia serviços em produção

### **update.sh**
- Atualiza código do GitHub
- Reconstroi aplicação
- Reinicia serviços

### **status.sh**
- Mostra status dos containers
- Verifica conectividade
- Exibe logs recentes

### **backup.sh**
- Faz backup dos dados
- Mantém histórico de backups
- Limpa backups antigos

---

## 🌐 URLs Após Instalação

- **Aplicação**: `https://seudominio.com`
- **Admin**: `https://seudominio.com/dashboard`
- **API**: `https://seudominio.com/api`
- **Health Check**: `https://seudominio.com/health`

---

## 🔒 Recursos de Segurança

- ✅ SSL/HTTPS automático (Let's Encrypt)
- ✅ Firewall configurado
- ✅ Rate limiting
- ✅ Headers de segurança
- ✅ Renovação automática de certificados

---

## 📊 Monitoramento

- ✅ Logs centralizados
- ✅ Health checks
- ✅ Backup automático
- ✅ Atualizações automatizadas

---

## 🆘 Suporte

### **Problemas Comuns**

1. **Erro de permissão Docker:**
   ```bash
   sudo usermod -aG docker $USER
   # Fazer logout e login novamente
   ```

2. **Certificado SSL não funciona:**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

3. **Aplicação não carrega:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```

### **Comandos de Debug**

```bash
# Ver logs da aplicação
docker-compose -f docker-compose.prod.yml logs -f eralearn

# Ver logs do proxy
docker-compose -f docker-compose.prod.yml logs -f nginx-proxy

# Status dos containers
docker ps

# Verificar conectividade
curl -I https://seudominio.com
```

---

## 📝 Configuração

### **Variáveis de Ambiente (.env)**

```env
# Domínio da aplicação
VITE_APP_URL=https://seudominio.com

# Supabase (já configurado)
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui

# Configurações de certificados
CERT_DATA_DIR=/opt/eralearn/data

# Configurações de segurança
SESSION_SECRET=seu_secret_muito_seguro
JWT_SECRET=seu_jwt_secret_muito_seguro
```

---

## 🔄 Atualizações

### **Atualização Automática**
```bash
# Atualizar código
git pull origin main

# Reconstruir e reiniciar
./update.sh
```

### **Atualização Manual**
```bash
# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Atualizar código
git pull origin main

# Reconstruir
docker-compose -f docker-compose.prod.yml build

# Iniciar
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 Checklist de Instalação

- [ ] Servidor Ubuntu 20.04+
- [ ] Domínio apontando para o servidor
- [ ] Acesso SSH com sudo
- [ ] Executar `install.sh`
- [ ] Configurar arquivo `.env`
- [ ] Executar `deploy.sh`
- [ ] Testar todas as funcionalidades
- [ ] Configurar backup automático

---

## 🎉 Resultado Final

Após a instalação, você terá:

- ✅ Plataforma ERA Learn rodando em produção
- ✅ SSL/HTTPS configurado automaticamente
- ✅ Sistema de backup funcionando
- ✅ Monitoramento ativo
- ✅ Atualizações automatizadas
- ✅ Segurança configurada

---

## 📞 Contato

- **Desenvolvido por**: ERA Learn Team
- **Website**: https://era.com.br
- **Suporte**: suporte@era.com.br

---

**🚀 Sua plataforma de ensino online está pronta para uso!**
