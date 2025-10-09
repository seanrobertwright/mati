'use client';

import { useState } from 'react';
import { UserCheck, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AssignReviewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  currentReviewer?: Reviewer;
  availableReviewers?: Reviewer[];
  onAssign: (reviewerId: string) => void | Promise<void>;
  isSubmitting?: boolean;
  allowSearch?: boolean;
  className?: string;
}

/**
 * AssignReviewerDialog
 * 
 * Dialog for assigning a reviewer to a document.
 * Supports selecting from available reviewers or searching by email.
 * 
 * @example
 * ```tsx
 * <AssignReviewerDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   documentId="doc-123"
 *   availableReviewers={reviewers}
 *   onAssign={handleAssign}
 * />
 * ```
 */
export const AssignReviewerDialog: React.FC<AssignReviewerDialogProps> = ({
  open,
  onOpenChange,
  documentId,
  currentReviewer,
  availableReviewers = [],
  onAssign,
  isSubmitting = false,
  allowSearch = true,
  className,
}) => {
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedReviewerId) {
      setError('Please select a reviewer');
      return;
    }

    try {
      await onAssign(selectedReviewerId);
      handleClose();
    } catch (err) {
      setError('Failed to assign reviewer. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedReviewerId('');
    setSearchQuery('');
    setError('');
    onOpenChange(false);
  };

  // Filter reviewers based on search query
  const filteredReviewers = availableReviewers.filter(
    (reviewer) =>
      reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reviewer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Reviewer
          </DialogTitle>
          <DialogDescription>
            Select a user to review this document before approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Reviewer */}
          {currentReviewer && (
            <div className="p-3 rounded-lg bg-muted border">
              <p className="text-xs text-muted-foreground mb-1">
                Current Reviewer
              </p>
              <p className="text-sm font-medium">{currentReviewer.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentReviewer.email}
              </p>
            </div>
          )}

          {/* Search */}
          {allowSearch && availableReviewers.length > 5 && (
            <div className="space-y-2">
              <Label htmlFor="search">Search Reviewers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Reviewer List */}
          <div className="space-y-2">
            <Label>Select Reviewer</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {filteredReviewers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No reviewers found</p>
                </div>
              ) : (
                filteredReviewers.map((reviewer) => {
                  const isSelected = selectedReviewerId === reviewer.id;
                  const isCurrent = currentReviewer?.id === reviewer.id;

                  return (
                    <button
                      key={reviewer.id}
                      type="button"
                      onClick={() => {
                        setSelectedReviewerId(reviewer.id);
                        setError('');
                      }}
                      disabled={isSubmitting}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        'hover:bg-accent hover:border-accent-foreground/20',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected && 'bg-primary/10 border-primary',
                        isCurrent && 'opacity-60'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {reviewer.name}
                            {isCurrent && (
                              <span className="text-muted-foreground ml-1">
                                (Current)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {reviewer.email}
                          </p>
                          {reviewer.role && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {reviewer.role}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <UserCheck className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedReviewerId || isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Reviewer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

