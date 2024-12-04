'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Announcement } from '@/types/admin';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface AnnouncementModalProps {
  announcement: Announcement | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    image_url?: string;
    link?: string;
    status: Announcement['status'];
  }) => Promise<void>;
}

export function AnnouncementModal({
  announcement,
  onClose,
  onSave
}: AnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<Announcement['status']>('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setDescription(announcement.description);
      setImageUrl(announcement.image_url || '');
      setLink(announcement.link || '');
      setStatus(announcement.status);
    }
  }, [announcement]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('announcements')
        .upload(`images/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl }
      } = supabase.storage
        .from('announcements')
        .getPublicUrl(`images/${fileName}`);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: Error | unknown) {
      console.error('Error uploading image:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSaving(true);
    try {
      const announcementData = {
        title: title.trim(),
        description: description.trim(),
        status: status,
        ...(imageUrl && { image_url: imageUrl }),
        ...(link && { link: link.trim() })
      };

      await onSave(announcementData);
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-semibold'>
            {announcement ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-4 space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Title</label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              placeholder='Enter announcement title'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none'
              placeholder='Enter announcement description'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Image</label>
            <div className='space-y-2'>
              {imageUrl && (
                <div className='relative w-40 h-40'>
                  <Image
                    src={imageUrl}
                    alt='Announcement'
                    fill
                    className='object-cover rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={() => setImageUrl('')}
                    className='absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              )}
              <div className='flex items-center gap-2'>
                <label className='flex-1'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                  />
                  <div className='flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50'>
                    {isUploading ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <>
                        <Upload className='h-5 w-5' />
                        <span>Upload Image</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>
              Link (Optional)
            </label>
            <input
              type='url'
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              placeholder='Enter related link'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Status</label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as Announcement['status'])
              }
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
            >
              <option value='draft'>Draft</option>
              <option value='published'>Published</option>
              <option value='archived'>Archived</option>
            </select>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSaving || isUploading}
              className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50'
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
