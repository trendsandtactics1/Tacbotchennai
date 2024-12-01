import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { uploadFile, deleteFile } from '@/utils/storage';
import { Loader2, X } from 'lucide-react';

interface ImageUploadProps {
  bucket: 'announcements' | 'article-images';
  onUpload: (url: string) => void;
  currentImage?: string;
  path?: string;
}

export function ImageUpload({ bucket, onUpload, currentImage, path }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const { url } = await uploadFile({ bucket, file, path });
      onUpload(url);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    try {
      const path = new URL(currentImage).pathname.split('/').pop();
      if (!path) return;

      await deleteFile(bucket, path);
      onUpload('');

      toast({
        title: 'Success',
        description: 'Image removed successfully'
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {currentImage && (
        <div className="relative w-32 h-32">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-full object-cover rounded"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 