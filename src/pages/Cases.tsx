import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  ArrowLeft,
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Brain,
  Download,
  Eye,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Cases = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const texts = {
    title: { 'pt-BR': 'Casos', 'pt': 'Casos', 'en': 'Cases' },
    subtitle: { 'pt-BR': 'Histórico e análises em andamento', 'pt': 'Histórico e análises em andamento', 'en': 'History and ongoing analyses' },
    searchPlaceholder: { 'pt-BR': 'Buscar casos...', 'pt': 'Buscar casos...', 'en': 'Search cases...' },
    all: { 'pt-BR': 'Todos', 'pt': 'Todos', 'en': 'All' },
    processing: { 'pt-BR': 'Processando', 'pt': 'Processando', 'en': 'Processing' },
    completed: { 'pt-BR': 'Concluído', 'pt': 'Concluído', 'en': 'Completed' },
    failed: { 'pt-BR': 'Erro', 'pt': 'Erro', 'en': 'Failed' },
    viewDetails: { 'pt-BR': 'Ver Detalhes', 'pt': 'Ver Detalhes', 'en': 'View Details' },
    download: { 'pt-BR': 'Baixar', 'pt': 'Baixar', 'en': 'Download' },
    back: { 'pt-BR': 'Voltar', 'pt': 'Voltar', 'en': 'Back' }
  };

  const mockCases = [
    {
      id: "case-001",
      title: "Análise de Sinistro Automotivo - Colisão",
      description: "Análise completa de sinistro de colisão com múltiplos veículos envolvidos",
      agent: "Claims Triage Agent",
      status: "completed",
      progress: 100,
      createdAt: "2024-01-15T10:30:00Z",
      completedAt: "2024-01-15T10:37:24Z",
      documentsCount: 5,
      confidence: 98.5,
      findings: ["Sinistro legítimo", "Valor estimado: R$ 15.420", "Sem indícios de fraude"]
    },
    {
      id: "case-002", 
      title: "Revisão de Apólice - Seguro Vida",
      description: "Análise de documentação para renovação de apólice de seguro de vida",
      agent: "Underwriting Agent",
      status: "processing",
      progress: 75,
      createdAt: "2024-01-15T11:15:00Z",
      documentsCount: 8,
      confidence: null,
      estimatedCompletion: "2m restantes"
    },
    {
      id: "case-003",
      title: "Análise Jurídica - Contrato Comercial", 
      description: "Revisão de cláusulas contratuais e análise de riscos jurídicos",
      agent: "Legal Analysis Agent",
      status: "failed",
      progress: 45,
      createdAt: "2024-01-15T09:45:00Z",
      failedAt: "2024-01-15T09:52:15Z",
      documentsCount: 3,
      confidence: null,
      errorMessage: "Documento ilegível - qualidade insuficiente"
    },
    {
      id: "case-004",
      title: "Atendimento ao Cliente - Reclamação",
      description: "Processamento automático de reclamação de cliente sobre cobertura",
      agent: "Customer Service Agent", 
      status: "completed",
      progress: 100,
      createdAt: "2024-01-14T16:20:00Z",
      completedAt: "2024-01-14T16:23:12Z",
      documentsCount: 2,
      confidence: 94.2,
      findings: ["Reclamação procedente", "Reembolso autorizado: R$ 2.340", "Cliente notificado"]
    },
    {
      id: "case-005",
      title: "Detecção de Fraude - Sinistro Residencial",
      description: "Análise de possível fraude em sinistro de incêndio residencial",
      agent: "Fraud Detection Agent",
      status: "completed", 
      progress: 100,
      createdAt: "2024-01-14T14:10:00Z",
      completedAt: "2024-01-14T14:18:45Z",
      documentsCount: 12,
      confidence: 99.1,
      findings: ["Alto risco de fraude detectado", "Evidências inconsistentes", "Investigação recomendada"]
    },
    {
      id: "case-006",
      title: "Análise de Sinistro - Seguro Saúde",
      description: "Processamento de reembolso médico com múltiplos procedimentos",
      agent: "Claims Triage Agent",
      status: "processing",
      progress: 30,
      createdAt: "2024-01-15T12:00:00Z", 
      documentsCount: 6,
      confidence: null,
      estimatedCompletion: "5m restantes"
    }
  ];

  const filteredCases = mockCases.filter(case_ => {
    const matchesSearch = searchTerm === "" || 
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.agent.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      processing: "default",
      completed: "secondary", 
      failed: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {t(texts[status as keyof typeof texts] || { 'pt-BR': status, 'pt': status, 'en': status })}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgentIcon = (agent: string) => {
    if (agent.includes('Claims')) return '🔍';
    if (agent.includes('Underwriting')) return '📋';
    if (agent.includes('Legal')) return '⚖️';
    if (agent.includes('Customer')) return '👥';
    if (agent.includes('Fraud')) return '🛡️';
    return '🤖';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t(texts.back)}
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">{t(texts.title)}</h1>
                <p className="text-sm text-muted-foreground">{t(texts.subtitle)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t(texts.searchPlaceholder)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              {t(texts.all)}
            </Button>
            <Button
              variant={statusFilter === 'processing' ? 'default' : 'outline'}
              size="sm" 
              onClick={() => setStatusFilter('processing')}
            >
              {t(texts.processing)}
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              {t(texts.completed)}
            </Button>
            <Button
              variant={statusFilter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('failed')}
            >
              {t(texts.failed)}
            </Button>
          </div>
        </div>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map((case_) => (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getAgentIcon(case_.agent)}</div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{case_.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{case_.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Brain className="h-3 w-3" />
                            <span>{case_.agent}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(case_.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(case_.status)}
                        {getStatusBadge(case_.status)}
                      </div>
                    </div>

                    {/* Progress Bar for Processing Cases */}
                    {case_.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{case_.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${case_.progress}%` }}
                          />
                        </div>
                        {case_.estimatedCompletion && (
                          <p className="text-xs text-muted-foreground">
                            {case_.estimatedCompletion}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Results for Completed Cases */}
                    {case_.status === 'completed' && case_.findings && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Confiança:</span>
                          <Badge variant="outline">{case_.confidence}%</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {case_.findings.map((finding, index) => (
                            <div key={index} className="text-xs bg-muted/50 rounded px-2 py-1">
                              {finding}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error for Failed Cases */}
                    {case_.status === 'failed' && case_.errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-700">{case_.errorMessage}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Documentos:</span>
                      <span className="font-medium">{case_.documentsCount}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/case/${case_.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t(texts.viewDetails)}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            {t(texts.download)}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Exportar Relatório
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum caso encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar seus filtros ou termo de pesquisa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cases;