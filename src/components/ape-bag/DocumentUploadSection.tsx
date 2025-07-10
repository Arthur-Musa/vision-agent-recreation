import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText } from 'lucide-react';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { DocumentUpload } from '@/types/agents';

interface DocumentUploadSectionProps {
  uploadedFiles: DocumentUpload[];
  onFilesAdded: (files: DocumentUpload[]) => void;
}

export const DocumentUploadSection = ({ uploadedFiles, onFilesAdded }: DocumentUploadSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Documentos do Sinistro
        </CardTitle>
        <CardDescription>
          Anexe documentos relacionados ao sinistro APE/BAG (laudos, fotos, comprovantes, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DocumentUploader onFilesAdded={onFilesAdded} />
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Arquivos anexados ({uploadedFiles.length}):</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm flex-1">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};