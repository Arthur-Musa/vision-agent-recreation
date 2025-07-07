import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ApiTester, getCurrentDomain, isDevelopment } from '@/lib/apiTest';
import { config } from '@/config/environment';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Globe, 
  Server,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const ApiTestPanel = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTests = async () => {
    setTesting(true);
    try {
      const testResults = await ApiTester.runFullApiTest();
      setResults(testResults);
      
      toast({
        title: "Testes Concluídos",
        description: `${testResults.summary.passed}/${testResults.summary.totalTests} testes passaram`,
        variant: testResults.summary.failed > 0 ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Erro nos Testes",
        description: "Falha ao executar testes de conectividade",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const copyDomainInfo = () => {
    const domainInfo = `
Domínio atual: ${getCurrentDomain()}
Ambiente: ${isDevelopment() ? 'Desenvolvimento' : 'Produção'}
API Base URL: ${config.api.baseUrl}

Para configurar CORS no backend, adicione:
- Origin: ${getCurrentDomain()}
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization, Accept
    `.trim();

    navigator.clipboard.writeText(domainInfo);
    toast({
      title: "Informações Copiadas",
      description: "Dados do domínio copiados para área de transferência",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Teste de Conectividade da API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Domain Info */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Informações do Domínio
          </h4>
          <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Domínio atual:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {getCurrentDomain()}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ambiente:</span>
              <Badge variant={isDevelopment() ? "secondary" : "default"}>
                {isDevelopment() ? 'Desenvolvimento' : 'Produção'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">API Base:</span>
              <code className="text-xs bg-background px-2 py-1 rounded max-w-64 truncate">
                {config.api.baseUrl}
              </code>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyDomainInfo}
            className="w-full"
          >
            📋 Copiar Informações para Configuração CORS
          </Button>
        </div>

        <Separator />

        {/* Test Controls */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Server className="h-4 w-4" />
            Testes de Conexão
          </h4>
          <Button 
            onClick={runTests} 
            disabled={testing}
            className="w-full gap-2"
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                Executar Testes de API
              </>
            )}
          </Button>
        </div>

        {/* Test Results */}
        {results && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados dos Testes</h4>
            
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold text-green-600">
                  {results.summary.passed}
                </div>
                <div className="text-xs text-muted-foreground">Passou</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold text-red-600">
                  {results.summary.failed}
                </div>
                <div className="text-xs text-muted-foreground">Falhou</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold">
                  {results.summary.avgResponseTime}ms
                </div>
                <div className="text-xs text-muted-foreground">Tempo Médio</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-2">
              {[
                { key: 'healthCheck', label: 'Health Check' },
                { key: 'claimsApi', label: 'Claims API' },
                { key: 'connection', label: 'Conexão Geral' },
              ].map(({ key, label }) => {
                const result = results[key];
                return (
                  <div 
                    key={key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {result.responseTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.responseTime}ms
                        </span>
                      )}
                      <Badge variant={result.success ? "secondary" : "destructive"}>
                        {result.success ? "OK" : "Erro"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Details */}
            {results.summary.failed > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-200">
                    Problemas Encontrados
                  </span>
                </div>
                <div className="space-y-1 text-sm text-red-700 dark:text-red-300">
                  {Object.entries(results)
                    .filter(([key, result]: [string, any]) => 
                      key !== 'summary' && !result.success
                    )
                    .map(([key, result]: [string, any]) => (
                      <div key={key}>
                        • {result.message}
                        {result.error && ` (${result.error})`}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CORS Help */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-200">
              Configuração CORS
            </span>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Se os testes falharem por CORS, configure o backend para permitir:
            <br />
            <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
              Origin: {getCurrentDomain()}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};