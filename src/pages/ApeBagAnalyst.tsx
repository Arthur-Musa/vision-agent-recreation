import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Bot, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { openaiService } from '@/services/openaiService';
import { useToast } from '@/hooks/use-toast';

const ApeBagAnalyst = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Digite o texto ou descrição do sinistro para análise.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Busca por um assistant configurado para APE+BAG ou usa o padrão
      const agents = openaiService.getInsuranceAgents();
      const apeBagAgent = Object.values(agents).find(agent => 
        agent.name.toLowerCase().includes('ape') || 
        agent.name.toLowerCase().includes('bag') ||
        agent.assistantId
      ) || agents.claimsProcessor;

      const response = await openaiService.processWithAgent(
        apeBagAgent,
        `Analise este sinistro focando em aspectos APE (Acidentes Pessoais) e BAG (Bagagem): ${inputText}`,
        inputText
      );

      setResult(response);
      
      toast({
        title: 'Análise concluída',
        description: 'Sinistro APE + BAG analisado com sucesso.',
      });
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível processar o sinistro. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Analista de Sinistros APE + BAG</h1>
            <Badge variant="secondary">OpenAI Assistant</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Descrição do Sinistro
              </CardTitle>
              <CardDescription>
                Descreva o sinistro APE (Acidentes Pessoais) ou BAG (Bagagem) para análise especializada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Descreva o sinistro: local, data, circunstâncias, danos, valores, documentos disponíveis..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className="resize-none"
              />
              
              <Button 
                onClick={handleAnalysis} 
                disabled={isProcessing || !inputText.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Analisar Sinistro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Análise</CardTitle>
              <CardDescription>
                Análise especializada em sinistros APE + BAG
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aguardando análise do sinistro...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Análise:</strong> {result.content}
                    </AlertDescription>
                  </Alert>

                  {result.extractedData && Object.keys(result.extractedData).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Dados Extraídos:</h4>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-sm">
                          {JSON.stringify(result.extractedData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {result.validations && result.validations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Validações:</h4>
                      <div className="space-y-2">
                        {result.validations.map((validation: any, index: number) => (
                          <Badge 
                            key={index} 
                            variant={validation.status === 'success' ? 'default' : 
                                   validation.status === 'warning' ? 'secondary' : 'destructive'}
                          >
                            {validation.field}: {validation.message}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recomendações:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {result.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Confiança: {Math.round(result.confidence * 100)}%</span>
                    <Badge variant="outline">
                      {result.validations?.find((v: any) => v.field === 'assistant') ? 'OpenAI Assistant' : 'Padrão'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Alert className="mt-6">
          <Bot className="h-4 w-4" />
          <AlertDescription>
            <strong>Dica:</strong> Para melhor precisão, configure um Assistant OpenAI específico para APE+BAG em Configurações → APIs → Assistants OpenAI
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ApeBagAnalyst;