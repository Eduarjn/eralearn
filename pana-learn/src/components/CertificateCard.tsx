import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  User, 
  BookOpen, 
  Calendar, 
  Eye, 
  Download, 
  Copy, 
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  // Dados relacionados
  usuario_nome?: string;
  curso_nome?: string;
  quiz_titulo?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  onViewDetails: (certificate: Certificate) => void;
  onDownload: (certificate: Certificate) => void;
  onEdit: (certificate: Certificate) => void;
  onCopyNumber: (certificate: Certificate) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onViewDetails,
  onDownload,
  onEdit,
  onCopyNumber
}) => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'revogado':
        return <Badge className="bg-red-100 text-red-800">Revogado</Badge>;
      case 'expirado':
        return <Badge className="bg-yellow-100 text-yellow-800">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'revogado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expirado':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCopyNumber = () => {
    onCopyNumber(certificate);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base lg:text-lg font-semibold text-gray-900 mb-2 truncate">
              {certificate.usuario_nome || 'Usuário não informado'}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(certificate.status)}
              <Badge variant="outline" className="text-xs">
                {certificate.nota_final}%
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(certificate)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Editar certificado"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </Button>
            )}
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          {/* Número do certificado */}
          <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium mr-2">Número:</span>
              <span className="font-mono text-xs">{certificate.numero_certificado}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyNumber}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* Status com ícone */}
          <div className="flex items-center text-xs lg:text-sm text-gray-600">
            {getStatusIcon(certificate.status)}
            <span className="font-medium ml-2">Status:</span>
            <span className="ml-1 capitalize">{certificate.status}</span>
          </div>

          {/* Usuário */}
          <div className="flex items-center text-xs lg:text-sm text-gray-600">
            <User className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Usuário:</span>
            <span className="ml-1 truncate">{certificate.usuario_nome}</span>
          </div>

          {/* Curso/Categoria */}
          <div className="flex items-center text-xs lg:text-sm text-gray-600">
            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Curso:</span>
            <span className="ml-1 truncate">{certificate.curso_nome || certificate.categoria}</span>
          </div>

          {/* Nota */}
          <div className="flex items-center text-xs lg:text-sm text-gray-600">
            <Trophy className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Nota:</span>
            <span className="ml-1">{certificate.nota_final}%</span>
          </div>

          {/* Data de Emissão */}
          <div className="flex items-center text-xs lg:text-sm text-gray-600">
            <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Emissão:</span>
            <span className="ml-1">{formatDate(certificate.data_emissao)}</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(certificate)}
            className="flex-1 text-xs lg:text-sm"
          >
            <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Detalhes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(certificate)}
            className="flex-1 text-xs lg:text-sm"
          >
            <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 