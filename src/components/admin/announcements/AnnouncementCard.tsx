import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  created_at: string;
}

type AnnouncementCardProps = {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
};

export default function AnnouncementCard({
  announcement,
  onEdit,
  onDelete
}: AnnouncementCardProps) {
  return (
    <Card className='flex flex-col h-[26rem] overflow-hidden'>
      {/* Image Container with fixed aspect ratio */}
      <div className='relative w-full pt-[56.25%]'>
        {' '}
        {/* 16:9 aspect ratio */}
        <div className='absolute inset-0 bg-gray-100 border-b'>
          {announcement.image_url ? (
            <div className='relative w-full h-full'>
              <img
                src={announcement.image_url}
                alt={announcement.title}
                className='absolute inset-0 w-full h-full object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                }}
              />
            </div>
          ) : (
            <div className='absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50'>
              <ImageIcon className='w-12 h-12' />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-col flex-1 p-4'>
        {/* Header */}
        <div className='flex items-start justify-between gap-2 mb-2'>
          <h3 className='font-semibold text-base line-clamp-1 flex-1'>
            {announcement.title}
          </h3>
          <div className='flex items-center text-xs text-gray-500 whitespace-nowrap shrink-0'>
            <Calendar className='h-3 w-3 mr-1 flex-shrink-0' />
            {format(new Date(announcement.created_at), 'MMM d, yyyy')}
          </div>
        </div>

        {/* Description */}
        <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
          {announcement.description}
        </p>

        {/* Link */}
        {announcement.link && (
          <a
            href={announcement.link}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center text-xs text-blue-600 hover:text-blue-700 mb-3'
          >
            <LinkIcon className='h-3 w-3 mr-1 flex-shrink-0' />
            View Link
          </a>
        )}

        {/* Actions */}
        <div className='flex items-center gap-2 border-t mt-auto'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-8 text-xs'
            onClick={() => onEdit(announcement)}
          >
            <Pencil className='h-3 w-3 mr-1.5 flex-shrink-0' />
            Edit
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-8 text-xs'
            onClick={() => onDelete(announcement.id)}
          >
            <Trash2 className='h-3 w-3 mr-1.5 flex-shrink-0' />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
