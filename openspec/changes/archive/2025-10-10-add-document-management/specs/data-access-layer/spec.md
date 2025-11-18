## ADDED Requirements

### Requirement: Document Repository Operations
The system SHALL provide repository functions for document CRUD operations following the established repository pattern.

#### Scenario: Create document with metadata
- **WHEN** creating a new document through the repository
- **THEN** the repository SHALL insert the document with all metadata into the database
- **AND** return the created document with generated ID and timestamps
- **AND** validate required fields before insertion

#### Scenario: Query documents by directory
- **WHEN** fetching documents for a specific directory
- **THEN** the repository SHALL return all documents in that directory
- **AND** include current version information
- **AND** order by created_at descending by default

#### Scenario: Query documents by status
- **WHEN** fetching documents by status (e.g., 'pending_approval', 'overdue')
- **THEN** the repository SHALL return matching documents
- **AND** support multiple status filters
- **AND** include owner and version metadata

#### Scenario: Update document metadata
- **WHEN** updating document metadata through the repository
- **THEN** the repository SHALL update the specified fields
- **AND** automatically update the updated_at timestamp
- **AND** validate metadata constraints

#### Scenario: Delete document with cascade
- **WHEN** deleting a document
- **THEN** the repository SHALL remove the document record
- **AND** optionally cascade delete versions, permissions, and audit records based on configuration
- **AND** return confirmation

### Requirement: Directory Repository Operations
The system SHALL provide repository functions for hierarchical directory management.

#### Scenario: Create directory
- **WHEN** creating a new directory
- **THEN** the repository SHALL insert with name and parent_id
- **AND** validate parent directory exists if parent_id is not null
- **AND** return created directory with ID

#### Scenario: Get directory tree
- **WHEN** fetching a directory tree from a root
- **THEN** the repository SHALL use recursive CTE to fetch all descendants
- **AND** return hierarchical structure
- **AND** include subdirectory counts

#### Scenario: Move directory
- **WHEN** updating a directory's parent_id
- **THEN** the repository SHALL validate no circular references are created
- **AND** update the parent_id
- **AND** log the move operation

### Requirement: Document Version Repository Operations
The system SHALL provide repository functions for managing document versions.

#### Scenario: Create new version
- **WHEN** creating a new document version
- **THEN** the repository SHALL insert version record with incremented version_number
- **AND** link to document_id
- **AND** store file_path, file_hash, and file_size
- **AND** return the created version

#### Scenario: Get version history
- **WHEN** fetching all versions for a document
- **THEN** the repository SHALL return versions ordered by version_number descending
- **AND** include uploader information
- **AND** include creation timestamps

#### Scenario: Get specific version
- **WHEN** fetching a specific version by ID
- **THEN** the repository SHALL return the complete version record
- **AND** include file metadata for retrieval

### Requirement: Document Permission Repository Operations
The system SHALL provide repository functions for managing document permissions.

#### Scenario: Grant permission
- **WHEN** granting a permission to a user
- **THEN** the repository SHALL insert permission record with document_id, user_id, and role
- **AND** validate role is one of: 'owner', 'approver', 'reviewer', 'viewer'
- **AND** record who granted the permission and when

#### Scenario: Check user permissions
- **WHEN** checking if a user has a specific permission on a document
- **THEN** the repository SHALL query both document-level and directory-level permissions
- **AND** return the highest permission level
- **AND** consider system admin as having all permissions

#### Scenario: Revoke permission
- **WHEN** revoking a user's permission
- **THEN** the repository SHALL delete the permission record
- **AND** log the revocation in audit trail

#### Scenario: List document permissions
- **WHEN** fetching all permissions for a document
- **THEN** the repository SHALL return all users with permissions
- **AND** include role, granted_by, and granted_at
- **AND** order by role hierarchy

### Requirement: Change Request Repository Operations
The system SHALL provide repository functions for change request management.

#### Scenario: Create change request
- **WHEN** creating a new change request
- **THEN** the repository SHALL insert request with title, description, and document_id
- **AND** set requested_by to current user
- **AND** set initial status to 'draft'
- **AND** return created change request

#### Scenario: Add change request comment
- **WHEN** adding a comment to a change request
- **THEN** the repository SHALL insert comment with change_request_id, user_id, and comment text
- **AND** return created comment with timestamp

#### Scenario: Query change requests by status
- **WHEN** fetching change requests by status
- **THEN** the repository SHALL return matching change requests
- **AND** include document title and requestor information
- **AND** include comment count for each request

#### Scenario: Update change request status
- **WHEN** updating change request status
- **THEN** the repository SHALL validate status transition is allowed
- **AND** update the status and updated_at
- **AND** log the status change

### Requirement: Audit Log Repository Operations
The system SHALL provide repository functions for audit trail tracking.

#### Scenario: Log document action
- **WHEN** logging a document action
- **THEN** the repository SHALL insert audit record with document_id, user_id, action, details, and timestamp
- **AND** return confirmation

#### Scenario: Query audit log for document
- **WHEN** fetching audit log for a specific document
- **THEN** the repository SHALL return all log entries for that document
- **AND** include user information
- **AND** order by timestamp descending

#### Scenario: Query audit log globally
- **WHEN** fetching audit log with filters
- **THEN** the repository SHALL support filtering by document_id, user_id, action type, and date range
- **AND** paginate results for performance
- **AND** return entries with complete context

#### Scenario: Search audit log
- **WHEN** searching audit log by keyword
- **THEN** the repository SHALL search in action and details fields
- **AND** return matching entries with highlighting

### Requirement: Transaction Support for Document Operations
The system SHALL support database transactions for complex document operations requiring atomicity.

#### Scenario: Document upload transaction
- **WHEN** uploading a new document version
- **THEN** the repository SHALL wrap document update, version insert, and audit log insert in a transaction
- **AND** commit all changes together or rollback on any failure

#### Scenario: Approval workflow transaction
- **WHEN** approving a document
- **THEN** the repository SHALL wrap status update, approval record insert, and audit log insert in a transaction
- **AND** ensure consistency across all tables

#### Scenario: Permission change transaction
- **WHEN** modifying document permissions
- **THEN** the repository SHALL wrap permission updates and audit logging in a transaction
- **AND** rollback if any operation fails

### Requirement: Type Safety for Document Data Access
The system SHALL provide full TypeScript type safety for all document repository operations.

#### Scenario: Inferred types from document schema
- **WHEN** using document repository functions
- **THEN** TypeScript SHALL infer types from Drizzle schema definitions
- **AND** provide autocomplete for all document fields
- **AND** enforce type safety at compile time

#### Scenario: Repository function signatures
- **WHEN** calling repository functions
- **THEN** parameters SHALL be fully typed with proper interfaces
- **AND** return values SHALL have complete type information
- **AND** enums SHALL be type-safe (status, role, category)

