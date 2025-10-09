'use client';

import { Clock, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PendingApproval {
  id: string;
  documentId: string;
  documentTitle: string;
  status: 'pending_review' | 'pending_approval';
  submittedBy: string;
  submittedByName?: string;
  submittedAt: Date | string;
  daysWaiting: number;
  isUrgent?: boolean;
}

interface PendingApprovalsWidgetProps {
  approvals: PendingApproval[];
  role: 'reviewer' | 'approver';
  maxItems?: number;
  onViewAll?: () => void;
  onViewDocument?: (documentId: string) => void;
  className?: string;
}

/**
 * PendingApprovalsWidget
 * 
 * Dashboard widget showing documents pending review or approval.
 * Highlights urgent items and shows waiting time.
 * 
 * @example
 * ```tsx
 * <PendingApprovalsWidget
 *   approvals={pendingApprovals}
 *   role="reviewer"
 *   maxItems={5}
 *   onViewAll={() => navigate('/documents/pending')}
 *   onViewDocument={(id) => navigate(`/documents/${id}`)}
 * />
 * ```
 */
export const PendingApprovalsWidget: React.FC<PendingApprovalsWidgetProps> = ({
  approvals,
  role,
  maxItems = 5,
  onViewAll,
  onViewDocument,
  className,
}) => {
  const displayApprovals = approvals.slice(0, maxItems);
  const hasMore = approvals.length > maxItems;

  const formatRelativeTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getStatusLabel = (status: PendingApproval['status']) => {
    return status === 'pending_review' ? 'Pending Review' : 'Pending Approval';
  };

  const getStatusColor = (status: PendingApproval['status']) => {
    return status === 'pending_review'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  if (approvals.length === 0) {
    return (
      <div className={cn('border rounded-lg p-6 bg-card', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Pending {role === 'reviewer' ? 'Reviews' : 'Approvals'}
          </h3>
        </div>

        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No pending {role === 'reviewer' ? 'reviews' : 'approvals'}</p>
          <p className="text-xs mt-1">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Pending {role === 'reviewer' ? 'Reviews' : 'Approvals'}
          </h3>
          {approvals.length > 0 && (
            <Badge variant="default" className="ml-1">
              {approvals.length}
            </Badge>
          )}
        </div>

        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Approvals List */}
      <div className="divide-y">
        {displayApprovals.map((approval) => (
          <div
            key={approval.id}
            className={cn(
              'p-4 transition-colors hover:bg-accent/50',
              onViewDocument && 'cursor-pointer'
            )}
            onClick={() => onViewDocument?.(approval.documentId)}
            role={onViewDocument ? 'button' : undefined}
            tabIndex={onViewDocument ? 0 : undefined}
            onKeyDown={
              onViewDocument
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onViewDocument(approval.documentId);
                    }
                  }
                : undefined
            }
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium line-clamp-1">
                    {approval.documentTitle}
                  </h4>
                  {approval.isUrgent && (
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getStatusColor(approval.status))}
                  >
                    {getStatusLabel(approval.status)}
                  </Badge>

                  <span className="text-xs text-muted-foreground">
                    {approval.submittedByName || `User ${approval.submittedBy}`}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    • {formatRelativeTime(approval.submittedAt)}
                  </span>
                </div>

                {/* Waiting indicator */}
                {approval.daysWaiting > 0 && (
                  <div
                    className={cn(
                      'mt-2 text-xs',
                      approval.daysWaiting > 7
                        ? 'text-destructive font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Clock className="h-3 w-3 inline mr-1" />
                    Waiting {approval.daysWaiting} day{approval.daysWaiting !== 1 ? 's' : ''}
                    {approval.daysWaiting > 7 && ' (overdue)'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {hasMore && (
        <div className="p-4 border-t bg-muted/20">
          <button
            onClick={onViewAll}
            className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            + {approvals.length - maxItems} more pending{' '}
            {role === 'reviewer' ? 'review' : 'approval'}
            {approvals.length - maxItems !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

