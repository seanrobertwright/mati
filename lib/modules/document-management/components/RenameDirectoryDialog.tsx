'use client';

import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
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

interface RenameDirectoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directory: Directory | null;
  onRenameDirectory: (directoryId: string, newName: string) => Promise<void>;
}

export const RenameDirectoryDialog: React.FC<RenameDirectoryDialogProps> = ({
  open,
  onOpenChange,
  directory,
  onRenameDirectory,
}) => {
  const [name, setName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (directory && open) {
      setName(directory.name);
      setError(null);
    }
  }, [directory, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!directory) return;

    if (!name.trim()) {
      setError('Directory name is required');
      return;
    }

    if (name.trim() === directory.name) {
      onOpenChange(false);
      return;
    }

    if (name.length > 100) {
      setError('Directory name must be less than 100 characters');
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      setError('Directory name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    setIsRenaming(true);

    try {
      await onRenameDirectory(directory.id, name.trim());
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename directory');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleClose = () => {
    if (!isRenaming) {
      setName('');
      setError(null);
      onOpenChange(false);
    }
  };

  if (!directory) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Rename Directory
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "{directory.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-directory-name">New Directory Name</Label>
              <Input
                id="new-directory-name"
                placeholder="Enter new directory name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isRenaming}
                autoFocus
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'name-error' : undefined}
              />
              {error && (
                <p id="name-error" className="text-sm text-destructive">
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
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRenaming || !name.trim() || name.trim() === directory.name}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

