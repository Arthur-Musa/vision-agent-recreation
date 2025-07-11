import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: 'claims' | 'underwriting' | 'legal' | 'customer';
  route: string;
  status?: 'active' | 'processing' | 'empty';
}


const AgentCards = () => {
  const navigate = useNavigate();

  const agents: Agent[] = [
    {
      id: 'aura',
      name: 'Aura',
      description: 'Análise inteligente de documentos e contratos',
      category: 'legal',
      route: '/manus-live',
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
      case 'active': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300';
      case 'empty': 
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };


  return (
    <div className="max-w-6xl mx-auto mb-16">
      {/* Section Header */}
      <div className="text-center spacing-stack-lg mb-12">
        <h2 className="text-heading-2">Agentes Inteligentes</h2>
        <p className="text-body text-muted-foreground max-w-2xl mx-auto">
          Escolha o agente especializado para automatizar seus processos de seguros com precisão e eficiência
        </p>
      </div>

      {/* Compact Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const colors = getCategoryColors(agent.category);
          return (
            <div
              key={agent.id}
              className="group relative bg-card border border-border/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1"
              onClick={() => navigate(agent.route, { 
                state: { 
                  selectedAgent: agent.id,
                  agentName: agent.name,
                  initialQuery: `Iniciando análise com ${agent.name} - ${agent.description}`
                } 
              })}
            >
              {/* Status Badge */}
              {agent.status && (
                <div className="absolute top-4 right-4">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                    {agent.status}
                  </div>
                </div>
              )}

              {/* Agent Icon with Gradient */}
              <div className="relative mb-4">
                <div 
                  className={`w-12 h-12 rounded-xl ${colors.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}
                  style={{ color: colors.accent }}
                >
                  <Bot className="h-6 w-6" strokeWidth={1.5} />
                </div>
                
                {/* Glow effect on hover */}
                <div 
                  className={`absolute inset-0 w-12 h-12 rounded-xl ${colors.gradient} opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300`}
                ></div>
              </div>

              {/* Content */}
              <div className="spacing-stack-sm">
                <h3 className="text-heading-3 font-semibold group-hover:text-primary transition-colors">
                  {agent.name}
                </h3>
                
                <p className="text-body-sm text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>
              </div>

              {/* Action Arrow */}
              <div className="mt-4 flex items-center justify-between">
                <div className={`text-xs font-medium tracking-wide uppercase`} style={{ color: colors.accent }}>
                  {agent.category}
                </div>
                
                <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover Border Gradient */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-12 space-y-4">
        <p className="text-body-sm text-muted-foreground mb-4">
          Precisa de algo específico?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            onClick={() => navigate('/agent-builder')}
            className="inline-flex items-center gap-2 text-body-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Criar agente personalizado
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <span className="text-muted-foreground/50">•</span>
          <button 
            onClick={() => navigate('/openai-test')}
            className="inline-flex items-center gap-2 text-body-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Testar APIs OpenAI
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentCards;