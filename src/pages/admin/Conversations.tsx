import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConversationTable } from '@/components/admin/conversations/ConversationTable';
import {
  ConversationFilters,
  FilterOptions
} from '@/components/admin/conversations/ConversationFilters';
import { startOfDay, endOfDay } from 'date-fns';
import { TablePagination } from '@/components/admin/common/TablePagination';
import { Conversation } from '@/types/conversations';

export default function Conversations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>({
    sessionId: '',
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  useEffect(() => {
    loadConversations();
  }, [filters, currentPage, pageSize]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);

      // First get unique session IDs with their latest message
      const { data: uniqueSessions, error: sessionError } = await supabase
        .from('conversations')
        .select(
          `
          session_id,
          timestamp,
          status
        `
        )
        .order('timestamp', { ascending: false });

      if (sessionError) throw sessionError;

      // Get unique session IDs
      const uniqueSessionIds = Array.from(
        new Set(uniqueSessions?.map((s) => s.session_id) || [])
      );

      // Then get the latest message for each session
      let query = supabase
        .from('conversations')
        .select(
          `
          *,
          agent:agents (
            name,
            status
          )
        `
        )
        .in('session_id', uniqueSessionIds)
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters.sessionId.trim()) {
        query = query.eq('session_id', filters.sessionId.trim());
      }
      if (filters.dateRange.from) {
        query = query.gte(
          'timestamp',
          startOfDay(filters.dateRange.from).toISOString()
        );
      }
      if (filters.dateRange.to) {
        query = query.lte(
          'timestamp',
          endOfDay(filters.dateRange.to).toISOString()
        );
      }

      const { data: conversations, error } = await query;

      if (error) throw error;

      // Group conversations by session_id and take only the latest message
      const groupedConversations = uniqueSessionIds
        .map((sessionId) => {
          const sessionMessages =
            conversations?.filter((c) => c.session_id === sessionId) || [];
          return sessionMessages[0]; // Take the latest message (they're already ordered by timestamp)
        })
        .filter(Boolean);

      setTotalItems(groupedConversations.length);

      // Apply pagination to the grouped results
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setConversations(groupedConversations.slice(start, end));
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const handleResetFilters = () => {
    setFilters({
      sessionId: '',
      dateRange: {
        from: undefined,
        to: undefined
      }
    });
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/conversations/${id}`);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[200px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className='space-y-4 md:space-y-6 mt-16'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <h1 className='text-2xl font-semibold'>Conversations</h1>
      </div>

      <ConversationFilters
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <div className='bg-white rounded-lg border'>
        <ConversationTable
          conversations={conversations}
          onViewDetails={handleViewDetails}
        />

        <div className='border-t p-4'>
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
