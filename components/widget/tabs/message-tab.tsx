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
  currentFlow: string;
}

interface Button {
  text: string;
  nextFlow: string;
}

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  buttons?: Button[];
}

interface MessageTabProps {
  onTabChange: (tab: string) => void;
}

export function MessageTab({ onTabChange }: MessageTabProps) {
  const [view, setView] = useState<'list' | 'registration' | 'chat'>('list');
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>('user-details', null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentFlow, setCurrentFlow] = useState('start');
  const [formData, setFormData] = useState({ name: '', mobile: '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
      const chat = chatHistory.find(c => c.id === chatId);
      
      setMessages(messages.map(msg => ({
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        buttons: msg.buttons
      })));
      
      setCurrentChatId(chatId);
      setCurrentFlow(chat?.currentFlow || 'start');
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
      setCurrentFlow('start');
      
      const welcomeFlow = {
        type: 'bot' as const,
        content: 'Welcome to TIPS Chennai! How can I assist you today?',
        buttons: [
          { text: 'Admission Information', nextFlow: 'admission' },
          { text: 'Fee Structure', nextFlow: 'fees' },
          { text: 'Campus Details', nextFlow: 'campus' },
          { text: 'Courses Offered', nextFlow: 'courses' }
        ]
      };
      
      setMessages([welcomeFlow]);
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

  const handleButtonClick = async (buttonText: string, nextFlow: string) => {
    if (!currentChatId || isSending) return;
    
    setCurrentMessage('');
    setIsSending(true);

    try {
      const { userMessage, aiMessage, nextFlow: newFlow } = await ChatService.sendMessage(
        currentChatId,
        buttonText,
        currentFlow
      );

      if (userMessage && aiMessage) {
        setMessages(prev => [
          ...prev,
          { type: 'user', content: userMessage.content },
          { 
            type: 'bot', 
            content: aiMessage.content,
            buttons: newFlow.buttons 
          }
        ]);
        setCurrentFlow(newFlow.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentChatId || isSending) return;

    const messageContent = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    try {
      const { userMessage, aiMessage, nextFlow: newFlow } = await ChatService.sendMessage(
        currentChatId,
        messageContent,
        currentFlow
      );

      if (userMessage && aiMessage) {
        setMessages(prev => [
          ...prev,
          { type: 'user', content: userMessage.content },
          { 
            type: 'bot', 
            content: aiMessage.content,
            buttons: newFlow.buttons 
          }
        ]);
        setCurrentFlow(newFlow.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Render message content including buttons
  const renderMessage = (message: ChatMessage) => (
    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
      message.type === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
    }`}>
      <p className='text-[13px] leading-6'>{message.content}</p>
      {message.type === 'bot' && message.buttons && (
        <div className='flex flex-wrap gap-2 mt-3'>
          {message.buttons.map((button, idx) => (
            <button
              key={idx}
              onClick={() => handleButtonClick(button.text, button.nextFlow)}
              className='px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              {button.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Rest of your component remains the same, just update the message rendering in the chat view
  return (
    <div className='flex flex-col h-full'>
      {/* List View */}
      {view === 'list' && (
        // ... existing list view code ...
      )}

      {/* Registration View */}
      {view === 'registration' && (
        // ... existing registration view code ...
      )}

      {/* Chat View */}
      {view === 'chat' && (
        <div className='flex flex-col h-full'>
          <div className='flex items-center gap-2 p-4 border-b'>
            <button onClick={handleBackToList}>
              <ArrowLeft size={20} />
            </button>
          </div>
          
          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {message.type === 'bot' && (
                  <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
                    <Bot size={20} className='text-gray-600' />
                  </div>
                )}

                {renderMessage(message)}

                {message.type === 'user' && (
                  <div className='w-8 h-8 rounded-full bg-black-100 flex items-center justify-center flex-shrink-0'>
                    <User size={20} className='text-black-500' />
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
              <input
                type='text'
                placeholder='Type your message...'
                className='flex-1 px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500'
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
              <button
                onClick={handleSendMessage}
                className='shrink-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors'
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
