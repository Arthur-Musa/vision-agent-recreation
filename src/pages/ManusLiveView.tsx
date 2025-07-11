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
                <h1 className="text-2xl font-semibold">
                  Comprehensive Analysis Report: {currentAgent}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análise inteligente de documentos • Powered by AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2 px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Status: Online
              </Badge>
              
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

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-8 min-h-[calc(100vh-200px)]">
          
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentAgent} é um agente de IA especializado em análise de documentos e processamento inteligente. 
                  O sistema utiliza técnicas avançadas de machine learning e processamento de linguagem natural para 
                  extrair insights valiosos, classificar documentos e fornecer recomendações precisas.
                </p>
                
                {/* Current Analysis Steps */}
                {steps.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-base">1. Progresso da Análise</h3>
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'processing' ? 'bg-blue-500' :
                            step.status === 'error' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`}></div>
                          <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                            {step.name}: {step.description}
                          </span>
                          {step.status === 'processing' && (
                            <span className="text-blue-600 text-xs">Em andamento...</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Performance Metrics */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">2. Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">• Accuracy Rate:</span> 95.7% em análises de documentos (1,000+ análises)
                    </div>
                    <div>
                      <span className="font-medium">• Processing Speed:</span> Média de 3.2s por documento
                    </div>
                    <div>
                      <span className="font-medium">• Confidence Score:</span> 89% média geral em extrações
                    </div>
                    <div>
                      <span className="font-medium">• Success Rate:</span> 97.8% de casos processados com sucesso
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Interaction Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma interação registrada ainda</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="border-l-2 border-muted pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {message.type === 'user' ? 'Usuário' : 'Sistema'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-4 space-y-4">
            
            {/* Agent Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Agent Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Especialização</h4>
                  <p className="text-muted-foreground text-xs">
                    {currentAgent === 'aura' ? 'Análise jurídica de contratos e documentos legais' :
                     currentAgent === 'fraud-detection' ? 'Detecção de fraudes em sinistros e documentação' :
                     currentAgent === 'claims-processor' ? 'Processamento automatizado de sinistros' :
                     'Orquestração e direcionamento de demandas'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Capacidades</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• OCR e extração de texto</div>
                    <div>• Análise semântica avançada</div>
                    <div>• Classificação automatizada</div>
                    <div>• Geração de relatórios</div>
                  </div>
                </div>

                {showAgentSelector && (
                  <div>
                    <h4 className="font-medium mb-2">Trocar Agente</h4>
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
              </CardContent>
            </Card>

            {/* Processing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processing Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Processando análise...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Aguardando comando</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    addSystemMessage('🔄 Reiniciando agente...');
                  }}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reiniciar Agente
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/upload')}
                >
                  <Upload className="h-3 w-3" />
                  Upload Documento
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCurrentAgent('concierge');
                  addSystemMessage('🎯 Concierge ativado - Como posso ajudar?');
                }}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chamar Concierge
              </Button>
            </div>
            
            <div className="flex items-center gap-2 flex-1 max-w-md">
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
      </div>
    </div>
  );
};

export default ManusLiveView;