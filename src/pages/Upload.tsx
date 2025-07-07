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
    
    // Simulate processing start
    toast({
      title: t({ 'pt-BR': 'Processamento Iniciado', 'pt': 'Processamento Iniciado', 'en': 'Processing Started' }),
      description: t({ 
        'pt-BR': `${files.length} arquivo(s) serão processados pelo ${t(selectedAgent.name)}`,
        'pt': `${files.length} arquivo(s) serão processados pelo ${t(selectedAgent.name)}`,
        'en': `${files.length} file(s) will be processed by ${t(selectedAgent.name)}`
      }),
    });
    
    // Navigate to processing page (will implement later)
    // navigate(`/processing/${caseId}`);
  }, [selectedAgent, files, t, toast]);

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
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t(texts.back)}
              </Button>
              <div>
                <h1 className="text-2xl font-medium">{t(texts.title)}</h1>
                <p className="text-sm text-muted-foreground">{t(texts.subtitle)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['upload', 'select-agent', 'review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === stepName || (index < ['upload', 'select-agent', 'review'].indexOf(step)) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === stepName ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {stepName === 'upload' && t(texts.uploadStep)}
                  {stepName === 'select-agent' && t(texts.selectAgent)}
                  {stepName === 'review' && t(texts.review)}
                </span>
                {index < 2 && (
                  <div className={`ml-4 w-8 h-px ${
                    index < ['upload', 'select-agent', 'review'].indexOf(step) 
                      ? 'bg-primary' 
                      : 'bg-muted'
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
                    
                    <div className="grid md:grid-cols-2 gap-6">
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