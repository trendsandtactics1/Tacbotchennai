import { useState, useCallback } from 'react';
import { ArticleList } from '@/components/admin/articles/ArticleList';
import { ArticleEditor } from '@/components/admin/articles/ArticleEditor';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Articles() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleCreateNew = () => {
    setSelectedArticleId(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedArticleId(id);
    setIsEditorOpen(true);
  };

  const handleSuccess = () => {
    const action = selectedArticleId ? 'updated' : 'created';
    toast({
      title: 'Success',
      description: `Article ${action} successfully`
    });
    setIsEditorOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className='p-6 mt-12'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Articles</h1>
        <Button onClick={handleCreateNew}>
          <Plus className='h-4 w-4 mr-2' />
          Create New Article
        </Button>
      </div>

      <Card className='p-6'>
        <ArticleList
          key={refreshKey}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
        />
      </Card>

      <ArticleEditor
        articleId={selectedArticleId}
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
