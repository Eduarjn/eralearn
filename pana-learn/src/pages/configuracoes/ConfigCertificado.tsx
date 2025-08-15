import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Upload, Download, Settings, Palette, FileText, Image, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const ConfigCertificado = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    empresaNome: '',
    empresaEndereco: '',
    empresaTelefone: '',
    empresaEmail: '',
    certificadoTitulo: 'Certificado de Conclusão',
    certificadoSubtitulo: 'Este certificado atesta que o aluno concluiu com êxito o curso',
    certificadoCorPrimaria: '#34C759',
    certificadoCorSecundaria: '#000000',
    certificadoFonte: 'Arial',
    certificadoTamanhoFonte: '14',
    certificadoMargem: '20',
    certificadoEspacamento: '1.5',
    certificadoLogo: null,
    certificadoAssinatura: null,
    certificadoCarimbo: null,
    certificadoQRCode: true,
    certificadoNumeroAutomatico: true,
    certificadoDataAutomatica: true,
    certificadoValidade: '365',
    certificadoFormato: 'PDF',
    certificadoQualidade: 'high'
  });

  const logoRef = useRef<HTMLInputElement>(null);
  const assinaturaRef = useRef<HTMLInputElement>(null);
  const carimboRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `certificates/logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      handleInputChange('certificadoLogo', publicUrl);
      toast({ title: 'Logo carregada com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao carregar logo', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssinaturaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `certificates/signatures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      handleInputChange('certificadoAssinatura', publicUrl);
      toast({ title: 'Assinatura carregada com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao carregar assinatura', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCarimboUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `certificates/stamps/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      handleInputChange('certificadoCarimbo', publicUrl);
      toast({ title: 'Carimbo carregado com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao carregar carimbo', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Salvar configurações no banco de dados
      const { error } = await supabase
        .from('certificate_configs')
        .upsert({
          user_id: userProfile?.id,
          config: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ 
        title: 'Configurações salvas com sucesso!', 
        description: 'As configurações de certificados foram atualizadas.' 
      });
    } catch (error) {
      toast({ 
        title: 'Erro ao salvar configurações', 
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Implementar preview do certificado
    toast({ title: 'Preview em desenvolvimento' });
  };

  const handleDownload = () => {
    // Implementar download do template
    toast({ title: 'Download em desenvolvimento' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configuração de Certificados</h1>
            <p className="text-white/90">Personalize o design e conteúdo dos certificados emitidos pela plataforma</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Empresa */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Settings className="h-5 w-5 text-era-green" />
              Informações da Empresa
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Dados que aparecerão no cabeçalho do certificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Nome da Empresa</Label>
              <Input
                value={config.empresaNome}
                onChange={(e) => handleInputChange('empresaNome', e.target.value)}
                placeholder="Digite o nome da empresa"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Endereço</Label>
              <Input
                value={config.empresaEndereco}
                onChange={(e) => handleInputChange('empresaEndereco', e.target.value)}
                placeholder="Endereço completo"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-era-black">Telefone</Label>
                <Input
                  value={config.empresaTelefone}
                  onChange={(e) => handleInputChange('empresaTelefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1 border-era-gray-medium/30 focus:border-era-green"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-era-black">Email</Label>
                <Input
                  value={config.empresaEmail}
                  onChange={(e) => handleInputChange('empresaEmail', e.target.value)}
                  placeholder="contato@empresa.com"
                  className="mt-1 border-era-gray-medium/30 focus:border-era-green"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design do Certificado */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Palette className="h-5 w-5 text-era-green" />
              Design do Certificado
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Personalize cores, fontes e layout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Título do Certificado</Label>
              <Input
                value={config.certificadoTitulo}
                onChange={(e) => handleInputChange('certificadoTitulo', e.target.value)}
                placeholder="Certificado de Conclusão"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Subtítulo</Label>
              <Textarea
                value={config.certificadoSubtitulo}
                onChange={(e) => handleInputChange('certificadoSubtitulo', e.target.value)}
                placeholder="Descrição do certificado"
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-era-black">Cor Primária</Label>
                <Input
                  type="color"
                  value={config.certificadoCorPrimaria}
                  onChange={(e) => handleInputChange('certificadoCorPrimaria', e.target.value)}
                  className="mt-1 h-10 border-era-gray-medium/30 focus:border-era-green"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-era-black">Cor Secundária</Label>
                <Input
                  type="color"
                  value={config.certificadoCorSecundaria}
                  onChange={(e) => handleInputChange('certificadoCorSecundaria', e.target.value)}
                  className="mt-1 h-10 border-era-gray-medium/30 focus:border-era-green"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-era-black">Fonte</Label>
                <Select value={config.certificadoFonte} onValueChange={(value) => handleInputChange('certificadoFonte', value)}>
                  <SelectTrigger className="mt-1 border-era-gray-medium/30 focus:border-era-green">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-era-black">Tamanho da Fonte</Label>
                <Select value={config.certificadoTamanhoFonte} onValueChange={(value) => handleInputChange('certificadoTamanhoFonte', value)}>
                  <SelectTrigger className="mt-1 border-era-gray-medium/30 focus:border-era-green">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elementos Visuais */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Image className="h-5 w-5 text-era-green" />
              Elementos Visuais
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Logos, assinaturas e carimbos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-era-black">Logo da Empresa</Label>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => logoRef.current?.click()}
                  className="border-era-gray-medium/30 hover:border-era-green"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar Logo
                </Button>
                {config.certificadoLogo && (
                  <CheckCircle className="h-4 w-4 text-era-green" />
                )}
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Assinatura Digital</Label>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => assinaturaRef.current?.click()}
                  className="border-era-gray-medium/30 hover:border-era-green"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar Assinatura
                </Button>
                {config.certificadoAssinatura && (
                  <CheckCircle className="h-4 w-4 text-era-green" />
                )}
              </div>
              <input
                ref={assinaturaRef}
                type="file"
                accept="image/*"
                onChange={handleAssinaturaUpload}
                className="hidden"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Carimbo/Carimbo</Label>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => carimboRef.current?.click()}
                  className="border-era-gray-medium/30 hover:border-era-green"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar Carimbo
                </Button>
                {config.certificadoCarimbo && (
                  <CheckCircle className="h-4 w-4 text-era-green" />
                )}
              </div>
              <input
                ref={carimboRef}
                type="file"
                accept="image/*"
                onChange={handleCarimboUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-era-black/5 via-era-gray-medium/10 to-era-green/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-era-black">
              <Settings className="h-5 w-5 text-era-green" />
              Configurações Avançadas
            </CardTitle>
            <CardDescription className="text-era-gray-medium">
              Opções de validação e formato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-era-black">QR Code de Validação</Label>
                <p className="text-xs text-era-gray-medium">Incluir QR code para verificação online</p>
              </div>
              <Switch
                checked={config.certificadoQRCode}
                onCheckedChange={(checked) => handleInputChange('certificadoQRCode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-era-black">Numeração Automática</Label>
                <p className="text-xs text-era-gray-medium">Gerar números únicos automaticamente</p>
              </div>
              <Switch
                checked={config.certificadoNumeroAutomatico}
                onCheckedChange={(checked) => handleInputChange('certificadoNumeroAutomatico', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-era-black">Data Automática</Label>
                <p className="text-xs text-era-gray-medium">Incluir data de emissão automaticamente</p>
              </div>
              <Switch
                checked={config.certificadoDataAutomatica}
                onCheckedChange={(checked) => handleInputChange('certificadoDataAutomatica', checked)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Validade (dias)</Label>
              <Input
                type="number"
                value={config.certificadoValidade}
                onChange={(e) => handleInputChange('certificadoValidade', e.target.value)}
                className="mt-1 border-era-gray-medium/30 focus:border-era-green"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-era-black">Formato de Saída</Label>
              <Select value={config.certificadoFormato} onValueChange={(value) => handleInputChange('certificadoFormato', value)}>
                <SelectTrigger className="mt-1 border-era-gray-medium/30 focus:border-era-green">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handlePreview}
          className="border-era-gray-medium/30 hover:border-era-green text-era-gray-medium"
        >
          <FileText className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
        <Button
          variant="outline"
          onClick={handleDownload}
          className="border-era-gray-medium/30 hover:border-era-green text-era-gray-medium"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Template
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-era-black/20 via-era-gray-medium/30 to-era-green/40 hover:from-era-black/30 hover:via-era-gray-medium/40 hover:to-era-green/50 text-era-black shadow-lg hover:shadow-xl transition-all duration-300 border border-era-green/20"
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default ConfigCertificado; 