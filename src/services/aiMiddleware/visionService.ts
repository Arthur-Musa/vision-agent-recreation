/**
 * Serviço de Visão Computacional - OCR, classificação de imagens e detecção de manipulação
 */

export interface VisionRequest {
  type: 'ocr' | 'damage_classification' | 'tampering_detection' | 'document_classification';
  imageData: string; // Base64 ou URL
  options?: {
    language?: string;
    accuracy?: 'fast' | 'accurate';
    extractTables?: boolean;
    detectOrientation?: boolean;
  };
}

export interface VisionResponse {
  type: string;
  confidence: number;
  processingTime: number;
  result: {
    text?: string;
    classification?: {
      category: string;
      subcategory?: string;
      confidence: number;
    };
    damageAssessment?: {
      level: 'minimal' | 'moderate' | 'severe' | 'total_loss';
      estimatedCost?: number;
      affectedAreas: string[];
      repairability: 'repairable' | 'replacement_needed' | 'total_loss';
    };
    tamperingDetection?: {
      isTampered: boolean;
      suspiciousAreas: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        confidence: number;
      }>;
      metadata: {
        hasExif: boolean;
        lastModified?: string;
        compression?: string;
      };
    };
    extractedStructures?: {
      tables?: Array<{
        rows: string[][];
        confidence: number;
      }>;
      forms?: Array<{
        fields: Record<string, string>;
        confidence: number;
      }>;
    };
  };
  errors?: string[];
}

class VisionService {
  private ocrEngines: Map<string, (imageData: string, options?: any) => Promise<string>> = new Map();
  private classificationModels: Map<string, (imageData: string) => Promise<any>> = new Map();

  constructor() {
    this.initializeEngines();
  }

  private initializeEngines() {
    // OCR Engines
    this.ocrEngines.set('tesseract', this.tesseractOCR.bind(this));
    this.ocrEngines.set('easyocr', this.easyOCR.bind(this));
    this.ocrEngines.set('cloud', this.cloudOCR.bind(this));

    // Classification Models
    this.classificationModels.set('damage', this.assessDamage.bind(this));
    this.classificationModels.set('document', this.classifyDocument.bind(this));
  }

  async processVisionRequest(request: VisionRequest): Promise<VisionResponse> {
    const startTime = Date.now();
    
    try {
      let result: any = {};
      
      switch (request.type) {
        case 'ocr':
          result = await this.performOCR(request.imageData, request.options);
          break;
          
        case 'damage_classification':
          result = await this.assessDamage(request.imageData);
          break;
          
        case 'tampering_detection':
          result = await this.detectTampering(request.imageData);
          break;
          
        case 'document_classification':
          result = await this.classifyDocument(request.imageData);
          break;
          
        default:
          throw new Error(`Tipo de processamento não suportado: ${request.type}`);
      }

      return {
        type: request.type,
        confidence: result.confidence || 0.8,
        processingTime: Date.now() - startTime,
        result,
        errors: result.errors
      };
    } catch (error) {
      return {
        type: request.type,
        confidence: 0,
        processingTime: Date.now() - startTime,
        result: {},
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }

  private async performOCR(imageData: string, options?: any): Promise<any> {
    const engine = options?.engine || 'tesseract';
    const ocrFunction = this.ocrEngines.get(engine);
    
    if (!ocrFunction) {
      throw new Error(`Engine OCR não encontrada: ${engine}`);
    }

    const text = await ocrFunction(imageData, options);
    
    // Pós-processamento
    const cleanedText = this.cleanOCRText(text);
    const extractedStructures = await this.extractStructures(cleanedText, imageData);
    
    return {
      text: cleanedText,
      confidence: this.calculateOCRConfidence(text),
      extractedStructures
    };
  }

  private async tesseractOCR(imageData: string, options?: any): Promise<string> {
    // Simulação do Tesseract OCR
    await this.delay(2000 + Math.random() * 3000);
    
    // Simular diferentes tipos de documentos
    const documentTypes = [
      this.generateRGText(),
      this.generateCPFText(),
      this.generateLaudoText(),
      this.generateOrcamentoText(),
      this.generateNotaFiscalText()
    ];
    
    return documentTypes[Math.floor(Math.random() * documentTypes.length)];
  }

  private async easyOCR(imageData: string, options?: any): Promise<string> {
    // Simulação do EasyOCR (geralmente melhor para textos em múltiplas linguagens)
    await this.delay(1500 + Math.random() * 2000);
    
    return this.tesseractOCR(imageData, options);
  }

  private async cloudOCR(imageData: string, options?: any): Promise<string> {
    // Simulação de OCR em nuvem (Google Vision, Azure, AWS)
    await this.delay(1000 + Math.random() * 1500);
    
    return this.tesseractOCR(imageData, options);
  }

  private async assessDamage(imageData: string): Promise<any> {
    await this.delay(3000 + Math.random() * 2000);
    
    const damageTypes = ['minimal', 'moderate', 'severe', 'total_loss'] as const;
    const level = damageTypes[Math.floor(Math.random() * damageTypes.length)];
    
    const costMultipliers = {
      minimal: { min: 500, max: 2000 },
      moderate: { min: 2000, max: 15000 },
      severe: { min: 15000, max: 50000 },
      total_loss: { min: 50000, max: 200000 }
    };
    
    const costRange = costMultipliers[level];
    const estimatedCost = Math.floor(
      Math.random() * (costRange.max - costRange.min) + costRange.min
    );
    
    return {
      damageAssessment: {
        level,
        estimatedCost,
        affectedAreas: this.generateAffectedAreas(level),
        repairability: level === 'total_loss' ? 'total_loss' : 
                      level === 'severe' ? 'replacement_needed' : 'repairable'
      },
      confidence: 0.75 + Math.random() * 0.2
    };
  }

  private async detectTampering(imageData: string): Promise<any> {
    await this.delay(2500 + Math.random() * 2000);
    
    const isTampered = Math.random() > 0.7; // 30% chance de ser alterada
    
    return {
      tamperingDetection: {
        isTampered,
        suspiciousAreas: isTampered ? [
          {
            x: Math.floor(Math.random() * 500),
            y: Math.floor(Math.random() * 500),
            width: 100 + Math.floor(Math.random() * 200),
            height: 50 + Math.floor(Math.random() * 100),
            confidence: 0.6 + Math.random() * 0.3
          }
        ] : [],
        metadata: {
          hasExif: Math.random() > 0.5,
          lastModified: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
          compression: Math.random() > 0.5 ? 'JPEG' : 'PNG'
        }
      },
      confidence: 0.8 + Math.random() * 0.15
    };
  }

  private async classifyDocument(imageData: string): Promise<any> {
    await this.delay(1500 + Math.random() * 1000);
    
    const documentTypes = [
      { category: 'identidade', subcategory: 'RG' },
      { category: 'identidade', subcategory: 'CPF' },
      { category: 'identidade', subcategory: 'CNH' },
      { category: 'laudo', subcategory: 'tecnico' },
      { category: 'orcamento', subcategory: 'reparo' },
      { category: 'nota_fiscal', subcategory: 'servicos' },
      { category: 'apolice', subcategory: 'auto' },
      { category: 'sinistro', subcategory: 'boletim_ocorrencia' }
    ];
    
    const selected = documentTypes[Math.floor(Math.random() * documentTypes.length)];
    
    return {
      classification: {
        ...selected,
        confidence: 0.7 + Math.random() * 0.25
      },
      confidence: 0.8 + Math.random() * 0.15
    };
  }

  private cleanOCRText(text: string): string {
    return text
      .replace(/[^\w\s\-.,;:()\[\]{}]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  private calculateOCRConfidence(text: string): number {
    let confidence = 0.6;
    
    // Boost por palavras-chave conhecidas
    const keywords = ['CPF', 'RG', 'Nome', 'Data', 'Valor', 'Sinistro', 'Apólice'];
    const foundKeywords = keywords.filter(kw => text.includes(kw));
    confidence += foundKeywords.length * 0.05;
    
    // Boost por padrões estruturados
    if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(text)) confidence += 0.1; // CPF
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(text)) confidence += 0.05; // Data
    if (/R\$\s*[\d.,]+/.test(text)) confidence += 0.05; // Valor monetário
    
    return Math.min(confidence, 0.95);
  }

  private async extractStructures(text: string, imageData: string): Promise<any> {
    // Simular extração de estruturas (tabelas, formulários)
    const structures: any = {};
    
    // Detectar possíveis tabelas
    if (text.includes('|') || /\t/.test(text)) {
      structures.tables = [
        {
          rows: [
            ['Campo', 'Valor'],
            ['Nome', 'João da Silva'],
            ['CPF', '123.456.789-10'],
            ['Valor', 'R$ 15.000,00']
          ],
          confidence: 0.8
        }
      ];
    }
    
    // Detectar formulários
    const formFields: Record<string, string> = {};
    
    // Padrões comuns de formulário
    const patterns = [
      { pattern: /Nome[:\s]*([^\n\r]+)/i, field: 'nome' },
      { pattern: /CPF[:\s]*(\d{3}\.\d{3}\.\d{3}-\d{2})/i, field: 'cpf' },
      { pattern: /RG[:\s]*([^\n\r]+)/i, field: 'rg' },
      { pattern: /Data[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i, field: 'data' },
      { pattern: /Valor[:\s]*(R\$\s*[\d.,]+)/i, field: 'valor' }
    ];
    
    patterns.forEach(({ pattern, field }) => {
      const match = text.match(pattern);
      if (match) {
        formFields[field] = match[1].trim();
      }
    });
    
    if (Object.keys(formFields).length > 0) {
      structures.forms = [
        {
          fields: formFields,
          confidence: 0.85
        }
      ];
    }
    
    return structures;
  }

  private generateAffectedAreas(level: string): string[] {
    const areas = {
      minimal: ['Para-choque dianteiro', 'Farol direito'],
      moderate: ['Porta direita', 'Para-choque', 'Retrovisor', 'Painel lateral'],
      severe: ['Motor', 'Chassi', 'Suspensão', 'Sistema elétrico', 'Carroceria'],
      total_loss: ['Estrutura completa', 'Motor', 'Chassi', 'Sistema elétrico', 'Interior']
    };
    
    return areas[level as keyof typeof areas] || areas.minimal;
  }

  private generateRGText(): string {
    return `
REPÚBLICA FEDERATIVA DO BRASIL
CARTEIRA DE IDENTIDADE
Nome: JOÃO DA SILVA SANTOS
Filiação: MARIA SANTOS / JOSÉ SILVA
Data Nascimento: 15/08/1985
Natural de: SÃO PAULO - SP
RG: 12.345.678-X
Data Expedição: 10/05/2010
`;
  }

  private generateCPFText(): string {
    return `
CADASTRO DE PESSOAS FÍSICAS
Nome: MARIA OLIVEIRA COSTA
CPF: 987.654.321-00
Data Nascimento: 22/03/1990
Situação: REGULAR
Emissão: 15/01/2020
`;
  }

  private generateLaudoText(): string {
    return `
LAUDO TÉCNICO DE AVALIAÇÃO
Veículo: HONDA CIVIC 2018
Placa: ABC-1234
Chassi: 9BGRD48S0MG123456
Data Vistoria: 20/11/2024
Danos Identificados:
- Dano frontal moderado
- Substituição para-choque
- Reparo farol direito
Valor Estimado: R$ 8.500,00
`;
  }

  private generateOrcamentoText(): string {
    return `
ORÇAMENTO DE REPARO
Cliente: AUTO CENTER SILVA
Data: 18/11/2024
Serviços:
- Troca para-choque dianteiro: R$ 1.200,00
- Reparo farol: R$ 450,00
- Pintura: R$ 800,00
- Mão de obra: R$ 600,00
Total: R$ 3.050,00
Validade: 30 dias
`;
  }

  private generateNotaFiscalText(): string {
    return `
NOTA FISCAL DE SERVIÇOS ELETRÔNICA
Nº 12345
Prestador: OFICINA MECÂNICA LTDA
CNPJ: 12.345.678/0001-90
Tomador: JOÃO DA SILVA
Descrição: Serviços de reparo automotivo
Valor: R$ 2.500,00
Data: 19/11/2024
`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos públicos para casos específicos
  async extractTextFromDocument(imageData: string, options?: any): Promise<string> {
    const response = await this.processVisionRequest({
      type: 'ocr',
      imageData,
      options
    });
    return response.result.text || '';
  }

  async classifyDamage(imageData: string): Promise<any> {
    const response = await this.processVisionRequest({
      type: 'damage_classification',
      imageData
    });
    return response.result.damageAssessment;
  }

  async detectImageTampering(imageData: string): Promise<any> {
    const response = await this.processVisionRequest({
      type: 'tampering_detection',
      imageData
    });
    return response.result.tamperingDetection;
  }

  async identifyDocumentType(imageData: string): Promise<any> {
    const response = await this.processVisionRequest({
      type: 'document_classification',
      imageData
    });
    return response.result.classification;
  }
}

export const visionService = new VisionService();