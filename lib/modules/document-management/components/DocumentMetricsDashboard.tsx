'use client';

import { AlertTriangle, FileText, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface DocumentMetrics {
  totalDocuments: number;
  approvedDocuments: number;
  pendingApproval: number;
  overdueReviews: number;
  upcomingReviews: number;
  draftDocuments: number;
  totalChangeRequests: number;
  pendingChangeRequests: number;
  averageApprovalTime?: number; // in days
  complianceRate?: number; // percentage
}

interface DocumentMetricsDashboardProps {
  /** Metrics data to display */
  metrics: DocumentMetrics;
  /** Callback when a metric card is clicked for drill-down */
  onMetricClick?: (metricType: string) => void;
  /** Whether metrics are currently loading */
  isLoading?: boolean;
  className?: string;
}

interface MetricCard {
  id: string;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  description?: string;
}

/**
 * DocumentMetricsDashboard
 * 
 * Displays key document management metrics in a grid of cards.
 * Supports drill-down navigation when cards are clicked.
 * 
 * @example
 * ```tsx
 * <DocumentMetricsDashboard
 *   metrics={metrics}
 *   onMetricClick={handleMetricClick}
 * />
 * ```
 */
export const DocumentMetricsDashboard: React.FC<DocumentMetricsDashboardProps> = ({
  metrics,
  onMetricClick,
  isLoading = false,
  className,
}) => {
  const metricCards: MetricCard[] = [
    {
      id: 'total-documents',
      label: 'Total Documents',
      value: metrics.totalDocuments,
      icon: <FileText className="h-6 w-6" />,
      color: 'text-blue-600 bg-blue-100',
      description: 'All documents in the system',
    },
    {
      id: 'approved-documents',
      label: 'Approved',
      value: metrics.approvedDocuments,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600 bg-green-100',
      description: 'Currently approved and active',
    },
    {
      id: 'pending-approval',
      label: 'Pending Approval',
      value: metrics.pendingApproval,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Awaiting review or approval',
    },
    {
      id: 'overdue-reviews',
      label: 'Overdue Reviews',
      value: metrics.overdueReviews,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-red-600 bg-red-100',
      description: 'Documents past their review date',
    },
    {
      id: 'upcoming-reviews',
      label: 'Upcoming Reviews',
      value: metrics.upcomingReviews,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-orange-600 bg-orange-100',
      description: 'Reviews due in the next 30 days',
    },
    {
      id: 'draft-documents',
      label: 'Drafts',
      value: metrics.draftDocuments,
      icon: <FileText className="h-6 w-6" />,
      color: 'text-gray-600 bg-gray-100',
      description: 'Documents in draft status',
    },
    {
      id: 'change-requests',
      label: 'Change Requests',
      value: `${metrics.pendingChangeRequests}/${metrics.totalChangeRequests}`,
      icon: <FileText className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-100',
      description: 'Pending / Total change requests',
    },
    {
      id: 'compliance-rate',
      label: 'Compliance Rate',
      value: metrics.complianceRate !== undefined ? `${metrics.complianceRate.toFixed(1)}%` : 'N/A',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-teal-600 bg-teal-100',
      description: 'Percentage of compliant documents',
    },
  ];

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-6 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {metricCards.map((card) => (
        <button
          key={card.id}
          onClick={() => onMetricClick?.(card.id)}
          disabled={!onMetricClick}
          className={cn(
            'text-left transition-all rounded-lg border bg-card p-6 shadow-sm',
            onMetricClick &&
              'hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer'
          )}
        >
          <Card className="border-0 shadow-none p-0">
            {/* Icon */}
            <div className="flex items-center justify-between mb-3">
              <div className={cn('p-2 rounded-lg', card.color)}>
                {card.icon}
              </div>
            </div>

            {/* Label */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              {/* Value */}
              <p className="text-3xl font-bold">{card.value}</p>
            </div>

            {/* Description */}
            {card.description && (
              <p className="text-xs text-muted-foreground mt-2">
                {card.description}
              </p>
            )}
          </Card>
        </button>
      ))}
    </div>
  );
};

