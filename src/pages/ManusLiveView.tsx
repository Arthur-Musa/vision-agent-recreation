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
  Bot,
  BarChart3
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
      case 'completed': return 'bg-green-50 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-primary text-primary-foreground ml-auto';
      case 'system': return 'bg-muted text-muted-foreground';
      case 'processing': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Manus Live View
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análise inteligente de documentos com IA
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2 px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {currentAgent}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Trocar Agente
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Panel - Chat Interface */}
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    Conversa com {currentAgent}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Envie comandos ou faça upload de documentos para análise
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
                        addSystemMessage(`🔄 Conectado ao agente: ${agentId}`);
                      }}
                      placeholder="Selecionar agente..."
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <div className="flex flex-col h-full">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Bem-vindo ao Manus Live</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          Envie uma mensagem ou faça upload de documentos para começar
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Upload className="h-3 w-3" />
                        Arraste arquivos aqui ou use o campo de mensagem
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] p-4 rounded-lg ${getMessageColor(message.type)} ${
                              message.type !== 'user' ? 'border shadow-sm' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                                {message.type === 'user' ? 'Você' : 'Agente'}
                              </span>
                              <span className="text-xs opacity-60">
                                {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] p-4 rounded-lg border bg-muted/50">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              <span className="text-sm">Processando...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Digite sua mensagem ou comando..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentMessage)}
                      disabled={isProcessing}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleSendMessage(currentMessage)}
                      disabled={isProcessing || !currentMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Analysis Results */}
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Resultados da Análise
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Acompanhe o progresso e visualize os resultados
              </p>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <div className="h-full overflow-y-auto">
                {steps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Aguardando Análise</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Os resultados aparecerão aqui quando o processamento iniciar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {steps.map((step, index) => (
                      <div 
                        key={step.id} 
                        className={`relative p-4 rounded-lg border transition-all duration-200 ${
                          step.id === currentStep ? 'ring-2 ring-primary border-primary/50 bg-primary/5' : 
                          step.status === 'completed' ? 'bg-green-50 border-green-200' :
                          step.status === 'error' ? 'bg-destructive/10 border-destructive/20' :
                          'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                step.status === 'processing' ? 'bg-primary text-primary-foreground' :
                                step.status === 'error' ? 'bg-destructive text-destructive-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </div>
                              <h4 className="font-medium text-sm">{step.name}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                            {step.timestamp && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(step.timestamp).toLocaleTimeString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={
                              step.status === 'completed' ? 'default' :
                              step.status === 'processing' ? 'secondary' :
                              step.status === 'error' ? 'destructive' :
                              'outline'
                            }
                            className="text-xs"
                          >
                            {step.status === 'completed' ? 'Concluído' :
                             step.status === 'processing' ? 'Processando' :
                             step.status === 'error' ? 'Erro' :
                             'Pendente'}
                          </Badge>
                        </div>
                        
                        {step.status === 'processing' && (
                          <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManusLiveView;