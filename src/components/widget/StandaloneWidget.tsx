import { useEffect, useState } from 'react';
import ChatWidget from '../ChatWidget';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChatContent from '../chat/ChatContent';

export default function StandaloneWidget() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMessagesView, setIsMessagesView] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Handle iframe communication if needed
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from parent window
      if (event.data.type === 'WIDGET_ACTION') {
        // Handle widget actions
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setIsMessagesView(false);
    }
  };

  const handleStartChat = () => {
    setIsMessagesView(true);
  };

  const handleBackToSessions = () => {
    setIsMessagesView(false);
  };

  const loadUserSessions = async () => {
    return [];
  };

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <div>
              <h1 className="font-semibold">Support</h1>
              <p className="text-xs text-gray-500">We're here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab !== 'home' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleTabChange('home')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {/* ... other header buttons ... */}
          </div>
        </div>

        <ChatContent
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          messages={messages}
          isLoading={isLoading}
          onStartChat={handleStartChat}
          isMessagesView={isMessagesView}
          onBackToSessions={handleBackToSessions}
          onConnectAgent={() => {}}
          selectedAgentId={null}
          onSelectSession={() => {}}
          announcements={[]}
          agents={[]}
          onClose={() => {}}
          userId={userId}
          loadUserSessions={loadUserSessions}
          showRegistration={false}
          onRegistrationSuccess={() => {}}
          onRegistrationBack={() => {}}
        />
      </div>
    </div>
  );
} 