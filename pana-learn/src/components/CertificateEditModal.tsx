import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Loader2, 
  Edit, 
  Calendar, 
  Trophy, 
  User, 
  BookOpen 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  usuario_id: string;
  curso_id?: string;
  categoria: string;
  quiz_id?: string;
  nota_final: number;
  link_pdf_certificado?: string;
  numero_certificado: string;
  qr_code_url?: string;
  status: 'ativo' | 'revogado' | 'expirado';
  data_emissao: string;
  data_criacao: string;
  data_atualizacao: string;
  usuario_nome?: string;
  curso_nome?: string;
  quiz_titulo?: string;
}

interface CertificateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
  onSave: (updatedCertificate: Certificate) => void;
}

export const CertificateEditModal: React.FC<CertificateEditModalProps> = ({
  isOpen,
  onClose,
  certificateId,
  onSave
}) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    curso_nome: '',
    nota_final: 0,
    status: 'ativo' as 'ativo' | 'revogado' | 'expirado',
    categoria: ''
  });

  // Carregar dados do certificado quando o modal abrir
  useEffect(() => {
    if (isOpen && certificateId) {
      loadCertificate();
    }
  }, [isOpen, certificateId]);

  const loadCertificate = async () => {
    setLoading(true);
    try {
      const { data: cert, error } = await supabase
        .from('certificados')
        .select(`
          id, 
          categoria, 
          nota_final, 
          status, 
          data_emissao,
          numero_certificado,
          usuario_id,
          curso_id,
          quiz_id,
          link_pdf_certificado,
          qr_code_url,
          data_criacao,
          data_atualizacao
        `)
        .eq('id', certificateId)
        .single();

      if (error) {
        throw error;
      }

      if (cert) {
        setCertificate(cert);
        setFormData({
          curso_nome: cert.curso_nome || cert.categoria,
          nota_final: cert.nota_final,
          status: cert.status,
          categoria: cert.categoria
        });
      }
    } catch (error) {
      console.error('Erro ao carregar certificado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do certificado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!certificate) return;

    setSaving(true);
    try {
      const { data: updatedCert, error } = await supabase
        .from('certificados')
        .update({
          curso_nome: formData.curso_nome,
          nota_final: formData.nota_final,
          status: formData.status,
          categoria: formData.categoria,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', certificateId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Certificado atualizado com sucesso.",
        variant: "default"
      });

      // Atualizar o certificado local com os novos dados
      const updatedCertificate = {
        ...certificate,
        ...updatedCert,
        curso_nome: formData.curso_nome
      };

      onSave(updatedCertificate);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar certificado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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
            <Edit className="h-5 w-5 text-green-600" />
            Editar Certificado
          </DialogTitle>
        </DialogHeader>

        {certificate && (
          <div className="space-y-6">
            {/* Informações do certificado */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                Informações do Certificado
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Número:</span>
                  <Badge variant="outline" className="font-mono">
                    {certificate.numero_certificado}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Emissão:</span>
                  <span>{formatDate(certificate.data_emissao)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Criação:</span>
                  <span>{formatDate(certificate.data_criacao)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Última atualização:</span>
                  <span>{formatDate(certificate.data_atualizacao)}</span>
                </div>
              </div>
            </div>

            {/* Formulário de edição */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Editar Informações</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome do Curso */}
                <div className="space-y-2">
                  <Label htmlFor="curso_nome" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Nome do Curso
                  </Label>
                  <Input
                    id="curso_nome"
                    value={formData.curso_nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, curso_nome: e.target.value }))}
                    placeholder="Digite o nome do curso"
                    disabled={saving}
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    placeholder="Ex: PABX, Call Center"
                    disabled={saving}
                  />
                </div>

                {/* Nota Final */}
                <div className="space-y-2">
                  <Label htmlFor="nota_final" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Nota Final (%)
                  </Label>
                  <Input
                    id="nota_final"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.nota_final}
                    onChange={(e) => setFormData(prev => ({ ...prev, nota_final: parseInt(e.target.value) || 0 }))}
                    disabled={saving}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'ativo' | 'revogado' | 'expirado') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="revogado">Revogado</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
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