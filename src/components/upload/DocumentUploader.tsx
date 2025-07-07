import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { DocumentUpload } from "@/types/agents";
import { claimsApi } from "@/services/claimsApi";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Image, FileText } from "lucide-react";

interface DocumentUploaderProps {
  onFilesAdded: (files: DocumentUpload[]) => void;
  claimId?: string; // Para upload direto na API
}

export const DocumentUploader = ({ onFilesAdded, claimId }: DocumentUploaderProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback(async (fileList: FileList) => {
    setUploading(true);
    setUploadProgress(0);

    const documentUploads: DocumentUpload[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Simular progresso
      setUploadProgress((i / fileList.length) * 100);

      const documentUpload: DocumentUpload = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        uploadedAt: new Date()
      };

      documentUploads.push(documentUpload);

      // Se temos claimId, fazer upload real para a API
      if (claimId) {
        try {
          await claimsApi.uploadDocument(claimId, file);
        } catch (error) {
          toast({
            title: "Erro no Upload",
            description: `Falha ao enviar ${file.name}`,
            variant: "destructive"
          });
        }
      }
    }

    setUploadProgress(100);
    setUploading(false);
    onFilesAdded(documentUploads);

    if (documentUploads.length > 0) {
      toast({
        title: "Upload Concluído",
        description: `${documentUploads.length} arquivo(s) enviado(s) com sucesso`,
      });
    }
  }, [onFilesAdded, claimId, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const { files } = e.dataTransfer;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const texts = {
    title: { 'pt-BR': 'Upload de Documentos', 'pt': 'Upload de Documentos', 'en': 'Upload Documents' },
    subtitle: { 'pt-BR': 'Arraste arquivos aqui ou clique para selecionar', 'pt': 'Arraste arquivos aqui ou clique para selecionar', 'en': 'Drag files here or click to select' },
    supportedFormats: { 'pt-BR': 'Formatos suportados:', 'pt': 'Formatos suportados:', 'en': 'Supported formats:' },
    browse: { 'pt-BR': 'Procurar Arquivos', 'pt': 'Procurar Arquivos', 'en': 'Browse Files' },
    dragActive: { 'pt-BR': 'Solte os arquivos aqui...', 'pt': 'Solte os arquivos aqui...', 'en': 'Drop files here...' }
  };

  const supportedTypes = [
    { icon: FileText, label: 'PDF', ext: '.pdf' },
    { icon: Image, label: 'Images', ext: '.jpg, .png' },
    { icon: File, label: 'Word', ext: '.docx' },
    { icon: File, label: 'Excel', ext: '.xlsx' }
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div
          className={`
            border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-2">
                {isDragOver ? t(texts.dragActive) : t(texts.title)}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground px-2">
                {t(texts.subtitle)}
              </p>
            </div>

            <div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>{t(texts.browse)}</span>
                </Button>
              </label>
            </div>

            {/* Progresso do Upload */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando arquivos...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                {t(texts.supportedFormats)}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                {supportedTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <type.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                    <span className="sm:hidden">{type.ext}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};