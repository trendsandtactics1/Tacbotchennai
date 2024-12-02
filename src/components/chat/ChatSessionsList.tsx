import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChatSession } from '@/types/user';
import { Loader2 } from 'lucide-react';

interface ChatSessionsListProps {
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  onStartNewChat: () => void;
  loading?: boolean;
}

export function ChatSessionsList({
  sessions = [],
  onSelectSession,
  onStartNewChat,
  loading = false
}: ChatSessionsListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSessionClick = (sessionId: string) => {
    setSelectedId(sessionId);
    onSelectSession(sessionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={onStartNewChat}
        className="w-full"
        variant="outline"
      >
        Start New Chat
      </Button>

      <div className="space-y-2">
        {sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <Button
              key={session.id}
              variant={selectedId === session.id ? "default" : "ghost"}
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => handleSessionClick(session.id)}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="font-medium">
                  {session.title || 'New Chat'}
                </div>
                {session.last_message && (
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {session.last_message}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {format(new Date(session.created_at), 'PPp')}
                </div>
              </div>
            </Button>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No chat sessions yet
          </div>
        )}
      </div>
    </div>
  );
} 