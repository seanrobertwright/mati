'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ChangeRequestStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'implemented';

type ChangeRequestPriority = 'low' | 'medium' | 'high' | 'critical';

interface ChangeRequestStatusBadgeProps {
  status: ChangeRequestStatus;
  className?: string;
}

interface ChangeRequestPriorityBadgeProps {
  priority: ChangeRequestPriority;
  className?: string;
}

const statusConfig: Record<
  ChangeRequestStatus,
  {
    label: string;
    className: string;
  }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  implemented: {
    label: 'Implemented',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
  },
};

const priorityConfig: Record<
  ChangeRequestPriority,
  {
    label: string;
    className: string;
  }
> = {
  low: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  medium: {
    label: 'Medium',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  high: {
    label: 'High',
    className: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
};

/**
 * ChangeRequestStatusBadge
 * 
 * Displays a colored badge for change request status with consistent styling.
 * 
 * @example
 * ```tsx
 * <ChangeRequestStatusBadge status="approved" />
 * <ChangeRequestStatusBadge status="under_review" className="text-xs" />
 * ```
 */
export const ChangeRequestStatusBadge: React.FC<ChangeRequestStatusBadgeProps> = ({
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

/**
 * ChangeRequestPriorityBadge
 * 
 * Displays a colored badge for change request priority with consistent styling.
 * 
 * @example
 * ```tsx
 * <ChangeRequestPriorityBadge priority="high" />
 * <ChangeRequestPriorityBadge priority="critical" className="text-xs" />
 * ```
 */
export const ChangeRequestPriorityBadge: React.FC<ChangeRequestPriorityBadgeProps> = ({
  priority,
  className,
}) => {
  const config = priorityConfig[priority] || {
    label: priority,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      aria-label={`Priority: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
};

