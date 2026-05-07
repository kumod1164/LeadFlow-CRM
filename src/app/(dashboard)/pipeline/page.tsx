'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { PipelineStage } from '@/models/Lead';
import KanbanBoard, { BoardState, Lead } from '@/components/pipeline/KanbanBoard';

// Skeleton loader component
function PipelineSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {['New', 'Contacted', 'Qualified', 'Won', 'Lost'].map((stage) => (
        <div key={stage} className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pipeline Page
 * 
 * Client Component that fetches all accessible leads and displays them
 * in a Kanban board grouped by pipeline stage.
 * 
 * **Validates: Requirements 8.1, 8.6**
 */
export default function PipelinePage() {
  const { data: session, status } = useSession();
  const [boardState, setBoardState] = useState<BoardState>({
    New: [],
    Contacted: [],
    Qualified: [],
    Won: [],
    Lost: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all leads and group by stage
  useEffect(() => {
    async function fetchLeads() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all leads (no pagination) - API applies role-based filtering
        const response = await fetch('/api/leads?limit=1000');
        
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }

        const data = await response.json();
        const leads: Lead[] = data.leads;

        // Group leads by stage
        const grouped: BoardState = {
          New: [],
          Contacted: [],
          Qualified: [],
          Won: [],
          Lost: [],
        };

        leads.forEach((lead) => {
          if (grouped[lead.stage]) {
            grouped[lead.stage].push(lead);
          }
        });

        setBoardState(grouped);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load pipeline. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Sales Pipeline
          </h1>
          <p className="text-gray-600">
            Visualize and manage your leads through each stage of the sales process.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <PipelineSkeleton />}

        {/* Kanban Board */}
        {!isLoading && !error && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <KanbanBoard initialBoardState={boardState} />
          </div>
        )}
      </div>
    </div>
  );
}
