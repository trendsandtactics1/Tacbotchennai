import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Processing URL:', url);

    // Fetch webpage content
    const response = await fetch(url);
    const html = await response.text();

    // Parse HTML and extract text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc) throw new Error('Failed to parse HTML');

    // Extract text from main content areas (customize selectors based on your website)
    const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article');
    let textContent = Array.from(contentElements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 10) // Filter out short snippets
      .join('\n\n');

    // Initialize OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }));

    // Generate embedding
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: textContent,
    });

    const [{ embedding }] = embeddingResponse.data.data;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store in documents table
    const { data, error } = await supabaseClient
      .from('documents')
      .insert({
        content: textContent,
        embedding,
        metadata: { source_url: url, processed_at: new Date().toISOString() }
      });

    if (error) throw error;

    console.log('Successfully processed and stored content from:', url);

    return new Response(
      JSON.stringify({ success: true, message: 'Content processed and stored successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing website:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});