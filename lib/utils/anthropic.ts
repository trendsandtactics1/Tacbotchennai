import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateClaudeResponse(context: string, message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-2',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Context: ${context}\n\nQuestion: ${message}`
    }],
    temperature: 0.7
  });

  return response.content;
} 