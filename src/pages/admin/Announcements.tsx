import { useState } from 'react';
import { AnnouncementList } from '@/components/admin/announcements/AnnouncementList';
import toast from 'react-hot-toast';
import { AnnouncementEditor } from '@/components/admin/announcements/AnnouncementEditor';

export default function Announcements() {
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateNew = () => {
    setSelectedAnnouncementId(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedAnnouncementId(id);
    setIsEditorOpen(true);
  };

  const handleSuccess = () => {
    const action = selectedAnnouncementId ? 'updated' : 'created';
    toast.success(`Announcement ${action} successfully`);
    setIsEditorOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-6 mt-12">
      <AnnouncementList
        key={refreshKey}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
      />

      <AnnouncementEditor
        announcementId={selectedAnnouncementId}
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
