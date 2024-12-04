// app/(admin)/admin/enquiries/page.tsx
import { EnquiriesContent } from '@/components/admin/enquiries/enquiries-content';
import { Suspense } from 'react';

export default function EnquiriesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Enquiries</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <EnquiriesContent />
      </Suspense>
    </div>
  );
}
