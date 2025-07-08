import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  FileText, 
  Shield, 
  Settings, 
  ArrowRight, 
  Sparkles,
  Upload,
  Brain
} from 'lucide-react';

interface QuickStartProps {
  onComplete?: () => void;
}

const quickStartOptions = [
  {
    id: 'live-workflow',
    title: 'Experiência Live',
    description: 'Chat inteligente com análise em tempo real',
    icon: <Sparkles className="h-5 w-5" />,
    route: '/live-workflow',
    badge: 'Recomendado',
    color: 'primary'
  },
  {
    id: 'upload-docs',
    title: 'Processar Documentos',
    description: 'Faça upload e analise documentos',
    icon: <Upload className="h-5 w-5" />,
    route: '/upload',
    badge: 'Rápido',
    color: 'blue'
  },
  {
    id: 'chat-direct',
    title: 'Chat Direto',
    description: 'Conversa simples sem análise visual',
    icon: <MessageCircle className="h-5 w-5" />,
    route: '/chat',
    badge: 'Simples',
    color: 'green'
  },
  {
    id: 'explore-agents',
    title: 'Explorar Agentes',
    description: 'Descubra agentes especializados',
    icon: <Brain className="h-5 w-5" />,
    route: '/ai-agents',
    badge: 'Avançado',
    color: 'purple'
  }
];

const commonTasks = [
  'Analisar sinistro de seguro',
  'Verificar cobertura de apólice',
  'Processar documentos legais',
  'Atendimento ao cliente',
  'Detecção de fraudes'
];

export const QuickStart: React.FC<QuickStartProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>('live-workflow');

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    const option = quickStartOptions.find(opt => opt.id === optionId);
    if (option) {
      navigate(option.route);
      onComplete?.();
    }
  };

  const handleTaskSelect = (task: string) => {
    navigate('/live-workflow', { state: { initialQuery: task } });
    onComplete?.();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Como você gostaria de começar?</h2>
        <p className="text-muted-foreground">
          Escolha a melhor forma de interagir com a Olga para suas necessidades
        </p>
      </div>

      {/* Main Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickStartOptions.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedOption === option.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleOptionSelect(option.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedOption === option.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    {option.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={option.badge === 'Recomendado' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {option.badge}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Common Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ou comece com uma tarefa comum:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {commonTasks.map((task, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start text-left hover:bg-primary/5 hover:border-primary/50"
              onClick={() => handleTaskSelect(task)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm">{task}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Skip Option */}
      <div className="text-center pt-4">
        <Button variant="ghost" onClick={onComplete} className="gap-2">
          Pular introdução
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};