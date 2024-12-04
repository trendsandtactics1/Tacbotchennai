'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '@/lib/services/admin-service';
import { Loader2, Send, X, User, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { EnquiryMessage, AdminEnquiry } from '@/types/admin';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface EnquiryDetailModalProps {
  enquiryId: string;
  onClose: () => void;
  onStatusChange: () => Promise<void>;
}

export function EnquiryDetailModal({
  enquiryId,
  onClose,
  onStatusChange
}: EnquiryDetailModalProps) {
  const [enquiry, setEnquiry] = useState<AdminEnquiry | null>(null);
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleStatusChange = async (status: 'pending' | 'active' | 'resolved') => {
    try {
      await AdminService.updateEnquiryStatus(enquiryId, status);
      await onStatusChange();
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    const loadEnquiryDetails = async () => {
      try {
        setIsLoading(true);
        const [enquiryData, messagesData] = await Promise.all([
          AdminService.getEnquiryById(enquiryId),
          AdminService.getEnquiryMessages(enquiryId)
        ]);
        setEnquiry(enquiryData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading enquiry details:', error);
        toast.error('Failed to load enquiry details');
      } finally {
        setIsLoading(false);
      }
    };

    loadEnquiryDetails();

    // Subscribe to real-time updates
    const subscription = supabase
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
          const messagesData = await AdminService.getEnquiryMessages(enquiryId);
          setMessages(messagesData);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [enquiryId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await AdminService.sendEnquiryMessage(enquiryId, newMessage.trim());
      setNewMessage('');
      await onStatusChange();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              {enquiry?.subject || 'Loading...'}
            </h3>
            {enquiry && (
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  {enquiry.users.name} • {enquiry.users.mobile}
                </p>
                <select
                  value={enquiry.status}
                  onChange={(e) => handleStatusChange(e.target.value as 'pending' | 'active' | 'resolved')}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-3 ${
                  message.sender_type === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.sender_type === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Image
                      src="/user-icon.png"
                      alt="User"
                      width={30}
                      height={30}
                    />
                  </div>
                )}

                <div
                  className={`flex flex-col ${
                    message.sender_type === 'user' ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender_type === 'user'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>

                {message.sender_type === 'admin' && (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Image
                      src="/admin.png"
                      alt="Admin"
                      width={30}
                      height={30}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your reply..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 