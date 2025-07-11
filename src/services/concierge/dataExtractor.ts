/**
 * Data Extraction Service - Advanced NLP patterns for insurance data
 */

export class DataExtractorService {
  
  async extractDataFromQuery(query: string): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    
    // Enhanced monetary value extraction
    const moneyPatterns = [
      /R\$\s*([\d.,]+)/g,
      /([Vv]alor|[Qq]uantia|[Mm]ontante)[:\s]*(R\$)?\s*([\d.,]+)/g,
      /([\d.,]+)\s*reais/gi
    ];
    
    for (const pattern of moneyPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        const values = matches.map(match => {
          const numStr = match.replace(/[^\d.,]/g, '');
          return parseFloat(numStr.replace(',', '.'));
        }).filter(v => !isNaN(v));
        
        if (values.length > 0) {
          data.valor_estimado = Math.max(...values);
        }
      }
    }
    
    // Enhanced date extraction
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
      /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi,
      /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/gi
    ];
    
    for (const pattern of datePatterns) {
      const match = query.match(pattern);
      if (match) {
        data.data_mencionada = match[0];
        break;
      }
    }
    
    // Enhanced document type detection
    const documentTypes = {
      'rg': ['rg', 'registro geral', 'carteira de identidade'],
      'cpf': ['cpf', 'cadastro de pessoa física'],
      'cnh': ['cnh', 'carteira nacional', 'habilitação'],
      'laudo': ['laudo', 'parecer técnico', 'avaliação'],
      'orçamento': ['orçamento', 'cotação', 'estimativa'],
      'nota_fiscal': ['nota fiscal', 'nf', 'cupom fiscal'],
      'apolice': ['apólice', 'contrato de seguro', 'política'],
      'sinistro': ['boletim de ocorrência', 'bo', 'registro de sinistro']
    };
    
    const mentionedDocs: string[] = [];
    Object.entries(documentTypes).forEach(([key, terms]) => {
      if (terms.some(term => query.toLowerCase().includes(term))) {
        mentionedDocs.push(key);
      }
    });
    
    if (mentionedDocs.length > 0) {
      data.documentos_mencionados = mentionedDocs;
    }
    
    // Enhanced claim type detection
    const claimTypes = {
      'automotivo': ['carro', 'veículo', 'automóvel', 'moto', 'acidente de trânsito'],
      'residencial': ['casa', 'residência', 'imóvel', 'apartamento', 'incêndio', 'roubo'],
      'vida': ['vida', 'óbito', 'morte', 'invalidez'],
      'saude': ['saúde', 'médico', 'hospital', 'tratamento', 'cirurgia'],
      'viagem': ['viagem', 'bagagem', 'cancelamento', 'internacional']
    };
    
    Object.entries(claimTypes).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
        data.tipo_sinistro = type;
      }
    });
    
    // Enhanced urgency indicators
    const urgencyKeywords = ['urgente', 'emergência', 'crítico', 'imediato', 'prioritário'];
    if (urgencyKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      data.urgencia_detectada = true;
    }
    
    // Compliance risk indicators
    const complianceKeywords = ['susep', 'regulamentação', 'compliance', 'legal', 'judicial'];
    if (complianceKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      data.risco_compliance = true;
    }
    
    // Extract policy numbers
    const policyPattern = /[Pp]ol[íi]cia[\s\-]?(\w+)|[Nn]úmero[\s:]*([\w\-]+)/g;
    const policyMatch = query.match(policyPattern);
    if (policyMatch) {
      data.numero_apolice = policyMatch[0];
    }
    
    return data;
  }
}

export const dataExtractor = new DataExtractorService();