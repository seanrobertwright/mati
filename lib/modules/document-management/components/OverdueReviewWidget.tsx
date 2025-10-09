'use client';

import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface OverdueDocument {
  id: string;
  title: string;
  category?: string;
  nextReviewDate: Date | string;
  daysOverdue: number;
  owner?: string;
}

interface OverdueReviewWidgetProps {
  /** Array of overdue documents */
  overdueDocuments: OverdueDocument[];
  /** Maximum number of documents to show before "View All" */
  maxVisible?: number;
  /** Callback when a document is clicked */
  onDocumentClick?: (documentId: string) => void;
  /** Callback when "View All" is clicked */
  onViewAll?: () => void;
  /** Whether the data is currently loading */
  isLoading?: boolean;
  className?: string;
}

/**
 * OverdueReviewWidget
 * 
 * Displays documents that are overdue for review with drill-down capability.
 * Sorted by days overdue (most overdue first).
 * 
 * @example
 * ```tsx
 * <OverdueReviewWidget
 *   overdueDocuments={documents}
 *   onDocumentClick={handleClick}
 *   onViewAll={handleViewAll}
 *   maxVisible={5}
 * />
 * ```
 */
export const OverdueReviewWidget: React.FC<OverdueReviewWidgetProps> = ({
  overdueDocuments,
  maxVisible = 5,
  onDocumentClick,
  onViewAll,
  isLoading = false,
  className,
}) => {
  const sortedDocuments = [...overdueDocuments].sort(
    (a, b) => b.daysOverdue - a.daysOverdue
  );
  const visibleDocuments = sortedDocuments.slice(0, maxVisible);
  const hasMore = sortedDocuments.length > maxVisible;

  const getSeverityColor = (daysOverdue: number): string => {
    if (daysOverdue > 90) return 'text-red-700 bg-red-50 border-red-200';
    if (daysOverdue > 30) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  };

  const getSeverityDot = (daysOverdue: number): string => {
    if (daysOverdue > 90) return 'bg-red-600';
    if (daysOverdue > 30) return 'bg-orange-600';
    return 'bg-yellow-600';
  };

  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold">Overdue Reviews</h3>
          {overdueDocuments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              {overdueDocuments.length}
            </span>
          )}
        </div>
        {hasMore && onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Document List */}
      {overdueDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mb-2 opacity-20" />
          <p className="text-sm font-medium">All reviews are up to date</p>
          <p className="text-xs">Great work!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onDocumentClick?.(doc.id)}
              disabled={!onDocumentClick}
              className={cn(
                'w-full text-left rounded-lg border p-3 transition-colors',
                getSeverityColor(doc.daysOverdue),
                onDocumentClick && 'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Severity Indicator */}
                <div className="flex-shrink-0 mt-1.5">
                  <div className={cn('h-2 w-2 rounded-full', getSeverityDot(doc.daysOverdue))} />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-medium text-sm line-clamp-1">{doc.title}</div>
                  {doc.category && (
                    <div className="text-xs opacity-80">{doc.category}</div>
                  )}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold">
                      {doc.daysOverdue} {doc.daysOverdue === 1 ? 'day' : 'days'} overdue
                    </span>
                    {doc.owner && (
                      <>
                        <span>•</span>
                        <span>Owner: {doc.owner}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                {onDocumentClick && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 mt-1" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      {overdueDocuments.length > 0 && (
        <div className="text-xs text-muted-foreground pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-yellow-600" />
              <span>&lt;30 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-orange-600" />
              <span>30-90 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-600" />
              <span>&gt;90 days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

