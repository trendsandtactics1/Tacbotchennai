import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ChatSession } from '@/types/user';

export function useChatSessionSubscription(
  userId: string | null,
  onUpdate: (session: ChatSession) => void,
  onDelete?: (id: string) => void
) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`chat-sessions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<ChatSession>) => {
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate, onDelete]);
} 