import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Eye,
  FileText,
  Users,
  ArrowRight
} from 'lucide-react';

interface Case {
  id: string;
  claimNumber: string;
  type: string;
  status: string;
  agent: string;
  processedAt: string;
  insuredName: string;
  estimatedAmount: number;
}

interface WorkflowPanelProps {
  selectedCases: Case[];
  onStartWorkflow: (caseIds: string[]) => void;
  onViewCase: (case_: Case) => void;
}

export const WorkflowPanel = ({ selectedCases, onStartWorkflow, onViewCase }: WorkflowPanelProps) => {
  const [processingWorkflow, setProcessingWorkflow] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'flagged': return <AlertTriangle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const handleStartWorkflow = async () => {
    if (selectedCases.length === 0) return;
    
    setProcessingWorkflow(true);
    
    try {
      await onStartWorkflow(selectedCases.map(c => c.id));
    } finally {
      setProcessingWorkflow(false);
    }
  };

  const totalValue = selectedCases.reduce((sum, c) => sum + c.estimatedAmount, 0);

  if (selectedCases.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum sinistro selecionado
          </h3>
          <p className="text-sm text-muted-foreground/80 mb-4 max-w-md">
            Selecione um ou mais sinistros na tabela acima para iniciar o fluxo de trabalho automatizado.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Processamento automático</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Análise de IA</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Notificação automática</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Fluxo de Trabalho Ativo
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {selectedCases.length} sinistro{selectedCases.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo dos casos selecionados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total de Casos
            </div>
            <div className="text-lg font-semibold">{selectedCases.length}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Valor Total
            </div>
            <div className="text-lg font-semibold">
              R$ {totalValue.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Tipos
            </div>
            <div className="text-lg font-semibold">
              {[...new Set(selectedCases.map(c => c.type))].join(', ')}
            </div>
          </div>
        </div>

        {/* Lista de casos selecionados */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedCases.map((case_) => (
            <div 
              key={case_.id}
              className="flex items-center justify-between p-2 bg-background/30 rounded-md hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(case_.status)}`}
                >
                  {getStatusIcon(case_.status)}
                  <span className="ml-1">{case_.status}</span>
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {case_.claimNumber} - {case_.insuredName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {case_.type} • R$ {case_.estimatedAmount.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewCase(case_)}
                className="shrink-0 h-7 w-7 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Ações do fluxo */}
        <div className="border-t pt-4 space-y-3">
          <div className="text-sm font-medium text-foreground mb-2">
            Próximas etapas do fluxo:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Análise inicial</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-3 w-3" />
              <span>Classificação</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-3 w-3" />
              <span>Atribuição</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-3 w-3" />
              <span>Notificação</span>
            </div>
          </div>
          
          <Button 
            onClick={handleStartWorkflow}
            disabled={processingWorkflow}
            className="w-full animate-fade-in"
          >
            {processingWorkflow ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                Processando fluxo...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-2" />
                Iniciar Fluxo de Trabalho
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};