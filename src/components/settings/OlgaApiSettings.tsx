import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCcw,
  Eye,
  EyeOff,
  ExternalLink,
  Activity
} from 'lucide-react';
import { olgaApi } from '@/services/olgaApiService';
import { useToast } from '@/hooks/use-toast';

export const OlgaApiSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(olgaApi.getConnectionStatus());
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setConnectionStatus(olgaApi.getConnectionStatus());
    setBaseUrl(olgaApi.getConfig().baseUrl);
  }, []);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key obrigatória",
        description: "Por favor, insira uma API key válida",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      olgaApi.setApiKey(apiKey.trim());
      setConnectionStatus(olgaApi.getConnectionStatus());
      
      toast({
        title: "Conectado com sucesso!",
        description: "API key configurada. Execute um teste para verificar a conectividade.",
      });
      
      setApiKey(''); // Clear input for security
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    olgaApi.clearApiKey();
    setConnectionStatus(olgaApi.getConnectionStatus());
    setTestResults(null);
    
    toast({
      title: "Desconectado",
      description: "API key removida. Modo fallback ativado.",
      variant: "default"
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      // Test document analysis
      const testRequest = {
        documentType: 'claim' as const,
        agentType: 'claims-processor' as const,
        documentData: 'Teste de conectividade com a API Olga',
        context: { test: true },
        priority: 'low' as const
      };

      const startTime = Date.now();
      const result = await olgaApi.analyzeDocument(testRequest);
      const endTime = Date.now();

      setTestResults({
        success: true,
        responseTime: endTime - startTime,
        analysisId: result.analysisId,
        confidence: result.confidence,
        model: result.model,
        status: result.status,
        mode: connectionStatus.mode
      });

      toast({
        title: "Teste concluído",
        description: `Conectividade verificada em ${endTime - startTime}ms`,
      });

    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        mode: connectionStatus.mode
      });

      toast({
        title: "Teste falhou",
        description: "Verifique a configuração e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (connectionStatus.connected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = () => {
    if (connectionStatus.connected) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Configuração da API Olga</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge className={getStatusColor()}>
                {connectionStatus.connected ? 'Conectado' : 'Modo Fallback'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connection" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connection">Conexão</TabsTrigger>
              <TabsTrigger value="testing">Testes</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">URL da API</Label>
                  <Input
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.olga.com"
                    disabled={connectionStatus.connected}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={connectionStatus.hasApiKey ? '••••••••••••••••' : 'Insira sua API key'}
                        disabled={connectionStatus.connected}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!connectionStatus.connected ? (
                    <Button 
                      onClick={handleConnect}
                      disabled={isConnecting || !apiKey.trim()}
                      className="gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      {isConnecting ? 'Conectando...' : 'Conectar'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleDisconnect}
                      variant="outline"
                      className="gap-2"
                    >
                      Desconectar
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCcw className={`h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                </div>
              </div>

              {!connectionStatus.connected && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Modo Fallback Ativo:</strong> O sistema está funcionando com respostas simuladas. 
                    Configure a API key para acessar as funcionalidades reais da Olga.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Teste de Conectividade</h3>
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    size="sm"
                    className="gap-2"
                  >
                    <Activity className={`h-4 w-4 ${isTesting ? 'animate-pulse' : ''}`} />
                    {isTesting ? 'Executando...' : 'Executar Teste'}
                  </Button>
                </div>

                {testResults && (
                  <Card className={testResults.success ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {testResults.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {testResults.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
                          </span>
                          <Badge variant="outline">
                            {testResults.mode === 'real' ? 'API Real' : 'Fallback'}
                          </Badge>
                        </div>

                        {testResults.success ? (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Tempo de Resposta:</span>
                              <span className="ml-2 font-medium">{testResults.responseTime}ms</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Confiança:</span>
                              <span className="ml-2 font-medium">{(testResults.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Modelo:</span>
                              <span className="ml-2 font-medium">{testResults.model}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">ID da Análise:</span>
                              <span className="ml-2 font-mono text-xs">{testResults.analysisId}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">
                            <strong>Erro:</strong> {testResults.error}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>Este teste verifica:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Conectividade com a API</li>
                    <li>Autenticação da API key</li>
                    <li>Tempo de resposta</li>
                    <li>Funcionalidade básica de análise</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status da Conexão</span>
                        {getStatusIcon()}
                      </div>
                      <p className="text-2xl font-bold">
                        {connectionStatus.connected ? 'Conectado' : 'Desconectado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Modo: {connectionStatus.mode === 'real' ? 'API Real' : 'Fallback'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">URL da API</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-mono break-all">
                        {connectionStatus.baseUrl}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Endpoint configurado
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">API Key</span>
                      <p className="text-2xl font-bold">
                        {connectionStatus.hasApiKey ? 'Configurada' : 'Não configurada'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {connectionStatus.hasApiKey ? 'Key armazenada localmente' : 'Insira uma API key válida'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Funcionalidades</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Análise de Documentos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Detecção de Fraudes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>Workflows Automatizados</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nota de Segurança:</strong> A API key é armazenada localmente no navegador. 
                  Em produção, recomenda-se usar variáveis de ambiente ou Supabase Secrets para maior segurança.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};