## ADDED Requirements

### Requirement: Hierarchical Directory Structure
The system SHALL provide a hierarchical directory structure for organizing documents similar to a file manager interface.

#### Scenario: Create root directory
- **WHEN** a user with appropriate permissions creates a new directory at the root level
- **THEN** the system SHALL create the directory with null parent_id
- **AND** the directory SHALL appear in the directory tree

#### Scenario: Create subdirectory
- **WHEN** a user creates a directory within an existing directory
- **THEN** the system SHALL create the directory with parent_id set to the parent directory
- **AND** the subdirectory SHALL appear nested under the parent in the tree view

#### Scenario: Navigate directory tree
- **WHEN** a user clicks on a directory in the tree view
- **THEN** the system SHALL display all documents and subdirectories within that directory
- **AND** update the breadcrumb navigation to show the current path

#### Scenario: Move documents between directories
- **WHEN** a user drags a document to a different directory
- **THEN** the system SHALL update the document's directory_id
- **AND** verify the user has permission to modify the document
- **AND** log the move in the audit trail

#### Scenario: Delete directory with contents
- **WHEN** a user attempts to delete a directory containing documents or subdirectories
- **THEN** the system SHALL prompt for confirmation
- **AND** either recursively delete all contents or prevent deletion based on configuration

### Requirement: Document Upload and Storage
The system SHALL support uploading documents to local filesystem storage with metadata tracked in the database.

#### Scenario: Upload new document
- **WHEN** a user uploads a document file
- **THEN** the system SHALL store the file in the configured DOCUMENT_STORAGE_PATH
- **AND** generate a SHA-256 hash for integrity verification
- **AND** create a document record with metadata in the database
- **AND** set the user as the document owner
- **AND** set initial status to 'draft'

#### Scenario: Upload with metadata
- **WHEN** a user uploads a document and provides metadata (title, category, review frequency)
- **THEN** the system SHALL validate all metadata fields
- **AND** store the metadata in the documents table
- **AND** calculate next_review_date based on effective_date and review_frequency_days

#### Scenario: File validation
- **WHEN** a user uploads a file
- **THEN** the system SHALL validate file size against configured limits
- **AND** validate file type is allowed
- **AND** reject uploads that fail validation with clear error messages

#### Scenario: Duplicate file detection
- **WHEN** a file is uploaded with identical hash to existing version
- **THEN** the system SHALL notify the user of the duplicate
- **AND** optionally link to the existing document

### Requirement: Document Versioning
The system SHALL maintain complete version history for all documents with the ability to retrieve any historical version.

#### Scenario: Create new version
- **WHEN** a user uploads a new version of an existing document
- **THEN** the system SHALL create a new document_versions record
- **AND** increment the version_number
- **AND** store the new file separately on the filesystem
- **AND** update the document's current_version_id
- **AND** preserve all previous versions

#### Scenario: View version history
- **WHEN** a user views document details
- **THEN** the system SHALL display all versions with version number, date, uploaded by, and notes
- **AND** provide download links for each version

#### Scenario: Revert to previous version
- **WHEN** a user with appropriate permissions selects a previous version to restore
- **THEN** the system SHALL create a new version with the same content as the selected version
- **AND** increment the version number
- **AND** log the revert action in the audit trail

#### Scenario: Compare versions
- **WHEN** a user selects two versions to compare
- **THEN** the system SHALL display version metadata side-by-side
- **AND** highlight differences in metadata (title, notes, etc.)

### Requirement: Document Metadata Management
The system SHALL track comprehensive metadata for each document including category, dates, review frequency, and responsible person.

#### Scenario: Required metadata fields
- **WHEN** creating or editing a document
- **THEN** the system SHALL require: title, category, owner_id
- **AND** allow optional: description, effective_date, review_frequency_days

#### Scenario: Document categories
- **WHEN** a user selects a document category
- **THEN** the system SHALL provide predefined categories from the database
- **AND** allow administrators to manage the category list

#### Scenario: Review frequency tracking
- **WHEN** a document has review_frequency_days set
- **THEN** the system SHALL calculate next_review_date from effective_date or created_at
- **AND** update document status when next_review_date is past

#### Scenario: Effective date management
- **WHEN** a document is approved
- **THEN** the system SHALL allow setting or updating the effective_date
- **AND** use effective_date as the baseline for review scheduling

### Requirement: Multi-Stage Approval Workflow
The system SHALL implement a three-stage approval workflow: author, reviewer, approver with state tracking and audit trail.

#### Scenario: Submit for review
- **WHEN** a document owner submits a draft document for review
- **THEN** the system SHALL change status from 'draft' to 'pending_review'
- **AND** create notification for assigned reviewer
- **AND** log the state transition in audit trail

#### Scenario: Reviewer review
- **WHEN** an assigned reviewer reviews a document
- **THEN** the system SHALL allow the reviewer to approve or request changes
- **AND** if approved, change status to 'pending_approval'
- **AND** if changes requested, change status back to 'draft'
- **AND** create document_approvals record with reviewer decision and notes

#### Scenario: Approver approval
- **WHEN** an assigned approver reviews a document
- **THEN** the system SHALL allow the approver to approve or reject
- **AND** if approved, change status to 'approved' and set effective_date if not set
- **AND** if rejected, change status to 'draft'
- **AND** create document_approvals record with approver decision and notes

#### Scenario: Approval permissions
- **WHEN** checking if a user can approve a document
- **THEN** the system SHALL verify the user has 'reviewer' role for pending_review status
- **AND** verify the user has 'approver' role for pending_approval status
- **AND** prevent users from approving their own documents

#### Scenario: Approval history
- **WHEN** viewing document details
- **THEN** the system SHALL display complete approval history as a timeline
- **AND** show who approved, when, role, and any notes provided

### Requirement: Document Permission System
The system SHALL integrate with existing authentication while supporting document-specific roles: owner, approver, reviewer, viewer.

#### Scenario: Document owner permissions
- **WHEN** a user is the document owner
- **THEN** the user SHALL be able to edit metadata, upload new versions, delete the document
- **AND** assign reviewers and approvers
- **AND** view complete audit history

#### Scenario: Reviewer permissions
- **WHEN** a user has reviewer role on a document
- **THEN** the user SHALL be able to view the document and all versions
- **AND** add review comments
- **AND** approve or request changes during review stage

#### Scenario: Approver permissions
- **WHEN** a user has approver role on a document
- **THEN** the user SHALL be able to view the document and all versions
- **AND** approve or reject during approval stage
- **AND** provide approval notes

#### Scenario: Viewer permissions
- **WHEN** a user has viewer role on a document
- **THEN** the user SHALL be able to view the current approved version
- **AND** NOT be able to edit, approve, or view draft versions

#### Scenario: Permission inheritance
- **WHEN** a user has permissions on a directory
- **THEN** the user SHALL inherit those permissions for all documents in that directory
- **AND** document-specific permissions SHALL override directory permissions

#### Scenario: Admin override
- **WHEN** a user has system admin role
- **THEN** the user SHALL have full access to all documents regardless of document permissions

### Requirement: Change Request System
The system SHALL provide a formal change request process with discussion threads and approval routing.

#### Scenario: Create change request
- **WHEN** a user wants to propose changes to an approved document
- **THEN** the system SHALL allow creating a change request with title and description
- **AND** link the change request to one or more affected documents
- **AND** set initial status to 'draft'

#### Scenario: Submit change request
- **WHEN** a user submits a change request
- **THEN** the system SHALL change status to 'submitted'
- **AND** notify relevant stakeholders (document owners, approvers)
- **AND** allow adding supporting files or references

#### Scenario: Change request discussion
- **WHEN** stakeholders review a change request
- **THEN** the system SHALL provide a comment thread for discussion
- **AND** notify participants of new comments
- **AND** track all comments with timestamp and author

#### Scenario: Change request approval routing
- **WHEN** a change request requires approval
- **THEN** the system SHALL route to designated approvers based on document category or impact
- **AND** allow multiple approvers if configured
- **AND** track approval status for each approver

#### Scenario: Approve change request
- **WHEN** all required approvers approve a change request
- **THEN** the system SHALL change status to 'approved'
- **AND** allow document owner to implement changes
- **AND** link the new document version to the change request

#### Scenario: Reject change request
- **WHEN** any required approver rejects a change request
- **THEN** the system SHALL change status to 'rejected'
- **AND** require rejection notes
- **AND** notify the requestor

### Requirement: Review Scheduling and Overdue Tracking
The system SHALL automatically track document review schedules and identify overdue documents.

#### Scenario: Calculate next review date
- **WHEN** a document is approved or effective_date is set
- **THEN** the system SHALL calculate next_review_date as effective_date plus review_frequency_days
- **AND** store the calculated date in the documents table

#### Scenario: Identify overdue documents
- **WHEN** querying for overdue documents
- **THEN** the system SHALL return all approved documents where next_review_date is in the past
- **AND** include days overdue for each document

#### Scenario: Trigger review status
- **WHEN** a document's next_review_date passes
- **THEN** the system SHALL optionally change status to 'under_review'
- **AND** notify the document owner and assigned reviewers
- **AND** log the review trigger in audit trail

#### Scenario: Complete scheduled review
- **WHEN** a scheduled review is completed and document re-approved
- **THEN** the system SHALL recalculate next_review_date from the new effective_date
- **AND** reset status to 'approved'
- **AND** create new version if document was updated

### Requirement: Compliance Metrics Dashboard
The system SHALL provide metrics for ISO 9001 and ISO 45001 compliance with drill-down capabilities.

#### Scenario: Documents overdue for review metric
- **WHEN** viewing the metrics dashboard
- **THEN** the system SHALL display count and percentage of documents overdue for review
- **AND** break down by number of days overdue (1-7, 8-30, 31+)
- **AND** allow clicking to drill down to filtered document list

#### Scenario: Document status distribution
- **WHEN** viewing the metrics dashboard
- **THEN** the system SHALL display count of documents by status (draft, pending_review, pending_approval, approved, under_review, archived)
- **AND** visualize as pie chart or bar chart
- **AND** allow clicking a status to view documents with that status

#### Scenario: Change request metrics
- **WHEN** viewing the metrics dashboard
- **THEN** the system SHALL display count of open change requests
- **AND** display average time to approval for closed change requests
- **AND** show recent change request activity

#### Scenario: Recent activity timeline
- **WHEN** viewing the metrics dashboard
- **THEN** the system SHALL display recent document activity (uploads, approvals, reviews)
- **AND** limit to last 30 days by default
- **AND** allow filtering by activity type and date range

#### Scenario: Metric drill-down
- **WHEN** a user clicks on a metric (e.g., "5 documents overdue")
- **THEN** the system SHALL navigate to document list filtered by that criteria
- **AND** allow further filtering and sorting
- **AND** provide option to export the filtered list

#### Scenario: Compliance report export
- **WHEN** a user exports a compliance report
- **THEN** the system SHALL generate a report including all key metrics
- **AND** include document lists for overdue reviews
- **AND** export as PDF or CSV format

### Requirement: Document Audit Trail
The system SHALL maintain a complete audit trail of all document operations for compliance and traceability.

#### Scenario: Log document creation
- **WHEN** a new document is created
- **THEN** the system SHALL log the action with document_id, user_id, timestamp, and 'created' action type

#### Scenario: Log version uploads
- **WHEN** a new version is uploaded
- **THEN** the system SHALL log with version details and file hash

#### Scenario: Log status changes
- **WHEN** a document status changes
- **THEN** the system SHALL log the old status, new status, and user who made the change

#### Scenario: Log permission changes
- **WHEN** document permissions are modified
- **THEN** the system SHALL log who was granted/revoked what role by whom

#### Scenario: Log downloads
- **WHEN** a user downloads a document
- **THEN** the system SHALL log the download with document_id, version, and user_id

#### Scenario: View audit log
- **WHEN** viewing a document's audit log
- **THEN** the system SHALL display all logged actions in chronological order
- **AND** show user, timestamp, action type, and details
- **AND** allow filtering by action type, date range, or user

#### Scenario: Search audit log
- **WHEN** searching the global audit log
- **THEN** the system SHALL allow filtering by document, user, action type, and date range
- **AND** support exporting filtered results

### Requirement: Document Search and Filtering
The system SHALL provide comprehensive search and filtering capabilities for finding documents.

#### Scenario: Text search
- **WHEN** a user enters search text
- **THEN** the system SHALL search document title and description fields
- **AND** return matching documents ranked by relevance
- **AND** highlight matching terms in results

#### Scenario: Filter by category
- **WHEN** a user selects a category filter
- **THEN** the system SHALL display only documents in that category
- **AND** update the document count

#### Scenario: Filter by status
- **WHEN** a user selects status filters (can be multiple)
- **THEN** the system SHALL display documents matching any selected status
- **AND** persist filter selection in session

#### Scenario: Filter by owner
- **WHEN** a user selects an owner filter
- **THEN** the system SHALL display documents owned by that user
- **AND** provide autocomplete for user selection

#### Scenario: Filter by date range
- **WHEN** a user specifies a date range (created, effective, or next review)
- **THEN** the system SHALL filter documents with dates in that range
- **AND** validate date range inputs

#### Scenario: Combined filters
- **WHEN** multiple filters are applied
- **THEN** the system SHALL apply all filters with AND logic
- **AND** show count of results matching filters
- **AND** allow clearing all filters at once

#### Scenario: Sort results
- **WHEN** viewing filtered documents
- **THEN** the system SHALL allow sorting by title, created date, effective date, next review date, status, category
- **AND** support ascending and descending order
- **AND** persist sort preference

### Requirement: Document Download and Viewing
The system SHALL provide secure document download and viewing capabilities with permission checks.

#### Scenario: Download current version
- **WHEN** a user with view permission clicks download
- **THEN** the system SHALL verify permissions
- **AND** stream the file from local storage
- **AND** set appropriate content-type and content-disposition headers
- **AND** log the download in audit trail

#### Scenario: Download specific version
- **WHEN** a user downloads a historical version
- **THEN** the system SHALL verify the user has permission to view history
- **AND** retrieve the correct version from storage
- **AND** include version number in filename

#### Scenario: In-browser preview
- **WHEN** a document is a supported file type (PDF, images, text)
- **THEN** the system SHALL optionally display preview in browser
- **AND** fall back to download for unsupported types

#### Scenario: Permission denied
- **WHEN** a user without permission attempts to download
- **THEN** the system SHALL return 403 Forbidden
- **AND** log the attempted unauthorized access
- **AND** NOT reveal whether the document exists

### Requirement: File Storage Management
The system SHALL manage local filesystem storage securely with integrity verification.

#### Scenario: Storage path configuration
- **WHEN** the application starts
- **THEN** the system SHALL read DOCUMENT_STORAGE_PATH from environment variables
- **AND** verify the path exists and is writable
- **AND** create necessary subdirectories if missing

#### Scenario: File integrity verification
- **WHEN** retrieving a document file
- **THEN** the system SHALL verify the file hash matches the stored hash
- **AND** alert administrators if hash mismatch detected
- **AND** log integrity failures

#### Scenario: Orphaned file detection
- **WHEN** running maintenance tasks
- **THEN** the system SHALL identify files in storage without database records
- **AND** identify database records without corresponding files
- **AND** provide reconciliation options

#### Scenario: Secure file paths
- **WHEN** constructing file paths
- **THEN** the system SHALL sanitize all input to prevent path traversal
- **AND** use UUIDs or hashes in filenames to prevent guessing
- **AND** validate all paths are within DOCUMENT_STORAGE_PATH

### Requirement: Notifications and Reminders
The system SHALL notify users of important document events and upcoming reviews.

#### Scenario: Review due notification
- **WHEN** a document review is due within configured threshold (e.g., 7 days)
- **THEN** the system SHALL create in-app notification for document owner
- **AND** optionally send email reminder
- **AND** escalate if overdue by more than threshold

#### Scenario: Approval pending notification
- **WHEN** a document is submitted for review or approval
- **THEN** the system SHALL notify assigned reviewer or approver
- **AND** include document details and link to review

#### Scenario: Change request notification
- **WHEN** a change request is created or commented on
- **THEN** the system SHALL notify affected document owners and stakeholders
- **AND** include change request summary and link

#### Scenario: Notification center
- **WHEN** a user views notifications
- **THEN** the system SHALL display all unread notifications
- **AND** allow marking as read
- **AND** show notification count badge on module icon

#### Scenario: Notification preferences
- **WHEN** a user configures notification preferences
- **THEN** the system SHALL allow enabling/disabling each notification type
- **AND** allow choosing in-app, email, or both
- **AND** respect user preferences when sending notifications

### Requirement: Module Integration
The system SHALL integrate with the existing safety framework as a self-contained module.

#### Scenario: Module registration
- **WHEN** the application builds
- **THEN** the document management module SHALL be discovered and registered
- **AND** appear in the dashboard navigation
- **AND** provide a dashboard widget showing key metrics

#### Scenario: Dashboard widget
- **WHEN** viewing the dashboard home
- **THEN** the document management widget SHALL display summary metrics
- **AND** show count of documents pending approval
- **AND** show count of documents overdue for review
- **AND** provide quick link to document management module

#### Scenario: Navigation items
- **WHEN** the document management module is active
- **THEN** the sidebar SHALL display navigation items: Documents, Change Requests, Metrics, Audit Log
- **AND** highlight the current active page

#### Scenario: Module isolation
- **WHEN** implementing the document management module
- **THEN** the module SHALL only import from framework public API, shared components, and standard libraries
- **AND** NOT directly import from other modules
- **AND** maintain independence for future extensibility

