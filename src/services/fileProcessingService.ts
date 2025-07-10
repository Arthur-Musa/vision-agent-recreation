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
    
    // Dados Pessoais
    const cpfMatch = text.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
    if (cpfMatch) fields.cpf = cpfMatch[0];
    
    const cnpjMatch = text.match(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/);
    if (cnpjMatch) fields.cnpj = cnpjMatch[0];
    
    const nameMatch = text.match(/(?:segurado|cliente|nome|proponente)[:\s]+([A-ZÀ-ÿ\s]{2,50})/i);
    if (nameMatch) fields.insuredName = nameMatch[1].trim();
    
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) fields.email = emailMatch[0];
    
    const phoneMatch = text.match(/\(?(\d{2})\)?\s?(\d{4,5})-?(\d{4})/);
    if (phoneMatch) fields.telefone = phoneMatch[0];
    
    const addressMatch = text.match(/(?:endereço|rua|av\.|avenida)[:\s]+([^,\n]{5,100})/i);
    if (addressMatch) fields.endereco = addressMatch[1].trim();
    
    const birthMatch = text.match(/(?:nascimento|nasc\.|data de nascimento)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
    if (birthMatch) fields.dataNascimento = `${birthMatch[3]}-${birthMatch[2].padStart(2, '0')}-${birthMatch[1].padStart(2, '0')}`;
    
    // Dados da Apólice
    const policyMatch = text.match(/(?:apólice|política|policy|número)[:\s#]*([A-Z0-9\-]{6,20})/i);
    if (policyMatch) fields.policyNumber = policyMatch[1];
    
    const vigenciaInicioMatch = text.match(/(?:vigência|início|inicio)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
    if (vigenciaInicioMatch) fields.vigenciaInicio = `${vigenciaInicioMatch[3]}-${vigenciaInicioMatch[2].padStart(2, '0')}-${vigenciaInicioMatch[1].padStart(2, '0')}`;
    
    const vigenciaFimMatch = text.match(/(?:vencimento|fim|término)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
    if (vigenciaFimMatch) fields.vigenciaFim = `${vigenciaFimMatch[3]}-${vigenciaFimMatch[2].padStart(2, '0')}-${vigenciaFimMatch[1].padStart(2, '0')}`;
    
    // Valores e Coberturas
    const premiumMatch = text.match(/(?:prêmio|premium|valor do seguro)[:\s]*R\$\s*([0-9.,]+)/i);
    if (premiumMatch) {
      const valueStr = premiumMatch[1].replace(/[.,]/g, '');
      fields.premioTotal = parseInt(valueStr) || 0;
    }
    
    // Coberturas APE
    const apeDeathMatch = text.match(/(?:morte acidental|óbito)[:\s]*R\$\s*([0-9.,]+)/i);
    if (apeDeathMatch) {
      const valueStr = apeDeathMatch[1].replace(/[.,]/g, '');
      fields.coberturaObitoAPE = parseInt(valueStr) || 0;
    }
    
    const apeDisabilityMatch = text.match(/(?:invalidez|incapacidade)[:\s]*R\$\s*([0-9.,]+)/i);
    if (apeDisabilityMatch) {
      const valueStr = apeDisabilityMatch[1].replace(/[.,]/g, '');
      fields.coberturaInvalidezAPE = parseInt(valueStr) || 0;
    }
    
    const medicalMatch = text.match(/(?:despesas médicas|médico)[:\s]*R\$\s*([0-9.,]+)/i);
    if (medicalMatch) {
      const valueStr = medicalMatch[1].replace(/[.,]/g, '');
      fields.coberturaDespesasMedicas = parseInt(valueStr) || 0;
    }
    
    const incomeMatch = text.match(/(?:perda de renda|renda|diária)[:\s]*R\$\s*([0-9.,]+)/i);
    if (incomeMatch) {
      const valueStr = incomeMatch[1].replace(/[.,]/g, '');
      fields.coberturaPerdaRenda = parseInt(valueStr) || 0;
    }
    
    // Coberturas BAG
    const bagMatch = text.match(/(?:bagagem|pertences)[:\s]*R\$\s*([0-9.,]+)/i);
    if (bagMatch) {
      const valueStr = bagMatch[1].replace(/[.,]/g, '');
      fields.coberturaBagagem = parseInt(valueStr) || 0;
    }
    
    // Beneficiários
    const beneficiaryMatch = text.match(/(?:beneficiário|beneficiária)[:\s]+([A-ZÀ-ÿ\s]{2,50})/i);
    if (beneficiaryMatch) fields.beneficiario = beneficiaryMatch[1].trim();
    
    // Tipo de Sinistro/Seguro
    if (text.toLowerCase().includes('acidente') || text.toLowerCase().includes('ape')) fields.claimType = 'APE';
    if (text.toLowerCase().includes('bagagem') || text.toLowerCase().includes('bag')) fields.claimType = 'BAG';  
    if (text.toLowerCase().includes('auto')) fields.claimType = 'AUTO';
    if (text.toLowerCase().includes('residencial')) fields.claimType = 'RESIDENCIAL';
    if (text.toLowerCase().includes('viagem')) fields.claimType = 'VIAGEM';
    
    // Informações Adicionais
    const professionMatch = text.match(/(?:profissão|ocupação)[:\s]+([A-ZÀ-ÿ\s]{2,30})/i);
    if (professionMatch) fields.profissao = professionMatch[1].trim();
    
    const sexMatch = text.match(/(?:sexo|gênero)[:\s]+(masculino|feminino|m|f)/i);
    if (sexMatch) fields.sexo = sexMatch[1].toLowerCase() === 'm' || sexMatch[1].toLowerCase() === 'masculino' ? 'M' : 'F';
    
    const civilStatusMatch = text.match(/(?:estado civil)[:\s]+(solteiro|casado|divorciado|viúvo)/i);
    if (civilStatusMatch) fields.estadoCivil = civilStatusMatch[1];
    
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