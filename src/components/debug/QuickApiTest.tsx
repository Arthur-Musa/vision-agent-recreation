import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config/environment';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const QuickApiTest = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testApi = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test basic connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${config.api.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setResult({
          success: true,
          message: 'API conectada com sucesso!',
          details: `Status: ${response.status} - ${response.statusText}`,
        });
        toast({
          title: "✅ API Conectada",
          description: "Conexão estabelecida com sucesso",
        });
      } else {
        setResult({
          success: false,
          message: `API retornou erro HTTP ${response.status}`,
          details: response.statusText,
        });
        toast({
          title: "⚠️ Erro na API",
          description: `HTTP ${response.status} - ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      let message = 'Erro de conexão';
      let details = '';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = 'Timeout na conexão';
          details = 'A API não respondeu em 10 segundos';
        } else if (error.message.includes('CORS')) {
          message = 'Erro de CORS';
          details = 'API não permite requisições desta origem';
        } else if (error.message.includes('fetch')) {
          message = 'Falha na conexão';
          details = 'Verifique se a API está online';
        } else {
          details = error.message;
        }
      }

      setResult({
        success: false,
        message,
        details,
      });

      toast({
        title: "❌ Falha na Conexão",
        description: message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Teste Rápido da API</h3>
          <Badge variant="outline" className="text-xs">
            {config.api.baseUrl.includes('localhost') ? 'Local' : 'Produção'}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          <div>Endpoint: <code className="text-xs bg-muted px-1 rounded">{config.api.baseUrl}</code></div>
          <div>Origem: <code className="text-xs bg-muted px-1 rounded">{window.location.origin}</code></div>
        </div>

        <Button 
          onClick={testApi} 
          disabled={testing}
          className="w-full gap-2"
          variant={result?.success ? "secondary" : "default"}
        >
          {testing ? (
            <>
              <Activity className="h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4" />
              Testar Conectividade
            </>
          )}
        </Button>

        {result && (
          <div className={`p-3 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`font-medium ${
                result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {result.message}
              </span>
            </div>
            {result.details && (
              <div className={`text-sm ${
                result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {result.details}
              </div>
            )}
          </div>
        )}

        {result && !result.success && (
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Configuração CORS Necessária
              </span>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Adicione ao backend:
              <br />
              <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                Access-Control-Allow-Origin: {window.location.origin}
              </code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};