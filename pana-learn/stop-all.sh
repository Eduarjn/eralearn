#!/bin/bash

echo "=== PARANDO SISTEMA PANA-LEARN ==="

# Parar processos usando PIDs salvos
if [ -f "logs/upload-server.pid" ]; then
    UPLOAD_PID=$(cat logs/upload-server.pid)
    kill $UPLOAD_PID 2>/dev/null && echo "Servidor de upload parado (PID: $UPLOAD_PID)"
    rm -f logs/upload-server.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo "Frontend parado (PID: $FRONTEND_PID)"
    rm -f logs/frontend.pid
fi

# Garantir que todos os processos sejam finalizados
pkill -f "video-upload-server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "Sistema parado completamente."
