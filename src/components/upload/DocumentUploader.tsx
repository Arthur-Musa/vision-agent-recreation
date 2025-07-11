import { Card, CardContent } from "@/components/ui/card";
import { DocumentUpload } from "@/types/agents";
import { FileDropZone } from "./FileDropZone";
import { MultiFileProcessingProgress } from "./MultiFileProcessingProgress";
import { UploadProgress } from "./UploadProgress";
import { useFileUpload } from "@/hooks/useFileUpload";

interface DocumentUploaderProps {
  onFilesAdded: (files: DocumentUpload[]) => void;
  claimId?: string; // Para upload direto na API
}

export const DocumentUploader = ({ onFilesAdded, claimId }: DocumentUploaderProps) => {
  const {
    processFiles,
    uploading,
    uploadProgress,
    processingFiles,
    showProcessingProgress
  } = useFileUpload(claimId);

  const handleFilesSelected = async (fileList: FileList) => {
    const documentUploads = await processFiles(fileList);
    onFilesAdded(documentUploads);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <FileDropZone 
          onFilesSelected={handleFilesSelected}
          uploading={uploading}
        />
        
        <UploadProgress 
          progress={uploadProgress}
          uploading={uploading}
        />

        {showProcessingProgress && (
          <div className="mt-4">
            <MultiFileProcessingProgress processingFiles={processingFiles} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};