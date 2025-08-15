// ========================================
// PÁGINA: Módulo de IA - Menu Principal
// ========================================
// Feature Flag: FEATURE_AI=true

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Settings, 
  Database, 
  BarChart3, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { isAIEnabled } from '@/lib/ai-utils';

// Componentes das abas
import { Assistente } from './Assistente';
import { Conexoes } from './Conexoes';
import { Conhecimento } from './Conhecimento';
import { LogsCustos } from './LogsCustos';
import { Seguranca } from './Seguranca';

export default function AIModulePage() {
  const { isEnabled, loading, error } = useAI();

  // Se IA não está habilitada, mostrar aviso
  if (!isAIEnabled()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Módulo de IA
            </CardTitle>
            <CardDescription>
              Configuração e gerenciamento de inteligência artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O módulo de IA não está habilitado. Para ativá-lo, configure a variável de ambiente{' '}
                <code className="bg-muted px-1 py-0.5 rounded">FEATURE_AI=true</code>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se está carregando
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Módulo de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se há erro
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Módulo de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar módulo de IA: {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não está habilitado
  if (!isEnabled) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Módulo de IA
            </CardTitle>
            <CardDescription>
              Configuração e gerenciamento de inteligência artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                O módulo de IA não está habilitado para esta organização.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            Módulo de IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure e gerencie inteligência artificial para sua organização
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Ativo
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Provedores"
          value="0"
          description="Configurados"
          icon={Database}
          color="blue"
        />
        <StatusCard
          title="Assistentes"
          value="0"
          description="Ativos"
          icon={Bot}
          color="green"
        />
        <StatusCard
          title="Fontes"
          value="0"
          description="Indexadas"
          icon={Settings}
          color="purple"
        />
        <StatusCard
          title="Sessões"
          value="0"
          description="Este mês"
          icon={BarChart3}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de IA</CardTitle>
          <CardDescription>
            Gerencie provedores, assistentes, conhecimento e segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assistente" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="assistente" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Assistente
              </TabsTrigger>
              <TabsTrigger value="conexoes" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Conexões
              </TabsTrigger>
              <TabsTrigger value="conhecimento" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Conhecimento
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Logs & Custos
              </TabsTrigger>
              <TabsTrigger value="seguranca" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assistente" className="mt-6">
              <Assistente />
            </TabsContent>

            <TabsContent value="conexoes" className="mt-6">
              <Conexoes />
            </TabsContent>

            <TabsContent value="conhecimento" className="mt-6">
              <Conhecimento />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <LogsCustos />
            </TabsContent>

            <TabsContent value="seguranca" className="mt-6">
              <Seguranca />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais usadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Bot className="h-6 w-6" />
              <span>Testar Chat</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Database className="h-6 w-6" />
              <span>Adicionar Provedor</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Upload Documento</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de card de status
interface StatusCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatusCard({ title, value, description, icon: Icon, color }: StatusCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
  };

  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
