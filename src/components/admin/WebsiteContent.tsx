import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash2 } from 'lucide-react';
import { processWebsite } from '@/services/websiteContent';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Document {
  id: string;
  content: string;
  metadata: {
    source_url?: string;
    processed_at?: string;
  };
  created_at: string;
}

export default function WebsiteContent() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      setIsProcessing(true);
      setError(null);
      await processWebsite(url);
      await fetchDocuments();

      toast({
        title: 'Success',
        description: 'Website content processed successfully'
      });

      setUrl('');
    } catch (error) {
      console.error('Error processing website:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process website content',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      });

      setDocuments(documents.filter((doc) => doc.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      <h1 className='text-2xl font-bold'>Website Content Management</h1>

      <Card className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Process New Website</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='url' className='text-sm font-medium'>
              Website URL
            </label>
            <Input
              id='url'
              type='url'
              placeholder='https://example.com'
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              required
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
          <Button type='submit' disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              'Process Website'
            )}
          </Button>
        </form>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='p-4'>
          <h2 className='text-lg font-semibold mb-4'>Processed Websites</h2>
          <ScrollArea className='h-[400px]'>
            <div className='space-y-4'>
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedDoc?.id === doc.id ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <p className='font-medium text-sm text-blue-600'>
                    {doc.metadata.source_url}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Processed:{' '}
                    {doc.metadata.processed_at
                      ? new Date(doc.metadata.processed_at).toLocaleString()
                      : 'Unknown date'}
                  </p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className='p-4'>
          <h2 className='text-lg font-semibold mb-4'>Content Preview</h2>
          <ScrollArea className='h-[400px]'>
            {selectedDoc ? (
              <div className='prose prose-sm max-w-none'>
                <p className='text-sm text-gray-600 whitespace-pre-wrap'>
                  {selectedDoc.content}
                </p>
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>
                Select a document to view its content
              </p>
            )}
          </ScrollArea>
        </Card>
      </div>

      <Card className='p-6'>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className='max-w-[200px] truncate'>
                    <a
                      href={doc.metadata.source_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      {doc.metadata.source_url}
                    </a>
                  </TableCell>
                  <TableCell className='max-w-[400px]'>
                    <p className='truncate'>{doc.content}</p>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setDeleteId(doc.id)}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center py-6 text-gray-500'
                  >
                    No documents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
