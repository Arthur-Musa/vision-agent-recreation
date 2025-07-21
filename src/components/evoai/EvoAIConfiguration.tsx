
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { evoAIService } from '@/services/evoAI/evoAIService';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Server,
  Key,
  TestTube,
  Zap
} from 'lucide-react';

const EvoAIConfiguration = () => {
  const [config, setConfig] = useState({
    baseURL: 'http://localhost:8080',
    apiKey: '',
    instanceName: 'olga-instance'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    // Carregar configuração salva
    evoAIService.loadConfig();
    const saved = localStorage.getItem('evoai_config');
    if (saved) {
      const savedConfig = JSON.parse(saved);
      setConfig(savedConfig);
      testConnection(savedConfig, false);
    }
  }, []);

  const testConnection = async (configToTest = config, showToast = true) => {
    setConnectionStatus('testing');
    setIsLoading(true);

    try {
      evoAIService.configure(configToTest.baseURL, configToTest.apiKey, configToTest.instanceName);
      const isHealthy = await evoAIService.healthCheck();
      
      if (isHealthy) {
        setIsConnected(true);
        setConnectionStatus('success');
        if (showToast) {
          toast({
            title: 'Conexão Estabelecida',
            description: 'Evo AI conectado com sucesso!',
          });
        }
      } else {
        setIsConnected(false);
        setConnectionStatus('error');
        if (showToast) {
          toast({
            title: 'Falha na Conexão',
            description: 'Não foi possível conectar ao Evo AI',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('error');
      if (showToast) {
        toast({
          title: 'Erro de Conexão',
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!config.baseURL || !config.apiKey || !config.instanceName) {
      toast({
        title: 'Configuração Incompleta',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    await testConnection(config);
  };

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setConnectionStatus('idle');
    setIsConnected(false);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Configuração Evo AI</h2>
        <Badge variant={isConnected ? 'default' : 'secondary'}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Badge>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="test">Testar Conexão</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Servidor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="baseURL">URL do Servidor Evo AI</Label>
                  <Input
                    id="baseURL"
                    placeholder="http://localhost:8080"
                    value={config.baseURL}
                    onChange={(e) => handleInputChange('baseURL', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL base da instalação do Evo AI
                  </p>
                </div>

                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sua-api-key-aqui"
                    value={config.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Chave de API gerada no Evo AI
                  </p>
                </div>

                <div>
                  <Label htmlFor="instanceName">Nome da Instância</Label>
                  <Input
                    id="instanceName"
                    placeholder="olga-instance"
                    value={config.instanceName}
                    onChange={(e) => handleInputChange('instanceName', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nome da instância criada no Evo AI
                  </p>
                </div>
              </div>

              <Button onClick={saveConfiguration} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Salvar e Testar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Status da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-2 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="font-medium">
                  {connectionStatus === 'idle' && 'Aguardando teste'}
                  {connectionStatus === 'testing' && 'Testando conexão...'}
                  {connectionStatus === 'success' && 'Conexão estabelecida'}
                  {connectionStatus === 'error' && 'Falha na conexão'}
                </span>
              </div>

              {connectionStatus === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Evo AI está funcionando corretamente. Você pode começar a criar e gerenciar agentes.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Não foi possível conectar ao Evo AI. Verifique:
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Se o servidor Evo AI está rodando</li>
                      <li>Se a URL está correta</li>
                      <li>Se a API key é válida</li>
                      <li>Se o nome da instância existe</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {isConnected ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground">Health Check</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {config.baseURL ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground">Configurado</div>
                </div>
              </div>

              <Button 
                onClick={() => testConnection()} 
                disabled={isLoading || !config.apiKey} 
                variant="outline" 
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Testar Conexão Novamente
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Evo AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose text-sm text-muted-foreground">
                <p>
                  O Evo AI é uma plataforma avançada para gerenciamento de agentes de IA que oferece:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Gerenciamento centralizado de múltiplos agentes</li>
                  <li>Suporte nativo ao protocolo MCP (Model Context Protocol)</li>
                  <li>Integração com múltiplos LLMs (OpenAI, Anthropic, Google, etc.)</li>
                  <li>Comunicação entre agentes (A2A)</li>
                  <li>Workflows colaborativos</li>
                  <li>Monitoramento e métricas avançadas</li>
                </ul>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Como configurar:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Instale o Evo AI: <code>npm install -g evolution-api</code></li>
                    <li>Inicie o servidor: <code>evolution-api start</code></li>
                    <li>Crie uma instância no painel admin</li>
                    <li>Gere uma API key</li>
                    <li>Configure aqui na interface</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvoAIConfiguration;
