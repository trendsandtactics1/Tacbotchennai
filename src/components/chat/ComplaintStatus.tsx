import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ComplaintSession, Message } from '@/types/complaints';

interface ComplaintStatusProps {
  sessionId: string;
  onBack: () => void;
}

export default function ComplaintStatus({
  sessionId,
  onBack
}: ComplaintStatusProps) {
  const [session, setSession] = useState<ComplaintSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessionDetails();
    loadMessages();
    const unsubscribe = subscribeToUpdates();
    return () => unsubscribe();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('complaint_sessions')
        .select(`
          *,
          user:users (
            name,
            mobile
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaint details'
      });
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
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`user-complaint:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `session_id=eq.${sessionId} OR complaint_session_id=eq.${sessionId}`
        },
        async () => {
          await loadMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaint_sessions',
          filter: `id=eq.${sessionId}`
        },
        async (payload) => {
          setSession((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant='success'>Resolved</Badge>;
      case 'pending':
        return <Badge variant='destructive'>Waiting for Admin Response</Badge>;
      case 'closed':
        return <Badge variant='secondary'>Closed</Badge>;
      default:
        return <Badge>Open</Badge>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading || !session) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='p-4 border-b'>
        <div className='flex items-center gap-3 mb-3'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h2 className='font-semibold'>Complaint Status</h2>
            <p className='text-sm text-gray-500'>
              {session.user?.name} ({session.user?.mobile})
            </p>
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-gray-500'>
            {formatDate(session.created_at)}
          </p>
          {getStatusBadge(session.status)}
        </div>
      </div>

      <Card className='flex-1 flex flex-col m-4'>
        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-4'>
            {messages.map((message, index) => {
              const isFirstMessage = index === 0;
              const showTimestamp =
                isFirstMessage ||
                (index > 0 &&
                  new Date(message.timestamp).getTime() -
                    new Date(messages[index - 1].timestamp).getTime() >
                    300000);

              return (
                <div key={message.id} className='space-y-2'>
                  {showTimestamp && (
                    <div className='flex justify-center'>
                      <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${
                      message.sender === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className='text-xs opacity-70 mb-1'>
                        {message.sender === 'user' ? 'You' : 'Admin'}
                      </div>
                      <p className='text-sm whitespace-pre-wrap'>
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
