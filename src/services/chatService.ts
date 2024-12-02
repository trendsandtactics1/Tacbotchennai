import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'pending' | 'resolved' | 'closed';
}

// Predefined AI responses
const AI_RESPONSES = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Welcome! How may I help you?"
  ],
  default: [
    "I understand. Could you please provide more details?",
    "I'm here to help. What specific information do you need?",
    "Let me assist you with that. Could you elaborate further?"
  ],
  unknown: [
    "I'm not sure I understand. Could you rephrase that?",
    "Could you please clarify what you mean?",
    "I'm having trouble understanding. Could you explain differently?"
  ]
};

function getAIResponse(message: string): string {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();

  // Check for greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return AI_RESPONSES.greeting[Math.floor(Math.random() * AI_RESPONSES.greeting.length)];
  }

  // Default response if no specific match
  return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)];
}

export async function sendMessage(
  sessionId: string,
  message: string,
  setMessages: (messages: any) => void,
  setIsLoading: (loading: boolean) => void
) {
  try {
    setIsLoading(true);

    // Save user message to conversations
    const { data: messageData, error: messageError } = await supabase
      .from('conversations')
      .insert([
        {
          session_id: sessionId,
          message: message,
          sender: 'user',
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (messageError) throw messageError;

    // Update messages state with user message
    setMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        id: messageData.id,
        content: message,
        isUser: true,
        timestamp: new Date(),
        status: 'pending'
      }
    ]);

    // Generate AI response
    const aiResponse = getAIResponse(message);

    // Add artificial delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save AI response to conversations
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from('conversations')
      .insert([
        {
          session_id: sessionId,
          message: aiResponse,
          sender: 'assistant',
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;

    // Update messages state with AI response
    setMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        id: aiMessageData.id,
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        status: 'pending'
      }
    ]);

  } catch (error) {
    console.error('Error in sendMessage:', error);
    setMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        id: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
        status: 'error'
      }
    ]);
  } finally {
    setIsLoading(false);
  }
}

export async function updateConversationStatus(
  messageId: string,
  status: 'pending' | 'resolved' | 'closed'
) {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating conversation status:', error);
    throw error;
  }
}