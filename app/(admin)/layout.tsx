import { AdminHeader } from '@/components/admin/header';
import { AdminNavigation } from '@/components/admin/navigation';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex bg-gray-100'>
      <AdminNavigation />
      <div className='flex-1 flex flex-col'>
        <AdminHeader />
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}
