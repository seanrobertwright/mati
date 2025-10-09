'use client';

import { format } from 'date-fns';
import { FileText, User, Calendar, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChangeRequestStatusBadge, ChangeRequestPriorityBadge } from './ChangeRequestStatusBadge';

export interface ChangeRequestDetailData {
  id: string;
  documentId: string;
  documentTitle: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedByName?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date | string;
  updatedAt: Date | string;
  implementedVersionId?: string;
}

interface ChangeRequestDetailProps {
  /** Change request data to display */
  changeRequest: ChangeRequestDetailData;
  /** Current user ID for permission checks */
  currentUserId?: string;
  /** Whether the current user can edit this change request */
  canEdit?: boolean;
  /** Whether the current user can delete this change request */
  canDelete?: boolean;
  /** Whether the current user can approve/reject */
  canApprove?: boolean;
  /** Callback when edit is clicked */
  onEdit?: () => void;
  /** Callback when delete is clicked */
  onDelete?: () => void;
  /** Callback when approve is clicked */
  onApprove?: () => void;
  /** Callback when reject is clicked */
  onReject?: () => void;
  /** Callback when view document is clicked */
  onViewDocument?: (documentId: string) => void;
  className?: string;
}

/**
 * ChangeRequestDetail
 * 
 * Displays detailed information about a change request including metadata,
 * status, priority, and available actions.
 * 
 * @example
 * ```tsx
 * <ChangeRequestDetail
 *   changeRequest={request}
 *   currentUserId="123"
 *   canEdit={true}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const ChangeRequestDetail: React.FC<ChangeRequestDetailProps> = ({
  changeRequest,
  currentUserId,
  canEdit = false,
  canDelete = false,
  canApprove = false,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onViewDocument,
  className,
}) => {
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
      return format(dateObj, 'PPP p');
    } catch {
      return 'Unknown date';
    }
  };

  const isOwner = currentUserId && changeRequest.requestedBy === currentUserId;
  const canShowActions = canEdit || canDelete || (canApprove && changeRequest.status === 'submitted');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Section */}
      <div className="space-y-4">
        {/* Title and Badges */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{changeRequest.title}</h1>
            <div className="flex gap-2 flex-shrink-0">
              <ChangeRequestStatusBadge status={changeRequest.status} />
              <ChangeRequestPriorityBadge priority={changeRequest.priority} />
            </div>
          </div>
        </div>

        {/* Related Document */}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">For document:</span>
          {onViewDocument ? (
            <button
              onClick={() => onViewDocument(changeRequest.documentId)}
              className="text-sm font-medium text-primary hover:underline focus:outline-none focus:underline"
            >
              {changeRequest.documentTitle}
            </button>
          ) : (
            <span className="text-sm font-medium">{changeRequest.documentTitle}</span>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
          {/* Requested By */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">Requested by</div>
              <div className="text-sm font-medium">
                {changeRequest.requestedByName || 'Unknown'}
                {isOwner && <span className="text-primary ml-1">(You)</span>}
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-sm font-medium">
                {formatDate(changeRequest.createdAt)}
              </div>
            </div>
          </div>

          {/* Updated Date */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">Last updated</div>
              <div className="text-sm font-medium">
                {formatDate(changeRequest.updatedAt)}
              </div>
            </div>
          </div>

          {/* Implementation Status */}
          {changeRequest.status === 'implemented' && changeRequest.implementedVersionId && (
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground">Implementation</div>
                <div className="text-sm font-medium text-green-600">
                  Completed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Description</h2>
        <div className="prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg border">
          <p className="whitespace-pre-wrap text-sm">{changeRequest.description}</p>
        </div>
      </div>

      {/* Actions Section */}
      {canShowActions && (
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {/* Edit and Delete (for owners in draft/submitted status) */}
          {canEdit && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          
          {canDelete && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}

          {/* Approve/Reject Actions */}
          {canApprove && changeRequest.status === 'submitted' && (
            <>
              {onApprove && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onApprove}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onReject}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

