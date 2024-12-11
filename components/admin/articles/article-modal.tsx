'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Youtube } from 'lucide-react';
import Image from 'next/image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Article } from '@/types/admin';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import TextAlign from '@tiptap/extension-text-align';
import { EditorToolbar } from './editor-toolbar';
import TextStyle from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import Link from '@tiptap/extension-link';

// Create a custom font size extension
const FontSize = Extension.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize,
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes.size) return {};
          return { style: `font-size: ${attributes.size}` };
        }
      }
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          size: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize,
            renderHTML: (attributes: Record<string, string>) => {
              if (!attributes.size) return {};
              return { style: `font-size: ${attributes.size}` };
            }
          }
        }
      }
    ];
  }
});

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    content: string;
    image_url?: string;
    youtube_url?: string;
    active: boolean;
  }) => Promise<void>;
}

export function ArticleModal({ article, onClose, onSave }: ArticleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      TextAlign.configure({
        types: ['paragraph', 'heading']
      }),
      TextStyle,
      FontSize,
      Link.configure({
        openOnClick: false
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm focus:outline-none max-w-none min-h-[200px] px-4 py-3'
      }
    }
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setDescription(article.description);
      setImageUrl(article.image_url || '');
      setYoutubeUrl(article.youtube_url || '');
      setActive(article.active);
      editor?.commands.setContent(article.content);
    }
  }, [article, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('articles')
        .upload(`images/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl }
      } = supabase.storage.from('articles').getPublicUrl(`images/${fileName}`);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: unknown) {
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

    console.log('Editor content:', editor?.getHTML());

    if (!title.trim() || !description.trim() || !editor?.getHTML()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        content: editor.getHTML(),
        image_url: imageUrl,
        youtube_url: youtubeUrl.trim(),
        active
      });
      toast.success('Article saved successfully');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-semibold'>
            {article ? 'Edit Article' : 'New Article'}
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
              placeholder='Enter article title'
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
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none'
              placeholder='Enter article description'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Content</label>
            <div className='border rounded-lg focus-within:ring-2 focus-within:ring-blue-500'>
              <EditorToolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Image</label>
            <div className='space-y-2'>
              {imageUrl && (
                <div className='relative w-40 h-40'>
                  <Image
                    src={imageUrl}
                    alt='Article'
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
              YouTube URL (Optional)
            </label>
            <div className='flex items-center gap-2'>
              <Youtube className='h-5 w-5 text-red-500' />
              <input
                type='url'
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className='flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='Enter YouTube video URL'
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='active'
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className='rounded border-gray-300 text-blue-500 focus:ring-blue-500'
            />
            <label htmlFor='active' className='text-sm font-medium'>
              Active
            </label>
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
