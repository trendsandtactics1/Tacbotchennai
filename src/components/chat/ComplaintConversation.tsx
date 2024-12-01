import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

interface ComplaintConversationProps {
  sessionId: string;
  userId: string;
  onBack: () => void;
}

export function ComplaintConversation({ sessionId, userId, onBack }: ComplaintConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadSessionDetails();
    const unsubscribe = subscribeToMessages();
    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  const loadSessionDetails = async () => {
    const { data, error } = await supabase
      .from('complaint_sessions')
      .select(`
        *,
        agent:agents (
          name,
          status
        )
      `)
      .eq('id', sessionId)
      .single();

    if (!error && data) {
      setSession(data);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`complaint_session_id.eq.${sessionId},session_id.eq.${sessionId}`)
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
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`complaint:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `session_id=eq.${sessionId} OR complaint_session_id=eq.${sessionId}`
        },
        (payload) => {
          setMessages(current => {
            const exists = current.some(msg => msg.id === payload.new.id);
            if (exists) return current;
            return [...current, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newMessageObj = {
        message: newMessage.trim(),
        sender: 'user',
        complaint_session_id: sessionId,
        user_id: userId,
        timestamp: new Date().toISOString(),
        session_id: sessionId
      };

      const { data: messageData, error: conversationError } = await supabase
        .from('conversations')
        .insert(newMessageObj)
        .select()
        .single();

      if (conversationError) throw conversationError;

      if (messageData) {
        setMessages(current => [...current, messageData]);
      }

      setNewMessage('');
      
      const { error: sessionError } = await supabase
        .from('complaint_sessions')
        .update({ 
          updated_at: new Date().toISOString(),
          status: 'open'
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Complaint #{sessionId.slice(0, 8)}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${
                session?.status === 'pending' 
                  ? 'bg-red-500' 
                  : session?.status === 'resolved'
                  ? 'bg-green-500'
                  : 'bg-gray-500'
              }`} />
              {session?.status === 'pending' ? 'Awaiting Response' : 
               session?.status === 'resolved' ? 'Resolved' : 'Open'}
            </div>
          </div>
          <Badge 
            variant={
              session?.status === 'resolved' 
                ? 'success' 
                : session?.status === 'pending'
                ? 'destructive'
                : 'default'
            }
            className="ml-auto"
          >
            {session?.status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <Card className="flex-1 flex flex-col bg-white overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isFirstMessage = index === 0;
                const showTimestamp = isFirstMessage || 
                  (index > 0 && 
                    new Date(message.timestamp).getTime() - 
                    new Date(messages[index - 1].timestamp).getTime() > 300000
                  );

                return (
                  <div key={message.id} className="space-y-2">
                    {showTimestamp && (
                      <div className="flex justify-center">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 shadow-sm'
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1 flex items-center gap-2">
                          {message.sender === 'user' ? (
                            <>You <span className="w-1 h-1 rounded-full bg-current" /></>
                          ) : (
                            <>Admin <span className="w-1 h-1 rounded-full bg-current" /></>
                          )}
                          {formatDate(message.timestamp)}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[80px] flex-1"
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !newMessage.trim()}
                  className="self-end"
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 