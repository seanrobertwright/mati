'use client';

import { CheckCircle, XCircle, MessageSquare, FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ApprovalHistoryEntry {
  id: string;
  approverId: string;
  approverName: string;
  role: 'reviewer' | 'approver';
  status: 'approved' | 'rejected' | 'changes_requested' | 'pending';
  notes?: string;
  decidedAt?: Date | string;
  createdAt: Date | string;
}

interface ApprovalHistoryTimelineProps {
  entries: ApprovalHistoryEntry[];
  showPending?: boolean;
  className?: string;
}

const statusConfig = {
  approved: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-600 bg-green-100 border-green-300',
    label: 'Approved',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
  },
  rejected: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-red-600 bg-red-100 border-red-300',
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
  },
  changes_requested: {
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'text-orange-600 bg-orange-100 border-orange-300',
    label: 'Changes Requested',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  pending: {
    icon: <Clock className="h-5 w-5" />,
    color: 'text-blue-600 bg-blue-100 border-blue-300',
    label: 'Pending',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
};

const roleConfig = {
  reviewer: {
    label: 'Reviewer',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  approver: {
    label: 'Approver',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
};

/**
 * ApprovalHistoryTimeline
 * 
 * Displays chronological timeline of all approval actions on a document.
 * Shows who approved/rejected, when, and any notes provided.
 * 
 * @example
 * ```tsx
 * <ApprovalHistoryTimeline
 *   entries={approvalHistory}
 *   showPending
 * />
 * ```
 */
export const ApprovalHistoryTimeline: React.FC<ApprovalHistoryTimelineProps> = ({
  entries,
  showPending = true,
  className,
}) => {
  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateTime(d);
  };

  // Filter out pending entries if not showing them
  const filteredEntries = showPending
    ? entries
    : entries.filter((e) => e.status !== 'pending');

  // Sort by date descending (most recent first)
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const dateA = new Date(a.decidedAt || a.createdAt).getTime();
    const dateB = new Date(b.decidedAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  if (sortedEntries.length === 0) {
    return (
      <div className={cn('border rounded-lg p-8 bg-card', className)}>
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No approval history yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Approval History</h3>
        <p className="text-xs text-muted-foreground">
          Timeline of all approval actions
        </p>
      </div>

      <div className="space-y-4">
        {sortedEntries.map((entry, index) => {
          const isLast = index === sortedEntries.length - 1;
          const config = statusConfig[entry.status];
          const roleStyle = roleConfig[entry.role];

          return (
            <div key={entry.id} className="relative">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center',
                    config.color
                  )}
                >
                  {config.icon}
                </div>

                {/* Entry Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium">{entry.approverName}</p>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', roleStyle.color)}
                        >
                          {roleStyle.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(entry.decidedAt || entry.createdAt)}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn('text-xs flex-shrink-0', config.badgeClass)}
                    >
                      {config.label}
                    </Badge>
                  </div>

                  {/* Notes */}
                  {entry.notes && (
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {entry.notes}
                      </p>
                    </div>
                  )}

                  {/* Pending indicator */}
                  {entry.status === 'pending' && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      Awaiting decision...
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

