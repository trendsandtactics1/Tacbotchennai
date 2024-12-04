'use client';

import { useState } from 'react';
import { Clock, Edit2, Trash2, Link as LinkIcon, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/types/admin';
import { DeleteConfirmationModal } from '../shared/delete-confirmation-modal';

interface ArticlesListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ArticlesList({ articles, onEdit, onDelete }: ArticlesListProps) {
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);

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
                  Links
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
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.image_url ? (
                      <div className="relative w-20 h-20">
                        <Image
                          src={article.image_url}
                          alt={article.title}
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
                      {article.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {article.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        article.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {article.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      {article.youtube_url && (
                        <Link
                          href={article.youtube_url}
                          target="_blank"
                          className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <Youtube className="h-4 w-4" />
                          <span className="text-sm">Watch Video</span>
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(article)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteArticle(article)}
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

      {deleteArticle && (
        <DeleteConfirmationModal
          title={deleteArticle.title}
          onConfirm={async () => {
            await onDelete(deleteArticle.id);
            setDeleteArticle(null);
          }}
          onCancel={() => setDeleteArticle(null)}
        />
      )}
    </>
  );
} 