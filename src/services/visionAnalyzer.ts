import { openaiService } from './openaiService';

interface VisionAnalysisResult {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
  summary: string;
  isInsuranceDocument: boolean;
}

class VisionAnalyzer {
  async analyzeDocument(imageFile: File): Promise<VisionAnalysisResult> {
    try {
      console.log('Starting GPT-4 Vision analysis...');
      
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
        return parsedResult;
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

  // Combine OCR and Vision results for better accuracy
  combineAnalysisResults(ocrData: Record<string, any>, visionData: VisionAnalysisResult): Record<string, any> {
    const combined = { ...visionData.extractedData };
    
    // Prefer OCR for specific data types that are better extracted via pattern matching
    if (ocrData.cpf && !combined.cpf) combined.cpf = ocrData.cpf;
    if (ocrData.cnpj && !combined.cnpj) combined.cnpj = ocrData.cnpj;
    if (ocrData.email && !combined.email) combined.email = ocrData.email;
    if (ocrData.telefone && !combined.telefone) combined.telefone = ocrData.telefone;
    if (ocrData.policyNumber && !combined.policyNumber) combined.policyNumber = ocrData.policyNumber;
    
    // Prefer Vision for contextual data
    if (!ocrData.insuredName && combined.insuredName) combined.insuredName = visionData.extractedData.insuredName;
    if (!ocrData.claimType && combined.claimType) combined.claimType = visionData.extractedData.claimType;
    
    return combined;
  }
}

export const visionAnalyzer = new VisionAnalyzer();
export type { VisionAnalysisResult };