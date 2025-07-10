import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Eye, 
  Clock,
  FileImage,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  Fingerprint,
  Search
} from 'lucide-react';

interface FraudIndicator {
  id: string;
  type: 'document_similarity' | 'unusual_pattern' | 'timing_anomaly' | 'value_inconsistency' | 'duplicate_claim';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  evidence: string[];
  similarCases?: string[];
  recommendation: string;
}

interface FraudDetectionPanelProps {
  claimId: string;
  onInvestigate: (indicatorId: string) => void;
  onMarkReviewed: (indicatorId: string) => void;
}

export const FraudDetectionPanel = ({ 
  claimId, 
  onInvestigate, 
  onMarkReviewed 
}: FraudDetectionPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - em produção viria da API de detecção de fraude
  const fraudAnalysis = {
    overallScore: 0.75,
    riskLevel: 'high' as const,
    totalIndicators: 4,
    criticalIndicators: 1,
    lastUpdated: '2024-01-15T15:30:00Z'
  };

  const indicators: FraudIndicator[] = [
    {
      id: '1',
      type: 'document_similarity',
      severity: 'critical',
      score: 0.92,
      description: 'Documento de orçamento idêntico detectado',
      evidence: [
        'Hash MD5 idêntico ao sinistro AUTO-987654',
        'Mesma oficina, mesmo formato, valores similares',
        'Data de criação do arquivo: 15 dias antes do sinistro'
      ],
      similarCases: ['AUTO-987654', 'AUTO-456789'],
      recommendation: 'Investigação imediata - possível fraude organizada'
    },
    {
      id: '2',
      type: 'timing_anomaly',
      severity: 'medium',
      score: 0.68,
      description: 'Padrão temporal suspeito',
      evidence: [
        'Sinistro reportado 3 dias após vencimento da apólice',
        'Último pagamento de prêmio feito 1 dia antes do sinistro',
        'Histórico de 2 sinistros nos últimos 6 meses'
      ],
      recommendation: 'Verificar histórico de pagamentos e sinistros anteriores'
    },
    {
      id: '3',
      type: 'value_inconsistency',
      severity: 'medium',
      score: 0.61,
      description: 'Inconsistência nos valores apresentados',
      evidence: [
        'Diferença de 25% entre orçamentos (R$15.750 vs R$12.000)',
        'Valor solicitado próximo ao limite da franquia',
        'Peças cotadas acima do valor de mercado'
      ],
      recommendation: 'Solicitar orçamento adicional de oficina credenciada'
    },
    {
      id: '4',
      type: 'unusual_pattern',
      severity: 'low',
      score: 0.35,
      description: 'Padrão geográfico atípico',
      evidence: [
        'Sinistro ocorrido a 200km da residência do segurado',
        'Região com alto índice de sinistros nos últimos 30 dias',
        'Horário do sinistro: 02:30 (madrugada)'
      ],
      recommendation: 'Verificar justificativa de deslocamento'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document_similarity': return <FileImage className="h-4 w-4" />;
      case 'timing_anomaly': return <Clock className="h-4 w-4" />;
      case 'value_inconsistency': return <DollarSign className="h-4 w-4" />;
      case 'unusual_pattern': return <TrendingUp className="h-4 w-4" />;
      case 'duplicate_claim': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      document_similarity: 'Similaridade Documental',
      timing_anomaly: 'Anomalia Temporal',
      value_inconsistency: 'Inconsistência de Valores',
      unusual_pattern: 'Padrão Atípico',
      duplicate_claim: 'Possível Duplicata'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Overview Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Análise de Fraude
            </CardTitle>
            <Badge className={`${getRiskLevelColor(fraudAnalysis.riskLevel)}`}>
              Risco {fraudAnalysis.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Geral */}
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {(fraudAnalysis.overallScore * 100).toFixed(0)}%
              </div>
              <Progress 
                value={fraudAnalysis.overallScore * 100} 
                className="mb-2"
              />
              <div className="text-sm text-muted-foreground">Score de Risco</div>
            </div>

            {/* Indicadores */}
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {fraudAnalysis.totalIndicators}
              </div>
              <div className="text-sm text-muted-foreground">
                Indicadores Detectados
              </div>
              {fraudAnalysis.criticalIndicators > 0 && (
                <div className="text-xs text-red-600 mt-1">
                  {fraudAnalysis.criticalIndicators} crítico(s)
                </div>
              )}
            </div>

            {/* Última Atualização */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Última Análise</div>
              <div className="text-sm">
                {new Date(fraudAnalysis.lastUpdated).toLocaleString('pt-BR')}
              </div>
              <Button variant="outline" size="sm" className="mt-2 gap-1">
                <Search className="h-3 w-3" />
                Reanalise
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento dos Indicadores */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="critical">Críticos</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {/* Lista de Indicadores */}
          <div className="space-y-4">
            {indicators
              .filter(indicator => {
                if (activeTab === 'critical') return indicator.severity === 'critical';
                if (activeTab === 'patterns') return indicator.type === 'unusual_pattern';
                return true;
              })
              .map((indicator) => (
                <Card key={indicator.id} className="border-l-4 border-l-red-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(indicator.type)}
                        <div>
                          <CardTitle className="text-base">
                            {getTypeLabel(indicator.type)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {indicator.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getSeverityColor(indicator.severity)}`}>
                          {indicator.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {(indicator.score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Evidências */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Fingerprint className="h-4 w-4" />
                        Evidências Detectadas
                      </h4>
                      <ul className="space-y-1">
                        {indicator.evidence.map((evidence, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Casos Similares */}
                    {indicator.similarCases && indicator.similarCases.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Casos Similares
                        </h4>
                        <div className="flex gap-2">
                          {indicator.similarCases.map((caseId, index) => (
                            <Badge key={index} variant="outline" className="cursor-pointer hover:bg-muted">
                              {caseId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recomendação */}
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Recomendação:</strong> {indicator.recommendation}
                      </AlertDescription>
                    </Alert>

                    {/* Ações */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onInvestigate(indicator.id)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Investigar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkReviewed(indicator.id)}
                        className="gap-1"
                      >
                        Marcar como Revisado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Estado Vazio */}
          {indicators.filter(indicator => {
            if (activeTab === 'critical') return indicator.severity === 'critical';
            if (activeTab === 'patterns') return indicator.type === 'unusual_pattern';
            return true;
          }).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum indicador encontrado</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'critical' 
                    ? 'Não há indicadores críticos para este sinistro.'
                    : 'Não há padrões suspeitos detectados.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};