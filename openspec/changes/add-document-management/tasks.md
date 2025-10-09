# Document Management Implementation Tasks

## 1. Database Schema & Infrastructure
- [x] 1.1 Create `directories` table schema
- [x] 1.2 Create `documents` table schema with all metadata fields
- [x] 1.3 Create `document_versions` table schema
- [x] 1.4 Create `document_permissions` table schema
- [x] 1.5 Create `document_approvals` table schema
- [x] 1.6 Create `change_requests` table schema
- [x] 1.7 Create `change_request_comments` table schema
- [x] 1.8 Create `document_audit_log` table schema
- [x] 1.9 Add database indexes for performance (status, owner_id, next_review_date, etc.)
- [x] 1.10 Generate and test Drizzle migrations
- [x] 1.11 Add `DOCUMENT_STORAGE_PATH` to `.env.local.example`
- [x] 1.12 Create file storage initialization utility

## 2. Repository Layer
- [x] 2.1 Create `lib/db/repositories/directories.ts` with CRUD operations
- [x] 2.2 Implement recursive directory tree queries
- [x] 2.3 Create `lib/db/repositories/documents.ts` with CRUD operations
- [x] 2.4 Implement document version management functions
- [x] 2.5 Create `lib/db/repositories/document-permissions.ts`
- [x] 2.6 Create `lib/db/repositories/change-requests.ts`
- [x] 2.7 Implement audit log repository functions
- [x] 2.8 Add error handling and type safety to all repositories
- [x] 2.9 Create transaction wrapper utilities for multi-table operations

## 3. File Storage Service
- [x] 3.1 Create `lib/services/file-storage.ts` service
- [x] 3.2 Implement file upload with hash generation
- [x] 3.3 Implement file download/retrieval
- [x] 3.4 Implement file deletion with safety checks
- [x] 3.5 Add file validation (size limits, type checking)
- [x] 3.6 Create temp file cleanup utility
- [x] 3.7 Add file integrity verification functions
- [x] 3.8 Implement file path resolution and security checks

## 4. Permission & Authorization
- [x] 4.1 Extend `lib/auth/permissions.ts` with document permission types
- [x] 4.2 Implement `canViewDocument(user, document)` check
- [x] 4.3 Implement `canEditDocument(user, document)` check
- [x] 4.4 Implement `canApproveDocument(user, document)` check
- [x] 4.5 Implement `canDeleteDocument(user, document)` check
- [x] 4.6 Implement permission inheritance from directories
- [x] 4.7 Add permission caching for performance

## 5. Business Logic Services
- [ ] 5.1 Create `lib/modules/document-management/services/document-lifecycle.ts`
- [ ] 5.2 Implement document state machine transitions
- [ ] 5.3 Implement approval workflow logic
- [ ] 5.4 Create review scheduling service
- [ ] 5.5 Implement document version comparison utilities
- [ ] 5.6 Create change request workflow service
- [ ] 5.7 Implement audit logging service
- [ ] 5.8 Create metrics calculation service

## 6. UI Components - File Browser
- [ ] 6.1 Create `DirectoryTree` component with expand/collapse
- [ ] 6.2 Create `DirectoryBreadcrumb` component for navigation
- [ ] 6.3 Create `DocumentList` component with sorting/filtering
- [ ] 6.4 Create `DocumentListItem` component showing metadata
- [ ] 6.5 Create `CreateDirectoryDialog` component
- [ ] 6.6 Create `RenameDirectoryDialog` component
- [ ] 6.7 Create `DeleteDirectoryDialog` with safety checks
- [ ] 6.8 Add drag-and-drop support for file upload
- [ ] 6.9 Add keyboard navigation support

## 7. UI Components - Document Management
- [ ] 7.1 Create `DocumentUploadForm` component
- [ ] 7.2 Create `DocumentMetadataForm` component (category, owner, review frequency, etc.)
- [ ] 7.3 Create `DocumentDetailView` component
- [ ] 7.4 Create `DocumentVersionHistory` component
- [ ] 7.5 Create `DocumentViewer` component (for supported file types)
- [ ] 7.6 Create `DocumentDownloadButton` component
- [ ] 7.7 Create `DocumentStatusBadge` component
- [ ] 7.8 Create `DocumentPermissionsManager` component

## 8. UI Components - Approval Workflow
- [ ] 8.1 Create `ApprovalWorkflowCard` component showing current stage
- [ ] 8.2 Create `ApprovalActionButtons` component (approve/reject)
- [ ] 8.3 Create `ApprovalHistoryTimeline` component
- [ ] 8.4 Create `AssignReviewerDialog` component
- [ ] 8.5 Create `AssignApproverDialog` component
- [ ] 8.6 Create `ApprovalNotesDialog` component
- [ ] 8.7 Create pending approvals widget for dashboard

## 9. UI Components - Change Requests
- [ ] 9.1 Create `ChangeRequestForm` component
- [ ] 9.2 Create `ChangeRequestList` component
- [ ] 9.3 Create `ChangeRequestDetail` component
- [ ] 9.4 Create `ChangeRequestComments` component
- [ ] 9.5 Create `ChangeRequestStatusBadge` component
- [ ] 9.6 Create `ChangeRequestApprovalFlow` component
- [ ] 9.7 Add change request notification system

## 10. UI Components - Metrics & Reporting
- [ ] 10.1 Create `DocumentMetricsDashboard` component
- [ ] 10.2 Create `OverdueReviewWidget` component with drill-down
- [ ] 10.3 Create `DocumentStatusWidget` component (pie/bar chart)
- [ ] 10.4 Create `ChangeRequestMetricsWidget` component
- [ ] 10.5 Create `RecentActivityTimeline` component
- [ ] 10.6 Create `DocumentAuditLogViewer` component with filtering
- [ ] 10.7 Create `ComplianceReportExport` component
- [ ] 10.8 Add drill-down navigation from metrics to document lists

## 11. Module Integration
- [ ] 11.1 Create `lib/modules/document-management/index.ts` module definition
- [ ] 11.2 Create module icon component
- [ ] 11.3 Create dashboard widget for document management
- [ ] 11.4 Create main route component with file browser
- [ ] 11.5 Define navigation items (Documents, Change Requests, Metrics, Audit Log)
- [ ] 11.6 Implement module lifecycle hooks if needed
- [ ] 11.7 Register module in `lib/safety-framework/registry.ts`

## 12. API Routes (Server Actions)
- [ ] 12.1 Create `app/api/documents/upload/route.ts` for file uploads
- [ ] 12.2 Create `app/api/documents/[id]/download/route.ts` for downloads
- [ ] 12.3 Create server actions for document CRUD in module
- [ ] 12.4 Create server actions for directory operations
- [ ] 12.5 Create server actions for approval workflow
- [ ] 12.6 Create server actions for change requests
- [ ] 12.7 Add rate limiting and security headers
- [ ] 12.8 Implement file streaming for large documents

## 13. Search & Filtering
- [ ] 13.1 Implement document text search (title, description)
- [ ] 13.2 Add category filter
- [ ] 13.3 Add status filter
- [ ] 13.4 Add owner filter
- [ ] 13.5 Add date range filter (created, effective, next review)
- [ ] 13.6 Implement sort options (name, date, status, category)
- [ ] 13.7 Add saved filter presets

## 14. Notifications & Reminders
- [ ] 14.1 Create review reminder system (documents due for review)
- [ ] 14.2 Create approval pending notifications
- [ ] 14.3 Create change request notification system
- [ ] 14.4 Add in-app notification center
- [ ] 14.5 Create notification preferences UI
- [ ] 14.6 Add notification badge to module icon

## 15. Validation & Error Handling
- [ ] 15.1 Add Zod schemas for document metadata validation
- [ ] 15.2 Add file type validation
- [ ] 15.3 Add file size validation
- [ ] 15.4 Implement friendly error messages
- [ ] 15.5 Add loading states for all async operations
- [ ] 15.6 Create error boundaries for module
- [ ] 15.7 Add retry logic for failed file uploads

## 16. Testing
- [ ] 16.1 Write unit tests for repository layer
- [ ] 16.2 Write unit tests for permission checks
- [ ] 16.3 Write unit tests for state machine transitions
- [ ] 16.4 Write integration tests for file upload/download
- [ ] 16.5 Write integration tests for approval workflow
- [ ] 16.6 Test with large file sizes
- [ ] 16.7 Test with many documents (performance)
- [ ] 16.8 Test permission edge cases
- [ ] 16.9 Test concurrent operations

## 17. Documentation
- [ ] 17.1 Update module README with document management usage
- [ ] 17.2 Document ISO 9001 compliance features
- [ ] 17.3 Document ISO 45001 compliance features
- [ ] 17.4 Create admin guide for document management setup
- [ ] 17.5 Create user guide for document workflows
- [ ] 17.6 Document file storage configuration
- [ ] 17.7 Create compliance audit checklist

## 18. Accessibility & UX
- [ ] 18.1 Add ARIA labels to all interactive elements
- [ ] 18.2 Ensure keyboard navigation works throughout
- [ ] 18.3 Add focus indicators
- [ ] 18.4 Test with screen readers
- [ ] 18.5 Ensure responsive design on mobile/tablet
- [ ] 18.6 Add tooltips for complex features
- [ ] 18.7 Create onboarding tour for new users

## 19. Performance Optimization
- [ ] 19.1 Add pagination to document lists
- [ ] 19.2 Implement virtual scrolling for large directories
- [ ] 19.3 Add database indexes based on query patterns
- [ ] 19.4 Optimize image thumbnails for document previews
- [ ] 19.5 Implement lazy loading for directory tree
- [ ] 19.6 Add caching for frequently accessed documents
- [ ] 19.7 Profile and optimize slow queries

## 20. Security Hardening
- [ ] 20.1 Add path traversal protection in file storage
- [ ] 20.2 Validate and sanitize all file names
- [ ] 20.3 Add CSRF protection to file uploads
- [ ] 20.4 Implement virus scanning for uploads (optional)
- [ ] 20.5 Add audit logging for all sensitive operations
- [ ] 20.6 Encrypt sensitive document metadata
- [ ] 20.7 Add backup/restore procedures for document storage

