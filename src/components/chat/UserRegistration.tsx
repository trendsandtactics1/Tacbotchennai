import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface UserRegistrationProps {
  onSuccess: (userId: string) => void;
  onBack: () => void;
}

export function UserRegistration({ onSuccess, onBack }: UserRegistrationProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    try {
      setIsSubmitting(true);

      // Check if mobile already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('mobile', mobile)
        .single();

      if (existingUser) {
        onSuccess(existingUser.id);
        return;
      }

      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert([{ name, mobile }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Registration successful'
      });

      if (data) {
        onSuccess(data.id);
      }
    } catch (error) {
      console.error('Error in registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to register. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </div>
        <div>
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            placeholder="Enter your mobile number"
            type="tel"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 