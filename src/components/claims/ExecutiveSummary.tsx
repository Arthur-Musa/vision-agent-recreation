import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  User,
  Calendar,
  MapPin,
  Quote,
  ExternalLink,
  Eye
} from 'lucide-react';

interface Citation {
  id: string;
  document: string;
  page: number;
  coordinates: [number, number, number, number];
  text: string;
  confidence: number;
}

interface ExtractedData {
  field: string;
  value: string;
  citation: Citation;
  confidence: number;
  validated: boolean;
}

interface ExecutiveSummaryProps {
  claimId: string;
  extractedData: ExtractedData[];
  onCitationClick: (citation: Citation) => void;
  onDataValidation: (field: string, isValid: boolean) => void;
}

export const ExecutiveSummary = ({ 
  claimId, 
  extractedData, 
  onCitationClick, 
  onDataValidation 
}: ExecutiveSummaryProps) => {
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());

  // Mock data - em produção viria da API
  const summaryData = {
    policyNumber: 'AUTO-123456',
    insuredName: 'João Silva',
    incidentDate: '2024-01-10',
    claimType: 'Colisão',
    estimatedAmount: 15750,
    location: 'São Paulo, SP',
    description: 'Colisão frontal com outro veículo na Avenida Paulista durante horário de rush.',
    riskScore: 0.35,
    confidence: 0.89,
    keyFindings: [
      'Boletim de ocorrência válido (BO-123456)',
      'Orçamentos consistentes entre R$15.000-16.500',
      'Fotos do sinistro corroboram com descrição',
      'Segurado sem histórico de sinistros'
    ],
    riskIndicators: [
      {
        type: 'timing',
        description: 'Sinistro reportado 3 dias após ocorrência',
        severity: 'low' as const
      }
    ]
  };

  const mockExtractedData: ExtractedData[] = [
    {
      field: 'insuredName',
      value: 'João Silva',
      citation: {
        id: '1',
        document: 'BO-123456.pdf',
        page: 1,
        coordinates: [100, 150, 200, 170],
        text: 'Nome do Condutor: João Silva',
        confidence: 0.95
      },
      confidence: 0.95,
      validated: true
    },
    {
      field: 'incidentDate',
      value: '10/01/2024',
      citation: {
        id: '2',
        document: 'BO-123456.pdf',
        page: 1,
        coordinates: [100, 200, 300, 220],
        text: 'Data da Ocorrência: 10 de janeiro de 2024',
        confidence: 0.98
      },
      confidence: 0.98,
      validated: true
    },
    {
      field: 'estimatedAmount',
      value: 'R$ 15.750,00',
      citation: {
        id: '3',
        document: 'Orçamento_Oficina_A.pdf',
        page: 1,
        coordinates: [400, 500, 500, 520],
        text: 'Total: R$ 15.750,00',
        confidence: 0.87
      },
      confidence: 0.87,
      validated: false
    }
  ];

  const toggleCitation = (citationId: string) => {
    const newExpanded = new Set(expandedCitations);
    if (newExpanded.has(citationId)) {
      newExpanded.delete(citationId);
    } else {
      newExpanded.add(citationId);
    }
    setExpandedCitations(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getFieldLabel = (field: string) => {
    const labels = {
      insuredName: 'Nome do Segurado',
      incidentDate: 'Data do Sinistro',
      estimatedAmount: 'Valor Estimado',
      policyNumber: 'Número da Apólice',
      location: 'Local do Sinistro'
    };
    return labels[field as keyof typeof labels] || field;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo Executivo
            </CardTitle>
            <Badge className={`${getConfidenceColor(summaryData.confidence)}`}>
              {(summaryData.confidence * 100).toFixed(0)}% Confiança
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{summaryData.insuredName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(summaryData.incidentDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-primary">
                {formatCurrency(summaryData.estimatedAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{summaryData.location}</span>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="font-medium mb-2">Descrição do Sinistro</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {summaryData.description}
            </p>
          </div>

          {/* Principais Achados */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Principais Achados
            </h4>
            <ul className="space-y-1">
              {summaryData.keyFindings.map((finding, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  {finding}
                </li>
              ))}
            </ul>
          </div>

          {/* Indicadores de Risco */}
          {summaryData.riskIndicators.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {summaryData.riskIndicators.map((indicator, index) => (
                    <div key={index} className="text-sm">
                      <strong>Atenção:</strong> {indicator.description}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dados Extraídos com Citações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            Dados Extraídos e Validação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExtractedData.map((data, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                {/* Campo e Valor */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{getFieldLabel(data.field)}</h4>
                    <p className="text-lg">{data.value}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getConfidenceColor(data.confidence)}`}>
                      {(data.confidence * 100).toFixed(0)}%
                    </Badge>
                    {data.validated ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </div>

                {/* Citação */}
                <div className="bg-muted/30 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{data.citation.document} - Página {data.citation.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCitation(data.citation.id)}
                        className="text-xs"
                      >
                        {expandedCitations.has(data.citation.id) ? 'Menos' : 'Mais'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCitationClick(data.citation)}
                        className="text-xs gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver Documento
                      </Button>
                    </div>
                  </div>

                  {/* Texto da Citação */}
                  <div className="text-sm">
                    <span className="font-medium">"</span>
                    {expandedCitations.has(data.citation.id) ? (
                      <span>{data.citation.text}</span>
                    ) : (
                      <span>{data.citation.text.substring(0, 100)}...</span>
                    )}
                    <span className="font-medium">"</span>
                  </div>

                  {/* Ações de Validação */}
                  {!data.validated && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDataValidation(data.field, true)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDataValidation(data.field, false)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Questionar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};