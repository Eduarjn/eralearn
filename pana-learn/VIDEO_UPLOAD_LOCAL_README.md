# 🎥 Sistema de Upload Local de Vídeos - ERA Learn

## 📋 **Visão Geral**

Implementação de upload local de vídeos como alternativa ao Supabase Storage, mantendo total compatibilidade com o sistema existente.

### **✅ Características**
- **Não-intrusivo**: Não quebra o fluxo atual do Supabase
- **Configurável**: Switch simples via variável de ambiente
- **Compatível**: Mesmo contrato para o player de vídeo
- **Auditável**: Registra o provedor de cada vídeo

## 🚀 **Configuração Rápida**

### **1. Variáveis de Ambiente**

Adicione ao seu `.env`:

```bash
# Flag global do alvo de upload
VIDEO_UPLOAD_TARGET=supabase   # supabase | local

# Somente se usar 'local'
VIDEO_LOCAL_DIR=/var/www/videos
VIDEO_PUBLIC_BASE=/media/videos
VIDEO_MAX_UPLOAD_MB=1024

# Frontend (expostas via Vite)
VITE_VIDEO_UPLOAD_TARGET=${VIDEO_UPLOAD_TARGET}
VITE_VIDEO_MAX_UPLOAD_MB=${VIDEO_MAX_UPLOAD_MB}
```

### **2. Executar com Docker**

```bash
# Com Supabase (padrão)
docker-compose up

# Com upload local
docker-compose --profile upload-local up
```

### **3. Executar sem Docker**

```bash
# Frontend
cd pana-learn
npm run dev

# Servidor de upload (em outro terminal)
cd pana-learn/server
npm install
npm run dev
```

## 🔧 **Arquivos Implementados**

### **Frontend**
- `src/lib/videoStorage.ts` - Camada utilitária unificada
- `src/components/VideoUpload.tsx` - Atualizado para usar nova camada
- Badge discreta mostrando target atual

### **Backend**
- `server/index.ts` - Servidor Express para upload local
- `server/package.json` - Dependências do servidor
- `server/Dockerfile` - Containerização

### **Infraestrutura**
- `docker-compose.yml` - Atualizado com servidor opcional
- `env.example` - Variáveis de ambiente
- `add-video-provider-column.sql` - Auditoria (opcional)

## 📊 **Fluxo de Funcionamento**

### **Com VIDEO_UPLOAD_TARGET=supabase**
```
1. Usuário seleciona arquivo
2. uploadVideo() → uploadToSupabase()
3. Arquivo vai para Supabase Storage
4. URL pública retornada
5. Vídeo salvo no banco com provedor='supabase'
```

### **Com VIDEO_UPLOAD_TARGET=local**
```
1. Usuário seleciona arquivo
2. uploadVideo() → uploadToLocal()
3. POST /api/videos/upload-local
4. Arquivo salvo em /var/www/videos/
5. URL pública retornada (/media/videos/...)
6. Vídeo salvo no banco com provedor='local'
```

## 🎯 **Compatibilidade**

### **Player de Vídeo**
- ✅ **Não alterado**: Continua usando `video.url_video`
- ✅ **Mesmo contrato**: URL pública válida
- ✅ **Seek funcionando**: Headers Range configurados
- ✅ **Progresso**: Sistema de progresso inalterado

### **Interface**
- ✅ **UX inalterada**: Mesmas abas (Upload/YouTube)
- ✅ **Badge informativa**: Mostra target atual
- ✅ **Validações**: Mesmas validações de arquivo
- ✅ **Feedback**: Mesmos toasts de sucesso/erro

## 🔒 **Segurança**

### **Validações**
- ✅ **Tipos permitidos**: mp4, webm, avi, mov, mkv
- ✅ **Tamanho máximo**: Configurável via env
- ✅ **Sanitização**: Nomes de arquivo limpos
- ✅ **Headers**: Content-Type correto

### **Acesso**
- ✅ **Público**: URLs acessíveis como Supabase
- ✅ **Cache**: Headers de cache configurados
- ✅ **Range**: Suporte a seek de vídeo

## 📈 **Performance**

### **Otimizações**
- ✅ **Streaming**: Headers Accept-Ranges
- ✅ **Cache**: Cache-Control configurado
- ✅ **Compressão**: Nginx pode comprimir
- ✅ **CDN**: Fácil migração para CDN

### **Monitoramento**
- ✅ **Health check**: `/api/health`
- ✅ **Logs**: Console logs detalhados
- ✅ **Métricas**: Tamanho e tipo de arquivo

## 🔄 **Migração**

### **De Supabase para Local**
```bash
# 1. Configurar variáveis
VIDEO_UPLOAD_TARGET=local

# 2. Iniciar servidor
docker-compose --profile upload-local up

# 3. Testar upload
# Novos vídeos vão para local
```

### **De Local para Supabase**
```bash
# 1. Voltar configuração
VIDEO_UPLOAD_TARGET=supabase

# 2. Reiniciar aplicação
# Novos vídeos voltam para Supabase
```

### **Vídeos Existentes**
- ✅ **Continuam funcionando**: URLs permanecem válidas
- ✅ **Auditoria**: Coluna `provedor` registra origem
- ✅ **Migração**: Pode migrar arquivos se necessário

## 🛠️ **Desenvolvimento**

### **Estrutura de Diretórios**
```
pana-learn/
├── src/
│   ├── lib/
│   │   └── videoStorage.ts      # Camada utilitária
│   └── components/
│       └── VideoUpload.tsx      # Componente atualizado
├── server/
│   ├── index.ts                 # Servidor Express
│   ├── package.json             # Dependências
│   └── Dockerfile               # Container
└── videos/                      # Diretório de vídeos (criado automaticamente)
```

### **Scripts Úteis**
```bash
# Desenvolvimento
npm run dev                      # Frontend
cd server && npm run dev         # Servidor

# Produção
docker-compose up                # Supabase
docker-compose --profile upload-local up  # Local

# Testes
curl http://localhost:3001/api/health      # Health check
```

## 🐛 **Troubleshooting**

### **Problemas Comuns**

#### **Upload falha**
```bash
# Verificar servidor
curl http://localhost:3001/api/health

# Verificar diretório
ls -la /var/www/videos/

# Verificar logs
docker logs eralearn-upload-server
```

#### **Vídeo não reproduz**
```bash
# Verificar URL
curl -I /media/videos/videos/1234567890_video.mp4

# Verificar headers
curl -H "Range: bytes=0-" /media/videos/videos/1234567890_video.mp4
```

#### **Tamanho de arquivo**
```bash
# Verificar limite
echo $VIDEO_MAX_UPLOAD_MB

# Aumentar se necessário
VIDEO_MAX_UPLOAD_MB=2048
```

## 📝 **Changelog**

### **v1.0.0** - Implementação Inicial
- ✅ Camada utilitária `videoStorage.ts`
- ✅ Servidor Express para upload local
- ✅ Integração com VideoUpload.tsx
- ✅ Configuração via variáveis de ambiente
- ✅ Badge informativa do target
- ✅ Auditoria de provedor (opcional)
- ✅ Docker Compose atualizado
- ✅ Documentação completa

## 🎯 **Próximos Passos**

### **Melhorias Futuras**
- [ ] **CDN Integration**: Fácil migração para CDN
- [ ] **Compressão**: Compressão automática de vídeos
- [ ] **Thumbnails**: Geração automática de thumbnails
- [ ] **Transcoding**: Conversão de formatos
- [ ] **Backup**: Sistema de backup automático
- [ ] **Métricas**: Dashboard de uso de storage

### **Escalabilidade**
- [ ] **Load Balancer**: Múltiplos servidores
- [ ] **Object Storage**: S3/MinIO integration
- [ ] **Cache**: Redis para cache de metadados
- [ ] **Queue**: Processamento assíncrono

---

**✅ Sistema implementado e testado com sucesso!**



















