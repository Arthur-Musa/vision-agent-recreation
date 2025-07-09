import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Upload, 
  Mail, 
  MessageSquare, 
  FileText, 
  Image, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Trash2,
  Eye,
  Brain
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  detectedType?: 'fnol' | 'sov' | 'acord' | 'broker' | 'photo' | 'medical' | 'police' | 'unknown';
  confidence?: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  preview?: string;
}

const UnderwritingIntake = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailIntegrationStatus, setEmailIntegrationStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const documentTypes = {
    fnol: { label: 'FNOL Form', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    sov: { label: 'SOV (Schedule of Values)', icon: <FileSpreadsheet className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    acord: { label: 'ACORD Form', icon: <FileText className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
    broker: { label: 'Broker Application', icon: <FileText className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    photo: { label: 'Photo/Image', icon: <Image className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-800' },
    medical: { label: 'Medical Report', icon: <FileText className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
    police: { label: 'Police Report', icon: <FileText className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
    unknown: { label: 'Unknown', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    selectedFiles.forEach(file => {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading'
      };
      
      setFiles(prev => [...prev, uploadedFile]);
      
      // Simulate upload and analysis
      simulateFileProcessing(uploadedFile);
    });
  };

  const simulateFileProcessing = async (file: UploadedFile) => {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'analyzing' } : f
    ));
    
    // Simulate document classification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const detectedType = detectDocumentType(file.name, file.type);
    const confidence = 0.85 + Math.random() * 0.14; // 85-99%
    
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { 
        ...f, 
        status: 'completed',
        detectedType,
        confidence
      } : f
    ));
  };

  const detectDocumentType = (filename: string, mimeType: string): UploadedFile['detectedType'] => {
    const name = filename.toLowerCase();
    
    if (name.includes('fnol') || name.includes('notice')) return 'fnol';
    if (name.includes('sov') || name.includes('schedule')) return 'sov';
    if (name.includes('acord')) return 'acord';
    if (name.includes('broker') || name.includes('application')) return 'broker';
    if (name.includes('police') || name.includes('incident')) return 'police';
    if (name.includes('medical') || name.includes('hospital')) return 'medical';
    if (mimeType.startsWith('image/')) return 'photo';
    
    return 'unknown';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    // Process dropped files similar to handleFileSelect
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const runExtractionModels = () => {
    if (files.length === 0) {
      toast({
        title: "Nenhum documento",
        description: "Faça upload de documentos antes de executar os modelos de extração.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    toast({
      title: "Executando Modelos",
      description: "Iniciando classificação e extração de dados dos documentos."
    });

    // Navigate to classification step
    setTimeout(() => {
      navigate('/classification', { 
        state: { 
          files: files.filter(f => f.status === 'completed'),
          fromIntake: true 
        } 
      });
    }, 1500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const totalProgress = files.length > 0 ? (completedFiles.length / files.length) * 100 : 0;

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
                onClick={() => navigate('/conversation/claims-processor')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold">Underwriting Intake</h1>
                <p className="text-sm text-muted-foreground">
                  FNOL via email/WhatsApp/upload manual em &lt;3s
                </p>
              </div>
            </div>
            
            <Button 
              onClick={runExtractionModels}
              disabled={completedFiles.length === 0 || isProcessing}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Executar Modelos
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Email Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Integração de Email/WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  emailIntegrationStatus === 'connected' ? 'bg-green-500' :
                  emailIntegrationStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-sm">
                  {emailIntegrationStatus === 'connected' ? 'Conectado' :
                   emailIntegrationStatus === 'connecting' ? 'Conectando...' :
                   'Erro na conexão'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Config Email
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Config WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload de Documentos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Arraste arquivos aqui ou clique para selecionar. Suporta PDF, imagens, Excel, Word.
            </p>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Arraste arquivos aqui ou clique para selecionar</h3>
              <p className="text-muted-foreground">
                PDF, JPG, PNG, XLSX, DOCX até 10MB por arquivo
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx,.doc,.xls"
                onChange={handleFileSelect}
              />
            </div>

            {/* Progress */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progresso do upload</span>
                  <span>{completedFiles.length}/{files.length} concluídos</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Documentos Carregados</CardTitle>
              <p className="text-sm text-muted-foreground">
                {files.length} arquivo(s) • Classificação automática por IA
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        {file.detectedType && documentTypes[file.detectedType]?.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          {file.status === 'completed' && file.detectedType && (
                            <>
                              <span>•</span>
                              <Badge className={documentTypes[file.detectedType].color}>
                                {documentTypes[file.detectedType].label}
                              </Badge>
                              {file.confidence && (
                                <>
                                  <span>•</span>
                                  <span>{(file.confidence * 100).toFixed(1)}% confiança</span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {file.status === 'uploading' && (
                        <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
                      )}
                      {file.status === 'analyzing' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-blue-600">Analisando...</span>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/classification')}
                disabled={completedFiles.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                Classificação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/extraction')}
                disabled={completedFiles.length === 0}
              >
                <Brain className="h-4 w-4 mr-2" />
                Extração IDP
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/claims/queues')}
                disabled={completedFiles.length === 0}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Ir para Filas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnderwritingIntake;