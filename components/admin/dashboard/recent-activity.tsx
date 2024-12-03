'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { AdminService } from '@/lib/services/admin-service';
import type { RecentActivity as RecentActivityType } from '@/types/admin';
import toast from 'react-hot-toast';

export function RecentActivity() {
  const [activity, setActivity] = useState<RecentActivityType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await AdminService.getRecentActivity();
        setActivity(data);
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setError('Failed to load recent activity');
        toast.error('Failed to load recent activity');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, []);

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex justify-center items-center min-h-[200px]'>
          <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center text-gray-500'>
          <p className='mb-2'>{error || 'Failed to load recent activity'}</p>
          <button
            onClick={() => window.location.reload()}
            className='text-blue-500 hover:text-blue-600 underline'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Recent Activity</h3>
        {activity.recentEnquiries.length === 0 &&
        activity.recentChats.length === 0 ? (
          <div className='text-center text-gray-500 py-8'>
            No recent activity
          </div>
        ) : (
          <div className='space-y-4'>
            {activity.recentEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
              >
                <div>
                  <p className='font-medium'>{enquiry.subject}</p>
                  <p className='text-sm text-gray-600'>
                    by {enquiry.users.name}
                  </p>
                </div>
                <div>
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
                  <p className='text-xs text-gray-500 mt-1'>
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {activity.recentChats.map((chat) => (
              <div
                key={chat.id}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <MessageCircle className='h-5 w-5 text-gray-400' />
                  <div>
                    <p className='font-medium'>New Chat Session</p>
                    <p className='text-sm text-gray-600'>
                      by {chat.users.name}
                    </p>
                  </div>
                </div>
                <p className='text-xs text-gray-500'>
                  {new Date(chat.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
