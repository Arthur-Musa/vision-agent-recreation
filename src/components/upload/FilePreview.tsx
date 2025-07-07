import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { DocumentUpload } from "@/types/agents";
import { FileText, Image, File, X, Eye } from "lucide-react";

interface FilePreviewProps {
  files: DocumentUpload[];
  onRemove: (id: string) => void;
}

export const FilePreview = ({ files, onRemove }: FilePreviewProps) => {
  const { t } = useLanguage();

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return Image;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const texts = {
    title: { 'pt-BR': 'Documentos Carregados', 'pt': 'Documentos Carregados', 'en': 'Uploaded Documents' },
    preview: { 'pt-BR': 'Visualizar', 'pt': 'Visualizar', 'en': 'Preview' },
    remove: { 'pt-BR': 'Remover', 'pt': 'Remover', 'en': 'Remove' },
    total: { 'pt-BR': 'Total:', 'pt': 'Total:', 'en': 'Total:' }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium mb-4">
          {t(texts.title)} ({files.length})
        </h3>
        
        <div className="space-y-3">
          {files.map((file) => {
            const IconComponent = getFileIcon(file.type);
            
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.type.includes('image') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Open image preview in new tab
                        window.open(file.url, '_blank');
                      }}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {t(texts.preview)}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(file.id)}
                    className="text-destructive hover:text-destructive gap-2"
                  >
                    <X className="h-4 w-4" />
                    {t(texts.remove)}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t(texts.total)}</span>
            <span className="font-medium">
              {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'} • {' '}
              {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};