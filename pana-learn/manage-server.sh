#!/bin/bash

# Script para gerenciar o servidor de upload de vídeos
# Uso: ./manage-server.sh [start|stop|restart|status|logs]

SERVER_PORT=3001
SERVER_NAME="video-upload-server.js"
LOG_FILE="/opt/eralearn/pana-learn/video-server.log"

case "$1" in
    "start")
        echo "Iniciando servidor de upload..."
        if pgrep -f "$SERVER_NAME" > /dev/null; then
            echo "AVISO: Servidor já está rodando na porta $SERVER_PORT"
            echo "Use './manage-server.sh status' para verificar"
        else
            cd /opt/eralearn/pana-learn
            nohup node video-upload-server.js > "$LOG_FILE" 2>&1 &
            sleep 2
            if pgrep -f "$SERVER_NAME" > /dev/null; then
                echo "Servidor iniciado com sucesso na porta $SERVER_PORT"
                echo "Logs: tail -f $LOG_FILE"
            else
                echo "ERRO: Falha ao iniciar o servidor"
            fi
        fi
        ;;
    
    "stop")
        echo "Parando servidor de upload..."
        if pgrep -f "$SERVER_NAME" > /dev/null; then
            pkill -f "$SERVER_NAME"
            sleep 2
            if ! pgrep -f "$SERVER_NAME" > /dev/null; then
                echo "Servidor parado com sucesso"
            else
                echo "ERRO: Falha ao parar o servidor"
            fi
        else
            echo "Servidor não está rodando"
        fi
        ;;
    
    "restart")
        echo "Reiniciando servidor..."
        $0 stop
        sleep 3
        $0 start
        ;;
    
    "status")
        echo "Verificando status do servidor..."
        if pgrep -f "$SERVER_NAME" > /dev/null; then
            PID=$(pgrep -f "$SERVER_NAME")
            echo "STATUS: Servidor RODANDO (PID: $PID)"
            echo "PORTA: $SERVER_PORT"
            echo "TESTE: curl http://138.59.144.162:$SERVER_PORT/health"
            
            # Teste rápido de conectividade
            if curl -s http://localhost:$SERVER_PORT/health > /dev/null; then
                echo "CONECTIVIDADE: OK"
            else
                echo "CONECTIVIDADE: FALHA"
            fi
        else
            echo "STATUS: Servidor PARADO"
        fi
        ;;
    
    "logs")
        echo "Mostrando logs do servidor (Ctrl+C para sair)..."
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "Arquivo de log não encontrado: $LOG_FILE"
        fi
        ;;
    
    "test")
        echo "Testando API do servidor..."
        echo "1. Health Check:"
        curl -s http://138.59.144.162:$SERVER_PORT/health || echo "FALHA"
        echo -e "\n\n2. Lista de vídeos:"
        curl -s http://138.59.144.162:$SERVER_PORT/api/videos/list || echo "FALHA"
        ;;
    
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|test}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia o servidor"
        echo "  stop    - Para o servidor"
        echo "  restart - Reinicia o servidor"
        echo "  status  - Mostra status atual"
        echo "  logs    - Mostra logs em tempo real"
        echo "  test    - Testa a API"
        echo ""
        echo "Exemplo: ./manage-server.sh status"
        exit 1
        ;;
esac
