'use client';

import { ChevronLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DrillDownContext {
  metricType: string;
  metricLabel: string;
  filterValue?: string;
  description?: string;
}

interface MetricsDrillDownProps {
  /** Current drill-down context */
  context: DrillDownContext;
  /** Callback to navigate back to metrics dashboard */
  onBack?: () => void;
  /** Child content - typically a filtered document list */
  children: React.ReactNode;
  /** Show document count */
  documentCount?: number;
  className?: string;
}

/**
 * MetricsDrillDown
 * 
 * Container component for drill-down views from metrics dashboard.
 * Provides context header and back navigation.
 * 
 * @example
 * ```tsx
 * <MetricsDrillDown
 *   context={{
 *     metricType: 'overdue-reviews',
 *     metricLabel: 'Overdue Reviews',
 *     description: 'Documents past their review date'
 *   }}
 *   onBack={handleBack}
 *   documentCount={15}
 * >
 *   <DocumentList documents={overdueDocuments} />
 * </MetricsDrillDown>
 * ```
 */
export const MetricsDrillDown: React.FC<MetricsDrillDownProps> = ({
  context,
  onBack,
  children,
  documentCount,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Metrics
          </Button>
        )}

        {/* Context Info */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{context.metricLabel}</h2>
              {context.description && (
                <p className="text-muted-foreground">{context.description}</p>
              )}
              {context.filterValue && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Filter:</span>
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                    {context.filterValue}
                  </span>
                </div>
              )}
            </div>

            {/* Document Count */}
            {documentCount !== undefined && (
              <div className="text-right">
                <div className="text-3xl font-bold">{documentCount}</div>
                <div className="text-sm text-muted-foreground">
                  {documentCount === 1 ? 'document' : 'documents'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drill-down Content */}
      <div>{children}</div>
    </div>
  );
};

