# 🏠 ERA Learn - Guia Standalone 100% Local

## 🎯 **O que é o Modo Standalone?**

O **Modo Standalone** torna a ERA Learn **completamente autônoma**, sem depender de **nenhum serviço externo**:

- ✅ **Banco PostgreSQL local** (não usa Supabase Cloud)
- ✅ **Autenticação própria** (JWT local)
- ✅ **Storage local** (MinIO + uploads locais)
- ✅ **Backend Node.js** completo
- ✅ **Zero dependências externas**

---

## 🚀 **Deploy Standalone Completo**

### **Comando Único para Subir Tudo**
```bash
# Clone e execute (uma única linha!)
git clone <repo> && cd pana-learn && docker-compose -f docker-compose-standalone.yml up -d
```

### **Serviços Incluídos**
- **PostgreSQL** - Banco de dados (porta 5432)
- **Redis** - Cache e sessões (porta 6379)
- **Backend API** - Servidor Node.js (porta 3001)
- **Frontend** - Interface React (porta 3000)
- **MinIO** - Storage de arquivos (porta 9000/9001)

---

## 🔧 **Configuração Manual (se preferir)**

### **1. Preparar Ambiente**
```bash
# Clonar repositório
git clone <repository-url>
cd pana-learn

# Construir imagens
docker-compose -f docker-compose-standalone.yml build
```

### **2. Inicializar Serviços**
```bash
# Subir banco e redis primeiro
docker-compose -f docker-compose-standalone.yml up -d postgres redis storage

# Aguardar inicialização (30 segundos)
sleep 30

# Subir backend e frontend
docker-compose -f docker-compose-standalone.yml up -d backend frontend
```

### **3. Verificar Status**
```bash
# Ver logs
docker-compose -f docker-compose-standalone.yml logs -f

# Verificar serviços
docker-compose -f docker-compose-standalone.yml ps
```

---

## 📊 **Informações de Acesso**

### **URLs da Aplicação**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Storage (MinIO)**: http://localhost:9001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### **Credenciais Padrão**
```bash
# PostgreSQL
Usuario: eralearn
Senha: eralearn2024!
Database: eralearn

# MinIO Storage
Usuario: eralearn
Senha: eralearn2024!

# Redis
Senha: eralearn2024!

# Usuário Admin (criado automaticamente)
Email: admin@eralearn.com
Senha: admin123
```

---

## 🗄️ **Estrutura do Banco de Dados**

### **Dados Iniciais Incluídos**
- ✅ **Usuário Admin Master** - admin@eralearn.com
- ✅ **Usuário Admin** - admin@local.com  
- ✅ **Usuário Cliente** - cliente@test.com
- ✅ **4 Cursos de exemplo** (PABX, Omnichannel, CallCenter)
- ✅ **Quizzes configurados** para cada categoria
- ✅ **Módulos e estrutura** completa

### **Tabelas Criadas**
```sql
-- Principais
usuarios, domains, cursos, videos, modulos
video_progress, quizzes, quiz_perguntas
progresso_quiz, certificados, branding_config

-- Autenticação local
sessoes, uploads

-- Total: 13 tabelas + índices + triggers
```

---

## 📁 **Persistência de Dados**

### **Volumes Docker**
```yaml
postgres_data: # Banco de dados
redis_data: # Cache
uploads_data: # Arquivos enviados
storage_data: # MinIO storage
```

### **Backup Automático**
```bash
# Criar backup manual
docker-compose -f docker-compose-standalone.yml run --rm backup

# Backups ficam em: ./database/backups/
# Formato: backup_YYYYMMDD_HHMMSS.sql
```

### **Restaurar Backup**
```bash
# Parar serviços
docker-compose -f docker-compose-standalone.yml down

# Restaurar banco
docker-compose -f docker-compose-standalone.yml run --rm postgres sh -c "
  PGPASSWORD=eralearn2024! psql -h postgres -U eralearn -d eralearn < /backups/backup_YYYYMMDD_HHMMSS.sql
"

# Reiniciar
docker-compose -f docker-compose-standalone.yml up -d
```

---

## 🔒 **Segurança**

### **Medidas Implementadas**
- ✅ **JWT tokens** com expiração
- ✅ **Senhas bcrypt** (salt 12)
- ✅ **Rate limiting** (auth: 10/15min, geral: 1000/15min)
- ✅ **Headers de segurança** (Helmet)
- ✅ **Validação de entrada** (express-validator)
- ✅ **Sessões no banco** com cleanup automático

### **Configurações de Produção**
```bash
# Alterar senhas padrão
docker-compose -f docker-compose-standalone.yml exec postgres psql -U eralearn -d eralearn -c "
  UPDATE usuarios SET senha_hash = crypt('nova_senha', gen_salt('bf', 12)) WHERE email = 'admin@eralearn.com';
"

# Alterar JWT secret
export JWT_SECRET="sua_chave_super_secreta_aqui"

# Configurar CORS
export CORS_ORIGIN="https://seu-dominio.com"
```

---

## 🛠️ **Comandos Úteis**

### **Gerenciamento**
```bash
# Ver logs em tempo real
docker-compose -f docker-compose-standalone.yml logs -f

# Reiniciar um serviço
docker-compose -f docker-compose-standalone.yml restart backend

# Executar comando no banco
docker-compose -f docker-compose-standalone.yml exec postgres psql -U eralearn -d eralearn

# Acessar backend
docker-compose -f docker-compose-standalone.yml exec backend sh

# Parar tudo
docker-compose -f docker-compose-standalone.yml down

# Parar e remover volumes (CUIDADO!)
docker-compose -f docker-compose-standalone.yml down -v
```

### **Desenvolvimento**
```bash
# Build apenas do frontend
npm run build:standalone

# Testar frontend localmente (modo standalone)
VITE_APP_MODE=standalone npm run dev

# Ver status da API
curl http://localhost:3001/health
```

---

## 📈 **Monitoramento**

### **Health Checks**
```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:3001/health

# PostgreSQL
docker-compose -f docker-compose-standalone.yml exec postgres pg_isready -U eralearn

# MinIO
curl http://localhost:9000/minio/health/live
```

### **Logs Importantes**
```bash
# Backend logs
docker-compose -f docker-compose-standalone.yml logs backend

# PostgreSQL logs
docker-compose -f docker-compose-standalone.yml logs postgres

# Frontend/Nginx logs
docker-compose -f docker-compose-standalone.yml logs frontend
```

---

## 🎉 **Vantagens do Modo Standalone**

### ✅ **Benefícios**
- **Zero dependências externas** - funciona offline
- **Controle total** - seus dados, sua infraestrutura
- **Performance** - tudo local, sem latência de rede
- **Segurança** - dados não saem do seu ambiente
- **Customização** - modificar qualquer parte
- **Backup simples** - arquivos locais

### ⚠️ **Considerações**
- **Requer Docker** - para orquestração dos serviços
- **Mais complexo** - mais componentes para gerenciar
- **Recursos** - usa mais RAM/CPU que modo cloud
- **Escalabilidade** - limitada ao hardware local

---

## 🚀 **Migração de Dados**

### **Do Supabase Cloud para Standalone**
```bash
# 1. Exportar dados do Supabase
# (fazer backup via dashboard)

# 2. Converter e importar
# (scripts de migração disponíveis)

# 3. Configurar novos usuários
# (redefinir senhas localmente)
```

### **Entre Ambientes Standalone**
```bash
# Backup origem
docker-compose exec postgres pg_dump -U eralearn eralearn > backup.sql

# Restore destino
docker-compose exec -T postgres psql -U eralearn -d eralearn < backup.sql
```

---

## 📞 **Suporte**

### **Problemas Comuns**
1. **"Serviço não inicia"** - Verificar logs e portas
2. **"Erro de conexão DB"** - Aguardar inicialização completa
3. **"Uploads não funcionam"** - Verificar permissions de volumes
4. **"Token inválido"** - Limpar localStorage e fazer novo login

### **Debug**
```bash
# Verificar conectividade entre serviços
docker-compose -f docker-compose-standalone.yml exec backend ping postgres
docker-compose -f docker-compose-standalone.yml exec backend ping redis

# Testar API manualmente
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eralearn.com","password":"admin123"}'
```

---

## 🎯 **Conclusão**

O **Modo Standalone** torna a ERA Learn **completamente independente**, perfeita para:

- **Empresas com políticas rígidas** de dados
- **Ambientes desconectados** ou com internet limitada
- **Desenvolvimento local** completo
- **Demonstrações** sem dependências

**A plataforma mantém 100% das funcionalidades** do modo cloud, mas roda inteiramente no seu ambiente!





























