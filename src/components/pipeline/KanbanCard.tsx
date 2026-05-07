'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from './KanbanBoard';
import { Mail, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanCardProps {
  lead: Lead;
  isDragging?: boolean;
}

/**
 * KanbanCard Component
 * 
 * Represents a single draggable lead card in the Kanban board.
 * Uses @dnd-kit/core's useDraggable hook for drag functionality.
 * 
 * Features:
 * - Draggable lead card
 * - Displays lead name, company, email, and assigned user
 * - Premium design with hover effects and smooth transitions
 * - Visual feedback during drag (opacity, scale, shadow)
 * - Avatar for assigned user
 * 
 * **Validates: Requirements 8.2**
 */
export default function KanbanCard({ lead, isDragging = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isActiveDrag } = useDraggable({
    id: lead._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Don't render the original card when it's being dragged (DragOverlay handles it)
  if (isActiveDrag && !isDragging) {
    return (
      <div className="bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300 opacity-40">
        <div className="h-20" />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative bg-white rounded-xl p-4 shadow-md border border-gray-200
        hover:shadow-xl hover:border-blue-300 hover:scale-[1.02]
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'shadow-2xl border-blue-400' : ''}
      `}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 rounded-xl transition-all duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative space-y-3">
        {/* Lead Name */}
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {lead.name}
        </h4>

        {/* Company */}
        {lead.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}

        {/* Email */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">{lead.email}</span>
        </div>

        {/* Follow-up Date */}
        {lead.followUpDate && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Follow-up: {format(new Date(lead.followUpDate), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Assigned User */}
        {lead.assignedTo && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {/* Avatar with gradient */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-md ring-2 ring-white">
              {lead.assignedTo.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 font-medium truncate">
              {lead.assignedTo.name}
            </span>
          </div>
        )}
      </div>

      {/* Drag indicator (subtle dots) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity">
        <div className="flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-gray-400" />
          <div className="w-1 h-1 rounded-full bg-gray-400" />
          <div className="w-1 h-1 rounded-full bg-gray-400" />
        </div>
      </div>
    </div>
  );
}
