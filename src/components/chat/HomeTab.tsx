import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Plus, AlertCircle, Newspaper } from 'lucide-react';
import HomeAgentList from './HomeAgentList';
import HomeChatSection from './HomeChatSection';
import HomeAnnouncements from './HomeAnnouncements';
import HomeFAQ from './HomeFAQ';
import { Card } from '@/components/ui/card';

interface Agent {
  id: string;
  name: string;
  status: string;
  avatar_url?: string;
  role?: string;
}

interface HomeTabProps {
  onStartChat: () => void;
  onConnectAgent: (agentId: string) => void;
  onClose?: () => void;
  announcements?: Array<{
    id: string;
    title: string;
    description: string;
    image_url?: string;
    link?: string;
  }>;
  agents: Agent[];
  setActiveTab: (tab: string) => void;
}

const HomeTab = ({
  onStartChat,
  onConnectAgent,
  onClose,
  announcements = [],
  agents,
  setActiveTab
}: HomeTabProps) => {
  const [showAIChat, setShowAIChat] = useState(false);

  const handleChatClick = () => {
    onStartChat();
    setActiveTab('messages');
  };

  const handleAnnouncementClick = (link?: string) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  console.log('HomeTab received agents:', agents);

  if (showAIChat) {
    return <HomeChatSection onBack={() => setShowAIChat(false)} />;
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Hero Section with Gradient */}
      <div className='relative px-6 py-8 bg-gradient-to-br from-rose-600 to-yellow-600 text-white rounded-xl'>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex flex-col items-start gap-6'>
            <img
              src='/logo.jpg'
              alt='Logo'
              className='h-16 w-16 rounded-full object-cover'
            />
            <div>
              <h1 className='text-2xl font-semibold mb-2'>Hello there.</h1>
              <h2 className='text-3xl font-bold'>How can we help?</h2>
            </div>
          </div>
          {onClose && (
            <Button
              variant='ghost'
              size='icon'
              className='text-white'
              onClick={onClose}
            >
              <X className='h-6 w-6' />
            </Button>
          )}
        </div>
      </div>
      <div className='py-4 space-y-4'>
        <Button
          onClick={handleChatClick}
          className='w-full bg-gradient-to-bl from-rose-600 to-yellow-600 text-white flex items-center justify-center gap-2 py-6 rounded-xl shadow-lg transition-all duration-200'
        >
          <span className='font-medium text-base'>Chat with AI</span>
        </Button>
      </div>
      {/* Content Section */}
      <div className='flex-1 overflow-y-auto py-6 space-y-8'>
        {/* Recent Updates Section */}
        {announcements.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 px-4'>
              Recent Updates
            </h3>
            <div className='grid grid-cols-1 gap-4'>
              {announcements.slice(0, 12).map((announcement) => (
                <Card
                  key={announcement.id}
                  className='overflow-hidden hover:shadow-md transition-shadow cursor-pointer'
                  onClick={() => handleAnnouncementClick(announcement.link)}
                >
                  {announcement.image_url && (
                    <div className='h-[320px] w-full overflow-hidden'>
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}
                  <div className='p-4'>
                    <h4 className='font-semibold mb-2'>{announcement.title}</h4>
                    <p className='text-sm text-gray-500 line-clamp-2'>
                      {announcement.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <HomeFAQ />
      </div>
    </div>
  );
};

export { HomeTab };
