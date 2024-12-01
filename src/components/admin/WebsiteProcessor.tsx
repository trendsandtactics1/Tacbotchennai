import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebsiteProcessorProps {
  onSuccess?: () => void;
}

export default function WebsiteProcessor({ onSuccess }: WebsiteProcessorProps) {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcess = async () => {
    if (!url) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'process-website',
        {
          body: { url }
        }
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Website content has been processed and stored'
      });

      setUrl('');
      onSuccess?.();
    } catch (error) {
      console.error('Error processing website:', error);
      toast({
        title: 'Error',
        description: 'Failed to process website content',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='space-y-4 p-4 bg-white rounded-lg border mt-16'>
      <h2 className='text-lg font-semibold'>Process Website Content</h2>
      <div className='flex gap-2'>
        <Input
          type='url'
          placeholder='Enter website URL'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className='flex-1'
        />
        <Button onClick={handleProcess} disabled={!url || isProcessing}>
          {isProcessing ? 'Processing...' : 'Process'}
        </Button>
      </div>
    </div>
  );
}
