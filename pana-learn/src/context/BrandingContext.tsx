import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface BrandingConfig {
  logo_url: string;
  sub_logo_url: string;
  favicon_url: string;
  background_url: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  company_slogan: string;
  mainLogoUrl?: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  updateLogo: (url: string) => Promise<void>;
  updateSubLogo: (url: string) => Promise<void>;
  updateFavicon: (url: string) => Promise<void>;
  updateBackground: (url: string) => Promise<void>;
  updateColors: (primary: string, secondary: string) => Promise<void>;
  updateCompanyName: (name: string) => Promise<void>;
  updateCompanySlogan: (slogan: string) => Promise<void>;
  loading: boolean;
}

const defaultBranding: BrandingConfig = {
  logo_url: '/logotipoeralearn.png',
  sub_logo_url: '/era-sub-logo.png',
  favicon_url: '/favicon.ico',
  background_url: '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
  primary_color: '#CCFF00',
  secondary_color: '#232323',
  company_name: 'ERA Learn',
  company_slogan: 'Smart Training'
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

interface BrandingProviderProps {
  children: ReactNode;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [loading, setLoading] = useState(true);

  // Carregar configurações do banco de dados
  useEffect(() => {
    const loadBranding = async () => {
      try {
        setLoading(true);
        
        // Tentar carregar do banco de dados usando função SQL
        const { data, error } = await supabase.rpc('get_branding_config');

        if (error) {
          console.error('Erro ao carregar branding do banco:', error);
          // Fallback para localStorage
          const savedBranding = localStorage.getItem('era-learn-branding');
          if (savedBranding) {
            try {
              const parsed = JSON.parse(savedBranding);
              setBranding({ ...defaultBranding, ...parsed });
            } catch (e) {
              setBranding(defaultBranding);
            }
          } else {
            setBranding(defaultBranding);
          }
        } else if (data && data.success && data.data) {
          console.log('🔍 Branding carregado do banco:', data.data);
          setBranding(data.data);
        } else {
          console.log('🔍 Nenhum dado de branding encontrado, usando padrão');
          setBranding(defaultBranding);
        }
      } catch (error) {
        console.error('Erro ao carregar branding:', error);
        setBranding(defaultBranding);
      } finally {
        setLoading(false);
      }
    };

    loadBranding();
  }, []);

  // Aplicar cores ao carregar
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', branding.primary_color);
    document.documentElement.style.setProperty('--secondary-color', branding.secondary_color);
  }, [branding.primary_color, branding.secondary_color]);

  // Função para atualizar branding no banco
  const updateBrandingInDB = async (updates: Partial<BrandingConfig>) => {
    try {
      // Construir parâmetros para a função SQL
      const params: Record<string, string> = {};
      
      if (updates.logo_url) params.p_logo_url = updates.logo_url;
      if (updates.sub_logo_url) params.p_sub_logo_url = updates.sub_logo_url;
      if (updates.favicon_url) params.p_favicon_url = updates.favicon_url;
      if (updates.background_url) params.p_background_url = updates.background_url;
      if (updates.primary_color) params.p_primary_color = updates.primary_color;
      if (updates.secondary_color) params.p_secondary_color = updates.secondary_color;
      if (updates.company_name) params.p_company_name = updates.company_name;
      if (updates.company_slogan) params.p_company_slogan = updates.company_slogan;

      // Chamar função SQL para atualizar
      const { data, error } = await supabase.rpc('update_branding_config', params);

      if (error) {
        console.error('Erro ao atualizar branding:', error);
        throw error;
      }

      if (data && data.success) {
        // Recarregar configurações atualizadas
        const { data: updatedData, error: fetchError } = await supabase.rpc('get_branding_config');
        
        if (fetchError) {
          console.error('Erro ao buscar branding atualizado:', fetchError);
          throw fetchError;
        }

        if (updatedData && updatedData.success && updatedData.data) {
          setBranding(updatedData.data);
          // Salvar no localStorage como backup
          localStorage.setItem('era-learn-branding', JSON.stringify(updatedData.data));
        }
      } else {
        throw new Error(data?.message || 'Erro desconhecido ao atualizar branding');
      }
    } catch (error) {
      console.error('Erro ao atualizar branding:', error);
      throw error;
    }
  };

  const updateLogo = async (url: string) => {
    await updateBrandingInDB({ logo_url: url });
  };

  const updateSubLogo = async (url: string) => {
    await updateBrandingInDB({ sub_logo_url: url });
  };

  const updateFavicon = async (url: string) => {
    // Atualizar o favicon no DOM
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = url;
    }
    await updateBrandingInDB({ favicon_url: url });
  };

  const updateColors = async (primary: string, secondary: string) => {
    // Aplicar cores via CSS variables
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
    await updateBrandingInDB({ primary_color: primary, secondary_color: secondary });
  };

  const updateCompanyName = async (name: string) => {
    await updateBrandingInDB({ company_name: name });
  };

  const updateCompanySlogan = async (slogan: string) => {
    await updateBrandingInDB({ company_slogan: slogan });
  };

  const updateBackground = async (url: string) => {
    await updateBrandingInDB({ background_url: url });
  };

  return (
    <BrandingContext.Provider value={{
      branding,
      updateLogo,
      updateSubLogo,
      updateFavicon,
      updateBackground,
      updateColors,
      updateCompanyName,
      updateCompanySlogan,
      loading
    }}>
      {children}
    </BrandingContext.Provider>
  );
}; 