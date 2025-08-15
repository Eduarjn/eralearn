import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  Calendar, 
  Eye, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Certificate {
  id: string;
  numero_certificado: string;
  nota_final: number;
  status: 'ativo' | 'revogado' | 'expirado';
  data_emissao: string;
}

interface Course {
  id: string;
  nome: string;
  categoria: string;
  certificados: Certificate[];
}

interface CourseCertificateCardProps {
  course: Course;
  onViewCertificates: (course: Course) => void;
  onEditConfig: (course: Course) => void;
}

export const CourseCertificateCard: React.FC<CourseCertificateCardProps> = ({
  course,
  onViewCertificates,
  onEditConfig
}) => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';

  // Calcular estatísticas
  const totalCertificates = course.certificados.length;
  const mediaNota = totalCertificates > 0 
    ? Math.round(course.certificados.reduce((sum, cert) => sum + cert.nota_final, 0) / totalCertificates)
    : 0;

  const statusBreakdown = course.certificados.reduce((acc, cert) => {
    acc[cert.status] = (acc[cert.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ultimaEmissao = course.certificados.length > 0
    ? new Date(Math.max(...course.certificados.map(c => new Date(c.data_emissao).getTime())))
    : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base lg:text-lg font-semibold text-gray-900 mb-2 truncate">
              {course.nome}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {course.categoria}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {totalCertificates} certificado{totalCertificates !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEditConfig(course)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Editar configuração"
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </Button>
            )}
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          {/* Total de Certificados */}
          <div className="flex items-center text-xs lg:text-sm text-gray-600">
            <Trophy className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Total:</span>
            <span className="ml-1 font-semibold">{totalCertificates}</span>
          </div>

          {/* Média de Nota */}
          <div className="flex items-center text-xs lg:text-sm text-gray-600">
            <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Média:</span>
            <span className="ml-1 font-semibold">{mediaNota}%</span>
          </div>

          {/* Status dos Certificados */}
          <div className="space-y-1">
            <div className="flex items-center text-xs lg:text-sm text-gray-600">
              <Users className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Status:</span>
            </div>
            <div className="ml-5 space-y-1">
              {statusBreakdown.ativo > 0 && (
                <div className="flex items-center text-xs text-green-600">
                  {getStatusIcon('ativo')}
                  <span className="ml-1">{statusBreakdown.ativo} ativo{statusBreakdown.ativo !== 1 ? 's' : ''}</span>
                </div>
              )}
              {statusBreakdown.revogado > 0 && (
                <div className="flex items-center text-xs text-red-600">
                  {getStatusIcon('revogado')}
                  <span className="ml-1">{statusBreakdown.revogado} revogado{statusBreakdown.revogado !== 1 ? 's' : ''}</span>
                </div>
              )}
              {statusBreakdown.expirado > 0 && (
                <div className="flex items-center text-xs text-yellow-600">
                  {getStatusIcon('expirado')}
                  <span className="ml-1">{statusBreakdown.expirado} expirado{statusBreakdown.expirado !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Última Emissão */}
          {ultimaEmissao && (
            <div className="flex items-center text-xs lg:text-sm text-gray-600">
              <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Última emissão:</span>
              <span className="ml-1">{formatDate(ultimaEmissao)}</span>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewCertificates(course)}
            className="flex-1 text-xs lg:text-sm"
          >
            <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Ver Certificados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 