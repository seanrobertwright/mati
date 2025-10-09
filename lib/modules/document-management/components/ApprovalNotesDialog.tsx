'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ApprovalNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  action: 'approve' | 'reject' | 'request_changes';
  onConfirm: (notes: string) => void | Promise<void>;
  requireNotes?: boolean;
  isSubmitting?: boolean;
}

/**
 * ApprovalNotesDialog
 * 
 * Dialog for collecting notes when approving, rejecting, or requesting changes.
 * Can require notes or make them optional based on action type.
 * 
 * @example
 * ```tsx
 * <ApprovalNotesDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   action="approve"
 *   onConfirm={handleConfirm}
 *   requireNotes
 * />
 * ```
 */
export const ApprovalNotesDialog: React.FC<ApprovalNotesDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  action,
  onConfirm,
  requireNotes = false,
  isSubmitting = false,
}) => {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    // Validate notes
    if (requireNotes && !notes.trim()) {
      setError('Notes are required');
      return;
    }

    if ((action === 'reject' || action === 'request_changes') && !notes.trim()) {
      setError('Please provide a reason for this action');
      return;
    }

    try {
      await onConfirm(notes.trim());
      handleClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleClose = () => {
    setNotes('');
    setError('');
    onOpenChange(false);
  };

  const getDefaultTitle = () => {
    switch (action) {
      case 'approve':
        return 'Approve Document';
      case 'reject':
        return 'Reject Document';
      case 'request_changes':
        return 'Request Changes';
    }
  };

  const getDefaultDescription = () => {
    switch (action) {
      case 'approve':
        return 'Add optional notes about your approval.';
      case 'reject':
        return 'Please explain why you are rejecting this document.';
      case 'request_changes':
        return 'Describe the changes needed before approval.';
    }
  };

  const getConfirmButtonText = () => {
    if (isSubmitting) return 'Processing...';
    switch (action) {
      case 'approve':
        return 'Approve';
      case 'reject':
        return 'Reject';
      case 'request_changes':
        return 'Request Changes';
    }
  };

  const getConfirmButtonVariant = (): 'default' | 'destructive' => {
    return action === 'reject' ? 'destructive' : 'default';
  };

  const isRequired = requireNotes || action !== 'approve';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || getDefaultTitle()}</DialogTitle>
          <DialogDescription>
            {description || getDefaultDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes {isRequired && <span className="text-destructive">*</span>}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError('');
              }}
              placeholder={
                action === 'approve'
                  ? 'Optional notes about your approval...'
                  : 'Explain your decision...'
              }
              rows={5}
              disabled={isSubmitting}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              aria-required={isRequired}
              aria-invalid={!!error}
              aria-describedby={error ? 'notes-error' : undefined}
            />
            {error && (
              <div
                id="notes-error"
                className="flex items-center gap-1 text-sm text-destructive"
              >
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {getConfirmButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

