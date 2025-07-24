// Serviço para integração com workflows n8n da 88i
export interface SinistroBaseData {
  numero_apolice: string;
  cpf_segurado: string;
  tipo_sinistro: 'acidentes_pessoais' | 'bagagem_mercadoria';
  data_ocorrencia: string;
  descricao_ocorrencia: string;
  valor_estimado: number;
  contato_email: string;
  contato_telefone: string;
}

export interface DocumentoSinistro {
  nome: string;
  tipo: string;
  url: string;
  tamanho: number;
}

export interface SinistroAcidentesPessoais extends SinistroBaseData {
  tipo_sinistro: 'acidentes_pessoais';
  documentos_medicos: DocumentoSinistro[];
  fotos_lesoes: DocumentoSinistro[];
  gravidade_lesao: 'leve' | 'moderada' | 'grave';
  local_atendimento?: string;
  profissional_responsavel?: string;
}

export interface SinistroBagagemMercadoria extends SinistroBaseData {
  tipo_sinistro: 'bagagem_mercadoria';
  documentos_carga: DocumentoSinistro[];
  fotos_danos: DocumentoSinistro[];
  tipo_transporte: 'aereo' | 'terrestre' | 'maritimo';
  origem: string;
  destino: string;
  transportadora: string;
  numero_rastreamento?: string;
}

export interface WorkflowResponse {
  success: boolean;
  workflow_id: string;
  execution_id: string;
  numero_sinistro: string;
  status: 'iniciado' | 'processando' | 'aprovado' | 'negado' | 'pendente_analise';
  message: string;
  data?: any;
}

class N8nWorkflowService {
  private readonly baseUrl: string;
  
  constructor() {
    // URL base do n8n configurada para 88i
    this.baseUrl = 'https://olga-ai.app.n8n.cloud';
  }

  /**
   * Inicia triagem inicial do sinistro (mantido para compatibilidade)
   */
  async iniciarTriagem(data: SinistroBaseData): Promise<WorkflowResponse> {
    return this.enviarSinistro(data);
  }

  /**
   * Envia sinistro diretamente para o webhook 88i
   */
  async enviarSinistro(data: any): Promise<WorkflowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/88i`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          fonte: 'sistema_olga'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na triagem: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao iniciar triagem:', error);
      throw new Error('Falha ao iniciar processo de triagem do sinistro');
    }
  }

  /**
   * Processa sinistro de acidentes pessoais
   */
  async processarAcidentesPessoais(data: SinistroAcidentesPessoais): Promise<WorkflowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/acidentes-pessoais`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          workflow_tipo: 'acidentes_pessoais'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro no processamento: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao processar acidentes pessoais:', error);
      throw new Error('Falha ao processar sinistro de acidentes pessoais');
    }
  }

  /**
   * Processa sinistro de bagagem/mercadoria
   */
  async processarBagagemMercadoria(data: SinistroBagagemMercadoria): Promise<WorkflowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bagagem-mercadoria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          workflow_tipo: 'bagagem_mercadoria'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro no processamento: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao processar bagagem/mercadoria:', error);
      throw new Error('Falha ao processar sinistro de bagagem/mercadoria');
    }
  }

  /**
   * Consulta status de um sinistro
   */
  async consultarStatus(numeroSinistro: string): Promise<any> {
    try {
      // Implementar endpoint de consulta no n8n
      const response = await fetch(`${this.baseUrl}/api/sinistro/${numeroSinistro}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao consultar status:', error);
      throw new Error('Falha ao consultar status do sinistro');
    }
  }

  /**
   * Lista sinistros por CPF
   */
  async listarSinistrosPorCpf(cpf: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sinistros?cpf=${cpf}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar sinistros:', error);
      throw new Error('Falha ao listar sinistros');
    }
  }
}

export const n8nWorkflowService = new N8nWorkflowService();