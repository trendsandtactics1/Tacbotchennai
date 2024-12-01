import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import UserNav from './UserNav';

interface AdminHeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export default function AdminHeader({
  onMenuClick,
  isMobile
}: AdminHeaderProps) {
  return (
    <header className='fixed top-0 right-0 left-0 h-16 bg-white border-b z-40'>
      <div className='h-full px-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onMenuClick}
            className='md:hidden'
          >
            <Menu className='h-5 w-5' />
          </Button>
          <div className='flex items-center gap-2'>
            <span className='text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500'>
              AI Chatbot
            </span>
          </div>
        </div>

        <UserNav />
      </div>
    </header>
  );
}
