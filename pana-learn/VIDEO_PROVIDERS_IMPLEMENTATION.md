# 🎥 Implementação de Providers de Vídeo

## 📋 Resumo

Esta implementação migra a plataforma para um sistema de providers de vídeo que **não armazena arquivos no Supabase Storage**. O Supabase (Postgres/Auth) agora guarda apenas metadados e links, com dois providers suportados:

- **internal**: Arquivos hospedados no servidor próprio (NGINX/MinIO/S3-compatível)
- **youtube**: Vídeos hospedados no YouTube com parâmetros que reduzem o branding

## 🏗️ Arquitetura

### Fluxo de Dados

```
Frontend → API /api/media → Supabase (metadados) → Provider específico
                                    ↓
                            ┌─────────────────┐
                            │   YouTube API   │
                            │   (embed URLs)  │
                            └─────────────────┘
                                    ↓
                            ┌─────────────────┐
                            │  Servidor Local │
                            │  (X-Accel-Redirect) │
                            └─────────────────┘
```

### Componentes Principais

1. **Tabela `assets`**: Metadados e links dos vídeos
2. **API `/api/media`**: Resolve assets e gera URLs de reprodução
3. **API `/api/stream`**: X-Accel-Redirect para vídeos internos
4. **UnifiedPlayer**: Componente React unificado para ambos providers
5. **AssetUpload**: Interface para cadastrar vídeos

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# INTERNAL provider (escolha 1 abordagem):
# A) NGINX/X-Accel (arquivos locais):
INTERNAL_MEDIA_ROOT=/var/media          # pasta real no servidor
INTERNAL_PUBLIC_PREFIX=/protected/      # location interno no NGINX

# B) S3/MinIO (opcional):
S3_ENDPOINT=...
S3_REGION=auto
S3_BUCKET=my-videos
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# TTL das URLs assinadas (segundos)
MEDIA_SIGN_TTL=3600
JWT_SECRET=your-jwt-secret-key
```

### NGINX Configuration (para provider internal)

```nginx
# Configuração para X-Accel-Redirect
location /protected/ {
  internal;
  alias /var/media/;           # corresponde ao INTERNAL_MEDIA_ROOT
  add_header Accept-Ranges bytes;
  add_header Cache-Control "public, max-age=3600";
}
```

## 📊 Estrutura do Banco

### Tabela `assets`

```sql
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('internal', 'youtube')),
  
  -- Para YouTube:
  youtube_id TEXT,
  youtube_url TEXT,
  
  -- Para Internal:
  bucket TEXT,           -- se usar S3/MinIO
  path TEXT,             -- caminho/chave do arquivo
  mime TEXT,
  size_bytes BIGINT,
  duration_seconds INTEGER,
  
  -- Metadados comuns:
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  
  -- Controle:
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Relacionamento com `videos`

```sql
-- Adicionar coluna asset_id na tabela videos
ALTER TABLE public.videos 
ADD COLUMN asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL;
```

## 🔐 Segurança

### Row Level Security (RLS)

```sql
-- Política para SELECT: Usuários podem ver assets se estão matriculados
CREATE POLICY "read assets if enrolled" ON public.assets
FOR SELECT USING (
  ativo = true AND (
    EXISTS (
      SELECT 1 FROM public.videos v
      JOIN public.cursos c ON c.id = v.curso_id
      JOIN public.matriculas m ON m.curso_id = c.id AND m.usuario_id = auth.uid()
      WHERE v.asset_id = assets.id
    )
  )
);

-- Políticas para administradores: INSERT, UPDATE, DELETE
CREATE POLICY "admin can insert assets" ON public.assets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND tipo_usuario IN ('admin', 'admin_master')
  )
);
```

### URLs Assinadas

- **YouTube**: URLs embed com parâmetros `modestbranding=1&rel=0&iv_load_policy=3`
- **Internal**: JWT tokens com TTL configurável para X-Accel-Redirect

## 🎮 Uso no Frontend

### Hook `useAssets`

```typescript
import { useAssets } from '@/hooks/useAssets';

const { getVideoSource, createYouTubeAsset, createInternalAsset } = useAssets();

// Obter fonte do vídeo
const source = await getVideoSource(assetId);

// Criar asset do YouTube
const asset = await createYouTubeAsset('https://youtube.com/watch?v=...', 'Título');
```

### Componente `UnifiedPlayer`

```typescript
import UnifiedPlayer from '@/components/UnifiedPlayer';

<UnifiedPlayer 
  source={source} 
  onProgress={(current, duration) => console.log('Progress:', current, duration)}
  onEnded={() => console.log('Vídeo finalizado')}
/>
```

### Componente `AssetUpload`

```typescript
import { AssetUpload } from '@/components/AssetUpload';

<AssetUpload 
  onClose={() => setShowUpload(false)}
  onSuccess={() => {
    setShowUpload(false);
    fetchVideos(); // Recarregar lista
  }}
  preSelectedCourseId={courseId}
/>
```

## 📁 Estrutura de Arquivos

```
src/
├── app/api/
│   ├── media/route.ts          # Resolve assets e gera URLs
│   └── stream/route.ts         # X-Accel-Redirect para vídeos internos
├── components/
│   ├── UnifiedPlayer.tsx       # Player unificado
│   └── AssetUpload.tsx         # Interface de upload
├── hooks/
│   └── useAssets.ts           # Hook para gerenciar assets
└── lib/
    ├── supabaseBrowser.ts     # Cliente browser
    └── supabaseAdmin.ts       # Cliente admin (server-only)
```

## 🚀 Migração

### Script de Migração

Execute `migrate-videos-to-assets.sql` no Supabase SQL Editor:

1. Cria assets para vídeos do YouTube existentes
2. Cria assets para vídeos internos existentes  
3. Atualiza tabela `videos` para referenciar `assets`
4. Verifica integridade da migração

### Ordem de Execução

1. **Criar tabela assets**: `create-assets-table.sql`
2. **Configurar RLS**: `setup-assets-rls.sql`
3. **Migrar dados**: `migrate-videos-to-assets.sql`
4. **Testar funcionalidade**
5. **Atualizar frontend** (opcional - manter compatibilidade)

## 🧪 Testes

### Cenários de Teste

1. **Usuário matriculado acessa aula**:
   - `/api/media?id=<asset_id>` retorna `{kind:'internal', url:...}` ou `{kind:'youtube', url:...}`
   - Vídeo reproduz corretamente

2. **Vídeo internal**:
   - URL assinada funciona
   - Suporta seek (Accept-Ranges)
   - URL expira conforme `MEDIA_SIGN_TTL`

3. **Vídeo YouTube**:
   - Carrega com UI padronizada
   - Parâmetros `modestbranding` aplicados
   - Logo discreto (limitação da API)

4. **Sem matrícula**:
   - Retorna 403/401
   - Não expõe URLs

5. **Segurança**:
   - Nenhuma chave sensível no client
   - JWT tokens com TTL
   - RLS policies ativas

## 🔄 Limitações e Considerações

### YouTube

- **Branding**: Logo do YouTube pode aparecer discretamente (limitação da API)
- **Controles**: Limitados aos controles nativos do YouTube
- **Qualidade**: Dependente da qualidade do vídeo original

### Internal

- **Armazenamento**: Requer espaço no servidor
- **Bandwidth**: Consome largura de banda do servidor
- **Manutenção**: Backup e gerenciamento de arquivos

### Geral

- **Migração**: Dados existentes precisam ser migrados
- **Compatibilidade**: Frontend antigo pode precisar de ajustes
- **Monitoramento**: Logs de acesso e performance

## 📈 Benefícios

1. **Custo**: Redução de custos de storage no Supabase
2. **Performance**: Streaming otimizado com NGINX
3. **Controle**: Controle total sobre vídeos internos
4. **Flexibilidade**: Suporte a múltiplos providers
5. **Segurança**: URLs assinadas e RLS policies
6. **Escalabilidade**: Fácil adição de novos providers

## 🛠️ Manutenção

### Monitoramento

- Logs de acesso aos vídeos
- Performance do streaming
- Uso de storage interno
- Erros de autenticação/autorização

### Backup

- Backup dos arquivos de vídeo internos
- Backup dos metadados no Supabase
- Teste de restauração periódico

### Atualizações

- Manutenção do NGINX
- Atualizações de segurança
- Otimizações de performance
- Novos providers conforme necessário

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do servidor
2. Testar URLs diretamente
3. Validar configurações de ambiente
4. Verificar políticas RLS
5. Consultar documentação do Supabase

**Status**: ✅ Implementação completa e funcional














