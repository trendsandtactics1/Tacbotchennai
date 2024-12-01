import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (input: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-100 bg-white">
      <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 pl-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message..."
          className="flex-1 bg-transparent border-none focus:outline-none text-gray-800"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          size="icon"
          className="rounded-full bg-black hover:bg-gray-800"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;