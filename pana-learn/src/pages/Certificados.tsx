import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ERALayout } from '@/components/ERALayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Download, 
  Eye, 
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  Target,
  Award,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { downloadCertificateAsPDF, openCertificateInNewWindow } from '@/utils/certificateGenerator';
import type { Certificate } from '@/types/certificate';

interface CertificateStats {
  total: number;
  ativos: number;
  revogados: number;
  expirados: number;
  mediaNota: number;
}

const Certificados: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>({
    total: 0,
    ativos: 0,
    revogados: 0,
    expirados: 0,
    mediaNota: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos');

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, statusFilter, categoriaFilter]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando carregamento de certificados...');
      console.log('👤 UserProfile:', userProfile);

      // Verificar se é admin
      const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';
      console.log('👤 Tipo de usuário:', userProfile?.tipo_usuario, 'É admin:', isAdmin);

      if (isAdmin) {
        // Para administradores: buscar TODOS os certificados
        console.log('🔍 Buscando TODOS os certificados (admin)...');
        
        const { data: allCertificates, error: adminError } = await supabase
          .from('certificados')
          .select(`
            *,
            usuarios!certificados_usuario_id_fkey (
              nome,
              email
            ),
            cursos!certificados_curso_id_fkey (
              nome,
              categoria
            )
          `)
          .order('data_emissao', { ascending: false });

        if (adminError) {
          console.error('❌ Erro admin:', adminError);
          throw adminError;
        }

        console.log('✅ Certificados encontrados (admin):', allCertificates?.length || 0);
        console.log('📋 Dados dos certificados:', allCertificates);
        setCertificates(allCertificates || []);
        calculateStats(allCertificates || []);
        
      } else if (userProfile?.id) {
        // Para clientes: buscar certificados do usuário
        console.log('🔍 Buscando certificados do usuário (cliente)...');
        console.log('🆔 ID do usuário:', userProfile.id);
        
        const { data: userCertificates, error: userError } = await supabase
          .from('certificados')
          .select(`
            *,
            usuarios!certificados_usuario_id_fkey (
              nome,
              email
            ),
            cursos!certificados_curso_id_fkey (
              nome,
              categoria
            )
          `)
          .eq('usuario_id', userProfile.id)
          .order('data_emissao', { ascending: false });

        if (userError) {
          console.error('❌ Erro cliente:', userError);
          throw userError;
        }

        console.log('✅ Certificados encontrados (cliente):', userCertificates?.length || 0);
        console.log('📋 Dados dos certificados:', userCertificates);
        setCertificates(userCertificates || []);
        calculateStats(userCertificates || []);
      } else {
        console.log('⚠️ Usuário não autenticado ou sem ID');
        setCertificates([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('❌ Erro geral ao carregar certificados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar certificados. Tente novamente.',
        variant: 'destructive'
      });
      setCertificates([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (certs: Certificate[]) => {
    const total = certs.length;
    const ativos = certs.filter(c => c.status === 'ativo').length;
    const revogados = certs.filter(c => c.status === 'revogado').length;
    const expirados = certs.filter(c => c.status === 'expirado').length;
    const mediaNota = total > 0 ? certs.reduce((sum, c) => sum + (c.nota_final || c.nota || 0), 0) / total : 0;

    setStats({
      total,
      ativos,
      revogados,
      expirados,
      mediaNota: Math.round(mediaNota * 100) / 100
    });
  };

  const filterCertificates = () => {
    console.log('🔍 Filtrando certificados...');
    console.log('📊 Certificados originais:', certificates.length);
    console.log('🔍 Termo de busca:', searchTerm);
    console.log('🔍 Filtro de status:', statusFilter);
    console.log('🔍 Filtro de categoria:', categoriaFilter);
    
    let filtered = certificates;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.numero_certificado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.usuario_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.curso_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.usuarios?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.cursos?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    // Filtro por categoria
    if (categoriaFilter !== 'todos') {
      filtered = filtered.filter(cert => cert.categoria === categoriaFilter);
    }

    console.log('✅ Certificados filtrados:', filtered.length);
    setFilteredCertificates(filtered);
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      console.log('📥 Iniciando download do certificado:', certificate.numero_certificado);
      
      toast({
        title: 'Download',
        description: `Gerando PDF para: ${certificate.curso_nome || certificate.cursos?.nome}`,
      });
      
      // Usar o gerador de PDF
      const success = await downloadCertificateAsPDF(certificate);
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: `Certificado ${certificate.numero_certificado} baixado com sucesso!`,
        });
      } else {
        throw new Error('Falha ao gerar PDF');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer download:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer download do certificado. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleView = async (certificate: Certificate) => {
    try {
      console.log('👁️ Visualizando certificado:', certificate.numero_certificado);
      
      toast({
        title: 'Visualizar',
        description: `Abrindo certificado: ${certificate.curso_nome || certificate.cursos?.nome}`,
      });
      
      // Usar o gerador de PDF para visualizar
      const success = await openCertificateInNewWindow(certificate);
      
      if (!success) {
        throw new Error('Falha ao abrir certificado');
      }
    } catch (error) {
      console.error('❌ Erro ao visualizar certificado:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao visualizar certificado. Tente novamente.',
        variant: 'destructive'
      });
    }
  };



  if (loading) {
    return (
      <ERALayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg">Carregando certificados...</p>
          </div>
        </div>
      </ERALayout>
    );
  }

  return (
    <ERALayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        {/* Hero Section com gradiente */}
        <div className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md" style={{background: 'linear-gradient(90deg, #000000 0%, #4A4A4A 40%, #34C759 100%)'}}>
          <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                    <span className="text-xs lg:text-sm font-medium text-white/90">Sistema de Certificação</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-3 text-white">
                    Certificados
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg md:text-xl text-white/90 max-w-2xl">
                    Visualize e gerencie todos os certificados emitidos pela plataforma
                  </p>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Award className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>{stats.total} certificados emitidos</span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>{stats.ativos} certificados ativos</span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                      <Target className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                      <span>{stats.mediaNota}% média geral</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Filtros com design melhorado */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
                    <Input
                      placeholder="Pesquisar certificados..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 lg:pl-12 h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 lg:w-56 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300">
                      <Filter className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-gray-400" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="revogado">Revogado</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                    <SelectTrigger className="w-full sm:w-48 lg:w-56 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300">
                      <Filter className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-gray-400" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Categorias</SelectItem>
                      <SelectItem value="PABX">PABX</SelectItem>
                      <SelectItem value="OMNICHANNEL">OMNICHANNEL</SelectItem>
                      <SelectItem value="CALLCENTER">CALLCENTER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>



            {/* Lista de Certificados */}
            <div className="space-y-4 lg:space-y-6">
              {filteredCertificates.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum certificado encontrado</h3>
                    <p className="text-gray-600 text-center">
                      {searchTerm || statusFilter !== 'todos' || categoriaFilter !== 'todos'
                        ? 'Tente ajustar os filtros de busca.'
                        : 'Você ainda não possui certificados emitidos.'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredCertificates.map((certificate) => (
                  <Card key={certificate.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {certificate.curso_nome || certificate.cursos?.nome || 'Curso não encontrado'}
                            </h3>
                            <Badge 
                              variant={certificate.status === 'ativo' ? 'default' : 'secondary'}
                              className={certificate.status === 'ativo' ? 'bg-green-500/20 text-green-500' : 'bg-gray-100 text-gray-600'}
                            >
                              {certificate.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium text-gray-900">Número:</span>
                              <p className="font-mono text-gray-900">{certificate.numero_certificado}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Categoria:</span>
                              <p className="text-gray-900">{certificate.categoria}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Nota:</span>
                              <p className="text-gray-900">{(certificate.nota_final || certificate.nota || 0)}%</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Emissão:</span>
                              <p className="text-gray-900">{new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}</p>
                            </div>
                            {certificate.usuarios && (
                              <div>
                                <span className="font-medium text-gray-900">Usuário:</span>
                                <p className="text-gray-900">{certificate.usuarios.nome}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(certificate)}
                            className="flex items-center gap-2 border-2 border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-600 transition-all duration-300"
                          >
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(certificate)}
                            className="flex items-center gap-2 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Estatísticas com design melhorado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{stats.total}</div>
                  <p className="text-white/90 font-medium text-sm lg:text-base">Total de Certificados</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{stats.ativos}</div>
                  <p className="text-white/90 font-medium text-sm lg:text-base">Certificados Ativos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <Target className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{stats.mediaNota}%</div>
                  <p className="text-white/90 font-medium text-sm lg:text-base">Média Geral</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">
                    {certificates && certificates.length > 0 
                      ? new Date(certificates[0].data_emissao).toLocaleDateString('pt-BR')
                      : '0'
                    }
                  </div>
                  <p className="text-white/90 font-medium text-sm lg:text-base">Última Emissão</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ERALayout>
  );
};

export default Certificados;