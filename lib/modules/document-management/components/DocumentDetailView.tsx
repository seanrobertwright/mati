'use client';

import { useState } from 'react';
import {
  FileText,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { DocumentDownloadButton } from './DocumentDownloadButton';
import { DocumentVersionHistory, type DocumentVersion } from './DocumentVersionHistory';
import { DocumentViewer } from './DocumentViewer';
import { DocumentPermissionsManager, type DocumentPermission } from './DocumentPermissionsManager';
import { DocumentMetadataForm, type DocumentMetadata } from './DocumentMetadataForm';

export interface Document {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  directoryId?: string;
  currentVersionId?: string;
  ownerId: string;
  ownerName?: string;
  status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'under_review' | 'archived';
  effectiveDate?: Date | string | null;
  reviewFrequencyDays?: number;
  nextReviewDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  currentVersion?: {
    id: string;
    versionNumber: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
}

interface DocumentDetailViewProps {
  document: Document;
  versions?: DocumentVersion[];
  permissions?: DocumentPermission[];
  currentUserId: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canManagePermissions?: boolean;
  canSubmitForReview?: boolean;
  canApprove?: boolean;
  onEdit?: (metadata: DocumentMetadata) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onSubmitForReview?: () => void | Promise<void>;
  onApprove?: (notes: string) => void | Promise<void>;
  onReject?: (notes: string) => void | Promise<void>;
  onRevert?: (versionId: string) => void | Promise<void>;
  onAddPermission?: (userId: string, role: any) => void | Promise<void>;
  onRemovePermission?: (permissionId: string) => void | Promise<void>;
  onUpdatePermission?: (permissionId: string, role: any) => void | Promise<void>;
  className?: string;
}

/**
 * DocumentDetailView
 * 
 * Comprehensive view of a document showing all metadata, versions, permissions, and preview.
 * Includes actions for editing, approval workflow, and permission management.
 * 
 * @example
 * ```tsx
 * <DocumentDetailView
 *   document={document}
 *   versions={versions}
 *   permissions={permissions}
 *   currentUserId={user.id}
 *   canEdit={true}
 *   canManagePermissions={true}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  versions = [],
  permissions = [],
  currentUserId,
  canEdit = false,
  canDelete = false,
  canManagePermissions = false,
  canSubmitForReview = false,
  canApprove = false,
  onEdit,
  onDelete,
  onSubmitForReview,
  onApprove,
  onReject,
  onRevert,
  onAddPermission,
  onRemovePermission,
  onUpdatePermission,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'permissions'>('preview');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (date: Date | string | null | undefined): boolean => {
    if (!date) return false;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
  };

  const handleEdit = async (metadata: DocumentMetadata) => {
    if (!onEdit) return;
    await onEdit(metadata);
    setShowEditDialog(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const reviewDueStatus = isOverdue(document.nextReviewDate);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold mb-2">{document.title}</h1>
            {document.description && (
              <p className="text-muted-foreground mb-3">{document.description}</p>
            )}

            {/* Status and metadata badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <DocumentStatusBadge status={document.status} />

              {document.categoryName && (
                <Badge variant="outline" className="text-xs">
                  {document.categoryName}
                </Badge>
              )}

              {reviewDueStatus && (
                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Review Overdue
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {document.currentVersion && (
            <DocumentDownloadButton
              documentId={document.id}
              fileName={document.currentVersion.fileName}
              variant="outline"
            />
          )}

          {canEdit && onEdit && (
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}

          {canSubmitForReview && onSubmitForReview && document.status === 'draft' && (
            <Button onClick={onSubmitForReview}>
              <Send className="h-4 w-4" />
              Submit for Review
            </Button>
          )}

          {canDelete && onDelete && (
            <Button
              variant="destructive"
              size="default"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Owner
          </p>
          <p className="text-sm font-medium">
            {document.ownerName || `User ${document.ownerId}`}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Effective Date
          </p>
          <p className="text-sm font-medium">{formatDate(document.effectiveDate)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Review Frequency
          </p>
          <p className="text-sm font-medium">
            {document.reviewFrequencyDays
              ? `Every ${document.reviewFrequencyDays} days`
              : 'Not set'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Next Review
          </p>
          <p
            className={cn(
              'text-sm font-medium',
              reviewDueStatus && 'text-destructive'
            )}
          >
            {formatDate(document.nextReviewDate)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm">{formatDateTime(document.createdAt)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Last Modified</p>
          <p className="text-sm">{formatDateTime(document.updatedAt)}</p>
        </div>

        {document.currentVersion && (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current Version</p>
              <p className="text-sm font-medium">
                v{document.currentVersion.versionNumber}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">File Name</p>
              <p className="text-sm truncate">{document.currentVersion.fileName}</p>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'preview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'versions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('versions')}
          >
            Version History ({versions.length})
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'permissions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions ({permissions.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'preview' && document.currentVersion && (
          <DocumentViewer
            documentId={document.id}
            versionId={document.currentVersionId}
            fileName={document.currentVersion.fileName}
            mimeType={document.currentVersion.mimeType}
            fileSize={document.currentVersion.fileSize}
            autoLoad
          />
        )}

        {activeTab === 'versions' && (
          <DocumentVersionHistory
            documentId={document.id}
            versions={versions}
            currentVersionId={document.currentVersionId}
            canRevert={canEdit}
            onRevert={onRevert}
          />
        )}

        {activeTab === 'permissions' && (
          <DocumentPermissionsManager
            documentId={document.id}
            permissions={permissions}
            currentUserId={currentUserId}
            canManagePermissions={canManagePermissions}
            onAddPermission={onAddPermission}
            onRemovePermission={onRemovePermission}
            onUpdatePermission={onUpdatePermission}
          />
        )}
      </div>

      {/* Edit Dialog */}
      {onEdit && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
              <DialogDescription>
                Update document metadata and properties
              </DialogDescription>
            </DialogHeader>

            <DocumentMetadataForm
              initialData={{
                title: document.title,
                description: document.description,
                categoryId: document.categoryId,
                effectiveDate: document.effectiveDate
                  ? typeof document.effectiveDate === 'string'
                    ? document.effectiveDate.split('T')[0]
                    : document.effectiveDate.toISOString().split('T')[0]
                  : undefined,
                reviewFrequencyDays: document.reviewFrequencyDays,
              }}
              onSubmit={handleEdit}
              onCancel={() => setShowEditDialog(false)}
              submitLabel="Save Changes"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{document.title}"? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Document'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

