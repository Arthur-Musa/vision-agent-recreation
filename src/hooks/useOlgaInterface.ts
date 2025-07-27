import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'agent';
  agentName?: string;
  agentType?: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: any[];
  riskData?: any;
  fraudCheck?: any;
  claimData?: any;
  workflowComplete?: any;
  workflowId?: string;
  jobId?: string;
}

interface Agent {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'busy' | 'idle';
  lastSeen: string;
  tasksToday: number;
  avatar: string;
  color: string;
  capability: string;
  description: string;
}

export const useOlgaInterface = () => {
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('chat');
  const [navigationHistory, setNavigationHistory] = useState(['chat']);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [selectedHistoryConversation, setSelectedHistoryConversation] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
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
    },
    {
      id: 9,
      sender: 'agent',
      agentName: 'Analista de Sinistro',
      agentType: 'sinistro',
      text: '🔔 Novo sinistro recebido! Cliente: João Pereira, Tipo: Impedimento ao trabalho - Lesão profissional. Protocolo: CLM-2025-001253. Iniciando análise automatizada...',
      timestamp: new Date(Date.now() - 30000),
      status: 'delivered',
      workflowId: 'WF-002',
      jobId: 'JOB-5652'
    },
    {
      id: 10,
      sender: 'agent',
      agentName: 'Analista de Documentos',
      agentType: 'documentos',
      text: '📄 Processando documentos enviados... ✅ Atestado médico digitalizado (confiança: 98.1%), ✅ Laudo pericial (confiança: 95.7%), ⏳ Aguardando comprovante de vínculo empregatício.',
      timestamp: new Date(Date.now() - 15000),
      status: 'delivered',
      attachments: [
        { type: 'extracted', name: 'Atestado_Medico_001253.pdf', confidence: 98.1 },
        { type: 'extracted', name: 'Laudo_Pericial.jpg', confidence: 95.7 }
      ],
      workflowId: 'WF-002',
      jobId: 'JOB-5653'
    },
    {
      id: 11,
      sender: 'agent',
      agentName: 'Analista de Comunicação',
      agentType: 'comunicacao',
      text: '📱 Cliente notificado via WhatsApp sobre documentos pendentes. Link seguro enviado para upload do comprovante de vínculo empregatício. Prazo: 24h. Status: Lido pelo cliente.',
      timestamp: new Date(Date.now() - 5000),
      status: 'delivered',
      workflowId: 'WF-002',
      jobId: 'JOB-5654'
    }
  ]);

  const [activeAgents] = useState<Agent[]>([
    {
      id: 1,
      name: 'Analista de Sinistro',
      type: 'sinistro',
      status: 'active',
      lastSeen: 'now',
      tasksToday: 47,
      avatar: 'AS',
      color: 'bg-primary',
      capability: 'Recepção e Processamento de Sinistros',
      description: 'Especialista em receber, classificar e processar sinistros via múltiplos canais (WhatsApp, email, telefone, app).'
    },
    {
      id: 2,
      name: 'Analista de Documentos',
      type: 'documentos',
      status: 'active',
      lastSeen: '30s ago',
      tasksToday: 156,
      avatar: 'AD',
      color: 'bg-green-500',
      capability: 'OCR Inteligente + Extração de Dados Estruturados',
      description: 'Processa documentos com IA avançada, extraindo dados com 99%+ de precisão de RG, CPF, CNH, laudos médicos, atestados, fotos de lesões.'
    },
    {
      id: 3,
      name: 'Analista de Riscos',
      type: 'riscos',
      status: 'active',
      lastSeen: '1 min ago',
      tasksToday: 89,
      avatar: 'AR',
      color: 'bg-amber-500',
      capability: 'Avaliação de Risco e Scoring Preditivo',
      description: 'Analisa histórico do segurado, padrões de sinistros, atividade profissional e comportamento para gerar score de risco automatizado.'
    },
    {
      id: 4,
      name: 'Analista de Fraude',
      type: 'fraude',
      status: 'active',
      lastSeen: '2 min ago',
      tasksToday: 23,
      avatar: 'AF',
      color: 'bg-red-500',
      capability: 'Detecção de Fraudes com Machine Learning',
      description: 'Identifica padrões fraudulentos através de análise cruzada de dados, inconsistências temporais e comportamentais.'
    },
    {
      id: 5,
      name: 'Analista de Comunicação',
      type: 'comunicacao',
      status: 'active',
      lastSeen: '3 min ago',
      tasksToday: 67,
      avatar: 'AC',
      color: 'bg-cyan-500',
      capability: 'Comunicação Omnichannel com Clientes',
      description: 'Gerencia comunicação via WhatsApp, SMS, email e push notifications com respostas contextuais inteligentes.'
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && selectedAgent) {
      const newMessage: Message = {
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
        const agentResponse: Message = {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'busy': return 'bg-amber-400';
      case 'idle': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-foreground bg-muted border-border';
      case 'medium': return 'text-foreground bg-secondary border-border';  
      case 'high': return 'text-foreground bg-destructive/10 border-destructive/20';
      default: return 'text-foreground bg-muted border-border';
    }
  };

  return {
    // State
    message,
    setMessage,
    selectedAgent,
    setSelectedAgent,
    showAgentDropdown,
    setShowAgentDropdown,
    sidebarOpen,
    setSidebarOpen,
    currentPage,
    setCurrentPage,
    navigationHistory,
    setNavigationHistory,
    showChatHistory,
    setShowChatHistory,
    selectedHistoryConversation,
    setSelectedHistoryConversation,
    isRecording,
    setIsRecording,
    messages,
    setMessages,
    activeAgents,
    dashboardData,
    messagesEndRef,
    
    // Functions
    sendMessage,
    formatTime,
    getStatusColor,
    getRiskColor,
    scrollToBottom
  };
};
