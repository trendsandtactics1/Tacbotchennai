'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminService } from '@/lib/services/admin-service';
import { Loader2, Search, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AdminEnquiry } from '@/types/admin';
import { EnquiryDetailModal } from './enquiry-detail-modal';

export function EnquiriesContent() {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadEnquiries = async () => {
      try {
        const data = await AdminService.getAdminEnquiries();
        setEnquiries(data);
      } catch (error) {
        console.error('Error loading enquiries:', error);
        toast.error('Failed to load enquiries');
      } finally {
        setIsLoading(false);
      }
    };

    loadEnquiries();

    // Subscribe to enquiries changes
    const enquiriesSubscription = supabase
      .channel('admin-enquiries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enquiries'
        },
        async () => {
          await loadEnquiries();
        }
      )
      .subscribe();

    // Subscribe to message changes
    const messagesSubscription = supabase
      .channel('admin-enquiry-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enquiry_messages'
        },
        async () => {
          await loadEnquiries();
        }
      )
      .subscribe();

    return () => {
      enquiriesSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, []);

  const filteredEnquiries = enquiries.filter(
    (enquiry) =>
      enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.users.mobile.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by subject, name, or mobile..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-500" />
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No enquiries found
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {enquiry.users.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {enquiry.users.mobile}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{enquiry.subject}</div>
                      {enquiry.messages[0] && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {enquiry.messages[0].content}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          enquiry.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : enquiry.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(enquiry.updated_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedEnquiryId(enquiry.id);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      {showModal && selectedEnquiryId && (
        <EnquiryDetailModal
          enquiryId={selectedEnquiryId}
          onClose={() => {
            setShowModal(false);
            setSelectedEnquiryId(null);
          }}
          onStatusChange={async () => {
            const data = await AdminService.getAdminEnquiries();
            setEnquiries(data);
          }}
        />
      )}
    </div>
  );
}
