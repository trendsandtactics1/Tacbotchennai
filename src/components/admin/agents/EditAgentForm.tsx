import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export function EditAgentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    is_admin: false,
    status: 'offline'
  });

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Agent not found');

      setFormData({
        name: data.name,
        status: data.status as 'online' | 'offline',
        is_admin: data.is_admin
      });
    } catch (error) {
      console.error('Error loading agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agent details',
        variant: 'destructive'
      });
      navigate('/admin/agents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (!formData.name.trim()) {
        throw new Error('Agent name is required');
      }

      const { error } = await supabase
        .from('agents')
        .update({
          name: formData.name.trim(),
          status: formData.status,
          is_admin: formData.is_admin
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent updated successfully'
      });

      navigate('/admin/agents');
    } catch (error) {
      console.error('Error updating agent:', error);
      
      let errorMessage = 'Failed to update agent';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold">Edit Agent</h1>
          <p className="text-sm text-gray-500 mt-1">
            Modify agent details and permissions
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
              <Label htmlFor="status">Status</Label>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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
