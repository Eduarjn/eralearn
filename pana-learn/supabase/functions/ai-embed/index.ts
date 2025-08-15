// ========================================
// EDGE FUNCTION: AI Embed
// ========================================
// Feature Flag: FEATURE_AI=true
// Descrição: Ingestão e indexação de documentos para RAG

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmbedRequest {
  source_id: string;
  content: string;
  metadata?: Record<string, any>;
  chunk_size?: number;
  chunk_overlap?: number;
}

interface EmbedResponse {
  success: boolean;
  chunks_created: number;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar feature flag
    if (Deno.env.get('FEATURE_AI') !== 'true') {
      return new Response(
        JSON.stringify({ error: 'Módulo de IA não está habilitado' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação necessário' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extrair token do header
    const token = authHeader.replace('Bearer ', '')
    
    // Verificar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obter dados da requisição
    const { source_id, content, metadata = {}, chunk_size = 1000, chunk_overlap = 200 }: EmbedRequest = await req.json()

    if (!source_id || !content?.trim()) {
      return new Response(
        JSON.stringify({ error: 'source_id e content são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se a fonte de conhecimento existe e pertence ao usuário
    const { data: knowledgeSource, error: sourceError } = await supabase
      .from('ai_knowledge_sources')
      .select(`
        *,
        ai_assistants!inner(
          org_id,
          user_organizations!inner(
            user_id
          )
        )
      `)
      .eq('id', source_id)
      .eq('ai_assistants.user_organizations.user_id', user.id)
      .single()

    if (sourceError || !knowledgeSource) {
      return new Response(
        JSON.stringify({ error: 'Fonte de conhecimento não encontrada' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Atualizar status para indexando
    await supabase
      .from('ai_knowledge_sources')
      .update({ 
        status: 'indexing',
        updated_at: new Date().toISOString()
      })
      .eq('id', source_id)

    try {
      // Gerar chunks do conteúdo
      const chunks = generateChunks(content, chunk_size, chunk_overlap)
      
      // Obter provedor para embeddings
      const { data: provider } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('org_id', knowledgeSource.ai_assistants.org_id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!provider) {
        throw new Error('Nenhum provedor de IA configurado')
      }

      // Obter chave do provedor
      const { data: providerKey } = await supabase
        .from('ai_provider_keys')
        .select('*')
        .eq('provider_id', provider.id)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!providerKey) {
        throw new Error('Nenhuma chave de API configurada')
      }

      // Descriptografar chave (simulação)
      const apiKey = providerKey.key_ciphertext

      // Limpar chunks existentes para esta fonte
      await supabase
        .from('ai_chunks')
        .delete()
        .eq('source_id', source_id)

      // Processar cada chunk
      const chunkPromises = chunks.map(async (chunk, index) => {
        try {
          // Gerar embedding
          const embedding = await generateEmbedding(chunk, provider.provider, apiKey, provider.api_base)
          
          // Salvar chunk com embedding
          const { error: insertError } = await supabase
            .from('ai_chunks')
            .insert({
              source_id,
              content: chunk,
              embedding,
              metadata: {
                ...metadata,
                chunk_index: index,
                chunk_size: chunk.length,
                created_at: new Date().toISOString()
              }
            })

          if (insertError) {
            console.error(`Erro ao salvar chunk ${index}:`, insertError)
            return false
          }

          return true
        } catch (error) {
          console.error(`Erro ao processar chunk ${index}:`, error)
          return false
        }
      })

      // Aguardar todos os chunks serem processados
      const results = await Promise.all(chunkPromises)
      const successfulChunks = results.filter(Boolean).length

      // Atualizar status da fonte
      const finalStatus = successfulChunks > 0 ? 'completed' : 'error'
      await supabase
        .from('ai_knowledge_sources')
        .update({ 
          status: finalStatus,
          indexed_at: finalStatus === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', source_id)

      const response: EmbedResponse = {
        success: successfulChunks > 0,
        chunks_created: successfulChunks,
        error: successfulChunks === 0 ? 'Falha ao processar chunks' : undefined
      }

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (error) {
      // Atualizar status para erro
      await supabase
        .from('ai_knowledge_sources')
        .update({ 
          status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', source_id)

      throw error
    }

  } catch (error) {
    console.error('Erro no embedding:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        chunks_created: 0,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Função para gerar chunks de texto
function generateChunks(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const chunks: string[] = []
  const words = text.split(/\s+/)
  
  if (words.length <= chunkSize) {
    return [text]
  }

  let start = 0
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length)
    const chunk = words.slice(start, end).join(' ')
    chunks.push(chunk)
    
    start = end - chunkOverlap
    if (start >= words.length) break
  }

  return chunks
}

// Função para gerar embedding
async function generateEmbedding(
  text: string, 
  provider: string, 
  apiKey: string, 
  apiBase?: string
): Promise<number[]> {
  const baseUrl = apiBase || getProviderBaseUrl(provider)
  
  const response = await fetch(`${baseUrl}/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: getEmbeddingModel(provider)
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro na API de embedding ${provider}: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

// Obter URL base do provedor
function getProviderBaseUrl(provider: string): string {
  const urls = {
    openai: 'https://api.openai.com',
    azure: 'https://api.openai.com',
    openrouter: 'https://openrouter.ai/api'
  }
  return urls[provider as keyof typeof urls] || urls.openai
}

// Obter modelo de embedding
function getEmbeddingModel(provider: string): string {
  const models = {
    openai: 'text-embedding-ada-002',
    azure: 'text-embedding-ada-002',
    openrouter: 'text-embedding-ada-002'
  }
  return models[provider as keyof typeof models] || models.openai
}
