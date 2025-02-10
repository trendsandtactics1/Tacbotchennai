import { supabase } from '../supabase/client';
import { Message } from '@/types/admin';

interface Button {
  text: string;
  nextFlow: string;
}

interface ChatFlow {
  id: string;
  message: string;
  buttons: Button[];
}

const chatFlows: Record<string, ChatFlow> = {
  start: {
    id: 'start',
    message: 'Welcome! How can I help you today?',
    buttons: [
      { text: 'Admission Information', nextFlow: 'admission' },
      { text: 'Fee Structure', nextFlow: 'fees' },
      { text: 'Campus Details', nextFlow: 'campus' },
      { text: 'Courses Offered', nextFlow: 'courses' }
    ]
  },
  admission: {
    id: 'admission',
    message: 'What would you like to know about admissions?',
    buttons: [
      { text: 'Application Process', nextFlow: 'application_process' },
      { text: 'Required Documents', nextFlow: 'documents' },
      { text: 'Important Dates', nextFlow: 'admission_dates' },
      { text: 'Back to Main Menu', nextFlow: 'start' }
    ]
  },
  // Add other flows as needed...
};

export class ChatService {
  static async createUser(name: string, mobile: string) {
    try {
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('mobile', mobile)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      if (existingUser) {
        return existingUser;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name,
            mobile,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create user');

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async createChat(userId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_histories')
        .insert([
          {
            user_id: userId,
            title: 'New Chat',
            current_flow: 'start',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  static async getChatHistory(userId: string) {
    try {
      const { data: chats, error: chatsError } = await supabase
        .from('chat_histories')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      const chatHistoryWithMessages = await Promise.all(
        chats.map(async (chat) => {
          const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (msgError) throw msgError;

          return {
            id: chat.id,
            title: chat.title || 'New Chat',
            timestamp: new Date(chat.created_at).toLocaleString(),
            lastMessage: messages?.[0]?.content,
            currentFlow: chat.current_flow || 'start'
          };
        })
      );

      return chatHistoryWithMessages;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  static async getMessages(chatId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async processFlow(content: string, currentFlow: string): Promise<ChatFlow> {
    // Check for keywords to determine next flow
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('admission')) return chatFlows.admission;
    if (lowerContent.includes('fee')) return chatFlows.fees;
    if (lowerContent.includes('campus')) return chatFlows.campus;
    if (lowerContent.includes('course')) return chatFlows.courses;
    
    // If no keyword match, check if it's a button selection
    const flow = chatFlows[currentFlow];
    const selectedButton = flow?.buttons.find(
      button => button.text.toLowerCase() === content.toLowerCase()
    );
    
    if (selectedButton) {
      return chatFlows[selectedButton.nextFlow];
    }
    
    // Default to current flow or start
    return chatFlows[currentFlow] || chatFlows.start;
  }

  static async sendMessage(
    sessionId: string,
    content: string,
    currentFlow: string = 'start'
  ): Promise<{ userMessage: Message; aiMessage: Message; nextFlow: ChatFlow }> {
    try {
      // Save user message
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          chat_id: sessionId,
          content,
          role: 'user',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) throw userError;

      // Process flow and get response
      const nextFlow = await this.processFlow(content, currentFlow);

      // Save AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('messages')
        .insert({
          chat_id: sessionId,
          content: nextFlow.message,
          role: 'assistant',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (aiError) throw aiError;

      // Update chat history
      await supabase
        .from('chat_histories')
        .update({
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          current_flow: nextFlow.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      return { userMessage, aiMessage, nextFlow };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  static async updateChatTitle(chatId: string, title: string) {
    try {
      const { data, error } = await supabase
        .from('chat_histories')
        .update({
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating chat title:', error);
      throw error;
    }
  }
}
