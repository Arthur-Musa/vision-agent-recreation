import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const RenewalPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { files } = location.state || {};

  const diffs = [
    {
      field: 'Valor do Prêmio',
      old: 'R$ 1.200,00',
      new: 'R$ 1.350,00',
      delta: '+R$ 150,00',
      type: 'increase'
    },
    {
      field: 'Cobertura Básica',
      old: 'R$ 50.000,00',
      new: 'R$ 55.000,00',
      delta: '+R$ 5.000,00',
      type: 'increase'
    },
    {
      field: 'Franquia',
      old: 'R$ 2.500,00',
      new: 'R$ 2.500,00',
      delta: 'Sem alteração',
      type: 'same'
    },
    {
      field: 'Cobertura Terceiros',
      old: 'R$ 100.000,00',
      new: 'R$ 150.000,00',
      delta: '+R$ 50.000,00',
      type: 'increase'
    }
  ];

  const recommendations = [
    {
      text: 'Aumento de 12,5% no prêmio está dentro da média do mercado',
      priority: 'low',
      impact: 0.2
    },
    {
      text: 'Cobertura de terceiros foi significativamente ampliada',
      priority: 'high',
      impact: 0.8
    },
    {
      text: 'Considere negociar a franquia para reduzir o prêmio',
      priority: 'medium',
      impact: 0.5
    }
  ];

  const getDeltaColor = (type: string) => {
    switch (type) {
      case 'increase': return 'text-orange-600';
      case 'decrease': return 'text-green-600';
      case 'same': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
                onClick={() => navigate('/renewal')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold">Comparação de Apólices</h1>
                <p className="text-sm text-muted-foreground">
                  Diferenças e recomendações identificadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Files Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Apólice Antiga</p>
                    <p className="text-sm text-muted-foreground">
                      {files?.old?.name || 'apolice_antiga.pdf'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Apólice Nova</p>
                    <p className="text-sm text-muted-foreground">
                      {files?.new?.name || 'apolice_nova.pdf'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Comparação Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Campo</th>
                      <th className="text-left p-2">Valor Anterior</th>
                      <th className="text-left p-2">Novo Valor</th>
                      <th className="text-left p-2">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffs.map((diff, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{diff.field}</td>
                        <td className="p-2">{diff.old}</td>
                        <td className="p-2">{diff.new}</td>
                        <td className={`p-2 font-medium ${getDeltaColor(diff.type)}`}>
                          {diff.delta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Impacto: {Math.round(rec.impact * 100)}%
                        </span>
                      </div>
                      <p className="text-sm">{rec.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => navigate('/renewal')}>
              Nova Comparação
            </Button>
            <Button onClick={() => navigate('/claims')}>
              Processar Renovação
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RenewalPreview;