import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComplaintSession } from '@/hooks/useComplaintSession';
import { Card } from '@/components/ui/card';

interface ComplaintHistoryProps {
  userId: string;
  onSelectSession: (sessionId: string) => void;
}

export function ComplaintHistory({ userId, onSelectSession }: ComplaintHistoryProps) {
  const { sessions, loading } = useComplaintSession(userId);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="p-4 cursor-pointer hover:border-gray-400 transition-all hover:shadow-sm"
          onClick={() => onSelectSession(session.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              {format(new Date(session.created_at), 'MMM d, yyyy h:mm a')}
            </p>
            <Badge 
              variant={
                session.status === 'resolved' 
                  ? 'success' 
                  : session.status === 'pending'
                  ? 'destructive'
                  : 'default'
              }
            >
              {session.status === 'pending' ? 'Needs Response' : session.status}
            </Badge>
          </div>
          {session.agent_id && (
            <p className="text-sm">
              Assigned to: <span className="font-medium">{session.agent?.name}</span>
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}