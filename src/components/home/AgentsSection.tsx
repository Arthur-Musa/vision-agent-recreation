import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const handleAgentSelect = (value: string) => {
    const agent = agents.find(a => a.id === value);
    if (agent) {
      navigate(agent.route);
    }
  };

  const handleAssistantSelect = (value: string) => {
    const assistant = openaiAssistants.find(a => a.id === value);
    if (assistant) {
      navigate('/upload');
    }
  };

  return (
    <>
      {/* Seção de Agents Pré-construídos */}
      <section className="mb-8" aria-label="Agents">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold">Agents Especializados</h2>
          <Select onValueChange={handleAgentSelect}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Selecione um agent..." />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    {agent.icon}
                    <span>{agent.name}</span>
                    {agent.badge && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        {agent.badge}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Seção de OpenAI Assistants */}
      {openaiAssistants.length > 0 && (
        <section className="mb-12" aria-label="OpenAI Assistants">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-pink-600" />
              <h2 className="text-2xl font-semibold">Seus Assistants OpenAI</h2>
            </div>
            <Select onValueChange={handleAssistantSelect}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Selecione um assistant..." />
              </SelectTrigger>
              <SelectContent>
                {openaiAssistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-pink-600" />
                      <span>{assistant.name}</span>
                      <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200 ml-2">
                        OpenAI
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Gerenciar
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

export default AgentsSection;