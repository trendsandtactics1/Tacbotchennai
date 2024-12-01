import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
  session_id: string;
  first_message: string;
  timestamp: string;
}

interface ChatSessionsProps {
  onStartNewChat: () => void;
  onSelectSession?: (sessionId: string) => void;
}

const ChatSessions = ({
  onStartNewChat,
  onSelectSession
}: ChatSessionsProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setTimeUpdate] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatSessions();

    const timer = setInterval(() => {
      setTimeUpdate((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchChatSessions = async () => {
    setIsLoading(true);
    try {
      // Get the current session ID from localStorage or any session management system
      const currentSessionId = localStorage.getItem('currentSessionId');

      let query = supabase
        .from('conversations')
        .select('*')
        .not('session_id', 'is', null);

      // If there's a current session, filter by it
      if (currentSessionId) {
        query = query.eq('session_id', currentSessionId);
      }

      const { data, error } = await query.order('timestamp', {
        ascending: true
      });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive'
        });
        return;
      }

      if (!data || data.length === 0) {
        setSessions([]);
        return;
      }

      const uniqueSessions = data.reduce(
        (acc: { [key: string]: ChatSession }, curr) => {
          if (!acc[curr.session_id]) {
            acc[curr.session_id] = {
              session_id: curr.session_id,
              first_message: curr.message,
              timestamp: curr.timestamp
            };
          }
          return acc;
        },
        {}
      );

      setSessions(Object.values(uniqueSessions));
    } catch (error) {
      console.error('Error in fetchChatSessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    if (onSelectSession) {
      onSelectSession(sessionId);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center w-[350px] h-full'>
        <div className='flex space-x-2'>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className='flex-1 w-full max-w-full'>
      <div className='flex flex-col gap-4 p-2 sm:p-4 w-[350px] min-h-[400px] bg-white'>
        <div className='space-y-2 sm:space-y-4'>
          {sessions.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8'>
              <div className='w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4'>
                <MessageSquare className='h-6 w-6 text-white' />
              </div>
              <p className='text-gray-500 text-center'>No chat history yet</p>
              <p className='text-sm text-gray-400 text-center mt-1'>
                Start a new chat to begin
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <Button
                key={session.session_id}
                variant='ghost'
                className='w-full h-full flex items-start justify-between hover:bg-gray-100 transition-colors rounded-lg'
                onClick={() => handleSessionSelect(session.session_id)}
              >
                <div className='flex items-center gap-4 w-full overflow-hidden'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0'>
                    <MessageSquare className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
                  </div>
                  <div className='flex-1 min-w-0 text-left'>
                    <div className='flex flex-col gap-1'>
                      <span className='font-medium truncate pr-2 max-w-full text-sm sm:text-base text-gray-800'>
                        {session.first_message}
                      </span>
                      <span className='text-xs sm:text-sm text-gray-500'>
                        {formatDistanceToNow(new Date(session.timestamp), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default ChatSessions;
