'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '@/lib/services/admin-service';
import { AnnouncementList } from '@/components/admin/announcements/announcement-list';
import { AnnouncementModal } from '@/components/admin/announcements/announcement-modal';
import { Plus, Loader2 } from 'lucide-react';
import type { Announcement } from '@/types/admin';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  // ✅ Load announcements
  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Save or update
  const handleSave = async (data: {
    title: string;
    description: string;
    image_url?: string;
    link?: string;
    status: Announcement['status'];
  }) => {
    try {
      if (selectedAnnouncement) {
        await AdminService.updateAnnouncement(selectedAnnouncement.id, data);
        console.log('Announcement updated');
      } else {
        await AdminService.createAnnouncement(data);
        console.log('Announcement created');
      }
      await loadAnnouncements();
      setIsModalOpen(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  // ✅ Delete
  const handleDelete = async (id: string) => {
    try {
      await AdminService.deleteAnnouncement(id);
      await loadAnnouncements();
      console.log('Announcement deleted');
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <button
          onClick={() => {
            setSelectedAnnouncement(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Announcement
        </button>
      </div>

      {/* Loader or Announcement List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <AnnouncementList
          announcements={announcements}
          onEdit={(announcement) => {
            setSelectedAnnouncement(announcement);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAnnouncement(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
