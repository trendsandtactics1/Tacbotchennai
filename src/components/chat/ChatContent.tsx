import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  MessageSquare,
  Plus,
  ArrowLeft,
  Headset as HeadsetIcon
} from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import { HomeTab } from './HomeTab';
import ComplaintForm from './ComplaintForm';
import ChatSessions from './ChatSessions';
import ChatNews from './ChatNews';
import AgentList from './AgentList';
import ComplaintStatus from './ComplaintStatus';
import { useEffect, useRef } from 'react';
import { ComplaintHistoryList } from './ComplaintHistoryList';
import { ComplaintTabContent } from './ComplaintTabContent';
import { ChatSessionsList } from './ChatSessionsList';
import { UserRegistrationView } from './UserRegistrationView';
import { ChatSession } from '@/types/user';
import { ArticlesTab } from './ArticlesTab';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

interface ChatContentProps {
  activeTab: string;
  messages: ChatMessage[];
  isLoading: boolean;
  onStartChat: () => void;
  isMessagesView: boolean;
  onBackToSessions?: () => void;
  onConnectAgent: (agentId: string) => void;
  selectedAgentId?: string | null;
  onSelectSession?: (sessionId: string) => void;
  setActiveTab: (tab: string) => void;
  onClose?: () => void;
  announcements?: Array<{
    id: string;
    title: string;
    description: string;
    image_url?: string;
    link?: string;
  }>;
  agents?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  onComplaintSubmitted?: (complaintId: string) => void;
  selectedComplaintId?: string | null;
  onMessageSend?: (message: string) => void;
  userId: string | null;
  loadUserSessions: (userId: string) => Promise<ChatSession[]>;
  showRegistration: boolean;
  onRegistrationSuccess: (userId: string) => void;
  onRegistrationBack: () => void;
  sessions?: ChatSession[];
}

const ChatContent = ({
  activeTab,
  messages,
  isLoading,
  onStartChat,
  isMessagesView,
  onBackToSessions,
  onConnectAgent,
  selectedAgentId,
  onSelectSession,
  setActiveTab,
  onClose,
  announcements = [],
  agents = [],
  onComplaintSubmitted,
  selectedComplaintId,
  onMessageSend,
  userId,
  loadUserSessions,
  showRegistration,
  onRegistrationSuccess,
  onRegistrationBack,
  sessions = []
}: ChatContentProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleMessageSend = async (message: string) => {
    if (onMessageSend) {
      onMessageSend(message);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleComplaintSubmit = (complaintId: string) => {
    if (onComplaintSubmitted) {
      onComplaintSubmitted(complaintId);
    }
  };

  const handleBackFromComplaintStatus = () => {
    if (onComplaintSubmitted) {
      onComplaintSubmitted(null);
    }
    setActiveTab('complaint');
  };

  const handleBackFromComplaintForm = () => {
    setActiveTab('complaint');
    if (selectedAgentId) {
      onConnectAgent(null);
    }
  };

  const handleTalkToHuman = () => {
    setActiveTab('complaint');
    onBackToSessions();
  };

  const renderContent = () => {
    if (showRegistration) {
      return (
        <UserRegistrationView
          onSuccess={onRegistrationSuccess}
          onBack={onRegistrationBack}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <ScrollArea className='flex-1 p-4'>
            <HomeTab
              onStartChat={onStartChat}
              onConnectAgent={onConnectAgent}
              onClose={onClose}
              announcements={announcements}
              agents={agents}
              setActiveTab={setActiveTab}
            />
          </ScrollArea>
        );

      case 'news':
        return (
          <ScrollArea className='flex-1'>
            <ChatNews announcements={announcements} />
          </ScrollArea>
        );

      case 'complaint':
        return (
          <ScrollArea className='flex-1'>
            <div className='flex flex-col h-full w-full overflow-hidden'>
              {selectedComplaintId ? (
                <ComplaintStatus
                  sessionId={selectedComplaintId}
                  onBack={handleBackFromComplaintStatus}
                />
              ) : selectedAgentId ? (
                <div className='flex flex-col h-full'>
                  <div className='p-4 border-b flex items-center gap-3'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleBackFromComplaintForm}
                    >
                      <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div>
                      <h2 className='font-semibold'>Submit Complaint</h2>
                      <p className='text-sm text-gray-500'>
                        Fill in the details below
                      </p>
                    </div>
                  </div>
                  <ComplaintForm
                    agentId={selectedAgentId}
                    onSubmit={handleComplaintSubmit}
                  />
                </div>
              ) : (
                <ComplaintTabContent userId={userId} />
              )}
            </div>
          </ScrollArea>
        );

      case 'messages':
        if (!isMessagesView) {
          return (
            <ChatSessionsList
              sessions={sessions}
              onSelectSession={onSelectSession}
              onStartNewChat={onStartChat}
              loading={isLoading}
            />
          );
        }

        return (
          <div className='flex flex-col h-full relative'>
            <ScrollArea className='flex-1 w-full h-[calc(100vh-10rem)] sm:h-[500px]'>
              <div className='p-4'>
                <div className='space-y-4'>
                  {messages.map((message, index) => (
                    <div key={index} className='space-y-4'>
                      <ChatMessage key={index} message={message} />
                      {isLoading && index === messages.length - 1 && (
                        <div className='flex justify-start'>
                          <div className='bg-gray-100 text-gray-800 rounded-lg p-4 max-w-[80%]'>
                            <div className='flex space-x-2 items-center'>
                              <div
                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                style={{ animationDelay: '0ms' }}
                              />
                              <div
                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                style={{ animationDelay: '150ms' }}
                              />
                              <div
                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>

            <div className='absolute bottom-10 right-4 group'>
              <Button
                onClick={handleTalkToHuman}
                variant='outline'
                className='rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-gray-200 p-2 group-hover:p-3 group-hover:pr-6 overflow-hidden'
              >
                <HeadsetIcon className='w-5 h-5 text-gray-600' />
                <span className='max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300 ml-0 group-hover:ml-2'>
                  Talk to Human
                </span>
              </Button>
            </div>
          </div>
        );

      case 'articles':
        return <ArticlesTab />;

      default:
        return null;
    }
  };

  return <div className='h-full w-full flex flex-col'>{renderContent()}</div>;
};

export default ChatContent;
