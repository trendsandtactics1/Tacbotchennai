// src/components/widget/tabs/message-tab.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, Loader2, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { supabase } from '@/lib/services/supabase-client';
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
  options?: Option[];
}

interface Option {
  label: string;
  action: string;
  nextFlow?: string;
}

// Predefined chat flows
const chatFlows = {
  initial: {
    message: "Welcome to TIPS Chennai! How can I assist you today?",
    options: [
      { label: "Admission Information", action: "ADMISSION", nextFlow: "admission" },
      { label: "Course Details", action: "COURSES", nextFlow: "courses" },
      { label: "Fee Structure", action: "FEES", nextFlow: "fees" },
      { label: "Contact Us", action: "CONTACT", nextFlow: "contact" }
    ]
  },
  admission: {
    message: "What would you like to know about admissions?",
    options: [
      { label: "Admission Process", action: "PROCESS", nextFlow: "admissionProcess" },
      { label: "Required Documents", action: "DOCUMENTS", nextFlow: "documents" },
      { label: "Apply Now", action: "APPLY", nextFlow: "apply" },
      { label: "Back to Main Menu", action: "MAIN", nextFlow: "initial" }
    ]
  },
  courses: {
    message: "Which course are you interested in?",
    options: [
      { label: "Engineering", action: "ENGINEERING", nextFlow: "engineering" },
      { label: "Management", action: "MANAGEMENT", nextFlow: "management" },
      { label: "Medical", action: "MEDICAL", nextFlow: "medical" },
      { label: "Back to Main Menu", action: "MAIN", nextFlow: "initial" }
    ]
  }
  // Add more flows as needed
};

export function MessageTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [view, setView] = useState<'list' | 'registration' | 'chat'>('list');
  const [userDetails, setUserDetails] = useLocalStorage<UserDetails | null>('user-details', null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentFlow, setCurrentFlow] = useState('initial');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save message to Supabase
  const saveMessageToSupabase = async (chatId: string, message: Message) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content: message.content,
          role: message.type,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    }
  };

  // Handle option selection
  const handleOptionSelect = async (option: Option) => {
    // Add user selection to messages
    const userMessage: Message = {
      type: 'user',
      content: option.label
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessageToSupabase(currentChatId!, userMessage);

    // Get next flow
    const nextFlow = chatFlows[option.nextFlow as keyof typeof chatFlows];
    if (nextFlow) {
      setCurrentFlow(option.nextFlow!);
      const botResponse: Message = {
        type: 'bot',
        content: nextFlow.message,
        options: nextFlow.options
      };
      
      setMessages(prev => [...prev, botResponse]);
      await saveMessageToSupabase(currentChatId!, botResponse);
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
      const { data: chat, error } = await supabase
        .from('chats')
        .insert({
          user_id: userDetails.id,
          title: 'New Conversation',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentChatId(chat.id);
      setCurrentFlow('initial');
      const initialMessage: Message = {
        type: 'bot',
        content: chatFlows.initial.message,
        options: chatFlows.initial.options
      };
      setMessages([initialMessage]);
      await saveMessageToSupabase(chat.id, initialMessage);
      setView('chat');

      // Refresh chat history
      loadChatHistory();
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast.error('Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    if (!userDetails?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userDetails.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChatHistory(data.map(chat => ({
        id: chat.id,
        title: chat.title,
        timestamp: new Date(chat.created_at).toLocaleString(),
        lastMessage: chat.last_message
      })));
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat View */}
      {view === 'chat' && (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-4 border-b">
            <button onClick={() => setView('list')}>
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold">Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={20} className="text-gray-600" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  message.type === 'user' ? 'bg-black text-white' : 'bg-gray-100'
                }`}>
                  <p className="text-[13px] leading-6">{message.content}</p>
                  
                  {message.type === 'bot' && message.options && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(option)}
                          className="px-4 py-2 text-sm bg-white text-black rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* List and Registration views remain the same */}
      {/* ... (keep the existing list and registration view code) */}
    </div>
  );
}
