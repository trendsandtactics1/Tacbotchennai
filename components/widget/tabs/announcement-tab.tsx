'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AnnouncementService } from '@/lib/services/announcement-service';
import type { Announcement } from '@/types/announcement';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export function AnnouncementTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await AnnouncementService.getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load announcements';
        console.error('Error loading announcements:', error);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='w-8 h-8 animate-spin text-gray-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
        <p className='text-red-500 mb-2'>Failed to load announcements</p>
        <p className='text-sm text-gray-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      <h2 className='text-xl font-semibold text-gray-800'>Announcements</h2>
      {announcements.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8 text-gray-500'>
          <p>No announcements available</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className='bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300'
            >
              {announcement.image_url && (
                <div className='relative mb-3 rounded-lg overflow-hidden h-48'>
                  <Image
                    src={announcement.image_url}
                    alt={announcement.title}
                    fill
                    className='object-cover'
                  />
                </div>
              )}
              <h3 className='font-medium text-gray-900'>
                {announcement.title}
              </h3>
              <p className='text-sm text-gray-600 mt-1'>
                {announcement.description}
              </p>
              {announcement.link && (
                <Link
                  href={announcement.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 text-sm hover:underline inline-block mt-2'
                >
                  Learn more
                </Link>
              )}
              <span className='text-xs text-gray-400 mt-2 block'>
                {new Date(announcement.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
