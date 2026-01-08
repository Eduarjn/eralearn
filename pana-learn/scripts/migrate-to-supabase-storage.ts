#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// Configuração
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'videos';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

// Cliente Supabase com service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Schema para validação
const VideoSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  url_video: z.string(),
  provider: z.string().optional(),
  bucket: z.string().optional(),
  path: z.string().optional(),
  mime: z.string().optional(),
  size_bytes: z.number().optional(),
  duracao: z.number().optional(),
});

type Video = z.infer<typeof VideoSchema>;

interface MigrationOptions {
  dryRun: boolean;
  batchSize: number;
  skipExisting: boolean;
}

/**
 * Adaptadores para diferentes provedores de storage
 */
class StorageAdapter {
  static async downloadFromLocal(url: string): Promise<Buffer> {
    // TODO: Implementar download de arquivos locais
    throw new Error('Download local não implementado');
  }

  static async downloadFromS3(url: string): Promise<Buffer> {
    // TODO: Implementar download do S3
    // Requer configuração de credenciais AWS
    throw new Error('Download S3 não implementado');
  }

  static async downloadFromExternal(url: string): Promise<Buffer> {
    // Download genérico via HTTP
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao baixar arquivo: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
}

/**
 * Migra um vídeo individual para Supabase Storage
 */
async function migrateVideo(video: Video, options: MigrationOptions): Promise<boolean> {
  try {
    console.log(`📹 Processando: ${video.titulo} (${video.id})`);

    // Pular se já está no Supabase
    if (video.provider === 'supabase' && options.skipExisting) {
      console.log(`⏭️  Pulando (já no Supabase): ${video.titulo}`);
      return true;
    }

    // Determinar o provedor atual
    const currentProvider = video.provider || detectProvider(video.url_video);
    
    if (currentProvider === 'supabase') {
      console.log(`✅ Já está no Supabase: ${video.titulo}`);
      return true;
    }

    // Gerar novo path
    const newPath = generatePath(video);
    
    if (options.dryRun) {
      console.log(`🔍 [DRY RUN] Migraria: ${video.titulo}`);
      console.log(`   De: ${video.url_video}`);
      console.log(`   Para: ${newPath}`);
      console.log(`   Provedor: ${currentProvider} → supabase`);
      return true;
    }

    // Baixar arquivo do provedor atual
    console.log(`⬇️  Baixando de ${currentProvider}...`);
    const fileBuffer = await downloadFromProvider(video.url_video, currentProvider);

    // Upload para Supabase Storage
    console.log(`⬆️  Fazendo upload para Supabase...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(newPath, fileBuffer, {
        upsert: true,
        contentType: video.mime || 'video/mp4'
      });

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Atualizar registro no banco
    const updateData = {
      provider: 'supabase',
      bucket: SUPABASE_STORAGE_BUCKET,
      path: newPath,
      mime: video.mime || 'video/mp4',
      size_bytes: fileBuffer.length,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', video.id);

    if (updateError) {
      throw new Error(`Erro ao atualizar registro: ${updateError.message}`);
    }

    console.log(`✅ Migrado com sucesso: ${video.titulo}`);
    return true;

  } catch (error) {
    console.error(`❌ Erro ao migrar ${video.titulo}:`, error);
    return false;
  }
}

/**
 * Detecta o provedor baseado na URL
 */
function detectProvider(url: string): string {
  if (url.includes('supabase.co')) return 'supabase';
  if (url.includes('amazonaws.com') || url.includes('s3.')) return 's3';
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'external';
}

/**
 * Gera um path único para o arquivo
 */
function generatePath(video: Video): string {
  const timestamp = Date.now();
  const sanitizedTitle = video.titulo
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 50);
  
  const extension = getFileExtension(video.url_video) || 'mp4';
  
  return `migrated/${timestamp}_${sanitizedTitle}.${extension}`;
}

/**
 * Extrai extensão do arquivo da URL
 */
function getFileExtension(url: string): string | null {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1] : null;
}

/**
 * Baixa arquivo do provedor especificado
 */
async function downloadFromProvider(url: string, provider: string): Promise<Buffer> {
  switch (provider) {
    case 'local':
      return await StorageAdapter.downloadFromLocal(url);
    case 's3':
      return await StorageAdapter.downloadFromS3(url);
    case 'youtube':
      throw new Error('Vídeos do YouTube não precisam ser migrados');
    case 'external':
    default:
      return await StorageAdapter.downloadFromExternal(url);
  }
}

/**
 * Função principal de migração
 */
async function migrateToSupabaseStorage(options: MigrationOptions) {
  console.log('🚀 Iniciando migração para Supabase Storage...');
  console.log(`📊 Modo: ${options.dryRun ? 'DRY RUN' : 'EXECUÇÃO'}`);
  console.log(`📦 Bucket: ${SUPABASE_STORAGE_BUCKET}`);
  console.log(`📏 Batch size: ${options.batchSize}`);

  try {
    // Buscar vídeos que não estão no Supabase
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .neq('provider', 'supabase')
      .limit(options.batchSize);

    if (error) {
      throw new Error(`Erro ao buscar vídeos: ${error.message}`);
    }

    if (!videos || videos.length === 0) {
      console.log('✅ Nenhum vídeo para migrar!');
      return;
    }

    console.log(`📹 Encontrados ${videos.length} vídeos para migrar`);

    let successCount = 0;
    let errorCount = 0;

    // Processar em lotes
    for (const video of videos) {
      const isValid = VideoSchema.safeParse(video);
      if (!isValid.success) {
        console.error(`❌ Vídeo inválido: ${video.id}`, isValid.error);
        errorCount++;
        continue;
      }

      const success = await migrateVideo(isValid.data, options);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Pequena pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Resumo da migração:');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📹 Total: ${videos.length}`);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

/**
 * CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    dryRun: args.includes('--dry-run'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '10'),
    skipExisting: args.includes('--skip-existing')
  };

  if (args.includes('--help')) {
    console.log(`
Uso: tsx scripts/migrate-to-supabase-storage.ts [opções]

Opções:
  --dry-run          Executa sem fazer alterações (apenas simula)
  --batch-size=N     Número de vídeos para processar (padrão: 10)
  --skip-existing    Pula vídeos que já estão no Supabase
  --help             Mostra esta ajuda

Exemplos:
  tsx scripts/migrate-to-supabase-storage.ts --dry-run
  tsx scripts/migrate-to-supabase-storage.ts --batch-size=5
  tsx scripts/migrate-to-supabase-storage.ts --skip-existing
`);
    return;
  }

  await migrateToSupabaseStorage(options);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { migrateToSupabaseStorage, MigrationOptions };






















