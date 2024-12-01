import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '../articles/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface AnnouncementEditorProps {
  announcementId?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AnnouncementEditor({
  announcementId,
  isOpen,
  onOpenChange,
  onSuccess
}: AnnouncementEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (announcementId && isOpen) {
      loadAnnouncement();
    } else {
      resetForm();
    }
  }, [announcementId, isOpen]);

  const loadAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', announcementId)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setImageUrl(data.image_url || '');
        setLink(data.link || '');
        setActive(data.active);
      }
    } catch (error) {
      console.error('Error loading announcement:', error);
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLink('');
    setActive(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        title,
        description,
        image_url: imageUrl,
        link,
        active
      };

      if (announcementId) {
        await supabase
          .from('announcements')
          .update(data)
          .eq('id', announcementId);
      } else {
        await supabase
          .from('announcements')
          .insert([data]);
      }

      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {announcementId ? 'Edit Announcement' : 'Create Announcement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
          />

          <div className="space-y-2">
            <Label htmlFor="link">Link (Optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 