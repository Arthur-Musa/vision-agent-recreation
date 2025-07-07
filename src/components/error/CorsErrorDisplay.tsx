import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Copy, ExternalLink, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CorsErrorDisplayProps {
  error: string;
  apiUrl: string;
  currentOrigin: string;
}

export const CorsErrorDisplay = ({ error, apiUrl, currentOrigin }: CorsErrorDisplayProps) => {
  const { toast } = useToast();

  const corsConfig = {
    express: `app.use(cors({
  origin: '${currentOrigin}',
  credentials: true,
  optionsSuccessStatus: 200
}));`,
    fastapi: `from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=['${currentOrigin}'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)`,
    headers: `Access-Control-Allow-Origin: ${currentOrigin}
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept, Authorization, Origin
Access-Control-Allow-Credentials: true`
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para área de transferência`,
    });
  };

  const isCorsError = error.includes('CORS') || error.includes('Failed to fetch');

  if (!isCorsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <Server className="h-5 w-5" />
          Erro de CORS - Configuração Necessária
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <Badge variant="outline" className="mb-2">Origem da Requisição</Badge>
            <code className="block bg-background p-2 rounded text-xs border">
              {currentOrigin}
            </code>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">Destino da API</Badge>
            <code className="block bg-background p-2 rounded text-xs border">
              {apiUrl}
            </code>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Problema:</strong> A API não está configurada para aceitar requisições desta origem.
            O backend precisa ser configurado com headers CORS apropriados.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge>Headers CORS Necessários</Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(corsConfig.headers, 'Headers CORS')}
                className="gap-1"
              >
                <Copy className="h-3 w-3" />
                Copiar
              </Button>
            </div>
            <pre className="bg-background p-3 rounded border text-xs overflow-x-auto">
              {corsConfig.headers}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Express.js</Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(corsConfig.express, 'Código Express.js')}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copiar
                </Button>
              </div>
              <pre className="bg-background p-3 rounded border text-xs overflow-x-auto">
                {corsConfig.express}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">FastAPI</Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(corsConfig.fastapi, 'Código FastAPI')}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copiar
                </Button>
              </div>
              <pre className="bg-background p-3 rounded border text-xs overflow-x-auto">
                {corsConfig.fastapi}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-3 w-3" />
            Docs CORS
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => copyToClipboard(`${currentOrigin}`, 'Origem atual')}
            className="gap-2"
          >
            <Copy className="h-3 w-3" />
            Copiar Origem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};