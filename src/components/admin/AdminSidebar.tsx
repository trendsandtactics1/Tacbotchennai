import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  AlertCircle,
  Database
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ open, isMobile, onClose }: SidebarProps) => {
  const navItems = [
    {
      to: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      to: '/admin/conversations',
      icon: MessageSquare,
      label: 'Conversations'
    },
    {
      to: '/admin/announcements',
      icon: Newspaper,
      label: 'Announcements'
    },
    {
      to: '/admin/complaints',
      icon: AlertCircle,
      label: 'Complaints'
    },
    {
      to: '/admin/website-content',
      icon: Database,
      label: 'Website Content'
    },
    {
      to: '/admin/articles',
      icon: Newspaper,
      label: 'Articles'
    }
  ];

  return (
    <aside
      className={`
        fixed top-16 bottom-0 left-0 
        bg-white border-r shadow-sm
        transition-all duration-300 ease-in-out
        ${
          isMobile
            ? open
              ? 'w-64 translate-x-0'
              : '-translate-x-full'
            : 'w-64'
        }
        ${isMobile ? 'z-50' : 'z-30'}
      `}
    >
      <nav className='h-full py-4 overflow-y-auto'>
        <ul className='space-y-1 px-2'>
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-4 rounded-lg text-sm font-medium
                  transition-colors relative group
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className='h-5 w-5 flex-shrink-0' />
                <span className='transition-opacity duration-200'>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
