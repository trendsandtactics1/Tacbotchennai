import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ImageUpload } from './ImageUpload';
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ArticleEditorProps {
  articleId?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ArticleEditor({
  articleId,
  isOpen,
  onOpenChange,
  onSuccess
}: ArticleEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (articleId && isOpen) {
      loadArticle();
    } else {
      resetForm();
    }
  }, [articleId, isOpen]);

  const loadArticle = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setContent(data.content);
        setImageUrl(data.image_url || '');
        setVideoUrl(data.video_url || '');
        setPublished(data.published);
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error loading article:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article. Please try again.',
        variant: 'destructive'
      });
      onOpenChange(false);
    } finally {
      setIsFetching(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setPublished(false);
    setTags([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const articleData = {
        title,
        description,
        content,
        image_url: imageUrl,
        video_url: videoUrl,
        published,
        tags,
        updated_at: new Date().toISOString()
      };

      if (articleId) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);

        if (error) throw error;

        toast({
          title: 'Article updated',
          description: 'Your article has been updated successfully.'
        });
      } else {
        const { error } = await supabase.from('articles').insert([
          {
            ...articleData,
            created_at: new Date().toISOString()
          }
        ]);

        if (error) throw error;

        toast({
          title: 'Article created',
          description: 'Your new article has been created successfully.'
        });
      }

      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Error',
        description: `Failed to ${
          articleId ? 'update' : 'create'
        } article. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);
    setContent(newText);
  };

  const formatActions = [
    { icon: Bold, label: 'Bold', action: () => insertText('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertText('*', '*') },
    { icon: Heading1, label: 'H1', action: () => insertText('# ') },
    { icon: Heading2, label: 'H2', action: () => insertText('## ') },
    { icon: List, label: 'List', action: () => insertText('- ') },
    { icon: LinkIcon, label: 'Link', action: () => insertText('[', '](url)') },
    {
      icon: AlignLeft,
      label: 'Left',
      action: () => insertText('::: left\n', '\n:::')
    },
    {
      icon: AlignCenter,
      label: 'Center',
      action: () => insertText('::: center\n', '\n:::')
    },
    {
      icon: AlignRight,
      label: 'Right',
      action: () => insertText('::: right\n', '\n:::')
    }
  ];

  if (isFetching) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl max-h-[90vh]'>
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col p-4 md:p-6 gap-4'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle>
            {articleId ? 'Edit Article' : 'Create New Article'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 flex-1 overflow-y-auto px-2'
        >
          <div className='grid gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className='h-[38px] min-h-[38px]'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Content</Label>
            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='border rounded-lg'>
                <div className='border-b p-2 bg-gray-50 flex flex-wrap gap-1'>
                  {formatActions.map(({ icon: Icon, label, action }) => (
                    <Button
                      key={label}
                      variant='ghost'
                      size='sm'
                      className='h-8 px-2 hover:bg-gray-200'
                      onClick={(e) => {
                        e.preventDefault();
                        action();
                      }}
                      title={label}
                    >
                      <Icon className='h-4 w-4' />
                    </Button>
                  ))}
                </div>
                <Textarea
                  id='content'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className='min-h-[400px] font-mono border-0 rounded-none focus-visible:ring-0 resize-none'
                  placeholder='Write your article content here...'
                />
              </div>

              <div className='border rounded-lg'>
                <div className='border-b p-2 bg-gray-50'>
                  <span className='text-sm font-medium text-gray-500'>
                    Preview
                  </span>
                </div>
                <div className='p-4 prose prose-sm max-w-none overflow-y-auto min-h-[400px]'>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-6'>
              <ImageUpload value={imageUrl} onChange={setImageUrl} />

              <div className='space-y-2'>
                <Label htmlFor='videoUrl'>YouTube Video URL</Label>
                <Input
                  id='videoUrl'
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder='https://youtube.com/watch?v=...'
                />
              </div>
            </div>

            <div className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='tags'>Tags</Label>
                <div className='space-y-2'>
                  <Input
                    id='tags'
                    placeholder='Add tags (press Enter to add)'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value && !tags.includes(value)) {
                          setTags([...tags, value]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <div className='flex flex-wrap gap-2 min-h-[38px] p-2 border rounded-md'>
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {tag}
                        <X
                          className='h-3 w-3 cursor-pointer hover:text-red-500'
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-2 pt-4'>
                <input
                  type='checkbox'
                  id='published'
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className='rounded border-gray-300'
                />
                <Label htmlFor='published'>Published</Label>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
