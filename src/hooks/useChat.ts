import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/services/chatService";
import { sendMessage, updateConversationStatus } from "@/services/chatService";
import { useChatSessionSubscription } from './useChatSessionSubscription';
import { ChatSession } from '@/types/user';

export type ConversationStatus = 'pending' | 'resolved' | 'closed';

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  content: `👋 Hi there! I'm your AI Assistant.

I'm here to help you with:
• Answering your questions
• Providing information
• Solving problems
• Offering guidance

Feel free to ask me anything! How can I assist you today?`,
  isUser: false,
  timestamp: new Date(),
  status: 'pending'
};

export const useChat = (userId: string | null) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadUserSessions(userId);
      const unsubscribe = subscribeToSessionUpdates(userId);
      return () => {
        unsubscribe();
      };
    }
  }, [userId]);

  // Load user's chat sessions
  const loadUserSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat sessions',
        variant: 'destructive'
      });
    }
  };

  // Load messages for a specific session
  const loadSessionMessages = async (selectedSessionId: string) => {
    if (!selectedSessionId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('session_id', selectedSessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          content: msg.message,
          isUser: msg.sender === 'user',
          timestamp: new Date(msg.timestamp),
          status: msg.status as ConversationStatus
        }));
        
        // If no messages exist, add welcome message only in state
        if (formattedMessages.length === 0) {
          setMessages([DEFAULT_WELCOME_MESSAGE]);
        } else {
          setMessages(formattedMessages);
        }
        setSessionId(selectedSessionId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new chat session
  const createNewSession = async (userId: string | null, title: string = 'New Chat') => {
    if (!userId) {
      console.error('Cannot create session without user ID');
      return null;
    }

    try {
      const newSessionId = uuidv4();
      const { error } = await supabase
        .from('chat_sessions')
        .insert([{
          id: newSessionId,
          user_id: userId,
          title
        }]);

      if (error) throw error;
      setSessionId(newSessionId);
      
      // Only set welcome message in state, don't store in database
      setMessages([DEFAULT_WELCOME_MESSAGE]);

      return newSessionId;
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Modified handleSend to include user_id
  const handleSend = async (input: string, userId: string) => {
    if (!input.trim()) return;

    const currentSessionId = sessionId || await createNewSession(userId);
    if (!currentSessionId) return;

    try {
      await sendMessage(currentSessionId, input, setMessages, setIsLoading);
      
      // Update session's last message
      await supabase
        .from('chat_sessions')
        .update({ last_message: input })
        .eq('id', currentSessionId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSessionUpdate = (session: ChatSession) => {
    setSessions(prev => {
      const exists = prev.some(s => s.id === session.id);
      if (exists) {
        return prev.map(s => s.id === session.id ? session : s);
      }
      return [session, ...prev];
    });
  };

  const handleSessionDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Subscribe to session updates
  useChatSessionSubscription(
    userId,
    handleSessionUpdate,
    handleSessionDelete
  );

  const subscribeToSessionUpdates = (currentUserId: string) => {
    const channel = supabase
      .channel(`chat-sessions-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          // ... subscription logic
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    messages,
    isLoading,
    sessionId,
    sessions,
    loadUserSessions,
    loadSessionMessages,
    createNewSession,
    handleSend,
    handleStatusChange: updateConversationStatus,
    setMessages
  };
};