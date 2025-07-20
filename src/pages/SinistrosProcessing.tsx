import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormularioSinistro } from '@/components/sinistros/FormularioSinistro';
import { DashboardSinistros } from '@/components/sinistros/DashboardSinistros';
import { WorkflowResponse } from '@/services/n8nWorkflowService';
import { 
  Plus, 
  BarChart3, 
  FileText, 
  Settings, 
  Zap,
  Brain,
  Shield,
  Clock
} from 'lucide-react';

export const SinistrosProcessing: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastCreatedSinistro, setLastCreatedSinistro] = useState<WorkflowResponse | null>(null);

  const handleSinistroCreated = (response: WorkflowResponse) => {
    setLastCreatedSinistro(response);
    setActiveTab('dashboard');
  };

  const workflowsStatus = [
    {
      id: '0nhRt9eZpofq7uId',
      name: 'Triagem Inicial',
      status: 'ativo',
      webhook: '/api/sinistro/novo',
      processados: 1247,
      sucesso: 98.5
    },
    {
      id: 'OkUSgiJvegzymP3D',
      name: 'Acidentes Pessoais',
      status: 'ativo',
      webhook: '/api/acidentes-pessoais',
      processados: 856,
      sucesso: 96.2
    },
    {
      id: 'AskBTe0fgEowJBy6',
      name: 'Bagagem/Mercadoria',
      status: 'ativo',
      webhook: '/api/bagagem-mercadoria',
      processados: 391,
      sucesso: 94.8
    }
  ];

  const mcpServices = [
    {
      name: 'Análise de Documentos',
      model: 'GPT-4 Vision',
      status: 'ativo',
      confianca: 97.3,
      tempoMedio: '2.1s'
    },
    {
      name: 'Análise de Imagens',
      model: 'Claude 3.5 Sonnet',
      status: 'ativo',
      confianca: 95.8,
      tempoMedio: '3.4s'
    },
    {
      name: 'Detecção de Fraudes',
      model: 'GPT-4',
      status: 'ativo',
      confianca: 92.7,
      tempoMedio: '1.8s'
    },
    {
      name: 'Validação de Dados',
      model: 'Claude 3 Haiku',
      status: 'ativo',
      confianca: 99.1,
      tempoMedio: '0.9s'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sistema de Análise de Sinistros - 88i</h1>
        <p className="text-muted-foreground">
          Processamento automatizado de sinistros com IA e workflows n8n integrados via MCP
        </p>
      </div>

      {lastCreatedSinistro && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Último sinistro criado:</span>
              <Badge className="bg-green-100 text-green-800">
                {lastCreatedSinistro.numero_sinistro}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Status: {lastCreatedSinistro.status}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="novo" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo Sinistro</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="mcp" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>MCP Status</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardSinistros />
        </TabsContent>

        <TabsContent value="novo" className="space-y-4">
          <FormularioSinistro onSinistroCreated={handleSinistroCreated} />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowsStatus.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge className={
                      workflow.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {workflow.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">Webhook:</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {workflow.webhook}
                    </code>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium">Processados</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {workflow.processados.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Taxa Sucesso</p>
                      <p className="text-2xl font-bold text-green-600">
                        {workflow.sucesso}%
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-4 h-4 mr-1" />
                      Config
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="w-4 h-4 mr-1" />
                      Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Processamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Triagem Inicial</h4>
                    <p className="text-sm text-muted-foreground">
                      Validação, classificação e roteamento automático
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">n8n</Badge>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-px h-8 bg-gray-300" />
                </div>

                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Análise Especializada</h4>
                    <p className="text-sm text-muted-foreground">
                      Processamento específico por tipo de sinistro
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">MCP + IA</Badge>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-px h-8 bg-gray-300" />
                </div>

                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Decisão e Aprovação</h4>
                    <p className="text-sm text-muted-foreground">
                      Decisão automatizada e notificação das partes
                    </p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Workflow</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mcpServices.map((service, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge className={
                      service.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Modelo:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {service.model}
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-medium">Confiança</p>
                        <p className="text-lg font-bold text-green-600">
                          {service.confianca}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Tempo Médio</p>
                        <p className="text-lg font-bold text-blue-600">
                          {service.tempoMedio}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integração MCP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Model Context Protocol (MCP)</h4>
                  <p className="text-sm text-blue-700">
                    Protocolo padronizado para integração entre n8n e múltiplos LLMs, 
                    permitindo análise inteligente de documentos, imagens e detecção de fraudes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 border rounded">
                    <div className="font-semibold text-lg text-blue-600">4</div>
                    <div className="text-muted-foreground">Servidores MCP</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="font-semibold text-lg text-green-600">3</div>
                    <div className="text-muted-foreground">LLMs Integrados</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="font-semibold text-lg text-orange-600">95.7%</div>
                    <div className="text-muted-foreground">Acurácia Média</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-2">Próximas Implementações:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Integração com APIs externas (Receita Federal, Detran)</li>
                    <li>• Análise de padrões de fraude com ML avançado</li>
                    <li>• Processamento de vídeos para acidentes</li>
                    <li>• Chat conversacional para esclarecimentos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};