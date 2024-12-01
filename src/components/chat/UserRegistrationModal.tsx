import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; mobile: string; userId: string }) => void;
  embedded?: boolean;
}

export function UserRegistrationModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  embedded = false 
}: UserRegistrationModalProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('mobile', mobile)
        .single();

      if (existingUser) {
        if (existingUser.name !== name) {
          await supabase
            .from('users')
            .update({ name })
            .eq('id', existingUser.id);
        }
        onSuccess({ name, mobile, userId: existingUser.id });
      } else {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({ name, mobile })
          .select()
          .single();

        if (error) throw error;
        if (!newUser) throw new Error('Failed to create user');

        onSuccess({ name, mobile, userId: newUser.id });
      }

      localStorage.setItem('chatUser', JSON.stringify({ name, mobile }));
      onClose();
    } catch (error) {
      console.error('Error registering user:', error);
      toast({
        title: 'Error',
        description: 'Failed to register user. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <div>
        <Label htmlFor="mobile">Mobile Number</Label>
        <Input
          id="mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Enter your mobile number"
          required
          type="tel"
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Continue'}
      </Button>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Information</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
} 