import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Article } from '@/types/articles';

export function useArticleSubscription(
  onUpdate: (article: Article) => void,
  onDelete?: (id: string) => void,
  publishedOnly: boolean = false
) {
  useEffect(() => {
    const channel = supabase
      .channel('articles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles',
          filter: publishedOnly ? 'published=eq.true' : undefined
        },
        (payload: RealtimePostgresChangesPayload<Article>) => {
          if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old.id);
          } else if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            // Only send published articles if publishedOnly is true
            if (!publishedOnly || payload.new.published) {
              onUpdate(payload.new);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate, onDelete, publishedOnly]);
} 