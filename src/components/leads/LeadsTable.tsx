'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';

/**
 * Lead type matching the API response
 * **Validates: Requirements 6.1, 6.2, 6.7**
 */
interface Lead {
  _id: string;
  name: string;
  email: string;
  company?: string;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Won' | 'Lost';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadsTableProps {
  initialLeads: Lead[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

/**
 * Get badge variant based on pipeline stage
 */
function getStageBadgeVariant(
  stage: Lead['stage']
): 'default' | 'secondary' | 'success' | 'destructive' | 'warning' {
  switch (stage) {
    case 'New':
      return 'default';
    case 'Contacted':
      return 'secondary';
    case 'Qualified':
      return 'warning';
    case 'Won':
      return 'success';
    case 'Lost':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * LeadsTable Client Component
 * 
 * Implements a data table with @tanstack/react-table for lead management.
 * Uses URL search params for pagination, sorting, and filters to enable shareability.
 * Fetches data from GET /api/leads when params change.
 * 
 * **Validates: Requirements 6.1, 6.2, 6.7**
 */
export function LeadsTable({
  initialLeads,
  initialTotal,
  initialPage,
  initialTotalPages,
}: LeadsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Get current params from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLimit = parseInt(searchParams.get('limit') || '20', 10);
  const currentSortBy = searchParams.get('sortBy') || 'createdAt';
  const currentSortOrder = searchParams.get('sortOrder') || 'desc';

  /**
   * Update URL search params and fetch new data
   */
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters/sorting change (unless page is explicitly being updated)
    if (!updates.page && (updates.sortBy || updates.sortOrder)) {
      params.set('page', '1');
    }

    router.push(`?${params.toString()}`);
  };

  /**
   * Fetch leads from API based on current URL params
   */
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/leads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error loading leads',
        description: 'Failed to fetch leads. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch leads when URL params change
   */
  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Column definitions for the table
   * **Validates: Requirements 6.1, 6.7**
   */
  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === 'asc';
              updateParams({
                sortBy: 'name',
                sortOrder: isAsc ? 'desc' : 'asc',
              });
            }}
            className="h-8 px-2 hover:bg-muted"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <button
            onClick={() => router.push(`/leads/${row.original._id}`)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.getValue('name')}
          </button>
        );
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === 'asc';
              updateParams({
                sortBy: 'email',
                sortOrder: isAsc ? 'desc' : 'asc',
              });
            }}
            className="h-8 px-2 hover:bg-muted"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {row.getValue('email')}
          </span>
        );
      },
    },
    {
      accessorKey: 'company',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === 'asc';
              updateParams({
                sortBy: 'company',
                sortOrder: isAsc ? 'desc' : 'asc',
              });
            }}
            className="h-8 px-2 hover:bg-muted"
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const company = row.getValue('company') as string | undefined;
        return (
          <span className="text-sm">
            {company || <span className="text-muted-foreground">—</span>}
          </span>
        );
      },
    },
    {
      accessorKey: 'stage',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === 'asc';
              updateParams({
                sortBy: 'stage',
                sortOrder: isAsc ? 'desc' : 'asc',
              });
            }}
            className="h-8 px-2 hover:bg-muted"
          >
            Stage
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const stage = row.getValue('stage') as Lead['stage'];
        return (
          <Badge variant={getStageBadgeVariant(stage)}>
            {stage}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned User',
      cell: ({ row }) => {
        const assignedTo = row.getValue('assignedTo') as Lead['assignedTo'];
        return (
          <span className="text-sm">
            {assignedTo?.name || (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: 'followUpDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc = column.getIsSorted() === 'asc';
              updateParams({
                sortBy: 'followUpDate',
                sortOrder: isAsc ? 'desc' : 'asc',
              });
            }}
            className="h-8 px-2 hover:bg-muted"
          >
            Follow Up Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const followUpDate = row.getValue('followUpDate') as string | undefined;
        if (!followUpDate) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        try {
          return (
            <span className="text-sm">
              {format(new Date(followUpDate), 'MMM d, yyyy')}
            </span>
          );
        } catch {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
      },
    },
  ];

  /**
   * Initialize table with @tanstack/react-table
   */
  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  /**
   * Handle pagination
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      updateParams({ page: String(currentPage - 1) });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      updateParams({ page: String(currentPage + 1) });
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Data rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-auto p-0">
                  <EmptyState
                    icon={Inbox}
                    title="No leads found"
                    description="Try adjusting your filters or create a new lead to get started"
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {leads.length > 0 ? (currentPage - 1) * currentLimit + 1 : 0}{' '}
          to {Math.min(currentPage * currentLimit, total)} of {total} leads
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
