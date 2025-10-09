'use client';

import { formatDistanceToNow, format } from 'date-fns';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActivityType = 
  | 'document_created'
  | 'document_updated'
  | 'document_approved'
  | 'document_rejected'
  | 'document_deleted'
  | 'version_uploaded'
  | 'change_request_created'
  | 'change_request_approved'
  | 'change_request_rejected'
  | 'comment_added';

export interface Activity {
  id: string;
  type: ActivityType;
  entityId: string;
  entityTitle: string;
  userId: string;
  userName?: string;
  description: string;
  timestamp: Date | string;
  metadata?: Record<string, unknown>;
}

interface RecentActivityTimelineProps {
  /** Array of activities to display */
  activities: Activity[];
  /** Maximum number of activities to show */
  maxActivities?: number;
  /** Callback when an activity is clicked */
  onActivityClick?: (activity: Activity) => void;
  /** Whether the data is currently loading */
  isLoading?: boolean;
  /** Show relative or absolute timestamps */
  timestampFormat?: 'relative' | 'absolute';
  className?: string;
}

/**
 * RecentActivityTimeline
 * 
 * Displays a timeline of recent document management activities
 * with icons, descriptions, and timestamps.
 * 
 * @example
 * ```tsx
 * <RecentActivityTimeline
 *   activities={activities}
 *   maxActivities={10}
 *   onActivityClick={handleClick}
 * />
 * ```
 */
export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  activities,
  maxActivities = 10,
  onActivityClick,
  isLoading = false,
  timestampFormat = 'relative',
  className,
}) => {
  const visibleActivities = activities.slice(0, maxActivities);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'document_created':
        return <FileText className="h-4 w-4" />;
      case 'document_updated':
        return <Edit className="h-4 w-4" />;
      case 'document_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'document_rejected':
        return <XCircle className="h-4 w-4" />;
      case 'document_deleted':
        return <Trash2 className="h-4 w-4" />;
      case 'version_uploaded':
        return <Upload className="h-4 w-4" />;
      case 'change_request_created':
      case 'change_request_approved':
      case 'change_request_rejected':
        return <FileText className="h-4 w-4" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType): string => {
    switch (type) {
      case 'document_created':
      case 'version_uploaded':
      case 'change_request_created':
        return 'text-blue-600 bg-blue-100';
      case 'document_approved':
      case 'change_request_approved':
        return 'text-green-600 bg-green-100';
      case 'document_rejected':
      case 'change_request_rejected':
      case 'document_deleted':
        return 'text-red-600 bg-red-100';
      case 'document_updated':
      case 'comment_added':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
      if (timestampFormat === 'relative') {
        return formatDistanceToNow(dateObj, { addSuffix: true });
      }
      return format(dateObj, 'PPp');
    } catch {
      return 'Unknown time';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mb-2 opacity-20" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-1">
          {visibleActivities.map((activity, index) => (
            <button
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              disabled={!onActivityClick}
              className={cn(
                'w-full text-left rounded-lg p-3 transition-colors',
                onActivityClick && 'hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn('p-2 rounded-full', getActivityColor(activity.type))}>
                    {getActivityIcon(activity.type)}
                  </div>
                  {/* Timeline connector */}
                  {index < visibleActivities.length - 1 && (
                    <div className="flex-1 w-0.5 bg-border mt-2" style={{ minHeight: '1rem' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1 space-y-1">
                  {/* Description */}
                  <p className="text-sm font-medium line-clamp-2">
                    {activity.description}
                  </p>

                  {/* Entity Title */}
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {activity.entityTitle}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activity.userName && (
                      <>
                        <span>{activity.userName}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* View More */}
      {activities.length > maxActivities && (
        <div className="pt-3 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Showing {maxActivities} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  );
};

