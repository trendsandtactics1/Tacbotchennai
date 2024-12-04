'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminService } from '@/lib/services/admin-service';
import { Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import type { EnquiryMessage } from '@/types/admin';

interface EnquiryDetailProps {
  enquiryId: string | null;
  onStatusChange: () => Promise<void>;
}

export function EnquiryDetail({ enquiryId, onStatusChange }: EnquiryDetailProps) {
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!enquiryId) return;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await AdminService.getEnquiryMessages(enquiryId);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Subscribe to real-time updates for messages
    const messagesSubscription = supabase
      .channel(`enquiry-${enquiryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enquiry_messages',
          filter: `enquiry_id=eq.${enquiryId}`
        },
        async () => {
          // Immediately load new messages when changes occur
          const data = await AdminService.getEnquiryMessages(enquiryId);
          setMessages(data);
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [enquiryId]);

  const handleSendMessage = async () => {
    if (!enquiryId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await AdminService.sendEnquiryMessage(enquiryId, newMessage.trim());
      setNewMessage('');
      
      // Immediately fetch updated messages
      const updatedMessages = await AdminService.getEnquiryMessages(enquiryId);
      setMessages(updatedMessages);
      
      await onStatusChange();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!enquiryId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Select an enquiry to view details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_type === 'admin'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your reply..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 