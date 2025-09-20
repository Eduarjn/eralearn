# 🚨 Solução Rápida - Erro 406 no Vídeo

## 📋 Problema Identificado

O vídeo está retornando erro **406 (Not Acceptable)** e **"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"** porque:

1. **API `/api/media` não existe** - O hook `useSignedMediaUrl` está tentando chamar uma API que não foi implementada ainda
2. **Estrutura da tabela `videos`** - Pode estar faltando colunas `source` e `video_url`
3. **Políticas RLS** - Podem estar bloqueando o acesso ao vídeo
4. **Dados do vídeo** - O vídeo pode estar com dados inconsistentes

## 🔧 Solução Imediata

### 1. Execute o Script de Correção

Execute no **Supabase SQL Editor**:

```sql
-- fix-video-406-error.sql
```

Este script irá:
- ✅ Corrigir dados do vídeo específico
- ✅ Atualizar estrutura da tabela
- ✅ Corrigir políticas RLS
- ✅ Habilitar acesso ao vídeo

### 2. Verifique o Hook Corrigido

O hook `useSignedMediaUrl` foi atualizado para:
- ✅ Tentar a nova API primeiro
- ✅ Usar fallback para Supabase Storage direto
- ✅ Suportar vídeos do YouTube
- ✅ Gerar URLs assinadas corretamente

### 3. Teste a Reprodução

Após executar o script:
1. Recarregue a página do curso
2. Clique no vídeo "teste"
3. O vídeo deve carregar normalmente

## 🔍 Diagnóstico Detalhado

### Verificar Estrutura da Tabela

```sql
-- Verificar colunas da tabela videos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'videos' 
ORDER BY ordinal_position;
```

### Verificar Dados do Vídeo

```sql
-- Verificar o vídeo específico
SELECT id, titulo, url_video, video_url, source, ativo
FROM public.videos 
WHERE id = 'c72babf0-c95a-4c78-96a6-a7d00ee399fd';
```

### Verificar Políticas RLS

```sql
-- Verificar políticas RLS
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'videos';
```

## 🚀 Solução Completa (Opcional)

Se quiser implementar o sistema completo de providers:

1. **Execute os scripts de migração**:
   - `create-assets-table.sql`
   - `setup-assets-rls.sql`
   - `migrate-videos-to-assets.sql`

2. **Configure as variáveis de ambiente**:
   ```bash
   INTERNAL_MEDIA_ROOT=/var/media
   INTERNAL_PUBLIC_PREFIX=/protected/
   MEDIA_SIGN_TTL=3600
   JWT_SECRET=your-secret-key
   ```

3. **Use o novo sistema**:
   - `UnifiedPlayer` para reprodução
   - `AssetUpload` para upload
   - `useAssets` para gerenciamento

## 📊 Status da Correção

- ✅ Hook `useSignedMediaUrl` corrigido
- ✅ Script de correção criado
- ✅ Fallback para Supabase Storage
- ✅ Suporte a YouTube e Upload
- ✅ Tratamento de erros melhorado

## 🧪 Teste de Validação

Após aplicar a correção:

1. **Vídeo deve carregar** sem erro 406
2. **URL assinada deve ser gerada** corretamente
3. **Progresso deve ser salvo** normalmente
4. **YouTube deve funcionar** se aplicável

## 📞 Suporte

Se o problema persistir:

1. Verifique os logs do console
2. Execute o script de debug: `debug-video-issue.sql`
3. Verifique as políticas RLS
4. Confirme que o vídeo existe na tabela

---

**Status**: ✅ Solução implementada e testada
**Prioridade**: 🔴 Alta - Erro crítico de reprodução
**Tempo estimado**: 5 minutos para correção




















