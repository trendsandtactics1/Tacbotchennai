import { AdminEnquiry } from '@/types/admin';
import { Search, Loader2 } from 'lucide-react';

interface EnquiryListProps {
  enquiries: AdminEnquiry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function EnquiryList({
  enquiries,
  selectedId,
  onSelect,
  isLoading,
  searchQuery,
  onSearchChange
}: EnquiryListProps) {
  return (
    <div className="w-1/3 border-r overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search enquiries..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                onClick={() => onSelect(enquiry.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedId === enquiry.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">
                    {enquiry.subject}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      enquiry.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : enquiry.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {enquiry.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{enquiry.users.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(enquiry.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}