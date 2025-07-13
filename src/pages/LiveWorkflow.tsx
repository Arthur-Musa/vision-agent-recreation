import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AgentDropdown } from '@/components/agents/AgentDropdown';
import { conciergeOrchestrator } from '@/services/conciergeOrchestrator';
import { workflowEngine } from '@/services/workflowEngine';
import { agentOptimizer } from '@/services/agentOptimizer';
import { visionAnalyzer } from '@/services/visionAnalyzer';
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
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'system' | 'processing' | 'error' | 'optimization' | 'metrics';
  content: string;
  timestamp: string;
  metadata?: {
    processingTime?: number;
    confidence?: number;
    cacheHit?: boolean;
    agentRecommendation?: any;
  };
}

interface PipelineStep {
  id: number;
  name: string;
  status: 'completed' | 'processing' | 'pending' | 'error';
  description: string;
  timestamp?: string;
}

const LiveWorkflow = () => {
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
  const [systemMetrics, setSystemMetrics] = useState({
    totalQueries: 0,
    avgResponseTime: 2.3,
    accuracyRate: 95,
    cacheHitRate: 0,
    activeAgents: 1
  });
  const [loadDistribution, setLoadDistribution] = useState<Record<string, number>>({});

  // Handle initial query from navigation state
  useEffect(() => {
    const state = location.state as { 
      initialQuery?: string;
      files?: any[];
      selectedAgent?: string;
      agentName?: string;
    };
    
    if (state?.selectedAgent) {
      setCurrentAgent(state.selectedAgent);
      setAgentHistory([state.selectedAgent]);
      
      if (state.initialQuery) {
        addSystemMessage(`🤖 Agente ${state.agentName || state.selectedAgent} ativado`);
        handleDirectAgentMessage(state.initialQuery, state.selectedAgent);
      }
      
      // Clear the state to prevent re-sending
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const addSystemMessage = (
    content: string, 
    type: Message['type'] = 'system',
    metadata?: Message['metadata']
  ) => {
    const message: Message = {
      id: `msg-${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      metadata
    };
    setMessages(prev => [...prev, message]);
  };

  const updateSystemMetrics = (processingTime: number, success: boolean) => {
    setSystemMetrics(prev => ({
      totalQueries: prev.totalQueries + 1,
      avgResponseTime: (prev.avgResponseTime * 0.9) + (processingTime / 1000 * 0.1),
      accuracyRate: success 
        ? (prev.accuracyRate * 0.95) + (100 * 0.05)
        : (prev.accuracyRate * 0.95) + (0 * 0.05),
      cacheHitRate: prev.cacheHitRate, // Updated by vision analyzer
      activeAgents: prev.activeAgents
    }));
  };

  const updateLoadDistribution = () => {
    const distribution = agentOptimizer.getLoadDistribution();
    setLoadDistribution(distribution);
  };

  const handleDirectAgentMessage = async (query: string, agentId: string) => {
    const startTime = Date.now();
    setIsProcessing(true);
    addSystemMessage(`📝 Processando: "${query}"`);
    
    // Get agent optimization requirements
    const taskRequirements = {
      documentTypes: ['PDF'],
      complexity: 'medium' as const,
      urgency: 'medium' as const,
      requiredCapabilities: ['document_parsing', 'data_extraction'],
      estimatedDataVolume: 1,
      complianceRisk: 'low' as const
    };
    
    try {
      const recommendation = await agentOptimizer.recommendAgent(taskRequirements);
      
      // Add optimization insights
      if (recommendation.confidence < 80) {
        addSystemMessage(`⚡ Otimização: ${recommendation.reasoning}`, 'optimization');
      }

      // Use real concierge orchestrator
      const response = await conciergeOrchestrator.processQuery(query);
      const processingTime = Date.now() - startTime;
      
      // Update metrics
      updateSystemMetrics(processingTime, true);
      
      // Update agent performance  
      agentOptimizer.updateAgentPerformance(
        agentId,
        taskRequirements,
        processingTime,
        true,
        85
      );

      addSystemMessage(`✅ Processamento concluído pelo agente ${agentId}`, 'system', {
        processingTime,
        confidence: response.context?.confidence || 80
      });
      
      addSystemMessage(`📊 Resultado: ${response.message}`);
      
      if (response.nextSteps.length > 0) {
        addSystemMessage(`🎯 Próximos passos: ${response.nextSteps.join(', ')}`);
      }

      // Show performance metrics
      addSystemMessage(
        `⚡ Métricas: ${processingTime}ms • Confiança: ${Math.round((response.context?.confidence || 80))}% • Cache: N/A`,
        'metrics'
      );

    } catch (error) {
      const processingTime = Date.now() - startTime;
      updateSystemMetrics(processingTime, false);
      
      agentOptimizer.updateAgentPerformance(
        agentId,
        taskRequirements,
        processingTime,
        false
      );
      
      addSystemMessage(`❌ Erro no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
    
    setIsProcessing(false);
  };

  const handleMessageSent = async () => {
    if (!currentMessage.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = currentMessage;
    setCurrentMessage('');
    setIsProcessing(true);
    
    try {
      // Use real concierge orchestrator for message processing
      const response = await conciergeOrchestrator.processQuery(messageToProcess);
      
      const systemResponse: Message = {
        id: `msg-${Date.now()}`,
        type: 'system',
        content: response.message,
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      setMessages(prev => [...prev, systemResponse]);
      
      // Add next steps if available
      if (response.nextSteps.length > 0) {
        const nextStepsMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          type: 'system',
          content: `🎯 Próximos passos: ${response.nextSteps.join(', ')}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
        setMessages(prev => [...prev, nextStepsMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'error',
        content: `❌ Erro no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsProcessing(false);
  };

  const handleAgentChange = (agentId: string, agent: any) => {
    setCurrentAgent(agentId);
    setAgentHistory(prev => [...prev, agentId]);
    addSystemMessage(`🔄 Agente alterado para: ${agent?.name || agentId}`);
    setShowAgentSelector(false);
  };

  const getAgentDisplayName = (agentId: string) => {
    const agentNames: Record<string, string> = {
      'aura': 'Aura',
      'fraud-detection': 'Fraud Detector',
      'claims-processor': 'Claims Processor',
      'concierge': 'Concierge'
    };
    return agentNames[agentId] || agentId;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
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
            
            <div className="h-6 w-px bg-border" />
            
            <div>
              <h1 className="text-lg font-semibold text-foreground">Live Analysis</h1>
              <p className="text-sm text-muted-foreground">
                Agente ativo: {getAgentDisplayName(currentAgent)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Column - Main Content (8/12) */}
        <div className="flex-1 bg-background border-r border-border">
          <div className="p-6 h-full">
            {/* Executive Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{systemMetrics.totalQueries}</div>
                      <div className="text-sm text-muted-foreground">Total Queries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.round(systemMetrics.accuracyRate)}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{systemMetrics.avgResponseTime.toFixed(1)}s</div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{Math.round(systemMetrics.cacheHitRate)}%</div>
                      <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      O agente <strong>{getAgentDisplayName(currentAgent)}</strong> está processando 
                      informações em tempo real. Todas as análises são salvas automaticamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interaction Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interaction Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma interação ainda</p>
                      <p className="text-xs">Digite uma mensagem abaixo para começar</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          message.type === 'user' ? 'bg-blue-500' : 
                          message.type === 'system' ? 'bg-green-500' : 
                          message.type === 'optimization' ? 'bg-purple-500' :
                          message.type === 'metrics' ? 'bg-orange-500' :
                          message.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.type === 'user' ? 'Usuário' : 
                               message.type === 'optimization' ? 'Otimização' :
                               message.type === 'metrics' ? 'Métricas' :
                               message.type === 'error' ? 'Erro' : 'Sistema'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp}
                            </span>
                            {message.metadata?.processingTime && (
                              <Badge variant="secondary" className="text-xs">
                                {message.metadata.processingTime}ms
                              </Badge>
                            )}
                            {message.metadata?.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(message.metadata.confidence)}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Sidebar (4/12) */}
        <div className="w-80 bg-muted/30 border-l border-border">
          <div className="p-6 space-y-6">
            {/* Agent Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agent Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <div className="font-medium text-sm">{getAgentDisplayName(currentAgent)}</div>
                    <div className="text-xs text-muted-foreground">Ativo</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Uptime: 99.9%</div>
                  <div>Last Response: 0.8s</div>
                  <div>Total Queries: {messages.filter(m => m.type === 'user').length}</div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processing Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isProcessing ? (
                      <>
                        <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                        <span className="text-sm">Processando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Pronto</span>
                      </>
                    )}
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                      }`}
                      style={{ width: isProcessing ? '60%' : '100%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-background p-4">
        <div className="flex items-center gap-4">
          {/* Change Agent Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              Trocar Agente
            </Button>
            
            {showAgentSelector && (
              <div className="absolute bottom-full left-0 mb-2 w-64">
                <Card className="shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Selecionar Agente</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <AgentDropdown
                      value={currentAgent}
                      onValueChange={handleAgentChange}
                      placeholder="Selecione um agente"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-1 flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleMessageSent();
                }
              }}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleMessageSent}
              disabled={!currentMessage.trim() || isProcessing}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Call Concierge Button */}
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chamar Concierge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveWorkflow;