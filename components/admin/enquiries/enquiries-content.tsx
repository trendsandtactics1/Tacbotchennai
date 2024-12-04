'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AdminService } from '@/lib/services/admin-service';
import toast from 'react-hot-toast';
import type { AdminEnquiry } from '@/types/admin';
import { EnquiryList } from './enquiry-list';
import { EnquiryDetail } from './enquiry-detail';

export function EnquiriesContent() {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      enquiry.users.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      <EnquiryList
        enquiries={filteredEnquiries}
        selectedId={selectedEnquiryId}
        onSelect={setSelectedEnquiryId}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="flex-1">
        <EnquiryDetail
          enquiryId={selectedEnquiryId}
          onStatusChange={async () => {
            const data = await AdminService.getAdminEnquiries();
            setEnquiries(data);
          }}
        />
      </div>
    </div>
  );
}
