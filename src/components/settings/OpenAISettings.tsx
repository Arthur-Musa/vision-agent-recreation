import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Key, Zap, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { openaiService } from '@/services/openaiService';

export const OpenAISettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const { toast } = useToast();

  useEffect(() => {
    // Carrega API key salva (se houver)
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setConnectionStatus('connected');
    }
  }, []);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma API key válida.',
        variant: 'destructive'
      });
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast({
        title: 'Formato inválido',
        description: 'A API key da OpenAI deve começar com "sk-".',
        variant: 'destructive'
      });
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    setConnectionStatus('connected');
    
    toast({
      title: 'API Key salva',
      description: 'Configuração salva com sucesso. Os agentes de IA agora usarão OpenAI real.',
    });
  };

  const removeApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setConnectionStatus('unknown');
    
    toast({
      title: 'API Key removida',
      description: 'Os agentes voltarão ao modo demonstração.',
    });
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Erro',
        description: 'Configure uma API key antes de testar.',
        variant: 'destructive'
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Salva temporariamente para teste
      const originalKey = localStorage.getItem('openai_api_key');
      localStorage.setItem('openai_api_key', apiKey);
      
      // Testa conexão
      const response = await openaiService.generateCompletion(
        'Responda apenas "OK" para confirmar que a conexão está funcionando.',
        {
          model: 'gpt-4o-mini',
          temperature: 0,
          maxTokens: 10
        }
      );

      if (response && response.toLowerCase().includes('ok')) {
        setConnectionStatus('connected');
        toast({
          title: '✅ Conexão bem-sucedida',
          description: 'OpenAI API está funcionando corretamente.',
        });
      } else {
        throw new Error('Resposta inesperada da API');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus('error');
      
      // Restaura API key original se teste falhou
      const originalKey = localStorage.getItem('openai_api_key');
      if (originalKey && originalKey !== apiKey) {
        localStorage.setItem('openai_api_key', originalKey);
      }
      
      toast({
        title: '❌ Falha na conexão',
        description: 'Verifique se a API key está correta e tem créditos disponíveis.',
        variant: 'destructive'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary">Não configurado</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Configuração OpenAI</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Configure sua API key da OpenAI para habilitar inteligência artificial real nos agentes.
          Os agentes funcionarão em modo demonstração sem configuração.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Sua API key é armazenada apenas localmente no seu navegador e nunca é compartilhada.
            Em produção, recomendamos usar o Supabase para armazenamento seguro de chaves.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="apikey">API Key da OpenAI</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apikey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={saveApiKey}
            disabled={!apiKey.trim()}
            className="flex-1"
          >
            <Key className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
          
          <Button 
            onClick={testConnection}
            disabled={!apiKey.trim() || isTestingConnection}
            variant="outline"
          >
            {isTestingConnection ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Testar
              </>
            )}
          </Button>
          
          {apiKey && (
            <Button 
              onClick={removeApiKey}
              variant="outline"
              size="sm"
            >
              Remover
            </Button>
          )}
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Como obter uma API key:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Acesse <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">platform.openai.com <ExternalLink className="h-3 w-3 ml-1" /></a></li>
            <li>Faça login na sua conta OpenAI</li>
            <li>Clique em "Create new secret key"</li>
            <li>Copie a chave e cole aqui</li>
            <li>Certifique-se de que sua conta tem créditos disponíveis</li>
          </ol>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> O uso da API OpenAI é pago conforme o uso. 
            Monitore seus gastos em platform.openai.com/account/usage.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};