import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Bot } from 'lucide-react';

interface AnalysisResultsSectionProps {
  result: any;
}

export const AnalysisResultsSection = ({ result }: AnalysisResultsSectionProps) => {
  return (
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
  );
};