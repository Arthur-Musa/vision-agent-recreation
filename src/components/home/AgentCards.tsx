import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Shield, 
  FileText,
  BarChart3,
  Clock,
  TrendingUp
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'claims' | 'underwriting' | 'legal' | 'customer';
  route: string;
  status?: 'active' | 'processing' | 'empty';
}

interface RecentCase {
  id: string;
  name: string;
  description: string;
  type: 'spreadsheet' | 'analysis' | 'report';
  route: string;
  lastUpdated: string;
}

const AgentCards = () => {
  const navigate = useNavigate();

  const agents: Agent[] = [
    {
      id: 'aura',
      name: 'Aura',
      description: 'Análise inteligente de documentos e contratos',
      category: 'legal',
      route: '/live',
      status: 'active'
    },
    {
      id: 'fraud-detection',
      name: 'Detector de Fraudes',
      description: 'Identificação de padrões suspeitos em sinistros',
      category: 'claims',
      route: '/live',
      status: 'processing'
    },
    {
      id: 'claims-processor',
      name: 'Processador de Sinistros',
      description: 'Análise automatizada de claims e documentação',
      category: 'claims',
      route: '/live',
      status: 'active'
    }
  ];

  const recentCases: RecentCase[] = [
    {
      id: 'spreadsheet-1',
      name: 'Claims Analytics Dashboard',
      description: 'Planilha em tempo real via SSE/WS',
      type: 'spreadsheet',
      route: '/spreadsheets',
      lastUpdated: '2 min ago'
    },
    {
      id: 'analysis-1',
      name: 'APE + BAG Analysis',
      description: 'Análise especializada com IA',
      type: 'analysis',
      route: '/live',
      lastUpdated: '5 min ago'
    }
  ];

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'claims': return {
        bg: 'hsl(214, 32%, 91%)',
        accent: 'hsl(214, 32%, 35%)',
        gradient: 'gradient-claims'
      };
      case 'underwriting': return {
        bg: 'hsl(142, 28%, 91%)',
        accent: 'hsl(142, 28%, 35%)',
        gradient: 'gradient-underwriting'
      };
      case 'legal': return {
        bg: 'hsl(271, 35%, 91%)',
        accent: 'hsl(271, 35%, 35%)',
        gradient: 'gradient-legal'
      };
      case 'customer': return {
        bg: 'hsl(25, 35%, 91%)',
        accent: 'hsl(25, 35%, 35%)',
        gradient: 'gradient-customer'
      };
      default: return {
        bg: 'hsl(220, 9%, 91%)',
        accent: 'hsl(220, 9%, 35%)',
        gradient: 'gradient-hero'
      };
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'empty': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spreadsheet': return <BarChart3 className="h-4 w-4" strokeWidth={1.5} />;
      case 'analysis': return <FileText className="h-4 w-4" strokeWidth={1.5} />;
      case 'report': return <TrendingUp className="h-4 w-4" strokeWidth={1.5} />;
      default: return <FileText className="h-4 w-4" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      {/* Agents Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {agents.map((agent) => {
          const colors = getCategoryColors(agent.category);
          return (
            <Card 
              key={agent.id}
              className="cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 border border-border/50"
              onClick={() => navigate(agent.route, { 
                state: { 
                  selectedAgent: agent.id,
                  agentName: agent.name,
                  initialQuery: `Iniciando análise com ${agent.name} - ${agent.description}`
                } 
              })}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className={`w-10 h-10 rounded-full ${colors.gradient} flex items-center justify-center border border-border/20 shadow-sm flex-shrink-0`}
                    style={{ color: colors.accent }}
                  >
                    <Bot className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{agent.name}</h3>
                      {agent.status && (
                        <Badge variant="outline" className={`text-xs ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Cases Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">Casos Recentes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentCases.map((case_) => (
            <Card 
              key={case_.id}
              className="cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 border border-border/50"
              onClick={() => {
                if (case_.route === '/live') {
                  navigate(case_.route, { 
                    state: { 
                      selectedAgent: 'claims-processor',
                      agentName: 'Claims Processor',
                      initialQuery: `Analisando ${case_.name}...`
                    } 
                  });
                } else {
                  navigate(case_.route);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center border border-border/20 flex-shrink-0">
                    {getTypeIcon(case_.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{case_.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {case_.lastUpdated}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {case_.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentCards;