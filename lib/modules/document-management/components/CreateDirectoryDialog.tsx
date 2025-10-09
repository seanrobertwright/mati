'use client';

import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
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

interface CreateDirectoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentDirectoryId: string | null;
  parentDirectoryName?: string;
  onCreateDirectory: (name: string, parentId: string | null) => Promise<void>;
}

export const CreateDirectoryDialog: React.FC<CreateDirectoryDialogProps> = ({
  open,
  onOpenChange,
  parentDirectoryId,
  parentDirectoryName,
  onCreateDirectory,
}) => {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Directory name is required');
      return;
    }

    if (name.length > 100) {
      setError('Directory name must be less than 100 characters');
      return;
    }

    // Validate directory name (no special characters that could cause issues)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      setError('Directory name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    setIsCreating(true);

    try {
      await onCreateDirectory(name.trim(), parentDirectoryId);
      setName('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create directory');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create New Directory
            </DialogTitle>
            <DialogDescription>
              {parentDirectoryName
                ? `Create a new subdirectory in "${parentDirectoryName}"`
                : 'Create a new directory in the root'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="directory-name">Directory Name</Label>
              <Input
                id="directory-name"
                placeholder="Enter directory name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? 'Creating...' : 'Create Directory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

