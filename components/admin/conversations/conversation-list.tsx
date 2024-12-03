import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/types/admin';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-gray-500'>
        <p>No conversations found</p>
      </div>
    );
  }

  return (
    <div className='divide-y'>
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
            selectedId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className='flex justify-between items-start'>
            <div>
              <p className='font-medium text-gray-900'>
                {conversation.users.name}
              </p>
              {conversation.lastMessage && (
                <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                  {conversation.lastMessage}
                </p>
              )}
            </div>
            <span className='text-xs text-gray-500'>
              {formatDistanceToNow(new Date(conversation.updated_at), {
                addSuffix: true
              })}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
