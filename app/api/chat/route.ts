// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Increase timeout for Vercel
export const maxDuration = 60; // 1 minute
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000
});

function cleanResponse(text: string): string {
  // Remove source links
  text = text.replace(/\nSource:.*$/gm, '');

  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '');

  // Clean up any double newlines or spaces that might be left
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

function generateFallbackResponse(): string {
  return `Thank you for asking. In order to answer your query in a more precise way, can I connect to our Agent?

Keywords: FEES • ADMISSIONS • GENERAL QUERY

<button class="transfer-button">Transfer to Agent</button>
<button class="continue-button">Continue Here</button>`;
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Add timeout to the entire request
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 250000);
    });

    const responsePromise = handleRequest(req);
    const response = await Promise.race([responsePromise, timeoutPromise]);
    return response;
  } catch (error) {
    console.error('Error in chat API:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        success: false
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  }
}

async function handleRequest(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.message) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          success: false
        },
        { status: 400 }
      );
    }

    const { message } = body;

    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('content, metadata')
      .limit(30)
      .order('created_at', { ascending: false });

    if (dbError) {
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
        response:
          "I don't have any relevant information to answer your question. Please try asking something else.",
        success: true
      });
    }

    const context = documents
      .map((doc) => {
        const source = doc.metadata?.source_url
          ? `Source: ${doc.metadata.source_url}`
          : '';
        return `${doc.content.substring(0, 4000)}\n${source}`;
      })
      .join('\n\n')
      .substring(0, 32000);

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a helpful friendly AI assistant. Use this context to answer questions:

${context}

Instructions:
1. Keep responses between 300-450 characters only.
2. Be clear, concise, and More Respectful.
3. If you don't have enough information or are unsure, respond with: "${generateFallbackResponse()}"
4. Use simple, Structural points and list out points.
5. Do not include URLs or source references.
6. Always maintain a positive, helpful tone.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        timeout: 45000
      }
    );

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        {
          response: generateFallbackResponse(),
          success: true,
          hasButtons: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    // Check if response indicates uncertainty
    const uncertaintyIndicators = [
      "I don't have",
      "I'm not sure",
      "I cannot",
      "I don't know",
      "insufficient information"
    ];

    const isUncertain = uncertaintyIndicators.some(phrase => 
      aiResponse.toLowerCase().includes(phrase.toLowerCase())
    );

    if (isUncertain) {
      return NextResponse.json(
        {
          response: generateFallbackResponse(),
          success: true,
          hasButtons: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    const cleanedResponse = cleanResponse(aiResponse);

    return NextResponse.json(
      {
        response: cleanedResponse,
        success: true,
        hasButtons: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
      },
      { status: 500 }
    );
  }
}
