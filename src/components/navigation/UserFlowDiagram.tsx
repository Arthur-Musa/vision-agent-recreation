import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  MessageSquare, 
  Upload, 
  Brain, 
  FileText, 
  CheckCircle,
  Users,
  Search,
  Settings,
  BarChart3
} from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  status: 'available' | 'recommended' | 'required';
  nextSteps?: string[];
}

const userFlows: Record<string, FlowStep[]> = {
  newUser: [
    {
      id: 'landing',
      title: 'Página Inicial',
      description: 'Descobrir agentes disponíveis e recursos da plataforma',
      icon: <Search className="h-5 w-5" />,
      route: '/',
      status: 'available',
      nextSteps: ['chat', 'upload', 'agents']
    },
    {
      id: 'chat',
      title: 'Chat com Concierge',
      description: 'Conversa inicial para entender necessidades',
      icon: <MessageSquare className="h-5 w-5" />,
      route: '/chat',
      status: 'recommended',
      nextSteps: ['upload', 'live-workflow']
    },
    {
      id: 'upload',
      title: 'Upload de Documentos',
      description: 'Carregar documentos para análise',
      icon: <Upload className="h-5 w-5" />,
      route: '/upload',
      status: 'required',
      nextSteps: ['analysis', 'conversation']
    }
  ],
  
  powerUser: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Visão geral de casos e métricas',
      icon: <BarChart3 className="h-5 w-5" />,
      route: '/dashboard',
      status: 'recommended',
      nextSteps: ['cases', 'live-workflow']
    },
    {
      id: 'live-workflow',
      title: 'Workflow ao Vivo',
      description: 'Análise em tempo real com IA',
      icon: <Brain className="h-5 w-5" />,
      route: '/live-workflow',
      status: 'recommended',
      nextSteps: ['cases', 'agents']
    },
    {
      id: 'cases',
      title: 'Gerenciar Casos',
      description: 'Acompanhar status de processamento',
      icon: <FileText className="h-5 w-5" />,
      route: '/cases',
      status: 'available',
      nextSteps: ['case-detail', 'agents']
    }
  ],
  
  analyst: [
    {
      id: 'agents',
      title: 'Agentes Especializados',
      description: 'Configurar e testar agentes de IA',
      icon: <Users className="h-5 w-5" />,
      route: '/ai-agents',
      status: 'recommended',
      nextSteps: ['live-workflow', 'settings']
    },
    {
      id: 'conversation',
      title: 'Análise de Conversas',
      description: 'Revisar interações e resultados',
      icon: <MessageSquare className="h-5 w-5" />,
      route: '/conversation/:agentId',
      status: 'available',
      nextSteps: ['coverage', 'cases']
    },
    {
      id: 'coverage',
      title: 'Análise de Cobertura',
      description: 'Verificar adequação de apólices',
      icon: <CheckCircle className="h-5 w-5" />,
      route: '/coverage-analysis',
      status: 'available',
      nextSteps: ['cases', 'dashboard']
    }
  ]
};

interface UserFlowDiagramProps {
  currentRoute?: string;
  userType?: 'newUser' | 'powerUser' | 'analyst';
  onNavigate?: (route: string) => void;
}

export const UserFlowDiagram: React.FC<UserFlowDiagramProps> = ({
  currentRoute = '/',
  userType = 'newUser',
  onNavigate
}) => {
  const flows = userFlows[userType];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'required': return 'bg-red-100 text-red-800 border-red-200';
      case 'recommended': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isCurrentStep = (route: string) => {
    return currentRoute === route || 
           (route.includes(':') && currentRoute.includes(route.split('/')[1]));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Jornada do Usuário</h2>
        <p className="text-muted-foreground">
          Fluxo otimizado para {userType === 'newUser' ? 'novos usuários' : 
                                userType === 'powerUser' ? 'usuários avançados' : 
                                'analistas'}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {flows.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <Card 
              className={`w-64 transition-all cursor-pointer hover:shadow-lg ${
                isCurrentStep(step.route) 
                  ? 'ring-2 ring-primary shadow-lg scale-105' 
                  : 'hover:scale-102'
              }`}
              onClick={() => onNavigate?.(step.route)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {step.icon}
                    <Badge className={getStatusColor(step.status)}>
                      {step.status === 'required' ? 'Obrigatório' :
                       step.status === 'recommended' ? 'Recomendado' : 'Disponível'}
                    </Badge>
                  </div>
                  {isCurrentStep(step.route) && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Atual
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {step.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.(step.route);
                  }}
                >
                  {isCurrentStep(step.route) ? 'Você está aqui' : 'Ir para esta etapa'}
                </Button>
              </CardContent>
            </Card>
            
            {index < flows.length - 1 && (
              <ArrowRight className="h-6 w-6 text-muted-foreground mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="gap-2 h-16 flex-col"
              onClick={() => onNavigate?.('/live-workflow')}
            >
              <Brain className="h-5 w-5" />
              <span>Análise ao Vivo</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-2 h-16 flex-col"
              onClick={() => onNavigate?.('/upload')}
            >
              <Upload className="h-5 w-5" />
              <span>Upload Rápido</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-2 h-16 flex-col"
              onClick={() => onNavigate?.('/chat')}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Chat Inteligente</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};