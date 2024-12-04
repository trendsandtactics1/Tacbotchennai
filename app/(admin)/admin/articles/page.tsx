'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '@/lib/services/admin-service';
import { ArticlesList } from '@/components/admin/articles/articles-list';
import { ArticleModal } from '@/components/admin/articles/article-modal';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Article } from '@/types/admin';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getArticles();
      setArticles(data);
    } catch (error) {
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <button
          onClick={() => {
            setSelectedArticle(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Article
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <ArticlesList
          articles={articles}
          onEdit={(article) => {
            setSelectedArticle(article);
            setIsModalOpen(true);
          }}
          onDelete={async (id) => {
            try {
              await AdminService.deleteArticle(id);
              await loadArticles();
              toast.success('Article deleted');
            } catch (error) {
              toast.error('Failed to delete article');
            }
          }}
        />
      )}

      {isModalOpen && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedArticle(null);
          }}
          onSave={async (data) => {
            try {
              if (selectedArticle) {
                await AdminService.updateArticle(selectedArticle.id, data);
              } else {
                await AdminService.createArticle(data);
              }
              await loadArticles();
              setIsModalOpen(false);
              toast.success(
                selectedArticle
                  ? 'Article updated'
                  : 'Article created'
              );
            } catch (error) {
              toast.error('Failed to save article');
            }
          }}
        />
      )}
    </div>
  );
} 