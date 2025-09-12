# 🚀 **GUIA COMPLETO: Supabase Cloud → Local (Self-Hosted)**

## 📋 **OBJETIVO**
Migrar o ERA Learn de Supabase Cloud para uma instância local self-hosted, **sem quebrar nada** e **preservando todos os dados**.

## ✅ **O QUE FOI IMPLEMENTADO**

### **1. Factory Central do Client**
- ✅ `src/lib/supabaseClient.ts` - Factory que decide entre Cloud/Local
- ✅ Configuração via variáveis de ambiente
- ✅ Fallback automático para Cloud se Local falhar

### **2. Configuração de Ambiente**
- ✅ `env.example` atualizado com novas variáveis
- ✅ `PLATFORM_SUPABASE_MODE=cloud|local`
- ✅ URLs e chaves para Supabase Local

### **3. Scripts de Build/Execução**
- ✅ `npm run dev:cloud` - Executa com Supabase Cloud
- ✅ `npm run dev:local` - Executa com Supabase Local
- ✅ `npm run build:cloud` / `npm run build:local`

### **4. Scripts de Teste e Migração**
- ✅ `scripts/test-supabase-connection.js` - Testa conexão
- ✅ `scripts/migrate-supabase-data.sh` - Migra dados
- ✅ `docker-compose-supabase-local.yml` - Stack local

## 🔧 **COMO USAR**

### **Passo 1: Configurar Ambiente**

```bash
# Copiar exemplo de ambiente
cp env.example .env

# Editar .env e configurar:
PLATFORM_SUPABASE_MODE=cloud  # ou 'local'
LOCAL_SUPABASE_URL=http://localhost:8000
LOCAL_SUPABASE_ANON_KEY=your-local-anon-key
LOCAL_SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
```

### **Passo 2: Instalar Dependências**

```bash
npm install
```

### **Passo 3: Testar Conexão**

```bash
# Testar Cloud (padrão)
npm run test:supabase

# Testar Local
PLATFORM_SUPABASE_MODE=local npm run test:supabase
```

### **Passo 4: Executar Aplicação**

```bash
# Modo Cloud (atual)
npm run dev:cloud

# Modo Local
npm run dev:local
```

## 🐳 **SUPABASE LOCAL (DOCKER)**

### **Iniciar Stack Local**

```bash
# Usar Docker Compose fornecido
docker-compose -f docker-compose-supabase-local.yml up -d

# Verificar serviços
docker-compose -f docker-compose-supabase-local.yml ps
```

### **URLs do Supabase Local**
- **API Gateway**: http://localhost:8000
- **Studio (Dashboard)**: http://localhost:3000
- **PostgREST**: http://localhost:3001
- **Storage**: http://localhost:5000
- **Auth**: http://localhost:9999
- **Meta**: http://localhost:8080

## 📊 **MIGRAÇÃO DE DADOS**

### **Opção A: Script Automatizado**

```bash
# Configurar variáveis de ambiente
export DATABASE_URL="postgresql://postgres:password@cloud-host:5432/postgres"
export LOCAL_DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"

# Executar migração
chmod +x scripts/migrate-supabase-data.sh
./scripts/migrate-supabase-data.sh
```

### **Opção B: Manual (pg_dump/pg_restore)**

```bash
# 1. Backup do Cloud
pg_dump --clean --if-exists --no-owner --format=custom \
  --dbname "postgresql://user:pass@cloud-host:5432/db" \
  -f backup_cloud.pgcustom

# 2. Restaurar no Local
pg_restore --no-owner --role postgres \
  --dbname "postgresql://user:pass@localhost:5432/db" \
  backup_cloud.pgcustom
```

## 🔍 **VERIFICAÇÃO PÓS-MIGRAÇÃO**

### **Checklist de Validação**

- [ ] **Login/Cadastro**: Funciona no domínio local
- [ ] **Cursos**: Carregam corretamente
- [ ] **Vídeos**: Reproduzem sem erro
- [ ] **Quizzes**: Funcionam normalmente
- [ ] **Certificados**: Geram corretamente
- [ ] **Progresso**: Salva e carrega
- [ ] **Branding**: Configurações aplicam
- [ ] **Upload**: Funciona (local ou cloud)

### **Comandos de Verificação**

```bash
# Verificar tabelas principais
psql $LOCAL_DATABASE_URL -c "SELECT COUNT(*) FROM usuarios;"
psql $LOCAL_DATABASE_URL -c "SELECT COUNT(*) FROM cursos;"
psql $LOCAL_DATABASE_URL -c "SELECT COUNT(*) FROM videos;"

# Verificar buckets de storage
curl http://localhost:5000/storage/v1/bucket/list
```

## 🔄 **ROLLBACK (VOLTAR PARA CLOUD)**

### **Método Simples**

```bash
# 1. Alterar variável de ambiente
export PLATFORM_SUPABASE_MODE=cloud

# 2. Reiniciar aplicação
npm run dev:cloud
```

### **Verificar Rollback**

```bash
# Testar conexão Cloud
npm run test:supabase
```

## 🛠️ **TROUBLESHOOTING**

### **Problemas Comuns**

#### **1. Erro de Conexão Local**
```bash
# Verificar se Supabase Local está rodando
docker-compose -f docker-compose-supabase-local.yml ps

# Verificar logs
docker-compose -f docker-compose-supabase-local.yml logs postgres
```

#### **2. Erro de Autenticação**
```bash
# Verificar chaves no .env
echo $LOCAL_SUPABASE_ANON_KEY

# Regenerar chaves no Supabase Local
# Acessar http://localhost:3000 (Studio)
```

#### **3. Erro de Storage**
```bash
# Verificar permissões de volume
docker-compose -f docker-compose-supabase-local.yml exec storage ls -la /var/lib/storage

# Recriar buckets se necessário
curl -X POST http://localhost:5000/storage/v1/bucket \
  -H "Authorization: Bearer $LOCAL_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"training-videos","public":true}'
```

### **Logs Úteis**

```bash
# Logs do PostgreSQL
docker-compose -f docker-compose-supabase-local.yml logs postgres

# Logs do PostgREST
docker-compose -f docker-compose-supabase-local.yml logs postgrest

# Logs do Storage
docker-compose -f docker-compose-supabase-local.yml logs storage

# Logs do Auth
docker-compose -f docker-compose-supabase-local.yml logs auth
```

## 📚 **RECURSOS ADICIONAIS**

### **Documentação Supabase Local**
- [Supabase Self-Hosted](https://supabase.com/docs/guides/self-hosting)
- [Docker Compose Setup](https://github.com/supabase/supabase/tree/master/docker)

### **Scripts Úteis**

#### **Verificar Status dos Serviços**
```bash
#!/bin/bash
echo "🔍 Verificando serviços Supabase Local..."

services=("postgres:5432" "postgrest:3001" "storage:5000" "auth:9999" "meta:8080")

for service in "${services[@]}"; do
  host=$(echo $service | cut -d: -f1)
  port=$(echo $service | cut -d: -f2)
  
  if nc -z localhost $port; then
    echo "✅ $host:$port - OK"
  else
    echo "❌ $host:$port - FALHOU"
  fi
done
```

#### **Backup Automático**
```bash
#!/bin/bash
# Backup diário do banco local
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_local_$DATE.sql"

pg_dump $LOCAL_DATABASE_URL > "backups/$BACKUP_FILE"
echo "✅ Backup criado: backups/$BACKUP_FILE"
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Testar em ambiente de desenvolvimento**
2. **Migrar dados de produção**
3. **Configurar monitoramento**
4. **Documentar procedimentos de backup**
5. **Treinar equipe**

## 📞 **SUPORTE**

Se encontrar problemas:
1. Verificar logs dos containers
2. Executar script de teste de conexão
3. Verificar configuração de ambiente
4. Consultar documentação Supabase

---

**✅ Implementação concluída! O ERA Learn agora suporta Supabase Cloud e Local sem quebrar funcionalidades existentes.**



















