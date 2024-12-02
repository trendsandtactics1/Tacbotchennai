import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const sessionId = req.headers.get('x-session-id');

    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });
    const openai = new OpenAIApi(configuration);

    // Get AI response
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    });

    const response = {
      response:
        completion.data.choices[0]?.message?.content ||
        "I'm sorry, I couldn't process that."
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
