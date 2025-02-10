'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, Loader2, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChatService } from '@/lib/services/chat-service';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

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
  options?: string[];
}

interface MessageTabProps {
  onTabChange: (tab: string) => void;
}

const MessageTab = ({ onTabChange }: MessageTabProps) => {
  const [view, setView] = useState<'list' | 'registration' | 'chat'>('list');
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>('user-details', null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    type: 'bot',
    content: 'Hello! How can I assist you today?',
    options: ['Product Information', 'Support', 'Pricing', 'Contact Us']
  };

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
          content: msg.content,
          options: msg.role === 'bot' ? initialMessage.options : undefined
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
      setMessages([initialMessage]);
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

  const handleOptionClick = async (option: string) => {
    if (!currentChatId || isSending) return;

    setIsSending(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: option }]);

    try {
      // Send message to backend
      await ChatService.sendMessage(currentChatId, option);
      
      // Generate bot response based on option
      let botResponse: Message = {
        type: 'bot',
        content: '',
        options: []
      };

      switch (option) {
        case 'Product Information':
          botResponse = {
            type: 'bot',
            content: 'What would you like to know about our products?',
            options: ['Features', 'Pricing Plans', 'Comparison', 'Back to Main Menu']
          };
          break;
        case 'Support':
          botResponse = {
            type: 'bot',
            content: 'What kind of support do you need?',
            options: ['Technical Help', 'Account Issues', 'Bug Report', 'Back to Main Menu']
          };
          break;
        case 'Pricing':
          botResponse = {
            type: 'bot',
            content: 'Choose a pricing category to learn more:',
            options: ['Basic Plan', 'Pro Plan', 'Enterprise Plan', 'Back to Main Menu']
          };
          break;
        case 'Contact Us':
          botResponse = {
            type: 'bot',
            content: 'How would you like to contact us?',
            options: ['Email', 'Phone', 'Live Chat', 'Back to Main Menu']
          };
          break;
        case 'Back to Main Menu':
          botResponse = initialMessage;
          break;
        default:
          botResponse = {
            type: 'bot',
            content: `Here's the information about ${option}. Would you like to know anything else?`,
            options: ['Back to Main Menu']
          };
      }

      setMessages(prev => [...prev, botResponse]);
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
        setMessages([initialMessage]);
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
          <form onSubmit={handleSubmitRegistration} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Name</label>
              <input
                type='text'
                required
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2'
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Mobile</label>
              <input
                type='tel'
                required
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2'
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
            <button
              type='submit'
              className='w-full bg-black text-white rounded-lg py-3 hover:opacity-90 transition-opacity disabled:opacity-50'
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader2 size={20} className='animate-spin' />
                  Registering...
                </span>
              ) : (
                'Register'
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

                <div className='flex flex-col gap-4 max-w-[85%]'>
                  <div
                    className={`rounded-2xl px-5 py-3 ${
                      message.type === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className='text-[13px] leading-6'>{message.content}</p>
                  </div>

                  {message.type === 'bot' && message.options && (
                    <div className='flex flex-wrap gap-2'>
                      {message.options.map((option, optionIndex) => (
                        <Button
                          key={optionIndex}
                          variant='outline'
                          size='sm'
                          onClick={() => handleOptionClick(option)}
                          className='text-sm'
                          disabled={isSending}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
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
        </div>
      )}
    </div>
  );
};

export default MessageTab;
