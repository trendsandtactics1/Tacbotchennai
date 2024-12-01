import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, User, Bot } from 'lucide-react';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  message: string;
  timestamp: string;
  status: string;
  session_id: string;
  sender: string;
  agent?: {
    name: string;
    status: string;
  };
}

export default function ConversationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchConversationAndMessages();
    }
  }, [id]);

  const fetchConversationAndMessages = async () => {
    try {
      setIsLoading(true);

      // First fetch the specific conversation to get the session_id
      const { data: conversationData, error: conversationError } =
        await supabase
          .from('conversations')
          .select(
            `
          *,
          agent:agents (
            name,
            status
          )
        `
          )
          .eq('id', id)
          .single();

      if (conversationError) throw conversationError;
      setConversation(conversationData);

      // Then fetch all messages from this session
      if (conversationData?.session_id) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('conversations')
          .select(
            `
            *,
            agent:agents (
              name,
              status
            )
          `
          )
          .eq('session_id', conversationData.session_id)
          .order('timestamp', { ascending: true });

        if (sessionError) throw sessionError;
        setSessionMessages(sessionData || []);
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation details',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/conversations');
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Status updated successfully'
      });

      fetchConversationAndMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className='p-6'>
        <h2 className='text-xl font-semibold text-red-600'>
          Conversation not found
        </h2>
        <Button onClick={handleBack} variant='outline' className='mt-4'>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back to Conversations
        </Button>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6 mt-12'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <Button onClick={handleBack} variant='outline' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' /> Back
          </Button>
          <h1 className='text-2xl font-bold'>Conversation Details</h1>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => updateStatus('pending')}
            variant={conversation.status === 'pending' ? 'default' : 'outline'}
          >
            Pending
          </Button>
          <Button
            onClick={() => updateStatus('resolved')}
            variant={conversation.status === 'resolved' ? 'default' : 'outline'}
          >
            Resolved
          </Button>
        </div>
      </div>

      {/* Conversation Info */}
      <Card className='p-4 space-y-2'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Clock className='h-4 w-4' />
          <span>
            Started: {format(new Date(conversation.timestamp), 'PPpp')}
          </span>
        </div>
        <div className='flex items-center gap-2 text-gray-600'>
          <User className='h-4 w-4' />
          <span>Session ID: {conversation.session_id}</span>
        </div>
        {conversation.agent && (
          <div className='flex items-center gap-2 text-gray-600'>
            <Bot className='h-4 w-4' />
            <span>Agent: {conversation.agent.name}</span>
          </div>
        )}
      </Card>

      {/* Messages Timeline */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Conversation Timeline</h2>
        <div className='space-y-4'>
          {sessionMessages.map((msg, index) => (
            <Card
              key={msg.id}
              className={`p-4 ${
                msg.sender === 'user' ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <div className='flex justify-between items-start mb-2'>
                <div className='flex items-center gap-2'>
                  {msg.sender === 'user' ? (
                    <User className='h-4 w-4' />
                  ) : (
                    <Bot className='h-4 w-4' />
                  )}
                  <span className='font-medium'>
                    {msg.sender === 'user' ? 'User' : 'AI Assistant'}
                  </span>
                </div>
                <span className='text-sm text-gray-500'>
                  {format(new Date(msg.timestamp), 'pp')}
                </span>
              </div>
              <p className='text-gray-700 whitespace-pre-wrap'>{msg.message}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
