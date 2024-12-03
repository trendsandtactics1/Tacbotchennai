'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  MessageCircle,
  FileQuestion,
  Clock,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StatsCard } from './stats-card';
import { RecentActivity } from './recent-activity';
import { AdminService } from '@/lib/services/admin-service';

export function DashboardContent() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalChats: number;
    totalEnquiries: number;
    activeEnquiries: number;
    todayChats: number;
    todayEnquiries: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await AdminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='text-center text-gray-500'>
        Failed to load dashboard statistics
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatsCard title='Total Users' value={stats.totalUsers} icon={Users} />
        <StatsCard
          title='Total Chats'
          value={stats.totalChats}
          icon={MessageCircle}
          trend={{
            value: stats.todayChats,
            label: 'Today'
          }}
        />
        <StatsCard
          title='Total Enquiries'
          value={stats.totalEnquiries}
          icon={FileQuestion}
          trend={{
            value: stats.todayEnquiries,
            label: 'Today'
          }}
        />
        <StatsCard
          title='Active Enquiries'
          value={stats.activeEnquiries}
          icon={Clock}
        />
      </div>

      <RecentActivity />
    </div>
  );
}
