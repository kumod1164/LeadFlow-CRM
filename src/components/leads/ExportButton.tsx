'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * ExportButton Client Component
 * 
 * Renders a CSV export button that:
 * - Only visible to Admin users
 * - Passes current URL search params (filters) to the /api/export endpoint
 * - Shows a loading state while the export is being generated
 * - Handles errors gracefully with alert notifications (toast would be better but not yet installed)
 * - Triggers a file download when successful
 * 
 * **Validates: Requirements 10.1, 10.4, 10.5**
 */
export function ExportButton() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Only show button to Admin users
  if (session?.user?.role !== 'admin') {
    return null;
  }

  /**
   * Handle CSV export
   * Fetches CSV from /api/export with current filter params
   * **Validates: Requirements 10.1, 10.4**
   */
  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Build URL with current filter params
      const params = new URLSearchParams(searchParams.toString());
      // Remove pagination params (we want all matching leads)
      params.delete('page');
      params.delete('limit');
      params.delete('sortBy');
      params.delete('sortOrder');

      const response = await fetch(`/api/export?${params.toString()}`);

      // Handle permission errors
      if (response.status === 403) {
        toast({
          title: 'Permission denied',
          description: 'You do not have permission to export leads.',
          variant: 'destructive',
        });
        return;
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
        toast({
          title: 'Export failed',
          description: errorData.error || 'Failed to export leads. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Get CSV content
      const csvContent = await response.text();

      // Create a blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Your leads have been exported to CSV.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast({
        title: 'Export error',
        description: 'An unexpected error occurred while exporting leads. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}
