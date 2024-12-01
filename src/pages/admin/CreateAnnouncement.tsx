import { useNavigate } from 'react-router-dom';
import AnnouncementForm from '@/components/admin/announcements/AnnouncementForm';

export default function CreateAnnouncement() {
  const navigate = useNavigate();

  return (
    <div className='space-y-6 p-6 mt-16'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Create Announcement</h1>
      </div>

      <AnnouncementForm
        onSubmit={() => {
          navigate('/admin/announcements');
        }}
      />
    </div>
  );
}
