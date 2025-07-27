import { useNavigate } from "react-router-dom";
import { Bot, Shield, Cpu, Target, AlertTriangle, Smartphone } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'sinistro' | 'documentos' | 'riscos' | 'fraude' | 'comunicacao';
  openaiId: string;
  status: 'active' | 'busy' | 'idle';
  tasksToday: number;
}


const AgentCards = () => {
  const navigate = useNavigate();

  const agents: Agent[] = [
    {
      id: 'agent-sinistro',
      name: 'Analista de Sinistros',
      description: 'Recepção e processamento automático de sinistros via WhatsApp, email e telefone',
      type: 'sinistro',
      openaiId: 'asst_abc123sinistros',
      status: 'active',
      tasksToday: 47
    },
    {
      id: 'agent-documentos',
      name: 'Analista de Documentos',
      description: 'OCR inteligente e extração de dados de RG, CPF, laudos médicos e atestados',
      type: 'documentos',
      openaiId: 'asst_def456docs',
      status: 'active',
      tasksToday: 156
    },
    {
      id: 'agent-riscos',
      name: 'Analista de Riscos',
      description: 'Score preditivo baseado em histórico do segurado e padrões comportamentais',
      type: 'riscos',
      openaiId: 'asst_ghi789risk',
      status: 'busy',
      tasksToday: 89
    },
    {
      id: 'agent-fraude',
      name: 'Analista de Fraude',
      description: 'Detecção de fraudes com machine learning e análise cruzada de dados',
      type: 'fraude',
      openaiId: 'asst_jkl012fraud',
      status: 'active',
      tasksToday: 23
    },
    {
      id: 'agent-comunicacao',
      name: 'Analista de Comunicação',
      description: 'Comunicação omnichannel via WhatsApp, SMS e notificações push',
      type: 'comunicacao',
      openaiId: 'asst_mno345comm',
      status: 'active',
      tasksToday: 67
    }
  ];


  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'sinistro': return <Shield className="h-6 w-6" strokeWidth={1.5} />;
      case 'documentos': return <Cpu className="h-6 w-6" strokeWidth={1.5} />;
      case 'riscos': return <Target className="h-6 w-6" strokeWidth={1.5} />;
      case 'fraude': return <AlertTriangle className="h-6 w-6" strokeWidth={1.5} />;
      case 'comunicacao': return <Smartphone className="h-6 w-6" strokeWidth={1.5} />;
      default: return <Bot className="h-6 w-6" strokeWidth={1.5} />;
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'sinistro': return {
        gradient: 'gradient-claims',
        accent: 'hsl(214, 32%, 35%)'
      };
      case 'documentos': return {
        gradient: 'gradient-underwriting',
        accent: 'hsl(142, 28%, 35%)'
      };
      case 'riscos': return {
        gradient: 'gradient-legal',
        accent: 'hsl(271, 35%, 35%)'
      };
      case 'fraude': return {
        gradient: 'gradient-customer',
        accent: 'hsl(25, 35%, 35%)'
      };
      case 'comunicacao': return {
        gradient: 'gradient-assistant',
        accent: 'hsl(320, 30%, 35%)'
      };
      default: return {
        gradient: 'gradient-hero',
        accent: 'hsl(220, 9%, 35%)'
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-status-active';
      case 'busy': return 'badge-status-processing';
      case 'idle': return 'badge-status-inactive';
      default: return 'badge-status-inactive';
    }
  };

  const handleUseAgent = (agent: Agent) => {
    console.log(`Conectando ao agente OpenAI: ${agent.openaiId}`);
    // Futuramente implementar conexão real com OpenAI
    navigate('/claims', { state: { selectedAgent: agent } });
  };


  return (
    <div className="max-w-6xl mx-auto mb-16">
      {/* Section Header */}
      <div className="text-center spacing-stack-lg mb-12">
        <h2 className="text-heading-2">Agentes IA Conectados</h2>
        <p className="text-body text-muted-foreground max-w-2xl mx-auto">
          Agentes especializados conectados via OpenAI • Processamento automático via webhook N8N
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          Webhook: <code className="bg-muted px-2 py-1 rounded">https://olga-ai.app.n8n.cloud/webhook/88i</code>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const colors = getTypeColors(agent.type);
          return (
            <div
              key={agent.id}
              className="group relative card-elevated p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              onClick={() => handleUseAgent(agent)}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
                  <div className="w-1 h-1 rounded-full bg-current"></div>
                  {agent.status}
                </div>
              </div>

              {/* Agent Icon */}
              <div className="relative mb-4">
                <div 
                  className={`w-12 h-12 rounded-xl ${colors.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}
                  style={{ color: colors.accent }}
                >
                  {getAgentIcon(agent.type)}
                </div>
              </div>

              {/* Content */}
              <div className="spacing-stack-sm">
                <h3 className="text-heading-3 font-semibold group-hover:text-primary transition-colors">
                  {agent.name}
                </h3>
                
                <p className="text-body-sm text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>

                {/* OpenAI ID */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">OpenAI ID:</span>
                  <code className="ml-1 bg-muted px-1 py-0.5 rounded">{agent.openaiId}</code>
                </div>

                {/* Tasks Today */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Tarefas hoje:</span> {agent.tasksToday}
                </div>
              </div>

              {/* Action Arrow */}
              <div className="mt-4 flex items-center justify-between">
                <div className={`text-xs font-medium tracking-wide uppercase`} style={{ color: colors.accent }}>
                  {agent.type}
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

      {/* Quick Actions */}
      <div className="text-center mt-12 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            onClick={() => navigate('/claims')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-body-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Ver Sinistros
          </button>
          <button 
            onClick={() => navigate('/openai-test')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-body-sm font-medium hover:bg-accent transition-colors"
          >
            Testar OpenAI
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