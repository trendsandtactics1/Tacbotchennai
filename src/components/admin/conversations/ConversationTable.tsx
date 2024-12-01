import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Conversation } from '@/types/conversations';

interface GroupedConversation {
  session_id: string;
  messages: Conversation[];
  latest_timestamp: string;
  status: string;
  agent?: {
    name: string;
    status: string;
  };
}

interface ConversationTableProps {
  conversations: Conversation[];
  onViewDetails: (id: string) => void;
}

export function ConversationTable({ conversations, onViewDetails }: ConversationTableProps) {
  const navigate = useNavigate();

  const getMessagePreview = (conversation: any) => {
    return conversation.message.length > 100
      ? `${conversation.message.substring(0, 100)}...`
      : conversation.message;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Date</TableHead>
            <TableHead className="font-mono">Session ID</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No conversations found
              </TableCell>
            </TableRow>
          ) : (
            conversations.map((conversation) => (
              <TableRow key={conversation.session_id}>
                <TableCell className="font-medium">
                  {format(new Date(conversation.timestamp), 'PPp')}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {conversation.session_id.slice(0, 8)}...
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {getMessagePreview(conversation)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(conversation.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 