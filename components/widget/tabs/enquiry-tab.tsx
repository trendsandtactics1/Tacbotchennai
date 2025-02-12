// components/widget/tabs/enquiry-tab.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
  Plus,
  MessageSquare
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { EnquiryService } from '@/lib/services/enquiry-service';
import { ChatService } from '@/lib/services/chat-service';
import type {
  Enquiry,
  EnquiryMessage,
  UserDetails,
  ViewType
} from '@/types/enquiry';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export function EnquiryTab() {
  const [view, setView] = useState<ViewType>('welcome');
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>(
    'user-details',
    null
  );
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [currentEnquiryId, setCurrentEnquiryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadEnquiries = useCallback(async () => {
    if (!userDetails?.id) return;

    try {
      setIsLoading(true);
      const data = await EnquiryService.getEnquiries(userDetails.id);
      setEnquiries(data);
    } catch (error) {
      console.error('Error loading enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setIsLoading(false);
    }
  }, [userDetails?.id]);

  // Check user status and load enquiries on mount
  useEffect(() => {
    if (userDetails) {
      setView('list');
      loadEnquiries();
    }
  }, [userDetails, loadEnquiries]);

  // Handle registration
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await ChatService.createUser(formData.name, formData.mobile);

      if (user) {
        setUserDetails({
          id: user.id,
          name: user.name,
          mobile: user.mobile
        });
        setFormData({ name: '', mobile: '' });
        setView('list');
        toast.success('Registration successful!');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create new enquiry
 const handleCreateEnquiry = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!userDetails?.id || !subject.trim() || !currentMessage.trim()) return;

  setIsLoading(true);

  try {
    const enquiry = await EnquiryService.createEnquiry(
      userDetails.id,
      subject,
      currentMessage
    );

    // Immediately subscribe to real-time updates
    await loadEnquiryMessages(enquiry.id);

    // Reset fields and reload enquiries
    setSubject('');
    setCurrentMessage('');
    await loadEnquiries();
    toast.success('Enquiry created successfully!');
  } catch (error) {
    console.error('Error creating enquiry:', error);
    toast.error('Failed to create enquiry');
  } finally {
    setIsLoading(false);
  }
};

  // Handle send message
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentEnquiryId || isSending) return;

    const messageContent = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    try {
      await EnquiryService.sendMessage(currentEnquiryId, messageContent, 'user');
      const updatedMessages = await EnquiryService.getEnquiryMessages(
        currentEnquiryId
      );
      setMessages(updatedMessages);

      // Refresh enquiries list to update last message
      if (userDetails?.id) {
        await loadEnquiries();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setCurrentMessage(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  // Load enquiry messages
 const loadEnquiryMessages = async (enquiryId: string) => {
  setIsLoading(true);

  try {
    // Setup subscription before fetching messages
    const subscription = supabase
      .channel(`enquiry-messages-${enquiryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enquiry_messages',
          filter: `enquiry_id=eq.${enquiryId}`,
        },
        async () => {
          // Fetch the latest messages when an update occurs
          const updatedMessages = await EnquiryService.getEnquiryMessages(enquiryId);
          setMessages(updatedMessages);
        }
      )
      .subscribe();

    // Fetch initial messages
    const messages = await EnquiryService.getEnquiryMessages(enquiryId);
    setMessages(messages);
    setCurrentEnquiryId(enquiryId);
    setView('chat');

    // Return cleanup function to unsubscribe
    return () => subscription.unsubscribe();
  } catch (error) {
    console.error('Error loading messages:', error);
    toast.error('Failed to load messages');
  } finally {
    setIsLoading(false);
  }
};
  // Real-time subscription for enquiries
 useEffect(() => {
  if (!userDetails?.id) return;

  // Create subscription
  const subscription = supabase
    .channel(`user-enquiries-${userDetails.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'enquiries',
        filter: `user_id=eq.${userDetails.id}`,
      },
      () => {
        loadEnquiries(); // No need for `await` since we aren't handling the result here
      }
    )
    .subscribe();

  // Cleanup function
  return () => {
    subscription.unsubscribe(); // Synchronous cleanup
  };
}, [userDetails?.id, loadEnquiries]);

  // Auto-scroll to bottom of messages
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  // Welcome View
  if (view === 'welcome') {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <MessageSquare size={48} className='text-blue-500 mb-6' />
        <h2 className='text-xl font-bold mb-4'>Talk to Our Support Team</h2>
        <p className='text-gray-600 mb-8 text-base'>
          Get instant help from our human support team. We&apos;re here to
          assist you with any questions or concerns.
        </p>
        <button
          onClick={() => setView(userDetails ? 'list' : 'registration')}
          className='bg-black text-white px-6 py-3 text-base rounded-lg font-medium hover:bg-gray-800 transition-colors'
        >
          Talk to Human Support
        </button>
      </div>
    );
  }

  // Registration View
  if (view === 'registration') {
    return (
      <div className='flex flex-col h-full p-4'>
        <div className='flex items-center gap-2 mb-6'>
          <button
            onClick={() => setView('welcome')}
            className='hover:opacity-70 transition-opacity'
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className='text-base font-semibold'>Get Started</h2>
        </div>

        <div className='flex flex-col items-center mb-8'>
          <div className='w-16 h-16 bg-black rounded-full mb-4 flex items-center justify-center'>
            <MessageSquare className='text-white' size={32} />
          </div>
          <h3 className='text-xl font-semibold mb-1'>
            Welcome To Tips Connect
          </h3>
          <p className='text-gray-600 text-center text-base'>
            Connect with our support team for personalized assistance
          </p>
        </div>

        <form onSubmit={handleSubmitRegistration} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Name</label>
            <input
              type='text'
              required
              placeholder='Enter your name'
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Mobile Number
            </label>
            <input
              type='tel'
              required
              placeholder='Enter your mobile number'
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              value={formData.mobile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mobile: e.target.value }))
              }
              pattern='[0-9]{10}'
              maxLength={10}
              disabled={isLoading}
            />
          </div>
          <button
            type='submit'
            className='w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={
              isLoading ||
              !formData.name.trim() ||
              formData.mobile.length !== 10
            }
          >
            {isLoading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 size={20} className='animate-spin' />
                Registering...
              </span>
            ) : (
              'Start Chat'
            )}
          </button>
        </form>
      </div>
    );
  }

  // List View
  if (view === 'list') {
    return (
      <div className='flex flex-col h-full p-4'>
        <button
          onClick={() => setView('new')}
          className='w-full bg-black text-white rounded-lg py-4 mb-6 hover:opacity-90 transition-opacity'
        >
          <span className='flex items-center justify-center gap-2'>
            <Plus size={20} />
           Your Query
          </span>
        </button>

        {isLoading ? (
          <div className='flex justify-center items-center flex-1'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
          </div>
        ) : enquiries.length === 0 ? (
          <div className='flex flex-col items-center justify-center flex-1 text-gray-500'>
            <MessageSquare size={24} className='mb-2' />
            <p>No enquiries yet</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                onClick={() => loadEnquiryMessages(enquiry.id)}
                className='p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors'
              >
                <div className='flex justify-between gap-6 items-start'>
                  <h3 className='font-medium text-[14px] leading-6 text-gray-900 truncate'>
                    {enquiry.subject}
                  </h3>
                  <span className='text-xs text-gray-500 text-[13px] leading-6'>
                    {new Date(enquiry.created_at).toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between items-center mt-2'>
                  {enquiry.lastMessage && (
                    <p className='text-sm text-gray-500 truncate flex-1'>
                      {enquiry.lastMessage.content}
                    </p>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ml-2 ${
                      enquiry.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : enquiry.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {enquiry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // New Enquiry View
  if (view === 'new') {
    return (
      <div className='flex flex-col h-full p-4'>
        <div className='flex items-center gap-2 mb-6'>
          <button
            onClick={() => setView('list')}
            className='hover:opacity-70 transition-opacity'
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className='text-lg font-semibold'>New Enquiry</h2>
        </div>

        <form onSubmit={handleCreateEnquiry} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Subject</label>
            <input
              type='text'
              required
              placeholder='Enter enquiry subject'
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Message</label>
            <textarea
              required
              placeholder='Enter your message'
              rows={4}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none'
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type='submit'
            className='w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-colors disabled:opacity-50'
            disabled={isLoading || !subject.trim() || !currentMessage.trim()}
          >
            {isLoading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 size={20} className='animate-spin' />
                Creating enquiry...
              </span>
            ) : (
              'Submit Enquiry'
            )}
          </button>
        </form>
      </div>
    );
  }

  // Chat View
  return (
    <div className='flex flex-col h-full bg-gray-50'>
      {/* Header */}
      <div className='flex items-center gap-3 p-4 bg-white border-b shadow-sm'>
        <button
          onClick={() => setView('list')}
          className='hover:bg-gray-100 p-2 rounded-full transition-colors'
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className='font-semibold text-gray-900'>
            {enquiries.find((e) => e.id === currentEnquiryId)?.subject}
          </h2>
          <p className='text-sm text-gray-500'>
            {enquiries.find((e) => e.id === currentEnquiryId)?.status}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className='flex-1 overflow-y-auto p-4 space-y-6'
        ref={messagesContainerRef}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-3 ${
              message.sender_type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Admin Avatar - Only show for admin messages */}
            {message.sender_type === 'admin' && (
              <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
                <Image
                  src='/admin.png'
                  alt='User Icon'
                  width={30}
                  height={30}
                />
              </div>
            )}

            {/* Message Content */}
            <div
              className={`flex flex-col ${
                message.sender_type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[280px] rounded-2xl px-4 py-3 ${
                  message.sender_type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none ml-auto'
                    : 'bg-white text-gray-900 shadow-sm rounded-bl-none border'
                }`}
              >
                <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
              </div>
              <span className='text-xs text-gray-500 mt-1 px-1'>
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* User Avatar - Only show for user messages */}
            {message.sender_type === 'user' && (
              <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
                <Image
                  src='/user-icon.png'
                  alt='User Icon'
                  width={30}
                  height={30}
                />
              </div>
            )}
          </div>
        ))}

        {/* Loading State */}
        {isSending && (
          <div className='flex items-end gap-3'>
            <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
              <Image src='/admin.png' alt='User Icon' width={30} height={30} />
            </div>
            <div className='bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border'>
              <Loader2 className='w-5 h-5 animate-spin text-gray-400' />
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className='p-2 sm:p-4 bg-white border-t'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className='flex gap-2 max-w-full'
        >
          <input
            type='text'
            placeholder='Type your message...'
            className='w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            disabled={isSending}
          />
          <button
            type='submit'
            disabled={!currentMessage.trim() || isSending}
            className='shrink-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors'
          >
            {isSending ? (
              <Loader2 size={20} className='animate-spin' />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
