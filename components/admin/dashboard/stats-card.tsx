import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className
}: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-semibold mt-2'>{value}</p>
          {trend && (
            <div className='flex items-center mt-2'>
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.value >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className='text-sm text-gray-500 ml-2'>{trend.label}</span>
            </div>
          )}
        </div>
        <div className='p-3 bg-gray-50 rounded-full'>
          <Icon className='h-6 w-6 text-gray-600' />
        </div>
      </div>
    </div>
  );
}
