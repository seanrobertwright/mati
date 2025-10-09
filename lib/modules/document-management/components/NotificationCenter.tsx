'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, AlertCircle, FileText, Calendar, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export type NotificationType = 'review_due' | 'approval_pending' | 'change_request' | 'document_updated' | 'approval_completed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  documentId?: string;
  documentTitle?: string;
  changeRequestId?: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (notificationId: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  review_due: Calendar,
  approval_pending: UserCheck,
  change_request: FileText,
  document_updated: FileText,
  approval_completed: Check,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  review_due: 'text-orange-500',
  approval_pending: 'text-blue-500',
  change_request: 'text-purple-500',
  document_updated: 'text-green-500',
  approval_completed: 'text-green-500',
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onNotificationClick,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = useCallback((notification: Notification) => {
    onMarkAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
      setOpen(false);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      setOpen(false);
    }
  }, [onMarkAsRead, onNotificationClick]);

  const handleDismiss = useCallback((e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    onDismiss(notificationId);
  }, [onDismiss]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('relative gap-2', className)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
          <DialogDescription>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 py-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type];
              const iconColor = NOTIFICATION_COLORS[notification.type];

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    notification.read
                      ? 'bg-background hover:bg-muted/50'
                      : 'bg-muted hover:bg-muted/70'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={cn('p-2 rounded-full bg-background', iconColor)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm font-medium',
                        !notification.read && 'font-semibold'
                      )}>
                        {notification.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={(e) => handleDismiss(e, notification.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Dismiss</span>
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>

                    {notification.documentTitle && (
                      <p className="text-xs text-muted-foreground">
                        <FileText className="inline h-3 w-3 mr-1" />
                        {notification.documentTitle}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

