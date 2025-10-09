'use client';

import { useState } from 'react';
import { ShieldCheck, Search, AlertCircle } from 'lucide-react';
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

export interface Approver {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AssignApproverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  currentApprover?: Approver;
  availableApprovers?: Approver[];
  onAssign: (approverId: string) => void | Promise<void>;
  isSubmitting?: boolean;
  allowSearch?: boolean;
  className?: string;
}

/**
 * AssignApproverDialog
 * 
 * Dialog for assigning an approver to a document.
 * Supports selecting from available approvers or searching by email.
 * 
 * @example
 * ```tsx
 * <AssignApproverDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   documentId="doc-123"
 *   availableApprovers={approvers}
 *   onAssign={handleAssign}
 * />
 * ```
 */
export const AssignApproverDialog: React.FC<AssignApproverDialogProps> = ({
  open,
  onOpenChange,
  documentId,
  currentApprover,
  availableApprovers = [],
  onAssign,
  isSubmitting = false,
  allowSearch = true,
  className,
}) => {
  const [selectedApproverId, setSelectedApproverId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedApproverId) {
      setError('Please select an approver');
      return;
    }

    try {
      await onAssign(selectedApproverId);
      handleClose();
    } catch (err) {
      setError('Failed to assign approver. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedApproverId('');
    setSearchQuery('');
    setError('');
    onOpenChange(false);
  };

  // Filter approvers based on search query
  const filteredApprovers = availableApprovers.filter(
    (approver) =>
      approver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approver.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Assign Approver
          </DialogTitle>
          <DialogDescription>
            Select a user to approve this document for final publication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Approver */}
          {currentApprover && (
            <div className="p-3 rounded-lg bg-muted border">
              <p className="text-xs text-muted-foreground mb-1">
                Current Approver
              </p>
              <p className="text-sm font-medium">{currentApprover.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentApprover.email}
              </p>
            </div>
          )}

          {/* Search */}
          {allowSearch && availableApprovers.length > 5 && (
            <div className="space-y-2">
              <Label htmlFor="search">Search Approvers</Label>
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

          {/* Approver List */}
          <div className="space-y-2">
            <Label>Select Approver</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {filteredApprovers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No approvers found</p>
                </div>
              ) : (
                filteredApprovers.map((approver) => {
                  const isSelected = selectedApproverId === approver.id;
                  const isCurrent = currentApprover?.id === approver.id;

                  return (
                    <button
                      key={approver.id}
                      type="button"
                      onClick={() => {
                        setSelectedApproverId(approver.id);
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
                            {approver.name}
                            {isCurrent && (
                              <span className="text-muted-foreground ml-1">
                                (Current)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {approver.email}
                          </p>
                          {approver.role && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {approver.role}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <ShieldCheck className="h-4 w-4 text-primary" />
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
            disabled={!selectedApproverId || isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Approver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

