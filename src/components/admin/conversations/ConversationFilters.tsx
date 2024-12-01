import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ConversationFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

export interface FilterOptions {
  sessionId: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export function ConversationFilters({ onFilterChange, onResetFilters }: ConversationFiltersProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleSessionIdChange = (value: string) => {
    setSessionId(value);
  };

  const handleSubmitSearch = () => {
    if (sessionId.trim()) {
      onFilterChange({ sessionId: sessionId.trim(), dateRange: date });
    }
  };

  const handleDateChange = (newDate: { from: Date | undefined; to: Date | undefined }) => {
    setDate(newDate);
    if (newDate.from && newDate.to) {
      onFilterChange({ 
        sessionId: sessionId.trim(), 
        dateRange: newDate 
      });
    }
  };

  const handleApplyDateFilter = () => {
    if (date.from) {
      onFilterChange({
        sessionId: sessionId.trim(),
        dateRange: {
          from: date.from,
          to: date.to || date.from
        }
      });
    }
  };

  const handleReset = () => {
    setSessionId('');
    setDate({ from: undefined, to: undefined });
    onResetFilters();
  };

  const handleClearSessionId = () => {
    setSessionId('');
    onResetFilters();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border mb-4">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter Session ID..."
              value={sessionId}
              onChange={(e) => handleSessionIdChange(e.target.value)}
              className="pl-9 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitSearch();
                }
              }}
            />
            {sessionId && (
              <button
                onClick={handleClearSessionId}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleSubmitSearch}
          >
            Search
          </Button>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal whitespace-nowrap min-w-[240px]",
                  !date.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date.from}
                  selected={date}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDate({ from: undefined, to: undefined });
                      onResetFilters();
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyDateFilter}
                    disabled={!date.from}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="whitespace-nowrap"
        >
          Show All
        </Button>
      </div>
    </div>
  );
} 