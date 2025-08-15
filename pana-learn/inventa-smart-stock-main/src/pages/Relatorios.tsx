
import { ERALayout } from '@/components/ERALayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { useState } from 'react';

const Relatorios = () => {
  const [filters, setFilters] = useState({
    usuario: '',
    email: '',
    curso: '',
    categoria: '',
    dataInicio: '',
    dataConclusao: '',
    status: '',
    progresso: '',
    nota: ''
  });

  const [reportData] = useState([
    {
      id: 1,
      usuario: 'João Silva',
      email: 'joao@empresa.com',
      matricula: '001',
      curso: 'Introdução ao PABX',
      categoria: 'VoIP',
      dataInicio: '2024-01-15',
      dataConclusao: '2024-01-20',
      status: 'Concluído',
      progresso: 100,
      nota: 85,
      certificado: 'Sim',
      dataEmissao: '2024-01-20',
      tempoAssistido: '120 min',
      feedback: 'Excelente conteúdo'
    },
    {
      id: 2,
      usuario: 'Maria Santos',
      email: 'maria@empresa.com',
      matricula: '002',
      curso: 'Configuração Omnichannel',
      categoria: 'Omnichannel',
      dataInicio: '2024-01-10',
      dataConclusao: '',
      status: 'Em andamento',
      progresso: 65,
      nota: 0,
      certificado: 'Não',
      dataEmissao: '',
      tempoAssistido: '95 min',
      feedback: ''
    }
  ]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ERALayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-era-dark-blue">Relatórios</h1>
          <p className="text-era-gray">Relatórios de usuários, progresso e rastreabilidade</p>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-era-dark-blue">
              <Filter className="h-5 w-5" />
              Filtros de Pesquisa
            </CardTitle>
            <CardDescription>
              Utilize os filtros abaixo para personalizar seus relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário</Label>
                <Input
                  id="usuario"
                  placeholder="Nome completo ou login"
                  value={filters.usuario}
                  onChange={(e) => handleFilterChange('usuario', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email / Matrícula</Label>
                <Input
                  id="email"
                  placeholder="Email ou matrícula"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso">Curso / Módulo</Label>
                <Input
                  id="curso"
                  placeholder="Nome do treinamento"
                  value={filters.curso}
                  onChange={(e) => handleFilterChange('curso', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  placeholder="VoIP, Omnichannel, etc."
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataConclusao">Data de Conclusão</Label>
                <Input
                  id="dataConclusao"
                  type="date"
                  value={filters.dataConclusao}
                  onChange={(e) => handleFilterChange('dataConclusao', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Não iniciado">Não iniciado</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="progresso">% Progresso Mínimo</Label>
                <Input
                  id="progresso"
                  type="number"
                  placeholder="0-100"
                  value={filters.progresso}
                  onChange={(e) => handleFilterChange('progresso', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="era-lime-button">
                <Search className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
              <Button variant="outline">
                Limpar Filtros
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-era-dark-blue">Relatório de Usuários e Treinamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email/Matrícula</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Certificado</TableHead>
                    <TableHead>Tempo Assistido</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.usuario}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.curso}</TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'Concluído' 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Em andamento'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>{item.progresso}%</TableCell>
                      <TableCell>{item.nota || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.certificado === 'Sim' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.certificado}
                        </span>
                      </TableCell>
                      <TableCell>{item.tempoAssistido}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ERALayout>
  );
};

export default Relatorios;
