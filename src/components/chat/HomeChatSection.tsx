import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeChatSectionProps {
  onBack: () => void;
}

const HomeChatSection = ({ onBack }: HomeChatSectionProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ content: string; isUser: boolean }[]>([
    {
      content:
        "Hi there, welcome to Intercom 👋 You are now speaking with Fin AI Agent. I can do much more than chatbots you've seen before. Tell me as much as you can about your question and I'll do my best to help you in an instant.",
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { content: message, isUser: true }]);
    setMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          content: 'I understand your question. Let me help you with that.',
          isUser: false
        }
      ]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* AI Chat Header */}
      <div className='flex items-center gap-4 p-4 border-b'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='text-gray-600'
        >
          <ChevronLeft className='h-5 w-5' />
        </Button>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-black rounded-lg flex items-center justify-center'>
            <MessageSquare className='h-5 w-5 text-white' />
          </div>
          <div>
            <h2 className='font-semibold'>Fin</h2>
            <p className='text-sm text-gray-500'>AI Agent answers instantly</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className='flex-1 p-4 overflow-y-auto space-y-4'>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn('flex', msg.isUser ? 'justify-end' : 'justify-start')}
          >
            {!msg.isUser && (
              <div className='w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0 mr-3'>
                <MessageSquare className='h-5 w-5 text-white' />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl p-3',
                msg.isUser
                  ? 'bg-black text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              )}
            >
              <p className='text-sm'>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0 mr-3'>
              <MessageSquare className='h-5 w-5 text-white' />
            </div>
            <div className='bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-3 max-w-[80%]'>
              <div className='flex space-x-2'>
                <div
                  className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className='p-4 border-t'>
        <div className='flex items-center gap-2 bg-gray-50 rounded-full p-1 pl-4'>
          <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder='Ask a question...'
            className='flex-1 bg-transparent border-none focus:outline-none text-sm'
          />
          <Button
            onClick={handleSendMessage}
            size='icon'
            className='rounded-full bg-black hover:bg-gray-800'
          >
            <MessageSquare className='h-4 w-4 text-white' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeChatSection;