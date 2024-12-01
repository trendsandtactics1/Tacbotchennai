import { useState, useCallback } from 'react';
import { ArticleList } from '@/components/admin/articles/ArticleList';
import { ArticleEditor } from '@/components/admin/articles/ArticleEditor';
import toast from 'react-hot-toast';

export default function Articles() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
    toast.success(`Article ${action} successfully`);
    setIsEditorOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-6 mt-12">
      <ArticleList
        key={refreshKey}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
      />

      <ArticleEditor
        articleId={selectedArticleId}
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 