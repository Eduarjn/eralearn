import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Branding {
  logo_url?: string;
  favicon_url?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  nome?: string;
  empresa_id?: string;
}

interface BrandingContextType {
  branding: Branding;
  loading: boolean;
  updateLogo: (file: File) => Promise<void>;
  updateFavicon: (file: File) => Promise<void>;
  updateColors: (primary: string, secondary: string) => Promise<void>;
  updateCompanyName: (name: string) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({ 
  branding: {}, 
  loading: true,
  updateLogo: async () => {},
  updateFavicon: async () => {},
  updateColors: async () => {},
  updateCompanyName: async () => {}
});

export function BrandingProvider({ empresaId, children }: { empresaId?: string; children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!empresaId) {
      setBranding({});
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setBranding({});
        } else {
          setBranding({
            logo_url: data.logo_url,
            favicon_url: data.favicon_url,
            cor_primaria: data.cor_primaria,
            cor_secundaria: data.cor_secundaria,
            nome: data.nome,
            empresa_id: data.id,
          });
        }
        setLoading(false);
      });
  }, [empresaId]);

  const updateLogo = async (file: File) => {
    if (!empresaId) {
      toast({ 
        title: 'Erro', 
        description: 'Empresa não identificada',
        variant: 'destructive' 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload para storage do Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `logos/${empresaId}-logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('empresas')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', empresaId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setBranding(prev => ({ ...prev, logo_url: urlData.publicUrl }));

      toast({ 
        title: 'Logo atualizado com sucesso!', 
        description: 'O novo logo foi aplicado em toda a plataforma.' 
      });
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
      toast({ 
        title: 'Erro ao atualizar logo', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFavicon = async (file: File) => {
    if (!empresaId) {
      toast({ 
        title: 'Erro', 
        description: 'Empresa não identificada',
        variant: 'destructive' 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload para storage do Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `favicons/${empresaId}-favicon.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('empresas')
        .update({ favicon_url: urlData.publicUrl })
        .eq('id', empresaId);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setBranding(prev => ({ ...prev, favicon_url: urlData.publicUrl }));

      // Atualizar favicon na página
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link') as HTMLLinkElement;
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = urlData.publicUrl;

      toast({ 
        title: 'Favicon atualizado com sucesso!', 
        description: 'O novo ícone foi aplicado nas abas do navegador.' 
      });
    } catch (error) {
      console.error('Erro ao atualizar favicon:', error);
      toast({ 
        title: 'Erro ao atualizar favicon', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateColors = async (primary: string, secondary: string) => {
    if (!empresaId) {
      toast({ 
        title: 'Erro', 
        description: 'Empresa não identificada',
        variant: 'destructive' 
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('empresas')
        .update({ 
          cor_primaria: primary,
          cor_secundaria: secondary 
        })
        .eq('id', empresaId);

      if (error) {
        throw error;
      }

      setBranding(prev => ({ 
        ...prev, 
        cor_primaria: primary,
        cor_secundaria: secondary 
      }));

      toast({ 
        title: 'Cores atualizadas com sucesso!', 
        description: 'As novas cores foram aplicadas na plataforma.' 
      });
    } catch (error) {
      console.error('Erro ao atualizar cores:', error);
      toast({ 
        title: 'Erro ao atualizar cores', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyName = async (name: string) => {
    if (!empresaId) {
      toast({ 
        title: 'Erro', 
        description: 'Empresa não identificada',
        variant: 'destructive' 
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('empresas')
        .update({ nome: name })
        .eq('id', empresaId);

      if (error) {
        throw error;
      }

      setBranding(prev => ({ ...prev, nome: name }));

      toast({ 
        title: 'Nome da empresa atualizado!', 
        description: 'O novo nome foi aplicado na plataforma.' 
      });
    } catch (error) {
      console.error('Erro ao atualizar nome da empresa:', error);
      toast({ 
        title: 'Erro ao atualizar nome', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandingContext.Provider value={{ 
      branding, 
      loading, 
      updateLogo, 
      updateFavicon, 
      updateColors, 
      updateCompanyName 
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
} 