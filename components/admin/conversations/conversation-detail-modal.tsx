'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { AdminService } from '@/lib/services/admin-service';
import type { Message } from '@/types/admin';
import toast from 'react-hot-toast';

interface ConversationDetailModalProps {
  conversationId: string;
  onClose: () => void;
}

export function ConversationDetailModal({
  conversationId,
  onClose
}: ConversationDetailModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getConversationMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='text-lg font-semibold'>Conversation Details</h3>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {isLoading ? (
            <div className='flex justify-center items-center h-32'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            </div>
          ) : messages.length === 0 ? (
            <p className='text-center text-gray-500'>
              No messages in this conversation
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'assistant'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <p className='text-sm whitespace-pre-wrap'>
                    {message.content}
                  </p>
                  <span className='text-xs opacity-70 mt-1 block'>
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
