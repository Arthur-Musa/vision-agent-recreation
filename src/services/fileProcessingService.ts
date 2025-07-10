interface ExtractedFileData {
  fileName: string;
  fileType: string;
  fileSize: number;
  textContent?: string;
  metadata: Record<string, any>;
  extractedFields: Record<string, any>;
}

class FileProcessingService {
  
  async processFile(file: File): Promise<ExtractedFileData> {
    const baseData: ExtractedFileData = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      metadata: {
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString()
      },
      extractedFields: {}
    };

    try {
      // Process based on file type
      if (file.type.includes('text') || file.type.includes('csv')) {
        return await this.processTextFile(file, baseData);
      } else if (file.type.includes('json')) {
        return await this.processJsonFile(file, baseData);
      } else if (file.type.includes('pdf')) {
        return await this.processPdfFile(file, baseData);
      } else if (file.type.includes('image')) {
        return await this.processImageFile(file, baseData);
      } else {
        // Default processing for unknown types
        return this.processUnknownFile(file, baseData);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      baseData.metadata.error = error instanceof Error ? error.message : 'Unknown error';
      return baseData;
    }
  }

  private async processTextFile(file: File, baseData: ExtractedFileData): Promise<ExtractedFileData> {
    const text = await file.text();
    baseData.textContent = text;
    
    // Extract common insurance fields from text
    baseData.extractedFields = this.extractInsuranceFields(text);
    
    return baseData;
  }

  private async processJsonFile(file: File, baseData: ExtractedFileData): Promise<ExtractedFileData> {
    const text = await file.text();
    baseData.textContent = text;
    
    try {
      const jsonData = JSON.parse(text);
      baseData.extractedFields = this.extractFromJsonData(jsonData);
    } catch (error) {
      baseData.metadata.parseError = 'Invalid JSON format';
    }
    
    return baseData;
  }

  private async processPdfFile(file: File, baseData: ExtractedFileData): Promise<ExtractedFileData> {
    // Basic PDF processing - in a real implementation, you'd use pdf-parse or similar
    baseData.metadata.isPdf = true;
    baseData.extractedFields = {
      documentType: 'PDF Document',
      estimatedPages: Math.ceil(file.size / 50000), // Rough estimate
      requiresOCR: true
    };
    
    // Try to extract metadata from filename
    const filenameData = this.extractFromFilename(file.name);
    baseData.extractedFields = { ...baseData.extractedFields, ...filenameData };
    
    return baseData;
  }

  private async processImageFile(file: File, baseData: ExtractedFileData): Promise<ExtractedFileData> {
    baseData.metadata.isImage = true;
    
    // Create image to get dimensions
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        baseData.metadata.width = img.width;
        baseData.metadata.height = img.height;
        baseData.extractedFields = {
          imageType: file.type,
          resolution: `${img.width}x${img.height}`,
          requiresOCR: true,
          ...this.extractFromFilename(file.name)
        };
        resolve(baseData);
      };
      img.onerror = () => {
        baseData.metadata.error = 'Could not load image';
        resolve(baseData);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private processUnknownFile(file: File, baseData: ExtractedFileData): ExtractedFileData {
    baseData.extractedFields = {
      documentType: 'Unknown Format',
      requiresManualReview: true,
      ...this.extractFromFilename(file.name)
    };
    
    return baseData;
  }

  private extractInsuranceFields(text: string): Record<string, any> {
    const fields: Record<string, any> = {};
    
    // CPF extraction
    const cpfMatch = text.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
    if (cpfMatch) fields.cpf = cpfMatch[0];
    
    // CNPJ extraction
    const cnpjMatch = text.match(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/);
    if (cnpjMatch) fields.cnpj = cnpjMatch[0];
    
    // Policy number extraction
    const policyMatch = text.match(/(?:apólice|política|policy)[:\s#]*([A-Z0-9\-]+)/i);
    if (policyMatch) fields.policyNumber = policyMatch[1];
    
    // Name extraction
    const nameMatch = text.match(/(?:segurado|cliente|nome)[:\s]+([A-ZÀ-ÿ\s]+)/i);
    if (nameMatch) fields.insuredName = nameMatch[1].trim();
    
    // Value extraction
    const valueMatch = text.match(/R\$\s*([0-9.,]+)/);
    if (valueMatch) {
      const valueStr = valueMatch[1].replace(/[.,]/g, '');
      fields.claimValue = parseInt(valueStr) || 0;
    }
    
    // Date extraction
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dateMatch) {
      fields.eventDate = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
    }
    
    // Claim type detection
    if (text.toLowerCase().includes('acidente')) fields.claimType = 'APE';
    if (text.toLowerCase().includes('bagagem')) fields.claimType = 'BAG';
    if (text.toLowerCase().includes('auto')) fields.claimType = 'AUTO';
    if (text.toLowerCase().includes('residencial')) fields.claimType = 'RESIDENCIAL';
    
    return fields;
  }

  private extractFromJsonData(data: any): Record<string, any> {
    const fields: Record<string, any> = {};
    
    // Common JSON fields mapping
    if (data.nome || data.name) fields.insuredName = data.nome || data.name;
    if (data.cpf) fields.cpf = data.cpf;
    if (data.valor || data.value || data.amount) fields.claimValue = data.valor || data.value || data.amount;
    if (data.apolice || data.policy) fields.policyNumber = data.apolice || data.policy;
    if (data.data || data.date) fields.eventDate = data.data || data.date;
    if (data.tipo || data.type) fields.claimType = data.tipo || data.type;
    
    return fields;
  }

  private extractFromFilename(filename: string): Record<string, any> {
    const fields: Record<string, any> = {};
    
    const lowerName = filename.toLowerCase();
    
    // Document type from filename
    if (lowerName.includes('laudo')) fields.documentType = 'Laudo Médico';
    if (lowerName.includes('orcamento')) fields.documentType = 'Orçamento';
    if (lowerName.includes('nota')) fields.documentType = 'Nota Fiscal';
    if (lowerName.includes('comprovante')) fields.documentType = 'Comprovante';
    if (lowerName.includes('boletim')) fields.documentType = 'Boletim de Ocorrência';
    if (lowerName.includes('foto')) fields.documentType = 'Fotografia';
    
    // Policy number from filename
    const policyMatch = filename.match(/([A-Z]{3,4}-?\d{6,})/i);
    if (policyMatch) fields.policyNumber = policyMatch[1];
    
    return fields;
  }

  async processBatch(files: File[]): Promise<ExtractedFileData[]> {
    const results = await Promise.all(
      files.map(file => this.processFile(file))
    );
    
    return results;
  }
}

export const fileProcessingService = new FileProcessingService();
export type { ExtractedFileData };