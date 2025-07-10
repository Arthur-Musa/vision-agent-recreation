import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { InsuranceAgent } from '@/types/agents';
import { insuranceAgents } from '@/data/insuranceAgents';
import { openaiService } from '@/services/openaiService';
import { useNavigate } from 'react-router-dom';

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  knowledgeFiles: number;
}

type AgentType = InsuranceAgent | CustomAgent | {
  id: string;
  name: { 'pt-BR': string; 'pt': string; 'en': string } | string;
  description: { 'pt-BR': string; 'pt': string; 'en': string } | string;
  category: string;
  knowledgeFiles?: number;
  assistantId?: string;
  [key: string]: any;
};

interface AgentDropdownProps {
  value?: string;
  onValueChange: (agentId: string, agent: AgentType) => void;
  placeholder?: string;
  className?: string;
}

export const AgentDropdown = ({ 
  value, 
  onValueChange, 
  placeholder = "Selecione um agente...",
  className 
}: AgentDropdownProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([]);

  useEffect(() => {
    // Load custom agents
    const savedAgents = localStorage.getItem('custom_agents');
    if (savedAgents) {
      setCustomAgents(JSON.parse(savedAgents));
    }

    // Load OpenAI assistants
    const savedAssistants = localStorage.getItem('openai_assistants');
    if (savedAssistants) {
      setOpenaiAssistants(JSON.parse(savedAssistants).filter((a: any) => a.enabled));
    }
  }, []);

  // Combine all agents
  const allAgents = [
    ...insuranceAgents,
    ...customAgents,
    ...openaiAssistants.map(assistant => ({
      id: `assistant_${assistant.id}`,
      name: { 'pt-BR': assistant.name, 'pt': assistant.name, 'en': assistant.name },
      description: { 'pt-BR': assistant.description || 'Assistant OpenAI', 'pt': assistant.description || 'Assistant OpenAI', 'en': assistant.description || 'OpenAI Assistant' },
      category: 'assistant' as const,
      features: [],
      estimatedTime: '1-3 min',
      complexityLevel: 'medium' as const,
      documentTypes: ['PDF', 'Text', 'Images'],
      capabilities: ['assistant', 'rag'],
      useCase: { 'pt-BR': 'Assistant personalizado da OpenAI', 'pt': 'Assistant personalizado da OpenAI', 'en': 'Custom OpenAI Assistant' },
      assistantId: assistant.assistantId,
      knowledgeFiles: assistant.knowledgeFiles || 0
    }))
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'claims': return <Bot className="h-4 w-4" strokeWidth={1.5} />;
      case 'underwriting': return <Bot className="h-4 w-4" strokeWidth={1.5} />;
      case 'legal': return <Bot className="h-4 w-4" strokeWidth={1.5} />;
      case 'customer': return <Bot className="h-4 w-4" strokeWidth={1.5} />;
      case 'assistant': return <Bot className="h-4 w-4" strokeWidth={1.5} />;
      default: return <Bot className="h-4 w-4" strokeWidth={1.5} />;
    }
  };

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
      case 'assistant': return {
        bg: 'hsl(320, 30%, 91%)',
        accent: 'hsl(320, 30%, 35%)',
        gradient: 'gradient-assistant'
      };
      default: return {
        bg: 'hsl(220, 9%, 91%)',
        accent: 'hsl(220, 9%, 35%)',
        gradient: 'gradient-hero'
      };
    }
  };

  const handleAgentSelect = (agentId: string) => {
    if (agentId === 'create_new') {
      navigate('/agent-builder');
      return;
    }

    const agent = allAgents.find(a => a.id === agentId);
    if (agent) {
      onValueChange(agentId, agent);
    }
  };

  const selectedAgent = allAgents.find(a => a.id === value);

  return (
    <Select value={value} onValueChange={handleAgentSelect}>
      <SelectTrigger className={className}>
        <SelectValue>
          {selectedAgent ? (
            <div className="flex items-center gap-3">
              <div 
                className={`w-8 h-8 rounded-full ${getCategoryColors(selectedAgent.category).gradient} flex items-center justify-center border border-border/20`}
                style={{ color: getCategoryColors(selectedAgent.category).accent }}
              >
                {getCategoryIcon(selectedAgent.category)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">
                  {typeof selectedAgent.name === 'string' ? selectedAgent.name : t(selectedAgent.name)}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant="outline" className="text-xs" style={{ 
                    backgroundColor: getCategoryColors(selectedAgent.category).bg,
                    color: getCategoryColors(selectedAgent.category).accent,
                    borderColor: getCategoryColors(selectedAgent.category).accent + '40'
                  }}>
                    {selectedAgent.category}
                  </Badge>
                  {(selectedAgent as any).knowledgeFiles && (selectedAgent as any).knowledgeFiles > 0 && (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      RAG
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      
      <SelectContent className="max-h-96">
        {/* Create New Agent Option */}
        <SelectItem value="create_new" className="border-b mb-2">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-primary">Criar Novo Agente</div>
              <div className="text-xs text-muted-foreground">Construa um agente personalizado com RAG</div>
            </div>
          </div>
        </SelectItem>

        {/* Pre-built Agents */}
        <div className="py-2">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Agentes Pré-construídos
          </div>
          {insuranceAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id} className="py-3">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-8 h-8 rounded-full ${getCategoryColors(agent.category).gradient} flex items-center justify-center border border-border/20 shadow-sm`}
                  style={{ color: getCategoryColors(agent.category).accent }}
                >
                  {getCategoryIcon(agent.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{t(agent.name)}</span>
                    <Badge variant="outline" className="text-xs" style={{ 
                      backgroundColor: getCategoryColors(agent.category).bg,
                      color: getCategoryColors(agent.category).accent,
                      borderColor: getCategoryColors(agent.category).accent + '40'
                    }}>
                      {agent.category}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mb-1">
                    {t(agent.description)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/70">{agent.estimatedTime}</span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground/70 capitalize">{agent.complexityLevel}</span>
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </div>

        {/* Custom Agents */}
        {customAgents.length > 0 && (
          <div className="py-2 border-t">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Agentes Personalizados
            </div>
            {customAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-8 h-8 rounded-full ${getCategoryColors(agent.category).gradient} flex items-center justify-center border border-border/20 shadow-sm`}
                    style={{ color: getCategoryColors(agent.category).accent }}
                  >
                    {getCategoryIcon(agent.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{agent.name}</span>
                      <Badge variant="outline" className="text-xs" style={{ 
                        backgroundColor: getCategoryColors(agent.category).bg,
                        color: getCategoryColors(agent.category).accent,
                        borderColor: getCategoryColors(agent.category).accent + '40'
                      }}>
                        custom
                      </Badge>
                      {agent.knowledgeFiles > 0 && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          RAG
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mb-1">
                      {agent.description}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/70">{agent.capabilities.length} capacidades</span>
                      {agent.knowledgeFiles > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground/50">•</span>
                          <span className="text-xs text-muted-foreground/70">{agent.knowledgeFiles} documentos</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </div>
        )}

        {/* OpenAI Assistants */}
        {openaiAssistants.length > 0 && (
          <div className="py-2 border-t">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              OpenAI Assistants
            </div>
            {openaiAssistants.map((assistant) => (
              <SelectItem key={assistant.id} value={`assistant_${assistant.id}`} className="py-3">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-8 h-8 rounded-full ${getCategoryColors('assistant').gradient} flex items-center justify-center border border-border/20 shadow-sm`}
                    style={{ color: getCategoryColors('assistant').accent }}
                  >
                    <Bot className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{assistant.name}</span>
                      <Badge variant="outline" className="text-xs" style={{ 
                        backgroundColor: getCategoryColors('assistant').bg,
                        color: getCategoryColors('assistant').accent,
                        borderColor: getCategoryColors('assistant').accent + '40'
                      }}>
                        assistant
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mb-1">
                      {assistant.description || 'OpenAI Assistant personalizado'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/70">ID: {assistant.assistantId}</span>
                      {assistant.knowledgeFiles > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground/50">•</span>
                          <span className="text-xs text-muted-foreground/70">{assistant.knowledgeFiles} arquivos</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </div>
        )}
      </SelectContent>
    </Select>
  );
};