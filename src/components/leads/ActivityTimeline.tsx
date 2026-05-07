'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  UserPlus,
  ArrowRightLeft,
  FileText,
  Edit,
  Calendar,
  UserCheck,
} from 'lucide-react';

/**
 * Activity entry interface matching the Lead model
 */
interface ActivityEntry {
  action: string;
  userId: string;
  userName: string;
  details?: string;
  timestamp: string | Date;
}

interface ActivityTimelineProps {
  timeline: ActivityEntry[];
}

/**
 * Get icon component based on action type
 */
function getActionIcon(action: string) {
  const iconClass = 'w-5 h-5';

  if (action === 'Lead created') {
    return <UserPlus className={iconClass} />;
  } else if (action === 'Stage changed') {
    return <ArrowRightLeft className={iconClass} />;
  } else if (action === 'Note added') {
    return <FileText className={iconClass} />;
  } else if (action === 'Lead updated') {
    return <Edit className={iconClass} />;
  } else if (action === 'Lead assigned') {
    return <UserCheck className={iconClass} />;
  } else if (action === 'Follow-up date set') {
    return <Calendar className={iconClass} />;
  }

  // Default icon for unknown actions
  return <Edit className={iconClass} />;
}

/**
 * Get icon background color based on action type
 */
function getActionColor(action: string) {
  if (action === 'Lead created') {
    return 'bg-green-100 text-green-600';
  } else if (action === 'Stage changed') {
    return 'bg-blue-100 text-blue-600';
  } else if (action === 'Note added') {
    return 'bg-purple-100 text-purple-600';
  } else if (action === 'Lead updated') {
    return 'bg-orange-100 text-orange-600';
  } else if (action === 'Lead assigned') {
    return 'bg-indigo-100 text-indigo-600';
  } else if (action === 'Follow-up date set') {
    return 'bg-yellow-100 text-yellow-600';
  }

  // Default color for unknown actions
  return 'bg-gray-100 text-gray-600';
}

/**
 * ActivityTimeline Component
 *
 * Displays a chronological timeline of all actions taken on a lead.
 * Shows entries in descending order (newest first) with action-specific icons.
 *
 * **Validates: Requirements 7.4**
 */
export function ActivityTimeline({ timeline }: ActivityTimelineProps) {
  // Sort timeline in descending chronological order (newest first)
  const sortedTimeline = [...timeline].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });

  if (sortedTimeline.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTimeline.map((entry, index) => {
        const timestamp = new Date(entry.timestamp);
        const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

        return (
          <div key={index} className="flex gap-4">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(
                entry.action
              )}`}
            >
              {getActionIcon(entry.action)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {entry.action}
                  </p>
                  <p className="text-sm text-gray-600">
                    by {entry.userName}
                  </p>
                  {entry.details && (
                    <p className="text-sm text-gray-700 mt-1 font-medium">
                      {entry.details}
                    </p>
                  )}
                </div>
                <time
                  className="text-xs text-gray-500 whitespace-nowrap"
                  dateTime={timestamp.toISOString()}
                  title={timestamp.toLocaleString()}
                >
                  {timeAgo}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
