import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useBranding } from '@/context/BrandingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Palette, ImageIcon, UserCheck } from 'lucide-react';

function ImagensConfig() {
  const [imagens, setImagens] = useState(() => {
    const saved = localStorage.getItem('era-imagens');
    return saved ? JSON.parse(saved) : [];
  });
  const [logoSelecionado, setLogoSelecionado] = useState(() => localStorage.getItem('era-logo') || '');
  const [faviconSelecionado, setFaviconSelecionado] = useState(() => localStorage.getItem('era-favicon') || '');
  const fileInput = useRef(null);

  useEffect(() => {
    localStorage.setItem('era-imagens', JSON.stringify(imagens));
  }, [imagens]);
  useEffect(() => {
    if (logoSelecionado) localStorage.setItem('era-logo', logoSelecionado);
  }, [logoSelecionado]);
  useEffect(() => {
    if (faviconSelecionado) localStorage.setItem('era-favicon', faviconSelecionado);
    // Atualiza favicon na página
    if (faviconSelecionado) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconSelecionado;
    }
  }, [faviconSelecionado]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagens((imgs) => [...imgs, ev.target.result]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-heading font-bold mb-2">Imagens</h2>
      <p className="mb-2 text-sm text-gray-500">Faça upload de imagens para usar como logotipo ou favicon.</p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        ref={fileInput}
        style={{ display: 'none' }}
        onChange={handleUpload}
      />
      <button
        className="btn-primary mb-4"
        onClick={() => fileInput.current && fileInput.current.click()}
      >
        Enviar Imagem
      </button>
      <div className="flex flex-wrap gap-4">
        {imagens.map((img, idx) => (
          <div key={idx} className="flex flex-col items-center border p-2 rounded">
            <img src={img} alt="imagem" className="h-16 w-16 object-contain mb-2 bg-white" />
            <button
              className={`btn-secondary mb-1 ${logoSelecionado === img ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setLogoSelecionado(img)}
            >Usar como Logotipo</button>
            <button
              className={`btn-secondary ${faviconSelecionado === img ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setFaviconSelecionado(img)}
            >Usar como Favicon</button>
          </div>
        ))}
      </div>
      {logoSelecionado && (
        <div className="mt-4">
          <span className="font-bold">Logotipo atual:</span>
          <img src={logoSelecionado} alt="logo atual" className="h-10 inline ml-2 align-middle" />
        </div>
      )}
      {faviconSelecionado && (
        <div className="mt-2">
          <span className="font-bold">Favicon atual:</span>
          <img src={faviconSelecionado} alt="favicon atual" className="h-6 inline ml-2 align-middle" />
        </div>
      )}
    </div>
  );
}

// Componente WhiteLabel
const WhiteLabel = () => {
  const { toast } = useToast();
  const { branding, updateLogo, updateFavicon, updateColors, updateCompanyName } = useBranding();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState(branding.cor_primaria || '#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState(branding.cor_secundaria || '#10B981');
  const [companyName, setCompanyName] = useState(branding.nome || '');
  const [uploading, setUploading] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Arquivo inválido', 
          description: 'Por favor, selecione uma imagem.',
          variant: 'destructive' 
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: 'Arquivo muito grande', 
          description: 'O arquivo deve ter no máximo 5MB.',
          variant: 'destructive' 
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Arquivo inválido', 
          description: 'Por favor, selecione uma imagem.',
          variant: 'destructive' 
        });
        return;
      }

      // Validar tamanho (máximo 1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast({ 
          title: 'Arquivo muito grande', 
          description: 'O favicon deve ter no máximo 1MB.',
          variant: 'destructive' 
        });
        return;
      }

      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) {
      toast({ 
        title: 'Nenhum arquivo selecionado', 
        description: 'Por favor, selecione um logo para fazer upload.',
        variant: 'destructive' 
      });
      return;
    }

    setUploading(true);
    try {
      await updateLogo(logoFile);
      setLogoFile(null);
      setLogoPreview(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao salvar logo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveFavicon = async () => {
    if (!faviconFile) {
      toast({ 
        title: 'Nenhum arquivo selecionado', 
        description: 'Por favor, selecione um favicon para fazer upload.',
        variant: 'destructive' 
      });
      return;
    }

    setUploading(true);
    try {
      await updateFavicon(faviconFile);
      setFaviconFile(null);
      setFaviconPreview(null);
      if (faviconInputRef.current) {
        faviconInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao salvar favicon:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveColors = async () => {
    setUploading(true);
    try {
      await updateColors(primaryColor, secondaryColor);
    } catch (error) {
      console.error('Erro ao salvar cores:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCompanyName = async () => {
    if (!companyName.trim()) {
      toast({ 
        title: 'Nome da empresa obrigatório', 
        description: 'Por favor, informe o nome da empresa.',
        variant: 'destructive' 
      });
      return;
    }

    setUploading(true);
    try {
      await updateCompanyName(companyName.trim());
    } catch (error) {
      console.error('Erro ao salvar nome da empresa:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Personalização da Marca</h1>
            <p className="text-white/90">Configure o logo, favicon e cores da sua empresa</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo da Empresa */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <ImageIcon className="h-5 w-5 text-era-green" />
              Logo da Empresa
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Upload do logo principal que aparecerá em toda a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo atual */}
            {branding.logo_url && (
              <div className="mb-4">
                <Label className="text-sm font-medium text-era-black">Logo Atual</Label>
                <div className="mt-2 flex items-center gap-4">
                  <img 
                    src={branding.logo_url} 
                    alt="Logo atual" 
                    className="w-20 h-20 object-contain rounded border bg-gray-50"
                  />
                  <div>
                    <p className="text-sm font-medium text-era-black">Logo configurado</p>
                    <p className="text-xs text-era-gray-medium">Aparece no cabeçalho, sidebar e tela de login</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload de novo logo */}
            <div>
              <Label className="text-sm font-medium text-era-black">Upload Novo Logo</Label>
              <div className="mt-2 space-y-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logoUpload"
                />
                <label htmlFor="logoUpload">
                  <Button variant="outline" className="w-full cursor-pointer border-era-gray-medium/30 hover:border-era-green text-era-gray-medium">
                    Selecionar Imagem
                  </Button>
                </label>
                
                {logoPreview && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium text-era-black">Preview</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <img 
                        src={logoPreview} 
                        alt="Preview do logo" 
                        className="w-20 h-20 object-contain rounded border bg-gray-50"
                      />
                      <Button 
                        onClick={handleSaveLogo}
                        disabled={uploading}
                        className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black"
                      >
                        {uploading ? 'Salvando...' : 'Salvar Logo'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-era-gray-medium mt-2">
                Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Favicon */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <ImageIcon className="h-5 w-5 text-era-green" />
              Favicon (Ícone da Aba)
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Ícone que aparece na aba do navegador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Favicon atual */}
            {branding.favicon_url && (
              <div className="mb-4">
                <Label className="text-sm font-medium text-era-black">Favicon Atual</Label>
                <div className="mt-2 flex items-center gap-4">
                  <img 
                    src={branding.favicon_url} 
                    alt="Favicon atual" 
                    className="w-8 h-8 object-contain rounded border bg-gray-50"
                  />
                  <div>
                    <p className="text-sm font-medium text-era-black">Favicon configurado</p>
                    <p className="text-xs text-era-gray-medium">Aparece na aba do navegador</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload de novo favicon */}
            <div>
              <Label className="text-sm font-medium text-era-black">Upload Novo Favicon</Label>
              <div className="mt-2 space-y-2">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                  id="faviconUpload"
                />
                <label htmlFor="faviconUpload">
                  <Button variant="outline" className="w-full cursor-pointer border-era-gray-medium/30 hover:border-era-green text-era-gray-medium">
                    Selecionar Imagem
                  </Button>
                </label>
                
                {faviconPreview && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium text-era-black">Preview</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <img 
                        src={faviconPreview} 
                        alt="Preview do favicon" 
                        className="w-8 h-8 object-contain rounded border bg-gray-50"
                      />
                      <Button 
                        onClick={handleSaveFavicon}
                        disabled={uploading}
                        className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black"
                      >
                        {uploading ? 'Salvando...' : 'Salvar Favicon'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-era-gray-medium mt-2">
                Formatos aceitos: PNG, ICO, SVG. Tamanho máximo: 1MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nome da Empresa */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <UserCheck className="h-5 w-5 text-era-green" />
              Nome da Empresa
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Nome que aparecerá na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Nome da Empresa</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Digite o nome da sua empresa"
                  className="flex-1 border-era-gray-medium/30 focus:border-era-green"
                />
                <Button 
                  onClick={handleSaveCompanyName}
                  disabled={uploading || !companyName.trim()}
                  className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black"
                >
                  {uploading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cores da Marca */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Palette className="h-5 w-5 text-era-green" />
              Cores da Marca
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Personalize as cores da sua marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-era-black">Cor Primária</Label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-era-black">Cor Secundária</Label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSaveColors}
              disabled={uploading}
              className="w-full bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black"
            >
              {uploading ? 'Salvando...' : 'Salvar Cores'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview das Configurações */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-era-black">
            <ImageIcon className="h-5 w-5 text-era-green" />
            Preview das Configurações
          </CardTitle>
          <CardDescription className="text-era-gray-medium">
            Como sua marca aparecerá na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={logoPreview || branding.logo_url || '/era-logo.png'} 
                alt="Preview Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-sm font-medium">{companyName || 'Sua Empresa'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Smart Training</span>
              <img 
                src={faviconPreview || branding.favicon_url || '/favicon.ico'} 
                alt="Preview Favicon" 
                className="w-4 h-4 object-contain"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <div 
                className="w-6 h-6 rounded" 
                style={{ backgroundColor: primaryColor }}
              ></div>
              <div 
                className="w-6 h-6 rounded" 
                style={{ backgroundColor: secondaryColor }}
              ></div>
              <span className="text-xs text-gray-500">Cores da marca</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagensConfig; 