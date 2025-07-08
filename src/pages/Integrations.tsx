import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OlgaApiSettings } from '@/components/settings/OlgaApiSettings';
import { OpenAISettings } from '@/components/settings/OpenAISettings';
import { 
  Settings, 
  Zap, 
  Brain, 
  Database,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Workflow
} from 'lucide-react';
import { olgaApi } from '@/services/olgaApiService';
import { Button } from '@/components/ui/button';

const Integrations = () => {
  const olgaStatus = olgaApi.getConnectionStatus();
  const hasOpenAI = !!localStorage.getItem('openai_api_key');
  const hasAnthropic = !!localStorage.getItem('anthropic_api_key');

  const getStatusIcon = (connected: boolean) => {
    return connected ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? 
      'bg-green-100 text-green-800 border-green-200' : 
      'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const integrationCards = [
    {
      id: 'olga',
      title: 'API Olga',
      description: 'Processamento real de documentos com IA especializada em seguros',
      status: olgaStatus.connected,
      mode: olgaStatus.mode,
      features: [
        'Análise de sinistros automática',
        'Detecção de fraudes avançada',
        'Workflows personalizáveis',
        'Extração de dados estruturados'
      ],
      type: 'primary'
    },
    {
      id: 'openai',
      title: 'OpenAI GPT',
      description: 'Modelos GPT para análise e processamento de linguagem natural',
      status: hasOpenAI,
      mode: hasOpenAI ? 'real' : 'fallback',
      features: [
        'Análise conversacional',
        'Processamento de texto',
        'Geração de relatórios',
        'Suporte multilíngue'
      ],
      type: 'secondary'
    },
    {
      id: 'anthropic',
      title: 'Anthropic Claude',
      description: 'Modelos Claude para análise detalhada e reasoning',
      status: hasAnthropic,
      mode: hasAnthropic ? 'real' : 'fallback',
      features: [
        'Análise jurídica detalhada',
        'Reasoning complexo',
        'Processamento de documentos longos',
        'Análise de compliance'
      ],
      type: 'secondary'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Integrações e APIs
        </h1>
        <p className="text-muted-foreground">
          Configure e gerencie as conexões com APIs de IA para processamento real
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrationCards.map((integration) => (
          <Card key={integration.id} className={integration.status ? 'border-green-200' : 'border-yellow-200'}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {integration.id === 'olga' && <Database className="h-5 w-5" />}
                  {integration.id === 'openai' && <Brain className="h-5 w-5" />}
                  {integration.id === 'anthropic' && <Zap className="h-5 w-5" />}
                  {integration.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(integration.status)}
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {integration.description}
              </p>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Modo: <span className="font-medium">{integration.mode === 'real' ? 'API Real' : 'Fallback'}</span>
                </div>
                <div className="space-y-1">
                  {integration.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {integration.features.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{integration.features.length - 2} mais funcionalidades
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Configuração de Integrações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="olga" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="olga" className="gap-2">
                <Database className="h-4 w-4" />
                API Olga
              </TabsTrigger>
              <TabsTrigger value="openai" className="gap-2">
                <Brain className="h-4 w-4" />
                OpenAI
              </TabsTrigger>
              <TabsTrigger value="anthropic" className="gap-2">
                <Zap className="h-4 w-4" />
                Claude
              </TabsTrigger>
            </TabsList>

            <TabsContent value="olga" className="space-y-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>API Olga:</strong> A integração principal para processamento real de documentos de seguros. 
                  Configure a API key para acessar funcionalidades avançadas de análise e detecção de fraudes.
                </AlertDescription>
              </Alert>
              <OlgaApiSettings />
            </TabsContent>

            <TabsContent value="openai" className="space-y-4">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>OpenAI GPT:</strong> Modelos de linguagem avançados para análise conversacional e processamento de texto. 
                  Funciona como complemento à API Olga para cenários que exigem processamento de linguagem natural.
                </AlertDescription>
              </Alert>
              <OpenAISettings />
            </TabsContent>

            <TabsContent value="anthropic" className="space-y-4">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Anthropic Claude:</strong> Especializado em análise detalhada e reasoning complexo. 
                  Ideal para análises jurídicas e compliance que exigem interpretação sofisticada.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Zap className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">Configuração do Claude</h3>
                        <p className="text-sm text-muted-foreground">
                          A configuração do Anthropic Claude será implementada em breve.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline">Em Desenvolvimento</Badge>
                        <p className="text-xs text-muted-foreground">
                          Por enquanto, use OpenAI ou Olga API para processamento de IA
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Priority Order Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Ordem de Prioridade das APIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O sistema usa as APIs na seguinte ordem de prioridade:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <div className="font-medium">API Olga</div>
                  <div className="text-sm text-muted-foreground">
                    Processamento especializado em seguros - mais preciso e específico
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <div className="font-medium">OpenAI / Claude</div>
                  <div className="text-sm text-muted-foreground">
                    Modelos de linguagem geral - para análise conversacional e texto
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <div className="font-medium">Modo Fallback</div>
                  <div className="text-sm text-muted-foreground">
                    Simulações e respostas mock - para demonstração e desenvolvimento
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integrations;