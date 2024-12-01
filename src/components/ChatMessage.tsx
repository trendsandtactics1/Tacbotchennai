import { Bot, MessageSquare } from 'lucide-react';

interface ChatMessageProps {
  message: {
    content: string;
    isUser: boolean;
    timestamp?: Date;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) =>
      line.trim() ? (
        <p key={i} className='mb-2 last:mb-0'>
          {line}
        </p>
      ) : null
    );
  };

  return (
    <div className='overflow-y-auto'>
      <div
        className={`flex items-center ${
          message.isUser ? 'justify-end' : 'justify-start'
        } mb-4`}
      >
        {!message.isUser && (
          <div className='w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 mr-3'>
            <Bot className='h-5 w-5 text-white' />
          </div>
        )}
        <div
          className={`max-w-[80%] p-4 rounded-2xl ${
            message.isUser
              ? 'bg-blue-600 text-white font-semibold'
              : 'bg-gray-100 text-gray-900'
          } whitespace-pre-wrap leading-relaxed`}
        >
          <div
            className={`prose prose-sm max-w-none ${
              message.isUser ? 'prose-invert' : ''
            }`}
          >
            {formatContent(message.content)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
