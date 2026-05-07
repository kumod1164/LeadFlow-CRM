import { formatDistanceToNow } from 'date-fns';
import { 
  UserPlus, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  XCircle,
  MessageSquare,
  Activity
} from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface ActivityEntry {
  action: string;
  userName: string;
  details?: string;
  timestamp: Date;
  leadName?: string;
}

interface RecentActivityProps {
  activities: ActivityEntry[];
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'Lead created':
      return <UserPlus className="w-4 h-4" />;
    case 'Stage changed':
      return <ArrowRight className="w-4 h-4" />;
    case 'Note added':
      return <MessageSquare className="w-4 h-4" />;
    case 'Lead updated':
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function getActivityColor(action: string) {
  switch (action) {
    case 'Lead created':
      return 'from-blue-500 to-indigo-600';
    case 'Stage changed':
      return 'from-purple-500 to-pink-600';
    case 'Note added':
      return 'from-green-500 to-emerald-600';
    case 'Lead updated':
      return 'from-orange-500 to-amber-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 6).map((activity, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          {/* Compact Icon */}
          <div className={`p-1.5 rounded-md bg-gradient-to-br ${getActivityColor(activity.action)} shadow-sm flex-shrink-0`}>
            <div className="text-white">
              {getActivityIcon(activity.action)}
            </div>
          </div>

          {/* Compact Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {activity.action}
                  {activity.leadName && (
                    <span className="text-gray-600 font-normal"> • {activity.leadName}</span>
                  )}
                </p>
                {activity.details && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  by {activity.userName}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {activities.length > 6 && (
        <div className="text-center pt-2">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}
