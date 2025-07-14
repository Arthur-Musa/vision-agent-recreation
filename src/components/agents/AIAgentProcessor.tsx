import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  FileText, 
  Shield, 
  Scale, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Loader2,
  Zap,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { openaiService, type OpenAIAgentConfig, type AgentResponse } from '@/services/openaiService';
// Componente removido - chaves API agora são gerenciadas no backend
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AIAgentProcessorProps {
  onAnalysisComplete?: (result: AgentResponse) => void;
}

export const AIAgentProcessor: React.FC<AIAgentProcessorProps> = ({ onAnalysisComplete }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('claimsProcessor');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [testInput, setTestInput] = useState('');
  const { toast } = useToast();

  const agents = openaiService.getInsuranceAgents();

  const agentIcons: Record<string, React.ReactNode> = {
    claimsProcessor: <FileText className="h-5 w-5" />,
    policyAnalyzer: <Shield className="h-5 w-5" />,
    fraudDetector: <AlertTriangle className="h-5 w-5" />,
    legalAnalyzer: <Scale className="h-5 w-5" />,
    customerService: <Users className="h-5 w-5" />
  };

  const processWithAgent = async () => {
    if (!testInput.trim()) {
      toast({
        title: 'Entrada necessária',
        description: 'Digite uma mensagem ou cenário para testar o agente.',
        variant: 'destructive'
      });
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const agentConfig = agents[selectedAgent];
      const response = await openaiService.processWithAgent(
        agentConfig,
        testInput,
        // Simula um documento de exemplo
        `DOCUMENTO DE TESTE
        
Tipo: ${agentConfig.name}
Conteúdo: ${testInput}
Data: ${new Date().toLocaleDateString('pt-BR')}

--- Início do documento simulado ---
${testInput}
--- Fim do documento ---`,
        {
          testMode: true,
          timestamp: new Date().toISOString()
        }
      );

      setResult(response);
      onAnalysisComplete?.(response);

      toast({
        title: '✅ Análise concluída',
        description: `${agentConfig.name} processou a solicitação com sucesso.`,
      });

    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: '❌ Erro no processamento',
        description: 'Verifique a configuração da OpenAI ou tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agentes de IA Especializados</h2>
          <p className="text-muted-foreground">
            Teste os agentes de IA da Olga powered by OpenAI
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar OpenAI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Configurações OpenAI</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">As chaves API são agora gerenciadas de forma segura no backend.</p>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Selecionar Agente
            </CardTitle>
            <CardDescription>
              Escolha o agente especializado para seu teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(agents).map(([key, agent]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAgent === key 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedAgent(key)}
              >
                <div className="flex items-start gap-3">
                  {agentIcons[key]}
                  <div className="flex-1">
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {agent.model}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Temp: {agent.temperature}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Testar Agente
            </CardTitle>
            <CardDescription>
              Digite um cenário ou documento para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Entrada para {agents[selectedAgent].name}
              </label>
              <textarea
                className="w-full min-h-[150px] p-3 border rounded-lg resize-none"
                placeholder={`Exemplo para ${agents[selectedAgent].name}:
                
${selectedAgent === 'claimsProcessor' ? 'Sinistro de colisão ocorrido em 15/06/2025 na Av. Paulista. Valor estimado R$ 15.000,00. Segurado: João Silva.' : 
  selectedAgent === 'policyAnalyzer' ? 'Analisar apólice de seguro auto com cobertura de R$ 50.000 para veículo Honda Civic 2020.' : 
  selectedAgent === 'fraudDetector' ? 'Verificar inconsistências: sinistro reportado 2 dias após contratação da apólice, valor muito alto.' : 
  selectedAgent === 'legalAnalyzer' ? 'Verificar conformidade desta apólice com as normas da SUSEP e Código Civil.' : 
  'Cliente solicita informações sobre cobertura de vidros na sua apólice residencial.'}`}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
            </div>

            <Button 
              onClick={processWithAgent}
              disabled={!testInput.trim() || processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Processar com {agents[selectedAgent].name}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultado da Análise
            </CardTitle>
            <CardDescription>
              Processado por {agents[selectedAgent].name} • Confiança: {Math.round(result.confidence * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confiança da Análise</span>
                <span>{Math.round(result.confidence * 100)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-2" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h4 className="font-medium">Análise</h4>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="whitespace-pre-wrap">{result.content}</p>
              </div>
            </div>

            {/* Extracted Data */}
            {result.extractedData && Object.keys(result.extractedData).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Dados Extraídos</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(result.extractedData).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validations */}
            {result.validations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Validações</h4>
                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {result.validations.map((validation, index) => (
                      <div key={index} className={`p-3 rounded-lg ${getValidationColor(validation.status)}`}>
                        <div className="flex items-center gap-2">
                          {getValidationIcon(validation.status)}
                          <span className="font-medium">{validation.field}</span>
                        </div>
                        <p className="text-sm mt-1">{validation.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recomendações</h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Citations */}
            {result.citations && result.citations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Citações</h4>
                <div className="space-y-2">
                  {result.citations.map((citation, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Página {citation.page}</span>
                        <Badge variant="outline">{Math.round(citation.confidence * 100)}%</Badge>
                      </div>
                      <p className="text-sm">{citation.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Configure sua API key da OpenAI para usar IA real. 
          Sem configuração, os agentes funcionam em modo demonstração com respostas simuladas.
        </AlertDescription>
      </Alert>
    </div>
  );
};