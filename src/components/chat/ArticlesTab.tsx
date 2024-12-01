import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ArticleView } from './ArticleView';
import type { Article } from '@/types/articles';
import { Badge } from '@/components/ui/badge';
import { useWidget } from '@/contexts/WidgetContext';

export function ArticlesTab() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setExpanded } = useWidget();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setExpanded(true);
  };

  const handleBack = () => {
    setSelectedArticle(null);
    setExpanded(false);
  };

  if (selectedArticle) {
    return (
      <ArticleView
        article={selectedArticle}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold">News</h2>
        <p className="text-sm text-gray-500">From Team Support</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="group cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => handleSelectArticle(article)}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {article.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="font-medium text-base mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 