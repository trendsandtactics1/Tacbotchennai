import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Complaint, ComplaintStatus, ComplaintPriority } from '@/types/complaints';

export function useComplaint(complaintId?: string) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (complaintId) {
      loadComplaint();
      subscribeToComplaintUpdates();
    }
  }, [complaintId]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          user:users (
            id,
            name,
            mobile
          ),
          agent:agents (
            id,
            name,
            status
          ),
          admin_user:admin_profiles (
            user_id,
            name
          ),
          replies:complaints (
            *
          )
        `)
        .eq('id', complaintId)
        .single();

      if (error) throw error;
      setComplaint(data);
    } catch (error) {
      console.error('Error loading complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaint data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToComplaintUpdates = () => {
    const channel = supabase
      .channel(`complaint-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `id=eq.${complaintId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setComplaint(prev => ({
              ...prev,
              ...payload.new
            } as Complaint));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateComplaint = async (updates: Partial<Complaint>) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Complaint updated successfully'
      });
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to update complaint',
        variant: 'destructive'
      });
    }
  };

  const addReply = async (message: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .insert([{
          parent_id: complaintId,
          user_id: userId,
          session_id: complaint?.session_id,
          title: 'Reply',
          description: message,
          is_reply: true,
          status: 'pending'
        }]);

      if (error) throw error;

      // Update parent complaint
      await supabase
        .from('complaints')
        .update({
          reply_count: (complaint?.reply_count || 0) + 1,
          last_reply_at: new Date().toISOString(),
          has_unread_reply: true,
          reply_status: 'pending'
        })
        .eq('id', complaintId);

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

  return {
    complaint,
    loading,
    updateComplaint,
    addReply
  };
} 