import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Domain = Database['public']['Tables']['domains']['Row'];

interface DomainContextType {
  activeDomain: Domain | null;
  setActiveDomain: (domain: Domain | null) => void;
  domains: Domain[];
  loading: boolean;
  refreshDomains: () => void;
  isViewingClient: boolean; // Indica se está visualizando um cliente
  currentUserType: string; // Mantém o tipo de usuário original
  setIsViewingClient: (viewing: boolean) => void; // Novo: controlar estado de visualização
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [isViewingClient, setIsViewingClient] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<string>('');
  const location = useLocation();

  // Tentar usar useAuth com tratamento de erro
  let userProfile = null;
  let authLoading = false;
  let initialized = false;
  
  try {
    const auth = useAuth();
    userProfile = auth.userProfile;
    authLoading = auth.loading;
    initialized = auth.initialized;
  } catch (error) {
    // Se useAuth não estiver disponível, continuar sem ele
    console.log('AuthProvider ainda não está disponível, continuando...');
  }

  const refreshDomains = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const { data, error } = await fetch('/api/domains', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
        }
      }).then(res => res.json());

      if (error) {
        console.error('Erro ao carregar domínios:', error);
        return;
      }

      setDomains(data || []);
      
      // Se não há domínio ativo e há domínios disponíveis, seleciona o primeiro
      if (!activeDomain && data && data.length > 0) {
        setActiveDomain(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manter o tipo de usuário original
  useEffect(() => {
    if (userProfile?.tipo_usuario) {
      setCurrentUserType(userProfile.tipo_usuario);
    }
  }, [userProfile]);

  // Detectar se está visualizando um cliente baseado na URL
  useEffect(() => {
    const isClientRoute = location.pathname.includes('/cliente/');
    setIsViewingClient(isClientRoute);
    
    // Se está em uma rota de cliente, extrair o domainId da URL
    if (isClientRoute) {
      const domainId = location.pathname.split('/cliente/')[1];
      if (domainId && domains.length > 0) {
        const domain = domains.find(d => d.id === domainId);
        if (domain && domain.id !== activeDomain?.id) {
          setActiveDomain(domain);
        }
      }
    } else {
      // Se não está em rota de cliente, limpar domínio ativo
      if (isViewingClient) {
        setActiveDomain(null);
      }
    }
  }, [location.pathname, domains, activeDomain, isViewingClient]);

  useEffect(() => {
    if (userProfile?.tipo_usuario === 'admin_master' && !authLoading && initialized) {
      refreshDomains();
    }
  }, [userProfile, authLoading, initialized]);

  const value: DomainContextType = {
    activeDomain,
    setActiveDomain,
    domains,
    loading,
    refreshDomains,
    isViewingClient,
    currentUserType,
    setIsViewingClient,
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
} 