import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  MoreHorizontal, 
  Bell,
  Bot,
  User,
  FileText,
  Mic,
  MicOff,
  Clock,
  CheckCircle,
  Brain,
  Shield,
  TrendingUp,
  ChevronDown,
  AlertTriangle,
  MessageCircle,
  Car,
  Cpu,
  Target,
  Smartphone,
  Workflow,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Plus,
  Menu,
  X,
  DollarSign,
  Activity
} from 'lucide-react';

const OlgaInterface = () => {
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('chat');
  const [navigationHistory, setNavigationHistory] = useState(['chat']);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [selectedHistoryConversation, setSelectedHistoryConversation] = useState(null);
  const [brandSettings, setBrandSettings] = useState({
    companyName: '88i Seguradora',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    logo: '88iseguradora.digital',
    logoUrl: null
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      agentName: 'Analista de Sinistro',
      agentType: 'sinistro',
      text: '🔔 Novo FNOL recebido via WhatsApp! Cliente: Maria Silva, Sinistro: Acidente pessoal. Protocolo: CLM-2025-001247. Iniciando processamento automático...',
      timestamp: new Date(Date.now() - 300000),
      status: 'delivered',
      workflowId: 'WF-001',
      jobId: 'JOB-5647'
    },
    {
      id: 2,
      sender: 'agent',
      agentName: 'Analista de Documentos',
      agentType: 'documentos',
      text: 'Documentos processados com sucesso! ✅ Extraídos: CPF: 123.456.789-00, RG: 12.345.678-9, Data do sinistro: 15/01/2025, Localização: São Paulo, SP. Confiança: 97.3%',
      timestamp: new Date(Date.now() - 280000),
      status: 'delivered',
      attachments: [
        { type: 'extracted', name: 'Dados_Extraidos_CLM-2025-001247.json', confidence: 97.3 },
        { type: 'images', name: '3 imagens processadas', count: 3 }
      ],
      workflowId: 'WF-001',
      jobId: 'JOB-5648'
    },
    {
      id: 3,
      sender: 'user',
      text: 'Perfeito! Qual o score de risco inicial para esta ocorrência?',
      timestamp: new Date(Date.now() - 260000),
      status: 'read'
    },
    {
      id: 4,
      sender: 'agent',
      agentName: 'Analista de Riscos',
      agentType: 'riscos',
      text: '📊 Análise de risco concluída. Score: 23/100 (Baixo Risco). Fatores avaliados: ✅ Histórico limpo do segurado (5 anos sem sinistros), ✅ Padrão consistente com sinistros legítimos, ✅ Localização compatível com relato. Recomendação: Aprovação automática.',
      timestamp: new Date(Date.now() - 240000),
      status: 'delivered',
      riskData: {
        score: 23,
        level: 'low',
        factors: ['Histórico limpo do segurado', 'Padrão consistente com sinistros legítimos', 'Localização compatível com relato'],
        recommendation: 'approve'
      },
      workflowId: 'WF-001',
      jobId: 'JOB-5649'
    },
    {
      id: 5,
      sender: 'agent',
      agentName: 'Analista de Fraude',
      agentType: 'fraude',
      text: '🔍 Verificação de fraude: APROVADO ✅ Nenhum indicador suspeito encontrado. Análise cruzada com base histórica negativa para padrões fraudulentos. Confiança: 94.7%',
      timestamp: new Date(Date.now() - 220000),
      status: 'delivered',
      fraudCheck: {
        status: 'approved',
        indicators: 0,
        confidence: 94.7
      },
      workflowId: 'WF-001',
      jobId: 'JOB-5650'
    },
    {
      id: 6,
      sender: 'user',
      text: 'Excelente análise! Pode prosseguir com aprovação e calcular o valor da indenização.',
      timestamp: new Date(Date.now() - 200000),
      status: 'read'
    },
    {
      id: 7,
      sender: 'agent',
      agentName: 'Analista de Sinistro',
      agentType: 'sinistro',
      text: '💰 Cálculo de indenização processado! Valor aprovado: R$ 15.750,00 (Franquia: R$ 2.000 | Depreciação: 15% | Valor líquido: R$ 13.750). Documentos gerados automaticamente.',
      timestamp: new Date(Date.now() - 185000),
      status: 'delivered',
      claimData: {
        totalValue: 15750,
        deductible: 2000,
        netValue: 13750,
        depreciation: 15
      },
      workflowId: 'WF-001',
      jobId: 'JOB-5651'
    },
    {
      id: 8,
      sender: 'agent',
      agentName: 'Analista de Sinistro',
      agentType: 'sinistro',
      text: '🎯 Aprovação processada! CLM-2025-001247 aprovado para pagamento de R$ 13.750. Cliente notificado via WhatsApp. PIX agendado para amanhã. Workflow concluído em 4min 32s. ⚡ TAT: 89% abaixo da média!',
      timestamp: new Date(Date.now() - 180000),
      status: 'delivered',
      workflowComplete: {
        claimId: 'CLM-2025-001247',
        amount: 13750,
        duration: '4min 32s',
        tatImprovement: 89
      }
    }
  ]);

  const [conversationHistory] = useState([
    {
      id: 'conv-001',
      title: 'Sinistro CLM-2025-001247 - Análise Completa',
      date: '2025-01-20',
      time: '14:30',
      agent: 'Analista de Sinistro',
      agentType: 'sinistro',
      status: 'concluida',
      messagesCount: 8,
      documentsGenerated: 3,
      summary: 'Sinistro aprovado automaticamente após análise completa de risco e fraude'
    }
  ]);

  const [activeAgents] = useState([
    {
      id: 1,
      name: 'Analista de Sinistro',
      type: 'sinistro',
      status: 'active',
      lastSeen: 'now',
      tasksToday: 47,
      avatar: 'AS',
      capability: 'Recepção e Processamento de Sinistros',
      description: 'Especialista em receber, classificar e processar sinistros via múltiplos canais (WhatsApp, email, telefone, app).',
      openaiId: 'asst_abc123sinistros'
    },
    {
      id: 2,
      name: 'Analista de Documentos',
      type: 'documentos',
      status: 'active',
      lastSeen: '30s ago',
      tasksToday: 156,
      avatar: 'AD',
      capability: 'OCR Inteligente + Extração de Dados Estruturados',
      description: 'Processa documentos com IA avançada, extraindo dados com 99%+ de precisão de RG, CPF, CNH, laudos médicos, atestados, fotos de lesões.',
      openaiId: 'asst_def456docs'
    },
    {
      id: 3,
      name: 'Analista de Riscos',
      type: 'riscos',
      status: 'active',
      lastSeen: '1 min ago',
      tasksToday: 89,
      avatar: 'AR',
      capability: 'Avaliação de Risco e Scoring Preditivo',
      description: 'Analisa histórico do segurado, padrões de sinistros, atividade profissional e comportamento para gerar score de risco automatizado.',
      openaiId: 'asst_ghi789risk'
    },
    {
      id: 4,
      name: 'Analista de Fraude',
      type: 'fraude',
      status: 'active',
      lastSeen: '2 min ago',
      tasksToday: 23,
      avatar: 'AF',
      capability: 'Detecção de Fraudes com Machine Learning',
      description: 'Identifica padrões fraudulentos através de análise cruzada de dados, inconsistências temporais e comportamentais.',
      openaiId: 'asst_jkl012fraud'
    },
    {
      id: 5,
      name: 'Analista de Comunicação',
      type: 'comunicacao',
      status: 'active',
      lastSeen: '3 min ago',
      tasksToday: 67,
      avatar: 'AC',
      capability: 'Comunicação Omnichannel com Clientes',
      description: 'Gerencia comunicação via WhatsApp, SMS, email e push notifications com respostas contextuais inteligentes.',
      openaiId: 'asst_mno345comm'
    }
  ]);

  const [dashboardData] = useState({
    totalClaims: 1000,
    claimsChange: 12.5,
    processingTime: 2.3,
    timeChange: -18.2,
    accuracy: 99.7,
    accuracyChange: 0.3,
    fraudDetected: 23,
    fraudChange: -8.1,
    automationRate: 94.5,
    satisfactionScore: 9.2
  });

  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && selectedAgent) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: message,
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate agent response
      setTimeout(() => {
        const agentResponse = {
          id: messages.length + 2,
          sender: 'agent',
          agentName: selectedAgent.name,
          agentType: selectedAgent.type,
          text: `Processando sua solicitação... Analisando dados disponíveis para fornecer a melhor resposta.`,
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 1500);
    }
  };

  const getAgentIcon = (type) => {
    switch (type) {
      case 'sinistro': return <Shield className="w-4 h-4" strokeWidth={1.5} />;
      case 'documentos': return <Cpu className="w-4 h-4" strokeWidth={1.5} />;
      case 'riscos': return <Target className="w-4 h-4" strokeWidth={1.5} />;
      case 'fraude': return <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />;
      case 'comunicacao': return <Smartphone className="w-4 h-4" strokeWidth={1.5} />;
      default: return <Brain className="w-4 h-4" strokeWidth={1.5} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'busy': return 'bg-amber-400';
      case 'idle': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-muted-foreground bg-muted border-border';
      case 'medium': return 'text-foreground bg-accent border-border';  
      case 'high': return 'text-foreground bg-accent border-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'claims', label: 'Sinistros', icon: FileText },
    { id: 'chat', label: 'Agentes IA', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  // Função para renderizar páginas
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'claims':
        return <ClaimsPage />;
      case 'chat':
        return <ChatPage />;
      case 'analytics':
        return <div className="p-4">Analytics em desenvolvimento...</div>;
      case 'settings':
        return <div className="p-4">Configurações em desenvolvimento...</div>;
      default:
        return <ChatPage />;
    }
  };

  // Dashboard Page Component
  const DashboardPage = () => (
    <div className="min-h-full bg-background">
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 gradient-claims rounded-lg">
              <FileText className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-heading-2">Painel do Analista de Sinistros</h1>
              <p className="text-body-sm text-muted-foreground">Controle e análise completa dos sinistros • Tempo real</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 badge-status-processing">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold">LIVE</span>
            </div>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-lg transition-colors flex items-center space-x-1">
              <Download className="w-3 h-3" strokeWidth={1.5} />
              <span>Relatório</span>
            </button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-6 gap-4">
          <div className="card-elevated p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium badge-status-active px-2 py-1 rounded">
                  +{dashboardData.claimsChange}%
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-foreground">{dashboardData.totalClaims.toLocaleString()}</div>
              <div className="text-sm font-medium text-foreground">Sinistros Hoje</div>
            </div>
            <div className="text-xs text-muted-foreground">523 pendentes análise</div>
          </div>

          <div className="card-elevated p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium badge-status-active px-2 py-1 rounded">
                  {dashboardData.timeChange}%
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-foreground">{dashboardData.processingTime}min</div>
              <div className="text-sm font-medium text-foreground">Tempo Médio</div>
            </div>
            <div className="text-xs text-muted-foreground">Meta: 5min</div>
          </div>

          <div className="card-elevated p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium badge-status-active px-2 py-1 rounded">
                  +24%
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-foreground">743</div>
              <div className="text-sm font-medium text-foreground">Aprovados Hoje</div>
            </div>
            <div className="text-xs text-muted-foreground">Taxa: 74.3%</div>
          </div>

          <div className="card-elevated p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                  <Shield className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                  {dashboardData.fraudChange}%
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-foreground">{dashboardData.fraudDetected}</div>
              <div className="text-sm font-medium text-foreground">Suspeitas Fraude</div>
            </div>
            <div className="text-xs text-muted-foreground">Em investigação: 8</div>
          </div>

          <div className="card-elevated p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  +12%
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-foreground">87</div>
              <div className="text-sm font-medium text-foreground">Alto Risco</div>
            </div>
            <div className="text-xs text-muted-foreground">Score &gt; 70</div>
          </div>

          <div className="card-elevated p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium badge-status-active px-2 py-1 rounded">
                  +8.2%
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="text-2xl font-bold text-foreground">R$ 1.8M</div>
              <div className="text-sm font-medium text-foreground">Valor em Análise</div>
            </div>
            <div className="text-xs text-muted-foreground">Ticket médio: R$ 1.8K</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Claims Page Component
  const ClaimsPage = () => (
    <div className="p-4">
      <h2 className="text-heading-2 mb-4">Gestão de Sinistros</h2>
      <p className="text-body text-muted-foreground">Sistema conectado via webhook N8N: https://olga-ai.app.n8n.cloud/webhook/88i</p>
    </div>
  );

  // Chat Page Component
  const ChatPage = () => (
    <div className="flex h-screen bg-background">
      {/* Chat Interface */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {selectedAgent && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getAgentIcon(selectedAgent.type)}
                    <div>
                      <div className="font-medium text-sm">{selectedAgent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        OpenAI: {selectedAgent.openaiId}
                      </div>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedAgent.status)}`}></div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <AgentSelector 
              agents={activeAgents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua mensagem..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
            
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button 
              className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-destructive text-destructive-foreground' : 'hover:bg-accent'}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={sendMessage}
              disabled={!message.trim() || !selectedAgent}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 border-l border-border bg-background">
          <Sidebar 
            navigationItems={navigationItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}
    </div>
  );

  // Message Bubble Component
  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md p-3 rounded-lg ${
        message.sender === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-foreground'
      }`}>
        {message.sender === 'agent' && (
          <div className="flex items-center space-x-2 mb-2 text-xs">
            {getAgentIcon(message.agentType)}
            <span className="font-medium">{message.agentName}</span>
          </div>
        )}
        
        <div className="text-sm">{message.text}</div>
        
        {message.attachments && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment, idx) => (
              <div key={idx} className="text-xs bg-background/20 p-2 rounded">
                📎 {attachment.name} {attachment.confidence && `(${attachment.confidence}%)`}
              </div>
            ))}
          </div>
        )}
        
        {message.riskData && (
          <div className="mt-2 text-xs">
            <div className={`inline-block px-2 py-1 rounded ${getRiskColor(message.riskData.level)}`}>
              Score: {message.riskData.score}/100
            </div>
          </div>
        )}
        
        <div className="text-xs opacity-70 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );

  // Agent Selector Component
  const AgentSelector = ({ agents, selectedAgent, onSelectAgent }) => (
    <div className="relative">
      <button 
        onClick={() => setShowAgentDropdown(!showAgentDropdown)}
        className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
      >
        {selectedAgent ? (
          <>
            {getAgentIcon(selectedAgent.type)}
            <span className="text-sm">{selectedAgent.name}</span>
          </>
        ) : (
          <>
            <Bot className="w-4 h-4" />
            <span className="text-sm">Selecione um agente</span>
          </>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {showAgentDropdown && (
        <div className="absolute bottom-full mb-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent);
                  setShowAgentDropdown(false);
                }}
                className="w-full p-3 text-left hover:bg-accent rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getAgentIcon(agent.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.capability}</div>
                    <div className="text-xs text-muted-foreground">ID: {agent.openaiId}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Sidebar Component
  const Sidebar = ({ navigationItems, currentPage, onPageChange, onClose }) => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">88i Seguradora</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id ? 'bg-accent' : 'hover:bg-accent'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <div className="h-screen">
      {renderPage()}
    </div>
  );
};

export default OlgaInterface;