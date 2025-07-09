import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Globe, 
  MessageCircle, 
  FileText, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Settings
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  route: string;
  badge?: string;
  color: string;
}

interface RecentCase {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  policyNumber?: string;
  insuredName?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [askGoQuery, setAskGoQuery] = useState('');
  const [userName] = useState('Ana'); // Mock user name

  const agents: Agent[] = [
    {
      id: 'claims',
      name: 'Claims Processing',
      icon: <FileText className="h-5 w-5" />,
      description: 'Extração e classificação de sinistros',
      route: '/claims',
      badge: 'OCR+ML',
      color: 'bg-blue-500'
    },
    {
      id: 'renewal',
      name: 'Policy Renewal',
      icon: <RefreshCw className="h-5 w-5" />,
      description: 'Comparação e renovação de apólices',
      route: '/renewal',
      badge: 'Diff+AI',
      color: 'bg-green-500'
    },
    {
      id: 'underwriting',
      name: 'Underwriting',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Risk scoring e cotação instantânea',
      route: '/underwriting',
      badge: 'Score',
      color: 'bg-purple-500'
    },
    {
      id: 'fraud',
      name: 'Fraud Detection',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Detecção de fraudes e anomalias',
      route: '/fraud',
      badge: 'Beta',
      color: 'bg-red-500'
    },
    {
      id: 'spreadsheets',
      name: 'Smart Spreadsheet',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Tabela em tempo real via SSE/WS',
      route: '/spreadsheets',
      color: 'bg-orange-500'
    }
  ];

  const recentCases: RecentCase[] = [
    {
      id: '1',
      type: 'Sinistro Auto',
      status: 'processing',
      createdAt: '2024-01-15T10:30:00Z',
      policyNumber: 'AUTO-123456',
      insuredName: 'João Silva'
    },
    {
      id: '2',
      type: 'Renovação Residencial',
      status: 'completed',
      createdAt: '2024-01-15T09:15:00Z',
      policyNumber: 'RES-789012',
      insuredName: 'Maria Santos'
    },
    {
      id: '3',
      type: 'Cotação Vida',
      status: 'pending',
      createdAt: '2024-01-14T16:45:00Z',
      insuredName: 'Carlos Oliveira'
    }
  ];

  const handleAskGo = () => {
    if (!askGoQuery.trim()) {
      toast({
        title: "Digite sua solicitação",
        description: "Descreva o que você precisa para começar.",
        variant: "destructive"
      });
      return;
    }

    // Redireciona para Manus Live View com a query
    navigate('/live', { state: { initialQuery: askGoQuery } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAskGo();
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-background rounded-full"></div>
              </div>
              <h1 className="text-2xl olga-logo text-foreground">Olga</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-2 text-foreground">
            {getTimeGreeting()}, {userName}
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            O que você gostaria de fazer hoje?
          </p>
        </div>

        {/* Ask Go Box */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-dashed border-border/50 hover:border-border transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    role="search"
                    placeholder="Ask Go..."
                    value={askGoQuery}
                    onChange={(e) => setAskGoQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 h-12"
                  />
                </div>
                <Button onClick={handleAskGo} size="lg" className="px-8">
                  →
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/live')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Job
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/claims')}
                    className="gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Cases
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/live')}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Concierge
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/live')}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agents Carousel */}
        <section className="mb-12" aria-label="Agents">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Agents Especializados</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/spreadsheets')}
            >
              Ver todos
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {agents.map((agent) => (
              <Card 
                key={agent.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(agent.route)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                      {agent.icon}
                    </div>
                    {agent.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {agent.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium mb-1">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Cases */}
        <section aria-label="Recent Cases">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Casos Recentes</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/claims')}
            >
              Ver todos
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCases.map((case_) => (
              <Card 
                key={case_.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/claims/${case_.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{case_.type}</h3>
                    <Badge className={getStatusColor(case_.status)}>
                      {getStatusText(case_.status)}
                    </Badge>
                  </div>
                  {case_.policyNumber && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {case_.policyNumber}
                    </p>
                  )}
                  {case_.insuredName && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {case_.insuredName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(case_.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;