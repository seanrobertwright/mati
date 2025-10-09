'use client';

import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChangeRequestApproval {
  id: string;
  approverId: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  decidedAt?: Date | string;
  createdAt: Date | string;
}

interface ChangeRequestApprovalFlowProps {
  /** Array of approvals in the flow */
  approvals: ChangeRequestApproval[];
  /** Current status of the change request */
  changeRequestStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  /** Whether to show compact view */
  compact?: boolean;
  className?: string;
}

/**
 * ChangeRequestApprovalFlow
 * 
 * Displays the approval workflow for a change request, showing each approver,
 * their decision status, and any notes provided.
 * 
 * @example
 * ```tsx
 * <ChangeRequestApprovalFlow
 *   approvals={approvals}
 *   changeRequestStatus="under_review"
 * />
 * ```
 */
export const ChangeRequestApprovalFlow: React.FC<ChangeRequestApprovalFlowProps> = ({
  approvals,
  changeRequestStatus,
  compact = false,
  className,
}) => {
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
      return format(dateObj, compact ? 'PP' : 'PPP p');
    } catch {
      return 'Unknown date';
    }
  };

  const getStatusIcon = (status: ChangeRequestApproval['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: ChangeRequestApproval['status']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
    }
  };

  const getStatusColor = (status: ChangeRequestApproval['status']) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
    }
  };

  if (changeRequestStatus === 'draft') {
    return (
      <div className={cn('p-4 bg-muted/30 rounded-lg border text-center', className)}>
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Approval flow will begin once this change request is submitted
        </p>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className={cn('p-4 bg-muted/30 rounded-lg border text-center', className)}>
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No approvers assigned yet
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Status */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Approval Flow</h3>
        {changeRequestStatus === 'approved' && (
          <span className="text-sm text-green-600 font-medium">
            All approvals complete
          </span>
        )}
        {changeRequestStatus === 'rejected' && (
          <span className="text-sm text-red-600 font-medium">
            Rejected
          </span>
        )}
      </div>

      {/* Approval Steps */}
      <div className="space-y-3">
        {approvals.map((approval, index) => (
          <div
            key={approval.id}
            className={cn(
              'rounded-lg border p-4',
              approval.status === 'approved' && 'bg-green-50/50 border-green-200',
              approval.status === 'rejected' && 'bg-red-50/50 border-red-200',
              approval.status === 'pending' && 'bg-yellow-50/50 border-yellow-200'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(approval.status)}
              </div>

              {/* Approval Details */}
              <div className="flex-1 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {approval.approverName || 'Unknown Approver'}
                      </span>
                    </div>
                    <div className={cn('text-sm font-medium', getStatusColor(approval.status))}>
                      {getStatusLabel(approval.status)}
                    </div>
                  </div>

                  {/* Timestamp */}
                  {approval.decidedAt && (
                    <div className="text-xs text-muted-foreground text-right">
                      {formatDate(approval.decidedAt)}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {approval.notes && (
                  <div className="mt-2 p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                    <p className="text-sm whitespace-pre-wrap">{approval.notes}</p>
                  </div>
                )}

                {/* Pending State */}
                {approval.status === 'pending' && (
                  <p className="text-xs text-muted-foreground italic">
                    Awaiting decision...
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        {approvals.filter((a) => a.status === 'approved').length} approved • {' '}
        {approvals.filter((a) => a.status === 'rejected').length} rejected • {' '}
        {approvals.filter((a) => a.status === 'pending').length} pending
      </div>
    </div>
  );
};

