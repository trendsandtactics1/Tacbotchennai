import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

interface AgentFormData {
  name: string;
  status: 'online' | 'offline';
  is_admin: boolean;
}

export function AgentForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    is_admin: false,
    status: 'offline'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Agent name is required');
      }

      const { data, error } = await supabase
        .from('agents')
        .insert([{
          name: formData.name.trim(),
          status: formData.status,
          is_admin: formData.is_admin
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Agent created successfully'
      });

      navigate('/admin/agents');

    } catch (error) {
      console.error('Error creating agent:', error);
      
      let errorMessage = 'Failed to create agent';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/agents')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Add New Agent</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new AI agent with specific permissions
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="Enter agent name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'online' | 'offline') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admin Access */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Admin Access</Label>
                <p className="text-sm text-gray-500">
                  Grant administrative privileges to this agent
                </p>
              </div>
              <Switch
                checked={formData.is_admin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_admin: checked })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/agents')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}