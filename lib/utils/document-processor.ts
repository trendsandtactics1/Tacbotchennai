import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function processWebsiteContent(url: string) {
  try {
    // Fetch website content
    const response = await fetch(url);
    const html = await response.text();

    // Clean and extract text content with length limit
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000); // Limit content length

    // Generate embedding using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: textContent.substring(0, 8000) // Keep OpenAI token limit
    });

    const [{ embedding }] = embeddingResponse.data;

    // Store in Supabase
    const { error } = await supabase.from('documents').insert({
      content: textContent,
      metadata: {
        source_url: url,
        processed_at: new Date().toISOString()
      },
      embedding
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error processing website:', error);
    throw error;
  }
}
