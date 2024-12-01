// @deno-types="https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.deno.ns.d.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    // Initialize OpenAI
    const openAiConfig = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(openAiConfig);

    // Generate embedding for the query
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: query,
    });

    const [{ embedding }] = embeddingResponse.data.data;

    // Connect to Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query for similar documents with improved matching
    const { data: documents, error } = await supabaseClient.rpc(
      'match_documents',
      {
        query_embedding: embedding,
        similarity_threshold: 0.6, // Adjust this threshold based on your needs
        match_count: 5, // Increased to get more potential matches
      }
    );

    if (error) throw error;

    // Process and clean up the documents
    const processedDocuments = documents
      .filter(doc => doc.similarity > 0.6) // Additional relevance filter
      .map(doc => ({
        ...doc,
        content: doc.content
          .split('\n')
          .filter(para => para.trim().length > 0)
          .join('\n\n'),
        metadata: {
          ...doc.metadata,
          processed_at: new Date().toISOString()
        }
      }))
      .sort((a, b) => b.similarity - a.similarity); // Sort by relevance

    return new Response(
      JSON.stringify({ 
        documents: processedDocuments,
        query_text: query,
        total_matches: processedDocuments.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-documents function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});