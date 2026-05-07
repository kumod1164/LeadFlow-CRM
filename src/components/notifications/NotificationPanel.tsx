'use client';

import { useEffect, useRef } from 'react';
import { INotification } from '@/models/Notification';
import NotificationItem from './NotificationItem';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell } from 'lucide-react';

interface NotificationPanelProps {
  notifications: INotification[];
  isLoading: boolean;
  onClose: () => void;
  onNotificationRead: (notificationId: string) => void;
}

/**
 * NotificationPanel component
 * Dropdown panel displaying list of unread notifications
 */
export default function NotificationPanel({
  notifications,
  isLoading,
  onClose,
  onNotificationRead,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <Card
      ref={panelRef}
      className="absolute right-0 top-12 w-96 max-h-[32rem] overflow-hidden shadow-lg border animate-in fade-in slide-in-from-top-2 duration-200 z-50"
    >
      <div className="p-4 border-b bg-muted/50">
        <h3 className="font-semibold text-sm">Notifications</h3>
      </div>

      <div className="overflow-y-auto max-h-[28rem]">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No new notifications"
            description="You're all caught up! New notifications will appear here."
            size="sm"
          />
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id.toString()}
                notification={notification}
                onRead={onNotificationRead}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
