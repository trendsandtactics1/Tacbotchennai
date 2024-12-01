import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Image, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      setImageError(false);

      // Create a clean filename
      const fileExt = file.name.split('.').pop();
      const cleanName = file.name.split('.')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const fileName = `${cleanName}-${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const publicUrl = `${supabase.storageUrl}/object/public/article-images/${fileName}`;
      onChange(publicUrl);
      
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
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract filename from URL
      const fileName = value.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('article-images')
        .remove([fileName]);

      if (error) throw error;

      onChange('');
      setImageError(false);
      
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
      <div className="flex items-center justify-between">
        <Label>Featured Image</Label>
        {value && !imageError && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value && !imageError ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Article thumbnail"
            className="w-full h-full object-cover"
            onError={() => {
              setImageError(true);
              console.error('Error loading image:', value);
            }}
          />
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="border-2 border-dashed rounded-lg p-8 hover:border-gray-400 transition-colors">
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <>
                  <Image className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {imageError ? 'Image failed to load. Click to upload new image' : 'Click or drag image to upload'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Max file size: 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 