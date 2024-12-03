'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { AdminService } from '@/lib/services/admin-service';
import type { Conversation } from '@/types/admin';
import toast from 'react-hot-toast';
import { ConversationDetailModal } from './conversation-detail-modal';
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns';

export function ConversationsContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadConversations();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRange, rowsPerPage]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesSearch =
        conversation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conversation.lastMessage?.toLowerCase() || '').includes(
          searchQuery.toLowerCase()
        );

      if (!matchesSearch) return false;

      if (dateRange) {
        const conversationDate = parseISO(conversation.updated_at);
        const selectedDate = parseISO(dateRange);
        return isWithinInterval(conversationDate, {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        });
      }

      return true;
    });
  }, [conversations, searchQuery, dateRange]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredConversations.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentConversations = filteredConversations.slice(
    startIndex,
    endIndex
  );

  const handleShowAll = () => {
    setSearchQuery('');
    setDateRange('');
    setCurrentPage(1);
  };

  return (
    <div className='space-y-4'>
      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Enter Session ID or message...'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <input
              type='date'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
          </div>
          <button
            onClick={() => setCurrentPage(1)}
            className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
          >
            Search
          </button>
          <button
            onClick={handleShowAll}
            className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
          >
            Show All
          </button>
        </div>
      </div>

      {/* Conversations Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Session ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Message
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className='px-6 py-4 text-center'>
                    <Loader2 className='h-6 w-6 animate-spin mx-auto text-gray-500' />
                  </td>
                </tr>
              ) : currentConversations.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    No conversations found
                  </td>
                </tr>
              ) : (
                currentConversations.map((conversation) => (
                  <tr key={conversation.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {format(
                        new Date(conversation.updated_at),
                        'MMM d, yyyy, h:mm a'
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {conversation.id.slice(0, 8)}...
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {conversation.lastMessage || 'No messages'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <button
                        onClick={() => setSelectedConversation(conversation.id)}
                        className='text-blue-500 hover:text-blue-700'
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='bg-white px-4 py-3 border-t border-gray-200 sm:px-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <span className='mr-2 text-sm text-gray-700'>Rows per page:</span>
              <select
                className='border rounded px-2 py-1'
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-700'>
                {filteredConversations.length > 0
                  ? `${startIndex + 1}-${Math.min(
                      endIndex,
                      filteredConversations.length
                    )} of ${filteredConversations.length}`
                  : '0 of 0'}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                &lt;
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className='px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <ConversationDetailModal
          conversationId={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}
