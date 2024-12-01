import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ComplaintReply } from '@/types/complaints';

export function useComplaintReplies(complaintId: string) {
  const [replies, setReplies] = useState<ComplaintReply[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (complaintId) {
      loadReplies();
      const unsubscribe = subscribeToReplies();
      return () => {
        unsubscribe();
      };
    }
  }, [complaintId]);

  const loadReplies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaint_replies')
        .select(`
          *,
          user:users (
            name,
            mobile
          )
        `)
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading replies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load replies',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addReply = async (message: string, userId: string, isAdmin: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('complaint_replies')
        .insert([{
          complaint_id: complaintId,
          user_id: userId,
          message,
          is_admin: isAdmin
        }])
        .select(`
          *,
          user:users (
            name,
            mobile
          )
        `)
        .single();

      if (error) throw error;

      setReplies(prev => [...prev, data]);
      toast({
        title: 'Success',
        description: 'Reply added successfully'
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reply',
        variant: 'destructive'
      });
    }
  };

  const subscribeToReplies = () => {
    const channel = supabase
      .channel(`complaint-replies-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_replies',
          filter: `complaint_id=eq.${complaintId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the complete reply with user data
            const { data, error } = await supabase
              .from('complaint_replies')
              .select(`
                *,
                user:users (
                  name,
                  mobile
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              setReplies(prev => [...prev, data]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    replies,
    loading,
    addReply,
    refresh: loadReplies
  };
} 