const OPENAI_API_KEY = 'REPLACE_WITH_YOUR_API_KEY';
import { supabase } from '@/integrations/supabase/client';

interface MatchedDocument {
  id: string;
  content: string;
  metadata: {
    source_url?: string;
    title?: string;
    processed_at?: string;
  };
  similarity: number;
}

export async function getAIResponse(message: string): Promise<string> {
  try {
    // First, get relevant documents based on the query
    const { data: matchResponse, error: matchError } = await supabase.functions.invoke('match-documents', {
      body: { query: message }
    });

    if (matchError) throw matchError;

    // Format the context with metadata
    const contextText = matchResponse?.documents
      ?.map((doc: MatchedDocument, index: number) => {
        const source = doc.metadata?.source_url ? `Source: ${doc.metadata.source_url}` : '';
        const relevance = `Relevance: ${(doc.similarity * 100).toFixed(2)}%`;
        return `[Document ${index + 1}]: ${doc.content}\n${source}\n${relevance}`;
      })
      .join('\n\n') || 'No specific context available.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant that answers questions based on the provided context. 
Use the following context to answer questions accurately:

${contextText}

Instructions:
1. Only use information from the provided context to answer questions
2. If the context doesn't contain relevant information, clearly state that
3. Keep responses clear and well-structured
4. When citing information, reference the specific document using [Document X]
5. Consider the relevance score when choosing which information to prioritize
6. If multiple documents contain relevant information, synthesize them into a coherent response`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    throw new Error('Failed to process your request. Please try again.');
  }
}
