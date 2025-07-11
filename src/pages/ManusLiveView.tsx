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
    <div className="min-h-screen bg-white">
      {/* Header simples */}
      <header className="border-b bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="text-sm text-gray-600">
              Olga | Powered by the Olga Engine
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>New</span>
            <span>Chat Data</span>
            <span>Download</span>
            <span>Share</span>
            <span>Processing #1</span>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex">
        {/* Área principal do documento */}
        <div className="flex-1 px-8 py-8 max-w-4xl">
          <div className="space-y-8">
            
            {/* Título principal */}
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Comprehensive Due Diligence Report: {currentAgent === 'aura' ? 'Aura Analysis' : 
                currentAgent === 'fraud-detection' ? 'Fraud Detection Analysis' : 
                currentAgent === 'claims-processor' ? 'Claims Processing Report' : 'Agent Analysis'}
              </h1>
              <div className="text-sm text-gray-500 mt-4">
                <div>Agent Overview</div>
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {currentAgent === 'aura' ? 
                  'Aura é um agente de IA especializado em análise jurídica e processamento de contratos. O sistema utiliza técnicas avançadas de machine learning para revisar documentos legais, extrair cláusulas importantes e identificar potenciais riscos. Com base na análise realizada, apresentamos as principais descobertas e recomendações.' :
                  currentAgent === 'fraud-detection' ?
                  'O sistema de detecção de fraudes utiliza algoritmos avançados de IA para identificar padrões suspeitos em sinistros e documentação. Através da análise de múltiplos fatores e indicadores, o agente consegue determinar a probabilidade de fraude com alta precisão.' :
                  currentAgent === 'claims-processor' ?
                  'O processador de sinistros automatiza a análise e classificação de solicitações de indenização. Utilizando OCR e processamento de linguagem natural, o sistema extrai informações relevantes e fornece recomendações para aprovação ou investigação adicional.' :
                  'Este agente oferece análise abrangente de documentos e processamento inteligente de dados. O sistema foi projetado para extrair insights valiosos e fornecer recomendações precisas baseadas em machine learning.'
                }
              </p>
            </div>

            {/* 1. Performance Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Performance Analysis</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex">
                  <span className="mr-2">•</span>
                  <span><strong>Accuracy Rate:</strong> 95.7% em análises de documentos (base: 1,000+ documentos processados)</span>
                </div>
                <div className="flex">
                  <span className="mr-2">•</span>
                  <span><strong>Processing Time:</strong> Média de 2.1 segundos por página, 45% mais rápido que baseline</span>
                </div>
                <div className="flex">
                  <span className="mr-2">•</span>
                  <span><strong>Confidence Score:</strong> 89.2% média em extrações de dados estruturados</span>
                </div>
                <div className="flex">
                  <span className="mr-2">•</span>
                  <span><strong>Error Rate:</strong> Apenas 2.3% de falsos positivos em análises automatizadas</span>
                </div>
              </div>
            </div>

            {/* Log de atividades se houver */}
            {messages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Activity Log</h3>
                <div className="space-y-3">
                  {messages.slice(-3).map((message, index) => (
                    <div key={message.id} className="text-sm text-gray-700">
                      <span className="mr-2">•</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString('pt-BR')}: {message.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Steps se houver */}
            {steps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Current Processing Status</h3>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center text-sm text-gray-700">
                      <span className="mr-2">•</span>
                      <span className={step.status === 'completed' ? 'line-through text-gray-500' : ''}>
                        {step.name}: {step.description}
                      </span>
                      {step.status === 'processing' && (
                        <span className="ml-2 text-blue-600">[Em andamento]</span>
                      )}
                      {step.status === 'completed' && (
                        <span className="ml-2 text-green-600">[Concluído]</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar direita */}
        <div className="w-80 border-l bg-gray-50 p-6">
          <div className="space-y-6">
            
            {/* Agent Overview */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Agent Overview</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div><strong>Current Agent:</strong> {currentAgent}</div>
                <div><strong>Status:</strong> {isProcessing ? 'Processing' : 'Ready'}</div>
                <div><strong>Last Update:</strong> {new Date().toLocaleTimeString('pt-BR')}</div>
              </div>
            </div>

            {/* Legal Trends */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal Trends Affecting AI Powered CRM</h4>
              <div className="text-xs text-gray-600 leading-relaxed">
                • Data privacy regulations (GDPR and LGPD) continue to shape how companies collect and utilize AI
                • Automated decision-making regulations and transparency requirements
                • The legitimizing focus not only affects product design and data governance across companies
              </div>
            </div>

            {/* General Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">General Information</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Market Position:</strong> Leading AI analysis platform</div>
                <div><strong>Technology:</strong> Advanced ML and NLP algorithms</div>
                <div><strong>Barriers to Entry:</strong> High technical complexity and data requirements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
            >
              Trocar Agente
            </Button>
            
            {showAgentSelector && (
              <div className="w-48">
                <AgentDropdown 
                  value={currentAgent}
                  onValueChange={(agentId) => {
                    setCurrentAgent(agentId);
                    setShowAgentSelector(false);
                    addSystemMessage(`Agente trocado para: ${agentId}`);
                  }}
                  placeholder="Selecionar agente..."
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              placeholder="Digite uma mensagem..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentMessage)}
              disabled={isProcessing}
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
  );
};

export default ManusLiveView;