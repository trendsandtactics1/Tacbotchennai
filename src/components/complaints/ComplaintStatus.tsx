import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Complaint } from '@/types/complaints';
import { useComplaintSubscription } from '@/hooks/useComplaintSubscription';

interface ComplaintStatusProps {
  sessionId: string;
}

export function ComplaintStatus({ sessionId }: ComplaintStatusProps) {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  const handleComplaintUpdate = (updatedComplaint: Complaint) => {
    setComplaints(prevComplaints => {
      const index = prevComplaints.findIndex(c => c.id === updatedComplaint.id);
      if (index === -1) {
        return [...prevComplaints, updatedComplaint];
      }
      const newComplaints = [...prevComplaints];
      newComplaints[index] = updatedComplaint;
      return newComplaints;
    });
  };

  const handleComplaintDelete = (deletedId: string) => {
    setComplaints(prevComplaints => 
      prevComplaints.filter(complaint => complaint.id !== deletedId)
    );
  };

  useComplaintSubscription(sessionId, handleComplaintUpdate, handleComplaintDelete);

  useEffect(() => {
    loadComplaints();
  }, [sessionId]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          agent:agents (
            id,
            name
          ),
          conversations (
            id,
            message,
            sender,
            timestamp
          )
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedComplaints: Complaint[] = (data || []).map(complaint => ({
        ...complaint,
        message: complaint.user_message,
        conversation: complaint.conversations?.map(conv => ({
          id: conv.id,
          message: conv.message,
          sender: conv.sender as 'user' | 'agent',
          timestamp: conv.timestamp
        }))
      }));
      
      setComplaints(transformedComplaints);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaints',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No complaints found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't submitted any complaints yet
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Your Complaints</h2>

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card
            key={complaint.id}
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedComplaint(
              selectedComplaint === complaint.id ? null : complaint.id
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {complaint.agent?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{complaint.agent?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(complaint.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  complaint.status === 'resolved'
                    ? 'success'
                    : complaint.status === 'pending'
                    ? 'secondary'
                    : 'default'
                }
              >
                {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
              </Badge>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">{complaint.message}</p>
            </div>

            {selectedComplaint === complaint.id && complaint.conversation && (
              <div className="mt-6 pt-6 border-t space-y-4">
                {complaint.conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === 'user'
                          ? 'bg-blue-500 text-white ml-4'
                          : 'bg-gray-100 mr-4'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}