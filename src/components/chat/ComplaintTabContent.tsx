import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserRegistrationModal } from './UserRegistrationModal';
import { ComplaintHistory } from './ComplaintHistory';
import { ComplaintConversation } from './ComplaintConversation';
import { Plus, MessageSquare, Clock } from 'lucide-react';
import { useComplaintSession } from '@/hooks/useComplaintSession';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ComplaintTabContentProps {
  userId?: string;
}

export function ComplaintTabContent({ userId }: ComplaintTabContentProps) {
  const [showRegistration, setShowRegistration] = useState(!userId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
  
  const { createNewSession, sessions } = useComplaintSession(currentUserId || null);

  const handleRegistrationSuccess = async (userData: { name: string; mobile: string; userId: string }) => {
    setCurrentUserId(userData.userId);
    setShowRegistration(false);
    const session = await createNewSession();
    if (session) {
      setSelectedSessionId(session.id);
    }
  };

  const handleNewComplaint = async () => {
    if (!currentUserId) {
      setShowRegistration(true);
      return;
    }
    try {
      const session = await createNewSession();
      if (session) {
        setSelectedSessionId(session.id);
      }
    } catch (error) {
      console.error('Error creating new complaint:', error);
    }
  };

  if (showRegistration) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-lg">Contact Information</h2>
          <p className="text-sm text-gray-500">Please provide your details to continue</p>
        </div>
        <div className="flex-1 p-4">
          <UserRegistrationModal
            isOpen={true}
            onClose={() => setShowRegistration(false)}
            onSuccess={handleRegistrationSuccess}
            embedded={true}
          />
        </div>
      </div>
    );
  }

  if (selectedSessionId) {
    return (
      <ComplaintConversation
        sessionId={selectedSessionId}
        userId={currentUserId}
        onBack={() => setSelectedSessionId(null)}
      />
    );
  }

  const hasActiveComplaints = sessions.some(s => s.status === 'open' || s.status === 'pending');

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Your Complaints</h2>
          <Button 
            onClick={handleNewComplaint}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Complaints</p>
                <p className="text-lg font-semibold">
                  {sessions.filter(s => s.status === 'open' || s.status === 'pending').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-lg font-semibold">
                  {sessions.filter(s => s.status === 'resolved').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No complaints yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a new complaint to get started
            </p>
            <Button onClick={handleNewComplaint}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Complaint
            </Button>
          </Card>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-2">
            <div className="space-y-3 pb-4">
              <ComplaintHistory
                userId={currentUserId}
                onSelectSession={setSelectedSessionId}
              />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
} 