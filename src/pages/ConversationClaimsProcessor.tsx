import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  MessageSquare, 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  Users, 
  Shield, 
  TrendingUp, 
  Download,
  Play,
  ArrowRight
} from 'lucide-react';

interface ConversationStep {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
  estimatedTime: string;
}

const ConversationClaimsProcessor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);

  // Fluxo correto baseado na documentação técnica V7Labs
  const conversationFlow: ConversationStep[] = [
    {
      id: 'intake',
      title: 'Underwriting Intake',
      description: 'FNOL via email/WhatsApp/upload manual em <3s',
      route: '/underwriting/intake',
      icon: <Upload className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '< 3s'
    },
    {
      id: 'classification',
      title: 'Document Classification & Unbundle',
      description: 'AI classifica FNOL Form, SOV, ACORD, Broker docs',
      route: '/classification',
      icon: <FileText className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '5-10s'
    },
    {
      id: 'extraction',
      title: 'IDP Extraction Models',
      description: 'OCR + NLP extrai policyNumber, incidentDate, claimType, amount',
      route: '/extraction',
      icon: <Brain className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '15-30s'
    },
    {
      id: 'validation',
      title: 'Validation Panel',
      description: 'Regras de negócio + Human-in-the-Loop validation',
      route: '/validation',
      icon: <CheckCircle className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '30s-2m'
    },
    {
      id: 'queues',
      title: 'Queues & Threshold Gate',
      description: 'Roteamento Auto/Property/Medical + limiares automático vs humano',
      route: '/claims/queues',
      icon: <Users className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '< 5s'
    },
    {
      id: 'review',
      title: 'Human Review & Assign',
      description: 'Aprovação de campos + atribuição de analista com SLA',
      route: '/humanReview',
      icon: <Users className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '2-5m'
    },
    {
      id: 'fraud',
      title: 'Fraud & Risk Panel',
      description: 'Scoring em tempo real com explicabilidade',
      route: '/fraudRisk',
      icon: <Shield className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '10-20s'
    },
    {
      id: 'decision',
      title: 'Final Decision & Export',
      description: 'Aprovação/rejeição + geração de relatórios JSON/PDF',
      route: '/finalize',
      icon: <Download className="h-5 w-5" />,
      status: 'pending',
      estimatedTime: '1-2m'
    }
  ];

  const handleStartFlow = () => {
    toast({
      title: "Iniciando Fluxo V7Labs",
      description: "Seguindo pipeline de processamento automatizado de sinistros"
    });
    navigate(conversationFlow[0].route);
  };

  const handleStepClick = (stepIndex: number, route: string) => {
    setCurrentStep(stepIndex);
    navigate(route);
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Claims Processor - Fluxo V7Labs
                </h1>
                <p className="text-sm text-muted-foreground">
                  Pipeline completo FNOL → Liquidação conforme documentação técnica
                </p>
              </div>
            </div>
            
            <Button onClick={handleStartFlow} className="gap-2">
              <Play className="h-4 w-4" />
              Iniciar Fluxo
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Pipeline Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pipeline de Processamento Automatizado
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fluxo End-to-End baseado na documentação técnica e bench V7Labs
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-muted-foreground">Etapas do Pipeline</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">&lt; 3s</div>
                <div className="text-sm text-muted-foreground">FNOL Intake</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-muted-foreground">Precisão OCR+NLP</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">5-10m</div>
                <div className="text-sm text-muted-foreground">Tempo Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Flow Steps */}
        <div className="space-y-4">
          {conversationFlow.map((step, index) => (
            <Card 
              key={step.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                index === currentStep ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleStepClick(index, step.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getStatusColor(getStepStatus(index))}>
                        {getStepStatus(index)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.estimatedTime}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => navigate('/underwriting/intake')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documentos
              </Button>
              <Button variant="outline" onClick={() => navigate('/claims/queues')}>
                <Users className="h-4 w-4 mr-2" />
                Ver Filas
              </Button>
              <Button variant="outline" onClick={() => navigate('/claims')}>
                <FileText className="h-4 w-4 mr-2" />
                Dashboard Claims
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationClaimsProcessor;