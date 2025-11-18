# data-access-layer Specification

## Purpose
TBD - created by archiving change add-supabase-database-integration. Update Purpose after archive.
## Requirements
### Requirement: Repository Pattern Implementation
The system SHALL implement a repository pattern to encapsulate database operations and separate data access from business logic.

#### Scenario: Centralized data access
- **WHEN** components need to access incident data
- **THEN** they SHALL use repository functions from `lib/db/repositories/incidents.ts`
- **AND** no direct database queries SHALL exist outside the repository layer

#### Scenario: Reusable operations
- **WHEN** multiple components need the same data operation
- **THEN** they SHALL share a single repository function
- **AND** code duplication SHALL be avoided

### Requirement: CRUD Operations for Incidents
The system SHALL provide Create, Read, Update, and Delete operations for incident reports.

#### Scenario: Create incident
- **WHEN** a new incident is submitted
- **THEN** the repository SHALL insert the incident into the database
- **AND** return the created incident with generated ID and timestamps

#### Scenario: Read all incidents
- **WHEN** the incident list is requested
- **THEN** the repository SHALL fetch all incidents from the database
- **AND** return them ordered by most recent first

#### Scenario: Read single incident
- **WHEN** a specific incident is requested by ID
- **THEN** the repository SHALL fetch the incident from the database
- **AND** return the incident or null if not found

#### Scenario: Update incident
- **WHEN** an incident is modified
- **THEN** the repository SHALL update the database record
- **AND** update the `updated_at` timestamp
- **AND** return the updated incident

#### Scenario: Delete incident
- **WHEN** an incident is deleted
- **THEN** the repository SHALL remove the record from the database
- **AND** return confirmation of deletion

### Requirement: Type Safety in Data Access
The system SHALL provide full TypeScript type safety for all database operations.

#### Scenario: Inferred types from schema
- **WHEN** repository functions are used
- **THEN** TypeScript SHALL infer types directly from the Drizzle schema
- **AND** no manual type definitions SHALL be required for database models

#### Scenario: Type-safe function signatures
- **WHEN** calling repository functions
- **THEN** parameters SHALL be fully typed
- **AND** return values SHALL have complete type information
- **AND** IDE autocomplete SHALL provide accurate suggestions

### Requirement: Error Handling in Data Access
The system SHALL handle database errors gracefully and provide meaningful error information.

#### Scenario: Database query failure
- **WHEN** a database query fails
- **THEN** the repository SHALL catch the error
- **AND** log technical details to the server console
- **AND** throw a user-friendly error message

#### Scenario: Not found errors
- **WHEN** a requested incident does not exist
- **THEN** the repository SHALL return null for single record queries
- **AND** NOT throw an exception

#### Scenario: Validation errors
- **WHEN** invalid data is provided to a repository function
- **THEN** the repository SHALL throw a validation error
- **AND** the error message SHALL indicate which fields are invalid

### Requirement: Async Data Fetching Pattern
The system SHALL use React Server Components for asynchronous database queries.

#### Scenario: Server component data fetching
- **WHEN** a React Server Component needs incident data
- **THEN** it SHALL call repository functions directly with async/await
- **AND** the data SHALL be fetched server-side before rendering

#### Scenario: Client component interaction
- **WHEN** client-side interactivity is needed
- **THEN** data SHALL be fetched in a Server Component parent
- **AND** passed as props to Client Components marked with 'use client'

#### Scenario: Loading states
- **WHEN** data is being fetched from the database
- **THEN** Next.js loading.tsx files SHALL provide loading UI
- **AND** the user SHALL see a loading indicator

### Requirement: Database Transaction Support
The system SHALL support database transactions for operations that require atomicity.

#### Scenario: Transaction execution
- **WHEN** multiple related database operations are performed
- **THEN** the repository SHALL wrap them in a transaction
- **AND** all operations SHALL commit together or rollback together

#### Scenario: Transaction rollback
- **WHEN** any operation in a transaction fails
- **THEN** all changes SHALL be rolled back
- **AND** the database SHALL remain in a consistent state

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

