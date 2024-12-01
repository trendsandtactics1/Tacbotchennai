import { useState } from 'react';
import { ComplaintList } from '@/components/admin/complaints/ComplaintList';
import { ComplaintDetails } from '@/components/admin/complaints/ComplaintDetails';

export default function Complaints() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [filter, setFilter] = useState('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSelectComplaint = (id: string) => {
    setSelectedSessionId(id);
    setIsDetailsOpen(true);
  };

  return (
    <div className='space-y-6 p-6 mt-12'>
      <ComplaintList
        filter={filter}
        onFilterChange={setFilter}
        onSelectComplaint={handleSelectComplaint}
      />

      {selectedSessionId && (
        <ComplaintDetails
          sessionId={selectedSessionId}
          onBack={() => setIsDetailsOpen(false)}
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </div>
  );
}
