import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppData {
  from: string;
  message: string;
  timestamp: string;
  media?: {
    url: string;
    type: string;
    filename: string;
  }[];
}

interface SinistroData {
  numero_apolice?: string;
  cpf_segurado?: string;
  tipo_sinistro?: string;
  data_ocorrencia?: string;
  descricao_ocorrencia?: string;
  valor_estimado?: number;
  contato_telefone?: string;
  contato_email?: string;
}

serve(async (req) => {
  console.log('WhatsApp Aura Processor - Request received:', req.method, req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request data
    const data: WhatsAppData = await req.json();
    console.log('WhatsApp data received:', data);

    // Extract sinistro information from WhatsApp message using AI
    const extractedData = await extractSinistroData(data.message);
    console.log('Extracted sinistro data:', extractedData);

    // Generate unique sinistro number
    const numeroSinistro = generateSinistroNumber();
    
    // Prepare sinistro data for database
    const sinistroRecord = {
      id: crypto.randomUUID(),
      numero_sinistro: numeroSinistro,
      tipo_sinistro: extractedData.tipo_sinistro || 'Não especificado',
      status: 'pendente',
      data_ocorrencia: extractedData.data_ocorrencia || new Date().toISOString(),
      observacoes: `Sinistro recebido via WhatsApp do agente Aura\nMensagem original: ${data.message}`,
      valor_solicitado: extractedData.valor_estimado || 0,
      analista_responsavel: null,
      decisao_automatica: false,
      score_fraude: null,
      valor_aprovado: null,
      apolice_id: crypto.randomUUID(), // Temporary - would need to lookup real policy
      segurado_id: crypto.randomUUID(), // Temporary - would need to lookup real insured
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert sinistro into database
    const { data: sinistroInserted, error: sinistroError } = await supabase
      .from('sinistros')
      .insert(sinistroRecord)
      .select()
      .single();

    if (sinistroError) {
      console.error('Error inserting sinistro:', sinistroError);
      throw new Error(`Erro ao salvar sinistro: ${sinistroError.message}`);
    }

    console.log('Sinistro inserted successfully:', sinistroInserted);

    // Store WhatsApp conversation record
    const conversationRecord = {
      id: crypto.randomUUID(),
      session_id: `whatsapp_${data.from}_${numeroSinistro}`,
      role: 'user',
      content: data.message,
      metadata: {
        source: 'whatsapp',
        agent: 'aura',
        phone: data.from,
        sinistro_numero: numeroSinistro,
        media: data.media || []
      },
      timestamp: new Date().toISOString()
    };

    const { error: conversationError } = await supabase
      .from('conversations')
      .insert(conversationRecord);

    if (conversationError) {
      console.error('Error inserting conversation:', conversationError);
    }

    // Prepare data for n8n webhook
    const webhookData = {
      numero_sinistro: numeroSinistro,
      fonte: 'whatsapp_aura',
      timestamp: new Date().toISOString(),
      contato_telefone: data.from,
      mensagem_original: data.message,
      dados_extraidos: extractedData,
      sinistro_id: sinistroInserted.id,
      status: 'novo',
      anexos: data.media || []
    };

    // Send to n8n webhook
    const webhookUrl = 'https://olga-ai.app.n8n.cloud/webhook/88i';
    console.log('Sending data to n8n webhook:', webhookUrl);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const webhookResult = await webhookResponse.text();
    console.log('n8n webhook response:', webhookResponse.status, webhookResult);

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      numero_sinistro: numeroSinistro,
      sinistro_id: sinistroInserted.id,
      message: 'Sinistro processado e enviado para análise',
      webhook_status: webhookResponse.status,
      webhook_response: webhookResult
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing WhatsApp data:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erro ao processar dados do WhatsApp'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Extract sinistro data from WhatsApp message using pattern matching
function extractSinistroData(message: string): SinistroData {
  const data: SinistroData = {};
  
  // Extract policy number (various formats)
  const policyMatch = message.match(/(?:apólice|apolice|policy)[\s#:]*(\d{8,})/i);
  if (policyMatch) {
    data.numero_apolice = policyMatch[1];
  }

  // Extract CPF
  const cpfMatch = message.match(/(?:cpf)[\s#:]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i);
  if (cpfMatch) {
    data.cpf_segurado = cpfMatch[1].replace(/[^\d]/g, '');
  }

  // Extract monetary values
  const valueMatch = message.match(/(?:valor|prejuízo|dano)[\s:]*R?\$?\s*([\d.,]+)/i);
  if (valueMatch) {
    const value = parseFloat(valueMatch[1].replace(/[.,]/g, ''));
    if (!isNaN(value)) {
      data.valor_estimado = value;
    }
  }

  // Extract dates
  const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (dateMatch) {
    data.data_ocorrencia = dateMatch[1];
  }

  // Identify sinistro type based on keywords
  const messageLower = message.toLowerCase();
  if (messageLower.includes('acidente') || messageLower.includes('lesão') || messageLower.includes('ferimento')) {
    data.tipo_sinistro = 'acidentes_pessoais';
  } else if (messageLower.includes('bagagem') || messageLower.includes('mercadoria') || messageLower.includes('carga')) {
    data.tipo_sinistro = 'bagagem_mercadoria';
  } else if (messageLower.includes('veículo') || messageLower.includes('carro') || messageLower.includes('auto')) {
    data.tipo_sinistro = 'automotivo';
  } else {
    data.tipo_sinistro = 'geral';
  }

  // Extract phone (if mentioned)
  const phoneMatch = message.match(/(?:telefone|fone|contato)[\s#:]*(\+?55\s?\d{2}\s?\d{4,5}-?\d{4})/i);
  if (phoneMatch) {
    data.contato_telefone = phoneMatch[1];
  }

  // Extract email
  const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    data.contato_email = emailMatch[1];
  }

  // Set description
  data.descricao_ocorrencia = message;

  return data;
}

// Generate unique sinistro number
function generateSinistroNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `WA${year}${month}${day}${random}`;
}