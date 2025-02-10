import React, { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  type: 'user' | 'bot';
  content: string;
  options?: string[];
}

const ButtonChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    type: 'bot',
    content: 'Hello! How can I help you today?',
    options: ['Product Information', 'Support', 'Pricing', 'Contact Us']
  };

  useEffect(() => {
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = async (option: string) => {
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: option }]);

    // Simulate response delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add bot response based on selected option
    let botResponse: Message = {
      type: 'bot',
      content: '',
      options: []
    };

    switch (option) {
      case 'Product Information':
        botResponse = {
          type: 'bot',
          content: 'What would you like to know about our products?',
          options: ['Features', 'Pricing Plans', 'Comparison', 'Back to Main Menu']
        };
        break;
      case 'Support':
        botResponse = {
          type: 'bot',
          content: 'What kind of support do you need?',
          options: ['Technical Help', 'Account Issues', 'Bug Report', 'Back to Main Menu']
        };
        break;
      case 'Pricing':
        botResponse = {
          type: 'bot',
          content: 'Choose a pricing category to learn more:',
          options: ['Basic Plan', 'Pro Plan', 'Enterprise Plan', 'Back to Main Menu']
        };
        break;
      case 'Contact Us':
        botResponse = {
          type: 'bot',
          content: 'How would you like to contact us?',
          options: ['Email', 'Phone', 'Live Chat', 'Back to Main Menu']
        };
        break;
      case 'Back to Main Menu':
        botResponse = initialMessage;
        break;
      default:
        botResponse = {
          type: 'bot',
          content: `Here's the information about ${option}. Would you like to know anything else?`,
          options: ['Back to Main Menu']
        };
    }

    setMessages(prev => [...prev, botResponse]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-gray-600" />
              </div>
            )}

            <div className="flex flex-col gap-4 max-w-[85%]">
              <div
                className={`rounded-2xl px-5 py-3 ${
                  message.type === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-[13px] leading-6">{message.content}</p>
              </div>

              {message.type === 'bot' && message.options && (
                <div className="flex flex-wrap gap-2">
                  {message.options.map((option, optionIndex) => (
                    <Button
                      key={optionIndex}
                      variant="outline"
                      size="sm"
                      onClick={() => handleOptionClick(option)}
                      className="text-sm"
                      disabled={isLoading}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot size={20} className="text-gray-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ButtonChatbot;
