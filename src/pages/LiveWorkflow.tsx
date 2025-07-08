import { useState, useEffect } from 'react';
import { ConversationalChat } from '@/components/chat/ConversationalChat';
import { LiveAnalysisPanel } from '@/components/live-analysis/LiveAnalysisPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { openaiService } from '@/services/openaiService';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agent?: string;
  citations?: Array<{
    id: string;
    document: string;
    page: number;
    text: string;
    confidence: number;
    coordinates: [number, number, number, number];
  }>;
  files?: File[];
  status?: 'sending' | 'sent' | 'processing' | 'completed';
}

interface AnalysisStep {
  id: string;
  timestamp: string;
  agent: string;
  step: string;
  content: string;
  status: 'processing' | 'completed' | 'error';
  confidence?: number;
  sources?: Array<{
    document: string;
    page: number;
    coordinates: [number, number, number, number];
    text: string;
  }>;
}

const LiveWorkflow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [isAnalysisMininized, setIsAnalysisMinimized] = useState(false);

  // Simula steps de análise em tempo real
  const simulateAnalysisSteps = async (userMessage: string, files?: File[]) => {
    const steps: AnalysisStep[] = [];
    
    // Step 1: Concierge Analysis
    const conciergeStep: AnalysisStep = {
      id: `step-${Date.now()}-1`,
      timestamp: new Date().toISOString(),
      agent: 'Concierge',
      step: 'Análise de Entrada',
      content: 'Analisando a solicitação e determinando o melhor agente para processar...',
      status: 'processing'
    };
    
    steps.push(conciergeStep);
    setAnalysisSteps([...steps]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    conciergeStep.status = 'completed';
    conciergeStep.content = 'Roteando para o agente especializado em sinistros baseado no contexto da mensagem.';
    conciergeStep.confidence = 0.95;
    
    // Step 2: Document Analysis (se houver arquivos)
    if (files && files.length > 0) {
      const docStep: AnalysisStep = {
        id: `step-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        agent: 'Claims Processor',
        step: 'Análise de Documentos',
        content: `Processando ${files.length} documento(s) anexado(s) com OCR e extração de dados...`,
        status: 'processing',
        sources: files.map((file, idx) => ({
          document: file.name,
          page: 1,
          coordinates: [100, 200, 400, 250] as [number, number, number, number],
          text: `Documento ${file.name} carregado para análise detalhada`
        }))
      };
      
      steps.push(docStep);
      setAnalysisSteps([...steps]);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      docStep.status = 'completed';
      docStep.content = 'Dados extraídos com sucesso. Identificadas informações relevantes sobre o sinistro.';
      docStep.confidence = 0.92;
    }
    
    // Step 3: Data Extraction
    const extractionStep: AnalysisStep = {
      id: `step-${Date.now()}-3`,
      timestamp: new Date().toISOString(),
      agent: 'Claims Processor',
      step: 'Extração de Dados',
      content: 'Extraindo informações estruturadas: número do sinistro, data, valor, segurado...',
      status: 'processing'
    };
    
    steps.push(extractionStep);
    setAnalysisSteps([...steps]);
    
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    extractionStep.status = 'completed';
    extractionStep.content = 'Dados extraídos: Sinistro SIN-123456, Valor R$ 15.750,00, Segurado: João Silva';
    extractionStep.confidence = 0.89;
    
    // Step 4: Fraud Check
    const fraudStep: AnalysisStep = {
      id: `step-${Date.now()}-4`,
      timestamp: new Date().toISOString(),
      agent: 'Fraud Detective',
      step: 'Verificação de Fraude',
      content: 'Analisando padrões suspeitos, histórico do segurado e indicadores de risco...',
      status: 'processing'
    };
    
    steps.push(fraudStep);
    setAnalysisSteps([...steps]);
    
    await new Promise(resolve => setTimeout(resolve, 2200));
    
    fraudStep.status = 'completed';
    fraudStep.content = 'Nenhum indicador de fraude detectado. Score de risco: BAIXO';
    fraudStep.confidence = 0.94;
    
    // Step 5: Final Analysis
    const finalStep: AnalysisStep = {
      id: `step-${Date.now()}-5`,
      timestamp: new Date().toISOString(),
      agent: 'Claims Processor',
      step: 'Análise Final e Recomendações',
      content: 'Compilando resultados e gerando recomendações para próximos passos...',
      status: 'processing'
    };
    
    steps.push(finalStep);
    setAnalysisSteps([...steps]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    finalStep.status = 'completed';
    finalStep.content = 'Análise concluída. Sinistro aprovado para processamento automático.';
    finalStep.confidence = 0.91;
    
    setAnalysisSteps([...steps]);
    return steps;
  };

  const handleMessageSent = async (message: string, files?: File[]) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      files: files,
      status: 'sent'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setCurrentTask(`Analisando: ${message.length > 50 ? message.slice(0, 50) + '...' : message}`);
    
    try {
      // Simulate live analysis
      const steps = await simulateAnalysisSteps(message, files);
      
      // Generate AI response
      const agents = openaiService.getInsuranceAgents();
      let selectedAgent = agents.claimsProcessor;
      
      // Simple agent selection logic
      if (message.toLowerCase().includes('apólice') || message.toLowerCase().includes('apolice')) {
        selectedAgent = agents.policyAnalyzer;
      } else if (message.toLowerCase().includes('fraude')) {
        selectedAgent = agents.fraudDetector;
      } else if (message.toLowerCase().includes('legal') || message.toLowerCase().includes('jurídico')) {
        selectedAgent = agents.legalAnalyzer;
      }
      
      const response = await openaiService.processWithAgent(
        selectedAgent,
        message,
        files ? `Documentos anexados: ${files.map(f => f.name).join(', ')}` : undefined
      );
      
      // Add assistant response with citations
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        agent: selectedAgent.name,
        citations: steps
          .filter(s => s.sources && s.sources.length > 0)
          .flatMap(s => s.sources!)
          .map((source, idx) => ({
            id: `citation-${idx}`,
            document: source.document,
            page: source.page,
            text: source.text,
            confidence: 0.9,
            coordinates: source.coordinates
          })),
        status: 'completed'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: '✅ Análise concluída',
        description: `${selectedAgent.name} processou sua solicitação com sucesso.`
      });
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente ou configure a API key da OpenAI para melhor funcionamento.',
        timestamp: new Date().toISOString(),
        agent: 'Sistema',
        status: 'completed'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: '❌ Erro no processamento',
        description: 'Verifique a configuração da OpenAI ou tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setCurrentTask('');
    }
  };

  const handleCitationClick = (citation: any) => {
    toast({
      title: 'Citação selecionada',
      description: `Documento: ${citation.document}, Página: ${citation.page}`,
    });
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
                <h1 className="text-xl font-semibold">Olga Live Workflow</h1>
                <p className="text-sm text-muted-foreground">
                  Chat inteligente com análise ao vivo • Estilo V7 Labs
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalysisMinimized(!isAnalysisMininized)}
              className="lg:hidden"
            >
              {isAnalysisMininized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout - V7 Style */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Chat */}
        <div className={`${isAnalysisMininized ? 'w-full' : 'w-full lg:w-1/2'} border-r`}>
          <ConversationalChat
            messages={messages}
            onMessageSent={handleMessageSent}
            onCitationClick={handleCitationClick}
            isProcessing={isProcessing}
          />
        </div>

        {/* Right Panel - Live Analysis */}
        <div className={`${isAnalysisMininized ? 'hidden' : 'hidden lg:block lg:w-1/2'} bg-muted/20`}>
          <LiveAnalysisPanel
            isActive={analysisSteps.length > 0 || isProcessing}
            currentTask={currentTask}
            steps={analysisSteps}
            onCitationClick={handleCitationClick}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveWorkflow;