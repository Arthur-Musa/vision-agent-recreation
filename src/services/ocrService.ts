import { createWorker, PSM } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('por', 1, {
        logger: m => console.log(m),
        workerPath: '/tesseract-worker.min.js'
      });
      
      await this.worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöøùúûüý0123456789.,:-/()[]@R$ ',
      });

      this.isInitialized = true;
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  async extractText(imageFile: File | Blob): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      console.log('Starting OCR text extraction...');
      const result = await this.worker.recognize(imageFile);
      
      const ocrResult: OCRResult = {
        text: result.data.text,
        confidence: result.data.confidence
      };

      console.log(`OCR completed with confidence: ${result.data.confidence}%`);
      return ocrResult;
    } catch (error) {
      console.error('OCR text extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromCanvas(canvas: HTMLCanvasElement): Promise<OCRResult> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        
        try {
          const result = await this.extractText(blob);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 'image/png');
    });
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('OCR Worker terminated');
    }
  }

  // Extract structured data from OCR text for insurance documents
  extractInsuranceDataFromOCR(ocrText: string): Record<string, any> {
    const fields: Record<string, any> = {};
    
    // CPF/CNPJ extraction with better patterns
    const cpfPattern = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
    const cnpjPattern = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;
    
    const cpfMatches = ocrText.match(cpfPattern);
    const cnpjMatches = ocrText.match(cnpjPattern);
    
    if (cpfMatches) fields.cpf = cpfMatches[0];
    if (cnpjMatches) fields.cnpj = cnpjMatches[0];

    // Enhanced name extraction
    const namePatterns = [
      /(?:segurado|cliente|nome|proponente)[\s:]+([A-ZÀ-ÿ][A-ZÀ-ÿ\s]{2,50})/i,
      /^([A-ZÀ-ÿ][A-ZÀ-ÿ\s]{10,50})$/m
    ];
    
    for (const pattern of namePatterns) {
      const match = ocrText.match(pattern);
      if (match && !fields.insuredName) {
        fields.insuredName = match[1].trim();
        break;
      }
    }

    // Policy number extraction
    const policyPatterns = [
      /(?:apólice|política|policy|número)[\s:#]*([A-Z0-9\-]{6,20})/i,
      /([A-Z]{2,4}-?\d{6,12})/g
    ];
    
    for (const pattern of policyPatterns) {
      const match = ocrText.match(pattern);
      if (match && !fields.policyNumber) {
        fields.policyNumber = match[1];
        break;
      }
    }

    // Currency values extraction (R$)
    const currencyPattern = /R\$\s*([0-9.,]+)/gi;
    const currencyMatches = [...ocrText.matchAll(currencyPattern)];
    
    if (currencyMatches.length > 0) {
      // First value might be premium
      const premiumValue = currencyMatches[0][1].replace(/[.,]/g, '');
      fields.premioTotal = parseInt(premiumValue) || 0;
      
      // Other values might be coverage amounts
      currencyMatches.slice(1).forEach((match, index) => {
        const value = parseInt(match[1].replace(/[.,]/g, '')) || 0;
        fields[`cobertura${index + 1}`] = value;
      });
    }

    // Date extraction
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
    const dateMatches = [...ocrText.matchAll(datePattern)];
    
    dateMatches.forEach((match, index) => {
      const formattedDate = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
      if (index === 0) fields.vigenciaInicio = formattedDate;
      if (index === 1) fields.vigenciaFim = formattedDate;
    });

    // Email and phone extraction
    const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const phonePattern = /\(?(\d{2})\)?\s?(\d{4,5})-?(\d{4})/g;
    
    const emailMatch = ocrText.match(emailPattern);
    const phoneMatch = ocrText.match(phonePattern);
    
    if (emailMatch) fields.email = emailMatch[0];
    if (phoneMatch) fields.telefone = phoneMatch[0];

    return fields;
  }
}

export const ocrService = new OCRService();
export type { OCRResult };
