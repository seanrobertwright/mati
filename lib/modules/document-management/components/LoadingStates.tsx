'use client';

import { Loader2, FileText, FolderOpen, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
};

interface DocumentListLoadingProps {
  count?: number;
  className?: string;
}

export const DocumentListLoading: React.FC<DocumentListLoadingProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card animate-pulse"
        >
          <div className="h-10 w-10 rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface DirectoryTreeLoadingProps {
  className?: string;
}

export const DirectoryTreeLoading: React.FC<DirectoryTreeLoadingProps> = ({ className }) => {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

interface LoadingMessageProps {
  message?: string;
  submessage?: string;
  icon?: 'file' | 'folder' | 'clock' | 'spinner';
  className?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({
  message = 'Loading...',
  submessage,
  icon = 'spinner',
  className,
}) => {
  const Icon = {
    file: FileText,
    folder: FolderOpen,
    clock: Clock,
    spinner: Loader2,
  }[icon];

  const iconClass = icon === 'spinner' ? 'animate-spin' : '';

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Icon className={cn('h-12 w-12 text-muted-foreground mb-4', iconClass)} />
      <p className="text-sm font-medium mb-1">{message}</p>
      {submessage && (
        <p className="text-xs text-muted-foreground">{submessage}</p>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: 'file' | 'folder' | 'search';
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file',
  title,
  description,
  action,
  className,
}) => {
  const Icon = {
    file: FileText,
    folder: FolderOpen,
    search: AlertCircle,
  }[icon];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} />
  );
};

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-3', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
};

