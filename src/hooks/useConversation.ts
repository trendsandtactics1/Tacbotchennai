import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Conversation, ConversationStatus } from '@/types/conversations';

export function useConversation(sessionId: string) {
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadMessages();
      subscribeToMessages();
    }
  }, [sessionId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          agent:agents (
            id,
            name,
            status
          ),
          user:users (
            id,
            name,
            mobile
          )
        `)
        .or(`session_id.eq.${sessionId},chat_session_id.eq.${sessionId},complaint_session_id.eq.${sessionId}`)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`conversation-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Conversation]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === payload.new.id ? payload.new : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (message: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .insert([{
          session_id: sessionId,
          sender: 'user',
          message,
          user_id: userId,
          status: 'pending'
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const updateStatus = async (messageId: string, status: ConversationStatus) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive'
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    updateStatus
  };
} 