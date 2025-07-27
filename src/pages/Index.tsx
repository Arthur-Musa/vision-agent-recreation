import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileText, Shield, Cpu, Target, Smartphone, Brain, BarChart3, MessageCircle } from "lucide-react";
import OlgaInterface from "@/components/olga/OlgaInterface";

const Index = () => {
  const [userName] = useState('Analista');
  const [showInterface, setShowInterface] = useState(false);
  const navigate = useNavigate();

  // Se a interface estiver ativa, mostrar OlgaInterface
  if (showInterface) {
    return <OlgaInterface />;
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const agents = [
    {
      id: 'claims-processor',
      name: 'Analista de Sinistros',
      description: 'Processamento inteligente de sinistros com análise de risco e fraude',
      icon: Shield,
      color: 'bg-blue-500',
      openaiId: 'asst_abc123'
    },
    {
      id: 'document-processor',
      name: 'Analista de Documentos',
      description: 'OCR e extração de dados de documentos com IA avançada',
      icon: Cpu,
      color: 'bg-green-500',
      openaiId: 'asst_def456'
    },
    {
      id: 'risk-analyzer',
      name: 'Analista de Riscos',
      description: 'Avaliação preditiva de riscos e scoring automatizado',
      icon: Target,
      color: 'bg-amber-500',
      openaiId: 'asst_ghi789'
    },
    {
      id: 'fraud-detector',
      name: 'Detector de Fraudes',
      description: 'Machine Learning para identificação de padrões fraudulentos',
      icon: Brain,
      color: 'bg-red-500',
      openaiId: 'asst_jkl012'
    },
    {
      id: 'communication-agent',
      name: 'Agente de Comunicação',
      description: 'Comunicação omnichannel inteligente com clientes',
      icon: Smartphone,
      color: 'bg-cyan-500',
      openaiId: 'asst_mno345'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Olga AI Platform</h1>
                <p className="text-muted-foreground">Sistema Inteligente de Seguros</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setShowInterface(true)} className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Interface Completa
              </Button>
              <Button onClick={() => navigate('/claims')} variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard Sinistros
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {getTimeGreeting()}, {userName}!
          </h2>
          <p className="text-lg text-muted-foreground">
            Agentes OpenAI conectados • Webhook N8N: https://olga-ai.app.n8n.cloud/webhook/88i
          </p>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <Card key={agent.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${agent.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Bot className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">{agent.openaiId}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed mb-4">
                    {agent.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Ativo</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Usar Agente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sinistros Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">+12% vs ontem</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Processamento Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3min</div>
              <p className="text-xs text-muted-foreground">-18% vs média</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.5%</div>
              <p className="text-xs text-muted-foreground">+2.1% vs mês passado</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;