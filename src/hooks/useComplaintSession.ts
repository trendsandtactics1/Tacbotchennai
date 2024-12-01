import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComplaintSession {
  id: string;
  user_id: string;
  agent_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useComplaintSession(userId: string | null) {
  const [sessions, setSessions] = useState<ComplaintSession[]>([]);
  const [activeSession, setActiveSession] = useState<ComplaintSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadSessions();
      subscribeToSessionUpdates();
    }
  }, [userId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('complaint_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data);
      
      // Set the most recent active session as current
      const activeSession = data.find(session => session.status === 'open');
      if (activeSession) {
        setActiveSession(activeSession);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaint sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    if (!userId) {
      console.error('Cannot create session without user ID');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('complaint_sessions')
        .insert({
          user_id: userId,
          status: 'open',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: 'Error',
          description: 'Failed to create new complaint session',
          variant: 'destructive'
        });
        return null;
      }

      if (!data) {
        throw new Error('Failed to create session');
      }

      setActiveSession(data);
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new complaint session',
        variant: 'destructive'
      });
      return null;
    }
  };

  const subscribeToSessionUpdates = () => {
    const channel = supabase
      .channel(`complaint_sessions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_sessions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSessions(prev => 
              prev.map(session => 
                session.id === payload.new.id ? payload.new : session
              )
            );
            if (activeSession?.id === payload.new.id) {
              setActiveSession(payload.new);
            }
          } else if (payload.eventType === 'INSERT') {
            setSessions(prev => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    sessions,
    activeSession,
    setActiveSession,
    createNewSession,
    loading,
    refresh: loadSessions
  };
} 