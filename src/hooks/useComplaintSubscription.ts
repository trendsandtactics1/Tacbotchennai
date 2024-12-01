import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Complaint } from '@/types/complaints';

export function useComplaintSubscription(
  sessionId: string | null,
  onUpdate: (complaint: Complaint) => void,
  onDelete?: (id: string) => void
) {
  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to changes in the complaints table
    const subscription = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: sessionId ? `session_id=eq.${sessionId}` : undefined,
        },
        (payload) => {
          if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old.id);
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const complaint = payload.new as Complaint;
            onUpdate(complaint);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId, onUpdate, onDelete]);
}