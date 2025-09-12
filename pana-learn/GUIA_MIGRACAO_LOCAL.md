# 🏠 **GUIA COMPLETO - Migração para Ambiente Local**

## 🎯 **VISÃO GERAL**

Este guia explica como migrar toda a aplicação ERA Learn para rodar **completamente na mesma máquina**, sem depender do Supabase Cloud.

## 🏗️ **ARQUITETURA LOCAL**

### **✅ Componentes Locais**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   PostgreSQL    │    │   Nginx         │
│   (React/Vite)  │◄──►│   (Banco Local) │    │   (Arquivos)    │
│   Porta 8080    │    │   Porta 5432    │    │   Porta 80      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Upload Server   │
                    │ (Express.js)    │
                    │ Porta 3001      │
                    └─────────────────┘
```

### **✅ Estrutura de Pastas**
```
eralearn/
├── docker-compose-local.yml    # Configuração Docker
├── nginx.conf                  # Configuração Nginx
├── migrate-clean-strategy.sql  # Script de migração limpa
├── migrate-data-from-supabase.sql # Script para migrar dados existentes
├── uploads/                    # Uploads gerais
├── branding/                   # Logos, favicons
├── videos/                     # Vídeos dos cursos
├── database/                   # Dados PostgreSQL
└── public/                     # Arquivos estáticos
```

## 🚀 **PASSO A PASSO DA MIGRAÇÃO (SEM DUPLICAÇÃO)**

### **⚠️ ESTRATÉGIA ANTI-DUPLICAÇÃO**

**Opção A: Migração Limpa (Recomendada)**
- ✅ Cria ambiente local limpo
- ✅ Sem duplicação de dados
- ✅ Começa do zero localmente
- ✅ Mais seguro e simples

**Opção B: Migração com Dados Existentes**
- ⚠️ Requer backup manual do Supabase
- ⚠️ Conversão de URLs
- ⚠️ Verificação de integridade
- ⚠️ Mais complexo

### **✅ Passo 1: Preparar Ambiente**

```powershell
# Navegar para o projeto
cd "C:\Users\eduarjose\OneDrive\Desktop\trainig ERA\eralearn\pana-learn"

# Criar pastas necessárias
mkdir uploads, branding, videos, database, public

# Copiar arquivos estáticos
copy public\* public\
```

### **✅ Passo 2: Configurar Docker**

```powershell
# Usar o docker-compose local
docker-compose -f docker-compose-local.yml up -d postgres nginx
```

### **✅ Passo 3: Migrar Banco de Dados (SEM DUPLICAÇÃO)**

1. **Conectar ao PostgreSQL local:**
```bash
docker exec -it eralearn-postgres psql -U admin -d eralearn
```

2. **Executar script de migração LIMPA:**
```sql
-- Copie e cole o conteúdo de migrate-clean-strategy.sql
-- Este script cria ambiente limpo SEM duplicação
```

3. **Migrar dados existentes (OPCIONAL):**
```sql
-- Se quiser migrar dados do Supabase:
-- 1. Faça backup dos dados no Supabase
-- 2. Use migrate-data-from-supabase.sql
-- 3. Adapte os dados conforme necessário
```

### **✅ Passo 4: Configurar Aplicação**

```powershell
# Instalar dependências
npm install

# Configurar variáveis de ambiente
copy .env.example .env
```

**Editar `.env`:**
```bash
# Configurações locais
VITE_SUPABASE_URL=http://localhost:5432
VITE_SUPABASE_ANON_KEY=local-key
DATABASE_URL=postgresql://admin:senha123@localhost:5432/eralearn

# Upload local
VITE_VIDEO_UPLOAD_TARGET=local
VITE_BRANDING_UPLOAD_TARGET=local
VITE_API_BASE_URL=http://localhost:3001
VITE_STORAGE_BASE_URL=http://localhost
```

### **✅ Passo 5: Iniciar Serviços**

```powershell
# Iniciar todos os serviços
docker-compose -f docker-compose-local.yml up -d

# Verificar status
docker-compose -f docker-compose-local.yml ps
```

## 🚨 **COMO EVITAR DUPLICAÇÃO DE DADOS**

### **✅ Estratégia Recomendada: "Substituição Limpa"**

**1. Ambiente Único**
- ❌ **NÃO** manter Supabase + Local simultaneamente
- ✅ **SIM** migrar completamente para local
- ✅ **SIM** desativar Supabase após migração

**2. Processo de Migração**
```
Supabase (Ativo) → Backup → Local (Novo) → Supabase (Desativado)
```

**3. Controle de Versão**
- ✅ Dados sempre em um local apenas
- ✅ Sem conflitos de IDs
- ✅ Sem inconsistências
- ✅ Backup único e confiável

### **⚠️ O que NÃO fazer:**
- ❌ Manter dois ambientes ativos
- ❌ Sincronizar dados entre cloud e local
- ❌ Usar IDs duplicados
- ❌ Misturar URLs de diferentes fontes

### **✅ O que FAZER:**
- ✅ Escolher um ambiente (local ou cloud)
- ✅ Migrar completamente
- ✅ Desativar o ambiente antigo
- ✅ Manter backup de segurança

## 📊 **COMPARAÇÃO: CLOUD vs LOCAL**

### **☁️ Supabase Cloud (Atual)**
```
✅ Vantagens:
- Sem configuração de servidor
- Backup automático
- Escalabilidade automática
- Segurança gerenciada

❌ Desvantagens:
- Dependência de internet
- Custos mensais
- Dados em terceiros
- Limitações de upload
```

### **🏠 Ambiente Local (Proposto)**
```
✅ Vantagens:
- Controle total dos dados
- Sem custos mensais
- Funciona offline
- Sem limitações de upload
- Performance otimizada

❌ Desvantagens:
- Configuração inicial complexa
- Manutenção manual
- Backup manual
- Necessita infraestrutura
```

## 🔧 **CONFIGURAÇÕES ESPECÍFICAS**

### **1. URLs Locais**
```javascript
// Antes (Supabase)
logo_url: "https://supabase.com/storage/..."

// Depois (Local)
logo_url: "/media/branding/logo.png"
```

### **2. Upload de Arquivos**
```javascript
// Antes (Supabase Storage)
const { data } = await supabase.storage.upload(...)

// Depois (Local Server)
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

### **3. Banco de Dados**
```javascript
// Antes (Supabase)
const { data } = await supabase.from('table').select()

// Depois (Local PostgreSQL)
const { data } = await supabase.from('table').select()
// (Mesma API, banco local)
```

## 📋 **CHECKLIST DE MIGRAÇÃO**

### **✅ Infraestrutura**
- [ ] Docker instalado
- [ ] Docker Compose configurado
- [ ] Portas disponíveis (80, 5432, 3001, 8080)
- [ ] Espaço em disco suficiente

### **✅ Banco de Dados**
- [ ] PostgreSQL rodando
- [ ] Tabelas criadas
- [ ] Dados migrados
- [ ] Funções SQL criadas
- [ ] Índices criados

### **✅ Storage**
- [ ] Pastas criadas (uploads, branding, videos)
- [ ] Nginx configurado
- [ ] Permissões corretas
- [ ] URLs funcionando

### **✅ Aplicação**
- [ ] Variáveis de ambiente configuradas
- [ ] Upload server rodando
- [ ] Frontend funcionando
- [ ] Testes realizados

## 🎯 **TESTES PÓS-MIGRAÇÃO**

### **1. Teste de Banco**
```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables;

-- Testar branding
SELECT get_branding_config();
```

### **2. Teste de Upload**
```bash
# Testar upload de vídeo
curl -X POST http://localhost:3001/api/videos/upload-local \
  -F "file=@teste.mp4"

# Testar upload de branding
curl -X POST http://localhost:3001/api/branding/upload \
  -F "file=@logo.png"
```

### **3. Teste de Interface**
- [ ] Acessar `http://localhost:8080`
- [ ] Fazer login
- [ ] Upload de vídeo
- [ ] Configurar branding
- [ ] Verificar se arquivos aparecem

## 🔄 **MIGRAÇÃO REVERSA (Voltar para Cloud)**

Se precisar voltar para o Supabase:

1. **Exportar dados locais:**
```sql
-- Exportar dados
pg_dump -h localhost -U admin eralearn > backup_local.sql
```

2. **Importar no Supabase:**
```sql
-- No Supabase SQL Editor
-- Executar backup_local.sql
```

3. **Atualizar URLs:**
```javascript
// Voltar URLs para Supabase
logo_url: "https://supabase.com/storage/..."
```

## 🎉 **RESULTADO FINAL**

Após a migração completa:

- ✅ **Aplicação 100% local**
- ✅ **Dados na sua máquina**
- ✅ **Sem dependência de internet**
- ✅ **Sem custos mensais**
- ✅ **Controle total**
- ✅ **Performance otimizada**

---

**🏠 Sua aplicação ERA Learn rodará completamente na mesma máquina!**
