import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { openaiService, AgentResponse } from '@/services/openaiService';
import { claimsDecisionEngine, ClaimAnalysis, DecisionResult, ClaimDocument } from '@/services/claimsDecisionEngine';
import { useToast } from '@/hooks/use-toast';
import { DocumentUpload } from '@/types/agents';
import { DocumentUploadSection } from '@/components/ape-bag/DocumentUploadSection';
import { AnalysisInputSection } from '@/components/ape-bag/AnalysisInputSection';
import { AnalysisResultsSection } from '@/components/ape-bag/AnalysisResultsSection';
import { LiveAnalysisPanel } from '@/components/live-analysis/LiveAnalysisPanel';
import { InteractiveAnalysisChat } from '@/components/claims/InteractiveAnalysisChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fileProcessingService, ExtractedFileData } from '@/services/fileProcessingService';
import { localStorageService, ProcessedClaim } from '@/services/localStorageService';

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

const ApeBagAnalyst = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<DocumentUpload[]>([]);
  const [processedFileData, setProcessedFileData] = useState<ExtractedFileData[]>([]);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [currentClaimId, setCurrentClaimId] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFilesAdded = async (files: DocumentUpload[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Process files immediately
    setCurrentTask('Processando arquivos...');
    try {
      const fileObjects = files.map(f => f.file).filter(Boolean) as File[];
      const processedData = await fileProcessingService.processBatch(fileObjects);
      setProcessedFileData(prev => [...prev, ...processedData]);
      
      toast({
        title: 'Arquivos processados',
        description: `${files.length} arquivo(s) analisado(s) e dados extraídos com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro no processamento',
        description: 'Alguns arquivos não puderam ser processados completamente.',
        variant: 'destructive'
      });
    } finally {
      setCurrentTask('');
    }
  };

  const addAnalysisStep = (step: Omit<AnalysisStep, 'id' | 'timestamp'>) => {
    const newStep: AnalysisStep = {
      ...step,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setAnalysisSteps(prev => [...prev, newStep]);
    return newStep.id;
  };

  const updateAnalysisStep = (id: string, updates: Partial<AnalysisStep>) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleAnalysis = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) {
      toast({
        title: 'Dados necessários',
        description: 'Digite uma descrição ou anexe documentos para análise.',
        variant: 'destructive'
      });
      return;
    }

    // Generate unique claim ID
    const claimId = `APE-${Date.now().toString().slice(-6)}`;
    setCurrentClaimId(claimId);

    setIsProcessing(true);
    setAnalysisSteps([]);
    setResult(null);
    setCurrentTask('Iniciando análise de sinistro APE + BAG...');

    try {
      // Step 1: Identificação do Agente
      const step1Id = addAnalysisStep({
        agent: 'Concierge',
        step: 'Identificação do Agente Especializado',
        content: 'Buscando agente especializado em sinistros APE + BAG...',
        status: 'processing'
      });

      await delay(800);

      const agents = openaiService.getInsuranceAgents();
      const apeBagAgent = Object.values(agents).find(agent => 
        agent.name.toLowerCase().includes('ape') || 
        agent.name.toLowerCase().includes('bag') ||
        agent.assistantId
      ) || agents.claimsProcessor;

      updateAnalysisStep(step1Id, {
        content: `Agente selecionado: ${apeBagAgent.name}${apeBagAgent.assistantId ? ' (Assistant OpenAI)' : ' (Chat Completion)'}`,
        status: 'completed',
        confidence: 0.95
      });

      // Step 2: Análise de Documentos
      const step2Id = addAnalysisStep({
        agent: 'Claims Processor',
        step: 'Análise de Documentos',
        content: 'Processando documentos anexados e extraindo informações relevantes...',
        status: 'processing'
      });

      await delay(1200);

      // Use real processed file data
      let documentText = '';
      let documentSources = [];
      let extractedClaimData: Record<string, any> = {};
      
      if (processedFileData.length > 0) {
        documentText = `\n\nDocumentos processados:\n${processedFileData.map(f => 
          `- ${f.fileName} (${f.fileType}): ${Object.keys(f.extractedFields).length} campos extraídos`
        ).join('\n')}`;

        // Combine extracted data from all files
        extractedClaimData = processedFileData.reduce((acc, file) => ({
          ...acc,
          ...file.extractedFields
        }), {});

        documentSources = processedFileData.map((file, index) => ({
          document: file.fileName,
          page: 1,
          coordinates: [0, 0, 100, 100] as [number, number, number, number],
          text: `Dados extraídos: ${Object.entries(file.extractedFields).map(([k,v]) => `${k}: ${v}`).join(', ')}`
        }));
      }

      updateAnalysisStep(step2Id, {
        content: `${processedFileData.length} documento(s) processado(s). ${Object.keys(extractedClaimData).length} campos extraídos automaticamente.`,
        status: 'completed',
        confidence: 0.88,
        sources: documentSources
      });

      // Step 3: Classificação do Sinistro
      const step3Id = addAnalysisStep({
        agent: 'Policy Analyzer',
        step: 'Classificação do Sinistro',
        content: 'Analisando descrição para determinar tipo de sinistro (APE/BAG)...',
        status: 'processing'
      });

      await delay(1000);

      // Use extracted data for better classification
      const textToAnalyze = inputText + ' ' + Object.values(extractedClaimData).join(' ');
      const isAPE = textToAnalyze.toLowerCase().includes('acidente') || 
                   textToAnalyze.toLowerCase().includes('lesão') || 
                   textToAnalyze.toLowerCase().includes('médico') ||
                   extractedClaimData.claimType === 'APE';
      const isBAG = textToAnalyze.toLowerCase().includes('bagagem') || 
                   textToAnalyze.toLowerCase().includes('mala') || 
                   textToAnalyze.toLowerCase().includes('pertence') ||
                   extractedClaimData.claimType === 'BAG';
      
      updateAnalysisStep(step3Id, {
        content: `Sinistro classificado como: ${isAPE ? 'APE (Acidentes Pessoais)' : ''} ${isBAG ? 'BAG (Bagagem)' : ''} ${!isAPE && !isBAG ? 'Misto/Indefinido' : ''}`,
        status: 'completed',
        confidence: isAPE || isBAG ? 0.92 : 0.65
      });

      // Step 4: Análise Principal
      setCurrentTask('Executando análise principal com IA...');
      const step4Id = addAnalysisStep({
        agent: apeBagAgent.name,
        step: 'Análise Principal',
        content: 'Processando análise completa com inteligência artificial especializada...',
        status: 'processing'
      });

      const analysisPrompt = `Analise este sinistro APE (Acidentes Pessoais) e/ou BAG (Bagagem):

DESCRIÇÃO: ${inputText}

DOCUMENTOS: ${uploadedFiles.length} arquivo(s) anexado(s)${documentText}

Por favor, forneça uma análise completa incluindo:
1. Tipo de sinistro (APE/BAG)
2. Validação de documentos
3. Valores e coberturas
4. Recomendações de aprovação/negativa
5. Próximos passos necessários`;

      const response = await openaiService.processWithAgent(
        apeBagAgent,
        analysisPrompt,
        inputText + documentText
      );

      updateAnalysisStep(step4Id, {
        content: 'Análise principal concluída. Resultado estruturado disponível.',
        status: 'completed',
        confidence: 0.93
      });

      // Step 5: Motor de Decisão V7 Claims
      setCurrentTask('Aplicando regras de negócio e motor de decisão...');
      const step5Id = addAnalysisStep({
        agent: 'Decision Engine V7',
        step: 'Motor de Decisão Automática',
        content: 'Aplicando regras de negócio e critérios de aprovação automática...',
        status: 'processing'
      });

      await delay(800);

      // Use extracted data for better analysis
      const claimAnalysis: ClaimAnalysis = {
        claimNumber: claimId,
        claimType: isAPE && isBAG ? 'APE+BAG' : isAPE ? 'APE' : 'BAG',
        claimValue: extractedClaimData.claimValue || extractClaimValue(response.content, inputText),
        occurrenceDate: extractedClaimData.eventDate || extractOccurrenceDate(inputText) || new Date().toISOString(),
        insuredName: extractedClaimData.insuredName || extractInsuredName(inputText) || 'Cliente',
        policyNumber: extractedClaimData.policyNumber || extractPolicyNumber(inputText) || 'N/A',
        extractedData: { ...response.extractedData, ...extractedClaimData },
        confidence: response.confidence || 0.85,
        riskIndicators: response.validations?.map(v => ({
          type: v.status === 'error' ? 'inconsistency' as const : 'missing_doc' as const,
          severity: v.status === 'error' ? 'high' as const : 'medium' as const,
          description: v.message,
          score: v.status === 'error' ? 0.3 : 0.1
        })) || [],
        documentValidation: []
      };

      const claimDocuments: ClaimDocument[] = uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        extractedData: {}
      }));

      const decision = await claimsDecisionEngine.processClaimDecision(claimAnalysis, claimDocuments);

      updateAnalysisStep(step5Id, {
        content: `Decisão: ${decision.decision} | Confiança: ${(decision.confidence * 100).toFixed(1)}% | Escalação: ${decision.escalationLevel}`,
        status: 'completed',
        confidence: decision.confidence
      });

      // Step 6: Execução Automática (se aplicável)
      if (decision.autoExecutable) {
        const step6Id = addAnalysisStep({
          agent: 'Automation Engine',
          step: 'Execução Automática',
          content: 'Executando ações automáticas aprovadas...',
          status: 'processing'
        });

        await delay(600);

        const executionResult = await claimsDecisionEngine.executeAutomaticActions(decision, claimAnalysis.claimNumber);

        updateAnalysisStep(step6Id, {
          content: `${executionResult.executedActions.length} ação(ões) executada(s) automaticamente`,
          status: executionResult.success ? 'completed' : 'error',
          confidence: executionResult.success ? 0.95 : 0.5
        });
      }

      // Step 7: Validação Final
      const step7Id = addAnalysisStep({
        agent: 'Quality Assurance',
        step: 'Validação Final e Relatório',
        content: 'Gerando relatório final e validações de qualidade...',
        status: 'processing'
      });

      await delay(400);

      updateAnalysisStep(step7Id, {
        content: 'Processo concluído. Dados salvos no Smart Spreadsheet.',
        status: 'completed',
        confidence: 0.92
      });

      // Save processed claim to localStorage
      const processedClaim: ProcessedClaim = {
        id: claimId,
        type: claimAnalysis.claimType,
        status: decision.decision === 'APPROVE' ? 'completed' : 
               decision.decision === 'DENY' ? 'flagged' : 'pending',
        insuredName: claimAnalysis.insuredName,
        policyNumber: claimAnalysis.policyNumber,
        estimatedAmount: claimAnalysis.claimValue,
        createdAt: new Date().toISOString(),
        completedAt: decision.decision === 'APPROVE' ? new Date().toISOString() : null,
        agent: 'APE+BAG Analyst',
        files: processedFileData.map(f => ({
          name: f.fileName,
          type: f.fileType,
          size: f.fileSize,
          extractedData: f.extractedFields
        })),
        extractedData: claimAnalysis.extractedData,
        description: inputText
      };

      localStorageService.saveClaim(processedClaim);

      setResult(response);
      setDecisionResult(decision);
      setCurrentTask('');
      
      toast({
        title: 'Análise concluída e salva',
        description: `Sinistro ${claimId} processado e adicionado ao Smart Spreadsheet.`,
      });
    } catch (error) {
      console.error('Erro na análise:', error);
      
      // Marcar último step como erro
      setAnalysisSteps(prev => {
        const updated = [...prev];
        const lastStep = updated[updated.length - 1];
        if (lastStep && lastStep.status === 'processing') {
          lastStep.status = 'error';
          lastStep.content = 'Erro durante o processamento. Verifique a configuração da API.';
        }
        return updated;
      });

      toast({
        title: 'Erro na análise',
        description: 'Não foi possível processar o sinistro. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setCurrentTask('');
    }
  };

  // Métodos auxiliares para extração de dados
  const extractClaimValue = (content: string, input: string): number => {
    const valueRegex = /R\$\s*([0-9.,]+)/g;
    const matches = [...content.matchAll(valueRegex), ...input.matchAll(valueRegex)];
    if (matches.length > 0) {
      const valueStr = matches[0][1].replace(/[.,]/g, '');
      return parseInt(valueStr) || 5000; // valor padrão
    }
    return 5000; // valor padrão para simulação
  };

  const extractOccurrenceDate = (input: string): string | null => {
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const match = input.match(dateRegex);
    if (match) {
      return new Date(`${match[3]}-${match[2]}-${match[1]}`).toISOString();
    }
    return null;
  };

  const extractInsuredName = (input: string): string | null => {
    const nameRegex = /(?:segurado|cliente|nome)[:\s]+([A-Za-z\s]+)/i;
    const match = input.match(nameRegex);
    return match ? match[1].trim() : null;
  };

  const extractPolicyNumber = (input: string): string | null => {
    const policyRegex = /(?:apólice|política)[:\s#]*([A-Z0-9\-]+)/i;
    const match = input.match(policyRegex);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Analista de Sinistros APE + BAG</h1>
            <Badge variant="secondary">OpenAI Assistant</Badge>
          </div>
        </div>

        <div className="space-y-6">
          <DocumentUploadSection 
            uploadedFiles={uploadedFiles}
            onFilesAdded={handleFilesAdded}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisInputSection
                  inputText={inputText}
                  setInputText={setInputText}
                  isProcessing={isProcessing}
                  uploadedFiles={uploadedFiles}
                  onAnalysis={handleAnalysis}
                />

                <AnalysisResultsSection 
                  result={result} 
                  decisionResult={decisionResult}
                />
              </div>

              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dica:</strong> Para melhor precisão, configure um Assistant OpenAI específico para APE+BAG em Configurações → APIs → Assistants OpenAI
                </AlertDescription>
              </Alert>
            </div>

            <div className="xl:col-span-1">
              <div className="sticky top-4">
                <Tabs defaultValue="live-view" className="h-[600px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="live-view">Live View</TabsTrigger>
                    <TabsTrigger value="chat">Chat IA</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="live-view" className="h-[550px] border rounded-lg bg-card mt-2">
                    <LiveAnalysisPanel
                      isActive={isProcessing || analysisSteps.length > 0}
                      currentTask={currentTask}
                      steps={analysisSteps}
                      onCitationClick={(source) => {
                        toast({
                          title: 'Citação',
                          description: `Documento: ${source.document} - Página ${source.page}`,
                        });
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="chat" className="h-[550px] border rounded-lg bg-card mt-2">
                    <InteractiveAnalysisChat
                      claimId={currentClaimId || `APE-${Date.now().toString().slice(-6)}`}
                      onActionRequested={(action, details) => {
                        toast({
                          title: 'Ação Solicitada',
                          description: `${action}: ${details.description}`,
                        });
                      }}
                      onCitationClick={(citation) => {
                        // Find matching processed file data
                        const fileData = processedFileData.find(f => f.fileName === citation.document);
                        if (fileData) {
                          toast({
                            title: 'Arquivo Processado',
                            description: `${citation.document}: ${Object.keys(fileData.extractedFields).length} campos extraídos`,
                          });
                        } else {
                          toast({
                            title: 'Citação Selecionada',
                            description: `${citation.document} - Página ${citation.page}`,
                          });
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApeBagAnalyst;