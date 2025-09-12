#!/bin/bash

# ========================================
# SCRIPT DE MIGRAÇÃO: SUPABASE CLOUD → LOCAL
# ========================================
#
# Este script migra dados do Supabase Cloud para uma instância local
# 
# PRÉ-REQUISITOS:
# - PostgreSQL client (psql, pg_dump, pg_restore)
# - Acesso ao banco Cloud (DATABASE_URL)
# - Acesso ao banco Local (LOCAL_DATABASE_URL)
# - Supabase CLI configurado
#
# USO:
# ./scripts/migrate-supabase-data.sh
#

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar variáveis de ambiente
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL não configurada (Supabase Cloud)"
    exit 1
fi

if [ -z "$LOCAL_DATABASE_URL" ]; then
    error "LOCAL_DATABASE_URL não configurada (Supabase Local)"
    exit 1
fi

# Timestamp para backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
DUMP_FILE="$BACKUP_DIR/supabase_cloud_dump_$TIMESTAMP.pgcustom"

log "🚀 Iniciando migração Supabase Cloud → Local"
log "📅 Timestamp: $TIMESTAMP"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

# ========================================
# PASSO 1: BACKUP DO CLOUD
# ========================================

log "📤 Fazendo backup do Supabase Cloud..."

if ! pg_dump --clean --if-exists --no-owner --format=custom \
    --dbname "$DATABASE_URL" \
    --file "$DUMP_FILE"; then
    error "Falha ao fazer backup do Cloud"
    exit 1
fi

log "✅ Backup criado: $DUMP_FILE"
log "📊 Tamanho do backup: $(du -h "$DUMP_FILE" | cut -f1)"

# ========================================
# PASSO 2: RESTAURAR NO LOCAL
# ========================================

log "📥 Restaurando no Supabase Local..."

if ! pg_restore --no-owner --role postgres \
    --dbname "$LOCAL_DATABASE_URL" \
    "$DUMP_FILE"; then
    error "Falha ao restaurar no Local"
    exit 1
fi

log "✅ Dados restaurados no Local"

# ========================================
# PASSO 3: MIGRAR STORAGE (OPCIONAL)
# ========================================

if [ "$MIGRATE_STORAGE" = "true" ]; then
    log "🗂️  Migrando storage..."
    
    # Listar buckets do Cloud
    CLOUD_BUCKETS=$(supabase storage list --project-ref "$SUPABASE_PROJECT_REF" 2>/dev/null || echo "")
    
    if [ -n "$CLOUD_BUCKETS" ]; then
        for bucket in $CLOUD_BUCKETS; do
            log "📦 Migrando bucket: $bucket"
            
            # Criar bucket no Local se não existir
            supabase storage create-bucket "$bucket" --local 2>/dev/null || true
            
            # Listar arquivos do bucket
            FILES=$(supabase storage list "$bucket" --project-ref "$SUPABASE_PROJECT_REF" 2>/dev/null || echo "")
            
            for file in $FILES; do
                log "📄 Migrando arquivo: $bucket/$file"
                
                # Download do Cloud
                supabase storage download "$bucket/$file" --project-ref "$SUPABASE_PROJECT_REF" --local
                
                # Upload para Local
                supabase storage upload "$bucket/$file" --local
            done
        done
    else
        warn "Nenhum bucket encontrado ou erro ao listar buckets"
    fi
else
    info "Pular migração de storage (MIGRATE_STORAGE != true)"
fi

# ========================================
# PASSO 4: VERIFICAÇÃO
# ========================================

log "🔍 Verificando migração..."

# Verificar tabelas principais
TABLES=("branding_config" "usuarios" "cursos" "videos" "video_progress")

for table in "${TABLES[@]}"; do
    COUNT=$(psql "$LOCAL_DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs)
    if [ "$COUNT" -ge 0 ]; then
        log "✅ Tabela $table: $COUNT registros"
    else
        warn "⚠️  Tabela $table: erro ao contar registros"
    fi
done

# ========================================
# PASSO 5: LIMPEZA
# ========================================

if [ "$KEEP_BACKUP" != "true" ]; then
    log "🧹 Removendo arquivo de backup..."
    rm -f "$DUMP_FILE"
    log "✅ Backup removido"
else
    log "💾 Backup mantido: $DUMP_FILE"
fi

# ========================================
# CONCLUSÃO
# ========================================

log "🎉 Migração concluída com sucesso!"
log "📋 Próximos passos:"
log "   1. Verificar se o Supabase Local está rodando"
log "   2. Testar login/cadastro no Local"
log "   3. Verificar se vídeos e imagens carregam"
log "   4. Testar funcionalidades principais"

info "🔗 URLs para testar:"
info "   - Local: http://localhost:8000"
info "   - Frontend: http://localhost:8080"

log "✅ Migração finalizada!"



















