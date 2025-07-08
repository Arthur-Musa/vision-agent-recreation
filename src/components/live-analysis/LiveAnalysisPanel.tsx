import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Zap,
  Eye,
  Link,
  Quote
} from 'lucide-react';

interface AnalysisStep {
  id: string;
  timestamp: string;
  agent: string;
  step: string;
  content: string;
  status: 'processing' | 'completed' | 'error';
  confidence?: number;
  sources?: Array<{
    document: string;
    page: number;
    coordinates: [number, number, number, number];
    text: string;
  }>;
}

interface LiveAnalysisPanelProps {
  isActive: boolean;
  currentTask?: string;
  steps: AnalysisStep[];
  onCitationClick?: (source: any) => void;
}

export const LiveAnalysisPanel: React.FC<LiveAnalysisPanelProps> = ({
  isActive,
  currentTask,
  steps,
  onCitationClick
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive && steps.length > 0) {
      const completedSteps = steps.filter(s => s.status === 'completed').length;
      const newProgress = (completedSteps / Math.max(steps.length, 1)) * 100;
      setProgress(newProgress);
    }
  }, [isActive, steps]);

  const getStepIcon = (step: AnalysisStep) => {
    switch (step.status) {
      case 'processing': return <Clock className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getAgentColor = (agent: string) => {
    const colors = {
      'Claims Processor': 'bg-blue-100 text-blue-800 border-blue-200',
      'Policy Analyzer': 'bg-green-100 text-green-800 border-green-200',
      'Fraud Detective': 'bg-red-100 text-red-800 border-red-200',
      'Legal Analyzer': 'bg-purple-100 text-purple-800 border-purple-200',
      'Concierge': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[agent as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!isActive) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 mx-auto opacity-50" />
          <div>
            <h3 className="font-medium">Análise ao Vivo</h3>
            <p className="text-sm">Inicie uma conversa para ver o raciocínio da IA em tempo real</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Análise ao Vivo</h2>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Eye className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        </div>
        
        {currentTask && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{currentTask}</p>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{steps.filter(s => s.status === 'completed').length} concluídas</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Steps */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                step.status === 'processing' 
                  ? 'border-blue-200 bg-blue-50/50 animate-pulse' 
                  : step.status === 'completed'
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-red-200 bg-red-50/50'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStepIcon(step)}
                  <Badge className={getAgentColor(step.agent)}>
                    {step.agent}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(step.timestamp).toLocaleTimeString('pt-BR')}
                </span>
              </div>

              {/* Step Title */}
              <h4 className="font-medium mb-2">{step.step}</h4>

              {/* Step Content */}
              <p className="text-sm text-muted-foreground mb-3">{step.content}</p>

              {/* Confidence & Sources */}
              <div className="flex items-center justify-between">
                {step.confidence && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confiança:</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(step.confidence * 100)}%
                    </Badge>
                  </div>
                )}

                {step.sources && step.sources.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Quote className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {step.sources.length} fonte{step.sources.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Sources */}
              {step.sources && step.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-muted space-y-2">
                  {step.sources.map((source, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded border cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => onCitationClick?.(source)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{source.document}</span>
                        <Badge variant="outline" className="text-xs">
                          Pág. {source.page}
                        </Badge>
                        <Link className="h-3 w-3 text-primary ml-auto" />
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        "{source.text.slice(0, 100)}{source.text.length > 100 ? '...' : ''}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Current Processing Indicator */}
          {isActive && steps.some(s => s.status === 'processing') && (
            <div className="p-4 rounded-lg border border-dashed border-blue-200 bg-blue-50/30">
              <div className="flex items-center gap-2 text-blue-600">
                <Brain className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Processando...</span>
              </div>
              <p className="text-xs text-blue-600/70 mt-1">
                A IA está analisando os dados e gerando insights
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};