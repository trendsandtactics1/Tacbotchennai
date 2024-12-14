// src/components/widget/tabs/message-tab.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, Loader2, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChatService } from '@/lib/services/chat-service';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface UserDetails {
  id: string;
  name: string;
  mobile: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  lastMessage?: string;
}

interface AIResponseSection {
  type: 'list' | 'text' | 'buttons';
  content: string | string[] | { transfer: boolean; continue: boolean };
}

const formatAIResponse = (content: string): AIResponseSection[] => {
  const sections = content.split('\n\n');
  return sections.map((section) => {
    if (section.includes('Keywords:')) {
      return {
        type: 'text',
        content: section
      };
    }
    if (section.includes('transfer-button')) {
      return {
        type: 'buttons',
        content: {
          transfer: true,
          continue: true
        }
      };
    }
    if (section.includes('•')) {
      return {
        type: 'list',
        content: section
          .split('•')
          .filter(Boolean)
          .map((item) => item.trim())
      };
    }
    return {
      type: 'text',
      content: section
    };
  });
};

interface MessageTabProps {
  onTabChange: (tab: string) => void;
}

export function MessageTab({ onTabChange }: MessageTabProps) {
  const [view, setView] = useState<'list' | 'registration' | 'chat'>('list');
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>(
    'user-details',
    null
  );
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [messages, setMessages] = useState<
    Array<{ type: 'user' | 'bot'; content: string }>
  >([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Add ref for message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add useEffect to scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]); // Scroll when messages change or when sending status changes

  // Load chat history when component mounts or user details change
  useEffect(() => {
    const loadHistory = async () => {
      if (userDetails?.id) {
        try {
          setIsLoading(true);
          const history = await ChatService.getChatHistory(userDetails.id);
          setChatHistory(history);
        } catch (error) {
          console.error('Error loading chat history:', error);
          toast.error('Failed to load chat history');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
  }, [userDetails?.id]);

  // Load chat messages
  const loadChatMessages = async (chatId: string) => {
    try {
      setIsLoading(true);
      const messages = await ChatService.getMessages(chatId);
      setMessages(
        messages.map((msg) => ({
          type: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content
        }))
      );
      setCurrentChatId(chatId);
      setView('chat');
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new chat
  const handleNewChat = async () => {
    if (!userDetails) {
      setView('registration');
      return;
    }

    setIsLoading(true);
    try {
      const chat = await ChatService.createChat(userDetails.id);
      setCurrentChatId(chat.id);
      setMessages([
        {
          type: 'bot',
          content:
            "Welcome to TIPS Connect! 🎉\n\nWe're excited to have you here! 😊 Whether you're looking for assistance, have questions, or just want to chat, I'm here to help.\n\nFeel free to ask me anything! How can I assist you today?"
        }
      ]);
      setView('chat');

      // Refresh chat history
      const updatedHistory = await ChatService.getChatHistory(userDetails.id);
      setChatHistory(updatedHistory);
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast.error('Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentChatId || isSending) return;

    const messageContent = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    try {
      const { userMessage, aiMessage } = await ChatService.sendMessage(
        currentChatId,
        messageContent
      );

      if (userMessage && aiMessage) {
        setMessages((prev) => [
          ...prev,
          { type: 'user', content: userMessage.content },
          { type: 'bot', content: aiMessage.content }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

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

        const chat = await ChatService.createChat(user.id);
        setCurrentChatId(chat.id);

        setMessages([
          {
            type: 'bot',
            content:
              "Welcome to TIPS Connect! 🎉\n\nWe're excited to have you here! 😊 Whether you're looking for assistance, have questions, or just want to chat, I'm here to help.\n\nFeel free to ask me anything! How can I assist you today?"
          }
        ]);

        setView('chat');
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

  // Handle back to list
  const handleBackToList = async () => {
    if (userDetails?.id) {
      try {
        const history = await ChatService.getChatHistory(userDetails.id);
        setChatHistory(history);
      } catch (error) {
        console.error('Error refreshing chat history:', error);
      }
    }
    setView('list');
  };

  return (
    <div className='flex flex-col h-full'>
      {/* List View */}
      {view === 'list' && (
        <div className='flex flex-col h-full p-4'>
          <button
            onClick={handleNewChat}
            className='w-full bg-black text-white rounded-lg py-4 mb-6 hover:opacity-90 transition-opacity disabled:opacity-50'
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 size={20} className='animate-spin' />
                Creating chat...
              </span>
            ) : (
              '+ New Chat'
            )}
          </button>

          {isLoading ? (
            <div className='flex justify-center items-center flex-1'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
            </div>
          ) : chatHistory.length === 0 ? (
            <div className='flex flex-col items-center justify-center flex-1 text-gray-500'>
              <Bot size={24} className='mb-2' />
              <p>No chat history yet</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChatMessages(chat.id)}
                  className='p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors'
                >
                  <div className='flex justify-between gap-6 items-start'>
                    <h3 className='font-medium text-[14px] leading-6 text-gray-900 truncate'>
                      {chat.title}
                    </h3>
                    <span className='text-xs text-gray-500 text-[13px] leading-6'>
                      {chat.timestamp}
                    </span>
                  </div>
                  {chat.lastMessage && (
                    <p className='text-sm text-gray-500 mt-1 truncate'>
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registration View */}
      {view === 'registration' && (
        <div className='flex flex-col h-full p-4'>
          <div className='flex items-center gap-2 mb-6'>
            <button
              onClick={() => setView('list')}
              className='hover:opacity-70 transition-opacity'
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className='text-base font-semibold'>Get Started</h2>
          </div>

          <div className='flex flex-col items-center mb-8'>
            <div className='w-16 h-16 bg-black rounded-full mb-4 flex items-center justify-center'>
              <Bot className='text-white' size={32} />
            </div>
            <h3 className='text-xl font-semibold mb-1'>
              Welcome To Tips Connect
            </h3>
            <p className='text-gray-600 text-center'>Replies Instantly</p>
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
                'Continue'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Chat View */}
      {view === 'chat' && (
        <div className='flex flex-col h-full'>
          <div className='flex items-center gap-2 p-4 border-b'>
            <button onClick={handleBackToList}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className='font-semibold'>Chat</h2>
              <p className='text-sm text-gray-500'>AI Assistant</p>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Icon - Only show for bot messages */}
                {message.type === 'bot' && (
                  <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
                    <Bot size={20} className='text-gray-600' />
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'user' ? (
                    <p className='text-[13px] leading-6'>{message.content}</p>
                  ) : (
                    <div className='space-y-5'>
                      {formatAIResponse(message.content).map(
                        (section: AIResponseSection, idx: number) => (
                          <div key={idx}>
                            {section.type === 'list' ? (
                              <ul className='space-y-3'>
                                {(section.content as string[]).map(
                                  (item: string, itemIdx: number) => (
                                    <li
                                      key={itemIdx}
                                      className='flex items-start gap-3'
                                    >
                                      <span className='text-black-500 mt-1'>
                                        •
                                      </span>
                                      <span className='text-[13px] leading-6'>
                                        {item}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : section.type === 'buttons' ? (
                              <div className='space-y-4'>
                                <div className='flex gap-3 mt-2'>
                                  <button
                                    onClick={() => {
                                      onTabChange('enquiry');
                                    }}
                                    className='px-2 py-2 text-[14px] font-semibold bg-black text-white rounded-lg hover:bg-black transition-colors'
                                  >
                                    Talk to Agent
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCurrentMessage('');
                                      setMessages((prev) => [
                                        ...prev,
                                        {
                                          type: 'bot',
                                          content:
                                            "I'll try my best to help you. Please rephrase your question or ask something else."
                                        }
                                      ]);
                                    }}
                                    className='px-2 py-2 text-[14px] font-semibold border border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors'
                                  >
                                    Continue Here
                                  </button>
                                </div>
                                <div className='flex flex-wrap gap-3'>
                                  <Link
                                    href='https://portal.tipsglobal.org/ParentHome/OnlineEnquiryForm'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='px-3 py-1 text-xs font-medium border border-rose-500 text-rose-600 rounded-full hover:bg-rose-100 transition-all'
                                  >
                                    ADMISSIONS
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <p className='text-[13px] text-black leading-6 tracking-wide'>
                                {(section.content as string)
                                  .split('\n')
                                  .map((line: string, i: number) => {
                                    if (line.trim().startsWith('Keywords:')) {
                                      return (
                                        <div key={i} className='mt-2 mb-3'>
                                          <span className='text-gray-500 text-xs'>
                                            Keywords:{' '}
                                          </span>
                                          {line
                                            .replace('Keywords:', '')
                                            .split('•')
                                            .map((keyword, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() =>
                                                  onTabChange('enquiry')
                                                }
                                                className='inline-block px-2 py-1 mx-1 text-xs font-medium bg-black-50 text-black-600 rounded-full hover:bg-black-100 transition-all cursor-pointer'
                                              >
                                                {keyword.trim()}
                                              </button>
                                            ))}
                                        </div>
                                      );
                                    }
                                    return (
                                      <span
                                        key={i}
                                        className='block mb-2 last:mb-0'
                                      >
                                        {line || <br />}
                                      </span>
                                    );
                                  })}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* User Icon - Only show for user messages */}
                {message.type === 'user' && (
                  <div className='w-8 h-8 rounded-full bg-black-100 flex items-center justify-center flex-shrink-0'>
                    <User size={20} className='text-black-500' />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator for sending message */}
            {isSending && (
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center'>
                  <Bot size={20} className='text-gray-600' />
                </div>
                <div className='bg-gray-100 rounded-2xl px-4 py-2.5'>
                  <Loader2 className='w-5 h-5 animate-spin text-gray-500' />
                </div>
              </div>
            )}

            {/* Add invisible div for scrolling */}
            <div ref={messagesEndRef} />
          </div>

          <div className='border-t bg-white p-2 sm:p-4'>
            <div className='flex gap-2 max-w-full'>
              <div className='flex-1 min-w-0'>
                <input
                  type='text'
                  placeholder='Type your message...'
                  className='w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-transparent'
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                />
              </div>
              <button
                onClick={handleSendMessage}
                className='shrink-0 bg-blue-500 text-white p-2 rounded-full hover:bg-black-600 transition-colors'
                aria-label='Send message'
                disabled={!currentMessage.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 size={20} className='animate-spin' />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
