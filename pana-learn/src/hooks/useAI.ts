// ========================================
// HOOK: useAI - Módulo de IA
// ========================================
// Feature Flag: FEATURE_AI=true

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { 
  AIProvider, 
  AIAssistant, 
  AIKnowledgeSource, 
  AIChatSession, 
  AIMessage,
  AIUsageLimit,
  AISecuritySettings,
  AIChatRequest,
  AIChatResponse,
  AIEmbedRequest,
  AIEmbedResponse,
  AIFeatureFlag
} from '@/lib/ai-types';
import { isAIEnabled, requireAI } from '@/lib/ai-utils';

// ========================================
// 1. HOOK PRINCIPAL
// ========================================

export function useAI() {
  const { userProfile } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se IA está habilitada
  useEffect(() => {
    const enabled = isAIEnabled();
    setIsEnabled(enabled);
    setLoading(false);
  }, []);

  // Verificar se usuário tem acesso
  const checkAccess = useCallback(async () => {
    if (!isEnabled) {
      throw new Error('Módulo de IA não está habilitado');
    }

    if (!userProfile) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se usuário pertence a um domínio
    const { data: userData } = await supabase
      .from('usuarios')
      .select('domain_id')
      .eq('user_id', userProfile.id)
      .single();

    if (!userData?.domain_id) {
      throw new Error('Usuário não pertence a um domínio');
    }

    return userData.domain_id;
  }, [isEnabled, userProfile]);

  return {
    isEnabled,
    loading,
    error,
    checkAccess,
    // Sub-hooks
    useAIProviders: () => useAIProviders(checkAccess),
    useAIAssistants: () => useAIAssistants(checkAccess),
    useAIKnowledge: () => useAIKnowledge(checkAccess),
    useAIChat: () => useAIChat(checkAccess),
    useAIUsage: () => useAIUsage(checkAccess),
    useAISecurity: () => useAISecurity(checkAccess),
  };
}

// ========================================
// 2. HOOK PARA PROVEDORES
// ========================================

function useAIProviders(checkAccess: () => Promise<string>) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: fetchError } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('domain_id', domainId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProviders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar provedores');
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const createProvider = useCallback(async (provider: Omit<AIProvider, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: createError } = await supabase
        .from('ai_providers')
        .insert({ ...provider, domain_id: domainId })
        .select()
        .single();

      if (createError) throw createError;
      
      setProviders(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar provedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const updateProvider = useCallback(async (id: string, updates: Partial<AIProvider>) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { data, error: updateError } = await supabase
        .from('ai_providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setProviders(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar provedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const deleteProvider = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { error: deleteError } = await supabase
        .from('ai_providers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setProviders(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar provedor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
  };
}

// ========================================
// 3. HOOK PARA ASSISTENTES
// ========================================

function useAIAssistants(checkAccess: () => Promise<string>) {
  const [assistants, setAssistants] = useState<AIAssistant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: fetchError } = await supabase
        .from('ai_assistants')
        .select('*')
        .eq('domain_id', domainId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAssistants(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar assistentes');
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const createAssistant = useCallback(async (assistant: Omit<AIAssistant, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: createError } = await supabase
        .from('ai_assistants')
        .insert({ ...assistant, domain_id: domainId })
        .select()
        .single();

      if (createError) throw createError;
      
      setAssistants(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar assistente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const updateAssistant = useCallback(async (id: string, updates: Partial<AIAssistant>) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { data, error: updateError } = await supabase
        .from('ai_assistants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setAssistants(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar assistente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const deleteAssistant = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { error: deleteError } = await supabase
        .from('ai_assistants')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setAssistants(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar assistente');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  return {
    assistants,
    loading,
    error,
    fetchAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  };
}

// ========================================
// 4. HOOK PARA CONHECIMENTO
// ========================================

function useAIKnowledge(checkAccess: () => Promise<string>) {
  const [sources, setSources] = useState<AIKnowledgeSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async (assistantId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      let query = supabase
        .from('ai_knowledge_sources')
        .select('*')
        .eq('domain_id', domainId)
        .order('created_at', { ascending: false });

      if (assistantId) {
        query = query.eq('assistant_id', assistantId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setSources(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fontes de conhecimento');
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const createSource = useCallback(async (source: Omit<AIKnowledgeSource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: createError } = await supabase
        .from('ai_knowledge_sources')
        .insert({ ...source, domain_id: domainId })
        .select()
        .single();

      if (createError) throw createError;
      
      setSources(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar fonte de conhecimento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const updateSource = useCallback(async (id: string, updates: Partial<AIKnowledgeSource>) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { data, error: updateError } = await supabase
        .from('ai_knowledge_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setSources(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar fonte de conhecimento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const deleteSource = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { error: deleteError } = await supabase
        .from('ai_knowledge_sources')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setSources(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar fonte de conhecimento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const reindexSource = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      // Atualizar status para pending
      await updateSource(id, { status: 'pending' });
      
      // Em produção, aqui seria chamada a Edge Function de embedding
      // Por enquanto, simular o processo
      setTimeout(() => {
        updateSource(id, { status: 'completed' });
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reindexar fonte');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess, updateSource]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return {
    sources,
    loading,
    error,
    fetchSources,
    createSource,
    updateSource,
    deleteSource,
    reindexSource,
  };
}

// ========================================
// 5. HOOK PARA CHAT
// ========================================

function useAIChat(checkAccess: () => Promise<string>) {
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AIChatSession | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: fetchError } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('domain_id', domainId)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { data, error: fetchError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const sendMessage = useCallback(async (request: AIChatRequest): Promise<AIChatResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      // Chamar Edge Function de chat
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar mensagem');
      }

      const chatResponse: AIChatResponse = await response.json();
      
      // Atualizar mensagens
      setMessages(prev => [...prev, {
        id: chatResponse.message_id,
        session_id: chatResponse.session_id,
        role: 'assistant',
        content: chatResponse.message,
        tokens_prompt: chatResponse.tokens_prompt,
        tokens_completion: chatResponse.tokens_completion,
        cost_usd: chatResponse.cost_usd,
        sources: chatResponse.sources,
        created_at: new Date().toISOString(),
      }]);

      return chatResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await checkAccess();
      
      const { error: deleteError } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (deleteError) throw deleteError;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar sessão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess, currentSession]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    fetchSessions,
    fetchMessages,
    sendMessage,
    deleteSession,
    setCurrentSession,
  };
}

// ========================================
// 6. HOOK PARA USO E CUSTOS
// ========================================

function useAIUsage(checkAccess: () => Promise<string>) {
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      let query = supabase
        .from('ai_messages')
        .select(`
          *,
          ai_chat_sessions!inner(
            domain_id,
            user_id,
            ai_assistants!inner(
              name
            )
          )
        `)
        .eq('ai_chat_sessions.domain_id', domainId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUsage(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar uso');
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    loading,
    error,
    fetchUsage,
  };
}

// ========================================
// 7. HOOK PARA SEGURANÇA
// ========================================

function useAISecurity(checkAccess: () => Promise<string>) {
  const [settings, setSettings] = useState<AISecuritySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: fetchError } = await supabase
        .from('ai_security_settings')
        .select('*')
        .eq('domain_id', domainId)
        .single();

      if (fetchError) throw fetchError;
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações de segurança');
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  const updateSettings = useCallback(async (updates: Partial<AISecuritySettings>) => {
    try {
      setLoading(true);
      setError(null);
      
      const domainId = await checkAccess();
      
      const { data, error: updateError } = await supabase
        .from('ai_security_settings')
        .update(updates)
        .eq('domain_id', domainId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setSettings(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações de segurança');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAccess]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
}
