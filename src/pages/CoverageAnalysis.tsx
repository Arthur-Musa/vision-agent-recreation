import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Shield, 
  AlertCircle,
  ExternalLink,
  Eye,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverageIssue {
  id: string;
  type: 'non-compliance' | 'missing' | 'warning' | 'suggestion';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  section: string;
  page?: number;
  suggestedAction?: string;
  needsEscalation: boolean;
}

interface CoverageAnalysisResult {
  entityVerification: {
    status: 'compliant' | 'non-compliant' | 'partial';
    issues: CoverageIssue[];
  };
  documentBasics: {
    status: 'compliant' | 'non-compliant' | 'partial';
    issues: CoverageIssue[];
  };
  coverageGaps: {
    status: 'compliant' | 'non-compliant' | 'partial';
    issues: CoverageIssue[];
  };
  confidentialInfo: {
    status: 'compliant' | 'non-compliant' | 'partial';
    issues: CoverageIssue[];
  };
  needsEscalation: boolean;
  overallScore: number;
}

const CoverageAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<CoverageAnalysisResult | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);

  // Simulated document data from upload
  const documentData = location.state?.documents || [];

  useEffect(() => {
    // Simulate analysis
    const runAnalysis = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: CoverageAnalysisResult = {
        entityVerification: {
          status: 'non-compliant',
          issues: [
            {
              id: '1',
              type: 'non-compliance',
              severity: 'high',
              title: 'Entidade Legal Incorreta',
              description: 'O nome da entidade legal para ABC Co. está incorreto. Está listado como "ABC Co." em vez de "ABC Company, Inc." conforme diretrizes.',
              section: 'Verificação de Entidade',
              page: 1,
              suggestedAction: 'Atualize todas as referências para "ABC Company, Inc." no documento.',
              needsEscalation: true
            }
          ]
        },
        documentBasics: {
          status: 'non-compliant',
          issues: [
            {
              id: '2',
              type: 'non-compliance',
              severity: 'medium',
              title: 'Jurisdição Não Preferencial',
              description: 'A lei governante está listada como Oregon, que não está entre as jurisdições preferenciais (Delaware, California, New York, Massachusetts, Washington).',
              section: 'Documentos Básicos',
              suggestedAction: 'Propor mudança da lei governante para Delaware, California ou New York.',
              needsEscalation: false
            }
          ]
        },
        coverageGaps: {
          status: 'partial',
          issues: [
            {
              id: '3',
              type: 'missing',
              severity: 'high',
              title: 'Cobertura de Responsabilidade Civil Insuficiente',
              description: 'O limite mínimo de R$ 5.000.000 para responsabilidade civil não está claramente especificado.',
              section: 'Análise de Coberturas',
              suggestedAction: 'Adicionar cláusula específica com limite mínimo de cobertura.',
              needsEscalation: true
            }
          ]
        },
        confidentialInfo: {
          status: 'compliant',
          issues: []
        },
        needsEscalation: true,
        overallScore: 72
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);

      toast({
        title: "Análise concluída",
        description: "Verificação de cobertura finalizada com sucesso.",
      });
    };

    runAnalysis();
  }, [toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-full mx-auto flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground animate-pulse" />
          </div>
          <h2 className="text-xl font-medium">Analisando cobertura...</h2>
          <p className="text-muted-foreground">Verificando provisões, gaps e compliance</p>
          <Progress value={75} className="w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!analysisResult) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-medium">Verificação de Cobertura</h1>
                  <p className="text-sm text-muted-foreground">
                    {documentData.length} documento(s) analisado(s)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Score: {analysisResult.overallScore}%
              </Badge>
              {analysisResult.needsEscalation && (
                <Badge variant="destructive" className="gap-2">
                  <UserCheck className="h-3 w-3" />
                  Precisa Escalação
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Document Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documento Analisado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Simulated document with highlights */}
                <div className="bg-muted/30 rounded-lg p-6 space-y-4 min-h-[400px]">
                  <div className="text-center text-lg font-semibold mb-4">
                    NDA - ACORDO DE CONFIDENCIALIDADE
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <p>
                      Entre <span 
                        className={cn(
                          "px-2 py-1 rounded cursor-pointer",
                          selectedHighlight === 'entity' ? "bg-red-200" : "bg-red-100 hover:bg-red-150"
                        )}
                        onClick={() => setSelectedHighlight(selectedHighlight === 'entity' ? null : 'entity')}
                      >
                        ABC Co.
                      </span> e as partes envolvidas...
                    </p>
                    
                    <p>
                      Este acordo será regido pelas leis do estado de <span 
                        className={cn(
                          "px-2 py-1 rounded cursor-pointer",
                          selectedHighlight === 'jurisdiction' ? "bg-yellow-200" : "bg-yellow-100 hover:bg-yellow-150"
                        )}
                        onClick={() => setSelectedHighlight(selectedHighlight === 'jurisdiction' ? null : 'jurisdiction')}
                      >
                        Oregon
                      </span>.
                    </p>
                    
                    <div className="mt-6">
                      <p className="font-medium">12. Afirmação</p>
                      <p className="mt-2">
                        Os representantes autorizados de suas respectivas Partes afirmam seu entendimento e 
                        aceitação deste Protocolo de Informações Estratégicas.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="space-y-2">
                        <p className="font-medium text-purple-600">QUANTUM LEAP DYNAMICS CORP</p>
                        <div className="border-b border-gray-300 h-8"></div>
                        <p className="text-xs">Assinatura:</p>
                        <div className="border-b border-gray-300 h-6"></div>
                        <p className="text-xs">Nome:</p>
                        <div className="border-b border-gray-300 h-6"></div>
                        <p className="text-xs">Data:</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-medium text-purple-600">ABC CO.</p>
                        <div className="border-b border-gray-300 h-8"></div>
                        <p className="text-xs">Assinatura:</p>
                        <div className="border-b border-gray-300 h-6"></div>
                        <p className="text-xs">Nome:</p>
                        <div className="border-b border-gray-300 h-6"></div>
                        <p className="text-xs">Data:</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            {/* Overall Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Status Geral da Análise</h3>
                  <Badge 
                    variant={analysisResult.overallScore >= 80 ? "default" : "destructive"}
                    className="text-sm"
                  >
                    {analysisResult.overallScore}% Conforme
                  </Badge>
                </div>
                <Progress value={analysisResult.overallScore} className="mb-4" />
                
                {analysisResult.needsEscalation && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Precisa Escalação:</strong> Problemas críticos identificados que requerem revisão manual por especialista.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Entity Verification */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span>1. Verificação de Entidade</span>
                    {getStatusIcon(analysisResult.entityVerification.status)}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisResult.entityVerification.issues.map((issue) => (
                  <div key={issue.id} className="space-y-2">
                    <Badge className={cn("text-xs", getSeverityColor(issue.severity))}>
                      {issue.type === 'non-compliance' ? 'Não-conformidade' : issue.type}
                    </Badge>
                    <p className="text-sm font-medium">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                    {issue.suggestedAction && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <strong>Ação Sugerida:</strong> {issue.suggestedAction}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Document Basics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span>2. Documentos Básicos</span>
                    {getStatusIcon(analysisResult.documentBasics.status)}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisResult.documentBasics.issues.map((issue) => (
                  <div key={issue.id} className="space-y-2">
                    <Badge className={cn("text-xs", getSeverityColor(issue.severity))}>
                      {issue.type === 'non-compliance' ? 'Não-conformidade' : issue.type}
                    </Badge>
                    <p className="text-sm font-medium">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                    {issue.suggestedAction && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <strong>Ação Sugerida:</strong> {issue.suggestedAction}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Coverage Gaps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span>3. Gaps de Cobertura</span>
                    {getStatusIcon(analysisResult.coverageGaps.status)}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {analysisResult.coverageGaps.issues.map((issue) => (
                  <div key={issue.id} className="space-y-2">
                    <Badge className={cn("text-xs", getSeverityColor(issue.severity))}>
                      {issue.type === 'missing' ? 'Faltando' : issue.type}
                    </Badge>
                    <p className="text-sm font-medium">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                    {issue.suggestedAction && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <strong>Ação Sugerida:</strong> {issue.suggestedAction}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Confidential Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <span>4. Informações Confidenciais</span>
                    {getStatusIcon(analysisResult.confidentialInfo.status)}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Todas as verificações de conformidade aprovadas</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Exportar Relatório
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Nova Análise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageAnalysis;