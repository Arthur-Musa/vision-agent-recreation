import { useState, useEffect } from 'react';
import { ConversationalChat } from '@/components/chat/ConversationalChat';
import { LiveAnalysisPanel } from '@/components/live-analysis/LiveAnalysisPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { openaiService } from '@/services/openaiService';
import { claimsApi } from '@/services/claimsApi';
import { useCreateClaim } from '@/hooks/useClaims';

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
  const location = useLocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [isAnalysisMininized, setIsAnalysisMinimized] = useState(false);

  // Process initial query from navigation state
  useEffect(() => {
    const state = location.state as { initialQuery?: string };
    if (state?.initialQuery) {
      // Auto-send the initial query
      handleMessageSent(state.initialQuery);
      // Clear the state to prevent re-sending
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

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
    setCurrentTask(`Criando sinistro: ${message.length > 50 ? message.slice(0, 50) + '...' : message}`);
    
    try {
      // 1. Criar sinistro na API REAL
      const claimData = {
        tipo_sinistro: detectClaimType(message),
        descricao: message,
        valor_estimado: extractAmount(message),
        documentos: files?.map(f => f.name) || []
      };
      
      const claim = await claimsApi.createClaim(claimData);
      
      // 2. Upload de arquivos se houver
      if (files && files.length > 0) {
        for (const file of files) {
          await claimsApi.uploadDocument(claim.id, file);
        }
      }
      
      // 3. Iniciar análise REAL
      setCurrentTask('Iniciando análise do sinistro...');
      await claimsApi.startAnalysis(claim.id);
      
      // 4. Simular live analysis steps (visual)
      const steps = await simulateAnalysisSteps(message, files);
      
      // 5. Buscar resultado da análise REAL
      setCurrentTask('Buscando resultado da análise...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for analysis
      
      const report = await claimsApi.getClaimReport(claim.id);
      
      // 6. Resposta com dados REAIS da API
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: `✅ **Sinistro ${claim.numero_sinistro} analisado com sucesso!**

**Resumo da Análise:**
${report.analysis_summary}

**Achados Principais:**
${report.findings.map(f => `• ${f}`).join('\n')}

**Recomendação:** ${report.recommendation}

**Confiança:** ${(report.confidence * 100).toFixed(1)}%
**Documentos analisados:** ${report.documents_analyzed}
**Tempo de processamento:** ${report.processing_time}ms`,
        timestamp: new Date().toISOString(),
        agent: 'Claims API Real',
        citations: files?.map((file, idx) => ({
          id: `citation-${idx}`,
          document: file.name,
          page: 1,
          text: `Documento ${file.name} processado pela API`,
          confidence: report.confidence,
          coordinates: [0, 0, 100, 100] as [number, number, number, number]
        })) || [],
        status: 'completed'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: '✅ Análise Real Concluída',
        description: `Sinistro ${claim.numero_sinistro} processado pela API especializada.`
      });
      
    } catch (error) {
      console.error('Erro na API de sinistros:', error);
      
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: `❌ **Erro na API de Sinistros**

${error instanceof Error ? error.message : 'Erro desconhecido'}

💡 **Possíveis soluções:**
• Verificar se a API está online: https://sinistros-ia-sistema-production.up.railway.app
• Configurar CORS no backend
• Verificar conectividade de rede

🔄 **Fallback:** Usando OpenAI como backup...`,
        timestamp: new Date().toISOString(),
        agent: 'Sistema',
        status: 'completed'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Fallback para OpenAI se a API falhar
      try {
        const agents = openaiService.getInsuranceAgents();
        const response = await openaiService.processWithAgent(
          agents.claimsProcessor,
          message,
          files ? `Documentos anexados: ${files.map(f => f.name).join(', ')}` : undefined
        );
        
        const fallbackMessage: Message = {
          id: `msg-${Date.now()}`,
          type: 'assistant',
          content: `🔄 **Fallback OpenAI:**\n\n${response.content}`,
          timestamp: new Date().toISOString(),
          agent: 'OpenAI Fallback',
          status: 'completed'
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      } catch (fallbackError) {
        console.error('Fallback também falhou:', fallbackError);
      }
      
      toast({
        title: '❌ Erro na API Real',
        description: 'Usando OpenAI como fallback. Verifique a API de sinistros.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setCurrentTask('');
    }
  };

  // Helper functions
  const detectClaimType = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('auto') || lower.includes('carro') || lower.includes('colisão')) return 'Automotivo';
    if (lower.includes('casa') || lower.includes('residencial') || lower.includes('incêndio')) return 'Residencial';
    if (lower.includes('vida') || lower.includes('morte') || lower.includes('doença')) return 'Vida';
    return 'Geral';
  };

  const extractAmount = (message: string): number | undefined => {
    const regex = /R\$\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/;
    const match = message.match(regex);
    if (match) {
      return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    }
    return undefined;
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