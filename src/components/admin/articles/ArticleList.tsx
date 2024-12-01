import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { Article } from '@/types/articles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
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

interface ArticleListProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
}

export function ArticleList({ onCreateNew, onEdit }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'draft'
  >('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteImageUrl, setDeleteImageUrl] = useState<string | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadArticles();
  }, [page, statusFilter, searchQuery, refreshTrigger]);

  useEffect(() => {
    if (!isLoading) {
      loadArticles();
    }
  }, [isLoading]);

  const loadArticles = async () => {
    try {
      let query = supabase.from('articles').select('*', { count: 'exact' });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('published', statusFilter === 'published');
      }

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      // Add pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setArticles(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string, imageUrl?: string) => {
    setDeleteId(id);
    setDeleteImageUrl(imageUrl);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    const deletePromise = async () => {
      try {
        if (deleteImageUrl) {
          const path = deleteImageUrl.split('/').pop();
          if (path) {
            await supabase.storage.from('article-images').remove([path]);
          }
        }

        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', deleteId);

        if (error) throw error;

        setArticles((prev) =>
          prev.filter((article) => article.id !== deleteId)
        );
        setRefreshTrigger((prev) => prev + 1);
        return 'Article deleted successfully';
      } catch (error) {
        throw new Error('Failed to delete article');
      }
    };
    toast.promise(deletePromise(), {
      loading: 'Deleting article...',
      success: (message) => message,
      error: 'Failed to delete article'
    });

    setDeleteId(null);
    setDeleteImageUrl(undefined);
  };

  const handleTogglePublish = async (article: Article) => {
    const togglePromise = async () => {
      try {
        const { error } = await supabase
          .from('articles')
          .update({
            published: !article.published,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (error) throw error;

        setRefreshTrigger((prev) => prev + 1);
        return `Article ${
          !article.published ? 'published' : 'unpublished'
        } successfully`;
      } catch (error) {
        throw new Error('Failed to update article status');
      }
    };

    toast.promise(togglePromise(), {
      loading: 'Updating status...',
      success: (message) => message,
      error: 'Failed to update status'
    });
  };

  return (
    <>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Articles</h1>
            <p className='text-sm text-gray-500'>Manage your articles</p>
          </div>
          <Button onClick={onCreateNew} className='gap-2'>
            <Plus className='h-4 w-4' />
            New Article
          </Button>
        </div>

        <Card>
          <div className='p-4 border-b'>
            <div className='flex gap-4 flex-col sm:flex-row'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
                  <Input
                    placeholder='Search articles...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='published'>Published</SelectItem>
                  <SelectItem value='draft'>Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Description
                  </TableHead>
                  <TableHead className='w-[100px]'>Status</TableHead>
                  <TableHead className='w-[150px] hidden sm:table-cell'>
                    Created
                  </TableHead>
                  <TableHead className='w-[100px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className='w-16 h-16 object-cover rounded-lg'
                        />
                      ) : (
                        <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center'>
                          <span className='text-gray-400 text-xs'>
                            No image
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className='font-medium'>
                      {article.title}
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      <p className='truncate max-w-[300px]'>
                        {article.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={article.published ? 'success' : 'secondary'}
                        className='cursor-pointer'
                        onClick={() => handleTogglePublish(article)}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className='hidden sm:table-cell'>
                      {format(new Date(article.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <span className='sr-only'>Open menu</span>
                            <Filter className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onEdit(article.id)}>
                            <Pencil className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteClick(article.id, article.image_url)
                            }
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='p-4 border-t flex items-center justify-between'>
            <div className='text-sm text-gray-500'>
              Showing {(page - 1) * itemsPerPage + 1} to{' '}
              {Math.min(page * itemsPerPage, articles.length)} of{' '}
              {totalPages * itemsPerPage} entries
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              article and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
