'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ApprovalAction = 'approve' | 'reject' | 'request_changes';

interface ApprovalActionButtonsProps {
  /** User's role in the approval process */
  role: 'reviewer' | 'approver';
  /** Whether actions are currently being processed */
  isProcessing?: boolean;
  /** Callback when approve is clicked */
  onApprove?: (notes?: string) => void | Promise<void>;
  /** Callback when reject is clicked */
  onReject?: (notes: string) => void | Promise<void>;
  /** Callback when request changes is clicked (reviewer only) */
  onRequestChanges?: (notes: string) => void | Promise<void>;
  /** Whether to require notes for all actions */
  requireNotes?: boolean;
  /** Custom approval button label */
  approveLabel?: string;
  /** Custom reject button label */
  rejectLabel?: string;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * ApprovalActionButtons
 * 
 * Action buttons for document approval workflow with role-based actions.
 * Reviewers can approve/request changes, Approvers can approve/reject.
 * 
 * @example
 * ```tsx
 * <ApprovalActionButtons
 *   role="reviewer"
 *   onApprove={handleApprove}
 *   onRequestChanges={handleRequestChanges}
 * />
 * 
 * <ApprovalActionButtons
 *   role="approver"
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   requireNotes
 * />
 * ```
 */
export const ApprovalActionButtons: React.FC<ApprovalActionButtonsProps> = ({
  role,
  isProcessing = false,
  onApprove,
  onReject,
  onRequestChanges,
  requireNotes = false,
  approveLabel,
  rejectLabel,
  orientation = 'horizontal',
  className,
}) => {
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<ApprovalAction | null>(null);
  const [notes, setNotes] = useState('');
  const [notesError, setNotesError] = useState('');

  const handleActionClick = async (action: ApprovalAction) => {
    if (requireNotes || action !== 'approve') {
      // Show notes dialog for reject/request_changes or if notes required
      setPendingAction(action);
      setShowNotesDialog(true);
      return;
    }

    // For approve without required notes, execute immediately
    if (action === 'approve' && onApprove) {
      await onApprove();
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    // Validate notes if required
    if (requireNotes && !notes.trim()) {
      setNotesError('Notes are required');
      return;
    }

    if ((pendingAction === 'reject' || pendingAction === 'request_changes') && !notes.trim()) {
      setNotesError('Please provide a reason');
      return;
    }

    try {
      if (pendingAction === 'approve' && onApprove) {
        await onApprove(notes || undefined);
      } else if (pendingAction === 'reject' && onReject) {
        await onReject(notes);
      } else if (pendingAction === 'request_changes' && onRequestChanges) {
        await onRequestChanges(notes);
      }

      // Close dialog and reset
      setShowNotesDialog(false);
      setPendingAction(null);
      setNotes('');
      setNotesError('');
    } catch (error) {
      console.error('Action failed:', error);
      setNotesError('Action failed. Please try again.');
    }
  };

  const handleCancelDialog = () => {
    setShowNotesDialog(false);
    setPendingAction(null);
    setNotes('');
    setNotesError('');
  };

  const getActionConfig = (action: ApprovalAction) => {
    switch (action) {
      case 'approve':
        return {
          label: approveLabel || (role === 'reviewer' ? 'Approve Review' : 'Approve'),
          icon: <CheckCircle className="h-4 w-4" />,
          variant: 'default' as const,
          description:
            role === 'reviewer'
              ? 'Approve and send to next stage'
              : 'Approve this document',
        };
      case 'reject':
        return {
          label: rejectLabel || 'Reject',
          icon: <XCircle className="h-4 w-4" />,
          variant: 'destructive' as const,
          description: 'Reject and send back to draft',
        };
      case 'request_changes':
        return {
          label: 'Request Changes',
          icon: <MessageSquare className="h-4 w-4" />,
          variant: 'outline' as const,
          description: 'Send back to author with feedback',
        };
    }
  };

  const containerClass = cn(
    'flex gap-2',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    className
  );

  return (
    <>
      <div className={containerClass}>
        {/* Approve Button */}
        {onApprove && (
          <Button
            variant="default"
            onClick={() => handleActionClick('approve')}
            disabled={isProcessing}
            className="gap-2"
            aria-label={role === 'reviewer' ? 'Approve review and send to next stage' : 'Approve this document'}
          >
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            {approveLabel || (role === 'reviewer' ? 'Approve Review' : 'Approve')}
          </Button>
        )}

        {/* Request Changes (Reviewer) or Reject (Approver) */}
        {role === 'reviewer' && onRequestChanges && (
          <Button
            variant="outline"
            onClick={() => handleActionClick('request_changes')}
            disabled={isProcessing}
            className="gap-2"
            aria-label="Request changes and send back to author with feedback"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Request Changes
          </Button>
        )}

        {role === 'approver' && onReject && (
          <Button
            variant="destructive"
            onClick={() => handleActionClick('reject')}
            disabled={isProcessing}
            className="gap-2"
            aria-label="Reject and send back to draft"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {rejectLabel || 'Reject'}
          </Button>
        )}
      </div>

      {/* Notes Dialog */}
      {showNotesDialog && pendingAction && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-dialog-title"
          aria-describedby="approval-dialog-description"
        >
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 id="approval-dialog-title" className="text-lg font-semibold mb-2">
                {getActionConfig(pendingAction).label}
              </h3>
              <p id="approval-dialog-description" className="text-sm text-muted-foreground">
                {getActionConfig(pendingAction).description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes {(requireNotes || pendingAction !== 'approve') && '*'}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setNotesError('');
                  }}
                  placeholder={
                    pendingAction === 'approve'
                      ? 'Optional notes about your approval'
                      : 'Please explain why...'
                  }
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  aria-required={requireNotes || pendingAction !== 'approve'}
                />
                {notesError && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>{notesError}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelDialog}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant={getActionConfig(pendingAction).variant}
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {getActionConfig(pendingAction).icon}
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

