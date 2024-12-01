import { Message } from '@/types/complaints';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ComplaintMessageListProps {
  messages: Message[];
}

export function ComplaintMessageList({ messages }: ComplaintMessageListProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'agent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              <p className="text-xs mt-1 opacity-70">
                {format(new Date(message.timestamp), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}