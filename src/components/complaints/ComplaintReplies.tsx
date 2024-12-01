import { useComplaintReplies } from '@/hooks/useComplaintReplies';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface ComplaintRepliesProps {
  complaintId: string;
  userId: string;
  isAdmin?: boolean;
}

export function ComplaintReplies({ complaintId, userId, isAdmin = false }: ComplaintRepliesProps) {
  const { replies, loading, addReply } = useComplaintReplies(complaintId);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addReply(message.trim(), userId, isAdmin);
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {replies.map(reply => (
          <div
            key={reply.id}
            className={`p-4 rounded-lg ${
              reply.is_admin ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">
                  {reply.user?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(reply.created_at), 'PPp')}
                </p>
              </div>
              {reply.is_admin && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Admin
                </span>
              )}
            </div>
            <p className="mt-2">{reply.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your reply..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reply'}
        </Button>
      </form>
    </div>
  );
} 