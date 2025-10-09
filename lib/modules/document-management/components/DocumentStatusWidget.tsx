'use client';

import { BarChart3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DocumentStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

interface DocumentStatusWidgetProps {
  /** Status breakdown data */
  statusData: DocumentStatusData[];
  /** Total number of documents */
  totalDocuments: number;
  /** Callback when a status segment is clicked for drill-down */
  onStatusClick?: (status: string) => void;
  /** Display mode: 'chart' or 'list' */
  displayMode?: 'chart' | 'list';
  /** Whether the data is currently loading */
  isLoading?: boolean;
  className?: string;
}

/**
 * DocumentStatusWidget
 * 
 * Displays document status distribution as either a horizontal bar chart
 * or a detailed list view with percentages and counts.
 * 
 * @example
 * ```tsx
 * <DocumentStatusWidget
 *   statusData={statusData}
 *   totalDocuments={100}
 *   onStatusClick={handleStatusClick}
 *   displayMode="chart"
 * />
 * ```
 */
export const DocumentStatusWidget: React.FC<DocumentStatusWidgetProps> = ({
  statusData,
  totalDocuments,
  onStatusClick,
  displayMode = 'chart',
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (displayMode === 'list') {
    return (
      <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Document Status</h3>
        </div>

        {/* Status List */}
        {statusData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-sm">No documents</p>
          </div>
        ) : (
          <div className="space-y-2">
            {statusData.map((item) => (
              <button
                key={item.status}
                onClick={() => onStatusClick?.(item.status)}
                disabled={!onStatusClick}
                className={cn(
                  'w-full rounded-lg border p-3 transition-colors',
                  onStatusClick && 'hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-sm">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{item.count}</span>
                    <span className="font-medium min-w-[3rem] text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="pt-3 border-t text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Documents</span>
            <span className="font-bold">{totalDocuments}</span>
          </div>
        </div>
      </div>
    );
  }

  // Chart mode
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Document Status</h3>
      </div>

      {/* Horizontal Stacked Bar */}
      {statusData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mb-2 opacity-20" />
          <p className="text-sm">No documents</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {/* Stacked Bar */}
            <div className="flex h-8 rounded-lg overflow-hidden border">
              {statusData.map((item, index) => (
                <button
                  key={item.status}
                  onClick={() => onStatusClick?.(item.status)}
                  disabled={!onStatusClick || item.count === 0}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                  className={cn(
                    'transition-opacity relative group',
                    onStatusClick && item.count > 0 && 'hover:opacity-80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                  aria-label={`${item.status}: ${item.count} (${item.percentage.toFixed(1)}%)`}
                  title={`${item.status}: ${item.count} (${item.percentage.toFixed(1)}%)`}
                >
                  {/* Tooltip on hover */}
                  {item.percentage > 8 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {item.percentage.toFixed(0)}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {statusData.map((item) => (
                <div key={item.status} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate">
                    {item.status}
                  </span>
                  <span className="ml-auto font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">{totalDocuments}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

