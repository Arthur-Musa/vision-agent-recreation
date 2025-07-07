import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/useLanguage";
import { useClaim } from "@/hooks/useClaims";
import { claimsApi } from "@/services/claimsApi";
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Brain,
  Download,
  Share,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Calendar,
  User,
  Target,
  Zap,
  Activity
} from "lucide-react";

const CaseDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLiveUpdate, setIsLiveUpdate] = useState(true);
  const [report, setReport] = useState<any>(null);
  
  const { claim, status, loading, error, startAnalysis, refreshStatus } = useClaim(id || "");

  const texts = {
    back: { 'pt-BR': 'Voltar', 'pt': 'Voltar', 'en': 'Back' },
    caseDetails: { 'pt-BR': 'Detalhes do Caso', 'pt': 'Detalhes do Caso', 'en': 'Case Details' },
    liveUpdates: { 'pt-BR': 'Atualizações em Tempo Real', 'pt': 'Atualizações em Tempo Real', 'en': 'Live Updates' },
    agentActivity: { 'pt-BR': 'Atividade do Agent', 'pt': 'Atividade do Agent', 'en': 'Agent Activity' },
    documents: { 'pt-BR': 'Documentos', 'pt': 'Documentos', 'en': 'Documents' },
    findings: { 'pt-BR': 'Descobertas', 'pt': 'Descobertas', 'en': 'Findings' },
    timeline: { 'pt-BR': 'Linha do Tempo', 'pt': 'Linha do Tempo', 'en': 'Timeline' },
    metrics: { 'pt-BR': 'Métricas', 'pt': 'Métricas', 'en': 'Metrics' }
  };

  // Mock case data - in real app this would come from API
  const mockCase = {
    id: id,
    title: "Análise de Sinistro Automotivo - Colisão",
    description: "Análise completa de sinistro de colisão com múltiplos veículos envolvidos na Av. Paulista",
    agent: "Claims Triage Agent",
    status: "processing",
    progress: 75,
    createdAt: "2024-01-15T10:30:00Z",
    estimatedCompletion: "1m 23s",
    confidence: 94.5,
    documentsCount: 5,
    category: "claims",
    priority: "high",
    assignedAnalyst: "João Silva"
  };

  const agentSteps = [
    {
      step: "Análise Inicial",
      status: "completed",
      duration: "45s",
      description: "Processamento e classificação dos documentos recebidos",
      progress: 100,
      details: ["5 documentos processados", "Metadados extraídos", "Classificação automática concluída"]
    },
    {
      step: "Extração de Dados",
      status: "completed", 
      duration: "1m 12s",
      description: "Extração de informações relevantes dos documentos",
      progress: 100,
      details: ["Dados do veículo identificados", "Informações do condutor extraídas", "Detalhes do sinistro mapeados"]
    },
    {
      step: "Validação Cruzada",
      status: "processing",
      duration: "2m 10s",
      description: "Verificação de consistência entre documentos e bases de dados",
      progress: 60,
      details: ["Validando dados do veículo...", "Consultando histórico do condutor...", "Verificando cobertura da apólice..."]
    },
    {
      step: "Análise de Risco",
      status: "pending",
      duration: "",
      description: "Avaliação de possíveis fraudes e riscos",
      progress: 0,
      details: ["Aguardando conclusão da validação"]
    },
    {
      step: "Relatório Final",
      status: "pending",
      duration: "",
      description: "Geração do relatório com recomendações",
      progress: 0,
      details: ["Pendente"]
    }
  ];

  const documents = [
    { name: "Boletim de Ocorrência.pdf", type: "PDF", size: "2.3 MB", status: "processed", confidence: 98 },
    { name: "Fotos do Acidente.zip", type: "ZIP", size: "15.7 MB", status: "processed", confidence: 95 },
    { name: "Documento do Veículo.pdf", type: "PDF", size: "1.1 MB", status: "processed", confidence: 99 },
    { name: "CNH do Condutor.jpg", type: "JPG", size: "856 KB", status: "processing", confidence: null },
    { name: "Laudo Pericial.pdf", type: "PDF", size: "3.2 MB", status: "pending", confidence: null }
  ];

  const timeline = [
    { time: "10:30", event: "Caso criado e documentos enviados", type: "info" },
    { time: "10:31", event: "Análise inicial iniciada pelo Agent", type: "processing" },
    { time: "10:32", event: "5 documentos processados com sucesso", type: "success" },
    { time: "10:33", event: "Extração de dados concluída", type: "success" },
    { time: "10:35", event: "Iniciada validação cruzada", type: "processing" },
    { time: "10:37", event: "Dados do veículo validados", type: "success" },
    { time: "10:38", event: "Processando histórico do condutor...", type: "processing" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-amber-600 bg-amber-100 animate-pulse';
      case 'pending': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  // Load claim report and setup real-time updates
  useEffect(() => {
    if (!id) {
      navigate('/cases');
      return;
    }
    
    // Load claim report if analysis is completed
    const loadReport = async () => {
      if (status?.status === 'completed') {
        try {
          const reportData = await claimsApi.getClaimReport(id);
          setReport(reportData);
        } catch (err) {
          console.error('Failed to load report:', err);
        }
      }
    };

    loadReport();
  }, [id, status?.status, navigate]);

  // Real-time updates
  useEffect(() => {
    if (!isLiveUpdate || !id) return;

    const interval = setInterval(async () => {
      try {
        await refreshStatus();
      } catch (err) {
        console.error('Failed to refresh status:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveUpdate, id, refreshStatus]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/cases')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t(texts.back)}
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{t(texts.caseDetails)}</h1>
                <p className="text-sm text-muted-foreground">Caso #{id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isLiveUpdate ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLiveUpdate(!isLiveUpdate)}
                className="gap-2"
              >
                {isLiveUpdate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {t(texts.liveUpdates)}
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{mockCase.title}</CardTitle>
                    <p className="text-muted-foreground">{mockCase.description}</p>
                  </div>
                  <Badge variant={mockCase.status === 'processing' ? 'default' : 'secondary'}>
                    {mockCase.status === 'processing' ? 'Processando' : 'Concluído'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockCase.progress}%</div>
                    <div className="text-sm text-muted-foreground">Progresso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockCase.confidence}%</div>
                    <div className="text-sm text-muted-foreground">Confiança</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockCase.documentsCount}</div>
                    <div className="text-sm text-muted-foreground">Documentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockCase.estimatedCompletion}</div>
                    <div className="text-sm text-muted-foreground">Tempo Restante</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Geral</span>
                    <span>{mockCase.progress}%</span>
                  </div>
                  <Progress value={mockCase.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Agent:</span>
                    <span>{mockCase.agent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Criado:</span>
                    <span>{new Date(mockCase.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Analista:</span>
                    <span>{mockCase.assignedAnalyst}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Activity - Real Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t(texts.agentActivity)}
                  {isLiveUpdate && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {agentSteps.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatusColor(step.status)}`}>
                          {getStatusIcon(step.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{step.step}</h4>
                            {step.duration && (
                              <Badge variant="outline" className="text-xs">
                                {step.duration}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {step.description}
                          </p>

                          {step.status === 'processing' && (
                            <div className="space-y-2 mb-3">
                              <Progress value={step.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground">
                                {step.progress}% concluído
                              </p>
                            </div>
                          )}

                          <div className="space-y-1">
                            {step.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="flex items-center gap-2 text-xs">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                <span className={step.status === 'processing' && detailIndex === 0 ? 'text-primary' : 'text-muted-foreground'}>
                                  {detail}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {index < agentSteps.length - 1 && (
                        <div className="absolute left-4 top-8 w-px h-6 bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t(texts.documents)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                        {doc.confidence && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="text-xs text-muted-foreground">Confiança:</div>
                            <Badge variant="outline" className="text-xs">{doc.confidence}%</Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t(texts.timeline)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="text-xs text-muted-foreground font-mono">
                        {event.time}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{event.event}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar Análise
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Ajustar Prioridade
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Acelerar Processo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;