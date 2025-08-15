// ========================================
// EDGE FUNCTION: AI Chat
// ========================================
// Feature Flag: FEATURE_AI=true
// Descrição: Proxy de chat para IA com RAG

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string;
  session_id?: string;
  assistant_id?: string;
  use_rag?: boolean;
  context?: {
    course_id?: string;
    user_context?: string;
  };
}

interface ChatResponse {
  message: string;
  session_id: string;
  message_id: string;
  tokens_prompt: number;
  tokens_completion: number;
  cost_usd: number;
  sources?: Array<{
    content: string;
    source: string;
    score: number;
  }>;
  usage: {
    total_tokens: number;
    total_cost: number;
  };
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
    const { message, session_id, assistant_id, use_rag = false, context }: ChatRequest = await req.json()

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obter organização do usuário
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!userOrg) {
      return new Response(
        JSON.stringify({ error: 'Usuário não pertence a uma organização' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const orgId = userOrg.organization_id

    // Obter assistente padrão se não especificado
    let assistantId = assistant_id
    if (!assistantId) {
      const { data: defaultAssistant } = await supabase
        .from('ai_assistants')
        .select('id')
        .eq('org_id', orgId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!defaultAssistant) {
        return new Response(
          JSON.stringify({ error: 'Nenhum assistente configurado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      assistantId = defaultAssistant.id
    }

    // Obter configuração do assistente
    const { data: assistant } = await supabase
      .from('ai_assistants')
      .select('*')
      .eq('id', assistantId)
      .eq('org_id', orgId)
      .single()

    if (!assistant) {
      return new Response(
        JSON.stringify({ error: 'Assistente não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obter provedor ativo
    const { data: provider } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('org_id', orgId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Nenhum provedor de IA configurado' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
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
      return new Response(
        JSON.stringify({ error: 'Nenhuma chave de API configurada' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Descriptografar chave (simulação - em produção usar pgcrypto)
    const apiKey = providerKey.key_ciphertext // Em produção: decrypt(providerKey.key_ciphertext)

    // Buscar contexto RAG se habilitado
    let ragContext = ''
    let sources: Array<{ content: string; source: string; score: number }> = []

    if (use_rag) {
      const { data: chunks } = await supabase
        .from('ai_chunks')
        .select(`
          content,
          metadata,
          ai_knowledge_sources!inner(
            filename,
            location
          )
        `)
        .eq('ai_knowledge_sources.assistant_id', assistantId)
        .limit(6)

      if (chunks && chunks.length > 0) {
        ragContext = chunks.map(chunk => chunk.content).join('\n\n')
        sources = chunks.map(chunk => ({
          content: chunk.content.substring(0, 200) + '...',
          source: chunk.ai_knowledge_sources.filename || chunk.ai_knowledge_sources.location,
          score: 0.95 // Simulação
        }))
      }
    }

    // Construir prompt
    let systemPrompt = assistant.system_prompt
    if (ragContext) {
      systemPrompt += `\n\nContexto do conhecimento:\n${ragContext}`
    }

    // Chamar API do provedor
    const response = await callAIProvider(
      provider.provider,
      apiKey,
      provider.api_base,
      {
        model: assistant.default_model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: assistant.temperature,
        max_tokens: assistant.max_tokens
      }
    )

    // Criar ou obter sessão
    let sessionId = session_id
    if (!sessionId) {
      const { data: newSession } = await supabase
        .from('ai_chat_sessions')
        .insert({
          org_id: orgId,
          user_id: user.id,
          assistant_id: assistantId,
          title: message.substring(0, 50) + '...'
        })
        .select('id')
        .single()

      sessionId = newSession!.id
    }

    // Salvar mensagem do usuário
    const { data: userMessage } = await supabase
      .from('ai_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        tokens_prompt: response.usage.prompt_tokens,
        tokens_completion: 0,
        cost_usd: 0
      })
      .select('id')
      .single()

    // Salvar resposta do assistente
    const { data: assistantMessage } = await supabase
      .from('ai_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: response.message,
        tokens_prompt: 0,
        tokens_completion: response.usage.completion_tokens,
        cost_usd: response.cost_usd,
        sources: sources
      })
      .select('id')
      .single()

    // Atualizar sessão
    await supabase
      .from('ai_chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    // Retornar resposta
    const chatResponse: ChatResponse = {
      message: response.message,
      session_id: sessionId,
      message_id: assistantMessage!.id,
      tokens_prompt: response.usage.prompt_tokens,
      tokens_completion: response.usage.completion_tokens,
      cost_usd: response.cost_usd,
      sources: sources.length > 0 ? sources : undefined,
      usage: {
        total_tokens: response.usage.prompt_tokens + response.usage.completion_tokens,
        total_cost: response.cost_usd
      }
    }

    return new Response(
      JSON.stringify(chatResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro no chat de IA:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Função para chamar provedor de IA
async function callAIProvider(
  provider: string,
  apiKey: string,
  apiBase?: string,
  params: any
): Promise<{
  message: string;
  usage: { prompt_tokens: number; completion_tokens: number };
  cost_usd: number;
}> {
  const baseUrl = apiBase || getProviderBaseUrl(provider)
  const model = params.model

  const requestBody = {
    model,
    messages: params.messages,
    temperature: params.temperature,
    max_tokens: params.max_tokens,
    stream: false
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro na API ${provider}: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  // Calcular custo
  const cost = calculateCost(
    data.usage.prompt_tokens,
    data.usage.completion_tokens,
    provider
  )

  return {
    message: data.choices[0].message.content,
    usage: {
      prompt_tokens: data.usage.prompt_tokens,
      completion_tokens: data.usage.completion_tokens
    },
    cost_usd: cost
  }
}

// Obter URL base do provedor
function getProviderBaseUrl(provider: string): string {
  const urls = {
    openai: 'https://api.openai.com',
    azure: 'https://api.openai.com', // Azure usa endpoint personalizado
    openrouter: 'https://openrouter.ai/api'
  }
  return urls[provider as keyof typeof urls] || urls.openai
}

// Calcular custo
function calculateCost(promptTokens: number, completionTokens: number, provider: string): number {
  const pricing = {
    openai: { input: 0.03, output: 0.06 },
    azure: { input: 0.03, output: 0.06 },
    openrouter: { input: 0.02, output: 0.04 }
  }

  const rates = pricing[provider as keyof typeof pricing] || pricing.openai
  
  const promptCost = (promptTokens / 1000) * rates.input
  const completionCost = (completionTokens / 1000) * rates.output
  
  return promptCost + completionCost
}
