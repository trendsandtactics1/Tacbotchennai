// src/lib/openai/service.ts
export async function generateAIResponse(
  messages: { role: string; content: string }[]
) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}
