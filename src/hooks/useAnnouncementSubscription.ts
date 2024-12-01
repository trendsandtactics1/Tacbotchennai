import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Announcement = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  active: boolean;
  created_at: string;
};

export function useAnnouncementSubscription(
  onUpdate: (announcement: Announcement) => void,
  onDelete?: (id: string) => void
) {
  useEffect(() => {
    // Subscribe to changes in the announcements table
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        (payload: RealtimePostgresChangesPayload<Announcement>) => {
          if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old.id);
          } else if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate, onDelete]);
} 