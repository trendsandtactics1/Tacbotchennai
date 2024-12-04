'use client';

import { useState, useEffect } from 'react';
import { WebsiteProcessor } from '@/components/admin/website/website-processor';
import { WebsiteService } from '@/lib/services/website-service';
import type { Document } from '@/types/admin';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistance } from 'date-fns';

export default function WebsitePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await WebsiteService.getDocuments();
      console.log('Fetched documents:', data);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await WebsiteService.deleteDocument(id);
      toast.success('Document deleted successfully');
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeleteId(null);
    }
  };

  const formatContent = (content: string) => {
    // Split content into sections and paragraphs
    const sections = content
      .split(/(?=[A-Z][A-Z\s]+:)/) // Split on uppercase headings with colon
      .filter(s => s.trim().length > 0);

    return sections.map((section, sectionIndex) => {
      const [heading, ...paragraphs] = section
        .split(/\n\s*\n/)
        .filter(p => p.trim().length > 0);

      const isMainHeading = heading.length < 100 && 
        (heading.toUpperCase() === heading || heading.endsWith(':'));

      return (
        <div key={sectionIndex} className='mb-8'>
          {/* Section Heading */}
          {isMainHeading && (
            <h3 className='text-lg font-semibold text-gray-900 mb-4 pb-2 border-b'>
              {heading.replace(/:$/, '')}
            </h3>
          )}

          {/* Section Content */}
          <div className='space-y-4'>
            {!isMainHeading && (
              <p className='text-base text-gray-600'>{heading}</p>
            )}
            {paragraphs.map((paragraph, index) => {
              // Check for different types of content
              const isList = paragraph.trim().startsWith('•') || 
                           paragraph.trim().startsWith('-');
              const isSubHeading = paragraph.length < 80 && 
                                 (paragraph.endsWith(':') || paragraph.endsWith('?'));

              if (isList) {
                const items = paragraph
                  .split(/[•-]/)
                  .filter(item => item.trim().length > 0);
                return (
                  <ul key={index} className='list-disc pl-6 space-y-2'>
                    {items.map((item, i) => (
                      <li key={i} className='text-gray-600'>{item.trim()}</li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={index}
                  className={`${
                    isSubHeading
                      ? 'text-base font-medium text-gray-800'
                      : 'text-base text-gray-600 leading-relaxed'
                  } ${
                    paragraph.length > 200 ? 'text-justify' : ''
                  }`}
                >
                  {paragraph.trim()}
                </p>
              );
            })}
          </div>
        </div>
      );
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      full: date.toLocaleString(),
      relative: formatDistance(date, new Date(), { addSuffix: true })
    };
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
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Website Content Management</h1>
      </div>

      <WebsiteProcessor onSuccess={fetchDocuments} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Document List */}
        <Card className='p-4'>
          <h2 className='text-lg font-semibold mb-4'>
            Processed Websites ({documents.length})
          </h2>
          <ScrollArea className='h-[400px]'>
            <div className='space-y-4'>
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedDoc?.id === doc.id ? 'border-blue-500' : ''
                  }`}
                  onClick={() => {
                    console.log('Selected document:', doc);
                    setSelectedDoc(doc);
                  }}
                >
                  <p className='font-medium text-sm text-blue-600'>
                    {doc.metadata?.source_url || 'No URL provided'}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Processed:{' '}
                    {doc.metadata?.processed_at
                      ? new Date(doc.metadata.processed_at).toLocaleString()
                      : 'Unknown date'}
                  </p>
                  <p className='text-xs text-gray-600 mt-2 line-clamp-2'>
                    {doc.content.substring(0, 150)}...
                  </p>
                  <div className='flex justify-end mt-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(doc.id);
                      }}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </Card>
              ))}
              {documents.length === 0 && (
                <p className='text-center text-gray-500 py-4'>
                  No documents found. Process a website to get started.
                </p>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Content Preview */}
        <Card className='p-4'>
          <h2 className='text-lg font-semibold mb-4'>Content Preview</h2>
          <ScrollArea className='h-[400px]'>
            {selectedDoc ? (
              <div className='prose prose-sm max-w-none'>
                {/* Metadata Section */}
                <div className='mb-6 bg-gray-50 p-4 rounded-lg border'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='font-semibold text-gray-900'>
                      Source Information
                    </h3>
                    <span className='text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded'>
                      {formatTimestamp(selectedDoc.created_at).relative}
                    </span>
                  </div>
                  <a
                    href={selectedDoc.metadata?.source_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1'
                  >
                    {selectedDoc.metadata?.source_url || 'No URL provided'}
                    <span className='text-xs'>↗</span>
                  </a>
                  <p className='text-xs text-gray-500 mt-2'>
                    Processed: {formatTimestamp(selectedDoc.metadata?.processed_at || '').full}
                  </p>
                </div>

                {/* Content Section */}
                <div className='mt-6 bg-white rounded-lg'>
                  <div className='space-y-6 text-gray-600'>
                    {formatContent(selectedDoc.content)}
                  </div>
                </div>

                {/* Statistics */}
                <div className='mt-8 pt-4 border-t flex items-center justify-between text-xs text-gray-500'>
                  <span>
                    Word count: {selectedDoc.content.split(/\s+/).length.toLocaleString()}
                  </span>
                  <span>
                    Character count: {selectedDoc.content.length.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-[300px] text-gray-500'>
                <p className='text-center'>
                  Select a document from the list to view its content
                </p>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
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