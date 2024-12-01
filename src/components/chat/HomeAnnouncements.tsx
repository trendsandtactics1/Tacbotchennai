import { Card } from '@/components/ui/card';

interface HomeAnnouncementsProps {
  announcements: Array<{
    id: string;
    title: string;
    description: string;
    image_url?: string;
    link?: string;
  }>;
}

const HomeAnnouncements = ({ announcements }: HomeAnnouncementsProps) => {
  const recentAnnouncements = announcements.slice(0, 2);

  return (
    <div>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Recent Updates
      </h3>
      <div className='grid gap-4'>
        {recentAnnouncements.map((announcement) => (
          <Card
            key={announcement.id}
            className='p-4 hover:shadow-md transition-shadow duration-200'
          >
            {announcement.image_url && (
              <div className='relative w-full aspect-square mb-3'>
                <img
                  src={announcement.image_url}
                  alt={announcement.title}
                  className='absolute inset-0 w-full h-full object-cover rounded-md'
                />
              </div>
            )}
            <h4 className='font-semibold text-gray-800 mb-2'>
              {announcement.title}
            </h4>
            <p className='text-sm text-gray-600 line-clamp-2'>
              {announcement.description}
            </p>
            {announcement.link && (
              <a
                href={announcement.link}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block'
              >
                Learn more →
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeAnnouncements;
