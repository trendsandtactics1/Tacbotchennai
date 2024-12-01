import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div 
        className={`
          min-h-screen 
          transition-all duration-300 ease-in-out
          ${isMobile ? 'pl-0' : 'pl-64'}
        `}
      >
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />
        
        <main className="p-4 md:p-6 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}