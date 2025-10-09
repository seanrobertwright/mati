'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'under_review'
  | 'archived';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const statusConfig: Record<
  DocumentStatus,
  {
    label: string;
    className: string;
  }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  pending_review: {
    label: 'Pending Review',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  pending_approval: {
    label: 'Pending Approval',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  archived: {
    label: 'Archived',
    className: 'bg-gray-100 text-gray-600 border-gray-300',
  },
};

/**
 * DocumentStatusBadge
 * 
 * Displays a colored badge for document status with consistent styling.
 * Used throughout the document management module to show document state.
 * 
 * @example
 * ```tsx
 * <DocumentStatusBadge status="approved" />
 * <DocumentStatusBadge status="pending_review" className="text-xs" />
 * ```
 */
export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
};

