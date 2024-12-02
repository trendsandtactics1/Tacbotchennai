/// <reference path="./deno.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Document {
  id: string;
  content: string;
  metadata: {
    source_url?: string;
    title?: string;
    description?: string;
  };
}

interface ProcessedDocument extends Document {
  similarity: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    const supabase: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .textSearch('content', query, {
        type: 'websearch',
        config: 'english'
      })
      .limit(5);

    if (error) throw error;

    // Calculate similarity scores
    const processedDocs: ProcessedDocument[] = documents.map(doc => ({
      ...doc,
      similarity: calculateSimilarity(query, doc.content)
    })).sort((a, b) => b.similarity - a.similarity);

    return new Response(
      JSON.stringify({ documents: processedDocs }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

function calculateSimilarity(query: string, content: string): number {
  // Simple TF-IDF based similarity
  const queryWords = new Set(query.toLowerCase().split(/\W+/));
  const contentWords = content.toLowerCase().split(/\W+/);
  
  let matches = 0;
  queryWords.forEach(word => {
    if (contentWords.includes(word)) matches++;
  });
  
  return matches / queryWords.size;
}