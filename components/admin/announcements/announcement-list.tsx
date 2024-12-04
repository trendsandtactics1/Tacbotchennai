'use client';

import { useState } from 'react';
import { Clock, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Announcement } from '@/types/admin';
import { DeleteConfirmationModal } from './delete-confirmation-modal';

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => Promise<void>;
}

export function AnnouncementList({
  announcements,
  onEdit,
  onDelete
}: AnnouncementListProps) {
  const [deleteAnnouncement, setDeleteAnnouncement] = useState<Announcement | null>(null);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title & Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {announcement.image_url ? (
                      <div className="relative w-20 h-20">
                        <Image
                          src={announcement.image_url}
                          alt={announcement.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {announcement.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {announcement.content}
                    </div>
                    {announcement.link && (
                      <Link
                        href={announcement.link}
                        target="_blank"
                        className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 mt-1"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span className="text-sm">View Link</span>
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        announcement.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : announcement.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {announcement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(announcement)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteAnnouncement(announcement)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteAnnouncement && (
        <DeleteConfirmationModal
          title={deleteAnnouncement.title}
          onConfirm={async () => {
            await onDelete(deleteAnnouncement.id);
            setDeleteAnnouncement(null);
          }}
          onCancel={() => setDeleteAnnouncement(null)}
        />
      )}
    </>
  );
} 