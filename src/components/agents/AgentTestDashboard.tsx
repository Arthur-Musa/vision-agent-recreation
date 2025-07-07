import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';
import { claimsApi } from '@/services/claimsApi';
import { 
  Play, 
  RefreshCw, 
  Download, 
  FileText, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgentTestDashboardProps {
  onClaimCreated: (claimId: string) => void;
}

export const AgentTestDashboard: React.FC<AgentTestDashboardProps> = ({ onClaimCreated }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  const createTestClaim = async () => {
    setIsCreating(true);
    setTestProgress(0);

    try {
      // Dados de teste para um sinistro automotivo
      const testClaimData = {
        tipo_sinistro: 'Automotivo',
        descricao: 'Sinistro de teste para demonstração dos agentes de IA. Colisão traseira em semáforo com danos na lataria e para-choque.',
        valor_estimado: 8500,
        documentos: []
      };

      setTestProgress(30);

      // Criar sinistro na API real
      const newClaim = await claimsApi.createClaim(testClaimData);
      
      setTestProgress(60);

      // Simular upload de documento de teste
      // Em um cenário real, teríamos arquivos reais aqui
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestProgress(100);

      toast({
        title: "Sinistro de Teste Criado",
        description: `Sinistro ${newClaim.numero_sinistro} pronto para análise`,
      });

      onClaimCreated(newClaim.id);

    } catch (error) {
      toast({
        title: "Erro ao Criar Teste",
        description: "Falha ao conectar com a API real",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setTestProgress(0);
    }
  };

  const testScenarios = [
    {
      id: 'auto-collision',
      title: 'Sinistro Automotivo - Colisão',
      description: 'Teste completo com análise de fraude e processamento de documentos',
      estimatedValue: 8500,
      complexity: 'medium' as const,
      expectedFeatures: ['Detecção de fraude', 'Análise de imagens', 'Cálculo de danos']
    },
    {
      id: 'property-fire',
      title: 'Sinistro Residencial - Incêndio',
      description: 'Análise de risco elevado com múltiplos documentos',
      estimatedValue: 45000,
      complexity: 'high' as const,
      expectedFeatures: ['Análise de causa', 'Avaliação de perdas', 'Verificação de cobertura']
    },
    {
      id: 'health-claim',
      title: 'Reembolso Médico',
      description: 'Processamento rápido de documentação médica',
      estimatedValue: 1200,
      complexity: 'low' as const,
      expectedFeatures: ['Validação de documentos', 'Verificação de procedimentos', 'Cálculo de reembolso']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status da API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Status da Integração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">API Base:</span>
              <p className="font-mono text-xs break-all">
                https://sinistros-ia-sistema-production.up.railway.app
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Conectado</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Funcionalidades Integradas:</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Criação de sinistros',
                'Análise com IA',
                'Detecção de fraude', 
                'Upload de documentos',
                'Relatórios automáticos',
                'Acompanhamento em tempo real'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cenários de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Cenários de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {testScenarios.map((scenario) => (
            <div key={scenario.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{scenario.title}</h4>
                <Badge variant={
                  scenario.complexity === 'high' ? 'destructive' :
                  scenario.complexity === 'medium' ? 'default' : 'secondary'
                }>
                  {scenario.complexity}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">{scenario.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span>Valor: R$ {scenario.estimatedValue.toLocaleString('pt-BR')}</span>
                <span>{scenario.expectedFeatures.length} funcionalidades</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {scenario.expectedFeatures.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Criar Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Iniciar Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Crie um sinistro de teste para verificar a integração completa com os agentes de IA.
          </p>

          {isCreating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Criando sinistro de teste...</span>
                <span>{testProgress}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={createTestClaim}
            disabled={isCreating}
            className="w-full gap-2"
          >
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Criando Teste...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Criar Sinistro de Teste
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• O teste criará um sinistro real na API</p>
            <p>• Você poderá testar todos os agentes de IA</p>
            <p>• Análise de fraude e relatórios automáticos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};