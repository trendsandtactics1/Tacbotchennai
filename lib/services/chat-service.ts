// src/lib/services/chat-service.ts
import { supabase } from '../supabase/client';
import { generateAIResponse } from '../openai/service';
import { Message } from '@/types/admin';

export class ChatService {
  static async createUser(name: string, mobile: string) {
    try {
      // First check if user exists
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

      // Create new user if doesn't exist
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

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create user');
      }

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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to create chat');
      }

      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  static async getChatHistory(userId: string) {
    try {
      // First get all chats
      const { data: chats, error: chatsError } = await supabase
        .from('chat_histories')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Get last message for each chat
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
            lastMessage:
              messages && messages[0] ? messages[0].content : undefined
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

  static async sendMessage(
    sessionId: string,
    content: string,
    role: 'user' | 'assistant' = 'user'
  ): Promise<{ userMessage: Message; aiMessage: Message }> {
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

      // Update chat timestamp
      await supabase
        .from('chat_histories')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      try {
        // Generate AI response
        const aiResponse = await generateAIResponse(content);

        // Save AI response
        const { data: aiMessage, error: aiError } = await supabase
          .from('messages')
          .insert({
            chat_id: sessionId,
            content: aiResponse,
            role: 'assistant',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (aiError) throw aiError;

        // Update chat with last message
        await supabase
          .from('chat_histories')
          .update({
            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        return { userMessage, aiMessage };
      } catch (error) {
        console.error('AI response error:', error);

        // Save error message as AI response
        const { data: aiMessage } = await supabase
          .from('messages')
          .insert({
            chat_id: sessionId,
            content:
              "I apologize, but I'm having trouble accessing the relevant information right now. Please try asking your question again, or rephrase it differently.",
            role: 'assistant',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        return { userMessage, aiMessage };
      }
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
