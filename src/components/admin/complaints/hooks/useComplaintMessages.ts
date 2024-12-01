import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/complaints';

export function useComplaintMessages(
  sessionId?: string,
  initialMessage?: string,
  complaintId?: string,
  createdAt?: string
) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (sessionId) {
      loadMessages();
    } else if (initialMessage && createdAt) {
      // If no session ID but we have an initial message, use that
      setMessages([
        {
          id: complaintId || 'initial',
          message: initialMessage,
          sender: 'user',
          timestamp: createdAt
        }
      ]);
    }
  }, [sessionId, initialMessage, complaintId, createdAt]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Transform the data to match Message type
      const transformedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        message: msg.message,
        sender: msg.sender,
        timestamp: msg.timestamp
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  return { messages, setMessages, loadMessages };
}