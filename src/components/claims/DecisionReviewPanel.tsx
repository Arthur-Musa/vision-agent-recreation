import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  DollarSign,
  Clock,
  User,
  Shield,
  Gavel,
  MessageSquare,
  ArrowUp
} from 'lucide-react';

interface DecisionRecommendation {
  decision: 'APPROVE' | 'DENY' | 'INVESTIGATE' | 'ADDITIONAL_DOCS';
  confidence: number;
  reasoning: string[];
  estimatedValue: number;
  riskScore: number;
  autoExecutable: boolean;
  requiredActions: Array<{
    type: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
  }>;
  escalationLevel: 'none' | 'supervisor' | 'fraud_investigation' | 'manual_review';
}

interface DecisionReviewPanelProps {
  claimId: string;
  recommendation: DecisionRecommendation;
  onDecisionConfirm: (decision: string, comments: string, escalate?: string) => void;
  onRequestMoreInfo: (infoType: string, details: string) => void;
}

export const DecisionReviewPanel = ({ 
  claimId, 
  recommendation, 
  onDecisionConfirm, 
  onRequestMoreInfo 
}: DecisionReviewPanelProps) => {
  const [selectedDecision, setSelectedDecision] = useState(recommendation.decision);
  const [analystComments, setAnalystComments] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock recommendation data if not provided
  const mockRecommendation: DecisionRecommendation = {
    decision: 'APPROVE',
    confidence: 0.87,
    reasoning: [
      'Documentação completa e consistente',
      'Valores dentro da faixa normal para este tipo de sinistro',
      'Nenhum indicador de fraude detectado',
      'Segurado com bom histórico'
    ],
    estimatedValue: 15750,
    riskScore: 0.23,
    autoExecutable: true,
    requiredActions: [
      {
        type: 'payment_authorization',
        description: 'Autorizar pagamento de R$ 15.750,00',
        urgency: 'medium'
      },
      {
        type: 'notification',
        description: 'Notificar segurado sobre aprovação',
        urgency: 'low'
      }
    ],
    escalationLevel: 'none'
  };

  const currentRecommendation = recommendation || mockRecommendation;

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'DENY': return 'bg-red-100 text-red-800 border-red-200';
      case 'INVESTIGATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADDITIONAL_DOCS': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return <CheckCircle className="h-4 w-4" />;
      case 'DENY': return <XCircle className="h-4 w-4" />;
      case 'INVESTIGATE': return <Shield className="h-4 w-4" />;
      case 'ADDITIONAL_DOCS': return <FileText className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getDecisionLabel = (decision: string) => {
    const labels = {
      APPROVE: 'Aprovar',
      DENY: 'Negar',
      INVESTIGATE: 'Investigar',
      ADDITIONAL_DOCS: 'Solicitar Documentos'
    };
    return labels[decision as keyof typeof labels] || decision;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const handleConfirmDecision = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onDecisionConfirm(selectedDecision, analystComments, escalationReason);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleEscalate = (reason: string) => {
    setEscalationReason(reason);
    // Auto-select manual review if escalating
    setSelectedDecision('INVESTIGATE');
  };

  return (
    <div className="space-y-6">
      {/* Recomendação do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Decisão Recomendada pelo Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getDecisionIcon(currentRecommendation.decision)}
              <div>
                <Badge className={`${getDecisionColor(currentRecommendation.decision)} text-base`}>
                  {getDecisionLabel(currentRecommendation.decision)}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Confiança: {(currentRecommendation.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(currentRecommendation.estimatedValue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Risco: {(currentRecommendation.riskScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Justificativas */}
          <div>
            <h4 className="font-medium mb-2">Justificativas da IA:</h4>
            <ul className="space-y-1">
              {currentRecommendation.reasoning.map((reason, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Ações Requeridas */}
          {currentRecommendation.requiredActions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Ações Necessárias:</h4>
              <div className="space-y-2">
                {currentRecommendation.requiredActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">{action.description}</span>
                    <Badge className={`${getUrgencyColor(action.urgency)} text-xs`}>
                      {action.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerta de Execução Automática */}
          {currentRecommendation.autoExecutable && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Execução Automática Habilitada:</strong> Esta decisão pode ser executada automaticamente após sua aprovação.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Decisão do Analista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sua Decisão como Analista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Decisão */}
          <div>
            <label className="text-sm font-medium mb-2 block">Decisão Final:</label>
            <Select value={selectedDecision} onValueChange={(value) => setSelectedDecision(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVE">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Aprovar Sinistro
                  </div>
                </SelectItem>
                <SelectItem value="DENY">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Negar Sinistro
                  </div>
                </SelectItem>
                <SelectItem value="INVESTIGATE">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    Solicitar Investigação
                  </div>
                </SelectItem>
                <SelectItem value="ADDITIONAL_DOCS">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Solicitar Mais Documentos
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comentários do Analista */}
          <div>
            <label className="text-sm font-medium mb-2 block">Comentários do Analista:</label>
            <Textarea
              value={analystComments}
              onChange={(e) => setAnalystComments(e.target.value)}
              placeholder="Adicione seus comentários sobre a decisão..."
              rows={4}
            />
          </div>

          {/* Escalação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEscalate('complexity')}
              className="gap-2"
            >
              <ArrowUp className="h-3 w-3" />
              Escalar para Supervisor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEscalate('fraud_suspicion')}
              className="gap-2"
            >
              <Shield className="h-3 w-3" />
              Escalar para Fraude
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRequestMoreInfo('medical_opinion', 'Solicitar segunda opinião médica')}
              className="gap-2"
            >
              <MessageSquare className="h-3 w-3" />
              Solicitar Info Adicional
            </Button>
          </div>

          {/* Razão da Escalação */}
          {escalationReason && (
            <div>
              <label className="text-sm font-medium mb-2 block">Motivo da Escalação:</label>
              <Textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Descreva o motivo da escalação..."
                rows={2}
              />
            </div>
          )}

          {/* Diferença da Recomendação */}
          {selectedDecision !== currentRecommendation.decision && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Sua decisão difere da recomendação do sistema. 
                Certifique-se de documentar o motivo nos comentários.
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleConfirmDecision}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirmar Decisão
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedDecision(currentRecommendation.decision);
                setAnalystComments('');
                setEscalationReason('');
              }}
            >
              Redefinir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};