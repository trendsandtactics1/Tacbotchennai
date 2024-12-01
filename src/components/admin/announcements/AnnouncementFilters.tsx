import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FilterOptions {
  search: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  status: 'all' | 'active' | 'inactive';
}

interface AnnouncementFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

export function AnnouncementFilters({
  onFilterChange,
  onResetFilters
}: AnnouncementFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    dateRange: {
      from: undefined,
      to: undefined
    },
    status: 'all'
  });

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (value: 'all' | 'active' | 'inactive') => {
    const newFilters = { ...filters, status: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      dateRange: {
        from: undefined,
        to: undefined
      },
      status: 'all'
    });
    onResetFilters();
  };

  return (
    <div className='bg-white rounded-lg border p-4 space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Search */}
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Search announcements...'
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9 pr-10'
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'justify-start text-left font-normal w-[240px]',
                !filters.dateRange.from && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                    {format(filters.dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              initialFocus
              mode='range'
              defaultMonth={filters.dateRange.from}
              selected={filters.dateRange}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(value: 'all' | 'active' | 'inactive') =>
            handleStatusChange(value)
          }
        >
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {(filters.search || filters.dateRange.from || filters.status !== 'all') && (
          <Button variant='outline' onClick={handleReset}>
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
} 