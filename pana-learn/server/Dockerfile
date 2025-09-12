FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório para vídeos
RUN mkdir -p /var/www/videos

# Expor porta
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["npm", "start"]



















