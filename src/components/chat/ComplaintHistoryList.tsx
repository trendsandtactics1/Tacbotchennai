import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Eye, Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ComplaintHistoryListProps {
  onViewStatus: (complaintId: string) => void;
}

export function ComplaintHistoryList({ onViewStatus }: ComplaintHistoryListProps) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          agent:agents (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, hasNewReply: boolean) => {
    const baseClasses = 'inline-flex items-center gap-1';
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="secondary" className={`${baseClasses} bg-green-100 text-green-800`}>
            {hasNewReply && <Bell className="w-3 h-3 animate-pulse" />}
            Resolved
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className={baseClasses}>
            {status}
          </Badge>
        );
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="border rounded-lg p-4 space-y-3 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium line-clamp-2">{complaint.user_message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(complaint.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              {getStatusBadge(complaint.status, complaint.has_new_reply)}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-gray-500">
                Agent: {complaint.agent?.name || 'Unassigned'}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewStatus(complaint.id)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                View Status
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
