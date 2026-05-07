'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

/**
 * User type for the assigned user filter
 */
interface User {
  _id: string;
  name: string;
  email: string;
}

/**
 * LeadFilters Client Component
 * 
 * Provides filtering controls for the leads table:
 * - Search input (debounced 300ms) for name/email/company
 * - Stage select dropdown
 * - Assigned user select (Admin only)
 * - Date range picker for creation date
 * 
 * Updates URL search params on filter change, which triggers LeadsTable to refetch data.
 * 
 * **Validates: Requirements 6.3, 6.4, 6.5, 6.6, 6.8**
 */
export function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // State
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      return {
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      };
    }
    return undefined;
  });

  const isAdmin = session?.user?.role === 'admin';

  /**
   * Update URL search params
   */
  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  /**
   * Debounced search handler
   * **Validates: Requirement 6.3** (300ms debounce)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      if (searchValue !== currentSearch) {
        updateParams({ search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, updateParams]);

  /**
   * Fetch users for assignment dropdown (Admin only)
   * **Validates: Requirement 6.5**
   */
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const response = await fetch('/api/users');
          if (response.ok) {
            const data = await response.json();
            setUsers(data);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isAdmin]);

  /**
   * Handle stage filter change
   * **Validates: Requirement 6.4**
   */
  const handleStageChange = (value: string) => {
    updateParams({ stage: value === 'all' ? undefined : value });
  };

  /**
   * Handle assigned user filter change
   * **Validates: Requirement 6.5**
   */
  const handleAssignedUserChange = (value: string) => {
    updateParams({ assignedTo: value === 'all' ? undefined : value });
  };

  /**
   * Handle date range change
   * **Validates: Requirement 6.6**
   */
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    
    if (range?.from || range?.to) {
      updateParams({
        dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
        dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
      });
    } else {
      updateParams({
        dateFrom: undefined,
        dateTo: undefined,
      });
    }
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setSearchValue('');
    setDateRange(undefined);
    router.push('?page=1');
  };

  // Check if any filters are active
  const hasActiveFilters = 
    searchParams.get('search') ||
    searchParams.get('stage') ||
    searchParams.get('assignedTo') ||
    searchParams.get('dateFrom') ||
    searchParams.get('dateTo');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input - Requirement 6.3 */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Name, email, or company..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stage Filter - Requirement 6.4 */}
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select
            value={searchParams.get('stage') || 'all'}
            onValueChange={handleStageChange}
          >
            <SelectTrigger id="stage">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assigned User Filter - Requirement 6.5 (Admin only) */}
        {isAdmin && (
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned User</Label>
            <Select
              value={searchParams.get('assignedTo') || 'all'}
              onValueChange={handleAssignedUserChange}
              disabled={isLoadingUsers}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range Filter - Requirement 6.6 */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM d, yyyy')} -{' '}
                      {format(dateRange.to, 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM d, yyyy')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
              {dateRange && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateRangeChange(undefined)}
                    className="w-full"
                  >
                    Clear date range
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
