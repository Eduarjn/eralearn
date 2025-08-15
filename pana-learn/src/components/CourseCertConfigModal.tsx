import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Loader2, 
  Settings, 
  Calendar, 
  QrCode, 
  PenTool, 
  Image, 
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CertificateConfig {
  id?: string;
  curso_id: string;
  validade_dias?: number;
  qr_code_enabled?: boolean;
  assinatura_enabled?: boolean;
  logo_url?: string;
  cor_primaria?: string;
  fonte?: string;
  alinhamento?: 'left' | 'center' | 'right';
  template_html?: string;
  layout_config?: Record<string, unknown>;
}

interface Course {
  id: string;
  nome: string;
  categoria: string;
  certificados: unknown[];
}

interface CourseCertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSave: (courseId: string, config: CertificateConfig) => void;
}

export const CourseCertConfigModal: React.FC<CourseCertConfigModalProps> = ({
  isOpen,
  onClose,
  course,
  onSave
}) => {
  const [config, setConfig] = useState<CertificateConfig>({
    curso_id: '',
    validade_dias: 365,
    qr_code_enabled: true,
    assinatura_enabled: true,
    logo_url: '',
    cor_primaria: '#2563eb',
    fonte: 'Arial',
    alinhamento: 'center',
    template_html: '',
    layout_config: {}
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar configuração quando o modal abrir
  useEffect(() => {
    if (isOpen && course) {
      loadCertificateConfig();
    }
  }, [isOpen, course]);

  const loadCertificateConfig = async () => {
    if (!course) return;
    
    setLoading(true);
    try {
      // Buscar configuração de certificado para este curso
      const { data: certConfig, error } = await supabase
        .from('certificate_configs')
        .select('*')
        .eq('curso_id', course.id)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (certConfig) {
        setConfig({
          id: certConfig.id,
          curso_id: course.id,
          validade_dias: certConfig.validade_dias || 365,
          qr_code_enabled: certConfig.qr_code_enabled ?? true,
          assinatura_enabled: certConfig.assinatura_enabled ?? true,
          logo_url: certConfig.logo_url || '',
          cor_primaria: certConfig.cor_primaria || '#2563eb',
          fonte: certConfig.fonte || 'Arial',
          alinhamento: certConfig.alinhamento || 'center',
          template_html: certConfig.template_html || '',
          layout_config: certConfig.layout_config || {}
        });
      } else {
        // Configuração padrão para novo curso
        setConfig({
          curso_id: course.id,
          validade_dias: 365,
          qr_code_enabled: true,
          assinatura_enabled: true,
          logo_url: '',
          cor_primaria: '#2563eb',
          fonte: 'Arial',
          alinhamento: 'center',
          template_html: '',
          layout_config: {}
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a configuração do certificado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!course) return;

    setSaving(true);
    try {
      let result;
      
      if (config.id) {
        // Atualizar configuração existente
        result = await supabase
          .from('certificate_configs')
          .update({
            validade_dias: config.validade_dias,
            qr_code_enabled: config.qr_code_enabled,
            assinatura_enabled: config.assinatura_enabled,
            logo_url: config.logo_url,
            cor_primaria: config.cor_primaria,
            fonte: config.fonte,
            alinhamento: config.alinhamento,
            template_html: config.template_html,
            layout_config: config.layout_config
          })
          .eq('id', config.id)
          .select()
          .single();
      } else {
        // Criar nova configuração
        result = await supabase
          .from('certificate_configs')
          .insert({
            curso_id: course.id,
            validade_dias: config.validade_dias,
            qr_code_enabled: config.qr_code_enabled,
            assinatura_enabled: config.assinatura_enabled,
            logo_url: config.logo_url,
            cor_primaria: config.cor_primaria,
            fonte: config.fonte,
            alinhamento: config.alinhamento,
            template_html: config.template_html,
            layout_config: config.layout_config
          })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Sucesso!",
        description: "Configuração de certificado salva com sucesso.",
        variant: "default"
      });

      onSave(course.id, result.data);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configuração de Certificado - {course?.nome}
          </DialogTitle>
        </DialogHeader>

        {course && (
          <div className="space-y-6">
            {/* Informações do curso */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Curso: {course.nome}</h3>
              <Badge variant="outline">{course.categoria}</Badge>
            </div>

            {/* Configurações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Validade */}
              <div className="space-y-2">
                <Label htmlFor="validade_dias" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Validade (dias)
                </Label>
                <Input
                  id="validade_dias"
                  type="number"
                  min="1"
                  value={config.validade_dias}
                  onChange={(e) => setConfig(prev => ({ ...prev, validade_dias: parseInt(e.target.value) || 365 }))}
                  disabled={saving}
                />
              </div>

              {/* Cor Primária */}
              <div className="space-y-2">
                <Label htmlFor="cor_primaria" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor Primária
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_primaria"
                    type="color"
                    value={config.cor_primaria}
                    onChange={(e) => setConfig(prev => ({ ...prev, cor_primaria: e.target.value }))}
                    disabled={saving}
                    className="w-16 h-10"
                  />
                  <Input
                    value={config.cor_primaria}
                    onChange={(e) => setConfig(prev => ({ ...prev, cor_primaria: e.target.value }))}
                    disabled={saving}
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              {/* Fonte */}
              <div className="space-y-2">
                <Label htmlFor="fonte" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Fonte
                </Label>
                <Select
                  value={config.fonte}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, fonte: value }))}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alinhamento */}
              <div className="space-y-2">
                <Label htmlFor="alinhamento" className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" />
                  Alinhamento
                </Label>
                <Select
                  value={config.alinhamento}
                  onValueChange={(value: 'left' | 'center' | 'right') => 
                    setConfig(prev => ({ ...prev, alinhamento: value }))
                  }
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">
                      <div className="flex items-center gap-2">
                        <AlignLeft className="h-4 w-4" />
                        Esquerda
                      </div>
                    </SelectItem>
                    <SelectItem value="center">
                      <div className="flex items-center gap-2">
                        <AlignCenter className="h-4 w-4" />
                        Centro
                      </div>
                    </SelectItem>
                    <SelectItem value="right">
                      <div className="flex items-center gap-2">
                        <AlignRight className="h-4 w-4" />
                        Direita
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Configurações de funcionalidades */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Funcionalidades</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Code */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label className="font-medium">QR Code</Label>
                      <p className="text-sm text-gray-600">Incluir QR code no certificado</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.qr_code_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, qr_code_enabled: checked }))}
                    disabled={saving}
                  />
                </div>

                {/* Assinatura */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <PenTool className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="font-medium">Assinatura</Label>
                      <p className="text-sm text-gray-600">Incluir assinatura digital</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.assinatura_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, assinatura_enabled: checked }))}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo_url" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                URL do Logo
              </Label>
              <Input
                id="logo_url"
                value={config.logo_url}
                onChange={(e) => setConfig(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://exemplo.com/logo.png"
                disabled={saving}
              />
            </div>

            {/* Template HTML */}
            <div className="space-y-2">
              <Label htmlFor="template_html">Template HTML Personalizado</Label>
              <Textarea
                id="template_html"
                value={config.template_html}
                onChange={(e) => setConfig(prev => ({ ...prev, template_html: e.target.value }))}
                placeholder="<div>Seu template HTML personalizado aqui...</div>"
                rows={6}
                disabled={saving}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-600">
                Deixe vazio para usar o template padrão
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 