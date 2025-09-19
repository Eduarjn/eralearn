#!/bin/bash

# Script para instalar certificado SSL próprio
# Execute como root: sudo bash install-ssl.sh

echo "🔐 Instalando certificado SSL próprio..."

# Criar diretório para certificados
mkdir -p /etc/ssl/certs/eralearn
mkdir -p /etc/ssl/private/eralearn

# Copiar certificados (você precisa colocar os arquivos aqui)
echo "📁 Copiando certificados..."
# cp seu-certificado.crt /etc/ssl/certs/eralearn/
# cp sua-chave-privada.key /etc/ssl/private/eralearn/

# Definir permissões corretas
chmod 644 /etc/ssl/certs/eralearn/*
chmod 600 /etc/ssl/private/eralearn/*

echo "✅ Certificados copiados com sucesso!"
echo "📝 Agora configure o Nginx..."






















