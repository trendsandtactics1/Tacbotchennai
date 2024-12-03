'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { AdminService } from '@/lib/services/admin-service';
import toast from 'react-hot-toast';
import type { Message } from '@/types/admin';

interface ConversationDetailProps {
  conversationId: string | null;
  onClose: () => void;
}

export function ConversationDetail({
  conversationId,
  onClose
}: ConversationDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

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
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  if (!conversationId) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-gray-500'>
        <p>Select a conversation to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between p-4 border-b'>
        <h3 className='font-semibold'>Conversation Details</h3>
        <button
          onClick={onClose}
          className='p-1 hover:bg-gray-100 rounded-full'
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
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
              <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
              <span className='text-xs opacity-70 mt-1 block'>
                {new Date(message.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
