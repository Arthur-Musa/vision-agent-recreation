import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUploader } from "@/components/upload/DocumentUploader";
import { AgentSelector } from "@/components/upload/AgentSelector";
import { FilePreview } from "@/components/upload/FilePreview";
import { useLanguage } from "@/hooks/useLanguage";
import { InsuranceAgent } from "@/types/agents";
import { DocumentUpload } from "@/types/agents";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState<DocumentUpload[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<InsuranceAgent | null>(null);
  const [step, setStep] = useState<'upload' | 'select-agent' | 'review'>('upload');

  const handleFilesAdded = useCallback((newFiles: DocumentUpload[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0) {
      setStep('select-agent');
    }
  }, []);

  const handleAgentSelected = useCallback((agent: InsuranceAgent) => {
    setSelectedAgent(agent);
    setStep('review');
  }, []);

  const handleStartProcessing = useCallback(() => {
    if (!selectedAgent || files.length === 0) return;
    
    toast({
      title: t({ 'pt-BR': 'Iniciando Análise', 'pt': 'Iniciando Análise', 'en': 'Starting Analysis' }),
      description: t({ 
        'pt-BR': `Redirecionando para análise conversacional`,
        'pt': `Redirecionando para análise conversacional`,
        'en': `Redirecting to conversational analysis`
      }),
    });
    
    // Navigate to conversation analysis
    navigate(`/conversation/${selectedAgent.id}`);
  }, [selectedAgent, files, t, toast, navigate]);

  const texts = {
    title: { 'pt-BR': 'Upload de Documentos', 'pt': 'Upload de Documentos', 'en': 'Document Upload' },
    subtitle: { 'pt-BR': 'Envie seus documentos para processamento', 'pt': 'Envie seus documentos para processamento', 'en': 'Upload your documents for processing' },
    selectAgent: { 'pt-BR': 'Selecionar Agent', 'pt': 'Selecionar Agent', 'en': 'Select Agent' },
    review: { 'pt-BR': 'Revisar e Processar', 'pt': 'Revisar e Processar', 'en': 'Review and Process' },
    startProcessing: { 'pt-BR': 'Iniciar Processamento', 'pt': 'Iniciar Processamento', 'en': 'Start Processing' },
    back: { 'pt-BR': 'Voltar', 'pt': 'Voltar', 'en': 'Back' },
    uploadStep: { 'pt-BR': 'Upload', 'pt': 'Upload', 'en': 'Upload' }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-medium text-foreground">{t(texts.title)}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t(texts.subtitle)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Minimal Progress Steps */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            {['upload', 'select-agent', 'review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border
                  ${step === stepName || (index < ['upload', 'select-agent', 'review'].indexOf(step)) 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'bg-background text-muted-foreground border-border'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`ml-3 text-sm ${
                  step === stepName ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {stepName === 'upload' && t(texts.uploadStep)}
                  {stepName === 'select-agent' && t(texts.selectAgent)}
                  {stepName === 'review' && t(texts.review)}
                </span>
                {index < 2 && (
                  <div className={`ml-8 w-12 h-px ${
                    index < ['upload', 'select-agent', 'review'].indexOf(step) 
                      ? 'bg-foreground' 
                      : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 'upload' && (
            <div className="space-y-6">
              <DocumentUploader onFilesAdded={handleFilesAdded} />
              {files.length > 0 && (
                <FilePreview files={files} onRemove={(id) => {
                  setFiles(prev => prev.filter(f => f.id !== id));
                }} />
              )}
            </div>
          )}

          {step === 'select-agent' && (
            <AgentSelector 
              files={files}
              onAgentSelected={handleAgentSelected}
              onBack={() => setStep('upload')}
            />
          )}

          {step === 'review' && selectedAgent && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t({ 'pt-BR': 'Revisão do Processamento', 'pt': 'Revisão do Processamento', 'en': 'Processing Review' })}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h4 className="font-medium mb-2">
                          {t({ 'pt-BR': 'Agent Selecionado', 'pt': 'Agent Selecionado', 'en': 'Selected Agent' })}
                        </h4>
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-medium">{t(selectedAgent.name)}</h5>
                          <p className="text-sm text-muted-foreground">{t(selectedAgent.description)}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t({ 'pt-BR': 'Tempo estimado:', 'pt': 'Tempo estimado:', 'en': 'Estimated time:' })} {selectedAgent.estimatedTime}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">
                          {t({ 'pt-BR': 'Documentos', 'pt': 'Documentos', 'en': 'Documents' })} ({files.length})
                        </h4>
                        <div className="space-y-2">
                          {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">{file.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep('select-agent')}>
                      {t(texts.back)}
                    </Button>
                    <Button onClick={handleStartProcessing} className="gap-2">
                      <UploadIcon className="h-4 w-4" />
                      {t(texts.startProcessing)}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;