import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAI } from '@/hooks/useAI';
import { 
  BarChart3, 
  Download, 
  Filter,
  Search,
  Calendar,
  User,
  DollarSign,
  Clock,
  XCircle
} from 'lucide-react';

export function LogsCustos() {
  const { useAIUsage } = useAI();
  const { logs, loading, error, exportLogs } = useAIUsage();
  
  const [filters, setFilters] = React.useState({
    dateFrom: '',
    dateTo: '',
    user: '',
    course: '',
    search: ''
  });

  const handleExport = async () => {
    try {
      await exportLogs(filters);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(cost);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar logs: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logs & Custos</h2>
          <p className="text-muted-foreground">
            Monitore o uso da IA e controle os custos
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data Início</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data Fim</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="user">Usuário</Label>
              <Input
                id="user"
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <Label htmlFor="course">Curso</Label>
              <Input
                id="course"
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                placeholder="Nome do curso"
              />
            </div>
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Pergunta ou resposta"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Interações</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">$45.67</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Únicos</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Interações</CardTitle>
          <CardDescription>
            Log detalhado de todas as interações com a IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Usuário</th>
                  <th className="text-left p-2">Pergunta</th>
                  <th className="text-left p-2">Tokens</th>
                  <th className="text-left p-2">Custo</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {log.user_name || 'Usuário'}
                      </div>
                    </td>
                    <td className="p-2 max-w-xs truncate">
                      {log.question}
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div>P: {log.prompt_tokens}</div>
                        <div>C: {log.completion_tokens}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      {formatCost(log.cost_usd)}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? 'Sucesso' : 'Erro'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!logs || logs.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
