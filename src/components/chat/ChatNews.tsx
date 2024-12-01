import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
}

interface ChatNewsProps {
  announcements: Announcement[];
}

const ChatNews = ({ announcements = [] }) => {
  return (
    <div className='p-4 space-y-6'>
      {announcements.map((announcement) => (
        <Card
          key={announcement.id}
          className='overflow-hidden hover:shadow-md transition-shadow cursor-pointer'
          onClick={() => {
            if (announcement.link) {
              window.open(announcement.link, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          {announcement.image_url && (
            <div className='h-[220px] overflow-hidden'>
              <img
                src={announcement.image_url}
                alt={announcement.title}
                className='w-full h-full object-cover'
              />
            </div>
          )}
          <div className='p-6 space-y-4'>
            <h3 className='text-xl font-semibold'>{announcement.title}</h3>
            <p className='text-gray-600 leading-relaxed'>
              {announcement.description}
            </p>
            {announcement.link && (
              <div className='flex justify-end'>
                <span className='text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2'>
                  Learn More
                  <ArrowRight className='h-4 w-4' />
                </span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ChatNews;
