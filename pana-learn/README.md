# 🚀 ERA Learn - Plataforma de Ensino Online

Sistema completo de treinamentos online com certificados, quizzes e gestão de usuários.

## 🎯 Características

- ✅ **Sistema de Treinamentos** - Cursos com vídeos e progresso
- ✅ **Sistema de Quizzes** - Avaliações interativas
- ✅ **Certificados Automáticos** - Geração de certificados em PDF/SVG
- ✅ **Gestão de Usuários** - Admin, clientes e domínios
- ✅ **White Label** - Personalização por domínio
- ✅ **Sistema de IA** - Suporte inteligente
- ✅ **Responsivo** - Funciona em desktop e mobile

## 🚀 Instalação Rápida no Servidor

### Pré-requisitos
- Servidor Ubuntu 20.04+ (2GB RAM, 20GB disco)
- Domínio apontando para o servidor
- Acesso SSH com sudo

### Instalação com 1 Comando

```bash
# Conectar ao servidor
ssh usuario@ip_do_servidor

# Instalar tudo automaticamente
curl -fsSL https://raw.githubusercontent.com/Eduarjn/eralearn/main/install.sh | bash -s seudominio.com admin@seudominio.com
```

**Pronto!** A aplicação estará rodando em `https://seudominio.com`

## 🛠️ Instalação Manual

### 1. Clonar Repositório
```bash
git clone https://github.com/Eduarjn/eralearn.git
cd eralearn
```

### 2. Executar Instalação
```bash
chmod +x install.sh
./install.sh seudominio.com admin@seudominio.com
```

### 3. Configurar Variáveis
```bash
nano .env
# Editar VITE_APP_URL com seu domínio
```

### 4. Fazer Deploy
```bash
./deploy.sh seudominio.com admin@seudominio.com
```

## 📁 Estrutura do Projeto

```
eralearn/
├── src/                    # Código fonte React
├── public/                 # Arquivos estáticos
├── certificates/           # Templates de certificados
├── data/                   # Dados persistentes
├── nginx/                  # Configurações Nginx
├── docker-compose.prod.yml # Docker para produção
├── Dockerfile.prod         # Dockerfile otimizado
├── install.sh              # Instalação automática
├── deploy.sh               # Deploy automático
└── README.md               # Este arquivo
```

## 🔧 Comandos Úteis

```bash
# Status da aplicação
./status.sh

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Fazer backup
./backup.sh

# Atualizar aplicação
./update.sh

# Reiniciar serviços
docker-compose -f docker-compose.prod.yml restart
```

## 🌐 URLs Importantes

- **Aplicação**: `https://seudominio.com`
- **Admin**: `https://seudominio.com/dashboard`
- **API**: `https://seudominio.com/api`
- **Health Check**: `https://seudominio.com/health`

## 🔒 Segurança

- ✅ SSL/HTTPS automático (Let's Encrypt)
- ✅ Firewall configurado
- ✅ Rate limiting
- ✅ Headers de segurança
- ✅ Renovação automática de certificados

## 📊 Monitoramento

- ✅ Logs centralizados
- ✅ Health checks
- ✅ Backup automático
- ✅ Atualizações automatizadas

## 🆘 Suporte

### Problemas Comuns

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

### Logs e Debug

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

## 📝 Configuração

### Variáveis de Ambiente (.env)

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

## 🔄 Atualizações

### Atualização Automática
```bash
# Atualizar código
git pull origin main

# Reconstruir e reiniciar
./update.sh
```

### Atualização Manual
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

## 📋 Checklist de Instalação

- [ ] Servidor Ubuntu 20.04+
- [ ] Domínio apontando para o servidor
- [ ] Acesso SSH com sudo
- [ ] Executar `install.sh`
- [ ] Configurar arquivo `.env`
- [ ] Executar `deploy.sh`
- [ ] Testar todas as funcionalidades
- [ ] Configurar backup automático

## 🎉 Resultado Final

Após a instalação, você terá:

- ✅ Plataforma ERA Learn rodando em produção
- ✅ SSL/HTTPS configurado automaticamente
- ✅ Sistema de backup funcionando
- ✅ Monitoramento ativo
- ✅ Atualizações automatizadas
- ✅ Segurança configurada

## 📞 Contato

- **Desenvolvido por**: ERA Learn Team
- **Website**: https://era.com.br
- **Suporte**: suporte@era.com.br

---

**🚀 Sua plataforma de ensino online está pronta para uso!**