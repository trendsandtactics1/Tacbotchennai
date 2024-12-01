import { User, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  status: string;
  avatar_url?: string;
  role?: string;
}

interface HomeAgentListProps {
  agents: Agent[];
  onConnectAgent: (agentId: string) => void;
}

const HomeAgentList = ({ agents: initialAgents, onConnectAgent }: HomeAgentListProps) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
    const unsubscribe = subscribeToAgents();
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchAgents = async () => {
    try {
      console.log('Fetching agents...');
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'online');

      if (error) {
        console.error('Error fetching agents:', error);
        throw error;
      }

      if (data) {
        console.log('Fetched agents:', data);
        setAgents(data);
      }
    } catch (error) {
      console.error('Error in fetchAgents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available agents',
        variant: 'destructive',
      });
    }
  };

  const subscribeToAgents = () => {
    const channel = supabase
      .channel('home_agents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          fetchAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (!Array.isArray(agents) || agents.length === 0) {
    return (
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold text-gray-900'>AI Agents</h3>
        <Card className='p-6 bg-gray-50 border border-gray-100'>
          <p className='text-gray-500 text-center'>
            No agents available at the moment
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-semibold text-gray-900'>
        Available AI Agents
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
        {agents.map((agent) => (
          <Card
            key={agent.id}
            onClick={() => onConnectAgent(agent.id)}
            className='group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary/20 bg-white hover:bg-gray-50/50'
          >
            <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <div className='absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top' />
            <div className='relative p-5'>
              <div className='flex items-start gap-4'>
                <Avatar className='h-14 w-14 ring-4 ring-primary/5 group-hover:ring-primary/10 transition-all duration-300'>
                  {agent.avatar_url ? (
                    <AvatarImage
                      src={agent.avatar_url}
                      alt={agent.name}
                      className='object-cover'
                    />
                  ) : (
                    <AvatarFallback className='bg-primary/10 text-primary'>
                      {agent.name?.[0] || 'AI'}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-semibold text-lg text-gray-900 truncate'>
                      {agent.name || 'AI Agent'}
                    </h4>
                  </div>

                  <div className='mt-2 flex items-center gap-2'>
                    <span className='relative flex h-2.5 w-2.5'>
                      <span className='absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping' />
                      <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500' />
                    </span>
                    <p className='text-sm text-gray-600'>
                      {agent.role || 'Available Now'}
                    </p>
                  </div>

                  {agent.role && (
                    <p className='mt-2 text-sm text-gray-500 line-clamp-2'>
                      Specialized in {agent.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeAgentList;