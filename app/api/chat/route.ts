// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { ChatError } from '@/types/admin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    console.log('Received message:', message);

    // Get relevant documents
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('content, metadata');

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Found documents:', documents?.length || 0);

    if (!documents?.length) {
      return NextResponse.json({
        response:
          "I don't have any relevant information to answer your question. Please try asking something else."
      });
    }

    // Format context
    const context = documents
      .map((doc) => {
        const source = doc.metadata?.source_url
          ? `Source: ${doc.metadata.source_url}`
          : '';
        return `${doc.content}\n${source}`;
      })
      .join('\n\n');

    console.log('Sending request to OpenAI...');

    // Generate response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Changed to a more widely available model
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant. Use this context to answer questions:

${context}

Instructions:
1. Use the context above to answer questions
2. If you can't find relevant information, say so
3. Keep responses clear and structured
4. Reference sources when possible
5. Be concise and helpful`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('Received OpenAI response');

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error('No response content from OpenAI');
      throw new Error('No response generated');
    }

    return NextResponse.json({
      response: aiResponse,
      success: true
    });
  } catch (error: Error | ChatError | unknown) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate response',
        success: false
      },
      { status: 500 }
    );
  }
}
