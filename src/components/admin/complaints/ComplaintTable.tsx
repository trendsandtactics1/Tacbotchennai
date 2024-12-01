import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ComplaintSession } from "@/types/complaints";

interface ComplaintTableProps {
  sessions: ComplaintSession[];
  onSelectSession: (id: string) => void;
}

export function ComplaintTable({ sessions, onSelectSession }: ComplaintTableProps) {
  const getMessageCount = (session: ComplaintSession) => {
    return session.conversations?.length || 0;
  };

  const getLatestMessage = (session: ComplaintSession) => {
    if (!session.conversations?.length) return null;
    return session.conversations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Latest Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                No complaints found
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => {
              const latestMessage = getLatestMessage(session);
              return (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {format(new Date(session.created_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="text-sm text-gray-500">{session.user?.mobile}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] whitespace-pre-wrap">
                    {latestMessage?.message || "No messages"}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {getMessageCount(session)} messages
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectSession(session.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}