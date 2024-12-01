import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useWidget } from '@/contexts/WidgetContext';

interface ArticleViewProps {
  article: {
    title: string;
    content: string;
    image_url?: string;
    video_url?: string;
    tags?: string[];
  };
  onBack: () => void;
}

export function ArticleView({ article, onBack }: ArticleViewProps) {
  const { isExpanded, toggleExpand } = useWidget();

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 border-b sticky top-0 bg-white z-10 shadow-sm">
        <div className="p-4 flex items-center gap-3 max-w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="hover:bg-gray-100 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {article.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="font-semibold text-base sm:text-lg truncate pr-2">
              {article.title}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpand}
            className="hover:bg-gray-100 flex-shrink-0"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <article className={`p-4 sm:p-6 mx-auto ${
          isExpanded ? 'max-w-[720px]' : 'max-w-[680px]'
        }`}>
          {article.image_url && (
            <div className="mb-4 sm:mb-6">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full rounded-lg shadow-sm"
                loading="lazy"
              />
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <ReactMarkdown 
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{children}</h2>
                ),
                p: ({ children }) => (
                  <p className="mb-3 sm:mb-4 text-gray-700 leading-relaxed text-sm sm:text-base">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 sm:mb-4 list-disc pl-4 space-y-1 sm:space-y-2">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 text-sm sm:text-base">{children}</li>
                ),
                img: ({ ...props }) => (
                  <img {...props} className="rounded-lg shadow-sm my-3 sm:my-4" loading="lazy" />
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {article.video_url && (
            <div className="mt-4 sm:mt-6">
              <div className="aspect-video rounded-lg overflow-hidden shadow-sm">
                <iframe
                  src={getYouTubeEmbedUrl(article.video_url) || ''}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </article>
      </ScrollArea>
    </div>
  );
} 