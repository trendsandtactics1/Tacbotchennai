import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { ComplaintTable } from './ComplaintTable';
import { useToast } from '@/hooks/use-toast';
import type { ComplaintSession } from '@/types/complaints';
import { TablePagination } from '@/components/admin/common/TablePagination';

interface ComplaintListProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  onSelectComplaint: (id: string) => void;
}

export function ComplaintList({
  filter,
  onFilterChange,
  onSelectComplaint
}: ComplaintListProps) {
  const [sessions, setSessions] = useState<ComplaintSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadComplaints();
    const unsubscribe = subscribeToUpdates();
    return () => unsubscribe();
  }, [filter, currentPage, pageSize]);

  const loadComplaints = async () => {
    try {
      // First get total count
      const countQuery = supabase
        .from('complaint_sessions')
        .select('id', { count: 'exact' });

      if (filter !== 'all') {
        countQuery.eq('status', filter);
      }

      const { count, error: countError } = await countQuery;

      if (countError) throw countError;
      setTotalItems(count || 0);

      // Then get paginated data
      const query = supabase
        .from('complaint_sessions')
        .select(
          `
          *,
          user:users (
            name,
            mobile
          ),
          agent:agents (
            name,
            status
          ),
          conversations (
            id,
            message,
            sender,
            timestamp
          )
        `
        )
        .order('updated_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (filter !== 'all') {
        query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaints',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('admin-complaints')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_sessions'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions((prev) => [
              payload.new as unknown as ComplaintSession,
              ...prev
            ]);
          } else if (payload.eventType === 'UPDATE') {
            setSessions((prev) =>
              prev.map((session) =>
                session.id === payload.new.id
                  ? { ...session, ...payload.new }
                  : session
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Complaints</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Manage and respond to user complaints
        </p>
      </div>

      <div className='flex gap-2'>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size='sm'
          onClick={() => onFilterChange('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'open' ? 'default' : 'outline'}
          size='sm'
          onClick={() => onFilterChange('open')}
        >
          Open
        </Button>
        <Button
          variant={filter === 'resolved' ? 'default' : 'outline'}
          size='sm'
          onClick={() => onFilterChange('resolved')}
        >
          Resolved
        </Button>
        <Button
          variant={filter === 'closed' ? 'default' : 'outline'}
          size='sm'
          onClick={() => onFilterChange('closed')}
        >
          Closed
        </Button>
      </div>

      <div className='rounded-md border'>
        <ComplaintTable
          sessions={sessions}
          onSelectSession={onSelectComplaint}
        />

        <div className='border-t'>
          <TablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
