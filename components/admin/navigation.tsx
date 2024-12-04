'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageCircle,
  Bell,
  FileText,
  Globe,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../logo';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Conversations',
    href: '/admin/conversations',
    icon: MessageCircle
  },
  {
    name: 'Enquiries',
    href: '/admin/enquiries',
    icon: AlertTriangle
  },
  {
    name: 'Announcements',
    href: '/admin/announcements',
    icon: Bell
  },
  {
    name: 'Articles',
    href: '/admin/articles',
    icon: FileText
  },
  {
    name: 'Website Content',
    href: '/admin/website-content',
    icon: Globe
  }
];

export function AdminNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className='lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className='h-6 w-6' />
        ) : (
          <Menu className='h-6 w-6' />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='h-full flex flex-col'>
          <div className='flex items-center justify-center h-16 border-b'>
            <Logo />
          </div>

          <nav className='flex-1 px-4 py-4 space-y-1'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    pathname === item.href ? 'text-gray-500' : 'text-gray-400'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
