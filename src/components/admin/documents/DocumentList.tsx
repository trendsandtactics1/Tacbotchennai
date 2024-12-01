import { useState } from 'react';
import { useDocument } from '@/hooks/useDocument';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
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

export function DocumentList() {
  const { documents, loading, deleteDocument } = useDocument();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map(doc => (
        <Card key={doc.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {doc.metadata.title || 'Untitled Document'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {doc.metadata.source_url}
              </p>
              <p className="text-sm mt-2 line-clamp-2">{doc.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(doc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 