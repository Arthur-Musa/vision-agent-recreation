import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuickApiTest } from "@/components/debug/QuickApiTest";
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
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-background rounded-full"></div>
              </div>
              <h1 className="text-xl olga-logo font-medium">Olga</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight">
              {t(texts.greeting)}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(texts.subtitle)}
            </p>
          </div>

          {/* Chat Interface */}
          <Card className="max-w-3xl mx-auto shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder={t(texts.chatPlaceholder)}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="border-0 bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <Button 
                  size="lg" 
                  className="rounded-full px-6 shrink-0"
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim()}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Upload className="h-3 w-3" />
                  Sinistros.pdf
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  Apólices.docx
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
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
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Agents */}
          <section className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t(texts.agents)}</h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  {insuranceAgents.length} agentes
                </Badge>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/')}>
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insuranceAgents.slice(0, 4).map((agent) => (
                <Card 
                  key={agent.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-border/50 hover:border-border"
                  onClick={() => navigate(`/agent/${agent.id}`)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${
                        agent.category === 'claims' ? 'gradient-claims' :
                        agent.category === 'underwriting' ? 'gradient-underwriting' :
                        agent.category === 'legal' ? 'gradient-legal' :
                        'gradient-customer'
                      } flex items-center justify-center shrink-0`}>
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {t(agent.name)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {t(agent.description)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-normal">
                            {agent.estimatedTime}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-normal">
                            {agent.complexityLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Recent Cases */}
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t(texts.cases)}</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="gap-1 text-xs">
                    <History className="h-3 w-3" />
                    Ver Todos
                  </Button>
                </div>

                <div className="space-y-3">
                  {mockCases.slice(0, 3).map((case_) => (
                    <div key={case_.id} className="cursor-pointer group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getStatusIcon(case_.status)}
                          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {case_.title}
                          </h4>
                        </div>
                        {getStatusBadge(case_.status)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{case_.agent}</p>
                      
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
                        <span>{case_.documentsCount} docs</span>
                        <span>{case_.timeElapsed}</span>
                      </div>
                      
                      {case_.id !== mockCases[mockCases.length - 1].id && (
                        <div className="border-b border-border/30 mt-3"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-medium">{t(texts.recentActivity)}</h3>
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {activity.type === 'analysis' && <CheckCircle className="h-3 w-3 text-primary" />}
                        {activity.type === 'upload' && <Upload className="h-3 w-3 text-primary" />}
                        {activity.type === 'processing' && <Clock className="h-3 w-3 text-primary" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="line-clamp-1">{activity.agent}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-medium">{t(texts.quickStats)}</h3>
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

            {/* API Test */}
            <QuickApiTest />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;