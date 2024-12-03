import { Suspense } from 'react';
import { Users, MessageCircle, FileQuestion, Clock } from 'lucide-react';
import { DashboardSkeleton } from '@/components/admin/dashboard/dashboard-skeleton';
import { DashboardContent } from '@/components/admin/dashboard/dashboard-content';

export default function AdminDashboardPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Dashboard Overview</h2>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
