
import { ERALayout } from '@/components/ERALayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Globe, Mail, Shield, Database, Bell, Palette } from 'lucide-react';
import { useState } from 'react';

const Configuracoes = () => {
  const [config, setConfig] = useState({
    // Configurações Gerais
    nomeEmpresa: 'ERA LEARN',
    slogan: 'Smart Training',
    email: 'admin@eralearn.com',
    telefone: '+55 (11) 99999-9999',
    endereco: 'Rua das Empresas, 123 - São Paulo/SP',
    
    // Configurações de Sistema
    maxUsuarios: '100',
    tempoSessao: '120',
    backup: 'Diário',
    manutencao: 'Domingo 02:00',
    
    // Configurações de Notificações
    emailNotificacoes: true,
    pushNotificacoes: true,
    relatoriosAutomaticos: true,
    
    // Configurações de Certificados
    validadeCertificado: '365',
    modeloCertificado: 'Padrão ERA',
    assinaturaDigital: true
  });

  const handleConfigChange = (field: string, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Configurações salvas:', config);
  };

  return (
    <ERALayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-era-dark-blue">Configurações</h1>
          <p className="text-era-gray">Gerencie as configurações da plataforma</p>
        </div>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-era-dark-blue">
              <Globe className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Informações básicas da empresa e plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                <Input
                  id="nomeEmpresa"
                  value={config.nomeEmpresa}
                  onChange={(e) => handleConfigChange('nomeEmpresa', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input
                  id="slogan"
                  value={config.slogan}
                  onChange={(e) => handleConfigChange('slogan', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => handleConfigChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={config.telefone}
                  onChange={(e) => handleConfigChange('telefone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={config.endereco}
                onChange={(e) => handleConfigChange('endereco', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-era-dark-blue">
              <Database className="h-5 w-5" />
              Configurações de Sistema
            </CardTitle>
            <CardDescription>
              Parâmetros técnicos e de desempenho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsuarios">Máximo de Usuários</Label>
                <Input
                  id="maxUsuarios"
                  type="number"
                  value={config.maxUsuarios}
                  onChange={(e) => handleConfigChange('maxUsuarios', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempoSessao">Tempo de Sessão (minutos)</Label>
                <Input
                  id="tempoSessao"
                  type="number"
                  value={config.tempoSessao}
                  onChange={(e) => handleConfigChange('tempoSessao', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup">Frequência de Backup</Label>
                <select
                  id="backup"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={config.backup}
                  onChange={(e) => handleConfigChange('backup', e.target.value)}
                >
                  <option value="Diário">Diário</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Mensal">Mensal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manutencao">Janela de Manutenção</Label>
                <Input
                  id="manutencao"
                  value={config.manutencao}
                  onChange={(e) => handleConfigChange('manutencao', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-era-dark-blue">
              <Bell className="h-5 w-5" />
              Configurações de Notificações
            </CardTitle>
            <CardDescription>
              Gerencie como e quando enviar notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotificacoes">Notificações por Email</Label>
                <p className="text-sm text-era-gray">Enviar notificações por email para usuários</p>
              </div>
              <input
                type="checkbox"
                id="emailNotificacoes"
                checked={config.emailNotificacoes}
                onChange={(e) => handleConfigChange('emailNotificacoes', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotificacoes">Notificações Push</Label>
                <p className="text-sm text-era-gray">Enviar notificações push no navegador</p>
              </div>
              <input
                type="checkbox"
                id="pushNotificacoes"
                checked={config.pushNotificacoes}
                onChange={(e) => handleConfigChange('pushNotificacoes', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="relatoriosAutomaticos">Relatórios Automáticos</Label>
                <p className="text-sm text-era-gray">Enviar relatórios mensais automaticamente</p>
              </div>
              <input
                type="checkbox"
                id="relatoriosAutomaticos"
                checked={config.relatoriosAutomaticos}
                onChange={(e) => handleConfigChange('relatoriosAutomaticos', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Certificados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-era-dark-blue">
              <Shield className="h-5 w-5" />
              Configurações de Certificados
            </CardTitle>
            <CardDescription>
              Parâmetros para emissão de certificados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validadeCertificado">Validade do Certificado (dias)</Label>
                <Input
                  id="validadeCertificado"
                  type="number"
                  value={config.validadeCertificado}
                  onChange={(e) => handleConfigChange('validadeCertificado', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modeloCertificado">Modelo do Certificado</Label>
                <select
                  id="modeloCertificado"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={config.modeloCertificado}
                  onChange={(e) => handleConfigChange('modeloCertificado', e.target.value)}
                >
                  <option value="Padrão ERA">Padrão ERA</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Personalizado">Personalizado</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="assinaturaDigital">Assinatura Digital</Label>
                <p className="text-sm text-era-gray">Incluir assinatura digital nos certificados</p>
              </div>
              <input
                type="checkbox"
                id="assinaturaDigital"
                checked={config.assinaturaDigital}
                onChange={(e) => handleConfigChange('assinaturaDigital', e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="era-lime-button" onClick={handleSave}>
            <Settings className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </ERALayout>
  );
};

export default Configuracoes;
