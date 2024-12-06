'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ArticleService } from '@/lib/services/article-service';
import type { Article } from '@/types/admin';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useWidget } from '@/contexts/widget-context';
import ReactMarkdown from 'react-markdown';

interface ArticleTabProps {
  onExpand: (expanded: boolean) => void;
}

export function ArticleTab({ onExpand }: ArticleTabProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setIsExpanded } = useWidget();

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      onExpand(true);
    } else {
      onExpand(false);
    }
  }, [selectedArticle, onExpand]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ArticleService.getArticles();
      setArticles(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load articles';
      console.error('Error loading articles:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }

      return url;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return url;
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='w-8 h-8 animate-spin text-gray-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
        <p className='text-red-500 mb-2'>Failed to load articles</p>
        <p className='text-sm text-gray-500'>{error}</p>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className='flex flex-col h-full'>
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => {
                setSelectedArticle(null);
                onExpand(false);
              }}
              className='hover:opacity-70 transition-opacity'
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className='font-semibold'>Article Details</h2>
          </div>
        </div>
        <div className='flex-1 overflow-y-auto'>
          <article className='max-w-none p-4'>
            {selectedArticle.image_url && (
              <div className='relative w-full h-64 mb-6 rounded-lg overflow-hidden'>
                <Image
                  src={selectedArticle.image_url}
                  alt={selectedArticle.title}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <h1 className='text-black text-2xl font-semibold mb-4'>
              {selectedArticle.title}
            </h1>
            <div
              className='prose prose-sm md:prose-base lg:prose-lg max-w-none'
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
            {selectedArticle.youtube_url && (
              <div className='mt-8 mb-4 aspect-video w-full'>
                <h3 className='text-lg font-semibold mb-4'>Related Video</h3>
                <iframe
                  src={getYoutubeEmbedUrl(selectedArticle.youtube_url)}
                  title='YouTube video player'
                  className='w-full h-full rounded-lg'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                  frameBorder='0'
                />
              </div>
            )}
            <div className='text-sm text-gray-400 mt-4'>
              Published on{' '}
              {new Date(selectedArticle.created_at).toLocaleDateString()}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 p-4'>
      <h2 className='text-xl font-semibold text-gray-800'>Articles</h2>
      {articles.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8 text-gray-500'>
          <p>No articles available</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => {
                setSelectedArticle(article);
              }}
              className='bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer'
            >
              <div className='flex gap-4'>
                {article.image_url && (
                  <div className='relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0'>
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className='object-cover'
                      sizes='96px'
                    />
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <h3 className='font-medium text-base text-gray-900'>
                    {article.title}
                  </h3>
                  <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                    {article.description}
                  </p>
                  {article.tags && (
                    <div className='flex gap-2 mt-2'>
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className='px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
