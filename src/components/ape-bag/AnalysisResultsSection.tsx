import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Bot, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { DecisionResult } from '@/services/claimsDecisionEngine';

interface AnalysisResultsSectionProps {
  result: any;
  decisionResult?: DecisionResult | null;
}

export const AnalysisResultsSection = ({ result, decisionResult }: AnalysisResultsSectionProps) => {
  
  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'DENY': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'INVESTIGATE': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'ADDITIONAL_DOCS': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return 'bg-green-50 text-green-800 border-green-200';
      case 'DENY': return 'bg-red-50 text-red-800 border-red-200';
      case 'INVESTIGATE': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'ADDITIONAL_DOCS': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return 'APROVADO';
      case 'DENY': return 'NEGADO';
      case 'INVESTIGATE': return 'INVESTIGAÇÃO';
      case 'ADDITIONAL_DOCS': return 'DOCS PENDENTES';
      default: return decision;
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {decisionResult ? getDecisionIcon(decisionResult.decision) : <FileText className="h-5 w-5" />}
          {decisionResult ? 'Decisão V7 Claims' : 'Resultado da Análise'}
        </CardTitle>
        <CardDescription>
          {decisionResult ? 'Motor de decisão automática aplicado' : 'Análise especializada em sinistros APE + BAG'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result && !decisionResult ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aguardando análise do sinistro...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Decisão V7 Claims */}
            {decisionResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={`text-sm font-medium ${getDecisionColor(decisionResult.decision)}`}>
                    {getDecisionIcon(decisionResult.decision)}
                    <span className="ml-2">{getDecisionText(decisionResult.decision)}</span>
                  </Badge>
                  <Badge variant="outline">
                    Confiança: {(decisionResult.confidence * 100).toFixed(1)}%
                  </Badge>
                  {decisionResult.autoExecutable && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Auto-executável
                    </Badge>
                  )}
                </div>

                {/* Justificativa da Decisão */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Justificativa:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      {decisionResult.reasoning.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Instruções de Pagamento */}
                {decisionResult.paymentInstruction && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Instrução de Pagamento
                    </h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Valor:</strong> R$ {decisionResult.paymentInstruction.amount.toLocaleString()}</p>
                      <p><strong>Destinatário:</strong> {decisionResult.paymentInstruction.recipient}</p>
                      <p><strong>Método:</strong> {decisionResult.paymentInstruction.method}</p>
                      <p><strong>Status:</strong> {decisionResult.paymentInstruction.authorization}</p>
                    </div>
                  </div>
                )}

                {/* Ações Requeridas */}
                {decisionResult.requiredActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Ações Requeridas:</h4>
                    <div className="space-y-2">
                      {decisionResult.requiredActions.map((action, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Badge variant={action.automated ? "default" : "outline"}>
                            {action.type}
                          </Badge>
                          <span className="text-sm flex-1">{action.description}</span>
                          <Badge variant="outline" className={
                            action.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                            action.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            action.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }>
                            {action.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Próximos Passos */}
                {decisionResult.nextSteps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Próximos Passos:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {decisionResult.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Escalação */}
                {decisionResult.escalationLevel !== 'none' && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Escalação necessária:</strong> {decisionResult.escalationLevel.replace('_', ' ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Análise Detalhada */}
            {result && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Análise Detalhada:</h4>
                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Resultado:</strong> {result.content}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};