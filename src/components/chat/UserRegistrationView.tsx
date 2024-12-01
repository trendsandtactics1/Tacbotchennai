import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Phone, Bot, MessageSquare, Sparkles } from 'lucide-react';

interface UserRegistrationViewProps {
  onSuccess: (userId: string) => void;
  onBack: () => void;
}

export function UserRegistrationView({ onSuccess, onBack }: UserRegistrationViewProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const features = [
    {
      icon: <Bot className="w-4 h-4" />,
      text: "24/7 AI Assistant"
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      text: "Instant Responses"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      text: "Smart Solutions"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('mobile', mobile)
        .single();

      if (existingUser) {
        // User exists, return existing ID
        localStorage.setItem('chatUserId', existingUser.id);
        localStorage.setItem('chatUserMobile', mobile);
        localStorage.setItem('chatUserName', name);
        onSuccess(existingUser.id);
        return;
      }

      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ name, mobile }])
        .select('id')
        .single();

      if (error) throw error;

      // Store user info in localStorage
      localStorage.setItem('chatUserId', newUser.id);
      localStorage.setItem('chatUserMobile', mobile);
      localStorage.setItem('chatUserName', name);

      onSuccess(newUser.id);
    } catch (error) {
      console.error('Error registering user:', error);
      toast({
        title: 'Error',
        description: 'Failed to register user. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold">Get Started</h2>
          <p className="text-sm text-gray-500">Please enter your details</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Welcome Section */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Welcome to AI Chat Assistant</h1>
          <p className="text-gray-500 mb-4">
            Your personal AI assistant is ready to help you 24/7
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center p-3 rounded-lg bg-gray-50"
              >
                <div className="mb-2 text-blue-600">
                  {feature.icon}
                </div>
                <span className="text-xs text-gray-600">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="pl-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile Number
            </Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your mobile number"
              required
              type="tel"
              className="pl-10"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-neutral-800" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Start Chatting'}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
} 