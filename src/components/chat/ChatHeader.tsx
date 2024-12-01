import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  onClose: () => void;
  onStatusChange?: (
    status: 'pending' | 'resolved' | 'closed',
    sessionId: string
  ) => void;
  showStatus?: boolean;
  sessionId?: string;
}

const ChatHeader = ({
  onClose,
  onStatusChange,
  showStatus = false,
  sessionId
}: ChatHeaderProps) => {
  const handleStatusChange = (status: 'pending' | 'resolved' | 'closed') => {
    if (onStatusChange && sessionId) {
      onStatusChange(status, sessionId);
    }
  };

  return (
    <div className='flex items-center justify-between rounded-t-xl p-4 border-b border-gray-100 bg-white'>
      <div className='flex items-center gap-4'>
        <div className='flex flex-col'>
          <h2 className='text-lg font-semibold'>TC Bot</h2>
          <p className='text-sm text-gray-500'>Answers Instantly</p>
        </div>
        {showStatus && onStatusChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                Online
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        )}
      </div>
      <Button
        variant='ghost'
        size='icon'
        onClick={onClose}
        className='hover:bg-gray-100'
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  );
};

export default ChatHeader;
