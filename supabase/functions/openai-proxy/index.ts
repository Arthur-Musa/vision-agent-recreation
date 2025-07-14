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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { endpoint, method = 'POST', body, headers: requestHeaders = {}, assistantId, threadId } = await req.json();

    // Handle OpenAI Assistants API
    if (assistantId) {
      return await handleAssistantAPI(openaiApiKey, assistantId, threadId, body);
    }

    // Handle regular OpenAI API
    const response = await fetch(`https://api.openai.com/v1${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
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
    console.error('Error in openai-proxy:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleAssistantAPI(apiKey: string, assistantId: string, threadId: string | null, body: any) {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2',
  };

  try {
    let currentThreadId = threadId;

    // Create thread if not provided
    if (!currentThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const threadData = await threadResponse.json();
      currentThreadId = threadData.id;
    }

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role: 'user',
        content: body.message
      }),
    });

    if (!messageResponse.ok) {
      throw new Error(`Failed to add message: ${messageResponse.statusText}`);
    }

    // Create run
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        assistant_id: assistantId,
        additional_instructions: body.instructions || undefined
      }),
    });

    if (!runResponse.ok) {
      throw new Error(`Failed to create run: ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    let run = runData;

    // Poll for completion
    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${run.id}`, {
        method: 'GET',
        headers,
      });
      
      run = await statusResponse.json();
    }

    if (run.status === 'completed') {
      // Get messages
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
        method: 'GET',
        headers,
      });

      const messagesData = await messagesResponse.json();
      const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant');

      return new Response(JSON.stringify({
        threadId: currentThreadId,
        runId: run.id,
        status: run.status,
        content: assistantMessage?.content[0]?.text?.value || 'No response',
        usage: run.usage
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        threadId: currentThreadId,
        runId: run.id,
        status: run.status,
        error: 'Run failed or requires action'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in assistant API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}