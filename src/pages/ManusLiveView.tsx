import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { conciergeOrchestrator } from '@/services/conciergeOrchestrator';
import { AgentDropdown } from '@/components/agents/AgentDropdown';
import { 
  ArrowLeft, 
  Send, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  MessageSquare,
  Settings,
  Zap,
  Upload,
  FileText,
  Users,
  Bot
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'system' | 'processing' | 'error';
  content: string;
  timestamp: string;
}

interface PipelineStep {
  id: number;
  name: string;
  status: 'completed' | 'processing' | 'pending' | 'error';
  description: string;
  timestamp?: string;
}

const ManusLiveView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>('concierge');
  const [agentHistory, setAgentHistory] = useState<string[]>(['concierge']);
  const [showAgentSelector, setShowAgentSelector] = useState(false);

  // Handle initial query from navigation state - CONCIERGE ORCHESTRATOR FLOW
  useEffect(() => {
    const state = location.state as { 
      initialQuery?: string;
      files?: any[];
      selectedAgent?: string;
      triggeredBy?: 'ask-go' | 'concierge';
    };
    
    if (state?.initialQuery || state?.files?.length) {
      if (state.triggeredBy === 'ask-go') {
        // Fluxo Ask Go: Concierge orquestrador analisa e chama agentes necessários
        startConciergeOrchestration(state.initialQuery || '', state.files || []);
      } else if (state.triggeredBy === 'concierge' && state.selectedAgent) {
        // Fluxo direto: analista selecionou agente específico
        setCurrentAgent(state.selectedAgent);
        setAgentHistory([state.selectedAgent]);
        addSystemMessage(`🤖 Agente ${state.selectedAgent} ativado diretamente`);
        if (state.initialQuery) {
          handleDirectAgentMessage(state.initialQuery, state.selectedAgent);
        }
      }
      
      // Clear the state to prevent re-sending
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const startConciergeOrchestration = async (query: string, files: any[]) => {
    addSystemMessage('🎯 Concierge ativado - Analisando sua demanda...');
    setIsProcessing(true);
    
    try {
      // Chamar o orquestrador
      const response = await conciergeOrchestrator.processQuery(query, files);
      
      if (response.success) {
        addSystemMessage(`✅ ${response.message}`);
        
        // Mostrar agente selecionado
        const selectedAgent = response.context.suggestedAgent;
        setCurrentAgent(selectedAgent);
        setAgentHistory([selectedAgent]);
        
        addSystemMessage(`🤖 Agente ${selectedAgent} foi acionado para sua demanda`);
        addSystemMessage(`📋 Próximos passos: ${response.nextSteps.join(', ')}`);
        
        // Simular início do processamento pelo agente
        await simulateAgentProcessing(selectedAgent, query);
      }
    } catch (error) {
      addSystemMessage('❌ Erro na análise do concierge. Tente novamente.');
      console.error('Concierge error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateAgentProcessing = async (agentId: string, query: string) => {
    const steps: PipelineStep[] = [
      {
        id: 1,
        name: 'Inicialização do Agente',
        status: 'processing',
        description: `Agente ${agentId} inicializando...`,
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Análise da Demanda',
        status: 'pending',
        description: 'Analisando contexto e requisitos'
      },
      {
        id: 3,
        name: 'Processamento',
        status: 'pending',
        description: 'Executando análise especializada'
      },
      {
        id: 4,
        name: 'Geração de Resposta',
        status: 'pending',
        description: 'Formulando resposta e recomendações'
      }
    ];

    setSteps(steps);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i + 1);
      const updatedSteps = [...steps];
      
      if (i > 0) {
        updatedSteps[i - 1].status = 'completed';
        updatedSteps[i - 1].timestamp = new Date().toISOString();
      }
      
      updatedSteps[i].status = 'processing';
      updatedSteps[i].timestamp = new Date().toISOString();
      setSteps([...updatedSteps]);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Finalizar
    const finalSteps = [...steps];
    finalSteps[finalSteps.length - 1].status = 'completed';
    finalSteps[finalSteps.length - 1].timestamp = new Date().toISOString();
    setSteps(finalSteps);
    
    addSystemMessage(`✅ Agente ${agentId} concluiu a análise da sua demanda.`);
    addSystemMessage(`📊 Resultado: Análise completa disponível. O agente está pronto para interação.`);
  };

  const handleDirectAgentMessage = async (message: string, agentId: string) => {
    addSystemMessage(`💬 Enviando mensagem para agente ${agentId}...`);
    await simulateAgentProcessing(agentId, message);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    // Simular resposta do agente atual
    setTimeout(() => {
      const agentResponse: Message = {
        id: `agent_${Date.now()}`,
        type: 'system',
        content: `Agente ${currentAgent}: ${generateAgentResponse(message)}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1000);
  };

  const generateAgentResponse = (userMessage: string): string => {
    const responses = {
      'concierge': 'Analisando sua solicitação e direcionando para o agente mais adequado...',
      'claims-processor': 'Processando informações do sinistro. Preciso de mais detalhes sobre o ocorrido.',
      'fraud-detector': 'Verificando indicadores de fraude na documentação fornecida.',
      'customer-service': 'Como posso ajudá-lo hoje? Estou aqui para resolver suas dúvidas.'
    };
    
    return responses[currentAgent as keyof typeof responses] || 'Processando sua solicitação...';
  };

  // Function removed - using simplified simulation for demo purposes

  const simulateProcessing = async (initialSteps: PipelineStep[]) => {
    const updatedSteps = [...initialSteps];
    
    // Step 1: Analysis
    addSystemMessage('Iniciando análise da solicitação...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updatedSteps[0].status = 'completed';
    updatedSteps[0].timestamp = new Date().toISOString();
    updatedSteps[1].status = 'processing';
    updatedSteps[1].timestamp = new Date().toISOString();
    setSteps([...updatedSteps]);
    setCurrentStep(2);
    
    // Step 2: Data extraction
    addSystemMessage('Extraindo dados relevantes...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updatedSteps[1].status = 'completed';
    updatedSteps[2].status = 'processing';
    updatedSteps[2].timestamp = new Date().toISOString();
    setSteps([...updatedSteps]);
    setCurrentStep(3);
    
    // Step 3: Classification
    addSystemMessage('Classificando tipo de solicitação...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updatedSteps[2].status = 'completed';
    updatedSteps[3].status = 'processing';
    updatedSteps[3].timestamp = new Date().toISOString();
    setSteps([...updatedSteps]);
    setCurrentStep(4);
    
    // Step 4: Processing
    addSystemMessage('Processando regras de negócio...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updatedSteps[3].status = 'completed';
    updatedSteps[4].status = 'processing';
    updatedSteps[4].timestamp = new Date().toISOString();
    setSteps([...updatedSteps]);
    setCurrentStep(5);
    
    // Step 5: Finalization
    addSystemMessage('Finalizando processamento...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updatedSteps[4].status = 'completed';
    updatedSteps[4].timestamp = new Date().toISOString();
    setSteps([...updatedSteps]);
    setCurrentStep(0);
    setIsProcessing(false);
    
    addSystemMessage('Processamento concluído com sucesso!');
    
    toast({
      title: "Processamento Concluído",
      description: "Sua solicitação foi processada com sucesso.",
    });
  };

  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: `system_${Date.now()}_${Math.random()}`,
      type: 'system',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleControlAction = (action: string) => {
    switch (action) {
      case 'retry':
        toast({
          title: "Retry solicitado",
          description: "Repetindo última etapa...",
        });
        break;
      case 'skip':
        toast({
          title: "Skip solicitado",
          description: "Pulando etapa atual...",
        });
        break;
      case 'pause':
        setIsProcessing(false);
        toast({
          title: "Processamento pausado",
          description: "Pipeline pausado pelo usuário.",
        });
        break;
      case 'play':
        setIsProcessing(true);
        toast({
          title: "Processamento retomado",
          description: "Pipeline retomado.",
        });
        break;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-primary text-primary-foreground ml-auto';
      case 'system': return 'bg-blue-50 border-blue-200';
      case 'processing': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Manus Live View
                </h1>
                <p className="text-sm text-muted-foreground">
                  Interação em tempo real com agentes de IA
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Bot className="h-3 w-3" />
                Agente: {currentAgent}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAgentSelector(!showAgentSelector)}
              >
                <Users className="h-4 w-4 mr-1" />
                Trocar Agente
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCurrentAgent('concierge');
                  addSystemMessage('🎯 Concierge ativado - Como posso ajudar?');
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chamar Concierge
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout - 50/50 Split */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Chat */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat com {currentAgent}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Interaja diretamente com o agente ou envie arquivos
                </p>
              </div>
              
              {showAgentSelector && (
                <div className="w-64">
                  <AgentDropdown 
                    value={currentAgent}
                    onValueChange={(agentId) => {
                      setCurrentAgent(agentId);
                      setAgentHistory(prev => [...prev, agentId]);
                      setShowAgentSelector(false);
                      addSystemMessage(`🔄 Trocando para agente: ${agentId}`);
                    }}
                    placeholder="Selecionar agente..."
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.type === 'user' 
                      ? getMessageColor(message.type) 
                      : `border ${getMessageColor(message.type)}`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{message.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
              
              {isProcessing && (
                <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Pipeline executando...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Digite sua mensagem ou comando..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentMessage)}
                disabled={isProcessing}
              />
              <Button 
                onClick={() => handleSendMessage(currentMessage)}
                disabled={isProcessing || !currentMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Pipeline Steps */}
        <div className="w-1/2 bg-muted/20">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Pipeline Status</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe o progresso em tempo real
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {steps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Envie uma mensagem para iniciar um pipeline</p>
              </div>
            ) : (
              steps.map((step) => (
                <Card key={step.id} className={step.id === currentStep ? 'ring-2 ring-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{step.name}</CardTitle>
                      <Badge className={getStepColor(step.status)}>
                        {step.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(step.timestamp).toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManusLiveView;