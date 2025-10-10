'use client';

import { FileText, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/lib/db/repositories/documents';

interface DocumentListItemProps {
  document: Document;
  onClick: () => void;
  isSelected?: boolean;
  showCategory?: boolean;
  showOwner?: boolean;
  showStatus?: boolean;
  showReviewDate?: boolean;
  className?: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  pending_review: 'bg-blue-100 text-blue-800 border-blue-200',
  pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  under_review: 'bg-orange-100 text-orange-800 border-orange-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  under_review: 'Under Review',
  archived: 'Archived',
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return '-';
  
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `In ${diffDays}d`;
  } else {
    return date.toLocaleDateString();
  }
}

function isOverdue(date: Date | null | undefined): boolean {
  if (!date) return false;
  return date < new Date();
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  onClick,
  isSelected = false,
  showCategory = true,
  showOwner = true,
  showStatus = true,
  showReviewDate = true,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const reviewIsOverdue = isOverdue(document.nextReviewDate);

  return (
    <div
      role="listitem"
      aria-label={`Document: ${document.title}${reviewIsOverdue ? ', review overdue' : ''}`}
      aria-selected={isSelected}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
        'hover:bg-accent hover:border-accent-foreground/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'bg-accent border-accent-foreground/30 shadow-sm'
          : 'bg-card border-border',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 p-2 rounded-md',
          isSelected ? 'bg-primary/10' : 'bg-muted'
        )}
        aria-hidden="true"
      >
        <FileText
          className={cn(
            'h-5 w-5',
            isSelected ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title and metadata */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{document.title}</h3>
            {document.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {document.description}
              </p>
            )}
          </div>

          {/* Status badge */}
          {showStatus && (
            <Badge
              variant="outline"
              className={cn(
                'flex-shrink-0',
                statusColors[document.status] ||
                  'bg-gray-100 text-gray-800 border-gray-200'
              )}
            >
              {statusLabels[document.status] || document.status}
            </Badge>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {/* Last modified */}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>
              Modified {new Date(document.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Review date */}
          {showReviewDate && document.nextReviewDate && (
            <div
              className={cn(
                'flex items-center gap-1',
                reviewIsOverdue && 'text-destructive font-medium'
              )}
            >
              {reviewIsOverdue && <AlertCircle className="h-3 w-3" aria-label="Overdue" />}
              <span>Review: {formatDate(document.nextReviewDate)}</span>
            </div>
          )}

          {/* Category */}
          {showCategory && document.categoryId && (
            <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
              Category
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

