import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  logo_url: 'https://eralearn-94hi.vercel.app/logotipoeralearn.png',
  sub_logo_url: '/era-sub-logo.png',
  favicon_url: 'https://eralearn-94hi.vercel.app/favicon.ico',
  background_url: 'https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
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
        
        // Tentar carregar do banco de dados
        const { data, error } = await supabase
          .from('branding_config')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

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
        } else if (data) {
          console.log('🔍 Branding carregado do banco:', data);
          setBranding(data);
        } else {
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
      const { data, error } = await supabase
        .from('branding_config')
        .update(updates)
        .order('created_at', { ascending: false })
        .limit(1)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar branding:', error);
        throw error;
      }

      if (data) {
        setBranding(data);
        // Salvar no localStorage como backup
        localStorage.setItem('era-learn-branding', JSON.stringify(data));
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