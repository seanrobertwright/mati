/**
 * Document Management UI Components
 * 
 * File browser and directory management components
 */

// Directory navigation
export { DirectoryTree } from './DirectoryTree';
export { DirectoryBreadcrumb } from './DirectoryBreadcrumb';

// Document list
export { DocumentList } from './DocumentList';
export { DocumentListItem } from './DocumentListItem';

// Directory dialogs
export { CreateDirectoryDialog } from './CreateDirectoryDialog';
export { RenameDirectoryDialog } from './RenameDirectoryDialog';
export { DeleteDirectoryDialog } from './DeleteDirectoryDialog';

// Document management components
export { DocumentUploadForm } from './DocumentUploadForm';
export { DocumentMetadataForm } from './DocumentMetadataForm';
export type { DocumentMetadata } from './DocumentMetadataForm';
export { DocumentDetailView } from './DocumentDetailView';
export type { Document } from './DocumentDetailView';
export { DocumentVersionHistory } from './DocumentVersionHistory';
export type { DocumentVersion } from './DocumentVersionHistory';
export { DocumentViewer } from './DocumentViewer';
export { DocumentDownloadButton } from './DocumentDownloadButton';
export { DocumentStatusBadge } from './DocumentStatusBadge';
export { DocumentPermissionsManager } from './DocumentPermissionsManager';
export type { DocumentPermission, DocumentPermissionRole } from './DocumentPermissionsManager';

// Approval workflow components
export { ApprovalWorkflowCard } from './ApprovalWorkflowCard';
export { ApprovalActionButtons } from './ApprovalActionButtons';
export { ApprovalHistoryTimeline } from './ApprovalHistoryTimeline';
export type { ApprovalHistoryEntry } from './ApprovalHistoryTimeline';
export { AssignReviewerDialog } from './AssignReviewerDialog';
export type { Reviewer } from './AssignReviewerDialog';
export { AssignApproverDialog } from './AssignApproverDialog';
export type { Approver } from './AssignApproverDialog';
export { ApprovalNotesDialog } from './ApprovalNotesDialog';
export { PendingApprovalsWidget } from './PendingApprovalsWidget';
export type { PendingApproval } from './PendingApprovalsWidget';

// Change request components
export { ChangeRequestForm } from './ChangeRequestForm';
export type { ChangeRequestData } from './ChangeRequestForm';
export { ChangeRequestList } from './ChangeRequestList';
export type { ChangeRequest } from './ChangeRequestList';
export { ChangeRequestDetail } from './ChangeRequestDetail';
export type { ChangeRequestDetailData } from './ChangeRequestDetail';
export { ChangeRequestComments } from './ChangeRequestComments';
export type { ChangeRequestComment } from './ChangeRequestComments';
export { ChangeRequestStatusBadge, ChangeRequestPriorityBadge } from './ChangeRequestStatusBadge';
export { ChangeRequestApprovalFlow } from './ChangeRequestApprovalFlow';
export type { ChangeRequestApproval } from './ChangeRequestApprovalFlow';
export { ChangeRequestNotificationCenter } from './ChangeRequestNotificationCenter';
export type { ChangeRequestNotification } from './ChangeRequestNotificationCenter';

// Metrics and reporting components
export { DocumentMetricsDashboard } from './DocumentMetricsDashboard';
export type { DocumentMetrics } from './DocumentMetricsDashboard';
export { OverdueReviewWidget } from './OverdueReviewWidget';
export type { OverdueDocument } from './OverdueReviewWidget';
export { DocumentStatusWidget } from './DocumentStatusWidget';
export type { DocumentStatusData } from './DocumentStatusWidget';
export { ChangeRequestMetricsWidget } from './ChangeRequestMetricsWidget';
export type { ChangeRequestMetrics } from './ChangeRequestMetricsWidget';
export { RecentActivityTimeline } from './RecentActivityTimeline';
export type { Activity, ActivityType } from './RecentActivityTimeline';
export { DocumentAuditLogViewer } from './DocumentAuditLogViewer';
export type { AuditLogEntry } from './DocumentAuditLogViewer';
export { ComplianceReportExport } from './ComplianceReportExport';
export type { ComplianceReportOptions, ReportType, ReportFormat } from './ComplianceReportExport';
export { MetricsDrillDown } from './MetricsDrillDown';
export type { DrillDownContext } from './MetricsDrillDown';

// Search and filtering components
export { DocumentFilterBar } from './DocumentFilterBar';
export type { DocumentFilters, FilterPreset, DocumentStatus, DocumentCategory } from './DocumentFilterBar';

// Notification components
export { NotificationCenter } from './NotificationCenter';
export type { Notification, NotificationType } from './NotificationCenter';
export { NotificationPreferences } from './NotificationPreferences';
export type { NotificationPreferencesData } from './NotificationPreferences';

// Error handling and loading components
export { DocumentErrorBoundary, withDocumentErrorBoundary } from './DocumentErrorBoundary';
export { FileUploadWithRetry } from './FileUploadWithRetry';
export { 
  LoadingSpinner, 
  DocumentListLoading, 
  DirectoryTreeLoading,
  LoadingMessage,
  EmptyState,
  Skeleton,
  CardSkeleton
} from './LoadingStates';

