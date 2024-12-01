import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { ComplaintSession } from '@/types/complaints';
import { ComplaintMessageList } from './ComplaintMessageList';
import { ComplaintReplyForm } from './ComplaintReplyForm';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface ComplaintDetailsProps {
  sessionId: string;
  onBack: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ComplaintDetails({
  sessionId,
  onBack,
  isOpen = true,
  onOpenChange
}: ComplaintDetailsProps) {
  const { toast } = useToast();
  const [session, setSession] = useState<ComplaintSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
      loadMessages();
      const unsubscribe = subscribeToUpdates();
      return () => {
        unsubscribe();
      };
    }
  }, [sessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'user' && session?.status !== 'pending') {
        updateSessionStatus('pending');
      }
    }
  }, [messages]);

  const loadSessionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('complaint_sessions')
        .select(
          `
          *,
          user:users (
            name,
            mobile
          )
        `
        )
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaint details',
        variant: 'destructive'
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
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`complaint:${sessionId}`)
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
        (payload) => {
          setSession((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateSessionStatus = async (newStatus: 'pending' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('complaint_sessions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      setSession((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReply = async (message: string) => {
    if (!session) return;

    try {
      const newMessage = {
        message: message.trim(),
        sender: 'agent',
        complaint_session_id: sessionId,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      };

      const { data: messageData, error: messageError } = await supabase
        .from('conversations')
        .insert(newMessage)
        .select()
        .single();

      if (messageError) throw messageError;

      if (messageData) {
        setMessages((prev) => [...prev, messageData]);
      }

      const { error: sessionError } = await supabase
        .from('complaint_sessions')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      setSession((prev) => (prev ? { ...prev, status: 'resolved' } : null));

      toast({
        title: 'Success',
        description: 'Reply sent successfully'
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'pending':
        return 'destructive';
      case 'closed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const content = (
    <div className='flex flex-col h-full'>
      <div className='flex-shrink-0 mb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={onBack}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-2xl font-semibold'>Complaint Details</h1>
              <div className='text-sm text-gray-500'>
                <p>
                  From: {session?.user?.name} ({session?.user?.mobile})
                </p>
                <p>Created: {formatDate(session?.created_at)}</p>
              </div>
            </div>
          </div>
          <Badge
            variant={getStatusColor(session?.status || 'open')}
            className='text-sm'
          >
            {session?.status === 'pending' ? 'Needs Response' : session?.status}
          </Badge>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-h-0'>
        <Card className='flex-1 flex flex-col overflow-hidden'>
          <div className='p-4 border-b bg-gray-50 flex-shrink-0'>
            <div className='flex justify-between items-center'>
              <p className='text-sm text-gray-500'>
                Session started: {formatDate(session?.created_at)}
              </p>
              <p className='text-sm text-gray-500'>
                Last updated: {formatDate(session?.updated_at)}
              </p>
            </div>
          </div>

          <ScrollArea className='flex-1 px-4 py-2'>
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
                        message.sender === 'agent'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'agent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className='text-xs opacity-70 mb-1'>
                          {message.sender === 'agent' ? 'Agent' : 'User'}
                        </div>
                        <p className='text-sm whitespace-pre-wrap'>
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className='h-4' />
            </div>
          </ScrollArea>

          {session?.status !== 'closed' && (
            <div className='mt-auto border-t bg-white p-4'>
              <ComplaintReplyForm
                sessionId={sessionId}
                onSubmit={handleReply}
              />
            </div>
          )}
        </Card>
      </div>

      <div className='flex justify-end gap-2 mt-4'>
        <Button
          variant='outline'
          onClick={() => handleStatusChange('closed')}
          disabled={session?.status === 'closed'}
        >
          Close Complaint
        </Button>
        <Button
          variant='outline'
          onClick={() => handleStatusChange('resolved')}
          disabled={session?.status === 'resolved'}
        >
          Mark as Resolved
        </Button>
      </div>
    </div>
  );

  const handleStatusChange = async (newStatus: 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('complaint_sessions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Update local session state
      setSession((prev) => (prev ? { ...prev, status: newStatus } : null));

      toast({
        title: 'Success',
        description: `Complaint ${newStatus} successfully`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  if (isLoading || !session) {
    return (
      <div className='flex items-center justify-center h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl h-[90vh] flex flex-col p-6'>
          <DialogHeader className='flex-shrink-0 mb-4'>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          <div className='flex-1 min-h-0 overflow-hidden'>{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}
