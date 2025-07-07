import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { insuranceAgents } from "@/data/insuranceAgents";
import { claimsApi, type Claim } from "@/services/claimsApi";
import { 
  Search, 
  Upload, 
  History, 
  Settings, 
  Bell,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  MessageSquare
} from "lucide-react";

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);

  const texts = {
    greeting: { 
      'pt-BR': 'Bom dia, João', 
      'pt': 'Bom dia, João', 
      'en': 'Good morning, João' 
    },
    subtitle: { 
      'pt-BR': 'O que você gostaria de fazer hoje?', 
      'pt': 'O que você gostaria de fazer hoje?', 
      'en': 'What would you like to do today?' 
    },
    chatPlaceholder: { 
      'pt-BR': 'Você pode analisar este documento e me dar os detalhes?', 
      'pt': 'Você pode analisar este documento e me dar os detalhes?', 
      'en': 'Could you take a look at this document and give me the details?' 
    },
    agents: { 'pt-BR': 'Agents', 'pt': 'Agents', 'en': 'Agents' },
    cases: { 'pt-BR': 'Casos', 'pt': 'Casos', 'en': 'Cases' },
    recentActivity: { 'pt-BR': 'Atividade Recente', 'pt': 'Atividade Recente', 'en': 'Recent Activity' },
    quickStats: { 'pt-BR': 'Estatísticas Rápidas', 'pt': 'Estatísticas Rápidas', 'en': 'Quick Stats' }
  };

  // Load recent claims from API
  useEffect(() => {
    const loadRecentClaims = async () => {
      setLoading(true);
      try {
        // This would typically be a separate endpoint for recent claims
        // For now, we'll simulate with a limited set
        setRecentClaims([]);
      } catch (error) {
        console.error('Failed to load recent claims:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentClaims();
  }, []);

  const mockCases = [
    {
      id: "1",
      title: "Análise de Sinistro - Auto",
      agent: "Claims Triage Agent",
      status: "processing",
      progress: 75,
      timeElapsed: "2m 30s",
      documentsCount: 3
    },
    {
      id: "2", 
      title: "Revisão de Apólice - Vida",
      agent: "Underwriting Agent",
      status: "completed",
      progress: 100,
      timeElapsed: "5m 12s",
      documentsCount: 7
    },
    {
      id: "3",
      title: "Análise Jurídica - Contrato",
      agent: "Legal Analysis Agent", 
      status: "failed",
      progress: 45,
      timeElapsed: "1m 45s",
      documentsCount: 2
    }
  ];

  const recentActivity = [
    {
      type: "analysis",
      title: "Análise de sinistro concluída",
      time: "5 min atrás",
      agent: "Claims Triage"
    },
    {
      type: "upload",
      title: "3 documentos enviados",
      time: "12 min atrás",
      agent: "Sistema"
    },
    {
      type: "processing",
      title: "Revisão de fraude iniciada",
      time: "18 min atrás", 
      agent: "Fraud Detection"
    }
  ];

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    // Simulate navigation to upload with the query
    navigate('/upload', { state: { query: chatInput } });
  };

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
    
    const labels = {
      processing: "Processando",
      completed: "Concluído",
      failed: "Erro"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-background rounded-full"></div>
              </div>
              <h1 className="text-2xl olga-logo text-foreground">Olga</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-4 text-foreground tracking-tight">
            {t(texts.greeting)}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 font-light">
            {t(texts.subtitle)}
          </p>

          {/* Chat Interface */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={t(texts.chatPlaceholder)}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  />
                </div>
                <Button 
                  size="lg" 
                  className="rounded-full px-6"
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim()}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="gap-1">
                  <Upload className="h-3 w-3" />
                  Sinistros.pdf
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Apólices.docx
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Triagem de Sinistros
                </span>
                <span>•</span>
                <span>Detecção de Fraudes</span>
                <span>•</span>
                <span>Análise Jurídica</span>
                <span>•</span>
                <span>Atendimento ao Cliente</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Agents */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{t(texts.agents)}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{insuranceAgents.length}</Badge>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insuranceAgents.slice(0, 4).map((agent) => (
                <Card 
                  key={agent.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                  onClick={() => navigate(`/agent/${agent.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full ${
                        agent.category === 'claims' ? 'gradient-claims' :
                        agent.category === 'underwriting' ? 'gradient-underwriting' :
                        agent.category === 'legal' ? 'gradient-legal' :
                        'gradient-customer'
                      } flex items-center justify-center`}>
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {t(agent.name)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {t(agent.description)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {agent.estimatedTime}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {agent.complexityLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Cases & Activity */}
          <div className="space-y-6">
            {/* Recent Cases */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t(texts.cases)}</h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
                  <History className="h-4 w-4 mr-2" />
                  Ver Todos
                </Button>
              </div>

              <div className="space-y-3">
                {mockCases.map((case_) => (
                  <Card key={case_.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(case_.status)}
                          <h4 className="font-medium text-sm">{case_.title}</h4>
                        </div>
                        {getStatusBadge(case_.status)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">{case_.agent}</p>
                      
                      {case_.status === 'processing' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progresso</span>
                            <span>{case_.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${case_.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{case_.documentsCount} documentos</span>
                        <span>{case_.timeElapsed}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t(texts.recentActivity)}</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === 'analysis' && <CheckCircle className="h-4 w-4 text-primary" />}
                      {activity.type === 'upload' && <Upload className="h-4 w-4 text-primary" />}
                      {activity.type === 'processing' && <Clock className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.agent}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">{t(texts.quickStats)}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Casos Hoje</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tempo Médio</span>
                    <span className="font-semibold">3m 45s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precisão</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">99.2%</span>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;