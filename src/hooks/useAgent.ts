import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Agent, AgentStatus } from '@/types/agents';

export function useAgent(agentId?: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (agentId) {
      loadAgent();
      subscribeToAgentUpdates();
    }
  }, [agentId]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (error) {
      console.error('Error loading agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agent data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAgentUpdates = () => {
    const channel = supabase
      .channel(`agent-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: `id=eq.${agentId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setAgent(payload.new as Agent);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateAgentStatus = async (status: AgentStatus) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent status updated successfully'
      });
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update agent status',
        variant: 'destructive'
      });
    }
  };

  const updateAgentProfile = async (updates: Partial<Agent>) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating agent profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update agent profile',
        variant: 'destructive'
      });
    }
  };

  return {
    agent,
    loading,
    updateAgentStatus,
    updateAgentProfile
  };
} 