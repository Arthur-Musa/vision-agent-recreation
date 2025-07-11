import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, Image, FileText } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface FileDropZoneProps {
  onFilesSelected: (files: FileList) => void;
  uploading: boolean;
}

export const FileDropZone = ({ onFilesSelected, uploading }: FileDropZoneProps) => {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const { files } = e.dataTransfer;
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

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
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" asChild disabled={uploading}>
              <span>{t(texts.browse)}</span>
            </Button>
          </label>
        </div>

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
  );
};