'use client';

import { GitPullRequest, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChangeRequestMetrics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  implemented: number;
  averageResolutionTime?: number; // in days
  openRate?: number; // percentage of pending vs total
}

interface ChangeRequestMetricsWidgetProps {
  /** Metrics data */
  metrics: ChangeRequestMetrics;
  /** Callback when a metric section is clicked for drill-down */
  onMetricClick?: (metricType: 'pending' | 'approved' | 'rejected' | 'implemented' | 'all') => void;
  /** Whether the data is currently loading */
  isLoading?: boolean;
  className?: string;
}

/**
 * ChangeRequestMetricsWidget
 * 
 * Displays change request metrics including status breakdown,
 * average resolution time, and open rate.
 * 
 * @example
 * ```tsx
 * <ChangeRequestMetricsWidget
 *   metrics={metrics}
 *   onMetricClick={handleMetricClick}
 * />
 * ```
 */
export const ChangeRequestMetricsWidget: React.FC<ChangeRequestMetricsWidgetProps> = ({
  metrics,
  onMetricClick,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusBreakdown = [
    {
      id: 'pending' as const,
      label: 'Pending',
      value: metrics.pending,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      id: 'approved' as const,
      label: 'Approved',
      value: metrics.approved,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 'rejected' as const,
      label: 'Rejected',
      value: metrics.rejected,
      icon: <XCircle className="h-4 w-4" />,
      color: 'text-red-600 bg-red-100',
    },
    {
      id: 'implemented' as const,
      label: 'Implemented',
      value: metrics.implemented,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Change Requests</h3>
        </div>
        <button
          onClick={() => onMetricClick?.('all')}
          disabled={!onMetricClick}
          className={cn(
            'text-2xl font-bold',
            onMetricClick && 'hover:text-primary cursor-pointer focus:outline-none'
          )}
        >
          {metrics.total}
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statusBreakdown.map((item) => (
          <button
            key={item.id}
            onClick={() => onMetricClick?.(item.id)}
            disabled={!onMetricClick}
            className={cn(
              'text-left rounded-lg border p-3 transition-colors',
              onMetricClick && 'hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-xl font-bold">{item.value}</div>
              </div>
              <div className={cn('p-1.5 rounded', item.color)}>
                {item.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="space-y-3 pt-3 border-t">
        {/* Average Resolution Time */}
        {metrics.averageResolutionTime !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Avg. Resolution Time</span>
            </div>
            <span className="font-semibold">
              {metrics.averageResolutionTime.toFixed(1)} days
            </span>
          </div>
        )}

        {/* Open Rate */}
        {metrics.openRate !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Open Rate</span>
            </div>
            <span className="font-semibold">
              {metrics.openRate.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Visual Indicator */}
      {metrics.total > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden">
          <div
            className="bg-yellow-500"
            style={{ width: `${(metrics.pending / metrics.total) * 100}%` }}
          />
          <div
            className="bg-green-500"
            style={{ width: `${(metrics.approved / metrics.total) * 100}%` }}
          />
          <div
            className="bg-red-500"
            style={{ width: `${(metrics.rejected / metrics.total) * 100}%` }}
          />
          <div
            className="bg-purple-500"
            style={{ width: `${(metrics.implemented / metrics.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

