import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AgentDropdown } from "@/components/agents/AgentDropdown";
import { 
  Search, 
  Plus, 
  Globe, 
  MessageCircle,
  Upload,
  X,
  FileText,
  ChevronDown
} from "lucide-react";

interface AskGoBoxProps {
  userName: string;
  getTimeGreeting: () => string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

const AskGoBox = ({ userName, getTimeGreeting }: AskGoBoxProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [askGoQuery, setAskGoQuery] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConciergeSelect = () => {
    if (!askGoQuery.trim() && uploadedFiles.length === 0) {
      toast({
        title: "Adicione conteúdo",
        description: "Digite uma pergunta ou faça upload de arquivos para começar.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to live chat with context
    navigate('/live', { 
      state: { 
        initialQuery: askGoQuery,
        files: uploadedFiles,
        selectedAgent: selectedAgent || 'concierge'
      } 
    });
  };

  const handleAskGo = () => {
    if (!askGoQuery.trim()) {
      toast({
        title: "Digite sua solicitação",
        description: "Descreva o que você precisa para começar.",
        variant: "destructive"
      });
      return;
    }

    // Redireciona para Live View com a query
    navigate('/live', { state: { initialQuery: askGoQuery } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAskGo();
    }
  };

  return (
    <>
      {/* Greeting */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light mb-2 text-foreground">
          {getTimeGreeting()}, {userName}
        </h1>
        <p className="text-xl text-muted-foreground font-light">
          O que você gostaria de fazer hoje?
        </p>
      </div>

      {/* Ask Go Box */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="gradient-hero border border-border/50 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <CardContent className="p-6">
            {/* File Upload Area */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-4 mb-4 transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border/50 bg-background/30'
              } ${uploadedFiles.length > 0 ? 'pb-2' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Upload className="h-5 w-5" />
                <span className="text-sm">
                  {isDragActive 
                    ? 'Solte os arquivos aqui...' 
                    : 'Arraste arquivos ou clique para enviar (PDF, Word, Imagens)'
                  }
                </span>
              </div>
            </div>

            {/* File Pills */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 text-sm border">
                    <FileText className="h-3 w-3" />
                    <span className="truncate max-w-32">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Input
                  role="search"
                  placeholder="Ask Go..."
                  value={askGoQuery}
                  onChange={(e) => setAskGoQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-0 bg-background/50 backdrop-blur-sm text-lg placeholder:text-muted-foreground focus-visible:ring-0 h-12"
                />
              </div>
              <Button onClick={handleAskGo} size="lg" className="px-8">
                →
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/live')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Job
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/agent-builder')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Agente
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/cases')}
                  className="gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Cases
                </Button>
                
                {/* Concierge with Agent Dropdown */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Concierge
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showAgentDropdown && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-popover border rounded-lg shadow-lg min-w-80">
                      <div className="p-3 border-b">
                        <h3 className="font-medium text-sm mb-1">Selecione um Agente</h3>
                        <p className="text-xs text-muted-foreground">Escolha o agente especializado para seu caso</p>
                      </div>
                      <div className="p-2">
                        <AgentDropdown
                          value={selectedAgent}
                          onValueChange={(agentId, agent) => {
                            setSelectedAgent(agentId);
                            setShowAgentDropdown(false);
                            handleConciergeSelect();
                          }}
                          placeholder="Selecione um agente..."
                          className="w-full border-0 bg-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/live')}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AskGoBox;