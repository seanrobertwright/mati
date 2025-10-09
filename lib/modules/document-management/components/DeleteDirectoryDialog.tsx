'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Directory } from '@/lib/db/repositories/directories';

interface DeleteDirectoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directory: Directory | null;
  onDeleteDirectory: (directoryId: string) => Promise<void>;
  hasSubdirectories?: boolean;
  documentCount?: number;
}

export const DeleteDirectoryDialog: React.FC<DeleteDirectoryDialogProps> = ({
  open,
  onOpenChange,
  directory,
  onDeleteDirectory,
  hasSubdirectories = false,
  documentCount = 0,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmText('');
      setError(null);
    }
  }, [open]);

  if (!directory) return null;

  const expectedConfirmText = directory.name;
  const isConfirmed = confirmText === expectedConfirmText;
  const hasContent = hasSubdirectories || documentCount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfirmed) {
      setError('Please type the directory name to confirm deletion');
      return;
    }

    setIsDeleting(true);

    try {
      await onDeleteDirectory(directory.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete directory');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Directory
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "{directory.name}"?
              </p>
              {hasContent && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1 text-sm">
                    <p className="font-medium text-destructive">Warning: This directory is not empty!</p>
                    <ul className="list-disc list-inside space-y-0.5 text-destructive/90">
                      {hasSubdirectories && <li>Contains subdirectories</li>}
                      {documentCount > 0 && <li>Contains {documentCount} document{documentCount !== 1 ? 's' : ''}</li>}
                    </ul>
                    <p className="text-destructive/90">
                      All subdirectories and documents will be permanently deleted.
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <strong>{expectedConfirmText}</strong> to confirm:
              </Label>
              <Input
                id="confirm-delete"
                placeholder={expectedConfirmText}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isDeleting}
                autoFocus
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'confirm-error' : undefined}
              />
              {error && (
                <p id="confirm-error" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeleting || !isConfirmed}
            >
              {isDeleting ? 'Deleting...' : 'Delete Directory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

