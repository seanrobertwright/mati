'use client';

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Directory } from '@/lib/db/repositories/directories';

interface DirectoryBreadcrumbProps {
  currentDirectoryId: string | null;
  directories: Directory[];
  onNavigate: (directoryId: string | null) => void;
  className?: string;
}

/**
 * Build breadcrumb path from current directory to root
 */
function buildBreadcrumbPath(
  currentDirectoryId: string | null,
  directories: Directory[]
): Directory[] {
  if (currentDirectoryId === null) {
    return [];
  }

  const path: Directory[] = [];
  const dirMap = new Map(directories.map((d) => [d.id, d]));

  let currentId: string | null = currentDirectoryId;

  while (currentId !== null) {
    const dir = dirMap.get(currentId);
    if (!dir) break;

    path.unshift(dir);
    currentId = dir.parentId;
  }

  return path;
}

interface BreadcrumbItemProps {
  label: string;
  onClick: () => void;
  isLast: boolean;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  label,
  onClick,
  isLast,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={`Navigate to ${label}`}
        aria-current={isLast ? 'page' : undefined}
        className={cn(
          'px-2 py-1 rounded-md text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isLast
            ? 'text-foreground font-medium cursor-default'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer'
        )}
        onClick={!isLast ? onClick : undefined}
        onKeyDown={!isLast ? handleKeyDown : undefined}
        disabled={isLast}
      >
        {label}
      </button>
      {!isLast && (
        <ChevronRight
          className="h-4 w-4 text-muted-foreground flex-shrink-0"
          aria-hidden="true"
        />
      )}
    </>
  );
};

export const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({
  currentDirectoryId,
  directories,
  onNavigate,
  className,
}) => {
  const path = buildBreadcrumbPath(currentDirectoryId, directories);

  const handleRootClick = () => {
    onNavigate(null);
  };

  const handleRootKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRootClick();
    }
  };

  const isAtRoot = currentDirectoryId === null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        aria-label="Navigate to root"
        aria-current={isAtRoot ? 'page' : undefined}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isAtRoot
            ? 'text-foreground font-medium cursor-default'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer'
        )}
        onClick={!isAtRoot ? handleRootClick : undefined}
        onKeyDown={!isAtRoot ? handleRootKeyDown : undefined}
        disabled={isAtRoot}
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        <span>Documents</span>
      </button>

      {path.length > 0 && (
        <ChevronRight
          className="h-4 w-4 text-muted-foreground flex-shrink-0"
          aria-hidden="true"
        />
      )}

      {path.map((dir, index) => (
        <BreadcrumbItem
          key={dir.id}
          label={dir.name}
          onClick={() => onNavigate(dir.id)}
          isLast={index === path.length - 1}
        />
      ))}
    </nav>
  );
};

