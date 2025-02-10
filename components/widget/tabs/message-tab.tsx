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

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface MessageTabProps {
  onTabChange: (tab: string) => void;
}

export function MessageTab({ onTabChange }: MessageTabProps) {
  const [view, setView] = useState<'list' | 'registration' | 'chat'>('list');
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>('user-details', null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

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

  const handleNewChat = async () => {
    if (!userDetails) {
      setView('registration');
      return;
    }

    try {
      setIsLoading(true);
      const chat = await ChatService.createChat(userDetails.id);
      setCurrentChatId(chat.id);
      setMessages([
        {
          type: 'bot',
          content: "Hello! How can I assist you today?"
        }
      ]);
      setView('chat');

      const updatedHistory = await ChatService.getChatHistory(userDetails.id);
      setChatHistory(updatedHistory);
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast.error('Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentChatId || isSending) return;

    const messageContent = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', content: messageContent }]);

    try {
      // You can modify this part based on your backend API
      await ChatService.sendMessage(currentChatId, messageContent);
      
      // Optional: Add a simulated bot response
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "I've received your message. An agent will respond shortly."
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

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
            content: "Hello! How can I assist you today?"
          }
        ]);
        setView('chat');
        toast.success('Registration successful!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Registration form code remains the same */}
        </div>
      )}

      {/* Chat View */}
      {view === 'chat' && (
        <div className='flex flex-col h-full'>
          <div className='flex items-center gap-2 p-4 border-b'>
            <button onClick={handleBackToList}>
              <ArrowLeft size={20} />
            </button>
            <span className='text-sm font-medium'>Chat</span>
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
                    <Bot size={20} className='text-gray-600' />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className='text-[13px] leading-6'>{message.content}</p>
                </div>

                {message.type === 'user' && (
                  <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
                    <User size={20} className='text-gray-600' />
                  </div>
                )}
              </div>
            ))}

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

            <div ref={messagesEndRef} />
          </div>

          <div className='border-t bg-white p-2 sm:p-4'>
            <div className='flex gap-2 max-w-full'>
              <div className='flex-1 min-w-0'>
                <input
                  type='text'
                  placeholder='Type your message...'
                  className='w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
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
                className='shrink-0 bg-black text-white p-3 rounded-full hover:opacity-90 transition-colors disabled:opacity-50'
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
