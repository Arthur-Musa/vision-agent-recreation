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
      case 'claims': return '🔍';
      case 'underwriting': return '📊';
      case 'legal': return '⚖️';
      case 'customer': return '🎧';
      case 'assistant': return '🤖';
      default: return '⚙️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'claims': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'underwriting': return 'bg-green-50 text-green-700 border-green-200';
      case 'legal': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'customer': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'assistant': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
            <div className="flex items-center gap-2">
              <span className="text-base">{getCategoryIcon(selectedAgent.category)}</span>
              <span className="font-medium">
                {typeof selectedAgent.name === 'string' ? selectedAgent.name : t(selectedAgent.name)}
              </span>
              <Badge variant="outline" className={`text-xs ${getCategoryColor(selectedAgent.category)}`}>
                {selectedAgent.category}
              </Badge>
              {(selectedAgent as any).knowledgeFiles && (selectedAgent as any).knowledgeFiles > 0 && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  RAG
                </Badge>
              )}
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
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm">{getCategoryIcon(agent.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{t(agent.name)}</span>
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(agent.category)}`}>
                      {agent.category}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t(agent.description)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{agent.estimatedTime}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{agent.complexityLevel}</span>
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
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm">{getCategoryIcon(agent.category)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{agent.name}</span>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(agent.category)}`}>
                        custom
                      </Badge>
                      {agent.knowledgeFiles > 0 && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          RAG
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {agent.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{agent.capabilities.length} capacidades</span>
                      {agent.knowledgeFiles > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{agent.knowledgeFiles} documentos</span>
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
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{assistant.name}</span>
                      <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                        assistant
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {assistant.description || 'OpenAI Assistant personalizado'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">ID: {assistant.assistantId}</span>
                      {assistant.knowledgeFiles > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{assistant.knowledgeFiles} arquivos</span>
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