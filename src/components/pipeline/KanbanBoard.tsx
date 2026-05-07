'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { PipelineStage } from '@/models/Lead';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { useToast } from '@/hooks/use-toast';

/**
 * Lead interface matching the API response
 */
export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: PipelineStage;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Board state type: Record of stage to leads array
 */
export type BoardState = Record<PipelineStage, Lead[]>;

interface KanbanBoardProps {
  initialBoardState: BoardState;
  onStageUpdate?: (leadId: string, newStage: PipelineStage) => Promise<void>;
}

/**
 * KanbanBoard Component
 * 
 * Implements a drag-and-drop Kanban board using @dnd-kit/core.
 * Features:
 * - 5 columns (one per pipeline stage)
 * - Drag-and-drop with smooth animations
 * - Optimistic updates with error rollback
 * - Premium UI with gradients and shadows
 * 
 * **Validates: Requirements 8.1**
 */
export default function KanbanBoard({
  initialBoardState,
  onStageUpdate,
}: KanbanBoardProps) {
  const [boardState, setBoardState] = useState<BoardState>(initialBoardState);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previousState, setPreviousState] = useState<BoardState | null>(null);
  const { toast } = useToast();

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Find the active lead being dragged
  const activeLead = activeId
    ? Object.values(boardState)
        .flat()
        .find((lead) => lead._id === activeId)
    : null;

  /**
   * Handle drag start
   */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Save current state for potential rollback
    setPreviousState(JSON.parse(JSON.stringify(boardState)));
  };

  /**
   * Handle drag end with optimistic update
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) {
      setPreviousState(null);
      return;
    }

    const leadId = active.id as string;
    const targetStage = over.id as PipelineStage;

    // Find the lead and its current stage
    let currentStage: PipelineStage | null = null;
    let lead: Lead | null = null;

    for (const [stage, leads] of Object.entries(boardState) as [
      PipelineStage,
      Lead[]
    ][]) {
      const foundLead = leads.find((l) => l._id === leadId);
      if (foundLead) {
        currentStage = stage;
        lead = foundLead;
        break;
      }
    }

    // If no change in stage, do nothing
    if (!lead || !currentStage || currentStage === targetStage) {
      setPreviousState(null);
      return;
    }

    // Optimistic update: move card to new column
    const newBoardState = { ...boardState };
    newBoardState[currentStage] = newBoardState[currentStage].filter(
      (l) => l._id !== leadId
    );
    newBoardState[targetStage] = [
      ...newBoardState[targetStage],
      { ...lead, stage: targetStage },
    ];
    setBoardState(newBoardState);

    // Call API to update stage
    try {
      if (onStageUpdate) {
        await onStageUpdate(leadId, targetStage);
      } else {
        // Default API call if no custom handler provided
        const response = await fetch('/api/pipeline', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, stage: targetStage }),
        });

        if (!response.ok) {
          throw new Error('Failed to update lead stage');
        }
      }

      // Success - clear previous state
      setPreviousState(null);

      toast({
        title: 'Stage updated',
        description: `${lead.name} moved to ${targetStage}`,
        variant: 'default',
      });
    } catch (error) {
      // Error - revert to previous state
      if (previousState) {
        setBoardState(previousState);
      }
      setPreviousState(null);

      console.error('Error updating lead stage:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update lead stage. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stages: PipelineStage[] = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={boardState[stage]}
            count={boardState[stage].length}
          />
        ))}
      </div>

      {/* Drag overlay for smooth dragging animation */}
      <DragOverlay>
        {activeLead ? (
          <div className="rotate-3 scale-105 opacity-90">
            <KanbanCard lead={activeLead} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
