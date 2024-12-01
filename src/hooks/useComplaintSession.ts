import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ComplaintSession } from '@/types/complaints';

export function useComplaintSession(userId: string | null) {
  const [sessions, setSessions] = useState<ComplaintSession[]>([]);
  const [activeSession, setActiveSession] = useState<ComplaintSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadSessions();
      const unsubscribe = subscribeToSessionUpdates();
      return () => {
        unsubscribe();
      };
    }
  }, [userId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaint_sessions')
        .select(`
          *,
          user:users (
            name,
            mobile
          ),
          agent:agents (
            name,
            status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
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
    try {
      const { data, error } = await supabase
        .from('complaint_sessions')
        .insert([{
          user_id: userId,
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => [data, ...prev]);
      setActiveSession(data);
      return data.id;
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