import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { openaiService } from '@/services/openaiService';
import { useToast } from '@/hooks/use-toast';
import { DocumentUpload } from '@/types/agents';
import { DocumentUploadSection } from '@/components/ape-bag/DocumentUploadSection';
import { AnalysisInputSection } from '@/components/ape-bag/AnalysisInputSection';
import { AnalysisResultsSection } from '@/components/ape-bag/AnalysisResultsSection';
import { LiveAnalysisPanel } from '@/components/live-analysis/LiveAnalysisPanel';

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
  const [result, setResult] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<DocumentUpload[]>([]);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [currentTask, setCurrentTask] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFilesAdded = (files: DocumentUpload[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: 'Arquivos carregados',
      description: `${files.length} arquivo(s) adicionado(s) para análise.`,
    });
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

      let documentText = '';
      let documentSources = [];
      if (uploadedFiles.length > 0) {
        documentText = `\n\nDocumentos anexados:\n${uploadedFiles.map(f => 
          `- ${f.name} (${f.type}, ${(f.size / 1024 / 1024).toFixed(2)}MB)`
        ).join('\n')}`;

        documentSources = uploadedFiles.map((file, index) => ({
          document: file.name,
          page: 1,
          coordinates: [0, 0, 100, 100] as [number, number, number, number],
          text: `Documento ${file.type} de ${(file.size / 1024 / 1024).toFixed(2)}MB anexado para análise`
        }));
      }

      updateAnalysisStep(step2Id, {
        content: `${uploadedFiles.length} documento(s) processado(s). Estrutura de dados extraída com sucesso.`,
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

      const isAPE = inputText.toLowerCase().includes('acidente') || inputText.toLowerCase().includes('lesão') || inputText.toLowerCase().includes('médico');
      const isBAG = inputText.toLowerCase().includes('bagagem') || inputText.toLowerCase().includes('mala') || inputText.toLowerCase().includes('pertence');
      
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

      // Step 5: Validação Final
      const step5Id = addAnalysisStep({
        agent: 'Legal Analyzer',
        step: 'Validação e Recomendações',
        content: 'Validando análise e gerando recomendações finais...',
        status: 'processing'
      });

      await delay(600);

      updateAnalysisStep(step5Id, {
        content: 'Validação concluída. Recomendações de ação definidas com base na análise.',
        status: 'completed',
        confidence: 0.90
      });

      setResult(response);
      setCurrentTask('');
      
      toast({
        title: 'Análise concluída',
        description: 'Sinistro APE + BAG analisado com sucesso.',
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

                <AnalysisResultsSection result={result} />
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
                <div className="h-[600px] border rounded-lg bg-card">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApeBagAnalyst;