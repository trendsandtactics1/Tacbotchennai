// components/widget/tabs/enquiry-tab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
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

      const messages = await EnquiryService.getEnquiryMessages(enquiry.id);
      setMessages(messages);
      setCurrentEnquiryId(enquiry.id);
      setView('chat');
      setSubject('');
      setCurrentMessage('');

      // Refresh enquiries list
      await loadEnquiries();
      toast.success('Enquiry created successfully');
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
      const message = await EnquiryService.sendMessage(
        currentEnquiryId,
        messageContent,
        'user'
      );
      setMessages((prev) => [...prev, message]);

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
    try {
      setIsLoading(true);
      const messages = await EnquiryService.getEnquiryMessages(enquiryId);
      setMessages(messages);
      setCurrentEnquiryId(enquiryId);
      setView('chat');
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome View
  if (view === 'welcome') {
    return (
      <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
        <MessageSquare size={48} className='text-blue-500 mb-6' />
        <h2 className='text-2xl font-bold mb-4'>Talk to Our Support Team</h2>
        <p className='text-gray-600 mb-8'>
          Get instant help from our human support team. We&apos;re here to
          assist you with any questions or concerns.
        </p>
        <button
          onClick={() => setView(userDetails ? 'list' : 'registration')}
          className='bg-black text-white px-6 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors'
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
            <ArrowLeft size={20} />
          </button>
          <h2 className='text-lg font-semibold'>Get Started</h2>
        </div>

        <div className='flex flex-col items-center mb-8'>
          <div className='w-16 h-16 bg-black rounded-full mb-4 flex items-center justify-center'>
            <MessageSquare className='text-white' size={32} />
          </div>
          <h3 className='text-xl font-semibold mb-1'>
            Welcome to Human Support
          </h3>
          <p className='text-gray-600 text-center'>
            Connect with our support team for personalized assistance
          </p>

          <div className='flex justify-around w-full my-8'>
            <div className='text-center'>
              <MessageSquare size={24} className='mx-auto mb-2 text-blue-500' />
              <p className='text-sm'>Live Support</p>
            </div>
            <div className='text-center'>
              <Send size={24} className='mx-auto mb-2 text-blue-500' />
              <p className='text-sm'>Quick Response</p>
            </div>
            <div className='text-center'>
              <User size={24} className='mx-auto mb-2 text-blue-500' />
              <p className='text-sm'>Personal Touch</p>
            </div>
          </div>
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
            New Enquiry
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
                <div className='flex justify-between items-start'>
                  <h3 className='font-medium text-gray-900'>
                    {enquiry.subject}
                  </h3>
                  <span className='text-xs text-gray-500'>
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
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto p-4'>{/* Messages content */}</div>

      {/* Message input area - fixed at bottom */}
      <div className='border-t p-4 bg-white'>
        <div className='relative flex items-center gap-2'>
          <input
            type='text'
            placeholder='Type your message...'
            className='w-full rounded-full border border-gray-200 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent'
          />
          <button className='rounded-full bg-rose-600 p-2 text-white hover:bg-rose-700 transition'>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
