import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    console.log('Received message:', message)

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: message,
        model: 'text-embedding-ada-002'
      })
    })

    const embeddingData = await embeddingResponse.json()
    const [{ embedding }] = embeddingData.data

    // Query for relevant documents with improved similarity threshold
    const { data: documents, error: matchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: embedding,
        similarity_threshold: 0.5, // Lower threshold to get more matches
        match_count: 5 // Increase matches for better context
      }
    )

    if (matchError) {
      console.error('Error matching documents:', matchError)
      throw matchError
    }

    console.log('Matched documents:', documents)

    // Format context from matched documents
    let contextText = ''
    if (documents && documents.length > 0) {
      contextText = documents
        .map((doc, index) => `[Document ${index + 1}]: ${doc.content}`)
        .join('\n\n')
    }

    // Improved system prompt
    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided context. 
If the context contains relevant information, use it to provide accurate and detailed answers.
If the context doesn't contain enough information to fully answer the question, acknowledge what you know from the context
and provide a general response for the remaining parts.

Context:
${contextText || 'No specific context available.'}

Remember to:
1. Be precise and accurate with information from the context
2. Clearly indicate when you're providing information beyond the context
3. Keep responses clear and well-structured`

    // Call OpenAI API with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: true,
        temperature: 0.7,
      }),
    })

    // Return the stream
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    })

  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat message',
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})