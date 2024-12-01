import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Agent } from '@/types/agents';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
    subscribeToAgentUpdates();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAgentUpdates = () => {
    const channel = supabase
      .channel('agents-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAgents(prev => [...prev, payload.new as Agent]);
          } else if (payload.eventType === 'UPDATE') {
            setAgents(prev =>
              prev.map(agent =>
                agent.id === payload.new.id ? payload.new : agent
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAgents(prev =>
              prev.filter(agent => agent.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map(agent => (
        <Card key={agent.id} className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={agent.avatar_url} />
              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-gray-500">{agent.role}</p>
            </div>
            <Badge
              variant={agent.status === 'online' ? 'success' : 'secondary'}
              className="ml-auto"
            >
              {agent.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
} 