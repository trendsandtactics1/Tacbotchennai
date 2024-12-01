import { useState, useEffect } from 'react';
import { useArticleSubscription } from '@/hooks/useArticleSubscription';
import { Article } from '@/types/articles';
import { supabase } from '@/integrations/supabase/client';

export function PublicArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    loadPublishedArticles();
  }, []);

  const loadPublishedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const handleArticleUpdate = (article: Article) => {
    setArticles(prev => {
      const exists = prev.some(a => a.id === article.id);
      if (exists) {
        return prev.map(a => a.id === article.id ? article : a);
      }
      return [article, ...prev];
    });
  };

  const handleArticleDelete = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // Only subscribe to published articles
  useArticleSubscription(handleArticleUpdate, handleArticleDelete, true);

  // ... rest of the component
} 