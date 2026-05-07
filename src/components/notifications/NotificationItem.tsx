'use client';

import { useRouter } from 'next/navigation';
import { INotification } from '@/models/Notification';
import { Bell, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface NotificationItemProps {
  notification: INotification;
  onRead: (notificationId: string) => void;
  onClose: () => void;
}

/**
 * NotificationItem component
 * Individual notification item with icon, message, and timestamp
 * Clicking marks as read and navigates to lead detail page
 */
export default function NotificationItem({
  notification,
  onRead,
  onClose,
}: NotificationItemProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      // Mark notification as read
      const response = await fetch(`/api/notifications/${notification._id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      onRead(notification._id.toString());

      // Close panel
      onClose();

      // Navigate to lead detail page
      router.push(`/leads/${notification.leadId}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  // Select icon based on notification type
  const Icon = notification.type === 'assignment' ? UserPlus : Bell;

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <button
      onClick={handleClick}
      className="w-full p-4 text-left hover:bg-accent transition-colors focus:outline-none focus:bg-accent group"
    >
      <div className="flex gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            notification.type === 'assignment'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
          } group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
        </div>
      </div>
    </button>
  );
}
