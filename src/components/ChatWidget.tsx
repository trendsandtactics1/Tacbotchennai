import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BotMessageSquare, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatHeader from './chat/ChatHeader';
import ChatContent from './chat/ChatContent';
import ChatInput from './chat/ChatInput';
import ChatNavigation from './chat/ChatNavigation';
import { useChat } from '@/hooks/useChat';
import ComplaintStatus from './chat/ComplaintStatus';
import { WidgetProvider, useWidget } from '@/contexts/WidgetContext';
import { useAnnouncementSubscription } from '@/hooks/useAnnouncementSubscription';

interface Agent {
  id: string;
  name: string;
  status: string;
  avatar_url?: string;
  role?: string;
}

interface ChatWidgetProps {
  standalone?: boolean;
}

function ChatWidgetContent({ standalone = false }: ChatWidgetProps) {
  const { isExpanded } = useWidget();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [announcements, setAnnouncements] = useState([]);
  const { toast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isMessagesView, setIsMessagesView] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(
    null
  );
  const [isComplaintStatus, setIsComplaintStatus] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem('chatUserId')
  );

  const {
    messages,
    isLoading,
    sessionId,
    sessions,
    loadSessionMessages,
    handleSend,
    handleStatusChange,
    setMessages,
    createNewSession,
    loadUserSessions
  } = useChat(userId);

  useEffect(() => {
    fetchAgents();
    fetchAnnouncements();
    debugCheckAgentsTable();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        localStorage.setItem('chatUserId', session.user.id);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        localStorage.setItem('chatUserId', session.user.id);
      } else {
        setUserId(null);
        localStorage.removeItem('chatUserId');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'online')
        .order('name');

      if (error) {
        throw error;
      }

      console.log('Fetched agents:', data);

      if (data) {
        setAgents(data);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agents. Please try again later.',
        variant: 'destructive'
      });
      setAgents([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive'
      });
    }
  };

  const debugCheckAgentsTable = async () => {
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('agents')
        .select('count');

      console.log('Table check:', tableCheck, tableError);

      const { data: allAgents, error: agentsError } = await supabase
        .from('agents')
        .select('*');

      console.log('All agents in table:', allAgents, agentsError);
    } catch (error) {
      console.error('Debug check failed:', error);
    }
  };

  const handleConnectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setActiveTab('complaint');
  };

  const handleStartChat = () => {
    if (!userId) {
      setShowRegistration(true);
      return;
    }
    handleNewChat();
  };

  const handleNewChat = async () => {
    if (!userId) return;
    const newSessionId = await createNewSession(userId);
    if (newSessionId) {
      setIsMessagesView(true);
      setActiveTab('messages');
    }
  };

  const handleRegistrationSuccess = (newUserId: string) => {
    setUserId(newUserId);
    setShowRegistration(false);
    handleNewChat();
  };

  const handleRegistrationBack = () => {
    setShowRegistration(false);
    setActiveTab('home');
  };

  const handleSelectSession = async (sessionId: string) => {
    setIsMessagesView(true);
    await loadSessionMessages(sessionId);
  };

  const handleBackToSessions = () => {
    setIsMessagesView(false);
    setMessages([]);
  };

  const handleMessageSend = (input: string) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Please register or sign in to send messages',
        variant: 'destructive'
      });
      setShowRegistration(true);
      return;
    }
    handleSend(input, userId);
  };

  const handleComplaintSubmitted = (complaintId: string) => {
    setActiveComplaintId(complaintId);
    setIsComplaintStatus(true);
  };

  const handleBackFromComplaintStatus = () => {
    setActiveComplaintId(null);
    setIsComplaintStatus(false);
    setActiveTab('complaint');
  };

  const handleAnnouncementUpdate = (announcement: any) => {
    if (announcement.active) {
      setAnnouncements(prev => {
        const exists = prev.some(a => a.id === announcement.id);
        if (exists) {
          return prev.map(a => 
            a.id === announcement.id ? announcement : a
          );
        }
        return [announcement, ...prev];
      });
    } else {
      setAnnouncements(prev => 
        prev.filter(a => a.id !== announcement.id)
      );
    }
  };

  const handleAnnouncementDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  useAnnouncementSubscription(
    handleAnnouncementUpdate,
    handleAnnouncementDelete
  );

  return (
    <div
      className={`
        ${
          standalone
            ? 'h-full w-full rounded-none'
            : 'fixed bottom-3 right-3 lg:bottom-6 lg:right-6'
        }
        ${isOpen ? 'inset-0 z-50 lg:inset-auto' : ''}
      `}
    >
      {isOpen ? (
        <div ref={chatRef} className='w-full h-full'>
          <Card
            className={`
              w-full h-full
              ${!standalone ? 'fixed lg:relative' : ''}
              ${
                isExpanded
                  ? 'lg:w-[700px] lg:h-[700px]'
                  : 'lg:w-[380px] lg:h-[600px]'
              }
              flex flex-col shadow-xl bg-white overflow-hidden
              transition-all duration-300 ease-in-out
            `}
          >
            {isMessagesView || isComplaintStatus ? (
              <div className='flex flex-col h-full'>
                {isComplaintStatus && activeComplaintId ? (
                  <ComplaintStatus
                    sessionId={activeComplaintId}
                    onBack={handleBackFromComplaintStatus}
                  />
                ) : (
                  <>
                    <div className='flex items-center p-4 border-b'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleBackToSessions}
                        className='mr-2'
                      >
                        <ChevronLeft className='h-5 w-5' />
                      </Button>
                      <div>
                        <h2 className='font-semibold'>Chat</h2>
                        <p className='text-sm text-gray-500'>AI Assistant</p>
                      </div>
                    </div>
                    <div className='flex-1 overflow-hidden flex flex-col'>
                      <ChatContent
                        activeTab={activeTab}
                        messages={messages}
                        isLoading={isLoading}
                        onStartChat={handleStartChat}
                        isMessagesView={isMessagesView}
                        onBackToSessions={handleBackToSessions}
                        onConnectAgent={handleConnectAgent}
                        selectedAgentId={selectedAgentId}
                        onSelectSession={handleSelectSession}
                        announcements={announcements}
                        agents={agents}
                        setActiveTab={setActiveTab}
                        onClose={() => setIsOpen(false)}
                        onComplaintSubmitted={handleComplaintSubmitted}
                        userId={userId}
                        loadUserSessions={loadUserSessions}
                        showRegistration={showRegistration}
                        onRegistrationSuccess={handleRegistrationSuccess}
                        onRegistrationBack={handleRegistrationBack}
                        sessions={sessions || []}
                        loading={isLoading}
                      />
                      {isMessagesView && activeTab === 'messages' && (
                        <ChatInput
                          onSend={handleMessageSend}
                          isLoading={isLoading}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {activeTab !== 'home' && (
                  <ChatHeader
                    onClose={() => setIsOpen(false)}
                    onStatusChange={handleStatusChange}
                    showStatus={!!sessionId}
                    sessionId={sessionId}
                  />
                )}
                <div className='flex-1 overflow-hidden flex flex-col'>
                  <ChatContent
                    activeTab={activeTab}
                    messages={messages}
                    isLoading={isLoading}
                    onStartChat={handleStartChat}
                    isMessagesView={isMessagesView}
                    onBackToSessions={handleBackToSessions}
                    onConnectAgent={handleConnectAgent}
                    selectedAgentId={selectedAgentId}
                    onSelectSession={handleSelectSession}
                    announcements={announcements}
                    agents={agents}
                    setActiveTab={setActiveTab}
                    onClose={() => setIsOpen(false)}
                    onComplaintSubmitted={handleComplaintSubmitted}
                    userId={userId}
                    loadUserSessions={loadUserSessions}
                    showRegistration={showRegistration}
                    onRegistrationSuccess={handleRegistrationSuccess}
                    onRegistrationBack={handleRegistrationBack}
                    sessions={sessions || []}
                    loading={isLoading}
                  />
                </div>
                <ChatNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </>
            )}
          </Card>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className='rounded-full h-14 w-14 shadow-xl hover:shadow-2xl bg-black hover:bg-neutral-950 transition-colors flex items-center justify-center fixed bottom-4 right-4 lg:static'
        >
          <BotMessageSquare className='h-8 w-8 text-white' />
        </Button>
      )}
    </div>
  );
}

export default function ChatWidget({ standalone = false }: ChatWidgetProps) {
  return (
    <WidgetProvider>
      <ChatWidgetContent standalone={standalone} />
    </WidgetProvider>
  );
}
