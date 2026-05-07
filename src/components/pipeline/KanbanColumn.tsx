'use client';

import { useDroppable } from '@dnd-kit/core';
import { PipelineStage } from '@/models/Lead';
import KanbanCard from './KanbanCard';
import { Lead } from './KanbanBoard';
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  count: number;
}

/**
 * Stage color configuration for visual distinction
 */
const stageColors: Record<
  PipelineStage,
  { bg: string; border: string; badge: string; text: string }
> = {
  New: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    badge: 'bg-blue-500 text-white',
    text: 'text-blue-900',
  },
  Contacted: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    badge: 'bg-purple-500 text-white',
    text: 'text-purple-900',
  },
  Qualified: {
    bg: 'from-amber-50 to-amber-100',
    border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    text: 'text-amber-900',
  },
  Won: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    badge: 'bg-green-500 text-white',
    text: 'text-green-900',
  },
  Lost: {
    bg: 'from-gray-50 to-gray-100',
    border: 'border-gray-200',
    badge: 'bg-gray-500 text-white',
    text: 'text-gray-900',
  },
};

/**
 * KanbanColumn Component
 * 
 * Represents a single column in the Kanban board.
 * Uses @dnd-kit/core's useDroppable hook to accept dropped cards.
 * 
 * Features:
 * - Droppable zone for lead cards
 * - Stage-specific color coding
 * - Lead count badge
 * - Empty state handling
 * - Premium visual design with gradients
 * 
 * **Validates: Requirements 8.1**
 */
export default function KanbanColumn({ stage, leads, count }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const colors = stageColors[stage];

  return (
    <div className="flex flex-col space-y-4">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${colors.bg} rounded-xl border ${colors.border} shadow-sm transition-all duration-200`}
      >
        <h3 className={`font-semibold ${colors.text}`}>{stage}</h3>
        <span
          className={`px-2.5 py-1 text-xs font-medium ${colors.badge} rounded-full shadow-sm`}
        >
          {count}
        </span>
      </div>

      {/* Droppable Cards Container */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 space-y-3 min-h-[400px] p-3 rounded-xl border-2 border-dashed transition-all duration-300
          ${
            isOver
              ? 'bg-blue-50/50 border-blue-400 shadow-lg scale-[1.02]'
              : 'bg-gray-50/30 border-gray-200'
          }
        `}
      >
        {/* Empty State */}
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            {isOver ? (
              <div className="text-blue-600 text-sm font-medium animate-pulse">
                Drop here
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title={`No ${stage} leads`}
                description="Drag leads here or create new ones"
                size="sm"
              />
            )}
          </div>
        ) : (
          /* Lead Cards */
          leads.map((lead) => <KanbanCard key={lead._id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
