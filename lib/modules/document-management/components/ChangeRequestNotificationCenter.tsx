'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, MessageSquare, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChangeRequestNotification {
  id: string;
  type: 'new_request' | 'status_change' | 'new_comment' | 'approval_needed';
  changeRequestId: string;
  changeRequestTitle: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface ChangeRequestNotificationCenterProps {
  /** Array of notifications */
  notifications: ChangeRequestNotification[];
  /** Callback when a notification is clicked */
  onNotificationClick?: (notification: ChangeRequestNotification) => void;
  /** Callback to mark notification as read */
  onMarkAsRead?: (notificationId: string) => void;
  /** Callback to mark all notifications as read */
  onMarkAllAsRead?: () => void;
  /** Callback to dismiss a notification */
  onDismiss?: (notificationId: string) => void;
  /** Maximum number of notifications to show before scrolling */
  maxVisible?: number;
  className?: string;
}

/**
 * ChangeRequestNotificationCenter
 * 
 * Displays change request notifications with ability to mark as read,
 * navigate to the related change request, and dismiss notifications.
 * 
 * @example
 * ```tsx
 * <ChangeRequestNotificationCenter
 *   notifications={notifications}
 *   onNotificationClick={handleClick}
 *   onMarkAsRead={handleMarkAsRead}
 * />
 * ```
 */
export const ChangeRequestNotificationCenter: React.FC<ChangeRequestNotificationCenterProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  maxVisible = 10,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTimestamp = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const getNotificationIcon = (type: ChangeRequestNotification['type']) => {
    switch (type) {
      case 'new_request':
        return <FileText className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      case 'new_comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'approval_needed':
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: ChangeRequestNotification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative gap-2"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-background border rounded-lg shadow-lg z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({unreadCount} unread)
                  </span>
                )}
              </div>
              {unreadCount > 0 && onMarkAllAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notification List */}
            <div
              className="max-h-96 overflow-y-auto"
              style={{ maxHeight: `${maxVisible * 4}rem` }}
            >
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'border-b last:border-b-0 transition-colors',
                      notification.isRead ? 'bg-background' : 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3 p-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex-shrink-0 mt-0.5',
                          notification.isRead
                            ? 'text-muted-foreground'
                            : 'text-primary'
                        )}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="flex-1 text-left space-y-1 focus:outline-none group"
                      >
                        <p
                          className={cn(
                            'text-sm group-hover:text-primary transition-colors',
                            notification.isRead
                              ? 'text-muted-foreground'
                              : 'text-foreground font-medium'
                          )}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.changeRequestTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                      </button>

                      {/* Dismiss Button */}
                      {onDismiss && (
                        <button
                          onClick={() => onDismiss(notification.id)}
                          className="flex-shrink-0 p-1 hover:bg-muted rounded"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

