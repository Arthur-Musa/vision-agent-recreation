import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CorsErrorDisplay } from '@/components/error/CorsErrorDisplay';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config/environment';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

export const QuickApiTest = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
    fullError?: string;
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
          'Origin': window.location.origin,
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
        } else if (error.message === 'Failed to fetch' || error.message.includes('CORS')) {
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
        fullError: error instanceof Error ? error.message : String(error),
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

        {result && !result.success && (result.message.includes('CORS') || result.fullError === 'Failed to fetch') ? (
          <CorsErrorDisplay 
            error={result.fullError || result.message}
            apiUrl={config.api.baseUrl}
            currentOrigin={window.location.origin}
          />
        ) : result && (
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
      </CardContent>
    </Card>
  );
};