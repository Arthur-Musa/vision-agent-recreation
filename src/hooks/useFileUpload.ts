import { useCallback, useState } from "react";
import { DocumentUpload, ProcessingStep } from "@/types/agents";
import { claimsApi } from "@/services/claimsApi";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/environment";
import { validateFileUpload } from "@/lib/validation";
import { fileProcessingService } from "@/services/fileProcessingService";

export const useFileUpload = (claimId?: string) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFiles, setProcessingFiles] = useState<Map<string, any>>(new Map());
  const [showProcessingProgress, setShowProcessingProgress] = useState(false);

  const processFiles = useCallback(async (fileList: FileList): Promise<DocumentUpload[]> => {
    setUploading(true);
    setUploadProgress(0);
    setShowProcessingProgress(true);

    // Security validation
    if (fileList.length > config.security.maxFilesPerUpload) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo de ${config.security.maxFilesPerUpload} arquivos permitidos`,
        variant: "destructive"
      });
      setUploading(false);
      setShowProcessingProgress(false);
      return [];
    }

    const documentUploads: DocumentUpload[] = [];
    const newProcessingFiles = new Map();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileId = `${Date.now()}-${i}`;
      
      // Security validation for each file
      const fileValidation = validateFileUpload({
        name: file.name,
        type: file.type,
        size: file.size
      });

      if (!fileValidation.success) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name}: ${fileValidation.error.errors.map(e => e.message).join(', ')}`,
          variant: "destructive"
        });
        continue;
      }

      // Check file size
      if (file.size > config.security.maxFileSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${config.security.maxFileSize / 1024 / 1024}MB`,
          variant: "destructive"
        });
        continue;
      }

      // Check file type
      if (!config.security.allowedFileTypes.includes(file.type as any)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: `${file.name} tem tipo não suportado: ${file.type}`,
          variant: "destructive"
        });
        continue;
      }

      // Initialize processing steps for this file
      const steps: ProcessingStep[] = [
        { id: 'upload', name: 'Upload do arquivo', status: 'processing', details: 'Enviando arquivo...' },
        { id: 'ocr', name: 'Extração de texto (OCR)', status: 'pending' },
        { id: 'vision', name: 'Análise inteligente (Vision)', status: 'pending' },
        { id: 'extraction', name: 'Extração de dados', status: 'pending' }
      ];

      newProcessingFiles.set(fileId, {
        fileName: file.name,
        steps,
        currentStep: 'upload',
        overallProgress: 10
      });

      setProcessingFiles(new Map(newProcessingFiles));

      try {
        // Simulate upload progress
        setUploadProgress((i / fileList.length) * 100);

        // Update upload step
        steps[0] = { ...steps[0], status: 'completed', details: 'Upload concluído' };
        newProcessingFiles.set(fileId, {
          ...newProcessingFiles.get(fileId),
          steps: [...steps],
          currentStep: 'processing',
          overallProgress: 25
        });
        setProcessingFiles(new Map(newProcessingFiles));

        // Real document processing with OCR and Vision
        console.log(`Starting real processing for: ${file.name}`);

        // Update processing step
        steps[1] = { ...steps[1], status: 'processing', details: 'Extraindo texto com OCR...' };
        steps[2] = { ...steps[2], status: 'processing', details: 'Analisando com GPT-4 Vision...' };
        newProcessingFiles.set(fileId, {
          ...newProcessingFiles.get(fileId),
          steps: [...steps],
          overallProgress: 50
        });
        setProcessingFiles(new Map(newProcessingFiles));

        // Process file with real OCR and Vision
        const extractedData = await fileProcessingService.processFile(file);

        // Update completion steps
        steps[1] = { 
          ...steps[1], 
          status: 'completed', 
          details: 'OCR concluído',
          confidence: extractedData.ocrConfidence || 0
        };
        steps[2] = { 
          ...steps[2], 
          status: 'completed', 
          details: 'Análise inteligente concluída',
          confidence: extractedData.visionAnalysis?.confidence || 0
        };
        steps[3] = { ...steps[3], status: 'processing', details: 'Finalizando extração...' };
        
        newProcessingFiles.set(fileId, {
          ...newProcessingFiles.get(fileId),
          steps: [...steps],
          overallProgress: 85
        });
        setProcessingFiles(new Map(newProcessingFiles));

        const documentUpload: DocumentUpload = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          uploadedAt: new Date(),
          // Add processed data
          extractedText: extractedData.textContent,
          extractedData: extractedData.extractedFields,
          processingMethod: extractedData.metadata.processingMethod,
          confidence: extractedData.ocrConfidence || extractedData.visionAnalysis?.confidence || 0
        };

        documentUploads.push(documentUpload);

        // Complete processing
        steps[3] = { ...steps[3], status: 'completed', details: 'Processamento concluído' };
        newProcessingFiles.set(fileId, {
          ...newProcessingFiles.get(fileId),
          steps: [...steps],
          overallProgress: 100
        });
        setProcessingFiles(new Map(newProcessingFiles));

        // API upload if claimId provided
        if (claimId) {
          try {
            await claimsApi.uploadDocument(claimId, file);
          } catch (error) {
            toast({
              title: "Erro no Upload API",
              description: `Falha ao enviar ${file.name} para API`,
              variant: "destructive"
            });
          }
        }

        console.log(`Successfully processed ${file.name}:`, extractedData);

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        // Update failed steps
        steps.forEach(step => {
          if (step.status === 'processing') {
            step.status = 'failed';
            step.details = 'Falha no processamento';
          }
        });
        
        newProcessingFiles.set(fileId, {
          ...newProcessingFiles.get(fileId),
          steps: [...steps],
          overallProgress: 100
        });
        setProcessingFiles(new Map(newProcessingFiles));

        toast({
          title: "Erro no Processamento",
          description: `Falha ao processar ${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: "destructive"
        });
      }
    }

    setUploadProgress(100);
    setUploading(false);
    
    // Hide processing progress after a delay
    setTimeout(() => {
      setShowProcessingProgress(false);
      setProcessingFiles(new Map());
    }, 3000);

    if (documentUploads.length > 0) {
      toast({
        title: "Processamento Concluído",
        description: `${documentUploads.length} arquivo(s) processado(s) com OCR e Vision real`,
      });
    }

    return documentUploads;
  }, [claimId, toast]);

  return {
    processFiles,
    uploading,
    uploadProgress,
    processingFiles,
    showProcessingProgress
  };
};