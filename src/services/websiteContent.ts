import { supabase } from '@/integrations/supabase/client';

export async function processWebsite(url: string) {
  try {
    if (!url || !isValidUrl(url)) {
      throw new Error('Invalid URL');
    }

    // Use a CORS proxy service
    const corsProxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://proxy.cors.sh/${url}`
    ];

    let html = '';
    let proxyError = null;

    // Try each proxy until one works
    for (const proxyUrl of corsProxies) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'x-requested-with': 'XMLHttpRequest'
          }
        });

        if (!response.ok) continue;

        // Handle different proxy response formats
        const data = await response.json();
        html = data.contents || data.data || await response.text();
        proxyError = null;
        break;
      } catch (error) {
        proxyError = error;
        continue;
      }
    }

    if (!html && proxyError) {
      throw new Error('Failed to fetch website content through available proxies');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract content
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const mainContent = extractMainContent(doc);

    // Format content
    const content = `
Title: ${title}

Description: ${description}

Content:
${mainContent}
    `.trim();

    // Save to database
    const { data: savedDoc, error } = await supabase
      .from('documents')
      .insert([{
        content,
        metadata: {
          source_url: url,
          title,
          description,
          processed_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return savedDoc;

  } catch (error) {
    console.error('Error processing website:', error);
    
    // Provide more specific error messages
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      throw new Error(
        'Unable to access this website due to CORS restrictions. ' +
        'Please try a different URL or contact support.'
      );
    }

    throw new Error(
      'Failed to process website. ' +
      'Please check the URL and try again, or contact support.'
    );
  }
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function extractMainContent(doc: Document): string {
  // Try to find main content areas
  const contentSelectors = [
    'main',
    'article',
    '#content',
    '.content',
    '.main-content',
    '[role="main"]'
  ];

  let content = '';

  // Try each selector
  for (const selector of contentSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      content = element.textContent || '';
      break;
    }
  }

  // If no main content found, try to get body content
  if (!content.trim()) {
    // Get all paragraphs
    const paragraphs = Array.from(doc.querySelectorAll('p'));
    content = paragraphs
      .map(p => p.textContent)
      .filter(text => text && text.trim().length > 50) // Filter out short texts
      .join('\n\n');
  }

  // If still no content, get all text from body
  if (!content.trim()) {
    content = doc.body.textContent || '';
  }

  // Clean up the content
  return cleanContent(content);
}

function cleanContent(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
    .trim() // Remove leading/trailing whitespace
    .split('\n') // Split into lines
    .map(line => line.trim()) // Trim each line
    .filter(line => line.length > 0) // Remove empty lines
    .join('\n'); // Join back together
} 