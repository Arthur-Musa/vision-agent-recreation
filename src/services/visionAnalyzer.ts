import { openaiService } from './openaiService';

interface VisionAnalysisResult {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
  summary: string;
  isInsuranceDocument: boolean;
  processingTime?: number;
  cacheHit?: boolean;
  qualityScore?: number;
}

interface CacheEntry {
  key: string;
  result: VisionAnalysisResult;
  timestamp: number;
  fileHash: string;
}

class VisionAnalyzer {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 1000;
  
  async analyzeDocument(imageFile: File): Promise<VisionAnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log('Starting optimized document analysis...');
      
      // Generate file hash for caching
      const fileHash = await this.generateFileHash(imageFile);
      const cacheKey = `doc_${fileHash}`;
      
      // Check cache first
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        console.log('Cache hit - returning cached result');
        return {
          ...cachedResult,
          cacheHit: true,
          processingTime: Date.now() - startTime
        };
      }
      
      // Convert file to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `Analise este documento de seguro em português brasileiro e extraia as seguintes informações:

1. Tipo de documento (apólice, sinistro, laudo médico, orçamento, etc.)
2. Dados pessoais (nome, CPF/CNPJ, endereço, telefone, email)
3. Dados da apólice (número, vigência, prêmio)
4. Coberturas (valores, tipos APE/BAG/AUTO)
5. Beneficiários
6. Informações do sinistro (se aplicável)

Retorne APENAS um JSON válido com a estrutura:
{
  "documentType": "tipo do documento",
  "isInsuranceDocument": true/false,
  "confidence": 0-100,
  "extractedData": {
    "cpf": "apenas números se encontrado",
    "cnpj": "apenas números se encontrado", 
    "insuredName": "nome completo",
    "policyNumber": "número da apólice",
    "vigenciaInicio": "YYYY-MM-DD",
    "vigenciaFim": "YYYY-MM-DD",
    "premioTotal": valor_numérico,
    "email": "email@exemplo.com",
    "telefone": "telefone com DDD",
    "endereco": "endereço completo",
    "beneficiario": "nome do beneficiário",
    "claimType": "APE|BAG|AUTO|RESIDENCIAL|VIAGEM",
    "coberturaObitoAPE": valor_numérico,
    "coberturaInvalidezAPE": valor_numérico,
    "coberturaDespesasMedicas": valor_numérico,
    "coberturaBagagem": valor_numérico,
    "dataNascimento": "YYYY-MM-DD",
    "profissao": "profissão",
    "sexo": "M|F",
    "estadoCivil": "estado civil"
  },
  "summary": "resumo do documento em português"
}`;

      const result = await openaiService.analyzeImageWithVision(base64Image, prompt);
      
      try {
        const parsedResult = JSON.parse(result);
        console.log('GPT-4 Vision analysis completed successfully');
        
        // Enhance result with additional metrics
        const enhancedResult: VisionAnalysisResult = {
          ...parsedResult,
          processingTime: Date.now() - startTime,
          cacheHit: false,
          qualityScore: this.calculateQualityScore(parsedResult)
        };
        
        // Cache the result
        this.setCache(cacheKey, enhancedResult, fileHash);
        
        return enhancedResult;
      } catch (parseError) {
        console.warn('Failed to parse GPT-4 Vision result as JSON, returning default structure');
        return {
          documentType: 'Documento não identificado',
          extractedData: { summary: result },
          confidence: 50,
          summary: result,
          isInsuranceDocument: false
        };
      }
    } catch (error) {
      console.error('GPT-4 Vision analysis failed:', error);
      throw new Error('Falha na análise de visão do documento');
    }
  }

  async analyzeClaimDocument(imageFile: File): Promise<VisionAnalysisResult> {
    try {
      console.log('Starting claim document analysis...');
      
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `Analise este documento de sinistro de seguro e extraia informações específicas do sinistro:

1. Tipo de sinistro (acidente pessoal, roubo, danos, etc.)
2. Data do sinistro
3. Local do sinistro
4. Valor dos danos/prejuízos
5. Descrição do ocorrido
6. Documentos anexos mencionados
7. Status do sinistro

Retorne APENAS um JSON válido:
{
  "documentType": "Documento de Sinistro",
  "isInsuranceDocument": true,
  "confidence": 0-100,
  "extractedData": {
    "claimNumber": "número do sinistro",
    "claimDate": "YYYY-MM-DD",
    "claimType": "tipo do sinistro",
    "claimLocation": "local do sinistro",
    "claimValue": valor_numérico,
    "claimDescription": "descrição detalhada",
    "claimStatus": "status atual",
    "attachedDocuments": ["lista", "de", "documentos"]
  },
  "summary": "resumo do sinistro em português"
}`;

      const result = await openaiService.analyzeImageWithVision(base64Image, prompt);
      
      try {
        const parsedResult = JSON.parse(result);
        console.log('Claim document analysis completed successfully');
        return parsedResult;
      } catch (parseError) {
        console.warn('Failed to parse claim analysis result, returning default');
        return {
          documentType: 'Documento de Sinistro',
          extractedData: { claimDescription: result },
          confidence: 50,
          summary: result,
          isInsuranceDocument: true
        };
      }
    } catch (error) {
      console.error('Claim document analysis failed:', error);
      throw new Error('Falha na análise do documento de sinistro');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to convert file to base64'));
      reader.readAsDataURL(file);
    });
  }

  // Validate if extracted data looks reasonable
  validateExtractedData(data: Record<string, any>): boolean {
    const hasValidCPF = data.cpf && /^\d{11}$/.test(data.cpf.replace(/\D/g, ''));
    const hasValidCNPJ = data.cnpj && /^\d{14}$/.test(data.cnpj.replace(/\D/g, ''));
    const hasName = data.insuredName && data.insuredName.length > 2;
    const hasPolicy = data.policyNumber && data.policyNumber.length > 4;
    
    return !!(hasValidCPF || hasValidCNPJ || hasName || hasPolicy);
  }

  // Enhanced OCR and Vision combination with smart weighting
  combineAnalysisResults(ocrData: Record<string, any>, visionData: VisionAnalysisResult): Record<string, any> {
    const combined = { ...visionData.extractedData };
    
    // Smart data type preferences with confidence weighting
    const ocrPreferred = ['cpf', 'cnpj', 'telefone', 'email', 'policyNumber', 'cep'];
    const visionPreferred = ['insuredName', 'claimType', 'documentType', 'summary'];
    
    // Apply OCR data for structured fields
    ocrPreferred.forEach(field => {
      if (ocrData[field] && this.validateFieldData(field, ocrData[field])) {
        combined[field] = ocrData[field];
        combined[`${field}_source`] = 'ocr';
        combined[`${field}_confidence`] = this.calculateFieldConfidence(field, ocrData[field]);
      }
    });
    
    // Apply Vision data for contextual fields
    visionPreferred.forEach(field => {
      if (visionData.extractedData[field] && !combined[field]) {
        combined[field] = visionData.extractedData[field];
        combined[`${field}_source`] = 'vision';
        combined[`${field}_confidence`] = visionData.confidence;
      }
    });
    
    // Cross-validation for critical fields
    this.performCrossValidation(combined, ocrData, visionData);
    
    return combined;
  }

  // Cache management methods
  private getFromCache(key: string): VisionAnalysisResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }

  private setCache(key: string, result: VisionAnalysisResult, fileHash: string): void {
    // Clean old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanOldCacheEntries();
    }
    
    this.cache.set(key, {
      key,
      result,
      timestamp: Date.now(),
      fileHash
    });
  }

  private cleanOldCacheEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    });
    
    // If still too large, remove oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.8));
      
      this.cache.clear();
      sortedEntries.forEach(([key, entry]) => {
        this.cache.set(key, entry);
      });
    }
  }

  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private calculateQualityScore(result: any): number {
    let score = 0;
    const totalFields = 15; // Expected number of fields
    
    // Score based on data completeness
    const extractedFields = Object.keys(result.extractedData || {}).length;
    score += (extractedFields / totalFields) * 40;
    
    // Score based on confidence
    score += (result.confidence || 0) * 0.4;
    
    // Score based on document type identification
    if (result.isInsuranceDocument) score += 20;
    
    return Math.min(Math.round(score), 100);
  }

  private validateFieldData(field: string, value: any): boolean {
    if (!value) return false;
    
    switch (field) {
      case 'cpf':
        return /^\d{11}$/.test(value.toString().replace(/\D/g, ''));
      case 'cnpj':
        return /^\d{14}$/.test(value.toString().replace(/\D/g, ''));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'telefone':
        return /^\d{10,11}$/.test(value.toString().replace(/\D/g, ''));
      case 'cep':
        return /^\d{8}$/.test(value.toString().replace(/\D/g, ''));
      default:
        return value.toString().length > 0;
    }
  }

  private calculateFieldConfidence(field: string, value: any): number {
    const isValid = this.validateFieldData(field, value);
    const hasValue = !!value;
    
    if (!hasValue) return 0;
    if (!isValid) return 30;
    
    // Base confidence for valid data
    let confidence = 80;
    
    // Adjust based on field type
    if (['cpf', 'cnpj', 'email'].includes(field)) {
      confidence = 95; // High confidence for validated structured data
    }
    
    return confidence;
  }

  private performCrossValidation(combined: Record<string, any>, ocrData: Record<string, any>, visionData: VisionAnalysisResult): void {
    // Cross-validate CPF/CNPJ consistency
    if (combined.cpf && combined.cnpj) {
      console.warn('Both CPF and CNPJ found - flagging for manual review');
      combined.validation_flags = combined.validation_flags || [];
      combined.validation_flags.push('cpf_cnpj_conflict');
    }
    
    // Validate document type consistency
    if (ocrData.documentType && visionData.extractedData.documentType) {
      const ocrType = ocrData.documentType.toLowerCase();
      const visionType = visionData.extractedData.documentType.toLowerCase();
      
      if (ocrType !== visionType) {
        combined.document_type_conflict = {
          ocr: ocrData.documentType,
          vision: visionData.extractedData.documentType,
          recommended: visionData.confidence > 80 ? visionData.extractedData.documentType : ocrData.documentType
        };
      }
    }
  }
}

export const visionAnalyzer = new VisionAnalyzer();
export type { VisionAnalysisResult };