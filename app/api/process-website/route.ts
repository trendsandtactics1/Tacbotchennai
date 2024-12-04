import { NextResponse } from 'next/server';
import { processWebsiteContent } from '@/lib/utils/document-processor';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    await processWebsiteContent(url);

    return NextResponse.json({ message: 'Website processed successfully' });
  } catch (error) {
    console.error('Error processing website:', error);
    return NextResponse.json(
      { error: 'Failed to process website' },
      { status: 500 }
    );
  }
} 