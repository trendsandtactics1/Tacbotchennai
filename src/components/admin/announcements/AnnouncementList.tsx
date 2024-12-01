import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Announcement } from '@/types/announcements';
import { TablePagination } from '@/components/admin/common/TablePagination';

interface AnnouncementListProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
}

export function AnnouncementList({ onCreateNew, onEdit }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadAnnouncements();
  }, [currentPage, pageSize]);

  const loadAnnouncements = async () => {
    try {
      // Get total count
      const { count } = await supabase
        .from('announcements')
        .select('id', { count: 'exact' });

      setTotalItems(count || 0);

      // Get paginated data
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      if (imageUrl) {
        const path = imageUrl.split('/').pop();
        if (path) {
          await supabase.storage
            .from('announcement-images')
            .remove([path]);
        }
      }

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
      toast.success('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ 
          active: !announcement.active,
        })
        .eq('id', announcement.id);

      if (error) throw error;

      setAnnouncements(prev =>
        prev.map(a =>
          a.id === announcement.id
            ? { ...a, active: !a.active }
            : a
        )
      );

      toast.success(`Announcement ${!announcement.active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-gray-500">Manage your announcements</p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[150px] hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>
                    {announcement.image_url ? (
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {announcement.title}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="truncate max-w-[300px]">
                      {announcement.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={announcement.active ? 'success' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(announcement)}
                    >
                      {announcement.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="sr-only">Open menu</span>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(announcement.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {announcement.link && (
                          <DropdownMenuItem 
                            onClick={() => window.open(announcement.link, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(announcement.id, announcement.image_url)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
      </Card>

      <div className="border-t">
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
} 