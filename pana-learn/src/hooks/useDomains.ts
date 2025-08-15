import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Domain = Database['public']['Tables']['domains']['Row'];
type DomainInsert = Database['public']['Tables']['domains']['Insert'];
type DomainUpdate = Database['public']['Tables']['domains']['Update'];

export function useDomains() {
  const { userProfile } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = async () => {
    if (!userProfile) {
      console.log('❌ useDomains: userProfile não encontrado');
      return;
    }
    
    console.log('🔄 useDomains: Carregando domínios...', { userType: userProfile.tipo_usuario });
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useDomains: Erro ao buscar domínios:', error);
        throw error;
      }

      console.log('✅ useDomains: Domínios carregados:', data);
      setDomains(data || []);
    } catch (err) {
      console.error('❌ useDomains: Erro ao carregar domínios:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createDomain = async (domainData: Omit<DomainInsert, 'created_by'>) => {
    if (!userProfile) {
      throw new Error('Usuário não autenticado');
    }

    if (userProfile.tipo_usuario !== 'admin_master') {
      throw new Error('Apenas admin_master pode criar domínios');
    }

    console.log('🔄 useDomains: Criando domínio...', { domainData, userId: userProfile.id });
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('domains')
        .insert({
          ...domainData,
          created_by: userProfile.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ useDomains: Erro ao criar domínio:', error);
        throw error;
      }

      console.log('✅ useDomains: Domínio criado:', data);
      setDomains(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('❌ useDomains: Erro ao criar domínio:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDomain = async (id: string, domainData: DomainUpdate) => {
    if (!userProfile) {
      throw new Error('Usuário não autenticado');
    }

    if (userProfile.tipo_usuario !== 'admin_master') {
      throw new Error('Apenas admin_master pode editar domínios');
    }

    console.log('🔄 useDomains: Atualizando domínio...', { id, domainData });
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('domains')
        .update(domainData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ useDomains: Erro ao atualizar domínio:', error);
        throw error;
      }

      console.log('✅ useDomains: Domínio atualizado:', data);
      setDomains(prev => prev.map(domain => domain.id === id ? data : domain));
      return data;
    } catch (err) {
      console.error('❌ useDomains: Erro ao atualizar domínio:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDomain = async (id: string) => {
    if (!userProfile) {
      throw new Error('Usuário não autenticado');
    }

    if (userProfile.tipo_usuario !== 'admin_master') {
      throw new Error('Apenas admin_master pode deletar domínios');
    }

    console.log('🔄 useDomains: Deletando domínio...', { id });
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ useDomains: Erro ao deletar domínio:', error);
        throw error;
      }

      console.log('✅ useDomains: Domínio deletado:', id);
      setDomains(prev => prev.filter(domain => domain.id !== id));
    } catch (err) {
      console.error('❌ useDomains: Erro ao deletar domínio:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      console.log('🔄 useDomains: useEffect triggered', { userType: userProfile.tipo_usuario });
      fetchDomains();
    }
  }, [userProfile]);

  return {
    domains,
    loading,
    error,
    fetchDomains,
    createDomain,
    updateDomain,
    deleteDomain,
    isAdminMaster: userProfile?.tipo_usuario === 'admin_master',
    currentUserType: userProfile?.tipo_usuario || ''
  };
} 