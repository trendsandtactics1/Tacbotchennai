import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Complaint } from '@/types/complaints';

interface GroupedComplaintListProps {
  complaints: Complaint[];
  onSelectComplaint: (id: string) => void;
}

export function GroupedComplaintList({ complaints, onSelectComplaint }: GroupedComplaintListProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Group complaints by session_id
  const groupedComplaints = complaints.reduce((acc, complaint) => {
    const sessionId = complaint.session_id;
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(complaint);
    return acc;
  }, {} as Record<string, Complaint[]>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="default">
            <XCircle className="w-3 h-3 mr-1" />
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedComplaints).map(([sessionId, sessionComplaints]) => {
        // Sort complaints by date
        const sortedComplaints = [...sessionComplaints].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestComplaint = sortedComplaints[0];

        return (
          <Card key={sessionId} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    Agent: {latestComplaint.agent?.name || 'Unassigned'}
                  </p>
                  {getStatusBadge(latestComplaint.status)}
                </div>
                <p className="text-sm text-gray-500">
                  Session ID: {sessionId}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(latestComplaint.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGroup(selectedGroup === sessionId ? null : sessionId)}
                >
                  {selectedGroup === sessionId ? 'Hide Details' : 'View Details'}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onSelectComplaint(latestComplaint.id)}
                >
                  Reply
                </Button>
              </div>
            </div>

            {selectedGroup === sessionId && (
              <div className="mt-4 border-t pt-4">
                <div className="space-y-4">
                  {sortedComplaints.map((complaint) => (
                    <div key={complaint.id} className="border-b pb-4 last:border-b-0">
                      <p className="font-medium mb-2">User Message:</p>
                      <p className="text-gray-700">{complaint.user_message}</p>
                      {complaint.admin_reply && (
                        <>
                          <p className="font-medium mt-4 mb-2">Admin Reply:</p>
                          <p className="text-gray-700">{complaint.admin_reply}</p>
                        </>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {format(new Date(complaint.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}