import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Save, 
  X, 
  Loader2,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  QrCode,
  PenTool
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CertificateConfig {
  id: string;
  template_html?: string;
  validade_dias?: number;
  qr_code_enabled?: boolean;
  assinatura_enabled?: boolean;
  logo_url?: string;
  cor_primaria?: string;
  fonte?: string;
  alinhamento?: string;
  layout_config?: Record<string, unknown>;
}

interface CertificateConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  onSave: () => void;
}

export const CertificateConfigModal: React.FC<CertificateConfigModalProps> = ({
  isOpen,
  onClose,
  certificateId,
  onSave
}) => {
  const [config, setConfig] = useState<CertificateConfig>({
    id: certificateId,
    template_html: '',
    validade_dias: 365,
    qr_code_enabled: true,
    assinatura_enabled: true,
    logo_url: '',
    cor_primaria: '#3B82F6',
    fonte: 'Arial',
    alinhamento: 'center',
    layout_config: {}
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar configurações do certificado
  useEffect(() => {
    if (isOpen && certificateId) {
      loadCertificateConfig();
    }
  }, [isOpen, certificateId]);

  const loadCertificateConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificados')
        .select('*')
        .eq('id', certificateId)
        .single();

      if (error) {
        throw error;
      }

      setConfig({
        id: certificateId,
        template_html: data.template_html || '',
        validade_dias: data.validade_dias || 365,
        qr_code_enabled: data.qr_code_enabled ?? true,
        assinatura_enabled: data.assinatura_enabled ?? true,
        logo_url: data.logo_url || '',
        cor_primaria: data.cor_primaria || '#3B82F6',
        fonte: data.fonte || 'Arial',
        alinhamento: data.alinhamento || 'center',
        layout_config: data.layout_config || {}
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do certificado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('certificados')
        .update({
          template_html: config.template_html,
          validade_dias: config.validade_dias,
          qr_code_enabled: config.qr_code_enabled,
          assinatura_enabled: config.assinatura_enabled,
          logo_url: config.logo_url,
          cor_primaria: config.cor_primaria,
          fonte: config.fonte,
          alinhamento: config.alinhamento,
          layout_config: config.layout_config
        })
        .eq('id', certificateId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações do certificado atualizadas com sucesso!",
        variant: "default"
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              Configurações do Certificado
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando configurações...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            Configurações do Certificado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template HTML */}
          <div className="space-y-2">
            <Label htmlFor="template" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Template HTML Personalizado
            </Label>
            <Textarea
              id="template"
              value={config.template_html}
              onChange={(e) => setConfig({ ...config, template_html: e.target.value })}
              placeholder="Digite o template HTML personalizado..."
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Use variáveis como {"{usuario_nome}"}, {"{curso_nome}"}, {"{nota_final}"}, {"{data_emissao}"}
            </p>
          </div>

          {/* Validade */}
          <div className="space-y-2">
            <Label htmlFor="validade">Validade (dias)</Label>
            <Input
              id="validade"
              type="number"
              value={config.validade_dias}
              onChange={(e) => setConfig({ ...config, validade_dias: parseInt(e.target.value) || 365 })}
              min="1"
              max="3650"
            />
          </div>

          {/* Configurações de QR Code e Assinatura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.qr_code_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, qr_code_enabled: checked })}
                />
                <span className="text-sm">{config.qr_code_enabled ? 'Habilitado' : 'Desabilitado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Assinatura Digital
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.assinatura_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, assinatura_enabled: checked })}
                />
                <span className="text-sm">{config.assinatura_enabled ? 'Habilitada' : 'Desabilitada'}</span>
              </div>
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logo" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              URL do Logo
            </Label>
            <Input
              id="logo"
              type="url"
              value={config.logo_url}
              onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          {/* Cor Primária */}
          <div className="space-y-2">
            <Label htmlFor="cor" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cor Primária
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cor"
                type="color"
                value={config.cor_primaria}
                onChange={(e) => setConfig({ ...config, cor_primaria: e.target.value })}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={config.cor_primaria}
                onChange={(e) => setConfig({ ...config, cor_primaria: e.target.value })}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          {/* Fonte */}
          <div className="space-y-2">
            <Label htmlFor="fonte">Fonte</Label>
            <Select value={config.fonte} onValueChange={(value) => setConfig({ ...config, fonte: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alinhamento */}
          <div className="space-y-2">
            <Label>Alinhamento do Texto</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={config.alinhamento === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfig({ ...config, alinhamento: 'left' })}
                className="flex items-center gap-1"
              >
                <AlignLeft className="h-4 w-4" />
                Esquerda
              </Button>
              <Button
                type="button"
                variant={config.alinhamento === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfig({ ...config, alinhamento: 'center' })}
                className="flex items-center gap-1"
              >
                <AlignCenter className="h-4 w-4" />
                Centro
              </Button>
              <Button
                type="button"
                variant={config.alinhamento === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfig({ ...config, alinhamento: 'right' })}
                className="flex items-center gap-1"
              >
                <AlignRight className="h-4 w-4" />
                Direita
              </Button>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-6 border-t">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 