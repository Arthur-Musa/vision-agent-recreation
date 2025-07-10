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

const ApeBagAnalyst = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<DocumentUpload[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFilesAdded = (files: DocumentUpload[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: 'Arquivos carregados',
      description: `${files.length} arquivo(s) adicionado(s) para análise.`,
    });
  };

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
    try {
      // Busca por um assistant configurado para APE+BAG ou usa o padrão
      const agents = openaiService.getInsuranceAgents();
      const apeBagAgent = Object.values(agents).find(agent => 
        agent.name.toLowerCase().includes('ape') || 
        agent.name.toLowerCase().includes('bag') ||
        agent.assistantId
      ) || agents.claimsProcessor;

      // Preparar documentos para análise
      let documentText = '';
      if (uploadedFiles.length > 0) {
        documentText = `\n\nDocumentos anexados:\n${uploadedFiles.map(f => 
          `- ${f.name} (${f.type}, ${(f.size / 1024 / 1024).toFixed(2)}MB)`
        ).join('\n')}`;
      }

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

      setResult(response);
      
      toast({
        title: 'Análise concluída',
        description: 'Sinistro APE + BAG analisado com sucesso.',
      });
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível processar o sinistro. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
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

          <Alert className="mt-6">
            <Bot className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> Para melhor precisão, configure um Assistant OpenAI específico para APE+BAG em Configurações → APIs → Assistants OpenAI
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ApeBagAnalyst;