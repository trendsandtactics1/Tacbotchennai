import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AgentCard } from '@/components/admin/agents/AgentCard';

interface Agent {
  id: string;
  name: string;
  status: string;
  is_admin: boolean;
  avatar_url?: string;
  role?: string;
  last_active?: string;
}

interface FilterOptions {
  search: string;
  status: 'all' | 'online' | 'offline';
  role: 'all' | 'admin' | 'agent';
}

export default function Agents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    role: 'all'
  });

  useEffect(() => {
    loadAgents();
  }, [filters]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('agents').select('*').order('name');

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.role === 'admin') {
        query = query.eq('is_admin', true);
      } else if (filters.role === 'agent') {
        query = query.eq('is_admin', false);
      }

      const { data, error } = await query;

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
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ is_admin: !agent.is_admin })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent status updated'
      });

      loadAgents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update agent status',
        variant: 'destructive'
      });
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ agent_id: null })
        .eq('agent_id', id);

      if (updateError) throw updateError;

      const { error } = await supabase.from('agents').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent deleted successfully'
      });

      loadAgents();
    } catch (error) {
      console.error('Error in deleteAgent:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete agent',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[200px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6 mt-16'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Agents</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage your AI agents and their permissions
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/agents/create')}
          className='w-full sm:w-auto'
        >
          <Plus className='h-4 w-4 mr-2' />
          Add New Agent
        </Button>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg border p-4 space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search agents...'
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className='pl-9 pr-10'
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value: 'all' | 'online' | 'offline') =>
              setFilters({ ...filters, status: value })
            }
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='online'>Online</SelectItem>
              <SelectItem value='offline'>Offline</SelectItem>
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select
            value={filters.role}
            onValueChange={(value: 'all' | 'admin' | 'agent') =>
              setFilters({ ...filters, role: value })
            }
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='admin'>Admins</SelectItem>
              <SelectItem value='agent'>Agents</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(filters.search ||
            filters.status !== 'all' ||
            filters.role !== 'all') && (
            <Button
              variant='outline'
              onClick={() =>
                setFilters({ search: '', status: 'all', role: 'all' })
              }
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {agents.length === 0 ? (
        <div className='bg-white rounded-lg border border-dashed p-8 text-center'>
          <h3 className='text-lg font-medium text-gray-900 mb-1'>
            No agents found
          </h3>
          <p className='text-sm text-gray-500 mb-4'>
            {filters.search ||
            filters.status !== 'all' ||
            filters.role !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first agent'}
          </p>
          <Button
            onClick={() => navigate('/admin/agents/create')}
            variant='outline'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add New Agent
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleAdmin={toggleAdminStatus}
              onDelete={deleteAgent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
