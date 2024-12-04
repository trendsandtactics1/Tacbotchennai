'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WebsiteService } from '@/lib/services/website-service';
import toast from 'react-hot-toast';

interface WebsiteProcessorProps {
  onSuccess?: () => void;
}

export function WebsiteProcessor({ onSuccess }: WebsiteProcessorProps) {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!url) return;

    setIsProcessing(true);
    try {
      await WebsiteService.processWebsite(url);
      toast.success('Website content has been processed and stored');
      setUrl('');
      onSuccess?.();
    } catch (error) {
      console.error('Error processing website:', error);
      toast.error('Failed to process website content');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='space-y-4 p-4 bg-white rounded-lg border'>
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