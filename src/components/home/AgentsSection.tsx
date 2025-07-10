import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Bot,
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

const AgentsSection = () => {
  const navigate = useNavigate();
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([]);

  useEffect(() => {
    // Carrega assistants OpenAI configurados
    const savedAssistants = localStorage.getItem('openai_assistants');
    if (savedAssistants) {
      setOpenaiAssistants(JSON.parse(savedAssistants).filter((a: any) => a.enabled));
    }
  }, []);

  const agents: Agent[] = [
    {
      id: 'claims-processing',
      name: 'Automated Claims',
      icon: <FileText className="h-5 w-5" />,
      description: 'V7Labs-style processing with 99.9% accuracy',
      route: '/claims-processing',
      badge: 'AI+OCR',
      color: 'gradient-claims'
    },
    {
      id: 'renewal',
      name: 'Policy Renewal',
      icon: <RefreshCw className="h-5 w-5" />,
      description: 'Comparação e renovação de apólices',
      route: '/renewal',
      badge: 'Diff+AI',
      color: 'gradient-underwriting'
    },
    {
      id: 'underwriting',
      name: 'Underwriting',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Risk scoring e cotação instantânea',
      route: '/underwriting',
      badge: 'Score',
      color: 'gradient-legal'
    },
    {
      id: 'fraud',
      name: 'Fraud Detection',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Detecção de fraudes e anomalias',
      route: '/fraud',
      badge: 'Beta',
      color: 'gradient-customer'
    },
    {
      id: 'metrics',
      name: 'Performance Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Real-time metrics and KPIs',
      route: '/claims-metrics',
      badge: 'Live',
      color: 'gradient-claims'
    },
    {
      id: 'spreadsheets',
      name: 'Smart Spreadsheet',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Tabela em tempo real via SSE/WS',
      route: '/spreadsheets',
      color: 'gradient-underwriting'
    },
    {
      id: 'ape-bag-analyst',
      name: 'Analista APE + BAG',
      icon: <FileText className="h-5 w-5" />,
      description: 'Análise especializada de sinistros APE + BAG',
      route: '/ape-bag-analyst',
      badge: 'OpenAI',
      color: 'gradient-claims'
    }
  ];

  return (
    <>
      {/* Seção de Agents Pré-construídos */}
      <section className="mb-8" aria-label="Agents">
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
              className="agent-card cursor-pointer hover:scale-105 transition-all duration-200"
              onClick={() => navigate(agent.route)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-lg ${agent.color} text-foreground/80`}>
                    {agent.icon}
                  </div>
                  {agent.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {agent.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium mb-1 text-foreground">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Seção de OpenAI Assistants */}
      {openaiAssistants.length > 0 && (
        <section className="mb-12" aria-label="OpenAI Assistants">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-pink-600" />
              <h2 className="text-2xl font-semibold">Seus Assistants OpenAI</h2>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Gerenciar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {openaiAssistants.map((assistant) => (
              <Card 
                key={assistant.id}
                className="cursor-pointer hover:scale-105 transition-all duration-200 border-pink-200 hover:border-pink-300"
                onClick={() => navigate('/upload')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700">
                      <Bot className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                      OpenAI
                    </Badge>
                  </div>
                  <h3 className="font-medium mb-1 text-foreground">{assistant.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {assistant.description || 'Assistant personalizado da OpenAI'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>ID: {assistant.assistantId.slice(0, 12)}...</span>
                    {assistant.knowledgeFiles > 0 && (
                      <>
                        <span>•</span>
                        <span>{assistant.knowledgeFiles} arquivos</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Para usar seus assistants:</strong> Vá para Upload de Documentos ou Teste de Agentes
            </p>
          </div>
        </section>
      )}
    </>
  );
};

export default AgentsSection;