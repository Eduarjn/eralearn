#!/bin/bash

# ========================================
# ERA Learn - Script de Status
# ========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}🚀 ERA LEARN - STATUS DO SISTEMA${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Execute este script no diretório /opt/eralearn${NC}"
    exit 1
fi

# ========================================
# 1. STATUS DOS CONTAINERS
# ========================================
echo -e "${GREEN}📦 STATUS DOS CONTAINERS:${NC}"
docker-compose -f docker-compose.prod.yml ps
echo ""

# ========================================
# 2. USO DE RECURSOS
# ========================================
echo -e "${GREEN}💻 USO DE RECURSOS:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo ""

# ========================================
# 3. LOGS RECENTES
# ========================================
echo -e "${GREEN}📋 LOGS RECENTES:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=10
echo ""

# ========================================
# 4. STATUS DO SISTEMA
# ========================================
echo -e "${GREEN}🖥️ STATUS DO SISTEMA:${NC}"
echo "Uptime: $(uptime -p)"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')"
echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
echo ""

# ========================================
# 5. STATUS DO NGINX
# ========================================
echo -e "${GREEN}🌐 STATUS DO NGINX:${NC}"
sudo systemctl status nginx --no-pager -l
echo ""

# ========================================
# 6. STATUS DO SSL
# ========================================
echo -e "${GREEN}🔒 STATUS DO SSL:${NC}"
sudo certbot certificates
echo ""

# ========================================
# 7. CONECTIVIDADE
# ========================================
echo -e "${GREEN}🌍 TESTE DE CONECTIVIDADE:${NC}"

# Obter domínio do arquivo .env
if [ -f ".env" ]; then
    DOMAIN=$(grep "VITE_APP_URL" .env | cut -d'=' -f2 | sed 's|https://||' | sed 's|/||')
    if [ ! -z "$DOMAIN" ]; then
        echo "Testando HTTP:"
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN || echo "000")
        if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
            echo -e "  ✅ HTTP redirect: $HTTP_STATUS"
        else
            echo -e "  ❌ HTTP redirect: $HTTP_STATUS"
        fi
        
        echo "Testando HTTPS:"
        HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN || echo "000")
        if [ "$HTTPS_STATUS" = "200" ]; then
            echo -e "  ✅ HTTPS: $HTTPS_STATUS"
        else
            echo -e "  ❌ HTTPS: $HTTPS_STATUS"
        fi
        
        echo "Testando API:"
        API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/ || echo "000")
        if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
            echo -e "  ✅ API: $API_STATUS"
        else
            echo -e "  ❌ API: $API_STATUS"
        fi
    else
        echo "  ⚠️ Domínio não configurado no .env"
    fi
else
    echo "  ⚠️ Arquivo .env não encontrado"
fi
echo ""

# ========================================
# 8. BACKUP
# ========================================
echo -e "${GREEN}💾 STATUS DO BACKUP:${NC}"
if [ -d "/opt/backups/eralearn" ]; then
    BACKUP_COUNT=$(ls -1 /opt/backups/eralearn/ | wc -l)
    LAST_BACKUP=$(ls -t /opt/backups/eralearn/ | head -n1)
    echo "Backups disponíveis: $BACKUP_COUNT"
    echo "Último backup: $LAST_BACKUP"
else
    echo "  ⚠️ Diretório de backup não encontrado"
fi
echo ""

# ========================================
# 9. CRON JOBS
# ========================================
echo -e "${GREEN}⏰ TAREFAS AGENDADAS:${NC}"
crontab -l 2>/dev/null | grep -E "(backup|renew|eralearn)" || echo "  ⚠️ Nenhuma tarefa agendada encontrada"
echo ""

# ========================================
# 10. RESUMO
# ========================================
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}📊 RESUMO:${NC}"

# Contar containers rodando
RUNNING_CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps -q | xargs docker inspect -f '{{.State.Running}}' | grep -c true || echo "0")
TOTAL_CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps -q | wc -l)

echo "Containers: $RUNNING_CONTAINERS/$TOTAL_CONTAINERS rodando"

# Verificar se a aplicação está respondendo
if [ ! -z "$DOMAIN" ]; then
    if curl -s https://$DOMAIN > /dev/null; then
        echo -e "Aplicação: ${GREEN}✅ Online${NC}"
    else
        echo -e "Aplicação: ${RED}❌ Offline${NC}"
    fi
else
    echo -e "Aplicação: ${YELLOW}⚠️ Domínio não configurado${NC}"
fi

# Verificar SSL
if sudo certbot certificates | grep -q "VALID"; then
    echo -e "SSL: ${GREEN}✅ Válido${NC}"
else
    echo -e "SSL: ${RED}❌ Inválido${NC}"
fi

echo -e "${BLUE}==========================================${NC}"
echo ""
echo -e "${GREEN}🛠️ Comandos úteis:${NC}"
echo "  Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "  Backup: ./backup.sh"
echo "  Atualizar: ./update.sh"
echo ""
