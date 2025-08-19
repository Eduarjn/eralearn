import { ERALayout } from '@/components/ERALayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Globe, Mail, Shield, Database, Bell, Palette, UserCheck, Award, Image as ImageIcon, Building } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Routes, Route, Outlet } from 'react-router-dom';
import { usePreferences, FontSize, Language } from '../../frontend/src/context/PreferencesContext';
import { useBranding } from '@/context/BrandingContext';


// Componente Preferências
const Preferencias = () => {
  const { toast } = useToast();
  const {
    theme, setTheme,
    language, setLanguage,
    fontSize, setFontSize,
    keyboardShortcuts, setKeyboardShortcuts
  } = usePreferences();

  const handleSave = async () => {
    toast({ 
      title: 'Configurações salvas com sucesso!', 
      description: 'As alterações foram aplicadas ao sistema.' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Preferências</h1>
            <p className="text-white/90">Personalize a aparência e comportamento da plataforma</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aparência */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Palette className="h-5 w-5 text-era-green" />
              Aparência
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Personalize o tema e tamanho da fonte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Modo Escuro</Label>
              <div className="mt-2 flex gap-2">
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  className={`flex-1 ${theme === 'dark' ? 'bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 text-era-black border-era-green/20' : 'border-era-gray-medium/30 hover:border-era-green text-era-gray-medium'}`}
                  onClick={() => setTheme('dark')}
                >
                  Ativado
                </Button>
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  className={`flex-1 ${theme === 'light' ? 'bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 text-era-black border-era-green/20' : 'border-era-gray-medium/30 hover:border-era-green text-era-gray-medium'}`}
                  onClick={() => setTheme('light')}
                >
                  Desativado
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Tamanho da Fonte</Label>
              <div className="mt-2">
                <select 
                  className="w-full p-3 border-2 border-era-gray-medium/30 focus:border-era-green rounded-lg transition-all duration-300" 
                  value={fontSize} 
                  onChange={e => setFontSize(e.target.value as FontSize)}
                >
                  <option value="small">Pequeno</option>
                  <option value="medium">Médio</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Idioma e Acessibilidade */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Globe className="h-5 w-5 text-era-green" />
              Idioma e Acessibilidade
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Configure idioma e atalhos de teclado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Idioma</Label>
              <div className="mt-2">
                <select 
                  className="w-full p-3 border-2 border-era-gray-medium/30 focus:border-era-green rounded-lg transition-all duration-300" 
                  value={language} 
                  onChange={e => setLanguage(e.target.value as Language)}
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Atalhos de Teclado</Label>
              <div className="mt-2 flex gap-2">
                <Button 
                  variant={keyboardShortcuts ? 'default' : 'outline'} 
                  className={`flex-1 ${keyboardShortcuts ? 'bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 text-era-black border-era-green/20' : 'border-era-gray-medium/30 hover:border-era-green text-era-gray-medium'}`}
                  onClick={() => setKeyboardShortcuts(true)}
                >
                  Ativados
                </Button>
                <Button 
                  variant={!keyboardShortcuts ? 'default' : 'outline'} 
                  className={`flex-1 ${!keyboardShortcuts ? 'bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 text-era-black border-era-green/20' : 'border-era-gray-medium/30 hover:border-era-green text-era-gray-medium'}`}
                  onClick={() => setKeyboardShortcuts(false)}
                >
                  Desativados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black shadow-lg hover:shadow-xl transition-all duration-300 border border-era-green/20"
        >
          Salvar Preferências
        </Button>
      </div>
    </div>
  );
};

// Componente Conta
const Conta = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: userProfile.email, password: currentPassword });
    if (signInError) {
      toast({ title: 'Senha atual incorreta', variant: 'destructive' });
      setChangingPassword(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast({ title: 'Erro ao alterar senha', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Senha alterada com sucesso!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${userProfile.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Erro ao fazer upload da foto', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    await supabase.from('usuarios').update({ avatar_url: data.publicUrl }).eq('id', userProfile.id);
    toast({ title: 'Foto de perfil atualizada!' });
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Informações da Conta</h1>
            <p className="text-white/90">Gerencie suas informações pessoais e credenciais</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <UserCheck className="h-5 w-5 text-era-green" />
              Informações Pessoais
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Dados básicos da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-medium text-gray-500">
                  {userProfile?.nome ? userProfile.nome.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Fazendo upload...' : 'Alterar foto'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input 
              id="nome" 
              defaultValue={userProfile?.nome || ''} 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue={userProfile?.email || ''} 
              className="mt-1"
              disabled
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={changingPassword}
              className="w-full md:w-auto"
            >
              {changingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </div>
      </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Shield className="h-5 w-5 text-era-green" />
              Segurança
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Alterar senha e configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Senha Atual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Nova Senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black shadow-lg hover:shadow-xl transition-all duration-300 border border-era-green/20"
            >
              {changingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente WhiteLabel
const WhiteLabel = () => {
  const { toast } = useToast();
  const { branding, updateLogo, updateSubLogo, updateFavicon, updateColors, updateCompanyName, loading } = useBranding();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [subLogoFile, setSubLogoFile] = useState<File | null>(null);
  const [subLogoPreview, setSubLogoPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(branding.secondary_color);
  const [companyName, setCompanyName] = useState(branding.company_name);
  const [companySlogan, setCompanySlogan] = useState(branding.company_slogan || 'Smart Training');
  const [uploading, setUploading] = useState(false);
  
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

  const handleSubLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSubLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Validar tamanho (máximo 10MB para imagens de fundo)
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: 'Arquivo muito grande', 
          description: 'O arquivo deve ter no máximo 10MB.',
          variant: 'destructive' 
        });
        return;
      }

      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      
      // Função para fazer upload de arquivo
      const uploadFile = async (file: File, folder: string, fileName: string) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${folder}/${fileName}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(filePath, file, { upsert: true });
        
        if (uploadError) {
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }
        
        const { data } = supabase.storage.from('branding').getPublicUrl(filePath);
        return data.publicUrl;
      };
      
      // Upload do logo principal
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile, 'logos', 'main-logo');
        await updateLogo(logoUrl);
        setLogoFile(null);
        setLogoPreview(null);
      }
      
      // Upload do sublogo
      if (subLogoFile) {
        const subLogoUrl = await uploadFile(subLogoFile, 'logos', 'sub-logo');
        await updateSubLogo(subLogoUrl);
        setSubLogoFile(null);
        setSubLogoPreview(null);
      }

      // Upload do favicon
      if (faviconFile) {
        const faviconUrl = await uploadFile(faviconFile, 'favicons', 'favicon');
        await updateFavicon(faviconUrl);
        setFaviconFile(null);
        setFaviconPreview(null);
      }

      // Upload da imagem de fundo
      if (backgroundFile) {
        const backgroundUrl = await uploadFile(backgroundFile, 'backgrounds', 'login-background');
        // Atualizar no contexto de branding (precisamos adicionar essa função)
        await updateBackground(backgroundUrl);
        setBackgroundFile(null);
        setBackgroundPreview(null);
      }

      // Atualizar cores se foram alteradas
      if (primaryColor !== branding.primary_color || secondaryColor !== branding.secondary_color) {
        await updateColors(primaryColor, secondaryColor);
      }

      // Atualizar informações da empresa se foram alteradas
      if (companyName !== branding.company_name) {
        await updateCompanyName(companyName);
      }

      if (companySlogan !== branding.company_slogan) {
        await updateCompanySlogan(companySlogan);
      }
      
      toast({ 
        title: 'Configurações salvas com sucesso!', 
        description: 'As alterações foram aplicadas ao sistema.' 
      });
    } catch (error) {
      toast({ 
        title: 'Erro ao salvar configurações', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
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
            <h1 className="text-2xl font-bold">White-Label</h1>
            <p className="text-white/90">Personalize a aparência da plataforma com sua marca</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logos e Imagens */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <ImageIcon className="h-5 w-5 text-era-green" />
              Logos e Imagens
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Carregue os logos e imagens da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Principal */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-era-black">Logo Principal da Empresa</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logoUpload"
                  />
                  <label htmlFor="logoUpload">
                    <Button variant="outline" className="w-full cursor-pointer border-era-gray-medium/30 hover:border-era-green text-era-gray-medium">
                      Upload Logo Principal
                    </Button>
                  </label>
                  {(logoPreview || branding.logo_url) && (
                    <div className="mt-2 flex items-center gap-4">
                      <img 
                        src={logoPreview || branding.logo_url} 
                        alt="Logo Principal" 
                        className="w-20 h-20 object-contain rounded border bg-era-gray-light"
                      />
                      <div>
                        <p className="text-sm font-medium text-era-black">Logo Atual</p>
                        <p className="text-xs text-era-gray-medium">Aparece no cabeçalho, sidebar e tela de login</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sublogotipo */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-era-black">Sublogotipo ERA LEARN</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubLogoUpload}
                    className="hidden"
                    id="subLogoUpload"
                  />
                  <label htmlFor="subLogoUpload">
                    <Button variant="outline" className="w-full cursor-pointer border-era-gray-medium/30 hover:border-era-green text-era-gray-medium">
                      Upload Sublogotipo
                    </Button>
                  </label>
                  {(subLogoPreview || branding.sub_logo_url) && (
                    <div className="mt-2 flex items-center gap-4">
                      <img 
                        src={subLogoPreview || branding.sub_logo_url} 
                        alt="Sublogotipo" 
                        className="w-12 h-12 object-contain rounded border bg-era-gray-light"
                      />
                      <div>
                        <p className="text-sm font-medium text-era-black">Sublogotipo Atual</p>
                        <p className="text-xs text-era-gray-medium">Aparece ao lado de "Smart Training" e "Plataforma de Ensino"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
        </div>

        {/* Favicon */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-era-black">Favicon (Ícone da Aba)</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
                className="hidden"
                id="faviconUpload"
              />
              <label htmlFor="faviconUpload">
                <Button variant="outline" className="w-full cursor-pointer border-era-gray-medium/30 hover:border-era-green text-era-gray-medium">
                  Upload Favicon
                </Button>
              </label>
              {(faviconPreview || branding.favicon_url) && (
                <div className="mt-2 flex items-center gap-4">
                  <img 
                    src={faviconPreview || branding.favicon_url} 
                    alt="Favicon" 
                    className="w-8 h-8 object-contain rounded border bg-era-gray-light"
                  />
                  <div>
                    <p className="text-sm font-medium text-era-black">Favicon Atual</p>
                    <p className="text-xs text-era-gray-medium">Ícone que aparece na aba do navegador</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Imagem de Fundo */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-era-black">Imagem de Fundo (Login)</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
                id="backgroundUpload"
              />
              <label htmlFor="backgroundUpload">
                <Button variant="outline" className="w-full cursor-pointer border-era-gray-medium/30 hover:border-era-green text-era-gray-medium">
                  Upload Imagem de Fundo
                </Button>
              </label>
              {(backgroundPreview || branding.background_url) && (
                <div className="mt-2 space-y-2">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border bg-era-gray-light">
                    <img 
                      src={backgroundPreview || branding.background_url} 
                      alt="Imagem de Fundo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-era-black">Imagem de Fundo Atual</p>
                    <p className="text-xs text-era-gray-medium">Aparece na tela de login e outras páginas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cores */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Cores da Marca</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Cor Primária</Label>
                <div className="mt-1 flex items-center gap-2">
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
                <Label className="text-xs text-gray-500">Cor Secundária</Label>
                <div className="mt-1 flex items-center gap-2">
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
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Preview das Configurações</Label>
            <div className="mt-2 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={logoPreview || branding.logo_url} 
                  alt="Preview Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-sm font-medium">ERA Learn</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Smart Training</span>
                <img 
                  src={subLogoPreview || branding.sub_logo_url} 
                  alt="Preview Sub Logo" 
                  className="w-4 h-4 object-contain"
                />
              </div>
            </div>
          </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Empresa */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Building className="h-5 w-5 text-era-green" />
              Informações da Empresa
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Configure o nome e slogan da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Nome da Empresa</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Digite o nome da sua empresa"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Slogan da Empresa</Label>
              <Input
                value={companySlogan}
                onChange={(e) => setCompanySlogan(e.target.value)}
                placeholder="Digite o slogan da sua empresa"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
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
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="mt-1 h-10 border-era-gray-medium/30 focus:border-era-green"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-era-black">Cor Secundária</Label>
                <Input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="mt-1 h-10 border-era-gray-medium/30 focus:border-era-green"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black shadow-lg hover:shadow-xl transition-all duration-300 border border-era-green/20"
        >
          Salvar Configurações de Branding
        </Button>
      </div>
    </div>
  );
};

// Componente Certificado
const Certificado = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<File | null>(null);
  const [templatePreview, setTemplatePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    templateFile: null as File | null,
    validade: 365,
    assinaturaDigital: true,
    qrCode: true,
    qrCodePosition: 'rodape',
    layoutTemplate: 'padrao',
    nomeSignatario: '',
    cargoSignatario: '',
    corPrimaria: '#3B82F6',
    fonteTexto: 'Roboto',
    alinhamento: 'centro'
  });

  // Buscar configurações existentes
  useEffect(() => {
    const fetchConfiguracoes = async () => {
      try {
        // Simular busca de configurações existentes
        const mockConfig = {
          templateFile: null,
          validade: 365,
          assinaturaDigital: true,
          qrCode: true,
          qrCodePosition: 'rodape',
          layoutTemplate: 'padrao',
          nomeSignatario: 'João Silva',
          cargoSignatario: 'Diretor de Treinamento',
          corPrimaria: '#3B82F6',
          fonteTexto: 'Roboto',
          alinhamento: 'centro'
        };
        setFormData(mockConfig);
      } catch (error) {
        toast({ 
          title: 'Erro ao carregar configurações', 
          description: 'Tente novamente.',
          variant: 'destructive' 
        });
      }
    };
    fetchConfiguracoes();
  }, [toast]);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedTemplate(file);
      setFormData(prev => ({ ...prev, templateFile: file }));
      
      // Criar preview da primeira página
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplatePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({ 
        title: 'Arquivo inválido', 
        description: 'Por favor, selecione um arquivo PDF.',
        variant: 'destructive' 
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({ 
        title: 'Arquivo inválido', 
        description: 'Por favor, selecione uma imagem PNG ou SVG.',
        variant: 'destructive' 
      });
    }
  };

  const handleSave = async () => {
    if (!formData.templateFile && formData.layoutTemplate === 'custom') {
      toast({ 
        title: 'Template obrigatório', 
        description: 'Faça upload de um template PDF ou selecione um template padrão.',
        variant: 'destructive' 
      });
      return;
    }

    if (formData.validade < 1 || formData.validade > 3650) {
      toast({ 
        title: 'Validade inválida', 
        description: 'A validade deve estar entre 1 e 3650 dias.',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: 'Configurações salvas com sucesso!', 
        description: 'As alterações foram aplicadas ao sistema.' 
      });
    } catch (error) {
      toast({ 
        title: 'Erro ao salvar configurações', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.validade >= 1 && formData.validade <= 3650 && 
    (formData.templateFile || formData.layoutTemplate !== 'custom');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Configurações de Certificado
          </CardTitle>
          <CardDescription>
            Personalize o template e conteúdo dos certificados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              {/* Layout do Certificado */}
              <div>
                <Label className="text-sm font-medium">Layout do Certificado</Label>
                <div className="mt-2">
                  <select 
                    className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                    value={formData.layoutTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, layoutTemplate: e.target.value }))}
                  >
                    <option value="padrao">Template Padrão</option>
                    <option value="moderno">Template Moderno</option>
                    <option value="classico">Template Clássico</option>
                    <option value="custom">Template Personalizado</option>
                  </select>
                </div>
              </div>

              {/* Template do Certificado */}
              {formData.layoutTemplate === 'custom' && (
                <div>
                  <Label className="text-sm font-medium">Template do Certificado</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleTemplateUpload}
                      className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                    />
                  </div>
                  {templatePreview && (
                    <div className="mt-2">
                      <div className="relative w-32 h-40 border rounded-md overflow-hidden">
                        <iframe 
                          src={templatePreview} 
                          className="w-full h-full"
                          title="Preview do template"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowPreviewModal(true)}
                      >
                        Visualizar Exemplo
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Validade */}
              <div>
                <Label className="text-sm font-medium">Validade (dias)</Label>
                <div className="mt-2">
                  <Input 
                    type="number" 
                    min="1"
                    max="3650"
                    value={formData.validade}
                    onChange={(e) => setFormData(prev => ({ ...prev, validade: parseInt(e.target.value) || 0 }))}
                    className="dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Defina por quantos dias o certificado será válido
                  </p>
                </div>
              </div>

              {/* Assinatura Digital */}
              <div>
                <Label className="text-sm font-medium">Assinatura Digital</Label>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">Ativada</span>
                  <Button 
                    variant={formData.assinaturaDigital ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, assinaturaDigital: !prev.assinaturaDigital }))}
                  >
                    {formData.assinaturaDigital ? 'Ativada' : 'Desativada'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4">
              {/* QR Code */}
              <div>
                <Label className="text-sm font-medium">QR Code</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Incluir</span>
                    <Button 
                      variant={formData.qrCode ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, qrCode: !prev.qrCode }))}
                    >
                      {formData.qrCode ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                  {formData.qrCode && (
                    <select 
                      className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                      value={formData.qrCodePosition}
                      onChange={(e) => setFormData(prev => ({ ...prev, qrCodePosition: e.target.value }))}
                    >
                      <option value="topo">Topo</option>
                      <option value="rodape">Rodapé</option>
                      <option value="canto">Canto</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Informações do Signatário */}
              <div>
                <Label className="text-sm font-medium">Nome do Signatário</Label>
                <div className="mt-2">
                  <Input 
                    value={formData.nomeSignatario}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeSignatario: e.target.value }))}
                    placeholder="Ex: João Silva"
                    className="dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Cargo do Signatário</Label>
                <div className="mt-2">
                  <Input 
                    value={formData.cargoSignatario}
                    onChange={(e) => setFormData(prev => ({ ...prev, cargoSignatario: e.target.value }))}
                    placeholder="Ex: Diretor de Treinamento"
                    className="dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                  />
                </div>
              </div>

              {/* Logo */}
              <div>
                <Label className="text-sm font-medium">Logo da Empresa</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".png,.svg"
                    onChange={handleLogoUpload}
                    className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                  />
                  {logoPreview && (
                    <div className="mt-2">
                      <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain border rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Estilo */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Estilo do Certificado</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Cor Primária</Label>
                <div className="mt-2">
                  <Input 
                    type="color" 
                    value={formData.corPrimaria}
                    onChange={(e) => setFormData(prev => ({ ...prev, corPrimaria: e.target.value }))}
                    className="w-full h-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Fonte do Texto</Label>
                <div className="mt-2">
                  <select 
                    className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                    value={formData.fonteTexto}
                    onChange={(e) => setFormData(prev => ({ ...prev, fonteTexto: e.target.value }))}
                  >
                    <option value="Roboto">Roboto</option>
                    <option value="Inter">Inter</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Arial">Arial</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Alinhamento</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="esquerda"
                      name="alinhamento"
                      value="esquerda"
                      checked={formData.alinhamento === 'esquerda'}
                      onChange={(e) => setFormData(prev => ({ ...prev, alinhamento: e.target.value }))}
                    />
                    <Label htmlFor="esquerda" className="text-sm">Esquerda</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="centro"
                      name="alinhamento"
                      value="centro"
                      checked={formData.alinhamento === 'centro'}
                      onChange={(e) => setFormData(prev => ({ ...prev, alinhamento: e.target.value }))}
                    />
                    <Label htmlFor="centro" className="text-sm">Centro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="direita"
                      name="alinhamento"
                      value="direita"
                      checked={formData.alinhamento === 'direita'}
                      onChange={(e) => setFormData(prev => ({ ...prev, alinhamento: e.target.value }))}
                    />
                    <Label htmlFor="direita" className="text-sm">Direita</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={!isFormValid || loading}
              className="bg-era-blue hover:bg-era-dark-green text-white"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold dark:text-white">Preview do Certificado</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </Button>
              </div>
              <div className="border rounded-lg p-8 bg-gray-50 dark:bg-neutral-700">
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CERTIFICADO</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Certificamos que <strong>Maria Santos</strong> concluiu com êxito o curso
                  </p>
                  <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                    Fundamentos de PABX
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    com carga horária de 20 horas
                  </p>
                  <div className="mt-8 pt-8 border-t">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      São Paulo, {new Date().toLocaleDateString('pt-BR')}
                    </p>
                    <div className="mt-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formData.nomeSignatario || 'João Silva'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formData.cargoSignatario || 'Diretor de Treinamento'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                  Fechar
                </Button>
                <Button className="bg-era-blue hover:bg-era-dark-green text-white">
                  Baixar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente Integracoes
const Integracoes = () => {
  const { toast } = useToast();
  
  const handleSave = async () => {
    try {
      localStorage.setItem('pana-learn-config', JSON.stringify({}));
      toast({ 
        title: 'Configurações salvas com sucesso!', 
        description: 'As alterações foram aplicadas ao sistema.' 
      });
    } catch (error) {
      toast({ 
        title: 'Erro ao salvar configurações', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Integrações & API</h1>
            <p className="text-white/90">Configure integrações externas e chaves de API</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de API */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Database className="h-5 w-5 text-era-green" />
              Configurações de API
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Chaves e configurações de API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Chave da API</Label>
              <div className="mt-2 flex gap-2">
                <Input 
                  type="password" 
                  defaultValue="sk-..." 
                  className="flex-1 border-era-gray-medium/30 focus:border-era-green"
                  placeholder="••••••••••••••••••••"
                />
                <Button 
                  variant="outline"
                  className="border-era-gray-medium/30 hover:border-era-green text-era-gray-medium"
                >
                  Gerar Nova
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Webhook URL</Label>
              <Input 
                type="url" 
                placeholder="https://sua-api.com/webhook" 
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Mail className="h-5 w-5 text-era-green" />
              Configurações de Email
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Servidor SMTP e notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Email SMTP</Label>
              <Input 
                type="email" 
                placeholder="smtp@exemplo.com" 
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Porta SMTP</Label>
              <Input 
                type="number" 
                placeholder="587" 
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Senha SMTP</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black shadow-lg hover:shadow-xl transition-all duration-300 border border-era-green/20"
        >
          Salvar Integrações
        </Button>
      </div>
    </div>
  );
};

// Componente Seguranca
const Seguranca = () => {
  const { toast } = useToast();
  
  const handleSave = async () => {
    try {
      localStorage.setItem('pana-learn-config', JSON.stringify({}));
      toast({ 
        title: 'Configurações salvas com sucesso!', 
        description: 'As alterações foram aplicadas ao sistema.' 
      });
    } catch (error) {
      toast({ 
        title: 'Erro ao salvar configurações', 
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Segurança Avançada</h1>
            <p className="text-white/90">Configure medidas de segurança adicionais</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Autenticação */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Shield className="h-5 w-5 text-era-green" />
              Autenticação
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Configurações de login e segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Autenticação de Dois Fatores (2FA)</Label>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-era-gray-medium/30 hover:border-era-green text-era-gray-medium"
                >
                  <span>Ativada</span>
                  <div className="w-4 h-4 bg-era-green rounded-full"></div>
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Tempo de Sessão</Label>
              <div className="mt-2">
                <select className="w-full p-3 border-2 border-era-gray-medium/30 focus:border-era-green rounded-lg transition-all duration-300">
                  <option value="1">1 hora</option>
                  <option value="8">8 horas</option>
                  <option value="24">24 horas</option>
                  <option value="168">7 dias</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monitoramento */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Bell className="h-5 w-5 text-era-green" />
              Monitoramento
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Sessões ativas e logs de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Sessões Ativas</Label>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-era-gray-medium/30 hover:border-era-green text-era-gray-medium"
                >
                  <span>Ver Sessões (3 ativas)</span>
                  <div className="w-4 h-4 bg-era-green rounded-full"></div>
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Logs de Acesso</Label>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-era-gray-medium/30 hover:border-era-green text-era-gray-medium"
                >
                  <span>Ver Logs</span>
                  <div className="w-4 h-4 bg-era-green rounded-full"></div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black shadow-lg hover:shadow-xl transition-all duration-300 border border-era-green/20"
        >
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

// Componente principal de Configurações
const Configuracoes = () => {
  return (
    <ERALayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Preferencias />} />
          <Route path="/preferencias" element={<Preferencias />} />
          <Route path="/conta" element={<Conta />} />
          <Route path="/whitelabel" element={<WhiteLabel />} />


          <Route path="/integracoes" element={<Integracoes />} />
          <Route path="/seguranca" element={<Seguranca />} />
        </Routes>
      </div>
    </ERALayout>
  );
};

export default Configuracoes;
