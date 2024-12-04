'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export function AdminHeader() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className='bg-white shadow'>
      <div className='h-16 flex items-center justify-between px-6'>
        <h1 className='text-lg font-medium text-gray-900'>Admin Panel</h1>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <User className='h-5 w-5 text-gray-500' />
            <span className='text-sm text-gray-600'>Admin</span>
          </div>

          <button
            onClick={handleSignOut}
            className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900'
          >
            <LogOut className='h-5 w-5' />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
