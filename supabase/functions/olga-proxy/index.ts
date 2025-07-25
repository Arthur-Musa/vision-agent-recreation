import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const olgaApiKey = Deno.env.get('OLGA_API_KEY');
    if (!olgaApiKey) {
      return new Response(JSON.stringify({ error: 'Olga API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { endpoint, method = 'POST', body, headers: requestHeaders = {} } = await req.json();

    const response = await fetch(`https://sinistros-ia-sistema-production.up.railway.app${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${olgaApiKey}`,
        'Content-Type': 'application/json',
        ...requestHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in olga-proxy:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});