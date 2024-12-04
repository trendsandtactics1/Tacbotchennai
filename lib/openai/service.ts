// src/lib/openai/service.ts
export async function generateAIResponse(message: string): Promise<string> {
  try {
    console.log('Sending request to chat API...');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    console.log('Received response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate AI response');
    }

    if (!data.success || !data.response) {
      throw new Error('Invalid response from AI service');
    }

    return data.response;
  } catch (error: Error | unknown) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(
      `AI Response Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
