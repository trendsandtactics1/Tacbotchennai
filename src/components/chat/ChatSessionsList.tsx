import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { ChatSession } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';

interface ChatSessionsListProps {
  userId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  loadUserSessions: (userId: string) => Promise<ChatSession[]>;
}

export function ChatSessionsList({
  userId,
  onSelectSession,
  onNewChat,
  loadUserSessions
}: ChatSessionsListProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  const fetchSessions = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const userSessions = await loadUserSessions(userId);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-black hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No chat history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <Button
                key={session.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{session.title}</span>
                  {session.last_message && (
                    <span className="text-sm text-gray-500 truncate">
                      {session.last_message}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(session.created_at), {
                      addSuffix: true
                    })}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 