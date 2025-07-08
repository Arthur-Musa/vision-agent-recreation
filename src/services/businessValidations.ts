/**
 * Validações de Negócio Específicas do Mercado Brasileiro de Seguros
 * Baseado na documentação de fluxos e processos da Plataforma Olga
 */

import { ProcessingResult } from '@/types/workflow';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion: string;
}

export interface PolicyData {
  numeroApolice: string;
  segurado: string;
  cpfCnpj: string;
  vigencia: {
    inicio: string;
    fim: string;
  };
  coberturas: Array<{
    tipo: string;
    limite: number;
    franquia: number;
    premio: number;
  }>;
  premioTotal: number;
  tipoSeguro: 'auto' | 'residencial' | 'empresarial' | 'vida';
}

export interface ClaimData {
  numeroSinistro: string;
  numeroApolice: string;
  dataOcorrencia: string;
  localOcorrencia: string;
  tipoSinistro: string;
  valorEstimado: number;
  descricao: string;
  segurado: string;
}

class BusinessValidationService {
  
  /**
   * Valida dados de apólice conforme regulamentações brasileiras
   */
  validatePolicy(data: PolicyData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validação de vigência
    const vigenciaValidation = this.validatePolicyTerm(data.vigencia);
    errors.push(...vigenciaValidation.errors);
    warnings.push(...vigenciaValidation.warnings);

    // Validação de CPF/CNPJ
    const documentValidation = this.validateDocument(data.cpfCnpj);
    errors.push(...documentValidation.errors);

    // Validação de coberturas por tipo de seguro
    const coverageValidation = this.validateCoverages(data.coberturas, data.tipoSeguro);
    errors.push(...coverageValidation.errors);
    warnings.push(...coverageValidation.warnings);
    recommendations.push(...coverageValidation.recommendations);

    // Validação de prêmios
    const premiumValidation = this.validatePremiums(data.coberturas, data.premioTotal);
    errors.push(...premiumValidation.errors);
    warnings.push(...premiumValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Valida dados de sinistro conforme regulamentações brasileiras
   */
  validateClaim(claimData: ClaimData, policyData?: PolicyData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validação temporal
    const dateValidation = this.validateClaimDate(claimData.dataOcorrencia);
    errors.push(...dateValidation.errors);
    warnings.push(...dateValidation.warnings);

    // Validação de cobertura (se apólice fornecida)
    if (policyData) {
      const coverageValidation = this.validateClaimCoverage(claimData, policyData);
      errors.push(...coverageValidation.errors);
      warnings.push(...coverageValidation.warnings);
      recommendations.push(...coverageValidation.recommendations);
    }

    // Validação de valor estimado
    const valueValidation = this.validateClaimValue(claimData.valorEstimado, policyData);
    warnings.push(...valueValidation.warnings);
    recommendations.push(...valueValidation.recommendations);

    // Validação de prazo de comunicação
    const notificationValidation = this.validateNotificationPeriod(claimData.dataOcorrencia, claimData.tipoSinistro);
    warnings.push(...notificationValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  private validatePolicyTerm(vigencia: { inicio: string; fim: string }) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const dataInicio = new Date(vigencia.inicio);
    const dataFim = new Date(vigencia.fim);
    const hoje = new Date();

    // Data início deve ser anterior à data fim
    if (dataInicio >= dataFim) {
      errors.push({
        field: 'vigencia',
        code: 'INVALID_TERM_DATES',
        message: 'Data de início deve ser anterior à data fim',
        severity: 'critical'
      });
    }

    // Vigência máxima de 5 anos (regulamentação SUSEP)
    const maxVigenciaDias = 5 * 365;
    const vigenciaDias = (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24);

    if (vigenciaDias > maxVigenciaDias) {
      errors.push({
        field: 'vigencia',
        code: 'TERM_EXCEEDS_LIMIT',
        message: `Vigência excede o máximo permitido de ${maxVigenciaDias} dias`,
        severity: 'high'
      });
    }

    // Aviso se vigência vence em menos de 30 dias
    const diasParaVencimento = (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
    if (diasParaVencimento <= 30 && diasParaVencimento > 0) {
      warnings.push({
        field: 'vigencia',
        code: 'TERM_EXPIRING_SOON',
        message: `Apólice vence em ${Math.round(diasParaVencimento)} dias`,
        suggestion: 'Considerar processo de renovação'
      });
    }

    return { errors, warnings };
  }

  private validateDocument(document: string) {
    const errors: ValidationError[] = [];
    
    // Remove formatação
    const cleanDoc = document.replace(/[^\d]/g, '');

    if (cleanDoc.length === 11) {
      // Validação CPF
      if (!this.isValidCPF(cleanDoc)) {
        errors.push({
          field: 'cpfCnpj',
          code: 'INVALID_CPF',
          message: 'CPF inválido',
          severity: 'high'
        });
      }
    } else if (cleanDoc.length === 14) {
      // Validação CNPJ
      if (!this.isValidCNPJ(cleanDoc)) {
        errors.push({
          field: 'cpfCnpj',
          code: 'INVALID_CNPJ',
          message: 'CNPJ inválido',
          severity: 'high'
        });
      }
    } else {
      errors.push({
        field: 'cpfCnpj',
        code: 'INVALID_DOCUMENT_FORMAT',
        message: 'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)',
        severity: 'high'
      });
    }

    return { errors };
  }

  private validateCoverages(coberturas: PolicyData['coberturas'], tipoSeguro: string) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validações específicas por tipo de seguro
    if (tipoSeguro === 'auto') {
      // Cobertura de danos materiais a terceiros é obrigatória
      const temRCFDM = coberturas.some(c => c.tipo.toLowerCase().includes('danos_materiais_terceiros'));
      if (!temRCFDM) {
        errors.push({
          field: 'coberturas',
          code: 'MISSING_MANDATORY_COVERAGE',
          message: 'Cobertura de danos materiais a terceiros é obrigatória',
          severity: 'critical'
        });
      }

      // Recomendação para APP
      const temAPP = coberturas.some(c => c.tipo.toLowerCase().includes('app'));
      if (!temAPP) {
        recommendations.push('Considerar incluir cobertura de Acidentes Pessoais de Passageiros (APP)');
      }

      // Recomendação para assistência 24h
      const temAssistencia = coberturas.some(c => c.tipo.toLowerCase().includes('assistencia'));
      if (!temAssistencia) {
        recommendations.push('Incluir assistência 24h (recomendado para estradas brasileiras)');
      }
    }

    if (tipoSeguro === 'residencial') {
      // Coberturas básicas obrigatórias
      const coberturasBasicas = ['incendio', 'explosao', 'queda_raio', 'vendaval'];
      const coberturasPresentes = coberturas.map(c => c.tipo.toLowerCase());
      
      coberturasBasicas.forEach(cobertura => {
        if (!coberturasPresentes.some(c => c.includes(cobertura))) {
          warnings.push({
            field: 'coberturas',
            code: 'MISSING_BASIC_COVERAGE',
            message: `Cobertura básica de ${cobertura} não encontrada`,
            suggestion: 'Verificar se todas as coberturas básicas estão incluídas'
          });
        }
      });

      // Recomendação para alagamento em regiões metropolitanas
      const temAlagamento = coberturas.some(c => c.tipo.toLowerCase().includes('alagamento'));
      if (!temAlagamento) {
        recommendations.push('Considerar cobertura contra alagamento (recomendado para regiões metropolitanas)');
      }
    }

    return { errors, warnings, recommendations };
  }

  private validatePremiums(coberturas: PolicyData['coberturas'], premioTotal: number) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Soma dos prêmios das coberturas deve bater com o total
    const somaCoberturasç = coberturas.reduce((total, cobertura) => total + cobertura.premio, 0);
    const diferenca = Math.abs(premioTotal - somaCoberturasç);
    const tolerancia = premioTotal * 0.01; // 1% de tolerância

    if (diferenca > tolerancia) {
      errors.push({
        field: 'premioTotal',
        code: 'PREMIUM_MISMATCH',
        message: `Divergência entre soma das coberturas (R$ ${somaCoberturasç.toFixed(2)}) e prêmio total (R$ ${premioTotal.toFixed(2)})`,
        severity: 'medium'
      });
    }

    return { errors, warnings };
  }

  private validateClaimDate(dataOcorrencia: string) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const dataEvento = new Date(dataOcorrencia);
    const hoje = new Date();

    // Data não pode ser futura
    if (dataEvento > hoje) {
      errors.push({
        field: 'dataOcorrencia',
        code: 'FUTURE_CLAIM_DATE',
        message: 'Data do sinistro não pode ser futura',
        severity: 'high'
      });
    }

    // Aviso se sinistro é muito antigo (mais de 1 ano)
    const diasAtras = (hoje.getTime() - dataEvento.getTime()) / (1000 * 60 * 60 * 24);
    if (diasAtras > 365) {
      warnings.push({
        field: 'dataOcorrencia',
        code: 'OLD_CLAIM_DATE',
        message: `Sinistro ocorreu há ${Math.round(diasAtras)} dias`,
        suggestion: 'Verificar documentação de prescrição'
      });
    }

    return { errors, warnings };
  }

  private validateClaimCoverage(claimData: ClaimData, policyData: PolicyData) {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    const dataSinistro = new Date(claimData.dataOcorrencia);
    const dataInicio = new Date(policyData.vigencia.inicio);
    const dataFim = new Date(policyData.vigencia.fim);

    // Verificar se sinistro ocorreu durante vigência
    if (dataSinistro < dataInicio || dataSinistro > dataFim) {
      errors.push({
        field: 'dataOcorrencia',
        code: 'CLAIM_OUTSIDE_TERM',
        message: 'Sinistro fora da vigência da apólice',
        severity: 'critical'
      });
    }

    // Verificar se tipo de sinistro está coberto
    const tipoSinistro = claimData.tipoSinistro.toLowerCase();
    const coberturasApolice = policyData.coberturas.map(c => c.tipo.toLowerCase());
    
    const coberturaEncontrada = coberturasApolice.find(c => c.includes(tipoSinistro) || tipoSinistro.includes(c));
    
    if (!coberturaEncontrada) {
      errors.push({
        field: 'tipoSinistro',
        code: 'UNCOVERED_CLAIM_TYPE',
        message: `Tipo de sinistro '${claimData.tipoSinistro}' não coberto pela apólice`,
        severity: 'critical'
      });
    } else {
      recommendations.push('Verificar limites e franquias da cobertura aplicável');
    }

    return { errors, warnings, recommendations };
  }

  private validateClaimValue(valorEstimado: number, policyData?: PolicyData) {
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    if (policyData) {
      // Verifica se há cobertura com limite compatível
      const coberturasComLimite = policyData.coberturas.filter(c => c.limite >= valorEstimado);
      
      if (coberturasComLimite.length === 0) {
        warnings.push({
          field: 'valorEstimado',
          code: 'VALUE_EXCEEDS_LIMITS',
          message: 'Valor estimado excede limites de todas as coberturas',
          suggestion: 'Verificar se cálculo está correto'
        });
      }

      // Recomendações baseadas no valor
      if (valorEstimado > 100000) {
        recommendations.push('Sinistro de alto valor - considerar perícia especializada');
      }
      
      if (valorEstimado > 25000) {
        recommendations.push('Encaminhar para análise manual conforme alçada');
      }
    }

    return { warnings, recommendations };
  }

  private validateNotificationPeriod(dataOcorrencia: string, tipoSinistro: string) {
    const warnings: ValidationWarning[] = [];

    const dataEvento = new Date(dataOcorrencia);
    const hoje = new Date();
    const diasComunicacao = (hoje.getTime() - dataEvento.getTime()) / (1000 * 60 * 60 * 24);

    // Prazos específicos por tipo de sinistro
    const prazos: Record<string, number> = {
      'roubo': 5,
      'furto': 5,
      'colisao': 30,
      'incendio': 30,
      'alagamento': 30,
      'default': 30
    };

    const prazoLimite = prazos[tipoSinistro.toLowerCase()] || prazos.default;

    if (diasComunicacao > prazoLimite) {
      warnings.push({
        field: 'comunicacao',
        code: 'LATE_NOTIFICATION',
        message: `Comunicação tardia - sinistro comunicado ${Math.round(diasComunicacao)} dias após ocorrência (prazo: ${prazoLimite} dias)`,
        suggestion: 'Verificar justificativa para comunicação tardia'
      });
    }

    return { warnings };
  }

  private isValidCPF(cpf: string): boolean {
    // Implementação básica de validação de CPF
    if (cpf.length !== 11 || /^(.)\1*$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    return digit === parseInt(cpf.charAt(10));
  }

  private isValidCNPJ(cnpj: string): boolean {
    // Implementação básica de validação de CNPJ
    if (cnpj.length !== 14 || /^(.)\1*$/.test(cnpj)) return false;
    
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cnpj.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return digit === parseInt(cnpj.charAt(13));
  }
}

export const businessValidationService = new BusinessValidationService();