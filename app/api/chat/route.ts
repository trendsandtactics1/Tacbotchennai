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
    // Validate request body
    const body = await req.json().catch(() => null);
    if (!body || !body.message) {
      return NextResponse.json(
        { 
          error: 'Invalid request body', 
          success: false 
        },
        { status: 400 }
      );
    }

    const { message } = body;
    console.log('Received message:', message);

    // Get documents from Supabase
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('content, metadata')
      .limit(50);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error', 
          success: false 
        },
        { status: 500 }
      );
    }

    if (!documents?.length) {
      return NextResponse.json({
        response: "I don't have any relevant information to answer your question. Please try asking something else.",
        success: true
      });
    }

    // Format context
    const context = documents
      .map((doc) => {
        const source = doc.metadata?.source_url
          ? `Source: ${doc.metadata.source_url}`
          : '';
        return `${doc.content.substring(0, 4000)}\n${source}`;
      })
      .join('\n\n')
      .substring(0, 32000);

    // Generate OpenAI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a helpful friendly AI assistant. Use this context to answer questions:

${context}

Instructions:
1. Use the context above to answer questions, Always give a positive words.
2. If you can't find relevant information.
3. Keep responses clear and structured, Don't use Negative words.
4. Reference sources when possible, Give Source Link below the text.
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

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { 
          error: 'No response generated', 
          success: false 
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      response: aiResponse,
      success: true
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Ensure error response is always properly formatted JSON
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
      },
      { status: 500 }
    );
  }
}
