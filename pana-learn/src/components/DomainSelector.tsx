import React from 'react';
import { useDomain } from '@/context/DomainContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, ChevronDown, Shield, Home, Building2, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function DomainSelector() {
  const { userProfile } = useAuth();
  const { activeDomain, setActiveDomain, domains, loading, currentUserType, isViewingClient } = useDomain();
  const navigate = useNavigate();

  // Só mostrar para admin_master
  if (userProfile?.tipo_usuario !== 'admin_master') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-sm text-white/70">Carregando...</span>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg">
        <Globe className="h-4 w-4 text-yellow-400" />
        <span className="text-sm text-yellow-200">Nenhum domínio</span>
      </div>
    );
  }

  const handleDomainChange = (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    setActiveDomain(domain || null);
    
    // Se estiver visualizando um cliente, navegar para o dashboard do cliente
    if (domain && isViewingClient) {
      navigate(`/cliente/${domain.id}`);
    }
  };

  const handleGoToMain = () => {
    setActiveDomain(null);
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center gap-3">
      {/* Badge Admin Master */}
      <div className="flex items-center gap-1 px-2 py-1 bg-green-600/20 rounded-md border border-green-500/30">
        <Crown className="h-3 w-3 text-green-400" />
        <span className="text-xs font-medium text-green-300">Admin Master</span>
      </div>
      
      {/* Indicador de Ambiente */}
      <div className="flex items-center gap-2">
        {isViewingClient && activeDomain ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-200">Cliente: {activeDomain.name}</span>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/50 text-xs">
              Visualizando
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
            <Home className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-200">Principal</span>
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-400/50 text-xs">
              Principal
            </Badge>
          </div>
        )}
      </div>
      
      {/* Seletor de Domínio */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-white/70" />
        <Select
          value={activeDomain?.id || ''}
          onValueChange={handleDomainChange}
        >
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <SelectValue placeholder="Selecionar domínio" />
          </SelectTrigger>
          <SelectContent>
            {/* Opção para voltar ao ERA Learn Principal */}
            <SelectItem value="">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-green-600" />
                <div className="flex flex-col">
                  <span className="font-medium text-green-600">Principal</span>
                  <span className="text-xs text-gray-500">Ambiente principal</span>
                </div>
              </div>
            </SelectItem>
            
            {/* Separador */}
            <div className="h-px bg-gray-200 my-2" />
            
            {/* Domínios de clientes */}
            {domains.map((domain) => (
              <SelectItem key={domain.id} value={domain.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">{domain.name}</span>
                    {domain.description && (
                      <span className="text-xs text-gray-500 truncate">
                        {domain.description}
                      </span>
                    )}
                  </div>
                  {domain.name === 'eralearn.com' && (
                    <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800">
                      Principal
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botão para voltar ao principal */}
      {isViewingClient && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoToMain}
          className="text-white border-white/30 hover:bg-white/10"
        >
          <Home className="h-4 w-4 mr-1" />
          Principal
        </Button>
      )}
    </div>
  );
} 